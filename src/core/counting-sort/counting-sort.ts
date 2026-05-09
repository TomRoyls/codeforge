import type { MinMax } from './types.js'

export function getMinMax(arr: number[]): MinMax {
  if (arr.length === 0) {
    return { min: 0, max: 0 }
  }
  let min = arr[0]!
  let max = arr[0]!
  for (let i = 1; i < arr.length; i++) {
    const val = arr[i]!
    if (val < min) min = val
    if (val > max) max = val
  }
  return { min, max }
}

export function getCounts(arr: number[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i]!
    counts.set(val, (counts.get(val) ?? 0) + 1)
  }
  return counts
}

export function isSorted(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1]! > arr[i]!) {
      return false
    }
  }
  return true
}

function countingSortInternal(arr: number[], min: number, max: number): number[] {
  const range = max - min + 1
  const counts = new Array<number>(range).fill(0)
  for (let i = 0; i < arr.length; i++) {
    const idx = arr[i]! - min
    counts[idx] = counts[idx]! + 1
  }
  const result: number[] = new Array(arr.length)
  let pos = 0
  for (let i = 0; i < range; i++) {
    for (let j = 0; j < counts[i]!; j++) {
      result[pos] = i + min
      pos++
    }
  }
  return result
}

export function countingSort(arr: number[]): number[] {
  if (arr.length <= 1) return [...arr]
  const { min, max } = getMinMax(arr)
  return countingSortInternal(arr, min, max)
}

export function countingSortInPlace(arr: number[]): void {
  if (arr.length <= 1) return
  const { min, max } = getMinMax(arr)
  const sorted = countingSortInternal(arr, min, max)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = sorted[i]!
  }
}

export function countingSortWithMax(arr: number[], max: number, min: number = 0): number[] {
  if (arr.length <= 1) return [...arr]
  return countingSortInternal(arr, min, max)
}

export function countingSortBy<T>(
  arr: T[],
  keyFn: (item: T) => number,
  max?: number,
  min: number = 0,
): T[] {
  if (arr.length <= 1) return [...arr]
  const keys = arr.map(keyFn)
  const actualMax = max ?? Math.max(...keys)
  const actualMin = min
  const range = actualMax - actualMin + 1
  const counts = new Array<number>(range).fill(0)
  for (let i = 0; i < keys.length; i++) {
    const idx = keys[i]! - actualMin
    counts[idx] = counts[idx]! + 1
  }
  const positions = new Array<number>(range).fill(0)
  for (let i = 1; i < range; i++) {
    positions[i] = positions[i - 1]! + counts[i - 1]!
  }
  const result: T[] = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    const key = keys[i]! - actualMin
    result[positions[key]!] = arr[i]!
    positions[key] = positions[key]! + 1
  }
  return result
}

export function countingSortStable<T>(
  arr: T[],
  keyFn: (item: T) => number,
  max?: number,
  min: number = 0,
): T[] {
  if (arr.length <= 1) return [...arr]
  const keys = arr.map(keyFn)
  const actualMax = max ?? Math.max(...keys)
  const actualMin = min
  const range = actualMax - actualMin + 1
  const counts = new Array<number>(range).fill(0)
  for (let i = 0; i < keys.length; i++) {
    const idx = keys[i]! - actualMin
    counts[idx] = counts[idx]! + 1
  }
  for (let i = 1; i < range; i++) {
    counts[i] = counts[i]! + counts[i - 1]!
  }
  const result: T[] = new Array(arr.length)
  for (let i = arr.length - 1; i >= 0; i--) {
    const key = keys[i]! - actualMin
    counts[key] = counts[key]! - 1
    result[counts[key]!] = arr[i]!
  }
  return result
}

class CountingSorter {
  private arr: number[]

  constructor(arr: number[]) {
    this.arr = arr
  }

  sort(): number[] {
    return countingSort(this.arr)
  }

  static fromArray(arr: number[]): number[] {
    return countingSort(arr)
  }
}

export { CountingSorter }

export type { MinMax } from './types.js'
