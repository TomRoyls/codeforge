import chalk from 'chalk'

import type { SummaryResult } from './summary-helpers.js'

// ─── Utility ────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Health bar ─────────────────────────────────────────

/**
 * Format a score as a colored progress bar.
 *
 * @example
 * ```ts
 * formatHealthBar(80) // "[████████░░] 80%"
 * ```
 */
export function formatHealthBar(score: number): string {
  const filled = Math.round(score / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  if (score >= 90) return chalk.green(`[${bar}] ${score}%`)
  if (score >= 75) return chalk.blue(`[${bar}] ${score}%`)
  if (score >= 60) return chalk.yellow(`[${bar}] ${score}%`)
  if (score >= 40) return chalk.hex('#FFA500')(`[${bar}] ${score}%`)
  return chalk.red(`[${bar}] ${score}%`)
}

// ─── Grade color ────────────────────────────────────────

function colorGrade(grade: string): string {
  switch (grade) {
    case 'A':
      return chalk.green.bold('A')
    case 'B':
      return chalk.blue.bold('B')
    case 'C':
      return chalk.yellow.bold('C')
    case 'D':
      return chalk.hex('#FFA500').bold('D')
    case 'F':
      return chalk.red.bold('F')
    default:
      return grade
  }
}

// ─── Table formatting ───────────────────────────────────

/**
 * Format a summary result as an ASCII dashboard table.
 *
 * @example
 * ```ts
 * const output = formatSummaryTable(result)
 * console.log(output)
 * ```
 */
export function formatSummaryTable(result: SummaryResult): string {
  const lines: string[] = []
  const { code, git, health, issues, project, recentChanges, topFiles } = result
  const w = 60

  lines.push('')
  lines.push(chalk.bold.cyan('═'.repeat(w)))
  lines.push(
    chalk.bold.white(`  ${project.name}`) +
      (project.version ? chalk.dim(` v${project.version}`) : '') +
      (project.license ? chalk.dim(` · ${project.license}`) : ''),
  )

  if (project.description) {
    lines.push(chalk.dim(`  ${project.description}`))
  }

  if (project.framework) {
    lines.push(chalk.magenta(`  Framework: ${project.framework}`))
  }

  lines.push(chalk.bold.cyan('═'.repeat(w)))

  // ── Code Overview ──
  lines.push('')
  lines.push(chalk.bold('  Code Overview'))
  lines.push(chalk.dim('  ─' + '─'.repeat(30)))
  lines.push(`  ${chalk.cyan('Total Files:')}   ${padLeft(String(code.totalFiles), 8)}`)
  lines.push(`  ${chalk.cyan('Total Lines:')}   ${padLeft(String(code.totalLines), 8)}`)
  lines.push(`  ${chalk.cyan('Code Lines:')}    ${padLeft(String(code.codeLines), 8)}`)
  lines.push(`  ${chalk.cyan('Source Files:')}  ${padLeft(String(code.sourceFiles), 8)}`)
  lines.push(`  ${chalk.cyan('Test Files:')}    ${padLeft(String(code.testFiles), 8)}`)
  lines.push(`  ${chalk.cyan('Config Files:')}  ${padLeft(String(code.configFiles), 8)}`)

  if (code.languages.length > 0) {
    lines.push('')
    lines.push(chalk.dim('  Languages:'))
    for (const lang of code.languages.slice(0, 5)) {
      const barLen = Math.max(1, Math.round(lang.percentage / 10))
      const bar = '█'.repeat(barLen)
      lines.push(
        `    ${padRight(lang.name, 14)} ${chalk.green(bar)} ${lang.percentage}% (${lang.files})`,
      )
    }
  }

  // ── Health Score ──
  lines.push('')
  lines.push(chalk.bold('  Health Score') + '  ' + colorGrade(health.grade))
  lines.push(chalk.dim('  ─' + '─'.repeat(30)))
  lines.push(`  ${padRight('Documentation:', 18)} ${formatHealthBar(health.documentation)}`)
  lines.push(`  ${padRight('Testing:', 18)} ${formatHealthBar(health.testing)}`)
  lines.push(`  ${padRight('Complexity:', 18)} ${formatHealthBar(health.complexity)}`)
  lines.push(`  ${padRight('Maintainability:', 18)} ${formatHealthBar(health.maintainability)}`)
  lines.push(`  ${padRight('Overall:', 18)} ${formatHealthBar(health.overall)}`)

  // ── Git ──
  if (git) {
    lines.push('')
    lines.push(chalk.bold('  Git'))
    lines.push(chalk.dim('  ─' + '─'.repeat(30)))
    lines.push(`  ${chalk.cyan('Branch:')}        ${git.branch}`)
    lines.push(`  ${chalk.cyan('Commits:')}       ${git.totalCommits}`)
    lines.push(`  ${chalk.cyan('Contributors:')}  ${git.totalContributors}`)
    lines.push(`  ${chalk.cyan('Last commit:')}   ${git.lastCommitDate}`)
    lines.push(`  ${chalk.cyan('Branches:')}      ${git.totalBranches}`)
    lines.push(`  ${chalk.cyan('Tags:')}          ${git.totalTags}`)
    lines.push(`  ${chalk.cyan('Dirty:')}         ${git.isDirty ? chalk.red('Yes') : chalk.green('No')}`)
  }

  // ── Quick Issues ──
  lines.push('')
  lines.push(chalk.bold('  Quick Issues'))
  lines.push(chalk.dim('  ─' + '─'.repeat(30)))
  lines.push(`  ${chalk.yellow('⚠')} TODOs/FIXMEs:        ${issues.todos}`)
  lines.push(`  ${chalk.red('✗')} Dead code items:     ${issues.deadCode}`)
  lines.push(`  ${chalk.hex('#FFA500')('◆')} Unused exports:      ${issues.unusedExports}`)
  lines.push(`  ${chalk.magenta('⚡')} Complexity hotspots: ${issues.complexityHotspots}`)
  lines.push(`  ${chalk.gray('○')} Missing docs:        ${issues.missingDocs}`)

  // ── Top Files ──
  if (topFiles.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Top Files (by size)'))
    lines.push(chalk.dim('  ─' + '─'.repeat(30)))
    for (const file of topFiles) {
      lines.push(`    ${chalk.dim(file.path)}  ${chalk.white(String(file.lines) + ' lines')}`)
    }
  }

  // ── Recent Changes ──
  if (recentChanges.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  Recent Changes'))
    lines.push(chalk.dim('  ─' + '─'.repeat(30)))
    for (const change of recentChanges) {
      lines.push(`    ${chalk.dim(change.file)}  ${chalk.white(change.date)}`)
    }
  }

  lines.push('')
  lines.push(chalk.bold.cyan('═'.repeat(w)))
  lines.push('')

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format a summary result as JSON.
 *
 * @example
 * ```ts
 * const json = formatSummaryJson(result)
 * console.log(json)
 * ```
 */
export function formatSummaryJson(result: SummaryResult): string {
  return JSON.stringify(result, null, 2)
}
