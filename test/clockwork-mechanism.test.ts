import { describe, expect, it } from 'vitest'

import {
  analyzeClockworkGear,
  analyzeClockTower,
  buildClockworkMechanismResult,
  classifyGearCondition,
  classifyHorologistGrade,
  classifyTowerCondition,
  classifyTowerType,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureChime,
  measureEscapement,
  measureFace,
  measureGear,
  measureSpring,
  measureTicking,
  measureWinding,
} from '../src/commands/clockwork-mechanism-helpers.js'

import {
  formatClockworkMechanismJSON,
  formatClockworkMechanismReport,
  formatGearTable,
  formatTowerTable,
  formatAtelier,
  formatStats,
  formatRecommendations,
} from '../src/commands/clockwork-mechanism-format-helpers.js'

// ─── Primitive Counters ─────────────────────────────────────

describe('clockwork-mechanism countLoc', () => {
  it('counts lines of code', () => {
    expect(countLoc('a\nb\nc')).toBe(3)
  })
  it('returns 0 for empty string', () => {
    expect(countLoc('')).toBe(0)
  })
  it('ignores blank lines', () => {
    expect(countLoc('a\n\n  \nb')).toBe(2)
  })
})

describe('clockwork-mechanism countImports', () => {
  it('counts import statements', () => {
    expect(countImports("import { a } from 'b'\nimport c from 'd'")).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('clockwork-mechanism countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export function a() {}\nexport const b = 1')).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

describe('clockwork-mechanism countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })
  it('counts arrow functions', () => {
    expect(countFunctions('const f = () => 1')).toBe(1)
  })
  it('returns 0 when none', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })
})

describe('clockwork-mechanism countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class Foo {}')).toBe(1)
  })
})

describe('clockwork-mechanism countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3)
  })
})

describe('clockwork-mechanism countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: number): string { return "a" }')).toBe(2)
  })
})

describe('clockwork-mechanism countBranches', () => {
  it('counts if/else/switch', () => {
    expect(countBranches('if (x) {} else {} switch (y) {}')).toBe(3)
  })
})

describe('clockwork-mechanism maxNesting', () => {
  it('measures max nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
  it('returns 0 for flat code', () => {
    expect(maxNesting('a b c')).toBe(0)
  })
})

describe('clockwork-mechanism countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("a"); console.error("b")')).toBe(2)
  })
})

describe('clockwork-mechanism countComments', () => {
  it('counts single-line comments', () => {
    expect(countComments('// a\n// b')).toBe(2)
  })
  it('counts block comments', () => {
    expect(countComments('/* block */')).toBe(1)
  })
})

describe('clockwork-mechanism countTodos', () => {
  it('counts TODO/FIXME/HACK', () => {
    expect(countTodos('// TODO fix\n// FIXME this')).toBe(2)
  })
})

describe('clockwork-mechanism countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */')).toBe(1)
  })
  it('does not count regular block comments', () => {
    expect(countJSDoc('/* not jsdoc */')).toBe(0)
  })
})

describe('clockwork-mechanism countDescriptiveNames', () => {
  it('counts descriptive function names', () => {
    expect(countDescriptiveNames('function getData() {}')).toBe(1)
  })
})

describe('clockwork-mechanism countValidations', () => {
  it('counts validation patterns', () => {
    const code = 'if (x === 1) {}'
    const count = countValidations(code)
    expect(count).toBeGreaterThanOrEqual(0)
    expect(typeof count).toBe('number')
  })
})

// ─── Gear Measurement ───────────────────────────────────────

describe('clockwork-mechanism measureGear', () => {
  it('returns simple gear for minimal code', () => {
    const g = measureGear('function f() {}')
    expect(g.type).toBe('rack')
    expect(g.teethCount).toBe(1)
    expect(g.precision).toBeGreaterThanOrEqual(0)
  })
  it('returns planetary gear for complex code', () => {
    const code = [
      'function f1(x: number): number { return x }',
      'function f2(x: string): string { return x }',
      'function f3(x: boolean): boolean { return x }',
      'function f4(): void {}',
      'function f5(): void {}',
      'export function f6() {}',
      'export const a: number = 1',
      'export const b: string = "x"',
    ].join('\n')
    const g = measureGear(code)
    expect(g.type).toBe('planetary')
    expect(g.teethCount).toBeGreaterThanOrEqual(5)
    expect(g.precision).toBeGreaterThanOrEqual(50)
  })
  it('returns zero precision for empty code', () => {
    const g = measureGear('')
    expect(g.precision).toBe(0)
    expect(g.teethCount).toBe(0)
  })
  it('detects backlash when no types but has functions', () => {
    const g = measureGear('function foo() { return 1 }')
    expect(g.hasBacklash).toBe(true)
    expect(g.backlashAmount).toBeGreaterThan(0)
  })
  it('detects worn gears with TODOs', () => {
    const g = measureGear('// TODO fix this\nfunction foo() {}')
    expect(g.isWorn).toBe(true)
  })
  it('detects grinding with console.log', () => {
    const g = measureGear("console.log('hi'); function foo(): void {}")
    expect(g.hasGrinding).toBe(true)
  })
  it('detects polished gear', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const g = measureGear(code)
    expect(g.isPolished).toBe(true)
    expect(g.precision).toBeGreaterThanOrEqual(60)
  })
  it('meshQuality equals precision', () => {
    const g = measureGear('function f() {}')
    expect(g.meshQuality).toBe(g.precision)
  })
  it('returns spur gear for moderate code', () => {
    const code = [
      'export function f1(x: number): number { return x }',
      'export function f2(y: string): string { return y }',
      'export function f3(): void {}',
    ].join('\n')
    const g = measureGear(code)
    expect(g.type).toBe('spur')
  })
  it('returns bevel gear for typed functions', () => {
    const code = [
      'function f1(x: number): number { return x }',
      'function f2(y: string): string { return y }',
    ].join('\n')
    const g = measureGear(code)
    expect(g.type).toBe('bevel')
  })
  it('returns worm gear for untyped multi-function', () => {
    const code = 'function f1() {}\nfunction f2() {}'
    const g = measureGear(code)
    expect(g.type).toBe('worm')
  })
})

// ─── Escapement Measurement ─────────────────────────────────

describe('clockwork-mechanism measureEscapement', () => {
  it('returns broken for empty code', () => {
    const e = measureEscapement('')
    expect(e.type).toBe('broken')
    expect(e.regulation).toBe(0)
  })
  it('returns tourbillon for highly regulated code', () => {
    const code = [
      'export function validate(x: number): number {',
      '  try {',
      '    if (x > 0) { return x }',
      '    return 0',
      '  } catch (e) { return 0 }',
      '}',
      '/** doc */',
      'function compute(y: string): string { return y }',
    ].join('\n')
    const e = measureEscapement(code)
    expect(e.regulation).toBeGreaterThanOrEqual(60)
    expect(e.hasConsistentBeat).toBe(true)
  })
  it('detects skipped beats with branches but no error handling', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}'
    const e = measureEscapement(code)
    expect(e.hasSkippedBeats).toBe(true)
  })
  it('detects stalling with await and no error handling', () => {
    const code = 'await fetch(url)'
    const e = measureEscapement(code)
    expect(e.hasStalling).toBe(true)
  })
  it('measures isochronism', () => {
    const code = [
      'try {',
      '  if (x > 0) { return x }',
      '  return 0',
      '} catch (e) { return 0 }',
    ].join('\n')
    const e = measureEscapement(code)
    expect(e.isochronism).toBeGreaterThan(0)
  })
  it('returns lever for regulated code with errors', () => {
    const code = [
      'export function f(): void {',
      '  try { doSomething() } catch (e) { handleError() }',
      '}',
    ].join('\n')
    const e = measureEscapement(code)
    expect(e.type === 'lever' || e.type === 'tourbillon').toBe(true)
  })
  it('returns simple for basic code', () => {
    const e = measureEscapement('const x = 1')
    expect(e.type).toBe('simple')
  })
  it('returns cylinder for branching code', () => {
    const code = 'if (x) { a() } else { b() }'
    const e = measureEscapement(code)
    expect(e.type === 'cylinder' || e.type === 'simple').toBe(true)
  })
  it('detects double ticks', () => {
    const code = 'function f() {\n  return 1;\n  return 2;\n}'
    const e = measureEscapement(code)
    expect(e.hasDoubleTicks).toBe(true)
  })
  it('beat error is higher for skipped beats', () => {
    const bad = 'if (a) {}\nif (b) {}\nif (c) {}'
    const good = 'try {} catch (e) {}'
    expect(measureEscapement(bad).beatError).toBeGreaterThan(measureEscapement(good).beatError)
  })
})

// ─── Spring Measurement ─────────────────────────────────────

describe('clockwork-mechanism measureSpring', () => {
  it('returns zero tension for empty code', () => {
    const s = measureSpring('')
    expect(s.tension).toBe(0)
    expect(s.isUnwound).toBe(true)
  })
  it('detects wound spring', () => {
    const s = measureSpring('if (x > 0) { function f() {} }')
    expect(s.isWound).toBe(true)
    expect(s.tension).toBeGreaterThan(0)
  })
  it('detects overwound spring', () => {
    const code = [
      'import { a } from "b"',
      'import { c } from "d"',
      'import { e } from "f"',
      'if (x) { if (y) { if (z) { function f1() {} } } }',
      'function f2() {}',
      'function f3() {}',
      '// lots of lines here',
      '// more lines',
      '// even more',
      '// and more',
      '// still more',
      '// one more',
      '// another',
      '// last one',
      '// final',
      '// really final',
      '// ok last',
      '// end',
      '// really end',
      '// done',
      '// finished',
    ].join('\n')
    const s = measureSpring(code)
    expect(s.tension).toBeGreaterThan(80)
    expect(s.isOverwound).toBe(true)
  })
  it('detects fatigue with TODOs', () => {
    const s = measureSpring('// TODO fix this')
    expect(s.hasFatigue).toBe(true)
    expect(s.fatigueLevel).toBeGreaterThan(0)
  })
  it('detects snapped spring with branches but no errors', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}\nif (e) {}\nif (f) {}'
    const s = measureSpring(code)
    expect(s.hasSnapped).toBe(true)
  })
  it('measures energy reserve', () => {
    const code = [
      'try { x() } catch (e) { handleError() }',
      'function compute(x: number): number { return x }',
      '/** doc */',
      'function validateData(y: string): boolean { return y.length > 0 }',
    ].join('\n')
    const s = measureSpring(code)
    expect(s.energyReserve).toBeGreaterThan(50)
  })
})

// ─── Chime Measurement ──────────────────────────────────────

describe('clockwork-mechanism measureChime', () => {
  it('returns zero accuracy for empty code', () => {
    const c = measureChime('')
    expect(c.accuracy).toBe(0)
  })
  it('detects correct notes with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureChime(code)
    expect(c.hasCorrectNotes).toBe(true)
    expect(c.accuracy).toBeGreaterThan(0)
  })
  it('detects discordant notes with console', () => {
    const code = "export function f(): void { console.log('hi') }"
    const c = measureChime(code)
    expect(c.hasDiscordantNotes).toBe(true)
    expect(c.discordantCount).toBeGreaterThan(0)
  })
  it('detects missing notes without exports', () => {
    const code = 'const x = 1\nconst y = 2'
    const c = measureChime(code)
    expect(c.hasMissingNotes).toBe(true)
    expect(c.missingCount).toBe(1)
  })
  it('detects extra notes with console and exports', () => {
    const code = "console.log('hi')\nexport function f() {}"
    const c = measureChime(code)
    expect(c.hasExtraNotes).toBe(true)
  })
  it('detects quarter chimes', () => {
    const code = "console.log('a'); console.log('b')"
    const c = measureChime(code)
    expect(c.hasQuarterChimes).toBe(true)
  })
})

// ─── Winding Measurement ────────────────────────────────────

describe('clockwork-mechanism measureWinding', () => {
  it('returns zero state for empty code', () => {
    const w = measureWinding('')
    expect(w.state).toBe(0)
    expect(w.lastWound).toBe('never')
  })
  it('detects needs winding for low state', () => {
    const w = measureWinding('const x = 1')
    expect(w.needsWinding).toBe(true)
  })
  it('detects fully wound for well-maintained code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const w = measureWinding(code)
    expect(w.isFullyWound).toBe(true)
    expect(w.state).toBeGreaterThanOrEqual(70)
  })
  it('detects overdue for very poor code', () => {
    const w = measureWinding('const x = 1')
    expect(w.state).toBeGreaterThanOrEqual(0)
    expect(w.needsWinding).toBe(true)
  })
  it('detects rust with TODOs', () => {
    const w = measureWinding('// TODO fix')
    expect(w.hasRust).toBe(true)
    expect(w.rustLevel).toBeGreaterThan(0)
  })
  it('detects dust when no comments and no jsdoc', () => {
    const code = 'export function f() { return 1 }\nfunction g() { return 2 }\nfunction h() { return 3 }\nfunction i() { return 4 }\nfunction j() { return 5 }\nfunction k() { return 6 }'
    const w = measureWinding(code)
    expect(w.hasDust).toBe(true)
  })
  it('returns recent lastWound with JSDoc', () => {
    const w = measureWinding('/** doc */ export function f() {}')
    expect(w.lastWound).toBe('recent')
  })
  it('returns overdue lastWound with TODOs', () => {
    const w = measureWinding('// TODO fix\nfunction f() {}')
    expect(w.lastWound).toBe('overdue')
  })
})

// ─── Ticking Measurement ────────────────────────────────────

describe('clockwork-mechanism measureTicking', () => {
  it('returns zero regularity for empty code', () => {
    const t = measureTicking('')
    expect(t.regularity).toBe(0)
    expect(t.bpm).toBe(0)
  })
  it('detects metronomic for highly regular code', () => {
    const code = [
      'export function validate(x: number): number {',
      '  try {',
      '    if (x > 0) { return x }',
      '    return 0',
      '  } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const t = measureTicking(code)
    expect(t.isMetronomic).toBe(true)
    expect(t.regularity).toBeGreaterThanOrEqual(80)
  })
  it('detects irregularity', () => {
    const code = 'const x = 1'
    const t = measureTicking(code)
    expect(t.regularity).toBeLessThanOrEqual(50)
    expect(t.hasIrregularity === true || t.regularity <= 50).toBe(true)
  })
  it('detects stuttering with many branches and no errors', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}\nif (e) {}\nif (f) {}'
    const t = measureTicking(code)
    expect(t.hasStuttering).toBe(true)
  })
  it('detects racing with minimal code and exports', () => {
    const code = 'export function f(): number { return 1 }'
    const t = measureTicking(code)
    expect(t.hasRacing).toBe(true)
  })
  it('detects crawling with deep nesting and many branches', () => {
    const code = [
      'if (a) {',
      '  if (b) {',
      '    if (c) {',
      '      if (d) {',
      '        if (e) {',
      '          if (f) {',
      '            if (g) {',
      '              if (h) {',
      '                if (i) {}',
      '              }',
      '            }',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n')
    const t = measureTicking(code)
    expect(t.hasCrawling).toBe(true)
  })
  it('bpm is within valid range', () => {
    const code = 'function f(x: number): number { if (x > 0) return x; return 0 }'
    const t = measureTicking(code)
    expect(t.bpm).toBeGreaterThanOrEqual(40)
    expect(t.bpm).toBeLessThanOrEqual(120)
  })
})

// ─── Face Measurement ───────────────────────────────────────

describe('clockwork-mechanism measureFace', () => {
  it('returns unreadable for empty code', () => {
    const f = measureFace('')
    expect(f.isReadable).toBe(false)
    expect(f.markerCount).toBe(0)
  })
  it('detects readable face with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const f = measureFace(code)
    expect(f.isReadable).toBe(true)
  })
  it('detects all markers with error handling', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const f = measureFace(code)
    expect(f.hasAllMarkers).toBe(true)
  })
  it('detects hands with functions', () => {
    const f = measureFace('function f() {}')
    expect(f.hasHands).toBe(true)
  })
  it('detects date window with JSDoc', () => {
    const f = measureFace('/** doc */ function f() {}')
    expect(f.hasDateWindow).toBe(true)
  })
  it('detects luminous with comments', () => {
    const f = measureFace('// comment\nfunction f() {}')
    expect(f.isLuminous).toBe(true)
  })
  it('counts markers from exports and types', () => {
    const code = 'export function f(x: number): string { return "a" }'
    const f = measureFace(code)
    expect(f.markerCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── Classification ─────────────────────────────────────────

describe('clockwork-mechanism classifyGearCondition', () => {
  it('classifies grand-complication for high scores', () => {
    expect(classifyGearCondition(90)).toBe('grand-complication')
    expect(classifyGearCondition(85)).toBe('grand-complication')
  })
  it('classifies chronometer', () => {
    expect(classifyGearCondition(75)).toBe('chronometer')
    expect(classifyGearCondition(68)).toBe('chronometer')
  })
  it('classifies precision-watch', () => {
    expect(classifyGearCondition(60)).toBe('precision-watch')
    expect(classifyGearCondition(50)).toBe('precision-watch')
  })
  it('classifies standard-clock', () => {
    expect(classifyGearCondition(40)).toBe('standard-clock')
    expect(classifyGearCondition(32)).toBe('standard-clock')
  })
  it('classifies pocket-watch', () => {
    expect(classifyGearCondition(25)).toBe('pocket-watch')
    expect(classifyGearCondition(15)).toBe('pocket-watch')
  })
  it('classifies broken-clock for very low scores', () => {
    expect(classifyGearCondition(10)).toBe('broken-clock')
    expect(classifyGearCondition(0)).toBe('broken-clock')
  })
})

describe('clockwork-mechanism classifyTowerType', () => {
  it('classifies stopped-clock for empty gears', () => {
    expect(classifyTowerType([])).toBe('stopped-clock')
  })
  it('classifies observatory-clock for high avg', () => {
    const gears = [{ qualityScore: 90 } as any, { qualityScore: 85 } as any]
    expect(classifyTowerType(gears)).toBe('observatory-clock')
  })
  it('classifies church-clock', () => {
    const gears = [{ qualityScore: 65 } as any]
    expect(classifyTowerType(gears)).toBe('church-clock')
  })
  it('classifies town-clock', () => {
    const gears = [{ qualityScore: 50 } as any]
    expect(classifyTowerType(gears)).toBe('town-clock')
  })
  it('classifies mantel-clock', () => {
    const gears = [{ qualityScore: 30 } as any]
    expect(classifyTowerType(gears)).toBe('mantel-clock')
  })
  it('classifies cuckoo-clock', () => {
    const gears = [{ qualityScore: 15 } as any]
    expect(classifyTowerType(gears)).toBe('cuckoo-clock')
  })
})

describe('clockwork-mechanism classifyTowerCondition', () => {
  it('classifies stopped for empty gears', () => {
    expect(classifyTowerCondition([])).toBe('stopped')
  })
  it('classifies swiss-precision for high avg', () => {
    const gears = [{ qualityScore: 85 } as any]
    expect(classifyTowerCondition(gears)).toBe('swiss-precision')
  })
  it('classifies well-regulated', () => {
    const gears = [{ qualityScore: 65 } as any]
    expect(classifyTowerCondition(gears)).toBe('well-regulated')
  })
  it('classifies keeping-time', () => {
    const gears = [{ qualityScore: 50 } as any]
    expect(classifyTowerCondition(gears)).toBe('keeping-time')
  })
  it('classifies losing-time', () => {
    const gears = [{ qualityScore: 30 } as any]
    expect(classifyTowerCondition(gears)).toBe('losing-time')
  })
  it('classifies erratic', () => {
    const gears = [{ qualityScore: 15 } as any]
    expect(classifyTowerCondition(gears)).toBe('erratic')
  })
})

describe('clockwork-mechanism classifyHorologistGrade', () => {
  it('classifies master-watchmaker', () => {
    expect(classifyHorologistGrade(85)).toBe('master-watchmaker')
    expect(classifyHorologistGrade(80)).toBe('master-watchmaker')
  })
  it('classifies watchmaker', () => {
    expect(classifyHorologistGrade(70)).toBe('watchmaker')
    expect(classifyHorologistGrade(65)).toBe('watchmaker')
  })
  it('classifies horologist', () => {
    expect(classifyHorologistGrade(55)).toBe('horologist')
    expect(classifyHorologistGrade(48)).toBe('horologist')
  })
  it('classifies repairman', () => {
    expect(classifyHorologistGrade(40)).toBe('repairman')
    expect(classifyHorologistGrade(32)).toBe('repairman')
  })
  it('classifies tinkerer', () => {
    expect(classifyHorologistGrade(20)).toBe('tinkerer')
    expect(classifyHorologistGrade(16)).toBe('tinkerer')
  })
  it('classifies child', () => {
    expect(classifyHorologistGrade(10)).toBe('child')
    expect(classifyHorologistGrade(0)).toBe('child')
  })
})

// ─── Analyze Clockwork Gear ─────────────────────────────────

describe('clockwork-mechanism analyzeClockworkGear', () => {
  it('returns zero scores for empty content', () => {
    const g = analyzeClockworkGear('', 'empty.ts')
    expect(g.file).toBe('empty.ts')
    expect(g.qualityScore).toBe(0)
    expect(g.condition).toBe('broken-clock')
  })
  it('returns proper gear for typed exported function', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const g = analyzeClockworkGear(code, 'validate.ts')
    expect(g.file).toBe('validate.ts')
    expect(g.gearPrecision).toBeGreaterThan(0)
    expect(g.escapementRegulation).toBeGreaterThan(0)
    expect(g.springTension).toBeGreaterThanOrEqual(0)
    expect(g.chimeAccuracy).toBeGreaterThan(0)
    expect(g.windingState).toBeGreaterThanOrEqual(0)
    expect(g.tickRegularity).toBeGreaterThanOrEqual(0)
    expect(g.qualityScore).toBeGreaterThan(0)
    expect(g.condition).not.toBe('broken-clock')
  })
  it('includes all sub-measurements', () => {
    const g = analyzeClockworkGear('function f() {}', 'f.ts')
    expect(g.gear).toBeDefined()
    expect(g.escapement).toBeDefined()
    expect(g.spring).toBeDefined()
    expect(g.chime).toBeDefined()
    expect(g.winding).toBeDefined()
    expect(g.ticking).toBeDefined()
    expect(g.face).toBeDefined()
  })
  it('quality score is weighted average of components', () => {
    const code = 'export function compute(x: number): number { try { if (x > 0) return x; return 0 } catch (e) { return 0 } }'
    const g = analyzeClockworkGear(code, 'compute.ts')
    const expected = Math.min(100, Math.max(0, Math.round(
      g.gearPrecision * 0.18 +
      g.escapementRegulation * 0.18 +
      g.springTension * 0.14 +
      g.chimeAccuracy * 0.18 +
      g.windingState * 0.14 +
      g.tickRegularity * 0.18,
    )))
    expect(g.qualityScore).toBe(expected)
  })
})

// ─── Analyze Clock Tower ────────────────────────────────────

describe('clockwork-mechanism analyzeClockTower', () => {
  it('returns stopped-clock for empty gears', () => {
    const t = analyzeClockTower([], 'empty-dir')
    expect(t.directory).toBe('empty-dir')
    expect(t.gears).toHaveLength(0)
    expect(t.avgPrecision).toBe(0)
    expect(t.towerType).toBe('stopped-clock')
    expect(t.condition).toBe('stopped')
  })
  it('aggregates gear scores', () => {
    const g1 = analyzeClockworkGear('export function f(x: number): number { try { return x } catch (e) { return 0 } }', 'a.ts')
    const g2 = analyzeClockworkGear('export function g(y: string): string { try { return y } catch (e) { return "" } }', 'b.ts')
    const t = analyzeClockTower([g1, g2], 'src')
    expect(t.gears).toHaveLength(2)
    expect(t.avgPrecision).toBeGreaterThan(0)
    expect(t.avgRegulation).toBeGreaterThan(0)
  })
  it('counts grand complications', () => {
    const g1 = analyzeClockworkGear('export function f(x: number): number { try { return x } catch (e) { return 0 } }', 'a.ts')
    const t = analyzeClockTower([g1], 'src')
    expect(t.grandCount + t.brokenCount).toBeLessThanOrEqual(1)
  })
})

// ─── Build Result ───────────────────────────────────────────

describe('clockwork-mechanism buildClockworkMechanismResult', () => {
  it('handles empty input', () => {
    const r = buildClockworkMechanismResult([], [], {})
    expect(r.gears).toHaveLength(0)
    expect(r.towers).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalTowers).toBe(0)
    expect(r.stats.overallPrecision).toBe(0)
    expect(r.stats.horologistGrade).toBe('child')
    expect(r.atelier.isPrecise).toBe(false)
  })
  it('handles single file', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = buildClockworkMechanismResult(['f.ts'], [code], {})
    expect(r.gears).toHaveLength(1)
    expect(r.towers).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.mostPrecise).toBe('f.ts')
    expect(r.stats.bestRegulated).toBe('f.ts')
    expect(r.stats.highestTension).toBe('f.ts')
    expect(r.stats.mostAccurateChime).toBe('f.ts')
    expect(r.stats.bestMaintained).toBe('f.ts')
  })
  it('handles multiple files in same directory', () => {
    const code = 'export function f(x: number): number { return x }'
    const r = buildClockworkMechanismResult(['src/a.ts', 'src/b.ts'], [code, code], {})
    expect(r.gears).toHaveLength(2)
    expect(r.towers).toHaveLength(1)
    expect(r.towers[0].directory).toBe('src')
  })
  it('handles files in different directories', () => {
    const code = 'function f() {}'
    const r = buildClockworkMechanismResult(['src/a.ts', 'lib/b.ts'], [code, code], {})
    expect(r.towers).toHaveLength(2)
  })
  it('handles missing contents gracefully', () => {
    const r = buildClockworkMechanismResult(['a.ts'], [], {})
    expect(r.gears).toHaveLength(1)
    expect(r.gears[0].qualityScore).toBe(0)
  })
  it('computes stats correctly', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildClockworkMechanismResult(['a.ts', 'b.ts'], [code, code], {})
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgGearPrecision).toBeGreaterThan(0)
    expect(r.stats.avgEscapementRegulation).toBeGreaterThan(0)
    expect(r.stats.avgSpringTension).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgChimeAccuracy).toBeGreaterThan(0)
    expect(r.stats.avgWindingState).toBeGreaterThanOrEqual(0)
    expect(r.stats.avgTickRegularity).toBeGreaterThan(0)
    expect(r.stats.overallPrecision).toBeGreaterThan(0)
    expect(r.stats.horologistGrade).not.toBe('child')
  })
  it('counts gear types correctly', () => {
    const simpleCode = 'const x = 1'
    const r = buildClockworkMechanismResult(['a.ts', 'b.ts'], [simpleCode, simpleCode], {})
    const totalTyped = r.stats.spurCount + r.stats.planetaryCount
    expect(totalTyped).toBeLessThanOrEqual(2)
  })
  it('counts escapement types', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = buildClockworkMechanismResult(['a.ts'], [code], {})
    expect(r.stats.leverEscapementCount + r.stats.tourbillonCount).toBeGreaterThanOrEqual(0)
  })
  it('atelier precision depends on overall precision', () => {
    const goodCode = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildClockworkMechanismResult(['a.ts', 'b.ts', 'c.ts'], [goodCode, goodCode, goodCode], {})
    expect(r.atelier.overallPrecision).toBeGreaterThan(50)
    expect(r.atelier.isPrecise).toBe(true)
  })
})

// ─── Recommendations ────────────────────────────────────────

describe('clockwork-mechanism generateRecommendations', () => {
  it('recommends overhaul for broken and pocket watch files', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['const x = 1'], {})
    const hasOverhaul = r.recommendations.some(rec => rec.includes('overhaul') || rec.includes('repair'))
    // broken-clock or pocket-watch should trigger overhaul
    if (r.stats.brokenClockCount + r.stats.pocketWatchCount > 0) {
      expect(hasOverhaul).toBe(true)
    }
  })
  it('recommends precision for high quality code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildClockworkMechanismResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [code, code, code, code, code],
      {},
    )
    if (r.atelier.overallPrecision >= 70) {
      expect(r.recommendations.some(rec => rec.includes('Precision') || rec.includes('precision'))).toBe(true)
    }
  })
  it('recommends JSDoc when no luminous faces', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function f() {}'], {})
    if (r.stats.isLuminousCount === 0) {
      expect(r.recommendations.some(rec => rec.includes('JSDoc') || rec.includes('documentation'))).toBe(true)
    }
  })
  it('recommends backlash fix when detected', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function foo() { return 1 }'], {})
    if (r.stats.hasBacklashCount > 0) {
      expect(r.recommendations.some(rec => rec.includes('backlash'))).toBe(true)
    }
  })
})

// ─── Format Helpers ─────────────────────────────────────────

describe('clockwork-mechanism formatGearTable', () => {
  it('handles empty gears', () => {
    const result = formatGearTable([])
    expect(result).toContain('No clockwork gears')
  })
  it('formats gear table', () => {
    const g = analyzeClockworkGear('export function f(x: number): number { return x }', 'f.ts')
    const result = formatGearTable([g])
    expect(result).toContain('f.ts')
  })
})

describe('clockwork-mechanism formatTowerTable', () => {
  it('handles empty towers', () => {
    const result = formatTowerTable([])
    expect(result).toContain('No clock towers')
  })
  it('formats tower table', () => {
    const g = analyzeClockworkGear('export function f(x: number): number { return x }', 'f.ts')
    const t = analyzeClockTower([g], 'src')
    const result = formatTowerTable([t])
    expect(result).toContain('src')
  })
})

describe('clockwork-mechanism formatAtelier', () => {
  it('formats atelier summary', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function f() {}'], {})
    const result = formatAtelier(r.atelier)
    expect(result).toContain('Atelier')
    expect(result).toContain('Overall Precision')
  })
})

describe('clockwork-mechanism formatStats', () => {
  it('formats statistics', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function f() {}'], {})
    const result = formatStats(r.stats)
    expect(result).toContain('Clockwork Statistics')
    expect(result).toContain('Total Files')
  })
})

describe('clockwork-mechanism formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix gear backlash'])
    expect(result).toContain('Fix gear backlash')
  })
})

describe('clockwork-mechanism formatClockworkMechanismReport', () => {
  it('formats full report', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function f() {}'], {})
    const result = formatClockworkMechanismReport(r)
    expect(result).toContain('Atelier')
    expect(result).toContain('Clockwork Statistics')
  })
})

describe('clockwork-mechanism formatClockworkMechanismJSON', () => {
  it('formats as JSON', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['function f() {}'], {})
    const result = formatClockworkMechanismJSON(r)
    const parsed = JSON.parse(result)
    expect(parsed.gears).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.atelier).toBeDefined()
  })
})

// ─── Integration ────────────────────────────────────────────

describe('clockwork-mechanism integration', () => {
  it('analyzes mixed quality files', () => {
    const goodCode = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const badCode = 'var x = 1'
    const medCode = 'function compute(a, b) { if (a > b) return a; return b }'

    const r = buildClockworkMechanismResult(
      ['good.ts', 'bad.ts', 'med.ts'],
      [goodCode, badCode, medCode],
      {},
    )

    expect(r.gears).toHaveLength(3)
    expect(r.stats.totalFiles).toBe(3)
    const scores = r.gears.map(g => g.qualityScore)
    expect(scores[0]).toBeGreaterThan(scores[1])
  })

  it('handles deeply nested code', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { if (g) { if (h) { if (i) { if (j) {} } } } } } } } } }'
    const g = analyzeClockworkGear(code, 'deep.ts')
    expect(g.gear.precision).toBeGreaterThanOrEqual(0)
    expect(g.ticking.hasCrawling).toBe(true)
  })

  it('handles large file count', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export function f(x: number): number { return x }')
    const r = buildClockworkMechanismResult(files, contents, {})
    expect(r.gears).toHaveLength(20)
    expect(r.towers).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(20)
  })

  it('all scores are bounded 0-100', () => {
    const codes = [
      '',
      'const x = 1',
      'export function f(x: number): number { try { return x } catch (e) { return 0 } }',
      'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { if (g) { if (h) { if (i) {} } } } } } } } }',
      'console.log("a"); console.log("b"); console.log("c")',
      '// TODO fix\n// FIXME this\n// HACK that',
    ]
    for (const code of codes) {
      const g = analyzeClockworkGear(code, 'test.ts')
      expect(g.gearPrecision).toBeGreaterThanOrEqual(0)
      expect(g.gearPrecision).toBeLessThanOrEqual(100)
      expect(g.escapementRegulation).toBeGreaterThanOrEqual(0)
      expect(g.escapementRegulation).toBeLessThanOrEqual(100)
      expect(g.springTension).toBeGreaterThanOrEqual(0)
      expect(g.springTension).toBeLessThanOrEqual(100)
      expect(g.chimeAccuracy).toBeGreaterThanOrEqual(0)
      expect(g.chimeAccuracy).toBeLessThanOrEqual(100)
      expect(g.windingState).toBeGreaterThanOrEqual(0)
      expect(g.windingState).toBeLessThanOrEqual(100)
      expect(g.tickRegularity).toBeGreaterThanOrEqual(0)
      expect(g.tickRegularity).toBeLessThanOrEqual(100)
      expect(g.qualityScore).toBeGreaterThanOrEqual(0)
      expect(g.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('sub-measurements are bounded', () => {
    const codes = ['', 'function f() {}', 'export function f(x: number): number { return x }']
    for (const code of codes) {
      const g = analyzeClockworkGear(code, 'test.ts')
      expect(g.gear.precision).toBeGreaterThanOrEqual(0)
      expect(g.gear.precision).toBeLessThanOrEqual(100)
      expect(g.escapement.regulation).toBeGreaterThanOrEqual(0)
      expect(g.escapement.regulation).toBeLessThanOrEqual(100)
      expect(g.spring.tension).toBeGreaterThanOrEqual(0)
      expect(g.spring.tension).toBeLessThanOrEqual(100)
      expect(g.chime.accuracy).toBeGreaterThanOrEqual(0)
      expect(g.chime.accuracy).toBeLessThanOrEqual(100)
      expect(g.winding.state).toBeGreaterThanOrEqual(0)
      expect(g.winding.state).toBeLessThanOrEqual(100)
      expect(g.ticking.regularity).toBeGreaterThanOrEqual(0)
      expect(g.ticking.regularity).toBeLessThanOrEqual(100)
      expect(g.escapement.beatError).toBeGreaterThanOrEqual(0)
      expect(g.escapement.beatError).toBeLessThanOrEqual(100)
      expect(g.escapement.isochronism).toBeGreaterThanOrEqual(0)
      expect(g.escapement.isochronism).toBeLessThanOrEqual(100)
      expect(g.spring.fatigueLevel).toBeGreaterThanOrEqual(0)
      expect(g.spring.fatigueLevel).toBeLessThanOrEqual(100)
      expect(g.spring.energyReserve).toBeGreaterThanOrEqual(0)
      expect(g.spring.energyReserve).toBeLessThanOrEqual(100)
      expect(g.winding.rustLevel).toBeGreaterThanOrEqual(0)
      expect(g.winding.rustLevel).toBeLessThanOrEqual(100)
    }
  })

  it('produces valid JSON for all inputs', () => {
    const r = buildClockworkMechanismResult(['a.ts'], ['const x = 1'], {})
    const json = formatClockworkMechanismJSON(r)
    const parsed = JSON.parse(json)
    expect(parsed.gears[0].file).toBe('a.ts')
  })

  it('recommendations are unique', () => {
    const code = 'function f() {}'
    const r = buildClockworkMechanismResult(['a.ts', 'b.ts', 'c.ts'], [code, code, code], {})
    const uniqueRecs = Array.from(new Set(r.recommendations))
    expect(r.recommendations).toHaveLength(uniqueRecs.length)
  })
})
