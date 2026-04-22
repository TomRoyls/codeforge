import type { Ora } from 'ora'

import { readFile } from 'node:fs/promises'
import pLimit from 'p-limit'

import type { RuleRegistry } from '../core/rule-registry.js'

import { type RuleViolation } from '../ast/visitor.js'
import { hashFile, type ResultCache } from '../cache/index.js'
import { type DiscoveredFile } from '../core/file-discovery.js'
import { Parser, type ParseResult } from '../core/parser.js'
import {
  filterSuppressedViolations,
  parseSuppressionsFromSourceFile,
} from '../core/suppression-parser.js'
import { logger } from '../utils/logger.js'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface FileReport {
  filePath: string
  violations: RuleViolation[]
}

export interface AnalysisSummary {
  duration: number
  errors: number
  info: number
  totalFiles: number
  totalViolations: number
  warnings: number
}

export interface FailedFile {
  error: string
  filePath: string
}

export interface AnalysisResult {
  allViolations: RuleViolation[]
  failedFiles: FailedFile[]
  fileReports: FileReport[]
}

export interface AnalyzeFilesOptions {
  concurrency: number
  configHash: null | string
  discoveredFiles: DiscoveredFile[]
  parseCache: Map<string, ParseResult>
  parser: Parser
  registry: RuleRegistry
  resultCache: null | ResultCache
  spinner: null | Ora
  verbose: boolean
}

// ============================================================================
// Pure Helper Functions
// ============================================================================

/**
 * Analyzes files through the rule engine and returns violations.
 */
export async function analyzeFiles(options: AnalyzeFilesOptions): Promise<AnalysisResult> {
  const {
    concurrency,
    configHash,
    discoveredFiles,
    parseCache,
    parser,
    registry,
    resultCache,
    spinner,
    verbose,
  } = options
  const limit = pLimit(concurrency)

  const results = await Promise.all(
    discoveredFiles.map((file, index) =>
      limit(async () => {
        if (!file) return null

        if (spinner && verbose) {
          spinner.text = `Analyzing ${file.path} (${index + 1}/${discoveredFiles.length})`
        }

        try {
          // Check result cache first
          let fileHash: string | undefined
          if (resultCache && configHash) {
            try {
              fileHash = await hashFile(file.absolutePath)
              const cachedViolations = await resultCache.get(
                file.absolutePath,
                fileHash,
                configHash,
              )
              if (cachedViolations) {
                logger.debug(`Result cache HIT for ${file.path}`)
                const violationsWithFilePath = cachedViolations.map((v) => ({
                  ...v,
                  filePath: file.path,
                }))
                return {
                  filePath: file.path,
                  violations: violationsWithFilePath,
                }
              }
            } catch (cacheError) {
              logger.debug(`Result cache error for ${file.path}: ${cacheError}`)
            }
          }

          const parseResult = await parser.parseFile(file.absolutePath)
          parseCache.set(file.absolutePath, parseResult)

          const violations = registry.runRulesBatched(parseResult.sourceFile, 50)

          let activeViolations = violations
          try {
            const { suppressions } = parseSuppressionsFromSourceFile(parseResult.sourceFile)
            if (suppressions.length > 0) {
              const unfilteredCount = violations.length
              activeViolations = filterSuppressedViolations(violations, suppressions)
              const suppressedCount = unfilteredCount - activeViolations.length
              if (suppressedCount > 0 && verbose) {
                logger.debug(
                  `Suppressed ${suppressedCount} violation(s) in ${file.path} via inline comments`,
                )
              }
            }
          } catch {
            // Source file may not support text extraction (e.g. mock); skip suppression filtering
          }

          const violationsWithFilePath = activeViolations.map((v: RuleViolation) => ({
            ...v,
            filePath: file.path,
          }))

          // Cache results if caching is enabled
          if (resultCache && configHash && fileHash) {
            try {
              await resultCache.set(file.absolutePath, fileHash, configHash, violations)
            } catch (cacheError) {
              logger.debug(`Failed to cache results for ${file.path}: ${cacheError}`)
            }
          }

          return {
            filePath: file.path,
            violations: violationsWithFilePath,
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logger.debug(`Failed to analyze ${file.path}: ${errorMessage}`)

          return {
            error: errorMessage,
            filePath: file.path,
          }
        }
      }),
    ),
  )

  const allViolations: RuleViolation[] = []
  const fileReports: FileReport[] = []
  const failedFiles: FailedFile[] = []

  for (const result of results) {
    if (!result) continue

    if ('violations' in result) {
      fileReports.push(result as FileReport)
      allViolations.push(...(result as FileReport).violations)
    } else if ('error' in result) {
      failedFiles.push(result as FailedFile)
    }
  }

  return { allViolations, failedFiles, fileReports }
}

/**
 * Generates an analysis summary from violations.
 */
export function generateSummary(
  violations: RuleViolation[],
  fileCount: number,
  duration: number,
): AnalysisSummary {
  let errors = 0
  let warnings = 0
  let info = 0

  for (const v of violations) {
    if (v.severity === 'error') errors++
    else if (v.severity === 'warning') warnings++
    else info++
  }

  return {
    duration,
    errors,
    info,
    totalFiles: fileCount,
    totalViolations: violations.length,
    warnings,
  }
}

/**
 * Reads and parses an ignore file.
 */
export async function readIgnoreFile(ignorePath: string): Promise<string[]> {
  try {
    const content = await readFile(ignorePath, 'utf8')
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  } catch {
    return []
  }
}

export {
  type BaselineCompareResult,
  type BaselineSaveResult,
  compareWithBaselineReport,
  type FixApplicationResult,
  loadBaselineReport,
  saveBaselineReport,
} from './analyze-baseline-helpers.js'

export {
  applyProfileOverrides,
  configureLogging,
  determineExitCode,
  filterBySeverity,
  filterFileReports,
} from './analyze-filter-helpers.js'

export { applyFixes, type ApplyFixesOptions, type FixResult } from './analyze-fix-helpers.js'
export { getRulesWithFixes, processFixes } from './analyze-fix-helpers.js'
export type { HandleFixesOptions } from './analyze-fix-helpers.js'

export type { DiscoverFilesOptions } from './analyze-git-helpers.js'
export {
  getGitChangedFiles,
  getStagedFilesList,
  resolveTargetFiles,
} from './analyze-git-helpers.js'
