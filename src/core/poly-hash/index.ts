import type { ForEachCallback, PolyHashOptions } from './types.js'

export class PolyHash {
  private str: string
  private prefixHashes: number[]
  private powers: number[]
  private _base: number
  private _mod: number
  private invBase: number

  constructor(str: string, options?: PolyHashOptions) {
    this._base = options?.base ?? 31
    this._mod = options?.mod ?? 1_000_000_007
    this.str = str
    this.invBase = this.modInverse(this._base, this._mod)
    this.prefixHashes = [0]
    this.powers = [1]
    this.buildPrefixHashes()
  }

  private buildPrefixHashes(): void {
    this.prefixHashes = [0]
    this.powers = [1]
    for (let i = 0; i < this.str.length; i++) {
      const code = this.str.charCodeAt(i)
      this.prefixHashes.push(
        (this.prefixHashes[i]! * this._base + code) % this._mod,
      )
      this.powers.push((this.powers[i]! * this._base) % this._mod)
    }
  }

  private modInverse(a: number, m: number): number {
    let oldR = a
    let r = m
    let oldS = 1
    let s = 0
    while (r !== 0) {
      const q = Math.floor(oldR / r)
      const temp = r
      r = oldR - q * r
      oldR = temp
      const tempS = s
      s = oldS - q * s
      oldS = tempS
    }
    return ((oldS % m) + m) % m
  }

  private mulMod(a: number, b: number, m: number): number {
    return Number((BigInt(a) * BigInt(b)) % BigInt(m))
  }

  private modPow(base: number, exp: number, mod: number): number {
    let result = 1
    let b = ((base % mod) + mod) % mod
    let e = exp
    while (e > 0) {
      if (e & 1) result = this.mulMod(result, b, mod)
      e >>= 1
      b = this.mulMod(b, b, mod)
    }
    return result
  }

  get size(): number {
    return this.str.length
  }

  get isEmpty(): boolean {
    return this.str.length === 0
  }

  get base(): number {
    return this._base
  }

  get mod(): number {
    return this._mod
  }

  hash(): number {
    return this.prefixHashes[this.str.length] ?? 0
  }

  hashRange(l: number, r: number): number {
    if (l < 0 || r < 0 || l > r || r > this.str.length) {
      throw new RangeError(
        `Range [${l}, ${r}) out of bounds [0, ${this.str.length})`,
      )
    }
    const result =
      (this.prefixHashes[r]! -
        this.mulMod(this.prefixHashes[l]!, this.powers[r - l]!, this._mod) +
        this._mod) %
      this._mod
    return result
  }

  hashPrefix(n: number): number {
    if (n < 0 || n > this.str.length) {
      throw new RangeError(
        `n must be in [0, ${this.str.length}], got ${n}`,
      )
    }
    return this.prefixHashes[n]!
  }

  append(char: string): void {
    if (char.length !== 1) {
      throw new RangeError('append expects a single character')
    }
    this.str += char
    const code = char.charCodeAt(0)
    const lastPrefix = this.prefixHashes[this.prefixHashes.length - 1]!
    this.prefixHashes.push(
      (lastPrefix * this._base + code) % this._mod,
    )
    const lastPower = this.powers[this.powers.length - 1]!
    this.powers.push((lastPower * this._base) % this._mod)
  }

  pushFront(char: string): void {
    if (char.length !== 1) {
      throw new RangeError('pushFront expects a single character')
    }
    this.str = char + this.str
    this.buildPrefixHashes()
  }

  popBack(): string | undefined {
    if (this.str.length === 0) return undefined
    const char = this.str[this.str.length - 1]!
    this.str = this.str.slice(0, -1)
    this.prefixHashes.pop()
    this.powers.pop()
    return char
  }

  toString(): string {
    return this.str
  }

  toArray(): number[] {
    return this.prefixHashes.slice(1)
  }

  clone(): PolyHash {
    return new PolyHash(this.str, { base: this._base, mod: this._mod })
  }

  static fromString(str: string, options?: PolyHashOptions): PolyHash {
    return new PolyHash(str, options)
  }

  clear(): void {
    this.str = ''
    this.prefixHashes = [0]
    this.powers = [1]
  }

  forEach(callback: ForEachCallback): void {
    for (let i = 0; i < this.str.length; i++) {
      callback(this.str[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<string> {
    for (let i = 0; i < this.str.length; i++) {
      yield this.str[i]!
    }
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.str.length) {
      throw new RangeError(
        `Index ${index} out of bounds [0, ${this.str.length})`,
      )
    }
    return this.str[index]!
  }

  substring(start: number, end?: number): string {
    const e = end ?? this.str.length
    if (start < 0 || e > this.str.length || start > e) {
      throw new RangeError(
        `Invalid substring range [${start}, ${e})`,
      )
    }
    return this.str.slice(start, e)
  }

  equals(other: PolyHash): boolean {
    return this.hash() === other.hash() && this.size === other.size
  }

  power(n: number): number {
    if (n < 0) {
      throw new RangeError('power expects non-negative exponent')
    }
    if (n < this.powers.length) return this.powers[n]!
    return this.modPow(this._base, n, this._mod)
  }

  inversePower(n: number): number {
    if (n < 0) {
      throw new RangeError('inversePower expects non-negative exponent')
    }
    return this.modPow(this.invBase, n, this._mod)
  }

  static doubleHash(
    str: string,
    options?: PolyHashOptions,
  ): { hash1: number; hash2: number } {
    const base1 = options?.base ?? 31
    const mod = options?.mod ?? 1_000_000_007
    const base2 = base1 === 31 ? 37 : 31
    const h1 = new PolyHash(str, { base: base1, mod })
    const h2 = new PolyHash(str, { base: base2, mod })
    return { hash1: h1.hash(), hash2: h2.hash() }
  }

  toJSON() {
    return { type: 'PolyHash', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'PolyHash'
  }
}
