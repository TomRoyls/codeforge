import chalk from 'chalk'

import type { BodyClassification, GravitationalBody, GravityResult, GravityStats, GravityWell, WellType } from './gravity-well-helpers.js'

// ─── Body Classification Display ───────────────────────────────────────────────

/**
 * Format a body classification symbol.
 *
 * @example
 * formatBodySymbol('star') // => '★'
 */
export function formatBodySymbol(cls: BodyClassification): string {
  const symbols: Record<BodyClassification, string> = {
    asteroid: '◌',
    blackhole: '◉',
    moon: '○',
    planet: '●',
    star: '★',
  }
  return symbols[cls] ?? '?'
}

/**
 * Format body classification with color.
 *
 * @example
 * formatBodyClassification('star') // => colored '★ star'
 */
export function formatBodyClassification(cls: BodyClassification): string {
  const colors: Record<BodyClassification, (s: string) => string> = {
    asteroid: chalk.gray,
    blackhole: chalk.rgb(138, 43, 226),
    moon: chalk.rgb(173, 216, 230),
    planet: chalk.rgb(100, 149, 237),
    star: chalk.rgb(255, 215, 0),
  }
  const color = colors[cls] ?? chalk.white
  return color(`${formatBodySymbol(cls)} ${cls}`)
}

// ─── Gravity Well Diagram ──────────────────────────────────────────────────────

/**
 * Format an ASCII gravity well diagram.
 *
 * @example
 * formatGravityWellDiagram(wells) // => visual representation
 */
export function formatGravityWellDiagram(wells: GravityWell[]): string {
  if (wells.length === 0) return chalk.gray('  No gravity wells detected')

  const lines: string[] = [
    '',
    chalk.bold.rgb(100, 149, 237)('  Gravity Well Diagram:'),
    chalk.gray('  ' + '─'.repeat(60)),
  ]

  for (const well of wells) {
    const wellTypeColors: Record<WellType, (s: string) => string> = {
      binary: chalk.rgb(255, 215, 0),
      chaotic: chalk.rgb(255, 99, 71),
      cluster: chalk.rgb(138, 43, 226),
      stable: chalk.rgb(60, 179, 113),
    }
    const typeColor = wellTypeColors[well.type] ?? chalk.white
    const centerName = well.center.split('/').pop() ?? well.center

    lines.push(`  ${typeColor('◎')} ${chalk.bold(centerName)} ${typeColor(`(${well.type})`)} — ${well.bodies.length} bodies, strength ${well.gravitationalStrength}`)

    for (const body of well.bodies) {
      if (body === well.center) continue
      const name = body.split('/').pop() ?? body
      const indent = '    '
      lines.push(`  ${indent}${chalk.gray('↳')} ${name}`)
    }
  }

  return lines.join('\n')
}

// ─── Body Table ────────────────────────────────────────────────────────────────

/**
 * Format bodies as a classification table.
 *
 * @example
 * formatBodyTable(bodies) // => '  ★ core.ts   500  15  85  star'
 */
export function formatBodyTable(bodies: GravitationalBody[]): string {
  if (bodies.length === 0) return chalk.gray('  No bodies detected')

  const sorted = [...bodies].sort((a, b) => b.gravitationalPull - a.gravitationalPull)
  const lines: string[] = [
    '',
    chalk.bold('  Gravitational Bodies:'),
    chalk.gray('  ' + '─'.repeat(80)),
    `  ${chalk.bold('File').padEnd(30)} ${chalk.bold('Mass').padEnd(7)} ${chalk.bold('Pull').padEnd(7)} ${chalk.bold('Field').padEnd(7)} ${chalk.bold('Esc.V').padEnd(7)} ${chalk.bold('Class')}`,
    chalk.gray('  ' + '─'.repeat(80)),
  ]

  for (const b of sorted) {
    const name = b.file.length > 28 ? '...' + b.file.slice(-25) : b.file
    lines.push(
      `  ${name.padEnd(30)} ${String(b.mass).padEnd(7)} ${String(b.gravitationalPull).padEnd(7)} ${String(b.gravitationalField).padEnd(7)} ${String(b.escapeVelocity).padEnd(7)} ${formatBodyClassification(b.classification)}`,
    )
  }

  return lines.join('\n')
}

// ─── Escape Velocity Chart ─────────────────────────────────────────────────────

/**
 * Format an escape velocity chart.
 *
 * @example
 * formatEscapeVelocityChart(bodies) // => bar chart
 */
export function formatEscapeVelocityChart(bodies: GravitationalBody[]): string {
  const highEsc = bodies.filter(b => b.escapeVelocity > 0).sort((a, b) => b.escapeVelocity - a.escapeVelocity).slice(0, 10)
  if (highEsc.length === 0) return chalk.gray('  No escape velocity data')

  const lines: string[] = [
    '',
    chalk.bold('  Escape Velocity (Top 10):'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]

  for (const b of highEsc) {
    const barLen = Math.round(b.escapeVelocity / 5)
    const bar = '█'.repeat(barLen)
    const name = (b.file.split('/').pop() ?? b.file).slice(0, 20)
    const color = b.escapeVelocity > 70 ? chalk.rgb(255, 99, 71) : b.escapeVelocity > 40 ? chalk.rgb(255, 215, 0) : chalk.rgb(60, 179, 113)
    lines.push(`  ${name.padEnd(22)} ${color(bar)} ${b.escapeVelocity}`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format gravity stats summary.
 *
 * @example
 * formatGravityStats(stats) // => summary lines
 */
export function formatGravityStats(stats: GravityStats): string {
  const lines: string[] = [
    '',
    chalk.bold('  System Statistics:'),
    chalk.gray('  ' + '─'.repeat(60)),
    `  Total Bodies:       ${stats.totalBodies}`,
    `  Stars: ${chalk.rgb(255, 215, 0)(String(stats.starCount))}  |  Black Holes: ${chalk.rgb(138, 43, 226)(String(stats.blackholeCount))}`,
    `  Gravity Wells:      ${stats.wellCount} (stable: ${stats.stableWells}, chaotic: ${stats.chaoticWells})`,
    `  Strongest Gravity:  ${chalk.rgb(255, 215, 0)(stats.strongestGravity)}`,
    `  Deepest Well:       ${stats.deepestWell || 'none'}`,
    `  Avg Escape Vel:     ${stats.avgEscapeVelocity}  |  Avg Field: ${stats.avgFieldStrength}`,
    `  Grav. Constant:     ${stats.gravitationalConstant}  |  Stability: ${stats.systemStability}%`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format gravity recommendations.
 *
 * @example
 * formatGravityRecommendations(recs) // => recommendation list
 */
export function formatGravityRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [
    '',
    chalk.bold('  Recommendations:'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full gravity result as table.
 *
 * @example
 * formatGravityTable(result) // => complete formatted output
 */
export function formatGravityTable(result: GravityResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(100, 149, 237)('\n  Gravity Well Analysis\n'))
  sections.push(formatGravityWellDiagram(result.wells))
  sections.push(formatBodyTable(result.bodies))
  sections.push(formatEscapeVelocityChart(result.bodies))
  sections.push(formatGravityStats(result.stats))
  sections.push(formatGravityRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format gravity result as JSON.
 *
 * @example
 * formatGravityJson(result) // => '{"bodies":[...],...}'
 */
export function formatGravityJson(result: GravityResult): string {
  return JSON.stringify(result, null, 2)
}
