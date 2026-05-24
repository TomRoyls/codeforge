import { describe, it, expect } from 'vitest'
import {
  measureDeepening,
  measurePulsing,
  measureIlluminating,
  measureForging,
  measureKnowing,
  classifyWaveCondition,
  classifyPoolType,
  classifyPoolCondition,
  classifyDiverGrade,
  analyzeObsidianWave,
  analyzeTidePool,
  buildObsidianTideResult,
  generateRecommendations,
} from '../src/commands/obsidian-tide-helpers.js'
import {
  colorScore,
  colorGrade,
  formatWaveTable,
  formatWavesTable,
  formatPoolTable,
  formatPoolsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-tide-format-helpers.js'
import type { ObsidianWave } from '../src/commands/obsidian-tide-helpers.js'

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

// ─── measureDeepening ──────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns no-depth for empty content', () => {
    const m = measureDeepening(emptyContent)
    expect(m.power).toBe(0)
    expect(m.grade).toBe('no-depth')
    expect(m.hasHighPower).toBe(false)
    expect(m.trivialCount).toBe(0)
    expect(m.fillerCount).toBe(0)
  })

  it('returns abyssal-power for rich content', () => {
    const m = measureDeepening(richContent)
    expect(m.power).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('abyssal-power')
    expect(m.hasHighPower).toBe(true)
    expect(m.hasProfound).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasNoTrivial).toBe(true)
    expect(m.hasSubstantive).toBe(true)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasPowerful).toBe(true)
  })

  it('counts trivial patterns (var)', () => {
    const m = measureDeepening('var x = 1; var y = 2;')
    expect(m.trivialCount).toBe(2)
    expect(m.hasNoTrivial).toBe(false)
  })

  it('counts filler patterns (any)', () => {
    const m = measureDeepening('const x: any = 1;')
    expect(m.fillerCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoFiller).toBe(false)
  })

  it('detects eval as dead code', () => {
    const m = measureDeepening("eval('x')")
    expect(m.hasNoDeadCode).toBe(false)
  })

  it('detects debugger as boilerplate', () => {
    const m = measureDeepening('debugger')
    expect(m.hasNoBoilerplate).toBe(false)
  })

  it('returns higher power for moderate content', () => {
    const m = measureDeepening(moderateContent)
    expect(m.power).toBeGreaterThan(0)
  })
})

// ─── measurePulsing ────────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns still-water for empty content', () => {
    const m = measurePulsing(emptyContent)
    expect(m.rhythm).toBe(0)
    expect(m.tide).toBe('still-water')
    expect(m.hasHighRhythm).toBe(false)
    expect(m.sluggishCount).toBe(0)
    expect(m.erraticCount).toBe(0)
  })

  it('returns ocean-rhythm for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBeGreaterThanOrEqual(85)
    expect(m.tide).toBe('ocean-rhythm')
    expect(m.hasHighRhythm).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPerformant).toBe(true)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasTimely).toBe(true)
  })

  it('counts sluggish patterns (var)', () => {
    const m = measurePulsing('var x = 1; var y = 2;')
    expect(m.sluggishCount).toBe(2)
    expect(m.hasNoSluggish).toBe(false)
  })

  it('counts erratic patterns (any)', () => {
    const m = measurePulsing('const x: any = 1;')
    expect(m.erraticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects eval as jerky', () => {
    const m = measurePulsing("eval('x')")
    expect(m.hasNoJerky).toBe(false)
  })

  it('detects debugger as wasteful', () => {
    const m = measurePulsing('debugger')
    expect(m.hasNoWasteful).toBe(false)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns opaque for empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.dark).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns obsidian-mirror for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.dark).toBe('obsidian-mirror')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadableEvenComplex).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasClear).toBe(true)
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

  it('detects eval as impenetrable', () => {
    const m = measureIlluminating("eval('x')")
    expect(m.hasNoImpenetrable).toBe(false)
  })

  it('detects debugger as hidden', () => {
    const m = measureIlluminating('debugger')
    expect(m.hasNoHidden).toBe(false)
  })
})

// ─── measureForging ────────────────────────────────────────────────

describe('measureForging', () => {
  it('returns no-origin for empty content', () => {
    const m = measureForging(emptyContent)
    expect(m.origin).toBe(0)
    expect(m.volcanic).toBe('no-origin')
    expect(m.hasHighOrigin).toBe(false)
    expect(m.hackedCount).toBe(0)
    expect(m.chaoticCount).toBe(0)
  })

  it('returns forged-in-fire for rich content', () => {
    const m = measureForging(richContent)
    expect(m.origin).toBeGreaterThanOrEqual(85)
    expect(m.volcanic).toBe('forged-in-fire')
    expect(m.hasHighOrigin).toBe(true)
    expect(m.hasWellDesigned).toBe(true)
    expect(m.hasPlanned).toBe(true)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasDisciplined).toBe(true)
    expect(m.hasMethodical).toBe(true)
    expect(m.hasIntentional).toBe(true)
  })

  it('counts hacked patterns (var)', () => {
    const m = measureForging('var x = 1; var y = 2;')
    expect(m.hackedCount).toBe(2)
    expect(m.hasNoHacked).toBe(false)
  })

  it('counts chaotic patterns (any)', () => {
    const m = measureForging('const x: any = 1;')
    expect(m.chaoticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects eval as adhoc', () => {
    const m = measureForging("eval('x')")
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects debugger as random', () => {
    const m = measureForging('debugger')
    expect(m.hasNoRandom).toBe(false)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns no-knowledge for empty content', () => {
    const m = measureKnowing(emptyContent)
    expect(m.knowledge).toBe(0)
    expect(m.abyss).toBe('no-knowledge')
    expect(m.hasHighKnowledge).toBe(false)
    expect(m.magicNumberCount).toBe(0)
    expect(m.undocumentedCount).toBe(0)
  })

  it('returns ancient-depth for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.knowledge).toBeGreaterThanOrEqual(85)
    expect(m.abyss).toBe('ancient-depth')
    expect(m.hasHighKnowledge).toBe(true)
    expect(m.hasDomainExpertise).toBe(true)
    expect(m.hasBusinessLogic).toBe(true)
    expect(m.hasNoMagicNumbers).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasContextual).toBe(true)
    expect(m.hasInformed).toBe(true)
  })

  it('counts magic number patterns (var)', () => {
    const m = measureKnowing('var x = 1; var y = 2;')
    expect(m.magicNumberCount).toBe(2)
    expect(m.hasNoMagicNumbers).toBe(false)
  })

  it('counts undocumented patterns (any)', () => {
    const m = measureKnowing('const x: any = 1;')
    expect(m.undocumentedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects eval as cryptic', () => {
    const m = measureKnowing("eval('x')")
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects debugger as context-free', () => {
    const m = measureKnowing('debugger')
    expect(m.hasNoContextFree).toBe(false)
  })
})

// ─── classifyWaveCondition ─────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies correctly at all boundaries', () => {
    expect(classifyWaveCondition(90)).toBe('obsidian-masterpiece')
    expect(classifyWaveCondition(85)).toBe('obsidian-masterpiece')
    expect(classifyWaveCondition(70)).toBe('dark-gem')
    expect(classifyWaveCondition(55)).toBe('proper-glass')
    expect(classifyWaveCondition(40)).toBe('cloudy-obsidian')
    expect(classifyWaveCondition(25)).toBe('cracked-glass')
    expect(classifyWaveCondition(0)).toBe('gravel')
    expect(classifyWaveCondition(24)).toBe('gravel')
  })
})

// ─── classifyPoolType ──────────────────────────────────────────────

describe('classifyPoolType', () => {
  it('returns no-pool for empty array', () => {
    expect(classifyPoolType([])).toBe('no-pool')
  })

  it('returns volcanic-lagoon for high-quality waves', () => {
    const waves = Array.from({ length: 4 }, () => ({
      ...analyzeObsidianWave(richContent, 'test.ts'),
      qualityScore: 90,
      condition: 'obsidian-masterpiece' as const,
    }))
    expect(classifyPoolType(waves)).toBe('volcanic-lagoon')
  })

  it('returns dark-tide-pool for decent waves', () => {
    const waves = Array.from({ length: 2 }, () => ({
      ...analyzeObsidianWave(richContent, 'test.ts'),
      qualityScore: 65,
      condition: 'dark-gem' as const,
    }))
    expect(classifyPoolType(waves)).toBe('dark-tide-pool')
  })

  it('returns no-pool for low-quality waves', () => {
    const waves = Array.from({ length: 2 }, () => ({
      ...analyzeObsidianWave(emptyContent, 'test.ts'),
      qualityScore: 10,
      condition: 'gravel' as const,
    }))
    expect(classifyPoolType(waves)).toBe('no-pool')
  })
})

// ─── classifyPoolCondition ─────────────────────────────────────────

describe('classifyPoolCondition', () => {
  it('classifies all conditions', () => {
    expect(classifyPoolCondition(80)).toBe('volcanic-paradise')
    expect(classifyPoolCondition(60)).toBe('dark-beauty')
    expect(classifyPoolCondition(45)).toBe('decent-pool')
    expect(classifyPoolCondition(30)).toBe('murky-puddle')
    expect(classifyPoolCondition(15)).toBe('dry-crack')
    expect(classifyPoolCondition(0)).toBe('void')
  })
})

// ─── classifyDiverGrade ────────────────────────────────────────────

describe('classifyDiverGrade', () => {
  it('classifies all grades', () => {
    expect(classifyDiverGrade(85)).toBe('abyssal-diver')
    expect(classifyDiverGrade(65)).toBe('deep-sea-explorer')
    expect(classifyDiverGrade(50)).toBe('skilled-swimmer')
    expect(classifyDiverGrade(35)).toBe('apprentice')
    expect(classifyDiverGrade(20)).toBe('novice')
    expect(classifyDiverGrade(0)).toBe('landlubber')
  })
})

// ─── analyzeObsidianWave ───────────────────────────────────────────

describe('analyzeObsidianWave', () => {
  it('analyzes empty content as gravel', () => {
    const wave = analyzeObsidianWave(emptyContent, 'empty.ts')
    expect(wave.file).toBe('empty.ts')
    expect(wave.depthPower).toBe(0)
    expect(wave.tidalRhythm).toBe(0)
    expect(wave.darkClarity).toBe(0)
    expect(wave.volcanicOrigin).toBe(0)
    expect(wave.abyssKnowledge).toBe(0)
    expect(wave.qualityScore).toBe(0)
    expect(wave.condition).toBe('gravel')
  })

  it('analyzes rich content as obsidian-masterpiece', () => {
    const wave = analyzeObsidianWave(richContent, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.condition).toBe('obsidian-masterpiece')
    expect(wave.depthPower).toBeGreaterThan(0)
    expect(wave.tidalRhythm).toBeGreaterThan(0)
    expect(wave.darkClarity).toBeGreaterThan(0)
    expect(wave.volcanicOrigin).toBeGreaterThan(0)
    expect(wave.abyssKnowledge).toBeGreaterThan(0)
  })

  it('computes qualityScore as weighted average', () => {
    const wave = analyzeObsidianWave(moderateContent, 'mod.ts')
    const expected = Math.round(
      wave.depthPower * 0.2 + wave.tidalRhythm * 0.2 + wave.darkClarity * 0.2 +
      wave.volcanicOrigin * 0.2 + wave.abyssKnowledge * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })

  it('preserves all measure data', () => {
    const wave = analyzeObsidianWave(richContent, 'rich.ts')
    expect(wave.deepening.power).toBe(wave.depthPower)
    expect(wave.pulsing.rhythm).toBe(wave.tidalRhythm)
    expect(wave.illuminating.clarity).toBe(wave.darkClarity)
    expect(wave.forging.origin).toBe(wave.volcanicOrigin)
    expect(wave.knowing.knowledge).toBe(wave.abyssKnowledge)
  })
})

// ─── analyzeTidePool ───────────────────────────────────────────────

describe('analyzeTidePool', () => {
  it('returns empty pool for no waves', () => {
    const pool = analyzeTidePool([], 'empty-dir')
    expect(pool.directory).toBe('empty-dir')
    expect(pool.waves).toHaveLength(0)
    expect(pool.avgPower).toBe(0)
    expect(pool.avgRhythm).toBe(0)
    expect(pool.avgKnowledge).toBe(0)
    expect(pool.poolType).toBe('no-pool')
    expect(pool.condition).toBe('void')
  })

  it('aggregates wave metrics', () => {
    const waves = [
      analyzeObsidianWave(richContent, 'a.ts'),
      analyzeObsidianWave(richContent, 'b.ts'),
    ]
    const pool = analyzeTidePool(waves, 'src')
    expect(pool.waves).toHaveLength(2)
    expect(pool.avgPower).toBeGreaterThan(0)
    expect(pool.avgRhythm).toBeGreaterThan(0)
    expect(pool.avgKnowledge).toBeGreaterThan(0)
  })

  it('counts gravel waves', () => {
    const waves = [
      analyzeObsidianWave(emptyContent, 'bad.ts'),
      analyzeObsidianWave(emptyContent, 'worse.ts'),
    ]
    const pool = analyzeTidePool(waves, 'bad-dir')
    expect(pool.gravelCount).toBe(2)
  })
})

// ─── buildObsidianTideResult ───────────────────────────────────────

describe('buildObsidianTideResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildObsidianTideResult([], [])
    expect(result.waves).toHaveLength(0)
    expect(result.pools).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.ocean.isAbyssal).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.pools).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgDepthPower).toBeGreaterThan(0)
    expect(result.stats.overallDepth).toBeGreaterThan(0)
    expect(result.stats.bestWave).toBe('test.ts')
    expect(result.stats.mostPowerful).toBe('test.ts')
    expect(result.stats.bestRhythm).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.mostKnowledgeable).toBe('test.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildObsidianTideResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.waves).toHaveLength(3)
    expect(result.pools).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalPools).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes ocean correctly', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    expect(result.ocean.avgPower).toBeGreaterThan(0)
    expect(result.ocean.avgRhythm).toBeGreaterThan(0)
    expect(result.ocean.avgKnowledge).toBeGreaterThan(0)
    expect(result.ocean.overallDepth).toBeGreaterThan(0)
  })

  it('tracks all condition counts', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.stats.gravelCount).toBe(2)
    expect(result.stats.obsidianMasterpieceCount).toBe(0)
  })

  it('tracks high-quality counts', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    expect(result.stats.hasHighPowerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighOriginCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighKnowledgeCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns congratulatory message for good code', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    const recs = generateRecommendations(result.waves, result.pools, result.ocean, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for poor code', async () => {
    const result = await buildObsidianTideResult(['bad.ts'], [emptyContent])
    const recs = generateRecommendations(result.waves, result.pools, result.ocean, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some(r => r.includes('depth power'))).toBe(true)
  })

  it('recommends for gravel waves', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.waves, result.pools, result.ocean, result.stats)
    expect(recs.some(r => r.includes('gravel'))).toBe(true)
  })

  it('restores specific gravel files', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.waves, result.pools, result.ocean, result.stats)
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
    expect(typeof colorGrade('abyssal-diver')).toBe('string')
    expect(typeof colorGrade('abyssal-power')).toBe('string')
    expect(typeof colorGrade('obsidian-masterpiece')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatWaveTable', () => {
  it('formats a single wave', () => {
    const wave = analyzeObsidianWave(richContent, 'test.ts')
    const output = formatWaveTable(wave)
    expect(output).toContain('test.ts')
    expect(output).toContain('Depth Power')
    expect(output).toContain('Tidal Rhythm')
    expect(output).toContain('Dark Clarity')
    expect(output).toContain('Volcanic Origin')
    expect(output).toContain('Abyss Knowledge')
  })
})

describe('formatWavesTable', () => {
  it('returns message for empty array', () => {
    expect(formatWavesTable([])).toContain('No obsidian waves')
  })

  it('formats multiple waves', () => {
    const waves = [
      analyzeObsidianWave(richContent, 'a.ts'),
      analyzeObsidianWave(moderateContent, 'b.ts'),
    ]
    const output = formatWavesTable(waves)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatPoolTable', () => {
  it('formats a single pool', () => {
    const waves = [analyzeObsidianWave(richContent, 'test.ts')]
    const pool = analyzeTidePool(waves, 'src')
    const output = formatPoolTable(pool)
    expect(output).toContain('src')
  })
})

describe('formatPoolsTable', () => {
  it('returns message for empty array', () => {
    expect(formatPoolsTable([])).toContain('No tide pools')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Diver Grade')
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
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Obsidian Tide Analysis')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ocean).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles mixed quality files', async () => {
    const result = await buildObsidianTideResult(
      ['good.ts', 'ok.ts', 'bad.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.waves).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.gravelCount).toBeGreaterThanOrEqual(1)
    expect(result.ocean.overallDepth).toBeGreaterThanOrEqual(0)
  })

  it('groups files into pools by directory', async () => {
    const result = await buildObsidianTideResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, richContent],
    )
    expect(result.pools).toHaveLength(2)
    const src = result.pools.find(p => p.directory === 'src')
    const lib = result.pools.find(p => p.directory === 'lib')
    expect(src).toBeDefined()
    expect(lib).toBeDefined()
    if (src) expect(src.waves).toHaveLength(2)
    if (lib) expect(lib.waves).toHaveLength(1)
  })

  it('condition counts match wave conditions', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const gravel = result.waves.filter(w => w.condition === 'gravel').length
    expect(result.stats.gravelCount).toBe(gravel)
  })

  it('ocean overallDepth is avg of 3 measures', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    const expected = Math.round(
      (result.ocean.avgPower + result.ocean.avgRhythm + result.ocean.avgKnowledge) / 3,
    )
    expect(result.ocean.overallDepth).toBe(expected)
  })

  it('stats avgVolcanicOrigin is computed', async () => {
    const result = await buildObsidianTideResult(['test.ts'], [richContent])
    expect(result.stats.avgVolcanicOrigin).toBeGreaterThan(0)
    expect(result.stats.avgDarkClarity).toBeGreaterThan(0)
  })

  it('minimal content scores low but not zero', () => {
    const wave = analyzeObsidianWave(minimalContent, 'minimal.ts')
    expect(wave.depthPower).toBeGreaterThan(0)
    expect(wave.tidalRhythm).toBeGreaterThan(0)
  })
})
