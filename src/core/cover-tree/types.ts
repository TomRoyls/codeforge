export type CoverTreeDistance<T> = (a: T, b: T) => number

export interface CoverTreeOptions<T> {
  distance: CoverTreeDistance<T>
  base: number
}

export const DEFAULT_COVERTREE_BASE = 2

export interface Point2D {
  x: number
  y: number
}

export function euclideanDistance2D(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function manhattanDistance2D(a: Point2D, b: Point2D): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function numberDistance(a: number, b: number): number {
  return Math.abs(a - b)
}

export const DEFAULT_COVERTREE_OPTIONS: CoverTreeOptions<number> = {
  distance: numberDistance,
  base: DEFAULT_COVERTREE_BASE,
}
