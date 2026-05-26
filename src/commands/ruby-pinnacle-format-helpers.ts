import chalk from 'chalk'

import type { RubyPinnacleResult, RubyFacet, RubyMountain, MountainCondition } from './ruby-pinnacle-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(220, 50, 50)(String(score))
  if (score >= 75) return chalk.rgb(200, 60, 60)(String(score))
  if (score >= 60) return chalk.rgb(180, 70, 70)(String(score))
  if (score >= 40) return chalk.rgb(140, 80, 80)(String(score))
  if (score >= 20) return chalk.rgb(100, 70, 70)(String(score))
  return chalk.gray(String(score))
}

/** @example colorMountainCondition('ruby-palace') */
export function colorMountainCondition(condition: MountainCondition | string): string {
  switch (condition) {
    case 'ruby-palace': return chalk.rgb(220, 50, 50)('ruby-palace')
    case 'gem-vault': return chalk.rgb(200, 60, 60)('gem-vault')
    case 'proper-treasury': return chalk.rgb(180, 70, 70)('proper-treasury')
    case 'stone-quarry': return chalk.rgb(140, 80, 80)('stone-quarry')
    case 'gravel-pit': return chalk.rgb(100, 70, 70)('gravel-pit')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatFacetTable(facet) */
export function formatFacetTable(facet: RubyFacet): string {
  const lines: string[] = [
    chalk.bold(`Ruby Facet: ${facet.file}`),
    '',
    `  Crimson Vitality:     ${colorScore(facet.crimsonVitality)}  ${chalk.dim(`(${facet.blazing.flame})`)}`,
    `  Peak Elegance:        ${colorScore(facet.peakElegance)}  ${chalk.dim(`(${facet.ascending.summit})`)}`,
    `  Flame Precision:      ${colorScore(facet.flamePrecision)}  ${chalk.dim(`(${facet.focusing.focus})`)}`,
    `  Summit Resilience:    ${colorScore(facet.summitResilience)}  ${chalk.dim(`(${facet.enduring.shield})`)}`,
    `  Crown Wisdom:         ${colorScore(facet.crownWisdom)}  ${chalk.dim(`(${facet.ruling.crown})`)}`,
    '',
    `  Quality Score: ${colorScore(facet.qualityScore)}  ${chalk.dim(`(${facet.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFacetsTable(facets) */
export function formatFacetsTable(facets: RubyFacet[]): string {
  if (facets.length === 0) return chalk.dim('No ruby facets found')
  const colWidths = {
    file: Math.max(4, ...facets.map((f) => f.file.length)),
    vitality: Math.max(8, ...facets.map((f) => String(f.crimsonVitality).length)),
    elegance: Math.max(8, ...facets.map((f) => String(f.peakElegance).length)),
    precision: Math.max(9, ...facets.map((f) => String(f.flamePrecision).length)),
    resilience: Math.max(10, ...facets.map((f) => String(f.summitResilience).length)),
    wisdom: Math.max(6, ...facets.map((f) => String(f.crownWisdom).length)),
    score: Math.max(5, ...facets.map((f) => String(f.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Ruby Facets'), '']
  const header =
    chalk.rgb(220, 50, 50)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Vitality', colWidths.vitality)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Elegance', colWidths.elegance)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Precision', colWidths.precision)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(220, 50, 50)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const f of facets) {
    lines.push(
      padRight(f.file, colWidths.file) + '  ' +
      padLeft(String(f.crimsonVitality), colWidths.vitality) + '  ' +
      padLeft(String(f.peakElegance), colWidths.elegance) + '  ' +
      padLeft(String(f.flamePrecision), colWidths.precision) + '  ' +
      padLeft(String(f.summitResilience), colWidths.resilience)) + '  ' +
    padLeft(String(f.crownWisdom), colWidths.wisdom) + '  ' +
    padLeft(String(f.qualityScore), colWidths.score)
  }
  return lines.join('\n')
}

/** @example formatMountainTable(mountain) */
export function formatMountainTable(mountain: RubyMountain): string {
  const lines: string[] = [
    chalk.bold(`Ruby Mountain: ${mountain.directory}`),
    '',
    `  Facets:           ${mountain.facets.length}`,
    `  Avg Vitality:     ${colorScore(mountain.avgVitality)}`,
    `  Avg Elegance:     ${colorScore(mountain.avgElegance)}`,
    `  Avg Wisdom:       ${colorScore(mountain.avgWisdom)}`,
    `  Masterpieces:     ${mountain.rubyMasterpieceCount}`,
    `  Mountain Type:    ${mountain.mountainType}`,
    `  Condition:        ${colorMountainCondition(mountain.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatMountainsTable(mountains) */
export function formatMountainsTable(mountains: RubyMountain[]): string {
  if (mountains.length === 0) return chalk.dim('No ruby mountains found')
  const lines: string[] = [chalk.bold('Ruby Mountains'), '']
  for (const m of mountains) {
    lines.push(`  ${chalk.rgb(220, 50, 50)(m.directory)}  ${colorScore(m.avgVitality)}  ${colorMountainCondition(m.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: RubyPinnacleResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Ruby Pinnacle Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Mountains:          ${stats.totalMountains}`,
    `  Avg Crimson Vitality:     ${colorScore(stats.avgCrimsonVitality)}`,
    `  Avg Peak Elegance:        ${colorScore(stats.avgPeakElegance)}`,
    `  Avg Flame Precision:      ${colorScore(stats.avgFlamePrecision)}`,
    `  Avg Summit Resilience:    ${colorScore(stats.avgSummitResilience)}`,
    `  Avg Crown Wisdom:         ${colorScore(stats.avgCrownWisdom)}`,
    `  Ruby Masterpieces:        ${stats.rubyMasterpieceCount}`,
    `  Royal Gems:               ${stats.royalGemCount}`,
    `  Proper Rubies:            ${stats.properRubyCount}`,
    `  Garnet Grade:             ${stats.garnetGradeCount}`,
    `  Red Glass:                ${stats.redGlassCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Majesty:          ${colorScore(stats.overallMajesty)}`,
    `  Gemologist Grade:         ${stats.gemologistGrade}`,
    `  Best Facet:               ${stats.bestFacet || 'N/A'}`,
    `  Most Vibrant:             ${stats.mostVibrant || 'N/A'}`,
    `  Most Elegant:             ${stats.mostElegant || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(220, 50, 50)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: RubyPinnacleResult): string {
  const lines: string[] = [
    chalk.bold('Ruby Pinnacle Analysis'),
    '',
    formatFacetsTable(result.facets),
    '',
    formatMountainsTable(result.mountains),
    '',
    chalk.bold('Crown Overview'),
    '',
    `  Avg Vitality:       ${colorScore(result.crown.avgVitality)}`,
    `  Avg Elegance:       ${colorScore(result.crown.avgElegance)}`,
    `  Avg Wisdom:         ${colorScore(result.crown.avgWisdom)}`,
    `  Overall Majesty:    ${colorScore(result.crown.overallMajesty)}`,
    `  Is Ruby:            ${result.crown.isRuby ? chalk.rgb(220, 50, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: RubyPinnacleResult): string {
  return JSON.stringify(result, null, 2)
}
