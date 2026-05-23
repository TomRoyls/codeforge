import chalk from 'chalk'

import type { DragonScaleResult } from './dragon-scale-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example armorGradeColor('adamantine-scale') returns colored string */
export function armorGradeColor(g: string): string {
  switch (g) {
    case 'adamantine-scale': return chalk.rgb(100, 149, 237).bold(g)
    case 'dragon-steel': return chalk.rgb(46, 204, 113)(g)
    case 'iron-scale': return chalk.rgb(155, 89, 182)(g)
    case 'bronze-scale': return chalk.rgb(52, 152, 219)(g)
    case 'leather-hide': return chalk.rgb(241, 196, 15)(g)
    case 'naked': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example fireIntensityColor('inferno') returns colored string */
export function fireIntensityColor(i: string): string {
  switch (i) {
    case 'inferno': return chalk.rgb(100, 149, 237).bold(i)
    case 'dragonfire': return chalk.rgb(46, 204, 113)(i)
    case 'blaze': return chalk.rgb(155, 89, 182)(i)
    case 'flame': return chalk.rgb(52, 152, 219)(i)
    case 'spark': return chalk.rgb(241, 196, 15)(i)
    case 'smoke': return chalk.rgb(231, 76, 60)(i)
    default: return i
  }
}

/** @example wingCapabilityColor('cosmic-flight') returns colored string */
export function wingCapabilityColor(c: string): string {
  switch (c) {
    case 'cosmic-flight': return chalk.rgb(100, 149, 237).bold(c)
    case 'stratospheric': return chalk.rgb(46, 204, 113)(c)
    case 'high-altitude': return chalk.rgb(155, 89, 182)(c)
    case 'cruising': return chalk.rgb(52, 152, 219)(c)
    case 'gliding': return chalk.rgb(241, 196, 15)(c)
    case 'grounded': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example wisdomAgeColor('ancient-wyrm') returns colored string */
export function wisdomAgeColor(a: string): string {
  switch (a) {
    case 'ancient-wyrm': return chalk.rgb(100, 149, 237).bold(a)
    case 'elder-dragon': return chalk.rgb(46, 204, 113)(a)
    case 'adult-dragon': return chalk.rgb(155, 89, 182)(a)
    case 'young-dragon': return chalk.rgb(52, 152, 219)(a)
    case 'hatchling': return chalk.rgb(241, 196, 15)(a)
    case 'egg': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example treasureQualityColor('legendary-hoard') returns colored string */
export function treasureQualityColor(q: string): string {
  switch (q) {
    case 'legendary-hoard': return chalk.rgb(100, 149, 237).bold(q)
    case 'golden-treasure': return chalk.rgb(46, 204, 113)(q)
    case 'silver-vault': return chalk.rgb(155, 89, 182)(q)
    case 'copper-cache': return chalk.rgb(52, 152, 219)(q)
    case 'pebbles': return chalk.rgb(241, 196, 15)(q)
    case 'empty-cave': return chalk.rgb(231, 76, 60)(q)
    default: return q
  }
}

/** @example vitalityHealthColor('undying') returns colored string */
export function vitalityHealthColor(h: string): string {
  switch (h) {
    case 'undying': return chalk.rgb(100, 149, 237).bold(h)
    case 'vigorous': return chalk.rgb(46, 204, 113)(h)
    case 'healthy': return chalk.rgb(155, 89, 182)(h)
    case 'ailing': return chalk.rgb(52, 152, 219)(h)
    case 'weakened': return chalk.rgb(241, 196, 15)(h)
    case 'dying': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example conditionColor('ancient-wyrm') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'ancient-wyrm': return chalk.rgb(100, 149, 237).bold(c)
    case 'elder-dragon': return chalk.rgb(46, 204, 113)(c)
    case 'adult-dragon': return chalk.rgb(155, 89, 182)(c)
    case 'young-drake': return chalk.rgb(52, 152, 219)(c)
    case 'hatchling': return chalk.rgb(241, 196, 15)(c)
    case 'egg': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example dragonlordGradeColor('dragon-emperor') returns colored string */
export function dragonlordGradeColor(g: string): string {
  switch (g) {
    case 'dragon-emperor': return chalk.rgb(100, 149, 237).bold(g)
    case 'dragonlord': return chalk.rgb(46, 204, 113)(g)
    case 'dragonslayer': return chalk.rgb(155, 89, 182)(g)
    case 'dragon-rider': return chalk.rgb(52, 152, 219)(g)
    case 'squire': return chalk.rgb(241, 196, 15)(g)
    case 'dragon-fodder': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example lairTypeColor('mountain-fortress') returns colored string */
export function lairTypeColor(t: string): string {
  switch (t) {
    case 'mountain-fortress': return chalk.rgb(100, 149, 237).bold(t)
    case 'volcanic-lair': return chalk.rgb(46, 204, 113)(t)
    case 'cave-system': return chalk.rgb(155, 89, 182)(t)
    case 'cliff-nest': return chalk.rgb(52, 152, 219)(t)
    case 'burrow': return chalk.rgb(241, 196, 15)(t)
    case 'exposed': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example lairConditionColor('ancient-stronghold') returns colored string */
export function lairConditionColor(c: string): string {
  switch (c) {
    case 'ancient-stronghold': return chalk.rgb(100, 149, 237).bold(c)
    case 'dragon-sanctum': return chalk.rgb(46, 204, 113)(c)
    case 'secure-lair': return chalk.rgb(155, 89, 182)(c)
    case 'modest-cave': return chalk.rgb(52, 152, 219)(c)
    case 'exposed-den': return chalk.rgb(241, 196, 15)(c)
    case 'ruins': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatDragonScaleJson(result) returns JSON string */
export function formatDragonScaleJson(result: DragonScaleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatDragonScaleTable(result, verbose) returns formatted string */
export function formatDragonScaleTable(result: DragonScaleResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Dragon Scale Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Realm Overview:'))
  lines.push(`    Overall Dominance:   ${scoreColor(result.realm.overallDominance)}`)
  lines.push(`    Avg Armor:           ${scoreColor(result.realm.avgArmor)}`)
  lines.push(`    Avg Wisdom:          ${scoreColor(result.realm.avgWisdom)}`)
  lines.push(`    Avg Vitality:        ${scoreColor(result.realm.avgVitality)}`)
  lines.push(`    Is Dominant:         ${result.realm.isDominant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:         ${result.stats.totalFiles}`)
  lines.push(`    Total Lairs:         ${result.stats.totalLairs}`)
  lines.push(`    Avg Scale Armor:     ${scoreColor(result.stats.avgScaleArmor)}`)
  lines.push(`    Avg Fire Breath:     ${scoreColor(result.stats.avgFireBreath)}`)
  lines.push(`    Avg Wing Span:       ${scoreColor(result.stats.avgWingSpan)}`)
  lines.push(`    Avg Ancient Wisdom:  ${scoreColor(result.stats.avgAncientWisdom)}`)
  lines.push(`    Avg Treasure Hoard:  ${scoreColor(result.stats.avgTreasureHoard)}`)
  lines.push(`    Avg Dragon Vitality: ${scoreColor(result.stats.avgDragonVitality)}`)
  lines.push(`    Dragonlord Grade:    ${dragonlordGradeColor(result.stats.dragonlordGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Ancient Wyrm:    ${result.stats.ancientWyrmCount}`)
  lines.push(`    Elder Dragon:    ${result.stats.elderDragonCount}`)
  lines.push(`    Adult Dragon:    ${result.stats.adultDragonCount}`)
  lines.push(`    Young Drake:     ${result.stats.youngDrakeCount}`)
  lines.push(`    Hatchling:       ${result.stats.hatchlingCount}`)
  lines.push(`    Egg:             ${result.stats.eggCount}`)
  lines.push('')

  if (result.stats.bestPlate) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Plate:      ${result.stats.bestPlate}`)
    lines.push(`    Best Armored:    ${result.stats.bestArmored}`)
    lines.push(`    Most Powerful:   ${result.stats.mostPowerful}`)
    lines.push(`    Widest Reach:    ${result.stats.widestReach}`)
    lines.push(`    Wisest:          ${result.stats.wisest}`)
    lines.push(`    Richest:         ${result.stats.richest}`)
    lines.push('')
  }

  if (verbose && result.plates.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const p of result.plates) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Armor: ${armorGradeColor(p.armor.grade)}(${p.scaleArmor})  Fire: ${fireIntensityColor(p.fire.intensity)}(${p.fireBreath})  Wing: ${wingCapabilityColor(p.wing.capability)}(${p.wingSpan})`)
      lines.push(`      Wisdom: ${wisdomAgeColor(p.wisdom.age)}(${p.ancientWisdom})  Treasure: ${treasureQualityColor(p.treasure.quality)}(${p.treasureHoard})  Vitality: ${vitalityHealthColor(p.vitality.health)}(${p.dragonVitality})`)
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
