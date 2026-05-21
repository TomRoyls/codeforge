import chalk from 'chalk'

import type { SpiceRouteResult } from './spice-route-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatSpiceRouteTable(result: SpiceRouteResult, verbose: boolean): string {
  const { waypoints, routes, stats, network, recommendations } = result
  const lines: string[] = [chalk.bold('\n🐫 Spice Route Report'), '']

  lines.push(chalk.bold('Trade Network:'))
  lines.push(`  Overall Trade Health: ${chalk.yellow(String(network.overallTradeHealth))}/100`)
  lines.push(`  Avg Cargo Value:      ${chalk.green(String(network.avgCargoValue))}/100`)
  lines.push(`  Avg Route Efficiency: ${chalk.cyan(String(network.avgRouteEfficiency))}/100`)
  lines.push(`  Avg Safety:           ${chalk.blue(String(network.avgSafety))}/100`)
  lines.push(`  Avg Trust:            ${chalk.magenta(String(network.avgTrust))}/100`)
  lines.push(`  Is Prosperous:        ${network.isProsperous ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Merchant Grade:       ${chalk.yellow(stats.merchantGrade)}`)
  lines.push('')

  if (routes.length > 0) {
    lines.push(chalk.bold('Trade Routes:'))
    for (const route of routes) {
      const condColor = route.condition === 'golden-age' || route.condition === 'prosperous-trade'
        ? chalk.green
        : route.condition === 'active-commerce'
          ? chalk.cyan
          : route.condition === 'declining-trade'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(route.directory, 30)} ${condColor(route.condition)} (${route.waypoints.length} waypoints, ${route.routeType})`)
    }
    lines.push('')
  }

  if (verbose && waypoints.length > 0) {
    lines.push(chalk.bold('Trade Waypoints:'))
    lines.push('')
    const colWidths = {
      condition: 16,
      cargo: 8,
      file: Math.max(20, ...waypoints.map((w) => w.file.length)),
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Cargo', colWidths.cargo)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.cargo + colWidths.quality + colWidths.condition + 6)))

    for (const w of waypoints) {
      const condColor = w.condition === 'silk-road-hub' ? chalk.yellow
        : w.condition === 'major-port' ? chalk.green
          : w.condition === 'trading-post' ? chalk.cyan
            : w.condition === 'waystation' ? chalk.blue
              : w.condition === 'ghost-town' ? chalk.gray
                : chalk.red
      lines.push(
        padRight(w.file, colWidths.file) + '  ' +
        padLeft(String(w.cargoValue), colWidths.cargo) + '  ' +
        padLeft(String(w.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(w.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:              ${stats.totalFiles}`)
  lines.push(`  Total Routes:             ${stats.totalRoutes}`)
  lines.push(`  Avg Cargo Value:          ${stats.avgCargoValue}`)
  lines.push(`  Avg Route Efficiency:     ${stats.avgRouteEfficiency}`)
  lines.push(`  Avg Toll Station Count:   ${stats.avgTollStationCount}`)
  lines.push(`  Avg Trade Volume:         ${stats.avgTradeVolume}`)
  lines.push(`  Avg Route Safety:         ${stats.avgRouteSafety}`)
  lines.push(`  Avg Merchant Trust:       ${stats.avgMerchantTrust}`)
  lines.push('')
  lines.push(chalk.bold('Waypoint Conditions:'))
  lines.push(`  Silk Road Hubs:           ${chalk.yellow(String(stats.silkRoadHubCount))}`)
  lines.push(`  Major Ports:              ${chalk.green(String(stats.majorPortCount))}`)
  lines.push(`  Trading Posts:            ${chalk.cyan(String(stats.tradingPostCount))}`)
  lines.push(`  Waystations:              ${chalk.blue(String(stats.waystationCount))}`)
  lines.push(`  Ghost Towns:              ${chalk.gray(String(stats.ghostTownCount))}`)
  lines.push(`  Shipwrecks:               ${chalk.red(String(stats.shipwreckCount))}`)
  lines.push('')
  lines.push(chalk.bold('Cargo Types:'))
  lines.push(`  Silk:  ${stats.silkCargoCount}  Spice: ${stats.spiceCargoCount}  Gold: ${stats.goldCargoCount}`)
  lines.push('')
  lines.push(chalk.bold('Highlights:'))
  lines.push(`  Most Valuable:   ${stats.mostValuable}`)
  lines.push(`  Most Efficient:  ${stats.mostEfficient}`)
  lines.push(`  Safest Route:    ${stats.safestRoute}`)
  lines.push(`  Most Trusted:    ${stats.mostTrusted}`)
  lines.push(`  Busiest Hub:     ${stats.busiestHub}`)
  lines.push('')

  if (recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatSpiceRouteJson(result: SpiceRouteResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

export function formatSpiceRouteCsv(result: SpiceRouteResult): string {
  const headers = [
    'file', 'cargoValue', 'routeEfficiency', 'tollStationCount',
    'tradeVolume', 'routeSafety', 'merchantTrust', 'condition',
    'qualityScore', 'cargoType', 'routeType',
  ]
  const rows = result.waypoints.map((w) => [
    w.file,
    String(w.cargoValue),
    String(w.routeEfficiency),
    String(w.tollStationCount),
    String(w.tradeVolume),
    String(w.routeSafety),
    String(w.merchantTrust),
    w.condition,
    String(w.qualityScore),
    w.cargo.type,
    result.routes.find((r) => r.waypoints.includes(w))?.routeType ?? 'unknown',
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
