import chalk from 'chalk'
import type { AlchemistFlask, Laboratory, Guild, AlchemyLabStats, AlchemyLabResult } from './alchemy-lab-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'philosopher-stone': return chalk.rgb(255, 215, 0)(c)
    case 'grand-elixir': return chalk.green(c)
    case 'potion-master': return chalk.blue(c)
    case 'apprentice': return chalk.cyan(c)
    case 'charlatan': return chalk.yellow(c)
    case 'explosion': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function labTypeColor(t: string): string {
  switch (t) {
    case 'ivory-tower': return chalk.rgb(255, 215, 0)(t)
    case 'research-lab': return chalk.green(t)
    case 'workshop': return chalk.blue(t)
    case 'apothecary': return chalk.cyan(t)
    case 'shed': return chalk.yellow(t)
    case 'ruins': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function labConditionColor(c: string): string {
  switch (c) {
    case 'nobel-prize': return chalk.rgb(255, 215, 0)(c)
    case 'peer-reviewed': return chalk.green(c)
    case 'experimental': return chalk.blue(c)
    case 'amateur': return chalk.cyan(c)
    case 'dangerous': return chalk.yellow(c)
    case 'condemned': return chalk.red(c)
    default: return c
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'grand-master': return chalk.rgb(255, 215, 0)(g)
    case 'master-alchemist': return chalk.green(g)
    case 'alchemist': return chalk.blue(g)
    case 'apprentice': return chalk.cyan(g)
    case 'novice': return chalk.yellow(g)
    case 'quack': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function elementColor(e: string): string {
  switch (e) {
    case 'earth': return chalk.rgb(139, 90, 43)(e)
    case 'water': return chalk.blue(e)
    case 'air': return chalk.cyan(e)
    case 'fire': return chalk.rgb(255, 69, 0)(e)
    case 'aether': return chalk.rgb(200, 162, 255)(e)
    case 'void': return chalk.dim(e)
    default: return e
  }
}

function transmutationColor(t: string): string {
  switch (t) {
    case 'purification': return chalk.rgb(255, 215, 0)(t)
    case 'transmutation': return chalk.green(t)
    case 'projection': return chalk.blue(t)
    case 'fermentation': return chalk.cyan(t)
    case 'putrefaction': return chalk.yellow(t)
    case 'chaos': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

// ─── Flask Formatting ─────────────────────────────────────────────────────────

function formatFlask(flask: AlchemistFlask, verbose: boolean): string {
  const line = ` ${conditionColor(flask.condition)} ${chalk.bold(flask.file)} ${elementColor(flask.element.primary)} tQ:${scoreColor(flask.transmutationQuality)} rH:${scoreColor(flask.reagentHandling)} cE:${scoreColor(flask.catalystEfficiency)} dP:${scoreColor(flask.distillationPurity)} cS:${scoreColor(flask.crucibleStrength)} pP:${scoreColor(flask.philosopherPotential)} score:${scoreColor(flask.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const t = flask.transmutation
  details.push(`    transmutation: ${transmutationColor(t.transmutationType)} purity:${scoreColor(t.purity)} pure:${t.isPure ? chalk.green('Y') : chalk.red('N')} sideEffects:${t.hasSideEffects ? chalk.red('Y') : chalk.green('N')} impurities:${t.hasImpurities ? chalk.red('Y') : chalk.green('N')} ratio:${t.inputOutputRatio} byproducts:${t.hasByproducts ? chalk.yellow(t.byproductCount) : 0}`)
  const r = flask.reagents
  details.push(`    reagents: count:${r.count} validated:${r.isValidated ? chalk.green('Y') : chalk.red('N')} catalysts:${r.hasCatalysts ? chalk.green('Y') : chalk.red('N')} poisons:${r.hasPoisons ? chalk.red('Y') : chalk.green('N')} stabilizers:${r.hasStabilizers ? chalk.green('Y') : chalk.red('N')} reactive:${r.hasReactive ? chalk.green('Y') : chalk.red('N')} handling:${scoreColor(r.handlingScore)}`)
  const cr = flask.crucible
  details.push(`    crucible: fired:${cr.isFired ? chalk.green('Y') : chalk.red('N')} temp:${scoreColor(cr.temperature)} cracks:${cr.hasCracks ? chalk.red(String(cr.crackCount)) : 0} leaks:${cr.hasLeaks ? chalk.red(String(cr.leakCount)) : 0} shatterproof:${cr.isShatterproof ? chalk.green('Y') : chalk.red('N')}`)
  const a = flask.alembic
  details.push(`    alembic: stages:${a.distillationStages} clean:${a.hasCleanSeparation ? chalk.green('Y') : chalk.red('N')} contamination:${a.hasContamination ? chalk.red('Y') : chalk.green('N')} residue:${a.hasResidue ? chalk.yellow(String(a.residueCount)) : 0} purity:${scoreColor(a.purity)}`)
  const ca = flask.catalyst
  details.push(`    catalyst: count:${ca.count} efficiency:${scoreColor(ca.efficiency)} proper:${ca.hasProperCatalysts ? chalk.green('Y') : chalk.red('N')} failed:${ca.hasFailedCatalysts ? chalk.red(String(ca.failedCount)) : 0} inert:${ca.hasInertCatalysts ? chalk.yellow(String(ca.inertCount)) : 0}`)
  const p = flask.philosopher
  details.push(`    philosopher: elegance:${scoreColor(p.elegance)} elixir:${p.hasElixir ? chalk.rgb(255, 215, 0)('Y') : chalk.red('N')} gold:${p.hasGold ? chalk.rgb(255, 215, 0)('Y') : chalk.red('N')} lead:${p.hasLead ? chalk.red('Y') : chalk.green('N')} enlightened:${p.isEnlightened ? chalk.green('Y') : chalk.red('N')} homunculus:${p.hasHomunculus ? chalk.red('Y') : chalk.green('N')}`)
  const el = flask.element
  details.push(`    element: ${elementColor(el.primary)}(${el.secondary}) balance:${scoreColor(el.balance)} balanced:${el.isBalanced ? chalk.green('Y') : chalk.red('N')} dominant:${el.isDominant ? chalk.yellow('Y') : chalk.green('N')}`)
  return details.join('\n')
}

// ─── Laboratory Formatting ────────────────────────────────────────────────────

function formatLaboratory(lab: Laboratory): string {
  return `  ${chalk.bold(lab.directory)} ${labTypeColor(lab.labType)} ${labConditionColor(lab.condition)} flasks:${lab.flasks.length} tQ:${scoreColor(lab.avgTransmutation)} dP:${scoreColor(lab.avgDistillationPurity)} cS:${scoreColor(lab.avgCrucibleStrength)} stones:${lab.philosopherStoneCount} explosions:${lab.explosionCount} pure:${lab.pureFunctionCount} sideFx:${lab.sideEffectCount}`
}

// ─── Guild Formatting ─────────────────────────────────────────────────────────

function formatGuild(guild: Guild): string {
  return `  tQ:${scoreColor(guild.avgTransmutation)} dP:${scoreColor(guild.avgPurity)} cS:${scoreColor(guild.avgCrucibleStrength)} pP:${scoreColor(guild.avgPhilosopherPotential)} elixir:${guild.hasElixir ? chalk.rgb(255, 215, 0)('YES') : chalk.red('NO')} mastery:${scoreColor(guild.overallMastery)}`
}

// ─── Statistics Formatting ────────────────────────────────────────────────────

function formatStats(s: AlchemyLabStats): string[] {
  const lines: string[] = []
  lines.push(`  Grade: ${gradeColor(s.alchemistGrade)} | Mastery: ${scoreColor(s.overallMastery)} | Files: ${s.totalFiles} | Labs: ${s.totalLabs}`)
  lines.push(`  Stone:${s.philosopherStoneCount} Elixir:${s.grandElixirCount} Potion:${s.potionMasterCount} Apprent:${s.apprenticeCount} Charlatan:${s.charlatanCount} Explosion:${s.explosionCount}`)
  lines.push(`  Pure:${s.pureFunctionCount} SideFx:${s.sideEffectCount} Impure:${s.impurityCount} Byproduct:${s.hasByproductCount} | Cracks:${s.hasCracksCount} Leaks:${s.hasLeaksCount} Contam:${s.hasContaminationCount}`)
  lines.push(`  Gold:${s.hasGoldCount} Lead:${s.hasLeadCount} Elixir:${s.hasElixirCount} | Earth:${s.earthCount} Water:${s.waterCount} Air:${s.airCount} Fire:${s.fireCount} Aether:${s.aetherCount} Void:${s.voidCount}`)
  lines.push(`  Best:${chalk.green(s.bestTransmutation)} | Purest:${chalk.blue(s.purest)} | Strongest:${chalk.cyan(s.strongestCrucible)} | Elegant:${chalk.magenta(s.mostElegant)} | Explosive:${chalk.red(s.mostExplosive)}`)
  return lines
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format alchemy lab result as a table
 * @example
 * formatAlchemyLabTable(result, false) // string
 */
export function formatAlchemyLabTable(result: AlchemyLabResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⚗️  Alchemy Lab - Code Transformation/Purity Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🧪 Flasks'))
  if (result.flasks.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.flasks : result.flasks.slice(0, 15)
    for (const flask of display) {
      lines.push(formatFlask(flask, verbose))
    }
    if (!verbose && result.flasks.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.flasks.length - 15} more`))
    }
  }
  lines.push('')

  if (result.labs.length > 0) {
    lines.push(chalk.bold('🔬 Laboratories'))
    for (const lab of result.labs) {
      lines.push(formatLaboratory(lab))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🏛️ Guild'))
  lines.push(formatGuild(result.guild))
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  for (const line of formatStats(result.stats)) {
    lines.push(line)
  }

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

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format alchemy lab result as JSON
 * @example
 * formatAlchemyLabJson(result) // string
 */
export function formatAlchemyLabJson(result: AlchemyLabResult): string {
  return JSON.stringify(result, null, 2)
}
