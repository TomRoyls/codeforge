import chalk from 'chalk'
import type { StarryVaultResult } from './starry-vault-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(147, 112, 219)(String(score))
  if (score >= 60) return chalk.rgb(186, 85, 211)(String(score))
  if (score >= 40) return chalk.rgb(138, 43, 226)(String(score))
  return chalk.rgb(75, 0, 130)(String(score))
}

/** @example scaleColor('cosmos-spanning') returns colored string */
export function scaleColor(s: string): string {
  switch (s) {
    case 'cosmos-spanning': return chalk.rgb(147, 112, 219).bold(s)
    case 'galactic-scale': return chalk.rgb(186, 85, 211)(s)
    case 'solar-system': return chalk.rgb(138, 43, 226)(s)
    case 'planetary': return chalk.rgb(123, 104, 238)(s)
    case 'orbital': return chalk.rgb(106, 90, 205)(s)
    case 'grounded': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example patternColor('perfect-constellation') returns colored string */
export function patternColor(s: string): string {
  switch (s) {
    case 'perfect-constellation': return chalk.rgb(147, 112, 219).bold(s)
    case 'clear-star-map': return chalk.rgb(186, 85, 211)(s)
    case 'recognizable-pattern': return chalk.rgb(138, 43, 226)(s)
    case 'scattered-stars': return chalk.rgb(123, 104, 238)(s)
    case 'random-dots': return chalk.rgb(106, 90, 205)(s)
    case 'void': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example magnitudeColor('supergiant') returns colored string */
export function magnitudeColor(s: string): string {
  switch (s) {
    case 'supergiant': return chalk.rgb(147, 112, 219).bold(s)
    case 'bright-star': return chalk.rgb(186, 85, 211)(s)
    case 'steady-star': return chalk.rgb(138, 43, 226)(s)
    case 'dim-star': return chalk.rgb(123, 104, 238)(s)
    case 'brown-dwarf': return chalk.rgb(106, 90, 205)(s)
    case 'black-hole': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example depthColor('orion-nebula') returns colored string */
export function depthColor(s: string): string {
  switch (s) {
    case 'orion-nebula': return chalk.rgb(147, 112, 219).bold(s)
    case 'rich-cloud': return chalk.rgb(186, 85, 211)(s)
    case 'stellar-nursery': return chalk.rgb(138, 43, 226)(s)
    case 'thin-gas': return chalk.rgb(123, 104, 238)(s)
    case 'void-space': return chalk.rgb(106, 90, 205)(s)
    case 'dark-matter': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example pullColor('stable-orbit') returns colored string */
export function pullColor(s: string): string {
  switch (s) {
    case 'stable-orbit': return chalk.rgb(147, 112, 219).bold(s)
    case 'proper-gravity': return chalk.rgb(186, 85, 211)(s)
    case 'balanced-pull': return chalk.rgb(138, 43, 226)(s)
    case 'wobbly-orbit': return chalk.rgb(123, 104, 238)(s)
    case 'chaotic-orbit': return chalk.rgb(106, 90, 205)(s)
    case 'collapsed': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example resonanceColor('cosmic-harmony') returns colored string */
export function resonanceColor(s: string): string {
  switch (s) {
    case 'cosmic-harmony': return chalk.rgb(147, 112, 219).bold(s)
    case 'stellar-resonance': return chalk.rgb(186, 85, 211)(s)
    case 'proper-alignment': return chalk.rgb(138, 43, 226)(s)
    case 'partial-harmony': return chalk.rgb(123, 104, 238)(s)
    case 'dissonance': return chalk.rgb(106, 90, 205)(s)
    case 'chaos': return chalk.rgb(75, 0, 130)(s)
    default: return s
  }
}

/** @example conditionColor('cosmic-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'cosmic-masterpiece': return chalk.rgb(147, 112, 219).bold(c)
    case 'brilliant-galaxy': return chalk.rgb(186, 85, 211)(c)
    case 'stellar-system': return chalk.rgb(138, 43, 226)(c)
    case 'dim-nebula': return chalk.rgb(123, 104, 238)(c)
    case 'dark-void': return chalk.rgb(106, 90, 205)(c)
    case 'black-hole': return chalk.rgb(75, 0, 130)(c)
    default: return c
  }
}

/** @example astronomerGradeColor('cosmic-architect') returns colored string */
export function astronomerGradeColor(g: string): string {
  switch (g) {
    case 'cosmic-architect': return chalk.rgb(147, 112, 219).bold(g)
    case 'master-astronomer': return chalk.rgb(186, 85, 211)(g)
    case 'expert-stargazer': return chalk.rgb(138, 43, 226)(g)
    case 'amateur-observer': return chalk.rgb(123, 104, 238)(g)
    case 'cloudy-night': return chalk.rgb(106, 90, 205)(g)
    case 'blind': return chalk.rgb(75, 0, 130)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatStarryVaultJson(result) returns JSON string */
export function formatStarryVaultJson(result: StarryVaultResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatStarryVaultTable(result, verbose) returns formatted string */
export function formatStarryVaultTable(result: StarryVaultResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(147, 112, 219).bold('  Starry Vault Analysis'))
  lines.push('')

  lines.push(chalk.rgb(147, 112, 219)('  Universe:'))
  lines.push(`    Avg Architecture:       ${scoreColor(result.universe.avgArchitecture)}`)
  lines.push(`    Avg Brightness:         ${scoreColor(result.universe.avgBrightness)}`)
  lines.push(`    Avg Harmony:            ${scoreColor(result.universe.avgHarmony)}`)
  lines.push(`    Is Cosmic:              ${result.universe.isCosmic ? chalk.rgb(147, 112, 219)('Yes') : chalk.rgb(75, 0, 130)('No')}`)
  lines.push(`    Overall Cosmic:         ${scoreColor(result.universe.overallCosmic)}`)
  lines.push('')

  lines.push(chalk.rgb(147, 112, 219)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:               ${result.stats.totalClusters}`)
  lines.push(`    Avg Cosmic Architecture:      ${scoreColor(result.stats.avgCosmicArchitecture)}`)
  lines.push(`    Avg Constellation Quality:    ${scoreColor(result.stats.avgConstellationQuality)}`)
  lines.push(`    Avg Stellar Brightness:       ${scoreColor(result.stats.avgStellarBrightness)}`)
  lines.push(`    Avg Nebula Richness:          ${scoreColor(result.stats.avgNebulaRichness)}`)
  lines.push(`    Avg Gravity Stability:        ${scoreColor(result.stats.avgGravityStability)}`)
  lines.push(`    Avg Cosmic Harmony:           ${scoreColor(result.stats.avgCosmicHarmony)}`)
  lines.push(`    Astronomer Grade:             ${astronomerGradeColor(result.stats.astronomerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(147, 112, 219)('  Condition Counts:'))
  lines.push(`    Cosmic Masterpiece:   ${result.stats.cosmicMasterpieceCount}`)
  lines.push(`    Brilliant Galaxy:     ${result.stats.brilliantGalaxyCount}`)
  lines.push(`    Stellar System:       ${result.stats.stellarSystemCount}`)
  lines.push(`    Dim Nebula:           ${result.stats.dimNebulaCount}`)
  lines.push(`    Dark Void:            ${result.stats.darkVoidCount}`)
  lines.push(`    Black Hole:           ${result.stats.blackHoleCount}`)
  lines.push('')

  if (result.stats.bestSystem) {
    lines.push(chalk.rgb(147, 112, 219)('  Highlights:'))
    lines.push(`    Best System:          ${result.stats.bestSystem}`)
    lines.push(`    Best Architected:     ${result.stats.bestArchitected}`)
    lines.push(`    Best Organized:       ${result.stats.bestOrganized}`)
    lines.push(`    Brightest:            ${result.stats.brightest}`)
    lines.push(`    Richest:              ${result.stats.richest}`)
    lines.push(`    Most Stable:          ${result.stats.mostStable}`)
    lines.push('')
  }

  if (verbose && result.systems.length > 0) {
    lines.push(chalk.rgb(147, 112, 219)('  Per-File Star Systems:'))
    for (const sys of result.systems) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(sys.file)}`)
      lines.push(`      Score: ${scoreColor(sys.qualityScore)}  Condition: ${conditionColor(sys.condition)}`)
      lines.push(`      Arch: ${scaleColor(sys.architect.scale)}(${sys.cosmicArchitecture})  Const: ${patternColor(sys.constellation.pattern)}(${sys.constellationQuality})  Stellar: ${magnitudeColor(sys.stellar.magnitude)}(${sys.stellarBrightness})`)
      lines.push(`      Nebula: ${depthColor(sys.nebula.depth)}(${sys.nebulaRichness})  Gravity: ${pullColor(sys.gravity.pull)}(${sys.gravityStability})  Harmony: ${resonanceColor(sys.harmony.resonance)}(${sys.cosmicHarmony})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(147, 112, 219)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(147, 112, 219)('\u2728')} ${rec}`)
    }
    lines.push('')
  }

  lines.push(chalk.rgb(147, 112, 219)(`  ${result.stats.celebration}`))
  lines.push('')

  return lines.join('\n')
}
