import { describe, it, expect } from 'vitest'
import {
  measureRefractive,
  measureSpectral,
  measureDecomposition,
  measureColorful,
  measureFaceted,
  measurePure,
  analyzePrismFacet,
  classifyCondition,
  classifyArrayType,
  classifyArrayCondition,
  classifyOpticianGrade,
  analyzePrismArray,
  generateRecommendations,
  buildCrystalPrismResult,
  type PrismFacet,
  type CrystalPrismStats,
  type CrystalSpectrum,
} from '../src/commands/crystal-prism-helpers.js'
import {
  scoreColor,
  angleColor,
  rangeColor,
  decompositionColor,
  vividnessColor,
  cutColor,
  clarityColor,
  conditionColor,
  opticianGradeColor,
  formatCrystalPrismJson,
  formatCrystalPrismTable,
} from '../src/commands/crystal-prism-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User {
  id: number
  name: string
  email: string
}

export class UserService {
  private readonly users: Map<number, User> = new Map()

  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      if (user === undefined) {
        return null
      }
      return user
    } catch {
      return null
    }
  }
}

export type Result<T> = { data: T; error?: string }

export function processItems(items: string[]): number {
  const processed = items.filter((item) => item.length > 0)
  return processed.length
}

const config = {
  readonly maxRetries: 3,
  timeout: 5000,
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  const service = new UserService()
  const user = await service.getUser(1)
  const result: Result<User | null> = { data: user }
  console.log(result)
}`

const EMPTY = ''
const MINIMAL = 'const x = 1'
const POOR = 'var x = 1\nvar y: any = 2'

// ─── measureRefractive ─────────────────────────────────────────────────────

describe('measureRefractive', () => {
  it('returns transformation=85 for RICH fixture', () => {
    const result = measureRefractive(RICH)
    expect(result.transformation).toBe(85)
  })

  it('returns perfect-refraction angle for RICH fixture', () => {
    const result = measureRefractive(RICH)
    expect(result.angle).toBe('perfect-refraction')
  })

  it('returns hasHighTransformation=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasHighTransformation).toBe(true)
  })

  it('returns hasCleanTransform=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasCleanTransform).toBe(true)
  })

  it('returns hasProperMapping=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasProperMapping).toBe(true)
  })

  it('returns hasNoDistortion=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasNoDistortion).toBe(true)
  })

  it('returns hasPrecise=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasPrecise).toBe(true)
  })

  it('returns hasNoApproximation=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasNoApproximation).toBe(true)
  })

  it('returns hasNoSkew=true for RICH fixture', () => {
    expect(measureRefractive(RICH).hasNoSkew).toBe(true)
  })

  it('returns zero counts for RICH fixture', () => {
    const result = measureRefractive(RICH)
    expect(result.distortionCount).toBe(0)
    expect(result.approximationCount).toBe(0)
  })

  it('returns transformation=0 for empty content', () => {
    expect(measureRefractive(EMPTY).transformation).toBe(0)
  })

  it('returns shattered angle for empty content', () => {
    expect(measureRefractive(EMPTY).angle).toBe('shattered')
  })

  it('detects var as distortion', () => {
    expect(measureRefractive(POOR).distortionCount).toBe(2)
  })

  it('detects any as approximation', () => {
    expect(measureRefractive(POOR).approximationCount).toBe(1)
  })

  it('returns hasNoDistortion=false when var is present', () => {
    expect(measureRefractive(POOR).hasNoDistortion).toBe(false)
  })
})

// ─── measureSpectral ───────────────────────────────────────────────────────

describe('measureSpectral', () => {
  it('returns variety=72 for RICH fixture', () => {
    expect(measureSpectral(RICH).variety).toBe(72)
  })

  it('returns rich-spectrum range for RICH fixture', () => {
    expect(measureSpectral(RICH).range).toBe('rich-spectrum')
  })

  it('returns hasHighVariety=true for RICH fixture', () => {
    expect(measureSpectral(RICH).hasHighVariety).toBe(true)
  })

  it('returns hasDiverse=true for RICH fixture', () => {
    expect(measureSpectral(RICH).hasDiverse).toBe(true)
  })

  it('returns hasColorful=true for RICH fixture', () => {
    expect(measureSpectral(RICH).hasColorful).toBe(true)
  })

  it('returns hasNoMonotony=true for RICH fixture', () => {
    expect(measureSpectral(RICH).hasNoMonotony).toBe(true)
  })

  it('returns variety=0 for empty content', () => {
    expect(measureSpectral(EMPTY).variety).toBe(0)
  })

  it('returns infrared-only range for empty content', () => {
    expect(measureSpectral(EMPTY).range).toBe('infrared-only')
  })

  it('detects var as monotony', () => {
    expect(measureSpectral(POOR).monotonyCount).toBe(2)
  })

  it('detects any as repetition', () => {
    expect(measureSpectral(POOR).repetitionCount).toBe(1)
  })
})

// ─── measureDecomposition ──────────────────────────────────────────────────

describe('measureDecomposition', () => {
  it('returns clarity=98 for RICH fixture', () => {
    expect(measureDecomposition(RICH).clarity).toBe(98)
  })

  it('returns atomic-clarity quality for RICH fixture', () => {
    expect(measureDecomposition(RICH).quality).toBe('atomic-clarity')
  })

  it('returns hasHighClarity=true for RICH fixture', () => {
    expect(measureDecomposition(RICH).hasHighClarity).toBe(true)
  })

  it('returns hasDecomposed=true for RICH fixture', () => {
    expect(measureDecomposition(RICH).hasDecomposed).toBe(true)
  })

  it('returns hasSeparation=true for RICH fixture', () => {
    expect(measureDecomposition(RICH).hasSeparation).toBe(true)
  })

  it('returns hasGranular=true for RICH fixture', () => {
    expect(measureDecomposition(RICH).hasGranular).toBe(true)
  })

  it('returns hasModular=true for RICH fixture', () => {
    expect(measureDecomposition(RICH).hasModular).toBe(true)
  })

  it('returns clarity=0 for empty content', () => {
    expect(measureDecomposition(EMPTY).clarity).toBe(0)
  })

  it('detects var as monolith', () => {
    expect(measureDecomposition(POOR).monolithCount).toBe(2)
  })

  it('detects any as blob', () => {
    expect(measureDecomposition(POOR).blobCount).toBe(1)
  })
})

// ─── measureColorful ───────────────────────────────────────────────────────

describe('measureColorful', () => {
  it('returns distinction=96 for RICH fixture', () => {
    expect(measureColorful(RICH).distinction).toBe(96)
  })

  it('returns vivid-spectrum vividness for RICH fixture', () => {
    expect(measureColorful(RICH).vividness).toBe('vivid-spectrum')
  })

  it('returns hasHighDistinction=true for RICH fixture', () => {
    expect(measureColorful(RICH).hasHighDistinction).toBe(true)
  })

  it('returns hasDistinct=true for RICH fixture', () => {
    expect(measureColorful(RICH).hasDistinct).toBe(true)
  })

  it('returns hasClearBoundaries=true for RICH fixture', () => {
    expect(measureColorful(RICH).hasClearBoundaries).toBe(true)
  })

  it('returns hasContrast=true for RICH fixture', () => {
    expect(measureColorful(RICH).hasContrast).toBe(true)
  })

  it('returns hasVivid=true for RICH fixture', () => {
    expect(measureColorful(RICH).hasVivid).toBe(true)
  })

  it('returns distinction=0 for empty content', () => {
    expect(measureColorful(EMPTY).distinction).toBe(0)
  })

  it('returns gray vividness for empty content', () => {
    expect(measureColorful(EMPTY).vividness).toBe('gray')
  })

  it('detects var as blurring', () => {
    expect(measureColorful(POOR).blurringCount).toBe(2)
  })
})

// ─── measureFaceted ────────────────────────────────────────────────────────

describe('measureFaceted', () => {
  it('returns quality=100 for RICH fixture', () => {
    expect(measureFaceted(RICH).quality).toBe(100)
  })

  it('returns brilliant-cut cut for RICH fixture', () => {
    expect(measureFaceted(RICH).cut).toBe('brilliant-cut')
  })

  it('returns hasHighQuality=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasHighQuality).toBe(true)
  })

  it('returns hasCleanAPI=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasCleanAPI).toBe(true)
  })

  it('returns hasSharpEdges=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasSharpEdges).toBe(true)
  })

  it('returns hasPolished=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasPolished).toBe(true)
  })

  it('returns hasSmooth=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasSmooth).toBe(true)
  })

  it('returns hasRefined=true for RICH fixture', () => {
    expect(measureFaceted(RICH).hasRefined).toBe(true)
  })

  it('returns quality=0 for empty content', () => {
    expect(measureFaceted(EMPTY).quality).toBe(0)
  })

  it('returns uncut for empty content', () => {
    expect(measureFaceted(EMPTY).cut).toBe('uncut')
  })

  it('detects var as roughness', () => {
    expect(measureFaceted(POOR).roughnessCount).toBe(2)
  })

  it('detects any as crude', () => {
    expect(measureFaceted(POOR).crudeCount).toBe(1)
  })
})

// ─── measurePure ───────────────────────────────────────────────────────────

describe('measurePure', () => {
  it('returns transparency=100 for RICH fixture', () => {
    expect(measurePure(RICH).transparency).toBe(100)
  })

  it('returns flawless-crystal clarity for RICH fixture', () => {
    expect(measurePure(RICH).clarity).toBe('flawless-crystal')
  })

  it('returns hasHighTransparency=true for RICH fixture', () => {
    expect(measurePure(RICH).hasHighTransparency).toBe(true)
  })

  it('returns hasTransparent=true for RICH fixture', () => {
    expect(measurePure(RICH).hasTransparent).toBe(true)
  })

  it('returns hasVisible=true for RICH fixture', () => {
    expect(measurePure(RICH).hasVisible).toBe(true)
  })

  it('returns hasClear=true for RICH fixture', () => {
    expect(measurePure(RICH).hasClear).toBe(true)
  })

  it('returns hasOpen=true for RICH fixture', () => {
    expect(measurePure(RICH).hasOpen).toBe(true)
  })

  it('returns transparency=0 for empty content', () => {
    expect(measurePure(EMPTY).transparency).toBe(0)
  })

  it('returns opaque clarity for empty content', () => {
    expect(measurePure(EMPTY).clarity).toBe('opaque')
  })

  it('detects var as hiding', () => {
    expect(measurePure(POOR).hidingCount).toBe(2)
  })

  it('detects any as obfuscation', () => {
    expect(measurePure(POOR).obfuscationCount).toBe(1)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns perfect-prism for score >= 85', () => {
    expect(classifyCondition(90)).toBe('perfect-prism')
  })

  it('returns fine-crystal for score >= 70', () => {
    expect(classifyCondition(75)).toBe('fine-crystal')
  })

  it('returns clear-glass for score >= 55', () => {
    expect(classifyCondition(60)).toBe('clear-glass')
  })

  it('returns cloudy-prism for score >= 40', () => {
    expect(classifyCondition(45)).toBe('cloudy-prism')
  })

  it('returns cracked-crystal for score >= 25', () => {
    expect(classifyCondition(30)).toBe('cracked-crystal')
  })

  it('returns shattered for score < 25', () => {
    expect(classifyCondition(10)).toBe('shattered')
  })
})

// ─── classifyArrayType ─────────────────────────────────────────────────────

describe('classifyArrayType', () => {
  it('returns shards for empty facets', () => {
    expect(classifyArrayType([])).toBe('shards')
  })

  it('returns chandelier for high-quality all-perfect facets', () => {
    const facets = Array.from({ length: 2 }, (_, i) => ({
      ...analyzePrismFacet(RICH, `f${i}.ts`),
    }))
    expect(classifyArrayType(facets)).toBe('chandelier')
  })

  it('returns shards for low-quality facets', () => {
    const facets = [analyzePrismFacet(MINIMAL, 'a.ts')]
    expect(classifyArrayType(facets)).toBe('shards')
  })
})

// ─── classifyArrayCondition ────────────────────────────────────────────────

describe('classifyArrayCondition', () => {
  it('returns brilliant-display for avgQs >= 75', () => {
    expect(classifyArrayCondition(80)).toBe('brilliant-display')
  })

  it('returns clear-spectrum for avgQs >= 60', () => {
    expect(classifyArrayCondition(65)).toBe('clear-spectrum')
  })

  it('returns proper-refraction for avgQs >= 45', () => {
    expect(classifyArrayCondition(50)).toBe('proper-refraction')
  })

  it('returns dim-display for avgQs >= 30', () => {
    expect(classifyArrayCondition(35)).toBe('dim-display')
  })

  it('returns cracked-array for avgQs >= 15', () => {
    expect(classifyArrayCondition(20)).toBe('cracked-array')
  })

  it('returns darkness for avgQs < 15', () => {
    expect(classifyArrayCondition(5)).toBe('darkness')
  })
})

// ─── classifyOpticianGrade ─────────────────────────────────────────────────

describe('classifyOpticianGrade', () => {
  it('returns master-optician for brilliance >= 80', () => {
    expect(classifyOpticianGrade(85)).toBe('master-optician')
  })

  it('returns expert-lapidary for brilliance >= 65', () => {
    expect(classifyOpticianGrade(70)).toBe('expert-lapidary')
  })

  it('returns skilled-cutter for brilliance >= 50', () => {
    expect(classifyOpticianGrade(55)).toBe('skilled-cutter')
  })

  it('returns apprentice for brilliance >= 35', () => {
    expect(classifyOpticianGrade(40)).toBe('apprentice')
  })

  it('returns novice for brilliance >= 20', () => {
    expect(classifyOpticianGrade(25)).toBe('novice')
  })

  it('returns rock-tumbler for brilliance < 20', () => {
    expect(classifyOpticianGrade(10)).toBe('rock-tumbler')
  })
})

// ─── analyzePrismFacet ─────────────────────────────────────────────────────

describe('analyzePrismFacet', () => {
  it('returns qualityScore=92 for RICH fixture', () => {
    expect(analyzePrismFacet(RICH, 'rich.ts').qualityScore).toBe(92)
  })

  it('returns perfect-prism condition for RICH fixture', () => {
    expect(analyzePrismFacet(RICH, 'rich.ts').condition).toBe('perfect-prism')
  })

  it('returns qualityScore=0 for empty content', () => {
    expect(analyzePrismFacet(EMPTY, 'empty.ts').qualityScore).toBe(0)
  })

  it('returns shattered condition for empty content', () => {
    expect(analyzePrismFacet(EMPTY, 'empty.ts').condition).toBe('shattered')
  })

  it('returns qualityScore=9 for MINIMAL fixture', () => {
    expect(analyzePrismFacet(MINIMAL, 'minimal.ts').qualityScore).toBe(9)
  })

  it('returns qualityScore=1 for POOR fixture', () => {
    expect(analyzePrismFacet(POOR, 'poor.ts').qualityScore).toBe(1)
  })

  it('stores file path correctly', () => {
    expect(analyzePrismFacet(RICH, 'my/file.ts').file).toBe('my/file.ts')
  })

  it('computes refraction score from measureRefractive', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.refraction).toBe(85)
  })

  it('computes spectrumAnalysis from measureSpectral', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.spectrumAnalysis).toBe(72)
  })

  it('computes lightDecomposition from measureDecomposition', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.lightDecomposition).toBe(98)
  })

  it('computes colorClarity from measureColorful', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.colorClarity).toBe(96)
  })

  it('computes facetQuality from measureFaceted', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.facetQuality).toBe(100)
  })

  it('computes opticalPurity from measurePure', () => {
    const facet = analyzePrismFacet(RICH, 'rich.ts')
    expect(facet.opticalPurity).toBe(100)
  })
})

// ─── analyzePrismArray ─────────────────────────────────────────────────────

describe('analyzePrismArray', () => {
  it('returns empty array for no facets', () => {
    const arr = analyzePrismArray([], 'empty-dir')
    expect(arr.facets).toEqual([])
    expect(arr.avgRefraction).toBe(0)
    expect(arr.arrayType).toBe('shards')
    expect(arr.condition).toBe('darkness')
  })

  it('computes averages from facets', () => {
    const facets = [analyzePrismFacet(RICH, 'a.ts'), analyzePrismFacet(MINIMAL, 'b.ts')]
    const arr = analyzePrismArray(facets, 'src')
    expect(arr.avgRefraction).toBe(Math.round((85 + 10) / 2))
    expect(arr.directory).toBe('src')
  })

  it('counts condition types', () => {
    const facets = [analyzePrismFacet(RICH, 'a.ts'), analyzePrismFacet(EMPTY, 'b.ts')]
    const arr = analyzePrismArray(facets, 'src')
    expect(arr.perfectPrismCount).toBe(1)
    expect(arr.shatteredCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect prism message for high-quality code', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Your code is a perfect prism! Every facet refracts light into brilliant clarity',
    ])
  })

  it('generates recommendations for low-scoring code', () => {
    const result = buildCrystalPrismResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('recommends refraction improvement when avgRefraction < 50', () => {
    const result = buildCrystalPrismResult(['a.ts', 'b.ts', 'c.ts'], [RICH, MINIMAL, POOR])
    expect(result.recommendations.some((r) => r.includes('refraction'))).toBe(true)
  })
})

// ─── buildCrystalPrismResult ───────────────────────────────────────────────

describe('buildCrystalPrismResult', () => {
  it('returns correct structure for single RICH file', () => {
    const result = buildCrystalPrismResult(['rich.ts'], [RICH])
    expect(result.facets.length).toBe(1)
    expect(result.arrays.length).toBe(1)
    expect(result.spectrum.avgRefraction).toBe(85)
    expect(result.spectrum.avgClarity).toBe(98)
    expect(result.spectrum.avgPurity).toBe(100)
    expect(result.spectrum.isBrilliant).toBe(true)
    expect(result.spectrum.overallBrilliance).toBe(94)
  })

  it('returns correct stats for RICH fixture', () => {
    const result = buildCrystalPrismResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalArrays).toBe(1)
    expect(result.stats.avgRefraction).toBe(85)
    expect(result.stats.avgSpectrumAnalysis).toBe(72)
    expect(result.stats.avgLightDecomposition).toBe(98)
    expect(result.stats.avgColorClarity).toBe(96)
    expect(result.stats.avgFacetQuality).toBe(100)
    expect(result.stats.avgOpticalPurity).toBe(100)
    expect(result.stats.perfectPrismCount).toBe(1)
    expect(result.stats.fineCrystalCount).toBe(0)
    expect(result.stats.clearGlassCount).toBe(0)
    expect(result.stats.cloudyPrismCount).toBe(0)
    expect(result.stats.crackedCrystalCount).toBe(0)
    expect(result.stats.shatteredCount).toBe(0)
    expect(result.stats.hasHighTransformationCount).toBe(1)
    expect(result.stats.hasHighVarietyCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighDistinctionCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighTransparencyCount).toBe(1)
    expect(result.stats.overallBrilliance).toBe(94)
    expect(result.stats.opticianGrade).toBe('master-optician')
    expect(result.stats.bestFacet).toBe('rich.ts')
    expect(result.stats.bestRefraction).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostDistinct).toBe('rich.ts')
    expect(result.stats.bestInterface).toBe('rich.ts')
  })

  it('returns empty structure for empty input', () => {
    const result = buildCrystalPrismResult([], [])
    expect(result.facets).toEqual([])
    expect(result.arrays).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.spectrum.isBrilliant).toBe(false)
  })

  it('groups files by directory into arrays', () => {
    const result = buildCrystalPrismResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.arrays.length).toBe(2)
    expect(result.stats.totalArrays).toBe(2)
  })

  it('computes correct multi-file stats', () => {
    const result = buildCrystalPrismResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.avgRefraction).toBe(32)
    expect(result.stats.avgSpectrumAnalysis).toBe(27)
    expect(result.stats.avgLightDecomposition).toBe(35)
    expect(result.stats.avgColorClarity).toBe(32)
    expect(result.stats.avgFacetQuality).toBe(41)
    expect(result.stats.avgOpticalPurity).toBe(37)
    expect(result.stats.perfectPrismCount).toBe(1)
    expect(result.stats.shatteredCount).toBe(2)
    expect(result.stats.overallBrilliance).toBe(35)
    expect(result.stats.opticianGrade).toBe('apprentice')
  })

  it('picks correct best facets for multi-file', () => {
    const result = buildCrystalPrismResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.stats.bestFacet).toBe('src/a.ts')
    expect(result.stats.bestRefraction).toBe('src/a.ts')
    expect(result.stats.mostDiverse).toBe('src/a.ts')
    expect(result.stats.clearest).toBe('src/a.ts')
    expect(result.stats.mostDistinct).toBe('src/a.ts')
    expect(result.stats.bestInterface).toBe('src/a.ts')
  })

  it('handles mismatched files/contents gracefully', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH, RICH])
    expect(result.facets.length).toBe(1)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatCrystalPrismJson', () => {
  it('returns valid JSON string', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH])
    const json = formatCrystalPrismJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatCrystalPrismTable', () => {
  it('returns non-empty string for RICH result', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH])
    const table = formatCrystalPrismTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('includes per-file details when verbose', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH])
    const table = formatCrystalPrismTable(result, true)
    expect(table).toContain('Per-File Facets')
  })

  it('does not include per-file details when not verbose', () => {
    const result = buildCrystalPrismResult(['a.ts'], [RICH])
    const table = formatCrystalPrismTable(result, false)
    expect(table).not.toContain('Per-File Facets')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for any score', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('angleColor', () => {
  it('returns input for unknown value', () => {
    expect(angleColor('unknown')).toBe('unknown')
  })
})

describe('rangeColor', () => {
  it('returns input for unknown value', () => {
    expect(rangeColor('unknown')).toBe('unknown')
  })
})

describe('opticianGradeColor', () => {
  it('returns input for unknown value', () => {
    expect(opticianGradeColor('unknown')).toBe('unknown')
  })
})

describe('conditionColor', () => {
  it('returns input for unknown value', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('decompositionColor', () => {
  it('returns input for unknown value', () => {
    expect(decompositionColor('unknown')).toBe('unknown')
  })
})

describe('vividnessColor', () => {
  it('returns input for unknown value', () => {
    expect(vividnessColor('unknown')).toBe('unknown')
  })
})

describe('cutColor', () => {
  it('returns input for unknown value', () => {
    expect(cutColor('unknown')).toBe('unknown')
  })
})

describe('clarityColor', () => {
  it('returns input for unknown value', () => {
    expect(clarityColor('unknown')).toBe('unknown')
  })
})
