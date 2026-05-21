import chalk from 'chalk'
import type { SignalFlame, FireTower, SignalFireResult } from './signal-fire-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'blazing-beacon': return chalk.rgb(255, 215, 0)(c)
    case 'bright-signal': return chalk.green(c)
    case 'steady-flame': return chalk.blue(c)
    case 'smoky': return chalk.yellow(c)
    case 'dying-ember': return chalk.rgb(255, 165, 0)(c)
    case 'cold-ashes': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function towerColor(t: string): string {
  switch (t) {
    case 'watchtower': return chalk.rgb(255, 215, 0)(t)
    case 'lighthouse': return chalk.green(t)
    case 'relay-station': return chalk.blue(t)
    case 'bonfire': return chalk.cyan(t)
    case 'campfire': return chalk.yellow(t)
    case 'dark-tower': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function towerConditionColor(c: string): string {
  switch (c) {
    case 'fire-network': return chalk.rgb(255, 215, 0)(c)
    case 'well-lit': return chalk.green(c)
    case 'patchy-coverage': return chalk.blue(c)
    case 'dim': return chalk.yellow(c)
    case 'mostly-dark': return chalk.rgb(255, 165, 0)(c)
    case 'blackout': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-signalman': return chalk.rgb(255, 215, 0)(g)
    case 'signalman': return chalk.green(g)
    case 'fire-keeper': return chalk.blue(g)
    case 'scout': return chalk.cyan(g)
    case 'novice': return chalk.yellow(g)
    case 'sleeper': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Flame Formatting ────────────────────────────────────────────────────────

function formatFlame(f: SignalFlame, verbose: boolean): string {
  const line = ` ${conditionColor(f.condition)} ${chalk.bold(f.file)} flame:${scoreColor(f.flameHeight)} smoke:${scoreColor(f.smokeClarity)} range:${scoreColor(f.signalRange)} fuel:${scoreColor(f.fuelQuality)} protocol:${scoreColor(f.protocolCompliance)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    flame: height:${scoreColor(f.flame.height)} color:${f.flame.color} steady:${f.flame.isSteady ? chalk.green('Y') : chalk.red('N')} flickering:${f.flame.isFlickering ? chalk.red('Y') : chalk.green('N')} smoky:${f.flame.isSmoky ? chalk.red('Y') : chalk.green('N')} dying:${f.flame.isDying ? chalk.red('Y') : chalk.green('N')} out:${f.flame.isOut ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    smoke: clarity:${scoreColor(f.smoke.clarity)} signals:${f.smoke.signals.length} false:${f.smoke.hasFalseSignals ? chalk.red('Y') : chalk.green('N')} none:${f.smoke.hasNoSignals ? chalk.red('Y') : chalk.green('N')} old:${f.smoke.hasOldSignals ? chalk.yellow('Y') : chalk.green('N')} strong:${f.smoke.hasStrongSignals ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    fuel: name:${scoreColor(f.fuel.nameQuality)} comment:${scoreColor(f.fuel.commentQuality)} doc:${scoreColor(f.fuel.docQuality)} types:${scoreColor(f.fuel.typeAnnotations)} seasoned:${f.fuel.hasSeasoned ? chalk.green('Y') : chalk.red('N')} dry:${f.fuel.hasDry ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    protocol: style:${f.protocol.followsStyle ? chalk.green('Y') : chalk.red('N')} naming:${f.protocol.followsNaming ? chalk.green('Y') : chalk.red('N')} structure:${f.protocol.followsStructure ? chalk.green('Y') : chalk.red('N')} violations:${f.protocol.violations.length}`)
  details.push(`    beacon: lit:${f.beacon.isLit ? chalk.green('Y') : chalk.red('N')} visible:${f.beacon.isVisible ? chalk.green('Y') : chalk.red('N')} maintained:${f.beacon.isMaintained ? chalk.green('Y') : chalk.red('N')} keeper:${f.beacon.hasKeeper ? chalk.green('Y') : chalk.red('N')} tended:${f.beacon.lastTended}`)
  details.push(`    network: signalsTo:${f.network.signalsToOthers} from:${f.network.receivesFromOthers} relays:${f.network.relayCount} hub:${f.network.isHub ? chalk.green('Y') : chalk.red('N')} endpoint:${f.network.isEndpoint ? chalk.yellow('Y') : chalk.green('N')} deadRelay:${f.network.hasDeadRelay ? chalk.red('Y') : chalk.green('N')}`)
  return details.join('\n')
}

// ─── Tower Formatting ────────────────────────────────────────────────────────

function formatTower(t: FireTower): string {
  return `  ${chalk.bold(t.directory)} ${towerColor(t.towerType)} ${towerConditionColor(t.condition)} flame:${scoreColor(t.avgFlameHeight)} smoke:${scoreColor(t.avgSmokeClarity)} range:${scoreColor(t.avgSignalRange)} consistent:${scoreColor(t.avgConsistency)} blazing:${t.blazingCount} cold:${t.coldCount} density:${scoreColor(t.networkDensity)}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format signal fire result as a table
 * @example
 * formatSignalFireTable(result, false) // string
 */
export function formatSignalFireTable(result: SignalFireResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔥  Signal Fire - Communication/Intent Signaling Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🕯️  Signal Flames'))
  if (result.flames.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.flames : result.flames.slice(0, 15)
    for (const f of display) {
      lines.push(formatFlame(f, verbose))
    }
    if (!verbose && result.flames.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.flames.length - 15} more`))
    }
  }
  lines.push('')

  if (result.towers.length > 0) {
    lines.push(chalk.bold('🗼 Fire Towers'))
    for (const t of result.towers) {
      lines.push(formatTower(t))
    }
    lines.push('')
  }

  const n = result.network
  lines.push(chalk.bold('🌐 Network Overview'))
  lines.push(`  FlameHeight:${scoreColor(n.avgFlameHeight)} SmokeClarity:${scoreColor(n.avgSmokeClarity)} SignalRange:${scoreColor(n.avgSignalRange)} Consistency:${scoreColor(n.avgConsistency)} Signals:${n.totalSignals} WellLit:${n.isWellLit ? chalk.green('YES') : chalk.red('NO')} Visibility:${scoreColor(n.overallVisibility)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.signalmanGrade)} | Visibility: ${scoreColor(s.overallVisibility)} | Files: ${s.totalFiles} | Towers: ${s.totalTowers}`)
  lines.push(`  Blazing:${s.blazingBeaconCount} Bright:${s.brightSignalCount} Steady:${s.steadyFlameCount} Smoky:${s.smokyCount} Dying:${s.dyingEmberCount} Cold:${s.coldAshesCount}`)
  lines.push(`  FuelQuality:${scoreColor(s.avgFuelQuality)} ProtocolCompliance:${scoreColor(s.avgProtocolCompliance)} FireConsistency:${scoreColor(s.avgFireConsistency)}`)
  lines.push(`  LitBeacons:${s.litBeacons} Maintained:${s.maintainedBeacons} Hubs:${s.hubNodes} Endpoints:${s.endpointNodes} Relays:${s.relayNodes}`)
  lines.push(`  FalseSignals:${s.hasFalseSignals} OldSignals:${s.hasOldSignals} StrongSignals:${s.hasStrongSignals} Violations:${s.totalProtocolViolations}`)
  lines.push(`  Brightest:${chalk.green(s.brightestFlame)} | Dimmest:${chalk.red(s.dimmestFlame)} | Clearest:${chalk.cyan(s.clearestSmoke)}`)
  lines.push(`  MostCompliant:${chalk.blue(s.mostCompliant)} | MostDeceptive:${chalk.rgb(255, 69, 0)(s.mostDeceptive)}`)

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
 * Format signal fire result as JSON
 * @example
 * formatSignalFireJson(result) // string
 */
export function formatSignalFireJson(result: SignalFireResult): string {
  return JSON.stringify(result, null, 2)
}
