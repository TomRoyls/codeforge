import chalk from 'chalk'

import type { PetrifiedForestResult } from './petrified-forest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('national-monument') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'national-monument': return chalk.rgb(46, 204, 113).bold(condition)
    case 'museum-piece': return chalk.rgb(52, 152, 219)(condition)
    case 'specimen': return chalk.rgb(155, 89, 182)(condition)
    case 'fragment': return chalk.rgb(241, 196, 15)(condition)
    case 'shard': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('curator') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'curator': return chalk.rgb(46, 204, 113).bold(grade)
    case 'paleontologist': return chalk.rgb(52, 152, 219)(grade)
    case 'geologist': return chalk.rgb(155, 89, 182)(grade)
    case 'collector': return chalk.rgb(241, 196, 15)(grade)
    case 'rockhound': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example bedTypeColor('national-park') returns colored string */
export function bedTypeColor(bedType: string): string {
  switch (bedType) {
    case 'national-park': return chalk.rgb(46, 204, 113)(bedType)
    case 'geological-reserve': return chalk.rgb(52, 152, 219)(bedType)
    case 'quarry': return chalk.rgb(155, 89, 182)(bedType)
    case 'roadside': return chalk.rgb(241, 196, 15)(bedType)
    case 'wasteland': return chalk.rgb(230, 126, 34)(bedType)
    case 'beach': return chalk.rgb(231, 76, 60)(bedType)
    default: return bedType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatPetrifiedForestJson(result) returns JSON string */
export function formatPetrifiedForestJson(result: PetrifiedForestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatPetrifiedForestTable(result, verbose) returns formatted string */
export function formatPetrifiedForestTable(result: PetrifiedForestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Petrified Forest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Formation Overview:'))
  lines.push(`    Overall Preservation:  ${scoreColor(result.formation.overallPreservation)}`)
  lines.push(`    Avg Preservation:      ${scoreColor(result.formation.avgPreservation)}`)
  lines.push(`    Avg Mineral:           ${scoreColor(result.formation.avgMineral)}`)
  lines.push(`    Avg Age:               ${scoreColor(result.formation.avgAge)}`)
  lines.push(`    Preserved:             ${result.formation.isPreserved ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Beds:                   ${result.stats.totalBeds}`)
  lines.push(`    Avg Wood Preservation:        ${scoreColor(result.stats.avgWoodPreservation)}`)
  lines.push(`    Avg Mineral Replacement:      ${scoreColor(result.stats.avgMineralReplacement)}`)
  lines.push(`    Avg Ring Structure:           ${scoreColor(result.stats.avgRingStructure)}`)
  lines.push(`    Avg Coloration Quality:       ${scoreColor(result.stats.avgColorationQuality)}`)
  lines.push(`    Avg Fossil Record:            ${scoreColor(result.stats.avgFossilRecord)}`)
  lines.push(`    Avg Geological Age:           ${scoreColor(result.stats.avgGeologicalAge)}`)
  lines.push(`    National Monuments:           ${result.stats.nationalMonumentCount}`)
  lines.push(`    Museum Pieces:                ${result.stats.museumPieceCount}`)
  lines.push(`    Specimens:                    ${result.stats.specimenCount}`)
  lines.push(`    Fragments:                    ${result.stats.fragmentCount}`)
  lines.push(`    Shards:                       ${result.stats.shardCount}`)
  lines.push(`    Dust:                         ${result.stats.dustCount}`)
  lines.push(`    Well Preserved:               ${result.stats.isWellPreservedCount}`)
  lines.push(`    Proper Mineralization:        ${result.stats.hasProperMineralizationCount}`)
  lines.push(`    Clear History:                ${result.stats.hasClearHistoryCount}`)
  lines.push(`    Colorful:                     ${result.stats.isColorfulCount}`)
  lines.push(`    Complete Documentation:       ${result.stats.hasCompleteDocumentationCount}`)
  lines.push(`    Mature:                       ${result.stats.isMatureCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Paleontologist Grade:         ${gradeColor(result.stats.paleontologistGrade)}`)
  lines.push(`    Best Log:                     ${result.stats.bestLog || 'N/A'}`)
  lines.push(`    Best Preserved:               ${result.stats.bestPreserved || 'N/A'}`)
  lines.push(`    Best Mineralized:             ${result.stats.bestMineralized || 'N/A'}`)
  lines.push(`    Oldest History:               ${result.stats.oldestHistory || 'N/A'}`)
  lines.push(`    Most Colorful:                ${result.stats.mostColorful || 'N/A'}`)
  lines.push(`    Best Documented:              ${result.stats.bestDocumented || 'N/A'}`)
  lines.push('')

  if (verbose && result.logs.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Log Breakdown:'))
    for (const l of result.logs) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(l.file)}`)
      lines.push(`      Condition:             ${conditionColor(l.condition)}`)
      lines.push(`      Quality Score:         ${scoreColor(l.qualityScore)}`)
      lines.push(`      Preservation:          ${scoreColor(l.woodPreservation)} (${l.preservation.state})`)
      lines.push(`      Mineral:               ${scoreColor(l.mineralReplacement)} (${l.mineral.type})`)
      lines.push(`      Rings:                 ${scoreColor(l.ringStructure)} (${l.rings.pattern})`)
      lines.push(`      Coloration:            ${scoreColor(l.colorationQuality)} (${l.coloration.palette})`)
      lines.push(`      Fossil:                ${scoreColor(l.fossilRecord)} (${l.fossil.completeness})`)
      lines.push(`      Age:                   ${scoreColor(l.geologicalAge)} (${l.age.era})`)
    }
    lines.push('')
  }

  if (result.beds.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Fossil Beds:'))
    for (const b of result.beds) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(b.directory)} — ${bedTypeColor(b.bedType)} (${b.condition})`)
      lines.push(`      Logs: ${b.logs.length}, Monuments: ${b.monumentCount}, Dust: ${b.dustCount}, Preserved: ${b.preservedCount}`)
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
