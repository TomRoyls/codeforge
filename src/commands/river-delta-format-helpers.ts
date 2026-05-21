import chalk from 'chalk'
import type { WaterChannel, DeltaRegion, RiverDeltaResult } from './river-delta-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'deep-river': return chalk.rgb(30, 144, 255)(c)
    case 'clear-stream': return chalk.green(c)
    case 'meandering-river': return chalk.blue(c)
    case 'swamp': return chalk.cyan(c)
    case 'mudflat': return chalk.yellow(c)
    case 'desert-wash': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function channelColor(t: string): string {
  switch (t) {
    case 'main-channel': return chalk.rgb(30, 144, 255)(t)
    case 'distributary': return chalk.green(t)
    case 'tributary': return chalk.blue(t)
    case 'backwater': return chalk.cyan(t)
    case 'oxbow': return chalk.yellow(t)
    case 'dry-bed': return chalk.red(t)
    default: return t
  }
}

function regionColor(r: string): string {
  switch (r) {
    case 'fertile-delta': return chalk.rgb(34, 139, 34)(r)
    case 'estuary': return chalk.green(r)
    case 'floodplain': return chalk.blue(r)
    case 'wetland': return chalk.cyan(r)
    case 'marsh': return chalk.yellow(r)
    case 'saltpan': return chalk.red(r)
    default: return chalk.dim(r)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'chief-hydrologist': return chalk.rgb(30, 144, 255)(g)
    case 'hydrologist': return chalk.green(g)
    case 'engineer': return chalk.blue(g)
    case 'surveyor': return chalk.cyan(g)
    case 'fisherman': return chalk.yellow(g)
    case 'drifter': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Channel Formatting ──────────────────────────────────────────────────────

function formatWaterChannel(ch: WaterChannel, verbose: boolean): string {
  const line = ` ${conditionColor(ch.condition)} ${chalk.bold(ch.file)} depth:${ch.channelDepth} flow:${scoreColor(ch.flowRate)} sed:${scoreColor(ch.sedimentLoad)} dist:${ch.distributaryCount} silt:${scoreColor(ch.siltation)} flood:${scoreColor(ch.floodControl)} score:${scoreColor(ch.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const c = ch.channel
  details.push(`    channel: ${channelColor(c.type)} d:${c.depth} w:${scoreColor(c.width)} nav:${c.isNavigable ? chalk.green('Y') : chalk.red('N')} undercurrent:${c.hasUndercurrent ? chalk.yellow('Y') : chalk.dim('N')} whirlpool:${c.hasWhirlpool ? chalk.red('Y') : chalk.dim('N')} eddy:${c.hasEddy ? chalk.cyan('Y') : chalk.dim('N')} dir:${c.flowDirection}`)
  const f = ch.flow
  details.push(`    flow: rate:${scoreColor(f.rate)} steady:${f.isSteady ? chalk.green('Y') : chalk.dim('N')} turbulent:${f.isTurbulent ? chalk.red('Y') : chalk.dim('N')} laminar:${f.isLaminar ? chalk.green('Y') : chalk.dim('N')} waterfall:${f.hasWaterfall ? chalk.red('Y') : chalk.dim('N')}(${f.waterfallCount}) rapids:${f.hasRapids ? chalk.yellow('Y') : chalk.dim('N')}(${f.rapidCount}) plunge:${f.hasPlungePool ? chalk.red('Y') : chalk.dim('N')}`)
  const s = ch.sediment
  details.push(`    sediment: load:${scoreColor(s.load)} suspended:${s.isSuspended ? chalk.red('Y') : chalk.dim('N')} settled:${s.isSettled ? chalk.green('Y') : chalk.dim('N')} bedLoad:${s.hasBedLoad ? chalk.yellow('Y') : chalk.dim('N')} silt:${s.hasSilt ? chalk.red('Y') : chalk.dim('N')} gravel:${s.hasGravel ? chalk.green('Y') : chalk.dim('N')} siltLvl:${scoreColor(s.siltLevel)}`)
  const d = ch.distributary
  details.push(`    distributary: count:${d.count} balanced:${d.isBalanced ? chalk.green('Y') : chalk.red('N')} dominant:${d.hasDominantChannel ? chalk.yellow('Y') : chalk.dim('N')} dead:${d.hasDeadChannels ? chalk.red('Y') : chalk.dim('N')}(${d.deadChannelCount}) braided:${d.hasBraidedChannels ? chalk.yellow('Y') : chalk.dim('N')} bal:${scoreColor(d.balanceScore)}`)
  const fl = ch.flood
  details.push(`    flood: ctrl:${scoreColor(fl.control)} levees:${fl.hasLevees ? chalk.green('Y') : chalk.red('N')}(${fl.leveeCount}) gates:${fl.hasFloodGates ? chalk.green('Y') : chalk.dim('N')} spillways:${fl.hasSpillways ? chalk.green('Y') : chalk.dim('N')}(${fl.spillwayCount}) inundated:${fl.isInundated ? chalk.red('Y') : chalk.dim('N')}`)
  const b = ch.bank
  details.push(`    bank: stable:${b.isStable ? chalk.green('Y') : chalk.red('N')} eroding:${b.isEroding ? chalk.red('Y') : chalk.dim('N')} vegetation:${b.hasVegetation ? chalk.green('Y') : chalk.dim('N')} reinforced:${b.isReinforced ? chalk.green('Y') : chalk.dim('N')} erosion:${b.erosionPoints} vegDensity:${scoreColor(b.vegetationDensity)}`)
  return details.join('\n')
}

// ─── Region Formatting ───────────────────────────────────────────────────────

function formatDeltaRegion(region: DeltaRegion): string {
  return `  ${chalk.bold(region.directory)} ${regionColor(region.regionType)} depth:${region.avgChannelDepth} flow:${scoreColor(region.avgFlowRate)} sed:${scoreColor(region.avgSedimentLoad)} flood:${scoreColor(region.avgFloodControl)} nav:${region.navigableCount} stag:${region.stagnantCount} dist:${region.totalDistributaries}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format river-delta result as table
 * @example
 * formatRiverDeltaTable(result, false) // string
 */
export function formatRiverDeltaTable(result: RiverDeltaResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌊  River Delta - Code Branching/Fan-Out Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🏞️ Water Channels'))
  if (result.channels.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.channels : result.channels.slice(0, 15)
    for (const ch of display) {
      lines.push(formatWaterChannel(ch, verbose))
    }
    if (!verbose && result.channels.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.channels.length - 15} more`))
    }
  }
  lines.push('')

  if (result.regions.length > 0) {
    lines.push(chalk.bold('🗺️ Delta Regions'))
    for (const region of result.regions) {
      lines.push(formatDeltaRegion(region))
    }
    lines.push('')
  }

  const basin = result.basin
  lines.push(chalk.bold('💧 Basin'))
  lines.push(`  Depth:${basin.avgChannelDepth} Flow:${scoreColor(basin.avgFlowRate)} Sediment:${scoreColor(basin.avgSedimentLoad)} Flood:${scoreColor(basin.avgFloodControl)} Distributaries:${basin.totalDistributaries} Navigable:${basin.isNavigable ? chalk.green('YES') : chalk.red('NO')} OverallFlow:${scoreColor(basin.overallFlow)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.hydrologistGrade)} | Flow: ${scoreColor(s.overallFlow)} | Files: ${s.totalFiles} | Regions: ${s.totalRegions}`)
  lines.push(`  DeepRiver:${s.deepRiverCount} ClearStream:${s.clearStreamCount} Meandering:${s.meanderingCount} Swamp:${s.swampCount} Mudflat:${s.mudflatCount} Desert:${s.desertWashCount}`)
  lines.push(`  MainChannel:${s.mainChannelCount} Distributary:${s.distributaryCount} Tributary:${s.tributaryCount} Backwater:${s.backwaterCount}`)
  lines.push(`  Navigable:${s.navigableCount} Turbulent:${s.turbulentCount} Waterfall:${s.hasWaterfallCount} DeadChannels:${s.hasDeadChannelsCount}`)
  lines.push(`  Levees:${s.hasLeveesCount} Spillways:${s.hasSpillwaysCount} Inundated:${s.isInundatedCount} Stable:${s.isStableCount} Vegetation:${s.hasVegetationCount}`)
  lines.push(`  Deepest:${chalk.blue(s.deepestChannel)} | Clearest:${chalk.green(s.clearestFlow)} | Silted:${chalk.red(s.mostSilted)} | FloodCtrl:${chalk.cyan(s.bestFloodControl)} | Branched:${chalk.magenta(s.mostBranched)}`)

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
 * Format river-delta result as JSON
 * @example
 * formatRiverDeltaJson(result) // string
 */
export function formatRiverDeltaJson(result: RiverDeltaResult): string {
  return JSON.stringify(result, null, 2)
}
