import chalk from 'chalk'
import type { AmberResult, PreservedSpecimen, FossilArtifact, AmberStats } from './amber-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function ageColor(a: string): string {
  if (a === 'recent') return chalk.green(a)
  if (a === 'established') return chalk.blue(a)
  if (a === 'mature') return chalk.cyan(a)
  if (a === 'ancient') return chalk.yellow(a)
  return chalk.red(a)
}

function classificationColor(c: string): string {
  if (c === 'perfect-preservation') return chalk.green(c)
  if (c === 'well-preserved') return chalk.blue(c)
  if (c === 'partially-preserved') return chalk.yellow(c)
  if (c === 'degraded') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function fossilTypeColor(t: string): string {
  if (t === 'unused-import') return chalk.yellow(t)
  if (t === 'dead-code') return chalk.dim(t)
  if (t === 'deprecated-pattern') return chalk.red(t)
  if (t === 'legacy-api') return chalk.magenta(t)
  if (t === 'outdated-idiom') return chalk.cyan(t)
  return chalk.rgb(255, 165, 0)(t)
}

function difficultyColor(d: string): string {
  if (d === 'trivial') return chalk.green(d)
  if (d === 'moderate') return chalk.yellow(d)
  if (d === 'difficult') return chalk.rgb(255, 165, 0)(d)
  return chalk.red(d)
}

function preservationColor(p: string): string {
  if (p === 'pristine-collection') return chalk.cyan(p)
  if (p === 'well-curated') return chalk.green(p)
  if (p === 'natural-history') return chalk.blue(p)
  if (p === 'quarry') return chalk.yellow(p)
  return chalk.red(p)
}

// ─── Specimen Formatting ───────────────────────────────────────────────────

function formatSpecimen(s: PreservedSpecimen): string {
  const markers: string[] = []
  if (s.isTimeless) markers.push(chalk.cyan('[timeless]'))
  if (s.isFossilized) markers.push(chalk.red('[fossilized]'))
  if (s.isDegrading) markers.push(chalk.yellow('[degrading]'))
  if (s.isInclusions) markers.push(chalk.magenta('[inclusions]'))

  return `  ${chalk.bold(s.file)} ${ageColor(s.age)} pres:${scoreColor(s.preservation)} qual:${scoreColor(s.quality)} fresh:${scoreColor(s.resinFreshness)} ${classificationColor(s.classification)}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`
}

// ─── Fossil Formatting ─────────────────────────────────────────────────────

function formatFossil(f: FossilArtifact): string {
  return `  ${chalk.dim(f.file)}:${f.line} ${fossilTypeColor(f.type)} ${difficultyColor(f.difficulty)} ${chalk.dim(f.description)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: AmberStats): string {
  return [
    `  Overall: ${preservationColor(stats.overallPreservation)} | Preservation: ${scoreColor(stats.preservationIndex)} | Fossilization Risk: ${scoreColor(100 - stats.fossilizationRisk)}`,
    `  Specimens: ${stats.totalSpecimens} (Perfect: ${chalk.green(String(stats.perfectlyPreserved))} Fossilized: ${chalk.red(String(stats.fossilized))} Degrading: ${chalk.yellow(String(stats.degrading))} Timeless: ${chalk.cyan(String(stats.timelessPatterns))})`,
    `  Fossils: ${stats.totalFossils} (Trivial: ${chalk.green(String(stats.trivialFossils))} Excavation: ${chalk.red(String(stats.excavationRequired))})`,
    `  Avg Preservation: ${scoreColor(stats.avgPreservation)} | Avg Quality: ${scoreColor(stats.avgQuality)} | Avg Freshness: ${scoreColor(stats.avgResinFreshness)}`,
    `  Age Distribution: Recent: ${chalk.green(String(stats.recentCode))} Ancient: ${chalk.yellow(String(stats.ancientCode))} Fossilized: ${chalk.red(String(stats.fossilizedCode))}`,
    `  Geological Complexity: ${scoreColor(stats.geologicalComplexity)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format amber result as a table
 * @example
 * formatAmberTable(result, false) // string
 */
export function formatAmberTable(result: AmberResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🟡 Amber - Code Preservation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🔬 Preserved Specimens'))
  if (result.specimens.length === 0) {
    lines.push(chalk.dim('  No specimens analyzed.'))
  } else {
    const display = verbose ? result.specimens : result.specimens.slice(0, 15)
    for (const s of display) {
      lines.push(formatSpecimen(s))
      if (verbose && s.layers.length > 0) {
        for (const layer of s.layers.slice(0, 3)) {
          const stability = layer.isStable ? chalk.green('stable') : layer.isEroding ? chalk.red('eroding') : chalk.dim('neutral')
          lines.push(`    depth:${layer.depth} ${chalk.dim(layer.pattern)} qual:${scoreColor(layer.quality)} ${stability}`)
        }
      }
    }
    if (!verbose && result.specimens.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.specimens.length - 15} more`))
    }
  }
  lines.push('')

  if (result.fossils.length > 0) {
    lines.push(chalk.bold('🦴 Fossil Artifacts'))
    const display = verbose ? result.fossils : result.fossils.slice(0, 15)
    for (const f of display) {
      lines.push(formatFossil(f))
    }
    if (!verbose && result.fossils.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.fossils.length - 15} more`))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format amber result as JSON
 * @example
 * formatAmberJson(result) // string
 */
export function formatAmberJson(result: AmberResult): string {
  return JSON.stringify(result, null, 2)
}
