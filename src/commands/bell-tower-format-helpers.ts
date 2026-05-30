import chalk from 'chalk'
import type { BellTowerResult, Bell } from './bell-tower-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'perfect-pitch': return chalk.rgb(255, 215, 0)(c)
    case 'well-tuned': return chalk.green(c)
    case 'tuned': return chalk.blue(c)
    case 'slightly-off': return chalk.yellow(c)
    case 'out-of-tune': return chalk.rgb(255, 165, 0)(c)
    case 'cracked': return chalk.red(c)
    case 'silent': return chalk.gray(c)
    default: return chalk.dim(c)
  }
}

function chamberColor(c: string): string {
  switch (c) {
    case 'cathedral': return chalk.rgb(255, 215, 0)(c)
    case 'church': return chalk.green(c)
    case 'chapel': return chalk.blue(c)
    case 'belfry': return chalk.yellow(c)
    case 'bell-cot': return chalk.rgb(255, 165, 0)(c)
    case 'silenced': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-ringer': return chalk.rgb(255, 215, 0)(g)
    case 'campanologist': return chalk.green(g)
    case 'ringer': return chalk.blue(g)
    case 'bellhop': return chalk.cyan(g)
    case 'deaf': return chalk.yellow(g)
    case 'tone-deaf': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Bell Formatting ─────────────────────────────────────────────────────────

function formatBell(b: Bell, verbose: boolean): string {
  const line = ` ${conditionColor(b.condition)} ${chalk.bold(b.file)} q:${scoreColor(b.bellQuality)} res:${scoreColor(b.resonance)} sig:${scoreColor(b.signals.signalClarity)} vol:${scoreColor(b.volume)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    type:${b.bellType} tone:${b.tone} pattern:${b.ringing.pattern} reach:${scoreColor(b.reach)} timing:${scoreColor(b.timing)}`)
  details.push(`    signals:exp=${b.signals.exports} err=${b.signals.errors} log=${b.signals.logs} ret=${b.signals.returns} total=${b.signals.totalSignals}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format bell tower result as a table
 * @example
 * formatBellTowerTable(result, false) // string
 */
export function formatBellTowerTable(result: BellTowerResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔔 Bell Tower - Code Signaling/Notification Pattern Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔔 Bells'))
  if (result.bells.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.bells : result.bells.slice(0, 15)
    for (const b of display) {
      lines.push(formatBell(b, verbose))
    }
    if (!verbose && result.bells.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.bells.length - 15} more`))
    }
  }
  lines.push('')

  if (result.chambers.length > 0) {
    lines.push(chalk.bold('🏰 Bell Chambers'))
    for (const c of result.chambers) {
      lines.push(`  ${chalk.bold(c.directory)} ${chamberColor(c.condition)} acoustics:${scoreColor(c.chamberAcoustics)} type:${c.dominantBellType} signals:${c.totalSignals}`)
    }
    lines.push('')
  }

  const ci = result.city
  lines.push(chalk.bold('🏙️ City'))
  lines.push(`  Signals:${ci.totalSignals} Clarity:${scoreColor(ci.avgSignalClarity)} Resonance:${scoreColor(ci.avgResonance)} FalseAlarms:${ci.falseAlarmRate}% Missed:${ci.missedSignalRate}%`)
  lines.push(`  Audible:${ci.isAudible ? chalk.green('YES') : chalk.red('NO')} Acoustics:${scoreColor(ci.overallAcoustics)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.campanologistGrade)} | Files: ${s.totalFiles} | Chambers: ${s.totalChambers} | Acoustics: ${scoreColor(s.overallAcoustics)}`)
  lines.push(`  Church:${s.churchBells} Carillon:${s.carillonBells} Alarm:${s.alarmBells} Silent:${s.silentBells} | Perfect:${s.perfectPitchCount} Cracked:${s.crackedCount}`)
  lines.push(`  FalseAlarms:${s.falseAlarmCount} MissedSignals:${s.missedSignalCount} Noisy:${s.noisySignalCount} SilentFails:${s.silentFailureCount}`)
  lines.push(`  Best:${chalk.green(s.bestBell)} | Worst:${chalk.red(s.worstBell)} | Loud:${chalk.yellow(s.loudestBell)} | Quiet:${chalk.blue(s.quietestBell)}`)

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
 * Format bell tower result as JSON
 * @example
 * formatBellTowerJson(result) // string
 */
export function formatBellTowerJson(result: BellTowerResult): string {
  return JSON.stringify(result, null, 2)
}
