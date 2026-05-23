import chalk from 'chalk'
import type { AmberFossilResult } from './amber-fossil-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example stateColor('perfectly-preserved') returns colored string */
export function stateColor(s: string): string {
  switch (s) {
    case 'perfectly-preserved': return chalk.rgb(255, 191, 0).bold(s)
    case 'well-preserved': return chalk.rgb(46, 204, 113)(s)
    case 'good-condition': return chalk.rgb(155, 89, 182)(s)
    case 'weathered': return chalk.rgb(52, 152, 219)(s)
    case 'degraded': return chalk.rgb(241, 196, 15)(s)
    case 'decomposed': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example purityColor('pure-essence') returns colored string */
export function purityColor(p: string): string {
  switch (p) {
    case 'pure-essence': return chalk.rgb(255, 191, 0).bold(p)
    case 'rich-inclusion': return chalk.rgb(46, 204, 113)(p)
    case 'clear-specimen': return chalk.rgb(155, 89, 182)(p)
    case 'cloudy-inclusion': return chalk.rgb(52, 152, 219)(p)
    case 'murky': return chalk.rgb(241, 196, 15)(p)
    case 'opaque-mass': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example agingQualityColor('vintage-masterpiece') returns colored string */
export function agingQualityColor(q: string): string {
  switch (q) {
    case 'vintage-masterpiece': return chalk.rgb(255, 191, 0).bold(q)
    case 'well-aged': return chalk.rgb(46, 204, 113)(q)
    case 'properly-matured': return chalk.rgb(155, 89, 182)(q)
    case 'showing-age': return chalk.rgb(52, 152, 219)(q)
    case 'deteriorating': return chalk.rgb(241, 196, 15)(q)
    case 'ancient-ruin': return chalk.rgb(231, 76, 60)(q)
    default: return q
  }
}

/** @example fossilStateColor('petrified-perfection') returns colored string */
export function fossilStateColor(s: string): string {
  switch (s) {
    case 'petrified-perfection': return chalk.rgb(255, 191, 0).bold(s)
    case 'solid-fossil': return chalk.rgb(46, 204, 113)(s)
    case 'well-mineralized': return chalk.rgb(155, 89, 182)(s)
    case 'partially-fossilized': return chalk.rgb(52, 152, 219)(s)
    case 'soft-sediment': return chalk.rgb(241, 196, 15)(s)
    case 'still-decaying': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example formColor('perfect-crystal') returns colored string */
export function formColor(f: string): string {
  switch (f) {
    case 'perfect-crystal': return chalk.rgb(255, 191, 0).bold(f)
    case 'well-formed': return chalk.rgb(46, 204, 113)(f)
    case 'good-structure': return chalk.rgb(155, 89, 182)(f)
    case 'rough-crystal': return chalk.rgb(52, 152, 219)(f)
    case 'amorphous': return chalk.rgb(241, 196, 15)(f)
    case 'chaotic': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example levelColor('ancient-sage') returns colored string */
export function levelColor(l: string): string {
  switch (l) {
    case 'ancient-sage': return chalk.rgb(255, 191, 0).bold(l)
    case 'wise-elder': return chalk.rgb(46, 204, 113)(l)
    case 'experienced': return chalk.rgb(155, 89, 182)(l)
    case 'maturing': return chalk.rgb(52, 152, 219)(l)
    case 'young': return chalk.rgb(241, 196, 15)(l)
    case 'naive': return chalk.rgb(231, 76, 60)(l)
    default: return l
  }
}

/** @example conditionColor('museum-piece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'museum-piece': return chalk.rgb(255, 191, 0).bold(c)
    case 'fine-specimen': return chalk.rgb(46, 204, 113)(c)
    case 'good-fossil': return chalk.rgb(155, 89, 182)(c)
    case 'weathered-amber': return chalk.rgb(52, 152, 219)(c)
    case 'degrading': return chalk.rgb(241, 196, 15)(c)
    case 'dust': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-paleontologist') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-paleontologist': return chalk.rgb(255, 191, 0).bold(g)
    case 'expert-collector': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-finder': return chalk.rgb(155, 89, 182)(g)
    case 'amateur-collector': return chalk.rgb(52, 152, 219)(g)
    case 'beachcomber': return chalk.rgb(241, 196, 15)(g)
    case 'tourist': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example collectionTypeColor('natural-history-museum') returns colored string */
export function collectionTypeColor(t: string): string {
  switch (t) {
    case 'natural-history-museum': return chalk.rgb(255, 191, 0).bold(t)
    case 'private-collection': return chalk.rgb(46, 204, 113)(t)
    case 'jewelry-box': return chalk.rgb(155, 89, 182)(t)
    case 'curiosity-cabinet': return chalk.rgb(52, 152, 219)(t)
    case 'beach-combing': return chalk.rgb(241, 196, 15)(t)
    case 'empty-display': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example collectionConditionColor('world-class-collection') returns colored string */
export function collectionConditionColor(c: string): string {
  switch (c) {
    case 'world-class-collection': return chalk.rgb(255, 191, 0).bold(c)
    case 'valuable-hoard': return chalk.rgb(46, 204, 113)(c)
    case 'decent-exhibit': return chalk.rgb(155, 89, 182)(c)
    case 'mixed-bag': return chalk.rgb(52, 152, 219)(c)
    case 'dusty-shelf': return chalk.rgb(241, 196, 15)(c)
    case 'empty-case': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAmberFossilJson(result) returns JSON string */
export function formatAmberFossilJson(result: AmberFossilResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAmberFossilTable(result, verbose) returns formatted string */
export function formatAmberFossilTable(result: AmberFossilResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 191, 0).bold('  Amber Fossil Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Museum Overview:'))
  lines.push(`    Overall Preservation:   ${scoreColor(result.museum.overallPreservation)}`)
  lines.push(`    Avg Preservation:       ${scoreColor(result.museum.avgPreservation)}`)
  lines.push(`    Avg Crystalline:        ${scoreColor(result.museum.avgCrystalline)}`)
  lines.push(`    Avg Wisdom:             ${scoreColor(result.museum.avgWisdom)}`)
  lines.push(`    Is Preserved:           ${result.museum.isPreserved ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:        ${result.stats.totalCollections}`)
  lines.push(`    Avg Preservation:         ${scoreColor(result.stats.avgPreservation)}`)
  lines.push(`    Avg Trapped Essence:      ${scoreColor(result.stats.avgTrappedEssence)}`)
  lines.push(`    Avg Aging Grace:          ${scoreColor(result.stats.avgAgingGrace)}`)
  lines.push(`    Avg Fossilization:        ${scoreColor(result.stats.avgFossilization)}`)
  lines.push(`    Avg Crystalline Quality:  ${scoreColor(result.stats.avgCrystallineQuality)}`)
  lines.push(`    Avg Ancient Wisdom:       ${scoreColor(result.stats.avgAncientWisdom)}`)
  lines.push(`    Paleontologist Grade:     ${gradeColor(result.stats.paleontologistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Condition Counts:'))
  lines.push(`    Museum Piece:       ${result.stats.museumPieceCount}`)
  lines.push(`    Fine Specimen:      ${result.stats.fineSpecimenCount}`)
  lines.push(`    Good Fossil:        ${result.stats.goodFossilCount}`)
  lines.push(`    Weathered Amber:    ${result.stats.weatheredAmberCount}`)
  lines.push(`    Degrading:          ${result.stats.degradingCount}`)
  lines.push(`    Dust:               ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestSpecimen) {
    lines.push(chalk.rgb(255, 191, 0)('  Highlights:'))
    lines.push(`    Best Specimen:      ${result.stats.bestSpecimen}`)
    lines.push(`    Best Preserved:     ${result.stats.bestPreserved}`)
    lines.push(`    Best Essence:       ${result.stats.bestEssence}`)
    lines.push(`    Best Aged:          ${result.stats.bestAged}`)
    lines.push(`    Most Immutable:     ${result.stats.mostImmutable}`)
    lines.push(`    Best Structured:    ${result.stats.bestStructured}`)
    lines.push('')
  }

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Per-File Specimens:'))
    for (const sp of result.specimens) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(sp.file)}`)
      lines.push(`      Score: ${scoreColor(sp.qualityScore)}  Condition: ${conditionColor(sp.condition)}`)
      lines.push(`      Preserved: ${stateColor(sp.preserved.state)}(${sp.preservation})  Essence: ${purityColor(sp.essence.purity)}(${sp.trappedEssence})  Aging: ${agingQualityColor(sp.aging.quality)}(${sp.agingGrace})`)
      lines.push(`      Fossil: ${fossilStateColor(sp.fossil.state)}(${sp.fossilization})  Crystal: ${formColor(sp.crystalline.form)}(${sp.crystallineQuality})  Wisdom: ${levelColor(sp.wisdom.level)}(${sp.ancientWisdom})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 191, 0)('\u{1FAB5}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
