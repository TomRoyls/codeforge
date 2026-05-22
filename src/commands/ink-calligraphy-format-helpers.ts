import chalk from 'chalk'

import type { InkCalligraphyResult } from './ink-calligraphy-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('national-treasure') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'national-treasure': return chalk.rgb(46, 204, 113).bold(condition)
    case 'masterwork': return chalk.rgb(52, 152, 219)(condition)
    case 'gallery-piece': return chalk.rgb(155, 89, 182)(condition)
    case 'practice-sheet': return chalk.rgb(241, 196, 15)(condition)
    case 'ink-blot': return chalk.rgb(230, 126, 34)(condition)
    case 'scribble': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('national-living-treasure') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'national-living-treasure': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-calligrapher': return chalk.rgb(52, 152, 219)(grade)
    case 'calligrapher': return chalk.rgb(155, 89, 182)(grade)
    case 'artist': return chalk.rgb(241, 196, 15)(grade)
    case 'student': return chalk.rgb(230, 126, 34)(grade)
    case 'finger-painter': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example strokeTypeColor('kaisho') returns colored string */
export function strokeTypeColor(strokeType: string): string {
  switch (strokeType) {
    case 'kaisho': return chalk.rgb(46, 204, 113)(strokeType)
    case 'gyosho': return chalk.rgb(52, 152, 219)(strokeType)
    case 'sosho': return chalk.rgb(155, 89, 182)(strokeType)
    case 'reisho': return chalk.rgb(241, 196, 15)(strokeType)
    case 'tensho': return chalk.rgb(230, 126, 34)(strokeType)
    case 'scribble': return chalk.rgb(231, 76, 60)(strokeType)
    default: return strokeType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatInkCalligraphyJson(result) returns JSON string */
export function formatInkCalligraphyJson(result: InkCalligraphyResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatInkCalligraphyTable(result, verbose) returns formatted string */
export function formatInkCalligraphyTable(result: InkCalligraphyResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Ink Calligraphy Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Exhibition Overview:'))
  lines.push(`    Overall Mastery:         ${scoreColor(result.exhibition.overallMastery)}`)
  lines.push(`    Avg Quality:             ${scoreColor(result.exhibition.avgQuality)}`)
  lines.push(`    Avg Control:             ${scoreColor(result.exhibition.avgControl)}`)
  lines.push(`    Avg Expression:          ${scoreColor(result.exhibition.avgExpression)}`)
  lines.push(`    Is Masterwork:           ${result.exhibition.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Galleries:           ${result.stats.totalGalleries}`)
  lines.push(`    Avg Stroke Quality:        ${scoreColor(result.stats.avgStrokeQuality)}`)
  lines.push(`    Avg Ink Density:           ${scoreColor(result.stats.avgInkDensity)}`)
  lines.push(`    Avg Brush Control:         ${scoreColor(result.stats.avgBrushControl)}`)
  lines.push(`    Avg Composition Balance:   ${scoreColor(result.stats.avgCompositionBalance)}`)
  lines.push(`    Avg Ink Flow:              ${scoreColor(result.stats.avgInkFlow)}`)
  lines.push(`    Avg Artistic Expression:   ${scoreColor(result.stats.avgArtisticExpression)}`)
  lines.push(`    Calligrapher Grade:        ${gradeColor(result.stats.calligrapherGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Condition Counts:'))
  lines.push(`    National Treasure:         ${result.stats.nationalTreasureCount}`)
  lines.push(`    Masterwork:                ${result.stats.masterworkCount}`)
  lines.push(`    Gallery Piece:             ${result.stats.galleryPieceCount}`)
  lines.push(`    Practice Sheet:            ${result.stats.practiceSheetCount}`)
  lines.push(`    Ink Blot:                  ${result.stats.inkBlotCount}`)
  lines.push(`    Scribble:                  ${result.stats.scribbleCount}`)
  lines.push('')

  if (result.stats.bestStroke) {
    lines.push(chalk.rgb(44, 62, 80)('  Highlights:'))
    lines.push(`    Best Stroke:             ${result.stats.bestStroke}`)
    lines.push(`    Highest Quality:         ${result.stats.highestQuality}`)
    lines.push(`    Richest Ink:             ${result.stats.richestInk}`)
    lines.push(`    Most Precise:            ${result.stats.mostPrecise}`)
    lines.push(`    Best Balanced:           ${result.stats.bestBalanced}`)
    lines.push(`    Most Flowing:            ${result.stats.mostFlowing}`)
    lines.push('')
  }

  if (verbose && result.strokes.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-File Details:'))
    for (const stroke of result.strokes) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(stroke.file)}`)
      lines.push(`      Quality: ${scoreColor(stroke.qualityScore)}  Condition: ${conditionColor(stroke.condition)}`)
      lines.push(`      Stroke: ${strokeTypeColor(stroke.stroke.type)}(${stroke.strokeQuality})  Ink: ${stroke.ink.quality}(${stroke.inkDensity})  Brush: ${stroke.brush.grip}(${stroke.brushControl})`)
      lines.push(`      Composition: ${stroke.composition.layout}(${stroke.compositionBalance})  Flow: ${stroke.flow.style}(${stroke.inkFlow})  Expression: ${stroke.expression.style}(${stroke.artisticExpression})`)
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
