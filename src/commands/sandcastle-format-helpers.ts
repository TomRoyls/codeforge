import chalk from 'chalk'
import type { SandcastleResult, SandTower, SandFortress } from './sandcastle-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function grainColor(g: string): string {
  switch (g) {
    case 'fine': return chalk.rgb(255, 215, 0)(g)
    case 'medium': return chalk.green(g)
    case 'coarse': return chalk.yellow(g)
    case 'mixed': return chalk.rgb(255, 165, 0)(g)
    case 'muddy': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'majestic': return chalk.rgb(255, 215, 0)(c)
    case 'impressive': return chalk.green(c)
    case 'solid': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'crumbling': return chalk.rgb(255, 165, 0)(c)
    case 'ruins': return chalk.red(c)
    case 'washed-away': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function riskColor(r: string): string {
  switch (r) {
    case 'none': return chalk.green(r)
    case 'minimal': return chalk.blue(r)
    case 'low': return chalk.cyan(r)
    case 'moderate': return chalk.yellow(r)
    case 'high': return chalk.rgb(255, 165, 0)(r)
    case 'imminent': return chalk.red(r)
    case 'collapsed': return chalk.rgb(139, 0, 0)(r)
    default: return chalk.dim(r)
  }
}

function defenseColor(d: string): string {
  switch (d) {
    case 'fortress': return chalk.rgb(255, 215, 0)(d)
    case 'castle': return chalk.green(d)
    case 'keep': return chalk.blue(d)
    case 'wall': return chalk.yellow(d)
    case 'fence': return chalk.rgb(255, 165, 0)(d)
    case 'none': return chalk.red(d)
    default: return chalk.dim(d)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-builder': return chalk.rgb(255, 215, 0)(g)
    case 'architect': return chalk.green(g)
    case 'mason': return chalk.blue(g)
    case 'apprentice': return chalk.yellow(g)
    case 'child': return chalk.rgb(255, 165, 0)(g)
    case 'toddler': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function fortressCondColor(c: string): string {
  switch (c) {
    case 'grand': return chalk.rgb(255, 215, 0)(c)
    case 'sturdy': return chalk.green(c)
    case 'standing': return chalk.blue(c)
    case 'weathering': return chalk.yellow(c)
    case 'crumbling': return chalk.rgb(255, 165, 0)(c)
    case 'ruins': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

// ─── Tower Formatting ────────────────────────────────────────────────────────

function formatTower(t: SandTower, verbose: boolean): string {
  const line = ` ${conditionColor(t.condition)} ${chalk.bold(t.file)} ${grainColor(t.sandGrain)} ${t.moisture} ${riskColor(t.collapseRisk)} sand:${scoreColor(t.sandQuality)} integrity:${scoreColor(t.structuralIntegrity)} tide:${scoreColor(t.tideResistance)} q:${scoreColor(t.qualityScore)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    wind:${scoreColor(t.windResistance)} foundation:${scoreColor(t.foundationDepth)} h:${t.towerHeight} w:${t.towerWidth} type:${t.towerType} arch:${t.architecture}`)
  if (t.vulnerabilities.length > 0) details.push(`    vulns: ${t.vulnerabilities.slice(0, 3).join('; ')}`)
  return details.join('\n')
}

// ─── Fortress Formatting ─────────────────────────────────────────────────────

function formatFortress(f: SandFortress, verbose: boolean): string {
  const line = `  ${chalk.bold(f.directory)} ${defenseColor(f.defenseLevel)} ${fortressCondColor(f.condition)} health:${scoreColor(f.fortressHealth)} integrity:${scoreColor(f.avgIntegrity)} majestic:${f.majesticCount} crumbling:${f.crumblingCount}`

  if (!verbose) return line
  const details = [line]
  details.push(`    arch:${f.dominantArchitecture} type:${f.dominantTowerType} vulns:${f.totalVulnerabilities} strengths:${f.totalStrengths} defensible:${f.isDefensible ? chalk.green('yes') : chalk.red('no')}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format sandcastle result as a table
 * @example
 * formatSandcastleTable(result, false) // string
 */
export function formatSandcastleTable(result: SandcastleResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏖️ Sandcastle - Structural Fragility Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🏰 Sand Towers'))
  if (result.towers.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.towers : result.towers.slice(0, 15)
    for (const t of display) {
      lines.push(formatTower(t, verbose))
    }
    if (!verbose && result.towers.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.towers.length - 15} more`))
    }
  }
  lines.push('')

  if (result.fortresses.length > 0) {
    lines.push(chalk.bold('🏯 Fortresses'))
    for (const f of result.fortresses) {
      lines.push(formatFortress(f, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🌊 Shoreline'))
  const sl = result.shoreline
  lines.push(`  Tide: ${scoreColor(sl.tideLevel)} | Wind: ${scoreColor(sl.windSpeed)} | Storm: ${sl.stormWarning ? chalk.red('warning') : chalk.green('clear')} | Safe: ${sl.isSafeFromTide ? chalk.green('yes') : chalk.red('no')} | Resistant: ${sl.isStormResistant ? chalk.green('yes') : chalk.red('no')}`)
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${gradeColor(s.architectGrade)} | Health: ${scoreColor(s.overallStructuralHealth)} | Majestic: ${chalk.rgb(255, 215, 0)(String(s.majesticTowers))} | Crumbling: ${chalk.yellow(String(s.crumblingTowers))} | Collapsed: ${chalk.red(String(s.collapsedTowers))}`)
  lines.push(`  Strongest: ${chalk.green(s.strongestTower)} | Weakest: ${chalk.red(s.weakestTower)} | Deepest: ${chalk.blue(s.deepestFoundation)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format sandcastle result as JSON
 * @example
 * formatSandcastleJson(result) // string
 */
export function formatSandcastleJson(result: SandcastleResult): string {
  return JSON.stringify(result, null, 2)
}
