import chalk from 'chalk'
import type { RosettaStoneResult, Inscription, StoneTablet } from './rosetta-stone-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'well-preserved': return chalk.green(c)
    case 'legible': return chalk.blue(c)
    case 'weathered': return chalk.yellow(c)
    case 'fragmentary': return chalk.rgb(255, 165, 0)(c)
    case 'eroded': return chalk.red(c)
    case 'lost': return chalk.dim(c)
    default: return chalk.dim(c)
  }
}

function inscriptionTypeColor(t: string): string {
  switch (t) {
    case 'decree': return chalk.rgb(255, 215, 0)(t)
    case 'law': return chalk.red(t)
    case 'prayer': return chalk.magenta(t)
    case 'record': return chalk.blue(t)
    case 'letter': return chalk.cyan(t)
    case 'graffiti': return chalk.rgb(255, 165, 0)(t)
    case 'doodle': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function readingLevelColor(l: string): string {
  switch (l) {
    case 'scholar': return chalk.rgb(255, 215, 0)(l)
    case 'literate': return chalk.green(l)
    case 'basic': return chalk.blue(l)
    case 'cryptic': return chalk.rgb(255, 165, 0)(l)
    case 'unknown': return chalk.red(l)
    default: return chalk.dim(l)
  }
}

function tabletCondColor(c: string): string {
  switch (c) {
    case 'library': return chalk.rgb(255, 215, 0)(c)
    case 'museum': return chalk.green(c)
    case 'archive': return chalk.blue(c)
    case 'field': return chalk.yellow(c)
    case 'ruins': return chalk.rgb(255, 165, 0)(c)
    case 'lost': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-linguist': return chalk.rgb(255, 215, 0)(g)
    case 'polyglot': return chalk.green(g)
    case 'translator': return chalk.blue(g)
    case 'reader': return chalk.yellow(g)
    case 'illiterate': return chalk.rgb(255, 165, 0)(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function difficultyColor(d: string): string {
  switch (d) {
    case 'trivial': return chalk.green(d)
    case 'easy': return chalk.blue(d)
    case 'moderate': return chalk.yellow(d)
    case 'difficult': return chalk.rgb(255, 165, 0)(d)
    case 'obscure': return chalk.red(d)
    case 'undecipherable': return chalk.rgb(139, 0, 0)(d)
    default: return chalk.dim(d)
  }
}

// ─── Inscription Formatting ──────────────────────────────────────────────────

function formatInscription(ins: Inscription, verbose: boolean): string {
  const line = ` ${conditionColor(ins.condition)} ${inscriptionTypeColor(ins.inscriptionType)} ${chalk.bold(ins.file)} quality:${scoreColor(ins.qualityScore)} trans:${scoreColor(ins.translatability)} deciph:${scoreColor(ins.decipherability)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    insc:${scoreColor(ins.inscriptionQuality)} pres:${scoreColor(ins.preservation)} glyph:${scoreColor(ins.glyphClarity)} script:${scoreColor(ins.scriptConsistency)} reading:${readingLevelColor(ins.reading.readingLevel)} diff:${difficultyColor(ins.translation.translationDifficulty)}`)
  return details.join('\n')
}

// ─── Tablet Formatting ───────────────────────────────────────────────────────

function formatTablet(tablet: StoneTablet, verbose: boolean): string {
  const line = `  ${chalk.bold(tablet.directory)} ${tabletCondColor(tablet.condition)} dom:${chalk.cyan(tablet.dominantScript)} quality:${scoreColor(tablet.tabletQuality)} insc:${tablet.inscriptions.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    trans:${scoreColor(tablet.avgTranslatability)} glyph:${scoreColor(tablet.avgGlyphClarity)} deciph:${scoreColor(tablet.avgDecipherability)} multi:${tablet.multilingualCount} self-doc:${tablet.selfDocumentingCount} cryptic:${tablet.crypticCount} reading:${readingLevelColor(tablet.avgReadingLevel)}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format rosetta stone result as a table
 * @example
 * formatRosettaStoneTable(result, false) // string
 */
export function formatRosettaStoneTable(result: RosettaStoneResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏺 Rosetta Stone - Readability and Translation Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📜 Inscriptions'))
  if (result.inscriptions.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.inscriptions : result.inscriptions.slice(0, 15)
    for (const ins of display) {
      lines.push(formatInscription(ins, verbose))
    }
    if (!verbose && result.inscriptions.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.inscriptions.length - 15} more`))
    }
  }
  lines.push('')

  if (result.tablets.length > 0) {
    lines.push(chalk.bold('🪨 Stone Tablets'))
    for (const t of result.tablets) {
      lines.push(formatTablet(t, verbose))
    }
    lines.push('')
  }

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.translatorGrade)} | Readability: ${scoreColor(s.overallReadability)} | Files: ${s.totalFiles} | Tablets: ${s.totalTablets}`)
  lines.push(`  Trans:${scoreColor(s.avgTranslatability)} Insc:${scoreColor(s.avgInscriptionQuality)} Pres:${scoreColor(s.avgPreservation)} Glyph:${scoreColor(s.avgGlyphClarity)} Script:${scoreColor(s.avgScriptConsistency)} Deciph:${scoreColor(s.avgDecipherability)}`)
  lines.push(`  Multi:${s.multilingualFiles} SelfDoc:${s.selfDocumentingFiles} Cryptic:${s.crypticFiles} Scholar:${s.scholarLevel} Pristine:${s.pristineCount} Eroded:${s.erodedCount} Lost:${s.lostCount}`)
  lines.push(`  ClearGlyphs:${s.totalClearGlyphs} Ambiguous:${s.totalAmbiguousGlyphs} Obscure:${s.totalObscureGlyphs}`)
  lines.push(`  Best: ${chalk.green(s.mostReadable)} | Worst: ${chalk.red(s.leastReadable)} | Preserved: ${chalk.green(s.bestPreserved)} | Cryptic: ${chalk.rgb(255, 165, 0)(s.mostCryptic)}`)

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
 * Format rosetta stone result as JSON
 * @example
 * formatRosettaStoneJson(result) // string
 */
export function formatRosettaStoneJson(result: RosettaStoneResult): string {
  return JSON.stringify(result, null, 2)
}
