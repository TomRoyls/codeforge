import chalk from 'chalk'

import type { GravityWellResult } from './gravity-well-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatGravityWellTable(result: GravityWellResult, verbose: boolean): string {
  const { bodies, systems, stats, universe, recommendations } = result
  const lines: string[] = [chalk.bold('\n🌌 Gravity Well Report'), '']

  lines.push(chalk.bold('Universe Overview:'))
  lines.push(`  Overall Stability:     ${chalk.yellow(String(universe.overallStability))}/100`)
  lines.push(`  Avg Orbital Stability: ${chalk.green(String(universe.avgOrbitalStability))}/100`)
  lines.push(`  Avg Escape Velocity:   ${chalk.cyan(String(universe.avgEscapeVelocity))}/100`)
  lines.push(`  Avg Tidal Force:       ${chalk.blue(String(universe.avgTidalForce))}/100`)
  lines.push(`  Is Stable:             ${universe.isStable ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Astrophysicist Grade:  ${chalk.yellow(stats.astrophysicistGrade)}`)
  lines.push('')

  if (systems.length > 0) {
    lines.push(chalk.bold('Star Systems:'))
    for (const sys of systems) {
      const condColor = sys.condition === 'well-ordered-system' || sys.condition === 'stable-system'
        ? chalk.green
        : sys.condition === 'functional-system'
          ? chalk.cyan
          : sys.condition === 'chaotic-system'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(sys.directory, 30)} ${condColor(sys.condition)} (${sys.bodies.length} bodies, ${sys.systemType})`)
    }
    lines.push('')
  }

  if (verbose && bodies.length > 0) {
    lines.push(chalk.bold('Celestial Bodies:'))
    lines.push('')
    const colWidths = {
      condition: 22,
      file: Math.max(20, ...bodies.map(b => b.file.length)),
      quality: 8,
      mass: 6,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Mass', colWidths.mass)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.mass + colWidths.quality + colWidths.condition + 6)))

    for (const b of bodies) {
      const condColor = b.condition === 'stable-star' ? chalk.yellow
        : b.condition === 'healthy-planet' ? chalk.green
          : b.condition === 'tidal-moon' ? chalk.cyan
            : b.condition === 'wandering-asteroid' ? chalk.blue
              : b.condition === 'black-hole' ? chalk.red
                : chalk.gray
      lines.push(
        padRight(b.file, colWidths.file) + '  ' +
        padLeft(String(b.gravitationalMass), colWidths.mass) + '  ' +
        padLeft(String(b.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(b.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:            ${stats.totalFiles}`)
  lines.push(`  Stable Stars:          ${chalk.yellow(String(stats.stableStarCount))}`)
  lines.push(`  Healthy Planets:       ${chalk.green(String(stats.healthyPlanetCount))}`)
  lines.push(`  Tidal Moons:           ${chalk.cyan(String(stats.tidalMoonCount))}`)
  lines.push(`  Wandering Asteroids:   ${chalk.blue(String(stats.wanderingAsteroidCount))}`)
  lines.push(`  Black Holes:           ${chalk.red(String(stats.blackHoleCount))}`)
  lines.push(`  Dark Matter:           ${chalk.gray(String(stats.darkMatterCount))}`)
  lines.push('')

  if (recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of recommendations) {
      lines.push(`  ${chalk.dim('•')} ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatGravityWellJson(result: GravityWellResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatGravityWellCsv(result: GravityWellResult): string {
  const headers = ['File', 'GravitationalMass', 'OrbitalStability', 'EscapeVelocity', 'TidalForce', 'EventHorizon', 'GravitationalLensing', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const b of result.bodies) {
    rows.push(
      [
        escapeCsv(b.file),
        String(b.gravitationalMass),
        String(b.orbitalStability),
        String(b.escapeVelocity),
        String(b.tidalForce),
        String(b.eventHorizon),
        String(b.gravitationalLensing),
        String(b.qualityScore),
        b.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
