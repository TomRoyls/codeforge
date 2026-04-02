import { type SourceFile } from 'ts-morph'
import { LRUCache } from '../utils/lru-cache.js'
import { logger } from '../utils/logger.js'

export interface CachedSourceFile {
  sourceFile: SourceFile
  contentHash: string
  timestamp: number
}

export interface ParseCacheOptions {
  maxSize?: number
}

export class ParseCache {
  private cache: LRUCache<string, CachedSourceFile>
  private hits: number = 0
  private misses: number = 0

  constructor(options: ParseCacheOptions = {}) {
    this.cache = new LRUCache<string, CachedSourceFile>({
      maxSize: options.maxSize ?? 100,
    })
  }

  get(filePath: string, contentHash: string): SourceFile | undefined {
    const cached = this.cache.get(filePath)

    if (cached && cached.contentHash === contentHash) {
      this.hits++
      logger.debug(`Parse cache HIT for ${filePath}`)
      return cached.sourceFile
    }

    this.misses++
    logger.debug(`Parse cache MISS for ${filePath}`)
    return undefined
  }

  set(filePath: string, sourceFile: SourceFile, contentHash: string): void {
    this.cache.set(filePath, {
      sourceFile,
      contentHash,
      timestamp: Date.now(),
    })
    logger.debug(`Parse cache SET for ${filePath}`)
  }

  has(filePath: string): boolean {
    return this.cache.has(filePath)
  }

  delete(filePath: string): boolean {
    return this.cache.delete(filePath)
  }

  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    logger.debug('Parse cache cleared')
  }

  get size(): number {
    return this.cache.size
  }

  getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.cache.size,
    }
  }
}

export const globalParseCache = new ParseCache()
