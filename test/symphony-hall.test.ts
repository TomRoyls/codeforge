import { describe, expect, it } from 'vitest'

import {
  measureHarmony,
  measureRhythm,
  measureDynamics,
  measureSections,
  measureScore,
  measurePerformance,
  buildSymphonyHallResult,
  classifyCondition,
  classifyConductorGrade,
  classifyHallType,
  classifyHallCondition,
  analyzeSymphonyMovement,
  countExports,
  countImports,
  countFunctions,
  countArrows,
  countClasses,
  countInterfaces,
  countTypeAliases,
  countComments,
  countJSDoc,
  countAsync,
  countAwaits,
  countTryCatch,
  countCatches,
  countFinallys,
  countThrows,
  countIfs,
  countElses,
  countNestedBlocks,
  countDeepNested,
  countTernaries,
  countConsole,
  countTodos,
  countErrors,
  countReturns,
  countSpreads,
  countDestructures,
  countDefaultParams,
  countGenerics,
  countAccessModifiers,
  countReadonly,
  countStatic,
  countAny,
  countCommentedCode,
  countPromises,
} from '../src/commands/symphony-hall-helpers.js'

import {
  formatSymphonyHallJson,
  formatSymphonyHallTable,
  scoreColor,
  conditionColor,
  gradeColor,
  venueColor,
} from '../src/commands/symphony-hall-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY = ''

const SIMPLE = 'const x = 1'

const RICH = `/** Documentation for foo */
export function foo(a: string): number { return a.length }
/** Documentation for bar */
export function bar(b: number): string { return String(b) }
export interface IFoo { a: string; b: number }
export interface IBar { c: boolean }
export type TResult = IFoo | IBar
type THelper = { x: number }
class MyClass { private x: number = 1; protected y: string = 'hello'; public z: boolean = true; static w: number = 42; readonly r: number = 10 }
try { foo('test') } catch (e) { throw new Error('fail') } finally {}
async function af() { await Promise.resolve(1) }
const f = () => 1
const arr = [1, 2, 3]
const [first, ...rest] = arr
const { a, b } = { a: 1, b: 2 }
function def(x = 10, y = 20) { return x + y }
console.log('debug')
`

// ─── Counter Tests ─────────────────────────────────────────────────────────

describe('symphony-hall counters', () => {
  it('countExports counts exports', () => {
    expect(countExports('export function foo() {}')).toBe(1)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports("import { foo } from 'bar'")).toBe(1)
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(RICH)).toBeGreaterThanOrEqual(3)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countClasses counts classes', () => {
    expect(countClasses(RICH)).toBeGreaterThanOrEqual(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(RICH)).toBeGreaterThanOrEqual(2)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(RICH)).toBeGreaterThanOrEqual(2)
    expect(countJSDoc(EMPTY)).toBe(0)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTryCatch(EMPTY)).toBe(0)
  })

  it('countFinallys counts finally blocks', () => {
    expect(countFinallys(RICH)).toBeGreaterThanOrEqual(1)
    expect(countFinallys(EMPTY)).toBe(0)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countAwaits counts await keywords', () => {
    expect(countAwaits(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAwaits(EMPTY)).toBe(0)
  })

  it('countGenerics counts generic parameters', () => {
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBeGreaterThanOrEqual(1)
    expect(countSpreads(EMPTY)).toBe(0)
  })

  it('countAny counts any keywords', () => {
    expect(countAny('const x: any = 1')).toBeGreaterThanOrEqual(1)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countErrors counts new Error', () => {
    expect(countErrors(RICH)).toBeGreaterThanOrEqual(1)
    expect(countErrors(EMPTY)).toBe(0)
  })

  it('countReadonly counts readonly', () => {
    expect(countReadonly(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBeGreaterThanOrEqual(1)
    expect(countPromises(EMPTY)).toBe(0)
  })

  it('countCommentedCode counts commented code', () => {
    expect(countCommentedCode('// function foo() {}')).toBeGreaterThanOrEqual(1)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(RICH)).toBeGreaterThanOrEqual(1)
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(RICH)).toBeGreaterThanOrEqual(2)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countCatches counts catch blocks', () => {
    expect(countCatches(RICH)).toBeGreaterThanOrEqual(1)
    expect(countCatches(EMPTY)).toBe(0)
  })

  it('countThrows counts throw statements', () => {
    expect(countThrows(RICH)).toBeGreaterThanOrEqual(1)
    expect(countThrows(EMPTY)).toBe(0)
  })

  it('countAccessModifiers counts private/protected/public', () => {
    expect(countAccessModifiers(RICH)).toBeGreaterThanOrEqual(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBeGreaterThanOrEqual(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countTodos counts TODO/FIXME comments', () => {
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countDefaultParams counts default parameters', () => {
    expect(countDefaultParams(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDefaultParams(EMPTY)).toBe(0)
  })
})

// ─── MeasureHarmony Tests ──────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('returns A-minor for empty content', () => {
    const m = measureHarmony(EMPTY)
    expect(m.coordination).toBe(30)
    expect(m.key).toBe('A-minor')
    expect(m.isHarmonious).toBe(false)
    expect(m.hasDissonance).toBe(false)
    expect(m.dissonanceCount).toBe(0)
  })

  it('returns D-minor for RICH content', () => {
    const m = measureHarmony(RICH)
    expect(m.coordination).toBe(56)
    expect(m.key).toBe('D-minor')
    expect(m.hasProperChords).toBe(true)
    expect(m.hasCounterpoint).toBe(true)
    expect(m.hasModulation).toBe(true)
    expect(m.hasContraryMotion).toBe(true)
    expect(m.dissonanceCount).toBe(0)
  })
})

// ─── MeasureRhythm Tests ───────────────────────────────────────────────────

describe('measureRhythm', () => {
  it('returns 6/8 for empty content', () => {
    const m = measureRhythm(EMPTY)
    expect(m.precision).toBe(50)
    expect(m.timeSignature).toBe('6/8')
    expect(m.isPrecise).toBe(false)
    expect(m.hasProperTempo).toBe(true)
    expect(m.syncopationCount).toBe(0)
  })

  it('returns 3/4 for RICH content', () => {
    const m = measureRhythm(RICH)
    expect(m.precision).toBe(61)
    expect(m.timeSignature).toBe('3/4')
    expect(m.isPrecise).toBe(true)
    expect(m.hasRitardando).toBe(true)
    expect(m.hasFermata).toBe(true)
    expect(m.hasGraceNotes).toBe(true)
  })
})

// ─── MeasureDynamics Tests ─────────────────────────────────────────────────

describe('measureDynamics', () => {
  it('returns p for empty content', () => {
    const m = measureDynamics(EMPTY)
    expect(m.range).toBe(20)
    expect(m.marking).toBe('p')
    expect(m.hasWideRange).toBe(false)
    expect(m.hasNoDistortion).toBe(true)
    expect(m.distortionCount).toBe(0)
  })

  it('returns mp for RICH content', () => {
    const m = measureDynamics(RICH)
    expect(m.range).toBe(30)
    expect(m.marking).toBe('mp')
    expect(m.hasNoDistortion).toBe(false)
    expect(m.distortionCount).toBe(1)
  })
})

// ─── MeasureSections Tests ─────────────────────────────────────────────────

describe('measureSections', () => {
  it('returns balanced for empty content', () => {
    const m = measureSections(EMPTY)
    expect(m.balance).toBe(60)
    expect(m.isBalanced).toBe(true)
    expect(m.hasFullOrchestra).toBe(false)
  })

  it('computes section scores for RICH content', () => {
    const m = measureSections(RICH)
    expect(m.balance).toBe(62)
    expect(m.isBalanced).toBe(true)
    expect(m.strings).toBeGreaterThan(0)
  })
})

// ─── MeasureScore Tests ────────────────────────────────────────────────────

describe('measureScore', () => {
  it('returns complete for empty content', () => {
    const m = measureScore(EMPTY)
    expect(m.fidelity).toBe(40)
    expect(m.isComplete).toBe(true)
    expect(m.hasNoMissingBars).toBe(true)
    expect(m.hasNoWrongNotes).toBe(true)
    expect(m.missingBarCount).toBe(0)
    expect(m.wrongNoteCount).toBe(0)
  })

  it('returns high fidelity for RICH content', () => {
    const m = measureScore(RICH)
    expect(m.fidelity).toBe(80)
    expect(m.hasProperNotation).toBe(true)
    expect(m.hasRehearsalMarks).toBe(true)
    expect(m.hasCadence).toBe(true)
  })
})

// ─── MeasurePerformance Tests ──────────────────────────────────────────────

describe('measurePerformance', () => {
  it('returns local-hall for empty content', () => {
    const m = measurePerformance(EMPTY)
    expect(m.quality).toBe(40)
    expect(m.venue).toBe('local-hall')
    expect(m.isPolished).toBe(false)
    expect(m.hasNoWrongNotes).toBe(true)
    expect(m.hasNoBreakdowns).toBe(true)
  })

  it('returns concertgebouw for RICH content', () => {
    const m = measurePerformance(RICH)
    expect(m.quality).toBe(61)
    expect(m.venue).toBe('concertgebouw')
    expect(m.isPolished).toBe(true)
    expect(m.hasEmotionalDepth).toBe(true)
    expect(m.hasTechnicalVirtuosity).toBe(true)
    expect(m.hasEnsemblePrecision).toBe(true)
    expect(m.hasMusicality).toBe(true)
    expect(m.hasInterpretation).toBe(true)
    expect(m.wrongNoteCount).toBe(1)
    expect(m.breakdownCount).toBe(0)
  })
})

// ─── Classification Tests ──────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies standing-ovation for >= 80', () => {
    expect(classifyCondition(85)).toBe('standing-ovation')
  })
  it('classifies bravo for >= 60', () => {
    expect(classifyCondition(65)).toBe('bravo')
  })
  it('classifies applause for >= 40', () => {
    expect(classifyCondition(45)).toBe('applause')
  })
  it('classifies polite-clapping for >= 20', () => {
    expect(classifyCondition(25)).toBe('polite-clapping')
  })
  it('classifies silence for >= 10', () => {
    expect(classifyCondition(12)).toBe('silence')
  })
  it('classifies booing for < 10', () => {
    expect(classifyCondition(5)).toBe('booing')
  })
})

describe('classifyConductorGrade', () => {
  it('returns maestro for >= 85', () => {
    expect(classifyConductorGrade(90)).toBe('maestro')
  })
  it('returns principal-conductor for >= 70', () => {
    expect(classifyConductorGrade(75)).toBe('principal-conductor')
  })
  it('returns conductor for >= 55', () => {
    expect(classifyConductorGrade(60)).toBe('conductor')
  })
  it('returns assistant-conductor for >= 40', () => {
    expect(classifyConductorGrade(45)).toBe('assistant-conductor')
  })
  it('returns rehearsal-pianist for >= 25', () => {
    expect(classifyConductorGrade(30)).toBe('rehearsal-pianist')
  })
  it('returns metronome for < 25', () => {
    expect(classifyConductorGrade(10)).toBe('metronome')
  })
})

describe('classifyHallType', () => {
  it('returns kazoo-ensemble for empty movements', () => {
    expect(classifyHallType([])).toBe('kazoo-ensemble')
  })
})

describe('classifyHallCondition', () => {
  it('returns noise-complaint for 0', () => {
    expect(classifyHallCondition(0)).toBe('noise-complaint')
  })
  it('returns grand-season for 85', () => {
    expect(classifyHallCondition(85)).toBe('grand-season')
  })
})

// ─── AnalyzeSymphonyMovement Tests ─────────────────────────────────────────

describe('analyzeSymphonyMovement', () => {
  it('returns correct movement for RICH content', () => {
    const m = analyzeSymphonyMovement(RICH, 'rich.ts')
    expect(m.file).toBe('rich.ts')
    expect(m.harmonicCoordination).toBe(56)
    expect(m.rhythmicPrecision).toBe(61)
    expect(m.dynamicRange).toBe(30)
    expect(m.sectionBalance).toBe(62)
    expect(m.scoreFidelity).toBe(80)
    expect(m.performanceQuality).toBe(61)
    expect(m.qualityScore).toBe(58)
    expect(m.condition).toBe('applause')
  })
})

// ─── BuildSymphonyHallResult Tests ─────────────────────────────────────────

describe('buildSymphonyHallResult', () => {
  it('handles empty file list', () => {
    const result = buildSymphonyHallResult([], [])
    expect(result.movements).toHaveLength(0)
    expect(result.halls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.festival.overallSymphony).toBe(0)
    expect(result.stats.conductorGrade).toBe('metronome')
  })

  it('computes correct stats for 3-file mix', () => {
    const result = buildSymphonyHallResult(['a.ts', 'b.ts', 'c.ts'], [RICH, SIMPLE, EMPTY])
    expect(result.movements).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.festival.overallSymphony).toBe(46)
    expect(result.stats.conductorGrade).toBe('assistant-conductor')
    expect(result.stats.avgHarmonicCoordination).toBe(39)
    expect(result.stats.avgRhythmicPrecision).toBe(54)
    expect(result.stats.avgDynamicRange).toBe(24)
    expect(result.stats.avgSectionBalance).toBe(61)
    expect(result.stats.avgScoreFidelity).toBe(53)
    expect(result.stats.avgPerformanceQuality).toBe(47)
  })

  it('groups files into halls by directory', () => {
    const result = buildSymphonyHallResult(['src/a.ts', 'src/b.ts', 'test/c.ts'], [RICH, SIMPLE, EMPTY])
    expect(result.halls).toHaveLength(2)
    expect(result.halls.some(h => h.directory === 'src')).toBe(true)
    expect(result.halls.some(h => h.directory === 'test')).toBe(true)
  })

  it('populates best stats', () => {
    const result = buildSymphonyHallResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stats.bestMovement).toBe('a.ts')
    expect(result.stats.mostHarmonious).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
  })

  it('generates recommendations', () => {
    const result = buildSymphonyHallResult(['a.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('generates positive recommendation for good code', () => {
    const result = buildSymphonyHallResult(['a.ts'], [RICH])
    expect(result.recommendations).toContain('Symphony is well-orchestrated — maintain current coordination and quality standards')
  })
})

// ─── Format Helper Tests ───────────────────────────────────────────────────

describe('format helpers', () => {
  const result = buildSymphonyHallResult(['a.ts'], [RICH])

  it('formatSymphonyHallJson returns valid JSON', () => {
    const json = formatSymphonyHallJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatSymphonyHallTable returns non-empty string', () => {
    const table = formatSymphonyHallTable(result, false)
    expect(table).toContain('Symphony Hall Analysis')
    expect(table).toContain('Overall Symphony')
  })

  it('formatSymphonyHallTable with verbose shows per-movement', () => {
    const table = formatSymphonyHallTable(result, true)
    expect(table).toContain('a.ts')
    expect(table).toContain('Per-Movement Breakdown')
  })

  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    for (const c of ['standing-ovation', 'bravo', 'applause', 'polite-clapping', 'silence', 'booing', 'unknown']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('gradeColor returns string for all grades', () => {
    for (const g of ['maestro', 'principal-conductor', 'conductor', 'assistant-conductor', 'rehearsal-pianist', 'metronome', 'unknown']) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })

  it('venueColor returns string for all venues', () => {
    for (const v of ['carnegie-hall', 'royal-albert', 'concertgebouw', 'local-hall', 'school-gym', 'street-corner', 'unknown']) {
      expect(typeof venueColor(v)).toBe('string')
    }
  })
})
