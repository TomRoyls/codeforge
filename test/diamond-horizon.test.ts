import { describe, expect, it } from 'vitest'
import {
  analyzeDiamondFacet,
  analyzeDiamondMine,
  buildDiamondHorizonResult,
  classifyFacetCondition,
  classifyJewelerGrade,
  classifyMineCondition,
  classifyMineType,
  generateRecommendations,
  measureCutting,
  measureDispersing,
  measureEnduring,
  measureShining,
  measureWeighing,
} from '../src/commands/diamond-horizon-helpers.js'
import {
  colorGrade,
  colorScore,
  formatFacetTable,
  formatFacetsTable,
  formatMineTable,
  formatMinesTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/diamond-horizon-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────

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
  email?: string
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type Status = 'active' | 'inactive' | 'pending'

export class UserService<T extends UserConfig> {
  private users: T[] = []

  async addUser(user: T): Promise<void> {
    try {
      this.users.push(user)
    } catch (error) {
      throw new Error('Failed to add user')
    }
  }

  getUser(id: string): T | undefined {
    return this.users.find(u => u.name === id)
  }
}

export const DEFAULT_CONFIG: UserConfig = {
  name: 'default',
  age: 0,
}

export function createConfig(name: string, age: number): UserConfig {
  return { name, age }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
`

// ─── measureEnduring ──────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns hardness score for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.hardness).toBe(6)
    expect(m.grade).toBe('industrial-grade')
  })

  it('returns hardness score for moderate content', () => {
    const m = measureEnduring(moderateContent)
    expect(m.hardness).toBe(52)
    expect(m.grade).toBe('slightly-included')
  })

  it('returns hardness score for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hardness).toBe(100)
    expect(m.grade).toBe('flawless-diamond')
  })

  it('detects robust patterns in rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measureEnduring(minimalContent)
    expect(m.hasRobust).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasDurable).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
  })

  it('detects hasHighHardness for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasHighHardness).toBe(true)
  })

  it('minimal content has low hardness', () => {
    const m = measureEnduring(minimalContent)
    expect(m.hasHighHardness).toBe(false)
  })

  it('counts untested and bare crash patterns', () => {
    const m = measureEnduring('var x: any = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('hasNoObfuscated when no eval present', () => {
    const m = measureEnduring('const x = 1')
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('hasNoFragile when no debugger present', () => {
    const m = measureEnduring('const x = 1')
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
  })
})

// ─── measureCutting ───────────────────────────────────────────────

describe('measureCutting', () => {
  it('returns precision score for minimal content', () => {
    const m = measureCutting(minimalContent)
    expect(m.precision).toBe(6)
    expect(m.cut).toBe('poor-cut')
  })

  it('returns precision score for moderate content', () => {
    const m = measureCutting(moderateContent)
    expect(m.precision).toBe(54)
    expect(m.cut).toBe('good-cut')
  })

  it('returns precision score for rich content', () => {
    const m = measureCutting(richContent)
    expect(m.precision).toBe(100)
    expect(m.cut).toBe('ideal-cut')
  })

  it('detects exact and accurate in rich content', () => {
    const m = measureCutting(richContent)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasWellOrganized).toBe(true)
    expect(m.hasSharp).toBe(true)
  })

  it('minimal content has no cutting combos', () => {
    const m = measureCutting(minimalContent)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasStructured).toBe(false)
    expect(m.hasWellOrganized).toBe(false)
    expect(m.hasSharp).toBe(false)
  })

  it('detects hasHighPrecision for rich content', () => {
    const m = measureCutting(richContent)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('minimal has low precision', () => {
    const m = measureCutting(minimalContent)
    expect(m.hasHighPrecision).toBe(false)
  })

  it('counts approximate and sloppy patterns', () => {
    const m = measureCutting('var x: any = 1')
    expect(m.approximateCount).toBe(1)
    expect(m.sloppyCount).toBe(1)
    expect(m.hasNoApproximate).toBe(false)
    expect(m.hasNoVague).toBe(false)
  })

  it('hasNoChaotic when no eval present', () => {
    const m = measureCutting('const x = 1')
    expect(m.hasNoChaotic).toBe(true)
  })

  it('hasNoSloppy when no debugger present', () => {
    const m = measureCutting('const x = 1')
    expect(m.hasNoScattered).toBe(true)
    expect(m.hasNoSloppy).toBe(true)
  })
})

// ─── measureDispersing ────────────────────────────────────────────

describe('measureDispersing', () => {
  it('returns dispersion score for minimal content', () => {
    const m = measureDispersing(minimalContent)
    expect(m.dispersion).toBe(6)
    expect(m.fire).toBe('no-fire')
  })

  it('returns dispersion score for moderate content', () => {
    const m = measureDispersing(moderateContent)
    expect(m.dispersion).toBe(56)
    expect(m.fire).toBe('proper-spectrum')
  })

  it('returns dispersion score for rich content', () => {
    const m = measureDispersing(richContent)
    expect(m.dispersion).toBe(100)
    expect(m.fire).toBe('maximum-fire')
  })

  it('detects polymorphic and adaptive in rich content', () => {
    const m = measureDispersing(richContent)
    expect(m.hasTypeHandling).toBe(true)
    expect(m.hasCaseCoverage).toBe(true)
    expect(m.hasPolymorphic).toBe(true)
    expect(m.hasGeneric).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasAdaptive).toBe(true)
  })

  it('minimal content has no dispersing combos', () => {
    const m = measureDispersing(minimalContent)
    expect(m.hasTypeHandling).toBe(false)
    expect(m.hasCaseCoverage).toBe(false)
    expect(m.hasPolymorphic).toBe(false)
    expect(m.hasGeneric).toBe(false)
    expect(m.hasFlexible).toBe(false)
    expect(m.hasAdaptive).toBe(false)
  })

  it('detects hasHighDispersion for rich content', () => {
    const m = measureDispersing(richContent)
    expect(m.hasHighDispersion).toBe(true)
  })

  it('minimal has low dispersion', () => {
    const m = measureDispersing(minimalContent)
    expect(m.hasHighDispersion).toBe(false)
  })

  it('counts single path and hardcoded patterns', () => {
    const m = measureDispersing('var x: any = 1')
    expect(m.singlePathCount).toBe(1)
    expect(m.hardcodedCount).toBe(1)
    expect(m.hasNoSinglePath).toBe(false)
    expect(m.hasNoMonomorphic).toBe(false)
  })

  it('hasNoHardcoded when no eval present', () => {
    const m = measureDispersing('const x = 1')
    expect(m.hasNoHardcoded).toBe(true)
  })

  it('hasNoRigid when no debugger present', () => {
    const m = measureDispersing('const x = 1')
    expect(m.hasNoRigid).toBe(true)
  })
})

// ─── measureShining ───────────────────────────────────────────────

describe('measureShining', () => {
  it('returns brilliance score for minimal content', () => {
    const m = measureShining(minimalContent)
    expect(m.brilliance).toBe(6)
    expect(m.shine).toBe('no-brilliance')
  })

  it('returns brilliance score for moderate content', () => {
    const m = measureShining(moderateContent)
    expect(m.brilliance).toBe(47)
    expect(m.shine).toBe('dim-luster')
  })

  it('returns brilliance score for rich content', () => {
    const m = measureShining(richContent)
    expect(m.brilliance).toBe(100)
    expect(m.shine).toBe('dazzling-brilliance')
  })

  it('detects readable and self-documenting in rich content', () => {
    const m = measureShining(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('minimal content has no shining combos', () => {
    const m = measureShining(minimalContent)
    expect(m.hasReadable).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasElegant).toBe(false)
    expect(m.hasWellNamed).toBe(false)
    expect(m.hasBeautiful).toBe(false)
  })

  it('detects hasHighBrilliance for rich content', () => {
    const m = measureShining(richContent)
    expect(m.hasHighBrilliance).toBe(true)
  })

  it('minimal has low brilliance', () => {
    const m = measureShining(minimalContent)
    expect(m.hasHighBrilliance).toBe(false)
  })

  it('counts cryptic and obfuscated patterns', () => {
    const m = measureShining('var x: any = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('hasNoClunky when no eval present', () => {
    const m = measureShining('const x = 1')
    expect(m.hasNoClunky).toBe(true)
  })

  it('hasNoMisnamed when no debugger present', () => {
    const m = measureShining('const x = 1')
    expect(m.hasNoMisnamed).toBe(true)
  })
})

// ─── measureWeighing ──────────────────────────────────────────────

describe('measureWeighing', () => {
  it('returns substance score for minimal content', () => {
    const m = measureWeighing(minimalContent)
    expect(m.substance).toBe(8)
    expect(m.carat).toBe('no-substance')
  })

  it('returns substance score for moderate content', () => {
    const m = measureWeighing(moderateContent)
    expect(m.substance).toBe(50)
    expect(m.carat).toBe('light-weight')
  })

  it('returns substance score for rich content', () => {
    const m = measureWeighing(richContent)
    expect(m.substance).toBe(93)
    expect(m.carat).toBe('substantial-gem')
  })

  it('detects essential and high-value in rich content', () => {
    const m = measureWeighing(richContent)
    expect(m.hasEssential).toBe(true)
    expect(m.hasHighValue).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasValuable).toBe(true)
    expect(m.hasSubstantive).toBe(true)
  })

  it('rich content has no mapFunction so hasMeaningful is false', () => {
    const m = measureWeighing(richContent)
    expect(m.hasMeaningful).toBe(false)
  })

  it('minimal content has no weighing combos', () => {
    const m = measureWeighing(minimalContent)
    expect(m.hasEssential).toBe(false)
    expect(m.hasHighValue).toBe(false)
    expect(m.hasMeaningful).toBe(false)
    expect(m.hasImpactful).toBe(false)
    expect(m.hasValuable).toBe(false)
    expect(m.hasSubstantive).toBe(false)
  })

  it('detects hasHighSubstance for rich content', () => {
    const m = measureWeighing(richContent)
    expect(m.hasHighSubstance).toBe(true)
  })

  it('minimal has low substance', () => {
    const m = measureWeighing(minimalContent)
    expect(m.hasHighSubstance).toBe(false)
  })

  it('counts filler and dead code patterns', () => {
    const m = measureWeighing('var x = 1; eval("test")')
    expect(m.fillerCount).toBe(1)
    expect(m.deadCodeCount).toBe(1)
    expect(m.hasNoFiller).toBe(false)
    expect(m.hasNoBoilerplate).toBe(false)
  })

  it('hasNoDeadCode when no any present', () => {
    const m = measureWeighing('const x = 1')
    expect(m.hasNoDeadCode).toBe(true)
  })

  it('hasNoRedundant when no debugger present', () => {
    const m = measureWeighing('const x = 1')
    expect(m.hasNoRedundant).toBe(true)
  })
})

// ─── classifyFacetCondition ───────────────────────────────────────

describe('classifyFacetCondition', () => {
  it('classifies flawless-diamond at 85+', () => {
    expect(classifyFacetCondition(90)).toBe('flawless-diamond')
    expect(classifyFacetCondition(85)).toBe('flawless-diamond')
  })

  it('classifies premium-gem at 70-84', () => {
    expect(classifyFacetCondition(75)).toBe('premium-gem')
    expect(classifyFacetCondition(70)).toBe('premium-gem')
  })

  it('classifies proper-diamond at 55-69', () => {
    expect(classifyFacetCondition(60)).toBe('proper-diamond')
    expect(classifyFacetCondition(55)).toBe('proper-diamond')
  })

  it('classifies rough-gem at 40-54', () => {
    expect(classifyFacetCondition(45)).toBe('rough-gem')
    expect(classifyFacetCondition(40)).toBe('rough-gem')
  })

  it('classifies industrial-stone at 25-39', () => {
    expect(classifyFacetCondition(30)).toBe('industrial-stone')
    expect(classifyFacetCondition(25)).toBe('industrial-stone')
  })

  it('classifies carbon below 25', () => {
    expect(classifyFacetCondition(20)).toBe('carbon')
    expect(classifyFacetCondition(0)).toBe('carbon')
  })
})

// ─── classifyMineType ─────────────────────────────────────────────

describe('classifyMineType', () => {
  it('returns no-mine for empty facets', () => {
    expect(classifyMineType([])).toBe('no-mine')
  })

  it('returns kimberley-mine for high qs with many flawless', () => {
    const facets = Array.from({ length: 4 }, () => ({ qualityScore: 90, condition: 'flawless-diamond' } as any))
    expect(classifyMineType(facets as any[])).toBe('kimberley-mine')
  })

  it('returns premium-shaft for avgQs >= 60', () => {
    const facets = [{ qualityScore: 65, condition: 'premium-gem' }]
    expect(classifyMineType(facets as any[])).toBe('premium-shaft')
  })

  it('returns proper-tunnel for avgQs >= 45', () => {
    const facets = [{ qualityScore: 50, condition: 'proper-diamond' }]
    expect(classifyMineType(facets as any[])).toBe('proper-tunnel')
  })

  it('returns small-excavation for avgQs >= 30', () => {
    const facets = [{ qualityScore: 35, condition: 'rough-gem' }]
    expect(classifyMineType(facets as any[])).toBe('small-excavation')
  })

  it('returns surface-scraping for avgQs >= 15', () => {
    const facets = [{ qualityScore: 20, condition: 'industrial-stone' }]
    expect(classifyMineType(facets as any[])).toBe('surface-scraping')
  })

  it('returns no-mine for very low avgQs', () => {
    const facets = [{ qualityScore: 5, condition: 'carbon' }]
    expect(classifyMineType(facets as any[])).toBe('no-mine')
  })
})

// ─── classifyMineCondition ────────────────────────────────────────

describe('classifyMineCondition', () => {
  it('classifies diamond-empire at 75+', () => {
    expect(classifyMineCondition(80)).toBe('diamond-empire')
    expect(classifyMineCondition(75)).toBe('diamond-empire')
  })

  it('classifies rich-mine at 60-74', () => {
    expect(classifyMineCondition(65)).toBe('rich-mine')
  })

  it('classifies decent-shaft at 45-59', () => {
    expect(classifyMineCondition(50)).toBe('decent-shaft')
  })

  it('classifies played-out at 30-44', () => {
    expect(classifyMineCondition(35)).toBe('played-out')
  })

  it('classifies abandoned at 15-29', () => {
    expect(classifyMineCondition(20)).toBe('abandoned')
  })

  it('classifies void below 15', () => {
    expect(classifyMineCondition(10)).toBe('void')
  })
})

// ─── classifyJewelerGrade ─────────────────────────────────────────

describe('classifyJewelerGrade', () => {
  it('classifies master-gemologist at 80+', () => {
    expect(classifyJewelerGrade(85)).toBe('master-gemologist')
    expect(classifyJewelerGrade(100)).toBe('master-gemologist')
  })

  it('classifies expert-jeweler at 65-79', () => {
    expect(classifyJewelerGrade(70)).toBe('expert-jeweler')
  })

  it('classifies skilled-cutter at 50-64', () => {
    expect(classifyJewelerGrade(55)).toBe('skilled-cutter')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyJewelerGrade(40)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyJewelerGrade(25)).toBe('novice')
  })

  it('classifies rock-smasher below 20', () => {
    expect(classifyJewelerGrade(10)).toBe('rock-smasher')
  })
})

// ─── analyzeDiamondFacet ──────────────────────────────────────────

describe('analyzeDiamondFacet', () => {
  it('analyzes minimal content correctly', () => {
    const facet = analyzeDiamondFacet(minimalContent, 'minimal.ts')
    expect(facet.file).toBe('minimal.ts')
    expect(facet.hardnessClarity).toBe(6)
    expect(facet.cutPrecision).toBe(6)
    expect(facet.fireDispersion).toBe(6)
    expect(facet.brillianceQuality).toBe(6)
    expect(facet.caratSubstance).toBe(8)
    expect(facet.qualityScore).toBe(6)
    expect(facet.condition).toBe('carbon')
  })

  it('analyzes moderate content correctly', () => {
    const facet = analyzeDiamondFacet(moderateContent, 'moderate.ts')
    expect(facet.file).toBe('moderate.ts')
    expect(facet.hardnessClarity).toBe(52)
    expect(facet.cutPrecision).toBe(54)
    expect(facet.fireDispersion).toBe(56)
    expect(facet.brillianceQuality).toBe(47)
    expect(facet.caratSubstance).toBe(50)
    expect(facet.qualityScore).toBe(52)
    expect(facet.condition).toBe('rough-gem')
  })

  it('analyzes rich content correctly', () => {
    const facet = analyzeDiamondFacet(richContent, 'rich.ts')
    expect(facet.file).toBe('rich.ts')
    expect(facet.hardnessClarity).toBe(100)
    expect(facet.cutPrecision).toBe(100)
    expect(facet.fireDispersion).toBe(100)
    expect(facet.brillianceQuality).toBe(100)
    expect(facet.caratSubstance).toBe(93)
    expect(facet.qualityScore).toBe(99)
    expect(facet.condition).toBe('flawless-diamond')
  })

  it('populates all measure sub-objects', () => {
    const facet = analyzeDiamondFacet(richContent, 'rich.ts')
    expect(facet.enduring).toBeDefined()
    expect(facet.cutting).toBeDefined()
    expect(facet.dispersing).toBeDefined()
    expect(facet.shining).toBeDefined()
    expect(facet.weighing).toBeDefined()
    expect(facet.enduring.grade).toBe('flawless-diamond')
    expect(facet.cutting.cut).toBe('ideal-cut')
    expect(facet.dispersing.fire).toBe('maximum-fire')
    expect(facet.shining.shine).toBe('dazzling-brilliance')
    expect(facet.weighing.carat).toBe('substantial-gem')
  })
})

// ─── analyzeDiamondMine ───────────────────────────────────────────

describe('analyzeDiamondMine', () => {
  it('returns empty mine for no facets', () => {
    const mine = analyzeDiamondMine([], 'empty-dir')
    expect(mine.directory).toBe('empty-dir')
    expect(mine.facets).toEqual([])
    expect(mine.avgHardness).toBe(0)
    expect(mine.avgPrecision).toBe(0)
    expect(mine.avgBrilliance).toBe(0)
    expect(mine.flawlessDiamondCount).toBe(0)
    expect(mine.carbonCount).toBe(0)
    expect(mine.mineType).toBe('no-mine')
    expect(mine.condition).toBe('void')
  })

  it('analyzes single rich facet mine', () => {
    const facet = analyzeDiamondFacet(richContent, 'src/rich.ts')
    const mine = analyzeDiamondMine([facet], 'src')
    expect(mine.avgHardness).toBe(100)
    expect(mine.avgPrecision).toBe(100)
    expect(mine.avgBrilliance).toBe(100)
    expect(mine.flawlessDiamondCount).toBe(1)
    expect(mine.carbonCount).toBe(0)
    expect(mine.mineType).toBe('kimberley-mine')
    expect(mine.condition).toBe('diamond-empire')
  })

  it('counts carbon files correctly', () => {
    const facet = analyzeDiamondFacet(minimalContent, 'bad.ts')
    const mine = analyzeDiamondMine([facet], 'bad-dir')
    expect(mine.carbonCount).toBe(1)
    expect(mine.flawlessDiamondCount).toBe(0)
  })

  it('computes averages across multiple facets', () => {
    const f1 = analyzeDiamondFacet(richContent, 'a.ts')
    const f2 = analyzeDiamondFacet(minimalContent, 'b.ts')
    const mine = analyzeDiamondMine([f1, f2], 'mixed')
    expect(mine.avgHardness).toBe(Math.round((100 + 6) / 2))
    expect(mine.facets.length).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are high', () => {
    const facet = analyzeDiamondFacet(richContent, 'perfect.ts')
    const facets = [facet]
    const mine = analyzeDiamondMine(facets, 'src')
    const horizon = { avgHardness: 100, avgPrecision: 100, avgBrilliance: 100, isFlawless: true, overallClarity: 100 }
    const stats = {
      avgHardnessClarity: 100, avgCutPrecision: 100, avgFireDispersion: 100,
      avgBrillianceQuality: 100, avgCaratSubstance: 93,
      carbonCount: 0, totalFiles: 1, totalMines: 1,
      flawlessDiamondCount: 1, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 1, hasHighPrecisionCount: 1, hasHighDispersionCount: 1,
      hasHighBrillianceCount: 1, hasHighSubstanceCount: 1,
      overallClarity: 100, jewelerGrade: 'master-gemologist' as const,
      bestFacet: 'perfect.ts', hardest: 'perfect.ts', bestCut: 'perfect.ts',
      mostFire: 'perfect.ts', mostBrilliant: 'perfect.ts',
    }
    const recs = generateRecommendations(facets, [mine], horizon, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('flawless perfection')
  })

  it('recommends hardness improvement when low', () => {
    const facets = [analyzeDiamondFacet(minimalContent, 'a.ts')]
    const mine = analyzeDiamondMine(facets, 'src')
    const horizon = { avgHardness: 6, avgPrecision: 6, avgBrilliance: 6, isFlawless: false, overallClarity: 6 }
    const stats = {
      avgHardnessClarity: 6, avgCutPrecision: 6, avgFireDispersion: 6,
      avgBrillianceQuality: 6, avgCaratSubstance: 8,
      carbonCount: 1, totalFiles: 1, totalMines: 1,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 6, jewelerGrade: 'rock-smasher' as const,
      bestFacet: 'a.ts', hardest: 'a.ts', bestCut: 'a.ts',
      mostFire: 'a.ts', mostBrilliant: 'a.ts',
    }
    const recs = generateRecommendations(facets, [mine], horizon, stats)
    expect(recs.some(r => r.includes('hardness clarity'))).toBe(true)
    expect(recs.some(r => r.includes('carbon'))).toBe(true)
  })

  it('recommends cut precision improvement', () => {
    const recs = generateRecommendations([], [], { avgHardness: 60, avgPrecision: 60, avgBrilliance: 60, isFlawless: true, overallClarity: 60 }, {
      avgHardnessClarity: 60, avgCutPrecision: 40, avgFireDispersion: 60,
      avgBrillianceQuality: 60, avgCaratSubstance: 60,
      carbonCount: 0, totalFiles: 0, totalMines: 0,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 60, jewelerGrade: 'skilled-cutter' as const,
      bestFacet: '', hardest: '', bestCut: '', mostFire: '', mostBrilliant: '',
    })
    expect(recs.some(r => r.includes('cut precision'))).toBe(true)
  })

  it('recommends fire dispersion improvement', () => {
    const recs = generateRecommendations([], [], { avgHardness: 60, avgPrecision: 60, avgBrilliance: 60, isFlawless: true, overallClarity: 60 }, {
      avgHardnessClarity: 60, avgCutPrecision: 60, avgFireDispersion: 40,
      avgBrillianceQuality: 60, avgCaratSubstance: 60,
      carbonCount: 0, totalFiles: 0, totalMines: 0,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 60, jewelerGrade: 'skilled-cutter' as const,
      bestFacet: '', hardest: '', bestCut: '', mostFire: '', mostBrilliant: '',
    })
    expect(recs.some(r => r.includes('fire dispersion'))).toBe(true)
  })

  it('recommends brilliance quality improvement', () => {
    const recs = generateRecommendations([], [], { avgHardness: 60, avgPrecision: 60, avgBrilliance: 40, isFlawless: true, overallClarity: 60 }, {
      avgHardnessClarity: 60, avgCutPrecision: 60, avgFireDispersion: 60,
      avgBrillianceQuality: 40, avgCaratSubstance: 60,
      carbonCount: 0, totalFiles: 0, totalMines: 0,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 60, jewelerGrade: 'skilled-cutter' as const,
      bestFacet: '', hardest: '', bestCut: '', mostFire: '', mostBrilliant: '',
    })
    expect(recs.some(r => r.includes('brilliance quality'))).toBe(true)
  })

  it('recommends carat substance improvement', () => {
    const recs = generateRecommendations([], [], { avgHardness: 60, avgPrecision: 60, avgBrilliance: 60, isFlawless: true, overallClarity: 60 }, {
      avgHardnessClarity: 60, avgCutPrecision: 60, avgFireDispersion: 60,
      avgBrillianceQuality: 60, avgCaratSubstance: 40,
      carbonCount: 0, totalFiles: 0, totalMines: 0,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 60, jewelerGrade: 'skilled-cutter' as const,
      bestFacet: '', hardest: '', bestCut: '', mostFire: '', mostBrilliant: '',
    })
    expect(recs.some(r => r.includes('carat substance'))).toBe(true)
  })

  it('recommends overall clarity improvement when low', () => {
    const recs = generateRecommendations([], [], { avgHardness: 20, avgPrecision: 20, avgBrilliance: 20, isFlawless: false, overallClarity: 20 }, {
      avgHardnessClarity: 60, avgCutPrecision: 60, avgFireDispersion: 60,
      avgBrillianceQuality: 60, avgCaratSubstance: 60,
      carbonCount: 0, totalFiles: 0, totalMines: 0,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 20, jewelerGrade: 'novice' as const,
      bestFacet: '', hardest: '', bestCut: '', mostFire: '', mostBrilliant: '',
    })
    expect(recs.some(r => r.includes('Overall clarity'))).toBe(true)
  })

  it('recommends major refactoring when all mines are weak', () => {
    const facet = analyzeDiamondFacet(minimalContent, 'bad.ts')
    const mine = analyzeDiamondMine([facet], 'src')
    const recs = generateRecommendations([facet], [mine], { avgHardness: 6, avgPrecision: 6, avgBrilliance: 6, isFlawless: false, overallClarity: 6 }, {
      avgHardnessClarity: 6, avgCutPrecision: 6, avgFireDispersion: 6,
      avgBrillianceQuality: 6, avgCaratSubstance: 8,
      carbonCount: 1, totalFiles: 1, totalMines: 1,
      flawlessDiamondCount: 0, premiumGemCount: 0, properDiamondCount: 0,
      roughGemCount: 0, industrialStoneCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighDispersionCount: 0,
      hasHighBrillianceCount: 0, hasHighSubstanceCount: 0,
      overallClarity: 6, jewelerGrade: 'rock-smasher' as const,
      bestFacet: 'bad.ts', hardest: 'bad.ts', bestCut: 'bad.ts',
      mostFire: 'bad.ts', mostBrilliant: 'bad.ts',
    })
    expect(recs.some(r => r.includes('depleted') || r.includes('refactor'))).toBe(true)
  })
})

// ─── buildDiamondHorizonResult ─────────────────────────────────────

describe('buildDiamondHorizonResult', () => {
  it('handles empty file list', async () => {
    const result = await buildDiamondHorizonResult([], [])
    expect(result.facets).toEqual([])
    expect(result.mines).toEqual([])
    expect(result.horizon.avgHardness).toBe(0)
    expect(result.horizon.overallClarity).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file correctly', async () => {
    const result = await buildDiamondHorizonResult(['rich.ts'], [richContent])
    expect(result.facets).toHaveLength(1)
    expect(result.facets[0].qualityScore).toBe(99)
    expect(result.horizon.avgHardness).toBe(100)
    expect(result.horizon.avgPrecision).toBe(100)
    expect(result.horizon.avgBrilliance).toBe(100)
    expect(result.horizon.overallClarity).toBe(100)
    expect(result.horizon.isFlawless).toBe(true)
    expect(result.stats.jewelerGrade).toBe('master-gemologist')
    expect(result.stats.flawlessDiamondCount).toBe(1)
  })

  it('includes celebration milestone data', async () => {
    const result = await buildDiamondHorizonResult(['a.ts'], [richContent])
    expect(result.celebration.milestone).toBe(520)
    expect(result.celebration.name).toBe('diamond-horizon')
    expect(result.celebration.message).toContain('520')
    expect(result.celebration.totalTests).toBe(94000)
    expect(result.celebration.previousMilestones).toContain(510)
  })

  it('computes stats correctly for mixed files', async () => {
    const result = await buildDiamondHorizonResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.carbonCount).toBe(1)
    expect(result.stats.flawlessDiamondCount).toBe(1)
    expect(result.stats.bestFacet).toBe('rich.ts')
    expect(result.stats.hardest).toBe('rich.ts')
  })

  it('computes recommendations', async () => {
    const result = await buildDiamondHorizonResult(['minimal.ts'], [minimalContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores', () => {
    expect(colorScore(90)).toBeTruthy()
    expect(colorScore(80)).toBeTruthy()
  })

  it('colors mid scores', () => {
    expect(colorScore(60)).toBeTruthy()
    expect(colorScore(40)).toBeTruthy()
  })

  it('colors low scores', () => {
    expect(colorScore(20)).toBeTruthy()
    expect(colorScore(10)).toBeTruthy()
  })
})

describe('colorGrade', () => {
  it('colors best grades', () => {
    expect(colorGrade('flawless-diamond')).toBeTruthy()
    expect(colorGrade('master-gemologist')).toBeTruthy()
  })

  it('colors good grades', () => {
    expect(colorGrade('internally-flawless')).toBeTruthy()
    expect(colorGrade('expert-jeweler')).toBeTruthy()
  })

  it('colors worst grades', () => {
    expect(colorGrade('carbon')).toBeTruthy()
    expect(colorGrade('rock-smasher')).toBeTruthy()
  })

  it('colors unknown grades', () => {
    expect(colorGrade('unknown-tier')).toBeTruthy()
  })
})

describe('formatFacetTable', () => {
  it('formats a single facet', () => {
    const facet = analyzeDiamondFacet(richContent, 'test.ts')
    const result = formatFacetTable(facet)
    expect(result).toContain('test.ts')
    expect(result).toContain('Hardness Clarity')
    expect(result).toContain('Cut Precision')
    expect(result).toContain('Score')
  })
})

describe('formatFacetsTable', () => {
  it('returns message for empty facets', () => {
    expect(formatFacetsTable([])).toContain('No diamond facets found')
  })

  it('formats multiple facets', () => {
    const f1 = analyzeDiamondFacet(richContent, 'a.ts')
    const f2 = analyzeDiamondFacet(minimalContent, 'b.ts')
    const result = formatFacetsTable([f1, f2])
    expect(result).toContain('Diamond Facet Analysis')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatMineTable', () => {
  it('formats a single mine', () => {
    const facet = analyzeDiamondFacet(richContent, 'test.ts')
    const mine = analyzeDiamondMine([facet], 'src')
    const result = formatMineTable(mine)
    expect(result).toContain('src')
    expect(result).toContain('Flawless Diamonds')
  })
})

describe('formatMinesTable', () => {
  it('returns message for empty mines', () => {
    expect(formatMinesTable([])).toContain('No diamond mines found')
  })

  it('formats multiple mines', () => {
    const f1 = analyzeDiamondFacet(richContent, 'src/a.ts')
    const f2 = analyzeDiamondFacet(minimalContent, 'test/b.ts')
    const m1 = analyzeDiamondMine([f1], 'src')
    const m2 = analyzeDiamondMine([f2], 'test')
    const result = formatMinesTable([m1, m2])
    expect(result).toContain('Diamond Mines')
    expect(result).toContain('src')
    expect(result).toContain('test')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildDiamondHorizonResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Diamond Horizon Statistics')
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Jeweler Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const result = formatRecommendations(['Test rec 1', 'Test rec 2'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
    expect(result).toContain('Test rec 2')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildDiamondHorizonResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Diamond Facet Analysis')
    expect(formatted).toContain('Diamond Mines')
    expect(formatted).toContain('Diamond Horizon Statistics')
    expect(formatted).toContain('Horizon')
    expect(formatted).toContain('Celebration')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildDiamondHorizonResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.facets).toHaveLength(1)
    expect(parsed.celebration.milestone).toBe(520)
    expect(parsed.stats.jewelerGrade).toBe('master-gemologist')
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var, any, eval, debugger', () => {
    const badContent = 'var x: any = eval("1"); debugger;'
    const facet = analyzeDiamondFacet(badContent, 'bad.ts')
    expect(facet.enduring.untestedCount).toBeGreaterThan(0)
    expect(facet.enduring.bareCrashCount).toBeGreaterThan(0)
    expect(facet.enduring.hasNoUntested).toBe(false)
    expect(facet.cutting.approximateCount).toBeGreaterThan(0)
    expect(facet.cutting.sloppyCount).toBeGreaterThan(0)
    expect(facet.shining.crypticCount).toBeGreaterThan(0)
  })

  it('handles very large scores capped at 100', () => {
    const m = measureEnduring(richContent)
    expect(m.hardness).toBeLessThanOrEqual(100)
    const c = measureCutting(richContent)
    expect(c.precision).toBeLessThanOrEqual(100)
    const d = measureDispersing(richContent)
    expect(d.dispersion).toBeLessThanOrEqual(100)
    const s = measureShining(richContent)
    expect(s.brilliance).toBeLessThanOrEqual(100)
  })

  it('qualityScore weights sum to 1.0', () => {
    const facet = analyzeDiamondFacet(richContent, 'test.ts')
    const expected = Math.round(
      facet.hardnessClarity * 0.2 +
      facet.cutPrecision * 0.2 +
      facet.fireDispersion * 0.2 +
      facet.brillianceQuality * 0.2 +
      facet.caratSubstance * 0.2,
    )
    expect(facet.qualityScore).toBe(expected)
  })

  it('overallClarity is average of three key measures', async () => {
    const result = await buildDiamondHorizonResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.horizon.avgHardness + result.horizon.avgPrecision + result.horizon.avgBrilliance) / 3,
    )
    expect(result.horizon.overallClarity).toBe(expected)
  })

  it('isFlawless is based on avgHardness >= 60', async () => {
    const rich = await buildDiamondHorizonResult(['a.ts'], [richContent])
    expect(rich.horizon.isFlawless).toBe(true)
    const minimal = await buildDiamondHorizonResult(['a.ts'], [minimalContent])
    expect(minimal.horizon.isFlawless).toBe(false)
  })
})
