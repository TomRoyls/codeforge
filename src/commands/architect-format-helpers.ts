import chalk from 'chalk'
import type { ArchitectResult, Blueprint, FloorPlan, ArchitectStats, StructuralIssue } from './architect-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function gradeColor(g: string): string {
  if (g === 'masterwork') return chalk.green(g)
  if (g === 'sound') return chalk.blue(g)
  if (g === 'adequate') return chalk.cyan(g)
  if (g === 'substandard') return chalk.yellow(g)
  return chalk.red(g)
}

function structureColor(s: string): string {
  if (s === 'foundation') return chalk.green(s)
  if (s === 'load-bearing') return chalk.blue(s)
  if (s === 'wall') return chalk.cyan(s)
  if (s === 'facade') return chalk.magenta(s)
  if (s === 'partition') return chalk.yellow(s)
  return chalk.dim(s)
}

function severityColor(s: string): string {
  if (s === 'critical') return chalk.red(s)
  if (s === 'structural') return chalk.rgb(255, 100, 0)(s)
  if (s === 'major') return chalk.yellow(s)
  if (s === 'minor') return chalk.cyan(s)
  return chalk.dim(s)
}

function buildingCodeColor(c: string): string {
  if (c === 'passing') return chalk.green(c)
  if (c === 'minor-violations') return chalk.yellow(c)
  if (c === 'major-violations') return chalk.rgb(255, 100, 0)(c)
  return chalk.red(c)
}

function overallGradeColor(g: string): string {
  if (g === 'skyscraper') return chalk.green(g)
  if (g === 'office-building') return chalk.blue(g)
  if (g === 'house') return chalk.cyan(g)
  if (g === 'shed') return chalk.yellow(g)
  return chalk.red(g)
}

function layoutColor(l: string): string {
  if (l === 'organized') return chalk.green(l)
  if (l === 'semi-organized') return chalk.blue(l)
  if (l === 'ad-hoc') return chalk.yellow(l)
  return chalk.red(l)
}

// ─── Blueprint Formatting ──────────────────────────────────────────────────────

function formatBlueprints(blueprints: Blueprint[], verbose: boolean): string {
  if (blueprints.length === 0) return chalk.dim('  No blueprints to display.')
  const display = verbose ? blueprints : blueprints.slice(0, 10)
  return display.map((b, i) => {
    const issueStr = b.issues.length > 0
      ? chalk.red(`  ⚠ ${b.issues.length} issue(s)`)
      : chalk.green('  ✓ No issues')
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(b.file)} ${structureColor(b.structure)} ${gradeColor(b.grade)}`,
      `     Floors:${b.floors} Rooms:${b.rooms} Doors:${b.doors} Windows:${b.windows}`,
      `     Struct:${scoreColor(b.structuralScore)} Found:${scoreColor(b.foundationQuality)} Walls:${scoreColor(b.wallIntegrity)}`,
      `     Plumb:${scoreColor(b.plumbing)} Electr:${scoreColor(b.electrical)} Curb:${scoreColor(b.curbAppeal)}`,
      issueStr,
    ].join('\n')
  }).join('\n\n')
}

// ─── Floor Plan Formatting ─────────────────────────────────────────────────────

function formatFloorPlans(floorPlans: FloorPlan[]): string {
  if (floorPlans.length === 0) return chalk.dim('  No floor plans to display.')
  return floorPlans.map(fp => {
    const issueStr = fp.issues.length > 0
      ? fp.issues.map(i => chalk.yellow(`    - ${i}`)).join('\n')
      : chalk.dim('    No issues')
    return [
      `  ${chalk.bold(fp.directory)} ${layoutColor(fp.layout)} (${fp.zoning})`,
      `     ${chalk.dim(fp.description)}`,
      `     Files: ${chalk.white(String(fp.files.length))}`,
      issueStr,
    ].join('\n')
  }).join('\n\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: ArchitectStats): string {
  return [
    `  Integrity: ${chalk.bold(scoreColor(stats.structuralIntegrity))}/100 | Grade: ${overallGradeColor(stats.overallGrade)} | Code: ${buildingCodeColor(stats.buildingCode)}`,
    `  Blueprints: ${chalk.white(String(stats.totalBlueprints))} (${chalk.green(String(stats.foundations))} foundations, ${chalk.blue(String(stats.loadBearing))} load-bearing, ${chalk.magenta(String(stats.facades))} facades)`,
    `  Avg Scores — Struct:${scoreColor(stats.avgStructuralScore)} Found:${scoreColor(stats.avgFoundationQuality)} Wall:${scoreColor(stats.avgWallIntegrity)}`,
    `                Plumb:${scoreColor(stats.avgPlumbing)} Electr:${scoreColor(stats.avgElectrical)} Curb:${scoreColor(stats.avgCurbAppeal)}`,
    `  Grades — ${chalk.green(`${stats.masterworkBlueprints} masterwork`)} | ${chalk.red(`${stats.condemnedBlueprints} condemned`)}`,
    `  Issues: ${chalk.white(String(stats.totalIssues))} (${chalk.red(`${stats.criticalIssues} critical`)}, ${chalk.rgb(255, 100, 0)(`${stats.structuralIssues} structural`)})`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format architect result as a table
 * @example
 * formatArchitectTable(result, false) // string
 */
export function formatArchitectTable(result: ArchitectResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏗️  Architect — Blueprint Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('📐 Blueprints'))
  lines.push(formatBlueprints(result.blueprints, verbose))
  lines.push('')
  lines.push(chalk.bold('🗂️  Floor Plans'))
  lines.push(formatFloorPlans(result.floorPlans))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('🔨 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format architect result as JSON
 * @example
 * formatArchitectJson(result) // string
 */
export function formatArchitectJson(result: ArchitectResult): string {
  return JSON.stringify(result, null, 2)
}
