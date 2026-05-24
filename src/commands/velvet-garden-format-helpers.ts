import chalk from 'chalk'
import type { VelvetGardenResult } from './velvet-garden-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 105, 180)(String(score))
  if (score >= 60) return chalk.rgb(219, 112, 147)(String(score))
  if (score >= 40) return chalk.rgb(199, 21, 133)(String(score))
  return chalk.rgb(139, 69, 97)(String(score))
}

/** @example textureColor('silken-velvet') returns colored string */
export function textureColor(s: string): string {
  switch (s) {
    case 'silken-velvet': return chalk.rgb(255, 105, 180).bold(s)
    case 'soft-petal': return chalk.rgb(219, 112, 147)(s)
    case 'gentle-touch': return chalk.rgb(199, 21, 133)(s)
    case 'rough-bark': return chalk.rgb(139, 69, 97)(s)
    case 'thorny-stem': return chalk.rgb(47, 79, 79)(s)
    case 'sandpaper': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example bloomColor('perfect-bloom') returns colored string */
export function bloomColor(s: string): string {
  switch (s) {
    case 'perfect-bloom': return chalk.rgb(255, 105, 180).bold(s)
    case 'lovely-petal': return chalk.rgb(219, 112, 147)(s)
    case 'pretty-flower': return chalk.rgb(199, 21, 133)(s)
    case 'fading-petal': return chalk.rgb(139, 69, 97)(s)
    case 'wilted-flower': return chalk.rgb(47, 79, 79)(s)
    case 'dead-bloom': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example systemColor('deep-taproot') returns colored string */
export function systemColor(s: string): string {
  switch (s) {
    case 'deep-taproot': return chalk.rgb(255, 105, 180).bold(s)
    case 'strong-roots': return chalk.rgb(219, 112, 147)(s)
    case 'proper-rootball': return chalk.rgb(199, 21, 133)(s)
    case 'shallow-roots': return chalk.rgb(139, 69, 97)(s)
    case 'surface-roots': return chalk.rgb(47, 79, 79)(s)
    case 'no-roots': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example scentColor('intoxicating') returns colored string */
export function scentColor(s: string): string {
  switch (s) {
    case 'intoxicating': return chalk.rgb(255, 105, 180).bold(s)
    case 'heavenly-aroma': return chalk.rgb(219, 112, 147)(s)
    case 'sweet-fragrance': return chalk.rgb(199, 21, 133)(s)
    case 'faint-scent': return chalk.rgb(139, 69, 97)(s)
    case 'no-fragrance': return chalk.rgb(47, 79, 79)(s)
    case 'foul-odor': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example stageColor('full-bloom') returns colored string */
export function stageColor(s: string): string {
  switch (s) {
    case 'full-bloom': return chalk.rgb(255, 105, 180).bold(s)
    case 'opening-bud': return chalk.rgb(219, 112, 147)(s)
    case 'growing-shoot': return chalk.rgb(199, 21, 133)(s)
    case 'dormant-seed': return chalk.rgb(139, 69, 97)(s)
    case 'wilted-stem': return chalk.rgb(47, 79, 79)(s)
    case 'dead-branch': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example conditionColor('master-garden') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'master-garden': return chalk.rgb(255, 105, 180).bold(c)
    case 'flourishing-bed': return chalk.rgb(219, 112, 147)(c)
    case 'growing-garden': return chalk.rgb(199, 21, 133)(c)
    case 'wild-patch': return chalk.rgb(139, 69, 97)(c)
    case 'barren-soil': return chalk.rgb(47, 79, 79)(c)
    case 'dead-zone': return chalk.rgb(60, 60, 60)(c)
    default: return c
  }
}

/** @example gardenerGradeColor('master-gardener') returns colored string */
export function gardenerGradeColor(g: string): string {
  switch (g) {
    case 'master-gardener': return chalk.rgb(255, 105, 180).bold(g)
    case 'expert-horticulturist': return chalk.rgb(219, 112, 147)(g)
    case 'skilled-gardener': return chalk.rgb(199, 21, 133)(g)
    case 'apprentice': return chalk.rgb(139, 69, 97)(g)
    case 'novice': return chalk.rgb(47, 79, 79)(g)
    case 'black-thumb': return chalk.rgb(60, 60, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatVelvetGardenJson(result) returns JSON string */
export function formatVelvetGardenJson(result: VelvetGardenResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatVelvetGardenTable(result, verbose) returns formatted string */
export function formatVelvetGardenTable(result: VelvetGardenResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 105, 180).bold('  Velvet Garden Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 105, 180)('  Garden:'))
  lines.push(`    Avg Softness:         ${scoreColor(result.garden.avgSoftness)}`)
  lines.push(`    Avg Root Depth:       ${scoreColor(result.garden.avgDepth)}`)
  lines.push(`    Avg Bloom:            ${scoreColor(result.garden.avgBloom)}`)
  lines.push(`    Is Flourishing:       ${result.garden.isFlourishing ? chalk.rgb(255, 105, 180)('Yes') : chalk.rgb(60, 60, 60)('No')}`)
  lines.push(`    Overall Lushness:     ${scoreColor(result.garden.overallLushness)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 105, 180)('  Statistics:'))
  lines.push(`    Total Files:                ${result.stats.totalFiles}`)
  lines.push(`    Total Beds:                 ${result.stats.totalBeds}`)
  lines.push(`    Avg Softness:               ${scoreColor(result.stats.avgSoftness)}`)
  lines.push(`    Avg Petal Quality:          ${scoreColor(result.stats.avgPetalQuality)}`)
  lines.push(`    Avg Root Depth:             ${scoreColor(result.stats.avgRootDepth)}`)
  lines.push(`    Avg Fragrance Level:        ${scoreColor(result.stats.avgFragranceLevel)}`)
  lines.push(`    Avg Bloom Potential:        ${scoreColor(result.stats.avgBloomPotential)}`)
  lines.push(`    Gardener Grade:             ${gardenerGradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 105, 180)('  Condition Counts:'))
  lines.push(`    Master Garden:      ${result.stats.masterGardenCount}`)
  lines.push(`    Flourishing Bed:    ${result.stats.flourishingBedCount}`)
  lines.push(`    Growing Garden:     ${result.stats.growingGardenCount}`)
  lines.push(`    Wild Patch:         ${result.stats.wildPatchCount}`)
  lines.push(`    Barren Soil:        ${result.stats.barrenSoilCount}`)
  lines.push(`    Dead Zone:          ${result.stats.deadZoneCount}`)
  lines.push('')

  if (result.stats.bestPetal) {
    lines.push(chalk.rgb(255, 105, 180)('  Highlights:'))
    lines.push(`    Best Petal:         ${result.stats.bestPetal}`)
    lines.push(`    Softest:            ${result.stats.softest}`)
    lines.push(`    Most Beautiful:     ${result.stats.mostBeautiful}`)
    lines.push(`    Deepest Rooted:     ${result.stats.deepestRooted}`)
    lines.push(`    Most Fragrant:      ${result.stats.mostFragrant}`)
    lines.push('')
  }

  if (verbose && result.petals.length > 0) {
    lines.push(chalk.rgb(255, 105, 180)('  Per-File Petals:'))
    for (const p of result.petals) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Softening: ${textureColor(p.softening.texture)}(${p.softness})  Petal: ${bloomColor(p.petal.bloom)}(${p.petalQuality})  Rooting: ${systemColor(p.rooting.system)}(${p.rootDepth})`)
      lines.push(`      Fragrance: ${scentColor(p.fragrance.scent)}(${p.fragranceLevel})  Blooming: ${stageColor(p.blooming.stage)}(${p.bloomPotential})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 105, 180)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 105, 180)('\u{1F33A}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
