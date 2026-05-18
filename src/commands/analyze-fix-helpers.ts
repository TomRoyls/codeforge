import pLimit from 'p-limit'

import type { RuleRegistry } from '../core/rule-registry.js'
import type { FileFixReport } from '../fix/types.js'
import type { FixApplicationResult } from './analyze-baseline-helpers.js'

import { type RuleViolation } from '../ast/visitor.js'
import { type DiscoveredFile } from '../core/file-discovery.js'
import { Parser, type ParseResult } from '../core/parser.js'
import { formatDiffForConsole, renderTextChangesAsDiff } from '../fix/diff-renderer.js'
import { applyFixesToFile, type RuleWithFix } from '../fix/fixer.js'
import { applyFixesToFiles } from '../utils/command-helpers.js'
import { logger } from '../utils/logger.js'
import { append } from '../utils/map-helpers.js'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface FixResult {
  fileFixReports?: FileFixReport[]
  fixesApplied: number
  fixesSkipped: number
}

export interface ApplyFixesOptions {
  allViolations: RuleViolation[]
  concurrency: number
  discoveredFiles: DiscoveredFile[]
  dryRun: boolean
  parseCache: Map<string, ParseResult>
  parser: Parser
  rulesWithFixes: Map<string, RuleWithFix>
  verbose: boolean
}


// ============================================================================
// Fix Functions
// ============================================================================

/**
 * Applies fixes to files based on violations.
 */
export async function applyFixes(options: ApplyFixesOptions): Promise<FixResult> {
  const {
    allViolations,
    concurrency,
    discoveredFiles,
    dryRun,
    parseCache,
    parser,
    rulesWithFixes,
    verbose,
  } = options

  const violationsByFile = new Map<string, RuleViolation[]>()
  for (const violation of allViolations) {
    append(violationsByFile, violation.filePath, violation)
  }

  const limit = pLimit(concurrency)

  const results = await Promise.all(
    discoveredFiles.map((file) =>
      limit(async () => {
        if (!file) return { fixesApplied: 0, fixesSkipped: 0 }

        const fileViolations = violationsByFile.get(file.path) ?? []
        if (fileViolations.length === 0) return { fixesApplied: 0, fixesSkipped: 0 }

        try {
          // Use cached parse result if available
          let parseResult = parseCache.get(file.absolutePath)
          if (!parseResult) {
            parseResult = await parser.parseFile(file.absolutePath)
          }

          const report = applyFixesToFile(
            parseResult.sourceFile,
            fileViolations,
            rulesWithFixes,
            dryRun,
          )

          if (!dryRun && report.changes.length > 0) {
            parseResult.sourceFile.saveSync()
          }

          if (verbose && report.conflicts.length > 0) {
            for (const conflict of report.conflicts) {
              logger.warn(
                `Fix conflict in ${file.path}: ${conflict.ruleId} conflicts with ${conflict.conflictingRule}`,
              )
            }
          }

          return { fixesApplied: report.fixesApplied, fixesSkipped: report.fixesSkipped, report }
        } catch (error) {
          if (verbose) {
            logger.warn(`Failed to fix ${file.path}: ${(error as Error).message}`)
          }

          return { fixesApplied: 0, fixesSkipped: 0 }
        }
      }),
    ),
  )

  let fixesApplied = 0
  let fixesSkipped = 0
  const fileFixReports: FileFixReport[] = []

  for (const result of results) {
    fixesApplied += result.fixesApplied
    fixesSkipped += result.fixesSkipped
    if (result.report) {
      fileFixReports.push(result.report)
    }
  }

  return { fileFixReports: dryRun ? fileFixReports : undefined, fixesApplied, fixesSkipped }
}

/**
 * Gets rules that have fix capability from the registry.
 */
export function getRulesWithFixes(registry: RuleRegistry): Map<string, RuleWithFix> {
  const rulesWithFixes = new Map<string, RuleWithFix>()

  for (const loadedRule of registry.getAllRules()) {
    const { definition: ruleDef } = loadedRule
    const ruleId = ruleDef.meta.name
    if (ruleDef.fix && typeof ruleDef.fix === 'function') {
      rulesWithFixes.set(ruleId, {
        fix: ({ sourceFile, violation }) => ruleDef.fix!(sourceFile, violation),
        id: ruleId,
        priority: 10,
      })
    }
  }

  return rulesWithFixes
}

export async function processFixes(options: {
  allViolations: RuleViolation[]
  concurrency: number
  discoveredFiles: DiscoveredFile[]
  dryRun: boolean
  parseCache: Map<string, ParseResult>
  parser: Parser
  quiet: boolean
  registry: RuleRegistry
  verbose: boolean
}): Promise<FixApplicationResult> {
  const {
    allViolations,
    concurrency,
    discoveredFiles,
    dryRun,
    parseCache,
    parser,
    quiet,
    registry,
    verbose,
  } = options

  if (allViolations.length === 0) {
    return { dryRunDiffs: [], fixesApplied: 0, fixesSkipped: 0, spinnerMessage: '' }
  }

  const rulesWithFixes = getRulesWithFixes(registry)

  const fixResult = await applyFixesToFiles({
    allViolations,
    applyFixesFn: (opts) =>
      applyFixes({
        allViolations: opts.allViolations,
        concurrency: opts.concurrency,
        discoveredFiles: opts.discoveredFiles,
        dryRun: opts.dryRun,
        parseCache: opts.parseCache,
        parser: opts.parser,
        rulesWithFixes: opts.rulesWithFixes,
        verbose: opts.verbose,
      }),
    concurrency,
    discoveredFiles,
    dryRun,
    parseCache,
    parser,
    quiet,
    rulesWithFixes,
    verbose,
  })

  const spinnerMessage = dryRun
    ? `Would apply ${fixResult.fixesApplied} fixes, skip ${fixResult.fixesSkipped} (dry run)`
    : `Applied ${fixResult.fixesApplied} fixes, skipped ${fixResult.fixesSkipped}`

  const dryRunDiffs: string[] = []
  if (dryRun && fixResult.fileFixReports && fixResult.fileFixReports.length > 0) {
    for (const fileReport of fixResult.fileFixReports) {
      if (fileReport.changes.length > 0) {
        const diff = renderTextChangesAsDiff(fileReport.changes, fileReport.filePath)
        const formatted = formatDiffForConsole(diff)
        if (formatted) {
          dryRunDiffs.push(formatted)
        }
      }
    }
  }

  return {
    dryRunDiffs,
    fixesApplied: fixResult.fixesApplied,
    fixesSkipped: fixResult.fixesSkipped,
    spinnerMessage,
  }
}
