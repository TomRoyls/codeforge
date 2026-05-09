import type { CompareFn } from './types.js'
import { DEFAULT_COMPARE } from './types.js'

function defaultCompare<T>(compare: CompareFn<T> | undefined): CompareFn<T> {
  return compare ?? (DEFAULT_COMPARE as CompareFn<T>)
}

function smallestFibGeq(n: number): { fibM: number; fibM1: number; fibM2: number } {
  let fibM2 = 0
  let fibM1 = 1
  let fibM = fibM2 + fibM1
  while (fibM < n) {
    fibM2 = fibM1
    fibM1 = fibM
    fibM = fibM2 + fibM1
  }
  return { fibM, fibM1, fibM2 }
}

export function fibonacciSearch<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return -1

  const { fibM, fibM1, fibM2 } = smallestFibGeq(n)

  let offset = -1
  let fm = fibM
  let fm1 = fibM1
  let fm2 = fibM2

  while (fm > 1) {
    const i = Math.min(offset + fm2, n - 1)
    const mid = arr[i]!
    const c = cmp(mid, target)
    if (c < 0) {
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    } else if (c > 0) {
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    } else {
      return i
    }
  }

  if (fm1 === 1 && offset + 1 < n) {
    const lastIdx = offset + 1
    if (cmp(arr[lastIdx]!, target) === 0) {
      return lastIdx
    }
  }

  return -1
}

export function fibonacciSearchFirst<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return -1

  const { fibM, fibM1, fibM2 } = smallestFibGeq(n)

  let offset = -1
  let fm = fibM
  let fm1 = fibM1
  let fm2 = fibM2
  let found = -1

  while (fm > 1) {
    const i = Math.min(offset + fm2, n - 1)
    const mid = arr[i]!
    const c = cmp(mid, target)
    if (c < 0) {
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    } else if (c > 0) {
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    } else {
      found = i
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    }
  }

  if (fm1 === 1 && offset + 1 < n) {
    const lastIdx = offset + 1
    if (cmp(arr[lastIdx]!, target) === 0) {
      if (found === -1 || lastIdx < found) {
        found = lastIdx
      }
    }
  }

  if (found !== -1) {
    let first = found
    while (first > 0 && cmp(arr[first - 1]!, target) === 0) {
      first--
    }
    return first
  }

  return -1
}

export function fibonacciSearchLast<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return -1

  const { fibM, fibM1, fibM2 } = smallestFibGeq(n)

  let offset = -1
  let fm = fibM
  let fm1 = fibM1
  let fm2 = fibM2
  let found = -1

  while (fm > 1) {
    const i = Math.min(offset + fm2, n - 1)
    const mid = arr[i]!
    const c = cmp(mid, target)
    if (c < 0) {
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    } else if (c > 0) {
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    } else {
      found = i
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    }
  }

  if (fm1 === 1 && offset + 1 < n) {
    const lastIdx = offset + 1
    if (cmp(arr[lastIdx]!, target) === 0) {
      if (lastIdx > found) {
        found = lastIdx
      }
    }
  }

  if (found !== -1) {
    let last = found
    while (last < n - 1 && cmp(arr[last + 1]!, target) === 0) {
      last++
    }
    return last
  }

  return -1
}

export function fibonacciInsertIndex<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return 0

  const { fibM, fibM1, fibM2 } = smallestFibGeq(n)

  let offset = -1
  let fm = fibM
  let fm1 = fibM1
  let fm2 = fibM2

  while (fm > 1) {
    const i = Math.min(offset + fm2, n - 1)
    const mid = arr[i]!
    const c = cmp(mid, target)
    if (c < 0) {
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    } else {
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    }
  }

  let insertIdx = offset + 1
  while (insertIdx < n && cmp(arr[insertIdx]!, target) < 0) {
    insertIdx++
  }

  return insertIdx
}

export function fibonacciSearchRange<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): [number, number] {
  const first = fibonacciSearchFirst(arr, target, compare)
  if (first === -1) return [-1, -1]
  const last = fibonacciSearchLast(arr, target, compare)
  return [first, last]
}

export function fibonacciSearchBy<T, U>(
  arr: T[],
  target: U,
  keyFn: (item: T) => U,
  compare?: (a: U, b: U) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return -1

  const { fibM, fibM1, fibM2 } = smallestFibGeq(n)

  let offset = -1
  let fm = fibM
  let fm1 = fibM1
  let fm2 = fibM2

  while (fm > 1) {
    const i = Math.min(offset + fm2, n - 1)
    const mid = keyFn(arr[i]!)
    const c = cmp(mid, target)
    if (c < 0) {
      fm = fm1
      fm1 = fm2
      fm2 = fm - fm1
      offset = i
    } else if (c > 0) {
      fm = fm2
      fm1 = fm1 - fm2
      fm2 = fm - fm1
    } else {
      return i
    }
  }

  if (fm1 === 1 && offset + 1 < n) {
    const lastIdx = offset + 1
    if (cmp(keyFn(arr[lastIdx]!), target) === 0) {
      return lastIdx
    }
  }

  return -1
}

export function isSorted<T>(
  arr: T[],
  compare?: (a: T, b: T) => number,
): boolean {
  const cmp = defaultCompare(compare)
  for (let i = 1; i < arr.length; i++) {
    if (cmp(arr[i - 1]!, arr[i]!) > 0) {
      return false
    }
  }
  return true
}

export function fibonacciSearchClosest<T>(
  arr: T[],
  target: T,
  compare?: (a: T, b: T) => number,
): number {
  const cmp = defaultCompare(compare)
  const n = arr.length
  if (n === 0) return -1

  const idx = fibonacciInsertIndex(arr, target, compare)

  if (idx === 0) return 0
  if (idx >= n) return n - 1

  const dLeft = Math.abs(cmp(arr[idx - 1]!, target))
  const dRight = Math.abs(cmp(arr[idx]!, target))

  if (dLeft <= dRight) return idx - 1
  return idx
}

export { DEFAULT_COMPARE } from './types.js'
export type { CompareFn } from './types.js'
