// A bounded tracker for an explicitly selected bright, neutral marker.
// The ordinary template tracker remains the fallback for other subjects.
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function components(frame, center, radius, threshold) {
  const { width, height, data } = frame;
  const x0 = Math.max(0, Math.floor(center.x - radius));
  const y0 = Math.max(0, Math.floor(center.y - radius));
  const x1 = Math.min(width - 1, Math.ceil(center.x + radius));
  const y1 = Math.min(height - 1, Math.ceil(center.y + radius));
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const mask = new Uint8Array(w * h), queue = new Int32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y + y0) * width + x + x0) * 4;
    const lo = Math.min(data[i], data[i + 1], data[i + 2]);
    const hi = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lo >= threshold && hi - lo < 48) mask[y * w + x] = 1;
  }
  const found = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start]) continue;
    let head = 0, tail = 1, sx = 0, sy = 0, sw = 0, peak = 0, minX = w, minY = h, maxX = 0, maxY = 0;
    queue[0] = start; mask[start] = 0;
    while (head < tail) {
      const p = queue[head++], x = p % w, y = Math.floor(p / w);
      const sourceIndex = ((y+y0)*width+x+x0)*4;
      peak = Math.max(peak, Math.min(data[sourceIndex],data[sourceIndex+1],data[sourceIndex+2]));
      const weight = (Math.min(data[sourceIndex],data[sourceIndex+1],data[sourceIndex+2])-threshold+1)**2;
      sx += (x+x0)*weight; sy += (y+y0)*weight; sw += weight;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      for (const q of [x ? p - 1 : -1, x + 1 < w ? p + 1 : -1, y ? p - w : -1, y + 1 < h ? p + w : -1]) {
        if (q >= 0 && mask[q]) { mask[q] = 0; queue[tail++] = q; }
      }
    }
    if (tail >= 3) found.push({ x: sx / sw, y: sy / sw, area: tail, peak,
      width: maxX - minX + 1, height: maxY - minY + 1,
      fill: tail / ((maxX-minX+1)*(maxY-minY+1)),
      clipped: minX === 0 || minY === 0 || maxX === w - 1 || maxY === h - 1 });
  }
  return found;
}

export function seedBrightMarker(frame, point) {
  let peak = 0;
  for (let y = Math.max(0, Math.floor(point.y - 12)); y <= Math.min(frame.height - 1, point.y + 12); y++) {
    for (let x = Math.max(0, Math.floor(point.x - 12)); x <= Math.min(frame.width - 1, point.x + 12); x++) {
      const i = (y * frame.width + x) * 4;
      peak = Math.max(peak, Math.min(frame.data[i], frame.data[i + 1], frame.data[i + 2]));
    }
  }
  if (peak < 205) return null;
  const threshold = clamp(peak * 0.78, 45, 210);
  const candidates = components(frame, point, 44, threshold).filter(c =>
    !c.clipped && c.area <= 2000 && Math.hypot(c.x - point.x, c.y - point.y) <= 18);
  candidates.sort((a,b) => Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
  if (!candidates.length) return null;
  const c = candidates[0];
  return { point: { x:c.x,y:c.y }, area:c.area, seedArea:c.area, threshold, vx:0, vy:0, misses:0, confidence:0.99 };
}

export function stepBrightMarker(frame, state, dtFrames = 1) {
  const dt = clamp(Number.isFinite(dtFrames) ? dtFrames : 1, 0.5, 60);
  // Background tabs may skip display callbacks. Expand the local search using
  // elapsed media time, but limit extrapolation so a stale velocity cannot run away.
  const predictDt = Math.min(dt, 6);
  const predicted = { x:clamp(state.point.x + state.vx * predictDt, 0,frame.width-1), y:clamp(state.point.y + state.vy * predictDt,0,frame.height-1) };
  const radius = Math.min(450, 56 + Math.hypot(state.vx,state.vy)*dt*2 + Math.max(0,dt-3)*12 + state.misses*9);
  const candidates = [state.threshold, state.threshold+(255-state.threshold)*0.45, state.threshold+(255-state.threshold)*0.75]
    .flatMap(threshold=>components(frame,predicted,radius,threshold)).filter(c => !c.clipped && c.fill>=0.18 &&
    c.area >= Math.max(3,state.area*0.16) && c.area <= Math.max(18,state.area*4) &&
    Math.max(c.width/c.height,c.height/c.width)<4);
  for (const c of candidates) {
    c.score = Math.hypot(c.x-predicted.x,c.y-predicted.y) + 8*Math.abs(Math.log(c.area/state.area));
  }
  candidates.sort((a,b)=>a.score-b.score);
  const best=candidates[0];
  if (!best || best.score > radius*0.88) {
    // Hold the last accepted point; never drift indefinitely or jump to a distant white object.
    return {...state,vx:state.vx*.5,vy:state.vy*.5,misses:state.misses+1,confidence:Math.max(0.03,state.confidence*.7)};
  }
  const vx=(best.x-state.point.x)/dt, vy=(best.y-state.point.y)/dt;
  return {...state,point:{x:best.x,y:best.y},area:state.area*.35+best.area*.65,
    threshold:clamp(state.threshold*.65+best.peak*.78*.35,45,210),
    vx:state.vx*.35+vx*.65,vy:state.vy*.35+vy*.65,misses:0,
    confidence:clamp(Math.exp(-best.score/80),0.36,0.995)};
}
