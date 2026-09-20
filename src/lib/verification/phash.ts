/**
 * Pure TypeScript 64-bit DCT Perceptual Hashing (pHash)
 * Works in both browser (Canvas / ImageData) and server environments.
 */

function computeDCT1D(vector: number[]): number[] {
  const N = vector.length;
  const result: number[] = new Array(N).fill(0);
  const factor = Math.PI / (2 * N);

  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += vector[n] * Math.cos((2 * n + 1) * k * factor);
    }
    const c = k === 0 ? Math.SQRT1_2 : 1;
    result[k] = sum * c * Math.sqrt(2 / N);
  }
  return result;
}

function computeDCT2D(matrix: number[][]): number[][] {
  const size = 32;
  const intermediate: number[][] = [];

  for (let y = 0; y < size; y++) {
    intermediate.push(computeDCT1D(matrix[y]));
  }

  const output: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  for (let x = 0; x < size; x++) {
    const col = intermediate.map(row => row[x]);
    const dctCol = computeDCT1D(col);
    for (let y = 0; y < size; y++) {
      output[y][x] = dctCol[y];
    }
  }

  return output;
}

export function computePHashFromGrayscale32x32(grayscalePixels: number[]): string {
  const size = 32;
  const matrix: number[][] = [];
  for (let y = 0; y < size; y++) {
    matrix.push(grayscalePixels.slice(y * size, (y + 1) * size));
  }

  const dct = computeDCT2D(matrix);

  const lowFreq: number[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (y === 0 && x === 0) continue;
      lowFreq.push(dct[y][x]);
    }
  }

  const sorted = [...lowFreq].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  let binary = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      binary += dct[y][x] > median ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    const chunk = binary.slice(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }

  return hex.padStart(16, "0");
}

export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== 16 || hash2.length !== 16) {
    return 64;
  }

  let distance = 0;
  for (let i = 0; i < 16; i++) {
    const v1 = parseInt(hash1[i], 16);
    const v2 = parseInt(hash2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

export function getSimilarityScore(hash1: string, hash2: string): number {
  const dist = calculateHammingDistance(hash1, hash2);
  const similarity = (1 - dist / 64) * 100;
  return Math.max(0, Math.min(100, Math.round(similarity * 10) / 10));
}

export function isDuplicateHash(hash1: string, hash2: string, maxBitDistance = 6): boolean {
  return calculateHammingDistance(hash1, hash2) <= maxBitDistance;
}

export async function computeBrowserPHash(imageElementOrBlob: HTMLImageElement | Blob): Promise<string> {
  let img: HTMLImageElement;

  if (imageElementOrBlob instanceof Blob) {
    img = new Image();
    const url = URL.createObjectURL(imageElementOrBlob);
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    URL.revokeObjectURL(url);
  } else {
    img = imageElementOrBlob;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2d canvas context");

  ctx.drawImage(img, 0, 0, 32, 32);
  const imgData = ctx.getImageData(0, 0, 32, 32);
  const pixels = imgData.data;

  const grayscale: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    grayscale.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  return computePHashFromGrayscale32x32(grayscale);
}
