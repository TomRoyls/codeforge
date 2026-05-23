import chalk from 'chalk'

import type { StarlightCompassResult } from './starlight-compass-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('celestial-chart') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'celestial-chart': return chalk.rgb(100, 149, 237).bold(condition)
    case 'star-map': return chalk.rgb(46, 204, 113)(condition)
    case 'navigational-aid': return chalk.rgb(52, 152, 219)(condition)
    case 'rough-sketch': return chalk.rgb(241, 196, 15)(condition)
    case 'smudged-drawing': return chalk.rgb(230, 126, 34)(condition)
    case 'blank': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example brightnessColor('polaris-brilliant') returns colored string */
export function brightnessColor(b: string): string {
  switch (b) {
    case 'polaris-brilliant': return chalk.rgb(100, 149, 237).bold(b)
    case 'bright-guide': return chalk.rgb(46, 204, 113)(b)
    case 'visible-star': return chalk.rgb(155, 89, 182)(b)
    case 'dim-star': return chalk.rgb(52, 152, 219)(b)
    case 'flickering': return chalk.rgb(241, 196, 15)(b)
    case 'invisible': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example patternColor('ursa-major') returns colored string */
export function patternColor(p: string): string {
  switch (p) {
    case 'ursa-major': return chalk.rgb(100, 149, 237).bold(p)
    case 'orion': return chalk.rgb(46, 204, 113)(p)
    case 'well-mapped': return chalk.rgb(155, 89, 182)(p)
    case 'partial-map': return chalk.rgb(52, 152, 219)(p)
    case 'random-stars': return chalk.rgb(241, 196, 15)(p)
    case 'chaos': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example precisionColor('gps-grade') returns colored string */
export function precisionColor(p: string): string {
  switch (p) {
    case 'gps-grade': return chalk.rgb(100, 149, 237).bold(p)
    case 'celestial-navigation': return chalk.rgb(46, 204, 113)(p)
    case 'dead-reckoning': return chalk.rgb(155, 89, 182)(p)
    case 'approximate': return chalk.rgb(52, 152, 219)(p)
    case 'lost': return chalk.rgb(241, 196, 15)(p)
    case 'shipwreck': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example visibilityColor('crystal-night') returns colored string */
export function visibilityColor(v: string): string {
  switch (v) {
    case 'crystal-night': return chalk.rgb(100, 149, 237).bold(v)
    case 'clear-sky': return chalk.rgb(46, 204, 113)(v)
    case 'partly-cloudy': return chalk.rgb(155, 89, 182)(v)
    case 'light-pollution': return chalk.rgb(52, 152, 219)(v)
    case 'foggy': return chalk.rgb(241, 196, 15)(v)
    case 'blizzard': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example scopeColor('cosmic-perspective') returns colored string */
export function scopeColor(s: string): string {
  switch (s) {
    case 'cosmic-perspective': return chalk.rgb(100, 149, 237).bold(s)
    case 'galactic-view': return chalk.rgb(46, 204, 113)(s)
    case 'stellar-view': return chalk.rgb(155, 89, 182)(s)
    case 'planetary-view': return chalk.rgb(52, 152, 219)(s)
    case 'surface-level': return chalk.rgb(241, 196, 15)(s)
    case 'subterranean': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example ratingColor('master-navigator') returns colored string */
export function ratingColor(r: string): string {
  switch (r) {
    case 'master-navigator': return chalk.rgb(100, 149, 237).bold(r)
    case 'skilled-pilot': return chalk.rgb(46, 204, 113)(r)
    case 'competent-helmsman': return chalk.rgb(155, 89, 182)(r)
    case 'learning-sailor': return chalk.rgb(52, 152, 219)(r)
    case 'lost-wanderer': return chalk.rgb(241, 196, 15)(r)
    case 'adrift': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example navigatorGradeColor('celestial-master') returns colored string */
export function navigatorGradeColor(g: string): string {
  switch (g) {
    case 'celestial-master': return chalk.rgb(100, 149, 237).bold(g)
    case 'master-navigator': return chalk.rgb(46, 204, 113)(g)
    case 'navigator': return chalk.rgb(155, 89, 182)(g)
    case 'apprentice': return chalk.rgb(52, 152, 219)(g)
    case 'landlubber': return chalk.rgb(241, 196, 15)(g)
    case 'lost-soul': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example skyTypeColor('celestial-sphere') returns colored string */
export function skyTypeColor(t: string): string {
  switch (t) {
    case 'celestial-sphere': return chalk.rgb(100, 149, 237).bold(t)
    case 'night-hemisphere': return chalk.rgb(46, 204, 113)(t)
    case 'visible-sky': return chalk.rgb(155, 89, 182)(t)
    case 'cloudy-sky': return chalk.rgb(52, 152, 219)(t)
    case 'overcast': return chalk.rgb(241, 196, 15)(t)
    case 'void': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example skyConditionColor('master-chart') returns colored string */
export function skyConditionColor(c: string): string {
  switch (c) {
    case 'master-chart': return chalk.rgb(100, 149, 237).bold(c)
    case 'navigational-sky': return chalk.rgb(46, 204, 113)(c)
    case 'partly-mapped': return chalk.rgb(155, 89, 182)(c)
    case 'dim-sky': return chalk.rgb(52, 152, 219)(c)
    case 'darkness': return chalk.rgb(241, 196, 15)(c)
    case 'void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatStarlightCompassJson(result) returns JSON string */
export function formatStarlightCompassJson(result: StarlightCompassResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatStarlightCompassTable(result, verbose) returns formatted string */
export function formatStarlightCompassTable(result: StarlightCompassResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Starlight Compass Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Cosmos Overview:'))
  lines.push(`    Overall Navigation:     ${scoreColor(result.cosmos.overallNavigation)}`)
  lines.push(`    Avg Pole Star:          ${scoreColor(result.cosmos.avgPoleStar)}`)
  lines.push(`    Avg Constellation Map:  ${scoreColor(result.cosmos.avgMapping)}`)
  lines.push(`    Avg Guidance:           ${scoreColor(result.cosmos.avgGuidance)}`)
  lines.push(`    Is Navigable:           ${result.cosmos.isNavigable ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Skies:            ${result.stats.totalSkies}`)
  lines.push(`    Avg Pole Star:          ${scoreColor(result.stats.avgPoleStar)}`)
  lines.push(`    Avg Constellation Map:  ${scoreColor(result.stats.avgConstellationMapping)}`)
  lines.push(`    Avg Nav Accuracy:       ${scoreColor(result.stats.avgNavigationalAccuracy)}`)
  lines.push(`    Avg Stellar Clarity:    ${scoreColor(result.stats.avgStellarClarity)}`)
  lines.push(`    Avg Cosmic Awareness:   ${scoreColor(result.stats.avgCosmicAwareness)}`)
  lines.push(`    Avg Guidance Quality:   ${scoreColor(result.stats.avgGuidanceQuality)}`)
  lines.push(`    Navigator Grade:        ${navigatorGradeColor(result.stats.navigatorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Celestial Chart:  ${result.stats.celestialChartCount}`)
  lines.push(`    Star Map:         ${result.stats.starMapCount}`)
  lines.push(`    Navigational Aid: ${result.stats.navigationalAidCount}`)
  lines.push(`    Rough Sketch:     ${result.stats.roughSketchCount}`)
  lines.push(`    Smudged Drawing:  ${result.stats.smudgedDrawingCount}`)
  lines.push(`    Blank:            ${result.stats.blankCount}`)
  lines.push('')

  if (result.stats.bestPoint) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Point:       ${result.stats.bestPoint}`)
    lines.push(`    Brightest Pole:   ${result.stats.brightestPole}`)
    lines.push(`    Best Mapped:      ${result.stats.bestMapped}`)
    lines.push(`    Most Accurate:    ${result.stats.mostAccurate}`)
    lines.push(`    Clearest:         ${result.stats.clearest}`)
    lines.push(`    Best Guidance:    ${result.stats.bestGuidance}`)
    lines.push('')
  }

  if (verbose && result.points.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const p of result.points) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Pole: ${brightnessColor(p.pole.brightness)}(${p.poleStar})  Const: ${patternColor(p.constellation.pattern)}(${p.constellationMapping})  Nav: ${precisionColor(p.navigational.precision)}(${p.navigationalAccuracy})`)
      lines.push(`      Stellar: ${visibilityColor(p.stellar.visibility)}(${p.stellarClarity})  Cosmic: ${scopeColor(p.cosmic.scope)}(${p.cosmicAwareness})  Guide: ${ratingColor(p.guidance.rating)}(${p.guidanceQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 149, 237)('\u{2728}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
