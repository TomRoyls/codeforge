import chalk from 'chalk'
import type { ObsidianShardResult } from './obsidian-shard-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(50, 50, 55)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example edgeColor('razor-edge') returns colored string */
export function edgeColor(e: string): string {
  switch (e) {
    case 'razor-edge': return chalk.rgb(50, 50, 55).bold(e)
    case 'surgical-precision': return chalk.rgb(46, 204, 113)(e)
    case 'keen-blade': return chalk.rgb(52, 152, 219)(e)
    case 'moderately-sharp': return chalk.rgb(241, 196, 15)(e)
    case 'dull-edge': return chalk.rgb(230, 126, 34)(e)
    case 'blunt': return chalk.rgb(231, 76, 60)(e)
    default: return e
  }
}

/** @example coverageColor('complete-coverage') returns colored string */
export function coverageColor(c: string): string {
  switch (c) {
    case 'complete-coverage': return chalk.rgb(50, 50, 55).bold(c)
    case 'thorough-edge': return chalk.rgb(46, 204, 113)(c)
    case 'proper-boundary': return chalk.rgb(52, 152, 219)(c)
    case 'partial-coverage': return chalk.rgb(241, 196, 15)(c)
    case 'gaps-found': return chalk.rgb(230, 126, 34)(c)
    case 'no-coverage': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example fractureColor('clean-break') returns colored string */
export function fractureColor(f: string): string {
  switch (f) {
    case 'clean-break': return chalk.rgb(50, 50, 55).bold(f)
    case 'controlled-fracture': return chalk.rgb(46, 204, 113)(f)
    case 'expected-pattern': return chalk.rgb(52, 152, 219)(f)
    case 'jagged-break': return chalk.rgb(241, 196, 15)(f)
    case 'shatter': return chalk.rgb(230, 126, 34)(f)
    case 'explosion': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example accuracyColor('laser-cut') returns colored string */
export function accuracyColor(a: string): string {
  switch (a) {
    case 'laser-cut': return chalk.rgb(50, 50, 55).bold(a)
    case 'scalpel-precise': return chalk.rgb(46, 204, 113)(a)
    case 'clean-cut': return chalk.rgb(52, 152, 219)(a)
    case 'rough-cut': return chalk.rgb(241, 196, 15)(a)
    case 'hacked': return chalk.rgb(230, 126, 34)(a)
    case 'torn': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example volcanicColor('perfect-glass') returns colored string */
export function volcanicColor(v: string): string {
  switch (v) {
    case 'perfect-glass': return chalk.rgb(50, 50, 55).bold(v)
    case 'rapid-cool': return chalk.rgb(46, 204, 113)(v)
    case 'proper-form': return chalk.rgb(52, 152, 219)(v)
    case 'slow-cool': return chalk.rgb(241, 196, 15)(v)
    case 'devitrified': return chalk.rgb(230, 126, 34)(v)
    case 'slag': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example dangerColor('calculated-risk') returns colored string */
export function dangerColor(d: string): string {
  switch (d) {
    case 'calculated-risk': return chalk.rgb(50, 50, 55).bold(d)
    case 'managed-danger': return chalk.rgb(46, 204, 113)(d)
    case 'proper-caution': return chalk.rgb(52, 152, 219)(d)
    case 'reckless': return chalk.rgb(241, 196, 15)(d)
    case 'hazardous': return chalk.rgb(230, 126, 34)(d)
    case 'catastrophic': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example conditionColor('surgical-shard') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'surgical-shard': return chalk.rgb(50, 50, 55).bold(c)
    case 'razor-edge': return chalk.rgb(46, 204, 113)(c)
    case 'sharp-flake': return chalk.rgb(52, 152, 219)(c)
    case 'dull-piece': return chalk.rgb(241, 196, 15)(c)
    case 'blunt-stone': return chalk.rgb(230, 126, 34)(c)
    case 'gravel': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-flintknapper') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-flintknapper': return chalk.rgb(50, 50, 55).bold(g)
    case 'expert-knapper': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-worker': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'hazard': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatObsidianShardJson(result) returns JSON string */
export function formatObsidianShardJson(result: ObsidianShardResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatObsidianShardTable(result, verbose) returns formatted string */
export function formatObsidianShardTable(result: ObsidianShardResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(50, 50, 55).bold('  Obsidian Shard Analysis'))
  lines.push('')

  lines.push(chalk.rgb(50, 50, 55)('  Workshop:'))
  lines.push(`    Overall Sharpness:      ${scoreColor(result.workshop.overallSharpness)}`)
  lines.push(`    Avg Sharpness:          ${scoreColor(result.workshop.avgSharpness)}`)
  lines.push(`    Avg Cutting Precision:  ${scoreColor(result.workshop.avgCuttingPrecision)}`)
  lines.push(`    Avg Danger Quality:     ${scoreColor(result.workshop.avgDangerQuality)}`)
  lines.push(`    Is Sharp:               ${result.workshop.isSharp ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(50, 50, 55)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:         ${result.stats.totalCollections}`)
  lines.push(`    Avg Sharpness:             ${scoreColor(result.stats.avgSharpness)}`)
  lines.push(`    Avg Edge Case Handling:    ${scoreColor(result.stats.avgEdgeCaseHandling)}`)
  lines.push(`    Avg Fracture Pattern:      ${scoreColor(result.stats.avgFracturePattern)}`)
  lines.push(`    Avg Cutting Precision:     ${scoreColor(result.stats.avgCuttingPrecision)}`)
  lines.push(`    Avg Volcanic Glass:        ${scoreColor(result.stats.avgVolcanicGlass)}`)
  lines.push(`    Avg Danger Quality:        ${scoreColor(result.stats.avgDangerQuality)}`)
  lines.push(`    Flintknapper Grade:        ${gradeColor(result.stats.flintknapperGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(50, 50, 55)('  Condition Counts:'))
  lines.push(`    Surgical Shard:   ${result.stats.surgicalShardCount}`)
  lines.push(`    Razor Edge:       ${result.stats.razorEdgeCount}`)
  lines.push(`    Sharp Flake:      ${result.stats.sharpFlakeCount}`)
  lines.push(`    Dull Piece:       ${result.stats.dullPieceCount}`)
  lines.push(`    Blunt Stone:      ${result.stats.bluntStoneCount}`)
  lines.push(`    Gravel:           ${result.stats.gravelCount}`)
  lines.push('')

  if (result.stats.bestEdge) {
    lines.push(chalk.rgb(50, 50, 55)('  Highlights:'))
    lines.push(`    Best Edge:           ${result.stats.bestEdge}`)
    lines.push(`    Sharpest:            ${result.stats.sharpest}`)
    lines.push(`    Best Edge Cases:     ${result.stats.bestEdgeCases}`)
    lines.push(`    Best Error Patterns: ${result.stats.bestErrorPatterns}`)
    lines.push(`    Most Accurate:       ${result.stats.mostAccurate}`)
    lines.push(`    Safest:              ${result.stats.safest}`)
    lines.push('')
  }

  if (verbose && result.edges.length > 0) {
    lines.push(chalk.rgb(50, 50, 55)('  Per-File Edges:'))
    for (const e of result.edges) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(e.file)}`)
      lines.push(`      Score: ${scoreColor(e.qualityScore)}  Condition: ${conditionColor(e.condition)}`)
      lines.push(`      Sharp: ${edgeColor(e.sharp.edge)}(${e.sharpness})  Edge: ${coverageColor(e.edge.coverage)}(${e.edgeCaseHandling})  Fracture: ${fractureColor(e.fracture.quality)}(${e.fracturePattern})`)
      lines.push(`      Cutting: ${accuracyColor(e.cutting.accuracy)}(${e.cuttingPrecision})  Volcanic: ${volcanicColor(e.volcanic.quality)}(${e.volcanicGlass})  Danger: ${dangerColor(e.dangerous.quality)}(${e.dangerQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(50, 50, 55)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(50, 50, 55)('\u{1F5E1}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
