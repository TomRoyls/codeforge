export class PermutationIterator implements Iterable<number[]> {
  private readonly n: number
  private readonly indices: number[]
  private first = true

  constructor(n: number) {
    this.n = n
    this.indices = Array.from({ length: n }, (_, i) => i)
  }

  [Symbol.iterator](): Iterator<number[]> {
    return this
  }

  next(): IteratorResult<number[]> {
    if (this.n === 0) return { done: true, value: undefined }
    if (this.first) {
      this.first = false
      return { done: false, value: [...this.indices] }
    }
    let i = this.n - 2
    while (i >= 0 && this.indices[i]! > this.indices[i + 1]!) i--
    if (i < 0) return { done: true, value: undefined }
    let j = this.n - 1
    while (this.indices[j]! < this.indices[i]!) j--
    this.swap(i, j)
    this.reverse(i + 1, this.n - 1)
    return { done: false, value: [...this.indices] }
  }

  private swap(i: number, j: number): void {
    const temp = this.indices[i]!
    this.indices[i] = this.indices[j]!
    this.indices[j] = temp
  }

  private reverse(start: number, end: number): void {
    while (start < end) {
      this.swap(start, end)
      start++
      end--
    }
  }

  static all<T>(arr: T[]): T[][] {
    const result: T[][] = []
    const iter = new PermutationIterator(arr.length)
    for (const perm of iter) {
      result.push(perm.map(i => arr[i]!))
    }
    return result
  }

  static count(n: number): number {
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  static nth<T>(arr: T[], k: number): T[] {
    const available = [...arr]
    const result: T[] = []
    let remaining = k
    for (let i = arr.length - 1; i > 0; i--) {
      const fact = PermutationIterator.count(i)
      const idx = Math.floor(remaining / fact)
      result.push(available.splice(idx, 1)[0]!)
      remaining = remaining % fact
    }
    result.push(available[0]!)
    return result
  }
}
