import chalk from 'chalk'

import type { BambooForestResult } from './bamboo-forest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('ancient-giant') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'ancient-giant': return chalk.rgb(255, 215, 0).bold(condition)
    case 'mature-culm': return chalk.rgb(46, 204, 113)(condition)
    case 'growing-shoot': return chalk.rgb(52, 152, 219)(condition)
    case 'tender-sprout': return chalk.rgb(241, 196, 15)(condition)
    case 'damaged': return chalk.rgb(230, 126, 34)(condition)
    case 'dead-cane': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-gardener') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-gardener': return chalk.rgb(255, 215, 0).bold(grade)
    case 'forester': return chalk.rgb(46, 204, 113)(grade)
    case 'gardener': return chalk.rgb(155, 89, 182)(grade)
    case 'tender': return chalk.rgb(52, 152, 219)(grade)
    case 'observer': return chalk.rgb(241, 196, 15)(grade)
    case 'lumberjack': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example culmGradeColor('iron-bamboo') returns colored string */
export function culmGradeColor(grade: string): string {
  switch (grade) {
    case 'iron-bamboo': return chalk.rgb(255, 215, 0).bold(grade)
    case 'moso': return chalk.rgb(46, 204, 113)(grade)
    case 'golden': return chalk.rgb(241, 196, 15)(grade)
    case 'green': return chalk.rgb(52, 152, 219)(grade)
    case 'tender': return chalk.rgb(230, 126, 34)(grade)
    case 'wilted': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example sealColor('perfect-seal') returns colored string */
export function sealColor(seal: string): string {
  switch (seal) {
    case 'perfect-seal': return chalk.rgb(255, 215, 0).bold(seal)
    case 'tight': return chalk.rgb(46, 204, 113)(seal)
    case 'snug': return chalk.rgb(155, 89, 182)(seal)
    case 'loose': return chalk.rgb(52, 152, 219)(seal)
    case 'gaping': return chalk.rgb(241, 196, 15)(seal)
    case 'broken': return chalk.rgb(231, 76, 60)(seal)
    default: return seal
  }
}

/** @example speedColor('explosive') returns colored string */
export function speedColor(speed: string): string {
  switch (speed) {
    case 'explosive': return chalk.rgb(255, 215, 0).bold(speed)
    case 'rapid': return chalk.rgb(46, 204, 113)(speed)
    case 'steady': return chalk.rgb(155, 89, 182)(speed)
    case 'slow': return chalk.rgb(52, 152, 219)(speed)
    case 'dormant': return chalk.rgb(241, 196, 15)(speed)
    case 'dying': return chalk.rgb(231, 76, 60)(speed)
    default: return speed
  }
}

/** @example systemColor('deep-taproot') returns colored string */
export function systemColor(system: string): string {
  switch (system) {
    case 'deep-taproot': return chalk.rgb(255, 215, 0).bold(system)
    case 'extensive': return chalk.rgb(46, 204, 113)(system)
    case 'moderate': return chalk.rgb(155, 89, 182)(system)
    case 'shallow': return chalk.rgb(52, 152, 219)(system)
    case 'surface': return chalk.rgb(241, 196, 15)(system)
    case 'floating': return chalk.rgb(231, 76, 60)(system)
    default: return system
  }
}

/** @example designColor('optimal') returns colored string */
export function designColor(design: string): string {
  switch (design) {
    case 'optimal': return chalk.rgb(255, 215, 0).bold(design)
    case 'efficient': return chalk.rgb(46, 204, 113)(design)
    case 'balanced': return chalk.rgb(155, 89, 182)(design)
    case 'wasteful': return chalk.rgb(52, 152, 219)(design)
    case 'bloated': return chalk.rgb(241, 196, 15)(design)
    case 'solid-waste': return chalk.rgb(231, 76, 60)(design)
    default: return design
  }
}

/** @example flexColor('hurricane-proof') returns colored string */
export function flexColor(flex: string): string {
  switch (flex) {
    case 'hurricane-proof': return chalk.rgb(255, 215, 0).bold(flex)
    case 'storm-resistant': return chalk.rgb(46, 204, 113)(flex)
    case 'flexible': return chalk.rgb(155, 89, 182)(flex)
    case 'stiff': return chalk.rgb(52, 152, 219)(flex)
    case 'brittle': return chalk.rgb(241, 196, 15)(flex)
    case 'snapping': return chalk.rgb(231, 76, 60)(flex)
    default: return flex
  }
}

/** @example groveTypeColor('ancient-forest') returns colored string */
export function groveTypeColor(type: string): string {
  switch (type) {
    case 'ancient-forest': return chalk.rgb(255, 215, 0).bold(type)
    case 'mature-grove': return chalk.rgb(46, 204, 113)(type)
    case 'growing-stand': return chalk.rgb(155, 89, 182)(type)
    case 'plantation': return chalk.rgb(52, 152, 219)(type)
    case 'clearing': return chalk.rgb(241, 196, 15)(type)
    case 'barren': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatBambooForestJson(result) returns JSON string */
export function formatBambooForestJson(result: BambooForestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatBambooForestTable(result, verbose) returns formatted string */
export function formatBambooForestTable(result: BambooForestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(46, 204, 113).bold('  Bamboo Forest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Forest Overview:'))
  lines.push(`    Overall Resilience:    ${scoreColor(result.forest.overallResilience)}`)
  lines.push(`    Avg Strength:          ${scoreColor(result.forest.avgStrength)}`)
  lines.push(`    Avg Growth:            ${scoreColor(result.forest.avgGrowth)}`)
  lines.push(`    Avg Wind Resistance:   ${scoreColor(result.forest.avgWind)}`)
  lines.push(`    Is Resilient:          ${result.forest.isResilient ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Groves:           ${result.stats.totalGroves}`)
  lines.push(`    Avg Culm Strength:      ${scoreColor(result.stats.avgCulmStrength)}`)
  lines.push(`    Avg Joint Quality:      ${scoreColor(result.stats.avgJointQuality)}`)
  lines.push(`    Avg Growth Rate:        ${scoreColor(result.stats.avgGrowthRate)}`)
  lines.push(`    Avg Root Depth:         ${scoreColor(result.stats.avgRootDepth)}`)
  lines.push(`    Avg Hollow Efficiency:  ${scoreColor(result.stats.avgHollowEfficiency)}`)
  lines.push(`    Avg Wind Resistance:    ${scoreColor(result.stats.avgWindResistance)}`)
  lines.push(`    Gardener Grade:         ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Ancient Giant:    ${result.stats.ancientGiantCount}`)
  lines.push(`    Mature Culm:      ${result.stats.matureCulmCount}`)
  lines.push(`    Growing Shoot:    ${result.stats.growingShootCount}`)
  lines.push(`    Tender Sprout:    ${result.stats.tenderSproutCount}`)
  lines.push(`    Damaged:          ${result.stats.damagedCount}`)
  lines.push(`    Dead Cane:        ${result.stats.deadCaneCount}`)
  lines.push('')

  if (result.stats.bestCulm) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Culm:          ${result.stats.bestCulm}`)
    lines.push(`    Strongest:          ${result.stats.strongest}`)
    lines.push(`    Best Joints:        ${result.stats.bestJoints}`)
    lines.push(`    Fastest Growing:    ${result.stats.fastestGrowing}`)
    lines.push(`    Deepest Roots:      ${result.stats.deepestRoots}`)
    lines.push(`    Most Efficient:     ${result.stats.mostEfficient}`)
    lines.push('')
  }

  if (verbose && result.culms.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const culm of result.culms) {
      lines.push(`    ${chalk.rgb(46, 204, 113)(culm.file)}`)
      lines.push(`      Score: ${scoreColor(culm.qualityScore)}  Condition: ${conditionColor(culm.condition)}`)
      lines.push(`      Culm: ${culmGradeColor(culm.culm.grade)}(${culm.culmStrength})  Joint: ${sealColor(culm.joint.seal)}(${culm.jointQuality})  Growth: ${speedColor(culm.growth.speed)}(${culm.growthRate})`)
      lines.push(`      Root: ${systemColor(culm.root.system)}(${culm.rootDepth})  Hollow: ${designColor(culm.hollow.design)}(${culm.hollowEfficiency})  Wind: ${flexColor(culm.wind.flex)}(${culm.windResistance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(46, 204, 113)('\u{1F38B}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
