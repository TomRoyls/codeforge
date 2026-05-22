import chalk from 'chalk'

import type { StardustTrailResult } from './stardust-trail-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('cosmic-treasure') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'cosmic-treasure': return chalk.rgb(255, 215, 0).bold(condition)
    case 'stellar-nursery': return chalk.rgb(155, 89, 182)(condition)
    case 'main-sequence': return chalk.rgb(46, 204, 113)(condition)
    case 'red-giant': return chalk.rgb(255, 99, 71)(condition)
    case 'brown-dwarf': return chalk.rgb(241, 196, 15)(condition)
    case 'cosmic-dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('cosmic-observer') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'cosmic-observer': return chalk.rgb(255, 215, 0).bold(grade)
    case 'astrophysicist': return chalk.rgb(155, 89, 182)(grade)
    case 'astronomer': return chalk.rgb(46, 204, 113)(grade)
    case 'stargazer': return chalk.rgb(52, 152, 219)(grade)
    case 'telescope-operator': return chalk.rgb(241, 196, 15)(grade)
    case 'blind-spot': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example originColor('first-generation') returns colored string */
export function originColor(source: string): string {
  switch (source) {
    case 'first-generation': return chalk.rgb(255, 215, 0).bold(source)
    case 'second-generation': return chalk.rgb(46, 204, 113)(source)
    case 'population-i': return chalk.rgb(155, 89, 182)(source)
    case 'population-ii': return chalk.rgb(52, 152, 219)(source)
    case 'primordial': return chalk.rgb(241, 196, 15)(source)
    case 'primordial-soup': return chalk.rgb(231, 76, 60)(source)
    default: return source
  }
}

/** @example elementsColor('heavy-elements') returns colored string */
export function elementsColor(elements: string): string {
  switch (elements) {
    case 'heavy-elements': return chalk.rgb(255, 215, 0).bold(elements)
    case 'carbon-based': return chalk.rgb(46, 204, 113)(elements)
    case 'silicon-based': return chalk.rgb(155, 89, 182)(elements)
    case 'hydrogen': return chalk.rgb(52, 152, 219)(elements)
    case 'helium': return chalk.rgb(241, 196, 15)(elements)
    case 'void': return chalk.rgb(231, 76, 60)(elements)
    default: return elements
  }
}

/** @example massColor('supermassive') returns colored string */
export function massColor(mass: string): string {
  switch (mass) {
    case 'supermassive': return chalk.rgb(255, 215, 0).bold(mass)
    case 'massive': return chalk.rgb(46, 204, 113)(mass)
    case 'intermediate': return chalk.rgb(155, 89, 182)(mass)
    case 'stellar': return chalk.rgb(52, 152, 219)(mass)
    case 'planetary': return chalk.rgb(241, 196, 15)(mass)
    case 'dust-grain': return chalk.rgb(231, 76, 60)(mass)
    default: return mass
  }
}

/** @example orbitColor('stable-orbit') returns colored string */
export function orbitColor(orbit: string): string {
  switch (orbit) {
    case 'stable-orbit': return chalk.rgb(255, 215, 0).bold(orbit)
    case 'circular': return chalk.rgb(46, 204, 113)(orbit)
    case 'elliptical': return chalk.rgb(52, 152, 219)(orbit)
    case 'decaying': return chalk.rgb(241, 196, 15)(orbit)
    case 'chaotic': return chalk.rgb(230, 126, 34)(orbit)
    case 'ejected': return chalk.rgb(231, 76, 60)(orbit)
    default: return orbit
  }
}

/** @example remnantColor('neutron-star') returns colored string */
export function remnantColor(type: string): string {
  switch (type) {
    case 'neutron-star': return chalk.rgb(255, 215, 0).bold(type)
    case 'white-dwarf': return chalk.rgb(46, 204, 113)(type)
    case 'pulsar': return chalk.rgb(155, 89, 182)(type)
    case 'black-dwarf': return chalk.rgb(52, 152, 219)(type)
    case 'brown-dwarf': return chalk.rgb(241, 196, 15)(type)
    case 'debris': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example legacyColor('cosmic-legacy') returns colored string */
export function legacyColor(impact: string): string {
  switch (impact) {
    case 'cosmic-legacy': return chalk.rgb(255, 215, 0).bold(impact)
    case 'stellar-legacy': return chalk.rgb(46, 204, 113)(impact)
    case 'planetary-legacy': return chalk.rgb(155, 89, 182)(impact)
    case 'local-legacy': return chalk.rgb(52, 152, 219)(impact)
    case 'ephemeral': return chalk.rgb(241, 196, 15)(impact)
    case 'nonexistent': return chalk.rgb(231, 76, 60)(impact)
    default: return impact
  }
}

/** @example clusterColor('globular-cluster') returns colored string */
export function clusterColor(type: string): string {
  switch (type) {
    case 'globular-cluster': return chalk.rgb(255, 215, 0).bold(type)
    case 'open-cluster': return chalk.rgb(155, 89, 182)(type)
    case 'stellar-association': return chalk.rgb(46, 204, 113)(type)
    case 'galaxy-arm': return chalk.rgb(52, 152, 219)(type)
    case 'dark-cloud': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatStardustTrailJson(result) returns JSON string */
export function formatStardustTrailJson(result: StardustTrailResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatStardustTrailTable(result, verbose) returns formatted string */
export function formatStardustTrailTable(result: StardustTrailResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Stardust Trail Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Cosmos Overview:'))
  lines.push(`    Overall Cosmic:          ${scoreColor(result.cosmos.overallCosmic)}`)
  lines.push(`    Avg Origin:              ${scoreColor(result.cosmos.avgOrigin)}`)
  lines.push(`    Avg Stability:           ${scoreColor(result.cosmos.avgStability)}`)
  lines.push(`    Avg Legacy:              ${scoreColor(result.cosmos.avgLegacy)}`)
  lines.push(`    Is Cosmic:               ${result.cosmos.isCosmic ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:           ${result.stats.totalClusters}`)
  lines.push(`    Avg Stellar Origin:       ${scoreColor(result.stats.avgStellarOrigin)}`)
  lines.push(`    Avg Elemental Comp:       ${scoreColor(result.stats.avgElementalComposition)}`)
  lines.push(`    Avg Gravitational Pull:   ${scoreColor(result.stats.avgGravitationalPull)}`)
  lines.push(`    Avg Orbital Stability:    ${scoreColor(result.stats.avgOrbitalStability)}`)
  lines.push(`    Avg Supernova Remnant:    ${scoreColor(result.stats.avgSupernovaRemnant)}`)
  lines.push(`    Avg Cosmic Legacy:        ${scoreColor(result.stats.avgCosmicLegacy)}`)
  lines.push(`    Astronomer Grade:         ${gradeColor(result.stats.astronomerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Cosmic Treasure:          ${result.stats.cosmicTreasureCount}`)
  lines.push(`    Stellar Nursery:          ${result.stats.stellarNurseryCount}`)
  lines.push(`    Main Sequence:            ${result.stats.mainSequenceCount}`)
  lines.push(`    Red Giant:                ${result.stats.redGiantCount}`)
  lines.push(`    Brown Dwarf:              ${result.stats.brownDwarfCount}`)
  lines.push(`    Cosmic Dust:              ${result.stats.cosmicDustCount}`)
  lines.push('')

  if (result.stats.bestRemnant) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Remnant:      ${result.stats.bestRemnant}`)
    lines.push(`    Best Origin:       ${result.stats.bestOrigin}`)
    lines.push(`    Most Diverse:      ${result.stats.mostDiverse}`)
    lines.push(`    Most Important:    ${result.stats.mostImportant}`)
    lines.push(`    Most Stable:       ${result.stats.mostStable}`)
    lines.push(`    Greatest Legacy:   ${result.stats.greatestLegacy}`)
    lines.push('')
  }

  if (verbose && result.remnants.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const remnant of result.remnants) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(remnant.file)}`)
      lines.push(`      Score: ${scoreColor(remnant.qualityScore)}  Condition: ${conditionColor(remnant.condition)}`)
      lines.push(`      Origin: ${originColor(remnant.origin.source)}(${remnant.stellarOrigin})  Composition: ${elementsColor(remnant.composition.elements)}(${remnant.elementalComposition})  Gravity: ${massColor(remnant.gravity.mass)}(${remnant.gravitationalPull})`)
      lines.push(`      Stability: ${orbitColor(remnant.stability.orbit)}(${remnant.orbitalStability})  Remnant: ${remnantColor(remnant.remnant.type)}(${remnant.supernovaRemnant})  Legacy: ${legacyColor(remnant.legacy.impact)}(${remnant.cosmicLegacy})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u{2728}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
