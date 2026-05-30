import chalk from 'chalk'

import type { TypesResult } from './types-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

function complexityColor(complexity: number): string {
  if (complexity <= 3) return chalk.green(String(complexity))
  if (complexity <= 6) return chalk.yellow(String(complexity))
  if (complexity <= 8) return chalk.hex('#FFA500')(String(complexity))
  return chalk.red(String(complexity))
}

function coverageBar(percentage: number): string {
  const filled = Math.round(percentage / 5)
  const empty = 20 - filled
  const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
  return `${bar} ${chalk.bold(percentage)}%`
}

export function formatTypesTable(result: TypesResult, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n🔬 Type Usage Analysis'), '']

  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total type annotations:  ${chalk.cyan(String(result.totalAnnotations))}`)
  lines.push(`  Type definitions:         ${chalk.cyan(String(result.totalTypeDefs))}`)
  lines.push(`  Average complexity:       ${complexityColor(result.avgComplexity)}`)
  lines.push(`  Type coverage:            ${coverageBar(result.typeCoverage)}`)
  lines.push(`  With generics:            ${chalk.yellow(String(result.withGenerics))}`)
  lines.push(`  With unions:              ${chalk.yellow(String(result.withUnions))}`)
  lines.push(`  With intersections:       ${chalk.yellow(String(result.withIntersections))}`)
  lines.push(`  With optional:            ${chalk.yellow(String(result.withOptional))}`)

  if (result.byKind.length > 0) {
    lines.push('')
    lines.push(chalk.bold('By Kind:'))
    for (const { kind, count } of result.byKind) {
      lines.push(`  ${padRight(kind, 12)} ${chalk.cyan(String(count))}`)
    }
  }

  if (result.topComplex.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Top Complex Types:'))

    const colWidths = {
      complexity: Math.max(12, ...result.topComplex.map((a) => String(a.complexity).length)),
      file: Math.max(10, ...result.topComplex.map((a) => a.filePath.length)),
      line: Math.max(4, ...result.topComplex.map((a) => String(a.line).length)),
      name: Math.max(4, ...result.topComplex.map((a) => a.name.length)),
      type: Math.max(4, ...result.topComplex.map((a) => a.typeString.length)),
    }

    const header =
      chalk.cyan(padRight('Name', colWidths.name)) +
      '  ' +
      chalk.cyan(padRight('Type', colWidths.type)) +
      '  ' +
      chalk.cyan(padLeft('Complexity', colWidths.complexity)) +
      '  ' +
      chalk.cyan(padRight('File', colWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Line', colWidths.line))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const ann of result.topComplex) {
      const row =
        padRight(ann.name, colWidths.name) +
        '  ' +
        padRight(ann.typeString.length > colWidths.type - 2
          ? ann.typeString.slice(0, colWidths.type - 3) + '...'
          : ann.typeString, colWidths.type) +
        '  ' +
        complexityColor(ann.complexity).padStart(colWidths.complexity + chalk.reset().length) +
        '  ' +
        padRight(ann.filePath, colWidths.file) +
        '  ' +
        padLeft(String(ann.line), colWidths.line)
      lines.push(row)
    }
  }

  if (result.largestInterfaces.length > 0) {
    lines.push('')
    lines.push(chalk.bold('Largest Interfaces/Types:'))

    const colWidths = {
      file: Math.max(10, ...result.largestInterfaces.map((t) => t.filePath.length)),
      generics: Math.max(8, ...result.largestInterfaces.map((t) => String(t.generics).length)),
      name: Math.max(4, ...result.largestInterfaces.map((t) => t.name.length)),
      properties: Math.max(10, ...result.largestInterfaces.map((t) => String(t.properties).length)),
    }

    const header =
      chalk.cyan(padRight('Name', colWidths.name)) +
      '  ' +
      chalk.cyan(padLeft('Properties', colWidths.properties)) +
      '  ' +
      chalk.cyan(padLeft('Generics', colWidths.generics)) +
      '  ' +
      chalk.cyan(padRight('File', colWidths.file))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    for (const td of result.largestInterfaces) {
      const row =
        padRight(td.name, colWidths.name) +
        '  ' +
        padLeft(String(td.properties), colWidths.properties) +
        '  ' +
        padLeft(String(td.generics), colWidths.generics) +
        '  ' +
        padRight(td.filePath, colWidths.file)
      lines.push(row)
    }
  }

  if (verbose && result.annotations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('All Annotations:'))
    for (const ann of result.annotations) {
      const flags: string[] = []
      if (ann.hasGenerics) flags.push('G')
      if (ann.hasUnion) flags.push('U')
      if (ann.hasIntersection) flags.push('I')
      if (ann.hasOptional) flags.push('O')
      const flagStr = flags.length > 0 ? chalk.dim(`[${flags.join(',')}]`) : ''
      lines.push(
        `  ${chalk.cyan(ann.name)}: ${ann.typeString} ${flagStr} ${chalk.dim(`${ann.filePath}:${ann.line}`)}`,
      )
    }
  }

  return lines.join('\n')
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatTypesCsv(result: TypesResult): string {
  const rows: string[] = []

  rows.push('Category,Metric,Value')
  rows.push(`Summary,Total Annotations,${result.totalAnnotations}`)
  rows.push(`Summary,Type Definitions,${result.totalTypeDefs}`)
  rows.push(`Summary,Avg Complexity,${result.avgComplexity}`)
  rows.push(`Summary,Type Coverage,${result.typeCoverage}`)
  rows.push(`Summary,With Generics,${result.withGenerics}`)
  rows.push(`Summary,With Unions,${result.withUnions}`)
  rows.push(`Summary,With Intersections,${result.withIntersections}`)
  rows.push(`Summary,With Optional,${result.withOptional}`)

  for (const { kind, count } of result.byKind) {
    rows.push(`ByKind,${escapeCsv(kind)},${count}`)
  }

  if (result.topComplex.length > 0) {
    rows.push('')
    rows.push('Name,Type,Complexity,File,Line')
    for (const ann of result.topComplex) {
      rows.push(
        [
          escapeCsv(ann.name),
          escapeCsv(ann.typeString),
          String(ann.complexity),
          escapeCsv(ann.filePath),
          String(ann.line),
        ].join(','),
      )
    }
  }

  if (result.largestInterfaces.length > 0) {
    rows.push('')
    rows.push('Name,Properties,Generics,File')
    for (const td of result.largestInterfaces) {
      rows.push(
        [escapeCsv(td.name), String(td.properties), String(td.generics), escapeCsv(td.filePath)].join(','),
      )
    }
  }

  return rows.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatTypesJson(result: TypesResult): string {
  return JSON.stringify(result, null, 2)
}
