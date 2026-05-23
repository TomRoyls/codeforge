import chalk from 'chalk'

import type { AmberLighthouseResult } from './amber-lighthouse-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example intensityColor('million-candlepower') returns colored string */
export function intensityColor(i: string): string {
  switch (i) {
    case 'million-candlepower': return chalk.rgb(100, 149, 237).bold(i)
    case 'powerful-beacon': return chalk.rgb(46, 204, 113)(i)
    case 'bright-light': return chalk.rgb(155, 89, 182)(i)
    case 'standard': return chalk.rgb(52, 152, 219)(i)
    case 'dim-bulb': return chalk.rgb(241, 196, 15)(i)
    case 'dark': return chalk.rgb(231, 76, 60)(i)
    default: return i
  }
}

/** @example clarityColor('crystal-piercing') returns colored string */
export function clarityColor(c: string): string {
  switch (c) {
    case 'crystal-piercing': return chalk.rgb(100, 149, 237).bold(c)
    case 'fog-cutting': return chalk.rgb(46, 204, 113)(c)
    case 'penetrating': return chalk.rgb(155, 89, 182)(c)
    case 'moderate': return chalk.rgb(52, 152, 219)(c)
    case 'dim': return chalk.rgb(241, 196, 15)(c)
    case 'opaque': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example effectivenessColor('fail-safe-system') returns colored string */
export function effectivenessColor(e: string): string {
  switch (e) {
    case 'fail-safe-system': return chalk.rgb(100, 149, 237).bold(e)
    case 'excellent-warning': return chalk.rgb(46, 204, 113)(e)
    case 'proper-alert': return chalk.rgb(155, 89, 182)(e)
    case 'basic-signal': return chalk.rgb(52, 152, 219)(e)
    case 'faint-horn': return chalk.rgb(241, 196, 15)(e)
    case 'silent': return chalk.rgb(231, 76, 60)(e)
    default: return e
  }
}

/** @example bedrockColor('granite-bedrock') returns colored string */
export function bedrockColor(b: string): string {
  switch (b) {
    case 'granite-bedrock': return chalk.rgb(100, 149, 237).bold(b)
    case 'solid-foundation': return chalk.rgb(46, 204, 113)(b)
    case 'concrete-base': return chalk.rgb(155, 89, 182)(b)
    case 'wooden-pier': return chalk.rgb(52, 152, 219)(b)
    case 'sandbar': return chalk.rgb(241, 196, 15)(b)
    case 'quicksand': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example sweepColor('360-degree') returns colored string */
export function sweepColor(s: string): string {
  switch (s) {
    case '360-degree': return chalk.rgb(100, 149, 237).bold(s)
    case 'wide-sweep': return chalk.rgb(46, 204, 113)(s)
    case 'good-coverage': return chalk.rgb(155, 89, 182)(s)
    case 'partial-sweep': return chalk.rgb(52, 152, 219)(s)
    case 'narrow-beam': return chalk.rgb(241, 196, 15)(s)
    case 'no-rotation': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example ratingColor('master-pilot') returns colored string */
export function ratingColor(r: string): string {
  switch (r) {
    case 'master-pilot': return chalk.rgb(100, 149, 237).bold(r)
    case 'skilled-navigator': return chalk.rgb(46, 204, 113)(r)
    case 'reliable-guide': return chalk.rgb(155, 89, 182)(r)
    case 'basic-aid': return chalk.rgb(52, 152, 219)(r)
    case 'unreliable': return chalk.rgb(241, 196, 15)(r)
    case 'misleading': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example conditionColor('coastal-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'coastal-masterpiece': return chalk.rgb(100, 149, 237).bold(c)
    case 'reliable-beacon': return chalk.rgb(46, 204, 113)(c)
    case 'functional-light': return chalk.rgb(155, 89, 182)(c)
    case 'flickering-candle': return chalk.rgb(52, 152, 219)(c)
    case 'broken-lens': return chalk.rgb(241, 196, 15)(c)
    case 'dark-tower': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example keeperGradeColor('master-keeper') returns colored string */
export function keeperGradeColor(g: string): string {
  switch (g) {
    case 'master-keeper': return chalk.rgb(100, 149, 237).bold(g)
    case 'lighthouse-keeper': return chalk.rgb(46, 204, 113)(g)
    case 'watchman': return chalk.rgb(155, 89, 182)(g)
    case 'tender': return chalk.rgb(52, 152, 219)(g)
    case 'observer': return chalk.rgb(241, 196, 15)(g)
    case 'absentee': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example coastlineTypeColor('major-lighthouse') returns colored string */
export function coastlineTypeColor(t: string): string {
  switch (t) {
    case 'major-lighthouse': return chalk.rgb(100, 149, 237).bold(t)
    case 'harbor-light': return chalk.rgb(46, 204, 113)(t)
    case 'coastal-beacon': return chalk.rgb(155, 89, 182)(t)
    case 'channel-marker': return chalk.rgb(52, 152, 219)(t)
    case 'buoy': return chalk.rgb(241, 196, 15)(t)
    case 'darkness': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example coastConditionColor('illuminated-coast') returns colored string */
export function coastConditionColor(c: string): string {
  switch (c) {
    case 'illuminated-coast': return chalk.rgb(100, 149, 237).bold(c)
    case 'well-lit-harbor': return chalk.rgb(46, 204, 113)(c)
    case 'guided-channel': return chalk.rgb(155, 89, 182)(c)
    case 'dim-shoreline': return chalk.rgb(52, 152, 219)(c)
    case 'dark-coast': return chalk.rgb(241, 196, 15)(c)
    case 'void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAmberLighthouseJson(result) returns JSON string */
export function formatAmberLighthouseJson(result: AmberLighthouseResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAmberLighthouseTable(result, verbose) returns formatted string */
export function formatAmberLighthouseTable(result: AmberLighthouseResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Amber Lighthouse Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Coast Overview:'))
  lines.push(`    Overall Illumination: ${scoreColor(result.coast.overallIllumination)}`)
  lines.push(`    Avg Beacon:           ${scoreColor(result.coast.avgBeacon)}`)
  lines.push(`    Avg Warning:          ${scoreColor(result.coast.avgWarning)}`)
  lines.push(`    Avg Guidance:         ${scoreColor(result.coast.avgGuidance)}`)
  lines.push(`    Is Illuminated:       ${result.coast.isIlluminated ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Coastlines:     ${result.stats.totalCoastlines}`)
  lines.push(`    Avg Beacon:           ${scoreColor(result.stats.avgBeaconStrength)}`)
  lines.push(`    Avg Fog:              ${scoreColor(result.stats.avgFogPenetration)}`)
  lines.push(`    Avg Warning:          ${scoreColor(result.stats.avgWarningSystem)}`)
  lines.push(`    Avg Foundation:       ${scoreColor(result.stats.avgFoundationStability)}`)
  lines.push(`    Avg Coverage:         ${scoreColor(result.stats.avgRotatingCoverage)}`)
  lines.push(`    Avg Guidance:         ${scoreColor(result.stats.avgGuidanceQuality)}`)
  lines.push(`    Keeper Grade:         ${keeperGradeColor(result.stats.keeperGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Masterpiece:        ${result.stats.coastalMasterpieceCount}`)
  lines.push(`    Reliable Beacon:    ${result.stats.reliableBeaconCount}`)
  lines.push(`    Functional Light:   ${result.stats.functionalLightCount}`)
  lines.push(`    Flickering Candle:  ${result.stats.flickeringCandleCount}`)
  lines.push(`    Broken Lens:        ${result.stats.brokenLensCount}`)
  lines.push(`    Dark Tower:         ${result.stats.darkTowerCount}`)
  lines.push('')

  if (result.stats.bestRay) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Ray:           ${result.stats.bestRay}`)
    lines.push(`    Brightest:          ${result.stats.brightest}`)
    lines.push(`    Clearest In Fog:    ${result.stats.clearestInFog}`)
    lines.push(`    Best Warnings:      ${result.stats.bestWarnings}`)
    lines.push(`    Most Stable:        ${result.stats.mostStable}`)
    lines.push(`    Most Complete:      ${result.stats.mostComplete}`)
    lines.push('')
  }

  if (verbose && result.rays.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const ray of result.rays) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(ray.file)}`)
      lines.push(`      Score: ${scoreColor(ray.qualityScore)}  Condition: ${conditionColor(ray.condition)}`)
      lines.push(`      Beacon: ${intensityColor(ray.beacon.intensity)}(${ray.beaconStrength})  Fog: ${clarityColor(ray.fog.clarity)}(${ray.fogPenetration})  Warning: ${effectivenessColor(ray.warning.effectiveness)}(${ray.warningSystem})`)
      lines.push(`      Foundation: ${bedrockColor(ray.foundation.bedrock)}(${ray.foundationStability})  Coverage: ${sweepColor(ray.coverage.sweep)}(${ray.rotatingCoverage})  Guidance: ${ratingColor(ray.guidance.rating)}(${ray.guidanceQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 149, 237)('\u2728')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
