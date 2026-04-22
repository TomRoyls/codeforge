import chalk from 'chalk'

import type { CodeForgeConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'

export interface MigrationResult {
  rules: Record<string, unknown>
  unmapped: string[]
}

export function buildCodeForgeConfig(rules: Record<string, unknown>): CodeForgeConfig {
  return {
    files: ['**/*.ts', '**/*.tsx'],
    ignore: ['**/node_modules/**', '**/dist/**'],
    rules: rules as Record<string, [RuleSeverity, Record<string, unknown>] | RuleSeverity>,
  }
}

export function formatMigrationSummary(
  result: MigrationResult,
  maxUnmapped: number,
  logFn: (msg: string) => void,
): void {
  logFn('')
  logFn(chalk.bold('Migration Summary:'))
  logFn(chalk.gray(`  Mapped rules: ${Object.keys(result.rules).length}`))
  logFn(chalk.gray(`  Unmapped rules: ${result.unmapped.length}`))

  if (result.unmapped.length > 0) {
    logFn('')
    logFn(chalk.yellow('Unmapped ESLint rules:'))
    for (const rule of result.unmapped.slice(0, maxUnmapped)) {
      logFn(chalk.gray(`  - ${rule}`))
    }

    if (result.unmapped.length > maxUnmapped) {
      logFn(chalk.gray(`  ... and ${result.unmapped.length - maxUnmapped} more`))
    }
  }
}

export function formatDryRunOutput(config: CodeForgeConfig, logFn: (msg: string) => void): void {
  logFn('')
  logFn(chalk.bold('Generated config (dry run):'))
  logFn(chalk.gray(JSON.stringify(config, null, 2)))
}

export function formatNextSteps(logFn: (msg: string) => void): void {
  logFn('')
  logFn(chalk.bold('Next steps:'))
  logFn(chalk.gray('  1. Review the generated configuration'))
  logFn(chalk.gray('  2. Run `codeforge analyze` to check your code'))
  logFn(chalk.gray('  3. Address any unmapped rules manually'))
}
