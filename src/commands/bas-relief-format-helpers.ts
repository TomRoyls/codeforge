import chalk from 'chalk'
import type { BasReliefResult, ReliefElement, ReliefPanel, BasReliefStats } from './bas-relief-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function reliefTypeColor(t: string): string {
  switch (t) {
    case 'alto-rilievo': return chalk.rgb(255, 215, 0)(t)
    case 'mezzo-rilievo': return chalk.green(t)
    case 'basso-rilievo': return chalk.blue(t)
    case 'stiacciato': return chalk.cyan(t)
    case 'sunken': return chalk.yellow(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'intact': return chalk.rgb(255, 215, 0)(c)
    case 'weathered': return chalk.green(c)
    case 'damaged': return chalk.red(c)
    case 'restored': return chalk.blue(c)
    default: return chalk.dim(c)
  }
}

function angleColor(a: string): string {
  switch (a) {
    case 'frontal': return chalk.rgb(255, 215, 0)(a)
    case 'three-quarter': return chalk.green(a)
    case 'profile': return chalk.blue(a)
    default: return chalk.dim(a)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-sculptor': return chalk.rgb(255, 215, 0)(g)
    case 'skilled-artisan': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'novice': return chalk.yellow(g)
    default: return chalk.red(g)
  }
}

function panelConditionColor(c: string): string {
  switch (c) {
    case 'museum-quality': return chalk.rgb(255, 215, 0)(c)
    case 'well-preserved': return chalk.green(c)
    case 'fair': return chalk.blue(c)
    case 'weathered': return chalk.yellow(c)
    case 'damaged': return chalk.rgb(255, 165, 0)(c)
    default: return chalk.red(c)
  }
}

function panelTypeColor(t: string): string {
  switch (t) {
    case 'narrative': return chalk.rgb(255, 215, 0)(t)
    case 'decorative': return chalk.green(t)
    case 'architectural': return chalk.blue(t)
    case 'commemorative': return chalk.magenta(t)
    default: return chalk.dim(t)
  }
}

// ─── Element Formatting ──────────────────────────────────────────────────────

function formatElement(e: ReliefElement, verbose: boolean): string {
  const line = `  ${chalk.bold(e.file)} proj:${scoreColor(e.projection)} depth:${scoreColor(e.depth)} def:${scoreColor(e.definition)} bg:${scoreColor(e.background)} fg:${scoreColor(e.foreground)} quality:${scoreColor(e.sculpturalQuality)} ${reliefTypeColor(e.reliefType)} ${angleColor(e.viewerAngle)} ${conditionColor(e.condition)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    coherence:${scoreColor(e.storyCoherence)} layers:${e.composition.layers} dominant:${e.composition.dominantElement} supporting:${e.composition.supportingElements} bg-elements:${e.composition.backgroundElements}`)
  details.push(`    chisel:${e.carving.chiselMarks} smooth:${e.carving.smoothAreas} rough:${e.carving.roughAreas} polished:${e.carving.polishedAreas}`)
  details.push(`    surface:${e.projectionMap.surface} mid:${e.projectionMap.midRelief} deep:${e.projectionMap.deepRelief} background:${e.projectionMap.background}`)
  if (e.issues.length > 0) details.push(`    issues: ${e.issues.join(', ')}`)
  if (e.highlights.length > 0) details.push(`    highlights: ${e.highlights.join(', ')}`)
  return details.join('\n')
}

// ─── Panel Formatting ────────────────────────────────────────────────────────

function formatPanel(p: ReliefPanel, verbose: boolean): string {
  const line = `  ${chalk.bold(p.directory)} proj:${scoreColor(p.avgProjection)} def:${scoreColor(p.avgDefinition)} quality:${scoreColor(p.avgSculpturalQuality)} ${panelTypeColor(p.panelType)} ${panelConditionColor(p.condition)} elements:${p.elements.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    coherence:${scoreColor(p.avgStoryCoherence)} layers:${p.totalLayers} coherent:${p.isCoherent} focal:${p.focalElement}`)
  details.push(`    depth range: ${p.depthRange.min}-${p.depthRange.max} narrative: ${p.narrative}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: BasReliefStats): string {
  return [
    `  Grade: ${gradeColor(stats.sculptorGrade)} | Quality: ${scoreColor(stats.overallReliefQuality)} | Depth: ${scoreColor(stats.depthScore)} | Composition: ${scoreColor(stats.compositionScore)}`,
    `  Files: ${stats.totalFiles} | Panels: ${stats.totalPanels}`,
    `  Avg Projection: ${scoreColor(stats.avgProjection)} | Depth: ${scoreColor(stats.avgDepth)} | Definition: ${scoreColor(stats.avgDefinition)} | Background: ${scoreColor(stats.avgBackground)} | Foreground: ${scoreColor(stats.avgForeground)}`,
    `  Quality: ${scoreColor(stats.avgSculpturalQuality)} | Coherence: ${scoreColor(stats.avgStoryCoherence)}`,
    `  Alto-rilievo: ${chalk.rgb(255, 215, 0)(String(stats.altoRilievoFiles))} | Basso-rilievo: ${chalk.blue(String(stats.bassoRilievoFiles))} | Flat: ${chalk.dim(String(stats.flatFiles))}`,
    `  Intact: ${chalk.green(String(stats.intactFiles))} | Damaged: ${chalk.red(String(stats.damagedFiles))} | Frontal: ${chalk.rgb(255, 215, 0)(String(stats.frontalFiles))} | Hidden: ${chalk.dim(String(stats.hiddenFiles))}`,
    `  Narrative Panels: ${stats.narrativePanels} | Decorative Panels: ${stats.decorativePanels}`,
    `  Best Panel: ${chalk.green(stats.bestPanel)} | Worst Panel: ${chalk.red(stats.worstPanel)}`,
    `  Deepest: ${chalk.blue(stats.deepestElement)} | Shallowest: ${chalk.yellow(stats.shallowestElement)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format bas-relief result as a table
 * @example
 * formatBasReliefTable(result, false) // string
 */
export function formatBasReliefTable(result: BasReliefResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏺 Bas-Relief - Code Depth and Projection Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🗿 Relief Elements'))
  if (result.elements.length === 0) {
    lines.push(chalk.dim('  No relief elements detected.'))
  } else {
    const display = verbose ? result.elements : result.elements.slice(0, 15)
    for (const e of display) {
      lines.push(formatElement(e, verbose))
    }
    if (!verbose && result.elements.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.elements.length - 15} more`))
    }
  }
  lines.push('')

  if (result.panels.length > 0) {
    lines.push(chalk.bold('🖼️ Panels'))
    for (const p of result.panels) {
      lines.push(formatPanel(p, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format bas-relief result as JSON
 * @example
 * formatBasReliefJson(result) // string
 */
export function formatBasReliefJson(result: BasReliefResult): string {
  return JSON.stringify(result, null, 2)
}
