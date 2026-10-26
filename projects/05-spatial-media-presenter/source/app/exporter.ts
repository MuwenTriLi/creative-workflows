import { ArrayBufferTarget, Muxer } from "mp4-muxer";

export type ExportMedia = {
  title: string;
  tag: string;
  description: string;
  kind: "image" | "video" | "synthetic";
  url?: string;
  visual?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  showcaseTopline?: string;
  showcaseTitle?: string;
  showcaseCaption?: string;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
};

export type HudStyle =
  | "open-data"
  | "calibration"
  | "code-array"
  | "system-write"
  | "signal-rails"
  | "debug-memory";

export type RollStyle = "glide" | "side-flip" | "orbit";
export type SideHudStyle = "fragments" | "code-pulse" | "precision" | "memory-channel" | "signal-nodes" | "minimal";
export type SequenceMode = "roulette" | "step-showcase" | "hook-showcase";
export type StepFlipStyle = "horizontal" | "vertical" | "diagonal";
export type ShowcaseFrameStyle = "corner-lock" | "open-rail" | "split-bracket";
export type ShowcaseTextMotion = "typewriter" | "data-decode" | "scan-read";
export type ExportResolution = "4K" | "6K" | "8K";

export type ExportOptions = {
  aspect: "16:9" | "9:16";
  resolution: ExportResolution;
  rollDuration: number;
  railStartSpeed: number;
  hookWaveFrequency: number;
  flipSpeed: number;
  rollInertia: number;
  blackIntroEnabled: boolean;
  preRollHold: number;
  dissolveDuration: number;
  postRollHold: number;
  returnToBlack: boolean;
  globalScale: number;
  spacing: number;
  arc: number;
  depth: number;
  scan: number;
  inactiveDim: number;
  inactiveOpacity: number;
  cardRadius: number;
  monochrome: boolean;
  brightness: number;
  contrast: number;
  contentFontScale: number;
  showCardHeadlines: boolean;
  showNumbers?: boolean;
  hudScrollSpeed: number;
  hudCornerLength: number;
  hudColor: string;
  showSideHud: boolean;
  sideHudStyle: SideHudStyle;
  sideHudScale: number;
  hudStyle: HudStyle;
  rollStyle: RollStyle;
  sequenceMode: SequenceMode;
  stepFlipStyle: StepFlipStyle;
  stepFlipDuration: number;
  stepCardHold: number;
  showcaseFrameStyle: ShowcaseFrameStyle;
  showcaseTextMotion: ShowcaseTextMotion;
  language: "zh" | "en";
  startIndex: number;
  showcaseStartIndex: number;
  showcaseCount: number;
  targetIndex: number;
  travel: number;
  previewWidth: number;
  previewHeight: number;
  previewCardWidth: number;
  previewFocusWidth: number;
  previewShowcaseTitleFontSize: number;
  previewShowcaseCaptionFontSize: number;
  previewHudBaseFontSize: number;
  previewHudFontFamily: string;
};

const CANVAS_FONT_FAMILY = '"F37 Analog", "Microsoft YaHei", sans-serif';

function sCurve(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

function physicalFlipCurve(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const cosineEase = 0.5 - Math.cos(clamped * Math.PI) * 0.5;
  const core = sCurve(clamped) * 0.58 + cosineEase * 0.42;
  const settlePhase = Math.max(0, Math.min(1, (clamped - 0.78) / 0.22));
  const microSettle = Math.sin(settlePhase * Math.PI) * (1 - settlePhase) * 0.006;
  return Math.max(0, Math.min(1, core + microSettle));
}

export function stepSequenceDuration(itemCount: number, flipDuration: number, holdDuration: number) {
  return Math.max(1, itemCount) * (Math.max(0.1, flipDuration) + Math.max(0, holdDuration));
}

export function stepSequenceState(
  elapsed: number,
  itemCount: number,
  flipDuration: number,
  holdDuration: number,
) {
  const count = Math.max(1, itemCount);
  const flip = Math.max(0.1, flipDuration);
  const hold = Math.max(0, holdDuration);
  const unit = flip + hold;
  const duration = stepSequenceDuration(count, flip, hold);
  const clamped = Math.max(0, Math.min(duration, elapsed));
  const slot = Math.min(count - 1, Math.floor(clamped / Math.max(unit, 0.001)));
  const localTime = clamped - slot * unit;
  const flipProgress = Math.max(0, Math.min(1, localTime / flip));
  const easedFlip = physicalFlipCurve(flipProgress);
  const positionOffset = slot === 0 ? 0 : slot - 1 + easedFlip;
  const isFlipping = localTime < flip && clamped < duration;
  const activeFlipAngle = -78 * (1 - easedFlip);
  const copyOpacity = sCurve(Math.max(0, Math.min(1, (flipProgress - 0.44) / 0.4)));
  const revealedThrough = slot - (flipProgress < 0.9 ? 1 : 0);

  return {
    duration,
    slot,
    flipProgress,
    positionOffset,
    isFlipping,
    activeFlipAngle,
    copyOpacity,
    revealedThrough,
  };
}

export function hookShowcaseDuration(itemCount: number, flipDuration: number, holdDuration: number) {
  const count = Math.max(1, itemCount);
  const flip = Math.max(0.1, flipDuration);
  const hold = Math.max(0, holdDuration);
  return hold + Math.max(0, count - 1) * (flip + hold);
}

export function hookShowcaseState(
  elapsed: number,
  itemCount: number,
  flipDuration: number,
  holdDuration: number,
) {
  const count = Math.max(1, itemCount);
  const flip = Math.max(0.1, flipDuration);
  const hold = Math.max(0, holdDuration);
  const duration = hookShowcaseDuration(count, flip, hold);
  const clamped = Math.max(0, Math.min(duration, elapsed));

  if (count === 1 || clamped < hold) {
    return {
      duration,
      slot: 0,
      flipProgress: 1,
      positionOffset: 0,
      isFlipping: false,
      activeFlipAngle: 0,
      copyOpacity: 1,
      revealedThrough: Number.POSITIVE_INFINITY,
    };
  }

  const unit = flip + hold;
  const afterFocus = Math.max(0, clamped - hold);
  const transitionIndex = Math.min(count - 2, Math.floor(afterFocus / Math.max(unit, 0.001)));
  const localTime = afterFocus - transitionIndex * unit;
  const flipProgress = Math.max(0, Math.min(1, localTime / flip));
  const easedFlip = physicalFlipCurve(flipProgress);
  const slot = transitionIndex + 1;
  const isFlipping = localTime < flip && clamped < duration;
  const copyRevealDuration = flip + Math.min(0.72, hold);
  const copyOpacity = sCurve(Math.max(0, Math.min(1, localTime / Math.max(0.1, copyRevealDuration))));

  return {
    duration,
    slot,
    flipProgress,
    positionOffset: transitionIndex + easedFlip,
    isFlipping,
    activeFlipAngle: 0,
    copyOpacity,
    revealedThrough: Number.POSITIVE_INFINITY,
  };
}

export function showcaseTitle(item: ExportMedia, index: number) {
  return item.showcaseTitle?.trim() || `CHAPTER ${String(index + 1).padStart(2, "0")} / ${item.title}`;
}

export function showcaseTopline(item: ExportMedia, index: number) {
  return item.showcaseTopline?.trim()
    || `DATA ACQUISITION / NODE ${String(index + 1).padStart(2, "0")} / SIGNAL READY`;
}

export function showcaseCaption(item: ExportMedia, index: number) {
  return item.showcaseCaption?.trim() || `${item.tag} · NODE ${String(index + 1).padStart(2, "0")} · VISUAL DATA LINKED`;
}

export function rollMotionOffset(
  progress: number,
  travel: number,
  inertiaPercent: number,
  landingWindow = 0.2,
) {
  const clamped = Math.max(0, Math.min(1, progress));
  const inertia = inertiaPercent / 100;
  let offset = travel * sCurve(clamped);

  const bounceDuration = Math.max(0.14, Math.min(0.32, landingWindow));
  const bounceStart = 1 - bounceDuration;
  if (clamped > bounceStart) {
    const phase = (clamped - bounceStart) / bounceDuration;
    offset += 0.036 * inertia * Math.sin(Math.PI * phase) ** 2;
  }

  return offset;
}

export function hookSweepOffset(
  progress: number,
  travel: number,
  brakingPercent: number,
  startSpeed = 1,
) {
  const clamped = Math.max(0, Math.min(1, progress));
  const braking = Math.max(0, Math.min(1, brakingPercent / 100));
  const speed = Math.max(0.8, Math.min(24, startSpeed));
  const speedRatio = (speed - 0.8) / 23.2;
  const accelerationWindow = 0.16 - speedRatio * 0.045;
  const decelerationShape = 0.45 + braking * 0.35 + speedRatio * 0.35;
  const velocityAt = (time: number) => {
    if (time <= accelerationWindow) {
      return sCurve(time / Math.max(0.001, accelerationWindow));
    }
    const decelerationProgress = (time - accelerationWindow) / Math.max(0.001, 1 - accelerationWindow);
    return Math.pow(Math.max(0, 1 - sCurve(decelerationProgress)), decelerationShape);
  };
  const integrateVelocity = (end: number) => {
    const boundedEnd = Math.max(0, Math.min(1, end));
    if (boundedEnd <= 0) return 0;
    const steps = 40;
    const step = boundedEnd / steps;
    let area = 0;
    let previous = velocityAt(0);
    for (let index = 1; index <= steps; index += 1) {
      const current = velocityAt(index * step);
      area += (previous + current) * step * 0.5;
      previous = current;
    }
    return area;
  };
  const totalArea = Math.max(0.0001, integrateVelocity(1));
  return travel * (integrateVelocity(clamped) / totalArea);
}

export function hookCaptionReveal(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  return sCurve(Math.max(0, Math.min(1, (clamped - 0.46) / 0.48)));
}

type MediaSource = HTMLImageElement | HTMLVideoElement | null;

function waitForImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = url;
  });
}

function waitForVideo(url: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error("视频读取失败"));
    video.src = url;
    video.load();
  });
}

async function loadMedia(items: ExportMedia[]) {
  return Promise.all(
    items.map(async (item): Promise<MediaSource> => {
      if (!item.url) return null;
      if (item.kind === "image") return waitForImage(item.url);
      if (item.kind === "video") return waitForVideo(item.url);
      return null;
    }),
  );
}

function sourceSize(source: MediaSource) {
  if (!source) return { width: 1, height: 1 };
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth || 1, height: source.videoHeight || 1 };
  }
  return { width: source.naturalWidth || 1, height: source.naturalHeight || 1 };
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  source: MediaSource,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!source) return;
  const size = sourceSize(source);
  const scale = Math.max(width / size.width, height / size.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (size.width - sourceWidth) / 2;
  const sourceY = (size.height - sourceHeight) / 2;
  ctx.drawImage(
    source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function drawSynthetic(
  ctx: CanvasRenderingContext2D,
  item: ExportMedia,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  const variants: Record<string, [string, string, string]> = {
    orbital: ["#07090a", "#3a3f43", "#0a0b0c"],
    terrain: ["#111315", "#686d71", "#08090a"],
    machine: ["#050607", "#292d31", "#858b91"],
  };
  const colors = variants[item.visual ?? "orbital"] ?? variants.orbital;
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.55, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = Math.max(1, width / 700);
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    ctx.arc(
      x + width * 0.58,
      y + height * 0.43,
      width * (0.08 + ring * 0.055),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
}

function colorWithAlpha(value: string, alpha: number) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  const red = match ? Number.parseInt(match[1], 16) : 215;
  const green = match ? Number.parseInt(match[2], 16) : 221;
  const blue = match ? Number.parseInt(match[3], 16) : 224;
  return `rgba(${red},${green},${blue},${Math.max(0, Math.min(1, alpha))})`;
}

function drawCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  xDirection: 1 | -1,
  yDirection: 1 | -1,
  size: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + xDirection * size, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + yDirection * size);
  ctx.stroke();
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  index: number,
  total: number,
  globalProgress: number,
  options: ExportOptions,
) {
  const language = options.language;
  const hudStyle = options.hudStyle;
  const unit = Math.min(
    width / Math.max(1, options.previewWidth),
    height / Math.max(1, options.previewHeight),
  );
  const px = (value: number) => value * unit;
  const fontGrow = options.previewHudBaseFontSize - 5;
  const fontSize = (base: number) => Math.max(1, px(base + fontGrow));
  const mono = options.previewHudFontFamily || CANVAS_FONT_FAMILY;
  const hud = (alpha: number) => colorWithAlpha(options.hudColor, alpha);
  ctx.textBaseline = "top";
  const telemetrySeed = Math.floor(globalProgress * 100000);
  const valueAt = (offset: number) => String((telemetrySeed + offset * 719) % 9999).padStart(4, "0");

  const cornerLength = Math.max(12, Math.min(72, options.hudCornerLength));
  const frameSizes: Record<HudStyle, [number, number]> = {
    "open-data": [cornerLength, 12],
    calibration: [cornerLength, cornerLength],
    "code-array": [cornerLength, 18],
    "system-write": [18, cornerLength],
    "signal-rails": [cornerLength, 20],
    "debug-memory": [cornerLength, 10],
  };
  const [cornerWidth, cornerHeight] = frameSizes[hudStyle];
  const cornerX = width * 0.04;
  const cornerY = height * 0.08;
  ctx.strokeStyle = hud(0.42);
  ctx.lineWidth = Math.max(1, unit);
  ctx.beginPath();
  ctx.moveTo(cornerX + px(cornerWidth), cornerY);
  ctx.lineTo(cornerX, cornerY);
  ctx.lineTo(cornerX, cornerY + px(cornerHeight));
  ctx.moveTo(width - cornerX - px(cornerWidth), cornerY);
  ctx.lineTo(width - cornerX, cornerY);
  ctx.lineTo(width - cornerX, cornerY + px(cornerHeight));
  ctx.moveTo(cornerX + px(cornerWidth), height - cornerY);
  ctx.lineTo(cornerX, height - cornerY);
  ctx.lineTo(cornerX, height - cornerY - px(cornerHeight));
  ctx.moveTo(width - cornerX - px(cornerWidth), height - cornerY);
  ctx.lineTo(width - cornerX, height - cornerY);
  ctx.lineTo(width - cornerX, height - cornerY - px(cornerHeight));
  ctx.stroke();

  const reticleOpacity: Record<HudStyle, number> = {
    "open-data": 0.15,
    calibration: 1,
    "code-array": 0.16,
    "system-write": 0.08,
    "signal-rails": 0.06,
    "debug-memory": 0,
  };
  const reticleRatio = hudStyle === "calibration" ? 0.29 : 0.19;
  const reticleMax = hudStyle === "calibration" ? 196 : 132;
  const reticleWidth = Math.min(width * reticleRatio, px(reticleMax));
  if (reticleOpacity[hudStyle] > 0) {
    ctx.save();
    ctx.globalAlpha = reticleOpacity[hudStyle];
    ctx.strokeStyle = hud(0.2);
    ctx.lineWidth = Math.max(1, unit);
    if (hudStyle === "calibration") ctx.setLineDash([px(4), px(4)]);
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.49, reticleWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5 - reticleWidth * 0.7, height * 0.49);
    ctx.lineTo(width * 0.5 + reticleWidth * 0.7, height * 0.49);
    ctx.moveTo(width * 0.5, height * 0.49 - reticleWidth * 0.7);
    ctx.lineTo(width * 0.5, height * 0.49 + reticleWidth * 0.7);
    ctx.stroke();
    [[0.28, 0.36], [0.75, 0.31], [0.39, 0.73]].forEach(([x, y]) => {
      ctx.fillStyle = hud(0.64);
      ctx.fillRect(width * x, height * y, px(3), px(3));
    });
    ctx.restore();
  }

  if (hudStyle === "open-data") {
    ctx.strokeStyle = hud(0.28);
    ctx.lineWidth = Math.max(1, unit);
    const railTop = height * 0.09;
    const railBottom = height * 0.91;
    const railLeft = width * 0.05;
    const railRight = width * 0.95;
    const innerWidth = width * 0.9;
    ctx.beginPath();
    ctx.moveTo(railLeft, railTop);
    ctx.lineTo(railLeft + innerWidth * 0.17, railTop);
    ctx.moveTo(railRight - innerWidth * 0.27, railTop);
    ctx.lineTo(railRight, railTop);
    ctx.moveTo(railLeft, railBottom);
    ctx.lineTo(railLeft + innerWidth * 0.31, railBottom);
    ctx.moveTo(railRight - innerWidth * 0.14, railBottom);
    ctx.lineTo(railRight, railBottom);
    ctx.stroke();
  }

  if (hudStyle === "code-array") {
    const streamX = width * 0.07;
    const streamY = height * 0.13;
    const streamWidth = width * 0.86;
    const streamHeight = height * 0.7;
    const columnWidth = streamWidth * 0.29;
    const scrollOffset = (globalProgress * (options.hudScrollSpeed / 100) * streamHeight * 0.38) % (streamHeight * 0.38);
    ctx.save();
    ctx.beginPath();
    ctx.rect(streamX, streamY, streamWidth, streamHeight);
    ctx.clip();
    ctx.textAlign = "left";
    ctx.font = `${fontSize(3)}px ${mono}`;
    ctx.fillStyle = hud(0.28);
    [0, 0.36, 0.71].forEach((columnOffset, column) => {
      for (let row = 0; row < 18; row += 1) {
        ctx.fillText(
          `SYS.NODE[${String(row).padStart(2, "0")}] :: 0x${valueAt(row + column)} / LINK_OK`,
          streamX + streamWidth * columnOffset,
          streamY - streamHeight * 0.35 + row * (fontSize(3) + px(10)) + scrollOffset,
          columnWidth,
        );
      }
    });
    ctx.restore();
  }

  if (hudStyle === "system-write") {
    const panelWidth = Math.min(width * 0.25, px(180));
    const panelHeight = px(82 + Math.max(0, fontGrow * 2));
    const panelX = width * 0.93 - panelWidth;
    const panelY = height * 0.85 - panelHeight;
    ctx.fillStyle = "rgba(2,4,5,.46)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = hud(0.27);
    ctx.lineWidth = Math.max(1, unit);
    ctx.beginPath();
    ctx.moveTo(panelX, panelY + px(42));
    ctx.lineTo(panelX, panelY);
    ctx.lineTo(panelX + px(34), panelY);
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.font = `${fontSize(4)}px ${mono}`;
    ctx.fillStyle = hud(0.68);
    ctx.fillText(`SYS.WRITE / ${valueAt(0)}`, panelX + px(13), panelY + px(10));
    ctx.textAlign = "right";
    ctx.fillStyle = hud(0.4);
    ctx.font = `${fontSize(3)}px ${mono}`;
    ctx.fillText("WRITE / LIVE", panelX + panelWidth, panelY - px(11));
    ctx.textAlign = "left";
    ctx.font = `${fontSize(4)}px ${mono}`;
    ctx.fillStyle = hud(0.34);
    ["BUFFER MAP", "SECTOR COMMIT", "PACKET VERIFY"].forEach((label, row) => {
      ctx.fillText(`${label} ........ ${valueAt(row + 2)}`, panelX + px(13), panelY + px(28 + row * 15));
    });
    const writeProgress = (globalProgress * (1.4 + options.hudScrollSpeed / 180)) % 1;
    ctx.fillStyle = hud(0.12);
    ctx.fillRect(panelX + px(13), panelY + panelHeight - px(11), panelWidth - px(23), px(2));
    ctx.fillStyle = hud(0.8);
    ctx.fillRect(panelX + px(13), panelY + panelHeight - px(11), (panelWidth - px(23)) * writeProgress, px(2));
  }

  const sideRailOpacity: Record<HudStyle, number> = {
    "open-data": 0.34,
    calibration: 0,
    "code-array": 0.46,
    "system-write": 0,
    "signal-rails": 1,
    "debug-memory": 0.64,
  };
  if (options.showSideHud && sideRailOpacity[hudStyle] > 0) {
    const sideScale = Math.max(0.6, Math.min(1.2, options.sideHudScale));
    const railSpan = Math.min(height * 0.72, height * 0.54 * sideScale);
    const railTop = (height - railSpan) / 2;
    const railBottom = railTop + railSpan;
    const railHeight = railBottom - railTop;
    const railXs = [width * 0.045, width * 0.955];
    const tickPositions = [0.08, 0.22, 0.36, 0.51, 0.65, 0.79, 0.92];
    ctx.save();
    ctx.globalAlpha = sideRailOpacity[hudStyle];
    ctx.lineWidth = Math.max(1, unit);
    railXs.forEach((railX, railIndex) => {
      const direction = railIndex === 0 ? 1 : -1;
      const sideFont = fontSize(3) * sideScale;
      ctx.font = `500 ${sideFont}px ${mono}`;
      ctx.textAlign = railIndex === 0 ? "left" : "right";
      ctx.fillStyle = hud(0.35);
      const railTitles: Record<SideHudStyle, [string, string]> = {
        fragments: ["SIG / CH 01", "CH 02 / SIG"],
        "code-pulse": ["SYS / BUS.PULSE", "PULSE.BUS / SYS"],
        precision: ["CAL / 0.001", "0.001 / CAL"],
        "memory-channel": ["MEM / ADDR", "ADDR / MEM"],
        "signal-nodes": ["NODE / LINK", "LINK / NODE"],
        minimal: ["REF", "REF"],
      };
      ctx.fillText(railTitles[options.sideHudStyle][railIndex], railX, railTop - px(12) * sideScale);
      tickPositions.forEach((tickPosition, tickIndex) => {
        if (options.sideHudStyle === "minimal" && ![0, 3, 6].includes(tickIndex)) return;
        const tickY = railTop + railHeight * tickPosition;
        const pulse = (Math.floor(globalProgress * 18) + tickIndex + railIndex * 2) % 5 === 0;
        const segmentHeight = px(tickIndex % 2 === 0 ? 15 : 9) * sideScale;
        const tickWidth = px(options.sideHudStyle === "code-pulse" ? 13 : options.sideHudStyle === "signal-nodes" ? (tickIndex % 2 ? 12 : 20) : options.sideHudStyle === "minimal" ? 5 : 8) * sideScale;
        ctx.strokeStyle = hud(tickIndex % 3 === 0 ? 0.72 : 0.36);
        ctx.beginPath();
        if (options.sideHudStyle === "memory-channel") {
          const box = px(5) * sideScale;
          ctx.strokeRect(railX - box / 2, tickY - box / 2, box, box);
        } else if (options.sideHudStyle === "signal-nodes") {
          ctx.arc(railX, tickY, px(2.3) * sideScale, 0, Math.PI * 2);
        } else if (options.sideHudStyle === "precision") {
          const precisionWidth = px(tickIndex % 3 === 0 ? 25 : 15) * sideScale;
          ctx.moveTo(railX, tickY);
          ctx.lineTo(railX + direction * precisionWidth, tickY);
        } else {
          if (options.sideHudStyle === "code-pulse") ctx.setLineDash([px(2) * sideScale, px(2) * sideScale]);
          ctx.moveTo(railX, tickY - segmentHeight / 2);
          ctx.lineTo(railX, tickY + segmentHeight / 2);
        }
        ctx.moveTo(railX, tickY);
        ctx.lineTo(railX + direction * tickWidth, tickY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = hud(pulse ? 0.78 : tickIndex % 3 === 0 ? 0.58 : 0.26);
        const label = options.sideHudStyle === "code-pulse"
          ? valueAt(tickIndex + railIndex * 3)
          : options.sideHudStyle === "memory-channel"
            ? `0x${valueAt(tickIndex + railIndex).slice(0, 2)}`
            : tickIndex % 3 === 0
              ? `${44 + tickIndex * 5 + railIndex * 2}`
              : valueAt(tickIndex + railIndex * 3).slice(0, 2);
        ctx.fillText(label, railX + direction * (tickWidth + px(3) * sideScale), tickY - sideFont * 0.48);
      });
      if (options.sideHudStyle !== "minimal") {
        const packetStep = Math.floor(globalProgress * 21 + railIndex * 3) % tickPositions.length;
        const packetY = railTop + railHeight * tickPositions[packetStep];
        ctx.fillStyle = hud(0.88);
        ctx.fillRect(railX - px(1.5) * sideScale, packetY - px(1.5) * sideScale, px(3) * sideScale, px(3) * sideScale);
      }
    });
    ctx.restore();
  }

  if (hudStyle === "debug-memory") {
    const matrixX = width * 0.05;
    const matrixWidth = width * 0.9;
    const matrixHeight = px(42 + Math.max(0, fontGrow * 2));
    const matrixY = height * 0.9 - matrixHeight;
    ctx.fillStyle = "rgba(2,4,5,.42)";
    ctx.fillRect(matrixX, matrixY, matrixWidth, matrixHeight);
    ctx.strokeStyle = hud(0.24);
    ctx.lineWidth = Math.max(1, unit);
    ctx.beginPath();
    ctx.moveTo(matrixX, matrixY + px(28));
    ctx.lineTo(matrixX, matrixY);
    ctx.lineTo(matrixX + width * 0.16, matrixY);
    ctx.moveTo(matrixX + matrixWidth - width * 0.14, matrixY + matrixHeight);
    ctx.lineTo(matrixX + matrixWidth, matrixY + matrixHeight);
    ctx.lineTo(matrixX + matrixWidth, matrixY + matrixHeight - px(24));
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.font = `${fontSize(3)}px ${mono}`;
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const offset = row * 6 + column;
        const pulse = (globalProgress * 5 + offset * 0.08) % 1;
        const alpha = pulse < 0.22 ? 0.62 : offset % 3 === 0 ? 0.46 : 0.24;
        ctx.fillStyle = hud(alpha);
        ctx.fillText(
          `0x${valueAt(offset)} / ${String(offset * 16).padStart(3, "0")}`,
          matrixX + px(11) + column * ((matrixWidth - px(22)) / 6),
          matrixY + px(12) + row * (fontSize(3) + px(5)),
        );
      }
    }
  }

  const showCornerData = hudStyle !== "system-write";
  if (showCornerData) {
    const cornerFont = fontSize(4);
    const drawCornerData = (x: number, y: number, align: CanvasTextAlign, first: string, second: string) => {
      ctx.textAlign = align;
      ctx.font = `${cornerFont}px ${mono}`;
      ctx.fillStyle = hud(0.48);
      ctx.fillText(first, x, y);
      ctx.fillStyle = hud(0.25);
      ctx.fillText(second, x, y + cornerFont * 1.2 + px(4));
    };
    drawCornerData(width * 0.07, height * 0.13, "left", `ID ${valueAt(0)}`, `AX/${valueAt(1)}`);
    drawCornerData(width * 0.93, height * 0.19, "right", `BUF ${valueAt(2)}`, `TR/${valueAt(3)}`);
    drawCornerData(width * 0.08, height * 0.83, "left", `0x${valueAt(4)}`, `SYS.${valueAt(5)}`);
    drawCornerData(width * 0.92, height * 0.87, "right", `FRM ${valueAt(6)}`, `LK/${valueAt(7)}`);
  }

  const commonFont = fontSize(5);
  const topLeftX = px(18);
  const topY = px(16);
  ctx.textAlign = "left";
  ctx.fillStyle = hud(0.72);
  ctx.font = `500 ${fontSize(6)}px ${mono}`;
  ctx.fillText("SRM / PRGM", topLeftX, topY);
  ctx.fillStyle = hud(0.38);
  ctx.font = `${commonFont}px ${mono}`;
  ctx.fillText(language === "zh" ? "空间媒介索引" : "SPATIAL MEDIA INDEX", topLeftX, topY + fontSize(6) * 1.2 + px(4));

  const topRight = width - px(19);
  const rulerWidth = px(105);
  ctx.textAlign = "left";
  ctx.fillStyle = hud(0.38);
  ctx.fillText("ARC", topRight - rulerWidth, topY);
  ctx.textAlign = "right";
  ctx.fillStyle = hud(0.72);
  ctx.font = `${fontSize(9)}px ${mono}`;
  ctx.fillText(`${options.arc}px`, topRight, topY);
  const rulerY = topY + fontSize(9) + px(5);
  ctx.strokeStyle = hud(0.22);
  ctx.lineWidth = Math.max(1, unit);
  ctx.beginPath();
  ctx.moveTo(topRight - rulerWidth, rulerY);
  ctx.lineTo(topRight, rulerY);
  for (let tick = 0; tick <= 12; tick += 1) {
    const tickX = topRight - rulerWidth + tick * (rulerWidth / 12);
    ctx.moveTo(tickX, rulerY);
    ctx.lineTo(tickX, rulerY + px(4));
  }
  ctx.stroke();

  if (options.showSideHud) {
    const sideScale = Math.max(0.6, Math.min(1.2, options.sideHudScale));
    const sideX = width - px(15);
    const sideHeight = height * 0.22 * sideScale;
    const sideTop = height * 0.5 - sideHeight / 2;
    ctx.beginPath();
    for (let tick = 0; tick < 9; tick += 1) {
      const tickY = sideTop + tick * (sideHeight / 8);
      const tickWidth = (tick % 3 === 0 ? 11 : tick % 2 === 0 ? 4 : 7) * sideScale;
      ctx.moveTo(sideX - px(tickWidth), tickY);
      ctx.lineTo(sideX, tickY);
    }
    ctx.stroke();
  }

  const bottomY = height - px(15) - commonFont * 2.4 - px(3);
  ctx.font = `${commonFont}px ${mono}`;
  ctx.textAlign = "left";
  ctx.fillStyle = hud(0.38);
  ctx.fillText(language === "zh" ? "深度" : "DEPTH", px(18), bottomY);
  ctx.fillText(language === "zh" ? "轨道" : "TRACK", px(18), bottomY + commonFont * 1.2 + px(3));
  ctx.fillStyle = hud(0.52);
  ctx.fillText(`${options.depth}.04`, px(18) + px(28), bottomY);
  ctx.fillText(`${options.spacing}.8`, px(18) + px(28), bottomY + commonFont * 1.2 + px(3));

  ctx.textAlign = "center";
  ctx.fillStyle = hud(0.38);
  ctx.fillText(language === "zh" ? "拖动切换" : "DRAG TO NAVIGATE", width * 0.5, height - px(13) - commonFont * 1.2 - px(9));
  const dotGap = px(5);
  const normalDot = px(3);
  const activeDot = px(15);
  const dotWidths = Array.from({ length: total }, (_, dotIndex) => dotIndex === index ? activeDot : normalDot);
  const dotsWidth = dotWidths.reduce((sum, dotWidth) => sum + dotWidth, 0) + Math.max(0, total - 1) * dotGap;
  let dotX = width * 0.5 - dotsWidth / 2;
  dotWidths.forEach((dotWidth, dotIndex) => {
    ctx.fillStyle = hud(dotIndex === index ? 0.95 : 0.28);
    ctx.fillRect(dotX, height - px(13) - normalDot, dotWidth, normalDot);
    dotX += dotWidth + dotGap;
  });

  ctx.textAlign = "right";
  ctx.fillStyle = hud(0.38);
  ctx.fillText(language === "zh" ? "画布" : "CANVAS", width - px(19), bottomY);
  ctx.fillStyle = hud(0.72);
  ctx.fillText(
    options.aspect === "16:9" ? (language === "zh" ? "横向" : "WIDE") : (language === "zh" ? "纵向" : "VERTICAL"),
    width - px(19),
    bottomY + commonFont * 1.2 + px(3),
  );

  ctx.save();
  ctx.globalAlpha = 0.28;
  [px(28), width - px(28)].forEach((centerX, arrowIndex) => {
    ctx.fillStyle = "#080a0b";
    ctx.strokeStyle = hud(0.2);
    ctx.lineWidth = Math.max(1, unit);
    ctx.beginPath();
    ctx.arc(centerX, height * 0.5, px(14), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = hud(0.62);
    ctx.beginPath();
    if (arrowIndex === 0) {
      ctx.moveTo(centerX + px(4), height * 0.5 - px(4));
      ctx.lineTo(centerX - px(2), height * 0.5);
      ctx.lineTo(centerX + px(4), height * 0.5 + px(4));
    } else {
      ctx.moveTo(centerX - px(4), height * 0.5 - px(4));
      ctx.lineTo(centerX + px(2), height * 0.5);
      ctx.lineTo(centerX - px(4), height * 0.5 + px(4));
    }
    ctx.stroke();
  });
  ctx.restore();
  ctx.textAlign = "left";
}

function drawDataField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSeconds: number,
  strength: number,
  speed: number,
  previewWidth: number,
  previewHeight: number,
  previewHudBaseFontSize: number,
  previewHudFontFamily: string,
  hudColor: string,
) {
  if (strength <= 0) return;
  ctx.save();
  const unit = Math.min(
    width / Math.max(1, previewWidth),
    height / Math.max(1, previewHeight),
  );
  const intensity = Math.max(0, Math.min(1, strength / 100));
  const velocity = Math.max(0.35, speed / 100);
  const fontGrow = previewHudBaseFontSize - 5;
  const code = ["FRAME_BUS", "DEPTH_SYNC", "AXM_VECTOR", "NODE_TRACE", "BUFFER_OK", "SIGNAL_LOCK"];
  ctx.font = `${Math.max(1, (3 + fontGrow) * unit)}px ${previewHudFontFamily || CANVAS_FONT_FAMILY}`;
  ctx.textBaseline = "top";
  for (let row = 0; row < 8; row += 1) {
    const y = height * (0.14 + row * 0.0875);
    const x = row % 2 === 0 ? width * (0.12 + (row % 3) * 0.035) : width * 0.7;
    const cycle = Math.max(2.2, 5.6 / velocity);
    const phase = ((timeSeconds + row * 0.47) % cycle + cycle) % cycle / cycle;
    const typeProgress = phase < 0.58
      ? sCurve(phase / 0.58)
      : phase < 0.82
        ? 1
        : 1 - sCurve((phase - 0.82) / 0.18);
    const seed = Math.floor(timeSeconds * 18 + row * 701);
    const value = String(Math.abs(seed) % 9999).padStart(4, "0");
    const lineA = `${code[row % code.length]}[${String(row).padStart(2, "0")}] :: SIGNAL_LOCKED / ${value}`;
    const lineB = `AXM_VECTOR = [${String((seed * 7) % 9999).padStart(4, "0")}, ${String((seed * 13) % 9999).padStart(4, "0")}]`;
    ctx.globalAlpha = intensity * (0.055 + (row % 3) * 0.018);
    ctx.fillStyle = colorWithAlpha(hudColor, 0.9);
    ctx.fillText(lineA.slice(0, Math.floor(lineA.length * typeProgress)), x, y);
    ctx.globalAlpha *= 0.58;
    ctx.fillText(lineB.slice(0, Math.floor(lineB.length * Math.max(0, (typeProgress - 0.24) / 0.76))), x, y + 11 * unit);
    ctx.globalAlpha = intensity * (Math.floor(timeSeconds * 3 + row) % 2 === 0 ? 0.28 : 0.08);
    ctx.fillStyle = colorWithAlpha(hudColor, 0.8);
    ctx.fillRect(x + Math.min(width * 0.19, ctx.measureText(lineA.slice(0, Math.floor(lineA.length * typeProgress))).width + 4 * unit), y, Math.max(1, unit), 6 * unit);
  }
  ctx.restore();
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  opacity: number,
) {
  const spacing = width / 16;
  ctx.fillStyle = `rgba(235,240,243,${opacity})`;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const radius = column === 0 && row === 0 ? width / 100 : width / 180;
      ctx.beginPath();
      ctx.arc(x + column * spacing, y + row * spacing, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawShowcaseFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  unit: number,
  lineReveal: number,
  style: ShowcaseFrameStyle,
) {
  const horizontal = Math.min(width * 0.28, 38 * unit) * lineReveal;
  const vertical = Math.min(height * 0.4, 15 * unit) * lineReveal;
  ctx.strokeStyle = `rgba(239,243,245,${0.3 + lineReveal * 0.56})`;
  ctx.lineWidth = Math.max(1, unit * 0.55);
  ctx.beginPath();

  if (style === "corner-lock") {
    ctx.moveTo(x, y + vertical);
    ctx.lineTo(x, y);
    ctx.lineTo(x + horizontal, y);
    ctx.moveTo(x + width - horizontal * 0.58, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - vertical);
  } else if (style === "open-rail") {
    ctx.moveTo(x, y + height * 0.7);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width * 0.42 * lineReveal, y);
    ctx.moveTo(x + width * (1 - 0.23 * lineReveal), y);
    ctx.lineTo(x + width, y);
    ctx.moveTo(x + width * 0.48, y + height);
    ctx.lineTo(x + width, y + height);
  } else {
    const bracket = Math.min(height * 0.32, 13 * unit) * lineReveal;
    ctx.moveTo(x + horizontal * 0.45, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + bracket);
    ctx.moveTo(x, y + height - bracket);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + horizontal * 0.45, y + height);
    ctx.moveTo(x + width - horizontal * 0.45, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + bracket);
    ctx.moveTo(x + width, y + height - bracket);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - horizontal * 0.45, y + height);
  }

  ctx.stroke();
}

function wrapCanvasCharacters(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  let current = "";
  Array.from(text).forEach((character) => {
    const candidate = current + character;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current.trimEnd());
      current = character.trimStart();
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current.trimEnd());
  return lines.length ? lines : [""];
}

function drawFittedCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseSize: number,
  minSize: number,
  maxLines: number,
  weight: number | string,
  family: string,
  color: string,
) {
  let size = Math.max(minSize, baseSize);
  let lines: string[] = [];
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrapCanvasCharacters(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    size -= Math.max(0.5, baseSize * 0.04);
  }
  ctx.font = `${weight} ${Math.max(minSize, size)}px ${family}`;
  lines = wrapCanvasCharacters(ctx, text, maxWidth);
  const lineHeight = Math.max(minSize * 1.08, Math.max(minSize, size) * 1.08);
  ctx.fillStyle = color;
  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
  });
  return { height: lines.length * lineHeight, size: Math.max(minSize, size) };
}

function drawCardMicroHud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  unit: number,
  focused: boolean,
) {
  const inset = 7 * unit;
  const length = 11 * unit;
  ctx.save();
  ctx.strokeStyle = focused ? "rgba(242,245,246,.82)" : "rgba(232,239,242,.38)";
  ctx.lineWidth = Math.max(1, unit * 0.7);
  drawCorner(ctx, x + inset, y + inset, 1, 1, length);
  drawCorner(ctx, x + width - inset, y + inset, -1, 1, length);
  drawCorner(ctx, x + inset, y + height - inset, 1, -1, length);
  drawCorner(ctx, x + width - inset, y + height - inset, -1, -1, length);
  ctx.fillStyle = focused ? "rgba(239,243,245,.72)" : "rgba(239,243,245,.34)";
  for (let dot = 0; dot < 4; dot += 1) {
    ctx.beginPath();
    ctx.arc(x + 20 * unit + dot * 7 * unit, y + height - 7 * unit, Math.max(0.8, unit), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(232,239,242,.26)";
  ctx.setLineDash([2 * unit, 4 * unit]);
  ctx.beginPath();
  ctx.moveTo(x + width - 8 * unit, y + height * 0.2);
  ctx.lineTo(x + width - 8 * unit, y + height * 0.3);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawShowcaseConnector(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  length: number,
  progress: number,
  direction: 1 | -1,
  lineUnit: number,
) {
  const reveal = Math.max(0, Math.min(1, progress));
  if (reveal <= 0) return;
  const visibleLength = length * reveal;
  const endY = startY + visibleLength * direction;
  const unit = Math.max(0.65, lineUnit * 0.58);
  ctx.save();
  ctx.strokeStyle = `rgba(239,243,245,${0.16 + reveal * 0.54})`;
  ctx.lineWidth = unit;
  ctx.beginPath();
  ctx.moveTo(x, startY);
  ctx.lineTo(x, endY);
  ctx.stroke();
  ctx.fillStyle = `rgba(239,243,245,${0.24 + reveal * 0.5})`;
  const startSize = Math.max(1.4, 2.2 * unit);
  ctx.fillRect(x - startSize / 2, startY - startSize / 2, startSize, startSize);
  if (reveal > 0.72) {
    const squareSize = Math.max(2.5, 4 * unit);
    ctx.fillStyle = "#000";
    ctx.fillRect(x - squareSize / 2, endY - squareSize / 2, squareSize, squareSize);
    ctx.strokeStyle = `rgba(239,243,245,${0.18 + reveal * 0.42})`;
    ctx.strokeRect(x - squareSize / 2, endY - squareSize / 2, squareSize, squareSize);
  }
  ctx.restore();
}

function beginShowcaseTextReveal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number,
  motion: ShowcaseTextMotion,
) {
  const reveal = Math.max(0, Math.min(1, progress));
  ctx.save();
  if (motion === "typewriter") {
    ctx.beginPath();
    ctx.rect(x, y, Math.max(1, width * reveal), height);
    ctx.clip();
  } else if (motion === "scan-read") {
    ctx.beginPath();
    ctx.rect(x, y + height * (1 - reveal), width, Math.max(1, height * reveal));
    ctx.clip();
  } else {
    ctx.globalAlpha *= reveal;
    ctx.translate((1 - reveal) * 2.2, 0);
  }
}

function steppedShowcaseTextReveal(text: string, progress: number, motion: ShowcaseTextMotion) {
  const reveal = Math.max(0, Math.min(1, progress));
  if (motion !== "typewriter") return reveal;
  const characterCount = Math.max(1, Array.from(text).length);
  return Math.max(0, Math.min(1, Math.floor(reveal * (characterCount + 1)) / characterCount));
}

function drawShowcasePanel(
  ctx: CanvasRenderingContext2D,
  item: ExportMedia,
  index: number,
  x: number,
  y: number,
  width: number,
  height: number,
  reveal: number,
  metaProgress: number,
  titleProgress: number,
  captionProgress: number,
  globalProgress: number,
  titleSize: number,
  captionSize: number,
  frameStyle: ShowcaseFrameStyle,
  textMotion: ShowcaseTextMotion,
) {
  const progress = Math.max(0, Math.min(1, reveal));
  if (progress <= 0) return;
  const parentAlpha = ctx.globalAlpha;
  const visibleWidth = Math.max(1, width * progress);
  const lineReveal = sCurve(Math.max(0, Math.min(1, (progress - 0.18) / 0.54)));
  const unit = Math.max(1, width / 210);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x - unit, y - unit, visibleWidth + unit * 2, height + unit * 2);
  ctx.clip();
  ctx.globalAlpha = parentAlpha * progress;
  ctx.fillStyle = `rgba(2,3,4,${0.72 + lineReveal * 0.16})`;
  ctx.fillRect(x, y, width, height);
  drawShowcaseFrame(ctx, x, y, width, height, unit, lineReveal, frameStyle);

  ctx.strokeStyle = `rgba(233,239,241,${0.12 + lineReveal * 0.16})`;
  ctx.lineWidth = Math.max(1, unit * 0.45);
  ctx.beginPath();
  ctx.moveTo(x + width * 0.62, y + 10 * unit);
  ctx.lineTo(x + width - 12 * unit, y + 10 * unit);
  ctx.stroke();
  ctx.fillStyle = `rgba(235,241,243,${0.24 + lineReveal * 0.34})`;
  [0, 1].forEach((dot) => {
    ctx.beginPath();
    ctx.arc(x + width - (22 - dot * 5) * unit, y + 6 * unit, Math.max(0.75, unit * 0.7), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = `${Math.max(5, captionSize * 0.72)}px ${CANVAS_FONT_FAMILY}`;
  ctx.fillText("›", x + width - 12 * unit, y + 3 * unit);

  const scanX = x + ((globalProgress * 4.6) % 1) * width;
  const sheen = ctx.createLinearGradient(scanX - 14 * unit, 0, scanX + 14 * unit, 0);
  sheen.addColorStop(0, "rgba(240,244,246,0)");
  sheen.addColorStop(0.5, "rgba(240,244,246,.18)");
  sheen.addColorStop(1, "rgba(240,244,246,0)");
  ctx.globalAlpha = parentAlpha * progress * lineReveal * 0.4;
  ctx.fillStyle = sheen;
  ctx.fillRect(scanX - 14 * unit, y + unit, 28 * unit, height - 2 * unit);

  const metaText = `DATA PANEL / N-${String(index + 1).padStart(2, "0")}`;
  ctx.save();
  ctx.globalAlpha = parentAlpha * Math.max(0, Math.min(1, metaProgress));
  beginShowcaseTextReveal(
    ctx,
    x + 8 * unit,
    y + 5 * unit,
    width - 16 * unit,
    height - 10 * unit,
    steppedShowcaseTextReveal(metaText, metaProgress, textMotion),
    textMotion,
  );
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(205,216,222,.55)";
  ctx.font = `${Math.max(6, captionSize * 0.88)}px ${CANVAS_FONT_FAMILY}`;
  ctx.fillText(metaText, x + 10 * unit, y + 8 * unit, width - 20 * unit);
  ctx.restore();
  ctx.restore();

  const titleText = showcaseTitle(item, index);
  ctx.save();
  ctx.globalAlpha = parentAlpha * Math.max(0, Math.min(1, titleProgress));
  beginShowcaseTextReveal(
    ctx,
    x + 8 * unit,
    y + 18 * unit,
    width - 16 * unit,
    height - 18 * unit,
    steppedShowcaseTextReveal(titleText, titleProgress, textMotion),
    textMotion,
  );
  const titleBlock = drawFittedCanvasText(
    ctx,
    titleText,
    x + 10 * unit,
    y + 21 * unit,
    width - 20 * unit,
    Math.min(titleSize, 13 * unit),
    Math.max(6, 7 * unit),
    2,
    600,
    CANVAS_FONT_FAMILY,
    "rgba(241,244,245,.94)",
  );
  ctx.restore();
  ctx.restore();

  const captionText = showcaseCaption(item, index);
  ctx.save();
  ctx.globalAlpha = parentAlpha * Math.max(0, Math.min(1, captionProgress));
  beginShowcaseTextReveal(
    ctx,
    x + 8 * unit,
    y + 22 * unit + titleBlock.height,
    width - 16 * unit,
    height - 22 * unit - titleBlock.height,
    steppedShowcaseTextReveal(captionText, captionProgress, textMotion),
    textMotion,
  );
  drawFittedCanvasText(
    ctx,
    captionText,
    x + 10 * unit,
    y + 24 * unit + titleBlock.height,
    width - 20 * unit,
    Math.min(captionSize, 6.2 * unit),
    Math.max(4.5, 4.5 * unit),
    2,
    400,
    CANVAS_FONT_FAMILY,
    "rgba(214,224,229,.62)",
  );
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawShowcaseTopline(
  ctx: CanvasRenderingContext2D,
  item: ExportMedia,
  index: number,
  x: number,
  y: number,
  width: number,
  height: number,
  reveal: number,
  copyProgress: number,
  fontSize: number,
  globalProgress: number,
  textMotion: ShowcaseTextMotion,
) {
  const progress = Math.max(0, Math.min(1, reveal));
  if (progress <= 0) return;
  const parentAlpha = ctx.globalAlpha;
  const unit = Math.max(1, width / 210);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - unit, y - unit, Math.max(1, width * progress) + unit * 2, height + unit * 2);
  ctx.clip();
  ctx.strokeStyle = `rgba(230,237,240,${0.12 + progress * 0.32})`;
  ctx.lineWidth = Math.max(1, unit * 0.5);
  ctx.beginPath();
  ctx.moveTo(x, y + height * 0.52);
  ctx.lineTo(x + width * 0.1 * progress, y + height * 0.52);
  ctx.moveTo(x + width * 0.82, y + height * 0.52);
  ctx.lineTo(x + width, y + height * 0.52);
  ctx.stroke();
  ctx.fillStyle = `rgba(232,239,242,${0.26 + progress * 0.32})`;
  [0, 1, 2].forEach((dot) => {
    ctx.beginPath();
    ctx.arc(x + width * 0.125 + dot * 4.2 * unit, y + height * 0.52, Math.max(0.8, unit * 0.7), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = `rgba(232,239,242,${0.28 + progress * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.18, y + height * 0.28);
  ctx.lineTo(x + width * 0.18 + 4 * unit, y + height * 0.52);
  ctx.lineTo(x + width * 0.18, y + height * 0.76);
  ctx.stroke();
  const toplineText = showcaseTopline(item, index);
  ctx.save();
  ctx.globalAlpha = parentAlpha * Math.max(0, Math.min(1, copyProgress));
  beginShowcaseTextReveal(
    ctx,
    x + width * 0.22,
    y,
    width * 0.57,
    height,
    steppedShowcaseTextReveal(toplineText, copyProgress, textMotion),
    textMotion,
  );
  ctx.fillStyle = "rgba(217,226,230,.66)";
  ctx.font = `${Math.max(6, fontSize)}px ${CANVAS_FONT_FAMILY}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(toplineText, x + width * 0.22, y + height * 0.52, width * 0.57);
  ctx.restore();
  ctx.restore();
  ctx.globalAlpha = parentAlpha * progress;
  ctx.fillStyle = `rgba(239,243,245,${Math.floor(globalProgress * 60) % 2 === 0 ? 0.74 : 0.26})`;
  ctx.fillRect(x + width - 11 * unit, y + height * 0.32, Math.max(1, 1.5 * unit), height * 0.36);
  ctx.restore();
}

function drawCarousel(
  ctx: CanvasRenderingContext2D,
  items: ExportMedia[],
  sources: MediaSource[],
  width: number,
  height: number,
  position: number,
  options: ExportOptions,
  transitionProgress: number,
  mediaReveal: number,
  globalProgress: number,
  stepState: ReturnType<typeof stepSequenceState> | null,
  hookSweepProgress: number,
) {
  const portrait = height > width;
  const previewWidth = Math.max(1, options.previewWidth);
  const previewHeight = Math.max(1, options.previewHeight);
  const outputScaleX = width / previewWidth;
  const outputScaleY = height / previewHeight;
  const cardWidth = Math.max(1, options.previewCardWidth) * outputScaleX;
  const cardHeight = cardWidth / 0.68;
  const spacing = options.spacing * outputScaleX;
  const centerX = width * 0.5;
  const baseCenterY = height * 0.46;
  const perspectiveOriginY = height * 0.45;
  const focusedIndex = ((Math.round(position) % items.length) + items.length) % items.length;
  const modeActive = options.sequenceMode === "roulette" && transitionProgress > 0 && transitionProgress < 1;
  const hookActive = options.sequenceMode === "hook-showcase" && !stepState && transitionProgress > 0 && transitionProgress < 1;
  const sweepCaptionProgress = options.sequenceMode === "hook-showcase" && !stepState
    ? hookCaptionReveal(hookSweepProgress)
    : 0;
  const renderStepState: ReturnType<typeof stepSequenceState> | null = stepState ?? (
    sweepCaptionProgress > 0
      ? {
        duration: 1,
        slot: 0,
        flipProgress: sweepCaptionProgress,
        positionOffset: 0,
        isFlipping: false,
        activeFlipAngle: 0,
        copyOpacity: sweepCaptionProgress,
        revealedThrough: Number.POSITIVE_INFINITY,
      }
      : null
  );
  const candidates = items
    .map((item, index) => {
      let relative = index - position;
      while (relative > items.length / 2) relative -= items.length;
      while (relative < -items.length / 2) relative += items.length;
      return { item, index, relative, distance: Math.abs(relative) };
    })
    .filter((entry) => entry.distance < (portrait ? 2.1 : 3.2))
    .sort((a, b) => b.distance - a.distance);

  candidates.forEach(({ item, index, relative, distance }) => {
    const clampedRelative = Math.max(-1.35, Math.min(1.35, relative));
    const railWaveActive = options.sequenceMode === "hook-showcase"
      || (modeActive && options.rollStyle === "orbit");
    const waveFrequency = options.sequenceMode === "hook-showcase" ? options.hookWaveFrequency : 1;
    const orbitWave = Math.sin(clampedRelative * Math.PI * 0.72 * waveFrequency);
    const orbitDepth = Math.cos(clampedRelative * Math.PI * 0.72 * waveFrequency) - 1;
    const modeY = railWaveActive
      ? orbitWave * (options.sequenceMode === "hook-showcase" ? 46 : 34) * outputScaleY
      : 0;
    const modeZ = railWaveActive
      ? orbitDepth * (options.sequenceMode === "hook-showcase" ? 32 : 24)
      : 0;
    const perspectiveScale = 1100 / (1100 + distance * options.depth - modeZ);
    const panelScale = Math.max(0.7, 1 - distance * 0.085)
      * perspectiveScale
      * options.globalScale
      * (item.scale ?? 1);
    const panelWidth = cardWidth * panelScale;
    const panelHeight = cardHeight * panelScale;
    const modeRotation = modeActive && options.rollStyle === "orbit" ? orbitWave * -3.8 * (Math.PI / 180) : 0;
    const flipAngle = Math.min(82, Math.abs(clampedRelative) * 56 * options.flipSpeed);
    const flipScaleX = modeActive && options.rollStyle === "side-flip"
      ? Math.max(0.14, Math.cos(flipAngle * (Math.PI / 180)))
      : 1;
    const isFocused = index === focusedIndex;
    const sequenceOrder = ((index - options.showcaseStartIndex) % items.length + items.length) % items.length;
    const inShowcaseRange = sequenceOrder < options.showcaseCount;
    const stepTarget = options.sequenceMode !== "roulette"
      && inShowcaseRange
      && sequenceOrder === renderStepState?.slot
      && renderStepState;
    const stepCosine = stepTarget
      ? Math.max(0.14, Math.cos(Math.abs(stepTarget.activeFlipAngle) * (Math.PI / 180)))
      : 1;
    const cardScaleX = options.sequenceMode === "hook-showcase"
      ? 1
      : stepTarget && options.stepFlipStyle === "horizontal"
      ? stepCosine
      : stepTarget && options.stepFlipStyle === "diagonal"
        ? 0.42 + stepCosine * 0.58
        : flipScaleX;
    const cardScaleY = options.sequenceMode === "hook-showcase"
      ? 1
      : stepTarget && options.stepFlipStyle === "vertical"
      ? stepCosine
      : stepTarget && options.stepFlipStyle === "diagonal"
        ? 0.68 + stepCosine * 0.32
        : 1;
    const localX = relative * spacing + (item.offsetX ?? 0) * outputScaleX;
    const localY = (baseCenterY - perspectiveOriginY)
      + distance * options.arc * outputScaleY
      + modeY
      + (item.offsetY ?? 0) * outputScaleY;
    const panelX = centerX + localX * perspectiveScale;
    const panelY = perspectiveOriginY + localY * perspectiveScale;
    const x = -panelWidth / 2;
    const y = -panelHeight / 2;
    const dim = Math.min(1, distance) * (options.inactiveDim / 100);
    const cardOpacity = 1
      - Math.min(1, distance) * (1 - options.inactiveOpacity / 100);
    const radius = Math.min(
      Math.max(0, options.cardRadius * outputScaleX * panelScale),
      Math.min(panelWidth, panelHeight) / 2,
    );
    const reveal = Math.max(0, Math.min(1, mediaReveal));

    ctx.save();
    ctx.translate(panelX, panelY);
    ctx.rotate(modeRotation);
    ctx.scale(cardScaleX, cardScaleY);
    ctx.globalAlpha = cardOpacity;
    ctx.beginPath();
    ctx.roundRect(x, y, panelWidth, panelHeight, radius);
    ctx.clip();

    ctx.fillStyle = "#050607";
    ctx.fillRect(x, y, panelWidth, panelHeight);

    ctx.save();
    ctx.globalAlpha = reveal;
    ctx.filter = [
      `grayscale(${options.monochrome ? 1 : 0})`,
      `brightness(${options.brightness / 100})`,
      `contrast(${options.contrast / 100})`,
    ].join(" ");
    if (sources[index]) drawCover(ctx, sources[index], x, y, panelWidth, panelHeight);
    else drawSynthetic(ctx, item, x, y, panelWidth, panelHeight);
    ctx.restore();

    const cardUnit = outputScaleX;
    ctx.save();
    ctx.globalAlpha *= reveal * 0.58;
    const codeBaseAlpha = ctx.globalAlpha;
    ctx.fillStyle = "rgba(232,239,242,.76)";
    ctx.font = `${Math.max(6, Math.round(5 * cardUnit * options.contentFontScale))}px ${CANVAS_FONT_FAMILY}`;
    if (options.showNumbers !== false) ctx.fillText(`VIS / ${String(index + 1).padStart(3, "0")}`, x + 12 * cardUnit, y + 16 * cardUnit);
    ctx.beginPath();
    ctx.rect(x + 10 * cardUnit, y + panelHeight * 0.18, panelWidth * 0.78, panelHeight * 0.3);
    ctx.clip();
    const dataLines = [
      `const node_${String(index + 1).padStart(2, "0")} = await link("${item.tag}")`,
      `frame.bus[0x${String((index * 977 + Math.floor(globalProgress * 9000)) % 9999).padStart(4, "0")}] => signal.lock()`,
      `vector.map({ depth: ${String((index * 431 + Math.floor(globalProgress * 13000)) % 9999).padStart(4, "0")}, axis: ${String((index * 613 + Math.floor(globalProgress * 7000)) % 9999).padStart(4, "0")} })`,
      `render.commit("${item.title.slice(0, 18)}")`,
      `status = 0b${String((index * 281 + Math.floor(globalProgress * 11000)) % 9999).padStart(4, "0")} // ${item.kind === "video" ? "STREAM_LIVE" : "FRAME_READY"}`,
    ];
    const lineHeight = Math.max(7, 7.8 * cardUnit * options.contentFontScale);
    const codeClock = globalProgress * (7 + options.hudScrollSpeed / 18);
    dataLines.forEach((line, row) => {
      const phase = ((codeClock - row * 0.12) % 1 + 1) % 1;
      const typeProgress = phase < 0.62
        ? sCurve(phase / 0.62)
        : phase < 0.86
          ? 1
          : 1 - sCurve((phase - 0.86) / 0.14);
      ctx.globalAlpha = codeBaseAlpha * (0.48 + (row % 3) * 0.2);
      ctx.fillText(
        line.slice(0, Math.max(0, Math.floor(line.length * typeProgress))),
        x + 12 * cardUnit + (row % 3 === 2 ? 7 * cardUnit : 0),
        y + panelHeight * 0.215 + row * lineHeight,
      );
    });
    ctx.restore();

    if (options.sequenceMode === "step-showcase" && stepState && inShowcaseRange) {
      let sequenceMask = 0;
      if (sequenceOrder > stepState.slot) sequenceMask = 1;
      else if (sequenceOrder === stepState.slot) {
        const revealProgress = Math.max(0, Math.min(1, (stepState.flipProgress - 0.18) / 0.72));
        sequenceMask = 1 - sCurve(revealProgress);
      }
      if (sequenceMask > 0) {
        ctx.fillStyle = `rgba(2,3,3,${sequenceMask})`;
        ctx.fillRect(x - 4, y - 4, panelWidth + 8, panelHeight + 8);
      }
    }

    ctx.fillStyle = `rgba(0,0,0,${dim})`;
    ctx.fillRect(x - 4, y - 4, panelWidth + 8, panelHeight + 8);

    ctx.strokeStyle = stepTarget || ((options.sequenceMode === "roulette" || hookActive) && distance < 0.45)
      ? "rgba(242,245,247,.82)"
      : "rgba(220,228,232,.22)";
    ctx.lineWidth = Math.max(2, width / 2300);
    ctx.beginPath();
    ctx.roundRect(x, y, panelWidth, panelHeight, radius);
    ctx.stroke();
    drawCardMicroHud(ctx, x, y, panelWidth, panelHeight, cardUnit, Boolean(stepTarget || distance < 0.45));

    if (modeActive && options.rollStyle === "orbit") {
      ctx.strokeStyle = "rgba(235,241,243,.18)";
      ctx.beginPath();
      ctx.arc(0, 0, panelWidth * 0.23, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(239,243,245,.52)";
      ctx.fillRect(panelWidth * 0.17, -2, 4, 4);
    }

    if (isFocused && options.showCardHeadlines && options.sequenceMode === "roulette") {
      const unit = width / 1920;
      ctx.save();
      ctx.globalAlpha *= reveal;
      ctx.shadowColor = "rgba(0,0,0,.95)";
      ctx.shadowBlur = 12 * unit;
      ctx.fillStyle = "rgba(222,229,232,.62)";
      ctx.font = `${Math.round(7 * unit * options.contentFontScale)}px ${CANVAS_FONT_FAMILY}`;
      ctx.fillText(item.kind === "video" ? "MOTION SOURCE" : "STATIC SOURCE", x + 24 * unit, y + panelHeight - 126 * unit);
      ctx.fillStyle = "#eff2f3";
      ctx.font = `600 ${Math.round(25 * unit * options.contentFontScale)}px ${CANVAS_FONT_FAMILY}`;
      ctx.fillText(item.title.toUpperCase(), x + 24 * unit, y + panelHeight - 98 * unit);
      ctx.fillStyle = "rgba(222,229,232,.62)";
      ctx.font = `${Math.round(7 * unit * options.contentFontScale)}px ${CANVAS_FONT_FAMILY}`;
      ctx.fillText(item.description, x + 24 * unit, y + panelHeight - 48 * unit);
      drawDots(ctx, x + panelWidth - 82 * unit, y + 28 * unit, 54 * unit, 0.7);
      ctx.restore();
    }
    ctx.restore();

    if (options.sequenceMode !== "roulette" && renderStepState && inShowcaseRange) {
      const revealedBefore = sequenceOrder < renderStepState.slot;
      const activeRevealProgress = options.sequenceMode === "hook-showcase"
        ? renderStepState.copyOpacity
        : renderStepState.flipProgress;
      const revealStage = (start: number, duration: number) => revealedBefore
        ? 1
        : sequenceOrder === renderStepState.slot
          ? sCurve(Math.max(0, Math.min(1, (activeRevealProgress - start) / duration)))
          : 0;
      const isHookShowcase = options.sequenceMode === "hook-showcase";
      const topReveal = revealStage(isHookShowcase ? 0.02 : 0.38, isHookShowcase ? 0.52 : 0.34) * reveal;
      const topCopyReveal = revealStage(isHookShowcase ? 0.14 : 0.5, isHookShowcase ? 0.64 : 0.34);
      const panelReveal = revealStage(isHookShowcase ? 0.04 : 0.52, isHookShowcase ? 0.68 : 0.34) * reveal;
      const panelCopyReveal = revealStage(isHookShowcase ? 0.16 : 0.64, isHookShowcase ? 0.48 : 0.3);
      const panelTitleReveal = revealStage(isHookShowcase ? 0.28 : 0.64, isHookShowcase ? 0.5 : 0.3);
      const panelCaptionReveal = revealStage(isHookShowcase ? 0.54 : 0.7, isHookShowcase ? 0.44 : 0.26);
      const elementUnit = panelWidth / Math.max(1, options.previewCardWidth);
      ctx.save();
      ctx.translate(panelX, panelY);
      ctx.rotate(modeRotation);
      ctx.scale(cardScaleX, cardScaleY);
      const showcaseDistanceOpacity = Math.max(0.18, 1 - distance * 0.3);
      ctx.globalAlpha = cardOpacity * Math.max(0, 1 - dim) * showcaseDistanceOpacity;
      drawShowcaseConnector(
        ctx,
        x + panelWidth * 0.14,
        y,
        15 * elementUnit,
        topCopyReveal,
        -1,
        elementUnit,
      );
      drawShowcaseConnector(
        ctx,
        x + panelWidth * 0.14,
        y + panelHeight,
        20 * elementUnit,
        panelCopyReveal,
        1,
        elementUnit,
      );
      drawShowcaseTopline(
        ctx,
        item,
        index,
        x + panelWidth * 0.14,
        y - 28 * elementUnit,
        panelWidth * 0.72,
        13 * elementUnit,
        topReveal,
        topCopyReveal,
        options.previewShowcaseCaptionFontSize * 0.76 * elementUnit,
        globalProgress,
        options.showcaseTextMotion,
      );
      drawShowcasePanel(
        ctx,
        item,
        index,
        x - panelWidth * 0.01,
        y + panelHeight + 20 * elementUnit,
        panelWidth * 1.02,
        76 * elementUnit,
        panelReveal,
        panelCopyReveal,
        panelTitleReveal,
        panelCaptionReveal,
        globalProgress,
        options.previewShowcaseTitleFontSize * elementUnit,
        options.previewShowcaseCaptionFontSize * elementUnit,
        options.showcaseFrameStyle,
        options.showcaseTextMotion,
      );
      ctx.restore();
    }

    if (isFocused && options.sequenceMode === "roulette") {
      const unit = width / 1920;
      const markerWidth = panelWidth * 0.22;
      const markerX = -markerWidth / 2;
      ctx.save();
      ctx.translate(panelX, panelY);
      ctx.rotate(modeRotation);
      if (options.sequenceMode === "roulette") ctx.scale(flipScaleX, 1);
      ctx.globalAlpha = cardOpacity * reveal;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(238,242,243,.5)";
      ctx.lineWidth = Math.max(2, width / 2600);
      ctx.beginPath();
      ctx.moveTo(markerX, y - 20 * unit);
      ctx.lineTo(markerX + markerWidth, y - 20 * unit);
      ctx.moveTo(markerX, y + panelHeight + 20 * unit);
      ctx.lineTo(markerX + markerWidth, y + panelHeight + 20 * unit);
      ctx.stroke();
      ctx.fillStyle = "rgba(225,232,235,.58)";
      ctx.font = `${Math.round(8 * unit * options.contentFontScale)}px ${CANVAS_FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.fillText(
        `FOCUS / ${item.tag.toUpperCase()}`,
        0,
        y - 42 * unit,
        markerWidth * 0.82,
      );
      ctx.fillText(
        `CONTENT / ${item.title.toUpperCase()}`,
        0,
        y + panelHeight + 30 * unit,
        markerWidth * 0.82,
      );
      ctx.textAlign = "left";
      ctx.restore();
    }
  });
}

export async function exportSequence(
  items: ExportMedia[],
  options: ExportOptions,
  onProgress: (progress: number, status: string) => void,
) {
  if (!("MediaRecorder" in window)) {
    throw new Error("当前浏览器不支持视频导出");
  }

  await document.fonts.load('500 16px "F37 Analog"');
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  const dimensions: Record<ExportResolution, [number, number]> = {
    "4K": [3840, 2160],
    "6K": [5760, 3240],
    "8K": [7680, 4320],
  };
  const [wideWidth, wideHeight] = dimensions[options.resolution];
  canvas.width = options.aspect === "16:9" ? wideWidth : wideHeight;
  canvas.height = options.aspect === "16:9" ? wideHeight : wideWidth;
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx || !canvas.captureStream) {
    throw new Error("当前浏览器无法创建视频画布");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const language = options.language;
  onProgress(0, language === "zh" ? "正在准备媒体" : "PREPARING MEDIA");
  const sources = await loadMedia(items);
  const videoEntries = sources.flatMap((source, index) => source instanceof HTMLVideoElement
    ? [{ video: source, item: items[index] }]
    : []);
  const videos = videoEntries.map(({ video }) => video);
  const trimWindow = (item: ExportMedia, video: HTMLVideoElement) => {
    const duration = Number.isFinite(video.duration) ? video.duration : Math.max(0.1, item.duration ?? 0.1);
    const start = Math.max(0, Math.min(item.trimStart ?? 0, Math.max(0, duration - 0.05)));
    const end = Math.max(start + 0.05, Math.min(item.trimEnd ?? duration, duration));
    return { start, end };
  };
  await Promise.all(
    videoEntries.map(async ({ video, item }) => {
      video.pause();
      video.currentTime = trimWindow(item, video).start;
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }),
  );

  const mp4MimeTypes = [
    "video/mp4;codecs=avc1",
    "video/mp4;codecs=avc1.640033",
    "video/mp4;codecs=avc1.4D0033",
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc3.640033",
    "video/mp4",
  ];
  const supportedMp4Types = mp4MimeTypes.filter((candidate) =>
    MediaRecorder.isTypeSupported(candidate),
  );
  if (!supportedMp4Types.length) {
    throw new Error(
      language === "zh"
        ? "当前浏览器不支持 MP4 / H.264 编码，请使用最新版 Chrome 或 Edge"
        : "MP4 / H.264 encoding is unavailable. Use the latest Chrome or Edge.",
    );
  }
  const exportFps = 60;
  const bitrates: Record<ExportResolution, number> = {
    "4K": 58_000_000,
    "6K": 96_000_000,
    "8K": 144_000_000,
  };

  type GeneratedFrame = { close: () => void };
  type GeneratedFrameWriter = {
    ready: Promise<unknown>;
    write: (frame: GeneratedFrame) => Promise<void>;
    close: () => Promise<void>;
    abort: (reason?: unknown) => Promise<void>;
  };
  type GeneratorLike = MediaStreamTrack & {
    track?: MediaStreamTrack;
    writable: { getWriter: () => GeneratedFrameWriter };
  };
  type FrameRuntime = typeof globalThis & {
    VideoEncoder?: typeof VideoEncoder;
    VideoFrame?: new (
      source: CanvasImageSource,
      init: { timestamp: number; duration: number },
    ) => GeneratedFrame;
    VideoTrackGenerator?: new () => GeneratorLike;
    MediaStreamTrackGenerator?: new (init: { kind: "video" }) => GeneratorLike;
  };
  type ManualFrameTrack = MediaStreamTrack & { requestFrame?: () => void };

  const runtime = globalThis as FrameRuntime;
  let writer: GeneratedFrameWriter | null = null;
  let frameConstructor: FrameRuntime["VideoFrame"] | null = runtime.VideoFrame ?? null;
  let manualTrack: ManualFrameTrack | null = null;
  let manualFrames = false;
  let stream: MediaStream;

  try {
    if (frameConstructor && runtime.VideoTrackGenerator) {
      const generator = new runtime.VideoTrackGenerator();
      writer = generator.writable.getWriter();
      stream = new MediaStream([generator.track ?? generator]);
      manualFrames = true;
    } else if (frameConstructor && runtime.MediaStreamTrackGenerator) {
      const generator = new runtime.MediaStreamTrackGenerator({ kind: "video" });
      writer = generator.writable.getWriter();
      stream = new MediaStream([generator.track ?? generator]);
      manualFrames = true;
    } else {
      throw new Error("FRAME_GENERATOR_UNAVAILABLE");
    }
  } catch {
    writer = null;
    frameConstructor = null;
    const requestedStream = canvas.captureStream(0);
    manualTrack = requestedStream.getVideoTracks()[0] as ManualFrameTrack;
    if (typeof manualTrack?.requestFrame === "function") {
      stream = requestedStream;
      manualFrames = true;
    } else {
      requestedStream.getTracks().forEach((track) => track.stop());
      stream = canvas.captureStream(exportFps);
      manualTrack = null;
    }
  }

  const createMp4Recorder = (targetStream: MediaStream) => {
    for (const candidate of supportedMp4Types) {
      try {
        const candidateRecorder = new MediaRecorder(targetStream, {
          mimeType: candidate,
          videoBitsPerSecond: bitrates[options.resolution],
        });
        return { recorder: candidateRecorder, mimeType: candidate };
      } catch {
        // Try the next real MP4/H.264 profile supported by this device.
      }
    }
    throw new Error(
      language === "zh"
        ? "无法启动 MP4 编码器，请降低分辨率后重试"
        : "Unable to start the MP4 encoder. Try a lower resolution.",
    );
  };

  let recorder: MediaRecorder;
  let mimeType: string;
  try {
    ({ recorder, mimeType } = createMp4Recorder(stream));
  } catch {
    await writer?.abort().catch(() => undefined);
    writer = null;
    frameConstructor = null;
    stream.getTracks().forEach((track) => track.stop());
    stream = canvas.captureStream(exportFps);
    manualTrack = null;
    manualFrames = false;
    ({ recorder, mimeType } = createMp4Recorder(stream));
  }
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  const hookSeconds = options.sequenceMode === "hook-showcase"
    ? Math.max(0.1, options.rollDuration / 1000)
    : 0;
  const showcaseSeconds = options.sequenceMode === "hook-showcase"
    ? hookShowcaseDuration(options.showcaseCount, options.stepFlipDuration, options.stepCardHold)
    : options.sequenceMode === "step-showcase"
      ? stepSequenceDuration(options.showcaseCount, options.stepFlipDuration, options.stepCardHold)
      : 0;
  const rollSeconds = options.sequenceMode === "roulette"
    ? options.rollDuration / 1000
    : hookSeconds + showcaseSeconds;
  const leadSeconds = options.blackIntroEnabled && options.sequenceMode !== "hook-showcase"
    ? Math.max(0, options.preRollHold)
    : 0;
  const tailSeconds = Math.max(0, options.postRollHold);
  const totalDuration = Math.max(0.1, leadSeconds + rollSeconds + tailSeconds);
  const frameCount = Math.max(1, Math.round(totalDuration * exportFps));
  const frameDurationUs = Math.round(1_000_000 / exportFps);

  const stopped = new Promise<{ mimeType: string; extension: string }>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("视频编码失败，请降低分辨率后重试"));
    recorder.onstop = () => {
      videos.forEach((video) => video.pause());
      stream.getTracks().forEach((track) => track.stop());
      const finalType = recorder.mimeType || mimeType;
      if (!finalType.toLowerCase().startsWith("video/mp4")) {
        reject(new Error(language === "zh" ? "编码器未返回有效 MP4 文件" : "The encoder did not return a valid MP4 file."));
        return;
      }
      const extension = "mp4";
      const blob = new Blob(chunks, { type: "video/mp4" });
      if (blob.size < 4096) {
        reject(new Error("编码结果为空，请降低分辨率后重试"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `flipframe-${options.aspect.replace(":", "x")}-${options.resolution.toLowerCase()}-direct.${extension}`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      onProgress(1, language === "zh" ? "导出完成" : "EXPORT COMPLETE");
      resolve({ mimeType: finalType, extension });
    };
  });

  const waitForAnimationFrame = () => new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

  const seekVideoFrame = (
    video: HTMLVideoElement,
    item: ExportMedia,
    timelineTime: number,
  ) => {
    const { start, end } = trimWindow(item, video);
    const clipDuration = Math.max(0.05, end - start);
    // The source files are 30 fps. Quantising source time avoids decoding the
    // same source frame twice while the 60 fps card/HUD animation remains exact.
    const sourceFrameTime = Math.floor(Math.max(0, timelineTime) * 30 + 0.0001) / 30;
    const desiredTime = Math.min(end - 0.001, start + (sourceFrameTime % clipDuration));
    if (
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      && Math.abs(video.currentTime - desiredTime) < 1 / 90
    ) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        video.removeEventListener("seeked", finish);
        resolve();
      };
      const timeout = window.setTimeout(finish, 900);
      video.addEventListener("seeked", finish, { once: true });
      video.currentTime = desiredTime;
    });
  };

  const drawExactFrame = (clamped: number) => {
        const motionElapsed = Math.max(0, clamped - leadSeconds);
        const rawTransition = Math.max(
          0,
          Math.min(1, (clamped - leadSeconds) / Math.max(rollSeconds, 0.001)),
        );
        const hookProgress = options.sequenceMode === "hook-showcase"
          ? Math.max(0, Math.min(1, motionElapsed / Math.max(hookSeconds, 0.001)))
          : 1;
        const showcaseElapsed = options.sequenceMode === "hook-showcase"
          ? motionElapsed - hookSeconds
          : motionElapsed;
        const sequenceState = options.sequenceMode === "hook-showcase" && showcaseElapsed >= 0
          ? hookShowcaseState(
            showcaseElapsed,
            options.showcaseCount,
            options.stepFlipDuration,
            options.stepCardHold,
          )
          : options.sequenceMode === "step-showcase" && showcaseElapsed >= 0
            ? stepSequenceState(
              showcaseElapsed,
              options.showcaseCount,
              options.stepFlipDuration,
              options.stepCardHold,
            )
            : null;
        const position = options.sequenceMode === "hook-showcase" && !sequenceState
          ? options.startIndex + hookSweepOffset(
            hookProgress,
            options.travel,
            options.rollInertia,
            options.railStartSpeed,
          )
          : sequenceState
            ? options.showcaseStartIndex + sequenceState.positionOffset
            : options.startIndex + rollMotionOffset(
            rawTransition,
            options.travel,
            options.rollInertia,
            options.rollStyle === "side-flip" ? 0.3 : 0.22,
          );
        const displayIndex = rawTransition >= 1
          ? options.targetIndex
          : ((Math.round(position) % items.length) + items.length) % items.length;

        const dissolveSeconds = Math.max(
          0.05,
          Math.min(options.dissolveDuration, rollSeconds),
        );
        let mediaReveal = options.sequenceMode === "step-showcase"
          ? clamped < leadSeconds ? 0 : 1
          : options.sequenceMode === "hook-showcase"
            ? 1
          : options.blackIntroEnabled
            ? sCurve(Math.max(0, Math.min(1, (clamped - leadSeconds) / dissolveSeconds)))
            : 1;
        if (clamped >= leadSeconds + rollSeconds) mediaReveal = 1;
        if (options.returnToBlack && clamped >= leadSeconds + rollSeconds) {
          const holdElapsed = clamped - leadSeconds - rollSeconds;
          const fadeDuration = Math.min(dissolveSeconds, Math.max(tailSeconds, 0.001));
          const fadeStart = Math.max(0, tailSeconds - fadeDuration);
          const fadeProgress = Math.max(
            0,
            Math.min(1, (holdElapsed - fadeStart) / Math.max(fadeDuration, 0.001)),
          );
          mediaReveal = 1 - sCurve(fadeProgress);
        }

        drawGrid(ctx, canvas.width, canvas.height);
        drawDataField(
          ctx,
          canvas.width,
          canvas.height,
          clamped,
          options.scan,
          options.hudScrollSpeed,
          options.previewWidth,
          options.previewHeight,
          options.previewHudBaseFontSize,
          options.previewHudFontFamily,
          options.hudColor,
        );
        drawCarousel(
          ctx,
          items,
          sources,
          canvas.width,
          canvas.height,
          position,
          options,
          rawTransition,
          mediaReveal,
          clamped / totalDuration,
          sequenceState,
          hookProgress,
        );
        drawHud(
          ctx,
          canvas.width,
          canvas.height,
          displayIndex,
          items.length,
          clamped / totalDuration,
          options,
        );
  };

  const directEncoder = runtime.VideoEncoder;
  if (directEncoder && runtime.VideoFrame) {
    let encoder: VideoEncoder | null = null;
    try {
      const configCandidates: VideoEncoderConfig[] = [
        {
          codec: "avc1.640034",
          width: canvas.width,
          height: canvas.height,
          bitrate: bitrates[options.resolution],
          framerate: exportFps,
          hardwareAcceleration: "prefer-hardware",
          latencyMode: "quality",
          avc: { format: "avc" },
        },
        {
          codec: "avc1.640033",
          width: canvas.width,
          height: canvas.height,
          bitrate: bitrates[options.resolution],
          framerate: exportFps,
          hardwareAcceleration: "prefer-hardware",
          latencyMode: "quality",
          avc: { format: "avc" },
        },
        {
          codec: "avc1.4D0034",
          width: canvas.width,
          height: canvas.height,
          bitrate: bitrates[options.resolution],
          framerate: exportFps,
          hardwareAcceleration: "prefer-hardware",
          latencyMode: "quality",
          avc: { format: "avc" },
        },
      ];
      let supportedConfig: VideoEncoderConfig | null = null;
      for (const candidate of configCandidates.flatMap(c=>[c,{...c,hardwareAcceleration:"no-preference" as HardwareAcceleration}])) {
        try {
          const support = await directEncoder.isConfigSupported(candidate);
          if (support.supported) {
            supportedConfig = support.config ?? candidate;
            break;
          }
        } catch {
          // Try the next H.264 profile supported by the device.
        }
      }

      if (supportedConfig) {
        videos.forEach((video) => video.pause());

        const target = new ArrayBufferTarget();
        const muxer = new Muxer({
          target,
          video: {
            codec: "avc",
            width: canvas.width,
            height: canvas.height,
            frameRate: exportFps,
          },
          fastStart: { expectedVideoChunks: frameCount },
        });
        let encodingError: Error | null = null;
        encoder = new directEncoder({
          output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
          error: (error) => {
            encodingError = error instanceof Error ? error : new Error(String(error));
          },
        });
        encoder.configure(supportedConfig);

        for (let frame = 0; frame < frameCount; frame += 1) {
          if (encodingError) throw encodingError;
          const frameTime = Math.min(totalDuration, frame / exportFps);
          await Promise.all(videoEntries.map(({ video, item }) =>
            seekVideoFrame(video, item, frameTime),
          ));
          drawExactFrame(frameTime);

          while (encoder.encodeQueueSize > 3) {
            await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
            if (encodingError) throw encodingError;
          }
          const videoFrame = new VideoFrame(canvas, {
            timestamp: Math.round(frameTime * 1_000_000),
            duration: frameDurationUs,
          });
          encoder.encode(videoFrame, { keyFrame: frame % (exportFps * 2) === 0 });
          videoFrame.close();

          const completedFrames = frame + 1;
          if (
            completedFrames === 1
            || completedFrames === frameCount
            || completedFrames % Math.max(1, Math.round(exportFps / 4)) === 0
          ) {
            onProgress(
              completedFrames / frameCount,
              language === "zh"
                ? `60 FPS 离线渲染 ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} 秒`
                : `60 FPS OFFLINE ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} SEC`,
            );
          }
        }

        await encoder.flush();
        if (encodingError) throw encodingError;
        encoder.close();
        encoder = null;
        muxer.finalize();
        const blob = new Blob([target.buffer], { type: "video/mp4" });
        if (blob.size < 4096) throw new Error("编码结果为空，请降低分辨率后重试");
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `flipframe-${options.aspect.replace(":", "x")}-${options.resolution.toLowerCase()}-60fps.mp4`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
        await writer?.abort().catch(() => undefined);
        writer = null;
        stream.getTracks().forEach((track) => track.stop());
        onProgress(1, language === "zh" ? "导出完成" : "EXPORT COMPLETE");
        return { mimeType: "video/mp4", extension: "mp4" };
      }
    } catch (error) {
      console.error("Direct MP4 encoder failed",error);
      try {
        encoder?.close();
      } catch {
        // Continue with the real-time MP4 compatibility path below.
      }
      encoder = null;
      videos.forEach((video) => video.pause());
      // The direct encoder is optional; the real-time path below keeps exact
      // wall-clock motion even when WebCodecs is unavailable on the device.
    }
  }

  recorder.start(250);
  try {
    if (writer && frameConstructor) {
      // Preferred path: render a deterministic 60 fps frame sequence. Every
      // frame carries its own timestamp, so a heavy 4K draw can take longer to
      // calculate without making the exported animation play more slowly.
      videos.forEach((video) => video.pause());
      for (let frame = 0; frame < frameCount; frame += 1) {
        const frameTime = Math.min(totalDuration, frame / exportFps);
        await Promise.all(videoEntries.map(({ video, item }) =>
          seekVideoFrame(video, item, frameTime),
        ));
        drawExactFrame(frameTime);
        const videoFrame = new frameConstructor(canvas, {
          timestamp: Math.round(frameTime * 1_000_000),
          duration: frameDurationUs,
        });
        await writer.ready;
        await writer.write(videoFrame);
        videoFrame.close();
        const completedFrames = frame + 1;
        if (
          completedFrames === 1
          || completedFrames === frameCount
          || completedFrames % Math.max(1, Math.round(exportFps / 4)) === 0
        ) {
          onProgress(
            completedFrames / frameCount,
            language === "zh"
              ? `固定时间戳渲染 ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} 秒`
              : `TIMESTAMP RENDER ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} SEC`,
          );
        }
      }

      await writer.close().catch(() => undefined);
      writer = null;
    } else {
      // Compatibility path: use the real recording clock instead of a frame
      // counter. If a 4K frame is expensive, we skip directly to the correct
      // timeline time rather than stretching the animation into slow motion.
      await Promise.all(videoEntries.map(async ({ video, item }) => {
        video.currentTime = trimWindow(item, video).start;
        await video.play().catch(() => undefined);
      }));
      drawExactFrame(0);
      manualTrack?.requestFrame?.();
      const recordingStartedAt = performance.now();
      let lastProgressFrame = -1;
      while (true) {
        await waitForAnimationFrame();
        const frameTime = Math.min(
          totalDuration,
          Math.max(0, (performance.now() - recordingStartedAt) / 1000),
        );
        videoEntries.forEach(({ video, item }) => {
          const { start, end } = trimWindow(item, video);
          if (video.currentTime < start - 0.025 || video.currentTime >= end - 0.025) {
            video.currentTime = start;
            void video.play().catch(() => undefined);
          }
        });
        drawExactFrame(frameTime);
        if (manualFrames) manualTrack?.requestFrame?.();

        const progressFrame = Math.min(frameCount, Math.round(frameTime * exportFps));
        if (
          progressFrame !== lastProgressFrame
          && (
            progressFrame === 0
            || progressFrame === frameCount
            || progressFrame % Math.max(1, Math.round(exportFps / 4)) === 0
          )
        ) {
          lastProgressFrame = progressFrame;
          onProgress(
            frameTime / totalDuration,
            language === "zh"
              ? `实时同步渲染 ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} 秒`
              : `REAL-TIME SYNC ${options.resolution} · ${frameTime.toFixed(1)} / ${totalDuration.toFixed(1)} SEC`,
          );
        }
        if (frameTime >= totalDuration) break;
      }
    }

    await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
    try {
      recorder.requestData();
    } catch {
      // Some encoders only flush on stop.
    }
    await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
    if (recorder.state !== "inactive") recorder.stop();
  } catch (error) {
    await writer?.abort(error).catch(() => undefined);
    videos.forEach((video) => video.pause());
    if (recorder.state !== "inactive") recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    throw error instanceof Error ? error : new Error("视频逐帧渲染失败");
  }

  return stopped;
}
