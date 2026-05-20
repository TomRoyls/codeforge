import chalk from 'chalk'

import type { Chapter, Character, ChronicleResult, ChronicleStats, Event, EventType } from './chronicle-helpers.js'

// ─── Event Type Display ────────────────────────────────────────────────────────

const eventIcon: Record<EventType, string> = {
  founding: '\u{1F3DB}\uFE0F',
  expansion: '\u{1F3D7}\uFE0F',
  war: '\u2694\uFE0F',
  treaty: '\u{1F4DC}',
  plague: '\u{1F9A0}',
  renaissance: '\u{1F3A8}',
  exodus: '\u{1F69B}',
  coronation: '\u{1F451}',
}

const eventColor: Record<EventType, (s: string) => string> = {
  founding: (s: string) => chalk.rgb(255, 215, 0)(s),
  expansion: (s: string) => chalk.rgb(50, 205, 50)(s),
  war: (s: string) => chalk.rgb(255, 50, 50)(s),
  treaty: (s: string) => chalk.rgb(100, 149, 237)(s),
  plague: (s: string) => chalk.rgb(139, 69, 19)(s),
  renaissance: (s: string) => chalk.rgb(186, 85, 211)(s),
  exodus: (s: string) => chalk.rgb(255, 165, 0)(s),
  coronation: (s: string) => chalk.rgb(255, 215, 0)(s),
}

const roleIcon: Record<string, string> = {
  founder: '\u{1F451}',
  architect: '\u{1F3DB}\uFE0F',
  builder: '\u{1F528}',
  guardian: '\u{1F6E1}\uFE0F',
  wanderer: '\u{1F9ED}',
  phantom: '\u{1F47B}',
}

// ─── Chapter Formatting ────────────────────────────────────────────────────────

/**
 * Format a single chapter.
 *
 * @example
 * formatChapter(chapter, 1)
 */
export function formatChapter(chapter: Chapter, index: number): string {
  const lines: string[] = []
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  const numeral = romanNumerals[Math.min(index, romanNumerals.length - 1)] ?? String(index + 1)
  const bar = buildBar(chapter.significance)

  lines.push(`  ${chalk.bold(`Chapter ${numeral}: ${chapter.title}`)}`)
  lines.push(`  Era: ${chalk.rgb(200, 200, 200)(chapter.era)}`)
  lines.push(`  ${chalk.rgb(180, 180, 180)(`"${chapter.narrative}"`)}`)

  const typeCounts = new Map<EventType, number>()
  for (const e of chapter.keyEvents) {
    typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1)
  }
  const summary = [...typeCounts.entries()]
    .map(([type, count]) => `${eventIcon[type]} ${count} ${type}`)
    .join(', ')
  lines.push(`  Key Events: ${summary}`)
  lines.push(`  Characters: ${chapter.characters.join(', ') || 'none'}`)
  lines.push(`  Significance: ${bar} ${chapter.significance}%`)

  return lines.join('\n')
}

function buildBar(value: number): string {
  const filled = Math.round(value / 10)
  const empty = 10 - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Character Formatting ──────────────────────────────────────────────────────

/**
 * Format character roster.
 *
 * @example
 * formatCharacterRoster(characters)
 */
export function formatCharacterRoster(characters: Character[]): string {
  if (characters.length === 0) return '  No characters found\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Character Roster')
  lines.push('  ────────────────────────────────────────────────────')

  const sorted = [...characters].sort((a, b) => b.commits - a.commits)
  for (const c of sorted) {
    const icon = roleIcon[c.role] ?? '\u{1F464}'
    lines.push(`  ${icon} ${chalk.bold(c.name)} \u2014 ${c.role.charAt(0).toUpperCase() + c.role.slice(1)}`)
    lines.push(`    ${c.commits} commits | ${c.linesAdded} added | ${c.linesRemoved} removed`)
    lines.push(`    Active: ${c.activeDays} days`)
  }

  return lines.join('\n')
}

// ─── Timeline Formatting ───────────────────────────────────────────────────────

/**
 * Format event timeline.
 *
 * @example
 * formatTimeline(events)
 */
export function formatTimeline(events: Event[]): string {
  if (events.length === 0) return '  No events recorded\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Event Timeline')
  lines.push('  ────────────────────────────────────────────────────')

  const shown = events.slice(0, 20)
  for (const e of shown) {
    const icon = eventIcon[e.type] ?? '\u{1F4CB}'
    const color = eventColor[e.type] ?? chalk.white
    const date = e.date.substring(0, 10)
    lines.push(`  [${date}] ${icon} ${color(e.type.toUpperCase().padEnd(12))} "${e.description}"  impact: ${e.impact}`)
  }

  if (events.length > 20) {
    lines.push(`  ... and ${events.length - 20} more events`)
  }

  return lines.join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

/**
 * Format chronicle stats.
 *
 * @example
 * formatChronicleStats(stats)
 */
export function formatChronicleStats(stats: ChronicleStats): string {
  const bar = buildBar(stats.narrativeRichness)
  const richnessColor = stats.narrativeRichness >= 60 ? chalk.rgb(50, 205, 50) : stats.narrativeRichness >= 30 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Chronicle Stats')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Chapters:        ${stats.totalChapters}`)
  lines.push(`  Events:          ${stats.totalEvents}`)
  lines.push(`  Characters:      ${stats.totalCharacters}`)
  lines.push(`  Founded:         ${stats.foundingDate.substring(0, 10)}`)
  lines.push(`  Age:             ${stats.currentAge} days`)
  lines.push(`  Total Pages:     ${stats.totalPages}`)
  lines.push(`  Golden Age:      ${stats.goldenAgeChapter}`)
  lines.push(`  Dark Age:        ${stats.darkAgeChapter}`)
  lines.push(`  Richness:        ${richnessColor(`${bar} ${stats.narrativeRichness}%`)}`)
  return lines.join('\n')
}

// ─── Recommendations Formatting ────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatChronicleRecommendations(recs)
 */
export function formatChronicleRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Recommendations')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete chronicle result as table.
 *
 * @example
 * formatChronicleTable(result)
 */
export function formatChronicleTable(result: ChronicleResult): string {
  const parts: string[] = []

  parts.push('  ────────────────────────────────────────────────────')
  parts.push(`  \u{1F4DC} ${chalk.bold(result.title)}`)
  parts.push('  ────────────────────────────────────────────────────')
  parts.push('')

  for (let i = 0; i < result.chapters.length; i++) {
    parts.push(formatChapter(result.chapters[i]!, i))
    parts.push('')
  }

  parts.push(formatCharacterRoster(result.characters))
  parts.push('')
  parts.push(formatTimeline(result.events))
  parts.push('')
  parts.push(formatChronicleStats(result.stats))
  parts.push('')
  parts.push(formatChronicleRecommendations(result.recommendations))

  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format chronicle result as JSON.
 *
 * @example
 * formatChronicleJSON(result)
 */
export function formatChronicleJSON(result: ChronicleResult): string {
  return JSON.stringify(result, null, 2)
}
