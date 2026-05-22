import chalk from 'chalk'

import type { LanternGlowResult } from './lantern-glow-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('sky-lantern') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'sky-lantern': return chalk.rgb(255, 215, 0).bold(condition)
    case 'stone-lantern': return chalk.rgb(46, 204, 113)(condition)
    case 'paper-lantern': return chalk.rgb(255, 165, 0)(condition)
    case 'oil-lamp': return chalk.rgb(241, 196, 15)(condition)
    case 'candle-stub': return chalk.rgb(230, 126, 34)(condition)
    case 'extinguished': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('grand-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'grand-master': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-keeper': return chalk.rgb(46, 204, 113)(grade)
    case 'lantern-keeper': return chalk.rgb(52, 152, 219)(grade)
    case 'attendant': return chalk.rgb(241, 196, 15)(grade)
    case 'apprentice': return chalk.rgb(230, 126, 34)(grade)
    case 'darkness-dweller': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example brightnessColor('beacon') returns colored string */
export function brightnessColor(brightness: string): string {
  switch (brightness) {
    case 'beacon': return chalk.rgb(255, 215, 0)(brightness)
    case 'bright': return chalk.rgb(46, 204, 113)(brightness)
    case 'steady': return chalk.rgb(52, 152, 219)(brightness)
    case 'dim': return chalk.rgb(241, 196, 15)(brightness)
    case 'flickering': return chalk.rgb(230, 126, 34)(brightness)
    case 'dark': return chalk.rgb(231, 76, 60)(brightness)
    default: return brightness
  }
}

/** @example warmthColor('hearth') returns colored string */
export function warmthColor(quality: string): string {
  switch (quality) {
    case 'hearth': return chalk.rgb(255, 100, 50)(quality)
    case 'campfire': return chalk.rgb(255, 165, 0)(quality)
    case 'candle': return chalk.rgb(255, 215, 0)(quality)
    case 'match': return chalk.rgb(241, 196, 15)(quality)
    case 'ember': return chalk.rgb(230, 126, 34)(quality)
    case 'cold': return chalk.rgb(52, 152, 219)(quality)
    default: return quality
  }
}

/** @example stabilityColor('rock-steady') returns colored string */
export function stabilityColor(state: string): string {
  switch (state) {
    case 'rock-steady': return chalk.rgb(46, 204, 113)(state)
    case 'stable': return chalk.rgb(52, 152, 219)(state)
    case 'mostly-stable': return chalk.rgb(241, 196, 15)(state)
    case 'wavering': return chalk.rgb(230, 126, 34)(state)
    case 'unstable': return chalk.rgb(231, 76, 60)(state)
    case 'extinguished': return chalk.rgb(192, 57, 43).bold(state)
    default: return state
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatLanternGlowJson(result) returns JSON string */
export function formatLanternGlowJson(result: LanternGlowResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatLanternGlowTable(result, verbose) returns formatted string */
export function formatLanternGlowTable(result: LanternGlowResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 200, 100).bold('  Lantern Glow Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Night Overview:'))
  lines.push(`    Overall Illumination:   ${scoreColor(result.night.overallIllumination)}`)
  lines.push(`    Avg Glow:               ${scoreColor(result.night.avgGlow)}`)
  lines.push(`    Avg Stability:          ${scoreColor(result.night.avgStability)}`)
  lines.push(`    Avg Craftsmanship:      ${scoreColor(result.night.avgCraftsmanship)}`)
  lines.push(`    Is Illuminated:         ${result.night.isIlluminated ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Processions:             ${result.stats.totalProcessions}`)
  lines.push(`    Avg Glow Intensity:            ${scoreColor(result.stats.avgGlowIntensity)}`)
  lines.push(`    Avg Lantern Warmth:            ${scoreColor(result.stats.avgLanternWarmth)}`)
  lines.push(`    Avg Guidance Quality:          ${scoreColor(result.stats.avgGuidanceQuality)}`)
  lines.push(`    Avg Flame Stability:           ${scoreColor(result.stats.avgFlameStability)}`)
  lines.push(`    Avg Light Reach:               ${scoreColor(result.stats.avgLightReach)}`)
  lines.push(`    Avg Lantern Craftsmanship:     ${scoreColor(result.stats.avgLanternCraftsmanship)}`)
  lines.push(`    Lantern Keeper Grade:          ${gradeColor(result.stats.lanternKeeperGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Sky Lantern:                   ${result.stats.skyLanternCount}`)
  lines.push(`    Stone Lantern:                 ${result.stats.stoneLanternCount}`)
  lines.push(`    Paper Lantern:                 ${result.stats.paperLanternCount}`)
  lines.push(`    Oil Lamp:                      ${result.stats.oilLampCount}`)
  lines.push(`    Candle Stub:                   ${result.stats.candleStubCount}`)
  lines.push(`    Extinguished:                  ${result.stats.extinguishedCount}`)
  lines.push('')

  if (result.stats.bestFlame) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Flame:         ${result.stats.bestFlame}`)
    lines.push(`    Brightest:          ${result.stats.brightest}`)
    lines.push(`    Warmest:            ${result.stats.warmest}`)
    lines.push(`    Best Guided:        ${result.stats.bestGuided}`)
    lines.push(`    Most Stable:        ${result.stats.mostStable}`)
    lines.push(`    Farthest Reach:     ${result.stats.farthestReach}`)
    lines.push('')
  }

  if (verbose && result.flames.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const flame of result.flames) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(flame.file)}`)
      lines.push(`      Score: ${scoreColor(flame.qualityScore)}  Condition: ${conditionColor(flame.condition)}`)
      lines.push(`      Glow: ${brightnessColor(flame.glow.brightness)}(${flame.glowIntensity})  Warmth: ${warmthColor(flame.warmth.quality)}(${flame.lanternWarmth})  Guidance: ${flame.guidance.type}(${flame.guidanceQuality})`)
      lines.push(`      Stability: ${stabilityColor(flame.stability.state)}(${flame.flameStability})  Reach: ${flame.reach.range}(${flame.lightReach})  Craft: ${flame.craftsmanship.make}(${flame.lanternCraftsmanship})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 215, 0)('\u{1F3EE}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
