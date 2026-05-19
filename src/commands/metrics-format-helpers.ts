import chalk from 'chalk'

import { computeAverages, type CodebaseMetrics } from './metrics-helpers.js'

// ─── Helpers ──────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function makeBar(ratio: number, width = 20): string {
  const filled = Math.round(ratio * width)
  const empty = width - filled
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
}

function sectionHeader(title: string): string {
  return '\n' + chalk.cyan.bold(`  ■ ${title}`) + '\n' + chalk.dim('  ' + '─'.repeat(40))
}

// ─── Dashboard formatting ─────────────────────────────────

export function formatMetricsDashboard(metrics: CodebaseMetrics): string {
  const derived = computeAverages(metrics)
  const lines: string[] = [chalk.bold('\n📊 Codebase Health Dashboard')]

  // ─── Files section
  lines.push(sectionHeader('Files'))
  lines.push(`  ${chalk.dim('Total files:')} ${chalk.white(metrics.files)}`)
  for (const lang of metrics.languages) {
    const pct = lang.percentage.toFixed(1)
    lines.push(`  ${chalk.dim(`${lang.language}:`)} ${chalk.white(lang.files)} files (${pct}%)`)
  }

  // ─── Lines section
  lines.push(sectionHeader('Lines'))
  lines.push(`  ${chalk.dim('Total:')}      ${chalk.white(String(metrics.totalLines).padStart(8))}`)
  const codeRatio = metrics.totalLines > 0 ? metrics.codeLines / metrics.totalLines : 0
  const commentRatio = metrics.totalLines > 0 ? metrics.commentLines / metrics.totalLines : 0
  const blankRatio = metrics.totalLines > 0 ? metrics.blankLines / metrics.totalLines : 0
  lines.push(`  ${chalk.dim('Code:')}      ${chalk.white(String(metrics.codeLines).padStart(8))} ${makeBar(codeRatio)}`)
  lines.push(`  ${chalk.dim('Comment:')}   ${chalk.white(String(metrics.commentLines).padStart(8))} ${makeBar(commentRatio)}`)
  lines.push(`  ${chalk.dim('Blank:')}     ${chalk.white(String(metrics.blankLines).padStart(8))} ${makeBar(blankRatio)}`)
  lines.push(`  ${chalk.dim('Avg/file:')}  ${chalk.white(String(derived.avgLinesPerFile).padStart(8))}`)

  // ─── Size section
  lines.push(sectionHeader('Size'))
  lines.push(`  ${chalk.dim('Total:')}     ${chalk.white(formatBytes(metrics.size.totalBytes))}`)
  lines.push(`  ${chalk.dim('Average:')}   ${chalk.white(formatBytes(metrics.size.averageBytes))}`)
  lines.push(`  ${chalk.dim('Largest:')}   ${chalk.white(metrics.size.largestFile || '(none)')} (${formatBytes(metrics.size.largestSize)})`)

  // ─── Complexity section
  lines.push(sectionHeader('Complexity'))
  const ratingColor = derived.complexityRating === 'low'
    ? chalk.green
    : derived.complexityRating === 'medium'
      ? chalk.yellow
      : chalk.red
  lines.push(`  ${chalk.dim('Average:')}   ${chalk.white(String(metrics.complexity.averageComplexity))}`)
  lines.push(`  ${chalk.dim('Max:')}       ${chalk.white(String(metrics.complexity.maxComplexity))} (${metrics.complexity.maxComplexityFile || '(none)'})`)
  lines.push(`  ${chalk.dim('Keywords:')}  ${chalk.white(String(metrics.complexity.totalKeywords))}`)
  lines.push(`  ${chalk.dim('Rating:')}    ${ratingColor(derived.complexityRating.toUpperCase())}`)

  // ─── TODOs section
  lines.push(sectionHeader('TODOs'))
  lines.push(`  ${chalk.dim('TODOs:')}     ${chalk.white(String(metrics.todos.todos))}`)
  lines.push(`  ${chalk.dim('FIXMEs:')}    ${chalk.white(String(metrics.todos.fixmes))}`)
  lines.push(`  ${chalk.dim('HACKs:')}     ${chalk.white(String(metrics.todos.hacks))}`)
  lines.push(`  ${chalk.dim('Total:')}     ${chalk.white(String(metrics.todos.total))}`)

  // ─── Extensions section
  lines.push(sectionHeader('Extensions (top 5)'))
  const top5 = metrics.extensions.slice(0, 5)
  if (top5.length === 0) {
    lines.push(`  ${chalk.dim('(none)')}`)
  }
  for (const ext of top5) {
    lines.push(`  ${chalk.dim(ext.extension.padEnd(10))} ${chalk.white(String(ext.count))}`)
  }

  return lines.join('\n')
}

// ─── CSV formatting ────────────────────────────────────────

export function formatMetricsCsv(metrics: CodebaseMetrics): string {
  const headers = [
    'Metric', 'Value',
  ]
  const rows: string[] = [headers.join(',')]

  const addRow = (metric: string, value: string): void => {
    rows.push([metric, value].join(','))
  }

  addRow('files', String(metrics.files))
  addRow('totalLines', String(metrics.totalLines))
  addRow('codeLines', String(metrics.codeLines))
  addRow('blankLines', String(metrics.blankLines))
  addRow('commentLines', String(metrics.commentLines))
  addRow('totalBytes', String(metrics.size.totalBytes))
  addRow('averageBytes', String(metrics.size.averageBytes))
  addRow('largestFile', metrics.size.largestFile)
  addRow('largestSize', String(metrics.size.largestSize))
  addRow('averageComplexity', String(metrics.complexity.averageComplexity))
  addRow('maxComplexity', String(metrics.complexity.maxComplexity))
  addRow('maxComplexityFile', metrics.complexity.maxComplexityFile)
  addRow('totalKeywords', String(metrics.complexity.totalKeywords))
  addRow('todos', String(metrics.todos.todos))
  addRow('fixmes', String(metrics.todos.fixmes))
  addRow('hacks', String(metrics.todos.hacks))
  addRow('todoTotal', String(metrics.todos.total))

  for (const lang of metrics.languages) {
    addRow(`lang:${lang.language}:files`, String(lang.files))
    addRow(`lang:${lang.language}:codeLines`, String(lang.codeLines))
    addRow(`lang:${lang.language}:percentage`, lang.percentage.toFixed(1))
  }

  for (const ext of metrics.extensions) {
    addRow(`ext:${ext.extension}`, String(ext.count))
  }

  return rows.join('\n')
}

// ─── JSON formatting ───────────────────────────────────────

export function formatMetricsJson(metrics: CodebaseMetrics): string {
  return JSON.stringify(metrics, null, 2)
}
