import chalk from 'chalk'
import type { TitaniumSpineResult } from './titanium-spine-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 183, 77)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example gradeColor('aerospace-grade') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'aerospace-grade': return chalk.rgb(255, 183, 77).bold(g)
    case 'medical-grade': return chalk.rgb(46, 204, 113)(g)
    case 'industrial-grade': return chalk.rgb(52, 152, 219)(g)
    case 'commercial-grade': return chalk.rgb(241, 196, 15)(g)
    case 'scrap-grade': return chalk.rgb(230, 126, 34)(g)
    case 'fail-grade': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example ratioColor('exceptional-ratio') returns colored string */
export function ratioColor(r: string): string {
  switch (r) {
    case 'exceptional-ratio': return chalk.rgb(255, 183, 77).bold(r)
    case 'high-efficiency': return chalk.rgb(46, 204, 113)(r)
    case 'proper-balance': return chalk.rgb(52, 152, 219)(r)
    case 'adequate': return chalk.rgb(241, 196, 15)(r)
    case 'heavy-for-purpose': return chalk.rgb(230, 126, 34)(r)
    case 'bloated': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example flexColor('supertensile') returns colored string */
export function flexColor(f: string): string {
  switch (f) {
    case 'supertensile': return chalk.rgb(255, 183, 77).bold(f)
    case 'highly-flexible': return chalk.rgb(46, 204, 113)(f)
    case 'properly-elastic': return chalk.rgb(52, 152, 219)(f)
    case 'moderate-bend': return chalk.rgb(241, 196, 15)(f)
    case 'stiff': return chalk.rgb(230, 126, 34)(f)
    case 'brittle': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example protectionColor('passive-film') returns colored string */
export function protectionColor(p: string): string {
  switch (p) {
    case 'passive-film': return chalk.rgb(255, 183, 77).bold(p)
    case 'highly-resistant': return chalk.rgb(46, 204, 113)(p)
    case 'proper-coating': return chalk.rgb(52, 152, 219)(p)
    case 'moderate-resistance': return chalk.rgb(241, 196, 15)(p)
    case 'corroding': return chalk.rgb(230, 126, 34)(p)
    case 'rusting': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example compatColor('universal-donor') returns colored string */
export function compatColor(c: string): string {
  switch (c) {
    case 'universal-donor': return chalk.rgb(255, 183, 77).bold(c)
    case 'highly-compatible': return chalk.rgb(46, 204, 113)(c)
    case 'proper-interface': return chalk.rgb(52, 152, 219)(c)
    case 'partial-fit': return chalk.rgb(241, 196, 15)(c)
    case 'rejection-risk': return chalk.rgb(230, 126, 34)(c)
    case 'foreign-body': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example limitColor('infinite-life') returns colored string */
export function limitColor(l: string): string {
  switch (l) {
    case 'infinite-life': return chalk.rgb(255, 183, 77).bold(l)
    case 'high-cycle': return chalk.rgb(46, 204, 113)(l)
    case 'proper-endurance': return chalk.rgb(52, 152, 219)(l)
    case 'limited-life': return chalk.rgb(241, 196, 15)(l)
    case 'low-cycle': return chalk.rgb(230, 126, 34)(l)
    case 'premature-failure': return chalk.rgb(231, 76, 60)(l)
    default: return l
  }
}

/** @example conditionColor('titanium-spine') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'titanium-spine': return chalk.rgb(255, 183, 77).bold(c)
    case 'strong-backbone': return chalk.rgb(46, 204, 113)(c)
    case 'solid-structure': return chalk.rgb(52, 152, 219)(c)
    case 'weakening': return chalk.rgb(241, 196, 15)(c)
    case 'degrading': return chalk.rgb(230, 126, 34)(c)
    case 'collapsed': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example metallurgistColor('materials-scientist') returns colored string */
export function metallurgistColor(g: string): string {
  switch (g) {
    case 'materials-scientist': return chalk.rgb(255, 183, 77).bold(g)
    case 'master-metallurgist': return chalk.rgb(46, 204, 113)(g)
    case 'expert-engineer': return chalk.rgb(52, 152, 219)(g)
    case 'structural-engineer': return chalk.rgb(241, 196, 15)(g)
    case 'apprentice': return chalk.rgb(230, 126, 34)(g)
    case 'quack': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatTitaniumSpineJson(result) returns JSON string */
export function formatTitaniumSpineJson(result: TitaniumSpineResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatTitaniumSpineTable(result, verbose) returns formatted string */
export function formatTitaniumSpineTable(result: TitaniumSpineResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 183, 77).bold('  Titanium Spine Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Skeleton:'))
  lines.push(`    Avg Integrity:      ${scoreColor(result.skeleton.avgIntegrity)}`)
  lines.push(`    Avg Flexural:        ${scoreColor(result.skeleton.avgFlexural)}`)
  lines.push(`    Avg Endurance:       ${scoreColor(result.skeleton.avgEndurance)}`)
  lines.push(`    Is Titanium:         ${result.skeleton.isTitanium ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Strength:    ${scoreColor(result.skeleton.overallStrength)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Statistics:'))
  lines.push(`    Total Files:                 ${result.stats.totalFiles}`)
  lines.push(`    Total Columns:               ${result.stats.totalColumns}`)
  lines.push(`    Avg Structural Integrity:    ${scoreColor(result.stats.avgStructuralIntegrity)}`)
  lines.push(`    Avg Strength to Weight:      ${scoreColor(result.stats.avgStrengthToWeight)}`)
  lines.push(`    Avg Flexural Strength:       ${scoreColor(result.stats.avgFlexuralStrength)}`)
  lines.push(`    Avg Corrosion Resistance:    ${scoreColor(result.stats.avgCorrosionResistance)}`)
  lines.push(`    Avg Biocompatibility:        ${scoreColor(result.stats.avgBiocompatibility)}`)
  lines.push(`    Avg Fatigue Endurance:       ${scoreColor(result.stats.avgFatigueEndurance)}`)
  lines.push(`    Metallurgist Grade:          ${metallurgistColor(result.stats.metallurgistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 183, 77)('  Condition Counts:'))
  lines.push(`    Titanium Spine:     ${result.stats.titaniumSpineCount}`)
  lines.push(`    Strong Backbone:    ${result.stats.strongBackboneCount}`)
  lines.push(`    Solid Structure:    ${result.stats.solidStructureCount}`)
  lines.push(`    Weakening:          ${result.stats.weakeningCount}`)
  lines.push(`    Degrading:          ${result.stats.degradingCount}`)
  lines.push(`    Collapsed:          ${result.stats.collapsedCount}`)
  lines.push('')

  if (result.stats.bestVertebra) {
    lines.push(chalk.rgb(255, 183, 77)('  Highlights:'))
    lines.push(`    Best Vertebra:        ${result.stats.bestVertebra}`)
    lines.push(`    Strongest:            ${result.stats.strongest}`)
    lines.push(`    Most Efficient:       ${result.stats.mostEfficient}`)
    lines.push(`    Most Adaptable:       ${result.stats.mostAdaptable}`)
    lines.push(`    Most Resilient:       ${result.stats.mostResilient}`)
    lines.push(`    Best Integrated:      ${result.stats.bestIntegrated}`)
    lines.push('')
  }

  if (verbose && result.vertebrae.length > 0) {
    lines.push(chalk.rgb(255, 183, 77)('  Per-File Vertebrae:'))
    for (const v of result.vertebrae) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(v.file)}`)
      lines.push(`      Score: ${scoreColor(v.qualityScore)}  Condition: ${conditionColor(v.condition)}`)
      lines.push(`      Structural: ${gradeColor(v.structural.grade)}(${v.structuralIntegrity})  Strength: ${ratioColor(v.strength.grade2)}(${v.strengthToWeight})  Flexural: ${flexColor(v.flexural.flexibility)}(${v.flexuralStrength})`)
      lines.push(`      Corrosion: ${protectionColor(v.corrosion.protection)}(${v.corrosionResistance})  Bio: ${compatColor(v.biocompatible.compatibility)}(${v.biocompatibility})  Fatigue: ${limitColor(v.fatigue.limit)}(${v.fatigueEndurance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 183, 77)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 183, 77)('\u{1F529}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
