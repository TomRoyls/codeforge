import chalk from 'chalk'
import type { PendulumResult, PendulumSwing, PendulumClock } from './pendulum-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function patternColor(p: string): string {
  switch (p) {
    case 'simple-harmonic': return chalk.green(p)
    case 'damped': return chalk.blue(p)
    case 'critically-damped': return chalk.cyan(p)
    case 'overdamped': return chalk.magenta(p)
    case 'forced': return chalk.yellow(p)
    case 'chaotic': return chalk.red(p)
    default: return chalk.dim(p)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'perfectly-timed': return chalk.rgb(255, 215, 0)(c)
    case 'well-regulated': return chalk.green(c)
    case 'steady': return chalk.blue(c)
    case 'wobbling': return chalk.yellow(c)
    case 'chaotic': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function clockCondColor(c: string): string {
  switch (c) {
    case 'precision-clock': return chalk.rgb(255, 215, 0)(c)
    case 'clock': return chalk.green(c)
    case 'timepiece': return chalk.blue(c)
    case 'sundial': return chalk.yellow(c)
    case 'hourglass': return chalk.rgb(255, 165, 0)(c)
    case 'stopped': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-horologist': return chalk.rgb(255, 215, 0)(g)
    case 'horologist': return chalk.green(g)
    case 'watchmaker': return chalk.blue(g)
    case 'clockmaker': return chalk.cyan(g)
    case 'tinkerer': return chalk.yellow(g)
    case 'child': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function displacementColor(d: number): string {
  if (d > 30) return chalk.red(`+${d}`)
  if (d > 10) return chalk.yellow(`+${d}`)
  if (d < -30) return chalk.blue(String(d))
  if (d < -10) return chalk.cyan(String(d))
  return chalk.green(`±${Math.abs(d)}`)
}

// ─── Swing Formatting ────────────────────────────────────────────────────────

function formatSwing(s: PendulumSwing, verbose: boolean): string {
  const line = ` ${conditionColor(s.condition)} ${patternColor(s.swingPattern)} ${chalk.bold(s.file)} q:${scoreColor(s.qualityScore)} eq:${scoreColor(s.equilibrium)} amp:${scoreColor(s.amplitude)}`

  if (!verbose) return line
  const details = [line]
  const d = s.displacement
  details.push(`    eng:${displacementColor(d.engineering)} abs:${displacementColor(d.abstraction)} cpl:${displacementColor(d.coupling)} doc:${displacementColor(d.documentation)} tst:${displacementColor(d.testing)} cpx:${displacementColor(d.complexity)}`)
  details.push(`    phase:${s.phase} dir:${s.oscillation.swingDirection} damp:${scoreColor(s.damping)} freq:${scoreColor(s.frequency)} energy:${scoreColor(s.energy.total)}${s.energy.isConserved ? chalk.green(' CON') : chalk.red(' DIS')}`)
  return details.join('\n')
}

// ─── Clock Formatting ────────────────────────────────────────────────────────

function formatClock(c: PendulumClock, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${clockCondColor(c.condition)} accuracy:${scoreColor(c.clockAccuracy)} swings:${c.swings.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    eq:${scoreColor(c.avgEquilibrium)} amp:${scoreColor(c.avgAmplitude)} damp:${scoreColor(c.avgDamping)} dev:${scoreColor(c.avgDeviation)} balanced:${c.balancedCount} chaotic:${c.chaoticCount} stuck:${c.stuckCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format pendulum result as a table
 * @example
 * formatPendulumTable(result, false) // string
 */
export function formatPendulumTable(result: PendulumResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⏱️ Pendulum - Code Oscillation Pattern Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔄 Pendulum Swings'))
  if (result.swings.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.swings : result.swings.slice(0, 15)
    for (const s of display) {
      lines.push(formatSwing(s, verbose))
    }
    if (!verbose && result.swings.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.swings.length - 15} more`))
    }
  }
  lines.push('')

  if (result.clocks.length > 0) {
    lines.push(chalk.bold('🕰️ Pendulum Clocks'))
    for (const c of result.clocks) {
      lines.push(formatClock(c, verbose))
    }
    lines.push('')
  }

  const sys = result.system
  lines.push(chalk.bold('⚙️ System'))
  lines.push(`  Equilibrium: ${scoreColor(sys.avgEquilibrium)} | Amplitude: ${scoreColor(sys.avgAmplitude)} | Deviation: ${scoreColor(sys.avgDeviation)} | Energy: ${scoreColor(sys.totalEnergy)}`)
  lines.push(`  Stable: ${sys.isSystemStable ? chalk.green('YES') : chalk.yellow('NO')} | Dominant: ${patternColor(sys.dominantOscillation)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.horologistGrade)} | Files: ${s.totalFiles} | Clocks: ${s.totalClocks} | Balance: ${scoreColor(s.overallBalance)}`)
  lines.push(`  SH:${s.simpleHarmonic} Dmp:${s.damped} Frc:${s.forced} Cha:${s.chaotic} | Balanced:${s.balancedFiles} Swinging:${s.swingingFiles} Stuck:${s.stuckFiles} Chaotic:${s.chaoticFiles}`)
  lines.push(`  OverEng:${s.overEngineered} UnderEng:${s.underEngineered} OverAbs:${s.overAbstract} Concrete:${s.tooConcrete} Coupled:${s.overCoupled} Isolated:${s.isolated}`)
  lines.push(`  Best: ${chalk.green(s.mostBalanced)} | Worst: ${chalk.red(s.leastBalanced)} | Chaotic: ${chalk.rgb(255, 165, 0)(s.mostChaotic)} | BestClock: ${chalk.blue(s.bestRegulated)}`)

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
 * Format pendulum result as JSON
 * @example
 * formatPendulumJson(result) // string
 */
export function formatPendulumJson(result: PendulumResult): string {
  return JSON.stringify(result, null, 2)
}
