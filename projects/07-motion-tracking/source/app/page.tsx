"use client";

import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { encodeTrackingMp4, seekExportFrame } from "./export-mp4.mjs";

type Point = { x: number; y: number };
type TrackerSample = {
  dx: number;
  dy: number;
  y: number;
  relativeY: number;
  chromaRG: number;
  chromaYB: number;
  gradientX: number;
  gradientY: number;
};
type TrackerStats = { meanR: number; meanG: number; meanB: number; meanY: number };
type MatchResult = { point: Point; score: number };
type HudStyle = "open-data" | "calibration" | "code-array";
type LocatorAnimation = "focus-lock" | "scan-gate" | "signal-pulse";
type ExportQuality = "maximum" | "balanced";
type OutputAspect = "16:9" | "9:16";
type PlacementMode = "track" | "pin";
type InspectorTab = "target" | "timing" | "design" | "export";
type DrawRect = { x: number; y: number; width: number; height: number };
type HudRenderOptions = {
  accent: string;
  anchorPoint?: Point;
  codeLines: string[];
  confidence: number;
  largeText: boolean;
  locatorAnimation: LocatorAnimation;
  locatorProgress: number;
  locatorScale: number;
  lostFrames: number;
  panelScale: number;
  panelProgress: number;
  staticPlacement: boolean;
  style: HudStyle;
  timeMs: number;
  title: string;
};

const ANALYSIS_WIDTH = 960;
const ANALYSIS_HEIGHT = 540;
const ANALYSIS_SIZES: Record<OutputAspect, { width: number; height: number }> = {
  "16:9": { width: 960, height: 540 },
  "9:16": { width: 540, height: 960 },
};
const TRACKER_MARGIN = 22;
const EXPORT_FRAME_RATE = 60;
const TIMELINE_FRAME_RATE = 30;
const DEFAULT_HUD_COLOR = "#ffffff";
const STATIC_LOCATOR_SCALE = 0.65;
const STATIC_PANEL_SCALE = 0.7;
const DEFAULT_HUD_TITLE = "TARGET MOTION / TRK_01";
const DEFAULT_CODE_LINES = [
  "TRACK_X = {x}px;",
  "TRACK_Y = {y}px;",
  "CONFIDENCE = {confidence}%;",
  "STATE = {state};",
];
const EXPORT_SIZES: Record<OutputAspect, { value: string; label: string }[]> = {
  "16:9": [
    { value: "3840x2160", label: "4K · 3840 × 2160" },
    { value: "2560x1440", label: "QHD · 2560 × 1440" },
    { value: "1920x1080", label: "FHD · 1920 × 1080" },
  ],
  "9:16": [
    { value: "2160x3840", label: "4K portrait · 2160 × 3840" },
    { value: "1440x2560", label: "QHD portrait · 1440 × 2560" },
    { value: "1080x1920", label: "FHD portrait · 1080 × 1920" },
  ],
};

const getExportVideoBitrate = (width: number, height: number, quality: ExportQuality) => {
  const longEdge = Math.max(width, height);
  if (quality === "balanced") {
    return longEdge >= 3840 ? 82_000_000 : longEdge >= 2560 ? 50_000_000 : 28_000_000;
  }
  return longEdge >= 3840 ? 140_000_000 : longEdge >= 2560 ? 90_000_000 : 55_000_000;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const getStaticAnchorPoint = (width: number, height: number): Point => ({
  x: Math.round(width * 0.5),
  y: Math.round(height - Math.min(width, height) * 0.1),
});

const pixelAt = (frame: ImageData, x: number, y: number) => {
  const px = clamp(Math.round(x), 0, frame.width - 1);
  const py = clamp(Math.round(y), 0, frame.height - 1);
  const index = (py * frame.width + px) * 4;
  const r = frame.data[index];
  const g = frame.data[index + 1];
  const b = frame.data[index + 2];
  return { r, g, b, y: r * 0.299 + g * 0.587 + b * 0.114 };
};

const buildTemplate = (frame: ImageData, center: Point) => {
  const samples: TrackerSample[] = [];
  let meanR = 0;
  let meanG = 0;
  let meanB = 0;
  let meanY = 0;

  for (let dy = -16; dy <= 16; dy += 4) {
    for (let dx = -16; dx <= 16; dx += 4) {
      const pixel = pixelAt(frame, center.x + dx, center.y + dy);
      const left = pixelAt(frame, center.x + dx - 2, center.y + dy);
      const right = pixelAt(frame, center.x + dx + 2, center.y + dy);
      const top = pixelAt(frame, center.x + dx, center.y + dy - 2);
      const bottom = pixelAt(frame, center.x + dx, center.y + dy + 2);
      meanR += pixel.r;
      meanG += pixel.g;
      meanB += pixel.b;
      meanY += pixel.y;
      samples.push({
        dx,
        dy,
        y: pixel.y,
        relativeY: 0,
        chromaRG: pixel.r - pixel.g,
        chromaYB: (pixel.r + pixel.g) * 0.5 - pixel.b,
        gradientX: right.y - left.y,
        gradientY: bottom.y - top.y,
      });
    }
  }

  const count = samples.length;
  const stats = {
    meanR: meanR / count,
    meanG: meanG / count,
    meanB: meanB / count,
    meanY: meanY / count,
  };
  samples.forEach((sample) => {
    sample.relativeY = sample.y - stats.meanY;
  });
  return { samples, stats };
};

const scoreCandidate = (
  frame: ImageData,
  center: Point,
  template: TrackerSample[],
  stats: TrackerStats,
) => {
  let meanR = 0;
  let meanG = 0;
  let meanB = 0;
  let meanY = 0;

  for (const sample of template) {
    const pixel = pixelAt(frame, center.x + sample.dx, center.y + sample.dy);
    meanR += pixel.r;
    meanG += pixel.g;
    meanB += pixel.b;
    meanY += pixel.y;
  }

  const count = template.length;
  meanR /= count;
  meanG /= count;
  meanB /= count;
  meanY /= count;
  let score = 0;

  for (const sample of template) {
    const x = center.x + sample.dx;
    const y = center.y + sample.dy;
    const pixel = pixelAt(frame, x, y);
    const left = pixelAt(frame, x - 2, y);
    const right = pixelAt(frame, x + 2, y);
    const top = pixelAt(frame, x, y - 2);
    const bottom = pixelAt(frame, x, y + 2);
    const relativeY = pixel.y - meanY;
    const dY = relativeY - sample.relativeY;
    const dRG = pixel.r - pixel.g - sample.chromaRG;
    const dYB = (pixel.r + pixel.g) * 0.5 - pixel.b - sample.chromaYB;
    const dGX = right.y - left.y - sample.gradientX;
    const dGY = bottom.y - top.y - sample.gradientY;
    score += dY * dY * 1.35;
    score += (dRG * dRG + dYB * dYB) * 0.14;
    score += (dGX * dGX + dGY * dGY) * 0.5;
  }

  const meanColorDelta =
    (meanR - stats.meanR) ** 2 +
    (meanG - stats.meanG) ** 2 +
    (meanB - stats.meanB) ** 2;
  return score / count + meanColorDelta * 0.2;
};

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) return "00:00.00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  const frames = Math.floor((value % 1) * 30);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(frames).padStart(2, "0")}`;
};

const easeInOut = (value: number) => {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - progress * 2);
};

const getPanelProgress = (time: number, revealTime: number, transition: number) =>
  easeInOut((time - revealTime) / Math.max(0.2, transition));

const getLocatorProgress = (time: number, revealTime: number) =>
  easeInOut((time - revealTime) / 0.72);

const cloneTrackerSamples = (samples: TrackerSample[]) =>
  samples.map((sample) => ({ ...sample }));

const offsetHudPoint = (
  point: Point,
  enabled: boolean,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
) =>
  enabled
    ? {
        x: clamp(point.x + offsetX, 48, width - 48),
        y: clamp(point.y + offsetY, 48, height - 48),
      }
    : point;

const getContainedRect = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): DrawRect => {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
};

const drawContainedVideo = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  fillColor = "#000000",
) => {
  const rect = getContainedRect(video.videoWidth, video.videoHeight, width, height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );
  return rect;
};

const sampleVideoEdgeColor = (video: HTMLVideoElement) => {
  try {
    const sampleSize = 64;
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return "#000000";

    sampleCtx.drawImage(video, 0, 0, sampleSize, sampleSize);
    const frame = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
    const edgeWidth = 7;
    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

    for (let y = 0; y < sampleSize; y += 1) {
      for (let x = 0; x < sampleSize; x += 1) {
        if (
          x >= edgeWidth &&
          x < sampleSize - edgeWidth &&
          y >= edgeWidth &&
          y < sampleSize - edgeWidth
        ) {
          continue;
        }
        const index = (y * sampleSize + x) * 4;
        if (frame.data[index + 3] < 220) continue;
        const r = frame.data[index];
        const g = frame.data[index + 1];
        const b = frame.data[index + 2];
        const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`;
        const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
        bucket.count += 1;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        buckets.set(key, bucket);
      }
    }

    const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
    if (!dominant?.count) return "#000000";
    return `rgb(${Math.round(dominant.r / dominant.count)}, ${Math.round(dominant.g / dominant.count)}, ${Math.round(dominant.b / dominant.count)})`;
  } catch {
    return "#000000";
  }
};

const resolveHudText = (
  template: string,
  point: Point,
  confidence: number,
  status: string,
  timeMs: number,
) =>
  template
    .replaceAll("{x}", String(Math.round(point.x * 4)).padStart(4, "0"))
    .replaceAll("{y}", String(Math.round(point.y * 4)).padStart(4, "0"))
    .replaceAll("{confidence}", (confidence * 100).toFixed(1))
    .replaceAll("{state}", status)
    .replaceAll("{time}", (timeMs / 1000).toFixed(2));

const fitCanvasText = (
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
) => {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
};

const drawTrackingHud = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  trail: Point[],
  options: HudRenderOptions,
  scaleX = 1,
  scaleY = 1,
  translateX = 0,
  translateY = 0,
) => {
  const mapX = (value: number) => value * scaleX + translateX;
  const mapY = (value: number) => value * scaleY + translateY;
  const x = mapX(point.x);
  const y = mapY(point.y);
  const unit = Math.min(scaleX, scaleY);
  const locatorUnit = unit * options.locatorScale;
  const panelUnit = unit * options.panelScale;
  const box = 78 * locatorUnit;
  const half = box / 2;
  const corner = 16 * locatorUnit;
  const accent = options.accent;
  const status = options.staticPlacement
    ? "PINNED"
    : options.lostFrames > 2
      ? "REACQUIRE"
      : "LOCKED";
  const hudPulse = 0.5 + Math.sin(options.timeMs / 210) * 0.5;
  const textScale = options.largeText ? 1.18 : 1;
  const panelWidth = (options.style === "code-array" ? 208 : 184) * panelUnit * textScale;
  const panelHeight = (options.style === "code-array" ? 116 : 96) * panelUnit * textScale;
  const requestedPanelX = x + half + 14 * panelUnit;
  const preferredPanelX =
    requestedPanelX + panelWidth < ctx.canvas.width - 8 * panelUnit
      ? requestedPanelX
      : x - half - panelWidth - 14 * panelUnit;
  const panelX = clamp(
    preferredPanelX,
    8 * panelUnit,
    Math.max(8 * panelUnit, ctx.canvas.width - panelWidth - 8 * panelUnit),
  );
  const panelY = clamp(
    y - panelHeight / 2,
    8 * panelUnit,
    ctx.canvas.height - panelHeight - 8 * panelUnit,
  );
  const panelOnRight = panelX > x;
  const locatorReveal = clamp(options.locatorProgress, 0, 1);
  if (locatorReveal <= 0) return;

  ctx.save();
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  if (locatorReveal > 0.52 && options.anchorPoint) {
    const anchorX = mapX(options.anchorPoint.x);
    const anchorY = mapY(options.anchorPoint.y);
    if (Math.hypot(anchorX - x, anchorY - y) > 2 * locatorUnit) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = Math.max(0.6, 0.72 * locatorUnit);
      ctx.setLineDash([2 * locatorUnit, 5 * locatorUnit]);
      ctx.lineDashOffset = -((options.timeMs * 0.014) % (7 * locatorUnit));
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = 0.56;
      ctx.strokeRect(
        anchorX - 3.5 * locatorUnit,
        anchorY - 3.5 * locatorUnit,
        7 * locatorUnit,
        7 * locatorUnit,
      );
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.78;
      ctx.beginPath();
      ctx.moveTo(anchorX - 7 * locatorUnit, anchorY);
      ctx.lineTo(anchorX - 4 * locatorUnit, anchorY);
      ctx.moveTo(anchorX + 4 * locatorUnit, anchorY);
      ctx.lineTo(anchorX + 7 * locatorUnit, anchorY);
      ctx.moveTo(anchorX, anchorY - 7 * locatorUnit);
      ctx.lineTo(anchorX, anchorY - 4 * locatorUnit);
      ctx.moveTo(anchorX, anchorY + 4 * locatorUnit);
      ctx.lineTo(anchorX, anchorY + 7 * locatorUnit);
      ctx.stroke();
    }
  }

  if (locatorReveal > 0.68 && trail.length > 1) {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = Math.max(0.7, 0.85 * locatorUnit);
    ctx.setLineDash([2.5 * locatorUnit, 5.5 * locatorUnit]);
    ctx.lineDashOffset = -((options.timeMs * 0.018) % (8 * locatorUnit));
    ctx.beginPath();
    const first = trail[0];
    ctx.moveTo(mapX(first.x), mapY(first.y));
    for (let index = 1; index < trail.length - 1; index += 1) {
      const current = trail[index];
      const next = trail[index + 1];
      const midpointX = mapX((current.x + next.x) / 2);
      const midpointY = mapY((current.y + next.y) / 2);
      ctx.quadraticCurveTo(mapX(current.x), mapY(current.y), midpointX, midpointY);
    }
    const last = trail[trail.length - 1];
    ctx.lineTo(mapX(last.x), mapY(last.y));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 1;
  }

  ctx.save();
  if (options.locatorAnimation === "focus-lock") {
    const focusScale = 1 + (1 - locatorReveal) * 0.58;
    ctx.translate(x, y);
    ctx.scale(focusScale, focusScale);
    ctx.translate(-x, -y);
  } else if (options.locatorAnimation === "scan-gate") {
    const scanWidth = (box + 24 * locatorUnit) * locatorReveal;
    ctx.beginPath();
    ctx.rect(
      x - half - 12 * locatorUnit,
      y - half - 12 * locatorUnit,
      scanWidth,
      box + 24 * locatorUnit,
    );
    ctx.clip();
  } else {
    const pulseScale =
      0.86 +
      locatorReveal * 0.14 +
      Math.sin(locatorReveal * Math.PI * 3) * (1 - locatorReveal) * 0.16;
    ctx.translate(x, y);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-x, -y);
  }

  const drawSquareCorners = (color: string, alpha: number, short = false) => {
    const length = short ? corner * 0.56 : corner;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(0.75, 1.05 * locatorUnit);
    ctx.beginPath();
    ctx.moveTo(x - half, y - half + length);
    ctx.lineTo(x - half, y - half);
    ctx.lineTo(x - half + length, y - half);
    ctx.moveTo(x + half - length, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(x + half, y - half + length);
    ctx.moveTo(x + half, y + half - length);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x + half - length, y + half);
    ctx.moveTo(x - half + length, y + half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x - half, y + half - length);
    ctx.stroke();
  };

  if (options.style === "open-data") {
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = Math.max(0.65, 0.75 * locatorUnit);
    ctx.setLineDash([2 * locatorUnit, 6 * locatorUnit]);
    ctx.lineDashOffset = -((options.timeMs * 0.014) % (8 * locatorUnit));
    ctx.strokeRect(
      x - half + 7 * locatorUnit,
      y - half + 7 * locatorUnit,
      box - 14 * locatorUnit,
      box - 14 * locatorUnit,
    );
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    drawSquareCorners("#fff", 0.82);
    drawSquareCorners(accent, 0.76 + hudPulse * 0.2, true);
  } else if (options.style === "calibration") {
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = Math.max(0.6, 0.7 * locatorUnit);
    ctx.strokeRect(
      x - half + 4 * locatorUnit,
      y - half + 4 * locatorUnit,
      box - 8 * locatorUnit,
      box - 8 * locatorUnit,
    );
    drawSquareCorners("#fff", 0.88);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.58 + hudPulse * 0.18;
    ctx.setLineDash([1.5 * locatorUnit, 4 * locatorUnit]);
    ctx.lineDashOffset = -((options.timeMs * 0.012) % (5.5 * locatorUnit));
    ctx.strokeRect(
      x - half - 5 * locatorUnit,
      y - half - 5 * locatorUnit,
      box + 10 * locatorUnit,
      box + 10 * locatorUnit,
    );
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  } else {
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = Math.max(0.6, 0.75 * locatorUnit);
    ctx.setLineDash([4 * locatorUnit, 4 * locatorUnit]);
    ctx.lineDashOffset = -((options.timeMs * 0.016) % (8 * locatorUnit));
    ctx.strokeRect(
      x - half + 5 * locatorUnit,
      y - half + 5 * locatorUnit,
      box - 10 * locatorUnit,
      box - 10 * locatorUnit,
    );
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    drawSquareCorners("#fff", 0.7);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.76 + hudPulse * 0.19;
    ctx.beginPath();
    ctx.moveTo(x - half, y - half + corner * 0.48);
    ctx.lineTo(x - half, y - half);
    ctx.lineTo(x - half + corner * 0.48, y - half);
    ctx.moveTo(x + half, y + half - corner * 0.48);
    ctx.lineTo(x + half, y + half);
    ctx.lineTo(x + half - corner * 0.48, y + half);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,.52)";
  ctx.lineWidth = Math.max(0.6, 0.7 * locatorUnit);
  ctx.beginPath();
  ctx.moveTo(x - 10 * locatorUnit, y);
  ctx.lineTo(x - 4 * locatorUnit, y);
  ctx.moveTo(x + 4 * locatorUnit, y);
  ctx.lineTo(x + 10 * locatorUnit, y);
  ctx.moveTo(x, y - 10 * locatorUnit);
  ctx.lineTo(x, y - 4 * locatorUnit);
  ctx.moveTo(x, y + 4 * locatorUnit);
  ctx.lineTo(x, y + 10 * locatorUnit);
  ctx.stroke();

  if (options.style !== "open-data") {
    const tick = 4 * locatorUnit;
    ctx.strokeStyle = options.style === "calibration" ? accent : "#fff";
    ctx.globalAlpha = options.style === "calibration" ? 0.78 : 0.42;
    ctx.beginPath();
    for (let index = -3; index <= 3; index += 1) {
      const offset = index * 9 * locatorUnit;
      ctx.moveTo(x + offset, y - half);
      ctx.lineTo(x + offset, y - half + tick);
      ctx.moveTo(x - half, y + offset);
      ctx.lineTo(x - half + tick, y + offset);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = accent;
  const centerPointSize = (2.7 + hudPulse * 0.8) * locatorUnit;
  ctx.fillRect(
    x - centerPointSize / 2,
    y - centerPointSize / 2,
    centerPointSize,
    centerPointSize,
  );

  if (locatorReveal < 1) {
    if (options.locatorAnimation === "focus-lock") {
      const outer = half + (1 - locatorReveal) * 30 * locatorUnit;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.18 + (1 - locatorReveal) * 0.38;
      ctx.lineWidth = Math.max(0.6, 0.8 * locatorUnit);
      ctx.setLineDash([3 * locatorUnit, 7 * locatorUnit]);
      ctx.strokeRect(x - outer, y - outer, outer * 2, outer * 2);
      ctx.setLineDash([]);
    } else if (options.locatorAnimation === "scan-gate") {
      const scanX =
        x - half - 7 * locatorUnit + (box + 14 * locatorUnit) * locatorReveal;
      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = 0.78;
      ctx.lineWidth = Math.max(0.8, 1.1 * locatorUnit);
      ctx.beginPath();
      ctx.moveTo(scanX, y - half - 10 * locatorUnit);
      ctx.lineTo(scanX, y + half + 10 * locatorUnit);
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 5 * locatorUnit;
      ctx.stroke();
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      const ring = half + locatorReveal * 34 * locatorUnit;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = (1 - locatorReveal) * 0.72;
      ctx.lineWidth = Math.max(0.7, 0.9 * locatorUnit);
      ctx.strokeRect(-ring, -ring, ring * 2, ring * 2);
      ctx.restore();
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  if (options.panelProgress <= 0) {
    ctx.restore();
    return;
  }

  const reveal = clamp(options.panelProgress, 0, 1);
  const connectorStartX = panelOnRight ? x + half : x - half;
  const connectorEndX = panelOnRight ? panelX : panelX + panelWidth;
  const connectorY = clamp(y, panelY + 14 * panelUnit, panelY + panelHeight - 14 * panelUnit);
  const connectorBendX = (connectorStartX + connectorEndX) / 2;
  const connectorProgress = easeInOut(reveal / 0.34);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = Math.max(0.65, 0.8 * panelUnit);
  ctx.beginPath();
  ctx.moveTo(connectorStartX, y);
  if (connectorProgress < 0.55) {
    const firstPhase = connectorProgress / 0.55;
    ctx.lineTo(
      connectorStartX + (connectorBendX - connectorStartX) * firstPhase,
      y + (connectorY - y) * firstPhase,
    );
  } else {
    const secondPhase = (connectorProgress - 0.55) / 0.45;
    ctx.lineTo(connectorBendX, connectorY);
    ctx.lineTo(
      connectorBendX + (connectorEndX - connectorBendX) * secondPhase,
      connectorY,
    );
  }
  ctx.stroke();

  const frameProgress = easeInOut((reveal - 0.18) / 0.55);
  if (frameProgress <= 0) {
    ctx.restore();
    return;
  }

  const visiblePanelWidth = Math.max(1, panelWidth * frameProgress);
  const panelClipX = panelOnRight
    ? panelX
    : panelX + panelWidth - visiblePanelWidth;
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    panelClipX - panelUnit,
    panelY - panelUnit,
    visiblePanelWidth + panelUnit * 2,
    panelHeight + panelUnit * 2,
  );
  ctx.clip();

  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "rgba(3,4,5,.86)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = "#fff";
  ctx.globalAlpha = 0.34;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(panelX, panelY + 18 * panelUnit);
  ctx.lineTo(panelX, panelY);
  ctx.lineTo(panelX + 34 * panelUnit, panelY);
  ctx.moveTo(panelX + panelWidth - 18 * panelUnit, panelY + panelHeight);
  ctx.lineTo(panelX + panelWidth, panelY + panelHeight);
  ctx.lineTo(panelX + panelWidth, panelY + panelHeight - 18 * panelUnit);
  ctx.stroke();

  const scanPosition =
    panelX +
    ((options.timeMs * 0.075) % Math.max(1, panelWidth + 34 * panelUnit)) -
    17 * panelUnit;
  const scanGradient = ctx.createLinearGradient(
    scanPosition - 12 * panelUnit,
    0,
    scanPosition + 12 * panelUnit,
    0,
  );
  scanGradient.addColorStop(0, "rgba(255,255,255,0)");
  scanGradient.addColorStop(0.5, accent);
  scanGradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = scanGradient;
  ctx.globalAlpha = 0.11 * frameProgress;
  ctx.fillRect(
    scanPosition - 12 * panelUnit,
    panelY + panelUnit,
    24 * panelUnit,
    panelHeight - 2 * panelUnit,
  );

  const titleFontSize = Math.max(
    options.staticPlacement ? 7 : options.largeText ? 12 : 10,
    10 * panelUnit * textScale,
  );
  const fontSize = Math.max(
    options.staticPlacement ? 5.5 : options.largeText ? 8.5 : 7,
    7.5 * panelUnit * textScale,
  );
  const line = 12 * panelUnit * textScale;
  const textX = panelX + 9 * panelUnit;
  const textY = panelY + 8 * panelUnit;
  const maxTextWidth = panelWidth - 18 * panelUnit;
  const tick = Math.floor(options.timeMs / 90);
  const rowOpacity = (index: number) =>
    easeInOut((reveal - (0.46 + index * 0.065)) / 0.38);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.9 * rowOpacity(0);
  ctx.font = `700 ${titleFontSize}px "Noto Sans SC", "Microsoft YaHei", "Cascadia Mono", monospace`;
  const title = resolveHudText(
    options.title.trim() || DEFAULT_HUD_TITLE,
    point,
    options.confidence,
    status,
    options.timeMs,
  );
  ctx.fillText(fitCanvasText(ctx, title, maxTextWidth), textX, textY);
  ctx.font = `500 ${fontSize}px "Noto Sans SC", "Microsoft YaHei", "Cascadia Mono", monospace`;
  ctx.fillStyle = "#ffffff";

  if (options.style === "open-data") {
    ctx.globalAlpha = 0.6 * rowOpacity(1);
    ctx.fillText(`POS_X  ${String(Math.round(point.x * 4)).padStart(4, "0")} PX`, textX, textY + line * 1.45);
    ctx.globalAlpha = 0.6 * rowOpacity(2);
    ctx.fillText(`POS_Y  ${String(Math.round(point.y * 4)).padStart(4, "0")} PX`, textX, textY + line * 2.45);
    ctx.globalAlpha = 0.6 * rowOpacity(3);
    ctx.fillText(`MATCH  ${(options.confidence * 100).toFixed(1)}%`, textX, textY + line * 3.45);
    ctx.globalAlpha = 0.6 * rowOpacity(4);
    ctx.fillText(`STATE  ${status}`, textX, textY + line * 4.45);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.8 * rowOpacity(4);
    ctx.fillRect(
      textX,
      panelY + panelHeight - 12 * panelUnit,
      (panelWidth - 18 * panelUnit) * options.confidence,
      2 * panelUnit,
    );
  } else if (options.style === "calibration") {
    const heading = String((tick * 3) % 360).padStart(3, "0");
    ctx.globalAlpha = 0.6 * rowOpacity(1);
    ctx.fillText(`AZM ${heading}°  //  VECTOR ${(tick % 97).toString().padStart(2, "0")}`, textX, textY + line * 1.45);
    ctx.globalAlpha = 0.6 * rowOpacity(2);
    ctx.fillText(`ΔX ${(point.x - 480).toFixed(2).padStart(8, " ")}`, textX, textY + line * 2.45);
    ctx.globalAlpha = 0.6 * rowOpacity(3);
    ctx.fillText(`ΔY ${(point.y - 270).toFixed(2).padStart(8, " ")}`, textX, textY + line * 3.45);
    ctx.globalAlpha = 0.6 * rowOpacity(4);
    ctx.fillText(`SIG ${(options.confidence * 100).toFixed(1)}  ${status}`, textX, textY + line * 4.45);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.65 * rowOpacity(3);
    for (let index = 0; index < 9; index += 1) {
      const railX = textX + index * 16 * panelUnit;
      const railHeight = (4 + ((tick + index * 3) % 13)) * panelUnit;
      ctx.beginPath();
      ctx.moveTo(railX, panelY + panelHeight - 8 * panelUnit);
      ctx.lineTo(railX, panelY + panelHeight - 8 * panelUnit - railHeight);
      ctx.stroke();
    }
  } else {
    const codeLines = options.codeLines
      .slice(0, 4)
      .map((lineTemplate) =>
        resolveHudText(
          lineTemplate,
          point,
          options.confidence,
          status,
          options.timeMs,
        ),
      );
    codeLines.forEach((code, index) => {
      ctx.fillStyle = index === tick % codeLines.length ? accent : "#fff";
      ctx.globalAlpha =
        (index === tick % codeLines.length ? 0.9 : 0.48) * rowOpacity(index + 1);
      ctx.fillText(
        fitCanvasText(ctx, code || " ", maxTextWidth),
        textX,
        textY + titleFontSize + 5 * panelUnit + line * index,
      );
    });
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  if (options.staticPlacement) {
    const sideReveal = easeInOut((reveal - 0.28) / 0.52);
    const direction = panelOnRight ? 1 : -1;
    const sideX = panelOnRight
      ? panelX + panelWidth + (7 + (1 - sideReveal) * 12) * panelUnit
      : panelX - (7 + (1 - sideReveal) * 12) * panelUnit;
    const railTop = panelY + 7 * panelUnit;
    const railHeight = panelHeight - 14 * panelUnit;
    const tick = Math.floor(options.timeMs / 150);

    ctx.save();
    ctx.globalAlpha = 0.72 * sideReveal;
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = Math.max(0.6, 0.75 * panelUnit);
    ctx.beginPath();
    ctx.moveTo(sideX, railTop);
    ctx.lineTo(sideX, railTop + railHeight);
    ctx.stroke();

    for (let index = 0; index < 6; index += 1) {
      const nodeY = railTop + (railHeight / 5) * index;
      const active = index === tick % 6;
      const length = (active ? 9 : index % 2 ? 4 : 6) * panelUnit;
      ctx.globalAlpha = (active ? 0.94 : 0.38) * sideReveal;
      ctx.fillRect(
        sideX,
        nodeY - Math.max(0.5, 0.7 * panelUnit),
        length * direction,
        Math.max(1, 1.2 * panelUnit),
      );
    }

    const labelX = sideX + 13 * panelUnit * direction;
    ctx.globalAlpha = 0.58 * sideReveal;
    ctx.fillStyle = "#fff";
    ctx.font = `600 ${Math.max(5.5, 6.2 * panelUnit)}px "Cascadia Mono", monospace`;
    ctx.textAlign = panelOnRight ? "left" : "right";
    ctx.textBaseline = "top";
    ctx.fillText("S/01", labelX, railTop);
    ctx.globalAlpha = 0.34 * sideReveal;
    ctx.fillText("STATIC", labelX, railTop + 10 * panelUnit);

    ctx.globalAlpha = (0.42 + hudPulse * 0.35) * sideReveal;
    ctx.beginPath();
    ctx.arc(labelX, railTop + railHeight - 3 * panelUnit, 2.2 * panelUnit, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

const UI_ZH: Record<string,string> = {
  "4K portrait · 2160 × 3840": "4K 竖屏 · 2160 × 3840",
  "QHD portrait · 1440 × 2560": "QHD 竖屏 · 1440 × 2560",
  "FHD portrait · 1080 × 1920": "FHD 竖屏 · 1080 × 1920",
  "9:16 source detected · Static anchor positioned at bottom center": "已识别 9:16 竖屏素材 · 静态锚点已在底部居中就位",
  "16:9 source detected · Static anchor positioned at bottom center": "已识别 16:9 横屏素材 · 静态锚点已在底部居中就位",
  "9:16 source detected · Workspace adapted": "已识别 9:16 竖屏素材 · 全系统已自动切换",
  "16:9 source detected · Workspace adapted": "已识别 16:9 横屏素材 · 全系统已自动切换",
  "STATIC_PIN moved · Click the canvas to refine its position": "STATIC_PIN 已移动 · 点击画布可继续微调位置",
  "TARGET_01 locked · Tracking in progress": "TARGET_01 已锁定 · 正在自动追踪",
  "STATIC_PIN placed · Fixed at the current coordinates": "STATIC_PIN 已放置 · 将固定在当前坐标",
  "9:16 portrait selected · Auto format resumes on your next import": "已切换为 9:16 竖屏 · 自动模式可在下次上传时恢复",
  "16:9 landscape selected · Auto format resumes on your next import": "已切换为 16:9 横屏 · 自动模式可在下次上传时恢复",
  "Static anchor at bottom center · Click the canvas to reposition": "静态锚点已放在底部居中 · 点击画布可重新定位",
  "Static anchor starts at bottom center after import": "静态锚点默认位于底部居中 · 上传视频后自动出现",
  "Automatic tracking resumed": "自动追踪已恢复",
  "Tracking mode · Click a subject in the video to begin": "自动追踪模式 · 点击视频中的物体开始追踪",
  "Target cleared · Select a new target": "追踪点已清除 · 请重新点击目标",
  "Import a video and select a tracking target first": "请先上传视频并点击一个追踪目标",
  "This browser does not support video compositing export": "当前浏览器不支持视频合成导出",
  "MP4 / H.264 export is unavailable. Use a current version of Chrome, Edge or Safari": "当前浏览器暂不支持 MP4 / H.264 导出，请使用最新版 Chrome、Edge 或 Safari",
  "The MP4 encoder could not start. Try a lower resolution": "MP4 编码器启动失败，请尝试较低分辨率后再次导出",
  "The MP4 export contains no valid frames. Try a lower resolution": "MP4 导出没有生成有效画面，请降低分辨率后重试",
  "MP4 encoding stopped. Lower the resolution or close other GPU-intensive tabs": "MP4 编码中断，请尝试降低分辨率或关闭其他占用显存的页面",
  "Video playback could not start. Press Play, then export again": "视频播放启动失败，请点击播放后再次导出",
  "Help": "帮助",
  "Account": "账户",
  "Workflow": "工作流程",
  "Import": "导入",
  "Select": "选点",
  "Position": "定位",
  "Export": "导出",
  "Click the subject center or a clearly defined edge": "在画面中点击目标的中心或清晰边缘",
  "Click anywhere in the canvas to place a static HUD": "点击画面任意位置，放置静态 HUD",
  "Keyboard shortcuts": "快捷键",
  "Settings": "设置",
  "Select a subject. Keep the context.": "点击物体，锁定自动追踪目标",
  "Click the canvas to position your HUD.": "点击画面，把 HUD 静态钉在这里",
  "Make motion readable.": "让运动变成可读的数据。",
  "Click the subject center or a high-contrast edge": "单击目标中心或对比度清晰的边缘",
  "Click to reposition the static anchor; it starts at bottom center": "单击画布即可移动静态锚点；默认位置在底部居中",
  "Track a target": "追踪取样",
  "Position anchor": "调整锚点位置",
  "Clear target": "清除标记",
  "Static anchor canvas. Click to position the anchor": "静态锚点画布，点击调整锚点位置",
  "Tracking canvas. Click to select a target": "视频追踪画布，点击选择目标",
  "Start with a clip.": "点一下。",
  "Then choose what to explain.": "剩下的交给追踪器。",
  "Import a video, select a subject and create a following HUD with an XY motion path.": "上传一段视频，在目标上点击一次，即可生成持续跟随的 HUD 与 XY 轨迹。",
  "Drop a video, or click to import": "拖入视频，或点击上传",
  "MP4 · MOV · WEBM / Up to 4K": "MP4 · MOV · WEBM / 最高 4K",
  "Import video": "上传素材",
  "Back to start": "跳到开头",
  "Previous frame": "上一帧",
  "Pause": "暂停",
  "Play": "播放",
  "Next frame": "下一帧",
  "Go to end": "跳到结尾",
  "Video timeline": "视频时间轴",
  "Replace video": "替换素材",
  "Waiting for a source video": "等待视频素材",
  "Drag the HUD panel entry time": "拖动 HUD 数据框入场时间",
  "Inspector sections": "检查器分区",
  "Timing": "时间",
  "Design": "外观",
  "Tracking confidence": "追踪置信度",
  "Static anchor": "静态锚点",
  "Motion signal": "运动信号",
  "Samples": "采样",
  "Path points": "轨迹点",
  "Mode": "模式",
  "Position & scale": "定位方式与尺寸",
  "HUD placement": "HUD 定位方式",
  "Auto track": "自动追踪",
  "Static pin": "静态钉住",
  "Small monochrome HUD at bottom center": "默认底部居中，小型黑白 HUD",
  "Click the canvas to move it. Export uses the same coordinates.": "直接点击画布即可移动；导出会使用同一坐标。",
  "Static anchor reset to bottom center": "静态锚点已恢复到底部居中",
  "↓ Reset to bottom center": "↓ 恢复底部居中",
  "Locator size": "定位方框大小",
  "Data panel size": "展开数据框大小",
  "Refine position": "位置微调",
  "Global position offset": "整体位置偏移",
  "Select or place a point in the canvas first": "请先在画面中选择或放置一个点",
  "Toggle HUD position offset": "切换 HUD 位置偏移",
  "X offset": "X 偏移",
  "Y offset": "Y 偏移",
  "Tracking parameters": "自动追踪参数",
  "Search radius": "搜索半径",
  "Path smoothing": "轨迹平滑",
  "Continuous tracking": "追踪运行",
  "Select a target in the canvas first": "请先在画面中选择目标",
  "Toggle continuous tracking": "切换持续追踪",
  "HUD design & copy": "HUD 外观与文字",
  "HUD timing & motion": "HUD 时间与动效",
  "Locator entry time": "定位框入场时间",
  "Use current frame": "设为当前帧",
  "Set when the locator, motion path and origin marker first appear": "控制方形定位框、追踪轨迹与偏移原点第一次出现的时间",
  "LOCK IN time": "LOCK IN 时间",
  "The locator entrance plays at this time in the source video": "拖动后，定位框会在完整视频的这个时间点播放入场动画",
  "Locator entrance": "定位框入场动效",
  "Focus lock": "聚焦锁定",
  "Scan gate": "扫描切入",
  "Signal pulse": "信号脉冲",
  "Data panel entry time": "数据框入场时间",
  "Drag HUD IN on the timeline to separate panel entry from the locator": "可直接拖动视频时间轴中的 HUD IN 标记；不会再与定位框同时提前出现",
  "Reveal sequence": "展开动效",
  "Connector grows → panel opens → data appears line by line": "连线生长 → 框体展开 → 数据逐行流入",
  "Large HUD type": "HUD 大字号",
  "Toggle HUD type size": "切换 HUD 字号",
  "HUD position offset": "HUD 位置偏移",
  "Select a tracking target first": "请先选择一个追踪目标",
  "Relative to the tracking origin": "相对追踪原点",
  "X axis offset": "X 轴偏移",
  "Y axis offset": "Y 轴偏移",
  "The locator and data panel move together. The crosshair stays on the actual tracking origin.": "方形追踪框与数据框会一起移动；小十字保持在真实追踪原点。",
  "Information style": "框内信息设计",
  "HUD information style": "HUD 框内信息设计",
  "Live coordinates": "实时坐标",
  "Signal scan": "信号扫描",
  "Code array": "运行代码",
  "HUD copy": "HUD 文字内容",
  "Main title": "大标题",
  "Enter the HUD title": "输入 HUD 大标题",
  "CODE ARRAY lines": "CODE ARRAY 信息行",
  "Shown in Code array style": "切换到“运行代码”时显示",
  "Dynamic fields:": "动态字段：",
  "Custom HUD color": "自定义 HUD 颜色",
  "HUD color": "HUD 颜色",
  "Toggle custom HUD color": "切换自定义 HUD 颜色",
  "HUD color presets": "HUD 预设颜色",
  "Output aspect": "输出画幅",
  "Resolution": "输出分辨率",
  "Encoding quality": "编码清晰度",
  "Maximum detail": "极清 · 原画优先",
  "High quality · Smaller file": "高质量 · 文件更小",
  "Format": "格式",
  "Aspect": "画幅",
  "Bitrate": "码率",
  "Range": "范围",
  "Full source · 00:00 → end": "完整视频 · 00:00 → 结尾",
  "Frame": "画面",
  "Compositing MP4…": "MP4 合成中…",
  "Export MP4": "导出 MP4",
  "Media is processed locally. Export renders the full source from 0 seconds and follows LOCK IN and HUD IN timing. Aspect changes preserve source proportions, with black padding where needed.": "素材仅在本地处理。导出会从 0 秒完整渲染，并严格按 LOCK IN 与 HUD IN 时间播放元素；切换横竖画幅后仍保持原比例，不裁切、不拉伸，空余区域自动留黑。"
};

export default function Home() {
  const [uiLanguage, setUiLanguage] = useState<"en" | "zh">("en");
  const tr = (english:string) => uiLanguage === "zh" ? (UI_ZH[english] ?? english) : english;
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstFramePendingRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<TrackerSample[]>([]);
  const templateStatsRef = useRef<TrackerStats>({ meanR: 0, meanG: 0, meanB: 0, meanY: 0 });
  const seedTemplateRef = useRef<TrackerSample[]>([]);
  const seedTemplateStatsRef = useRef<TrackerStats>({ meanR: 0, meanG: 0, meanB: 0, meanY: 0 });
  const seedPointRef = useRef<Point>({ x: 480, y: 270 });
  const lastTrackedPointRef = useRef<Point>({ x: 480, y: 270 });
  const staticPointRef = useRef<Point>(getStaticAnchorPoint(ANALYSIS_WIDTH, ANALYSIS_HEIGHT));
  const selectionTimeRef = useRef(0);
  const positionRef = useRef<Point>({ x: 480, y: 270 });
  const rawPositionRef = useRef<Point>({ x: 480, y: 270 });
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const trailRef = useRef<Point[]>([]);
  const hudPositionRef = useRef<Point>({ x: 480, y: 270 });
  const hudVelocityRef = useRef<Point>({ x: 0, y: 0 });
  const hudTrailRef = useRef<Point[]>([]);
  const lastHudRenderRef = useRef(0);
  const trackingRef = useRef(false);
  const placementModeRef = useRef<PlacementMode>("track");
  const selectedRef = useRef(false);
  const confidenceRef = useRef(0.94);
  const lostFramesRef = useRef(0);
  const trackerFrameRef = useRef(0);
  const lastVideoTimeRef = useRef(0);
  const canvasBackgroundRef = useRef("#000000");
  const searchRadiusRef = useRef(140);
  const smoothnessRef = useRef(82);
  const hudStyleRef = useRef<HudStyle>("code-array");
  const hudColorRef = useRef(DEFAULT_HUD_COLOR);
  const customHudColorRef = useRef(false);
  const hudOffsetEnabledRef = useRef(false);
  const hudOffsetXRef = useRef(0);
  const hudOffsetYRef = useRef(0);
  const locatorRevealTimeRef = useRef(0);
  const locatorAnimationRef = useRef<LocatorAnimation>("focus-lock");
  const locatorScaleRef = useRef(STATIC_LOCATOR_SCALE);
  const panelRevealTimeRef = useRef(0);
  const panelTransitionRef = useRef(0.9);
  const panelScaleRef = useRef(STATIC_PANEL_SCALE);
  const largeHudTextRef = useRef(false);
  const hudTitleRef = useRef(DEFAULT_HUD_TITLE);
  const hudCodeLinesRef = useRef([...DEFAULT_CODE_LINES]);
  const lastAnalysisRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [placementMode, setPlacementMode] = useState<PlacementMode>("track");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("target");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState<Point>({ x: 480, y: 270 });
  const [confidence, setConfidence] = useState(0.94);
  const [searchRadius, setSearchRadius] = useState(140);
  const [smoothness, setSmoothness] = useState(82);
  const [hudStyle, setHudStyle] = useState<HudStyle>("code-array");
  const [hudColor, setHudColor] = useState(DEFAULT_HUD_COLOR);
  const [customHudColor, setCustomHudColor] = useState(false);
  const [hudOffsetEnabled, setHudOffsetEnabled] = useState(false);
  const [hudOffsetX, setHudOffsetX] = useState(0);
  const [hudOffsetY, setHudOffsetY] = useState(0);
  const [locatorRevealTime, setLocatorRevealTime] = useState(0);
  const [locatorAnimation, setLocatorAnimation] = useState<LocatorAnimation>("focus-lock");
  const [locatorScale, setLocatorScale] = useState(STATIC_LOCATOR_SCALE);
  const [panelRevealTime, setPanelRevealTime] = useState(0);
  const [panelTransition, setPanelTransition] = useState(0.9);
  const [panelScale, setPanelScale] = useState(STATIC_PANEL_SCALE);
  const [largeHudText, setLargeHudText] = useState(false);
  const [hudTitle, setHudTitle] = useState(DEFAULT_HUD_TITLE);
  const [hudCodeLines, setHudCodeLines] = useState([...DEFAULT_CODE_LINES]);
  const [outputAspect, setOutputAspect] = useState<OutputAspect>("16:9");
  const [sourceAspect, setSourceAspect] = useState<OutputAspect>("16:9");
  const [analysisSize, setAnalysisSize] = useState(ANALYSIS_SIZES["16:9"]);
  const [exportSize, setExportSize] = useState("3840x2160");
  const [exportQuality, setExportQuality] = useState<ExportQuality>("maximum");
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef(false);
  const cancelExportRef = useRef(false);
  const [includeSourceAudio, setIncludeSourceAudio] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#000000");
  const [toast, setToast] = useState("");

  useEffect(() => {
    trackingRef.current = tracking;
  }, [tracking]);

  useEffect(() => {
    placementModeRef.current = placementMode;
  }, [placementMode]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    searchRadiusRef.current = searchRadius;
  }, [searchRadius]);

  useEffect(() => {
    smoothnessRef.current = smoothness;
  }, [smoothness]);

  useEffect(() => {
    hudStyleRef.current = hudStyle;
  }, [hudStyle]);

  useEffect(() => {
    hudColorRef.current = hudColor;
  }, [hudColor]);

  useEffect(() => {
    customHudColorRef.current = customHudColor;
  }, [customHudColor]);

  useEffect(() => {
    hudOffsetEnabledRef.current = hudOffsetEnabled;
  }, [hudOffsetEnabled]);

  useEffect(() => {
    hudOffsetXRef.current = hudOffsetX;
  }, [hudOffsetX]);

  useEffect(() => {
    hudOffsetYRef.current = hudOffsetY;
  }, [hudOffsetY]);

  useEffect(() => {
    locatorRevealTimeRef.current = locatorRevealTime;
  }, [locatorRevealTime]);

  useEffect(() => {
    locatorAnimationRef.current = locatorAnimation;
  }, [locatorAnimation]);

  useEffect(() => {
    locatorScaleRef.current = locatorScale;
  }, [locatorScale]);

  useEffect(() => {
    panelRevealTimeRef.current = panelRevealTime;
  }, [panelRevealTime]);

  useEffect(() => {
    panelTransitionRef.current = panelTransition;
  }, [panelTransition]);

  useEffect(() => {
    panelScaleRef.current = panelScale;
  }, [panelScale]);

  useEffect(() => {
    largeHudTextRef.current = largeHudText;
  }, [largeHudText]);

  useEffect(() => {
    hudTitleRef.current = hudTitle;
  }, [hudTitle]);

  useEffect(() => {
    hudCodeLinesRef.current = hudCodeLines;
  }, [hudCodeLines]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const renderFrame = useCallback(
    (runTracking = true, timelineMs?: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !videoReady) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const analysisWidth = canvas.width;
      const analysisHeight = canvas.height;

      ctx.clearRect(0, 0, analysisWidth, analysisHeight);
      drawContainedVideo(
        ctx,
        video,
        analysisWidth,
        analysisHeight,
        canvasBackgroundRef.current,
      );

      const now = timelineMs ?? performance.now();
      if (
        runTracking &&
        trackingRef.current &&
        selectedRef.current &&
        templateRef.current.length &&
        video.currentTime + 0.001 >= selectionTimeRef.current &&
        now - lastAnalysisRef.current >= (timelineMs === undefined ? 38 : 1000 / 30 - 0.01)
      ) {
        lastAnalysisRef.current = now;
        trackerFrameRef.current += 1;
        const frame = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
        const videoDelta = Math.abs(video.currentTime - lastVideoTimeRef.current);
        const dtFrames = clamp(videoDelta * 30, 0.5, 3);
        lastVideoTimeRef.current = video.currentTime;
        const previousRaw = rawPositionRef.current;
        const predicted = {
          x: clamp(previousRaw.x + velocityRef.current.x * dtFrames, TRACKER_MARGIN, analysisWidth - TRACKER_MARGIN),
          y: clamp(previousRaw.y + velocityRef.current.y * dtFrames, TRACKER_MARGIN, analysisHeight - TRACKER_MARGIN),
        };
        const dynamicRadius = Math.min(
          280,
          searchRadiusRef.current * (1 + Math.min(5, lostFramesRef.current) * 0.2),
        );

        const search = (center: Point, radius: number, stride: number): MatchResult => {
          let best: MatchResult = { point: center, score: Number.POSITIVE_INFINITY };
          const x0 = Math.max(TRACKER_MARGIN, Math.floor(center.x - radius));
          const x1 = Math.min(analysisWidth - TRACKER_MARGIN, Math.ceil(center.x + radius));
          const y0 = Math.max(TRACKER_MARGIN, Math.floor(center.y - radius));
          const y1 = Math.min(analysisHeight - TRACKER_MARGIN, Math.ceil(center.y + radius));
          for (let y = y0; y <= y1; y += stride) {
            for (let x = x0; x <= x1; x += stride) {
              const distancePenalty = ((x - center.x) ** 2 + (y - center.y) ** 2) * 0.012;
              const score =
                scoreCandidate(
                  frame,
                  { x, y },
                  templateRef.current,
                  templateStatsRef.current,
                ) + distancePenalty;
              if (score < best.score) best = { point: { x, y }, score };
            }
          }
          return best;
        };

        let best = search(predicted, dynamicRadius, lostFramesRef.current ? 9 : 7);
        best = search(best.point, 7, 1);
        let nextConfidence = clamp(Math.exp(-Math.sqrt(best.score) / 34), 0.03, 0.995);

        if (
          nextConfidence < 0.36 &&
          lostFramesRef.current >= 3 &&
          trackerFrameRef.current % 3 === 0
        ) {
          let globalBest: MatchResult = {
            point: predicted,
            score: Number.POSITIVE_INFINITY,
          };
          for (let y = TRACKER_MARGIN; y < analysisHeight - TRACKER_MARGIN; y += 15) {
            for (let x = TRACKER_MARGIN; x < analysisWidth - TRACKER_MARGIN; x += 15) {
              const score = scoreCandidate(
                frame,
                { x, y },
                templateRef.current,
                templateStatsRef.current,
              );
              if (score < globalBest.score) globalBest = { point: { x, y }, score };
            }
          }
          globalBest = search(globalBest.point, 16, 2);
          const globalConfidence = clamp(
            Math.exp(-Math.sqrt(globalBest.score) / 34),
            0.03,
            0.995,
          );
          if (globalConfidence > nextConfidence + 0.08) {
            best = globalBest;
            nextConfidence = globalConfidence;
          }
        }

        const measurementDistance = Math.hypot(
          best.point.x - predicted.x,
          best.point.y - predicted.y,
        );
        const accepted =
          nextConfidence >= 0.36 &&
          (measurementDistance < dynamicRadius * 0.94 || nextConfidence > 0.62);
        let stableRaw = predicted;

        if (accepted) {
          lostFramesRef.current = 0;
          const measuredVelocity = {
            x: (best.point.x - previousRaw.x) / dtFrames,
            y: (best.point.y - previousRaw.y) / dtFrames,
          };
          const velocityBlend = nextConfidence > 0.7 ? 0.34 : 0.22;
          velocityRef.current = {
            x: velocityRef.current.x * (1 - velocityBlend) + measuredVelocity.x * velocityBlend,
            y: velocityRef.current.y * (1 - velocityBlend) + measuredVelocity.y * velocityBlend,
          };
          stableRaw = best.point;

          if (nextConfidence > 0.78 && trackerFrameRef.current % 4 === 0) {
            const fresh = buildTemplate(frame, best.point);
            const adaptation = 0.025;
            templateRef.current.forEach((sample, index) => {
              const update = fresh.samples[index];
              sample.y = sample.y * (1 - adaptation) + update.y * adaptation;
              sample.relativeY =
                sample.relativeY * (1 - adaptation) + update.relativeY * adaptation;
              sample.chromaRG =
                sample.chromaRG * (1 - adaptation) + update.chromaRG * adaptation;
              sample.chromaYB =
                sample.chromaYB * (1 - adaptation) + update.chromaYB * adaptation;
              sample.gradientX =
                sample.gradientX * (1 - adaptation) + update.gradientX * adaptation;
              sample.gradientY =
                sample.gradientY * (1 - adaptation) + update.gradientY * adaptation;
            });
            templateStatsRef.current = {
              meanR:
                templateStatsRef.current.meanR * (1 - adaptation) +
                fresh.stats.meanR * adaptation,
              meanG:
                templateStatsRef.current.meanG * (1 - adaptation) +
                fresh.stats.meanG * adaptation,
              meanB:
                templateStatsRef.current.meanB * (1 - adaptation) +
                fresh.stats.meanB * adaptation,
              meanY:
                templateStatsRef.current.meanY * (1 - adaptation) +
                fresh.stats.meanY * adaptation,
            };
          }
        } else {
          lostFramesRef.current += 1;
          velocityRef.current = {
            x: velocityRef.current.x * 0.86,
            y: velocityRef.current.y * 0.86,
          };
          nextConfidence = Math.min(nextConfidence, confidenceRef.current * 0.88);
        }

        rawPositionRef.current = stableRaw;
        const lagDistance = Math.hypot(
          stableRaw.x - positionRef.current.x,
          stableRaw.y - positionRef.current.y,
        );
        const baseGain = 0.44 - smoothnessRef.current * 0.0036;
        const adaptiveGain = clamp(baseGain + Math.min(0.42, lagDistance / 220), 0.12, 0.58);
        const smoothedPoint = {
          x: positionRef.current.x + (stableRaw.x - positionRef.current.x) * adaptiveGain,
          y: positionRef.current.y + (stableRaw.y - positionRef.current.y) * adaptiveGain,
        };
        positionRef.current = smoothedPoint;
        lastTrackedPointRef.current = { ...smoothedPoint };
        confidenceRef.current = nextConfidence;
        trailRef.current = [...trailRef.current, smoothedPoint].slice(-88);
        setPosition(smoothedPoint);
        setConfidence(nextConfidence);
      }

      if (selectedRef.current) {
        const hudNow = timelineMs ?? performance.now();
        const previousHudRender = lastHudRenderRef.current || hudNow - 16.67;
        const hudDelta = clamp((hudNow - previousHudRender) / 1000, 1 / 240, 1 / 24);
        lastHudRenderRef.current = hudNow;

        const target = positionRef.current;
        let hudPoint = hudPositionRef.current;
        let hudVelocity = hudVelocityRef.current;
        const hudDistance = Math.hypot(target.x - hudPoint.x, target.y - hudPoint.y);

        if (hudDistance > 150 || !Number.isFinite(hudPoint.x + hudPoint.y)) {
          hudPoint = { ...target };
          hudVelocity = { x: 0, y: 0 };
        } else {
          const stiffness = 96;
          const damping = 20.8;
          const accelerationX = (target.x - hudPoint.x) * stiffness - hudVelocity.x * damping;
          const accelerationY = (target.y - hudPoint.y) * stiffness - hudVelocity.y * damping;
          hudVelocity = {
            x: hudVelocity.x + accelerationX * hudDelta,
            y: hudVelocity.y + accelerationY * hudDelta,
          };
          hudPoint = {
            x: hudPoint.x + hudVelocity.x * hudDelta,
            y: hudPoint.y + hudVelocity.y * hudDelta,
          };
        }

        hudPositionRef.current = hudPoint;
        hudVelocityRef.current = hudVelocity;
        const lastHudTrailPoint = hudTrailRef.current[hudTrailRef.current.length - 1];
        if (
          !lastHudTrailPoint ||
          Math.hypot(hudPoint.x - lastHudTrailPoint.x, hudPoint.y - lastHudTrailPoint.y) > 0.42
        ) {
          hudTrailRef.current = [...hudTrailRef.current, hudPoint].slice(-72);
        } else if (hudTrailRef.current.length) {
          hudTrailRef.current[hudTrailRef.current.length - 1] = hudPoint;
        }

        const offsetEnabled = hudOffsetEnabledRef.current;
        const visualHudPoint = offsetHudPoint(
          hudPoint,
          offsetEnabled,
          hudOffsetXRef.current,
          hudOffsetYRef.current,
          analysisWidth,
          analysisHeight,
        );
        const visualHudTrail = offsetEnabled
          ? hudTrailRef.current.map((trailPoint) =>
              offsetHudPoint(
                trailPoint,
                true,
                hudOffsetXRef.current,
                hudOffsetYRef.current,
                analysisWidth,
                analysisHeight,
              ),
            )
          : hudTrailRef.current;

        drawTrackingHud(
          ctx,
          visualHudPoint,
          visualHudTrail,
          {
            accent: customHudColorRef.current ? hudColorRef.current : DEFAULT_HUD_COLOR,
            anchorPoint: offsetEnabled ? hudPoint : undefined,
            codeLines: hudCodeLinesRef.current,
            confidence: confidenceRef.current,
            largeText: largeHudTextRef.current,
            locatorAnimation: locatorAnimationRef.current,
            locatorProgress:
              placementModeRef.current === "pin"
                ? 1
                : getLocatorProgress(
                    video.currentTime,
                    locatorRevealTimeRef.current,
                  ),
            locatorScale: locatorScaleRef.current,
            lostFrames: lostFramesRef.current,
            panelScale: panelScaleRef.current,
            panelProgress:
              placementModeRef.current === "pin"
                ? 1
                : getPanelProgress(
                    video.currentTime,
                    panelRevealTimeRef.current,
                    panelTransitionRef.current,
                  ),
            staticPlacement: placementModeRef.current === "pin",
            style: hudStyleRef.current,
            timeMs: video.currentTime * 1000,
            title: hudTitleRef.current,
          },
        );
      }
    },
    [videoReady],
  );

  useEffect(() => {
    if (!videoReady) return;
    const video = videoRef.current;
    if (!video) return;
    const drawFirstFrame = () => renderFrame(false);
    video.addEventListener("loadeddata", drawFirstFrame);
    if (video.readyState >= 2) drawFirstFrame();
    return () => video.removeEventListener("loadeddata", drawFirstFrame);
  }, [videoReady, renderFrame]);

  useEffect(() => {
    let animation = 0;
    let lastPausedPaint = 0;
    const loop = () => {
      const video = videoRef.current;
      const now = performance.now();
      if (!exportingRef.current && videoReady && video && video.readyState >= 2 && (!video.paused || selectedRef.current || firstFramePendingRef.current || now - lastPausedPaint > 200)) {
        renderFrame(!video.paused);
        firstFramePendingRef.current = false;
        lastPausedPaint = now;
        setCurrentTime(video.currentTime);
      }
      animation = requestAnimationFrame(loop);
    };
    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [renderFrame, videoReady]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const importVideo = (file: File) => {
    if (isExporting) return;
    if (!file.type.startsWith("video/")) { setToast("Choose a video file (MP4, MOV or WebM)."); return; }
    videoRef.current?.pause();
    setIsPlaying(false);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setFileName(file.name);
    setVideoReady(false);
    firstFramePendingRef.current = true;
    canvasBackgroundRef.current = "#000000";
    setCanvasBackgroundColor("#000000");
    setSelected(false);
    setTracking(false);
    setLocatorRevealTime(0);
    locatorRevealTimeRef.current = 0;
    selectionTimeRef.current = 0;
    setLocatorAnimation("focus-lock");
    locatorAnimationRef.current = "focus-lock";
    setPanelRevealTime(2);
    panelRevealTimeRef.current = 2;
    setHudOffsetEnabled(false);
    setHudOffsetX(0);
    setHudOffsetY(0);
    hudOffsetEnabledRef.current = false;
    hudOffsetXRef.current = 0;
    hudOffsetYRef.current = 0;
    selectedRef.current = false;
    trackingRef.current = false;
    trailRef.current = [];
    hudTrailRef.current = [];
    hudVelocityRef.current = { x: 0, y: 0 };
    lastHudRenderRef.current = 0;
    templateRef.current = [];
    seedTemplateRef.current = [];
    velocityRef.current = { x: 0, y: 0 };
    lostFramesRef.current = 0;
    trackerFrameRef.current = 0;
    confidenceRef.current = 0.94;
    const video = videoRef.current;
    if (video) {
      video.src = url;
      video.load();
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) importVideo(file);
    event.target.value = "";
  };

  const handleLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    const detectedAspect: OutputAspect =
      video.videoHeight > video.videoWidth ? "9:16" : "16:9";
    const nextAnalysisSize = ANALYSIS_SIZES[detectedAspect];
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = nextAnalysisSize.width;
      canvas.height = nextAnalysisSize.height;
    }
    const centerPoint = {
      x: nextAnalysisSize.width / 2,
      y: nextAnalysisSize.height / 2,
    };
    const defaultStaticPoint = getStaticAnchorPoint(
      nextAnalysisSize.width,
      nextAnalysisSize.height,
    );
    const nextDuration = video.duration || 0;
    const defaultRevealTime = Math.min(2, Math.max(0.2, nextDuration * 0.5));
    setSourceAspect(detectedAspect);
    setOutputAspect(detectedAspect);
    setAnalysisSize(nextAnalysisSize);
    setExportSize(EXPORT_SIZES[detectedAspect][0].value);
    seedPointRef.current = { ...centerPoint };
    lastTrackedPointRef.current = { ...centerPoint };
    staticPointRef.current = { ...defaultStaticPoint };
    positionRef.current = { ...centerPoint };
    rawPositionRef.current = { ...centerPoint };
    hudPositionRef.current = { ...centerPoint };
    setPosition(centerPoint);
    setDuration(nextDuration);
    setLocatorRevealTime(0);
    locatorRevealTimeRef.current = 0;
    const nextPanelRevealTime = placementModeRef.current === "pin" ? 0 : defaultRevealTime;
    setPanelRevealTime(nextPanelRevealTime);
    panelRevealTimeRef.current = nextPanelRevealTime;
    setCurrentTime(0);
    setVideoReady(true);
    lastVideoTimeRef.current = 0;
    window.setTimeout(() => {
      setToast(uiLanguage === "zh" ? "视频已加载：点击主体以追踪，或选择固定锚点。" : "Video ready. Click a subject to track, or choose Position anchor.");
      renderFrame(false);
    }, 30);
  };

  const handleLoadedData = () => {
    firstFramePendingRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    const sampledColor = sampleVideoEdgeColor(video);
    canvasBackgroundRef.current = sampledColor;
    setCanvasBackgroundColor(sampledColor);
    window.setTimeout(() => renderFrame(false), 20);
  };

  const placeStaticAnchor = (point: Point, message?: string) => {
    staticPointRef.current = { ...point };
    positionRef.current = { ...point };
    rawPositionRef.current = { ...point };
    hudPositionRef.current = { ...point };
    velocityRef.current = { x: 0, y: 0 };
    hudVelocityRef.current = { x: 0, y: 0 };
    trailRef.current = [point];
    hudTrailRef.current = [point];
    lastHudRenderRef.current = performance.now();
    lostFramesRef.current = 0;
    selectedRef.current = true;
    trackingRef.current = false;
    confidenceRef.current = 0.99;
    locatorRevealTimeRef.current = 0;
    panelRevealTimeRef.current = 0;
    setPosition(point);
    setSelected(true);
    setTracking(false);
    setConfidence(0.99);
    setLocatorRevealTime(0);
    setPanelRevealTime(0);
    if (message) setToast(message);
    window.setTimeout(() => renderFrame(false), 20);
  };

  const resetStaticAnchor = (message?: string) => {
    const canvas = canvasRef.current;
    const width = canvas?.width ?? analysisSize.width;
    const height = canvas?.height ?? analysisSize.height;
    placeStaticAnchor(getStaticAnchorPoint(width, height), message);
  };

  const selectTarget = (event: MouseEvent<HTMLCanvasElement>) => {
    if (exportingRef.current) return;
    if (!videoReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
    if (placementModeRef.current === "pin") {
      placeStaticAnchor(point, tr("STATIC_PIN moved · Click the canvas to refine its position"));
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const video = videoRef.current;
    if (!video) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawContainedVideo(
      ctx,
      video,
      canvas.width,
      canvas.height,
      canvasBackgroundRef.current,
    );
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const template = buildTemplate(frame, point);
    templateRef.current = cloneTrackerSamples(template.samples);
    templateStatsRef.current = { ...template.stats };
    seedTemplateRef.current = cloneTrackerSamples(template.samples);
    seedTemplateStatsRef.current = { ...template.stats };
    seedPointRef.current = { ...point };
    lastTrackedPointRef.current = { ...point };
    selectionTimeRef.current = video.currentTime;
    positionRef.current = point;
    rawPositionRef.current = point;
    velocityRef.current = { x: 0, y: 0 };
    trailRef.current = [point];
    hudPositionRef.current = point;
    hudVelocityRef.current = { x: 0, y: 0 };
    hudTrailRef.current = [point];
    lastHudRenderRef.current = performance.now();
    lostFramesRef.current = 0;
    trackerFrameRef.current = 0;
    lastVideoTimeRef.current = video.currentTime;
    selectedRef.current = true;
    const shouldTrack = placementModeRef.current === "track";
    trackingRef.current = shouldTrack;
    confidenceRef.current = 0.99;
    locatorRevealTimeRef.current = video.currentTime;
    setLocatorRevealTime(video.currentTime);
    const earliestPanelTime = Math.min(duration || video.duration || 10, video.currentTime + 0.9);
    if (panelRevealTimeRef.current < earliestPanelTime) {
      panelRevealTimeRef.current = earliestPanelTime;
      setPanelRevealTime(earliestPanelTime);
    }
    setPosition(point);
    setSelected(true);
    setTracking(shouldTrack);
    setConfidence(0.99);
    setToast(
      shouldTrack
        ? tr("TARGET_01 locked · Tracking in progress")
        : tr("STATIC_PIN placed · Fixed at the current coordinates"),
    );
    renderFrame(false);
  };

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!videoReady || !video) return;
    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      renderFrame(false);
    }
  }, [renderFrame, videoReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a, [contenteditable='true']")) return;
      event.preventDefault();
      void togglePlay();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay]);

  const jump = (seconds: number) => {
    const video = videoRef.current;
    if (!videoReady || !video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    setCurrentTime(video.currentTime);
    window.setTimeout(() => renderFrame(false), 20);
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!videoReady || !video) return;
    video.currentTime = value;
    setCurrentTime(value);
    trailRef.current = [];
    velocityRef.current = { x: 0, y: 0 };
    hudVelocityRef.current = { x: 0, y: 0 };
    hudTrailRef.current = [hudPositionRef.current];
    lastHudRenderRef.current = performance.now();
    rawPositionRef.current = positionRef.current;
    lostFramesRef.current = 0;
    lastVideoTimeRef.current = value;
    window.setTimeout(() => renderFrame(false), 20);
  };

  const setLocatorCueTime = (value: number) => {
    const nextTime = clamp(value, selectionTimeRef.current, duration || 10);
    locatorRevealTimeRef.current = nextTime;
    setLocatorRevealTime(nextTime);
    if (panelRevealTimeRef.current < nextTime) {
      panelRevealTimeRef.current = nextTime;
      setPanelRevealTime(nextTime);
    }
    window.setTimeout(() => renderFrame(false), 20);
  };

  const setPanelCueTime = (value: number) => {
    const nextTime = clamp(
      Math.max(value, locatorRevealTimeRef.current),
      0,
      duration || 10,
    );
    panelRevealTimeRef.current = nextTime;
    setPanelRevealTime(nextTime);
    window.setTimeout(() => renderFrame(false), 20);
  };

  const setPanelTransitionDuration = (value: number) => {
    const nextDuration = clamp(value, 0.35, 1.8);
    panelTransitionRef.current = nextDuration;
    setPanelTransition(nextDuration);
    window.setTimeout(() => renderFrame(false), 20);
  };

  const changeOutputAspect = (aspect: OutputAspect) => {
    if (aspect === outputAspect) {
      setToast(`${aspect} selected · Source ${sourceAspect}`);
      return;
    }
    const nextAnalysisSize = ANALYSIS_SIZES[aspect];
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = nextAnalysisSize.width;
      canvas.height = nextAnalysisSize.height;
    }
    setAnalysisSize(nextAnalysisSize);
    setOutputAspect(aspect);
    setExportSize(EXPORT_SIZES[aspect][0].value);
    if (placementModeRef.current === "pin" && videoReady && selectedRef.current) {
      placeStaticAnchor(
        getStaticAnchorPoint(nextAnalysisSize.width, nextAnalysisSize.height),
      );
    } else {
      const centerPoint = {
        x: nextAnalysisSize.width / 2,
        y: nextAnalysisSize.height / 2,
      };
      selectedRef.current = false;
      trackingRef.current = false;
      templateRef.current = [];
      seedTemplateRef.current = [];
      trailRef.current = [];
      hudTrailRef.current = [];
      positionRef.current = centerPoint;
      rawPositionRef.current = centerPoint;
      hudPositionRef.current = centerPoint;
      setPosition(centerPoint);
      setSelected(false);
      setTracking(false);
      window.setTimeout(() => renderFrame(false), 20);
    }
    setToast(
      aspect === "9:16"
        ? tr("9:16 portrait selected · Auto format resumes on your next import")
        : tr("16:9 landscape selected · Auto format resumes on your next import"),
    );
  };

  const changePlacementMode = (mode: PlacementMode) => {
    videoRef.current?.pause();
    placementModeRef.current = mode;
    setPlacementMode(mode);
    setInspectorTab("target");
    clearTarget();
    setToast(mode === "pin"
      ? (uiLanguage === "zh" ? "点击画布选择固定锚点" : "Click the canvas to choose the anchor position")
      : tr("Tracking mode · Click a subject in the video to begin"));
    window.setTimeout(() => renderFrame(false), 20);
  };

  const clearTarget = () => {
    setSelected(false);
    setTracking(false);
    selectedRef.current = false;
    trackingRef.current = false;
    selectionTimeRef.current = 0;
    templateRef.current = [];
    seedTemplateRef.current = [];
    trailRef.current = [];
    velocityRef.current = { x: 0, y: 0 };
    hudTrailRef.current = [];
    hudVelocityRef.current = { x: 0, y: 0 };
    lastHudRenderRef.current = 0;
    lostFramesRef.current = 0;
    setToast(tr("Target cleared · Select a new target"));
    renderFrame(false);
  };

  const exportVideo = async () => {
    const video = videoRef.current;
    if (!videoReady || !video || !selected || exportingRef.current) {
      setToast(tr("Import a video and select a tracking target first"));
      return;
    }
    exportingRef.current = true;
    cancelExportRef.current = false;
    setIsExporting(true);
    setExportProgress(0);
    video.pause();
    setIsPlaying(false);
    const originalLoop = video.loop;
    video.loop = false;
    try {
      await seekExportFrame(video, 0);
    const exportSeedPoint = {
      ...(placementModeRef.current === "pin" ? staticPointRef.current : seedPointRef.current),
    };
    templateRef.current = cloneTrackerSamples(seedTemplateRef.current);
    templateStatsRef.current = { ...seedTemplateStatsRef.current };
    positionRef.current = exportSeedPoint;
    rawPositionRef.current = exportSeedPoint;
    velocityRef.current = { x: 0, y: 0 };
    trailRef.current = [exportSeedPoint];
    hudPositionRef.current = exportSeedPoint;
    hudVelocityRef.current = { x: 0, y: 0 };
    hudTrailRef.current = [exportSeedPoint];
    lastHudRenderRef.current = 0;
    lastVideoTimeRef.current = 0;
    lastAnalysisRef.current = 0;
    trackerFrameRef.current = 0;
    lostFramesRef.current = 0;
    confidenceRef.current = 0.99;
    setCurrentTime(0);
    setPosition(exportSeedPoint);
    setConfidence(0.99);
    renderFrame(false);

    const [width, height] = exportSize.split("x").map(Number);
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext("2d", { alpha: false });
    if (!exportCtx) throw new Error("Canvas export is unavailable.");
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = "high";


      const blob = await encodeTrackingMp4({
        video, canvas: exportCanvas, duration, fps: EXPORT_FRAME_RATE,
        bitrate: getExportVideoBitrate(width, height, exportQuality),
        includeAudio: includeSourceAudio,
        cancelled: () => cancelExportRef.current,
        progress: (value: number) => setExportProgress(value),
        render: (index: number) => {
          renderFrame(true, 1000 + index * 1000 / EXPORT_FRAME_RATE);
      exportCtx.clearRect(0, 0, width, height);
      const exportVideoRect = drawContainedVideo(
        exportCtx,
        video,
        width,
        height,
        canvasBackgroundRef.current,
      );
      const analysisVideoRect = getContainedRect(
        video.videoWidth,
        video.videoHeight,
        canvasRef.current?.width ?? analysisSize.width,
        canvasRef.current?.height ?? analysisSize.height,
      );
      const exportScaleX = exportVideoRect.width / analysisVideoRect.width;
      const exportScaleY = exportVideoRect.height / analysisVideoRect.height;
      const exportTranslateX = exportVideoRect.x - analysisVideoRect.x * exportScaleX;
      const exportTranslateY = exportVideoRect.y - analysisVideoRect.y * exportScaleY;
      const exportOffsetEnabled = hudOffsetEnabledRef.current;
      const exportHudPoint = offsetHudPoint(
        hudPositionRef.current,
        exportOffsetEnabled,
        hudOffsetXRef.current,
        hudOffsetYRef.current,
        canvasRef.current?.width ?? analysisSize.width,
        canvasRef.current?.height ?? analysisSize.height,
      );
      const exportHudTrail = exportOffsetEnabled
        ? hudTrailRef.current.map((trailPoint) =>
            offsetHudPoint(
              trailPoint,
              true,
              hudOffsetXRef.current,
              hudOffsetYRef.current,
              canvasRef.current?.width ?? analysisSize.width,
              canvasRef.current?.height ?? analysisSize.height,
            ),
          )
        : hudTrailRef.current;
      drawTrackingHud(
        exportCtx,
        exportHudPoint,
        exportHudTrail,
        {
          accent: customHudColorRef.current ? hudColorRef.current : DEFAULT_HUD_COLOR,
          anchorPoint: exportOffsetEnabled ? hudPositionRef.current : undefined,
          codeLines: hudCodeLinesRef.current,
          confidence: confidenceRef.current,
          largeText: largeHudTextRef.current,
          locatorAnimation: locatorAnimationRef.current,
          locatorProgress:
            placementModeRef.current === "pin"
              ? 1
              : getLocatorProgress(
                  video.currentTime,
                  locatorRevealTimeRef.current,
                ),
          locatorScale: locatorScaleRef.current,
          lostFrames: lostFramesRef.current,
          panelScale: panelScaleRef.current,
          panelProgress:
            placementModeRef.current === "pin"
              ? 1
              : getPanelProgress(
                  video.currentTime,
                  panelRevealTimeRef.current,
                  panelTransitionRef.current,
                ),
          staticPlacement: placementModeRef.current === "pin",
          style: hudStyleRef.current,
          timeMs: video.currentTime * 1000,
          title: hudTitleRef.current,
        },
        exportScaleX,
        exportScaleY,
        exportTranslateX,
        exportTranslateY,
      );

        },
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `motion-tracking_${width}x${height}_60fps.mp4`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setExportProgress(100);
      setToast(`${width}×${height} MP4 · ${duration.toFixed(2)} s · 60 fps exported`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Export failed. Please try another resolution.");
    } finally {
      video.pause();
      video.loop = originalLoop;
      exportingRef.current = false;
      setIsExporting(false);
      setIsPlaying(false);
      setCurrentTime(video.currentTime);
    }
  };

  const signalBars = Array.from({ length: 24 }, (_, index) =>
    Math.round(22 + Math.abs(Math.sin(index * 0.64 + position.x / 120)) * 52),
  );
  const [exportWidth, exportHeight] = exportSize.split("x").map(Number);
  const exportLongEdge = Math.max(exportWidth, exportHeight);
  const exportTier = exportLongEdge >= 3840 ? "4K" : exportLongEdge >= 2560 ? "QHD" : "FHD";
  const currentFrame = Math.max(1, Math.round(currentTime * TIMELINE_FRAME_RATE) + 1);
  const totalFrames = Math.max(1, Math.ceil(duration * TIMELINE_FRAME_RATE));
  const timelineProgress = duration ? (currentTime / duration) * 100 : 0;


  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>07 / Motion Tracking Studio<small style={{display:"block",fontSize:9,letterSpacing:".1em",color:"#92948e",marginTop:5}}>MOTION → READABLE OVERLAYS</small></span>
        </div>
        <div className="project-title">
          <span className="eyebrow">PROJECT</span>
          <span>{fileName || "UNTITLED_SEQUENCE"}</span>
          <span className="unsaved-dot" />
        </div>
        <div className="top-status">
          <span className="local-chip"><i /> LOCAL PROCESSING</span>
          <button className="icon-button" aria-label={tr("Help")} onClick={()=>setToast(uiLanguage === "en" ? "Import a clip → choose Static pin or Auto track → refine timing → export." : "导入视频 → 选择静态锚点或自动追踪 → 调整时间 → 导出。")}>?</button>
          <a className="avatar-button" href="https://github.com/MuwenTriLi/creative-workflows" aria-label="Portfolio">MW</a>
        </div>
      </header>
<nav className="family-nav" aria-label="Creative workflow studios"><span>MUWEN LI / STUDIOS</span><a href="https://meshroom-breakdown-studio.limuwen9.chatgpt.site"><b>03</b>Model Breakdown</a><a href="https://muwentrili.github.io/creative-workflows/collage-motion/"><b>04</b>Animated Storyboard</a><a href="https://flipframe-motion-lab.limuwen9.chatgpt.site"><b>05</b>Spatial Media Presenter</a><a href="https://vox-one.limuwen9.chatgpt.site"><b>06</b>Kinetic Typography Studio</a><a href="https://trace-01-motion-tracker.limuwen9.chatgpt.site" aria-current="page"><b>07</b>Motion Tracking Studio</a><a className="family-index" href="https://github.com/MuwenTriLi/creative-workflows">All projects ↗</a></nav>

      <fieldset className="editing-controls" disabled={isExporting}><section className="workspace">
        <aside className="source-rail">
          <section className="source-import" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file=event.dataTransfer.files[0]; if(file) importVideo(file); }}>
            <strong>01 / {tr("Import video")}</strong>
            <p>{uiLanguage === "zh" ? "拖入视频。文件在浏览器内处理。" : "Drop a video here. Your file stays in this browser."}</p>
            <button disabled={isExporting} onClick={() => fileInputRef.current?.click()}>＋ {tr("Import video")}</button>
          </section>
          <div className="source-summary"><span>01 / SOURCE MEDIA</span><h2>{videoReady ? fileName : (uiLanguage === "zh" ? "从你的视频开始" : "Start with your footage")}</h2><p>{videoReady ? `${formatTime(duration)} · ${sourceAspect}` : "MP4 / MOV / WEBM"}</p></div>
          <ol className="source-steps">
            <li><strong>{uiLanguage === "zh" ? "导入视频" : "Import your video"}</strong><p>{uiLanguage === "zh" ? "先定位到目标清晰的一帧。" : "Find a frame where the subject is clear."}</p></li>
            <li><strong>{uiLanguage === "zh" ? "选择目标 01" : "Choose target 01"}</strong><p>{uiLanguage === "zh" ? "追踪主体，或手动定位固定标注。" : "Follow a subject or position a fixed annotation."}</p></li>
            <li><strong>{uiLanguage === "zh" ? "检查并导出" : "Review, then export"}</strong><p>{uiLanguage === "zh" ? "播放检查轨迹，再导出视频。" : "Play to check the path and labels before rendering."}</p></li>
          </ol>
        </aside>

        <div className="stage-column">
          <div className="stage-header">
            <div>
              <span className="section-kicker">SOURCE VIEW / OUTPUT {outputAspect}</span>
              <h1>
                {videoReady
                  ? placementMode === "track"
                    ? tr("Select a subject. Keep the context.")
                    : tr("Click the canvas to position your HUD.")
                  : tr("Make motion readable.")}
              </h1>
            </div>
            <div className="stage-tools">
              <button
                className={selected || placementMode === "pin" ? "tool-active" : ""}
                onClick={() => {
                  setInspectorTab("target");
                  setToast(
                    placementMode === "track"
                      ? tr("Click the subject center or a high-contrast edge")
                      : tr("Click anywhere in the canvas to place a static HUD"),
                  );
                }}
              >
                <span className="crosshair-icon">＋</span>
                {placementMode === "track" ? tr("Track a target") : tr("Position anchor")}
              </button>
              <button onClick={clearTarget} disabled={!selected}>{tr("Clear target")}</button>
              <span className="zoom-readout">100%</span>
            </div>
          </div>

          <div className="studio-transport">
            <div className="placement-switch"><button aria-pressed={placementMode === "track"} onClick={()=>changePlacementMode("track")}>{tr("Track a target")}</button><button aria-pressed={placementMode === "pin"} onClick={()=>changePlacementMode("pin")}>{tr("Position anchor")}</button></div>
            <div className="transport-buttons">
              <button onClick={() => seek(0)} disabled={!videoReady} aria-label={tr("Back to start")}>|‹</button>
              <button onClick={() => jump(-1 / TIMELINE_FRAME_RATE)} disabled={!videoReady} aria-label={tr("Previous frame")}>‹</button>
              <button className="play-button" onClick={() => void togglePlay()} disabled={!videoReady} aria-label={isPlaying ? tr("Pause") : tr("Play")} aria-keyshortcuts="Space">
                {isPlaying ? "Ⅱ Pause" : "▶ Play"}
              </button>
              <button onClick={() => jump(1 / TIMELINE_FRAME_RATE)} disabled={!videoReady} aria-label={tr("Next frame")}>›</button>
              <button onClick={() => seek(duration)} disabled={!videoReady} aria-label={tr("Go to end")}>›|</button>
            </div>
<button className="family-language" type="button" aria-label={uiLanguage === "en" ? "Switch to Chinese" : "切换到英文"} onClick={()=>setUiLanguage(uiLanguage === "en" ? "zh" : "en")}>{uiLanguage === "en" ? "EN / 中文" : "中 / EN"}</button>
          </div>
          <div className="hud-preset-heading"><span>{uiLanguage === "zh" ? "边框与 HUD" : "Frame & side HUD"}</span><button onClick={()=>setInspectorTab("design")}>{uiLanguage === "zh" ? "自定义叠加层 ↗" : "Customize overlays ↗"}</button></div>
          <div className="hud-preset-row">{([ ["open-data","I / Open data"], ["calibration","II / Calibration"], ["code-array","III / Code array"] ] as [HudStyle,string][]).map(([value,label])=><button key={value} aria-pressed={hudStyle === value} onClick={()=>setHudStyle(value)}>{label}</button>)}</div>
          <div
            className={`stage-frame output-${outputAspect.replace(":", "-")}`}
            style={{ "--canvas-fill": canvasBackgroundColor } as React.CSSProperties}
          >
            <video aria-hidden="true"
              ref={videoRef}
              muted
              className="source-video"
              playsInline
              onLoadedMetadata={handleLoaded}
              onLoadedData={handleLoadedData}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <canvas
              ref={canvasRef}
              width={analysisSize.width}
              height={analysisSize.height}
              className={`tracking-canvas ${videoReady ? "visible" : ""} ${placementMode === "pin" ? "pin-editable" : ""}`}
              onClick={selectTarget}
              aria-label={placementMode === "pin" ? tr("Static anchor canvas. Click to position the anchor") : tr("Tracking canvas. Click to select a target")}
            />

            {videoReady && outputAspect === "9:16" && outputAspect !== sourceAspect && (
              <div className="vertical-output-guide" aria-hidden="true">
                <span>{outputAspect} OUTPUT · NO STRETCH</span>
              </div>
            )}

            {!videoReady && (
              <div className="demo-scene">
                <div className="stage-intro">
                  <span className="section-kicker">07 / TRACKING · YOUR FOOTAGE, YOUR ANCHOR</span>
                  <h2>{tr("Start with a clip.")}<br />{tr("Then choose what to explain.")}</h2>
                  <p>{tr("Import a video, select a subject and create a following HUD with an XY motion path.")}</p>
                </div>
                <label className="upload-card" htmlFor="video-upload">
                  <span className="upload-symbol">↗</span>
                  <span>
                    <strong>{tr("Drop a video, or click to import")}</strong>
                    <small>{tr("MP4 · MOV · WEBM / Up to 4K")}</small>
                  </span>
                  <b>{tr("Import video")}</b>
                </label>
              </div>
            )}

            <div className="stage-badge left">INPUT · {videoReady ? `AUTO ${sourceAspect}` : "AWAITING MEDIA"}</div>
            <div className="stage-badge right">REC.709 · OUTPUT {outputAspect}</div>
          </div>

          <input
            ref={fileInputRef}
            id="video-upload"
            className="sr-only"
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            onChange={handleFile}
          />

          <div className="transport">
            <span className="frame-readout">F <b>{String(currentFrame).padStart(4, "0")}</b></span>
            <span className="timecode">{formatTime(currentTime)}</span>
            <div className="timeline-wrap">
              <input
                aria-label={tr("Video timeline")}
                type="range"
                min="0"
                max={duration || 1}
                step={1 / TIMELINE_FRAME_RATE}
                value={Math.min(currentTime, duration || 1)}
                onChange={(event) => seek(Number(event.target.value))}
                disabled={!videoReady}
                style={{ "--timeline-progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
              />
              <div className="timeline-marks">
                <span>F 0001</span>
                <span>F {String(Math.max(1, Math.round(totalFrames / 2))).padStart(4, "0")}</span>
                <span>F {String(totalFrames).padStart(4, "0")}</span>
              </div>
            </div>
            <span className="timecode muted">{formatTime(duration)}</span>
            <kbd className="space-key">SPACE · {isPlaying ? "PAUSE" : "PLAY"}</kbd>
            <button className="replace-button" onClick={() => fileInputRef.current?.click()}>
              {videoReady ? tr("Replace video") : tr("Import video")}
            </button>
          </div>

          <div className="timeline-panel">
            <div className="track-labels">
              <span>V1</span><b>{fileName || tr("Waiting for a source video")}</b><small>{videoReady ? "VIDEO ACTIVE" : "DROP TO BEGIN"}</small>
              <span>D1</span><b>{placementMode === "track" ? "TRACK POSITION" : "STATIC POSITION"}</b><small>{selected ? `${Math.round(position.x * 4)}, ${Math.round(position.y * 4)}` : "NO TARGET"}</small>
            </div>
            <div className="track-area">
              <div className="ruler">
                {Array.from({ length: 25 }, (_, index) => <i key={index} className={index % 4 === 0 ? "major" : ""} />)}
              </div>
              <div className="frame-ruler-labels">
                {[1, Math.round(totalFrames * 0.25), Math.round(totalFrames * 0.5), Math.round(totalFrames * 0.75), totalFrames].map((frame, index) => (
                  <span key={index}>{String(Math.max(1, frame)).padStart(4, "0")}</span>
                ))}
              </div>
              <div className="video-strip">
                {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ opacity: videoReady ? 0.35 + (index % 3) * 0.15 : 0.08 }} />)}
              </div>
              <div className="data-strip">
                <span style={{ width: selected ? `${Math.max(8, duration ? (currentTime / duration) * 100 : 12)}%` : "0%" }} />
              </div>
              <div
                className="locator-cue-head"
                style={{ left: `${duration ? (locatorRevealTime / duration) * 100 : 0}%` }}
              >
                <b>LOCK IN · {formatTime(locatorRevealTime)}</b>
              </div>
              <div
                className="hud-cue-tail"
                style={{ left: `${duration ? (panelRevealTime / duration) * 100 : 0}%` }}
              >
                <b>HUD IN · {formatTime(panelRevealTime)}</b>
              </div>
              <input
                className="hud-timing-slider"
                type="range"
                aria-label={tr("Drag the HUD panel entry time")}
                min="0"
                max={duration || 10}
                step="0.01"
                value={Math.min(panelRevealTime, duration || 10)}
                onChange={(event) => setPanelCueTime(Number(event.target.value))}
                disabled={!videoReady}
              />
              <div className="playhead" style={{ left: `${timelineProgress}%` }}>
                <b>{currentFrame}</b>
              </div>
            </div>
          </div>
        </div>

        <aside className="inspector">
          <section className="review-export"><span>03 / {tr("Export")}</span><button onClick={()=>setInspectorTab("export")}>{uiLanguage === "zh" ? "检查并导出 ↗" : "Review & export ↗"}</button><p>{uiLanguage === "zh" ? "检查编号、追踪与标注，再导出 4K 视频。" : "Check target 01, its path and labels before your 4K export."}</p></section>
          <div className="inspector-head">
            <span className="section-kicker">INSPECTOR</span>
            <span className={`status-pill ${selected ? "live" : ""}`}>
              <i />
              {selected
                ? placementMode === "pin"
                  ? "PINNED"
                  : confidence < 0.36
                    ? "REACQUIRE"
                    : "TRACKING"
                : "STANDBY"}
            </span>
          </div>

          <div className="inspector-tabs" role="tablist" aria-label={tr("Inspector sections")}>
            {([
              ["target", tr("Position")],
              ["timing", tr("Timing")],
              ["design", tr("Design")],
              ["export", tr("Export")],
            ] as [InspectorTab, string][]).map(([value, label]) => (
              <button
                key={value}
                role="tab"
                className={inspectorTab === value ? "active" : ""}
                aria-selected={inspectorTab === value}
                onClick={() => setInspectorTab(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <section className="panel target-panel">
            <div className="panel-title">
              <div><span className="target-dot" /><b>{placementMode === "track" ? "TARGET_01" : "STATIC_PIN"}</b></div>
              <button onClick={clearTarget}>•••</button>
            </div>
            <div className="coordinate-grid">
              <div><span>X / PX</span><strong>{selected ? Math.round(position.x * 4) : "—"}</strong></div>
              <div><span>Y / PX</span><strong>{selected ? Math.round(position.y * 4) : "—"}</strong></div>
            </div>
            <div className="confidence-row">
              <span>{placementMode === "track" ? tr("Tracking confidence") : tr("Static anchor")}</span>
              <b>{selected ? (placementMode === "track" ? `${Math.round(confidence * 100)}%` : "LOCKED") : "—"}</b>
            </div>
            <div className="confidence-bar"><i style={{ width: selected ? (placementMode === "track" ? `${confidence * 100}%` : "100%") : "0%" }} /></div>
          </section>

          <section className={`panel signal-panel ${selected ? "has-target" : ""}`}>
            <div className="panel-heading"><b>{tr("Motion signal")}</b><small>REALTIME</small></div>
            <div className="signal-chart">
              {signalBars.map((height, index) => <i key={index} style={{ height: selected ? `${height}%` : `${10 + (index % 4) * 3}%` }} />)}
            </div>
            <div className="signal-meta">
              <span><small>{tr("Samples")}</small><b>30 fps</b></span>
              <span><small>{tr("Path points")}</small><b>{selected ? "LIVE" : "0"}</b></span>
              <span><small>{tr("Mode")}</small><b>PREDICT</b></span>
            </div>
          </section>

          <section className={`panel settings-panel inspector-pane ${inspectorTab === "target" ? "active" : ""}`}>
            <div className="panel-heading">
              <b>{tr("Position & scale")}</b>
              <button
                onClick={() => {
                  const nextLocatorScale = placementMode === "pin" ? STATIC_LOCATOR_SCALE : 1;
                  const nextPanelScale = placementMode === "pin" ? STATIC_PANEL_SCALE : 1;
                  locatorScaleRef.current = nextLocatorScale;
                  panelScaleRef.current = nextPanelScale;
                  hudOffsetXRef.current = 0;
                  hudOffsetYRef.current = 0;
                  setLocatorScale(nextLocatorScale);
                  setPanelScale(nextPanelScale);
                  setHudOffsetX(0);
                  setHudOffsetY(0);
                  setSearchRadius(140);
                  setSmoothness(82);
                  if (placementMode === "pin") resetStaticAnchor();
                  window.setTimeout(() => renderFrame(false), 20);
                }}
              >
                RESET
              </button>
            </div>
            <div className="placement-mode-grid" role="group" aria-label={tr("HUD placement")}>
              <button
                className={placementMode === "track" ? "active" : ""}
                onClick={() => changePlacementMode("track")}
                aria-pressed={placementMode === "track"}
              >
                <i className="mode-track-icon" />
                <span><b>{tr("Auto track")}</b><small>FOLLOW OBJECT</small></span>
              </button>
              <button
                className={placementMode === "pin" ? "active" : ""}
                onClick={() => changePlacementMode("pin")}
                aria-pressed={placementMode === "pin"}
              >
                <i className="mode-pin-icon" />
                <span><b>{tr("Static pin")}</b><small>CLICK &amp; HOLD</small></span>
              </button>
            </div>
            {placementMode === "pin" && (
              <div className="pin-position-card">
                <div>
                  <span><i /> STATIC / BOTTOM CENTER</span>
                  <b>{tr("Small monochrome HUD at bottom center")}</b>
                  <small>{tr("Click the canvas to move it. Export uses the same coordinates.")}</small>
                </div>
                <button
                  type="button"
                  onClick={() => resetStaticAnchor(tr("Static anchor reset to bottom center"))}
                  disabled={!videoReady}
                >
                  {tr("↓ Reset to bottom center")}</button>
              </div>
            )}
            <div className="size-control-grid">
              <label>
                <span>{tr("Locator size")}<b>{Math.round(locatorScale * 100)}%</b></span>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={locatorScale}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    locatorScaleRef.current = value;
                    setLocatorScale(value);
                    window.setTimeout(() => renderFrame(false), 20);
                  }}
                />
              </label>
              <label>
                <span>{tr("Data panel size")}<b>{Math.round(panelScale * 100)}%</b></span>
                <input
                  type="range"
                  min="0.7"
                  max="1.55"
                  step="0.05"
                  value={panelScale}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    panelScaleRef.current = value;
                    setPanelScale(value);
                    window.setTimeout(() => renderFrame(false), 20);
                  }}
                />
              </label>
            </div>
            <div className="hud-subheading"><span>{tr("Refine position")}</span><small>OFFSET</small></div>
            <div className="toggle-row hud-visibility-toggle compact-toggle">
              <span>{tr("Global position offset")}<small>{hudOffsetEnabled ? "OFFSET ACTIVE" : "FOLLOW ORIGIN"}</small></span>
              <button
                className={`toggle ${hudOffsetEnabled ? "on" : ""}`}
                onClick={() => {
                  if (!selected) return setToast(tr("Select or place a point in the canvas first"));
                  setHudOffsetEnabled((value) => !value);
                }}
                disabled={!selected}
                aria-label={tr("Toggle HUD position offset")}
                aria-pressed={hudOffsetEnabled}
              ><i /></button>
            </div>
            {hudOffsetEnabled && (
              <div className="compact-offset-grid">
                <label>
                  <span>{tr("X offset")}<b>{hudOffsetX >= 0 ? "+" : ""}{hudOffsetX}px</b></span>
                  <input
                    type="range"
                    min="-260"
                    max="260"
                    step="2"
                    value={hudOffsetX}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      hudOffsetXRef.current = value;
                      setHudOffsetX(value);
                    }}
                  />
                </label>
                <label>
                  <span>{tr("Y offset")}<b>{hudOffsetY >= 0 ? "+" : ""}{hudOffsetY}px</b></span>
                  <input
                    type="range"
                    min="-160"
                    max="160"
                    step="2"
                    value={hudOffsetY}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      hudOffsetYRef.current = value;
                      setHudOffsetY(value);
                    }}
                  />
                </label>
              </div>
            )}
            <div className="hud-subheading"><span>{tr("Tracking parameters")}</span><small>{placementMode === "track" ? "ACTIVE" : "PIN MODE"}</small></div>
            <label className={placementMode === "pin" ? "control-muted" : ""}>
              <span>{tr("Search radius")}<b>{searchRadius}px</b></span>
              <input
                type="range"
                min="60"
                max="220"
                step="10"
                value={searchRadius}
                onChange={(event) => setSearchRadius(Number(event.target.value))}
                disabled={placementMode === "pin"}
              />
            </label>
            <label className={placementMode === "pin" ? "control-muted" : ""}>
              <span>{tr("Path smoothing")}<b>{smoothness}%</b></span>
              <input
                type="range"
                min="20"
                max="95"
                step="1"
                value={smoothness}
                onChange={(event) => setSmoothness(Number(event.target.value))}
                disabled={placementMode === "pin"}
              />
            </label>
            {placementMode === "track" && (
            <div className="toggle-row compact-toggle">
              <span>{tr("Continuous tracking")}<small>{tracking ? "RUNNING" : "PAUSED"}</small></span>
              <button
                className={`toggle ${tracking ? "on" : ""}`}
                onClick={() => {
                  if (!selected) return setToast(tr("Select a target in the canvas first"));
                  setTracking((value) => !value);
                }}
                aria-label={tr("Toggle continuous tracking")}
              ><i /></button>
            </div>
            )}
          </section>

          <section
            className={`panel hud-panel inspector-pane ${
              inspectorTab === "timing" || inspectorTab === "design"
                ? `active ${inspectorTab}`
                : ""
            }`}
          >
            <div className="panel-heading">
              <b>{inspectorTab === "design" ? tr("HUD design & copy") : tr("HUD timing & motion")}</b>
              <small>{inspectorTab === "design" ? "LIVE DESIGN" : "TIMELINE CONTROL"}</small>
            </div>
            <div className="hud-timing-card locator-timing-card timing-control">
              <div>
                <span>{tr("Locator entry time")}</span>
                <b>{formatTime(locatorRevealTime)}</b>
              </div>
              <button
                onClick={() => setLocatorCueTime(currentTime)}
                disabled={!videoReady}
              >
                {tr("Use current frame")}</button>
              <small>{tr("Set when the locator, motion path and origin marker first appear")}</small>
            </div>
            <label className="hud-motion-range cue-time-range timing-control">
              <span>{tr("LOCK IN time")}<b>{formatTime(locatorRevealTime)}</b></span>
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.01"
                value={Math.min(locatorRevealTime, duration || 10)}
                onChange={(event) => setLocatorCueTime(Number(event.target.value))}
                disabled={!videoReady}
              />
              <small>{tr("The locator entrance plays at this time in the source video")}</small>
            </label>
            <div className="hud-subheading timing-control"><span>{tr("Locator entrance")}</span><small>03 MODES</small></div>
            <div className="hud-style-grid locator-style-grid timing-control" role="group" aria-label={tr("Locator entrance")}>
              {([
                ["focus-lock", tr("Focus lock"), "FOCUS LOCK"],
                ["scan-gate", tr("Scan gate"), "SCAN GATE"],
                ["signal-pulse", tr("Signal pulse"), "SIGNAL PULSE"],
              ] as [LocatorAnimation, string, string][]).map(([value, label, code]) => (
                <button
                  key={value}
                  className={locatorAnimation === value ? "active" : ""}
                  onClick={() => {
                    locatorAnimationRef.current = value;
                    setLocatorAnimation(value);
                    window.setTimeout(() => renderFrame(false), 20);
                  }}
                  aria-pressed={locatorAnimation === value}
                >
                  <span className={`hud-style-icon locator-icon ${value}`}><i /><i /><i /><i /></span>
                  <b>{label}</b>
                  <small>{code}</small>
                </button>
              ))}
            </div>
            <div className="hud-timing-card timing-control">
              <div>
                <span>{tr("Data panel entry time")}</span>
                <b>{formatTime(panelRevealTime)}</b>
              </div>
              <button
                onClick={() => setPanelCueTime(currentTime)}
                disabled={!videoReady}
              >
                {tr("Use current frame")}</button>
              <small>{tr("Drag HUD IN on the timeline to separate panel entry from the locator")}</small>
            </div>
            <label className="hud-motion-range timing-control">
              <span>{tr("Reveal sequence")}<b>{panelTransition.toFixed(2)}s</b></span>
              <input
                type="range"
                min="0.35"
                max="1.8"
                step="0.05"
                value={panelTransition}
                onChange={(event) => setPanelTransitionDuration(Number(event.target.value))}
              />
              <small>{tr("Connector grows → panel opens → data appears line by line")}</small>
            </label>
            <div className="toggle-row hud-visibility-toggle design-control">
              <span>{tr("Large HUD type")}<small>{largeHudText ? "LARGE" : "COMPACT"}</small></span>
              <button
                className={`toggle ${largeHudText ? "on" : ""}`}
                onClick={() => setLargeHudText((value) => !value)}
                aria-label={tr("Toggle HUD type size")}
                aria-pressed={largeHudText}
              ><i /></button>
            </div>
            <div className="toggle-row hud-visibility-toggle legacy-offset-control">
              <span>{tr("HUD position offset")}<small>{hudOffsetEnabled ? "OFFSET ACTIVE" : "FOLLOW ORIGIN"}</small></span>
              <button
                className={`toggle ${hudOffsetEnabled ? "on" : ""}`}
                onClick={() => {
                  if (!selected) return setToast(tr("Select a tracking target first"));
                  setHudOffsetEnabled((value) => !value);
                }}
                disabled={!selected}
                aria-label={tr("Toggle HUD position offset")}
                aria-pressed={hudOffsetEnabled}
              ><i /></button>
            </div>
            {hudOffsetEnabled && (
              <div className="hud-offset-editor legacy-offset-control">
                <div className="hud-offset-head">
                  <span>{tr("Relative to the tracking origin")}</span>
                  <button
                    onClick={() => {
                      hudOffsetXRef.current = 0;
                      hudOffsetYRef.current = 0;
                      setHudOffsetX(0);
                      setHudOffsetY(0);
                    }}
                  >
                    RESET
                  </button>
                </div>
                <label>
                  <span>{tr("X axis offset")}<b>{hudOffsetX >= 0 ? "+" : ""}{hudOffsetX}px</b></span>
                  <input
                    type="range"
                    min="-260"
                    max="260"
                    step="2"
                    value={hudOffsetX}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      hudOffsetXRef.current = value;
                      setHudOffsetX(value);
                    }}
                  />
                </label>
                <label>
                  <span>{tr("Y axis offset")}<b>{hudOffsetY >= 0 ? "+" : ""}{hudOffsetY}px</b></span>
                  <input
                    type="range"
                    min="-160"
                    max="160"
                    step="2"
                    value={hudOffsetY}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      hudOffsetYRef.current = value;
                      setHudOffsetY(value);
                    }}
                  />
                </label>
                <small>{tr("The locator and data panel move together. The crosshair stays on the actual tracking origin.")}</small>
              </div>
            )}
            <div className="hud-subheading design-control"><span>{tr("Information style")}</span><small>03 MODES</small></div>
            <div className="hud-style-grid design-control" role="group" aria-label={tr("HUD information style")}>
              {([
                ["open-data", tr("Live coordinates"), "TELEMETRY"],
                ["calibration", tr("Signal scan"), "SIGNAL SCAN"],
                ["code-array", tr("Code array"), "RUNTIME"],
              ] as [HudStyle, string, string][]).map(([value, label, code]) => (
                <button
                  key={value}
                  className={hudStyle === value ? "active" : ""}
                  onClick={() => setHudStyle(value)}
                  aria-pressed={hudStyle === value}
                >
                  <span className={`hud-style-icon ${value}`}><i /><i /><i /><i /></span>
                  <b>{label}</b>
                  <small>{code}</small>
                </button>
              ))}
            </div>
            <div className="hud-copy-editor design-control">
              <div className="hud-copy-head">
                <span>{tr("HUD copy")}</span>
                <button
                  onClick={() => {
                    hudTitleRef.current = DEFAULT_HUD_TITLE;
                    hudCodeLinesRef.current = [...DEFAULT_CODE_LINES];
                    setHudTitle(DEFAULT_HUD_TITLE);
                    setHudCodeLines([...DEFAULT_CODE_LINES]);
                    window.setTimeout(() => renderFrame(false), 20);
                  }}
                >
                  RESET
                </button>
              </div>
              <label>
                <span>{tr("Main title")}<small>MAIN TITLE</small></span>
                <input
                  type="text"
                  value={hudTitle}
                  maxLength={32}
                  placeholder={tr("Enter the HUD title")}
                  onChange={(event) => {
                    const value = event.target.value;
                    hudTitleRef.current = value;
                    setHudTitle(value);
                    window.setTimeout(() => renderFrame(false), 20);
                  }}
                />
              </label>
              <div className={`hud-code-fields ${hudStyle !== "code-array" ? "muted" : ""}`}>
                <span>{tr("CODE ARRAY lines")}<small>{tr("Shown in Code array style")}</small></span>
                {hudCodeLines.map((line, index) => (
                  <input
                    key={index}
                    type="text"
                    value={line}
                    maxLength={46}
                    aria-label={`Code Array line ${index + 1}`}
                    placeholder={`Information line ${index + 1}`}
                    onChange={(event) => {
                      const nextLines = [...hudCodeLines];
                      nextLines[index] = event.target.value;
                      hudCodeLinesRef.current = nextLines;
                      setHudCodeLines(nextLines);
                      window.setTimeout(() => renderFrame(false), 20);
                    }}
                  />
                ))}
              </div>
              <small className="hud-token-help">
                {tr("Dynamic fields:")}{"{x}"} · {"{y}"} · {"{confidence}"} · {"{state}"} · {"{time}"}
              </small>
            </div>
            <div className="toggle-row hud-color-toggle design-control">
              <span>{tr("Custom HUD color")}</span>
              <div>
                <input
                  type="color"
                  value={hudColor}
                  onChange={(event) => setHudColor(event.target.value)}
                  disabled={!customHudColor}
                  aria-label={tr("HUD color")}
                />
                <button
                  className={`toggle ${customHudColor ? "on" : ""}`}
                  onClick={() => setCustomHudColor((value) => !value)}
                  aria-label={tr("Toggle custom HUD color")}
                ><i /></button>
              </div>
            </div>
            <div className="hud-color-presets design-control" aria-label={tr("HUD color presets")}>
              {["#ffffff", "#d8ff6a", "#7de8ff", "#ff8a5b"].map((color) => (
                <button
                  key={color}
                  style={{ background: color }}
                  className={customHudColor && hudColor === color ? "active" : ""}
                  onClick={() => { setHudColor(color); setCustomHudColor(true); }}
                  aria-label={`HUD color ${color}`}
                />
              ))}
            </div>
          </section>

          <section className={`export-panel inspector-pane ${inspectorTab === "export" ? "active" : ""}`}>
            <div className="panel-heading"><b>EXPORT</b><small>AUTO {sourceAspect}</small></div>
            <div className="aspect-switch" role="group" aria-label={tr("Output aspect")}>
              {(["16:9", "9:16"] as OutputAspect[]).map((aspect) => (
                <button
                  key={aspect}
                  className={outputAspect === aspect ? "active" : ""}
                  onClick={() => changeOutputAspect(aspect)}
                  aria-pressed={outputAspect === aspect}
                >
                  <i className={aspect === "16:9" ? "landscape" : "portrait"} />
                  <span>{aspect}</span>
                  <small>{aspect === "16:9" ? "HORIZONTAL" : "VERTICAL"}</small>
                </button>
              ))}
            </div>
            <label>
              <span>{tr("Resolution")}</span>
              <select value={exportSize} onChange={(event) => setExportSize(event.target.value)}>
                {EXPORT_SIZES[outputAspect].map((size) => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{tr("Encoding quality")}</span>
              <select
                value={exportQuality}
                onChange={(event) => setExportQuality(event.target.value as ExportQuality)}
              >
                <option value="maximum">{tr("Maximum detail")}</option>
                <option value="balanced">{tr("High quality · Smaller file")}</option>
              </select>
            </label>
            <label className="export-audio"><span>{uiLanguage === "zh" ? "包含原视频音频" : "Include source audio"}</span><input type="checkbox" checked={includeSourceAudio} onChange={(event) => setIncludeSourceAudio(event.target.checked)} /></label>
            <div className="export-meta">
              <span>{tr("Format")}<b>MP4 / H.264 · 60 FPS</b></span>
              <span>{tr("Aspect")}<b>{outputAspect} · {outputAspect === "9:16" ? "VERTICAL" : "HORIZONTAL"}</b></span>
              <span>{tr("Bitrate")}<b>{Math.round(getExportVideoBitrate(exportWidth, exportHeight, exportQuality) / 1_000_000)} MBPS</b></span>
              <span>{tr("Range")}<b>{tr("Full source · 00:00 → end")}</b></span>
              <span>{tr("Frame")}<b>NO CROP · NO STRETCH</b></span>
            </div>
            {isExporting && (
              <div className="export-progress">
                <span style={{ width: `${exportProgress}%` }} />
                <b>{Math.round(exportProgress)}%</b>
              </div>
            )}
            <button className="export-button" onClick={() => void exportVideo()} disabled={isExporting || !videoReady || !selected}>
              <span>{isExporting ? tr("Compositing MP4…") : tr("Export MP4")}</span>
              <b>{exportTier} · {outputAspect} ↗</b>
            </button>
            <p>{tr("Media is processed locally. Export renders the full source from 0 seconds and follows LOCK IN and HUD IN timing. Aspect changes preserve source proportions, with black padding where needed.")}</p>
            <p>{uiLanguage === "zh" ? "逐帧编码为 60 fps，不依赖屏幕播放速度。默认无声；需要音频时请勾选上方选项。复杂追踪仍需检查目标和遮挡恢复。" : "Frames are encoded at 60 fps, independently of playback speed. Export is silent unless source audio is enabled. Review target identity and occlusion recovery in the downloaded file."}</p>
          </section>
        </aside>
      </section>

      </fieldset>
      {isExporting && <div className="export-lock" role="status"><span>{uiLanguage === "zh" ? "逐帧导出" : "Rendering every frame"} · {Math.round(exportProgress)}%</span><button onClick={() => { cancelExportRef.current = true; }}>{uiLanguage === "zh" ? "取消导出" : "Cancel export"}</button></div>}
      {toast && <div className="toast"><i />{toast}</div>}
    </main>
  );
}
