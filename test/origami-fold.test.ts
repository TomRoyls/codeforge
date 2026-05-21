import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countInterfaces, countTypeAliases,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifySheetCondition, classifyBaseType, classifyPatternType,
  classifyBoxType, classifyBoxCondition, classifyOrigamiGrade,
  measureFolds, measureCreases, measurePaper,
  measureStructure, measureCreasePattern, measureModel,
  analyzeOrigamiSheet, analyzeOrigamiBox,
  generateRecommendations, buildOrigamiFoldResult,
} from '../src/commands/origami-fold-helpers.js'
import { formatOrigamiFoldTable, formatOrigamiFoldJson } from '../src/commands/origami-fold-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calc(x: number): number {',
  '  try {',
  '    const result: number = helper(x)',
  '    if (result > 0) { return result }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  'export interface CalcOptions { value: number; label: string }',
  'export type CalcResult = number | string',
].join('\n')

const diverseCode = [
  'import { helper } from "./utils.js"',
  'export function calc(): void {}',
  'export class Calculator {',
  '  constructor() {}',
  '  compute(): number { return 1 }',
  '}',
  'export interface Shape { area: number }',
  'export type Result = string | number',
  'export enum Direction { N, S, E, W }',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

const noisyCode = [
  'console.log("a")',
  'console.log("b")',
  'console.log("c")',
  'console.log("d")',
  'export function f() {}',
].join('\n')

const branchyCode = [
  'if (a) {}',
  'if (b) {}',
  'if (c) {}',
  'if (d) {}',
  'if (e) {}',
  'if (f) {}',
  'if (g) {}',
  'const x = 1',
].join('\n')

const heavyImportCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'import { f } from "f"',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('origami-fold primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countClasses counts classes', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses('class Foo {}')).toBe(1)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(emptyCode)).toBe(0)
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('countTypeAliases counts types', () => {
    expect(countTypeAliases(emptyCode)).toBe(0)
    expect(countTypeAliases('type Foo = string')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('origami-fold classifications', () => {
  it('classifySheetCondition returns correct conditions', () => {
    expect(classifySheetCondition(90)).toBe('masterwork')
    expect(classifySheetCondition(75)).toBe('expert')
    expect(classifySheetCondition(55)).toBe('skilled')
    expect(classifySheetCondition(35)).toBe('apprentice')
    expect(classifySheetCondition(15)).toBe('beginner')
    expect(classifySheetCondition(5)).toBe('crumpled')
  })

  it('classifyBaseType returns correct types', () => {
    expect(classifyBaseType(diverseCode)).toBe('frog')
    expect(classifyBaseType('export class Foo {} export interface Bar {}')).toBe('bird')
    expect(classifyBaseType('interface A {} type B = string')).toBe('fish')
    expect(classifyBaseType(simpleCode)).toBe('none')
  })

  it('classifyPatternType returns correct types', () => {
    expect(classifyPatternType(strongCode)).toBe('wet-fold')
    expect(classifyPatternType(emptyCode)).toBe('torn')
    expect(classifyPatternType(diverseCode)).toBe('modular')
    expect(classifyPatternType(simpleCode)).toBe('traditional')
  })

  it('classifyBoxType returns confetti for empty', () => {
    expect(classifyBoxType([])).toBe('confetti')
  })

  it('classifyBoxType detects display-case', () => {
    const goodSheets = Array.from({ length: 3 }, (_, i) => analyzeOrigamiSheet(strongCode, `${i}.ts`))
    expect(classifyBoxType(goodSheets)).toBe('display-case')
  })

  it('classifyBoxCondition returns correct conditions', () => {
    expect(classifyBoxCondition(85)).toBe('gallery-quality')
    expect(classifyBoxCondition(65)).toBe('well-crafted')
    expect(classifyBoxCondition(45)).toBe('serviceable')
    expect(classifyBoxCondition(30)).toBe('rough')
    expect(classifyBoxCondition(15)).toBe('messy')
    expect(classifyBoxCondition(5)).toBe('torn-apart')
  })

  it('classifyOrigamiGrade returns correct grades', () => {
    expect(classifyOrigamiGrade(85)).toBe('grand-master')
    expect(classifyOrigamiGrade(70)).toBe('master')
    expect(classifyOrigamiGrade(50)).toBe('artisan')
    expect(classifyOrigamiGrade(35)).toBe('folder')
    expect(classifyOrigamiGrade(18)).toBe('beginner')
    expect(classifyOrigamiGrade(5)).toBe('paper-shredder')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('origami-fold measurements', () => {
  it('measureFolds returns correct structure', () => {
    const f = measureFolds(strongCode)
    expect(f.count).toBeGreaterThan(0)
    expect(f.depth).toBeGreaterThanOrEqual(0)
    expect(typeof f.hasValleyFold).toBe('boolean')
    expect(typeof f.hasMountainFold).toBe('boolean')
    expect(typeof f.hasReverseFold).toBe('boolean')
    expect(typeof f.hasSquashFold).toBe('boolean')
    expect(typeof f.hasPetalFold).toBe('boolean')
    expect(typeof f.hasSinkFold).toBe('boolean')
    expect(f.valleyCount).toBeGreaterThanOrEqual(0)
    expect(f.mountainCount).toBeGreaterThanOrEqual(0)
    expect(f.squashCount).toBeGreaterThanOrEqual(0)
    expect(f.petalCount).toBeGreaterThanOrEqual(0)
  })

  it('measureFolds detects valley fold for exports with functions', () => {
    expect(measureFolds(typedCode).hasValleyFold).toBe(true)
  })

  it('measureFolds detects mountain fold for classes with interfaces', () => {
    expect(measureFolds(diverseCode).hasMountainFold).toBe(true)
  })

  it('measureFolds detects petal fold for quality code', () => {
    expect(measureFolds(strongCode).hasPetalFold).toBe(true)
  })

  it('measureFolds detects squash fold for branchy code without functions', () => {
    expect(measureFolds(branchyCode).hasSquashFold).toBe(true)
  })

  it('measureCreases returns correct structure', () => {
    const c = measureCreases(strongCode)
    expect(c.sharpness).toBeGreaterThanOrEqual(0)
    expect(c.sharpness).toBeLessThanOrEqual(100)
    expect(typeof c.isClean).toBe('boolean')
    expect(typeof c.hasTears).toBe('boolean')
    expect(typeof c.hasWrinkles).toBe('boolean')
    expect(c.tearCount).toBeGreaterThanOrEqual(0)
    expect(c.wrinkleCount).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(c.tearPoints)).toBe(true)
    expect(Array.isArray(c.wrinklePoints)).toBe(true)
  })

  it('measureCreases detects tears for exports without errors', () => {
    const c = measureCreases(typedCode)
    expect(c.hasTears).toBe(true)
  })

  it('measureCreases gives high sharpness for strong code', () => {
    expect(measureCreases(strongCode).sharpness).toBeGreaterThan(70)
  })

  it('measurePaper returns correct structure', () => {
    const p = measurePaper(strongCode)
    expect(p.area).toBeGreaterThanOrEqual(0)
    expect(p.thickness).toBeGreaterThanOrEqual(0)
    expect(p.isUsed).toBeGreaterThanOrEqual(0)
    expect(p.isUsed).toBeLessThanOrEqual(100)
    expect(p.waste).toBeGreaterThanOrEqual(0)
    expect(typeof p.isEconomical).toBe('boolean')
    expect(typeof p.hasOffcuts).toBe('boolean')
    expect(p.offcutSize).toBeGreaterThanOrEqual(0)
  })

  it('measurePaper detects offcuts with todos', () => {
    expect(measurePaper(todoCode).hasOffcuts).toBe(true)
  })

  it('measureStructure returns correct structure', () => {
    const s = measureStructure(strongCode)
    expect(typeof s.hasBase).toBe('boolean')
    expect(typeof s.baseType).toBe('string')
    expect(s.stability).toBeGreaterThanOrEqual(0)
    expect(s.stability).toBeLessThanOrEqual(100)
    expect(typeof s.isBalanced).toBe('boolean')
    expect(typeof s.isCollapsible).toBe('boolean')
    expect(typeof s.hasWings).toBe('boolean')
    expect(s.wingSpan).toBeGreaterThanOrEqual(0)
  })

  it('measureStructure detects base', () => {
    expect(measureStructure(strongCode).hasBase).toBe(true)
    expect(measureStructure(noExportCode).hasBase).toBe(false)
  })

  it('measureStructure detects wings for many exports', () => {
    expect(measureStructure(diverseCode).hasWings).toBe(true)
  })

  it('measureCreasePattern returns correct structure', () => {
    const c = measureCreasePattern(strongCode)
    expect(typeof c.isSymmetric).toBe('boolean')
    expect(typeof c.isComplex).toBe('boolean')
    expect(typeof c.hasMasterCrease).toBe('boolean')
    expect(typeof c.hasGuideCreases).toBe('boolean')
    expect(typeof c.patternType).toBe('string')
    expect(c.elegance).toBeGreaterThanOrEqual(0)
    expect(c.elegance).toBeLessThanOrEqual(100)
  })

  it('measureCreasePattern detects master crease', () => {
    expect(measureCreasePattern(strongCode).hasMasterCrease).toBe(true)
  })

  it('measureCreasePattern detects guide creases', () => {
    expect(measureCreasePattern(strongCode).hasGuideCreases).toBe(true)
  })

  it('measureModel returns correct structure', () => {
    const m = measureModel(strongCode)
    expect(typeof m.recognizable).toBe('boolean')
    expect(m.detail).toBeGreaterThanOrEqual(0)
    expect(typeof m.isComplete).toBe('boolean')
    expect(typeof m.hasFlaps).toBe('boolean')
    expect(m.flapCount).toBeGreaterThanOrEqual(0)
    expect(typeof m.isDisplay).toBe('boolean')
    expect(typeof m.isPractice).toBe('boolean')
  })

  it('measureModel detects recognizable for documented exports', () => {
    expect(measureModel(strongCode).recognizable).toBe(true)
  })

  it('measureModel detects practice for no exports', () => {
    expect(measureModel(noExportCode).isPractice).toBe(true)
  })

  it('measureModel detects complete for error-handled exports', () => {
    expect(measureModel(strongCode).isComplete).toBe(true)
  })
})

// ─── Sheet Analysis Tests ─────────────────────────────────────────────────────

describe('origami-fold sheet analysis', () => {
  it('analyzeOrigamiSheet returns correct structure', () => {
    const s = analyzeOrigamiSheet(strongCode, 'calc.ts')
    expect(s.file).toBe('calc.ts')
    expect(s.foldPrecision).toBeGreaterThanOrEqual(0)
    expect(s.foldPrecision).toBeLessThanOrEqual(100)
    expect(s.creaseSharpness).toBeGreaterThanOrEqual(0)
    expect(s.paperEconomy).toBeGreaterThanOrEqual(0)
    expect(s.structuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(s.complexityReduction).toBeGreaterThanOrEqual(0)
    expect(s.creaseElegance).toBeGreaterThanOrEqual(0)
    expect(s.qualityScore).toBeGreaterThanOrEqual(0)
    expect(s.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof s.condition).toBe('string')
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeOrigamiSheet(strongCode, 'good.ts')
    const bad = analyzeOrigamiSheet(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('empty code sheet is crumpled', () => {
    const s = analyzeOrigamiSheet(emptyCode, 'empty.ts')
    expect(s.condition).toBe('crumpled')
    expect(s.qualityScore).toBe(0)
    expect(s.foldPrecision).toBe(0)
  })

  it('strong code has high fold precision', () => {
    const s = analyzeOrigamiSheet(strongCode, 'strong.ts')
    expect(s.foldPrecision).toBeGreaterThan(50)
  })

  it('folds info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(s.folds.count).toBeGreaterThan(0)
  })

  it('creases info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(s.creases.sharpness).toBeGreaterThan(0)
  })

  it('paper info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(s.paper.area).toBeGreaterThan(0)
  })

  it('structure info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(s.structure.hasBase).toBe(true)
    expect(s.structure.stability).toBeGreaterThan(0)
  })

  it('creasePattern info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(typeof s.creasePattern.patternType).toBe('string')
  })

  it('model info is populated', () => {
    const s = analyzeOrigamiSheet(strongCode, 'a.ts')
    expect(s.model.recognizable).toBe(true)
  })
})

// ─── Box Analysis Tests ───────────────────────────────────────────────────────

describe('origami-fold box analysis', () => {
  it('analyzeOrigamiBox handles empty sheets', () => {
    const b = analyzeOrigamiBox([], 'src')
    expect(b.directory).toBe('src')
    expect(b.sheets).toHaveLength(0)
    expect(b.boxType).toBe('confetti')
  })

  it('analyzeOrigamiBox computes averages', () => {
    const sheets = [
      analyzeOrigamiSheet(strongCode, 'a.ts'),
      analyzeOrigamiSheet(typedCode, 'b.ts'),
    ]
    const b = analyzeOrigamiBox(sheets, 'src')
    expect(b.avgFoldPrecision).toBeGreaterThanOrEqual(0)
    expect(b.avgCreaseSharpness).toBeGreaterThanOrEqual(0)
    expect(b.avgPaperEconomy).toBeGreaterThanOrEqual(0)
    expect(b.avgStructuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(typeof b.boxType).toBe('string')
    expect(typeof b.condition).toBe('string')
  })

  it('analyzeOrigamiBox counts conditions', () => {
    const sheets = [
      analyzeOrigamiSheet(strongCode, 'a.ts'),
      analyzeOrigamiSheet(emptyCode, 'b.ts'),
    ]
    const b = analyzeOrigamiBox(sheets, 'src')
    expect(b.crumpledCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('origami-fold build result', () => {
  it('buildOrigamiFoldResult returns correct structure', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [typedCode], {})
    expect(result.sheets).toHaveLength(1)
    expect(result.boxes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.origamiGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.studio.overallCraftsmanship).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildOrigamiFoldResult([], [], {})
    expect(result.sheets).toHaveLength(0)
    expect(result.stats.bestFolded).toBe('none')
    expect(result.stats.worstFolded).toBe('none')
    expect(result.stats.mostEconomical).toBe('none')
    expect(result.stats.mostElegant).toBe('none')
    expect(result.stats.mostTorn).toBe('none')
  })

  it('groups sheets into boxes by directory', () => {
    const result = buildOrigamiFoldResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.boxes).toHaveLength(2)
  })

  it('identifies best and worst folded', () => {
    const result = buildOrigamiFoldResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestFolded).toBe('good.ts')
    expect(result.stats.worstFolded).toBe('bad.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [], {})
    expect(result.sheets).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildOrigamiFoldResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgFoldPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgCreaseSharpness).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPaperEconomy).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStructuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgComplexityReduction).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgCreaseElegance).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFolds).toBeGreaterThanOrEqual(0)
    expect(result.stats.valleyFolds).toBeGreaterThanOrEqual(0)
    expect(result.stats.mountainFolds).toBeGreaterThanOrEqual(0)
    expect(result.stats.symmetricPatterns).toBeGreaterThanOrEqual(0)
  })

  it('computes studio fields', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [strongCode], {})
    expect(result.studio.avgFoldPrecision).toBeGreaterThanOrEqual(0)
    expect(result.studio.isClean).toBeDefined()
    expect(result.studio.overallCraftsmanship).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('origami-fold recommendations', () => {
  it('returns array', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about crumpled sheets', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [emptyCode], {})
    if (result.stats.crumpledCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Crumpled')]),
      )
    }
  })

  it('includes clean folds message for good code', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [strongCode], {})
    if (result.stats.overallCraftsmanship >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Clean folds')]),
      )
    }
  })

  it('warns about paper waste', () => {
    const result = buildOrigamiFoldResult(['a.ts'], [noExportCode], {})
    if (result.stats.wastefulFiles > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Paper waste')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('origami-fold formatters', () => {
  const sampleResult = buildOrigamiFoldResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatOrigamiFoldTable returns string with header', () => {
    const table = formatOrigamiFoldTable(sampleResult, false)
    expect(table).toContain('Origami Fold')
    expect(table).toContain('Origami Sheets')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatOrigamiFoldTable verbose shows detail', () => {
    const table = formatOrigamiFoldTable(sampleResult, true)
    expect(table).toContain('folds:')
    expect(table).toContain('crease:')
  })

  it('formatOrigamiFoldTable handles empty', () => {
    const empty = buildOrigamiFoldResult([], [], {})
    const table = formatOrigamiFoldTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatOrigamiFoldTable truncates sheets at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildOrigamiFoldResult(files, contents, {})
    const table = formatOrigamiFoldTable(big, false)
    expect(table).toContain('more')
  })

  it('formatOrigamiFoldTable shows boxes', () => {
    const result = buildOrigamiFoldResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, typedCode],
      {},
    )
    const table = formatOrigamiFoldTable(result, false)
    expect(table).toContain('Origami Boxes')
  })

  it('formatOrigamiFoldJson returns valid JSON', () => {
    const json = formatOrigamiFoldJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.sheets).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.studio).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('origami-fold edge cases', () => {
  it('handles deeply nested code', () => {
    const s = analyzeOrigamiSheet(deepCode, 'deep.ts')
    expect(s.folds.depth).toBeGreaterThan(3)
    expect(s.paper.thickness).toBeGreaterThan(0)
  })

  it('handles code with only comments', () => {
    const s = analyzeOrigamiSheet('// just a comment\n/* block */', 'comment.ts')
    expect(s.folds.count).toBeGreaterThanOrEqual(0)
  })

  it('handles single file with no directory', () => {
    const result = buildOrigamiFoldResult(['single.ts'], [typedCode], {})
    expect(result.boxes).toHaveLength(1)
    expect(result.boxes[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildOrigamiFoldResult(files, contents, {})
    expect(result.boxes).toHaveLength(1)
    expect(result.boxes[0].sheets).toHaveLength(3)
  })

  it('empty code has torn pattern type', () => {
    const s = analyzeOrigamiSheet(emptyCode, 'empty.ts')
    expect(s.creasePattern.patternType).toBe('torn')
    expect(s.creasePattern.elegance).toBe(0)
  })

  it('detects squash fold in branchy code without functions', () => {
    const f = measureFolds(branchyCode)
    expect(f.hasSquashFold).toBe(true)
  })

  it('detects reverse fold for async code', () => {
    const f = measureFolds('async function a(): Promise<void> { await b() }')
    expect(f.hasReverseFold).toBe(true)
  })

  it('noisy code has offcuts', () => {
    const p = measurePaper(noisyCode)
    expect(p.hasOffcuts).toBe(true)
  })

  it('todo code has wrinkles', () => {
    const c = measureCreases(todoCode)
    expect(c.hasWrinkles).toBe(true)
  })

  it('identifies most torn file', () => {
    const result = buildOrigamiFoldResult(
      ['clean.ts', 'messy.ts'],
      [strongCode, typedCode],
      {},
    )
    expect(typeof result.stats.mostTorn).toBe('string')
  })
})
