import { describe, it, expect } from 'vitest'
import {
  measureArranging,
  measureClarifying,
  measureHarmonizing,
  measureEnergizing,
  measureKnowing,
  classifyStarCondition,
  classifyArmType,
  classifyArmCondition,
  classifyAstronomerGrade,
  analyzeEmeraldStar,
  analyzeConstellationArm,
  buildEmeraldConstellationResult,
  generateRecommendations,
} from '../src/commands/emerald-constellation-helpers.js'
import {
  colorScore,
  colorGrade,
  formatStarTable,
  formatStarsTable,
  formatArmTable,
  formatArmsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-constellation-format-helpers.js'
import type { EmeraldStar, EmeraldConstellationStats, EmeraldGalaxy, ConstellationArm } from '../src/commands/emerald-constellation-helpers.js'

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

export function processUsers<T>(items: T[], fn: (item: T) => boolean): T[] {
  return items.filter(fn).map(item => item)
}

const config: Config = {
  name: 'test',
  version: 1,
}

export default config
`

// ─── measureArranging ──────────────────────────────────────────────

describe('measureArranging', () => {
  it('returns 0 for empty content', () => {
    const m = measureArranging(emptyContent)
    expect(m.organization).toBe(0)
    expect(m.grade).toBe('no-organization')
    expect(m.hasHighOrganization).toBe(false)
  })

  it('measures minimal content', () => {
    const m = measureArranging(minimalContent)
    expect(m.organization).toBe(0)
    expect(m.grade).toBe('no-organization')
  })

  it('detects well structured code', () => {
    const m = measureArranging(richContent)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasLogicalGrouping).toBe(true)
    expect(m.hasHierarchical).toBe(true)
  })

  it('counts scattered patterns', () => {
    const m = measureArranging('var x = 1; var y = 2')
    expect(m.scatteredCount).toBe(2)
    expect(m.hasNoScattered).toBe(false)
  })

  it('counts flat patterns', () => {
    const m = measureArranging('const x: any = 1')
    expect(m.flatCount).toBe(1)
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects no chaotic code', () => {
    const m = measureArranging(richContent)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoIsolated).toBe(true)
  })

  it('detects chaotic code', () => {
    const m = measureArranging('eval("x")')
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects isolated code', () => {
    const m = measureArranging('debugger')
    expect(m.hasNoIsolated).toBe(false)
  })

  it('detects high organization', () => {
    const m = measureArranging(richContent)
    expect(m.hasHighOrganization).toBe(true)
  })

  it('detects organized patterns', () => {
    const m = measureArranging(richContent)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasClustered).toBe(true)
    expect(m.hasSystematic).toBe(true)
  })

  it('returns grade galactic-core for high scores', () => {
    const m = measureArranging(richContent)
    expect(['galactic-core', 'star-system']).toContain(m.grade)
  })

  it('returns no-organization for very low scores', () => {
    const m = measureArranging('x')
    expect(m.grade).toBe('no-organization')
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.gem).toBe('no-gem')
    expect(m.hasHighClarity).toBe(false)
  })

  it('measures minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBeGreaterThan(0)
  })

  it('detects transparent code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasTransparent).toBe(true)
  })

  it('detects readable code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('counts obfuscated patterns', () => {
    const m = measureClarifying('var x = 1; var y = 2')
    expect(m.obfuscatedCount).toBe(2)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts cryptic patterns', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects hidden code', () => {
    const m = measureClarifying('eval("x")')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects dense code', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoDense).toBe(false)
  })

  it('returns correct gem for rich content', () => {
    const m = measureClarifying(richContent)
    expect(['flawless-emerald', 'clear-gem']).toContain(m.gem)
  })

  it('detects clear and understandable code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasClear).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureHarmonizing(emptyContent)
    expect(m.harmony).toBe(0)
    expect(m.orbit).toBe('chaotic-orbit')
    expect(m.hasHighHarmony).toBe(false)
  })

  it('detects balanced deps', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasBalancedDeps).toBe(true)
  })

  it('detects loose coupling', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasLooseCoupling).toBe(true)
  })

  it('detects clean imports', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasCleanImports).toBe(true)
  })

  it('counts circular patterns', () => {
    const m = measureHarmonizing('var x = 1')
    expect(m.circularCount).toBe(1)
  })

  it('counts tight coupling patterns', () => {
    const m = measureHarmonizing('const x: any = 1')
    expect(m.tightCouplingCount).toBe(1)
  })

  it('detects stable dependencies', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasStable).toBe(true)
  })

  it('detects no volatile patterns', () => {
    const m = measureHarmonizing('debugger')
    expect(m.hasNoVolatile).toBe(false)
  })

  it('returns correct orbit grade', () => {
    const m = measureHarmonizing(richContent)
    expect(['perfect-harmony', 'stable-orbit']).toContain(m.orbit)
  })

  it('detects minimal deps', () => {
    const m = measureHarmonizing(richContent)
    expect(m.hasMinimalDeps).toBe(true)
  })
})

// ─── measureEnergizing ─────────────────────────────────────────────

describe('measureEnergizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnergizing(emptyContent)
    expect(m.energy).toBe(0)
    expect(m.green).toBe('no-energy')
    expect(m.hasHighEnergy).toBe(false)
  })

  it('detects optimized code', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasOptimized).toBe(true)
  })

  it('detects efficient code', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasEfficient).toBe(true)
  })

  it('detects lean code', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasLean).toBe(true)
  })

  it('counts wasteful patterns', () => {
    const m = measureEnergizing('var x = 1; var y = 2')
    expect(m.wastefulCount).toBe(2)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('counts bloated patterns', () => {
    const m = measureEnergizing('const x: any = 1')
    expect(m.bloatedCount).toBe(1)
    expect(m.hasNoRedundant).toBe(false)
  })

  it('detects sustainable patterns with nullish coalescing', () => {
    const m = measureEnergizing('const x = a ?? b; function f(p = 1) {}')
    expect(m.hasSustainable).toBe(true)
  })

  it('detects green patterns with readonly and enum', () => {
    const m = measureEnergizing('readonly x; enum E { A }')
    expect(m.hasGreen).toBe(true)
  })

  it('returns correct green grade', () => {
    const m = measureEnergizing(richContent)
    expect(['fusion-reactor', 'efficient-solar']).toContain(m.green)
  })

  it('detects cached patterns', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasCached).toBe(true)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureKnowing(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.constellation).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('detects documented code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDocumented).toBe(true)
  })

  it('detects well-named code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasWellNamed).toBe(true)
  })

  it('detects pattern-based code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasPatternBased).toBe(true)
  })

  it('detects domain-aware code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDomainAware).toBe(true)
  })

  it('counts cryptic patterns', () => {
    const m = measureKnowing('var x = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('counts adhoc patterns', () => {
    const m = measureKnowing('const x: any = 1')
    expect(m.adhocCount).toBe(1)
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects informed code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasInformed).toBe(true)
  })

  it('detects knowledgeable code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasKnowledgeable).toBe(true)
  })

  it('returns correct constellation grade', () => {
    const m = measureKnowing(richContent)
    expect(['ancient-constellation', 'wise-stars']).toContain(m.constellation)
  })
})

// ─── classifyStarCondition ─────────────────────────────────────────

describe('classifyStarCondition', () => {
  it('classifies emerald-masterpiece', () => {
    expect(classifyStarCondition(90)).toBe('emerald-masterpiece')
  })

  it('classifies green-constellation', () => {
    expect(classifyStarCondition(75)).toBe('green-constellation')
  })

  it('classifies proper-star', () => {
    expect(classifyStarCondition(60)).toBe('proper-star')
  })

  it('classifies dim-gem', () => {
    expect(classifyStarCondition(45)).toBe('dim-gem')
  })

  it('classifies faded-star', () => {
    expect(classifyStarCondition(30)).toBe('faded-star')
  })

  it('classifies dark-matter', () => {
    expect(classifyStarCondition(10)).toBe('dark-matter')
  })
})

// ─── classifyArmType ───────────────────────────────────────────────

describe('classifyArmType', () => {
  it('returns no-arm for empty stars', () => {
    expect(classifyArmType([])).toBe('no-arm')
  })

  it('returns spiral-arm for high-quality stars', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 90, condition: 'emerald-masterpiece', file: 'a.ts' } as EmeraldStar,
      { qualityScore: 88, condition: 'emerald-masterpiece', file: 'b.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('spiral-arm')
  })

  it('returns star-cluster for moderate quality', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 65, condition: 'green-constellation', file: 'a.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('star-cluster')
  })

  it('returns proper-group for mid quality', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 50, condition: 'proper-star', file: 'a.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('proper-group')
  })

  it('returns scattered-stars for lower quality', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 35, condition: 'dim-gem', file: 'a.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('scattered-stars')
  })

  it('returns rogue-objects for very low quality', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 18, condition: 'faded-star', file: 'a.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('rogue-objects')
  })

  it('returns no-arm for near-zero quality', () => {
    const stars: EmeraldStar[] = [
      { qualityScore: 5, condition: 'dark-matter', file: 'a.ts' } as EmeraldStar,
    ]
    expect(classifyArmType(stars)).toBe('no-arm')
  })
})

// ─── classifyArmCondition ──────────────────────────────────────────

describe('classifyArmCondition', () => {
  it('classifies brilliant-constellation', () => {
    expect(classifyArmCondition(80)).toBe('brilliant-constellation')
  })

  it('classifies starlit-galaxy', () => {
    expect(classifyArmCondition(65)).toBe('starlit-galaxy')
  })

  it('classifies decent-cluster', () => {
    expect(classifyArmCondition(50)).toBe('decent-cluster')
  })

  it('classifies dim-nebula', () => {
    expect(classifyArmCondition(35)).toBe('dim-nebula')
  })

  it('classifies dark-void', () => {
    expect(classifyArmCondition(20)).toBe('dark-void')
  })

  it('classifies void', () => {
    expect(classifyArmCondition(5)).toBe('void')
  })
})

// ─── classifyAstronomerGrade ───────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('classifies master-astronomer', () => {
    expect(classifyAstronomerGrade(85)).toBe('master-astronomer')
  })

  it('classifies star-captain', () => {
    expect(classifyAstronomerGrade(70)).toBe('star-captain')
  })

  it('classifies skilled-navigator', () => {
    expect(classifyAstronomerGrade(55)).toBe('skilled-navigator')
  })

  it('classifies apprentice', () => {
    expect(classifyAstronomerGrade(40)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyAstronomerGrade(25)).toBe('novice')
  })

  it('classifies lost-soul', () => {
    expect(classifyAstronomerGrade(10)).toBe('lost-soul')
  })
})

// ─── analyzeEmeraldStar ────────────────────────────────────────────

describe('analyzeEmeraldStar', () => {
  it('analyzes empty content', () => {
    const star = analyzeEmeraldStar(emptyContent, 'empty.ts')
    expect(star.file).toBe('empty.ts')
    expect(star.qualityScore).toBe(0)
    expect(star.condition).toBe('dark-matter')
    expect(star.stellarOrganization).toBe(0)
    expect(star.gemClarity).toBe(0)
    expect(star.orbitHarmony).toBe(0)
    expect(star.greenEnergy).toBe(0)
    expect(star.constellationWisdom).toBe(0)
  })

  it('analyzes rich content', () => {
    const star = analyzeEmeraldStar(richContent, 'rich.ts')
    expect(star.file).toBe('rich.ts')
    expect(star.qualityScore).toBeGreaterThan(50)
    expect(star.stellarOrganization).toBeGreaterThan(50)
    expect(star.gemClarity).toBeGreaterThan(50)
    expect(star.arranging).toBeDefined()
    expect(star.clarifying).toBeDefined()
    expect(star.harmonizing).toBeDefined()
    expect(star.energizing).toBeDefined()
    expect(star.knowing).toBeDefined()
  })

  it('analyzes moderate content', () => {
    const star = analyzeEmeraldStar(moderateContent, 'mod.ts')
    expect(star.file).toBe('mod.ts')
    expect(star.qualityScore).toBeGreaterThan(0)
    expect(typeof star.condition).toBe('string')
  })

  it('computes quality score as weighted average', () => {
    const star = analyzeEmeraldStar(richContent, 'rich.ts')
    const expected = Math.round(
      star.stellarOrganization * 0.2 +
      star.gemClarity * 0.2 +
      star.orbitHarmony * 0.2 +
      star.greenEnergy * 0.2 +
      star.constellationWisdom * 0.2,
    )
    expect(star.qualityScore).toBe(expected)
  })
})

// ─── analyzeConstellationArm ───────────────────────────────────────

describe('analyzeConstellationArm', () => {
  it('handles empty stars', () => {
    const arm = analyzeConstellationArm([], 'empty-dir')
    expect(arm.directory).toBe('empty-dir')
    expect(arm.stars).toEqual([])
    expect(arm.avgOrganization).toBe(0)
    expect(arm.avgHarmony).toBe(0)
    expect(arm.avgWisdom).toBe(0)
    expect(arm.armType).toBe('no-arm')
    expect(arm.condition).toBe('void')
  })

  it('analyzes stars in a directory', () => {
    const star1 = analyzeEmeraldStar(richContent, 'dir/a.ts')
    const star2 = analyzeEmeraldStar(moderateContent, 'dir/b.ts')
    const arm = analyzeConstellationArm([star1, star2], 'dir')
    expect(arm.directory).toBe('dir')
    expect(arm.stars).toHaveLength(2)
    expect(arm.avgOrganization).toBeGreaterThan(0)
    expect(arm.avgHarmony).toBeGreaterThan(0)
    expect(arm.avgWisdom).toBeGreaterThan(0)
    expect(typeof arm.armType).toBe('string')
    expect(typeof arm.condition).toBe('string')
  })

  it('counts emerald masterpieces', () => {
    const stars: EmeraldStar[] = [
      { condition: 'emerald-masterpiece', file: 'a.ts' } as EmeraldStar,
      { condition: 'emerald-masterpiece', file: 'b.ts' } as EmeraldStar,
      { condition: 'dark-matter', file: 'c.ts' } as EmeraldStar,
    ]
    const arm = analyzeConstellationArm(stars, 'dir')
    expect(arm.emeraldMasterpieceCount).toBe(2)
    expect(arm.darkMatterCount).toBe(1)
  })
})

// ─── buildEmeraldConstellationResult ───────────────────────────────

describe('buildEmeraldConstellationResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldConstellationResult([], [])
    expect(result.stars).toEqual([])
    expect(result.arms).toEqual([])
    expect(result.galaxy.avgOrganization).toBe(0)
    expect(result.galaxy.isBrilliant).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalArms).toBe(0)
    expect(result.stats.bestStar).toBe('')
  })

  it('analyzes multiple files', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.stars).toHaveLength(2)
    expect(result.arms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgStellarOrganization).toBeGreaterThan(0)
    expect(result.stats.avgGemClarity).toBeGreaterThan(0)
    expect(result.stats.avgOrbitHarmony).toBeGreaterThan(0)
    expect(result.stats.avgGreenEnergy).toBeGreaterThan(0)
    expect(result.stats.avgConstellationWisdom).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files by directory', async () => {
    const result = await buildEmeraldConstellationResult(
      ['dir1/a.ts', 'dir2/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.arms).toHaveLength(2)
    expect(result.stats.totalArms).toBe(2)
  })

  it('computes galaxy splendor', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.galaxy.overallSplendor).toBeGreaterThan(0)
    expect(result.galaxy.isBrilliant).toBe(true)
  })

  it('tracks best star and extremes', async () => {
    const result = await buildEmeraldConstellationResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestStar).toBe('rich.ts')
    expect(result.stats.mostOrganized).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostHarmonious).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('counts condition types', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.stats.emeraldMasterpieceCount + result.stats.greenConstellationCount + result.stats.properStarCount + result.stats.dimGemCount + result.stats.fadedStarCount + result.stats.darkMatterCount).toBe(3)
  })

  it('counts high measure files', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighOrganizationCount).toBeGreaterThan(0)
  })

  it('assigns astronomer grade', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts'],
      [richContent],
    )
    expect(typeof result.stats.astronomerGrade).toBe('string')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for high quality', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 80, isBrilliant: true } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('brilliant splendor')
  })

  it('recommends organization improvement', () => {
    const stats = {
      avgStellarOrganization: 40, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 60 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('stellar organization'))).toBe(true)
  })

  it('recommends clarity improvement', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 40, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 60 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('gem clarity'))).toBe(true)
  })

  it('recommends harmony improvement', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 40,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 60 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('Harmonize'))).toBe(true)
  })

  it('recommends energy improvement', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 40, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 60 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('green energy'))).toBe(true)
  })

  it('recommends wisdom improvement', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 40, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 60 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('constellation wisdom'))).toBe(true)
  })

  it('warns about dark matter files', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 3,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 80 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('dark matter'))).toBe(true)
  })

  it('warns about dim galaxy splendor', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 30 } as EmeraldGalaxy
    const recs = generateRecommendations([], [], galaxy, stats)
    expect(recs.some(r => r.includes('dim'))).toBe(true)
  })

  it('warns about all dark arms', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 80 } as EmeraldGalaxy
    const arms = [
      { armType: 'no-arm' } as ConstellationArm,
      { armType: 'rogue-objects' } as ConstellationArm,
    ]
    const recs = generateRecommendations([], arms, galaxy, stats)
    expect(recs.some(r => r.includes('dark'))).toBe(true)
  })

  it('lists specific dark star files', () => {
    const stats = {
      avgStellarOrganization: 80, avgGemClarity: 80, avgOrbitHarmony: 80,
      avgGreenEnergy: 80, avgConstellationWisdom: 80, darkMatterCount: 0,
    } as EmeraldConstellationStats
    const galaxy = { overallSplendor: 80 } as EmeraldGalaxy
    const stars = [
      { condition: 'dark-matter', file: 'bad1.ts' } as EmeraldStar,
      { condition: 'dark-matter', file: 'bad2.ts' } as EmeraldStar,
    ]
    const recs = generateRecommendations(stars, [], galaxy, stats)
    expect(recs.some(r => r.includes('bad1.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores', () => {
    expect(typeof colorScore(90)).toBe('string')
  })
  it('colors mid scores', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
  it('colors low scores', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('colors emerald-masterpiece', () => {
    expect(typeof colorGrade('emerald-masterpiece')).toBe('string')
  })
  it('colors dark-matter', () => {
    expect(typeof colorGrade('dark-matter')).toBe('string')
  })
  it('colors unknown grade', () => {
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatStarTable', () => {
  it('formats a star', () => {
    const star = analyzeEmeraldStar(richContent, 'test.ts')
    const output = formatStarTable(star)
    expect(output).toContain('test.ts')
    expect(output).toContain('Stellar Organization')
    expect(output).toContain('Gem Clarity')
    expect(output).toContain('Score')
  })
})

describe('formatStarsTable', () => {
  it('handles empty stars', () => {
    expect(formatStarsTable([])).toContain('No emerald stars')
  })

  it('formats multiple stars', () => {
    const stars = [
      analyzeEmeraldStar(richContent, 'a.ts'),
      analyzeEmeraldStar(moderateContent, 'b.ts'),
    ]
    const output = formatStarsTable(stars)
    expect(output).toContain('Emerald Constellation Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatArmTable', () => {
  it('formats an arm', () => {
    const star = analyzeEmeraldStar(richContent, 'dir/a.ts')
    const arm = analyzeConstellationArm([star], 'dir')
    const output = formatArmTable(arm)
    expect(output).toContain('dir')
    expect(output).toContain('Type')
    expect(output).toContain('Stars')
  })
})

describe('formatArmsTable', () => {
  it('handles empty arms', () => {
    expect(formatArmsTable([])).toContain('No constellation arms')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts'], [richContent],
    )
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Constellation Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Splendor')
    expect(output).toContain('Astronomer Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const recs = ['Do X', 'Do Y']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('Do X')
    expect(output).toContain('Do Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts'], [richContent],
    )
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Constellation Analysis')
    expect(output).toContain('Galaxy')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildEmeraldConstellationResult(
      ['a.ts'], [richContent],
    )
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stars).toHaveLength(1)
    expect(parsed.galaxy).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
