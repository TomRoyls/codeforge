import chalk from 'chalk'
import type { BonsaiTrimResult, BonsaiBranch, BonsaiTree, BonsaiTrimStats } from './bonsai-trim-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function styleColor(s: string): string {
  switch (s) {
    case 'formal-upright': return chalk.rgb(34, 139, 34)(s)
    case 'informal-upright': return chalk.rgb(0, 128, 0)(s)
    case 'slanting': return chalk.rgb(107, 142, 35)(s)
    case 'cascade': return chalk.rgb(85, 107, 47)(s)
    case 'semi-cascade': return chalk.rgb(60, 179, 113)(s)
    case 'literati': return chalk.rgb(46, 139, 87)(s)
    case 'broom': return chalk.rgb(50, 205, 50)(s)
    case 'forest': return chalk.rgb(0, 100, 0)(s)
    default: return chalk.dim(s)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'thriving': return chalk.rgb(0, 200, 0)(h)
    case 'healthy': return chalk.green(h)
    case 'fair': return chalk.yellow(h)
    case 'stressed': return chalk.rgb(255, 165, 0)(h)
    case 'diseased': return chalk.red(h)
    case 'dead': return chalk.rgb(139, 0, 0)(h)
    default: return chalk.dim(h)
  }
}

function condColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(255, 215, 0)(c)
    case 'well-tended': return chalk.green(c)
    case 'needs-trimming': return chalk.yellow(c)
    case 'overgrown': return chalk.rgb(255, 165, 0)(c)
    case 'wild': return chalk.red(c)
    case 'deadwood': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-gardener': return chalk.rgb(255, 215, 0)(g)
    case 'skilled': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'neglectful': return chalk.yellow(g)
    case 'absent': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function treeCondColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(255, 215, 0)(c)
    case 'well-tended': return chalk.green(c)
    case 'needs-work': return chalk.yellow(c)
    case 'overgrown': return chalk.rgb(255, 165, 0)(c)
    case 'wild-growth': return chalk.red(c)
    case 'clear-cut': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

// ─── Branch Formatting ──────────────────────────────────────────────────────

function formatBranch(b: BonsaiBranch, verbose: boolean): string {
  const markers: string[] = []
  if (b.canPrune) markers.push(chalk.yellow('PR'))
  if (b.condition === 'masterpiece') markers.push(chalk.rgb(255, 215, 0)('MP'))
  if (b.foliage.deadLeaves > 0) markers.push(chalk.red('DL'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(b.file)} ${styleColor(b.style)} ${healthColor(b.health)} ${condColor(b.condition)} den:${scoreColor(b.density)} health:${scoreColor(b.branchHealth)} qual:${scoreColor(b.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    fol: total:${b.foliage.totalLeaves} dead:${b.foliage.deadLeaves} yellow:${b.foliage.yellowLeaves} green:${b.foliage.greenLeaves} brown:${b.foliage.brownLeaves} over:${b.foliage.overgrownAreas}`)
  details.push(`    struct: trunk:${scoreColor(b.structure.trunkStrength)} angle:${b.structure.branchAngle} canopy:${scoreColor(b.structure.canopyBalance)} root:${scoreColor(b.structure.rootDepth)} grafts:${b.structure.graftingPoints}`)
  details.push(`    aesthetic: simp:${scoreColor(b.aesthetic.simplicity)} eleg:${scoreColor(b.aesthetic.elegance)} prop:${scoreColor(b.aesthetic.proportion)} harm:${scoreColor(b.aesthetic.harmony)}`)
  if (b.pruningTargets.length > 0) {
    details.push(`    pruning: ${b.pruningTargets.slice(0, 5).map(t => `${t.type}(${t.impact})`).join(', ')}${b.pruningTargets.length > 5 ? ` +${b.pruningTargets.length - 5} more` : ''}`)
  }
  return details.join('\n')
}

// ─── Tree Formatting ────────────────────────────────────────────────────────

function formatTree(t: BonsaiTree, verbose: boolean): string {
  const line = `  ${chalk.bold(t.directory)} ${treeCondColor(t.condition)} branches:${t.branches.length} health:${scoreColor(t.avgHealth)} aest:${scoreColor(t.overallAesthetic)} style:${t.dominantStyle} ${t.attentionLevel}`

  if (!verbose) return line
  const details = [line]
  details.push(`    density:${scoreColor(t.avgDensity)} targets:${t.totalPruningTargets} critical:${t.criticalTargets} dead:${t.deadLeaves} overgrown:${t.overgrownAreas}`)
  details.push(`    trunk:${scoreColor(t.trunkStrength)} canopy:${scoreColor(t.canopyBalance)} root:${scoreColor(t.rootDepth)} balanced:${t.isBalanced} mature:${t.dominantMaturity}`)
  details.push(`    masterpiece:${t.masterpieceCount} overgrown:${t.overgrownCount} deadwood:${t.deadwoodCount}`)
  return details.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────────────────────────

function formatStats(stats: BonsaiTrimStats): string {
  return [
    `  Files: ${stats.totalFiles} | Trees: ${stats.totalTrees} | Density: ${scoreColor(stats.avgDensity)} | Health: ${scoreColor(stats.avgHealth)} | Aesthetic: ${scoreColor(stats.overallAesthetic)}`,
    `  Simplicity: ${scoreColor(stats.avgSimplicity)} | Elegance: ${scoreColor(stats.avgElegance)} | Proportion: ${scoreColor(stats.avgProportion)} | Harmony: ${scoreColor(stats.avgHarmony)}`,
    `  Trunk: ${scoreColor(stats.avgTrunkStrength)} | Canopy: ${scoreColor(stats.avgCanopyBalance)} | Targets: ${stats.totalPruningTargets} | Dead: ${chalk.red(String(stats.deadBranchTargets))} | Sucker: ${chalk.yellow(String(stats.suckerTargets))}`,
    `  Masterpieces: ${chalk.rgb(255, 215, 0)(String(stats.masterpieces))} | Overgrown: ${chalk.rgb(255, 165, 0)(String(stats.overgrown))} | Deadwood: ${chalk.red(String(stats.deadwood))} | Easy: ${chalk.green(String(stats.easyPrunes))} | Hard: ${chalk.red(String(stats.difficultPrunes))}`,
    `  Grade: ${gradeColor(stats.gardenerGrade)} | Best: ${chalk.green(stats.bestBranch)} | Worst: ${chalk.red(stats.worstBranch)}`,
    `  Most Pruning: ${chalk.yellow(stats.mostPruningNeeded)} | Most Elegant: ${chalk.cyan(stats.mostElegant)}`,
  ].join('\n')
}

// ─── Table Formatter ────────────────────────────────────────────────────────

/**
 * Format bonsai trim result as a table
 * @example
 * formatBonsaiTrimTable(result, false) // string
 */
export function formatBonsaiTrimTable(result: BonsaiTrimResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌳 Bonsai Trim - Code Pruning Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌿 Branches'))
  if (result.branches.length === 0) {
    lines.push(chalk.dim('  No branches detected.'))
  } else {
    const display = verbose ? result.branches : result.branches.slice(0, 15)
    for (const b of display) {
      lines.push(formatBranch(b, verbose))
    }
    if (!verbose && result.branches.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.branches.length - 15} more`))
    }
  }
  lines.push('')

  if (result.trees.length > 0) {
    lines.push(chalk.bold('🌲 Trees'))
    for (const t of result.trees) {
      lines.push(formatTree(t, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('✂️ Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ─────────────────────────────────────────────────────────

/**
 * Format bonsai trim result as JSON
 * @example
 * formatBonsaiTrimJson(result) // string
 */
export function formatBonsaiTrimJson(result: BonsaiTrimResult): string {
  return JSON.stringify(result, null, 2)
}
