import chalk from 'chalk'
import type { MidnightInkResult } from './midnight-ink-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example penetrationColor('abyssal-depth') returns colored string */
export function penetrationColor(s: string): string {
  switch (s) {
    case 'abyssal-depth': return chalk.rgb(118, 255, 3).bold(s)
    case 'deep-understanding': return chalk.rgb(46, 204, 113)(s)
    case 'proper-depth': return chalk.rgb(52, 152, 219)(s)
    case 'surface-scratch': return chalk.rgb(241, 196, 15)(s)
    case 'shallow': return chalk.rgb(230, 126, 34)(s)
    case 'puddle': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example visionColor('night-vision') returns colored string */
export function visionColor(s: string): string {
  switch (s) {
    case 'night-vision': return chalk.rgb(118, 255, 3).bold(s)
    case 'dark-adapted': return chalk.rgb(46, 204, 113)(s)
    case 'candlelight-reading': return chalk.rgb(52, 152, 219)(s)
    case 'squinting': return chalk.rgb(241, 196, 15)(s)
    case 'fumbling': return chalk.rgb(230, 126, 34)(s)
    case 'blind': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example environmentColor('grand-scriptorium') returns colored string */
export function environmentColor(s: string): string {
  switch (s) {
    case 'grand-scriptorium': return chalk.rgb(118, 255, 3).bold(s)
    case 'monastery-library': return chalk.rgb(46, 204, 113)(s)
    case 'proper-study': return chalk.rgb(52, 152, 219)(s)
    case 'cluttered-desk': return chalk.rgb(241, 196, 15)(s)
    case 'dark-corner': return chalk.rgb(230, 126, 34)(s)
    case 'dungeon': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example archiveColor('vellum-manuscript') returns colored string */
export function archiveColor(s: string): string {
  switch (s) {
    case 'vellum-manuscript': return chalk.rgb(118, 255, 3).bold(s)
    case 'bound-codex': return chalk.rgb(46, 204, 113)(s)
    case 'proper-scroll': return chalk.rgb(52, 152, 219)(s)
    case 'loose-pages': return chalk.rgb(241, 196, 15)(s)
    case 'faded-papyrus': return chalk.rgb(230, 126, 34)(s)
    case 'dust': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example artistryColor('gold-illuminated') returns colored string */
export function artistryColor(s: string): string {
  switch (s) {
    case 'gold-illuminated': return chalk.rgb(118, 255, 3).bold(s)
    case 'vivid-capitals': return chalk.rgb(46, 204, 113)(s)
    case 'proper-headings': return chalk.rgb(52, 152, 219)(s)
    case 'plain-text': return chalk.rgb(241, 196, 15)(s)
    case 'faded-ink': return chalk.rgb(230, 126, 34)(s)
    case 'invisible': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example skillColor('master-scribe') returns colored string */
export function skillColor(s: string): string {
  switch (s) {
    case 'master-scribe': return chalk.rgb(118, 255, 3).bold(s)
    case 'expert-craftsman': return chalk.rgb(46, 204, 113)(s)
    case 'skilled-artisan': return chalk.rgb(52, 152, 219)(s)
    case 'competent-worker': return chalk.rgb(241, 196, 15)(s)
    case 'apprentice': return chalk.rgb(230, 126, 34)(s)
    case 'finger-painting': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('masterpiece-manuscript') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece-manuscript': return chalk.rgb(118, 255, 3).bold(c)
    case 'fine-codex': return chalk.rgb(46, 204, 113)(c)
    case 'proper-scroll': return chalk.rgb(52, 152, 219)(c)
    case 'faded-text': return chalk.rgb(241, 196, 15)(c)
    case 'crumbling-parchment': return chalk.rgb(230, 126, 34)(c)
    case 'dust': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example scribeGradeColor('arch-scribe') returns colored string */
export function scribeGradeColor(g: string): string {
  switch (g) {
    case 'arch-scribe': return chalk.rgb(118, 255, 3).bold(g)
    case 'master-illuminator': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-scribe': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice-copier': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'illiterate': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMidnightInkJson(result) returns JSON string */
export function formatMidnightInkJson(result: MidnightInkResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMidnightInkTable(result, verbose) returns formatted string */
export function formatMidnightInkTable(result: MidnightInkResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Midnight Ink Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Library:'))
  lines.push(`    Avg Depth:             ${scoreColor(result.library.avgDepth)}`)
  lines.push(`    Avg Preservation:      ${scoreColor(result.library.avgPreservation)}`)
  lines.push(`    Avg Craftsmanship:     ${scoreColor(result.library.avgCraftsmanship)}`)
  lines.push(`    Is Masterful:          ${result.library.isMasterful ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Scholarship:   ${scoreColor(result.library.overallScholarship)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:             ${result.stats.totalCollections}`)
  lines.push(`    Avg Depth:                     ${scoreColor(result.stats.avgDepth)}`)
  lines.push(`    Avg Dark Clarity:              ${scoreColor(result.stats.avgDarkClarity)}`)
  lines.push(`    Avg Scriptorium Quality:       ${scoreColor(result.stats.avgScriptoriumQuality)}`)
  lines.push(`    Avg Manuscript Preservation:   ${scoreColor(result.stats.avgManuscriptPreservation)}`)
  lines.push(`    Avg Illuminated Text:          ${scoreColor(result.stats.avgIlluminatedText)}`)
  lines.push(`    Avg Scholarly Craft:           ${scoreColor(result.stats.avgScholarlyCraft)}`)
  lines.push(`    Scribe Grade:                  ${scribeGradeColor(result.stats.scribeGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Masterpiece Manuscript:  ${result.stats.masterpieceManuscriptCount}`)
  lines.push(`    Fine Codex:              ${result.stats.fineCodexCount}`)
  lines.push(`    Proper Scroll:           ${result.stats.properScrollCount}`)
  lines.push(`    Faded Text:              ${result.stats.fadedTextCount}`)
  lines.push(`    Crumbling Parchment:     ${result.stats.crumblingParchmentCount}`)
  lines.push(`    Dust:                    ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestStroke) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Stroke:       ${result.stats.bestStroke}`)
    lines.push(`    Deepest:           ${result.stats.deepest}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push(`    Best Workspace:    ${result.stats.bestWorkspace}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Best Structured:   ${result.stats.bestStructured}`)
    lines.push('')
  }

  if (verbose && result.strokes.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Strokes:'))
    for (const st of result.strokes) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(st.file)}`)
      lines.push(`      Score: ${scoreColor(st.qualityScore)}  Condition: ${conditionColor(st.condition)}`)
      lines.push(`      Deep: ${penetrationColor(st.deep.penetration)}(${st.depth})  Clear: ${visionColor(st.clear.vision)}(${st.darkClarity})  Scriptorium: ${environmentColor(st.scriptorium.environment)}(${st.scriptoriumQuality})`)
      lines.push(`      Preserved: ${archiveColor(st.preserved.archive)}(${st.manuscriptPreservation})  Illuminated: ${artistryColor(st.illuminated.artistry)}(${st.illuminatedText})  Scholarly: ${skillColor(st.scholarly.skill)}(${st.scholarlyCraft})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F4DC}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
