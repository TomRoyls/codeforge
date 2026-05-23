import chalk from 'chalk'

import type { KaleidoscopeLensResult } from './kaleidoscope-lens-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example orderColor('six-fold-symmetry') returns colored string */
export function orderColor(o: string): string {
  switch (o) {
    case 'six-fold-symmetry': return chalk.rgb(100, 149, 237).bold(o)
    case 'perfect-mirror': return chalk.rgb(46, 204, 113)(o)
    case 'balanced': return chalk.rgb(155, 89, 182)(o)
    case 'partial': return chalk.rgb(52, 152, 219)(o)
    case 'asymmetric': return chalk.rgb(241, 196, 15)(o)
    case 'broken-mirror': return chalk.rgb(231, 76, 60)(o)
    default: return o
  }
}

/** @example paletteColor('rainbow-spectrum') returns colored string */
export function paletteColor(p: string): string {
  switch (p) {
    case 'rainbow-spectrum': return chalk.rgb(100, 149, 237).bold(p)
    case 'rich-palette': return chalk.rgb(46, 204, 113)(p)
    case 'primary-colors': return chalk.rgb(155, 89, 182)(p)
    case 'limited-palette': return chalk.rgb(52, 152, 219)(p)
    case 'monochrome': return chalk.rgb(241, 196, 15)(p)
    case 'colorless': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example focusColor('crystal-clear') returns colored string */
export function focusColor(f: string): string {
  switch (f) {
    case 'crystal-clear': return chalk.rgb(100, 149, 237).bold(f)
    case 'sharp-focus': return chalk.rgb(46, 204, 113)(f)
    case 'clear': return chalk.rgb(155, 89, 182)(f)
    case 'slightly-blurry': return chalk.rgb(52, 152, 219)(f)
    case 'foggy': return chalk.rgb(241, 196, 15)(f)
    case 'opaque': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example gradeColor('laser-precision') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'laser-precision': return chalk.rgb(100, 149, 237).bold(g)
    case 'microscope-grade': return chalk.rgb(46, 204, 113)(g)
    case 'telescope-grade': return chalk.rgb(155, 89, 182)(g)
    case 'reading-glass': return chalk.rgb(52, 152, 219)(g)
    case 'blurred-vision': return chalk.rgb(241, 196, 15)(g)
    case 'blind': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example surfaceColor('perfect-mirror') returns colored string */
export function surfaceColor(s: string): string {
  switch (s) {
    case 'perfect-mirror': return chalk.rgb(100, 149, 237).bold(s)
    case 'clear-reflection': return chalk.rgb(46, 204, 113)(s)
    case 'good-mirror': return chalk.rgb(155, 89, 182)(s)
    case 'cloudy-mirror': return chalk.rgb(52, 152, 219)(s)
    case 'tarnished': return chalk.rgb(241, 196, 15)(s)
    case 'dark-glass': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example beautyColor('mesmerizing') returns colored string */
export function beautyColor(b: string): string {
  switch (b) {
    case 'mesmerizing': return chalk.rgb(100, 149, 237).bold(b)
    case 'beautiful-pattern': return chalk.rgb(46, 204, 113)(b)
    case 'pleasing': return chalk.rgb(155, 89, 182)(b)
    case 'adequate': return chalk.rgb(52, 152, 219)(b)
    case 'disjointed': return chalk.rgb(241, 196, 15)(b)
    case 'ugly': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example conditionColor('masterpiece-kaleidoscope') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece-kaleidoscope': return chalk.rgb(100, 149, 237).bold(c)
    case 'beautiful-mandala': return chalk.rgb(46, 204, 113)(c)
    case 'colorful-pattern': return chalk.rgb(155, 89, 182)(c)
    case 'simple-shape': return chalk.rgb(52, 152, 219)(c)
    case 'broken-shard': return chalk.rgb(241, 196, 15)(c)
    case 'dust': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example opticianGradeColor('master-optician') returns colored string */
export function opticianGradeColor(g: string): string {
  switch (g) {
    case 'master-optician': return chalk.rgb(100, 149, 237).bold(g)
    case 'lens-crafter': return chalk.rgb(46, 204, 113)(g)
    case 'glassblower': return chalk.rgb(155, 89, 182)(g)
    case 'observer': return chalk.rgb(52, 152, 219)(g)
    case 'tourist': return chalk.rgb(241, 196, 15)(g)
    case 'blind-spot': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example chamberTypeColor('grand-kaleidoscope') returns colored string */
export function chamberTypeColor(t: string): string {
  switch (t) {
    case 'grand-kaleidoscope': return chalk.rgb(100, 149, 237).bold(t)
    case 'viewing-tube': return chalk.rgb(46, 204, 113)(t)
    case 'pocket-scope': return chalk.rgb(155, 89, 182)(t)
    case 'toy-kaleidoscope': return chalk.rgb(52, 152, 219)(t)
    case 'broken-tube': return chalk.rgb(241, 196, 15)(t)
    case 'empty': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example chamberConditionColor('mesmerizing-display') returns colored string */
export function chamberConditionColor(c: string): string {
  switch (c) {
    case 'mesmerizing-display': return chalk.rgb(100, 149, 237).bold(c)
    case 'beautiful-patterns': return chalk.rgb(46, 204, 113)(c)
    case 'colorful-view': return chalk.rgb(155, 89, 182)(c)
    case 'dim-image': return chalk.rgb(52, 152, 219)(c)
    case 'broken-glass': return chalk.rgb(241, 196, 15)(c)
    case 'darkness': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatKaleidoscopeLensJson(result) returns JSON string */
export function formatKaleidoscopeLensJson(result: KaleidoscopeLensResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatKaleidoscopeLensTable(result, verbose) returns formatted string */
export function formatKaleidoscopeLensTable(result: KaleidoscopeLensResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Kaleidoscope Lens Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Kaleidoscope Overview:'))
  lines.push(`    Overall Beauty:        ${scoreColor(result.kaleidoscope.overallBeauty)}`)
  lines.push(`    Avg Symmetry:          ${scoreColor(result.kaleidoscope.avgSymmetry)}`)
  lines.push(`    Avg Clarity:           ${scoreColor(result.kaleidoscope.avgClarity)}`)
  lines.push(`    Avg Harmony:           ${scoreColor(result.kaleidoscope.avgHarmony)}`)
  lines.push(`    Is Beautiful:          ${result.kaleidoscope.isBeautiful ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:           ${result.stats.totalFiles}`)
  lines.push(`    Total Chambers:        ${result.stats.totalChambers}`)
  lines.push(`    Avg Symmetry:          ${scoreColor(result.stats.avgPatternSymmetry)}`)
  lines.push(`    Avg Color:             ${scoreColor(result.stats.avgColorRichness)}`)
  lines.push(`    Avg Clarity:           ${scoreColor(result.stats.avgLensClarity)}`)
  lines.push(`    Avg Optical:           ${scoreColor(result.stats.avgOpticalPrecision)}`)
  lines.push(`    Avg Reflection:        ${scoreColor(result.stats.avgReflectionQuality)}`)
  lines.push(`    Avg Harmony:           ${scoreColor(result.stats.avgVisualHarmony)}`)
  lines.push(`    Optician Grade:        ${opticianGradeColor(result.stats.opticianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Masterpiece:         ${result.stats.masterpieceKaleidoscopeCount}`)
  lines.push(`    Mandala:             ${result.stats.beautifulMandalaCount}`)
  lines.push(`    Colorful:            ${result.stats.colorfulPatternCount}`)
  lines.push(`    Simple:              ${result.stats.simpleShapeCount}`)
  lines.push(`    Broken Shard:        ${result.stats.brokenShardCount}`)
  lines.push(`    Dust:                ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestFragment) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Fragment:      ${result.stats.bestFragment}`)
    lines.push(`    Most Symmetric:     ${result.stats.mostSymmetric}`)
    lines.push(`    Most Colorful:      ${result.stats.mostColorful}`)
    lines.push(`    Clearest:           ${result.stats.clearest}`)
    lines.push(`    Most Precise:       ${result.stats.mostPrecise}`)
    lines.push(`    Best Documented:    ${result.stats.bestDocumented}`)
    lines.push('')
  }

  if (verbose && result.fragments.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const frag of result.fragments) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(frag.file)}`)
      lines.push(`      Score: ${scoreColor(frag.qualityScore)}  Condition: ${conditionColor(frag.condition)}`)
      lines.push(`      Symmetry: ${orderColor(frag.symmetry.order)}(${frag.patternSymmetry})  Color: ${paletteColor(frag.color.palette)}(${frag.colorRichness})  Lens: ${focusColor(frag.lens.focus)}(${frag.lensClarity})`)
      lines.push(`      Optical: ${gradeColor(frag.optical.grade)}(${frag.opticalPrecision})  Reflection: ${surfaceColor(frag.reflection.surface)}(${frag.reflectionQuality})  Harmony: ${beautyColor(frag.harmony.beauty)}(${frag.visualHarmony})`)
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
