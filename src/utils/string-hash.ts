export class StringHash {
  private static readonly BASE = 131
  private static readonly MOD = 1_000_000_007n

  private prefix: bigint[]
  private pow: bigint[]

  constructor(s: string) {
    const n = s.length
    this.prefix = new Array(n + 1).fill(0n)
    this.pow = new Array(n + 1).fill(1n)
    for (let i = 0; i < n; i++) {
      this.pow[i + 1] = (this.pow[i]! * BigInt(StringHash.BASE)) % StringHash.MOD
      this.prefix[i + 1] = (this.prefix[i]! * BigInt(StringHash.BASE) + BigInt(s.charCodeAt(i))) % StringHash.MOD
    }
  }

  hash(l: number, r: number): bigint {
    const h = (this.prefix[r + 1]! - this.prefix[l]! * this.pow[r - l + 1]!) % StringHash.MOD
    return h < 0n ? h + StringHash.MOD : h
  }

  equals(l1: number, r1: number, l2: number, r2: number): boolean {
    if (r1 - l1 !== r2 - l2) return false
    return this.hash(l1, r1) === this.hash(l2, r2)
  }
}
