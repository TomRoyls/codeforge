import { describe, it, expect } from 'vitest'
import {
  measureReigning,
  measureEnduring,
  measureLearning,
  measureCommanding,
  measureDistributing,
  classifySeatCondition,
  classifyRoomType,
  classifyRoomCondition,
  classifyRulerGrade,
  analyzeEmberSeat,
  analyzeThroneRoom,
  buildEmberThroneResult,
  generateRecommendations,
} from '../src/commands/ember-throne-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSeatTable,
  formatSeatsTable,
  formatRoomTable,
  formatRoomsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/ember-throne-format-helpers.js'
import type {
  EmberSeat,
  EmberThroneStats,
  EmberThroneResult,
  KingdomSummary,
} from '../src/commands/ember-throne-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureReigning ──────────────────────────────────────────────

describe('measureReigning', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureReigning(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-seat')
    expect(m.hasHighQuality).toBe(false)
  })

  it('returns low quality for minimal content', () => {
    const m = measureReigning(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasNoGodObjects).toBe(true)
    expect(m.hasNoAmbiguous).toBe(true)
  })

  it('detects authoritative patterns in rich content', () => {
    const m = measureReigning(richContent)
    expect(m.hasAuthoritative).toBe(true)
    expect(m.hasSingleResponsibility).toBe(true)
    expect(m.hasClearOwnership).toBe(true)
  })

  it('detects god objects in poor content', () => {
    const m = measureReigning(poorContent)
    expect(m.godObjectCount).toBeGreaterThan(0)
    expect(m.hasNoGodObjects).toBe(false)
    expect(m.ambiguousCount).toBeGreaterThan(0)
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('detects commanding patterns in rich content', () => {
    const m = measureReigning(richContent)
    expect(m.hasCommanding).toBe(true)
    expect(m.hasPurposeful).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureReigning(richContent).grade).not.toBe('no-seat')
    expect(measureReigning(emptyContent).grade).toBe('no-seat')
  })

  it('has quality capped at 100', () => {
    const m = measureReigning(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnduring ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 endurance for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.endurance).toBe(0)
    expect(m.coal).toBe('cold-ash')
    expect(m.hasHighEndurance).toBe(false)
  })

  it('detects sustainable patterns in rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasSustainable).toBe(true)
    expect(m.hasMaintainable).toBe(true)
    expect(m.hasDocumented).toBe(true)
  })

  it('detects tested patterns in rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasVersioned).toBe(true)
  })

  it('detects short-lived patterns in poor content', () => {
    const m = measureEnduring(poorContent)
    expect(m.shortLivedCount).toBeGreaterThan(0)
    expect(m.hasNoShortLived).toBe(false)
    expect(m.disposableCount).toBeGreaterThan(0)
    expect(m.hasNoDisposable).toBe(false)
  })

  it('classifies coal grade correctly', () => {
    expect(measureEnduring(emptyContent).coal).toBe('cold-ash')
    expect(measureEnduring(richContent).coal).not.toBe('cold-ash')
  })

  it('has endurance capped at 100', () => {
    const m = measureEnduring(richContent)
    expect(m.endurance).toBeLessThanOrEqual(100)
  })
})

// ─── measureLearning ──────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns 0 wisdom for empty content', () => {
    const m = measureLearning(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.ash).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('detects error learning in rich content', () => {
    const m = measureLearning(richContent)
    expect(m.hasErrorLearning).toBe(true)
    expect(m.hasRetryLogic).toBe(true)
    expect(m.hasImprovement).toBe(true)
  })

  it('detects adaptive patterns in rich content', () => {
    const m = measureLearning(richContent)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasProgressive).toBe(true)
  })

  it('detects repeated mistakes in poor content', () => {
    const m = measureLearning(poorContent)
    expect(m.repeatedMistakesCount).toBeGreaterThan(0)
    expect(m.hasNoRepeatedMistakes).toBe(false)
    expect(m.stagnationCount).toBeGreaterThan(0)
    expect(m.hasNoStagnation).toBe(false)
  })

  it('classifies ash grade correctly', () => {
    expect(measureLearning(emptyContent).ash).toBe('no-wisdom')
    expect(measureLearning(richContent).ash).not.toBe('no-wisdom')
  })

  it('has wisdom capped at 100', () => {
    const m = measureLearning(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── measureCommanding ────────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns 0 authority for empty content', () => {
    const m = measureCommanding(emptyContent)
    expect(m.authority).toBe(0)
    expect(m.flame).toBe('no-flame')
    expect(m.hasHighAuthority).toBe(false)
  })

  it('detects decisive patterns in rich content', () => {
    const m = measureCommanding(richContent)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasClearLogic).toBe(true)
    expect(m.hasExplicit).toBe(true)
  })

  it('detects deterministic patterns in rich content', () => {
    const m = measureCommanding(richContent)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasAuthoritative).toBe(true)
  })

  it('detects ambiguous patterns in poor content', () => {
    const m = measureCommanding(poorContent)
    expect(m.ambiguousCount).toBeGreaterThan(0)
    expect(m.hasNoAmbiguous).toBe(false)
    expect(m.nondeterministicCount).toBeGreaterThan(0)
    expect(m.hasNoNondeterministic).toBe(false)
  })

  it('classifies flame grade correctly', () => {
    expect(measureCommanding(emptyContent).flame).toBe('no-flame')
    expect(measureCommanding(richContent).flame).not.toBe('no-flame')
  })

  it('has authority capped at 100', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBeLessThanOrEqual(100)
  })
})

// ─── measureDistributing ──────────────────────────────────────────

describe('measureDistributing', () => {
  it('returns 0 distribution for empty content', () => {
    const m = measureDistributing(emptyContent)
    expect(m.distribution).toBe(0)
    expect(m.heat).toBe('no-heat')
    expect(m.hasHighDistribution).toBe(false)
  })

  it('detects balanced patterns in rich content', () => {
    const m = measureDistributing(richContent)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasEvenWorkload).toBe(true)
    expect(m.hasDistributed).toBe(true)
  })

  it('detects fair allocation in rich content', () => {
    const m = measureDistributing(richContent)
    expect(m.hasFairAllocation).toBe(true)
    expect(m.hasProportioned).toBe(true)
  })

  it('detects overweight patterns in poor content', () => {
    const m = measureDistributing(poorContent)
    expect(m.overweightCount).toBeGreaterThan(0)
    expect(m.hasNoOverweight).toBe(false)
    expect(m.bottleneckCount).toBeGreaterThan(0)
    expect(m.hasNoBottlenecks).toBe(false)
  })

  it('classifies heat grade correctly', () => {
    expect(measureDistributing(emptyContent).heat).toBe('no-heat')
    expect(measureDistributing(richContent).heat).not.toBe('no-heat')
  })

  it('has distribution capped at 100', () => {
    const m = measureDistributing(richContent)
    expect(m.distribution).toBeLessThanOrEqual(100)
  })
})

// ─── classifySeatCondition ────────────────────────────────────────

describe('classifySeatCondition', () => {
  it('classifies imperial-throne for high scores', () => {
    expect(classifySeatCondition(90)).toBe('imperial-throne')
    expect(classifySeatCondition(85)).toBe('imperial-throne')
  })

  it('classifies warrior-seat for good scores', () => {
    expect(classifySeatCondition(70)).toBe('warrior-seat')
    expect(classifySeatCondition(75)).toBe('warrior-seat')
  })

  it('classifies proper-chair for moderate scores', () => {
    expect(classifySeatCondition(55)).toBe('proper-chair')
    expect(classifySeatCondition(60)).toBe('proper-chair')
  })

  it('classifies common-stool for low scores', () => {
    expect(classifySeatCondition(40)).toBe('common-stool')
    expect(classifySeatCondition(45)).toBe('common-stool')
  })

  it('classifies broken-bench for poor scores', () => {
    expect(classifySeatCondition(25)).toBe('broken-bench')
    expect(classifySeatCondition(30)).toBe('broken-bench')
  })

  it('classifies rubble for very low scores', () => {
    expect(classifySeatCondition(0)).toBe('rubble')
    expect(classifySeatCondition(10)).toBe('rubble')
    expect(classifySeatCondition(24)).toBe('rubble')
  })
})

// ─── classifyRoomType ─────────────────────────────────────────────

describe('classifyRoomType', () => {
  it('returns no-room for empty seats', () => {
    expect(classifyRoomType([])).toBe('no-room')
  })

  it('classifies based on average quality score', () => {
    const seat: EmberSeat = {
      file: 'a.ts', sovereigntyQuality: 90, coalEndurance: 90, ashWisdom: 90,
      flameAuthority: 90, heatDistribution: 90,
      reigning: { quality: 90, grade: 'golden-throne', hasHighQuality: true, hasAuthoritative: true, hasSingleResponsibility: true, hasNoGodObjects: true, hasClearOwnership: true, hasNoAmbiguous: true, hasWellScoped: true, hasNoOverreach: true, hasPurposeful: true, hasNoScattered: true, hasCommanding: true, godObjectCount: 0, ambiguousCount: 0 },
      enduring: { endurance: 90, coal: 'eternal-ember', hasHighEndurance: true, hasSustainable: true, hasNoShortLived: true, hasMaintainable: true, hasNoDisposable: true, hasDocumented: true, hasNoUndocumented: true, hasTested: true, hasNoUntested: true, hasVersioned: true, hasNoUnversioned: true, shortLivedCount: 0, disposableCount: 0 },
      learning: { wisdom: 90, ash: 'phoenix-ash', hasHighWisdom: true, hasErrorLearning: true, hasRetryLogic: true, hasNoRepeatedMistakes: true, hasImprovement: true, hasNoStagnation: true, hasAdaptive: true, hasNoRepetitive: true, hasEvolving: true, hasNoStatic: true, hasProgressive: true, repeatedMistakesCount: 0, stagnationCount: 0 },
      commanding: { authority: 90, flame: 'eternal-flame', hasHighAuthority: true, hasDecisive: true, hasClearLogic: true, hasNoAmbiguous: true, hasDeterministic: true, hasNoNondeterministic: true, hasExplicit: true, hasNoImplicit: true, hasPredictable: true, hasNoSurprising: true, hasAuthoritative: true, ambiguousCount: 0, nondeterministicCount: 0 },
      distributing: { distribution: 90, heat: 'perfect-radiator', hasHighDistribution: true, hasBalanced: true, hasNoOverweight: true, hasEvenWorkload: true, hasNoBottlenecks: true, hasDistributed: true, hasNoConcentrated: true, hasFairAllocation: true, hasNoResourceHoarding: true, hasProportioned: true, hasNoUnbalanced: true, overweightCount: 0, bottleneckCount: 0 },
      condition: 'imperial-throne', qualityScore: 90,
    }
    const result = classifyRoomType([seat])
    expect(result).toBe('grand-hall')
  })
})

// ─── classifyRoomCondition ────────────────────────────────────────

describe('classifyRoomCondition', () => {
  it('classifies imperial-palace for high avg', () => {
    expect(classifyRoomCondition(80)).toBe('imperial-palace')
    expect(classifyRoomCondition(75)).toBe('imperial-palace')
  })

  it('classifies grand-hall for good avg', () => {
    expect(classifyRoomCondition(60)).toBe('grand-hall')
    expect(classifyRoomCondition(70)).toBe('grand-hall')
  })

  it('classifies decent-room for moderate avg', () => {
    expect(classifyRoomCondition(45)).toBe('decent-room')
    expect(classifyRoomCondition(55)).toBe('decent-room')
  })

  it('classifies humble-chamber for low avg', () => {
    expect(classifyRoomCondition(30)).toBe('humble-chamber')
    expect(classifyRoomCondition(40)).toBe('humble-chamber')
  })

  it('classifies ruined-hall for poor avg', () => {
    expect(classifyRoomCondition(15)).toBe('ruined-hall')
    expect(classifyRoomCondition(25)).toBe('ruined-hall')
  })

  it('classifies void for zero avg', () => {
    expect(classifyRoomCondition(0)).toBe('void')
    expect(classifyRoomCondition(10)).toBe('void')
  })
})

// ─── classifyRulerGrade ───────────────────────────────────────────

describe('classifyRulerGrade', () => {
  it('classifies emperor for high majesty', () => {
    expect(classifyRulerGrade(85)).toBe('emperor')
    expect(classifyRulerGrade(80)).toBe('emperor')
    expect(classifyRulerGrade(100)).toBe('emperor')
  })

  it('classifies king for good majesty', () => {
    expect(classifyRulerGrade(65)).toBe('king')
    expect(classifyRulerGrade(70)).toBe('king')
    expect(classifyRulerGrade(79)).toBe('king')
  })

  it('classifies noble for moderate majesty', () => {
    expect(classifyRulerGrade(50)).toBe('noble')
    expect(classifyRulerGrade(55)).toBe('noble')
    expect(classifyRulerGrade(64)).toBe('noble')
  })

  it('classifies knight for low majesty', () => {
    expect(classifyRulerGrade(35)).toBe('knight')
    expect(classifyRulerGrade(40)).toBe('knight')
    expect(classifyRulerGrade(49)).toBe('knight')
  })

  it('classifies peasant for poor majesty', () => {
    expect(classifyRulerGrade(20)).toBe('peasant')
    expect(classifyRulerGrade(25)).toBe('peasant')
    expect(classifyRulerGrade(34)).toBe('peasant')
  })

  it('classifies beggar for zero majesty', () => {
    expect(classifyRulerGrade(0)).toBe('beggar')
    expect(classifyRulerGrade(10)).toBe('beggar')
    expect(classifyRulerGrade(19)).toBe('beggar')
  })
})

// ─── analyzeEmberSeat ─────────────────────────────────────────────

describe('analyzeEmberSeat', () => {
  it('analyzes empty content', () => {
    const seat = analyzeEmberSeat(emptyContent, 'empty.ts')
    expect(seat.file).toBe('empty.ts')
    expect(seat.qualityScore).toBe(0)
    expect(seat.condition).toBe('rubble')
    expect(seat.sovereigntyQuality).toBe(0)
    expect(seat.coalEndurance).toBe(0)
    expect(seat.ashWisdom).toBe(0)
    expect(seat.flameAuthority).toBe(0)
    expect(seat.heatDistribution).toBe(0)
  })

  it('analyzes rich content with high scores', () => {
    const seat = analyzeEmberSeat(richContent, 'rich.ts')
    expect(seat.file).toBe('rich.ts')
    expect(seat.qualityScore).toBeGreaterThan(50)
    expect(seat.condition).not.toBe('rubble')
    expect(seat.sovereigntyQuality).toBeGreaterThan(50)
    expect(seat.coalEndurance).toBeGreaterThan(50)
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const seat = analyzeEmberSeat(moderateContent, 'mod.ts')
    const expected = Math.round(
      seat.reigning.quality * 0.2 +
      seat.enduring.endurance * 0.2 +
      seat.learning.wisdom * 0.2 +
      seat.commanding.authority * 0.2 +
      seat.distributing.distribution * 0.2,
    )
    expect(seat.qualityScore).toBe(expected)
  })

  it('sets condition based on qualityScore', () => {
    const seat = analyzeEmberSeat(emptyContent, 'empty.ts')
    expect(seat.condition).toBe(classifySeatCondition(seat.qualityScore))
  })

  it('includes all 5 measures', () => {
    const seat = analyzeEmberSeat(richContent, 'rich.ts')
    expect(seat.reigning).toBeDefined()
    expect(seat.enduring).toBeDefined()
    expect(seat.learning).toBeDefined()
    expect(seat.commanding).toBeDefined()
    expect(seat.distributing).toBeDefined()
  })
})

// ─── analyzeThroneRoom ────────────────────────────────────────────

describe('analyzeThroneRoom', () => {
  it('returns empty room for no seats', () => {
    const room = analyzeThroneRoom([], 'empty-dir')
    expect(room.directory).toBe('empty-dir')
    expect(room.seats).toHaveLength(0)
    expect(room.avgSovereignty).toBe(0)
    expect(room.roomType).toBe('no-room')
    expect(room.condition).toBe('void')
  })

  it('computes averages from seats', () => {
    const seat = analyzeEmberSeat(richContent, 'dir/rich.ts')
    const room = analyzeThroneRoom([seat], 'dir')
    expect(room.avgSovereignty).toBe(seat.sovereigntyQuality)
    expect(room.avgEndurance).toBe(seat.coalEndurance)
    expect(room.avgAuthority).toBe(seat.flameAuthority)
  })

  it('counts imperial and rubble seats', () => {
    const good = analyzeEmberSeat(richContent, 'g.ts')
    const bad = analyzeEmberSeat(emptyContent, 'b.ts')
    const room = analyzeThroneRoom([good, bad], 'mixed')
    expect(room.imperialThroneCount).toBeGreaterThanOrEqual(0)
    expect(room.rubbleCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildEmberThroneResult ───────────────────────────────────────

describe('buildEmberThroneResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildEmberThroneResult([], [])
    expect(result.seats).toHaveLength(0)
    expect(result.rooms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallMajesty).toBe(0)
    expect(result.kingdom.isImperial).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildEmberThroneResult(['index.ts'], [richContent])
    expect(result.seats).toHaveLength(1)
    expect(result.rooms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.rulerGrade).toBeDefined()
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildEmberThroneResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.seats).toHaveLength(2)
    expect(result.rooms).toHaveLength(1)
    expect(result.rooms[0].directory).toBe('src')
  })

  it('analyzes files across multiple directories', async () => {
    const result = await buildEmberThroneResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.seats).toHaveLength(2)
    expect(result.rooms).toHaveLength(2)
  })

  it('computes kingdom summary correctly', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    expect(result.kingdom.avgSovereignty).toBeGreaterThan(0)
    expect(result.kingdom.avgEndurance).toBeGreaterThan(0)
    expect(result.kingdom.avgAuthority).toBeGreaterThan(0)
    expect(result.kingdom.overallMajesty).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmberThroneResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.rubbleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestSeat).toBeDefined()
    expect(result.stats.mostSovereign).toBeDefined()
    expect(result.stats.mostEnduring).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostAuthoritative).toBeDefined()
  })

  it('computes condition counts', async () => {
    const result = await buildEmberThroneResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.imperialThroneCount + result.stats.warriorSeatCount + result.stats.properChairCount + result.stats.commonStoolCount + result.stats.brokenBenchCount + result.stats.rubbleCount).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAuthorityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDistributionCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests sovereignty improvement for low quality', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    const sovereigntyRec = result.recommendations.some(r => r.includes('sovereignty'))
    expect(sovereigntyRec).toBe(true)
  })

  it('suggests endurance improvement for low endurance', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    const enduranceRec = result.recommendations.some(r => r.includes('coal endurance') || r.includes('endurance'))
    expect(enduranceRec).toBe(true)
  })

  it('suggests wisdom improvement for low wisdom', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    const wisdomRec = result.recommendations.some(r => r.includes('ash wisdom') || r.includes('wisdom'))
    expect(wisdomRec).toBe(true)
  })

  it('suggests authority improvement for low authority', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    const authorityRec = result.recommendations.some(r => r.includes('flame authority') || r.includes('authority'))
    expect(authorityRec).toBe(true)
  })

  it('suggests distribution improvement for low distribution', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    const distRec = result.recommendations.some(r => r.includes('heat distribution') || r.includes('distribution'))
    expect(distRec).toBe(true)
  })

  it('mentions rubble files', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [emptyContent])
    expect(result.stats.rubbleCount).toBeGreaterThan(0)
    const rubbleRec = result.recommendations.some(r => r.includes('rubble'))
    expect(rubbleRec).toBe(true)
  })
})

// ─── colorScore ───────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

// ─── colorGrade ───────────────────────────────────────────────────

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('imperial-throne')).toBe('string')
    expect(typeof colorGrade('rubble')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatSeatTable ──────────────────────────────────────────────

describe('formatSeatTable', () => {
  it('formats a seat', () => {
    const seat = analyzeEmberSeat(richContent, 'rich.ts')
    const formatted = formatSeatTable(seat)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Sovereignty Quality')
    expect(formatted).toContain('Coal Endurance')
    expect(formatted).toContain('Ash Wisdom')
    expect(formatted).toContain('Flame Authority')
    expect(formatted).toContain('Heat Distribution')
    expect(formatted).toContain('Score')
  })
})

// ─── formatSeatsTable ─────────────────────────────────────────────

describe('formatSeatsTable', () => {
  it('returns message for empty seats', () => {
    const formatted = formatSeatsTable([])
    expect(formatted).toContain('No ember seats')
  })

  it('formats multiple seats', () => {
    const seat1 = analyzeEmberSeat(richContent, 'a.ts')
    const seat2 = analyzeEmberSeat(moderateContent, 'b.ts')
    const formatted = formatSeatsTable([seat1, seat2])
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

// ─── formatRoomTable ──────────────────────────────────────────────

describe('formatRoomTable', () => {
  it('formats a room', () => {
    const seat = analyzeEmberSeat(richContent, 'src/a.ts')
    const room = analyzeThroneRoom([seat], 'src')
    const formatted = formatRoomTable(room)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Room:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatRoomsTable ─────────────────────────────────────────────

describe('formatRoomsTable', () => {
  it('returns message for empty rooms', () => {
    const formatted = formatRoomsTable([])
    expect(formatted).toContain('No throne rooms')
  })

  it('formats multiple rooms', () => {
    const s1 = analyzeEmberSeat(richContent, 'src/a.ts')
    const s2 = analyzeEmberSeat(richContent, 'lib/b.ts')
    const r1 = analyzeThroneRoom([s1], 'src')
    const r2 = analyzeThroneRoom([s2], 'lib')
    const formatted = formatRoomsTable([r1, r2])
    expect(formatted).toContain('src')
    expect(formatted).toContain('lib')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Majesty')
    expect(formatted).toContain('Ruler Grade')
    expect(formatted).toContain('Best Seat')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    const formatted = formatRecommendations([])
    expect(formatted).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const formatted = formatRecommendations(['item1', 'item2'])
    expect(formatted).toContain('item1')
    expect(formatted).toContain('item2')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Ember Throne Analysis')
    expect(formatted).toContain('Throne Rooms')
    expect(formatted).toContain('Ember Throne Statistics')
    expect(formatted).toContain('Kingdom')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildEmberThroneResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.seats).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.kingdom).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildEmberThroneResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.seats).toHaveLength(3)
    expect(result.rooms).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.kingdom.overallMajesty).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.seats).toHaveLength(3)
  })

  it('kingdom isImperial for high sovereignty', async () => {
    const result = await buildEmberThroneResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.kingdom.isImperial).toBe(true)
  })

  it('kingdom is not imperial for low sovereignty', async () => {
    const result = await buildEmberThroneResult(
      ['empty.ts'],
      [emptyContent],
    )
    expect(result.kingdom.isImperial).toBe(false)
  })
})
