import chalk from 'chalk'
import type { TapestryThreadResult, Thread, ThreadTangle, ThreadSpool, TapestryThreadStats } from './tapestry-thread-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function threadTypeColor(t: string): string {
  if (t === 'feature') return chalk.blue(t)
  if (t === 'data-type') return chalk.green(t)
  if (t === 'error-path') return chalk.red(t)
  if (t === 'logging') return chalk.yellow(t)
  return chalk.cyan(t)
}

function weaveColor(w: string): string {
  if (w === 'seamless') return chalk.green(w)
  if (w === 'woven') return chalk.blue(w)
  if (w === 'tangled') return chalk.yellow(w)
  if (w === 'frayed') return chalk.magenta(w)
  return chalk.red(w)
}

function tangleSeverityColor(s: string): string {
  if (s === 'severe') return chalk.red(s)
  if (s === 'moderate') return chalk.yellow(s)
  return chalk.dim(s)
}

function roleColor(r: string): string {
  if (r === 'entry') return chalk.green(r)
  if (r === 'exit') return chalk.blue(r)
  if (r === 'branch') return chalk.yellow(r)
  if (r === 'dead-end') return chalk.red(r)
  return chalk.dim(r)
}

// ─── Thread Formatting ──────────────────────────────────────────────────────────

function formatThread(t: Thread): string {
  const status = t.isComplete ? chalk.green('complete') : t.isBroken ? chalk.red('broken') : chalk.yellow('partial')
  return `  ${chalk.bold(t.concern)} ${threadTypeColor(t.type)} ${status} cont:${scoreColor(t.continuity)} vis:${scoreColor(t.visibility)} comp:${scoreColor(t.completeness)} (${t.path.length} points)`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: TapestryThreadStats): string {
  return [
    `  Weave: ${weaveColor(stats.overallWeave)} | Integrity: ${scoreColor(stats.threadIntegrity)} | Coverage: ${scoreColor(stats.threadCoverage)}`,
    `  Threads: ${stats.totalThreads} (feat:${stats.featureThreads} type:${stats.dataTypeThreads} err:${stats.errorPathThreads} log:${stats.loggingThreads})`,
    `  Complete: ${chalk.green(String(stats.completeThreads))} | Broken: ${chalk.red(String(stats.brokenThreads))} | Tangles: ${stats.totalTangles} (${chalk.red(String(stats.severeTangles))} severe)`,
    `  Continuity: ${scoreColor(stats.avgContinuity)} | Visibility: ${scoreColor(stats.avgVisibility)} | Completeness: ${scoreColor(stats.avgCompleteness)}`,
    `  Spool Hubs: ${chalk.blue(String(stats.spoolHubs))} | Dead Ends: ${chalk.red(String(stats.deadEnds))}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format tapestry thread result as a table
 * @example
 * formatTapestryThreadTable(result, false) // string
 */
export function formatTapestryThreadTable(result: TapestryThreadResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧵 Tapestry Thread - Code Thread & Tracing Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🔗 Threads'))
  if (result.threads.length === 0) {
    lines.push(chalk.dim('  No threads detected.'))
  } else {
    const display = verbose ? result.threads : result.threads.slice(0, 12)
    for (const t of display) {
      lines.push(formatThread(t))
      if (verbose && t.path.length > 0) {
        for (const p of t.path.slice(0, 4)) {
          lines.push(`    ${roleColor(p.role)} ${chalk.dim(p.file)}:${p.line} ${p.symbol}`)
        }
      }
    }
    if (!verbose && result.threads.length > 12) {
      lines.push(chalk.dim(`  ... and ${result.threads.length - 12} more`))
    }
  }
  lines.push('')

  if (result.tangles.length > 0) {
    lines.push(chalk.bold('🕸️ Tangles'))
    const display = verbose ? result.tangles : result.tangles.slice(0, 6)
    for (const tg of display) {
      lines.push(`  ${tangleSeverityColor(tg.severity)} ${tg.type} ${chalk.dim(tg.location)}: ${tg.description}`)
    }
    lines.push('')
  }

  if (result.spools.length > 0) {
    lines.push(chalk.bold('🧶 Spools'))
    const hubs = result.spools.filter(s => s.isSpoolHub)
    const dead = result.spools.filter(s => s.isDeadEnd)
    if (hubs.length > 0) {
      lines.push(`  Hubs: ${hubs.map(s => chalk.bold(s.file)).join(', ')}`)
    }
    if (dead.length > 0) {
      lines.push(`  Dead ends: ${dead.map(s => chalk.red(s.file)).join(', ')}`)
    }
    if (hubs.length === 0 && dead.length === 0) {
      lines.push(chalk.dim('  No significant spool patterns'))
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
 * Format tapestry thread result as JSON
 * @example
 * formatTapestryThreadJson(result) // string
 */
export function formatTapestryThreadJson(result: TapestryThreadResult): string {
  return JSON.stringify(result, null, 2)
}
