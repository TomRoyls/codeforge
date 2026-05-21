import chalk from 'chalk'
import type { InstrumentPart, OrchestraSection, OrchestraPitResult } from './orchestra-pit-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'virtuoso': return chalk.rgb(255, 215, 0)(c)
    case 'first-chair': return chalk.green(c)
    case 'section-player': return chalk.blue(c)
    case 'amateur': return chalk.cyan(c)
    case 'beginner': return chalk.yellow(c)
    case 'tone-deaf': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function sectionTypeColor(t: string): string {
  switch (t) {
    case 'string-section': return chalk.rgb(255, 215, 0)(t)
    case 'woodwind-section': return chalk.green(t)
    case 'brass-section': return chalk.blue(t)
    case 'percussion-section': return chalk.cyan(t)
    case 'mixed-ensemble': return chalk.yellow(t)
    case 'solo-stage': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function sectionConditionColor(c: string): string {
  switch (c) {
    case 'world-class': return chalk.rgb(255, 215, 0)(c)
    case 'professional': return chalk.green(c)
    case 'community': return chalk.blue(c)
    case 'school': return chalk.cyan(c)
    case 'garage': return chalk.yellow(c)
    case 'cacophony': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'grand-maestro': return chalk.rgb(255, 215, 0)(g)
    case 'maestro': return chalk.green(g)
    case 'conductor': return chalk.blue(g)
    case 'musician': return chalk.cyan(g)
    case 'busker': return chalk.yellow(g)
    case 'street-performer': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Instrument Formatting ───────────────────────────────────────────────────

function formatInstrument(inst: InstrumentPart, verbose: boolean): string {
  const line = ` ${conditionColor(inst.condition)} ${chalk.bold(inst.file)} tune:${scoreColor(inst.tuning)} time:${scoreColor(inst.timing)} dyn:${scoreColor(inst.dynamics)} harm:${scoreColor(inst.harmony)} solo:${scoreColor(inst.soloQuality)} cond:${scoreColor(inst.conductorClarity)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    instrument: ${inst.instrument.type}(${inst.instrument.family}) range:${scoreColor(inst.instrument.range)} register:${inst.instrument.register} tuned:${inst.instrument.isTuned ? chalk.green('Y') : chalk.red('N')} pitch:${scoreColor(inst.instrument.pitchAccuracy)} vibrato:${inst.instrument.hasVibrato ? chalk.green('Y') : chalk.red('N')} muted:${inst.instrument.isMuted ? chalk.yellow('Y') : chalk.green('N')}`)
  details.push(`    rhythm: tempo:${scoreColor(inst.rhythm.tempo)} steady:${inst.rhythm.isSteadyBeat ? chalk.green('Y') : chalk.red('N')} missed:${inst.rhythm.missedBeatCount} sig:${inst.rhythm.timeSignature} syncopation:${inst.rhythm.hasSyncopation ? chalk.yellow('Y') : chalk.green('N')} double:${inst.rhythm.hasDoubleTime ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    dynamics: range:${scoreColor(inst.dynamicsObj.range)} pp:${inst.dynamicsObj.hasPianissimo ? chalk.green('Y') : chalk.red('N')} ff:${inst.dynamicsObj.hasFortissimo ? chalk.green('Y') : chalk.red('N')} cresc:${inst.dynamicsObj.hasCrescendo ? chalk.green('Y') : chalk.red('N')} control:${scoreColor(inst.dynamicsObj.dynamicControl)}`)
  details.push(`    ensemble: inSection:${inst.ensemble.isInSection ? chalk.green('Y') : chalk.red('N')} leader:${inst.ensemble.sectionLeader ? chalk.green('Y') : chalk.red('N')} cues:${inst.ensemble.followsCues ? chalk.green('Y') : chalk.red('N')} errors:${inst.ensemble.cueErrorCount} soloist:${inst.ensemble.isSoloist ? chalk.yellow('Y') : chalk.green('N')}`)
  details.push(`    score: readable:${inst.score.isReadable ? chalk.green('Y') : chalk.red('N')} annotations:${inst.score.annotationCount} readability:${scoreColor(inst.score.readability)} tempo:${inst.score.hasTempoMarkings ? chalk.green('Y') : chalk.red('N')} articulations:${inst.score.hasArticulations ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    performance: rehearsed:${inst.performance.isRehearsed ? chalk.green('Y') : chalk.red('N')} improv:${inst.performance.hasImprovisation ? chalk.yellow('Y') : chalk.green('N')} ready:${inst.performance.performanceReady ? chalk.green('Y') : chalk.red('N')} quality:${scoreColor(inst.performance.rehearsalQuality)}`)
  return details.join('\n')
}

// ─── Section Formatting ──────────────────────────────────────────────────────

function formatSection(sec: OrchestraSection): string {
  return `  ${chalk.bold(sec.directory)} ${sectionTypeColor(sec.sectionType)} ${sectionConditionColor(sec.condition)} instruments:${sec.instruments.length} tune:${scoreColor(sec.avgTuning)} time:${scoreColor(sec.avgTiming)} harm:${scoreColor(sec.avgHarmony)} solo:${scoreColor(sec.avgSoloQuality)} virtuoso:${sec.virtuosoCount} toneDeaf:${sec.toneDeafCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format orchestra pit result as a table
 * @example
 * formatOrchestraPitTable(result, false) // string
 */
export function formatOrchestraPitTable(result: OrchestraPitResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎵  Orchestra Pit - Code Coordination/Harmony Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🎻 Instruments'))
  if (result.instruments.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.instruments : result.instruments.slice(0, 15)
    for (const inst of display) {
      lines.push(formatInstrument(inst, verbose))
    }
    if (!verbose && result.instruments.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.instruments.length - 15} more`))
    }
  }
  lines.push('')

  if (result.sections.length > 0) {
    lines.push(chalk.bold('🎼 Sections'))
    for (const sec of result.sections) {
      lines.push(formatSection(sec))
    }
    lines.push('')
  }

  const sym = result.symphony
  lines.push(chalk.bold('🎺 Symphony'))
  lines.push(`  Tuning:${scoreColor(sym.avgTuning)} Timing:${scoreColor(sym.avgTiming)} Harmony:${scoreColor(sym.avgHarmony)} Solo:${scoreColor(sym.avgSoloQuality)} Conductor:${scoreColor(sym.avgConductorClarity)} InTune:${sym.isInTune ? chalk.green('YES') : chalk.red('NO')} Overall:${scoreColor(sym.overallHarmony)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.maestroGrade)} | Harmony: ${scoreColor(s.overallHarmony)} | Files: ${s.totalFiles} | Sections: ${s.totalSections}`)
  lines.push(`  Virtuoso:${s.virtuosoCount} FirstChair:${s.firstChairCount} Section:${s.sectionPlayerCount} Amateur:${s.amateurCount} Beginner:${s.beginnerCount} ToneDeaf:${s.toneDeafCount}`)
  lines.push(`  Strings:${s.stringsCount} Woodwinds:${s.woodwindsCount} Brass:${s.brassCount} Percussion:${s.percussionCount} Keys:${s.keyboardsCount} Vocals:${s.vocalsCount}`)
  lines.push(`  Tuned:${s.tunedCount} SteadyBeat:${s.steadyBeatCount} MissedBeats:${s.missedBeatCount} HasDynamics:${s.hasDynamicsCount} InSection:${s.inSectionCount} Soloist:${s.soloistCount}`)
  lines.push(`  Rehearsed:${s.rehearsedCount} Ready:${s.performanceReadyCount} | Best:${chalk.green(s.bestInstrument)} | Worst:${chalk.red(s.worstInstrument)}`)
  lines.push(`  BestTuned:${chalk.blue(s.bestTuned)} | BestTimed:${chalk.cyan(s.bestTimed)} | BestDynamic:${chalk.rgb(255, 215, 0)(s.bestDynamic)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format orchestra pit result as JSON
 * @example
 * formatOrchestraPitJson(result) // string
 */
export function formatOrchestraPitJson(result: OrchestraPitResult): string {
  return JSON.stringify(result, null, 2)
}
