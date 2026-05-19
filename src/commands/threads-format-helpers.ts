import chalk from 'chalk'
import type { AsyncPattern, AsyncAntiPattern, AsyncStats, ThreadsResult } from './threads-helpers.js'

// ─── Type Icons ───────────────────────────────────────────────────────────────

export function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    'async-function': chalk.rgb(100, 200, 255)('⚡'),
    promise: chalk.rgb(180, 130, 255)('⟳'),
    callback: chalk.rgb(255, 200, 100)('↻'),
    'event-handler': chalk.rgb(130, 255, 180)('◉'),
    timer: chalk.rgb(255, 150, 100)('⏱'),
    generator: chalk.rgb(200, 200, 255)('⚡'),
    stream: chalk.rgb(100, 180, 255)('≋'),
  }
  return icons[type] ?? chalk.white('•')
}

export function complexityBadge(level: string): string {
  const colors: Record<string, (s: string) => string> = {
    simple: chalk.rgb(100, 200, 100),
    moderate: chalk.rgb(255, 215, 0),
    complex: chalk.rgb(255, 80, 80),
  }
  return (colors[level] ?? chalk.white)(level)
}

export function severityBadge(severity: string): string {
  if (severity === 'error') return chalk.rgb(255, 50, 50).bold('[ERROR]')
  return chalk.rgb(255, 200, 50)('[WARN]')
}

// ─── Error Handling Meter ─────────────────────────────────────────────────────

export function errorHandlingMeter(rate: number): string {
  const filled = Math.round((rate / 100) * 15)
  const empty = 15 - filled
  const color = rate >= 80 ? chalk.rgb(100, 220, 100)
    : rate >= 50 ? chalk.rgb(255, 215, 0)
    : chalk.rgb(255, 80, 80)
  const bar = color('█'.repeat(filled)) + chalk.rgb(60, 60, 60)('░'.repeat(empty))
  return `${bar} ${rate}%`
}

// ─── Pattern Formatting ───────────────────────────────────────────────────────

export function formatPatternRow(pattern: AsyncPattern): string {
  const icon = typeIcon(pattern.type)
  const type = chalk.rgb(180, 180, 180)(pattern.type.padEnd(15))
  const file = chalk.rgb(150, 150, 150)(`${pattern.file}:${pattern.line}`)
  const complexity = complexityBadge(pattern.complexity)
  const error = pattern.hasErrorHandling ? chalk.rgb(100, 200, 100)('✓') : chalk.rgb(255, 80, 80)('✗')
  const code = chalk.rgb(140, 140, 140)(pattern.code.substring(0, 50))
  return `${icon} ${type} ${file} ${complexity} err:${error}  ${code}`
}

export function formatPatternTable(patterns: AsyncPattern[]): string {
  const header = [
    chalk.bold(''),
    chalk.bold('Type'.padEnd(15)),
    chalk.bold('Location'),
    chalk.bold('Complexity'),
    chalk.bold('Err'),
    chalk.bold('Code'),
  ].join(' ')

  const rows = patterns.map(formatPatternRow)
  return [header, ...rows].join('\n')
}

// ─── Anti-Pattern Formatting ──────────────────────────────────────────────────

export function formatAntiPatternRow(anti: AsyncAntiPattern): string {
  const sev = severityBadge(anti.severity)
  const type = chalk.rgb(180, 180, 180)(anti.type.padEnd(28))
  const loc = chalk.rgb(150, 150, 150)(`${anti.file}:${anti.line}`)
  const desc = chalk.rgb(200, 200, 200)(anti.description)
  return `${sev} ${type} ${loc} ${desc}`
}

export function formatAntiPatternTable(antiPatterns: AsyncAntiPattern[]): string {
  if (antiPatterns.length === 0) {
    return chalk.rgb(100, 200, 100)('No anti-patterns detected')
  }

  const header = [
    chalk.bold('Severity'),
    chalk.bold('Type'.padEnd(28)),
    chalk.bold('Location'),
    chalk.bold('Description'),
  ].join(' ')

  const rows = antiPatterns.map(formatAntiPatternRow)
  return [header, ...rows].join('\n')
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

export function formatSuggestions(antiPatterns: AsyncAntiPattern[]): string {
  if (antiPatterns.length === 0) return ''
  const lines: string[] = [chalk.bold('Suggestions')]
  const seen = new Set<string>()
  for (const anti of antiPatterns) {
    if (seen.has(anti.suggestion)) continue
    seen.add(anti.suggestion)
    lines.push(`  ${chalk.rgb(255, 220, 150)('→')} ${anti.suggestion}`)
  }
  return lines.join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

export function formatStats(stats: AsyncStats): string {
  const lines = [
    chalk.bold('Async Pattern Statistics'),
    `  Async Functions:   ${stats.totalAsyncFunctions}`,
    `  Promises:          ${stats.totalPromises}`,
    `  Callbacks:         ${stats.totalCallbacks}`,
    `  Event Handlers:    ${stats.totalEventHandlers}`,
    `  Timers:            ${stats.totalTimers}`,
    `  Generators:        ${stats.totalGenerators}`,
    `  Anti-Patterns:     ${stats.antiPatternCount > 0 ? chalk.rgb(255, 100, 100)(String(stats.antiPatternCount)) : chalk.rgb(100, 200, 100)('0')}`,
    `  Error Handling:    ${errorHandlingMeter(stats.errorHandlingRate)}`,
    `  Average Nesting:   ${stats.averageNesting}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function formatRecommendations(recommendations: string[]): string {
  const lines = [chalk.bold('Recommendations')]
  recommendations.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${chalk.rgb(255, 220, 150)(r)}`)
  })
  return lines.join('\n')
}

// ─── Full Report ──────────────────────────────────────────────────────────────

export function formatThreadsReport(result: ThreadsResult): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')

  if (result.patterns.length > 0) {
    sections.push(chalk.bold('Async Patterns'))
    sections.push(formatPatternTable(result.patterns))
    sections.push('')
  }

  sections.push(chalk.bold('Anti-Patterns'))
  sections.push(formatAntiPatternTable(result.antiPatterns))
  sections.push('')

  if (result.antiPatterns.length > 0) {
    sections.push(formatSuggestions(result.antiPatterns))
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

export function formatThreadsJson(result: ThreadsResult): string {
  return JSON.stringify(result, null, 2)
}
