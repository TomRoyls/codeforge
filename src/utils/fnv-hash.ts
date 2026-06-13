export class FNVHash {
  static compute32(data: string): number {
    let hash = 0x811C9DC5
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193)
    }
    return hash >>> 0
  }

  static compute64(data: string): bigint {
    let hash = 0xcbf29ce484222325n
    const prime = 0x100000001b3n
    for (let i = 0; i < data.length; i++) {
      hash ^= BigInt(data.charCodeAt(i))
      hash = (hash * prime) & 0xFFFFFFFFFFFFFFFFn
    }
    return hash
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): FNVHash { return new FNVHash() }
  equals(other: unknown): boolean { return other instanceof FNVHash }
}
