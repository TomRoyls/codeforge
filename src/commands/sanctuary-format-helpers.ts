import chalk from 'chalk'

import type {
  EndangeredPattern,
  OverallSafety,
  Protection,
  RiskLevel,
  SafetyZone,
  SanctuaryResult,
  SanctuaryStats,
  Threat,
  ZoneClassification,
} from './sanctuary-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const ZONE_COLOR: Record<ZoneClassification, (s: string) => string> = {
  sanctuary: chalk.rgb(72, 199, 142),
  protected: chalk.rgb(100, 200, 180),
  natural: chalk.rgb(200, 200, 80),
  wild: chalk.rgb(220, 150, 80),
  danger: chalk.rgb(220, 80, 80),
}

const SAFETY_COLOR: Record<OverallSafety, (s: string) => string> = {
  fortress: chalk.rgb(72, 199, 142),
  secure: chalk.rgb(100, 200, 180),
  guarded: chalk.rgb(200, 200, 80),
  exposed: chalk.rgb(220, 150, 80),
  dangerous: chalk.rgb(220, 80, 80),
}

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
  low: chalk.rgb(100, 200, 180),
  medium: chalk.rgb(200, 200, 80),
  high: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const RISK_COLOR: Record<RiskLevel, (s: string) => string> = {
  stable: chalk.rgb(72, 199, 142),
  watch: chalk.rgb(100, 200, 180),
  vulnerable: chalk.rgb(200, 200, 80),
  endangered: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

// ─── Labels ────────────────────────────────────────────────────────────────────

/**
 * Format zone classification label.
 *
 * @example
 * formatZoneLabel('sanctuary') // => colored string
 */
export function formatZoneLabel(classification: ZoneClassification): string {
  return (ZONE_COLOR[classification] ?? ((s: string) => s))(classification)
}

/**
 * Format overall safety label.
 *
 * @example
 * formatSafetyLabel('fortress') // => colored string
 */
export function formatSafetyLabel(safety: OverallSafety): string {
  return (SAFETY_COLOR[safety] ?? ((s: string) => s))(safety)
}

/**
 * Format threat severity label.
 *
 * @example
 * formatSeverityLabel('high') // => colored string
 */
export function formatSeverityLabel(severity: string): string {
  return (SEVERITY_COLOR[severity] ?? ((s: string) => s))(severity)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a safety gauge.
 *
 * @example
 * formatSafetyGauge(85) // => gauge string
 */
export function formatSafetyGauge(value: number, width: number = 15): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Zones ─────────────────────────────────────────────────────────────────────

/**
 * Format safety zones table.
 *
 * @example
 * formatZones(zones) // => zones table
 */
export function formatZones(zones: SafetyZone[]): string {
  const header = chalk.bold('Safety Zones')
  const separator = '\u2500'.repeat(85)

  if (zones.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]
  for (const z of zones) {
    const label = formatZoneLabel(z.classification)
    lines.push(`${chalk.cyan(z.file.padEnd(35))} ${label.padEnd(12)} score:${z.safetyScore}  type:${z.typeSafety}  prot:${z.protections.length}  threat:${z.threats.length}`)
  }

  return lines.join('\n')
}

// ─── Protections ───────────────────────────────────────────────────────────────

/**
 * Format protection list.
 *
 * @example
 * formatProtections(protections) // => protection report
 */
export function formatProtections(protections: Protection[]): string {
  const header = chalk.bold('Protections')
  const separator = '\u2500'.repeat(65)

  if (protections.length === 0) {
    return `${header}\n${separator}\nNo protections detected.`
  }

  const lines = [header, separator]
  for (const p of protections) {
    lines.push(`${chalk.cyan(p.type.padEnd(20))} L${String(p.location).padEnd(4)} ${p.strength.padEnd(10)} ${p.description}`)
  }

  return lines.join('\n')
}

// ─── Threats ───────────────────────────────────────────────────────────────────

/**
 * Format threat list.
 *
 * @example
 * formatThreats(threats) // => threat report
 */
export function formatThreats(threats: Threat[]): string {
  const header = chalk.bold('Threats')
  const separator = '\u2500'.repeat(70)

  if (threats.length === 0) {
    return `${header}\n${separator}\nNo threats detected.`
  }

  const lines = [header, separator]
  for (const t of threats) {
    const sevLabel = formatSeverityLabel(t.severity)
    lines.push(`${sevLabel.padEnd(12)} ${t.type.padEnd(20)} L${t.location}  ${t.description}`)
  }

  return lines.join('\n')
}

// ─── Endangered Patterns ───────────────────────────────────────────────────────

/**
 * Format endangered patterns.
 *
 * @example
 * formatEndangeredPatterns(patterns) // => pattern report
 */
export function formatEndangeredPatterns(patterns: EndangeredPattern[]): string {
  const header = chalk.bold('Endangered Patterns')
  const separator = '\u2500'.repeat(65)

  if (patterns.length === 0) {
    return `${header}\n${separator}\nNo endangered patterns detected.`
  }

  const lines = [header, separator]
  for (const p of patterns) {
    const riskLabel = (RISK_COLOR[p.riskLevel] ?? ((s: string) => s))(p.riskLevel)
    const protStatus = p.hasProtection ? chalk.rgb(72, 199, 142)('protected') : chalk.rgb(220, 80, 80)('unprotected')
    lines.push(`${chalk.cyan(p.pattern.padEnd(20))} ${riskLabel.padEnd(14)} files:${p.files.length}  ${protStatus}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format sanctuary stats summary.
 *
 * @example
 * formatSanctuaryStats(stats) // => stats summary
 */
export function formatSanctuaryStats(stats: SanctuaryStats): string {
  const header = chalk.bold('Sanctuary Analysis')
  const separator = '\u2500'.repeat(60)
  const safety = formatSafetyLabel(stats.overallSafety)

  return [
    header,
    separator,
    `Zones:             ${stats.totalZones} (sanctuary:${stats.sanctuaryZones} protected:${stats.protectedZones} wild:${stats.wildZones} danger:${stats.dangerZones})`,
    `Protections:       ${stats.totalProtections}`,
    `Threats:           ${stats.totalThreats} (critical:${stats.criticalThreats})`,
    `Endangered:        ${stats.endangeredCount} (critical patterns:${stats.criticalCount})`,
    separator,
    `Safety Score:      ${formatSafetyGauge(stats.avgSafetyScore)}`,
    `Type Safety:       ${formatSafetyGauge(stats.avgTypeSafety)}`,
    `Validation:        ${formatSafetyGauge(stats.avgValidationCoverage)}`,
    `Defensive:         ${formatSafetyGauge(stats.avgDefensiveScore)}`,
    separator,
    `Sanctuary Index:   ${stats.sanctuaryIndex}`,
    `Threat Density:    ${stats.threatDensity} per 100 lines`,
    `Protection Ratio:  ${stats.protectionRatio}`,
    `Overall Safety:    ${safety}`,
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
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Code is well-protected!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full sanctuary table output.
 *
 * @example
 * formatSanctuaryTable(result) // => full table string
 */
export function formatSanctuaryTable(result: SanctuaryResult): string {
  const allProtections = result.zones.flatMap(z => z.protections)
  const allThreats = result.zones.flatMap(z => z.threats)

  return [
    formatSanctuaryStats(result.stats),
    '',
    formatZones(result.zones),
    '',
    formatEndangeredPatterns(result.endangeredPatterns),
    '',
    formatProtections(allProtections.slice(0, 20)),
    '',
    formatThreats(allThreats.slice(0, 20)),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format sanctuary result as JSON.
 *
 * @example
 * formatSanctuaryJson(result) // => JSON string
 */
export function formatSanctuaryJson(result: SanctuaryResult): string {
  return JSON.stringify(result, null, 2)
}
