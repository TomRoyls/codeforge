import { describe, it, expect } from 'vitest'
import {
  measureGrowing,
  measureBalancing,
  measureElegancing,
  measureSmoothing,
  measureHarmonizing,
  classifyCurveCondition,
  classifyGalaxyType,
  classifyArchitectGrade,
  classifyGalaxyCondition,
  analyzeGoldenCurve,
  analyzeSpiralGalaxy,
  buildGoldenSpiralResult,
  generateRecommendations,
} from '../src/commands/golden-spiral-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCurveTable,
  formatCurvesTable,
  formatGalaxyTable,
  formatGalaxiesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-spiral-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureGrowing ────────────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns 0 elegance for empty content', () => {
    const m = measureGrowing('')
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-growth')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureGrowing(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.grade).toBe('no-growth')
    expect(m.hasProportional).toBe(false)  // only hasConst contributes to score
    expect(m.hasBalanced).toBe(false)
    expect(m.hasNoLopsided).toBe(true)
    expect(m.hasNoArtificial).toBe(true)
    expect(m.hasNoForced).toBe(true)
    expect(m.hasNoStagnant).toBe(true)
    expect(m.lopsidedCount).toBe(0)
    expect(m.artificialCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureGrowing(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('golden-ratio')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasProportional).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasOrganic).toBe(true)
    expect(m.hasNatural).toBe(true)
    expect(m.hasProgressive).toBe(true)
    expect(m.hasMeasured).toBe(true)
  })

  it('detects lopsided var usage', () => {
    const m = measureGrowing('var x = 1')
    expect(m.lopsidedCount).toBe(1)
    expect(m.hasNoLopsided).toBe(false)
  })

  it('detects artificial any usage', () => {
    const m = measureGrowing('const x: any = 1')
    expect(m.artificialCount).toBe(1)
    expect(m.hasNoArtificial).toBe(false)
  })

  it('detects eval as forced', () => {
    const m = measureGrowing('eval("1")')
    expect(m.hasNoForced).toBe(false)
  })

  it('detects debugger as stagnant', () => {
    const m = measureGrowing('debugger')
    expect(m.hasNoStagnant).toBe(false)
  })

  it('classifies fibonacci-perfect correctly', () => {
    const content = '/** doc */\nexport interface Foo {}\nexport class Bar {}\nimport { x } from "y"\nconst z: string = "a"\nasync function f(): Promise<void> {}\ntype T = string\n'
    const m = measureGrowing(content)
    expect(m.quality).toBeGreaterThanOrEqual(70)
    if (m.quality >= 70 && m.quality < 85) {
      expect(m.grade).toBe('fibonacci-perfect')
    }
  })

  it('classifies proper-sequence correctly', () => {
    const content = '/** doc */\nexport const x = 1\n'
    const m = measureGrowing(content)
    expect(m.quality).toBeGreaterThanOrEqual(20)
    expect(m.quality).toBeLessThan(70)
  })
})

// ─── measureBalancing ───────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns 0 for empty content', () => {
    const m = measureBalancing('')
    expect(m.proportion).toBe(0)
    expect(m.balance).toBe('distorted')
    expect(m.hasHighProportion).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBalancing(minimalContent)
    expect(m.proportion).toBe(8)
    expect(m.balance).toBe('distorted')
    expect(m.hasEven).toBe(false)
    expect(m.hasNoAsymmetric).toBe(true)
    expect(m.hasNoDisproportionate).toBe(true)
    expect(m.asymmetricCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBalancing(richContent)
    expect(m.proportion).toBe(100)
    expect(m.balance).toBe('golden-section')
    expect(m.hasHighProportion).toBe(true)
    expect(m.hasEven).toBe(true)
    expect(m.hasSymmetric).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasProportioned).toBe(true)
    expect(m.hasEquilibrated).toBe(true)
  })

  it('detects asymmetric var usage', () => {
    const m = measureBalancing('var x = 1')
    expect(m.asymmetricCount).toBe(1)
    expect(m.hasNoAsymmetric).toBe(false)
  })

  it('detects disproportionate any usage', () => {
    const m = measureBalancing('const x: any = 1')
    expect(m.disproportionateCount).toBe(1)
    expect(m.hasNoDisproportionate).toBe(false)
  })

  it('classifies well-proportioned', () => {
    const content = '/** doc */\nexport interface Foo {}\nexport class Bar {}\nimport { x } from "y"\nconst z: string = "a"\n'
    const m = measureBalancing(content)
    expect(m.proportion).toBeGreaterThanOrEqual(20)
  })

  it('classifies imbalanced', () => {
    const m = measureBalancing('var x = 1')
    expect(m.proportion).toBeLessThan(25)
    if (m.proportion < 25 && m.proportion >= 10) {
      expect(m.balance).toBe('imbalanced')
    }
  })
})

// ─── measureElegancing ───────────────────────────────────────────────

describe('measureElegancing', () => {
  it('returns 0 for empty content', () => {
    const m = measureElegancing('')
    expect(m.elegance).toBe(0)
    expect(m.growth).toBe('no-expansion')
    expect(m.hasHighElegance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureElegancing(minimalContent)
    expect(m.elegance).toBe(0)
    expect(m.growth).toBe('no-expansion')
    expect(m.hasGraceful).toBe(false)
    expect(m.hasNoCrude).toBe(true)
    expect(m.hasNoBrute).toBe(true)
    expect(m.crudeCount).toBe(0)
    expect(m.bruteCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureElegancing(richContent)
    expect(m.elegance).toBe(100)
    expect(m.growth).toBe('elegant-curve')
    expect(m.hasHighElegance).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasSophisticated).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasElegant).toBe(true)
  })

  it('detects crude var usage', () => {
    const m = measureElegancing('var x = 1')
    expect(m.crudeCount).toBe(1)
    expect(m.hasNoCrude).toBe(false)
  })

  it('detects brute any usage', () => {
    const m = measureElegancing('const x: any = 1')
    expect(m.bruteCount).toBe(1)
    expect(m.hasNoBrute).toBe(false)
  })

  it('detects raw eval usage', () => {
    const m = measureElegancing('eval("1")')
    expect(m.hasNoRaw).toBe(false)
  })

  it('detects jagged debugger usage', () => {
    const m = measureElegancing('debugger')
    expect(m.hasNoJagged).toBe(false)
  })
})

// ─── measureSmoothing ───────────────────────────────────────────────

describe('measureSmoothing', () => {
  it('returns 0 for empty content', () => {
    const m = measureSmoothing('')
    expect(m.smoothness).toBe(0)
    expect(m.curve).toBe('broken-path')
    expect(m.hasHighSmoothness).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureSmoothing(minimalContent)
    expect(m.smoothness).toBe(10)
    expect(m.curve).toBe('broken-path')
    expect(m.hasFlowing).toBe(false)
    expect(m.hasNoJerky).toBe(true)
    expect(m.hasNoAbrupt).toBe(true)
    expect(m.jerkyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSmoothing(richContent)
    expect(m.smoothness).toBe(100)
    expect(m.curve).toBe('logarithmic-perfection')
    expect(m.hasHighSmoothness).toBe(true)
    expect(m.hasFlowing).toBe(true)
    expect(m.hasContinuous).toBe(true)
    expect(m.hasSeamless).toBe(true)
    expect(m.hasFluid).toBe(true)
    expect(m.hasGradual).toBe(true)
    expect(m.hasOrganic).toBe(true)
  })

  it('detects jerky var usage', () => {
    const m = measureSmoothing('var x = 1')
    expect(m.jerkyCount).toBe(1)
    expect(m.hasNoJerky).toBe(false)
  })

  it('detects abrupt any usage', () => {
    const m = measureSmoothing('const x: any = 1')
    expect(m.abruptCount).toBe(1)
    expect(m.hasNoAbrupt).toBe(false)
  })

  it('detects rigid eval usage', () => {
    const m = measureSmoothing('eval("1")')
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects sudden debugger usage', () => {
    const m = measureSmoothing('debugger')
    expect(m.hasNoSudden).toBe(false)
  })
})

// ─── measureHarmonizing ───────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureHarmonizing('')
    expect(m.harmony).toBe(0)
    expect(m.expansion).toBe('implosion')
    expect(m.hasHighHarmony).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureHarmonizing(minimalContent)
    expect(m.harmony).toBe(8)
    expect(m.expansion).toBe('implosion')
    expect(m.hasCoordinated).toBe(false)
    expect(m.hasNoFragmented).toBe(true)
    expect(m.hasNoDesynchronized).toBe(true)
    expect(m.fragmentedCount).toBe(0)
    expect(m.desynchronizedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHarmonizing(richContent)
    expect(m.harmony).toBe(100)
    expect(m.expansion).toBe('symphonic-growth')
    expect(m.hasHighHarmony).toBe(true)
    expect(m.hasCoordinated).toBe(true)
    expect(m.hasUnified).toBe(true)
    expect(m.hasSynchronized).toBe(true)
    expect(m.hasCoherent).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasAligned).toBe(true)
  })

  it('detects fragmented var usage', () => {
    const m = measureHarmonizing('var x = 1')
    expect(m.fragmentedCount).toBe(1)
    expect(m.hasNoFragmented).toBe(false)
  })

  it('detects desynchronized any usage', () => {
    const m = measureHarmonizing('const x: any = 1')
    expect(m.desynchronizedCount).toBe(1)
    expect(m.hasNoDesynchronized).toBe(false)
  })

  it('detects incoherent eval usage', () => {
    const m = measureHarmonizing('eval("1")')
    expect(m.hasNoIncoherent).toBe(false)
  })

  it('detects clashing debugger usage', () => {
    const m = measureHarmonizing('debugger')
    expect(m.hasNoClashing).toBe(false)
  })
})

// ─── classifyCurveCondition ──────────────────────────────────────────

describe('classifyCurveCondition', () => {
  it('classifies golden-masterpiece for 85+', () => {
    expect(classifyCurveCondition(85)).toBe('golden-masterpiece')
    expect(classifyCurveCondition(100)).toBe('golden-masterpiece')
  })

  it('classifies nautilus-perfection for 70-84', () => {
    expect(classifyCurveCondition(70)).toBe('nautilus-perfection')
    expect(classifyCurveCondition(84)).toBe('nautilus-perfection')
  })

  it('classifies proper-spiral for 55-69', () => {
    expect(classifyCurveCondition(55)).toBe('proper-spiral')
    expect(classifyCurveCondition(69)).toBe('proper-spiral')
  })

  it('classifies wonky-curve for 40-54', () => {
    expect(classifyCurveCondition(40)).toBe('wonky-curve')
    expect(classifyCurveCondition(54)).toBe('wonky-curve')
  })

  it('classifies broken-coil for 25-39', () => {
    expect(classifyCurveCondition(25)).toBe('broken-coil')
    expect(classifyCurveCondition(39)).toBe('broken-coil')
  })

  it('classifies straight-line for 0-24', () => {
    expect(classifyCurveCondition(0)).toBe('straight-line')
    expect(classifyCurveCondition(24)).toBe('straight-line')
  })
})

// ─── classifyGalaxyType ──────────────────────────────────────────────

describe('classifyGalaxyType', () => {
  it('returns void for empty curves', () => {
    expect(classifyGalaxyType([])).toBe('void')
  })

  it('classifies spiral-galaxy for high avg + high golden ratio', () => {
    const curves = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeGoldenCurve(richContent, `f${i}.ts`),
    }))
    expect(classifyGalaxyType(curves)).toBe('spiral-galaxy')
  })

  it('classifies void for low scores', () => {
    const curves = [analyzeGoldenCurve('', 'a.ts')]
    expect(classifyGalaxyType(curves)).toBe('void')
  })

  it('classifies barred-spiral for mid-high scores', () => {
    const curves = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenCurve(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'nautilus-perfection' as const,
    }))
    expect(classifyGalaxyType(curves)).toBe('barred-spiral')
  })

  it('classifies proper-vortex for mid scores', () => {
    const curves = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenCurve(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-spiral' as const,
    }))
    expect(classifyGalaxyType(curves)).toBe('proper-vortex')
  })

  it('classifies elliptical for low-mid scores', () => {
    const curves = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenCurve(richContent, 'f.ts'),
      qualityScore: 35,
      condition: 'wonky-curve' as const,
    }))
    expect(classifyGalaxyType(curves)).toBe('elliptical')
  })

  it('classifies irregular for very low scores', () => {
    const curves = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenCurve(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'broken-coil' as const,
    }))
    expect(classifyGalaxyType(curves)).toBe('irregular')
  })
})

// ─── classifyArchitectGrade ─────────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('classifies golden-architect for 80+', () => {
    expect(classifyArchitectGrade(80)).toBe('golden-architect')
    expect(classifyArchitectGrade(100)).toBe('golden-architect')
  })

  it('classifies master-designer for 65-79', () => {
    expect(classifyArchitectGrade(65)).toBe('master-designer')
    expect(classifyArchitectGrade(79)).toBe('master-designer')
  })

  it('classifies skilled-builder for 50-64', () => {
    expect(classifyArchitectGrade(50)).toBe('skilled-builder')
    expect(classifyArchitectGrade(64)).toBe('skilled-builder')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(34)).toBe('novice')
  })

  it('classifies square-peg for 0-19', () => {
    expect(classifyArchitectGrade(0)).toBe('square-peg')
    expect(classifyArchitectGrade(19)).toBe('square-peg')
  })
})

// ─── classifyGalaxyCondition ──────────────────────────────────────────

describe('classifyGalaxyCondition', () => {
  it('classifies golden-age for 75+', () => {
    expect(classifyGalaxyCondition(75)).toBe('golden-age')
    expect(classifyGalaxyCondition(100)).toBe('golden-age')
  })

  it('classifies renaissance for 60-74', () => {
    expect(classifyGalaxyCondition(60)).toBe('renaissance')
    expect(classifyGalaxyCondition(74)).toBe('renaissance')
  })

  it('classifies classical for 45-59', () => {
    expect(classifyGalaxyCondition(45)).toBe('classical')
    expect(classifyGalaxyCondition(59)).toBe('classical')
  })

  it('classifies medieval for 30-44', () => {
    expect(classifyGalaxyCondition(30)).toBe('medieval')
    expect(classifyGalaxyCondition(44)).toBe('medieval')
  })

  it('classifies primitive for 15-29', () => {
    expect(classifyGalaxyCondition(15)).toBe('primitive')
    expect(classifyGalaxyCondition(29)).toBe('primitive')
  })

  it('classifies void for 0-14', () => {
    expect(classifyGalaxyCondition(0)).toBe('void')
    expect(classifyGalaxyCondition(14)).toBe('void')
  })
})

// ─── analyzeGoldenCurve ───────────────────────────────────────────────

describe('analyzeGoldenCurve', () => {
  it('analyzes minimal content', () => {
    const curve = analyzeGoldenCurve(minimalContent, 'minimal.ts')
    expect(curve.file).toBe('minimal.ts')
    expect(curve.fibonacciQuality).toBe(8)
    expect(curve.proportionBalance).toBe(8)
    expect(curve.growthElegance).toBe(0)
    expect(curve.curveSmoothness).toBe(10)
    expect(curve.expansionHarmony).toBe(8)
    expect(curve.qualityScore).toBe(7)
    expect(curve.condition).toBe('straight-line')
    expect(curve.growing.grade).toBe('no-growth')
    expect(curve.balancing.balance).toBe('distorted')
    expect(curve.elegancing.growth).toBe('no-expansion')
    expect(curve.smoothing.curve).toBe('broken-path')
    expect(curve.harmonizing.expansion).toBe('implosion')
  })

  it('analyzes rich content', () => {
    const curve = analyzeGoldenCurve(richContent, 'rich.ts')
    expect(curve.file).toBe('rich.ts')
    expect(curve.fibonacciQuality).toBe(100)
    expect(curve.proportionBalance).toBe(100)
    expect(curve.growthElegance).toBe(100)
    expect(curve.curveSmoothness).toBe(100)
    expect(curve.expansionHarmony).toBe(100)
    expect(curve.qualityScore).toBe(100)
    expect(curve.condition).toBe('golden-masterpiece')
    expect(curve.growing.grade).toBe('golden-ratio')
    expect(curve.balancing.balance).toBe('golden-section')
    expect(curve.elegancing.growth).toBe('elegant-curve')
    expect(curve.smoothing.curve).toBe('logarithmic-perfection')
    expect(curve.harmonizing.expansion).toBe('symphonic-growth')
  })

  it('computes qualityScore as weighted average', () => {
    const curve = analyzeGoldenCurve('export const x = 1', 'mid.ts')
    const expected = Math.round(
      curve.fibonacciQuality * 0.2 +
      curve.proportionBalance * 0.2 +
      curve.growthElegance * 0.2 +
      curve.curveSmoothness * 0.2 +
      curve.expansionHarmony * 0.2,
    )
    expect(curve.qualityScore).toBe(expected)
  })
})

// ─── analyzeSpiralGalaxy ──────────────────────────────────────────────

describe('analyzeSpiralGalaxy', () => {
  it('returns void galaxy for empty curves', () => {
    const galaxy = analyzeSpiralGalaxy([], 'empty-dir')
    expect(galaxy.directory).toBe('empty-dir')
    expect(galaxy.curves).toHaveLength(0)
    expect(galaxy.avgProportion).toBe(0)
    expect(galaxy.avgElegance).toBe(0)
    expect(galaxy.avgHarmony).toBe(0)
    expect(galaxy.goldenMasterpieceCount).toBe(0)
    expect(galaxy.straightLineCount).toBe(0)
    expect(galaxy.galaxyType).toBe('void')
    expect(galaxy.condition).toBe('void')
  })

  it('analyzes galaxy with rich curves', () => {
    const curves = [
      analyzeGoldenCurve(richContent, 'dir/a.ts'),
      analyzeGoldenCurve(richContent, 'dir/b.ts'),
    ]
    const galaxy = analyzeSpiralGalaxy(curves, 'dir')
    expect(galaxy.directory).toBe('dir')
    expect(galaxy.curves).toHaveLength(2)
    expect(galaxy.avgProportion).toBe(100)
    expect(galaxy.avgElegance).toBe(100)
    expect(galaxy.avgHarmony).toBe(100)
    expect(galaxy.goldenMasterpieceCount).toBe(2)
    expect(galaxy.straightLineCount).toBe(0)
    expect(galaxy.galaxyType).toBe('spiral-galaxy')
  })

  it('analyzes galaxy with mixed curves', () => {
    const curves = [
      analyzeGoldenCurve(richContent, 'dir/a.ts'),
      analyzeGoldenCurve(minimalContent, 'dir/b.ts'),
    ]
    const galaxy = analyzeSpiralGalaxy(curves, 'dir')
    expect(galaxy.goldenMasterpieceCount).toBe(1)
    expect(galaxy.straightLineCount).toBe(1)
  })
})

// ─── buildGoldenSpiralResult ──────────────────────────────────────────

describe('buildGoldenSpiralResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildGoldenSpiralResult([], [])
    expect(result.curves).toHaveLength(0)
    expect(result.galaxies).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalGalaxies).toBe(0)
    expect(result.stats.overallProportion).toBe(0)
    expect(result.stats.architectGrade).toBe('square-peg')
    expect(result.universe.isGolden).toBe(false)
    expect(result.universe.overallProportion).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildGoldenSpiralResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.curves).toHaveLength(2)
    expect(result.galaxies).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalGalaxies).toBe(1)
    expect(result.stats.avgFibonacciQuality).toBe(100)
    expect(result.stats.avgProportionBalance).toBe(100)
    expect(result.stats.avgGrowthElegance).toBe(100)
    expect(result.stats.avgCurveSmoothness).toBe(100)
    expect(result.stats.avgExpansionHarmony).toBe(100)
    expect(result.stats.goldenMasterpieceCount).toBe(2)
    expect(result.stats.nautilusPerfectionCount).toBe(0)
    expect(result.stats.properSpiralCount).toBe(0)
    expect(result.stats.wonkyCurveCount).toBe(0)
    expect(result.stats.brokenCoilCount).toBe(0)
    expect(result.stats.straightLineCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighProportionCount).toBe(2)
    expect(result.stats.hasHighEleganceCount).toBe(2)
    expect(result.stats.hasHighSmoothnessCount).toBe(2)
    expect(result.stats.hasHighHarmonyCount).toBe(2)
    expect(result.stats.overallProportion).toBe(100)
    expect(result.stats.architectGrade).toBe('golden-architect')
    expect(result.universe.isGolden).toBe(true)
    expect(result.universe.overallProportion).toBe(100)
    expect(result.stats.bestCurve).toBeTruthy()
    expect(result.stats.mostProportional).toBeTruthy()
    expect(result.stats.mostElegant).toBeTruthy()
    expect(result.stats.smoothest).toBeTruthy()
    expect(result.stats.mostHarmonious).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildGoldenSpiralResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.galaxies).toHaveLength(2)
    const dirs = result.galaxies.map(g => g.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes universe overall proportion correctly', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    expect(result.universe.overallProportion).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('sets isGolden when avgProportion >= 60', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [richContent])
    expect(result.universe.isGolden).toBe(true)
  })

  it('sets isGolden false when avgProportion < 60', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    expect(result.universe.isGolden).toBe(false)
  })

  it('picks best curve by qualityScore', async () => {
    const result = await buildGoldenSpiralResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCurve).toBe('high.ts')
    expect(result.stats.mostProportional).toBe('high.ts')
    expect(result.stats.mostElegant).toBe('high.ts')
    expect(result.stats.smoothest).toBe('high.ts')
    expect(result.stats.mostHarmonious).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildGoldenSpiralResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.goldenMasterpieceCount).toBe(1)
    expect(result.stats.straightLineCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      '450 commands - a golden spiral of code analysis excellence! Your code spirals with fibonacci perfection',
    ])
  })

  it('recommends improving fibonacci quality when low', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const fibRec = result.recommendations.find(r => r.includes('fibonacci quality'))
    expect(fibRec).toBeTruthy()
  })

  it('recommends improving proportion balance when low', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const balRec = result.recommendations.find(r => r.includes('proportion'))
    expect(balRec).toBeTruthy()
  })

  it('recommends improving growth elegance when low', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const eleRec = result.recommendations.find(r => r.includes('elegance'))
    expect(eleRec).toBeTruthy()
  })

  it('recommends improving curve smoothness when low', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const smoRec = result.recommendations.find(r => r.includes('Smooth curve'))
    expect(smoRec).toBeTruthy()
  })

  it('recommends improving expansion harmony when low', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const harRec = result.recommendations.find(r => r.includes('Harmonize expansion'))
    expect(harRec).toBeTruthy()
  })

  it('warns about straight-line files', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const lineRec = result.recommendations.find(r => r.includes('straight line'))
    expect(lineRec).toBeTruthy()
  })

  it('warns about overall poor proportion', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    const propRec = result.recommendations.find(r => r.includes('Overall golden proportion'))
    expect(propRec).toBeTruthy()
  })

  it('lists specific straight-line files to bend', async () => {
    const result = await buildGoldenSpiralResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const bendRec = result.recommendations.find(r => r.includes('Bend these'))
    expect(bendRec).toBeTruthy()
  })

  it('warns when all galaxies are void/irregular', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [''])
    const voidRec = result.recommendations.find(r => r.includes('void or irregular'))
    expect(voidRec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for golden-masterpiece', () => {
    expect(typeof colorGrade('golden-masterpiece')).toBe('string')
  })

  it('returns a string for straight-line', () => {
    expect(typeof colorGrade('straight-line')).toBe('string')
  })

  it('returns a string for spiral-galaxy', () => {
    expect(typeof colorGrade('spiral-galaxy')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCurveTable', () => {
  it('formats a curve', () => {
    const curve = analyzeGoldenCurve(richContent, 'test.ts')
    const output = formatCurveTable(curve)
    expect(output).toContain('test.ts')
    expect(output).toContain('Fibonacci Quality')
    expect(output).toContain('Proportion Balance')
    expect(output).toContain('Growth Elegance')
    expect(output).toContain('Curve Smoothness')
    expect(output).toContain('Expansion Harmony')
  })
})

describe('formatCurvesTable', () => {
  it('handles empty curves', () => {
    const output = formatCurvesTable([])
    expect(output).toContain('No golden curves')
  })

  it('formats multiple curves', () => {
    const curves = [
      analyzeGoldenCurve(richContent, 'a.ts'),
      analyzeGoldenCurve(minimalContent, 'b.ts'),
    ]
    const output = formatCurvesTable(curves)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatGalaxyTable', () => {
  it('formats a galaxy', () => {
    const curves = [analyzeGoldenCurve(richContent, 'dir/a.ts')]
    const galaxy = analyzeSpiralGalaxy(curves, 'dir')
    const output = formatGalaxyTable(galaxy)
    expect(output).toContain('dir')
    expect(output).toContain('Galaxy')
  })
})

describe('formatGalaxiesTable', () => {
  it('handles empty galaxies', () => {
    const output = formatGalaxiesTable([])
    expect(output).toContain('No spiral galaxies')
  })

  it('formats multiple galaxies', () => {
    const curves = [analyzeGoldenCurve(richContent, 'src/a.ts')]
    const galaxies = [analyzeSpiralGalaxy(curves, 'src')]
    const output = formatGalaxiesTable(galaxies)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Golden Spiral Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Architect Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Curve Analysis')
    expect(output).toContain('Spiral Galaxy Analysis')
    expect(output).toContain('Golden Spiral Statistics')
    expect(output).toContain('Universe')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.curves).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.universe.isGolden).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const curve = analyzeGoldenCurve('   \n\t  ', 'blank.ts')
    expect(curve.fibonacciQuality).toBe(0)
    expect(curve.qualityScore).toBe(0)
    expect(curve.condition).toBe('straight-line')
  })

  it('handles content with only comments', () => {
    const curve = analyzeGoldenCurve('// just a comment\n/* block */', 'comment.ts')
    expect(curve.fibonacciQuality).toBe(0)
    expect(curve.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildGoldenSpiralResult(['big.ts'], [longContent])
    expect(result.curves).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildGoldenSpiralResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.goldenMasterpieceCount).toBe(50)
  })

  it('handles single file galaxy', async () => {
    const result = await buildGoldenSpiralResult(['single.ts'], [richContent])
    expect(result.galaxies).toHaveLength(1)
    expect(result.galaxies[0]!.curves).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const curve = analyzeGoldenCurve(richContent, 'cap.ts')
    expect(curve.qualityScore).toBeLessThanOrEqual(100)
    expect(curve.fibonacciQuality).toBeLessThanOrEqual(100)
    expect(curve.proportionBalance).toBeLessThanOrEqual(100)
    expect(curve.growthElegance).toBeLessThanOrEqual(100)
    expect(curve.curveSmoothness).toBeLessThanOrEqual(100)
    expect(curve.expansionHarmony).toBeLessThanOrEqual(100)
  })

  it('handles undefined content gracefully', async () => {
    const result = await buildGoldenSpiralResult(['a.ts'], ['' ])
    expect(result.curves).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildGoldenSpiralResult([], [])
    const r2 = await buildGoldenSpiralResult(['a.ts'], [richContent])
    const r3 = await buildGoldenSpiralResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
