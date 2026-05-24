import { describe, it, expect } from 'vitest'
import {
  measureEnduring,
  measureUnfurling,
  measureDispersing,
  measureRooting,
  measureSpiraling,
  classifyFrondCondition,
  classifyGroveType,
  classifyGroveCondition,
  classifyBotanistGrade,
  analyzeFernFrond,
  analyzeFernGrove,
  buildSilverFernResult,
  generateRecommendations,
} from '../src/commands/silver-fern-helpers.js'
import {
  colorScore,
  colorGrade,
  formatFrondTable,
  formatFrondsTable,
  formatGroveTable,
  formatGrovesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/silver-fern-format-helpers.js'
import type {
  FernFrond,
  SilverFernStats,
  SilverFernResult,
  ForestSummary,
} from '../src/commands/silver-fern-helpers.js'

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

// ─── measureEnduring ────────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns valid EnduringMeasure for empty content', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.resilience).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighResilience).toBe(false)
    expect(result.bareCrashCount).toBe(0)
    expect(result.assumptionCount).toBe(0)
    expect(result.hasNoBareCrash).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureEnduring(emptyContent)
    const rich = measureEnduring(richContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('detects error recovery in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasErrorRecovery).toBe(true)
  })

  it('detects graceful degradation in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasGracefulDegradation).toBe(true)
  })

  it('detects defensive coding in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasDefensiveCoding).toBe(true)
  })

  it('detects retry mechanism in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasRetryMechanism).toBe(true)
  })

  it('detects fallback paths in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasFallbackPaths).toBe(true)
  })

  it('detects self healing in rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasSelfHealing).toBe(true)
  })

  it('detects high resilience for rich content', () => {
    const result = measureEnduring(richContent)
    expect(result.hasHighResilience).toBe(true)
  })

  it('grades empty content as dead-frond', () => {
    expect(measureEnduring(emptyContent).grade).toBe('dead-frond')
  })

  it('counts bare crashes (eval) in poor content', () => {
    const result = measureEnduring(poorContent)
    expect(result.bareCrashCount).toBeGreaterThan(0)
    expect(result.hasNoBareCrash).toBe(false)
  })

  it('counts assumptions (any) in poor content', () => {
    const result = measureEnduring(poorContent)
    expect(result.assumptionCount).toBeGreaterThan(0)
    expect(result.hasNoAssumption).toBe(false)
  })
})

// ─── measureUnfurling ──────────────────────────────────────────────

describe('measureUnfurling', () => {
  it('returns valid UnfurlingMeasure for empty content', () => {
    const result = measureUnfurling(emptyContent)
    expect(result.elegance).toBeGreaterThanOrEqual(0)
    expect(result.elegance).toBeLessThanOrEqual(100)
    expect(typeof result.frond).toBe('string')
    expect(result.denseCount).toBe(0)
    expect(result.crypticCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureUnfurling(emptyContent)
    const rich = measureUnfurling(richContent)
    expect(rich.elegance).toBeGreaterThan(empty.elegance)
  })

  it('detects readable in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects well formatted in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasWellFormatted).toBe(true)
  })

  it('detects descriptive in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasDescriptive).toBe(true)
  })

  it('detects consistent in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasConsistent).toBe(true)
  })

  it('detects spacious in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasSpacious).toBe(true)
  })

  it('detects beautiful in rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasBeautiful).toBe(true)
  })

  it('detects high elegance for rich content', () => {
    const result = measureUnfurling(richContent)
    expect(result.hasHighElegance).toBe(true)
  })

  it('grades empty content as no-frond', () => {
    expect(measureUnfurling(emptyContent).frond).toBe('no-frond')
  })

  it('counts dense (var) in poor content', () => {
    const result = measureUnfurling(poorContent)
    expect(result.denseCount).toBeGreaterThan(0)
    expect(result.hasNoDense).toBe(false)
  })
})

// ─── measureDispersing ──────────────────────────────────────────────

describe('measureDispersing', () => {
  it('returns valid DispersingMeasure for empty content', () => {
    const result = measureDispersing(emptyContent)
    expect(result.distribution).toBeGreaterThanOrEqual(0)
    expect(result.distribution).toBeLessThanOrEqual(100)
    expect(typeof result.spore).toBe('string')
    expect(result.duplicatedCount).toBe(0)
    expect(result.privateOnlyCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureDispersing(emptyContent)
    const rich = measureDispersing(richContent)
    expect(rich.distribution).toBeGreaterThan(empty.distribution)
  })

  it('detects reused patterns in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasReusedPatterns).toBe(true)
  })

  it('detects shared utilities in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasSharedUtilities).toBe(true)
  })

  it('detects exported in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasExported).toBe(true)
  })

  it('detects documented in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects accessible in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasAccessible).toBe(true)
  })

  it('detects composable in rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasComposable).toBe(true)
  })

  it('detects high distribution for rich content', () => {
    const result = measureDispersing(richContent)
    expect(result.hasHighDistribution).toBe(true)
  })

  it('grades empty content as no-spore', () => {
    expect(measureDispersing(emptyContent).spore).toBe('no-spore')
  })

  it('counts duplicated (var) in poor content', () => {
    const result = measureDispersing(poorContent)
    expect(result.duplicatedCount).toBeGreaterThan(0)
    expect(result.hasNoDuplicated).toBe(false)
  })
})

// ─── measureRooting ─────────────────────────────────────────────────

describe('measureRooting', () => {
  it('returns valid RootingMeasure for empty content', () => {
    const result = measureRooting(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThanOrEqual(100)
    expect(typeof result.rhizome).toBe('string')
    expect(result.untypedCount).toBe(0)
    expect(result.shakyBaseCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureRooting(emptyContent)
    const rich = measureRooting(richContent)
    expect(rich.depth).toBeGreaterThan(empty.depth)
  })

  it('detects tested core in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasTestedCore).toBe(true)
  })

  it('detects typed foundation in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasTypedFoundation).toBe(true)
  })

  it('detects stable base in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasStableBase).toBe(true)
  })

  it('detects well structured in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects verified in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasVerified).toBe(true)
  })

  it('detects solid in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasSolid).toBe(true)
  })

  it('detects high depth for rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasHighDepth).toBe(true)
  })

  it('grades empty content as no-rhizome', () => {
    expect(measureRooting(emptyContent).rhizome).toBe('no-rhizome')
  })

  it('counts untyped (var) in poor content', () => {
    const result = measureRooting(poorContent)
    expect(result.untypedCount).toBeGreaterThan(0)
    expect(result.hasNoUntyped).toBe(false)
  })

  it('counts shaky base (any) in poor content', () => {
    const result = measureRooting(poorContent)
    expect(result.shakyBaseCount).toBeGreaterThan(0)
    expect(result.hasNoShakyBase).toBe(false)
  })
})

// ─── measureSpiraling ──────────────────────────────────────────────

describe('measureSpiraling', () => {
  it('returns valid SpiralingMeasure for empty content', () => {
    const result = measureSpiraling(emptyContent)
    expect(result.pattern).toBeGreaterThanOrEqual(0)
    expect(result.pattern).toBeLessThanOrEqual(100)
    expect(typeof result.fractal).toBe('string')
    expect(result.mixedCount).toBe(0)
    expect(result.randomVariationCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureSpiraling(emptyContent)
    const rich = measureSpiraling(richContent)
    expect(rich.pattern).toBeGreaterThan(empty.pattern)
  })

  it('detects consistent style in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasConsistentStyle).toBe(true)
  })

  it('detects uniform conventions in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasUniformConventions).toBe(true)
  })

  it('detects repeated patterns in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasRepeatedPatterns).toBe(true)
  })

  it('detects predictable in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasPredictable).toBe(true)
  })

  it('detects systematic in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasSystematic).toBe(true)
  })

  it('detects regular in rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasRegular).toBe(true)
  })

  it('detects high pattern for rich content', () => {
    const result = measureSpiraling(richContent)
    expect(result.hasHighPattern).toBe(true)
  })

  it('grades empty content as no-pattern', () => {
    expect(measureSpiraling(emptyContent).fractal).toBe('no-pattern')
  })

  it('counts mixed (var) in poor content', () => {
    const result = measureSpiraling(poorContent)
    expect(result.mixedCount).toBeGreaterThan(0)
    expect(result.hasNoMixed).toBe(false)
  })
})

// ─── classifyFrondCondition ─────────────────────────────────────────

describe('classifyFrondCondition', () => {
  it('classifies 90 as silver-koru', () => expect(classifyFrondCondition(90)).toBe('silver-koru'))
  it('classifies 75 as lush-frond', () => expect(classifyFrondCondition(75)).toBe('lush-frond'))
  it('classifies 60 as proper-fern', () => expect(classifyFrondCondition(60)).toBe('proper-fern'))
  it('classifies 45 as wilted-frond', () => expect(classifyFrondCondition(45)).toBe('wilted-frond'))
  it('classifies 30 as brown-leaf', () => expect(classifyFrondCondition(30)).toBe('brown-leaf'))
  it('classifies 10 as dead-spore', () => expect(classifyFrondCondition(10)).toBe('dead-spore'))
  it('classifies 0 as dead-spore', () => expect(classifyFrondCondition(0)).toBe('dead-spore'))
  it('classifies 85 as silver-koru', () => expect(classifyFrondCondition(85)).toBe('silver-koru'))
})

// ─── classifyGroveType ──────────────────────────────────────────────

describe('classifyGroveType', () => {
  it('returns no-grove for empty fronds', () => {
    expect(classifyGroveType([])).toBe('no-grove')
  })

  it('returns single-frond for one frond', () => {
    const frond = analyzeFernFrond(richContent, 'f.ts')
    expect(classifyGroveType([frond])).toBe('single-frond')
  })

  it('returns ancient-forest for high quality koru majority', () => {
    const fronds: FernFrond[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      resilienceNature: 90, frondElegance: 90, sporeDistribution: 90,
      rhizomeDepth: 90, fractalPattern: 90,
      enduring: measureEnduring(richContent),
      unfurling: measureUnfurling(richContent),
      dispersing: measureDispersing(richContent),
      rooting: measureRooting(richContent),
      spiraling: measureSpiraling(richContent),
      condition: 'silver-koru' as const,
      qualityScore: 85,
    }))
    const result = classifyGroveType(fronds)
    expect(['ancient-forest', 'silver-grove']).toContain(result)
  })

  it('returns no-grove for very low quality', () => {
    const fronds: FernFrond[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      resilienceNature: 5, frondElegance: 5, sporeDistribution: 5,
      rhizomeDepth: 5, fractalPattern: 5,
      enduring: measureEnduring(emptyContent),
      unfurling: measureUnfurling(emptyContent),
      dispersing: measureDispersing(emptyContent),
      rooting: measureRooting(emptyContent),
      spiraling: measureSpiraling(emptyContent),
      condition: 'dead-spore' as const,
      qualityScore: 5,
    }))
    expect(classifyGroveType(fronds)).toBe('no-grove')
  })
})

// ─── classifyGroveCondition ─────────────────────────────────────────

describe('classifyGroveCondition', () => {
  it('classifies 80 as primeval-forest', () => expect(classifyGroveCondition(80)).toBe('primeval-forest'))
  it('classifies 65 as lush-rainforest', () => expect(classifyGroveCondition(65)).toBe('lush-rainforest'))
  it('classifies 50 as decent-grove', () => expect(classifyGroveCondition(50)).toBe('decent-grove'))
  it('classifies 35 as sparse-patch', () => expect(classifyGroveCondition(35)).toBe('sparse-patch'))
  it('classifies 20 as barren-ground', () => expect(classifyGroveCondition(20)).toBe('barren-ground'))
  it('classifies 5 as void', () => expect(classifyGroveCondition(5)).toBe('void'))
})

// ─── classifyBotanistGrade ──────────────────────────────────────────

describe('classifyBotanistGrade', () => {
  it('classifies 85 as master-botanist', () => expect(classifyBotanistGrade(85)).toBe('master-botanist'))
  it('classifies 70 as expert-horticulturist', () => expect(classifyBotanistGrade(70)).toBe('expert-horticulturist'))
  it('classifies 55 as skilled-gardener', () => expect(classifyBotanistGrade(55)).toBe('skilled-gardener'))
  it('classifies 40 as apprentice', () => expect(classifyBotanistGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifyBotanistGrade(25)).toBe('novice'))
  it('classifies 10 as withered', () => expect(classifyBotanistGrade(10)).toBe('withered'))
})

// ─── analyzeFernFrond ──────────────────────────────────────────────

describe('analyzeFernFrond', () => {
  it('analyzes empty content as dead-spore', () => {
    const result = analyzeFernFrond(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('dead-spore')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeFernFrond(emptyContent, 'empty.ts')
    const rich = analyzeFernFrond(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeFernFrond(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.enduring.resilience * 0.2 +
      result.unfurling.elegance * 0.2 +
      result.dispersing.distribution * 0.2 +
      result.rooting.depth * 0.2 +
      result.spiraling.pattern * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.enduring).toBeDefined()
    expect(result.unfurling).toBeDefined()
    expect(result.dispersing).toBeDefined()
    expect(result.rooting).toBeDefined()
    expect(result.spiraling).toBeDefined()
  })

  it('sets resilienceNature from enduring.resilience', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.resilienceNature).toBe(result.enduring.resilience)
  })

  it('sets frondElegance from unfurling.elegance', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.frondElegance).toBe(result.unfurling.elegance)
  })

  it('sets sporeDistribution from dispersing.distribution', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.sporeDistribution).toBe(result.dispersing.distribution)
  })

  it('sets rhizomeDepth from rooting.depth', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.rhizomeDepth).toBe(result.rooting.depth)
  })

  it('sets fractalPattern from spiraling.pattern', () => {
    const result = analyzeFernFrond(richContent, 'rich.ts')
    expect(result.fractalPattern).toBe(result.spiraling.pattern)
  })
})

// ─── analyzeFernGrove ──────────────────────────────────────────────

describe('analyzeFernGrove', () => {
  it('returns empty grove for no fronds', () => {
    const result = analyzeFernGrove([], 'src')
    expect(result.directory).toBe('src')
    expect(result.fronds).toHaveLength(0)
    expect(result.avgResilience).toBe(0)
    expect(result.avgElegance).toBe(0)
    expect(result.avgPattern).toBe(0)
    expect(result.silverKoruCount).toBe(0)
    expect(result.deadSporeCount).toBe(0)
    expect(result.groveType).toBe('no-grove')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single frond', () => {
    const frond = analyzeFernFrond(richContent, 'rich.ts')
    const result = analyzeFernGrove([frond], 'src')
    expect(result.avgResilience).toBe(frond.resilienceNature)
    expect(result.avgElegance).toBe(frond.frondElegance)
    expect(result.avgPattern).toBe(frond.fractalPattern)
  })

  it('counts silver koru and dead spores', () => {
    const koru = analyzeFernFrond(richContent, 'rich.ts')
    const dead = analyzeFernFrond(emptyContent, 'empty.ts')
    if (koru.condition === 'silver-koru' && dead.condition === 'dead-spore') {
      const result = analyzeFernGrove([koru, dead], 'src')
      expect(result.silverKoruCount).toBe(1)
      expect(result.deadSporeCount).toBe(1)
    }
  })
})

// ─── buildSilverFernResult ─────────────────────────────────────────

describe('buildSilverFernResult', () => {
  it('handles empty input', async () => {
    const result = await buildSilverFernResult([], [])
    expect(result.fronds).toHaveLength(0)
    expect(result.groves).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalGroves).toBe(0)
    expect(result.stats.overallVerdure).toBe(0)
    expect(result.forest.isLush).toBe(false)
    expect(result.forest.overallVerdure).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildSilverFernResult(['file.ts'], [richContent])
    expect(result.fronds).toHaveLength(1)
    expect(result.fronds[0].file).toBe('file.ts')
    expect(result.groves).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into groves by directory', async () => {
    const result = await buildSilverFernResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.fronds).toHaveLength(3)
    expect(result.groves).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalGroves).toBe(2)
  })

  it('computes forest summary correctly', async () => {
    const result = await buildSilverFernResult(['f.ts'], [richContent])
    expect(result.forest.avgResilience).toBe(result.fronds[0].resilienceNature)
    expect(result.forest.overallVerdure).toBeGreaterThanOrEqual(0)
  })

  it('sets isLush when avgResilience >= 60', async () => {
    const result = await buildSilverFernResult(['f.ts'], [richContent])
    if (result.forest.avgResilience >= 60) {
      expect(result.forest.isLush).toBe(true)
    } else {
      expect(result.forest.isLush).toBe(false)
    }
  })

  it('tracks best frond and top performers', async () => {
    const result = await buildSilverFernResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestFrond).toBe('a.ts')
    expect(result.stats.mostResilient).toBeDefined()
    expect(result.stats.mostElegant).toBeDefined()
    expect(result.stats.bestDistributed).toBeDefined()
    expect(result.stats.deepestRooted).toBeDefined()
  })

  it('computes overallVerdure as avg of resilience+elegance+pattern', async () => {
    const result = await buildSilverFernResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.forest.avgResilience + result.forest.avgElegance + result.forest.avgPattern) / 3,
    )
    expect(result.forest.overallVerdure).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildSilverFernResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.silverKoruCount +
      result.stats.lushFrondCount +
      result.stats.properFernCount +
      result.stats.wiltedFrondCount +
      result.stats.brownLeafCount +
      result.stats.deadSporeCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildSilverFernResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets botanist grade', async () => {
    const result = await buildSilverFernResult(['f.ts'], [richContent])
    expect(['master-botanist', 'expert-horticulturist', 'skilled-gardener', 'apprentice', 'novice', 'withered']).toContain(
      result.stats.botanistGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: SilverFernStats = {
    totalFiles: 0, totalGroves: 0,
    avgResilienceNature: 0, avgFrondElegance: 0, avgSporeDistribution: 0,
    avgRhizomeDepth: 0, avgFractalPattern: 0,
    silverKoruCount: 0, lushFrondCount: 0, properFernCount: 0,
    wiltedFrondCount: 0, brownLeafCount: 0, deadSporeCount: 0,
    hasHighResilienceCount: 0, hasHighEleganceCount: 0, hasHighDistributionCount: 0,
    hasHighDepthCount: 0, hasHighPatternCount: 0,
    overallVerdure: 0, botanistGrade: 'withered',
    bestFrond: '', mostResilient: '', mostElegant: '', bestDistributed: '', deepestRooted: '',
  }

  const emptyForest: ForestSummary = {
    avgResilience: 0, avgElegance: 0, avgPattern: 0,
    isLush: false, overallVerdure: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyForest, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes resilience recommendation when avgResilienceNature < 50', () => {
    const stats = { ...emptyStats, avgResilienceNature: 30 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('resilience'))).toBe(true)
  })

  it('includes elegance recommendation when avgFrondElegance < 50', () => {
    const stats = { ...emptyStats, avgFrondElegance: 30 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('elegance') || r.includes('Unfurl'))).toBe(true)
  })

  it('includes distribution recommendation when avgSporeDistribution < 50', () => {
    const stats = { ...emptyStats, avgSporeDistribution: 30 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('spore') || r.includes('distribution'))).toBe(true)
  })

  it('includes rhizome recommendation when avgRhizomeDepth < 50', () => {
    const stats = { ...emptyStats, avgRhizomeDepth: 30 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('rhizome') || r.includes('foundations'))).toBe(true)
  })

  it('includes fractal recommendation when avgFractalPattern < 50', () => {
    const stats = { ...emptyStats, avgFractalPattern: 30 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('fractal') || r.includes('pattern'))).toBe(true)
  })

  it('includes dead spore guidance when deadSporeCount > 0', () => {
    const stats = { ...emptyStats, deadSporeCount: 3 }
    const recs = generateRecommendations([], [], emptyForest, stats)
    expect(recs.some(r => r.includes('dead spore'))).toBe(true)
  })

  it('includes verdure recommendation when overallVerdure < 40', () => {
    const stats = { ...emptyStats, overallVerdure: 20 }
    const forest = { ...emptyForest, overallVerdure: 20 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('verdure'))).toBe(true)
  })

  it('praises master quality when all metrics are high', () => {
    const highStats: SilverFernStats = {
      ...emptyStats,
      avgResilienceNature: 80, avgFrondElegance: 80, avgSporeDistribution: 80,
      avgRhizomeDepth: 80, avgFractalPattern: 80,
      overallVerdure: 80, botanistGrade: 'master-botanist',
    }
    const highForest: ForestSummary = {
      avgResilience: 80, avgElegance: 80, avgPattern: 80,
      isLush: true, overallVerdure: 80,
    }
    const recs = generateRecommendations([], [], highForest, highStats)
    expect(recs.some(r => r.includes('master botanist'))).toBe(true)
  })

  it('mentions specific dead files when <= 3', () => {
    const frond: FernFrond = analyzeFernFrond(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, deadSporeCount: 1 }
    const recs = generateRecommendations([frond], [], emptyForest, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => expect(typeof colorScore(50)).toBe('string'))
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('returns a string for silver-koru', () => expect(typeof colorGrade('silver-koru')).toBe('string'))
  it('returns a string for dead-spore', () => expect(typeof colorGrade('dead-spore')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatFrondTable', () => {
  it('formats a single frond', () => {
    const frond = analyzeFernFrond(richContent, 'rich.ts')
    const result = formatFrondTable(frond)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Resilience Nature')
    expect(result).toContain('Frond Elegance')
    expect(result).toContain('Spore Distribution')
    expect(result).toContain('Rhizome Depth')
    expect(result).toContain('Fractal Pattern')
  })
})

describe('formatFrondsTable', () => {
  it('handles empty array', () => expect(formatFrondsTable([])).toContain('No fern fronds'))
  it('formats multiple fronds', () => {
    const fronds = [
      analyzeFernFrond(richContent, 'a.ts'),
      analyzeFernFrond(moderateContent, 'b.ts'),
    ]
    const result = formatFrondsTable(fronds)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatGroveTable', () => {
  it('formats a grove', () => {
    const frond = analyzeFernFrond(richContent, 'rich.ts')
    const grove = analyzeFernGrove([frond], 'src')
    const result = formatGroveTable(grove)
    expect(result).toContain('src')
    expect(result).toContain('Grove')
  })
})

describe('formatGrovesTable', () => {
  it('handles empty array', () => expect(formatGrovesTable([])).toContain('No fern groves'))
  it('formats groves', () => {
    const frond = analyzeFernFrond(richContent, 'src/a.ts')
    const grove = analyzeFernGrove([frond], 'src')
    const result = formatGrovesTable([grove])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildSilverFernResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Silver Fern Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Verdure')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Strengthen resilience', 'Unfurl elegance'])
    expect(result).toContain('Strengthen resilience')
    expect(result).toContain('Unfurl elegance')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSilverFernResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Silver Fern Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Lush')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSilverFernResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.fronds).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.forest).toBeDefined()
  })
})
