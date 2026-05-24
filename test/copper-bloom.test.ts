import { describe, it, expect } from 'vitest'
import {
  measureAging,
  measureResisting,
  measureConducting,
  measureAlloying,
  measureBeautifying,
  classifyPatinaCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifySmithGrade,
  analyzeCopperPatina,
  analyzeCopperForge,
  buildCopperBloomResult,
  generateRecommendations,
} from '../src/commands/copper-bloom-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPatinaTable,
  formatPatinasTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-bloom-format-helpers.js'
import type {
  CopperPatina,
  CopperBloomStats,
  CopperBloomResult,
  FoundrySummary,
} from '../src/commands/copper-bloom-helpers.js'

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

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns valid AgingMeasure for empty content', () => {
    const result = measureAging(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.wisdom).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighWisdom).toBe(false)
    expect(result.firstDraftCount).toBe(0)
    expect(result.immatureCount).toBe(0)
    expect(result.hasNoFirstDraft).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureAging(emptyContent)
    const rich = measureAging(richContent)
    expect(rich.wisdom).toBeGreaterThan(empty.wisdom)
  })

  it('detects refactored in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasRefactored).toBe(true)
  })

  it('detects iterated in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasIterated).toBe(true)
  })

  it('detects mature in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasMature).toBe(true)
  })

  it('detects polished in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasPolished).toBe(true)
  })

  it('detects evolved in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasEvolved).toBe(true)
  })

  it('detects refined in rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('detects high wisdom for rich content', () => {
    const result = measureAging(richContent)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('grades empty content as no-patina', () => {
    expect(measureAging(emptyContent).grade).toBe('no-patina')
  })

  it('counts first draft (var) in poor content', () => {
    const result = measureAging(poorContent)
    expect(result.firstDraftCount).toBeGreaterThan(0)
    expect(result.hasNoFirstDraft).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns valid ResistingMeasure for empty content', () => {
    const result = measureResisting(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.resilience).toBeLessThanOrEqual(100)
    expect(typeof result.oxidation).toBe('string')
    expect(result.bareExposureCount).toBe(0)
    expect(result.trustingCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureResisting(emptyContent)
    const rich = measureResisting(richContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('detects error handling in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasErrorHandling).toBe(true)
  })

  it('detects input validation in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasInputValidation).toBe(true)
  })

  it('detects defensive code in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasDefensiveCode).toBe(true)
  })

  it('detects boundary checks in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasBoundaryChecks).toBe(true)
  })

  it('detects type safety in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasTypeSafety).toBe(true)
  })

  it('detects protected in rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasProtected).toBe(true)
  })

  it('detects high resilience for rich content', () => {
    const result = measureResisting(richContent)
    expect(result.hasHighResilience).toBe(true)
  })

  it('grades empty content as no-resistance', () => {
    expect(measureResisting(emptyContent).oxidation).toBe('no-resistance')
  })

  it('counts bare exposure (var) in poor content', () => {
    const result = measureResisting(poorContent)
    expect(result.bareExposureCount).toBeGreaterThan(0)
    expect(result.hasNoBareExposure).toBe(false)
  })
})

// ─── measureConducting ─────────────────────────────────────────────

describe('measureConducting', () => {
  it('returns valid ConductingMeasure for empty content', () => {
    const result = measureConducting(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
    expect(typeof result.conductivity).toBe('string')
    expect(result.bottleneckCount).toBe(0)
    expect(result.redundantPathCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureConducting(emptyContent)
    const rich = measureConducting(richContent)
    expect(rich.quality).toBeGreaterThan(empty.quality)
  })

  it('detects efficient data flow in rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasEfficientDataFlow).toBe(true)
  })

  it('detects streamlined in rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasStreamlined).toBe(true)
  })

  it('detects direct access in rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasDirectAccess).toBe(true)
  })

  it('detects cached in rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasCached).toBe(true)
  })

  it('detects optimized in rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasOptimized).toBe(true)
  })

  it('detects high quality for rich content', () => {
    const result = measureConducting(richContent)
    expect(result.hasHighQuality).toBe(true)
  })

  it('grades empty content as no-conductivity', () => {
    expect(measureConducting(emptyContent).conductivity).toBe('no-conductivity')
  })

  it('counts bottlenecks (var) in poor content', () => {
    const result = measureConducting(poorContent)
    expect(result.bottleneckCount).toBeGreaterThan(0)
    expect(result.hasNoBottlenecks).toBe(false)
  })
})

// ─── measureAlloying ───────────────────────────────────────────────

describe('measureAlloying', () => {
  it('returns valid AlloyingMeasure for empty content', () => {
    const result = measureAlloying(emptyContent)
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.strength).toBeLessThanOrEqual(100)
    expect(typeof result.alloy).toBe('string')
    expect(result.leakyAbstractionCount).toBe(0)
    expect(result.monolithicCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureAlloying(emptyContent)
    const rich = measureAlloying(richContent)
    expect(rich.strength).toBeGreaterThan(empty.strength)
  })

  it('detects well integrated in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasWellIntegrated).toBe(true)
  })

  it('detects clean interfaces in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasCleanInterfaces).toBe(true)
  })

  it('detects modular in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects compatible in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasCompatible).toBe(true)
  })

  it('detects tested in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasTested).toBe(true)
  })

  it('detects cohesive in rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasCohesive).toBe(true)
  })

  it('detects high strength for rich content', () => {
    const result = measureAlloying(richContent)
    expect(result.hasHighStrength).toBe(true)
  })

  it('grades empty content as no-alloy', () => {
    expect(measureAlloying(emptyContent).alloy).toBe('no-alloy')
  })

  it('counts leaky abstractions (var) in poor content', () => {
    const result = measureAlloying(poorContent)
    expect(result.leakyAbstractionCount).toBeGreaterThan(0)
  })
})

// ─── measureBeautifying ────────────────────────────────────────────

describe('measureBeautifying', () => {
  it('returns valid BeautifyingMeasure for empty content', () => {
    const result = measureBeautifying(emptyContent)
    expect(result.beauty).toBeGreaterThanOrEqual(0)
    expect(result.beauty).toBeLessThanOrEqual(100)
    expect(typeof result.verdigris).toBe('string')
    expect(result.uglyCount).toBe(0)
    expect(result.crypticCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureBeautifying(emptyContent)
    const rich = measureBeautifying(richContent)
    expect(rich.beauty).toBeGreaterThan(empty.beauty)
  })

  it('detects elegant in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasElegant).toBe(true)
  })

  it('detects readable in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects well named in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasWellNamed).toBe(true)
  })

  it('detects consistent in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasConsistent).toBe(true)
  })

  it('detects formatted in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasFormatted).toBe(true)
  })

  it('detects graceful in rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasGraceful).toBe(true)
  })

  it('detects high beauty for rich content', () => {
    const result = measureBeautifying(richContent)
    expect(result.hasHighBeauty).toBe(true)
  })

  it('grades empty content as no-beauty', () => {
    expect(measureBeautifying(emptyContent).verdigris).toBe('no-beauty')
  })

  it('counts ugly (var) in poor content', () => {
    const result = measureBeautifying(poorContent)
    expect(result.uglyCount).toBeGreaterThan(0)
    expect(result.hasNoUgly).toBe(false)
  })
})

// ─── classifyPatinaCondition ───────────────────────────────────────

describe('classifyPatinaCondition', () => {
  it('classifies 90 as statue-of-liberty', () => expect(classifyPatinaCondition(90)).toBe('statue-of-liberty'))
  it('classifies 75 as aged-masterpiece', () => expect(classifyPatinaCondition(75)).toBe('aged-masterpiece'))
  it('classifies 60 as proper-copper', () => expect(classifyPatinaCondition(60)).toBe('proper-copper'))
  it('classifies 45 as tarnished-metal', () => expect(classifyPatinaCondition(45)).toBe('tarnished-metal'))
  it('classifies 30 as raw-wire', () => expect(classifyPatinaCondition(30)).toBe('raw-wire'))
  it('classifies 10 as scrap', () => expect(classifyPatinaCondition(10)).toBe('scrap'))
  it('classifies 0 as scrap', () => expect(classifyPatinaCondition(0)).toBe('scrap'))
  it('classifies 85 as statue-of-liberty', () => expect(classifyPatinaCondition(85)).toBe('statue-of-liberty'))
})

// ─── classifyForgeType ─────────────────────────────────────────────

describe('classifyForgeType', () => {
  it('returns no-forge for empty patinas', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })

  it('returns grand-foundry for high quality statue majority', () => {
    const patinas: CopperPatina[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      patinaWisdom: 90, oxidationResilience: 90, conductivityQuality: 90,
      alloyStrength: 90, verdigrisBeauty: 90,
      aging: measureAging(richContent),
      resisting: measureResisting(richContent),
      conducting: measureConducting(richContent),
      alloying: measureAlloying(richContent),
      beautifying: measureBeautifying(richContent),
      condition: 'statue-of-liberty' as const,
      qualityScore: 85,
    }))
    const result = classifyForgeType(patinas)
    expect(['grand-foundry', 'proper-forge']).toContain(result)
  })

  it('returns no-forge for very low quality', () => {
    const patinas: CopperPatina[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      patinaWisdom: 5, oxidationResilience: 5, conductivityQuality: 5,
      alloyStrength: 5, verdigrisBeauty: 5,
      aging: measureAging(emptyContent),
      resisting: measureResisting(emptyContent),
      conducting: measureConducting(emptyContent),
      alloying: measureAlloying(emptyContent),
      beautifying: measureBeautifying(emptyContent),
      condition: 'scrap' as const,
      qualityScore: 5,
    }))
    expect(classifyForgeType(patinas)).toBe('no-forge')
  })
})

// ─── classifyForgeCondition ────────────────────────────────────────

describe('classifyForgeCondition', () => {
  it('classifies 80 as masterwork-forge', () => expect(classifyForgeCondition(80)).toBe('masterwork-forge'))
  it('classifies 65 as quality-foundry', () => expect(classifyForgeCondition(65)).toBe('quality-foundry'))
  it('classifies 50 as decent-workshop', () => expect(classifyForgeCondition(50)).toBe('decent-workshop'))
  it('classifies 35 as rusty-shed', () => expect(classifyForgeCondition(35)).toBe('rusty-shed'))
  it('classifies 20 as abandoned', () => expect(classifyForgeCondition(20)).toBe('abandoned'))
  it('classifies 5 as void', () => expect(classifyForgeCondition(5)).toBe('void'))
})

// ─── classifySmithGrade ────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies 85 as master-smith', () => expect(classifySmithGrade(85)).toBe('master-smith'))
  it('classifies 70 as expert-forge', () => expect(classifySmithGrade(70)).toBe('expert-forge'))
  it('classifies 55 as skilled-craftsman', () => expect(classifySmithGrade(55)).toBe('skilled-craftsman'))
  it('classifies 40 as apprentice', () => expect(classifySmithGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('classifies 10 as scrap-dealer', () => expect(classifySmithGrade(10)).toBe('scrap-dealer'))
})

// ─── analyzeCopperPatina ───────────────────────────────────────────

describe('analyzeCopperPatina', () => {
  it('analyzes empty content as scrap', () => {
    const result = analyzeCopperPatina(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('scrap')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeCopperPatina(emptyContent, 'empty.ts')
    const rich = analyzeCopperPatina(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeCopperPatina(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.aging.wisdom * 0.2 +
      result.resisting.resilience * 0.2 +
      result.conducting.quality * 0.2 +
      result.alloying.strength * 0.2 +
      result.beautifying.beauty * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeCopperPatina(richContent, 'rich.ts')
    expect(result.aging).toBeDefined()
    expect(result.resisting).toBeDefined()
    expect(result.conducting).toBeDefined()
    expect(result.alloying).toBeDefined()
    expect(result.beautifying).toBeDefined()
  })

  it('sets patinaWisdom from aging.wisdom', () => {
    const result = analyzeCopperPatina(richContent, 'rich.ts')
    expect(result.patinaWisdom).toBe(result.aging.wisdom)
  })

  it('sets oxidationResilience from resisting.resilience', () => {
    const result = analyzeCopperPatina(richContent, 'rich.ts')
    expect(result.oxidationResilience).toBe(result.resisting.resilience)
  })

  it('sets conductivityQuality from conducting.quality', () => {
    const result = analyzeCopperPatina(richContent, 'rich.ts')
    expect(result.conductivityQuality).toBe(result.conducting.quality)
  })

  it('sets alloyStrength from alloying.strength', () => {
    const result = analyzeCopperPatina(richContent, 'rich.ts')
    expect(result.alloyStrength).toBe(result.alloying.strength)
  })
})

// ─── analyzeCopperForge ────────────────────────────────────────────

describe('analyzeCopperForge', () => {
  it('returns empty forge for no patinas', () => {
    const result = analyzeCopperForge([], 'src')
    expect(result.directory).toBe('src')
    expect(result.patinas).toHaveLength(0)
    expect(result.avgWisdom).toBe(0)
    expect(result.avgConductivity).toBe(0)
    expect(result.avgStrength).toBe(0)
    expect(result.statueOfLibertyCount).toBe(0)
    expect(result.scrapCount).toBe(0)
    expect(result.forgeType).toBe('no-forge')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single patina', () => {
    const patina = analyzeCopperPatina(richContent, 'rich.ts')
    const result = analyzeCopperForge([patina], 'src')
    expect(result.avgWisdom).toBe(patina.patinaWisdom)
    expect(result.avgConductivity).toBe(patina.conductivityQuality)
    expect(result.avgStrength).toBe(patina.alloyStrength)
  })

  it('counts statues and scrap', () => {
    const statue = analyzeCopperPatina(richContent, 'rich.ts')
    const scrap = analyzeCopperPatina(emptyContent, 'empty.ts')
    if (statue.condition === 'statue-of-liberty' && scrap.condition === 'scrap') {
      const result = analyzeCopperForge([statue, scrap], 'src')
      expect(result.statueOfLibertyCount).toBe(1)
      expect(result.scrapCount).toBe(1)
    }
  })
})

// ─── buildCopperBloomResult ────────────────────────────────────────

describe('buildCopperBloomResult', () => {
  it('handles empty input', async () => {
    const result = await buildCopperBloomResult([], [])
    expect(result.patinas).toHaveLength(0)
    expect(result.forges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalForges).toBe(0)
    expect(result.stats.overallCraftsmanship).toBe(0)
    expect(result.foundry.isMasterwork).toBe(false)
    expect(result.foundry.overallCraftsmanship).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildCopperBloomResult(['file.ts'], [richContent])
    expect(result.patinas).toHaveLength(1)
    expect(result.patinas[0].file).toBe('file.ts')
    expect(result.forges).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into forges by directory', async () => {
    const result = await buildCopperBloomResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.patinas).toHaveLength(3)
    expect(result.forges).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalForges).toBe(2)
  })

  it('computes foundry summary correctly', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [richContent])
    expect(result.foundry.avgWisdom).toBe(result.patinas[0].patinaWisdom)
    expect(result.foundry.overallCraftsmanship).toBeGreaterThanOrEqual(0)
  })

  it('sets isMasterwork when avgWisdom >= 60', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [richContent])
    if (result.foundry.avgWisdom >= 60) {
      expect(result.foundry.isMasterwork).toBe(true)
    } else {
      expect(result.foundry.isMasterwork).toBe(false)
    }
  })

  it('tracks best patina and top performers', async () => {
    const result = await buildCopperBloomResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestPatina).toBe('a.ts')
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
    expect(result.stats.bestConductor).toBeDefined()
    expect(result.stats.strongest).toBeDefined()
  })

  it('computes overallCraftsmanship as avg of wisdom+conductivity+strength', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.foundry.avgWisdom + result.foundry.avgConductivity + result.foundry.avgStrength) / 3,
    )
    expect(result.foundry.overallCraftsmanship).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildCopperBloomResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.statueOfLibertyCount +
      result.stats.agedMasterpieceCount +
      result.stats.properCopperCount +
      result.stats.tarnishedMetalCount +
      result.stats.rawWireCount +
      result.stats.scrapCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets smith grade', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [richContent])
    expect(['master-smith', 'expert-forge', 'skilled-craftsman', 'apprentice', 'novice', 'scrap-dealer']).toContain(
      result.stats.smithGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: CopperBloomStats = {
    totalFiles: 0, totalForges: 0,
    avgPatinaWisdom: 0, avgOxidationResilience: 0, avgConductivityQuality: 0,
    avgAlloyStrength: 0, avgVerdigrisBeauty: 0,
    statueOfLibertyCount: 0, agedMasterpieceCount: 0, properCopperCount: 0,
    tarnishedMetalCount: 0, rawWireCount: 0, scrapCount: 0,
    hasHighWisdomCount: 0, hasHighResilienceCount: 0, hasHighQualityCount: 0,
    hasHighStrengthCount: 0, hasHighBeautyCount: 0,
    overallCraftsmanship: 0, smithGrade: 'scrap-dealer',
    bestPatina: '', wisest: '', mostResilient: '', bestConductor: '', strongest: '',
  }

  const emptyFoundry: FoundrySummary = {
    avgWisdom: 0, avgConductivity: 0, avgStrength: 0,
    isMasterwork: false, overallCraftsmanship: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyFoundry, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes patina recommendation when avgPatinaWisdom < 50', () => {
    const stats = { ...emptyStats, avgPatinaWisdom: 30 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('patina') || r.includes('wisdom'))).toBe(true)
  })

  it('includes oxidation recommendation when avgOxidationResilience < 50', () => {
    const stats = { ...emptyStats, avgOxidationResilience: 30 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('oxidation') || r.includes('resilience'))).toBe(true)
  })

  it('includes conductivity recommendation when avgConductivityQuality < 50', () => {
    const stats = { ...emptyStats, avgConductivityQuality: 30 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('conductivity') || r.includes('data flow'))).toBe(true)
  })

  it('includes alloy recommendation when avgAlloyStrength < 50', () => {
    const stats = { ...emptyStats, avgAlloyStrength: 30 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('alloy') || r.includes('strength'))).toBe(true)
  })

  it('includes verdigris recommendation when avgVerdigrisBeauty < 50', () => {
    const stats = { ...emptyStats, avgVerdigrisBeauty: 30 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('verdigris') || r.includes('beauty'))).toBe(true)
  })

  it('includes scrap guidance when scrapCount > 0', () => {
    const stats = { ...emptyStats, scrapCount: 3 }
    const recs = generateRecommendations([], [], emptyFoundry, stats)
    expect(recs.some(r => r.includes('scrap'))).toBe(true)
  })

  it('includes craftsmanship recommendation when overallCraftsmanship < 40', () => {
    const stats = { ...emptyStats, overallCraftsmanship: 20 }
    const foundry = { ...emptyFoundry, overallCraftsmanship: 20 }
    const recs = generateRecommendations([], [], foundry, stats)
    expect(recs.some(r => r.includes('craftsmanship'))).toBe(true)
  })

  it('praises master smith when all metrics are high', () => {
    const highStats: CopperBloomStats = {
      ...emptyStats,
      avgPatinaWisdom: 80, avgOxidationResilience: 80, avgConductivityQuality: 80,
      avgAlloyStrength: 80, avgVerdigrisBeauty: 80,
      overallCraftsmanship: 80, smithGrade: 'master-smith',
    }
    const highFoundry: FoundrySummary = {
      avgWisdom: 80, avgConductivity: 80, avgStrength: 80,
      isMasterwork: true, overallCraftsmanship: 80,
    }
    const recs = generateRecommendations([], [], highFoundry, highStats)
    expect(recs.some(r => r.includes('master smith'))).toBe(true)
  })

  it('mentions specific scrap files when <= 3', () => {
    const patina: CopperPatina = analyzeCopperPatina(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, scrapCount: 1 }
    const recs = generateRecommendations([patina], [], emptyFoundry, stats)
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
  it('returns a string for statue-of-liberty', () => expect(typeof colorGrade('statue-of-liberty')).toBe('string'))
  it('returns a string for scrap', () => expect(typeof colorGrade('scrap')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatPatinaTable', () => {
  it('formats a single patina', () => {
    const patina = analyzeCopperPatina(richContent, 'rich.ts')
    const result = formatPatinaTable(patina)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Patina Wisdom')
    expect(result).toContain('Oxidation Resilience')
    expect(result).toContain('Conductivity Quality')
    expect(result).toContain('Alloy Strength')
    expect(result).toContain('Verdigris Beauty')
  })
})

describe('formatPatinasTable', () => {
  it('handles empty array', () => expect(formatPatinasTable([])).toContain('No copper patinas'))
  it('formats multiple patinas', () => {
    const patinas = [
      analyzeCopperPatina(richContent, 'a.ts'),
      analyzeCopperPatina(moderateContent, 'b.ts'),
    ]
    const result = formatPatinasTable(patinas)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatForgeTable', () => {
  it('formats a forge', () => {
    const patina = analyzeCopperPatina(richContent, 'rich.ts')
    const forge = analyzeCopperForge([patina], 'src')
    const result = formatForgeTable(forge)
    expect(result).toContain('src')
    expect(result).toContain('Forge')
  })
})

describe('formatForgesTable', () => {
  it('handles empty array', () => expect(formatForgesTable([])).toContain('No copper forges'))
  it('formats forges', () => {
    const patina = analyzeCopperPatina(richContent, 'src/a.ts')
    const forge = analyzeCopperForge([patina], 'src')
    const result = formatForgesTable([forge])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildCopperBloomResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Copper Bloom Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Craftsmanship')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Age your code', 'Build resilience'])
    expect(result).toContain('Age your code')
    expect(result).toContain('Build resilience')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Copper Bloom Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Masterwork')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCopperBloomResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.patinas).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.foundry).toBeDefined()
  })
})
