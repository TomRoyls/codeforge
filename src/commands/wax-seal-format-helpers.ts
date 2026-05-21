import chalk from 'chalk'
import type { WaxSealResult, SealMark, SealCollection, WaxSealStats } from './wax-seal-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function condColor(c: string): string {
  switch (c) {
    case 'intact': return chalk.green(c)
    case 'nearly-intact': return chalk.blue(c)
    case 'slightly-damaged': return chalk.yellow(c)
    case 'damaged': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    case 'missing': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'royal-seal': return chalk.rgb(255, 215, 0)(g)
    case 'guild-certified': return chalk.green(g)
    case 'merchant-approved': return chalk.blue(g)
    case 'common': return chalk.yellow(g)
    case 'suspect': return chalk.rgb(255, 165, 0)(g)
    case 'forgery': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function waxColor(w: string): string {
  switch (w) {
    case 'beeswax': return chalk.rgb(255, 200, 50)(w)
    case 'shellac': return chalk.rgb(200, 50, 0)(w)
    case 'paraffin': return chalk.white(w)
    case 'synthetic': return chalk.gray(w)
    case 'clay': return chalk.rgb(180, 120, 60)(w)
    case 'lead': return chalk.rgb(100, 100, 100)(w)
    default: return chalk.dim(w)
  }
}

function heraldColor(h: string): string {
  switch (h) {
    case 'royal-herald': return chalk.rgb(255, 215, 0)(h)
    case 'guild-master': return chalk.green(h)
    case 'notary': return chalk.blue(h)
    case 'scribe': return chalk.yellow(h)
    case 'forger': return chalk.rgb(255, 165, 0)(h)
    case 'illiterate': return chalk.red(h)
    default: return chalk.dim(h)
  }
}

function authColor(a: string): string {
  switch (a) {
    case 'royal-court': return chalk.rgb(255, 215, 0)(a)
    case 'guild-hall': return chalk.green(a)
    case 'marketplace': return chalk.blue(a)
    case 'back-alley': return chalk.yellow(a)
    case 'ruins': return chalk.red(a)
    default: return chalk.dim(a)
  }
}

// ─── Seal Formatting ────────────────────────────────────────────────────────

function formatSeal(s: SealMark, verbose: boolean): string {
  const markers: string[] = []
  if (s.grade === 'royal-seal') markers.push(chalk.rgb(255, 215, 0)('RS'))
  if (s.forgeries.isSuspect) markers.push(chalk.yellow('SP'))
  if (s.condition === 'broken') markers.push(chalk.red('BK'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(s.file)} ${waxColor(s.waxType)} ${gradeColor(s.grade)} ${condColor(s.condition)} qual:${scoreColor(s.sealQuality)} auth:${scoreColor(s.authenticity)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    purity:${scoreColor(s.waxPurity)} clarity:${scoreColor(s.impressionClarity)} authority:${scoreColor(s.stampAuthority)} integrity:${scoreColor(s.sealIntegrity)}`)
  details.push(`    imp: depth:${s.impression.depth} sharp:${s.impression.sharpness} complete:${s.impression.completeness} sym:${s.impression.symmetry}`)
  details.push(`    doc: ${s.document.type} ${s.document.authority} ${s.document.age} cert:${s.document.certificationLevel} orig:${s.document.isOriginal}`)
  if (s.issues.length > 0) details.push(`    issues: ${s.issues.join(', ')}`)
  if (s.endorsements.length > 0) details.push(`    endorsements: ${s.endorsements.join(', ')}`)
  return details.join('\n')
}

// ─── Collection Formatting ──────────────────────────────────────────────────

function formatCollection(c: SealCollection, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${authColor(c.authority)} seals:${c.seals.length} qual:${scoreColor(c.collectionQuality)} auth:${scoreColor(c.avgAuthenticity)} cert:${c.certificationRate}%`

  if (!verbose) return line
  const details = [line]
  details.push(`    purity:${c.dominantWaxType} stamp:${c.dominantStampDesign} royal:${c.royalSeals} guild:${c.guildCertified} suspect:${c.suspectCount} intact:${c.intactCount} broken:${c.brokenCount}`)
  return details.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────────────────────────

function formatStats(stats: WaxSealStats): string {
  return [
    `  Files: ${stats.totalFiles} | Collections: ${stats.totalCollections} | Quality: ${scoreColor(stats.avgSealQuality)} | Purity: ${scoreColor(stats.avgWaxPurity)} | Clarity: ${scoreColor(stats.avgImpressionClarity)}`,
    `  Authority: ${scoreColor(stats.avgStampAuthority)} | Integrity: ${scoreColor(stats.avgSealIntegrity)} | Authenticity: ${scoreColor(stats.overallAuthenticity)} | CertRate: ${stats.certificationRate}%`,
    `  Royal: ${chalk.rgb(255, 215, 0)(String(stats.royalSeals))} | Guild: ${chalk.green(String(stats.guildCertified))} | Common: ${chalk.yellow(String(stats.commonSeals))} | Suspect: ${chalk.rgb(255, 165, 0)(String(stats.suspectSeals))} | Forgery: ${chalk.red(String(stats.forgerySeals))}`,
    `  Intact: ${chalk.green(String(stats.intactSeals))} | Broken: ${chalk.red(String(stats.brokenSeals))} | Original: ${chalk.blue(String(stats.originalFiles))} | Copied: ${chalk.yellow(String(stats.copiedFiles))} | Certified: ${chalk.green(String(stats.certifiedFiles))}`,
    `  Bubbles: ${stats.totalAirBubbles} | Smudges: ${stats.totalSmudges} | Cracks: ${chalk.red(String(stats.totalCracks))} | Chips: ${stats.totalChips}`,
    `  Herald: ${heraldColor(stats.heraldGrade)} | Best: ${chalk.green(stats.bestSeal)} | Worst: ${chalk.red(stats.worstSeal)} | Authentic: ${chalk.cyan(stats.mostAuthentic)} | Suspect: ${chalk.yellow(stats.mostSuspect)}`,
  ].join('\n')
}

// ─── Table Formatter ────────────────────────────────────────────────────────

/**
 * Format wax seal result as a table
 * @example
 * formatWaxSealTable(result, false) // string
 */
export function formatWaxSealTable(result: WaxSealResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏛️  Wax Seal - Code Authenticity Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔴 Seal Marks'))
  if (result.seals.length === 0) {
    lines.push(chalk.dim('  No seals detected.'))
  } else {
    const display = verbose ? result.seals : result.seals.slice(0, 15)
    for (const s of display) {
      lines.push(formatSeal(s, verbose))
    }
    if (!verbose && result.seals.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.seals.length - 15} more`))
    }
  }
  lines.push('')

  if (result.collections.length > 0) {
    lines.push(chalk.bold('📂 Collections'))
    for (const c of result.collections) {
      lines.push(formatCollection(c, verbose))
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

// ─── JSON Formatter ─────────────────────────────────────────────────────────

/**
 * Format wax seal result as JSON
 * @example
 * formatWaxSealJson(result) // string
 */
export function formatWaxSealJson(result: WaxSealResult): string {
  return JSON.stringify(result, null, 2)
}
