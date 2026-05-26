import chalk from 'chalk'

import type { AlexandriteCondition, AlexandriteDuskResult, AlexandriteShift, GemologistGrade, PairCondition, PairType } from './alexandrite-dusk-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(119, 57, 238)(String(score))
  if (score >= 75) return chalk.rgb(100, 47, 210)(String(score))
  if (score >= 60) return chalk.rgb(85, 37, 180)(String(score))
  if (score >= 40) return chalk.rgb(70, 27, 150)(String(score))
  if (score >= 20) return chalk.rgb(55, 17, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorAlexandriteCondition('alexandrite-masterpiece') */
export function colorAlexandriteCondition(condition: AlexandriteCondition | string): string {
  switch (condition) {
    case 'alexandrite-masterpiece': return chalk.rgb(119, 57, 238)('alexandrite-masterpiece')
    case 'imperial-gem': return chalk.rgb(100, 47, 210)('imperial-gem')
    case 'proper-alexandrite': return chalk.rgb(85, 37, 180)('proper-alexandrite')
    case 'common-chrysoberyl': return chalk.rgb(70, 27, 150)('common-chrysoberyl')
    case 'glass-stone': return chalk.rgb(55, 17, 120)('glass-stone')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorPairType('perfect-pair') */
export function colorPairType(type: PairType | string): string {
  switch (type) {
    case 'perfect-pair': return chalk.rgb(119, 57, 238)('perfect-pair')
    case 'dual-collection': return chalk.rgb(100, 47, 210)('dual-collection')
    case 'proper-set': return chalk.rgb(85, 37, 180)('proper-set')
    case 'single-stone': return chalk.rgb(70, 27, 150)('single-stone')
    case 'empty-case': return chalk.rgb(55, 17, 120)('empty-case')
    case 'no-pair': return chalk.gray('no-pair')
    default: return chalk.gray(String(type))
  }
}

/** @example colorPairCondition('alexandrite-palace') */
export function colorPairCondition(condition: PairCondition | string): string {
  switch (condition) {
    case 'alexandrite-palace': return chalk.rgb(119, 57, 238)('alexandrite-palace')
    case 'dual-vault': return chalk.rgb(100, 47, 210)('dual-vault')
    case 'proper-chamber': return chalk.rgb(85, 37, 180)('proper-chamber')
    case 'stone-room': return chalk.rgb(70, 27, 150)('stone-room')
    case 'empty-box': return chalk.rgb(55, 17, 120)('empty-box')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGemologistGrade('imperial-gemologist') */
export function colorGemologistGrade(grade: GemologistGrade | string): string {
  switch (grade) {
    case 'imperial-gemologist': return chalk.rgb(119, 57, 238)('imperial-gemologist')
    case 'color-change-expert': return chalk.rgb(100, 47, 210)('color-change-expert')
    case 'proper-appraiser': return chalk.rgb(85, 37, 180)('proper-appraiser')
    case 'apprentice': return chalk.rgb(70, 27, 150)('apprentice')
    case 'novice': return chalk.rgb(55, 17, 120)('novice')
    case 'blind-buyer': return chalk.gray('blind-buyer')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatShiftTable(shift) */
export function formatShiftTable(shift: AlexandriteShift): string {
  const lines: string[] = [
    chalk.bold(`Alexandrite Shift: ${shift.file}`),
    '',
    `  Color-Shift Clarity:    ${colorScore(shift.colorShiftClarity)}  ${chalk.dim(`(${shift.adapting.shift})`)}`,
    `  Twilight Precision:     ${colorScore(shift.twilightPrecision)}  ${chalk.dim(`(${shift.transitioning.phase})`)}`,
    `  Dual-Nature Resilience: ${colorScore(shift.dualNatureResilience)}  ${chalk.dim(`(${shift.dualSurviving.armor})`)}`,
    `  Chrysoberyl Wisdom:     ${colorScore(shift.chrysoberylWisdom)}  ${chalk.dim(`(${shift.understanding.gem})`)}`,
    `  Transformation Mastery: ${colorScore(shift.transformationMastery)}  ${chalk.dim(`(${shift.transforming.art})`)}`,
    '',
    `  Quality Score: ${colorScore(shift.qualityScore)}  ${chalk.dim(`(${shift.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShiftsTable(shifts) */
export function formatShiftsTable(shifts: AlexandriteShift[]): string {
  if (shifts.length === 0) return chalk.dim('No alexandrite shifts found')
  const lines: string[] = [chalk.bold('Alexandrite Shifts'), '']
  for (const s of shifts) {
    lines.push(`  ${chalk.rgb(119, 57, 238)(s.file)}  Clr:${colorScore(s.colorShiftClarity)}  Prec:${colorScore(s.twilightPrecision)}  Score:${colorScore(s.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatPairTable(pair) */
export function formatPairTable(pair: AlexandriteDuskResult['pairs'][number]): string {
  const lines: string[] = [
    chalk.bold(`Alexandrite Pair: ${pair.directory}`),
    '',
    `  Shifts:              ${pair.shifts.length}`,
    `  Avg Clarity:         ${colorScore(pair.avgClarity)}`,
    `  Avg Resilience:      ${colorScore(pair.avgResilience)}`,
    `  Avg Wisdom:          ${colorScore(pair.avgWisdom)}`,
    `  Masterpieces:        ${pair.alexandriteMasterpieceCount}`,
    `  Type:                ${colorPairType(pair.pairType)}`,
    `  Condition:           ${colorPairCondition(pair.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatPairsTable(pairs) */
export function formatPairsTable(pairs: AlexandriteDuskResult['pairs']): string {
  if (pairs.length === 0) return chalk.dim('No alexandrite pairs found')
  const lines: string[] = [chalk.bold('Alexandrite Pairs'), '']
  for (const p of pairs) {
    lines.push(`  ${chalk.rgb(119, 57, 238)(p.directory)}  ${colorScore(p.avgClarity)}  ${colorPairCondition(p.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AlexandriteDuskResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Alexandrite Dusk Statistics'),
    '',
    `  Total Files:                  ${stats.totalFiles}`,
    `  Total Pairs:                  ${stats.totalPairs}`,
    `  Avg Color-Shift Clarity:      ${colorScore(stats.avgColorShiftClarity)}`,
    `  Avg Twilight Precision:       ${colorScore(stats.avgTwilightPrecision)}`,
    `  Avg Dual-Nature Resilience:   ${colorScore(stats.avgDualNatureResilience)}`,
    `  Avg Chrysoberyl Wisdom:       ${colorScore(stats.avgChrysoberylWisdom)}`,
    `  Avg Transformation Mastery:   ${colorScore(stats.avgTransformationMastery)}`,
    `  Alexandrite Masterpieces:     ${stats.alexandriteMasterpieceCount}`,
    `  Imperial Gems:                ${stats.imperialGemCount}`,
    `  Proper Alexandrites:          ${stats.properAlexandriteCount}`,
    `  Common Chrysoberyls:          ${stats.commonChrysoberylCount}`,
    `  Glass Stones:                 ${stats.glassStoneCount}`,
    `  Void:                         ${stats.voidCount}`,
    `  Overall Transformation:       ${colorScore(stats.overallTransformation)}`,
    `  Gemologist Grade:             ${colorGemologistGrade(stats.gemologistGrade)}`,
    `  Best Shift:                   ${stats.bestShift || 'N/A'}`,
    `  Most Adaptive:                ${stats.mostAdaptive || 'N/A'}`,
    `  Most Precise:                 ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:               ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                       ${stats.wisest || 'N/A'}`,
    `  Most Transformative:          ${stats.mostTransformative || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(119, 57, 238)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AlexandriteDuskResult): string {
  const lines: string[] = [
    chalk.bold('Alexandrite Dusk Analysis'),
    '',
    formatShiftsTable(result.shifts),
    '',
    formatPairsTable(result.pairs),
    '',
    chalk.bold('Twilight Overview'),
    '',
    `  Avg Clarity:           ${colorScore(result.twilight.avgClarity)}`,
    `  Avg Resilience:        ${colorScore(result.twilight.avgResilience)}`,
    `  Avg Wisdom:            ${colorScore(result.twilight.avgWisdom)}`,
    `  Overall Transformation: ${colorScore(result.twilight.overallTransformation)}`,
    `  Is Alexandrite:        ${result.twilight.isAlexandrite ? chalk.rgb(119, 57, 238)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AlexandriteDuskResult): string {
  return JSON.stringify(result, null, 2)
}
