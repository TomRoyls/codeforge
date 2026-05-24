import { describe, expect, it } from 'vitest'

import {
  analyzeCaveCrystal,
  analyzeCaveSystem,
  buildCrystalCaveResult,
  classifyCrystalCondition,
  classifyExplorerGrade,
  classifySystemCondition,
  classifySystemType,
  generateRecommendations,
  measureDeepening,
  measureDiversifying,
  measureForming,
  measureHanging,
  measureResonating,
  type CaveCrystal,
  type CaveSystem,
  type CrystalCaveStats,
  type UndergroundSummary,
} from '../src/commands/crystal-cave-helpers.js'
import {
  colorGrade,
  colorScore,
  formatCrystalTable,
  formatCrystalsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatSystemTable,
  formatSystemsTable,
} from '../src/commands/crystal-cave-format-helpers.js'

// ─── Test Content Fixtures ────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Config } from './types.js'

/** Read config from disk */
export async function readConfig(path: string): Promise<Config> {
  const raw = readFileSync(path, 'utf8')
  const parsed = JSON.parse(raw)
  if (typeof parsed !== 'object') {
    throw new Error('Invalid config')
  }
  return parsed as Config
}

export class ConfigManager {
  private readonly configs: Map<string, Config> = new Map()

  add(key: string, config: Config): void {
    this.configs.set(key, config)
  }

  get(key: string): Config | undefined {
    return this.configs.get(key)
  }
}

export type { Config }
export interface ConfigOpts { debug: boolean; verbose: boolean }
export const DEFAULT_OPTS: ConfigOpts = { debug: false, verbose: false }
`

const minimalContent = `var x = 1
var y = 2
any
`

const emptyContent = ''

const moderateContent = `import { something } from './mod.js'
export const name = 'test'
export function hello(): string {
  return 'hello'
}
`

// ─── measureForming ───────────────────────────────────────────────

describe('measureForming', () => {
  it('returns high quality for rich content', () => {
    const m = measureForming(richContent)
    expect(m.quality).toBeGreaterThan(60)
    expect(m.hasStructured).toBe(true)
    expect(m.hasOrganized).toBe(true)
  })

  it('returns low quality for minimal content', () => {
    const m = measureForming(minimalContent)
    expect(m.quality).toBeLessThan(30)
  })

  it('returns 0 quality for empty content', () => {
    const m = measureForming(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-formation')
  })

  it('detects chaotic patterns', () => {
    const m = measureForming(minimalContent)
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.randomCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
    expect(m.hasNoRandom).toBe(false)
  })

  it('detects no chaotic patterns in clean code', () => {
    const m = measureForming(richContent)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoRandom).toBe(true)
  })

  it('classifies grade based on quality', () => {
    const m = measureForming(richContent)
    expect(m.grade).toBe('geode-perfect')
  })

  it('sets hasHighQuality when quality >= 70', () => {
    const m = measureForming(richContent)
    expect(m.hasHighQuality).toBe(true)
  })

  it('has ordered patterns', () => {
    const m = measureForming(richContent)
    expect(m.hasOrdered).toBe(true)
  })

  it('has systematic patterns', () => {
    const m = measureForming(richContent)
    expect(m.hasSystematic).toBe(true)
  })

  it('has patterned patterns', () => {
    const m = measureForming(richContent)
    expect(m.hasPatterned).toBe(true)
  })

  it('has regular patterns when type alias present', () => {
    const content = `${richContent}\ntype Options = { debug: boolean }`
    const m = measureForming(content)
    expect(m.hasRegular).toBe(true)
  })

  it('has no regular patterns without type alias', () => {
    const m = measureForming(richContent)
    expect(m.hasRegular).toBe(false)
  })
})

// ─── measureHanging ───────────────────────────────────────────────

describe('measureHanging', () => {
  it('returns precision above 60 for rich content', () => {
    const m = measureHanging(richContent)
    expect(m.precision).toBeGreaterThan(60)
  })

  it('detects exact patterns when strict-eq and readonly present', () => {
    const content = `${richContent}\nif (x === 'test') {}`
    const m = measureHanging(content)
    expect(m.hasAccurate).toBe(true)
  })

  it('detects exact patterns when return type and readonly present', () => {
    const m = measureHanging(richContent)
    expect(m.hasExact).toBe(true)
  })

  it('returns low precision for minimal content', () => {
    const m = measureHanging(minimalContent)
    expect(m.precision).toBeLessThan(30)
  })

  it('returns 0 precision for empty content', () => {
    const m = measureHanging(emptyContent)
    expect(m.precision).toBe(0)
    expect(m.stalactite).toBe('no-formation')
  })

  it('detects imprecise patterns', () => {
    const m = measureHanging(minimalContent)
    expect(m.impreciseCount).toBeGreaterThan(0)
    expect(m.scatteredCount).toBeGreaterThan(0)
  })

  it('classifies stalactite grade', () => {
    const m = measureHanging(richContent)
    expect(m.stalactite).toBe('perfect-drop')
  })

  it('sets hasHighPrecision when precision >= 70', () => {
    const m = measureHanging(richContent)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('detects targeted patterns', () => {
    const m = measureHanging(richContent)
    expect(m.hasTargeted).toBe(true)
  })

  it('detects focused patterns', () => {
    const m = measureHanging(richContent)
    expect(m.hasFocused).toBe(true)
  })

  it('detects deliberate patterns when type alias and strict-eq present', () => {
    const content = `${richContent}\ntype Options = { debug: boolean }\nif (x === 1) {}`
    const m = measureHanging(content)
    expect(m.hasDeliberate).toBe(true)
  })
})

// ─── measureDeepening ─────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns high depth for rich content', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBeGreaterThan(60)
    expect(m.hasDeep).toBe(true)
  })

  it('returns low depth for minimal content', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBeLessThan(30)
  })

  it('returns 0 depth for empty content', () => {
    const m = measureDeepening(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.grotto).toBe('no-depth')
  })

  it('detects shallow patterns', () => {
    const m = measureDeepening(minimalContent)
    expect(m.shallowCount).toBeGreaterThan(0)
    expect(m.flatCount).toBeGreaterThan(0)
  })

  it('classifies grotto grade', () => {
    const m = measureDeepening(richContent)
    expect(m.grotto).toBe('deep-cavern')
  })

  it('sets hasHighDepth when depth >= 70', () => {
    const m = measureDeepening(richContent)
    expect(m.hasHighDepth).toBe(true)
  })

  it('detects profound patterns', () => {
    const m = measureDeepening(richContent)
    expect(m.hasProfound).toBe(true)
  })

  it('detects layered patterns', () => {
    const m = measureDeepening(richContent)
    expect(m.hasLayered).toBe(true)
  })

  it('detects complex patterns', () => {
    const m = measureDeepening(richContent)
    expect(m.hasComplex).toBe(true)
  })

  it('detects rich patterns when type alias present', () => {
    const content = `${richContent}\ntype Options = { debug: boolean }`
    const m = measureDeepening(content)
    expect(m.hasRich).toBe(true)
  })
})

// ─── measureDiversifying ──────────────────────────────────────────

describe('measureDiversifying', () => {
  it('returns high diversity for rich content', () => {
    const m = measureDiversifying(richContent)
    expect(m.diversity).toBeGreaterThan(60)
    expect(m.hasVaried).toBe(true)
  })

  it('returns low diversity for minimal content', () => {
    const m = measureDiversifying(minimalContent)
    expect(m.diversity).toBeLessThan(30)
  })

  it('returns 0 diversity for empty content', () => {
    const m = measureDiversifying(emptyContent)
    expect(m.diversity).toBe(0)
    expect(m.mineral).toBe('no-variety')
  })

  it('detects uniform patterns', () => {
    const m = measureDiversifying(minimalContent)
    expect(m.uniformCount).toBeGreaterThan(0)
  })

  it('classifies mineral grade', () => {
    const m = measureDiversifying(richContent)
    expect(m.mineral).toBe('rainbow-cave')
  })

  it('sets hasHighDiversity when diversity >= 70', () => {
    const m = measureDiversifying(richContent)
    expect(m.hasHighDiversity).toBe(true)
  })

  it('detects diverse patterns', () => {
    const m = measureDiversifying(richContent)
    expect(m.hasDiverse).toBe(true)
  })

  it('detects colorful patterns when class and type alias present', () => {
    const content = `${richContent}\ntype Options = { debug: boolean }`
    const m = measureDiversifying(content)
    expect(m.hasColorful).toBe(true)
  })

  it('detects abundant patterns', () => {
    const m = measureDiversifying(richContent)
    expect(m.hasAbundant).toBe(true)
  })
})

// ─── measureResonating ────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns high resonance for rich content', () => {
    const m = measureResonating(richContent)
    expect(m.resonance).toBeGreaterThan(60)
    expect(m.hasHarmonious).toBe(true)
  })

  it('returns low resonance for minimal content', () => {
    const m = measureResonating(minimalContent)
    expect(m.resonance).toBeLessThan(30)
  })

  it('returns 0 resonance for empty content', () => {
    const m = measureResonating(emptyContent)
    expect(m.resonance).toBe(0)
    expect(m.chamber).toBe('silent')
  })

  it('detects isolated patterns', () => {
    const m = measureResonating(minimalContent)
    expect(m.isolatedCount).toBeGreaterThan(0)
  })

  it('classifies chamber grade', () => {
    const m = measureResonating(richContent)
    expect(m.chamber).toBe('concert-hall')
  })

  it('sets hasHighResonance when resonance >= 70', () => {
    const m = measureResonating(richContent)
    expect(m.hasHighResonance).toBe(true)
  })

  it('detects integrated patterns', () => {
    const m = measureResonating(richContent)
    expect(m.hasIntegrated).toBe(true)
  })

  it('detects connected patterns', () => {
    const m = measureResonating(richContent)
    expect(m.hasConnected).toBe(true)
  })

  it('detects coupled patterns', () => {
    const m = measureResonating(richContent)
    expect(m.hasCoupled).toBe(true)
  })

  it('detects sounding patterns', () => {
    const m = measureResonating(richContent)
    expect(m.hasSounding).toBe(true)
  })
})

// ─── classifyCrystalCondition ─────────────────────────────────────

describe('classifyCrystalCondition', () => {
  it('returns cathedral-cave for 85+', () => {
    expect(classifyCrystalCondition(90)).toBe('cathedral-cave')
    expect(classifyCrystalCondition(85)).toBe('cathedral-cave')
  })

  it('returns crystal-grotto for 70-84', () => {
    expect(classifyCrystalCondition(75)).toBe('crystal-grotto')
    expect(classifyCrystalCondition(70)).toBe('crystal-grotto')
  })

  it('returns proper-cave for 55-69', () => {
    expect(classifyCrystalCondition(60)).toBe('proper-cave')
    expect(classifyCrystalCondition(55)).toBe('proper-cave')
  })

  it('returns limestone-hollow for 40-54', () => {
    expect(classifyCrystalCondition(45)).toBe('limestone-hollow')
    expect(classifyCrystalCondition(40)).toBe('limestone-hollow')
  })

  it('returns mud-cave for 25-39', () => {
    expect(classifyCrystalCondition(30)).toBe('mud-cave')
    expect(classifyCrystalCondition(25)).toBe('mud-cave')
  })

  it('returns no-cave for below 25', () => {
    expect(classifyCrystalCondition(20)).toBe('no-cave')
    expect(classifyCrystalCondition(0)).toBe('no-cave')
  })
})

// ─── classifySystemType ───────────────────────────────────────────

describe('classifySystemType', () => {
  it('returns no-system for empty crystals', () => {
    expect(classifySystemType([])).toBe('no-system')
  })

  it('returns mammoth-cave for high quality with high ratio', () => {
    const crystals = Array.from({ length: 4 }, () => ({
      qualityScore: 90, condition: 'cathedral-cave',
    })) as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('mammoth-cave')
  })

  it('returns carlsbad-caverns for good quality', () => {
    const crystals = Array.from({ length: 2 }, () => ({
      qualityScore: 65, condition: 'crystal-grotto',
    })) as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('carlsbad-caverns')
  })

  it('returns proper-system for decent quality', () => {
    const crystals = [{ qualityScore: 50, condition: 'proper-cave' }] as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('proper-system')
  })

  it('returns small-cave for lower quality', () => {
    const crystals = [{ qualityScore: 35, condition: 'limestone-hollow' }] as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('small-cave')
  })

  it('returns rock-shelter for poor quality', () => {
    const crystals = [{ qualityScore: 18, condition: 'mud-cave' }] as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('rock-shelter')
  })

  it('returns no-system for zero quality', () => {
    const crystals = [{ qualityScore: 5, condition: 'no-cave' }] as CaveCrystal[]
    expect(classifySystemType(crystals)).toBe('no-system')
  })
})

// ─── classifySystemCondition ──────────────────────────────────────

describe('classifySystemCondition', () => {
  it('returns spectacular-cave for 75+', () => {
    expect(classifySystemCondition(80)).toBe('spectacular-cave')
  })

  it('returns beautiful-grotto for 60-74', () => {
    expect(classifySystemCondition(65)).toBe('beautiful-grotto')
  })

  it('returns decent-cave for 45-59', () => {
    expect(classifySystemCondition(50)).toBe('decent-cave')
  })

  it('returns rough-hollow for 30-44', () => {
    expect(classifySystemCondition(35)).toBe('rough-hollow')
  })

  it('returns collapsed for 15-29', () => {
    expect(classifySystemCondition(20)).toBe('collapsed')
  })

  it('returns filled-in for below 15', () => {
    expect(classifySystemCondition(10)).toBe('filled-in')
  })
})

// ─── classifyExplorerGrade ────────────────────────────────────────

describe('classifyExplorerGrade', () => {
  it('returns master-spelunker for 80+', () => {
    expect(classifyExplorerGrade(85)).toBe('master-spelunker')
  })

  it('returns expert-caver for 65-79', () => {
    expect(classifyExplorerGrade(70)).toBe('expert-caver')
  })

  it('returns skilled-explorer for 50-64', () => {
    expect(classifyExplorerGrade(55)).toBe('skilled-explorer')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyExplorerGrade(40)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyExplorerGrade(25)).toBe('novice')
  })

  it('returns surface-dweller for below 20', () => {
    expect(classifyExplorerGrade(10)).toBe('surface-dweller')
  })
})

// ─── analyzeCaveCrystal ───────────────────────────────────────────

describe('analyzeCaveCrystal', () => {
  it('returns a complete crystal analysis', () => {
    const crystal = analyzeCaveCrystal(richContent, 'index.ts')
    expect(crystal.file).toBe('index.ts')
    expect(crystal.formationQuality).toBeGreaterThan(0)
    expect(crystal.stalactitePrecision).toBeGreaterThan(0)
    expect(crystal.grottoDepth).toBeGreaterThan(0)
    expect(crystal.mineralDiversity).toBeGreaterThan(0)
    expect(crystal.chamberResonance).toBeGreaterThan(0)
    expect(crystal.qualityScore).toBeGreaterThan(0)
    expect(crystal.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const crystal = analyzeCaveCrystal(richContent, 'test.ts')
    const expected = Math.round(
      crystal.forming.quality * 0.2 +
      crystal.hanging.precision * 0.2 +
      crystal.deepening.depth * 0.2 +
      crystal.diversifying.diversity * 0.2 +
      crystal.resonating.resonance * 0.2,
    )
    expect(crystal.qualityScore).toBe(expected)
  })

  it('returns no-cave for empty content', () => {
    const crystal = analyzeCaveCrystal(emptyContent, 'empty.ts')
    expect(crystal.qualityScore).toBe(0)
    expect(crystal.condition).toBe('no-cave')
  })

  it('returns cathedral-cave for rich content', () => {
    const crystal = analyzeCaveCrystal(richContent, 'rich.ts')
    expect(crystal.condition).toBe('cathedral-cave')
  })

  it('includes all measure objects', () => {
    const crystal = analyzeCaveCrystal(richContent, 'test.ts')
    expect(crystal.forming).toBeDefined()
    expect(crystal.hanging).toBeDefined()
    expect(crystal.deepening).toBeDefined()
    expect(crystal.diversifying).toBeDefined()
    expect(crystal.resonating).toBeDefined()
  })
})

// ─── analyzeCaveSystem ────────────────────────────────────────────

describe('analyzeCaveSystem', () => {
  it('returns empty system for no crystals', () => {
    const system = analyzeCaveSystem([], 'src')
    expect(system.directory).toBe('src')
    expect(system.crystals).toHaveLength(0)
    expect(system.avgFormation).toBe(0)
    expect(system.systemType).toBe('no-system')
    expect(system.condition).toBe('filled-in')
  })

  it('computes averages correctly', () => {
    const crystals = [
      analyzeCaveCrystal(richContent, 'src/a.ts'),
      analyzeCaveCrystal(moderateContent, 'src/b.ts'),
    ]
    const system = analyzeCaveSystem(crystals, 'src')
    expect(system.avgFormation).toBeGreaterThan(0)
    expect(system.avgDepth).toBeGreaterThan(0)
    expect(system.avgResonance).toBeGreaterThan(0)
    expect(system.crystals).toHaveLength(2)
  })

  it('counts cathedral and no-cave crystals', () => {
    const rich = analyzeCaveCrystal(richContent, 'src/rich.ts')
    const empty = analyzeCaveCrystal(emptyContent, 'src/empty.ts')
    const system = analyzeCaveSystem([rich, empty], 'src')
    expect(system.cathedralCaveCount).toBe(1)
    expect(system.noCaveCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  const goodStats: CrystalCaveStats = {
    totalFiles: 5, totalSystems: 1,
    avgFormationQuality: 80, avgStalactitePrecision: 80,
    avgGrottoDepth: 80, avgMineralDiversity: 80,
    avgChamberResonance: 80,
    cathedralCaveCount: 3, crystalGrottoCount: 1,
    properCaveCount: 1, limestoneHollowCount: 0,
    mudCaveCount: 0, noCaveCount: 0,
    hasHighQualityCount: 5, hasHighPrecisionCount: 5,
    hasHighDepthCount: 5, hasHighDiversityCount: 5,
    hasHighResonanceCount: 5,
    overallSplendor: 80, explorerGrade: 'master-spelunker',
    bestCrystal: 'a.ts', bestFormed: 'a.ts',
    mostPrecise: 'a.ts', deepest: 'a.ts', mostDiverse: 'a.ts',
  }

  const goodUnderground: UndergroundSummary = {
    avgFormation: 80, avgDepth: 80, avgResonance: 80,
    isDeep: true, overallSplendor: 80,
  }

  it('returns success message when all metrics are good', () => {
    const recs = generateRecommendations([], [], goodUnderground, goodStats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[recs.length - 1]).toContain('master-spelunker')
  })

  it('recommends improving formation quality when low', () => {
    const stats = { ...goodStats, avgFormationQuality: 40 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('formation quality'))).toBe(true)
  })

  it('recommends sharpening stalactite precision when low', () => {
    const stats = { ...goodStats, avgStalactitePrecision: 40 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('stalactite precision'))).toBe(true)
  })

  it('recommends deepening grotto depth when low', () => {
    const stats = { ...goodStats, avgGrottoDepth: 40 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('grotto depth'))).toBe(true)
  })

  it('recommends increasing mineral diversity when low', () => {
    const stats = { ...goodStats, avgMineralDiversity: 40 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('mineral diversity'))).toBe(true)
  })

  it('recommends boosting chamber resonance when low', () => {
    const stats = { ...goodStats, avgChamberResonance: 40 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('chamber resonance'))).toBe(true)
  })

  it('flags no-cave files', () => {
    const stats = { ...goodStats, noCaveCount: 2 }
    const recs = generateRecommendations([], [], goodUnderground, stats)
    expect(recs.some(r => r.includes('no cave formation'))).toBe(true)
  })

  it('warns about low overall splendor', () => {
    const underground = { ...goodUnderground, overallSplendor: 30 }
    const recs = generateRecommendations([], [], underground, goodStats)
    expect(recs.some(r => r.includes('splendor is low'))).toBe(true)
  })

  it('warns when all systems are collapsed', () => {
    const systems: CaveSystem[] = [{
      directory: 'src', crystals: [], avgFormation: 0, avgDepth: 0, avgResonance: 0,
      cathedralCaveCount: 0, noCaveCount: 0, systemType: 'no-system', condition: 'filled-in',
    }]
    const recs = generateRecommendations([], systems, goodUnderground, goodStats)
    expect(recs.some(r => r.includes('quality overhaul'))).toBe(true)
  })

  it('lists specific no-cave files when few', () => {
    const crystals = [
      { file: 'a.ts', condition: 'no-cave', qualityScore: 0 } as CaveCrystal,
      { file: 'b.ts', condition: 'no-cave', qualityScore: 0 } as CaveCrystal,
    ]
    const recs = generateRecommendations(crystals, [], goodUnderground, goodStats)
    expect(recs.some(r => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildCrystalCaveResult ───────────────────────────────────────

describe('buildCrystalCaveResult', () => {
  it('returns complete result with empty inputs', async () => {
    const result = await buildCrystalCaveResult([], [])
    expect(result.crystals).toHaveLength(0)
    expect(result.systems).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSplendor).toBe(0)
    expect(result.underground.isDeep).toBe(false)
  })

  it('analyzes multiple files correctly', async () => {
    const result = await buildCrystalCaveResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.crystals).toHaveLength(2)
    expect(result.systems).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalSystems).toBe(1)
  })

  it('groups files by directory into systems', async () => {
    const result = await buildCrystalCaveResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.systems).toHaveLength(2)
  })

  it('computes underground summary', async () => {
    const result = await buildCrystalCaveResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.underground.avgFormation).toBeGreaterThan(0)
    expect(result.underground.avgDepth).toBeGreaterThan(0)
    expect(result.underground.avgResonance).toBeGreaterThan(0)
    expect(result.underground.overallSplendor).toBeGreaterThan(0)
    expect(result.underground.isDeep).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildCrystalCaveResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.avgFormationQuality).toBeGreaterThan(0)
    expect(result.stats.avgStalactitePrecision).toBeGreaterThan(0)
    expect(result.stats.avgGrottoDepth).toBeGreaterThan(0)
    expect(result.stats.avgMineralDiversity).toBeGreaterThan(0)
    expect(result.stats.avgChamberResonance).toBeGreaterThan(0)
    expect(result.stats.cathedralCaveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.noCaveCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best files', async () => {
    const result = await buildCrystalCaveResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.stats.bestCrystal).toBe('a.ts')
    expect(result.stats.bestFormed).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.deepest).toBe('a.ts')
    expect(result.stats.mostDiverse).toBe('a.ts')
  })

  it('generates recommendations', async () => {
    const result = await buildCrystalCaveResult(
      ['a.ts'],
      [emptyContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes explorer grade', async () => {
    const result = await buildCrystalCaveResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.explorerGrade).toBeDefined()
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for each tier', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('cathedral-cave')).toBe('string')
    expect(typeof colorGrade('no-cave')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCrystalTable', () => {
  it('formats a crystal without error', () => {
    const crystal = analyzeCaveCrystal(richContent, 'index.ts')
    const result = formatCrystalTable(crystal)
    expect(result).toContain('index.ts')
    expect(result).toContain('Formation Quality')
    expect(result).toContain('Score')
  })
})

describe('formatCrystalsTable', () => {
  it('returns empty message for no crystals', () => {
    expect(formatCrystalsTable([])).toContain('No cave crystals found')
  })

  it('formats multiple crystals', () => {
    const crystals = [
      analyzeCaveCrystal(richContent, 'a.ts'),
      analyzeCaveCrystal(moderateContent, 'b.ts'),
    ]
    const result = formatCrystalsTable(crystals)
    expect(result).toContain('Crystal Cave Analysis')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatSystemTable', () => {
  it('formats a system', () => {
    const system = analyzeCaveSystem([analyzeCaveCrystal(richContent, 'a.ts')], 'src')
    const result = formatSystemTable(system)
    expect(result).toContain('src')
    expect(result).toContain('Type:')
    expect(result).toContain('Crystals:')
  })
})

describe('formatSystemsTable', () => {
  it('returns empty message for no systems', () => {
    expect(formatSystemsTable([])).toContain('No cave systems found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats correctly', async () => {
    const result = await buildCrystalCaveResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Crystal Cave Statistics')
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Explorer Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns empty message for no recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const recs = formatRecommendations(['First recommendation', 'Second recommendation'])
    expect(recs).toContain('Recommendations')
    expect(recs).toContain('First recommendation')
    expect(recs).toContain('Second recommendation')
  })
})

describe('formatResultTable', () => {
  it('formats full result as table', async () => {
    const result = await buildCrystalCaveResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Crystal Cave Analysis')
    expect(formatted).toContain('Cave Systems')
    expect(formatted).toContain('Crystal Cave Statistics')
    expect(formatted).toContain('Underground')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildCrystalCaveResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.underground).toBeDefined()
  })
})
