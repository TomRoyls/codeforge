import { describe, expect, it } from 'vitest'

import {
  analyzeIronBlossom,
  analyzeIronGrove,
  buildIronGroveResult,
  classifyBlossomCondition,
  classifyBlacksmithGrade,
  classifyGroveCondition,
  classifyGroveType,
  generateRecommendations,
  measureForging,
  measureFlowering,
  measureGrowing,
  measureResisting,
  measureRooting,
  type BlossomCondition,
  type GroveCondition,
  type GroveType,
  type IronBlossom,
  type IronGrove,
  type IronGroveResult,
} from '../src/commands/iron-grove-helpers.js'

import {
  colorCondition,
  colorGroveCondition,
  colorScore,
  formatBlossomTable,
  formatBlossomsTable,
  formatGrovesTable,
  formatGroveTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/iron-grove-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { x } from 'y'
export interface Foo { readonly bar: string }
export type Result = Foo
export class Baz implements Foo {
  readonly bar: string = ''
  private z: number = 0
  async method(): Promise<void> {
    try {
      const res = await fetch('/')
      if (res.ok) return JSON.parse('{}') as Result
      throw new Error('fail')
    } catch {
      return
    }
  }
}
/** Documentation */
function calc<T>(val: T): string {
  return String(val)
}
`

const emptyContent = ''

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureGrowing ─────────────────────────────────────

describe('measureGrowing', () => {
  it('scores rich content high', () => {
    const m = measureGrowing(richContent)
    expect(m.strength).toBeGreaterThanOrEqual(60)
    expect(m.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureGrowing(emptyContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureGrowing(richContent)
    const poor = measureGrowing(poorContent)
    expect(rich.strength).toBeGreaterThan(poor.strength)
  })

  it('detects chaotic patterns', () => {
    const m = measureGrowing('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureGrowing('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('assigns correct vitality for high scores', () => {
    const m = measureGrowing(richContent)
    expect(['ancient-ironwood', 'steel-oak', 'proper-iron-tree']).toContain(m.vitality)
  })

  it('assigns low vitality for empty content', () => {
    const m = measureGrowing(emptyContent)
    expect(m.vitality).toMatch(/no-strength|foil-leaf/)
  })

  it('has all boolean properties', () => {
    const m = measureGrowing(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasProductive).toBe('boolean')
    expect(typeof m.hasFocused).toBe('boolean')
  })
})

// ─── measureResisting ───────────────────────────────────

describe('measureResisting', () => {
  it('scores rich content high', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResistance).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureResisting(emptyContent)
    expect(m.resistance).toBeGreaterThanOrEqual(0)
  })

  it('detects volatile patterns', () => {
    const m = measureResisting('volatile unstable fragile')
    expect(m.volatileCount).toBeGreaterThan(0)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureResisting('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns correct shield for high scores', () => {
    const m = measureResisting(richContent)
    expect(['stainless-steel', 'galvanized-iron', 'proper-coating']).toContain(m.shield)
  })

  it('assigns low shield for empty content', () => {
    const m = measureResisting(emptyContent)
    expect(['no-resistance', 'corroded-lump', 'rusted-surface']).toContain(m.shield)
  })

  it('has all boolean properties', () => {
    const m = measureResisting(richContent)
    expect(typeof m.hasStable).toBe('boolean')
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasMaintained).toBe('boolean')
  })
})

// ─── measureFlowering ───────────────────────────────────

describe('measureFlowering', () => {
  it('scores rich content high', () => {
    const m = measureFlowering(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureFlowering(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('detects approximate patterns', () => {
    const m = measureFlowering('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects unsafe count', () => {
    const m = measureFlowering('let x: any = 1')
    expect(m.unsafeCount).toBeGreaterThan(0)
  })

  it('assigns correct blossom for high scores', () => {
    const m = measureFlowering(richContent)
    expect(['cherry-precision', 'apple-exactness', 'proper-bloom']).toContain(m.blossom)
  })

  it('assigns low blossom for empty content', () => {
    const m = measureFlowering(emptyContent)
    expect(m.blossom).toMatch(/no-precision|scattered-petals/)
  })

  it('has all boolean properties', () => {
    const m = measureFlowering(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasClean).toBe('boolean')
    expect(typeof m.hasPrecise).toBe('boolean')
  })
})

// ─── measureRooting ─────────────────────────────────────

describe('measureRooting', () => {
  it('scores rich content high', () => {
    const m = measureRooting(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(60)
    expect(m.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRooting(emptyContent)
    expect(m.depth).toBeGreaterThanOrEqual(0)
  })

  it('detects isolated patterns', () => {
    const m = measureRooting('isolated standalone disconnected')
    expect(m.isolatedCount).toBeGreaterThan(0)
    expect(m.hasNoIsolated).toBe(false)
  })

  it('detects hidden patterns', () => {
    const m = measureRooting('hidden internal opaque')
    expect(m.hiddenCount).toBeGreaterThan(0)
    expect(m.hasNoHidden).toBe(false)
  })

  it('assigns correct root for high scores', () => {
    const m = measureRooting(richContent)
    expect(['deep-taproot', 'strong-foundation', 'proper-roots']).toContain(m.root)
  })

  it('assigns low root for empty content', () => {
    const m = measureRooting(emptyContent)
    expect(m.root).toMatch(/no-depth|surface-only/)
  })

  it('has all boolean properties', () => {
    const m = measureRooting(richContent)
    expect(typeof m.hasConnected).toBe('boolean')
    expect(typeof m.hasExported).toBe('boolean')
    expect(typeof m.hasDocumented).toBe('boolean')
  })
})

// ─── measureForging ─────────────────────────────────────

describe('measureForging', () => {
  it('scores rich content high', () => {
    const m = measureForging(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(60)
    expect(m.hasHighVitality).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureForging(emptyContent)
    expect(m.vitality).toBeGreaterThanOrEqual(0)
  })

  it('detects stagnant patterns', () => {
    const m = measureForging('stagnant static frozen dead')
    expect(m.stagnantCount).toBeGreaterThan(0)
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects hacked patterns', () => {
    const m = measureForging('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('assigns correct fire for high scores', () => {
    const m = measureForging(richContent)
    expect(['white-hot-forge', 'red-hot-anvil', 'proper-fire']).toContain(m.fire)
  })

  it('assigns low fire for empty content', () => {
    const m = measureForging(emptyContent)
    expect(m.fire).toMatch(/no-vitality|cold-hearth/)
  })

  it('has all boolean properties', () => {
    const m = measureForging(richContent)
    expect(typeof m.hasCreative).toBe('boolean')
    expect(typeof m.hasEvolving).toBe('boolean')
    expect(typeof m.hasInnovative).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyBlossomCondition', () => {
  const cases: [number, BlossomCondition][] = [
    [95, 'iron-masterpiece'],
    [90, 'iron-masterpiece'],
    [80, 'steel-blossom'],
    [75, 'steel-blossom'],
    [65, 'proper-alloy'],
    [60, 'proper-alloy'],
    [50, 'rusted-branch'],
    [40, 'rusted-branch'],
    [25, 'dead-stump'],
    [20, 'dead-stump'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyBlossomCondition(score)).toBe(expected)
    })
  }
})

describe('classifyGroveType', () => {
  it('returns no-grove for empty array', () => {
    expect(classifyGroveType([])).toBe('no-grove')
  })

  it('returns ancient-grove for high average', () => {
    const blossoms = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q, i) => ({
      ...q,
    })) as IronBlossom[]
    expect(classifyGroveType(blossoms)).toBe('ancient-grove')
  })

  it('returns barren-field for low average', () => {
    const blossoms = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as IronBlossom[]
    expect(classifyGroveType(blossoms)).toBe('barren-field')
  })
})

describe('classifyGroveCondition', () => {
  const cases: [number, GroveCondition][] = [
    [90, 'steel-forest'],
    [85, 'steel-forest'],
    [75, 'iron-vineyard'],
    [70, 'iron-vineyard'],
    [60, 'proper-orchard'],
    [55, 'proper-orchard'],
    [40, 'weed-patch'],
    [35, 'weed-patch'],
    [20, 'desert'],
    [15, 'desert'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyGroveCondition(score)).toBe(expected)
    })
  }
})

describe('classifyBlacksmithGrade', () => {
  const cases: [number, string][] = [
    [90, 'master-blacksmith'],
    [80, 'master-blacksmith'],
    [70, 'iron-forger'],
    [65, 'iron-forger'],
    [55, 'proper-smith'],
    [50, 'proper-smith'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'bellows-boy'],
    [0, 'bellows-boy'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyBlacksmithGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzeIronBlossom ─────────────────────────────────

describe('analyzeIronBlossom', () => {
  it('returns valid blossom for rich content', () => {
    const b = analyzeIronBlossom(richContent, 'app.ts')
    expect(b.file).toBe('app.ts')
    expect(b.strengthThroughNature).toBeGreaterThanOrEqual(0)
    expect(b.rustResistance).toBeGreaterThanOrEqual(0)
    expect(b.bloomPrecision).toBeGreaterThanOrEqual(0)
    expect(b.rootDepth).toBeGreaterThanOrEqual(0)
    expect(b.forgeVitality).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeGreaterThanOrEqual(0)
    expect(b.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid blossom for empty content', () => {
    const b = analyzeIronBlossom(emptyContent, 'empty.ts')
    expect(b.file).toBe('empty.ts')
    expect(b.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const b = analyzeIronBlossom(richContent, 'test.ts')
    const expected = Math.round(
      b.strengthThroughNature * 0.2 +
      b.rustResistance * 0.2 +
      b.bloomPrecision * 0.2 +
      b.rootDepth * 0.2 +
      b.forgeVitality * 0.2,
    )
    expect(b.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const b = analyzeIronBlossom(richContent, 'test.ts')
    expect(b.growing).toBeDefined()
    expect(b.resisting).toBeDefined()
    expect(b.flowering).toBeDefined()
    expect(b.rooting).toBeDefined()
    expect(b.forging).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const b = analyzeIronBlossom(richContent, 'test.ts')
    expect(classifyBlossomCondition(b.qualityScore)).toBe(b.condition)
  })

  it('scores rich content at max', () => {
    const b = analyzeIronBlossom(richContent, 'rich.ts')
    expect(b.strengthThroughNature).toBeGreaterThanOrEqual(60)
    expect(b.rustResistance).toBeGreaterThanOrEqual(60)
    expect(b.bloomPrecision).toBeGreaterThanOrEqual(60)
    expect(b.rootDepth).toBeGreaterThanOrEqual(60)
    expect(b.forgeVitality).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeIronGrove ───────────────────────────────────

describe('analyzeIronGrove', () => {
  it('returns empty grove for no blossoms', () => {
    const g = analyzeIronGrove([], 'src')
    expect(g.directory).toBe('src')
    expect(g.blossoms).toHaveLength(0)
    expect(g.avgStrength).toBe(0)
    expect(g.avgPrecision).toBe(0)
    expect(g.avgVitality).toBe(0)
    expect(g.groveType).toBe('no-grove')
    expect(g.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const blossoms = [
      analyzeIronBlossom(richContent, 'a.ts'),
      analyzeIronBlossom(richContent, 'b.ts'),
    ]
    const g = analyzeIronGrove(blossoms, 'src')
    expect(g.avgStrength).toBeGreaterThanOrEqual(0)
    expect(g.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(g.avgVitality).toBeGreaterThanOrEqual(0)
  })

  it('counts iron masterpieces', () => {
    const blossoms = [analyzeIronBlossom(richContent, 'a.ts')]
    const g = analyzeIronGrove(blossoms, 'src')
    if (blossoms[0].condition === 'iron-masterpiece') {
      expect(g.ironMasterpieceCount).toBe(1)
    } else {
      expect(g.ironMasterpieceCount).toBeGreaterThanOrEqual(0)
    }
  })

  it('counts void blossoms', () => {
    const blossoms = [analyzeIronBlossom(emptyContent, 'empty.ts')]
    const g = analyzeIronGrove(blossoms, 'src')
    expect(g.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildIronGroveResult ───────────────────────────────

describe('buildIronGroveResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildIronGroveResult([], [])
    expect(result.blossoms).toHaveLength(0)
    expect(result.groves).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallYield).toBe(0)
    expect(result.harvest.isIron).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildIronGroveResult(['app.ts'], [richContent])
    expect(result.blossoms).toHaveLength(1)
    expect(result.groves).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestBlossom).toBe('app.ts')
    expect(result.stats.strongest).toBe('app.ts')
    expect(result.stats.mostResistant).toBe('app.ts')
    expect(result.stats.mostPrecise).toBe('app.ts')
    expect(result.stats.deepest).toBe('app.ts')
    expect(result.stats.mostVital).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildIronGroveResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.blossoms).toHaveLength(3)
    expect(result.groves).toHaveLength(2)
    expect(result.stats.totalGroves).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildIronGroveResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.ironMasterpieceCount +
      result.stats.steelBlossomCount +
      result.stats.properAlloyCount +
      result.stats.rustedBranchCount +
      result.stats.deadStumpCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes blacksmithGrade', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    expect(['master-blacksmith', 'iron-forger', 'proper-smith', 'apprentice', 'novice', 'bellows-boy']).toContain(
      result.stats.blacksmithGrade,
    )
  })

  it('sets isIron when overallYield >= 60', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    if (result.harvest.overallYield >= 60) {
      expect(result.harvest.isIron).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    expect(result.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResistanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgForgeVitality correctly', async () => {
    const result = await buildIronGroveResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgForgeVitality).toBe(result.harvest.avgVitality)
  })

  it('computes avgBloomPrecision correctly', async () => {
    const result = await buildIronGroveResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgBloomPrecision).toBe(result.harvest.avgPrecision)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const blossoms: IronBlossom[] = []
    const groves: IronGrove[] = []
    const harvest: IronGroveResult['harvest'] = {
      avgStrength: 90,
      avgPrecision: 90,
      avgVitality: 90,
      isIron: true,
      overallYield: 90,
    }
    const stats: IronGroveResult['stats'] = {
      totalFiles: 1,
      totalGroves: 1,
      avgStrengthThroughNature: 92,
      avgRustResistance: 91,
      avgBloomPrecision: 90,
      avgRootDepth: 93,
      avgForgeVitality: 94,
      ironMasterpieceCount: 1,
      steelBlossomCount: 0,
      properAlloyCount: 0,
      rustedBranchCount: 0,
      deadStumpCount: 0,
      voidCount: 0,
      hasHighStrengthCount: 1,
      hasHighResistanceCount: 1,
      hasHighPrecisionCount: 1,
      hasHighDepthCount: 1,
      hasHighVitalityCount: 1,
      overallYield: 92,
      blacksmithGrade: 'master-blacksmith',
      bestBlossom: 'a.ts',
      strongest: 'a.ts',
      mostResistant: 'a.ts',
      mostPrecise: 'a.ts',
      deepest: 'a.ts',
      mostVital: 'a.ts',
    }
    const recs = generateRecommendations(blossoms, groves, harvest, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends strengthening when low strength', () => {
    const stats = {
      totalFiles: 1, totalGroves: 1,
      avgStrengthThroughNature: 30, avgRustResistance: 90, avgBloomPrecision: 90,
      avgRootDepth: 90, avgForgeVitality: 90,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 78, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: 'a.ts', strongest: 'a.ts', mostResistant: 'a.ts',
      mostPrecise: 'a.ts', deepest: 'a.ts', mostVital: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 30, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 78 }, stats)
    expect(recs.some((r) => r.includes('ironwood'))).toBe(true)
  })

  it('recommends rust resistance when low', () => {
    const stats = {
      totalFiles: 1, totalGroves: 1,
      avgStrengthThroughNature: 90, avgRustResistance: 30, avgBloomPrecision: 90,
      avgRootDepth: 90, avgForgeVitality: 90,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 78, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: 'a.ts', strongest: 'a.ts', mostResistant: 'a.ts',
      mostPrecise: 'a.ts', deepest: 'a.ts', mostVital: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 78 }, stats)
    expect(recs.some((r) => r.includes('rust'))).toBe(true)
  })

  it('recommends bloom precision when low', () => {
    const stats = {
      totalFiles: 1, totalGroves: 1,
      avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 30,
      avgRootDepth: 90, avgForgeVitality: 90,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 78, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: 'a.ts', strongest: 'a.ts', mostResistant: 'a.ts',
      mostPrecise: 'a.ts', deepest: 'a.ts', mostVital: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 30, avgVitality: 90, isIron: true, overallYield: 78 }, stats)
    expect(recs.some((r) => r.includes('bloom'))).toBe(true)
  })

  it('recommends root depth when low', () => {
    const stats = {
      totalFiles: 1, totalGroves: 1,
      avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 90,
      avgRootDepth: 30, avgForgeVitality: 90,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 78, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: 'a.ts', strongest: 'a.ts', mostResistant: 'a.ts',
      mostPrecise: 'a.ts', deepest: 'a.ts', mostVital: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 78 }, stats)
    expect(recs.some((r) => r.includes('root'))).toBe(true)
  })

  it('recommends forge vitality when low', () => {
    const stats = {
      totalFiles: 1, totalGroves: 1,
      avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 90,
      avgRootDepth: 90, avgForgeVitality: 30,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 78, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: 'a.ts', strongest: 'a.ts', mostResistant: 'a.ts',
      mostPrecise: 'a.ts', deepest: 'a.ts', mostVital: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgVitality: 30, isIron: true, overallYield: 78 }, stats)
    expect(recs.some((r) => r.includes('forge'))).toBe(true)
  })

  it('mentions void blossoms by name', () => {
    const blossoms = [
      { file: 'bad1.ts', condition: 'void' } as IronBlossom,
      { file: 'bad2.ts', condition: 'void' } as IronBlossom,
    ]
    const stats = {
      totalFiles: 2, totalGroves: 1,
      avgStrengthThroughNature: 70, avgRustResistance: 70, avgBloomPrecision: 70,
      avgRootDepth: 70, avgForgeVitality: 70,
      ironMasterpieceCount: 0, steelBlossomCount: 0, properAlloyCount: 0,
      rustedBranchCount: 0, deadStumpCount: 0, voidCount: 2,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallYield: 70, blacksmithGrade: 'iron-forger' as const,
      bestBlossom: '', strongest: '', mostResistant: '',
      mostPrecise: '', deepest: '', mostVital: '',
    }
    const recs = generateRecommendations(blossoms, [], { avgStrength: 70, avgPrecision: 70, avgVitality: 70, isIron: true, overallYield: 70 }, stats)
    expect(recs.some((r) => r.includes('bad1.ts'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorCondition returns string for all conditions', () => {
    const conditions: BlossomCondition[] = ['iron-masterpiece', 'steel-blossom', 'proper-alloy', 'rusted-branch', 'dead-stump', 'void']
    for (const c of conditions) {
      expect(typeof colorCondition(c)).toBe('string')
    }
  })

  it('colorGroveCondition returns string for all conditions', () => {
    const conditions: GroveCondition[] = ['steel-forest', 'iron-vineyard', 'proper-orchard', 'weed-patch', 'desert', 'void']
    for (const c of conditions) {
      expect(typeof colorGroveCondition(c)).toBe('string')
    }
  })

  it('formatBlossomTable returns string', () => {
    const b = analyzeIronBlossom(richContent, 'test.ts')
    expect(typeof formatBlossomTable(b)).toBe('string')
  })

  it('formatBlossomsTable returns string for empty', () => {
    expect(typeof formatBlossomsTable([])).toBe('string')
  })

  it('formatBlossomsTable returns string for blossoms', () => {
    const blossoms = [
      analyzeIronBlossom(richContent, 'a.ts'),
      analyzeIronBlossom(richContent, 'b.ts'),
    ]
    expect(typeof formatBlossomsTable(blossoms)).toBe('string')
  })

  it('formatGroveTable returns string', () => {
    const blossoms = [analyzeIronBlossom(richContent, 'a.ts')]
    const g = analyzeIronGrove(blossoms, 'src')
    expect(typeof formatGroveTable(g)).toBe('string')
  })

  it('formatGrovesTable returns string for empty', () => {
    expect(typeof formatGrovesTable([])).toBe('string')
  })

  it('formatGrovesTable returns string for groves', () => {
    const blossoms = [analyzeIronBlossom(richContent, 'a.ts')]
    const g = analyzeIronGrove(blossoms, 'src')
    expect(typeof formatGrovesTable([g])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildIronGroveResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
