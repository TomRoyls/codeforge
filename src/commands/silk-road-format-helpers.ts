import chalk from 'chalk'

import type { SilkRoadResult } from './silk-road-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('golden-city') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'golden-city': return chalk.rgb(255, 215, 0).bold(condition)
    case 'trading-post': return chalk.rgb(46, 204, 113)(condition)
    case 'waystation': return chalk.rgb(52, 152, 219)(condition)
    case 'outpost': return chalk.rgb(241, 196, 15)(condition)
    case 'ruins': return chalk.rgb(230, 126, 34)(condition)
    case 'ghost-town': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('grand-merchant') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'grand-merchant': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-trader': return chalk.rgb(46, 204, 113)(grade)
    case 'merchant': return chalk.rgb(155, 89, 182)(grade)
    case 'peddler': return chalk.rgb(52, 152, 219)(grade)
    case 'beggar': return chalk.rgb(241, 196, 15)(grade)
    case 'bandit': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example routeColor('imperial-highway') returns colored string */
export function routeColor(route: string): string {
  switch (route) {
    case 'imperial-highway': return chalk.rgb(255, 215, 0).bold(route)
    case 'major-route': return chalk.rgb(46, 204, 113)(route)
    case 'trade-route': return chalk.rgb(155, 89, 182)(route)
    case 'branch-path': return chalk.rgb(52, 152, 219)(route)
    case 'goat-track': return chalk.rgb(241, 196, 15)(route)
    case 'dead-end': return chalk.rgb(231, 76, 60)(route)
    default: return route
  }
}

/** @example influenceColor('cosmopolitan') returns colored string */
export function influenceColor(influence: string): string {
  switch (influence) {
    case 'cosmopolitan': return chalk.rgb(255, 215, 0).bold(influence)
    case 'multicultural': return chalk.rgb(46, 204, 113)(influence)
    case 'regional': return chalk.rgb(155, 89, 182)(influence)
    case 'provincial': return chalk.rgb(52, 152, 219)(influence)
    case 'isolated': return chalk.rgb(241, 196, 15)(influence)
    case 'hermit': return chalk.rgb(231, 76, 60)(influence)
    default: return influence
  }
}

/** @example formationColor('grand-caravan') returns colored string */
export function formationColor(formation: string): string {
  switch (formation) {
    case 'grand-caravan': return chalk.rgb(255, 215, 0).bold(formation)
    case 'well-organized': return chalk.rgb(46, 204, 113)(formation)
    case 'traveling-party': return chalk.rgb(155, 89, 182)(formation)
    case 'straggling': return chalk.rgb(52, 152, 219)(formation)
    case 'lonely-traveler': return chalk.rgb(241, 196, 15)(formation)
    case 'lost': return chalk.rgb(231, 76, 60)(formation)
    default: return formation
  }
}

/** @example oasisColor('lush-oasis') returns colored string */
export function oasisColor(condition: string): string {
  switch (condition) {
    case 'lush-oasis': return chalk.rgb(255, 215, 0).bold(condition)
    case 'reliable-spring': return chalk.rgb(46, 204, 113)(condition)
    case 'well': return chalk.rgb(155, 89, 182)(condition)
    case 'seasonal-pool': return chalk.rgb(52, 152, 219)(condition)
    case 'mirage': return chalk.rgb(241, 196, 15)(condition)
    case 'poisoned-well': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example engineeringColor('masterpiece') returns colored string */
export function engineeringColor(engineering: string): string {
  switch (engineering) {
    case 'masterpiece': return chalk.rgb(255, 215, 0).bold(engineering)
    case 'well-engineered': return chalk.rgb(46, 204, 113)(engineering)
    case 'functional': return chalk.rgb(155, 89, 182)(engineering)
    case 'rickety': return chalk.rgb(52, 152, 219)(engineering)
    case 'dangerous': return chalk.rgb(241, 196, 15)(engineering)
    case 'collapsed': return chalk.rgb(231, 76, 60)(engineering)
    default: return engineering
  }
}

/** @example wealthColor('golden-age') returns colored string */
export function wealthColor(wealth: string): string {
  switch (wealth) {
    case 'golden-age': return chalk.rgb(255, 215, 0).bold(wealth)
    case 'prosperous': return chalk.rgb(46, 204, 113)(wealth)
    case 'thriving': return chalk.rgb(155, 89, 182)(wealth)
    case 'modest': return chalk.rgb(52, 152, 219)(wealth)
    case 'struggling': return chalk.rgb(241, 196, 15)(wealth)
    case 'destitute': return chalk.rgb(231, 76, 60)(wealth)
    default: return wealth
  }
}

/** @example routeTypeColor('imperial-network') returns colored string */
export function routeTypeColor(type: string): string {
  switch (type) {
    case 'imperial-network': return chalk.rgb(255, 215, 0).bold(type)
    case 'major-route': return chalk.rgb(46, 204, 113)(type)
    case 'regional-path': return chalk.rgb(155, 89, 182)(type)
    case 'local-road': return chalk.rgb(52, 152, 219)(type)
    case 'trail': return chalk.rgb(241, 196, 15)(type)
    case 'wilderness': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSilkRoadJson(result) returns JSON string */
export function formatSilkRoadJson(result: SilkRoadResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSilkRoadTable(result, verbose) returns formatted string */
export function formatSilkRoadTable(result: SilkRoadResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Silk Road Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Network Overview:'))
  lines.push(`    Overall Prosperity:      ${scoreColor(result.network.overallProsperity)}`)
  lines.push(`    Avg Trade:               ${scoreColor(result.network.avgTrade)}`)
  lines.push(`    Avg Culture:             ${scoreColor(result.network.avgCulture)}`)
  lines.push(`    Avg Prosperity:          ${scoreColor(result.network.avgProsperity)}`)
  lines.push(`    Is Prosperous:           ${result.network.isProsperous ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Routes:             ${result.stats.totalRoutes}`)
  lines.push(`    Avg Trade Route Quality:  ${scoreColor(result.stats.avgTradeRouteQuality)}`)
  lines.push(`    Avg Cultural Richness:    ${scoreColor(result.stats.avgCulturalRichness)}`)
  lines.push(`    Avg Caravan Strength:     ${scoreColor(result.stats.avgCaravanStrength)}`)
  lines.push(`    Avg Oasis Stability:      ${scoreColor(result.stats.avgOasisStability)}`)
  lines.push(`    Avg Bridge Quality:       ${scoreColor(result.stats.avgBridgeQuality)}`)
  lines.push(`    Avg Mercantile Prosperity:${scoreColor(result.stats.avgMercantileProsperity)}`)
  lines.push(`    Merchant Grade:           ${gradeColor(result.stats.merchantGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Golden City:              ${result.stats.goldenCityCount}`)
  lines.push(`    Trading Post:             ${result.stats.tradingPostCount}`)
  lines.push(`    Waystation:               ${result.stats.waystationCount}`)
  lines.push(`    Outpost:                  ${result.stats.outpostCount}`)
  lines.push(`    Ruins:                    ${result.stats.ruinsCount}`)
  lines.push(`    Ghost Town:               ${result.stats.ghostTownCount}`)
  lines.push('')

  if (result.stats.bestStop) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Stop:        ${result.stats.bestStop}`)
    lines.push(`    Best Connected:   ${result.stats.bestConnected}`)
    lines.push(`    Most Diverse:     ${result.stats.mostDiverse}`)
    lines.push(`    Most Cohesive:    ${result.stats.mostCohesive}`)
    lines.push(`    Most Stable:      ${result.stats.mostStable}`)
    lines.push(`    Best API:         ${result.stats.bestAPI}`)
    lines.push('')
  }

  if (verbose && result.stops.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const stop of result.stops) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(stop.file)}`)
      lines.push(`      Score: ${scoreColor(stop.qualityScore)}  Condition: ${conditionColor(stop.condition)}`)
      lines.push(`      Trade: ${routeColor(stop.trade.route)}(${stop.tradeRouteQuality})  Culture: ${influenceColor(stop.culture.influence)}(${stop.culturalRichness})  Caravan: ${formationColor(stop.caravan.formation)}(${stop.caravanStrength})`)
      lines.push(`      Oasis: ${oasisColor(stop.oasis.condition)}(${stop.oasisStability})  Bridge: ${engineeringColor(stop.bridge.engineering)}(${stop.bridgeQuality})  Prosperity: ${wealthColor(stop.prosperity.wealth)}(${stop.mercantileProsperity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u{1F3F0}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
