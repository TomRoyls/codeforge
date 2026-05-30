import chalk from 'chalk'
import type { ParchmentResult, Scroll, ParchmentStats } from './parchment-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classificationColor(c: string): string {
  if (c === 'illuminated-manuscript') return chalk.rgb(255, 215, 0)(c)
  if (c === 'well-written') return chalk.green(c)
  if (c === 'standard') return chalk.cyan(c)
  if (c === 'faded') return chalk.yellow(c)
  if (c === 'blank-scroll') return chalk.dim(c)
  return chalk.red(c)
}

function legibilityColor(l: string): string {
  if (l === 'crystal-clear') return chalk.rgb(135, 206, 250)(l)
  if (l === 'legible') return chalk.green(l)
  if (l === 'readable') return chalk.cyan(l)
  if (l === 'faded') return chalk.yellow(l)
  return chalk.red(l)
}

function gradeColor(g: string): string {
  if (g === 'master-scribe') return chalk.rgb(255, 215, 0)(g)
  if (g === 'skilled-scribe') return chalk.green(g)
  if (g === 'apprentice') return chalk.cyan(g)
  if (g === 'novice') return chalk.yellow(g)
  return chalk.red(g)
}

function sectionQualityColor(q: string): string {
  if (q === 'excellent') return chalk.green(q)
  if (q === 'good') return chalk.cyan(q)
  if (q === 'adequate') return chalk.yellow(q)
  if (q === 'poor') return chalk.magenta(q)
  return chalk.dim(q)
}

// ─── Scroll Formatting ─────────────────────────────────────────────────────

function formatScroll(s: Scroll): string {
  return `  ${chalk.bold(s.file)} ${classificationColor(s.classification)} pres:${scoreColor(s.preservation)} ink:${scoreColor(s.ink)} illum:${scoreColor(s.illumination)} comp:${scoreColor(s.completeness)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: ParchmentStats): string {
  return [
    `  Legibility: ${legibilityColor(stats.overallLegibility)} | Grade: ${gradeColor(stats.scriptoriumGrade)}`,
    `  Coverage: ${scoreColor(stats.documentationCoverage)}% | JSDoc: ${scoreColor(stats.jsDocCoverage)}% | Export Docs: ${scoreColor(stats.exportDocCoverage)}%`,
    `  Illuminated: ${chalk.rgb(255, 215, 0)(String(stats.illuminatedManuscripts))} | Blank: ${chalk.dim(String(stats.blankScrolls))} | Damaged: ${chalk.red(String(stats.damagedScrolls))}`,
    `  Sections: ${stats.totalSections} | Documented: ${chalk.green(String(stats.documentedSections))} | Missing: ${chalk.red(String(stats.undocumentedSections))} | Exported w/o Docs: ${chalk.yellow(String(stats.exportedWithoutDocs))}`,
    `  Marginalia: ${stats.totalMarginalia} (Valuable: ${stats.valuableMarginalia}, Noise: ${stats.noiseMarginalia}, Outdated: ${stats.outdatedMarginalia})`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format parchment result as a table
 * @example
 * formatParchmentTable(result, false) // string
 */
export function formatParchmentTable(result: ParchmentResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📜 Parchment - Code Documentation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📜 Scrolls'))
  if (result.scrolls.length === 0) {
    lines.push(chalk.dim('  No scrolls analyzed.'))
  } else {
    const display = verbose ? result.scrolls : result.scrolls.slice(0, 15)
    for (const s of display) {
      lines.push(formatScroll(s))
      if (verbose && s.sections.length > 0) {
        for (const sec of s.sections.slice(0, 5)) {
          const marker = sec.needsDoc ? chalk.red(' [needs doc]') : ''
          lines.push(`    ${chalk.cyan(sec.name)} (${sec.type}) ${sectionQualityColor(sec.quality)}${marker}`)
        }
      }
    }
    if (!verbose && result.scrolls.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.scrolls.length - 15} more`))
    }
  }
  lines.push('')

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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format parchment result as JSON
 * @example
 * formatParchmentJson(result) // string
 */
export function formatParchmentJson(result: ParchmentResult): string {
  return JSON.stringify(result, null, 2)
}
