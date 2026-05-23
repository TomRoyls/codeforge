import chalk from 'chalk'
import type { JadeEmeraldResult } from './jade-emerald-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(0, 168, 107)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example gradeColor('imperial-jade') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'imperial-jade': return chalk.rgb(0, 168, 107).bold(g)
    case 'gem-quality': return chalk.rgb(46, 204, 113)(g)
    case 'fine-stone': return chalk.rgb(155, 89, 182)(g)
    case 'commercial-grade': return chalk.rgb(52, 152, 219)(g)
    case 'industrial': return chalk.rgb(241, 196, 15)(g)
    case 'aggregate': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example hardnessColor('diamond-hard') returns colored string */
export function hardnessColor(h: string): string {
  switch (h) {
    case 'diamond-hard': return chalk.rgb(0, 168, 107).bold(h)
    case 'corundum-tough': return chalk.rgb(46, 204, 113)(h)
    case 'jade-resilient': return chalk.rgb(155, 89, 182)(h)
    case 'quartz-steady': return chalk.rgb(52, 152, 219)(h)
    case 'calcite-soft': return chalk.rgb(241, 196, 15)(h)
    case 'talc-fragile': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example shineColor('brilliant-luster') returns colored string */
export function shineColor(s: string): string {
  switch (s) {
    case 'brilliant-luster': return chalk.rgb(0, 168, 107).bold(s)
    case 'vitreous-shine': return chalk.rgb(46, 204, 113)(s)
    case 'pearly-glow': return chalk.rgb(155, 89, 182)(s)
    case 'silky-sheen': return chalk.rgb(52, 152, 219)(s)
    case 'dull': return chalk.rgb(241, 196, 15)(s)
    case 'earthy': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example cutColor('brilliant-cut') returns colored string */
export function cutColor(c: string): string {
  switch (c) {
    case 'brilliant-cut': return chalk.rgb(0, 168, 107).bold(c)
    case 'emerald-cut': return chalk.rgb(46, 204, 113)(c)
    case 'princess-cut': return chalk.rgb(155, 89, 182)(c)
    case 'cabochon': return chalk.rgb(52, 152, 219)(c)
    case 'rough': return chalk.rgb(241, 196, 15)(c)
    case 'uncut': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example clarityGradeColor('flawless') returns colored string */
export function clarityGradeColor(g: string): string {
  switch (g) {
    case 'flawless': return chalk.rgb(0, 168, 107).bold(g)
    case 'vvs': return chalk.rgb(46, 204, 113)(g)
    case 'vs': return chalk.rgb(155, 89, 182)(g)
    case 'si': return chalk.rgb(52, 152, 219)(g)
    case 'i': return chalk.rgb(241, 196, 15)(g)
    case 'opaque': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example skillColor('master-carver') returns colored string */
export function skillColor(s: string): string {
  switch (s) {
    case 'master-carver': return chalk.rgb(0, 168, 107).bold(s)
    case 'expert-artisan': return chalk.rgb(46, 204, 113)(s)
    case 'skilled-craftsman': return chalk.rgb(155, 89, 182)(s)
    case 'apprentice': return chalk.rgb(52, 152, 219)(s)
    case 'novice': return chalk.rgb(241, 196, 15)(s)
    case 'machine-cut': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(0, 168, 107).bold(c)
    case 'fine-gem': return chalk.rgb(46, 204, 113)(c)
    case 'quality-stone': return chalk.rgb(155, 89, 182)(c)
    case 'commercial': return chalk.rgb(52, 152, 219)(c)
    case 'industrial-grade': return chalk.rgb(241, 196, 15)(c)
    case 'raw-stone': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example lapidaryGradeColor('grand-lapidary') returns colored string */
export function lapidaryGradeColor(g: string): string {
  switch (g) {
    case 'grand-lapidary': return chalk.rgb(0, 168, 107).bold(g)
    case 'master-gemcutter': return chalk.rgb(46, 204, 113)(g)
    case 'expert-cutter': return chalk.rgb(155, 89, 182)(g)
    case 'skilled-artisan': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice-cutter': return chalk.rgb(241, 196, 15)(g)
    case 'rock-tumbler': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example collectionTypeColor('imperial-collection') returns colored string */
export function collectionTypeColor(t: string): string {
  switch (t) {
    case 'imperial-collection': return chalk.rgb(0, 168, 107).bold(t)
    case 'treasure-vault': return chalk.rgb(46, 204, 113)(t)
    case 'jewelry-box': return chalk.rgb(155, 89, 182)(t)
    case 'gem-pouch': return chalk.rgb(52, 152, 219)(t)
    case 'quarry-tailings': return chalk.rgb(241, 196, 15)(t)
    case 'gravel': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example collectionConditionColor('crown-jewels') returns colored string */
export function collectionConditionColor(c: string): string {
  switch (c) {
    case 'crown-jewels': return chalk.rgb(0, 168, 107).bold(c)
    case 'precious-collection': return chalk.rgb(46, 204, 113)(c)
    case 'valuable-hoard': return chalk.rgb(155, 89, 182)(c)
    case 'modest-collection': return chalk.rgb(52, 152, 219)(c)
    case 'scattered-stones': return chalk.rgb(241, 196, 15)(c)
    case 'rubble': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatJadeEmeraldJson(result) returns JSON string */
export function formatJadeEmeraldJson(result: JadeEmeraldResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatJadeEmeraldTable(result, verbose) returns formatted string */
export function formatJadeEmeraldTable(result: JadeEmeraldResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(0, 168, 107).bold('  Jade Emerald Analysis'))
  lines.push('')

  lines.push(chalk.rgb(0, 168, 107)('  Treasure Overview:'))
  lines.push(`    Overall Value:       ${scoreColor(result.treasure.overallTreasureValue)}`)
  lines.push(`    Avg Preciousness:    ${scoreColor(result.treasure.avgPreciousness)}`)
  lines.push(`    Avg Durability:      ${scoreColor(result.treasure.avgDurability)}`)
  lines.push(`    Avg Carving Quality: ${scoreColor(result.treasure.avgCarvingQuality)}`)
  lines.push(`    Is Precious:         ${result.treasure.isPrecious ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(0, 168, 107)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:    ${result.stats.totalCollections}`)
  lines.push(`    Avg Preciousness:     ${scoreColor(result.stats.avgPreciousness)}`)
  lines.push(`    Avg Durability:       ${scoreColor(result.stats.avgDurability)}`)
  lines.push(`    Avg Luster:           ${scoreColor(result.stats.avgLuster)}`)
  lines.push(`    Avg Facet Count:      ${scoreColor(result.stats.avgFacetCount)}`)
  lines.push(`    Avg Clarity:          ${scoreColor(result.stats.avgClarityValue)}`)
  lines.push(`    Avg Carving Quality:  ${scoreColor(result.stats.avgCarvingQuality)}`)
  lines.push(`    Lapidary Grade:       ${lapidaryGradeColor(result.stats.lapidaryGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(0, 168, 107)('  Condition Counts:'))
  lines.push(`    Masterpiece:          ${result.stats.masterpieceCount}`)
  lines.push(`    Fine Gem:             ${result.stats.fineGemCount}`)
  lines.push(`    Quality Stone:        ${result.stats.qualityStoneCount}`)
  lines.push(`    Commercial:           ${result.stats.commercialCount}`)
  lines.push(`    Industrial Grade:     ${result.stats.industrialGradeCount}`)
  lines.push(`    Raw Stone:            ${result.stats.rawStoneCount}`)
  lines.push('')

  if (result.stats.bestGemstone) {
    lines.push(chalk.rgb(0, 168, 107)('  Highlights:'))
    lines.push(`    Best Gemstone:     ${result.stats.bestGemstone}`)
    lines.push(`    Most Precious:     ${result.stats.mostPrecious}`)
    lines.push(`    Most Durable:      ${result.stats.mostDurable}`)
    lines.push(`    Most Lustrous:     ${result.stats.mostLustrous}`)
    lines.push(`    Most Faceted:      ${result.stats.mostFaceted}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push(`    Best Carved:       ${result.stats.bestCarved}`)
    lines.push('')
  }

  if (verbose && result.gemstones.length > 0) {
    lines.push(chalk.rgb(0, 168, 107)('  Per-File Gemstones:'))
    for (const g of result.gemstones) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(g.file)}`)
      lines.push(`      Score: ${scoreColor(g.qualityScore)}  Condition: ${conditionColor(g.condition)}`)
      lines.push(`      Prec: ${gradeColor(g.precious.grade)}(${g.preciousness})  Dur: ${hardnessColor(g.durable.hardness)}(${g.durability})  Lust: ${shineColor(g.lustrous.shine)}(${g.luster})`)
      lines.push(`      Facet: ${cutColor(g.faceted.cut)}(${g.facetCount})  Clar: ${clarityGradeColor(g.clarity.grade)}(${g.clarityValue})  Carv: ${skillColor(g.carving.skill)}(${g.carvingQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(0, 168, 107)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(0, 168, 107)('\u2666')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
