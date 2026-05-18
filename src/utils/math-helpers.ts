export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function clampPercent(value: number): number {
  return clamp(value, 0, 100)
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
