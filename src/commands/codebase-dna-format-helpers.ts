import chalk from 'chalk'

import type { DnaResult, DnaStats, DnaStrand, BasePair, GeneticMarker } from './codebase-dna-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────────

function buildBar(value: number, width = 10): string {
  const filled = Math.round(value / (100 / width))
  const empty = width - filled
  return '\u2588'.repeat(Math.max(filled, 0)) + '\u2591'.repeat(Math.max(empty, 0))
}

const typeColor: Record<string, (s: string) => string> = {
  structural: (s: string) => chalk.rgb(52, 152, 219)(s),
  control: (s: string) => chalk.rgb(231, 76, 60)(s),
  async: (s: string) => chalk.rgb(46, 204, 113)(s),
  error: (s: string) => chalk.rgb(243, 156, 18)(s),
  import: (s: string) => chalk.rgb(155, 89, 182)(s),
  export: (s: string) => chalk.rgb(241, 196, 15)(s),
  type: (s: string) => chalk.rgb(26, 188, 156)(s),
}

// ─── DNA Sequence Visualization ────────────────────────────────────────────────

/**
 * Format DNA sequence visualization.
 *
 * @example
 * formatSequenceVisualization(strands)
 */
export function formatSequenceVisualization(strands: DnaStrand[]): string {
  if (strands.length === 0) return '  No strands to visualize\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  DNA Strands')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const s of strands.slice(0, 15)) {
    const seq = s.sequence.slice(0, 3).map((c) => c.bases.join('-')).join(' ')
       const mutLabel = s.mutations > 0 ? chalk.rgb(231, 76, 60)(` [${s.mutations} mutations]`) : ''
    lines.push(`  \u{1F9EC} ${chalk.bold(s.file)} \u2014 ${s.length} codons, GC=${s.gcContent}%${mutLabel}`)
    if (seq) lines.push(`     ${chalk.gray(seq)}...`)
  }

  return lines.join('\n')
}

// ─── Base Pair Frequency ───────────────────────────────────────────────────────

/**
 * Format base pair frequency chart.
 *
 * @example
 * formatBasePairFrequency(basePairs)
 */
export function formatBasePairFrequency(basePairs: BasePair[]): string {
  if (basePairs.length === 0) return '  No base pairs detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Base Pair Frequency')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = [...basePairs].sort((a, b) => b.frequency - a.frequency)
  const maxFreq = sorted[0]?.frequency ?? 1
  for (const bp of sorted.slice(0, 20)) {
    const colorFn = typeColor[bp.type] ?? chalk.white
    const barWidth = Math.round((bp.frequency / maxFreq) * 20)
    const bar = '\u2588'.repeat(Math.max(barWidth, 0))
    lines.push(`  ${colorFn(`${bp.left}-${bp.right}`.padEnd(18))} ${colorFn(bar)} ${bp.frequency} (${bp.type})`)
  }

  return lines.join('\n')
}

// ─── Codon Table ───────────────────────────────────────────────────────────────

/**
 * Format codon table.
 *
 * @example
 * formatCodonTable(result)
 */
export function formatCodonTable(result: DnaResult): string {
  const allCodons = new Map<string, { bases: string[]; freq: number; dominant: boolean; mutation: boolean }>()
  for (const strand of result.strands) {
    for (const codon of strand.sequence) {
      const existing = allCodons.get(codon.description)
      if (existing) {
        existing.freq += codon.frequency
      } else {
        allCodons.set(codon.description, {
          bases: codon.bases, freq: codon.frequency,
          dominant: codon.isDominant, mutation: codon.isMutation,
        })
      }
    }
  }

  if (allCodons.size === 0) return '  No codons detected\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Codon Table')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  const sorted = Array.from(allCodons.entries()).sort((a, b) => b[1].freq - a[1].freq)
  for (const [, val] of sorted.slice(0, 15)) {
    const label = val.bases.join(' \u2192 ')
    const tags: string[] = []
    if (val.dominant) tags.push(chalk.rgb(46, 204, 113)('dominant'))
    if (val.mutation) tags.push(chalk.rgb(231, 76, 60)('mutation'))
    const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : ''
    lines.push(`  ${label.padEnd(30)} \u00D7${val.freq}${tagStr}`)
  }

  return lines.join('\n')
}

// ─── Genetic Markers ───────────────────────────────────────────────────────────

/**
 * Format genetic markers.
 *
 * @example
 * formatGeneticMarkers(markers)
 */
export function formatGeneticMarkers(markers: GeneticMarker[]): string {
  if (markers.length === 0) return '  No genetic markers found\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Genetic Markers')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (const m of markers) {
    lines.push(`  \u{1F3AF} ${chalk.bold(m.pattern)} \u2014 ${m.description}`)
    lines.push(`     Uniqueness: ${buildBar(m.uniqueness)} ${m.uniqueness}%`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format DNA stats.
 *
 * @example
 * formatDnaStats(stats)
 */
export function formatDnaStats(stats: DnaStats): string {
  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  DNA Stats')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push(`  Total Strands:        ${stats.totalStrands}`)
  lines.push(`  Total Base Pairs:     ${stats.totalBasePairs}`)
  lines.push(`  Total Codons:         ${stats.totalCodons}`)
  lines.push(`  Dominant Sequence:    ${chalk.bold(stats.dominantSequence)}`)
  lines.push(`  Mutation Rate:        ${stats.mutationRate}%`)
  lines.push(`  Avg Similarity:       ${buildBar(stats.avgSimilarity)} ${stats.avgSimilarity}%`)
  lines.push(`  GC Content:           ${buildBar(stats.gcContent)} ${stats.gcContent}%`)
  lines.push(`  Marker Count:         ${stats.markerCount}`)
  lines.push(`  Unique Markers:       ${stats.uniqueMarkers}`)
  lines.push(`  Genetic Diversity:    ${stats.geneticDiversity}%`)
  lines.push(`  Health Score:         ${buildBar(stats.healthScore)} ${chalk.bold(`${stats.healthScore}%`)}`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format DNA recommendations.
 *
 * @example
 * formatDnaRecommendations(recs)
 */
export function formatDnaRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  lines.push('  Recommendations')
  lines.push('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format complete DNA result as table.
 *
 * @example
 * formatDnaTable(result)
 */
export function formatDnaTable(result: DnaResult): string {
  const parts: string[] = []
  parts.push(`  \u{1F9EC} ${chalk.bold('DNA Sequencing')} \u2014 ${result.stats.totalStrands} strands, ${result.stats.totalCodons} codons, health ${result.stats.healthScore}%`)
  parts.push('')
  parts.push(formatSequenceVisualization(result.strands))
  parts.push('')
  parts.push(formatBasePairFrequency(result.basePairs))
  parts.push('')
  parts.push(formatCodonTable(result))
  parts.push('')
  parts.push(formatGeneticMarkers(result.markers))
  parts.push('')
  parts.push(formatDnaStats(result.stats))
  parts.push('')
  parts.push(formatDnaRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format DNA result as JSON.
 *
 * @example
 * formatDnaJSON(result)
 */
export function formatDnaJSON(result: DnaResult): string {
  return JSON.stringify(result, null, 2)
}
