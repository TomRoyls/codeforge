import { readFile } from 'node:fs/promises'
import pLimit from 'p-limit'
import { Project, type SourceFile } from 'ts-morph'

import { ASTCache } from '../cache/ast-cache.js'
import { hashContent } from '../cache/index.js'
import { globalParseCache } from '../cache/parse-cache.js'
import { logger } from '../utils/logger.js'

/**
 * @stable
 */
export interface ParseError {
  error: Error
  filePath: string
}

/**
 * @stable
 */
export interface ParseResult {
  cached: boolean
  diskCached?: boolean
  filePath: string
  parseTime: number
  sourceFile: SourceFile
}

/**
 * @stable
 */
export interface ParseFilesResult {
  errors: ParseError[]
  results: ParseResult[]
}

/**
 * @stable
 */
export interface ParserOptions {
  concurrency?: number
  skipFileDependencyResolution?: boolean
  tsConfigFilePath?: string
  /** Enable persistent disk-based AST cache */
  useDiskCache?: boolean
  /** CodeForge version for cache invalidation */
  version?: string
}

/**
 * @stable
 */
export class Parser {
  private astCache: ASTCache | null = null
  private concurrency: number
  private options: ParserOptions
  private project: null | Project = null

  constructor(options: ParserOptions = {}) {
    this.options = options
    this.concurrency = options.concurrency ?? 4
  }

  async clearCache(): Promise<void> {
    globalParseCache.clear()
    if (this.astCache) {
      await this.astCache.clear()
    }
  }

  dispose(): void {
    if (this.project) {
      this.project = null
    }

    this.astCache = null
  }

  getASTCache(): ASTCache | null {
    return this.astCache
  }

  async getCacheStats(): Promise<{
    disk: null | { entries: number; hitRate: number; size: number }
    memory: { hitRate: number; hits: number; misses: number }
  }> {
    const memoryStats = globalParseCache.getStats()
    const diskStats = this.astCache ? await this.astCache.getStats() : null

    return {
      disk: diskStats,
      memory: memoryStats,
    }
  }

  getProject(): null | Project {
    return this.project
  }

  async initialize(): Promise<void> {
    this.project = new Project({
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
      skipAddingFilesFromTsConfig: !this.options.tsConfigFilePath,
      skipFileDependencyResolution: this.options.skipFileDependencyResolution ?? true,
      tsConfigFilePath: this.options.tsConfigFilePath,
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
      const content = await readFile(filePath, 'utf8')
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
    const { errors, results } = await this.parseFilesWithErrors(filePaths)

    if (errors.length > 0) {
      for (const { error, filePath } of errors) {
        logger.error(`Failed to parse ${filePath}: ${error.message}`)
      }
    }

    return results
  }

  async parseFilesWithErrors(filePaths: string[]): Promise<ParseFilesResult> {
    if (!this.project) {
      await this.initialize()
    }

    const limit = pLimit(this.concurrency)

    const outcomes = await Promise.all(
      filePaths.map((filePath) =>
        limit(async (): Promise<{ error?: ParseError; result?: ParseResult }> => {
          try {
            const result = await this.parseFile(filePath)
            return { result }
          } catch (error) {
            return { error: { error: error as Error, filePath } }
          }
        }),
      ),
    )

    const results: ParseResult[] = []
    const errors: ParseError[] = []

    for (const outcome of outcomes) {
      if (outcome.result) {
        results.push(outcome.result)
      } else if (outcome.error) {
        errors.push(outcome.error)
      }
    }

    return { errors, results }
  }

  releaseFile(filePath: string): void {
    globalParseCache.delete(filePath)
  }
}
