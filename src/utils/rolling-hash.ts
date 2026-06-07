export class RollingHash {
  private hash = 0
  private readonly base: number
  private readonly mod: number
  private readonly power: number[]
  private readonly window: number[]
  private idx = 0
  private filled = false

  constructor(
    windowSize: number,
    base = 257,
    mod = 1_000_000_007,
  ) {
    this.base = base
    this.mod = mod
    this.window = new Array<number>(windowSize)
    this.power = new Array<number>(windowSize + 1)
    this.power[0] = 1
    for (let i = 1; i <= windowSize; i++) {
      this.power[i] = (this.power[i - 1]! * this.base) % this.mod
    }
  }

  push(byte: number): number {
    const n = this.window.length

    if (this.filled) {
      const oldByte = this.window[this.idx]!
      const oldContrib = (oldByte * this.power[n - 1]!) % this.mod
      this.hash = ((this.hash - oldContrib + this.mod) * this.base + byte) % this.mod
    } else {
      const count = this.idx
      this.hash = (this.hash * this.base + byte) % this.mod
      if (count + 1 === n) {
        this.filled = true
      }
    }

    this.window[this.idx] = byte
    this.idx = (this.idx + 1) % n

    return this.hash
  }

  get isFull(): boolean {
    return this.filled
  }

  get currentHash(): number {
    return this.hash
  }

  get windowSize(): number {
    return this.window.length
  }

  reset(): void {
    this.hash = 0
    this.idx = 0
    this.filled = false
    this.window.fill(0)
  }

  static hashString(str: string, base = 257, mod = 1_000_000_007): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * base + str.charCodeAt(i)) % mod
    }
    return hash
  }

  static hashBytes(bytes: Uint8Array, base = 257, mod = 1_000_000_007): number {
    let hash = 0
    for (let i = 0; i < bytes.length; i++) {
      hash = (hash * base + bytes[i]!) % mod
    }
    return hash
  }

  toString(): string {
    return `RollingHash(hash=${this.hash}, windowSize=${this.window.length}, base=${this.base}, mod=${this.mod})`
  }

  toJSON(): unknown {
    return { hash: this.hash, windowSize: this.window.length, base: this.base, mod: this.mod, isFull: this.filled }
  }

  clone(): RollingHash {
    const copy = new RollingHash(this.window.length, this.base, this.mod)
    copy.hash = this.hash
    copy.idx = this.idx
    copy.filled = this.filled
    for (let i = 0; i < this.window.length; i++) {
      copy.window[i] = this.window[i]!
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RollingHash)) return false
    if (this.base !== other.base) return false
    if (this.mod !== other.mod) return false
    if (this.window.length !== other.window.length) return false
    if (this.hash !== other.hash) return false
    if (this.idx !== other.idx) return false
    if (this.filled !== other.filled) return false
    for (let i = 0; i < this.window.length; i++) {
      if (this.window[i] !== other.window[i]) return false
    }
    return true
  }
}
