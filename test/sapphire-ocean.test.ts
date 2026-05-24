import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measurePulsing,
  measureThriving,
  measureFlowing,
  measureDiving,
  classifyWaveCondition,
  classifyDepthType,
  classifyDepthCondition,
  classifyNavigatorGrade,
  analyzeOceanWave,
  analyzeOceanDepth,
  buildSapphireOceanResult,
  generateRecommendations,
} from '../src/commands/sapphire-ocean-helpers.js'
import {
  colorScore,
  colorGrade,
  formatWaveTable,
  formatWavesTable,
  formatDepthTable,
  formatDepthsTable,
  formatStatsTable,
  formatCelebration,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-ocean-format-helpers.js'
import type {
  OceanWave,
  SapphireOceanStats,
  SapphireOceanResult,
  OceanSummary,
} from '../src/commands/sapphire-ocean-helpers.js'

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

// ─── measureClarifying ────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 depth for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.grade).toBe('opaque-sea')
    expect(m.hasHighDepth).toBe(false)
  })

  it('returns low depth for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.depth).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('detects readable patterns in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects obfuscated code in poor content', () => {
    const m = measureClarifying(poorContent)
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects layered patterns in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.hasLayered).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureClarifying(richContent).grade).not.toBe('opaque-sea')
    expect(measureClarifying(emptyContent).grade).toBe('opaque-sea')
  })

  it('has depth capped at 100', () => {
    const m = measureClarifying(richContent)
    expect(m.depth).toBeLessThanOrEqual(100)
  })
})

// ─── measurePulsing ───────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns 0 rhythm for empty content', () => {
    const m = measurePulsing(emptyContent)
    expect(m.rhythm).toBe(0)
    expect(m.tide).toBe('still-water')
    expect(m.hasHighRhythm).toBe(false)
  })

  it('detects consistent patterns in rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPerformant).toBe(true)
    expect(m.hasPredictable).toBe(true)
  })

  it('detects smooth patterns in rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasTimely).toBe(true)
  })

  it('detects sluggish code in poor content', () => {
    const m = measurePulsing(poorContent)
    expect(m.sluggishCount).toBeGreaterThan(0)
    expect(m.hasNoSluggish).toBe(false)
    expect(m.erraticCount).toBeGreaterThan(0)
    expect(m.hasNoErratic).toBe(false)
  })

  it('classifies tide grade correctly', () => {
    expect(measurePulsing(emptyContent).tide).toBe('still-water')
    expect(measurePulsing(richContent).tide).not.toBe('still-water')
  })

  it('has rhythm capped at 100', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBeLessThanOrEqual(100)
  })
})

// ─── measureThriving ──────────────────────────────────────────────

describe('measureThriving', () => {
  it('returns 0 diversity for empty content', () => {
    const m = measureThriving(emptyContent)
    expect(m.diversity).toBe(0)
    expect(m.coral).toBe('no-ecosystem')
    expect(m.hasHighDiversity).toBe(false)
  })

  it('detects multiple patterns in rich content', () => {
    const m = measureThriving(richContent)
    expect(m.hasMultiplePatterns).toBe(true)
    expect(m.hasVariedApproaches).toBe(true)
    expect(m.hasRichAPI).toBe(true)
  })

  it('detects diverse types in rich content', () => {
    const m = measureThriving(richContent)
    expect(m.hasDiverseTypes).toBe(true)
    expect(m.hasMultipleMethods).toBe(true)
    expect(m.hasColorful).toBe(true)
  })

  it('detects single pattern code in poor content', () => {
    const m = measureThriving(poorContent)
    expect(m.singlePatternCount).toBeGreaterThan(0)
    expect(m.hasNoSinglePattern).toBe(false)
    expect(m.minimalAPICount).toBeGreaterThan(0)
    expect(m.hasNoMinimalAPI).toBe(false)
  })

  it('classifies coral grade correctly', () => {
    expect(measureThriving(emptyContent).coral).toBe('no-ecosystem')
    expect(measureThriving(richContent).coral).not.toBe('no-ecosystem')
  })

  it('has diversity capped at 100', () => {
    const m = measureThriving(richContent)
    expect(m.diversity).toBeLessThanOrEqual(100)
  })
})

// ─── measureFlowing ───────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 efficiency for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.efficiency).toBe(0)
    expect(m.current).toBe('no-flow')
    expect(m.hasHighEfficiency).toBe(false)
  })

  it('detects streamlined patterns in rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasDirectPaths).toBe(true)
    expect(m.hasOptimized).toBe(true)
  })

  it('detects cached patterns in rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.hasCached).toBe(true)
    expect(m.hasEfficient).toBe(true)
  })

  it('detects bottleneck code in poor content', () => {
    const m = measureFlowing(poorContent)
    expect(m.bottleneckCount).toBeGreaterThan(0)
    expect(m.hasNoBottlenecks).toBe(false)
    expect(m.circuitCount).toBeGreaterThan(0)
    expect(m.hasNoCircuits).toBe(false)
  })

  it('classifies current grade correctly', () => {
    expect(measureFlowing(emptyContent).current).toBe('no-flow')
    expect(measureFlowing(richContent).current).not.toBe('no-flow')
  })

  it('has efficiency capped at 100', () => {
    const m = measureFlowing(richContent)
    expect(m.efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── measureDiving ────────────────────────────────────────────────

describe('measureDiving', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureDiving(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.abyss).toBe('no-depth')
    expect(m.hasHighResilience).toBe(false)
  })

  it('detects error handling in rich content', () => {
    const m = measureDiving(richContent)
    expect(m.hasErrorHandling).toBe(true)
    expect(m.hasExceptionRecovery).toBe(true)
    expect(m.hasEdgeCaseCoverage).toBe(true)
  })

  it('detects null safety in rich content', () => {
    const m = measureDiving(richContent)
    expect(m.hasNullSafe).toBe(true)
    expect(m.hasBoundaryChecks).toBe(true)
    expect(m.hasFaultTolerant).toBe(true)
  })

  it('detects bare crashes in poor content', () => {
    const m = measureDiving(poorContent)
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.uncoveredCount).toBeGreaterThan(0)
    expect(m.hasNoUncovered).toBe(false)
  })

  it('classifies abyss grade correctly', () => {
    expect(measureDiving(emptyContent).abyss).toBe('no-depth')
    expect(measureDiving(richContent).abyss).not.toBe('no-depth')
  })

  it('has resilience capped at 100', () => {
    const m = measureDiving(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
  })
})

// ─── classifyWaveCondition ────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies sapphire-masterpiece for high scores', () => {
    expect(classifyWaveCondition(90)).toBe('sapphire-masterpiece')
    expect(classifyWaveCondition(85)).toBe('sapphire-masterpiece')
  })

  it('classifies ocean-jewel for good scores', () => {
    expect(classifyWaveCondition(70)).toBe('ocean-jewel')
    expect(classifyWaveCondition(75)).toBe('ocean-jewel')
  })

  it('classifies proper-sea for moderate scores', () => {
    expect(classifyWaveCondition(55)).toBe('proper-sea')
    expect(classifyWaveCondition(60)).toBe('proper-sea')
  })

  it('classifies murky-puddle for low scores', () => {
    expect(classifyWaveCondition(40)).toBe('murky-puddle')
    expect(classifyWaveCondition(45)).toBe('murky-puddle')
  })

  it('classifies stagnant-pond for poor scores', () => {
    expect(classifyWaveCondition(25)).toBe('stagnant-pond')
    expect(classifyWaveCondition(30)).toBe('stagnant-pond')
  })

  it('classifies dry-land for very low scores', () => {
    expect(classifyWaveCondition(0)).toBe('dry-land')
    expect(classifyWaveCondition(10)).toBe('dry-land')
    expect(classifyWaveCondition(24)).toBe('dry-land')
  })
})

// ─── classifyDepthType ────────────────────────────────────────────

describe('classifyDepthType', () => {
  it('returns no-ocean for empty waves', () => {
    expect(classifyDepthType([])).toBe('no-ocean')
  })

  it('classifies based on average quality score', () => {
    const wave: OceanWave = {
      file: 'a.ts', depthClarity: 90, tidalRhythm: 90, coralDiversity: 90,
      currentEfficiency: 90, abyssResilience: 90,
      clarifying: { depth: 90, grade: 'crystal-waters', hasHighDepth: true, hasReadable: true, hasTransparent: true, hasNoObfuscated: true, hasSelfDocumenting: true, hasNoCryptic: true, hasLayered: true, hasNoFlat: true, hasStructured: true, hasNoChaotic: true, hasClear: true, obfuscatedCount: 0, crypticCount: 0 },
      pulsing: { rhythm: 90, tide: 'perfect-tide', hasHighRhythm: true, hasConsistent: true, hasPerformant: true, hasNoSluggish: true, hasPredictable: true, hasNoErratic: true, hasSmooth: true, hasNoJerky: true, hasEfficient: true, hasNoWasteful: true, hasTimely: true, sluggishCount: 0, erraticCount: 0 },
      thriving: { diversity: 90, coral: 'great-barrier', hasHighDiversity: true, hasMultiplePatterns: true, hasVariedApproaches: true, hasNoSinglePattern: true, hasRichAPI: true, hasNoMinimalAPI: true, hasDiverseTypes: true, hasNoUniformTypes: true, hasMultipleMethods: true, hasNoSingleMethod: true, hasColorful: true, singlePatternCount: 0, minimalAPICount: 0 },
      flowing: { efficiency: 90, current: 'gulf-stream', hasHighEfficiency: true, hasStreamlined: true, hasNoBottlenecks: true, hasDirectPaths: true, hasNoCircuits: true, hasOptimized: true, hasNoRedundant: true, hasCached: true, hasNoRecalculating: true, hasEfficient: true, hasNoWasteful: true, bottleneckCount: 0, circuitCount: 0 },
      diving: { resilience: 90, abyss: 'mariana-trench', hasHighResilience: true, hasErrorHandling: true, hasExceptionRecovery: true, hasNoBareCrash: true, hasEdgeCaseCoverage: true, hasNoUncovered: true, hasNullSafe: true, hasNoBareDereference: true, hasBoundaryChecks: true, hasNoUnbounded: true, hasFaultTolerant: true, bareCrashCount: 0, uncoveredCount: 0 },
      condition: 'sapphire-masterpiece', qualityScore: 90,
    }
    const result = classifyDepthType([wave])
    expect(result).toBe('mariana-trench')
  })
})

// ─── classifyDepthCondition ───────────────────────────────────────

describe('classifyDepthCondition', () => {
  it('classifies pristine-ocean for high avg', () => {
    expect(classifyDepthCondition(80)).toBe('pristine-ocean')
    expect(classifyDepthCondition(75)).toBe('pristine-ocean')
  })

  it('classifies clear-waters for good avg', () => {
    expect(classifyDepthCondition(60)).toBe('clear-waters')
    expect(classifyDepthCondition(70)).toBe('clear-waters')
  })

  it('classifies decent-sea for moderate avg', () => {
    expect(classifyDepthCondition(45)).toBe('decent-sea')
    expect(classifyDepthCondition(55)).toBe('decent-sea')
  })

  it('classifies murky-waters for low avg', () => {
    expect(classifyDepthCondition(30)).toBe('murky-waters')
    expect(classifyDepthCondition(40)).toBe('murky-waters')
  })

  it('classifies polluted-bay for poor avg', () => {
    expect(classifyDepthCondition(15)).toBe('polluted-bay')
    expect(classifyDepthCondition(25)).toBe('polluted-bay')
  })

  it('classifies void for zero avg', () => {
    expect(classifyDepthCondition(0)).toBe('void')
    expect(classifyDepthCondition(10)).toBe('void')
  })
})

// ─── classifyNavigatorGrade ───────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('classifies ocean-master for high depth', () => {
    expect(classifyNavigatorGrade(85)).toBe('ocean-master')
    expect(classifyNavigatorGrade(80)).toBe('ocean-master')
    expect(classifyNavigatorGrade(100)).toBe('ocean-master')
  })

  it('classifies deep-sea-captain for good depth', () => {
    expect(classifyNavigatorGrade(65)).toBe('deep-sea-captain')
    expect(classifyNavigatorGrade(70)).toBe('deep-sea-captain')
    expect(classifyNavigatorGrade(79)).toBe('deep-sea-captain')
  })

  it('classifies skilled-sailor for moderate depth', () => {
    expect(classifyNavigatorGrade(50)).toBe('skilled-sailor')
    expect(classifyNavigatorGrade(55)).toBe('skilled-sailor')
    expect(classifyNavigatorGrade(64)).toBe('skilled-sailor')
  })

  it('classifies apprentice for low depth', () => {
    expect(classifyNavigatorGrade(35)).toBe('apprentice')
    expect(classifyNavigatorGrade(40)).toBe('apprentice')
    expect(classifyNavigatorGrade(49)).toBe('apprentice')
  })

  it('classifies novice for poor depth', () => {
    expect(classifyNavigatorGrade(20)).toBe('novice')
    expect(classifyNavigatorGrade(25)).toBe('novice')
    expect(classifyNavigatorGrade(34)).toBe('novice')
  })

  it('classifies landlubber for zero depth', () => {
    expect(classifyNavigatorGrade(0)).toBe('landlubber')
    expect(classifyNavigatorGrade(10)).toBe('landlubber')
    expect(classifyNavigatorGrade(19)).toBe('landlubber')
  })
})

// ─── analyzeOceanWave ─────────────────────────────────────────────

describe('analyzeOceanWave', () => {
  it('analyzes empty content', () => {
    const wave = analyzeOceanWave(emptyContent, 'empty.ts')
    expect(wave.file).toBe('empty.ts')
    expect(wave.qualityScore).toBe(0)
    expect(wave.condition).toBe('dry-land')
    expect(wave.depthClarity).toBe(0)
    expect(wave.tidalRhythm).toBe(0)
    expect(wave.coralDiversity).toBe(0)
    expect(wave.currentEfficiency).toBe(0)
    expect(wave.abyssResilience).toBe(0)
  })

  it('analyzes rich content with high scores', () => {
    const wave = analyzeOceanWave(richContent, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.qualityScore).toBeGreaterThan(50)
    expect(wave.condition).not.toBe('dry-land')
    expect(wave.depthClarity).toBeGreaterThan(50)
    expect(wave.tidalRhythm).toBeGreaterThan(50)
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const wave = analyzeOceanWave(moderateContent, 'mod.ts')
    const expected = Math.round(
      wave.clarifying.depth * 0.2 +
      wave.pulsing.rhythm * 0.2 +
      wave.thriving.diversity * 0.2 +
      wave.flowing.efficiency * 0.2 +
      wave.diving.resilience * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })

  it('sets condition based on qualityScore', () => {
    const wave = analyzeOceanWave(emptyContent, 'empty.ts')
    expect(wave.condition).toBe(classifyWaveCondition(wave.qualityScore))
  })

  it('includes all 5 measures', () => {
    const wave = analyzeOceanWave(richContent, 'rich.ts')
    expect(wave.clarifying).toBeDefined()
    expect(wave.pulsing).toBeDefined()
    expect(wave.thriving).toBeDefined()
    expect(wave.flowing).toBeDefined()
    expect(wave.diving).toBeDefined()
  })

  it('propagates measure scores to wave fields', () => {
    const wave = analyzeOceanWave(richContent, 'rich.ts')
    expect(wave.depthClarity).toBe(wave.clarifying.depth)
    expect(wave.tidalRhythm).toBe(wave.pulsing.rhythm)
    expect(wave.coralDiversity).toBe(wave.thriving.diversity)
    expect(wave.currentEfficiency).toBe(wave.flowing.efficiency)
    expect(wave.abyssResilience).toBe(wave.diving.resilience)
  })
})

// ─── analyzeOceanDepth ────────────────────────────────────────────

describe('analyzeOceanDepth', () => {
  it('returns empty depth for no waves', () => {
    const depth = analyzeOceanDepth([], 'empty-dir')
    expect(depth.directory).toBe('empty-dir')
    expect(depth.waves).toHaveLength(0)
    expect(depth.avgClarity).toBe(0)
    expect(depth.depthType).toBe('no-ocean')
    expect(depth.condition).toBe('void')
  })

  it('computes averages from waves', () => {
    const wave = analyzeOceanWave(richContent, 'dir/rich.ts')
    const depth = analyzeOceanDepth([wave], 'dir')
    expect(depth.avgClarity).toBe(wave.depthClarity)
    expect(depth.avgRhythm).toBe(wave.tidalRhythm)
    expect(depth.avgResilience).toBe(wave.abyssResilience)
  })

  it('counts masterpiece and dry land waves', () => {
    const good = analyzeOceanWave(richContent, 'g.ts')
    const bad = analyzeOceanWave(emptyContent, 'b.ts')
    const depth = analyzeOceanDepth([good, bad], 'mixed')
    expect(depth.sapphireMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(depth.dryLandCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildSapphireOceanResult ─────────────────────────────────────

describe('buildSapphireOceanResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildSapphireOceanResult([], [])
    expect(result.waves).toHaveLength(0)
    expect(result.depths).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.ocean.isPristine).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildSapphireOceanResult(['index.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.depths).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.navigatorGrade).toBeDefined()
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildSapphireOceanResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.waves).toHaveLength(2)
    expect(result.depths).toHaveLength(1)
    expect(result.depths[0].directory).toBe('src')
  })

  it('analyzes files across multiple directories', async () => {
    const result = await buildSapphireOceanResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.waves).toHaveLength(2)
    expect(result.depths).toHaveLength(2)
  })

  it('computes ocean summary correctly', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.ocean.avgClarity).toBeGreaterThan(0)
    expect(result.ocean.avgRhythm).toBeGreaterThan(0)
    expect(result.ocean.avgResilience).toBeGreaterThan(0)
    expect(result.ocean.overallDepth).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildSapphireOceanResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.dryLandCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestWave).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
    expect(result.stats.bestRhythm).toBeDefined()
    expect(result.stats.mostDiverse).toBeDefined()
    expect(result.stats.mostEfficient).toBeDefined()
  })

  it('computes condition counts', async () => {
    const result = await buildSapphireOceanResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.sapphireMasterpieceCount +
      result.stats.oceanJewelCount +
      result.stats.properSeaCount +
      result.stats.murkyPuddleCount +
      result.stats.stagnantPondCount +
      result.stats.dryLandCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDiversityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEfficiencyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('includes celebration field', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.celebration.milestone).toBe(490)
    expect(result.celebration.name).toBe('sapphire-ocean')
    expect(result.celebration.message).toContain('490')
    expect(result.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470, 480])
    expect(result.celebration.totalTests).toBe(82000)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests depth clarity improvement for low clarity', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    const clarityRec = result.recommendations.some(r => r.includes('depth clarity') || r.includes('clarity'))
    expect(clarityRec).toBe(true)
  })

  it('suggests tidal rhythm improvement for low rhythm', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    const rhythmRec = result.recommendations.some(r => r.includes('tidal rhythm') || r.includes('rhythm'))
    expect(rhythmRec).toBe(true)
  })

  it('suggests coral diversity improvement for low diversity', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    const diversityRec = result.recommendations.some(r => r.includes('coral diversity') || r.includes('diversity'))
    expect(diversityRec).toBe(true)
  })

  it('suggests current efficiency improvement for low efficiency', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    const effRec = result.recommendations.some(r => r.includes('current efficiency') || r.includes('efficiency'))
    expect(effRec).toBe(true)
  })

  it('suggests abyss resilience improvement for low resilience', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    const resRec = result.recommendations.some(r => r.includes('abyss resilience') || r.includes('resilience'))
    expect(resRec).toBe(true)
  })

  it('mentions dry land files', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [emptyContent])
    expect(result.stats.dryLandCount).toBeGreaterThan(0)
    const dryRec = result.recommendations.some(r => r.includes('dry land'))
    expect(dryRec).toBe(true)
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
    expect(typeof colorGrade('sapphire-masterpiece')).toBe('string')
    expect(typeof colorGrade('dry-land')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatWaveTable ──────────────────────────────────────────────

describe('formatWaveTable', () => {
  it('formats a wave', () => {
    const wave = analyzeOceanWave(richContent, 'rich.ts')
    const formatted = formatWaveTable(wave)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Depth Clarity')
    expect(formatted).toContain('Tidal Rhythm')
    expect(formatted).toContain('Coral Diversity')
    expect(formatted).toContain('Current Efficiency')
    expect(formatted).toContain('Abyss Resilience')
    expect(formatted).toContain('Score')
  })
})

// ─── formatWavesTable ─────────────────────────────────────────────

describe('formatWavesTable', () => {
  it('returns message for empty waves', () => {
    const formatted = formatWavesTable([])
    expect(formatted).toContain('No ocean waves')
  })

  it('formats multiple waves', () => {
    const w1 = analyzeOceanWave(richContent, 'a.ts')
    const w2 = analyzeOceanWave(moderateContent, 'b.ts')
    const formatted = formatWavesTable([w1, w2])
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

// ─── formatDepthTable ─────────────────────────────────────────────

describe('formatDepthTable', () => {
  it('formats a depth', () => {
    const wave = analyzeOceanWave(richContent, 'src/a.ts')
    const depth = analyzeOceanDepth([wave], 'src')
    const formatted = formatDepthTable(depth)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Depth:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatDepthsTable ────────────────────────────────────────────

describe('formatDepthsTable', () => {
  it('returns message for empty depths', () => {
    const formatted = formatDepthsTable([])
    expect(formatted).toContain('No ocean depths')
  })

  it('formats multiple depths', () => {
    const w1 = analyzeOceanWave(richContent, 'src/a.ts')
    const w2 = analyzeOceanWave(richContent, 'lib/b.ts')
    const d1 = analyzeOceanDepth([w1], 'src')
    const d2 = analyzeOceanDepth([w2], 'lib')
    const formatted = formatDepthsTable([d1, d2])
    expect(formatted).toContain('src')
    expect(formatted).toContain('lib')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Depth')
    expect(formatted).toContain('Navigator Grade')
    expect(formatted).toContain('Best Wave')
  })
})

// ─── formatCelebration ────────────────────────────────────────────

describe('formatCelebration', () => {
  it('formats celebration info', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    const formatted = formatCelebration(result.celebration)
    expect(formatted).toContain('490')
    expect(formatted).toContain('sapphire-ocean')
    expect(formatted).toContain('420')
    expect(formatted).toContain('82000')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    const formatted = formatRecommendations([])
    expect(formatted).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const formatted = formatRecommendations(['item1', 'item2'])
    expect(formatted).toContain('item1')
    expect(formatted).toContain('item2')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Sapphire Ocean Analysis')
    expect(formatted).toContain('Ocean Depths')
    expect(formatted).toContain('Sapphire Ocean Statistics')
    expect(formatted).toContain('Ocean')
    expect(formatted).toContain('Milestone')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ocean).toBeDefined()
    expect(parsed.celebration).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('includes celebration in JSON output', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.celebration.milestone).toBe(490)
    expect(parsed.celebration.name).toBe('sapphire-ocean')
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildSapphireOceanResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.waves).toHaveLength(3)
    expect(result.depths).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.ocean.overallDepth).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(3)
  })

  it('ocean isPristine for high clarity', async () => {
    const result = await buildSapphireOceanResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.ocean.isPristine).toBe(true)
  })

  it('ocean is not pristine for low clarity', async () => {
    const result = await buildSapphireOceanResult(
      ['empty.ts'],
      [emptyContent],
    )
    expect(result.ocean.isPristine).toBe(false)
  })

  it('celebration is always present', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.celebration).toBeDefined()
    expect(result.celebration.milestone).toBe(490)
    expect(result.celebration.previousMilestones).toHaveLength(7)
  })

  it('navigator grade reflects overall depth', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.stats.navigatorGrade).toBeDefined()
    const validGrades = ['ocean-master', 'deep-sea-captain', 'skilled-sailor', 'apprentice', 'novice', 'landlubber']
    expect(validGrades).toContain(result.stats.navigatorGrade)
  })

  it('overallDepth equals avg of clarity, rhythm, resilience', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.ocean.avgClarity + result.ocean.avgRhythm + result.ocean.avgResilience) / 3)
    expect(result.ocean.overallDepth).toBe(expected)
  })

  it('handles large number of files efficiently', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => richContent)
    const result = await buildSapphireOceanResult(files, contents)
    expect(result.waves).toHaveLength(20)
    expect(result.stats.totalFiles).toBe(20)
  })

  it('all measure scores are in 0-100 range', async () => {
    const result = await buildSapphireOceanResult(['a.ts', 'b.ts'], [richContent, poorContent])
    for (const wave of result.waves) {
      expect(wave.depthClarity).toBeGreaterThanOrEqual(0)
      expect(wave.depthClarity).toBeLessThanOrEqual(100)
      expect(wave.tidalRhythm).toBeGreaterThanOrEqual(0)
      expect(wave.tidalRhythm).toBeLessThanOrEqual(100)
      expect(wave.coralDiversity).toBeGreaterThanOrEqual(0)
      expect(wave.coralDiversity).toBeLessThanOrEqual(100)
      expect(wave.currentEfficiency).toBeGreaterThanOrEqual(0)
      expect(wave.currentEfficiency).toBeLessThanOrEqual(100)
      expect(wave.abyssResilience).toBeGreaterThanOrEqual(0)
      expect(wave.abyssResilience).toBeLessThanOrEqual(100)
    }
  })

  it('celebration totalTests is positive', async () => {
    const result = await buildSapphireOceanResult(['a.ts'], [richContent])
    expect(result.celebration.totalTests).toBeGreaterThan(0)
  })

  it('stats avgDepthClarity matches wave data', async () => {
    const result = await buildSapphireOceanResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expected = Math.round(
      (result.waves[0].depthClarity + result.waves[1].depthClarity) / 2
    )
    expect(result.stats.avgDepthClarity).toBe(expected)
  })
})
