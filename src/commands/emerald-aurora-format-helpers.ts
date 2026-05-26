import chalk from 'chalk'

import type { AuroraCurtain, AuroraBand, BandCondition, BandType, CurtainCondition, EmeraldAuroraResult, ObserverGrade } from './emerald-aurora-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(0, 200, 120)(String(score))
  if (score >= 75) return chalk.rgb(50, 180, 100)(String(score))
  if (score >= 60) return chalk.rgb(80, 160, 90)(String(score))
  if (score >= 40) return chalk.rgb(100, 130, 80)(String(score))
  if (score >= 20) return chalk.rgb(80, 100, 70)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCurtainCondition('aurora-masterpiece') */
export function colorCurtainCondition(condition: CurtainCondition | string): string {
  switch (condition) {
    case 'aurora-masterpiece': return chalk.rgb(0, 200, 120)('aurora-masterpiece')
    case 'emerald-lights': return chalk.rgb(50, 180, 100)('emerald-lights')
    case 'proper-aurora': return chalk.rgb(80, 160, 90)('proper-aurora')
    case 'faint-glow': return chalk.rgb(100, 130, 80)('faint-glow')
    case 'dark-sky': return chalk.rgb(80, 100, 70)('dark-sky')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorBandType('polar-curtain') */
export function colorBandType(type: BandType | string): string {
  switch (type) {
    case 'polar-curtain': return chalk.rgb(0, 200, 120)('polar-curtain')
    case 'aurora-band': return chalk.rgb(50, 180, 100)('aurora-band')
    case 'proper-glow': return chalk.rgb(80, 160, 90)('proper-glow')
    case 'faint-light': return chalk.rgb(100, 130, 80)('faint-light')
    case 'dark-patch': return chalk.rgb(80, 100, 70)('dark-patch')
    case 'no-band': return chalk.gray('no-band')
    default: return chalk.gray(String(type))
  }
}

/** @example colorBandCondition('emerald-sky') */
export function colorBandCondition(condition: BandCondition | string): string {
  switch (condition) {
    case 'emerald-sky': return chalk.rgb(0, 200, 120)('emerald-sky')
    case 'northern-lights': return chalk.rgb(50, 180, 100)('northern-lights')
    case 'proper-horizon': return chalk.rgb(80, 160, 90)('proper-horizon')
    case 'gray-dawn': return chalk.rgb(100, 130, 80)('gray-dawn')
    case 'black-night': return chalk.rgb(80, 100, 70)('black-night')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorObserverGrade('aurora-master') */
export function colorObserverGrade(grade: ObserverGrade | string): string {
  switch (grade) {
    case 'aurora-master': return chalk.rgb(0, 200, 120)('aurora-master')
    case 'veteran-observer': return chalk.rgb(50, 180, 100)('veteran-observer')
    case 'proper-watcher': return chalk.rgb(80, 160, 90)('proper-watcher')
    case 'amateur': return chalk.rgb(100, 130, 80)('amateur')
    case 'novice': return chalk.rgb(80, 100, 70)('novice')
    case 'blinked': return chalk.gray('blinked')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatCurtainTable(curtain) */
export function formatCurtainTable(curtain: AuroraCurtain): string {
  const lines: string[] = [
    chalk.bold(`Aurora Curtain: ${curtain.file}`),
    '',
    `  Green Vitality:       ${colorScore(curtain.greenVitality)}  ${chalk.dim(`(${curtain.thriving.growth})`)}`,
    `  Northern Radiance:    ${colorScore(curtain.northernRadiance)}  ${chalk.dim(`(${curtain.glowing.light})`)}`,
    `  Spectrum Clarity:     ${colorScore(curtain.spectrumClarity)}  ${chalk.dim(`(${curtain.clarifying.spectrum})`)}`,
    `  Celestial Precision:  ${colorScore(curtain.celestialPrecision)}  ${chalk.dim(`(${curtain.aligning.orbit})`)}`,
    `  Aurora Wisdom:        ${colorScore(curtain.auroraWisdom)}  ${chalk.dim(`(${curtain.understanding.magnetosphere})`)}`,
    '',
    `  Quality Score: ${colorScore(curtain.qualityScore)}  ${chalk.dim(`(${curtain.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatCurtainsTable(curtains) */
export function formatCurtainsTable(curtains: AuroraCurtain[]): string {
  if (curtains.length === 0) return chalk.dim('No aurora curtains found')
  const lines: string[] = [chalk.bold('Aurora Curtains'), '']
  for (const c of curtains) {
    lines.push(`  ${chalk.rgb(0, 200, 120)(c.file)}  Vit:${colorScore(c.greenVitality)}  Rad:${colorScore(c.northernRadiance)}  Score:${colorScore(c.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatBandTable(band) */
export function formatBandTable(band: AuroraBand): string {
  const lines: string[] = [
    chalk.bold(`Aurora Band: ${band.directory}`),
    '',
    `  Curtains:          ${band.curtains.length}`,
    `  Avg Vitality:      ${colorScore(band.avgVitality)}`,
    `  Avg Radiance:      ${colorScore(band.avgRadiance)}`,
    `  Avg Wisdom:        ${colorScore(band.avgWisdom)}`,
    `  Masterpieces:      ${band.auroraMasterpieceCount}`,
    `  Band Type:         ${colorBandType(band.bandType)}`,
    `  Condition:         ${colorBandCondition(band.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatBandsTable(bands) */
export function formatBandsTable(bands: AuroraBand[]): string {
  if (bands.length === 0) return chalk.dim('No aurora bands found')
  const lines: string[] = [chalk.bold('Aurora Bands'), '']
  for (const b of bands) {
    lines.push(`  ${chalk.rgb(0, 200, 120)(b.directory)}  ${colorScore(b.avgVitality)}  ${colorBandCondition(b.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldAuroraResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Aurora Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Bands:              ${stats.totalBands}`,
    `  Avg Green Vitality:       ${colorScore(stats.avgGreenVitality)}`,
    `  Avg Northern Radiance:    ${colorScore(stats.avgNorthernRadiance)}`,
    `  Avg Spectrum Clarity:     ${colorScore(stats.avgSpectrumClarity)}`,
    `  Avg Celestial Precision:  ${colorScore(stats.avgCelestialPrecision)}`,
    `  Avg Aurora Wisdom:        ${colorScore(stats.avgAuroraWisdom)}`,
    `  Aurora Masterpieces:      ${stats.auroraMasterpieceCount}`,
    `  Emerald Lights:           ${stats.emeraldLightsCount}`,
    `  Proper Aurora:            ${stats.properAuroraCount}`,
    `  Faint Glow:               ${stats.faintGlowCount}`,
    `  Dark Sky:                 ${stats.darkSkyCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Luminosity:       ${colorScore(stats.overallLuminosity)}`,
    `  Observer Grade:           ${colorObserverGrade(stats.observerGrade)}`,
    `  Best Curtain:             ${stats.bestCurtain || 'N/A'}`,
    `  Most Vital:               ${stats.mostVital || 'N/A'}`,
    `  Most Radiant:             ${stats.mostRadiant || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(0, 200, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldAuroraResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Aurora Analysis'),
    '',
    formatCurtainsTable(result.curtains),
    '',
    formatBandsTable(result.bands),
    '',
    chalk.bold('Sky Overview'),
    '',
    `  Avg Vitality:      ${colorScore(result.sky.avgVitality)}`,
    `  Avg Radiance:      ${colorScore(result.sky.avgRadiance)}`,
    `  Avg Wisdom:        ${colorScore(result.sky.avgWisdom)}`,
    `  Overall Luminosity: ${colorScore(result.sky.overallLuminosity)}`,
    `  Is Emerald:        ${result.sky.isEmerald ? chalk.rgb(0, 200, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldAuroraResult): string {
  return JSON.stringify(result, null, 2)
}
