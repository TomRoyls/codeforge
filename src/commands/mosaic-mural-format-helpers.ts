import chalk from 'chalk'
import type { MuralMuralResult, MuralPanel, MuralSection, OverallComposition } from './mosaic-mural-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function panelTypeColor(t: string): string {
  if (t === 'masterpiece') return chalk.green(t)
  if (t === 'detailed') return chalk.blue(t)
  if (t === 'sketched') return chalk.cyan(t)
  if (t === 'rough') return chalk.yellow(t)
  if (t === 'blank') return chalk.dim(t)
  if (t === 'restored') return chalk.rgb(255, 165, 0)(t)
  return chalk.red(t)
}

function sectionTypeColor(t: string): string {
  if (t === 'gallery') return chalk.green(t)
  if (t === 'gallery-wall') return chalk.blue(t)
  if (t === 'fresco') return chalk.cyan(t)
  if (t === 'graffiti') return chalk.red(t)
  if (t === 'mosaic') return chalk.magenta(t)
  return chalk.yellow(t)
}

function healthColor(h: string): string {
  if (h === 'pristine') return chalk.green(h)
  if (h === 'well-maintained') return chalk.blue(h)
  if (h === 'weathering') return chalk.yellow(h)
  if (h === 'deteriorating') return chalk.rgb(255, 165, 0)(h)
  if (h === 'crumbling') return chalk.red(h)
  return chalk.red(h)
}

function roleColor(r: string): string {
  if (r === 'focal-point') return chalk.green(r)
  if (r === 'supporting') return chalk.blue(r)
  if (r === 'structural') return chalk.cyan(r)
  if (r === 'transition') return chalk.yellow(r)
  if (r === 'background') return chalk.dim(r)
  return chalk.magenta(r)
}

function styleColor(s: string): string {
  if (s === 'classical') return chalk.cyan(s)
  if (s === 'modern') return chalk.green(s)
  if (s === 'minimalist') return chalk.blue(s)
  if (s === 'baroque') return chalk.magenta(s)
  if (s === 'chaotic') return chalk.red(s)
  return chalk.yellow(s)
}


// ─── Panel Formatting ──────────────────────────────────────────────────────

function formatPanel(p: MuralPanel): string {
  const issues = p.issues.length > 0 ? chalk.red(` [${p.issues.length} issues]`) : ''
  return `  ${chalk.bold(p.file)} ${panelTypeColor(p.panelType)} detail:${scoreColor(p.detailLevel)} rich:${scoreColor(p.colorRichness)} weight:${scoreColor(p.compositionalWeight)} ${roleColor(p.thematicRole)}${issues}`
}

// ─── Section Formatting ────────────────────────────────────────────────────

function formatSection(s: MuralSection): string {
  return `  ${chalk.bold(s.directory)} ${sectionTypeColor(s.sectionType)} coh:${scoreColor(s.coherence)} bal:${scoreColor(s.balance)} detail:${scoreColor(s.avgDetailLevel)} ${healthColor(s.health)} gaps:${s.gaps}`
}

// ─── Composition Formatting ────────────────────────────────────────────────

function formatComposition(c: OverallComposition): string {
  return [
    `  Score: ${scoreColor(c.compositionScore)} | Style: ${styleColor(c.dominantStyle)} | Integrity: ${scoreColor(c.structuralIntegrity)} | Merit: ${scoreColor(c.artisticMerit)}`,
    `  Panels: ${c.totalPanels} (Masterpieces: ${chalk.green(String(c.masterpiecePanels))} Rough: ${chalk.yellow(String(c.roughPanels))} Damaged: ${chalk.red(String(c.damagedPanels))} Blank: ${chalk.dim(String(c.blankPanels))})`,
    `  Gaps: ${c.totalGaps} | Overlaps: ${c.totalOverlaps} | Walls: ${c.totalWalls}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format mosaic mural result as a table
 * @example
 * formatMosaicMuralTable(result, false) // string
 */
export function formatMosaicMuralTable(result: MuralMuralResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🖼️ Mosaic Mural - Code Composition Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🎨 Panels'))
  if (result.panels.length === 0) {
    lines.push(chalk.dim('  No panels to display.'))
  } else {
    const display = verbose ? result.panels : result.panels.slice(0, 15)
    for (const p of display) {
      lines.push(formatPanel(p))
    }
    if (!verbose && result.panels.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.panels.length - 15} more`))
    }
  }
  lines.push('')

  if (result.sections.length > 0) {
    lines.push(chalk.bold('🧱 Wall Sections'))
    for (const s of result.sections) {
      lines.push(formatSection(s))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Composition'))
  lines.push(formatComposition(result.composition))

  if (result.composition.restorationNeeds.length > 0) {
    lines.push('')
    lines.push(chalk.bold('🔧 Restoration Needs'))
    for (const need of result.composition.restorationNeeds) {
      lines.push(`  • ${need}`)
    }
  }

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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format mosaic mural result as JSON
 * @example
 * formatMosaicMuralJson(result) // string
 */
export function formatMosaicMuralJson(result: MuralMuralResult): string {
  return JSON.stringify(result, null, 2)
}
