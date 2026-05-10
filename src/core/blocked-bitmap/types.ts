export const DEFAULT_BLOCK_SIZE = 512

export interface BlockedBitmapOptions {
  blockSize?: number
}

export interface BlockedBitmapStats {
  totalBits: number
  storedBlocks: number
  totalBlocks: number
  blockSize: number
  bytesUsed: number
  setBits: number
}
