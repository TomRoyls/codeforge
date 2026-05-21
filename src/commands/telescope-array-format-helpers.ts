import chalk from 'chalk'
import type { TelescopeArrayResult, ArrayDish, ArrayConfiguration, BaselinePair } from './telescope-array-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function dishTypeColor(t: string): string {
  switch (t) {
    case 'phased-array': return chalk.rgb(255, 215, 0)(t)
    case 'parabolic': return chalk.green(t)
    case 'cassegrain': return chalk.blue(t)
    case 'spherical': return chalk.cyan(t)
    case 'offset': return chalk.magenta(t)
    case 'flat-panel': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'optimal': return chalk.rgb(255, 215, 0)(c)
    case 'good': return chalk.green(c)
    case 'fair': return chalk.blue(c)
    case 'needs-maintenance': return chalk.yellow(c)
    case 'damaged': return chalk.rgb(255, 165, 0)(c)
    case 'offline': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function configCondColor(c: string): string {
  switch (c) {
    case 'world-class': return chalk.rgb(255, 215, 0)(c)
    case 'research-grade': return chalk.green(c)
    case 'survey-grade': return chalk.blue(c)
    case 'educational': return chalk.yellow(c)
    case 'amateur': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'director': return chalk.rgb(255, 215, 0)(g)
    case 'senior-astronomer': return chalk.green(g)
    case 'astronomer': return chalk.blue(g)
    case 'observer': return chalk.cyan(g)
    case 'amateur': return chalk.yellow(g)
    case 'light-polluted': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Dish Formatting ─────────────────────────────────────────────────────────

function formatDish(d: ArrayDish, verbose: boolean): string {
  const line = ` ${conditionColor(d.condition)} ${dishTypeColor(d.dishType)} ${chalk.bold(d.file)} q:${scoreColor(d.qualityScore)} snr:${scoreColor(d.signalToNoise)} rpwr:${scoreColor(d.resolvingPower)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    aperture:${scoreColor(d.apertureDiameter)} signal:${scoreColor(d.signalStrength)} noise:${scoreColor(d.noiseLevel)} rx:${scoreColor(d.receiverQuality)} proc:${scoreColor(d.dataProcessingQuality)}`)
  details.push(`    cal:${scoreColor(d.calibration.calibrationAccuracy)}${d.calibration.isCalibrated ? chalk.green(' OK') : chalk.red(' !')} pointing:${scoreColor(d.pointing.accuracy)}${d.pointing.isOnTarget ? chalk.green(' ON') : chalk.red(' OFF')}`)
  return details.join('\n')
}

// ─── Baseline Formatting ─────────────────────────────────────────────────────

function formatBaseline(b: BaselinePair): string {
  const typeIcon = b.interferenceType === 'constructive' ? chalk.green('+') :
    b.interferenceType === 'destructive' ? chalk.red('-') : chalk.dim('~')
  return `  ${typeIcon} ${b.dishA} <-> ${b.dishB} bl:${scoreColor(b.baselineLength)} corr:${scoreColor(b.correlationQuality)} phase:${scoreColor(b.phaseAlignment)}${b.isCoherent ? chalk.green(' COH') : chalk.red(' INC')}`
}

// ─── Configuration Formatting ────────────────────────────────────────────────

function formatConfig(c: ArrayConfiguration, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${configCondColor(c.condition)} health:${scoreColor(c.arrayHealth)} rpwr:${scoreColor(c.resolvingPower)} dishes:${c.dishes.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    aperture:${scoreColor(c.totalAperture)} synth:${scoreColor(c.apertureSynthesis)} snr:${scoreColor(c.avgSignalToNoise)} cal:${scoreColor(c.avgCalibration)} type:${c.arrayType} config:${c.configuration}`)
  details.push(`    optimal:${c.optimalDishes} damaged:${c.damagedDishes} offline:${c.offlineDishes} coherent:${c.coherentPairs} incoherent:${c.incoherentPairs}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format telescope array result as a table
 * @example
 * formatTelescopeArrayTable(result, false) // string
 */
export function formatTelescopeArrayTable(result: TelescopeArrayResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📡 Telescope Array - Distributed Analysis Power\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔭 Array Dishes'))
  if (result.dishes.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.dishes : result.dishes.slice(0, 15)
    for (const d of display) {
      lines.push(formatDish(d, verbose))
    }
    if (!verbose && result.dishes.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.dishes.length - 15} more`))
    }
  }
  lines.push('')

  if (result.configurations.length > 0) {
    lines.push(chalk.bold('🏗️ Array Configurations'))
    for (const c of result.configurations) {
      lines.push(formatConfig(c, verbose))
    }
    lines.push('')
  }

  const ifm = result.interferometer
  lines.push(chalk.bold('🌌 Interferometer'))
  lines.push(`  ResolvingPower: ${scoreColor(ifm.totalResolvingPower)} | Aperture: ${scoreColor(ifm.totalAperture)} | SNR: ${scoreColor(ifm.avgSignalToNoise)} | Power: ${scoreColor(ifm.overallPower)}`)
  lines.push(`  Coherent: ${ifm.isCoherent ? chalk.green('YES') : chalk.red('NO')} | Constructive: ${ifm.constructivePairs} | Destructive: ${ifm.destructivePairs}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.astronomerGrade)} | Files: ${s.totalFiles} | Configs: ${s.totalConfigurations} | Baselines: ${s.totalBaselines}`)
  lines.push(`  Aperture:${scoreColor(s.avgAperture)} RPwr:${scoreColor(s.avgResolvingPower)} Signal:${scoreColor(s.avgSignalStrength)} Noise:${scoreColor(s.avgNoiseLevel)} SNR:${scoreColor(s.avgSignalToNoise)}`)
  lines.push(`  Optimal:${s.optimalDishes} Damaged:${s.damagedDishes} Offline:${s.offlineDishes} Coherent:${s.coherentPairs} Incoherent:${s.incoherentPairs}`)
  lines.push(`  Best: ${chalk.green(s.bestDish)} | Worst: ${chalk.red(s.worstDish)} | Strongest: ${chalk.blue(s.strongestPair)} | Noisiest: ${chalk.rgb(255, 165, 0)(s.noisiestDish)}`)

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
 * Format telescope array result as JSON
 * @example
 * formatTelescopeArrayJson(result) // string
 */
export function formatTelescopeArrayJson(result: TelescopeArrayResult): string {
  return JSON.stringify(result, null, 2)
}
