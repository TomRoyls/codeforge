import chalk from 'chalk'
import type { AlchemyGlassResult } from './alchemy-glass-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 215, 0)(String(score))
  if (score >= 60) return chalk.rgb(218, 165, 32)(String(score))
  if (score >= 40) return chalk.rgb(184, 134, 11)(String(score))
  return chalk.rgb(139, 119, 42)(String(score))
}

/** @example gradeColor('pure-gold') returns colored string */
export function gradeColor(s: string): string {
  switch (s) {
    case 'pure-gold': return chalk.rgb(255, 215, 0).bold(s)
    case 'refined-silver': return chalk.rgb(192, 192, 192)(s)
    case 'proper-transmutation': return chalk.rgb(218, 165, 32)(s)
    case 'base-metal': return chalk.rgb(184, 134, 11)(s)
    case 'slag': return chalk.rgb(139, 119, 42)(s)
    case 'failed-alchemy': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example vesselColor('crystal-phial') returns colored string */
export function vesselColor(s: string): string {
  switch (s) {
    case 'crystal-phial': return chalk.rgb(255, 215, 0).bold(s)
    case 'pure-flask': return chalk.rgb(192, 192, 192)(s)
    case 'proper-vessel': return chalk.rgb(218, 165, 32)(s)
    case 'cracked-flask': return chalk.rgb(184, 134, 11)(s)
    case 'leaky-container': return chalk.rgb(139, 119, 42)(s)
    case 'broken-glass': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example purity2Color('pure-essence') returns colored string */
export function purity2Color(s: string): string {
  switch (s) {
    case 'pure-essence': return chalk.rgb(255, 215, 0).bold(s)
    case 'concentrated': return chalk.rgb(192, 192, 192)(s)
    case 'proper-extract': return chalk.rgb(218, 165, 32)(s)
    case 'diluted': return chalk.rgb(184, 134, 11)(s)
    case 'watery': return chalk.rgb(139, 119, 42)(s)
    case 'impure': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example harmonyColor('perfect-equilibrium') returns colored string */
export function harmonyColor(s: string): string {
  switch (s) {
    case 'perfect-equilibrium': return chalk.rgb(255, 215, 0).bold(s)
    case 'well-balanced': return chalk.rgb(192, 192, 192)(s)
    case 'proper-mix': return chalk.rgb(218, 165, 32)(s)
    case 'uneven-elements': return chalk.rgb(184, 134, 11)(s)
    case 'imbalanced': return chalk.rgb(139, 119, 42)(s)
    case 'chaotic-mix': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example insightColor('enlightened') returns colored string */
export function insightColor(s: string): string {
  switch (s) {
    case 'enlightened': return chalk.rgb(255, 215, 0).bold(s)
    case 'wise': return chalk.rgb(192, 192, 192)(s)
    case 'learned': return chalk.rgb(218, 165, 32)(s)
    case 'student': return chalk.rgb(184, 134, 11)(s)
    case 'novice': return chalk.rgb(139, 119, 42)(s)
    case 'ignorant': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example proportionColor('golden-spiral') returns colored string */
export function proportionColor(s: string): string {
  switch (s) {
    case 'golden-spiral': return chalk.rgb(255, 215, 0).bold(s)
    case 'proper-proportion': return chalk.rgb(192, 192, 192)(s)
    case 'well-sized': return chalk.rgb(218, 165, 32)(s)
    case 'adequate': return chalk.rgb(184, 134, 11)(s)
    case 'misproportioned': return chalk.rgb(139, 119, 42)(s)
    case 'grotesque': return chalk.rgb(100, 80, 30)(s)
    default: return s
  }
}

/** @example conditionColor('philosopher-stone') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'philosopher-stone': return chalk.rgb(255, 215, 0).bold(c)
    case 'pure-gold': return chalk.rgb(218, 165, 32)(c)
    case 'silver-phial': return chalk.rgb(192, 192, 192)(c)
    case 'base-metal': return chalk.rgb(184, 134, 11)(c)
    case 'lead-weight': return chalk.rgb(139, 119, 42)(c)
    case 'slag-heap': return chalk.rgb(100, 80, 30)(c)
    default: return c
  }
}

/** @example alchemistGradeColor('grand-master-alchemist') returns colored string */
export function alchemistGradeColor(g: string): string {
  switch (g) {
    case 'grand-master-alchemist': return chalk.rgb(255, 215, 0).bold(g)
    case 'master-transmuter': return chalk.rgb(218, 165, 32)(g)
    case 'skilled-alchemist': return chalk.rgb(192, 192, 192)(g)
    case 'apprentice': return chalk.rgb(184, 134, 11)(g)
    case 'novice': return chalk.rgb(139, 119, 42)(g)
    case 'charlatan': return chalk.rgb(100, 80, 30)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAlchemyGlassJson(result) returns JSON string */
export function formatAlchemyGlassJson(result: AlchemyGlassResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAlchemyGlassTable(result, verbose) returns formatted string */
export function formatAlchemyGlassTable(result: AlchemyGlassResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 215, 0).bold('  Alchemy Glass Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 215, 0)('  Guild:'))
  lines.push(`    Avg Purity:           ${scoreColor(result.guild.avgPurity)}`)
  lines.push(`    Avg Balance:          ${scoreColor(result.guild.avgBalance)}`)
  lines.push(`    Avg Golden:           ${scoreColor(result.guild.avgGolden)}`)
  lines.push(`    Is Golden:            ${result.guild.isGolden ? chalk.rgb(255, 215, 0)('Yes') : chalk.rgb(100, 80, 30)('No')}`)
  lines.push(`    Overall Purity:       ${scoreColor(result.guild.overallPurity)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 215, 0)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Workshops:              ${result.stats.totalWorkshops}`)
  lines.push(`    Avg Transmutation Purity:     ${scoreColor(result.stats.avgTransmutationPurity)}`)
  lines.push(`    Avg Phial Quality:            ${scoreColor(result.stats.avgPhialQuality)}`)
  lines.push(`    Avg Essence Distillation:     ${scoreColor(result.stats.avgEssenceDistillation)}`)
  lines.push(`    Avg Elemental Balance:        ${scoreColor(result.stats.avgElementalBalance)}`)
  lines.push(`    Avg Philosopher Quality:      ${scoreColor(result.stats.avgPhilosopherQuality)}`)
  lines.push(`    Avg Golden Ratio:             ${scoreColor(result.stats.avgGoldenRatio)}`)
  lines.push(`    Alchemist Grade:              ${alchemistGradeColor(result.stats.alchemistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 215, 0)('  Condition Counts:'))
  lines.push(`    Philosopher Stone:    ${result.stats.philosopherStoneCount}`)
  lines.push(`    Pure Gold:            ${result.stats.pureGoldCount}`)
  lines.push(`    Silver Phial:         ${result.stats.silverPhialCount}`)
  lines.push(`    Base Metal:           ${result.stats.baseMetalCount}`)
  lines.push(`    Lead Weight:          ${result.stats.leadWeightCount}`)
  lines.push(`    Slag Heap:            ${result.stats.slagHeapCount}`)
  lines.push('')

  if (result.stats.bestPhial) {
    lines.push(chalk.rgb(255, 215, 0)('  Highlights:'))
    lines.push(`    Best Phial:           ${result.stats.bestPhial}`)
    lines.push(`    Purest:               ${result.stats.purest}`)
    lines.push(`    Best Contained:       ${result.stats.bestContained}`)
    lines.push(`    Most Essential:       ${result.stats.mostEssential}`)
    lines.push(`    Most Balanced:        ${result.stats.mostBalanced}`)
    lines.push(`    Wisest:               ${result.stats.wisest}`)
    lines.push('')
  }

  if (verbose && result.phials.length > 0) {
    lines.push(chalk.rgb(255, 215, 0)('  Per-File Phials:'))
    for (const p of result.phials) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Transmute: ${gradeColor(p.transmuting.grade)}(${p.transmutationPurity})  Phial: ${vesselColor(p.phial.vessel)}(${p.phialQuality})  Distill: ${purity2Color(p.distilling.purity2)}(${p.essenceDistillation})`)
      lines.push(`      Balance: ${harmonyColor(p.balancing.harmony)}(${p.elementalBalance})  Wisdom: ${insightColor(p.philosophic.insight)}(${p.philosopherQuality})  Golden: ${proportionColor(p.golden.proportion)}(${p.goldenRatio})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 215, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 215, 0)('\u2697\uFE0F')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
