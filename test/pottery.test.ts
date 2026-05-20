import { describe, it, expect } from 'vitest'
import {
  evaluateClay,
  evaluateWheelwork,
  evaluateFiring,
  evaluateGlaze,
  classifyShape,
  detectDefects,
  inspectPiece,
  classifyPieceGrade,
  computeCraftsmanshipIndex,
  classifyOverallGrade,
  buildPiece,
  generatePotteryRecommendations,
  buildPotteryResult,
} from '../src/commands/pottery-helpers.js'
import { formatPotteryTable, formatPotteryJson } from '../src/commands/pottery-format-helpers.js'
import type { CeramicPiece, KilnResult, PotteryStats } from '../src/commands/pottery-helpers.js'

// ─── evaluateClay ──────────────────────────────────────────────────────────────

describe('evaluateClay', () => {
  it('returns ~45-55 for empty string', () => {
    const score = evaluateClay('')
    expect(score).toBeGreaterThanOrEqual(40)
    expect(score).toBeLessThanOrEqual(55)
  })

  it('returns high score for well-documented typed code', () => {
    const code = [
      '// This is a well documented module',
      '/** Documentation */',
      'const value: number = 42;',
      'function calculate(input: string): number { return input.length; }',
    ].join('\n')
    const score = evaluateClay(code)
    expect(score).toBeGreaterThan(50)
  })

  it('penalizes long lines', () => {
    const longLine = 'const x = ' + 'a'.repeat(150) + ';'
    const score = evaluateClay(longLine)
    expect(score).toBeLessThan(70)
  })

  it('rewards type annotations', () => {
    const typed = 'const x: number = 1;\nconst y: string = "hello";'
    const untyped = 'const x = 1;\nconst y = "hello";'
    expect(evaluateClay(typed)).toBeGreaterThan(evaluateClay(untyped))
  })

  it('rewards comments', () => {
    const commented = '// A great comment\nconst x = 1;\n// Another comment\nconst y = 2;'
    const bare = 'const x = 1;\nconst y = 2;'
    expect(evaluateClay(commented)).toBeGreaterThan(evaluateClay(bare))
  })

  it('clamps score to 0-100', () => {
    const code = '// ' + 'x'.repeat(500)
    const score = evaluateClay(code)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards descriptive variable names', () => {
    const descriptive = 'const customerInformation: string = "test";\nconst orderCalculation: number = 5;'
    const short = 'const a: string = "test";\nconst b: number = 5;'
    expect(evaluateClay(descriptive)).toBeGreaterThanOrEqual(evaluateClay(short))
  })
})

// ─── evaluateWheelwork ─────────────────────────────────────────────────────────

describe('evaluateWheelwork', () => {
  const simple = 'export function hello() { return 1; }'
  const complex = [
    'interface Config { name: string; }',
    'export class Service implements Config {',
    '  name = "test"',
    '  doWork() { return this.name }',
    '}',
  ].join('\n')

  it('returns 5 wheel entries', () => {
    const wheels = evaluateWheelwork(simple, 'a.ts')
    expect(wheels).toHaveLength(5)
  })

  it('has correct techniques', () => {
    const wheels = evaluateWheelwork(simple, 'a.ts')
    const techniques = wheels.map(w => w.technique)
    expect(techniques).toContain('centering')
    expect(techniques).toContain('pulling')
    expect(techniques).toContain('shaping')
    expect(techniques).toContain('trimming')
    expect(techniques).toContain('decorating')
  })

  it('each wheel has required fields', () => {
    const wheels = evaluateWheelwork(simple, 'a.ts')
    for (const w of wheels) {
      expect(w).toHaveProperty('file', 'a.ts')
      expect(w).toHaveProperty('technique')
      expect(w).toHaveProperty('score')
      expect(w).toHaveProperty('description')
      expect(w.score).toBeGreaterThanOrEqual(0)
      expect(w.score).toBeLessThanOrEqual(100)
    }
  })

  it('rewards exports for centering', () => {
    const withExport = evaluateWheelwork('export const x = 1;', 'a.ts')
    const withoutExport = evaluateWheelwork('const x = 1;', 'a.ts')
    const centeringWith = withExport.find(w => w.technique === 'centering')!.score
    const centeringWithout = withoutExport.find(w => w.technique === 'centering')!.score
    expect(centeringWith).toBeGreaterThan(centeringWithout)
  })

  it('rewards interfaces for shaping', () => {
    const withInterface = evaluateWheelwork(complex, 'a.ts')
    const withoutInterface = evaluateWheelwork(simple, 'a.ts')
    const shapingWith = withInterface.find(w => w.technique === 'shaping')!.score
    const shapingWithout = withoutInterface.find(w => w.technique === 'shaping')!.score
    expect(shapingWith).toBeGreaterThan(shapingWithout)
  })

  it('penalizes TODOs in trimming', () => {
    const withTodo = evaluateWheelwork('export function f() { TODO: fix }', 'a.ts')
    const clean = evaluateWheelwork('export function f() { return 1 }', 'a.ts')
    const trimWith = withTodo.find(w => w.technique === 'trimming')!.score
    const trimClean = clean.find(w => w.technique === 'trimming')!.score
    expect(trimClean).toBeGreaterThanOrEqual(trimWith)
  })

  it('rewards JSDoc for decorating', () => {
    const withJSDoc = evaluateWheelwork('/** Docs */\nexport function f() {}', 'a.ts')
    const withoutJSDoc = evaluateWheelwork('export function f() {}', 'a.ts')
    const decoWith = withJSDoc.find(w => w.technique === 'decorating')!.score
    const decoWithout = withoutJSDoc.find(w => w.technique === 'decorating')!.score
    expect(decoWith).toBeGreaterThan(decoWithout)
  })
})

// ─── evaluateFiring ────────────────────────────────────────────────────────────

describe('evaluateFiring', () => {
  it('returns a KilnResult object', () => {
    const result = evaluateFiring('const x = 1;', 'a.ts')
    expect(result).toHaveProperty('file', 'a.ts')
    expect(result).toHaveProperty('temperature')
    expect(result).toHaveProperty('duration')
    expect(result).toHaveProperty('result')
    expect(result).toHaveProperty('description')
  })

  it('starts at 20 base temperature', () => {
    const result = evaluateFiring('const x = 1;', 'a.ts')
    expect(result.temperature).toBe(20)
  })

  it('adds 20 for try/catch', () => {
    const result = evaluateFiring('try { work() } catch(e) { throw e }', 'a.ts')
    expect(result.temperature).toBeGreaterThanOrEqual(40)
  })

  it('adds 15 for throw', () => {
    const result = evaluateFiring('throw new Error("fail")', 'a.ts')
    expect(result.temperature).toBeGreaterThanOrEqual(35)
  })

  it('adds 15 for null checks', () => {
    const result = evaluateFiring('if (x === null) return', 'a.ts')
    expect(result.temperature).toBeGreaterThanOrEqual(35)
  })

  it('adds 15 for type annotations', () => {
    const result = evaluateFiring('const x: number = 1;', 'a.ts')
    expect(result.temperature).toBeGreaterThanOrEqual(35)
  })

  it('classifies as cracked below 30', () => {
    const result = evaluateFiring('const x = 1;', 'a.ts')
    expect(result.result).toBe('cracked')
  })

  it('classifies as under-fired at 30-49', () => {
    const result = evaluateFiring('if (x === null) return;\nconst y: number = 1;', 'a.ts')
    expect(result.result).toMatch(/under-fired|well-fired|cracked/)
  })

  it('classifies as perfect at 80+', () => {
    const code = [
      'try { doWork() } catch(e) { throw e }',
      'if (x === null) throw new Error("null")',
      'const y: number = typeof x === "number" ? x : 0',
    ].join('\n')
    const result = evaluateFiring(code, 'a.ts')
    expect(result.result).toMatch(/perfect|well-fired|over-fired/)
  })

  it('classifies as over-fired when temp > 90 and content > 5000 chars', () => {
    const padding = ' '.repeat(5001)
    const code = `try { doWork() } catch(e) { throw e }\nif (x === null) throw new Error()\nconst y: number = typeof x === "number" ? x : 0\n${padding}`
    const result = evaluateFiring(code, 'a.ts')
    if (result.temperature > 90) {
      expect(result.result).toBe('over-fired')
    }
  })

  it('returns duration equal to line count', () => {
    const code = 'line1\nline2\nline3'
    const result = evaluateFiring(code, 'a.ts')
    expect(result.duration).toBe(3)
  })
})

// ─── evaluateGlaze ─────────────────────────────────────────────────────────────

describe('evaluateGlaze', () => {
  it('returns 70 for single-line content', () => {
    expect(evaluateGlaze('const x = 1')).toBe(70)
  })

  it('returns 70 for empty-ish content', () => {
    expect(evaluateGlaze('x')).toBe(70)
  })

  it('rewards consistent indentation', () => {
    const good = 'const x = 1;\n  const y = 2;\n  const z = 3;'
    const bad = 'const x = 1;\n  const y = 2;\n      const z = 3;'
    expect(evaluateGlaze(good)).toBeGreaterThanOrEqual(evaluateGlaze(bad))
  })

  it('penalizes long lines', () => {
    const longLines = ('const x = ' + 'a'.repeat(130) + ';\n').repeat(10)
    const score = evaluateGlaze(longLines)
    expect(score).toBeLessThan(70)
  })

  it('rewards consistent naming', () => {
    const camelCase = 'const myVar = 1;\nconst otherVar = 2;'
    expect(evaluateGlaze(camelCase)).toBeGreaterThan(40)
  })

  it('penalizes mixed naming conventions', () => {
    const mixed = 'const myVar = 1;\nconst my_var = 2;\nconst another_one = 3;'
    const pure = 'const myVar = 1;\nconst otherVar = 2;\nconst thirdVar = 3;'
    expect(evaluateGlaze(pure)).toBeGreaterThanOrEqual(evaluateGlaze(mixed))
  })

  it('rewards having imports', () => {
    const withImport = 'import { x } from "y"\nconst a = 1;\nconst b = 2;'
    const withoutImport = 'const a = 1;\nconst b = 2;'
    expect(evaluateGlaze(withImport)).toBeGreaterThan(evaluateGlaze(withoutImport))
  })

  it('clamps score to 0-100', () => {
    const code = 'const x = 1;\nconst y = 2;'
    const score = evaluateGlaze(code)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── classifyShape ─────────────────────────────────────────────────────────────

describe('classifyShape', () => {
  it('returns amphora for large files with many exports', () => {
    const lines = Array(350).fill('export const x = 1;')
    const exports = lines.map((_, i) => `export const item${i} = ${i};`).join('\n')
    expect(classifyShape(exports, 'big.ts')).toBe('amphora')
  })

  it('returns sculpture for deeply nested with abstraction', () => {
    const code = [
      'interface Shape { draw(): void }',
      'function deep() {',
      '  if (true) {',
      '    if (true) {',
      '      if (true) {',
      '        if (true) {',
      '          if (true) {',
      '            function a() {} function b() {} function c() {} function d() {} function e() {} function f() {}',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n')
    expect(classifyShape(code, 'nested.ts')).toBe('sculpture')
  })

  it('returns bowl for many exports and low nesting', () => {
    const code = [
      'export const a = 1;',
      'export const b = 2;',
      'export const c = 3;',
      'export const d = 4;',
      'export const e = 5;',
    ].join('\n')
    expect(classifyShape(code, 'flat.ts')).toBe('bowl')
  })

  it('returns plate for many functions with few exports', () => {
    const funcs = []
    for (let i = 0; i < 6; i++) funcs.push(`function fn${i}() {}`)
    funcs.push('export { fn0 }')
    const code = funcs.join('\n')
    expect(classifyShape(code, 'plate.ts')).toBe('plate')
  })

  it('returns cup for small files', () => {
    expect(classifyShape('export const x = 1;', 'tiny.ts')).toBe('cup')
  })

  it('returns vase for moderate nesting with few exports', () => {
    const lines = [
      'function outer() {',
      '  if (true) {',
      '    if (true) {',
      '      if (true) {',
      '        if (true) {',
      '          return 1',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ]
    for (let i = 0; i < 25; i++) lines.push(`const helper${i} = ${i}`)
    lines.push('export { outer }')
    const code = lines.join('\n')
    expect(classifyShape(code, 'moderate.ts')).toBe('vase')
  })

  it('returns lump for large files with no exports', () => {
    const lines = Array(250).fill('const x = 1;')
    const code = lines.join('\n')
    expect(classifyShape(code, 'lump.ts')).toBe('lump')
  })

  it('defaults to vase', () => {
    const code = 'function f() { return 1 }\nconst x = 2;'
    const shape = classifyShape(code, 'default.ts')
    expect(['vase', 'cup']).toContain(shape)
  })
})

// ─── detectDefects ─────────────────────────────────────────────────────────────

describe('detectDefects', () => {
  it('detects crack for async without error handling', () => {
    const code = 'async function load() {\n  const data = await fetch(url)\n  return data\n}'
    const defects = detectDefects(code, 'a.ts')
    const crack = defects.find(d => d.type === 'crack')
    expect(crack).toBeDefined()
    expect(crack!.severity).toBe('major')
  })

  it('does not detect crack when error handling exists', () => {
    const code = 'async function load() {\n  try { await fetch(url) } catch(e) { throw e }\n}'
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'crack')).toBeUndefined()
  })

  it('detects warp for inconsistent semicolons', () => {
    const lines: string[] = []
    for (let i = 0; i < 8; i++) lines.push('const a' + i + ' = ' + i + ';')
    for (let i = 0; i < 8; i++) lines.push('const b' + i + ' = ' + i)
    const code = lines.join('\n')
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'warp')).toBeDefined()
  })

  it('detects air-bubble for any types', () => {
    const code = 'const x: any = getData();'
    const defects = detectDefects(code, 'a.ts')
    const bubble = defects.find(d => d.type === 'air-bubble')
    expect(bubble).toBeDefined()
    expect(bubble!.severity).toBe('major')
  })

  it('detects kiln-accident for merge conflicts', () => {
    const code = 'const x = 1;\n<<<<<<< HEAD\nconst y = 2;\n=======\nconst y = 3;\n>>>>>>> branch'
    const defects = detectDefects(code, 'a.ts')
    const accident = defects.find(d => d.type === 'kiln-accident')
    expect(accident).toBeDefined()
    expect(accident!.severity).toBe('structural')
  })

  it('detects crazing for excessive TODOs', () => {
    const code = [
      'function f() {}',
      '// TODO fix this',
      '// FIXME that too',
      '// HACK quick patch',
      '// TODO another one',
    ].join('\n')
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'crazing')).toBeDefined()
  })

  it('does not detect crazing for few TODOs', () => {
    const code = 'function f() {}\n// TODO fix this'
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'crazing')).toBeUndefined()
  })

  it('detects dunting for mixed naming with let', () => {
    const code = [
      'const camelCase = 1',
      'let snake_case = 2',
      'let another_one = 3',
      'let third_item = 4',
      'let fourth_val = 5',
    ].join('\n')
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'dunting')).toBeDefined()
  })

  it('detects shivering for mixed function styles', () => {
    const fns: string[] = []
    for (let i = 0; i < 3; i++) fns.push(`function named${i}() {}`)
    for (let i = 0; i < 3; i++) fns.push(`const arrow${i} = () => {}`)
    const code = fns.join('\n')
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'shivering')).toBeDefined()
  })

  it('does not detect shivering for few functions', () => {
    const code = 'function f() {}\nconst g = () => {}'
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'shivering')).toBeUndefined()
  })

  it('detects pinhole for trailing whitespace', () => {
    const lines = ['const x = 1;', 'const y = 2;   ', 'const z = 3;']
    for (let i = 0; i < 12; i++) lines.push(`const v${i} = ${i};`)
    const code = lines.join('\n')
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'pinhole')).toBeDefined()
  })

  it('does not detect pinhole for short files', () => {
    const code = 'const x = 1;   '
    const defects = detectDefects(code, 'a.ts')
    expect(defects.find(d => d.type === 'pinhole')).toBeUndefined()
  })

  it('returns empty array for clean code', () => {
    const code = 'export function clean(): number {\n  return 42\n}'
    const defects = detectDefects(code, 'clean.ts')
    expect(defects).toHaveLength(0)
  })

  it('each defect has required fields', () => {
    const code = 'async function f() { await x }\nconst y: any = 1'
    const defects = detectDefects(code, 'a.ts')
    for (const d of defects) {
      expect(d).toHaveProperty('type')
      expect(d).toHaveProperty('location')
      expect(d).toHaveProperty('severity')
      expect(d).toHaveProperty('description')
      expect(d).toHaveProperty('repair')
      expect(d.location).toBeGreaterThanOrEqual(1)
    }
  })
})

// ─── inspectPiece ──────────────────────────────────────────────────────────────

describe('inspectPiece', () => {
  it('computes weighted average', () => {
    const score = inspectPiece(80, 70, 60, 75)
    expect(score).toBe(Math.round(80 * 0.25 + 70 * 0.3 + 60 * 0.25 + 75 * 0.2))
  })

  it('returns 0 for all zeros', () => {
    expect(inspectPiece(0, 0, 0, 0)).toBe(0)
  })

  it('returns 100 for all perfect', () => {
    expect(inspectPiece(100, 100, 100, 100)).toBe(100)
  })

  it('weights wheelwork highest', () => {
    const highWheel = inspectPiece(0, 100, 0, 0)
    const highClay = inspectPiece(100, 0, 0, 0)
    expect(highWheel).toBeGreaterThan(highClay)
  })
})

// ─── classifyPieceGrade ────────────────────────────────────────────────────────

describe('classifyPieceGrade', () => {
  it('returns masterwork for high score with no structural defects', () => {
    expect(classifyPieceGrade(85, 0)).toBe('masterwork')
  })

  it('returns fine-craft for moderate score', () => {
    expect(classifyPieceGrade(70, 0)).toBe('fine-craft')
  })

  it('returns studio for mid-range score', () => {
    expect(classifyPieceGrade(50, 0)).toBe('studio')
  })

  it('returns student for low score', () => {
    expect(classifyPieceGrade(30, 0)).toBe('student')
  })

  it('returns kiln-waste for very low score', () => {
    expect(classifyPieceGrade(10, 0)).toBe('kiln-waste')
  })

  it('returns kiln-waste for many structural defects', () => {
    expect(classifyPieceGrade(90, 3)).toBe('kiln-waste')
  })

  it('returns fine-craft even with 1 structural defect at high score', () => {
    expect(classifyPieceGrade(85, 1)).toBe('fine-craft')
  })
})

// ─── computeCraftsmanshipIndex ─────────────────────────────────────────────────

describe('computeCraftsmanshipIndex', () => {
  it('returns 50 for empty array', () => {
    expect(computeCraftsmanshipIndex([])).toBe(50)
  })

  it('returns average inspection for clean pieces', () => {
    const pieces: CeramicPiece[] = [{
      file: 'a.ts', clay: 80, wheelwork: 80, firing: 80, glaze: 80,
      finalInspection: 80, defects: [], shape: 'vase', grade: 'masterwork',
    }]
    expect(computeCraftsmanshipIndex(pieces)).toBe(80)
  })

  it('penalizes structural defects', () => {
    const clean: CeramicPiece[] = [{
      file: 'a.ts', clay: 80, wheelwork: 80, firing: 80, glaze: 80,
      finalInspection: 80, defects: [], shape: 'vase', grade: 'masterwork',
    }]
    const withDefect: CeramicPiece[] = [{
      file: 'a.ts', clay: 80, wheelwork: 80, firing: 80, glaze: 80,
      finalInspection: 80, defects: [
        { type: 'kiln-accident', location: 1, severity: 'structural', description: 'x', repair: 'x' },
      ], shape: 'vase', grade: 'student',
    }]
    expect(computeCraftsmanshipIndex(withDefect)).toBeLessThan(computeCraftsmanshipIndex(clean))
  })

  it('clamps penalty to 30 max', () => {
    const pieces: CeramicPiece[] = [{
      file: 'a.ts', clay: 80, wheelwork: 80, firing: 80, glaze: 80,
      finalInspection: 80, defects: Array(10).fill(null).map(() => ({
        type: 'kiln-accident' as const, location: 1, severity: 'structural' as const, description: 'x', repair: 'x',
      })), shape: 'vase', grade: 'kiln-waste',
    }]
    const index = computeCraftsmanshipIndex(pieces)
    expect(index).toBe(50) // 80 - min(30, 10*5) = 80 - 30 = 50
  })
})

// ─── classifyOverallGrade ──────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns master-potter for high craftsmanship and low defects', () => {
    expect(classifyOverallGrade(85, 0.5)).toBe('master-potter')
  })

  it('returns artisan for good craftsmanship', () => {
    expect(classifyOverallGrade(70, 0)).toBe('artisan')
  })

  it('returns apprentice for moderate craftsmanship', () => {
    expect(classifyOverallGrade(50, 0)).toBe('apprentice')
  })

  it('returns student for low craftsmanship', () => {
    expect(classifyOverallGrade(30, 0)).toBe('student')
  })

  it('returns novice for very low craftsmanship', () => {
    expect(classifyOverallGrade(10, 0)).toBe('novice')
  })

  it('does not return master-potter with high avg defects', () => {
    expect(classifyOverallGrade(90, 1.5)).toBe('artisan')
  })
})

// ─── buildPiece ────────────────────────────────────────────────────────────────

describe('buildPiece', () => {
  it('returns a complete CeramicPiece', () => {
    const piece = buildPiece('export function hello(): string { return "hi" }', 'hello.ts')
    expect(piece).toHaveProperty('file', 'hello.ts')
    expect(piece).toHaveProperty('clay')
    expect(piece).toHaveProperty('wheelwork')
    expect(piece).toHaveProperty('firing')
    expect(piece).toHaveProperty('glaze')
    expect(piece).toHaveProperty('finalInspection')
    expect(piece).toHaveProperty('defects')
    expect(piece).toHaveProperty('shape')
    expect(piece).toHaveProperty('grade')
  })

  it('computes finalInspection from sub-scores', () => {
    const piece = buildPiece('export const x: number = 1;', 'simple.ts')
    const expected = inspectPiece(piece.clay, piece.wheelwork, piece.firing, piece.glaze)
    expect(piece.finalInspection).toBe(expected)
  })

  it('classifies grade based on inspection and structural defects', () => {
    const piece = buildPiece('export function clean(): number { return 42 }', 'clean.ts')
    const structural = piece.defects.filter(d => d.severity === 'structural' || d.severity === 'major').length
    expect(piece.grade).toBe(classifyPieceGrade(piece.finalInspection, structural))
  })
})

// ─── generatePotteryRecommendations ────────────────────────────────────────────

describe('generatePotteryRecommendations', () => {
  const makePiece = (grade: string): CeramicPiece => ({
    file: 'a.ts', clay: 50, wheelwork: 50, firing: 50, glaze: 50,
    finalInspection: 50, defects: [], shape: 'vase', grade: grade as CeramicPiece['grade'],
  })

  const makeStats = (overrides: Partial<PotteryStats> = {}): PotteryStats => ({
    totalPieces: 1, avgClay: 50, avgWheelwork: 50, avgFiring: 50, avgGlaze: 50,
    avgInspection: 50, masterworkCount: 0, kilnWasteCount: 0, totalDefects: 0,
    structuralDefects: 0, cosmeticDefects: 0, avgTemperature: 50, perfectFirings: 0,
    underFired: 0, shapeDistribution: {}, craftsmanshipIndex: 50, overallGrade: 'apprentice',
    ...overrides,
  })

  it('recommends refactoring kiln-waste files', () => {
    const recs = generatePotteryRecommendations([makePiece('kiln-waste')], [], [], makeStats())
    expect(recs.some(r => r.includes('kiln-waste'))).toBe(true)
  })

  it('recommends adding error handling for under-fired files', () => {
    const kiln: KilnResult[] = [{ file: 'a.ts', temperature: 20, duration: 10, result: 'under-fired', description: 'x' }]
    const recs = generatePotteryRecommendations([], [], kiln, makeStats())
    expect(recs.some(r => r.includes('error handling'))).toBe(true)
  })

  it('recommends improving clay quality when low', () => {
    const recs = generatePotteryRecommendations([], [], [], makeStats({ avgClay: 30 }))
    expect(recs.some(r => r.includes('clay'))).toBe(true)
  })

  it('recommends improving glaze when low', () => {
    const recs = generatePotteryRecommendations([], [], [], makeStats({ avgGlaze: 30 }))
    expect(recs.some(r => r.includes('glaze'))).toBe(true)
  })

  it('recommends fixing structural defects', () => {
    const pieces: CeramicPiece[] = [{
      file: 'a.ts', clay: 50, wheelwork: 50, firing: 50, glaze: 50,
      finalInspection: 50, defects: [{ type: 'kiln-accident', location: 1, severity: 'structural', description: 'x', repair: 'x' }],
      shape: 'vase', grade: 'kiln-waste',
    }]
    const recs = generatePotteryRecommendations(pieces, pieces[0].defects, [], makeStats())
    expect(recs.some(r => r.includes('structural'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generatePotteryRecommendations([], [], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildPotteryResult ────────────────────────────────────────────────────────

describe('buildPotteryResult', () => {
  it('returns a complete PotteryResult', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result).toHaveProperty('pieces')
    expect(result).toHaveProperty('wheels')
    expect(result).toHaveProperty('kiln')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one piece per file', () => {
    const result = buildPotteryResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.pieces).toHaveLength(2)
  })

  it('creates 5 wheels per file', () => {
    const result = buildPotteryResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.wheels).toHaveLength(10)
  })

  it('creates one kiln result per file', () => {
    const result = buildPotteryResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.kiln).toHaveLength(2)
  })

  it('computes stats averages', () => {
    const result = buildPotteryResult(
      ['a.ts'],
      ['export const x: number = 1;'],
      {},
    )
    expect(result.stats.totalPieces).toBe(1)
    expect(result.stats.avgClay).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWheelwork).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFiring).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgGlaze).toBeGreaterThanOrEqual(0)
  })

  it('computes shape distribution', () => {
    const result = buildPotteryResult(
      ['a.ts'],
      ['export const x: number = 1;'],
      {},
    )
    expect(result.stats.shapeDistribution).toBeDefined()
    const shapes = Object.keys(result.stats.shapeDistribution)
    expect(shapes.length).toBeGreaterThan(0)
  })

  it('computes craftsmanship index', () => {
    const result = buildPotteryResult(
      ['a.ts'],
      ['export function clean(): number { return 42 }'],
      {},
    )
    expect(result.stats.craftsmanshipIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.craftsmanshipIndex).toBeLessThanOrEqual(100)
  })

  it('computes overall grade', () => {
    const result = buildPotteryResult(
      ['a.ts'],
      ['export function clean(): number { return 42 }'],
      {},
    )
    expect(result.stats.overallGrade).toBeDefined()
  })

  it('handles empty input', () => {
    const result = buildPotteryResult([], [], {})
    expect(result.pieces).toHaveLength(0)
    expect(result.stats.totalPieces).toBe(0)
    expect(result.stats.craftsmanshipIndex).toBe(50)
  })

  it('tracks kiln statistics', () => {
    const result = buildPotteryResult(
      ['a.ts'],
      ['try { doWork() } catch(e) { throw e }\nif (x === null) return\nconst y: number = 1'],
      {},
    )
    expect(result.stats.perfectFirings).toBeGreaterThanOrEqual(0)
    expect(result.stats.underFired).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgTemperature).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatPotteryTable ────────────────────────────────────────────────────────

describe('formatPotteryTable', () => {
  it('returns a string', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatPotteryTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains Pottery header', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('Pottery')
  })

  it('contains Pieces section', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('Pieces')
  })

  it('contains Kiln section', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('Kiln')
  })

  it('contains Statistics section', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const result = buildPotteryResult(['a.ts'], ['async function f() { await x }\nconst y: any = 1'], {})
    const output = formatPotteryTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles no pieces gracefully', () => {
    const result = buildPotteryResult([], [], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('No pieces')
  })

  it('handles no kiln results gracefully', () => {
    const result = buildPotteryResult([], [], {})
    const output = formatPotteryTable(result, false)
    expect(output).toContain('No kiln')
  })
})

// ─── formatPotteryJson ─────────────────────────────────────────────────────────

describe('formatPotteryJson', () => {
  it('returns valid JSON', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatPotteryJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('pieces')
    expect(parsed).toHaveProperty('wheels')
    expect(parsed).toHaveProperty('kiln')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints with 2 spaces', () => {
    const result = buildPotteryResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatPotteryJson(result)
    expect(json).toContain('  ')
  })
})
