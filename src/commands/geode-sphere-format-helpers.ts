import chalk from 'chalk'

import type { GeodeSphereResult } from './geode-sphere-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('museum-specimen') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'museum-specimen': return chalk.rgb(255, 215, 0).bold(condition)
    case 'collector-piece': return chalk.rgb(46, 204, 113)(condition)
    case 'display-quality': return chalk.rgb(52, 152, 219)(condition)
    case 'rough-specimen': return chalk.rgb(241, 196, 15)(condition)
    case 'fragment': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-prospector') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-prospector': return chalk.rgb(255, 215, 0).bold(grade)
    case 'gemologist': return chalk.rgb(46, 204, 113)(grade)
    case 'miner': return chalk.rgb(155, 89, 182)(grade)
    case 'rockhound': return chalk.rgb(52, 152, 219)(grade)
    case 'amateur': return chalk.rgb(241, 196, 15)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example roughnessColor('polished') returns colored string */
export function roughnessColor(roughness: string): string {
  switch (roughness) {
    case 'polished': return chalk.rgb(255, 215, 0).bold(roughness)
    case 'smooth': return chalk.rgb(46, 204, 113)(roughness)
    case 'rough': return chalk.rgb(155, 89, 182)(roughness)
    case 'jagged': return chalk.rgb(52, 152, 219)(roughness)
    case 'crumbling': return chalk.rgb(241, 196, 15)(roughness)
    case 'dust': return chalk.rgb(231, 76, 60)(roughness)
    default: return roughness
  }
}

/** @example treasureColor('amethyst-cathedral') returns colored string */
export function treasureColor(treasure: string): string {
  switch (treasure) {
    case 'amethyst-cathedral': return chalk.rgb(255, 215, 0).bold(treasure)
    case 'crystal-cavity': return chalk.rgb(46, 204, 113)(treasure)
    case 'agate-rings': return chalk.rgb(155, 89, 182)(treasure)
    case 'micro-crystals': return chalk.rgb(52, 152, 219)(treasure)
    case 'druzy': return chalk.rgb(241, 196, 15)(treasure)
    case 'hollow': return chalk.rgb(231, 76, 60)(treasure)
    default: return treasure
  }
}

/** @example crystalTypeColor('pristine-crystal') returns colored string */
export function crystalTypeColor(type: string): string {
  switch (type) {
    case 'pristine-crystal': return chalk.rgb(255, 215, 0).bold(type)
    case 'well-formed': return chalk.rgb(46, 204, 113)(type)
    case 'dendritic': return chalk.rgb(155, 89, 182)(type)
    case 'massive': return chalk.rgb(52, 152, 219)(type)
    case 'cryptocrystalline': return chalk.rgb(241, 196, 15)(type)
    case 'amorphous': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example eraColor('archean') returns colored string */
export function eraColor(era: string): string {
  switch (era) {
    case 'archean': return chalk.rgb(255, 215, 0).bold(era)
    case 'proterozoic': return chalk.rgb(46, 204, 113)(era)
    case 'paleozoic': return chalk.rgb(155, 89, 182)(era)
    case 'mesozoic': return chalk.rgb(52, 152, 219)(era)
    case 'cenozoic': return chalk.rgb(241, 196, 15)(era)
    case 'holocene': return chalk.rgb(231, 76, 60)(era)
    default: return era
  }
}

/** @example planeColor('perfect-cleavage') returns colored string */
export function planeColor(plane: string): string {
  switch (plane) {
    case 'perfect-cleavage': return chalk.rgb(255, 215, 0).bold(plane)
    case 'good-cleavage': return chalk.rgb(46, 204, 113)(plane)
    case 'distinct': return chalk.rgb(155, 89, 182)(plane)
    case 'indistinct': return chalk.rgb(52, 152, 219)(plane)
    case 'difficult': return chalk.rgb(241, 196, 15)(plane)
    case 'none': return chalk.rgb(231, 76, 60)(plane)
    default: return plane
  }
}

/** @example valueColor('precious-gem') returns colored string */
export function valueColor(value: string): string {
  switch (value) {
    case 'precious-gem': return chalk.rgb(255, 215, 0).bold(value)
    case 'semi-precious': return chalk.rgb(46, 204, 113)(value)
    case 'industrial': return chalk.rgb(155, 89, 182)(value)
    case 'common': return chalk.rgb(52, 152, 219)(value)
    case 'low-grade': return chalk.rgb(241, 196, 15)(value)
    case 'barren': return chalk.rgb(231, 76, 60)(value)
    default: return value
  }
}

/** @example veinTypeColor('mother-lode') returns colored string */
export function veinTypeColor(type: string): string {
  switch (type) {
    case 'mother-lode': return chalk.rgb(255, 215, 0).bold(type)
    case 'rich-vein': return chalk.rgb(46, 204, 113)(type)
    case 'mineral-seam': return chalk.rgb(155, 89, 182)(type)
    case 'trace-deposit': return chalk.rgb(52, 152, 219)(type)
    case 'barren-rock': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatGeodeSphereJson(result) returns JSON string */
export function formatGeodeSphereJson(result: GeodeSphereResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatGeodeSphereTable(result, verbose) returns formatted string */
export function formatGeodeSphereTable(result: GeodeSphereResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Geode Sphere Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Quarry Overview:'))
  lines.push(`    Overall Quality:     ${scoreColor(result.quarry.overallQuality)}`)
  lines.push(`    Avg Inner Beauty:    ${scoreColor(result.quarry.avgBeauty)}`)
  lines.push(`    Avg Crystal Form:    ${scoreColor(result.quarry.avgCrystal)}`)
  lines.push(`    Avg Mineral Wealth:  ${scoreColor(result.quarry.avgWealth)}`)
  lines.push(`    Is Gem Quality:      ${result.quarry.isGemQuality ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Veins:            ${result.stats.totalVeins}`)
  lines.push(`    Avg Inner Beauty:       ${scoreColor(result.stats.avgInnerBeauty)}`)
  lines.push(`    Avg Crystal Formation:  ${scoreColor(result.stats.avgCrystalFormation)}`)
  lines.push(`    Avg Geological Pressure:${scoreColor(result.stats.avgGeologicalPressure)}`)
  lines.push(`    Avg Cleavage Quality:   ${scoreColor(result.stats.avgCleavageQuality)}`)
  lines.push(`    Avg Mineral Wealth:     ${scoreColor(result.stats.avgMineralWealth)}`)
  lines.push(`    Avg Exterior:           ${scoreColor(result.stats.avgExteriorImpression)}`)
  lines.push(`    Prospector Grade:       ${gradeColor(result.stats.prospectorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Museum Specimen:  ${result.stats.museumSpecimenCount}`)
  lines.push(`    Collector Piece:  ${result.stats.collectorPieceCount}`)
  lines.push(`    Display Quality:  ${result.stats.displayQualityCount}`)
  lines.push(`    Rough Specimen:   ${result.stats.roughSpecimenCount}`)
  lines.push(`    Fragment:         ${result.stats.fragmentCount}`)
  lines.push(`    Dust:             ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestSpecimen) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Specimen:    ${result.stats.bestSpecimen}`)
    lines.push(`    Most Beautiful:   ${result.stats.mostBeautiful}`)
    lines.push(`    Best Crystals:    ${result.stats.bestCrystals}`)
    lines.push(`    Most Mature:      ${result.stats.mostMature}`)
    lines.push(`    Best Cleavage:    ${result.stats.bestCleavage}`)
    lines.push(`    Most Valuable:    ${result.stats.mostValuable}`)
    lines.push('')
  }

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const sp of result.specimens) {
      lines.push(`    ${chalk.rgb(155, 89, 182)(sp.file)}`)
      lines.push(`      Score: ${scoreColor(sp.qualityScore)}  Condition: ${conditionColor(sp.condition)}`)
      lines.push(`      Exterior: ${roughnessColor(sp.exterior.roughness)}(${sp.exteriorImpression})  Inner: ${treasureColor(sp.inner.treasure)}(${sp.innerBeauty})  Crystal: ${crystalTypeColor(sp.crystal.type)}(${sp.crystalFormation})`)
      lines.push(`      Geo: ${eraColor(sp.geological.era)}(${sp.geologicalPressure})  Cleavage: ${planeColor(sp.cleavage.plane)}(${sp.cleavageQuality})  Mineral: ${valueColor(sp.mineral.value)}(${sp.mineralWealth})`)
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
