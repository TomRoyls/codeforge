import chalk from 'chalk'
import type { GearboxResult, GearUnit, TransmissionUnit, GearboxStats } from './gearbox-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function condColor(c: string): string {
  switch (c) {
    case 'race-ready': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'good': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'needs-service': return chalk.rgb(255, 165, 0)(c)
    case 'failing': return chalk.red(c)
    case 'broken': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'f1-engineer': return chalk.rgb(255, 215, 0)(g)
    case 'master-mechanic': return chalk.green(g)
    case 'mechanic': return chalk.blue(g)
    case 'apprentice': return chalk.yellow(g)
    case 'shade-tree': return chalk.rgb(255, 165, 0)(g)
    case 'clueless': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function transGradeColor(g: string): string {
  switch (g) {
    case 'racing': return chalk.rgb(255, 215, 0)(g)
    case 'performance': return chalk.green(g)
    case 'standard': return chalk.blue(g)
    case 'economy': return chalk.yellow(g)
    case 'worn': return chalk.rgb(255, 165, 0)(g)
    case 'broken': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Unit Formatting ────────────────────────────────────────────────────────

function formatUnit(u: GearUnit, verbose: boolean): string {
  const markers: string[] = []
  if (u.condition === 'race-ready') markers.push(chalk.rgb(255, 215, 0)('RR'))
  if (u.diagnostics.isGrinding) markers.push(chalk.red('GR'))
  if (u.diagnostics.isOverheating) markers.push(chalk.yellow('OH'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(u.file)} ${u.gearType} ${u.transmissionType} ${condColor(u.condition)} eff:${scoreColor(u.efficiency)} torque:${scoreColor(u.torque)} rpm:${scoreColor(u.rpm)} qual:${scoreColor(u.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    ratio:${u.gearRatio} gears:${u.gearCount} lube:${scoreColor(u.lubrication)} clutch:${scoreColor(u.clutchEngagement)} friction:${scoreColor(u.friction)} heat:${scoreColor(u.heatGeneration)}`)
  details.push(`    noise:${scoreColor(u.noise)} vibration:${scoreColor(u.vibration)} wear:${u.wear.level}(${u.wear.totalWearPercent}%) fluid:${scoreColor(u.diagnostics.fluidLevel)}`)
  details.push(`    power: low:${u.powerBand.lowEnd} mid:${u.powerBand.midRange} high:${u.powerBand.highEnd} range:${u.powerBand.optimalRange}`)
  if (u.issues.length > 0) details.push(`    issues: ${u.issues.join(', ')}`)
  return details.join('\n')
}

// ─── Transmission Formatting ────────────────────────────────────────────────

function formatTransmission(t: TransmissionUnit, verbose: boolean): string {
  const line = `  ${chalk.bold(t.directory)} ${transGradeColor(t.transmissionGrade)} units:${t.gears.length} gears:${t.totalGears} eff:${scoreColor(t.overallEfficiency)} sync:${t.synchronization}%`

  if (!verbose) return line
  const details = [line]
  details.push(`    lube:${scoreColor(t.avgLubrication)} clutch:${scoreColor(t.avgClutchEngagement)} friction:${t.totalFriction} wear:${t.totalWear} fluid:${scoreColor(t.avgFluidLevel)} grinding:${t.grindingCount} slipping:${t.slippingCount} heat:${t.overheatingCount}`)
  return details.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────────────────────────

function formatStats(stats: GearboxStats): string {
  return [
    `  Files: ${stats.totalFiles} | Transmissions: ${stats.totalTransmissions} | Gears: ${stats.totalGears} | Ratio: ${stats.avgGearRatio} | Efficiency: ${scoreColor(stats.overallEfficiency)}`,
    `  Torque: ${scoreColor(stats.avgTorque)} | RPM: ${scoreColor(stats.avgRPM)} | Lube: ${scoreColor(stats.avgLubrication)} | Clutch: ${scoreColor(stats.avgClutchEngagement)} | Friction: ${scoreColor(stats.avgFriction)}`,
    `  Heat: ${scoreColor(stats.avgHeatGeneration)} | Noise: ${scoreColor(stats.avgNoise)} | Vibration: ${scoreColor(stats.avgVibration)} | Fluid: ${scoreColor(stats.avgFluidLevel)} | Wear: ${stats.totalWear}`,
    `  Race-ready: ${chalk.rgb(255, 215, 0)(String(stats.raceReadyCount))} | Broken: ${chalk.red(String(stats.brokenCount))} | Grinding: ${chalk.red(String(stats.grindingUnits))} | Slipping: ${chalk.yellow(String(stats.slippingUnits))} | Overheating: ${chalk.rgb(255, 165, 0)(String(stats.overheatingUnits))}`,
    `  Mechanic: ${gradeColor(stats.mechanicGrade)} | Best: ${chalk.green(stats.bestUnit)} | Worst: ${chalk.red(stats.worstUnit)} | Power: ${chalk.cyan(stats.mostPowerful)} | Smooth: ${chalk.blue(stats.smoothest)}`,
  ].join('\n')
}

// ─── Table Formatter ────────────────────────────────────────────────────────

/**
 * Format gearbox result as a table
 * @example
 * formatGearboxTable(result, false) // string
 */
export function formatGearboxTable(result: GearboxResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⚙️  Gearbox - Code Transmission Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔧 Gear Units'))
  if (result.units.length === 0) {
    lines.push(chalk.dim('  No gear units detected.'))
  } else {
    const display = verbose ? result.units : result.units.slice(0, 15)
    for (const u of display) {
      lines.push(formatUnit(u, verbose))
    }
    if (!verbose && result.units.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.units.length - 15} more`))
    }
  }
  lines.push('')

  if (result.transmissions.length > 0) {
    lines.push(chalk.bold('🔗 Transmissions'))
    for (const t of result.transmissions) {
      lines.push(formatTransmission(t, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ─────────────────────────────────────────────────────────

/**
 * Format gearbox result as JSON
 * @example
 * formatGearboxJson(result) // string
 */
export function formatGearboxJson(result: GearboxResult): string {
  return JSON.stringify(result, null, 2)
}
