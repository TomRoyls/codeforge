import { describe, expect, it } from 'vitest'
import {
  analyzeBrushStroke,
  analyzeGalleryWing,
  buildPaintingCanvasResult,
  classifyCuratorGrade,
  classifyStrokeCondition,
  classifyWingCondition,
  classifyWingType,
  countBranches,
  countClasses,
  countComments,
  countConstructTypes,
  countConsole,
  countDescriptiveNames,
  countEnums,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countTypes,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureBrushworkMeasure,
  measureCanvas,
  measureFrame,
  measureGallery,
  measurePainting,
  measurePalette,
} from '../src/commands/painting-canvas-helpers.js'
import {
  formatPaintingCanvasJSON,
  formatPaintingCanvasReport,
  formatStrokeTable,
  formatWingTable,
  formatMuseum,
  formatStats,
  formatRecommendations,
} from '../src/commands/painting-canvas-format-helpers.js'

// ─── countLoc ────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines of code', () => {
    expect(countLoc('a\nb\nc')).toBe(3)
  })
  it('ignores blank lines', () => {
    expect(countLoc('a\n\n\nc')).toBe(2)
  })
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })
})

// ─── countImports / countExports / countFunctions / countClasses ────

describe('countImports', () => {
  it('counts import statements', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
  })
  it('returns 0 when none', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export function a() {}\nexport const b = 1')).toBe(2)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })
  it('counts arrow functions', () => {
    expect(countFunctions('const x = () => {}')).toBe(1)
  })
})

describe('countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class A {} class B {}')).toBe(2)
  })
})

// ─── countInterfaces / countTypes / countEnums ───────────

describe('countInterfaces', () => {
  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {} interface Bar {}')).toBe(2)
  })
})

describe('countTypes', () => {
  it('counts type aliases', () => {
    expect(countTypes('type A = string\ntype B = number')).toBe(2)
  })
})

describe('countEnums', () => {
  it('counts enum declarations', () => {
    expect(countEnums('enum Color { Red, Blue }')).toBe(1)
  })
})

// ─── countErrorHandling / countTypeAnnotations / countBranches ────

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3)
  })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: string): number {}')).toBe(2)
  })
})

describe('countBranches', () => {
  it('counts if/else/switch', () => {
    expect(countBranches('if (x) {} else {}')).toBe(2)
  })
})

// ─── countConsole / countComments / countTodos / countJSDoc ────

describe('countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("a") console.error("b")')).toBe(2)
  })
})

describe('countComments', () => {
  it('counts comments', () => {
    expect(countComments('// hello\n/* world */')).toBe(2)
  })
})

describe('countTodos', () => {
  it('counts TODOs and FIXMEs', () => {
    expect(countTodos('// TODO fix\n// FIXME this')).toBe(2)
  })
})

describe('countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** docs */')).toBe(1)
  })
})

// ─── maxNesting ──────────────────────────────────────────

describe('maxNesting', () => {
  it('measures max brace nesting', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
})

// ─── countConstructTypes ─────────────────────────────────

describe('countConstructTypes', () => {
  it('detects function construct', () => {
    expect(countConstructTypes('function f() {}')).toContain('function')
  })
  it('detects class construct', () => {
    expect(countConstructTypes('class A {}')).toContain('class')
  })
  it('detects interface construct', () => {
    expect(countConstructTypes('interface I {}')).toContain('interface')
  })
  it('detects type construct', () => {
    expect(countConstructTypes('type T = string')).toContain('type')
  })
  it('detects enum construct', () => {
    expect(countConstructTypes('enum E { A, B }')).toContain('enum')
  })
  it('detects literal construct', () => {
    expect(countConstructTypes('const x = { a: 1 }')).toContain('literal')
  })
  it('returns empty for bare code', () => {
    expect(countConstructTypes('const x = 1')).toEqual([])
  })
})

// ─── measurePainting ─────────────────────────────────────

describe('measurePainting', () => {
  it('detects focal point with exports', () => {
    const p = measurePainting('export function f() {}')
    expect(p.hasFocalPoint).toBe(true)
  })
  it('detects balance with functions and exports', () => {
    const p = measurePainting('export function f() {}')
    expect(p.hasBalance).toBe(true)
  })
  it('detects cluttered code', () => {
    const deep = 'if (x) { if (y) { if (z) { if (a) { if (b) { if (c) { } } } } } }'
    const p = measurePainting(deep)
    expect(p.isCluttered).toBe(true)
  })
  it('detects negative space with comments', () => {
    const p = measurePainting('// comment')
    expect(p.hasNegativeSpace).toBe(true)
  })
  it('returns composition 0 for empty', () => {
    const p = measurePainting('')
    expect(p.composition).toBe(0)
  })
  it('classifies realism for high quality', () => {
    const code = '/** docs */\nexport function f(x: number): number { if (x > 0) { try { return x } catch (e) { return 0 } } return 0 }'
    const p = measurePainting(code)
    expect(p.style).toBe('realism')
  })
  it('classifies dada for code with no structure', () => {
    const p = measurePainting('const x = 1\nconst y = 2')
    expect(p.style).toBe('dada')
  })
})

// ─── measurePalette ──────────────────────────────────────

describe('measurePalette', () => {
  it('detects monochrome for single construct', () => {
    const p = measurePalette('function f() {}')
    expect(p.isMonochrome).toBe(true)
  })
  it('detects polychrome for many constructs', () => {
    const code = 'function f() {}\nclass A {}\ninterface I {}\ntype T = string'
    const p = measurePalette(code)
    expect(p.isPolychrome).toBe(true)
  })
  it('detects complementary with types and constructs', () => {
    const code = 'function f(x: number): string { return String(x) }\ninterface I { x: number }'
    const p = measurePalette(code)
    expect(p.hasComplementary).toBe(true)
  })
  it('detects clashing with console and todos', () => {
    const p = measurePalette('console.log("x") // TODO fix')
    expect(p.hasClashing).toBe(true)
  })
  it('returns empty colors for empty code', () => {
    const p = measurePalette('')
    expect(p.colors).toEqual([])
    expect(p.colorCount).toBe(0)
  })
})

// ─── measureBrushworkMeasure ─────────────────────────────

describe('measureBrushworkMeasure', () => {
  it('detects fine detail with validations and types', () => {
    const b = measureBrushworkMeasure('function f(x: number): number { if (typeof x === "number") return x }')
    expect(b.hasFineDetail).toBe(true)
  })
  it('detects smooth code', () => {
    const b = measureBrushworkMeasure('/** docs */\nexport function f(x: number): number { try { return x } catch (e) { return 0 } }')
    expect(b.isSmooth).toBe(true)
  })
  it('detects mud with console and todos', () => {
    const b = measureBrushworkMeasure('console.log("x") // TODO fix this')
    expect(b.hasMud).toBe(true)
  })
  it('returns finger-paint for empty code', () => {
    const b = measureBrushworkMeasure('')
    expect(b.technique).toBe('finger-paint')
  })
  it('detects sfumato for high quality with texture', () => {
    const code = '/** docs */\nfunction f(x: number): number { if (typeof x === "number") { try { return validate(x) } catch (e) { throw e } } return 0 }'
    const b = measureBrushworkMeasure(code)
    expect(b.technique).toBe('sfumato')
  })
})

// ─── measureCanvas ───────────────────────────────────────

describe('measureCanvas', () => {
  it('detects primer with imports', () => {
    const c = measureCanvas('import { x } from "y"')
    expect(c.hasPrimer).toBe(true)
  })
  it('detects underpainting with interface', () => {
    const c = measureCanvas('interface I { x: number }')
    expect(c.hasUnderpainting).toBe(true)
  })
  it('detects fully painted code', () => {
    const c = measureCanvas('export function f() { return 1 }')
    expect(c.isFullyPainted).toBe(true)
  })
  it('detects blank spots with todos', () => {
    const c = measureCanvas('// TODO implement')
    expect(c.hasBlankSpots).toBe(true)
  })
  it('detects paint over', () => {
    const c = measureCanvas('// TODO refactor')
    expect(c.hasPaintOver).toBe(true)
  })
  it('returns coverage 0 for empty', () => {
    const c = measureCanvas('')
    expect(c.coverage).toBe(0)
  })
})

// ─── measureFrame ────────────────────────────────────────

describe('measureFrame', () => {
  it('detects well framed code', () => {
    const f = measureFrame('export function f(x: number): number { return x }')
    expect(f.isWellFramed).toBe(true)
  })
  it('detects gilded code with types', () => {
    const f = measureFrame('const x: number = 1')
    expect(f.isGilded).toBe(true)
  })
  it('detects ornamentation with JSDoc', () => {
    const f = measureFrame('/** docs */\nfunction f() {}')
    expect(f.hasOrnamentation).toBe(true)
  })
  it('detects overwrought with many exports', () => {
    const code = Array.from({ length: 7 }, (_, i) => `export const m${i} = ${i}`).join('\n')
    const f = measureFrame(code)
    expect(f.isOverwrought).toBe(true)
  })
  it('detects damage with todos', () => {
    const f = measureFrame('export function f() { /* TODO */ }')
    expect(f.hasDamage).toBe(true)
  })
  it('returns quality 0 for empty', () => {
    const f = measureFrame('')
    expect(f.quality).toBe(0)
  })
})

// ─── measureGallery ──────────────────────────────────────

describe('measureGallery', () => {
  it('detects signed code with JSDoc', () => {
    const g = measureGallery('/** author: me */\nfunction f() {}')
    expect(g.isSigned).toBe(true)
  })
  it('detects varnished code', () => {
    const g = measureGallery('function f() { try {} catch (e) {} }')
    expect(g.isVarnished).toBe(true)
  })
  it('detects certificate with errors and validations', () => {
    const g = measureGallery('function f(x: number) { if (typeof x === "number") { try { return x } catch (e) {} } }')
    expect(g.hasCertificate).toBe(true)
  })
  it('detects lit code with comments', () => {
    const g = measureGallery('// this does something\nconst x = 1')
    expect(g.isLit).toBe(true)
  })
  it('classifies mint condition for high readiness', () => {
    const code = '/** docs */\nexport function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const g = measureGallery(code)
    expect(g.condition).toBe('mint')
  })
  it('returns readiness 0 for empty', () => {
    const g = measureGallery('')
    expect(g.readiness).toBe(0)
  })
})

// ─── classifyStrokeCondition ─────────────────────────────

describe('classifyStrokeCondition', () => {
  it('classifies masterpiece', () => { expect(classifyStrokeCondition(90)).toBe('masterpiece') })
  it('classifies gallery-quality', () => { expect(classifyStrokeCondition(70)).toBe('gallery-quality') })
  it('classifies studio-quality', () => { expect(classifyStrokeCondition(55)).toBe('studio-quality') })
  it('classifies student-work', () => { expect(classifyStrokeCondition(35)).toBe('student-work') })
  it('classifies amateur', () => { expect(classifyStrokeCondition(20)).toBe('amateur') })
  it('classifies kindergarten', () => { expect(classifyStrokeCondition(5)).toBe('kindergarten') })
})

// ─── classifyCuratorGrade ────────────────────────────────

describe('classifyCuratorGrade', () => {
  it('classifies museum-curator', () => { expect(classifyCuratorGrade(85)).toBe('museum-curator') })
  it('classifies gallery-director', () => { expect(classifyCuratorGrade(70)).toBe('gallery-director') })
  it('classifies art-critic', () => { expect(classifyCuratorGrade(50)).toBe('art-critic') })
  it('classifies artist', () => { expect(classifyCuratorGrade(35)).toBe('artist') })
  it('classifies student', () => { expect(classifyCuratorGrade(20)).toBe('student') })
  it('classifies toddler', () => { expect(classifyCuratorGrade(5)).toBe('toddler') })
})

// ─── classifyWingType / classifyWingCondition ────────────

describe('classifyWingType', () => {
  it('returns dumpster for empty', () => {
    expect(classifyWingType([])).toBe('dumpster')
  })
  it('returns renaissance-wing for high quality', () => {
    const code = '/** Calculate value */\nexport function calc(x: number): number {\n  if (typeof x !== "number") throw new Error("invalid")\n  try { return x * 2 } catch (e) { return 0 }\n}'
    const strokes = [analyzeBrushStroke(code, 'a.ts')]
    expect(classifyWingType(strokes)).toBe('renaissance-wing')
  })
})

describe('classifyWingCondition', () => {
  it('returns trash-can for empty', () => {
    expect(classifyWingCondition([])).toBe('trash-can')
  })
})

// ─── analyzeBrushStroke ──────────────────────────────────

describe('analyzeBrushStroke', () => {
  it('returns complete BrushStroke', () => {
    const stroke = analyzeBrushStroke('export function f(x: number): number { return x }', 'f.ts')
    expect(stroke.file).toBe('f.ts')
    expect(stroke.composition).toBeGreaterThanOrEqual(0)
    expect(stroke.colorPalette).toBeGreaterThanOrEqual(0)
    expect(stroke.brushwork).toBeGreaterThanOrEqual(0)
    expect(stroke.canvasCoverage).toBeGreaterThanOrEqual(0)
    expect(stroke.frameQuality).toBeGreaterThanOrEqual(0)
    expect(stroke.galleryReadiness).toBeGreaterThanOrEqual(0)
    expect(stroke.qualityScore).toBeGreaterThanOrEqual(0)
    expect(stroke.condition).toBeDefined()
    expect(stroke.painting).toBeDefined()
    expect(stroke.palette).toBeDefined()
    expect(stroke.brushworkDetail).toBeDefined()
    expect(stroke.canvas).toBeDefined()
    expect(stroke.frame).toBeDefined()
    expect(stroke.gallery).toBeDefined()
  })
  it('returns qualityScore 0 for empty content', () => {
    const stroke = analyzeBrushStroke('', 'empty.ts')
    expect(stroke.qualityScore).toBe(0)
  })
})

// ─── analyzeGalleryWing ──────────────────────────────────

describe('analyzeGalleryWing', () => {
  it('returns complete GalleryWing', () => {
    const strokes = [
      analyzeBrushStroke('export function a(x: number): number { return x }', 'a.ts'),
      analyzeBrushStroke('export function b(y: string): boolean { return y.length > 0 }', 'b.ts'),
    ]
    const wing = analyzeGalleryWing(strokes, 'src')
    expect(wing.directory).toBe('src')
    expect(wing.strokes).toHaveLength(2)
    expect(wing.wingType).toBeDefined()
    expect(wing.condition).toBeDefined()
  })
  it('handles empty strokes', () => {
    const wing = analyzeGalleryWing([], 'empty')
    expect(wing.avgComposition).toBe(0)
    expect(wing.wingType).toBe('dumpster')
  })
})

// ─── buildPaintingCanvasResult ────────────────────────────

describe('buildPaintingCanvasResult', () => {
  it('returns complete result', () => {
    const result = buildPaintingCanvasResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a(x: number): number { return x }', 'export function b(): string { return "hi" }'],
      {},
    )
    expect(result.strokes).toHaveLength(2)
    expect(result.wings).toHaveLength(1)
    expect(result.museum).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(2)
  })
  it('handles empty input', () => {
    const result = buildPaintingCanvasResult([], [], {})
    expect(result.strokes).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallArtistry).toBe(0)
    expect(result.museum.isGalleryWorthy).toBe(false)
  })
  it('groups files by directory into wings', () => {
    const result = buildPaintingCanvasResult(
      ['src/a.ts', 'lib/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.wings).toHaveLength(2)
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('formatStrokeTable', () => {
  it('formats empty strokes', () => {
    expect(formatStrokeTable([])).toContain('No brush strokes')
  })
  it('formats stroke rows', () => {
    const stroke = analyzeBrushStroke('export function f() {}', 'f.ts')
    const output = formatStrokeTable([stroke])
    expect(output).toContain('f.ts')
  })
})

describe('formatWingTable', () => {
  it('formats empty wings', () => {
    expect(formatWingTable([])).toContain('No gallery wings')
  })
  it('formats wing rows', () => {
    const result = buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {})
    const output = formatWingTable(result.wings)
    expect(output).toContain('Directory')
  })
})

describe('formatMuseum', () => {
  it('formats museum summary', () => {
    const result = buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {})
    const output = formatMuseum(result.museum)
    expect(output).toContain('Museum Summary')
  })
})

describe('formatStats', () => {
  it('formats statistics', () => {
    const result = buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {})
    const output = formatStats(result.stats)
    expect(output).toContain('Canvas Statistics')
    expect(output).toContain('Curator Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const output = formatRecommendations(['Add types', 'Fix errors'])
    expect(output).toContain('Add types')
  })
})

describe('formatPaintingCanvasReport', () => {
  it('formats complete report', () => {
    const result = buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {})
    const output = formatPaintingCanvasReport(result)
    expect(output).toContain('Museum Summary')
    expect(output).toContain('Canvas Statistics')
  })
})

describe('formatPaintingCanvasJSON', () => {
  it('produces valid JSON', () => {
    const result = buildPaintingCanvasResult(['a.ts'], ['export function a() {}'], {})
    const json = formatPaintingCanvasJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.strokes).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
