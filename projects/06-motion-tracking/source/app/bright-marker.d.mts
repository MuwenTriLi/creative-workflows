export type MarkerFrame = { width: number; height: number; data: Uint8ClampedArray | Uint8Array };
export type MarkerState = { point: { x: number; y: number }; area: number; seedArea: number; threshold: number; vx: number; vy: number; misses: number; confidence: number };
export function seedBrightMarker(frame: MarkerFrame, point: { x: number; y: number }): MarkerState | null;
export function stepBrightMarker(frame: MarkerFrame, state: MarkerState, dtFrames?: number): MarkerState;
