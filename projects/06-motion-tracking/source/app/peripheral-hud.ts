type Point = { x: number; y: number };
export type HudStyle = "open-data" | "calibration" | "code-array";
export const HUD_PRESETS = [
  { id: "open-data" as const, name: "Signal Lock", code: "01", description: "Corner locator · quiet telemetry", animation: "focus-lock" as const, locator: 0.8, panel: 0.85 },
  { id: "calibration" as const, name: "Vector Scope", code: "02", description: "Circular reticle · coordinate scope", animation: "scan-gate" as const, locator: 0.85, panel: 0.9 },
  { id: "code-array" as const, name: "Data Grid", code: "03", description: "Technical brackets · editable readout", animation: "signal-pulse" as const, locator: 0.75, panel: 0.9 },
];

// The live canvas and MP4 encoder call this exact renderer at source media time.
// Readouts use measured image coordinates and time, not invented sensor data.
export function drawPeripheralHud(ctx: CanvasRenderingContext2D, point: Point, trail: Point[], options: {
  style: HudStyle; accent: string; timeMs: number; opacity: number; progress: number;
  lost: boolean; width: number; height: number;
}, scale = 1) {
  const { width: w, height: h } = options;
  const alpha = options.opacity * Math.min(1, Math.max(0, options.progress));
  if (alpha <= 0) return;
  const preset = HUD_PRESETS.find(p => p.id === options.style)!;
  const nx = Math.min(1,Math.max(0,point.x / w));
  const ny = Math.min(1,Math.max(0,point.y / h));
  const time = options.timeMs / 1000;
  const pad = 25, width = w < 600 ? 145 : 170;
  ctx.save(); ctx.scale(scale,scale);
  ctx.globalAlpha = alpha; ctx.strokeStyle = options.accent; ctx.fillStyle = options.accent;
  ctx.lineWidth = .65; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  const text = (s: string,x:number,y:number,size=8,opacity=1) => {
    ctx.globalAlpha=alpha*opacity;ctx.fillStyle=options.accent;ctx.font=`${size>=11?'600':'400'} ${size}px "Cascadia Mono", monospace`;ctx.fillText(s,x,y);
  };
  const line = (x:number,y:number,x2:number,y2:number,opacity=.4) => {
    ctx.globalAlpha=alpha*opacity;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
  };
  // Readable edge furniture leaves the center of the shot open.
  text(`TRACK / ${preset.code}`,pad,pad,9,.8);
  text(preset.name.toUpperCase(),pad,pad+15,11);
  line(pad,pad+34,pad+width,pad+34);
  text(options.lost ? 'TARGET / REACQUIRE' : 'TARGET / ACTIVE',pad,pad+42,8,.65);
  const right=w-pad-width;
  text('MEDIA TIME',right,pad,8,.65);
  text(`${String(Math.floor(time/60)).padStart(2,'0')}:${(time%60).toFixed(2).padStart(5,'0')}`,right,pad+15,15);
  text('IMAGE COORDINATES',right,pad+38,7,.55);
  text(`X ${(nx*100).toFixed(2).padStart(6,'0')}%  Y ${(ny*100).toFixed(2).padStart(6,'0')}%`,right,pad+51,8,.85);
  // Moving ticks are tied to the selected point, rather than a random counter.
  for (let i=0;i<=12;i++) {
    const yy=90+(h-180)*i/12;
    line(w-pad,yy,w-pad-(i%3===0?9:4),yy,.3);
  }
  ctx.globalAlpha=alpha*.85;ctx.fillRect(w-pad-12,90+(h-180)*ny-1,12,2);
  const by=h-pad-67;
  text(options.style==='calibration'?'XY / MOTION SCOPE':'PATH / RECENT SAMPLES',pad,by-14,7,.6);
  if (options.style==='calibration') {
    line(pad,by+26,pad+width,by+26,.25);line(pad+width/2,by,pad+width/2,by+52,.25);
    ctx.globalAlpha=alpha*.6;ctx.beginPath();
    trail.forEach((p,i)=>{const xx=pad+p.x/w*width,yy=by+p.y/h*52;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.stroke();
    ctx.globalAlpha=alpha;ctx.strokeRect(pad+nx*width-2,by+ny*52-2,4,4);
  } else {
    for(let row=0;row<2;row++) {
      const baseline=by+row*27;
      line(pad,baseline+22,pad+width,baseline+22,.2);
      ctx.globalAlpha=alpha*(row===0?.75:.4);ctx.beginPath();
      trail.forEach((p,i)=>{const xx=pad+i/Math.max(1,trail.length-1)*width,yy=baseline+22-(row===0?p.x/w:p.y/h)*22;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.stroke();
    }
  }
  text('X / Y   NORMALIZED',pad,h-pad-8,7,.5);
  text(options.style==='code-array'?'READOUT / LIVE':'POSITION / LIVE',right,h-pad-52,8,.6);
  text(`${Math.round(point.x).toString().padStart(4,'0')} : ${Math.round(point.y).toString().padStart(4,'0')}`,right,h-pad-36,16,.9);
  text(`${w} × ${h} ANALYSIS SPACE`,right,h-pad-14,7,.5);
  line(right,h-pad-4,right+width,h-pad-4,.2);
  line(right,h-pad-4,right+width*nx,h-pad-4,.8);
  ctx.restore();
}
