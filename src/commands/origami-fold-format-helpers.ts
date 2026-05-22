import chalk from 'chalk'

import type { OrigamiFoldResult } from './origami-fold-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('tanagra-masterpiece') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'tanagra-masterpiece': return chalk.rgb(46, 204, 113).bold(condition)
    case 'yoshizawa-grade': return chalk.rgb(52, 152, 219)(condition)
    case 'exhibition-piece': return chalk.rgb(155, 89, 182)(condition)
    case 'practice-sheet': return chalk.rgb(241, 196, 15)(condition)
    case 'crumpled-ball': return chalk.rgb(230, 126, 34)(condition)
    case 'confetti': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('living-treasure') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'living-treasure': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-artist': return chalk.rgb(52, 152, 219)(grade)
    case 'artist': return chalk.rgb(155, 89, 182)(grade)
    case 'craftsman': return chalk.rgb(241, 196, 15)(grade)
    case 'student': return chalk.rgb(230, 126, 34)(grade)
    case 'paper-cutter': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example galleryTypeColor('museum') returns colored string */
export function galleryTypeColor(galleryType: string): string {
  switch (galleryType) {
    case 'museum': return chalk.rgb(46, 204, 113)(galleryType)
    case 'exhibition': return chalk.rgb(52, 152, 219)(galleryType)
    case 'studio': return chalk.rgb(155, 89, 182)(galleryType)
    case 'classroom': return chalk.rgb(241, 196, 15)(galleryType)
    case 'playground': return chalk.rgb(230, 126, 34)(galleryType)
    case 'recycling-bin': return chalk.rgb(231, 76, 60)(galleryType)
    default: return galleryType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatOrigamiFoldJson(result) returns JSON string */
export function formatOrigamiFoldJson(result: OrigamiFoldResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatOrigamiFoldTable(result, verbose) returns formatted string */
export function formatOrigamiFoldTable(result: OrigamiFoldResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Origami Fold Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Exhibition Overview:'))
  lines.push(`    Overall Elegance:      ${scoreColor(result.exhibition.overallElegance)}`)
  lines.push(`    Avg Precision:         ${scoreColor(result.exhibition.avgPrecision)}`)
  lines.push(`    Avg Structure:         ${scoreColor(result.exhibition.avgStructure)}`)
  lines.push(`    Avg Mastery:           ${scoreColor(result.exhibition.avgMastery)}`)
  lines.push(`    Is Masterwork:         ${result.exhibition.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Galleries:           ${result.stats.totalGalleries}`)
  lines.push(`    Avg Folding Precision:     ${scoreColor(result.stats.avgFoldingPrecision)}`)
  lines.push(`    Avg Paper Quality:         ${scoreColor(result.stats.avgPaperQuality)}`)
  lines.push(`    Avg Crease Accuracy:       ${scoreColor(result.stats.avgCreaseAccuracy)}`)
  lines.push(`    Avg Transformation Beauty: ${scoreColor(result.stats.avgTransformationBeauty)}`)
  lines.push(`    Avg Structural Integrity:  ${scoreColor(result.stats.avgStructuralIntegrity)}`)
  lines.push(`    Avg Artistic Mastery:      ${scoreColor(result.stats.avgArtisticMastery)}`)
  lines.push(`    Masterpieces:              ${result.stats.masterpieceCount}`)
  lines.push(`    Yoshizawa Grade:           ${result.stats.yoshizawaCount}`)
  lines.push(`    Exhibition Piece:          ${result.stats.exhibitionCount}`)
  lines.push(`    Practice Sheet:            ${result.stats.practiceCount}`)
  lines.push(`    Crumpled Ball:             ${result.stats.crumpledCount}`)
  lines.push(`    Confetti:                  ${result.stats.confettiCount}`)
  lines.push(`    Precise Folds:             ${result.stats.hasPreciseFoldsCount}`)
  lines.push(`    High Quality:              ${result.stats.hasHighQualityCount}`)
  lines.push(`    Accurate Creases:          ${result.stats.hasAccurateCreasesCount}`)
  lines.push(`    Beautiful Transform:       ${result.stats.hasBeautifulTransformationCount}`)
  lines.push(`    Strong Structure:          ${result.stats.hasStrongStructureCount}`)
  lines.push(`    Artistic Mastery:          ${result.stats.hasArtisticMasteryCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Artist Grade:              ${gradeColor(result.stats.artistGrade)}`)
  lines.push(`    Best Model:                ${result.stats.bestModel || 'N/A'}`)
  lines.push(`    Most Precise:              ${result.stats.mostPrecise || 'N/A'}`)
  lines.push(`    Best Quality:              ${result.stats.bestQuality || 'N/A'}`)
  lines.push(`    Most Accurate:             ${result.stats.mostAccurate || 'N/A'}`)
  lines.push(`    Most Beautiful:            ${result.stats.mostBeautiful || 'N/A'}`)
  lines.push(`    Strongest:                 ${result.stats.strongest || 'N/A'}`)
  lines.push('')

  if (verbose && result.models.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Model Breakdown:'))
    for (const m of result.models) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(m.file)}`)
      lines.push(`      Condition:              ${conditionColor(m.condition)}`)
      lines.push(`      Quality Score:          ${scoreColor(m.qualityScore)}`)
      lines.push(`      Folding Precision:      ${scoreColor(m.foldingPrecision)} (${m.precision.fold})`)
      lines.push(`      Paper Quality:          ${scoreColor(m.paperQuality)} (${m.paper.material})`)
      lines.push(`      Crease Accuracy:        ${scoreColor(m.creaseAccuracy)} (${m.crease.type})`)
      lines.push(`      Transformation Beauty:  ${scoreColor(m.transformationBeauty)} (${m.transformation.stage})`)
      lines.push(`      Structural Integrity:   ${scoreColor(m.structuralIntegrity)} (${m.structure.form})`)
      lines.push(`      Artistic Mastery:       ${scoreColor(m.artisticMastery)} (${m.mastery.level})`)
    }
    lines.push('')
  }

  if (result.galleries.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Galleries:'))
    for (const g of result.galleries) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(g.directory)} — ${galleryTypeColor(g.galleryType)} (${g.condition})`)
      lines.push(`      Models: ${g.models.length}, Masterpieces: ${g.masterpieceCount}, Confetti: ${g.confettiCount}, Precise: ${g.preciseCount}`)
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
