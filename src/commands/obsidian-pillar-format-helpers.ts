import chalk from 'chalk'
import type { ObsidianPillarResult } from './obsidian-pillar-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example gradeColor('diamond-pillar') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'diamond-pillar': return chalk.rgb(100, 149, 237).bold(g)
    case 'obsidian-strong': return chalk.rgb(46, 204, 113)(g)
    case 'basalt-firm': return chalk.rgb(155, 89, 182)(g)
    case 'sandstone-moderate': return chalk.rgb(52, 152, 219)(g)
    case 'chalk-weak': return chalk.rgb(241, 196, 15)(g)
    case 'crumbling': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example recoveryColor('instant-cooling') returns colored string */
export function recoveryColor(r: string): string {
  switch (r) {
    case 'instant-cooling': return chalk.rgb(100, 149, 237).bold(r)
    case 'rapid-solidification': return chalk.rgb(46, 204, 113)(r)
    case 'proper-tempering': return chalk.rgb(155, 89, 182)(r)
    case 'slow-cooling': return chalk.rgb(52, 152, 219)(r)
    case 'thermal-shock': return chalk.rgb(241, 196, 15)(r)
    case 'shattered': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example clarityQualityColor('midnight-sun') returns colored string */
export function clarityQualityColor(q: string): string {
  switch (q) {
    case 'midnight-sun': return chalk.rgb(100, 149, 237).bold(q)
    case 'starlit-clarity': return chalk.rgb(46, 204, 113)(q)
    case 'moonlit-readable': return chalk.rgb(155, 89, 182)(q)
    case 'dusk-readable': return chalk.rgb(52, 152, 219)(q)
    case 'murky-dark': return chalk.rgb(241, 196, 15)(q)
    case 'pitch-black': return chalk.rgb(231, 76, 60)(q)
    default: return q
  }
}

/** @example precisionColor('laser-aligned') returns colored string */
export function precisionColor(p: string): string {
  switch (p) {
    case 'laser-aligned': return chalk.rgb(100, 149, 237).bold(p)
    case 'plumb-perfect': return chalk.rgb(46, 204, 113)(p)
    case 'well-aligned': return chalk.rgb(155, 89, 182)(p)
    case 'mostly-straight': return chalk.rgb(52, 152, 219)(p)
    case 'leaning': return chalk.rgb(241, 196, 15)(p)
    case 'crooked': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example depthColor('bedrock-anchored') returns colored string */
export function depthColor(d: string): string {
  switch (d) {
    case 'bedrock-anchored': return chalk.rgb(100, 149, 237).bold(d)
    case 'deep-foundation': return chalk.rgb(46, 204, 113)(d)
    case 'proper-footing': return chalk.rgb(155, 89, 182)(d)
    case 'shallow-base': return chalk.rgb(52, 152, 219)(d)
    case 'surface-rest': return chalk.rgb(241, 196, 15)(d)
    case 'floating': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example ratingColor('structural-masterpiece') returns colored string */
export function ratingColor(r: string): string {
  switch (r) {
    case 'structural-masterpiece': return chalk.rgb(100, 149, 237).bold(r)
    case 'load-bearing-pillar': return chalk.rgb(46, 204, 113)(r)
    case 'reliable-support': return chalk.rgb(155, 89, 182)(r)
    case 'adequate-prop': return chalk.rgb(52, 152, 219)(r)
    case 'wobbly-stick': return chalk.rgb(241, 196, 15)(r)
    case 'collapsing': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example conditionColor('monolithic-pillar') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'monolithic-pillar': return chalk.rgb(100, 149, 237).bold(c)
    case 'strong-column': return chalk.rgb(46, 204, 113)(c)
    case 'reliable-post': return chalk.rgb(155, 89, 182)(c)
    case 'weathered-pillar': return chalk.rgb(52, 152, 219)(c)
    case 'cracked-column': return chalk.rgb(241, 196, 15)(c)
    case 'rubble': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example architectGradeColor('master-architect') returns colored string */
export function architectGradeColor(g: string): string {
  switch (g) {
    case 'master-architect': return chalk.rgb(100, 149, 237).bold(g)
    case 'structural-engineer': return chalk.rgb(46, 204, 113)(g)
    case 'builder': return chalk.rgb(155, 89, 182)(g)
    case 'mason': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'demolition': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example galleryTypeColor('great-hall') returns colored string */
export function galleryTypeColor(t: string): string {
  switch (t) {
    case 'great-hall': return chalk.rgb(100, 149, 237).bold(t)
    case 'cathedral-nave': return chalk.rgb(46, 204, 113)(t)
    case 'temple-colonnade': return chalk.rgb(155, 89, 182)(t)
    case 'portico': return chalk.rgb(52, 152, 219)(t)
    case 'ruins': return chalk.rgb(241, 196, 15)(t)
    case 'void': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example galleryConditionColor('structural-marvel') returns colored string */
export function galleryConditionColor(c: string): string {
  switch (c) {
    case 'structural-marvel': return chalk.rgb(100, 149, 237).bold(c)
    case 'solid-colonnade': return chalk.rgb(46, 204, 113)(c)
    case 'adequate-support': return chalk.rgb(155, 89, 182)(c)
    case 'weathered-gallery': return chalk.rgb(52, 152, 219)(c)
    case 'crumbling-hall': return chalk.rgb(241, 196, 15)(c)
    case 'collapsed': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatObsidianPillarJson(result) returns JSON string */
export function formatObsidianPillarJson(result: ObsidianPillarResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatObsidianPillarTable(result, verbose) returns formatted string */
export function formatObsidianPillarTable(result: ObsidianPillarResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Obsidian Pillar Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Structure Overview:'))
  lines.push(`    Overall Integrity:  ${scoreColor(result.structure.overallStructuralIntegrity)}`)
  lines.push(`    Avg Strength:       ${scoreColor(result.structure.avgStrength)}`)
  lines.push(`    Avg Alignment:      ${scoreColor(result.structure.avgAlignment)}`)
  lines.push(`    Avg Support:        ${scoreColor(result.structure.avgSupport)}`)
  lines.push(`    Is Structural:      ${result.structure.isStructural ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:        ${result.stats.totalFiles}`)
  lines.push(`    Total Galleries:    ${result.stats.totalGalleries}`)
  lines.push(`    Avg Compressive:    ${scoreColor(result.stats.avgCompressiveStrength)}`)
  lines.push(`    Avg Volcanic:       ${scoreColor(result.stats.avgVolcanicResilience)}`)
  lines.push(`    Avg Dark Clarity:   ${scoreColor(result.stats.avgDarkClarity)}`)
  lines.push(`    Avg Alignment:      ${scoreColor(result.stats.avgPillarAlignment)}`)
  lines.push(`    Avg Foundation:     ${scoreColor(result.stats.avgFoundationAnchoring)}`)
  lines.push(`    Avg Support:        ${scoreColor(result.stats.avgSupportQuality)}`)
  lines.push(`    Architect Grade:    ${architectGradeColor(result.stats.architectGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Monolithic:         ${result.stats.monolithicPillarCount}`)
  lines.push(`    Strong:             ${result.stats.strongColumnCount}`)
  lines.push(`    Reliable:           ${result.stats.reliablePostCount}`)
  lines.push(`    Weathered:          ${result.stats.weatheredPillarCount}`)
  lines.push(`    Cracked:            ${result.stats.crackedColumnCount}`)
  lines.push(`    Rubble:             ${result.stats.rubbleCount}`)
  lines.push('')

  if (result.stats.bestSegment) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Overall:       ${result.stats.bestSegment}`)
    lines.push(`    Strongest:          ${result.stats.strongest}`)
    lines.push(`    Most Resilient:     ${result.stats.mostResilient}`)
    lines.push(`    Clearest:           ${result.stats.clearest}`)
    lines.push(`    Most Aligned:       ${result.stats.mostAligned}`)
    lines.push(`    Deepest Anchored:   ${result.stats.deepestAnchored}`)
    lines.push('')
  }

  if (verbose && result.segments.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Segments:'))
    for (const seg of result.segments) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(seg.file)}`)
      lines.push(`      Score: ${scoreColor(seg.qualityScore)}  Condition: ${conditionColor(seg.condition)}`)
      lines.push(`      Comp: ${gradeColor(seg.compressive.grade)}(${seg.compressiveStrength})  Volc: ${recoveryColor(seg.volcanic.recovery)}(${seg.volcanicResilience})  Dark: ${clarityQualityColor(seg.dark.quality)}(${seg.darkClarity})`)
      lines.push(`      Align: ${precisionColor(seg.alignment.precision)}(${seg.pillarAlignment})  Found: ${depthColor(seg.foundation.depth)}(${seg.foundationAnchoring})  Supp: ${ratingColor(seg.support.rating)}(${seg.supportQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 149, 237)('\u2728')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
