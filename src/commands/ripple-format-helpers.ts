import chalk from 'chalk'
import type { RippleNode, RippleWave, RippleSimulation, RippleResult, RippleStats, RiskLevel, EffortLevel } from './ripple-helpers.js'

// ─── Badge Helpers ────────────────────────────────────────────────────────────

export function riskBadge(level: RiskLevel): string {
  const colors: Record<RiskLevel, (s: string) => string> = {
    critical: chalk.rgb(255, 50, 50).bold,
    high: chalk.rgb(255, 130, 50),
    medium: chalk.rgb(255, 215, 0),
    low: chalk.rgb(100, 200, 100),
    minimal: chalk.rgb(150, 200, 150),
  }
  return (colors[level] ?? chalk.white)(`[${level.toUpperCase()}]`)
}

export function effortBadge(level: EffortLevel): string {
  const colors: Record<EffortLevel, (s: string) => string> = {
    'major-refactor': chalk.rgb(255, 50, 50).bold,
    difficult: chalk.rgb(255, 130, 50),
    moderate: chalk.rgb(255, 215, 0),
    easy: chalk.rgb(100, 200, 100),
    trivial: chalk.rgb(150, 200, 150),
  }
  return (colors[level] ?? chalk.white)(level)
}

export function rippleScoreMeter(score: number): string {
  const filled = Math.round((score / 100) * 15)
  const empty = 15 - filled
  const color = score >= 75 ? chalk.rgb(255, 50, 50)
    : score >= 55 ? chalk.rgb(255, 165, 0)
    : score >= 35 ? chalk.rgb(255, 215, 0)
    : chalk.rgb(100, 200, 100)
  const bar = color('█'.repeat(filled)) + chalk.rgb(60, 60, 60)('░'.repeat(empty))
  return `${bar} ${score}`
}

// ─── Wave Visualization ───────────────────────────────────────────────────────

export function formatWaveCircle(waves: RippleWave[], sourceFile: string): string {
  const lines: string[] = [chalk.bold('Ripple Waves'), `  Source: ${chalk.bold(sourceFile)}`]

  if (waves.length === 0) {
    lines.push(`  ${chalk.rgb(100, 200, 100)('No ripple — isolated file')}`)
    return lines.join('\n')
  }

  for (const wave of waves) {
    const indent = '  '.repeat(wave.level)
    const circle = chalk.rgb(100, 180, 255)('◎'.repeat(Math.min(wave.level, 5)))
    const files = wave.files.map((f) => chalk.rgb(200, 200, 255)(f)).join(', ')
    lines.push(`${indent}${circle} Wave ${wave.level}: ${files}`)
  }

  return lines.join('\n')
}

// ─── Hotspot Formatting ───────────────────────────────────────────────────────

export function formatHotspotRow(node: RippleNode): string {
  const file = chalk.bold(node.file)
  const score = rippleScoreMeter(node.rippleScore)
  const risk = riskBadge(node.riskLevel)
  const direct = chalk.rgb(180, 180, 180)(`direct:${node.directDependents}`)
  const trans = chalk.rgb(180, 180, 180)(`transitive:${node.transitiveDependents}`)
  return `${file}  ${score}  ${risk}  ${direct}  ${trans}`
}

export function formatHotspotTable(hotspots: RippleNode[]): string {
  const header = [
    chalk.bold('File'),
    chalk.bold('Ripple Score'),
    chalk.bold('Risk'),
    chalk.bold('Direct'),
    chalk.bold('Transitive'),
  ].join('  ')

  const rows = hotspots.map(formatHotspotRow)
  return [header, ...rows].join('\n')
}

// ─── Simulation Formatting ────────────────────────────────────────────────────

export function formatSimulation(sim: RippleSimulation, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold(`Simulating change to: ${sim.sourceFile}`))
  lines.push(`  Ripple Score: ${rippleScoreMeter(sim.rippleScore)}`)
  lines.push(`  Risk Level: ${riskBadge(classifyRiskFromScore(sim.rippleScore))}`)
  lines.push(`  Estimated Effort: ${effortBadge(sim.estimatedEffort)}`)
  lines.push(`  Total Affected: ${sim.totalAffected} file(s) across ${sim.maxDepth} wave(s)`)
  lines.push(`  Testing Effort: ${sim.testingEffort}`)

  if (sim.affectedModules.length > 0) {
    lines.push(`  Affected Modules: ${sim.affectedModules.map((m) => chalk.rgb(180, 180, 255)(m)).join(', ')}`)
  }

  if (verbose && sim.waves.length > 0) {
    lines.push('')
    lines.push(formatWaveCircle(sim.waves, sim.sourceFile))
  }

  return lines.join('\n')
}

function classifyRiskFromScore(score: number): RiskLevel {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 35) return 'medium'
  if (score >= 15) return 'low'
  return 'minimal'
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

export function formatStats(stats: RippleStats): string {
  const lines = [
    chalk.bold('Ripple Analysis Statistics'),
    `  Total Files:         ${stats.totalFiles}`,
    `  Average Ripple:      ${stats.averageRippleScore}`,
    `  Max Ripple Score:    ${stats.maxRippleScore}`,
    `  Critical Files:      ${chalk.rgb(255, 50, 50)(String(stats.criticalFiles))}`,
    `  High Risk Files:     ${chalk.rgb(255, 165, 0)(String(stats.highRiskFiles))}`,
    `  Low Risk Files:      ${chalk.rgb(100, 200, 100)(String(stats.lowRiskFiles))}`,
    `  Most Isolated:       ${chalk.rgb(150, 200, 150)(stats.mostIsolatedFile)}`,
    `  Most Connected:      ${chalk.rgb(255, 130, 50)(stats.mostConnectedFile)}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ───────────────────────────────────────────────

export function formatRecommendations(recommendations: string[]): string {
  const lines = [chalk.bold('Recommendations')]
  recommendations.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${chalk.rgb(255, 220, 150)(r)}`)
  })
  return lines.join('\n')
}

// ─── Full Report ──────────────────────────────────────────────────────────────

export function formatRippleReport(result: RippleResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')

  if (result.hotspots.length > 0) {
    sections.push(chalk.bold('Ripple Hotspots'))
    sections.push(formatHotspotTable(result.hotspots))
    sections.push('')
  }

  if (verbose && result.simulations.length > 0) {
    sections.push(chalk.bold('Ripple Simulations'))
    for (const sim of result.simulations) {
      sections.push(formatSimulation(sim, verbose))
      sections.push('')
    }
  } else if (result.simulations.length > 0) {
    const topSims = result.simulations
      .sort((a, b) => b.rippleScore - a.rippleScore)
      .slice(0, 5)
    sections.push(chalk.bold('Top 5 Simulations by Risk'))
    for (const sim of topSims) {
      sections.push(formatSimulation(sim, false))
      sections.push('')
    }
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

export function formatRippleJson(result: RippleResult): string {
  return JSON.stringify(result, null, 2)
}
