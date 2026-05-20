import chalk from 'chalk'
import type {
  Thread,
  WeavePattern,
  WeftInspection,
  TapestryWeaverStats,
  TapestryWeaverResult,
} from './tapestry-weaver-helpers.js'

// ─── Thread Formatting ────────────────────────────────────────────────────────

/**
 * Format thread type with icon
 * @example
 * formatThreadType('import') // '→ import'
 */
export function formatThreadType(type: Thread['type']): string {
  const map: Record<Thread['type'], string> = {
    'import': '→', 'export': '←', 'function-call': '⚡',
    'type-reference': '◆', 'data-flow': '◈',
  }
  return `${map[type]} ${type}`
}

/**
 * Format a thread status indicators
 * @example
 * formatThreadStatus(thread) // '✗ loose'
 */
export function formatThreadStatus(thread: Thread): string {
  const parts: string[] = []
  if (thread.isLoose) parts.push(chalk.yellow('loose'))
  if (thread.isBroken) parts.push(chalk.red('broken'))
  if (thread.isTangled) parts.push(chalk.magenta('tangled'))
  return parts.length > 0 ? parts.join(' ') : chalk.green('ok')
}

/**
 * Format a single thread
 * @example
 * formatThread(thread) // '→ import  a.ts → ./foo  x, y  ok'
 */
export function formatThread(thread: Thread): string {
  const type = formatThreadType(thread.type).padEnd(20)
  const status = formatThreadStatus(thread)
  const tension = thread.tension >= 40 && thread.tension <= 60
    ? chalk.green(`tension:${thread.tension}`)
    : chalk.yellow(`tension:${thread.tension}`)
  return `${type} ${chalk.cyan(thread.source.padEnd(25))} → ${thread.target.padEnd(15)} ${thread.material.padEnd(15)} ${tension}  ${status}`
}

// ─── Weave Pattern Formatting ─────────────────────────────────────────────────

/**
 * Format weave pattern quality with color
 * @example
 * formatPatternQuality('masterwork') // green 'MASTERWORK'
 */
export function formatPatternQuality(quality: WeavePattern['quality']): string {
  const colors: Record<WeavePattern['quality'], (s: string) => string> = {
    masterwork: chalk.green, fine: chalk.rgb(100, 200, 100),
    standard: chalk.yellow, rough: chalk.rgb(255, 165, 0), unraveling: chalk.red,
  }
  return colors[quality](quality.toUpperCase())
}

/**
 * Format a single weave pattern
 * @example
 * formatWeavePattern(pattern) // '◆ plain-weave  MASTERWORK  consistency: 80'
 */
export function formatWeavePattern(pattern: WeavePattern): string {
  const quality = formatPatternQuality(pattern.quality)
  return `${chalk.magenta('◆')} ${chalk.bold(pattern.name.padEnd(15))} ${quality.padEnd(15)} consistency:${pattern.consistency}  files:${pattern.files.length}`
}

// ─── Weft Inspection Formatting ───────────────────────────────────────────────

/**
 * Format weft quality with color
 * @example
 * formatWeftQuality('pristine') // green 'PRISTINE'
 */
export function formatWeftQuality(quality: WeftInspection['overallQuality']): string {
  const colors: Record<WeftInspection['overallQuality'], (s: string) => string> = {
    pristine: chalk.green, tight: chalk.rgb(100, 200, 100),
    balanced: chalk.cyan, loose: chalk.yellow, frayed: chalk.red,
  }
  return colors[quality](quality.toUpperCase())
}

/**
 * Format a single weft inspection
 * @example
 * formatWeftInspection(inspection) // multi-line
 */
export function formatWeftInspection(insp: WeftInspection): string {
  const quality = formatWeftQuality(insp.overallQuality)
  const issues: string[] = []
  if (insp.brokenThreads > 0) issues.push(`${insp.brokenThreads} broken`)
  if (insp.looseThreads > 0) issues.push(`${insp.looseThreads} loose`)
  if (insp.tangledThreads > 0) issues.push(`${insp.tangledThreads} tangled`)
  const issueStr = issues.length > 0 ? chalk.red(` [${issues.join(', ')}]`) : ''
  return `${chalk.cyan(insp.file.padEnd(30))} ${quality.padEnd(15)} threads:${insp.threadCount} density:${insp.weaveDensity} pattern:${insp.pattern}${issueStr}`
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format overall weave with color
 * @example
 * formatOverallWeave('masterwork') // green 'MASTERWORK'
 */
export function formatOverallWeave(weave: TapestryWeaverStats['overallWeave']): string {
  const colors: Record<TapestryWeaverStats['overallWeave'], (s: string) => string> = {
    'masterwork': chalk.green, 'fine-craft': chalk.rgb(100, 200, 100),
    'handwoven': chalk.cyan, 'machine-made': chalk.yellow, 'unraveled': chalk.red,
  }
  return colors[weave](weave.toUpperCase().replace('-', ' '))
}

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: TapestryWeaverStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       TAPESTRY WEAVER SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Total Threads:')}         ${stats.totalThreads}`,
    `${chalk.bold('Imports / Exports:')}     ${stats.importThreads} / ${stats.exportThreads}`,
    `${chalk.bold('Calls / Types:')}         ${stats.callThreads} / ${stats.typeThreads}`,
    '',
    `${chalk.bold('Loose Threads:')}         ${stats.looseThreads}`,
    `${chalk.bold('Broken Threads:')}        ${stats.brokenThreads}`,
    `${chalk.bold('Tangled Threads:')}       ${stats.tangledThreads}`,
    '',
    `${chalk.bold('Patterns:')}              ${stats.totalPatterns} (${stats.masterworkPatterns} masterwork, ${stats.unravelingPatterns} unraveling)`,
    `${chalk.bold('Avg Tension:')}           ${stats.avgTension}`,
    `${chalk.bold('Avg Density:')}           ${stats.avgDensity}`,
    `${chalk.bold('Thread Quality:')}        ${stats.avgThreadQuality}%`,
    '',
    `${chalk.bold('Ideal / Over / Under:')}  ${stats.idealTensionFiles} / ${stats.overTensionFiles} / ${stats.underTensionFiles}`,
    `${chalk.bold('Weave Quality:')}         ${stats.weaveQuality}/100`,
    `${chalk.bold('Overall Weave:')}         ${formatOverallWeave(stats.overallWeave)}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — the tapestry is well-woven!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format the complete tapestry weaver result
 * @example
 * formatTapestryWeaverResult(result) // full formatted string
 */
export function formatTapestryWeaverResult(result: TapestryWeaverResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Weft Inspections ──'),
    result.inspections.map(formatWeftInspection).join('\n'),
    '',
    chalk.bold('── Weave Patterns ──'),
    result.patterns.map(formatWeavePattern).join('\n'),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format tapestry weaver result as JSON string
 * @example
 * formatTapestryWeaverJson(result) // '{"threads":[...],...}'
 */
export function formatTapestryWeaverJson(result: TapestryWeaverResult): string {
  return JSON.stringify(result, null, 2)
}
