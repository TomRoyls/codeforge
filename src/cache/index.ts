import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, readFileSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile, unlink, readdir } from 'node:fs/promises'
import path from 'node:path'

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

export function hashFileSync(filePath: string): string {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

export function hashObject(obj: unknown): string {
  const content = JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort())
  return hashContent(content)
}

export function generateRandomHash(): string {
  return randomUUID().replace(/-/g, '')
}

export interface CacheEntry<T = unknown> {
  key: string
  value: T
  timestamp: number
  ttl?: number
}

export class CacheStore {
  private cacheDir: string

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = this.getCacheFilePath(key)
      const content = await readFile(filePath, 'utf-8')
      const entry: CacheEntry<T> = JSON.parse(content)

      if (entry.ttl && Date.now() > entry.timestamp + entry.ttl) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureCacheDir()

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    }

    const filePath = this.getCacheFilePath(key)
    await writeFile(filePath, JSON.stringify(entry))
  }

  async has(key: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(key)
      const stats = statSync(filePath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(key)
      await unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await readdir(this.cacheDir)
      await Promise.all(files.map((file) => unlink(path.join(this.cacheDir, file))))
    } catch {
      // Directory doesn't exist
    }
  }

  async getStats(): Promise<{ entries: number; size: number }> {
    try {
      const files = await readdir(this.cacheDir)
      let totalSize = 0

      for (const file of files) {
        const stats = statSync(path.join(this.cacheDir, file))
        totalSize += stats.size
      }

      return { entries: files.length, size: totalSize }
    } catch {
      return { entries: 0, size: 0 }
    }
  }

  private getCacheFilePath(key: string): string {
    const safeKey = createHash('md5').update(key).digest('hex')
    return path.join(this.cacheDir, `${safeKey}.json`)
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true })
    } catch {
      // Directory exists
    }
  }
}

export enum InvalidationStrategy {
  TimeBased = 'time-based',
  ContentBased = 'content-based',
  VersionBased = 'version-based',
}

export class InvalidationManager {
  private cacheStore: CacheStore
  private packageVersion: string

  constructor(cacheStore: CacheStore, packageVersion: string) {
    this.cacheStore = cacheStore
    this.packageVersion = packageVersion
  }

  async shouldInvalidate(key: string, strategy: InvalidationStrategy): Promise<boolean> {
    switch (strategy) {
      case InvalidationStrategy.TimeBased:
        return this.checkTimeBased(key)
      case InvalidationStrategy.ContentBased:
        return this.checkContentBased(key)
      case InvalidationStrategy.VersionBased:
        return this.checkVersionBased()
      default:
        return false
    }
  }

  async invalidateOnContentChange(filePath: string, cachedHash: string): Promise<boolean> {
    const currentHash = await hashFile(filePath)
    return currentHash !== cachedHash
  }

  invalidateOnVersionChange(packageVersion: string): boolean {
    return packageVersion !== this.packageVersion
  }

  private async checkTimeBased(key: string): Promise<boolean> {
    const entry = await this.cacheStore.get<{ timestamp: number; ttl: number }>(key)
    if (!entry) return true

    return Date.now() > entry.timestamp + entry.ttl
  }

  private async checkContentBased(_key: string): Promise<boolean> {
    // Content-based invalidation requires file hash comparison
    // This is handled by invalidateOnContentChange
    return false
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
