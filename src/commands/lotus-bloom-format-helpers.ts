import chalk from 'chalk'

import type { LotusBloomResult } from './lotus-bloom-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example petalRadianceColor('thousand-petal') returns colored string */
export function petalRadianceColor(r: string): string {
  switch (r) {
    case 'thousand-petal': return chalk.rgb(100, 149, 237).bold(r)
    case 'full-bloom': return chalk.rgb(46, 204, 113)(r)
    case 'opening': return chalk.rgb(155, 89, 182)(r)
    case 'bud': return chalk.rgb(52, 152, 219)(r)
    case 'wilted': return chalk.rgb(241, 196, 15)(r)
    case 'fallen': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example rootStrengthColor('deep-taproot') returns colored string */
export function rootStrengthColor(s: string): string {
  switch (s) {
    case 'deep-taproot': return chalk.rgb(100, 149, 237).bold(s)
    case 'strong-root': return chalk.rgb(46, 204, 113)(s)
    case 'established': return chalk.rgb(155, 89, 182)(s)
    case 'shallow-root': return chalk.rgb(52, 152, 219)(s)
    case 'floating': return chalk.rgb(241, 196, 15)(s)
    case 'uprooted': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example mudPurityColor('spotless') returns colored string */
export function mudPurityColor(p: string): string {
  switch (p) {
    case 'spotless': return chalk.rgb(100, 149, 237).bold(p)
    case 'clean': return chalk.rgb(46, 204, 113)(p)
    case 'mostly-pure': return chalk.rgb(155, 89, 182)(p)
    case 'some-residue': return chalk.rgb(52, 152, 219)(p)
    case 'muddy': return chalk.rgb(241, 196, 15)(p)
    case 'polluted': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example geometryPatternColor('golden-ratio') returns colored string */
export function geometryPatternColor(p: string): string {
  switch (p) {
    case 'golden-ratio': return chalk.rgb(100, 149, 237).bold(p)
    case 'fibonacci-spiral': return chalk.rgb(46, 204, 113)(p)
    case 'sacred-pattern': return chalk.rgb(155, 89, 182)(p)
    case 'organized': return chalk.rgb(52, 152, 219)(p)
    case 'irregular': return chalk.rgb(241, 196, 15)(p)
    case 'chaotic': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example fragranceAromaColor('intoxicating') returns colored string */
export function fragranceAromaColor(a: string): string {
  switch (a) {
    case 'intoxicating': return chalk.rgb(100, 149, 237).bold(a)
    case 'fragrant': return chalk.rgb(46, 204, 113)(a)
    case 'pleasant': return chalk.rgb(155, 89, 182)(a)
    case 'faint': return chalk.rgb(52, 152, 219)(a)
    case 'odorless': return chalk.rgb(241, 196, 15)(a)
    case 'stale': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example vitalityHealthColor('eternal-bloom') returns colored string */
export function vitalityHealthColor(h: string): string {
  switch (h) {
    case 'eternal-bloom': return chalk.rgb(100, 149, 237).bold(h)
    case 'vibrant': return chalk.rgb(46, 204, 113)(h)
    case 'healthy': return chalk.rgb(155, 89, 182)(h)
    case 'fading': return chalk.rgb(52, 152, 219)(h)
    case 'wilting': return chalk.rgb(241, 196, 15)(h)
    case 'dead': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example conditionColor('divine-lotus') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'divine-lotus': return chalk.rgb(100, 149, 237).bold(c)
    case 'sacred-bloom': return chalk.rgb(46, 204, 113)(c)
    case 'garden-lotus': return chalk.rgb(155, 89, 182)(c)
    case 'pond-flower': return chalk.rgb(52, 152, 219)(c)
    case 'mud-sprout': return chalk.rgb(241, 196, 15)(c)
    case 'seed': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gardenerGradeColor('enlightened-master') returns colored string */
export function gardenerGradeColor(g: string): string {
  switch (g) {
    case 'enlightened-master': return chalk.rgb(100, 149, 237).bold(g)
    case 'zen-gardener': return chalk.rgb(46, 204, 113)(g)
    case 'lotus-tender': return chalk.rgb(155, 89, 182)(g)
    case 'gardener': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'trampler': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example pondTypeColor('sacred-pond') returns colored string */
export function pondTypeColor(t: string): string {
  switch (t) {
    case 'sacred-pond': return chalk.rgb(100, 149, 237).bold(t)
    case 'temple-garden': return chalk.rgb(46, 204, 113)(t)
    case 'meditation-pool': return chalk.rgb(155, 89, 182)(t)
    case 'garden-pond': return chalk.rgb(52, 152, 219)(t)
    case 'muddy-puddle': return chalk.rgb(241, 196, 15)(t)
    case 'dry-bed': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example pondConditionColor('divine-garden') returns colored string */
export function pondConditionColor(c: string): string {
  switch (c) {
    case 'divine-garden': return chalk.rgb(100, 149, 237).bold(c)
    case 'sacred-pond': return chalk.rgb(46, 204, 113)(c)
    case 'blooming-garden': return chalk.rgb(155, 89, 182)(c)
    case 'greenhouse': return chalk.rgb(52, 152, 219)(c)
    case 'dying-pond': return chalk.rgb(241, 196, 15)(c)
    case 'barren': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatLotusBloomJson(result) returns JSON string */
export function formatLotusBloomJson(result: LotusBloomResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatLotusBloomTable(result, verbose) returns formatted string */
export function formatLotusBloomTable(result: LotusBloomResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Lotus Bloom Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Garden Overview:'))
  lines.push(`    Overall Purity:       ${scoreColor(result.garden.overallPurity)}`)
  lines.push(`    Avg Beauty:           ${scoreColor(result.garden.avgBeauty)}`)
  lines.push(`    Avg Purity:           ${scoreColor(result.garden.avgPurity)}`)
  lines.push(`    Avg Vitality:         ${scoreColor(result.garden.avgVitality)}`)
  lines.push(`    Is Pristine:          ${result.garden.isPristine ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Ponds:          ${result.stats.totalPonds}`)
  lines.push(`    Avg Petal Beauty:     ${scoreColor(result.stats.avgPetalBeauty)}`)
  lines.push(`    Avg Root Depth:       ${scoreColor(result.stats.avgRootDepth)}`)
  lines.push(`    Avg Mud Transcend.:   ${scoreColor(result.stats.avgMudTranscendence)}`)
  lines.push(`    Avg Sacred Geometry:  ${scoreColor(result.stats.avgSacredGeometry)}`)
  lines.push(`    Avg Fragrance Qual.:  ${scoreColor(result.stats.avgFragranceQuality)}`)
  lines.push(`    Avg Bloom Vitality:   ${scoreColor(result.stats.avgBloomVitality)}`)
  lines.push(`    Gardener Grade:       ${gardenerGradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Divine Lotus:    ${result.stats.divineLotusCount}`)
  lines.push(`    Sacred Bloom:    ${result.stats.sacredBloomCount}`)
  lines.push(`    Garden Lotus:    ${result.stats.gardenLotusCount}`)
  lines.push(`    Pond Flower:     ${result.stats.pondFlowerCount}`)
  lines.push(`    Mud Sprout:      ${result.stats.mudSproutCount}`)
  lines.push(`    Seed:            ${result.stats.seedCount}`)
  lines.push('')

  if (result.stats.bestPetal) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Petal:      ${result.stats.bestPetal}`)
    lines.push(`    Most Beautiful:  ${result.stats.mostBeautiful}`)
    lines.push(`    Deepest Roots:   ${result.stats.deepestRoots}`)
    lines.push(`    Purest:          ${result.stats.purest}`)
    lines.push(`    Best Structured: ${result.stats.bestStructured}`)
    lines.push(`    Best Documented: ${result.stats.bestDocumented}`)
    lines.push('')
  }

  if (verbose && result.petals.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const p of result.petals) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Petal: ${petalRadianceColor(p.petal.radiance)}(${p.petalBeauty})  Root: ${rootStrengthColor(p.root.strength)}(${p.rootDepth})  Mud: ${mudPurityColor(p.mud.purity)}(${p.mudTranscendence})`)
      lines.push(`      Geom: ${geometryPatternColor(p.geometry.pattern)}(${p.sacredGeometry})  Frag: ${fragranceAromaColor(p.fragrance.aroma)}(${p.fragranceQuality})  Vitality: ${vitalityHealthColor(p.vitality.health)}(${p.bloomVitality})`)
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
