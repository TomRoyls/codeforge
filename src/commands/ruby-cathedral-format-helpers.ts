import chalk from 'chalk'

import type { BishopGrade, ParishCondition, ParishType, RubyCondition, RubyCathedralResult, RubyPrayer } from './ruby-cathedral-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(220, 20, 60)(String(score))
  if (score >= 75) return chalk.rgb(190, 15, 50)(String(score))
  if (score >= 60) return chalk.rgb(160, 10, 40)(String(score))
  if (score >= 40) return chalk.rgb(130, 8, 30)(String(score))
  if (score >= 20) return chalk.rgb(100, 5, 20)(String(score))
  return chalk.gray(String(score))
}

/** @example colorRubyCondition('ruby-masterpiece') */
export function colorRubyCondition(condition: RubyCondition | string): string {
  switch (condition) {
    case 'ruby-masterpiece': return chalk.rgb(220, 20, 60)('ruby-masterpiece')
    case 'crimson-altar': return chalk.rgb(190, 15, 50)('crimson-altar')
    case 'proper-ruby': return chalk.rgb(160, 10, 40)('proper-ruby')
    case 'pink-quartz': return chalk.rgb(130, 8, 30)('pink-quartz')
    case 'red-glass': return chalk.rgb(100, 5, 20)('red-glass')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorParishType('cardinal-parish') */
export function colorParishType(type: ParishType | string): string {
  switch (type) {
    case 'cardinal-parish': return chalk.rgb(220, 20, 60)('cardinal-parish')
    case 'ruby-diocese': return chalk.rgb(190, 15, 50)('ruby-diocese')
    case 'proper-parish': return chalk.rgb(160, 10, 40)('proper-parish')
    case 'small-chapel': return chalk.rgb(130, 8, 30)('small-chapel')
    case 'empty-aisle': return chalk.rgb(100, 5, 20)('empty-aisle')
    case 'no-parish': return chalk.gray('no-parish')
    default: return chalk.gray(String(type))
  }
}

/** @example colorParishCondition('ruby-cathedral') */
export function colorParishCondition(condition: ParishCondition | string): string {
  switch (condition) {
    case 'ruby-cathedral': return chalk.rgb(220, 20, 60)('ruby-cathedral')
    case 'crimson-basilica': return chalk.rgb(190, 15, 50)('crimson-basilica')
    case 'proper-church': return chalk.rgb(160, 10, 40)('proper-church')
    case 'stone-chapel': return chalk.rgb(130, 8, 30)('stone-chapel')
    case 'wooden-hut': return chalk.rgb(100, 5, 20)('wooden-hut')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorBishopGrade('archbishop') */
export function colorBishopGrade(grade: BishopGrade | string): string {
  switch (grade) {
    case 'archbishop': return chalk.rgb(220, 20, 60)('archbishop')
    case 'cardinal': return chalk.rgb(190, 15, 50)('cardinal')
    case 'proper-bishop': return chalk.rgb(160, 10, 40)('proper-bishop')
    case 'priest': return chalk.rgb(130, 8, 30)('priest')
    case 'deacon': return chalk.rgb(100, 5, 20)('deacon')
    case 'acolyte': return chalk.gray('acolyte')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPrayerTable(prayer) */
export function formatPrayerTable(prayer: RubyPrayer): string {
  const lines: string[] = [
    chalk.bold(`Ruby Prayer: ${prayer.file}`),
    '',
    `  Crimson Devotion:     ${colorScore(prayer.crimsonDevotion)}  ${chalk.dim(`(${prayer.dedicating.faith})`)}`,
    `  Altar Precision:      ${colorScore(prayer.altarPrecision)}  ${chalk.dim(`(${prayer.consecrating.altar})`)}`,
    `  Stained Clarity:      ${colorScore(prayer.stainedClarity)}  ${chalk.dim(`(${prayer.illuminating.window})`)}`,
    `  Blood Resilience:     ${colorScore(prayer.bloodResilience)}  ${chalk.dim(`(${prayer.surviving.shield})`)}`,
    `  Cardinal Wisdom:      ${colorScore(prayer.cardinalWisdom)}  ${chalk.dim(`(${prayer.guiding.rank})`)}`,
    '',
    `  Quality Score: ${colorScore(prayer.qualityScore)}  ${chalk.dim(`(${prayer.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPrayersTable(prayers) */
export function formatPrayersTable(prayers: RubyPrayer[]): string {
  if (prayers.length === 0) return chalk.dim('No ruby prayers found')
  const lines: string[] = [chalk.bold('Ruby Prayers'), '']
  for (const p of prayers) {
    lines.push(`  ${chalk.rgb(220, 20, 60)(p.file)}  Dev:${colorScore(p.crimsonDevotion)}  Prec:${colorScore(p.altarPrecision)}  Score:${colorScore(p.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatParishTable(parish) */
export function formatParishTable(parish: RubyCathedralResult['parishes'][number]): string {
  const lines: string[] = [
    chalk.bold(`Ruby Parish: ${parish.directory}`),
    '',
    `  Prayers:            ${parish.prayers.length}`,
    `  Avg Devotion:       ${colorScore(parish.avgDevotion)}`,
    `  Avg Precision:      ${colorScore(parish.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(parish.avgWisdom)}`,
    `  Masterpieces:       ${parish.rubyMasterpieceCount}`,
    `  Type:               ${colorParishType(parish.parishType)}`,
    `  Condition:          ${colorParishCondition(parish.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatParishesTable(parishes) */
export function formatParishesTable(parishes: RubyCathedralResult['parishes']): string {
  if (parishes.length === 0) return chalk.dim('No ruby parishes found')
  const lines: string[] = [chalk.bold('Ruby Parishes'), '']
  for (const p of parishes) {
    lines.push(`  ${chalk.rgb(220, 20, 60)(p.directory)}  ${colorScore(p.avgDevotion)}  ${colorParishCondition(p.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: RubyCathedralResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Ruby Cathedral Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Parishes:           ${stats.totalParishes}`,
    `  Avg Crimson Devotion:     ${colorScore(stats.avgCrimsonDevotion)}`,
    `  Avg Altar Precision:      ${colorScore(stats.avgAltarPrecision)}`,
    `  Avg Stained Clarity:      ${colorScore(stats.avgStainedClarity)}`,
    `  Avg Blood Resilience:     ${colorScore(stats.avgBloodResilience)}`,
    `  Avg Cardinal Wisdom:      ${colorScore(stats.avgCardinalWisdom)}`,
    `  Ruby Masterpieces:        ${stats.rubyMasterpieceCount}`,
    `  Crimson Altars:           ${stats.crimsonAltarCount}`,
    `  Proper Rubies:            ${stats.properRubyCount}`,
    `  Pink Quartz:              ${stats.pinkQuartzCount}`,
    `  Red Glass:                ${stats.redGlassCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Sanctity:         ${colorScore(stats.overallSanctity)}`,
    `  Bishop Grade:             ${colorBishopGrade(stats.bishopGrade)}`,
    `  Best Prayer:              ${stats.bestPrayer || 'N/A'}`,
    `  Most Devoted:             ${stats.mostDevoted || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
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
    lines.push(`  ${chalk.rgb(220, 20, 60)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: RubyCathedralResult): string {
  const lines: string[] = [
    chalk.bold('Ruby Cathedral Analysis'),
    '',
    formatPrayersTable(result.prayers),
    '',
    formatParishesTable(result.parishes),
    '',
    chalk.bold('Diocese Overview'),
    '',
    `  Avg Devotion:        ${colorScore(result.diocese.avgDevotion)}`,
    `  Avg Precision:       ${colorScore(result.diocese.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(result.diocese.avgWisdom)}`,
    `  Overall Sanctity:    ${colorScore(result.diocese.overallSanctity)}`,
    `  Is Ruby:             ${result.diocese.isRuby ? chalk.rgb(220, 20, 60)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: RubyCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
