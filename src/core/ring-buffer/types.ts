export interface RingBufferOptions {
  capacity: number
  overwrite: boolean
}

export interface RingBufferStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  totalWritten: number
  totalRead: number
  overwriteCount: number
}

export const DEFAULT_RING_BUFFER_OPTIONS: RingBufferOptions = {
  capacity: 64,
  overwrite: true,
}
