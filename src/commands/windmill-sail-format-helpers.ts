import chalk from 'chalk'
import type { WindmillSailResult, WindmillSail, MillComplex } from './windmill-sail-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'fully-operational': return chalk.rgb(100, 255, 100)(c)
    case 'operational': return chalk.green(c)
    case 'needs-repair': return chalk.yellow(c)
    case 'deteriorating': return chalk.rgb(255, 165, 0)(c)
    case 'idle': return chalk.blue(c)
    case 'ruined': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function complexColor(c: string): string {
  switch (c) {
    case 'thriving-mill': return chalk.rgb(255, 215, 0)(c)
    case 'working-mill': return chalk.green(c)
    case 'struggling-mill': return chalk.yellow(c)
    case 'abandoned-mill': return chalk.rgb(255, 165, 0)(c)
    case 'ruins': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-millwright': return chalk.rgb(255, 215, 0)(g)
    case 'millwright': return chalk.green(g)
    case 'mechanic': return chalk.blue(g)
    case 'handyman': return chalk.cyan(g)
    case 'apprentice': return chalk.yellow(g)
    case 'tourist': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Sail Formatting ─────────────────────────────────────────────────────────

function formatSail(sa: WindmillSail, verbose: boolean): string {
  const line = ` ${conditionColor(sa.condition)} ${chalk.bold(sa.file)} eff:${scoreColor(sa.sailEfficiency)} grind:${scoreColor(sa.grindingQuality)} stable:${scoreColor(sa.structuralStability)} q:${scoreColor(sa.qualityScore)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    sail:${sa.sailType} mill:${sa.millType} funcs:${sa.sails.count} cond:${sa.sails.condition} balanced:${sa.sails.areBalanced ? 'yes' : 'no'}`)
  details.push(`    wind:${sa.wind.direction} vel:${scoreColor(sa.wind.velocity)} con:${scoreColor(sa.wind.consistency)} energy:${scoreColor(sa.energy.efficiency)} gears:${scoreColor(sa.gears.meshQuality)}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format windmill sail result as a table
 * @example
 * formatWindmillSailTable(result, false) // string
 */
export function formatWindmillSailTable(result: WindmillSailResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌬️ Windmill Sail - Code Energy/Processing Efficiency Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('⛵ Sails'))
  if (result.sails.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.sails : result.sails.slice(0, 15)
    for (const sa of display) {
      lines.push(formatSail(sa, verbose))
    }
    if (!verbose && result.sails.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.sails.length - 15} more`))
    }
  }
  lines.push('')

  if (result.complexes.length > 0) {
    lines.push(chalk.bold('🏗️ Mill Complexes'))
    for (const c of result.complexes) {
      lines.push(`  ${chalk.bold(c.directory)} ${complexColor(c.condition)} eff:${scoreColor(c.avgEfficiency)} health:${scoreColor(c.complexHealth)} type:${c.dominantMillType}`)
    }
    lines.push('')
  }

  const wf = result.windFarm
  lines.push(chalk.bold('🌾 Wind Farm'))
  lines.push(`  Energy In:${scoreColor(wf.totalEnergyInput)} Out:${scoreColor(wf.totalEnergyOutput)} Eff:${scoreColor(wf.overallEfficiency)} | Operational:${wf.operationalMills} Idle:${wf.idleMills} Ruined:${wf.ruinedMills}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.millwrightGrade)} | Files: ${s.totalFiles} | Complexes: ${s.totalComplexes} | Eff: ${scoreColor(s.overallEfficiency)}`)
  lines.push(`  Tower:${s.towerMills} Post:${s.postMills} Turbine:${s.turbineMills} | Operational:${s.operationalCount} Idle:${s.idleCount} Ruined:${s.ruinedCount}`)
  lines.push(`  Balanced:${s.balancedSails} Torn:${s.tornSails} Missing:${s.missingSails} Coarse:${s.hasCoarseOutput} Slipping:${s.hasSlippingGears} BrokenTeeth:${s.hasBrokenTeeth}`)
  lines.push(`  Best: ${chalk.green(s.mostEfficient)} | Worst: ${chalk.red(s.leastEfficient)} | Grind: ${chalk.blue(s.bestGrinding)} | Stable: ${chalk.cyan(s.mostStable)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format windmill sail result as JSON
 * @example
 * formatWindmillSailJson(result) // string
 */
export function formatWindmillSailJson(result: WindmillSailResult): string {
  return JSON.stringify(result, null, 2)
}
