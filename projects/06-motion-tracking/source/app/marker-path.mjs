import { stepBrightMarker } from './bright-marker.mjs';
import { seekExportFrame } from './export-mp4.mjs';

export function sampleMarkerPath(path, time) {
  if (!path?.samples.length || time + 1e-6 < path.start) return null;
  const index = Math.min(path.samples.length - 1, Math.max(0, Math.floor((time-path.start)*path.fps+1e-5)));
  return { ...path.samples[index], trail:path.samples.slice(Math.max(0,index-71),index+1).map(s=>s.point) };
}

// Analyze once from the explicit selection. Playback, seeking and export read
// this same path; display refresh rate cannot change the accepted trajectory.
export async function prepareMarkerPath({src, width, height, start, duration, seed, signal, progress}) {
  const video = document.createElement('video'); video.muted = true; video.preload = 'auto';
  const canvas = document.createElement('canvas'); canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx) throw Error('Tracking analysis canvas is unavailable.');
  const fps=24, samples=[];
  try {
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('Could not load the tracking clip.')),15000);
      video.onloadedmetadata=()=>{clearTimeout(timer);resolve();};
      video.onerror=()=>{clearTimeout(timer);reject(Error('Could not decode the tracking clip.'));};
      video.src=src;video.load();
    });
    let state=structuredClone(seed);
    const count=Math.max(1,Math.ceil((duration-start)*fps-1e-6));
    for(let index=0;index<count;index++) {
      if(signal.aborted) throw new DOMException('Tracking cancelled.','AbortError');
      await seekExportFrame(video,Math.min(duration-.0001,start+index/fps));
      const scale=Math.min(width/video.videoWidth,height/video.videoHeight);
      const vw=video.videoWidth*scale,vh=video.videoHeight*scale;
      ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.drawImage(video,(width-vw)/2,(height-vh)/2,vw,vh);
      if(index) state=stepBrightMarker(ctx.getImageData(0,0,width,height),state,30/fps);
      samples.push({point:{...state.point},confidence:state.confidence,misses:state.misses});
      progress((index+1)/count*100);
    }
    return {start,fps,samples};
  } finally {video.pause();video.removeAttribute('src');video.load();}
}
