import chalk from 'chalk'
import type { GlacierResult, IceZone, GlacierStats } from './glacier-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function zoneColor(z: string): string {
  if (z === 'permafrost') return chalk.cyan(z)
  if (z === 'glacial-ice') return chalk.blue(z)
  if (z === 'active-ice') return chalk.green(z)
  if (z === 'melt-zone') return chalk.yellow(z)
  if (z === 'crevasse') return chalk.magenta(z)
  return chalk.rgb(139, 90, 43)(z)
}

function classificationColor(c: string): string {
  if (c === 'bedrock') return chalk.cyan(c)
  if (c === 'deep-ice') return chalk.blue(c)
  if (c === 'surface-ice') return chalk.green(c)
  if (c === 'slush') return chalk.yellow(c)
  return chalk.red(c)
}

function healthColor(h: string): string {
  if (h === 'polar-cap') return chalk.cyan(h)
  if (h === 'alpine-glacier') return chalk.green(h)
  if (h === 'valley-glacier') return chalk.blue(h)
  if (h === 'ice-sheet') return chalk.yellow(h)
  if (h === 'retreating') return chalk.rgb(255, 165, 0)(h)
  return chalk.red(h)
}

function flowColor(f: string): string {
  if (f === 'steady') return chalk.green(f)
  if (f === 'seasonal') return chalk.yellow(f)
  if (f === 'surging') return chalk.red(f)
  return chalk.blue(f)
}

function dangerColor(s: string): string {
  if (s === 'critical') return chalk.red(s)
  if (s === 'high') return chalk.magenta(s)
  if (s === 'medium') return chalk.yellow(s)
  return chalk.dim(s)
}

function moraineColor(t: string): string {
  if (t === 'ground') return chalk.rgb(139, 90, 43)(t)
  if (t === 'terminal') return chalk.red(t)
  if (t === 'medial') return chalk.yellow(t)
  return chalk.blue(t)
}

// ─── Zone Formatting ───────────────────────────────────────────────────────

function formatZone(z: IceZone): string {
  const dangerMarker = z.hiddenDangers.length > 0 ? chalk.red(` [${z.hiddenDangers.length} dangers]`) : ''
  return `  ${chalk.bold(z.file)} ${zoneColor(z.zone)} stab:${scoreColor(z.stability)} temp:${scoreColor(z.temperature)} qual:${scoreColor(z.iceCoreQuality)} ${classificationColor(z.classification)}${dangerMarker}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: GlacierStats): string {
  return [
    `  Health: ${healthColor(stats.glacierHealth)} | Stability: ${scoreColor(stats.stabilityIndex)} | Frozen: ${scoreColor(stats.frozenRatio)}%`,
    `  Avg Stability: ${scoreColor(stats.avgStability)} | Avg Temp: ${scoreColor(stats.avgTemperature)} | Avg Quality: ${scoreColor(stats.avgIceCoreQuality)}`,
    `  Permafrost: ${chalk.cyan(String(stats.permafrostZones))} | Active: ${chalk.green(String(stats.activeIceZones))} | Melt: ${chalk.yellow(String(stats.meltZones))} | Crevasse: ${chalk.magenta(String(stats.crevasseZones))}`,
    `  Dangers: ${stats.totalHiddenDangers} (Critical: ${chalk.red(String(stats.criticalDangers))}) | Flows: ${stats.totalFlows} | Moraines: ${stats.totalMoraines}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format glacier result as a table
 * @example
 * formatGlacierTable(result, false) // string
 */
export function formatGlacierTable(result: GlacierResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧊 Glacier - Code Stability Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🏔️ Ice Zones'))
  if (result.zones.length === 0) {
    lines.push(chalk.dim('  No zones analyzed.'))
  } else {
    const display = verbose ? result.zones : result.zones.slice(0, 15)
    for (const z of display) {
      lines.push(formatZone(z))
      if (verbose && z.hiddenDangers.length > 0) {
        for (const d of z.hiddenDangers.slice(0, 3)) {
          lines.push(`    ${dangerColor(d.severity)} ${d.type}: ${chalk.dim(d.description)}`)
        }
      }
    }
    if (!verbose && result.zones.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.zones.length - 15} more`))
    }
  }
  lines.push('')

  if (result.flows.length > 0) {
    lines.push(chalk.bold('🌊 Glacier Flows'))
    const display = verbose ? result.flows : result.flows.slice(0, 10)
    for (const f of display) {
      lines.push(`  ${chalk.dim(f.from)} -> ${chalk.dim(f.to)} ${flowColor(f.flowType)} vol:${scoreColor(f.volume)}`)
    }
    lines.push('')
  }

  if (result.moraines.length > 0) {
    lines.push(chalk.bold('🪨 Moraines (Tech Debt)'))
    for (const m of result.moraines) {
      lines.push(`  ${chalk.cyan(m.area)} ${moraineColor(m.type)} items:${m.size} ${chalk.dim(m.description)}`)
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
 * Format glacier result as JSON
 * @example
 * formatGlacierJson(result) // string
 */
export function formatGlacierJson(result: GlacierResult): string {
  return JSON.stringify(result, null, 2)
}
