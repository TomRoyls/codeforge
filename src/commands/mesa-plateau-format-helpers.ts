import chalk from 'chalk'

import type { MesaPlateauResult } from './mesa-plateau-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('monument-valley') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'monument-valley': return chalk.rgb(46, 204, 113).bold(condition)
    case 'table-mountain': return chalk.rgb(52, 152, 219)(condition)
    case 'mesa-verde': return chalk.rgb(155, 89, 182)(condition)
    case 'butte': return chalk.rgb(241, 196, 15)(condition)
    case 'hoodoo': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('field-geologist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'field-geologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'stratigrapher': return chalk.rgb(52, 152, 219)(grade)
    case 'geomorphologist': return chalk.rgb(155, 89, 182)(grade)
    case 'geologist': return chalk.rgb(241, 196, 15)(grade)
    case 'rockhound': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example regionTypeColor('national-park') returns colored string */
export function regionTypeColor(regionType: string): string {
  switch (regionType) {
    case 'national-park': return chalk.rgb(46, 204, 113)(regionType)
    case 'wilderness': return chalk.rgb(52, 152, 219)(regionType)
    case 'badlands': return chalk.rgb(155, 89, 182)(regionType)
    case 'canyon': return chalk.rgb(241, 196, 15)(regionType)
    case 'plains': return chalk.rgb(230, 126, 34)(regionType)
    case 'wasteland': return chalk.rgb(231, 76, 60)(regionType)
    default: return regionType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMesaPlateauJson(result) returns JSON string */
export function formatMesaPlateauJson(result: MesaPlateauResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMesaPlateauTable(result, verbose) returns formatted string */
export function formatMesaPlateauTable(result: MesaPlateauResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Mesa Plateau Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Range Overview:'))
  lines.push(`    Overall Stability:    ${scoreColor(result.range.overallStability)}`)
  lines.push(`    Avg Elevation:        ${scoreColor(result.range.avgElevation)}`)
  lines.push(`    Avg Layering:         ${scoreColor(result.range.avgLayering)}`)
  lines.push(`    Avg Health:           ${scoreColor(result.range.avgHealth)}`)
  lines.push(`    Majestic:             ${result.range.isMajestic ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Regions:          ${result.stats.totalRegions}`)
  lines.push(`    Monument Valley:        ${result.stats.monumentValleyCount}`)
  lines.push(`    Table Mountain:         ${result.stats.tableMountainCount}`)
  lines.push(`    Mesa Verde:             ${result.stats.mesaVerdeCount}`)
  lines.push(`    Butte:                  ${result.stats.butteCount}`)
  lines.push(`    Hoodoo:                 ${result.stats.hoodooCount}`)
  lines.push(`    Dust:                   ${result.stats.dustCount}`)
  lines.push(`    High Elevation:         ${result.stats.isHighCount}`)
  lines.push(`    Well Layered:           ${result.stats.isWellLayeredCount}`)
  lines.push(`    Erosion Resistant:      ${result.stats.isErosionResistantCount}`)
  lines.push(`    Clean Interface:        ${result.stats.hasCleanInterfaceCount}`)
  lines.push(`    Strong Caprock:         ${result.stats.isStrongCount}`)
  lines.push(`    Stable:                 ${result.stats.isStableCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Geologist:              ${gradeColor(result.stats.geologistGrade)}`)
  lines.push(`    Best Layer:             ${result.stats.bestLayer || 'N/A'}`)
  lines.push(`    Highest:                ${result.stats.highest || 'N/A'}`)
  lines.push(`    Best Layered:           ${result.stats.bestLayered || 'N/A'}`)
  lines.push(`    Most Resistant:         ${result.stats.mostResistant || 'N/A'}`)
  lines.push(`    Best Cliff:             ${result.stats.bestCliff || 'N/A'}`)
  lines.push(`    Strongest Caprock:      ${result.stats.strongestCaprock || 'N/A'}`)
  lines.push('')

  if (verbose && result.layers.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Layer Breakdown:'))
    for (const layer of result.layers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(layer.file)}`)
      lines.push(`      Condition:          ${conditionColor(layer.condition)}`)
      lines.push(`      Quality Score:      ${scoreColor(layer.qualityScore)}`)
      lines.push(`      Elevation:          ${scoreColor(layer.elevation)} (${layer.elev.grade})`)
      lines.push(`      Layering:           ${scoreColor(layer.layering)} (${layer.layer.type})`)
      lines.push(`      Erosion:            ${scoreColor(layer.erosionResistance)} (${layer.erosion.rate})`)
      lines.push(`      Cliff:              ${scoreColor(layer.cliffFace)} (${layer.cliff.face})`)
      lines.push(`      Caprock:            ${scoreColor(layer.caprockStrength)} (${layer.caprock.material})`)
      lines.push(`      Health:             ${scoreColor(layer.plateauHealth)} (${layer.health.status})`)
    }
    lines.push('')
  }

  if (result.regions.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Regions:'))
    for (const region of result.regions) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(region.directory)} — ${regionTypeColor(region.regionType)} (${region.condition})`)
      lines.push(`      Layers: ${region.layers.length}, Monument: ${region.monumentCount}, High: ${region.highCount}, Stable: ${region.stableCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
