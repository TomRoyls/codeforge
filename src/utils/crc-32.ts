export class CRC32 {
  private static table: Uint32Array | null = null

  private static getTable(): Uint32Array {
    if (CRC32.table) return CRC32.table
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let crc = i
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? 0xEDB88320 ^ (crc >>> 1) : crc >>> 1
      }
      table[i] = crc >>> 0
    }
    CRC32.table = table
    return table
  }

  static compute(data: string): number {
    const table = CRC32.getTable()
    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data.charCodeAt(i)) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): CRC32 { return new CRC32() }
  equals(other: unknown): boolean { return other instanceof CRC32 }
}
