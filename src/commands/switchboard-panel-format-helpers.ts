import chalk from 'chalk'

import type { SwitchboardPanelResult } from './switchboard-panel-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

export function formatSwitchboardPanelTable(result: SwitchboardPanelResult, verbose: boolean): string {
  const { lines, offices, stats, network, recommendations } = result
  const linesArr: string[] = [chalk.bold('\n📞 Switchboard Panel Report'), '']

  linesArr.push(chalk.bold('Network Overview:'))
  linesArr.push(`  Overall Connectivity:  ${chalk.yellow(String(network.overallConnectivity))}/100`)
  linesArr.push(`  Avg Connection:        ${chalk.green(String(network.avgConnectionQuality))}/100`)
  linesArr.push(`  Avg Switch Capacity:   ${chalk.cyan(String(network.avgSwitchCapacity))}/100`)
  linesArr.push(`  Avg Wire Organization: ${chalk.blue(String(network.avgWireOrganization))}/100`)
  linesArr.push(`  Is Well Connected:     ${network.isWellConnected ? chalk.green('Yes') : chalk.red('No')}`)
  linesArr.push(`  Operator Grade:        ${chalk.yellow(stats.operatorGrade)}`)
  linesArr.push('')

  if (offices.length > 0) {
    linesArr.push(chalk.bold('Exchange Offices:'))
    for (const office of offices) {
      const condColor = office.condition === 'premium-service' || office.condition === 'reliable-service'
        ? chalk.green
        : office.condition === 'standard-service'
          ? chalk.cyan
          : office.condition === 'basic-service'
            ? chalk.yellow
            : chalk.red
      linesArr.push(`  ${padRight(office.directory, 30)} ${condColor(office.condition)} (${office.lines.length} lines, ${office.officeType})`)
    }
    linesArr.push('')
  }

  if (verbose && lines.length > 0) {
    linesArr.push(chalk.bold('Line Details:'))
    linesArr.push('')
    const colWidths = {
      condition: 20,
      file: Math.max(20, ...lines.map(l => l.file.length)),
      quality: 8,
      connection: 12,
    }
    linesArr.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padLeft('Connection', colWidths.connection)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    linesArr.push(chalk.dim('─'.repeat(colWidths.file + colWidths.quality + colWidths.connection + colWidths.condition + 6)))

    for (const l of lines) {
      const condColor = l.condition === 'digital-exchange' ? chalk.green
        : l.condition === 'modern-switchboard' ? chalk.cyan
          : l.condition === 'reliable-panel' ? chalk.blue
            : l.condition === 'manual-exchange' ? chalk.yellow
              : l.condition === 'faulty-wiring' ? chalk.rgb(255, 165, 0)
                : chalk.red
      linesArr.push(
        padRight(l.file, colWidths.file) + '  ' +
        padLeft(String(l.qualityScore), colWidths.quality) + '  ' +
        padLeft(String(l.connectionQuality), colWidths.connection) + '  ' +
        condColor(padRight(l.condition, colWidths.condition)),
      )
    }
    linesArr.push('')
  }

  linesArr.push(chalk.bold('Statistics:'))
  linesArr.push(`  Total Files:           ${stats.totalFiles}`)
  linesArr.push(`  Digital Exchange:      ${chalk.green(String(stats.digitalExchangeCount))}`)
  linesArr.push(`  Modern Switchboard:    ${chalk.cyan(String(stats.modernSwitchboardCount))}`)
  linesArr.push(`  Reliable Panel:        ${chalk.blue(String(stats.reliablePanelCount))}`)
  linesArr.push(`  Manual Exchange:       ${chalk.yellow(String(stats.manualExchangeCount))}`)
  linesArr.push(`  Faulty Wiring:         ${chalk.rgb(255, 165, 0)(String(stats.faultyWiringCount))}`)
  linesArr.push(`  Dead Network:          ${chalk.red(String(stats.deadNetworkCount))}`)
  linesArr.push('')

  if (recommendations.length > 0) {
    linesArr.push(chalk.bold('Recommendations:'))
    for (const rec of recommendations) {
      linesArr.push(`  ${chalk.dim('•')} ${rec}`)
    }
  }

  return linesArr.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatSwitchboardPanelJson(result: SwitchboardPanelResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function formatSwitchboardPanelCsv(result: SwitchboardPanelResult): string {
  const headers = ['File', 'ConnectionQuality', 'SwitchCapacity', 'WireOrganization', 'OperatorEfficiency', 'LineUtilization', 'PanelLayout', 'QualityScore', 'Condition']
  const rows: string[] = [headers.join(',')]

  for (const l of result.lines) {
    rows.push(
      [
        escapeCsv(l.file),
        String(l.connectionQuality),
        String(l.switchCapacity),
        String(l.wireOrganization),
        String(l.operatorEfficiency),
        String(l.lineUtilization),
        String(l.panelLayout),
        String(l.qualityScore),
        l.condition,
      ].join(','),
    )
  }

  return rows.join('\n')
}
