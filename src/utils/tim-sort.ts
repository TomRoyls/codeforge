const MIN_MERGE = 32

export class TimSort {
  static sort<T>(arr: T[], compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)): T[] {
    const n = arr.length
    if (n < 2) return arr

    const result = [...arr]
    const minRun = TimSort.minRun(n)

    for (let start = 0; start < n; start += minRun) {
      const end = Math.min(start + minRun, n)
      TimSort.insertionSort(result, start, end, compare)
    }

    const stack: Array<{ start: number; length: number }> = []
    let stackSize = 0

    let i = 0
    while (i < n) {
      let runLen = TimSort.countRunAndMakeAscending(result, i, n, compare)
      if (runLen < minRun) {
        const force = Math.min(minRun, n - i)
        TimSort.insertionSort(result, i, i + force, compare)
        runLen = force
      }
      stack[stackSize++] = { start: i, length: runLen }
      TimSort.mergeCollapse(result, stack, stackSize, compare)
      stackSize = stack.length
      i += runLen
    }

    while (stackSize > 1) {
      const a = stack[stackSize - 2]!
      const b = stack[stackSize - 1]!
      TimSort.merge(result, a.start, a.start + a.length, b.start + b.length, compare)
      a.length += b.length
      stack.length = --stackSize
    }

    return result
  }

  private static insertionSort<T>(arr: T[], left: number, right: number, compare: (a: T, b: T) => number): void {
    for (let i = left + 1; i < right; i++) {
      const key = arr[i]!
      let j = i - 1
      while (j >= left && compare(arr[j]!, key) > 0) {
        arr[j + 1] = arr[j]!
        j--
      }
      arr[j + 1] = key
    }
  }

  private static countRunAndMakeAscending<T>(arr: T[], start: number, end: number, compare: (a: T, b: T) => number): number {
    if (start + 1 === end) return 1
    let run = start + 1
    if (compare(arr[run]!, arr[run - 1]!) >= 0) {
      while (run < end && compare(arr[run]!, arr[run - 1]!) >= 0) {
        run++
      }
    } else {
      while (run < end && compare(arr[run]!, arr[run - 1]!) < 0) {
        run++
      }
      TimSort.reverseRange(arr, start, run)
    }
    return run - start
  }

  private static reverseRange<T>(arr: T[], start: number, end: number): void {
    end--
    while (start < end) {
      const tmp = arr[start]!
      arr[start] = arr[end]!
      arr[end] = tmp
      start++
      end--
    }
  }

  private static minRun(n: number): number {
    let r = 0
    while (n >= MIN_MERGE) {
      r |= n & 1
      n >>= 1
    }
    return n + r
  }

  private static mergeCollapse<T>(arr: T[], stack: Array<{ start: number; length: number }>, stackSize: number, compare: (a: T, b: T) => number): void {
    while (stackSize > 1) {
      const n = stackSize - 2
      const a = stack[n]
      const b = stack[n + 1]
      if (!a || !b) break
      if (a.length <= b.length) {
        TimSort.merge(arr, a.start, a.start + a.length, b.start + b.length, compare)
        a.length += b.length
        stack.splice(n + 1, 1)
        stackSize--
      } else {
        break
      }
    }
  }

  private static merge<T>(arr: T[], start: number, mid: number, end: number, compare: (a: T, b: T) => number): void {
    const left = arr.slice(start, mid)
    const right = arr.slice(mid, end)
    let i = 0
    let j = 0
    let k = start
    while (i < left.length && j < right.length) {
      if (compare(left[i]!, right[j]!) <= 0) {
        arr[k++] = left[i++]!
      } else {
        arr[k++] = right[j++]!
      }
    }
    while (i < left.length) {
      arr[k++] = left[i++]!
    }
    while (j < right.length) {
      arr[k++] = right[j++]!
    }
  }

  static isSorted<T>(arr: T[], compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (compare(arr[i - 1]!, arr[i]!) > 0) return false
    }
    return true
  }

  static stable<T>(arr: Array<T & { _sortIdx?: number }>, keyFn: (item: T) => number): T[] {
    const indexed = arr.map((item, idx) => ({ item, key: keyFn(item), idx }))
    indexed.sort((a, b) => {
      const cmp = a.key - b.key
      if (cmp !== 0) return cmp
      return a.idx - b.idx
    })
    return indexed.map((x) => x.item)
  }
}
