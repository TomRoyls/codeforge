import chalk from 'chalk'
import type { LanternGlowResult } from './lantern-glow-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 183, 77)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example brightnessColor('blazing-light') returns colored string */
export function brightnessColor(b: string): string {
  switch (b) {
    case 'blazing-light': return chalk.rgb(255, 183, 77).bold(b)
    case 'bright-glow': return chalk.rgb(46, 204, 113)(b)
    case 'steady-flame': return chalk.rgb(52, 152, 219)(b)
    case 'flickering': return chalk.rgb(241, 196, 15)(b)
    case 'dim-glow': return chalk.rgb(230, 126, 34)(b)
    case 'extinguished': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example feelingColor('hearth-fire') returns colored string */
export function feelingColor(f: string): string {
  switch (f) {
    case 'hearth-fire': return chalk.rgb(255, 183, 77).bold(f)
    case 'warm-welcome': return chalk.rgb(46, 204, 113)(f)
    case 'friendly-glow': return chalk.rgb(52, 152, 219)(f)
    case 'neutral-light': return chalk.rgb(241, 196, 15)(f)
    case 'cold-fluorescent': return chalk.rgb(230, 126, 34)(f)
    case 'sterile': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example guideQualityColor('lighthouse-beam') returns colored string */
export function guideQualityColor(g: string): string {
  switch (g) {
    case 'lighthouse-beam': return chalk.rgb(255, 183, 77).bold(g)
    case 'clear-signpost': return chalk.rgb(46, 204, 113)(g)
    case 'reliable-compass': return chalk.rgb(52, 152, 219)(g)
    case 'vague-hint': return chalk.rgb(241, 196, 15)(g)
    case 'misleading-trail': return chalk.rgb(230, 126, 34)(g)
    case 'no-guide': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example consumptionColor('perfect-burn') returns colored string */
export function consumptionColor(c: string): string {
  switch (c) {
    case 'perfect-burn': return chalk.rgb(255, 183, 77).bold(c)
    case 'efficient-flame': return chalk.rgb(46, 204, 113)(c)
    case 'proper-combustion': return chalk.rgb(52, 152, 219)(c)
    case 'wasteful-burn': return chalk.rgb(241, 196, 15)(c)
    case 'smoky': return chalk.rgb(230, 126, 34)(c)
    case 'burning-out': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example coverageColor('far-reaching') returns colored string */
export function coverageColor(c: string): string {
  switch (c) {
    case 'far-reaching': return chalk.rgb(255, 183, 77).bold(c)
    case 'wide-glow': return chalk.rgb(46, 204, 113)(c)
    case 'proper-radius': return chalk.rgb(52, 152, 219)(c)
    case 'limited-reach': return chalk.rgb(241, 196, 15)(c)
    case 'narrow-beam': return chalk.rgb(230, 126, 34)(c)
    case 'pocket-light': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example controlColor('shadow-master') returns colored string */
export function controlColor(c: string): string {
  switch (c) {
    case 'shadow-master': return chalk.rgb(255, 183, 77).bold(c)
    case 'controlled-shadows': return chalk.rgb(46, 204, 113)(c)
    case 'managed-darkness': return chalk.rgb(52, 152, 219)(c)
    case 'lurking-shadows': return chalk.rgb(241, 196, 15)(c)
    case 'shadow-overrun': return chalk.rgb(230, 126, 34)(c)
    case 'total-darkness': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example conditionColor('beacon-light') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'beacon-light': return chalk.rgb(255, 183, 77).bold(c)
    case 'steady-lantern': return chalk.rgb(46, 204, 113)(c)
    case 'flickering-flame': return chalk.rgb(52, 152, 219)(c)
    case 'dying-ember': return chalk.rgb(241, 196, 15)(c)
    case 'smoking-wick': return chalk.rgb(230, 126, 34)(c)
    case 'darkness': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-lamplighter') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-lamplighter': return chalk.rgb(255, 183, 77).bold(g)
    case 'expert-lightkeeper': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-lamplighter': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'arsonist': return chalk.rgb(231, 76, 60)(g)
    default: return g
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
  lines.push(chalk.rgb(255, 183, 77).bold('  Lantern Glow Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Village:'))
  lines.push(`    Overall Illumination:   ${scoreColor(result.village.overallIllumination)}`)
  lines.push(`    Avg Illumination:       ${scoreColor(result.village.avgIllumination)}`)
  lines.push(`    Avg Guidance:           ${scoreColor(result.village.avgGuidance)}`)
  lines.push(`    Avg Efficiency:         ${scoreColor(result.village.avgEfficiency)}`)
  lines.push(`    Is Bright:              ${result.village.isBright ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Rows:               ${result.stats.totalRows}`)
  lines.push(`    Avg Illumination:         ${scoreColor(result.stats.avgIllumination)}`)
  lines.push(`    Avg Warmth:               ${scoreColor(result.stats.avgWarmth)}`)
  lines.push(`    Avg Guidance:             ${scoreColor(result.stats.avgGuidance)}`)
  lines.push(`    Avg Fuel Efficiency:      ${scoreColor(result.stats.avgFuelEfficiency)}`)
  lines.push(`    Avg Glow Reach:           ${scoreColor(result.stats.avgGlowReach)}`)
  lines.push(`    Avg Shadow Management:    ${scoreColor(result.stats.avgShadowManagement)}`)
  lines.push(`    Lamplighter Grade:        ${gradeColor(result.stats.lamplighterGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Condition Counts:'))
  lines.push(`    Beacon Light:      ${result.stats.beaconLightCount}`)
  lines.push(`    Steady Lantern:    ${result.stats.steadyLanternCount}`)
  lines.push(`    Flickering Flame:  ${result.stats.flickeringFlameCount}`)
  lines.push(`    Dying Ember:       ${result.stats.dyingEmberCount}`)
  lines.push(`    Smoking Wick:      ${result.stats.smokingWickCount}`)
  lines.push(`    Darkness:          ${result.stats.darknessCount}`)
  lines.push('')

  if (result.stats.bestFlame) {
    lines.push(chalk.rgb(255, 183, 77)('  Highlights:'))
    lines.push(`    Best Flame:          ${result.stats.bestFlame}`)
    lines.push(`    Brightest:           ${result.stats.brightest}`)
    lines.push(`    Warmest:             ${result.stats.warmest}`)
    lines.push(`    Best Guided:         ${result.stats.bestGuided}`)
    lines.push(`    Most Efficient:      ${result.stats.mostEfficient}`)
    lines.push(`    Farthest Reaching:   ${result.stats.farthestReaching}`)
    lines.push('')
  }

  if (verbose && result.flames.length > 0) {
    lines.push(chalk.rgb(255, 183, 77)('  Per-File Flames:'))
    for (const f of result.flames) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Light: ${brightnessColor(f.illuminated.brightness)}(${f.illumination})  Warm: ${feelingColor(f.warm.feeling)}(${f.warmth})  Guide: ${guideQualityColor(f.guiding.quality)}(${f.guidance})`)
      lines.push(`      Efficient: ${consumptionColor(f.efficient.consumption)}(${f.fuelEfficiency})  Reach: ${coverageColor(f.reaching.coverage)}(${f.glowReach})  Shadow: ${controlColor(f.shadow.control)}(${f.shadowManagement})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 183, 77)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 183, 77)('\u{1F56F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
