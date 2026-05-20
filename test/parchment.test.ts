import { describe, expect, it } from 'vitest'

import {
  analyzeSections,
  analyzeMarginalia,
  evaluateInkQuality,
  evaluateScroll,
  computeDocumentationCoverage,
  computeJSDocCoverage,
  computeExportDocCoverage,
  classifyScroll,
  classifyLegibility,
  classifyScriptoriumGrade,
  generateRecommendations,
  buildParchmentResult,
  type ScrollSection,
  type ParchmentStats,
  type Scroll,
} from '../src/commands/parchment-helpers.js'

import { formatParchmentTable, formatParchmentJson } from '../src/commands/parchment-format-helpers.js'

// ─── analyzeSections ────────────────────────────────────────────────────────

describe('analyzeSections', () => {
  it('returns an array', () => {
    const result = analyzeSections('const x = 1', 'a.ts')
    expect(Array.isArray(result)).toBe(true)
  })

  it('detects exported functions', () => {
    const result = analyzeSections('export function add(a: number, b: number): number { return a + b }', 'a.ts')
    expect(result.some(s => s.name === 'add' && s.type === 'function')).toBe(true)
  })

  it('detects classes', () => {
    const result = analyzeSections('export class Calculator {}', 'a.ts')
    expect(result.some(s => s.name === 'Calculator' && s.type === 'class')).toBe(true)
  })

  it('detects interfaces', () => {
    const result = analyzeSections('export interface Config { name: string }', 'a.ts')
    expect(result.some(s => s.name === 'Config' && s.type === 'interface')).toBe(true)
  })

  it('detects type aliases', () => {
    const result = analyzeSections('export type Result = string | number', 'a.ts')
    expect(result.some(s => s.name === 'Result' && s.type === 'type')).toBe(true)
  })

  it('detects exported constants', () => {
    const result = analyzeSections('export const VERSION = "1.0"', 'a.ts')
    expect(result.some(s => s.name === 'VERSION' && s.type === 'constant')).toBe(true)
  })

  it('detects enums', () => {
    const result = analyzeSections('export enum Status { Active, Inactive }', 'a.ts')
    expect(result.some(s => s.name === 'Status' && s.type === 'enum')).toBe(true)
  })

  it('marks exported symbols', () => {
    const result = analyzeSections('export function f() {}', 'a.ts')
    expect(result[0].isExported).toBe(true)
  })

  it('marks non-exported symbols', () => {
    const result = analyzeSections('function f() {}', 'a.ts')
    expect(result[0].isExported).toBe(false)
  })

  it('detects JSDoc presence', () => {
    const result = analyzeSections('/** Adds two numbers */\nexport function add() {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.hasJSDoc).toBe(true)
  })

  it('detects missing JSDoc', () => {
    const result = analyzeSections('export function add() {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.hasJSDoc).toBe(false)
  })

  it('detects @param docs', () => {
    const result = analyzeSections('/** Add\n * @param a first\n * @param b second\n */\nexport function add(a: number, b: number) {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.hasParamDocs).toBe(true)
  })

  it('detects @returns docs', () => {
    const result = analyzeSections('/** Add\n * @returns sum\n */\nexport function add() {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.hasReturnDoc).toBe(true)
  })

  it('detects @example', () => {
    const result = analyzeSections('/** Add\n * @example add(1, 2)\n */\nexport function add() {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.hasExample).toBe(true)
  })

  it('marks exported without docs as needsDoc', () => {
    const result = analyzeSections('export function add() {}', 'a.ts')
    const add = result.find(s => s.name === 'add')
    expect(add?.needsDoc).toBe(true)
  })

  it('each section has required fields', () => {
    const result = analyzeSections('export function f() {}', 'a.ts')
    for (const s of result) {
      expect(s).toHaveProperty('name')
      expect(s).toHaveProperty('type')
      expect(s).toHaveProperty('hasJSDoc')
      expect(s).toHaveProperty('jsDocQuality')
      expect(s).toHaveProperty('quality')
    }
  })
})

// ─── analyzeMarginalia ──────────────────────────────────────────────────────

describe('analyzeMarginalia', () => {
  it('returns an array', () => {
    expect(Array.isArray(analyzeMarginalia('const x = 1'))).toBe(true)
  })

  it('detects TODO comments', () => {
    const result = analyzeMarginalia('const x = 1 // TODO: fix later')
    expect(result.some(m => m.type === 'todo')).toBe(true)
  })

  it('detects FIXME comments', () => {
    const result = analyzeMarginalia('const x = 1 // FIXME: broken')
    expect(result.some(m => m.type === 'fixme')).toBe(true)
  })

  it('detects warnings', () => {
    const result = analyzeMarginalia('const x = 1 // WARNING: dangerous')
    expect(result.some(m => m.type === 'warning')).toBe(true)
  })

  it('detects noise comments', () => {
    const result = analyzeMarginalia('const x = 1 // x')
    expect(result.some(m => m.type === 'noise')).toBe(true)
  })

  it('detects explanations', () => {
    const result = analyzeMarginalia('const x = complexCalc() // This handles the edge case where input is negative by applying the absolute value first')
    expect(result.some(m => m.type === 'explanation')).toBe(true)
  })

  it('detects HACK as outdated', () => {
    const result = analyzeMarginalia('const x = 1 // HACK: workaround')
    expect(result.some(m => m.type === 'outdated')).toBe(true)
  })

  it('returns empty for no comments', () => {
    expect(analyzeMarginalia('const x = 1\nconst y = 2')).toEqual([])
  })

  it('each item has required fields', () => {
    const result = analyzeMarginalia('const x = 1 // TODO: fix')
    for (const m of result) {
      expect(m).toHaveProperty('type')
      expect(m).toHaveProperty('line')
      expect(m).toHaveProperty('content')
      expect(m).toHaveProperty('quality')
      expect(m).toHaveProperty('description')
    }
  })
})

// ─── evaluateInkQuality ─────────────────────────────────────────────────────

describe('evaluateInkQuality', () => {
  it('returns InkQuality with all fields', () => {
    const result = evaluateInkQuality('const x = 1')
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('accuracy')
    expect(result).toHaveProperty('freshness')
    expect(result).toHaveProperty('completeness')
  })

  it('returns values between 0 and 100', () => {
    const result = evaluateInkQuality('const x = 1')
    for (const val of Object.values(result)) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('gives higher clarity for JSDoc', () => {
    const withDoc = evaluateInkQuality('/** docs */\nexport function f(): void {}')
    const bare = evaluateInkQuality('export function f() {}')
    expect(withDoc.clarity).toBeGreaterThan(bare.clarity)
  })

  it('penalizes freshness for TODOs', () => {
    const withTodo = evaluateInkQuality('// TODO: fix\nconst x = 1')
    const without = evaluateInkQuality('const x = 1')
    expect(without.freshness).toBeGreaterThan(withTodo.freshness)
  })

  it('gives higher completeness for full JSDoc', () => {
    const full = evaluateInkQuality('/** Add\n * @param a\n * @returns number\n * @example add(1,2)\n */\nfunction add() {}')
    const bare = evaluateInkQuality('function add() {}')
    expect(full.completeness).toBeGreaterThan(bare.completeness)
  })
})

// ─── evaluateScroll ─────────────────────────────────────────────────────────

describe('evaluateScroll', () => {
  it('returns a Scroll with all fields', () => {
    const result = evaluateScroll('const x = 1', 'a.ts')
    expect(result).toHaveProperty('file')
    expect(result).toHaveProperty('preservation')
    expect(result).toHaveProperty('ink')
    expect(result).toHaveProperty('illumination')
    expect(result).toHaveProperty('marginalia')
    expect(result).toHaveProperty('completeness')
    expect(result).toHaveProperty('age')
    expect(result).toHaveProperty('sections')
    expect(result).toHaveProperty('classification')
  })

  it('sets file path', () => {
    expect(evaluateScroll('const x = 1', 'a.ts').file).toBe('a.ts')
  })

  it('scores between 0 and 100', () => {
    const result = evaluateScroll('const x = 1', 'a.ts')
    for (const key of ['preservation', 'ink', 'illumination', 'marginalia', 'completeness'] as const) {
      expect(result[key]).toBeGreaterThanOrEqual(0)
      expect(result[key]).toBeLessThanOrEqual(100)
    }
  })

  it('gives higher preservation for documented code', () => {
    const doc = evaluateScroll('/** docs */\nexport function f(): void { return }', 'a.ts')
    const bare = evaluateScroll('const x = 1', 'a.ts')
    expect(doc.preservation).toBeGreaterThan(bare.preservation)
  })

  it('returns valid classification', () => {
    const result = evaluateScroll('const x = 1', 'a.ts')
    expect(['illuminated-manuscript', 'well-written', 'standard', 'faded', 'blank-scroll', 'damaged']).toContain(result.classification)
  })
})

// ─── computeDocumentationCoverage ───────────────────────────────────────────

describe('computeDocumentationCoverage', () => {
  it('returns 50 for empty sections', () => {
    expect(computeDocumentationCoverage([])).toBe(50)
  })

  it('returns 100 for fully documented', () => {
    const sections = [makeSection('f', true), makeSection('g', true)]
    expect(computeDocumentationCoverage(sections)).toBe(100)
  })

  it('returns 50 for half documented', () => {
    const sections = [makeSection('f', true), makeSection('g', false)]
    expect(computeDocumentationCoverage(sections)).toBe(50)
  })

  it('returns 0 for none documented', () => {
    const sections = [makeSection('f', false), makeSection('g', false)]
    expect(computeDocumentationCoverage(sections)).toBe(0)
  })
})

// ─── computeJSDocCoverage ───────────────────────────────────────────────────

describe('computeJSDocCoverage', () => {
  it('returns 0 for empty sections', () => {
    expect(computeJSDocCoverage([])).toBe(0)
  })

  it('returns 100 for all with JSDoc', () => {
    const sections = [makeSection('f', true), makeSection('g', true)]
    expect(computeJSDocCoverage(sections)).toBe(100)
  })

  it('returns 50 for half with JSDoc', () => {
    const sections = [makeSection('f', true), makeSection('g', false)]
    expect(computeJSDocCoverage(sections)).toBe(50)
  })
})

// ─── computeExportDocCoverage ───────────────────────────────────────────────

describe('computeExportDocCoverage', () => {
  it('returns 100 for no exports', () => {
    expect(computeExportDocCoverage([])).toBe(100)
  })

  it('returns 100 for fully documented exports', () => {
    const sections = [makeSection('f', true, true), makeSection('g', true, true)]
    expect(computeExportDocCoverage(sections)).toBe(100)
  })

  it('returns 0 for undocumented exports', () => {
    const sections = [makeSection('f', false, true), makeSection('g', false, true)]
    expect(computeExportDocCoverage(sections)).toBe(0)
  })

  it('ignores non-exported symbols', () => {
    const sections = [makeSection('f', false, false)]
    expect(computeExportDocCoverage(sections)).toBe(100)
  })
})

// ─── classifyScroll ─────────────────────────────────────────────────────────

describe('classifyScroll', () => {
  it('returns illuminated-manuscript for high scores', () => {
    expect(classifyScroll(90, 85, 80, 90)).toBe('illuminated-manuscript')
  })

  it('returns well-written for good scores', () => {
    expect(classifyScroll(70, 70, 65, 65)).toBe('well-written')
  })

  it('returns standard for moderate scores', () => {
    expect(classifyScroll(50, 50, 45, 40)).toBe('standard')
  })

  it('returns faded for low scores', () => {
    expect(classifyScroll(30, 25, 30, 20)).toBe('faded')
  })

  it('returns damaged for very low preservation', () => {
    expect(classifyScroll(10, 15, 15, 10)).toBe('damaged')
  })

  it('returns blank-scroll for low but not damaged', () => {
    expect(classifyScroll(20, 30, 25, 20)).toBe('blank-scroll')
  })
})

// ─── classifyLegibility ─────────────────────────────────────────────────────

describe('classifyLegibility', () => {
  it('returns crystal-clear for high scores', () => {
    expect(classifyLegibility(85, 80)).toBe('crystal-clear')
  })

  it('returns legible for good scores', () => {
    expect(classifyLegibility(70, 65)).toBe('legible')
  })

  it('returns readable for moderate scores', () => {
    expect(classifyLegibility(50, 45)).toBe('readable')
  })

  it('returns faded for low scores', () => {
    expect(classifyLegibility(30, 25)).toBe('faded')
  })

  it('returns illegible for very low scores', () => {
    expect(classifyLegibility(15, 10)).toBe('illegible')
  })
})

// ─── classifyScriptoriumGrade ───────────────────────────────────────────────

describe('classifyScriptoriumGrade', () => {
  it('returns master-scribe for high coverage', () => {
    expect(classifyScriptoriumGrade(85, 80, 90)).toBe('master-scribe')
  })

  it('returns skilled-scribe for good coverage', () => {
    expect(classifyScriptoriumGrade(70, 65, 60)).toBe('skilled-scribe')
  })

  it('returns apprentice for moderate coverage', () => {
    expect(classifyScriptoriumGrade(50, 45, 40)).toBe('apprentice')
  })

  it('returns novice for low coverage', () => {
    expect(classifyScriptoriumGrade(30, 25, 20)).toBe('novice')
  })

  it('returns illiterate for very low coverage', () => {
    expect(classifyScriptoriumGrade(10, 10, 10)).toBe('illiterate')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends adding docs for blank scrolls', () => {
    const scrolls = [makeScroll('a.ts', 'blank-scroll')]
    const stats = makeStats({})
    const recs = generateRecommendations(scrolls, [], stats)
    expect(recs.some(r => r.includes('blank-scroll') || r.includes('documentation'))).toBe(true)
  })

  it('recommends documenting exported symbols', () => {
    const stats = makeStats({ exportedWithoutDocs: 3 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('exported'))).toBe(true)
  })

  it('recommends updating faded docs', () => {
    const scrolls = [makeScroll('a.ts', 'faded')]
    const stats = makeStats({})
    const recs = generateRecommendations(scrolls, [], stats)
    expect(recs.some(r => r.includes('faded'))).toBe(true)
  })

  it('recommends removing noise', () => {
    const stats = makeStats({ noiseMarginalia: 5 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('noise'))).toBe(true)
  })

  it('recommends for low JSDoc coverage', () => {
    const stats = makeStats({ jsDocCoverage: 20 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('JSDoc'))).toBe(true)
  })

  it('recommends for low export doc coverage', () => {
    const stats = makeStats({ exportDocCoverage: 25 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('export'))).toBe(true)
  })

  it('returns empty for healthy docs', () => {
    const scrolls = [makeScroll('a.ts', 'illuminated-manuscript')]
    const stats = makeStats({ jsDocCoverage: 90, exportDocCoverage: 90, noiseMarginalia: 0, exportedWithoutDocs: 0 })
    const recs = generateRecommendations(scrolls, [], stats)
    expect(recs).toEqual([])
  })
})

// ─── buildParchmentResult ───────────────────────────────────────────────────

describe('buildParchmentResult', () => {
  it('returns result with correct structure', () => {
    const result = buildParchmentResult([], [], {})
    expect(result).toHaveProperty('scrolls')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildParchmentResult([], [], {})
    expect(result.scrolls).toHaveLength(0)
    expect(result.stats.totalScrolls).toBe(0)
  })

  it('creates scrolls for each file', () => {
    const result = buildParchmentResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.scrolls).toHaveLength(2)
  })

  it('populates all stats fields', () => {
    const result = buildParchmentResult(['a.ts'], ['export function f() {}'], {})
    const stats = result.stats
    expect(typeof stats.totalScrolls).toBe('number')
    expect(typeof stats.totalSections).toBe('number')
    expect(typeof stats.documentationCoverage).toBe('number')
    expect(typeof stats.jsDocCoverage).toBe('number')
    expect(typeof stats.exportDocCoverage).toBe('number')
    expect(typeof stats.avgPreservation).toBe('number')
    expect(typeof stats.avgInk).toBe('number')
    expect(['crystal-clear', 'legible', 'readable', 'faded', 'illegible']).toContain(stats.overallLegibility)
    expect(['master-scribe', 'skilled-scribe', 'apprentice', 'novice', 'illiterate']).toContain(stats.scriptoriumGrade)
  })

  it('detects sections in code', () => {
    const result = buildParchmentResult(['a.ts'], ['export function add() {}\nexport class Calc {}'], {})
    expect(result.stats.totalSections).toBeGreaterThanOrEqual(2)
  })

  it('counts exported without docs', () => {
    const result = buildParchmentResult(['a.ts'], ['export function add() {}\nexport function sub() {}'], {})
    expect(result.stats.exportedWithoutDocs).toBeGreaterThan(0)
  })

  it('computes coverage metrics', () => {
    const result = buildParchmentResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.documentationCoverage).toBeGreaterThanOrEqual(0)
    expect(result.stats.jsDocCoverage).toBeLessThanOrEqual(100)
  })
})

// ─── formatParchmentTable ──────────────────────────────────────────────────

describe('formatParchmentTable', () => {
  it('returns a string', () => {
    const result = buildParchmentResult([], [], {})
    expect(typeof formatParchmentTable(result, false)).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildParchmentResult(['a.ts'], ['export function f() {}'], {})
    const formatted = formatParchmentTable(result, false)
    expect(formatted).toContain('Scrolls')
    expect(formatted).toContain('Statistics')
  })

  it('shows no scrolls message when empty', () => {
    const result = buildParchmentResult([], [], {})
    expect(formatParchmentTable(result, false)).toContain('No scrolls analyzed')
  })

  it('shows recommendations when present', () => {
    const result = buildParchmentResult([], [], {})
    result.recommendations = ['Test recommendation']
    expect(formatParchmentTable(result, false)).toContain('Recommendations')
  })

  it('respects verbose flag', () => {
    const result = buildParchmentResult(['a.ts'], ['export function f() {}'], {})
    const verbose = formatParchmentTable(result, true)
    expect(verbose).toContain('f')
  })
})

// ─── formatParchmentJson ───────────────────────────────────────────────────

describe('formatParchmentJson', () => {
  it('returns valid JSON', () => {
    const result = buildParchmentResult([], [], {})
    expect(() => JSON.parse(formatParchmentJson(result))).not.toThrow()
  })

  it('contains scrolls in JSON', () => {
    const result = buildParchmentResult([], [], {})
    const parsed = JSON.parse(formatParchmentJson(result))
    expect(parsed).toHaveProperty('scrolls')
  })

  it('contains stats in JSON', () => {
    const result = buildParchmentResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatParchmentJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalScrolls).toBe(1)
  })
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSection(name: string, hasJSDoc: boolean, isExported = false): ScrollSection {
  return {
    name,
    type: 'function',
    hasJSDoc,
    jsDocQuality: hasJSDoc ? 60 : 0,
    hasParamDocs: false,
    hasReturnDoc: false,
    hasExample: false,
    isExported,
    needsDoc: !hasJSDoc && isExported,
    description: hasJSDoc ? 'Documented' : 'Undocumented',
    quality: hasJSDoc ? 'adequate' : 'missing',
  }
}

function makeScroll(file: string, classification: 'illuminated-manuscript' | 'well-written' | 'standard' | 'faded' | 'blank-scroll' | 'damaged'): Scroll {
  return {
    file,
    preservation: 50,
    ink: 50,
    illumination: 50,
    marginalia: 50,
    completeness: 50,
    age: 'established',
    sections: [],
    classification,
  }
}

function makeStats(overrides: Partial<ParchmentStats> = {}): ParchmentStats {
  return {
    totalScrolls: 1,
    illuminatedManuscripts: 0,
    blankScrolls: 0,
    damagedScrolls: 0,
    totalSections: 1,
    documentedSections: 0,
    undocumentedSections: 1,
    exportedWithoutDocs: 0,
    totalMarginalia: 0,
    valuableMarginalia: 0,
    noiseMarginalia: 0,
    outdatedMarginalia: 0,
    avgPreservation: 50,
    avgInk: 50,
    avgIllumination: 50,
    avgMarginalia: 50,
    avgCompleteness: 50,
    documentationCoverage: 50,
    jsDocCoverage: 50,
    exportDocCoverage: 100,
    overallLegibility: 'readable',
    scriptoriumGrade: 'apprentice',
    ...overrides,
  }
}
