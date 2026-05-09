export const DEFAULT_CHUNK_SIZE = 64

export interface ChunkedListOptions {
  chunkSize: number
}

export interface ChunkedListStats {
  totalChunks: number
  utilizedChunks: number
  utilizationRatio: number
}
