import chalk from 'chalk'

import type { CopperCondition, CopperGarden, CopperMark, CopperSundialResult, GardenCondition, GardenType, HorologistGrade } from './copper-sundial-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 75) return chalk.rgb(160, 100, 44)(String(score))
  if (score >= 60) return chalk.rgb(136, 85, 37)(String(score))
  if (score >= 40) return chalk.rgb(112, 70, 30)(String(score))
  if (score >= 20) return chalk.rgb(88, 55, 23)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCopperCondition('copper-masterpiece') */
export function colorCopperCondition(condition: CopperCondition | string): string {
  switch (condition) {
    case 'copper-masterpiece': return chalk.rgb(184, 115, 51)('copper-masterpiece')
    case 'verdigris-gem': return chalk.rgb(160, 100, 44)('verdigris-gem')
    case 'proper-sundial': return chalk.rgb(136, 85, 37)('proper-sundial')
    case 'tarnished-dial': return chalk.rgb(112, 70, 30)('tarnished-dial')
    case 'rusty-metal': return chalk.rgb(88, 55, 23)('rusty-metal')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGardenType('formal-garden') */
export function colorGardenType(type: GardenType | string): string {
  switch (type) {
    case 'formal-garden': return chalk.rgb(184, 115, 51)('formal-garden')
    case 'courtyard-sundial': return chalk.rgb(160, 100, 44)('courtyard-sundial')
    case 'proper-dial': return chalk.rgb(136, 85, 37)('proper-dial')
    case 'small-marker': return chalk.rgb(112, 70, 30)('small-marker')
    case 'empty-pedestal': return chalk.rgb(88, 55, 23)('empty-pedestal')
    case 'no-garden': return chalk.gray('no-garden')
    default: return chalk.gray(String(type))
  }
}

/** @example colorGardenCondition('copper-palace') */
export function colorGardenCondition(condition: GardenCondition | string): string {
  switch (condition) {
    case 'copper-palace': return chalk.rgb(184, 115, 51)('copper-palace')
    case 'verdigris-tower': return chalk.rgb(160, 100, 44)('verdigris-tower')
    case 'proper-garden': return chalk.rgb(136, 85, 37)('proper-garden')
    case 'stone-yard': return chalk.rgb(112, 70, 30)('stone-yard')
    case 'empty-lot': return chalk.rgb(88, 55, 23)('empty-lot')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorHorologistGrade('master-horologist') */
export function colorHorologistGrade(grade: HorologistGrade | string): string {
  switch (grade) {
    case 'master-horologist': return chalk.rgb(184, 115, 51)('master-horologist')
    case 'expert-clockmaker': return chalk.rgb(160, 100, 44)('expert-clockmaker')
    case 'proper-dial-maker': return chalk.rgb(136, 85, 37)('proper-dial-maker')
    case 'apprentice': return chalk.rgb(112, 70, 30)('apprentice')
    case 'novice': return chalk.rgb(88, 55, 23)('novice')
    case 'time-blind': return chalk.gray('time-blind')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatMarkTable(mark) */
export function formatMarkTable(mark: CopperMark): string {
  const lines: string[] = [
    chalk.bold(`Copper Mark: ${mark.file}`),
    '',
    `  Time Patience:       ${colorScore(mark.timePatience)}  ${chalk.dim(`(${mark.aging.maturity})`)}`,
    `  Solar Precision:     ${colorScore(mark.solarPrecision)}  ${chalk.dim(`(${mark.calculating.angle})`)}`,
    `  Patina Resilience:   ${colorScore(mark.patinaResilience)}  ${chalk.dim(`(${mark.weathering.verdigris})`)}`,
    `  Shadow Clarity:      ${colorScore(mark.shadowClarity)}  ${chalk.dim(`(${mark.revealing.shadow})`)}`,
    `  Dial Wisdom:         ${colorScore(mark.dialWisdom)}  ${chalk.dim(`(${mark.timing.hour})`)}`,
    '',
    `  Quality Score: ${colorScore(mark.qualityScore)}  ${chalk.dim(`(${mark.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatMarksTable(marks) */
export function formatMarksTable(marks: CopperMark[]): string {
  if (marks.length === 0) return chalk.dim('No copper marks found')
  const lines: string[] = [chalk.bold('Copper Marks'), '']
  for (const m of marks) {
    lines.push(`  ${chalk.rgb(184, 115, 51)(m.file)}  Pat:${colorScore(m.timePatience)}  Prec:${colorScore(m.solarPrecision)}  Score:${colorScore(m.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatGardenTable(garden) */
export function formatGardenTable(garden: CopperGarden): string {
  const lines: string[] = [
    chalk.bold(`Copper Garden: ${garden.directory}`),
    '',
    `  Marks:               ${garden.marks.length}`,
    `  Avg Patience:        ${colorScore(garden.avgPatience)}`,
    `  Avg Precision:       ${colorScore(garden.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(garden.avgWisdom)}`,
    `  Masterpieces:        ${garden.copperMasterpieceCount}`,
    `  Garden Type:         ${colorGardenType(garden.gardenType)}`,
    `  Condition:           ${colorGardenCondition(garden.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGardensTable(gardens) */
export function formatGardensTable(gardens: CopperGarden[]): string {
  if (gardens.length === 0) return chalk.dim('No copper gardens found')
  const lines: string[] = [chalk.bold('Copper Gardens'), '']
  for (const g of gardens) {
    lines.push(`  ${chalk.rgb(184, 115, 51)(g.directory)}  ${colorScore(g.avgPatience)}  ${colorGardenCondition(g.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperSundialResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Copper Sundial Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Gardens:              ${stats.totalGardens}`,
    `  Avg Time Patience:          ${colorScore(stats.avgTimePatience)}`,
    `  Avg Solar Precision:        ${colorScore(stats.avgSolarPrecision)}`,
    `  Avg Patina Resilience:      ${colorScore(stats.avgPatinaResilience)}`,
    `  Avg Shadow Clarity:         ${colorScore(stats.avgShadowClarity)}`,
    `  Avg Dial Wisdom:            ${colorScore(stats.avgDialWisdom)}`,
    `  Copper Masterpieces:        ${stats.copperMasterpieceCount}`,
    `  Verdigris Gems:             ${stats.verdigrisGemCount}`,
    `  Proper Sundials:            ${stats.properSundialCount}`,
    `  Tarnished Dials:            ${stats.tarnishedDialCount}`,
    `  Rusty Metals:               ${stats.rustyMetalCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  Overall Timelessness:       ${colorScore(stats.overallTimelessness)}`,
    `  Horologist Grade:           ${colorHorologistGrade(stats.horologistGrade)}`,
    `  Best Mark:                  ${stats.bestMark || 'N/A'}`,
    `  Most Patient:               ${stats.mostPatient || 'N/A'}`,
    `  Most Precise:               ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:             ${stats.mostResilient || 'N/A'}`,
    `  Clearest:                   ${stats.clearest || 'N/A'}`,
    `  Wisest:                     ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(184, 115, 51)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CopperSundialResult): string {
  const lines: string[] = [
    chalk.bold('Copper Sundial Analysis'),
    '',
    formatMarksTable(result.marks),
    '',
    formatGardensTable(result.gardens),
    '',
    chalk.bold('Meridian Overview'),
    '',
    `  Avg Patience:          ${colorScore(result.meridian.avgPatience)}`,
    `  Avg Precision:         ${colorScore(result.meridian.avgPrecision)}`,
    `  Avg Wisdom:            ${colorScore(result.meridian.avgWisdom)}`,
    `  Overall Timelessness:  ${colorScore(result.meridian.overallTimelessness)}`,
    `  Is Copper:             ${result.meridian.isCopper ? chalk.rgb(184, 115, 51)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CopperSundialResult): string {
  return JSON.stringify(result, null, 2)
}
