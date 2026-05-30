import chalk from 'chalk'

import type { HookInfo, HooksResult } from './hooks-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Utility ─────────────────────────────────────────────

/**
 * Format a byte count as a human-readable string.
 *
 * @example
 * ```ts
 * formatSize(500)     // '500 B'
 * formatSize(2048)    // '2.0 KB'
 * formatSize(1048576) // '1.0 MB'
 * ```
 *
 * @param bytes - Number of bytes
 * @returns Human-readable size string
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

/**
 * Format a hook's status as a colored icon and name string.
 *
 * @example
 * ```ts
 * formatHookStatus(hook) // '✓ pre-commit' (green) or '✗ pre-commit' (dim)
 * ```
 *
 * @param hook - The hook to format
 * @returns Colored status string
 */
export function formatHookStatus(hook: HookInfo): string {
  if (!hook.installed) {
    return chalk.dim(`✗ ${hook.name}`)
  }
  if (hook.issues.some((i) => i.severity === 'error')) {
    return chalk.red(`✓ ${hook.name}`)
  }
  return chalk.green(`✓ ${hook.name}`)
}

// ─── Table formatting ────────────────────────────────────

/**
 * Format hooks analysis result as a table with optional verbose output.
 *
 * @example
 * ```ts
 * const output = formatHooksTable(result, false)
 * console.log(output) // formatted table with summary, hooks, issues, recommendations
 * ```
 *
 * @param result - The hooks analysis result
 * @param verbose - Whether to show hook script contents
 * @returns Formatted table string
 */
export function formatHooksTable(result: HooksResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n🪝 Git Hooks Analysis'), '']

  lines.push(
    `  ${chalk.cyan('Hooks directory:')} ${result.hooksDir}`,
    `  ${chalk.cyan('Total hooks:')} ${String(result.totalHooks)}`,
    `  ${chalk.cyan('Installed:')} ${String(result.installedHooks)}`,
    `  ${chalk.cyan('Issues:')} ${String(result.issues.length)}`,
  )

  const installedHooks = result.hooks.filter((h) => h.installed)
  if (installedHooks.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Installed Hooks:'))
    lines.push('')

    const colWidths = {
      executable: 10,
      language: 10,
      name: Math.max(20, ...installedHooks.map((h) => h.name.length)),
      size: 10,
      type: 8,
    }

    const header =
      chalk.cyan(padRight('Name', colWidths.name)) +
      '  ' +
      chalk.cyan(padLeft('Type', colWidths.type)) +
      '  ' +
      chalk.cyan(padLeft('Language', colWidths.language)) +
      '  ' +
      chalk.cyan(padLeft('Exec', colWidths.executable)) +
      '  ' +
      chalk.cyan(padLeft('Size', colWidths.size))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const hook of installedHooks) {
      const execStatus = hook.isExecutable ? chalk.green('Yes') : chalk.yellow('No')
      const row =
        padRight(hook.name, colWidths.name) +
        '  ' +
        padLeft(hook.type, colWidths.type) +
        '  ' +
        padLeft(hook.language, colWidths.language) +
        '  ' +
        padLeft(execStatus, colWidths.executable) +
        '  ' +
        padLeft(formatSize(hook.size), colWidths.size)
      lines.push(row)
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  } else {
    lines.push('')
    lines.push(chalk.dim('No hooks installed.'))
  }

  if (result.issues.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Issues:'))
    lines.push('')
    for (const issue of result.issues) {
      const icon =
        issue.severity === 'error' ? chalk.red('✗') : issue.severity === 'warning' ? chalk.yellow('⚠') : chalk.blue('ℹ')
      lines.push(`  ${icon} ${issue.message}`)
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Recommendations:'))
    lines.push('')
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.cyan('→')} ${rec}`)
    }
  }

  if (verbose) {
    const installedForVerbose = result.hooks.filter((h) => h.installed)
    if (installedForVerbose.length > 0) {
      lines.push('')
      lines.push(chalk.bold('Hook Contents:'))
      for (const hook of installedForVerbose) {
        lines.push('')
        lines.push(chalk.cyan(`── ${hook.name} ──`))
        lines.push(chalk.dim(hook.content))
      }
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ─────────────────────────────────────

/**
 * Format hooks analysis result as a JSON string.
 *
 * @example
 * ```ts
 * const json = formatHooksJson(result)
 * console.log(json) // pretty-printed JSON
 * ```
 *
 * @param result - The hooks analysis result
 * @returns JSON string
 */
export function formatHooksJson(result: HooksResult): string {
  return JSON.stringify(result, null, 2)
}
