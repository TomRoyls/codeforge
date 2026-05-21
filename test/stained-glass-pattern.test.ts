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
  jsdocPresent,
  measureGlass,
  measureLead,
  measureColor,
  measurePattern,
  measureLight,
  measureStructure,
  analyzeGlassPiece,
  classifyCondition,
  analyzeWorkshop,
  classifyWorkshopType,
  classifyWorkshopCondition,
  classifyArtisanGrade,
  generatePatternRecommendations,
  buildStainedGlassPatternResult,
  type GlassPiece,
  type GlassMeasure,
  type LightMeasure,
} from '../src/commands/stained-glass-pattern-helpers.js'
import {
  formatStainedGlassPatternJson,
  formatStainedGlassPatternTable,
  scoreColor,
  glassTypeColor,
  conditionColor,
  workshopConditionColor,
  artisanGradeColor,
  patternStyleColor,
  leadTypeColor,
  frameColor,
  formatPiece,
  formatWorkshop,
  formatStats,
} from '../src/commands/stained-glass-pattern-format-helpers.js'

// ─── Test Content Fixtures ──────────────────────────────

const emptyContent = ''

const goodContent = `/**
 * Add two numbers
 * @param a first number
 * @param b second number
 * @returns sum
 * @example add(1,2)
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Multiply two numbers
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

const complexContent = `/**
 * Complex module
 */
import { foo } from 'bar'
import { baz } from 'qux'

export function getData(): string {
  return 'data'
}

export async function processItems(): Promise<void> {
  const result = await fetchItems()
  console.log(result)
}

export interface Config {
  name: string
  value: number
}

export type Result = string | number

export class Handler {
  handle(): void {
    try {
      this.process()
    } catch (e) {
      throw new Error('fail')
    } finally {
      this.cleanup()
    }
  }
  private process(): void {}
  private cleanup(): void {}
}

const fn = (x: number): number => x * 2
const items = data.map(item => transform(item))
`

// ─── Counting Utilities ─────────────────────────────────

describe('countLoc', () => {
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })

  it('counts non-empty lines', () => {
    expect(countLoc('const a = 1\n\nconst b = 2')).toBe(2)
  })

  it('counts lines of complex content', () => {
    expect(countLoc(complexContent)).toBe(32)
  })
})

describe('countFunctions', () => {
  it('returns 0 for empty string', () => {
    expect(countFunctions('')).toBe(0)
  })

  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })

  it('counts functions in complex content', () => {
    expect(countFunctions(complexContent)).toBe(3)
  })
})

describe('countClasses', () => {
  it('returns 0 for empty string', () => {
    expect(countClasses('')).toBe(0)
  })

  it('counts class declarations', () => {
    expect(countClasses('class Foo {}')).toBe(1)
  })

  it('counts classes in complex content', () => {
    expect(countClasses(complexContent)).toBe(1)
  })
})

describe('countInterfaces', () => {
  it('returns 0 for empty string', () => {
    expect(countInterfaces('')).toBe(0)
  })

  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('counts interfaces in complex content', () => {
    expect(countInterfaces(complexContent)).toBe(1)
  })
})

describe('countTypes', () => {
  it('returns 0 for empty string', () => {
    expect(countTypes('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type Foo = string')).toBe(1)
  })

  it('counts types in complex content', () => {
    expect(countTypes(complexContent)).toBe(1)
  })
})

describe('countEnums', () => {
  it('returns 0 for empty string', () => {
    expect(countEnums('')).toBe(0)
  })

  it('counts enum declarations', () => {
    expect(countEnums('enum Foo { A, B }')).toBe(1)
  })

  it('returns 0 for complex content without enums', () => {
    expect(countEnums(complexContent)).toBe(0)
  })
})

describe('countExports', () => {
  it('returns 0 for empty string', () => {
    expect(countExports('')).toBe(0)
  })

  it('counts export statements', () => {
    expect(countExports('export const a = 1')).toBe(1)
  })

  it('counts exports in complex content', () => {
    expect(countExports(complexContent)).toBe(5)
  })
})

describe('countImports', () => {
  it('returns 0 for empty string', () => {
    expect(countImports('')).toBe(0)
  })

  it('counts import statements', () => {
    expect(countImports("import { foo } from 'bar'")).toBe(1)
  })

  it('counts imports in complex content', () => {
    expect(countImports(complexContent)).toBe(2)
  })
})

describe('countJSDoc', () => {
  it('returns 0 for empty string', () => {
    expect(countJSDoc('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc(goodContent)).toBe(2)
  })

  it('counts JSDoc in complex content', () => {
    expect(countJSDoc(complexContent)).toBe(1)
  })
})

describe('countComments', () => {
  it('returns 0 for empty string', () => {
    expect(countComments('')).toBe(0)
  })

  it('counts line comments', () => {
    expect(countComments('// foo')).toBe(1)
  })

  it('counts comments in complex content', () => {
    expect(countComments(complexContent)).toBe(1)
  })
})

describe('countErrorHandling', () => {
  it('returns 0 for empty string', () => {
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts catch/finally/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(1)
  })

  it('counts error handling in complex content', () => {
    expect(countErrorHandling(complexContent)).toBe(3)
  })
})

describe('countTypeAnnotations', () => {
  it('returns 0 for empty string', () => {
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('counts type annotations in complex content', () => {
    expect(countTypeAnnotations(complexContent)).toBe(8)
  })
})

describe('countTodos', () => {
  it('returns 0 for empty string', () => {
    expect(countTodos('')).toBe(0)
  })

  it('counts TODO markers', () => {
    expect(countTodos('// TODO: fix this')).toBe(1)
  })

  it('counts TODOs in poor content', () => {
    expect(countTodos(poorContent)).toBe(2)
  })
})

describe('countConsole', () => {
  it('returns 0 for empty string', () => {
    expect(countConsole('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
  })

  it('counts console calls in complex content', () => {
    expect(countConsole(complexContent)).toBe(1)
  })
})

describe('countBranches', () => {
  it('returns 0 for empty string', () => {
    expect(countBranches('')).toBe(0)
  })

  it('counts if branches', () => {
    expect(countBranches('if (x) {}')).toBe(1)
  })
})

describe('countDescriptiveNames', () => {
  it('returns 0 for empty string', () => {
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })

  it('counts descriptive names in complex content', () => {
    expect(countDescriptiveNames(complexContent)).toBe(3)
  })
})

describe('countDefaults', () => {
  it('returns 0 for empty string', () => {
    expect(countDefaults('')).toBe(0)
  })

  it('counts default keywords', () => {
    expect(countDefaults('export default class {}')).toBe(1)
  })
})

describe('countDeprecated', () => {
  it('returns 0 for empty string', () => {
    expect(countDeprecated('')).toBe(0)
  })

  it('counts deprecated markers', () => {
    expect(countDeprecated('@deprecated use x instead')).toBe(1)
  })

  it('counts deprecated in poor content', () => {
    expect(countDeprecated(poorContent)).toBe(1)
  })
})

describe('countReturnTypes', () => {
  it('returns 0 for empty string', () => {
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts return type annotations', () => {
    expect(countReturnTypes('function foo(): string {}')).toBe(1)
  })

  it('counts return types in complex content', () => {
    expect(countReturnTypes(complexContent)).toBe(6)
  })
})

describe('countGenerics', () => {
  it('returns 0 for empty string', () => {
    expect(countGenerics('')).toBe(0)
  })

  it('counts generic type parameters', () => {
    expect(countGenerics('function foo<T>() {}')).toBe(1)
  })

  it('counts generics in complex content', () => {
    expect(countGenerics(complexContent)).toBe(1)
  })
})

describe('countArrowFunctions', () => {
  it('returns 0 for empty string', () => {
    expect(countArrowFunctions('')).toBe(0)
  })

  it('counts arrow functions', () => {
    expect(countArrowFunctions('const f = () => 1')).toBe(1)
  })

  it('counts arrows in complex content', () => {
    expect(countArrowFunctions(complexContent)).toBe(2)
  })
})

describe('countAsync', () => {
  it('returns 0 for empty string', () => {
    expect(countAsync('')).toBe(0)
  })

  it('counts async keywords', () => {
    expect(countAsync('async function foo() {}')).toBe(1)
  })

  it('counts async in complex content', () => {
    expect(countAsync(complexContent)).toBe(1)
  })
})

describe('countAwait', () => {
  it('returns 0 for empty string', () => {
    expect(countAwait('')).toBe(0)
  })

  it('counts await keywords', () => {
    expect(countAwait('await foo()')).toBe(1)
  })

  it('counts await in complex content', () => {
    expect(countAwait(complexContent)).toBe(1)
  })
})

describe('jsdocPresent', () => {
  it('returns false for empty string', () => {
    expect(jsdocPresent('')).toBe(false)
  })

  it('returns true when JSDoc present', () => {
    expect(jsdocPresent(complexContent)).toBe(true)
  })

  it('returns false when no JSDoc', () => {
    expect(jsdocPresent('const x = 1')).toBe(false)
  })
})

// ─── Glass Measurement ──────────────────────────────────

describe('measureGlass', () => {
  it('returns base values for empty content', () => {
    const result = measureGlass(emptyContent)
    expect(result.quality).toBe(15)
    expect(result.type).toBe('cobalt')
    expect(result.isTransparent).toBe(false)
    expect(result.hasClarity).toBe(false)
    expect(result.hasNoBubbles).toBe(true)
  })

  it('returns crystal for well-documented code', () => {
    const result = measureGlass(goodContent)
    expect(result.quality).toBe(100)
    expect(result.type).toBe('crystal')
    expect(result.isTransparent).toBe(true)
    expect(result.hasClarity).toBe(true)
    expect(result.hasNoBubbles).toBe(true)
  })

  it('returns amber for poor code', () => {
    const result = measureGlass(poorContent)
    expect(result.quality).toBe(25)
    expect(result.type).toBe('amber')
    expect(result.isTransparent).toBe(false)
    expect(result.hasClarity).toBe(false)
    expect(result.hasNoBubbles).toBe(false)
  })
})

// ─── Lead Measurement ───────────────────────────────────

describe('measureLead', () => {
  it('returns base values for empty content', () => {
    const result = measureLead(emptyContent)
    expect(result.strength).toBe(10)
    expect(result.type).toBe('flat')
    expect(result.isStructural).toBe(false)
    expect(result.isSecure).toBe(false)
    expect(result.hasCorrosion).toBe(false)
  })

  it('returns h-came for code with interfaces and exports', () => {
    const result = measureLead(goodContent)
    expect(result.strength).toBe(75)
    expect(result.type).toBe('h-came')
    expect(result.isStructural).toBe(true)
    expect(result.hasCorrosion).toBe(false)
  })

  it('detects corrosion in poor code', () => {
    const result = measureLead(poorContent)
    expect(result.hasCorrosion).toBe(true)
    expect(result.isStructural).toBe(false)
  })
})

// ─── Color Measurement ──────────────────────────────────

describe('measureColor', () => {
  it('returns base values for empty content', () => {
    const result = measureColor(emptyContent)
    expect(result.richness).toBe(10)
    expect(result.palette).toEqual([])
    expect(result.hasVibrantColors).toBe(false)
    expect(result.hasFading).toBe(false)
  })

  it('detects palette in good code', () => {
    const result = measureColor(goodContent)
    expect(result.palette).toContain('function')
    expect(result.palette).toContain('class')
    expect(result.palette).toContain('interface')
    expect(result.palette).toContain('export')
    expect(result.hasFading).toBe(false)
  })

  it('detects fading in poor code', () => {
    const result = measureColor(poorContent)
    expect(result.hasFading).toBe(true)
  })
})

// ─── Pattern Measurement ────────────────────────────────

describe('measurePattern', () => {
  it('returns base values for empty content', () => {
    const result = measurePattern(emptyContent)
    expect(result.complexity).toBe(5)
    expect(result.style).toBe('minimalist')
    expect(result.hasSymmetry).toBe(false)
    expect(result.hasRadialBalance).toBe(false)
  })

  it('detects geometric style for well-structured code', () => {
    const result = measurePattern(goodContent)
    expect(result.style).toBe('geometric')
  })

  it('detects minimalist style for poor code', () => {
    const result = measurePattern(poorContent)
    expect(result.style).toBe('minimalist')
    expect(result.complexity).toBe(0)
  })
})

// ─── Light Measurement ──────────────────────────────────

describe('measureLight', () => {
  it('returns zero for empty content', () => {
    const result = measureLight(emptyContent)
    expect(result.transmission).toBe(0)
    expect(result.quality).toBe(0)
    expect(result.letsLightThrough).toBe(false)
    expect(result.hasDarkPatches).toBe(false)
  })

  it('returns high values for well-documented code', () => {
    const result = measureLight(goodContent)
    expect(result.transmission).toBe(100)
    expect(result.quality).toBe(100)
    expect(result.letsLightThrough).toBe(true)
    expect(result.hasDarkPatches).toBe(false)
  })

  it('returns low values for poor code', () => {
    const result = measureLight(poorContent)
    expect(result.transmission).toBe(15)
    expect(result.quality).toBe(10)
    expect(result.letsLightThrough).toBe(false)
  })
})

// ─── Structure Measurement ──────────────────────────────

describe('measureStructure', () => {
  it('returns base values for empty content', () => {
    const result = measureStructure(emptyContent)
    expect(result.integrity).toBe(10)
    expect(result.frame).toBe('none')
    expect(result.isStructurallySound).toBe(false)
    expect(result.hasIronReinforcement).toBe(false)
  })

  it('detects stone frame for well-typed code', () => {
    const result = measureStructure(goodContent)
    expect(result.integrity).toBe(75)
    expect(result.frame).toBe('stone')
    expect(result.isStructurallySound).toBe(true)
  })

  it('returns none frame for poor code', () => {
    const result = measureStructure(poorContent)
    expect(result.integrity).toBe(0)
    expect(result.frame).toBe('none')
  })
})

// ─── Piece Analysis ─────────────────────────────────────

describe('analyzeGlassPiece', () => {
  it('analyzes empty content as shattered', () => {
    const piece = analyzeGlassPiece('', 'empty.ts')
    expect(piece.file).toBe('empty.ts')
    expect(piece.qualityScore).toBe(9)
    expect(piece.condition).toBe('shattered')
  })

  it('analyzes good code as rose-window', () => {
    const piece = analyzeGlassPiece(goodContent, 'calc.ts')
    expect(piece.file).toBe('calc.ts')
    expect(piece.qualityScore).toBe(76)
    expect(piece.condition).toBe('rose-window')
  })

  it('analyzes poor code as shattered', () => {
    const piece = analyzeGlassPiece(poorContent, 'poor.ts')
    expect(piece.qualityScore).toBe(8)
    expect(piece.condition).toBe('shattered')
  })

  it('populates all measure fields', () => {
    const piece = analyzeGlassPiece(goodContent, 'test.ts')
    expect(piece.glass).toBeDefined()
    expect(piece.lead).toBeDefined()
    expect(piece.color).toBeDefined()
    expect(piece.pattern).toBeDefined()
    expect(piece.light).toBeDefined()
    expect(piece.structure).toBeDefined()
  })
})

// ─── Condition Classification ───────────────────────────

describe('classifyCondition', () => {
  const baseGlass: GlassMeasure = {
    quality: 80,
    type: 'crystal',
    isTransparent: true,
    hasClarity: true,
    hasNoBubbles: true,
  }
  const baseLight: LightMeasure = {
    transmission: 80,
    quality: 80,
    letsLightThrough: true,
    hasDarkPatches: false,
  }

  it('returns cathedral-masterpiece for top scores', () => {
    expect(classifyCondition(85, baseGlass, baseLight)).toBe('cathedral-masterpiece')
  })

  it('returns rose-window for clarity', () => {
    expect(classifyCondition(70, { ...baseGlass, isTransparent: false }, baseLight)).toBe('rose-window')
  })

  it('returns mosaic-beauty for moderate scores', () => {
    expect(classifyCondition(55, baseGlass, baseLight)).toBe('mosaic-beauty')
  })

  it('returns opal-dream for decent light', () => {
    expect(classifyCondition(42, baseGlass, { ...baseLight, transmission: 40 })).toBe('opal-dream')
  })

  it('returns tarnished-glass for low scores', () => {
    expect(classifyCondition(28, baseGlass, baseLight)).toBe('tarnished-glass')
  })

  it('returns cracked-panel for very low scores', () => {
    expect(classifyCondition(18, baseGlass, baseLight)).toBe('cracked-panel')
  })

  it('returns shattered for bottom scores', () => {
    expect(classifyCondition(5, baseGlass, baseLight)).toBe('shattered')
  })
})

// ─── Workshop Analysis ──────────────────────────────────

describe('analyzeWorkshop', () => {
  it('returns salvage-yard for empty pieces', () => {
    const ws = analyzeWorkshop([], '.')
    expect(ws.directory).toBe('.')
    expect(ws.pieces).toEqual([])
    expect(ws.workshopType).toBe('salvage-yard')
    expect(ws.condition).toBe('darkness')
    expect(ws.avgQuality).toBe(0)
  })

  it('aggregates piece metrics', () => {
    const pieces: GlassPiece[] = [
      analyzeGlassPiece(goodContent, 'src/a.ts'),
      analyzeGlassPiece(poorContent, 'src/b.ts'),
    ]
    const ws = analyzeWorkshop(pieces, 'src')
    expect(ws.directory).toBe('src')
    expect(ws.pieces.length).toBe(2)
    expect(ws.avgQuality).toBe(42)
    expect(ws.avgTransmission).toBe(58)
  })
})

describe('classifyWorkshopType', () => {
  const makePiece = (score: number): GlassPiece => ({
    file: 'test.ts',
    glass: measureGlass(goodContent),
    lead: measureLead(goodContent),
    color: measureColor(goodContent),
    pattern: measurePattern(goodContent),
    light: measureLight(goodContent),
    structure: measureStructure(goodContent),
    condition: 'cathedral-masterpiece',
    qualityScore: score,
  })

  it('returns salvage-yard for empty array', () => {
    expect(classifyWorkshopType([], 50)).toBe('salvage-yard')
  })

  it('returns cathedral-studio for high masterwork ratio', () => {
    const pieces = [makePiece(90), makePiece(90)]
    expect(classifyWorkshopType(pieces, 80)).toBe('cathedral-studio')
  })

  it('returns roadside-stall for low quality', () => {
    const pieces = [makePiece(15)]
    expect(classifyWorkshopType(pieces, 15)).toBe('roadside-stall')
  })

  it('returns village-craft for moderate quality', () => {
    const pieces = [makePiece(50)]
    expect(classifyWorkshopType(pieces, 35)).toBe('village-craft')
  })
})

describe('classifyWorkshopCondition', () => {
  it('returns radiant-glow for high transmission', () => {
    expect(classifyWorkshopCondition(80)).toBe('radiant-glow')
  })

  it('returns well-lit for good transmission', () => {
    expect(classifyWorkshopCondition(60)).toBe('well-lit')
  })

  it('returns soft-light for moderate transmission', () => {
    expect(classifyWorkshopCondition(45)).toBe('soft-light')
  })

  it('returns dim for low transmission', () => {
    expect(classifyWorkshopCondition(30)).toBe('dim')
  })

  it('returns shadowed for very low transmission', () => {
    expect(classifyWorkshopCondition(15)).toBe('shadowed')
  })

  it('returns darkness for minimal transmission', () => {
    expect(classifyWorkshopCondition(5)).toBe('darkness')
  })
})

// ─── Artisan Grade ──────────────────────────────────────

describe('classifyArtisanGrade', () => {
  it('returns master-glazier for 75+', () => {
    expect(classifyArtisanGrade(80)).toBe('master-glazier')
    expect(classifyArtisanGrade(75)).toBe('master-glazier')
  })

  it('returns artisan for 60+', () => {
    expect(classifyArtisanGrade(60)).toBe('artisan')
  })

  it('returns journeyman for 45+', () => {
    expect(classifyArtisanGrade(45)).toBe('journeyman')
  })

  it('returns apprentice for 30+', () => {
    expect(classifyArtisanGrade(30)).toBe('apprentice')
  })

  it('returns novice for 15+', () => {
    expect(classifyArtisanGrade(15)).toBe('novice')
  })

  it('returns finger-painter below 15', () => {
    expect(classifyArtisanGrade(5)).toBe('finger-painter')
  })
})

// ─── Recommendations ────────────────────────────────────

describe('generatePatternRecommendations', () => {
  it('generates recommendations for shattered files', () => {
    const pieces = [analyzeGlassPiece('', 'bad.ts')]
    const stats = {
      ...buildStainedGlassPatternResult(['bad.ts'], ['']).stats,
      shatteredCount: 1,
    }
    const recs = generatePatternRecommendations(pieces, [], stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message when all metrics are good', () => {
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
  // process
}
`
    const pieces = [analyzeGlassPiece(balanced, 'balanced.ts')]
    const result = buildStainedGlassPatternResult(['balanced.ts'], [balanced])
    const recs = generatePatternRecommendations(pieces, result.workshops, result.stats)
    expect(recs).toContain('Continue maintaining high pattern quality and glass transparency')
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('buildStainedGlassPatternResult', () => {
  it('returns correct structure for empty input', () => {
    const result = buildStainedGlassPatternResult([], [])
    expect(result.pieces).toEqual([])
    expect(result.workshops).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.stats.artisanGrade).toBe('finger-painter')
  })

  it('analyzes mixed content correctly', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.pieces.length).toBe(2)
    expect(result.workshops.length).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgQuality).toBe(42)
    expect(result.stats.avgTransmission).toBe(58)
    expect(result.stats.crystalCount).toBe(1)
    expect(result.stats.amberCount).toBe(1)
    expect(result.stats.transparentCount).toBe(1)
    expect(result.stats.clearCount).toBe(1)
    expect(result.stats.fadingCount).toBe(1)
    expect(result.stats.roseWindowCount).toBe(1)
    expect(result.stats.shatteredCount).toBe(1)
    expect(result.stats.artisanGrade).toBe('apprentice')
    expect(result.stats.bestPiece).toBe('a.ts')
    expect(result.stats.mostColorful).toBe('a.ts')
    expect(result.stats.strongestLead).toBe('a.ts')
    expect(result.stats.mostComplex).toBe('a.ts')
  })

  it('groups files into workshops by directory', () => {
    const result = buildStainedGlassPatternResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [goodContent, poorContent, goodContent],
    )
    expect(result.workshops.length).toBe(2)
    expect(result.stats.totalWorkshops).toBe(2)
  })

  it('generates recommendations', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all condition counts', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts', 'b.ts'],
      [goodContent, poorContent],
    )
    expect(result.stats.cathedralMasterpieceCount).toBe(0)
    expect(result.stats.roseWindowCount).toBe(1)
    expect(result.stats.mosaicBeautyCount).toBe(0)
    expect(result.stats.opalDreamCount).toBe(0)
    expect(result.stats.tarnishedGlassCount).toBe(0)
    expect(result.stats.crackedPanelCount).toBe(0)
    expect(result.stats.shatteredCount).toBe(1)
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('formatStainedGlassPatternTable', () => {
  it('formats result as colored table string', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts'],
      [goodContent],
    )
    const output = formatStainedGlassPatternTable(result, false)
    expect(output).toContain('Stained Glass Pattern Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('includes verbose details when verbose=true', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts'],
      [goodContent],
    )
    const output = formatStainedGlassPatternTable(result, true)
    expect(output).toContain('Glass:')
    expect(output).toContain('Lead:')
    expect(output).toContain('Pattern:')
  })
})

describe('formatStainedGlassPatternJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts'],
      [goodContent],
    )
    const output = formatStainedGlassPatternJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pieces).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.workshops).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

describe('scoreColor', () => {
  it('returns green for high scores', () => {
    const result = scoreColor(85)
    expect(result).toContain('85')
  })

  it('returns yellow for medium scores', () => {
    const result = scoreColor(50)
    expect(result).toContain('50')
  })

  it('returns red for low scores', () => {
    const result = scoreColor(10)
    expect(result).toContain('10')
  })
})

describe('glassTypeColor', () => {
  it('returns colored string for each type', () => {
    const types = ['crystal', 'opal', 'frosted', 'amber', 'onyx', 'cobalt'] as const
    for (const t of types) {
      const result = glassTypeColor(t)
      expect(result).toContain(t)
    }
  })
})

describe('conditionColor', () => {
  it('returns colored string for each condition', () => {
    const conditions = [
      'cathedral-masterpiece', 'rose-window', 'mosaic-beauty',
      'opal-dream', 'tarnished-glass', 'cracked-panel', 'shattered',
    ] as const
    for (const c of conditions) {
      const result = conditionColor(c)
      expect(result).toContain(c)
    }
  })
})

describe('workshopConditionColor', () => {
  it('returns colored string for each condition', () => {
    const conditions = ['radiant-glow', 'well-lit', 'soft-light', 'dim', 'shadowed', 'darkness'] as const
    for (const c of conditions) {
      const result = workshopConditionColor(c)
      expect(result).toContain(c)
    }
  })
})

describe('artisanGradeColor', () => {
  it('returns colored string for each grade', () => {
    const grades = ['master-glazier', 'artisan', 'journeyman', 'apprentice', 'novice', 'finger-painter'] as const
    for (const g of grades) {
      const result = artisanGradeColor(g)
      expect(result).toContain(g)
    }
  })
})

describe('patternStyleColor', () => {
  it('returns colored string for each style', () => {
    const styles = ['geometric', 'organic', 'floral', 'abstract', 'pictorial', 'minimalist'] as const
    for (const s of styles) {
      const result = patternStyleColor(s)
      expect(result).toContain(s)
    }
  })
})

describe('leadTypeColor', () => {
  it('returns colored string for each type', () => {
    const types = ['h-came', 'u-came', 'round', 'flat', 'zinc', 'copper'] as const
    for (const t of types) {
      const result = leadTypeColor(t)
      expect(result).toContain(t)
    }
  })
})

describe('frameColor', () => {
  it('returns colored string for each frame', () => {
    const frames = ['stone', 'iron', 'wood', 'bronze', 'modern', 'none'] as const
    for (const f of frames) {
      const result = frameColor(f)
      expect(result).toContain(f)
    }
  })
})

describe('formatPiece', () => {
  it('formats piece with file name and score', () => {
    const piece = analyzeGlassPiece(goodContent, 'test.ts')
    const output = formatPiece(piece, false)
    expect(output).toContain('test.ts')
  })

  it('includes details in verbose mode', () => {
    const piece = analyzeGlassPiece(goodContent, 'test.ts')
    const output = formatPiece(piece, true)
    expect(output).toContain('Glass:')
    expect(output).toContain('Lead:')
    expect(output).toContain('Light:')
  })
})

describe('formatWorkshop', () => {
  it('formats workshop with directory', () => {
    const pieces = [analyzeGlassPiece(goodContent, 'src/a.ts')]
    const ws = analyzeWorkshop(pieces, 'src')
    const output = formatWorkshop(ws, false)
    expect(output).toContain('src')
  })

  it('includes piece details in verbose mode', () => {
    const pieces = [analyzeGlassPiece(goodContent, 'src/a.ts')]
    const ws = analyzeWorkshop(pieces, 'src')
    const output = formatWorkshop(ws, true)
    expect(output).toContain('src/a.ts')
  })
})

describe('formatStats', () => {
  it('formats stats with key metrics', () => {
    const result = buildStainedGlassPatternResult(
      ['a.ts'],
      [goodContent],
    )
    const output = formatStats(result.stats)
    expect(output).toContain('Files')
    expect(output).toContain('Workshops')
    expect(output).toContain('Avg Quality')
    expect(output).toContain('Brilliance')
  })
})
