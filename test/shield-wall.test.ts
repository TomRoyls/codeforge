import { describe, expect, it } from 'vitest'

import {
  analyzeShieldBearer,
  analyzeWallSegment,
  buildShieldWallResult,
  classifyCommanderGrade,
  classifyCondition,
  classifySegmentCondition,
  classifySegmentType,
  generateRecommendations,
  measureCoordination,
  measureFormation,
  measureOverlap,
  measureReadiness,
  measureResilience,
  measureShield,
} from '../src/commands/shield-wall-helpers.js'
import {
  conditionColor,
  formatShieldWallJson,
  formatShieldWallTable,
  gradeColor,
  materialColor,
  scoreColor,
  stateColor,
} from '../src/commands/shield-wall-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `export interface Item { name: string; value: number }
export type ItemMap = Record<string, Item>
export enum Status { Active = 'active', Inactive = 'inactive' }
export class Container<T> { private items: T[] = []; protected backup: T[] = []; add(item: T): void { this.items.push(item) } remove(index: number): T { return this.items.splice(index, 1)[0] } }
export function processItems(items: Item[]): ItemMap { const result: ItemMap = {}; for (const item of items) { result[item.name] = item } return result }
export const createItem = (name: string, value: number): Item => ({ name, value })
export async function fetchItems(): Promise<Item[]> { try { const data = await Promise.resolve([{ name: 'test', value: 1 }]); return data } catch { console.error('Failed'); return [] } }
export { Container, processItems }
/** Documentation block */ export function documented(): void { if (true) { if (true) { if (true) { console.error('deep') } } } }
`

const EMPTY = ''

const MEDIUM = `export class Simple { getName(): string { return 'test' } }
export function helper(): void { console.log('debug') }`

// ─── measureShield ──────────────────────────────────────────────────────────

describe('measureShield', () => {
  it('RICH: returns correct strength and material', () => {
    const result = measureShield(RICH)
    expect(result.strength).toBe(82)
    expect(result.material).toBe('oak')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureShield(RICH)
    expect(result.hasHighStrength).toBe(true)
    expect(result.hasProperThickness).toBe(true)
    expect(result.hasNoWeakPoints).toBe(false)
    expect(result.hasProperBoss).toBe(true)
    expect(result.hasReinforcedEdge).toBe(true)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasProperWeight).toBe(false)
    expect(result.hasNoRusting).toBe(false)
    expect(result.hasImpactResistance).toBe(true)
    expect(result.hasNoDenting).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureShield(RICH)
    expect(result.crackCount).toBe(2)
    expect(result.rustingCount).toBe(3)
  })

  it('EMPTY: returns correct strength and material', () => {
    const result = measureShield(EMPTY)
    expect(result.strength).toBe(38)
    expect(result.material).toBe('wicker')
  })

  it('EMPTY: returns correct booleans', () => {
    const result = measureShield(EMPTY)
    expect(result.hasNoWeakPoints).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasNoRusting).toBe(true)
  })

  it('MEDIUM: returns correct strength and material', () => {
    const result = measureShield(MEDIUM)
    expect(result.strength).toBe(63)
    expect(result.material).toBe('wicker')
    expect(result.crackCount).toBe(1)
  })
})

// ─── measureOverlap ─────────────────────────────────────────────────────────

describe('measureOverlap', () => {
  it('RICH: returns correct coverage and quality', () => {
    const result = measureOverlap(RICH)
    expect(result.coverage).toBe(95)
    expect(result.quality).toBe('minimal-overlap')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureOverlap(RICH)
    expect(result.hasProperOverlap).toBe(true)
    expect(result.hasNoGaps).toBe(false)
    expect(result.hasInterlocking).toBe(true)
    expect(result.hasProperSealing).toBe(true)
    expect(result.hasNoBlindSpots).toBe(false)
    expect(result.hasLayered).toBe(true)
    expect(result.hasNoPenetration).toBe(false)
    expect(result.hasProperEdge).toBe(true)
    expect(result.hasNoUnderlap).toBe(false)
    expect(result.hasComplete).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureOverlap(RICH)
    expect(result.gapCount).toBe(2)
    expect(result.penetrationCount).toBe(2)
  })

  it('EMPTY: returns correct coverage and quality', () => {
    const result = measureOverlap(EMPTY)
    expect(result.coverage).toBe(30)
    expect(result.quality).toBe('no-coverage')
  })

  it('MEDIUM: returns correct values', () => {
    const result = measureOverlap(MEDIUM)
    expect(result.coverage).toBe(55)
    expect(result.quality).toBe('wide-gap')
    expect(result.gapCount).toBe(1)
  })
})

// ─── measureFormation ───────────────────────────────────────────────────────

describe('measureFormation', () => {
  it('RICH: returns correct integrity and type', () => {
    const result = measureFormation(RICH)
    expect(result.integrity).toBe(85)
    expect(result.type).toBe('shield-wall')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureFormation(RICH)
    expect(result.hasHighIntegrity).toBe(true)
    expect(result.hasProperAlignment).toBe(true)
    expect(result.hasNoBreakInLine).toBe(false)
    expect(result.hasProperSpacing).toBe(false)
    expect(result.hasDiscipline).toBe(true)
    expect(result.hasNoRogueElements).toBe(false)
    expect(result.hasProperDepth).toBe(true)
    expect(result.hasNoFlanks).toBe(false)
    expect(result.hasUnified).toBe(true)
    expect(result.hasNoFragmentation).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureFormation(RICH)
    expect(result.breakCount).toBe(2)
    expect(result.flankCount).toBe(2)
  })

  it('EMPTY: returns correct integrity and type', () => {
    const result = measureFormation(EMPTY)
    expect(result.integrity).toBe(39)
    expect(result.type).toBe('skirmish')
  })

  it('MEDIUM: returns correct integrity and type', () => {
    const result = measureFormation(MEDIUM)
    expect(result.integrity).toBe(62)
    expect(result.type).toBe('skirmish')
  })
})

// ─── measureCoordination ────────────────────────────────────────────────────

describe('measureCoordination', () => {
  it('RICH: returns correct level and style', () => {
    const result = measureCoordination(RICH)
    expect(result.level).toBe(90)
    expect(result.style).toBe('coordinated')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureCoordination(RICH)
    expect(result.hasHighCoordination).toBe(true)
    expect(result.hasProperTiming).toBe(true)
    expect(result.hasSignalResponse).toBe(true)
    expect(result.hasNoMiscommunication).toBe(true)
    expect(result.hasProperHandoff).toBe(true)
    expect(result.hasNoCollision).toBe(true)
    expect(result.hasSeamlessIntegration).toBe(true)
    expect(result.hasNoInterference).toBe(false)
    expect(result.hasProperProtocol).toBe(false)
    expect(result.hasNoDeadlock).toBe(false)
  })

  it('RICH: returns correct counters', () => {
    const result = measureCoordination(RICH)
    expect(result.collisionCount).toBe(0)
    expect(result.deadlockCount).toBe(2)
  })

  it('EMPTY: returns correct level and style', () => {
    const result = measureCoordination(EMPTY)
    expect(result.level).toBe(30)
    expect(result.style).toBe('chaotic')
  })

  it('MEDIUM: returns correct values', () => {
    const result = measureCoordination(MEDIUM)
    expect(result.level).toBe(52)
    expect(result.style).toBe('confused')
  })
})

// ─── measureReadiness ───────────────────────────────────────────────────────

describe('measureReadiness', () => {
  it('RICH: returns correct level and state', () => {
    const result = measureReadiness(RICH)
    expect(result.level).toBe(85)
    expect(result.state).toBe('prepared')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureReadiness(RICH)
    expect(result.hasHighReadiness).toBe(true)
    expect(result.hasProperArmor).toBe(true)
    expect(result.hasNoExposedFlanks).toBe(false)
    expect(result.hasProperTraining).toBe(true)
    expect(result.hasNoRust).toBe(true)
    expect(result.hasQuickResponse).toBe(true)
    expect(result.hasNoSurprise).toBe(false)
    expect(result.hasProperEquipment).toBe(false)
    expect(result.hasNoFatigue).toBe(true)
    expect(result.hasReserves).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureReadiness(RICH)
    expect(result.exposedCount).toBe(2)
    expect(result.fatigueCount).toBe(0)
  })

  it('EMPTY: returns correct level and state', () => {
    const result = measureReadiness(EMPTY)
    expect(result.level).toBe(44)
    expect(result.state).toBe('unprepared')
  })

  it('MEDIUM: returns correct values', () => {
    const result = measureReadiness(MEDIUM)
    expect(result.level).toBe(67)
    expect(result.state).toBe('unprepared')
    expect(result.exposedCount).toBe(1)
  })
})

// ─── measureResilience ──────────────────────────────────────────────────────

describe('measureResilience', () => {
  it('RICH: returns correct score and grade', () => {
    const result = measureResilience(RICH)
    expect(result.score).toBe(85)
    expect(result.grade).toBe('legionary')
  })

  it('RICH: returns correct booleans', () => {
    const result = measureResilience(RICH)
    expect(result.hasHighResilience).toBe(true)
    expect(result.hasEndurance).toBe(true)
    expect(result.hasNoBreaking).toBe(true)
    expect(result.hasRecovery).toBe(true)
    expect(result.hasNoSurrender).toBe(false)
    expect(result.hasMoralStrength).toBe(true)
    expect(result.hasNoDesertion).toBe(false)
    expect(result.hasFightingSpirit).toBe(true)
    expect(result.hasNoFatigue).toBe(false)
    expect(result.hasLastStand).toBe(true)
  })

  it('RICH: returns correct counters', () => {
    const result = measureResilience(RICH)
    expect(result.breakingCount).toBe(0)
    expect(result.desertionCount).toBe(2)
  })

  it('EMPTY: returns correct score and grade', () => {
    const result = measureResilience(EMPTY)
    expect(result.score).toBe(40)
    expect(result.grade).toBe('conscript')
  })

  it('MEDIUM: returns correct score and grade', () => {
    const result = measureResilience(MEDIUM)
    expect(result.score).toBe(65)
    expect(result.grade).toBe('conscript')
  })
})

// ─── analyzeShieldBearer ────────────────────────────────────────────────────

describe('analyzeShieldBearer', () => {
  it('RICH: returns correct quality score and condition', () => {
    const bearer = analyzeShieldBearer(RICH, 'test.ts')
    expect(bearer.qualityScore).toBe(87)
    expect(bearer.condition).toBe('spartan-hoplon')
    expect(bearer.file).toBe('test.ts')
  })

  it('RICH: returns correct measure scores', () => {
    const bearer = analyzeShieldBearer(RICH, 'test.ts')
    expect(bearer.shieldStrength).toBe(82)
    expect(bearer.overlapCoverage).toBe(95)
    expect(bearer.formationIntegrity).toBe(85)
    expect(bearer.spearCoordination).toBe(90)
    expect(bearer.battleReadiness).toBe(85)
    expect(bearer.wallResilience).toBe(85)
  })

  it('EMPTY: returns correct quality score and condition', () => {
    const bearer = analyzeShieldBearer(EMPTY, 'empty.ts')
    expect(bearer.qualityScore).toBe(37)
    expect(bearer.condition).toBe('kite-shield')
  })

  it('MEDIUM: returns correct quality score and condition', () => {
    const bearer = analyzeShieldBearer(MEDIUM, 'medium.ts')
    expect(bearer.qualityScore).toBe(60)
    expect(bearer.condition).toBe('viking-round')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies spartan-hoplon at 80+', () => {
    const b = { qualityScore: 85, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('spartan-hoplon')
  })
  it('classifies roman-scutum at 65-79', () => {
    const b = { qualityScore: 70, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('roman-scutum')
  })
  it('classifies viking-round at 50-64', () => {
    const b = { qualityScore: 55, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('viking-round')
  })
  it('classifies kite-shield at 35-49', () => {
    const b = { qualityScore: 40, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('kite-shield')
  })
  it('classifies buckler at 20-34', () => {
    const b = { qualityScore: 25, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('buckler')
  })
  it('classifies broken-board below 20', () => {
    const b = { qualityScore: 10, condition: 'broken-board' } as ReturnType<typeof analyzeShieldBearer>
    expect(classifyCondition(b)).toBe('broken-board')
  })
})

// ─── classifySegmentType ────────────────────────────────────────────────────

describe('classifySegmentType', () => {
  it('returns broken-ranks for empty array', () => {
    expect(classifySegmentType([])).toBe('broken-ranks')
  })
  it('returns phalanx for high avg with 30%+ spartan-hoplon', () => {
    const bearers = [
      { qualityScore: 85, condition: 'spartan-hoplon' },
      { qualityScore: 85, condition: 'spartan-hoplon' },
      { qualityScore: 80, condition: 'spartan-hoplon' },
    ] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('phalanx')
  })
  it('returns shield-wall for avg 60+', () => {
    const bearers = [{ qualityScore: 60, condition: 'viking-round' }] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('shield-wall')
  })
  it('returns shield-burh for avg 45+', () => {
    const bearers = [{ qualityScore: 45, condition: 'kite-shield' }] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('shield-burh')
  })
  it('returns shield-ring for avg 30+', () => {
    const bearers = [{ qualityScore: 35, condition: 'kite-shield' }] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('shield-ring')
  })
  it('returns skirmish-line for avg 15+', () => {
    const bearers = [{ qualityScore: 20, condition: 'buckler' }] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('skirmish-line')
  })
  it('returns broken-ranks for avg below 15', () => {
    const bearers = [{ qualityScore: 10, condition: 'broken-board' }] as ReturnType<typeof analyzeShieldBearer>[]
    expect(classifySegmentType(bearers)).toBe('broken-ranks')
  })
})

// ─── classifySegmentCondition ───────────────────────────────────────────────

describe('classifySegmentCondition', () => {
  it('returns spartan-phalanx at 80+', () => { expect(classifySegmentCondition(85)).toBe('spartan-phalanx') })
  it('returns roman-legion at 65+', () => { expect(classifySegmentCondition(70)).toBe('roman-legion') })
  it('returns viking-shieldwall at 50+', () => { expect(classifySegmentCondition(55)).toBe('viking-shieldwall') })
  it('returns medieval-battle at 35+', () => { expect(classifySegmentCondition(40)).toBe('medieval-battle') })
  it('returns peasant-militia at 20+', () => { expect(classifySegmentCondition(25)).toBe('peasant-militia') })
  it('returns routed-army below 20', () => { expect(classifySegmentCondition(10)).toBe('routed-army') })
})

// ─── classifyCommanderGrade ─────────────────────────────────────────────────

describe('classifyCommanderGrade', () => {
  it('returns strategos at 80+', () => { expect(classifyCommanderGrade(85)).toBe('strategos') })
  it('returns centurion at 65+', () => { expect(classifyCommanderGrade(70)).toBe('centurion') })
  it('returns shield-maiden at 50+', () => { expect(classifyCommanderGrade(55)).toBe('shield-maiden') })
  it('returns knight at 35+', () => { expect(classifyCommanderGrade(40)).toBe('knight') })
  it('returns militia-captain at 20+', () => { expect(classifyCommanderGrade(25)).toBe('militia-captain') })
  it('returns coward below 20', () => { expect(classifyCommanderGrade(10)).toBe('coward') })
})

// ─── analyzeWallSegment ─────────────────────────────────────────────────────

describe('analyzeWallSegment', () => {
  it('returns empty segment for no bearers', () => {
    const seg = analyzeWallSegment([], '.')
    expect(seg.bearers).toEqual([])
    expect(seg.segmentType).toBe('broken-ranks')
    expect(seg.condition).toBe('routed-army')
    expect(seg.avgStrength).toBe(0)
    expect(seg.avgCoverage).toBe(0)
    expect(seg.avgReadiness).toBe(0)
  })

  it('returns correct segment for RICH bearers', () => {
    const bearer = analyzeShieldBearer(RICH, 'test.ts')
    const seg = analyzeWallSegment([bearer], 'src')
    expect(seg.avgStrength).toBe(82)
    expect(seg.avgCoverage).toBe(95)
    expect(seg.avgReadiness).toBe(85)
    expect(seg.spartanCount).toBe(1)
    expect(seg.brokenCount).toBe(0)
    expect(seg.strongCount).toBe(1)
    expect(seg.readyCount).toBe(1)
    expect(seg.segmentType).toBe('phalanx')
    expect(seg.condition).toBe('spartan-phalanx')
  })
})

// ─── buildShieldWallResult ──────────────────────────────────────────────────

describe('buildShieldWallResult', () => {
  it('RICH: returns correct army', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    expect(result.army.overallDefense).toBe(87)
    expect(result.army.avgStrength).toBe(82)
    expect(result.army.avgCoverage).toBe(95)
    expect(result.army.avgReadiness).toBe(85)
    expect(result.army.isImpenetrable).toBe(true)
  })

  it('RICH: returns correct stats', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalSegments).toBe(1)
    expect(result.stats.avgShieldStrength).toBe(82)
    expect(result.stats.avgOverlapCoverage).toBe(95)
    expect(result.stats.avgFormationIntegrity).toBe(85)
    expect(result.stats.avgSpearCoordination).toBe(90)
    expect(result.stats.avgBattleReadiness).toBe(85)
    expect(result.stats.avgWallResilience).toBe(85)
    expect(result.stats.spartanHoplonCount).toBe(1)
    expect(result.stats.commanderGrade).toBe('strategos')
    expect(result.stats.bestBearer).toBe('test.ts')
    expect(result.stats.strongest).toBe('test.ts')
    expect(result.stats.bestCovered).toBe('test.ts')
    expect(result.stats.bestFormation).toBe('test.ts')
    expect(result.stats.mostCoordinated).toBe('test.ts')
    expect(result.stats.mostReady).toBe('test.ts')
  })

  it('RICH: returns impenetrable recommendations', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Impenetrable shield wall achieved — your army is ready for any siege',
    ])
  })

  it('EMPTY: returns correct army', () => {
    const result = buildShieldWallResult(['empty.ts'], [EMPTY])
    expect(result.army.overallDefense).toBe(37)
    expect(result.army.isImpenetrable).toBe(false)
  })

  it('EMPTY: returns correct stats', () => {
    const result = buildShieldWallResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgOverlapCoverage).toBe(30)
    expect(result.stats.kiteShieldCount).toBe(1)
    expect(result.stats.commanderGrade).toBe('knight')
  })

  it('EMPTY: returns improvement recommendations', () => {
    const result = buildShieldWallResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBe(8)
    expect(result.recommendations[0]).toContain('Strengthen')
    expect(result.recommendations[6]).toContain('spartan-grade')
  })

  it('MIXED: returns correct blended army', () => {
    const result = buildShieldWallResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.army.overallDefense).toBe(61)
    expect(result.army.isImpenetrable).toBe(false)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.spartanHoplonCount).toBe(1)
    expect(result.stats.vikingRoundCount).toBe(1)
    expect(result.stats.kiteShieldCount).toBe(1)
    expect(result.stats.commanderGrade).toBe('shield-maiden')
  })

  it('MIXED: groups files into segments', () => {
    const result = buildShieldWallResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.segments.length).toBe(1)
    expect(result.segments[0].segmentType).toBe('shield-wall')
    expect(result.segments[0].condition).toBe('viking-shieldwall')
  })

  it('handles empty input arrays', () => {
    const result = buildShieldWallResult([], [])
    expect(result.bearers).toEqual([])
    expect(result.segments).toEqual([])
    expect(result.army.overallDefense).toBe(0)
    expect(result.army.isImpenetrable).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestBearer).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns impenetrable message when all is good', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const recs = generateRecommendations(result.bearers, result.segments, result.army, result.stats)
    expect(recs).toContain('Impenetrable shield wall achieved — your army is ready for any siege')
  })

  it('returns improvement recs for low scores', () => {
    const result = buildShieldWallResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    expect(typeof conditionColor('spartan-hoplon')).toBe('string')
    expect(typeof conditionColor('roman-scutum')).toBe('string')
    expect(typeof conditionColor('viking-round')).toBe('string')
    expect(typeof conditionColor('kite-shield')).toBe('string')
    expect(typeof conditionColor('buckler')).toBe('string')
    expect(typeof conditionColor('broken-board')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor returns string for all grades', () => {
    expect(typeof gradeColor('strategos')).toBe('string')
    expect(typeof gradeColor('centurion')).toBe('string')
    expect(typeof gradeColor('shield-maiden')).toBe('string')
    expect(typeof gradeColor('knight')).toBe('string')
    expect(typeof gradeColor('militia-captain')).toBe('string')
    expect(typeof gradeColor('coward')).toBe('string')
  })

  it('materialColor returns string for all materials', () => {
    expect(typeof materialColor('iron')).toBe('string')
    expect(typeof materialColor('bronze')).toBe('string')
    expect(typeof materialColor('oak')).toBe('string')
    expect(typeof materialColor('leather')).toBe('string')
    expect(typeof materialColor('wicker')).toBe('string')
    expect(typeof materialColor('paper')).toBe('string')
  })

  it('stateColor returns string for all states', () => {
    expect(typeof stateColor('battle-ready')).toBe('string')
    expect(typeof stateColor('well-prepared')).toBe('string')
    expect(typeof stateColor('prepared')).toBe('string')
    expect(typeof stateColor('under-prepared')).toBe('string')
    expect(typeof stateColor('unprepared')).toBe('string')
    expect(typeof stateColor('defenseless')).toBe('string')
  })

  it('formatShieldWallJson returns valid JSON', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const json = formatShieldWallJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.army.overallDefense).toBe(87)
  })

  it('formatShieldWallTable returns string with header', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const table = formatShieldWallTable(result, false)
    expect(table).toContain('Shield Wall Analysis')
    expect(table).toContain('Army Overview')
    expect(table).toContain('Statistics')
  })

  it('formatShieldWallTable with verbose shows per-file details', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const table = formatShieldWallTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('formatShieldWallTable shows recommendations', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const table = formatShieldWallTable(result, false)
    expect(table).toContain('Recommendations')
    expect(table).toContain('Impenetrable')
  })

  it('formatShieldWallTable shows highlights', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const table = formatShieldWallTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Bearer')
    expect(table).toContain('Strongest')
    expect(table).toContain('Most Ready')
  })

  it('formatShieldWallTable shows condition counts', () => {
    const result = buildShieldWallResult(['test.ts'], [RICH])
    const table = formatShieldWallTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Spartan Hoplon')
    expect(table).toContain('Broken Board')
  })
})
