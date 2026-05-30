import chalk from 'chalk'

import type { BedCondition, NeonBloom, NeonGardenResult, NeonBed } from './neon-grove-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(57, 255, 20)(String(score))
  if (score >= 75) return chalk.rgb(0, 255, 127)(String(score))
  if (score >= 60) return chalk.rgb(0, 230, 118)(String(score))
  if (score >= 40) return chalk.rgb(0, 200, 83)(String(score))
  if (score >= 20) return chalk.rgb(0, 150, 60)(String(score))
  return chalk.gray(String(score))
}

/** @example colorBedCondition('luminous-garden') */
export function colorBedCondition(condition: BedCondition | string): string {
  switch (condition) {
    case 'luminous-garden': return chalk.rgb(57, 255, 20)('luminous-garden')
    case 'glowing-oasis': return chalk.rgb(0, 255, 127)('glowing-oasis')
    case 'proper-plot': return chalk.rgb(0, 230, 118)('proper-plot')
    case 'dim-corner': return chalk.rgb(0, 200, 83)('dim-corner')
    case 'dark-void': return chalk.rgb(0, 150, 60)('dark-void')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBloomTable(bloom) */
export function formatBloomTable(bloom: NeonBloom): string {
  const lines: string[] = [
    chalk.bold(`Neon Bloom: ${bloom.file}`),
    '',
    `  Luminosity Quality:  ${colorScore(bloom.luminosityQuality)}  ${chalk.dim(`(${bloom.radiating.glow})`)}`,
    `  Structure Vibrancy:  ${colorScore(bloom.structureVibrancy)}  ${chalk.dim(`(${bloom.thriving.vitality})`)}`,
    `  Glow Consistency:    ${colorScore(bloom.glowConsistency)}  ${chalk.dim(`(${bloom.steady.pulse})`)}`,
    `  Bloom Diversity:     ${colorScore(bloom.bloomDiversity)}  ${chalk.dim(`(${bloom.diversifying.variety})`)}`,
    `  Root Brightness:     ${colorScore(bloom.rootBrightness)}  ${chalk.dim(`(${bloom.grounding.root})`)}`,
    '',
    `  Quality Score: ${colorScore(bloom.qualityScore)}  ${chalk.dim(`(${bloom.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBloomsTable(blooms) */
export function formatBloomsTable(blooms: NeonBloom[]): string {
  if (blooms.length === 0) return chalk.dim('No neon blooms found')
  const colWidths = {
    file: Math.max(4, ...blooms.map((b) => b.file.length)),
    lum: Math.max(4, ...blooms.map((b) => String(b.luminosityQuality).length)),
    vib: Math.max(4, ...blooms.map((b) => String(b.structureVibrancy).length)),
    con: Math.max(4, ...blooms.map((b) => String(b.glowConsistency).length)),
    div: Math.max(4, ...blooms.map((b) => String(b.bloomDiversity).length)),
    rt: Math.max(4, ...blooms.map((b) => String(b.rootBrightness).length)),
    score: Math.max(5, ...blooms.map((b) => String(b.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Neon Blooms'), '']
  const header =
    chalk.rgb(57, 255, 20)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Lum', colWidths.lum)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Vib', colWidths.vib)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Con', colWidths.con)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Div', colWidths.div)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Root', colWidths.rt)) + '  ' +
    chalk.rgb(57, 255, 20)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const b of blooms) {
    lines.push(
      padRight(b.file, colWidths.file) + '  ' +
      padLeft(String(b.luminosityQuality), colWidths.lum) + '  ' +
      padLeft(String(b.structureVibrancy), colWidths.vib) + '  ' +
      padLeft(String(b.glowConsistency), colWidths.con) + '  ' +
      padLeft(String(b.bloomDiversity), colWidths.div) + '  ' +
      padLeft(String(b.rootBrightness), colWidths.rt) + '  ' +
      padLeft(String(b.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatBedTable(bed) */
export function formatBedTable(bed: NeonBed): string {
  const lines: string[] = [
    chalk.bold(`Neon Bed: ${bed.directory}`),
    '',
    `  Blooms:            ${bed.blooms.length}`,
    `  Avg Luminosity:    ${colorScore(bed.avgLuminosity)}`,
    `  Avg Diversity:     ${colorScore(bed.avgDiversity)}`,
    `  Avg Brightness:    ${colorScore(bed.avgBrightness)}`,
    `  Masterpieces:      ${bed.neonMasterpieceCount}`,
    `  Bed Type:          ${bed.bedType}`,
    `  Condition:         ${colorBedCondition(bed.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatBedsTable(beds) */
export function formatBedsTable(beds: NeonBed[]): string {
  if (beds.length === 0) return chalk.dim('No neon beds found')
  const lines: string[] = [chalk.bold('Neon Beds'), '']
  for (const b of beds) {
    lines.push(`  ${chalk.rgb(57, 255, 20)(b.directory)}  ${colorScore(b.avgLuminosity)}  ${colorBedCondition(b.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: NeonGardenResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Neon Garden Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Beds:                ${stats.totalBeds}`,
    `  Avg Luminosity Quality:    ${colorScore(stats.avgLuminosityQuality)}`,
    `  Avg Structure Vibrancy:    ${colorScore(stats.avgStructureVibrancy)}`,
    `  Avg Glow Consistency:      ${colorScore(stats.avgGlowConsistency)}`,
    `  Avg Bloom Diversity:       ${colorScore(stats.avgBloomDiversity)}`,
    `  Avg Root Brightness:       ${colorScore(stats.avgRootBrightness)}`,
    `  Neon Masterpieces:         ${stats.neonMasterpieceCount}`,
    `  Bioluminescent Perfection: ${stats.bioluminescentPerfectionCount}`,
    `  Proper Glow:               ${stats.properGlowCount}`,
    `  Dim Light:                 ${stats.dimLightCount}`,
    `  Dark Corner:               ${stats.darkCornerCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Radiance:          ${colorScore(stats.overallRadiance)}`,
    `  Botanist Grade:            ${stats.botanistGrade}`,
    `  Best Bloom:                ${stats.bestBloom || 'N/A'}`,
    `  Most Luminous:             ${stats.mostLuminous || 'N/A'}`,
    `  Most Vibrant:              ${stats.mostVibrant || 'N/A'}`,
    `  Most Consistent:           ${stats.mostConsistent || 'N/A'}`,
    `  Most Diverse:              ${stats.mostDiverse || 'N/A'}`,
    `  Brightest:                 ${stats.brightest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(57, 255, 20)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: NeonGardenResult): string {
  const lines: string[] = [
    chalk.bold('Neon Garden Analysis'),
    '',
    formatBloomsTable(result.blooms),
    '',
    formatBedsTable(result.beds),
    '',
    chalk.bold('Ecosystem Overview'),
    '',
    `  Avg Luminosity:  ${colorScore(result.ecosystem.avgLuminosity)}`,
    `  Avg Diversity:   ${colorScore(result.ecosystem.avgDiversity)}`,
    `  Avg Brightness:  ${colorScore(result.ecosystem.avgBrightness)}`,
    `  Radiance:        ${colorScore(result.ecosystem.overallRadiance)}`,
    `  Is Neon:         ${result.ecosystem.isNeon ? chalk.rgb(57, 255, 20)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: NeonGardenResult): string {
  return JSON.stringify(result, null, 2)
}
