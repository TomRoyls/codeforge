import chalk from 'chalk'

import type {
  ConcernDecomposition,
  SpectralLayer,
  SpectrumProfile,
  SpectrumResult,
  SpectrumStats,
} from './spectrum-analysis-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function concernColor(concern: string): (text: string) => string {
  switch (concern) {
    case 'logic': return chalk.rgb(244, 67, 54)
    case 'dataFlow': return chalk.rgb(255, 152, 0)
    case 'errorHandling': return chalk.rgb(255, 235, 59)
    case 'typing': return chalk.rgb(76, 175, 80)
    case 'configuration': return chalk.rgb(33, 150, 243)
    case 'presentation': return chalk.rgb(63, 81, 181)
    case 'testing': return chalk.rgb(156, 39, 176)
    case 'orchestration': return chalk.rgb(158, 158, 158)
    default: return chalk.white
  }
}

function typeIcon(type: string): string {
  switch (type) {
    case 'pure': return chalk.rgb(76, 175, 80)('◆')
    case 'blend': return chalk.rgb(33, 150, 243)('◈')
    case 'white': return chalk.rgb(255, 255, 255)('○')
    case 'muddy': return chalk.rgb(121, 85, 72)('●')
    default: return '·'
  }
}

// ─── Spectrum Bar ──────────────────────────────────────────────────────────────

/**
 * Format spectrum bar for a file.
 *
 * @example
 * formatSpectrumBar(decomposition)
 */
export function formatSpectrumBar(decomp: ConcernDecomposition): string {
  const concerns = Object.entries(decomp.layers)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])

  const bar = concerns.map(([concern, value]) => {
    const blocks = Math.max(1, Math.round(value / 5))
    return concernColor(concern)('█'.repeat(blocks))
  }).join('')

  return `${typeIcon(decomp.type)} ${decomp.file.padEnd(30)} ${bar} ${decomp.purity}%`
}

// ─── Decompositions ────────────────────────────────────────────────────────────

/**
 * Format decompositions.
 *
 * @example
 * formatDecompositions(decompositions)
 */
export function formatDecompositions(decompositions: ConcernDecomposition[]): string {
  if (decompositions.length === 0) return chalk.gray('  No decompositions')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Concern Decomposition'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const d of decompositions.slice(0, 20)) {
    lines.push(formatSpectrumBar(d))
    const topConcerns = Object.entries(d.layers)
      .filter(([, v]) => v > 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    const detail = topConcerns.map(([c, v]) => `${concernColor(c)(`${c}:${v}%`)}`).join(' ')
    lines.push(`    ${detail}  type:${d.type} balance:${d.balance}%`)
  }

  if (decompositions.length > 20) {
    lines.push(chalk.gray(`  ... and ${decompositions.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Spectral Layers ───────────────────────────────────────────────────────────

/**
 * Format spectral layers.
 *
 * @example
 * formatSpectralLayers(layers)
 */
export function formatSpectralLayers(layers: SpectralLayer[]): string {
  if (layers.length === 0) return chalk.gray('  No layers')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Spectral Layers'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const layer of layers) {
    const bar = concernColor(layer.name)('█'.repeat(Math.max(1, Math.round(layer.intensity / 5))))
    lines.push(`  ${concernColor(layer.name)(layer.name.padEnd(16))} ${bar} ${layer.intensity}% (${layer.files.length} files)`)
  }

  return lines.join('\n')
}

// ─── Profiles ──────────────────────────────────────────────────────────────────

/**
 * Format profiles.
 *
 * @example
 * formatProfiles(profiles)
 */
export function formatProfiles(profiles: SpectrumProfile[]): string {
  if (profiles.length === 0) return chalk.gray('  No profiles')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Raw Intensity Profiles'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const p of profiles.slice(0, 10)) {
    lines.push(`  ${p.file}`)
    lines.push(`    Logic:${p.logic}% Data:${p.dataFlow}% Error:${p.errorHandling}% Type:${p.typing}%`)
    lines.push(`    Config:${p.configuration}% Pres:${p.presentation}% Test:${p.testing}% Orch:${p.orchestration}%`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format spectrum stats.
 *
 * @example
 * formatSpectrumStats(stats)
 */
export function formatSpectrumStats(stats: SpectrumStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Spectrum Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Files:          ${stats.totalFiles}`)
  lines.push(`  Pure Files:           ${stats.pureFiles}`)
  lines.push(`  Blend Files:          ${stats.blendFiles}`)
  lines.push(`  White Files:          ${stats.whiteFiles}`)
  lines.push(`  Muddy Files:          ${stats.muddyFiles}`)
  lines.push(`  Avg Purity:           ${stats.avgPurity}%`)
  lines.push(`  Avg Balance:          ${stats.avgBalance}%`)
  lines.push(`  Dominant Concern:     ${stats.dominantConcern}`)
  lines.push(`  Rarest Concern:       ${stats.rarestConcern}`)
  lines.push(`  Overall Purity:       ${stats.overallPurity}%`)
  lines.push(`  Spectrum Complete:    ${stats.spectrumCompleteness}%`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Separate concerns'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full spectrum result as table.
 *
 * @example
 * formatSpectrumTable(result)
 */
export function formatSpectrumTable(result: SpectrumResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Spectrum Analysis'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(formatDecompositions(result.decompositions))
  parts.push(formatSpectralLayers(result.layers))
  parts.push(formatSpectrumStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format full spectrum result as JSON.
 *
 * @example
 * formatSpectrumJSON(result)
 */
export function formatSpectrumJSON(result: SpectrumResult): string {
  return JSON.stringify(result, null, 2)
}
