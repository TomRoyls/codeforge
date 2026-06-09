type CompareFn<T> = (a: T, b: T) => number
interface RunInfo { start: number; length: number }

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function binaryInsertionSort<T>(
  arr: T[],
  left: number,
  right: number,
  compare: CompareFn<T>,
): void {
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

function findRun<T>(
  arr: T[],
  start: number,
  last: number,
  compare: CompareFn<T>,
): number {
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

function mergeAt<T>(
  arr: T[],
  stack: RunInfo[],
  idx: number,
  compare: CompareFn<T>,
  tmp: T[],
): void {
  const start1 = stack[idx]!.start
  const len1 = stack[idx]!.length
  const start2 = stack[idx + 1]!.start
  const len2 = stack[idx + 1]!.length

  stack[idx] = { start: start1, length: len1 + len2 }
  stack.splice(idx + 1, 1)

  mergeRuns(arr, start1, len1, start2, len2, compare, tmp)
  mergeCollapse(arr, stack, compare, tmp)
}

function mergeCollapse<T>(
  arr: T[],
  stack: RunInfo[],
  compare: CompareFn<T>,
  tmp: T[],
): void {
  while (stack.length > 1) {
    const n = stack.length
    if (n >= 3 && stack[n - 3]!.length <= stack[n - 2]!.length + stack[n - 1]!.length) {
      if (stack[n - 3]!.length < stack[n - 1]!.length) {
        mergeAt(arr, stack, n - 3, compare, tmp)
      } else {
        mergeAt(arr, stack, n - 2, compare, tmp)
      }
    } else if (stack[n - 2]!.length <= stack[n - 1]!.length) {
      mergeAt(arr, stack, n - 2, compare, tmp)
    } else {
      break
    }
  }
}

function mergeForceCollapse<T>(
  arr: T[],
  stack: RunInfo[],
  compare: CompareFn<T>,
  tmp: T[],
): void {
  while (stack.length > 1) {
    const n = stack.length
    if (n >= 3 && stack[n - 3]!.length < stack[n - 1]!.length) {
      mergeAt(arr, stack, n - 3, compare, tmp)
    } else {
      mergeAt(arr, stack, n - 2, compare, tmp)
    }
  }
}

function mergeLow<T>(
  arr: T[],
  start1: number,
  len1: number,
  start2: number,
  len2: number,
  compare: CompareFn<T>,
  tmp: T[],
): void {
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
}

function mergeHigh<T>(
  arr: T[],
  start1: number,
  len1: number,
  start2: number,
  len2: number,
  compare: CompareFn<T>,
  tmp: T[],
): void {
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
    mergeLow(arr, start1, len1, start2, len2, compare, tmp)
  } else {
    mergeHigh(arr, start1, len1, start2, len2, compare, tmp)
  }
}

export class TimSort3<T> {
  private compare: CompareFn<T>
  private tmp: T[] = []

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
  }

  sort(arr: T[]): T[] {
    const copy = [...arr]
    this.sortInPlace(copy)
    return copy
  }

  sortDescending(arr: T[]): T[] {
    const descendingCompare = (a: T, b: T) => -this.compare(a, b)
    const copy = [...arr]
    const sorter = new TimSort3<T>(descendingCompare)
    sorter.sortInPlace(copy)
    return copy
  }

  sortRange(arr: T[], start: number, end: number): T[] {
    const copy = [...arr]
    const len = copy.length
    if (len < 2 || start >= end || start >= len || end <= 0) return copy

    const validStart = Math.max(0, start)
    const validEnd = Math.min(len - 1, end)
    const slice = copy.slice(validStart, validEnd + 1)
    this.sortInPlace(slice)
    
    for (let i = 0; i < slice.length; i++) {
      copy[validStart + i] = slice[i]!
    }
    
    return copy
  }

  stableSort(arr: T[]): T[] {
    interface Tagged {
      value: T
      index: number
    }
    const tagged: Tagged[] = arr.map((value, index) => ({ value, index }))
    const taggedSorter = new TimSort3<Tagged>((a, b) => {
      const cmp = this.compare(a.value, b.value)
      if (cmp !== 0) return cmp
      return a.index - b.index
    })
    taggedSorter.sortInPlace(tagged)
    return tagged.map(item => item.value)
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  countRuns(arr: T[]): number {
    const len = arr.length
    if (len === 0) return 0
    if (len === 1) return 1

    let runs = 0
    let i = 0
    while (i < len) {
      runs++
      if (i === len - 1) break

      let runEnd = i + 1
      if (this.compare(arr[runEnd]!, arr[i]!) >= 0) {
        while (runEnd < len - 1 && this.compare(arr[runEnd + 1]!, arr[runEnd]!) >= 0) {
          runEnd++
        }
      } else {
        while (runEnd < len - 1 && this.compare(arr[runEnd + 1]!, arr[runEnd]!) < 0) {
          runEnd++
        }
      }
      i = runEnd + 1
    }
    return runs
  }

  getMinRun(n: number): number {
    let r = 0
    while (n >= 64) {
      r |= n & 1
      n >>>= 1
    }
    return n + r
  }

  getTimeComplexity(): string {
    return 'O(n log n)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }

  private sortInPlace(arr: T[]): void {
    const n = arr.length
    if (n < 2) return

    const minRun = this.getMinRun(n)
    const stack: RunInfo[] = []

    let i = 0
    while (i < n) {
      let runLen = findRun(arr, i, n - 1, this.compare)

      if (runLen < minRun) {
        const force = Math.min(minRun, n - i)
        binaryInsertionSort(arr, i, i + force - 1, this.compare)
        runLen = force
      }

      stack.push({ start: i, length: runLen })
      mergeCollapse(arr, stack, this.compare, this.tmp)
      i += runLen
    }

    mergeForceCollapse(arr, stack, this.compare, this.tmp)
  }
}

export type { RunInfo }
