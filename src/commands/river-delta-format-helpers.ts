import chalk from 'chalk'

import type { RiverDeltaResult } from './river-delta-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('fertile-estuary') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'fertile-estuary': return chalk.rgb(255, 215, 0).bold(condition)
    case 'healthy-delta': return chalk.rgb(46, 204, 113)(condition)
    case 'developing': return chalk.rgb(52, 152, 219)(condition)
    case 'eroding': return chalk.rgb(241, 196, 15)(condition)
    case 'barren': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-river': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-steward') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-steward': return chalk.rgb(255, 215, 0).bold(grade)
    case 'riverkeeper': return chalk.rgb(46, 204, 113)(grade)
    case 'warden': return chalk.rgb(155, 89, 182)(grade)
    case 'guard': return chalk.rgb(52, 152, 219)(grade)
    case 'watchman': return chalk.rgb(241, 196, 15)(grade)
    case 'absentee': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example currentColor('torrent') returns colored string */
export function currentColor(current: string): string {
  switch (current) {
    case 'torrent': return chalk.rgb(255, 215, 0).bold(current)
    case 'rapid': return chalk.rgb(46, 204, 113)(current)
    case 'moderate': return chalk.rgb(155, 89, 182)(current)
    case 'gentle': return chalk.rgb(52, 152, 219)(current)
    case 'sluggish': return chalk.rgb(241, 196, 15)(current)
    case 'stagnant': return chalk.rgb(231, 76, 60)(current)
    default: return current
  }
}

/** @example clarityColor('crystal') returns colored string */
export function clarityColor(state: string): string {
  switch (state) {
    case 'crystal': return chalk.rgb(255, 215, 0).bold(state)
    case 'clear': return chalk.rgb(46, 204, 113)(state)
    case 'murky': return chalk.rgb(155, 89, 182)(state)
    case 'turbid': return chalk.rgb(52, 152, 219)(state)
    case 'muddy': return chalk.rgb(241, 196, 15)(state)
    case 'polluted': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example richnessColor('alluvial-gold') returns colored string */
export function richnessColor(quality: string): string {
  switch (quality) {
    case 'alluvial-gold': return chalk.rgb(255, 215, 0).bold(quality)
    case 'rich-silt': return chalk.rgb(46, 204, 113)(quality)
    case 'sand': return chalk.rgb(155, 89, 182)(quality)
    case 'gravel': return chalk.rgb(52, 152, 219)(quality)
    case 'clay': return chalk.rgb(241, 196, 15)(quality)
    case 'bedrock': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example networkColor('mega-delta') returns colored string */
export function networkColor(network: string): string {
  switch (network) {
    case 'mega-delta': return chalk.rgb(255, 215, 0).bold(network)
    case 'large-delta': return chalk.rgb(46, 204, 113)(network)
    case 'medium-delta': return chalk.rgb(155, 89, 182)(network)
    case 'small-delta': return chalk.rgb(52, 152, 219)(network)
    case 'creek': return chalk.rgb(241, 196, 15)(network)
    case 'trickle': return chalk.rgb(231, 76, 60)(network)
    default: return network
  }
}

/** @example zoneColor('fertile-crescent') returns colored string */
export function zoneColor(zone: string): string {
  switch (zone) {
    case 'fertile-crescent': return chalk.rgb(255, 215, 0).bold(zone)
    case 'rich-farmland': return chalk.rgb(46, 204, 113)(zone)
    case 'meadow': return chalk.rgb(155, 89, 182)(zone)
    case 'scrubland': return chalk.rgb(52, 152, 219)(zone)
    case 'desert': return chalk.rgb(241, 196, 15)(zone)
    case 'wasteland': return chalk.rgb(231, 76, 60)(zone)
    default: return zone
  }
}

/** @example strengthColor('granite') returns colored string */
export function strengthColor(strength: string): string {
  switch (strength) {
    case 'granite': return chalk.rgb(255, 215, 0).bold(strength)
    case 'limestone': return chalk.rgb(46, 204, 113)(strength)
    case 'sandstone': return chalk.rgb(155, 89, 182)(strength)
    case 'shale': return chalk.rgb(52, 152, 219)(strength)
    case 'loose-soil': return chalk.rgb(241, 196, 15)(strength)
    case 'quicksand': return chalk.rgb(231, 76, 60)(strength)
    default: return strength
  }
}

/** @example regionTypeColor('mega-delta') returns colored string */
export function regionTypeColor(type: string): string {
  switch (type) {
    case 'mega-delta': return chalk.rgb(255, 215, 0).bold(type)
    case 'river-mouth': return chalk.rgb(46, 204, 113)(type)
    case 'estuary': return chalk.rgb(155, 89, 182)(type)
    case 'creek': return chalk.rgb(52, 152, 219)(type)
    case 'ditch': return chalk.rgb(241, 196, 15)(type)
    case 'dry-bed': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatRiverDeltaJson(result) returns JSON string */
export function formatRiverDeltaJson(result: RiverDeltaResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatRiverDeltaTable(result, verbose) returns formatted string */
export function formatRiverDeltaTable(result: RiverDeltaResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(52, 152, 219).bold('  River Delta Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Basin Overview:'))
  lines.push(`    Overall Fertility:       ${scoreColor(result.basin.overallFertility)}`)
  lines.push(`    Avg Force:               ${scoreColor(result.basin.avgForce)}`)
  lines.push(`    Avg Clarity:             ${scoreColor(result.basin.avgClarity)}`)
  lines.push(`    Avg Fertility:           ${scoreColor(result.basin.avgFertility)}`)
  lines.push(`    Is Fertile:              ${result.basin.isFertile ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Regions:            ${result.stats.totalRegions}`)
  lines.push(`    Avg Upstream Force:       ${scoreColor(result.stats.avgUpstreamForce)}`)
  lines.push(`    Avg Channel Clarity:      ${scoreColor(result.stats.avgChannelClarity)}`)
  lines.push(`    Avg Sediment Richness:    ${scoreColor(result.stats.avgSedimentRichness)}`)
  lines.push(`    Avg Distributary Reach:   ${scoreColor(result.stats.avgDistributaryReach)}`)
  lines.push(`    Avg Delta Fertility:      ${scoreColor(result.stats.avgDeltaFertility)}`)
  lines.push(`    Avg Erosion Resistance:   ${scoreColor(result.stats.avgErosionResistance)}`)
  lines.push(`    Steward Grade:            ${gradeColor(result.stats.stewardGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Fertile Estuary:          ${result.stats.fertileEstuaryCount}`)
  lines.push(`    Healthy Delta:            ${result.stats.healthyDeltaCount}`)
  lines.push(`    Developing:               ${result.stats.developingCount}`)
  lines.push(`    Eroding:                  ${result.stats.erodingCount}`)
  lines.push(`    Barren:                   ${result.stats.barrenCount}`)
  lines.push(`    Dead River:               ${result.stats.deadRiverCount}`)
  lines.push('')

  if (result.stats.bestLayer) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Layer:       ${result.stats.bestLayer}`)
    lines.push(`    Most Forceful:    ${result.stats.mostForceful}`)
    lines.push(`    Clearest:         ${result.stats.clearest}`)
    lines.push(`    Richest:          ${result.stats.richest}`)
    lines.push(`    Widest Reach:     ${result.stats.widestReach}`)
    lines.push(`    Most Fertile:     ${result.stats.mostFertile}`)
    lines.push('')
  }

  if (verbose && result.layers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const layer of result.layers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(layer.file)}`)
      lines.push(`      Score: ${scoreColor(layer.qualityScore)}  Condition: ${conditionColor(layer.condition)}`)
      lines.push(`      Upstream: ${currentColor(layer.upstream.current)}(${layer.upstreamForce})  Channel: ${clarityColor(layer.channel.state)}(${layer.channelClarity})  Sediment: ${richnessColor(layer.sediment.quality)}(${layer.sedimentRichness})`)
      lines.push(`      Distributary: ${networkColor(layer.distributary.network)}(${layer.distributaryReach})  Fertility: ${zoneColor(layer.fertility.zone)}(${layer.deltaFertility})  Erosion: ${strengthColor(layer.erosion.strength)}(${layer.erosionResistance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)('\u{1F30A}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
