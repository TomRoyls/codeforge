import { describe, expect, it } from 'vitest'

import {
  analyzeSundialGarden,
  analyzeSundialMark,
  buildSundialFaceResult,
  classifyChronometerGrade,
  classifyGardenCondition,
  classifyGardenType,
  classifyMarkCondition,
  countAsync,
  countAwait,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDefaults,
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
  countReturnTypes,
  countTodos,
  countTypeAnnotations,
  countTypes,
  generateRecommendations,
  measureDial,
  measureGnomon,
  measureHour,
  measureSeason,
  measureShadow,
  measureWeathering,
  type SundialMark,
  type SundialFaceStats,
} from '../src/commands/sundial-face-helpers.js'
import { formatSundialFaceCsv, formatSundialFaceJson, formatSundialFaceTable } from '../src/commands/sundial-face-format-helpers.js'

// ─── Utility Helpers ────────────────────────────────────

describe('sundial-face utility helpers', () => {
  it('counts lines of code', () => {
    expect(countLoc('const x = 1\n\nconst y = 2')).toBe(2)
    expect(countLoc('')).toBe(0)
  })

  it('counts functions', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
    expect(countFunctions('const f = () => {}')).toBe(1)
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
    expect(countExports('function f() {}')).toBe(0)
  })

  it('counts imports', () => {
    expect(countImports("import { x } from 'y'")).toBe(1)
    expect(countImports('')).toBe(0)
  })

  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
    expect(countJSDoc('')).toBe(0)
  })

  it('counts error handling', () => {
    expect(countErrorHandling('try {} catch (e) {}')).toBe(1)
    expect(countErrorHandling('')).toBe(0)
  })

  it('counts type annotations', () => {
    expect(countTypeAnnotations('x: number')).toBe(1)
    expect(countTypeAnnotations('')).toBe(0)
  })

  it('counts TODOs', () => {
    expect(countTodos('// TODO: fix')).toBe(1)
    expect(countTodos('')).toBe(0)
  })

  it('counts console calls', () => {
    expect(countConsole('console.log("hi")')).toBe(1)
    expect(countConsole('')).toBe(0)
  })

  it('counts branches', () => {
    expect(countBranches('if (x) {}')).toBe(1)
    expect(countBranches('x ? 1 : 2')).toBe(1)
    expect(countBranches('')).toBe(0)
  })

  it('counts return types', () => {
    expect(countReturnTypes('): number')).toBe(1)
    expect(countReturnTypes('')).toBe(0)
  })

  it('counts enums', () => {
    expect(countEnums('enum Color { Red }')).toBe(1)
    expect(countEnums('')).toBe(0)
  })

  it('counts type aliases', () => {
    expect(countTypes('type Id = string')).toBe(1)
    expect(countTypes('')).toBe(0)
  })

  it('counts defaults', () => {
    expect(countDefaults('export default class {}')).toBe(1)
    expect(countDefaults('')).toBe(0)
  })

  it('counts deprecated', () => {
    expect(countDeprecated('@deprecated')).toBe(1)
    expect(countDeprecated('')).toBe(0)
  })

  it('counts async', () => {
    expect(countAsync('async function f() {}')).toBe(1)
    expect(countAsync('')).toBe(0)
  })

  it('counts await', () => {
    expect(countAwait('await promise')).toBe(1)
    expect(countAwait('')).toBe(0)
  })

  it('counts generics', () => {
    expect(countGenerics('function f<T>() {}')).toBe(1)
    expect(countGenerics('')).toBe(0)
  })

  it('counts descriptive names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
    expect(countDescriptiveNames('')).toBe(0)
  })

  it('counts comments', () => {
    expect(countComments('// comment')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments('')).toBe(0)
  })
})

// ─── Gnomon Measurement ─────────────────────────────────

describe('sundial-face measureGnomon', () => {
  it('returns zeros for empty content', () => {
    const g = measureGnomon('')
    expect(g.accuracy).toBe(0)
    expect(g.isMisaligned).toBe(false)
    expect(g.hasShadow).toBe(false)
    expect(g.style).toBe('broken')
  })

  it('detects polar style with types and return types', () => {
    const code = [
      '/** Validates data */',
      'export function validateData(x: number): number {',
      '  return x',
      '}',
    ].join('\n')
    const g = measureGnomon(code)
    expect(g.accuracy).toBeGreaterThanOrEqual(70)
    expect(g.hasSharpEdge).toBe(true)
    expect(g.isAligned).toBe(true)
    expect(g.style).toBe('polar')
  })

  it('detects misaligned code without docs or types', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const g = measureGnomon(code)
    expect(g.isMisaligned).toBe(true)
    expect(g.hasBluntEdge).toBe(false)
  })

  it('detects horizontal style', () => {
    const code = '/** doc */\nfunction processData(x: number) { return x }'
    const g = measureGnomon(code)
    expect(g.hasShadow).toBe(true)
    expect(g.style).not.toBe('broken')
  })

  it('computes shadow length from exports and imports', () => {
    const code = "import { x } from 'y'\nimport { z } from 'w'\nexport function f() {}"
    const g = measureGnomon(code)
    expect(g.shadowLength).toBeGreaterThan(0)
  })
})

// ─── Dial Measurement ───────────────────────────────────

describe('sundial-face measureDial', () => {
  it('returns zeros for empty content', () => {
    const d = measureDial('')
    expect(d.calibration).toBe(0)
    expect(d.markCount).toBe(0)
  })

  it('detects hour marks from functions', () => {
    const d = measureDial('function f() {}')
    expect(d.hasHourMarks).toBe(true)
  })

  it('detects minute marks from types and functions', () => {
    const d = measureDial('function f(x: number) { return x }')
    expect(d.hasMinuteMarks).toBe(true)
  })

  it('detects season marks from enums and types', () => {
    const d = measureDial('enum Status { Active }\ntype Id = string')
    expect(d.hasSeasonMarks).toBe(true)
  })

  it('detects compass rose from imports and exports', () => {
    const code = "import { x } from 'y'\nexport function f() {}"
    const d = measureDial(code)
    expect(d.hasCompassRose).toBe(true)
  })

  it('detects Roman numerals from JSDoc and exports', () => {
    const code = '/** doc */\nexport function f() {}'
    const d = measureDial(code)
    expect(d.hasRomanNumerals).toBe(true)
  })

  it('is properly calibrated with good code', () => {
    const code = [
      '/** Config */',
      'interface Config { value: number }',
      '/** Process */',
      'export function process(c: Config): number { return c.value }',
    ].join('\n')
    const d = measureDial(code)
    expect(d.isProperlyCalibrated).toBe(true)
  })

  it('counts marks correctly', () => {
    const code = 'function f() {}\nfunction g() {}\nclass C {}\ninterface I {}'
    const d = measureDial(code)
    expect(d.markCount).toBe(4)
  })
})

// ─── Shadow Measurement ─────────────────────────────────

describe('sundial-face measureShadow', () => {
  it('returns zeros for empty content', () => {
    const s = measureShadow('')
    expect(s.tracking).toBe(0)
    expect(s.hasNoShadow).toBe(false)
  })

  it('detects consistent shadow with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const s = measureShadow(code)
    expect(s.hasConsistentShadow).toBe(true)
  })

  it('detects no shadow without exports or imports', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const s = measureShadow(code)
    expect(s.hasNoShadow).toBe(true)
  })

  it('detects long shadow from many exports', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
    ].join('\n')
    const s = measureShadow(code)
    expect(s.hasLongShadow).toBe(true)
  })

  it('detects short shadow with few exports', () => {
    const code = 'export function f() {}'
    const s = measureShadow(code)
    expect(s.hasShortShadow).toBe(true)
  })

  it('is controllable with good tracking', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }\ninterface Config {}'
    const s = measureShadow(code)
    expect(s.isControllable).toBe(true)
  })
})

// ─── Hour Measurement ───────────────────────────────────

describe('sundial-face measureHour', () => {
  it('handles empty content', () => {
    const h = measureHour('')
    expect(h.morning.lineCount + h.afternoon.lineCount).toBeGreaterThanOrEqual(0)
  })

  it('detects golden hour with well-lit morning', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }\nconst y = 2'
    const h = measureHour(code)
    expect(h.hasGoldenHour).toBe(true)
  })

  it('detects blue hour with entry and cleanup', () => {
    const code = "import { x } from 'y'\nfunction f() { return x }"
    const h = measureHour(code)
    expect(h.hasBlueHour).toBe(true)
  })

  it('detects midnight with async code', () => {
    const code = 'async function load() { await fetch("/") }'
    const h = measureHour(code)
    expect(h.hasMidnight).toBe(true)
  })

  it('identifies peak and quiet hours', () => {
    const code = 'const x = 1\nconst y = 2\nif (x) {}\nif (y) {}\nif (x && y) {}'
    const h = measureHour(code)
    expect(['morning', 'afternoon']).toContain(h.peakHour)
    expect(['morning', 'afternoon']).toContain(h.quietHour)
  })
})

// ─── Weathering Measurement ─────────────────────────────

describe('sundial-face measureWeathering', () => {
  it('returns zeros for empty content', () => {
    const w = measureWeathering('')
    expect(w.resistance).toBe(0)
    expect(w.patinaScore).toBe(0)
    expect(w.erosionScore).toBe(0)
  })

  it('detects polished code', () => {
    const code = '/** doc */\nexport function f(x: number): number {\n  try { return x } catch (e) { return 0 }\n}\ninterface Config {}'
    const w = measureWeathering(code)
    expect(w.isPolished).toBe(true)
    expect(w.resistance).toBeGreaterThanOrEqual(70)
  })

  it('detects erosion from TODOs and deprecation', () => {
    const code = '@deprecated\n// TODO fix\n// TODO fix\n// TODO fix\nfunction f() {}'
    const w = measureWeathering(code)
    expect(w.isErosion).toBe(true)
    expect(w.isCracked).toBe(true)
  })

  it('detects patina from good docs and types', () => {
    const code = '/** Well documented */\nfunction processValueData(x: number): number {\n  try { return x } catch (e) { return 0 }\n}'
    const w = measureWeathering(code)
    expect(w.isPatina).toBe(true)
  })

  it('detects moss from excessive console', () => {
    const code = 'console.log("a")\nconsole.log("b")\nconsole.log("c")\nconsole.log("d")'
    const w = measureWeathering(code)
    expect(w.isMossCovered).toBe(true)
  })

  it('detects lichen from small TODOs', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }\n// TODO: minor'
    const w = measureWeathering(code)
    expect(w.hasLichen).toBe(true)
  })
})

// ─── Season Measurement ─────────────────────────────────

describe('sundial-face measureSeason', () => {
  it('returns unknown for empty content', () => {
    const s = measureSeason('')
    expect(s.currentSeason).toBe('unknown')
  })

  it('detects spring (growing)', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const s = measureSeason(code)
    expect(s.isGrowing).toBe(true)
    expect(['spring', 'perpetual']).toContain(s.currentSeason)
  })

  it('detects summer (dormant)', () => {
    const code = 'export function f() { return 1 }'
    const s = measureSeason(code)
    expect(s.isDormant).toBe(true)
  })

  it('detects autumn (decaying)', () => {
    const code = '// TODO: fix\n// TODO: fix\n// TODO: fix\nfunction f() {}'
    const s = measureSeason(code)
    expect(s.isDecaying).toBe(true)
    expect(s.currentSeason).toBe('autumn')
  })

  it('detects winter (renewing)', () => {
    const code = '/** doc */\nfunction f(x: number): number { return x }\n// TODO: fix'
    const s = measureSeason(code)
    expect(s.isRenewing).toBe(true)
  })

  it('detects perpetual with full features', () => {
    const code = [
      '/** Full featured */',
      'interface Config { value: number }',
      '/** Process */',
      'export function process(c: Config): number { return c.value }',
    ].join('\n')
    const s = measureSeason(code)
    expect(s.currentSeason).toBe('perpetual')
  })

  it('detects equinox with moderate complexity', () => {
    const code = 'function f() {}\nfunction g() {}\nfunction h() {}\nif (x) {}'
    const s = measureSeason(code)
    expect(s.hasEquinox).toBe(true)
  })
})

// ─── Mark Analysis ──────────────────────────────────────

describe('sundial-face analyzeSundialMark', () => {
  it('analyzes a well-crafted file', () => {
    const code = [
      '/** Validates input */',
      'export interface Config { value: number }',
      '/** Process config */',
      'export function processConfig(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const mark = analyzeSundialMark(code, 'src/config.ts')
    expect(mark.qualityScore).toBeGreaterThanOrEqual(50)
    expect(mark.gnomonAccuracy).toBeGreaterThan(0)
    expect(mark.file).toBe('src/config.ts')
  })

  it('sets all sub-measures', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const mark = analyzeSundialMark(code, 'test.ts')
    expect(typeof mark.gnomon.accuracy).toBe('number')
    expect(typeof mark.dial.calibration).toBe('number')
    expect(typeof mark.shadow.tracking).toBe('number')
    expect(typeof mark.weathering.resistance).toBe('number')
    expect(typeof mark.season.currentSeason).toBe('string')
    expect(typeof mark.hour.peakHour).toBe('string')
  })

  it('analyzes poorly written file', () => {
    const code = 'const a = 1\nconst b = 2\nconst c = 3'
    const mark = analyzeSundialMark(code, 'bad.ts')
    expect(mark.qualityScore).toBeLessThan(50)
  })
})

// ─── Classification ─────────────────────────────────────

describe('sundial-face classifyMarkCondition', () => {
  it('classifies precision-sundial', () => {
    const gnomon = { style: 'polar' as const, accuracy: 85, isAligned: true, isMisaligned: false, hasShadow: true, shadowLength: 50, hasSharpEdge: true, hasBluntEdge: false }
    const weathering = { resistance: 80, isPatina: true, isErosion: false, isCracked: false, isMossCovered: false, isPolished: true, hasLichen: false, patinaScore: 70, erosionScore: 5 }
    expect(classifyMarkCondition(85, gnomon, weathering)).toBe('precision-sundial')
  })

  it('classifies garden-sundial', () => {
    const gnomon = { style: 'horizontal' as const, accuracy: 65, isAligned: true, isMisaligned: false, hasShadow: true, shadowLength: 40, hasSharpEdge: false, hasBluntEdge: false }
    const weathering = { resistance: 50, isPatina: false, isErosion: false, isCracked: false, isMossCovered: false, isPolished: false, hasLichen: false, patinaScore: 40, erosionScore: 20 }
    expect(classifyMarkCondition(65, gnomon, weathering)).toBe('garden-sundial')
  })

  it('classifies broken-stick for very low score', () => {
    const gnomon = { style: 'broken' as const, accuracy: 5, isAligned: false, isMisaligned: true, hasShadow: false, shadowLength: 0, hasSharpEdge: false, hasBluntEdge: false }
    const weathering = { resistance: 5, isPatina: false, isErosion: true, isCracked: true, isMossCovered: false, isPolished: false, hasLichen: false, patinaScore: 5, erosionScore: 50 }
    expect(classifyMarkCondition(5, gnomon, weathering)).toBe('broken-stick')
  })
})

// ─── Garden Analysis ────────────────────────────────────

describe('sundial-face analyzeSundialGarden', () => {
  it('handles empty marks', () => {
    const g = analyzeSundialGarden([], 'src/')
    expect(g.gardenType).toBe('abandoned')
    expect(g.condition).toBe('wilderness')
  })

  it('computes averages', () => {
    const marks = [
      analyzeSundialMark('/** doc */\nexport function f(x: number): number { return x }', 'a.ts'),
      analyzeSundialMark('/** doc */\nexport function g(y: string): string { return y }', 'b.ts'),
    ]
    const g = analyzeSundialGarden(marks, 'src/')
    expect(g.marks.length).toBe(2)
    expect(g.avgGnomonAccuracy).toBeGreaterThan(0)
  })
})

// ─── Garden Classification ──────────────────────────────

describe('sundial-face garden classification', () => {
  it('classifies chronometer-garden', () => {
    expect(classifyGardenCondition(80)).toBe('chronometer-garden')
  })
  it('classifies sundial-garden', () => {
    expect(classifyGardenCondition(65)).toBe('sundial-garden')
  })
  it('classifies time-garden', () => {
    expect(classifyGardenCondition(50)).toBe('time-garden')
  })
  it('classifies clock-garden', () => {
    expect(classifyGardenCondition(35)).toBe('clock-garden')
  })
  it('classifies ruin-garden', () => {
    expect(classifyGardenCondition(20)).toBe('ruin-garden')
  })
  it('classifies wilderness', () => {
    expect(classifyGardenCondition(10)).toBe('wilderness')
  })

  it('classifies observatory-garden type', () => {
    const good = analyzeSundialMark('/** doc */\nexport interface I {}\nexport function validateData(x: number): number {\n  try { return x } catch (e) { return 0 }\n}\nexport class Service {}', 'a.ts')
    expect(classifyGardenType([good, good], 80)).toBe('observatory-garden')
  })

  it('classifies abandoned for empty', () => {
    expect(classifyGardenType([], 0)).toBe('abandoned')
  })
})

// ─── Chronometer Grade ──────────────────────────────────

describe('sundial-face classifyChronometerGrade', () => {
  it('returns master-chronometer for high precision', () => {
    expect(classifyChronometerGrade(90)).toBe('master-chronometer')
  })
  it('returns chronometer', () => {
    expect(classifyChronometerGrade(70)).toBe('chronometer')
  })
  it('returns horologist', () => {
    expect(classifyChronometerGrade(55)).toBe('horologist')
  })
  it('returns timekeeper', () => {
    expect(classifyChronometerGrade(40)).toBe('timekeeper')
  })
  it('returns novice', () => {
    expect(classifyChronometerGrade(25)).toBe('novice')
  })
  it('returns time-blind', () => {
    expect(classifyChronometerGrade(10)).toBe('time-blind')
  })
})

// ─── Recommendations ────────────────────────────────────

describe('sundial-face generateRecommendations', () => {
  it('generates recommendations for poor code', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = buildSundialFaceResult(['a.ts'], [code])
    const recs = generateRecommendations(result.marks, result.gardens, result.observatory, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message for good code', () => {
    const code = [
      '/** doc */',
      'export interface Config { value: number }',
      '/** Process */',
      'export function processConfig(c: Config): number {',
      '  try { return c.value } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const result = buildSundialFaceResult(['a.ts'], [code])
    const recs = generateRecommendations(result.marks, result.gardens, result.observatory, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── Orchestrator ───────────────────────────────────────

describe('sundial-face buildSundialFaceResult', () => {
  it('handles empty input', () => {
    const result = buildSundialFaceResult([], [])
    expect(result.marks.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.chronometerGrade).toBe('time-blind')
    expect(result.observatory.overallPrecision).toBe(0)
  })

  it('builds full result for multiple files', () => {
    const code1 = '/** doc */\nexport function f(x: number): number { return x }'
    const code2 = '/** doc */\ninterface Config { value: number }\nexport function process(c: Config): number { return c.value }'
    const result = buildSundialFaceResult(
      ['src/a.ts', 'src/b.ts'],
      [code1, code2],
    )
    expect(result.marks.length).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.observatory.avgGnomonAccuracy).toBeGreaterThan(0)
    expect(result.stats.mostAccurate).toBeTruthy()
    expect(result.stats.bestCalibrated).toBeTruthy()
    expect(result.stats.mostRobust).toBeTruthy()
    expect(result.stats.mostWeathered).toBeTruthy()
    expect(result.stats.mostPredictable).toBeTruthy()
  })

  it('groups marks into gardens by directory', () => {
    const code = '/** doc */\nexport function f(): number { return 1 }'
    const result = buildSundialFaceResult(
      ['src/commands/a.ts', 'src/core/b.ts'],
      [code, code],
    )
    expect(result.gardens.length).toBe(2)
    expect(result.gardens.some(g => g.directory === 'src/commands')).toBe(true)
    expect(result.gardens.some(g => g.directory === 'src/core')).toBe(true)
  })

  it('computes all stat counters', () => {
    const code = '/** doc */\nexport function f(x: number): number { return x }'
    const result = buildSundialFaceResult(['a.ts'], [code])
    const stats: SundialFaceStats = result.stats
    expect(typeof stats.precisionSundialCount).toBe('number')
    expect(typeof stats.gardenSundialCount).toBe('number')
    expect(typeof stats.rusticDialCount).toBe('number')
    expect(typeof stats.weatheredStoneCount).toBe('number')
    expect(typeof stats.crackedDialCount).toBe('number')
    expect(typeof stats.brokenStickCount).toBe('number')
    expect(typeof stats.polarStyleCount).toBe('number')
    expect(typeof stats.horizontalStyleCount).toBe('number')
    expect(typeof stats.brokenStyleCount).toBe('number')
    expect(typeof stats.isAlignedCount).toBe('number')
    expect(typeof stats.hasGoldenHourCount).toBe('number')
    expect(typeof stats.hasHighNoonCount).toBe('number')
    expect(typeof stats.hasMidnightCount).toBe('number')
    expect(typeof stats.consistentShadowCount).toBe('number')
    expect(typeof stats.isPatinaCount).toBe('number')
    expect(typeof stats.isErosionCount).toBe('number')
    expect(typeof stats.isPolishedCount).toBe('number')
    expect(typeof stats.growingCount).toBe('number')
    expect(typeof stats.dormantCount).toBe('number')
    expect(typeof stats.decayingCount).toBe('number')
    expect(typeof stats.renewingCount).toBe('number')
    expect(typeof stats.perpetualCount).toBe('number')
  })
})

// ─── Format Helpers ─────────────────────────────────────

describe('sundial-face format helpers', () => {
  const code = '/** doc */\nexport function f(x: number): number { return x }'
  const result = buildSundialFaceResult(['a.ts'], [code])

  it('formats as JSON string', () => {
    const json = formatSundialFaceJson(result)
    expect(json).toContain('"marks"')
    expect(json).toContain('"stats"')
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formats as table', () => {
    const table = formatSundialFaceTable(result, false)
    expect(table).toContain('Sundial Face Report')
    expect(table).toContain('Chronometer Grade')
  })

  it('formats as table with verbose marks', () => {
    const table = formatSundialFaceTable(result, true)
    expect(table).toContain('Mark Details')
    expect(table).toContain('a.ts')
  })

  it('formats as CSV', () => {
    const csv = formatSundialFaceCsv(result)
    expect(csv).toContain('File,GnomonAccuracy')
    expect(csv).toContain('a.ts')
  })
})
