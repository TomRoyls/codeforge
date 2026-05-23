import chalk from 'chalk'
import type { MoonlitCobbleResult } from './moonlit-cobble-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example pathConditionColor('roman-road') returns colored string */
export function pathConditionColor(s: string): string {
  switch (s) {
    case 'roman-road': return chalk.rgb(118, 255, 3).bold(s)
    case 'well-cobbled': return chalk.rgb(46, 204, 113)(s)
    case 'proper-stones': return chalk.rgb(52, 152, 219)(s)
    case 'uneven-cobbles': return chalk.rgb(241, 196, 15)(s)
    case 'dirt-path': return chalk.rgb(230, 126, 34)(s)
    case 'bog': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example journeyViewColor('moonlit-panorama') returns colored string */
export function journeyViewColor(s: string): string {
  switch (s) {
    case 'moonlit-panorama': return chalk.rgb(118, 255, 3).bold(s)
    case 'clear-vista': return chalk.rgb(46, 204, 113)(s)
    case 'proper-sight': return chalk.rgb(52, 152, 219)(s)
    case 'misty-view': return chalk.rgb(241, 196, 15)(s)
    case 'foggy': return chalk.rgb(230, 126, 34)(s)
    case 'pitch-dark': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example stoneworkQualityColor('master-mason') returns colored string */
export function stoneworkQualityColor(s: string): string {
  switch (s) {
    case 'master-mason': return chalk.rgb(118, 255, 3).bold(s)
    case 'expert-craftsman': return chalk.rgb(46, 204, 113)(s)
    case 'skilled-worker': return chalk.rgb(52, 152, 219)(s)
    case 'adequate-builder': return chalk.rgb(241, 196, 15)(s)
    case 'amateur': return chalk.rgb(230, 126, 34)(s)
    case 'rubble': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example lanternBrightnessColor('beacon-lit') returns colored string */
export function lanternBrightnessColor(s: string): string {
  switch (s) {
    case 'beacon-lit': return chalk.rgb(118, 255, 3).bold(s)
    case 'well-lit': return chalk.rgb(46, 204, 113)(s)
    case 'proper-lanterns': return chalk.rgb(52, 152, 219)(s)
    case 'dim-candles': return chalk.rgb(241, 196, 15)(s)
    case 'dying-embers': return chalk.rgb(230, 126, 34)(s)
    case 'darkness': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example safetyGuardrailColor('fortress-walls') returns colored string */
export function safetyGuardrailColor(s: string): string {
  switch (s) {
    case 'fortress-walls': return chalk.rgb(118, 255, 3).bold(s)
    case 'proper-railings': return chalk.rgb(46, 204, 113)(s)
    case 'safety-rails': return chalk.rgb(52, 152, 219)(s)
    case 'warning-signs': return chalk.rgb(241, 196, 15)(s)
    case 'unguarded-edge': return chalk.rgb(230, 126, 34)(s)
    case 'cliff': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example wayfindingSignageColor('perfect-signs') returns colored string */
export function wayfindingSignageColor(s: string): string {
  switch (s) {
    case 'perfect-signs': return chalk.rgb(118, 255, 3).bold(s)
    case 'clear-markers': return chalk.rgb(46, 204, 113)(s)
    case 'proper-directions': return chalk.rgb(52, 152, 219)(s)
    case 'vague-hints': return chalk.rgb(241, 196, 15)(s)
    case 'confusing': return chalk.rgb(230, 126, 34)(s)
    case 'labyrinth': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example stoneConditionColor('moonlit-promenade') returns colored string */
export function stoneConditionColor(c: string): string {
  switch (c) {
    case 'moonlit-promenade': return chalk.rgb(118, 255, 3).bold(c)
    case 'well-trodden-path': return chalk.rgb(46, 204, 113)(c)
    case 'cobblestone-lane': return chalk.rgb(52, 152, 219)(c)
    case 'winding-trail': return chalk.rgb(241, 196, 15)(c)
    case 'overgrown-path': return chalk.rgb(230, 126, 34)(c)
    case 'lost': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example pathfinderGradeColor('grand-pathfinder') returns colored string */
export function pathfinderGradeColor(g: string): string {
  switch (g) {
    case 'grand-pathfinder': return chalk.rgb(118, 255, 3).bold(g)
    case 'master-guide': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-navigator': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice-guide': return chalk.rgb(241, 196, 15)(g)
    case 'lost-traveler': return chalk.rgb(230, 126, 34)(g)
    case 'blind-wanderer': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMoonlitCobbleJson(result) returns JSON string */
export function formatMoonlitCobbleJson(result: MoonlitCobbleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMoonlitCobbleTable(result, verbose) returns formatted string */
export function formatMoonlitCobbleTable(result: MoonlitCobbleResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Moonlit Cobble Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  City:'))
  lines.push(`    Avg Path Quality:      ${scoreColor(result.city.avgPathQuality)}`)
  lines.push(`    Avg Clarity:           ${scoreColor(result.city.avgClarity)}`)
  lines.push(`    Avg Wayfinding:        ${scoreColor(result.city.avgWayfinding)}`)
  lines.push(`    Is Navigable:          ${result.city.isNavigable ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Navigation:    ${scoreColor(result.city.overallNavigation)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Rows:                ${result.stats.totalRows}`)
  lines.push(`    Avg Path Quality:          ${scoreColor(result.stats.avgPathQuality)}`)
  lines.push(`    Avg Journey Clarity:       ${scoreColor(result.stats.avgJourneyClarity)}`)
  lines.push(`    Avg Stonework Craft:       ${scoreColor(result.stats.avgStoneworkCraft)}`)
  lines.push(`    Avg Lantern Markers:       ${scoreColor(result.stats.avgLanternMarkers)}`)
  lines.push(`    Avg Traveler Safety:       ${scoreColor(result.stats.avgTravelerSafety)}`)
  lines.push(`    Avg Wayfinding:            ${scoreColor(result.stats.avgWayfinding)}`)
  lines.push(`    Pathfinder Grade:          ${pathfinderGradeColor(result.stats.pathfinderGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Moonlit Promenade:    ${result.stats.moonlitPromenadeCount}`)
  lines.push(`    Well Trodden Path:    ${result.stats.wellTroddenPathCount}`)
  lines.push(`    Cobblestone Lane:     ${result.stats.cobblestoneLaneCount}`)
  lines.push(`    Winding Trail:        ${result.stats.windingTrailCount}`)
  lines.push(`    Overgrown Path:       ${result.stats.overgrownPathCount}`)
  lines.push(`    Lost:                 ${result.stats.lostCount}`)
  lines.push('')

  if (result.stats.bestStone) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Stone:          ${result.stats.bestStone}`)
    lines.push(`    Smoothest Path:      ${result.stats.smoothestPath}`)
    lines.push(`    Clearest Journey:    ${result.stats.clearestJourney}`)
    lines.push(`    Best Crafted:        ${result.stats.bestCrafted}`)
    lines.push(`    Best Documented:     ${result.stats.bestDocumented}`)
    lines.push(`    Safest Path:         ${result.stats.safestPath}`)
    lines.push('')
  }

  if (verbose && result.stones.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Stones:'))
    for (const st of result.stones) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(st.file)}`)
      lines.push(`      Score: ${scoreColor(st.qualityScore)}  Condition: ${stoneConditionColor(st.condition)}`)
      lines.push(`      Path: ${pathConditionColor(st.path.condition)}(${st.pathQuality})  Journey: ${journeyViewColor(st.journey.view)}(${st.journeyClarity})  Stonework: ${stoneworkQualityColor(st.stonework.quality)}(${st.stoneworkCraft})`)
      lines.push(`      Lantern: ${lanternBrightnessColor(st.lantern.brightness)}(${st.lanternMarkers})  Safety: ${safetyGuardrailColor(st.safety.guardrail)}(${st.travelerSafety})  Wayfinding: ${wayfindingSignageColor(st.wayfindingMeasure.signage)}(${st.wayfinding})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F311}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
