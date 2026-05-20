import chalk from 'chalk'
import type {
  TemporalPattern,
  TemporalFile,
  TemporalAnomaly,
  ChronometerStats,
  ChronometerResult,
} from './chronometer-helpers.js'

// ─── Pattern Formatting ────────────────────────────────────────────────────────

/**
 * Format pattern type with color
 * @example
 * formatPatternType('sequential') // blue 'SEQUENTIAL'
 */
export function formatPatternType(type: TemporalPattern['type']): string {
  const colors: Record<TemporalPattern['type'], (s: string) => string> = {
    sequential: chalk.blue, parallel: chalk.green, 'async-chain': chalk.cyan,
    'callback-pyramid': chalk.red, 'promise-race': chalk.yellow, timeout: chalk.magenta,
    interval: chalk.rgb(200, 100, 200), 'event-driven': chalk.rgb(100, 200, 200),
    'synchronous-block': chalk.rgb(255, 165, 0),
  }
  return colors[type](type.toUpperCase())
}

/**
 * Format risk level with color
 * @example
 * formatRisk('dangerous') // red 'DANGEROUS'
 */
export function formatRisk(risk: TemporalPattern['risk']): string {
  const colors: Record<TemporalPattern['risk'], (s: string) => string> = {
    safe: chalk.green, caution: chalk.yellow, risky: chalk.rgb(255, 165, 0), dangerous: chalk.red,
  }
  return colors[risk](risk.toUpperCase())
}

/**
 * Format a single temporal pattern
 * @example
 * formatPattern(pattern) // '◆ sequential  L12  SAFE'
 */
export function formatPattern(p: TemporalPattern): string {
  const type = formatPatternType(p.type)
  const risk = formatRisk(p.risk)
  return `${chalk.magenta('◆')} ${type.padEnd(22)} L${String(p.location).padStart(3)}  ${risk.padEnd(12)} ${p.description}`
}

/**
 * Format all patterns
 * @example
 * formatPatterns(patterns) // multi-line
 */
export function formatPatterns(patterns: TemporalPattern[]): string {
  if (patterns.length === 0) return chalk.gray('No temporal patterns detected.')
  return patterns.map(formatPattern).join('\n')
}

// ─── File Classification Formatting ───────────────────────────────────────────

/**
 * Format file classification with color
 * @example
 * formatFileClassification('clockwork') // green 'CLOCKWORK'
 */
export function formatFileClassification(cls: TemporalFile['classification']): string {
  const colors: Record<TemporalFile['classification'], (s: string) => string> = {
    clockwork: chalk.green, flowing: chalk.cyan, erratic: chalk.rgb(255, 165, 0), frozen: chalk.blue, racing: chalk.red,
  }
  return colors[cls](cls.toUpperCase())
}

/**
 * Format a single temporal file
 * @example
 * formatTemporalFile(file) // '◆ src/a.ts  CLOCKWORK  async:80  complexity:20'
 */
export function formatTemporalFile(f: TemporalFile): string {
  const cls = formatFileClassification(f.classification)
  const asyncBar = formatMiniBar(f.asyncScore)
  const timeoutBar = formatMiniBar(f.timeoutHandling)
  return `${chalk.magenta('◆')} ${chalk.cyan(f.file.padEnd(30))} ${cls.padEnd(14)} async:${asyncBar} timeout:${timeoutBar} complexity:${f.temporalComplexity}`
}

/**
 * Format a mini score bar
 * @example
 * formatMiniBar(75) // '███████░░░'
 */
export function formatMiniBar(score: number): string {
  const filled = Math.round(score / 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  if (score >= 70) return chalk.green(bar)
  if (score >= 40) return chalk.yellow(bar)
  return chalk.red(bar)
}

/**
 * Format temporal files section
 * @example
 * formatTemporalFiles(files) // multi-line
 */
export function formatTemporalFiles(files: TemporalFile[]): string {
  if (files.length === 0) return chalk.gray('No files analyzed.')
  return files.map(formatTemporalFile).join('\n')
}

// ─── Anomaly Formatting ────────────────────────────────────────────────────────

/**
 * Format anomaly severity with color
 * @example
 * formatAnomalySeverity('critical') // red 'CRITICAL'
 */
export function formatAnomalySeverity(severity: TemporalAnomaly['severity']): string {
  const colors: Record<TemporalAnomaly['severity'], (s: string) => string> = {
    low: chalk.blue, medium: chalk.yellow, high: chalk.rgb(255, 165, 0), critical: chalk.red,
  }
  return colors[severity](severity.toUpperCase())
}

/**
 * Format anomaly type with color
 * @example
 * formatAnomalyType('race-condition') // red 'RACE-CONDITION'
 */
export function formatAnomalyType(type: TemporalAnomaly['type']): string {
  const criticals = ['race-condition', 'deadlock-risk', 'zombie-process']
  const highs = ['callback-hell', 'time-bomb']
  if (criticals.includes(type)) return chalk.red(type.toUpperCase())
  if (highs.includes(type)) return chalk.rgb(255, 165, 0)(type.toUpperCase())
  return chalk.yellow(type.toUpperCase())
}

/**
 * Format a single anomaly
 * @example
 * formatAnomaly(anomaly) // '⚠ race-condition  CRITICAL  description'
 */
export function formatAnomaly(a: TemporalAnomaly): string {
  const type = formatAnomalyType(a.type)
  const severity = formatAnomalySeverity(a.severity)
  return `${chalk.yellow('⚠')} ${type.padEnd(22)} ${severity.padEnd(12)} ${a.description}`
}

/**
 * Format anomalies section
 * @example
 * formatAnomalies(anomalies) // multi-line
 */
export function formatAnomalies(anomalies: TemporalAnomaly[]): string {
  if (anomalies.length === 0) return chalk.green('✓ No temporal anomalies detected — code is well-synchronized!')
  return anomalies.map(formatAnomaly).join('\n')
}

// ─── Health Formatting ─────────────────────────────────────────────────────────

/**
 * Format temporal health with color
 * @example
 * formatTemporalHealth('synchronized') // green 'SYNCHRONIZED'
 */
export function formatTemporalHealth(health: ChronometerStats['temporalHealth']): string {
  const colors: Record<ChronometerStats['temporalHealth'], (s: string) => string> = {
    synchronized: chalk.green, flowing: chalk.cyan, turbulent: chalk.yellow, chaotic: chalk.red, frozen: chalk.blue,
  }
  return colors[health](health.toUpperCase())
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: ChronometerStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       CHRONOMETER ANALYSIS SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Total Patterns:')}          ${stats.totalPatterns} (${stats.sequentialPatterns} sequential, ${stats.parallelPatterns} parallel)`,
    `${chalk.bold('Async Chains:')}             ${stats.asyncChains}`,
    `${chalk.bold('Callback Pyramids:')}        ${stats.callbackPyramids}`,
    '',
    `${chalk.bold('Dependencies:')}             ${stats.totalDependencies} (${stats.criticalDependencies} critical, ${stats.implicitDependencies} implicit)`,
    `${chalk.bold('Anomalies:')}                ${stats.totalAnomalies} (${stats.raceConditions} race, ${stats.deadlockRisks} deadlock, ${stats.callbackHells} callback-hell)`,
    '',
    `${chalk.bold('Avg Async Score:')}          ${stats.avgAsyncScore}/100`,
    `${chalk.bold('Avg Timeout Handling:')}     ${stats.avgTimeoutHandling}/100`,
    `${chalk.bold('Avg Temporal Complexity:')}   ${stats.avgTemporalComplexity}/100`,
    '',
    `${chalk.bold('Clockwork Files:')}          ${stats.clockworkFiles}`,
    `${chalk.bold('Erratic Files:')}            ${stats.erraticFiles}`,
    `${chalk.bold('Racing Files:')}             ${stats.racingFiles}`,
    '',
    `${chalk.bold('Chronometer Score:')}        ${stats.chronometerScore}/100`,
    `${chalk.bold('Temporal Health:')}          ${formatTemporalHealth(stats.temporalHealth)}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — temporal flow is optimal!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ───────────────────────────────────────────────────────────────

/**
 * Format the complete chronometer result
 * @example
 * formatChronometerResult(result) // full formatted string
 */
export function formatChronometerResult(result: ChronometerResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Files ──'),
    formatTemporalFiles(result.files),
    '',
    chalk.bold('── Patterns ──'),
    formatPatterns(result.patterns),
    '',
    chalk.bold('── Anomalies ──'),
    formatAnomalies(result.anomalies),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format chronometer result as JSON string
 * @example
 * formatChronometerJson(result) // '{"files":[...],...}'
 */
export function formatChronometerJson(result: ChronometerResult): string {
  return JSON.stringify(result, null, 2)
}
