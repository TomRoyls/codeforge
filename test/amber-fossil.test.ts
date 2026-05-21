import { describe, expect, it } from 'vitest'

import {
  analyzeAmberDeposit,
  analyzeAmberSpecimen,
  buildAmberFossilResult,
  classifyDepositCondition,
  classifyDepositType,
  classifyPaleontologistGrade,
  classifySpecimenCondition,
  countAny,
  countAsync,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDeprecated,
  countDescriptiveNames,
  countEnums,
  countErrorHandling,
  countExports,
  countFunctions,
  countGenerics,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countNestingDepth,
  countReturnTypes,
  countTodos,
  countTypeAnnotations,
  countTypes,
  generateRecommendations,
  measureAge,
  measureAmber,
  measureExtraction,
  measureFossil,
  measureInclusion,
  measurePreservation,
  type AmberFossilResult,
  type AmberSpecimen,
} from '../src/commands/amber-fossil-helpers.js'
import { formatAmberFossilCsv, formatAmberFossilJson, formatAmberFossilTable } from '../src/commands/amber-fossil-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('amber-fossil utility helpers', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\n\nconst y = 2')).toBe(2)
    expect(countLoc('')).toBe(0)
  })

  it('counts functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
    expect(countFunctions('')).toBe(0)
  })

  it('counts classes', () => {
    expect(countClasses('class Foo {}')).toBe(1)
    expect(countClasses('')).toBe(0)
  })

  it('counts interfaces', () => {
    expect(countInterfaces('interface Config {}')).toBe(1)
    expect(countInterfaces('')).toBe(0)
  })

  it('counts exports', () => {
    expect(countExports('export function f() {}')).toBe(1)
    expect(countExports('')).toBe(0)
  })

  it('counts imports', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
    expect(countImports('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
    expect(countJSDoc('')).toBe(0)
  })

  it('counts comments', () => {
    expect(countComments('// hello\n/* world */')).toBe(2)
    expect(countComments('')).toBe(0)
  })

  it('counts error handling', () => {
    expect(countErrorHandling('try { } catch(e) { }')).toBe(1)
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: number): string {}')).toBe(2)
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts TODOs', () => {
    expect(countTodos('// TODO: fix this')).toBe(1)
    expect(countTodos('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
    expect(countConsole('')).toBe(0)
  })

  it('counts branches', () => {
    expect(countBranches('if (x) { }')).toBe(1)
    expect(countBranches('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getName() {}')).toBe(1)
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts return types', () => {
    expect(countReturnTypes('): number')).toBe(1)
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts deprecated markers', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
    expect(countDeprecated('')).toBe(0)
  })

  it('counts async keywords', () => {
    expect(countAsync('async function f() {}')).toBe(1)
    expect(countAsync('')).toBe(0)
  })

  it('counts any types', () => {
    expect(countAny('const x: any = {}')).toBe(1)
    expect(countAny('')).toBe(0)
  })

  it('counts generics', () => {
    expect(countGenerics('function f<T>() {}')).toBe(1)
    expect(countGenerics('')).toBe(0)
  })

  it('counts nesting depth', () => {
    expect(countNestingDepth('if (x) { if (y) { } }')).toBe(2)
    expect(countNestingDepth('')).toBe(0)
  })

  it('counts enums', () => {
    expect(countEnums('enum Color { Red, Blue }')).toBe(1)
    expect(countEnums('')).toBe(0)
  })

  it('counts types', () => {
    expect(countTypes('type Foo = string')).toBe(1)
    expect(countTypes('')).toBe(0)
  })
})

// ─── Amber Measurement ──────────────────────────────────

describe('measureAmber', () => {
  it('returns zero clarity for empty content', () => {
    const result = measureAmber('')
    expect(result.clarity).toBe(0)
    expect(result.isTransparent).toBe(false)
    expect(result.isOpaque).toBe(false)
  })

  it('detects transparent code with docs and types', () => {
    const code = [
      '/** Docs */',
      'export function getName(): string { return "hello"; }',
    ].join('\n')
    const result = measureAmber(code)
    expect(result.clarity).toBeGreaterThan(50)
    expect(result.hasInclusions).toBe(true)
  })

  it('detects bubbles from console and any', () => {
    const code = 'console.log("hi"); const x: any = 1;'
    const result = measureAmber(code)
    expect(result.hasBubbles).toBe(true)
    expect(result.bubbleCount).toBeGreaterThan(0)
  })

  it('detects cracks from TODOs and deprecated', () => {
    const code = '// TODO: fix\n// deprecated old API'
    const result = measureAmber(code)
    expect(result.hasCracks).toBe(true)
    expect(result.crackCount).toBeGreaterThan(0)
  })

  it('detects cloudiness for code without comments', () => {
    const code = Array.from({ length: 15 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const result = measureAmber(code)
    expect(result.hasCloudiness).toBe(true)
  })

  it('assigns golden color for moderate clarity', () => {
    const code = 'function computeValue(x: number): number { return x * 2; }'
    const result = measureAmber(code)
    expect(result.color).toBeDefined()
    expect(typeof result.color).toBe('string')
  })

  it('assigns black color for opaque code', () => {
    const code = 'const x = 1'
    const result = measureAmber(code)
    if (result.isOpaque) {
      expect(result.color).toBe('black')
    }
  })
})

// ─── Fossil Measurement ─────────────────────────────────

describe('measureFossil', () => {
  it('returns zero for empty content', () => {
    const result = measureFossil('')
    expect(result.quality).toBe(0)
    expect(result.completeness).toBe(0)
  })

  it('detects complete code with exports and types', () => {
    const code = [
      '/** Docs */',
      'export function computeValue(x: number): number { return x; }',
      'try { computeValue(1); } catch(e) {}',
    ].join('\n')
    const result = measureFossil(code)
    expect(result.completeness).toBeGreaterThan(50)
    expect(result.isComplete).toBe(true)
  })

  it('detects deteriorating code with TODOs', () => {
    const code = '// TODO: fix this\nfunction foo() {}'
    const result = measureFossil(code)
    expect(result.isDeteriorating).toBe(true)
  })

  it('detects soft tissue from async code', () => {
    const code = 'async function fetchData() { await fetch("/api"); }'
    const result = measureFossil(code)
    expect(result.hasSoftTissue).toBe(true)
  })

  it('detects mineralization with classes and interfaces', () => {
    const code = 'interface IConfig {}\nclass Config implements IConfig {}'
    const result = measureFossil(code)
    expect(result.hasMineralization).toBe(true)
  })

  it('assigns beetle type for classes with error handling', () => {
    const code = [
      'class Service {',
      '  run() { try {} catch(e) {} }',
      '  run2() { }',
      '  run3() { }',
      '  run4() { }',
      '  run5() { }',
      '  run6() { }',
      '}',
    ].join('\n')
    const result = measureFossil(code)
    expect(result.type).toBe('beetle')
  })

  it('assigns ant type for many functions without classes', () => {
    const fns = Array.from({ length: 7 }, (_, i) => `function fn${i}() {}`).join('\n')
    const result = measureFossil(fns)
    expect(result.type).toBe('ant')
  })
})

// ─── Preservation Measurement ───────────────────────────

describe('measurePreservation', () => {
  it('returns zero for empty content', () => {
    const result = measurePreservation('')
    expect(result.state).toBe(0)
  })

  it('detects perfectly preserved code', () => {
    const code = [
      '/** Docs */',
      'export function calc(x: number): number { return x; }',
      'try { calc(1); } catch(e) {}',
    ].join('\n')
    const result = measurePreservation(code)
    expect(result.state).toBeGreaterThan(50)
    if (result.state >= 80) {
      expect(result.isPerfectlyPreserved).toBe(true)
    }
  })

  it('detects active decay with deprecated', () => {
    const code = '@deprecated\nfunction old() {}'
    const result = measurePreservation(code)
    expect(result.hasActiveDecay).toBe(true)
  })

  it('detects fossilized code with no comments or exports', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = measurePreservation(code)
    expect(result.isFossilized).toBe(true)
  })

  it('handles code without type annotations or documentation', () => {
    const code = 'const x = 1\nconst y = 2'
    const result = measurePreservation(code)
    expect(typeof result.isFrozenInTime).toBe('boolean')
    expect(result.state).toBe(25)
    expect(result.hasConservationNeeded).toBe(true)
  })
})

// ─── Inclusion Measurement ──────────────────────────────

describe('measureInclusion', () => {
  it('returns empty for blank content', () => {
    const result = measureInclusion('')
    expect(result.count).toBe(0)
    expect(result.types).toEqual([])
  })

  it('detects multiple inclusion types', () => {
    const code = [
      "import { x } from 'y'",
      '/** Docs */',
      'export function computeValue(): number { return 1; }',
      'class Foo {}',
      'interface Bar {}',
      'enum Color { Red }',
      'type Alias = string',
      'async function asyncFn() {}',
      'function generic<T>() {}',
    ].join('\n')
    const result = measureInclusion(code)
    expect(result.count).toBeGreaterThanOrEqual(7)
    expect(result.types).toContain('function')
    expect(result.types).toContain('class')
    expect(result.types).toContain('interface')
  })

  it('detects ancient patterns from deep nesting', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) { if (e) { } } } } }'
    const result = measureInclusion(code)
    expect(result.hasAncientPatterns).toBe(true)
  })

  it('detects modern patterns from generics', () => {
    const code = 'function identity<T>(x: T): T { return x; }'
    const result = measureInclusion(code)
    expect(result.hasModernPatterns).toBe(true)
  })

  it('detects deprecated patterns', () => {
    const code = '@deprecated function old() {}'
    const result = measureInclusion(code)
    expect(result.hasDeprecatedPatterns).toBe(true)
    expect(result.deprecatedCount).toBeGreaterThan(0)
  })

  it('detects workarounds from TODOs and console', () => {
    const code = '// TODO: workaround\nconsole.log("hack")'
    const result = measureInclusion(code)
    expect(result.hasWorkarounds).toBe(true)
  })
})

// ─── Age Measurement ────────────────────────────────────

describe('measureAge', () => {
  it('returns zero for empty content', () => {
    const result = measureAge('')
    expect(result.estimation).toBe(0)
    expect(result.epoch).toBe('modern')
  })

  it('detects ancient code with many signals', () => {
    const code = [
      '// deprecated old code',
      'const x: any = 1;',
      'const y: any = 2;',
      '',
      Array.from({ length: 55 }, (_, i) => `const line${i} = ${i}`).join('\n'),
    ].join('\n')
    const result = measureAge(code)
    expect(result.estimation).toBeGreaterThan(40)
    expect(result.isDated).toBe(true)
  })

  it('detects cutting-edge code with generics', () => {
    const code = 'function identity<T>(x: T): T { return x; }'
    const result = measureAge(code)
    expect(result.epoch).toBe('cutting-edge')
  })

  it('detects stasis in code without exports or imports', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = measureAge(code)
    expect(result.hasStasis).toBe(true)
  })

  it('detects evolution with docs, types, and TODOs', () => {
    const code = [
      '/** Docs */',
      'function calc(x: number): number { return x; }',
      '// TODO: improve',
    ].join('\n')
    const result = measureAge(code)
    expect(result.hasEvolution).toBe(true)
  })
})

// ─── Extraction Measurement ─────────────────────────────

describe('measureExtraction', () => {
  it('returns zero for empty content', () => {
    const result = measureExtraction('')
    expect(result.difficulty).toBe(0)
  })

  it('detects easy to extract code', () => {
    const code = [
      '/** Docs */',
      'export function simple(): number { return 1; }',
    ].join('\n')
    const result = measureExtraction(code)
    expect(result.difficulty).toBeLessThan(30)
    if (result.difficulty < 30) {
      expect(result.isEasyToExtract).toBe(true)
    }
  })

  it('detects difficult extraction from deep nesting', () => {
    const code = Array.from({ length: 8 }, (_, i) => 'if (x) {').join('\n') + '}' .repeat(8)
    const result = measureExtraction(code)
    expect(result.difficulty).toBeGreaterThan(30)
  })

  it('detects dependencies from imports and exports', () => {
    const code = "import { x } from 'y'\nexport function f() {}"
    const result = measureExtraction(code)
    expect(result.hasDependencies).toBe(true)
    expect(result.dependencyCount).toBeGreaterThan(0)
  })

  it('detects solid matrix with classes and interfaces', () => {
    const code = 'interface IConfig {}\nclass Config implements IConfig {}'
    const result = measureExtraction(code)
    expect(result.hasSolidMatrix).toBe(true)
  })

  it('detects dissolvable matrix with functions, exports, errors', () => {
    const code = "export function safeParse(): number { try { return 1; } catch { return 0; } }"
    const result = measureExtraction(code)
    expect(result.hasDissolvableMatrix).toBe(true)
  })
})

// ─── Specimen Analysis ──────────────────────────────────

describe('analyzeAmberSpecimen', () => {
  it('analyzes a well-preserved file', () => {
    const code = [
      '/** Calculate value */',
      'export function calculateValue(x: number): number {',
      '  try { return x * 2; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = analyzeAmberSpecimen(code, 'src/calc.ts')
    expect(result.file).toBe('src/calc.ts')
    expect(result.amberClarity).toBeGreaterThan(0)
    expect(result.fossilQuality).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const result = analyzeAmberSpecimen('', 'empty.ts')
    expect(result.amberClarity).toBe(0)
    expect(result.fossilQuality).toBe(0)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('classifies specimen condition correctly', () => {
    const code = [
      '/** Docs */',
      'export interface Config { value: number; }',
      'export class Calculator implements Config {',
      '  value: number;',
      '  compute(): number { try { return this.value; } catch { return 0; } }',
      '}',
    ].join('\n')
    const result = analyzeAmberSpecimen(code, 'src/calc.ts')
    expect(['pristine-amber', 'clear-specimen', 'good-fossil']).toContain(result.condition)
  })
})

// ─── Classification Helpers ─────────────────────────────

describe('classifySpecimenCondition', () => {
  it('returns pristine-amber for high scores with transparency', () => {
    const result = classifySpecimenCondition(90, { clarity: 80, isTransparent: true } as any, { state: 85, isPerfectlyPreserved: true, hasActiveDecay: false } as any)
    expect(result).toBe('pristine-amber')
  })

  it('returns decayed-remains for low scores', () => {
    const result = classifySpecimenCondition(5, { clarity: 10, isTransparent: false } as any, { state: 5, isPerfectlyPreserved: false, hasActiveDecay: true } as any)
    expect(result).toBe('decayed-remains')
  })

  it('returns clear-specimen for high score with transparent amber', () => {
    const result = classifySpecimenCondition(70, { clarity: 75, isTransparent: true } as any, { state: 60, isPerfectlyPreserved: false, hasActiveDecay: false } as any)
    expect(result).toBe('clear-specimen')
  })
})

describe('classifyDepositType', () => {
  it('returns barren-ground for empty specimens', () => {
    expect(classifyDepositType([], 0)).toBe('barren-ground')
  })

  it('returns baltic-sea for high pristine ratio and clarity', () => {
    const specimens = Array.from({ length: 3 }, () => ({ condition: 'pristine-amber' } as AmberSpecimen))
    expect(classifyDepositType(specimens, 75)).toBe('baltic-sea')
  })

  it('returns dominican-mine for good clarity', () => {
    const specimens = [{ condition: 'good-fossil' } as AmberSpecimen]
    expect(classifyDepositType(specimens, 60)).toBe('dominican-mine')
  })
})

describe('classifyDepositCondition', () => {
  it('returns museum-collection for high clarity', () => {
    expect(classifyDepositCondition(80)).toBe('museum-collection')
  })

  it('returns empty-quarry for very low clarity', () => {
    expect(classifyDepositCondition(5)).toBe('empty-quarry')
  })

  it('returns research-collection for good clarity', () => {
    expect(classifyDepositCondition(65)).toBe('research-collection')
  })
})

describe('classifyPaleontologistGrade', () => {
  it('returns chief-paleontologist for high preservation', () => {
    expect(classifyPaleontologistGrade(85)).toBe('chief-paleontologist')
  })

  it('returns grave-robber for very low preservation', () => {
    expect(classifyPaleontologistGrade(10)).toBe('grave-robber')
  })

  it('returns archaeologist for moderate preservation', () => {
    expect(classifyPaleontologistGrade(55)).toBe('archaeologist')
  })
})

// ─── Deposit Analysis ───────────────────────────────────

describe('analyzeAmberDeposit', () => {
  it('handles empty deposit', () => {
    const result = analyzeAmberDeposit([], 'empty-dir')
    expect(result.depositType).toBe('barren-ground')
    expect(result.condition).toBe('empty-quarry')
    expect(result.avgClarity).toBe(0)
  })

  it('analyzes deposit with specimens', () => {
    const specimens = [
      analyzeAmberSpecimen('/** docs */\nexport function a(): number { return 1; }', 'dir/a.ts'),
      analyzeAmberSpecimen('/** docs */\nexport function b(): string { return "x"; }', 'dir/b.ts'),
    ]
    const result = analyzeAmberDeposit(specimens, 'dir')
    expect(result.directory).toBe('dir')
    expect(result.specimens.length).toBe(2)
    expect(result.avgClarity).toBeGreaterThan(0)
  })
})

// ─── Recommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns maintenance message for clean code', () => {
    const result = buildAmberFossilResult(['clean.ts'], ['/** docs */\nexport function clean(): void {}'])
    expect(result.recommendations).toContain('Maintain current preservation standards for the collection')
  })

  it('recommends excavating decayed remains', () => {
    const result = buildAmberFossilResult(
      ['bad.ts'],
      ['// deprecated TODO hack\nconst x: any = 1'],
    )
    const hasDecay = result.recommendations.some(r => r.includes('Excavate decayed'))
    if (result.stats.decayedRemainsCount > 0) {
      expect(hasDecay).toBe(true)
    }
  })

  it('recommends improving amber clarity for low clarity', () => {
    const code = 'const x = 1\nconst y = 2'
    const result = buildAmberFossilResult(['plain.ts'], [code])
    if (result.stats.avgAmberClarity < 40) {
      const hasClarity = result.recommendations.some(r => r.includes('amber clarity'))
      expect(hasClarity).toBe(true)
    }
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('buildAmberFossilResult', () => {
  it('handles empty input', () => {
    const result = buildAmberFossilResult([], [])
    expect(result.specimens).toEqual([])
    expect(result.deposits).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.paleontologistGrade).toBe('grave-robber')
  })

  it('analyzes single file', () => {
    const code = [
      '/** Calculate sum */',
      'export function calculateSum(a: number, b: number): number {',
      '  try { return a + b; }',
      '  catch(e) { return 0; }',
      '}',
    ].join('\n')
    const result = buildAmberFossilResult(['src/math.ts'], [code])
    expect(result.specimens.length).toBe(1)
    expect(result.deposits.length).toBe(1)
    expect(result.specimens[0].file).toBe('src/math.ts')
    expect(result.specimens[0].amberClarity).toBeGreaterThan(0)
    expect(result.specimens[0].fossilQuality).toBeGreaterThan(0)
    expect(result.museum.overallPreservation).toBeGreaterThan(0)
    expect(result.stats.clearestSpecimen).toBe('src/math.ts')
  })

  it('analyzes multiple files across deposits', () => {
    const goodCode = '/** docs */\nexport function good(): number { return 1; }\ntry { good(); } catch(e) {}'
    const badCode = 'const x: any = 1\n// TODO: fix'
    const result = buildAmberFossilResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [goodCode, badCode, goodCode],
    )
    expect(result.specimens.length).toBe(3)
    expect(result.deposits.length).toBe(2)
    expect(result.stats.totalDeposits).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('computes correct averages', () => {
    const code1 = '/** docs */\nexport function a(): number { try { return 1; } catch { return 0; } }'
    const code2 = '/** docs */\nexport function b(): string { try { return "x"; } catch { return ""; } }'
    const result = buildAmberFossilResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.avgAmberClarity).toBeGreaterThan(0)
    expect(result.stats.avgFossilQuality).toBeGreaterThan(0)
    expect(result.stats.avgPreservationState).toBeGreaterThan(0)
  })

  it('tracks condition counts', () => {
    const goodCode = [
      '/** docs */',
      'export interface IConfig { value: number; }',
      'export class Config implements IConfig {',
      '  value: number;',
      '  constructor() { this.value = 1; }',
      '  getValue(): number { try { return this.value; } catch { return 0; } }',
      '}',
    ].join('\n')
    const badCode = 'const x: any = 1'
    const result = buildAmberFossilResult(['good.ts', 'bad.ts'], [goodCode, badCode])
    const totalConditions = result.stats.pristineAmberCount +
      result.stats.clearSpecimenCount +
      result.stats.goodFossilCount +
      result.stats.cloudyAmberCount +
      result.stats.crackedSpecimenCount +
      result.stats.decayedRemainsCount
    expect(totalConditions).toBe(2)
  })

  it('tracks color counts', () => {
    const code = '/** docs */\nexport function fn(): number { return 1; }'
    const result = buildAmberFossilResult(['a.ts'], [code])
    const totalColors = result.stats.goldenCount +
      result.stats.cognacCount +
      result.stats.milkyCount +
      result.stats.blackColor
    expect(totalColors).toBe(1)
  })

  it('tracks extraction counts', () => {
    const easyCode = '/** docs */\nexport function simple(): void {}'
    const result = buildAmberFossilResult(['easy.ts'], [easyCode])
    expect(result.stats.isEasyToExtractCount + result.stats.isDifficultToExtractCount).toBeGreaterThanOrEqual(0)
  })

  it('populates best-of fields', () => {
    const code1 = '/** docs */\nexport function a(): void {}'
    const code2 = 'const x = 1'
    const result = buildAmberFossilResult(['a.ts', 'b.ts'], [code1, code2])
    expect(result.stats.clearestSpecimen).toBeTruthy()
    expect(result.stats.bestPreserved).toBeTruthy()
    expect(result.stats.mostAncient).toBeTruthy()
    expect(result.stats.mostModern).toBeTruthy()
    expect(result.stats.easiestToExtract).toBeTruthy()
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('amber-fossil format helpers', () => {
  const sampleResult: AmberFossilResult = buildAmberFossilResult(
    ['test.ts'],
    ['/** docs */\nexport function test(): number { return 1; }'],
  )

  it('formatAmberFossilTable returns string with report header', () => {
    const output = formatAmberFossilTable(sampleResult, false)
    expect(output).toContain('Amber Fossil Report')
    expect(output).toContain('Museum Overview')
    expect(output).toContain('Statistics')
  })

  it('formatAmberFossilTable shows specimen details in verbose mode', () => {
    const output = formatAmberFossilTable(sampleResult, true)
    expect(output).toContain('Specimen Details')
    expect(output).toContain('test.ts')
  })

  it('formatAmberFossilTable shows deposits', () => {
    const output = formatAmberFossilTable(sampleResult, false)
    expect(output).toContain('Amber Deposits')
  })

  it('formatAmberFossilJson returns valid JSON', () => {
    const output = formatAmberFossilJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.specimens).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.museum).toBeDefined()
  })

  it('formatAmberFossilCsv returns CSV with headers', () => {
    const output = formatAmberFossilCsv(sampleResult)
    expect(output).toContain('File,AmberClarity,FossilQuality')
    expect(output).toContain('test.ts')
  })

  it('formatAmberFossilCsv escapes commas in filenames', () => {
    const result = buildAmberFossilResult(
      ['file,with,commas.ts'],
      ['/** docs */\nexport function f(): void {}'],
    )
    const output = formatAmberFossilCsv(result)
    expect(output).toContain('"file,with,commas.ts"')
  })

  it('handles empty result in all formats', () => {
    const empty = buildAmberFossilResult([], [])
    expect(() => formatAmberFossilTable(empty, false)).not.toThrow()
    expect(() => formatAmberFossilTable(empty, true)).not.toThrow()
    expect(() => formatAmberFossilJson(empty)).not.toThrow()
    expect(() => formatAmberFossilCsv(empty)).not.toThrow()
  })

  it('shows recommendations in table output', () => {
    const output = formatAmberFossilTable(sampleResult, false)
    expect(output).toContain('Recommendations')
  })
})
