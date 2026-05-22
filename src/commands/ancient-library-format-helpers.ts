import chalk from 'chalk'

import type { AncientLibraryResult } from './ancient-library-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('sacred-text') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'sacred-text': return chalk.rgb(255, 215, 0).bold(condition)
    case 'valued-manuscript': return chalk.rgb(46, 204, 113)(condition)
    case 'reference-work': return chalk.rgb(52, 152, 219)(condition)
    case 'pamphlet': return chalk.rgb(241, 196, 15)(condition)
    case 'fragment': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('head-librarian') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'head-librarian': return chalk.rgb(255, 215, 0).bold(grade)
    case 'senior-scholar': return chalk.rgb(46, 204, 113)(grade)
    case 'librarian': return chalk.rgb(155, 89, 182)(grade)
    case 'clerk': return chalk.rgb(52, 152, 219)(grade)
    case 'apprentice': return chalk.rgb(241, 196, 15)(grade)
    case 'book-burner': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example scrollColor('pristine-scroll') returns colored string */
export function scrollColor(condition: string): string {
  switch (condition) {
    case 'pristine-scroll': return chalk.rgb(255, 215, 0).bold(condition)
    case 'well-preserved': return chalk.rgb(46, 204, 113)(condition)
    case 'aged': return chalk.rgb(155, 89, 182)(condition)
    case 'fragmentary': return chalk.rgb(52, 152, 219)(condition)
    case 'damaged': return chalk.rgb(241, 196, 15)(condition)
    case 'lost': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example scholarlyColor('grand-scholar') returns colored string */
export function scholarlyColor(rank: string): string {
  switch (rank) {
    case 'grand-scholar': return chalk.rgb(255, 215, 0).bold(rank)
    case 'professor': return chalk.rgb(46, 204, 113)(rank)
    case 'scholar': return chalk.rgb(155, 89, 182)(rank)
    case 'student': return chalk.rgb(52, 152, 219)(rank)
    case 'novice': return chalk.rgb(241, 196, 15)(rank)
    case 'illiterate': return chalk.rgb(231, 76, 60)(rank)
    default: return rank
  }
}

/** @example catalogColor('dewey-perfect') returns colored string */
export function catalogColor(system: string): string {
  switch (system) {
    case 'dewey-perfect': return chalk.rgb(255, 215, 0).bold(system)
    case 'well-cataloged': return chalk.rgb(46, 204, 113)(system)
    case 'organized': return chalk.rgb(155, 89, 182)(system)
    case 'partial': return chalk.rgb(52, 152, 219)(system)
    case 'chaotic': return chalk.rgb(241, 196, 15)(system)
    case 'nonexistent': return chalk.rgb(231, 76, 60)(system)
    default: return system
  }
}

/** @example preservationColor('timeless') returns colored string */
export function preservationColor(state: string): string {
  switch (state) {
    case 'timeless': return chalk.rgb(255, 215, 0).bold(state)
    case 'enduring': return chalk.rgb(46, 204, 113)(state)
    case 'stable': return chalk.rgb(155, 89, 182)(state)
    case 'aging': return chalk.rgb(52, 152, 219)(state)
    case 'decaying': return chalk.rgb(241, 196, 15)(state)
    case 'crumbling': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example illuminationColor('masterwork') returns colored string */
export function illuminationColor(style: string): string {
  switch (style) {
    case 'masterwork': return chalk.rgb(255, 215, 0).bold(style)
    case 'ornate': return chalk.rgb(46, 204, 113)(style)
    case 'elegant': return chalk.rgb(155, 89, 182)(style)
    case 'plain': return chalk.rgb(52, 152, 219)(style)
    case 'rough': return chalk.rgb(241, 196, 15)(style)
    case 'ugly': return chalk.rgb(231, 76, 60)(style)
    default: return style
  }
}

/** @example wisdomColor('enlightened') returns colored string */
export function wisdomColor(grade: string): string {
  switch (grade) {
    case 'enlightened': return chalk.rgb(255, 215, 0).bold(grade)
    case 'wise': return chalk.rgb(46, 204, 113)(grade)
    case 'learned': return chalk.rgb(155, 89, 182)(grade)
    case 'informed': return chalk.rgb(52, 152, 219)(grade)
    case 'ignorant': return chalk.rgb(241, 196, 15)(grade)
    case 'foolish': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example wingTypeColor('grand-archive') returns colored string */
export function wingTypeColor(type: string): string {
  switch (type) {
    case 'grand-archive': return chalk.rgb(255, 215, 0).bold(type)
    case 'reading-room': return chalk.rgb(46, 204, 113)(type)
    case 'study-hall': return chalk.rgb(155, 89, 182)(type)
    case 'scroll-rack': return chalk.rgb(52, 152, 219)(type)
    case 'bookshelf': return chalk.rgb(241, 196, 15)(type)
    case 'empty-shelf': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAncientLibraryJson(result) returns JSON string */
export function formatAncientLibraryJson(result: AncientLibraryResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAncientLibraryTable(result, verbose) returns formatted string */
export function formatAncientLibraryTable(result: AncientLibraryResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(52, 152, 219).bold('  Ancient Library Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Institution Overview:'))
  lines.push(`    Overall Wisdom:          ${scoreColor(result.institution.overallWisdom)}`)
  lines.push(`    Avg Scroll Quality:      ${scoreColor(result.institution.avgScroll)}`)
  lines.push(`    Avg Scholarly Depth:     ${scoreColor(result.institution.avgScholarly)}`)
  lines.push(`    Avg Wisdom Level:        ${scoreColor(result.institution.avgWisdom)}`)
  lines.push(`    Is Wise:                 ${result.institution.isWise ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Wings:              ${result.stats.totalWings}`)
  lines.push(`    Avg Scroll Quality:       ${scoreColor(result.stats.avgScrollQuality)}`)
  lines.push(`    Avg Scholarly Depth:      ${scoreColor(result.stats.avgScholarlyDepth)}`)
  lines.push(`    Avg Catalog Organization: ${scoreColor(result.stats.avgCatalogOrganization)}`)
  lines.push(`    Avg Preservation Quality: ${scoreColor(result.stats.avgPreservationQuality)}`)
  lines.push(`    Avg Illumination Beauty:  ${scoreColor(result.stats.avgIlluminationBeauty)}`)
  lines.push(`    Avg Wisdom Level:         ${scoreColor(result.stats.avgWisdomLevel)}`)
  lines.push(`    Librarian Grade:          ${gradeColor(result.stats.librarianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Sacred Text:        ${result.stats.sacredTextCount}`)
  lines.push(`    Valued Manuscript:  ${result.stats.valuedManuscriptCount}`)
  lines.push(`    Reference Work:     ${result.stats.referenceWorkCount}`)
  lines.push(`    Pamphlet:           ${result.stats.pamphletCount}`)
  lines.push(`    Fragment:           ${result.stats.fragmentCount}`)
  lines.push(`    Dust:               ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestPage) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Page:          ${result.stats.bestPage}`)
    lines.push(`    Best Documented:    ${result.stats.bestDocumented}`)
    lines.push(`    Deepest:            ${result.stats.deepest}`)
    lines.push(`    Most Organized:     ${result.stats.mostOrganized}`)
    lines.push(`    Best Preserved:     ${result.stats.bestPreserved}`)
    lines.push(`    Most Beautiful:     ${result.stats.mostBeautiful}`)
    lines.push('')
  }

  if (verbose && result.pages.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const page of result.pages) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(page.file)}`)
      lines.push(`      Score: ${scoreColor(page.qualityScore)}  Condition: ${conditionColor(page.condition)}`)
      lines.push(`      Scroll: ${scrollColor(page.scroll.condition)}(${page.scrollQuality})  Scholarly: ${scholarlyColor(page.scholarly.rank)}(${page.scholarlyDepth})  Catalog: ${catalogColor(page.catalog.system)}(${page.catalogOrganization})`)
      lines.push(`      Preservation: ${preservationColor(page.preservation.state)}(${page.preservationQuality})  Illumination: ${illuminationColor(page.illumination.style)}(${page.illuminationBeauty})  Wisdom: ${wisdomColor(page.wisdom.grade)}(${page.wisdomLevel})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)('\u{1F4DA}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
