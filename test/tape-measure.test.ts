import { describe, it, expect } from 'vitest'
import {
  countLoc, countBlankLines, countCommentLines, countCodeLines,
  countImports, countExports, countFunctions, countClasses,
  countBranches, countErrorHandling, countTypeAnnotations,
  countConsole, countComments, countJSDoc, countTodos,
  maxNestingDepth, maxLineWidth, avgLineWidth,
  countOperators, countUniqueOperators, countOperands,
  extractFunctionLengths,
  measureDimensions, measureDepth, measureVolume,
  measureDensity, measureProportion, measureScale,
  measureBlueprint,
  classifyMeasurementCondition, classifyFloorType,
  classifyFloorCondition, classifyArchitectGrade,
  analyzeMeasurement, analyzeFloorPlan,
  generateRecommendations, buildTapeMeasureResult,
} from '../src/commands/tape-measure-helpers.js'
import { formatTapeMeasureTable, formatTapeMeasureJson } from '../src/commands/tape-measure-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' */',
  'export function calculateResult(x: number): number {',
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
  '// TODO: fix this',
  'const x = 1',
].join('\n')

const wideLine = 'const veryLongVariableNameThatGoesOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOn = 1'
const nestedCode = [
  'function deep() {',
  '  if (a) {',
  '    if (b) {',
  '      if (c) {',
  '        if (d) {',
  '          if (e) {',
  '            x = 1',
  '          }',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n')

const giantFnCode = Array.from({ length: 60 }, (_, i) => i === 0 ? 'function giant() {' : i === 59 ? '}' : `  const v${i} = ${i}`).join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('tape-measure primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc('line1\nline2\n')).toBe(2)
  })

  it('countBlankLines counts blank lines', () => {
    expect(countBlankLines('a\n\nb')).toBe(1)
    expect(countBlankLines('a\n\n\nb')).toBe(2)
  })

  it('countCommentLines counts comment lines', () => {
    expect(countCommentLines(emptyCode)).toBe(0)
    expect(countCommentLines('// hello')).toBe(1)
    expect(countCommentLines('/* block */')).toBe(1)
    expect(countCommentLines(strongCode)).toBe(3)
  })

  it('countCodeLines counts non-comment non-blank lines', () => {
    expect(countCodeLines(emptyCode)).toBe(0)
    expect(countCodeLines('const x = 1\n// comment\n\nconst y = 2')).toBe(2)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions(diverseCode)).toBeGreaterThanOrEqual(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc('/** doc */')).toBe(1)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countTodos counts TODO markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('maxNestingDepth measures brace depth', () => {
    expect(maxNestingDepth(emptyCode)).toBe(0)
    expect(maxNestingDepth('if (a) { x }')).toBe(1)
    expect(maxNestingDepth(nestedCode)).toBe(6)
  })

  it('maxLineWidth returns max line length', () => {
    expect(maxLineWidth(emptyCode)).toBe(0)
    expect(maxLineWidth('short\nvery long line here')).toBe(19)
  })

  it('avgLineWidth returns average line length', () => {
    expect(avgLineWidth(emptyCode)).toBe(0)
    expect(avgLineWidth('abc\ndefgh')).toBe(4)
  })

  it('countOperators counts operators', () => {
    expect(countOperators(emptyCode)).toBe(0)
    expect(countOperators('x + y')).toBe(1)
    expect(countOperators('x + y - z')).toBe(2)
  })

  it('countUniqueOperators counts unique operators', () => {
    expect(countUniqueOperators('x + y + z')).toBe(1)
    expect(countUniqueOperators('x + y - z')).toBe(2)
  })

  it('countOperands counts identifiers and literals', () => {
    expect(countOperands('const x = 1 + 2')).toBeGreaterThanOrEqual(3)
  })

  it('extractFunctionLengths extracts function lengths', () => {
    expect(extractFunctionLengths(emptyCode)).toEqual([])
    const lengths = extractFunctionLengths('function a() {\n  x\n  y\n}')
    expect(lengths).toEqual([4])
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('tape-measure measurement functions', () => {
  it('measureDimensions handles empty code', () => {
    const d = measureDimensions(emptyCode)
    expect(d.totalLines).toBe(0)
    expect(d.codeLines).toBe(0)
    expect(d.blankLines).toBe(0)
    expect(d.maxWidthViolation).toBe(false)
  })

  it('measureDimensions counts lines and widths', () => {
    const d = measureDimensions(strongCode)
    expect(d.totalLines).toBeGreaterThan(0)
    expect(d.codeLines).toBeGreaterThan(0)
    expect(d.maxLineWidth).toBeGreaterThan(0)
    expect(d.avgLineWidth).toBeGreaterThan(0)
  })

  it('measureDimensions detects width violations', () => {
    const d = measureDimensions(wideLine)
    expect(d.maxWidthViolation).toBe(true)
    expect(d.maxLineWidth).toBeGreaterThan(120)
  })

  it('measureDepth handles empty code', () => {
    const d = measureDepth(emptyCode)
    expect(d.maxNesting).toBe(0)
    expect(d.hasDeepNesting).toBe(false)
  })

  it('measureDepth detects deep nesting', () => {
    const d = measureDepth(nestedCode)
    expect(d.maxNesting).toBe(6)
    expect(d.hasDeepNesting).toBe(true)
    expect(d.deepestLevel).toBeGreaterThan(0)
  })

  it('measureDepth detects shallow nesting', () => {
    const d = measureDepth('const x = 1')
    expect(d.hasShallowNesting).toBe(true)
  })

  it('measureVolume handles empty code', () => {
    const v = measureVolume(emptyCode)
    expect(v.cyclomaticComplexity).toBe(1)
    expect(v.hasLowVolume).toBe(true)
    expect(v.volumeCategory).toBe('trivial')
  })

  it('measureVolume classifies complexity', () => {
    const v = measureVolume(strongCode)
    expect(v.cyclomaticComplexity).toBeGreaterThan(0)
    expect(v.cognitiveComplexity).toBeGreaterThan(0)
    expect(v.volumeCategory).toBeDefined()
  })

  it('measureDensity handles empty code', () => {
    const d = measureDensity(emptyCode)
    expect(d.codeDensity).toBe(0)
    expect(d.isSparse).toBe(true)
    expect(d.isDense).toBe(false)
  })

  it('measureDensity measures code density', () => {
    const d = measureDensity(diverseCode)
    expect(d.branchesPerLine).toBeGreaterThanOrEqual(0)
    expect(d.functionsPerLine).toBeGreaterThanOrEqual(0)
    expect(d.codeDensity).toBeGreaterThan(0)
    expect(d.codeDensity).toBeLessThanOrEqual(100)
  })

  it('measureProportion handles empty code', () => {
    const p = measureProportion(emptyCode)
    expect(p.functionCount).toBe(0)
    expect(p.avgFunctionLength).toBe(0)
    expect(typeof p.proportionScore).toBe('number')
  })

  it('measureProportion detects giant functions', () => {
    const p = measureProportion(giantFnCode)
    expect(p.functionCount).toBe(1)
    expect(p.hasGiantFunctions).toBe(true)
    expect(p.giantCount).toBe(1)
    expect(p.maxFunctionLength).toBe(60)
  })

  it('measureProportion detects tiny functions', () => {
    const code = 'function a() {}\nfunction b() {}'
    const p = measureProportion(code)
    expect(p.functionCount).toBe(2)
    expect(p.hasTinyFunctions).toBe(true)
    expect(p.tinyCount).toBe(2)
  })

  it('measureScale categorizes file sizes', () => {
    const nano = measureScale('const x = 1')
    expect(nano.fileSizeCategory).toBe('nano')

    const medium = measureScale(Array.from({ length: 60 }, (_, i) => `const v${i} = ${i}`).join('\n'))
    expect(medium.fileSizeCategory).toBe('medium')
  })

  it('measureScale detects files needing split', () => {
    const lines = ['import { x } from "a"']
    for (let i = 0; i < 6; i++) {
      lines.push(`function fn${i}() {`)
      for (let j = 0; j < 50; j++) lines.push(`  const v${i}_${j} = ${j}`)
      lines.push('}')
    }
    const hugeCode = lines.join('\n')
    const s = measureScale(hugeCode)
    expect(s.shouldSplit).toBe(true)
  })

  it('measureBlueprint handles empty code', () => {
    const b = measureBlueprint(emptyCode)
    expect(b.isRectangular).toBe(true)
    expect(b.hasTowers).toBe(false)
    expect(b.hasBasements).toBe(false)
  })

  it('measureBlueprint detects towers', () => {
    const b = measureBlueprint(wideLine)
    expect(b.hasTowers).toBe(true)
    expect(b.towerCount).toBe(1)
  })

  it('measureBlueprint detects basements', () => {
    const b = measureBlueprint(nestedCode)
    expect(b.hasBasements).toBe(true)
    expect(b.basementCount).toBe(1)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('tape-measure classification', () => {
  it('classifyMeasurementCondition returns correct conditions', () => {
    expect(classifyMeasurementCondition(85)).toBe('perfectly-measured')
    expect(classifyMeasurementCondition(65)).toBe('well-proportioned')
    expect(classifyMeasurementCondition(45)).toBe('adequate')
    expect(classifyMeasurementCondition(30)).toBe('misshapen')
    expect(classifyMeasurementCondition(15)).toBe('distorted')
    expect(classifyMeasurementCondition(5)).toBe('monstrosity')
  })

  it('classifyFloorType returns void for empty', () => {
    expect(classifyFloorType([])).toBe('void')
  })

  it('classifyFloorCondition returns correct conditions', () => {
    expect(classifyFloorCondition(80)).toBe('architectural-marvel')
    expect(classifyFloorCondition(65)).toBe('well-designed')
    expect(classifyFloorCondition(45)).toBe('functional')
    expect(classifyFloorCondition(30)).toBe('cramped')
    expect(classifyFloorCondition(15)).toBe('sprawling')
    expect(classifyFloorCondition(5)).toBe('condemned')
  })

  it('classifyArchitectGrade returns correct grades', () => {
    expect(classifyArchitectGrade(80)).toBe('master-architect')
    expect(classifyArchitectGrade(65)).toBe('architect')
    expect(classifyArchitectGrade(50)).toBe('drafter')
    expect(classifyArchitectGrade(35)).toBe('builder')
    expect(classifyArchitectGrade(20)).toBe('handyman')
    expect(classifyArchitectGrade(10)).toBe('demolition')
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('tape-measure core analysis', () => {
  it('analyzeMeasurement returns monstrosity for empty code', () => {
    const m = analyzeMeasurement(emptyCode, 'empty.ts')
    expect(m.condition).toBe('monstrosity')
    expect(m.qualityScore).toBe(0)
    expect(m.file).toBe('empty.ts')
  })

  it('analyzeMeasurement returns non-zero scores for code', () => {
    const m = analyzeMeasurement(strongCode, 'strong.ts')
    expect(m.qualityScore).toBeGreaterThan(0)
    expect(m.length).toBeGreaterThan(0)
    expect(m.depth).toBeGreaterThan(0)
  })

  it('analyzeMeasurement assigns file path correctly', () => {
    const m = analyzeMeasurement(simpleCode, 'src/test.ts')
    expect(m.file).toBe('src/test.ts')
  })

  it('analyzeMeasurement detects width violations', () => {
    const m = analyzeMeasurement(wideLine, 'wide.ts')
    expect(m.dimensions.maxWidthViolation).toBe(true)
    expect(m.width).toBeLessThan(80)
  })

  it('analyzeMeasurement detects deep nesting', () => {
    const m = analyzeMeasurement(nestedCode, 'nested.ts')
    expect(m.depthMeasure.hasDeepNesting).toBe(true)
    expect(m.depth).toBeLessThan(80)
  })

  it('analyzeMeasurement detects giant functions', () => {
    const m = analyzeMeasurement(giantFnCode, 'giant.ts')
    expect(m.proportionMeasure.hasGiantFunctions).toBe(true)
  })

  it('analyzeMeasurement produces valid blueprint', () => {
    const m = analyzeMeasurement(diverseCode, 'diverse.ts')
    expect(typeof m.blueprint.isRectangular).toBe('boolean')
    expect(typeof m.blueprint.towerCount).toBe('number')
  })
})

// ─── Floor Plan Analysis ──────────────────────────────────────────────────────

describe('tape-measure floor plan analysis', () => {
  it('analyzeFloorPlan returns condemned for empty', () => {
    const fp = analyzeFloorPlan([], 'empty-dir')
    expect(fp.condition).toBe('condemned')
    expect(fp.floorType).toBe('void')
    expect(fp.measurements).toHaveLength(0)
  })

  it('analyzeFloorPlan aggregates measurements', () => {
    const measurements = [
      analyzeMeasurement(strongCode, 'a.ts'),
      analyzeMeasurement(typedCode, 'b.ts'),
    ]
    const fp = analyzeFloorPlan(measurements, 'src')
    expect(fp.measurements).toHaveLength(2)
    expect(fp.avgLength).toBeGreaterThan(0)
    expect(fp.directory).toBe('src')
  })

  it('analyzeFloorPlan counts conditions', () => {
    const measurements = [
      analyzeMeasurement(strongCode, 'a.ts'),
      analyzeMeasurement(emptyCode, 'b.ts'),
    ]
    const fp = analyzeFloorPlan(measurements, 'src')
    expect(typeof fp.perfectlyMeasuredCount).toBe('number')
    expect(typeof fp.monstrosityCount).toBe('number')
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('tape-measure build result', () => {
  it('buildTapeMeasureResult handles empty input', () => {
    const result = buildTapeMeasureResult([], [], {})
    expect(result.measurements).toHaveLength(0)
    expect(result.floors).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBalance).toBe(0)
    expect(result.stats.architectGrade).toBe('demolition')
    expect(result.stats.bestProportioned).toBe('none')
    expect(result.stats.worstProportioned).toBe('none')
    expect(result.stats.deepestFile).toBe('none')
    expect(result.stats.widestFile).toBe('none')
    expect(result.stats.densestFile).toBe('none')
  })

  it('buildTapeMeasureResult processes single file', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    expect(result.measurements).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestProportioned).toBe('a.ts')
  })

  it('buildTapeMeasureResult processes multiple files', () => {
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildTapeMeasureResult(multiFilePaths, contents, {})
    expect(result.measurements).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalFloors).toBe(1)
  })

  it('buildTapeMeasureResult groups by directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildTapeMeasureResult(paths, contents, {})
    expect(result.floors).toHaveLength(2)
  })

  it('buildTapeMeasureResult computes building averages', () => {
    const result = buildTapeMeasureResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    expect(result.building.avgLength).toBeGreaterThanOrEqual(0)
    expect(result.building.overallBalance).toBeGreaterThanOrEqual(0)
    expect(typeof result.building.isWellProportioned).toBe('boolean')
  })

  it('buildTapeMeasureResult counts size categories', () => {
    const result = buildTapeMeasureResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.nanoFiles + result.stats.microFiles +
      result.stats.smallFiles + result.stats.mediumFiles +
      result.stats.largeFiles + result.stats.megaFiles + result.stats.gigaFiles
    expect(total).toBe(3)
  })

  it('buildTapeMeasureResult counts condition types', () => {
    const result = buildTapeMeasureResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.perfectlyMeasuredCount +
      result.stats.wellProportionedCount +
      result.stats.adequateCount +
      result.stats.misshapenCount +
      result.stats.distortedCount +
      result.stats.monstrosityCount
    expect(total).toBe(3)
  })

  it('buildTapeMeasureResult handles mismatched contents gracefully', () => {
    const result = buildTapeMeasureResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.measurements).toHaveLength(2)
    expect(result.measurements[1].qualityScore).toBe(0)
  })

  it('buildTapeMeasureResult identifies extremes', () => {
    const result = buildTapeMeasureResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.bestProportioned).toBeTruthy()
    expect(result.stats.worstProportioned).toBeTruthy()
    expect(result.stats.deepestFile).toBeTruthy()
    expect(result.stats.widestFile).toBeTruthy()
    expect(result.stats.densestFile).toBeTruthy()
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('tape-measure recommendations', () => {
  it('generateRecommendations warns about monstrosities', () => {
    const result = buildTapeMeasureResult(['a.ts'], [simpleCode], {})
    if (result.stats.monstrosityCount > 0) {
      expect(result.recommendations.some(r => r.includes('Monstrosities'))).toBe(true)
    }
  })

  it('generateRecommendations praises high balance', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    if (result.stats.overallBalance >= 60) {
      expect(result.recommendations.some(r => r.includes('Well-proportioned'))).toBe(true)
    }
  })

  it('generateRecommendations warns about deep nesting', () => {
    const result = buildTapeMeasureResult(['a.ts'], [nestedCode], {})
    if (result.stats.deepNesting > 5) {
      expect(result.recommendations.some(r => r.includes('Deep nesting'))).toBe(true)
    }
  })

  it('generateRecommendations returns deduplicated array', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toEqual(unique)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('tape-measure format helpers', () => {
  it('formatTapeMeasureTable returns string with header', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const table = formatTapeMeasureTable(result, false)
    expect(table).toContain('Tape Measure')
    expect(table).toContain('Measurements')
    expect(table).toContain('Statistics')
  })

  it('formatTapeMeasureTable includes recommendations', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const table = formatTapeMeasureTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatTapeMeasureTable handles empty result', () => {
    const result = buildTapeMeasureResult([], [], {})
    const table = formatTapeMeasureTable(result, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatTapeMeasureTable verbose shows details', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const verbose = formatTapeMeasureTable(result, true)
    expect(verbose).toContain('dimensions:')
    expect(verbose).toContain('depth:')
    expect(verbose).toContain('volume:')
    expect(verbose).toContain('density:')
    expect(verbose).toContain('proportion:')
    expect(verbose).toContain('scale:')
    expect(verbose).toContain('blueprint:')
  })

  it('formatTapeMeasureTable truncates at 15 measurements', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleCode)
    const result = buildTapeMeasureResult(paths, contents, {})
    const table = formatTapeMeasureTable(result, false)
    expect(table).toContain('... and 5 more')
  })

  it('formatTapeMeasureTable shows floor plans section', () => {
    const result = buildTapeMeasureResult(['src/a.ts', 'src/b.ts'], [strongCode, diverseCode], {})
    const table = formatTapeMeasureTable(result, false)
    expect(table).toContain('Floor Plans')
  })

  it('formatTapeMeasureTable shows building section', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const table = formatTapeMeasureTable(result, false)
    expect(table).toContain('Building')
  })

  it('formatTapeMeasureJson returns valid JSON', () => {
    const result = buildTapeMeasureResult(['a.ts'], [strongCode], {})
    const json = formatTapeMeasureJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json) as { measurements: unknown[] }
    expect(parsed.measurements).toHaveLength(1)
  })

  it('formatTapeMeasureJson handles empty result', () => {
    const result = buildTapeMeasureResult([], [], {})
    const json = formatTapeMeasureJson(result)
    const parsed = JSON.parse(json) as { stats: { totalFiles: number } }
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('tape-measure edge cases', () => {
  it('handles code with only comments', () => {
    const m = analyzeMeasurement('// just a comment\n/* block */', 'comment.ts')
    expect(m.file).toBe('comment.ts')
    expect(typeof m.qualityScore).toBe('number')
  })

  it('handles deeply nested code', () => {
    const m = analyzeMeasurement(nestedCode, 'nested.ts')
    expect(m.depthMeasure.maxNesting).toBe(6)
    expect(typeof m.qualityScore).toBe('number')
  })

  it('quality score is bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, diverseCode, nestedCode, giantFnCode]
    for (const code of codes) {
      const m = analyzeMeasurement(code, 'test.ts')
      expect(m.qualityScore).toBeGreaterThanOrEqual(0)
      expect(m.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('all sub-scores are bounded 0-100', () => {
    const m = analyzeMeasurement(strongCode, 'test.ts')
    expect(m.length).toBeGreaterThanOrEqual(0)
    expect(m.length).toBeLessThanOrEqual(100)
    expect(m.width).toBeGreaterThanOrEqual(0)
    expect(m.width).toBeLessThanOrEqual(100)
    expect(m.depth).toBeGreaterThanOrEqual(0)
    expect(m.depth).toBeLessThanOrEqual(100)
    expect(m.volume).toBeGreaterThanOrEqual(0)
    expect(m.volume).toBeLessThanOrEqual(100)
    expect(m.density).toBeGreaterThanOrEqual(0)
    expect(m.density).toBeLessThanOrEqual(100)
    expect(m.proportion).toBeGreaterThanOrEqual(0)
    expect(m.proportion).toBeLessThanOrEqual(100)
    expect(m.scaleFitness).toBeGreaterThanOrEqual(0)
    expect(m.scaleFitness).toBeLessThanOrEqual(100)
  })

  it('overall balance is bounded 0-100', () => {
    const result = buildTapeMeasureResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.overallBalance).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallBalance).toBeLessThanOrEqual(100)
  })

  it('density code density is bounded 0-100', () => {
    const d = measureDensity(strongCode)
    expect(d.codeDensity).toBeGreaterThanOrEqual(0)
    expect(d.codeDensity).toBeLessThanOrEqual(100)
  })
})
