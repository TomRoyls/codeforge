import chalk from 'chalk'

import type { NamingPattern, NamingStyle, TokenAnalysisResult, TokenEntry, TokenTypeBreakdown } from './tokens-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map token type to a chalk-colored badge.
 *
 * @example
 * tokenTypeBadge('identifier') // colored '[id]' label
 * tokenTypeBadge('keyword') // colored '[kw]' label
 */
export function tokenTypeBadge(type: string): string {
  switch (type) {
    case 'identifier': return chalk.cyan('[id]')
    case 'keyword': return chalk.yellow('[kw]')
    case 'string-literal': return chalk.green('[str]')
    case 'comment-word': return chalk.dim('[cmt]')
    default: return chalk.dim('[?]')
  }
}

/**
 * Map naming style to a colored label.
 *
 * @example
 * namingStyleLabel('camelCase') // 'camelCase' in cyan
 */
export function namingStyleLabel(style: NamingStyle): string {
  const colors: Record<NamingStyle, (s: string) => string> = {
    camelCase: chalk.cyan,
    PascalCase: chalk.green,
    snake_case: chalk.yellow,
    UPPER_SNAKE: chalk.red,
    'kebab-case': chalk.magenta,
  }
  return (colors[style] ?? chalk.dim)(style)
}

/**
 * Generate an ASCII bar of given length.
 *
 * @example
 * asciiBar(8, 20) // '████░░░░░░░░'
 */
export function asciiBar(value: number, max: number, width: number = 20): string {
  const filled = max > 0 ? Math.round((value / max) * width) : 0
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(width - filled))
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format a token entry as a table row.
 *
 * @example
 * formatTokenRow(entry, maxFreq)
 * // '  config [id]  23 ██████████  8 files'
 */
export function formatTokenRow(entry: TokenEntry, maxFreq: number): string {
  const badge = tokenTypeBadge(entry.type)
  const bar = asciiBar(entry.frequency, maxFreq)
  const filesStr = entry.files === 1 ? '1 file' : `${entry.files} files`
  const contextsStr = entry.contexts.slice(0, 3).join(', ')
  return `  ${chalk.bold(entry.token.padEnd(20))} ${badge} ${String(entry.frequency).padStart(5)} ${bar} ${chalk.dim(filesStr)} ${chalk.dim(contextsStr)}`
}

/**
 * Format the breakdown section.
 *
 * @example
 * formatBreakdown(breakdown) // colored ASCII breakdown
 */
export function formatBreakdown(breakdown: TokenTypeBreakdown): string {
  const lines: string[] = []
  const total = breakdown.total || 1
  lines.push(`  ${chalk.cyan('Identifiers:')}    ${String(breakdown.identifiers).padStart(6)} (${Math.round(breakdown.identifiers / total * 100)}%)`)
  lines.push(`  ${chalk.yellow('Keywords:')}       ${String(breakdown.keywords).padStart(6)} (${Math.round(breakdown.keywords / total * 100)}%)`)
  lines.push(`  ${chalk.green('String Literals:')} ${String(breakdown.stringLiterals).padStart(6)} (${Math.round(breakdown.stringLiterals / total * 100)}%)`)
  lines.push(`  ${chalk.dim('Comment Words:')}   ${String(breakdown.commentWords).padStart(6)} (${Math.round(breakdown.commentWords / total * 100)}%)`)
  lines.push(`  ${chalk.bold('Total:')}           ${String(breakdown.total).padStart(6)}`)
  return lines.join('\n')
}

/**
 * Format naming patterns section.
 *
 * @example
 * formatNamingPatterns(patterns) // colored naming pattern summary
 */
export function formatNamingPatterns(patterns: NamingPattern[]): string {
  if (patterns.length === 0) return chalk.dim('  No named identifiers found')
  const lines: string[] = []
  for (const p of patterns) {
    const style = namingStyleLabel(p.style)
    const examples = p.examples.slice(0, 3).map((e) => chalk.dim(e)).join(', ')
    lines.push(`  ${style.padEnd(15)} ${String(p.count).padStart(5)} (${p.percentage}%) ${examples}`)
  }
  return lines.join('\n')
}

/**
 * Format the complete token analysis as a table.
 *
 * @example
 * formatTokensTable(result) // full colored terminal output
 */
export function formatTokensTable(result: TokenAnalysisResult, verbose?: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.underline('Token Frequency Analysis'))
  lines.push('')

  lines.push(chalk.bold('Overview:'))
  lines.push(`  ${chalk.dim('Files analyzed:')} ${result.files}`)
  lines.push(`  ${chalk.dim('Total tokens:')}   ${result.totalTokens}`)
  lines.push(`  ${chalk.dim('Vocabulary:')}     ${result.vocabularySize} unique tokens`)
  lines.push(`  ${chalk.dim('Avg length:')}     ${result.avgTokenLength}`)
  lines.push(`  ${chalk.dim('Hapax legomena:')} ${result.hapaxLegomena} (appear once)`)
  lines.push('')

  lines.push(chalk.bold('Token Breakdown:'))
  lines.push(formatBreakdown(result.breakdown))
  lines.push('')

  if (result.namingPatterns.length > 0) {
    lines.push(chalk.bold('Naming Patterns:'))
    lines.push(formatNamingPatterns(result.namingPatterns))
    lines.push('')
  }

  if (result.topTokens.length > 0) {
    lines.push(chalk.bold('Top Tokens:'))
    const maxFreq = result.topTokens[0]?.frequency ?? 1
    for (const entry of result.topTokens) {
      lines.push(formatTokenRow(entry, maxFreq))
    }
    lines.push('')
  }

  if (verbose && result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format token analysis as JSON.
 *
 * @example
 * formatTokensJson(result) // '{"topTokens":[...],...}'
 */
export function formatTokensJson(result: TokenAnalysisResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format token analysis as CSV.
 *
 * @example
 * formatTokensCsv(result)
 * // 'token,type,frequency,files,contexts'
 */
export function formatTokensCsv(result: TokenAnalysisResult): string {
  const header = 'token,type,frequency,files,contexts,averageLength'
  const rows = result.topTokens.map((t) => {
    const contexts = t.contexts.join(';')
    return `"${t.token}","${t.type}",${t.frequency},${t.files},"${contexts}",${t.averageLength}`
  })
  return [header, ...rows].join('\n')
}
