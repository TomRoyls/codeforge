export class WaveletTree {
  private readonly data: number[]
  private readonly _alphabet: number[]

  constructor(data: number[] | string, alphabet?: number[]) {
    const numericData = typeof data === 'string'
      ? Array.from(data, (c) => c.charCodeAt(0))
      : [...data]
    this.data = numericData
    this._alphabet = alphabet
      ? [...alphabet].sort((a, b) => a - b)
      : [...new Set(numericData)].sort((a, b) => a - b)
  }

  get length(): number {
    return this.data.length
  }

  get alphabetSize(): number {
    return this._alphabet.length
  }

  getAlphabet(): number[] {
    return [...this._alphabet]
  }

  get alphabet(): number[] {
    return this.getAlphabet()
  }

  toArray(): number[] {
    return [...this.data]
  }

  static fromArray(data: number[]): WaveletTree {
    return new WaveletTree(data)
  }

  access(index: number): number | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data[index]
  }

  rank(value: number | string, endIndex: number): number {
    const sym = typeof value === 'string' ? value.charCodeAt(0) : value
    if (this.data.length === 0) return 0
    if (endIndex <= 0) return 0
    if (!this._alphabet.includes(sym)) return 0
    const end = Math.min(endIndex, this.data.length)
    let count = 0
    for (let i = 0; i < end; i++) {
      if (this.data[i] === sym) count++
    }
    return count
  }

  rankRange(value: number | string, start: number, end: number): number {
    if (start >= end) return 0
    const lo = Math.max(0, start)
    const hi = Math.min(end, this.data.length)
    if (lo >= hi) return 0
    const sym = typeof value === 'string' ? value.charCodeAt(0) : value
    if (!this._alphabet.includes(sym)) return 0
    let count = 0
    for (let i = lo; i < hi; i++) {
      if (this.data[i] === sym) count++
    }
    return count
  }

  // Returns undefined for: negative k, negative start, end > length,
  // or start >= end. Clamps k >= range size to the range maximum.
  quantile(k: number, start: number, end: number): number | undefined {
    if (k < 0) return undefined
    if (start < 0) return undefined
    if (end > this.data.length) return undefined
    if (start >= end) return undefined
    const sub = this.data.slice(start, end).sort((a, b) => a - b)
    const idx = Math.min(k, sub.length - 1)
    return sub[idx]
  }

  // Counts values in [lo, hi] (inclusive) within data[start..end).
  rangeCount(lo: number, hi: number, start: number, end: number): number {
    if (this.data.length === 0) return 0
    if (lo > hi) return 0
    if (start >= end) return 0
    const clampedStart = Math.max(0, start)
    const clampedEnd = Math.min(end, this.data.length)
    if (clampedStart >= clampedEnd) return 0
    let count = 0
    for (let i = clampedStart; i < clampedEnd; i++) {
      const v = this.data[i]!
      if (v >= lo && v <= hi) count++
    }
    return count
  }
}
