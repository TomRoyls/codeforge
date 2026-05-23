import chalk from 'chalk'
import type { SandstormEyeResult } from './sandstorm-eye-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example calmColor('eye-of-storm') returns colored string */
export function calmColor(s: string): string {
  switch (s) {
    case 'eye-of-storm': return chalk.rgb(118, 255, 3).bold(s)
    case 'steady-center': return chalk.rgb(46, 204, 113)(s)
    case 'calm-amidst': return chalk.rgb(52, 152, 219)(s)
    case 'swaying': return chalk.rgb(241, 196, 15)(s)
    case 'tumbling': return chalk.rgb(230, 126, 34)(s)
    case 'blown-away': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example stillnessColor('zen-master') returns colored string */
export function stillnessColor(s: string): string {
  switch (s) {
    case 'zen-master': return chalk.rgb(118, 255, 3).bold(s)
    case 'clear-focus': return chalk.rgb(46, 204, 113)(s)
    case 'proper-concentration': return chalk.rgb(52, 152, 219)(s)
    case 'distracted': return chalk.rgb(241, 196, 15)(s)
    case 'scattered': return chalk.rgb(230, 126, 34)(s)
    case 'lost': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example filteringQualityColor('pure-crystal') returns colored string */
export function filteringQualityColor(s: string): string {
  switch (s) {
    case 'pure-crystal': return chalk.rgb(118, 255, 3).bold(s)
    case 'filtered-water': return chalk.rgb(46, 204, 113)(s)
    case 'proper-sieve': return chalk.rgb(52, 152, 219)(s)
    case 'coarse-filter': return chalk.rgb(241, 196, 15)(s)
    case 'muddy-water': return chalk.rgb(230, 126, 34)(s)
    case 'raw-sand': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example visibilityColor('eternal-flame') returns colored string */
export function visibilityColor(s: string): string {
  switch (s) {
    case 'eternal-flame': return chalk.rgb(118, 255, 3).bold(s)
    case 'steady-beacon': return chalk.rgb(46, 204, 113)(s)
    case 'reliable-light': return chalk.rgb(52, 152, 219)(s)
    case 'flickering': return chalk.rgb(241, 196, 15)(s)
    case 'dimming': return chalk.rgb(230, 126, 34)(s)
    case 'extinguished': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example skillColor('desert-guide') returns colored string */
export function skillColor(s: string): string {
  switch (s) {
    case 'desert-guide': return chalk.rgb(118, 255, 3).bold(s)
    case 'pathfinder': return chalk.rgb(46, 204, 113)(s)
    case 'navigator': return chalk.rgb(52, 152, 219)(s)
    case 'wanderer': return chalk.rgb(241, 196, 15)(s)
    case 'lost-traveler': return chalk.rgb(230, 126, 34)(s)
    case 'doomed': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example fitnessColor('desert-hardy') returns colored string */
export function fitnessColor(s: string): string {
  switch (s) {
    case 'desert-hardy': return chalk.rgb(118, 255, 3).bold(s)
    case 'drought-resistant': return chalk.rgb(46, 204, 113)(s)
    case 'adaptable': return chalk.rgb(52, 152, 219)(s)
    case 'fragile-bloom': return chalk.rgb(241, 196, 15)(s)
    case 'wilting': return chalk.rgb(230, 126, 34)(s)
    case 'dead': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('storm-calmer') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'storm-calmer': return chalk.rgb(118, 255, 3).bold(c)
    case 'clearing-skies': return chalk.rgb(46, 204, 113)(c)
    case 'dust-settling': return chalk.rgb(52, 152, 219)(c)
    case 'gritty-wind': return chalk.rgb(241, 196, 15)(c)
    case 'howling-gale': return chalk.rgb(230, 126, 34)(c)
    case 'total-whiteout': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example nomadGradeColor('desert-sage') returns colored string */
export function nomadGradeColor(g: string): string {
  switch (g) {
    case 'desert-sage': return chalk.rgb(118, 255, 3).bold(g)
    case 'master-nomad': return chalk.rgb(46, 204, 113)(g)
    case 'experienced-guide': return chalk.rgb(52, 152, 219)(g)
    case 'seasoned-traveler': return chalk.rgb(241, 196, 15)(g)
    case 'lost-wanderer': return chalk.rgb(230, 126, 34)(g)
    case 'sand-blinded': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSandstormEyeJson(result) returns JSON string */
export function formatSandstormEyeJson(result: SandstormEyeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSandstormEyeTable(result, verbose) returns formatted string */
export function formatSandstormEyeTable(result: SandstormEyeResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Sandstorm Eye Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Desert:'))
  lines.push(`    Avg Resilience:       ${scoreColor(result.desert.avgResilience)}`)
  lines.push(`    Avg Filtration:       ${scoreColor(result.desert.avgFiltration)}`)
  lines.push(`    Avg Survival:         ${scoreColor(result.desert.avgSurvival)}`)
  lines.push(`    Is Calm:              ${result.desert.isCalm ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Resilience:   ${scoreColor(result.desert.overallResilience)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:                ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:             ${result.stats.totalClusters}`)
  lines.push(`    Avg Chaos Resilience:       ${scoreColor(result.stats.avgChaosResilience)}`)
  lines.push(`    Avg Stillness Focus:        ${scoreColor(result.stats.avgStillnessFocus)}`)
  lines.push(`    Avg Grain Filtration:       ${scoreColor(result.stats.avgGrainFiltration)}`)
  lines.push(`    Avg Visibility Endurance:   ${scoreColor(result.stats.avgVisibilityEndurance)}`)
  lines.push(`    Avg Storm Navigation:       ${scoreColor(result.stats.avgStormNavigation)}`)
  lines.push(`    Avg Desert Survival:        ${scoreColor(result.stats.avgDesertSurvival)}`)
  lines.push(`    Nomad Grade:                ${nomadGradeColor(result.stats.nomadGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Storm Calmer:      ${result.stats.stormCalmerCount}`)
  lines.push(`    Clearing Skies:    ${result.stats.clearingSkiesCount}`)
  lines.push(`    Dust Settling:     ${result.stats.dustSettlingCount}`)
  lines.push(`    Gritty Wind:       ${result.stats.grittyWindCount}`)
  lines.push(`    Howling Gale:      ${result.stats.howlingGaleCount}`)
  lines.push(`    Total Whiteout:    ${result.stats.totalWhiteoutCount}`)
  lines.push('')

  if (result.stats.bestGrain) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Grain:        ${result.stats.bestGrain}`)
    lines.push(`    Most Resilient:    ${result.stats.mostResilient}`)
    lines.push(`    Most Focused:      ${result.stats.mostFocused}`)
    lines.push(`    Best Filtered:     ${result.stats.bestFiltered}`)
    lines.push(`    Most Enduring:     ${result.stats.mostEnduring}`)
    lines.push(`    Best Navigator:    ${result.stats.bestNavigator}`)
    lines.push('')
  }

  if (verbose && result.grains.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Grains:'))
    for (const g of result.grains) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(g.file)}`)
      lines.push(`      Score: ${scoreColor(g.qualityScore)}  Condition: ${conditionColor(g.condition)}`)
      lines.push(`      Resilient: ${calmColor(g.resilient.calm)}(${g.chaosResilience})  Focused: ${stillnessColor(g.focused.stillness)}(${g.stillnessFocus})  Filtering: ${filteringQualityColor(g.filtering.quality)}(${g.grainFiltration})`)
      lines.push(`      Enduring: ${visibilityColor(g.enduring.visibility)}(${g.visibilityEndurance})  Navigating: ${skillColor(g.navigating.skill)}(${g.stormNavigation})  Surviving: ${fitnessColor(g.surviving.fitness)}(${g.desertSurvival})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F32B}\u{FE0F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
