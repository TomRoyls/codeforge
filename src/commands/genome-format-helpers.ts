import chalk from 'chalk'

import {
  type Gene,
  type GeneType,
  type Genome,
  type GenomeResult,
  type GenomeStats,
  type SpeciesMatch,
} from './genome-helpers.js'

// ─── Color Map ────────────────────────────────────────────────────────────────

const GENE_TYPE_COLORS: Record<GeneType, (t: string) => string> = {
  structural: (t) => chalk.rgb(33, 150, 243)(t),
  naming: (t) => chalk.rgb(156, 39, 176)(t),
  'control-flow': (t) => chalk.rgb(255, 152, 0)(t),
  'error-handling': (t) => chalk.rgb(244, 67, 54)(t),
  async: (t) => chalk.rgb(0, 188, 212)(t),
  import: (t) => chalk.rgb(76, 175, 80)(t),
  export: (t) => chalk.rgb(139, 195, 74)(t),
  typing: (t) => chalk.rgb(121, 85, 72)(t),
}

/**
 * Get gene type color.
 *
 * @example
 * getGeneTypeColor('structural')
 */
export function getGeneTypeColor(type: GeneType): (t: string) => string {
  return GENE_TYPE_COLORS[type] ?? chalk.white
}

// ─── Similarity Meter ─────────────────────────────────────────────────────────

/**
 * Format similarity meter.
 *
 * @example
 * formatSimilarityMeter(75)
 */
export function formatSimilarityMeter(similarity: number): string {
  const filled = Math.round(similarity / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (similarity >= 80) colorFn = chalk.rgb(76, 175, 80)
  else if (similarity >= 50) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `  Similarity: ${bar} ${similarity}%`
}

// ─── Gene Row ─────────────────────────────────────────────────────────────────

/**
 * Format a gene row.
 *
 * @example
 * formatGeneRow(gene)
 */
export function formatGeneRow(gene: Gene): string {
  const colorFn = getGeneTypeColor(gene.type)
  const tag = gene.isDominant ? chalk.green('★') : gene.isMutation ? chalk.red('✧') : ' '
  const prev = `${gene.prevalence}%`.padStart(4)
  return `  ${tag} ${gene.name.padEnd(22)} F:${String(gene.frequency).padStart(4)} P:${prev} ${colorFn(gene.type)}`
}

// ─── Genome Map ───────────────────────────────────────────────────────────────

/**
 * Format the genome map.
 *
 * @example
 * formatGenomeMap(genome)
 */
export function formatGenomeMap(genome: Genome): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Genome Map:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  Tag  Gene                   Freq  Prev  Type'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))

  const sorted = [...genome.genes].sort((a, b) => b.frequency - a.frequency)
  for (const gene of sorted) {
    lines.push(formatGeneRow(gene))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Traits ───────────────────────────────────────────────────────────────────

/**
 * Format dominant traits.
 *
 * @example
 * formatDominantTraits(genome)
 */
export function formatDominantTraits(genome: Genome): string {
  const lines: string[] = []

  if (genome.dominantTraits.length > 0) {
    lines.push(chalk.bold('  Dominant Traits (prevalence >= 50%):'))
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const g of genome.dominantTraits) {
      lines.push(chalk.green(`  ★ ${g.name} — ${g.prevalence}% prevalence, ${g.frequency} occurrences`))
    }
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  }

  if (genome.recessiveTraits.length > 0) {
    lines.push(chalk.bold('  Recessive Traits (10-49% prevalence):'))
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const g of genome.recessiveTraits) {
      lines.push(chalk.dim(`  · ${g.name} — ${g.prevalence}% prevalence, ${g.frequency} occurrences`))
    }
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  }

  if (genome.mutations.length > 0) {
    lines.push(chalk.bold('  Mutations (<5% prevalence):'))
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
    for (const g of genome.mutations) {
      lines.push(chalk.red(`  ✧ ${g.name} — ${g.prevalence}% prevalence, ${g.frequency} occurrences`))
    }
    lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  }

  return lines.join('\n')
}

// ─── Species ──────────────────────────────────────────────────────────────────

/**
 * Format species classifications.
 *
 * @example
 * formatSpecies(species)
 */
export function formatSpecies(species: SpeciesMatch[]): string {
  if (species.length === 0) return chalk.dim('  No species classified.')
  const lines: string[] = []
  lines.push(chalk.bold('  Species Classification:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const s of species) {
    const simColor = s.similarity >= 70 ? chalk.green : s.similarity >= 40 ? chalk.yellow : chalk.red
    lines.push(`  ${simColor(s.species.padEnd(25))} ${s.file} (${s.similarity}% match)`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format genome stats.
 *
 * @example
 * formatGenomeStats(stats)
 */
export function formatGenomeStats(stats: GenomeStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Total genes: ${stats.totalGenes} | Dominant: ${stats.dominantCount} | Recessive: ${stats.recessiveCount} | Mutations: ${stats.mutationCount}`)
  lines.push(`  Similarity: ${stats.genomeSimilarity}% | Species: ${stats.speciesCount}`)
  lines.push(`  Most common: ${stats.mostCommonGene} | Rarest: ${stats.rarestGene}`)
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format the full genome result as table.
 *
 * @example
 * formatGenomeTable(result)
 */
export function formatGenomeTable(result: GenomeResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Genome Analysis\n'))
  sections.push(formatSimilarityMeter(result.genome.similarity))
  sections.push('')
  sections.push(formatGenomeMap(result.genome))
  sections.push('')
  sections.push(formatDominantTraits(result.genome))
  sections.push('')
  sections.push(formatSpecies(result.species))
  sections.push('')
  sections.push(formatGenomeStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format genome result as JSON.
 *
 * @example
 * formatGenomeJSON(result)
 */
export function formatGenomeJSON(result: GenomeResult): string {
  return JSON.stringify(result, null, 2)
}
