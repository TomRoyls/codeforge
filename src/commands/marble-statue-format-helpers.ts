import chalk from 'chalk'

import type { MarbleStatueResult } from './marble-statue-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('david') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'david': return chalk.rgb(46, 204, 113).bold(condition)
    case 'pieta': return chalk.rgb(52, 152, 219)(condition)
    case 'venus': return chalk.rgb(155, 89, 182)(condition)
    case 'kouros': return chalk.rgb(241, 196, 15)(condition)
    case 'bust': return chalk.rgb(230, 126, 34)(condition)
    case 'rubble': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('divine-sculptor') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'divine-sculptor': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-sculptor': return chalk.rgb(52, 152, 219)(grade)
    case 'sculptor': return chalk.rgb(155, 89, 182)(grade)
    case 'artisan': return chalk.rgb(241, 196, 15)(grade)
    case 'apprentice': return chalk.rgb(230, 126, 34)(grade)
    case 'vandal': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example styleColor('contrapposto') returns colored string */
export function styleColor(style: string): string {
  switch (style) {
    case 'contrapposto': return chalk.rgb(46, 204, 113)(style)
    case 'classical': return chalk.rgb(52, 152, 219)(style)
    case 'renaissance': return chalk.rgb(155, 89, 182)(style)
    case 'baroque': return chalk.rgb(241, 196, 15)(style)
    case 'modern': return chalk.rgb(230, 126, 34)(style)
    case 'formless': return chalk.rgb(231, 76, 60)(style)
    default: return style
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMarbleStatueJson(result) returns JSON string */
export function formatMarbleStatueJson(result: MarbleStatueResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMarbleStatueTable(result, verbose) returns formatted string */
export function formatMarbleStatueTable(result: MarbleStatueResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Marble Statue Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Studio Overview:'))
  lines.push(`    Overall Mastery:       ${scoreColor(result.studio.overallMastery)}`)
  lines.push(`    Avg Form:              ${scoreColor(result.studio.avgForm)}`)
  lines.push(`    Avg Finish:            ${scoreColor(result.studio.avgFinish)}`)
  lines.push(`    Avg Mastery:           ${scoreColor(result.studio.avgMastery)}`)
  lines.push(`    Is Masterwork:         ${result.studio.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Galleries:           ${result.stats.totalGalleries}`)
  lines.push(`    Avg Sculptural Form:       ${scoreColor(result.stats.avgSculpturalForm)}`)
  lines.push(`    Avg Chisel Precision:      ${scoreColor(result.stats.avgChiselPrecision)}`)
  lines.push(`    Avg Surface Finish:        ${scoreColor(result.stats.avgSurfaceFinish)}`)
  lines.push(`    Avg Proportional Harmony:  ${scoreColor(result.stats.avgProportionalHarmony)}`)
  lines.push(`    Avg Marble Quality:        ${scoreColor(result.stats.avgMarbleQuality)}`)
  lines.push(`    Avg Artistic Mastery:      ${scoreColor(result.stats.avgArtisticMastery)}`)
  lines.push(`    Sculptor Grade:            ${gradeColor(result.stats.sculptorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Condition Counts:'))
  lines.push(`    David:                     ${result.stats.davidCount}`)
  lines.push(`    Pieta:                     ${result.stats.pietaCount}`)
  lines.push(`    Venus:                     ${result.stats.venusCount}`)
  lines.push(`    Kouros:                    ${result.stats.kourosCount}`)
  lines.push(`    Bust:                      ${result.stats.bustCount}`)
  lines.push(`    Rubble:                    ${result.stats.rubbleCount}`)
  lines.push('')

  if (result.stats.bestBlock) {
    lines.push(chalk.rgb(44, 62, 80)('  Highlights:'))
    lines.push(`    Best Block:         ${result.stats.bestBlock}`)
    lines.push(`    Most Beautiful:     ${result.stats.mostBeautiful}`)
    lines.push(`    Most Precise:       ${result.stats.mostPrecise}`)
    lines.push(`    Best Polished:      ${result.stats.bestPolished}`)
    lines.push(`    Best Proportioned:  ${result.stats.bestProportioned}`)
    lines.push(`    Finest Marble:      ${result.stats.finestMarble}`)
    lines.push('')
  }

  if (verbose && result.blocks.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-File Details:'))
    for (const block of result.blocks) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(block.file)}`)
      lines.push(`      Score: ${scoreColor(block.qualityScore)}  Condition: ${conditionColor(block.condition)}`)
      lines.push(`      Form: ${styleColor(block.form.style)}(${block.sculpturalForm})  Chisel: ${block.chisel.technique}(${block.chiselPrecision})  Surface: ${block.surface.quality}(${block.surfaceFinish})`)
      lines.push(`      Proportion: ${block.proportion.system}(${block.proportionalHarmony})  Material: ${block.material.type}(${block.marbleQuality})  Mastery: ${block.mastery.level}(${block.artisticMastery})`)
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
