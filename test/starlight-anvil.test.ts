import { describe, it, expect } from 'vitest'
import {
  measureCrafting,
  measureHardening,
  measurePatterning,
  measureClarifying,
  measureStrengthening,
  classifyForgeCondition,
  classifyForgeType,
  classifyWorkshopCondition,
  classifySmithGrade,
  analyzeStarForge,
  analyzeCosmicForge,
  buildStarlightAnvilResult,
  generateRecommendations,
} from '../src/commands/starlight-anvil-helpers.js'
import {
  colorScore,
  colorGrade,
  formatForgeTable,
  formatForgesTable,
  formatWorkshopTable,
  formatWorkshopsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/starlight-anvil-format-helpers.js'
import type { StarForge, StarlightAnvilStats, StarlightCosmos } from '../src/commands/starlight-anvil-helpers.js'

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

class Validator {
  private data: unknown
  constructor(input: unknown) {
    this.data = input
  }
}

switch (status) {
  case Status.Active:
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureCrafting ───────────────────────────────────────────────

describe('measureCrafting', () => {
  it('returns no-forge for empty content', () => {
    const m = measureCrafting(emptyContent)
    expect(m.forging).toBe(0)
    expect(m.grade).toBe('no-forge')
    expect(m.hasHighForging).toBe(false)
    expect(m.hackedCount).toBe(0)
    expect(m.chaoticCount).toBe(0)
  })

  it('returns divine-forge for rich content', () => {
    const m = measureCrafting(richContent)
    expect(m.forging).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('divine-forge')
    expect(m.hasHighForging).toBe(true)
    expect(m.hasWellDesigned).toBe(true)
    expect(m.hasPlanned).toBe(true)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasIntentional).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasMethodical).toBe(true)
    expect(m.hasNoAdhoc).toBe(true)
    expect(m.hasCrafted).toBe(true)
  })

  it('counts hacked patterns (var)', () => {
    const m = measureCrafting('var x = 1; var y = 2;')
    expect(m.hackedCount).toBe(2)
    expect(m.hasNoHacked).toBe(false)
  })

  it('counts chaotic patterns (any)', () => {
    const m = measureCrafting('const x: any = 1;')
    expect(m.chaoticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects eval as hasNoRandom violation', () => {
    const m = measureCrafting("eval('x')")
    expect(m.hasNoRandom).toBe(false)
  })

  it('detects debugger as hasNoAdhoc violation', () => {
    const m = measureCrafting('debugger')
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('returns proper-forge for moderate content', () => {
    const m = measureCrafting(moderateContent)
    expect(m.forging).toBeGreaterThan(0)
    expect(m.hasWellDesigned).toBe(true)
  })

  it('scores minimal content low', () => {
    const m = measureCrafting(minimalContent)
    expect(m.forging).toBeLessThan(50)
  })
})

// ─── measureHardening ──────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns no-star for empty content', () => {
    const m = measureHardening(emptyContent)
    expect(m.hardness).toBe(0)
    expect(m.star).toBe('no-star')
    expect(m.hasHighHardness).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns neutron-star for rich content', () => {
    const m = measureHardening(richContent)
    expect(m.hardness).toBeGreaterThanOrEqual(85)
    expect(m.star).toBe('neutron-star')
    expect(m.hasHighHardness).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasDependable).toBe(true)
    expect(m.hasSolid).toBe(true)
  })

  it('counts untested patterns (var)', () => {
    const m = measureHardening('var x = 1; var y = 2;')
    expect(m.untestedCount).toBe(2)
    expect(m.hasNoUntested).toBe(false)
  })

  it('counts bare crash patterns (any)', () => {
    const m = measureHardening('const x: any = 1;')
    expect(m.bareCrashCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects eval as hasNoUnsafe violation', () => {
    const m = measureHardening("eval('x')")
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects debugger as hasNoFlaky violation', () => {
    const m = measureHardening('debugger')
    expect(m.hasNoFlaky).toBe(false)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('returns higher hardness for moderate content', () => {
    const m = measureHardening(moderateContent)
    expect(m.hardness).toBeGreaterThan(0)
  })
})

// ─── measurePatterning ─────────────────────────────────────────────

describe('measurePatterning', () => {
  it('returns no-constellation for empty content', () => {
    const m = measurePatterning(emptyContent)
    expect(m.pattern).toBe(0)
    expect(m.constellation).toBe('no-constellation')
    expect(m.hasHighPattern).toBe(false)
    expect(m.mixedCount).toBe(0)
    expect(m.inconsistentCount).toBe(0)
  })

  it('returns orion-belt for rich content', () => {
    const m = measurePatterning(richContent)
    expect(m.pattern).toBeGreaterThanOrEqual(85)
    expect(m.constellation).toBe('orion-belt')
    expect(m.hasHighPattern).toBe(true)
    expect(m.hasWellOrganized).toBe(true)
    expect(m.hasConsistentStyle).toBe(true)
    expect(m.hasNoMixed).toBe(true)
    expect(m.hasUniformConventions).toBe(true)
    expect(m.hasRegularPatterns).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasHarmonious).toBe(true)
  })

  it('counts mixed patterns (var)', () => {
    const m = measurePatterning('var x = 1; var y = 2;')
    expect(m.mixedCount).toBe(2)
    expect(m.hasNoMixed).toBe(false)
  })

  it('counts inconsistent patterns (any)', () => {
    const m = measurePatterning('const x: any = 1;')
    expect(m.inconsistentCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoInconsistent).toBe(false)
  })

  it('detects eval as hasNoAdhoc violation', () => {
    const m = measurePatterning("eval('x')")
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects debugger as hasNoChaotic violation', () => {
    const m = measurePatterning('debugger')
    expect(m.hasNoChaotic).toBe(false)
  })

  it('returns higher pattern for moderate content', () => {
    const m = measurePatterning(moderateContent)
    expect(m.pattern).toBeGreaterThan(0)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns opaque for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.nebula).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns crystal-nebula for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.nebula).toBe('crystal-nebula')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('counts obfuscated patterns (var)', () => {
    const m = measureClarifying('var x = 1; var y = 2;')
    expect(m.obfuscatedCount).toBe(2)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts cryptic patterns (any)', () => {
    const m = measureClarifying('const x: any = 1;')
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects eval as hasNoImpenetrable violation', () => {
    const m = measureClarifying("eval('x')")
    expect(m.hasNoImpenetrable).toBe(false)
  })

  it('detects debugger as hasNoHidden violation', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoHidden).toBe(false)
  })

  it('returns proper-clarity for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBeGreaterThan(0)
  })
})

// ─── measureStrengthening ──────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns no-strength for empty content', () => {
    const m = measureStrengthening(emptyContent)
    expect(m.strength).toBe(0)
    expect(m.cosmic).toBe('no-strength')
    expect(m.hasHighStrength).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.uncheckedCount).toBe(0)
  })

  it('returns supernova-power for rich content', () => {
    const m = measureStrengthening(richContent)
    expect(m.strength).toBeGreaterThanOrEqual(85)
    expect(m.cosmic).toBe('supernova-power')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasGuarded).toBe(true)
    expect(m.hasFortified).toBe(true)
  })

  it('counts fragile patterns (var)', () => {
    const m = measureStrengthening('var x = 1; var y = 2;')
    expect(m.fragileCount).toBe(2)
    expect(m.hasNoFragile).toBe(false)
  })

  it('counts unchecked patterns (any)', () => {
    const m = measureStrengthening('const x: any = 1;')
    expect(m.uncheckedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUnchecked).toBe(false)
  })

  it('detects eval as hasNoTrusting violation', () => {
    const m = measureStrengthening("eval('x')")
    expect(m.hasNoTrusting).toBe(false)
  })

  it('detects debugger as hasNoExposed violation', () => {
    const m = measureStrengthening('debugger')
    expect(m.hasNoExposed).toBe(false)
  })

  it('returns higher strength for moderate content', () => {
    const m = measureStrengthening(moderateContent)
    expect(m.strength).toBeGreaterThan(0)
  })
})

// ─── classifyForgeCondition ────────────────────────────────────────

describe('classifyForgeCondition', () => {
  it('classifies celestial-masterpiece for 85+', () => {
    expect(classifyForgeCondition(90)).toBe('celestial-masterpiece')
    expect(classifyForgeCondition(85)).toBe('celestial-masterpiece')
  })

  it('classifies star-forged-tool for 70-84', () => {
    expect(classifyForgeCondition(70)).toBe('star-forged-tool')
    expect(classifyForgeCondition(84)).toBe('star-forged-tool')
  })

  it('classifies proper-instrument for 55-69', () => {
    expect(classifyForgeCondition(55)).toBe('proper-instrument')
    expect(classifyForgeCondition(69)).toBe('proper-instrument')
  })

  it('classifies rough-metal for 40-54', () => {
    expect(classifyForgeCondition(40)).toBe('rough-metal')
    expect(classifyForgeCondition(54)).toBe('rough-metal')
  })

  it('classifies space-debris for 25-39', () => {
    expect(classifyForgeCondition(25)).toBe('space-debris')
    expect(classifyForgeCondition(39)).toBe('space-debris')
  })

  it('classifies stardust below 25', () => {
    expect(classifyForgeCondition(0)).toBe('stardust')
    expect(classifyForgeCondition(24)).toBe('stardust')
  })
})

// ─── classifyForgeType ─────────────────────────────────────────────

describe('classifyForgeType', () => {
  it('returns no-forge for empty forges', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })

  it('returns cosmic-foundry for high avg with masterpiece ratio', () => {
    const forges = [
      { qualityScore: 90, condition: 'celestial-masterpiece' as const },
      { qualityScore: 85, condition: 'celestial-masterpiece' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, celestialForging: 0, starHardness: 0, constellationPattern: 0, nebulaClarity: 0, cosmicStrength: 0, crafting: {} as any, hardening: {} as any, patterning: {} as any, clarifying: {} as any, strengthening: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyForgeType(forges)).toBe('cosmic-foundry')
  })

  it('returns stellar-forge for moderate avg', () => {
    const forges = [
      { qualityScore: 60, condition: 'proper-instrument' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, celestialForging: 0, starHardness: 0, constellationPattern: 0, nebulaClarity: 0, cosmicStrength: 0, crafting: {} as any, hardening: {} as any, patterning: {} as any, clarifying: {} as any, strengthening: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyForgeType(forges)).toBe('stellar-forge')
  })

  it('returns cold-iron for low avg', () => {
    const forges = [
      { qualityScore: 15, condition: 'stardust' as const },
    ].map((f, i) => ({ file: `f${i}.ts`, celestialForging: 0, starHardness: 0, constellationPattern: 0, nebulaClarity: 0, cosmicStrength: 0, crafting: {} as any, hardening: {} as any, patterning: {} as any, clarifying: {} as any, strengthening: {} as any, condition: f.condition, qualityScore: f.qualityScore }))
    expect(classifyForgeType(forges)).toBe('cold-iron')
  })
})

// ─── classifyWorkshopCondition ─────────────────────────────────────

describe('classifyWorkshopCondition', () => {
  it('returns divine-armory for 75+', () => {
    expect(classifyWorkshopCondition(75)).toBe('divine-armory')
    expect(classifyWorkshopCondition(90)).toBe('divine-armory')
  })

  it('returns stellar-workshop for 60-74', () => {
    expect(classifyWorkshopCondition(60)).toBe('stellar-workshop')
    expect(classifyWorkshopCondition(74)).toBe('stellar-workshop')
  })

  it('returns decent-forge for 45-59', () => {
    expect(classifyWorkshopCondition(45)).toBe('decent-forge')
  })

  it('returns humble-anvil for 30-44', () => {
    expect(classifyWorkshopCondition(30)).toBe('humble-anvil')
  })

  it('returns cold-hearth for 15-29', () => {
    expect(classifyWorkshopCondition(15)).toBe('cold-hearth')
  })

  it('returns void below 15', () => {
    expect(classifyWorkshopCondition(0)).toBe('void')
    expect(classifyWorkshopCondition(14)).toBe('void')
  })
})

// ─── classifySmithGrade ────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('returns cosmic-smith for 80+', () => {
    expect(classifySmithGrade(80)).toBe('cosmic-smith')
    expect(classifySmithGrade(100)).toBe('cosmic-smith')
  })

  it('returns star-forge-master for 65-79', () => {
    expect(classifySmithGrade(65)).toBe('star-forge-master')
    expect(classifySmithGrade(79)).toBe('star-forge-master')
  })

  it('returns skilled-blacksmith for 50-64', () => {
    expect(classifySmithGrade(50)).toBe('skilled-blacksmith')
    expect(classifySmithGrade(64)).toBe('skilled-blacksmith')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
  })

  it('returns meteor-smasher below 20', () => {
    expect(classifySmithGrade(0)).toBe('meteor-smasher')
    expect(classifySmithGrade(19)).toBe('meteor-smasher')
  })
})

// ─── analyzeStarForge ──────────────────────────────────────────────

describe('analyzeStarForge', () => {
  it('analyzes rich content correctly', () => {
    const forge = analyzeStarForge(richContent, 'rich.ts')
    expect(forge.file).toBe('rich.ts')
    expect(forge.celestialForging).toBeGreaterThanOrEqual(85)
    expect(forge.starHardness).toBeGreaterThanOrEqual(85)
    expect(forge.constellationPattern).toBeGreaterThanOrEqual(85)
    expect(forge.nebulaClarity).toBeGreaterThanOrEqual(85)
    expect(forge.cosmicStrength).toBeGreaterThanOrEqual(85)
    expect(forge.qualityScore).toBeGreaterThanOrEqual(85)
    expect(forge.condition).toBe('celestial-masterpiece')
  })

  it('analyzes empty content as stardust', () => {
    const forge = analyzeStarForge(emptyContent, 'empty.ts')
    expect(forge.file).toBe('empty.ts')
    expect(forge.celestialForging).toBe(0)
    expect(forge.qualityScore).toBe(0)
    expect(forge.condition).toBe('stardust')
  })

  it('computes qualityScore as weighted average', () => {
    const forge = analyzeStarForge(moderateContent, 'mod.ts')
    const expected = Math.round(
      forge.celestialForging * 0.2 +
      forge.starHardness * 0.2 +
      forge.constellationPattern * 0.2 +
      forge.nebulaClarity * 0.2 +
      forge.cosmicStrength * 0.2,
    )
    expect(forge.qualityScore).toBe(expected)
  })
})

// ─── analyzeCosmicForge ────────────────────────────────────────────

describe('analyzeCosmicForge', () => {
  it('returns empty workshop for no forges', () => {
    const workshop = analyzeCosmicForge([], 'src')
    expect(workshop.directory).toBe('src')
    expect(workshop.forges).toHaveLength(0)
    expect(workshop.avgForging).toBe(0)
    expect(workshop.forgeType).toBe('no-forge')
    expect(workshop.condition).toBe('void')
  })

  it('analyzes workshop with single forge', () => {
    const forge = analyzeStarForge(richContent, 'src/rich.ts')
    const workshop = analyzeCosmicForge([forge], 'src')
    expect(workshop.forges).toHaveLength(1)
    expect(workshop.avgForging).toBe(forge.celestialForging)
    expect(workshop.avgHardness).toBe(forge.starHardness)
    expect(workshop.avgStrength).toBe(forge.cosmicStrength)
  })

  it('counts celestial masterpieces correctly', () => {
    const rich = analyzeStarForge(richContent, 'rich.ts')
    const empty = analyzeStarForge(emptyContent, 'empty.ts')
    const workshop = analyzeCosmicForge([rich, empty], 'src')
    expect(workshop.celestialMasterpieceCount).toBe(1)
    expect(workshop.stardustCount).toBe(1)
  })
})

// ─── buildStarlightAnvilResult ─────────────────────────────────────

describe('buildStarlightAnvilResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildStarlightAnvilResult([], [])
    expect(result.forges).toHaveLength(0)
    expect(result.workshops).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPower).toBe(0)
    expect(result.cosmos.isCelestial).toBe(false)
  })

  it('analyzes single rich file', async () => {
    const result = await buildStarlightAnvilResult(['rich.ts'], [richContent])
    expect(result.forges).toHaveLength(1)
    expect(result.forges[0].condition).toBe('celestial-masterpiece')
    expect(result.stats.celestialMasterpieceCount).toBe(1)
    expect(result.cosmos.isCelestial).toBe(true)
    expect(result.stats.overallPower).toBeGreaterThan(0)
    expect(result.stats.smithGrade).toBeDefined()
    expect(result.stats.bestForge).toBe('rich.ts')
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildStarlightAnvilResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.forges).toHaveLength(2)
    expect(result.workshops).toHaveLength(2)
    expect(result.stats.totalWorkshops).toBe(2)
  })

  it('populates all best fields', async () => {
    const result = await buildStarlightAnvilResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestForge).toBeDefined()
    expect(result.stats.bestCrafted).toBeDefined()
    expect(result.stats.hardest).toBeDefined()
    expect(result.stats.bestPattern).toBeDefined()
    expect(result.stats.strongest).toBeDefined()
    expect(result.stats.bestForge).toBe('a.ts')
  })

  it('counts hasHigh flags correctly', async () => {
    const result = await buildStarlightAnvilResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighForgingCount).toBe(1)
    expect(result.stats.hasHighHardnessCount).toBe(1)
    expect(result.stats.hasHighPatternCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
  })

  it('computes cosmos correctly', async () => {
    const result = await buildStarlightAnvilResult(['rich.ts'], [richContent])
    expect(result.cosmos.avgForging).toBeGreaterThan(0)
    expect(result.cosmos.avgHardness).toBeGreaterThan(0)
    expect(result.cosmos.avgStrength).toBeGreaterThan(0)
    expect(result.cosmos.isCelestial).toBe(true)
    expect(result.cosmos.overallPower).toBeGreaterThan(0)
  })

  it('returns recommendations', async () => {
    const result = await buildStarlightAnvilResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message when all scores high', () => {
    const forges: StarForge[] = []
    const stats: StarlightAnvilStats = {
      totalFiles: 1, totalWorkshops: 1,
      avgCelestialForging: 90, avgStarHardness: 90, avgConstellationPattern: 90,
      avgNebulaClarity: 90, avgCosmicStrength: 90,
      celestialMasterpieceCount: 1, starForgedToolCount: 0, properInstrumentCount: 0,
      roughMetalCount: 0, spaceDebrisCount: 0, stardustCount: 0,
      hasHighForgingCount: 1, hasHighHardnessCount: 1, hasHighPatternCount: 1,
      hasHighClarityCount: 1, hasHighStrengthCount: 1,
      overallPower: 90, smithGrade: 'cosmic-smith',
      bestForge: 'a.ts', bestCrafted: 'a.ts', hardest: 'a.ts',
      bestPattern: 'a.ts', strongest: 'a.ts',
    }
    const cosmos: StarlightCosmos = { avgForging: 90, avgHardness: 90, avgStrength: 90, isCelestial: true, overallPower: 90 }
    const recs = generateRecommendations(forges, [], cosmos, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('celestial perfection')
  })

  it('recommends improving forging when low', () => {
    const forges: StarForge[] = []
    const stats: StarlightAnvilStats = {
      totalFiles: 1, totalWorkshops: 1,
      avgCelestialForging: 30, avgStarHardness: 90, avgConstellationPattern: 90,
      avgNebulaClarity: 90, avgCosmicStrength: 90,
      celestialMasterpieceCount: 0, starForgedToolCount: 0, properInstrumentCount: 0,
      roughMetalCount: 0, spaceDebrisCount: 0, stardustCount: 0,
      hasHighForgingCount: 0, hasHighHardnessCount: 1, hasHighPatternCount: 1,
      hasHighClarityCount: 1, hasHighStrengthCount: 1,
      overallPower: 60, smithGrade: 'skilled-blacksmith',
      bestForge: 'a.ts', bestCrafted: 'a.ts', hardest: 'a.ts',
      bestPattern: 'a.ts', strongest: 'a.ts',
    }
    const cosmos: StarlightCosmos = { avgForging: 30, avgHardness: 90, avgStrength: 90, isCelestial: false, overallPower: 60 }
    const recs = generateRecommendations(forges, [], cosmos, stats)
    expect(recs.some(r => r.includes('celestial forging'))).toBe(true)
  })

  it('recommends improving hardness when low', () => {
    const stats: StarlightAnvilStats = {
      totalFiles: 1, totalWorkshops: 1,
      avgCelestialForging: 90, avgStarHardness: 30, avgConstellationPattern: 90,
      avgNebulaClarity: 90, avgCosmicStrength: 90,
      celestialMasterpieceCount: 1, starForgedToolCount: 0, properInstrumentCount: 0,
      roughMetalCount: 0, spaceDebrisCount: 0, stardustCount: 0,
      hasHighForgingCount: 1, hasHighHardnessCount: 0, hasHighPatternCount: 1,
      hasHighClarityCount: 1, hasHighStrengthCount: 1,
      overallPower: 70, smithGrade: 'star-forge-master',
      bestForge: 'a.ts', bestCrafted: 'a.ts', hardest: 'a.ts',
      bestPattern: 'a.ts', strongest: 'a.ts',
    }
    const cosmos: StarlightCosmos = { avgForging: 90, avgHardness: 30, avgStrength: 90, isCelestial: true, overallPower: 70 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('star durability') || r.includes('Harden'))).toBe(true)
  })

  it('recommends for low overall power', () => {
    const stats: StarlightAnvilStats = {
      totalFiles: 1, totalWorkshops: 1,
      avgCelestialForging: 30, avgStarHardness: 30, avgConstellationPattern: 30,
      avgNebulaClarity: 30, avgCosmicStrength: 30,
      celestialMasterpieceCount: 0, starForgedToolCount: 0, properInstrumentCount: 0,
      roughMetalCount: 0, spaceDebrisCount: 0, stardustCount: 0,
      hasHighForgingCount: 0, hasHighHardnessCount: 0, hasHighPatternCount: 0,
      hasHighClarityCount: 0, hasHighStrengthCount: 0,
      overallPower: 30, smithGrade: 'apprentice',
      bestForge: '', bestCrafted: '', hardest: '',
      bestPattern: '', strongest: '',
    }
    const cosmos: StarlightCosmos = { avgForging: 30, avgHardness: 30, avgStrength: 30, isCelestial: false, overallPower: 30 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('cosmic power'))).toBe(true)
  })

  it('recommends for stardust files', () => {
    const stats: StarlightAnvilStats = {
      totalFiles: 1, totalWorkshops: 1,
      avgCelestialForging: 90, avgStarHardness: 90, avgConstellationPattern: 90,
      avgNebulaClarity: 90, avgCosmicStrength: 90,
      celestialMasterpieceCount: 0, starForgedToolCount: 0, properInstrumentCount: 0,
      roughMetalCount: 0, spaceDebrisCount: 0, stardustCount: 2,
      hasHighForgingCount: 1, hasHighHardnessCount: 1, hasHighPatternCount: 1,
      hasHighClarityCount: 1, hasHighStrengthCount: 1,
      overallPower: 80, smithGrade: 'cosmic-smith',
      bestForge: 'a.ts', bestCrafted: 'a.ts', hardest: 'a.ts',
      bestPattern: 'a.ts', strongest: 'a.ts',
    }
    const cosmos: StarlightCosmos = { avgForging: 90, avgHardness: 90, avgStrength: 90, isCelestial: true, overallPower: 90 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('stardust'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for various scores', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(60)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for known grades', () => {
    expect(typeof colorGrade('celestial-masterpiece')).toBe('string')
    expect(typeof colorGrade('stardust')).toBe('string')
    expect(typeof colorGrade('cosmic-foundry')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatForgeTable', () => {
  it('formats a single forge', () => {
    const forge = analyzeStarForge(richContent, 'test.ts')
    const result = formatForgeTable(forge)
    expect(result).toContain('test.ts')
    expect(result).toContain('Celestial Forging')
    expect(result).toContain('Star Hardness')
    expect(result).toContain('Score')
  })
})

describe('formatForgesTable', () => {
  it('returns no forges message for empty', () => {
    expect(formatForgesTable([])).toContain('No star forges')
  })

  it('formats multiple forges', () => {
    const forge = analyzeStarForge(richContent, 'a.ts')
    const result = formatForgesTable([forge])
    expect(result).toContain('Starlight Anvil Analysis')
  })
})

describe('formatWorkshopTable', () => {
  it('formats workshop with forge', () => {
    const forge = analyzeStarForge(richContent, 'a.ts')
    const workshop = analyzeCosmicForge([forge], 'src')
    const result = formatWorkshopTable(workshop)
    expect(result).toContain('Workshop')
    expect(result).toContain('src')
    expect(result).toContain('Avg Forging')
  })
})

describe('formatWorkshopsTable', () => {
  it('returns no workshops message for empty', () => {
    expect(formatWorkshopsTable([])).toContain('No cosmic workshops')
  })

  it('formats workshops', () => {
    const forge = analyzeStarForge(richContent, 'a.ts')
    const workshop = analyzeCosmicForge([forge], 'src')
    const result = formatWorkshopsTable([workshop])
    expect(result).toContain('Cosmic Workshops')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStarlightAnvilResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Starlight Anvil Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Power')
    expect(output).toContain('Smith Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const output = formatRecommendations(['Improve forging', 'Harden stars'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Improve forging')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildStarlightAnvilResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Starlight Anvil Analysis')
    expect(output).toContain('Cosmic Workshops')
    expect(output).toContain('Starlight Anvil Statistics')
    expect(output).toContain('Cosmos')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildStarlightAnvilResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.forges).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.cosmos).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only var and any', () => {
    const m = measureCrafting('var x: any = 1;')
    expect(m.hackedCount).toBeGreaterThanOrEqual(1)
    expect(m.chaoticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoHacked).toBe(false)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('handles content with only eval', () => {
    const m = measureHardening("eval('x')")
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('handles content with only debugger', () => {
    const m = measurePatterning('debugger')
    expect(m.hasNoChaotic).toBe(false)
  })

  it('minimal content has low scores across all measures', () => {
    const forge = analyzeStarForge(minimalContent, 'min.ts')
    expect(forge.celestialForging).toBeLessThan(50)
    expect(forge.starHardness).toBeLessThan(50)
    expect(forge.constellationPattern).toBeLessThan(50)
    expect(forge.nebulaClarity).toBeLessThan(50)
    expect(forge.cosmicStrength).toBeLessThan(50)
  })

  it('result with all stardust files has correct cosmos', async () => {
    const result = await buildStarlightAnvilResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.cosmos.isCelestial).toBe(false)
    expect(result.stats.stardustCount).toBe(2)
    expect(result.stats.celestialMasterpieceCount).toBe(0)
  })
})
