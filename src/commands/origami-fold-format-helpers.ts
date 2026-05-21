import chalk from 'chalk'
import type { OrigamiSheet, OrigamiBox, OrigamiFoldResult } from './origami-fold-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'masterwork': return chalk.rgb(255, 215, 0)(c)
    case 'expert': return chalk.green(c)
    case 'skilled': return chalk.blue(c)
    case 'apprentice': return chalk.yellow(c)
    case 'beginner': return chalk.rgb(255, 165, 0)(c)
    case 'crumpled': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function boxColor(b: string): string {
  switch (b) {
    case 'display-case': return chalk.rgb(255, 215, 0)(b)
    case 'jewelry-box': return chalk.green(b)
    case 'storage-box': return chalk.blue(b)
    case 'cardboard': return chalk.yellow(b)
    case 'crumpled-paper': return chalk.rgb(255, 165, 0)(b)
    case 'confetti': return chalk.red(b)
    default: return chalk.dim(b)
  }
}

function boxConditionColor(c: string): string {
  switch (c) {
    case 'gallery-quality': return chalk.rgb(255, 215, 0)(c)
    case 'well-crafted': return chalk.green(c)
    case 'serviceable': return chalk.blue(c)
    case 'rough': return chalk.yellow(c)
    case 'messy': return chalk.rgb(255, 165, 0)(c)
    case 'torn-apart': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'grand-master': return chalk.rgb(255, 215, 0)(g)
    case 'master': return chalk.green(g)
    case 'artisan': return chalk.blue(g)
    case 'folder': return chalk.cyan(g)
    case 'beginner': return chalk.yellow(g)
    case 'paper-shredder': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Sheet Formatting ────────────────────────────────────────────────────────

function formatSheet(s: OrigamiSheet, verbose: boolean): string {
  const line = ` ${conditionColor(s.condition)} ${chalk.bold(s.file)} fold:${scoreColor(s.foldPrecision)} crease:${scoreColor(s.creaseSharpness)} economy:${scoreColor(s.paperEconomy)} integrity:${scoreColor(s.structuralIntegrity)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    folds:${s.folds.count} depth:${s.folds.depth} valley:${s.folds.hasValleyFold ? chalk.green('Y') : chalk.red('N')} mountain:${s.folds.hasMountainFold ? chalk.green('Y') : chalk.red('N')} petal:${s.folds.hasPetalFold ? chalk.green('Y') : chalk.red('N')} squash:${s.folds.hasSquashFold ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    crease: sharp:${scoreColor(s.creases.sharpness)} clean:${s.creases.isClean ? chalk.green('Y') : chalk.red('N')} tears:${s.creases.tearCount} wrinkles:${s.creases.wrinkleCount}`)
  details.push(`    paper: area:${s.paper.area} thick:${s.paper.thickness} used:${s.paper.isUsed}% waste:${scoreColor(s.paper.waste)} economical:${s.paper.isEconomical ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    structure: base:${s.structure.baseType} stable:${scoreColor(s.structure.stability)} balanced:${s.structure.isBalanced ? chalk.green('Y') : chalk.red('N')} wings:${s.structure.hasWings ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    pattern: ${s.creasePattern.patternType} symmetric:${s.creasePattern.isSymmetric ? chalk.green('Y') : chalk.red('N')} elegant:${scoreColor(s.creasePattern.elegance)} master:${s.creasePattern.hasMasterCrease ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    model: recognizable:${s.model.recognizable ? chalk.green('Y') : chalk.red('N')} detail:${scoreColor(s.model.detail)} complete:${s.model.isComplete ? chalk.green('Y') : chalk.red('N')} display:${s.model.isDisplay ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Box Formatting ──────────────────────────────────────────────────────────

function formatBox(b: OrigamiBox): string {
  return `  ${chalk.bold(b.directory)} ${boxColor(b.boxType)} ${boxConditionColor(b.condition)} fold:${scoreColor(b.avgFoldPrecision)} crease:${scoreColor(b.avgCreaseSharpness)} economy:${scoreColor(b.avgPaperEconomy)} integrity:${scoreColor(b.avgStructuralIntegrity)} master:${b.masterworkCount} crumpled:${b.crumpledCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format origami fold result as a table
 * @example
 * formatOrigamiFoldTable(result, false) // string
 */
export function formatOrigamiFoldTable(result: OrigamiFoldResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🦢  Origami Fold - Abstraction/Folding Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📄 Origami Sheets'))
  if (result.sheets.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.sheets : result.sheets.slice(0, 15)
    for (const s of display) {
      lines.push(formatSheet(s, verbose))
    }
    if (!verbose && result.sheets.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.sheets.length - 15} more`))
    }
  }
  lines.push('')

  if (result.boxes.length > 0) {
    lines.push(chalk.bold('📦 Origami Boxes'))
    for (const b of result.boxes) {
      lines.push(formatBox(b))
    }
    lines.push('')
  }

  const st = result.studio
  lines.push(chalk.bold('🏭 Studio Overview'))
  lines.push(`  FoldPrecision:${scoreColor(st.avgFoldPrecision)} CreaseSharpness:${scoreColor(st.avgCreaseSharpness)} PaperEconomy:${scoreColor(st.avgPaperEconomy)} Integrity:${scoreColor(st.avgStructuralIntegrity)} Clean:${st.isClean ? chalk.green('YES') : chalk.red('NO')} Craftsmanship:${scoreColor(st.overallCraftsmanship)}`)
  lines.push(`  TotalFolds:${st.totalFolds} TotalTears:${st.totalTears}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.origamiGrade)} | Craftsmanship: ${scoreColor(s.overallCraftsmanship)} | Files: ${s.totalFiles} | Boxes: ${s.totalBoxes}`)
  lines.push(`  Masterwork:${s.masterworkCount} Expert:${s.expertCount} Skilled:${s.skilledCount} Apprentice:${s.apprenticeCount} Beginner:${s.beginnerCount} Crumpled:${s.crumpledCount}`)
  lines.push(`  Valley:${s.valleyFolds} Mountain:${s.mountainFolds} Squash:${s.squashFolds} Petal:${s.petalFolds} Tears:${s.totalTears} Wrinkles:${s.totalWrinkles}`)
  lines.push(`  Economical:${s.economicalFiles} Wasteful:${s.wastefulFiles} Symmetric:${s.symmetricPatterns} CrumpledPatterns:${s.crumpledPatterns}`)
  lines.push(`  BestFolded:${chalk.green(s.bestFolded)} | WorstFolded:${chalk.red(s.worstFolded)} | MostEconomical:${chalk.cyan(s.mostEconomical)}`)
  lines.push(`  MostElegant:${chalk.blue(s.mostElegant)} | MostTorn:${chalk.rgb(255, 69, 0)(s.mostTorn)}`)

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
 * Format origami fold result as JSON
 * @example
 * formatOrigamiFoldJson(result) // string
 */
export function formatOrigamiFoldJson(result: OrigamiFoldResult): string {
  return JSON.stringify(result, null, 2)
}
