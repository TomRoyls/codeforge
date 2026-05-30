import chalk from 'chalk'

import type { MagnetarPulseResult } from './magnetar-pulse-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Table formatting ───────────────────────────────────

export function formatMagnetarPulseTable(result: MagnetarPulseResult, verbose: boolean): string {
  const { nodes, clusters, stats, galaxy, recommendations } = result
  const lines: string[] = [chalk.bold('\n💫 Magnetar Pulse Report'), '']

  lines.push(chalk.bold('Galaxy Overview:'))
  lines.push(`  Overall Energy:       ${chalk.yellow(String(galaxy.overallEnergy))}/100`)
  lines.push(`  Avg Pulse Intensity:  ${chalk.green(String(galaxy.avgPulseIntensity))}/100`)
  lines.push(`  Avg Magnetic Field:   ${chalk.cyan(String(galaxy.avgMagneticField))}/100`)
  lines.push(`  Avg Energy Output:    ${chalk.blue(String(galaxy.avgEnergyOutput))}/100`)
  lines.push(`  Is Energetic:         ${galaxy.isEnergetic ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Astrophysicist Grade: ${chalk.yellow(stats.astrophysicistGrade)}`)
  lines.push('')

  if (clusters.length > 0) {
    lines.push(chalk.bold('Pulsar Clusters:'))
    for (const cluster of clusters) {
      const condColor = cluster.condition === 'brilliant-cluster' || cluster.condition === 'active-cluster'
        ? chalk.green
        : cluster.condition === 'quiet-cluster'
          ? chalk.cyan
          : cluster.condition === 'dim-cluster'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(cluster.directory, 30)} ${condColor(cluster.condition)} (${cluster.nodes.length} nodes, ${cluster.clusterType})`)
    }
    lines.push('')
  }

  if (verbose && nodes.length > 0) {
    lines.push(chalk.bold('Pulsar Nodes:'))
    lines.push('')
    const colWidths = {
      condition: 16,
      file: Math.max(20, ...nodes.map((n) => n.file.length)),
      pulse: 8,
      quality: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Pulse', colWidths.pulse)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.pulse + colWidths.quality + colWidths.condition + 6)))

    for (const n of nodes) {
      const condColor = n.condition === 'magnetar-burst' ? chalk.yellow
        : n.condition === 'pulsar-beam' ? chalk.green
          : n.condition === 'steady-star' ? chalk.cyan
            : n.condition === 'red-dwarf' ? chalk.blue
              : n.condition === 'brown-dwarf' ? chalk.gray
                : chalk.red
      lines.push(
        padRight(n.file, colWidths.file) + '  ' +
        padLeft(String(n.pulseIntensity), colWidths.pulse) + '  ' +
        padLeft(String(n.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(n.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:            ${stats.totalFiles}`)
  lines.push(`  Total Clusters:         ${stats.totalClusters}`)
  lines.push(`  Avg Pulse Intensity:    ${stats.avgPulseIntensity}`)
  lines.push(`  Avg Magnetic Field:     ${stats.avgMagneticFieldStrength}`)
  lines.push(`  Avg Emission Spectrum:  ${stats.avgEmissionSpectrum}`)
  lines.push(`  Avg Burst Frequency:    ${stats.avgBurstFrequency}`)
  lines.push(`  Avg Energy Output:      ${stats.avgEnergyOutput}`)
  lines.push(`  Avg Radiation Level:    ${stats.avgRadiationLevel}`)
  lines.push('')
  lines.push(chalk.bold('Node Conditions:'))
  lines.push(`  Magnetar Bursts:        ${chalk.yellow(String(stats.magnetarBurstCount))}`)
  lines.push(`  Pulsar Beams:           ${chalk.green(String(stats.pulsarBeamCount))}`)
  lines.push(`  Steady Stars:           ${chalk.cyan(String(stats.steadyStarCount))}`)
  lines.push(`  Red Dwarfs:             ${chalk.blue(String(stats.redDwarfCount))}`)
  lines.push(`  Brown Dwarfs:           ${chalk.gray(String(stats.brownDwarfCount))}`)
  lines.push(`  Dead Stars:             ${chalk.red(String(stats.deadStarCount))}`)
  lines.push('')
  lines.push(chalk.bold('Highlights:'))
  lines.push(`  Most Intense:     ${stats.mostIntense}`)
  lines.push(`  Strongest Field:  ${stats.strongestField}`)
  lines.push(`  Most Productive:  ${stats.mostProductive}`)
  lines.push(`  Safest Node:      ${stats.safestNode}`)
  lines.push(`  Most Dangerous:   ${stats.mostDangerous}`)
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

export function formatMagnetarPulseJson(result: MagnetarPulseResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

export function formatMagnetarPulseCsv(result: MagnetarPulseResult): string {
  const headers = [
    'file', 'pulseIntensity', 'magneticFieldStrength', 'emissionSpectrum',
    'burstFrequency', 'energyOutput', 'radiationLevel', 'condition',
    'qualityScore', 'pulseType', 'luminosityClass',
  ]
  const rows = result.nodes.map((n) => [
    n.file,
    String(n.pulseIntensity),
    String(n.magneticFieldStrength),
    String(n.emissionSpectrum),
    String(n.burstFrequency),
    String(n.energyOutput),
    String(n.radiationLevel),
    n.condition,
    String(n.qualityScore),
    n.pulse.pulseType,
    n.energy.luminosityClass,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
