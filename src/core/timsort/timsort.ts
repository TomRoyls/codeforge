import type { CompareFn } from './types.js'

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function computeMinRun(n: number): number {
  let r = 0
  while (n >= 64) {
    r |= n & 1
    n >>= 1
  }
  return n + r
}

function binaryInsertionSort<T>(arr: T[], left: number, right: number, compare: CompareFn<T>): void {
  for (let i = left + 1; i <= right; i++) {
    const key = arr[i]!
    let lo = left
    let hi = i - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (compare(arr[mid]!, key) <= 0) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    for (let j = i - 1; j >= lo; j--) {
      arr[j + 1] = arr[j]!
    }
    arr[lo] = key
  }
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

function findRunLength<T>(arr: T[], start: number, last: number, compare: CompareFn<T>): number {
  if (start >= last) return 1
  let runEnd = start + 1
  if (compare(arr[runEnd]!, arr[start]!) >= 0) {
    while (runEnd < last && compare(arr[runEnd + 1]!, arr[runEnd]!) >= 0) {
      runEnd++
    }
  } else {
    while (runEnd < last && compare(arr[runEnd + 1]!, arr[runEnd]!) < 0) {
      runEnd++
    }
    reverseRange(arr, start, runEnd)
  }
  return runEnd - start + 1
}

function mergeRuns<T>(
  arr: T[],
  start1: number,
  len1: number,
  start2: number,
  len2: number,
  compare: CompareFn<T>,
  tmp: T[],
): void {
  if (len1 <= len2) {
    for (let k = 0; k < len1; k++) {
      tmp[k] = arr[start1 + k]!
    }
    let i = 0
    let j = start2
    let dest = start1
    while (i < len1 && j < start2 + len2) {
      if (compare(tmp[i]!, arr[j]!) <= 0) {
        arr[dest] = tmp[i]!
        i++
      } else {
        arr[dest] = arr[j]!
        j++
      }
      dest++
    }
    while (i < len1) {
      arr[dest] = tmp[i]!
      i++
      dest++
    }
  } else {
    for (let k = 0; k < len2; k++) {
      tmp[k] = arr[start2 + k]!
    }
    let i = len1 - 1
    let j = len2 - 1
    let dest = start2 + len2 - 1
    while (i >= 0 && j >= 0) {
      if (compare(arr[start1 + i]!, tmp[j]!) > 0) {
        arr[dest] = arr[start1 + i]!
        i--
      } else {
        arr[dest] = tmp[j]!
        j--
      }
      dest--
    }
    while (j >= 0) {
      arr[dest] = tmp[j]!
      j--
      dest--
    }
  }
}

function mergeAt<T>(arr: T[], stack: number[][], idx: number, compare: CompareFn<T>, tmp: T[]): void {
  const start1 = stack[idx]![0]!
  const len1 = stack[idx]![1]!
  const start2 = stack[idx + 1]![0]!
  const len2 = stack[idx + 1]![1]!

  stack[idx] = [start1, len1 + len2]
  stack.splice(idx + 1, 1)

  mergeRuns(arr, start1, len1, start2, len2, compare, tmp)
}

function mergeCollapse<T>(arr: T[], stack: number[][], compare: CompareFn<T>, tmp: T[]): void {
  while (stack.length > 1) {
    const n = stack.length
    if (
      n >= 3 &&
      stack[n - 3]![1]! <= stack[n - 2]![1]! + stack[n - 1]![1]!
    ) {
      if (stack[n - 3]![1]! < stack[n - 1]![1]!) {
        mergeAt(arr, stack, n - 3, compare, tmp)
      } else {
        mergeAt(arr, stack, n - 2, compare, tmp)
      }
    } else if (stack[n - 2]![1]! <= stack[n - 1]![1]!) {
      mergeAt(arr, stack, n - 2, compare, tmp)
    } else {
      break
    }
  }
}

function mergeForceCollapse<T>(arr: T[], stack: number[][], compare: CompareFn<T>, tmp: T[]): void {
  while (stack.length > 1) {
    const n = stack.length
    if (n >= 3 && stack[n - 3]![1]! < stack[n - 1]![1]!) {
      mergeAt(arr, stack, n - 3, compare, tmp)
    } else {
      mergeAt(arr, stack, n - 2, compare, tmp)
    }
  }
}

function timsortInternal<T>(arr: T[], compare: CompareFn<T>): void {
  const n = arr.length
  if (n < 2) return

  const minRun = computeMinRun(n)
  const stack: number[][] = []
  const tmp: T[] = []

  let i = 0
  while (i < n) {
    let runLen = findRunLength(arr, i, n - 1, compare)

    if (runLen < minRun) {
      const force = Math.min(minRun, n - i)
      binaryInsertionSort(arr, i, i + force - 1, compare)
      runLen = force
    }

    stack.push([i, runLen])
    mergeCollapse(arr, stack, compare, tmp)
    i += runLen
  }

  mergeForceCollapse(arr, stack, compare, tmp)
}

export function timsort<T>(arr: T[], compare?: CompareFn<T>): T[] {
  const cmp = compare ?? defaultCompare<T>
  const copy = [...arr]
  timsortInternal(copy, cmp)
  return copy
}

export function timsortInPlace<T>(arr: T[], compare?: CompareFn<T>): void {
  const cmp = compare ?? defaultCompare<T>
  timsortInternal(arr, cmp)
}

export function timsortBy<T, U>(
  arr: T[],
  keyFn: (item: T) => U,
  compare?: (a: U, b: U) => number,
): T[] {
  const cmp = compare ?? defaultCompare<U>
  const copy = [...arr]
  timsortInternal(copy, (a, b) => cmp(keyFn(a), keyFn(b)))
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

export function isStable<T>(arr: T[], compare?: CompareFn<T>): boolean {
  const cmp = compare ?? defaultCompare<T>
  interface Tagged {
    value: T
    index: number
  }
  const tagged: Tagged[] = arr.map((value, index) => ({ value, index }))
  timsortInternal(tagged, (a, b) => cmp(a.value, b.value))
  for (let i = 1; i < tagged.length; i++) {
    if (
      cmp(tagged[i - 1]!.value, tagged[i]!.value) === 0 &&
      tagged[i - 1]!.index > tagged[i]!.index
    ) {
      return false
    }
  }
  return true
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

    let runEnd = i + 1
    if (cmp(arr[runEnd]!, arr[i]!) >= 0) {
      while (runEnd < arr.length - 1 && cmp(arr[runEnd + 1]!, arr[runEnd]!) >= 0) {
        runEnd++
      }
    } else {
      while (runEnd < arr.length - 1 && cmp(arr[runEnd + 1]!, arr[runEnd]!) < 0) {
        runEnd++
      }
    }
    i = runEnd + 1
  }
  return runs
}

export type { CompareFn } from './types.js'
