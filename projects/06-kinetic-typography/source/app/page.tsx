'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines,
  Check,
  Download,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
  Volume2,
  WandSparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type TimedWord = {
  word: string;
  punctuation?: string;
  start: number;
  end: number;
};

type TimedPhrase = {
  text: string;
  start: number;
  end: number;
};

type TimedLine = {
  words: TimedWord[];
  text: string;
  start: number;
  end: number;
};

type DisplayMode = 'single' | 'line';
type LineAlign = 'left' | 'center' | 'right';
type OutputMode = 'premiere' | 'alpha';

type SpeechChunk = {
  text: string;
  timestamp: [number | null, number | null];
};

type Transcriber = (
  audio: Float32Array,
  options: Record<string, unknown>,
) => Promise<{ text: string; chunks?: SpeechChunk[] }>;

type ProcessState = 'idle' | 'decoding' | 'loading-model' | 'transcribing' | 'ready' | 'encoding' | 'error';

type RenderSettings = {
  displayMode: DisplayMode;
  lineAlign: LineAlign;
  motionCalm: number;
  fontScale: number;
  safeArea: number;
  syncOffset: number;
  textColor: string;
  outputMode: OutputMode;
};

const DEMO_TEXT = 'Good tools make room for human judgment. Shape the rhythm. Keep control.';
const DEMO_DURATION = 8;
const FPS = 30;
const MODEL_LABEL = 'WHISPER BASE / LOCKED WORD TIMESTAMPS';
const LINE_WORD_LIMIT = 4;
const LINE_CHARACTER_LIMIT = 24;
const CAPTION_ROW_LIMIT = 2;
const CAPTION_WORD_LIMIT = LINE_WORD_LIMIT * CAPTION_ROW_LIMIT;
const CAPTION_TARGET_WORDS = 6;
const CAPTION_MIN_WORDS = 3;

const PROTECTED_PHRASES = [
  ['in', 'order', 'to'],
  ['a', 'little', 'bit'],
  ['as', 'you', 'go'],
  ['i', 'think'],
  ['you', 'can'],
  ['we', 'can'],
  ['this', 'is'],
  ['there', 'is'],
  ['there', 'are'],
  ['we', 'are'],
  ['you', 'are'],
  ['it', 'is'],
  ['going', 'to'],
  ['have', 'to'],
  ['need', 'to'],
  ['used', 'to'],
  ['kind', 'of'],
  ['sort', 'of'],
  ['one', 'of'],
  ['such', 'as'],
  ['rather', 'than'],
] as const;

const FORWARD_BINDERS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'my', 'your', 'our', 'their', 'his', 'her', 'its',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'from', 'with',
  'into', 'onto', 'about', 'over', 'under', 'between', 'through',
  'without', 'within', 'and', 'or', 'but', 'because', 'if', 'when',
  'while', 'where', 'so', 'than',
]);

const SUBJECT_WORDS = new Set(['i', 'you', 'we', 'they', 'he', 'she', 'it', 'this', 'that']);
const SUBJECT_LINKERS = new Set([
  'am', 'is', 'are', 'was', 'were', 'can', 'could', 'will', 'would',
  'should', 'may', 'might', 'must', 'have', 'has', 'had', 'think',
  'know', 'want', 'need', 'like', 'see', 'feel',
]);
const CLAUSE_STARTERS = new Set(['and', 'but', 'so', 'then', 'because', 'when', 'while', 'if', 'where']);
const QUESTION_WORDS = new Set(['who', 'what', 'when', 'where', 'why', 'how', 'which', 'whose']);
const QUESTION_AUXILIARIES = new Set([
  'am', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could',
  'will', 'would', 'should', 'have', 'has', 'had', 'may', 'might', 'must',
]);
const QUESTION_SUBJECTS = new Set([
  'i', 'you', 'we', 'they', 'he', 'she', 'it', 'this', 'that', 'there',
  'anyone', 'someone', 'everybody', 'anything', 'something',
]);

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return String(minutes).padStart(2, '0') + ':' + rest.toFixed(2).padStart(5, '0');
}

function visibleWords(text: string) {
  return text
    .replace(/[’]/g, "'")
    .match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*(?:\.[A-Za-z0-9]+)*/g) ?? [];
}

function transcriptTokens(text: string) {
  const normalized = text.replace(/[’]/g, "'");
  const matches = Array.from(normalized.matchAll(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*(?:\.[A-Za-z0-9]+)*/g));
  return matches.map((match, index) => {
    const wordEnd = (match.index ?? 0) + match[0].length;
    const nextWordStart = matches[index + 1]?.index ?? normalized.length;
    const betweenWords = normalized.slice(wordEnd, nextWordStart);
    const punctuation = betweenWords.match(/[,.!?;:]+/)?.[0] ?? '';
    return { word: match[0], punctuation };
  });
}

function applyPunctuationToWords(words: TimedWord[], transcript: string): TimedWord[] {
  const tokens = transcriptTokens(transcript);
  return words.map((item, index) => ({
    ...item,
    punctuation: tokens[index]?.punctuation || undefined,
  }));
}

function displayedWord(item: TimedWord) {
  return item.word + (item.punctuation ?? '');
}

function sliderNumber(value: number | readonly number[]) {
  return typeof value === 'number' ? value : value[0] ?? 0;
}

function distributeWords(text: string, duration: number): TimedWord[] {
  const words = visibleWords(text);
  if (!words.length) return [];
  const pad = Math.min(0.08, duration * 0.01);
  const usable = Math.max(0.1, duration - pad * 2);
  const step = usable / words.length;
  return words.map((word, index) => ({
    word,
    start: pad + index * step,
    end: index === words.length - 1 ? duration : pad + (index + 1) * step,
  }));
}

function chunksToWords(chunks: SpeechChunk[], text: string, duration: number): TimedWord[] {
  const timed: TimedWord[] = [];
  for (const chunk of chunks) {
    const words = visibleWords(chunk.text);
    if (!words.length) continue;
    const start = typeof chunk.timestamp?.[0] === 'number' ? chunk.timestamp[0] : null;
    const end = typeof chunk.timestamp?.[1] === 'number' ? chunk.timestamp[1] : null;
    if (start === null || end === null || end <= start) continue;
    const slice = (end - start) / words.length;
    words.forEach((word, index) => {
      timed.push({
        word,
        start: Math.max(0, start + index * slice),
        end: Math.min(duration, start + (index + 1) * slice),
      });
    });
  }
  return timed.length ? timed : distributeWords(text, duration);
}

function alignEditedWords(reference: TimedWord[], words: string[], duration: number): TimedWord[] {
  if (!words.length) return [];
  if (!reference.length) return distributeWords(words.join(' '), duration);
  if (reference.length === words.length) {
    return words.map((word, index) => ({
      word,
      start: reference[index].start,
      end: reference[index].end,
    }));
  }
  const normalize = (word: string) => word.toLowerCase();
  const costs = Array.from(
    { length: reference.length + 1 },
    () => Array<number>(words.length + 1).fill(0),
  );

  for (let referenceIndex = 0; referenceIndex <= reference.length; referenceIndex += 1) {
    costs[referenceIndex][0] = referenceIndex;
  }
  for (let wordIndex = 0; wordIndex <= words.length; wordIndex += 1) {
    costs[0][wordIndex] = wordIndex;
  }

  for (let referenceIndex = 1; referenceIndex <= reference.length; referenceIndex += 1) {
    for (let wordIndex = 1; wordIndex <= words.length; wordIndex += 1) {
      const substitution = normalize(reference[referenceIndex - 1].word) === normalize(words[wordIndex - 1]) ? 0 : 1;
      costs[referenceIndex][wordIndex] = Math.min(
        costs[referenceIndex - 1][wordIndex - 1] + substitution,
        costs[referenceIndex - 1][wordIndex] + 1,
        costs[referenceIndex][wordIndex - 1] + 1,
      );
    }
  }

  // Map every edited word to the nearest original speech slot. Diagonal edits
  // are preferred so a simple correction always keeps the exact source timing.
  const slotByWord = Array<number | null>(words.length).fill(null);
  let referenceIndex = reference.length;
  let wordIndex = words.length;
  while (referenceIndex > 0 || wordIndex > 0) {
    if (referenceIndex > 0 && wordIndex > 0) {
      const substitution = normalize(reference[referenceIndex - 1].word) === normalize(words[wordIndex - 1]) ? 0 : 1;
      if (costs[referenceIndex][wordIndex] === costs[referenceIndex - 1][wordIndex - 1] + substitution) {
        slotByWord[wordIndex - 1] = referenceIndex - 1;
        referenceIndex -= 1;
        wordIndex -= 1;
        continue;
      }
    }
    if (wordIndex > 0 && costs[referenceIndex][wordIndex] === costs[referenceIndex][wordIndex - 1] + 1) {
      wordIndex -= 1;
      continue;
    }
    referenceIndex -= 1;
  }

  slotByWord.forEach((slot, index) => {
    if (slot !== null) return;
    let previous: number | null = null;
    let next: number | null = null;
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      if (slotByWord[cursor] !== null) {
        previous = slotByWord[cursor];
        break;
      }
    }
    for (let cursor = index + 1; cursor < slotByWord.length; cursor += 1) {
      if (slotByWord[cursor] !== null) {
        next = slotByWord[cursor];
        break;
      }
    }
    slotByWord[index] = next ?? previous ?? Math.min(reference.length - 1, index);
  });

  const lightWords = new Set(['a', 'an', 'the', 'of', 'to', 'is', 'we', 'are', 'can', 'in', 'on']);
  const wordsBySlot = new Map<number, number[]>();
  slotByWord.forEach((slot, index) => {
    const resolvedSlot = slot as number;
    wordsBySlot.set(resolvedSlot, [...(wordsBySlot.get(resolvedSlot) ?? []), index]);
  });

  const aligned = Array<TimedWord | null>(words.length).fill(null);
  wordsBySlot.forEach((indices, slot) => {
    const timing = reference[slot];
    const weights = indices.map((index) => {
      const word = words[index];
      const normalized = word.toLowerCase();
      if (lightWords.has(normalized)) return 0.7;
      if (normalized.length <= 3) return 0.85;
      if (normalized.length >= 7) return 1.25;
      return 1;
    });
    const totalWeight = weights.reduce((total, weight) => total + weight, 0);
    const span = Math.max(0.001, timing.end - timing.start);
    let cursor = timing.start;
    weights.forEach((weight, offset) => {
      const nextCursor = offset === weights.length - 1 ? timing.end : cursor + span * weight / totalWeight;
      const index = indices[offset];
      aligned[index] = {
        word: words[index],
        start: Math.max(0, cursor),
        end: Math.min(duration, nextCursor),
      };
      cursor = nextCursor;
    });
  });

  return aligned.filter((item): item is TimedWord => item !== null);
}

function buildPhrases(sequence: TimedWord[]): TimedPhrase[] {
  return sequence.map((item) => ({
    text: displayedWord(item),
    start: item.start,
    end: item.end,
  }));
}

function phraseLengthAt(words: TimedWord[], index: number) {
  const normalized = words.map((item) => item.word.toLowerCase());
  for (const phrase of PROTECTED_PHRASES) {
    if (phrase.every((word, offset) => normalized[index + offset] === word)) return phrase.length;
  }
  return 0;
}

function semanticUnits(words: TimedWord[]) {
  const units: TimedWord[][] = [];
  for (let index = 0; index < words.length; index += 1) {
    const protectedLength = phraseLengthAt(words, index);
    if (protectedLength) {
      units.push(words.slice(index, index + protectedLength));
      index += protectedLength - 1;
      continue;
    }

    const current = words[index];
    const next = words[index + 1];
    const afterNext = words[index + 2];
    const normalized = current.word.toLowerCase();
    const nextNormalized = next?.word.toLowerCase();

    if (next && /^\d+[A-Za-z]$/i.test(current.word)) {
      units.push([current, next]);
      index += 1;
      continue;
    }

    if (
      next
      && current.word !== 'I'
      && /^[A-Z][A-Za-z0-9-]+$/.test(current.word)
      && /^[A-Z][A-Za-z0-9-]+$/.test(next.word)
    ) {
      const capitalized = [current, next];
      if (afterNext && /^[A-Z][A-Za-z0-9-]+$/.test(afterNext.word)) capitalized.push(afterNext);
      units.push(capitalized);
      index += capitalized.length - 1;
      continue;
    }

    if (next && FORWARD_BINDERS.has(normalized)) {
      if (afterNext && FORWARD_BINDERS.has(nextNormalized)) {
        units.push([current, next, afterNext]);
        index += 2;
      } else {
        units.push([current, next]);
        index += 1;
      }
      continue;
    }

    if (next && SUBJECT_WORDS.has(normalized) && SUBJECT_LINKERS.has(nextNormalized)) {
      units.push([current, next]);
      index += 1;
      continue;
    }

    units.push([current]);
  }
  return units;
}

function rowCharacterCount(words: TimedWord[]) {
  return words.reduce((total, item) => total + displayedWord(item).length, 0) + Math.max(0, words.length - 1);
}

function rowFits(words: TimedWord[]) {
  return words.length <= LINE_WORD_LIMIT && rowCharacterCount(words) <= LINE_CHARACTER_LIMIT;
}

function wrapWordsIntoRows(words: TimedWord[]) {
  const unitRows: TimedWord[][][] = [];
  let currentUnits: TimedWord[][] = [];

  semanticUnits(words).forEach((unit) => {
    const currentWords = currentUnits.flat();
    if (currentWords.length && !rowFits([...currentWords, ...unit])) {
      unitRows.push(currentUnits);
      currentUnits = [];
    }
    currentUnits.push(unit);
  });

  if (currentUnits.length) unitRows.push(currentUnits);

  if (unitRows.length === 2) {
    const first = unitRows[0];
    const second = unitRows[1];
    while (first.length > 1) {
      const firstWords = first.flat();
      const secondWords = second.flat();
      if (secondWords.length >= 2 && firstWords.length - secondWords.length <= 2) break;
      const moving = first[first.length - 1];
      const remaining = first.slice(0, -1).flat();
      const expandedSecond = [...moving, ...secondWords];
      if (remaining.length < 2 || !rowFits(expandedSecond)) break;
      first.pop();
      second.unshift(moving);
    }
  }

  return unitRows.map((row) => row.flat());
}

function sentenceWordGroups(sequence: TimedWord[], transcript: string) {
  const segments = transcript.match(/[^.!?;:\n]+(?:[.!?;:]+|$)/g) ?? [];
  const counts = segments.map((segment) => visibleWords(segment).length).filter(Boolean);
  if (!counts.length || counts.reduce((total, count) => total + count, 0) !== sequence.length) {
    return sequence.length ? [sequence] : [];
  }

  let cursor = 0;
  return counts.map((count) => {
    const group = sequence.slice(cursor, cursor + count);
    cursor += count;
    return group;
  });
}

function splitSentenceIntoCaptions(words: TimedWord[]) {
  if (!words.length) return [];
  const units = semanticUnits(words);
  const bestCosts = Array<number>(units.length + 1).fill(Number.POSITIVE_INFINITY);
  const nextBreak = Array<number>(units.length + 1).fill(-1);
  bestCosts[units.length] = 0;

  for (let start = units.length - 1; start >= 0; start -= 1) {
    const candidateUnits: TimedWord[][] = [];
    for (let end = start + 1; end <= units.length; end += 1) {
      candidateUnits.push(units[end - 1]);
      const candidate = candidateUnits.flat();
      if (candidate.length > CAPTION_WORD_LIMIT) break;
      const rows = wrapWordsIntoRows(candidate);
      if (rows.length > CAPTION_ROW_LIMIT) break;
      if (!Number.isFinite(bestCosts[end])) continue;

      const isWholeSentence = start === 0 && end === units.length;
      const isSentenceEnd = end === units.length;
      const target = isWholeSentence ? words.length : CAPTION_TARGET_WORDS;
      let cost = bestCosts[end] + Math.pow(candidate.length - target, 2);

      if (!isWholeSentence && candidate.length < CAPTION_MIN_WORDS) cost += 72;
      if (isSentenceEnd && words.length > CAPTION_MIN_WORDS && candidate.length < CAPTION_MIN_WORDS) cost += 120;
      if (rows.length === 2) {
        const rowDifference = Math.abs(rows[0].length - rows[1].length);
        cost += rowDifference * 1.5;
        if (Math.min(rows[0].length, rows[1].length) === 1) cost += 80;
      }

      if (!isSentenceEnd) {
        const previous = candidate[candidate.length - 1];
        const following = units[end][0];
        const pause = Math.max(0, following.start - previous.end);
        if (pause >= 0.48) cost -= 16;
        else if (pause >= 0.3) cost -= 9;
        else if (pause >= 0.16) cost -= 3;
        if (CLAUSE_STARTERS.has(following.word.toLowerCase())) cost -= 4;
      }

      if (cost < bestCosts[start] || (cost === bestCosts[start] && end > nextBreak[start])) {
        bestCosts[start] = cost;
        nextBreak[start] = end;
      }
    }
  }

  if (nextBreak[0] < 0) return [words];
  const captions: TimedWord[][] = [];
  for (let cursor = 0; cursor < units.length;) {
    const end = nextBreak[cursor];
    if (end <= cursor) return [words];
    captions.push(units.slice(cursor, end).flat());
    cursor = end;
  }
  return captions;
}

function buildLines(sequence: TimedWord[], transcript: string): TimedLine[] {
  return sentenceWordGroups(sequence, transcript)
    .flatMap((sentence) => splitSentenceIntoCaptions(sentence))
    .map((words) => ({
      words,
      text: words.map(displayedWord).join(' '),
      start: words[0].start,
      end: words[words.length - 1].end,
    }));
}

function boundarySplitsProtectedPhrase(words: TimedWord[], boundaryIndex: number) {
  for (let start = Math.max(0, boundaryIndex - 2); start <= boundaryIndex; start += 1) {
    const length = phraseLengthAt(words, start);
    if (length && start + length - 1 > boundaryIndex) return true;
  }
  return false;
}

function likelyQuestion(words: TimedWord[]) {
  const normalized = words.map((item) => item.word.toLowerCase());
  if (!normalized.length) return false;
  if (QUESTION_WORDS.has(normalized[0])) return true;
  return QUESTION_AUXILIARIES.has(normalized[0]) && QUESTION_SUBJECTS.has(normalized[1] ?? '');
}

function estimatePitch(buffer: AudioBuffer, centerSeconds: number) {
  const channel = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const frameSize = Math.min(2048, Math.max(768, Math.round(sampleRate * 0.055)));
  const center = Math.round(centerSeconds * sampleRate);
  const start = Math.max(0, Math.min(channel.length - frameSize, center - Math.floor(frameSize / 2)));
  if (start < 0 || start + frameSize > channel.length) return null;

  let mean = 0;
  for (let index = 0; index < frameSize; index += 1) mean += channel[start + index];
  mean /= frameSize;
  let energy = 0;
  for (let index = 0; index < frameSize; index += 1) {
    const value = channel[start + index] - mean;
    energy += value * value;
  }
  if (Math.sqrt(energy / frameSize) < 0.008) return null;

  const minimumLag = Math.max(2, Math.floor(sampleRate / 360));
  const maximumLag = Math.min(frameSize - 2, Math.floor(sampleRate / 75));
  let bestLag = 0;
  let bestCorrelation = 0;
  for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
    let correlation = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    for (let index = 0; index < frameSize - lag; index += 2) {
      const left = channel[start + index] - mean;
      const right = channel[start + index + lag] - mean;
      correlation += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }
    const normalized = correlation / Math.max(0.000001, Math.sqrt(leftEnergy * rightEnergy));
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }
  return bestCorrelation >= 0.34 && bestLag ? sampleRate / bestLag : null;
}

function hasRisingIntonation(buffer: AudioBuffer | null, finalWord: TimedWord) {
  if (!buffer || finalWord.end - finalWord.start < 0.12) return false;
  const duration = finalWord.end - finalWord.start;
  const earlier = estimatePitch(buffer, finalWord.start + duration * 0.35);
  const later = estimatePitch(buffer, Math.max(finalWord.start, finalWord.end - 0.055));
  return earlier !== null && later !== null && later - earlier >= 10 && later / earlier >= 1.075;
}

function autoPunctuateTranscript(sourceText: string, words: TimedWord[], audioBuffer: AudioBuffer | null) {
  if (!words.length) return '';
  const sourceTokens = transcriptTokens(sourceText);
  const punctuation = words.map((_, index) => sourceTokens[index]?.punctuation ?? '');
  let sentenceStart = 0;

  words.forEach((word, index) => {
    const existing = punctuation[index];
    const isFinalWord = index === words.length - 1;
    const next = words[index + 1];
    const gap = next ? Math.max(0, next.start - word.end) : Number.POSITIVE_INFINITY;
    const hasTerminalPunctuation = /[.!?]/.test(existing);

    if (hasTerminalPunctuation) {
      sentenceStart = index + 1;
      return;
    }
    if (existing) return;

    const segment = words.slice(sentenceStart, index + 1);
    if (isFinalWord || gap >= 0.58) {
      const question = likelyQuestion(segment) || hasRisingIntonation(audioBuffer, word);
      punctuation[index] = question ? '?' : '.';
      sentenceStart = index + 1;
      return;
    }

    if (
      gap >= 0.26
      && segment.length >= 3
      && !FORWARD_BINDERS.has(word.word.toLowerCase())
      && !boundarySplitsProtectedPhrase(words, index)
    ) {
      punctuation[index] = ',';
    }
  });

  return words
    .map((word, index) => (sourceTokens[index]?.word ?? word.word) + punctuation[index])
    .join(' ');
}

function revealedWordIndex(words: TimedWord[], seconds: number) {
  let revealed = -1;
  for (let index = 0; index < words.length; index += 1) {
    if (seconds < words[index].start) break;
    revealed = index;
  }
  return revealed;
}

function activeTimedAt<T extends { start: number; end: number }>(sequence: T[], seconds: number) {
  let low = 0;
  let high = sequence.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const item = sequence[middle];
    if (seconds < item.start) high = middle - 1;
    else if (seconds >= item.end) low = middle + 1;
    else return { item, index: middle };
  }
  return null;
}

function softRelayPose(seconds: number, item: { start: number; end: number }, calmValue: number) {
  const calm = Math.min(1, Math.max(0, calmValue / 100));
  const settleSeconds = 0.1 + calm * 0.18;
  const progress = Math.min(1, Math.max(0, (seconds - item.start) / settleSeconds));
  const eased = 1 - Math.pow(1 - progress, 3);
  const startScale = 0.91 + calm * 0.055;
  const overshoot = Math.sin(progress * Math.PI) * (1 - progress) * (1 - calm) * 0.018;

  return {
    scale: startScale + (1 - startScale) * eased + overshoot,
    y: (1 - eased) * (0.028 - calm * 0.014),
    opacity: 0.86 + eased * 0.14,
  };
}

function makeWaveform(buffer: AudioBuffer, columns = 72) {
  const channel = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(channel.length / columns));
  const values = Array.from({ length: columns }, (_, column) => {
    let peak = 0;
    const start = column * block;
    const end = Math.min(channel.length, start + block);
    for (let index = start; index < end; index += 1) peak = Math.max(peak, Math.abs(channel[index]));
    return peak;
  });
  const maximum = Math.max(0.001, ...values);
  return values.map((value) => 0.12 + (value / maximum) * 0.88);
}

function resampleTo16Khz(buffer: AudioBuffer) {
  const targetRate = 16_000;
  const outputLength = Math.max(1, Math.round(buffer.duration * targetRate));
  const output = new Float32Array(outputLength);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  const ratio = buffer.sampleRate / targetRate;
  for (let index = 0; index < outputLength; index += 1) {
    const sourcePosition = index * ratio;
    const left = Math.min(buffer.length - 1, Math.floor(sourcePosition));
    const right = Math.min(buffer.length - 1, left + 1);
    const blend = sourcePosition - left;
    let sample = 0;
    for (const channel of channels) sample += channel[left] * (1 - blend) + channel[right] * blend;
    output[index] = sample / channels.length;
  }
  return output;
}

function renderFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  sequence: TimedPhrase[],
  lines: TimedLine[],
  settings: RenderSettings,
) {
  context.clearRect(0, 0, width, height);
  if (settings.outputMode === 'premiere') {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, width, height);
  }
  context.save();
  const inset = width * (settings.safeArea / 100);

  const activeTime = seconds + settings.syncOffset / 1000;
  const active = activeTimedAt(sequence, activeTime);
  const activeLine = activeTimedAt(lines, activeTime);
  if (settings.displayMode === 'line' && activeLine) {
    const line = activeLine.item;
    const revealedIndex = revealedWordIndex(line.words, activeTime);
    const activeWord = activeTimedAt(line.words, activeTime);
    if (revealedIndex >= 0) {
      const rows = wrapWordsIntoRows(line.words);
      const fixedFontSize = height * 0.092 * (settings.fontScale / 100);
      context.fillStyle = settings.textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '700 ' + fixedFontSize + 'px Arial, Helvetica, sans-serif';
      const spaceWidth = context.measureText(' ').width;
      let wordOffset = 0;

      rows.forEach((row, rowIndex) => {
        const labels = row.map((word) => displayedWord(word).toUpperCase());
        const widths = labels.map((label) => context.measureText(label).width);
        const totalWidth = widths.reduce((total, wordWidth) => total + wordWidth, 0) + spaceWidth * Math.max(0, widths.length - 1);
        let cursor = settings.lineAlign === 'left'
          ? inset
          : settings.lineAlign === 'right'
            ? width - inset - totalWidth
            : width / 2 - totalWidth / 2;
        const rowY = height / 2 + (rowIndex - (rows.length - 1) / 2) * fixedFontSize * 1.28;

        labels.forEach((label, index) => {
          const globalIndex = wordOffset + index;
          const center = cursor + widths[index] / 2;
          if (globalIndex <= revealedIndex) {
            const motion = activeWord?.index === globalIndex
              ? softRelayPose(activeTime, row[index], settings.motionCalm)
              : { scale: 1, y: 0, opacity: 1 };
            context.save();
            context.globalAlpha = motion.opacity;
            context.translate(center, rowY + height * motion.y * 0.45);
            context.scale(motion.scale, motion.scale);
            context.fillText(label, 0, 0);
            context.restore();
          }
          cursor += widths[index] + spaceWidth;
        });
        wordOffset += row.length;
      });
    }
  } else if (settings.displayMode === 'single' && active) {
    const motion = softRelayPose(activeTime, active.item, settings.motionCalm);
    const baseFontSize = height * 0.26 * (settings.fontScale / 100);
    context.fillStyle = settings.textColor;
    context.globalAlpha = motion.opacity;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '700 ' + baseFontSize + 'px Arial, Helvetica, sans-serif';
    const maxTextWidth = width - inset * 3.4;
    const fittedFontSize = baseFontSize * Math.min(1, maxTextWidth / Math.max(1, context.measureText(active.item.text).width));
    context.font = '700 ' + fittedFontSize + 'px Arial, Helvetica, sans-serif';
    context.translate(width / 2, height / 2 + height * motion.y);
    context.scale(motion.scale, motion.scale);
    context.fillText(active.item.text.toUpperCase(), 0, 0);
  }
  context.restore();
}

const UI_ZH: Record<string,string> = {
  "Turn speech into timed typography": "让语音成为动态文字",
  "Import English speech → review words and timing → style → export in 4K.": "导入英文语音 → 校对逐词时间 → 调整样式 → 导出 4K。",
  "Recognized English speech appears here. Text inside the video is not read.": "识别出的英文单词会出现在这里；画面中的文字不会被读取。",
  "Transcript": "转写文字",
  "Only English speech from the audio is transcribed; no video OCR. Basic punctuation is inferred locally. Edit the words and punctuation, then confirm to update the preview and export.": "只读取音轨中的英文人声，不做画面 OCR。会在本地根据停顿、疑问结构和句尾语调补基础标点；你也可以直接修改 , . ? !，确认后同步到预览与导出。",
  "Pause": "暂停",
  "Play": "播放",
  "Timeline": "时间轴",
  "Text display mode": "文字显示模式",
  "Two-line alignment": "两行文字对齐方式",
  "Custom text color": "自定义字体颜色",
  "BUILD 2 LINES groups words into readable phrases and balances the lines. PREMIERE MP4 exports 4K H.264 + AAC on black. Use Screen blending in your editor to overlay white text.": "BUILD 2 LINES 会按句子、停顿和自然短语做语义切分，自动平衡两行并避免句尾孤词。默认 PREMIERE MP4：4K H.264 + AAC，纯黑底，可直接导入 PR；白字叠加素材时可在 PR 使用“滤色 / Screen”去黑。",
  "DROP ENGLISH MP4 / AUDIO": "导入英文音频 / 视频",
  "01 / SOURCE": "01 / 素材",
  "02 / SPEECH → TEXT": "02 / 语音 → 文字",
  "LANGUAGE": "语言",
  "CONFIRM & APPLY": "确认并应用",
  "OUTPUT": "输出",
  "EXPORT": "导出",
  "SINGLE WORD": "单词",
  "BUILD 2 LINES": "两行",
  "PREVIEW": "预览",
  "SAFE AREA": "安全区域",
  "TYPE SCALE": "字号",
  "SYNC OFFSET": "时间偏移"
};

export default function Home() {
  const [uiLanguage, setUiLanguage] = useState<"en" | "zh">("en");
  const tr = (english:string) => uiLanguage === "zh" ? (UI_ZH[english] ?? english) : english;
  const [playing, setPlaying] = useState(false);
  useEffect(()=>{demoStartRef.current=performance.now();setPlaying(true);},[]);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(DEMO_DURATION);
  const [fileName, setFileName] = useState('SILENT TYPE DEMO / 8 SEC');
  const [fileUrl, setFileUrl] = useState('');
  const [transcript, setTranscript] = useState(DEMO_TEXT);
  const [draftTranscript, setDraftTranscript] = useState(DEMO_TEXT);
  const [timingReference, setTimingReference] = useState<TimedWord[]>([]);
  const [waveform, setWaveform] = useState<number[]>(() => Array.from({ length: 72 }, (_, index) => 0.16 + ((index * 19) % 70) / 100));
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [statusText, setStatusText] = useState('SILENT DEMO · IMPORT SPEECH TO TRANSCRIBE');
  const [modelProgress, setModelProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [language, setLanguage] = useState('english');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('single');
  const [lineAlign, setLineAlign] = useState<LineAlign>('center');
  const [motionCalm, setMotionCalm] = useState(82);
  const [fontScale, setFontScale] = useState(100);
  const [safeArea, setSafeArea] = useState(8);
  const [syncOffset, setSyncOffset] = useState(0);
  const [textColor, setTextColor] = useState('#ffffff');
  const [outputMode, setOutputMode] = useState<OutputMode>('premiere');
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const transcriberRef = useRef<Promise<Transcriber> | null>(null);
  const durationRef = useRef(DEMO_DURATION);
  const demoStartRef = useRef(0);

  const transcriptWords = useMemo(() => visibleWords(transcript), [transcript]);
  const sequence = useMemo(
    () => applyPunctuationToWords(
      alignEditedWords(timingReference, transcriptWords, duration),
      transcript,
    ),
    [duration, timingReference, transcript, transcriptWords],
  );
  const hasTranscriptChanges = draftTranscript !== transcript;

  const applyTranscript = useCallback(() => {
    const words = visibleWords(draftTranscript);
    setTranscript(draftTranscript);
    setStatusText(
      !timingReference.length
        ? 'COPY UPDATED / TIMING DISTRIBUTED ACROSS AUDIO'
        : words.length === timingReference.length
        ? 'COPY UPDATED / EVERY ORIGINAL TIMESTAMP PRESERVED'
        : 'COPY UPDATED / EDITED WORDS AUTO-ALIGNED TO AUDIO',
    );
  }, [draftTranscript, timingReference.length]);

  useEffect(() => {
    if (!playing) return;
    let animationFrame = 0;
    const update = (now: number) => {
      const audio = audioRef.current;
      if (fileUrl && audio) {
        setElapsed(audio.currentTime);
        if (audio.paused || audio.ended) {
          setPlaying(false);
          return;
        }
      } else {
        const next = (now - demoStartRef.current) / 1000;
        if (next >= duration) {
          demoStartRef.current = now;
          setElapsed(0);
          animationFrame = requestAnimationFrame(update);
          return;
        }
        setElapsed(next);
      }
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, fileUrl, playing]);

  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const renderSettings = useMemo<RenderSettings>(() => ({
    displayMode,
    lineAlign,
    motionCalm,
    fontScale,
    safeArea,
    syncOffset,
    textColor,
    outputMode,
  }), [displayMode, fontScale, lineAlign, motionCalm, outputMode, safeArea, syncOffset, textColor]);

  const phrases = useMemo(() => buildPhrases(sequence), [sequence]);
  const lines = useMemo(() => buildLines(sequence, transcript), [sequence, transcript]);
  const activeTime = elapsed + syncOffset / 1000;
  const active = activeTimedAt(phrases, activeTime);
  const activeLine = activeTimedAt(lines, activeTime);
  const activeLineWord = activeLine ? activeTimedAt(activeLine.item.words, activeTime) : null;
  const lineRevealedIndex = activeLine ? revealedWordIndex(activeLine.item.words, activeTime) : -1;
  const activeLineRows = activeLine ? wrapWordsIntoRows(activeLine.item.words) : [];
  const motion = active
    ? softRelayPose(activeTime, active.item, motionCalm)
    : { scale: 1, y: 0, opacity: 1 };

  const beginTranscription = useCallback(async (audio: Float32Array) => {
    setModelProgress(0);
    setProcessState('loading-model');
    setStatusText('LOADING LOCAL SPEECH MODEL');
    try {
      if (!transcriberRef.current) {
        transcriberRef.current = (async () => {
          const { env, pipeline } = await import('@huggingface/transformers');
          env.allowLocalModels = false;
          env.useBrowserCache = true;
          const transcriber = await pipeline(
            'automatic-speech-recognition',
            'onnx-community/whisper-base_timestamped',
            {
              device: 'wasm',
              dtype: 'q8',
              progress_callback: (progress: { progress?: number; status?: string }) => {
                if (typeof progress.progress === 'number') setModelProgress(Math.round(progress.progress));
                if (progress.status === 'ready') setModelProgress(100);
              },
            },
          );
          return transcriber as unknown as Transcriber;
        })();
      }
      const transcriber = await transcriberRef.current;
      setProcessState('transcribing');
      setStatusText('ISOLATING ENGLISH SPEECH + WORD TIMESTAMPS');
      const result = await transcriber(audio, {
        return_timestamps: 'word',
        chunk_length_s: 20,
        stride_length_s: 3,
        task: 'transcribe',
        language: language === 'auto' ? 'english' : language,
        temperature: 0,
        no_speech_threshold: 0.6,
        logprob_threshold: -1,
        compression_ratio_threshold: 2.4,
      });
      const recognizedWords = visibleWords(result.text);
      const cleanText = recognizedWords.join(' ');
      const sourceTiming = chunksToWords(result.chunks ?? [], cleanText, durationRef.current);
      const timedWords = alignEditedWords(sourceTiming, recognizedWords, durationRef.current);
      const punctuatedText = autoPunctuateTranscript(result.text, timedWords, audioBufferRef.current);
      setTranscript(punctuatedText);
      setDraftTranscript(punctuatedText);
      setTimingReference(timedWords);
      setProcessState('ready');
      setStatusText(punctuatedText ? 'WORDS + PUNCTUATION LOCKED TO SOURCE AUDIO' : 'NO ENGLISH SPEECH DETECTED');
      setModelProgress(100);
    } catch {
      transcriberRef.current = null;
      setProcessState('error');
      setStatusText('TRANSCRIPTION ERROR / EDIT TEXT MANUALLY');
    }
  }, [language]);

  const handleFile = async (file: File) => {
    if (file.size > 350 * 1024 * 1024) {
      setProcessState('error');
      setStatusText('FILE TOO LARGE / MAX 350 MB');
      return;
    }
    setPlaying(false);
    setProcessState('decoding');
    setStatusText('DECODING AUDIO LOCALLY');
    setFileName(file.name.toUpperCase());
    setElapsed(0);
    try {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      const nextUrl = URL.createObjectURL(file);
      setFileUrl(nextUrl);
      const context = new AudioContext();
      const data = await file.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(data.slice(0));
      await context.close();
      audioBufferRef.current = audioBuffer;
      durationRef.current = audioBuffer.duration;
      setDuration(audioBuffer.duration);
      setWaveform(makeWaveform(audioBuffer));
      setTranscript('');
      setDraftTranscript('');
      setTimingReference([]);
      void beginTranscription(resampleTo16Khz(audioBuffer));
    } catch (error) {
      setProcessState('error');
      setStatusText(error instanceof Error ? error.message.toUpperCase() : 'AUDIO DECODING FAILED');
    }
  };

  const togglePlayback = async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (elapsed >= duration - 0.02) {
      setElapsed(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
    if (fileUrl && audioRef.current) {
      await audioRef.current.play();
    } else {
      demoStartRef.current = performance.now() - (elapsed >= duration - 0.02 ? 0 : elapsed) * 1000;
    }
    setPlaying(true);
  };

  const scrub = (seconds: number) => {
    const next = Math.max(0, Math.min(duration, seconds));
    setPlaying(false);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = next;
    setElapsed(next);
  };

  const exportVideo = async () => {
    const audioBuffer = audioBufferRef.current ?? (!fileUrl ? new AudioBuffer({length: Math.round(48000 * duration), sampleRate:48000,numberOfChannels:1}) : null);
    if (!audioBuffer || !sequence.length || processState === 'encoding') {
      setStatusText('UPLOAD + TRANSCRIBE AUDIO BEFORE EXPORT');
      return;
    }
    setPlaying(false);
    audioRef.current?.pause();
    setProcessState('encoding');
    setExportProgress(0);
    const isAlpha = outputMode === 'alpha';
    setStatusText(isAlpha ? 'PREPARING 4K ALPHA ENGINE' : 'PREPARING PREMIERE MP4 ENGINE');
    try {
      const {
        AudioBufferSource,
        BufferTarget,
        CanvasSource,
        Mp4OutputFormat,
        Output,
        Quality,
        WebMOutputFormat,
        canEncodeVideo,
      } = await import('mediabunny');
      const width = 3840;
      const height = 2160;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) throw new Error('COULD NOT CREATE 4K CANVAS');
      const quality = new Quality('high');
      const videoCodec = isAlpha ? 'vp9' : 'avc';
      const supported = await canEncodeVideo(videoCodec, {
        width,
        height,
        quality,
        ...(isAlpha ? { alpha: 'keep' as const } : {}),
      });
      if (!supported) {
        throw new Error(isAlpha
          ? 'THIS BROWSER CANNOT ENCODE 4K VP9 WITH ALPHA'
          : 'THIS BROWSER CANNOT ENCODE 4K H.264');
      }

      const target = new BufferTarget();
      const output = new Output({
        format: isAlpha
          ? new WebMOutputFormat()
          : new Mp4OutputFormat({ fastStart: 'in-memory' }),
        target,
      });
      const videoSource = new CanvasSource(canvas, {
        codec: videoCodec,
        quality,
        keyFrameInterval: 2,
        ...(isAlpha ? { alpha: 'keep' as const } : {}),
      });
      const audioSource = new AudioBufferSource({
        codec: isAlpha ? 'opus' : 'aac',
        quality: new Quality('high'),
      });
      output.addVideoTrack(videoSource, { frameRate: FPS });
      output.addAudioTrack(audioSource);
      output.setMetadataTags({
        title: 'Kinetic Typography Studio',
        comment: isAlpha
          ? 'Frame-accurate kinetic type with a transparent alpha channel, generated locally in the browser.'
          : 'Premiere-compatible frame-accurate kinetic type on a pure black background.',
      });
      await output.start();
      await audioSource.add(audioBuffer);
      audioSource.close();

      const frameCount = Math.ceil(duration * FPS);
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        const seconds = frameIndex / FPS;
        renderFrame(context, width, height, seconds, phrases, lines, renderSettings);
        await videoSource.add(seconds, 1 / FPS, {
          keyFrame: frameIndex % (FPS * 2) === 0,
        });
        if (frameIndex % 10 === 0 || frameIndex === frameCount - 1) {
          const progress = Math.round(((frameIndex + 1) / frameCount) * 100);
          setExportProgress(progress);
          setStatusText((isAlpha ? 'RENDERING 4K ALPHA / ' : 'RENDERING 4K PREMIERE MP4 / ') + progress + '%');
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
      }
      videoSource.close();
      await output.finalize();
      const outputBuffer = target.buffer;
      if (!outputBuffer?.byteLength) throw new Error('ENCODER RETURNED AN EMPTY FILE');
      if (isAlpha) {
        const signature = new Uint8Array(outputBuffer, 0, 4);
        if (signature[0] !== 0x1a || signature[1] !== 0x45 || signature[2] !== 0xdf || signature[3] !== 0xa3) {
          throw new Error('WEBM INTEGRITY CHECK FAILED');
        }
      } else {
        const signature = new TextDecoder('ascii').decode(new Uint8Array(outputBuffer, 4, 4));
        if (signature !== 'ftyp') throw new Error('MP4 INTEGRITY CHECK FAILED');
      }
      const blob = new Blob([outputBuffer], { type: isAlpha ? 'video/webm' : 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = isAlpha
        ? 'vox-one-4k-alpha-' + new Date().toISOString().slice(0, 10) + '.webm'
        : 'vox-one-4k-premiere-' + new Date().toISOString().slice(0, 10) + '.mp4';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 15_000);
      setExportProgress(100);
      setProcessState('ready');
      setStatusText(isAlpha
        ? 'COMPLETE / 4K TRANSPARENT WEBM DOWNLOADED'
        : 'COMPLETE / PREMIERE MP4 DOWNLOADED');
    } catch (error) {
      setProcessState('error');
      setStatusText(error instanceof Error ? error.message.toUpperCase() : 'EXPORT FAILED');
    }
  };

  const stateLabel = processState === 'loading-model'
    ? 'MODEL ' + modelProgress + '%'
    : processState === 'encoding'
      ? 'ENCODE ' + exportProgress + '%'
      : processState.toUpperCase();

  return (
    <main className="studio-shell">
      <audio ref={audioRef} src={fileUrl || undefined} preload="auto" onEnded={() => setPlaying(false)} />
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">Kt</span>
          <span className="brand-name">06 / Kinetic Typography Studio</span>
          <span className="brand-subtitle">SPEECH → TIMED TYPOGRAPHY</span>
        </div>
        <div className="system-status">
          <span className={'status-dot state-' + processState} />
          {statusText}
        </div>
        <span className="build-tag">SYS 01 / {stateLabel}</span>
      </header>
<nav className="family-nav" aria-label="Creative workflow studios"><span>MUWEN LI / STUDIOS</span><button className="family-language" type="button" aria-label={uiLanguage === "en" ? "Switch to Chinese" : "切换到英文"} onClick={()=>setUiLanguage(uiLanguage === "en" ? "zh" : "en")}>{uiLanguage === "en" ? "EN / 中文" : "中 / EN"}</button><a href="https://meshroom-breakdown-studio.limuwen9.chatgpt.site"><b>03</b>Model Breakdown</a><a href="https://muwentrili.github.io/creative-workflows/collage-motion/"><b>04</b>Animated Storyboard</a><a href="https://flipframe-motion-lab.limuwen9.chatgpt.site"><b>05</b>Spatial Media Presenter</a><a href="https://vox-one.limuwen9.chatgpt.site" aria-current="page"><b>06</b>Kinetic Typography Studio</a><a href="https://trace-01-motion-tracker.limuwen9.chatgpt.site"><b>07</b>Motion Tracking Studio</a><a className="family-index" href="https://github.com/MuwenTriLi/creative-workflows">All projects ↗</a></nav>

      <section className="workspace">
        <aside className="control-rail left-rail">
          <p className="family-demo-note">{uiLanguage === "en" ? "Silent timing demo. Import your speech to create a transcript; review the words before export." : "当前为静音节奏示例。导入语音生成转写，检查并确认文字后再导出。"}</p><div className="rail-heading">
            <span>{tr("01 / SOURCE")}</span>
            <AudioLines size={14} />
          </div>
          <label
            className="upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
          >
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <Upload size={18} strokeWidth={1.5} />
            <strong>{tr("DROP ENGLISH MP4 / AUDIO")}</strong>
            <span>WAV · MP3 · M4A · MP4</span>
          </label>

          <div className="source-card">
            <div className="source-meta">
              <Volume2 size={14} />
              <span>{fileName}</span>
              <i>{formatTime(duration)}</i>
            </div>
            <div className="waveform" aria-hidden="true">
              {waveform.map((value, index) => (
                <i
                  key={index}
                  className={index / waveform.length < elapsed / duration ? 'is-read' : ''}
                  style={{ height: String(Math.round(value * 100)) + '%' }}
                />
              ))}
            </div>
          </div>

          <div className="rail-heading transcript-heading">
            <span>{tr("02 / SPEECH → TEXT")}</span>
            <Sparkles size={13} />
          </div>
          <div className="language-row">
            <label htmlFor="language">{tr("LANGUAGE")}</label>
            <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="english">ENGLISH / LOCKED</option>
              <option value="auto">AUTO / ENGLISH BIAS</option>
            </select>
          </div>
          <textarea
            className="transcript-editor"
            value={draftTranscript}
            placeholder={tr("Recognized English speech appears here. Text inside the video is not read.")}
            onChange={(event) => {
              setDraftTranscript(event.target.value);
              setStatusText('COPY EDITED / PRESS CONFIRM & APPLY');
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && hasTranscriptChanges) {
                event.preventDefault();
                applyTranscript();
              }
            }}
            aria-label={tr("Transcript")}
          />
          <Button
            type="button"
            className={'transcript-apply' + (hasTranscriptChanges ? ' has-changes' : '')}
            onClick={applyTranscript}
            disabled={!hasTranscriptChanges || processState === 'loading-model' || processState === 'transcribing'}
            title="Ctrl / Cmd + Enter"
          >
            <Check size={12} />
            {hasTranscriptChanges ? tr("CONFIRM & APPLY") : 'TRANSCRIPT APPLIED'}
          </Button>
          <div className="transcript-stats">
            <span>{visibleWords(draftTranscript).length} WORDS · {displayMode === 'single' ? tr("SINGLE WORD") : tr("BUILD 2 LINES")}</span>
            <span>{hasTranscriptChanges ? 'CHANGES PENDING' : sequence.length ? (timingReference.length ? 'TEXT + PUNCTUATION · LIVE' : 'MANUAL TIMING') : 'WAITING'}</span>
          </div>
          <div className="privacy-note">
            <WandSparkles size={13} />
            <p>{tr("Only English speech from the audio is transcribed; no video OCR. Basic punctuation is inferred locally. Edit the words and punctuation, then confirm to update the preview and export.")}</p>
          </div>
          {processState === 'error' && audioBufferRef.current && (
            <Button
              variant="outline"
              className="retry-button"
              onClick={() => void beginTranscription(resampleTo16Khz(audioBufferRef.current as AudioBuffer))}
            >
              <RotateCcw size={13} /> RETRY TRANSCRIPTION
            </Button>
          )}
        </aside>

        <section className="stage-column">
          <div className="studio-intro"><h1>{tr("Turn speech into timed typography")}</h1><p>{tr("Import English speech → review words and timing → style → export in 4K.")}</p></div>
          <div className="stage-toolbar">
            <div>
              <span className="eyebrow">LIVE COMPOSITION</span>
              <strong>{displayMode === 'single' ? 'ONE ENGLISH WORD / SOFT RELAY MOTION' : 'FIXED TYPE / SEMANTIC 2-LINE GROUPS'}</strong>
            </div>
            <div className="stage-readout">
              <span>3840 × 2160</span>
              <span>{FPS} FPS</span>
              <span>{outputMode === 'alpha' ? 'VP9 ALPHA + OPUS' : 'H.264 + AAC'}</span>
            </div>
          </div>

          <div className={'preview-frame clean-preview' + (outputMode === 'alpha' ? ' alpha-preview' : '')}>
            {displayMode === 'single' && active && (
              <span
                key={active.index}
                className="hero-character"
                style={{
                  color: textColor,
                  fontSize: 'clamp(' + 54 * fontScale / 100 + 'px, ' + 9 * fontScale / 100 * Math.min(1, 11 / active.item.text.length) + 'vw, ' + 178 * fontScale / 100 * Math.min(1, 14 / active.item.text.length) + 'px)',
                  transform: 'translate3d(0, ' + motion.y * 100 + '%, 0) scale(' + motion.scale + ')',
                  opacity: motion.opacity,
                }}
              >
                {active.item.text.toUpperCase()}
              </span>
            )}
            {displayMode === 'line' && activeLine && lineRevealedIndex >= 0 && (
              <div
                className="sentence-block"
                data-align={lineAlign}
                style={{
                  width: 100 - safeArea * 2 + '%',
                  fontSize: 'clamp(' + 28 * fontScale / 100 + 'px, ' + 4.1 * fontScale / 100 + 'vw, ' + 76 * fontScale / 100 + 'px)',
                  color: textColor,
                }}
              >
                {activeLineRows.map((row, rowIndex) => {
                  const wordOffset = activeLineRows
                    .slice(0, rowIndex)
                    .reduce((total, previousRow) => total + previousRow.length, 0);
                  return (
                    <div className="sentence-row" key={'row-' + rowIndex}>
                      {row.map((word, index) => {
                        const globalIndex = wordOffset + index;
                        const isCurrent = activeLineWord?.index === globalIndex;
                        const wordMotion = isCurrent
                          ? softRelayPose(activeTime, word, motionCalm)
                          : { scale: 1, y: 0, opacity: 1 };
                        return (
                          <span
                            key={word.start + '-' + word.word + '-' + globalIndex}
                            style={{
                              opacity: globalIndex <= lineRevealedIndex ? wordMotion.opacity : 0,
                              transform: 'translate3d(0, ' + wordMotion.y * 360 + 'px, 0) scale(' + wordMotion.scale + ')',
                            }}
                          >
                            {displayedWord(word).toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            <button className="stage-play" type="button" onClick={() => void togglePlayback()} aria-label={playing ? tr("Pause") : tr("Play")}>
              {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            {(processState === 'loading-model' || processState === 'transcribing') && (
              <div className="processing-overlay">
                <span>{processState === 'loading-model' ? modelProgress : 'AI'}</span>
                <strong>{processState === 'loading-model' ? 'LOADING MODEL' : 'TRANSCRIBING'}</strong>
                <i style={{ width: String(processState === 'loading-model' ? modelProgress : 64) + '%' }} />
              </div>
            )}
          </div>

          <div className="timeline-panel">
            <div className="timeline-header">
              <button type="button" onClick={() => void togglePlayback()}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'PAUSE' : 'PLAY'}
              </button>
              <span>{formatTime(elapsed)} / {formatTime(duration)}</span>
              <span>FRAME {String(Math.round(elapsed * FPS)).padStart(5, '0')}</span>
              <span className="timeline-sync"><Check size={11} /> SAME CLOCK FOR PREVIEW + EXPORT</span>
            </div>
            <input
              className="time-scrubber"
              type="range"
              min="0"
              max={duration}
              step={1 / FPS}
              value={elapsed}
              onChange={(event) => scrub(Number(event.target.value))}
              aria-label={tr("Timeline")}
            />
            <div className="character-track" aria-label="Timed English words">
              {phrases.map((item, index) => (
                <button
                  type="button"
                  key={item.text + '-' + index}
                  className={active?.index === index ? 'is-active' : ''}
                  onClick={() => scrub(Math.max(0, item.start - syncOffset / 1000))}
                  style={{ flexBasis: String(Math.max(58, item.text.length * 7, (item.end - item.start) * 90)) + 'px' }}
                  title={formatTime(item.start) + ' — ' + formatTime(item.end)}
                >
                  {item.text.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="control-rail right-rail">
          <div className="rail-heading">
            <span>03 / MOTION</span>
            <Gauge size={14} />
          </div>
          <div className="mode-switch">
            <span>TYPE MODE</span>
            <div role="group" aria-label={tr("Text display mode")}>
              <button
                type="button"
                className={displayMode === 'single' ? 'is-active' : ''}
                aria-pressed={displayMode === 'single'}
                onClick={() => setDisplayMode('single')}
              >
                {tr("SINGLE WORD")}</button>
              <button
                type="button"
                className={displayMode === 'line' ? 'is-active' : ''}
                aria-pressed={displayMode === 'line'}
                onClick={() => setDisplayMode('line')}
              >
                {tr("BUILD 2 LINES")}</button>
            </div>
          </div>
          <div className="alignment-switch">
            <span>LINE ALIGN</span>
            <div role="group" aria-label={tr("Two-line alignment")}>
              <button
                type="button"
                className={lineAlign === 'left' ? 'is-active' : ''}
                aria-pressed={lineAlign === 'left'}
                onClick={() => setLineAlign('left')}
              >
                LEFT
              </button>
              <button
                type="button"
                className={lineAlign === 'center' ? 'is-active' : ''}
                aria-pressed={lineAlign === 'center'}
                onClick={() => setLineAlign('center')}
              >
                CENTER
              </button>
              <button
                type="button"
                className={lineAlign === 'right' ? 'is-active' : ''}
                aria-pressed={lineAlign === 'right'}
                onClick={() => setLineAlign('right')}
              >
                RIGHT
              </button>
            </div>
          </div>
          <div className="parameter">
            <div><span>MOTION CALM</span><strong>{motionCalm}%</strong></div>
            <Slider value={[motionCalm]} min={20} max={100} onValueChange={(value) => setMotionCalm(sliderNumber(value))} />
          </div>
          <div className="parameter">
            <div><span>FONT SCALE</span><strong>{fontScale}%</strong></div>
            <Slider value={[fontScale]} min={55} max={150} onValueChange={(value) => setFontScale(sliderNumber(value))} />
          </div>
          <div className="parameter">
            <div><span>{tr("SAFE AREA")}</span><strong>{safeArea}%</strong></div>
            <Slider value={[safeArea]} min={4} max={14} onValueChange={(value) => setSafeArea(sliderNumber(value))} />
          </div>
          <div className="parameter">
            <div><span>{tr("SYNC OFFSET")}</span><strong>{syncOffset > 0 ? '+' : ''}{syncOffset} MS</strong></div>
            <Slider value={[syncOffset]} min={-500} max={500} step={10} onValueChange={(value) => setSyncOffset(sliderNumber(value))} />
          </div>
          <div className="export-mode-switch">
            <span>EXPORT MODE</span>
            <div>
              <button
                type="button"
                className={outputMode === 'premiere' ? 'is-active' : ''}
                aria-pressed={outputMode === 'premiere'}
                onClick={() => setOutputMode('premiere')}
              >
                PREMIERE MP4
                <i>BLACK / SAFE</i>
              </button>
              <button
                type="button"
                className={outputMode === 'alpha' ? 'is-active' : ''}
                aria-pressed={outputMode === 'alpha'}
                onClick={() => setOutputMode('alpha')}
              >
                ALPHA WEBM
                <i>TRANSPARENT</i>
              </button>
            </div>
          </div>
          <div className="type-color-control">
            <div className="type-color-heading">
              <span>TYPE COLOR</span>
              <strong>{textColor.toUpperCase()}</strong>
            </div>
            <div className="type-color-actions">
              <button
                type="button"
                className={textColor.toLowerCase() === '#ffffff' ? 'is-active' : ''}
                aria-pressed={textColor.toLowerCase() === '#ffffff'}
                onClick={() => setTextColor('#ffffff')}
              >
                <i className="color-swatch swatch-white" /> WHITE
              </button>
              <button
                type="button"
                className={textColor.toLowerCase() === '#000000' ? 'is-active' : ''}
                aria-pressed={textColor.toLowerCase() === '#000000'}
                onClick={() => setTextColor('#000000')}
              >
                <i className="color-swatch swatch-black" /> BLACK
              </button>
              <label className="custom-color-picker">
                <input
                  type="color"
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
                  aria-label={tr("Custom text color")}
                />
                <span>CUSTOM</span>
              </label>
            </div>
          </div>
          <div className="clean-output-lock">
            <span>{outputMode === 'alpha' ? 'OUTPUT STYLE / ALPHA' : 'OUTPUT STYLE / PREMIERE SAFE'}</span>
            <strong>{outputMode === 'alpha' ? 'TRANSPARENT + CUSTOM TYPE' : 'PURE BLACK + CUSTOM TYPE'}</strong>
            <i>{outputMode === 'alpha' ? 'ALPHA BACKGROUND · NO HUD · NO OVERLAYS' : 'H.264 MP4 · NO HUD · NO OVERLAYS'}</i>
          </div>

          <div className="rail-heading output-heading">
            <span>04 / OUTPUT</span>
            <Download size={14} />
          </div>
          <div className="output-spec">
            <span>RESOLUTION</span><strong>4K UHD</strong><i>3840 × 2160</i>
          </div>
          <div className="output-spec">
            <span>CONTAINER</span>
            <strong>{outputMode === 'alpha' ? 'WEBM' : 'MP4'}</strong>
            <i>{outputMode === 'alpha' ? 'VP9 ALPHA / OPUS' : 'H.264 / AAC · PREMIERE SAFE'}</i>
          </div>
          <div className="output-spec">
            <span>DURATION</span><strong>{formatTime(duration)}</strong><i>ORIGINAL AUDIO LENGTH</i>
          </div>
          <Button
            className="export-button"
            size="lg"
            onClick={() => void exportVideo()}
            disabled={(!!fileUrl && !audioBufferRef.current) || !sequence.length || processState === 'encoding'}
          >
            <Download size={15} />
            {processState === 'encoding'
              ? 'RENDERING ' + exportProgress + '%'
              : outputMode === 'alpha'
                ? 'EXPORT 4K ALPHA WEBM'
                : 'EXPORT 4K PREMIERE MP4'}
          </Button>
          <p className="export-note">{tr("BUILD 2 LINES groups words into readable phrases and balances the lines. PREMIERE MP4 exports 4K H.264 + AAC on black. Use Screen blending in your editor to overlay white text.")}</p>
          <div className="engine-card">
            <span>ENGINE</span>
            <strong>{MODEL_LABEL}</strong>
            <i>LOCAL ASR · H.264 MP4 · OPTIONAL VP9 ALPHA</i>
          </div>
        </aside>
      </section>
    </main>
  );
}
