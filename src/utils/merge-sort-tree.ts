export class MergeSortTree {
  private readonly tree: number[][]
  private readonly n: number

  constructor(arr: number[]) {
    this.n = arr.length
    this.tree = new Array(4 * this.n)
    for (let i = 0; i < 4 * this.n; i++) {
      this.tree[i] = []
    }
    if (this.n > 0) {
      this.build(1, 0, this.n - 1, arr)
    }
  }

  queryCountLessThan(left: number, right: number, value: number): number {
    if (left > right || this.n === 0) return 0
    return this.queryCount(1, 0, this.n - 1, left, right, value)
  }

  queryCountInRange(left: number, right: number, lo: number, hi: number): number {
    return this.queryCountLessThan(left, right, hi + 1) - this.queryCountLessThan(left, right, lo)
  }

  queryKthSmallest(left: number, right: number, k: number): number {
    const allValues = this.getAllValues(left, right)
    allValues.sort((a, b) => a - b)
    return allValues[k]!
  }

  querySorted(left: number, right: number): number[] {
    return this.getAllValues(left, right).sort((a, b) => a - b)
  }

  private getAllValues(left: number, right: number): number[] {
    const result: number[] = []
    this.collect(1, 0, this.n - 1, left, right, result)
    return result
  }

  private collect(node: number, nl: number, nr: number, ql: number, qr: number, result: number[]): void {
    if (ql > nr || qr < nl) return
    if (ql <= nl && nr <= qr) {
      result.push(...this.tree[node]!)
      return
    }
    const mid = (nl + nr) >>> 1
    this.collect(node * 2, nl, mid, ql, qr, result)
    this.collect(node * 2 + 1, mid + 1, nr, ql, qr, result)
  }

  private build(node: number, l: number, r: number, arr: number[]): void {
    if (l === r) {
      this.tree[node] = [arr[l]!]
      return
    }
    const mid = (l + r) >>> 1
    this.build(node * 2, l, mid, arr)
    this.build(node * 2 + 1, mid + 1, r, arr)
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private merge(a: number[], b: number[]): number[] {
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
      if (a[i]! <= b[j]!) {
        result.push(a[i]!)
        i++
      } else {
        result.push(b[j]!)
        j++
      }
    }
    while (i < a.length) {
      result.push(a[i]!)
      i++
    }
    while (j < b.length) {
      result.push(b[j]!)
      j++
    }
    return result
  }

  private queryCount(node: number, nl: number, nr: number, ql: number, qr: number, value: number): number {
    if (ql > nr || qr < nl) return 0
    if (ql <= nl && nr <= qr) {
      return this.binarySearchCount(this.tree[node]!, value)
    }
    const mid = (nl + nr) >>> 1
    return this.queryCount(node * 2, nl, mid, ql, qr, value)
      + this.queryCount(node * 2 + 1, mid + 1, nr, ql, qr, value)
  }

  private binarySearchCount(arr: number[], value: number): number {
    let lo = 0
    let hi = arr.length - 1
    let result = 0
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (arr[mid]! < value) {
        result = mid + 1
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }
}
