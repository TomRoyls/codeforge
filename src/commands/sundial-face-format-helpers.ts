import chalk from 'chalk'

import type { SundialFaceResult } from './sundial-face-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatSundialFaceTable(result: SundialFaceResult, verbose: boolean): string {
  const { marks, gardens, stats, observatory, recommendations } = result
  const lines: string[] = [chalk.bold('\n⏰ Sundial Face Report'), '']

  lines.push(chalk.bold('Observatory Overview:'))
  lines.push(`  Overall Precision:     ${chalk.yellow(String(observatory.overallPrecision))}/100`)
  lines.push(`  Gnomon Accuracy:       ${chalk.cyan(String(observatory.avgGnomonAccuracy))}/100`)
  lines.push(`  Dial Calibration:      ${chalk.blue(String(observatory.avgDialCalibration))}/100`)
  lines.push(`  Weathering Resistance: ${chalk.green(String(observatory.avgWeatheringResistance))}/100`)
  lines.push(`  Is Accurate:           ${observatory.isAccurate ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Chronometer Grade:     ${chalk.yellow(stats.chronometerGrade)}`)
  lines.push('')

  if (gardens.length > 0) {
    lines.push(chalk.bold('Sundial Gardens:'))
    for (const garden of gardens) {
      const condColor = garden.condition === 'chronometer-garden' || garden.condition === 'sundial-garden'
        ? chalk.green
        : garden.condition === 'time-garden'
          ? chalk.cyan
          : garden.condition === 'clock-garden'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(garden.directory, 30)} ${condColor(garden.condition)} (${garden.marks.length} marks, ${garden.gardenType})`)
    }
    lines.push('')
  }

  if (verbose && marks.length > 0) {
    lines.push(chalk.bold('Mark Details:'))
    lines.push('')
    const colWidths = {
      condition: 18,
      file: Math.max(20, ...marks.map(m => m.file.length)),
      gnomon: 7,
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Gnomon', colWidths.gnomon)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.gnomon + colWidths.quality + colWidths.condition + 6)))

    for (const mark of marks) {
      const condColor = mark.condition === 'precision-sundial' ? chalk.green
        : mark.condition === 'garden-sundial' ? chalk.cyan
          : mark.condition === 'rustic-dial' ? chalk.blue
            : mark.condition === 'weathered-stone' ? chalk.yellow
              : mark.condition === 'cracked-dial' ? chalk.rgb(255, 165, 0)
                : chalk.red
      lines.push(
        padRight(mark.file, colWidths.file) + '  ' +
        padLeft(String(mark.gnomonAccuracy), colWidths.gnomon) + '  ' +
        padLeft(String(mark.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(mark.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:          ${stats.totalFiles}`)
  lines.push(`  Precision Sundials:   ${chalk.green(String(stats.precisionSundialCount))}`)
  lines.push(`  Garden Sundials:      ${chalk.cyan(String(stats.gardenSundialCount))}`)
  lines.push(`  Rustic Dials:         ${chalk.blue(String(stats.rusticDialCount))}`)
  lines.push(`  Weathered Stone:      ${stats.weatheredStoneCount}`)
  lines.push(`  Cracked Dials:        ${chalk.yellow(String(stats.crackedDialCount))}`)
  lines.push(`  Broken Sticks:        ${chalk.red(String(stats.brokenStickCount))}`)
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

export function formatSundialFaceJson(result: SundialFaceResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatSundialFaceCsv(result: SundialFaceResult): string {
  const headers = ['File', 'GnomonAccuracy', 'HourMarkingClarity', 'ShadowTracking', 'DialCalibration', 'WeatheringResistance', 'TimeTellingAccuracy', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const mark of result.marks) {
    rows.push(
      [
        escapeCsv(mark.file),
        String(mark.gnomonAccuracy),
        String(mark.hourMarkingClarity),
        String(mark.shadowTracking),
        String(mark.dialCalibration),
        String(mark.weatheringResistance),
        String(mark.timeTellingAccuracy),
        String(mark.qualityScore),
        mark.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
