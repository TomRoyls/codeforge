import chalk from 'chalk'

import type { CrystalCaveResult } from './crystal-cave-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('naica-mine') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'naica-mine': return chalk.rgb(255, 215, 0).bold(condition)
    case 'crystal-cathedral': return chalk.rgb(46, 204, 113)(condition)
    case 'amethyst-cave': return chalk.rgb(155, 89, 182)(condition)
    case 'geode-collection': return chalk.rgb(52, 152, 219)(condition)
    case 'rock-shop': return chalk.rgb(241, 196, 15)(condition)
    case 'gravel-pit': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-spelunker') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-spelunker': return chalk.rgb(255, 215, 0).bold(grade)
    case 'geologist': return chalk.rgb(46, 204, 113)(grade)
    case 'crystallographer': return chalk.rgb(52, 152, 219)(grade)
    case 'collector': return chalk.rgb(241, 196, 15)(grade)
    case 'tourist': return chalk.rgb(230, 126, 34)(grade)
    case 'surface-dweller': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example clarityColor('diamond-grade') returns colored string */
export function clarityColor(grade: string): string {
  switch (grade) {
    case 'diamond-grade': return chalk.rgb(255, 215, 0).bold(grade)
    case 'quartz-clear': return chalk.rgb(46, 204, 113)(grade)
    case 'frosted': return chalk.rgb(52, 152, 219)(grade)
    case 'cloudy': return chalk.rgb(241, 196, 15)(grade)
    case 'opaque': return chalk.rgb(230, 126, 34)(grade)
    case 'muddy': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example formationColor('selenite') returns colored string */
export function formationColor(type: string): string {
  switch (type) {
    case 'selenite': return chalk.rgb(255, 215, 0).bold(type)
    case 'amethyst': return chalk.rgb(155, 89, 182)(type)
    case 'calcite': return chalk.rgb(46, 204, 113)(type)
    case 'stalactite': return chalk.rgb(52, 152, 219)(type)
    case 'flowstone': return chalk.rgb(241, 196, 15)(type)
    case 'mud': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example luminescenceColor('fluorescent') returns colored string */
export function luminescenceColor(type: string): string {
  switch (type) {
    case 'fluorescent': return chalk.rgb(255, 215, 0).bold(type)
    case 'phosphorescent': return chalk.rgb(46, 204, 113)(type)
    case 'triboluminescent': return chalk.rgb(52, 152, 219)(type)
    case 'radioluminescent': return chalk.rgb(155, 89, 182)(type)
    case 'dim': return chalk.rgb(241, 196, 15)(type)
    case 'dark': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example geodeColor('crystal-filled') returns colored string */
export function geodeColor(interior: string): string {
  switch (interior) {
    case 'crystal-filled': return chalk.rgb(255, 215, 0).bold(interior)
    case 'partially-filled': return chalk.rgb(46, 204, 113)(interior)
    case 'hollow': return chalk.rgb(52, 152, 219)(interior)
    case 'solid': return chalk.rgb(241, 196, 15)(interior)
    case 'cracked': return chalk.rgb(230, 126, 34)(interior)
    case 'empty': return chalk.rgb(231, 76, 60)(interior)
    default: return interior
  }
}

/** @example purityColor('ultra-pure') returns colored string */
export function purityColor(state: string): string {
  switch (state) {
    case 'ultra-pure': return chalk.rgb(255, 215, 0).bold(state)
    case 'high-purity': return chalk.rgb(46, 204, 113)(state)
    case 'pure': return chalk.rgb(52, 152, 219)(state)
    case 'impure': return chalk.rgb(241, 196, 15)(state)
    case 'contaminated': return chalk.rgb(230, 126, 34)(state)
    case 'polluted': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example wonderColor('breathtaking') returns colored string */
export function wonderColor(impact: string): string {
  switch (impact) {
    case 'breathtaking': return chalk.rgb(255, 215, 0).bold(impact)
    case 'magnificent': return chalk.rgb(46, 204, 113)(impact)
    case 'beautiful': return chalk.rgb(155, 89, 182)(impact)
    case 'pleasant': return chalk.rgb(52, 152, 219)(impact)
    case 'ordinary': return chalk.rgb(241, 196, 15)(impact)
    case 'none': return chalk.rgb(231, 76, 60)(impact)
    default: return impact
  }
}

/** @example chamberColor('grand-cathedral') returns colored string */
export function chamberColor(type: string): string {
  switch (type) {
    case 'grand-cathedral': return chalk.rgb(255, 215, 0).bold(type)
    case 'crystal-gallery': return chalk.rgb(46, 204, 113)(type)
    case 'geode-room': return chalk.rgb(155, 89, 182)(type)
    case 'flowstone-chamber': return chalk.rgb(52, 152, 219)(type)
    case 'dripping-cave': return chalk.rgb(241, 196, 15)(type)
    case 'mud-cave': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCrystalCaveJson(result) returns JSON string */
export function formatCrystalCaveJson(result: CrystalCaveResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCrystalCaveTable(result, verbose) returns formatted string */
export function formatCrystalCaveTable(result: CrystalCaveResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Crystal Cave Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Cavern Overview:'))
  lines.push(`    Overall Wonder:          ${scoreColor(result.cavern.overallWonder)}`)
  lines.push(`    Avg Clarity:             ${scoreColor(result.cavern.avgClarity)}`)
  lines.push(`    Avg Formation:           ${scoreColor(result.cavern.avgFormation)}`)
  lines.push(`    Avg Wonder:              ${scoreColor(result.cavern.avgWonder)}`)
  lines.push(`    Is Magnificent:          ${result.cavern.isMagnificent ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Chambers:           ${result.stats.totalChambers}`)
  lines.push(`    Avg Crystal Clarity:      ${scoreColor(result.stats.avgCrystalClarity)}`)
  lines.push(`    Avg Formation Quality:    ${scoreColor(result.stats.avgFormationQuality)}`)
  lines.push(`    Avg Luminescence:         ${scoreColor(result.stats.avgLuminescence)}`)
  lines.push(`    Avg Geode Depth:          ${scoreColor(result.stats.avgGeodeDepth)}`)
  lines.push(`    Avg Mineral Purity:       ${scoreColor(result.stats.avgMineralPurity)}`)
  lines.push(`    Avg Cave Wonder:          ${scoreColor(result.stats.avgCaveWonder)}`)
  lines.push(`    Spelunker Grade:          ${gradeColor(result.stats.spelunkerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Naica Mine:               ${result.stats.naicaMineCount}`)
  lines.push(`    Crystal Cathedral:        ${result.stats.crystalCathedralCount}`)
  lines.push(`    Amethyst Cave:            ${result.stats.amethystCaveCount}`)
  lines.push(`    Geode Collection:         ${result.stats.geodeCollectionCount}`)
  lines.push(`    Rock Shop:                ${result.stats.rockShopCount}`)
  lines.push(`    Gravel Pit:               ${result.stats.gravelPitCount}`)
  lines.push('')

  if (result.stats.bestFormation) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Formation:    ${result.stats.bestFormation}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push(`    Best Formed:       ${result.stats.bestFormed}`)
    lines.push(`    Most Luminous:     ${result.stats.mostLuminous}`)
    lines.push(`    Deepest:           ${result.stats.deepest}`)
    lines.push(`    Most Wonderful:    ${result.stats.mostWonderful}`)
    lines.push('')
  }

  if (verbose && result.formations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const formation of result.formations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(formation.file)}`)
      lines.push(`      Score: ${scoreColor(formation.qualityScore)}  Condition: ${conditionColor(formation.condition)}`)
      lines.push(`      Clarity: ${clarityColor(formation.clarity.grade)}(${formation.crystalClarity})  Formation: ${formationColor(formation.formation.type)}(${formation.formationQuality})  Luminescence: ${luminescenceColor(formation.luminescence.type)}(${formation.luminescence.level})`)
      lines.push(`      Geode: ${geodeColor(formation.geode.interior)}(${formation.geodeDepth})  Purity: ${purityColor(formation.purity.state)}(${formation.mineralPurity})  Wonder: ${wonderColor(formation.wonder.impact)}(${formation.caveWonder})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u{1F48E}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
