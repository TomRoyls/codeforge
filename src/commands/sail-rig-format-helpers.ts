import chalk from 'chalk'
import type { SailPanel, Fleet, SailRigResult } from './sail-rig-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function sailColor(t: string): string {
  switch (t) {
    case 'main-sail': return chalk.rgb(255, 215, 0)(t)
    case 'jib': return chalk.green(t)
    case 'genoa': return chalk.blue(t)
    case 'spinnaker': return chalk.magenta(t)
    case 'lateen': return chalk.cyan(t)
    case 'square': return chalk.yellow(t)
    case 'storm-sail': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'yacht-racer': return chalk.rgb(255, 215, 0)(c)
    case 'well-rigged': return chalk.green(c)
    case 'sloop': return chalk.blue(c)
    case 'schooner': return chalk.cyan(c)
    case 'bare-poles': return chalk.yellow(c)
    case 'sinking': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function fleetTypeColor(t: string): string {
  switch (t) {
    case 'racing-fleet': return chalk.rgb(255, 215, 0)(t)
    case 'cruising-fleet': return chalk.green(t)
    case 'fishing-fleet': return chalk.blue(t)
    case 'harbor-fleet': return chalk.cyan(t)
    case 'ghost-fleet': return chalk.yellow(t)
    case 'shipwreck': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function fleetConditionColor(c: string): string {
  switch (c) {
    case 'regatta-ready': return chalk.rgb(255, 215, 0)(c)
    case 'seaworthy': return chalk.green(c)
    case 'sailable': return chalk.blue(c)
    case 'barely-afloat': return chalk.yellow(c)
    case 'taking-water': return chalk.red(c)
    case 'sunk': return chalk.dim(c)
    default: return c
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'yacht-captain': return chalk.rgb(255, 215, 0)(g)
    case 'captain': return chalk.green(g)
    case 'first-mate': return chalk.blue(g)
    case 'sailor': return chalk.cyan(g)
    case 'deckhand': return chalk.yellow(g)
    case 'landlubber': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Panel Formatting ────────────────────────────────────────────────────────

function formatPanel(panel: SailPanel, verbose: boolean): string {
  const line = ` ${conditionColor(panel.condition)} ${chalk.bold(panel.file)} ${sailColor(panel.sail.type)} area:${scoreColor(panel.sailArea)} wind:${scoreColor(panel.windCapture)} trim:${scoreColor(panel.sailTrim)} speed:${scoreColor(panel.hullSpeed)} ballast:${scoreColor(panel.ballast)} rig:${scoreColor(panel.riggingOverhead)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    sail: set:${panel.sail.isProperlySet ? chalk.green('Y') : chalk.red('N')} trimmed:${panel.sail.isTrimmed ? chalk.green('Y') : chalk.red('N')} luffing:${panel.sail.isLuffing ? chalk.yellow('Y') : chalk.green('N')} flogging:${panel.sail.isFlogging ? chalk.red('Y') : chalk.green('N')} reefs:${panel.sail.reefCount} draft:${scoreColor(panel.sail.draft)}`)
  details.push(`    wind: capture:${scoreColor(panel.wind.capture)} angle:${panel.wind.apparentAngle}° point:${panel.wind.pointOfSail} irons:${panel.wind.isInIrons ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    hull: clean:${panel.hull.isClean ? chalk.green('Y') : chalk.red('N')} barnacles:${panel.hull.barnacleCount} drag:${panel.hull.hasDrag ? chalk.red('Y') : chalk.green('N')} waterline:${scoreColor(panel.hull.waterlineLength)} displacement:${scoreColor(panel.hull.displacement)}`)
  details.push(`    ballast: weight:${scoreColor(panel.ballastDetail.weight)} balanced:${panel.ballastDetail.isBalanced ? chalk.green('Y') : chalk.red('N')} keel:${panel.ballastDetail.keelType} stability:${scoreColor(panel.ballastDetail.stabilityScore)}`)
  details.push(`    rigging: lines:${panel.rigging.lineCount} taut:${panel.rigging.isTaut ? chalk.green('Y') : chalk.red('N')} tangles:${panel.rigging.tangleCount} chafe:${panel.rigging.chafePoints} overhead:${scoreColor(panel.rigging.overheadRatio)}%`)
  details.push(`    nav: compass:${panel.navigation.hasCompass ? chalk.green('Y') : chalk.red('N')} chart:${panel.navigation.hasChart ? chalk.green('Y') : chalk.red('N')} log:${panel.navigation.hasLog ? chalk.yellow('Y') : chalk.green('N')} depth:${panel.navigation.hasDepthSounder ? chalk.green('Y') : chalk.red('N')} onCourse:${panel.navigation.isOnCourse ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Fleet Formatting ────────────────────────────────────────────────────────

function formatFleet(fleet: Fleet): string {
  return `  ${chalk.bold(fleet.directory)} ${fleetTypeColor(fleet.fleetType)} ${fleetConditionColor(fleet.condition)} panels:${fleet.panels.length} trim:${scoreColor(fleet.avgSailTrim)} speed:${scoreColor(fleet.avgHullSpeed)} ballast:${scoreColor(fleet.avgBallast)} rig:${scoreColor(fleet.avgRiggingOverhead)} yacht:${fleet.yachtRacerCount} sinking:${fleet.sinkingCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format sail rig result as a table
 * @example
 * formatSailRigTable(result, false) // string
 */
export function formatSailRigTable(result: SailRigResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⛵  Sail Rig - Code Efficiency/Propulsion Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🪪 Panels'))
  if (result.panels.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.panels : result.panels.slice(0, 15)
    for (const panel of display) {
      lines.push(formatPanel(panel, verbose))
    }
    if (!verbose && result.panels.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.panels.length - 15} more`))
    }
  }
  lines.push('')

  if (result.fleets.length > 0) {
    lines.push(chalk.bold('🚢 Fleets'))
    for (const fleet of result.fleets) {
      lines.push(formatFleet(fleet))
    }
    lines.push('')
  }

  const r = result.regatta
  lines.push(chalk.bold('🏆 Regatta'))
  lines.push(`  Trim:${scoreColor(r.avgSailTrim)} Speed:${scoreColor(r.avgHullSpeed)} Ballast:${scoreColor(r.avgBallast)} Rig:${scoreColor(r.avgRiggingOverhead)} Seaworthy:${r.isSeaworthy ? chalk.green('YES') : chalk.red('NO')} Efficiency:${scoreColor(r.overallEfficiency)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.captainGrade)} | Efficiency: ${scoreColor(s.overallEfficiency)} | Files: ${s.totalFiles} | Fleets: ${s.totalFleets}`)
  lines.push(`  Yacht:${s.yachtRacerCount} Rigged:${s.wellRiggedCount} Sloop:${s.sloopCount} Schooner:${s.schoonerCount} BarePoles:${s.barePolesCount} Sinking:${s.sinkingCount}`)
  lines.push(`  Main:${s.mainSailCount} Spin:${s.spinnakerCount} Storm:${s.stormSailCount} | Luffing:${s.isLuffingCount} Irons:${s.isInIronsCount} Barnacles:${s.hasBarnaclesCount} Drag:${s.hasDragCount} Tangles:${s.hasTanglesCount}`)
  lines.push(`  OnCourse:${s.isOnCourseCount} Compass:${s.hasCompassCount} | Fin:${s.finKeelCount} NoKeel:${s.noKeelCount}`)
  lines.push(`  Best:${chalk.green(s.bestRigged)} | Fastest:${chalk.blue(s.fastest)} | Stable:${chalk.cyan(s.mostStable)} | Tangled:${chalk.yellow(s.mostTangled)} | Barnacled:${chalk.red(s.mostBarnacled)}`)

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
 * Format sail rig result as JSON
 * @example
 * formatSailRigJson(result) // string
 */
export function formatSailRigJson(result: SailRigResult): string {
  return JSON.stringify(result, null, 2)
}
