import { Project, type SourceFile } from 'ts-morph'
import pLimit from 'p-limit'

import { readFile } from 'node:fs/promises'

import { globalParseCache } from '../cache/parse-cache.js'
import { ASTCache } from '../cache/ast-cache.js'
import { hashContent } from '../cache/index.js'
import { logger } from '../utils/logger.js'

export interface ParseResult {
  sourceFile: SourceFile
  filePath: string
  parseTime: number
  cached: boolean
  diskCached?: boolean
}

export interface ParserOptions {
  tsConfigFilePath?: string
  skipFileDependencyResolution?: boolean
  concurrency?: number
  /** Enable persistent disk-based AST cache */
  useDiskCache?: boolean
  /** CodeForge version for cache invalidation */
  version?: string
}

export class Parser {
  private project: Project | null = null
  private options: ParserOptions
  private concurrency: number
  private astCache: ASTCache | null = null

  constructor(options: ParserOptions = {}) {
    this.options = options
    this.concurrency = options.concurrency ?? 4
  }

  async initialize(): Promise<void> {
    this.project = new Project({
      tsConfigFilePath: this.options.tsConfigFilePath,
      skipFileDependencyResolution: this.options.skipFileDependencyResolution ?? true,
      skipAddingFilesFromTsConfig: this.options.tsConfigFilePath ? false : true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
    })

    if (this.options.useDiskCache) {
      this.astCache = new ASTCache(this.project, {
        version: this.options.version,
      })
    }
  }

  async parseFile(filePath: string): Promise<ParseResult> {
    if (!this.project) {
      await this.initialize()
    }

    const startTime = performance.now()

    // Check in-memory cache first (fastest)
    const cachedSourceFile = globalParseCache.get(filePath)
    if (cachedSourceFile) {
      const parseTime = performance.now() - startTime
      logger.debug(`In-memory cache HIT for ${filePath}`)
      return {
        cached: true,
        diskCached: false,
        filePath,
        parseTime,
        sourceFile: cachedSourceFile,
      }
    }

    // Check disk cache if enabled
    if (this.astCache) {
      const content = await readFile(filePath, 'utf-8')
      const contentHash = hashContent(content)

      const diskCached = await this.astCache.get(filePath, contentHash)
      if (diskCached) {
        // Also cache in memory for faster subsequent access
        globalParseCache.set(filePath, diskCached)

        const parseTime = performance.now() - startTime
        logger.debug(`Disk cache HIT for ${filePath}`)
        return {
          cached: true,
          diskCached: true,
          filePath,
          parseTime,
          sourceFile: diskCached,
        }
      }

      // Cache miss - parse and store in both caches
      logger.debug(`Cache MISS for ${filePath}`)
      const sourceFile = this.project!.addSourceFileAtPath(filePath)

      // Store in disk cache
      await this.astCache.set(filePath, contentHash, sourceFile)

      // Store in memory cache
      globalParseCache.set(filePath, sourceFile)

      const parseTime = performance.now() - startTime

      return {
        cached: false,
        diskCached: false,
        filePath,
        parseTime,
        sourceFile,
      }
    }

    // No disk cache - just use in-memory cache
    logger.debug(`Cache MISS for ${filePath}`)
    const sourceFile = this.project!.addSourceFileAtPath(filePath)

    globalParseCache.set(filePath, sourceFile)

    const parseTime = performance.now() - startTime

    return {
      cached: false,
      diskCached: false,
      filePath,
      parseTime,
      sourceFile,
    }
  }

  async parseFiles(filePaths: string[]): Promise<ParseResult[]> {
    if (!this.project) {
      await this.initialize()
    }

    const limit = pLimit(this.concurrency)

    const results = await Promise.all(
      filePaths.map((filePath) =>
        limit(async () => {
          try {
            const result = await this.parseFile(filePath)
            return result
          } catch (error) {
            logger.error(`Failed to parse ${filePath}: ${(error as Error).message}`)
            return null
          }
        }),
      ),
    )

    return results.filter((result): result is ParseResult => result !== null)
  }

  getProject(): Project | null {
    return this.project
  }

  getASTCache(): ASTCache | null {
    return this.astCache
  }

  async getCacheStats(): Promise<{
    memory: { hits: number; misses: number; hitRate: number }
    disk: { entries: number; size: number; hitRate: number } | null
  }> {
    const memoryStats = globalParseCache.getStats()
    const diskStats = this.astCache ? await this.astCache.getStats() : null

    return {
      memory: memoryStats,
      disk: diskStats,
    }
  }

  async clearCache(): Promise<void> {
    globalParseCache.clear()
    if (this.astCache) {
      await this.astCache.clear()
    }
  }

  releaseFile(filePath: string): void {
    globalParseCache.delete(filePath)
  }

  dispose(): void {
    if (this.project) {
      this.project = null
    }
    this.astCache = null
  }
}
