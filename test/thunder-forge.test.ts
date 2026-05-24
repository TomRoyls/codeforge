import { describe, it, expect } from 'vitest'
import {
  measurePowering,
  measureEnduring,
  measureCreating,
  measureTuning,
  measureCrafting,
  classifyIngotCondition,
  classifyComplexType,
  classifyComplexCondition,
  classifySmithGrade,
  analyzeThunderIngot,
  analyzeForgeComplex,
  buildThunderForgeResult,
  generateRecommendations,
} from '../src/commands/thunder-forge-helpers.js'
import {
  colorScore,
  colorGrade,
  formatIngotTable,
  formatIngotsTable,
  formatComplexTable,
  formatComplexesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/thunder-forge-format-helpers.js'
import type { ThunderIngot, ThunderForgeStats, ThunderArmory, ForgeComplex } from '../src/commands/thunder-forge-helpers.js'

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

export const DEFAULT_CONFIG: UserConfig = {
  name: 'default',
  age: 0,
}

export function createConfig(name: string, age: number): UserConfig {
  return { name, age }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
`

// ─── measurePowering ───────────────────────────────────────────────

describe('measurePowering', () => {
  it('returns 0 power for empty content', () => {
    expect(measurePowering(emptyContent).power).toBe(0)
  })

  it('returns low power for minimal content', () => {
    expect(measurePowering(minimalContent).power).toBeLessThan(20)
  })

  it('returns moderate power for moderate content', () => {
    const m = measurePowering(moderateContent)
    expect(m.power).toBeGreaterThanOrEqual(30)
    expect(m.power).toBeLessThan(70)
  })

  it('returns high power for rich content', () => {
    expect(measurePowering(richContent).power).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measurePowering(emptyContent).grade).toBe('no-power')
  })

  it('has correct grade for rich content', () => {
    expect(measurePowering(richContent).grade).toBe('thunderbolt-strike')
  })

  it('has correct grade for moderate content', () => {
    expect(measurePowering(moderateContent).grade).toBe('static-electricity')
  })

  it('detects performant in rich content', () => {
    expect(measurePowering(richContent).hasPerformant).toBe(true)
  })

  it('detects optimized in rich content', () => {
    expect(measurePowering(richContent).hasOptimized).toBe(true)
  })

  it('has no sluggish in clean content', () => {
    const m = measurePowering(richContent)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.sluggishCount).toBe(0)
  })

  it('detects high power flag', () => {
    expect(measurePowering(richContent).hasHighPower).toBe(true)
  })

  it('caps power at 100', () => {
    expect(measurePowering(richContent).power).toBeLessThanOrEqual(100)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 strength for empty content', () => {
    expect(measureEnduring(emptyContent).strength).toBe(0)
  })

  it('returns high strength for rich content', () => {
    expect(measureEnduring(richContent).strength).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureEnduring(emptyContent).anvil).toBe('no-anvil')
  })

  it('has correct grade for rich content', () => {
    expect(measureEnduring(richContent).anvil).toBe('mythril-anvil')
  })

  it('detects robust in rich content', () => {
    expect(measureEnduring(richContent).hasRobust).toBe(true)
  })

  it('detects error handled in rich content', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('has no untested in clean content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasNoUntested).toBe(true)
    expect(m.untestedCount).toBe(0)
  })

  it('detects high strength flag', () => {
    expect(measureEnduring(richContent).hasHighStrength).toBe(true)
  })

  it('caps strength at 100', () => {
    expect(measureEnduring(richContent).strength).toBeLessThanOrEqual(100)
  })
})

// ─── measureCreating ───────────────────────────────────────────────

describe('measureCreating', () => {
  it('returns 0 quality for empty content', () => {
    expect(measureCreating(emptyContent).quality).toBe(0)
  })

  it('returns high quality for rich content', () => {
    expect(measureCreating(richContent).quality).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureCreating(emptyContent).spark).toBe('no-spark')
  })

  it('has correct grade for rich content', () => {
    expect(measureCreating(richContent).spark).toBe('divine-inspiration')
  })

  it('detects innovative in rich content', () => {
    expect(measureCreating(richContent).hasInnovative).toBe(true)
  })

  it('detects clever in rich content', () => {
    expect(measureCreating(richContent).hasClever).toBe(true)
  })

  it('has no copy paste in clean content', () => {
    const m = measureCreating(richContent)
    expect(m.hasNoCopyPaste).toBe(true)
    expect(m.copyPasteCount).toBe(0)
  })

  it('detects high quality flag', () => {
    expect(measureCreating(richContent).hasHighQuality).toBe(true)
  })

  it('caps quality at 100', () => {
    expect(measureCreating(richContent).quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureTuning ─────────────────────────────────────────────────

describe('measureTuning', () => {
  it('returns 0 precision for empty content', () => {
    expect(measureTuning(emptyContent).precision).toBe(0)
  })

  it('returns high precision for rich content', () => {
    expect(measureTuning(richContent).precision).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureTuning(emptyContent).temper).toBe('no-temper')
  })

  it('has correct grade for rich content', () => {
    expect(measureTuning(richContent).temper).toBe('master-temper')
  })

  it('detects exact in rich content', () => {
    expect(measureTuning(richContent).hasExact).toBe(true)
  })

  it('has no approximate in clean content', () => {
    const m = measureTuning(richContent)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.approximateCount).toBe(0)
  })

  it('detects high precision flag', () => {
    expect(measureTuning(richContent).hasHighPrecision).toBe(true)
  })

  it('caps precision at 100', () => {
    expect(measureTuning(richContent).precision).toBeLessThanOrEqual(100)
  })
})

// ─── measureCrafting ───────────────────────────────────────────────

describe('measureCrafting', () => {
  it('returns 0 craft for empty content', () => {
    expect(measureCrafting(emptyContent).craft).toBe(0)
  })

  it('returns high craft for rich content', () => {
    expect(measureCrafting(richContent).craft).toBeGreaterThanOrEqual(80)
  })

  it('has correct grade for empty content', () => {
    expect(measureCrafting(emptyContent).storm).toBe('no-craft')
  })

  it('has correct grade for rich content', () => {
    expect(measureCrafting(richContent).storm).toBe('storm-master')
  })

  it('detects error handling in rich content', () => {
    expect(measureCrafting(richContent).hasErrorHandling).toBe(true)
  })

  it('detects retry logic in rich content', () => {
    expect(measureCrafting(richContent).hasRetryLogic).toBe(true)
  })

  it('has no uncovered in clean content', () => {
    const m = measureCrafting(richContent)
    expect(m.hasNoUncovered).toBe(true)
    expect(m.uncoveredCount).toBe(0)
  })

  it('detects high craft flag', () => {
    expect(measureCrafting(richContent).hasHighCraft).toBe(true)
  })

  it('caps craft at 100', () => {
    expect(measureCrafting(richContent).craft).toBeLessThanOrEqual(100)
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyIngotCondition', () => {
  it('classifies 90 as legendary-weapon', () => { expect(classifyIngotCondition(90)).toBe('legendary-weapon') })
  it('classifies 75 as thunder-forged', () => { expect(classifyIngotCondition(75)).toBe('thunder-forged') })
  it('classifies 60 as proper-blade', () => { expect(classifyIngotCondition(60)).toBe('proper-blade') })
  it('classifies 45 as rough-metal', () => { expect(classifyIngotCondition(45)).toBe('rough-metal') })
  it('classifies 30 as slag', () => { expect(classifyIngotCondition(30)).toBe('slag') })
  it('classifies 10 as dust', () => { expect(classifyIngotCondition(10)).toBe('dust') })
})

describe('classifyComplexCondition', () => {
  it('classifies 80 as legendary-armory', () => { expect(classifyComplexCondition(80)).toBe('legendary-armory') })
  it('classifies 65 as thunder-workshop', () => { expect(classifyComplexCondition(65)).toBe('thunder-workshop') })
  it('classifies 50 as decent-forge', () => { expect(classifyComplexCondition(50)).toBe('decent-forge') })
  it('classifies 35 as dim-hearth', () => { expect(classifyComplexCondition(35)).toBe('dim-hearth') })
  it('classifies 20 as cold-ashes', () => { expect(classifyComplexCondition(20)).toBe('cold-ashes') })
  it('classifies 5 as void', () => { expect(classifyComplexCondition(5)).toBe('void') })
})

describe('classifySmithGrade', () => {
  it('classifies 85 as thunder-smith', () => { expect(classifySmithGrade(85)).toBe('thunder-smith') })
  it('classifies 70 as master-forge', () => { expect(classifySmithGrade(70)).toBe('master-forge') })
  it('classifies 55 as skilled-blacksmith', () => { expect(classifySmithGrade(55)).toBe('skilled-blacksmith') })
  it('classifies 40 as apprentice', () => { expect(classifySmithGrade(40)).toBe('apprentice') })
  it('classifies 25 as novice', () => { expect(classifySmithGrade(25)).toBe('novice') })
  it('classifies 10 as scavenger', () => { expect(classifySmithGrade(10)).toBe('scavenger') })
})

// ─── analyzeThunderIngot ───────────────────────────────────────────

describe('analyzeThunderIngot', () => {
  it('returns correct file path', () => {
    expect(analyzeThunderIngot(richContent, 'test.ts').file).toBe('test.ts')
  })

  it('classifies rich content as legendary-weapon', () => {
    expect(analyzeThunderIngot(richContent, 'test.ts').condition).toBe('legendary-weapon')
  })

  it('computes correct empty content scores', () => {
    const ig = analyzeThunderIngot(emptyContent, 'empty.ts')
    expect(ig.lightningPower).toBe(0)
    expect(ig.anvilStrength).toBe(0)
    expect(ig.sparkQuality).toBe(0)
    expect(ig.temperPrecision).toBe(0)
    expect(ig.stormCraft).toBe(0)
    expect(ig.qualityScore).toBe(0)
    expect(ig.condition).toBe('dust')
  })

  it('computes expected minimal content scores', () => {
    const ig = analyzeThunderIngot(minimalContent, 'minimal.ts')
    expect(ig.lightningPower).toBe(8)
    expect(ig.anvilStrength).toBe(6)
    expect(ig.sparkQuality).toBe(6)
    expect(ig.temperPrecision).toBe(6)
    expect(ig.stormCraft).toBe(6)
    expect(ig.qualityScore).toBe(6)
    expect(ig.condition).toBe('dust')
  })

  it('computes expected moderate content scores', () => {
    const ig = analyzeThunderIngot(moderateContent, 'moderate.ts')
    expect(ig.lightningPower).toBe(50)
    expect(ig.anvilStrength).toBe(54)
    expect(ig.sparkQuality).toBe(52)
    expect(ig.temperPrecision).toBe(54)
    expect(ig.stormCraft).toBe(54)
    expect(ig.qualityScore).toBe(53)
    expect(ig.condition).toBe('rough-metal')
  })

  it('computes expected rich content scores', () => {
    const ig = analyzeThunderIngot(richContent, 'rich.ts')
    expect(ig.lightningPower).toBe(93)
    expect(ig.anvilStrength).toBe(100)
    expect(ig.sparkQuality).toBe(100)
    expect(ig.temperPrecision).toBe(100)
    expect(ig.stormCraft).toBe(97)
    expect(ig.qualityScore).toBe(98)
    expect(ig.condition).toBe('legendary-weapon')
  })

  it('includes powering measure details', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    expect(ig.powering.hasPerformant).toBe(true)
    expect(ig.powering.hasOptimized).toBe(true)
  })

  it('includes enduring measure details', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    expect(ig.enduring.hasRobust).toBe(true)
    expect(ig.enduring.hasErrorHandled).toBe(true)
  })

  it('includes creating measure details', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    expect(ig.creating.hasInnovative).toBe(true)
    expect(ig.creating.hasElegant).toBe(true)
  })

  it('includes tuning measure details', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    expect(ig.tuning.hasExact).toBe(true)
    expect(ig.tuning.hasSharp).toBe(true)
  })

  it('includes crafting measure details', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    expect(ig.crafting.hasErrorHandling).toBe(true)
    expect(ig.crafting.hasRetryLogic).toBe(true)
  })
})

// ─── analyzeForgeComplex ───────────────────────────────────────────

describe('analyzeForgeComplex', () => {
  it('returns no-forge for empty ingots', () => {
    const c = analyzeForgeComplex([], 'src')
    expect(c.complexType).toBe('no-forge')
    expect(c.condition).toBe('void')
    expect(c.ingots).toHaveLength(0)
  })

  it('returns correct directory', () => {
    const ingots = [analyzeThunderIngot(richContent, 'src/a.ts')]
    expect(analyzeForgeComplex(ingots, 'src').directory).toBe('src')
  })

  it('computes averages from ingots', () => {
    const ingots = [analyzeThunderIngot(richContent, 'src/a.ts')]
    const c = analyzeForgeComplex(ingots, 'src')
    expect(c.avgPower).toBe(93)
    expect(c.avgStrength).toBe(100)
    expect(c.avgCraft).toBe(97)
  })

  it('counts legendary weapon files', () => {
    const ingots = [analyzeThunderIngot(richContent, 'src/a.ts')]
    expect(analyzeForgeComplex(ingots, 'src').legendaryWeaponCount).toBe(1)
  })

  it('classifies rich content complex as mythical-forge', () => {
    const ingots = [analyzeThunderIngot(richContent, 'src/a.ts')]
    const c = analyzeForgeComplex(ingots, 'src')
    expect(c.complexType).toBe('mythical-forge')
    expect(c.condition).toBe('legendary-armory')
  })

  it('averages across multiple ingots', () => {
    const p1 = analyzeThunderIngot(richContent, 'src/a.ts')
    const p2 = analyzeThunderIngot(minimalContent, 'src/b.ts')
    const c = analyzeForgeComplex([p1, p2], 'src')
    expect(c.avgPower).toBe(Math.round((93 + 8) / 2))
  })
})

// ─── classifyComplexType ───────────────────────────────────────────

describe('classifyComplexType', () => {
  it('returns no-forge for empty array', () => {
    expect(classifyComplexType([])).toBe('no-forge')
  })

  it('returns mythical-forge for all legendary-weapon with high avg', () => {
    const ingots = [analyzeThunderIngot(richContent, 'a.ts'), analyzeThunderIngot(richContent, 'b.ts')]
    expect(classifyComplexType(ingots)).toBe('mythical-forge')
  })
})

// ─── buildThunderForgeResult ───────────────────────────────────────

describe('buildThunderForgeResult', () => {
  it('handles empty input', async () => {
    const result = await buildThunderForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.smithGrade).toBe('scavenger')
  })

  it('processes single file', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats for rich content', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.stats.avgLightningPower).toBe(93)
    expect(result.stats.avgAnvilStrength).toBe(100)
    expect(result.stats.avgSparkQuality).toBe(100)
    expect(result.stats.avgTemperPrecision).toBe(100)
    expect(result.stats.avgStormCraft).toBe(97)
    expect(result.stats.legendaryWeaponCount).toBe(1)
  })

  it('computes armory for rich content', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.armory.avgPower).toBe(93)
    expect(result.armory.avgStrength).toBe(100)
    expect(result.armory.isLegendary).toBe(true)
    expect(result.armory.overallMight).toBe(97)
  })

  it('identifies best ingot', async () => {
    const result = await buildThunderForgeResult(['bad.ts', 'good.ts'], [minimalContent, richContent])
    expect(result.stats.bestIngot).toBe('good.ts')
  })

  it('identifies most powerful', async () => {
    const result = await buildThunderForgeResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.mostPowerful).toBe('high.ts')
  })

  it('identifies strongest', async () => {
    const result = await buildThunderForgeResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.strongest).toBe('high.ts')
  })

  it('identifies most creative', async () => {
    const result = await buildThunderForgeResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.mostCreative).toBe('high.ts')
  })

  it('identifies best craft', async () => {
    const result = await buildThunderForgeResult(['low.ts', 'high.ts'], [minimalContent, richContent])
    expect(result.stats.bestCraft).toBe('high.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildThunderForgeResult(['src/a.ts', 'lib/b.ts'], [richContent, moderateContent])
    expect(result.complexes.length).toBeGreaterThanOrEqual(2)
  })

  it('counts high measure flags', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.stats.hasHighPowerCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighCraftCount).toBe(1)
  })

  it('classifies smith grade for rich content', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.stats.smithGrade).toBe('thunder-smith')
  })

  it('computes overall might correctly', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    expect(result.stats.overallMight).toBe(97)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for healthy codebase', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const armory: ThunderArmory = { avgPower: 93, avgStrength: 100, avgCraft: 95, isLegendary: true, overallMight: 96 }
    const stats: ThunderForgeStats = {
      totalFiles: 1, totalComplexes: 1,
      avgLightningPower: 93, avgAnvilStrength: 100, avgSparkQuality: 100,
      avgTemperPrecision: 100, avgStormCraft: 95,
      legendaryWeaponCount: 1, thunderForgedCount: 0, properBladeCount: 0,
      roughMetalCount: 0, slagCount: 0, dustCount: 0,
      hasHighPowerCount: 1, hasHighStrengthCount: 1, hasHighQualityCount: 1,
      hasHighPrecisionCount: 1, hasHighCraftCount: 1,
      overallMight: 96, smithGrade: 'thunder-smith',
      bestIngot: 'test.ts', mostPowerful: 'test.ts', strongest: 'test.ts',
      mostCreative: 'test.ts', bestCraft: 'test.ts',
    }
    const recs = generateRecommendations([ig], [c], armory, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('legendary')
  })

  it('recommends boosting lightning power when low', () => {
    const ig = analyzeThunderIngot(minimalContent, 'test.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const armory: ThunderArmory = { avgPower: 8, avgStrength: 6, avgCraft: 6, isLegendary: false, overallMight: 7 }
    const stats: ThunderForgeStats = {
      totalFiles: 1, totalComplexes: 1,
      avgLightningPower: 8, avgAnvilStrength: 6, avgSparkQuality: 6,
      avgTemperPrecision: 6, avgStormCraft: 6,
      legendaryWeaponCount: 0, thunderForgedCount: 0, properBladeCount: 0,
      roughMetalCount: 0, slagCount: 0, dustCount: 1,
      hasHighPowerCount: 0, hasHighStrengthCount: 0, hasHighQualityCount: 0,
      hasHighPrecisionCount: 0, hasHighCraftCount: 0,
      overallMight: 7, smithGrade: 'scavenger',
      bestIngot: 'test.ts', mostPowerful: 'test.ts', strongest: 'test.ts',
      mostCreative: 'test.ts', bestCraft: 'test.ts',
    }
    const recs = generateRecommendations([ig], [c], armory, stats)
    expect(recs.some(r => r.includes('lightning power'))).toBe(true)
  })

  it('warns about dust files', () => {
    const ig = analyzeThunderIngot(minimalContent, 'test.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const armory: ThunderArmory = { avgPower: 8, avgStrength: 6, avgCraft: 6, isLegendary: false, overallMight: 7 }
    const stats: ThunderForgeStats = {
      totalFiles: 1, totalComplexes: 1,
      avgLightningPower: 8, avgAnvilStrength: 6, avgSparkQuality: 6,
      avgTemperPrecision: 6, avgStormCraft: 6,
      legendaryWeaponCount: 0, thunderForgedCount: 0, properBladeCount: 0,
      roughMetalCount: 0, slagCount: 0, dustCount: 1,
      hasHighPowerCount: 0, hasHighStrengthCount: 0, hasHighQualityCount: 0,
      hasHighPrecisionCount: 0, hasHighCraftCount: 0,
      overallMight: 7, smithGrade: 'scavenger',
      bestIngot: 'test.ts', mostPowerful: 'test.ts', strongest: 'test.ts',
      mostCreative: 'test.ts', bestCraft: 'test.ts',
    }
    const recs = generateRecommendations([ig], [c], armory, stats)
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })

  it('lists specific dust files to re-forge', () => {
    const ig = analyzeThunderIngot(minimalContent, 'bad.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const armory: ThunderArmory = { avgPower: 8, avgStrength: 6, avgCraft: 6, isLegendary: false, overallMight: 7 }
    const stats: ThunderForgeStats = {
      totalFiles: 1, totalComplexes: 1,
      avgLightningPower: 8, avgAnvilStrength: 6, avgSparkQuality: 6,
      avgTemperPrecision: 6, avgStormCraft: 6,
      legendaryWeaponCount: 0, thunderForgedCount: 0, properBladeCount: 0,
      roughMetalCount: 0, slagCount: 0, dustCount: 1,
      hasHighPowerCount: 0, hasHighStrengthCount: 0, hasHighQualityCount: 0,
      hasHighPrecisionCount: 0, hasHighCraftCount: 0,
      overallMight: 7, smithGrade: 'scavenger',
      bestIngot: 'bad.ts', mostPowerful: 'bad.ts', strongest: 'bad.ts',
      mostCreative: 'bad.ts', bestCraft: 'bad.ts',
    }
    const recs = generateRecommendations([ig], [c], armory, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about low overall might', () => {
    const ig = analyzeThunderIngot(minimalContent, 'test.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const armory: ThunderArmory = { avgPower: 8, avgStrength: 6, avgCraft: 6, isLegendary: false, overallMight: 7 }
    const stats: ThunderForgeStats = {
      totalFiles: 1, totalComplexes: 1,
      avgLightningPower: 8, avgAnvilStrength: 6, avgSparkQuality: 6,
      avgTemperPrecision: 6, avgStormCraft: 6,
      legendaryWeaponCount: 0, thunderForgedCount: 0, properBladeCount: 0,
      roughMetalCount: 0, slagCount: 0, dustCount: 1,
      hasHighPowerCount: 0, hasHighStrengthCount: 0, hasHighQualityCount: 0,
      hasHighPrecisionCount: 0, hasHighCraftCount: 0,
      overallMight: 7, smithGrade: 'scavenger',
      bestIngot: 'test.ts', mostPowerful: 'test.ts', strongest: 'test.ts',
      mostCreative: 'test.ts', bestCraft: 'test.ts',
    }
    const recs = generateRecommendations([ig], [c], armory, stats)
    expect(recs.some(r => r.includes('might'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => { expect(typeof colorScore(90)).toBe('string') })
  it('returns a string for score 0', () => { expect(typeof colorScore(0)).toBe('string') })
})

describe('colorGrade', () => {
  it('colors legendary-weapon', () => { expect(typeof colorGrade('legendary-weapon')).toBe('string') })
  it('colors dust', () => { expect(typeof colorGrade('dust')).toBe('string') })
  it('colors unknown grade', () => { expect(typeof colorGrade('unknown-grade')).toBe('string') })
})

describe('formatIngotTable', () => {
  it('formats a thunder ingot', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    const output = formatIngotTable(ig)
    expect(output).toContain('test.ts')
    expect(output).toContain('Lightning Power')
    expect(output).toContain('Anvil Strength')
    expect(output).toContain('Spark Quality')
    expect(output).toContain('Temper Precision')
    expect(output).toContain('Storm Craft')
    expect(output).toContain('Score')
  })
})

describe('formatIngotsTable', () => {
  it('returns no ingots message for empty array', () => {
    expect(formatIngotsTable([])).toContain('No thunder ingots found')
  })
  it('formats ingots with header', () => {
    const ig = analyzeThunderIngot(richContent, 'test.ts')
    const output = formatIngotsTable([ig])
    expect(output).toContain('Thunder Forge Analysis')
    expect(output).toContain('test.ts')
  })
})

describe('formatComplexTable', () => {
  it('formats a forge complex', () => {
    const ig = analyzeThunderIngot(richContent, 'src/a.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const output = formatComplexTable(c)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
  })
})

describe('formatComplexesTable', () => {
  it('returns no complexes message for empty array', () => {
    expect(formatComplexesTable([])).toContain('No forge complexes found')
  })
  it('formats complexes with header', () => {
    const ig = analyzeThunderIngot(richContent, 'src/a.ts')
    const c = analyzeForgeComplex([ig], 'src')
    const output = formatComplexesTable([c])
    expect(output).toContain('Forge Complexes')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Thunder Forge Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
    expect(output).toContain('Best Ingot')
    expect(output).toContain('Most Powerful')
    expect(output).toContain('Strongest')
    expect(output).toContain('Most Creative')
    expect(output).toContain('Best Craft')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations with header', () => {
    const output = formatRecommendations(['Fix foo', 'Improve bar'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix foo')
    expect(output).toContain('Improve bar')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Thunder Forge Analysis')
    expect(output).toContain('Forge Complexes')
    expect(output).toContain('Thunder Forge Statistics')
    expect(output).toContain('Armory')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildThunderForgeResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
