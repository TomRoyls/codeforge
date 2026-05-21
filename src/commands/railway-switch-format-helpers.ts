import chalk from 'chalk'
import type { RailwaySwitchResult, RailwaySegment, RailwayDivision, RailwaySwitchStats } from './railway-switch-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'bullet-train') return chalk.rgb(255, 215, 0)(c)
  if (c === 'express-service') return chalk.green(c)
  if (c === 'regional-rail') return chalk.blue(c)
  if (c === 'heritage-line') return chalk.cyan(c)
  if (c === 'narrow-gauge') return chalk.yellow(c)
  return chalk.red(c)
}

function divisionColor(t: string): string {
  if (t === 'high-speed') return chalk.rgb(255, 215, 0)(t)
  if (t === 'main-line') return chalk.green(t)
  if (t === 'branch-line') return chalk.blue(t)
  if (t === 'light-rail') return chalk.cyan(t)
  if (t === 'heritage') return chalk.yellow(t)
  return chalk.red(t)
}

function gradeColor(g: string): string {
  if (g === 'chief-inspector') return chalk.rgb(255, 215, 0)(g)
  if (g === 'station-master') return chalk.green(g)
  if (g === 'signalman') return chalk.blue(g)
  if (g === 'pointsman') return chalk.cyan(g)
  if (g === 'porter') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Segment Formatting ────────────────────────────────────────────────────

function formatSegment(seg: RailwaySegment): string {
  return `  ${chalk.bold(seg.file)} ${conditionColor(seg.condition)} quality:${scoreColor(seg.qualityScore)} track:${scoreColor(seg.trackQuality)} switch:${scoreColor(seg.switchReliability)} signal:${scoreColor(seg.signalClarity)}`
}

// ─── Division Formatting ───────────────────────────────────────────────────

function formatDivision(d: RailwayDivision): string {
  return `  ${chalk.bold(d.directory)} ${divisionColor(d.divisionType)} track:${scoreColor(d.avgTrackQuality)} switch:${scoreColor(d.avgSwitchReliability)} signal:${scoreColor(d.avgSignalClarity)} bullet:${d.bulletTrainCount} derailed:${d.derailmentCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: RailwaySwitchStats): string {
  return [
    `  Grade: ${gradeColor(stats.stationMasterGrade)} | Railway: ${scoreColor(stats.overallRailway)} | Files: ${stats.totalFiles} | Divisions: ${stats.totalDivisions}`,
    `  Track: ${scoreColor(stats.avgTrackQuality)} | Switch: ${scoreColor(stats.avgSwitchReliability)} | Signal: ${scoreColor(stats.avgSignalClarity)} | Timetable: ${scoreColor(stats.avgTimetableAdherence)} | Yard: ${scoreColor(stats.avgYardEfficiency)} | Safety: ${scoreColor(stats.avgSafetySystems)}`,
    `  Conditions: Bullet:${stats.bulletTrainCount} Express:${stats.expressServiceCount} Regional:${stats.regionalRailCount} Heritage:${stats.heritageLineCount} Narrow:${stats.narrowGaugeCount} Derailed:${stats.derailmentCount}`,
    `  Best: ${chalk.green(stats.bestSegment)} | Track: ${chalk.cyan(stats.bestTrack)} | Switch: ${chalk.blue(stats.bestSwitching)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format railway switch result as a table
 * @example
 * formatRailwaySwitchTable(result, false) // string
 */
export function formatRailwaySwitchTable(result: RailwaySwitchResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🚂 Railway Switch - Code Branching/Control Flow Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🛤️  Segments'))
  if (result.segments.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.segments : result.segments.slice(0, 15)
    for (const seg of display) {
      lines.push(formatSegment(seg))
    }
    if (!verbose && result.segments.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.segments.length - 15} more`))
    }
  }
  lines.push('')

  if (result.divisions.length > 0) {
    lines.push(chalk.bold('🏗️  Divisions'))
    for (const d of result.divisions) {
      lines.push(formatDivision(d))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Station Master Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format railway switch result as JSON
 * @example
 * formatRailwaySwitchJson(result) // string
 */
export function formatRailwaySwitchJson(result: RailwaySwitchResult): string {
  return JSON.stringify(result, null, 2)
}
