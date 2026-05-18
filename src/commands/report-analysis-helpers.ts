import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora from 'ora'
import pLimit from 'p-limit'

import type { AnalysisResult } from '../reporters/types.js'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { setupRuleRegistryLazy } from '../utils/command-helpers.js'
import { DEFAULT_FILE_PATTERNS } from '../utils/constants.js'
import { CLIError } from '../utils/errors.js'

interface RunAnalysisPipelineOptions {
  log?: (msg: string) => void
  version?: string
}

export async function runAnalysisPipeline(
  targetPath: string,
  concurrency: number,
  options?: RunAnalysisPipelineOptions,
): Promise<AnalysisResult> {
  const absolutePath = resolve(targetPath)

  if (!existsSync(absolutePath)) {
    throw CLIError.invalidInput(`Path not found: ${absolutePath}`)
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

  let errorCount = 0
  let warningCount = 0
  let infoCount = 0
  let filesWithViolations = 0
  for (const v of allViolations) {
    if (v.severity === 'error') errorCount++
    else if (v.severity === 'warning') warningCount++
    else if (v.severity === 'info') infoCount++
  }
  for (const r of validResults) {
    if (r.violations.length > 0) filesWithViolations++
  }

  return {
    files: validResults,
    summary: {
      errorCount,
      filesWithViolations,
      infoCount,
      totalFiles: validResults.length,
      totalTime: duration,
      warningCount,
    },
    timestamp: new Date().toISOString(),
    version: options?.version ?? 'unknown',
  }
}
