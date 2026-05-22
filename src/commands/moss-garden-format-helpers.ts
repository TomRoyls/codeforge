import chalk from 'chalk'

import type { MossGardenResult } from './moss-garden-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('kyoto-garden') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'kyoto-garden': return chalk.rgb(46, 204, 113).bold(condition)
    case 'temple-moss': return chalk.rgb(52, 152, 219)(condition)
    case 'zen-garden': return chalk.rgb(155, 89, 182)(condition)
    case 'forest-floor': return chalk.rgb(241, 196, 15)(condition)
    case 'crack-moss': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('zen-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'zen-master': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-gardener': return chalk.rgb(52, 152, 219)(grade)
    case 'gardener': return chalk.rgb(155, 89, 182)(grade)
    case 'groundskeeper': return chalk.rgb(241, 196, 15)(grade)
    case 'amateur': return chalk.rgb(230, 126, 34)(grade)
    case 'concrete-paver': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example speciesColor('sphagnum') returns colored string */
export function speciesColor(species: string): string {
  switch (species) {
    case 'sphagnum': return chalk.rgb(46, 204, 113)(species)
    case 'polytrichum': return chalk.rgb(52, 152, 219)(species)
    case 'bryum': return chalk.rgb(155, 89, 182)(species)
    case 'hypnum': return chalk.rgb(241, 196, 15)(species)
    case 'ceratodon': return chalk.rgb(230, 126, 34)(species)
    case 'dust': return chalk.rgb(231, 76, 60)(species)
    default: return species
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMossGardenJson(result) returns JSON string */
export function formatMossGardenJson(result: MossGardenResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMossGardenTable(result, verbose) returns formatted string */
export function formatMossGardenTable(result: MossGardenResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Moss Garden Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Landscape Overview:'))
  lines.push(`    Overall Serenity:       ${scoreColor(result.landscape.overallSerenity)}`)
  lines.push(`    Avg Vitality:           ${scoreColor(result.landscape.avgVitality)}`)
  lines.push(`    Avg Depth:              ${scoreColor(result.landscape.avgDepth)}`)
  lines.push(`    Avg Serenity:           ${scoreColor(result.landscape.avgSerenity)}`)
  lines.push(`    Is Serene:              ${result.landscape.isSerene ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Colonies:            ${result.stats.totalColonies}`)
  lines.push(`    Avg Growth Vitality:       ${scoreColor(result.stats.avgGrowthVitality)}`)
  lines.push(`    Avg Rhizoid Depth:         ${scoreColor(result.stats.avgRhizoidDepth)}`)
  lines.push(`    Avg Cushion Density:       ${scoreColor(result.stats.avgCushionDensity)}`)
  lines.push(`    Avg Sporophyte Maturity:   ${scoreColor(result.stats.avgSporophyteMaturity)}`)
  lines.push(`    Avg Moisture Retention:    ${scoreColor(result.stats.avgMoistureRetention)}`)
  lines.push(`    Avg Garden Serenity:       ${scoreColor(result.stats.avgGardenSerenity)}`)
  lines.push(`    Gardener Grade:            ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Condition Counts:'))
  lines.push(`    Kyoto Garden:              ${result.stats.kyotoGardenCount}`)
  lines.push(`    Temple Moss:               ${result.stats.templeMossCount}`)
  lines.push(`    Zen Garden:                ${result.stats.zenGardenCount}`)
  lines.push(`    Forest Floor:              ${result.stats.forestFloorCount}`)
  lines.push(`    Crack Moss:                ${result.stats.crackMossCount}`)
  lines.push(`    Dust:                      ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestCushion) {
    lines.push(chalk.rgb(44, 62, 80)('  Highlights:'))
    lines.push(`    Best Cushion:           ${result.stats.bestCushion}`)
    lines.push(`    Most Vital:             ${result.stats.mostVital}`)
    lines.push(`    Deepest Rooted:         ${result.stats.deepestRooted}`)
    lines.push(`    Densest:                ${result.stats.densest}`)
    lines.push(`    Most Mature:            ${result.stats.mostMature}`)
    lines.push(`    Most Serene:            ${result.stats.mostSerene}`)
    lines.push('')
  }

  if (verbose && result.cushions.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-File Details:'))
    for (const cushion of result.cushions) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cushion.file)}`)
      lines.push(`      Score: ${scoreColor(cushion.qualityScore)}  Condition: ${conditionColor(cushion.condition)}`)
      lines.push(`      Vitality: ${speciesColor(cushion.vitality.species)}(${cushion.growthVitality})  Rhizoid: ${cushion.rhizoid.type}(${cushion.rhizoidDepth})  Cushion: ${cushion.cushion.form}(${cushion.cushionDensity})`)
      lines.push(`      Sporophyte: ${cushion.sporophyte.stage}(${cushion.sporophyteMaturity})  Moisture: ${cushion.moisture.state}(${cushion.moistureRetention})  Serenity: ${cushion.serenity.atmosphere}(${cushion.gardenSerenity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(241, 196, 15)('•')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
