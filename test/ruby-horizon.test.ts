import { describe, it, expect } from 'vitest'
import {
  measureIlluminating,
  measureCutting,
  measureReaching,
  measureEnergizing,
  measureLearning,
  classifyFacetCondition,
  classifyRangeType,
  classifyRangeCondition,
  classifyJewelerGrade,
  analyzeRubyFacet,
  analyzeHorizonRange,
  buildRubyHorizonResult,
  generateRecommendations,
} from '../src/commands/ruby-horizon-helpers.js'
import {
  colorScore,
  colorGrade,
  formatFacetTable,
  formatFacetsTable,
  formatRangeTable,
  formatRangesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/ruby-horizon-format-helpers.js'
import type { RubyFacet } from '../src/commands/ruby-horizon-helpers.js'

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

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns no-dawn for empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('no-dawn')
    expect(m.hasHighClarity).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns crystal-dawn for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('crystal-dawn')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasFresh).toBe(true)
  })

  it('counts obfuscated patterns (var)', () => {
    const m = measureIlluminating('var x = 1; var y = 2;')
    expect(m.obfuscatedCount).toBe(2)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts cryptic patterns (any)', () => {
    const m = measureIlluminating('const x: any = 1;')
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects eval as hidden', () => {
    const m = measureIlluminating("eval('x')")
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects debugger as dense', () => {
    const m = measureIlluminating('debugger')
    expect(m.hasNoDense).toBe(false)
  })

  it('returns higher clarity for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.clarity).toBeGreaterThan(0)
  })
})

// ─── measureCutting ────────────────────────────────────────────────

describe('measureCutting', () => {
  it('returns no-gem for empty content', () => {
    const m = measureCutting(emptyContent)
    expect(m.faceting).toBe(0)
    expect(m.gem).toBe('no-gem')
    expect(m.hasHighFaceting).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.vagueCount).toBe(0)
  })

  it('returns perfect-cut for rich content', () => {
    const m = measureCutting(richContent)
    expect(m.faceting).toBeGreaterThanOrEqual(85)
    expect(m.gem).toBe('perfect-cut')
    expect(m.hasHighFaceting).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.hasMultiFaceted).toBe(true)
  })

  it('counts approximate patterns (var)', () => {
    const m = measureCutting('var x = 1; var y = 2;')
    expect(m.approximateCount).toBe(2)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('counts vague patterns (any)', () => {
    const m = measureCutting('const x: any = 1;')
    expect(m.vagueCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoVague).toBe(false)
  })

  it('detects eval as sloppy', () => {
    const m = measureCutting("eval('x')")
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects debugger as blurry', () => {
    const m = measureCutting('debugger')
    expect(m.hasNoBlurry).toBe(false)
  })
})

// ─── measureReaching ───────────────────────────────────────────────

describe('measureReaching', () => {
  it('returns no-vision for empty content', () => {
    const m = measureReaching(emptyContent)
    expect(m.reach).toBe(0)
    expect(m.horizon).toBe('no-vision')
    expect(m.hasHighReach).toBe(false)
    expect(m.fixedCapacityCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('returns infinite-horizon for rich content', () => {
    const m = measureReaching(richContent)
    expect(m.reach).toBeGreaterThanOrEqual(85)
    expect(m.horizon).toBe('infinite-horizon')
    expect(m.hasHighReach).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasNoFixedCapacity).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasFutureProof).toBe(true)
    expect(m.hasForward).toBe(true)
  })

  it('counts fixed capacity patterns (var)', () => {
    const m = measureReaching('var x = 1; var y = 2;')
    expect(m.fixedCapacityCount).toBe(2)
    expect(m.hasNoFixedCapacity).toBe(false)
  })

  it('counts monolithic patterns (any)', () => {
    const m = measureReaching('const x: any = 1;')
    expect(m.monolithicCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects eval as legacy bound', () => {
    const m = measureReaching("eval('x')")
    expect(m.hasNoLegacyBound).toBe(false)
  })

  it('detects debugger as hardcoded', () => {
    const m = measureReaching('debugger')
    expect(m.hasNoHardcoded).toBe(false)
  })
})

// ─── measureEnergizing ─────────────────────────────────────────────

describe('measureEnergizing', () => {
  it('returns no-sunrise for empty content', () => {
    const m = measureEnergizing(emptyContent)
    expect(m.vitality).toBe(0)
    expect(m.sunrise).toBe('no-sunrise')
    expect(m.hasHighVitality).toBe(false)
    expect(m.deadCount).toBe(0)
    expect(m.stagnantCount).toBe(0)
  })

  it('returns golden-sunrise for rich content', () => {
    const m = measureEnergizing(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(85)
    expect(m.sunrise).toBe('golden-sunrise')
    expect(m.hasHighVitality).toBe(true)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasAlive).toBe(true)
    expect(m.hasNoDead).toBe(true)
    expect(m.hasGrowing).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasEnergetic).toBe(true)
  })

  it('counts dead patterns (var)', () => {
    const m = measureEnergizing('var x = 1; var y = 2;')
    expect(m.deadCount).toBe(2)
    expect(m.hasNoDead).toBe(false)
  })

  it('counts stagnant patterns (any)', () => {
    const m = measureEnergizing('const x: any = 1;')
    expect(m.stagnantCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects eval as frozen', () => {
    const m = measureEnergizing("eval('x')")
    expect(m.hasNoFrozen).toBe(false)
  })

  it('detects debugger as static', () => {
    const m = measureEnergizing('debugger')
    expect(m.hasNoStatic).toBe(false)
  })
})

// ─── measureLearning ───────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns oblivion for empty content', () => {
    const m = measureLearning(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.twilight).toBe('oblivion')
    expect(m.hasHighWisdom).toBe(false)
    expect(m.firstDraftCount).toBe(0)
    expect(m.repeatedCount).toBe(0)
  })

  it('returns sunset-wisdom for rich content', () => {
    const m = measureLearning(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(85)
    expect(m.twilight).toBe('sunset-wisdom')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasIterated).toBe(true)
    expect(m.hasNoFirstDraft).toBe(true)
    expect(m.hasImproved).toBe(true)
    expect(m.hasNoRepeated).toBe(true)
    expect(m.hasRefactored).toBe(true)
    expect(m.hasEvolved).toBe(true)
    expect(m.hasAdaptive).toBe(true)
  })

  it('counts first draft patterns (var)', () => {
    const m = measureLearning('var x = 1; var y = 2;')
    expect(m.firstDraftCount).toBe(2)
    expect(m.hasNoFirstDraft).toBe(false)
  })

  it('counts repeated patterns (any)', () => {
    const m = measureLearning('const x: any = 1;')
    expect(m.repeatedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoRepeated).toBe(false)
  })

  it('detects eval as unchanged', () => {
    const m = measureLearning("eval('x')")
    expect(m.hasNoUnchanged).toBe(false)
  })

  it('detects debugger as rigid', () => {
    const m = measureLearning('debugger')
    expect(m.hasNoRigid).toBe(false)
  })
})

// ─── classifyFacetCondition ────────────────────────────────────────

describe('classifyFacetCondition', () => {
  it('classifies correctly at all boundaries', () => {
    expect(classifyFacetCondition(90)).toBe('ruby-masterpiece')
    expect(classifyFacetCondition(85)).toBe('ruby-masterpiece')
    expect(classifyFacetCondition(70)).toBe('gemstone-horizon')
    expect(classifyFacetCondition(55)).toBe('proper-gem')
    expect(classifyFacetCondition(40)).toBe('rough-mineral')
    expect(classifyFacetCondition(25)).toBe('dull-stone')
    expect(classifyFacetCondition(0)).toBe('gravel')
    expect(classifyFacetCondition(24)).toBe('gravel')
  })
})

// ─── classifyRangeType ─────────────────────────────────────────────

describe('classifyRangeType', () => {
  it('returns no-range for empty array', () => {
    expect(classifyRangeType([])).toBe('no-range')
  })

  it('returns mountain-range for high-quality facets', () => {
    const facets = Array.from({ length: 4 }, () => ({
      ...analyzeRubyFacet(richContent, 'test.ts'),
      qualityScore: 90,
      condition: 'ruby-masterpiece' as const,
    }))
    expect(classifyRangeType(facets)).toBe('mountain-range')
  })

  it('returns proper-horizon for decent facets', () => {
    const facets = Array.from({ length: 2 }, () => ({
      ...analyzeRubyFacet(richContent, 'test.ts'),
      qualityScore: 65,
      condition: 'gemstone-horizon' as const,
    }))
    expect(classifyRangeType(facets)).toBe('proper-horizon')
  })

  it('returns no-range for low-quality facets', () => {
    const facets = Array.from({ length: 2 }, () => ({
      ...analyzeRubyFacet(emptyContent, 'test.ts'),
      qualityScore: 10,
      condition: 'gravel' as const,
    }))
    expect(classifyRangeType(facets)).toBe('no-range')
  })
})

// ─── classifyRangeCondition ────────────────────────────────────────

describe('classifyRangeCondition', () => {
  it('classifies all conditions', () => {
    expect(classifyRangeCondition(80)).toBe('majestic-panorama')
    expect(classifyRangeCondition(60)).toBe('beautiful-vista')
    expect(classifyRangeCondition(45)).toBe('decent-view')
    expect(classifyRangeCondition(30)).toBe('limited-sight')
    expect(classifyRangeCondition(15)).toBe('obscured')
    expect(classifyRangeCondition(0)).toBe('void')
  })
})

// ─── classifyJewelerGrade ──────────────────────────────────────────

describe('classifyJewelerGrade', () => {
  it('classifies all grades', () => {
    expect(classifyJewelerGrade(85)).toBe('master-jeweler')
    expect(classifyJewelerGrade(65)).toBe('expert-gem-cutter')
    expect(classifyJewelerGrade(50)).toBe('skilled-lapidary')
    expect(classifyJewelerGrade(35)).toBe('apprentice')
    expect(classifyJewelerGrade(20)).toBe('novice')
    expect(classifyJewelerGrade(0)).toBe('rock-smasher')
  })
})

// ─── analyzeRubyFacet ──────────────────────────────────────────────

describe('analyzeRubyFacet', () => {
  it('analyzes empty content as gravel', () => {
    const facet = analyzeRubyFacet(emptyContent, 'empty.ts')
    expect(facet.file).toBe('empty.ts')
    expect(facet.dawnClarity).toBe(0)
    expect(facet.gemFaceting).toBe(0)
    expect(facet.horizonReach).toBe(0)
    expect(facet.sunriseVitality).toBe(0)
    expect(facet.twilightWisdom).toBe(0)
    expect(facet.qualityScore).toBe(0)
    expect(facet.condition).toBe('gravel')
  })

  it('analyzes rich content as ruby-masterpiece', () => {
    const facet = analyzeRubyFacet(richContent, 'rich.ts')
    expect(facet.file).toBe('rich.ts')
    expect(facet.condition).toBe('ruby-masterpiece')
    expect(facet.dawnClarity).toBeGreaterThan(0)
    expect(facet.gemFaceting).toBeGreaterThan(0)
    expect(facet.horizonReach).toBeGreaterThan(0)
    expect(facet.sunriseVitality).toBeGreaterThan(0)
    expect(facet.twilightWisdom).toBeGreaterThan(0)
  })

  it('computes qualityScore as weighted average', () => {
    const facet = analyzeRubyFacet(moderateContent, 'mod.ts')
    const expected = Math.round(
      facet.dawnClarity * 0.2 + facet.gemFaceting * 0.2 + facet.horizonReach * 0.2 +
      facet.sunriseVitality * 0.2 + facet.twilightWisdom * 0.2,
    )
    expect(facet.qualityScore).toBe(expected)
  })

  it('preserves all measure data', () => {
    const facet = analyzeRubyFacet(richContent, 'rich.ts')
    expect(facet.illuminating.clarity).toBe(facet.dawnClarity)
    expect(facet.cutting.faceting).toBe(facet.gemFaceting)
    expect(facet.reaching.reach).toBe(facet.horizonReach)
    expect(facet.energizing.vitality).toBe(facet.sunriseVitality)
    expect(facet.learning.wisdom).toBe(facet.twilightWisdom)
  })
})

// ─── analyzeHorizonRange ───────────────────────────────────────────

describe('analyzeHorizonRange', () => {
  it('returns empty range for no facets', () => {
    const range = analyzeHorizonRange([], 'empty-dir')
    expect(range.directory).toBe('empty-dir')
    expect(range.facets).toHaveLength(0)
    expect(range.avgClarity).toBe(0)
    expect(range.avgReach).toBe(0)
    expect(range.avgWisdom).toBe(0)
    expect(range.rangeType).toBe('no-range')
    expect(range.condition).toBe('void')
  })

  it('aggregates facet metrics', () => {
    const facets = [
      analyzeRubyFacet(richContent, 'a.ts'),
      analyzeRubyFacet(richContent, 'b.ts'),
    ]
    const range = analyzeHorizonRange(facets, 'src')
    expect(range.facets).toHaveLength(2)
    expect(range.avgClarity).toBeGreaterThan(0)
    expect(range.avgReach).toBeGreaterThan(0)
    expect(range.avgWisdom).toBeGreaterThan(0)
  })

  it('counts gravel facets', () => {
    const facets = [
      analyzeRubyFacet(emptyContent, 'bad.ts'),
      analyzeRubyFacet(emptyContent, 'worse.ts'),
    ]
    const range = analyzeHorizonRange(facets, 'bad-dir')
    expect(range.gravelCount).toBe(2)
  })
})

// ─── buildRubyHorizonResult ────────────────────────────────────────

describe('buildRubyHorizonResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildRubyHorizonResult([], [])
    expect(result.facets).toHaveLength(0)
    expect(result.ranges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSplendor).toBe(0)
    expect(result.panorama.isMajestic).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    expect(result.facets).toHaveLength(1)
    expect(result.ranges).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgDawnClarity).toBeGreaterThan(0)
    expect(result.stats.overallSplendor).toBeGreaterThan(0)
    expect(result.stats.bestFacet).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.bestCut).toBe('test.ts')
    expect(result.stats.farthest).toBe('test.ts')
    expect(result.stats.wisest).toBe('test.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildRubyHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.facets).toHaveLength(3)
    expect(result.ranges).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalRanges).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes panorama correctly', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    expect(result.panorama.avgClarity).toBeGreaterThan(0)
    expect(result.panorama.avgReach).toBeGreaterThan(0)
    expect(result.panorama.avgWisdom).toBeGreaterThan(0)
    expect(result.panorama.overallSplendor).toBeGreaterThan(0)
  })

  it('tracks all condition counts', async () => {
    const result = await buildRubyHorizonResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.stats.gravelCount).toBe(2)
    expect(result.stats.rubyMasterpieceCount).toBe(0)
  })

  it('tracks high-quality counts', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFacetingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighReachCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns congratulatory message for good code', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    const recs = generateRecommendations(result.facets, result.ranges, result.panorama, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for poor code', async () => {
    const result = await buildRubyHorizonResult(['bad.ts'], [emptyContent])
    const recs = generateRecommendations(result.facets, result.ranges, result.panorama, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some(r => r.includes('dawn clarity'))).toBe(true)
  })

  it('recommends for gravel facets', async () => {
    const result = await buildRubyHorizonResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.facets, result.ranges, result.panorama, result.stats)
    expect(recs.some(r => r.includes('gravel'))).toBe(true)
  })

  it('restores specific gravel files', async () => {
    const result = await buildRubyHorizonResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.facets, result.ranges, result.panorama, result.stats)
    expect(recs.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('master-jeweler')).toBe('string')
    expect(typeof colorGrade('crystal-dawn')).toBe('string')
    expect(typeof colorGrade('ruby-masterpiece')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatFacetTable', () => {
  it('formats a single facet', () => {
    const facet = analyzeRubyFacet(richContent, 'test.ts')
    const output = formatFacetTable(facet)
    expect(output).toContain('test.ts')
    expect(output).toContain('Dawn Clarity')
    expect(output).toContain('Gem Faceting')
    expect(output).toContain('Horizon Reach')
    expect(output).toContain('Sunrise Vitality')
    expect(output).toContain('Twilight Wisdom')
  })
})

describe('formatFacetsTable', () => {
  it('returns message for empty array', () => {
    expect(formatFacetsTable([])).toContain('No ruby facets')
  })

  it('formats multiple facets', () => {
    const facets = [
      analyzeRubyFacet(richContent, 'a.ts'),
      analyzeRubyFacet(moderateContent, 'b.ts'),
    ]
    const output = formatFacetsTable(facets)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatRangeTable', () => {
  it('formats a single range', () => {
    const facets = [analyzeRubyFacet(richContent, 'test.ts')]
    const range = analyzeHorizonRange(facets, 'src')
    const output = formatRangeTable(range)
    expect(output).toContain('src')
  })
})

describe('formatRangesTable', () => {
  it('returns message for empty array', () => {
    expect(formatRangesTable([])).toContain('No horizon ranges')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Jeweler Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix this', 'Improve that'])
    expect(output).toContain('Fix this')
    expect(output).toContain('Improve that')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Ruby Horizon Analysis')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.facets).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.panorama).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles mixed quality files', async () => {
    const result = await buildRubyHorizonResult(
      ['good.ts', 'ok.ts', 'bad.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.facets).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.gravelCount).toBeGreaterThanOrEqual(1)
    expect(result.panorama.overallSplendor).toBeGreaterThanOrEqual(0)
  })

  it('groups files into ranges by directory', async () => {
    const result = await buildRubyHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, richContent],
    )
    expect(result.ranges).toHaveLength(2)
    const src = result.ranges.find(r => r.directory === 'src')
    const lib = result.ranges.find(r => r.directory === 'lib')
    expect(src).toBeDefined()
    expect(lib).toBeDefined()
    if (src) expect(src.facets).toHaveLength(2)
    if (lib) expect(lib.facets).toHaveLength(1)
  })

  it('condition counts match facet conditions', async () => {
    const result = await buildRubyHorizonResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const gravel = result.facets.filter(f => f.condition === 'gravel').length
    expect(result.stats.gravelCount).toBe(gravel)
  })

  it('panorama overallSplendor is avg of 3 measures', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    const expected = Math.round(
      (result.panorama.avgClarity + result.panorama.avgReach + result.panorama.avgWisdom) / 3,
    )
    expect(result.panorama.overallSplendor).toBe(expected)
  })

  it('stats avgSunriseVitality is computed', async () => {
    const result = await buildRubyHorizonResult(['test.ts'], [richContent])
    expect(result.stats.avgSunriseVitality).toBeGreaterThan(0)
    expect(result.stats.avgTwilightWisdom).toBeGreaterThan(0)
  })

  it('minimal content scores low but not zero', () => {
    const facet = analyzeRubyFacet(minimalContent, 'minimal.ts')
    expect(facet.dawnClarity).toBeGreaterThan(0)
    expect(facet.gemFaceting).toBeGreaterThan(0)
  })
})
