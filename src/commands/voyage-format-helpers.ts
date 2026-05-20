import chalk from 'chalk'

import type {
  Hazard,
  Journey,
  Port,
  TradeRoute,
  VoyageResult,
  VoyageStats,
} from './voyage-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function portTypeIcon(type: string): string {
  switch (type) {
    case 'home': return chalk.rgb(220, 20, 60)('⌂')
    case 'trade': return chalk.rgb(33, 150, 243)('◆')
    case 'outpost': return chalk.rgb(158, 158, 158)('○')
    case 'harbor': return chalk.rgb(76, 175, 80)('⚓')
    case 'island': return chalk.rgb(255, 193, 7)('🏝')
    case 'reef': return chalk.rgb(244, 67, 54)('⚠')
    default: return '●'
  }
}

function severityColor(severity: string, text: string): string {
  switch (severity) {
    case 'extreme': return chalk.rgb(244, 67, 54)(text)
    case 'major': return chalk.rgb(255, 87, 34)(text)
    case 'moderate': return chalk.rgb(255, 193, 7)(text)
    default: return chalk.gray(text)
  }
}

// ─── Port Map ──────────────────────────────────────────────────────────────────

/**
 * Format port map.
 *
 * @example
 * formatPortMap(ports)
 */
export function formatPortMap(ports: Port[]): string {
  if (ports.length === 0) return chalk.gray('  No ports discovered')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Port Map'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const port of ports.slice(0, 20)) {
    const icon = portTypeIcon(port.type)
    const type = port.type.padEnd(10)
    const importance = `${port.importance}%`.padStart(4)
    const conditions = port.seaConditions > 70
      ? chalk.rgb(244, 67, 54)(`${port.seaConditions}%`.padStart(4))
      : port.seaConditions > 40
        ? chalk.rgb(255, 193, 7)(`${port.seaConditions}%`.padStart(4))
        : chalk.rgb(76, 175, 80)(`${port.seaConditions}%`.padStart(4))
    lines.push(`  ${icon} ${port.file.padEnd(25)} ${type} imp:${importance} sea:${conditions}`)
    if (port.connections.length > 0 && port.connections.length <= 5) {
      lines.push(`    → ${port.connections.join(', ')}`)
    } else if (port.connections.length > 5) {
      lines.push(`    → ${port.connections.slice(0, 5).join(', ')} +${port.connections.length - 5} more`)
    }
  }

  return lines.join('\n')
}

// ─── Trade Routes ──────────────────────────────────────────────────────────────

/**
 * Format trade routes.
 *
 * @example
 * formatTradeRoutes(routes)
 */
export function formatTradeRoutes(routes: TradeRoute[]): string {
  if (routes.length === 0) return chalk.gray('  No trade routes')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Trade Routes'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const route of routes.slice(0, 20)) {
    const typeColor = route.type === 'highway' ? chalk.rgb(76, 175, 80) : route.type === 'treacherous' ? chalk.rgb(244, 67, 54) : chalk.gray
    lines.push(`  ${route.from.padEnd(20)} → ${route.to.padEnd(20)} ${typeColor(route.type.padEnd(12))} diff:${route.difficulty}%`)
  }

  if (routes.length > 20) {
    lines.push(chalk.gray(`  ... and ${routes.length - 20} more routes`))
  }

  return lines.join('\n')
}

// ─── Journeys ──────────────────────────────────────────────────────────────────

/**
 * Format journeys.
 *
 * @example
 * formatJourneys(journeys)
 */
export function formatJourneys(journeys: Journey[]): string {
  if (journeys.length === 0) return chalk.gray('  No journeys planned')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Sample Journeys'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const journey of journeys.slice(0, 5)) {
    lines.push(`  ${journey.from} → ${journey.to}  (${journey.distance} hops, difficulty ${journey.difficulty}%)`)
    lines.push(`    Route: ${journey.route.join(' → ')}`)
  }

  return lines.join('\n')
}

// ─── Hazards ───────────────────────────────────────────────────────────────────

/**
 * Format hazards.
 *
 * @example
 * formatHazards(hazards)
 */
export function formatHazards(hazards: Hazard[]): string {
  if (hazards.length === 0) return chalk.gray('  No hazards detected')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Hazards'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const hazard of hazards.slice(0, 10)) {
    const sev = severityColor(hazard.severity.toUpperCase(), `[${hazard.severity.toUpperCase().padEnd(7)}]`)
    lines.push(`  ${sev} ${hazard.type.padEnd(12)} ${hazard.file}`)
    lines.push(`       ${hazard.description}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format voyage stats.
 *
 * @example
 * formatVoyageStats(stats)
 */
export function formatVoyageStats(stats: VoyageStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Voyage Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Ports:        ${stats.totalPorts}`)
  lines.push(`  Home Ports:         ${stats.homePorts}`)
  lines.push(`  Trade Routes:       ${stats.tradeRoutes}`)
  lines.push(`  Avg Distance:       ${stats.avgDistance}`)
  lines.push(`  Max Distance:       ${stats.maxDistance}`)
  lines.push(`  Avg Difficulty:     ${stats.avgDifficulty}%`)
  lines.push(`  Hazardous Routes:   ${stats.hazardousRoutes}`)
  lines.push(`  Most Isolated:      ${stats.mostIsolated}`)
  lines.push(`  Most Connected:     ${stats.mostConnected}`)
  lines.push(`  Navigability:       ${stats.navigability}%`)
  lines.push(`  Chart Completeness: ${stats.chartCompleteness}%`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Add docs'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full voyage result as table.
 *
 * @example
 * formatVoyageTable(result)
 */
export function formatVoyageTable(result: VoyageResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Voyage Map'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(formatPortMap(result.ports))
  parts.push(formatTradeRoutes(result.routes))
  parts.push(formatJourneys(result.journeys))
  parts.push(formatHazards(result.hazards))
  parts.push(formatVoyageStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format full voyage result as JSON.
 *
 * @example
 * formatVoyageJSON(result)
 */
export function formatVoyageJSON(result: VoyageResult): string {
  return JSON.stringify(result, null, 2)
}
