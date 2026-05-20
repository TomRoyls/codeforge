import { describe, expect, it } from 'vitest'

import {
  buildFabricResult,
  classifyBatchGrade,
  classifyMaterial,
  classifyWeavePattern,
  computeBatchQuality,
  computeComplexity,
  computeDyeConsistency,
  computeOverallFabricQuality,
  computeOverallGrade,
  computeTensileStrength,
  computeThreadCount,
  computeThreadQuality,
  countEmptyCatch,
  countExports,
  countJSDocComments,
  countJSDocOnExports,
  countNonBlankLines,
  countNullChecks,
  countTotalLines,
  countTryCatch,
  countTypeAnnotations,
  detectAllDefects,
  detectColorBleed,
  detectHoles,
  detectLooseThreads,
  detectNamingConvention,
  detectPilling,
  detectSnags,
  detectThinSpots,
  extractIdentifiers,
  findDominant,
  generateRecommendations,
  groupIntoBatches,
  type FabricBatch,
  type FabricDefect,
  type FabricOptions,
  type FabricResult,
  type FabricSample,
  type FabricStats,
} from '../src/commands/fabric-helpers.js'

import {
  formatBatchTable,
  formatDefect,
  formatDefectCatalog,
  formatFabricJson,
  formatFabricStats,
  formatFabricTable,
  formatGradeBadge,
  formatMaterialBadge,
  formatQualityMeter,
  formatRecommendations,
  formatSampleCard,
  formatSampleTable,
  formatWeaveBadge,
} from '../src/commands/fabric-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
const z = x + y
const a = x * y + z - x
const b = a + z + x * y - z
const shortResult = b
const longResultWithMoreContent = b + a + x + y + z + a + b
`

const TYPED_CONTENT = `function add(a: number, b: number): number {
  return a + b
}

function sub(a: number, b: number): number {
  return a - b
}
`

const SILK_CONTENT = `/**
 * Adds two numbers.
 * @param a - first number
 * @param b - second number
 * @returns the sum
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Subtracts b from a.
 * @param a - first number
 * @param b - second number
 * @returns the difference
 */
export function subtract(a: number, b: number): number {
  return a - b
}
`

const BURLAP_CONTENT = `var x = 1
var y = function() { return arguments[0] }
const z = require('fs')
// TODO: fix this
// FIXME: broken
// HACK: temp
console.log("debug")
`

const ERROR_CONTENT = `try {
  const data = JSON.parse(input)
} catch (e) {
  console.error(e)
}

if (x !== null) {
  process(x)
}
`

const DEPRECATED_CONTENT = `var x = 1
var y = function() { return arguments[0] }
const z = require('fs')
`

const GENERICS_CONTENT = `function identity<T>(value: T): T { return value }
function merge<A, B, C, D>(a: A, b: B): A & B { return { ...a, ...b } }
function wrap<T, U, V, W>(x: T): { value: T } { return { value: x } }
function combine<A, B, C>(a: A, b: B): [A, B] { return [a, b] }
function chain<T, U, V, W, X>(x: T): X { return x as unknown as X }
`

const MULTI_FILES = ['src/app.ts', 'src/utils.ts', 'test/app.test.ts']
const MULTI_CONTENTS = [SILK_CONTENT, SIMPLE_CONTENT, 'import { add } from "../src/app"\ntest("add", () => {})\n']

// ─── countNonBlankLines ────────────────────────────────────────────────────────

describe('countNonBlankLines', () => {
  it('counts non-blank lines', () => {
    expect(countNonBlankLines('a\n\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countNonBlankLines('')).toBe(0)
  })

  it('counts single line', () => {
    expect(countNonBlankLines('hello')).toBe(1)
  })

  it('ignores whitespace-only lines', () => {
    expect(countNonBlankLines('a\n   \nb')).toBe(2)
  })
})

// ─── countTotalLines ───────────────────────────────────────────────────────────

describe('countTotalLines', () => {
  it('counts total lines', () => {
    expect(countTotalLines('a\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countTotalLines('')).toBe(0)
  })
})

// ─── computeThreadCount ────────────────────────────────────────────────────────

describe('computeThreadCount', () => {
  it('returns 0 for empty content', () => {
    expect(computeThreadCount('')).toBe(0)
  })

  it('returns 100 for no blank lines', () => {
    expect(computeThreadCount('a\nb\nc')).toBe(100)
  })

  it('returns 75 for 3/4 non-blank', () => {
    expect(computeThreadCount('a\n\nb\nc')).toBe(75)
  })
})

// ─── countTypeAnnotations ──────────────────────────────────────────────────────

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('counts multiple annotations', () => {
    expect(countTypeAnnotations('function f(a: string, b: number): void {}')).toBe(3)
  })

  it('returns 0 for untyped code', () => {
    expect(countTypeAnnotations('const x = 1')).toBe(0)
  })
})

// ─── countJSDocComments ────────────────────────────────────────────────────────

describe('countJSDocComments', () => {
  it('counts JSDoc comments', () => {
    expect(countJSDocComments('/** doc */\nfunction f() {}')).toBe(1)
  })

  it('returns 0 without JSDoc', () => {
    expect(countJSDocComments('function f() {}')).toBe(0)
  })
})

// ─── countExports ──────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export const a = 1; export function b() {}')).toBe(2)
  })

  it('returns 0 without exports', () => {
    expect(countExports('const a = 1')).toBe(0)
  })
})

// ─── countJSDocOnExports ───────────────────────────────────────────────────────

describe('countJSDocOnExports', () => {
  it('counts JSDoc on exports', () => {
    expect(countJSDocOnExports('/** doc */\nexport function f() {}')).toBe(1)
  })

  it('returns 0 without JSDoc on exports', () => {
    expect(countJSDocOnExports('export function f() {}')).toBe(0)
  })
})

// ─── computeComplexity ─────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeComplexity('if (a) {}')).toBe(2)
  })
})

// ─── countTryCatch ─────────────────────────────────────────────────────────────

describe('countTryCatch', () => {
  it('counts try blocks', () => {
    expect(countTryCatch('try {} catch(e) {}')).toBe(1)
  })

  it('returns 0 without try', () => {
    expect(countTryCatch('const x = 1')).toBe(0)
  })
})

// ─── countEmptyCatch ───────────────────────────────────────────────────────────

describe('countEmptyCatch', () => {
  it('counts empty catch blocks', () => {
    expect(countEmptyCatch('try {} catch(e) {}')).toBe(1)
  })

  it('does not count catch with body', () => {
    expect(countEmptyCatch('try {} catch(e) { handle(e) }')).toBe(0)
  })
})

// ─── countNullChecks ───────────────────────────────────────────────────────────

describe('countNullChecks', () => {
  it('counts null checks', () => {
    expect(countNullChecks('if (x !== null) {}')).toBe(1)
  })

  it('counts undefined checks', () => {
    expect(countNullChecks('if (x !== undefined) {}')).toBe(1)
  })
})

// ─── extractIdentifiers ────────────────────────────────────────────────────────

describe('extractIdentifiers', () => {
  it('extracts variable names', () => {
    const ids = extractIdentifiers('const myVar = 1; let other_name = 2')
    expect(ids).toContain('myVar')
    expect(ids).toContain('other_name')
  })

  it('extracts function names', () => {
    const ids = extractIdentifiers('function compute() {}')
    expect(ids).toContain('compute')
  })

  it('extracts class names', () => {
    const ids = extractIdentifiers('class Calculator {}')
    expect(ids).toContain('Calculator')
  })
})

// ─── classifyWeavePattern ──────────────────────────────────────────────────────

describe('classifyWeavePattern', () => {
  it('classifies lace for empty content', () => {
    expect(classifyWeavePattern('')).toBe('lace')
  })

  it('classifies plain for simple sequential code', () => {
    expect(classifyWeavePattern(SIMPLE_CONTENT)).toBe('plain')
  })

  it('classifies satin for documented low-complexity code', () => {
    expect(classifyWeavePattern(SILK_CONTENT)).toBe('satin')
  })

  it('classifies knit for heavy generics', () => {
    expect(classifyWeavePattern(GENERICS_CONTENT)).toBe('knit')
  })

  it('classifies felt for high complexity', () => {
    const complex = Array(20).fill('if (a) { if (b) { if (c) {} } }').join('\n')
    expect(classifyWeavePattern(complex)).toBe('felt')
  })
})

// ─── classifyMaterial ──────────────────────────────────────────────────────────

describe('classifyMaterial', () => {
  it('classifies burlap for empty content', () => {
    expect(classifyMaterial('')).toBe('burlap')
  })

  it('classifies silk for fully documented typed code', () => {
    expect(classifyMaterial(SILK_CONTENT)).toBe('silk')
  })

  it('classifies burlap for messy code', () => {
    expect(classifyMaterial(BURLAP_CONTENT)).toBe('burlap')
  })

  it('classifies polyester for simple functional code', () => {
    expect(classifyMaterial(SIMPLE_CONTENT)).toBe('polyester')
  })
})

// ─── detectNamingConvention ────────────────────────────────────────────────────

describe('detectNamingConvention', () => {
  it('detects camelCase', () => {
    expect(detectNamingConvention(['myVar', 'otherVar', 'thirdVar'])).toBe('camelCase')
  })

  it('detects PascalCase', () => {
    expect(detectNamingConvention(['MyClass', 'OtherClass'])).toBe('PascalCase')
  })

  it('detects snake_case', () => {
    expect(detectNamingConvention(['my_var', 'other_var'])).toBe('snake_case')
  })

  it('returns mixed for empty', () => {
    expect(detectNamingConvention([])).toBe('mixed')
  })
})

// ─── computeDyeConsistency ─────────────────────────────────────────────────────

describe('computeDyeConsistency', () => {
  it('returns 100 for consistent camelCase', () => {
    const content = 'const myVar = 1\nconst otherVar = 2\nconst thirdVar = 3'
    expect(computeDyeConsistency(content)).toBe(100)
  })

  it('returns 100 for empty content', () => {
    expect(computeDyeConsistency('')).toBe(100)
  })

  it('returns lower for mixed conventions', () => {
    const content = 'const myVar = 1\nconst other_var = 2'
    expect(computeDyeConsistency(content)).toBeLessThan(100)
  })
})

// ─── computeTensileStrength ────────────────────────────────────────────────────

describe('computeTensileStrength', () => {
  it('returns 0 for empty content', () => {
    expect(computeTensileStrength('')).toBe(0)
  })

  it('rewards try/catch with handling', () => {
    const score = computeTensileStrength(ERROR_CONTENT)
    expect(score).toBeGreaterThan(50)
  })

  it('penalizes empty catch', () => {
    const score = computeTensileStrength('try {} catch(e) {}')
    expect(score).toBeLessThan(50)
  })

  it('rewards null checks', () => {
    const score = computeTensileStrength('if (x !== null) { process(x) }')
    expect(score).toBeGreaterThan(50)
  })
})

// ─── computeThreadQuality ──────────────────────────────────────────────────────

describe('computeThreadQuality', () => {
  it('returns 0 for empty content', () => {
    expect(computeThreadQuality('')).toBe(0)
  })

  it('rewards type annotations', () => {
    const score = computeThreadQuality(TYPED_CONTENT)
    expect(score).toBeGreaterThan(0)
  })

  it('returns 0 for untyped code', () => {
    expect(computeThreadQuality('const x = 1')).toBe(0)
  })
})

// ─── computeOverallGrade ───────────────────────────────────────────────────────

describe('computeOverallGrade', () => {
  it('returns premium for silk with high scores and no defects', () => {
    const grade = computeOverallGrade({
      threadCount: 90,
      dyeConsistency: 95,
      tensileStrength: 85,
      threadQuality: 80,
      material: 'silk',
      defects: [],
    })
    expect(grade).toBe('premium')
  })

  it('returns reject for low scores', () => {
    const grade = computeOverallGrade({
      threadCount: 10,
      dyeConsistency: 15,
      tensileStrength: 20,
      threadQuality: 10,
      material: 'burlap',
      defects: [{ type: 'snag', line: 1, severity: 'critical', description: 'bad', fix: 'fix' }],
    })
    expect(grade).toBe('reject')
  })

  it('returns standard for moderate scores', () => {
    const grade = computeOverallGrade({
      threadCount: 60,
      dyeConsistency: 55,
      tensileStrength: 50,
      threadQuality: 45,
      material: 'cotton',
      defects: [],
    })
    expect(grade).toBe('standard')
  })
})

// ─── detectSnags ───────────────────────────────────────────────────────────────

describe('detectSnags', () => {
  it('detects property access without null check', () => {
    const defects = detectSnags('const x = data.field = value')
    expect(defects.some(d => d.type === 'snag')).toBe(true)
  })

  it('returns empty for safe code', () => {
    const defects = detectSnags('const x = 1')
    expect(defects).toEqual([])
  })
})

// ─── detectHoles ───────────────────────────────────────────────────────────────

describe('detectHoles', () => {
  it('detects JSON.parse without try', () => {
    const defects = detectHoles('const data = JSON.parse(input)')
    expect(defects.some(d => d.type === 'hole')).toBe(true)
  })

  it('detects empty catch', () => {
    const defects = detectHoles('try {} catch(e) {}')
    expect(defects.some(d => d.type === 'hole')).toBe(true)
  })

  it('returns empty for safe code', () => {
    const defects = detectHoles('const x = 1 + 2')
    expect(defects).toEqual([])
  })
})

// ─── detectLooseThreads ────────────────────────────────────────────────────────

describe('detectLooseThreads', () => {
  it('detects unused import', () => {
    const defects = detectLooseThreads('import { unused } from "mod"')
    expect(defects.some(d => d.type === 'loose-thread')).toBe(true)
  })

  it('does not flag used import', () => {
    const defects = detectLooseThreads('import { add } from "mod"\nconst x = add(1, 2)')
    expect(defects.every(d => d.type !== 'loose-thread')).toBe(true)
  })

  it('returns empty for no imports', () => {
    const defects = detectLooseThreads('const x = 1')
    expect(defects).toEqual([])
  })
})

// ─── detectColorBleed ──────────────────────────────────────────────────────────

describe('detectColorBleed', () => {
  it('detects mixed naming conventions', () => {
    const defects = detectColorBleed('const myVar = 1\nconst other_var = 2')
    expect(defects.some(d => d.type === 'color-bleed')).toBe(true)
  })

  it('returns empty for consistent naming', () => {
    const defects = detectColorBleed('const myVar = 1\nconst otherVar = 2')
    expect(defects).toEqual([])
  })

  it('returns empty for single identifier', () => {
    const defects = detectColorBleed('const x = 1')
    expect(defects).toEqual([])
  })
})

// ─── detectThinSpots ───────────────────────────────────────────────────────────

describe('detectThinSpots', () => {
  it('detects undocumented exports', () => {
    const defects = detectThinSpots('export function compute() {}')
    expect(defects.some(d => d.type === 'thin-spot')).toBe(true)
  })

  it('does not flag documented exports', () => {
    const defects = detectThinSpots('/** doc */\nexport function compute() {}')
    expect(defects.every(d => d.type !== 'thin-spot')).toBe(true)
  })
})

// ─── detectPilling ─────────────────────────────────────────────────────────────

describe('detectPilling', () => {
  it('detects accumulated issues', () => {
    expect(detectPilling(BURLAP_CONTENT).some(d => d.type === 'pilling')).toBe(true)
  })

  it('returns empty for clean code', () => {
    expect(detectPilling('const x = 1')).toEqual([])
  })
})

// ─── detectAllDefects ──────────────────────────────────────────────────────────

describe('detectAllDefects', () => {
  it('combines all defect types', () => {
    const defects = detectAllDefects(BURLAP_CONTENT)
    expect(defects.length).toBeGreaterThan(0)
  })
})

// ─── groupIntoBatches ──────────────────────────────────────────────────────────

describe('groupIntoBatches', () => {
  it('groups samples by directory', () => {
    const samples: FabricSample[] = [
      { file: 'src/a.ts', threadCount: 80, weavePattern: 'plain', material: 'cotton', dye: 'camelCase', dyeConsistency: 90, tensileStrength: 70, threadQuality: 60, overallGrade: 'standard', defects: [] },
      { file: 'src/b.ts', threadCount: 70, weavePattern: 'twill', material: 'linen', dye: 'camelCase', dyeConsistency: 85, tensileStrength: 60, threadQuality: 50, overallGrade: 'standard', defects: [] },
      { file: 'test/a.test.ts', threadCount: 90, weavePattern: 'satin', material: 'silk', dye: 'camelCase', dyeConsistency: 95, tensileStrength: 80, threadQuality: 70, overallGrade: 'premium', defects: [] },
    ]

    const batches = groupIntoBatches(samples, ['src/a.ts', 'src/b.ts', 'test/a.test.ts'])
    expect(batches).toHaveLength(2)

    const srcBatch = batches.find(b => b.name === 'src')
    expect(srcBatch).toBeDefined()
    expect(srcBatch!.samples).toHaveLength(2)
  })

  it('handles files in root directory', () => {
    const samples: FabricSample[] = [
      { file: 'app.ts', threadCount: 50, weavePattern: 'plain', material: 'polyester', dye: 'camelCase', dyeConsistency: 60, tensileStrength: 50, threadQuality: 30, overallGrade: 'economy', defects: [] },
    ]
    const batches = groupIntoBatches(samples, ['app.ts'])
    expect(batches).toHaveLength(1)
    expect(batches[0].name).toBe('.')
  })
})

// ─── computeBatchQuality ───────────────────────────────────────────────────────

describe('computeBatchQuality', () => {
  it('returns 0 for empty array', () => {
    expect(computeBatchQuality([])).toBe(0)
  })

  it('computes quality from material', () => {
    const samples: FabricSample[] = [
      { file: 'a.ts', threadCount: 80, weavePattern: 'plain', material: 'silk', dye: 'camelCase', dyeConsistency: 90, tensileStrength: 80, threadQuality: 70, overallGrade: 'premium', defects: [] },
    ]
    expect(computeBatchQuality(samples)).toBe(100)
  })

  it('penalizes critical defects', () => {
    const samples: FabricSample[] = [
      { file: 'a.ts', threadCount: 50, weavePattern: 'plain', material: 'cotton', dye: 'camelCase', dyeConsistency: 60, tensileStrength: 50, threadQuality: 40, overallGrade: 'standard', defects: [{ type: 'snag', line: 1, severity: 'critical', description: 'bad', fix: 'fix' }] },
    ]
    expect(computeBatchQuality(samples)).toBeLessThan(80)
  })
})

// ─── classifyBatchGrade ────────────────────────────────────────────────────────

describe('classifyBatchGrade', () => {
  it('returns premium for high quality', () => {
    expect(classifyBatchGrade(85)).toBe('premium')
  })

  it('returns standard for medium quality', () => {
    expect(classifyBatchGrade(60)).toBe('standard')
  })

  it('returns economy for low quality', () => {
    expect(classifyBatchGrade(35)).toBe('economy')
  })

  it('returns reject for very low quality', () => {
    expect(classifyBatchGrade(15)).toBe('reject')
  })
})

// ─── computeOverallFabricQuality ───────────────────────────────────────────────

describe('computeOverallFabricQuality', () => {
  it('returns 0 for empty array', () => {
    expect(computeOverallFabricQuality([])).toBe(0)
  })

  it('averages sample quality', () => {
    const samples: FabricSample[] = [
      { file: 'a.ts', threadCount: 80, weavePattern: 'plain', material: 'silk', dye: 'camelCase', dyeConsistency: 90, tensileStrength: 80, threadQuality: 70, overallGrade: 'premium', defects: [] },
      { file: 'b.ts', threadCount: 60, weavePattern: 'twill', material: 'cotton', dye: 'camelCase', dyeConsistency: 70, tensileStrength: 60, threadQuality: 50, overallGrade: 'standard', defects: [] },
    ]
    expect(computeOverallFabricQuality(samples)).toBe(70)
  })
})

// ─── findDominant ──────────────────────────────────────────────────────────────

describe('findDominant', () => {
  it('finds most common value', () => {
    expect(findDominant(['silk', 'cotton', 'silk'])).toBe('silk')
  })

  it('returns first for ties', () => {
    expect(findDominant(['a', 'b'])).toBe('a')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: FabricStats = {
    totalSamples: 5, avgThreadCount: 70, premiumCount: 3, rejectCount: 0,
    dominantMaterial: 'cotton', dominantWeave: 'plain', avgDyeConsistency: 80,
    avgTensileStrength: 75, avgThreadQuality: 60, defectCount: 2, criticalDefects: 0,
    overallFabricQuality: 70, bestBatch: 'src', worstBatch: 'test',
  }

  it('recommends upgrading burlap files', () => {
    const samples: FabricSample[] = [
      { file: 'bad.ts', threadCount: 30, weavePattern: 'felt', material: 'burlap', dye: 'mixed', dyeConsistency: 30, tensileStrength: 20, threadQuality: 10, overallGrade: 'reject', defects: [] },
    ]
    const recs = generateRecommendations(samples, [], baseStats)
    expect(recs.some(r => r.includes('burlap'))).toBe(true)
  })

  it('recommends patching holes', () => {
    const samples: FabricSample[] = [
      { file: 'app.ts', threadCount: 50, weavePattern: 'plain', material: 'cotton', dye: 'camelCase', dyeConsistency: 70, tensileStrength: 50, threadQuality: 40, overallGrade: 'standard', defects: [{ type: 'hole', line: 1, severity: 'major', description: 'missing error handling', fix: 'add try/catch' }] },
    ]
    const recs = generateRecommendations(samples, [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('hole'))).toBe(true)
  })

  it('recommends fixing color bleed', () => {
    const samples: FabricSample[] = [
      { file: 'app.ts', threadCount: 50, weavePattern: 'plain', material: 'cotton', dye: 'mixed', dyeConsistency: 30, tensileStrength: 50, threadQuality: 40, overallGrade: 'standard', defects: [{ type: 'color-bleed', line: 1, severity: 'minor', description: 'mixed conventions', fix: 'standardize' }] },
    ]
    const recs = generateRecommendations(samples, [], baseStats)
    expect(recs.some(r => r.toLowerCase().includes('color bleed'))).toBe(true)
  })

  it('warns about critical defects', () => {
    const stats = { ...baseStats, criticalDefects: 3 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('critical'))).toBe(true)
  })

  it('recommends for reject batches', () => {
    const batches: FabricBatch[] = [
      { name: 'bad-dir', samples: [], avgThreadCount: 20, dominantMaterial: 'burlap', batchQuality: 15, grade: 'reject' },
    ]
    const recs = generateRecommendations([], batches, baseStats)
    expect(recs.some(r => r.toLowerCase().includes('reject'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildFabricResult ─────────────────────────────────────────────────────────

describe('buildFabricResult', () => {
  it('builds complete result', () => {
    const result = buildFabricResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.samples).toHaveLength(3)
    expect(result.stats.totalSamples).toBe(3)
  })

  it('handles empty file list', () => {
    const result = buildFabricResult([], [], {})
    expect(result.samples).toEqual([])
    expect(result.stats.totalSamples).toBe(0)
    expect(result.stats.overallFabricQuality).toBe(0)
  })

  it('computes correct stats', () => {
    const result = buildFabricResult(['app.ts'], [SILK_CONTENT], {})
    expect(result.stats.totalSamples).toBe(1)
    expect(result.samples[0].material).toBe('silk')
    expect(result.samples[0].overallGrade).toBe('premium')
  })

  it('detects defects in burlap content', () => {
    const result = buildFabricResult(['bad.ts'], [BURLAP_CONTENT], {})
    expect(result.samples[0].defects.length).toBeGreaterThan(0)
  })

  it('creates batches', () => {
    const result = buildFabricResult(MULTI_FILES, MULTI_CONTENTS, {})
    expect(result.batches.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  const sample: FabricSample = {
    file: 'app.ts', threadCount: 80, weavePattern: 'satin', material: 'silk',
    dye: 'camelCase', dyeConsistency: 90, tensileStrength: 85, threadQuality: 75,
    overallGrade: 'premium', defects: [],
  }

  it('formatMaterialBadge returns emoji and name', () => {
    expect(formatMaterialBadge('silk')).toContain('silk')
  })

  it('formatWeaveBadge returns emoji and name', () => {
    expect(formatWeaveBadge('satin')).toContain('satin')
  })

  it('formatGradeBadge returns grade text', () => {
    expect(formatGradeBadge('premium')).toContain('premium')
  })

  it('formatQualityMeter returns bar and score', () => {
    const meter = formatQualityMeter(75)
    expect(meter).toContain('75')
    expect(meter).toContain('100')
  })

  it('formatSampleCard returns file info', () => {
    const card = formatSampleCard(sample)
    expect(card).toContain('app.ts')
    expect(card).toContain('silk')
  })

  it('formatSampleTable returns table with header', () => {
    const table = formatSampleTable([sample])
    expect(table).toContain('File')
  })

  it('formatSampleTable returns message for empty', () => {
    expect(formatSampleTable([])).toContain('No fabric samples')
  })

  it('formatDefect returns formatted defect', () => {
    const defect: FabricDefect = { type: 'snag', line: 5, severity: 'minor', description: 'test', fix: 'fix' }
    const formatted = formatDefect(defect)
    expect(formatted).toContain('snag')
    expect(formatted).toContain('L5')
  })

  it('formatDefectCatalog returns no defects message', () => {
    const catalog = formatDefectCatalog([])
    expect(catalog).toContain('No defects')
  })

  it('formatDefectCatalog groups defects by type', () => {
    const defects: FabricDefect[] = [
      { type: 'snag', line: 1, severity: 'minor', description: 'a', fix: 'f' },
      { type: 'snag', line: 2, severity: 'major', description: 'b', fix: 'f' },
    ]
    const catalog = formatDefectCatalog(defects)
    expect(catalog).toContain('snag: 2 found')
  })

  it('formatBatchTable returns table with header', () => {
    const batch: FabricBatch = {
      name: 'src', samples: [sample], avgThreadCount: 80,
      dominantMaterial: 'silk', batchQuality: 90, grade: 'premium',
    }
    const table = formatBatchTable([batch])
    expect(table).toContain('Batch')
  })

  it('formatBatchTable returns message for empty', () => {
    expect(formatBatchTable([])).toContain('No batches')
  })

  it('formatFabricStats returns stats summary', () => {
    const stats: FabricStats = {
      totalSamples: 10, avgThreadCount: 75, premiumCount: 5, rejectCount: 1,
      dominantMaterial: 'cotton', dominantWeave: 'plain', avgDyeConsistency: 80,
      avgTensileStrength: 70, avgThreadQuality: 60, defectCount: 5, criticalDefects: 1,
      overallFabricQuality: 72, bestBatch: 'src', worstBatch: 'test',
    }
    const formatted = formatFabricStats(stats)
    expect(formatted).toContain('Total samples: 10')
    expect(formatted).toContain('72')
  })

  it('formatRecommendations returns bullet list', () => {
    const recs = formatRecommendations(['Fix holes', 'Add types'])
    expect(recs).toContain('Fix holes')
    expect(recs).toContain('Add types')
  })

  it('formatRecommendations returns success for empty', () => {
    const recs = formatRecommendations([])
    expect(recs).toContain('excellent')
  })

  it('formatFabricJson returns valid JSON', () => {
    const result = buildFabricResult([], [], {})
    const json = formatFabricJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatFabricTable returns formatted output', () => {
    const result = buildFabricResult(['a.ts'], [SILK_CONTENT], {})
    const output = formatFabricTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })
})
