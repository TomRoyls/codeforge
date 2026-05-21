import chalk from 'chalk'

import type { DeepOceanResult } from './deep-ocean-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatDeepOceanTable(result: DeepOceanResult, verbose: boolean): string {
  const { depths, basins, stats, planet, recommendations } = result
  const lines: string[] = [chalk.bold('\n🌊 Deep Ocean Report'), '']

  lines.push(chalk.bold('Planet Overview:'))
  lines.push(`  Overall Depth:       ${chalk.yellow(String(planet.overallDepth))}/100`)
  lines.push(`  Avg Depth:           ${chalk.cyan(String(planet.avgDepth))}/100`)
  lines.push(`  Avg Pressure:        ${chalk.blue(String(planet.avgPressure))}/100`)
  lines.push(`  Avg Current:         ${chalk.green(String(planet.avgCurrentStrength))}/100`)
  lines.push(`  Is Healthy:          ${planet.isHealthy ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Oceanographer Grade: ${chalk.yellow(stats.oceanographerGrade)}`)
  lines.push('')

  if (basins.length > 0) {
    lines.push(chalk.bold('Ocean Basins:'))
    for (const basin of basins) {
      const condColor = basin.condition === 'pristine-ocean' || basin.condition === 'healthy-sea'
        ? chalk.green
        : basin.condition === 'coastal-waters'
          ? chalk.cyan
          : basin.condition === 'polluted-bay'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(basin.directory, 30)} ${condColor(basin.condition)} (${basin.depths.length} depths, ${basin.basinType})`)
    }
    lines.push('')
  }

  if (verbose && depths.length > 0) {
    lines.push(chalk.bold('Depth Details:'))
    lines.push('')
    const colWidths = {
      condition: 20,
      file: Math.max(20, ...depths.map(d => d.file.length)),
      depth: 6,
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Depth', colWidths.depth)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.depth + colWidths.quality + colWidths.condition + 6)))

    for (const d of depths) {
      const condColor = d.condition === 'crystal-clear-waters' ? chalk.green
        : d.condition === 'clear-ocean' ? chalk.cyan
          : d.condition === 'coastal-waters' ? chalk.blue
            : d.condition === 'murky-depths' ? chalk.yellow
              : d.condition === 'black-smoker' ? chalk.rgb(255, 165, 0)
                : chalk.red
      lines.push(
        padRight(d.file, colWidths.file) + '  ' +
        padLeft(String(d.depth), colWidths.depth) + '  ' +
        padLeft(String(d.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(d.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:          ${stats.totalFiles}`)
  lines.push(`  Crystal Clear:       ${chalk.green(String(stats.crystalClearCount))}`)
  lines.push(`  Clear Ocean:         ${chalk.cyan(String(stats.clearOceanCount))}`)
  lines.push(`  Coastal Waters:      ${chalk.blue(String(stats.coastalWatersCount))}`)
  lines.push(`  Murky Depths:        ${chalk.yellow(String(stats.murkyDepthsCount))}`)
  lines.push(`  Black Smokers:       ${chalk.rgb(255, 165, 0)(String(stats.blackSmokerCount))}`)
  lines.push(`  Dead Seas:           ${chalk.red(String(stats.deadSeaCount))}`)
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

export function formatDeepOceanJson(result: DeepOceanResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatDeepOceanCsv(result: DeepOceanResult): string {
  const headers = ['File', 'Depth', 'Pressure', 'Bioluminescence', 'CurrentStrength', 'Temperature', 'AbyssalStability', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const d of result.depths) {
    rows.push(
      [
        escapeCsv(d.file),
        String(d.depth),
        String(d.pressure),
        String(d.bioluminescence),
        String(d.currentStrength),
        String(d.temperature),
        String(d.abyssalStability),
        String(d.qualityScore),
        d.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
