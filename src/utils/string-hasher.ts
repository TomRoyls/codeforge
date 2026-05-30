export class StringHasher {
  private readonly prefixHash: bigint[]
  private readonly power: bigint[]
  private readonly base: bigint
  private readonly mod: bigint
  private readonly n: number

  constructor(s: string, base: number = 31, mod: number = 1_000_000_007) {
    this.base = BigInt(base)
    this.mod = BigInt(mod)
    this.n = s.length
    this.prefixHash = new Array<bigint>(this.n + 1)
    this.power = new Array<bigint>(this.n + 1)
    this.prefixHash[0] = 0n
    this.power[0] = 1n
    for (let i = 0; i < this.n; i++) {
      const charVal = BigInt(s.charCodeAt(i))
      this.prefixHash[i + 1] = (this.prefixHash[i]! * this.base + charVal) % this.mod
      this.power[i + 1] = (this.power[i]! * this.base) % this.mod
    }
  }

  hash(l: number, r: number): number {
    if (l < 0 || r > this.n || l >= r) throw new RangeError('invalid range')
    const h = (this.prefixHash[r]! - (this.prefixHash[l]! * this.power[r - l]!) % this.mod + this.mod) % this.mod
    return Number(h)
  }

  hashFull(): number {
    if (this.n === 0) return 0
    return this.hash(0, this.n)
  }

  equals(l1: number, r1: number, l2: number, r2: number): boolean {
    if (r1 - l1 !== r2 - l2) return false
    return this.hash(l1, r1) === this.hash(l2, r2)
  }

  get length(): number {
    return this.n
  }

  static hashString(s: string, base: number = 31, mod: number = 1_000_000_007): number {
    const hasher = new StringHasher(s, base, mod)
    return hasher.hashFull()
  }
}
