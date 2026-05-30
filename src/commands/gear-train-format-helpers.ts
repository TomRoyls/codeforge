import chalk from 'chalk'
import type { Gear, GearTrainResult } from './gear-train-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'precision-engineered': return chalk.rgb(255, 215, 0)(c)
    case 'well-machined': return chalk.green(c)
    case 'serviceable': return chalk.blue(c)
    case 'worn': return chalk.yellow(c)
    case 'grinding': return chalk.rgb(255, 165, 0)(c)
    case 'seized': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gearboxColor(c: string): string {
  switch (c) {
    case 'smooth-running': return chalk.rgb(255, 215, 0)(c)
    case 'efficient': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'noisy': return chalk.yellow(c)
    case 'grinding': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-machinist': return chalk.rgb(255, 215, 0)(g)
    case 'mechanic': return chalk.green(g)
    case 'tinkerer': return chalk.blue(g)
    case 'apprentice': return chalk.cyan(g)
    case 'butcher': return chalk.yellow(g)
    case 'scrap-dealer': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Gear Formatting ─────────────────────────────────────────────────────────

function formatGear(g: Gear, verbose: boolean): string {
  const line = ` ${conditionColor(g.condition)} ${chalk.bold(g.file)} mesh:${scoreColor(g.meshQuality)} torque:${scoreColor(g.torqueTransfer)} eff:${scoreColor(g.transmission.efficiency)} wear:${scoreColor(g.wear)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    teeth:${g.teeth.count}(${g.teeth.profile}) pitch:${scoreColor(g.teeth.pitch)} ratio:${g.gearRatio} backlash:${scoreColor(g.backlash)} lube:${scoreColor(g.lubrication)}`)
  details.push(`    bearing: load:${scoreColor(g.bearing.loadCapacity)} friction:${scoreColor(g.bearing.friction)} runout:${scoreColor(g.bearing.runout)} greased:${g.bearing.isGreased ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    shaft: dia:${g.shaft.diameter} len:${g.shaft.length} balanced:${g.shaft.isBalanced ? chalk.green('Y') : chalk.red('N')} keyway:${g.shaft.hasKeyway ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format gear train result as a table
 * @example
 * formatGearTrainTable(result, false) // string
 */
export function formatGearTrainTable(result: GearTrainResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⚙️  Gear Train - Mechanical Coupling/Transmission Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔧 Gears'))
  if (result.gears.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.gears : result.gears.slice(0, 15)
    for (const g of display) {
      lines.push(formatGear(g, verbose))
    }
    if (!verbose && result.gears.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.gears.length - 15} more`))
    }
  }
  lines.push('')

  if (result.gearboxes.length > 0) {
    lines.push(chalk.bold('📦 Gearboxes'))
    for (const gb of result.gearboxes) {
      lines.push(`  ${chalk.bold(gb.directory)} ${gearboxColor(gb.condition)} mesh:${scoreColor(gb.avgMeshQuality)} torque:${scoreColor(gb.avgTorqueTransfer)} eff:${scoreColor(gb.avgEfficiency)} friction:${scoreColor(gb.totalFriction)} gears:${gb.gears.length}`)
    }
    lines.push('')
  }

  const dt = result.drivetrain
  lines.push(chalk.bold('⛓️  Drivetrain'))
  lines.push(`  Mesh:${scoreColor(dt.avgMeshQuality)} Torque:${scoreColor(dt.avgTorqueTransfer)} Efficiency:${scoreColor(dt.avgEfficiency)} Friction:${scoreColor(dt.totalFriction)} Smooth:${dt.isSmooth ? chalk.green('YES') : chalk.red('NO')} Overall:${scoreColor(dt.overallEfficiency)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.mechanicGrade)} | Efficiency: ${scoreColor(s.overallEfficiency)} | Files: ${s.totalFiles} | Gearboxes: ${s.totalGearboxes}`)
  lines.push(`  Precision:${s.precisionEngineered} Machined:${s.wellMachined} Serviceable:${s.serviceable} Worn:${s.worn} Grinding:${s.grinding} Seized:${s.seized}`)
  lines.push(`  AvgRatio:${s.avgGearRatio} AvgTeeth:${s.avgTeethCount} AvgLube:${scoreColor(s.avgLubrication)} AvgWear:${scoreColor(s.avgWear)}`)
  lines.push(`  Profiles: involute:${s.involuteProfiles} rough:${s.roughProfiles} broken:${s.brokenProfiles}`)
  lines.push(`  GrindingPts:${s.totalGrindingPoints} SlipPts:${s.totalSlipPoints} PowerLossPts:${s.totalPowerLossPoints}`)
  lines.push(`  BestMeshed:${chalk.green(s.bestMeshed)} | WorstMeshed:${chalk.red(s.worstMeshed)} | MostEfficient:${chalk.cyan(s.mostEfficient)} | MostWorn:${chalk.yellow(s.mostWorn)}`)

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
 * Format gear train result as JSON
 * @example
 * formatGearTrainJson(result) // string
 */
export function formatGearTrainJson(result: GearTrainResult): string {
  return JSON.stringify(result, null, 2)
}
