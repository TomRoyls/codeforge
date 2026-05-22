import chalk from 'chalk'

import type { SilverThreadResult } from './silver-thread-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('masterpiece-thread') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'masterpiece-thread': return chalk.rgb(255, 215, 0).bold(condition)
    case 'noble-cord': return chalk.rgb(46, 204, 113)(condition)
    case 'reliable-yarn': return chalk.rgb(52, 152, 219)(condition)
    case 'worn-thread': return chalk.rgb(241, 196, 15)(condition)
    case 'frayed-end': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-weaver') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-weaver': return chalk.rgb(255, 215, 0).bold(grade)
    case 'artisan': return chalk.rgb(46, 204, 113)(grade)
    case 'journeyman': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'clumsy': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example strengthGradeColor('tungsten-grade') returns colored string */
export function strengthGradeColor(grade: string): string {
  switch (grade) {
    case 'tungsten-grade': return chalk.rgb(255, 215, 0).bold(grade)
    case 'steel-thread': return chalk.rgb(46, 204, 113)(grade)
    case 'silver-cord': return chalk.rgb(192, 192, 192)(grade)
    case 'cotton-thread': return chalk.rgb(155, 89, 182)(grade)
    case 'spider-silk': return chalk.rgb(241, 196, 15)(grade)
    case 'broken-filament': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example weavePatternColor('tapestry') returns colored string */
export function weavePatternColor(pattern: string): string {
  switch (pattern) {
    case 'tapestry': return chalk.rgb(255, 215, 0).bold(pattern)
    case 'brocade': return chalk.rgb(46, 204, 113)(pattern)
    case 'damask': return chalk.rgb(155, 89, 182)(pattern)
    case 'plain-weave': return chalk.rgb(52, 152, 219)(pattern)
    case 'burlap': return chalk.rgb(241, 196, 15)(pattern)
    case 'unraveling': return chalk.rgb(231, 76, 60)(pattern)
    default: return pattern
  }
}

/** @example integrityStateColor('pristine') returns colored string */
export function integrityStateColor(state: string): string {
  switch (state) {
    case 'pristine': return chalk.rgb(255, 215, 0).bold(state)
    case 'intact': return chalk.rgb(46, 204, 113)(state)
    case 'mostly-intact': return chalk.rgb(155, 89, 182)(state)
    case 'worn': return chalk.rgb(52, 152, 219)(state)
    case 'tattered': return chalk.rgb(241, 196, 15)(state)
    case 'dissolved': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example lusterShineColor('mirror-finish') returns colored string */
export function lusterShineColor(shine: string): string {
  switch (shine) {
    case 'mirror-finish': return chalk.rgb(255, 215, 0).bold(shine)
    case 'high-polish': return chalk.rgb(46, 204, 113)(shine)
    case 'silver-shine': return chalk.rgb(192, 192, 192)(shine)
    case 'matte': return chalk.rgb(155, 89, 182)(shine)
    case 'tarnished': return chalk.rgb(241, 196, 15)(shine)
    case 'corroded': return chalk.rgb(231, 76, 60)(shine)
    default: return shine
  }
}

/** @example flowStateColor('unbroken-thread') returns colored string */
export function flowStateColor(state: string): string {
  switch (state) {
    case 'unbroken-thread': return chalk.rgb(255, 215, 0).bold(state)
    case 'continuous': return chalk.rgb(46, 204, 113)(state)
    case 'mostly-continuous': return chalk.rgb(155, 89, 182)(state)
    case 'intermittent': return chalk.rgb(52, 152, 219)(state)
    case 'fragmented': return chalk.rgb(241, 196, 15)(state)
    case 'broken': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example tensileGradeColor('carbon-fiber') returns colored string */
export function tensileGradeColor(grade: string): string {
  switch (grade) {
    case 'carbon-fiber': return chalk.rgb(255, 215, 0).bold(grade)
    case 'kevlar': return chalk.rgb(46, 204, 113)(grade)
    case 'steel-cable': return chalk.rgb(155, 89, 182)(grade)
    case 'nylon': return chalk.rgb(52, 152, 219)(grade)
    case 'cotton': return chalk.rgb(241, 196, 15)(grade)
    case 'spun-sugar': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example patternTypeColor('masterwork-tapestry') returns colored string */
export function patternTypeColor(type: string): string {
  switch (type) {
    case 'masterwork-tapestry': return chalk.rgb(255, 215, 0).bold(type)
    case 'fine-fabric': return chalk.rgb(46, 204, 113)(type)
    case 'sturdy-cloth': return chalk.rgb(155, 89, 182)(type)
    case 'patchwork': return chalk.rgb(52, 152, 219)(type)
    case 'rags': return chalk.rgb(241, 196, 15)(type)
    case 'threads': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example patternConditionColor('golden-weave') returns colored string */
export function patternConditionColor(condition: string): string {
  switch (condition) {
    case 'golden-weave': return chalk.rgb(255, 215, 0).bold(condition)
    case 'silver-fabric': return chalk.rgb(46, 204, 113)(condition)
    case 'cotton-cloth': return chalk.rgb(155, 89, 182)(condition)
    case 'burlap-sack': return chalk.rgb(52, 152, 219)(condition)
    case 'tattered-rag': return chalk.rgb(241, 196, 15)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSilverThreadJson(result) returns JSON string */
export function formatSilverThreadJson(result: SilverThreadResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSilverThreadTable(result, verbose) returns formatted string */
export function formatSilverThreadTable(result: SilverThreadResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(192, 192, 192).bold('  Silver Thread Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Loom Overview:'))
  lines.push(`    Overall Strength:  ${scoreColor(result.loom.overallStrength)}`)
  lines.push(`    Avg Thread:        ${scoreColor(result.loom.avgStrength)}`)
  lines.push(`    Avg Weave:         ${scoreColor(result.loom.avgWeave)}`)
  lines.push(`    Avg Tensile:       ${scoreColor(result.loom.avgTensile)}`)
  lines.push(`    Is Strong:         ${result.loom.isStrong ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Patterns:       ${result.stats.totalPatterns}`)
  lines.push(`    Avg Thread Strength:  ${scoreColor(result.stats.avgThreadStrength)}`)
  lines.push(`    Avg Weave Quality:    ${scoreColor(result.stats.avgWeaveQuality)}`)
  lines.push(`    Avg Pattern Integrity:${scoreColor(result.stats.avgPatternIntegrity)}`)
  lines.push(`    Avg Metallic Luster:  ${scoreColor(result.stats.avgMetallicLuster)}`)
  lines.push(`    Avg Continuity:       ${scoreColor(result.stats.avgContinuity)}`)
  lines.push(`    Avg Tensile Quality:  ${scoreColor(result.stats.avgTensileQuality)}`)
  lines.push(`    Weaver Grade:         ${gradeColor(result.stats.weaverGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Masterpiece Thread: ${result.stats.masterpieceThreadCount}`)
  lines.push(`    Noble Cord:         ${result.stats.nobleCordCount}`)
  lines.push(`    Reliable Yarn:      ${result.stats.reliableYarnCount}`)
  lines.push(`    Worn Thread:        ${result.stats.wornThreadCount}`)
  lines.push(`    Frayed End:         ${result.stats.frayedEndCount}`)
  lines.push(`    Dust:               ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestSample) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Sample:      ${result.stats.bestSample}`)
    lines.push(`    Strongest:        ${result.stats.strongest}`)
    lines.push(`    Best Woven:       ${result.stats.bestWoven}`)
    lines.push(`    Most Consistent:  ${result.stats.mostConsistent}`)
    lines.push(`    Most Polished:    ${result.stats.mostPolished}`)
    lines.push(`    Most Durable:     ${result.stats.mostDurable}`)
    lines.push('')
  }

  if (verbose && result.samples.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const s of result.samples) {
      lines.push(`    ${chalk.rgb(192, 192, 192)(s.file)}`)
      lines.push(`      Score: ${scoreColor(s.qualityScore)}  Condition: ${conditionColor(s.condition)}`)
      lines.push(`      Strength: ${strengthGradeColor(s.strength.grade)}(${s.threadStrength})  Weave: ${weavePatternColor(s.weave.pattern)}(${s.weaveQuality})  Integrity: ${integrityStateColor(s.integrity.state)}(${s.patternIntegrity})`)
      lines.push(`      Luster: ${lusterShineColor(s.luster.shine)}(${s.metallicLuster})  Flow: ${flowStateColor(s.flow.state)}(${s.continuity})  Tensile: ${tensileGradeColor(s.tensile.grade)}(${s.tensileQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(192, 192, 192)('\u{1F9F5}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
