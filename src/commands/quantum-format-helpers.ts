import chalk from 'chalk'

import type {
  Entanglement,
  QuantumHealth,
  QuantumResult,
  QuantumState,
  QuantumStats,
  SuperPosition,
  TunnelingPath,
} from './quantum-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const HEALTH_COLOR: Record<QuantumHealth, (s: string) => string> = {
  deterministic: chalk.rgb(72, 199, 142),
  coherent: chalk.rgb(100, 200, 180),
  uncertain: chalk.rgb(200, 200, 80),
  chaotic: chalk.rgb(220, 150, 80),
  schrodinger: chalk.rgb(220, 80, 80),
}

const TUNNEL_RISK_COLOR: Record<string, (s: string) => string> = {
  safe: chalk.rgb(72, 199, 142),
  unexpected: chalk.rgb(200, 200, 80),
  dangerous: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const ENTANGLEMENT_RISK_COLOR: Record<string, (s: string) => string> = {
  benign: chalk.rgb(72, 199, 142),
  caution: chalk.rgb(200, 200, 80),
  dangerous: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const COLLAPSE_RISK_COLOR: Record<string, (s: string) => string> = {
  none: chalk.rgb(72, 199, 142),
  low: chalk.rgb(100, 200, 180),
  medium: chalk.rgb(200, 200, 80),
  high: chalk.rgb(220, 80, 80),
}

// ─── Labels ────────────────────────────────────────────────────────────────────

/**
 * Format quantum health label.
 *
 * @example
 * formatQuantumHealthLabel('deterministic') // => colored string
 */
export function formatQuantumHealthLabel(health: QuantumHealth): string {
  return (HEALTH_COLOR[health] ?? ((s: string) => s))(health)
}

/**
 * Format tunnel risk label.
 *
 * @example
 * formatTunnelRiskLabel('dangerous') // => colored string
 */
export function formatTunnelRiskLabel(risk: string): string {
  return (TUNNEL_RISK_COLOR[risk] ?? ((s: string) => s))(risk)
}

/**
 * Format entanglement risk label.
 *
 * @example
 * formatEntanglementRiskLabel('critical') // => colored string
 */
export function formatEntanglementRiskLabel(risk: string): string {
  return (ENTANGLEMENT_RISK_COLOR[risk] ?? ((s: string) => s))(risk)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a quantum gauge.
 *
 * @example
 * formatQuantumGauge(75) // => gauge string
 */
export function formatQuantumGauge(value: number, width: number = 15): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── States ────────────────────────────────────────────────────────────────────

/**
 * Format quantum states table.
 *
 * @example
 * formatStates(states) // => states table
 */
export function formatStates(states: QuantumState[]): string {
  const header = chalk.bold('Quantum States')
  const separator = '\u2500'.repeat(80)

  if (states.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]
  for (const s of states) {
    const collapsed = s.isCollapsed ? chalk.rgb(72, 199, 142)('collapsed') : chalk.rgb(220, 150, 80)('uncollapsed')
    lines.push(`${chalk.cyan(s.file.padEnd(35))} unc:${s.uncertainty} coh:${s.coherence} obs:${s.observationEffect} tun:${s.tunnelingRisk}  ${collapsed}`)
  }

  return lines.join('\n')
}

// ─── Superpositions ────────────────────────────────────────────────────────────

/**
 * Format superposition list.
 *
 * @example
 * formatSuperpositions(superpositions) // => superposition report
 */
export function formatSuperpositions(superpositions: SuperPosition[]): string {
  const header = chalk.bold('Superpositions')
  const separator = '\u2500'.repeat(70)

  if (superpositions.length === 0) {
    return `${header}\n${separator}\nNo superpositions detected.`
  }

  const lines = [header, separator]
  for (const sp of superpositions) {
    const collapseColor = COLLAPSE_RISK_COLOR[sp.collapseRisk] ?? ((s: string) => s)
    const state = sp.isCollapsed ? chalk.rgb(72, 199, 142)('collapsed') : 'unified'
    lines.push(`${chalk.cyan(sp.element.padEnd(20))} L${sp.location}  states:${sp.possibleStates.length}  risk:${collapseColor(sp.collapseRisk)}  ${state}`)
  }

  return lines.join('\n')
}

// ─── Entanglements ─────────────────────────────────────────────────────────────

/**
 * Format entanglement list.
 *
 * @example
 * formatEntanglements(entanglements) // => entanglement report
 */
export function formatEntanglements(entanglements: Entanglement[]): string {
  const header = chalk.bold('Entanglements')
  const separator = '\u2500'.repeat(75)

  if (entanglements.length === 0) {
    return `${header}\n${separator}\nNo entanglements detected.`
  }

  const lines = [header, separator]
  for (const e of entanglements) {
    const riskLabel = formatEntanglementRiskLabel(e.risk)
    const quantum = e.isQuantum ? chalk.rgb(220, 80, 80)('quantum') : 'classical'
    lines.push(`${riskLabel.padEnd(12)} ${quantum.padEnd(10)} str:${e.strength}  ${e.pair[0]} \u2194 ${e.pair[1]}`)
    lines.push(`  ${chalk.dim(e.description)}`)
  }

  return lines.join('\n')
}

// ─── Tunneling Paths ───────────────────────────────────────────────────────────

/**
 * Format tunneling paths.
 *
 * @example
 * formatTunnelingPaths(paths) // => tunnel report
 */
export function formatTunnelingPaths(paths: TunnelingPath[]): string {
  const header = chalk.bold('Tunneling Paths')
  const separator = '\u2500'.repeat(65)

  if (paths.length === 0) {
    return `${header}\n${separator}\nNo tunneling paths detected.`
  }

  const lines = [header, separator]
  for (const t of paths) {
    const riskLabel = formatTunnelRiskLabel(t.risk)
    lines.push(`${riskLabel.padEnd(12)} p:${t.probability}%  ${t.from} \u2192 ${t.to}`)
    lines.push(`  path: ${t.path.join(' \u2192 ')}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format quantum stats summary.
 *
 * @example
 * formatQuantumStats(stats) // => stats summary
 */
export function formatQuantumStats(stats: QuantumStats): string {
  const header = chalk.bold('Quantum Analysis')
  const separator = '\u2500'.repeat(60)
  const health = formatQuantumHealthLabel(stats.quantumHealth)

  return [
    header,
    separator,
    `States:           ${stats.totalStates} (collapsed:${stats.collapsedStates} uncollapsed:${stats.uncollapsedStates})`,
    `Superpositions:   ${stats.totalSuperpositions}`,
    `Entanglements:    ${stats.totalEntanglements} (critical:${stats.criticalEntanglements})`,
    `Tunneling Paths:  ${stats.totalTunnelingPaths} (dangerous:${stats.dangerousTunnels})`,
    separator,
    `Uncertainty:      ${formatQuantumGauge(stats.avgUncertainty)}`,
    `Coherence:        ${formatQuantumGauge(stats.avgCoherence)}`,
    `Observation:      ${formatQuantumGauge(stats.avgObservationEffect)}`,
    `Determinism:      ${formatQuantumGauge(stats.determinismIndex)}`,
    `Entropy:          ${formatQuantumGauge(stats.entanglementEntropy)}`,
    separator,
    `Max Uncertainty:  ${stats.maxUncertainty} (${stats.mostUncertainFile || 'n/a'})`,
    `Most Entangled:   ${stats.mostEntangledFile || 'n/a'}`,
    `Quantum Health:   ${health}`,
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
    return `${header}\n${separator}\nNo recommendations. Code is deterministic!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full quantum table output.
 *
 * @example
 * formatQuantumTable(result) // => full table string
 */
export function formatQuantumTable(result: QuantumResult): string {
  const allSuperpositions = result.states.flatMap(s => s.superpositions)

  return [
    formatQuantumStats(result.stats),
    '',
    formatStates(result.states),
    '',
    formatSuperpositions(allSuperpositions),
    '',
    formatEntanglements(result.entanglements),
    '',
    formatTunnelingPaths(result.tunnelingPaths),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format quantum result as JSON.
 *
 * @example
 * formatQuantumJson(result) // => JSON string
 */
export function formatQuantumJson(result: QuantumResult): string {
  return JSON.stringify(result, null, 2)
}
