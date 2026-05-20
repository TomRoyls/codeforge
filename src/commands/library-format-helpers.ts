import chalk from 'chalk'

import type { CatalogEntry, Collection, LibraryResult, LibraryStats, Shelf } from './library-helpers.js'

// ─── Call Number Legend ─────────────────────────────────────────────────────────

/**
 * Format call number system legend.
 *
 * @example
 * formatCallNumberLegend()
 */
export function formatCallNumberLegend(): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Call Number System'))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`  ${chalk.rgb(100, 149, 237)('CMD')} 100-199  Command files`)
  lines.push(`  ${chalk.rgb(155, 176, 237)('UTL')} 200-299  Utility files`)
  lines.push(`  ${chalk.rgb(255, 215, 0)('COR')} 300-399  Core infrastructure`)
  lines.push(`  ${chalk.rgb(76, 175, 80)('TST')} 400-499  Test files`)
  lines.push(`  ${chalk.rgb(156, 39, 176)('TYP')} 500-599  Type definitions`)
  lines.push(`  ${chalk.rgb(255, 152, 0)('CFG')} 600-699  Configuration`)
  lines.push(`  ${chalk.rgb(244, 67, 54)('FMT')} 700-799  Format helpers`)
  return lines.join('\n')
}

// ─── Catalog Table ──────────────────────────────────────────────────────────────

/**
 * Format catalog entries table.
 *
 * @example
 * formatCatalogTable(catalog)
 */
export function formatCatalogTable(catalog: CatalogEntry[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Library Catalog'))
  lines.push(chalk.gray('  ─'.repeat(60)))

  if (catalog.length === 0) {
    lines.push(chalk.gray('  Catalog is empty'))
    return lines.join('\n')
  }

  const sorted = [...catalog].sort((a, b) => a.callNumber.localeCompare(b.callNumber))
  for (const entry of sorted.slice(0, 25)) {
    const avail = entry.available ? chalk.rgb(76, 175, 80)('✓') : chalk.rgb(244, 67, 54)('✗')
    const cond = conditionIcon(entry.condition)
    const rl = readingLevelBadge(entry.readingLevel)
    const genre = genreBadge(entry.genre)
    lines.push(`  ${chalk.bold(entry.callNumber)}  ${entry.title.padEnd(20).slice(0, 20)}  ${genre}  ${rl}  ${cond}  ${avail}  p.${entry.pages}  c.${entry.citations}`)
  }

  if (catalog.length > 25) {
    lines.push(chalk.gray(`  ... and ${catalog.length - 25} more entries`))
  }

  return lines.join('\n')
}

function conditionIcon(c: string): string {
  switch (c) {
    case 'mint': return chalk.rgb(76, 175, 80)('★')
    case 'good': return chalk.rgb(139, 195, 74)('●')
    case 'fair': return chalk.rgb(255, 193, 7)('◐')
    case 'worn': return chalk.rgb(255, 152, 0)('◑')
    case 'damaged': return chalk.rgb(244, 67, 54)('✗')
    default: return chalk.gray('?')
  }
}

function readingLevelBadge(r: string): string {
  switch (r) {
    case 'beginner': return chalk.rgb(76, 175, 80)('BG')
    case 'intermediate': return chalk.rgb(255, 193, 7)('IM')
    case 'advanced': return chalk.rgb(255, 152, 0)('AD')
    case 'expert': return chalk.rgb(244, 67, 54)('EX')
    default: return chalk.gray('??')
  }
}

function genreBadge(g: string): string {
  switch (g) {
    case 'reference': return chalk.rgb(156, 39, 176)('REF')
    case 'textbook': return chalk.rgb(33, 150, 243)('TBK')
    case 'novel': return chalk.rgb(76, 175, 80)('NVL')
    case 'encyclopedia': return chalk.rgb(255, 215, 0)('ENC')
    case 'manual': return chalk.rgb(255, 152, 0)('MAN')
    case 'journal': return chalk.rgb(0, 188, 212)('JRN')
    case 'pamphlet': return chalk.rgb(158, 158, 158)('PMP')
    default: return chalk.gray('???')
  }
}

// ─── Shelves ───────────────────────────────────────────────────────────────────

/**
 * Format shelf listing.
 *
 * @example
 * formatShelves(shelves)
 */
export function formatShelves(shelves: Shelf[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Shelves'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (shelves.length === 0) {
    lines.push(chalk.gray('  No shelves'))
    return lines.join('\n')
  }

  for (const shelf of shelves) {
    const fill = Math.round(shelf.fillLevel / 5)
    const bar = '█'.repeat(fill) + '░'.repeat(20 - fill)
    lines.push(`  ${chalk.bold(shelf.name.padEnd(20))} ${chalk.bold(shelf.callNumberPrefix)}  (${shelf.entries.length} entries)  ${bar} ${shelf.fillLevel}%`)
    lines.push(chalk.gray(`    genre: ${shelf.genre}  pages: ${shelf.totalPages}  condition: ${shelf.avgCondition}`))
  }

  return lines.join('\n')
}

// ─── Collections ───────────────────────────────────────────────────────────────

/**
 * Format collections.
 *
 * @example
 * formatCollections(collections)
 */
export function formatCollections(collections: Collection[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Collections'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (collections.length === 0) {
    lines.push(chalk.gray('  No collections'))
    return lines.join('\n')
  }

  for (const col of collections) {
    const comp = Math.round(col.completeness / 5)
    const bar = '█'.repeat(comp) + '░'.repeat(20 - comp)
    lines.push(`  ${chalk.bold(col.name.padEnd(15))} (${col.size} entries)  reading: ${col.avgReadingLevel}  ${bar} ${col.completeness}%`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format library statistics.
 *
 * @example
 * formatLibraryStats(stats)
 */
export function formatLibraryStats(stats: LibraryStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Library Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Entries: ${stats.totalEntries}  Pages: ${stats.totalPages}  Avg: ${stats.avgPages}`)
  lines.push(`  Available: ${chalk.rgb(76, 175, 80)(String(stats.availableCount))}  Unavailable: ${chalk.rgb(244, 67, 54)(String(stats.unavailableCount))}`)
  lines.push(`  Beginner: ${stats.beginnerCount}  Expert: ${stats.expertCount}`)
  lines.push(`  Mint: ${stats.mintConditionCount}  Damaged: ${stats.damagedCount}`)
  lines.push(`  Most Cited: ${stats.mostCited}  Least Cited: ${stats.leastCited}`)
  lines.push(`  Largest Shelf: ${stats.largestShelf}`)
  lines.push(`  Collections: ${stats.collectionCount}`)
  lines.push(`  Catalog Completeness: ${stats.catalogCompleteness}%`)
  lines.push(`  Organization Score: ${stats.organizationScore}%`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatLibraryRecommendations(['Repair damaged entries'])
 */
export function formatLibraryRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(139, 69, 19)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format as JSON.
 *
 * @example
 * formatLibraryJson(result)
 */
export function formatLibraryJson(result: LibraryResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format as table.
 *
 * @example
 * formatLibraryTable(result)
 */
export function formatLibraryTable(result: LibraryResult): string {
  const parts: string[] = []
  parts.push(formatCallNumberLegend())
  parts.push(formatCatalogTable(result.catalog))
  parts.push(formatShelves(result.shelves))
  parts.push(formatCollections(result.collections))
  parts.push(formatLibraryStats(result.stats))
  parts.push(formatLibraryRecommendations(result.recommendations))
  return parts.join('\n')
}
