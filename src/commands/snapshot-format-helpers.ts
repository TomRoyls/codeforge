import chalk from 'chalk'

import type { MetricChange, Snapshot, SnapshotDiff, SnapshotListItem } from './snapshot-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── formatSnapshotTable ────────────────────────────────

/**
 * Format a single snapshot's metrics as a table.
 *
 * @example
 * ```ts
 * const output = formatSnapshotTable(snapshot)
 * console.log(output)
 * ```
 */
export function formatSnapshotTable(snapshot: Snapshot): string {
  const { metrics, name, timestamp } = snapshot
  const lines: string[] = [
    chalk.bold(`\n📸 Snapshot: ${name}`),
    chalk.dim(`   Captured: ${timestamp}`),
    chalk.dim(`   Path: ${snapshot.path}`),
    '',
    chalk.bold('Overview:'),
    `  Files:           ${formatNumber(metrics.totalFiles)}`,
    `  Lines:           ${formatNumber(metrics.totalLines)}`,
    `  Size:            ${formatBytes(metrics.totalSize)}`,
    `  Avg file size:   ${formatBytes(metrics.averageFileSize)}`,
    `  Max file size:   ${formatBytes(metrics.maxFileSize)}`,
    `  Empty files:     ${metrics.emptyFiles}`,
    '',
    chalk.bold('Annotations:'),
    `  TODOs:           ${metrics.todos}`,
    `  FIXMEs:          ${metrics.fixmes}`,
    `  HACKs:           ${metrics.hacks}`,
    '',
    chalk.bold('Code Structure:'),
    `  Exports:         ${metrics.exports}`,
    `  Functions:       ${metrics.functions}`,
    `  Classes:         ${metrics.classes}`,
  ]

  if (metrics.languages.length > 0) {
    lines.push('', chalk.bold('Languages:'))
    const langColWidth = Math.max(12, ...metrics.languages.map((l) => l.lang.length))
    const filesColWidth = Math.max(7, ...metrics.languages.map((l) => String(l.files).length))
    const linesColWidth = Math.max(7, ...metrics.languages.map((l) => String(l.lines).length))

    lines.push(
      chalk.cyan(padRight('Language', langColWidth)) +
        '  ' +
        chalk.cyan(padLeft('Files', filesColWidth)) +
        '  ' +
        chalk.cyan(padLeft('Lines', linesColWidth)),
    )
    lines.push(chalk.dim('─'.repeat(langColWidth + filesColWidth + linesColWidth + 4)))

    for (const lang of metrics.languages) {
      lines.push(
        padRight(lang.lang, langColWidth) +
          '  ' +
          padLeft(String(lang.files), filesColWidth) +
          '  ' +
          padLeft(String(lang.lines), linesColWidth),
      )
    }
  }

  if (metrics.extensions.length > 0) {
    lines.push('', chalk.bold('Extensions:'))
    const extStr = metrics.extensions.map((e) => `${e.ext} (${e.count})`).join(', ')
    lines.push(`  ${extStr}`)
  }

  return lines.join('\n')
}

// ─── formatSnapshotList ─────────────────────────────────

/**
 * Format a list of snapshots as a table.
 *
 * @example
 * ```ts
 * const output = formatSnapshotList(snapshots)
 * console.log(output)
 * ```
 */
export function formatSnapshotList(snapshots: SnapshotListItem[]): string {
  if (snapshots.length === 0) {
    return chalk.dim('No snapshots found.')
  }

  const lines: string[] = [chalk.bold('\n📸 Snapshots'), '']

  const nameCol = Math.max(30, ...snapshots.map((s) => s.name.length))
  const timeCol = Math.max(24, ...snapshots.map((s) => s.timestamp.length))

  lines.push(
    chalk.cyan(padRight('Name', nameCol)) +
      '  ' +
      chalk.cyan(padRight('Timestamp', timeCol)) +
      '  ' +
      chalk.cyan('Path'),
  )
  lines.push(chalk.dim('─'.repeat(nameCol + timeCol + 60)))

  for (const snap of snapshots) {
    lines.push(padRight(snap.name, nameCol) + '  ' + padRight(snap.timestamp, timeCol) + '  ' + snap.path)
  }

  return lines.join('\n')
}

// ─── formatSnapshotDiffTable ────────────────────────────

/**
 * Format a snapshot diff as a colorized comparison table.
 *
 * @example
 * ```ts
 * const output = formatSnapshotDiffTable(diff)
 * console.log(output)
 * ```
 */
export function formatSnapshotDiffTable(diff: SnapshotDiff): string {
  const lines: string[] = [
    chalk.bold(`\n📊 Snapshot Comparison`),
    chalk.dim(`   ${diff.from} → ${diff.to}`),
    chalk.dim(`   Compared at: ${diff.timestamp}`),
    '',
  ]

  // Metrics table
  const metricCol = 18
  const fromCol = 12
  const toCol = 12
  const changeCol = 10
  const pctCol = 10

  lines.push(
    chalk.cyan(padRight('Metric', metricCol)) +
      '  ' +
      chalk.cyan(padLeft('Before', fromCol)) +
      '  ' +
      chalk.cyan(padLeft('After', toCol)) +
      '  ' +
      chalk.cyan(padLeft('Change', changeCol)) +
      '  ' +
      chalk.cyan(padLeft('%', pctCol)),
  )
  lines.push(chalk.dim('─'.repeat(metricCol + fromCol + toCol + changeCol + pctCol + 8)))

  for (const change of diff.changes) {
    const diffStr = change.diff >= 0 ? `+${change.diff}` : String(change.diff)
    const pctStr = `${change.percentageChange >= 0 ? '+' : ''}${change.percentageChange}%`

    const colorizedChange = colorizeChange(change)
    const colorizedDiff = colorizeValue(diffStr, change.direction)
    const colorizedPct = colorizeValue(pctStr, change.direction)

    lines.push(
      padRight(colorizedChange, metricCol) +
        '  ' +
        padLeft(String(change.from), fromCol) +
        '  ' +
        padLeft(String(change.to), toCol) +
        '  ' +
        padLeft(colorizedDiff, changeCol) +
        '  ' +
        padLeft(colorizedPct, pctCol),
    )
  }

  // File changes
  const hasFileChanges = diff.newFiles.length > 0 || diff.removedFiles.length > 0 || diff.modifiedFiles.length > 0
  if (hasFileChanges) {
    lines.push('', chalk.bold('File Changes:'))

    if (diff.newFiles.length > 0) {
      lines.push(chalk.green(`  Added (${diff.newFiles.length}):`))
      for (const f of diff.newFiles) {
        lines.push(chalk.green(`    + ${f}`))
      }
    }

    if (diff.removedFiles.length > 0) {
      lines.push(chalk.red(`  Removed (${diff.removedFiles.length}):`))
      for (const f of diff.removedFiles) {
        lines.push(chalk.red(`    - ${f}`))
      }
    }

    if (diff.modifiedFiles.length > 0) {
      lines.push(chalk.yellow(`  Modified (${diff.modifiedFiles.length}):`))
      for (const f of diff.modifiedFiles) {
        lines.push(chalk.yellow(`    ~ ${f}`))
      }
    }
  }

  lines.push('', chalk.bold('Summary: '), `  ${diff.summary}`)

  return lines.join('\n')
}

function colorizeChange(change: MetricChange): string {
  const label = formatMetricLabel(change.metric)
  if (change.direction === 'up') return label
  if (change.direction === 'down') return label
  return chalk.dim(label)
}

function colorizeValue(value: string, direction: MetricChange['direction']): string {
  if (direction === 'up') return chalk.green(value)
  if (direction === 'down') return chalk.red(value)
  return chalk.dim(value)
}

function formatMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    averageFileSize: 'Avg File Size',
    classes: 'Classes',
    emptyFiles: 'Empty Files',
    exports: 'Exports',
    fixmes: 'FIXMEs',
    functions: 'Functions',
    hacks: 'HACKs',
    maxFileSize: 'Max File Size',
    todos: 'TODOs',
    totalFiles: 'Total Files',
    totalLines: 'Total Lines',
    totalSize: 'Total Size',
  }
  return labels[metric] ?? metric
}

// ─── formatSnapshotJson ─────────────────────────────────

/**
 * Format snapshot data as pretty JSON.
 *
 * @example
 * ```ts
 * const output = formatSnapshotJson(snapshot)
 * console.log(output)
 * ```
 */
export function formatSnapshotJson(data: Snapshot | SnapshotDiff | SnapshotListItem[]): string {
  return JSON.stringify(data, null, 2)
}
