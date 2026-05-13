type CompareFn<T> = (a: T, b: T) => number
interface RunInfo { start: number; length: number; ascending: boolean }

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

function mergeSortNaturalInternal<T>(
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

function mergeSortBottomUp<T>(
  arr: T[],
  compare: CompareFn<T>,
): void {
  const n = arr.length
  if (n <= 1) return
  const buffer: T[] = new Array(n)
  let width = 1
  while (width < n) {
    for (let i = 0; i < n; i += width * 2) {
      const left = i
      const mid = Math.min(i + width, n) - 1
      const right = Math.min(i + width * 2, n) - 1
      merge(arr, left, mid, right, compare, buffer)
    }
    width *= 2
  }
}

export function mergeTwoArrays<T>(
  arr1: T[],
  arr2: T[],
  compare: CompareFn<T>,
): T[] {
  const result: T[] = []
  let i = 0
  let j = 0
  while (i < arr1.length && j < arr2.length) {
    if (compare(arr1[i]!, arr2[j]!) <= 0) {
      result.push(arr1[i]!)
      i++
    } else {
      result.push(arr2[j]!)
      j++
    }
  }
  while (i < arr1.length) {
    result.push(arr1[i]!)
    i++
  }
  while (j < arr2.length) {
    result.push(arr2[j]!)
    j++
  }
  return result
}

function mergeKSortedArrays<T>(
  arrays: T[][],
  compare: CompareFn<T>,
): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return [...arrays[0]!]
  
  const result: T[] = []
  const heap: { arrIdx: number; elemIdx: number; value: T }[] = []
  const arrayLengths: number[] = []
  
  for (let i = 0; i < arrays.length; i++) {
    arrayLengths[i] = arrays[i]!.length
    if (arrayLengths[i]! > 0) {
      heap.push({ arrIdx: i, elemIdx: 0, value: arrays[i]![0]! })
      heapifyUp(heap, heap.length - 1, compare)
    }
  }
  
  while (heap.length > 0) {
    const min = heap[0]!
    const arrIdx = min.arrIdx
    const elemIdx = min.elemIdx
    
    if (elemIdx < arrayLengths[arrIdx]!) {
      result.push(min.value)
      const nextElemIdx = elemIdx + 1
      
      if (nextElemIdx < arrayLengths[arrIdx]!) {
        heap[0] = {
          arrIdx,
          elemIdx: nextElemIdx,
          value: arrays[arrIdx]![nextElemIdx]!,
        }
        heapifyDown(heap, 0, compare)
      } else {
        heap[0] = heap[heap.length - 1]!
        heap.length--
        if (heap.length > 0) {
          heapifyDown(heap, 0, compare)
        }
      }
    } else {
      heap[0] = heap[heap.length - 1]!
      heap.length--
      if (heap.length > 0) {
        heapifyDown(heap, 0, compare)
      }
    }
  }
  
  return result
}

function heapifyUp<T>(
  heap: { arrIdx: number; elemIdx: number; value: T }[],
  idx: number,
  compare: CompareFn<T>,
): void {
  while (idx > 0) {
    const parentIdx = (idx - 1) >>> 1
    const parent = heap[parentIdx]!
    const current = heap[idx]!
    const cmp = compare(parent.value, current.value)
    if (cmp > 0 || (cmp === 0 && parent.elemIdx > current.elemIdx)) {
      const tmp = parent
      heap[parentIdx] = current
      heap[idx] = tmp
      idx = parentIdx
    } else {
      break
    }
  }
}

function heapifyDown<T>(
  heap: { arrIdx: number; elemIdx: number; value: T }[],
  idx: number,
  compare: CompareFn<T>,
): void {
  const n = heap.length
  while (true) {
    const left = idx * 2 + 1
    const right = idx * 2 + 2
    let smallest = idx
    
    if (left < n) {
      const cmp = compare(heap[left]!.value, heap[smallest]!.value)
      if (cmp < 0 || (cmp === 0 && heap[left]!.elemIdx < heap[smallest]!.elemIdx)) {
        smallest = left
      }
    }
    if (right < n) {
      const cmp = compare(heap[right]!.value, heap[smallest]!.value)
      if (cmp < 0 || (cmp === 0 && heap[right]!.elemIdx < heap[smallest]!.elemIdx)) {
        smallest = right
      }
    }
    
    if (smallest === idx) break
    
    const tmp = heap[smallest]!
    heap[smallest] = heap[idx]!
    heap[idx] = tmp
    idx = smallest
  }
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

export class MergeSort4<T> {
  private compare: CompareFn<T>

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const buffer: T[] = new Array(Math.ceil(copy.length / 2))
    mergeSortNaturalInternal(copy, 0, copy.length - 1, this.compare, buffer)
    return copy
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const descendingCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    const buffer: T[] = new Array(Math.ceil(copy.length / 2))
    mergeSortNaturalInternal(copy, 0, copy.length - 1, descendingCompare, buffer)
    return copy
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  bottomUp(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    mergeSortBottomUp(copy, this.compare)
    return copy
  }

  inPlace(arr: T[]): void {
    if (arr.length <= 1) return
    const buffer: T[] = new Array(Math.ceil(arr.length / 2))
    mergeSortInternal(arr, 0, arr.length - 1, this.compare, buffer)
  }

  countInversions(arr: T[]): number {
    if (arr.length <= 1) return 0
    const copy = [...arr]
    const temp: T[] = new Array(copy.length)
    return countInversionsInternal(copy, temp, 0, copy.length - 1, this.compare)
  }

  mergeKSorted(arrays: T[][]): T[] {
    if (arrays.length === 0) return []
    if (arrays.length === 1) return [...arrays[0]!]
    return mergeKSortedArrays(arrays, this.compare)
  }

  getTimeComplexity(): string {
    return 'O(n log n)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }
}
