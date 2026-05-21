import { describe, expect, it } from 'vitest'
import {
  countLoc,
  countFunctions,
  countClasses,
  countInterfaces,
  countTypes,
  countEnums,
  countExports,
  countImports,
  countJSDoc,
  countComments,
  countErrorHandling,
  countTypeAnnotations,
  countTodos,
  countConsole,
  countBranches,
  countDescriptiveNames,
  countDefaults,
  countDeprecated,
  countReturnTypes,
  countGenerics,
  countArrowFunctions,
  countAsync,
  countAwait,
  hasConflictingPatterns,
  measureSoil,
  measureGrape,
  measureVintage,
  measureAging,
  measureAroma,
  measureBody,
  analyzeVineyardPlot,
  classifyCondition,
  analyzeWineRegion,
  classifyRegionType,
  classifyRegionCondition,
  classifySommelierGrade,
  generateRecommendations,
  buildVineyardTerroirResult,
  type SoilMeasure,
  type VintageMeasure,
  type VineyardPlot,
} from '../src/commands/vineyard-terroir-helpers.js'
import {
  formatVineyardTerroirJson,
  formatVineyardTerroirTable,
  scoreColor,
  soilTypeColor,
  conditionColor,
  grapeTypeColor,
  vintageYearColor,
  cellarColor,
  bouquetColor,
  bodyCharColor,
  sommelierGradeColor,
  regionConditionColor,
  formatPlot,
  formatRegion,
  formatStats,
} from '../src/commands/vineyard-terroir-format-helpers.js'

// ─── Test Content Fixtures ──────────────────────────────

const emptyContent = ''

const goodContent = `/**
 * Add two numbers
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Multiply
 */
export function multiply(a: number, b: number): number {
  return a * b
}

export interface Calc {
  x: number
  y: number
  result: number
}

export class Calculator {
  private value: number = 0
  add(n: number): void { this.value += n }
  getResult(): number { return this.value }
}
`

const poorContent = 'var x = 1\nvar y = 2\nconsole.log(x + y)\n// TODO: fix this\n// TODO: refactor\n// @deprecated\nvar z = x + y'

// ─── Counting Utilities ─────────────────────────────────

describe('countLoc', () => {
  it('returns 0 for empty string', () => { expect(countLoc('')).toBe(0) })
  it('counts non-empty lines', () => { expect(countLoc('const a = 1\n\nconst b = 2')).toBe(2) })
})

describe('countFunctions', () => {
  it('returns 0 for empty string', () => { expect(countFunctions('')).toBe(0) })
  it('counts function declarations', () => { expect(countFunctions('function foo() {}')).toBe(1) })
})

describe('countClasses', () => {
  it('returns 0 for empty string', () => { expect(countClasses('')).toBe(0) })
  it('counts class declarations', () => { expect(countClasses('class Foo {}')).toBe(1) })
})

describe('countInterfaces', () => {
  it('returns 0 for empty string', () => { expect(countInterfaces('')).toBe(0) })
  it('counts interface declarations', () => { expect(countInterfaces('interface Foo {}')).toBe(1) })
})

describe('countTypes', () => {
  it('returns 0 for empty string', () => { expect(countTypes('')).toBe(0) })
  it('counts type aliases', () => { expect(countTypes('type Foo = string')).toBe(1) })
})

describe('countEnums', () => {
  it('returns 0 for empty string', () => { expect(countEnums('')).toBe(0) })
  it('counts enum declarations', () => { expect(countEnums('enum Direction { Up }')).toBe(1) })
})

describe('countExports', () => {
  it('returns 0 for empty string', () => { expect(countExports('')).toBe(0) })
  it('counts export statements', () => { expect(countExports('export const a = 1')).toBe(1) })
})

describe('countImports', () => {
  it('returns 0 for empty string', () => { expect(countImports('')).toBe(0) })
  it('counts import statements', () => { expect(countImports("import { foo } from 'bar'")).toBe(1) })
})

describe('countJSDoc', () => {
  it('returns 0 for empty string', () => { expect(countJSDoc('')).toBe(0) })
  it('counts JSDoc blocks', () => { expect(countJSDoc(goodContent)).toBe(2) })
})

describe('countComments', () => {
  it('returns 0 for empty string', () => { expect(countComments('')).toBe(0) })
  it('counts line comments', () => { expect(countComments('// foo')).toBe(1) })
})

describe('countErrorHandling', () => {
  it('returns 0 for empty string', () => { expect(countErrorHandling('')).toBe(0) })
  it('counts catch/finally/throw', () => { expect(countErrorHandling('try {} catch(e) {}')).toBe(1) })
})

describe('countTypeAnnotations', () => {
  it('returns 0 for empty string', () => { expect(countTypeAnnotations('')).toBe(0) })
  it('counts type annotations', () => { expect(countTypeAnnotations('const x: number = 1')).toBe(1) })
})

describe('countTodos', () => {
  it('returns 0 for empty string', () => { expect(countTodos('')).toBe(0) })
  it('counts TODO markers', () => { expect(countTodos(poorContent)).toBe(2) })
})

describe('countConsole', () => {
  it('returns 0 for empty string', () => { expect(countConsole('')).toBe(0) })
  it('counts console calls', () => { expect(countConsole('console.log("hi")')).toBe(1) })
})

describe('countBranches', () => {
  it('returns 0 for empty string', () => { expect(countBranches('')).toBe(0) })
  it('counts if branches', () => { expect(countBranches('if (x) {}')).toBe(1) })
})

describe('countDescriptiveNames', () => {
  it('returns 0 for empty string', () => { expect(countDescriptiveNames('')).toBe(0) })
  it('counts descriptive names', () => { expect(countDescriptiveNames('function getData() {}')).toBe(1) })
})

describe('countDefaults', () => {
  it('returns 0 for empty string', () => { expect(countDefaults('')).toBe(0) })
  it('counts default keywords', () => { expect(countDefaults('export default class {}')).toBe(1) })
})

describe('countDeprecated', () => {
  it('returns 0 for empty string', () => { expect(countDeprecated('')).toBe(0) })
  it('counts deprecated markers', () => { expect(countDeprecated(poorContent)).toBe(1) })
})

describe('countReturnTypes', () => {
  it('returns 0 for empty string', () => { expect(countReturnTypes('')).toBe(0) })
  it('counts return types', () => { expect(countReturnTypes('function foo(): string {}')).toBe(1) })
})

describe('countGenerics', () => {
  it('returns 0 for empty string', () => { expect(countGenerics('')).toBe(0) })
  it('counts generics', () => { expect(countGenerics('function foo<T>() {}')).toBe(1) })
})

describe('countArrowFunctions', () => {
  it('returns 0 for empty string', () => { expect(countArrowFunctions('')).toBe(0) })
  it('counts arrows', () => { expect(countArrowFunctions('const f = () => 1')).toBe(1) })
})

describe('countAsync', () => {
  it('returns 0 for empty string', () => { expect(countAsync('')).toBe(0) })
  it('counts async keywords', () => { expect(countAsync('async function foo() {}')).toBe(1) })
})

describe('countAwait', () => {
  it('returns 0 for empty string', () => { expect(countAwait('')).toBe(0) })
  it('counts await keywords', () => { expect(countAwait('await foo()')).toBe(1) })
})

// ─── Soil Measurement ───────────────────────────────────

describe('measureSoil', () => {
  it('returns base values for empty content', () => {
    const result = measureSoil('')
    expect(result.quality).toBe(10)
    expect(result.type).toBe('dirt')
    expect(result.hasMineralComplexity).toBe(false)
    expect(result.hasGoodDrainage).toBe(false)
    expect(result.hasErosion).toBe(false)
    expect(result.hasLivingSoil).toBe(false)
    expect(result.erosionCount).toBe(0)
  })

  it('returns limestone for well-structured code', () => {
    const result = measureSoil(goodContent)
    expect(result.quality).toBe(80)
    expect(result.type).toBe('limestone')
    expect(result.hasMineralComplexity).toBe(false)
    expect(result.hasGoodDrainage).toBe(false)
    expect(result.hasNutrientBalance).toBe(false)
  })

  it('detects erosion in poor code', () => {
    const result = measureSoil(poorContent)
    expect(result.hasErosion).toBe(true)
    expect(result.erosionCount).toBeGreaterThan(0)
  })
})

// ─── Grape Measurement ──────────────────────────────────

describe('measureGrape', () => {
  it('returns base values for empty content', () => {
    const result = measureGrape('')
    expect(result.variety).toBe(5)
    expect(result.type).toBe('table-grape')
    expect(result.isNobleVariety).toBe(false)
    expect(result.hasGreenHarvest).toBe(true)
    expect(result.isOrganic).toBe(false)
  })

  it('classifies good code as pinot-noir', () => {
    const result = measureGrape(goodContent)
    expect(result.variety).toBe(48)
    expect(result.type).toBe('pinot-noir')
    expect(result.isNobleVariety).toBe(false)
  })

  it('classifies poor code as table-grape', () => {
    const result = measureGrape(poorContent)
    expect(result.type).toBe('table-grape')
    expect(result.hasGreenHarvest).toBe(false)
  })
})

// ─── Vintage Measurement ────────────────────────────────

describe('measureVintage', () => {
  it('returns base values for empty content', () => {
    const result = measureVintage('')
    expect(result.character).toBe(5)
    expect(result.year).toBe('poor')
    expect(result.isReadyToDrink).toBe(false)
    expect(result.agingYears).toBe(1)
  })

  it('classifies good code as legendary vintage', () => {
    const result = measureVintage(goodContent)
    expect(result.character).toBe(90)
    expect(result.year).toBe('legendary')
    expect(result.isReadyToDrink).toBe(true)
  })

  it('classifies poor code as poor vintage', () => {
    const result = measureVintage(poorContent)
    expect(result.year).toBe('poor')
  })
})

// ─── Aging Measurement ──────────────────────────────────

describe('measureAging', () => {
  it('returns base values for empty content', () => {
    const result = measureAging('')
    expect(result.potential).toBe(5)
    expect(result.cellar).toBe('box-wine')
    expect(result.cellarWorthy).toBe(false)
    expect(result.hasProperTannins).toBe(false)
  })

  it('returns concrete-egg for good code', () => {
    const result = measureAging(goodContent)
    expect(result.potential).toBe(75)
    expect(result.cellar).toBe('concrete-egg')
    expect(result.cellarWorthy).toBe(true)
    expect(result.hasCorkQuality).toBe(true)
  })

  it('returns box-wine for poor code', () => {
    const result = measureAging(poorContent)
    expect(result.cellar).toBe('box-wine')
    expect(result.cellarWorthy).toBe(false)
  })
})

// ─── Aroma Measurement ──────────────────────────────────

describe('measureAroma', () => {
  it('returns base values for empty content', () => {
    const result = measureAroma('')
    expect(result.quality).toBe(5)
    expect(result.bouquet).toBe('simple')
    expect(result.hasCorkTaint).toBe(false)
    expect(result.corkTaintCount).toBe(0)
  })

  it('detects elegant bouquet for good code', () => {
    const result = measureAroma(goodContent)
    expect(result.quality).toBe(90)
    expect(result.bouquet).toBe('elegant')
    expect(result.hasCorkTaint).toBe(false)
    expect(result.hasFloralNotes).toBe(true)
  })

  it('detects cork taint in poor code', () => {
    const result = measureAroma(poorContent)
    expect(result.hasCorkTaint).toBe(true)
    expect(result.corkTaintCount).toBeGreaterThan(0)
  })
})

// ─── Body Measurement ───────────────────────────────────

describe('measureBody', () => {
  it('returns base values for empty content', () => {
    const result = measureBody('')
    expect(result.weight).toBe(5)
    expect(result.character).toBe('watery')
    expect(result.hasProperStructure).toBe(false)
    expect(result.finishLength).toBe(0)
  })

  it('detects light-bodied for good code', () => {
    const result = measureBody(goodContent)
    expect(result.weight).toBe(27)
    expect(result.character).toBe('light-bodied')
    expect(result.hasLegs).toBe(true)
  })
})

// ─── hasConflictingPatterns ─────────────────────────────

describe('hasConflictingPatterns', () => {
  it('returns false for empty content', () => {
    expect(hasConflictingPatterns('')).toBe(false)
  })

  it('returns true for mixed var/let', () => {
    expect(hasConflictingPatterns('var x = 1; let y = 2')).toBe(true)
  })

  it('returns false for consistent patterns', () => {
    expect(hasConflictingPatterns('const x = 1; const y = 2')).toBe(false)
  })
})

// ─── Plot Analysis ──────────────────────────────────────

describe('analyzeVineyardPlot', () => {
  it('analyzes empty content as vinegar', () => {
    const plot = analyzeVineyardPlot('', 'empty.ts')
    expect(plot.file).toBe('empty.ts')
    expect(plot.qualityScore).toBe(6)
    expect(plot.condition).toBe('vinegar')
  })

  it('analyzes good code as premier-cru', () => {
    const plot = analyzeVineyardPlot(goodContent, 'calc.ts')
    expect(plot.qualityScore).toBe(70)
    expect(plot.condition).toBe('premier-cru')
  })

  it('analyzes poor code as vinegar', () => {
    const plot = analyzeVineyardPlot(poorContent, 'poor.ts')
    expect(plot.qualityScore).toBe(4)
    expect(plot.condition).toBe('vinegar')
  })

  it('populates all measure fields', () => {
    const plot = analyzeVineyardPlot(goodContent, 'test.ts')
    expect(plot.soil).toBeDefined()
    expect(plot.grape).toBeDefined()
    expect(plot.vintage).toBeDefined()
    expect(plot.aging).toBeDefined()
    expect(plot.aroma).toBeDefined()
    expect(plot.body).toBeDefined()
  })
})

// ─── Condition Classification ───────────────────────────

describe('classifyCondition', () => {
  const baseSoil: SoilMeasure = {
    quality: 80, type: 'limestone', hasMineralComplexity: true, hasGoodDrainage: true,
    hasDeepTopsoil: true, hasProperPH: true, hasTerroirCharacter: true,
    hasErosion: false, hasCompaction: false, hasNutrientBalance: true,
    hasLivingSoil: true, erosionCount: 0,
  }
  const baseVintage: VintageMeasure = {
    character: 90, year: 'legendary', isReadyToDrink: true, hasAging: true,
    hasVintageVariation: false, hasReserveQuality: true, hasGrandCru: true,
    hasPremierCru: true, hasTableWine: false, hasVintageChart: true, agingYears: 18,
  }

  it('returns grand-cru for top scores with mineral complexity', () => {
    expect(classifyCondition(85, baseSoil, baseVintage)).toBe('grand-cru')
  })

  it('returns premier-cru for terroir character', () => {
    expect(classifyCondition(70, { ...baseSoil, hasMineralComplexity: false }, baseVintage)).toBe('premier-cru')
  })

  it('returns cru-bourgeois for moderate scores', () => {
    expect(classifyCondition(55, baseSoil, baseVintage)).toBe('cru-bourgeois')
  })

  it('returns vin-de-pays for below moderate', () => {
    expect(classifyCondition(38, baseSoil, baseVintage)).toBe('vin-de-pays')
  })

  it('returns table-wine for low scores', () => {
    expect(classifyCondition(22, baseSoil, baseVintage)).toBe('table-wine')
  })

  it('returns vinegar for bottom scores', () => {
    expect(classifyCondition(8, baseSoil, baseVintage)).toBe('vinegar')
  })
})

// ─── Region Analysis ────────────────────────────────────

describe('analyzeWineRegion', () => {
  it('returns backyard for empty plots', () => {
    const ws = analyzeWineRegion([], '.')
    expect(ws.directory).toBe('.')
    expect(ws.regionType).toBe('backyard')
    expect(ws.condition).toBe('wasteland')
  })

  it('aggregates plot metrics', () => {
    const plots = [
      analyzeVineyardPlot(goodContent, 'src/a.ts'),
      analyzeVineyardPlot(poorContent, 'src/b.ts'),
    ]
    const ws = analyzeWineRegion(plots, 'src')
    expect(ws.plots.length).toBe(2)
    expect(ws.grandCruCount).toBe(0)
    expect(ws.vinegarCount).toBe(1)
  })
})

describe('classifyRegionType', () => {
  const makePlot = (score: number): VineyardPlot => ({
    file: 'test.ts',
    soilQuality: 80, grapeVariety: 50, vintageCharacter: 80,
    agingPotential: 70, bouquet: 80, bodyScore: 50,
    soil: measureSoil(goodContent),
    grape: measureGrape(goodContent),
    vintage: measureVintage(goodContent),
    aging: measureAging(goodContent),
    aroma: measureAroma(goodContent),
    body: measureBody(goodContent),
    condition: 'grand-cru',
    qualityScore: score,
  })

  it('returns backyard for empty array', () => {
    expect(classifyRegionType([], 50)).toBe('backyard')
  })

  it('returns bordeaux for high grand ratio', () => {
    const plots = [makePlot(90), makePlot(90)]
    expect(classifyRegionType(plots, 80)).toBe('bordeaux')
  })

  it('returns backyard for very low quality', () => {
    expect(classifyRegionType([makePlot(10)], 10)).toBe('backyard')
  })
})

describe('classifyRegionCondition', () => {
  it('returns correct conditions', () => {
    expect(classifyRegionCondition(80)).toBe('legendary-region')
    expect(classifyRegionCondition(65)).toBe('premium-appellation')
    expect(classifyRegionCondition(50)).toBe('quality-region')
    expect(classifyRegionCondition(35)).toBe('growing-region')
    expect(classifyRegionCondition(20)).toBe('emerging')
    expect(classifyRegionCondition(5)).toBe('wasteland')
  })
})

// ─── Sommelier Grade ────────────────────────────────────

describe('classifySommelierGrade', () => {
  it('returns correct grades', () => {
    expect(classifySommelierGrade(80)).toBe('master-sommelier')
    expect(classifySommelierGrade(75)).toBe('master-sommelier')
    expect(classifySommelierGrade(60)).toBe('advanced-sommelier')
    expect(classifySommelierGrade(45)).toBe('sommelier')
    expect(classifySommelierGrade(30)).toBe('wine-steward')
    expect(classifySommelierGrade(15)).toBe('enthusiast')
    expect(classifySommelierGrade(5)).toBe('box-wine-drinker')
  })
})

// ─── Recommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for poor code', () => {
    const result = buildVineyardTerroirResult(['bad.ts'], [poorContent])
    const recs = generateRecommendations(result.plots, result.regions, result.estate, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message for balanced code', () => {
    const balanced = `/**
 * Balanced module
 */
import { foo } from 'bar'
import { baz } from 'qux'

/**
 * Get data
 */
export function getData(): string {
  return 'data'
}

/**
 * Process items
 */
export function processItems(): void {
  try { process() } catch(e) { throw new Error('fail') }
}

export interface Config {
  name: string
  value: number
}
`
    const result = buildVineyardTerroirResult(['balanced.ts'], [balanced])
    const recs = generateRecommendations(result.plots, result.regions, result.estate, result.stats)
    expect(recs).toContain('This vineyard produces exceptional terroir — maintain current practices')
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('buildVineyardTerroirResult', () => {
  it('returns correct structure for empty input', () => {
    const result = buildVineyardTerroirResult([], [])
    expect(result.plots).toEqual([])
    expect(result.regions).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallTerroir).toBe(0)
    expect(result.stats.sommelierGrade).toBe('box-wine-drinker')
    expect(result.estate.isGrandCru).toBe(false)
  })

  it('analyzes mixed content correctly', () => {
    const result = buildVineyardTerroirResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.plots.length).toBe(2)
    expect(result.regions.length).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.overallTerroir).toBe(37)
    expect(result.stats.sommelierGrade).toBe('wine-steward')
    expect(result.stats.grandCruCount).toBe(0)
    expect(result.stats.vinegarCount).toBe(1)
    expect(result.estate.isGrandCru).toBe(false)
    expect(result.stats.bestPlot).toBe('a.ts')
    expect(result.stats.bestSoil).toBe('a.ts')
    expect(result.stats.bestVintage).toBe('a.ts')
    expect(result.stats.bestAging).toBe('a.ts')
    expect(result.stats.bestBouquet).toBe('a.ts')
  })

  it('groups files into regions by directory', () => {
    const result = buildVineyardTerroirResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [goodContent, poorContent, goodContent],
    )
    expect(result.regions.length).toBe(2)
    expect(result.stats.totalRegions).toBe(2)
  })

  it('generates recommendations', () => {
    const result = buildVineyardTerroirResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all condition counts', () => {
    const result = buildVineyardTerroirResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.stats.grandCruCount).toBe(0)
    expect(result.stats.premierCruCount).toBe(1)
    expect(result.stats.vinegarCount).toBe(1)
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('formatVineyardTerroirTable', () => {
  it('formats result as colored table string', () => {
    const result = buildVineyardTerroirResult(['a.ts'], [goodContent])
    const output = formatVineyardTerroirTable(result, false)
    expect(output).toContain('Vineyard Terroir Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('includes verbose details', () => {
    const result = buildVineyardTerroirResult(['a.ts'], [goodContent])
    const output = formatVineyardTerroirTable(result, true)
    expect(output).toContain('Soil:')
    expect(output).toContain('Grape:')
    expect(output).toContain('Vintage:')
  })
})

describe('formatVineyardTerroirJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildVineyardTerroirResult(['a.ts'], [goodContent])
    const output = formatVineyardTerroirJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.plots).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.regions).toBeDefined()
    expect(parsed.estate).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

describe('color helpers', () => {
  it('scoreColor returns string with value', () => {
    expect(scoreColor(85)).toContain('85')
    expect(scoreColor(50)).toContain('50')
    expect(scoreColor(10)).toContain('10')
  })

  it('soilTypeColor handles all types', () => {
    for (const t of ['limestone', 'clay', 'gravel', 'sand', 'loam', 'dirt'] as const) {
      expect(soilTypeColor(t)).toContain(t)
    }
  })

  it('conditionColor handles all conditions', () => {
    for (const c of ['grand-cru', 'premier-cru', 'cru-bourgeois', 'vin-de-pays', 'table-wine', 'vinegar'] as const) {
      expect(conditionColor(c)).toContain(c)
    }
  })

  it('grapeTypeColor handles all types', () => {
    for (const t of ['cabernet-sauvignon', 'pinot-noir', 'chardonnay', 'merlot', 'riesling', 'table-grape'] as const) {
      expect(grapeTypeColor(t)).toContain(t)
    }
  })

  it('vintageYearColor handles all years', () => {
    for (const y of ['legendary', 'exceptional', 'excellent', 'good', 'average', 'poor'] as const) {
      expect(vintageYearColor(y)).toContain(y)
    }
  })

  it('cellarColor handles all cellars', () => {
    for (const c of ['oak-barrel', 'stainless-steel', 'concrete-egg', 'amphora', 'bottle', 'box-wine'] as const) {
      expect(cellarColor(c)).toContain(c)
    }
  })

  it('bouquetColor handles all bouquets', () => {
    for (const b of ['complex', 'elegant', 'fruity', 'earthy', 'simple', 'corked'] as const) {
      expect(bouquetColor(b)).toContain(b)
    }
  })

  it('bodyCharColor handles all characters', () => {
    for (const c of ['full-bodied', 'medium-bodied', 'light-bodied', 'watery', 'syrupy', 'vinegar'] as const) {
      expect(bodyCharColor(c)).toContain(c)
    }
  })

  it('sommelierGradeColor handles all grades', () => {
    for (const g of ['master-sommelier', 'advanced-sommelier', 'sommelier', 'wine-steward', 'enthusiast', 'box-wine-drinker'] as const) {
      expect(sommelierGradeColor(g)).toContain(g)
    }
  })

  it('regionConditionColor handles all conditions', () => {
    for (const c of ['legendary-region', 'premium-appellation', 'quality-region', 'growing-region', 'emerging', 'wasteland'] as const) {
      expect(regionConditionColor(c)).toContain(c)
    }
  })
})

describe('formatPlot', () => {
  it('formats plot with file name', () => {
    const plot = analyzeVineyardPlot(goodContent, 'test.ts')
    expect(formatPlot(plot, false)).toContain('test.ts')
  })

  it('includes details in verbose mode', () => {
    const plot = analyzeVineyardPlot(goodContent, 'test.ts')
    const output = formatPlot(plot, true)
    expect(output).toContain('Soil:')
    expect(output).toContain('Grape:')
  })
})

describe('formatRegion', () => {
  it('formats region with directory', () => {
    const plots = [analyzeVineyardPlot(goodContent, 'src/a.ts')]
    const ws = analyzeWineRegion(plots, 'src')
    expect(formatRegion(ws, false)).toContain('src')
  })

  it('includes plot details in verbose mode', () => {
    const plots = [analyzeVineyardPlot(goodContent, 'src/a.ts')]
    const ws = analyzeWineRegion(plots, 'src')
    const output = formatRegion(ws, true)
    expect(output).toContain('src/a.ts')
  })
})

describe('formatStats', () => {
  it('formats stats with key metrics', () => {
    const result = buildVineyardTerroirResult(['a.ts'], [goodContent])
    const output = formatStats(result.stats)
    expect(output).toContain('Files')
    expect(output).toContain('Regions')
    expect(output).toContain('Terroir')
    expect(output).toContain('Grade')
  })
})
