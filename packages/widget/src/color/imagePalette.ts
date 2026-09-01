"use client";

// Extracción de paleta desde imagen: k-means simple sobre los píxeles de la
// imagen reducida a una resolución pequeña ANTES de procesar (procesarla a
// tamaño completo sería innecesariamente lento). Sin librería de visión por
// computador — es un problema pequeño que no la justifica.

import { rgbToHex } from "@sphereswitch/core";
import type { Rgb } from "@sphereswitch/core";

const SAMPLE_SIZE = 64;

function distanceSquared(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/** Inicialización farthest-first: un centroide por cluster bien separado. */
function farthestFirst(pixels: readonly Rgb[], k: number): Rgb[] {
  const chosen: Rgb[] = [pixels[0] as Rgb];
  while (chosen.length < k) {
    let candidate = pixels[0] as Rgb;
    let candidateDistance = -1;
    for (const pixel of pixels) {
      let nearest = Infinity;
      for (const centroid of chosen) {
        nearest = Math.min(nearest, distanceSquared(pixel, centroid));
      }
      if (nearest > candidateDistance) {
        candidateDistance = nearest;
        candidate = pixel;
      }
    }
    chosen.push(candidate);
  }
  return chosen;
}

/**
 * k-means sobre una lista de píxeles. Devuelve `count` colores hex, ordenados
 * del cluster más grande al más pequeño. Función pura y testeable sin Canvas.
 */
export function kmeansPalette(pixels: readonly Rgb[], count = 5, iterations = 12): string[] {
  if (pixels.length === 0) return [];
  const k = Math.min(count, pixels.length);

  let centroids: Rgb[] = farthestFirst(pixels, k);
  const assignments = new Array<number>(pixels.length).fill(0);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let moved = false;
    for (let p = 0; p < pixels.length; p += 1) {
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < k; c += 1) {
        const d = distanceSquared(pixels[p] as Rgb, centroids[c] as Rgb);
        if (d < bestDistance) {
          bestDistance = d;
          best = c;
        }
      }
      if (assignments[p] !== best) {
        assignments[p] = best;
        moved = true;
      }
    }

    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }));
    for (let p = 0; p < pixels.length; p += 1) {
      const bucket = sums[assignments[p] as number] as {
        r: number;
        g: number;
        b: number;
        n: number;
      };
      const pixel = pixels[p] as Rgb;
      bucket.r += pixel.r;
      bucket.g += pixel.g;
      bucket.b += pixel.b;
      bucket.n += 1;
    }
    centroids = sums.map((s, i) =>
      s.n === 0 ? (centroids[i] as Rgb) : { r: s.r / s.n, g: s.g / s.n, b: s.b / s.n },
    );

    if (!moved && iteration > 0) break;
  }

  const counts = new Array<number>(k).fill(0);
  for (const a of assignments) counts[a] = (counts[a] as number) + 1;

  return centroids
    .map((centroid, i) => ({ hex: rgbToHex(centroid), size: counts[i] as number }))
    .sort((a, b) => b.size - a.size)
    .map((entry) => entry.hex);
}

/** Reduce la imagen a `SAMPLE_SIZE`² y extrae `count` colores dominantes. */
export function extractPalette(source: CanvasImageSource, count = 5): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return [];

  context.drawImage(source, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  const pixels: Rgb[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if ((data[i + 3] as number) < 128) continue; // ignora píxeles transparentes
    pixels.push({ r: data[i] as number, g: data[i + 1] as number, b: data[i + 2] as number });
  }
  return kmeansPalette(pixels, count);
}
