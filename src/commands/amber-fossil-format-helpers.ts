import chalk from 'chalk'

import type { AmberFossilResult } from './amber-fossil-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatAmberFossilTable(result: AmberFossilResult, verbose: boolean): string {
  const { specimens, deposits, stats, museum, recommendations } = result
  const lines: string[] = [chalk.bold('\n🟠 Amber Fossil Report'), '']

  lines.push(chalk.bold('Museum Overview:'))
  lines.push(`  Overall Preservation:  ${chalk.yellow(String(museum.overallPreservation))}/100`)
  lines.push(`  Avg Clarity:            ${chalk.rgb(255, 191, 0)(String(museum.avgClarity))}/100`)
  lines.push(`  Avg Preservation:       ${chalk.green(String(museum.avgPreservation))}/100`)
  lines.push(`  Avg Age:                ${chalk.blue(String(museum.avgAge))}/100`)
  lines.push(`  Is Well Curated:        ${museum.isWellCurated ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Paleontologist Grade:   ${chalk.yellow(stats.paleontologistGrade)}`)
  lines.push('')

  if (deposits.length > 0) {
    lines.push(chalk.bold('Amber Deposits:'))
    for (const dep of deposits) {
      const condColor = dep.condition === 'museum-collection' || dep.condition === 'research-collection'
        ? chalk.green
        : dep.condition === 'collector-stash'
          ? chalk.cyan
          : dep.condition === 'beach-combing'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(dep.directory, 30)} ${condColor(dep.condition)} (${dep.specimens.length} specimens, ${dep.depositType})`)
    }
    lines.push('')
  }

  if (verbose && specimens.length > 0) {
    lines.push(chalk.bold('Specimen Details:'))
    lines.push('')
    const colWidths = {
      condition: 20,
      file: Math.max(20, ...specimens.map(s => s.file.length)),
      clarity: 8,
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Clarity', colWidths.clarity)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.clarity + colWidths.quality + colWidths.condition + 6)))

    for (const s of specimens) {
      const condColor = s.condition === 'pristine-amber' ? chalk.green
        : s.condition === 'clear-specimen' ? chalk.cyan
          : s.condition === 'good-fossil' ? chalk.blue
            : s.condition === 'cloudy-amber' ? chalk.yellow
              : s.condition === 'cracked-specimen' ? chalk.rgb(255, 165, 0)
                : chalk.red
      lines.push(
        padRight(s.file, colWidths.file) + '  ' +
        padLeft(String(s.amberClarity), colWidths.clarity) + '  ' +
        padLeft(String(s.fossilQuality), colWidths.quality) + '  ' +
        condColor(padRight(s.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:          ${stats.totalFiles}`)
  lines.push(`  Pristine Amber:       ${chalk.green(String(stats.pristineAmberCount))}`)
  lines.push(`  Clear Specimens:      ${chalk.cyan(String(stats.clearSpecimenCount))}`)
  lines.push(`  Good Fossils:         ${chalk.blue(String(stats.goodFossilCount))}`)
  lines.push(`  Cloudy Amber:         ${chalk.yellow(String(stats.cloudyAmberCount))}`)
  lines.push(`  Cracked Specimens:    ${chalk.rgb(255, 165, 0)(String(stats.crackedSpecimenCount))}`)
  lines.push(`  Decayed Remains:      ${chalk.red(String(stats.decayedRemainsCount))}`)
  lines.push('')

  if (recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'))
    for (const rec of recommendations) {
      lines.push(`  ${chalk.dim('•')} ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatAmberFossilJson(result: AmberFossilResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatAmberFossilCsv(result: AmberFossilResult): string {
  const headers = ['File', 'AmberClarity', 'FossilQuality', 'PreservationState', 'InclusionsCount', 'AgeEstimation', 'ExtractionDifficulty', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const s of result.specimens) {
    rows.push(
      [
        escapeCsv(s.file),
        String(s.amberClarity),
        String(s.fossilQuality),
        String(s.preservationState),
        String(s.inclusionsCount),
        String(s.ageEstimation),
        String(s.extractionDifficulty),
        String(s.qualityScore),
        s.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
