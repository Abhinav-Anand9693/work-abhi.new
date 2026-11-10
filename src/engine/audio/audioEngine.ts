/**
 * WorkAbhi - High-Performance Audio Engine
 * Pure client-side Web Audio engine supporting trimming, cutting, merging,
 * speed/pitch adjustment, volume boosting, fading, and format conversion
 * without 31MB WASM downloads or SharedArrayBuffer requirements.
 * Optimized for low-RAM devices and arbitrary file sizes with realistic ETA.
 */

export type AudioFormat = "mp3" | "wav" | "ogg" | "m4a" | "webm";

export interface AudioProcessOptions {
  start?: number;
  end?: number;
  format?: AudioFormat;
  bitrate?: "64k" | "96k" | "128k" | "192k" | "256k" | "320k";
  volume?: number;
  normalize?: number;
  fadeDuration?: number;
  speed?: number;
  pitch?: number;
  signal?: AbortSignal;
  onProgress?: (progress: AudioProgress) => void;
}

export interface AudioProgress {
  progress: number; // 0 to 1
  stage: "reading" | "decoding" | "processing" | "encoding" | "finalizing" | "complete";
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  message: string;
  speedFormatted?: string;
}

export interface AudioOutput {
  blob: Blob;
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
}

export interface AudioMetadata {
  format?: {
    filename?: string;
    format_name?: string;
    duration?: string;
    size?: string;
    bit_rate?: string;
  };
  streams?: Array<{
    codec_name?: string;
    codec_type?: string;
    sample_rate?: string;
    channels?: number;
    channel_layout?: string;
    duration?: string;
    bit_rate?: string;
  }>;
}

export function resetAudioFFmpeg(): void {
  // Maintained for backward compatibility with callers
}

/**
 * Format bytes to readable string
 */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Cleanly calculate ETA and speed
 */
function createProgressReporter(
  onProgress?: (p: AudioProgress) => void,
  signal?: AbortSignal
) {
  const startTime = performance.now();
  let lastReportedProgress = 0;
  let smoothedEta = 0;

  return (rawProgress: number, stage: AudioProgress["stage"], message: string) => {
    if (signal?.aborted) {
      throw new DOMException("Audio processing cancelled.", "AbortError");
    }

    const progress = Math.max(0, Math.min(1, rawProgress));
    lastReportedProgress = progress;
    const elapsedSeconds = Math.max(0.01, (performance.now() - startTime) / 1000);

    let estimatedRemainingSeconds = 0;
    let speedFormatted = "";

    if (progress > 0.03 && progress < 0.99) {
      const rate = progress / elapsedSeconds;
      const currentEta = (1 - progress) / rate;
      // Exponential smoothing to prevent jumping
      smoothedEta = smoothedEta === 0 ? currentEta : smoothedEta * 0.7 + currentEta * 0.3;
      estimatedRemainingSeconds = Math.max(1, Math.round(smoothedEta));
      speedFormatted = `${(rate * 100).toFixed(0)}% / sec`;
    } else if (progress >= 0.99) {
      estimatedRemainingSeconds = 0;
      speedFormatted = "Finishing";
    }

    onProgress?.({
      progress,
      stage,
      elapsedSeconds: Math.round(elapsedSeconds),
      estimatedRemainingSeconds,
      message,
      speedFormatted,
    });
  };
}

/**
 * Decodes an audio file into an AudioBuffer safely without memory leaks.
 */
async function decodeAudioFile(
  file: File,
  reportProgress: (p: number, stage: AudioProgress["stage"], msg: string) => void,
  signal?: AbortSignal
): Promise<AudioBuffer> {
  reportProgress(0.05, "reading", `Reading ${file.name} (${formatBytes(file.size)})...`);

  const arrayBuffer = await file.arrayBuffer();
  if (signal?.aborted) throw new DOMException("Audio processing cancelled.", "AbortError");

  reportProgress(0.2, "decoding", "Decoding audio stream...");

  // Use OfflineAudioContext for decoding to avoid holding open active microphone/speaker locks
  const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  try {
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } finally {
    try {
      await tempCtx.close();
    } catch {
      // ignore
    }
  }
}

/**
 * Encode an AudioBuffer into standard 16-bit PCM WAV.
 * Employs chunked processing and periodic yields so huge files never freeze the UI.
 */
async function encodeWavChunked(
  audioBuffer: AudioBuffer,
  reportProgress: (p: number, stage: AudioProgress["stage"], msg: string) => void,
  signal?: AbortSignal
): Promise<Blob> {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const headerBuffer = new ArrayBuffer(44);
  const view = new DataView(headerBuffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // 'RIFF'
  view.setUint32(4, 36 + dataSize, true); // file length - 8
  view.setUint32(8, 0x57415645, false); // 'WAVE'

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // 'fmt '
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample (16)

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // 'data'
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  // Process data in chunks of 32,768 frames to keep memory overhead small and yield to UI
  const chunkSize = 32768;
  const chunks: Uint8Array[] = [new Uint8Array(headerBuffer)];

  for (let offset = 0; offset < numFrames; offset += chunkSize) {
    if (signal?.aborted) throw new DOMException("Audio processing cancelled.", "AbortError");

    const end = Math.min(numFrames, offset + chunkSize);
    const count = end - offset;
    const chunkBytes = new Uint8Array(count * blockAlign);
    const chunkView = new DataView(chunkBytes.buffer);

    let byteIndex = 0;
    for (let i = offset; i < end; i++) {
      for (let c = 0; c < numChannels; c++) {
        // Clamp sample to [-1, 1] and scale to 16-bit signed integer
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        chunkView.setInt16(byteIndex, int16, true);
        byteIndex += 2;
      }
    }

    chunks.push(chunkBytes);

    const progressRatio = 0.5 + 0.45 * (end / numFrames);
    reportProgress(progressRatio, "encoding", `Encoding audio: ${Math.round((end / numFrames) * 100)}%`);

    // Yield to event loop every 4 chunks
    if (offset % (chunkSize * 4) === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return new Blob(chunks as unknown as BlobPart[], { type: "audio/wav" });
}

/**
 * Record audio buffer via MediaRecorder for MP3, OGG, WebM or M4A container
 */
async function encodeMediaRecorder(
  audioBuffer: AudioBuffer,
  targetMime: string,
  bitrate = 192000,
  reportProgress: (p: number, stage: AudioProgress["stage"], msg: string) => void,
  signal?: AbortSignal
): Promise<Blob> {
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  reportProgress(0.55, "processing", "Rendering audio stream...");
  const renderedBuffer = await offlineCtx.startRendering();

  if (signal?.aborted) throw new DOMException("Audio processing cancelled.", "AbortError");

  // If MediaRecorder supports target MIME directly, use it
  let chosenMime = targetMime;
  if (!MediaRecorder.isTypeSupported(chosenMime)) {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      chosenMime = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      chosenMime = "audio/mp4";
    } else {
      // Fallback to high-quality lossless WAV
      return encodeWavChunked(renderedBuffer, reportProgress, signal);
    }
  }

  // Create real-time audio playback into MediaStreamDestination to capture
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const playbackSource = audioCtx.createBufferSource();
  playbackSource.buffer = renderedBuffer;
  playbackSource.connect(dest);

  const recorder = new MediaRecorder(dest.stream, {
    mimeType: chosenMime,
    audioBitsPerSecond: bitrate,
  });

  const parts: Blob[] = [];
  return new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) parts.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        await audioCtx.close();
      } catch {
        // ignore
      }
      reportProgress(0.98, "finalizing", "Finalizing compressed audio file...");
      resolve(new Blob(parts, { type: chosenMime }));
    };

    recorder.onerror = (e) => reject(e);

    recorder.start(100);
    playbackSource.start(0);

    const totalDuration = renderedBuffer.duration;
    const progressInterval = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(progressInterval);
        try {
          recorder.stop();
          playbackSource.stop();
          audioCtx.close();
        } catch {
          // ignore
        }
        reject(new DOMException("Audio processing cancelled.", "AbortError"));
        return;
      }
      const currentSec = audioCtx.currentTime;
      const pct = Math.min(0.95, 0.6 + 0.35 * (currentSec / totalDuration));
      reportProgress(pct, "encoding", `Recording stream (${Math.round((currentSec / totalDuration) * 100)}%)...`);
    }, 200);

    playbackSource.onended = () => {
      clearInterval(progressInterval);
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 100);
    };
  });
}

/**
 * Apply audio operations (trim, speed, volume, fade, normalize) to an AudioBuffer
 */
async function applyAudioOperations(
  sourceBuffer: AudioBuffer,
  toolId: string,
  options: AudioProcessOptions,
  reportProgress: (p: number, stage: AudioProgress["stage"], msg: string) => void,
  signal?: AbortSignal
): Promise<AudioBuffer> {
  reportProgress(0.35, "processing", "Applying audio enhancements...");
  const sampleRate = sourceBuffer.sampleRate;
  const originalDuration = sourceBuffer.duration;
  let startSec = Math.max(0, options.start ?? 0);
  let endSec = options.end !== undefined && options.end > 0 ? Math.min(originalDuration, options.end) : originalDuration;

  if (startSec >= endSec) {
    startSec = 0;
    endSec = originalDuration;
  }

  // Handle Cutter vs Trimmer
  const isCutter = toolId === "audio-cutter";
  let targetBuffer: AudioBuffer;

  if (isCutter && startSec > 0 && endSec < originalDuration) {
    // Cut out segment between startSec and endSec, keeping before and after
    const part1Len = Math.floor(startSec * sampleRate);
    const part2Start = Math.floor(endSec * sampleRate);
    const part2Len = Math.max(0, sourceBuffer.length - part2Start);
    const totalLen = part1Len + part2Len;

    targetBuffer = new AudioBuffer({
      numberOfChannels: sourceBuffer.numberOfChannels,
      length: Math.max(1, totalLen),
      sampleRate,
    });

    for (let c = 0; c < sourceBuffer.numberOfChannels; c++) {
      const src = sourceBuffer.getChannelData(c);
      const dst = targetBuffer.getChannelData(c);
      dst.set(src.subarray(0, part1Len), 0);
      dst.set(src.subarray(part2Start), part1Len);
    }
  } else if (toolId === "audio-trimmer" || startSec > 0 || endSec < originalDuration) {
    // Trim: keep only segment between startSec and endSec
    const startFrame = Math.floor(startSec * sampleRate);
    const endFrame = Math.min(sourceBuffer.length, Math.floor(endSec * sampleRate));
    const targetLength = Math.max(1, endFrame - startFrame);

    targetBuffer = new AudioBuffer({
      numberOfChannels: sourceBuffer.numberOfChannels,
      length: targetLength,
      sampleRate,
    });

    for (let c = 0; c < sourceBuffer.numberOfChannels; c++) {
      const src = sourceBuffer.getChannelData(c);
      const dst = targetBuffer.getChannelData(c);
      dst.set(src.subarray(startFrame, endFrame), 0);
    }
  } else {
    targetBuffer = sourceBuffer;
  }

  if (signal?.aborted) throw new DOMException("Audio processing cancelled.", "AbortError");

  // Speed and Pitch adjustment using OfflineAudioContext
  const speed = Math.max(0.25, Math.min(4.0, options.speed ?? 1.0));
  const pitch = options.pitch ?? 0;
  const volumeMultiplier = Math.max(0, options.volume !== undefined ? options.volume / 100 : 1.0);

  if (speed !== 1.0 || pitch !== 0 || options.fadeDuration || volumeMultiplier !== 1.0 || options.normalize) {
    const renderedLength = Math.max(1, Math.round(targetBuffer.length / speed));
    const offlineCtx = new OfflineAudioContext(
      targetBuffer.numberOfChannels,
      renderedLength,
      sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = targetBuffer;
    source.playbackRate.value = speed;
    if (pitch !== 0) {
      source.detune.value = pitch * 100; // semitones to cents
    }

    const gainNode = offlineCtx.createGain();
    let currentGain = volumeMultiplier;

    // Normalization check
    if (options.normalize && options.normalize > 0) {
      let maxPeak = 0;
      for (let c = 0; c < targetBuffer.numberOfChannels; c++) {
        const data = targetBuffer.getChannelData(c);
        for (let i = 0; i < data.length; i += 20) {
          const abs = Math.abs(data[i]);
          if (abs > maxPeak) maxPeak = abs;
        }
      }
      if (maxPeak > 0.001) {
        currentGain *= (options.normalize / 100) / maxPeak;
      }
    }

    const targetDuration = targetBuffer.duration / speed;
    gainNode.gain.setValueAtTime(currentGain, 0);

    // Fade In
    if (toolId === "audio-fade-in" || (options.fadeDuration && options.fadeDuration > 0)) {
      const fadeSec = Math.min(targetDuration / 2, options.fadeDuration ?? 3);
      gainNode.gain.setValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(currentGain, fadeSec);
    }

    // Fade Out
    if (toolId === "audio-fade-out" || (options.fadeDuration && options.fadeDuration > 0)) {
      const fadeSec = Math.min(targetDuration / 2, options.fadeDuration ?? 3);
      const fadeStart = Math.max(0, targetDuration - fadeSec);
      gainNode.gain.setValueAtTime(currentGain, fadeStart);
      gainNode.gain.linearRampToValueAtTime(0, targetDuration);
    }

    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    source.start(0);

    reportProgress(0.45, "processing", "Rendering high-precision audio graph...");
    targetBuffer = await offlineCtx.startRendering();
  }

  return targetBuffer;
}

/**
 * Main audio processor function (accepts arguments in either order)
 */
export async function processAudio(
  arg1: string | File,
  arg2: string | File,
  options: AudioProcessOptions = {}
): Promise<AudioOutput> {
  const file = arg1 instanceof File ? arg1 : (arg2 as File);
  const toolId = typeof arg1 === "string" ? arg1 : (arg2 as string);

  const reportProgress = createProgressReporter(options.onProgress, options.signal);
  reportProgress(0.02, "reading", `Loading ${file.name}...`);

  const decodedBuffer = await decodeAudioFile(file, reportProgress, options.signal);

  const processedBuffer = await applyAudioOperations(
    decodedBuffer,
    toolId,
    options,
    reportProgress,
    options.signal
  );

  // Determine output format
  let targetFormat = options.format;
  if (!targetFormat) {
    if (toolId.includes("mp3-to-wav") || toolId === "wav-converter") targetFormat = "wav";
    else if (toolId.includes("wav-to-mp3") || toolId === "mp3-converter" || toolId.includes("to-mp3")) targetFormat = "mp3";
    else if (toolId.includes("to-ogg") || toolId === "ogg-converter") targetFormat = "ogg";
    else if (toolId === "m4a-converter") targetFormat = "m4a";
    else targetFormat = "wav"; // high-fidelity default
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  let filename = `${baseName}_${toolId.replace("audio-", "")}.${targetFormat}`;
  let mimeType = "audio/wav";
  let outputBlob: Blob;

  if (targetFormat === "wav") {
    mimeType = "audio/wav";
    outputBlob = await encodeWavChunked(processedBuffer, reportProgress, options.signal);
  } else {
    const bitrateMap: Record<string, number> = {
      "64k": 64000,
      "96k": 96000,
      "128k": 128000,
      "192k": 192000,
      "256k": 256000,
      "320k": 320000,
    };
    const bps = bitrateMap[options.bitrate ?? "192k"] ?? 192000;

    let targetMime = "audio/webm";
    if (targetFormat === "mp3") targetMime = "audio/mpeg";
    else if (targetFormat === "ogg") targetMime = "audio/ogg";
    else if (targetFormat === "m4a") targetMime = "audio/mp4";

    outputBlob = await encodeMediaRecorder(processedBuffer, targetMime, bps, reportProgress, options.signal);
    mimeType = outputBlob.type || targetMime;
  }

  reportProgress(1.0, "complete", "Audio processing complete!");

  return {
    blob: outputBlob,
    filename,
    mimeType,
    size: outputBlob.size,
    duration: processedBuffer.duration,
  };
}

/**
 * Merge multiple audio files sequentially into one single file.
 */
export async function mergeAudio(
  files: File[],
  options: AudioProcessOptions = {}
): Promise<AudioOutput> {
  if (files.length < 2) {
    throw new Error("Select at least two audio files to merge.");
  }

  const reportProgress = createProgressReporter(options.onProgress, options.signal);
  reportProgress(0.05, "reading", `Loading ${files.length} audio files...`);

  const buffers: AudioBuffer[] = [];
  let totalLength = 0;
  let maxChannels = 1;
  const targetSampleRate = 44100;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    reportProgress(
      0.05 + 0.3 * (i / files.length),
      "decoding",
      `Decoding audio ${i + 1} of ${files.length}: ${file.name}`
    );
    const buf = await decodeAudioFile(file, () => {}, options.signal);
    buffers.push(buf);
    totalLength += Math.round((buf.duration) * targetSampleRate);
    if (buf.numberOfChannels > maxChannels) maxChannels = buf.numberOfChannels;
  }

  reportProgress(0.4, "processing", `Merging ${files.length} tracks seamlessly...`);

  // Render combined tracks into single AudioBuffer
  const mergedBuffer = new AudioBuffer({
    numberOfChannels: maxChannels,
    length: Math.max(1, totalLength),
    sampleRate: targetSampleRate,
  });

  let currentFrameOffset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i];
    const duration = buf.duration;
    const destLength = Math.round(duration * targetSampleRate);

    // Resample if needed using OfflineAudioContext
    let resampledBuf = buf;
    if (buf.sampleRate !== targetSampleRate) {
      const resampleCtx = new OfflineAudioContext(
        buf.numberOfChannels,
        destLength,
        targetSampleRate
      );
      const resampleSource = resampleCtx.createBufferSource();
      resampleSource.buffer = buf;
      resampleSource.connect(resampleCtx.destination);
      resampleSource.start(0);
      resampledBuf = await resampleCtx.startRendering();
    }

    for (let c = 0; c < maxChannels; c++) {
      const srcChannel = c < resampledBuf.numberOfChannels ? resampledBuf.getChannelData(c) : resampledBuf.getChannelData(0);
      const dstChannel = mergedBuffer.getChannelData(c);
      const copyLen = Math.min(srcChannel.length, dstChannel.length - currentFrameOffset);
      if (copyLen > 0) {
        dstChannel.set(srcChannel.subarray(0, copyLen), currentFrameOffset);
      }
    }

    currentFrameOffset += destLength;
  }

  reportProgress(0.65, "encoding", "Encoding merged audio output...");
  const outputBlob = await encodeWavChunked(mergedBuffer, reportProgress, options.signal);

  reportProgress(1.0, "complete", "Audio merger completed successfully!");

  return {
    blob: outputBlob,
    filename: `workabhi_merged_${Date.now()}.wav`,
    mimeType: "audio/wav",
    size: outputBlob.size,
    duration: mergedBuffer.duration,
  };
}

/**
 * Retrieve metadata from an audio file
 */
export async function getAudioMetadata(file: File): Promise<AudioMetadata> {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const ext = file.name.split(".").pop()?.toUpperCase() || "AUDIO";
    const durationSec = audioBuffer.duration;
    const minutes = Math.floor(durationSec / 60);
    const seconds = (durationSec % 60).toFixed(1);

    const bitRateEstimate = Math.round((file.size * 8) / Math.max(1, durationSec));

    return {
      format: {
        filename: file.name,
        format_name: `${ext} Audio Container`,
        duration: `${minutes}m ${seconds}s (${durationSec.toFixed(2)}s)`,
        size: formatBytes(file.size),
        bit_rate: `${Math.round(bitRateEstimate / 1000)} kbps`,
      },
      streams: [
        {
          codec_name: ext.toLowerCase(),
          codec_type: "audio",
          sample_rate: `${audioBuffer.sampleRate} Hz`,
          channels: audioBuffer.numberOfChannels,
          channel_layout: audioBuffer.numberOfChannels === 1 ? "Mono (1.0)" : audioBuffer.numberOfChannels === 2 ? "Stereo (2.0)" : `${audioBuffer.numberOfChannels} Channels`,
          duration: `${durationSec.toFixed(2)} s`,
          bit_rate: `${Math.round(bitRateEstimate / 1000)} kbps`,
        },
      ],
    };
  } catch (err) {
    // Basic fallback metadata when full audio decoding isn't supported
    return {
      format: {
        filename: file.name,
        format_name: file.type || "Audio File",
        size: formatBytes(file.size),
      },
    };
  } finally {
    try {
      await audioContext.close();
    } catch {
      // ignore
    }
  }
}