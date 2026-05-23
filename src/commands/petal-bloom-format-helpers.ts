import chalk from 'chalk'
import type { PetalBloomResult } from './petal-bloom-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example formColor('orchid-perfection') returns colored string */
export function formColor(f: string): string {
  switch (f) {
    case 'orchid-perfection': return chalk.rgb(255, 191, 0).bold(f)
    case 'rose-elegance': return chalk.rgb(46, 204, 113)(f)
    case 'lily-grace': return chalk.rgb(155, 89, 182)(f)
    case 'daisy-charm': return chalk.rgb(52, 152, 219)(f)
    case 'weed-rough': return chalk.rgb(241, 196, 15)(f)
    case 'wilted': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example stageColor('full-bloom') returns colored string */
export function stageColor(s: string): string {
  switch (s) {
    case 'full-bloom': return chalk.rgb(255, 191, 0).bold(s)
    case 'opening': return chalk.rgb(46, 204, 113)(s)
    case 'budding': return chalk.rgb(155, 89, 182)(s)
    case 'sprouting': return chalk.rgb(52, 152, 219)(s)
    case 'dormant': return chalk.rgb(241, 196, 15)(s)
    case 'dead-seed': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example capacityColor('unlimited-canopy') returns colored string */
export function capacityColor(c: string): string {
  switch (c) {
    case 'unlimited-canopy': return chalk.rgb(255, 191, 0).bold(c)
    case 'strong-vine': return chalk.rgb(46, 204, 113)(c)
    case 'healthy-shrub': return chalk.rgb(155, 89, 182)(c)
    case 'moderate-growth': return chalk.rgb(52, 152, 219)(c)
    case 'stunted': return chalk.rgb(241, 196, 15)(c)
    case 'barren-soil': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example scentColor('intoxicating') returns colored string */
export function scentColor(s: string): string {
  switch (s) {
    case 'intoxicating': return chalk.rgb(255, 191, 0).bold(s)
    case 'sweet-fragrance': return chalk.rgb(46, 204, 113)(s)
    case 'pleasant': return chalk.rgb(155, 89, 182)(s)
    case 'mild-scent': return chalk.rgb(52, 152, 219)(s)
    case 'odorless': return chalk.rgb(241, 196, 15)(s)
    case 'unpleasant': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example spreadColor('cross-pollination') returns colored string */
export function spreadColor(s: string): string {
  switch (s) {
    case 'cross-pollination': return chalk.rgb(255, 191, 0).bold(s)
    case 'wide-spread': return chalk.rgb(46, 204, 113)(s)
    case 'local-sharing': return chalk.rgb(155, 89, 182)(s)
    case 'limited-contact': return chalk.rgb(52, 152, 219)(s)
    case 'isolated': return chalk.rgb(241, 196, 15)(s)
    case 'walled-garden': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example phaseColor('perpetual-bloom') returns colored string */
export function phaseColor(p: string): string {
  switch (p) {
    case 'perpetual-bloom': return chalk.rgb(255, 191, 0).bold(p)
    case 'long-season': return chalk.rgb(46, 204, 113)(p)
    case 'proper-cycle': return chalk.rgb(155, 89, 182)(p)
    case 'short-season': return chalk.rgb(52, 152, 219)(p)
    case 'irregular': return chalk.rgb(241, 196, 15)(p)
    case 'never-blooms': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example conditionColor('prize-bloom') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'prize-bloom': return chalk.rgb(255, 191, 0).bold(c)
    case 'healthy-flower': return chalk.rgb(46, 204, 113)(c)
    case 'growing-plant': return chalk.rgb(155, 89, 182)(c)
    case 'fading-petals': return chalk.rgb(52, 152, 219)(c)
    case 'wilting': return chalk.rgb(241, 196, 15)(c)
    case 'dried-arrangement': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-gardener') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-gardener': return chalk.rgb(255, 191, 0).bold(g)
    case 'expert-botanist': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-horticulturist': return chalk.rgb(155, 89, 182)(g)
    case 'weekend-gardener': return chalk.rgb(52, 152, 219)(g)
    case 'plant-novice': return chalk.rgb(241, 196, 15)(g)
    case 'brown-thumb': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example bouquetTypeColor('botanical-garden') returns colored string */
export function bouquetTypeColor(t: string): string {
  switch (t) {
    case 'botanical-garden': return chalk.rgb(255, 191, 0).bold(t)
    case 'flower-arrangement': return chalk.rgb(46, 204, 113)(t)
    case 'wildflower-meadow': return chalk.rgb(155, 89, 182)(t)
    case 'potted-plants': return chalk.rgb(52, 152, 219)(t)
    case 'dried-flowers': return chalk.rgb(241, 196, 15)(t)
    case 'barren-ground': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example bouquetConditionColor('spectacular-bloom') returns colored string */
export function bouquetConditionColor(c: string): string {
  switch (c) {
    case 'spectacular-bloom': return chalk.rgb(255, 191, 0).bold(c)
    case 'beautiful-garden': return chalk.rgb(46, 204, 113)(c)
    case 'pleasant-meadow': return chalk.rgb(155, 89, 182)(c)
    case 'fading-garden': return chalk.rgb(52, 152, 219)(c)
    case 'wilting-bed': return chalk.rgb(241, 196, 15)(c)
    case 'dead-garden': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatPetalBloomJson(result) returns JSON string */
export function formatPetalBloomJson(result: PetalBloomResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatPetalBloomTable(result, verbose) returns formatted string */
export function formatPetalBloomTable(result: PetalBloomResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 191, 0).bold('  Petal Bloom Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Garden Overview:'))
  lines.push(`    Overall Bloom:        ${scoreColor(result.garden.overallBloom)}`)
  lines.push(`    Avg Beauty:           ${scoreColor(result.garden.avgBeauty)}`)
  lines.push(`    Avg Growth Potential: ${scoreColor(result.garden.avgGrowthPotential)}`)
  lines.push(`    Avg Fragrance:        ${scoreColor(result.garden.avgFragrance)}`)
  lines.push(`    Is Blooming:          ${result.garden.isBlooming ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Bouquets:         ${result.stats.totalBouquets}`)
  lines.push(`    Avg Beauty:             ${scoreColor(result.stats.avgBeauty)}`)
  lines.push(`    Avg Blossoming:         ${scoreColor(result.stats.avgBlossoming)}`)
  lines.push(`    Avg Growth Potential:   ${scoreColor(result.stats.avgGrowthPotential)}`)
  lines.push(`    Avg Fragrance:          ${scoreColor(result.stats.avgFragrance)}`)
  lines.push(`    Avg Pollination:        ${scoreColor(result.stats.avgPollination)}`)
  lines.push(`    Avg Seasonal Rhythm:    ${scoreColor(result.stats.avgSeasonalRhythm)}`)
  lines.push(`    Gardener Grade:         ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Condition Counts:'))
  lines.push(`    Prize Bloom:          ${result.stats.prizeBloomCount}`)
  lines.push(`    Healthy Flower:       ${result.stats.healthyFlowerCount}`)
  lines.push(`    Growing Plant:        ${result.stats.growingPlantCount}`)
  lines.push(`    Fading Petals:        ${result.stats.fadingPetalsCount}`)
  lines.push(`    Wilting:              ${result.stats.wiltingCount}`)
  lines.push(`    Dried Arrangement:    ${result.stats.driedArrangementCount}`)
  lines.push('')

  if (result.stats.bestPetal) {
    lines.push(chalk.rgb(255, 191, 0)('  Highlights:'))
    lines.push(`    Best Petal:         ${result.stats.bestPetal}`)
    lines.push(`    Most Beautiful:     ${result.stats.mostBeautiful}`)
    lines.push(`    Most Developed:     ${result.stats.mostDeveloped}`)
    lines.push(`    Most Extensible:    ${result.stats.mostExtensible}`)
    lines.push(`    Most Appealing:     ${result.stats.mostAppealing}`)
    lines.push(`    Most Reusable:      ${result.stats.mostReusable}`)
    lines.push('')
  }

  if (verbose && result.petals.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Per-File Petals:'))
    for (const p of result.petals) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Beauty: ${formColor(p.beautiful.form)}(${p.beauty})  Blossom: ${stageColor(p.blossom.stage)}(${p.blossoming})  Growth: ${capacityColor(p.growth.capacity)}(${p.growthPotential})`)
      lines.push(`      Fragrance: ${scentColor(p.fragrant.scent)}(${p.fragrance})  Pollination: ${spreadColor(p.pollinating.spread)}(${p.pollination})  Seasonal: ${phaseColor(p.seasonal.phase)}(${p.seasonalRhythm})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 191, 0)('\u{1F33A}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
