import chalk from 'chalk'

import type { HerbariumPressResult } from './herbarium-press-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatHerbariumPressTable(result: HerbariumPressResult, verbose: boolean): string {
  const { sheets, drawers, stats, museum, recommendations } = result
  const lines: string[] = [chalk.bold('\n🌿 Herbarium Press Report'), '']

  lines.push(chalk.bold('Museum Curation:'))
  lines.push(`  Overall Curation:    ${chalk.yellow(String(museum.overallCuration))}/100`)
  lines.push(`  Avg Specimen Quality:${chalk.green(String(museum.avgSpecimenQuality))}/100`)
  lines.push(`  Avg Preservation:    ${chalk.cyan(String(museum.avgPreservation))}/100`)
  lines.push(`  Avg Taxonomic Clarity:${chalk.blue(String(museum.avgTaxonomicClarity))}/100`)
  lines.push(`  Is Well Curated:     ${museum.isWellCurated ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Botanist Grade:      ${chalk.yellow(stats.botanistGrade)}`)
  lines.push('')

  if (drawers.length > 0) {
    lines.push(chalk.bold('Cabinet Drawers:'))
    for (const d of drawers) {
      const condColor = d.condition === 'world-class-collection' || d.condition === 'research-collection'
        ? chalk.green
        : d.condition === 'teaching-collection'
          ? chalk.cyan
          : d.condition === 'hobby-collection'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(d.directory, 30)} ${condColor(d.condition)} (${d.sheets.length} sheets, ${d.drawerType})`)
    }
    lines.push('')
  }

  if (verbose && sheets.length > 0) {
    lines.push(chalk.bold('Herbarium Sheets:'))
    lines.push('')
    const colWidths = {
      condition: 20,
      file: Math.max(20, ...sheets.map((s) => s.file.length)),
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.quality + colWidths.condition + 6)))

    for (const s of sheets) {
      const condColor = s.condition === 'type-specimen' ? chalk.yellow
        : s.condition === 'pristine-sheet' ? chalk.green
          : s.condition === 'well-curated' ? chalk.cyan
            : s.condition === 'adequately-stored' ? chalk.blue
              : s.condition === 'degrading-specimen' ? chalk.gray
                : chalk.red
      lines.push(
        padRight(s.file, colWidths.file) + '  ' +
        padLeft(String(s.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(s.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:            ${stats.totalFiles}`)
  lines.push(`  Total Drawers:          ${stats.totalDrawers}`)
  lines.push(`  Avg Specimen Quality:   ${stats.avgSpecimenQuality}`)
  lines.push(`  Avg Preservation:       ${stats.avgPreservationState}`)
  lines.push(`  Avg Taxonomic Clarity:  ${stats.avgTaxonomicClarity}`)
  lines.push(`  Avg Collection:         ${stats.avgCollectionCompleteness}`)
  lines.push(`  Avg Label Accuracy:     ${stats.avgLabelAccuracy}`)
  lines.push(`  Avg Cataloguing:        ${stats.avgCataloguingQuality}`)
  lines.push('')
  lines.push(chalk.bold('Specimen Conditions:'))
  lines.push(`  Type Specimens:         ${chalk.yellow(String(stats.typeSpecimenCount))}`)
  lines.push(`  Pristine Sheets:        ${chalk.green(String(stats.pristineSheetCount))}`)
  lines.push(`  Well Curated:           ${chalk.cyan(String(stats.wellCuratedCount))}`)
  lines.push(`  Adequately Stored:      ${chalk.blue(String(stats.adequatelyStoredCount))}`)
  lines.push(`  Degrading:              ${chalk.gray(String(stats.degradingCount))}`)
  lines.push(`  Uncatalogued Scrap:     ${chalk.red(String(stats.uncataloguedScrapCount))}`)
  lines.push('')
  lines.push(chalk.bold('Preservation Methods:'))
  lines.push(`  Live Collection:        ${stats.pressedCount > 0 ? chalk.green(String(stats.totalFiles - stats.fossilCount - stats.decayingCount)) : '0'}`)
  lines.push(`  Pressed:                ${stats.pressedCount}`)
  lines.push(`  Fossil:                 ${stats.fossilCount}`)
  lines.push(`  Decaying:               ${stats.decayingCount}`)
  lines.push('')
  lines.push(chalk.bold('Highlights:'))
  lines.push(`  Best Specimen:        ${stats.bestSpecimen}`)
  lines.push(`  Best Preserved:       ${stats.bestPreserved}`)
  lines.push(`  Clearest Taxonomy:    ${stats.clearestTaxonomy}`)
  lines.push(`  Most Complete:        ${stats.mostComplete}`)
  lines.push(`  Best Labelled:        ${stats.bestLabelled}`)
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

export function formatHerbariumPressJson(result: HerbariumPressResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

export function formatHerbariumPressCsv(result: HerbariumPressResult): string {
  const headers = [
    'file', 'specimenQuality', 'preservationState', 'taxonomicClarity',
    'collectionCompleteness', 'labelAccuracy', 'cataloguingQuality',
    'condition', 'qualityScore', 'kingdom', 'family', 'preservationMethod',
  ]
  const rows = result.sheets.map((s) => [
    s.file,
    String(s.specimenQuality),
    String(s.preservationState),
    String(s.taxonomicClarity),
    String(s.collectionCompleteness),
    String(s.labelAccuracy),
    String(s.cataloguingQuality),
    s.condition,
    String(s.qualityScore),
    s.specimen.kingdom,
    s.specimen.family,
    s.preservation.method,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
