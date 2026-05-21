import chalk from 'chalk'

import type { StainedGlassWindowResult } from './stained-glass-window-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatStainedGlassWindowTable(result: StainedGlassWindowResult, verbose: boolean): string {
  const { panels, bays, stats, cathedral, recommendations } = result
  const lines: string[] = [chalk.bold('\n🎨 Stained Glass Window Report'), '']

  lines.push(chalk.bold('Cathedral Overview:'))
  lines.push(`  Brilliance:        ${chalk.yellow(String(cathedral.overallBrilliance))}/100`)
  lines.push(`  Light Transmission: ${chalk.cyan(String(cathedral.avgLightTransmission))}/100`)
  lines.push(`  Color Richness:     ${chalk.magenta(String(cathedral.avgColorRichness))}/100`)
  lines.push(`  Lead Quality:       ${chalk.blue(String(cathedral.avgLeadQuality))}/100`)
  lines.push(`  Illuminated:        ${cathedral.isIlluminated ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Glazier Grade:      ${chalk.yellow(stats.glazierGrade)}`)
  lines.push('')

  if (bays.length > 0) {
    lines.push(chalk.bold('Window Bays:'))
    for (const bay of bays) {
      const condColor = bay.condition === 'divine-light' || bay.condition === 'radiant'
        ? chalk.green
        : bay.condition === 'well-lit'
          ? chalk.cyan
          : bay.condition === 'dim'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(bay.directory, 30)} ${condColor(bay.condition)} (${bay.panels.length} panels, ${bay.bayType})`)
    }
    lines.push('')
  }

  if (verbose && panels.length > 0) {
    lines.push(chalk.bold('Panel Details:'))
    lines.push('')
    const colWidths = {
      condition: 22,
      file: Math.max(20, ...panels.map(p => p.file.length)),
      light: 6,
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Light', colWidths.light)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.light + colWidths.quality + colWidths.condition + 6)))

    for (const panel of panels) {
      const condColor = panel.condition === 'cathedral-masterpiece' ? chalk.green
        : panel.condition === 'rose-window' ? chalk.cyan
          : panel.condition === 'beautiful-window' ? chalk.blue
            : panel.condition === 'clear-glass' ? chalk.white
              : panel.condition === 'cracked-glass' ? chalk.yellow
                : chalk.red
      lines.push(
        padRight(panel.file, colWidths.file) + '  ' +
        padLeft(String(panel.lightTransmission), colWidths.light) + '  ' +
        padLeft(String(panel.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(panel.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:          ${stats.totalFiles}`)
  lines.push(`  Masterpieces:         ${chalk.green(String(stats.cathedralMasterpieceCount))}`)
  lines.push(`  Rose Windows:         ${chalk.cyan(String(stats.roseWindowCount))}`)
  lines.push(`  Beautiful Windows:    ${chalk.blue(String(stats.beautifulWindowCount))}`)
  lines.push(`  Clear Glass:          ${stats.clearGlassCount}`)
  lines.push(`  Cracked Glass:        ${chalk.yellow(String(stats.crackedGlassCount))}`)
  lines.push(`  Bricked Up:           ${chalk.red(String(stats.brickedUpCount))}`)
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

export function formatStainedGlassWindowJson(result: StainedGlassWindowResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatStainedGlassWindowCsv(result: StainedGlassWindowResult): string {
  const headers = ['File', 'LightTransmission', 'ColorRichness', 'LeadQuality', 'GlassThickness', 'PanelArrangement', 'WindowFraming', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const panel of result.panels) {
    rows.push(
      [
        escapeCsv(panel.file),
        String(panel.lightTransmission),
        String(panel.colorRichness),
        String(panel.leadQuality),
        String(panel.glassThickness),
        String(panel.panelArrangement),
        String(panel.windowFraming),
        String(panel.qualityScore),
        panel.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
