import { existsSync } from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import pLimit from 'p-limit'

import type { AnalysisResult } from '../reporters/types.js'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { setupRuleRegistryLazy } from '../utils/command-helpers.js'
import { DEFAULT_FILE_PATTERNS } from '../utils/constants.js'

export interface RunAnalysisPipelineOptions {
  log?: (msg: string) => void
  version?: string
}

export async function runAnalysisPipeline(
  targetPath: string,
  concurrency: number,
  options?: RunAnalysisPipelineOptions,
): Promise<AnalysisResult> {
  const absolutePath = path.resolve(targetPath)

  if (!existsSync(absolutePath)) {
    throw new Error(`Path not found: ${absolutePath}`)
  }

  options?.log?.(`Analyzing: ${absolutePath}`)

  const startTime = performance.now()

  const discoveredFiles = await discoverFiles({
    cwd: absolutePath,
    ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
    patterns: [...DEFAULT_FILE_PATTERNS],
  })

  const registry = await setupRuleRegistryLazy()

  const parser = new Parser()
  await parser.initialize()

  const limit = pLimit(concurrency)
  const spinner = ora('Analyzing files...').start()
  let completedCount = 0
  const totalFiles = discoveredFiles.length

  const fileResults = await Promise.all(
    discoveredFiles.map((file) =>
      limit(async () => {
        if (!file) return null

        try {
          const parseResult = await parser.parseFile(file.absolutePath)
          const violations = registry.runRulesBatched(parseResult.sourceFile, 50)

          completedCount++
          spinner.text = `Analyzing files... (${completedCount}/${totalFiles})`

          const result = {
            filePath: file.path,
            stats: {
              analysisTime: 0,
              parseTime: parseResult.parseTime,
              totalTime: parseResult.parseTime,
            },
            violations: violations.map(
              (v: {
                message: string
                range: {
                  end: { column: number; line: number }
                  start: { column: number; line: number }
                }
                ruleId: string
                severity: 'error' | 'info' | 'warning'
                suggestion?: string
              }) => ({
                column: v.range.start.column,
                endColumn: v.range.end.column,
                endLine: v.range.end.line,
                filePath: file.path,
                line: v.range.start.line,
                message: v.message,
                ruleId: v.ruleId,
                severity: v.severity,
                suggestion: v.suggestion,
              }),
            ),
          }

          parser.releaseFile(file.absolutePath)
          return result
        } catch {
          completedCount++
          spinner.text = `Analyzing files... (${completedCount}/${totalFiles})`
          return null
        }
      }),
    ),
  )

  spinner.succeed(`Analyzed ${totalFiles} files`)

  parser.dispose()

  const validResults = fileResults.filter((r): r is NonNullable<typeof r> => r !== null)
  const allViolations = validResults.flatMap((r) => r.violations)
  const duration = performance.now() - startTime

  return {
    files: validResults,
    summary: {
      errorCount: allViolations.filter((v) => v.severity === 'error').length,
      filesWithViolations: validResults.filter((r) => r.violations.length > 0).length,
      infoCount: allViolations.filter((v) => v.severity === 'info').length,
      totalFiles: validResults.length,
      totalTime: duration,
      warningCount: allViolations.filter((v) => v.severity === 'warning').length,
    },
    timestamp: new Date().toISOString(),
    version: options?.version ?? 'unknown',
  }
}
