import test from 'node:test';
import assert from 'node:assert/strict';
import { seedBrightMarker, stepBrightMarker } from '../app/bright-marker.mjs';

function frame(markers = []) {
  const width = 320, height = 180, data = new Uint8ClampedArray(width * height * 4);
  for (const { x, y, size = 9, value = 255, diamond = false } of markers) {
    for (let dy = -size; dy <= size; dy++) for (let dx = -size; dx <= size; dx++) {
      if (diamond && Math.abs(dx) + Math.abs(dy) > size) continue;
      const i = ((y + dy) * width + x + dx) * 4;
      data[i] = data[i+1] = data[i+2] = value; data[i+3] = 255;
    }
  }
  return { width, height, data };
}

test('requires a bright marker near the explicit selection', () => {
  assert.equal(seedBrightMarker(frame([{ x: 240, y: 90 }]), { x: 80, y: 90 }), null);
  assert.equal(seedBrightMarker(frame([{ x: 80, y: 90, value: 150 }]), { x: 80, y: 90 }), null);
});

test('follows a translating marker through rotation and brightness changes', () => {
  let state = seedBrightMarker(frame([{ x: 60, y: 70 }]), { x: 60, y: 70 });
  for (let n = 1; n <= 25; n++) {
    const target = { x: 60+n*4, y: 70+n*2, diamond: n%2 === 1, value: 225+n%20 };
    state = stepBrightMarker(frame([target, { x: 280, y: 30, size: 18 }]), state);
    assert.ok(Math.hypot(state.point.x-target.x, state.point.y-target.y) < 1);
    assert.equal(state.misses, 0);
  }
});

test('holds its last point during occlusion instead of jumping to a distant light', () => {
  let state = seedBrightMarker(frame([{ x: 60, y: 70 }]), { x: 60, y: 70 });
  state = stepBrightMarker(frame([{ x: 65, y: 72 }]), state);
  const last = { ...state.point };
  for (let n = 0; n < 6; n++) state = stepBrightMarker(frame([{ x: 280, y: 150 }]), state);
  assert.deepEqual(state.point, last);
  assert.equal(state.misses, 6);
  state = stepBrightMarker(frame([{ x: 72, y: 74 }]), state);
  assert.equal(state.misses, 0);
  assert.ok(Math.hypot(state.point.x-72,state.point.y-74) < 1);
});

test('uses elapsed video time to recover a skipped display callback', () => {
  const state = seedBrightMarker(frame([{ x: 60, y: 70 }]), { x: 60, y: 70 });
  const next = stepBrightMarker(frame([{ x: 200, y: 90 }]), state, 30);
  assert.equal(next.misses, 0);
  assert.ok(Math.hypot(next.point.x-200,next.point.y-90) < 1);
});
