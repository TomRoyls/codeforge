import chalk from 'chalk'

import type { AmberFossilResult } from './amber-fossil-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('baltic-gold') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'baltic-gold': return chalk.rgb(46, 204, 113).bold(condition)
    case 'dominican-blue': return chalk.rgb(52, 152, 219)(condition)
    case 'burmite-royal': return chalk.rgb(155, 89, 182)(condition)
    case 'copal-raw': return chalk.rgb(241, 196, 15)(condition)
    case 'jet-black': return chalk.rgb(230, 126, 34)(condition)
    case 'sandstone': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('curator') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'curator': return chalk.rgb(46, 204, 113).bold(grade)
    case 'paleontologist': return chalk.rgb(52, 152, 219)(grade)
    case 'collector': return chalk.rgb(155, 89, 182)(grade)
    case 'enthusiast': return chalk.rgb(241, 196, 15)(grade)
    case 'tourist': return chalk.rgb(230, 126, 34)(grade)
    case 'beachcomber': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example collectionTypeColor('museum') returns colored string */
export function collectionTypeColor(collectionType: string): string {
  switch (collectionType) {
    case 'museum': return chalk.rgb(46, 204, 113)(collectionType)
    case 'private-collection': return chalk.rgb(52, 152, 219)(collectionType)
    case 'exhibition': return chalk.rgb(155, 89, 182)(collectionType)
    case 'workshop': return chalk.rgb(241, 196, 15)(collectionType)
    case 'quarry': return chalk.rgb(230, 126, 34)(collectionType)
    case 'beach': return chalk.rgb(231, 76, 60)(collectionType)
    default: return collectionType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAmberFossilJson(result) returns JSON string */
export function formatAmberFossilJson(result: AmberFossilResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAmberFossilTable(result, verbose) returns formatted string */
export function formatAmberFossilTable(result: AmberFossilResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Amber Fossil Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Museum Overview:'))
  lines.push(`    Overall Value:        ${scoreColor(result.museum.overallValue)}`)
  lines.push(`    Avg Clarity:          ${scoreColor(result.museum.avgClarity)}`)
  lines.push(`    Avg Hardness:         ${scoreColor(result.museum.avgHardness)}`)
  lines.push(`    Avg Value:            ${scoreColor(result.museum.avgValue)}`)
  lines.push(`    Priceless:            ${result.museum.isPriceless ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:      ${result.stats.totalCollections}`)
  lines.push(`    Baltic Gold:            ${result.stats.balticGoldCount}`)
  lines.push(`    Dominican Blue:         ${result.stats.dominicanBlueCount}`)
  lines.push(`    Burmite Royal:          ${result.stats.burmiteRoyalCount}`)
  lines.push(`    Copal Raw:              ${result.stats.copalRawCount}`)
  lines.push(`    Jet Black:              ${result.stats.jetBlackCount}`)
  lines.push(`    Sandstone:              ${result.stats.sandstoneCount}`)
  lines.push(`    Clear:                  ${result.stats.isClearCount}`)
  lines.push(`    Fully Documented:       ${result.stats.hasCompleteDocumentationCount}`)
  lines.push(`    Hard:                   ${result.stats.isHardCount}`)
  lines.push(`    Mature:                 ${result.stats.isMatureCount}`)
  lines.push(`    Well Preserved:         ${result.stats.isWellPreservedCount}`)
  lines.push(`    Valuable:               ${result.stats.isValuableCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Paleontologist:         ${gradeColor(result.stats.paleontologistGrade)}`)
  lines.push(`    Best Specimen:          ${result.stats.bestSpecimen || 'N/A'}`)
  lines.push(`    Clearest:               ${result.stats.clearest || 'N/A'}`)
  lines.push(`    Best Documented:        ${result.stats.bestDocumented || 'N/A'}`)
  lines.push(`    Hardest:                ${result.stats.hardest || 'N/A'}`)
  lines.push(`    Oldest:                 ${result.stats.oldest || 'N/A'}`)
  lines.push(`    Most Valuable:          ${result.stats.mostValuable || 'N/A'}`)
  lines.push('')

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Specimen Breakdown:'))
    for (const sp of result.specimens) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(sp.file)}`)
      lines.push(`      Condition:          ${conditionColor(sp.condition)}`)
      lines.push(`      Quality Score:      ${scoreColor(sp.qualityScore)}`)
      lines.push(`      Clarity:            ${scoreColor(sp.amberClarity)} (${sp.clarity.grade})`)
      lines.push(`      Inclusion:          ${scoreColor(sp.inclusionQuality)} (${sp.inclusion.type})`)
      lines.push(`      Hardness:           ${scoreColor(sp.resinHardness)} (${sp.hardness.scale})`)
      lines.push(`      Age:                ${scoreColor(sp.fossilAge)} (${sp.age.era})`)
      lines.push(`      Preservation:       ${scoreColor(sp.preservationState)} (${sp.preservation.quality})`)
      lines.push(`      Value:              ${scoreColor(sp.specimenValue)} (${sp.value.appraisal})`)
    }
    lines.push('')
  }

  if (result.collections.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Collections:'))
    for (const col of result.collections) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(col.directory)} — ${collectionTypeColor(col.collectionType)} (${col.condition})`)
      lines.push(`      Specimens: ${col.specimens.length}, Baltic Gold: ${col.balticGoldCount}, Clear: ${col.clearCount}, Hard: ${col.hardCount}`)
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
