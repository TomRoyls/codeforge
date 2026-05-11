import type { CircularSuffixArrayInput } from './types.js'

export class CircularSuffixArray {
  private _data: number[]
  private _sa: number[]
  private _rank: number[]
  private _lcp: number[]

  constructor(data: CircularSuffixArrayInput) {
    if (typeof data === 'string') {
      this._data = Array.from(data).map(ch => ch.charCodeAt(0))
    } else {
      this._data = [...data]
    }
    const n = this._data.length
    this._sa = []
    this._rank = []
    this._lcp = []

    if (n === 0) {
      this._sa = []
      this._rank = []
      this._lcp = []
      return
    }

    const indices: number[] = []
    for (let i = 0; i < n; i++) {
      indices.push(i)
    }

    indices.sort((a, b) => this.compareCircular(a, b))

    this._sa = indices

    this._rank = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      this._rank[this._sa[i]!] = i
    }

    this._lcp = new Array<number>(n).fill(0)
    for (let i = 1; i < n; i++) {
      this._lcp[i] = this.computeLcp(this._sa[i - 1]!, this._sa[i]!)
    }
  }

  private compareCircular(a: number, b: number): number {
    const n = this._data.length
    for (let k = 0; k < n; k++) {
      const ca = this._data[(a + k) % n]!
      const cb = this._data[(b + k) % n]!
      if (ca < cb) return -1
      if (ca > cb) return 1
    }
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  private computeLcp(a: number, b: number): number {
    const n = this._data.length
    let len = 0
    for (let k = 0; k < n; k++) {
      if (this._data[(a + k) % n] !== this._data[(b + k) % n]) break
      len++
    }
    return len
  }

  index(i: number): number {
    const n = this._data.length
    if (i < 0 || i >= n) {
      throw new RangeError(`Index ${i} out of bounds [0, ${n})`)
    }
    return this._sa[i]!
  }

  rank(pos: number): number {
    const n = this._data.length
    if (pos < 0 || pos >= n) {
      throw new RangeError(`Position ${pos} out of bounds [0, ${n})`)
    }
    return this._rank[pos]!
  }

  length(): number {
    return this._data.length
  }

  getData(): number[] {
    return [...this._data]
  }

  lcp(i: number): number {
    const n = this._data.length
    if (i < 0 || i >= n) {
      throw new RangeError(`Index ${i} out of bounds [0, ${n})`)
    }
    return this._lcp[i]!
  }

  bwt(): number[] {
    const n = this._data.length
    if (n === 0) return []
    const result: number[] = []
    for (let i = 0; i < n; i++) {
      result.push(this._data[(this._sa[i]! + n - 1) % n]!)
    }
    return result
  }

  originalIndex(): number {
    const n = this._data.length
    if (n === 0) {
      throw new Error('Cannot get original index of empty data')
    }
    return this._rank[0]!
  }

  inverse(): number[] {
    return [...this._rank]
  }

  select(c: number, k: number): number {
    const bwtArr = this.bwt()
    let count = 0
    for (let i = 0; i < bwtArr.length; i++) {
      if (bwtArr[i] === c) {
        if (count === k) return i
        count++
      }
    }
    throw new RangeError(`Character ${c} does not have ${k + 1} occurrence(s) in BWT`)
  }
}
