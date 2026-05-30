export class ZobristHashing<T extends string | number> {
  private readonly table: Map<string, number>
  private readonly positions: number
  private readonly pieces: number

  constructor(options?: { positions?: number; pieces?: number; seed?: number }) {
    this.positions = options?.positions ?? 64
    this.pieces = options?.pieces ?? 12
    this.table = new Map()
    let seed = options?.seed ?? 42
    for (let pos = 0; pos < this.positions; pos++) {
      for (let piece = 0; piece < this.pieces; piece++) {
        seed = this.nextRandom(seed)
        this.table.set(`${pos}:${piece}`, seed)
      }
    }
  }

  hash(state: Map<T, number>): number {
    let h = 0
    for (const [key, pieceId] of state) {
      const pos = typeof key === 'number' ? key : this.stringToPosition(key)
      const tableKey = `${pos}:${pieceId}`
      const val = this.table.get(tableKey)
      if (val !== undefined) h ^= val
    }
    return h >>> 0
  }

  addToHash(currentHash: number, position: number, pieceId: number): number {
    const val = this.table.get(`${position}:${pieceId}`)
    return ((currentHash ^ (val ?? 0)) >>> 0)
  }

  removeFromHash(currentHash: number, position: number, pieceId: number): number {
    return this.addToHash(currentHash, position, pieceId)
  }

  movePiece(currentHash: number, fromPos: number, toPos: number, pieceId: number): number {
    let h = this.addToHash(currentHash, fromPos, pieceId)
    h = this.addToHash(h, toPos, pieceId)
    return h
  }

  getTableEntry(position: number, pieceId: number): number {
    return this.table.get(`${position}:${pieceId}`) ?? 0
  }

  get tableSize(): number {
    return this.table.size
  }

  private nextRandom(seed: number): number {
    seed = ((seed + 0x6D2B79F5) | 0)
    seed = Math.imul(seed ^ (seed >>> 15), seed | 1)
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61)
    return ((seed ^ (seed >>> 14)) >>> 0)
  }

  private stringToPosition(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0
    }
    return Math.abs(h) % this.positions
  }
}
