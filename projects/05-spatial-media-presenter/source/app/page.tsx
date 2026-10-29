"use client";

import {
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  exportSequence,
  hookCaptionReveal,
  hookShowcaseDuration,
  hookShowcaseState,
  hookSweepOffset,
  rollMotionOffset,
  showcaseCaption,
  showcaseTopline,
  showcaseTitle,
  stepSequenceDuration,
  stepSequenceState,
  type ExportResolution,
  type HudStyle,
  type RollStyle,
  type SequenceMode,
  type SideHudStyle,
  type ShowcaseFrameStyle,
  type ShowcaseTextMotion,
  type StepFlipStyle,
} from "./exporter";

import { SAMPLE_SET, SAVED_BOARD_STORAGE, needsSampleUpgrade } from "./sample-project";

const PlaybackContext = createContext(true);

type MediaKind = "image" | "video" | "synthetic";
type AspectMode = "16:9" | "9:16";
type PortalMode = "import" | "export" | null;
type Language = "zh" | "en";
type ControlSection = "motion" | "cards" | "look" | "hud" | "text";

type TimelinePlan = {
  startIndex: number;
  showcaseStartIndex: number;
  showcaseCount: number;
  targetIndex: number;
  travel: number;
};

type MediaItem = {
  id: string;
  sourceKey?: string;
  title: string;
  tag: string;
  description: string;
  kind: MediaKind;
  url?: string;
  visual?: "orbital" | "terrain" | "machine";
  uploaded?: boolean;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  showcaseTopline?: string;
  showcaseTitle?: string;
  showcaseCaption?: string;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
  cacheKey?: string;
};

type AssetTextKey =
  | "title"
  | "tag"
  | "description"
  | "showcaseTopline"
  | "showcaseTitle"
  | "showcaseCaption";

type AssetTextProfile = Partial<Pick<MediaItem, AssetTextKey>>;

type MotionParams = {
  speed: number;
  spacing: number;
  arc: number;
  depth: number;
  hold: number;
  scan: number;
  inactiveDim: number;
  inactiveOpacity: number;
  cardRadius: number;
  brightness: number;
  contrast: number;
  uiFontScale: number;
  contentFontScale: number;
  globalScale: number;
  rollDuration: number;
  railStartSpeed: number;
  hookWaveFrequency: number;
  flipSpeed: number;
  rollInertia: number;
  hudScrollSpeed: number;
  hudCornerLength: number;
  hudColor: string;
  sideHudScale: number;
  preRollHold: number;
  dissolveDuration: number;
  postRollHold: number;
  stepFlipDuration: number;
  stepCardHold: number;
};

type MotionStyle = CSSProperties & Record<`--${string}`, string | number>;

const INITIAL_ITEMS: MediaItem[] = [
  {
    "id": "portfolio-5",
    "title": "IMMERSIVE LANDSCAPE",
    "tag": "MOTION STUDY",
    "description": "Immersive landscape",
    "kind": "video",
    "url": "/portfolio-media/work-5.mp4",
    "showcaseTitle": "Immersive landscape",
    "showcaseTopline": "STUDY / 05",
    "showcaseCaption": "Muwen Li · selected visual work",
    "duration": 6.0,
    "trimStart": 0,
    "trimEnd": 6.0
  },
  {
    "id": "portfolio-6",
    "title": "SPATIAL LINEWORK",
    "tag": "MOTION STUDY",
    "description": "Spatial linework",
    "kind": "video",
    "url": "/portfolio-media/work-6.mp4",
    "showcaseTitle": "Spatial linework",
    "showcaseTopline": "STUDY / 06",
    "showcaseCaption": "Muwen Li · selected visual work",
    "duration": 8.466667,
    "trimStart": 0,
    "trimEnd": 8.466667
  },
  {
    "id": "portfolio-7",
    "title": "PORTAL INSTALLATION",
    "tag": "MOTION STUDY",
    "description": "Portal installation",
    "kind": "video",
    "url": "/portfolio-media/work-7.mp4",
    "showcaseTitle": "Portal installation",
    "showcaseTopline": "STUDY / 07",
    "showcaseCaption": "Muwen Li · selected visual work",
    "duration": 6.0,
    "trimStart": 0,
    "trimEnd": 6.0
  },
  {
    "id": "portfolio-8",
    "title": "FLUID INSTALLATION",
    "tag": "MOTION STUDY",
    "description": "Fluid installation",
    "kind": "video",
    "url": "/portfolio-media/work-8.mp4",
    "showcaseTitle": "Fluid installation",
    "showcaseTopline": "STUDY / 08",
    "showcaseCaption": "Muwen Li · selected visual work",
    "duration": 6.733333,
    "trimStart": 0,
    "trimEnd": 6.733333
  },
  {
    "id": "portfolio-10",
    "title": "ARCHITECTURAL TRACE",
    "tag": "VISUAL STUDY",
    "description": "Architectural trace",
    "kind": "image",
    "url": "/portfolio-media/work-10.jpg",
    "showcaseTitle": "Architectural trace",
    "showcaseTopline": "STUDY / 10",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-12",
    "title": "SIGNAL INTERFACE",
    "tag": "VISUAL STUDY",
    "description": "Signal interface",
    "kind": "image",
    "url": "/portfolio-media/work-12.jpg",
    "showcaseTitle": "Signal interface",
    "showcaseTopline": "STUDY / 12",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-16",
    "title": "LIGHT FIELD",
    "tag": "VISUAL STUDY",
    "description": "Light field",
    "kind": "image",
    "url": "/portfolio-media/work-16.jpg",
    "showcaseTitle": "Light field",
    "showcaseTopline": "STUDY / 15",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-11",
    "title": "LANDSCAPE TEXTURE",
    "tag": "VISUAL STUDY",
    "description": "Landscape texture",
    "kind": "image",
    "url": "/portfolio-media/work-11.jpg",
    "showcaseTitle": "Landscape texture",
    "showcaseTopline": "STUDY / 11",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-1",
    "title": "WORLDBUILDING STUDY",
    "tag": "VISUAL STUDY",
    "description": "Worldbuilding study",
    "kind": "image",
    "url": "/portfolio-media/work-1.jpg",
    "showcaseTitle": "Worldbuilding study",
    "showcaseTopline": "STUDY / 01",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-2",
    "title": "PORTAL COMPOSITION",
    "tag": "VISUAL STUDY",
    "description": "Portal composition",
    "kind": "image",
    "url": "/portfolio-media/work-2.jpg",
    "showcaseTitle": "Portal composition",
    "showcaseTopline": "STUDY / 02",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-3",
    "title": "SCULPTURE STUDY",
    "tag": "VISUAL STUDY",
    "description": "Sculpture study",
    "kind": "image",
    "url": "/portfolio-media/work-3.jpg",
    "showcaseTitle": "Sculpture study",
    "showcaseTopline": "STUDY / 03",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-4",
    "title": "MATERIAL AND FORM",
    "tag": "VISUAL STUDY",
    "description": "Material and form",
    "kind": "image",
    "url": "/portfolio-media/work-4.jpg",
    "showcaseTitle": "Material and form",
    "showcaseTopline": "STUDY / 04",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-9",
    "title": "TUNNEL PERSPECTIVE",
    "tag": "VISUAL STUDY",
    "description": "Tunnel perspective",
    "kind": "image",
    "url": "/portfolio-media/work-9.jpg",
    "showcaseTitle": "Tunnel perspective",
    "showcaseTopline": "STUDY / 09",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-13",
    "title": "TERRAIN STUDY",
    "tag": "VISUAL STUDY",
    "description": "Terrain study",
    "kind": "image",
    "url": "/portfolio-media/work-13.jpg",
    "showcaseTitle": "Terrain study",
    "showcaseTopline": "STUDY / 13",
    "showcaseCaption": "Muwen Li · selected visual work"
  },
  {
    "id": "portfolio-14",
    "title": "STRUCTURE IN TERRAIN",
    "tag": "VISUAL STUDY",
    "description": "Structure in terrain",
    "kind": "image",
    "url": "/portfolio-media/work-14.jpg",
    "showcaseTitle": "Structure in terrain",
    "showcaseTopline": "STUDY / 14",
    "showcaseCaption": "Muwen Li · selected visual work"
  }
];

const DEFAULT_PARAMS: MotionParams = {
  speed: 760,
  spacing: 220,
  arc: 9,
  depth: 84,
  hold: 3.4,
  scan: 42,
  inactiveDim: 60,
  inactiveOpacity: 100,
  cardRadius: 0,
  brightness: 100,
  contrast: 100,
  uiFontScale: 1.45,
  contentFontScale: 1.4,
  globalScale: 1.05,
  rollDuration: 4000,
  railStartSpeed: 12,
  hookWaveFrequency: 1,
  flipSpeed: 1,
  rollInertia: 62,
  hudScrollSpeed: 180,
  hudCornerLength: 34,
  hudColor: "#ffffff",
  sideHudScale: 1,
  preRollHold: 0.5,
  dissolveDuration: 0.82,
  postRollHold: 1.2,
  stepFlipDuration: 0.45,
  stepCardHold: 0.9,
};

const ASSET_TEXT_PROFILE_STORAGE = "spectra:asset-text-profiles:v1";
const PROJECT_STATE_STORAGE = "spectra:project-state:v1";
const MEDIA_CACHE_DATABASE = "spectra-media-cache-v1";
const MEDIA_CACHE_STORE = "files";

type PersistedProjectState = {
  sampleSet?: string;
  showNumbers?: boolean;
  items: MediaItem[];
  activeIndex: number;
  language: Language;
  monochrome: boolean;
  aspect: AspectMode;
  params: MotionParams;
  autoplay: boolean;
  blackIntroEnabled: boolean;
  returnToBlack: boolean;
  showCardHeadlines: boolean;
  hudStyle: HudStyle;
  showSideHud: boolean;
  sideHudStyle: SideHudStyle;
  rollStyle: RollStyle;
  sequenceMode: SequenceMode;
  stepFlipStyle: StepFlipStyle;
  showcaseFrameStyle: ShowcaseFrameStyle;
  showcaseTextMotion: ShowcaseTextMotion;
  exportResolution: ExportResolution;
  rollTargetId: string;
  showcaseStartId?: string;
  showcaseEndId?: string;
};

function openMediaCache() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(MEDIA_CACHE_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(MEDIA_CACHE_STORE)) {
        database.createObjectStore(MEDIA_CACHE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("MEDIA_CACHE_OPEN_FAILED"));
  });
}

async function writeCachedMedia(cacheKey: string, file: File) {
  const database = await openMediaCache();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(MEDIA_CACHE_STORE, "readwrite");
    transaction.objectStore(MEDIA_CACHE_STORE).put(file, cacheKey);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("MEDIA_CACHE_WRITE_FAILED"));
  });
  database.close();
}

async function readCachedMedia(cacheKey: string) {
  const database = await openMediaCache();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction(MEDIA_CACHE_STORE, "readonly")
      .objectStore(MEDIA_CACHE_STORE)
      .get(cacheKey);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error ?? new Error("MEDIA_CACHE_READ_FAILED"));
  });
  database.close();
  return blob;
}

async function deleteCachedMedia(cacheKey: string) {
  const database = await openMediaCache();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(MEDIA_CACHE_STORE, "readwrite");
    transaction.objectStore(MEDIA_CACHE_STORE).delete(cacheKey);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("MEDIA_CACHE_DELETE_FAILED"));
  });
  database.close();
}

function readProjectState(): PersistedProjectState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(PROJECT_STATE_STORAGE);
    return stored ? JSON.parse(stored) as PersistedProjectState : null;
  } catch {
    return null;
  }
}

function linkedMotionTextProfile(title: string): AssetTextProfile {
  return {
    title,
    tag: "MOTION CAPTURE",
    description: "Visual data linked",
    showcaseTitle: title,
  };
}

const BUILT_IN_ASSET_TEXT_PROFILES: Array<{
  aliases: string[];
  profile: AssetTextProfile;
}> = [
  {
    aliases: ["residential tower"],
    profile: linkedMotionTextProfile("RESIDENTIAL TOWER"),
  },
  {
    aliases: ["press manufacturing"],
    profile: linkedMotionTextProfile("PRESS MANUFACTURING"),
  },
  {
    aliases: ["parametric housing"],
    profile: linkedMotionTextProfile("PARAMETRIC HOUSING"),
  },
  {
    aliases: ["structure tower"],
    profile: linkedMotionTextProfile("STRUCTURE TOWER"),
  },
  {
    aliases: ["data center", "data centre"],
    profile: linkedMotionTextProfile("DATA CENTER"),
  },
  {
    aliases: ["stadium"],
    profile: linkedMotionTextProfile("STADIUM"),
  },
  {
    aliases: ["residential"],
    profile: linkedMotionTextProfile("RESIDENTIAL"),
  },
];

function assetSourceKey(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function builtInAssetTextProfile(sourceKey: string): AssetTextProfile {
  return BUILT_IN_ASSET_TEXT_PROFILES.find(({ aliases }) =>
    aliases.some((alias) => sourceKey.includes(alias)),
  )?.profile ?? {};
}

function readAssetTextProfiles(): Record<string, AssetTextProfile> {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(ASSET_TEXT_PROFILE_STORAGE);
    return stored ? JSON.parse(stored) as Record<string, AssetTextProfile> : {};
  } catch {
    return {};
  }
}

function readAssetTextProfile(sourceKey: string): AssetTextProfile {
  return {
    ...builtInAssetTextProfile(sourceKey),
    ...(readAssetTextProfiles()[sourceKey] ?? {}),
  };
}

function saveAssetTextProfile(sourceKey: string, patch: AssetTextProfile) {
  if (typeof window === "undefined" || !sourceKey) return;
  try {
    const profiles = readAssetTextProfiles();
    profiles[sourceKey] = { ...(profiles[sourceKey] ?? {}), ...patch };
    window.localStorage.setItem(ASSET_TEXT_PROFILE_STORAGE, JSON.stringify(profiles));
  } catch {
    // Device storage can be unavailable in private browsing; the current session still updates.
  }
}

const COPY = {
  zh: {
    ready: "系统就绪",
    import: "导入",
    export: "导出",
    mediaNodes: "01 / 媒体节点",
    visualArchive: "视觉档案",
    importNew: "导入新素材",
    importHint: "图片 / 视频 / 支持多选",
    assetAdjust: "当前素材微调",
    assetScale: "素材大小",
    assetX: "水平位置",
    assetY: "垂直位置",
    resetAsset: "重置位置",
    deleteAsset: "删除素材",
    reorderAsset: "拖拽调整展示顺序",
    reorderHint: "Visual Archive 的上下顺序就是逐卡展映顺序",
    showcaseRange: "逐卡展映区间",
    showcaseRangeHint: "快扫使用全部素材；慢速展映只读取起点到终点",
    showcaseRangeStart: "设为起点",
    showcaseRangeEnd: "设为终点",
    showcaseRangeReset: "恢复全部",
    showcaseRangeCount: "张慢速展映",
    videoTrim: "视频片段裁切",
    videoTrimHint: "设定入点与出点；预览和导出都会循环使用该片段",
    trimIn: "入点",
    trimOut: "出点",
    trimLength: "片段时长",
    previewTrim: "预览片段",
    pauseTrim: "暂停预览",
    resetTrim: "使用完整视频",
    readingDuration: "正在读取视频时长",
    localCache: "本地缓存",
    enabled: "已启用",
    colorMode: "素材色彩",
    originalColor: "原始色彩",
    monochromeMode: "全局黑白",
    monochromeDescription: "关闭后恢复原素材颜色",
    brightness: "所有素材亮度",
    contrast: "所有素材对比度",
    restoreOriginal: "恢复原始颜色与明暗",
    renderNode: "渲染节点",
    available: "可用",
    spatialBrowser: "02 / 空间浏览",
    stageTitle: "媒介的空间序列。",
    expand: "全屏 ↗",
    spatialIndex: "空间媒介索引",
    motionSource: "动态素材",
    staticSource: "静态素材",
    dragToNavigate: "拖动切换",
    distance: "深度",
    track: "轨道",
    gridZoom: "画布",
    wide: "横向",
    vertical: "竖向",
    parameters: "03 / 参数控制",
    motionControl: "动画控制",
    tabMotion: "动画",
    tabCards: "卡片",
    tabLook: "色彩",
    tabHud: "HUD",
    tabText: "文字",
    autoSequence: "自动轮播",
    autoDescription: "循环浏览当前媒体节点",
    autoRoll: "快速自动定位",
    autoRollDescription: "高速滚动后减速落定到一个素材",
    startRoll: "开始滚动",
    rolling: "定位中",
    rollTarget: "落点素材",
    randomTarget: "随机落点",
    rollStyle: "滚动动画",
    sequenceMode: "播放方式",
    rouletteMode: "快速定位",
    stepShowcaseMode: "逐卡展映",
    hookShowcaseMode: "波浪滑轨 + 逐卡展映",
    hookShowcaseShort: "波浪滑轨",
    hookShowcaseDescription: "全部卡片始终正面朝向，沿同一条 S 型空间滑轨高速扫过、连续减速，再自然进入逐卡展示",
    showcaseStartTarget: "正式展示起点",
    featuredTarget: "自动 / DATA CENTER 优先",
    hookSegment: "高速波浪滑轨",
    hookDuration: "滑轨减速总时长",
    railStartSpeed: "滑轨峰值速度",
    hookWaveFrequency: "轨道波浪频率",
    hookBraking: "滑轨减速强度",
    hookSequenceGroup: "波浪滑轨节奏",
    hookSequenceScope: "预览 + 导出同步",
    stepShowcaseDescription: "按素材顺序逐张翻开并停留展示",
    rollGlide: "空间滑轨",
    rollSideFlip: "侧向翻转",
    rollOrbit: "轨道穿梭",
    hudStyle: "HUD 边框风格",
    hudOpenData: "开放数据轨",
    hudCalibration: "精密校准轨",
    hudCodeArray: "代码阵列",
    hudSystemWrite: "系统写入",
    hudSignalRails: "边缘信号轨",
    hudDebugMemory: "调试内存",
    hudCornerLength: "HUD 脚边长度",
    hudColor: "HUD 统一颜色",
    hudNeutral: "恢复黑白灰",
    showSideHud: "显示侧边 HUD",
    showSideHudDescription: "控制左右两侧的分段数据轨与刻度是否出现",
    sideHudSize: "侧边 HUD 大小",
    sideHudStyle: "侧边 HUD 风格",
    sideHudFragments: "数据断片",
    sideHudCodePulse: "代码脉冲",
    sideHudPrecision: "精密刻度",
    sideHudMemory: "内存通道",
    sideHudNodes: "信号节点",
    sideHudMinimal: "极简标尺",
    speed: "手动切换时长",
    spacing: "卡片间距",
    arc: "轨道弧度",
    depth: "空间深度",
    hold: "自动轮播停留",
    scan: "数据流纹理强度",
    inactiveDim: "未选中暗度",
    inactiveOpacity: "未选中 Opacity",
    cardRadius: "卡片圆角",
    globalScale: "全部素材统一大小",
    uiFontScale: "编辑器 UI 字号",
    contentFontScale: "画面内部信息字号",
    rollDuration: "翻转滚动总时长",
    flipSpeed: "卡片翻转速度",
    stepFlipDuration: "单张翻卡时长",
    hookCardDuration: "单卡滑轨过渡时长",
    stepCardHold: "每张卡片停留",
    stepFlipAnimation: "逐卡翻转动画",
    stepFlipHorizontal: "水平侧翻",
    stepFlipVertical: "纵向翻转",
    stepFlipDiagonal: "对角折转",
    rollInertia: "落点微回弹",
    preRollHold: "黑卡持续时长",
    dissolveDuration: "素材渐显时长",
    postRollHold: "结束画面停留",
    blackCardIntro: "黑卡开场",
    blackCardIntroDescription: "可关闭；时长和素材渐显都可独立编辑",
    returnToBlack: "结束后回归黑卡",
    returnToBlackDescription: "结束停留的最后阶段淡出素材",
    previewAnimation: "预览完整动画",
    pauseAnimation: "暂停预览",
    timeline: "视频时间轴",
    totalLength: "视频总时长",
    blackSegment: "黑频",
    flipSegment: "翻转 + 渐显",
    holdSegment: "落点停留",
    timelineHint: "在时间轴任意位置按下并拖动，可逐帧检查完整动画",
    timelineEditHint: "拖动菱形节点可直接调整黑卡与翻转阶段",
    timelinePlayheadGuide: "白色播放头：左右拖动预览",
    timelineBoundaryGuide: "菱形节点：左右拖动修改阶段时长",
    timelineSpaceGuide: "空格键：播放 / 暂停",
    timelineFrame: "当前帧",
    blackEndHandle: "黑卡结束 ↔",
    hookEndHandle: "滑轨落定点 ↔",
    flipEndHandle: "翻转结束 ↔",
    sequenceEndHandle: "序列结束 ↔",
    motionTimelineGroup: "成片时间轴",
    motionTimelineScope: "预览 + 导出同步",
    sideFlipGroup: "侧向翻转",
    sideFlipEnabled: "当前已启用",
    sideFlipOnly: "仅选择侧向翻转时生效",
    browseMotionGroup: "浏览与自动轮播",
    browseMotionScope: "编辑器预览交互",
    stepSequenceGroup: "逐卡展映节奏",
    stepSequenceScope: "预览 + 导出同步",
    showCardHeadlines: "显示说明性大标题",
    showCardHeadlinesDescription: "关闭后仅保留角落标签、序号与动态装饰数据",
    hudScrollSpeed: "代码读取速度",
    annotation: "当前卡片文字",
    title: "标题",
    category: "分类",
    description: "内容说明",
    showcaseCopy: "逐卡展映文字",
    showcaseTopline: "卡片上方装饰文字",
    showcaseTitle: "下方主标题",
    showcaseCaption: "下方说明文字",
    showcaseToplineHint: "留空时自动生成读取状态文字",
    showcaseTitleHint: "留空时自动生成章节标题",
    showcaseCaptionHint: "留空时自动生成数据标注",
    showcaseFrameStyle: "信息框框体",
    frameCornerLock: "四角定位",
    frameOpenRail: "开放导轨",
    frameSplitBracket: "分段括号",
    showcaseTextMotion: "文字出现方式",
    textTypewriter: "敲击输入",
    textDataDecode: "数据解码",
    textScanRead: "扫描读取",
    exportPortal: "导出面板",
    video4k: "4K 视频",
    inputPortal: "输入节点 / 素材导入",
    importMedia: "导入素材",
    dropHere: "将视觉素材拖到这里",
    dropDescription: "上传照片或视频，可一次选择多个文件",
    selectFiles: "选择文件",
    supported: "支持格式",
    processing: "处理方式",
    localPrivate: "本地 / 私密",
    limit: "容量限制",
    browserMemory: "浏览器内存",
    renderPortal: "渲染节点 / 视频导出",
    exportSequence: "导出序列",
    frameRate: "帧率",
    perCard: "每张停留",
    totalDuration: "总时长",
    encoding: "编码",
    seconds: "秒",
    exportWaiting: "等待导出",
    exportSynced: "已同步当前画面",
    exportStep1: "读取原始素材与当前参数",
    exportStep2: "离屏画布按固定时间码逐帧生成 60 FPS",
    exportStep3: "H.264 高码率封装为真正 MP4 并下载",
    exportNote: "不读取屏幕，也不依赖预览窗口帧率。导出仅生成真正的 MP4 / H.264 文件，不再静默回退为 WebM。",
    rendering: "正在逐帧生成完整动画",
    startExport: "开始离屏逐帧导出",
    reset: "重置参数",
    previous: "上一张",
    next: "下一张",
    closeImport: "关闭导入窗口",
    closeExport: "关闭导出窗口",
    canvasAspect: "画布比例",
  },
  en: {
    ready: "SYSTEM READY",
    import: "IMPORT",
    export: "EXPORT",
    mediaNodes: "01 / MEDIA NODES",
    visualArchive: "Visual archive",
    importNew: "IMPORT NEW MEDIA",
    importHint: "IMAGE / VIDEO / MULTI SELECT",
    assetAdjust: "ACTIVE ASSET TUNING",
    assetScale: "Asset size",
    assetX: "Horizontal position",
    assetY: "Vertical position",
    resetAsset: "RESET POSITION",
    deleteAsset: "DELETE ASSET",
    reorderAsset: "DRAG TO REORDER SHOWCASE SEQUENCE",
    reorderHint: "The Visual Archive order is the step-showcase order",
    showcaseRange: "STEP SHOWCASE RANGE",
    showcaseRangeHint: "The hook scans every asset; the slow showcase reads only IN through OUT",
    showcaseRangeStart: "SET AS IN",
    showcaseRangeEnd: "SET AS OUT",
    showcaseRangeReset: "USE ALL",
    showcaseRangeCount: "CARDS IN SLOW SHOWCASE",
    videoTrim: "VIDEO CLIP TRIM",
    videoTrimHint: "Set in and out points; preview and export loop only this segment",
    trimIn: "IN",
    trimOut: "OUT",
    trimLength: "CLIP LENGTH",
    previewTrim: "PREVIEW CLIP",
    pauseTrim: "PAUSE PREVIEW",
    resetTrim: "USE FULL VIDEO",
    readingDuration: "READING VIDEO DURATION",
    localCache: "LOCAL CACHE",
    enabled: "ENABLED",
    colorMode: "SOURCE COLOR",
    originalColor: "ORIGINAL",
    monochromeMode: "GLOBAL MONOCHROME",
    monochromeDescription: "Turn off to restore source color",
    brightness: "All media brightness",
    contrast: "All media contrast",
    restoreOriginal: "RESTORE ORIGINAL COLOR",
    renderNode: "RENDER NODE",
    available: "AVAILABLE",
    spatialBrowser: "02 / SPATIAL BROWSER",
    stageTitle: "Media in spatial sequence.",
    expand: "EXPAND ↗",
    spatialIndex: "SPATIAL MEDIA INDEX",
    motionSource: "MOTION SOURCE",
    staticSource: "STATIC SOURCE",
    dragToNavigate: "DRAG TO NAVIGATE",
    distance: "DISTANCE",
    track: "TRACK",
    gridZoom: "CANVAS",
    wide: "WIDE",
    vertical: "VERT",
    parameters: "03 / PARAMETERS",
    motionControl: "Motion control",
    tabMotion: "MOTION",
    tabCards: "CARDS",
    tabLook: "LOOK",
    tabHud: "HUD",
    tabText: "TYPE",
    autoSequence: "AUTO SEQUENCE",
    autoDescription: "Cycle through current media nodes",
    autoRoll: "AUTO MATERIAL LOCK",
    autoRollDescription: "Rapid scan, decelerate, then lock to one asset",
    startRoll: "START SCAN",
    rolling: "SCANNING",
    rollTarget: "LANDING MATERIAL",
    randomTarget: "RANDOM TARGET",
    rollStyle: "ROLL ANIMATION",
    sequenceMode: "PLAYBACK MODE",
    rouletteMode: "RAPID LOCK",
    stepShowcaseMode: "STEP SHOWCASE",
    hookShowcaseMode: "WAVE RAIL + STEP SHOWCASE",
    hookShowcaseShort: "WAVE RAIL",
    hookShowcaseDescription: "Keep every card face-on and move the full sequence along one continuous S-curve rail, decelerating naturally into the readable showcase",
    showcaseStartTarget: "SHOWCASE START",
    featuredTarget: "AUTO / FIRST AVAILABLE",
    hookSegment: "HIGH-SPEED WAVE RAIL",
    hookDuration: "Rail deceleration duration",
    railStartSpeed: "Rail peak speed",
    hookWaveFrequency: "Rail wave frequency",
    hookBraking: "Rail deceleration",
    hookSequenceGroup: "WAVE RAIL TIMING",
    hookSequenceScope: "PREVIEW + EXPORT SYNCED",
    stepShowcaseDescription: "Reveal every asset in order with a deliberate card flip",
    rollGlide: "SPATIAL GLIDE",
    rollSideFlip: "SIDE FLIP",
    rollOrbit: "ORBITAL SHIFT",
    hudStyle: "HUD BORDER STYLE",
    hudOpenData: "OPEN DATA TRACK",
    hudCalibration: "PRECISION CALIBRATION",
    hudCodeArray: "CODE ARRAY",
    hudSystemWrite: "SYSTEM WRITE",
    hudSignalRails: "EDGE SIGNAL RAILS",
    hudDebugMemory: "DEBUG MEMORY",
    hudCornerLength: "HUD CORNER LENGTH",
    hudColor: "UNIFIED HUD COLOR",
    hudNeutral: "RESET NEUTRAL",
    showSideHud: "SHOW SIDE HUD",
    showSideHudDescription: "Toggle the segmented data rails and side scale",
    sideHudSize: "SIDE HUD SIZE",
    sideHudStyle: "SIDE HUD STYLE",
    sideHudFragments: "DATA FRAGMENTS",
    sideHudCodePulse: "CODE PULSE",
    sideHudPrecision: "PRECISION TICKS",
    sideHudMemory: "MEMORY CHANNEL",
    sideHudNodes: "SIGNAL NODES",
    sideHudMinimal: "MINIMAL SCALE",
    speed: "Manual shift duration",
    spacing: "Card spacing",
    arc: "Track arc",
    depth: "Spatial depth",
    hold: "Autoplay hold",
    scan: "Data-flow texture intensity",
    inactiveDim: "Inactive dimming",
    inactiveOpacity: "Inactive opacity",
    cardRadius: "Card corner radius",
    globalScale: "Global media scale",
    uiFontScale: "Editor UI type size",
    contentFontScale: "In-frame information size",
    rollDuration: "Flip sequence duration",
    flipSpeed: "Card flip speed",
    stepFlipDuration: "Per-card flip duration",
    hookCardDuration: "Per-card rail transition",
    stepCardHold: "Per-card hold",
    stepFlipAnimation: "SHOWCASE FLIP ANIMATION",
    stepFlipHorizontal: "HORIZONTAL FLIP",
    stepFlipVertical: "VERTICAL FLIP",
    stepFlipDiagonal: "DIAGONAL FOLD",
    rollInertia: "Landing micro-bounce",
    preRollHold: "Black-card duration",
    dissolveDuration: "Media dissolve duration",
    postRollHold: "Ending content hold",
    blackCardIntro: "BLACK-CARD INTRO",
    blackCardIntroDescription: "Optional; black hold and dissolve are independently editable",
    returnToBlack: "RETURN TO BLACK CARDS",
    returnToBlackDescription: "Fade media out at the end of the hold",
    previewAnimation: "PREVIEW FULL ANIMATION",
    pauseAnimation: "PAUSE PREVIEW",
    timeline: "VIDEO TIMELINE",
    totalLength: "TOTAL LENGTH",
    blackSegment: "BLACK",
    flipSegment: "FLIP + DISSOLVE",
    holdSegment: "LANDING HOLD",
    timelineHint: "Press and drag anywhere on the timeline to inspect the animation frame by frame",
    timelineEditHint: "Drag the diamond boundaries to edit black-card and flip phases",
    timelinePlayheadGuide: "WHITE PLAYHEAD: drag to preview",
    timelineBoundaryGuide: "DIAMONDS: drag to resize timeline phases",
    timelineSpaceGuide: "SPACE: play / pause",
    timelineFrame: "CURRENT FRAME",
    blackEndHandle: "BLACK END ↔",
    hookEndHandle: "RAIL LANDING ↔",
    flipEndHandle: "FLIP END ↔",
    sequenceEndHandle: "SEQUENCE END ↔",
    motionTimelineGroup: "OUTPUT TIMELINE",
    motionTimelineScope: "PREVIEW + EXPORT SYNCED",
    sideFlipGroup: "SIDE FLIP",
    sideFlipEnabled: "ACTIVE NOW",
    sideFlipOnly: "ACTIVE IN SIDE FLIP MODE ONLY",
    browseMotionGroup: "BROWSE + AUTOPLAY",
    browseMotionScope: "EDITOR PREVIEW INTERACTION",
    stepSequenceGroup: "STEP SHOWCASE TIMING",
    stepSequenceScope: "PREVIEW + EXPORT SYNCED",
    showCardHeadlines: "SHOW EXPLANATORY HEADLINES",
    showCardHeadlinesDescription: "Keep corner labels, indices, and live decorative data only",
    hudScrollSpeed: "Code typing speed",
    annotation: "ACTIVE CARD COPY",
    title: "Title",
    category: "Category",
    description: "Description",
    showcaseCopy: "STEP SHOWCASE COPY",
    showcaseTopline: "Decorative text above card",
    showcaseTitle: "Lower headline",
    showcaseCaption: "Lower annotation",
    showcaseToplineHint: "Leave empty to generate a data-read status",
    showcaseTitleHint: "Leave empty to generate a chapter headline",
    showcaseCaptionHint: "Leave empty to generate a data annotation",
    showcaseFrameStyle: "INFORMATION FRAME",
    frameCornerLock: "CORNER LOCK",
    frameOpenRail: "OPEN RAIL",
    frameSplitBracket: "SPLIT BRACKET",
    showcaseTextMotion: "TEXT REVEAL",
    textTypewriter: "TYPEWRITER",
    textDataDecode: "DATA DECODE",
    textScanRead: "SCAN READ",
    exportPortal: "EXPORT PORTAL",
    video4k: "4K VIDEO",
    inputPortal: "PORTAL / INPUT NODE",
    importMedia: "Import media",
    dropHere: "DROP VISUAL DATA HERE",
    dropDescription: "Upload multiple photos or videos at once",
    selectFiles: "SELECT FILES",
    supported: "SUPPORTED",
    processing: "PROCESSING",
    localPrivate: "LOCAL / PRIVATE",
    limit: "LIMIT",
    browserMemory: "BROWSER MEMORY",
    renderPortal: "PORTAL / RENDER NODE",
    exportSequence: "Export sequence",
    frameRate: "Frame rate",
    perCard: "Hold per card",
    totalDuration: "Total duration",
    encoding: "Encoding",
    seconds: "sec",
    exportWaiting: "WAITING TO EXPORT",
    exportSynced: "SYNCED TO CURRENT VIEW",
    exportStep1: "Load originals and current parameters",
    exportStep2: "Generate fixed-timecode frames offscreen at 60 FPS",
    exportStep3: "Encode a real H.264 MP4 at maximum bitrate",
    exportNote: "No screen capture or preview-frame-rate dependency. Export now produces a real MP4 / H.264 file and never silently falls back to WebM.",
    rendering: "GENERATING EXACT VIDEO FRAMES",
    startExport: "START OFFSCREEN FRAME EXPORT",
    reset: "Reset parameters",
    previous: "Previous card",
    next: "Next card",
    closeImport: "Close import portal",
    closeExport: "Close export portal",
    canvasAspect: "Canvas aspect",
  },
} as const;

const HUD_CODE_LINES = [
  "SYS.CACHE[07] :: 0xAF21 / LINK_OK",
  "MEMORY_MAP :: VISUAL_NODE / READY",
  "Motion Tracking Studio101001 11000110 00110101",
  "AZM_VECTOR :: DEPTH_SYNC / 0042",
  "FRAME_BUS[03] :: SIGNAL_LOCKED",
  "RENDER_QUEUE :: BUFFER 91.04%",
];

const EXPORT_DIMENSIONS: Record<ExportResolution, { wide: string; vertical: string; bitrate: string }> = {
  "4K": { wide: "3840 × 2160", vertical: "2160 × 3840", bitrate: "58 Mbps" },
  "6K": { wide: "5760 × 3240", vertical: "3240 × 5760", bitrate: "96 Mbps" },
  "8K": { wide: "7680 × 4320", vertical: "4320 × 7680", bitrate: "144 Mbps" },
};

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

function inclusiveShowcaseIndices(length: number, startIndex: number, endIndex: number) {
  if (length <= 0) return [];
  const start = wrap(startIndex, length);
  const end = wrap(endIndex, length);
  const count = wrap(end - start, length) + 1;
  return Array.from({ length: count }, (_, offset) => wrap(start + offset, length));
}

function hookTravelDistance(itemCount: number, peakSpeed: number) {
  if (itemCount <= 1) return 0;
  const speedLoops = Math.max(0, Math.min(2, Math.floor(peakSpeed / 8)));
  return itemCount - 1 + speedLoops * itemCount;
}

function hexToRgbChannels(value: string) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (!match) return "215, 221, 224";
  return `${Number.parseInt(match[1], 16)}, ${Number.parseInt(match[2], 16)}, ${Number.parseInt(match[3], 16)}`;
}

function smoothTimeline(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

function TypewriterText({ text, progress }: { text: string; progress: number }) {
  const visibleCount = Math.max(0, Math.min(text.length, Math.floor(progress * (text.length + 1))));
  return text.slice(0, visibleCount).split("").map((character, index) => (
    <span className="typewriter-character" key={`${index}-${character}`}>{character}</span>
  ));
}

function formatTimelineTime(seconds: number) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(2).padStart(5, "0")}`;
}

function formatClipTime(seconds: number) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(1).padStart(4, "0")}`;
}

function readVideoDuration(url: string) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      video.removeAttribute("src");
      video.load();
      resolve(duration);
    };
    video.onerror = () => reject(new Error("VIDEO_METADATA_ERROR"));
    video.src = url;
  });
}

function relativeIndex(index: number, activeIndex: number, length: number) {
  let difference = index - activeIndex;
  while (difference > length / 2) difference -= length;
  while (difference < -length / 2) difference += length;
  return difference;
}

function TrimmedVideoSurface({ item }: { item: MediaItem }) {
  const playing = useContext(PlaybackContext);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const videoRef = useRef<HTMLVideoElement>(null);
  const trimStart = Math.max(0, item.trimStart ?? 0);
  const trimEnd = item.trimEnd ?? item.duration;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let monitorFrame = 0;
    let disposed = false;

    const resetToTrimStart = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : item.duration ?? 0;
      const safeStart = Math.min(trimStart, Math.max(0, duration - 0.05));
      video.currentTime = safeStart;
      if (playingRef.current) void video.play().catch(() => undefined);
    };

    const monitorTrimWindow = () => {
      if (disposed) return;
      if (Number.isFinite(video.duration)) {
        const safeEnd = Math.min(trimEnd ?? video.duration, video.duration);
        if (safeEnd > trimStart && video.currentTime >= safeEnd - 1 / 120) {
          resetToTrimStart();
        }
      }
      monitorFrame = window.requestAnimationFrame(monitorTrimWindow);
    };

    const startTrimPlayback = () => {
      resetToTrimStart();
      monitorFrame = window.requestAnimationFrame(monitorTrimWindow);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startTrimPlayback();
    } else {
      video.addEventListener("loadedmetadata", startTrimPlayback, { once: true });
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(monitorFrame);
      video.removeEventListener("loadedmetadata", startTrimPlayback);
    };
  }, [item.duration, item.id, item.url, trimEnd, trimStart]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) void video.play().catch(() => undefined);
    else video.pause();
  }, [playing]);

  const keepInsideTrimWindow = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const safeEnd = Math.min(trimEnd ?? video.duration, video.duration);
    if (safeEnd > trimStart && video.currentTime >= safeEnd - 0.025) {
      video.currentTime = Math.min(trimStart, Math.max(0, video.duration - 0.05));
      if (playingRef.current) void video.play().catch(() => undefined);
    }
  };

  return (
    <video
      ref={videoRef}
      className="media-content"
      src={item.url}
      muted
      autoPlay={playing}
      playsInline
      preload="auto"
      data-media-id={item.id}
      onLoadedMetadata={keepInsideTrimWindow}
      onTimeUpdate={keepInsideTrimWindow}
      onEnded={keepInsideTrimWindow}
    />
  );
}

function MediaSurface({ item }: { item: MediaItem }) {
  if (item.kind === "video" && item.url) {
    return <TrimmedVideoSurface item={item} />;
  }

  if (item.kind === "image" && item.url) {
    // Blob-backed user uploads are session-local and cannot use Next Image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="media-content" src={item.url} alt={item.title} />;
  }

  return (
    <div className={`synthetic-scene scene-${item.visual}`} aria-hidden="true">
      <span className="synthetic-plane plane-a" />
      <span className="synthetic-plane plane-b" />
      <span className="synthetic-circle circle-a" />
      <span className="synthetic-circle circle-b" />
      <span className="synthetic-axis axis-x" />
      <span className="synthetic-axis axis-y" />
    </div>
  );
}

function VideoTrimEditor({
  item,
  language,
  copy,
  onChange,
}: {
  item: MediaItem;
  language: Language;
  copy: (typeof COPY)[Language];
  onChange: (id: string, patch: Partial<Pick<MediaItem, "duration" | "trimStart" | "trimEnd">>) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const duration = Math.max(0, item.duration ?? 0);
  const trimStart = Math.max(0, Math.min(item.trimStart ?? 0, Math.max(0, duration - 0.1)));
  const trimEnd = Math.max(trimStart + 0.1, Math.min(item.trimEnd ?? duration, duration || 0.1));
  const startPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
    if (Number.isFinite(video.duration)) {
      video.currentTime = Math.min(trimStart, Math.max(0, video.duration - 0.05));
    }
  }, [item.id, trimEnd, trimStart]);

  const updateStart = (value: number) => {
    const next = Math.max(0, Math.min(value, trimEnd - 0.1));
    onChange(item.id, { trimStart: next });
    if (videoRef.current) videoRef.current.currentTime = next;
  };

  const updateEnd = (value: number) => {
    const next = Math.min(duration, Math.max(value, trimStart + 0.1));
    onChange(item.id, { trimEnd: next });
    if (videoRef.current) videoRef.current.currentTime = trimStart;
  };

  const togglePreview = async () => {
    const video = videoRef.current;
    if (!video || duration <= 0) return;
    if (!video.paused) {
      video.pause();
      setPlaying(false);
      return;
    }
    if (video.currentTime < trimStart || video.currentTime >= trimEnd - 0.025) video.currentTime = trimStart;
    await video.play().catch(() => undefined);
    setPlaying(!video.paused);
  };

  return (
    <section className="video-trim-editor" aria-label={copy.videoTrim}>
      <header>
        <span>{copy.videoTrim}</span>
        <output>{duration > 0 ? formatClipTime(trimEnd - trimStart) : "--:--.-"}</output>
      </header>
      <p>{copy.videoTrimHint}</p>
      <div className="video-trim-preview">
        <video
          ref={videoRef}
          src={item.url}
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => {
            const nextDuration = Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0;
            const nextEnd = item.trimEnd === undefined ? nextDuration : Math.min(item.trimEnd, nextDuration);
            onChange(item.id, { duration: nextDuration, trimStart, trimEnd: nextEnd });
            event.currentTarget.currentTime = trimStart;
          }}
          onTimeUpdate={(event) => {
            if (event.currentTarget.currentTime >= trimEnd - 0.025) {
              event.currentTarget.pause();
              event.currentTarget.currentTime = trimEnd;
              setPlaying(false);
            }
          }}
          aria-label={language === "zh" ? `${item.title} 裁切预览` : `${item.title} trim preview`}
        />
        <button type="button" onClick={togglePreview} disabled={duration <= 0}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          {duration > 0 ? (playing ? copy.pauseTrim : copy.previewTrim) : copy.readingDuration}
        </button>
      </div>
      <div
        className="video-trim-track"
        style={{ "--trim-start": `${startPercent}%`, "--trim-end": `${endPercent}%` } as MotionStyle}
      >
        <div aria-hidden="true"><span /></div>
        <input
          className="trim-range trim-range-start"
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={0.05}
          value={trimStart}
          disabled={duration <= 0}
          aria-label={copy.trimIn}
          onChange={(event) => updateStart(Number(event.target.value))}
        />
        <input
          className="trim-range trim-range-end"
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={0.05}
          value={trimEnd}
          disabled={duration <= 0}
          aria-label={copy.trimOut}
          onChange={(event) => updateEnd(Number(event.target.value))}
        />
      </div>
      <div className="video-trim-timecodes">
        <span><i>{copy.trimIn}</i><strong>{formatClipTime(trimStart)}</strong></span>
        <span><i>{copy.trimLength}</i><strong>{formatClipTime(Math.max(0, trimEnd - trimStart))}</strong></span>
        <span><i>{copy.trimOut}</i><strong>{formatClipTime(trimEnd)}</strong></span>
      </div>
      <button
        className="video-trim-reset"
        type="button"
        disabled={duration <= 0 || (trimStart === 0 && Math.abs(trimEnd - duration) < 0.05)}
        onClick={() => {
          onChange(item.id, { trimStart: 0, trimEnd: duration });
          if (videoRef.current) videoRef.current.currentTime = 0;
        }}
      >
        {copy.resetTrim}
      </button>
    </section>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  const displayValue = step < 0.1
    ? value.toFixed(2)
    : step < 1
      ? value.toFixed(1)
      : Math.round(value);

  return (
    <label className={`control-row ${disabled ? "is-disabled" : ""}`}>
      <span className="control-label">
        <span>{label}</span>
        <output>
          {displayValue}
          {suffix}
        </output>
      </span>
      <input
        className="range-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--range-progress": `${percent}%` } as MotionStyle}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      />
    </label>
  );
}

export default function Home() {
  const [items, setItems] = useState<MediaItem[]>(INITIAL_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const [monochrome, setMonochrome] = useState(false);
  const [aspect, setAspect] = useState<AspectMode>("16:9");
  const [portal, setPortal] = useState<PortalMode>(null);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [controlSection, setControlSection] = useState<ControlSection>("motion");
  const [autoplay, setAutoplay] = useState(false);
  const [blackIntroEnabled, setBlackIntroEnabled] = useState(true);
  const [returnToBlack, setReturnToBlack] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showCardHeadlines, setShowCardHeadlines] = useState(false);
  const [mediaReveal, setMediaReveal] = useState(1);
  const [previewTime, setPreviewTime] = useState(0);
  const [hudStyle, setHudStyle] = useState<HudStyle>("debug-memory");
  const [showSideHud, setShowSideHud] = useState(true);
  const [sideHudStyle, setSideHudStyle] = useState<SideHudStyle>("fragments");
  const [rollStyle, setRollStyle] = useState<RollStyle>("orbit");
  const [sequenceMode, setSequenceMode] = useState<SequenceMode>("hook-showcase");
  const [stepFlipStyle, setStepFlipStyle] = useState<StepFlipStyle>("diagonal");
  const [showcaseFrameStyle, setShowcaseFrameStyle] = useState<ShowcaseFrameStyle>("corner-lock");
  const [showcaseTextMotion, setShowcaseTextMotion] = useState<ShowcaseTextMotion>("typewriter");
  const [sequenceFlipAngle, setSequenceFlipAngle] = useState(0);
  const [sequenceFlipProgress, setSequenceFlipProgress] = useState(1);
  const [sequenceSlot, setSequenceSlot] = useState(0);
  const [sequenceStartIndex, setSequenceStartIndex] = useState(0);
  const [sequenceShowcaseCount, setSequenceShowcaseCount] = useState(INITIAL_ITEMS.length);
  const [sequenceCopyOpacity, setSequenceCopyOpacity] = useState(1);
  const [sequenceRevealedThrough, setSequenceRevealedThrough] = useState(Number.POSITIVE_INFINITY);
  const [exportResolution, setExportResolution] = useState<ExportResolution>("4K");
  const [rollTargetId, setRollTargetId] = useState("random");
  const [showcaseStartId, setShowcaseStartId] = useState("auto");
  const [showcaseEndId, setShowcaseEndId] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isMotionPhase, setIsMotionPhase] = useState(false);
  const [rollPosition, setRollPosition] = useState<number | null>(null);
  const [telemetryTick, setTelemetryTick] = useState(0);
  const [trackDragging, setTrackDragging] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [notice, setNotice] = useState("SYSTEM READY");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("READY TO EXPORT");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const rollFrameRef = useRef<number | null>(null);
  const timelinePlanRef = useRef<TimelinePlan | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const timelinePointerRef = useRef<number | null>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const playbackToggleRef = useRef<() => void>(() => undefined);
  const projectStateReadyRef = useRef(false);

  useEffect(() => {
    // Each visit starts with the curated example. Keep prior local work intact.
    const stored = readProjectState();
    if (stored?.items?.some((item) => !item.id.startsWith("portfolio-"))) {
      try { window.localStorage.setItem(SAVED_BOARD_STORAGE, JSON.stringify(stored)); } catch { /* Storage is optional. */ }
    }
    projectStateReadyRef.current = true;
  }, []);

  useEffect(() => {
    if (!projectStateReadyRef.current || isRolling || exporting) return;
    const timer = window.setTimeout(() => {
      const snapshot: PersistedProjectState = {
        sampleSet: SAMPLE_SET,
        showNumbers,
        items: items.map((item) => item.uploaded ? { ...item, url: undefined } : item),
        activeIndex,
        language,
        monochrome,
        aspect,
        params,
        autoplay,
        blackIntroEnabled,
        returnToBlack,
        showCardHeadlines,
        hudStyle,
        showSideHud,
        sideHudStyle,
        rollStyle,
        sequenceMode,
        stepFlipStyle,
        showcaseFrameStyle,
        showcaseTextMotion,
        exportResolution,
        rollTargetId,
        showcaseStartId,
        showcaseEndId,
      };
      try {
        window.localStorage.setItem(PROJECT_STATE_STORAGE, JSON.stringify(snapshot));
      } catch {
        // The configured defaults still work if local storage is unavailable.
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [activeIndex, aspect, autoplay, blackIntroEnabled, exportResolution, exporting, hudStyle, isRolling, items, language, monochrome, params, returnToBlack, rollStyle, rollTargetId, sequenceMode, showcaseEndId, showcaseFrameStyle, showcaseStartId, showcaseTextMotion, showCardHeadlines, showNumbers, showSideHud, sideHudStyle, stepFlipStyle]);

  useEffect(()=>{document.documentElement.lang=language==="zh"?"zh-CN":"en";},[language]);
  const copy = COPY[language];
  const activeItem = items[wrap(activeIndex, items.length)];
  const configuredShowcaseStartIndex = items.findIndex((item) => item.id === showcaseStartId);
  const dataCenterIndex = items.findIndex((item) => item.title.toUpperCase().includes("DATA CENTER"));
  const preferredShowcaseStartIndex = configuredShowcaseStartIndex >= 0
    ? configuredShowcaseStartIndex
    : dataCenterIndex >= 0
      ? dataCenterIndex
      : 0;
  const configuredShowcaseEndIndex = items.findIndex((item) => item.id === showcaseEndId);
  const preferredShowcaseEndIndex = configuredShowcaseEndIndex >= 0
    ? configuredShowcaseEndIndex
    : wrap(preferredShowcaseStartIndex - 1, items.length);
  const showcaseRangeIndices = inclusiveShowcaseIndices(
    items.length,
    preferredShowcaseStartIndex,
    preferredShowcaseEndIndex,
  );
  const showcaseCount = Math.max(1, showcaseRangeIndices.length);
  const orderedShowcaseItems = showcaseRangeIndices.map((index) => items[index]);
  const showcaseRangeIdSet = new Set(orderedShowcaseItems.map((item) => item.id));
  const blackDuration = blackIntroEnabled && sequenceMode !== "hook-showcase" ? params.preRollHold : 0;
  const rouletteDuration = params.rollDuration / 1000;
  const hookDuration = sequenceMode === "hook-showcase" ? rouletteDuration : 0;
  const showcaseDuration = sequenceMode === "hook-showcase"
    ? hookShowcaseDuration(showcaseCount, params.stepFlipDuration, params.stepCardHold)
    : stepSequenceDuration(showcaseCount, params.stepFlipDuration, params.stepCardHold);
  const usesStepShowcase = sequenceMode !== "roulette";
  const flipDuration = sequenceMode === "roulette" ? rouletteDuration : hookDuration + showcaseDuration;
  const timelineTotal = blackDuration + flipDuration + params.postRollHold;
  const hookSweepActive = sequenceMode === "hook-showcase" && previewTime < hookDuration;
  const visualActiveIndex = rollPosition === null
    ? activeIndex
    : wrap(Math.round(rollPosition), items.length);
  const activeHudLabel: Record<HudStyle, string> = {
    "open-data": copy.hudOpenData,
    calibration: copy.hudCalibration,
    "code-array": copy.hudCodeArray,
    "system-write": copy.hudSystemWrite,
    "signal-rails": copy.hudSignalRails,
    "debug-memory": copy.hudDebugMemory,
  };
  const activeRollLabel: Record<RollStyle, string> = {
    glide: copy.rollGlide,
    "side-flip": copy.rollSideFlip,
    orbit: copy.rollOrbit,
  };
  const telemetry = useMemo(
    () => Array.from({ length: 8 }, (_, index) =>
      String((telemetryTick * (37 + index * 6) + 1042 + index * 791) % 9999).padStart(4, "0"),
    ),
    [telemetryTick],
  );

  const updateParam = <K extends keyof MotionParams>(
    key: K,
    value: MotionParams[K],
  ) => setParams((current) => ({ ...current, [key]: value }));

  const updateRailPeakSpeed = (value: number) => {
    if (sequenceMode === "hook-showcase" && timelinePlanRef.current) {
      timelinePlanRef.current = {
        ...timelinePlanRef.current,
        travel: hookTravelDistance(items.length, value),
      };
    }
    updateParam("railStartSpeed", value);
  };

  const updateRollDuration = (value: number) => setParams((current) => ({
    ...current,
    rollDuration: value,
    dissolveDuration: Math.min(current.dissolveDuration, value / 1000),
  }));

  const changeSequenceMode = (mode: SequenceMode) => {
    if (isRolling || mode === sequenceMode) return;
    setSequenceMode(mode);
    if (mode === "hook-showcase") {
      setRollStyle("orbit");
      setStepFlipStyle("diagonal");
      setReturnToBlack(false);
    }
    setPreviewTime(0);
    setRollPosition(null);
    setIsMotionPhase(false);
    setSequenceFlipAngle(0);
    setSequenceFlipProgress(1);
    setSequenceSlot(0);
    setSequenceStartIndex(0);
    setSequenceShowcaseCount(items.length);
    setSequenceCopyOpacity(1);
    setSequenceRevealedThrough(Number.POSITIVE_INFINITY);
    setMediaReveal(1);
    timelinePlanRef.current = null;
    setNotice(mode === "roulette"
      ? (language === "zh" ? "快速定位模式已启用" : "RAPID LOCK ENABLED")
      : mode === "hook-showcase"
        ? (language === "zh" ? "快速扫场 + 逐卡展映已启用" : "HOOK + STEP SHOWCASE ENABLED")
        : (language === "zh" ? "逐卡展映模式已启用" : "STEP SHOWCASE ENABLED"));
  };

  const resetParameters = () => {
    setParams(DEFAULT_PARAMS);
    setMonochrome(false);
    setBlackIntroEnabled(true);
    setReturnToBlack(false);
    setShowCardHeadlines(false);
    setSequenceMode("hook-showcase");
    setRollStyle("orbit");
    setStepFlipStyle("diagonal");
    setShowcaseFrameStyle("corner-lock");
    setShowcaseTextMotion("typewriter");
    setHudStyle("debug-memory");
    setShowSideHud(true);
    setSideHudStyle("fragments");
    setSequenceFlipAngle(0);
    setSequenceFlipProgress(1);
    setSequenceSlot(0);
    setSequenceStartIndex(0);
    setSequenceShowcaseCount(items.length);
    setSequenceCopyOpacity(1);
    setSequenceRevealedThrough(Number.POSITIVE_INFINITY);
    setMediaReveal(1);
    setPreviewTime(0);
    setShowcaseStartId("auto");
    setShowcaseEndId("all");
    timelinePlanRef.current = null;
  };

  const setShowcaseBoundary = (boundary: "start" | "end", id: string) => {
    if (isRolling) return;
    if (boundary === "start") setShowcaseStartId(id);
    else setShowcaseEndId(id);
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setSequenceSlot(0);
    setSequenceShowcaseCount(showcaseCount);
    setRollPosition(null);
    setMediaReveal(1);
    setNotice(language === "zh" ? "逐卡展映区间已更新" : "STEP SHOWCASE RANGE UPDATED");
  };

  const resetShowcaseRange = () => {
    if (isRolling) return;
    setShowcaseStartId("auto");
    setShowcaseEndId("all");
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setSequenceSlot(0);
    setSequenceShowcaseCount(items.length);
    setRollPosition(null);
    setMediaReveal(1);
    setNotice(language === "zh" ? "逐卡展映已恢复全部素材" : "FULL SHOWCASE RANGE RESTORED");
  };

  const updateActiveItem = (
    key: AssetTextKey,
    value: string,
  ) => {
    if (activeItem.sourceKey) saveAssetTextProfile(activeItem.sourceKey, { [key]: value });
    setItems((current) =>
      current.map((item, index) =>
        index === activeIndex ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateActiveTransform = (
    key: "scale" | "offsetX" | "offsetY",
    value: number,
  ) => {
    setItems((current) => current.map((item, index) =>
      index === activeIndex ? { ...item, [key]: value } : item,
    ));
  };

  const updateItemTrim = (
    id: string,
    patch: Partial<Pick<MediaItem, "duration" | "trimStart" | "trimEnd">>,
  ) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const selectAsset = (index: number) => {
    setActiveIndex(index);
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setMediaReveal(1);
    setNotice(
      language === "zh"
        ? `已选择节点 ${String(index + 1).padStart(2, "0")}`
        : `NODE ${String(index + 1).padStart(2, "0")} SELECTED`,
    );
  };

  const reorderAsset = (sourceId: string, targetId: string) => {
    if (isRolling || sourceId === targetId) return;
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const selectedId = activeItem.id;
    const reordered = [...items];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setItems(reordered);
    setActiveIndex(reordered.findIndex((item) => item.id === selectedId));
    setDraggedItemId(null);
    setDragOverItemId(null);
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setSequenceStartIndex(0);
    setSequenceSlot(0);
    setMediaReveal(1);
    setNotice(language === "zh" ? "展示顺序已更新" : "SHOWCASE SEQUENCE REORDERED");
  };

  const moveAssetBy = (id: string, delta: -1 | 1) => {
    const index = items.findIndex((item) => item.id === id);
    const target = Math.max(0, Math.min(items.length - 1, index + delta));
    if (index >= 0 && target !== index) reorderAsset(id, items[target].id);
  };

  const resetActiveTransform = () => {
    setItems((current) => current.map((item, index) =>
      index === activeIndex
        ? { ...item, scale: 1, offsetX: 0, offsetY: 0 }
        : item,
    ));
  };

  const changeCard = useCallback(
    (delta: 1 | -1) => {
      if (isAnimating || isRolling || items.length < 2) return;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setIsAnimating(true);
      setNotice(
        language === "zh"
          ? delta === 1 ? "轨道向前切换" : "轨道向后切换"
          : delta === 1 ? "TRACK SHIFT / FORWARD" : "TRACK SHIFT / REVERSE",
      );
      setActiveIndex((current) => wrap(current + delta, items.length));
      timelinePlanRef.current = null;
      setPreviewTime(0);
      setMediaReveal(1);
      setDragOffset(0);
      dragOffsetRef.current = 0;
      timeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false);
        setNotice(COPY[language].ready);
      }, params.speed);
    },
    [isAnimating, isRolling, items.length, language, params.speed],
  );

  useEffect(() => {
    if (!autoplay || isAnimating || isRolling || trackDragging) return;
    const timer = window.setInterval(() => changeCard(1), params.hold * 1000);
    return () => window.clearInterval(timer);
  }, [autoplay, changeCard, isAnimating, isRolling, params.hold, trackDragging]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTelemetryTick((current) => current + 1),
      680,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, button")) return;
      if (event.key === "ArrowRight") changeCard(1);
      if (event.key === "ArrowLeft") changeCard(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeCard]);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (rollFrameRef.current) window.cancelAnimationFrame(rollFrameRef.current);
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const cardEntries = useMemo(() => {
    const displayPosition = rollPosition ?? activeIndex;
    const dragProgress = isRolling ? 0 : dragOffset / Math.max(params.spacing, 1);
    return items.map((item, index) => {
      const baseRelative = relativeIndex(index, displayPosition, items.length);
      const shiftedRelative = baseRelative - dragProgress;
      const distance = Math.abs(shiftedRelative);
      const clampedRelative = Math.max(-1.35, Math.min(1.35, shiftedRelative));
      const railWaveActive = sequenceMode === "hook-showcase"
        || (sequenceMode === "roulette" && isMotionPhase && rollStyle === "orbit");
      const waveFrequency = sequenceMode === "hook-showcase" ? params.hookWaveFrequency : 1;
      const orbitWave = Math.sin(clampedRelative * Math.PI * 0.72 * waveFrequency);
      const orbitDepth = Math.cos(clampedRelative * Math.PI * 0.72 * waveFrequency) - 1;
      const rouletteMotion = sequenceMode === "roulette" && isMotionPhase;
      const modeY = railWaveActive ? orbitWave * (sequenceMode === "hook-showcase" ? 46 : 34) : 0;
      const modeZ = railWaveActive ? orbitDepth * (sequenceMode === "hook-showcase" ? 32 : 24) : 0;
      const modeRotate = rouletteMotion && rollStyle === "orbit" ? orbitWave * -3.8 : 0;
      const flipAngle = Math.min(82, Math.abs(clampedRelative) * 56 * params.flipSpeed);
      const flipRotate = rouletteMotion && rollStyle === "side-flip"
        ? Math.sign(clampedRelative) * -flipAngle
        : 0;
      const sequenceOrder = wrap(index - sequenceStartIndex, items.length);
      const inShowcaseRange = sequenceOrder < sequenceShowcaseCount;
      const stepTarget = usesStepShowcase && inShowcaseRange && (
        sequenceMode === "hook-showcase" && hookSweepActive
          ? sequenceOrder === 0
          : sequenceOrder === sequenceSlot
      );
      const stepCardAngle = sequenceMode === "hook-showcase"
        ? 0
        : stepTarget
          ? sequenceFlipAngle
          : 0;
      const stepFlipLight = sequenceMode === "step-showcase" && stepTarget && isMotionPhase
        ? Math.sin(sequenceFlipProgress * Math.PI)
        : 0;
      const revealedBefore = usesStepShowcase && inShowcaseRange && !hookSweepActive && sequenceOrder < sequenceSlot;
      const activeRevealProgress = sequenceMode === "hook-showcase"
        ? sequenceCopyOpacity
        : sequenceFlipProgress;
      const revealStage = (start: number, duration: number) => revealedBefore
        ? 1
        : stepTarget
          ? smoothTimeline(Math.max(0, Math.min(1, (activeRevealProgress - start) / duration)))
          : 0;
      const showcaseTopReveal = revealStage(sequenceMode === "hook-showcase" ? 0.02 : 0.38, sequenceMode === "hook-showcase" ? 0.52 : 0.34);
      const showcaseTopCopyReveal = revealStage(sequenceMode === "hook-showcase" ? 0.14 : 0.5, sequenceMode === "hook-showcase" ? 0.64 : 0.34);
      const showcasePanelReveal = revealStage(sequenceMode === "hook-showcase" ? 0.04 : 0.52, sequenceMode === "hook-showcase" ? 0.68 : 0.34);
      const showcasePanelCopyReveal = revealStage(sequenceMode === "hook-showcase" ? 0.16 : 0.64, sequenceMode === "hook-showcase" ? 0.48 : 0.3);
      const showcasePanelTitleReveal = revealStage(sequenceMode === "hook-showcase" ? 0.28 : 0.64, sequenceMode === "hook-showcase" ? 0.5 : 0.3);
      const showcasePanelCaptionReveal = revealStage(sequenceMode === "hook-showcase" ? 0.54 : 0.7, sequenceMode === "hook-showcase" ? 0.44 : 0.26);
      let sequenceMask = 0;
      if (sequenceMode === "step-showcase" && inShowcaseRange && Number.isFinite(sequenceRevealedThrough)) {
        if (sequenceOrder > sequenceSlot) sequenceMask = 1;
        else if (sequenceOrder === sequenceSlot) {
          const revealProgress = Math.max(0, Math.min(1, (sequenceFlipProgress - 0.18) / 0.72));
          sequenceMask = 1 - smoothTimeline(revealProgress);
        }
      }
      const itemScale = (item.scale ?? 1) * params.globalScale;
      const itemOffsetX = item.offsetX ?? 0;
      const itemOffsetY = item.offsetY ?? 0;
      const cardDim = Math.min(1, distance) * (params.inactiveDim / 100);
      const showcaseDim = 1 - cardDim;
      const showcaseDistanceOpacity = Math.max(0.18, 1 - distance * 0.3);
      const cardStyle = {
        "--card-x": `${shiftedRelative * params.spacing + itemOffsetX}px`,
        "--card-y": `${Math.min(distance * params.arc, params.arc * 3) + itemOffsetY}px`,
        "--card-z": `${-distance * params.depth}px`,
        "--card-mode-y": `${modeY}px`,
        "--card-mode-z": `${modeZ}px`,
        "--card-mode-rotate": `${modeRotate}deg`,
        "--card-flip": `${flipRotate}deg`,
        "--card-scale": Math.max(0.7, 1 - distance * 0.085) * itemScale,
        "--card-dim": cardDim,
        "--card-opacity": 1 - Math.min(1, distance) * (1 - params.inactiveOpacity / 100),
        "--card-sequence-mask": sequenceMask,
        "--step-card-angle": `${stepCardAngle}deg`,
        "--step-flip-light": stepFlipLight,
        "--showcase-top-clip": `${(1 - showcaseTopReveal) * 100}%`,
        "--showcase-top-copy-clip": `${(1 - showcaseTopCopyReveal) * 100}%`,
        "--showcase-top-copy-opacity": showcaseTopCopyReveal,
        "--showcase-top-scan-clip": `${(1 - showcaseTopCopyReveal) * 100}%`,
        "--showcase-top-decode-blur": `${(1 - showcaseTopCopyReveal) * 3}px`,
        "--showcase-top-link-progress": showcaseTopCopyReveal,
        "--showcase-top-opacity": showcaseTopReveal * mediaReveal * showcaseDim * showcaseDistanceOpacity,
        "--showcase-panel-clip": `${(1 - showcasePanelReveal) * 100}%`,
        "--showcase-panel-copy-clip": `${(1 - showcasePanelCopyReveal) * 100}%`,
        "--showcase-panel-copy-opacity": showcasePanelCopyReveal,
        "--showcase-panel-title-clip": `${(1 - showcasePanelTitleReveal) * 100}%`,
        "--showcase-panel-title-opacity": showcasePanelTitleReveal,
        "--showcase-panel-caption-clip": `${(1 - showcasePanelCaptionReveal) * 100}%`,
        "--showcase-panel-caption-opacity": showcasePanelCaptionReveal,
        "--showcase-panel-scan-clip": `${(1 - showcasePanelCopyReveal) * 100}%`,
        "--showcase-panel-decode-blur": `${(1 - showcasePanelCopyReveal) * 3}px`,
        "--showcase-panel-link-progress": showcasePanelCopyReveal,
        "--showcase-panel-opacity": showcasePanelReveal * mediaReveal * showcaseDim * showcaseDistanceOpacity,
        "--card-order": Math.round(100 - distance * 10),
        "--transition-speed": `${isRolling ? 0 : params.speed}ms`,
      } as MotionStyle;
      return {
        item,
        index,
        distance,
        stepTarget,
        showcaseTopCopyReveal,
        showcasePanelCopyReveal,
        showcasePanelTitleReveal,
        showcasePanelCaptionReveal,
        cardStyle,
      };
    });
  }, [activeIndex, dragOffset, hookSweepActive, isMotionPhase, isRolling, items, mediaReveal, params.arc, params.depth, params.flipSpeed, params.globalScale, params.hookWaveFrequency, params.inactiveDim, params.inactiveOpacity, params.spacing, params.speed, rollPosition, rollStyle, sequenceCopyOpacity, sequenceFlipAngle, sequenceFlipProgress, sequenceMode, sequenceRevealedThrough, sequenceShowcaseCount, sequenceSlot, sequenceStartIndex, usesStepShowcase]);

  const addFiles = async (fileList: FileList | File[]) => {
    const accepted = Array.from(fileList).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );
    if (!accepted.length) {
      setNotice(language === "zh" ? "导入失败 / 不支持的文件" : "IMPORT ERROR / UNSUPPORTED FILE");
      return;
    }

    const startIndex = items.length;
    const uploaded = accepted.map((file, index): MediaItem => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const sourceKey = assetSourceKey(file.name);
      const savedText = readAssetTextProfile(sourceKey);
      const defaultTag = file.type.startsWith("video/") ? "MOTION CAPTURE" : "STILL CAPTURE";
      const cacheKey = `${sourceKey}:${file.size}:${file.lastModified}`;
      return {
        id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
        sourceKey,
        title: cleanName.toUpperCase(),
        tag: defaultTag,
        description: "User archive · visual data linked",
        kind: file.type.startsWith("video/") ? "video" : "image",
        url,
        uploaded: true,
        cacheKey,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        trimStart: file.type.startsWith("video/") ? 0 : undefined,
        ...savedText,
      };
    });

    await Promise.all(uploaded.map((item, index) =>
      item.cacheKey ? writeCachedMedia(item.cacheKey, accepted[index]) : Promise.resolve(),
    )).catch(() => undefined);

    setItems((current) => [...current, ...uploaded]);
    uploaded.forEach((item) => {
      if (item.kind !== "video" || !item.url) return;
      void readVideoDuration(item.url).then((duration) => {
        if (duration <= 0) return;
        setItems((current) => current.map((currentItem) => currentItem.id === item.id
          ? { ...currentItem, duration, trimStart: currentItem.trimStart ?? 0, trimEnd: currentItem.trimEnd ?? duration }
          : currentItem));
      }).catch(() => undefined);
    });
    setActiveIndex(startIndex);
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setMediaReveal(1);
    setPortal(null);
    setNotice(
      language === "zh"
        ? `导入完成 / ${uploaded.length} 个文件`
        : `IMPORT COMPLETE / ${uploaded.length} FILES`,
    );
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void addFiles(event.target.files);
    event.target.value = "";
  };

  const onFileDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDropActive(false);
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    if (isRolling) return;
    if (items.length <= 1) {
      setNotice(language === "zh" ? "请至少保留一个素材" : "KEEP AT LEAST ONE ASSET");
      return;
    }
    const removedIndex = items.findIndex((item) => item.id === id);
    const removed = items[removedIndex];
    if (removed?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(removed.url);
      objectUrlsRef.current.delete(removed.url);
    }
    if (removed?.cacheKey) void deleteCachedMedia(removed.cacheKey).catch(() => undefined);
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    timelinePlanRef.current = null;
    setPreviewTime(0);
    setMediaReveal(1);
    if (rollTargetId === id) setRollTargetId("random");
    if (showcaseStartId === id) setShowcaseStartId("auto");
    if (showcaseEndId === id) setShowcaseEndId("all");
    setActiveIndex((current) => {
      if (current > removedIndex) return current - 1;
      if (current >= nextItems.length) return 0;
      return current;
    });
    setNotice(language === "zh" ? "素材节点已移除" : "NODE REMOVED");
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isAnimating || isRolling) return;
    dragStartRef.current = event.clientX;
    dragOffsetRef.current = 0;
    setTrackDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const nextOffset = Math.max(
      -params.spacing * 0.92,
      Math.min(params.spacing * 0.92, event.clientX - dragStartRef.current),
    );
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const onTrackPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const finalOffset = dragOffsetRef.current;
    dragStartRef.current = null;
    setTrackDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(finalOffset) > 44) changeCard(finalOffset < 0 ? 1 : -1);
    else {
      setDragOffset(0);
      dragOffsetRef.current = 0;
    }
  };

  const createTimelinePlan = (forcedTargetIndex?: number): TimelinePlan => {
    const itemCount = items.length;
    if (sequenceMode === "step-showcase") {
      const travel = Math.max(0, showcaseCount - 1);
      return {
        startIndex: preferredShowcaseStartIndex,
        showcaseStartIndex: preferredShowcaseStartIndex,
        showcaseCount,
        targetIndex: showcaseRangeIndices[showcaseRangeIndices.length - 1] ?? preferredShowcaseStartIndex,
        travel,
      };
    }
    const configuredTarget = items.findIndex((item) => item.id === rollTargetId);
    if (sequenceMode === "hook-showcase") {
      const showcaseStartIndex = typeof forcedTargetIndex === "number"
        ? wrap(forcedTargetIndex, itemCount)
        : preferredShowcaseStartIndex;
      const startIndex = itemCount > 1 ? wrap(showcaseStartIndex + 1, itemCount) : showcaseStartIndex;
      return {
        startIndex,
        showcaseStartIndex,
        showcaseCount,
        targetIndex: wrap(showcaseStartIndex + Math.max(0, showcaseCount - 1), itemCount),
        travel: hookTravelDistance(itemCount, params.railStartSpeed),
      };
    }
    const randomOffset = itemCount > 1
      ? Math.floor(Math.random() * (itemCount - 1)) + 1
      : 0;
    const finalIndex = typeof forcedTargetIndex === "number"
      ? wrap(forcedTargetIndex, itemCount)
      : configuredTarget >= 0
        ? configuredTarget
        : wrap(activeIndex + randomOffset, itemCount);
    const forwardOffset = itemCount > 1
      ? wrap(finalIndex - activeIndex, itemCount) || itemCount
      : 0;
    const restrainedLoop = itemCount > 1 && itemCount <= 6 ? itemCount : 0;
    const travel = restrainedLoop + forwardOffset;
    return { startIndex: activeIndex, showcaseStartIndex: finalIndex, showcaseCount: 1, targetIndex: finalIndex, travel };
  };

  const applyTimelineState = useCallback((seconds: number, plan: TimelinePlan) => {
    const clamped = Math.max(0, Math.min(timelineTotal, seconds));
    if (usesStepShowcase) {
      const motionElapsed = clamped - blackDuration;
      const hookActive = sequenceMode === "hook-showcase" && motionElapsed < hookDuration;
      if (hookActive) {
        const hookProgress = Math.max(0, Math.min(1, motionElapsed / Math.max(hookDuration, 0.001)));
        setPreviewTime(clamped);
        setIsMotionPhase(clamped >= blackDuration && hookProgress < 1);
        setRollPosition(plan.startIndex + hookSweepOffset(
          hookProgress,
          plan.travel,
          params.rollInertia,
          params.railStartSpeed,
        ));
        setSequenceFlipAngle(0);
        setSequenceFlipProgress(0);
        setSequenceSlot(0);
        setSequenceStartIndex(plan.showcaseStartIndex);
        setSequenceShowcaseCount(plan.showcaseCount);
        setSequenceCopyOpacity(hookCaptionReveal(hookProgress));
        setSequenceRevealedThrough(Number.POSITIVE_INFINITY);
        setMediaReveal(1);
        return;
      }

      const sequenceElapsed = Math.max(0, motionElapsed - hookDuration);
      const sequenceState = sequenceMode === "hook-showcase"
        ? hookShowcaseState(
          sequenceElapsed,
          plan.showcaseCount,
          params.stepFlipDuration,
          params.stepCardHold,
        )
        : stepSequenceState(
          sequenceElapsed,
          plan.showcaseCount,
          params.stepFlipDuration,
          params.stepCardHold,
        );
      setPreviewTime(clamped);
      setIsMotionPhase(clamped >= blackDuration + hookDuration && sequenceState.isFlipping);
      setRollPosition(plan.showcaseStartIndex + sequenceState.positionOffset);
      setSequenceFlipAngle(sequenceState.activeFlipAngle);
      setSequenceFlipProgress(sequenceState.flipProgress);
      setSequenceSlot(sequenceState.slot);
      setSequenceStartIndex(plan.showcaseStartIndex);
      setSequenceShowcaseCount(plan.showcaseCount);
      setSequenceCopyOpacity(clamped < blackDuration + hookDuration ? 0 : sequenceState.copyOpacity);
      setSequenceRevealedThrough(sequenceMode === "hook-showcase"
        ? Number.POSITIVE_INFINITY
        : clamped < blackDuration + hookDuration
          ? -1
          : sequenceState.revealedThrough);

      let sequenceReveal = clamped < blackDuration ? 0 : 1;
      if (returnToBlack && clamped >= blackDuration + flipDuration) {
        const holdElapsed = clamped - blackDuration - flipDuration;
        const fadeDuration = Math.min(params.dissolveDuration, Math.max(params.postRollHold, 0.001));
        const fadeStart = Math.max(0, params.postRollHold - fadeDuration);
        const fadeProgress = Math.max(0, Math.min(1, (holdElapsed - fadeStart) / Math.max(fadeDuration, 0.001)));
        sequenceReveal = 1 - smoothTimeline(fadeProgress);
      }
      setMediaReveal(sequenceReveal);
      return;
    }

    const rollProgress = Math.max(
      0,
      Math.min(1, (clamped - blackDuration) / Math.max(flipDuration, 0.001)),
    );
    setPreviewTime(clamped);
    setIsMotionPhase(rollProgress > 0 && rollProgress < 1);
    setRollPosition(plan.startIndex + rollMotionOffset(
      rollProgress,
      plan.travel,
      params.rollInertia,
      rollStyle === "side-flip" ? 0.3 : 0.22,
    ));
    setSequenceFlipAngle(0);
    setSequenceFlipProgress(1);
    setSequenceSlot(0);
    setSequenceStartIndex(0);
    setSequenceShowcaseCount(1);
    setSequenceCopyOpacity(1);
    setSequenceRevealedThrough(Number.POSITIVE_INFINITY);

    const dissolveDuration = Math.max(
      0.05,
      Math.min(params.dissolveDuration, flipDuration),
    );
    let reveal = blackIntroEnabled
      ? smoothTimeline(Math.max(0, Math.min(1, (clamped - blackDuration) / dissolveDuration)))
      : 1;
    if (clamped >= blackDuration + flipDuration) reveal = 1;
    if (returnToBlack && clamped >= blackDuration + flipDuration) {
      const holdElapsed = clamped - blackDuration - flipDuration;
      const fadeDuration = Math.min(dissolveDuration, Math.max(params.postRollHold, 0.001));
      const fadeStart = Math.max(0, params.postRollHold - fadeDuration);
      const fadeProgress = Math.max(
        0,
        Math.min(1, (holdElapsed - fadeStart) / Math.max(fadeDuration, 0.001)),
      );
      reveal = 1 - smoothTimeline(fadeProgress);
    }
    setMediaReveal(reveal);
  }, [blackDuration, blackIntroEnabled, flipDuration, hookDuration, params.dissolveDuration, params.postRollHold, params.railStartSpeed, params.rollInertia, params.stepCardHold, params.stepFlipDuration, returnToBlack, rollStyle, sequenceMode, timelineTotal, usesStepShowcase]);

  const scrubTimeline = (seconds: number) => {
    if (rollFrameRef.current) window.cancelAnimationFrame(rollFrameRef.current);
    rollFrameRef.current = null;
    setIsRolling(false);
    setIsAnimating(false);
    const plan = timelinePlanRef.current ?? createTimelinePlan();
    timelinePlanRef.current = plan;
    applyTimelineState(seconds, plan);
    setNotice(language === "zh" ? "时间轴定位 / 预览帧" : "TIMELINE SEEK / PREVIEW FRAME");
  };

  const seekTimelineFromPointer = (clientX: number, element: HTMLDivElement) => {
    const bounds = element.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(1, bounds.width)));
    const snappedSeconds = Math.round(ratio * timelineTotal * 60) / 60;
    scrubTimeline(snappedSeconds);
  };

  const beginTimelineScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest(".timeline-boundary")) return;
    event.preventDefault();
    timelinePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekTimelineFromPointer(event.clientX, event.currentTarget);
  };

  const moveTimelineScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (timelinePointerRef.current !== event.pointerId) return;
    seekTimelineFromPointer(event.clientX, event.currentTarget);
  };

  const endTimelineScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (timelinePointerRef.current !== event.pointerId) return;
    timelinePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const editTimelineBoundary = (boundary: "black" | "hook" | "flip", percent: number) => {
    if (rollFrameRef.current) window.cancelAnimationFrame(rollFrameRef.current);
    rollFrameRef.current = null;
    setIsRolling(false);
    setIsAnimating(false);
    setIsMotionPhase(false);

    const ratio = Math.max(0.001, Math.min(0.94, percent / 100));
    let nextTotal = timelineTotal;
    if (boundary === "black") {
      const nextBlack = Math.max(
        0,
        Math.min(3, (ratio * (flipDuration + params.postRollHold)) / (1 - ratio)),
      );
      updateParam("preRollHold", Math.round(nextBlack * 20) / 20);
      nextTotal = nextBlack + flipDuration + params.postRollHold;
    } else if (boundary === "hook" && sequenceMode === "hook-showcase") {
      const fixedAfterHook = showcaseDuration + params.postRollHold;
      const nextHook = Math.max(
        0.45,
        Math.min(8, (ratio * (blackDuration + fixedAfterHook) - blackDuration) / (1 - ratio)),
      );
      const roundedHook = Math.round(nextHook * 50) * 20;
      updateRollDuration(roundedHook);
      nextTotal = blackDuration + roundedHook / 1000 + fixedAfterHook;
    } else if (usesStepShowcase) {
      const desiredMotionDuration = Math.max(
        0.1,
        (ratio * (blackDuration + params.postRollHold) - blackDuration) / (1 - ratio),
      );
      const desiredSequenceDuration = Math.max(0.1, desiredMotionDuration - hookDuration);
      const solvedStepFlip = sequenceMode === "hook-showcase"
        ? showcaseCount <= 1
          ? params.stepFlipDuration
          : (desiredSequenceDuration - params.stepCardHold) / (showcaseCount - 1) - params.stepCardHold
        : desiredSequenceDuration / Math.max(1, showcaseCount) - params.stepCardHold;
      const nextStepFlip = Math.max(0.3, Math.min(3.2, solvedStepFlip));
      const roundedStepFlip = Math.round(nextStepFlip * 20) / 20;
      updateParam("stepFlipDuration", roundedStepFlip);
      nextTotal = blackDuration
        + hookDuration
        + (sequenceMode === "hook-showcase"
          ? hookShowcaseDuration(showcaseCount, roundedStepFlip, params.stepCardHold)
          : stepSequenceDuration(showcaseCount, roundedStepFlip, params.stepCardHold))
        + params.postRollHold;
    } else {
      const nextFlip = Math.max(
        0.7,
        Math.min(8, (ratio * (blackDuration + params.postRollHold) - blackDuration) / (1 - ratio)),
      );
      const nextRollDuration = Math.round(nextFlip * 50) * 20;
      setParams((current) => ({
        ...current,
        rollDuration: nextRollDuration,
        dissolveDuration: Math.min(current.dissolveDuration, nextRollDuration / 1000),
      }));
      nextTotal = blackDuration + nextRollDuration / 1000 + params.postRollHold;
    }
    if (!timelinePlanRef.current) timelinePlanRef.current = createTimelinePlan();
    setPreviewTime((current) => Math.min(current, nextTotal));
    setNotice(language === "zh" ? "时间轴阶段已更新" : "TIMELINE PHASE UPDATED");
  };

  useEffect(() => {
    if (isRolling || !timelinePlanRef.current) return;
    applyTimelineState(Math.min(previewTime, timelineTotal), timelinePlanRef.current);
  }, [applyTimelineState, isRolling, previewTime, timelineTotal]);

  const startAutoRoll = (forcedTargetIndex?: number, restart = false) => {
    if (!items.length) return;
    if (isRolling) {
      if (rollFrameRef.current) window.cancelAnimationFrame(rollFrameRef.current);
      rollFrameRef.current = null;
      setIsRolling(false);
      setIsAnimating(false);
      setIsMotionPhase(
        usesStepShowcase
          ? previewTime >= blackDuration && (
            sequenceMode === "hook-showcase" && previewTime < blackDuration + hookDuration
              ? true
              : (sequenceMode === "hook-showcase" ? hookShowcaseState : stepSequenceState)(
                  Math.max(0, previewTime - blackDuration - hookDuration),
                  timelinePlanRef.current?.showcaseCount ?? showcaseCount,
                  params.stepFlipDuration,
                  params.stepCardHold,
                ).isFlipping
          )
          : previewTime > blackDuration && previewTime < blackDuration + flipDuration,
      );
      setNotice(language === "zh" ? "预览已暂停" : "PREVIEW PAUSED");
      return;
    }
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (rollFrameRef.current) window.cancelAnimationFrame(rollFrameRef.current);

    setAutoplay(false);
    setIsAnimating(true);
    setIsRolling(true);
    setNotice(language === "zh" ? "完整时间线 / 正在预览" : "FULL TIMELINE / PREVIEWING");

    let startTime = restart ? 0 : previewTime;
    let plan = timelinePlanRef.current;
    if (restart || typeof forcedTargetIndex === "number" || !plan || previewTime >= timelineTotal - 0.001) {
      startTime = 0;
      plan = createTimelinePlan(forcedTargetIndex);
      timelinePlanRef.current = plan;
      applyTimelineState(0, plan);
    }
    const activePlan = plan;
    const startedAt = performance.now() - startTime * 1000;

    const advance = (now: number) => {
      const elapsed = Math.min(timelineTotal, (now - startedAt) / 1000);
      applyTimelineState(elapsed, activePlan);

      if (elapsed < timelineTotal) {
        rollFrameRef.current = window.requestAnimationFrame(advance);
        return;
      }

      setActiveIndex(activePlan.targetIndex);
      setRollPosition(null);
      setIsRolling(false);
      setIsMotionPhase(false);
      setIsAnimating(false);
      setMediaReveal(returnToBlack ? 0 : 1);
      setNotice(
        language === "zh"
          ? `素材已锁定 / ${items[activePlan.targetIndex].title}`
          : `MATERIAL LOCKED / ${items[activePlan.targetIndex].title}`,
      );
      rollFrameRef.current = null;
    };

    rollFrameRef.current = window.requestAnimationFrame(advance);
  };

  const initialRollRef = useRef<() => void>(() => undefined);
  useEffect(() => { initialRollRef.current = () => startAutoRoll(undefined, true); });
  useEffect(() => {
    const timer = window.setTimeout(() => initialRollRef.current(), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleStudioPlayback = () => {
    if (autoplay) {
      setAutoplay(false);
      setNotice(language === "zh" ? "预览已暂停" : "PREVIEW PAUSED");
    } else {
      startAutoRoll();
    }
  };

  useEffect(() => {
    playbackToggleRef.current = toggleStudioPlayback;
  });

  useEffect(() => {
    const handleSpacePlayback = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (portal !== null || exporting) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const insideTimeline = Boolean(target?.closest(".timeline-editor"));
      if (target?.isContentEditable || target?.closest("textarea, select, button, [contenteditable='true']")) return;
      if (target?.closest("input") && !insideTimeline) return;
      event.preventDefault();
      playbackToggleRef.current();
    };

    window.addEventListener("keydown", handleSpacePlayback);
    return () => window.removeEventListener("keydown", handleSpacePlayback);
  }, [exporting, portal]);

  const openExport = () => {
    setExportProgress(0);
    setExportStatus(copy.exportWaiting);
    setPortal("export");
  };

  const runExport = async () => {
    if (exporting) return;
    setExporting(true);
    setExportProgress(0);
    try {
      const plan = timelinePlanRef.current ?? createTimelinePlan();
      timelinePlanRef.current = plan;
      const previewStage = stageRef.current;
      const previewCard = previewStage?.querySelector<HTMLElement>(".spatial-card");
      const previewFocus = previewStage?.querySelector<HTMLElement>(
        usesStepShowcase
          ? ".spatial-card.is-active .showcase-data-box"
          : ".spatial-card.is-active .focus-marker",
      );
      const previewFocusTitle = previewStage?.querySelector<HTMLElement>(
        usesStepShowcase
          ? ".spatial-card.is-active .showcase-data-box strong"
          : ".spatial-card.is-active .focus-top span",
      );
      const previewFocusCaption = previewStage?.querySelector<HTMLElement>(
        usesStepShowcase
          ? ".spatial-card.is-active .showcase-data-box p"
          : ".spatial-card.is-active .focus-bottom span",
      );
      const previewHudText = previewStage?.querySelector<HTMLElement>(".hud-top-left");
      const previewHudStyle = previewHudText ? window.getComputedStyle(previewHudText) : null;
      const previewRect = previewStage?.getBoundingClientRect();
      setNotice(language === "zh" ? "正在直接渲染完整时间线" : "DIRECT-RENDERING FULL TIMELINE");
      const result = await exportSequence(
        items,
        {
          aspect,
          resolution: exportResolution,
          rollDuration: params.rollDuration,
          railStartSpeed: params.railStartSpeed,
          hookWaveFrequency: params.hookWaveFrequency,
          flipSpeed: params.flipSpeed,
          rollInertia: params.rollInertia,
          blackIntroEnabled,
          preRollHold: params.preRollHold,
          dissolveDuration: params.dissolveDuration,
          postRollHold: params.postRollHold,
          returnToBlack,
          globalScale: params.globalScale,
          spacing: params.spacing,
          arc: params.arc,
          depth: params.depth,
          scan: params.scan,
          inactiveDim: params.inactiveDim,
          inactiveOpacity: params.inactiveOpacity,
          cardRadius: params.cardRadius,
          monochrome,
          brightness: params.brightness,
          contrast: params.contrast,
          contentFontScale: params.contentFontScale,
          showCardHeadlines,
          showNumbers,
          hudScrollSpeed: params.hudScrollSpeed,
          hudCornerLength: params.hudCornerLength,
          hudColor: params.hudColor,
          showSideHud,
          sideHudStyle,
          sideHudScale: params.sideHudScale,
          hudStyle,
          rollStyle,
          sequenceMode,
          stepFlipStyle,
          stepFlipDuration: params.stepFlipDuration,
          stepCardHold: params.stepCardHold,
          showcaseFrameStyle,
          showcaseTextMotion,
          language,
          startIndex: plan.startIndex,
          showcaseStartIndex: plan.showcaseStartIndex,
          showcaseCount: plan.showcaseCount,
          targetIndex: plan.targetIndex,
          travel: plan.travel,
          previewWidth: previewRect?.width ?? (aspect === "16:9" ? 1920 : 1080),
          previewHeight: previewRect?.height ?? (aspect === "16:9" ? 1080 : 1920),
          previewCardWidth: previewCard?.offsetWidth ?? (aspect === "16:9" ? 210 : 186),
          previewFocusWidth: previewFocus?.offsetWidth ?? 360,
          previewShowcaseTitleFontSize: previewFocusTitle
            ? Number.parseFloat(window.getComputedStyle(previewFocusTitle).fontSize)
            : 17,
          previewShowcaseCaptionFontSize: previewFocusCaption
            ? Number.parseFloat(window.getComputedStyle(previewFocusCaption).fontSize)
            : 6,
          previewHudBaseFontSize: previewHudStyle
            ? Number.parseFloat(previewHudStyle.fontSize)
            : 5 + (params.contentFontScale - 1) * 8,
          previewHudFontFamily: previewHudStyle?.fontFamily ?? '"F37 Analog", "Microsoft YaHei", sans-serif',
        },
        (progress, status) => {
          setExportProgress(progress);
          setExportStatus(status);
          setNotice(status);
        },
      );
      setNotice(
        language === "zh"
          ? `导出完成 / ${result.extension.toUpperCase()}`
          : `EXPORT COMPLETE / ${result.extension.toUpperCase()}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "导出失败";
      setExportStatus(message);
      setNotice(language === "zh" ? "导出失败" : "EXPORT ERROR");
    } finally {
      setExporting(false);
    }
  };

  const openFullscreen = async () => {
    try {
      const stage = stageRef.current;
      if (!stage) return;
      const previewRect = stage.getBoundingClientRect();
      stage.style.setProperty("--stage-preview-width", `${previewRect.width}px`);
      stage.style.setProperty("--stage-preview-height", `${previewRect.height}px`);
      await stage.requestFullscreen();
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const fullscreenRect = stage.getBoundingClientRect();
      const fitScale = Math.min(
        fullscreenRect.width / previewRect.width,
        fullscreenRect.height / previewRect.height,
      );
      stage.style.setProperty("--stage-fullscreen-scale", String(fitScale));
    } catch {
      setNotice(language === "zh" ? "当前环境不支持全屏" : "FULLSCREEN UNAVAILABLE");
    }
  };

  const loadPortfolioExample = () => {
    if (isRolling || exporting) return;
    try {
      const current = {
        ...readProjectState(), sampleSet: SAMPLE_SET,
        items: items.map((item) => item.uploaded ? { ...item, url: undefined } : item),
        activeIndex, language, monochrome, aspect, params, autoplay,
        blackIntroEnabled, returnToBlack, showCardHeadlines, showNumbers, hudStyle,
        showSideHud, sideHudStyle, rollStyle, sequenceMode, stepFlipStyle,
        showcaseFrameStyle, showcaseTextMotion, exportResolution,
        rollTargetId, showcaseStartId, showcaseEndId,
      };
      if (current?.items?.some((item) => !item.id.startsWith("portfolio-"))) {
        window.localStorage.setItem(SAVED_BOARD_STORAGE, JSON.stringify(current));
      }
    } catch {
      setNotice(language === "zh" ? "无法保存当前项目，素材未更改" : "COULD NOT SAVE CURRENT BOARD / MEDIA UNCHANGED");
      return;
    }
    setItems(INITIAL_ITEMS.map((item) => ({ ...item })));
    setActiveIndex(0);
    setShowcaseStartId("auto");
    setShowcaseEndId("all");
    setRollTargetId("random");
    setPreviewTime(0);
    setRollPosition(null);
    timelinePlanRef.current = null;
    setMediaReveal(1);
    setAutoplay(false);
    setRollStyle("orbit");
    setSequenceMode("hook-showcase");
    window.setTimeout(() => initialRollRef.current(), 100);
    setNotice(language === "zh" ? "已加载 15 个作品示例" : "15 PORTFOLIO ASSETS LOADED");
  };



  const hudPresets: [HudStyle, SideHudStyle, string, string][] = [
    ["open-data", "fragments", "I / Open data", "I / 开放数据"],
    ["calibration", "precision", "II / Calibration", "II / 精密校准"],
    ["code-array", "code-pulse", "III / Code array", "III / 代码阵列"],
    ["system-write", "memory-channel", "IV / System index", "IV / 系统索引"],
    ["signal-rails", "signal-nodes", "V / Construction", "V / 构造标尺"],
    ["debug-memory", "minimal", "VI / Debug memory", "VI / 调试内存"],
  ];

  const toggleLanguage = () => {
    const nextLanguage: Language = language === "zh" ? "en" : "zh";
    setLanguage(nextLanguage);
    setNotice(COPY[nextLanguage].ready);
    if (!exporting) setExportStatus(COPY[nextLanguage].exportWaiting);
  };

  return (
    <PlaybackContext.Provider value={autoplay || isRolling}>
    <main
      className="app-shell"
      data-playing={autoplay || isRolling ? "true" : "false"}
      data-language={language}
      style={{
        "--ui-font-scale": params.uiFontScale,
        "--ui-font-grow": `${(params.uiFontScale - 1) * 8}px`,
        "--media-grayscale": monochrome ? 1 : 0,
        "--media-brightness": params.brightness / 100,
        "--media-contrast": params.contrast / 100,
      } as MotionStyle}
    >
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onFileChange}
        aria-label={language === "zh" ? "上传图片或视频" : "Upload images or videos"}
      />

      <header className="topbar">
        <a className="brand" href="#studio" aria-label={language === "zh" ? "空间媒体展示首页" : "Spatial Media Presenter home"}>
          <span className="brand-sigil" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>05 / Spatial Media Presenter</strong>
            <small>MEDIA → SPATIAL SEQUENCE</small>
          </span>
        </a>

        <div className="system-status" aria-live="polite">
          <span className={`status-pulse ${isAnimating ? "is-moving" : ""}`} />
          <span>{notice}</span>
          <span className="status-rule" />
          <span>{String(items.length).padStart(2, "0")} {language === "zh" ? "素材" : "ASSETS"}</span>
        </div>

        <div className="topbar-actions">
          <label className="global-ui-scale" title={copy.uiFontScale}>
            <span>{language === "zh" ? "UI 字号" : "UI TYPE"}</span>
            <input
              type="range"
              min={0.85}
              max={1.45}
              step={0.05}
              value={params.uiFontScale}
              onChange={(event) => updateParam("uiFontScale", Number(event.target.value))}
            />
            <output>{params.uiFontScale.toFixed(2)}×</output>
          </label>
        </div>
      </header>

<nav className="family-nav" aria-label="Creative workflow studios"><span>MUWEN LI / STUDIOS</span><a href="https://meshroom-breakdown-studio.limuwen9.chatgpt.site"><b>03</b>Model Breakdown</a><a href="https://muwentrili.github.io/creative-workflows/collage-motion/"><b>04</b>Animated Storyboard</a><a href="https://flipframe-motion-lab.limuwen9.chatgpt.site" aria-current="page"><b>05</b>Spatial Media Presenter</a><a href="https://muwentrili.github.io/creative-workflows/motion-tracking/"><b>06</b>Motion Tracking Studio</a><a href="https://muwentrili.github.io/creative-workflows/kinetic-typography/"><b>07</b>Kinetic Typography Studio</a><a className="family-index" href="https://github.com/MuwenTriLi/creative-workflows">All projects ↗</a></nav>
      <div className="studio-layout" id="studio">
        <aside className="asset-panel panel">
          <div className="studio-import" onDragOver={(event) => event.preventDefault()} onDrop={onFileDrop}>
            <strong>{language === "zh" ? "01 / 导入素材" : "01 / Import media"}</strong>
            <span>{language === "zh" ? "拖入图片或视频 · 保存在本机" : "Drop images or clips · stored locally"}</span>
            <button type="button" className="studio-primary" onClick={() => fileInputRef.current?.click()}>
              <span aria-hidden="true">⊞</span> {language === "zh" ? "导入素材" : "Import media"}
            </button>
          </div>
          <div className="studio-example">
            <strong>{language === "zh" ? "作品示例 / 15 个素材" : "Portfolio example / 15 assets"}</strong>
            <span>{language === "zh" ? "11 张图像 · 4 段动态作品" : "11 stills · 4 motion studies"}</span>
            <button type="button" disabled={isRolling || exporting} onClick={loadPortfolioExample}>{language === "zh" ? "加载作品示例" : "Load portfolio example"}</button>
          </div>
          <div className="panel-title">
            <div>
              <span className="eyebrow">{copy.mediaNodes}</span>
              <h2>{copy.visualArchive}</h2>
            </div>
            <span className="panel-count">{String(items.length).padStart(2, "0")}</span>
          </div>
          <p className="asset-order-hint"><i aria-hidden="true" />{copy.reorderHint}</p>
          <div className="showcase-range-bar">
            <div>
              <span>{copy.showcaseRange}</span>
              <strong>
                {String(preferredShowcaseStartIndex + 1).padStart(2, "0")}
                <i aria-hidden="true">→</i>
                {String(preferredShowcaseEndIndex + 1).padStart(2, "0")}
                <small>{showcaseCount} {copy.showcaseRangeCount}</small>
              </strong>
            </div>
            <button type="button" onClick={resetShowcaseRange} disabled={isRolling}>
              {copy.showcaseRangeReset}
            </button>
            <p>{copy.showcaseRangeHint}</p>
          </div>

          <div className="asset-list" aria-label={language === "zh" ? "素材与展示顺序" : "Media and showcase order"}>
            {items.map((item, index) => (
              <div
                className={`asset-row ${index === activeIndex ? "is-active" : ""} ${showcaseRangeIdSet.has(item.id) ? "is-showcase-range" : ""} ${index === preferredShowcaseStartIndex ? "is-showcase-start" : ""} ${index === preferredShowcaseEndIndex ? "is-showcase-end" : ""} ${draggedItemId === item.id ? "is-dragging" : ""} ${dragOverItemId === item.id && draggedItemId !== item.id ? "is-drop-target" : ""}`}
                key={item.id}
                draggable={!isRolling}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                  setDraggedItemId(item.id);
                }}
                onDragOver={(event) => {
                  if (!draggedItemId || draggedItemId === item.id) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOverItemId(item.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId = draggedItemId ?? event.dataTransfer.getData("text/plain");
                  if (sourceId) reorderAsset(sourceId, item.id);
                }}
                onDragEnd={() => {
                  setDraggedItemId(null);
                  setDragOverItemId(null);
                }}
              >
                <button
                  className="asset-select"
                  type="button"
                  onClick={() => selectAsset(index)}
                  aria-label={`${language === "zh" ? "切换到" : "Select"} ${item.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <span className="asset-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="asset-thumb"><MediaSurface item={item} /></span>
                  <span className="asset-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {item.tag}
                      {item.kind === "video" && item.duration
                        ? ` · ${formatClipTime((item.trimEnd ?? item.duration) - (item.trimStart ?? 0))}`
                        : ""}
                    </small>
                  </span>
                </button>
                <div className="asset-range-actions" aria-label={`${copy.showcaseRange}: ${item.title}`}>
                  <button
                    className={index === preferredShowcaseStartIndex ? "is-active" : ""}
                    type="button"
                    title={copy.showcaseRangeStart}
                    aria-label={`${copy.showcaseRangeStart}: ${item.title}`}
                    aria-pressed={index === preferredShowcaseStartIndex}
                    draggable={false}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowcaseBoundary("start", item.id);
                    }}
                    disabled={isRolling}
                  >IN</button>
                  <button
                    className={index === preferredShowcaseEndIndex ? "is-active" : ""}
                    type="button"
                    title={copy.showcaseRangeEnd}
                    aria-label={`${copy.showcaseRangeEnd}: ${item.title}`}
                    aria-pressed={index === preferredShowcaseEndIndex}
                    draggable={false}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowcaseBoundary("end", item.id);
                    }}
                    disabled={isRolling}
                  >OUT</button>
                </div>
                <button
                  className="asset-drag-handle"
                  type="button"
                  title={copy.reorderAsset}
                  aria-label={`${copy.reorderAsset}: ${item.title}`}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveAssetBy(item.id, -1);
                    }
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveAssetBy(item.id, 1);
                    }
                  }}
                ><span aria-hidden="true" /></button>
                <button
                  className="asset-remove"
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`${language === "zh" ? "移除" : "Remove"} ${item.title}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <section className="asset-tune-panel" aria-label={copy.assetAdjust}>
            <span className="eyebrow">{copy.assetAdjust}</span>
            {activeItem.kind === "video" && activeItem.url && (
              <VideoTrimEditor
                item={activeItem}
                language={language}
                copy={copy}
                onChange={updateItemTrim}
              />
            )}
            <RangeControl
              label={copy.assetScale}
              value={activeItem.scale ?? 1}
              min={0.55}
              max={1.55}
              step={0.01}
              suffix="×"
              onChange={(value) => updateActiveTransform("scale", value)}
            />
            <RangeControl
              label={copy.assetX}
              value={activeItem.offsetX ?? 0}
              min={-180}
              max={180}
              step={2}
              suffix="px"
              onChange={(value) => updateActiveTransform("offsetX", value)}
            />
            <RangeControl
              label={copy.assetY}
              value={activeItem.offsetY ?? 0}
              min={-140}
              max={140}
              step={2}
              suffix="px"
              onChange={(value) => updateActiveTransform("offsetY", value)}
            />
            <div className="asset-tune-actions">
              <button type="button" onClick={resetActiveTransform}>{copy.resetAsset}</button>
              <button type="button" onClick={() => removeItem(activeItem.id)}>{copy.deleteAsset}</button>
            </div>
          </section>

          <button className="asset-import" type="button" onClick={() => setPortal("import")}>
            <span aria-hidden="true">＋</span>
            <span>
              <strong>{copy.importNew}</strong>
              <small>{copy.importHint}</small>
            </span>
          </button>

          <div className="system-readout">
            <div><span>{copy.localCache}</span><strong>{copy.enabled}</strong></div>
            <div><span>{copy.colorMode}</span><strong>{monochrome ? copy.monochromeMode : copy.originalColor}</strong></div>
            <div><span>{copy.renderNode}</span><strong>{copy.available}</strong></div>
          </div>
        </aside>

        <section className="stage-column" aria-label={language === "zh" ? "3D 浏览动画预览" : "3D media browser preview"}>
          <div className="stage-header">
            <div>
              <span className="eyebrow">{language === "zh" ? "02 / 展示" : "02 / PRESENTATION"}</span>
              <h1>{language === "zh" ? "让图像与视频成为空间演示" : "Turn media into a spatial presentation"}</h1>
              <p className="studio-purpose">{language === "zh" ? "导入图像与视频 → 编排顺序与节奏 → 导出 4K 演示。" : "Import images & clips → arrange the sequence → set timing → export in 4K."}</p>
            </div>
            <div className="stage-tools">
              <div className="aspect-switch" aria-label={copy.canvasAspect}>
                {(["16:9", "9:16"] as AspectMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={aspect === mode ? "is-selected" : ""}
                    type="button"
                    onClick={() => setAspect(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <button className="fullscreen-button" type="button" onClick={openFullscreen} aria-label={copy.expand}>
                {copy.expand}
              </button>
            </div>
          </div>

          <div className="studio-transport" aria-label={language === "zh" ? "预览控制" : "Preview controls"}>
            <span>{language === "zh" ? "排列 → 调整节奏 → 导出" : "Arrange → set timing → export"}</span>
            <div className="studio-playback">
              <button type="button" className="studio-primary" disabled={exporting} onClick={toggleStudioPlayback} aria-pressed={autoplay || isRolling}>
                {autoplay || isRolling ? (language === "zh" ? "Ⅱ 暂停" : "Ⅱ Pause") : (language === "zh" ? "▶ 播放" : "▶ Play")}
              </button>
              <button type="button" disabled={isRolling || exporting} onClick={() => { setAutoplay(false); selectAsset(0); }} aria-label={language === "zh" ? "返回第一项" : "Go to first asset"}>|◁</button>
              <button type="button" disabled={isRolling || exporting} onClick={() => { setAutoplay(false); selectAsset(wrap(activeIndex - 1, items.length)); }} aria-label={language === "zh" ? "上一项" : "Previous asset"}>◁|</button>
              <button type="button" disabled={isRolling || exporting} onClick={() => { setAutoplay(false); selectAsset(wrap(activeIndex + 1, items.length)); }} aria-label={language === "zh" ? "下一项" : "Next asset"}>|▷</button>
              <label className="studio-numbers"><input type="checkbox" checked={showNumbers} onChange={(event) => setShowNumbers(event.target.checked)} />{language === "zh" ? "显示编号" : "Show numbers"}</label>
              <button type="button" onClick={toggleLanguage} aria-label={language === "zh" ? "Switch to English" : "Switch to Chinese"}>{language === "zh" ? "EN" : "中文"}</button>
            </div>
          </div>
          <div className="studio-hud-heading"><span>{language === "zh" ? "边框与侧边 HUD" : "Frame & side HUD"}</span><button type="button" onClick={() => setControlSection("hud")}>{language === "zh" ? "自定义叠加效果 ↗" : "Customize overlays ↗"}</button></div>
          <div className="studio-hud-presets" role="group" aria-label={language === "zh" ? "HUD 样式" : "HUD presets"}>
            {hudPresets.map(([style, side, en, zh]) => <button key={style} type="button" aria-pressed={hudStyle === style} onClick={() => { setHudStyle(style); setSideHudStyle(side); setShowSideHud(true); updateParam("hudColor", "#ffffff"); }}>{language === "zh" ? zh : en}</button>)}
          </div>
          <div className="stage-viewport">
            <div
              ref={stageRef}
              className={`stage-frame ${trackDragging ? "is-dragging" : ""} ${isRolling ? "is-rolling" : ""} ${isMotionPhase ? "is-motion-active" : ""}`}
              data-aspect={aspect}
              data-hud={hudStyle}
              data-side-hud={showSideHud ? "true" : "false"}
              data-side-hud-style={sideHudStyle}
              data-roll-style={rollStyle}
              data-sequence-mode={sequenceMode}
              data-step-flip={stepFlipStyle}
              data-showcase-frame={showcaseFrameStyle}
              data-showcase-motion={showcaseTextMotion}
              data-show-numbers={showNumbers ? "true" : "false"}
              data-show-headlines={showCardHeadlines ? "true" : "false"}
              style={{
                "--scan-opacity": params.scan / 100,
                "--data-field-opacity": (params.scan / 100) * 0.46,
                "--card-radius": `${params.cardRadius}px`,
                "--media-reveal": mediaReveal,
                "--ui-font-grow": `${(params.contentFontScale - 1) * 8}px`,
                "--roll-duration": `${params.rollDuration}ms`,
                "--hud-code-duration-a": `${13 / (params.hudScrollSpeed / 100)}s`,
                "--hud-code-duration-b": `${16 / (params.hudScrollSpeed / 100)}s`,
                "--hud-code-duration-c": `${11 / (params.hudScrollSpeed / 100)}s`,
                "--data-field-duration": `${18 / (params.hudScrollSpeed / 100)}s`,
                "--card-data-duration": `${9 / (params.hudScrollSpeed / 100)}s`,
                "--hud-corner-length": `${params.hudCornerLength}px`,
                "--hud-color": params.hudColor,
                "--hud-rgb": hexToRgbChannels(params.hudColor),
                "--side-hud-scale": params.sideHudScale,
                "--sequence-flip-angle": `${sequenceFlipAngle}deg`,
                "--sequence-copy-opacity": sequenceCopyOpacity,
              } as MotionStyle}
            >
              <div className="stage-scene">
              <div className="hud-vignette" />
              <div className="hud-data-field" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, row) => (
                  <div
                    className="data-field-row"
                    key={row}
                    style={{ "--flow-row": row } as MotionStyle}
                  >
                    <span>{`FRAME_BUS[${String(row).padStart(2, "0")}] :: SIGNAL_LOCKED / ${telemetry[row % telemetry.length]}`}</span>
                    <span>{`AXM_VECTOR = [${telemetry[(row + 2) % telemetry.length]}, ${telemetry[(row + 4) % telemetry.length]}] / NODE_${String(row + 1).padStart(2, "0")}`}</span>
                    <i />
                  </div>
                ))}
              </div>
              <div className="hud-code-stream" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, column) => (
                  <div className={`code-column code-column-${column + 1}`} key={column}>
                    {[...HUD_CODE_LINES, ...HUD_CODE_LINES].map((line, index) => (
                      <span key={`${column}-${index}`}>{line} / {telemetry[(index + column) % telemetry.length]}</span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="hud-corner-data" aria-hidden="true">
                <span className="corner-data corner-data-a">ID {telemetry[0]}<i>AX/{telemetry[1]}</i></span>
                <span className="corner-data corner-data-b">BUF {telemetry[2]}<i>TR/{telemetry[3]}</i></span>
                <span className="corner-data corner-data-c">0x{telemetry[4]}<i>SYS.{telemetry[5]}</i></span>
                <span className="corner-data corner-data-d">FRM {telemetry[6]}<i>LK/{telemetry[7]}</i></span>
              </div>
              <div className="hud-frame-variant" aria-hidden="true">
                <i className="frame-corner frame-a" />
                <i className="frame-corner frame-b" />
                <i className="frame-corner frame-c" />
                <i className="frame-corner frame-d" />
              </div>
              <div className="hud-open-rails" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, index) => <i key={index} />)}
              </div>
              <div className="hud-write-stack" aria-hidden="true">
                <strong>SYS.WRITE / {telemetry[0]}</strong>
                <span>BUFFER MAP ........ {telemetry[1]}</span>
                <span>SECTOR COMMIT ..... {telemetry[2]}</span>
                <span>PACKET VERIFY ..... {telemetry[3]}</span>
                <i><b style={{ width: `${42 + (telemetryTick % 49)}%` }} /></i>
              </div>
              <div className="hud-memory-matrix" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span key={index} style={{ "--memory-cell": index } as MotionStyle}>0x{telemetry[index % telemetry.length]} / {String(index * 16).padStart(3, "0")}</span>
                ))}
              </div>
              <div className="hud-signal-rails" aria-hidden="true">
                {(["left", "right"] as const).map((side, railIndex) => (
                  <div className={`signal-rail signal-rail-${side}`} key={side}>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <span key={index}>
                        <i />
                        <b>{index % 3 === 0 ? `${44 + index * 5 + railIndex * 2}` : telemetry[(index + railIndex * 3) % telemetry.length].slice(0, 2)}</b>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="hud-reticle">
                <span />
                <i className="reticle-dot dot-a" />
                <i className="reticle-dot dot-b" />
                <i className="reticle-dot dot-c" />
              </div>
              <div className="hud-top-left">
                <strong>SRM / PRGM</strong>
                <span>{copy.spatialIndex}</span>
              </div>
              <div className="hud-top-right">
                <span>ARC</span>
                <strong>{params.arc}px</strong>
                <i />
              </div>
              <div className="hud-side-scale">
                {Array.from({ length: 9 }).map((_, index) => <i key={index} />)}
              </div>

              <div
                className="carousel-track"
                onPointerDown={onTrackPointerDown}
                onPointerMove={onTrackPointerMove}
                onPointerUp={onTrackPointerUp}
                onPointerCancel={onTrackPointerUp}
              >
                {cardEntries.map(({ item, index, distance, stepTarget, showcaseTopCopyReveal, showcasePanelCopyReveal, showcasePanelTitleReveal, showcasePanelCaptionReveal, cardStyle }) => (
                  <article
                    className={`spatial-card ${index === visualActiveIndex ? "is-active" : ""} ${stepTarget ? "is-sequence-target" : ""} ${distance > 3.4 ? "is-outside" : ""}`}
                    style={cardStyle}
                    key={item.id}
                    aria-hidden={distance > 0.5}
                  >
                    <div className="card-caption">
                      <strong>{item.title}</strong>
                      <span>{item.tag}</span>
                    </div>
                    <div className="card-page">
                      <div className="showcase-card-link showcase-card-link-top" aria-hidden="true"><i /></div>
                      <div className="showcase-topline-box" aria-hidden="true">
                        <span>{showcaseTextMotion === "typewriter"
                          ? <TypewriterText text={showcaseTopline(item, index)} progress={showcaseTopCopyReveal} />
                          : showcaseTopline(item, index)}</span>
                        <i />
                      </div>
                    <div className="card-surface">
                      <MediaSurface item={item} />
                      <div className="card-tone" />
                      <div className="card-sequence-mask" />
                      <div className="card-motion-fx" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, marker) => <i key={marker} />)}
                      </div>
                      <div className="card-border">
                        <i className="edge-marker edge-a" />
                        <i className="edge-marker edge-b" />
                        <i className="edge-marker edge-c" />
                        <i className="edge-marker edge-d" />
                      </div>
                      <div className="card-dots" aria-hidden="true">
                        {Array.from({ length: 20 }).map((_, dot) => <i key={dot} />)}
                      </div>
                      <div className="card-data-ticker" aria-hidden="true">
                        {[
                          `const node_${String(index + 1).padStart(2, "0")} = await link("${item.tag}")`,
                          `frame.bus[0x${telemetry[index % telemetry.length]}] => signal.lock()`,
                          `vector.map({ depth: ${telemetry[(index + 2) % telemetry.length]}, axis: ${telemetry[(index + 3) % telemetry.length]} })`,
                          `render.commit("${item.title.slice(0, 18)}")`,
                          `status = 0b${telemetry[(index + 5) % telemetry.length]} // ${item.kind === "video" ? "STREAM_LIVE" : "FRAME_READY"}`,
                        ].map((line, lineIndex) => (
                          <span key={lineIndex} style={{ "--code-row": lineIndex } as MotionStyle}>{line}</span>
                        ))}
                        <i />
                      </div>
                      <div className="card-overlay">
                        <span className="card-sequence">VIS / {String(index + 1).padStart(3, "0")}</span>
                        <div>
                          <span>{item.kind === "video" ? "MOTION SOURCE" : "STATIC SOURCE"}</span>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    </div>
                      <div className="showcase-data-box" aria-hidden="true">
                        <span>{showcaseTextMotion === "typewriter"
                          ? <TypewriterText text={`DATA PANEL / N-${String(index + 1).padStart(2, "0")}`} progress={showcasePanelCopyReveal} />
                          : `DATA PANEL / N-${String(index + 1).padStart(2, "0")}`}</span>
                        <strong>{showcaseTextMotion === "typewriter"
                          ? <TypewriterText text={showcaseTitle(item, index)} progress={showcasePanelTitleReveal} />
                          : showcaseTitle(item, index)}</strong>
                        <p>{showcaseTextMotion === "typewriter"
                          ? <TypewriterText text={showcaseCaption(item, index)} progress={showcasePanelCaptionReveal} />
                          : showcaseCaption(item, index)}</p>
                        <i />
                        <b className="showcase-extension" />
                      </div>
                      <div className="showcase-card-link showcase-card-link-bottom" aria-hidden="true"><i /></div>
                    </div>
                    <div className="focus-marker focus-top" aria-hidden="true">
                      <i />
                      <span>{`FOCUS / ${item.tag}`}</span>
                    </div>
                    <div className="focus-marker focus-bottom" aria-hidden="true">
                      <span>{`CONTENT / ${item.title}`}</span>
                      <i />
                    </div>
                  </article>
                ))}
              </div>

              <button className="stage-nav nav-prev" type="button" disabled={isRolling} onClick={() => changeCard(-1)} aria-label={copy.previous}>
                ←
              </button>
              <button className="stage-nav nav-next" type="button" disabled={isRolling} onClick={() => changeCard(1)} aria-label={copy.next}>
                →
              </button>

              <div className="hud-bottom-left">
                <span>{copy.distance}</span><strong>{params.depth}.04</strong>
                <span>{copy.track}</span><strong>{params.spacing}.8</strong>
              </div>
              <div className="hud-bottom-center">
                <span>{copy.dragToNavigate}</span>
                <div className="sequence-dots">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      className={index === visualActiveIndex ? "is-active" : ""}
                      type="button"
                      disabled={isRolling}
                      onClick={() => {
                        setActiveIndex(index);
                        timelinePlanRef.current = null;
                        setPreviewTime(0);
                        setMediaReveal(1);
                      }}
                      aria-label={`${language === "zh" ? "跳转到" : "Jump to"} ${item.title}`}
                    />
                  ))}
                </div>
              </div>
              <div className="hud-bottom-right">
                <span>{copy.gridZoom}</span>
                <strong>{aspect === "16:9" ? copy.wide : copy.vertical}</strong>
              </div>
              </div>
            </div>
          </div>

          <section className="timeline-editor" aria-label={copy.timeline}>
            <div className="timeline-transport">
              <button
                className={`timeline-play ${isRolling ? "is-playing" : ""}`}
                type="button"
                onClick={toggleStudioPlayback}
                aria-label={autoplay || isRolling ? copy.pauseAnimation : copy.previewAnimation}
                aria-keyshortcuts="Space"
              >
                {autoplay || isRolling ? "Ⅱ" : "▶"}
              </button>
              <div className="timeline-timecode">
                <span>{copy.timeline}</span>
                <strong>{formatTimelineTime(previewTime)}</strong>
              </div>
              <div className="timeline-frame-readout">
                <span>{copy.timelineFrame}</span>
                <strong>{String(Math.round(previewTime * 60)).padStart(4, "0")} / {String(Math.ceil(timelineTotal * 60)).padStart(4, "0")}</strong>
              </div>
              <div className="timeline-total">
                <span>{copy.totalLength}</span>
                <strong>{formatTimelineTime(timelineTotal)}</strong>
              </div>
            </div>

            <div className="timeline-interaction-guide" aria-hidden="true">
              <span className="guide-playhead"><i />{copy.timelinePlayheadGuide}</span>
              <span className="guide-boundary"><i />{copy.timelineBoundaryGuide}</span>
              <span className="guide-space"><i />{copy.timelineSpaceGuide}</span>
            </div>

            {sequenceMode === "hook-showcase" && (
              <div className="timeline-motion-controls">
                <RangeControl
                  label={copy.railStartSpeed}
                  value={params.railStartSpeed}
                  min={0.8}
                  max={24}
                  step={0.1}
                  suffix="×"
                  onChange={updateRailPeakSpeed}
                />
                <RangeControl
                  label={copy.hookWaveFrequency}
                  value={params.hookWaveFrequency}
                  min={0.55}
                  max={1.6}
                  step={0.05}
                  suffix="×"
                  onChange={(value) => updateParam("hookWaveFrequency", value)}
                />
                <RangeControl
                  label={copy.hookDuration}
                  value={params.rollDuration}
                  min={1200}
                  max={8000}
                  step={20}
                  suffix="ms"
                  onChange={updateRollDuration}
                />
              </div>
            )}

            <div
              className="timeline-track-area"
              onPointerDown={beginTimelineScrub}
              onPointerMove={moveTimelineScrub}
              onPointerUp={endTimelineScrub}
              onPointerCancel={endTimelineScrub}
            >
              <div className="timeline-ruler" aria-hidden="true">
                {Array.from({ length: 9 }, (_, index) => {
                  const ratio = index / 8;
                  const frame = Math.round(timelineTotal * 60 * ratio);
                  return <span key={index} style={{ left: `${ratio * 100}%` }}><i />{frame}</span>;
                })}
              </div>
              <div className="timeline-segments" aria-hidden="true">
                {blackDuration > 0 && (
                  <span
                    className="timeline-segment segment-black"
                    style={{ flexBasis: `${(blackDuration / Math.max(timelineTotal, 0.001)) * 100}%` }}
                  >
                    <b>{copy.blackSegment}</b>
                    <small>{params.preRollHold.toFixed(1)}s</small>
                  </span>
                )}
                {sequenceMode === "roulette" ? (
                  <span
                    className="timeline-segment segment-flip"
                    style={{ flexBasis: `${(flipDuration / Math.max(timelineTotal, 0.001)) * 100}%` }}
                  >
                    <b>{copy.flipSegment}</b>
                    <small>{flipDuration.toFixed(2)}s</small>
                  </span>
                ) : (
                  <>
                    {sequenceMode === "hook-showcase" && (
                      <span
                        className="timeline-segment segment-hook"
                        style={{ flexBasis: `${(hookDuration / Math.max(timelineTotal, 0.001)) * 100}%` }}
                      >
                        <b>{copy.hookSegment}</b>
                        <small>{hookDuration.toFixed(2)}s · {params.railStartSpeed.toFixed(2)}× START · WAVE RAIL</small>
                      </span>
                    )}
                    {orderedShowcaseItems.map((item, index) => (
                      <span
                        className="timeline-segment segment-step-card"
                        style={{ flexBasis: `${((sequenceMode === "hook-showcase" && index === 0
                          ? params.stepCardHold
                          : params.stepFlipDuration + params.stepCardHold) / Math.max(timelineTotal, 0.001)) * 100}%` }}
                        key={item.id}
                      >
                        <b>{String(index + 1).padStart(2, "0")} / {item.title}</b>
                        <small>
                          {sequenceMode === "hook-showcase" && index === 0
                            ? `FOCUS · ${params.stepCardHold.toFixed(1)}s HOLD`
                            : `${params.stepFlipDuration.toFixed(2)}s ${sequenceMode === "hook-showcase" ? "GLIDE" : "FLIP"} · ${params.stepCardHold.toFixed(1)}s HOLD`}
                        </small>
                      </span>
                    ))}
                  </>
                )}
                <span
                  className="timeline-segment segment-hold"
                  style={{ flexBasis: `${(params.postRollHold / Math.max(timelineTotal, 0.001)) * 100}%` }}
                >
                  <b>{copy.holdSegment}</b>
                  <small>{params.postRollHold.toFixed(1)}s</small>
                  {returnToBlack && <i aria-hidden="true" />}
                </span>
              </div>
              {blackDuration > 0 && (
                <span
                  className="timeline-handle-callout callout-black"
                  style={{ left: `${(blackDuration / Math.max(timelineTotal, 0.001)) * 100}%` }}
                  aria-hidden="true"
                >{copy.blackEndHandle}</span>
              )}
              {sequenceMode === "hook-showcase" && (
                <span
                  className="timeline-handle-callout callout-hook"
                  style={{ left: `${((blackDuration + hookDuration) / Math.max(timelineTotal, 0.001)) * 100}%` }}
                  aria-hidden="true"
                >{copy.hookEndHandle}</span>
              )}
              <span
                className="timeline-handle-callout callout-flip"
                style={{ left: `${((blackDuration + flipDuration) / Math.max(timelineTotal, 0.001)) * 100}%` }}
                aria-hidden="true"
              >{usesStepShowcase ? copy.sequenceEndHandle : copy.flipEndHandle}</span>
              {blackDuration > 0 && (
                <input
                  className="timeline-boundary boundary-black"
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={(blackDuration / Math.max(timelineTotal, 0.001)) * 100}
                  onChange={(event) => editTimelineBoundary("black", Number(event.target.value))}
                  aria-label={`${copy.blackSegment} / ${copy.timelineEditHint}`}
                />
              )}
              {sequenceMode === "hook-showcase" && (
                <input
                  className="timeline-boundary boundary-hook"
                  type="range"
                  min={2}
                  max={92}
                  step={0.1}
                  value={((blackDuration + hookDuration) / Math.max(timelineTotal, 0.001)) * 100}
                  onChange={(event) => editTimelineBoundary("hook", Number(event.target.value))}
                  aria-label={`${copy.hookDuration} / ${copy.timelineEditHint}`}
                />
              )}
              <input
                className="timeline-boundary boundary-flip"
                type="range"
                min={blackDuration > 0 ? (blackDuration / Math.max(timelineTotal, 0.001)) * 100 + 2 : 2}
                max={96}
                step={0.1}
                value={((blackDuration + flipDuration) / Math.max(timelineTotal, 0.001)) * 100}
                onChange={(event) => editTimelineBoundary("flip", Number(event.target.value))}
                aria-label={`${usesStepShowcase ? copy.stepShowcaseMode : copy.flipSegment} / ${copy.timelineEditHint}`}
              />
              <input
                className="timeline-scrubber"
                type="range"
                min={0}
                max={timelineTotal}
                step={1 / 60}
                value={Math.min(previewTime, timelineTotal)}
                onChange={(event) => scrubTimeline(Number(event.target.value))}
                style={{ "--timeline-progress": `${(previewTime / Math.max(timelineTotal, 0.001)) * 100}%` } as MotionStyle}
                aria-label={copy.timelineHint}
              />
              <div className="timeline-playhead" style={{ left: `${(previewTime / Math.max(timelineTotal, 0.001)) * 100}%` }} aria-hidden="true"><i /></div>
            </div>

            <div className="timeline-cues" aria-hidden="true">
              <span style={{ left: "0%" }}>00:00.00</span>
              {blackDuration > 0 && (
                <span style={{ left: `${(blackDuration / Math.max(timelineTotal, 0.001)) * 100}%` }}>
                  FLIP IN · {formatTimelineTime(blackDuration)}
                </span>
              )}
              {sequenceMode === "hook-showcase" && (
                <span style={{ left: `${((blackDuration + hookDuration) / Math.max(timelineTotal, 0.001)) * 100}%` }}>
                  SHOWCASE IN · {formatTimelineTime(blackDuration + hookDuration)}
                </span>
              )}
              <span style={{ left: `${((blackDuration + flipDuration) / Math.max(timelineTotal, 0.001)) * 100}%` }}>
                {usesStepShowcase ? "SEQUENCE END" : "HOLD"} · {formatTimelineTime(blackDuration + flipDuration)}
              </span>
              <span style={{ left: "100%" }}>{formatTimelineTime(timelineTotal)}</span>
            </div>
            <p>{copy.timelineHint} · {copy.timelineEditHint}</p>
          </section>
        </section>

        <aside className="control-panel panel">
          <div className="studio-export">
            <span>{language === "zh" ? "03 / 导出" : "03 / Export"}</span>
            <button type="button" className="studio-primary" onClick={openExport}>{language === "zh" ? "检查并导出 ↗" : "Review & export ↗"}</button>
            <small>{language === "zh" ? "检查顺序、节奏和画幅，再导出 4K 视频。" : "Check order, timing and framing before your 4K export."}</small>
          </div>
          <div className="panel-title">
            <div>
              <span className="eyebrow">{copy.parameters}</span>
              <h2>{copy.motionControl}</h2>
            </div>
            <button className="reset-button" type="button" onClick={resetParameters} aria-label={copy.reset}>
              ↺
            </button>
          </div>

          <nav className="control-tabs" aria-label={language === "zh" ? "参数分组" : "Control groups"}>
            {([
              ["motion", copy.tabMotion],
              ["cards", copy.tabCards],
              ["look", copy.tabLook],
              ["hud", copy.tabHud],
              ["text", copy.tabText],
            ] as [ControlSection, string][]).map(([section, label]) => (
              <button
                className={controlSection === section ? "is-active" : ""}
                key={section}
                type="button"
                onClick={() => setControlSection(section)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="control-tab-body">
            {controlSection === "motion" && (
              <section className="control-tab-content" aria-label={copy.tabMotion}>
                {sequenceMode !== "hook-showcase" && <div className="timeline-note">
                  <i aria-hidden="true" />
                  <div>
                    <strong>{copy.blackCardIntro}</strong>
                    <span>{copy.blackCardIntroDescription}</span>
                  </div>
                  <button
                    className={`switch ${blackIntroEnabled ? "is-on" : ""}`}
                    type="button"
                    role="switch"
                    aria-checked={blackIntroEnabled}
                    onClick={() => {
                      setBlackIntroEnabled((current) => {
                        const next = !current;
                        setMediaReveal(next ? 0 : 1);
                        return next;
                      });
                      setPreviewTime(0);
                      setRollPosition(null);
                      timelinePlanRef.current = null;
                    }}
                  ><span /></button>
                </div>}

                {sequenceMode === "roulette" && (
                  <div className="auto-row">
                    <div><strong>{copy.autoSequence}</strong><span>{copy.autoDescription}</span></div>
                    <button
                      className={`switch ${autoplay ? "is-on" : ""}`}
                      type="button"
                      role="switch"
                      aria-checked={autoplay}
                      onClick={() => setAutoplay((current) => !current)}
                    ><span /></button>
                  </div>
                )}

                {sequenceMode !== "hook-showcase" && <div className="auto-row">
                  <div><strong>{copy.returnToBlack}</strong><span>{copy.returnToBlackDescription}</span></div>
                  <button
                    className={`switch ${returnToBlack ? "is-on" : ""}`}
                    type="button"
                    role="switch"
                    aria-checked={returnToBlack}
                    onClick={() => setReturnToBlack((current) => !current)}
                  ><span /></button>
                </div>}

                <div className="roll-row">
                  <div>
                    <strong>
                      {sequenceMode === "hook-showcase"
                        ? copy.hookShowcaseMode
                        : sequenceMode === "step-showcase"
                          ? copy.stepShowcaseMode
                          : copy.autoRoll}
                    </strong>
                    <span>
                      {sequenceMode === "hook-showcase"
                        ? copy.hookShowcaseDescription
                        : sequenceMode === "step-showcase"
                          ? copy.stepShowcaseDescription
                          : copy.autoRollDescription}
                    </span>
                  </div>
                  <div className="motion-selector mode-selector">
                    <span>{copy.sequenceMode}</span>
                    <div>
                      {(["roulette", "step-showcase", "hook-showcase"] as SequenceMode[]).map((mode) => (
                        <button
                          className={sequenceMode === mode ? "is-active" : ""}
                          disabled={isRolling}
                          key={mode}
                          type="button"
                          onClick={() => changeSequenceMode(mode)}
                        >
                          {mode === "roulette"
                            ? copy.rouletteMode
                            : mode === "hook-showcase"
                              ? copy.hookShowcaseShort
                              : copy.stepShowcaseMode}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(sequenceMode === "roulette" || sequenceMode === "hook-showcase") && (
                    <label className="roll-target">
                      <span>{sequenceMode === "hook-showcase" ? copy.showcaseStartTarget : copy.rollTarget}</span>
                      <select
                        value={sequenceMode === "hook-showcase" ? showcaseStartId : rollTargetId}
                        onChange={(event) => {
                          if (sequenceMode === "hook-showcase") setShowcaseStartId(event.target.value);
                          else setRollTargetId(event.target.value);
                          timelinePlanRef.current = null;
                          setPreviewTime(0);
                        }}
                        disabled={isRolling}
                      >
                        <option value={sequenceMode === "hook-showcase" ? "auto" : "random"}>
                          {sequenceMode === "hook-showcase" ? copy.featuredTarget : copy.randomTarget}
                        </option>
                        {items.map((item, index) => (
                          <option value={item.id} key={item.id}>
                            {String(index + 1).padStart(2, "0")} / {item.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className={`motion-selector ${sequenceMode === "hook-showcase" ? "is-locked" : ""}`}>
                    <span>{sequenceMode === "hook-showcase" ? copy.rollStyle : usesStepShowcase ? copy.stepFlipAnimation : copy.rollStyle}</span>
                    <div>
                      {sequenceMode === "hook-showcase" ? (
                        <button className="is-active" type="button" aria-pressed="true">
                          {copy.rollOrbit}
                        </button>
                      ) : usesStepShowcase ? (
                        ([
                          ["horizontal", copy.stepFlipHorizontal],
                          ["vertical", copy.stepFlipVertical],
                          ["diagonal", copy.stepFlipDiagonal],
                        ] as [StepFlipStyle, string][]).map(([style, label]) => (
                          <button
                            className={stepFlipStyle === style ? "is-active" : ""}
                            disabled={isRolling}
                            key={style}
                            type="button"
                            onClick={() => setStepFlipStyle(style)}
                          >
                            {label}
                          </button>
                        ))
                      ) : (
                        ([
                          ["glide", copy.rollGlide],
                          ["side-flip", copy.rollSideFlip],
                          ["orbit", copy.rollOrbit],
                        ] as [RollStyle, string][]).map(([style, label]) => (
                          <button
                            className={rollStyle === style ? "is-active" : ""}
                            disabled={isRolling}
                            key={style}
                            type="button"
                            onClick={() => setRollStyle(style)}
                          >
                            {label}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <button className="roll-button" type="button" onClick={() => startAutoRoll()} aria-keyshortcuts="Space">
                    <span>
                      {isRolling ? copy.pauseAnimation : copy.previewAnimation}
                      {" · "}
                      {formatTimelineTime(timelineTotal)}
                    </span>
                    <i aria-hidden="true">◎</i>
                  </button>
                </div>

                <section className="motion-parameter-group">
                  <header><strong>{copy.motionTimelineGroup}</strong><span>{copy.motionTimelineScope}</span></header>
                  <div className="control-stack">
                    {sequenceMode !== "hook-showcase" && <RangeControl label={copy.preRollHold} value={params.preRollHold} min={0} max={3} step={0.1} suffix="s" disabled={!blackIntroEnabled} onChange={(value) => updateParam("preRollHold", value)} />}
                    {sequenceMode !== "hook-showcase" && <RangeControl
                      label={copy.dissolveDuration}
                      value={params.dissolveDuration}
                      min={0.15}
                      max={Math.max(0.15, Math.min(2.4, flipDuration))}
                      step={0.05}
                      suffix="s"
                      disabled={sequenceMode === "step-showcase" && !returnToBlack}
                      onChange={(value) => updateParam("dissolveDuration", value)}
                    />}
                    {sequenceMode === "roulette" && <RangeControl label={copy.rollDuration} value={params.rollDuration} min={700} max={8000} step={20} suffix="ms" onChange={updateRollDuration} />}
                    <RangeControl label={copy.postRollHold} value={params.postRollHold} min={0.5} max={8} step={0.1} suffix="s" onChange={(value) => updateParam("postRollHold", value)} />
                    {sequenceMode === "roulette" && <RangeControl label={copy.rollInertia} value={params.rollInertia} min={0} max={100} step={1} suffix="%" onChange={(value) => updateParam("rollInertia", value)} />}
                  </div>
                </section>

                {sequenceMode === "hook-showcase" && (
                  <section className="motion-parameter-group">
                    <header><strong>{copy.hookSequenceGroup}</strong><span>{copy.hookSequenceScope}</span></header>
                    <div className="control-stack">
                      <RangeControl label={copy.hookDuration} value={params.rollDuration} min={1200} max={8000} step={20} suffix="ms" onChange={updateRollDuration} />
                      <RangeControl label={copy.railStartSpeed} value={params.railStartSpeed} min={0.8} max={24} step={0.1} suffix="×" onChange={updateRailPeakSpeed} />
                      <RangeControl label={copy.hookWaveFrequency} value={params.hookWaveFrequency} min={0.55} max={1.6} step={0.05} suffix="×" onChange={(value) => updateParam("hookWaveFrequency", value)} />
                      <RangeControl label={copy.hookBraking} value={params.rollInertia} min={0} max={100} step={1} suffix="%" onChange={(value) => updateParam("rollInertia", value)} />
                    </div>
                  </section>
                )}

                {usesStepShowcase && (
                  <section className="motion-parameter-group">
                    <header><strong>{copy.stepSequenceGroup}</strong><span>{copy.stepSequenceScope}</span></header>
                    <div className="control-stack">
                      <RangeControl label={sequenceMode === "hook-showcase" ? copy.hookCardDuration : copy.stepFlipDuration} value={params.stepFlipDuration} min={0.3} max={3.2} step={0.05} suffix="s" onChange={(value) => updateParam("stepFlipDuration", value)} />
                      <RangeControl label={copy.stepCardHold} value={params.stepCardHold} min={0.3} max={6} step={0.1} suffix="s" onChange={(value) => updateParam("stepCardHold", value)} />
                    </div>
                  </section>
                )}

                {sequenceMode === "roulette" && (
                  <section className={`motion-parameter-group ${rollStyle !== "side-flip" ? "is-inactive" : ""}`}>
                    <header><strong>{copy.sideFlipGroup}</strong><span>{rollStyle === "side-flip" ? copy.sideFlipEnabled : copy.sideFlipOnly}</span></header>
                    <div className="control-stack">
                      <RangeControl label={copy.flipSpeed} value={params.flipSpeed} min={0.55} max={4} step={0.05} suffix="×" disabled={rollStyle !== "side-flip"} onChange={(value) => updateParam("flipSpeed", value)} />
                    </div>
                  </section>
                )}

                <section className="motion-parameter-group">
                  <header><strong>{copy.browseMotionGroup}</strong><span>{copy.browseMotionScope}</span></header>
                  <div className="control-stack">
                    <RangeControl label={copy.speed} value={params.speed} min={280} max={1400} step={20} suffix="ms" onChange={(value) => updateParam("speed", value)} />
                    <RangeControl label={copy.hold} value={params.hold} min={1.8} max={7} step={0.1} suffix="s" onChange={(value) => updateParam("hold", value)} />
                  </div>
                </section>
              </section>
            )}

            {controlSection === "cards" && (
              <section className="control-tab-content" aria-label={copy.tabCards}>
                <div className="control-stack">
                  <RangeControl label={copy.globalScale} value={params.globalScale} min={0.55} max={1.7} step={0.05} suffix="×" onChange={(value) => updateParam("globalScale", value)} />
                  <RangeControl label={copy.spacing} value={params.spacing} min={96} max={240} step={2} suffix="px" onChange={(value) => updateParam("spacing", value)} />
                  <RangeControl label={copy.arc} value={params.arc} min={0} max={42} step={1} suffix="px" onChange={(value) => updateParam("arc", value)} />
                  <RangeControl label={copy.depth} value={params.depth} min={48} max={190} step={2} suffix="px" onChange={(value) => updateParam("depth", value)} />
                  <RangeControl label={copy.inactiveDim} value={params.inactiveDim} min={0} max={88} step={1} suffix="%" onChange={(value) => updateParam("inactiveDim", value)} />
                  <RangeControl label={copy.inactiveOpacity} value={params.inactiveOpacity} min={8} max={100} step={1} suffix="%" onChange={(value) => updateParam("inactiveOpacity", value)} />
                  <RangeControl label={copy.cardRadius} value={params.cardRadius} min={0} max={28} step={1} suffix="px" onChange={(value) => updateParam("cardRadius", value)} />
                </div>
              </section>
            )}

            {controlSection === "look" && (
              <section className="color-control-panel control-tab-content" aria-label={copy.colorMode}>
                <div className="color-toggle-row">
                  <div>
                    <strong>{copy.monochromeMode}</strong>
                    <span>{copy.monochromeDescription}</span>
                  </div>
                  <button
                    className={`switch ${monochrome ? "is-on" : ""}`}
                    type="button"
                    role="switch"
                    aria-checked={monochrome}
                    onClick={() => setMonochrome((current) => !current)}
                  >
                    <span />
                  </button>
                </div>
                <RangeControl label={copy.brightness} value={params.brightness} min={40} max={160} step={1} suffix="%" onChange={(value) => updateParam("brightness", value)} />
                <RangeControl label={copy.contrast} value={params.contrast} min={40} max={200} step={1} suffix="%" onChange={(value) => updateParam("contrast", value)} />
                <button
                  className="restore-color-button"
                  type="button"
                  onClick={() => {
                    setMonochrome(false);
                    updateParam("brightness", 100);
                    updateParam("contrast", 100);
                  }}
                >
                  {copy.restoreOriginal}
                </button>
              </section>
            )}

            {controlSection === "hud" && (
              <section className="control-tab-content" aria-label={copy.tabHud}>
                <div className="hud-selector">
                  <span className="eyebrow">{copy.hudStyle}</span>
                  <div>
                    {([
                      ["open-data", copy.hudOpenData],
                      ["calibration", copy.hudCalibration],
                      ["code-array", copy.hudCodeArray],
                      ["system-write", copy.hudSystemWrite],
                      ["signal-rails", copy.hudSignalRails],
                      ["debug-memory", copy.hudDebugMemory],
                    ] as [HudStyle, string][]).map(([style, label]) => (
                      <button
                        className={hudStyle === style ? "is-active" : ""}
                        key={style}
                        type="button"
                        onClick={() => setHudStyle(style)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-stack">
                  <RangeControl label={copy.hudScrollSpeed} value={params.hudScrollSpeed} min={60} max={320} step={5} suffix="%" onChange={(value) => updateParam("hudScrollSpeed", value)} />
                  <RangeControl label={copy.hudCornerLength} value={params.hudCornerLength} min={12} max={72} step={1} suffix="px" onChange={(value) => updateParam("hudCornerLength", value)} />
                  <RangeControl label={copy.sideHudSize} value={params.sideHudScale} min={0.6} max={1.2} step={0.05} suffix="×" onChange={(value) => updateParam("sideHudScale", value)} />
                  <RangeControl label={copy.scan} value={params.scan} min={0} max={85} step={1} suffix="%" onChange={(value) => updateParam("scan", value)} />
                </div>
                <div className="auto-row side-hud-toggle">
                  <div><strong>{copy.showSideHud}</strong><span>{copy.showSideHudDescription}</span></div>
                  <button
                    className={`switch ${showSideHud ? "is-on" : ""}`}
                    type="button"
                    role="switch"
                    aria-checked={showSideHud}
                    onClick={() => setShowSideHud((current) => !current)}
                  ><span /></button>
                </div>
                <div className="side-hud-style-selector">
                  <span className="eyebrow">{copy.sideHudStyle}</span>
                  <div>
                    {([
                      ["fragments", copy.sideHudFragments],
                      ["code-pulse", copy.sideHudCodePulse],
                      ["precision", copy.sideHudPrecision],
                      ["memory-channel", copy.sideHudMemory],
                      ["signal-nodes", copy.sideHudNodes],
                      ["minimal", copy.sideHudMinimal],
                    ] as [SideHudStyle, string][]).map(([style, label]) => (
                      <button
                        className={sideHudStyle === style ? "is-active" : ""}
                        key={style}
                        type="button"
                        disabled={!showSideHud}
                        onClick={() => setSideHudStyle(style)}
                      >{label}</button>
                    ))}
                  </div>
                </div>
                <div className="hud-color-control">
                  <span className="control-label"><span>{copy.hudColor}</span><output>{params.hudColor.toUpperCase()}</output></span>
                  <div>
                    <input
                      type="color"
                      value={params.hudColor}
                      aria-label={copy.hudColor}
                      onChange={(event) => updateParam("hudColor", event.target.value)}
                    />
                    <button type="button" onClick={() => updateParam("hudColor", "#d7dde0")}>{copy.hudNeutral}</button>
                  </div>
                </div>
              </section>
            )}

            {controlSection === "text" && (
              <section className="control-tab-content" aria-label={copy.tabText}>
                <div className="auto-row card-headline-toggle">
                  <div><strong>{copy.showCardHeadlines}</strong><span>{copy.showCardHeadlinesDescription}</span></div>
                  <button
                    className={`switch ${showCardHeadlines ? "is-on" : ""}`}
                    type="button"
                    role="switch"
                    aria-checked={showCardHeadlines}
                    onClick={() => setShowCardHeadlines((current) => !current)}
                  ><span /></button>
                </div>
                <div className="control-stack">
                  <RangeControl label={copy.contentFontScale} value={params.contentFontScale} min={0.8} max={2} step={0.05} suffix="×" onChange={(value) => updateParam("contentFontScale", value)} />
                </div>
                <div className="showcase-config-grid">
                  <div className="motion-selector">
                    <span>{copy.showcaseFrameStyle}</span>
                    <div>
                      {([
                        ["corner-lock", copy.frameCornerLock],
                        ["open-rail", copy.frameOpenRail],
                        ["split-bracket", copy.frameSplitBracket],
                      ] as [ShowcaseFrameStyle, string][]).map(([style, label]) => (
                        <button
                          className={showcaseFrameStyle === style ? "is-active" : ""}
                          key={style}
                          type="button"
                          onClick={() => setShowcaseFrameStyle(style)}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="motion-selector">
                    <span>{copy.showcaseTextMotion}</span>
                    <div>
                      {([
                        ["typewriter", copy.textTypewriter],
                        ["data-decode", copy.textDataDecode],
                        ["scan-read", copy.textScanRead],
                      ] as [ShowcaseTextMotion, string][]).map(([motion, label]) => (
                        <button
                          className={showcaseTextMotion === motion ? "is-active" : ""}
                          key={motion}
                          type="button"
                          onClick={() => setShowcaseTextMotion(motion)}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="annotation-panel">
                  <span className="eyebrow">{copy.annotation}</span>
                  <label>
                    <span>{copy.title}</span>
                    <input value={activeItem.title} onChange={(event) => updateActiveItem("title", event.target.value)} />
                  </label>
                  <label>
                    <span>{copy.category}</span>
                    <input value={activeItem.tag} onChange={(event) => updateActiveItem("tag", event.target.value)} />
                  </label>
                  <label>
                    <span>{copy.description}</span>
                    <textarea value={activeItem.description} rows={2} onChange={(event) => updateActiveItem("description", event.target.value)} />
                  </label>
                </div>
                <div className="annotation-panel showcase-copy-panel">
                  <span className="eyebrow">{copy.showcaseCopy}</span>
                  <label>
                    <span>{copy.showcaseTopline}</span>
                    <input
                      value={activeItem.showcaseTopline ?? ""}
                      placeholder={showcaseTopline(activeItem, activeIndex)}
                      onChange={(event) => updateActiveItem("showcaseTopline", event.target.value)}
                    />
                    <small>{copy.showcaseToplineHint}</small>
                  </label>
                  <label>
                    <span>{copy.showcaseTitle}</span>
                    <input
                      value={activeItem.showcaseTitle ?? ""}
                      placeholder={showcaseTitle(activeItem, activeIndex)}
                      onChange={(event) => updateActiveItem("showcaseTitle", event.target.value)}
                    />
                    <small>{copy.showcaseTitleHint}</small>
                  </label>
                  <label>
                    <span>{copy.showcaseCaption}</span>
                    <input
                      value={activeItem.showcaseCaption ?? ""}
                      placeholder={showcaseCaption(activeItem, activeIndex)}
                      onChange={(event) => updateActiveItem("showcaseCaption", event.target.value)}
                    />
                    <small>{copy.showcaseCaptionHint}</small>
                  </label>
                </div>
              </section>
            )}
          </div>

          <button className="export-summary" type="button" onClick={openExport}>
            <span>
              <small>{copy.exportPortal}</small>
              <strong>{aspect} / {exportResolution} / {formatTimelineTime(timelineTotal)}</strong>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        </aside>
      </div>

      {portal === "import" && (
        <div className="portal-backdrop">
          <section className="portal import-portal" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div className="portal-head">
              <div><span className="eyebrow">{copy.inputPortal}</span><h2 id="import-title">{copy.importMedia}</h2></div>
              <button type="button" onClick={() => setPortal(null)} aria-label={copy.closeImport}>×</button>
            </div>
            <button
              className={`portal-dropzone ${dropActive ? "is-active" : ""}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={() => setDropActive(true)}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDropActive(false)}
              onDrop={onFileDrop}
            >
              <span className="drop-reticle" aria-hidden="true"><i /><i /></span>
              <strong>{copy.dropHere}</strong>
              <p>{copy.dropDescription}</p>
              <span className="drop-action">{copy.selectFiles}</span>
            </button>
            <div className="portal-specs">
              <div><span>{copy.supported}</span><strong>JPG / PNG / WEBP / MP4 / MOV</strong></div>
              <div><span>{copy.processing}</span><strong>{copy.localPrivate}</strong></div>
              <div><span>{copy.limit}</span><strong>{copy.browserMemory}</strong></div>
            </div>
          </section>
        </div>
      )}

      {portal === "export" && (
        <div className="portal-backdrop">
          <section className="portal export-portal" role="dialog" aria-modal="true" aria-labelledby="export-title">
            <div className="portal-head">
              <div><span className="eyebrow">{copy.renderPortal}</span><h2 id="export-title">{copy.exportSequence}</h2></div>
              <button type="button" onClick={() => !exporting && setPortal(null)} aria-label={copy.closeExport}>×</button>
            </div>

            <div className="export-sync-card">
              <span className={`format-shape shape-${aspect.replace(":", "")}`} aria-hidden="true" />
              <div>
                <span>{copy.exportSynced}</span>
                <strong>{aspect} / {aspect === "16:9" ? EXPORT_DIMENSIONS[exportResolution].wide : EXPORT_DIMENSIONS[exportResolution].vertical}</strong>
                <small>
                  MP4 / H.264 · {sequenceMode === "roulette" ? activeRollLabel[rollStyle] : sequenceMode === "hook-showcase" ? copy.hookShowcaseMode : copy.stepShowcaseMode} · {activeHudLabel[hudStyle]} · 60 FPS · {EXPORT_DIMENSIONS[exportResolution].bitrate} · {formatTimelineTime(timelineTotal)}
                </small>
              </div>
            </div>

            <div className="resolution-picker" aria-label={language === "zh" ? "导出分辨率" : "Export resolution"}>
              <div>
                <span>{language === "zh" ? "输出分辨率" : "OUTPUT RESOLUTION"}</span>
                <strong>{language === "zh" ? "最高质量渲染" : "MAXIMUM QUALITY RENDER"}</strong>
              </div>
              <div className="resolution-options">
                {(["4K", "6K", "8K"] as ExportResolution[]).map((resolution) => (
                  <button
                    key={resolution}
                    type="button"
                    className={exportResolution === resolution ? "is-active" : ""}
                    disabled={exporting}
                    onClick={() => setExportResolution(resolution)}
                  >
                    <b>{resolution}</b>
                    <small>{aspect === "16:9" ? EXPORT_DIMENSIONS[resolution].wide : EXPORT_DIMENSIONS[resolution].vertical}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="export-flow" aria-label={language === "zh" ? "导出流程" : "Export flow"}>
              {[copy.exportStep1, copy.exportStep2, copy.exportStep3].map((step, index) => (
                <div key={step}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="export-progress">
              <div><span>{exportStatus}</span><strong>{Math.round(exportProgress * 100)}%</strong></div>
              <span className="progress-track"><i style={{ width: `${exportProgress * 100}%` }} /></span>
              <small>{copy.exportNote}</small>
            </div>

            <button
              className="preview-export-button"
              type="button"
              disabled={exporting || isRolling}
              onClick={() => {
                setPortal(null);
                window.requestAnimationFrame(() => startAutoRoll(undefined, true));
              }}
            >
              <span>{copy.previewAnimation}</span>
              <span aria-hidden="true">▶</span>
            </button>

            <button className="render-button" type="button" onClick={runExport} disabled={exporting}>
              <span>{exporting ? copy.rendering : copy.startExport}</span>
              <span aria-hidden="true">{exporting ? "···" : "↗"}</span>
            </button>
          </section>
        </div>
      )}
    </main>
    </PlaybackContext.Provider>
  );
}
