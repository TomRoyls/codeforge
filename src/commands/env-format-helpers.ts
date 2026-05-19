import chalk from 'chalk'

import type { EnvCheck, EnvResult } from './env-helpers.js'

// ─── Status helpers ─────────────────────────────────────

function statusIcon(status: EnvCheck['status']): string {
  switch (status) {
    case 'pass': return chalk.green('✓')
    case 'warn': return chalk.rgb(255, 165, 0)('⚠')
    case 'fail': return chalk.red('✗')
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return chalk.green(String(score))
  if (score >= 50) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.red(String(score))
}

function scoreBar(score: number, width: number): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

// ─── formatEnvTable ─────────────────────────────────────

/**
 * Format environment result as a colored table.
 *
 * @example
 * ```ts
 * const output = formatEnvTable(result, false)
 * ```
 */
export function formatEnvTable(result: EnvResult, verbose: boolean): string {
  const lines: string[] = []
  const { info, checks, score, issues } = result

  lines.push('')
  lines.push(chalk.bold('  Environment Analysis'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push('')

  lines.push(`  OS:             ${chalk.white(info.os)} (${info.arch})`)
  lines.push(`  Node:           ${chalk.cyan(info.nodeVersion)}`)
  lines.push(`  Package Mgr:    ${chalk.cyan(info.packageManager)} ${info.packageManagerVersion ?? ''}`)
  lines.push(`  Shell:          ${chalk.white(info.shell ?? 'unknown')}`)
  lines.push(`  Editor:         ${chalk.white(info.editor ?? 'unknown')}`)
  lines.push(`  Git:            ${chalk.white(info.gitVersion ?? 'not found')}`)
  lines.push('')

  lines.push(chalk.bold('  Tools'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  for (const tool of info.tools) {
    const icon = tool.installed ? chalk.green('✓') : chalk.red('✗')
    const version = tool.version ? chalk.cyan(tool.version) : chalk.gray('not installed')
    const compat = tool.compatible === true ? chalk.green('✓')
      : tool.compatible === false ? chalk.red('✗')
      : ''
    const req = tool.required ? chalk.rgb(255, 165, 0)(' (required)') : ''
    lines.push(`  ${icon} ${chalk.white(tool.name.padEnd(10))} ${version} ${compat}${req}`)
  }
  lines.push('')

  lines.push(chalk.bold('  Checks'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  for (const check of checks) {
    lines.push(`  ${statusIcon(check.status)} ${chalk.white(check.name.padEnd(15))} ${chalk.gray(check.message)}`)
    if (verbose && check.fix) {
      lines.push(`    ${chalk.yellow('→')} ${chalk.gray(check.fix)}`)
    }
  }
  lines.push('')

  lines.push(chalk.bold('  Score'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push(`  ${scoreBar(score, 30)} ${scoreColor(score)}/100`)
  lines.push('')

  if (issues.length > 0) {
    lines.push(chalk.bold('  Issues'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const issue of issues) {
      lines.push(`  ${chalk.red('•')} ${chalk.white(issue)}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── formatEnvJson ──────────────────────────────────────

/**
 * Format environment result as JSON string.
 *
 * @example
 * ```ts
 * const json = formatEnvJson(result)
 * ```
 */
export function formatEnvJson(result: EnvResult): string {
  return JSON.stringify(result, null, 2)
}
