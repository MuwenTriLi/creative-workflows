import { Muxer, ArrayBufferTarget } from './vendor/mp4-muxer.min.mjs';
import { exportFramePlan } from './export-timing.mjs';

export async function seekExportFrame(video, seconds) {
  if (Math.abs(video.currentTime - seconds) < 0.00001 && video.readyState >= 2) return;
  await new Promise((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); video.removeEventListener('seeked', done); video.removeEventListener('error', fail); };
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error('Source video could not decode the requested frame.')); };
    const timer = setTimeout(fail, 15000);
    video.addEventListener('seeked', done, { once: true });
    video.addEventListener('error', fail, { once: true });
    video.currentTime = seconds;
  });
}

/** Offline frame timestamps, independent of playback speed and display refresh. */
export async function encodeTrackingMp4({ video, canvas, duration, fps, bitrate, render, progress, cancelled, includeAudio }) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) throw new Error('Frame-accurate MP4 export needs WebCodecs. Use a recent desktop Chrome or Edge.');
  const plan = exportFramePlan(duration, fps);
  const config = { codec: 'avc1.640034', width: canvas.width, height: canvas.height, bitrate, framerate: fps, latencyMode: 'quality', avc: { format: 'avc' } };
  if (!(await VideoEncoder.isConfigSupported(config)).supported) throw new Error('This encoder cannot export the selected resolution. Try FHD or another desktop browser.');
  let audioBuffer = null;
  let audioConfig;
  if (includeAudio) {
    if (!globalThis.AudioEncoder || !globalThis.AudioData) throw new Error('AAC encoding is unavailable. Turn off source audio or use another browser.');
    const audioContext = new AudioContext({ sampleRate: 48000 });
    try { audioBuffer = await audioContext.decodeAudioData(await (await fetch(video.currentSrc || video.src)).arrayBuffer()); }
    catch { throw new Error('Source audio could not be decoded. Turn off source audio for a silent export.'); }
    finally { await audioContext.close(); }
    audioConfig = { codec: 'mp4a.40.2', sampleRate: audioBuffer.sampleRate, numberOfChannels: Math.min(2, audioBuffer.numberOfChannels), bitrate: 192000 };
    if (!(await AudioEncoder.isConfigSupported(audioConfig)).supported) throw new Error('AAC is unavailable for this source. Turn off source audio or use another browser.');
  }
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: 'avc', width: canvas.width, height: canvas.height }, ...(audioBuffer ? { audio: { codec: 'aac', sampleRate: audioConfig.sampleRate, numberOfChannels: audioConfig.numberOfChannels } } : {}), fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
  let failure;
  const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: error => { failure = error; } });
  let audioEncoder;
  const check = () => { if (cancelled()) throw new DOMException('Export cancelled', 'AbortError'); if (failure) throw failure; };
  try {
    encoder.configure(config);
    for (const frame of plan) {
      check();
      await seekExportFrame(video, frame.timestamp / 1e6);
      check();
      await render(frame.index);
      const image = new VideoFrame(canvas, { timestamp: frame.timestamp, duration: frame.duration });
      try { encoder.encode(image, { keyFrame: frame.index % (fps * 2) === 0 }); } finally { image.close(); }
      // Bound GPU/encoder pressure; never drop a frame to catch up with wall time.
      if (encoder.encodeQueueSize >= 6) await encoder.flush();
      progress((frame.index + 1) / plan.length * (audioBuffer ? 90 : 99));
    }
    await encoder.flush();
    check();
    if (audioBuffer) {
      audioEncoder = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: error => { failure = error; } });
      audioEncoder.configure(audioConfig);
      const samples = Math.min(audioBuffer.length, Math.round(duration * audioConfig.sampleRate));
      for (let start = 0; start < samples; start += 1024) {
        check();
        const count = Math.min(1024, samples - start);
        const data = new Float32Array(count * audioConfig.numberOfChannels);
        for (let channel = 0; channel < audioConfig.numberOfChannels; channel++) data.set(audioBuffer.getChannelData(channel).subarray(start, start + count), channel * count);
        const packet = new AudioData({ format: 'f32-planar', sampleRate: audioConfig.sampleRate, numberOfFrames: count, numberOfChannels: audioConfig.numberOfChannels, timestamp: Math.round(start / audioConfig.sampleRate * 1e6), data });
        try { audioEncoder.encode(packet); } finally { packet.close(); }
        if (audioEncoder.encodeQueueSize >= 12) await audioEncoder.flush();
      }
      await audioEncoder.flush();
      check();
    }
    muxer.finalize();
    return new Blob([target.buffer], { type: 'video/mp4' });
  } finally {
    if (encoder.state !== 'closed') encoder.close();
    if (audioEncoder && audioEncoder.state !== 'closed') audioEncoder.close();
  }
}
