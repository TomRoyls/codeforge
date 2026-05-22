import chalk from 'chalk'

import type { TapestryLoomResult } from './tapestry-loom-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('gobelins-masterpiece') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'gobelins-masterpiece': return chalk.rgb(46, 204, 113).bold(condition)
    case 'fine-tapestry': return chalk.rgb(52, 152, 219)(condition)
    case 'quality-weave': return chalk.rgb(155, 89, 182)(condition)
    case 'standard-cloth': return chalk.rgb(241, 196, 15)(condition)
    case 'rag-rug': return chalk.rgb(230, 126, 34)(condition)
    case 'tangled-yarn': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-weaver') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-weaver': return chalk.rgb(46, 204, 113).bold(grade)
    case 'journeyman-weaver': return chalk.rgb(52, 152, 219)(grade)
    case 'apprentice': return chalk.rgb(155, 89, 182)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'hobbyist': return chalk.rgb(230, 126, 34)(grade)
    case 'cat': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example materialColor('silk') returns colored string */
export function materialColor(material: string): string {
  switch (material) {
    case 'gold': return chalk.rgb(241, 196, 15)(material)
    case 'silk': return chalk.rgb(46, 204, 113)(material)
    case 'wool': return chalk.rgb(52, 152, 219)(material)
    case 'cotton': return chalk.rgb(155, 89, 182)(material)
    case 'linen': return chalk.rgb(230, 126, 34)(material)
    case 'straw': return chalk.rgb(149, 165, 166)(material)
    default: return material
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatTapestryLoomJson(result) returns JSON string */
export function formatTapestryLoomJson(result: TapestryLoomResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatTapestryLoomTable(result, false) returns formatted string */
export function formatTapestryLoomTable(result: TapestryLoomResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.rgb(155, 89, 182).bold('Tapestry Loom Analysis'))
  lines.push('')
  lines.push(`Overall Craftsmanship: ${scoreColor(result.stats.overallCraftsmanship)}/100`)
  lines.push(`Weaver Grade: ${gradeColor(result.stats.weaverGrade)}`)
  lines.push(`Files: ${result.stats.totalFiles} | Panels: ${result.stats.totalPanels}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182).bold('Averages'))
  lines.push(`  Thread Quality:       ${scoreColor(result.stats.avgThreadQuality)}`)
  lines.push(`  Weave Density:        ${scoreColor(result.stats.avgWeaveDensity)}`)
  lines.push(`  Pattern Richness:     ${scoreColor(result.stats.avgPatternRichness)}`)
  lines.push(`  Color Palette:        ${scoreColor(result.stats.avgColorPalette)}`)
  lines.push(`  Narrative Coherence:  ${scoreColor(result.stats.avgNarrativeCoherence)}`)
  lines.push(`  Artistic Value:       ${scoreColor(result.stats.avgArtisticValue)}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182).bold('Conditions'))
  lines.push(`  Gobelins Masterpiece: ${result.stats.gobelinsMasterpieceCount}`)
  lines.push(`  Fine Tapestry:        ${result.stats.fineTapestryCount}`)
  lines.push(`  Quality Weave:        ${result.stats.qualityWeaveCount}`)
  lines.push(`  Standard Cloth:       ${result.stats.standardClothCount}`)
  lines.push(`  Rag Rug:              ${result.stats.ragRugCount}`)
  lines.push(`  Tangled Yarn:         ${result.stats.tangledYarnCount}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182).bold('Highlights'))
  lines.push(`  Best Thread:          ${result.stats.bestThread}`)
  lines.push(`  Finest Weave:         ${result.stats.finestWeave}`)
  lines.push(`  Richest Pattern:      ${result.stats.richestPattern}`)
  lines.push(`  Best Narrative:       ${result.stats.bestNarrative}`)
  lines.push(`  Most Artistic:        ${result.stats.mostArtistic}`)
  lines.push('')

  if (verbose) {
    lines.push(chalk.rgb(155, 89, 182).bold('Threads'))
    for (const thread of result.threads) {
      lines.push(`  ${conditionColor(thread.condition).padEnd(30)} ${thread.file}`)
      lines.push(`    Quality: ${scoreColor(thread.threadQuality)} | Weave: ${scoreColor(thread.weaveDensity)} | Pattern: ${scoreColor(thread.patternRichness)}`)
      lines.push(`    Color: ${scoreColor(thread.colorPalette)} | Narrative: ${scoreColor(thread.narrativeCoherence)} | Art: ${scoreColor(thread.artisticValue)}`)
      lines.push(`    Material: ${materialColor(thread.thread.material)} | Score: ${scoreColor(thread.qualityScore)}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(155, 89, 182).bold('Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(241, 196, 15)('\u2022')} ${rec}`)
    }
  }

  return lines.join('\n')
}
