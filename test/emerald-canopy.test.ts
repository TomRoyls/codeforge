import { describe, expect, it } from 'vitest'

import {
  analyzeCanopyLayer,
  analyzeCanopyLeaf,
  buildEmeraldCanopyResult,
  classifyCanopyCondition,
  classifyLayerCondition,
  classifyLayerType,
  classifyRangerGrade,
  generateRecommendations,
  measureFiltering,
  measureFlexing,
  measureNetworking,
  measureReaching,
  measureThriving,
} from '../src/commands/emerald-canopy-helpers.js'
import type { EmeraldCanopyResult } from '../src/commands/emerald-canopy-helpers.js'
import {
  colorCanopyCondition,
  colorLayerCondition,
  colorLayerType,
  colorRangerGrade,
  colorScore,
  formatLayersTable,
  formatLayerTable,
  formatLeavesTable,
  formatLeafTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/emerald-canopy-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''
const minimalContent = 'const x = 1'

const richVit = measureThriving(richContent).vitality
const richClr = measureFiltering(richContent).clarity
const richPrec = measureReaching(richContent).precision
const richRes = measureFlexing(richContent).resilience
const richWis = measureNetworking(richContent).wisdom

function makeStats(overrides: Partial<EmeraldCanopyResult['stats']> = {}): EmeraldCanopyResult['stats'] {
  return {
    totalFiles: 1,
    totalLayers: 1,
    avgForestVitality: 50,
    avgLeafClarity: 50,
    avgRootPrecision: 50,
    avgBranchResilience: 50,
    avgEcosystemWisdom: 50,
    canopyMasterpieceCount: 0,
    emeraldCrownCount: 0,
    properCanopyCount: 0,
    thinFoliageCount: 0,
    bareBranchesCount: 0,
    voidCount: 0,
    hasHighVitalityCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallHealth: 50,
    rangerGrade: 'proper-forester',
    bestLeaf: 'a.ts',
    mostVital: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureThriving ────────────────────────────────────

describe('measureThriving', () => {
  it('scores rich content highly', () => {
    const result = measureThriving(richContent)
    expect(result.vitality).toBeGreaterThan(60)
    expect(result.hasHighVitality).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureThriving(emptyContent).vitality).toBeLessThan(richVit)
  })

  it('detects hasAlive (class/interface/type)', () => {
    expect(measureThriving(richContent).hasAlive).toBe(true)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const deprecated = 2; const obsolete = 3; const legacy = 4; const rotten = 5'
    const result = measureThriving(content)
    expect(result.deadCount).toBe(5)
    expect(result.hasNoDead).toBe(false)
  })

  it('counts stagnant keywords', () => {
    const content = 'const stagnant = 1; const stale = 2; const frozen = 3'
    const result = measureThriving(content)
    expect(result.stagnantCount).toBe(3)
  })

  it('detects hasDynamic (async/await/Promise)', () => {
    expect(measureThriving(richContent).hasDynamic).toBe(true)
  })

  it('detects hasOrganic (no any)', () => {
    expect(measureThriving(richContent).hasOrganic).toBe(true)
  })

  it('detects hasBlooming (try/catch/if)', () => {
    expect(measureThriving(richContent).hasBlooming).toBe(true)
  })

  it('classifies growth correctly for high scores', () => {
    const result = measureThriving(richContent)
    expect(['ancient-rainforest', 'mature-forest', 'proper-woodland']).toContain(result.growth)
  })

  it('classifies growth correctly for low scores', () => {
    expect(measureThriving(emptyContent).growth).not.toBe('ancient-rainforest')
  })
})

// ─── measureFiltering ───────────────────────────────────

describe('measureFiltering', () => {
  it('scores rich content highly', () => {
    const result = measureFiltering(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFiltering(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureFiltering(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureFiltering(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureFiltering(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureFiltering(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureFiltering(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOptimized (JSDoc)', () => {
    expect(measureFiltering(richContent).hasOptimized).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureFiltering(richContent)
    expect(['crystal-canopy', 'dappled-light', 'proper-filter']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureFiltering(emptyContent).light).not.toBe('crystal-canopy')
  })
})

// ─── measureReaching ────────────────────────────────────

describe('measureReaching', () => {
  it('scores rich content highly', () => {
    const result = measureReaching(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureReaching(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureReaching(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureReaching(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureReaching(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureReaching(richContent).hasCrisp).toBe(true)
  })

  it('detects hasFarReaching (try/catch/if)', () => {
    expect(measureReaching(richContent).hasFarReaching).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureReaching(richContent)
    expect(['taproot-deep', 'extensive-network', 'proper-root']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    expect(measureReaching(emptyContent).depth).not.toBe('taproot-deep')
  })
})

// ─── measureFlexing ─────────────────────────────────────

describe('measureFlexing', () => {
  it('scores rich content highly', () => {
    const result = measureFlexing(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFlexing(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureFlexing(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureFlexing(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureFlexing(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasAdaptable (class/interface/type)', () => {
    expect(measureFlexing(richContent).hasAdaptable).toBe(true)
  })

  it('detects hasResilient (JSDoc)', () => {
    expect(measureFlexing(richContent).hasResilient).toBe(true)
  })

  it('classifies wood correctly for high scores', () => {
    const result = measureFlexing(richContent)
    expect(['ancient-oak', 'flexible-willow', 'proper-branch']).toContain(result.wood)
  })

  it('classifies wood correctly for low scores', () => {
    expect(measureFlexing(emptyContent).wood).not.toBe('ancient-oak')
  })
})

// ─── measureNetworking ──────────────────────────────────

describe('measureNetworking', () => {
  it('scores rich content highly', () => {
    const result = measureNetworking(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureNetworking(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureNetworking(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureNetworking(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureNetworking(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureNetworking(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureNetworking(richContent).hasInsightful).toBe(true)
  })

  it('detects hasSymbiotic (no unused/dead/obsolete/deprecated)', () => {
    expect(measureNetworking(richContent).hasSymbiotic).toBe(true)
  })

  it('classifies web correctly for high scores', () => {
    const result = measureNetworking(richContent)
    expect(['mycelium-master', 'forest-network', 'proper-ecosystem']).toContain(result.web)
  })

  it('classifies web correctly for low scores', () => {
    expect(measureNetworking(emptyContent).web).not.toBe('mycelium-master')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCanopyCondition', () => {
  it('returns canopy-masterpiece for 90+', () => {
    expect(classifyCanopyCondition(90)).toBe('canopy-masterpiece')
    expect(classifyCanopyCondition(95)).toBe('canopy-masterpiece')
  })

  it('returns emerald-crown for 75-89', () => {
    expect(classifyCanopyCondition(75)).toBe('emerald-crown')
  })

  it('returns proper-canopy for 60-74', () => {
    expect(classifyCanopyCondition(60)).toBe('proper-canopy')
  })

  it('returns thin-foliage for 40-59', () => {
    expect(classifyCanopyCondition(40)).toBe('thin-foliage')
  })

  it('returns bare-branches for 20-39', () => {
    expect(classifyCanopyCondition(20)).toBe('bare-branches')
  })

  it('returns void below 20', () => {
    expect(classifyCanopyCondition(0)).toBe('void')
    expect(classifyCanopyCondition(10)).toBe('void')
  })
})

describe('classifyLayerType', () => {
  it('returns no-layer for empty leaves', () => {
    expect(classifyLayerType([])).toBe('no-layer')
  })

  it('returns primary-canopy for avg >= 85', () => {
    const leaves = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyLayerType(leaves)).toBe('primary-canopy')
  })

  it('returns forest-floor for low avg', () => {
    const leaves = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyLayerType(leaves)).toBe('forest-floor')
  })
})

describe('classifyLayerCondition', () => {
  it('returns emerald-forest for 85+', () => {
    expect(classifyLayerCondition(85)).toBe('emerald-forest')
  })

  it('returns void below 15', () => {
    expect(classifyLayerCondition(5)).toBe('void')
  })
})

describe('classifyRangerGrade', () => {
  it('returns forest-elder for 80+', () => {
    expect(classifyRangerGrade(80)).toBe('forest-elder')
  })

  it('returns city-dweller below 20', () => {
    expect(classifyRangerGrade(5)).toBe('city-dweller')
  })

  it('returns master-ranger for 65-79', () => {
    expect(classifyRangerGrade(65)).toBe('master-ranger')
  })

  it('returns proper-forester for 50-64', () => {
    expect(classifyRangerGrade(50)).toBe('proper-forester')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyRangerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyRangerGrade(20)).toBe('novice')
  })
})

// ─── analyzeCanopyLeaf ──────────────────────────────────

describe('analyzeCanopyLeaf', () => {
  it('creates a leaf with all 5 measures', () => {
    const leaf = analyzeCanopyLeaf(richContent, 'app.ts')
    expect(leaf.file).toBe('app.ts')
    expect(typeof leaf.forestVitality).toBe('number')
    expect(typeof leaf.leafClarity).toBe('number')
    expect(typeof leaf.rootPrecision).toBe('number')
    expect(typeof leaf.branchResilience).toBe('number')
    expect(typeof leaf.ecosystemWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const leaf = analyzeCanopyLeaf(richContent, 'app.ts')
    const expected = Math.round(
      leaf.forestVitality * 0.2 +
      leaf.leafClarity * 0.2 +
      leaf.rootPrecision * 0.2 +
      leaf.branchResilience * 0.2 +
      leaf.ecosystemWisdom * 0.2,
    )
    expect(leaf.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const leaf = analyzeCanopyLeaf(richContent, 'app.ts')
    expect(leaf.condition).toBe(classifyCanopyCondition(leaf.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richLeaf = analyzeCanopyLeaf(richContent, 'rich.ts')
    const emptyLeaf = analyzeCanopyLeaf(emptyContent, 'empty.ts')
    expect(richLeaf.qualityScore).toBeGreaterThan(emptyLeaf.qualityScore)
  })
})

// ─── analyzeCanopyLayer ─────────────────────────────────

describe('analyzeCanopyLayer', () => {
  it('returns empty layer for no leaves', () => {
    const layer = analyzeCanopyLayer([], 'src')
    expect(layer.directory).toBe('src')
    expect(layer.leaves).toEqual([])
    expect(layer.layerType).toBe('no-layer')
    expect(layer.condition).toBe('void')
  })

  it('computes averages from leaves', () => {
    const leaves = [analyzeCanopyLeaf(richContent, 'a.ts'), analyzeCanopyLeaf(richContent, 'b.ts')]
    const layer = analyzeCanopyLayer(leaves, 'src')
    expect(layer.avgVitality).toBeGreaterThan(0)
    expect(layer.avgPrecision).toBeGreaterThan(0)
    expect(layer.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildEmeraldCanopyResult ────────────────────────────

describe('buildEmeraldCanopyResult', () => {
  it('returns full result structure', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    expect(result.leaves).toHaveLength(1)
    expect(result.layers).toHaveLength(1)
    expect(result.forest).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into layers', async () => {
    const result = await buildEmeraldCanopyResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.layers.length).toBe(2)
  })

  it('computes forest overview', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    expect(result.forest.avgVitality).toBeGreaterThan(0)
    expect(result.forest.isEmerald).toBe(true)
    expect(result.forest.overallHealth).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildEmeraldCanopyResult([], [])
    expect(result.leaves).toHaveLength(0)
    expect(result.layers).toHaveLength(0)
    expect(result.forest.overallHealth).toBe(0)
    expect(result.forest.isEmerald).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    const total = result.stats.canopyMasterpieceCount +
      result.stats.emeraldCrownCount +
      result.stats.properCanopyCount +
      result.stats.thinFoliageCount +
      result.stats.bareBranchesCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best leaf and top performers', async () => {
    const result = await buildEmeraldCanopyResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestLeaf).toBeTruthy()
    expect(result.stats.mostVital).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes ranger grade from overall health', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    expect(result.stats.rangerGrade).toBe(classifyRangerGrade(result.stats.overallHealth))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgForestVitality: 90,
      avgLeafClarity: 90,
      avgRootPrecision: 90,
      avgBranchResilience: 90,
      avgEcosystemWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 90, avgWisdom: 90, isEmerald: true, overallHealth: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('canopy masterpiece')
  })

  it('recommends vitality when < 60', () => {
    const stats = makeStats({ avgForestVitality: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('forest vitality') || r.includes('ancient-rainforest'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgLeafClarity: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('leaf clarity') || r.includes('crystal-canopy'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgRootPrecision: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('root precision') || r.includes('taproot-deep'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgBranchResilience: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('branch resilience') || r.includes('ancient-oak'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgEcosystemWisdom: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('ecosystem wisdom') || r.includes('mycelium-master'))).toBe(true)
  })

  it('warns about thinned canopy when overallHealth < 40', () => {
    const stats = makeStats({ overallHealth: 30 })
    const result = generateRecommendations([], [], { avgVitality: 30, avgPrecision: 30, avgWisdom: 30, isEmerald: false, overallHealth: 30 }, stats)
    expect(result.some((r) => r.includes('thinned'))).toBe(true)
  })

  it('lists void leaves by name when <= 5', () => {
    const leaves = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(leaves, [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void leaves when > 5', () => {
    const leaves = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(leaves, [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('6 bare branches'))).toBe(true)
  })

  it('warns when all layers are poor', () => {
    const layers = [{ condition: 'empty-clearing' as const, layerType: 'shrub-layer' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], layers as Array<{ condition: string; layerType: string }>, { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallHealth: 50 }, stats)
    expect(result.some((r) => r.includes('empty clearings'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgForestVitality: 70,
      avgLeafClarity: 70,
      avgRootPrecision: 70,
      avgBranchResilience: 70,
      avgEcosystemWisdom: 70,
      overallHealth: 70,
    })
    const result = generateRecommendations([], [], { avgVitality: 70, avgPrecision: 70, avgWisdom: 70, isEmerald: true, overallHealth: 70 }, stats)
    expect(result.some((r) => r.includes('rainforest brilliance'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorCanopyCondition', () => {
  it('colors canopy-masterpiece', () => {
    expect(typeof colorCanopyCondition('canopy-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCanopyCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorCanopyCondition('unknown')).toBe('string')
  })
})

describe('colorLayerType', () => {
  it('colors primary-canopy', () => {
    expect(typeof colorLayerType('primary-canopy')).toBe('string')
  })

  it('colors no-layer', () => {
    expect(typeof colorLayerType('no-layer')).toBe('string')
  })
})

describe('colorLayerCondition', () => {
  it('colors emerald-forest', () => {
    expect(typeof colorLayerCondition('emerald-forest')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorLayerCondition('void')).toBe('string')
  })
})

describe('colorRangerGrade', () => {
  it('colors forest-elder', () => {
    expect(typeof colorRangerGrade('forest-elder')).toBe('string')
  })

  it('colors city-dweller', () => {
    expect(typeof colorRangerGrade('city-dweller')).toBe('string')
  })
})

describe('formatLeafTable', () => {
  it('formats a leaf with all measures', () => {
    const leaf = analyzeCanopyLeaf(richContent, 'app.ts')
    const output = formatLeafTable(leaf)
    expect(output).toContain('Canopy Leaf: app.ts')
    expect(output).toContain('Forest Vitality')
    expect(output).toContain('Leaf Clarity')
    expect(output).toContain('Root Precision')
    expect(output).toContain('Branch Resilience')
    expect(output).toContain('Ecosystem Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatLeavesTable', () => {
  it('shows no leaves message for empty array', () => {
    expect(formatLeavesTable([])).toContain('No canopy leaves')
  })

  it('lists leaves in output', () => {
    const leaves = [analyzeCanopyLeaf(richContent, 'a.ts')]
    expect(formatLeavesTable(leaves)).toContain('a.ts')
  })
})

describe('formatLayerTable', () => {
  it('formats a layer with all fields', () => {
    const leaves = [analyzeCanopyLeaf(richContent, 'a.ts')]
    const layer = analyzeCanopyLayer(leaves, 'src')
    const output = formatLayerTable(layer)
    expect(output).toContain('Canopy Layer: src')
    expect(output).toContain('Leaves')
    expect(output).toContain('Avg Vitality')
  })
})

describe('formatLayersTable', () => {
  it('shows no layers message for empty array', () => {
    expect(formatLayersTable([])).toContain('No canopy layers')
  })

  it('lists layers in output', () => {
    const leaves = [analyzeCanopyLeaf(richContent, 'a.ts')]
    const layer = analyzeCanopyLayer(leaves, 'src')
    expect(formatLayersTable([layer])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Canopy Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Ranger Grade')
    expect(output).toContain('Best Leaf')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Canopy Analysis')
    expect(output).toContain('Forest Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildEmeraldCanopyResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.leaves).toHaveLength(1)
    expect(parsed.forest).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
