export class WaveletTree {
  private readonly data: number[]
  private readonly _alphabet: number[]
  private readonly _isString: boolean

  constructor(data: number[] | string, alphabet?: number[]) {
    this._isString = typeof data === 'string'
    const numericData: number[] = this._isString
      ? Array.from(data as string, (c) => c.charCodeAt(0))
      : [...(data as number[])]
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

  get text(): string {
    return this.data.map((c) => String.fromCharCode(c)).join('')
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

  access(index: number): string | number | undefined {
    if (index < 0 || index >= this.data.length) {
      return undefined
    }
    const code = this.data[index]!
    return this._isString ? String.fromCharCode(code) : code
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

  select(value: number | string, k: number): number {
    const sym = typeof value === 'string' ? value.charCodeAt(0) : value
    if (k < 1) return -1
    if (!this._alphabet.includes(sym)) return -1
    let count = 0
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === sym) {
        count++
        if (count === k) return i
      }
    }
    return -1
  }

  quantile(k: number, start: number, end: number): number | undefined {
    if (k < 0) return undefined
    if (start < 0) return undefined
    if (end > this.data.length) return undefined
    if (start >= end) return undefined
    const sub = this.data.slice(start, end).sort((a, b) => a - b)
    const idx = Math.min(k, sub.length - 1)
    return sub[idx]
  }

  rangeCount(start: number, end: number, symbol: number): number
  rangeCount(lo: number, hi: number, start: number, end: number): number
  rangeCount(...args: number[]): number {
    if (args.length === 3) {
      const start = args[0]!
      const end = args[1]!
      const symbol = args[2]!
      if (this.data.length === 0) return 0
      if (start >= end) return 0
      const lo = Math.max(0, start)
      const hi = Math.min(end, this.data.length)
      if (lo >= hi) return 0
      let count = 0
      for (let i = lo; i < hi; i++) {
        if (this.data[i] === symbol) count++
      }
      return count
    }
    const lo = args[0]!
    const hi = args[1]!
    const start = args[2]!
    const end = args[3]!
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

  rangeCountAll(start: number, end: number): Map<number, number> {
    const result = new Map<number, number>()
    if (this.data.length === 0) return result
    const lo = Math.max(0, start)
    const hi = Math.min(end, this.data.length)
    for (let i = lo; i < hi; i++) {
      const v = this.data[i]!
      result.set(v, (result.get(v) ?? 0) + 1)
    }
    return result
  }
}
