export function seekExportFrame(video: HTMLVideoElement, seconds: number): Promise<void>;
export function encodeTrackingMp4(options: {
  video: HTMLVideoElement; canvas: HTMLCanvasElement; duration: number; fps: number; bitrate: number;
  render: (index: number) => void | Promise<void>; progress: (percent: number) => void;
  cancelled: () => boolean; includeAudio: boolean;
}): Promise<Blob>;
