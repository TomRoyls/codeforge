import chalk from 'chalk'

import type { PrintingPressResult } from './printing-press-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatPrintingPressTable(result: PrintingPressResult, verbose: boolean): string {
  const { pages, shops, stats, library, recommendations } = result
  const lines: string[] = [chalk.bold('\n🖨️  Printing Press Report'), '']

  lines.push(chalk.bold('Library Overview:'))
  lines.push(`  Overall Publishing:    ${chalk.yellow(String(library.overallPublishing))}/100`)
  lines.push(`  Avg Type Clarity:      ${chalk.green(String(library.avgTypeClarity))}/100`)
  lines.push(`  Avg Doc Quality:       ${chalk.cyan(String(library.avgDocQuality))}/100`)
  lines.push(`  Avg Binding:           ${chalk.blue(String(library.avgBinding))}/100`)
  lines.push(`  Total Illustrations:   ${library.totalIllustrations}`)
  lines.push(`  Is Well Documented:    ${library.isWellDocumented ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Publisher Grade:       ${chalk.yellow(stats.publisherGrade)}`)
  lines.push('')

  if (shops.length > 0) {
    lines.push(chalk.bold('Print Shops:'))
    for (const shop of shops) {
      const condColor = shop.condition === 'prestigious-press' || shop.condition === 'quality-publisher'
        ? chalk.green
        : shop.condition === 'standard-publisher'
          ? chalk.cyan
          : shop.condition === 'budget-printer'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(shop.directory, 30)} ${condColor(shop.condition)} (${shop.pages.length} pages, ${shop.shopType})`)
    }
    lines.push('')
  }

  if (verbose && pages.length > 0) {
    lines.push(chalk.bold('Printed Pages:'))
    lines.push('')
    const colWidths = {
      condition: 22,
      file: Math.max(20, ...pages.map((p) => p.file.length)),
      quality: 8,
      clarity: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Clarity', colWidths.clarity)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.clarity + colWidths.quality + colWidths.condition + 6)))

    for (const p of pages) {
      const condColor = p.condition === 'gutenberg-bible' ? chalk.yellow
        : p.condition === 'first-edition' ? chalk.green
          : p.condition === 'quality-print' ? chalk.cyan
            : p.condition === 'mass-market' ? chalk.blue
              : p.condition === 'mimeograph' ? chalk.gray
                : chalk.red
      lines.push(
        padRight(p.file, colWidths.file) + '  ' +
        padLeft(String(p.typeClarity), colWidths.clarity) + '  ' +
        padLeft(String(p.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(p.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:            ${stats.totalFiles}`)
  lines.push(`  Total Shops:            ${stats.totalShops}`)
  lines.push(`  Avg Type Clarity:       ${stats.avgTypeClarity}`)
  lines.push(`  Avg Doc Quality:        ${stats.avgDocumentationQuality}`)
  lines.push(`  Avg Reproducibility:    ${stats.avgReproducibility}`)
  lines.push(`  Avg Circulation Reach:  ${stats.avgCirculationReach}`)
  lines.push(`  Avg Print Run:          ${stats.avgPrintRun}`)
  lines.push(`  Avg Binding Quality:    ${stats.avgBindingQuality}`)
  lines.push('')
  lines.push(chalk.bold('Page Conditions:'))
  lines.push(`  Gutenberg Bibles:       ${chalk.yellow(String(stats.gutenbergBibleCount))}`)
  lines.push(`  First Editions:         ${chalk.green(String(stats.firstEditionCount))}`)
  lines.push(`  Quality Prints:         ${chalk.cyan(String(stats.qualityPrintCount))}`)
  lines.push(`  Mass Market:            ${chalk.blue(String(stats.massMarketCount))}`)
  lines.push(`  Mimeographs:            ${chalk.gray(String(stats.mimeographCount))}`)
  lines.push(`  Smudged Manuscripts:    ${chalk.red(String(stats.smudgedManuscriptCount))}`)
  lines.push('')
  lines.push(chalk.bold('Highlights:'))
  lines.push(`  Clearest Type:        ${stats.clearestType}`)
  lines.push(`  Best Documented:      ${stats.bestDocumented}`)
  lines.push(`  Best Bound:           ${stats.bestBound}`)
  lines.push(`  Widest Circulation:   ${stats.widestCirculation}`)
  lines.push(`  Most Reproducible:    ${stats.mostReproducible}`)
  lines.push('')

  if (recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of recommendations) {
      lines.push(`  ${chalk.rgb(255, 165, 0)('→')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatPrintingPressJson(result: PrintingPressResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

export function formatPrintingPressCsv(result: PrintingPressResult): string {
  const headers = [
    'file', 'typeClarity', 'documentationQuality', 'reproducibility',
    'circulationReach', 'printRun', 'bindingQuality', 'condition',
    'qualityScore', 'typefaceStyle', 'bindingStyle',
  ]
  const rows = result.pages.map((p) => [
    p.file,
    String(p.typeClarity),
    String(p.documentationQuality),
    String(p.reproducibility),
    String(p.circulationReach),
    String(p.printRun),
    String(p.bindingQuality),
    p.condition,
    String(p.qualityScore),
    p.typeface.style,
    p.binding.style,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
