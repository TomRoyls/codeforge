export class SortAlgorithms2 {
  static bubbleSort(arr: number[]): number[] {
    const a = [...arr]
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]] }
      }
    }
    return a
  }

  static selectionSort(arr: number[]): number[] {
    const a = [...arr]
    for (let i = 0; i < a.length; i++) {
      let minIdx = i
      for (let j = i + 1; j < a.length; j++) {
        if (a[j] < a[minIdx]) minIdx = j
      }
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
    }
    return a
  }

  static insertionSort(arr: number[]): number[] {
    const a = [...arr]
    for (let i = 1; i < a.length; i++) {
      const key = a[i]
      let j = i - 1
      while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j-- }
      a[j + 1] = key
    }
    return a
  }

  static mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return [...arr]
    const mid = Math.floor(arr.length / 2)
    const left = SortAlgorithms2.mergeSort(arr.slice(0, mid))
    const right = SortAlgorithms2.mergeSort(arr.slice(mid))
    const result: number[] = []
    let i = 0, j = 0
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) result.push(left[i++])
      else result.push(right[j++])
    }
    while (i < left.length) result.push(left[i++])
    while (j < right.length) result.push(right[j++])
    return result
  }

  static quickSort(arr: number[]): number[] {
    if (arr.length <= 1) return [...arr]
    const pivot = arr[0]
    const left = arr.slice(1).filter(x => x <= pivot)
    const right = arr.slice(1).filter(x => x > pivot)
    return [...SortAlgorithms2.quickSort(left), pivot, ...SortAlgorithms2.quickSort(right)]
  }

  static heapSort(arr: number[]): number[] {
    const a = [...arr]
    const n = a.length
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) SortAlgorithms2.heapify(a, n, i)
    for (let i = n - 1; i > 0; i--) {
      ;[a[0], a[i]] = [a[i], a[0]]
      SortAlgorithms2.heapify(a, i, 0)
    }
    return a
  }

  private static heapify(a: number[], n: number, i: number): void {
    let largest = i
    const l = 2 * i + 1, r = 2 * i + 2
    if (l < n && a[l] > a[largest]) largest = l
    if (r < n && a[r] > a[largest]) largest = r
    if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; SortAlgorithms2.heapify(a, n, largest) }
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): SortAlgorithms2 { return new SortAlgorithms2() }
  equals(other: unknown): boolean { return other instanceof SortAlgorithms2 }
}
