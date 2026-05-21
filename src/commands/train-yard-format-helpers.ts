import chalk from 'chalk'
import type { RailCar, RailLine, TrainYardResult } from './train-yard-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'express-train': return chalk.rgb(255, 215, 0)(c)
    case 'reliable-service': return chalk.green(c)
    case 'commuter-rail': return chalk.blue(c)
    case 'freight-train': return chalk.cyan(c)
    case 'rusting-hulk': return chalk.yellow(c)
    case 'derailed': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function lineTypeColor(t: string): string {
  switch (t) {
    case 'high-speed-rail': return chalk.rgb(255, 215, 0)(t)
    case 'mainline': return chalk.green(t)
    case 'branch-line': return chalk.blue(t)
    case 'light-rail': return chalk.cyan(t)
    case 'heritage-line': return chalk.yellow(t)
    case 'abandoned-track': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function lineConditionColor(c: string): string {
  switch (c) {
    case 'first-class': return chalk.rgb(255, 215, 0)(c)
    case 'standard-service': return chalk.green(c)
    case 'economy': return chalk.blue(c)
    case 'cargo-only': return chalk.cyan(c)
    case 'disrepair': return chalk.yellow(c)
    case 'wreckage': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'chief-station-master': return chalk.rgb(255, 215, 0)(g)
    case 'station-master': return chalk.green(g)
    case 'dispatcher': return chalk.blue(g)
    case 'conductor': return chalk.cyan(g)
    case 'porter': return chalk.yellow(g)
    case 'hobo': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Car Formatting ──────────────────────────────────────────────────────────

function formatCar(c: RailCar, verbose: boolean): string {
  const line = ` ${conditionColor(c.condition)} ${chalk.bold(c.file)} track:${scoreColor(c.trackQuality)} switch:${scoreColor(c.switchingEfficiency)} signal:${scoreColor(c.signalReliability)} freight:${scoreColor(c.freightHandling)} yard:${scoreColor(c.yardOrganization)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    track: gauge:${scoreColor(c.track.gauge)} standard:${c.track.isStandardGauge ? chalk.green('Y') : chalk.red('N')} narrow:${c.track.isNarrowGauge ? chalk.red('Y') : chalk.green('N')} broad:${c.track.isBroadGauge ? chalk.green('Y') : chalk.red('N')} clear:${c.track.hasClearRoute ? chalk.green('Y') : chalk.red('N')} deadEnds:${c.track.deadEndCount} electrified:${c.track.isElectrified ? chalk.green('Y') : chalk.red('N')} dual:${c.track.isDualTrack ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    switching: switches:${c.switching.switchCount} smooth:${c.switching.hasSmoothSwitches ? chalk.green('Y') : chalk.red('N')} jarring:${c.switching.jarringCount} broken:${c.switching.brokenCount} redundant:${c.switching.hasRedundantSwitches ? chalk.yellow('Y') : chalk.green('N')} eff:${scoreColor(c.switching.efficiency)}`)
  details.push(`    signal: count:${c.signal.signalCount} reliable:${c.signal.isReliable ? chalk.green('Y') : chalk.red('N')} blind:${c.signal.blindSpotCount} false:${c.signal.falseSignalCount} dark:${c.signal.darkSignalCount}`)
  details.push(`    freight: cargo:${c.freight.cargo} capacity:${scoreColor(c.freight.capacity)} loaded:${c.freight.isLoaded ? chalk.green('Y') : chalk.red('N')} empty:${c.freight.isEmpty ? chalk.yellow('Y') : chalk.green('N')} overloaded:${c.freight.isOverloaded ? chalk.red('Y') : chalk.green('N')} hazmat:${c.freight.hasHazmat ? chalk.rgb(255, 69, 0)('Y') : chalk.green('N')} condition:${c.freight.cargoCondition}`)
  details.push(`    yard: organized:${c.yard.isOrganized ? chalk.green('Y') : chalk.red('N')} roundhouse:${c.yard.hasRoundhouse ? chalk.green('Y') : chalk.red('N')} turntable:${c.yard.hasTurntable ? chalk.green('Y') : chalk.red('N')} freightHouse:${c.yard.hasFreightHouse ? chalk.green('Y') : chalk.red('N')} controlTower:${c.yard.hasControlTower ? chalk.green('Y') : chalk.red('N')} layout:${c.yard.layout}`)
  details.push(`    schedule: onTime:${c.schedule.isOnTime ? chalk.green('Y') : chalk.red('N')} delays:${c.schedule.delayCount} express:${c.schedule.expressCount} local:${c.schedule.hasLocal ? chalk.yellow('Y') : chalk.green('N')} freight:${c.schedule.hasFreight ? chalk.cyan('Y') : chalk.green('N')}`)
  return details.join('\n')
}

// ─── Line Formatting ─────────────────────────────────────────────────────────

function formatLine(l: RailLine): string {
  return `  ${chalk.bold(l.directory)} ${lineTypeColor(l.lineType)} ${lineConditionColor(l.condition)} cars:${l.cars.length} track:${scoreColor(l.avgTrackQuality)} switch:${scoreColor(l.avgSwitchingEfficiency)} signal:${scoreColor(l.avgSignalReliability)} freight:${scoreColor(l.avgFreightHandling)} express:${l.expressCount} derailed:${l.derailedCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format train yard result as a table
 * @example
 * formatTrainYardTable(result, false) // string
 */
export function formatTrainYardTable(result: TrainYardResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🚂  Train Yard - Code Data Flow/Transport Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🚃 Rail Cars'))
  if (result.cars.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.cars : result.cars.slice(0, 15)
    for (const c of display) {
      lines.push(formatCar(c, verbose))
    }
    if (!verbose && result.cars.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.cars.length - 15} more`))
    }
  }
  lines.push('')

  if (result.lines.length > 0) {
    lines.push(chalk.bold('🛤️ Rail Lines'))
    for (const l of result.lines) {
      lines.push(formatLine(l))
    }
    lines.push('')
  }

  const net = result.network
  lines.push(chalk.bold('🌐 Network'))
  lines.push(`  Track:${scoreColor(net.avgTrackQuality)} Switching:${scoreColor(net.avgSwitchingEfficiency)} Signal:${scoreColor(net.avgSignalReliability)} Freight:${scoreColor(net.avgFreightHandling)} OnSchedule:${net.isOnSchedule ? chalk.green('YES') : chalk.red('NO')} Efficiency:${scoreColor(net.overallEfficiency)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.stationMasterGrade)} | Efficiency: ${scoreColor(s.overallEfficiency)} | Files: ${s.totalFiles} | Lines: ${s.totalLines}`)
  lines.push(`  Express:${s.expressTrainCount} Reliable:${s.reliableServiceCount} Commuter:${s.commuterRailCount} Freight:${s.freightTrainCount} Rusting:${s.rustingHulkCount} Derailed:${s.derailedCount}`)
  lines.push(`  HighSpeed:${s.highSpeedRailCount} Mainline:${s.mainlineCount} Branch:${s.branchLineCount} Abandoned:${s.abandonedTrackCount}`)
  lines.push(`  Switches:${s.totalSwitches} Signals:${s.totalSignals} DeadEnds:${s.totalDeadEnds} BlindSpots:${s.totalBlindSpots} DarkSignals:${s.totalDarkSignals}`)
  lines.push(`  Electrified:${s.electrifiedCount} StandardGauge:${s.standardGaugeCount} Hazmat:${s.hasHazmatCount} YardOrg:${scoreColor(s.avgYardOrganization)}`)
  lines.push(`  Best:${chalk.green(s.bestTrack)} | Worst:${chalk.red(s.worstTrack)} | Reliable:${chalk.blue(s.mostReliable)} | Derailments:${chalk.red(s.mostDerailments)} | Busiest:${chalk.cyan(s.busiest)}`)

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
 * Format train yard result as JSON
 * @example
 * formatTrainYardJson(result) // string
 */
export function formatTrainYardJson(result: TrainYardResult): string {
  return JSON.stringify(result, null, 2)
}
