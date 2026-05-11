export type KDPoint = number[]

export type DistanceFunction = (a: KDPoint, b: KDPoint) => number

export interface KDTreeOptions {
  dimensions: number
  distance: DistanceFunction
}

export const euclideanDistance: DistanceFunction = (a: KDPoint, b: KDPoint): number => {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const diff = a[i]! - b[i]!
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

export const euclideanSquared: DistanceFunction = (a: KDPoint, b: KDPoint): number => {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const diff = a[i]! - b[i]!
    sum += diff * diff
  }
  return sum
}

export const manhattanDistance: DistanceFunction = (a: KDPoint, b: KDPoint): number => {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    sum += Math.abs(a[i]! - b[i]!)
  }
  return sum
}

export const DEFAULT_KDTREE_OPTIONS: KDTreeOptions = {
  dimensions: 2,
  distance: euclideanSquared,
}
