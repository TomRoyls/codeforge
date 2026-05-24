import { describe, it, expect } from 'vitest'
import {
  measureShifting,
  measureEnduring,
  measureRevealing,
  measureBalancing,
  measurePreparing,
  classifyStoneCondition,
  classifyTowerType,
  classifyTowerCondition,
  classifyArchitectGrade,
  analyzeTwilightStone,
  analyzeSpireTower,
  buildTwilightSpireResult,
  generateRecommendations,
} from '../src/commands/twilight-spire-helpers.js'
import {
  colorScore,
  colorGrade,
  formatStoneTable,
  formatStonesTable,
  formatTowerTable,
  formatTowersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/twilight-spire-format-helpers.js'
import type {
  TwilightStone,
} from '../src/commands/twilight-spire-helpers.js'

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
  } finally {
    cleanup()
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

// ─── measureShifting ──────────────────────────────────────────────

describe('measureShifting', () => {
  it('returns 0 grace for empty content', () => {
    const m = measureShifting(emptyContent)
    expect(m.grace).toBe(0)
    expect(m.grade).toBe('no-transition')
    expect(m.hasHighGrace).toBe(false)
  })

  it('detects graceful transitions in rich content', () => {
    const m = measureShifting(richContent)
    expect(m.hasGracefulTransitions).toBe(true)
    expect(m.hasStateManaged).toBe(true)
    expect(m.hasSmoothFlows).toBe(true)
  })

  it('detects jarring code in poor content', () => {
    const m = measureShifting(poorContent)
    expect(m.jarringCount).toBeGreaterThan(0)
    expect(m.hasNoJarring).toBe(false)
    expect(m.suddenCount).toBeGreaterThan(0)
    expect(m.hasNoSudden).toBe(false)
  })

  it('detects progressive and sequenced patterns in rich content', () => {
    const m = measureShifting(richContent)
    expect(m.hasProgressive).toBe(true)
    expect(m.hasSequenced).toBe(true)
    expect(m.hasFlowing).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureShifting(richContent).grade).not.toBe('no-transition')
    expect(measureShifting(emptyContent).grade).toBe('no-transition')
  })

  it('has grace capped at 100', () => {
    const m = measureShifting(richContent)
    expect(m.grace).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnduring ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.dusk).toBe('no-endurance')
    expect(m.hasHighResilience).toBe(false)
  })

  it('detects error recovery in rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasErrorRecovery).toBe(true)
    expect(m.hasGracefulDegradation).toBe(true)
    expect(m.hasAdaptive).toBe(true)
  })

  it('detects hard crashes in poor content', () => {
    const m = measureEnduring(poorContent)
    expect(m.hardCrashCount).toBeGreaterThan(0)
    expect(m.hasNoHardCrash).toBe(false)
    expect(m.fragileCount).toBeGreaterThan(0)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects versioned and migration patterns in rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasVersioned).toBe(true)
    expect(m.hasMigrationPaths).toBe(true)
    expect(m.hasFutureProof).toBe(true)
  })

  it('classifies dusk correctly', () => {
    expect(measureEnduring(emptyContent).dusk).toBe('no-endurance')
    expect(measureEnduring(richContent).dusk).not.toBe('no-endurance')
  })

  it('has resilience capped at 100', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
  })
})

// ─── measureRevealing ─────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns 0 emergence for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(m.emergence).toBe(0)
    expect(m.star).toBe('no-light')
    expect(m.hasHighEmergence).toBe(false)
  })

  it('detects clear abstractions in rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasClearAbstractions).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasEssenceVisible).toBe(true)
  })

  it('detects over-complex code in poor content', () => {
    const m = measureRevealing(poorContent)
    expect(m.overComplexCount).toBeGreaterThan(0)
    expect(m.hasNoOverComplex).toBe(false)
    expect(m.buriedCount).toBeGreaterThan(0)
    expect(m.hasNoBuried).toBe(false)
  })

  it('detects core clear and simplified patterns in rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasCoreClear).toBe(true)
    expect(m.hasIlluminated).toBe(true)
  })

  it('classifies star correctly', () => {
    expect(measureRevealing(emptyContent).star).toBe('no-light')
    expect(measureRevealing(richContent).star).not.toBe('no-light')
  })

  it('has emergence capped at 100', () => {
    const m = measureRevealing(richContent)
    expect(m.emergence).toBeLessThanOrEqual(100)
  })
})

// ─── measureBalancing ─────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns 0 balance for empty content', () => {
    const m = measureBalancing(emptyContent)
    expect(m.balance).toBe(0)
    expect(m.shadow).toBe('no-balance')
    expect(m.hasHighBalance).toBe(false)
  })

  it('detects right level of detail in rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasRightLevelOfDetail).toBe(true)
    expect(m.hasProperAbstraction).toBe(true)
    expect(m.hasAppropriate).toBe(true)
  })

  it('detects over-documented code in poor content', () => {
    const m = measureBalancing(poorContent)
    expect(m.overDocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoOverDocumented).toBe(false)
    expect(m.underDocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUnderDocumented).toBe(false)
  })

  it('detects concise and complete patterns in rich content', () => {
    const m = measureBalancing(richContent)
    expect(m.hasComplete).toBe(true)
  })

  it('classifies shadow correctly', () => {
    expect(measureBalancing(emptyContent).shadow).toBe('no-balance')
    expect(measureBalancing(richContent).shadow).not.toBe('no-balance')
  })

  it('has balance capped at 100', () => {
    const m = measureBalancing(richContent)
    expect(m.balance).toBeLessThanOrEqual(100)
  })
})

// ─── measurePreparing ─────────────────────────────────────────────

describe('measurePreparing', () => {
  it('returns 0 readiness for empty content', () => {
    const m = measurePreparing(emptyContent)
    expect(m.readiness).toBe(0)
    expect(m.dawn).toBe('no-readiness')
    expect(m.hasHighReadiness).toBe(false)
  })

  it('detects extensible patterns in rich content', () => {
    const m = measurePreparing(richContent)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasConfigurable).toBe(true)
    expect(m.hasModular).toBe(true)
  })

  it('detects hardcoded code in poor content', () => {
    const m = measurePreparing(poorContent)
    expect(m.hardcodedCount).toBeGreaterThan(0)
    expect(m.hasNoHardcoded).toBe(false)
    expect(m.fixedCapacityCount).toBeGreaterThan(0)
    expect(m.hasNoFixedCapacity).toBe(false)
  })

  it('detects scalable and tested patterns in rich content', () => {
    const m = measurePreparing(richContent)
    expect(m.hasScalable).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasPrepared).toBe(true)
  })

  it('classifies dawn correctly', () => {
    expect(measurePreparing(emptyContent).dawn).toBe('no-readiness')
    expect(measurePreparing(richContent).dawn).not.toBe('no-readiness')
  })

  it('has readiness capped at 100', () => {
    const m = measurePreparing(richContent)
    expect(m.readiness).toBeLessThanOrEqual(100)
  })
})

// ─── classifyStoneCondition ───────────────────────────────────────

describe('classifyStoneCondition', () => {
  it('classifies twilight-masterpiece for high scores', () => {
    expect(classifyStoneCondition(90)).toBe('twilight-masterpiece')
    expect(classifyStoneCondition(85)).toBe('twilight-masterpiece')
  })

  it('classifies evening-spire for good scores', () => {
    expect(classifyStoneCondition(70)).toBe('evening-spire')
    expect(classifyStoneCondition(75)).toBe('evening-spire')
  })

  it('classifies proper-tower for moderate scores', () => {
    expect(classifyStoneCondition(55)).toBe('proper-tower')
    expect(classifyStoneCondition(60)).toBe('proper-tower')
  })

  it('classifies dim-tower for low scores', () => {
    expect(classifyStoneCondition(40)).toBe('dim-tower')
    expect(classifyStoneCondition(45)).toBe('dim-tower')
  })

  it('classifies shadow-ruin for poor scores', () => {
    expect(classifyStoneCondition(25)).toBe('shadow-ruin')
    expect(classifyStoneCondition(30)).toBe('shadow-ruin')
  })

  it('classifies collapsed for very low scores', () => {
    expect(classifyStoneCondition(0)).toBe('collapsed')
    expect(classifyStoneCondition(10)).toBe('collapsed')
    expect(classifyStoneCondition(24)).toBe('collapsed')
  })
})

// ─── classifyTowerType ────────────────────────────────────────────

describe('classifyTowerType', () => {
  it('returns no-tower for empty stones', () => {
    expect(classifyTowerType([])).toBe('no-tower')
  })

  it('classifies grand-cathedral for high quality with masterpiece ratio', () => {
    const stone: TwilightStone = {
      file: 'a.ts', transitionGrace: 90, duskResilience: 90, starEmergence: 90,
      shadowBalance: 90, dawnReadiness: 90,
      shifting: { grace: 90, grade: 'seamless-twilight', hasHighGrace: true, hasGracefulTransitions: true, hasStateManaged: true, hasNoJarring: true, hasSmoothFlows: true, hasNoSudden: true, hasProgressive: true, hasNoAllAtOnce: true, hasSequenced: true, hasNoUnordered: true, hasFlowing: true, jarringCount: 0, suddenCount: 0 },
      enduring: { resilience: 90, dusk: 'eternal-spire', hasHighResilience: true, hasErrorRecovery: true, hasGracefulDegradation: true, hasNoHardCrash: true, hasAdaptive: true, hasNoFragile: true, hasVersioned: true, hasNoBreakingChanges: true, hasMigrationPaths: true, hasNoDeadEnds: true, hasFutureProof: true, hardCrashCount: 0, fragileCount: 0 },
      revealing: { emergence: 90, star: 'first-star', hasHighEmergence: true, hasClearAbstractions: true, hasSelfDocumenting: true, hasNoOverComplex: true, hasEssenceVisible: true, hasNoBuried: true, hasCoreClear: true, hasNoObfuscatedCore: true, hasSimplified: true, hasNoOverEngineered: true, hasIlluminated: true, overComplexCount: 0, buriedCount: 0 },
      balancing: { balance: 90, shadow: 'perfect-twilight', hasHighBalance: true, hasRightLevelOfDetail: true, hasNoOverDocumented: true, hasNoUnderDocumented: true, hasProperAbstraction: true, hasNoLeakyAbstraction: true, hasAppropriate: true, hasNoVerbose: true, hasNoCryptic: true, hasConcise: true, hasComplete: true, overDocumentedCount: 0, underDocumentedCount: 0 },
      preparing: { readiness: 90, dawn: 'sunrise-ready', hasHighReadiness: true, hasExtensible: true, hasConfigurable: true, hasNoHardcoded: true, hasScalable: true, hasNoFixedCapacity: true, hasModular: true, hasNoMonolithic: true, hasTested: true, hasNoUntested: true, hasPrepared: true, hardcodedCount: 0, fixedCapacityCount: 0 },
      condition: 'twilight-masterpiece', qualityScore: 90,
    }
    const result = classifyTowerType([stone])
    expect(result).toBe('grand-cathedral')
  })
})

// ─── classifyTowerCondition ───────────────────────────────────────

describe('classifyTowerCondition', () => {
  it('classifies twilight-peak for high avg', () => {
    expect(classifyTowerCondition(80)).toBe('twilight-peak')
    expect(classifyTowerCondition(75)).toBe('twilight-peak')
  })

  it('classifies evening-tower for good avg', () => {
    expect(classifyTowerCondition(60)).toBe('evening-tower')
    expect(classifyTowerCondition(70)).toBe('evening-tower')
  })

  it('classifies decent-spire for moderate avg', () => {
    expect(classifyTowerCondition(45)).toBe('decent-spire')
    expect(classifyTowerCondition(55)).toBe('decent-spire')
  })

  it('classifies void for zero avg', () => {
    expect(classifyTowerCondition(0)).toBe('void')
    expect(classifyTowerCondition(10)).toBe('void')
  })
})

// ─── classifyArchitectGrade ───────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('classifies twilight-architect for high majesty', () => {
    expect(classifyArchitectGrade(85)).toBe('twilight-architect')
    expect(classifyArchitectGrade(80)).toBe('twilight-architect')
  })

  it('classifies tower-master for good majesty', () => {
    expect(classifyArchitectGrade(65)).toBe('tower-master')
    expect(classifyArchitectGrade(70)).toBe('tower-master')
  })

  it('classifies skilled-builder for moderate majesty', () => {
    expect(classifyArchitectGrade(50)).toBe('skilled-builder')
    expect(classifyArchitectGrade(55)).toBe('skilled-builder')
  })

  it('classifies apprentice for low majesty', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(40)).toBe('apprentice')
  })

  it('classifies novice for poor majesty', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(25)).toBe('novice')
  })

  it('classifies ruin-dweller for zero majesty', () => {
    expect(classifyArchitectGrade(0)).toBe('ruin-dweller')
    expect(classifyArchitectGrade(10)).toBe('ruin-dweller')
  })
})

// ─── analyzeTwilightStone ─────────────────────────────────────────

describe('analyzeTwilightStone', () => {
  it('analyzes empty content', () => {
    const stone = analyzeTwilightStone(emptyContent, 'empty.ts')
    expect(stone.file).toBe('empty.ts')
    expect(stone.qualityScore).toBe(0)
    expect(stone.condition).toBe('collapsed')
  })

  it('analyzes rich content with high scores', () => {
    const stone = analyzeTwilightStone(richContent, 'rich.ts')
    expect(stone.qualityScore).toBeGreaterThan(50)
    expect(stone.condition).not.toBe('collapsed')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const stone = analyzeTwilightStone(moderateContent, 'mod.ts')
    const expected = Math.round(
      stone.shifting.grace * 0.2 +
      stone.enduring.resilience * 0.2 +
      stone.revealing.emergence * 0.2 +
      stone.balancing.balance * 0.2 +
      stone.preparing.readiness * 0.2,
    )
    expect(stone.qualityScore).toBe(expected)
  })

  it('propagates measure scores to stone fields', () => {
    const stone = analyzeTwilightStone(richContent, 'rich.ts')
    expect(stone.transitionGrace).toBe(stone.shifting.grace)
    expect(stone.duskResilience).toBe(stone.enduring.resilience)
    expect(stone.starEmergence).toBe(stone.revealing.emergence)
    expect(stone.shadowBalance).toBe(stone.balancing.balance)
    expect(stone.dawnReadiness).toBe(stone.preparing.readiness)
  })
})

// ─── analyzeSpireTower ────────────────────────────────────────────

describe('analyzeSpireTower', () => {
  it('returns empty tower for no stones', () => {
    const tower = analyzeSpireTower([], 'empty-dir')
    expect(tower.directory).toBe('empty-dir')
    expect(tower.stones).toHaveLength(0)
    expect(tower.towerType).toBe('no-tower')
    expect(tower.condition).toBe('void')
  })

  it('computes averages from stones', () => {
    const stone = analyzeTwilightStone(richContent, 'dir/rich.ts')
    const tower = analyzeSpireTower([stone], 'dir')
    expect(tower.avgGrace).toBe(stone.transitionGrace)
    expect(tower.avgResilience).toBe(stone.duskResilience)
    expect(tower.avgReadiness).toBe(stone.dawnReadiness)
  })
})

// ─── buildTwilightSpireResult ─────────────────────────────────────

describe('buildTwilightSpireResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildTwilightSpireResult([], [])
    expect(result.stones).toHaveLength(0)
    expect(result.towers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.skyline.isTwilight).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildTwilightSpireResult(['index.ts'], [richContent])
    expect(result.stones).toHaveLength(1)
    expect(result.towers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildTwilightSpireResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.stones).toHaveLength(2)
    expect(result.towers).toHaveLength(1)
  })

  it('computes skyline summary correctly', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    expect(result.skyline.avgGrace).toBeGreaterThan(0)
    expect(result.skyline.avgResilience).toBeGreaterThan(0)
    expect(result.skyline.avgReadiness).toBeGreaterThan(0)
    expect(result.skyline.overallMajesty).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildTwilightSpireResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.twilightMasterpieceCount +
      result.stats.eveningSpireCount +
      result.stats.properTowerCount +
      result.stats.dimTowerCount +
      result.stats.shadowRuinCount +
      result.stats.collapsedCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    expect(result.stats.hasHighGraceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEmergenceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighBalanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighReadinessCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildTwilightSpireResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestStone).toBeDefined()
    expect(result.stats.mostGraceful).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
    expect(result.stats.clearestStar).toBeDefined()
    expect(result.stats.mostPrepared).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests transition grace improvement for low grace', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('transition grace'))
    expect(rec).toBe(true)
  })

  it('suggests dusk resilience improvement for low resilience', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('resilience'))
    expect(rec).toBe(true)
  })

  it('suggests star emergence improvement for low emergence', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('emergence'))
    expect(rec).toBe(true)
  })

  it('mentions collapsed files', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('collapsed'))
    expect(rec).toBe(true)
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
    expect(typeof colorGrade('twilight-masterpiece')).toBe('string')
    expect(typeof colorGrade('collapsed')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatStoneTable ─────────────────────────────────────────────

describe('formatStoneTable', () => {
  it('formats a stone', () => {
    const stone = analyzeTwilightStone(richContent, 'rich.ts')
    const formatted = formatStoneTable(stone)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Transition Grace')
    expect(formatted).toContain('Dusk Resilience')
    expect(formatted).toContain('Star Emergence')
    expect(formatted).toContain('Score')
  })
})

// ─── formatStonesTable ────────────────────────────────────────────

describe('formatStonesTable', () => {
  it('returns message for empty stones', () => {
    expect(formatStonesTable([])).toContain('No twilight stones')
  })
})

// ─── formatTowerTable ─────────────────────────────────────────────

describe('formatTowerTable', () => {
  it('formats a tower', () => {
    const stone = analyzeTwilightStone(richContent, 'src/a.ts')
    const tower = analyzeSpireTower([stone], 'src')
    const formatted = formatTowerTable(tower)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Tower:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatTowersTable ────────────────────────────────────────────

describe('formatTowersTable', () => {
  it('returns message for empty towers', () => {
    expect(formatTowersTable([])).toContain('No spire towers')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Majesty')
    expect(formatted).toContain('Architect Grade')
    expect(formatted).toContain('Best Stone')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Twilight Spire Analysis')
    expect(formatted).toContain('Spire Towers')
    expect(formatted).toContain('Twilight Spire Statistics')
    expect(formatted).toContain('Skyline')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stones).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.skyline).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildTwilightSpireResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.stones).toHaveLength(3)
    expect(result.towers).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.skyline.overallMajesty).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('skyline isTwilight for high grace', async () => {
    const result = await buildTwilightSpireResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.skyline.isTwilight).toBe(true)
  })

  it('skyline is not twilight for low grace', async () => {
    const result = await buildTwilightSpireResult(['empty.ts'], [emptyContent])
    expect(result.skyline.isTwilight).toBe(false)
  })

  it('overallMajesty equals avg of grace, resilience, readiness', async () => {
    const result = await buildTwilightSpireResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.skyline.avgGrace + result.skyline.avgResilience + result.skyline.avgReadiness) / 3)
    expect(result.skyline.overallMajesty).toBe(expected)
  })
})
