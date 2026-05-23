import chalk from 'chalk'

import type { InkstoneGrindResult } from './inkstone-grind-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('masterpiece-scroll') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'masterpiece-scroll': return chalk.rgb(255, 215, 0).bold(condition)
    case 'gallery-piece': return chalk.rgb(46, 204, 113)(condition)
    case 'practice-sheet': return chalk.rgb(52, 152, 219)(condition)
    case 'rough-draft': return chalk.rgb(241, 196, 15)(condition)
    case 'scratch-paper': return chalk.rgb(230, 126, 34)(condition)
    case 'waste': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example inkQualityColor('imperial-ink') returns colored string */
export function inkQualityColor(quality: string): string {
  switch (quality) {
    case 'imperial-ink': return chalk.rgb(255, 215, 0).bold(quality)
    case 'premium-sumi': return chalk.rgb(46, 204, 113)(quality)
    case 'good-ink': return chalk.rgb(155, 89, 182)(quality)
    case 'dilute-ink': return chalk.rgb(52, 152, 219)(quality)
    case 'watery': return chalk.rgb(241, 196, 15)(quality)
    case 'dust': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example techniqueColor('master-grinding') returns colored string */
export function techniqueColor(technique: string): string {
  switch (technique) {
    case 'master-grinding': return chalk.rgb(255, 215, 0).bold(technique)
    case 'proper-circular': return chalk.rgb(46, 204, 113)(technique)
    case 'steady-pressure': return chalk.rgb(155, 89, 182)(technique)
    case 'uneven': return chalk.rgb(52, 152, 219)(technique)
    case 'rushed': return chalk.rgb(241, 196, 15)(technique)
    case 'haphazard': return chalk.rgb(231, 76, 60)(technique)
    default: return technique
  }
}

/** @example calligraphyColor('masterwork') returns colored string */
export function calligraphyColor(calligraphy: string): string {
  switch (calligraphy) {
    case 'masterwork': return chalk.rgb(255, 215, 0).bold(calligraphy)
    case 'elegant-stroke': return chalk.rgb(46, 204, 113)(calligraphy)
    case 'skilled-hand': return chalk.rgb(155, 89, 182)(calligraphy)
    case 'amateur': return chalk.rgb(52, 152, 219)(calligraphy)
    case 'clumsy': return chalk.rgb(241, 196, 15)(calligraphy)
    case 'scribble': return chalk.rgb(231, 76, 60)(calligraphy)
    default: return calligraphy
  }
}

/** @example brushConditionColor('master-brush') returns colored string */
export function brushConditionColor(condition: string): string {
  switch (condition) {
    case 'master-brush': return chalk.rgb(255, 215, 0).bold(condition)
    case 'well-prepared': return chalk.rgb(46, 204, 113)(condition)
    case 'properly-loaded': return chalk.rgb(155, 89, 182)(condition)
    case 'underprepared': return chalk.rgb(52, 152, 219)(condition)
    case 'worn': return chalk.rgb(241, 196, 15)(condition)
    case 'damaged': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example paperQualityColor('xuan-paper') returns colored string */
export function paperQualityColor(quality: string): string {
  switch (quality) {
    case 'xuan-paper': return chalk.rgb(255, 215, 0).bold(quality)
    case 'quality-washi': return chalk.rgb(46, 204, 113)(quality)
    case 'good-paper': return chalk.rgb(155, 89, 182)(quality)
    case 'standard-paper': return chalk.rgb(52, 152, 219)(quality)
    case 'rough-paper': return chalk.rgb(241, 196, 15)(quality)
    case 'newsprint': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example masteryRankColor('calligraphy-master') returns colored string */
export function masteryRankColor(rank: string): string {
  switch (rank) {
    case 'calligraphy-master': return chalk.rgb(255, 215, 0).bold(rank)
    case 'skilled-artist': return chalk.rgb(46, 204, 113)(rank)
    case 'practitioner': return chalk.rgb(155, 89, 182)(rank)
    case 'student': return chalk.rgb(52, 152, 219)(rank)
    case 'beginner': return chalk.rgb(241, 196, 15)(rank)
    case 'untrained': return chalk.rgb(231, 76, 60)(rank)
    default: return rank
  }
}

/** @example artistGradeColor('calligraphy-sage') returns colored string */
export function artistGradeColor(grade: string): string {
  switch (grade) {
    case 'calligraphy-sage': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-calligrapher': return chalk.rgb(46, 204, 113)(grade)
    case 'skilled-artist': return chalk.rgb(155, 89, 182)(grade)
    case 'student': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'child': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example shelfTypeColor('master-studio') returns colored string */
export function shelfTypeColor(type: string): string {
  switch (type) {
    case 'master-studio': return chalk.rgb(255, 215, 0).bold(type)
    case 'artist-desk': return chalk.rgb(46, 204, 113)(type)
    case 'student-bench': return chalk.rgb(155, 89, 182)(type)
    case 'practice-room': return chalk.rgb(52, 152, 219)(type)
    case 'storage': return chalk.rgb(241, 196, 15)(type)
    case 'empty': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example shelfConditionColor('calligraphy-hall') returns colored string */
export function shelfConditionColor(condition: string): string {
  switch (condition) {
    case 'calligraphy-hall': return chalk.rgb(255, 215, 0).bold(condition)
    case 'artist-studio': return chalk.rgb(46, 204, 113)(condition)
    case 'practice-room': return chalk.rgb(155, 89, 182)(condition)
    case 'drafting-table': return chalk.rgb(52, 152, 219)(condition)
    case 'supply-closet': return chalk.rgb(241, 196, 15)(condition)
    case 'empty': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatInkstoneGrindJson(result) returns JSON string */
export function formatInkstoneGrindJson(result: InkstoneGrindResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatInkstoneGrindTable(result, verbose) returns formatted string */
export function formatInkstoneGrindTable(result: InkstoneGrindResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(139, 90, 43).bold('  Inkstone Grind Analysis'))
  lines.push('')

  lines.push(chalk.rgb(139, 90, 43)('  Studio Overview:'))
  lines.push(`    Overall Refinement:      ${scoreColor(result.studio.overallRefinement)}`)
  lines.push(`    Avg Ink Density:         ${scoreColor(result.studio.avgInk)}`)
  lines.push(`    Avg Grinding Discipline: ${scoreColor(result.studio.avgDiscipline)}`)
  lines.push(`    Avg Mastery Level:       ${scoreColor(result.studio.avgMastery)}`)
  lines.push(`    Is Refined:              ${result.studio.isRefined ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(139, 90, 43)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Shelves:          ${result.stats.totalShelves}`)
  lines.push(`    Avg Ink Density:        ${scoreColor(result.stats.avgInkDensity)}`)
  lines.push(`    Avg Grinding Discipline:${scoreColor(result.stats.avgGrindingDiscipline)}`)
  lines.push(`    Avg Stroke Quality:     ${scoreColor(result.stats.avgStrokeQuality)}`)
  lines.push(`    Avg Brush Preparation:  ${scoreColor(result.stats.avgBrushPreparation)}`)
  lines.push(`    Avg Paper Compatibility:${scoreColor(result.stats.avgPaperCompatibility)}`)
  lines.push(`    Avg Mastery Level:      ${scoreColor(result.stats.avgMasteryLevel)}`)
  lines.push(`    Artist Grade:           ${artistGradeColor(result.stats.artistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(139, 90, 43)('  Condition Counts:'))
  lines.push(`    Masterpiece Scroll: ${result.stats.masterpieceScrollCount}`)
  lines.push(`    Gallery Piece:      ${result.stats.galleryPieceCount}`)
  lines.push(`    Practice Sheet:     ${result.stats.practiceSheetCount}`)
  lines.push(`    Rough Draft:        ${result.stats.roughDraftCount}`)
  lines.push(`    Scratch Paper:      ${result.stats.scratchPaperCount}`)
  lines.push(`    Waste:              ${result.stats.wasteCount}`)
  lines.push('')

  if (result.stats.bestGrinding) {
    lines.push(chalk.rgb(139, 90, 43)('  Highlights:'))
    lines.push(`    Best Grinding:      ${result.stats.bestGrinding}`)
    lines.push(`    Densest:            ${result.stats.densest}`)
    lines.push(`    Most Disciplined:   ${result.stats.mostDisciplined}`)
    lines.push(`    Best Strokes:       ${result.stats.bestStrokes}`)
    lines.push(`    Best Prepared:      ${result.stats.bestPrepared}`)
    lines.push(`    Best Integrated:    ${result.stats.bestIntegrated}`)
    lines.push('')
  }

  if (verbose && result.grindings.length > 0) {
    lines.push(chalk.rgb(139, 90, 43)('  Per-File Details:'))
    for (const g of result.grindings) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(g.file)}`)
      lines.push(`      Score: ${scoreColor(g.qualityScore)}  Condition: ${conditionColor(g.condition)}`)
      lines.push(`      Ink: ${inkQualityColor(g.ink.quality)}(${g.inkDensity})  Grind: ${techniqueColor(g.grinding.technique)}(${g.grindingDiscipline})  Stroke: ${calligraphyColor(g.stroke.calligraphy)}(${g.strokeQuality})`)
      lines.push(`      Brush: ${brushConditionColor(g.brush.condition)}(${g.brushPreparation})  Paper: ${paperQualityColor(g.paper.quality)}(${g.paperCompatibility})  Mastery: ${masteryRankColor(g.mastery.rank)}(${g.masteryLevel})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(139, 90, 43)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(139, 90, 43)('\u{25C6}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
