/**
 * WorkAbhi Background Task Worker
 * Runs heavy image filtering, palette analysis, data transformation,
 * crypto hashing, audio PCM processing, and file operations in background threads.
 */

import type {
  WorkerTaskRequest,
  WorkerTaskResponse,
  WorkerProgressPayload,
} from "./workerTypes";

// Self reference in Web Worker
const ctx: Worker = self as any;

/**
 * Report progress back to orchestrator on main thread
 */
function reportProgress(
  taskId: string,
  progress: number,
  stage: string,
  message: string,
  startTime: number
) {
  const elapsed = Math.max(0.05, (performance.now() - startTime) / 1000);
  const p = Math.max(0, Math.min(1, progress));
  let eta = 0;
  let speed = "";

  if (p > 0.03 && p < 0.99) {
    const rate = p / elapsed;
    eta = Math.max(1, Math.round((1 - p) / rate));
    speed = `${(rate * 100).toFixed(0)}% / s`;
  }

  const payload: WorkerProgressPayload = {
    taskId,
    progress: p,
    stage,
    message,
    elapsedSeconds: Math.round(elapsed),
    estimatedRemainingSeconds: eta,
    speedFormatted: speed,
  };

  ctx.postMessage({
    type: "WORKER_PROGRESS",
    payload,
  });
}

/**
 * Execute Image Pixel Filters in background thread
 */
function processImageFilter(
  taskId: string,
  payload: {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
    filter: string;
    params?: any;
  },
  startTime: number
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const { pixels, width, height, filter, params = {} } = payload;
  const total = pixels.length;
  const numPixels = total / 4;

  reportProgress(taskId, 0.1, "processing", `Applying ${filter} filter in background worker...`, startTime);

  switch (filter) {
    case "grayscale": {
      for (let i = 0; i < total; i += 4) {
        const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }
      break;
    }

    case "black-white": {
      const threshold = params.threshold ?? 128;
      for (let i = 0; i < total; i += 4) {
        const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        const val = gray >= threshold ? 255 : 0;
        pixels[i] = val;
        pixels[i + 1] = val;
        pixels[i + 2] = val;
      }
      break;
    }

    case "invert": {
      for (let i = 0; i < total; i += 4) {
        pixels[i] = 255 - pixels[i];
        pixels[i + 1] = 255 - pixels[i + 1];
        pixels[i + 2] = 255 - pixels[i + 2];
      }
      break;
    }

    case "sepia": {
      for (let i = 0; i < total; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        pixels[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        pixels[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        pixels[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
      }
      break;
    }

    case "brightness": {
      const amount = (params.brightness ?? 0) * 2.55;
      for (let i = 0; i < total; i += 4) {
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + amount));
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + amount));
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + amount));
      }
      break;
    }

    case "contrast": {
      const contrast = params.contrast ?? 0;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (let i = 0; i < total; i += 4) {
        pixels[i] = Math.max(0, Math.min(255, factor * (pixels[i] - 128) + 128));
        pixels[i + 1] = Math.max(0, Math.min(255, factor * (pixels[i + 1] - 128) + 128));
        pixels[i + 2] = Math.max(0, Math.min(255, factor * (pixels[i + 2] - 128) + 128));
      }
      break;
    }

    case "saturation": {
      const sat = (params.saturation ?? 0) / 100;
      for (let i = 0; i < total; i += 4) {
        const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        pixels[i] = Math.max(0, Math.min(255, gray + (pixels[i] - gray) * (1 + sat)));
        pixels[i + 1] = Math.max(0, Math.min(255, gray + (pixels[i + 1] - gray) * (1 + sat)));
        pixels[i + 2] = Math.max(0, Math.min(255, gray + (pixels[i + 2] - gray) * (1 + sat)));
      }
      break;
    }

    case "sharpen": {
      // 3x3 convolution sharpen filter
      const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      const copy = new Uint8ClampedArray(pixels);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;
          let wi = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              const w = weights[wi++];
              r += copy[idx] * w;
              g += copy[idx + 1] * w;
              b += copy[idx + 2] * w;
            }
          }
          const dst = (y * width + x) * 4;
          pixels[dst] = Math.max(0, Math.min(255, r));
          pixels[dst + 1] = Math.max(0, Math.min(255, g));
          pixels[dst + 2] = Math.max(0, Math.min(255, b));
        }
      }
      break;
    }

    default:
      break;
  }

  reportProgress(taskId, 0.95, "finalizing", "Finalizing pixel buffer in worker...", startTime);
  return { pixels, width, height };
}

/**
 * Extract dominant colors and palette from image pixels in background thread
 */
function extractImagePalette(
  taskId: string,
  payload: { pixels: Uint8ClampedArray; count?: number },
  startTime: number
): { dominant: string; palette: string[] } {
  const { pixels, count = 6 } = payload;
  const colorBuckets: Record<string, number> = {};
  const total = pixels.length;

  reportProgress(taskId, 0.2, "analyzing", "Sampling pixel color distribution in background thread...", startTime);

  // Sample every 4th pixel to keep performance high
  const step = 16;
  for (let i = 0; i < total; i += step) {
    const a = pixels[i + 3];
    if (a < 128) continue; // Skip transparent pixels

    // Quantize to reduce noise (step of 16)
    const r = Math.round(pixels[i] / 16) * 16;
    const g = Math.round(pixels[i + 1] / 16) * 16;
    const b = Math.round(pixels[i + 2] / 16) * 16;

    const key = `${r},${g},${b}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  reportProgress(taskId, 0.7, "clustering", "Sorting color prominence clusters...", startTime);

  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([rgbStr]) => {
      const [r, g, b] = rgbStr.split(",").map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    });

  const dominant = sorted[0] || "#ffffff";
  return { dominant, palette: sorted };
}

/**
 * Compute cryptographic hashes in background thread
 */
async function computeHash(
  taskId: string,
  payload: { buffer: ArrayBuffer; algorithms: string[] },
  startTime: number
): Promise<Record<string, string>> {
  const { buffer, algorithms = ["SHA-256"] } = payload;
  const results: Record<string, string> = {};

  for (let idx = 0; idx < algorithms.length; idx++) {
    const algo = algorithms[idx];
    reportProgress(
      taskId,
      (idx / algorithms.length) * 0.9,
      "hashing",
      `Computing ${algo} on ${buffer.byteLength.toLocaleString()} bytes in background...`,
      startTime
    );

    try {
      const hashBuffer = await crypto.subtle.digest(algo, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      results[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      results[algo] = "UNSUPPORTED_ALGO";
    }
  }

  reportProgress(taskId, 1.0, "complete", "Hash calculation completed", startTime);
  return results;
}

/**
 * Heavy CSV / JSON / TSV parse and conversion in background thread
 */
function processDataConversion(
  taskId: string,
  payload: { text: string; from: "csv" | "tsv" | "json"; to: "csv" | "tsv" | "json" },
  startTime: number
): { result: string; rowCount: number } {
  const { text, from, to } = payload;
  reportProgress(taskId, 0.15, "parsing", `Parsing ${from.toUpperCase()} data in worker...`, startTime);

  let rows: Array<Record<string, any>> = [];

  if (from === "json") {
    const parsed = JSON.parse(text);
    rows = Array.isArray(parsed) ? parsed : [parsed];
  } else {
    const delim = from === "tsv" ? "\t" : ",";
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (!lines.length) return { result: "", rowCount: 0 };

    const headers = lines[0].split(delim).map((h) => h.replace(/^["']|["']$/g, "").trim());
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delim).map((v) => v.replace(/^["']|["']$/g, "").trim());
      const row: Record<string, any> = {};
      headers.forEach((h, j) => {
        row[h] = vals[j] ?? "";
      });
      rows.push(row);
      if (i % 2000 === 0) {
        reportProgress(taskId, 0.2 + 0.5 * (i / lines.length), "parsing", `Parsed ${i} of ${lines.length} rows...`, startTime);
      }
    }
  }

  reportProgress(taskId, 0.75, "converting", `Formatting ${rows.length} rows to ${to.toUpperCase()}...`, startTime);

  let result = "";
  if (to === "json") {
    result = JSON.stringify(rows, null, 2);
  } else {
    const delim = to === "tsv" ? "\t" : ",";
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const headerLine = headers.join(delim);
      const dataLines = rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(delim));
      result = [headerLine, ...dataLines].join("\n");
    }
  }

  reportProgress(taskId, 1.0, "complete", `Data converted (${rows.length} rows)`, startTime);
  return { result, rowCount: rows.length };
}

/**
 * Handle incoming messages from the Main Thread Orchestrator
 */
ctx.addEventListener("message", async (e: MessageEvent<WorkerTaskRequest>) => {
  const req = e.data;
  if (!req || !req.id) return;

  const startTime = performance.now();

  try {
    let result: any = null;
    let transferList: Transferable[] = [];

    switch (req.type) {
      case "IMAGE_FILTER": {
        const res = processImageFilter(req.id, req.payload, startTime);
        result = res;
        transferList = [res.pixels.buffer];
        break;
      }

      case "IMAGE_PALETTE": {
        result = extractImagePalette(req.id, req.payload, startTime);
        break;
      }

      case "HASH_COMPUTE": {
        result = await computeHash(req.id, req.payload, startTime);
        break;
      }

      case "DATA_CONVERT": {
        result = processDataConversion(req.id, req.payload, startTime);
        break;
      }

      case "GENERIC_TASK": {
        reportProgress(req.id, 0.5, "processing", "Executing generic background worker task...", startTime);
        result = { status: "OK", echo: req.payload };
        break;
      }

      default:
        throw new Error(`Unknown worker task type: ${req.type}`);
    }

    const response: WorkerTaskResponse = {
      id: req.id,
      success: true,
      result,
      transferList,
    };

    ctx.postMessage({ type: "WORKER_RESULT", ...response }, transferList);
  } catch (error: any) {
    const response: WorkerTaskResponse = {
      id: req.id,
      success: false,
      error: error?.message || String(error),
    };
    ctx.postMessage({ type: "WORKER_ERROR", ...response });
  }
});

export {};
