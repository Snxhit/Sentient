import FastNoiseLite from 'https://cdn.jsdelivr.net/npm/fastnoise-lite@1.1.1/FastNoiseLite.min.js';

export function generateTerrain(width, height) {
    const noise = new FastNoiseLite();
    const heights = [];

    for (let x = 0; x < width; x++) {
        const n = noise.GetNoise(x * 0.2, 0);
        heights.push(Math.floor(70 + n * 20));
    }

    return heights;
}