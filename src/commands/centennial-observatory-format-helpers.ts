import chalk from 'chalk'

import type { CentennialObservatoryResult } from './centennial-observatory-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example powerColor('jwst-grade') returns colored string */
export function powerColor(p: string): string {
  switch (p) {
    case 'jwst-grade': return chalk.rgb(100, 149, 237).bold(p)
    case 'hubble-class': return chalk.rgb(46, 204, 113)(p)
    case 'great-refractor': return chalk.rgb(155, 89, 182)(p)
    case 'standard-scope': return chalk.rgb(52, 152, 219)(p)
    case 'binoculars': return chalk.rgb(241, 196, 15)(p)
    case 'naked-eye': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example completenessColor('messier-catalog') returns colored string */
export function completenessColor(c: string): string {
  switch (c) {
    case 'messier-catalog': return chalk.rgb(100, 149, 237).bold(c)
    case 'ngc-complete': return chalk.rgb(46, 204, 113)(c)
    case 'bright-stars': return chalk.rgb(155, 89, 182)(c)
    case 'partial-catalog': return chalk.rgb(52, 152, 219)(c)
    case 'few-stars': return chalk.rgb(241, 196, 15)(c)
    case 'empty-sky': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example accuracyColor('planetarium-grade') returns colored string */
export function accuracyColor(a: string): string {
  switch (a) {
    case 'planetarium-grade': return chalk.rgb(100, 149, 237).bold(a)
    case 'star-atlas': return chalk.rgb(46, 204, 113)(a)
    case 'celestial-chart': return chalk.rgb(155, 89, 182)(a)
    case 'rough-map': return chalk.rgb(52, 152, 219)(a)
    case 'sketch': return chalk.rgb(241, 196, 15)(a)
    case 'blank': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example significanceColor('nobel-prize') returns colored string */
export function significanceColor(s: string): string {
  switch (s) {
    case 'nobel-prize': return chalk.rgb(100, 149, 237).bold(s)
    case 'major-discovery': return chalk.rgb(46, 204, 113)(s)
    case 'notable-finding': return chalk.rgb(155, 89, 182)(s)
    case 'incremental': return chalk.rgb(52, 152, 219)(s)
    case 'routine': return chalk.rgb(241, 196, 15)(s)
    case 'none': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example constructionColor('mountaintop-observatory') returns colored string */
export function constructionColor(c: string): string {
  switch (c) {
    case 'mountaintop-observatory': return chalk.rgb(100, 149, 237).bold(c)
    case 'space-telescope': return chalk.rgb(46, 204, 113)(c)
    case 'professional-grade': return chalk.rgb(155, 89, 182)(c)
    case 'amateur-setup': return chalk.rgb(52, 152, 219)(c)
    case 'backyard-scope': return chalk.rgb(241, 196, 15)(c)
    case 'cardboard-tube': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example impactColor('cosmic-legacy') returns colored string */
export function impactColor(i: string): string {
  switch (i) {
    case 'cosmic-legacy': return chalk.rgb(100, 149, 237).bold(i)
    case 'stellar-legacy': return chalk.rgb(46, 204, 113)(i)
    case 'planetary-legacy': return chalk.rgb(155, 89, 182)(i)
    case 'local-legacy': return chalk.rgb(52, 152, 219)(i)
    case 'ephemeral': return chalk.rgb(241, 196, 15)(i)
    case 'void': return chalk.rgb(231, 76, 60)(i)
    default: return i
  }
}

/** @example conditionColor('centennial-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'centennial-masterpiece': return chalk.rgb(100, 149, 237).bold(c)
    case 'landmark-observatory': return chalk.rgb(46, 204, 113)(c)
    case 'professional-instrument': return chalk.rgb(155, 89, 182)(c)
    case 'amateur-telescope': return chalk.rgb(52, 152, 219)(c)
    case 'broken-lens': return chalk.rgb(241, 196, 15)(c)
    case 'darkness': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example astronomerGradeColor('laureate-astronomer') returns colored string */
export function astronomerGradeColor(g: string): string {
  switch (g) {
    case 'laureate-astronomer': return chalk.rgb(100, 149, 237).bold(g)
    case 'chief-astronomer': return chalk.rgb(46, 204, 113)(g)
    case 'observatory-director': return chalk.rgb(155, 89, 182)(g)
    case 'astronomer': return chalk.rgb(52, 152, 219)(g)
    case 'stargazer': return chalk.rgb(241, 196, 15)(g)
    case 'grounded': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example domeTypeColor('centennial-observatory') returns colored string */
export function domeTypeColor(d: string): string {
  switch (d) {
    case 'centennial-observatory': return chalk.rgb(100, 149, 237).bold(d)
    case 'major-observatory': return chalk.rgb(46, 204, 113)(d)
    case 'university-scope': return chalk.rgb(155, 89, 182)(d)
    case 'amateur-observatory': return chalk.rgb(52, 152, 219)(d)
    case 'backyard-scope': return chalk.rgb(241, 196, 15)(d)
    case 'empty-lot': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example domeConditionColor('world-class-observatory') returns colored string */
export function domeConditionColor(c: string): string {
  switch (c) {
    case 'world-class-observatory': return chalk.rgb(100, 149, 237).bold(c)
    case 'professional-facility': return chalk.rgb(46, 204, 113)(c)
    case 'working-observatory': return chalk.rgb(155, 89, 182)(c)
    case 'amateur-setup': return chalk.rgb(52, 152, 219)(c)
    case 'abandoned': return chalk.rgb(241, 196, 15)(c)
    case 'dark-site': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCentennialObservatoryJson(result) returns JSON string */
export function formatCentennialObservatoryJson(result: CentennialObservatoryResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCentennialObservatoryTable(result, verbose) returns formatted string */
export function formatCentennialObservatoryTable(result: CentennialObservatoryResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  \u2728 Centennial Observatory Analysis \u2014 Command #400 \u2728'))
  lines.push('')
  lines.push(chalk.rgb(241, 196, 15)(`  "${result.stats.celebration}"`))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Cosmos Overview:'))
  lines.push(`    Overall Cosmic:    ${scoreColor(result.cosmos.overallCosmic)}`)
  lines.push(`    Avg Resolution:    ${scoreColor(result.cosmos.avgResolution)}`)
  lines.push(`    Avg Mapping:       ${scoreColor(result.cosmos.avgMapping)}`)
  lines.push(`    Avg Legacy:        ${scoreColor(result.cosmos.avgLegacy)}`)
  lines.push(`    Is World Class:    ${result.cosmos.isWorldClass ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:       ${result.stats.totalFiles}`)
  lines.push(`    Total Domes:       ${result.stats.totalDomes}`)
  lines.push(`    Avg Telescope:     ${scoreColor(result.stats.avgTelescopeResolution)}`)
  lines.push(`    Avg Stellar:       ${scoreColor(result.stats.avgStellarCatalog)}`)
  lines.push(`    Avg Sky:           ${scoreColor(result.stats.avgSkyMapping)}`)
  lines.push(`    Avg Cosmic:        ${scoreColor(result.stats.avgCosmicDiscovery)}`)
  lines.push(`    Avg Foundation:    ${scoreColor(result.stats.avgObservatoryFoundation)}`)
  lines.push(`    Avg Legacy:        ${scoreColor(result.stats.avgAstronomicalLegacy)}`)
  lines.push(`    Astronomer Grade:  ${astronomerGradeColor(result.stats.astronomerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Centennial:        ${result.stats.centennialMasterpieceCount}`)
  lines.push(`    Landmark:          ${result.stats.landmarkObservatoryCount}`)
  lines.push(`    Professional:      ${result.stats.professionalInstrumentCount}`)
  lines.push(`    Amateur:           ${result.stats.amateurTelescopeCount}`)
  lines.push(`    Broken Lens:       ${result.stats.brokenLensCount}`)
  lines.push(`    Darkness:          ${result.stats.darknessCount}`)
  lines.push('')

  if (result.stats.bestObservation) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Overall:      ${result.stats.bestObservation}`)
    lines.push(`    Sharpest:          ${result.stats.sharpest}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Best Organized:    ${result.stats.bestOrganized}`)
    lines.push(`    Most Innovative:   ${result.stats.mostInnovative}`)
    lines.push(`    Best Foundation:   ${result.stats.bestFoundation}`)
    lines.push('')
  }

  if (verbose && result.observations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Observations:'))
    for (const obs of result.observations) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(obs.file)}`)
      lines.push(`      Score: ${scoreColor(obs.qualityScore)}  Condition: ${conditionColor(obs.condition)}`)
      lines.push(`      Tel: ${powerColor(obs.telescope.power)}(${obs.telescopeResolution})  Stellar: ${completenessColor(obs.stellar.completeness)}(${obs.stellarCatalog})  Sky: ${accuracyColor(obs.sky.accuracy)}(${obs.skyMapping})`)
      lines.push(`      Cosmic: ${significanceColor(obs.cosmic.significance)}(${obs.cosmicDiscovery})  Found: ${constructionColor(obs.foundation.construction)}(${obs.observatoryFoundation})  Legacy: ${impactColor(obs.legacy.impact)}(${obs.astronomicalLegacy})`)
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
