import chalk from 'chalk'
import type { FrescoResult, FrescoLayer, FrescoFile, FrescoStats } from './fresco-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function layerColor(n: string): string {
  if (n === 'surface') return chalk.cyan(n)
  if (n === 'interface') return chalk.blue(n)
  if (n === 'implementation') return chalk.yellow(n)
  return chalk.dim(n)
}

function gradeColor(g: string): string {
  if (g === 'masterwork') return chalk.green(g)
  if (g === 'gallery') return chalk.blue(g)
  if (g === 'studio') return chalk.cyan(g)
  if (g === 'student') return chalk.yellow(g)
  return chalk.red(g)
}

function conditionColor(c: string): string {
  if (c === 'pristine') return chalk.green(c)
  if (c === 'well-preserved') return chalk.blue(c)
  if (c === 'restored') return chalk.cyan(c)
  if (c === 'weathered') return chalk.yellow(c)
  return chalk.red(c)
}

function frescoGradeColor(g: string): string {
  if (g === 'Sistine-Chapel') return chalk.green(g)
  if (g === 'gallery-piece') return chalk.blue(g)
  if (g === 'studio-work') return chalk.cyan(g)
  if (g === 'student-art') return chalk.yellow(g)
  return chalk.red(g)
}

function severityColor(s: string): string {
  if (s === 'structural') return chalk.red(s)
  if (s === 'major') return chalk.magenta(s)
  if (s === 'minor') return chalk.yellow(s)
  return chalk.dim(s)
}

function issueTypeColor(t: string): string {
  if (t === 'crack') return chalk.red(t)
  if (t === 'peeling') return chalk.yellow(t)
  if (t === 'bleed-through') return chalk.magenta(t)
  if (t === 'missing-layer') return chalk.blue(t)
  if (t === 'overpainting') return chalk.cyan(t)
  return chalk.dim(t)
}

// ─── Layer Formatting ───────────────────────────────────────────────────────────

function formatLayer(l: FrescoLayer): string {
  const intact = l.isIntact ? chalk.green('✓') : chalk.red('✗')
  return `  ${layerColor(l.name)} ${intact} symbols:${l.symbols} quality:${scoreColor(l.quality)} coverage:${scoreColor(l.coverage)} (${l.files.length} files)`
}

// ─── File Formatting ────────────────────────────────────────────────────────────

function formatFile(f: FrescoFile): string {
  return `  ${chalk.bold(f.file)} ${gradeColor(f.grade)} surf:${scoreColor(f.surfaceQuality)} iface:${scoreColor(f.interfaceQuality)} impl:${scoreColor(f.implementationQuality)} sep:${scoreColor(f.layerSeparation)} acc:${scoreColor(f.surfaceAccuracy)} story:${scoreColor(f.storyCoherence)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: FrescoStats): string {
  return [
    `  Grade: ${frescoGradeColor(stats.frescoGrade)} | Condition: ${conditionColor(stats.overallCondition)} | Integrity: ${scoreColor(stats.layerIntegrity)} | Faithfulness: ${scoreColor(stats.surfaceFaithfulness)}`,
    `  Surface: ${scoreColor(stats.avgSurfaceQuality)} | Interface: ${scoreColor(stats.avgInterfaceQuality)} | Implementation: ${scoreColor(stats.avgImplementationQuality)} | Foundation: ${scoreColor(stats.avgFoundationQuality)}`,
    `  Separation: ${scoreColor(stats.avgLayerSeparation)} | Accuracy: ${scoreColor(stats.avgSurfaceAccuracy)} | Coherence: ${scoreColor(stats.avgStoryCoherence)}`,
    `  Issues: ${stats.totalIssues} (${chalk.red(String(stats.structuralIssues))} structural, ${chalk.dim(String(stats.cosmeticIssues))} cosmetic) | ${chalk.green(String(stats.masterworkFiles))} masterwork | ${chalk.red(String(stats.graffitiFiles))} graffiti`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format fresco result as a table
 * @example
 * formatFrescoTable(result, false) // string
 */
export function formatFrescoTable(result: FrescoResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎨 Fresco — Code Surface & Layer Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🏗️ Layers'))
  for (const l of result.layers) {
    lines.push(formatLayer(l))
  }
  lines.push('')

  lines.push(chalk.bold('🖼️ Files'))
  if (result.files.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.files : result.files.slice(0, 10)
    lines.push(display.map(f => formatFile(f)).join('\n'))
  }
  lines.push('')

  if (result.techniques.length > 0) {
    lines.push(chalk.bold('🖌️ Techniques'))
    for (const t of result.techniques) {
      lines.push(`  ${chalk.cyan(t.name)} — ${chalk.dim(t.description)} (${t.files.length} files, quality:${scoreColor(t.quality)})`)
    }
    lines.push('')
  }

  const allIssues = result.files.flatMap(f => f.issues)
  if (allIssues.length > 0) {
    lines.push(chalk.bold('🔍 Issues'))
    const display = verbose ? allIssues : allIssues.slice(0, 8)
    for (const i of display) {
      lines.push(`  ${issueTypeColor(i.type)} ${severityColor(i.severity)} ${chalk.dim(i.file)} ${chalk.dim(`(${i.layer})`)}: ${i.description}`)
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format fresco result as JSON
 * @example
 * formatFrescoJson(result) // string
 */
export function formatFrescoJson(result: FrescoResult): string {
  return JSON.stringify(result, null, 2)
}
