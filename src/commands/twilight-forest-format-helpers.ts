import chalk from 'chalk'

import type { TwilightForestResult } from './twilight-forest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example phaseColor('golden-hour') returns colored string */
export function phaseColor(p: string): string {
  switch (p) {
    case 'golden-hour': return chalk.rgb(100, 149, 237).bold(p)
    case 'blue-hour': return chalk.rgb(46, 204, 113)(p)
    case 'civil-twilight': return chalk.rgb(155, 89, 182)(p)
    case 'nautical-twilight': return chalk.rgb(52, 152, 219)(p)
    case 'astronomical-twilight': return chalk.rgb(241, 196, 15)(p)
    case 'night': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example glowColor('firefly-symphony') returns colored string */
export function glowColor(g: string): string {
  switch (g) {
    case 'firefly-symphony': return chalk.rgb(100, 149, 237).bold(g)
    case 'glowing-fungi': return chalk.rgb(46, 204, 113)(g)
    case 'foxfire': return chalk.rgb(155, 89, 182)(g)
    case 'faint-sparkle': return chalk.rgb(52, 152, 219)(g)
    case 'dim-gleam': return chalk.rgb(241, 196, 15)(g)
    case 'darkness': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example diversityColor('species-rich') returns colored string */
export function diversityColor(d: string): string {
  switch (d) {
    case 'species-rich': return chalk.rgb(100, 149, 237).bold(d)
    case 'diverse-boundary': return chalk.rgb(46, 204, 113)(d)
    case 'healthy-edge': return chalk.rgb(155, 89, 182)(d)
    case 'simple-edge': return chalk.rgb(52, 152, 219)(d)
    case 'barren-border': return chalk.rgb(241, 196, 15)(d)
    case 'wall': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example balanceColor('old-growth-canopy') returns colored string */
export function balanceColor(b: string): string {
  switch (b) {
    case 'old-growth-canopy': return chalk.rgb(100, 149, 237).bold(b)
    case 'balanced-forest': return chalk.rgb(46, 204, 113)(b)
    case 'healthy-mix': return chalk.rgb(155, 89, 182)(b)
    case 'developing': return chalk.rgb(52, 152, 219)(b)
    case 'patchy': return chalk.rgb(241, 196, 15)(b)
    case 'barren': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example healthColor('thriving-understory') returns colored string */
export function healthColor(h: string): string {
  switch (h) {
    case 'thriving-understory': return chalk.rgb(100, 149, 237).bold(h)
    case 'rich-ecosystem': return chalk.rgb(46, 204, 113)(h)
    case 'healthy-growth': return chalk.rgb(155, 89, 182)(h)
    case 'sparse': return chalk.rgb(52, 152, 219)(h)
    case 'barren': return chalk.rgb(241, 196, 15)(h)
    case 'dead': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example peaceColor('nirvana') returns colored string */
export function peaceColor(p: string): string {
  switch (p) {
    case 'nirvana': return chalk.rgb(100, 149, 237).bold(p)
    case 'zen-garden': return chalk.rgb(46, 204, 113)(p)
    case 'peaceful-grove': return chalk.rgb(155, 89, 182)(p)
    case 'quiet-corner': return chalk.rgb(52, 152, 219)(p)
    case 'restless': return chalk.rgb(241, 196, 15)(p)
    case 'chaotic': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example conditionColor('enchanted-grove') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'enchanted-grove': return chalk.rgb(100, 149, 237).bold(c)
    case 'twilight-sanctuary': return chalk.rgb(46, 204, 113)(c)
    case 'mystical-glade': return chalk.rgb(155, 89, 182)(c)
    case 'shadowy-path': return chalk.rgb(52, 152, 219)(c)
    case 'dark-thicket': return chalk.rgb(241, 196, 15)(c)
    case 'void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example rangerGradeColor('forest-spirit') returns colored string */
export function rangerGradeColor(g: string): string {
  switch (g) {
    case 'forest-spirit': return chalk.rgb(100, 149, 237).bold(g)
    case 'ancient-ranger': return chalk.rgb(46, 204, 113)(g)
    case 'woodland-keeper': return chalk.rgb(155, 89, 182)(g)
    case 'trail-guide': return chalk.rgb(52, 152, 219)(g)
    case 'lost-wanderer': return chalk.rgb(241, 196, 15)(g)
    case 'blind-in-dark': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example trailTypeColor('ancient-forest') returns colored string */
export function trailTypeColor(t: string): string {
  switch (t) {
    case 'ancient-forest': return chalk.rgb(100, 149, 237).bold(t)
    case 'old-growth': return chalk.rgb(46, 204, 113)(t)
    case 'secondary-forest': return chalk.rgb(155, 89, 182)(t)
    case 'plantation': return chalk.rgb(52, 152, 219)(t)
    case 'clearing': return chalk.rgb(241, 196, 15)(t)
    case 'wasteland': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example trailConditionColor('enchanted-forest') returns colored string */
export function trailConditionColor(c: string): string {
  switch (c) {
    case 'enchanted-forest': return chalk.rgb(100, 149, 237).bold(c)
    case 'twilight-woods': return chalk.rgb(46, 204, 113)(c)
    case 'shadow-grove': return chalk.rgb(155, 89, 182)(c)
    case 'dim-trail': return chalk.rgb(52, 152, 219)(c)
    case 'dark-thicket': return chalk.rgb(241, 196, 15)(c)
    case 'void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatTwilightForestJson(result) returns JSON string */
export function formatTwilightForestJson(result: TwilightForestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatTwilightForestTable(result, verbose) returns formatted string */
export function formatTwilightForestTable(result: TwilightForestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Twilight Forest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Woodland Overview:'))
  lines.push(`    Overall Serenity:      ${scoreColor(result.woodland.overallSerenity)}`)
  lines.push(`    Avg Crepuscular:       ${scoreColor(result.woodland.avgCrepuscular)}`)
  lines.push(`    Avg Bioluminescent:    ${scoreColor(result.woodland.avgBioluminescent)}`)
  lines.push(`    Avg Serenity:          ${scoreColor(result.woodland.avgSerenity)}`)
  lines.push(`    Is Serene:             ${result.woodland.isSerene ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:           ${result.stats.totalFiles}`)
  lines.push(`    Total Trails:          ${result.stats.totalTrails}`)
  lines.push(`    Avg Crepuscular:       ${scoreColor(result.stats.avgCrepuscularQuality)}`)
  lines.push(`    Avg Bioluminescent:    ${scoreColor(result.stats.avgBioluminescentBeauty)}`)
  lines.push(`    Avg Ecotone:           ${scoreColor(result.stats.avgEcotoneRichness)}`)
  lines.push(`    Avg Canopy:            ${scoreColor(result.stats.avgCanopyEquilibrium)}`)
  lines.push(`    Avg Understory:        ${scoreColor(result.stats.avgUnderstoryVitality)}`)
  lines.push(`    Avg Serenity:          ${scoreColor(result.stats.avgTwilightSerenity)}`)
  lines.push(`    Ranger Grade:          ${rangerGradeColor(result.stats.rangerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Enchanted Grove:     ${result.stats.enchantedGroveCount}`)
  lines.push(`    Twilight Sanctuary:  ${result.stats.twilightSanctuaryCount}`)
  lines.push(`    Mystical Glade:      ${result.stats.mysticalGladeCount}`)
  lines.push(`    Shadowy Path:        ${result.stats.shadowyPathCount}`)
  lines.push(`    Dark Thicket:        ${result.stats.darkThicketCount}`)
  lines.push(`    Void:                ${result.stats.voidCount}`)
  lines.push('')

  if (result.stats.bestSpecimen) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Specimen:      ${result.stats.bestSpecimen}`)
    lines.push(`    Best Transitions:   ${result.stats.bestTransitions}`)
    lines.push(`    Most Luminous:      ${result.stats.mostLuminous}`)
    lines.push(`    Best Boundaries:    ${result.stats.bestBoundaries}`)
    lines.push(`    Most Balanced:      ${result.stats.mostBalanced}`)
    lines.push(`    Deepest:            ${result.stats.deepest}`)
    lines.push('')
  }

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const spec of result.specimens) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(spec.file)}`)
      lines.push(`      Score: ${scoreColor(spec.qualityScore)}  Condition: ${conditionColor(spec.condition)}`)
      lines.push(`      Crepuscular: ${phaseColor(spec.crepuscular.phase)}(${spec.crepuscularQuality})  Bioluminescent: ${glowColor(spec.bioluminescent.glow)}(${spec.bioluminescentBeauty})  Ecotone: ${diversityColor(spec.ecotone.diversity)}(${spec.ecotoneRichness})`)
      lines.push(`      Canopy: ${balanceColor(spec.canopy.balance)}(${spec.canopyEquilibrium})  Understory: ${healthColor(spec.understory.health)}(${spec.understoryVitality})  Serenity: ${peaceColor(spec.serenity.peace)}(${spec.twilightSerenity})`)
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
