import chalk from 'chalk'

import type { ArtifactCondition, MountainCondition, AmberArtifact, AmberMountain, AmberPeakResult } from './amber-peak-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(218, 165, 32)(String(score))
  if (score >= 75) return chalk.rgb(255, 193, 37)(String(score))
  if (score >= 60) return chalk.rgb(205, 133, 63)(String(score))
  if (score >= 40) return chalk.rgb(184, 134, 11)(String(score))
  if (score >= 20) return chalk.rgb(139, 119, 42)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('amber-masterpiece') */
export function colorCondition(condition: ArtifactCondition | string): string {
  switch (condition) {
    case 'amber-masterpiece':
      return chalk.rgb(218, 165, 32)('amber-masterpiece')
    case 'golden-summit':
      return chalk.rgb(255, 193, 37)('golden-summit')
    case 'proper-fossil':
      return chalk.rgb(205, 133, 63)('proper-fossil')
    case 'dull-resin':
      return chalk.rgb(184, 134, 11)('dull-resin')
    case 'raw-sap':
      return chalk.rgb(139, 119, 42)('raw-sap')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorMountainCondition('amber-summit') */
export function colorMountainCondition(condition: MountainCondition | string): string {
  switch (condition) {
    case 'amber-summit':
      return chalk.rgb(218, 165, 32)('amber-summit')
    case 'golden-ridge':
      return chalk.rgb(255, 193, 37)('golden-ridge')
    case 'proper-trail':
      return chalk.rgb(205, 133, 63)('proper-trail')
    case 'rocky-path':
      return chalk.rgb(184, 134, 11)('rocky-path')
    case 'barren-slope':
      return chalk.rgb(139, 119, 42)('barren-slope')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
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

/** @example formatArtifactTable(artifact) */
export function formatArtifactTable(artifact: AmberArtifact): string {
  const lines: string[] = [
    chalk.bold(`Amber Artifact: ${artifact.file}`),
    '',
    `  Preservation Power: ${colorScore(artifact.preservationPower)}  ${chalk.dim(`(${artifact.preserving.preservation})`)}`,
    `  Golden Elevation:   ${colorScore(artifact.goldenElevation)}  ${chalk.dim(`(${artifact.ascending.ascent})`)}`,
    `  Resin Fortitude:    ${colorScore(artifact.resinFortitude)}  ${chalk.dim(`(${artifact.hardening.hardness})`)}`,
    `  Peak Clarity:       ${colorScore(artifact.peakClarity)}  ${chalk.dim(`(${artifact.viewing.perspective})`)}`,
    `  Ancient Wisdom:     ${colorScore(artifact.ancientWisdom)}  ${chalk.dim(`(${artifact.accumulating.antiquity})`)}`,
    '',
    `  Quality Score: ${colorScore(artifact.qualityScore)}  ${chalk.dim(`(${colorCondition(artifact.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatArtifactsTable(artifacts) */
export function formatArtifactsTable(artifacts: AmberArtifact[]): string {
  if (artifacts.length === 0) return chalk.dim('No amber artifacts found')

  const colWidths = {
    file: Math.max(4, ...artifacts.map((a) => a.file.length)),
    pres: Math.max(3, ...artifacts.map((a) => String(a.preservationPower).length)),
    elev: Math.max(3, ...artifacts.map((a) => String(a.goldenElevation).length)),
    fort: Math.max(3, ...artifacts.map((a) => String(a.resinFortitude).length)),
    clar: Math.max(3, ...artifacts.map((a) => String(a.peakClarity).length)),
    wis: Math.max(3, ...artifacts.map((a) => String(a.ancientWisdom).length)),
    score: Math.max(5, ...artifacts.map((a) => String(a.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Amber Artifacts'), '']

  const header =
    chalk.rgb(218, 165, 32)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Pres', colWidths.pres)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Elev', colWidths.elev)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Fort', colWidths.fort)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(218, 165, 32)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const a of artifacts) {
    lines.push(
      padRight(a.file, colWidths.file) +
        '  ' +
        padLeft(String(a.preservationPower), colWidths.pres) +
        '  ' +
        padLeft(String(a.goldenElevation), colWidths.elev) +
        '  ' +
        padLeft(String(a.resinFortitude), colWidths.fort) +
        '  ' +
        padLeft(String(a.peakClarity), colWidths.clar) +
        '  ' +
        padLeft(String(a.ancientWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(a.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatMountainTable(mountain) */
export function formatMountainTable(mountain: AmberMountain): string {
  const lines: string[] = [
    chalk.bold(`Amber Mountain: ${mountain.directory}`),
    '',
    `  Artifacts:       ${mountain.artifacts.length}`,
    `  Avg Preservation: ${colorScore(mountain.avgPreservation)}`,
    `  Avg Elevation:   ${colorScore(mountain.avgElevation)}`,
    `  Avg Wisdom:      ${colorScore(mountain.avgWisdom)}`,
    `  Masterpieces:    ${mountain.amberMasterpieceCount}`,
    `  Mountain Type:   ${mountain.mountainType}`,
    `  Condition:       ${colorMountainCondition(mountain.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatMountainsTable(mountains) */
export function formatMountainsTable(mountains: AmberMountain[]): string {
  if (mountains.length === 0) return chalk.dim('No amber mountains found')

  const lines: string[] = [chalk.bold('Amber Mountains'), '']

  for (const m of mountains) {
    lines.push(
      `  ${chalk.rgb(218, 165, 32)(m.directory)}  ${colorScore(m.avgPreservation)}  ${colorMountainCondition(m.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AmberPeakResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Amber Peak Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Mountains:       ${stats.totalMountains}`,
    `  Avg Preservation Power: ${colorScore(stats.avgPreservationPower)}`,
    `  Avg Golden Elevation:  ${colorScore(stats.avgGoldenElevation)}`,
    `  Avg Resin Fortitude:   ${colorScore(stats.avgResinFortitude)}`,
    `  Avg Peak Clarity:      ${colorScore(stats.avgPeakClarity)}`,
    `  Avg Ancient Wisdom:    ${colorScore(stats.avgAncientWisdom)}`,
    `  Amber Masterpieces:    ${stats.amberMasterpieceCount}`,
    `  Golden Summits:        ${stats.goldenSummitCount}`,
    `  Proper Fossils:        ${stats.properFossilCount}`,
    `  Dull Resin:            ${stats.dullResinCount}`,
    `  Raw Sap:               ${stats.rawSapCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Climber Grade:         ${stats.climberGrade}`,
    `  Best Artifact:         ${stats.bestArtifact || 'N/A'}`,
    `  Best Preserved:        ${stats.bestPreserved || 'N/A'}`,
    `  Highest:               ${stats.highest || 'N/A'}`,
    `  Most Fortified:        ${stats.mostFortified || 'N/A'}`,
    `  Clearest:              ${stats.clearest || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(218, 165, 32)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AmberPeakResult): string {
  const lines: string[] = [
    chalk.bold('Amber Peak Analysis'),
    '',
    formatArtifactsTable(result.artifacts),
    '',
    formatMountainsTable(result.mountains),
    '',
    chalk.bold('Range Overview'),
    '',
    `  Avg Preservation: ${colorScore(result.range.avgPreservation)}`,
    `  Avg Elevation:    ${colorScore(result.range.avgElevation)}`,
    `  Avg Wisdom:       ${colorScore(result.range.avgWisdom)}`,
    `  Brilliance:       ${colorScore(result.range.overallBrilliance)}`,
    `  Is Amber:         ${result.range.isAmber ? chalk.rgb(218, 165, 32)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AmberPeakResult): string {
  return JSON.stringify(result, null, 2)
}
