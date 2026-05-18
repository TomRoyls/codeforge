export class SuffixArray {
  private _text: string
  private _indices: number[]
  private _lcpArray: number[]

  constructor(text: string) {
    this._text = text
    this._indices = []
    this._lcpArray = []
    this.buildSuffixArray()
    this.buildLCPArray()
  }

  get text(): string {
    return this._text
  }

  get length(): number {
    return this._text.length
  }

  index(i: number): number {
    if (i < 0 || i >= this._indices.length) {
      throw new RangeError(`Index ${i} out of bounds [0, ${this._indices.length})`)
    }
    return this._indices[i]!
  }

  lcp(i: number): number {
    if (i < 0 || i >= this._lcpArray.length) {
      throw new RangeError(`Index ${i} out of bounds [0, ${this._lcpArray.length})`)
    }
    return this._lcpArray[i]!
  }

  search(pattern: string): number[] {
    if (pattern.length === 0) return []
    if (this._text.length === 0) return []

    const results: number[] = []
    let lo = 0
    let hi = this._indices.length - 1

    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const suffixStart = this._indices[mid]!
      const cmp = this.compareAt(suffixStart, pattern)
      if (cmp < 0) {
        lo = mid + 1
      } else if (cmp > 0) {
        hi = mid - 1
      } else {
        results.push(suffixStart)
        let left = mid - 1
        while (left >= 0 && this.startsWith(this._indices[left]!, pattern)) {
          results.push(this._indices[left]!)
          left--
        }
        let right = mid + 1
        while (right < this._indices.length && this.startsWith(this._indices[right]!, pattern)) {
          results.push(this._indices[right]!)
          right++
        }
        return results.sort((a, b) => a - b)
      }
    }

    return results
  }

  contains(pattern: string): boolean {
    return this.search(pattern).length > 0
  }

  longestRepeatedSubstring(): string {
    if (this._lcpArray.length === 0) return ''

    let maxLcp = 0
    let maxIndex = 0
    for (let i = 0; i < this._lcpArray.length; i++) {
      if (this._lcpArray[i]! > maxLcp) {
        maxLcp = this._lcpArray[i]!
        maxIndex = i
      }
    }

    if (maxLcp === 0) return ''
    return this._text.substring(this._indices[maxIndex]!, this._indices[maxIndex]! + maxLcp)
  }

  toArray(): number[] {
    return [...this._indices]
  }

  private buildSuffixArray(): void {
    const n = this._text.length
    this._indices = []
    for (let i = 0; i < n; i++) {
      this._indices.push(i)
    }
    this._indices.sort((a, b) => {
      const sa = this._text.substring(a)
      const sb = this._text.substring(b)
      return sa < sb ? -1 : sa > sb ? 1 : 0
    })
  }

  private buildLCPArray(): void {
    const n = this._indices.length
    this._lcpArray = new Array(n).fill(0) as number[]

    for (let i = 1; i < n; i++) {
      const prev = this._indices[i - 1]!
      const curr = this._indices[i]!
      let len = 0
      while (
        prev + len < this._text.length &&
        curr + len < this._text.length &&
        this._text[prev + len] === this._text[curr + len]
      ) {
        len++
      }
      this._lcpArray[i] = len
    }
  }

  private compareAt(suffixStart: number, pattern: string): number {
    for (let i = 0; i < pattern.length; i++) {
      const textIdx = suffixStart + i
      if (textIdx >= this._text.length) return -1
      const tc = this._text[textIdx]!
      const pc = pattern[i]!
      if (tc < pc) return -1
      if (tc > pc) return 1
    }
    return 0
  }

  private startsWith(suffixStart: number, pattern: string): boolean {
    if (suffixStart + pattern.length > this._text.length) return false
    for (let i = 0; i < pattern.length; i++) {
      if (this._text[suffixStart + i] !== pattern[i]) return false
    }
    return true
  }
}
