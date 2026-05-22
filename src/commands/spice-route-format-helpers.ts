import chalk from 'chalk'

import type { SpiceRouteResult } from './spice-route-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('golden-age') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'golden-age': return chalk.rgb(46, 204, 113).bold(condition)
    case 'prosperous': return chalk.rgb(52, 152, 219)(condition)
    case 'thriving': return chalk.rgb(155, 89, 182)(condition)
    case 'surviving': return chalk.rgb(241, 196, 15)(condition)
    case 'struggling': return chalk.rgb(230, 126, 34)(condition)
    case 'collapsed': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('grand-merchant') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'grand-merchant': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-trader': return chalk.rgb(52, 152, 219)(grade)
    case 'merchant': return chalk.rgb(155, 89, 182)(grade)
    case 'peddler': return chalk.rgb(241, 196, 15)(grade)
    case 'hawker': return chalk.rgb(230, 126, 34)(grade)
    case 'beggar': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example networkTypeColor('grand-trunk') returns colored string */
export function networkTypeColor(networkType: string): string {
  switch (networkType) {
    case 'grand-trunk': return chalk.rgb(46, 204, 113)(networkType)
    case 'maritime-network': return chalk.rgb(52, 152, 219)(networkType)
    case 'silk-network': return chalk.rgb(155, 89, 182)(networkType)
    case 'regional-trade': return chalk.rgb(241, 196, 15)(networkType)
    case 'local-market': return chalk.rgb(230, 126, 34)(networkType)
    case 'dead-end': return chalk.rgb(231, 76, 60)(networkType)
    default: return networkType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSpiceRouteJson(result) returns JSON string */
export function formatSpiceRouteJson(result: SpiceRouteResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSpiceRouteTable(result, verbose) returns formatted string */
export function formatSpiceRouteTable(result: SpiceRouteResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Spice Route Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  World Overview:'))
  lines.push(`    Overall Prosperity:   ${scoreColor(result.world.overallProsperity)}`)
  lines.push(`    Avg Clarity:          ${scoreColor(result.world.avgClarity)}`)
  lines.push(`    Avg Efficiency:       ${scoreColor(result.world.avgEfficiency)}`)
  lines.push(`    Avg Success:          ${scoreColor(result.world.avgSuccess)}`)
  lines.push(`    Is Prosperous:        ${result.world.isProsperous ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Networks:           ${result.stats.totalNetworks}`)
  lines.push(`    Avg Route Clarity:        ${scoreColor(result.stats.avgRouteClarity)}`)
  lines.push(`    Avg Cargo Value:          ${scoreColor(result.stats.avgCargoValue)}`)
  lines.push(`    Avg Waypoint Quality:     ${scoreColor(result.stats.avgWaypointQuality)}`)
  lines.push(`    Avg Trade Efficiency:     ${scoreColor(result.stats.avgTradeEfficiency)}`)
  lines.push(`    Avg Cultural Exchange:    ${scoreColor(result.stats.avgCulturalExchange)}`)
  lines.push(`    Avg Journey Success:      ${scoreColor(result.stats.avgJourneySuccess)}`)
  lines.push(`    Golden Age:               ${result.stats.goldenAgeCount}`)
  lines.push(`    Prosperous:               ${result.stats.prosperousCount}`)
  lines.push(`    Thriving:                 ${result.stats.thrivingCount}`)
  lines.push(`    Surviving:                ${result.stats.survivingCount}`)
  lines.push(`    Struggling:               ${result.stats.strugglingCount}`)
  lines.push(`    Collapsed:                ${result.stats.collapsedCount}`)
  lines.push(`    Clear Flow:               ${result.stats.hasClearFlowCount}`)
  lines.push(`    High Value:               ${result.stats.hasHighValueCount}`)
  lines.push(`    Quality Control:          ${result.stats.hasQualityControlCount}`)
  lines.push(`    High Efficiency:          ${result.stats.hasHighEfficiencyCount}`)
  lines.push(`    Cultural Exchange:        ${result.stats.hasCulturalExchangeCount}`)
  lines.push(`    Successful:               ${result.stats.isSuccessfulCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Merchant Grade:           ${gradeColor(result.stats.merchantGrade)}`)
  lines.push(`    Best Route:               ${result.stats.bestRoute || 'N/A'}`)
  lines.push(`    Clearest:                 ${result.stats.clearest || 'N/A'}`)
  lines.push(`    Most Valuable:            ${result.stats.mostValuable || 'N/A'}`)
  lines.push(`    Best Waypoints:           ${result.stats.bestWaypoints || 'N/A'}`)
  lines.push(`    Most Efficient:           ${result.stats.mostEfficient || 'N/A'}`)
  lines.push(`    Most Exchanged:           ${result.stats.mostExchanged || 'N/A'}`)
  lines.push('')

  if (verbose && result.routes.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Route Breakdown:'))
    for (const r of result.routes) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(r.file)}`)
      lines.push(`      Condition:             ${conditionColor(r.condition)}`)
      lines.push(`      Quality Score:         ${scoreColor(r.qualityScore)}`)
      lines.push(`      Route Clarity:         ${scoreColor(r.routeClarity)} (${r.route.type})`)
      lines.push(`      Cargo Value:           ${scoreColor(r.cargoValue)} (${r.cargo.type})`)
      lines.push(`      Waypoint Quality:      ${scoreColor(r.waypointQuality)} (${r.waypoint.type})`)
      lines.push(`      Trade Efficiency:      ${scoreColor(r.tradeEfficiency)} (${r.efficiency.mode})`)
      lines.push(`      Cultural Exchange:     ${scoreColor(r.culturalExchange)} (${r.exchange.culture})`)
      lines.push(`      Journey Success:       ${scoreColor(r.journeySuccess)} (${r.journey.status})`)
    }
    lines.push('')
  }

  if (result.networks.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Networks:'))
    for (const n of result.networks) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(n.directory)} — ${networkTypeColor(n.networkType)} (${n.condition})`)
      lines.push(`      Routes: ${n.routes.length}, Golden Age: ${n.goldenAgeCount}, Collapsed: ${n.collapsedCount}, Clear Flow: ${n.clearFlowCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
