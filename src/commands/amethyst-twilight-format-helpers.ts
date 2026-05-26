import chalk from 'chalk'

import type { AmethystCondition, AmethystGlow, AmethystSky, AmethystTwilightResult, PhilosopherGrade, SkyCondition, SkyType } from './amethyst-twilight-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(148, 103, 189)(String(score))
  if (score >= 75) return chalk.rgb(135, 90, 175)(String(score))
  if (score >= 60) return chalk.rgb(120, 78, 160)(String(score))
  if (score >= 40) return chalk.rgb(100, 65, 140)(String(score))
  if (score >= 20) return chalk.rgb(80, 52, 115)(String(score))
  return chalk.gray(String(score))
}

/** @example colorAmethystCondition('amethyst-masterpiece') */
export function colorAmethystCondition(condition: AmethystCondition | string): string {
  switch (condition) {
    case 'amethyst-masterpiece': return chalk.rgb(148, 103, 189)('amethyst-masterpiece')
    case 'violet-gem': return chalk.rgb(135, 90, 175)('violet-gem')
    case 'proper-amethyst': return chalk.rgb(120, 78, 160)('proper-amethyst')
    case 'pale-quartz': return chalk.rgb(100, 65, 140)('pale-quartz')
    case 'rough-stone': return chalk.rgb(80, 52, 115)('rough-stone')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorSkyType('purple-twilight') */
export function colorSkyType(type: SkyType | string): string {
  switch (type) {
    case 'purple-twilight': return chalk.rgb(148, 103, 189)('purple-twilight')
    case 'violet-dusk': return chalk.rgb(135, 90, 175)('violet-dusk')
    case 'proper-evening': return chalk.rgb(120, 78, 160)('proper-evening')
    case 'gray-dawn': return chalk.rgb(100, 65, 140)('gray-dawn')
    case 'dark-night': return chalk.rgb(80, 52, 115)('dark-night')
    case 'no-sky': return chalk.gray('no-sky')
    default: return chalk.gray(String(type))
  }
}

/** @example colorSkyCondition('amethyst-palace') */
export function colorSkyCondition(condition: SkyCondition | string): string {
  switch (condition) {
    case 'amethyst-palace': return chalk.rgb(148, 103, 189)('amethyst-palace')
    case 'violet-tower': return chalk.rgb(135, 90, 175)('violet-tower')
    case 'proper-temple': return chalk.rgb(120, 78, 160)('proper-temple')
    case 'stone-chapel': return chalk.rgb(100, 65, 140)('stone-chapel')
    case 'wooden-shack': return chalk.rgb(80, 52, 115)('wooden-shack')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorPhilosopherGrade('mystic-sage') */
export function colorPhilosopherGrade(grade: PhilosopherGrade | string): string {
  switch (grade) {
    case 'mystic-sage': return chalk.rgb(148, 103, 189)('mystic-sage')
    case 'twilight-scholar': return chalk.rgb(135, 90, 175)('twilight-scholar')
    case 'proper-observer': return chalk.rgb(120, 78, 160)('proper-observer')
    case 'apprentice': return chalk.rgb(100, 65, 140)('apprentice')
    case 'novice': return chalk.rgb(80, 52, 115)('novice')
    case 'daydreamer': return chalk.gray('daydreamer')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatGlowTable(glow) */
export function formatGlowTable(glow: AmethystGlow): string {
  const lines: string[] = [
    chalk.bold(`Amethyst Glow: ${glow.file}`),
    '',
    `  Violet Serenity:    ${colorScore(glow.violetSerenity)}  ${chalk.dim(`(${glow.calming.peace})`)}`,
    `  Twilight Clarity:   ${colorScore(glow.twilightClarity)}  ${chalk.dim(`(${glow.revealing.vision})`)}`,
    `  Dusk Precision:     ${colorScore(glow.duskPrecision)}  ${chalk.dim(`(${glow.honing.edge})`)}`,
    `  Evening Resilience: ${colorScore(glow.eveningResilience)}  ${chalk.dim(`(${glow.surviving.night})`)}`,
    `  Purple Wisdom:      ${colorScore(glow.purpleWisdom)}  ${chalk.dim(`(${glow.understanding.depth})`)}`,
    '',
    `  Quality Score: ${colorScore(glow.qualityScore)}  ${chalk.dim(`(${glow.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatGlowsTable(glows) */
export function formatGlowsTable(glows: AmethystGlow[]): string {
  if (glows.length === 0) return chalk.dim('No amethyst glows found')
  const lines: string[] = [chalk.bold('Amethyst Glows'), '']
  for (const g of glows) {
    lines.push(`  ${chalk.rgb(148, 103, 189)(g.file)}  Ser:${colorScore(g.violetSerenity)}  Cla:${colorScore(g.twilightClarity)}  Score:${colorScore(g.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatSkyTable(sky) */
export function formatSkyTable(sky: AmethystSky): string {
  const lines: string[] = [
    chalk.bold(`Amethyst Sky: ${sky.directory}`),
    '',
    `  Glows:           ${sky.glows.length}`,
    `  Avg Serenity:    ${colorScore(sky.avgSerenity)}`,
    `  Avg Precision:   ${colorScore(sky.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(sky.avgWisdom)}`,
    `  Masterpieces:    ${sky.amethystMasterpieceCount}`,
    `  Type:            ${colorSkyType(sky.skyType)}`,
    `  Condition:       ${colorSkyCondition(sky.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatSkiesTable(skies) */
export function formatSkiesTable(skies: AmethystSky[]): string {
  if (skies.length === 0) return chalk.dim('No amethyst skies found')
  const lines: string[] = [chalk.bold('Amethyst Skies'), '']
  for (const s of skies) {
    lines.push(`  ${chalk.rgb(148, 103, 189)(s.directory)}  ${colorScore(s.avgSerenity)}  ${colorSkyCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AmethystTwilightResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Amethyst Twilight Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Skies:            ${stats.totalSkies}`,
    `  Avg Violet Serenity:    ${colorScore(stats.avgVioletSerenity)}`,
    `  Avg Twilight Clarity:   ${colorScore(stats.avgTwilightClarity)}`,
    `  Avg Dusk Precision:     ${colorScore(stats.avgDuskPrecision)}`,
    `  Avg Evening Resilience: ${colorScore(stats.avgEveningResilience)}`,
    `  Avg Purple Wisdom:      ${colorScore(stats.avgPurpleWisdom)}`,
    `  Amethyst Masterpieces:  ${stats.amethystMasterpieceCount}`,
    `  Violet Gems:            ${stats.violetGemCount}`,
    `  Proper Amethyst:        ${stats.properAmethystCount}`,
    `  Pale Quartz:            ${stats.paleQuartzCount}`,
    `  Rough Stone:            ${stats.roughStoneCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Serenity:       ${colorScore(stats.overallSerenity)}`,
    `  Philosopher Grade:      ${colorPhilosopherGrade(stats.philosopherGrade)}`,
    `  Best Glow:              ${stats.bestGlow || 'N/A'}`,
    `  Most Serene:            ${stats.mostSerene || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(148, 103, 189)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AmethystTwilightResult): string {
  const lines: string[] = [
    chalk.bold('Amethyst Twilight Analysis'),
    '',
    formatGlowsTable(result.glows),
    '',
    formatSkiesTable(result.skies),
    '',
    chalk.bold('Dusk Overview'),
    '',
    `  Avg Serenity:       ${colorScore(result.dusk.avgSerenity)}`,
    `  Avg Precision:      ${colorScore(result.dusk.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(result.dusk.avgWisdom)}`,
    `  Overall Serenity:   ${colorScore(result.dusk.overallSerenity)}`,
    `  Is Amethyst:        ${result.dusk.isAmethyst ? chalk.rgb(148, 103, 189)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AmethystTwilightResult): string {
  return JSON.stringify(result, null, 2)
}
