import chalk from 'chalk'

import type { FileChangeEvent, WatchConfig, WatchSummary } from './watch-live-helpers.js'

// ─── Event type colors ──────────────────────────────────

function eventIcon(type: FileChangeEvent['type']): string {
  switch (type) {
    case 'created': return chalk.green('+')
    case 'modified': return chalk.rgb(255, 165, 0)('M')
    case 'deleted': return chalk.red('-')
  }
}

function eventLabel(type: FileChangeEvent['type']): string {
  switch (type) {
    case 'created': return chalk.green('created')
    case 'modified': return chalk.rgb(255, 165, 0)('modified')
    case 'deleted': return chalk.red('deleted')
  }
}

// ─── formatChangeEvent ──────────────────────────────────

/**
 * Format a single file change event for display.
 *
 * @example
 * ```ts
 * formatChangeEvent(event)
 * ```
 */
export function formatChangeEvent(event: FileChangeEvent): string {
  const icon = eventIcon(event.type)
  const label = eventLabel(event.type)
  const time = chalk.gray(event.timestamp.split('T')[1]?.substring(0, 8) ?? '')
  return `${icon} ${time} ${label.padEnd(10)} ${chalk.white(event.file)}`
}

// ─── formatWatchHeader ──────────────────────────────────

/**
 * Format the initial watch header for display.
 *
 * @example
 * ```ts
 * formatWatchHeader(config)
 * ```
 */
export function formatWatchHeader(config: WatchConfig): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold('  Watching for changes...'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push(`  Path:      ${chalk.white(config.path)}`)
  lines.push(`  Ext:       ${chalk.cyan(config.extensions.join(', '))}`)
  lines.push(`  Debounce:  ${chalk.white(String(config.debounceMs))}ms`)
  if (config.command) {
    lines.push(`  Command:   ${chalk.yellow(config.command)}`)
  }
  lines.push(`  Ignore:    ${chalk.gray(config.ignorePatterns.join(', '))}`)
  lines.push('')
  lines.push(chalk.gray('  Press Ctrl+C to stop'))
  lines.push('')
  return lines.join('\n')
}

// ─── formatWatchSummary ─────────────────────────────────

/**
 * Format a watch session summary.
 *
 * @example
 * ```ts
 * formatWatchSummary(summary)
 * ```
 */
export function formatWatchSummary(summary: WatchSummary): string {
  const lines: string[] = []
  const { session, eventsByType, topChangedFiles, eventsPerMinute } = summary

  lines.push('')
  lines.push(chalk.bold('  Watch Summary'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push(`  Duration:  ${chalk.white(session.startTime)} → now`)
  lines.push(`  Events:    ${chalk.white(String(session.totalEvents))}`)
  lines.push(`  Rate:      ${chalk.cyan(`${eventsPerMinute}/min`)}`)
  lines.push('')

  lines.push(chalk.bold('  By Type'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push(`  ${chalk.green('+ Created:')}  ${eventsByType.created}`)
  lines.push(`  ${chalk.rgb(255, 165, 0)('M Modified:')} ${eventsByType.modified}`)
  lines.push(`  ${chalk.red('- Deleted:')}  ${eventsByType.deleted}`)
  lines.push('')

  if (topChangedFiles.length > 0) {
    lines.push(chalk.bold('  Top Changed Files'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const entry of topChangedFiles) {
      lines.push(`  ${chalk.white(entry.file)} ${chalk.cyan(`(${entry.changes})`)}`)
    }
    lines.push('')
  }

  const exts = Object.entries(summary.eventsByExtension)
  if (exts.length > 0) {
    lines.push(chalk.bold('  By Extension'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const [ext, count] of exts) {
      lines.push(`  ${chalk.white(ext.padEnd(8))} ${chalk.cyan(String(count))}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
