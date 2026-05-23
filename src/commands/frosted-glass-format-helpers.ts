import chalk from 'chalk'
import type { FrostedGlassResult } from './frosted-glass-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(135, 206, 235)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example clarityColor('crystal-clear') returns colored string */
export function clarityColor(c: string): string {
  switch (c) {
    case 'crystal-clear': return chalk.rgb(135, 206, 235).bold(c)
    case 'clear-glass': return chalk.rgb(46, 204, 113)(c)
    case 'lightly-frosted': return chalk.rgb(155, 89, 182)(c)
    case 'heavily-frosted': return chalk.rgb(52, 152, 219)(c)
    case 'opaque-frost': return chalk.rgb(241, 196, 15)(c)
    case 'solid-wall': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example coverageColor('pure-crystal') returns colored string */
export function coverageColor(c: string): string {
  switch (c) {
    case 'pure-crystal': return chalk.rgb(135, 206, 235).bold(c)
    case 'light-frost': return chalk.rgb(46, 204, 113)(c)
    case 'medium-frost': return chalk.rgb(155, 89, 182)(c)
    case 'heavy-frost': return chalk.rgb(52, 152, 219)(c)
    case 'full-coverage': return chalk.rgb(241, 196, 15)(c)
    case 'painted-over': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example bendingColor('no-refraction') returns colored string */
export function bendingColor(b: string): string {
  switch (b) {
    case 'no-refraction': return chalk.rgb(135, 206, 235).bold(b)
    case 'slight-bend': return chalk.rgb(46, 204, 113)(b)
    case 'moderate-refraction': return chalk.rgb(155, 89, 182)(b)
    case 'significant-bend': return chalk.rgb(52, 152, 219)(b)
    case 'heavy-distortion': return chalk.rgb(241, 196, 15)(b)
    case 'prism-split': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example brightnessColor('full-spectrum') returns colored string */
export function brightnessColor(b: string): string {
  switch (b) {
    case 'full-spectrum': return chalk.rgb(135, 206, 235).bold(b)
    case 'bright-transmission': return chalk.rgb(46, 204, 113)(b)
    case 'adequate-light': return chalk.rgb(155, 89, 182)(b)
    case 'dim-transmission': return chalk.rgb(52, 152, 219)(b)
    case 'barely-glowing': return chalk.rgb(241, 196, 15)(b)
    case 'light-blocking': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example finishColor('mirror-finish') returns colored string */
export function finishColor(f: string): string {
  switch (f) {
    case 'mirror-finish': return chalk.rgb(135, 206, 235).bold(f)
    case 'polished-surface': return chalk.rgb(46, 204, 113)(f)
    case 'smooth-glass': return chalk.rgb(155, 89, 182)(f)
    case 'slightly-rough': return chalk.rgb(52, 152, 219)(f)
    case 'textured': return chalk.rgb(241, 196, 15)(f)
    case 'broken': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example protectionColor('vault-grade') returns colored string */
export function protectionColor(p: string): string {
  switch (p) {
    case 'vault-grade': return chalk.rgb(135, 206, 235).bold(p)
    case 'double-glazed': return chalk.rgb(46, 204, 113)(p)
    case 'single-pane': return chalk.rgb(155, 89, 182)(p)
    case 'film-coated': return chalk.rgb(52, 152, 219)(p)
    case 'bare-glass': return chalk.rgb(241, 196, 15)(p)
    case 'shattered': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example conditionColor('stained-glass-art') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'stained-glass-art': return chalk.rgb(135, 206, 235).bold(c)
    case 'clear-pane': return chalk.rgb(46, 204, 113)(c)
    case 'frosted-window': return chalk.rgb(155, 89, 182)(c)
    case 'clouded-glass': return chalk.rgb(52, 152, 219)(c)
    case 'cracked-pane': return chalk.rgb(241, 196, 15)(c)
    case 'shattered': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-glazier') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-glazier': return chalk.rgb(135, 206, 235).bold(g)
    case 'expert-craftsman': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-worker': return chalk.rgb(155, 89, 182)(g)
    case 'competent-installer': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'vandal': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example installTypeColor('cathedral-window') returns colored string */
export function installTypeColor(t: string): string {
  switch (t) {
    case 'cathedral-window': return chalk.rgb(135, 206, 235).bold(t)
    case 'modern-facade': return chalk.rgb(46, 204, 113)(t)
    case 'office-partition': return chalk.rgb(155, 89, 182)(t)
    case 'bathroom-window': return chalk.rgb(52, 152, 219)(t)
    case 'boarded-up': return chalk.rgb(241, 196, 15)(t)
    case 'hole-in-wall': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example installConditionColor('architectural-marvel') returns colored string */
export function installConditionColor(c: string): string {
  switch (c) {
    case 'architectural-marvel': return chalk.rgb(135, 206, 235).bold(c)
    case 'clean-installation': return chalk.rgb(46, 204, 113)(c)
    case 'functional-glazing': return chalk.rgb(155, 89, 182)(c)
    case 'patchy-panes': return chalk.rgb(52, 152, 219)(c)
    case 'failing-seals': return chalk.rgb(241, 196, 15)(c)
    case 'broken-glass': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatFrostedGlassJson(result) returns JSON string */
export function formatFrostedGlassJson(result: FrostedGlassResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatFrostedGlassTable(result, verbose) returns formatted string */
export function formatFrostedGlassTable(result: FrostedGlassResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(135, 206, 235).bold('  Frosted Glass Analysis'))
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Building Overview:'))
  lines.push(`    Overall Clarity:      ${scoreColor(result.building.overallClarity)}`)
  lines.push(`    Avg Transparency:     ${scoreColor(result.building.avgTransparency)}`)
  lines.push(`    Avg Surface Quality:  ${scoreColor(result.building.avgSurfaceQuality)}`)
  lines.push(`    Avg Insulation:       ${scoreColor(result.building.avgInsulation)}`)
  lines.push(`    Is Transparent:       ${result.building.isTransparent ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Statistics:'))
  lines.push(`    Total Files:             ${result.stats.totalFiles}`)
  lines.push(`    Total Installations:     ${result.stats.totalInstallations}`)
  lines.push(`    Avg Transparency:        ${scoreColor(result.stats.avgTransparency)}`)
  lines.push(`    Avg Frost Level:         ${scoreColor(result.stats.avgFrostLevel)}`)
  lines.push(`    Avg Refraction:          ${scoreColor(result.stats.avgRefraction)}`)
  lines.push(`    Avg Light Transmission:  ${scoreColor(result.stats.avgLightTransmission)}`)
  lines.push(`    Avg Surface Quality:     ${scoreColor(result.stats.avgSurfaceQuality)}`)
  lines.push(`    Avg Insulation:          ${scoreColor(result.stats.avgInsulation)}`)
  lines.push(`    Glazier Grade:           ${gradeColor(result.stats.glazierGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Condition Counts:'))
  lines.push(`    Stained Glass Art:    ${result.stats.stainedGlassArtCount}`)
  lines.push(`    Clear Pane:           ${result.stats.clearPaneCount}`)
  lines.push(`    Frosted Window:       ${result.stats.frostedWindowCount}`)
  lines.push(`    Clouded Glass:        ${result.stats.cloudedGlassCount}`)
  lines.push(`    Cracked Pane:         ${result.stats.crackedPaneCount}`)
  lines.push(`    Shattered:            ${result.stats.shatteredCount}`)
  lines.push('')

  if (result.stats.bestPane) {
    lines.push(chalk.rgb(135, 206, 235)('  Highlights:'))
    lines.push(`    Best Pane:          ${result.stats.bestPane}`)
    lines.push(`    Most Transparent:   ${result.stats.mostTransparent}`)
    lines.push(`    Best Abstracted:    ${result.stats.bestAbstracted}`)
    lines.push(`    Least Indirect:     ${result.stats.leastIndirect}`)
    lines.push(`    Best Documented:    ${result.stats.bestDocumented}`)
    lines.push(`    Best Interface:     ${result.stats.bestInterface}`)
    lines.push('')
  }

  if (verbose && result.panes.length > 0) {
    lines.push(chalk.rgb(135, 206, 235)('  Per-File Panes:'))
    for (const p of result.panes) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Transparency: ${clarityColor(p.transparent.clarity)}(${p.transparency})  Frost: ${coverageColor(p.frost.coverage)}(${p.frostLevel})  Refraction: ${bendingColor(p.refractive.bending)}(${p.refraction})`)
      lines.push(`      Light: ${brightnessColor(p.light.brightness)}(${p.lightTransmission})  Surface: ${finishColor(p.surface.finish)}(${p.surfaceQuality})  Insulation: ${protectionColor(p.insulating.protection)}(${p.insulation})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(135, 206, 235)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(135, 206, 235)('\u{1F9EA}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
