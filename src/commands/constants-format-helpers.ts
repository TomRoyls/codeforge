import chalk from 'chalk'

import type { ConstantsResult, MagicNumber, HardcodedString, ExistingConstant } from './constants-helpers.js'

// ─── Format Magic Numbers ───────────────────────────────

/**
 * @example
 * const text = formatMagicNumbers(nums)
 * console.log(text)
 */
export function formatMagicNumbers(magicNumbers: MagicNumber[]): string {
  if (magicNumbers.length === 0) return chalk.gray('  No magic numbers found')

  const lines: string[] = []
  lines.push(chalk.bold('  Magic Numbers'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const m of magicNumbers.slice(0, 20)) {
    const value = chalk.rgb(255, 165, 0)(String(m.value))
    const name = chalk.cyan(m.suggestedName)
    const loc = chalk.gray(`${m.file}:${m.line}`)
    const occ = m.occurrences > 1 ? chalk.red(` (${m.occurrences}x)`) : ''
    lines.push(`  ${value.padEnd(10)} → ${name.padEnd(25)} ${loc}${occ}`)
  }

  if (magicNumbers.length > 20) {
    lines.push(chalk.gray(`  ... and ${magicNumbers.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Format Hardcoded Strings ───────────────────────────

/**
 * @example
 * const text = formatHardcodedStrings(strs)
 * console.log(text)
 */
export function formatHardcodedStrings(hardcodedStrings: HardcodedString[]): string {
  if (hardcodedStrings.length === 0) return chalk.gray('  No hardcoded strings found')

  const lines: string[] = []
  lines.push(chalk.bold('  Hardcoded Strings'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const s of hardcodedStrings.slice(0, 20)) {
    const value = chalk.rgb(255, 165, 0)(s.value.length > 30 ? s.value.substring(0, 30) + '...' : s.value)
    const name = chalk.cyan(s.suggestedName)
    const loc = chalk.gray(`${s.file}:${s.line}`)
    const len = chalk.gray(`(${s.length} chars)`)
    lines.push(`  "${value}" → ${name} ${loc} ${len}`)
  }

  if (hardcodedStrings.length > 20) {
    lines.push(chalk.gray(`  ... and ${hardcodedStrings.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Format Existing Constants ──────────────────────────

/**
 * @example
 * const text = formatExistingConstants(consts)
 * console.log(text)
 */
export function formatExistingConstants(constants: ExistingConstant[]): string {
  if (constants.length === 0) return chalk.gray('  No existing constants found')

  const lines: string[] = []
  lines.push(chalk.bold('  Existing Constants'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const c of constants.slice(0, 20)) {
    const name = chalk.green(c.name)
    const typeLabel = chalk.gray(`[${c.type}]`)
    const val = chalk.white(c.value.length > 30 ? c.value.substring(0, 30) + '...' : c.value)
    const usage = c.usageCount > 0 ? chalk.cyan(`(${c.usageCount} uses)`) : chalk.red('(unused)')
    lines.push(`  ${name} ${typeLabel} = ${val} ${usage}`)
  }

  return lines.join('\n')
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatConstantsStats(stats)
 * console.log(text)
 */
export function formatConstantsStats(stats: ConstantsResult['stats']): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Statistics'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))
  lines.push(`  ${chalk.rgb(255, 165, 0)('Magic Numbers:')}      ${stats.totalMagicNumbers}`)
  lines.push(`  ${chalk.rgb(255, 165, 0)('Hardcoded Strings:')}  ${stats.totalHardcodedStrings}`)
  lines.push(`  ${chalk.green('Existing Constants:')} ${stats.totalExistingConstants}`)
  lines.push(`  ${chalk.red('Extraction Candidates:')} ${stats.extractionCandidates}`)

  if (Object.keys(stats.byFile).length > 0) {
    lines.push('')
    lines.push(chalk.bold('  By File'))
    for (const [file, count] of Object.entries(stats.byFile).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      lines.push(`    ${chalk.cyan(file.padEnd(30))} ${count}`)
    }
  }

  return lines.join('\n')
}

// ─── Format Table ───────────────────────────────────────

/**
 * @example
 * const text = formatConstantsTable(result)
 * console.log(text)
 */
export function formatConstantsTable(result: ConstantsResult): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Constants & Magic Numbers Analysis'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════════'))
  parts.push('')

  parts.push(formatMagicNumbers(result.magicNumbers))
  parts.push('')
  parts.push(formatHardcodedStrings(result.hardcodedStrings))
  parts.push('')
  parts.push(formatExistingConstants(result.existingConstants))
  parts.push(formatConstantsStats(result.stats))
  parts.push('')

  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatConstantsJson(result)
 * console.log(json)
 */
export function formatConstantsJson(result: ConstantsResult): string {
  return JSON.stringify(
    {
      existingConstants: result.existingConstants,
      hardcodedStrings: result.hardcodedStrings.slice(0, 50),
      magicNumbers: result.magicNumbers.slice(0, 50),
      stats: result.stats,
    },
    null,
    2,
  )
}
