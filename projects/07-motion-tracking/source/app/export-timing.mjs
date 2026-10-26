/** Every output frame has an explicit timestamp; the final sample ends at the source boundary. */
export function exportFramePlan(seconds, fps = 60) {
  if (!Number.isFinite(seconds) || seconds <= 0 || !Number.isInteger(fps) || fps < 1 || fps > 120) throw new Error('Invalid export duration or frame rate.');
  const end = Math.round(seconds * 1e6);
  const count = Math.max(1, Math.ceil(seconds * fps - 1e-8));
  return Array.from({ length: count }, (_, index) => {
    const timestamp = Math.round(index / fps * 1e6);
    return { index, timestamp, duration: Math.min(end, Math.round((index + 1) / fps * 1e6)) - timestamp };
  });
}
