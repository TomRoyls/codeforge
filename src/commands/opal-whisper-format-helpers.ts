import chalk from 'chalk'

import type { ChorusCondition, ChorusType, GemologistGrade, OpalCondition, OpalMurmur, OpalWhisperResult } from './opal-whisper-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 120, 255)(String(score))
  if (score >= 75) return chalk.rgb(155, 100, 220)(String(score))
  if (score >= 60) return chalk.rgb(130, 80, 185)(String(score))
  if (score >= 40) return chalk.rgb(105, 60, 150)(String(score))
  if (score >= 20) return chalk.rgb(80, 40, 115)(String(score))
  return chalk.gray(String(score))
}

/** @example colorOpalCondition('opal-masterpiece') */
export function colorOpalCondition(condition: OpalCondition | string): string {
  switch (condition) {
    case 'opal-masterpiece': return chalk.rgb(180, 120, 255)('opal-masterpiece')
    case 'precious-fire': return chalk.rgb(155, 100, 220)('precious-fire')
    case 'proper-opal': return chalk.rgb(130, 80, 185)('proper-opal')
    case 'common-stone': return chalk.rgb(105, 60, 150)('common-stone')
    case 'potch-rock': return chalk.rgb(80, 40, 115)('potch-rock')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorChorusType('rainbow-choir') */
export function colorChorusType(type: ChorusType | string): string {
  switch (type) {
    case 'rainbow-choir': return chalk.rgb(180, 120, 255)('rainbow-choir')
    case 'opal-ensemble': return chalk.rgb(155, 100, 220)('opal-ensemble')
    case 'proper-trio': return chalk.rgb(130, 80, 185)('proper-trio')
    case 'solo-voice': return chalk.rgb(105, 60, 150)('solo-voice')
    case 'silence': return chalk.rgb(80, 40, 115)('silence')
    case 'no-chorus': return chalk.gray('no-chorus')
    default: return chalk.gray(String(type))
  }
}

/** @example colorChorusCondition('opal-palace') */
export function colorChorusCondition(condition: ChorusCondition | string): string {
  switch (condition) {
    case 'opal-palace': return chalk.rgb(180, 120, 255)('opal-palace')
    case 'gem-gallery': return chalk.rgb(155, 100, 220)('gem-gallery')
    case 'proper-museum': return chalk.rgb(130, 80, 185)('proper-museum')
    case 'stone-display': return chalk.rgb(105, 60, 150)('stone-display')
    case 'empty-case': return chalk.rgb(80, 40, 115)('empty-case')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGemologistGrade('opal-master') */
export function colorGemologistGrade(grade: GemologistGrade | string): string {
  switch (grade) {
    case 'opal-master': return chalk.rgb(180, 120, 255)('opal-master')
    case 'precious-appraiser': return chalk.rgb(155, 100, 220)('precious-appraiser')
    case 'proper-gemologist': return chalk.rgb(130, 80, 185)('proper-gemologist')
    case 'apprentice': return chalk.rgb(105, 60, 150)('apprentice')
    case 'novice': return chalk.rgb(80, 40, 115)('novice')
    case 'rock-polisher': return chalk.gray('rock-polisher')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatMurmurTable(murmur) */
export function formatMurmurTable(murmur: OpalMurmur): string {
  const lines: string[] = [
    chalk.bold(`Opal Murmur: ${murmur.file}`),
    '',
    `  Spectral Play:        ${colorScore(murmur.spectralPlay)}  ${chalk.dim(`(${murmur.diffracting.spectrum})`)}`,
    `  Harmonic Clarity:     ${colorScore(murmur.harmonicClarity)}  ${chalk.dim(`(${murmur.resonating.harmony})`)}`,
    `  Prism Precision:      ${colorScore(murmur.prismPrecision)}  ${chalk.dim(`(${murmur.refracting.angle})`)}`,
    `  Aurora Resilience:    ${colorScore(murmur.auroraResilience)}  ${chalk.dim(`(${murmur.enduring.aurora})`)}`,
    `  Opalescence Wisdom:   ${colorScore(murmur.opalescenceWisdom)}  ${chalk.dim(`(${murmur.understanding.insight})`)}`,
    '',
    `  Quality Score: ${colorScore(murmur.qualityScore)}  ${chalk.dim(`(${murmur.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatMurmursTable(murmurs) */
export function formatMurmursTable(murmurs: OpalMurmur[]): string {
  if (murmurs.length === 0) return chalk.dim('No opal murmurs found')
  const lines: string[] = [chalk.bold('Opal Murmurs'), '']
  for (const m of murmurs) {
    lines.push(`  ${chalk.rgb(180, 120, 255)(m.file)}  Play:${colorScore(m.spectralPlay)}  Clr:${colorScore(m.harmonicClarity)}  Score:${colorScore(m.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatChorusTable(chorus) */
export function formatChorusTable(chorus: OpalWhisperResult['choruses'][number]): string {
  const lines: string[] = [
    chalk.bold(`Opal Chorus: ${chorus.directory}`),
    '',
    `  Murmurs:            ${chorus.murmurs.length}`,
    `  Avg Play:           ${colorScore(chorus.avgPlay)}`,
    `  Avg Precision:      ${colorScore(chorus.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(chorus.avgWisdom)}`,
    `  Masterpieces:       ${chorus.opalMasterpieceCount}`,
    `  Type:               ${colorChorusType(chorus.chorusType)}`,
    `  Condition:          ${colorChorusCondition(chorus.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatChorusesTable(choruses) */
export function formatChorusesTable(choruses: OpalWhisperResult['choruses']): string {
  if (choruses.length === 0) return chalk.dim('No opal choruses found')
  const lines: string[] = [chalk.bold('Opal Choruses'), '']
  for (const c of choruses) {
    lines.push(`  ${chalk.rgb(180, 120, 255)(c.directory)}  ${colorScore(c.avgPlay)}  ${colorChorusCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OpalWhisperResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Opal Whisper Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Choruses:           ${stats.totalChoruses}`,
    `  Avg Spectral Play:        ${colorScore(stats.avgSpectralPlay)}`,
    `  Avg Harmonic Clarity:     ${colorScore(stats.avgHarmonicClarity)}`,
    `  Avg Prism Precision:      ${colorScore(stats.avgPrismPrecision)}`,
    `  Avg Aurora Resilience:    ${colorScore(stats.avgAuroraResilience)}`,
    `  Avg Opalescence Wisdom:   ${colorScore(stats.avgOpalescenceWisdom)}`,
    `  Opal Masterpieces:        ${stats.opalMasterpieceCount}`,
    `  Precious Fire:            ${stats.preciousFireCount}`,
    `  Proper Opal:              ${stats.properOpalCount}`,
    `  Common Stone:             ${stats.commonStoneCount}`,
    `  Potch Rock:               ${stats.potchRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Brilliance:       ${colorScore(stats.overallBrilliance)}`,
    `  Gemologist Grade:         ${colorGemologistGrade(stats.gemologistGrade)}`,
    `  Best Murmur:              ${stats.bestMurmur || 'N/A'}`,
    `  Most Colorful:            ${stats.mostColorful || 'N/A'}`,
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
    lines.push(`  ${chalk.rgb(180, 120, 255)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OpalWhisperResult): string {
  const lines: string[] = [
    chalk.bold('Opal Whisper Analysis'),
    '',
    formatMurmursTable(result.murmurs),
    '',
    formatChorusesTable(result.choruses),
    '',
    chalk.bold('Spectrum Overview'),
    '',
    `  Avg Play:             ${colorScore(result.spectrum.avgPlay)}`,
    `  Avg Precision:        ${colorScore(result.spectrum.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(result.spectrum.avgWisdom)}`,
    `  Overall Brilliance:   ${colorScore(result.spectrum.overallBrilliance)}`,
    `  Is Opal:              ${result.spectrum.isOpal ? chalk.rgb(180, 120, 255)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OpalWhisperResult): string {
  return JSON.stringify(result, null, 2)
}
