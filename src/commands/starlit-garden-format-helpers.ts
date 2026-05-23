import chalk from 'chalk'
import type { StarlitGardenResult } from './starlit-garden-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(155, 89, 182)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example aweColor('transcendent-wonder') returns colored string */
export function aweColor(a: string): string {
  switch (a) {
    case 'transcendent-wonder': return chalk.rgb(155, 89, 182).bold(a)
    case 'inspiring': return chalk.rgb(46, 204, 113)(a)
    case 'noteworthy': return chalk.rgb(52, 152, 219)(a)
    case 'pleasant': return chalk.rgb(241, 196, 15)(a)
    case 'ordinary': return chalk.rgb(230, 126, 34)(a)
    case 'uninspiring': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example patternColor('perfect-constellation') returns colored string */
export function patternColor(p: string): string {
  switch (p) {
    case 'perfect-constellation': return chalk.rgb(155, 89, 182).bold(p)
    case 'clear-star-map': return chalk.rgb(46, 204, 113)(p)
    case 'recognizable-pattern': return chalk.rgb(52, 152, 219)(p)
    case 'scattered-stars': return chalk.rgb(241, 196, 15)(p)
    case 'random-dots': return chalk.rgb(230, 126, 34)(p)
    case 'void': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example orderColor('celestial-harmony') returns colored string */
export function orderColor(o: string): string {
  switch (o) {
    case 'celestial-harmony': return chalk.rgb(155, 89, 182).bold(o)
    case 'orbital-precision': return chalk.rgb(46, 204, 113)(o)
    case 'proper-orbits': return chalk.rgb(52, 152, 219)(o)
    case 'drifting': return chalk.rgb(241, 196, 15)(o)
    case 'tumbling': return chalk.rgb(230, 126, 34)(o)
    case 'chaotic-orbit': return chalk.rgb(231, 76, 60)(o)
    default: return o
  }
}

/** @example radianceColor('moonlit-splendor') returns colored string */
export function radianceColor(r: string): string {
  switch (r) {
    case 'moonlit-splendor': return chalk.rgb(155, 89, 182).bold(r)
    case 'starlit-elegance': return chalk.rgb(46, 204, 113)(r)
    case 'twilight-charm': return chalk.rgb(52, 152, 219)(r)
    case 'dim-glow': return chalk.rgb(241, 196, 15)(r)
    case 'dark-shadow': return chalk.rgb(230, 126, 34)(r)
    case 'pitch-black': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example bloomColor('night-orchid') returns colored string */
export function bloomColor(b: string): string {
  switch (b) {
    case 'night-orchid': return chalk.rgb(155, 89, 182).bold(b)
    case 'moonflower': return chalk.rgb(46, 204, 113)(b)
    case 'evening-primrose': return chalk.rgb(52, 152, 219)(b)
    case 'twilight-jasmine': return chalk.rgb(241, 196, 15)(b)
    case 'shade-plant': return chalk.rgb(230, 126, 34)(b)
    case 'never-blooms': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example brightnessColor('lighthouse-beam') returns colored string */
export function brightnessColor(b: string): string {
  switch (b) {
    case 'lighthouse-beam': return chalk.rgb(155, 89, 182).bold(b)
    case 'bright-star': return chalk.rgb(46, 204, 113)(b)
    case 'lantern-glow': return chalk.rgb(52, 152, 219)(b)
    case 'candle-flicker': return chalk.rgb(241, 196, 15)(b)
    case 'dying-ember': return chalk.rgb(230, 126, 34)(b)
    case 'darkness': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example conditionColor('celestial-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'celestial-masterpiece': return chalk.rgb(155, 89, 182).bold(c)
    case 'starlit-paradise': return chalk.rgb(46, 204, 113)(c)
    case 'moonlit-garden': return chalk.rgb(52, 152, 219)(c)
    case 'twilight-patch': return chalk.rgb(241, 196, 15)(c)
    case 'dark-corner': return chalk.rgb(230, 126, 34)(c)
    case 'lightless-void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-astronomer') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-astronomer': return chalk.rgb(155, 89, 182).bold(g)
    case 'expert-stargazer': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-observer': return chalk.rgb(52, 152, 219)(g)
    case 'amateur-astronomer': return chalk.rgb(241, 196, 15)(g)
    case 'casual-gazer': return chalk.rgb(230, 126, 34)(g)
    case 'cloudy-night': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatStarlitGardenJson(result) returns JSON string */
export function formatStarlitGardenJson(result: StarlitGardenResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatStarlitGardenTable(result, verbose) returns formatted string */
export function formatStarlitGardenTable(result: StarlitGardenResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Starlit Garden Analysis'))
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Observatory:'))
  lines.push(`    Overall Luminosity:    ${scoreColor(result.observatory.overallLuminosity)}`)
  lines.push(`    Avg Wonder:            ${scoreColor(result.observatory.avgWonder)}`)
  lines.push(`    Avg Organization:      ${scoreColor(result.observatory.avgOrganization)}`)
  lines.push(`    Avg Guiding Light:     ${scoreColor(result.observatory.avgGuidingLight)}`)
  lines.push(`    Is Wondrous:           ${result.observatory.isWondrous ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Plots:                  ${result.stats.totalPlots}`)
  lines.push(`    Avg Wonder:                   ${scoreColor(result.stats.avgWonder)}`)
  lines.push(`    Avg Constellation Mapping:    ${scoreColor(result.stats.avgConstellationMapping)}`)
  lines.push(`    Avg Celestial Organization:   ${scoreColor(result.stats.avgCelestialOrganization)}`)
  lines.push(`    Avg Nocturnal Beauty:         ${scoreColor(result.stats.avgNocturnalBeauty)}`)
  lines.push(`    Avg Night Bloom:              ${scoreColor(result.stats.avgNightBloom)}`)
  lines.push(`    Avg Guiding Light:            ${scoreColor(result.stats.avgGuidingLight)}`)
  lines.push(`    Astronomer Grade:             ${gradeColor(result.stats.astronomerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Condition Counts:'))
  lines.push(`    Celestial Masterpiece:   ${result.stats.celestialMasterpieceCount}`)
  lines.push(`    Starlit Paradise:        ${result.stats.starlitParadiseCount}`)
  lines.push(`    Moonlit Garden:          ${result.stats.moonlitGardenCount}`)
  lines.push(`    Twilight Patch:          ${result.stats.twilightPatchCount}`)
  lines.push(`    Dark Corner:             ${result.stats.darkCornerCount}`)
  lines.push(`    Lightless Void:          ${result.stats.lightlessVoidCount}`)
  lines.push('')

  if (result.stats.bestFlower) {
    lines.push(chalk.rgb(155, 89, 182)('  Highlights:'))
    lines.push(`    Best Flower:       ${result.stats.bestFlower}`)
    lines.push(`    Most Inspiring:    ${result.stats.mostInspiring}`)
    lines.push(`    Best Organized:    ${result.stats.bestOrganized}`)
    lines.push(`    Best Structured:   ${result.stats.bestStructured}`)
    lines.push(`    Most Beautiful:    ${result.stats.mostBeautiful}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push('')
  }

  if (verbose && result.flowers.length > 0) {
    lines.push(chalk.rgb(155, 89, 182)('  Per-File Flowers:'))
    for (const f of result.flowers) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Wonder: ${aweColor(f.wondrous.awe)}(${f.wonder})  Constellation: ${patternColor(f.constellation.pattern)}(${f.constellationMapping})  Celestial: ${orderColor(f.celestial.order)}(${f.celestialOrganization})`)
      lines.push(`      Nocturnal: ${radianceColor(f.nocturnal.radiance)}(${f.nocturnalBeauty})  Bloom: ${bloomColor(f.blooming.bloom)}(${f.nightBloom})  Guiding: ${brightnessColor(f.guiding.brightness)}(${f.guidingLight})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(155, 89, 182)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u2728')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
