import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { logger } from '../utils/logger.js'

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => {
      stream.destroy()
      resolve(hash.digest('hex'))
    })
    stream.on('error', (err) => {
      stream.destroy()
      reject(err)
    })
  })
}

export interface CacheEntry<T = unknown> {
  key: string
  timestamp: number
  ttl?: number
  value: T
}

export class CacheStore {
  private cacheDir: string

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir
  }

  async clear(): Promise<void> {
    try {
      const files = await readdir(this.cacheDir)
      await Promise.all(files.map((file) => unlink(path.join(this.cacheDir, file))))
    } catch (error) {
      logger.debug('Failed to clear cache:', error)
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(key)
      await unlink(filePath)
      return true
    } catch (error) {
      logger.debug(`Cache delete failed for key "${key}":`, error)
      return false
    }
  }

  async get<T>(key: string): Promise<null | T> {
    try {
      const filePath = this.getCacheFilePath(key)
      const content = await readFile(filePath, 'utf8')
      // JSON.parse may throw for corrupted cache data - returning null is expected for cache misses
      const entry: CacheEntry<T> = JSON.parse(content)

      if (entry.ttl && Date.now() > entry.timestamp + entry.ttl) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch (error) {
      logger.debug(`Cache get failed for key "${key}":`, error)
      return null
    }
  }

  async getStats(): Promise<{ entries: number; size: number }> {
    try {
      const files = await readdir(this.cacheDir)
      const statsArray = await Promise.all(
        files.map((file) => stat(path.join(this.cacheDir, file))),
      )
      const totalSize = statsArray.reduce((sum, stats) => sum + stats.size, 0)

      return { entries: files.length, size: totalSize }
    } catch (error) {
      logger.debug('Failed to get cache stats:', error)
      return { entries: 0, size: 0 }
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(key)
      const stats = await stat(filePath)
      return stats.isFile()
    } catch (error) {
      logger.debug(`Cache check failed for key "${key}":`, error)
      return false
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureCacheDir()

    const entry: CacheEntry<T> = {
      key,
      timestamp: Date.now(),
      ttl,
      value,
    }

    const filePath = this.getCacheFilePath(key)
    await writeFile(filePath, JSON.stringify(entry))
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true })
    } catch (error) {
      logger.debug(`Failed to ensure cache directory "${this.cacheDir}":`, error)
    }
  }

  private getCacheFilePath(key: string): string {
    const safeKey = createHash('md5').update(key).digest('hex')
    return path.join(this.cacheDir, `${safeKey}.json`)
  }
}

export enum InvalidationStrategy {
  ContentBased = 'content-based',
  TimeBased = 'time-based',
  VersionBased = 'version-based',
}

export class InvalidationManager {
  private cacheStore: CacheStore
  private packageVersion: string

  constructor(cacheStore: CacheStore, packageVersion: string) {
    this.cacheStore = cacheStore
    this.packageVersion = packageVersion
  }

  async invalidateOnContentChange(filePath: string, cachedHash: string): Promise<boolean> {
    const currentHash = await hashFile(filePath)
    return currentHash !== cachedHash
  }

  invalidateOnVersionChange(packageVersion: string): boolean {
    return packageVersion !== this.packageVersion
  }

  async shouldInvalidate(key: string, strategy: InvalidationStrategy): Promise<boolean> {
    switch (strategy) {
      case InvalidationStrategy.ContentBased: {
        return this.checkContentBased(key)
      }

      case InvalidationStrategy.TimeBased: {
        return this.checkTimeBased(key)
      }

      case InvalidationStrategy.VersionBased: {
        return this.checkVersionBased()
      }

      default: {
        return false
      }
    }
  }

  private async checkContentBased(_key: string): Promise<boolean> {
    // Content-based invalidation requires file hash comparison
    // This is handled by invalidateOnContentChange
    return false
  }

  private async checkTimeBased(key: string): Promise<boolean> {
    const entry = await this.cacheStore.get<{ timestamp: number; ttl: number }>(key)
    if (!entry) return true

    return Date.now() > entry.timestamp + entry.ttl
  }

  private checkVersionBased(): boolean {
    // Version comparison is handled by invalidateOnVersionChange
    return false
  }
}

const DEFAULT_CACHE_DIR = path.join(process.cwd(), '.codeforge', 'cache')

export function createDefaultCache(): CacheStore {
  return new CacheStore(DEFAULT_CACHE_DIR)
}

export function createDefaultInvalidationManager(
  cacheStore: CacheStore,
  version: string,
): InvalidationManager {
  return new InvalidationManager(cacheStore, version)
}

export { ASTCache, createDefaultASTCache } from './ast-cache.js'
export type { ASTCacheOptions, ASTCacheStats, CachedASTEntry } from './ast-cache.js'
export { createDefaultResultCache, ResultCache } from './result-cache.js'
export type { CachedResultEntry, ResultCacheOptions, ResultCacheStats } from './result-cache.js'
