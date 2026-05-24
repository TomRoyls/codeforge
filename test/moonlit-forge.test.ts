import { describe, it, expect } from 'vitest'
import {
  measureForging,
  measureTempering,
  measureCrafting,
  measureAdapting,
  measurePrecisioning,
  classifyIngotCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifySmithGrade,
  analyzeMoonlitIngot,
  analyzeMoonForge,
  buildMoonlitForgeResult,
  generateRecommendations,
} from '../src/commands/moonlit-forge-helpers.js'
import {
  colorScore,
  colorGrade,
  formatIngotTable,
  formatIngotsTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/moonlit-forge-format-helpers.js'
import type {
  MoonlitIngot,
  MoonlitForgeResult,
  MoonlitForgeStats,
} from '../src/commands/moonlit-forge-helpers.js'

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

switch (status) {
  case Status.Active:
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureForging ───────────────────────────────────────────────

describe('measureForging', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureForging(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('dark-forge')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects production ready patterns in rich content', () => {
    const m = measureForging(richContent)
    expect(m.hasProductionReady).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('detects prototype code in poor content', () => {
    const m = measureForging(poorContent)
    expect(m.prototypeCodeCount).toBeGreaterThan(0)
    expect(m.hasNoPrototypeCode).toBe(false)
    expect(m.fragileCount).toBeGreaterThan(0)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects monitored patterns in rich content', () => {
    const m = measureForging(richContent)
    expect(m.hasLogged).toBe(true)
    expect(m.hasMonitored).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureForging(richContent).grade).not.toBe('dark-forge')
    expect(measureForging(emptyContent).grade).toBe('dark-forge')
  })

  it('has quality capped at 100', () => {
    const m = measureForging(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureTempering ─────────────────────────────────────────────

describe('measureTempering', () => {
  it('returns 0 silver for empty content', () => {
    const m = measureTempering(emptyContent)
    expect(m.silver).toBe(0)
    expect(m.temper).toBe('raw-metal')
    expect(m.hasHighSilver).toBe(false)
  })

  it('detects refactored patterns in rich content', () => {
    const m = measureTempering(richContent)
    expect(m.hasRefactored).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasIterated).toBe(true)
  })

  it('detects first draft code in poor content', () => {
    const m = measureTempering(poorContent)
    expect(m.firstDraftCount).toBeGreaterThan(0)
    expect(m.hasNoFirstDraft).toBe(false)
    expect(m.roughCount).toBeGreaterThan(0)
    expect(m.hasNoRough).toBe(false)
  })

  it('classifies temper correctly', () => {
    expect(measureTempering(emptyContent).temper).toBe('raw-metal')
    expect(measureTempering(richContent).temper).not.toBe('raw-metal')
  })

  it('has silver capped at 100', () => {
    const m = measureTempering(richContent)
    expect(m.silver).toBeLessThanOrEqual(100)
  })
})

// ─── measureCrafting ──────────────────────────────────────────────

describe('measureCrafting', () => {
  it('returns 0 shadow for empty content', () => {
    const m = measureCrafting(emptyContent)
    expect(m.shadow).toBe(0)
    expect(m.craft).toBe('no-craft')
    expect(m.hasHighShadow).toBe(false)
  })

  it('detects implicit handled patterns in rich content', () => {
    const m = measureCrafting(richContent)
    expect(m.hasImplicitHandled).toBe(true)
    expect(m.hasEdgeCasesCovered).toBe(true)
    expect(m.hasSideEffectsControlled).toBe(true)
  })

  it('detects uncovered code in poor content', () => {
    const m = measureCrafting(poorContent)
    expect(m.uncoveredCount).toBeGreaterThan(0)
    expect(m.hasNoUncovered).toBe(false)
    expect(m.uncontrolledCount).toBeGreaterThan(0)
    expect(m.hasNoUncontrolled).toBe(false)
  })

  it('classifies craft correctly', () => {
    expect(measureCrafting(emptyContent).craft).toBe('no-craft')
    expect(measureCrafting(richContent).craft).not.toBe('no-craft')
  })

  it('has shadow capped at 100', () => {
    const m = measureCrafting(richContent)
    expect(m.shadow).toBeLessThanOrEqual(100)
  })
})

// ─── measureAdapting ──────────────────────────────────────────────

describe('measureAdapting', () => {
  it('returns 0 adaptation for empty content', () => {
    const m = measureAdapting(emptyContent)
    expect(m.adaptation).toBe(0)
    expect(m.phase).toBe('eclipse')
    expect(m.hasHighAdaptation).toBe(false)
  })

  it('detects configurable patterns in rich content', () => {
    const m = measureAdapting(richContent)
    expect(m.hasConfigurable).toBe(true)
    expect(m.hasEnvironmentAware).toBe(true)
    expect(m.hasDynamic).toBe(true)
  })

  it('detects hardcoded code in poor content', () => {
    const m = measureAdapting(poorContent)
    expect(m.hardcodedCount).toBeGreaterThan(0)
    expect(m.hasNoHardcoded).toBe(false)
    expect(m.staticCount).toBeGreaterThan(0)
    expect(m.hasNoStatic).toBe(false)
  })

  it('classifies phase correctly', () => {
    expect(measureAdapting(emptyContent).phase).toBe('eclipse')
    expect(measureAdapting(richContent).phase).not.toBe('eclipse')
  })

  it('has adaptation capped at 100', () => {
    const m = measureAdapting(richContent)
    expect(m.adaptation).toBeLessThanOrEqual(100)
  })
})

// ─── measurePrecisioning ──────────────────────────────────────────

describe('measurePrecisioning', () => {
  it('returns 0 precision for empty content', () => {
    const m = measurePrecisioning(emptyContent)
    expect(m.precision).toBe(0)
    expect(m.starlight).toBe('no-stars')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('detects accurate patterns in rich content', () => {
    const m = measurePrecisioning(richContent)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects approximate code in poor content', () => {
    const m = measurePrecisioning(poorContent)
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
    expect(m.vagueCount).toBeGreaterThan(0)
    expect(m.hasNoVague).toBe(false)
  })

  it('classifies starlight correctly', () => {
    expect(measurePrecisioning(emptyContent).starlight).toBe('no-stars')
    expect(measurePrecisioning(richContent).starlight).not.toBe('no-stars')
  })

  it('has precision capped at 100', () => {
    const m = measurePrecisioning(richContent)
    expect(m.precision).toBeLessThanOrEqual(100)
  })
})

// ─── classifyIngotCondition ───────────────────────────────────────

describe('classifyIngotCondition', () => {
  it('classifies celestial-ingot for high scores', () => {
    expect(classifyIngotCondition(90)).toBe('celestial-ingot')
    expect(classifyIngotCondition(85)).toBe('celestial-ingot')
  })

  it('classifies silver-masterpiece for good scores', () => {
    expect(classifyIngotCondition(70)).toBe('silver-masterpiece')
    expect(classifyIngotCondition(75)).toBe('silver-masterpiece')
  })

  it('classifies proper-ingot for moderate scores', () => {
    expect(classifyIngotCondition(55)).toBe('proper-ingot')
    expect(classifyIngotCondition(60)).toBe('proper-ingot')
  })

  it('classifies rough-metal for low scores', () => {
    expect(classifyIngotCondition(40)).toBe('rough-metal')
    expect(classifyIngotCondition(45)).toBe('rough-metal')
  })

  it('classifies tarnished-silver for poor scores', () => {
    expect(classifyIngotCondition(25)).toBe('tarnished-silver')
    expect(classifyIngotCondition(30)).toBe('tarnished-silver')
  })

  it('classifies scrap for very low scores', () => {
    expect(classifyIngotCondition(0)).toBe('scrap')
    expect(classifyIngotCondition(10)).toBe('scrap')
    expect(classifyIngotCondition(24)).toBe('scrap')
  })
})

// ─── classifyForgeType ────────────────────────────────────────────

describe('classifyForgeType', () => {
  it('returns no-forge for empty ingots', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })

  it('classifies based on average quality score', () => {
    const ingot: MoonlitIngot = {
      file: 'a.ts', nocturnalQuality: 90, silverTempering: 90, shadowCraft: 90,
      moonPhaseAdaptation: 90, starlightPrecision: 90,
      forging: { quality: 90, grade: 'masterwork-silver', hasHighQuality: true, hasProductionReady: true, hasNoPrototypeCode: true, hasRobust: true, hasNoFragile: true, hasErrorHandled: true, hasNoBareCrash: true, hasLogged: true, hasNoSilent: true, hasMonitored: true, hasNoUntracked: true, prototypeCodeCount: 0, fragileCount: 0 },
      tempering: { silver: 90, temper: 'master-tempered', hasHighSilver: true, hasRefactored: true, hasNoFirstDraft: true, hasPolished: true, hasNoRough: true, hasIterated: true, hasNoSinglePass: true, hasReviewed: true, hasNoUnreviewed: true, hasImproved: true, hasNoStagnant: true, firstDraftCount: 0, roughCount: 0 },
      crafting: { shadow: 90, craft: 'shadow-master', hasHighShadow: true, hasImplicitHandled: true, hasEdgeCasesCovered: true, hasNoUncovered: true, hasSideEffectsControlled: true, hasNoUncontrolled: true, hasStateManaged: true, hasNoLeaked: true, hasHiddenProcessed: true, hasNoIgnored: true, hasAware: true, uncoveredCount: 0, uncontrolledCount: 0 },
      adapting: { adaptation: 90, phase: 'full-moon', hasHighAdaptation: true, hasConfigurable: true, hasEnvironmentAware: true, hasNoHardcoded: true, hasDynamic: true, hasNoStatic: true, hasResponsive: true, hasNoFixed: true, hasAdaptive: true, hasNoRigid: true, hasFlexible: true, hardcodedCount: 0, staticCount: 0 },
      precisioning: { precision: 90, starlight: 'north-star', hasHighPrecision: true, hasAccurate: true, hasExact: true, hasNoApproximate: true, hasPrecise: true, hasNoVague: true, hasValidated: true, hasNoUnvalidated: true, hasCorrect: true, hasNoAlmostRight: true, hasSharp: true, approximateCount: 0, vagueCount: 0 },
      condition: 'celestial-ingot', qualityScore: 90,
    }
    const result = classifyForgeType([ingot])
    expect(result).toBe('grand-moonforge')
  })
})

// ─── classifyForgeCondition ───────────────────────────────────────

describe('classifyForgeCondition', () => {
  it('classifies celestial-foundry for high avg', () => {
    expect(classifyForgeCondition(80)).toBe('celestial-foundry')
    expect(classifyForgeCondition(75)).toBe('celestial-foundry')
  })

  it('classifies moonlit-workshop for good avg', () => {
    expect(classifyForgeCondition(60)).toBe('moonlit-workshop')
    expect(classifyForgeCondition(70)).toBe('moonlit-workshop')
  })

  it('classifies decent-forge for moderate avg', () => {
    expect(classifyForgeCondition(45)).toBe('decent-forge')
    expect(classifyForgeCondition(55)).toBe('decent-forge')
  })

  it('classifies void for zero avg', () => {
    expect(classifyForgeCondition(0)).toBe('void')
    expect(classifyForgeCondition(10)).toBe('void')
  })
})

// ─── classifySmithGrade ───────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies moon-master for high moonlight', () => {
    expect(classifySmithGrade(85)).toBe('moon-master')
    expect(classifySmithGrade(80)).toBe('moon-master')
  })

  it('classifies silver-smith for good moonlight', () => {
    expect(classifySmithGrade(65)).toBe('silver-smith')
    expect(classifySmithGrade(70)).toBe('silver-smith')
  })

  it('classifies skilled-forger for moderate moonlight', () => {
    expect(classifySmithGrade(50)).toBe('skilled-forger')
    expect(classifySmithGrade(55)).toBe('skilled-forger')
  })

  it('classifies apprentice for low moonlight', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(40)).toBe('apprentice')
  })

  it('classifies novice for poor moonlight', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(25)).toBe('novice')
  })

  it('classifies blind-smith for zero moonlight', () => {
    expect(classifySmithGrade(0)).toBe('blind-smith')
    expect(classifySmithGrade(10)).toBe('blind-smith')
  })
})

// ─── analyzeMoonlitIngot ──────────────────────────────────────────

describe('analyzeMoonlitIngot', () => {
  it('analyzes empty content', () => {
    const ingot = analyzeMoonlitIngot(emptyContent, 'empty.ts')
    expect(ingot.file).toBe('empty.ts')
    expect(ingot.qualityScore).toBe(0)
    expect(ingot.condition).toBe('scrap')
  })

  it('analyzes rich content with high scores', () => {
    const ingot = analyzeMoonlitIngot(richContent, 'rich.ts')
    expect(ingot.qualityScore).toBeGreaterThan(50)
    expect(ingot.condition).not.toBe('scrap')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const ingot = analyzeMoonlitIngot(moderateContent, 'mod.ts')
    const expected = Math.round(
      ingot.forging.quality * 0.2 +
      ingot.tempering.silver * 0.2 +
      ingot.crafting.shadow * 0.2 +
      ingot.adapting.adaptation * 0.2 +
      ingot.precisioning.precision * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('propagates measure scores to ingot fields', () => {
    const ingot = analyzeMoonlitIngot(richContent, 'rich.ts')
    expect(ingot.nocturnalQuality).toBe(ingot.forging.quality)
    expect(ingot.silverTempering).toBe(ingot.tempering.silver)
    expect(ingot.shadowCraft).toBe(ingot.crafting.shadow)
    expect(ingot.moonPhaseAdaptation).toBe(ingot.adapting.adaptation)
    expect(ingot.starlightPrecision).toBe(ingot.precisioning.precision)
  })
})

// ─── analyzeMoonForge ─────────────────────────────────────────────

describe('analyzeMoonForge', () => {
  it('returns empty forge for no ingots', () => {
    const forge = analyzeMoonForge([], 'empty-dir')
    expect(forge.directory).toBe('empty-dir')
    expect(forge.ingots).toHaveLength(0)
    expect(forge.forgeType).toBe('no-forge')
    expect(forge.condition).toBe('void')
  })

  it('computes averages from ingots', () => {
    const ingot = analyzeMoonlitIngot(richContent, 'dir/rich.ts')
    const forge = analyzeMoonForge([ingot], 'dir')
    expect(forge.avgNocturnal).toBe(ingot.nocturnalQuality)
    expect(forge.avgTempering).toBe(ingot.silverTempering)
    expect(forge.avgPrecision).toBe(ingot.starlightPrecision)
  })
})

// ─── buildMoonlitForgeResult ──────────────────────────────────────

describe('buildMoonlitForgeResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildMoonlitForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.forges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.night.isCelestial).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildMoonlitForgeResult(['index.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.forges).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildMoonlitForgeResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.ingots).toHaveLength(2)
    expect(result.forges).toHaveLength(1)
  })

  it('computes night summary correctly', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    expect(result.night.avgNocturnal).toBeGreaterThan(0)
    expect(result.night.avgTempering).toBeGreaterThan(0)
    expect(result.night.avgPrecision).toBeGreaterThan(0)
    expect(result.night.overallMoonlight).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildMoonlitForgeResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.celestialIngotCount +
      result.stats.silverMasterpieceCount +
      result.stats.properIngotCount +
      result.stats.roughMetalCount +
      result.stats.tarnishedSilverCount +
      result.stats.scrapCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSilverCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighShadowCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAdaptationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildMoonlitForgeResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestIngot).toBeDefined()
    expect(result.stats.bestNocturnal).toBeDefined()
    expect(result.stats.bestTempered).toBeDefined()
    expect(result.stats.bestShadow).toBeDefined()
    expect(result.stats.mostPrecise).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests nocturnal quality improvement for low quality', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('nocturnal quality') || r.includes('nocturnal'))
    expect(rec).toBe(true)
  })

  it('suggests silver tempering improvement for low tempering', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('silver tempering') || r.includes('tempering'))
    expect(rec).toBe(true)
  })

  it('suggests shadow craft improvement for low shadow', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('shadow craft') || r.includes('shadow'))
    expect(rec).toBe(true)
  })

  it('mentions scrap files', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('scrap'))
    expect(rec).toBe(true)
  })
})

// ─── colorScore ───────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

// ─── colorGrade ───────────────────────────────────────────────────

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('celestial-ingot')).toBe('string')
    expect(typeof colorGrade('scrap')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatIngotTable ─────────────────────────────────────────────

describe('formatIngotTable', () => {
  it('formats an ingot', () => {
    const ingot = analyzeMoonlitIngot(richContent, 'rich.ts')
    const formatted = formatIngotTable(ingot)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Nocturnal Quality')
    expect(formatted).toContain('Silver Tempering')
    expect(formatted).toContain('Shadow Craft')
    expect(formatted).toContain('Score')
  })
})

// ─── formatIngotsTable ────────────────────────────────────────────

describe('formatIngotsTable', () => {
  it('returns message for empty ingots', () => {
    expect(formatIngotsTable([])).toContain('No moonlit ingots')
  })
})

// ─── formatForgeTable ─────────────────────────────────────────────

describe('formatForgeTable', () => {
  it('formats a forge', () => {
    const ingot = analyzeMoonlitIngot(richContent, 'src/a.ts')
    const forge = analyzeMoonForge([ingot], 'src')
    const formatted = formatForgeTable(forge)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Forge:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatForgesTable ────────────────────────────────────────────

describe('formatForgesTable', () => {
  it('returns message for empty forges', () => {
    expect(formatForgesTable([])).toContain('No moon forges')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Moonlight')
    expect(formatted).toContain('Smith Grade')
    expect(formatted).toContain('Best Ingot')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Moonlit Forge Analysis')
    expect(formatted).toContain('Moon Forges')
    expect(formatted).toContain('Moonlit Forge Statistics')
    expect(formatted).toContain('Night')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.night).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildMoonlitForgeResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.ingots).toHaveLength(3)
    expect(result.forges).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.night.overallMoonlight).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('night isCelestial for high nocturnal', async () => {
    const result = await buildMoonlitForgeResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.night.isCelestial).toBe(true)
  })

  it('night is not celestial for low nocturnal', async () => {
    const result = await buildMoonlitForgeResult(['empty.ts'], [emptyContent])
    expect(result.night.isCelestial).toBe(false)
  })

  it('overallMoonlight equals avg of nocturnal, tempering, precision', async () => {
    const result = await buildMoonlitForgeResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.night.avgNocturnal + result.night.avgTempering + result.night.avgPrecision) / 3)
    expect(result.night.overallMoonlight).toBe(expected)
  })
})
