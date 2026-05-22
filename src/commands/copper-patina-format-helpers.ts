import chalk from 'chalk'

import type { CopperPatinaResult } from './copper-patina-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('statue-of-liberty') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'statue-of-liberty': return chalk.rgb(255, 215, 0).bold(condition)
    case 'copper-dome': return chalk.rgb(46, 204, 113)(condition)
    case 'weather-vane': return chalk.rgb(255, 165, 0)(condition)
    case 'penny': return chalk.rgb(241, 196, 15)(condition)
    case 'scrap-wire': return chalk.rgb(230, 126, 34)(condition)
    case 'verdigris-dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-curator') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-curator': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-appraiser': return chalk.rgb(46, 204, 113)(grade)
    case 'antique-dealer': return chalk.rgb(52, 152, 219)(grade)
    case 'collector': return chalk.rgb(241, 196, 15)(grade)
    case 'scavenger': return chalk.rgb(230, 126, 34)(grade)
    case 'scrapper': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example patinaColor('verdigris') returns colored string */
export function patinaColor(color: string): string {
  switch (color) {
    case 'verdigris': return chalk.rgb(46, 204, 113)(color)
    case 'malachite': return chalk.rgb(39, 174, 96)(color)
    case 'copper-brown': return chalk.rgb(176, 122, 62)(color)
    case 'shiny-copper': return chalk.rgb(255, 165, 0)(color)
    case 'tarnished': return chalk.rgb(241, 196, 15)(color)
    case 'corroded': return chalk.rgb(231, 76, 60)(color)
    default: return color
  }
}

/** @example oxidationColor('mature-patina') returns colored string */
export function oxidationColor(stage: string): string {
  switch (stage) {
    case 'mature-patina': return chalk.rgb(46, 204, 113)(stage)
    case 'developing': return chalk.rgb(52, 152, 219)(stage)
    case 'early-oxide': return chalk.rgb(241, 196, 15)(stage)
    case 'fresh-tarnish': return chalk.rgb(230, 126, 34)(stage)
    case 'bare-metal': return chalk.rgb(231, 76, 60)(stage)
    case 'unexposed': return chalk.rgb(192, 57, 43).bold(stage)
    default: return stage
  }
}

/** @example integrityColor('solid') returns colored string */
export function integrityColor(state: string): string {
  switch (state) {
    case 'solid': return chalk.rgb(46, 204, 113)(state)
    case 'strong': return chalk.rgb(52, 152, 219)(state)
    case 'stable': return chalk.rgb(241, 196, 15)(state)
    case 'weakening': return chalk.rgb(230, 126, 34)(state)
    case 'fragile': return chalk.rgb(231, 76, 60)(state)
    case 'crumbling': return chalk.rgb(192, 57, 43).bold(state)
    default: return state
  }
}

/** @example collectionTypeColor('museum') returns colored string */
export function collectionTypeColor(collectionType: string): string {
  switch (collectionType) {
    case 'museum': return chalk.rgb(255, 215, 0)(collectionType)
    case 'gallery': return chalk.rgb(46, 204, 113)(collectionType)
    case 'exhibition': return chalk.rgb(52, 152, 219)(collectionType)
    case 'workshop': return chalk.rgb(241, 196, 15)(collectionType)
    case 'salvage-yard': return chalk.rgb(230, 126, 34)(collectionType)
    case 'scrap-heap': return chalk.rgb(231, 76, 60)(collectionType)
    default: return collectionType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCopperPatinaJson(result) returns JSON string */
export function formatCopperPatinaJson(result: CopperPatinaResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCopperPatinaTable(result, verbose) returns formatted string */
export function formatCopperPatinaTable(result: CopperPatinaResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(184, 115, 51).bold('  Copper Patina Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Museum Overview:'))
  lines.push(`    Overall Value:           ${scoreColor(result.museum.overallValue)}`)
  lines.push(`    Avg Patina:              ${scoreColor(result.museum.avgPatina)}`)
  lines.push(`    Avg Integrity:           ${scoreColor(result.museum.avgIntegrity)}`)
  lines.push(`    Avg Value:               ${scoreColor(result.museum.avgValue)}`)
  lines.push(`    Is Heritage:             ${result.museum.isHeritage ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Collections:             ${result.stats.totalCollections}`)
  lines.push(`    Avg Patina Quality:            ${scoreColor(result.stats.avgPatinaQuality)}`)
  lines.push(`    Avg Oxidation Depth:           ${scoreColor(result.stats.avgOxidationDepth)}`)
  lines.push(`    Avg Verdigris Beauty:          ${scoreColor(result.stats.avgVerdigrisBeauty)}`)
  lines.push(`    Avg Structural Integrity:      ${scoreColor(result.stats.avgStructuralIntegrity)}`)
  lines.push(`    Avg Environmental Adaptation:  ${scoreColor(result.stats.avgEnvironmentalAdaptation)}`)
  lines.push(`    Avg Antique Value:             ${scoreColor(result.stats.avgAntiqueValue)}`)
  lines.push(`    Appraiser Grade:               ${gradeColor(result.stats.appraiserGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Statue of Liberty:             ${result.stats.statueOfLibertyCount}`)
  lines.push(`    Copper Dome:                   ${result.stats.copperDomeCount}`)
  lines.push(`    Weather Vane:                  ${result.stats.weatherVaneCount}`)
  lines.push(`    Penny:                         ${result.stats.pennyCount}`)
  lines.push(`    Scrap Wire:                    ${result.stats.scrapWireCount}`)
  lines.push(`    Verdigris Dust:                ${result.stats.verdigrisDustCount}`)
  lines.push('')

  if (result.stats.bestArtifact) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Artifact:       ${result.stats.bestArtifact}`)
    lines.push(`    Best Patina:         ${result.stats.bestPatina}`)
    lines.push(`    Most Mature:         ${result.stats.mostMature}`)
    lines.push(`    Most Character:      ${result.stats.mostCharacter}`)
    lines.push(`    Strongest:           ${result.stats.strongest}`)
    lines.push(`    Most Valuable:       ${result.stats.mostValuable}`)
    lines.push('')
  }

  if (verbose && result.artifacts.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const artifact of result.artifacts) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(artifact.file)}`)
      lines.push(`      Score: ${scoreColor(artifact.qualityScore)}  Condition: ${conditionColor(artifact.condition)}`)
      lines.push(`      Patina: ${patinaColor(artifact.patina.color)}(${artifact.patinaQuality})  Oxidation: ${oxidationColor(artifact.oxidation.stage)}(${artifact.oxidationDepth})  Verdigris: ${artifact.verdigris.style}(${artifact.verdigrisBeauty})`)
      lines.push(`      Integrity: ${integrityColor(artifact.integrity.state)}(${artifact.structuralIntegrity})  Adaptation: ${artifact.adaptation.environment}(${artifact.environmentalAdaptation})  Antique: ${artifact.antique.appraisal}(${artifact.antiqueValue})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(184, 115, 51)('\u{1F3FA}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
