import { describe, it, expect } from 'vitest'
import {
  measureGrowing,
  measureRooting,
  measureBlooming,
  measureHarmonizing,
  measureHarvesting,
  classifyBloomCondition,
  classifyConstellationType,
  classifyConstellationCondition,
  classifyGardenerGrade,
  analyzeCelestialBloom,
  analyzeGardenConstellation,
  buildCosmicGardenResult,
  generateRecommendations,
} from '../src/commands/cosmic-garden-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatConstellationTable,
  formatConstellationsTable,
  formatStatsTable,
  formatCelebration,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/cosmic-garden-format-helpers.js'
import type {
  CelestialBloom,
  GardenConstellation,
  CosmicGardenStats,
  CosmicGardenResult,
  GardenSummary,
} from '../src/commands/cosmic-garden-helpers.js'

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

// ─── measureGrowing ────────────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns valid GrowingMeasure for empty content', () => {
    const result = measureGrowing(emptyContent)
    expect(result.vitality).toBeGreaterThanOrEqual(0)
    expect(result.vitality).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighVitality).toBe(false)
    expect(result.rigidCount).toBe(0)
    expect(result.frozenCount).toBe(0)
    expect(result.hasNoRigid).toBe(true)
  })

  it('scores moderate content higher than empty', () => {
    const empty = measureGrowing(emptyContent)
    const moderate = measureGrowing(moderateContent)
    expect(moderate.vitality).toBeGreaterThan(empty.vitality)
  })

  it('scores rich content higher than moderate', () => {
    const moderate = measureGrowing(moderateContent)
    const rich = measureGrowing(richContent)
    expect(rich.vitality).toBeGreaterThan(moderate.vitality)
  })

  it('detects extensible patterns in rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasExtensible).toBe(true)
  })

  it('detects scalable patterns in rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasScalable).toBe(true)
  })

  it('detects adaptable patterns when async and optional present', () => {
    const content = `${richContent}\nfunction process(data?: string): void {}`
    const result = measureGrowing(content)
    expect(result.hasAdaptable).toBe(true)
  })

  it('detects evolving patterns in rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasEvolving).toBe(true)
  })

  it('detects renewable patterns in rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasRenewable).toBe(true)
  })

  it('detects sustainable patterns in rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasSustainable).toBe(true)
  })

  it('counts rigid (var) in poor content', () => {
    const result = measureGrowing(poorContent)
    expect(result.rigidCount).toBeGreaterThan(0)
    expect(result.hasNoRigid).toBe(false)
  })

  it('counts frozen (any) in poor content', () => {
    const result = measureGrowing(poorContent)
    expect(result.frozenCount).toBeGreaterThan(0)
    expect(result.hasNoFrozen).toBe(false)
  })

  it('detects stagnant (eval) in poor content', () => {
    const result = measureGrowing(poorContent)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects decayed (debugger) in poor content', () => {
    const result = measureGrowing(poorContent)
    expect(result.hasNoDecayed).toBe(false)
  })

  it('detects high vitality for rich content', () => {
    const result = measureGrowing(richContent)
    expect(result.hasHighVitality).toBe(true)
  })

  it('grades empty content as dead-seed', () => {
    const result = measureGrowing(emptyContent)
    expect(result.grade).toBe('dead-seed')
  })
})

// ─── measureRooting ────────────────────────────────────────────────

describe('measureRooting', () => {
  it('returns valid RootingMeasure for empty content', () => {
    const result = measureRooting(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThanOrEqual(100)
    expect(typeof result.root).toBe('string')
    expect(result.untestedCount).toBe(0)
    expect(result.unsafeCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureRooting(emptyContent)
    const rich = measureRooting(richContent)
    expect(rich.depth).toBeGreaterThan(empty.depth)
  })

  it('detects solid foundation in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasSolidFoundation).toBe(true)
  })

  it('detects well tested in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasWellTested).toBe(true)
  })

  it('detects type safe in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects documented in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects established in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasEstablished).toBe(true)
  })

  it('detects proven in rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasProven).toBe(true)
  })

  it('counts untested (var) in poor content', () => {
    const result = measureRooting(poorContent)
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('counts unsafe (any) in poor content', () => {
    const result = measureRooting(poorContent)
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects high depth for rich content', () => {
    const result = measureRooting(richContent)
    expect(result.hasHighDepth).toBe(true)
  })

  it('grades empty content as no-roots', () => {
    const result = measureRooting(emptyContent)
    expect(result.root).toBe('no-roots')
  })
})

// ─── measureBlooming ───────────────────────────────────────────────

describe('measureBlooming', () => {
  it('returns valid BloomingMeasure for empty content', () => {
    const result = measureBlooming(emptyContent)
    expect(result.diversity).toBeGreaterThanOrEqual(0)
    expect(result.diversity).toBeLessThanOrEqual(100)
    expect(typeof result.bloom).toBe('string')
    expect(result.singlePatternCount).toBe(0)
    expect(result.minimalAPICount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureBlooming(emptyContent)
    const rich = measureBlooming(richContent)
    expect(rich.diversity).toBeGreaterThan(empty.diversity)
  })

  it('detects multiple patterns in rich content', () => {
    const result = measureBlooming(richContent)
    expect(result.hasMultiplePatterns).toBe(true)
  })

  it('detects varied approaches in rich content', () => {
    const result = measureBlooming(richContent)
    expect(result.hasVariedApproaches).toBe(true)
  })

  it('detects rich API in rich content', () => {
    const result = measureBlooming(richContent)
    expect(result.hasRichAPI).toBe(true)
  })

  it('detects colorful patterns in rich content', () => {
    const result = measureBlooming(richContent)
    expect(result.hasColorful).toBe(true)
  })

  it('detects high diversity for rich content', () => {
    const result = measureBlooming(richContent)
    expect(result.hasHighDiversity).toBe(true)
  })

  it('grades empty content as no-bloom', () => {
    const result = measureBlooming(emptyContent)
    expect(result.bloom).toBe('no-bloom')
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns valid HarmonizingMeasure for empty content', () => {
    const result = measureHarmonizing(emptyContent)
    expect(result.harmony).toBeGreaterThanOrEqual(0)
    expect(result.harmony).toBeLessThanOrEqual(100)
    expect(typeof result.celestial).toBe('string')
    expect(result.styleViolationCount).toBe(0)
    expect(result.lintErrorCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureHarmonizing(emptyContent)
    const rich = measureHarmonizing(richContent)
    expect(rich.harmony).toBeGreaterThan(empty.harmony)
  })

  it('detects standards compliant in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasStandardsCompliant).toBe(true)
  })

  it('detects consistent style in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasConsistentStyle).toBe(true)
  })

  it('detects lint clean in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasLintClean).toBe(true)
  })

  it('detects convention followed in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasConventionFollowed).toBe(true)
  })

  it('detects high harmony for rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasHighHarmony).toBe(true)
  })

  it('grades empty content as silence', () => {
    const result = measureHarmonizing(emptyContent)
    expect(result.celestial).toBe('silence')
  })
})

// ─── measureHarvesting ─────────────────────────────────────────────

describe('measureHarvesting', () => {
  it('returns valid HarvestingMeasure for empty content', () => {
    const result = measureHarvesting(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
    expect(typeof result.harvest).toBe('string')
    expect(result.deadCodeCount).toBe(0)
    expect(result.wastefulCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureHarvesting(emptyContent)
    const rich = measureHarvesting(richContent)
    expect(rich.quality).toBeGreaterThan(empty.quality)
  })

  it('detects high value output in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasHighValueOutput).toBe(true)
  })

  it('detects complete coverage in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasCompleteCoverage).toBe(true)
  })

  it('detects optimized in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasOptimized).toBe(true)
  })

  it('detects production ready in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasProductionReady).toBe(true)
  })

  it('detects clean exports in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasCleanExports).toBe(true)
  })

  it('detects deliverable in rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasDeliverable).toBe(true)
  })

  it('detects high quality for rich content', () => {
    const result = measureHarvesting(richContent)
    expect(result.hasHighQuality).toBe(true)
  })

  it('grades empty content as no-harvest', () => {
    const result = measureHarvesting(emptyContent)
    expect(result.harvest).toBe('no-harvest')
  })
})

// ─── classifyBloomCondition ────────────────────────────────────────

describe('classifyBloomCondition', () => {
  it('classifies 90 as celestial-tree', () => expect(classifyBloomCondition(90)).toBe('celestial-tree'))
  it('classifies 75 as cosmic-rose', () => expect(classifyBloomCondition(75)).toBe('cosmic-rose'))
  it('classifies 60 as proper-plant', () => expect(classifyBloomCondition(60)).toBe('proper-plant'))
  it('classifies 45 as wilting-sprout', () => expect(classifyBloomCondition(45)).toBe('wilting-sprout'))
  it('classifies 30 as dried-seed', () => expect(classifyBloomCondition(30)).toBe('dried-seed'))
  it('classifies 10 as void-spore', () => expect(classifyBloomCondition(10)).toBe('void-spore'))
  it('classifies 0 as void-spore', () => expect(classifyBloomCondition(0)).toBe('void-spore'))
  it('classifies 85 as celestial-tree', () => expect(classifyBloomCondition(85)).toBe('celestial-tree'))
})

// ─── classifyConstellationType ─────────────────────────────────────

describe('classifyConstellationType', () => {
  it('returns no-garden for empty blooms', () => {
    expect(classifyConstellationType([])).toBe('no-garden')
  })

  it('returns hanging-gardens for high quality with celestial-tree majority', () => {
    const blooms: CelestialBloom[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      growthVitality: 90, rootDepth: 90, bloomDiversity: 90,
      celestialHarmony: 90, harvestQuality: 90,
      growing: measureGrowing(richContent),
      rooting: measureRooting(richContent),
      blooming: measureBlooming(richContent),
      harmonizing: measureHarmonizing(richContent),
      harvesting: measureHarvesting(richContent),
      condition: 'celestial-tree' as const,
      qualityScore: 85,
    }))
    const result = classifyConstellationType(blooms)
    expect(['hanging-gardens', 'cosmic-greenhouse']).toContain(result)
  })

  it('returns no-garden for very low quality', () => {
    const blooms: CelestialBloom[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      growthVitality: 5, rootDepth: 5, bloomDiversity: 5,
      celestialHarmony: 5, harvestQuality: 5,
      growing: measureGrowing(emptyContent),
      rooting: measureRooting(emptyContent),
      blooming: measureBlooming(emptyContent),
      harmonizing: measureHarmonizing(emptyContent),
      harvesting: measureHarvesting(emptyContent),
      condition: 'void-spore' as const,
      qualityScore: 5,
    }))
    expect(classifyConstellationType(blooms)).toBe('no-garden')
  })
})

// ─── classifyConstellationCondition ────────────────────────────────

describe('classifyConstellationCondition', () => {
  it('classifies 80 as eden-reborn', () => expect(classifyConstellationCondition(80)).toBe('eden-reborn'))
  it('classifies 65 as flourishing-realm', () => expect(classifyConstellationCondition(65)).toBe('flourishing-realm'))
  it('classifies 50 as decent-garden', () => expect(classifyConstellationCondition(50)).toBe('decent-garden'))
  it('classifies 35 as struggling-patch', () => expect(classifyConstellationCondition(35)).toBe('struggling-patch'))
  it('classifies 20 as wasteland', () => expect(classifyConstellationCondition(20)).toBe('wasteland'))
  it('classifies 5 as void', () => expect(classifyConstellationCondition(5)).toBe('void'))
})

// ─── classifyGardenerGrade ─────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('classifies 85 as cosmic-gardener', () => expect(classifyGardenerGrade(85)).toBe('cosmic-gardener'))
  it('classifies 70 as master-botanist', () => expect(classifyGardenerGrade(70)).toBe('master-botanist'))
  it('classifies 55 as skilled-cultivator', () => expect(classifyGardenerGrade(55)).toBe('skilled-cultivator'))
  it('classifies 40 as apprentice', () => expect(classifyGardenerGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifyGardenerGrade(25)).toBe('novice'))
  it('classifies 10 as brown-thumb', () => expect(classifyGardenerGrade(10)).toBe('brown-thumb'))
})

// ─── analyzeCelestialBloom ─────────────────────────────────────────

describe('analyzeCelestialBloom', () => {
  it('analyzes empty content as void-spore', () => {
    const result = analyzeCelestialBloom(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('void-spore')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeCelestialBloom(emptyContent, 'empty.ts')
    const rich = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeCelestialBloom(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.growing.vitality * 0.2 +
      result.rooting.depth * 0.2 +
      result.blooming.diversity * 0.2 +
      result.harmonizing.harmony * 0.2 +
      result.harvesting.quality * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.growing).toBeDefined()
    expect(result.rooting).toBeDefined()
    expect(result.blooming).toBeDefined()
    expect(result.harmonizing).toBeDefined()
    expect(result.harvesting).toBeDefined()
  })

  it('sets growthVitality from growing.vitality', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.growthVitality).toBe(result.growing.vitality)
  })

  it('sets rootDepth from rooting.depth', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.rootDepth).toBe(result.rooting.depth)
  })

  it('sets bloomDiversity from blooming.diversity', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.bloomDiversity).toBe(result.blooming.diversity)
  })

  it('sets celestialHarmony from harmonizing.harmony', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.celestialHarmony).toBe(result.harmonizing.harmony)
  })

  it('sets harvestQuality from harvesting.quality', () => {
    const result = analyzeCelestialBloom(richContent, 'rich.ts')
    expect(result.harvestQuality).toBe(result.harvesting.quality)
  })
})

// ─── analyzeGardenConstellation ────────────────────────────────────

describe('analyzeGardenConstellation', () => {
  it('returns empty constellation for no blooms', () => {
    const result = analyzeGardenConstellation([], 'src')
    expect(result.directory).toBe('src')
    expect(result.blooms).toHaveLength(0)
    expect(result.avgVitality).toBe(0)
    expect(result.avgDepth).toBe(0)
    expect(result.avgHarmony).toBe(0)
    expect(result.celestialTreeCount).toBe(0)
    expect(result.voidSporeCount).toBe(0)
    expect(result.constellationType).toBe('no-garden')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single bloom', () => {
    const bloom = analyzeCelestialBloom(richContent, 'rich.ts')
    const result = analyzeGardenConstellation([bloom], 'src')
    expect(result.avgVitality).toBe(bloom.growthVitality)
    expect(result.avgDepth).toBe(bloom.rootDepth)
    expect(result.avgHarmony).toBe(bloom.celestialHarmony)
  })

  it('counts celestial trees and void spores', () => {
    const celestial = analyzeCelestialBloom(richContent, 'rich.ts')
    const voidB = analyzeCelestialBloom(emptyContent, 'empty.ts')
    if (celestial.condition === 'celestial-tree' && voidB.condition === 'void-spore') {
      const result = analyzeGardenConstellation([celestial, voidB], 'src')
      expect(result.celestialTreeCount).toBe(1)
      expect(result.voidSporeCount).toBe(1)
    }
  })
})

// ─── buildCosmicGardenResult ───────────────────────────────────────

describe('buildCosmicGardenResult', () => {
  it('handles empty input', async () => {
    const result = await buildCosmicGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.constellations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalConstellations).toBe(0)
    expect(result.stats.overallFertility).toBe(0)
    expect(result.garden.isFlourishing).toBe(false)
    expect(result.garden.overallFertility).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildCosmicGardenResult(['file.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.blooms[0].file).toBe('file.ts')
    expect(result.constellations).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into constellations by directory', async () => {
    const result = await buildCosmicGardenResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.blooms).toHaveLength(3)
    expect(result.constellations).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalConstellations).toBe(2)
  })

  it('computes garden summary correctly', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    expect(result.garden.avgVitality).toBe(result.blooms[0].growthVitality)
    expect(result.garden.overallFertility).toBeGreaterThanOrEqual(0)
  })

  it('sets isFlourishing when avgVitality >= 60', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    if (result.garden.avgVitality >= 60) {
      expect(result.garden.isFlourishing).toBe(true)
    } else {
      expect(result.garden.isFlourishing).toBe(false)
    }
  })

  it('tracks best bloom and top performers', async () => {
    const result = await buildCosmicGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestBloom).toBe('a.ts')
    expect(result.stats.mostVital).toBeDefined()
    expect(result.stats.deepestRooted).toBeDefined()
    expect(result.stats.mostDiverse).toBeDefined()
    expect(result.stats.mostHarmonious).toBeDefined()
  })

  it('computes overallFertility as avg of vitality+depth+harmony', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.garden.avgVitality + result.garden.avgDepth + result.garden.avgHarmony) / 3,
    )
    expect(result.garden.overallFertility).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildCosmicGardenResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.celestialTreeCount +
      result.stats.cosmicRoseCount +
      result.stats.properPlantCount +
      result.stats.wiltingSproutCount +
      result.stats.driedSeedCount +
      result.stats.voidSporeCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets gardener grade', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    expect(['cosmic-gardener', 'master-botanist', 'skilled-cultivator', 'apprentice', 'novice', 'brown-thumb']).toContain(
      result.stats.gardenerGrade,
    )
  })

  it('includes celebration field with milestone 480', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    expect(result.celebration.milestone).toBe(480)
    expect(result.celebration.name).toBe('cosmic-garden')
    expect(result.celebration.message).toContain('480')
    expect(result.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470])
    expect(result.celebration.totalTests).toBe(78000)
  })

  it('counts high-measure flags correctly', async () => {
    const result = await buildCosmicGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDiversityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighHarmonyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: CosmicGardenStats = {
    totalFiles: 0, totalConstellations: 0,
    avgGrowthVitality: 0, avgRootDepth: 0, avgBloomDiversity: 0,
    avgCelestialHarmony: 0, avgHarvestQuality: 0,
    celestialTreeCount: 0, cosmicRoseCount: 0, properPlantCount: 0,
    wiltingSproutCount: 0, driedSeedCount: 0, voidSporeCount: 0,
    hasHighVitalityCount: 0, hasHighDepthCount: 0, hasHighDiversityCount: 0,
    hasHighHarmonyCount: 0, hasHighQualityCount: 0,
    overallFertility: 0, gardenerGrade: 'brown-thumb',
    bestBloom: '', mostVital: '', deepestRooted: '', mostDiverse: '', mostHarmonious: '',
  }

  const emptyGarden: GardenSummary = {
    avgVitality: 0, avgDepth: 0, avgHarmony: 0,
    isFlourishing: false, overallFertility: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyGarden, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes vitality recommendation when avgGrowthVitality < 50', () => {
    const stats = { ...emptyStats, avgGrowthVitality: 30 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('vitality'))).toBe(true)
  })

  it('includes root depth recommendation when avgRootDepth < 50', () => {
    const stats = { ...emptyStats, avgRootDepth: 30 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('root'))).toBe(true)
  })

  it('includes bloom recommendation when avgBloomDiversity < 50', () => {
    const stats = { ...emptyStats, avgBloomDiversity: 30 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('diversity'))).toBe(true)
  })

  it('includes harmony recommendation when avgCelestialHarmony < 50', () => {
    const stats = { ...emptyStats, avgCelestialHarmony: 30 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('harmony'))).toBe(true)
  })

  it('includes harvest recommendation when avgHarvestQuality < 50', () => {
    const stats = { ...emptyStats, avgHarvestQuality: 30 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('harvest'))).toBe(true)
  })

  it('includes void spore guidance when voidSporeCount > 0', () => {
    const stats = { ...emptyStats, voidSporeCount: 3 }
    const recs = generateRecommendations([], [], emptyGarden, stats)
    expect(recs.some(r => r.includes('void spore'))).toBe(true)
  })

  it('includes fertility recommendation when overallFertility < 40', () => {
    const stats = { ...emptyStats, overallFertility: 20 }
    const garden = { ...emptyGarden, overallFertility: 20 }
    const recs = generateRecommendations([], [], garden, stats)
    expect(recs.some(r => r.includes('fertility'))).toBe(true)
  })

  it('praises cosmic-gardener when all metrics are high', () => {
    const highStats: CosmicGardenStats = {
      ...emptyStats,
      avgGrowthVitality: 80, avgRootDepth: 80, avgBloomDiversity: 80,
      avgCelestialHarmony: 80, avgHarvestQuality: 80,
      overallFertility: 80, gardenerGrade: 'cosmic-gardener',
    }
    const highGarden: GardenSummary = {
      avgVitality: 80, avgDepth: 80, avgHarmony: 80,
      isFlourishing: true, overallFertility: 80,
    }
    const recs = generateRecommendations([], [], highGarden, highStats)
    expect(recs.some(r => r.includes('cosmic-gardener'))).toBe(true)
  })

  it('mentions specific void files when <= 3', () => {
    const bloom: CelestialBloom = analyzeCelestialBloom(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, voidSporeCount: 1 }
    const recs = generateRecommendations([bloom], [], emptyGarden, stats)
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
  it('returns a string for celestial-tree', () => expect(typeof colorGrade('celestial-tree')).toBe('string'))
  it('returns a string for void-spore', () => expect(typeof colorGrade('void-spore')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatBloomTable', () => {
  it('formats a single bloom', () => {
    const bloom = analyzeCelestialBloom(richContent, 'rich.ts')
    const result = formatBloomTable(bloom)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Growth Vitality')
    expect(result).toContain('Root Depth')
    expect(result).toContain('Bloom Diversity')
    expect(result).toContain('Celestial Harmony')
    expect(result).toContain('Harvest Quality')
  })
})

describe('formatBloomsTable', () => {
  it('handles empty array', () => expect(formatBloomsTable([])).toContain('No celestial blooms'))
  it('formats multiple blooms', () => {
    const blooms = [
      analyzeCelestialBloom(richContent, 'a.ts'),
      analyzeCelestialBloom(moderateContent, 'b.ts'),
    ]
    const result = formatBloomsTable(blooms)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatConstellationTable', () => {
  it('formats a constellation', () => {
    const bloom = analyzeCelestialBloom(richContent, 'rich.ts')
    const constellation = analyzeGardenConstellation([bloom], 'src')
    const result = formatConstellationTable(constellation)
    expect(result).toContain('src')
    expect(result).toContain('Constellation')
  })
})

describe('formatConstellationsTable', () => {
  it('handles empty array', () => expect(formatConstellationsTable([])).toContain('No garden constellations'))
  it('formats constellations', () => {
    const bloom = analyzeCelestialBloom(richContent, 'src/a.ts')
    const constellation = analyzeGardenConstellation([bloom], 'src')
    const result = formatConstellationsTable([constellation])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildCosmicGardenResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Cosmic Garden Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Fertility')
  })
})

describe('formatCelebration', () => {
  it('formats celebration with milestone info', async () => {
    const res = await buildCosmicGardenResult(['f.ts'], [richContent])
    const result = formatCelebration(res.celebration)
    expect(result).toContain('480')
    expect(result).toContain('cosmic-garden')
    expect(result).toContain('78000')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Boost vitality', 'Deepen roots'])
    expect(result).toContain('Boost vitality')
    expect(result).toContain('Deepen roots')
  })
})

describe('formatResultTable', () => {
  it('formats full result including celebration', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Cosmic Garden Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Flourishing')
    expect(formatted).toContain('480')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON with celebration', async () => {
    const result = await buildCosmicGardenResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.garden).toBeDefined()
    expect(parsed.celebration.milestone).toBe(480)
    expect(parsed.celebration.name).toBe('cosmic-garden')
  })
})
