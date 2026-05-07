/**
 * Pure helper functions for the fix command.
 *
 * Extracted from Fix class to enable independent testing and reuse.
 * All functions are stateless — they accept parameters and return results.
 */
import chalk from 'chalk'
import * as fs from 'node:fs/promises'

import type { RuleRegistry } from '../core/rule-registry.js'

import { DEFAULT_CONFIG } from '../config/types.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { applyFixesToFile, type RuleWithFix } from '../fix/fixer.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { resolvePatterns, setupRuleRegistryLazy } from '../utils/command-helpers.js'

export interface FileFixResult {
  conflicts: Array<{ conflictingRule: string; ruleId: string }>
  error?: string
  file: string
  fixesApplied: number
  fixesSkipped: number
  status: 'error' | 'processed' | 'unchanged'
}

export interface FixFlags {
  ci: boolean
  concurrency: number
  config: string | undefined
  'dry-run': boolean
  ignore?: string[]
  rules: string | undefined
  'safe-only': boolean
  verbose: boolean
}

interface ProcessContext {
  dryRun: boolean
  parser: Parser
  registry: RuleRegistry
  rulesWithFixes: Map<string, RuleWithFix>
}

export interface FixSummary {
  filesModified: string[]
  filesUnchanged: string[]
  totalFixesApplied: number
  totalFixesSkipped: number
}

interface SetupFixContextSuccess {
  context: ProcessContext
  discoveredFiles: Array<{ absolutePath: string; path: string }>
}

export async function getRulesWithFixes(safeOnly = false): Promise<Map<string, RuleWithFix>> {
  const rulesWithFixes = new Map<string, RuleWithFix>()
  const loadedRules = await lazyRuleLoader.loadAllRules()

  for (const [ruleId, ruleDef] of Object.entries(loadedRules)) {
    if (ruleDef.fix && typeof ruleDef.fix === 'function') {
      if (safeOnly && !ruleDef.meta?.fixable) {
        continue
      }

      rulesWithFixes.set(ruleId, {
        fix: ({ sourceFile, violation }) => ruleDef.fix!(sourceFile, violation),
        id: ruleId,
        priority: 10,
      })
    }
  }

  return rulesWithFixes
}

export async function processFile(
  file: { absolutePath: string; path: string },
  context: ProcessContext,
): Promise<FileFixResult> {
  const filePath = file.absolutePath

  try {
    const parseResult = await context.parser.parseFile(filePath)

    if (!parseResult.sourceFile) {
      return {
        conflicts: [],
        file: file.path,
        fixesApplied: 0,
        fixesSkipped: 0,
        status: 'unchanged',
      }
    }

    const violations = context.registry.runRulesBatched(parseResult.sourceFile, 50)

    if (violations.length === 0) {
      return {
        conflicts: [],
        file: file.path,
        fixesApplied: 0,
        fixesSkipped: 0,
        status: 'unchanged',
      }
    }

    const fixReport = applyFixesToFile(
      parseResult.sourceFile,
      violations,
      context.rulesWithFixes,
      context.dryRun,
    )

    if (!context.dryRun && fixReport.fixesApplied > 0) {
      const newContent = parseResult.sourceFile.getFullText()

      await fs.writeFile(filePath, newContent, 'utf8')
    }

    return {
      conflicts: fixReport.conflicts,
      file: file.path,
      fixesApplied: fixReport.fixesApplied,
      fixesSkipped: fixReport.fixesSkipped,
      status: 'processed',
    }
  } catch (error) {
    return {
      conflicts: [],
      error: error instanceof Error ? error.message : String(error),
      file: file.path,
      fixesApplied: 0,
      fixesSkipped: 0,
      status: 'error',
    }
  }
}

export async function setupFixContext(
  args: { files: string[] | undefined },
  flags: FixFlags,
  ciMode: boolean,
): Promise<{
  result: null | SetupFixContextSuccess
  statusMessages: string[]
}> {
  const statusMessages: string[] = []

  const config = DEFAULT_CONFIG
  const patterns = resolvePatterns(args.files ?? [], config.files)
  const ignore = flags.ignore ?? config.ignore ?? []
  const requestedRules = flags.rules?.split(',').map((r) => r.trim())

  const cwd = process.cwd()
  const discoveredFiles = await discoverFiles({ cwd, ignore, patterns })

  if (discoveredFiles.length === 0) {
    if (ciMode) {
      statusMessages.push(JSON.stringify({ error: 'No files found to fix', files: [] }, null, 2))
    } else {
      statusMessages.push(chalk.yellow('No files found to fix.'))
    }

    return { result: null, statusMessages }
  }

  if (!ciMode) {
    statusMessages.push(chalk.blue(`\n🔧 Fixing ${discoveredFiles.length} file(s)...\n`))
  }

  const rulesWithFixes = await getRulesWithFixes(flags['safe-only'])

  if (rulesWithFixes.size === 0) {
    if (ciMode) {
      statusMessages.push(
        JSON.stringify({ error: 'No fixable rules available', files: [] }, null, 2),
      )
    } else {
      statusMessages.push(chalk.yellow('No fixable rules available.'))
    }

    return { result: null, statusMessages }
  }

  const registry = await setupRuleRegistryLazy(requestedRules)
  const parser = new Parser()

  const context: ProcessContext = {
    dryRun: flags['dry-run'],
    parser,
    registry,
    rulesWithFixes,
  }

  return { result: { context, discoveredFiles }, statusMessages }
}




export {aggregateResults, outputFixResults, printSummary} from './fix-format-helpers.js'