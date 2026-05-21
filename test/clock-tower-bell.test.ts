import { describe, expect, it } from 'vitest'

import {
  analyzeBellReading,
  analyzeClockDistrict,
  buildClockTowerBellResult,
  classifyDistrictCondition,
  classifyDistrictType,
  classifyHorologistGrade,
  classifyReadingCondition,
  generateRecommendations,
  measureTimekeeping,
  measureBell,
  measureGear,
  measureChime,
  measureWinding,
  measureTower,
  type BellReading,
} from '../src/commands/clock-tower-bell-helpers.js'

import {
  conditionColor,
  scoreColor,
  mechanismColor,
  toneColor,
  gearTypeColor,
  melodyColor,
  windingMethodColor,
  constructionColor,
  horologistGradeColor,
  districtCondColor,
  formatReading,
  formatDistrict,
  formatStats,
  formatClockTowerBellTable,
  formatClockTowerBellJson,
} from '../src/commands/clock-tower-bell-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

const RICH_CONTENT = `/**
 * Represents a user in the system.
 * @example new User('Alice')
 */
export interface User {
  name: string
  age: number
}

export class UserService {
  private users: User[] = []

  add(user: User): void {
    if (!user.name) throw new Error('Name required')
    this.users.push(user)
  }

  find(name: string): User | undefined {
    return this.users.find(u => u.name === name)
  }
}
`

// ─── measureTimekeeping ────────────────────────────────────────────────────

describe('measureTimekeeping', () => {
  it('returns sundial for empty content', () => {
    const t = measureTimekeeping(EMPTY_CONTENT)
    expect(t.accuracy).toBe(10)
    expect(t.mechanism).toBe('sundial')
    expect(t.isPrecise).toBe(false)
    expect(t.hasProperCalibration).toBe(false)
    expect(t.hasCompensation).toBe(false)
    expect(t.hasSynchronization).toBe(false)
    expect(t.hasTimezone).toBe(false)
    expect(t.hasEpoch).toBe(false)
    expect(t.hasDriftCorrection).toBe(false)
    expect(t.hasAccuracyRating).toBe(false)
    expect(t.driftAmount).toBe(90)
  })

  it('detects accuracy rating in minimal content', () => {
    const t = measureTimekeeping(MINIMAL_CONTENT)
    expect(t.hasAccuracyRating).toBe(true)
    expect(t.driftAmount).toBe(92)
    expect(t.mechanism).toBe('sundial')
  })

  it('returns pendulum for rich content', () => {
    const t = measureTimekeeping(RICH_CONTENT)
    expect(t.mechanism).toBe('pendulum')
    expect(t.hasAccuracyRating).toBe(true)
    expect(t.driftAmount).toBe(56)
  })

  it('detects async patterns', () => {
    const t = measureTimekeeping('export async function tick(): Promise<void> { await delay(1000); }')
    expect(t.hasProperCalibration).toBe(true)
    expect(t.hasSynchronization).toBe(true)
  })

  it('detects timers', () => {
    const t = measureTimekeeping('setTimeout(() => {}, 1000); setInterval(() => {}, 500);')
    expect(t.hasProperCalibration).toBe(true)
    expect(t.hasEpoch).toBe(true)
  })
})

// ─── measureBell ───────────────────────────────────────────────────────────

describe('measureBell', () => {
  it('returns silent for empty content', () => {
    const b = measureBell(EMPTY_CONTENT)
    expect(b.resonance).toBe(10)
    expect(b.tone).toBe('silent')
    expect(b.isClearTone).toBe(false)
    expect(b.hasNoCracks).toBe(true)
    expect(b.hasNoDampening).toBe(true)
    expect(b.hasProperStrike).toBe(false)
    expect(b.hasRinging).toBe(false)
    expect(b.crackCount).toBe(0)
  })

  it('detects proper strike in minimal', () => {
    const b = measureBell(MINIMAL_CONTENT)
    expect(b.hasProperAcoustics).toBe(true)
    expect(b.hasProperStrike).toBe(true)
    expect(b.hasNoCracks).toBe(true)
    expect(b.tone).toBe('silent')
  })

  it('returns tinny for rich content', () => {
    const b = measureBell(RICH_CONTENT)
    expect(b.tone).toBe('tinny')
    expect(b.hasRinging).toBe(true)
    expect(b.hasNoCracks).toBe(true)
  })

  it('counts cracks from smells', () => {
    const b = measureBell('console.log("x"); export function foo(): any { return null; }')
    expect(b.crackCount).toBeGreaterThan(0)
    expect(b.hasNoCracks).toBe(false)
  })
})

// ─── measureGear ───────────────────────────────────────────────────────────

describe('measureGear', () => {
  it('returns broken for empty content', () => {
    const g = measureGear(EMPTY_CONTENT)
    expect(g.precision).toBe(10)
    expect(g.type).toBe('broken')
    expect(g.isPrecise).toBe(false)
    expect(g.hasProperMeshing).toBe(false)
    expect(g.hasLowBacklash).toBe(true)
    expect(g.hasNoGrinding).toBe(true)
    expect(g.hasNoSlipping).toBe(true)
    expect(g.hasNoJamming).toBe(true)
    expect(g.slippingCount).toBe(0)
    expect(g.jammingCount).toBe(0)
  })

  it('detects smooth engagement in minimal', () => {
    const g = measureGear(MINIMAL_CONTENT)
    expect(g.hasSmoothEngagement).toBe(true)
    expect(g.hasProperRatio).toBe(true)
    expect(g.type).toBe('planetary')
  })

  it('returns spur for rich content', () => {
    const g = measureGear(RICH_CONTENT)
    expect(g.type).toBe('spur')
    expect(g.hasProperMeshing).toBe(true)
    expect(g.hasProperRatio).toBe(true)
  })

  it('counts slipping from todos', () => {
    const g = measureGear('// TODO: fix\nexport function foo(): void {}')
    expect(g.slippingCount).toBe(1)
    expect(g.hasNoSlipping).toBe(false)
  })
})

// ─── measureChime ──────────────────────────────────────────────────────────

describe('measureChime', () => {
  it('returns cacophony for empty content', () => {
    const c = measureChime(EMPTY_CONTENT)
    expect(c.pattern).toBe(10)
    expect(c.melody).toBe('cacophony')
    expect(c.hasRegularInterval).toBe(false)
    expect(c.hasProperSequence).toBe(false)
    expect(c.hasQuarterChime).toBe(false)
    expect(c.hasHourChime).toBe(false)
    expect(c.hasChimeCount).toBe(false)
    expect(c.hasSilentNight).toBe(false)
    expect(c.silentPeriodCount).toBe(0)
  })

  it('detects hour chime in minimal', () => {
    const c = measureChime(MINIMAL_CONTENT)
    expect(c.hasHourChime).toBe(true)
    expect(c.hasChimeCount).toBe(true)
    expect(c.hasDawnChorus).toBe(true)
    expect(c.silentPeriodCount).toBe(1)
    expect(c.melody).toBe('cacophony')
  })

  it('returns random for rich content', () => {
    const c = measureChime(RICH_CONTENT)
    expect(c.melody).toBe('random')
    expect(c.hasRegularInterval).toBe(true)
    expect(c.hasProperSequence).toBe(true)
    expect(c.hasQuarterChime).toBe(true)
    expect(c.hasSpecialOccasion).toBe(true)
    expect(c.hasMuffled).toBe(true)
  })
})

// ─── measureWinding ────────────────────────────────────────────────────────

describe('measureWinding', () => {
  it('returns unwound for empty content', () => {
    const w = measureWinding(EMPTY_CONTENT)
    expect(w.reliability).toBe(10)
    expect(w.method).toBe('unwound')
    expect(w.isRegularlyWound).toBe(false)
    expect(w.hasPowerReserve).toBe(false)
    expect(w.hasOverwindProtection).toBe(false)
    expect(w.hasMaintenance).toBe(false)
    expect(w.isFullyWound).toBe(false)
    expect(w.hasRunDown).toBe(false)
    expect(w.runDownCount).toBe(0)
  })

  it('detects self-winding in minimal', () => {
    const w = measureWinding(MINIMAL_CONTENT)
    expect(w.hasSelfWinding).toBe(true)
    expect(w.hasWearCompensation).toBe(true)
    expect(w.method).toBe('unwound')
  })

  it('returns spring for rich content', () => {
    const w = measureWinding(RICH_CONTENT)
    expect(w.method).toBe('spring')
    expect(w.isRegularlyWound).toBe(true)
    expect(w.hasMaintenance).toBe(true)
    expect(w.hasWearCompensation).toBe(true)
  })

  it('detects run down with todos', () => {
    const w = measureWinding('// TODO\n// TODO\n// TODO\nexport function foo(): void {}')
    expect(w.hasRunDown).toBe(true)
    expect(w.runDownCount).toBe(3)
  })
})

// ─── measureTower ──────────────────────────────────────────────────────────

describe('measureTower', () => {
  it('returns lean-to for empty content', () => {
    const t = measureTower(EMPTY_CONTENT)
    expect(t.stability).toBe(10)
    expect(t.construction).toBe('lean-to')
    expect(t.isStructurallySound).toBe(false)
    expect(t.hasProperFoundation).toBe(false)
    expect(t.hasReinforcement).toBe(false)
    expect(t.hasWeatherVane).toBe(false)
    expect(t.hasNoLean).toBe(true)
    expect(t.hasCracks).toBe(false)
    expect(t.crackCount).toBe(0)
  })

  it('detects weather vane in minimal', () => {
    const t = measureTower(MINIMAL_CONTENT)
    expect(t.hasWeatherVane).toBe(true)
    expect(t.hasBelfry).toBe(true)
    expect(t.construction).toBe('wood')
  })

  it('returns steel for rich content', () => {
    const t = measureTower(RICH_CONTENT)
    expect(t.construction).toBe('steel')
    expect(t.isStructurallySound).toBe(true)
    expect(t.hasProperFoundation).toBe(true)
    expect(t.hasReinforcement).toBe(true)
  })
})

// ─── classifyReadingCondition ──────────────────────────────────────────────

describe('classifyReadingCondition', () => {
  it('returns big-ben for 80+', () => { expect(classifyReadingCondition(80)).toBe('big-ben') })
  it('returns precision-clock for 65-79', () => { expect(classifyReadingCondition(65)).toBe('precision-clock') })
  it('returns village-clock for 50-64', () => { expect(classifyReadingCondition(50)).toBe('village-clock') })
  it('returns cuckoo-clock for 35-49', () => { expect(classifyReadingCondition(35)).toBe('cuckoo-clock') })
  it('returns broken-clock for 20-34', () => { expect(classifyReadingCondition(20)).toBe('broken-clock') })
  it('returns ruin for 0-19', () => { expect(classifyReadingCondition(10)).toBe('ruin') })
})

// ─── classifyHorologistGrade ───────────────────────────────────────────────

describe('classifyHorologistGrade', () => {
  it('returns master-horologist for 80+', () => { expect(classifyHorologistGrade(80)).toBe('master-horologist') })
  it('returns clockmaker for 65-79', () => { expect(classifyHorologistGrade(65)).toBe('clockmaker') })
  it('returns watchmaker for 50-64', () => { expect(classifyHorologistGrade(50)).toBe('watchmaker') })
  it('returns repairman for 35-49', () => { expect(classifyHorologistGrade(35)).toBe('repairman') })
  it('returns novice for 20-34', () => { expect(classifyHorologistGrade(20)).toBe('novice') })
  it('returns time-lost for 0-19', () => { expect(classifyHorologistGrade(10)).toBe('time-lost') })
})

// ─── classifyDistrictType ──────────────────────────────────────────────────

describe('classifyDistrictType', () => {
  it('returns ghost-town for empty', () => {
    expect(classifyDistrictType([])).toBe('ghost-town')
  })

  it('returns capital-district for high scores', () => {
    const reading = { qualityScore: 85, condition: 'big-ben' } as Partial<BellReading> as BellReading
    expect(classifyDistrictType([reading, reading])).toBe('capital-district')
  })
})

// ─── classifyDistrictCondition ─────────────────────────────────────────────

describe('classifyDistrictCondition', () => {
  it('returns master-clockmaker for 80+', () => { expect(classifyDistrictCondition(80)).toBe('master-clockmaker') })
  it('returns clockmaker for 65-79', () => { expect(classifyDistrictCondition(65)).toBe('clockmaker') })
  it('returns watchmaker for 50-64', () => { expect(classifyDistrictCondition(50)).toBe('watchmaker') })
  it('returns repair-shop for 35-49', () => { expect(classifyDistrictCondition(35)).toBe('repair-shop') })
  it('returns junk-shop for 20-34', () => { expect(classifyDistrictCondition(20)).toBe('junk-shop') })
  it('returns ruins for 0-19', () => { expect(classifyDistrictCondition(10)).toBe('ruins') })
})

// ─── analyzeBellReading ────────────────────────────────────────────────────

describe('analyzeBellReading', () => {
  it('returns ruin for empty content', () => {
    const r = analyzeBellReading(EMPTY_CONTENT, 'e.ts')
    expect(r.file).toBe('e.ts')
    expect(r.timeAccuracy).toBe(10)
    expect(r.bellResonance).toBe(10)
    expect(r.gearPrecision).toBe(10)
    expect(r.chimePattern).toBe(10)
    expect(r.windingReliability).toBe(10)
    expect(r.towerStability).toBe(10)
    expect(r.qualityScore).toBe(10)
    expect(r.condition).toBe('ruin')
  })

  it('returns ruin for minimal content', () => {
    const r = analyzeBellReading(MINIMAL_CONTENT, 'm.ts')
    expect(r.qualityScore).toBe(13)
    expect(r.condition).toBe('ruin')
  })

  it('returns cuckoo-clock for rich content', () => {
    const r = analyzeBellReading(RICH_CONTENT, 'r.ts')
    expect(r.qualityScore).toBe(40)
    expect(r.condition).toBe('cuckoo-clock')
  })
})

// ─── analyzeClockDistrict ──────────────────────────────────────────────────

describe('analyzeClockDistrict', () => {
  it('returns empty district for no readings', () => {
    const d = analyzeClockDistrict([], 'empty')
    expect(d.directory).toBe('empty')
    expect(d.readings).toHaveLength(0)
    expect(d.avgTimeAccuracy).toBe(0)
    expect(d.avgBellResonance).toBe(0)
    expect(d.avgTowerStability).toBe(0)
    expect(d.bigBenCount).toBe(0)
    expect(d.ruinCount).toBe(0)
    expect(d.preciseCount).toBe(0)
    expect(d.woundCount).toBe(0)
    expect(d.districtType).toBe('ghost-town')
    expect(d.condition).toBe('ruins')
  })

  it('aggregates multiple readings', () => {
    const r1 = analyzeBellReading(EMPTY_CONTENT, 'a.ts')
    const r2 = analyzeBellReading(MINIMAL_CONTENT, 'b.ts')
    const d = analyzeClockDistrict([r1, r2], 'src')
    expect(d.directory).toBe('src')
    expect(d.readings).toHaveLength(2)
    expect(d.ruinCount).toBe(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns specific recommendations for imperfect readings', () => {
    const reading = analyzeBellReading(RICH_CONTENT, 'clean.ts')
    const district = analyzeClockDistrict([reading], 'src')
    const guild = { avgTimeAccuracy: 40, avgBellResonance: 30, avgTowerStability: 58, isPrecise: false, overallTiming: 40 }
    const stats = { overallTiming: 40, horologistGrade: 'repairman' as const, totalFiles: 1, totalDistricts: 1, avgTimeAccuracy: 40, avgBellResonance: 30, avgGearPrecision: 46, avgChimePattern: 30, avgWindingReliability: 31, avgTowerStability: 58, bigBenCount: 0, precisionClockCount: 0, villageClockCount: 0, cuckooClockCount: 1, brokenClockCount: 0, ruinCount: 0, isPreciseCount: 0, hasSynchronizationCount: 0, isClearToneCount: 0, hasNoCracksCount: 1, hasProperMeshingCount: 1, hasNoSlippingCount: 1, hasRegularIntervalCount: 1, isRegularlyWoundCount: 1, isStructurallySoundCount: 1, hasNoLeanCount: 1, bestReading: 'clean.ts', mostAccurate: 'clean.ts', clearestBell: 'clean.ts', mostPreciseGear: 'clean.ts', mostStableTower: 'clean.ts' }
    const recs = generateRecommendations([reading], [district], guild, stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns multiple recommendations for dirty readings', () => {
    const dirty = '// TODO: fix\nconsole.log("x");\nexport function foo(): any { return null; }'
    const reading = analyzeBellReading(dirty, 'messy.ts')
    const district = analyzeClockDistrict([reading], 'src')
    const guild = { avgTimeAccuracy: 10, avgBellResonance: 10, avgTowerStability: 10, isPrecise: false, overallTiming: 10 }
    const stats = { overallTiming: 10, horologistGrade: 'time-lost' as const, totalFiles: 1, totalDistricts: 1, avgTimeAccuracy: 10, avgBellResonance: 10, avgGearPrecision: 10, avgChimePattern: 10, avgWindingReliability: 10, avgTowerStability: 10, bigBenCount: 0, precisionClockCount: 0, villageClockCount: 0, cuckooClockCount: 0, brokenClockCount: 0, ruinCount: 1, isPreciseCount: 0, hasSynchronizationCount: 0, isClearToneCount: 0, hasNoCracksCount: 0, hasProperMeshingCount: 0, hasNoSlippingCount: 0, hasRegularIntervalCount: 0, isRegularlyWoundCount: 0, isStructurallySoundCount: 0, hasNoLeanCount: 1, bestReading: 'messy.ts', mostAccurate: 'messy.ts', clearestBell: 'messy.ts', mostPreciseGear: 'messy.ts', mostStableTower: 'messy.ts' }
    const recs = generateRecommendations([reading], [district], guild, stats)
    expect(recs.length).toBeGreaterThan(1)
  })
})

// ─── buildClockTowerBellResult ─────────────────────────────────────────────

describe('buildClockTowerBellResult', () => {
  it('returns empty result for no files', () => {
    const r = buildClockTowerBellResult([], [])
    expect(r.readings).toHaveLength(0)
    expect(r.districts).toHaveLength(0)
    expect(r.guild.avgTimeAccuracy).toBe(0)
    expect(r.guild.overallTiming).toBe(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.horologistGrade).toBe('time-lost')
  })

  it('computes correct stats for mixed content', () => {
    const r = buildClockTowerBellResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(r.readings).toHaveLength(2)
    expect(r.guild.overallTiming).toBe(12)
    expect(r.stats.horologistGrade).toBe('time-lost')
    expect(r.stats.avgTimeAccuracy).toBe(9)
    expect(r.stats.avgBellResonance).toBe(11)
    expect(r.stats.avgGearPrecision).toBe(14)
    expect(r.stats.avgChimePattern).toBe(13)
    expect(r.stats.avgWindingReliability).toBe(10)
    expect(r.stats.avgTowerStability).toBe(13)
    expect(r.stats.hasNoCracksCount).toBe(2)
    expect(r.stats.hasNoSlippingCount).toBe(2)
    expect(r.stats.hasNoLeanCount).toBe(2)
    expect(r.stats.bestReading).toBe('b.ts')
    expect(r.stats.mostAccurate).toBe('a.ts')
  })

  it('groups files by directory', () => {
    const r = buildClockTowerBellResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [MINIMAL_CONTENT, MINIMAL_CONTENT, MINIMAL_CONTENT],
    )
    expect(r.districts).toHaveLength(2)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    for (const c of ['big-ben', 'precision-clock', 'village-clock', 'cuckoo-clock', 'broken-clock', 'ruin'] as const) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('mechanismColor returns string for all mechanisms', () => {
    for (const m of ['atomic', 'quartz', 'mechanical', 'pendulum', 'water-clock', 'sundial'] as const) {
      expect(typeof mechanismColor(m)).toBe('string')
    }
  })

  it('toneColor returns string for all tones', () => {
    for (const t of ['deep-bass', 'tenor', 'alto', 'soprano', 'tinny', 'silent'] as const) {
      expect(typeof toneColor(t)).toBe('string')
    }
  })

  it('gearTypeColor returns string for all types', () => {
    for (const t of ['escapement', 'crown', 'spur', 'worm', 'planetary', 'broken'] as const) {
      expect(typeof gearTypeColor(t)).toBe('string')
    }
  })

  it('melodyColor returns string for all melodies', () => {
    for (const m of ['westminster', 'whittington', 'st-michaels', 'custom', 'random', 'cacophony'] as const) {
      expect(typeof melodyColor(m)).toBe('string')
    }
  })

  it('windingMethodColor returns string for all methods', () => {
    for (const m of ['automatic', 'manual', 'electric', 'gravity', 'spring', 'unwound'] as const) {
      expect(typeof windingMethodColor(m)).toBe('string')
    }
  })

  it('constructionColor returns string for all constructions', () => {
    for (const c of ['stone', 'brick', 'steel', 'concrete', 'wood', 'lean-to'] as const) {
      expect(typeof constructionColor(c)).toBe('string')
    }
  })

  it('horologistGradeColor returns string for all grades', () => {
    for (const g of ['master-horologist', 'clockmaker', 'watchmaker', 'repairman', 'novice', 'time-lost'] as const) {
      expect(typeof horologistGradeColor(g)).toBe('string')
    }
  })

  it('districtCondColor returns string for all conditions', () => {
    for (const c of ['master-clockmaker', 'clockmaker', 'watchmaker', 'repair-shop', 'junk-shop', 'ruins'] as const) {
      expect(typeof districtCondColor(c)).toBe('string')
    }
  })
})

// ─── Format Reading ────────────────────────────────────────────────────────

describe('formatReading', () => {
  it('formats a reading non-verbose', () => {
    const r = analyzeBellReading(MINIMAL_CONTENT, 'm.ts')
    const out = formatReading(r, false)
    expect(out).toContain('m.ts')
    expect(out).toContain('ruin')
  })

  it('includes warnings in verbose mode', () => {
    const dirty = 'console.log("x");\nexport function foo(): any { return null; }'
    const r = analyzeBellReading(dirty, 'messy.ts')
    const out = formatReading(r, true)
    expect(out).toContain('messy.ts')
  })
})

// ─── Format District ───────────────────────────────────────────────────────

describe('formatDistrict', () => {
  it('formats a district non-verbose', () => {
    const r = analyzeBellReading(RICH_CONTENT, 'r.ts')
    const d = analyzeClockDistrict([r], 'src')
    const out = formatDistrict(d, false)
    expect(out).toContain('src')
    expect(out).toContain('Avg Time')
  })

  it('includes readings in verbose mode', () => {
    const r = analyzeBellReading(RICH_CONTENT, 'r.ts')
    const d = analyzeClockDistrict([r], 'src')
    const out = formatDistrict(d, true)
    expect(out).toContain('r.ts')
  })
})

// ─── Format Stats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats with key metrics', () => {
    const r = buildClockTowerBellResult(['a.ts'], [MINIMAL_CONTENT])
    const out = formatStats(r.stats)
    expect(out).toContain('Clock Tower Bell Statistics')
    expect(out).toContain('Overall Timing')
    expect(out).toContain('Horologist')
  })
})

// ─── Format Table ──────────────────────────────────────────────────────────

describe('formatClockTowerBellTable', () => {
  it('formats full table', () => {
    const r = buildClockTowerBellResult(['a.ts'], [RICH_CONTENT])
    const out = formatClockTowerBellTable(r, false)
    expect(out).toContain('Clock Tower Bell Analysis')
    expect(out).toContain('Bell Readings')
  })

  it('includes recommendations', () => {
    const r = buildClockTowerBellResult(['a.ts'], [RICH_CONTENT])
    const out = formatClockTowerBellTable(r, false)
    expect(out).toContain('Recommendations')
  })
})

// ─── Format JSON ───────────────────────────────────────────────────────────

describe('formatClockTowerBellJson', () => {
  it('returns valid JSON', () => {
    const r = buildClockTowerBellResult(['a.ts'], [MINIMAL_CONTENT])
    const out = formatClockTowerBellJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.guild).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
