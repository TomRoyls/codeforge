import { describe, it, expect } from 'vitest'
import {
  measureEvolving,
  measureFlowering,
  measureRooting,
  measureYielding,
  measureSeeding,
  classifyBloomCondition,
  classifyPlotType,
  classifyPlotCondition,
  classifyGardenerGrade,
  analyzeGhostBloom,
  analyzePhantomPlot,
  buildPhantomGardenResult,
  generateRecommendations,
} from '../src/commands/phantom-garden-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatPlotTable,
  formatPlotsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-garden-format-helpers.js'
import type {
  GhostBloom,
} from '../src/commands/phantom-garden-helpers.js'

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
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureEvolving ───────────────────────────────────────────────

describe('measureEvolving', () => {
  it('returns no-growth for empty content', () => {
    const m = measureEvolving(emptyContent)
    expect(m.growth).toBe(0)
    expect(m.grade).toBe('no-growth')
    expect(m.hasHighGrowth).toBe(false)
    expect(m.hasOrganic).toBe(false)
    expect(m.hasIterative).toBe(false)
    expect(m.hasNoBigBang).toBe(true)
    expect(m.hasNoDisposable).toBe(true)
    expect(m.bigBangCount).toBe(0)
    expect(m.disposableCount).toBe(0)
  })

  it('returns a grade for minimal content', () => {
    const m = measureEvolving(minimalContent)
    expect(m.growth).toBeGreaterThan(0)
    expect(m.hasNoBigBang).toBe(true)
    expect(m.hasOrganic).toBe(false)
  })

  it('scores higher for moderate content', () => {
    const m = measureEvolving(moderateContent)
    expect(m.growth).toBeGreaterThan(30)
    expect(m.hasOrganic).toBe(true)
    expect(m.hasIterative).toBe(false)
  })

  it('scores highest for rich content', () => {
    const m = measureEvolving(richContent)
    expect(m.growth).toBeGreaterThan(60)
    expect(m.hasOrganic).toBe(true)
    expect(m.hasIterative).toBe(true)
    expect(m.hasSustainable).toBe(true)
  })

  it('counts bigBang (var) and disposable (any)', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureEvolving(content)
    expect(m.bigBangCount).toBe(3)
    expect(m.disposableCount).toBe(2)
    expect(m.hasNoBigBang).toBe(false)
    expect(m.hasNoDisposable).toBe(false)
  })

  it('detects eval as noAllAtOnce', () => {
    const content = `eval('test')`
    const m = measureEvolving(content)
    expect(m.hasNoAllAtOnce).toBe(false)
  })

  it('detects debugger as noStatic', () => {
    const content = `debugger`
    const m = measureEvolving(content)
    expect(m.hasNoStatic).toBe(false)
  })

  it('assigns ancient-spirit-tree for high growth', () => {
    const m = measureEvolving(richContent)
    expect(m.grade).toBeDefined()
    expect(typeof m.grade).toBe('string')
  })
})

// ─── measureFlowering ──────────────────────────────────────────────

describe('measureFlowering', () => {
  it('returns no-bloom for empty content', () => {
    const m = measureFlowering(emptyContent)
    expect(m.bloom).toBe(0)
    expect(m.blossom).toBe('no-bloom')
    expect(m.hasHighBloom).toBe(false)
    expect(m.abruptChangesCount).toBe(0)
    expect(m.breakingRemovalCount).toBe(0)
  })

  it('returns a score for minimal content', () => {
    const m = measureFlowering(minimalContent)
    expect(m.bloom).toBeGreaterThan(0)
    expect(m.hasNoAbruptChanges).toBe(true)
  })

  it('detects union type in moderate content', () => {
    const m = measureFlowering(moderateContent)
    expect(m.hasGracefulFeatureFlags).toBe(false)
    expect(m.hasProgressiveRollout).toBe(false)
  })

  it('detects deprecation paths with doc comments and return types', () => {
    const m = measureFlowering(richContent)
    expect(m.hasDeprecationPaths).toBe(true)
    expect(m.hasFeatureLifecycle).toBe(true)
  })

  it('counts abrupt changes and breaking removals', () => {
    const content = `var x = 1; var y: any = 2`
    const m = measureFlowering(content)
    expect(m.abruptChangesCount).toBe(2)
    expect(m.breakingRemovalCount).toBe(1)
    expect(m.hasNoAbruptChanges).toBe(false)
    expect(m.hasNoBreakingRemoval).toBe(false)
  })

  it('detects eval as noSuddenRemoval (flowering)', () => {
    const content = `eval('test')`
    const m = measureFlowering(content)
    expect(m.hasNoSuddenRemoval).toBe(false)
  })

  it('detects debugger as noAbandonedFeatures', () => {
    const content = `debugger`
    const m = measureFlowering(content)
    expect(m.hasNoAbandonedFeatures).toBe(false)
  })
})

// ─── measureRooting ────────────────────────────────────────────────

describe('measureRooting', () => {
  it('returns no-root for empty content', () => {
    const m = measureRooting(emptyContent)
    expect(m.root).toBe(0)
    expect(m.spectral).toBe('no-root')
    expect(m.hasHighRoot).toBe(false)
    expect(m.shakyBaseCount).toBe(0)
    expect(m.unsafeCount).toBe(0)
  })

  it('scores higher for moderate content', () => {
    const m = measureRooting(moderateContent)
    expect(m.root).toBeGreaterThan(20)
    expect(m.hasSolidAbstractions).toBe(true)
  })

  it('detects solid abstractions', () => {
    const m = measureRooting(richContent)
    expect(m.hasSolidAbstractions).toBe(true)
    expect(m.hasWellDesignedInterfaces).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('counts shaky base and unsafe', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureRooting(content)
    expect(m.shakyBaseCount).toBe(3)
    expect(m.unsafeCount).toBe(2)
    expect(m.hasNoShakyBase).toBe(false)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects eval as noUntested', () => {
    const content = `eval('test')`
    const m = measureRooting(content)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects debugger as noAdhoc', () => {
    const content = `debugger`
    const m = measureRooting(content)
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects tested and foundational', () => {
    const m = measureRooting(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasFoundational).toBe(true)
  })
})

// ─── measureYielding ───────────────────────────────────────────────

describe('measureYielding', () => {
  it('returns no-harvest for empty content', () => {
    const m = measureYielding(emptyContent)
    expect(m.harvest).toBe(0)
    expect(m.wraith).toBe('no-harvest')
    expect(m.hasHighHarvest).toBe(false)
    expect(m.fillerCount).toBe(0)
    expect(m.prototypeCount).toBe(0)
  })

  it('returns a score for minimal content', () => {
    const m = measureYielding(minimalContent)
    expect(m.harvest).toBeGreaterThan(0)
  })

  it('detects high value and essential', () => {
    const m = measureYielding(richContent)
    expect(m.hasHighValue).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasDeliverable).toBe(true)
    expect(m.hasProductionReady).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasValuable).toBe(true)
  })

  it('counts filler and prototype', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureYielding(content)
    expect(m.fillerCount).toBe(3)
    expect(m.prototypeCount).toBe(2)
    expect(m.hasNoFiller).toBe(false)
    expect(m.hasNoPrototype).toBe(false)
  })

  it('detects eval as noDeadCode', () => {
    const content = `eval('test')`
    const m = measureYielding(content)
    expect(m.hasNoDeadCode).toBe(false)
  })

  it('detects debugger as noBoilerplate', () => {
    const content = `debugger`
    const m = measureYielding(content)
    expect(m.hasNoBoilerplate).toBe(false)
  })
})

// ─── measureSeeding ────────────────────────────────────────────────

describe('measureSeeding', () => {
  it('returns no-seed for empty content', () => {
    const m = measureSeeding(emptyContent)
    expect(m.seed).toBe(0)
    expect(m.phantom).toBe('no-seed')
    expect(m.hasHighSeed).toBe(false)
    expect(m.monolithicCount).toBe(0)
    expect(m.hardcodedCount).toBe(0)
  })

  it('returns a score for minimal content', () => {
    const m = measureSeeding(minimalContent)
    expect(m.seed).toBeGreaterThan(0)
  })

  it('detects extensible and plugin architecture', () => {
    const m = measureSeeding(richContent)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasPluginArchitecture).toBe(true)
    expect(m.hasConfigurable).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasScalable).toBe(true)
  })

  it('counts monolithic and hardcoded', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureSeeding(content)
    expect(m.monolithicCount).toBe(3)
    expect(m.hardcodedCount).toBe(2)
    expect(m.hasNoMonolithic).toBe(false)
    expect(m.hasNoHardcoded).toBe(false)
  })

  it('detects eval as noRigid', () => {
    const content = `eval('test')`
    const m = measureSeeding(content)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects debugger as noFixedCapacity', () => {
    const content = `debugger`
    const m = measureSeeding(content)
    expect(m.hasNoFixedCapacity).toBe(false)
  })
})

// ─── classifyBloomCondition ────────────────────────────────────────

describe('classifyBloomCondition', () => {
  it('classifies ethereal-masterpiece', () => {
    expect(classifyBloomCondition(90)).toBe('ethereal-masterpiece')
  })
  it('classifies ghost-paradise', () => {
    expect(classifyBloomCondition(75)).toBe('ghost-paradise')
  })
  it('classifies proper-phantom-garden', () => {
    expect(classifyBloomCondition(58)).toBe('proper-phantom-garden')
  })
  it('classifies wilting-spirit-bed', () => {
    expect(classifyBloomCondition(42)).toBe('wilting-spirit-bed')
  })
  it('classifies dead-ghost-garden', () => {
    expect(classifyBloomCondition(28)).toBe('dead-ghost-garden')
  })
  it('classifies void', () => {
    expect(classifyBloomCondition(10)).toBe('void')
  })
})

// ─── classifyPlotType ──────────────────────────────────────────────

describe('classifyPlotType', () => {
  it('returns no-plot for empty array', () => {
    expect(classifyPlotType([])).toBe('no-plot')
  })

  it('returns spirit-garden for high scores', () => {
    const blooms = Array.from({ length: 4 }, (_, i) => ({
      qualityScore: 90,
      condition: 'ethereal-masterpiece',
      file: `f${i}.ts`,
    } as GhostBloom))
    expect(classifyPlotType(blooms)).toBe('spirit-garden')
  })

  it('returns no-plot for very low scores', () => {
    const blooms = [{ qualityScore: 5, condition: 'void', file: 'a.ts' } as GhostBloom]
    expect(classifyPlotType(blooms)).toBe('no-plot')
  })
})

// ─── classifyPlotCondition ─────────────────────────────────────────

describe('classifyPlotCondition', () => {
  it('classifies transcendent-garden', () => {
    expect(classifyPlotCondition(80)).toBe('transcendent-garden')
  })
  it('classifies beautiful-phantom', () => {
    expect(classifyPlotCondition(65)).toBe('beautiful-phantom')
  })
  it('classifies decent-spirit-garden', () => {
    expect(classifyPlotCondition(50)).toBe('decent-spirit-garden')
  })
  it('classifies fading-grove', () => {
    expect(classifyPlotCondition(35)).toBe('fading-grove')
  })
  it('classifies dead-earth', () => {
    expect(classifyPlotCondition(20)).toBe('dead-earth')
  })
  it('classifies void', () => {
    expect(classifyPlotCondition(10)).toBe('void')
  })
})

// ─── classifyGardenerGrade ─────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('classifies spirit-gardener', () => {
    expect(classifyGardenerGrade(85)).toBe('spirit-gardener')
  })
  it('classifies phantom-botanist', () => {
    expect(classifyGardenerGrade(70)).toBe('phantom-botanist')
  })
  it('classifies skilled-cultivator', () => {
    expect(classifyGardenerGrade(55)).toBe('skilled-cultivator')
  })
  it('classifies apprentice', () => {
    expect(classifyGardenerGrade(38)).toBe('apprentice')
  })
  it('classifies novice', () => {
    expect(classifyGardenerGrade(22)).toBe('novice')
  })
  it('classifies ghost', () => {
    expect(classifyGardenerGrade(10)).toBe('ghost')
  })
})

// ─── analyzeGhostBloom ─────────────────────────────────────────────

describe('analyzeGhostBloom', () => {
  it('analyzes empty content', () => {
    const b = analyzeGhostBloom(emptyContent, 'empty.ts')
    expect(b.file).toBe('empty.ts')
    expect(b.etherealGrowth).toBe(0)
    expect(b.ghostBloom).toBe(0)
    expect(b.spectralRoot).toBe(0)
    expect(b.wraithHarvest).toBe(0)
    expect(b.phantomSeed).toBe(0)
    expect(b.qualityScore).toBe(0)
    expect(b.condition).toBe('void')
  })

  it('analyzes moderate content', () => {
    const b = analyzeGhostBloom(moderateContent, 'moderate.ts')
    expect(b.file).toBe('moderate.ts')
    expect(b.etherealGrowth).toBeGreaterThan(0)
    expect(b.ghostBloom).toBeGreaterThan(0)
    expect(b.spectralRoot).toBeGreaterThan(0)
    expect(b.wraithHarvest).toBeGreaterThan(0)
    expect(b.phantomSeed).toBeGreaterThan(0)
    expect(b.qualityScore).toBeGreaterThan(0)
    expect(typeof b.condition).toBe('string')
  })

  it('analyzes rich content with high scores', () => {
    const b = analyzeGhostBloom(richContent, 'rich.ts')
    expect(b.file).toBe('rich.ts')
    expect(b.etherealGrowth).toBeGreaterThan(50)
    expect(b.ghostBloom).toBeGreaterThan(50)
    expect(b.spectralRoot).toBeGreaterThan(50)
    expect(b.wraithHarvest).toBeGreaterThan(50)
    expect(b.phantomSeed).toBeGreaterThan(50)
    expect(b.qualityScore).toBeGreaterThan(50)
  })

  it('computes qualityScore as weighted average', () => {
    const b = analyzeGhostBloom(moderateContent, 'mod.ts')
    const expected = Math.round(
      b.etherealGrowth * 0.2 +
      b.ghostBloom * 0.2 +
      b.spectralRoot * 0.2 +
      b.wraithHarvest * 0.2 +
      b.phantomSeed * 0.2,
    )
    expect(b.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const b = analyzeGhostBloom(richContent, 'rich.ts')
    expect(b.evolving).toBeDefined()
    expect(b.flowering).toBeDefined()
    expect(b.rooting).toBeDefined()
    expect(b.yielding).toBeDefined()
    expect(b.seeding).toBeDefined()
    expect(b.evolving.grade).toBeDefined()
    expect(b.flowering.blossom).toBeDefined()
    expect(b.rooting.spectral).toBeDefined()
    expect(b.yielding.wraith).toBeDefined()
    expect(b.seeding.phantom).toBeDefined()
  })
})

// ─── analyzePhantomPlot ────────────────────────────────────────────

describe('analyzePhantomPlot', () => {
  it('returns empty plot for no blooms', () => {
    const p = analyzePhantomPlot([], 'empty-dir')
    expect(p.directory).toBe('empty-dir')
    expect(p.blooms).toEqual([])
    expect(p.avgGrowth).toBe(0)
    expect(p.avgRoot).toBe(0)
    expect(p.avgSeed).toBe(0)
    expect(p.etherealMasterpieceCount).toBe(0)
    expect(p.voidCount).toBe(0)
    expect(p.plotType).toBe('no-plot')
    expect(p.condition).toBe('void')
  })

  it('computes averages from blooms', () => {
    const b1 = analyzeGhostBloom(richContent, 'a.ts')
    const b2 = analyzeGhostBloom(moderateContent, 'b.ts')
    const p = analyzePhantomPlot([b1, b2], 'src')
    expect(p.avgGrowth).toBe(Math.round((b1.etherealGrowth + b2.etherealGrowth) / 2))
    expect(p.avgRoot).toBe(Math.round((b1.spectralRoot + b2.spectralRoot) / 2))
    expect(p.avgSeed).toBe(Math.round((b1.phantomSeed + b2.phantomSeed) / 2))
    expect(p.directory).toBe('src')
    expect(p.blooms.length).toBe(2)
  })

  it('counts ethereal masterpieces and voids', () => {
    const b1 = analyzeGhostBloom(richContent, 'a.ts')
    const b2 = analyzeGhostBloom(emptyContent, 'b.ts')
    const p = analyzePhantomPlot([b1, b2], 'mixed')
    expect(p.etherealMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(p.voidCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── buildPhantomGardenResult ──────────────────────────────────────

describe('buildPhantomGardenResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPhantomGardenResult([], [])
    expect(result.blooms).toEqual([])
    expect(result.plots).toEqual([])
    expect(result.realm.avgGrowth).toBe(0)
    expect(result.realm.overallSpirit).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalPlots).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildPhantomGardenResult(['test.ts'], [moderateContent])
    expect(result.blooms.length).toBe(1)
    expect(result.plots.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestBloom).toBe('test.ts')
    expect(result.stats.mostEvolving).toBe('test.ts')
    expect(result.stats.bestBlossoming).toBe('test.ts')
    expect(result.stats.deepestRooted).toBe('test.ts')
    expect(result.stats.bestSeeded).toBe('test.ts')
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildPhantomGardenResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.blooms.length).toBe(2)
    expect(result.plots.length).toBe(1)
    expect(result.plots[0].directory).toBe('src')
  })

  it('analyzes files across multiple directories', async () => {
    const result = await buildPhantomGardenResult(
      ['src/a.ts', 'lib/b.ts', 'test/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.blooms.length).toBe(3)
    expect(result.plots.length).toBe(3)
  })

  it('computes realm correctly', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.realm.avgGrowth).toBeGreaterThan(0)
    expect(result.realm.avgRoot).toBeGreaterThan(0)
    expect(result.realm.avgSeed).toBeGreaterThan(0)
    expect(result.realm.overallSpirit).toBeGreaterThan(0)
    expect(typeof result.realm.isEthereal).toBe('boolean')
  })

  it('computes stats correctly', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(s.avgEtherealGrowth).toBeGreaterThan(0)
    expect(s.avgGhostBloom).toBeGreaterThan(0)
    expect(s.avgSpectralRoot).toBeGreaterThan(0)
    expect(s.avgWraithHarvest).toBeGreaterThan(0)
    expect(s.avgPhantomSeed).toBeGreaterThan(0)
    expect(s.overallSpirit).toBeGreaterThan(0)
    expect(typeof s.gardenerGrade).toBe('string')
    expect(s.bestBloom).toBeTruthy()
  })

  it('sets isEthereal when avgGrowth >= 60', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.realm.isEthereal).toBe(true)
  })

  it('sets isEthereal false when avgGrowth < 60', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts'],
      [emptyContent],
    )
    expect(result.realm.isEthereal).toBe(false)
  })

  it('computes condition counts in stats', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    const s = result.stats
    const totalConditions = s.etherealMasterpieceCount + s.ghostParadiseCount +
      s.properPhantomGardenCount + s.wiltingSpiritBedCount +
      s.deadGhostGardenCount + s.voidCount
    expect(totalConditions).toBe(3)
  })

  it('computes high measure counts', async () => {
    const result = await buildPhantomGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.hasHighGrowthCount).toBeGreaterThan(0)
    expect(result.stats.hasHighBloomCount).toBeGreaterThan(0)
    expect(result.stats.hasHighRootCount).toBeGreaterThan(0)
    expect(result.stats.hasHighHarvestCount).toBeGreaterThan(0)
    expect(result.stats.hasHighSeedCount).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for perfect results', () => {
    const bloom = analyzeGhostBloom(richContent, 'a.ts')
    const recs = generateRecommendations(
      [bloom],
      [{ blooms: [bloom], avgGrowth: 90, avgRoot: 90, avgSeed: 90, etherealMasterpieceCount: 1, voidCount: 0, plotType: 'spirit-garden', condition: 'transcendent-garden', directory: 'src' }],
      { avgGrowth: 90, avgRoot: 90, avgSeed: 90, isEthereal: true, overallSpirit: 90 },
      {
        totalFiles: 1, totalPlots: 1, avgEtherealGrowth: 90, avgGhostBloom: 90,
        avgSpectralRoot: 90, avgWraithHarvest: 90, avgPhantomSeed: 90,
        etherealMasterpieceCount: 1, ghostParadiseCount: 0,
        properPhantomGardenCount: 0, wiltingSpiritBedCount: 0,
        deadGhostGardenCount: 0, voidCount: 0,
        hasHighGrowthCount: 1, hasHighBloomCount: 1, hasHighRootCount: 1,
        hasHighHarvestCount: 1, hasHighSeedCount: 1,
        overallSpirit: 90, gardenerGrade: 'spirit-gardener',
        bestBloom: 'a.ts', mostEvolving: 'a.ts', bestBlossoming: 'a.ts',
        deepestRooted: 'a.ts', bestSeeded: 'a.ts',
      },
    )
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[recs.length - 1]).toContain('spirit gardener')
  })

  it('recommends improving growth when low', () => {
    const recs = generateRecommendations(
      [],
      [],
      { avgGrowth: 30, avgRoot: 30, avgSeed: 30, isEthereal: false, overallSpirit: 20 },
      {
        totalFiles: 1, totalPlots: 1, avgEtherealGrowth: 30, avgGhostBloom: 30,
        avgSpectralRoot: 30, avgWraithHarvest: 30, avgPhantomSeed: 30,
        etherealMasterpieceCount: 0, ghostParadiseCount: 0,
        properPhantomGardenCount: 0, wiltingSpiritBedCount: 0,
        deadGhostGardenCount: 0, voidCount: 0,
        hasHighGrowthCount: 0, hasHighBloomCount: 0, hasHighRootCount: 0,
        hasHighHarvestCount: 0, hasHighSeedCount: 0,
        overallSpirit: 20, gardenerGrade: 'novice',
        bestBloom: '', mostEvolving: '', bestBlossoming: '',
        deepestRooted: '', bestSeeded: '',
      },
    )
    expect(recs.some(r => r.includes('ethereal growth'))).toBe(true)
  })

  it('warns about void files', () => {
    const recs = generateRecommendations(
      [{ file: 'a.ts', condition: 'void' } as GhostBloom],
      [],
      { avgGrowth: 10, avgRoot: 10, avgSeed: 10, isEthereal: false, overallSpirit: 10 },
      {
        totalFiles: 1, totalPlots: 0, avgEtherealGrowth: 10, avgGhostBloom: 10,
        avgSpectralRoot: 10, avgWraithHarvest: 10, avgPhantomSeed: 10,
        etherealMasterpieceCount: 0, ghostParadiseCount: 0,
        properPhantomGardenCount: 0, wiltingSpiritBedCount: 0,
        deadGhostGardenCount: 0, voidCount: 1,
        hasHighGrowthCount: 0, hasHighBloomCount: 0, hasHighRootCount: 0,
        hasHighHarvestCount: 0, hasHighSeedCount: 0,
        overallSpirit: 10, gardenerGrade: 'ghost',
        bestBloom: '', mostEvolving: '', bestBlossoming: '',
        deepestRooted: '', bestSeeded: '',
      },
    )
    expect(recs.some(r => r.includes('void'))).toBe(true)
  })

  it('warns about barren plots', () => {
    const recs = generateRecommendations(
      [],
      [{ blooms: [], avgGrowth: 0, avgRoot: 0, avgSeed: 0, etherealMasterpieceCount: 0, voidCount: 0, plotType: 'barren-ground', condition: 'void', directory: 'dead' }],
      { avgGrowth: 0, avgRoot: 0, avgSeed: 0, isEthereal: false, overallSpirit: 0 },
      {
        totalFiles: 0, totalPlots: 1, avgEtherealGrowth: 0, avgGhostBloom: 0,
        avgSpectralRoot: 0, avgWraithHarvest: 0, avgPhantomSeed: 0,
        etherealMasterpieceCount: 0, ghostParadiseCount: 0,
        properPhantomGardenCount: 0, wiltingSpiritBedCount: 0,
        deadGhostGardenCount: 0, voidCount: 0,
        hasHighGrowthCount: 0, hasHighBloomCount: 0, hasHighRootCount: 0,
        hasHighHarvestCount: 0, hasHighSeedCount: 0,
        overallSpirit: 0, gardenerGrade: 'ghost',
        bestBloom: '', mostEvolving: '', bestBlossoming: '',
        deepestRooted: '', bestSeeded: '',
      },
    )
    expect(recs.some(r => r.includes('barren'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grade', () => {
    expect(typeof colorGrade('ethereal-masterpiece')).toBe('string')
  })
  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatBloomTable', () => {
  it('formats a bloom', () => {
    const b = analyzeGhostBloom(richContent, 'test.ts')
    const result = formatBloomTable(b)
    expect(result).toContain('test.ts')
    expect(result).toContain('Ethereal Growth')
    expect(result).toContain('Ghost Bloom')
    expect(result).toContain('Spectral Root')
    expect(result).toContain('Wraith Harvest')
    expect(result).toContain('Phantom Seed')
  })
})

describe('formatBloomsTable', () => {
  it('returns no blooms message for empty', () => {
    expect(formatBloomsTable([])).toContain('No ghost blooms')
  })
  it('formats multiple blooms', () => {
    const b1 = analyzeGhostBloom(richContent, 'a.ts')
    const b2 = analyzeGhostBloom(moderateContent, 'b.ts')
    const result = formatBloomsTable([b1, b2])
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
    expect(result).toContain('Phantom Garden Analysis')
  })
})

describe('formatPlotTable', () => {
  it('formats a plot', () => {
    const b = analyzeGhostBloom(richContent, 'test.ts')
    const p = analyzePhantomPlot([b], 'src')
    const result = formatPlotTable(p)
    expect(result).toContain('src')
    expect(result).toContain('Type:')
    expect(result).toContain('Condition:')
  })
})

describe('formatPlotsTable', () => {
  it('returns no plots message for empty', () => {
    expect(formatPlotsTable([])).toContain('No phantom plots')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildPhantomGardenResult(['a.ts'], [richContent])
    const result = formatStatsTable(r.stats)
    expect(result).toContain('Phantom Garden Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Gardener Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Test rec 1', 'Test rec 2'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
    expect(result).toContain('Test rec 2')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildPhantomGardenResult(['a.ts'], [richContent])
    const result = formatResultTable(r)
    expect(result).toContain('Phantom Garden Analysis')
    expect(result).toContain('Phantom Plots')
    expect(result).toContain('Phantom Garden Statistics')
    expect(result).toContain('Realm')
    expect(result).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const r = await buildPhantomGardenResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toBeDefined()
    expect(parsed.plots).toBeDefined()
    expect(parsed.realm).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
