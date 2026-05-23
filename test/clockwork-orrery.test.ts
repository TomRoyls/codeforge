import { describe, expect, it } from 'vitest'
import {
  analyzeClockChamber,
  analyzeGearAssembly,
  buildClockworkOrreryResult,
  classifyChamberType,
  classifyCondition,
  classifyHorologistGrade,
  measureAstronomical,
  measureEscapement,
  measureGear,
  measureHarmony,
  measureOrbital,
  measureTime,
} from '../src/commands/clockwork-orrery-helpers.js'
import {
  astroColor,
  chamberConditionColor,
  chamberTypeColor,
  conditionColor,
  escapementColor,
  formatClockworkOrreryJson,
  formatClockworkOrreryTable,
  gradeColor,
  harmonyColor,
  horologistColor,
  orbitalColor,
  scoreColor,
  timeColor,
} from '../src/commands/clockwork-orrery-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `/**
 * Module documentation
 */
import { readFileSync } from 'fs'
import type { Config } from './types'

export interface AudioOptions {
  sampleRate?: number
  channels: number
}

export type AudioFormat = 'wav' | 'mp3'

export class AudioProcessor {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  async process(input: Buffer): Promise<Buffer> {
    try {
      const decoded = this.decode(input)
      const filtered = this.filter(decoded)
      return this.encode(filtered)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Processing failed: ' + error.message)
      }
      throw error
    }
  }

  private decode(data: Buffer): Float32Array {
    return new Float32Array(data)
  }

  private filter(data: Float32Array): Float32Array {
    return data.map((sample) => sample * 0.8)
  }

  private encode(data: Float32Array): Buffer {
    return Buffer.from(data.buffer)
  }
}

export function createProcessor(config: Config): AudioProcessor {
  return new AudioProcessor(config)
}
`

const EMPTY = ''

const MEDIUM = `import { foo } from 'bar'
export function hello() { return 42 }
const x = 'test'
if (x) { console.log('yes') }`

// ─── measureGear ───────────────────────────────────────────────────────────

describe('measureGear', () => {
  it('returns chronometer-grade for rich content', () => {
    const g = measureGear(RICH)
    expect(g.precision).toBe(100)
    expect(g.grade).toBe('chronometer-grade')
    expect(g.hasHighPrecision).toBe(true)
    expect(g.hasProperToothProfile).toBe(true)
    expect(g.hasNoBacklash).toBe(true)
    expect(g.hasTightTolerance).toBe(true)
    expect(g.hasNoSlipping).toBe(true)
    expect(g.hasProperMeshing).toBe(true)
    expect(g.hasNoGrinding).toBe(true)
    expect(g.hasAccurate).toBe(true)
    expect(g.hasNoWobble).toBe(true)
    expect(g.hasConsistent).toBe(true)
    expect(g.backlashCount).toBe(0)
    expect(g.grindingCount).toBe(0)
  })

  it('returns rough for empty content', () => {
    const g = measureGear(EMPTY)
    expect(g.precision).toBe(42)
    expect(g.grade).toBe('rough')
    expect(g.hasHighPrecision).toBe(false)
  })

  it('returns swiss-watch for medium content', () => {
    const g = measureGear(MEDIUM)
    expect(g.precision).toBe(77)
    expect(g.grade).toBe('swiss-watch')
  })
})

// ─── measureHarmony ────────────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('returns well-coordinated for rich content', () => {
    const h = measureHarmony(RICH)
    expect(h.level).toBe(88)
    expect(h.state).toBe('well-coordinated')
    expect(h.hasHighLevel).toBe(true)
    expect(h.hasProperSynchronization).toBe(true)
    expect(h.hasNoCollision).toBe(true)
  })

  it('returns desynchronized for empty content', () => {
    const h = measureHarmony(EMPTY)
    expect(h.level).toBe(42)
    expect(h.state).toBe('desynchronized')
  })

  it('returns values for medium content', () => {
    const h = measureHarmony(MEDIUM)
    expect(h.level).toBe(47)
  })
})

// ─── measureOrbital ────────────────────────────────────────────────────────

describe('measureOrbital', () => {
  it('returns keplerian-orbit for rich content', () => {
    const o = measureOrbital(RICH)
    expect(o.logic).toBe(90)
    expect(o.pattern).toBe('keplerian-orbit')
    expect(o.hasHighLogic).toBe(true)
    expect(o.hasNoAnomalies).toBe(true)
  })

  it('returns decaying for empty content', () => {
    const o = measureOrbital(EMPTY)
    expect(o.logic).toBe(32)
    expect(o.pattern).toBe('decaying')
  })

  it('returns values for medium content', () => {
    const o = measureOrbital(MEDIUM)
    expect(o.logic).toBe(57)
  })
})

// ─── measureEscapement ─────────────────────────────────────────────────────

describe('measureEscapement', () => {
  it('returns tourbillon for rich content', () => {
    const e = measureEscapement(RICH)
    expect(e.quality).toBe(90)
    expect(e.mechanism).toBe('tourbillon')
    expect(e.hasHighQuality).toBe(true)
    expect(e.hasNoSkipping).toBe(true)
  })

  it('returns dead-beat for empty content', () => {
    const e = measureEscapement(EMPTY)
    expect(e.quality).toBe(43)
    expect(e.mechanism).toBe('dead-beat')
  })

  it('returns values for medium content', () => {
    const e = measureEscapement(MEDIUM)
    expect(e.quality).toBe(58)
  })
})

// ─── measureTime ───────────────────────────────────────────────────────────

describe('measureTime', () => {
  it('returns atomic-clock for rich content', () => {
    const t = measureTime(RICH)
    expect(t.keeping).toBe(89)
    expect(t.accuracy).toBe('atomic-clock')
    expect(t.hasHighKeeping).toBe(true)
    expect(t.hasNoDrift).toBe(true)
  })

  it('returns slow-clock for empty content', () => {
    const t = measureTime(EMPTY)
    expect(t.keeping).toBe(42)
    expect(t.accuracy).toBe('slow-clock')
  })

  it('returns values for medium content', () => {
    const t = measureTime(MEDIUM)
    expect(t.keeping).toBe(57)
  })
})

// ─── measureAstronomical ───────────────────────────────────────────────────

describe('measureAstronomical', () => {
  it('returns planetarium-grade for rich content', () => {
    const a = measureAstronomical(RICH)
    expect(a.accuracy).toBe(100)
    expect(a.fidelity).toBe('planetarium-grade')
    expect(a.hasHighAccuracy).toBe(true)
    expect(a.hasNoError).toBe(true)
  })

  it('returns decorative for empty content', () => {
    const a = measureAstronomical(EMPTY)
    expect(a.accuracy).toBe(43)
    expect(a.fidelity).toBe('decorative')
  })

  it('returns values for medium content', () => {
    const a = measureAstronomical(MEDIUM)
    expect(a.accuracy).toBe(60)
  })
})

// ─── analyzeGearAssembly ───────────────────────────────────────────────────

describe('analyzeGearAssembly', () => {
  it('returns masterwork-orrery for rich content', () => {
    const a = analyzeGearAssembly(RICH, 'r.ts')
    expect(a.file).toBe('r.ts')
    expect(a.gearPrecision).toBe(100)
    expect(a.mechanicalHarmony).toBe(88)
    expect(a.orbitalLogic).toBe(90)
    expect(a.escapementQuality).toBe(90)
    expect(a.timekeeping).toBe(89)
    expect(a.astronomicalAccuracy).toBe(100)
    expect(a.qualityScore).toBe(94)
    expect(a.condition).toBe('masterwork-orrery')
  })

  it('returns ticking-device for empty content', () => {
    const a = analyzeGearAssembly(EMPTY, 'e.ts')
    expect(a.qualityScore).toBe(41)
    expect(a.condition).toBe('ticking-device')
  })

  it('returns functional-clock for medium content', () => {
    const a = analyzeGearAssembly(MEDIUM, 'm.ts')
    expect(a.qualityScore).toBe(60)
    expect(a.condition).toBe('functional-clock')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies based on qualityScore thresholds', () => {
    const base = analyzeGearAssembly(RICH, 'r.ts')
    expect(classifyCondition({ ...base, qualityScore: 80 } as typeof base)).toBe('masterwork-orrery')
    expect(classifyCondition({ ...base, qualityScore: 65 } as typeof base)).toBe('precision-instrument')
    expect(classifyCondition({ ...base, qualityScore: 50 } as typeof base)).toBe('functional-clock')
    expect(classifyCondition({ ...base, qualityScore: 35 } as typeof base)).toBe('ticking-device')
    expect(classifyCondition({ ...base, qualityScore: 20 } as typeof base)).toBe('broken-mechanism')
    expect(classifyCondition({ ...base, qualityScore: 10 } as typeof base)).toBe('static')
  })
})

// ─── classifyHorologistGrade ───────────────────────────────────────────────

describe('classifyHorologistGrade', () => {
  it('classifies based on avg precision', () => {
    expect(classifyHorologistGrade(80)).toBe('master-horologist')
    expect(classifyHorologistGrade(65)).toBe('clockmaker')
    expect(classifyHorologistGrade(50)).toBe('watchmaker')
    expect(classifyHorologistGrade(35)).toBe('repairman')
    expect(classifyHorologistGrade(20)).toBe('tinkerer')
    expect(classifyHorologistGrade(0)).toBe('breaker')
  })
})

// ─── classifyChamberType ───────────────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns empty for empty array', () => {
    expect(classifyChamberType([])).toBe('empty')
  })

  it('returns correct type based on avg score', () => {
    const re = analyzeGearAssembly(RICH, 'r.ts')
    const me = analyzeGearAssembly(MEDIUM, 'm.ts')
    expect(classifyChamberType([re, me])).toBe('grand-orrery')
    expect(classifyChamberType([re])).toBe('grand-orrery')
    expect(classifyChamberType([me])).toBe('clock-tower')
  })
})

// ─── analyzeClockChamber ───────────────────────────────────────────────────

describe('analyzeClockChamber', () => {
  it('returns empty chamber for no assemblies', () => {
    const c = analyzeClockChamber([], 'empty')
    expect(c.directory).toBe('empty')
    expect(c.assemblies).toEqual([])
    expect(c.avgPrecision).toBe(0)
    expect(c.chamberType).toBe('empty')
    expect(c.condition).toBe('ruined')
  })

  it('returns correct chamber for rich + medium', () => {
    const re = analyzeGearAssembly(RICH, 'r.ts')
    const me = analyzeGearAssembly(MEDIUM, 'm.ts')
    const c = analyzeClockChamber([re, me], 'src')
    expect(c.avgPrecision).toBe(89)
    expect(c.avgHarmony).toBe(68)
    expect(c.avgAccuracy).toBe(80)
    expect(c.masterworkCount).toBe(1)
    expect(c.staticCount).toBe(0)
    expect(c.preciseCount).toBe(2)
    expect(c.chamberType).toBe('grand-orrery')
    expect(c.condition).toBe('horological-masterpiece')
  })
})

// ─── buildClockworkOrreryResult ────────────────────────────────────────────

describe('buildClockworkOrreryResult', () => {
  it('handles empty input', () => {
    const r = buildClockworkOrreryResult([], [])
    expect(r.assemblies).toEqual([])
    expect(r.chambers).toEqual([])
    expect(r.clocktower.overallPrecision).toBe(0)
    expect(r.clocktower.isPrecise).toBe(false)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.horologistGrade).toBe('breaker')
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns correct result for rich + medium', () => {
    const r = buildClockworkOrreryResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(r.assemblies.length).toBe(2)
    expect(r.clocktower.avgPrecision).toBe(89)
    expect(r.clocktower.avgHarmony).toBe(68)
    expect(r.clocktower.avgAccuracy).toBe(80)
    expect(r.clocktower.isPrecise).toBe(true)
    expect(r.clocktower.overallPrecision).toBe(77)
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgGearPrecision).toBe(89)
    expect(r.stats.avgMechanicalHarmony).toBe(68)
    expect(r.stats.avgOrbitalLogic).toBe(74)
    expect(r.stats.avgEscapementQuality).toBe(74)
    expect(r.stats.avgTimekeeping).toBe(73)
    expect(r.stats.avgAstronomicalAccuracy).toBe(80)
    expect(r.stats.masterworkOrreryCount).toBe(1)
    expect(r.stats.functionalClockCount).toBe(1)
    expect(r.stats.staticCount).toBe(0)
    expect(r.stats.hasHighPrecisionCount).toBe(2)
    expect(r.stats.hasHighHarmonyCount).toBe(1)
    expect(r.stats.hasHighLogicCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighKeepingCount).toBe(1)
    expect(r.stats.hasHighAccuracyCount).toBe(1)
    expect(r.stats.horologistGrade).toBe('clockmaker')
    expect(r.stats.bestAssembly).toBe('r.ts')
    expect(r.stats.mostPrecise).toBe('r.ts')
    expect(r.stats.mostHarmonious).toBe('r.ts')
    expect(r.stats.bestLogic).toBe('r.ts')
    expect(r.stats.bestTiming).toBe('r.ts')
    expect(r.stats.mostReliable).toBe('r.ts')
  })

  it('generates recommendations for low scores', () => {
    const r = buildClockworkOrreryResult(['e.ts'], [EMPTY])
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all levels', () => {
    expect(scoreColor(90)).toContain('90')
    expect(scoreColor(70)).toContain('70')
    expect(scoreColor(50)).toContain('50')
    expect(scoreColor(20)).toContain('20')
  })

  it('conditionColor returns colored string', () => {
    expect(conditionColor('masterwork-orrery')).toContain('masterwork-orrery')
    expect(conditionColor('static')).toContain('static')
  })

  it('gradeColor returns colored string', () => {
    expect(gradeColor('chronometer-grade')).toContain('chronometer-grade')
    expect(gradeColor('broken-gear')).toContain('broken-gear')
  })

  it('harmonyColor returns colored string', () => {
    expect(harmonyColor('symphony-of-gears')).toContain('symphony-of-gears')
    expect(harmonyColor('seized')).toContain('seized')
  })

  it('orbitalColor returns colored string', () => {
    expect(orbitalColor('keplerian-orbit')).toContain('keplerian-orbit')
    expect(orbitalColor('chaotic')).toContain('chaotic')
  })

  it('escapementColor returns colored string', () => {
    expect(escapementColor('tourbillon')).toContain('tourbillon')
    expect(escapementColor('stopped')).toContain('stopped')
  })

  it('timeColor returns colored string', () => {
    expect(timeColor('atomic-clock')).toContain('atomic-clock')
    expect(timeColor('broken-clock')).toContain('broken-clock')
  })

  it('astroColor returns colored string', () => {
    expect(astroColor('planetarium-grade')).toContain('planetarium-grade')
    expect(astroColor('broken')).toContain('broken')
  })

  it('horologistColor returns colored string', () => {
    expect(horologistColor('master-horologist')).toContain('master-horologist')
    expect(horologistColor('breaker')).toContain('breaker')
  })

  it('chamberTypeColor returns colored string', () => {
    expect(chamberTypeColor('grand-orrery')).toContain('grand-orrery')
    expect(chamberTypeColor('empty')).toContain('empty')
  })

  it('chamberConditionColor returns colored string', () => {
    expect(chamberConditionColor('horological-masterpiece')).toContain('horological-masterpiece')
    expect(chamberConditionColor('ruined')).toContain('ruined')
  })

  it('formatClockworkOrreryJson returns valid JSON', () => {
    const r = buildClockworkOrreryResult(['r.ts'], [RICH])
    const json = formatClockworkOrreryJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.assemblies.length).toBe(1)
  })

  it('formatClockworkOrreryTable includes overview', () => {
    const r = buildClockworkOrreryResult(['r.ts'], [RICH])
    const table = formatClockworkOrreryTable(r, false)
    expect(table).toContain('Clockwork Orrery Analysis')
    expect(table).toContain('Overall Precision')
    expect(table).toContain('Horologist Grade')
  })

  it('formatClockworkOrreryTable includes per-file when verbose', () => {
    const r = buildClockworkOrreryResult(['r.ts'], [RICH])
    const table = formatClockworkOrreryTable(r, true)
    expect(table).toContain('Per-File Details')
  })

  it('formatClockworkOrreryTable omits per-file when not verbose', () => {
    const r = buildClockworkOrreryResult(['r.ts'], [RICH])
    const table = formatClockworkOrreryTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('detects any types as backlash', () => {
    const badContent = 'const x: any = 1\nconst y: any = 2'
    const g = measureGear(badContent)
    expect(g.hasNoBacklash).toBe(false)
    expect(g.backlashCount).toBe(2)
  })

  it('detects eval as backlash', () => {
    const badContent = 'eval("code")'
    const g = measureGear(badContent)
    expect(g.hasNoBacklash).toBe(false)
    expect(g.backlashCount).toBe(1)
  })

  it('detects HACK as wobble', () => {
    const hackContent = '// HACK: workaround'
    const g = measureGear(hackContent)
    expect(g.hasNoWobble).toBe(false)
  })

  it('detects TODO in time drift', () => {
    const todoContent = '// TODO: fix this'
    const t = measureTime(todoContent)
    expect(t.hasNoDegradation).toBe(false)
  })

  it('detects console in harmony overloading', () => {
    const consoleContent = "console.log('hello')"
    const h = measureHarmony(consoleContent)
    expect(h.hasNoOverloading).toBe(false)
  })

  it('detects empty catch as grinding', () => {
    const badContent = 'try {} catch (e) {}'
    const g = measureGear(badContent)
    expect(g.hasNoGrinding).toBe(false)
    expect(g.grindingCount).toBe(1)
  })

  it('detects FIXME in astronomical missing', () => {
    const fixmeContent = '// FIXME: broken'
    const a = measureAstronomical(fixmeContent)
    expect(a.hasNoMissing).toBe(false)
    expect(a.missingCount).toBe(1)
  })

  it('empty content gear defaults', () => {
    const g = measureGear(EMPTY)
    expect(g.hasNoBacklash).toBe(true)
    expect(g.hasNoSlipping).toBe(true)
    expect(g.hasNoGrinding).toBe(true)
    expect(g.hasNoWobble).toBe(true)
  })

  it('empty content harmony defaults', () => {
    const h = measureHarmony(EMPTY)
    expect(h.hasNoCollision).toBe(true)
    expect(h.hasNoJamming).toBe(true)
    expect(h.hasNoOverloading).toBe(true)
  })

  it('empty content orbital defaults', () => {
    const o = measureOrbital(EMPTY)
    expect(o.hasNoAnomalies).toBe(true)
    expect(o.hasNoCollision).toBe(true)
    expect(o.hasNoRetrograde).toBe(true)
  })

  it('medium content escapement', () => {
    const e = measureEscapement(MEDIUM)
    expect(e.mechanism).toBe('dead-beat')
  })

  it('medium content time accuracy', () => {
    const t = measureTime(MEDIUM)
    expect(t.accuracy).toBe('slow-clock')
  })

  it('detects empty catch in orbital collision', () => {
    const badContent = 'try {} catch (e) {}'
    const o = measureOrbital(badContent)
    expect(o.hasNoCollision).toBe(false)
    expect(o.collisionCount).toBe(1)
  })

  it('detects HACK in escapement irregularity', () => {
    const hackContent = '// HACK: workaround'
    const e = measureEscapement(hackContent)
    expect(e.hasNoIrregularity).toBe(false)
  })

  it('detects TODO in astronomical missing count', () => {
    const todoContent = '// TODO: fix'
    const a = measureAstronomical(todoContent)
    expect(a.hasNoMissing).toBe(false)
    expect(a.missingCount).toBe(1)
  })

  it('detects HACK+FIXME in time vulnerability', () => {
    const vulContent = '// HACK: x\n// FIXME: y'
    const t = measureTime(vulContent)
    expect(t.hasNoVulnerability).toBe(false)
    expect(t.vulnerabilityCount).toBe(2)
  })

  it('detects eval as orbital anomaly', () => {
    const badContent = 'eval("code")'
    const o = measureOrbital(badContent)
    expect(o.hasNoAnomalies).toBe(false)
    expect(o.anomalyCount).toBe(1)
  })

  it('detects console in astronomical excess', () => {
    const consoleContent = "console.log('x')"
    const a = measureAstronomical(consoleContent)
    expect(a.hasNoExcess).toBe(false)
  })

  it('empty content escapement defaults', () => {
    const e = measureEscapement(EMPTY)
    expect(e.hasNoSkipping).toBe(true)
    expect(e.hasNoStalling).toBe(true)
    expect(e.hasNoOverbanking).toBe(true)
    expect(e.hasNoIrregularity).toBe(true)
  })

  it('empty content time defaults', () => {
    const t = measureTime(EMPTY)
    expect(t.hasNoDrift).toBe(true)
    expect(t.hasNoSkipping).toBe(true)
    expect(t.hasNoDegradation).toBe(true)
    expect(t.hasNoVulnerability).toBe(true)
  })

  it('empty content astronomical defaults', () => {
    const a = measureAstronomical(EMPTY)
    expect(a.hasNoError).toBe(true)
    expect(a.hasNoDistortion).toBe(true)
    expect(a.hasNoExcess).toBe(true)
  })
})
