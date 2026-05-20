import chalk from 'chalk'

import type {
  Classification,
  Taxon,
  TaxonomyResult,
  TaxonomyStats,
} from './taxonomist-helpers.js'

// ─── Rank Colors ──────────────────────────────────────────────────────────────

const RANK_COLORS: Record<string, (t: string) => string> = {
  kingdom: (t) => chalk.rgb(255, 193, 7)(t),
  phylum: (t) => chalk.rgb(76, 175, 80)(t),
  class: (t) => chalk.rgb(33, 150, 243)(t),
  order: (t) => chalk.rgb(156, 39, 176)(t),
  family: (t) => chalk.rgb(255, 152, 0)(t),
  genus: (t) => chalk.rgb(0, 188, 212)(t),
  species: (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Get color for a taxon rank.
 *
 * @example
 * getRankColor('kingdom')
 */
export function getRankColor(rank: string): (t: string) => string {
  return RANK_COLORS[rank] ?? chalk.white
}

// ─── Taxonomy Tree ────────────────────────────────────────────────────────────

/**
 * Format taxonomy as ASCII tree.
 *
 * @example
 * formatTaxonomyTree(taxon)
 */
export function formatTaxonomyTree(taxon: Taxon, prefix: string = '', isLast: boolean = true): string {
  const lines: string[] = []
  const connector = isLast ? '└── ' : '├── '
  const colorFn = getRankColor(taxon.rank)
  const badge = colorFn(`[${taxon.rank.charAt(0).toUpperCase() + taxon.rank.slice(1)}]`)

  if (prefix === '') {
    lines.push(chalk.bold('  Taxonomy Tree:'))
    lines.push(chalk.gray('  ──────────────────────────────────────────'))
    lines.push(`  ${colorFn(taxon.name)} ${badge} (${taxon.fileCount} files)`)
  } else {
    lines.push(`  ${prefix}${connector}${colorFn(taxon.name)} ${badge} (${taxon.fileCount})`)
  }

  const childPrefix = prefix + (isLast ? '    ' : '│   ')
  for (let i = 0; i < taxon.children.length; i++) {
    const child = taxon.children[i]!
    const childIsLast = i === taxon.children.length - 1
    lines.push(formatTaxonomyTree(child, childPrefix, childIsLast))
  }

  if (prefix === '') {
    lines.push(chalk.gray('  ──────────────────────────────────────────'))
  }

  return lines.join('\n')
}

// ─── Classification Table ─────────────────────────────────────────────────────

/**
 * Format classification table.
 *
 * @example
 * formatClassificationTable(classifications)
 */
export function formatClassificationTable(classifications: Classification[]): string {
  if (classifications.length === 0) return chalk.dim('  No classifications.')
  const lines: string[] = []
  lines.push(chalk.bold('  Classifications:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────'))
  lines.push(chalk.gray('  File                     Kingdom    Phylum     Class       Order      Conf'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────'))

  const sorted = [...classifications].sort((a, b) => b.confidence - a.confidence)
  for (const cls of sorted) {
    const name = cls.file.length > 24 ? '...' + cls.file.slice(-21) : cls.file
    const confColor = cls.confidence >= 70 ? chalk.green : cls.confidence >= 50 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    lines.push(
      `  ${name.padEnd(25)}${cls.taxonomy.kingdom.padEnd(11)}${cls.taxonomy.phylum.padEnd(11)}${cls.taxonomy.class.padEnd(12)}${cls.taxonomy.order.padEnd(11)}${confColor(String(cls.confidence) + '%')}`,
    )
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Similarity Pairs ─────────────────────────────────────────────────────────

/**
 * Format similarity pairs.
 *
 * @example
 * formatSimilarityPairs(classifications)
 */
export function formatSimilarityPairs(classifications: Classification[]): string {
  if (classifications.length === 0) return chalk.dim('  No similarity data.')

  const lines: string[] = []
  lines.push(chalk.bold('  Closest Relatives:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))

  const sorted = [...classifications].sort((a, b) => b.similarity - a.similarity)
  const shown = sorted.slice(0, 15)
  for (const cls of shown) {
    if (cls.closestRelative) {
      const simColor = cls.similarity >= 70 ? chalk.green : cls.similarity >= 40 ? chalk.rgb(255, 193, 7) : chalk.dim
      lines.push(`  ${cls.file} ↔ ${cls.closestRelative} ${simColor(cls.similarity + '%')}`)
    }
  }

  if (sorted.length > 15) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 15} more pairs`))
  }

  lines.push(chalk.gray('  ──────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Coverage Score ───────────────────────────────────────────────────────────

/**
 * Format coverage score meter.
 *
 * @example
 * formatCoverageScore(85)
 */
export function formatCoverageScore(score: number): string {
  const filled = Math.round(score / 5)
  const empty = 20 - filled
  let colorFn: (t: string) => string
  if (score >= 80) colorFn = chalk.green
  else if (score >= 50) colorFn = chalk.rgb(255, 193, 7)
  else colorFn = chalk.rgb(244, 67, 54)
  const bar = colorFn('█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0)))
  return `${bar} ${score}%`
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format taxonomy stats.
 *
 * @example
 * formatTaxonomyStats(stats)
 */
export function formatTaxonomyStats(stats: TaxonomyStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Taxonomy Stats:'))
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
  lines.push(`  Total files: ${stats.totalFiles} | Total taxa: ${stats.totalTaxa}`)
  lines.push(`  Tree depth: ${stats.depth} levels | Avg group size: ${stats.avgGroupSize}`)
  lines.push(`  Largest group: ${stats.largestGroup}`)
  lines.push(`  Smallest group: ${stats.smallestGroup}`)
  lines.push(`  Coverage: ${formatCoverageScore(stats.coverageScore)}`)
  lines.push(`  Orphans (low confidence): ${stats.orphanCount}`)
  lines.push(chalk.gray('  ──────────────────────────────────────────'))
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
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ───────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format full taxonomist table.
 *
 * @example
 * formatTaxonomistTable(result)
 */
export function formatTaxonomistTable(result: TaxonomyResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Code Taxonomist — Classification System\n'))
  sections.push(formatTaxonomyTree(result.taxonomy))
  sections.push('')
  sections.push(formatClassificationTable(result.classifications))
  sections.push('')
  sections.push(formatSimilarityPairs(result.classifications))
  sections.push('')
  sections.push(formatTaxonomyStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

/**
 * Format taxonomist result as JSON.
 *
 * @example
 * formatTaxonomistJSON(result)
 */
export function formatTaxonomistJSON(result: TaxonomyResult): string {
  return JSON.stringify(result, null, 2)
}
