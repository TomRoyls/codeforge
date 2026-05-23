import chalk from 'chalk'
import type { EmeraldCityResult } from './emerald-city-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example radianceColor('blinding-brilliance') returns colored string */
export function radianceColor(r: string): string {
  switch (r) {
    case 'blinding-brilliance': return chalk.rgb(118, 255, 3).bold(r)
    case 'shining-bright': return chalk.rgb(46, 204, 113)(r)
    case 'radiant': return chalk.rgb(52, 152, 219)(r)
    case 'glowing': return chalk.rgb(241, 196, 15)(r)
    case 'dim': return chalk.rgb(230, 126, 34)(r)
    case 'dark': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example entranceColor('golden-gates') returns colored string */
export function entranceColor(e: string): string {
  switch (e) {
    case 'golden-gates': return chalk.rgb(118, 255, 3).bold(e)
    case 'welcoming-portal': return chalk.rgb(46, 204, 113)(e)
    case 'proper-entrance': return chalk.rgb(52, 152, 219)(e)
    case 'side-door': return chalk.rgb(241, 196, 15)(e)
    case 'hidden-entrance': return chalk.rgb(230, 126, 34)(e)
    case 'walled-off': return chalk.rgb(231, 76, 60)(e)
    default: return e
  }
}

/** @example pathColor('golden-path') returns colored string */
export function pathColor(p: string): string {
  switch (p) {
    case 'golden-path': return chalk.rgb(118, 255, 3).bold(p)
    case 'clear-road': return chalk.rgb(46, 204, 113)(p)
    case 'well-marked': return chalk.rgb(52, 152, 219)(p)
    case 'somewhat-clear': return chalk.rgb(241, 196, 15)(p)
    case 'winding': return chalk.rgb(230, 126, 34)(p)
    case 'maze': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example magicColor('grand-wizard') returns colored string */
export function magicColor(m: string): string {
  switch (m) {
    case 'grand-wizard': return chalk.rgb(118, 255, 3).bold(m)
    case 'powerful-sorcerer': return chalk.rgb(46, 204, 113)(m)
    case 'skilled-mage': return chalk.rgb(52, 152, 219)(m)
    case 'apprentice-wizard': return chalk.rgb(241, 196, 15)(m)
    case 'hedge-mage': return chalk.rgb(230, 126, 34)(m)
    case 'muggle': return chalk.rgb(231, 76, 60)(m)
    default: return m
  }
}

/** @example beautyColor('emerald-splendor') returns colored string */
export function beautyColor(b: string): string {
  switch (b) {
    case 'emerald-splendor': return chalk.rgb(118, 255, 3).bold(b)
    case 'beautiful-glow': return chalk.rgb(46, 204, 113)(b)
    case 'pleasant-look': return chalk.rgb(52, 152, 219)(b)
    case 'adequate': return chalk.rgb(241, 196, 15)(b)
    case 'plain': return chalk.rgb(230, 126, 34)(b)
    case 'ugly': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example welcomeColor('theres-no-place-like-home') returns colored string */
export function welcomeColor(w: string): string {
  switch (w) {
    case 'theres-no-place-like-home': return chalk.rgb(118, 255, 3).bold(w)
    case 'warm-welcome': return chalk.rgb(46, 204, 113)(w)
    case 'comfortable-return': return chalk.rgb(52, 152, 219)(w)
    case 'manageable': return chalk.rgb(241, 196, 15)(w)
    case 'difficult-return': return chalk.rgb(230, 126, 34)(w)
    case 'no-way-back': return chalk.rgb(231, 76, 60)(w)
    default: return w
  }
}

/** @example conditionColor('emerald-palace') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'emerald-palace': return chalk.rgb(118, 255, 3).bold(c)
    case 'crystal-tower': return chalk.rgb(46, 204, 113)(c)
    case 'jade-pavilion': return chalk.rgb(52, 152, 219)(c)
    case 'stone-building': return chalk.rgb(241, 196, 15)(c)
    case 'wooden-shack': return chalk.rgb(230, 126, 34)(c)
    case 'ruins': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example wizardGradeColor('wizard-of-oz') returns colored string */
export function wizardGradeColor(g: string): string {
  switch (g) {
    case 'wizard-of-oz': return chalk.rgb(118, 255, 3).bold(g)
    case 'good-witch': return chalk.rgb(46, 204, 113)(g)
    case 'munchkin-elder': return chalk.rgb(52, 152, 219)(g)
    case 'traveler': return chalk.rgb(241, 196, 15)(g)
    case 'lost-soul': return chalk.rgb(230, 126, 34)(g)
    case 'wicked-witch': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatEmeraldCityJson(result) returns JSON string */
export function formatEmeraldCityJson(result: EmeraldCityResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatEmeraldCityTable(result, verbose) returns formatted string */
export function formatEmeraldCityTable(result: EmeraldCityResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Emerald City Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Kingdom:'))
  lines.push(`    Avg Brilliance:       ${scoreColor(result.kingdom.avgBrilliance)}`)
  lines.push(`    Avg Road Clarity:     ${scoreColor(result.kingdom.avgRoadClarity)}`)
  lines.push(`    Avg Homecoming:       ${scoreColor(result.kingdom.avgHomecoming)}`)
  lines.push(`    Is Magnificent:       ${result.kingdom.isMagnificent ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Splendor:     ${scoreColor(result.kingdom.overallSplendor)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Districts:          ${result.stats.totalDistricts}`)
  lines.push(`    Avg Brilliance:           ${scoreColor(result.stats.avgBrilliance)}`)
  lines.push(`    Avg Gateway Quality:      ${scoreColor(result.stats.avgGatewayQuality)}`)
  lines.push(`    Avg Yellow Brick Road:    ${scoreColor(result.stats.avgYellowBrickRoad)}`)
  lines.push(`    Avg Oz Wizardry:          ${scoreColor(result.stats.avgOzWizardry)}`)
  lines.push(`    Avg Emerald Splendor:     ${scoreColor(result.stats.avgEmeraldSplendor)}`)
  lines.push(`    Avg Homecoming Quality:   ${scoreColor(result.stats.avgHomecomingQuality)}`)
  lines.push(`    Wizard Grade:             ${wizardGradeColor(result.stats.wizardGrade)}`)
  lines.push(`    Celebration:              ${result.stats.celebration}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Emerald Palace:   ${result.stats.emeraldPalaceCount}`)
  lines.push(`    Crystal Tower:    ${result.stats.crystalTowerCount}`)
  lines.push(`    Jade Pavilion:    ${result.stats.jadePavilionCount}`)
  lines.push(`    Stone Building:   ${result.stats.stoneBuildingCount}`)
  lines.push(`    Wooden Shack:     ${result.stats.woodenShackCount}`)
  lines.push(`    Ruins:            ${result.stats.ruinsCount}`)
  lines.push('')

  if (result.stats.bestTower) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Tower:       ${result.stats.bestTower}`)
    lines.push(`    Most Brilliant:   ${result.stats.mostBrilliant}`)
    lines.push(`    Best Gateway:     ${result.stats.bestGateway}`)
    lines.push(`    Clearest Path:    ${result.stats.clearestPath}`)
    lines.push(`    Most Clever:      ${result.stats.mostClever}`)
    lines.push(`    Most Splendid:    ${result.stats.mostSplendid}`)
    lines.push('')
  }

  if (verbose && result.towers.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Towers:'))
    for (const t of result.towers) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(t.file)}`)
      lines.push(`      Score: ${scoreColor(t.qualityScore)}  Condition: ${conditionColor(t.condition)}`)
      lines.push(`      Brilliant: ${radianceColor(t.brilliant.radiance)}(${t.brilliance})  Gateway: ${entranceColor(t.gateway.entrance)}(${t.gatewayQuality})  Road: ${pathColor(t.road.path)}(${t.yellowBrickRoad})`)
      lines.push(`      Wizardry: ${magicColor(t.wizardry.magic)}(${t.ozWizardry})  Splendor: ${beautyColor(t.splendor.beauty)}(${t.emeraldSplendor})  Homecoming: ${welcomeColor(t.homecoming.welcome)}(${t.homecomingQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F3D9}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
