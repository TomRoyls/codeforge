import chalk from 'chalk'

import type { AnnotateResult, Annotation } from './annotate-helpers.js'

// ─── Helpers ─────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── formatAnnotationType ────────────────────────────────

const TYPE_COLORS: Record<string, (text: string) => string> = {
  blue: chalk.blue,
  cyan: chalk.cyan,
  green: chalk.green,
  magenta: chalk.magenta,
  red: chalk.red,
  yellow: chalk.yellow,
}

/**
 * Formats an annotation type with its associated color.
 *
 * @example
 * formatAnnotationType('TODO') // blue "TODO"
 */
export function formatAnnotationType(type: string, color: string): string {
  const colorFn = TYPE_COLORS[color]
  if (colorFn) return colorFn(type)
  return type
}

// ─── formatSeverity ──────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { icon: string; label: string; style: (text: string) => string }> = {
  critical: { icon: '●', label: 'CRITICAL', style: chalk.red.bold },
  info: { icon: '○', label: 'INFO', style: chalk.blue },
  warning: { icon: '▲', label: 'WARNING', style: chalk.yellow },
}

/**
 * Formats a severity level with icon and color.
 *
 * @example
 * formatSeverity('critical') // "● CRITICAL" in red
 */
export function formatSeverity(severity: string): string {
  const config = SEVERITY_CONFIG[severity]
  if (config) return `${config.icon} ${config.style(config.label)}`
  return severity
}

// ─── formatAnnotateTable ─────────────────────────────────

/**
 * Formats annotation results as a colored table.
 *
 * @example
 * const output = formatAnnotateTable(result, false)
 */
export function formatAnnotateTable(result: AnnotateResult, verbose: boolean): string {
  const { annotations, stats } = result
  const lines: string[] = [chalk.bold('\n🔍 Code Annotation Report'), '']

  // Stats summary
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Total annotations: ${chalk.bold(String(stats.total))}`)
  lines.push(`  Density: ${chalk.cyan(String(stats.density))} per 1000 lines`)
  lines.push(
    `  Severity: ${formatSeverity('critical')} ${stats.bySeverity.critical}  ${formatSeverity('warning')} ${stats.bySeverity.warning}  ${formatSeverity('info')} ${stats.bySeverity.info}`,
  )
  lines.push('')

  // By-type table
  if (stats.byType.length > 0) {
    lines.push(chalk.bold('By Type:'))
    const typeHeader =
      chalk.cyan(padRight('Type', 14)) +
      '  ' +
      chalk.cyan(padLeft('Count', 8)) +
      '  ' +
      chalk.cyan(padLeft('%', 8)) +
      '  ' +
      chalk.cyan(padRight('Severity', 14))
    lines.push(typeHeader)
    lines.push(chalk.dim('─'.repeat(52)))

    for (const typeStat of stats.byType) {
      const typeColored = formatAnnotationType(typeStat.type, typeStat.color)
      const row =
        padRight(typeColored, 14) +
        '  ' +
        padLeft(String(typeStat.count), 8) +
        '  ' +
        padLeft(String(typeStat.percentage) + '%', 8) +
        '  ' +
        padRight(formatSeverity(typeStat.severity), 14)
      lines.push(row)
    }
    lines.push('')
  }

  // By-file table
  if (stats.byFile.length > 0) {
    lines.push(chalk.bold('By File:'))
    const fileHeader =
      chalk.cyan(padRight('File', 40)) +
      '  ' +
      chalk.cyan(padLeft('Count', 8)) +
      '  ' +
      chalk.cyan(padLeft('Critical', 10)) +
      '  ' +
      chalk.cyan(padLeft('Warning', 10)) +
      '  ' +
      chalk.cyan(padLeft('Info', 8))
    lines.push(fileHeader)
    lines.push(chalk.dim('─'.repeat(82)))

    for (const fileStat of stats.byFile) {
      const critCount = fileStat.annotations.filter((a) => a.severity === 'critical').length
      const warnCount = fileStat.annotations.filter((a) => a.severity === 'warning').length
      const infoCount = fileStat.annotations.filter((a) => a.severity === 'info').length

      const row =
        padRight(fileStat.file, 40) +
        '  ' +
        padLeft(String(fileStat.count), 8) +
        '  ' +
        padLeft(String(critCount), 10) +
        '  ' +
        padLeft(String(warnCount), 10) +
        '  ' +
        padLeft(String(infoCount), 8)
      lines.push(row)
    }
    lines.push('')
  }

  // By-directory breakdown
  const dirs = Object.entries(stats.byDirectory)
  if (dirs.length > 0) {
    lines.push(chalk.bold('By Directory:'))
    for (const [dir, count] of dirs) {
      lines.push(`  ${chalk.dim(dir)}: ${count}`)
    }
    lines.push('')
  }

  // Verbose: full annotation list with context
  if (verbose && annotations.length > 0) {
    lines.push(chalk.bold('Annotations:'))
    lines.push('')
    for (const ann of annotations) {
      const typeInfo = getAnnotationTypeInfo(ann.type)
      const typeColored = formatAnnotationType(ann.type, typeInfo?.color ?? 'white')
      lines.push(`  ${typeColored} ${chalk.dim(`${ann.file}:${ann.line}`)}`)
      if (ann.text) {
        lines.push(`    ${chalk.dim('Text:')} ${ann.text}`)
      }
      lines.push(chalk.dim('    Context:'))
      const contextLines = ann.context.split('\n')
      for (const ctxLine of contextLines) {
        lines.push(chalk.dim(`      ${ctxLine}`))
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ─── formatAnnotateJson ──────────────────────────────────

/**
 * Formats annotation results as JSON.
 *
 * @example
 * const output = formatAnnotateJson(result)
 */
export function formatAnnotateJson(result: AnnotateResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Internal helpers ────────────────────────────────────

interface AnnotationTypeInfo {
  color: string
  severity: string
  type: string
}

function getAnnotationTypeInfo(type: string): AnnotationTypeInfo | undefined {
  const types: AnnotationTypeInfo[] = [
    { type: 'TODO', severity: 'info', color: 'blue' },
    { type: 'FIXME', severity: 'warning', color: 'yellow' },
    { type: 'HACK', severity: 'warning', color: 'magenta' },
    { type: 'XXX', severity: 'critical', color: 'red' },
    { type: 'NOTE', severity: 'info', color: 'green' },
    { type: 'OPTIMIZE', severity: 'warning', color: 'cyan' },
    { type: 'BUG', severity: 'critical', color: 'red' },
    { type: 'CHANGED', severity: 'info', color: 'blue' },
    { type: 'IDEA', severity: 'info', color: 'green' },
    { type: 'REVIEW', severity: 'warning', color: 'yellow' },
  ]
  return types.find((t) => t.type === type)
}
