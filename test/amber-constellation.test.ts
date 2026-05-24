import { describe, expect, it } from 'vitest'
import {
  analyzeAmberStar,
  analyzeAmberGalaxy,
  buildAmberConstellationResult,
  classifyStarCondition,
  classifyGalaxyType,
  classifyGalaxyCondition,
  classifyAstronomerGrade,
  generateRecommendations,
  measurePreserving,
  measureOrganizing,
  measureClarifying,
  measureConnecting,
  measureDeepening,
} from '../src/commands/amber-constellation-helpers.js'
import {
  colorGrade,
  colorScore,
  formatStarTable,
  formatStarsTable,
  formatGalaxyTable,
  formatGalaxiesTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/amber-constellation-format-helpers.js'

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

// ─── measurePreserving ─────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns quality score for minimal content', () => {
    const m = measurePreserving(minimalContent)
    expect(m.quality).toBe(6)
    expect(m.grade).toBe('no-preservation')
  })

  it('returns quality score for moderate content', () => {
    const m = measurePreserving(moderateContent)
    expect(m.quality).toBe(52)
    expect(m.grade).toBe('cloudy-amber')
  })

  it('returns quality score for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('perfect-amber')
  })

  it('detects combos in rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasWellDocumented).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClearIntent).toBe(true)
    expect(m.hasPreserved).toBe(true)
    expect(m.hasLasting).toBe(true)
    expect(m.hasArchival).toBe(true)
  })

  it('minimal content has no combos', () => {
    const m = measurePreserving(minimalContent)
    expect(m.hasWellDocumented).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasClearIntent).toBe(false)
  })

  it('detects hasHighQuality', () => {
    expect(measurePreserving(richContent).hasHighQuality).toBe(true)
    expect(measurePreserving(minimalContent).hasHighQuality).toBe(false)
  })

  it('counts cryptic and ambiguous patterns', () => {
    const m = measurePreserving('var x: any = 1')
    expect(m.crypticCount).toBe(1)
    expect(m.ambiguousCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('hasNoDecayed when no eval present', () => {
    expect(measurePreserving('const x = 1').hasNoDecayed).toBe(true)
  })
})

// ─── measureOrganizing ─────────────────────────────────────────────

describe('measureOrganizing', () => {
  it('returns organization score for minimal content', () => {
    const m = measureOrganizing(minimalContent)
    expect(m.organization).toBe(8)
    expect(m.pattern).toBe('no-pattern')
  })

  it('returns organization score for moderate content', () => {
    const m = measureOrganizing(moderateContent)
    expect(m.organization).toBe(52)
    expect(m.pattern).toBe('rough-sketch')
  })

  it('returns organization score for rich content', () => {
    const m = measureOrganizing(richContent)
    expect(m.organization).toBe(100)
    expect(m.pattern).toBe('celestial-map')
  })

  it('detects combos in rich content', () => {
    const m = measureOrganizing(richContent)
    expect(m.hasStructured).toBe(true)
    expect(m.hasWellOrganized).toBe(true)
    expect(m.hasGrouped).toBe(true)
    expect(m.hasOrdered).toBe(true)
    expect(m.hasSystematic).toBe(true)
    expect(m.hasMethodical).toBe(true)
  })

  it('detects hasHighOrganization', () => {
    expect(measureOrganizing(richContent).hasHighOrganization).toBe(true)
    expect(measureOrganizing(minimalContent).hasHighOrganization).toBe(false)
  })

  it('counts chaotic and scattered patterns', () => {
    const m = measureOrganizing('var x: any = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.scatteredCount).toBe(1)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns clarity score for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(6)
    expect(m.brightness).toBe('no-light')
  })

  it('returns clarity score for moderate content', () => {
    const m = measureClarifying(moderateContent)
    expect(m.clarity).toBe(47)
    expect(m.brightness).toBe('dim-star')
  })

  it('returns clarity score for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.brightness).toBe('blazing-star')
  })

  it('detects combos in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasLuminous).toBe(true)
  })

  it('detects hasHighClarity', () => {
    expect(measureClarifying(richContent).hasHighClarity).toBe(true)
    expect(measureClarifying(minimalContent).hasHighClarity).toBe(false)
  })

  it('counts obfuscated and hidden patterns', () => {
    const m = measureClarifying('var x: any = eval("1")')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hiddenCount).toBe(1)
  })
})

// ─── measureConnecting ─────────────────────────────────────────────

describe('measureConnecting', () => {
  it('returns coherence score for minimal content', () => {
    const m = measureConnecting(minimalContent)
    expect(m.coherence).toBe(6)
    expect(m.constellation).toBe('no-connection')
  })

  it('returns coherence score for moderate content', () => {
    const m = measureConnecting(moderateContent)
    expect(m.coherence).toBe(41)
    expect(m.constellation).toBe('loose-grouping')
  })

  it('returns coherence score for rich content', () => {
    const m = measureConnecting(richContent)
    expect(m.coherence).toBe(100)
    expect(m.constellation).toBe('grand-pattern')
  })

  it('detects combos in rich content', () => {
    const m = measureConnecting(richContent)
    expect(m.hasConnected).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasLinked).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasUnified).toBe(true)
  })

  it('detects hasHighCoherence', () => {
    expect(measureConnecting(richContent).hasHighCoherence).toBe(true)
    expect(measureConnecting(minimalContent).hasHighCoherence).toBe(false)
  })

  it('counts tangled and isolated patterns', () => {
    const m = measureConnecting('var x = eval("1")')
    expect(m.tangledCount).toBe(1)
    expect(m.isolatedCount).toBe(1)
  })
})

// ─── measureDeepening ──────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns depth score for minimal content', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBe(6)
    expect(m.cosmos).toBe('no-depth')
  })

  it('returns depth score for moderate content', () => {
    const m = measureDeepening(moderateContent)
    expect(m.depth).toBe(42)
    expect(m.cosmos).toBe('shallow-orbit')
  })

  it('returns depth score for rich content', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBe(100)
    expect(m.cosmos).toBe('deep-space')
  })

  it('detects combos in rich content', () => {
    const m = measureDeepening(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasSolidFoundation).toBe(true)
  })

  it('detects hasHighDepth', () => {
    expect(measureDeepening(richContent).hasHighDepth).toBe(true)
    expect(measureDeepening(minimalContent).hasHighDepth).toBe(false)
  })

  it('counts untested and bare crash patterns', () => {
    const m = measureDeepening('var x: any = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.bareCrashCount).toBe(1)
  })
})

// ─── classifyStarCondition ────────────────────────────────────────

describe('classifyStarCondition', () => {
  it('classifies golden-constellation at 85+', () => {
    expect(classifyStarCondition(90)).toBe('golden-constellation')
  })
  it('classifies amber-sky at 70-84', () => {
    expect(classifyStarCondition(75)).toBe('amber-sky')
  })
  it('classifies starlit-night at 55-69', () => {
    expect(classifyStarCondition(60)).toBe('starlit-night')
  })
  it('classifies cloudy-sky at 40-54', () => {
    expect(classifyStarCondition(45)).toBe('cloudy-sky')
  })
  it('classifies dark-night at 25-39', () => {
    expect(classifyStarCondition(30)).toBe('dark-night')
  })
  it('classifies void below 25', () => {
    expect(classifyStarCondition(20)).toBe('void')
  })
})

// ─── classifyGalaxyType ───────────────────────────────────────────

describe('classifyGalaxyType', () => {
  it('returns no-galaxy for empty stars', () => {
    expect(classifyGalaxyType([])).toBe('no-galaxy')
  })
  it('returns milky-way for high qs with many golden', () => {
    const stars = Array.from({ length: 4 }, () => ({ qualityScore: 90, condition: 'golden-constellation' } as any))
    expect(classifyGalaxyType(stars)).toBe('milky-way')
  })
  it('returns spiral-galaxy for avgQs >= 60', () => {
    expect(classifyGalaxyType([{ qualityScore: 65, condition: 'amber-sky' }] as any[])).toBe('spiral-galaxy')
  })
  it('returns proper-nebula for avgQs >= 45', () => {
    expect(classifyGalaxyType([{ qualityScore: 50, condition: 'starlit-night' }] as any[])).toBe('proper-nebula')
  })
  it('returns star-cluster for avgQs >= 30', () => {
    expect(classifyGalaxyType([{ qualityScore: 35, condition: 'cloudy-sky' }] as any[])).toBe('star-cluster')
  })
  it('returns dark-cloud for avgQs >= 15', () => {
    expect(classifyGalaxyType([{ qualityScore: 20, condition: 'dark-night' }] as any[])).toBe('dark-cloud')
  })
  it('returns no-galaxy for very low avgQs', () => {
    expect(classifyGalaxyType([{ qualityScore: 5, condition: 'void' }] as any[])).toBe('no-galaxy')
  })
})

// ─── classifyGalaxyCondition ──────────────────────────────────────

describe('classifyGalaxyCondition', () => {
  it('classifies golden-universe at 75+', () => { expect(classifyGalaxyCondition(80)).toBe('golden-universe') })
  it('classifies amber-cosmos at 60-74', () => { expect(classifyGalaxyCondition(65)).toBe('amber-cosmos') })
  it('classifies starry-realm at 45-59', () => { expect(classifyGalaxyCondition(50)).toBe('starry-realm') })
  it('classifies dim-space at 30-44', () => { expect(classifyGalaxyCondition(35)).toBe('dim-space') })
  it('classifies dark-void at 15-29', () => { expect(classifyGalaxyCondition(20)).toBe('dark-void') })
  it('classifies void below 15', () => { expect(classifyGalaxyCondition(10)).toBe('void') })
})

// ─── classifyAstronomerGrade ──────────────────────────────────────

describe('classifyAstronomerGrade', () => {
  it('classifies master-astronomer at 80+', () => { expect(classifyAstronomerGrade(85)).toBe('master-astronomer') })
  it('classifies expert-observer at 65-79', () => { expect(classifyAstronomerGrade(70)).toBe('expert-observer') })
  it('classifies skilled-stargazer at 50-64', () => { expect(classifyAstronomerGrade(55)).toBe('skilled-stargazer') })
  it('classifies apprentice at 35-49', () => { expect(classifyAstronomerGrade(40)).toBe('apprentice') })
  it('classifies novice at 20-34', () => { expect(classifyAstronomerGrade(25)).toBe('novice') })
  it('classifies blind below 20', () => { expect(classifyAstronomerGrade(10)).toBe('blind') })
})

// ─── analyzeAmberStar ──────────────────────────────────────────────

describe('analyzeAmberStar', () => {
  it('analyzes minimal content correctly', () => {
    const star = analyzeAmberStar(minimalContent, 'minimal.ts')
    expect(star.file).toBe('minimal.ts')
    expect(star.preservationQuality).toBe(6)
    expect(star.stellarOrganization).toBe(8)
    expect(star.starClarity).toBe(6)
    expect(star.constellationCoherence).toBe(6)
    expect(star.cosmicDepth).toBe(6)
    expect(star.qualityScore).toBe(6)
    expect(star.condition).toBe('void')
  })

  it('analyzes moderate content correctly', () => {
    const star = analyzeAmberStar(moderateContent, 'moderate.ts')
    expect(star.preservationQuality).toBe(52)
    expect(star.stellarOrganization).toBe(52)
    expect(star.starClarity).toBe(47)
    expect(star.constellationCoherence).toBe(41)
    expect(star.cosmicDepth).toBe(42)
    expect(star.qualityScore).toBe(47)
    expect(star.condition).toBe('cloudy-sky')
  })

  it('analyzes rich content correctly', () => {
    const star = analyzeAmberStar(richContent, 'rich.ts')
    expect(star.preservationQuality).toBe(100)
    expect(star.stellarOrganization).toBe(100)
    expect(star.starClarity).toBe(100)
    expect(star.constellationCoherence).toBe(100)
    expect(star.cosmicDepth).toBe(100)
    expect(star.qualityScore).toBe(100)
    expect(star.condition).toBe('golden-constellation')
  })

  it('populates all measure sub-objects', () => {
    const star = analyzeAmberStar(richContent, 'rich.ts')
    expect(star.preserving.grade).toBe('perfect-amber')
    expect(star.organizing.pattern).toBe('celestial-map')
    expect(star.clarifying.brightness).toBe('blazing-star')
    expect(star.connecting.constellation).toBe('grand-pattern')
    expect(star.deepening.cosmos).toBe('deep-space')
  })
})

// ─── analyzeAmberGalaxy ───────────────────────────────────────────

describe('analyzeAmberGalaxy', () => {
  it('returns empty galaxy for no stars', () => {
    const galaxy = analyzeAmberGalaxy([], 'empty-dir')
    expect(galaxy.directory).toBe('empty-dir')
    expect(galaxy.galaxyType).toBe('no-galaxy')
    expect(galaxy.condition).toBe('void')
  })

  it('analyzes single rich star galaxy', () => {
    const star = analyzeAmberStar(richContent, 'src/rich.ts')
    const galaxy = analyzeAmberGalaxy([star], 'src')
    expect(galaxy.avgPreservation).toBe(100)
    expect(galaxy.goldenConstellationCount).toBe(1)
    expect(galaxy.voidCount).toBe(0)
    expect(galaxy.galaxyType).toBe('milky-way')
    expect(galaxy.condition).toBe('golden-universe')
  })

  it('counts void files correctly', () => {
    const star = analyzeAmberStar(minimalContent, 'bad.ts')
    const galaxy = analyzeAmberGalaxy([star], 'bad-dir')
    expect(galaxy.voidCount).toBe(1)
  })

  it('computes averages across multiple stars', () => {
    const s1 = analyzeAmberStar(richContent, 'a.ts')
    const s2 = analyzeAmberStar(minimalContent, 'b.ts')
    const galaxy = analyzeAmberGalaxy([s1, s2], 'mixed')
    expect(galaxy.avgPreservation).toBe(Math.round((100 + 6) / 2))
    expect(galaxy.stars.length).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are high', () => {
    const star = analyzeAmberStar(richContent, 'perfect.ts')
    const galaxy = analyzeAmberGalaxy([star], 'src')
    const cosmos = { avgPreservation: 100, avgOrganization: 100, avgClarity: 100, isGolden: true, overallLuminosity: 100 }
    const stats = {
      avgPreservationQuality: 100, avgStellarOrganization: 100, avgStarClarity: 100,
      avgConstellationCoherence: 100, avgCosmicDepth: 100,
      voidCount: 0, totalFiles: 1, totalGalaxies: 1,
      goldenConstellationCount: 1, amberSkyCount: 0, starlitNightCount: 0,
      cloudySkyCount: 0, darkNightCount: 0,
      hasHighQualityCount: 1, hasHighOrganizationCount: 1, hasHighClarityCount: 1,
      hasHighCoherenceCount: 1, hasHighDepthCount: 1,
      overallLuminosity: 100, astronomerGrade: 'master-astronomer' as const,
      bestStar: 'perfect.ts', mostPreserved: 'perfect.ts', mostOrganized: 'perfect.ts',
      clearest: 'perfect.ts', deepest: 'perfect.ts',
    }
    const recs = generateRecommendations([star], [galaxy], cosmos, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('golden perfection')
  })

  it('recommends improvements for low scores', () => {
    const star = analyzeAmberStar(minimalContent, 'a.ts')
    const galaxy = analyzeAmberGalaxy([star], 'src')
    const cosmos = { avgPreservation: 6, avgOrganization: 8, avgClarity: 6, isGolden: false, overallLuminosity: 7 }
    const stats = {
      avgPreservationQuality: 6, avgStellarOrganization: 8, avgStarClarity: 6,
      avgConstellationCoherence: 6, avgCosmicDepth: 6,
      voidCount: 1, totalFiles: 1, totalGalaxies: 1,
      goldenConstellationCount: 0, amberSkyCount: 0, starlitNightCount: 0,
      cloudySkyCount: 0, darkNightCount: 0,
      hasHighQualityCount: 0, hasHighOrganizationCount: 0, hasHighClarityCount: 0,
      hasHighCoherenceCount: 0, hasHighDepthCount: 0,
      overallLuminosity: 7, astronomerGrade: 'blind' as const,
      bestStar: 'a.ts', mostPreserved: 'a.ts', mostOrganized: 'a.ts',
      clearest: 'a.ts', deepest: 'a.ts',
    }
    const recs = generateRecommendations([star], [galaxy], cosmos, stats)
    expect(recs.some(r => r.includes('preservation quality'))).toBe(true)
    expect(recs.some(r => r.includes('void'))).toBe(true)
  })
})

// ─── buildAmberConstellationResult ─────────────────────────────────

describe('buildAmberConstellationResult', () => {
  it('handles empty file list', async () => {
    const result = await buildAmberConstellationResult([], [])
    expect(result.stars).toEqual([])
    expect(result.cosmos.overallLuminosity).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file correctly', async () => {
    const result = await buildAmberConstellationResult(['rich.ts'], [richContent])
    expect(result.stars).toHaveLength(1)
    expect(result.stars[0].qualityScore).toBe(100)
    expect(result.cosmos.avgPreservation).toBe(100)
    expect(result.cosmos.overallLuminosity).toBe(100)
    expect(result.cosmos.isGolden).toBe(true)
    expect(result.stats.astronomerGrade).toBe('master-astronomer')
    expect(result.stats.goldenConstellationCount).toBe(1)
  })

  it('computes stats correctly for mixed files', async () => {
    const result = await buildAmberConstellationResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.voidCount).toBe(1)
    expect(result.stats.goldenConstellationCount).toBe(1)
    expect(result.stats.bestStar).toBe('rich.ts')
  })

  it('computes recommendations', async () => {
    const result = await buildAmberConstellationResult(['minimal.ts'], [minimalContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high and low scores', () => {
    expect(colorScore(90)).toBeTruthy()
    expect(colorScore(10)).toBeTruthy()
  })
})

describe('colorGrade', () => {
  it('colors best and worst grades', () => {
    expect(colorGrade('golden-constellation')).toBeTruthy()
    expect(colorGrade('void')).toBeTruthy()
    expect(colorGrade('unknown')).toBeTruthy()
  })
})

describe('formatStarTable', () => {
  it('formats a single star', () => {
    const star = analyzeAmberStar(richContent, 'test.ts')
    const result = formatStarTable(star)
    expect(result).toContain('test.ts')
    expect(result).toContain('Preservation Quality')
  })
})

describe('formatStarsTable', () => {
  it('returns message for empty stars', () => {
    expect(formatStarsTable([])).toContain('No amber stars found')
  })
})

describe('formatGalaxyTable', () => {
  it('formats a single galaxy', () => {
    const star = analyzeAmberStar(richContent, 'test.ts')
    const galaxy = analyzeAmberGalaxy([star], 'src')
    const result = formatGalaxyTable(galaxy)
    expect(result).toContain('src')
    expect(result).toContain('Golden Constellations')
  })
})

describe('formatGalaxiesTable', () => {
  it('returns message for empty galaxies', () => {
    expect(formatGalaxiesTable([])).toContain('No amber galaxies found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberConstellationResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Amber Constellation Statistics')
    expect(formatted).toContain('Astronomer Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Test rec 1'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAmberConstellationResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Amber Star Analysis')
    expect(formatted).toContain('Amber Galaxies')
    expect(formatted).toContain('Cosmos')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as valid JSON', async () => {
    const result = await buildAmberConstellationResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stars).toHaveLength(1)
    expect(parsed.stats.astronomerGrade).toBe('master-astronomer')
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles bad content patterns', () => {
    const badContent = 'var x: any = eval("1"); debugger;'
    const star = analyzeAmberStar(badContent, 'bad.ts')
    expect(star.preserving.crypticCount).toBeGreaterThan(0)
    expect(star.preserving.ambiguousCount).toBeGreaterThan(0)
    expect(star.deepening.untestedCount).toBeGreaterThan(0)
    expect(star.deepening.bareCrashCount).toBeGreaterThan(0)
  })

  it('all scores capped at 100', () => {
    const star = analyzeAmberStar(richContent, 'rich.ts')
    expect(star.preservationQuality).toBeLessThanOrEqual(100)
    expect(star.stellarOrganization).toBeLessThanOrEqual(100)
    expect(star.starClarity).toBeLessThanOrEqual(100)
    expect(star.constellationCoherence).toBeLessThanOrEqual(100)
    expect(star.cosmicDepth).toBeLessThanOrEqual(100)
  })

  it('qualityScore weights sum to 1.0', () => {
    const star = analyzeAmberStar(moderateContent, 'test.ts')
    const expected = Math.round(
      star.preservationQuality * 0.2 +
      star.stellarOrganization * 0.2 +
      star.starClarity * 0.2 +
      star.constellationCoherence * 0.2 +
      star.cosmicDepth * 0.2,
    )
    expect(star.qualityScore).toBe(expected)
  })

  it('overallLuminosity is average of three key measures', async () => {
    const result = await buildAmberConstellationResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.cosmos.avgPreservation + result.cosmos.avgOrganization + result.cosmos.avgClarity) / 3,
    )
    expect(result.cosmos.overallLuminosity).toBe(expected)
  })

  it('isGolden is based on avgPreservation >= 60', async () => {
    const rich = await buildAmberConstellationResult(['a.ts'], [richContent])
    expect(rich.cosmos.isGolden).toBe(true)
    const minimal = await buildAmberConstellationResult(['a.ts'], [minimalContent])
    expect(minimal.cosmos.isGolden).toBe(false)
  })
})
