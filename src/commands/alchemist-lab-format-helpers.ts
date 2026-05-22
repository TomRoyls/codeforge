import chalk from 'chalk'

import type { AlchemistLabResult } from './alchemist-lab-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('philosopher-stone') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'philosopher-stone': return chalk.rgb(255, 215, 0).bold(condition)
    case 'aurum-potabile': return chalk.rgb(46, 204, 113)(condition)
    case 'grand-elixir': return chalk.rgb(52, 152, 219)(condition)
    case 'work-in-progress': return chalk.rgb(241, 196, 15)(condition)
    case 'base-metal': return chalk.rgb(230, 126, 34)(condition)
    case 'slag': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('grand-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'grand-master': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-alchemist': return chalk.rgb(46, 204, 113)(grade)
    case 'adept': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'charlatan': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example elementColor('aurum') returns colored string */
export function elementColor(element: string): string {
  switch (element) {
    case 'aurum': return chalk.rgb(255, 215, 0).bold(element)
    case 'argentum': return chalk.rgb(46, 204, 113)(element)
    case 'cuprum': return chalk.rgb(155, 89, 182)(element)
    case 'ferrum': return chalk.rgb(52, 152, 219)(element)
    case 'plumbum': return chalk.rgb(241, 196, 15)(element)
    case 'stercore': return chalk.rgb(231, 76, 60)(element)
    default: return element
  }
}

/** @example stateColor('distilled') returns colored string */
export function stateColor(state: string): string {
  switch (state) {
    case 'distilled': return chalk.rgb(255, 215, 0).bold(state)
    case 'filtered': return chalk.rgb(46, 204, 113)(state)
    case 'clarified': return chalk.rgb(155, 89, 182)(state)
    case 'raw': return chalk.rgb(52, 152, 219)(state)
    case 'impure': return chalk.rgb(241, 196, 15)(state)
    case 'contaminated': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example essenceColor('quintessence') returns colored string */
export function essenceColor(type: string): string {
  switch (type) {
    case 'quintessence': return chalk.rgb(255, 215, 0).bold(type)
    case 'aether': return chalk.rgb(46, 204, 113)(type)
    case 'vital-essence': return chalk.rgb(155, 89, 182)(type)
    case 'tincture': return chalk.rgb(52, 152, 219)(type)
    case 'diluted': return chalk.rgb(241, 196, 15)(type)
    case 'inert': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example agentColor('philosopher-catalyst') returns colored string */
export function agentColor(agent: string): string {
  switch (agent) {
    case 'philosopher-catalyst': return chalk.rgb(255, 215, 0).bold(agent)
    case 'accelerator': return chalk.rgb(46, 204, 113)(agent)
    case 'enzyme': return chalk.rgb(155, 89, 182)(agent)
    case 'mild-agent': return chalk.rgb(52, 152, 219)(agent)
    case 'inhibitor': return chalk.rgb(241, 196, 15)(agent)
    case 'poison': return chalk.rgb(231, 76, 60)(agent)
    default: return agent
  }
}

/** @example elixirGradeColor('elixir-of-life') returns colored string */
export function elixirGradeColor(grade: string): string {
  switch (grade) {
    case 'elixir-of-life': return chalk.rgb(255, 215, 0).bold(grade)
    case 'grand-elixir': return chalk.rgb(46, 204, 113)(grade)
    case 'minor-elixir': return chalk.rgb(155, 89, 182)(grade)
    case 'potion': return chalk.rgb(52, 152, 219)(grade)
    case 'brew': return chalk.rgb(241, 196, 15)(grade)
    case 'sludge': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example stageColor('lapis-philosophorum') returns colored string */
export function stageColor(stage: string): string {
  switch (stage) {
    case 'lapis-philosophorum': return chalk.rgb(255, 215, 0).bold(stage)
    case 'rubedo': return chalk.rgb(46, 204, 113)(stage)
    case 'albedo': return chalk.rgb(155, 89, 182)(stage)
    case 'nigredo': return chalk.rgb(52, 152, 219)(stage)
    case 'prima-materia': return chalk.rgb(241, 196, 15)(stage)
    case 'void': return chalk.rgb(231, 76, 60)(stage)
    default: return stage
  }
}

/** @example benchTypeColor('grand-laboratory') returns colored string */
export function benchTypeColor(type: string): string {
  switch (type) {
    case 'grand-laboratory': return chalk.rgb(255, 215, 0).bold(type)
    case 'alchemist-study': return chalk.rgb(46, 204, 113)(type)
    case 'workshop': return chalk.rgb(155, 89, 182)(type)
    case 'apothecary': return chalk.rgb(52, 152, 219)(type)
    case 'closet': return chalk.rgb(241, 196, 15)(type)
    case 'dungeon': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAlchemistLabJson(result) returns JSON string */
export function formatAlchemistLabJson(result: AlchemistLabResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAlchemistLabTable(result, verbose) returns formatted string */
export function formatAlchemistLabTable(result: AlchemistLabResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(52, 152, 219).bold('  Alchemist Lab Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Laboratory Overview:'))
  lines.push(`    Overall Alchemy:          ${scoreColor(result.laboratory.overallAlchemy)}`)
  lines.push(`    Avg Transmutation:        ${scoreColor(result.laboratory.avgTransmutation)}`)
  lines.push(`    Avg Purification:         ${scoreColor(result.laboratory.avgPurification)}`)
  lines.push(`    Avg Stone Proximity:      ${scoreColor(result.laboratory.avgStoneProximity)}`)
  lines.push(`    Is Golden:                ${result.laboratory.isGolden ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Benches:            ${result.stats.totalBenches}`)
  lines.push(`    Avg Transmutation:        ${scoreColor(result.stats.avgTransmutationQuality)}`)
  lines.push(`    Avg Purification:         ${scoreColor(result.stats.avgPurificationLevel)}`)
  lines.push(`    Avg Essence Potency:      ${scoreColor(result.stats.avgEssencePotency)}`)
  lines.push(`    Avg Catalyst Strength:    ${scoreColor(result.stats.avgCatalystStrength)}`)
  lines.push(`    Avg Elixir Quality:       ${scoreColor(result.stats.avgElixirQuality)}`)
  lines.push(`    Avg Stone Proximity:      ${scoreColor(result.stats.avgStoneProximity)}`)
  lines.push(`    Alchemist Grade:          ${gradeColor(result.stats.alchemistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Philosopher Stone:  ${result.stats.philosopherStoneCount}`)
  lines.push(`    Aurum Potabile:     ${result.stats.aurumPotabileCount}`)
  lines.push(`    Grand Elixir:       ${result.stats.grandElixirCount}`)
  lines.push(`    Work In Progress:   ${result.stats.workInProgressCount}`)
  lines.push(`    Base Metal:         ${result.stats.baseMetalCount}`)
  lines.push(`    Slag:               ${result.stats.slagCount}`)
  lines.push('')

  if (result.stats.bestSample) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Sample:          ${result.stats.bestSample}`)
    lines.push(`    Best Transmuter:      ${result.stats.bestTransmuter}`)
    lines.push(`    Purest:               ${result.stats.purest}`)
    lines.push(`    Most Potent:          ${result.stats.mostPotent}`)
    lines.push(`    Strongest Catalyst:   ${result.stats.strongestCatalyst}`)
    lines.push(`    Closest To Stone:     ${result.stats.closestToStone}`)
    lines.push('')
  }

  if (verbose && result.samples.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const sample of result.samples) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(sample.file)}`)
      lines.push(`      Score: ${scoreColor(sample.qualityScore)}  Condition: ${conditionColor(sample.condition)}`)
      lines.push(`      Transmutation: ${elementColor(sample.transmutation.element)}(${sample.transmutationQuality})  Purification: ${stateColor(sample.purification.state)}(${sample.purificationLevel})  Essence: ${essenceColor(sample.essence.type)}(${sample.essencePotency})`)
      lines.push(`      Catalyst: ${agentColor(sample.catalyst.agent)}(${sample.catalystStrength})  Elixir: ${elixirGradeColor(sample.elixir.grade)}(${sample.elixirQuality})  Stone: ${stageColor(sample.stone.stage)}(${sample.stoneProximity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(52, 152, 219)('\u{2697}\uFE0F')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
