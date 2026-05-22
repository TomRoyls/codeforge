import chalk from 'chalk'

import type { EmberHearthResult } from './ember-hearth-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('eternal-flame') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'eternal-flame': return chalk.rgb(255, 215, 0).bold(condition)
    case 'roaring-fire': return chalk.rgb(255, 140, 0)(condition)
    case 'steady-hearth': return chalk.rgb(46, 204, 113)(condition)
    case 'banked-coals': return chalk.rgb(241, 196, 15)(condition)
    case 'dying-ember': return chalk.rgb(230, 126, 34)(condition)
    case 'cold-ash': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('hearth-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'hearth-master': return chalk.rgb(255, 215, 0).bold(grade)
    case 'firekeeper': return chalk.rgb(255, 140, 0)(grade)
    case 'stoker': return chalk.rgb(46, 204, 113)(grade)
    case 'tender': return chalk.rgb(52, 152, 219)(grade)
    case 'lighter': return chalk.rgb(241, 196, 15)(grade)
    case 'ice-walker': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example glowColor('radiant') returns colored string */
export function glowColor(glow: string): string {
  switch (glow) {
    case 'radiant': return chalk.rgb(255, 215, 0).bold(glow)
    case 'warm': return chalk.rgb(255, 140, 0)(glow)
    case 'glowing': return chalk.rgb(46, 204, 113)(glow)
    case 'lukewarm': return chalk.rgb(241, 196, 15)(glow)
    case 'cool': return chalk.rgb(52, 152, 219)(glow)
    case 'cold': return chalk.rgb(231, 76, 60)(glow)
    default: return glow
  }
}

/** @example persistenceColor('eternal-flame') returns colored string */
export function persistenceColor(state: string): string {
  switch (state) {
    case 'eternal-flame': return chalk.rgb(255, 215, 0).bold(state)
    case 'steady-burn': return chalk.rgb(46, 204, 113)(state)
    case 'smoldering': return chalk.rgb(255, 140, 0)(state)
    case 'fading': return chalk.rgb(241, 196, 15)(state)
    case 'dying': return chalk.rgb(230, 126, 34)(state)
    case 'extinguished': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example fuelColor('hardwood') returns colored string */
export function fuelColor(type: string): string {
  switch (type) {
    case 'hardwood': return chalk.rgb(255, 215, 0).bold(type)
    case 'softwood': return chalk.rgb(46, 204, 113)(type)
    case 'charcoal': return chalk.rgb(52, 152, 219)(type)
    case 'peat': return chalk.rgb(241, 196, 15)(type)
    case 'dung': return chalk.rgb(230, 126, 34)(type)
    case 'wet-leaves': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example smokeColor('clear') returns colored string */
export function smokeColor(clarity: string): string {
  switch (clarity) {
    case 'clear': return chalk.rgb(255, 215, 0).bold(clarity)
    case 'wispy': return chalk.rgb(46, 204, 113)(clarity)
    case 'hazy': return chalk.rgb(52, 152, 219)(clarity)
    case 'thick': return chalk.rgb(241, 196, 15)(clarity)
    case 'toxic': return chalk.rgb(230, 126, 34)(clarity)
    case 'choking': return chalk.rgb(231, 76, 60)(clarity)
    default: return clarity
  }
}

/** @example ashColor('useful-ash') returns colored string */
export function ashColor(type: string): string {
  switch (type) {
    case 'useful-ash': return chalk.rgb(255, 215, 0).bold(type)
    case 'clean-ash': return chalk.rgb(46, 204, 113)(type)
    case 'gray-ash': return chalk.rgb(52, 152, 219)(type)
    case 'soot': return chalk.rgb(241, 196, 15)(type)
    case 'clinker': return chalk.rgb(230, 126, 34)(type)
    case 'toxic-residue': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example comfortColor('sanctuary') returns colored string */
export function comfortColor(level: string): string {
  switch (level) {
    case 'sanctuary': return chalk.rgb(255, 215, 0).bold(level)
    case 'comfortable': return chalk.rgb(46, 204, 113)(level)
    case 'adequate': return chalk.rgb(52, 152, 219)(level)
    case 'sparse': return chalk.rgb(241, 196, 15)(level)
    case 'cold': return chalk.rgb(230, 126, 34)(level)
    case 'barren': return chalk.rgb(231, 76, 60)(level)
    default: return level
  }
}

/** @example circleColor('great-hall') returns colored string */
export function circleColor(type: string): string {
  switch (type) {
    case 'great-hall': return chalk.rgb(255, 215, 0).bold(type)
    case 'family-hearth': return chalk.rgb(255, 140, 0)(type)
    case 'campfire': return chalk.rgb(46, 204, 113)(type)
    case 'fire-pit': return chalk.rgb(52, 152, 219)(type)
    case 'candle': return chalk.rgb(241, 196, 15)(type)
    case 'darkness': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatEmberHearthJson(result) returns JSON string */
export function formatEmberHearthJson(result: EmberHearthResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatEmberHearthTable(result, verbose) returns formatted string */
export function formatEmberHearthTable(result: EmberHearthResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 140, 0).bold('  Ember Hearth Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Home Overview:'))
  lines.push(`    Overall Warmth:          ${scoreColor(result.home.overallWarmth)}`)
  lines.push(`    Avg Warmth:              ${scoreColor(result.home.avgWarmth)}`)
  lines.push(`    Avg Persistence:         ${scoreColor(result.home.avgPersistence)}`)
  lines.push(`    Avg Comfort:             ${scoreColor(result.home.avgComfort)}`)
  lines.push(`    Is Warm:                 ${result.home.isWarm ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Circles:            ${result.stats.totalCircles}`)
  lines.push(`    Avg Ember Warmth:         ${scoreColor(result.stats.avgEmberWarmth)}`)
  lines.push(`    Avg Hearth Persistence:   ${scoreColor(result.stats.avgHearthPersistence)}`)
  lines.push(`    Avg Fuel Quality:         ${scoreColor(result.stats.avgFuelQuality)}`)
  lines.push(`    Avg Smoke Quality:        ${scoreColor(result.stats.avgSmokeQuality)}`)
  lines.push(`    Avg Ash Utility:          ${scoreColor(result.stats.avgAshUtility)}`)
  lines.push(`    Avg Hearth Comfort:       ${scoreColor(result.stats.avgHearthComfort)}`)
  lines.push(`    Keeper Grade:             ${gradeColor(result.stats.keeperGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Eternal Flame:            ${result.stats.eternalFlameCount}`)
  lines.push(`    Roaring Fire:             ${result.stats.roaringFireCount}`)
  lines.push(`    Steady Hearth:            ${result.stats.steadyHearthCount}`)
  lines.push(`    Banked Coals:             ${result.stats.bankedCoalsCount}`)
  lines.push(`    Dying Ember:              ${result.stats.dyingEmberCount}`)
  lines.push(`    Cold Ash:                 ${result.stats.coldAshCount}`)
  lines.push('')

  if (result.stats.bestEmber) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Ember:        ${result.stats.bestEmber}`)
    lines.push(`    Warmest:           ${result.stats.warmest}`)
    lines.push(`    Most Persistent:   ${result.stats.mostPersistent}`)
    lines.push(`    Most Efficient:    ${result.stats.mostEfficient}`)
    lines.push(`    Clearest Output:   ${result.stats.clearestOutput}`)
    lines.push(`    Most Comfortable:  ${result.stats.mostComfortable}`)
    lines.push('')
  }

  if (verbose && result.embers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const ember of result.embers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(ember.file)}`)
      lines.push(`      Score: ${scoreColor(ember.qualityScore)}  Condition: ${conditionColor(ember.condition)}`)
      lines.push(`      Warmth: ${glowColor(ember.warmth.glow)}(${ember.emberWarmth})  Persistence: ${persistenceColor(ember.persistence.state)}(${ember.hearthPersistence})  Fuel: ${fuelColor(ember.fuel.type)}(${ember.fuelQuality})`)
      lines.push(`      Smoke: ${smokeColor(ember.smoke.clarity)}(${ember.smokeQuality})  Ash: ${ashColor(ember.ash.type)}(${ember.ashUtility})  Comfort: ${comfortColor(ember.comfort.level)}(${ember.hearthComfort})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 140, 0)('\u{1F525}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
