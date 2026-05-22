import chalk from 'chalk'

import type { QuartzCrystalResult } from './quartz-crystal-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('herkimer-diamond') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'herkimer-diamond': return chalk.rgb(46, 204, 113).bold(condition)
    case 'clear-quartz': return chalk.rgb(52, 152, 219)(condition)
    case 'rutilated': return chalk.rgb(155, 89, 182)(condition)
    case 'smoky-quartz': return chalk.rgb(241, 196, 15)(condition)
    case 'milky-quartz': return chalk.rgb(230, 126, 34)(condition)
    case 'sand': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-gemologist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-gemologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'gemologist': return chalk.rgb(52, 152, 219)(grade)
    case 'lapidary': return chalk.rgb(155, 89, 182)(grade)
    case 'collector': return chalk.rgb(241, 196, 15)(grade)
    case 'rockhound': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example caveTypeColor('geode') returns colored string */
export function caveTypeColor(caveType: string): string {
  switch (caveType) {
    case 'geode': return chalk.rgb(46, 204, 113)(caveType)
    case 'vein': return chalk.rgb(52, 152, 219)(caveType)
    case 'pegmatite': return chalk.rgb(155, 89, 182)(caveType)
    case 'alluvial': return chalk.rgb(241, 196, 15)(caveType)
    case 'mine-tailings': return chalk.rgb(230, 126, 34)(caveType)
    case 'sandbox': return chalk.rgb(231, 76, 60)(caveType)
    default: return caveType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatQuartzCrystalJson(result) returns JSON string */
export function formatQuartzCrystalJson(result: QuartzCrystalResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatQuartzCrystalTable(result, verbose) returns formatted string */
export function formatQuartzCrystalTable(result: QuartzCrystalResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Quartz Crystal Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Collection Overview:'))
  lines.push(`    Overall Clarity:  ${scoreColor(result.collection.overallClarity)}`)
  lines.push(`    Avg Clarity:      ${scoreColor(result.collection.avgClarity)}`)
  lines.push(`    Avg Structure:    ${scoreColor(result.collection.avgStructure)}`)
  lines.push(`    Avg Perfection:   ${scoreColor(result.collection.avgPerfection)}`)
  lines.push(`    Gem Quality:      ${result.collection.isGemQuality ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:      ${result.stats.totalFiles}`)
  lines.push(`    Total Caves:      ${result.stats.totalCaves}`)
  lines.push(`    Herkimer Diamond: ${result.stats.herkimerDiamondCount}`)
  lines.push(`    Clear Quartz:     ${result.stats.clearQuartzCount}`)
  lines.push(`    Rutilated:        ${result.stats.rutilatedCount}`)
  lines.push(`    Smoky Quartz:     ${result.stats.smokyQuartzCount}`)
  lines.push(`    Milky Quartz:     ${result.stats.milkyQuartzCount}`)
  lines.push(`    Sand:             ${result.stats.sandCount}`)
  lines.push(`    Transparent:      ${result.stats.isTransparentCount}`)
  lines.push(`    Well Cut:         ${result.stats.isWellCutCount}`)
  lines.push(`    Consistent:       ${result.stats.isConsistentCount}`)
  lines.push(`    Gem Quality:      ${result.stats.hasGemQualityCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Gemologist:       ${gradeColor(result.stats.gemologistGrade)}`)
  lines.push(`    Best Specimen:    ${result.stats.bestSpecimen || 'N/A'}`)
  lines.push(`    Clearest:         ${result.stats.clearestCrystal || 'N/A'}`)
  lines.push(`    Best Structure:   ${result.stats.bestStructure || 'N/A'}`)
  lines.push(`    Most Consistent:  ${result.stats.mostConsistent || 'N/A'}`)
  lines.push(`    Best Facets:      ${result.stats.bestFacets || 'N/A'}`)
  lines.push('')

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Specimen Breakdown:'))
    for (const sp of result.specimens) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(sp.file)}`)
      lines.push(`      Condition:     ${conditionColor(sp.condition)}`)
      lines.push(`      Quality Score: ${scoreColor(sp.qualityScore)}`)
      lines.push(`      Clarity:       ${scoreColor(sp.crystalClarity)} (${sp.clarity.grade})`)
      lines.push(`      Lattice:       ${scoreColor(sp.latticeStructure)} (${sp.lattice.system})`)
      lines.push(`      Resonance:     ${scoreColor(sp.resonantFrequency)} (${sp.resonance.stability})`)
      lines.push(`      Facet:         ${scoreColor(sp.facetQuality)} (${sp.facet.cut})`)
      lines.push(`      Transmission:  ${scoreColor(sp.lightTransmission)} (${sp.transmission.spectrum})`)
      lines.push(`      Perfection:    ${scoreColor(sp.crystalPerfection)}`)
    }
    lines.push('')
  }

  if (result.caves.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Caves:'))
    for (const cave of result.caves) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cave.directory)} — ${caveTypeColor(cave.caveType)} (${cave.condition})`)
      lines.push(`      Specimens: ${cave.specimens.length}, Herkimer: ${cave.herkimerCount}, Transparent: ${cave.transparentCount}`)
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
