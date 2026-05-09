import type { CompareFn, RunInfo } from './types.js'

const INSERTION_SORT_THRESHOLD = 32

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function insertionSort<T>(
  arr: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
): void {
  for (let i = left + 1; i <= right; i++) {
    const key = arr[i]!
    let j = i - 1
    while (j >= left && compare(arr[j]!, key) > 0) {
      arr[j + 1] = arr[j]!
      j--
    }
    arr[j + 1] = key
  }
}

function findNaturalRuns<T>(
  arr: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
): RunInfo[] {
  const runs: RunInfo[] = []
  let i = left
  while (i <= right) {
    let runEnd = i
    if (runEnd < right && compare(arr[runEnd + 1]!, arr[runEnd]!) >= 0) {
      while (runEnd < right && compare(arr[runEnd + 1]!, arr[runEnd]!) >= 0) {
        runEnd++
      }
      runs.push({ start: i, length: runEnd - i + 1, ascending: true })
    } else if (runEnd < right && compare(arr[runEnd + 1]!, arr[runEnd]!) < 0) {
      while (runEnd < right && compare(arr[runEnd + 1]!, arr[runEnd]!) < 0) {
        runEnd++
      }
      reverseRange(arr, i, runEnd)
      runs.push({ start: i, length: runEnd - i + 1, ascending: true })
    } else {
      runs.push({ start: i, length: 1, ascending: true })
    }
    i = runEnd + 1
  }
  return runs
}

function reverseRange<T>(arr: T[], start: number, end: number): void {
  while (start < end) {
    const tmp = arr[start]!
    arr[start] = arr[end]!
    arr[end] = tmp
    start++
    end--
  }
}

function merge<T>(
  arr: T[],
  left: number,
  mid: number,
  right: number,
  compare: CompareFn<T>,
  buffer: T[],
): void {
  const leftLen = mid - left + 1
  for (let i = 0; i < leftLen; i++) {
    buffer[i] = arr[left + i]!
  }
  let i = 0
  let j = mid + 1
  let dest = left
  while (i < leftLen && j <= right) {
    if (compare(buffer[i]!, arr[j]!) <= 0) {
      arr[dest] = buffer[i]!
      i++
    } else {
      arr[dest] = arr[j]!
      j++
    }
    dest++
  }
  while (i < leftLen) {
    arr[dest] = buffer[i]!
    i++
    dest++
  }
}

function mergeAdaptive<T>(
  arr: T[],
  runs: RunInfo[],
  compare: CompareFn<T>,
  buffer: T[],
): void {
  while (runs.length > 1) {
    const nextRuns: RunInfo[] = []
    let i = 0
    while (i < runs.length) {
      if (i + 1 < runs.length) {
        const r1 = runs[i]!
        const r2 = runs[i + 1]!
        const mid = r1.start + r1.length - 1
        const right = r2.start + r2.length - 1
        merge(arr, r1.start, mid, right, compare, buffer)
        nextRuns.push({
          start: r1.start,
          length: r1.length + r2.length,
          ascending: true,
        })
        i += 2
      } else {
        nextRuns.push(runs[i]!)
        i++
      }
    }
    runs = nextRuns
  }
}

function mergeSortInternal<T>(
  arr: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
  buffer: T[],
): void {
  if (left >= right) return

  const size = right - left + 1
  if (size <= INSERTION_SORT_THRESHOLD) {
    insertionSort(arr, left, right, compare)
    return
  }

  const mid = (left + right) >>> 1
  mergeSortInternal(arr, left, mid, compare, buffer)
  mergeSortInternal(arr, mid + 1, right, compare, buffer)
  merge(arr, left, mid, right, compare, buffer)
}

function mergeSortAdaptiveInternal<T>(
  arr: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
  buffer: T[],
): void {
  if (left >= right) return

  const size = right - left + 1
  if (size <= INSERTION_SORT_THRESHOLD) {
    insertionSort(arr, left, right, compare)
    return
  }

  const runs = findNaturalRuns(arr, left, right, compare)

  for (const run of runs) {
    if (run.length <= INSERTION_SORT_THRESHOLD) {
      insertionSort(arr, run.start, run.start + run.length - 1, compare)
    }
  }

  if (runs.length <= 1) return

  mergeAdaptive(arr, runs, compare, buffer)
}

function countInversionsInternal<T>(
  arr: T[],
  temp: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
): number {
  if (left >= right) return 0
  const mid = (left + right) >>> 1
  let inv = countInversionsInternal(arr, temp, left, mid, compare)
  inv += countInversionsInternal(arr, temp, mid + 1, right, compare)

  for (let i = left; i <= right; i++) {
    temp[i] = arr[i]!
  }

  let i = left
  let j = mid + 1
  let dest = left

  while (i <= mid && j <= right) {
    if (compare(temp[i]!, temp[j]!) <= 0) {
      arr[dest] = temp[i]!
      i++
    } else {
      arr[dest] = temp[j]!
      inv += mid - i + 1
      j++
    }
    dest++
  }
  while (i <= mid) {
    arr[dest] = temp[i]!
    i++
    dest++
  }
  while (j <= right) {
    arr[dest] = temp[j]!
    j++
    dest++
  }
  return inv
}

function mergeSortStableInternal<T>(
  arr: T[],
  indices: number[],
  left: number,
  right: number,
  compare: CompareFn<T>,
  buffer: T[],
  indexBuffer: number[],
): void {
  if (left >= right) return

  const size = right - left + 1
  if (size <= INSERTION_SORT_THRESHOLD) {
    stableInsertionSort(arr, indices, left, right, compare)
    return
  }

  const mid = (left + right) >>> 1
  mergeSortStableInternal(arr, indices, left, mid, compare, buffer, indexBuffer)
  mergeSortStableInternal(arr, indices, mid + 1, right, compare, buffer, indexBuffer)
  stableMerge(arr, indices, left, mid, right, compare, buffer, indexBuffer)
}

function stableInsertionSort<T>(
  arr: T[],
  indices: number[],
  left: number,
  right: number,
  compare: CompareFn<T>,
): void {
  for (let i = left + 1; i <= right; i++) {
    const keyVal = arr[i]!
    const keyIdx = indices[i]!
    let j = i - 1
    while (j >= left && (compare(arr[j]!, keyVal) > 0 || (compare(arr[j]!, keyVal) === 0 && indices[j]! > keyIdx))) {
      arr[j + 1] = arr[j]!
      indices[j + 1] = indices[j]!
      j--
    }
    arr[j + 1] = keyVal
    indices[j + 1] = keyIdx
  }
}

function stableMerge<T>(
  arr: T[],
  indices: number[],
  left: number,
  mid: number,
  right: number,
  compare: CompareFn<T>,
  buffer: T[],
  indexBuffer: number[],
): void {
  const leftLen = mid - left + 1
  for (let i = 0; i < leftLen; i++) {
    buffer[i] = arr[left + i]!
    indexBuffer[i] = indices[left + i]!
  }
  let i = 0
  let j = mid + 1
  let dest = left
  while (i < leftLen && j <= right) {
    const cmp = compare(buffer[i]!, arr[j]!)
    if (cmp < 0 || (cmp === 0 && indexBuffer[i]! <= indices[j]!)) {
      arr[dest] = buffer[i]!
      indices[dest] = indexBuffer[i]!
      i++
    } else {
      arr[dest] = arr[j]!
      indices[dest] = indices[j]!
      j++
    }
    dest++
  }
  while (i < leftLen) {
    arr[dest] = buffer[i]!
    indices[dest] = indexBuffer[i]!
    i++
    dest++
  }
}

export function mergeSortOptimized<T>(arr: T[], compare?: CompareFn<T>): T[] {
  const cmp = compare ?? defaultCompare<T>
  const copy = [...arr]
  if (copy.length <= 1) return copy
  const buffer: T[] = new Array(Math.ceil(copy.length / 2))
  mergeSortAdaptiveInternal(copy, 0, copy.length - 1, cmp, buffer)
  return copy
}

export function mergeSortInPlace<T>(arr: T[], compare?: CompareFn<T>): void {
  const cmp = compare ?? defaultCompare<T>
  if (arr.length <= 1) return
  const buffer: T[] = new Array(Math.ceil(arr.length / 2))
  mergeSortInternal(arr, 0, arr.length - 1, cmp, buffer)
}

export function mergeSortBy<T, U>(
  arr: T[],
  keyFn: (item: T) => U,
  compare?: (a: U, b: U) => number,
): T[] {
  const cmp = compare ?? defaultCompare<U>
  const copy = [...arr]
  if (copy.length <= 1) return copy
  const buffer: T[] = new Array(Math.ceil(copy.length / 2))
  mergeSortAdaptiveInternal(copy, 0, copy.length - 1, (a, b) => cmp(keyFn(a), keyFn(b)), buffer)
  return copy
}

export function mergeSortStable<T>(arr: T[], compare?: CompareFn<T>): T[] {
  const cmp = compare ?? defaultCompare<T>
  const copy = [...arr]
  if (copy.length <= 1) return copy

  const indices = copy.map((_, i) => i)
  const buffer: T[] = new Array(Math.ceil(copy.length / 2) + 1)
  const indexBuffer: number[] = new Array(Math.ceil(copy.length / 2) + 1)
  mergeSortStableInternal(copy, indices, 0, copy.length - 1, cmp, buffer, indexBuffer)
  return copy
}

export function isSorted<T>(arr: T[], compare?: CompareFn<T>): boolean {
  const cmp = compare ?? defaultCompare<T>
  for (let i = 1; i < arr.length; i++) {
    if (cmp(arr[i - 1]!, arr[i]!) > 0) {
      return false
    }
  }
  return true
}

export function countInversions<T>(arr: T[], compare?: CompareFn<T>): number {
  const cmp = compare ?? defaultCompare<T>
  const copy = [...arr]
  if (copy.length <= 1) return 0
  const temp: T[] = new Array(copy.length)
  return countInversionsInternal(copy, temp, 0, copy.length - 1, cmp)
}

export function countRuns<T>(arr: T[], compare?: CompareFn<T>): number {
  const cmp = compare ?? defaultCompare<T>
  if (arr.length === 0) return 0
  if (arr.length === 1) return 1

  let runs = 0
  let i = 0
  while (i < arr.length) {
    runs++
    if (i === arr.length - 1) break

    const direction = cmp(arr[i + 1]!, arr[i]!)
    if (direction >= 0) {
      while (i < arr.length - 1 && cmp(arr[i + 1]!, arr[i]!) >= 0) {
        i++
      }
    } else {
      while (i < arr.length - 1 && cmp(arr[i + 1]!, arr[i]!) < 0) {
        i++
      }
    }
    i++
  }
  return runs
}

export type { CompareFn, RunInfo, SortResult } from './types.js'
