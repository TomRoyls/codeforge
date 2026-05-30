import chalk from 'chalk'

import type { CelestialBody, CelestialType, Constellation, DeepField, TelescopeResult, TelescopeStats } from './telescope-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────────

const bodyTypeColor: Record<CelestialType, (s: string) => string> = {
  star: (s: string) => chalk.rgb(241, 196, 15)(s),
  planet: (s: string) => chalk.rgb(52, 152, 219)(s),
  moon: (s: string) => chalk.rgb(149, 165, 166)(s),
  asteroid: (s: string) => chalk.rgb(127, 140, 141)(s),
  comet: (s: string) => chalk.rgb(46, 204, 113)(s),
  blackhole: (s: string) => chalk.rgb(142, 68, 173)(s),
  nebula: (s: string) => chalk.rgb(231, 76, 60)(s),
}

const bodyTypeIcon: Record<CelestialType, string> = {
  star: '\u2B50',
  planet: '\u{1FA90}',
  moon: '\u{1F319}',
  asteroid: '\u{1F30B}',
  comet: '\u2604\uFE0F',
  blackhole: '\u{1F300}',
  nebula: '\u{1F32B}\uFE0F',
}

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

// ─── Constellation Map ─────────────────────────────────────────────────────────

/**
 * Format constellation map visualization.
 *
 * @example
 * formatConstellationMap(constellations)
 */
export function formatConstellationMap(constellations: Constellation[]): string {
  if (constellations.length === 0) return '  No constellations observed\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Constellation Map')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const c of constellations) {
    lines.push(`  \u2726 ${chalk.bold(c.name)} \u2014 ${c.density} bodies, ${c.stars} star(s), mass ${c.totalMass}`)
    lines.push(`    Brightness: ${buildBar(c.brightness)} ${c.brightness}%`)
  }

  return lines.join('\n')
}

// ─── Body Classification Table ─────────────────────────────────────────────────

/**
 * Format celestial body classification table.
 *
 * @example
 * formatBodyTable(bodies)
 */
export function formatBodyTable(bodies: CelestialBody[]): string {
  if (bodies.length === 0) return '  No celestial bodies detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Celestial Bodies')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...bodies].sort((a, b) => b.magnitude - a.magnitude)
  for (const b of sorted.slice(0, 20)) {
    const icon = bodyTypeIcon[b.type] ?? '\u2022'
    const colorFn = bodyTypeColor[b.type] ?? chalk.white
    lines.push(`  ${icon} ${colorFn(b.name)} (${b.type})`)
    lines.push(`    Lum: ${b.luminosity} | Mass: ${b.mass} | Grav: ${b.gravity} | Dist: ${b.distance} | Mag: ${b.magnitude}`)
  }

  return lines.join('\n')
}

// ─── Deep Field Observations ───────────────────────────────────────────────────

/**
 * Format deep field observations.
 *
 * @example
 * formatDeepFields(deepFields)
 */
export function formatDeepFields(deepFields: DeepField[]): string {
  if (deepFields.length === 0) return '  No deep field observations\n'

  const lines: string[] = []

  for (const df of deepFields) {
    lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
    lines.push(`  \u{1F52D} Zoom ${df.zoomLevel}: ${chalk.bold(df.description)}`)
    lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

    for (const obs of df.observations) {
      const sigIcon = obs.significance === 'groundbreaking' ? '\u{1F4A5}' : obs.significance === 'major' ? '\u{1F31F}' : obs.significance === 'notable' ? '\u{1F4A1}' : '\u2022'
      lines.push(`  ${sigIcon} [${obs.significance}] ${obs.description}`)
      if (obs.detail) lines.push(`     ${chalk.gray(obs.detail)}`)
    }

    for (const d of df.discoveries) {
      lines.push(`  \u{1F3AF} ${d}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Luminosity Histogram ──────────────────────────────────────────────────────

/**
 * Format luminosity distribution histogram.
 *
 * @example
 * formatLuminosityHistogram(bodies)
 */
export function formatLuminosityHistogram(bodies: CelestialBody[]): string {
  if (bodies.length === 0) return '  No luminosity data\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Luminosity Distribution')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const buckets = [0, 0, 0, 0, 0]
  for (const b of bodies) {
    if (b.luminosity < 20) buckets[0] = (buckets[0] ?? 0) + 1
    else if (b.luminosity < 40) buckets[1] = (buckets[1] ?? 0) + 1
    else if (b.luminosity < 60) buckets[2] = (buckets[2] ?? 0) + 1
    else if (b.luminosity < 80) buckets[3] = (buckets[3] ?? 0) + 1
    else buckets[4] = (buckets[4] ?? 0) + 1
  }

  const maxBucket = Math.max(...buckets, 1)
  const labels = ['  0-19', '20-39', '40-59', '60-79', '80-100']
  for (let i = 0; i < 5; i++) {
    const barWidth = Math.round(((buckets[i] ?? 0) / maxBucket) * 20)
    const bar = '\u2588'.repeat(Math.max(barWidth, 0))
    lines.push(`  ${labels[i]} ${chalk.rgb(241, 196, 15)(bar)} ${buckets[i]}`)
  }

  return lines.join('\n')
}

// ─── Gravity Well Map ──────────────────────────────────────────────────────────

/**
 * Format gravity well map (high-coupling files).
 *
 * @example
 * formatGravityWellMap(bodies)
 */
export function formatGravityWellMap(bodies: CelestialBody[]): string {
  const highGravity = bodies.filter((b) => b.gravity >= 5).sort((a, b) => b.gravity - a.gravity)
  if (highGravity.length === 0) return '  No significant gravity wells detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Gravity Well Map')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const b of highGravity.slice(0, 10)) {
    const colorFn = bodyTypeColor[b.type] ?? chalk.white
    const bar = buildBar(Math.min(100, b.gravity * 5), 15)
    lines.push(`  ${colorFn(b.name)} ${bar} gravity=${b.gravity}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format telescope statistics.
 *
 * @example
 * formatTelescopeStats(stats)
 */
export function formatTelescopeStats(stats: TelescopeStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Telescope Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Bodies:          ${stats.totalBodies}`)
  lines.push(`  Stars:                 ${stats.starCount}`)
  lines.push(`  Black Holes:           ${stats.blackholeCount}`)
  lines.push(`  Nebulae:               ${stats.nebulaCount}`)
  lines.push(`  Constellations:        ${stats.constellationCount}`)
  lines.push(`  Avg Luminosity:        ${stats.avgLuminosity}`)
  lines.push(`  Avg Mass:              ${stats.avgMass}`)
  lines.push(`  Max Gravity:           ${stats.maxGravity}`)
  lines.push(`  Brightest Body:        ${chalk.bold(stats.brightestBody)}`)
  lines.push(`  Heaviest Body:         ${stats.heaviestBody}`)
  lines.push(`  Most Distant:          ${stats.mostDistant}`)
  lines.push(`  Observable Universe:   ${stats.observableUniverse}`)
  lines.push(`  Dark Matter:           ${chalk.rgb(142, 68, 173)(String(stats.darkMatter))}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format telescope recommendations.
 *
 * @example
 * formatTelescopeRecommendations(recs)
 */
export function formatTelescopeRecommendations(recommendations: string[]): string {
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
 * Format complete telescope result as table.
 *
 * @example
 * formatTelescopeTable(result)
 */
export function formatTelescopeTable(result: TelescopeResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F52D} ${chalk.bold('Telescope Analysis')} \u2014 ${result.stats.totalBodies} bodies across ${result.stats.constellationCount} constellations`)
  parts.push('')
  parts.push(formatConstellationMap(result.constellations))
  parts.push('')
  parts.push(formatBodyTable(result.bodies))
  parts.push('')
  parts.push(formatDeepFields(result.deepFields))
  parts.push('')
  parts.push(formatLuminosityHistogram(result.bodies))
  parts.push('')
  parts.push(formatGravityWellMap(result.bodies))
  parts.push('')
  parts.push(formatTelescopeStats(result.stats))
  parts.push('')
  parts.push(formatTelescopeRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format telescope result as JSON.
 *
 * @example
 * formatTelescopeJSON(result)
 */
export function formatTelescopeJSON(result: TelescopeResult): string {
  return JSON.stringify(result, null, 2)
}
