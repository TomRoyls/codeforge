import { describe, it, expect } from 'vitest'
import {
  measureNavigating,
  measurePatterning,
  measureOrganizing,
  measureHarmonizing,
  measureAligning,
  classifyStarCondition,
  classifySystemType,
  classifySystemCondition,
  classifyNavigatorGrade,
  analyzeStarPoint,
  analyzeStarSystem,
  buildAstralCompassResult,
  generateRecommendations,
} from '../src/commands/astral-compass-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPointTable,
  formatPointsTable,
  formatSystemTable,
  formatSystemsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/astral-compass-format-helpers.js'
import type {
  StarPoint,
  StarSystem,
  AstralCompassStats,
  AstralCompassResult,
  CosmosSummary,
} from '../src/commands/astral-compass-helpers.js'

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

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns a valid NavigatingMeasure for empty content', () => {
    const result = measureNavigating(emptyContent)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighClarity).toBe(false)
    expect(result.obfuscatedCount).toBe(0)
    expect(result.undocumentedCount).toBe(0)
    expect(result.hasNoObfuscated).toBe(true)
  })

  it('scores moderate content higher than empty content', () => {
    const empty = measureNavigating(emptyContent)
    const moderate = measureNavigating(moderateContent)
    expect(moderate.clarity).toBeGreaterThan(empty.clarity)
  })

  it('scores rich content higher than moderate content', () => {
    const moderate = measureNavigating(moderateContent)
    const rich = measureNavigating(richContent)
    expect(rich.clarity).toBeGreaterThan(moderate.clarity)
  })

  it('detects readable patterns in rich content', () => {
    const result = measureNavigating(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects documented patterns in rich content', () => {
    const result = measureNavigating(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('counts obfuscated (var) in poor content', () => {
    const result = measureNavigating(poorContent)
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects high clarity for rich content', () => {
    const result = measureNavigating(richContent)
    expect(result.hasHighClarity).toBe(true)
  })

  it('grades empty content as no-navigation', () => {
    const result = measureNavigating(emptyContent)
    expect(result.grade).toBe('no-navigation')
  })

  it('detects undocumented (eval) in poor content', () => {
    const result = measureNavigating(poorContent)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('detects chaotic (debugger) in poor content', () => {
    const result = measureNavigating(poorContent)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects navigable patterns in moderate content', () => {
    const result = measureNavigating(moderateContent)
    expect(result.hasNavigable).toBe(true)
  })
})

// ─── measurePatterning ─────────────────────────────────────────────

describe('measurePatterning', () => {
  it('returns a valid PatterningMeasure for empty content', () => {
    const result = measurePatterning(emptyContent)
    expect(result.structure).toBeGreaterThanOrEqual(0)
    expect(result.structure).toBeLessThanOrEqual(100)
    expect(typeof result.constellation).toBe('string')
    expect(result.scatteredCount).toBe(0)
    expect(result.flatCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measurePatterning(emptyContent)
    const rich = measurePatterning(richContent)
    expect(rich.structure).toBeGreaterThan(empty.structure)
  })

  it('detects organized patterns in rich content', () => {
    const result = measurePatterning(richContent)
    expect(result.hasOrganized).toBe(true)
  })

  it('detects hierarchical patterns in rich content', () => {
    const result = measurePatterning(richContent)
    expect(result.hasHierarchical).toBe(true)
  })

  it('detects clustered patterns in rich content', () => {
    const result = measurePatterning(richContent)
    expect(result.hasClustered).toBe(true)
  })

  it('counts scattered (var) in poor content', () => {
    const result = measurePatterning(poorContent)
    expect(result.scatteredCount).toBeGreaterThan(0)
    expect(result.hasNoScattered).toBe(false)
  })

  it('detects high structure for rich content', () => {
    const result = measurePatterning(richContent)
    expect(result.hasHighStructure).toBe(true)
  })

  it('grades empty content as no-pattern', () => {
    const result = measurePatterning(emptyContent)
    expect(result.constellation).toBe('no-pattern')
  })

  it('detects layered patterns in rich content', () => {
    const result = measurePatterning(richContent)
    expect(result.hasLayered).toBe(true)
  })
})

// ─── measureOrganizing ─────────────────────────────────────────────

describe('measureOrganizing', () => {
  it('returns a valid OrganizingMeasure for empty content', () => {
    const result = measureOrganizing(emptyContent)
    expect(result.organization).toBeGreaterThanOrEqual(0)
    expect(result.organization).toBeLessThanOrEqual(100)
    expect(typeof result.stellar).toBe('string')
    expect(result.starImportCount).toBe(0)
    expect(result.barrelLeakingCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureOrganizing(emptyContent)
    const rich = measureOrganizing(richContent)
    expect(rich.organization).toBeGreaterThan(empty.organization)
  })

  it('detects clean exports in rich content', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasCleanExports).toBe(true)
  })

  it('detects named imports in rich content', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasNamedImports).toBe(true)
  })

  it('detects proper modules in rich content', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasProperModules).toBe(true)
  })

  it('detects tree-shakeable in rich content', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasTreeShakeable).toBe(true)
  })

  it('detects high organization for rich content', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasHighOrganization).toBe(true)
  })

  it('grades empty content as no-organization', () => {
    const result = measureOrganizing(emptyContent)
    expect(result.stellar).toBe('no-organization')
  })

  it('has no star imports by default', () => {
    const result = measureOrganizing(richContent)
    expect(result.hasNoStarImports).toBe(true)
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns a valid HarmonizingMeasure for empty content', () => {
    const result = measureHarmonizing(emptyContent)
    expect(result.harmony).toBeGreaterThanOrEqual(0)
    expect(result.harmony).toBeLessThanOrEqual(100)
    expect(typeof result.orbit).toBe('string')
    expect(result.circularCount).toBe(0)
    expect(result.tightCouplingCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureHarmonizing(emptyContent)
    const rich = measureHarmonizing(richContent)
    expect(rich.harmony).toBeGreaterThan(empty.harmony)
  })

  it('detects balanced deps in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasBalancedDeps).toBe(true)
  })

  it('detects loose coupling in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasLooseCoupling).toBe(true)
  })

  it('detects stable API in rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasStableAPI).toBe(true)
  })

  it('detects high harmony for rich content', () => {
    const result = measureHarmonizing(richContent)
    expect(result.hasHighHarmony).toBe(true)
  })

  it('grades empty content as chaotic-orbit', () => {
    const result = measureHarmonizing(emptyContent)
    expect(result.orbit).toBe('chaotic-orbit')
  })

  it('counts circular (var) in poor content', () => {
    const result = measureHarmonizing(poorContent)
    expect(result.circularCount).toBeGreaterThan(0)
    expect(result.hasNoCircular).toBe(false)
  })
})

// ─── measureAligning ───────────────────────────────────────────────

describe('measureAligning', () => {
  it('returns a valid AligningMeasure for empty content', () => {
    const result = measureAligning(emptyContent)
    expect(result.alignment).toBeGreaterThanOrEqual(0)
    expect(result.alignment).toBeLessThanOrEqual(100)
    expect(typeof result.northStar).toBe('string')
    expect(result.mixedConcernsCount).toBe(0)
    expect(result.misnamedCount).toBe(0)
  })

  it('scores rich content higher than empty content', () => {
    const empty = measureAligning(emptyContent)
    const rich = measureAligning(richContent)
    expect(rich.alignment).toBeGreaterThan(empty.alignment)
  })

  it('detects clear purpose in rich content', () => {
    const result = measureAligning(richContent)
    expect(result.hasClearPurpose).toBe(true)
  })

  it('detects single responsibility in rich content', () => {
    const result = measureAligning(richContent)
    expect(result.hasSingleResponsibility).toBe(true)
  })

  it('detects consistent naming in rich content', () => {
    const result = measureAligning(richContent)
    expect(result.hasConsistentNaming).toBe(true)
  })

  it('detects high alignment for rich content', () => {
    const result = measureAligning(richContent)
    expect(result.hasHighAlignment).toBe(true)
  })

  it('grades empty content as no-north', () => {
    const result = measureAligning(emptyContent)
    expect(result.northStar).toBe('no-north')
  })

  it('detects intentional patterns in rich content', () => {
    const result = measureAligning(richContent)
    expect(result.hasIntentional).toBe(true)
  })
})

// ─── classifyStarCondition ─────────────────────────────────────────

describe('classifyStarCondition', () => {
  it('classifies 90 as pole-star', () => {
    expect(classifyStarCondition(90)).toBe('pole-star')
  })
  it('classifies 75 as bright-star', () => {
    expect(classifyStarCondition(75)).toBe('bright-star')
  })
  it('classifies 60 as proper-star', () => {
    expect(classifyStarCondition(60)).toBe('proper-star')
  })
  it('classifies 45 as dim-star', () => {
    expect(classifyStarCondition(45)).toBe('dim-star')
  })
  it('classifies 30 as dark-matter', () => {
    expect(classifyStarCondition(30)).toBe('dark-matter')
  })
  it('classifies 10 as void', () => {
    expect(classifyStarCondition(10)).toBe('void')
  })
  it('classifies 0 as void', () => {
    expect(classifyStarCondition(0)).toBe('void')
  })
  it('classifies 85 as pole-star', () => {
    expect(classifyStarCondition(85)).toBe('pole-star')
  })
})

// ─── classifySystemType ────────────────────────────────────────────

describe('classifySystemType', () => {
  it('returns no-system for empty points', () => {
    expect(classifySystemType([])).toBe('no-system')
  })

  it('returns galaxy-core for high quality with pole-star majority', () => {
    const points: StarPoint[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      navigationClarity: 90, constellationStructure: 90, stellarOrganization: 90,
      orbitHarmony: 90, northStarAlignment: 90,
      navigating: measureNavigating(richContent),
      patterning: measurePatterning(richContent),
      organizing: measureOrganizing(richContent),
      harmonizing: measureHarmonizing(richContent),
      aligning: measureAligning(richContent),
      condition: 'pole-star' as const,
      qualityScore: 85,
    }))
    const result = classifySystemType(points)
    expect(['galaxy-core', 'star-cluster']).toContain(result)
  })

  it('returns no-system for very low quality points', () => {
    const points: StarPoint[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      navigationClarity: 5, constellationStructure: 5, stellarOrganization: 5,
      orbitHarmony: 5, northStarAlignment: 5,
      navigating: measureNavigating(emptyContent),
      patterning: measurePatterning(emptyContent),
      organizing: measureOrganizing(emptyContent),
      harmonizing: measureHarmonizing(emptyContent),
      aligning: measureAligning(emptyContent),
      condition: 'void' as const,
      qualityScore: 5,
    }))
    expect(classifySystemType(points)).toBe('no-system')
  })
})

// ─── classifySystemCondition ───────────────────────────────────────

describe('classifySystemCondition', () => {
  it('classifies 80 as brilliant-cosmos', () => {
    expect(classifySystemCondition(80)).toBe('brilliant-cosmos')
  })
  it('classifies 65 as starlit-sky', () => {
    expect(classifySystemCondition(65)).toBe('starlit-sky')
  })
  it('classifies 50 as decent-constellation', () => {
    expect(classifySystemCondition(50)).toBe('decent-constellation')
  })
  it('classifies 35 as dim-nebula', () => {
    expect(classifySystemCondition(35)).toBe('dim-nebula')
  })
  it('classifies 20 as dark-void', () => {
    expect(classifySystemCondition(20)).toBe('dark-void')
  })
  it('classifies 5 as void', () => {
    expect(classifySystemCondition(5)).toBe('void')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('classifies 85 as grand-astronomer', () => {
    expect(classifyNavigatorGrade(85)).toBe('grand-astronomer')
  })
  it('classifies 70 as star-captain', () => {
    expect(classifyNavigatorGrade(70)).toBe('star-captain')
  })
  it('classifies 55 as skilled-navigator', () => {
    expect(classifyNavigatorGrade(55)).toBe('skilled-navigator')
  })
  it('classifies 40 as apprentice', () => {
    expect(classifyNavigatorGrade(40)).toBe('apprentice')
  })
  it('classifies 25 as novice', () => {
    expect(classifyNavigatorGrade(25)).toBe('novice')
  })
  it('classifies 10 as landlubber', () => {
    expect(classifyNavigatorGrade(10)).toBe('landlubber')
  })
})

// ─── analyzeStarPoint ──────────────────────────────────────────────

describe('analyzeStarPoint', () => {
  it('analyzes empty content as void condition', () => {
    const result = analyzeStarPoint(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('void')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeStarPoint(emptyContent, 'empty.ts')
    const rich = analyzeStarPoint(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeStarPoint(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.navigating.clarity * 0.2 +
      result.patterning.structure * 0.2 +
      result.organizing.organization * 0.2 +
      result.harmonizing.harmony * 0.2 +
      result.aligning.alignment * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeStarPoint(richContent, 'rich.ts')
    expect(result.navigating).toBeDefined()
    expect(result.patterning).toBeDefined()
    expect(result.organizing).toBeDefined()
    expect(result.harmonizing).toBeDefined()
    expect(result.aligning).toBeDefined()
  })

  it('sets navigationClarity from navigating.clarity', () => {
    const result = analyzeStarPoint(richContent, 'rich.ts')
    expect(result.navigationClarity).toBe(result.navigating.clarity)
  })

  it('sets constellationStructure from patterning.structure', () => {
    const result = analyzeStarPoint(richContent, 'rich.ts')
    expect(result.constellationStructure).toBe(result.patterning.structure)
  })
})

// ─── analyzeStarSystem ─────────────────────────────────────────────

describe('analyzeStarSystem', () => {
  it('returns empty system for no points', () => {
    const result = analyzeStarSystem([], 'src')
    expect(result.directory).toBe('src')
    expect(result.points).toHaveLength(0)
    expect(result.avgNavigation).toBe(0)
    expect(result.avgOrganization).toBe(0)
    expect(result.avgAlignment).toBe(0)
    expect(result.poleStarCount).toBe(0)
    expect(result.voidCount).toBe(0)
    expect(result.systemType).toBe('no-system')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single point', () => {
    const point = analyzeStarPoint(richContent, 'rich.ts')
    const result = analyzeStarSystem([point], 'src')
    expect(result.avgNavigation).toBe(point.navigationClarity)
    expect(result.avgOrganization).toBe(point.stellarOrganization)
    expect(result.avgAlignment).toBe(point.northStarAlignment)
  })

  it('counts pole stars and voids', () => {
    const pole = analyzeStarPoint(richContent, 'rich.ts')
    const voidP = analyzeStarPoint(emptyContent, 'empty.ts')
    if (pole.condition === 'pole-star' && voidP.condition === 'void') {
      const result = analyzeStarSystem([pole, voidP], 'src')
      expect(result.poleStarCount).toBe(1)
      expect(result.voidCount).toBe(1)
    }
  })
})

// ─── buildAstralCompassResult ──────────────────────────────────────

describe('buildAstralCompassResult', () => {
  it('handles empty input', async () => {
    const result = await buildAstralCompassResult([], [])
    expect(result.points).toHaveLength(0)
    expect(result.systems).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalSystems).toBe(0)
    expect(result.stats.overallClarity).toBe(0)
    expect(result.cosmos.isAligned).toBe(false)
    expect(result.cosmos.overallClarity).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildAstralCompassResult(['file.ts'], [richContent])
    expect(result.points).toHaveLength(1)
    expect(result.points[0].file).toBe('file.ts')
    expect(result.systems).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into systems by directory', async () => {
    const result = await buildAstralCompassResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.points).toHaveLength(3)
    expect(result.systems).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalSystems).toBe(2)
  })

  it('computes cosmos summary correctly', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [richContent])
    expect(result.cosmos.avgNavigation).toBe(result.points[0].navigationClarity)
    expect(result.cosmos.overallClarity).toBeGreaterThanOrEqual(0)
  })

  it('sets isAligned when avgNavigation >= 60', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [richContent])
    if (result.cosmos.avgNavigation >= 60) {
      expect(result.cosmos.isAligned).toBe(true)
    } else {
      expect(result.cosmos.isAligned).toBe(false)
    }
  })

  it('tracks best point and top performers', async () => {
    const result = await buildAstralCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestPoint).toBe('a.ts')
    expect(result.stats.clearest).toBeDefined()
    expect(result.stats.mostStructured).toBeDefined()
    expect(result.stats.mostOrganized).toBeDefined()
    expect(result.stats.mostHarmonious).toBeDefined()
  })

  it('computes overallClarity as avg of navigation+organization+alignment', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.cosmos.avgNavigation + result.cosmos.avgOrganization + result.cosmos.avgAlignment) / 3,
    )
    expect(result.cosmos.overallClarity).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildAstralCompassResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.poleStarCount +
      result.stats.brightStarCount +
      result.stats.properStarCount +
      result.stats.dimStarCount +
      result.stats.darkMatterCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets navigator grade', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [richContent])
    expect(['grand-astronomer', 'star-captain', 'skilled-navigator', 'apprentice', 'novice', 'landlubber']).toContain(
      result.stats.navigatorGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: AstralCompassStats = {
    totalFiles: 0, totalSystems: 0,
    avgNavigationClarity: 0, avgConstellationStructure: 0, avgStellarOrganization: 0,
    avgOrbitHarmony: 0, avgNorthStarAlignment: 0,
    poleStarCount: 0, brightStarCount: 0, properStarCount: 0,
    dimStarCount: 0, darkMatterCount: 0, voidCount: 0,
    hasHighClarityCount: 0, hasHighStructureCount: 0, hasHighOrganizationCount: 0,
    hasHighHarmonyCount: 0, hasHighAlignmentCount: 0,
    overallClarity: 0, navigatorGrade: 'landlubber',
    bestPoint: '', clearest: '', mostStructured: '', mostOrganized: '', mostHarmonious: '',
  }

  const emptyCosmos: CosmosSummary = {
    avgNavigation: 0, avgOrganization: 0, avgAlignment: 0,
    isAligned: false, overallClarity: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyCosmos, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes navigation recommendation when avgNavigationClarity < 50', () => {
    const stats = { ...emptyStats, avgNavigationClarity: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('navigation'))).toBe(true)
  })

  it('includes constellation recommendation when avgConstellationStructure < 50', () => {
    const stats = { ...emptyStats, avgConstellationStructure: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('constellation'))).toBe(true)
  })

  it('includes stellar recommendation when avgStellarOrganization < 50', () => {
    const stats = { ...emptyStats, avgStellarOrganization: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('stellar'))).toBe(true)
  })

  it('includes orbit recommendation when avgOrbitHarmony < 50', () => {
    const stats = { ...emptyStats, avgOrbitHarmony: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('orbit'))).toBe(true)
  })

  it('includes north-star recommendation when avgNorthStarAlignment < 50', () => {
    const stats = { ...emptyStats, avgNorthStarAlignment: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('north-star'))).toBe(true)
  })

  it('includes void guidance when voidCount > 0', () => {
    const stats = { ...emptyStats, voidCount: 3 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('void'))).toBe(true)
  })

  it('includes clarity recommendation when overallClarity < 40', () => {
    const stats = { ...emptyStats, overallClarity: 20 }
    const cosmos = { ...emptyCosmos, overallClarity: 20 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('clarity'))).toBe(true)
  })

  it('praises grand-astronomer quality when all metrics are high', () => {
    const highStats: AstralCompassStats = {
      ...emptyStats,
      avgNavigationClarity: 80, avgConstellationStructure: 80, avgStellarOrganization: 80,
      avgOrbitHarmony: 80, avgNorthStarAlignment: 80,
      overallClarity: 80, navigatorGrade: 'grand-astronomer',
    }
    const highCosmos: CosmosSummary = {
      avgNavigation: 80, avgOrganization: 80, avgAlignment: 80,
      isAligned: true, overallClarity: 80,
    }
    const recs = generateRecommendations([], [], highCosmos, highStats)
    expect(recs.some(r => r.includes('grand-astronomer'))).toBe(true)
  })

  it('mentions specific void files when <= 3', () => {
    const point: StarPoint = analyzeStarPoint(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, voidCount: 1 }
    const recs = generateRecommendations([point], [], emptyCosmos, stats)
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
  it('returns a string for pole-star', () => {
    expect(typeof colorGrade('pole-star')).toBe('string')
  })
  it('returns a string for void', () => {
    expect(typeof colorGrade('void')).toBe('string')
  })
  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatPointTable', () => {
  it('formats a single point', () => {
    const point = analyzeStarPoint(richContent, 'rich.ts')
    const result = formatPointTable(point)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Navigation Clarity')
    expect(result).toContain('Constellation Structure')
    expect(result).toContain('Stellar Organization')
    expect(result).toContain('Orbit Harmony')
    expect(result).toContain('North Star Alignment')
  })
})

describe('formatPointsTable', () => {
  it('handles empty array', () => {
    expect(formatPointsTable([])).toContain('No star points')
  })
  it('formats multiple points', () => {
    const points = [
      analyzeStarPoint(richContent, 'a.ts'),
      analyzeStarPoint(moderateContent, 'b.ts'),
    ]
    const result = formatPointsTable(points)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatSystemTable', () => {
  it('formats a system', () => {
    const point = analyzeStarPoint(richContent, 'rich.ts')
    const system = analyzeStarSystem([point], 'src')
    const result = formatSystemTable(system)
    expect(result).toContain('src')
    expect(result).toContain('System')
  })
})

describe('formatSystemsTable', () => {
  it('handles empty array', () => {
    expect(formatSystemsTable([])).toContain('No star systems')
  })
  it('formats multiple systems', () => {
    const point = analyzeStarPoint(richContent, 'src/a.ts')
    const system = analyzeStarSystem([point], 'src')
    const result = formatSystemsTable([system])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildAstralCompassResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Astral Compass Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Clarity')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Improve navigation', 'Strengthen structure'])
    expect(result).toContain('Improve navigation')
    expect(result).toContain('Strengthen structure')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Astral Compass Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Aligned')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildAstralCompassResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.points).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.cosmos).toBeDefined()
  })
})
