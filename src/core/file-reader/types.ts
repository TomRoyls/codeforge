export interface FileReaderOptions {
  maxCacheSize: number
  maxFileSize: number
  readAheadSize: number
  encoding: BufferEncoding
  stats: boolean
}

export const DEFAULT_FILE_READER_OPTIONS: FileReaderOptions = {
  maxCacheSize: 1000,
  maxFileSize: 1024 * 1024,
  readAheadSize: 64 * 1024,
  encoding: 'utf-8',
  stats: true,
}

export interface CachedFile {
  path: string
  content: string
  size: number
  lastModified: number
  readAt: number
  hitCount: number
}

export interface FileReaderStats {
  totalReads: number
  cacheHits: number
  cacheMisses: number
  evictions: number
  hitRate: number
  totalBytesRead: number
  cachedFiles: number
  cacheMemoryUsage: number
}
