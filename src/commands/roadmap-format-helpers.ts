import chalk from 'chalk'

import type { RoadmapPhase, RoadmapResult, RoadmapStats, TimelineEntry } from './roadmap-helpers.js'

// ─── priorityColor ──────────────────────────────────────

/**
 * @example
 * const text = priorityColor('critical')
 * console.log(text)
 */
export function priorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return chalk.red.bold('●')
    case 'high': return chalk.rgb(255, 165, 0)('●')
    case 'medium': return chalk.yellow('●')
    case 'low': return chalk.gray('●')
    default: return '○'
  }
}

// ─── effortBar ──────────────────────────────────────────

/**
 * @example
 * const bar = effortBar(8, 20)
 * console.log(bar)
 */
export function effortBar(effort: number, maxEffort: number): string {
  const width = 20
  const filled = Math.round((effort / Math.max(maxEffort, 1)) * width)
  const bar = '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(width - filled, 0))
  return `${bar} ${effort}h`
}

// ─── formatPhase ────────────────────────────────────────

/**
 * @example
 * const text = formatPhase(phase)
 * console.log(text.length)
 */
export function formatPhase(phase: RoadmapPhase): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline(phase.name))
  lines.push(chalk.gray(phase.description))
  lines.push('')

  for (const item of phase.items) {
    const dot = priorityColor(item.priority)
    lines.push(`  ${dot} ${chalk.bold(item.title)}`)
    lines.push(`    ${chalk.gray(item.description)}`)
    lines.push(`    ${chalk.gray('Effort:')} ${item.effort}h  ${chalk.gray('Impact:')} ${item.impact}/10`)
    if (item.files.length > 0) {
      lines.push(`    ${chalk.gray('Files:')} ${item.files.join(', ')}`)
    }
  }

  lines.push('')
  lines.push(`  ${chalk.cyan('Total effort:')} ${phase.totalEffort}h (${phase.items.length} items)`)
  return lines.join('\n')
}

// ─── formatTimeline ─────────────────────────────────────

/**
 * @example
 * const text = formatTimeline(entries)
 * console.log(text.split('\n').length)
 */
export function formatTimeline(entries: TimelineEntry[]): string {
  if (entries.length === 0) return chalk.gray('No timeline entries')

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Timeline'))
  lines.push('')

  for (const entry of entries) {
    lines.push(`  ${chalk.cyan(`Week ${entry.week}`)}: ${entry.effort}h — ${entry.description.slice(0, 80)}`)
  }

  return lines.join('\n')
}

// ─── formatStats ────────────────────────────────────────

/**
 * @example
 * const text = formatStats(stats)
 * console.log(text)
 */
export function formatStats(stats: RoadmapStats): string {
  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold.underline('Summary'))
  lines.push(`  Total items: ${stats.totalItems}`)
  lines.push(`  Total effort: ${stats.totalEffort}h`)
  lines.push(`  Critical items: ${stats.criticalItems}`)

  const cats = Object.entries(stats.byCategory)
  if (cats.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  By Category:'))
    for (const [cat, count] of cats) {
      lines.push(`    ${cat}: ${count}`)
    }
  }

  const pris = Object.entries(stats.byPriority)
  if (pris.length > 0) {
    lines.push('')
    lines.push(chalk.bold('  By Priority:'))
    for (const [pri, count] of pris) {
      lines.push(`    ${priorityColor(pri)} ${pri}: ${count}`)
    }
  }

  return lines.join('\n')
}

// ─── formatRoadmapTable ─────────────────────────────────

/**
 * @example
 * const text = formatRoadmapTable(result)
 * console.log(text.length)
 */
export function formatRoadmapTable(result: RoadmapResult): string {
  const parts: string[] = []

  for (const phase of result.phases) {
    parts.push(formatPhase(phase))
  }

  parts.push(formatTimeline(result.timeline))
  parts.push(formatStats(result.stats))
  parts.push('')

  return parts.join('\n')
}

// ─── formatRoadmapJson ──────────────────────────────────

/**
 * @example
 * const json = formatRoadmapJson(result)
 * console.log(JSON.parse(json).phases.length)
 */
export function formatRoadmapJson(result: RoadmapResult): string {
  return JSON.stringify(result, null, 2)
}
