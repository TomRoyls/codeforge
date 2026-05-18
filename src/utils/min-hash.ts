export class MinHash {
  private _signature: number[]
  private readonly _numHashes: number
  private _a: number[]
  private _b: number[]
  private _hasData: boolean

  constructor(numHashes: number = 128, seed: number = 0) {
    if (numHashes < 1) {
      throw new RangeError(`numHashes must be >= 1, got ${numHashes}`)
    }
    this._numHashes = numHashes
    this._signature = new Array(numHashes).fill(Infinity)
    this._a = []
    this._b = []
    this._hasData = false

    const rng = this.createRng(seed)
    for (let i = 0; i < numHashes; i++) {
      this._a.push(rng())
      this._b.push(rng())
    }
  }

  private createRng(seed: number): () => number {
    let s = seed | 0
    return () => {
      s = (s + 0x6d2b79f5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0)
    }
  }

  private hash(str: string): [number, number] {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return [h1 >>> 0, h2 >>> 0]
  }

  add(element: string): void {
    const [h1, h2] = this.hash(element)
    this._hasData = true
    for (let i = 0; i < this._numHashes; i++) {
      const value = ((Math.imul(h1, this._a[i]!) + Math.imul(h2, this._b[i]!)) >>> 0)
      if (value < this._signature[i]!) {
        this._signature[i] = value
      }
    }
  }

  addBatch(elements: string[]): void {
    for (const el of elements) {
      this.add(el)
    }
  }

  similarity(other: MinHash): number {
    if (this._numHashes !== other._numHashes) {
      throw new Error('Cannot compare MinHash with different numHashes')
    }
    let equal = 0
    for (let i = 0; i < this._numHashes; i++) {
      if (this._signature[i] === other._signature[i]) {
        equal++
      }
    }
    return equal / this._numHashes
  }

  jaccardEstimate(): number {
    if (!this._hasData) return 0
    let sum = 0
    let count = 0
    for (let i = 0; i < this._numHashes; i++) {
      if (this._signature[i] !== Infinity) {
        sum += this._signature[i]!
        count++
      }
    }
    if (count === 0) return 0
    return sum / count / 4294967295
  }

  get signature(): number[] {
    return [...this._signature]
  }

  get numHashes(): number {
    return this._numHashes
  }

  get size(): number {
    if (!this._hasData) return 0
    const nonInf = this._signature.filter(v => v !== Infinity)
    if (nonInf.length === 0) return 0
    const avg = nonInf.reduce((s, v) => s + v, 0) / nonInf.length
    if (avg === 0) return 1
    return Math.max(1, Math.round(this._numHashes / (avg / 4294967295)))
  }

  clone(): MinHash {
    const copy = new MinHash(this._numHashes, 0)
    copy._signature = [...this._signature]
    copy._a = [...this._a]
    copy._b = [...this._b]
    copy._hasData = this._hasData
    return copy
  }

  merge(other: MinHash): void {
    if (this._numHashes !== other._numHashes) {
      throw new Error('Cannot merge MinHash with different numHashes')
    }
    for (let i = 0; i < this._numHashes; i++) {
      this._signature[i] = Math.min(this._signature[i]!, other._signature[i]!)
    }
    if (other._hasData) this._hasData = true
  }

  static estimateJaccard(
    a: Set<string>,
    b: Set<string>,
    numHashes: number = 128,
    seed: number = 0,
  ): number {
    const mhA = new MinHash(numHashes, seed)
    const mhB = new MinHash(numHashes, seed)
    a.forEach(el => mhA.add(el))
    b.forEach(el => mhB.add(el))
    return mhA.similarity(mhB)
  }
}
