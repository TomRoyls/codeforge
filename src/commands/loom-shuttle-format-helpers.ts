import chalk from 'chalk'

import type { LoomShuttleResult } from './loom-shuttle-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatLoomShuttleTable(result: LoomShuttleResult, verbose: boolean): string {
  const { threads, workshops, stats, guild, recommendations } = result
  const lines: string[] = [chalk.bold('\n🧵 Loom Shuttle Report'), '']

  lines.push(chalk.bold('Weaving Guild:'))
  lines.push(`  Overall Weave:       ${chalk.yellow(String(guild.overallWeave))}/100`)
  lines.push(`  Avg Warp Tension:    ${chalk.green(String(guild.avgWarpTension))}/100`)
  lines.push(`  Avg Weave Quality:   ${chalk.cyan(String(guild.avgWeaveQuality))}/100`)
  lines.push(`  Avg Fabric Quality:  ${chalk.blue(String(guild.avgFabricQuality))}/100`)
  lines.push(`  Is Well Woven:       ${guild.isWellWoven ? chalk.green('Yes') : chalk.red('No')}`)
  lines.push(`  Weaver Grade:        ${chalk.yellow(stats.weaverGrade)}`)
  lines.push('')

  if (workshops.length > 0) {
    lines.push(chalk.bold('Weaving Workshops:'))
    for (const ws of workshops) {
      const condColor = ws.condition === 'haute-couture' || ws.condition === 'quality-textile'
        ? chalk.green
        : ws.condition === 'standard-fabric'
          ? chalk.cyan
          : ws.condition === 'rough-cloth'
            ? chalk.yellow
            : chalk.red
      lines.push(`  ${padRight(ws.directory, 30)} ${condColor(ws.condition)} (${ws.threads.length} threads, ${ws.workshopType})`)
    }
    lines.push('')
  }

  if (verbose && threads.length > 0) {
    lines.push(chalk.bold('Loom Threads:'))
    lines.push('')
    const colWidths = {
      condition: 18,
      file: Math.max(20, ...threads.map((t) => t.file.length)),
      quality: 8,
      tension: 8,
    }
    lines.push(
      chalk.cyan(padRight('File', colWidths.file)) + '  ' +
      chalk.cyan(padLeft('Tension', colWidths.tension)) + '  ' +
      chalk.cyan(padLeft('Quality', colWidths.quality)) + '  ' +
      chalk.cyan(padRight('Condition', colWidths.condition)),
    )
    lines.push(chalk.dim('─'.repeat(colWidths.file + colWidths.tension + colWidths.quality + colWidths.condition + 6)))

    for (const t of threads) {
      const condColor = t.condition === 'master-tapestry' ? chalk.yellow
        : t.condition === 'fine-cloth' ? chalk.green
          : t.condition === 'quality-weave' ? chalk.cyan
            : t.condition === 'homespun' ? chalk.blue
              : t.condition === 'frayed-fabric' ? chalk.gray
                : chalk.red
      lines.push(
        padRight(t.file, colWidths.file) + '  ' +
        padLeft(String(t.warpTension), colWidths.tension) + '  ' +
        padLeft(String(t.qualityScore), colWidths.quality) + '  ' +
        condColor(padRight(t.condition, colWidths.condition)),
      )
    }
    lines.push('')
  }

  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total Files:           ${stats.totalFiles}`)
  lines.push(`  Total Workshops:       ${stats.totalWorkshops}`)
  lines.push(`  Avg Warp Tension:      ${stats.avgWarpTension}`)
  lines.push(`  Avg Shuttle Speed:     ${stats.avgShuttleSpeed}`)
  lines.push(`  Avg Thread Count:      ${stats.avgThreadCount}`)
  lines.push(`  Avg Weave Pattern:     ${stats.avgWeavePattern}`)
  lines.push(`  Avg Fabric Quality:    ${stats.avgFabricQuality}`)
  lines.push(`  Avg Pattern Complexity:${stats.avgPatternComplexity}`)
  lines.push('')
  lines.push(chalk.bold('Thread Conditions:'))
  lines.push(`  Master Tapestries:     ${chalk.yellow(String(stats.masterTapestryCount))}`)
  lines.push(`  Fine Cloth:            ${chalk.green(String(stats.fineClothCount))}`)
  lines.push(`  Quality Weave:         ${chalk.cyan(String(stats.qualityWeaveCount))}`)
  lines.push(`  Homespun:              ${chalk.blue(String(stats.homespunCount))}`)
  lines.push(`  Frayed Fabric:         ${chalk.gray(String(stats.frayedFabricCount))}`)
  lines.push(`  Tangled Mess:          ${chalk.red(String(stats.tangledMessCount))}`)
  lines.push('')
  lines.push(chalk.bold('Highlights:'))
  lines.push(`  Best Woven:         ${stats.bestWoven}`)
  lines.push(`  Strongest Fabric:   ${stats.strongestFabric}`)
  lines.push(`  Fastest Shuttle:    ${stats.fastestShuttle}`)
  lines.push(`  Most Complex:       ${stats.mostComplex}`)
  lines.push(`  Most Reinforced:    ${stats.mostReinforced}`)
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

export function formatLoomShuttleJson(result: LoomShuttleResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV formatting ─────────────────────────────────────

export function formatLoomShuttleCsv(result: LoomShuttleResult): string {
  const headers = [
    'file', 'warpTension', 'shuttleSpeed', 'threadCount',
    'weavePattern', 'fabricQuality', 'patternComplexity', 'condition',
    'qualityScore', 'weaveType', 'yarnType',
  ]
  const rows = result.threads.map((t) => [
    t.file,
    String(t.warpTension),
    String(t.shuttleSpeed),
    String(t.threadCount),
    String(t.weavePattern),
    String(t.fabricQuality),
    String(t.patternComplexity),
    t.condition,
    String(t.qualityScore),
    t.weave.pattern,
    t.yarn.type,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
