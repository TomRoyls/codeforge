import chalk from 'chalk'

import type { SpiceMarketResult } from './spice-market-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example marketTypeColor('grand-bazaar') returns colored string */
export function marketTypeColor(marketType: string): string {
  switch (marketType) {
    case 'grand-bazaar': return chalk.rgb(46, 204, 113).bold(marketType)
    case 'spice-souk': return chalk.rgb(52, 152, 219)(marketType)
    case 'trading-post': return chalk.rgb(155, 89, 182)(marketType)
    case 'roadside-stand': return chalk.rgb(241, 196, 15)(marketType)
    case 'market-stall': return chalk.rgb(230, 126, 34)(marketType)
    case 'closed-shop': return chalk.rgb(231, 76, 60)(marketType)
    default: return marketType
  }
}

/** @example gradeColor('grand-vizier') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'grand-vizier': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-spice-merchant': return chalk.rgb(52, 152, 219)(grade)
    case 'caravan-leader': return chalk.rgb(155, 89, 182)(grade)
    case 'spice-trader': return chalk.rgb(241, 196, 15)(grade)
    case 'street-vendor': return chalk.rgb(230, 126, 34)(grade)
    case 'wandering-merchant': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example aromaTypeColor('intoxicating') returns colored string */
export function aromaTypeColor(type: string): string {
  switch (type) {
    case 'intoxicating': return chalk.rgb(231, 76, 60)(type)
    case 'fragrant': return chalk.rgb(230, 126, 34)(type)
    case 'mild': return chalk.rgb(46, 204, 113)(type)
    case 'faint': return chalk.rgb(241, 196, 15)(type)
    case 'stale': return chalk.rgb(155, 89, 182)(type)
    case 'odorless': return chalk.rgb(149, 165, 166)(type)
    default: return type
  }
}

/** @example rarityGradeColor('saffron') returns colored string */
export function rarityGradeColor(grade: string): string {
  switch (grade) {
    case 'saffron': return chalk.rgb(231, 76, 60)(grade)
    case 'vanilla': return chalk.rgb(241, 196, 15)(grade)
    case 'cardamom': return chalk.rgb(46, 204, 113)(grade)
    case 'cinnamon': return chalk.rgb(230, 126, 34)(grade)
    case 'pepper': return chalk.rgb(155, 89, 182)(grade)
    case 'salt': return chalk.rgb(149, 165, 166)(grade)
    default: return grade
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSpiceMarketJson(result) returns JSON string */
export function formatSpiceMarketJson(result: SpiceMarketResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSpiceMarketTable(result, false) returns formatted string */
export function formatSpiceMarketTable(result: SpiceMarketResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.rgb(230, 126, 34).bold('Spice Market Analysis'))
  lines.push('')
  lines.push(`Overall Flavor Score: ${scoreColor(result.stats.overallFlavorScore)}/100`)
  lines.push(`Merchant Grade: ${gradeColor(result.stats.merchantGrade)}`)
  lines.push(`Market Type: ${marketTypeColor(result.stats.marketType)}`)
  lines.push(`Stalls: ${result.stats.totalStalls} | Total Spices: ${result.stats.totalSpices}`)
  lines.push('')

  lines.push(chalk.rgb(230, 126, 34).bold('Averages'))
  lines.push(`  Aroma Potency:   ${scoreColor(result.stats.avgAromaPotency)}`)
  lines.push(`  Flavor Depth:    ${scoreColor(result.stats.avgFlavorDepth)}`)
  lines.push(`  Heat Intensity:  ${scoreColor(result.stats.avgHeatIntensity)}`)
  lines.push(`  Rarity Value:    ${scoreColor(result.stats.avgRarityValue)}`)
  lines.push(`  Blend Harmony:   ${scoreColor(result.stats.avgBlendHarmony)}`)
  lines.push(`  Trade Volume:    ${scoreColor(result.stats.avgTradeVolume)}`)

  if (verbose && result.stalls.length > 0) {
    lines.push('')
    lines.push(chalk.rgb(230, 126, 34).bold('Per-Stall Breakdown'))
    for (const stall of result.stalls) {
      lines.push(`  ${chalk.rgb(241, 196, 15)(stall.file)}`)
      lines.push(`    Aroma: ${scoreColor(stall.aroma.potency)} (${aromaTypeColor(stall.aroma.type)})`)
      lines.push(`    Flavor: ${scoreColor(stall.flavor.depth)} (${stall.flavor.profile})`)
      lines.push(`    Heat: ${scoreColor(stall.heat.intensity)} (${stall.heat.level})`)
      lines.push(`    Rarity: ${scoreColor(stall.rarity.value)} (${rarityGradeColor(stall.rarity.grade)})`)
      lines.push(`    Blend: ${scoreColor(stall.blend.harmony)} (${stall.blend.style})`)
      lines.push(`    Trade: ${scoreColor(stall.trade.volume)} (${stall.trade.route})`)
    }
  }

  return lines.join('\n')
}
