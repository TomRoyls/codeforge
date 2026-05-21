import chalk from 'chalk'
import type { StainedGlassResult, GlassPane, GlassPanel, StainedGlassStats } from './stained-glass-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function paneTypeColor(t: string): string {
  switch (t) {
    case 'figural': return chalk.rgb(255, 215, 0)(t)
    case 'geometric': return chalk.blue(t)
    case 'floral': return chalk.magenta(t)
    case 'abstract': return chalk.cyan(t)
    case 'medallion': return chalk.rgb(255, 165, 0)(t)
    case 'border': return chalk.gray(t)
    case 'background': return chalk.dim(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'intact': return chalk.green(c)
    case 'cracked': return chalk.yellow(c)
    case 'broken': return chalk.red(c)
    case 'weathered': return chalk.rgb(210, 180, 140)(c)
    case 'restored': return chalk.blue(c)
    case 'missing': return chalk.gray(c)
    default: return chalk.dim(c)
  }
}

function craftsmanshipColor(c: string): string {
  switch (c) {
    case 'master': return chalk.rgb(255, 215, 0)(c)
    case 'artisan': return chalk.green(c)
    case 'journeyman': return chalk.blue(c)
    case 'apprentice': return chalk.yellow(c)
    case 'novice': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function lightEffectColor(l: string): string {
  switch (l) {
    case 'brilliant': return chalk.rgb(255, 215, 0)(l)
    case 'luminous': return chalk.green(l)
    case 'translucent': return chalk.blue(l)
    case 'opaque': return chalk.yellow(l)
    case 'dark': return chalk.red(l)
    default: return chalk.dim(l)
  }
}

function styleColor(s: string): string {
  switch (s) {
    case 'gothic': return chalk.rgb(139, 0, 0)(s)
    case 'romanesque': return chalk.rgb(210, 180, 140)(s)
    case 'byzantine': return chalk.rgb(255, 215, 0)(s)
    case 'art-deco': return chalk.cyan(s)
    case 'modern': return chalk.blue(s)
    case 'folk': return chalk.green(s)
    default: return chalk.dim(s)
  }
}

function panelConditionColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'good': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'damaged': return chalk.rgb(255, 165, 0)(c)
    case 'ruined': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'cathedral': return chalk.rgb(255, 215, 0)(g)
    case 'church': return chalk.green(g)
    case 'chapel': return chalk.blue(g)
    case 'home': return chalk.yellow(g)
    case 'shack': return chalk.rgb(255, 165, 0)(g)
    case 'ruin': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Pane Formatting ─────────────────────────────────────────────────────────

function formatPane(p: GlassPane, verbose: boolean): string {
  const markers: string[] = []
  if (p.condition === 'broken') markers.push(chalk.red('BK'))
  if (p.condition === 'cracked') markers.push(chalk.yellow('CR'))
  if (p.lightEffect === 'dark') markers.push(chalk.gray('DK'))
  if (p.lightEffect === 'brilliant') markers.push(chalk.rgb(255, 215, 0)('BR'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(p.file)} ${paneTypeColor(p.paneType)} quality:${scoreColor(p.glassQuality)} art:${scoreColor(p.artistry)} trans:${scoreColor(p.transparency)} ${conditionColor(p.condition)} ${craftsmanshipColor(p.craftsmanship)} ${lightEffectColor(p.lightEffect)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    color:${p.colorRichness} lead:${scoreColor(p.leadQuality)} story:${scoreColor(p.storytelling)} palette:[${p.colorPalette.join(',')}] shape:${p.paneShape} cames:${p.connections.totalCames}`)
  details.push(`    defects: cracks:${p.defects.cracks} chips:${p.defects.chips} cloud:${p.defects.cloudiness} paint:${p.defects.paintLoss} lead:${p.defects.leadingIssues}`)
  return details.join('\n')
}

// ─── Panel Formatting ────────────────────────────────────────────────────────

function formatPanel(pl: GlassPanel, verbose: boolean): string {
  const line = `  ${chalk.bold(pl.directory)} ${panelConditionColor(pl.condition)} ${styleColor(pl.style)} panes:${pl.totalPanes} art:${scoreColor(pl.avgArtistry)} comp:${scoreColor(pl.composition)} story:${scoreColor(pl.storytelling)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    quality:${scoreColor(pl.avgGlassQuality)} color:${scoreColor(pl.avgColorRichness)} trans:${scoreColor(pl.avgTransparency)} lead:${scoreColor(pl.avgLeadQuality)} cracked:${pl.crackedPanes} broken:${pl.brokenPanes}`)
  details.push(`    narrative: ${pl.narrative}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: StainedGlassStats): string {
  return [
    `  Files: ${stats.totalFiles} | Panels: ${stats.totalPanels} | Panes: ${stats.totalPanes}`,
    `  Quality: ${scoreColor(stats.avgGlassQuality)} | Color: ${scoreColor(stats.avgColorRichness)} | Transparency: ${scoreColor(stats.avgTransparency)} | Artistry: ${scoreColor(stats.avgArtistry)} | Lead: ${scoreColor(stats.avgLeadQuality)}`,
    `  Master: ${chalk.rgb(255, 215, 0)(String(stats.masterCraftsman))} | Novice: ${chalk.red(String(stats.noviceCraftsman))} | Intact: ${chalk.green(String(stats.intactPanes))} | Cracked: ${chalk.yellow(String(stats.crackedPanes))} | Broken: ${chalk.red(String(stats.brokenPanes))}`,
    `  Defects - Cracks: ${stats.totalCracks} | Chips: ${stats.totalChips} | Cloud: ${stats.totalCloudiness} | Paint: ${stats.totalPaintLoss} | Lead: ${stats.totalLeadingIssues}`,
    `  Brilliant: ${chalk.rgb(255, 215, 0)(String(stats.brilliantPanes))} | Dark: ${chalk.red(String(stats.darkPanes))} | Light: ${scoreColor(stats.overallLightTransmission)}`,
    `  Best: ${chalk.green(stats.bestPane)} | Worst: ${chalk.red(stats.worstPane)} | Colorful: ${chalk.magenta(stats.mostColorful)} | Story: ${chalk.blue(stats.bestStorytelling)}`,
    `  Style: ${styleColor(stats.dominantStyle)} | Type: ${paneTypeColor(stats.dominantPaneType)} | Grade: ${gradeColor(stats.windowGrade)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format stained glass result as a table
 * @example
 * formatStainedGlassTable(result, false) // string
 */
export function formatStainedGlassTable(result: StainedGlassResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎨 Stained Glass - Code Window Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🪟 Glass Panes'))
  if (result.panes.length === 0) {
    lines.push(chalk.dim('  No panes detected.'))
  } else {
    const display = verbose ? result.panes : result.panes.slice(0, 15)
    for (const p of display) {
      lines.push(formatPane(p, verbose))
    }
    if (!verbose && result.panes.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.panes.length - 15} more`))
    }
  }
  lines.push('')

  if (result.panels.length > 0) {
    lines.push(chalk.bold('🏛️ Glass Panels'))
    for (const pl of result.panels) {
      lines.push(formatPanel(pl, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
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
 * Format stained glass result as JSON
 * @example
 * formatStainedGlassJson(result) // string
 */
export function formatStainedGlassJson(result: StainedGlassResult): string {
  return JSON.stringify(result, null, 2)
}
