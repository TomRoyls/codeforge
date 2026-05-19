import chalk from 'chalk'

import type { LocatedElement, LocatorResult, LocatorStats } from './locator-helpers.js'

// ─── formatDefinitionHighlight ────────────────────────────────────────────────

/**
 * Format a definition as a highlighted box.
 *
 * @example
 * formatDefinitionHighlight(element) // boxed definition string
 */
export function formatDefinitionHighlight(el: LocatedElement): string {
  const typeLabel = chalk.cyan(`[${el.type}]`)
  const name = chalk.bold.yellow(el.name)
  const loc = chalk.gray(`${el.location.file}:${el.location.line}:${el.location.column}`)
  const score = chalk.dim(`(relevance: ${el.relevanceScore.toFixed(1)})`)

  const lines = [
    chalk.blue('┌─────────────────────────────────────────'),
    chalk.blue('│') + ` ${typeLabel} ${name}`,
    chalk.blue('│') + ` ${loc} ${score}`,
    chalk.blue('│') + ` ${el.location.context}`,
    chalk.blue('└─────────────────────────────────────────'),
  ]

  return lines.join('\n')
}

// ─── formatUsageTable ─────────────────────────────────────────────────────────

/**
 * Format usages as a table with file:line references.
 *
 * @example
 * formatUsageTable(usages) // table string
 */
export function formatUsageTable(usages: LocatedElement[]): string {
  if (usages.length === 0) return 'No usages found.'

  const fileW = Math.max(4, ...usages.map((u) => u.location.file.length))
  const nameW = Math.max(4, ...usages.map((u) => u.name.length))
  const typeW = Math.max(4, ...usages.map((u) => u.type.length))

  const header = chalk.bold(
    `  ${'File'.padEnd(fileW)} Ln  ${'Name'.padEnd(nameW)} ${'Type'.padEnd(typeW)} Score`,
  )
  const sep = '  ' + '-'.repeat(fileW + nameW + typeW + 16)
  const lines = [header, sep]

  for (const u of usages) {
    const fileLoc = `${u.location.file}:${u.location.line}`
    const score = u.relevanceScore >= 0.8 ? chalk.green(String(u.relevanceScore)) : String(u.relevanceScore)
    lines.push(
      `  ${fileLoc.padEnd(fileW + 3)} ${u.name.padEnd(nameW)} ${u.type.padEnd(typeW)} ${score}`,
    )
  }

  return lines.join('\n')
}

// ─── formatImportExportChain ──────────────────────────────────────────────────

/**
 * Format import/export entries showing the chain.
 *
 * @example
 * formatImportExportChain(imports, 'Imports') // string
 */
export function formatImportExportChain(elements: LocatedElement[], label: string): string {
  if (elements.length === 0) return ''

  const lines = [chalk.bold(label)]
  for (const el of elements) {
    const arrow = label === 'Imports' ? '←' : '→'
    lines.push(`  ${arrow} ${el.name} ${chalk.gray(`(${el.location.file}:${el.location.line})`)}`)
  }

  return lines.join('\n')
}

// ─── formatGroupedResults ─────────────────────────────────────────────────────

/**
 * Format results grouped by file.
 *
 * @example
 * formatGroupedResults(grouped) // string with file sections
 */
export function formatGroupedResults(grouped: Record<string, LocatedElement[]>): string {
  const files = Object.keys(grouped)
  if (files.length === 0) return 'No matches found.'

  const lines: string[] = []
  for (const file of files.sort()) {
    const elements = grouped[file]!
    lines.push(chalk.bold(chalk.underline(file)))
    for (const el of elements) {
      const typeTag = chalk.cyan(`[${el.type}]`)
      const def = el.isDefinition ? chalk.green(' def') : ''
      lines.push(`  ${String(el.location.line).padStart(4)} ${typeTag}${def} ${el.name}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format locator statistics.
 *
 * @example
 * formatStats(stats) // string
 */
export function formatStats(stats: LocatorStats): string {
  const lines = [
    chalk.bold('Search Results'),
    `  Query:         ${stats.queryType}`,
    `  Total matches: ${stats.totalMatches}`,
    `  Definitions:   ${stats.definitionsCount}`,
    `  Usages:        ${stats.usagesCount}`,
    `  Files matched: ${stats.filesMatched}`,
  ]
  return lines.join('\n')
}

// ─── formatRelevanceIndicator ─────────────────────────────────────────────────

/**
 * Visual relevance indicator.
 *
 * @example
 * formatRelevanceIndicator(0.9) // '●●●●●'
 */
export function formatRelevanceIndicator(score: number): string {
  const filled = Math.round(score * 5)
  const empty = 5 - filled
  const dots = '●'.repeat(filled) + '○'.repeat(empty)
  const color = score >= 0.8 ? chalk.green : score >= 0.5 ? chalk.yellow : chalk.red
  return color(dots)
}

// ─── formatResult ─────────────────────────────────────────────────────────────

/**
 * Format the full LocatorResult for terminal output.
 *
 * @example
 * formatResult(result) // complete output string
 */
export function formatResult(result: LocatorResult): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')

  if (result.definitions.length > 0) {
    sections.push(chalk.bold('Definitions'))
    for (const def of result.definitions) {
      sections.push(formatDefinitionHighlight(def))
    }
    sections.push('')
  }

  if (result.usages.length > 0) {
    sections.push(chalk.bold('Usages'))
    sections.push(formatUsageTable(result.usages))
    sections.push('')
  }

  const importSection = formatImportExportChain(result.imports, 'Imports')
  if (importSection) {
    sections.push(importSection)
    sections.push('')
  }

  const exportSection = formatImportExportChain(result.exports, 'Exports')
  if (exportSection) {
    sections.push(exportSection)
    sections.push('')
  }

  if (Object.keys(result.grouped).length > 0) {
    sections.push(chalk.bold('Grouped by File'))
    sections.push(formatGroupedResults(result.grouped))
  }

  return sections.join('\n')
}

// ─── formatJson ───────────────────────────────────────────────────────────────

/**
 * JSON output format.
 *
 * @example
 * formatJson(result) // JSON string
 */
export function formatJson(result: LocatorResult): string {
  return JSON.stringify(result, null, 2)
}
