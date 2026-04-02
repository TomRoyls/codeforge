import { Project, type SourceFile } from 'ts-morph'
import pLimit from 'p-limit'

import { globalParseCache } from '../cache/parse-cache.js'
import { logger } from '../utils/logger.js'

export interface ParseResult {
  sourceFile: SourceFile
  filePath: string
  parseTime: number
  cached: boolean
}

export interface ParserOptions {
  tsConfigFilePath?: string
  skipFileDependencyResolution?: boolean
  concurrency?: number
}

export class Parser {
  private project: Project | null = null
  private options: ParserOptions
  private concurrency: number

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
  }

  async parseFile(filePath: string): Promise<ParseResult> {
    if (!this.project) {
      await this.initialize()
    }

    const startTime = performance.now()

    const cachedSourceFile = globalParseCache.get(filePath)
    if (cachedSourceFile) {
      const parseTime = performance.now() - startTime
      logger.debug(`Cache HIT for ${filePath}`)
      return {
        cached: true,
        filePath,
        parseTime,
        sourceFile: cachedSourceFile,
      }
    }

    logger.debug(`Cache MISS for ${filePath}`)
    const sourceFile = this.project!.addSourceFileAtPath(filePath)

    globalParseCache.set(filePath, sourceFile)

    const parseTime = performance.now() - startTime

    return {
      cached: false,
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

  dispose(): void {
    if (this.project) {
      this.project = null
    }
  }
}
