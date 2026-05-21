import chalk from 'chalk'
import type { ShippingLaneResult, CargoVessel, HarborZone, ShippingLaneStats } from './shipping-lane-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'luxury-cruise') return chalk.rgb(255, 215, 0)(c)
  if (c === 'ocean-liner') return chalk.green(c)
  if (c === 'coastal-freighter') return chalk.blue(c)
  if (c === 'fishing-vessel') return chalk.cyan(c)
  if (c === 'lifeboat') return chalk.yellow(c)
  return chalk.red(c)
}

function zoneColor(z: string): string {
  if (z === 'international-hub') return chalk.rgb(255, 215, 0)(z)
  if (z === 'regional-port') return chalk.green(z)
  if (z === 'coastal-harbor') return chalk.blue(z)
  if (z === 'river-dock') return chalk.cyan(z)
  if (z === 'fishing-wharf') return chalk.yellow(z)
  return chalk.red(z)
}

function gradeColor(g: string): string {
  if (g === 'admiral') return chalk.rgb(255, 215, 0)(g)
  if (g === 'captain') return chalk.green(g)
  if (g === 'first-officer') return chalk.blue(g)
  if (g === 'boatswain') return chalk.cyan(g)
  if (g === 'deckhand') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Vessel Formatting ─────────────────────────────────────────────────────

function formatVessel(v: CargoVessel): string {
  return `  ${chalk.bold(v.file)} ${conditionColor(v.condition)} score:${scoreColor(v.qualityScore)} channel:${scoreColor(v.channelDepth)} cargo:${scoreColor(v.cargoHandling)} nav:${scoreColor(v.navigationSafety)}`
}

// ─── Zone Formatting ───────────────────────────────────────────────────────

function formatZone(z: HarborZone): string {
  return `  ${chalk.bold(z.directory)} ${zoneColor(z.zoneType)} channel:${scoreColor(z.avgChannelDepth)} cargo:${scoreColor(z.avgCargoHandling)} nav:${scoreColor(z.avgNavigationSafety)} luxury:${z.luxuryCruiseCount} wrecks:${z.shipwreckCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: ShippingLaneStats): string {
  return [
    `  Grade: ${gradeColor(stats.captainGrade)} | Maritime: ${scoreColor(stats.overallMaritime)} | Files: ${stats.totalFiles} | Zones: ${stats.totalZones}`,
    `  Channel: ${scoreColor(stats.avgChannelDepth)} | Traffic: ${scoreColor(stats.avgTrafficDensity)} | Cargo: ${scoreColor(stats.avgCargoHandling)} | Port: ${scoreColor(stats.avgPortEfficiency)} | Nav: ${scoreColor(stats.avgNavigationSafety)} | Fleet: ${scoreColor(stats.avgFleetManagement)}`,
    `  Conditions: Luxury:${stats.luxuryCruiseCount} Liner:${stats.oceanLinerCount} Freighter:${stats.coastalFreighterCount} Fishing:${stats.fishingVesselCount} Lifeboat:${stats.lifeboatCount} Wreck:${stats.shipwreckCount}`,
    `  Best: ${chalk.green(stats.bestVessel)} | Deepest: ${chalk.cyan(stats.deepestChannel)} | Safest: ${chalk.blue(stats.safestNavigation)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format shipping lane result as a table
 * @example
 * formatShippingLaneTable(result, false) // string
 */
export function formatShippingLaneTable(result: ShippingLaneResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🚢 Shipping Lane - Code Flow/Transport Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🚤 Vessels'))
  if (result.vessels.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.vessels : result.vessels.slice(0, 15)
    for (const v of display) {
      lines.push(formatVessel(v))
    }
    if (!verbose && result.vessels.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.vessels.length - 15} more`))
    }
  }
  lines.push('')

  if (result.zones.length > 0) {
    lines.push(chalk.bold('🏗️ Harbor Zones'))
    for (const z of result.zones) {
      lines.push(formatZone(z))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Harbor Master Notes'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format shipping lane result as JSON
 * @example
 * formatShippingLaneJson(result) // string
 */
export function formatShippingLaneJson(result: ShippingLaneResult): string {
  return JSON.stringify(result, null, 2)
}
