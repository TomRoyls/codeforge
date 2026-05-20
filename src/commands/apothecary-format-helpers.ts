import chalk from 'chalk'

import type {
  Ailment,
  ApothecaryResult,
  ApothecaryStats,
  ChronicLevel,
  MedicineCabinet,
  OverallHealth,
  Remedy,
  SpreadRisk,
  Symptom,
} from './apothecary-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const HEALTH_COLOR: Record<OverallHealth, (s: string) => string> = {
  robust: chalk.rgb(72, 199, 142),
  healthy: chalk.rgb(100, 200, 180),
  ailing: chalk.rgb(200, 200, 80),
  sick: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
  mild: chalk.rgb(100, 200, 180),
  moderate: chalk.rgb(200, 200, 80),
  severe: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const CHRONIC_COLOR: Record<ChronicLevel, (s: string) => string> = {
  acute: chalk.rgb(100, 200, 180),
  chronic: chalk.rgb(220, 150, 80),
  terminal: chalk.rgb(220, 80, 80),
}

const SPREAD_COLOR: Record<SpreadRisk, (s: string) => string> = {
  contained: chalk.rgb(72, 199, 142),
  local: chalk.rgb(100, 200, 180),
  systemic: chalk.rgb(220, 150, 80),
  pandemic: chalk.rgb(220, 80, 80),
}

// ─── Labels ────────────────────────────────────────────────────────────────────

/**
 * Format overall health label.
 *
 * @example
 * formatHealthLabel('robust') // => colored string
 */
export function formatHealthLabel(health: OverallHealth): string {
  return (HEALTH_COLOR[health] ?? ((s: string) => s))(health)
}

/**
 * Format severity label.
 *
 * @example
 * formatSeverityLabel('severe') // => colored string
 */
export function formatSeverityLabel(severity: string): string {
  return (SEVERITY_COLOR[severity] ?? ((s: string) => s))(severity)
}

/**
 * Format chronic level label.
 *
 * @example
 * formatChronicLabel('chronic') // => colored string
 */
export function formatChronicLabel(level: ChronicLevel): string {
  return (CHRONIC_COLOR[level] ?? ((s: string) => s))(level)
}

/**
 * Format spread risk label.
 *
 * @example
 * formatSpreadLabel('pandemic') // => colored string
 */
export function formatSpreadLabel(risk: SpreadRisk): string {
  return (SPREAD_COLOR[risk] ?? ((s: string) => s))(risk)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a health gauge.
 *
 * @example
 * formatHealthGauge(75) // => gauge string
 */
export function formatHealthGauge(value: number, width: number = 15): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Symptoms ──────────────────────────────────────────────────────────────────

/**
 * Format symptoms list.
 *
 * @example
 * formatSymptoms(symptoms) // => symptoms report
 */
export function formatSymptoms(symptoms: Symptom[]): string {
  const header = chalk.bold('Symptoms')
  const sep = '\u2500'.repeat(75)

  if (symptoms.length === 0) {
    return `${header}\n${sep}\nNo symptoms detected. Code is healthy!`
  }

  const lines = [header, sep]
  for (const s of symptoms) {
    const sev = formatSeverityLabel(s.severity)
    lines.push(`${sev.padEnd(12)} ${s.category.padEnd(16)} L${s.line}  ${s.name}: ${s.description}`)
  }

  return lines.join('\n')
}

// ─── Ailments ──────────────────────────────────────────────────────────────────

/**
 * Format ailments list.
 *
 * @example
 * formatAilments(ailments) // => ailments report
 */
export function formatAilments(ailments: Ailment[]): string {
  const header = chalk.bold('Ailments')
  const sep = '\u2500'.repeat(70)

  if (ailments.length === 0) {
    return `${header}\n${sep}\nNo ailments diagnosed.`
  }

  const lines = [header, sep]
  for (const a of ailments) {
    const chronic = formatChronicLabel(a.chronicLevel)
    const spread = formatSpreadLabel(a.spreadRisk)
    lines.push(`${chalk.cyan(a.name.padEnd(22))} ${chronic.padEnd(10)} ${spread.padEnd(12)} files:${a.affectedFiles.length}`)
    lines.push(`  ${a.diagnosis}`)
  }

  return lines.join('\n')
}

// ─── Remedies ──────────────────────────────────────────────────────────────────

/**
 * Format remedies list.
 *
 * @example
 * formatRemedies(remedies) // => remedies report
 */
export function formatRemedies(remedies: Remedy[]): string {
  const header = chalk.bold('Remedies')
  const sep = '\u2500'.repeat(70)

  if (remedies.length === 0) {
    return `${header}\n${sep}\nNo remedies needed.`
  }

  const lines = [header, sep]
  for (const r of remedies) {
    lines.push(`${chalk.cyan(r.name.padEnd(25))} eff:${r.effectiveness}%  diff:${r.difficulty}  dose:${r.dosage}`)
    lines.push(`  for: ${r.targetAilment}`)
    lines.push(`  prep: ${r.preparation.slice(0, 2).join(' \u2192 ')}`)
  }

  return lines.join('\n')
}

// ─── Cabinet ───────────────────────────────────────────────────────────────────

/**
 * Format medicine cabinet.
 *
 * @example
 * formatCabinet(cabinet) // => cabinet report
 */
export function formatCabinet(cabinet: MedicineCabinet[]): string {
  const header = chalk.bold('Medicine Cabinet')
  const sep = '\u2500'.repeat(70)

  if (cabinet.length === 0) {
    return `${header}\n${sep}\nNo files analyzed.`
  }

  const lines = [header, sep]
  for (const c of cabinet) {
    const status = c.isWellEquipped ? chalk.rgb(72, 199, 142)('equipped') : chalk.rgb(220, 80, 80)('understocked')
    lines.push(`${chalk.cyan(c.file.padEnd(35))} score:${c.cabinetScore}  ${status}`)
    if (c.existingRemedies.length > 0) {
      lines.push(`  has: ${c.existingRemedies.join(', ')}`)
    }
    if (c.missingRemedies.length > 0) {
      lines.push(`  needs: ${c.missingRemedies.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format apothecary stats.
 *
 * @example
 * formatApothecaryStats(stats) // => stats summary
 */
export function formatApothecaryStats(stats: ApothecaryStats): string {
  const header = chalk.bold('Apothecary Analysis')
  const sep = '\u2500'.repeat(55)
  const health = formatHealthLabel(stats.overallHealth)

  return [
    header, sep,
    `Symptoms:       ${stats.totalSymptoms} (mild:${stats.mildSymptoms} severe:${stats.severeSymptoms} critical:${stats.criticalSymptoms})`,
    `Ailments:       ${stats.totalAilments} (acute:${stats.acuteAilments} chronic:${stats.chronicAilments})`,
    `Remedies:       ${stats.totalRemedies} (easy:${stats.easyRemedies} difficult:${stats.difficultRemedies})`,
    sep,
    `Health Index:   ${formatHealthGauge(stats.healthIndex)}`,
    `Avg Effectiveness: ${stats.avgEffectiveness}%`,
    `Avg Cabinet:    ${formatHealthGauge(stats.avgCabinetScore)}`,
    `Well Equipped:  ${stats.wellEquippedFiles}/${stats.wellEquippedFiles + stats.poorlyEquippedFiles} files`,
    sep,
    `Priority:       ${stats.treatmentPriority}`,
    `Recovery:       ${stats.estimatedRecovery}`,
    `Overall Health: ${health}`,
  ].join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const sep = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${sep}\nNo recommendations. Code is healthy!`
  }

  const lines = [header, sep]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full apothecary table.
 *
 * @example
 * formatApothecaryTable(result) // => full table string
 */
export function formatApothecaryTable(result: ApothecaryResult): string {
  return [
    formatApothecaryStats(result.stats),
    '',
    formatSymptoms(result.symptoms.slice(0, 15)),
    '',
    formatAilments(result.ailments),
    '',
    formatRemedies(result.remedies),
    '',
    formatCabinet(result.cabinet.slice(0, 10)),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format apothecary result as JSON.
 *
 * @example
 * formatApothecaryJson(result) // => JSON string
 */
export function formatApothecaryJson(result: ApothecaryResult): string {
  return JSON.stringify(result, null, 2)
}
