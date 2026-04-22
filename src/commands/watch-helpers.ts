import chalk from 'chalk'

import { type RuleViolation } from '../ast/visitor.js'
import { DEFAULT_DEBOUNCE_MS } from '../utils/constants.js'

export const MAX_VIOLATIONS_TO_DISPLAY = 3

export interface WatcherConfigOptions {
  debounceMs?: number
  ignorePatterns?: string[]
}

export interface WatcherConfig {
  debounceMs: number
  extensions: string[]
  ignorePatterns: string[]
}

export function resolveRequestedRules(rulesFlag: string | undefined): string[] | undefined {
  if (!rulesFlag) return undefined
  return rulesFlag.split(',').map((r) => r.trim())
}

export function countBySeverity(violations: RuleViolation[]): { errors: number; warnings: number } {
  let errors = 0
  let warnings = 0
  for (const v of violations) {
    if (v.severity === 'error') errors++
    else if (v.severity === 'warning') warnings++
  }

  return { errors, warnings }
}

export function getRelativePath(filePath: string, cwd: string): string {
  return filePath.replace(cwd, '.').replace(/^\.\//, '')
}

export function buildWatcherConfig(options: WatcherConfigOptions): WatcherConfig {
  return {
    debounceMs: options.debounceMs ?? DEFAULT_DEBOUNCE_MS,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    ignorePatterns: options.ignorePatterns ?? [],
  }
}

export function formatStartupMessage(
  patterns: string[],
  debounceMs: number,
  logFn: (msg: string) => void,
): void {
  logFn(chalk.blue('\n👁️  Starting file watcher...\n'))
  logFn(chalk.dim(`  Watching: ${patterns.join(', ') || 'current directory'}`))
  logFn(chalk.dim(`  Debounce: ${debounceMs}ms`))
  logFn(chalk.dim('  Press Ctrl+C to stop\n'))
}

export function formatFileResult(
  filePath: string,
  violations: RuleViolation[],
  cwd: string,
  logFn: (msg: string) => void,
): void {
  const relativePath = getRelativePath(filePath, cwd)

  if (violations.length === 0) {
    logFn(chalk.green(`  ✓ ${relativePath}`))
  } else {
    const { errors, warnings } = countBySeverity(violations)

    logFn(chalk.yellow(`  ⚠ ${relativePath} - ${errors} error(s), ${warnings} warning(s)`))

    // Show first few violations
    for (const violation of violations.slice(0, MAX_VIOLATIONS_TO_DISPLAY)) {
      const severity = violation.severity === 'error' ? chalk.red('error') : chalk.yellow('warn')
      logFn(
        chalk.dim(`      ${violation.range.start.line}:${violation.range.start.column} `) +
          `${severity} ${violation.ruleId} - ${violation.message}`,
      )
    }

    if (violations.length > MAX_VIOLATIONS_TO_DISPLAY) {
      logFn(chalk.dim(`      ... and ${violations.length - MAX_VIOLATIONS_TO_DISPLAY} more`))
    }
  }
}
