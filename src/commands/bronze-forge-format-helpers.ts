import chalk from 'chalk'
import type { BronzeForgeResult } from './bronze-forge-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(205, 127, 50)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example skillColor('master-smith') returns colored string */
export function skillColor(s: string): string {
  switch (s) {
    case 'master-smith': return chalk.rgb(205, 127, 50).bold(s)
    case 'expert-craftsman': return chalk.rgb(46, 204, 113)(s)
    case 'skilled-artisan': return chalk.rgb(52, 152, 219)(s)
    case 'competent-worker': return chalk.rgb(241, 196, 15)(s)
    case 'apprentice': return chalk.rgb(230, 126, 34)(s)
    case 'clumsy': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example compositionColor('perfect-alloy') returns colored string */
export function compositionColor(c: string): string {
  switch (c) {
    case 'perfect-alloy': return chalk.rgb(205, 127, 50).bold(c)
    case 'strong-bronze': return chalk.rgb(46, 204, 113)(c)
    case 'proper-mix': return chalk.rgb(52, 152, 219)(c)
    case 'weak-alloy': return chalk.rgb(241, 196, 15)(c)
    case 'brittle-metal': return chalk.rgb(230, 126, 34)(c)
    case 'impure': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example rigorColor('triple-tempered') returns colored string */
export function rigorColor(r: string): string {
  switch (r) {
    case 'triple-tempered': return chalk.rgb(205, 127, 50).bold(r)
    case 'properly-tempered': return chalk.rgb(46, 204, 113)(r)
    case 'well-heated': return chalk.rgb(52, 152, 219)(r)
    case 'partially-treated': return chalk.rgb(241, 196, 15)(r)
    case 'raw-casting': return chalk.rgb(230, 126, 34)(r)
    case 'unforged': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example agingColor('graceful-patina') returns colored string */
export function agingColor(a: string): string {
  switch (a) {
    case 'graceful-patina': return chalk.rgb(205, 127, 50).bold(a)
    case 'well-aged': return chalk.rgb(46, 204, 113)(a)
    case 'proper-maturity': return chalk.rgb(52, 152, 219)(a)
    case 'showing-wear': return chalk.rgb(241, 196, 15)(a)
    case 'corroding': return chalk.rgb(230, 126, 34)(a)
    case 'degrading': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example moldColor('perfect-casting') returns colored string */
export function moldColor(m: string): string {
  switch (m) {
    case 'perfect-casting': return chalk.rgb(205, 127, 50).bold(m)
    case 'clean-cast': return chalk.rgb(46, 204, 113)(m)
    case 'proper-mold': return chalk.rgb(52, 152, 219)(m)
    case 'flash-burr': return chalk.rgb(241, 196, 15)(m)
    case 'misshapen': return chalk.rgb(230, 126, 34)(m)
    case 'failed-cast': return chalk.rgb(231, 76, 60)(m)
    default: return m
  }
}

/** @example enduranceColor('timeless-artifact') returns colored string */
export function enduranceColor(e: string): string {
  switch (e) {
    case 'timeless-artifact': return chalk.rgb(205, 127, 50).bold(e)
    case 'durable-tool': return chalk.rgb(46, 204, 113)(e)
    case 'reliable-instrument': return chalk.rgb(52, 152, 219)(e)
    case 'serviceable': return chalk.rgb(241, 196, 15)(e)
    case 'wearing-out': return chalk.rgb(230, 126, 34)(e)
    case 'disposable': return chalk.rgb(231, 76, 60)(e)
    default: return e
  }
}

/** @example conditionColor('masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(205, 127, 50).bold(c)
    case 'fine-artifact': return chalk.rgb(46, 204, 113)(c)
    case 'quality-tool': return chalk.rgb(52, 152, 219)(c)
    case 'workhorse': return chalk.rgb(241, 196, 15)(c)
    case 'worn-tool': return chalk.rgb(230, 126, 34)(c)
    case 'scrap-bronze': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('legendary-smith') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'legendary-smith': return chalk.rgb(205, 127, 50).bold(g)
    case 'master-smith': return chalk.rgb(46, 204, 113)(g)
    case 'expert-forger': return chalk.rgb(52, 152, 219)(g)
    case 'skilled-craftsman': return chalk.rgb(241, 196, 15)(g)
    case 'apprentice': return chalk.rgb(230, 126, 34)(g)
    case 'scrap-dealer': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatBronzeForgeJson(result) returns JSON string */
export function formatBronzeForgeJson(result: BronzeForgeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatBronzeForgeTable(result, verbose) returns formatted string */
export function formatBronzeForgeTable(result: BronzeForgeResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(205, 127, 50).bold('  Bronze Forge Analysis'))
  lines.push('')

  lines.push(chalk.rgb(205, 127, 50)('  Foundry:'))
  lines.push(`    Overall Craftsmanship:   ${scoreColor(result.foundry.overallCraftsmanship)}`)
  lines.push(`    Avg Craftsmanship:       ${scoreColor(result.foundry.avgCraftsmanship)}`)
  lines.push(`    Avg Heat Treatment:      ${scoreColor(result.foundry.avgHeatTreatment)}`)
  lines.push(`    Avg Durability Legacy:   ${scoreColor(result.foundry.avgDurabilityLegacy)}`)
  lines.push(`    Is Masterwork:           ${result.foundry.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(205, 127, 50)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Workshops:          ${result.stats.totalWorkshops}`)
  lines.push(`    Avg Craftsmanship:        ${scoreColor(result.stats.avgCraftsmanship)}`)
  lines.push(`    Avg Alloy Strength:       ${scoreColor(result.stats.avgAlloyStrength)}`)
  lines.push(`    Avg Heat Treatment:       ${scoreColor(result.stats.avgHeatTreatment)}`)
  lines.push(`    Avg Patina Wisdom:        ${scoreColor(result.stats.avgPatinaWisdom)}`)
  lines.push(`    Avg Casting Quality:      ${scoreColor(result.stats.avgCastingQuality)}`)
  lines.push(`    Avg Durability Legacy:    ${scoreColor(result.stats.avgDurabilityLegacy)}`)
  lines.push(`    Smith Grade:              ${gradeColor(result.stats.smithGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(205, 127, 50)('  Condition Counts:'))
  lines.push(`    Masterpiece:      ${result.stats.masterpieceCount}`)
  lines.push(`    Fine Artifact:    ${result.stats.fineArtifactCount}`)
  lines.push(`    Quality Tool:     ${result.stats.qualityToolCount}`)
  lines.push(`    Workhorse:        ${result.stats.workhorseCount}`)
  lines.push(`    Worn Tool:        ${result.stats.wornToolCount}`)
  lines.push(`    Scrap Bronze:     ${result.stats.scrapBronzeCount}`)
  lines.push('')

  if (result.stats.bestArtifact) {
    lines.push(chalk.rgb(205, 127, 50)('  Highlights:'))
    lines.push(`    Best Artifact:     ${result.stats.bestArtifact}`)
    lines.push(`    Best Crafted:      ${result.stats.bestCrafted}`)
    lines.push(`    Strongest:         ${result.stats.strongest}`)
    lines.push(`    Best Tested:       ${result.stats.bestTested}`)
    lines.push(`    Wisest:            ${result.stats.wisest}`)
    lines.push(`    Best Formed:       ${result.stats.bestFormed}`)
    lines.push('')
  }

  if (verbose && result.artifacts.length > 0) {
    lines.push(chalk.rgb(205, 127, 50)('  Per-File Artifacts:'))
    for (const a of result.artifacts) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(a.file)}`)
      lines.push(`      Score: ${scoreColor(a.qualityScore)}  Condition: ${conditionColor(a.condition)}`)
      lines.push(`      Craft: ${skillColor(a.crafted.skill)}(${a.craftsmanship})  Alloy: ${compositionColor(a.alloy.composition)}(${a.alloyStrength})  Heat: ${rigorColor(a.heat.rigor)}(${a.heatTreatment})`)
      lines.push(`      Patina: ${agingColor(a.patina.aging)}(${a.patinaWisdom})  Cast: ${moldColor(a.casting.mold)}(${a.castingQuality})  Durable: ${enduranceColor(a.durable.endurance)}(${a.durabilityLegacy})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(205, 127, 50)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(205, 127, 50)('\u{1F528}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
