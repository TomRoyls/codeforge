import chalk from 'chalk'
import type { VelvetCurtainResult } from './velvet-curtain-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example privacyGradeColor('vault-sealed') returns colored string */
export function privacyGradeColor(s: string): string {
  switch (s) {
    case 'vault-sealed': return chalk.rgb(118, 255, 3).bold(s)
    case 'well-hidden': return chalk.rgb(46, 204, 113)(s)
    case 'properly-curtained': return chalk.rgb(52, 152, 219)(s)
    case 'partially-exposed': return chalk.rgb(241, 196, 15)(s)
    case 'transparent': return chalk.rgb(230, 126, 34)(s)
    case 'naked': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example envelopeQualityColor('perfect-envelope') returns colored string */
export function envelopeQualityColor(s: string): string {
  switch (s) {
    case 'perfect-envelope': return chalk.rgb(118, 255, 3).bold(s)
    case 'clean-boundary': return chalk.rgb(46, 204, 113)(s)
    case 'proper-border': return chalk.rgb(52, 152, 219)(s)
    case 'fuzzy-edge': return chalk.rgb(241, 196, 15)(s)
    case 'porous': return chalk.rgb(230, 126, 34)(s)
    case 'no-boundary': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example drapeColor('regal-drape') returns colored string */
export function drapeColor(s: string): string {
  switch (s) {
    case 'regal-drape': return chalk.rgb(118, 255, 3).bold(s)
    case 'elegant-fold': return chalk.rgb(46, 204, 113)(s)
    case 'proper-hang': return chalk.rgb(52, 152, 219)(s)
    case 'slightly-wrinkled': return chalk.rgb(241, 196, 15)(s)
    case 'sagging': return chalk.rgb(230, 126, 34)(s)
    case 'tattered': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example accessColor('full-program') returns colored string */
export function accessColor(s: string): string {
  switch (s) {
    case 'full-program': return chalk.rgb(118, 255, 3).bold(s)
    case 'detailed-notes': return chalk.rgb(46, 204, 113)(s)
    case 'proper-script': return chalk.rgb(52, 152, 219)(s)
    case 'stage-directions': return chalk.rgb(241, 196, 15)(s)
    case 'scribbled-notes': return chalk.rgb(230, 126, 34)(s)
    case 'no-script': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example callColor('standing-ovation') returns colored string */
export function callColor(s: string): string {
  switch (s) {
    case 'standing-ovation': return chalk.rgb(118, 255, 3).bold(s)
    case 'enthusiastic-applause': return chalk.rgb(46, 204, 113)(s)
    case 'warm-reception': return chalk.rgb(52, 152, 219)(s)
    case 'polite-clapping': return chalk.rgb(241, 196, 15)(s)
    case 'crickets': return chalk.rgb(230, 126, 34)(s)
    case 'booed': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example theatricalQualityColor('masterpiece-theater') returns colored string */
export function theatricalQualityColor(s: string): string {
  switch (s) {
    case 'masterpiece-theater': return chalk.rgb(118, 255, 3).bold(s)
    case 'fine-performance': return chalk.rgb(46, 204, 113)(s)
    case 'proper-show': return chalk.rgb(52, 152, 219)(s)
    case 'amateur-hour': return chalk.rgb(241, 196, 15)(s)
    case 'rehearsal': return chalk.rgb(230, 126, 34)(s)
    case 'disaster': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('velvet-masterpiece') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'velvet-masterpiece': return chalk.rgb(118, 255, 3).bold(c)
    case 'fine-curtain': return chalk.rgb(46, 204, 113)(c)
    case 'proper-drape': return chalk.rgb(52, 152, 219)(c)
    case 'worn-fabric': return chalk.rgb(241, 196, 15)(c)
    case 'tattered-curtain': return chalk.rgb(230, 126, 34)(c)
    case 'no-curtain': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example directorGradeColor('master-director') returns colored string */
export function directorGradeColor(g: string): string {
  switch (g) {
    case 'master-director': return chalk.rgb(118, 255, 3).bold(g)
    case 'expert-producer': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-director': return chalk.rgb(52, 152, 219)(g)
    case 'stage-manager': return chalk.rgb(241, 196, 15)(g)
    case 'apprentice': return chalk.rgb(230, 126, 34)(g)
    case 'audience-member': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatVelvetCurtainJson(result) returns JSON string */
export function formatVelvetCurtainJson(result: VelvetCurtainResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatVelvetCurtainTable(result, verbose) returns formatted string */
export function formatVelvetCurtainTable(result: VelvetCurtainResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Velvet Curtain Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Theater:'))
  lines.push(`    Avg Privacy:         ${scoreColor(result.theater.avgPrivacy)}`)
  lines.push(`    Avg Elegance:        ${scoreColor(result.theater.avgElegance)}`)
  lines.push(`    Avg Theatrical:      ${scoreColor(result.theater.avgTheatrical)}`)
  lines.push(`    Is Elegant:          ${result.theater.isElegant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Elegance:    ${scoreColor(result.theater.overallElegance)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Rows:               ${result.stats.totalRows}`)
  lines.push(`    Avg Privacy:              ${scoreColor(result.stats.avgPrivacy)}`)
  lines.push(`    Avg Envelope Quality:     ${scoreColor(result.stats.avgEnvelopeQuality)}`)
  lines.push(`    Avg Drape Elegance:       ${scoreColor(result.stats.avgDrapeElegance)}`)
  lines.push(`    Avg Backstage Access:     ${scoreColor(result.stats.avgBackstageAccess)}`)
  lines.push(`    Avg Curtain Call:         ${scoreColor(result.stats.avgCurtainCall)}`)
  lines.push(`    Avg Theatrical Quality:   ${scoreColor(result.stats.avgTheatricalQuality)}`)
  lines.push(`    Director Grade:           ${directorGradeColor(result.stats.directorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Velvet Masterpiece:  ${result.stats.velvetMasterpieceCount}`)
  lines.push(`    Fine Curtain:        ${result.stats.fineCurtainCount}`)
  lines.push(`    Proper Drape:        ${result.stats.properDrapeCount}`)
  lines.push(`    Worn Fabric:         ${result.stats.wornFabricCount}`)
  lines.push(`    Tattered Curtain:    ${result.stats.tatteredCurtainCount}`)
  lines.push(`    No Curtain:          ${result.stats.noCurtainCount}`)
  lines.push('')

  if (result.stats.bestFold) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Fold:         ${result.stats.bestFold}`)
    lines.push(`    Most Private:      ${result.stats.mostPrivate}`)
    lines.push(`    Best Boundary:     ${result.stats.bestBoundary}`)
    lines.push(`    Most Elegant:      ${result.stats.mostElegant}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Best API:          ${result.stats.bestAPI}`)
    lines.push('')
  }

  if (verbose && result.folds.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Folds:'))
    for (const f of result.folds) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Private: ${privacyGradeColor(f.private.grade)}(${f.privacy})  Envelope: ${envelopeQualityColor(f.envelope.quality)}(${f.envelopeQuality})  Elegant: ${drapeColor(f.elegant.drape)}(${f.drapeElegance})`)
      lines.push(`      Backstage: ${accessColor(f.backstage.access)}(${f.backstageAccess})  Public: ${callColor(f.public.call)}(${f.curtainCall})  Theatrical: ${theatricalQualityColor(f.theatrical.quality)}(${f.theatricalQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F3AC}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
