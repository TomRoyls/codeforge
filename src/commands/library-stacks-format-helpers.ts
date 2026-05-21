import chalk from 'chalk'
import type { LibraryStacksResult, LibraryBook, LibraryFloor, LibraryStacksStats } from './library-stacks-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'rare-manuscript') return chalk.rgb(255, 215, 0)(c)
  if (c === 'first-edition') return chalk.green(c)
  if (c === 'reference-work') return chalk.blue(c)
  if (c === 'well-thumbed') return chalk.cyan(c)
  if (c === 'pamphlet') return chalk.yellow(c)
  return chalk.red(c)
}

function floorColor(f: string): string {
  if (f === 'rare-books') return chalk.rgb(255, 215, 0)(f)
  if (f === 'reference-room') return chalk.green(f)
  if (f === 'main-stacks') return chalk.blue(f)
  if (f === 'periodicals') return chalk.cyan(f)
  if (f === 'storage') return chalk.yellow(f)
  return chalk.red(f)
}

function gradeColor(g: string): string {
  if (g === 'head-librarian') return chalk.rgb(255, 215, 0)(g)
  if (g === 'senior-librarian') return chalk.green(g)
  if (g === 'librarian') return chalk.blue(g)
  if (g === 'library-assistant') return chalk.cyan(g)
  if (g === 'page') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Book Formatting ───────────────────────────────────────────────────────

function formatBook(b: LibraryBook): string {
  return `  ${chalk.bold(b.file)} ${conditionColor(b.condition)} quality:${scoreColor(b.qualityScore)} catalog:${scoreColor(b.cataloguingQuality)} shelf:${scoreColor(b.shelfOrder)} ref:${scoreColor(b.referenceSystem)}`
}

// ─── Floor Formatting ──────────────────────────────────────────────────────

function formatFloor(f: LibraryFloor): string {
  return `  ${chalk.bold(f.directory)} ${floorColor(f.floorType)} catalog:${scoreColor(f.avgCataloguing)} shelf:${scoreColor(f.avgShelfOrder)} reading:${scoreColor(f.avgReadingQuality)} rare:${f.rareManuscriptCount} scrap:${f.scrapPaperCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: LibraryStacksStats): string {
  return [
    `  Grade: ${gradeColor(stats.librarianGrade)} | Organization: ${scoreColor(stats.overallOrganization)} | Files: ${stats.totalFiles} | Floors: ${stats.totalFloors}`,
    `  Catalog: ${scoreColor(stats.avgCataloguingQuality)} | Shelf: ${scoreColor(stats.avgShelfOrder)} | Reference: ${scoreColor(stats.avgReferenceSystem)} | Circulation: ${scoreColor(stats.avgCirculation)} | Reading: ${scoreColor(stats.avgReadingRoom)} | Value: ${scoreColor(stats.avgCollectionValue)}`,
    `  Conditions: Rare:${stats.rareManuscriptCount} First:${stats.firstEditionCount} Ref:${stats.referenceWorkCount} Thumbed:${stats.wellThumbedCount} Pamphlet:${stats.pamphletCount} Scrap:${stats.scrapPaperCount}`,
    `  Best: ${chalk.green(stats.bestBook)} | Organized: ${chalk.cyan(stats.bestOrganized)} | Referenced: ${chalk.blue(stats.bestReferenced)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format library stacks result as a table
 * @example
 * formatLibraryStacksTable(result, false) // string
 */
export function formatLibraryStacksTable(result: LibraryStacksResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📚 Library Stacks - Code Organization Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📖 Books'))
  if (result.books.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.books : result.books.slice(0, 15)
    for (const b of display) {
      lines.push(formatBook(b))
    }
    if (!verbose && result.books.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.books.length - 15} more`))
    }
  }
  lines.push('')

  if (result.floors.length > 0) {
    lines.push(chalk.bold('🏗️ Floors'))
    for (const f of result.floors) {
      lines.push(formatFloor(f))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format library stacks result as JSON
 * @example
 * formatLibraryStacksJson(result) // string
 */
export function formatLibraryStacksJson(result: LibraryStacksResult): string {
  return JSON.stringify(result, null, 2)
}
