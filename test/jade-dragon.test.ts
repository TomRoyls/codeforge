import { describe, it, expect } from 'vitest'
import {
  measureKnowing,
  measureArmoring,
  measureBreathing,
  measureGuarding,
  measureSoaring,
  classifyDragonCondition,
  classifyLairType,
  classifyLairCondition,
  classifyDragonGrade,
  analyzeDragonScale,
  analyzeDragonLair,
  buildJadeDragonResult,
  generateRecommendations,
} from '../src/commands/jade-dragon-helpers.js'
import {
  colorScore,
  colorGrade,
  formatScaleTable,
  formatScalesTable,
  formatLairTable,
  formatLairsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-dragon-format-helpers.js'
import type {
  DragonScale,
  DragonLair,
  JadeDragonStats,
  JadeDragonResult,
  DragonSummary,
} from '../src/commands/jade-dragon-helpers.js'

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
    const validated = validateUser(config)
    return validated
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

function validateUser(user: Config): UserConfig {
  return {
    name: user.name ?? 'unknown',
    age: user.age ?? 0,
    role: user.role ?? 'user',
  }
}

export class UserService {
  private users: Map<string, UserConfig> = new Map()

  getUser(id: string): UserConfig | undefined {
    return this.users.get(id)
  }
}

const defaultConfig: UserConfig = {
  name: 'default',
  age: 25,
  role: 'user',
}
`

const poorContent = `var x = eval("1 + 2")
debugger
any thing = x
var y = eval("3 + 4")
`

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure for empty content', () => {
    const result = measureKnowing(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighDepth).toBe(false)
    expect(result.magicNumberCount).toBe(0)
    expect(result.crypticCount).toBe(0)
    expect(result.hasNoMagicNumbers).toBe(true)
    expect(result.hasNoCryptic).toBe(true)
  })

  it('scores moderate content higher than empty content', () => {
    const empty = measureKnowing(emptyContent)
    const moderate = measureKnowing(moderateContent)
    expect(moderate.depth).toBeGreaterThan(empty.depth)
  })

  it('scores rich content higher than moderate content', () => {
    const moderate = measureKnowing(moderateContent)
    const rich = measureKnowing(richContent)
    expect(rich.depth).toBeGreaterThan(moderate.depth)
  })

  it('detects domain knowledge in rich content', () => {
    const result = measureKnowing(richContent)
    expect(result.hasDomainKnowledge).toBe(true)
  })

  it('detects business logic in rich content', () => {
    const result = measureKnowing(richContent)
    expect(result.hasBusinessLogic).toBe(true)
  })

  it('detects structured code in rich content', () => {
    const result = measureKnowing(richContent)
    expect(result.hasStructured).toBe(true)
  })

  it('counts magic numbers (var) in poor content', () => {
    const result = measureKnowing(poorContent)
    expect(result.magicNumberCount).toBeGreaterThan(0)
  })

  it('counts cryptic (any) in poor content', () => {
    const result = measureKnowing(poorContent)
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects high depth for rich content', () => {
    const result = measureKnowing(richContent)
    expect(result.hasHighDepth).toBe(true)
  })

  it('grades follow thresholds', () => {
    const rich = measureKnowing(richContent)
    expect(['ancient-wyrm', 'elder-dragon']).toContain(rich.grade)
  })

  it('grades empty content as no-wisdom', () => {
    const result = measureKnowing(emptyContent)
    expect(result.grade).toBe('no-wisdom')
  })

  it('detects undocumented patterns (eval)', () => {
    const result = measureKnowing(poorContent)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('detects chaotic patterns (debugger)', () => {
    const result = measureKnowing(poorContent)
    expect(result.hasNoChaotic).toBe(false)
  })
})

// ─── measureArmoring ───────────────────────────────────────────────

describe('measureArmoring', () => {
  it('returns a valid ArmoringMeasure for empty content', () => {
    const result = measureArmoring(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.resilience).toBeLessThanOrEqual(100)
    expect(typeof result.armor).toBe('string')
    expect(result.unprotectedCount).toBe(0)
    expect(result.bareAccessCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureArmoring(emptyContent)
    const rich = measureArmoring(richContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('detects input validation in rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasInputValidation).toBe(true)
  })

  it('detects error guards in rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasErrorGuards).toBe(true)
  })

  it('detects null checks in rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasNullChecks).toBe(true)
  })

  it('detects sanitization in rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasSanitization).toBe(true)
  })

  it('counts unprotected (var) in poor content', () => {
    const result = measureArmoring(poorContent)
    expect(result.unprotectedCount).toBeGreaterThan(0)
    expect(result.hasNoUnprotectedPaths).toBe(false)
  })

  it('counts bare access (any) in poor content', () => {
    const result = measureArmoring(poorContent)
    expect(result.bareAccessCount).toBeGreaterThan(0)
    expect(result.hasNoBareAccess).toBe(false)
  })

  it('detects high resilience for rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasHighResilience).toBe(true)
  })

  it('grades empty content as no-protection', () => {
    const result = measureArmoring(emptyContent)
    expect(result.armor).toBe('no-protection')
  })

  it('detects type guards in rich content', () => {
    const result = measureArmoring(richContent)
    expect(result.hasTypeGuards).toBe(true)
  })
})

// ─── measureBreathing ──────────────────────────────────────────────

describe('measureBreathing', () => {
  it('returns a valid BreathingMeasure for empty content', () => {
    const result = measureBreathing(emptyContent)
    expect(result.vitality).toBeGreaterThanOrEqual(0)
    expect(result.vitality).toBeLessThanOrEqual(100)
    expect(typeof result.breath).toBe('string')
    expect(result.wastefulCount).toBe(0)
    expect(result.redundantCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureBreathing(emptyContent)
    const rich = measureBreathing(richContent)
    expect(rich.vitality).toBeGreaterThan(empty.vitality)
  })

  it('detects efficient patterns in rich content', () => {
    const result = measureBreathing(richContent)
    expect(result.hasEfficient).toBe(true)
  })

  it('detects optimized patterns in rich content', () => {
    const result = measureBreathing(richContent)
    expect(result.hasOptimized).toBe(true)
  })

  it('detects cached patterns in rich content', () => {
    const result = measureBreathing(richContent)
    expect(result.hasCached).toBe(true)
  })

  it('detects memoized patterns in rich content', () => {
    const result = measureBreathing(richContent)
    expect(result.hasMemoized).toBe(true)
  })

  it('counts wasteful (var) in poor content', () => {
    const result = measureBreathing(poorContent)
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects high vitality for rich content', () => {
    const result = measureBreathing(richContent)
    expect(result.hasHighVitality).toBe(true)
  })

  it('grades empty content as no-breath', () => {
    const result = measureBreathing(emptyContent)
    expect(result.breath).toBe('no-breath')
  })
})

// ─── measureGuarding ───────────────────────────────────────────────

describe('measureGuarding', () => {
  it('returns a valid GuardingMeasure for empty content', () => {
    const result = measureGuarding(emptyContent)
    expect(result.guardianship).toBeGreaterThanOrEqual(0)
    expect(result.guardianship).toBeLessThanOrEqual(100)
    expect(typeof result.treasure).toBe('string')
    expect(result.leakedCount).toBe(0)
    expect(result.unvalidatedCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureGuarding(emptyContent)
    const rich = measureGuarding(richContent)
    expect(rich.guardianship).toBeGreaterThan(empty.guardianship)
  })

  it('detects immutable patterns in rich content', () => {
    const result = measureGuarding(richContent)
    expect(result.hasImmutable).toBe(true)
  })

  it('detects encapsulated patterns in rich content', () => {
    const result = measureGuarding(richContent)
    expect(result.hasEncapsulated).toBe(true)
  })

  it('detects sealed patterns in rich content', () => {
    const result = measureGuarding(richContent)
    expect(result.hasSealed).toBe(true)
  })

  it('counts leaked (var) in poor content', () => {
    const result = measureGuarding(poorContent)
    expect(result.leakedCount).toBeGreaterThan(0)
    expect(result.hasNoLeaked).toBe(false)
  })

  it('detects high guardianship for rich content', () => {
    const result = measureGuarding(richContent)
    expect(result.hasHighGuardianship).toBe(true)
  })

  it('grades empty content as no-guard', () => {
    const result = measureGuarding(emptyContent)
    expect(result.treasure).toBe('no-guard')
  })
})

// ─── measureSoaring ────────────────────────────────────────────────

describe('measureSoaring', () => {
  it('returns a valid SoaringMeasure for empty content', () => {
    const result = measureSoaring(emptyContent)
    expect(result.elegance).toBeGreaterThanOrEqual(0)
    expect(result.elegance).toBeLessThanOrEqual(100)
    expect(typeof result.flight).toBe('string')
    expect(result.godObjectCount).toBe(0)
    expect(result.monolithicCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureSoaring(emptyContent)
    const rich = measureSoaring(richContent)
    expect(rich.elegance).toBeGreaterThan(empty.elegance)
  })

  it('detects clean architecture in rich content', () => {
    const result = measureSoaring(richContent)
    expect(result.hasCleanArchitecture).toBe(true)
  })

  it('detects separation of concerns in rich content', () => {
    const result = measureSoaring(richContent)
    expect(result.hasSeparationOfConcerns).toBe(true)
  })

  it('detects modular patterns in rich content', () => {
    const result = measureSoaring(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects high elegance for rich content', () => {
    const result = measureSoaring(richContent)
    expect(result.hasHighElegance).toBe(true)
  })

  it('grades empty content as no-flight', () => {
    const result = measureSoaring(emptyContent)
    expect(result.flight).toBe('no-flight')
  })

  it('counts god objects (var) in poor content', () => {
    const result = measureSoaring(poorContent)
    expect(result.godObjectCount).toBeGreaterThan(0)
    expect(result.hasNoGodObjects).toBe(false)
  })
})

// ─── classifyDragonCondition ───────────────────────────────────────

describe('classifyDragonCondition', () => {
  it('classifies 90 as celestial-dragon', () => {
    expect(classifyDragonCondition(90)).toBe('celestial-dragon')
  })

  it('classifies 75 as jade-serpent', () => {
    expect(classifyDragonCondition(75)).toBe('jade-serpent')
  })

  it('classifies 60 as proper-wyrm', () => {
    expect(classifyDragonCondition(60)).toBe('proper-wyrm')
  })

  it('classifies 45 as wounded-drake', () => {
    expect(classifyDragonCondition(45)).toBe('wounded-drake')
  })

  it('classifies 30 as earthbound-lizard', () => {
    expect(classifyDragonCondition(30)).toBe('earthbound-lizard')
  })

  it('classifies 10 as egg', () => {
    expect(classifyDragonCondition(10)).toBe('egg')
  })

  it('classifies 0 as egg', () => {
    expect(classifyDragonCondition(0)).toBe('egg')
  })

  it('classifies 85 as celestial-dragon', () => {
    expect(classifyDragonCondition(85)).toBe('celestial-dragon')
  })
})

// ─── classifyLairType ──────────────────────────────────────────────

describe('classifyLairType', () => {
  it('returns no-lair for empty scales', () => {
    expect(classifyLairType([])).toBe('no-lair')
  })

  it('returns celestial-palace for high quality scales with celestial majority', () => {
    const scales: DragonScale[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      wisdomDepth: 90,
      scaleResilience: 90,
      breathVitality: 90,
      treasureGuardianship: 90,
      flightElegance: 90,
      knowing: measureKnowing(richContent),
      armoring: measureArmoring(richContent),
      breathing: measureBreathing(richContent),
      guarding: measureGuarding(richContent),
      soaring: measureSoaring(richContent),
      condition: 'celestial-dragon' as const,
      qualityScore: 85,
    }))
    const result = classifyLairType(scales)
    expect(['celestial-palace', 'mountain-lair']).toContain(result)
  })

  it('returns no-lair for very low quality scales', () => {
    const scales: DragonScale[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      wisdomDepth: 5,
      scaleResilience: 5,
      breathVitality: 5,
      treasureGuardianship: 5,
      flightElegance: 5,
      knowing: measureKnowing(emptyContent),
      armoring: measureArmoring(emptyContent),
      breathing: measureBreathing(emptyContent),
      guarding: measureGuarding(emptyContent),
      soaring: measureSoaring(emptyContent),
      condition: 'egg' as const,
      qualityScore: 5,
    }))
    expect(classifyLairType(scales)).toBe('no-lair')
  })
})

// ─── classifyLairCondition ─────────────────────────────────────────

describe('classifyLairCondition', () => {
  it('classifies 80 as divine-realm', () => {
    expect(classifyLairCondition(80)).toBe('divine-realm')
  })

  it('classifies 65 as mountain-fortress', () => {
    expect(classifyLairCondition(65)).toBe('mountain-fortress')
  })

  it('classifies 50 as decent-lair', () => {
    expect(classifyLairCondition(50)).toBe('decent-lair')
  })

  it('classifies 35 as humble-den', () => {
    expect(classifyLairCondition(35)).toBe('humble-den')
  })

  it('classifies 20 as ruined', () => {
    expect(classifyLairCondition(20)).toBe('ruined')
  })

  it('classifies 5 as void', () => {
    expect(classifyLairCondition(5)).toBe('void')
  })
})

// ─── classifyDragonGrade ───────────────────────────────────────────

describe('classifyDragonGrade', () => {
  it('classifies 85 as dragon-emperor', () => {
    expect(classifyDragonGrade(85)).toBe('dragon-emperor')
  })

  it('classifies 70 as elder-wyrm', () => {
    expect(classifyDragonGrade(70)).toBe('elder-wyrm')
  })

  it('classifies 55 as adult-dragon', () => {
    expect(classifyDragonGrade(55)).toBe('adult-dragon')
  })

  it('classifies 40 as juvenile', () => {
    expect(classifyDragonGrade(40)).toBe('juvenile')
  })

  it('classifies 25 as hatchling', () => {
    expect(classifyDragonGrade(25)).toBe('hatchling')
  })

  it('classifies 10 as egg-grade', () => {
    expect(classifyDragonGrade(10)).toBe('egg-grade')
  })
})

// ─── analyzeDragonScale ────────────────────────────────────────────

describe('analyzeDragonScale', () => {
  it('analyzes empty content as egg condition', () => {
    const result = analyzeDragonScale(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('egg')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeDragonScale(emptyContent, 'empty.ts')
    const rich = analyzeDragonScale(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeDragonScale(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.knowing.depth * 0.2 +
      result.armoring.resilience * 0.2 +
      result.breathing.vitality * 0.2 +
      result.guarding.guardianship * 0.2 +
      result.soaring.elegance * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeDragonScale(richContent, 'rich.ts')
    expect(result.knowing).toBeDefined()
    expect(result.armoring).toBeDefined()
    expect(result.breathing).toBeDefined()
    expect(result.guarding).toBeDefined()
    expect(result.soaring).toBeDefined()
  })

  it('sets wisdomDepth from knowing.depth', () => {
    const result = analyzeDragonScale(richContent, 'rich.ts')
    expect(result.wisdomDepth).toBe(result.knowing.depth)
  })

  it('sets scaleResilience from armoring.resilience', () => {
    const result = analyzeDragonScale(richContent, 'rich.ts')
    expect(result.scaleResilience).toBe(result.armoring.resilience)
  })
})

// ─── analyzeDragonLair ─────────────────────────────────────────────

describe('analyzeDragonLair', () => {
  it('returns empty lair for no scales', () => {
    const result = analyzeDragonLair([], 'src')
    expect(result.directory).toBe('src')
    expect(result.scales).toHaveLength(0)
    expect(result.avgWisdom).toBe(0)
    expect(result.avgResilience).toBe(0)
    expect(result.avgElegance).toBe(0)
    expect(result.celestialDragonCount).toBe(0)
    expect(result.eggCount).toBe(0)
    expect(result.lairType).toBe('no-lair')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single scale', () => {
    const scale = analyzeDragonScale(richContent, 'rich.ts')
    const result = analyzeDragonLair([scale], 'src')
    expect(result.avgWisdom).toBe(scale.wisdomDepth)
    expect(result.avgResilience).toBe(scale.scaleResilience)
    expect(result.avgElegance).toBe(scale.flightElegance)
  })

  it('counts celestial dragons and eggs', () => {
    const celestial = analyzeDragonScale(richContent, 'rich.ts')
    const egg = analyzeDragonScale(emptyContent, 'empty.ts')
    if (celestial.condition === 'celestial-dragon' && egg.condition === 'egg') {
      const result = analyzeDragonLair([celestial, egg], 'src')
      expect(result.celestialDragonCount).toBe(1)
      expect(result.eggCount).toBe(1)
    }
  })
})

// ─── buildJadeDragonResult ─────────────────────────────────────────

describe('buildJadeDragonResult', () => {
  it('handles empty input', async () => {
    const result = await buildJadeDragonResult([], [])
    expect(result.scales).toHaveLength(0)
    expect(result.lairs).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalLairs).toBe(0)
    expect(result.stats.overallMajesty).toBe(0)
    expect(result.dragon.isCelestial).toBe(false)
    expect(result.dragon.overallMajesty).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildJadeDragonResult(['file.ts'], [richContent])
    expect(result.scales).toHaveLength(1)
    expect(result.scales[0].file).toBe('file.ts')
    expect(result.lairs).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into lairs by directory', async () => {
    const result = await buildJadeDragonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.scales).toHaveLength(3)
    expect(result.lairs).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalLairs).toBe(2)
  })

  it('computes dragon summary correctly', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [richContent])
    expect(result.dragon.avgWisdom).toBe(result.scales[0].wisdomDepth)
    expect(result.dragon.overallMajesty).toBeGreaterThanOrEqual(0)
  })

  it('sets isCelestial when avgWisdom >= 60', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [richContent])
    if (result.dragon.avgWisdom >= 60) {
      expect(result.dragon.isCelestial).toBe(true)
    } else {
      expect(result.dragon.isCelestial).toBe(false)
    }
  })

  it('tracks best scale and top performers', async () => {
    const result = await buildJadeDragonResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestScale).toBe('a.ts')
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
    expect(result.stats.mostVital).toBeDefined()
    expect(result.stats.mostGuarding).toBeDefined()
  })

  it('computes overallMajesty as avg of wisdom+resilience+elegance', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.dragon.avgWisdom + result.dragon.avgResilience + result.dragon.avgElegance) / 3,
    )
    expect(result.dragon.overallMajesty).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildJadeDragonResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.celestialDragonCount +
      result.stats.jadeSerpentCount +
      result.stats.properWyrmCount +
      result.stats.woundedDrakeCount +
      result.stats.earthboundLizardCount +
      result.stats.eggCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets dragon grade', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [richContent])
    expect(['dragon-emperor', 'elder-wyrm', 'adult-dragon', 'juvenile', 'hatchling', 'egg-grade']).toContain(
      result.stats.dragonGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: JadeDragonStats = {
    totalFiles: 0, totalLairs: 0,
    avgWisdomDepth: 0, avgScaleResilience: 0, avgBreathVitality: 0,
    avgTreasureGuardianship: 0, avgFlightElegance: 0,
    celestialDragonCount: 0, jadeSerpentCount: 0, properWyrmCount: 0,
    woundedDrakeCount: 0, earthboundLizardCount: 0, eggCount: 0,
    hasHighDepthCount: 0, hasHighResilienceCount: 0, hasHighVitalityCount: 0,
    hasHighGuardianshipCount: 0, hasHighEleganceCount: 0,
    overallMajesty: 0, dragonGrade: 'egg-grade',
    bestScale: '', wisest: '', mostResilient: '', mostVital: '', mostGuarding: '',
  }

  const emptyDragon: DragonSummary = {
    avgWisdom: 0, avgResilience: 0, avgElegance: 0,
    isCelestial: false, overallMajesty: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyDragon, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes wisdom recommendation when avgWisdomDepth < 50', () => {
    const stats = { ...emptyStats, avgWisdomDepth: 30 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('wisdom'))).toBe(true)
  })

  it('includes resilience recommendation when avgScaleResilience < 50', () => {
    const stats = { ...emptyStats, avgScaleResilience: 30 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('resilience'))).toBe(true)
  })

  it('includes breath recommendation when avgBreathVitality < 50', () => {
    const stats = { ...emptyStats, avgBreathVitality: 30 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('vitality'))).toBe(true)
  })

  it('includes guardianship recommendation when avgTreasureGuardianship < 50', () => {
    const stats = { ...emptyStats, avgTreasureGuardianship: 30 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('guardianship'))).toBe(true)
  })

  it('includes elegance recommendation when avgFlightElegance < 50', () => {
    const stats = { ...emptyStats, avgFlightElegance: 30 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('elegance'))).toBe(true)
  })

  it('includes egg incubation when eggCount > 0', () => {
    const stats = { ...emptyStats, eggCount: 3 }
    const recs = generateRecommendations([], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('egg'))).toBe(true)
  })

  it('includes majesty recommendation when overallMajesty < 40', () => {
    const stats = { ...emptyStats, overallMajesty: 20 }
    const dragon = { ...emptyDragon, overallMajesty: 20 }
    const recs = generateRecommendations([], [], dragon, stats)
    expect(recs.some(r => r.includes('majesty'))).toBe(true)
  })

  it('praises dragon-emperor quality when all metrics are high', () => {
    const highStats: JadeDragonStats = {
      ...emptyStats,
      avgWisdomDepth: 80, avgScaleResilience: 80, avgBreathVitality: 80,
      avgTreasureGuardianship: 80, avgFlightElegance: 80,
      overallMajesty: 80, dragonGrade: 'dragon-emperor',
    }
    const highDragon: DragonSummary = {
      avgWisdom: 80, avgResilience: 80, avgElegance: 80,
      isCelestial: true, overallMajesty: 80,
    }
    const recs = generateRecommendations([], [], highDragon, highStats)
    expect(recs.some(r => r.includes('dragon-emperor'))).toBe(true)
  })

  it('mentions specific egg files when <= 3', () => {
    const scale: DragonScale = analyzeDragonScale(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, eggCount: 1 }
    const recs = generateRecommendations([scale], [], emptyDragon, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('handles 0', () => {
    expect(typeof colorScore(0)).toBe('string')
  })

  it('handles 100', () => {
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for celestial-dragon', () => {
    expect(typeof colorGrade('celestial-dragon')).toBe('string')
  })

  it('returns a string for egg', () => {
    expect(typeof colorGrade('egg')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatScaleTable', () => {
  it('formats a single scale', () => {
    const scale = analyzeDragonScale(richContent, 'rich.ts')
    const result = formatScaleTable(scale)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Wisdom Depth')
    expect(result).toContain('Scale Resilience')
    expect(result).toContain('Breath Vitality')
    expect(result).toContain('Treasure Guardianship')
    expect(result).toContain('Flight Elegance')
  })
})

describe('formatScalesTable', () => {
  it('handles empty array', () => {
    expect(formatScalesTable([])).toContain('No dragon scales')
  })

  it('formats multiple scales', () => {
    const scales = [
      analyzeDragonScale(richContent, 'a.ts'),
      analyzeDragonScale(moderateContent, 'b.ts'),
    ]
    const result = formatScalesTable(scales)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatLairTable', () => {
  it('formats a lair', () => {
    const scale = analyzeDragonScale(richContent, 'rich.ts')
    const lair = analyzeDragonLair([scale], 'src')
    const result = formatLairTable(lair)
    expect(result).toContain('src')
    expect(result).toContain('Lair')
  })
})

describe('formatLairsTable', () => {
  it('handles empty array', () => {
    expect(formatLairsTable([])).toContain('No dragon lairs')
  })

  it('formats multiple lairs', () => {
    const scale = analyzeDragonScale(richContent, 'src/a.ts')
    const lair = analyzeDragonLair([scale], 'src')
    const result = formatLairsTable([lair])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildJadeDragonResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Jade Dragon Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Majesty')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Deepen wisdom', 'Harden resilience'])
    expect(result).toContain('Deepen wisdom')
    expect(result).toContain('Harden resilience')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Jade Dragon Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Celestial')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildJadeDragonResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.scales).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.dragon).toBeDefined()
  })
})
