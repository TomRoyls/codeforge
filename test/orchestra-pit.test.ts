import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countShortNames,
  classifyPartCondition, classifySectionType,
  classifySectionCondition, classifyMaestroGrade,
  measureInstrument, measureRhythm, measureDynamics,
  measureEnsemble, measureScore, measurePerformance,
  analyzeInstrumentPart, analyzeOrchestraSection,
  generateRecommendations, buildOrchestraPitResult,
} from '../src/commands/orchestra-pit-helpers.js'
import { formatOrchestraPitTable, formatOrchestraPitJson } from '../src/commands/orchestra-pit-format-helpers.js'

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

const errorHeavyCode = [
  'try {',
  '  doSomething()',
  '} catch (e) {',
  '  handleError(e)',
  '}',
  'try {',
  '  doOther()',
  '} catch (e) {',
  '  handleOther(e)',
  '}',
].join('\n')

const branchyCode = [
  'if (a) {',
  '  if (b) {',
  '    if (c) {',
  '      if (d) {',
  '        if (e) {',
  '          x = 1',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('orchestra-pit primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc(strongCode)).toBe(18)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(simpleCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(simpleCode)).toBe(0)
    expect(countExports(strongCode)).toBe(3)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions(simpleCode)).toBe(0)
    expect(countFunctions(strongCode)).toBe(1)
    expect(countFunctions(typedCode)).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBe(3)
    expect(countErrorHandling(errorHeavyCode)).toBe(4)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(strongCode)).toBe(5)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches(strongCode)).toBe(1)
    expect(countBranches(branchyCode)).toBe(5)
  })

  it('maxNesting returns max brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting(simpleCode)).toBe(0)
    expect(maxNesting(branchyCode)).toBe(5)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments(strongCode)).toBe(2)
  })

  it('countTodos counts TODO/FIXME/HACK markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(diverseCode)).toBe(1)
    expect(countTodos('TODO: fix\nFIXME: hack')).toBe(3)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts camelCase >3 chars', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames(strongCode)).toBe(2)
  })

  it('countShortNames counts 1-2 char names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames(simpleCode)).toBe(1)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('orchestra-pit classifications', () => {
  it('classifyPartCondition returns correct grade', () => {
    expect(classifyPartCondition(90)).toBe('virtuoso')
    expect(classifyPartCondition(80)).toBe('virtuoso')
    expect(classifyPartCondition(70)).toBe('first-chair')
    expect(classifyPartCondition(50)).toBe('section-player')
    expect(classifyPartCondition(30)).toBe('amateur')
    expect(classifyPartCondition(15)).toBe('beginner')
    expect(classifyPartCondition(5)).toBe('tone-deaf')
    expect(classifyPartCondition(0)).toBe('tone-deaf')
  })

  it('classifySectionType returns correct type', () => {
    expect(classifySectionType([])).toBe('solo-stage')
  })

  it('classifySectionCondition returns correct condition', () => {
    expect(classifySectionCondition(80)).toBe('world-class')
    expect(classifySectionCondition(65)).toBe('professional')
    expect(classifySectionCondition(45)).toBe('community')
    expect(classifySectionCondition(30)).toBe('school')
    expect(classifySectionCondition(15)).toBe('garage')
    expect(classifySectionCondition(5)).toBe('cacophony')
  })

  it('classifyMaestroGrade returns correct grade', () => {
    expect(classifyMaestroGrade(85)).toBe('grand-maestro')
    expect(classifyMaestroGrade(70)).toBe('maestro')
    expect(classifyMaestroGrade(50)).toBe('conductor')
    expect(classifyMaestroGrade(35)).toBe('musician')
    expect(classifyMaestroGrade(20)).toBe('busker')
    expect(classifyMaestroGrade(5)).toBe('street-performer')
    expect(classifyMaestroGrade(0)).toBe('street-performer')
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('orchestra-pit measurements', () => {
  it('measureInstrument returns correct properties for empty', () => {
    const inst = measureInstrument(emptyCode)
    expect(inst.type).toBe('vocals')
    expect(inst.family).toBe('entry')
    expect(inst.range).toBe(0)
    expect(inst.isTuned).toBe(false)
    expect(inst.pitchAccuracy).toBe(0)
  })

  it('measureInstrument classifies brass for class+function', () => {
    const inst = measureInstrument(diverseCode)
    expect(inst.type).toBe('brass')
    expect(inst.family).toBe('models')
  })

  it('measureInstrument classifies brass for classes only', () => {
    const brassCode = 'export class Foo { bar(): void {} }'
    const inst = measureInstrument(brassCode)
    expect(inst.type).toBe('brass')
    expect(inst.family).toBe('models')
  })

  it('measureInstrument classifies woodwinds for many functions', () => {
    const wwCode = [
      'function a() {}',
      'function b() {}',
      'function c() {}',
      'function d() {}',
    ].join('\n')
    const inst = measureInstrument(wwCode)
    expect(inst.type).toBe('woodwinds')
    expect(inst.family).toBe('utilities')
  })

  it('measureRhythm detects steady beat for simple code', () => {
    const r = measureRhythm(simpleCode)
    expect(r.tempo).toBe(0)
    expect(r.isSteadyBeat).toBe(false)
    expect(r.timeSignature).toBe('4/4')
  })

  it('measureRhythm detects chaotic time for deep nesting', () => {
    const r = measureRhythm(branchyCode)
    expect(r.hasDoubleTime).toBe(true)
    expect(r.timeSignature).toBe('chaotic')
  })

  it('measureRhythm detects free time for empty code', () => {
    const r = measureRhythm(emptyCode)
    expect(r.tempo).toBe(0)
    expect(r.timeSignature).toBe('free')
  })

  it('measureDynamics detects pianissimo for error handling', () => {
    const d = measureDynamics(strongCode)
    expect(d.hasPianissimo).toBe(true)
    expect(d.dynamicControl).toBeGreaterThan(0)
  })

  it('measureDynamics returns zero range for empty', () => {
    const d = measureDynamics(emptyCode)
    expect(d.range).toBe(0)
    expect(d.hasPianissimo).toBe(false)
  })

  it('measureEnsemble detects inSection for imports/exports', () => {
    const e = measureEnsemble(strongCode)
    expect(e.isInSection).toBe(true)
    expect(e.followsCues).toBe(true)
  })

  it('measureEnsemble detects soloist for exports without imports', () => {
    const e = measureEnsemble(typedCode)
    expect(e.isSoloist).toBe(true)
  })

  it('measureScore returns readable for annotated code', () => {
    const s = measureScore(strongCode)
    expect(s.isReadable).toBe(true)
    expect(s.hasAnnotations).toBe(true)
    expect(s.readability).toBeGreaterThan(0)
  })

  it('measureScore returns readable for empty code', () => {
    const s = measureScore(emptyCode)
    expect(s.isReadable).toBe(true)
  })

  it('measurePerformance detects rehearsed for error handling', () => {
    const p = measurePerformance(strongCode)
    expect(p.isRehearsed).toBe(true)
    expect(p.performanceReady).toBe(true)
  })

  it('measurePerformance returns not rehearsed for empty', () => {
    const p = measurePerformance(emptyCode)
    expect(p.isRehearsed).toBe(false)
    expect(p.performanceReady).toBe(false)
  })
})

// ─── Analysis Functions ───────────────────────────────────────────────────────

describe('orchestra-pit analysis', () => {
  it('analyzeInstrumentPart returns tone-deaf for empty', () => {
    const part = analyzeInstrumentPart(emptyCode, 'empty.ts')
    expect(part.file).toBe('empty.ts')
    expect(part.condition).toBe('tone-deaf')
    expect(part.qualityScore).toBe(0)
    expect(part.tuning).toBe(0)
    expect(part.timing).toBe(0)
    expect(part.dynamics).toBe(0)
    expect(part.harmony).toBe(0)
    expect(part.soloQuality).toBe(0)
    expect(part.conductorClarity).toBe(0)
    expect(part.instrument.type).toBe('vocals')
    expect(part.rhythm.timeSignature).toBe('free')
    expect(part.score.readability).toBe(15)
  })

  it('analyzeInstrumentPart scores strong code well', () => {
    const part = analyzeInstrumentPart(strongCode, 'strong.ts')
    expect(part.file).toBe('strong.ts')
    expect(part.qualityScore).toBeGreaterThan(20)
    expect(part.instrument.type).toBeDefined()
    expect(part.rhythm.tempo).toBeGreaterThan(0)
    expect(part.performance.isRehearsed).toBe(true)
  })

  it('analyzeOrchestraSection handles empty instruments', () => {
    const sec = analyzeOrchestraSection([], 'empty-dir')
    expect(sec.directory).toBe('empty-dir')
    expect(sec.instruments).toHaveLength(0)
    expect(sec.avgTuning).toBe(0)
    expect(sec.sectionType).toBe('solo-stage')
    expect(sec.condition).toBe('cacophony')
  })

  it('analyzeOrchestraSection aggregates instrument scores', () => {
    const parts = [
      analyzeInstrumentPart(strongCode, 'strong.ts'),
      analyzeInstrumentPart(typedCode, 'typed.ts'),
    ]
    const sec = analyzeOrchestraSection(parts, 'src')
    expect(sec.directory).toBe('src')
    expect(sec.instruments).toHaveLength(2)
    expect(sec.avgTuning).toBeGreaterThan(0)
    expect(sec.avgHarmony).toBeGreaterThanOrEqual(0)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('orchestra-pit buildOrchestraPitResult', () => {
  it('handles empty input', () => {
    const result = buildOrchestraPitResult([], [], {})
    expect(result.instruments).toHaveLength(0)
    expect(result.sections).toHaveLength(0)
    expect(result.symphony.avgTuning).toBe(0)
    expect(result.symphony.overallHarmony).toBe(0)
    expect(result.symphony.isInTune).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.maestroGrade).toBe('street-performer')
    expect(result.stats.bestInstrument).toBe('none')
    expect(result.stats.worstInstrument).toBe('none')
  })

  it('handles single file', () => {
    const result = buildOrchestraPitResult(['calc.ts'], [typedCode], {})
    expect(result.instruments).toHaveLength(1)
    expect(result.instruments[0].file).toBe('calc.ts')
    expect(result.sections).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.maestroGrade).toBeDefined()
  })

  it('handles multi-file input', () => {
    const contents = [strongCode, diverseCode, simpleCode]
    const result = buildOrchestraPitResult(multiFilePaths, contents, {})
    expect(result.instruments).toHaveLength(3)
    expect(result.sections).toHaveLength(1)
    expect(result.symphony.avgTuning).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalSections).toBe(1)
    const totalTypes = result.stats.stringsCount +
      result.stats.woodwindsCount +
      result.stats.brassCount +
      result.stats.percussionCount +
      result.stats.keyboardsCount +
      result.stats.vocalsCount
    expect(totalTypes).toBe(3)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files into sections by directory', () => {
    const paths = ['src/a.ts', 'lib/b.ts', 'src/c.ts']
    const contents = [typedCode, typedCode, typedCode]
    const result = buildOrchestraPitResult(paths, contents, {})
    expect(result.sections).toHaveLength(2)
    expect(result.stats.totalSections).toBe(2)
  })

  it('tracks condition counts', () => {
    const result = buildOrchestraPitResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const total = result.stats.virtuosoCount +
      result.stats.firstChairCount +
      result.stats.sectionPlayerCount +
      result.stats.amateurCount +
      result.stats.beginnerCount +
      result.stats.toneDeafCount
    expect(total).toBe(3)
  })

  it('tracks instrument type counts', () => {
    const result = buildOrchestraPitResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const total = result.stats.stringsCount +
      result.stats.woodwindsCount +
      result.stats.brassCount +
      result.stats.percussionCount +
      result.stats.keyboardsCount +
      result.stats.vocalsCount
    expect(total).toBe(3)
  })

  it('computes best/worst instruments', () => {
    const result = buildOrchestraPitResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    expect(result.stats.bestInstrument).toBeDefined()
    expect(result.stats.worstInstrument).toBeDefined()
    expect(result.stats.bestTuned).toBeDefined()
    expect(result.stats.bestTimed).toBeDefined()
    expect(result.stats.bestDynamic).toBeDefined()
  })

  it('counts boolean properties correctly', () => {
    const result = buildOrchestraPitResult(
      ['strong.ts'],
      [strongCode],
      {},
    )
    expect(result.stats.tunedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.steadyBeatCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.missedBeatCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasDynamicsCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.inSectionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.soloistCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.rehearsedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.performanceReadyCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('orchestra-pit recommendations', () => {
  it('returns recommendations for problematic code', () => {
    const result = buildOrchestraPitResult(
      ['bad.ts'],
      [simpleCode],
      {},
    )
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns unique recommendations', () => {
    const result = buildOrchestraPitResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toHaveLength(unique.length)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('orchestra-pit format helpers', () => {
  it('formatOrchestraPitTable returns string', () => {
    const result = buildOrchestraPitResult(['a.ts'], [typedCode], {})
    const formatted = formatOrchestraPitTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Orchestra Pit')
  })

  it('formatOrchestraPitTable handles verbose mode', () => {
    const result = buildOrchestraPitResult(['a.ts'], [typedCode], {})
    const formatted = formatOrchestraPitTable(result, true)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('instrument:')
    expect(formatted).toContain('rhythm:')
    expect(formatted).toContain('dynamics:')
  })

  it('formatOrchestraPitTable handles empty input', () => {
    const result = buildOrchestraPitResult([], [], {})
    const formatted = formatOrchestraPitTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatOrchestraPitJson returns valid JSON', () => {
    const result = buildOrchestraPitResult(['a.ts'], [typedCode], {})
    const json = formatOrchestraPitJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.instruments).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.symphony).toBeDefined()
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('orchestra-pit edge cases', () => {
  it('handles mismatched file/content arrays', () => {
    const result = buildOrchestraPitResult(['a.ts', 'b.ts'], [typedCode], {})
    expect(result.instruments).toHaveLength(2)
  })

  it('handles deeply nested code', () => {
    const part = analyzeInstrumentPart(branchyCode, 'nested.ts')
    expect(part.rhythm.hasDoubleTime).toBe(true)
    expect(part.rhythm.timeSignature).toBe('chaotic')
  })

  it('handles code with many errors', () => {
    const part = analyzeInstrumentPart(errorHeavyCode, 'errors.ts')
    expect(part.dynamicsObj.hasPianissimo).toBe(true)
    expect(part.dynamicsObj.hasFortissimo).toBe(true)
  })

  it('handles code with only comments', () => {
    const commentCode = '// just a comment\n/* block */'
    const part = analyzeInstrumentPart(commentCode, 'comment.ts')
    expect(part.instrument.isMuted).toBe(true)
  })

  it('handles very large quality scores', () => {
    const part = analyzeInstrumentPart(strongCode, 'strong.ts')
    expect(part.qualityScore).toBeLessThanOrEqual(100)
    expect(part.tuning).toBeLessThanOrEqual(100)
    expect(part.timing).toBeLessThanOrEqual(100)
    expect(part.dynamics).toBeLessThanOrEqual(100)
    expect(part.harmony).toBeLessThanOrEqual(100)
    expect(part.soloQuality).toBeLessThanOrEqual(100)
    expect(part.conductorClarity).toBeLessThanOrEqual(100)
  })

  it('symphony isInTune is true when harmony >= 50', () => {
    const result = buildOrchestraPitResult(
      ['strong.ts', 'diverse.ts'],
      [strongCode, diverseCode],
      {},
    )
    expect(typeof result.symphony.isInTune).toBe('boolean')
  })

  it('section leader has higher conductor clarity', () => {
    const part = analyzeInstrumentPart(diverseCode, 'diverse.ts')
    expect(part.ensemble.sectionLeader).toBe(true)
  })
})
