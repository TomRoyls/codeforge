import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { FileReaderOptions, CachedFile, FileReaderStats } from './types.js'
import { DEFAULT_FILE_READER_OPTIONS } from './types.js'
import { globToRegex } from '../../utils/glob.js'

export class CachedFileReader {
  private cache: Map<string, CachedFile> = new Map()
  private options: FileReaderOptions
  private statsData: FileReaderStats

  constructor(options?: Partial<FileReaderOptions>) {
    this.options = { ...DEFAULT_FILE_READER_OPTIONS, ...options }
    this.statsData = {
      totalReads: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      hitRate: 0,
      totalBytesRead: 0,
      cachedFiles: 0,
      cacheMemoryUsage: 0,
    }
  }

  async readFile(filePath: string): Promise<string> {
    const normalized = path.resolve(filePath)

    if (this.options.stats) {
      this.statsData.totalReads++
    }

    const cached = this.cache.get(normalized)
    if (cached) {
      const stat = await fs.stat(normalized)
      if (stat.mtimeMs === cached.lastModified) {
        cached.readAt = Date.now()
        cached.hitCount++
        if (this.options.stats) {
          this.statsData.cacheHits++
          this.statsData.hitRate = this.statsData.cacheHits / this.statsData.totalReads
        }
        return cached.content
      }
      this.cache.delete(normalized)
    }

    const content = await fs.readFile(normalized, this.options.encoding)
    const stat = await fs.stat(normalized)
    const size = stat.size

    if (this.options.stats) {
      this.statsData.cacheMisses++
      this.statsData.totalBytesRead += size
      this.statsData.hitRate = this.statsData.cacheHits / this.statsData.totalReads
    }

    if (this.options.maxCacheSize > 0 && size <= this.options.maxFileSize) {
      if (this.cache.size >= this.options.maxCacheSize) {
        this.evict(1)
      }

      const entry: CachedFile = {
        path: normalized,
        content,
        size,
        lastModified: stat.mtimeMs,
        readAt: Date.now(),
        hitCount: 0,
      }
      this.cache.set(normalized, entry)
      this.updateCacheStats()
    }

    return content
  }

  async readFiles(filePaths: string[]): Promise<Map<string, string>> {
    const results = await Promise.all(
      filePaths.map(async (fp) => {
        const content = await this.readFile(fp)
        return [fp, content] as const
      })
    )
    const map = new Map<string, string>()
    for (const [fp, content] of results) {
      map.set(fp, content)
    }
    return map
  }

  isCached(filePath: string): boolean {
    return this.cache.has(path.resolve(filePath))
  }

  getCachedFile(filePath: string): CachedFile | null {
    return this.cache.get(path.resolve(filePath)) ?? null
  }

  invalidate(filePath: string): boolean {
    return this.cache.delete(path.resolve(filePath))
  }

  invalidatePattern(pattern: string): number {
    const regex = globToRegex(pattern)
    let count = 0
    for (const key of [...this.cache.keys()]) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    this.updateCacheStats()
    return count
  }

  async preload(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map((fp) => this.readFile(fp)))
  }

  getStats(): FileReaderStats {
    return { ...this.statsData }
  }

  getCachedPaths(): string[] {
    return [...this.cache.keys()]
  }

  clear(): void {
    this.cache.clear()
    this.updateCacheStats()
  }

  getCacheSize(): number {
    return this.cache.size
  }

  private evict(count: number): number {
    const entries = [...this.cache.entries()].sort(
      (a, b) => a[1].readAt - b[1].readAt
    )
    let evicted = 0
    for (let i = 0; i < count && i < entries.length; i++) {
      const entry = entries[i]
      if (entry) {
        this.cache.delete(entry[0])
        evicted++
      }
    }
    if (this.options.stats) {
      this.statsData.evictions += evicted
    }
    this.updateCacheStats()
    return evicted
  }

  private updateCacheStats(): void {
    if (this.options.stats) {
      this.statsData.cachedFiles = this.cache.size
      this.statsData.cacheMemoryUsage = [...this.cache.values()].reduce(
        (sum, e) => sum + e.size,
        0
      )
    }
  }

}
