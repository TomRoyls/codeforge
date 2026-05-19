import chalk from 'chalk'

import type { SignatureInfo, SignatureStats } from './signatures-helpers.js'

// ─── Complexity Color ───────────────────────────────────

/**
 * @example
 * const text = complexityBadge(7)
 * console.log(text)
 */
export function complexityBadge(complexity: number): string {
  const label = String(complexity)
  if (complexity > 5) return chalk.red(label)
  if (complexity > 3) return chalk.rgb(255, 165, 0)(label)
  return chalk.green(label)
}

// ─── Param Type Label ───────────────────────────────────

/**
 * @example
 * const text = paramTypeLabel({ isRest: true, isDestructured: false, optional: false, hasDefault: false, name: 'args', type: 'string[]', destructuredKeys: [] })
 * console.log(text)
 */
export function paramTypeLabel(): string {
  return chalk.gray('param')
}

// ─── Format Signature ───────────────────────────────────

/**
 * @example
 * const text = formatSignature(sig)
 * console.log(text)
 */
export function formatSignature(sig: SignatureInfo): string {
  const modifiers: string[] = []
  if (sig.isExported) modifiers.push(chalk.green('export'))
  if (sig.isAsync) modifiers.push(chalk.magenta('async'))
  if (sig.isGeneric) modifiers.push(chalk.cyan('generic'))

  const params = sig.parameters.map((p) => {
    let text = p.name
    if (p.isRest) text = '...' + text
    if (p.optional) text += '?'
    if (p.type && p.type !== 'unknown') text += `: ${p.type}`
    if (p.hasDefault) text += ' = ...'
    return text
  }).join(', ')

  const badge = complexityBadge(sig.complexity)
  const mod = modifiers.length > 0 ? modifiers.join(' ') + ' ' : ''

  return `  ${chalk.bold(sig.name)}(${chalk.gray(params)}): ${chalk.cyan(sig.returnType)} ${chalk.gray(`[${badge}]`)} ${mod}`
}

// ─── Format Signatures ──────────────────────────────────

/**
 * @example
 * const text = formatSignatures(sigs)
 * console.log(text)
 */
export function formatSignatures(signatures: SignatureInfo[]): string {
  if (signatures.length === 0) return chalk.gray('  No signatures found')

  const lines: string[] = []
  lines.push(chalk.bold('  Function Signatures'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const sig of signatures) {
    lines.push(formatSignature(sig))
    if (sig.suggestions.length > 0) {
      for (const s of sig.suggestions) {
        lines.push(`    ${chalk.rgb(255, 165, 0)('→')} ${s}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatSignatureStats(stats)
 * console.log(text)
 */
export function formatSignatureStats(stats: SignatureStats): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Statistics'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))
  lines.push(`  ${chalk.cyan('Total Functions:')}          ${stats.totalFunctions}`)
  lines.push(`  ${chalk.cyan('Exported:')}                ${stats.exportedFunctions}`)
  lines.push(`  ${chalk.cyan('Async:')}                   ${stats.asyncFunctions}`)
  lines.push(`  ${chalk.cyan('Generic:')}                 ${stats.genericFunctions}`)
  lines.push(`  ${chalk.cyan('Avg Params:')}              ${stats.avgParamCount}`)
  lines.push(`  ${chalk.cyan('Max Params:')}              ${stats.maxParamCount}`)
  lines.push(`  ${chalk.cyan('Rest Params:')}             ${stats.functionsWithRestParams}`)
  lines.push(`  ${chalk.cyan('Destructuring:')}           ${stats.functionsWithDestructuring}`)
  lines.push(`  ${chalk.cyan('Optional Params:')}         ${stats.functionsWithOptionalParams}`)
  lines.push(`  ${chalk.cyan('Complex (>5):')}            ${stats.complexSignatures}`)

  return lines.join('\n')
}

// ─── Format Distribution ────────────────────────────────

/**
 * @example
 * const text = formatParamDistribution({ '0': 5, '1': 10 })
 * console.log(text)
 */
export function formatParamDistribution(distribution: Record<string, number>): string {
  const entries = Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0]))
  if (entries.length === 0) return ''

  const maxCount = Math.max(...entries.map(([, c]) => c))

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold('  Param Distribution'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const [count, freq] of entries) {
    const barWidth = 30
    const barLen = maxCount > 0 ? Math.round((freq / maxCount) * barWidth) : 0
    const bar = chalk.green('█'.repeat(barLen))
    lines.push(`  ${String(count).padStart(2)} params ${bar} ${freq}`)
  }

  return lines.join('\n')
}

// ─── Format Table ───────────────────────────────────────

/**
 * @example
 * const text = formatSignaturesTable(sigs, stats)
 * console.log(text)
 */
export function formatSignaturesTable(signatures: SignatureInfo[], stats: SignatureStats): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Signature Analysis'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════'))

  parts.push(formatSignatures(signatures))
  parts.push(formatSignatureStats(stats))
  parts.push(formatParamDistribution(stats.paramDistribution))

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatSignaturesJson(sigs, stats)
 * console.log(json.length)
 */
export function formatSignaturesJson(signatures: SignatureInfo[], stats: SignatureStats): string {
  return JSON.stringify({ signatures, stats }, null, 2)
}
