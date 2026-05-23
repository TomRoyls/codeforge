import chalk from 'chalk'
import type { IvoryTowerResult } from './ivory-tower-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example abstractionLevelColor('transcendent') returns colored string */
export function abstractionLevelColor(l: string): string {
  switch (l) {
    case 'transcendent': return chalk.rgb(255, 191, 0).bold(l)
    case 'elevated': return chalk.rgb(46, 204, 113)(l)
    case 'proper-abstraction': return chalk.rgb(155, 89, 182)(l)
    case 'grounded': return chalk.rgb(52, 152, 219)(l)
    case 'earthy': return chalk.rgb(241, 196, 15)(l)
    case 'bedrock': return chalk.rgb(231, 76, 60)(l)
    default: return l
  }
}

/** @example autonomyColor('self-sufficient') returns colored string */
export function autonomyColor(a: string): string {
  switch (a) {
    case 'self-sufficient': return chalk.rgb(255, 191, 0).bold(a)
    case 'largely-independent': return chalk.rgb(46, 204, 113)(a)
    case 'properly-coupled': return chalk.rgb(155, 89, 182)(a)
    case 'somewhat-dependent': return chalk.rgb(52, 152, 219)(a)
    case 'tightly-coupled': return chalk.rgb(241, 196, 15)(a)
    case 'entangled': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example rigorColor('mathematical-proof') returns colored string */
export function rigorColor(r: string): string {
  switch (r) {
    case 'mathematical-proof': return chalk.rgb(255, 191, 0).bold(r)
    case 'formal-verification': return chalk.rgb(46, 204, 113)(r)
    case 'well-reasoned': return chalk.rgb(155, 89, 182)(r)
    case 'plausible': return chalk.rgb(52, 152, 219)(r)
    case 'approximate': return chalk.rgb(241, 196, 15)(r)
    case 'guessed': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example scholarshipColor('doctoral-thesis') returns colored string */
export function scholarshipColor(s: string): string {
  switch (s) {
    case 'doctoral-thesis': return chalk.rgb(255, 191, 0).bold(s)
    case 'research-paper': return chalk.rgb(46, 204, 113)(s)
    case 'textbook': return chalk.rgb(155, 89, 182)(s)
    case 'lecture-notes': return chalk.rgb(52, 152, 219)(s)
    case 'readme': return chalk.rgb(241, 196, 15)(s)
    case 'no-documentation': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example heightColor('stratospheric') returns colored string */
export function heightColor(h: string): string {
  switch (h) {
    case 'stratospheric': return chalk.rgb(255, 191, 0).bold(h)
    case 'high-altitude': return chalk.rgb(46, 204, 113)(h)
    case 'proper-elevation': return chalk.rgb(155, 89, 182)(h)
    case 'ground-level': return chalk.rgb(52, 152, 219)(h)
    case 'basement': return chalk.rgb(241, 196, 15)(h)
    case 'subterranean': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example dangerColor('pragmatic-balance') returns colored string */
export function dangerColor(d: string): string {
  switch (d) {
    case 'pragmatic-balance': return chalk.rgb(46, 204, 113)(d)
    case 'minor-ivory': return chalk.rgb(52, 152, 219)(d)
    case 'moderate-tower': return chalk.rgb(241, 196, 15)(d)
    case 'significant-tower': return chalk.rgb(230, 126, 34)(d)
    case 'ivory-fortress': return chalk.rgb(231, 76, 60)(d)
    case 'cloud-cuckoo': return chalk.rgb(231, 76, 60).bold(d)
    default: return d
  }
}

/** @example conditionColor('enlightened-tower') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'enlightened-tower': return chalk.rgb(255, 191, 0).bold(c)
    case 'scholarly-retreat': return chalk.rgb(46, 204, 113)(c)
    case 'balanced-observatory': return chalk.rgb(155, 89, 182)(c)
    case 'ivory-isolation': return chalk.rgb(52, 152, 219)(c)
    case 'disconnected-spire': return chalk.rgb(241, 196, 15)(c)
    case 'ruined-tower': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('nobel-laureate') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'nobel-laureate': return chalk.rgb(255, 191, 0).bold(g)
    case 'full-professor': return chalk.rgb(46, 204, 113)(g)
    case 'associate-professor': return chalk.rgb(155, 89, 182)(g)
    case 'adjunct': return chalk.rgb(52, 152, 219)(g)
    case 'teaching-assistant': return chalk.rgb(241, 196, 15)(g)
    case 'undergraduate': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example floorTypeColor('grand-university') returns colored string */
export function floorTypeColor(t: string): string {
  switch (t) {
    case 'grand-university': return chalk.rgb(255, 191, 0).bold(t)
    case 'research-institute': return chalk.rgb(46, 204, 113)(t)
    case 'think-tank': return chalk.rgb(155, 89, 182)(t)
    case 'study-room': return chalk.rgb(52, 152, 219)(t)
    case 'closet-office': return chalk.rgb(241, 196, 15)(t)
    case 'empty-room': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example floorConditionColor('tower-of-wisdom') returns colored string */
export function floorConditionColor(c: string): string {
  switch (c) {
    case 'tower-of-wisdom': return chalk.rgb(255, 191, 0).bold(c)
    case 'center-of-learning': return chalk.rgb(46, 204, 113)(c)
    case 'proper-institution': return chalk.rgb(155, 89, 182)(c)
    case 'struggling-academy': return chalk.rgb(52, 152, 219)(c)
    case 'crumbling-tower': return chalk.rgb(241, 196, 15)(c)
    case 'ruins': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatIvoryTowerJson(result) returns JSON string */
export function formatIvoryTowerJson(result: IvoryTowerResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatIvoryTowerTable(result, verbose) returns formatted string */
export function formatIvoryTowerTable(result: IvoryTowerResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 191, 0).bold('  Ivory Tower Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Campus Overview:'))
  lines.push(`    Overall Elevation:    ${scoreColor(result.campus.overallElevation)}`)
  lines.push(`    Avg Abstraction:      ${scoreColor(result.campus.avgAbstraction)}`)
  lines.push(`    Avg Purity:           ${scoreColor(result.campus.avgPurity)}`)
  lines.push(`    Avg Scholarly:        ${scoreColor(result.campus.avgScholarly)}`)
  lines.push(`    Is Enlightened:       ${result.campus.isEnlightened ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Floors:           ${result.stats.totalFloors}`)
  lines.push(`    Avg Abstraction:        ${scoreColor(result.stats.avgAbstraction)}`)
  lines.push(`    Avg Isolation:          ${scoreColor(result.stats.avgIsolation)}`)
  lines.push(`    Avg Theoretical Purity: ${scoreColor(result.stats.avgTheoreticalPurity)}`)
  lines.push(`    Avg Scholarly Depth:    ${scoreColor(result.stats.avgScholarlyDepth)}`)
  lines.push(`    Avg Elevation:          ${scoreColor(result.stats.avgElevation)}`)
  lines.push(`    Avg Isolation Risk:     ${scoreColor(result.stats.avgIsolationRisk)}`)
  lines.push(`    Scholar Grade:          ${gradeColor(result.stats.scholarGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Condition Counts:'))
  lines.push(`    Enlightened Tower:     ${result.stats.enlightenedTowerCount}`)
  lines.push(`    Scholarly Retreat:     ${result.stats.scholarlyRetreatCount}`)
  lines.push(`    Balanced Observatory:  ${result.stats.balancedObservatoryCount}`)
  lines.push(`    Ivory Isolation:       ${result.stats.ivoryIsolationCount}`)
  lines.push(`    Disconnected Spire:    ${result.stats.disconnectedSpireCount}`)
  lines.push(`    Ruined Tower:          ${result.stats.ruinedTowerCount}`)
  lines.push('')

  if (result.stats.bestLevel) {
    lines.push(chalk.rgb(255, 191, 0)('  Highlights:'))
    lines.push(`    Best Level:        ${result.stats.bestLevel}`)
    lines.push(`    Most Abstract:     ${result.stats.mostAbstract}`)
    lines.push(`    Most Independent:  ${result.stats.mostIndependent}`)
    lines.push(`    Most Pure:         ${result.stats.mostPure}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Most Elevated:     ${result.stats.mostElevated}`)
    lines.push('')
  }

  if (verbose && result.levels.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Per-File Levels:'))
    for (const l of result.levels) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(l.file)}`)
      lines.push(`      Score: ${scoreColor(l.qualityScore)}  Condition: ${conditionColor(l.condition)}`)
      lines.push(`      Abstract: ${abstractionLevelColor(l.abstract.level)}(${l.abstraction})  Isolated: ${autonomyColor(l.isolated.autonomy)}(${l.isolation})  Pure: ${rigorColor(l.pure.rigor)}(${l.theoreticalPurity})`)
      lines.push(`      Scholarly: ${scholarshipColor(l.scholarly.scholarship)}(${l.scholarlyDepth})  Elevated: ${heightColor(l.elevated.height)}(${l.elevation})  Risk: ${dangerColor(l.risky.danger)}(${l.isolationRisk})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 191, 0)('\u{1F3DB}\u{FE0F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
