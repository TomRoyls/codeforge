import chalk from 'chalk'
import type { IcicleResult, IcicleDrop } from './icicle-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'solid': return chalk.rgb(100, 255, 100)(c)
    case 'stable': return chalk.green(c)
    case 'firm': return chalk.blue(c)
    case 'soft': return chalk.yellow(c)
    case 'melting': return chalk.rgb(255, 165, 0)(c)
    case 'dripping': return chalk.red(c)
    case 'evaporated': return chalk.rgb(200, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function iceColor(i: string): string {
  switch (i) {
    case 'clear-ice': return chalk.rgb(180, 220, 255)(i)
    case 'rime-ice': return chalk.white(i)
    case 'glaze-ice': return chalk.cyan(i)
    case 'snow-ice': return chalk.gray(i)
    case 'black-ice': return chalk.rgb(50, 50, 80)(i)
    case 'frost': return chalk.rgb(200, 200, 255)(i)
    default: return chalk.dim(i)
  }
}

function sheetCondColor(c: string): string {
  switch (c) {
    case 'permafrost': return chalk.rgb(100, 200, 255)(c)
    case 'frozen-solid': return chalk.green(c)
    case 'stable': return chalk.blue(c)
    case 'thawing': return chalk.yellow(c)
    case 'melting': return chalk.rgb(255, 165, 0)(c)
    case 'runoff': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'glaciologist': return chalk.rgb(255, 215, 0)(g)
    case 'cryologist': return chalk.green(g)
    case 'ice-climber': return chalk.blue(g)
    case 'skater': return chalk.cyan(g)
    case 'sunbather': return chalk.yellow(g)
    case 'volcano': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Drop Formatting ─────────────────────────────────────────────────────────

function formatDrop(d: IcicleDrop, verbose: boolean): string {
  const line = ` ${conditionColor(d.condition)} ${iceColor(d.iceType)} ${chalk.bold(d.file)} len:${scoreColor(d.icicleLength)} thk:${scoreColor(d.thickness)} clr:${scoreColor(d.clarity)} q:${scoreColor(d.qualityScore)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    type:${d.dropType} temp:${scoreColor(d.temperature)} drip:${scoreColor(d.dripRate)} frag:${scoreColor(d.fragility)} depth:${d.chain.depth}`)
  details.push(`    chain:imports=${d.chain.imports.length} trans=${d.chain.transitiveImports} leaf=${d.chain.isLeaf} root=${d.chain.isRoot} weight=${d.chain.chainWeight}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format icicle result as a table
 * @example
 * formatIcicleTable(result, false) // string
 */
export function formatIcicleTable(result: IcicleResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧊 Icicle - Code Dependency Chain Depth Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('❄️ Icicle Drops'))
  if (result.drops.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.drops : result.drops.slice(0, 15)
    for (const d of display) {
      lines.push(formatDrop(d, verbose))
    }
    if (!verbose && result.drops.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.drops.length - 15} more`))
    }
  }
  lines.push('')

  if (result.sheets.length > 0) {
    lines.push(chalk.bold('🏔️ Ice Sheets'))
    for (const s of result.sheets) {
      lines.push(`  ${chalk.bold(s.directory)} ${sheetCondColor(s.condition)} health:${scoreColor(s.sheetHealth)} depth:${s.maxDepth} type:${s.sheetType}`)
    }
    lines.push('')
  }

  const g = result.glacier
  lines.push(chalk.bold('🗻 Glacier'))
  lines.push(`  Depth:${g.totalDepth} AvgLen:${scoreColor(g.avgLength)} Thk:${scoreColor(g.avgThickness)} Clr:${scoreColor(g.avgClarity)} Temp:${scoreColor(g.avgTemperature)}`)
  lines.push(`  MaxChain:${g.maxChainDepth} Circular:${g.circularChains} WeakPts:${g.totalWeakPoints} Stability:${scoreColor(g.overallStability)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.cryologistGrade)} | Files: ${s.totalFiles} | Sheets: ${s.totalSheets} | Stability: ${scoreColor(s.overallStability)}`)
  lines.push(`  Solid:${s.solidCount} Melting:${s.meltingCount} Evap:${s.evaporatedCount} Leaf:${s.leafFiles} Root:${s.rootFiles} Circular:${s.circularFiles}`)
  lines.push(`  WeakPts:${s.totalWeakPoints} Fissures:${s.totalFissures} AirPockets:${s.totalAirPockets} Growing:${s.growingChains} Stable:${s.stableChains}`)
  lines.push(`  Deep:${chalk.blue(s.deepestChain)} Thin:${chalk.red(s.thinnestChain)} Clear:${chalk.green(s.clearestChain)} Fragile:${chalk.yellow(s.mostFragile)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format icicle result as JSON
 * @example
 * formatIcicleJson(result) // string
 */
export function formatIcicleJson(result: IcicleResult): string {
  return JSON.stringify(result, null, 2)
}
