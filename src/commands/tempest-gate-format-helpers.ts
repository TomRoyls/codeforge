import chalk from 'chalk'

import type { TempestGateResult } from './tempest-gate-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example stormCategoryColor('category-5-proof') returns colored string */
export function stormCategoryColor(c: string): string {
  switch (c) {
    case 'category-5-proof': return chalk.rgb(100, 149, 237).bold(c)
    case 'hurricane-rated': return chalk.rgb(46, 204, 113)(c)
    case 'storm-tested': return chalk.rgb(155, 89, 182)(c)
    case 'moderate': return chalk.rgb(52, 152, 219)(c)
    case 'light-duty': return chalk.rgb(241, 196, 15)(c)
    case 'collapses': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example thunderVolumeColor('thunderous') returns colored string */
export function thunderVolumeColor(v: string): string {
  switch (v) {
    case 'thunderous': return chalk.rgb(100, 149, 237).bold(v)
    case 'powerful': return chalk.rgb(46, 204, 113)(v)
    case 'resonant': return chalk.rgb(155, 89, 182)(v)
    case 'moderate': return chalk.rgb(52, 152, 219)(v)
    case 'distant': return chalk.rgb(241, 196, 15)(v)
    case 'silent': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example lightningSpeedColor('bolt-speed') returns colored string */
export function lightningSpeedColor(s: string): string {
  switch (s) {
    case 'bolt-speed': return chalk.rgb(100, 149, 237).bold(s)
    case 'rapid-flash': return chalk.rgb(46, 204, 113)(s)
    case 'quick-strike': return chalk.rgb(155, 89, 182)(s)
    case 'moderate': return chalk.rgb(52, 152, 219)(s)
    case 'slow-arc': return chalk.rgb(241, 196, 15)(s)
    case 'no-flash': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example floodProtectionColor('levee-master') returns colored string */
export function floodProtectionColor(p: string): string {
  switch (p) {
    case 'levee-master': return chalk.rgb(100, 149, 237).bold(p)
    case 'flood-wall': return chalk.rgb(46, 204, 113)(p)
    case 'proper-drainage': return chalk.rgb(155, 89, 182)(p)
    case 'sandbags': return chalk.rgb(52, 152, 219)(p)
    case 'leaky-dike': return chalk.rgb(241, 196, 15)(p)
    case 'submerged': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example windRatingColor('tornado-proof') returns colored string */
export function windRatingColor(r: string): string {
  switch (r) {
    case 'tornado-proof': return chalk.rgb(100, 149, 237).bold(r)
    case 'hurricane-rated': return chalk.rgb(46, 204, 113)(r)
    case 'gale-force': return chalk.rgb(155, 89, 182)(r)
    case 'moderate-breeze': return chalk.rgb(52, 152, 219)(r)
    case 'light-wind': return chalk.rgb(241, 196, 15)(r)
    case 'blown-away': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example integrityStateColor('impregnable') returns colored string */
export function integrityStateColor(s: string): string {
  switch (s) {
    case 'impregnable': return chalk.rgb(100, 149, 237).bold(s)
    case 'fortress-grade': return chalk.rgb(46, 204, 113)(s)
    case 'solid-gate': return chalk.rgb(155, 89, 182)(s)
    case 'sturdy-door': return chalk.rgb(52, 152, 219)(s)
    case 'rusted-gate': return chalk.rgb(241, 196, 15)(s)
    case 'broken': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('impregnable-fortress') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'impregnable-fortress': return chalk.rgb(100, 149, 237).bold(c)
    case 'storm-castle': return chalk.rgb(46, 204, 113)(c)
    case 'solid-gatehouse': return chalk.rgb(155, 89, 182)(c)
    case 'weathered-gate': return chalk.rgb(52, 152, 219)(c)
    case 'crumbling-wall': return chalk.rgb(241, 196, 15)(c)
    case 'ruins': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example commanderGradeColor('fortress-commander') returns colored string */
export function commanderGradeColor(g: string): string {
  switch (g) {
    case 'fortress-commander': return chalk.rgb(100, 149, 237).bold(g)
    case 'castle-warden': return chalk.rgb(46, 204, 113)(g)
    case 'gatekeeper': return chalk.rgb(155, 89, 182)(g)
    case 'guard': return chalk.rgb(52, 152, 219)(g)
    case 'watchman': return chalk.rgb(241, 196, 15)(g)
    case 'deserter': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example wallTypeColor('great-wall') returns colored string */
export function wallTypeColor(t: string): string {
  switch (t) {
    case 'great-wall': return chalk.rgb(100, 149, 237).bold(t)
    case 'castle-wall': return chalk.rgb(46, 204, 113)(t)
    case 'city-wall': return chalk.rgb(155, 89, 182)(t)
    case 'garden-wall': return chalk.rgb(52, 152, 219)(t)
    case 'fence': return chalk.rgb(241, 196, 15)(t)
    case 'no-barrier': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example wallConditionColor('impregnable') returns colored string */
export function wallConditionColor(c: string): string {
  switch (c) {
    case 'impregnable': return chalk.rgb(100, 149, 237).bold(c)
    case 'stronghold': return chalk.rgb(46, 204, 113)(c)
    case 'defensible': return chalk.rgb(155, 89, 182)(c)
    case 'breached': return chalk.rgb(52, 152, 219)(c)
    case 'crumbling': return chalk.rgb(241, 196, 15)(c)
    case 'fallen': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatTempestGateJson(result) returns JSON string */
export function formatTempestGateJson(result: TempestGateResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatTempestGateTable(result, verbose) returns formatted string */
export function formatTempestGateTable(result: TempestGateResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Tempest Gate Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Fortress Overview:'))
  lines.push(`    Overall Fortification:  ${scoreColor(result.fortress.overallFortification)}`)
  lines.push(`    Avg Storm Resistance:   ${scoreColor(result.fortress.avgStorm)}`)
  lines.push(`    Avg Flood Defense:      ${scoreColor(result.fortress.avgFlood)}`)
  lines.push(`    Avg Gate Integrity:     ${scoreColor(result.fortress.avgIntegrity)}`)
  lines.push(`    Is Impregnable:         ${result.fortress.isImpregnable ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Walls:            ${result.stats.totalWalls}`)
  lines.push(`    Avg Storm Resistance:   ${scoreColor(result.stats.avgStormResistance)}`)
  lines.push(`    Avg Thunder Quality:    ${scoreColor(result.stats.avgThunderQuality)}`)
  lines.push(`    Avg Lightning Path:     ${scoreColor(result.stats.avgLightningPath)}`)
  lines.push(`    Avg Flood Defense:      ${scoreColor(result.stats.avgFloodDefense)}`)
  lines.push(`    Avg Wind Endurance:     ${scoreColor(result.stats.avgWindEndurance)}`)
  lines.push(`    Avg Gate Integrity:     ${scoreColor(result.stats.avgGateIntegrity)}`)
  lines.push(`    Commander Grade:        ${commanderGradeColor(result.stats.commanderGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Impregnable Fortress: ${result.stats.impregnableFortressCount}`)
  lines.push(`    Storm Castle:        ${result.stats.stormCastleCount}`)
  lines.push(`    Solid Gatehouse:     ${result.stats.solidGatehouseCount}`)
  lines.push(`    Weathered Gate:      ${result.stats.weatheredGateCount}`)
  lines.push(`    Crumbling Wall:      ${result.stats.crumblingWallCount}`)
  lines.push(`    Ruins:               ${result.stats.ruinsCount}`)
  lines.push('')

  if (result.stats.bestSection) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Section:     ${result.stats.bestSection}`)
    lines.push(`    Most Resilient:   ${result.stats.mostResilient}`)
    lines.push(`    Most Impactful:   ${result.stats.mostImpactful}`)
    lines.push(`    Fastest:          ${result.stats.fastest}`)
    lines.push(`    Best Defended:    ${result.stats.bestDefended}`)
    lines.push(`    Most Reliable:    ${result.stats.mostReliable}`)
    lines.push('')
  }

  if (verbose && result.sections.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const sec of result.sections) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(sec.file)}`)
      lines.push(`      Score: ${scoreColor(sec.qualityScore)}  Condition: ${conditionColor(sec.condition)}`)
      lines.push(`      Storm: ${stormCategoryColor(sec.storm.category)}(${sec.stormResistance})  Thunder: ${thunderVolumeColor(sec.thunder.volume)}(${sec.thunderQuality})  Lightning: ${lightningSpeedColor(sec.lightning.speed)}(${sec.lightningPath})`)
      lines.push(`      Flood: ${floodProtectionColor(sec.flood.protection)}(${sec.floodDefense})  Wind: ${windRatingColor(sec.wind.rating)}(${sec.windEndurance})  Integrity: ${integrityStateColor(sec.integrity.state)}(${sec.gateIntegrity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 149, 237)('\u{2728}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
