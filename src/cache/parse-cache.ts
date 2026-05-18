import { statSync } from 'node:fs'
import { type SourceFile } from 'ts-morph'

import { logger } from '../utils/logger.js'
import { LRUCache } from '../utils/lru-cache.js'

export interface CachedSourceFile {
  fileStats: { mtime: number; size: number }
  sourceFile: SourceFile
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
    this.cache = new LRUCache<string, CachedSourceFile>(options.maxSize ?? 100)
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    logger.debug('Parse cache cleared')
  }

  delete(filePath: string): boolean {
    return this.cache.delete(filePath)
  }

  get(filePath: string): SourceFile | undefined {
    const cached = this.cache.get(filePath)
    if (!cached) {
      this.misses++
      logger.debug(`Parse cache MISS for ${filePath}`)
      return undefined
    }

    try {
      const stats = statSync(filePath)
      const currentStats = { mtime: stats.mtimeMs, size: stats.size }

      if (
        cached.fileStats.mtime === currentStats.mtime &&
        cached.fileStats.size === currentStats.size
      ) {
        this.hits++
        logger.debug(`Parse cache HIT for ${filePath}`)
        return cached.sourceFile
      }

      this.misses++
      logger.debug(`Parse cache MISS (stale) for ${filePath}`)
      return undefined
    } catch {
      this.misses++
      logger.debug(`Parse cache MISS (stat error) for ${filePath}`)
      return undefined
    }
  }

  getStats(): { hitRate: number; hits: number; misses: number; size: number } {
    const total = this.hits + this.misses
    return {
      hitRate: total > 0 ? this.hits / total : 0,
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
    }
  }

  has(filePath: string): boolean {
    return this.cache.has(filePath)
  }

  set(filePath: string, sourceFile: SourceFile): void {
    try {
      const stats = statSync(filePath)
      this.cache.set(filePath, {
        fileStats: { mtime: stats.mtimeMs, size: stats.size },
        sourceFile,
        timestamp: Date.now(),
      })
      logger.debug(`Parse cache SET for ${filePath}`)
    } catch (error) {
      logger.debug(`Parse cache SET failed for ${filePath}: ${error}`)
    }
  }
}

export const globalParseCache = new ParseCache()
