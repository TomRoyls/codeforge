import chalk from 'chalk'
import type { FrostFernResult } from './frost-fern-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example patternColor('hexagonal-perfection') returns colored string */
export function patternColor(s: string): string {
  switch (s) {
    case 'hexagonal-perfection': return chalk.rgb(118, 255, 3).bold(s)
    case 'dendritic-beauty': return chalk.rgb(46, 204, 113)(s)
    case 'proper-crystal': return chalk.rgb(52, 152, 219)(s)
    case 'rough-ice': return chalk.rgb(241, 196, 15)(s)
    case 'slush': return chalk.rgb(230, 126, 34)(s)
    case 'formless': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example beautyColor('golden-ratio') returns colored string */
export function beautyColor(s: string): string {
  switch (s) {
    case 'golden-ratio': return chalk.rgb(118, 255, 3).bold(s)
    case 'elegant-recursion': return chalk.rgb(46, 204, 113)(s)
    case 'proper-pattern': return chalk.rgb(52, 152, 219)(s)
    case 'basic-repeat': return chalk.rgb(241, 196, 15)(s)
    case 'clunky-loop': return chalk.rgb(230, 126, 34)(s)
    case 'spaghetti': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example finenessColor('lacework') returns colored string */
export function finenessColor(s: string): string {
  switch (s) {
    case 'lacework': return chalk.rgb(118, 255, 3).bold(s)
    case 'fine-filigree': return chalk.rgb(46, 204, 113)(s)
    case 'proper-detail': return chalk.rgb(52, 152, 219)(s)
    case 'adequate-craft': return chalk.rgb(241, 196, 15)(s)
    case 'rough-work': return chalk.rgb(230, 126, 34)(s)
    case 'sledgehammer': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example preservationColor('permafrost') returns colored string */
export function preservationColor(s: string): string {
  switch (s) {
    case 'permafrost': return chalk.rgb(118, 255, 3).bold(s)
    case 'deep-freeze': return chalk.rgb(46, 204, 113)(s)
    case 'proper-cold-storage': return chalk.rgb(52, 152, 219)(s)
    case 'thawing': return chalk.rgb(241, 196, 15)(s)
    case 'melting': return chalk.rgb(230, 126, 34)(s)
    case 'evaporated': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example toughnessColor('arctic-survivor') returns colored string */
export function toughnessColor(s: string): string {
  switch (s) {
    case 'arctic-survivor': return chalk.rgb(118, 255, 3).bold(s)
    case 'winter-hardy': return chalk.rgb(46, 204, 113)(s)
    case 'proper-coating': return chalk.rgb(52, 152, 219)(s)
    case 'thin-skinned': return chalk.rgb(241, 196, 15)(s)
    case 'freezing': return chalk.rgb(230, 126, 34)(s)
    case 'shattered': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example characterColor('unique-snowflake') returns colored string */
export function characterColor(s: string): string {
  switch (s) {
    case 'unique-snowflake': return chalk.rgb(118, 255, 3).bold(s)
    case 'distinctive-pattern': return chalk.rgb(46, 204, 113)(s)
    case 'original-design': return chalk.rgb(52, 152, 219)(s)
    case 'somewhat-generic': return chalk.rgb(241, 196, 15)(s)
    case 'template-copy': return chalk.rgb(230, 126, 34)(s)
    case 'cookie-cutter': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('frost-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'frost-masterpiece': return chalk.rgb(118, 255, 3).bold(c)
    case 'crystal-garden': return chalk.rgb(46, 204, 113)(c)
    case 'delicate-fern': return chalk.rgb(52, 152, 219)(c)
    case 'rough-crystal': return chalk.rgb(241, 196, 15)(c)
    case 'melting-ice': return chalk.rgb(230, 126, 34)(c)
    case 'puddle': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-crystallographer') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-crystallographer': return chalk.rgb(118, 255, 3).bold(g)
    case 'expert-ice-artist': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-frost-worker': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'slush-maker': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatFrostFernJson(result) returns JSON string */
export function formatFrostFernJson(result: FrostFernResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatFrostFernTable(result, verbose) returns formatted string */
export function formatFrostFernTable(result: FrostFernResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Frost Fern Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Tundra:'))
  lines.push(`    Avg Crystalline:        ${scoreColor(result.tundra.avgCrystalline)}`)
  lines.push(`    Avg Preservation:       ${scoreColor(result.tundra.avgPreservation)}`)
  lines.push(`    Avg Resilience:         ${scoreColor(result.tundra.avgResilience)}`)
  lines.push(`    Is Crystalline:         ${result.tundra.isCrystalline ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Crystallinity:  ${scoreColor(result.tundra.overallCrystallinity)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Gardens:                ${result.stats.totalGardens}`)
  lines.push(`    Avg Crystalline Pattern:      ${scoreColor(result.stats.avgCrystallinePattern)}`)
  lines.push(`    Avg Fractal Elegance:         ${scoreColor(result.stats.avgFractalElegance)}`)
  lines.push(`    Avg Delicate Structure:       ${scoreColor(result.stats.avgDelicateStructure)}`)
  lines.push(`    Avg Ice Preservation:         ${scoreColor(result.stats.avgIcePreservation)}`)
  lines.push(`    Avg Winter Resilience:        ${scoreColor(result.stats.avgWinterResilience)}`)
  lines.push(`    Avg Snowflake Uniqueness:     ${scoreColor(result.stats.avgSnowflakeUniqueness)}`)
  lines.push(`    Crystallographer Grade:       ${gradeColor(result.stats.crystallographerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Frost Masterpiece:  ${result.stats.frostMasterpieceCount}`)
  lines.push(`    Crystal Garden:     ${result.stats.crystalGardenCount}`)
  lines.push(`    Delicate Fern:      ${result.stats.delicateFernCount}`)
  lines.push(`    Rough Crystal:      ${result.stats.roughCrystalCount}`)
  lines.push(`    Melting Ice:        ${result.stats.meltingIceCount}`)
  lines.push(`    Puddle:             ${result.stats.puddleCount}`)
  lines.push('')

  if (result.stats.bestCrystal) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Crystal:     ${result.stats.bestCrystal}`)
    lines.push(`    Most Structured:  ${result.stats.mostStructured}`)
    lines.push(`    Most Elegant:     ${result.stats.mostElegant}`)
    lines.push(`    Most Delicate:    ${result.stats.mostDelicate}`)
    lines.push(`    Most Stable:      ${result.stats.mostStable}`)
    lines.push(`    Most Original:    ${result.stats.mostOriginal}`)
    lines.push('')
  }

  if (verbose && result.crystals.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Crystals:'))
    for (const c of result.crystals) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(c.file)}`)
      lines.push(`      Score: ${scoreColor(c.qualityScore)}  Condition: ${conditionColor(c.condition)}`)
      lines.push(`      Crystalline: ${patternColor(c.crystalline.pattern)}(${c.crystallinePattern})  Fractal: ${beautyColor(c.fractal.beauty)}(${c.fractalElegance})  Delicate: ${finenessColor(c.delicate.fineness)}(${c.delicateStructure})`)
      lines.push(`      Preserved: ${preservationColor(c.preserved.preservation)}(${c.icePreservation})  Resilient: ${toughnessColor(c.resilient.toughness)}(${c.winterResilience})  Unique: ${characterColor(c.unique.character)}(${c.snowflakeUniqueness})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{2744}\u{FE0F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
