import chalk from 'chalk'

import type { PhysicsResult, PhysicsStats, Forces, CodeMass, Kinematics, Thermodynamics } from './physics-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────────

const equilibriumColor: Record<string, (s: string) => string> = {
  stable: (s: string) => chalk.rgb(46, 204, 113)(s),
  metastable: (s: string) => chalk.rgb(243, 156, 18)(s),
  unstable: (s: string) => chalk.rgb(231, 76, 60)(s),
}

const trajectoryColor: Record<string, (s: string) => string> = {
  stable: (s: string) => chalk.rgb(46, 204, 113)(s),
  growing: (s: string) => chalk.rgb(52, 152, 219)(s),
  shrinking: (s: string) => chalk.rgb(149, 165, 166)(s),
  volatile: (s: string) => chalk.rgb(231, 76, 60)(s),
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Force Diagram ─────────────────────────────────────────────────────────────

/**
 * Format force diagram.
 *
 * @example
 * formatForceDiagram(forces)
 */
export function formatForceDiagram(forces: Forces): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Force Diagram')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const draw = (label: string, value: number, color: (s: string) => string) => {
    const bar = buildBar(value, 20)
    lines.push(`  ${label.padEnd(14)} ${color(bar)} ${value}`)
  }

  draw('Attraction', forces.attraction, chalk.rgb(46, 204, 113))
  draw('Repulsion', forces.repulsion, chalk.rgb(231, 76, 60))
  draw('Friction', forces.friction, chalk.rgb(243, 156, 18))
  draw('Tension', forces.tension, chalk.rgb(155, 89, 182))
  draw('Gravity', forces.gravity, chalk.rgb(52, 152, 219))

  return lines.join('\n')
}

// ─── Mass Distribution ─────────────────────────────────────────────────────────

/**
 * Format mass distribution.
 *
 * @example
 * formatMassDistribution(masses)
 */
export function formatMassDistribution(masses: CodeMass[]): string {
  if (masses.length === 0) return '  No mass data\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Mass Distribution')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...masses].sort((a, b) => b.mass - a.mass)
  for (const m of sorted.slice(0, 15)) {
    const bar = buildBar(Math.min(100, m.mass / 5), 15)
    lines.push(`  ${m.file.padEnd(30)} ${chalk.rgb(52, 152, 219)(bar)} mass=${m.mass} density=${m.density}%`)
  }

  return lines.join('\n')
}

// ─── Velocity Chart ────────────────────────────────────────────────────────────

/**
 * Format velocity chart.
 *
 * @example
 * formatVelocityChart(kinematics)
 */
export function formatVelocityChart(kinematics: Kinematics[]): string {
  if (kinematics.length === 0) return '  No velocity data\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Velocity Chart')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const k of kinematics) {
    const colorFn = trajectoryColor[k.trajectory] ?? chalk.white
    lines.push(`  ${k.file.padEnd(30)} v=${k.velocity} p=${k.momentum} KE=${k.kineticEnergy} ${colorFn(k.trajectory)}`)
  }

  return lines.join('\n')
}

// ─── Entropy Meter ─────────────────────────────────────────────────────────────

/**
 * Format entropy meter.
 *
 * @example
 * formatEntropyMeter(thermo)
 */
export function formatEntropyMeter(thermo: Thermodynamics): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Thermodynamic State')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Entropy:       ${buildBar(thermo.entropy)} ${thermo.entropy}`)
  lines.push(`  Temperature:   ${buildBar(thermo.temperature)} ${thermo.temperature}`)
  lines.push(`  Pressure:      ${buildBar(thermo.pressure)} ${thermo.pressure}`)
  lines.push(`  Energy:        ${buildBar(thermo.energy)} ${thermo.energy}`)
  lines.push(`  Heat Capacity: ${buildBar(thermo.heatCapacity)} ${thermo.heatCapacity}`)
  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format physics stats.
 *
 * @example
 * formatPhysicsStats(stats)
 */
export function formatPhysicsStats(stats: PhysicsStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Physics Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Mass:           ${stats.totalMass}`)
  lines.push(`  Avg Density:          ${stats.avgDensity}%`)
  lines.push(`  Total Energy:         ${stats.totalEnergy}`)
  lines.push(`  Avg Entropy:          ${stats.avgEntropy}`)
  lines.push(`  Center of Gravity:    ${chalk.bold(stats.centerOfGravity)}`)
  lines.push(`  Heaviest File:        ${stats.heaviestFile}`)
  lines.push(`  Fastest File:         ${stats.fastestFile}`)
  lines.push(`  Most Energetic:       ${stats.mostEnergeticFile}`)
  lines.push(`  System Stability:     ${buildBar(stats.systemStability)} ${stats.systemStability}%`)
  lines.push(`  Total Momentum:       ${stats.totalMomentum}`)
  const eqColor = equilibriumColor[stats.equilibriumState] ?? chalk.white
  lines.push(`  Equilibrium:          ${eqColor(stats.equilibriumState)}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format physics recommendations.
 *
 * @example
 * formatPhysicsRecommendations(recs)
 */
export function formatPhysicsRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Recommendations')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete physics result as table.
 *
 * @example
 * formatPhysicsTable(result)
 */
export function formatPhysicsTable(result: PhysicsResult): string {
  const parts: string[] = []
  parts.push(`  \u269B ${chalk.bold('Physics Analysis')} \u2014 ${result.stats.totalMass} total mass, ${result.stats.equilibriumState} equilibrium`)
  parts.push('')
  parts.push(formatForceDiagram(result.forces))
  parts.push('')
  parts.push(formatMassDistribution(result.masses))
  parts.push('')
  parts.push(formatVelocityChart(result.kinematics))
  parts.push('')
  parts.push(formatEntropyMeter(result.thermodynamics))
  parts.push('')
  parts.push(formatPhysicsStats(result.stats))
  parts.push('')
  parts.push(formatPhysicsRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format physics result as JSON.
 *
 * @example
 * formatPhysicsJSON(result)
 */
export function formatPhysicsJSON(result: PhysicsResult): string {
  return JSON.stringify(result, null, 2)
}
