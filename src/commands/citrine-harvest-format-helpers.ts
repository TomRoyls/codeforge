import chalk from 'chalk'

import type { CitrineCondition, CitrineHarvestResult, CitrineSheaf, FarmerGrade, FieldCondition, FieldType } from './citrine-harvest-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 150, 30)(String(score))
  if (score >= 75) return chalk.rgb(180, 130, 25)(String(score))
  if (score >= 60) return chalk.rgb(160, 110, 20)(String(score))
  if (score >= 40) return chalk.rgb(130, 90, 15)(String(score))
  if (score >= 20) return chalk.rgb(100, 70, 10)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCitrineCondition('citrine-masterpiece') */
export function colorCitrineCondition(condition: CitrineCondition | string): string {
  switch (condition) {
    case 'citrine-masterpiece': return chalk.rgb(200, 150, 30)('citrine-masterpiece')
    case 'golden-gem': return chalk.rgb(180, 130, 25)('golden-gem')
    case 'proper-citrine': return chalk.rgb(160, 110, 20)('proper-citrine')
    case 'pale-yellow': return chalk.rgb(130, 90, 15)('pale-yellow')
    case 'rough-quartz': return chalk.rgb(100, 70, 10)('rough-quartz')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorFieldType('golden-wheat-field') */
export function colorFieldType(type: FieldType | string): string {
  switch (type) {
    case 'golden-wheat-field': return chalk.rgb(200, 150, 30)('golden-wheat-field')
    case 'sunlit-meadow': return chalk.rgb(180, 130, 25)('sunlit-meadow')
    case 'proper-plot': return chalk.rgb(160, 110, 20)('proper-plot')
    case 'small-garden': return chalk.rgb(130, 90, 15)('small-garden')
    case 'empty-ground': return chalk.rgb(100, 70, 10)('empty-ground')
    case 'no-field': return chalk.gray('no-field')
    default: return chalk.gray(String(type))
  }
}

/** @example colorFieldCondition('citrine-palace') */
export function colorFieldCondition(condition: FieldCondition | string): string {
  switch (condition) {
    case 'citrine-palace': return chalk.rgb(200, 150, 30)('citrine-palace')
    case 'golden-barn': return chalk.rgb(180, 130, 25)('golden-barn')
    case 'proper-silo': return chalk.rgb(160, 110, 20)('proper-silo')
    case 'wooden-shed': return chalk.rgb(130, 90, 15)('wooden-shed')
    case 'empty-lot': return chalk.rgb(100, 70, 10)('empty-lot')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorFarmerGrade('harvest-master') */
export function colorFarmerGrade(grade: FarmerGrade | string): string {
  switch (grade) {
    case 'harvest-master': return chalk.rgb(200, 150, 30)('harvest-master')
    case 'golden-farmer': return chalk.rgb(180, 130, 25)('golden-farmer')
    case 'proper-cultivator': return chalk.rgb(160, 110, 20)('proper-cultivator')
    case 'apprentice': return chalk.rgb(130, 90, 15)('apprentice')
    case 'novice': return chalk.rgb(100, 70, 10)('novice')
    case 'city-dweller': return chalk.gray('city-dweller')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatSheafTable(sheaf) */
export function formatSheafTable(sheaf: CitrineSheaf): string {
  const lines: string[] = [
    chalk.bold(`Citrine Sheaf: ${sheaf.file}`),
    '',
    `  Golden Abundance:    ${colorScore(sheaf.goldenAbundance)}  ${chalk.dim(`(${sheaf.yielding.harvest})`)}`,
    `  Sunlight Clarity:    ${colorScore(sheaf.sunlightClarity)}  ${chalk.dim(`(${sheaf.illuminating.light})`)}`,
    `  Crystal Precision:   ${colorScore(sheaf.crystalPrecision)}  ${chalk.dim(`(${sheaf.crystallizing.cut})`)}`,
    `  Autumn Resilience:   ${colorScore(sheaf.autumnResilience)}  ${chalk.dim(`(${sheaf.weathering.season})`)}`,
    `  Solar Wisdom:        ${colorScore(sheaf.solarWisdom)}  ${chalk.dim(`(${sheaf.understanding.sun})`)}`,
    '',
    `  Quality Score:       ${colorScore(sheaf.qualityScore)}  ${chalk.dim(`(${sheaf.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatSheavesTable(sheaves) */
export function formatSheavesTable(sheaves: CitrineSheaf[]): string {
  if (sheaves.length === 0) return chalk.dim('No citrine sheaves found')
  const lines: string[] = [chalk.bold('Citrine Sheaves'), '']
  for (const sh of sheaves) {
    lines.push(`  ${chalk.rgb(200, 150, 30)(sh.file)}  Abn:${colorScore(sh.goldenAbundance)}  Prec:${colorScore(sh.crystalPrecision)}  Score:${colorScore(sh.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatFieldTable(field) */
export function formatFieldTable(field: CitrineHarvestResult['fields'][number]): string {
  const lines: string[] = [
    chalk.bold(`Citrine Field: ${field.directory}`),
    '',
    `  Sheaves:           ${field.sheaves.length}`,
    `  Avg Abundance:     ${colorScore(field.avgAbundance)}`,
    `  Avg Precision:     ${colorScore(field.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(field.avgWisdom)}`,
    `  Masterpieces:      ${field.citrineMasterpieceCount}`,
    `  Field Type:        ${colorFieldType(field.fieldType)}`,
    `  Condition:         ${colorFieldCondition(field.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatFieldsTable(fields) */
export function formatFieldsTable(fields: CitrineHarvestResult['fields']): string {
  if (fields.length === 0) return chalk.dim('No citrine fields found')
  const lines: string[] = [chalk.bold('Citrine Fields'), '']
  for (const f of fields) {
    lines.push(`  ${chalk.rgb(200, 150, 30)(f.directory)}  ${colorScore(f.avgAbundance)}  ${colorFieldCondition(f.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CitrineHarvestResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Citrine Harvest Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Fields:             ${stats.totalFields}`,
    `  Avg Golden Abundance:     ${colorScore(stats.avgGoldenAbundance)}`,
    `  Avg Sunlight Clarity:     ${colorScore(stats.avgSunlightClarity)}`,
    `  Avg Crystal Precision:    ${colorScore(stats.avgCrystalPrecision)}`,
    `  Avg Autumn Resilience:    ${colorScore(stats.avgAutumnResilience)}`,
    `  Avg Solar Wisdom:         ${colorScore(stats.avgSolarWisdom)}`,
    `  Citrine Masterpieces:     ${stats.citrineMasterpieceCount}`,
    `  Golden Gems:              ${stats.goldenGemCount}`,
    `  Proper Citrine:           ${stats.properCitrineCount}`,
    `  Pale Yellow:              ${stats.paleYellowCount}`,
    `  Rough Quartz:             ${stats.roughQuartzCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  High Abundance Count:     ${stats.hasHighAbundanceCount}`,
    `  High Clarity Count:       ${stats.hasHighClarityCount}`,
    `  High Precision Count:     ${stats.hasHighPrecisionCount}`,
    `  High Resilience Count:    ${stats.hasHighResilienceCount}`,
    `  High Wisdom Count:        ${stats.hasHighWisdomCount}`,
    `  Overall Yield:            ${colorScore(stats.overallYield)}`,
    `  Farmer Grade:             ${colorFarmerGrade(stats.farmerGrade)}`,
    `  Best Sheaf:               ${stats.bestSheaf || 'N/A'}`,
    `  Most Abundant:            ${stats.mostAbundant || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
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
    lines.push(`  ${chalk.rgb(200, 150, 30)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CitrineHarvestResult): string {
  const lines: string[] = [
    chalk.bold('Citrine Harvest Analysis'),
    '',
    formatSheavesTable(result.sheaves),
    '',
    formatFieldsTable(result.fields),
    '',
    chalk.bold('Sun Overview'),
    '',
    `  Avg Abundance:   ${colorScore(result.sun.avgAbundance)}`,
    `  Avg Precision:   ${colorScore(result.sun.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(result.sun.avgWisdom)}`,
    `  Overall Yield:   ${colorScore(result.sun.overallYield)}`,
    `  Is Citrine:      ${result.sun.isCitrine ? chalk.rgb(200, 150, 30)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CitrineHarvestResult): string {
  return JSON.stringify(result, null, 2)
}
