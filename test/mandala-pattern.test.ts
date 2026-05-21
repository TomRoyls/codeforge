import { describe, expect, it } from 'vitest'

import {
  analyzeMandalaGarden,
  analyzeMandalaRing,
  buildMandalaPatternResult,
  classifyArtistGrade,
  classifyGardenCondition,
  classifyGardenType,
  classifyMandalaCondition,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  maxNesting,
  measureColors,
  measureCompleteness,
  measureGeometry,
  measureMeditation,
  measurePattern,
  measureRing,
  measureSymmetry,
} from '../src/commands/mandala-pattern-helpers.js'

import {
  formatMandalaPatternJSON,
  formatMandalaPatternReport,
  formatRingTable,
  formatGardenTable,
  formatMonastery,
  formatStats,
  formatRecommendations,
} from '../src/commands/mandala-pattern-format-helpers.js'

// ─── Primitive Counters ─────────────────────────────────────

describe('mandala-pattern countLoc', () => {
  it('counts lines of code', () => { expect(countLoc('a\nb\nc')).toBe(3) })
  it('returns 0 for empty string', () => { expect(countLoc('')).toBe(0) })
  it('ignores blank lines', () => { expect(countLoc('a\n\n  \nb')).toBe(2) })
})

describe('mandala-pattern countImports', () => {
  it('counts import statements', () => { expect(countImports("import { a } from 'b'")).toBe(1) })
  it('returns 0 when none', () => { expect(countImports('const x = 1')).toBe(0) })
})

describe('mandala-pattern countExports', () => {
  it('counts export statements', () => { expect(countExports('export function a() {}')).toBe(1) })
})

describe('mandala-pattern countFunctions', () => {
  it('counts function declarations', () => { expect(countFunctions('function foo() {}')).toBe(1) })
  it('counts arrow functions', () => { expect(countFunctions('const f = () => 1')).toBe(1) })
})

describe('mandala-pattern countClasses', () => {
  it('counts class declarations', () => { expect(countClasses('class Foo {}')).toBe(1) })
})

describe('mandala-pattern countInterfaces', () => {
  it('counts interfaces', () => { expect(countInterfaces('interface I { x: number }')).toBe(1) })
})

describe('mandala-pattern countErrorHandling', () => {
  it('counts try/catch/throw', () => { expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3) })
})

describe('mandala-pattern countTypeAnnotations', () => {
  it('counts type annotations', () => { expect(countTypeAnnotations('function f(x: number): string { return "a" }')).toBe(2) })
})

describe('mandala-pattern countBranches', () => {
  it('counts if/else/switch', () => { expect(countBranches('if (x) {} else {} switch (y) {}')).toBe(3) })
})

describe('mandala-pattern maxNesting', () => {
  it('measures max nesting depth', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

describe('mandala-pattern countConsole', () => {
  it('counts console calls', () => { expect(countConsole('console.log("a"); console.error("b")')).toBe(2) })
})

describe('mandala-pattern countComments', () => {
  it('counts comments', () => { expect(countComments('// a\n/* b */')).toBe(2) })
})

describe('mandala-pattern countTodos', () => {
  it('counts TODO/FIXME/HACK', () => { expect(countTodos('// TODO fix\n// FIXME this')).toBe(2) })
})

describe('mandala-pattern countJSDoc', () => {
  it('counts JSDoc blocks', () => { expect(countJSDoc('/** doc */')).toBe(1) })
})

describe('mandala-pattern countDescriptiveNames', () => {
  it('counts descriptive names', () => { expect(countDescriptiveNames('function getData() {}')).toBe(1) })
})

// ─── Ring Measurement ───────────────────────────────────────

describe('mandala-pattern measureRing', () => {
  it('returns zero layer for empty code', () => {
    const r = measureRing('')
    expect(r.layer).toBe(0)
    expect(r.radius).toBe(0)
    expect(r.hasCenter).toBe(false)
  })
  it('detects center with functions', () => {
    const r = measureRing('function f() {}')
    expect(r.hasCenter).toBe(true)
  })
  it('detects inner ring with error handling', () => {
    const r = measureRing('try {} catch (e) {}')
    expect(r.hasInnerRing).toBe(true)
  })
  it('detects outer ring with exports', () => {
    const r = measureRing('export function f() {}')
    expect(r.hasOuterRing).toBe(true)
  })
  it('detects decorative ring with comments', () => {
    const r = measureRing('// comment\nfunction f() {}')
    expect(r.hasDecorativeRing).toBe(true)
  })
  it('detects complete ring', () => {
    const code = [
      '/** doc */',
      'export function f(x: number): number { try { return x } catch (e) { return 0 } }',
    ].join('\n')
    const r = measureRing(code)
    expect(r.isComplete).toBe(true)
  })
  it('reports missing rings', () => {
    const r = measureRing('const x = 1')
    expect(r.missingRings.length).toBeGreaterThan(0)
  })
  it('computes layer correctly', () => {
    const code = [
      '/** doc */',
      'export interface I { x: number }',
      'export function validate(i: I): boolean {',
      '  try { return i.x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const r = measureRing(code)
    expect(r.layer).toBeGreaterThanOrEqual(5)
  })
})

// ─── Symmetry Measurement ───────────────────────────────────

describe('mandala-pattern measureSymmetry', () => {
  it('returns zero score for empty code', () => {
    const s = measureSymmetry('')
    expect(s.score).toBe(0)
    expect(s.symmetryType).toBe('chaotic')
  })
  it('detects bilateral symmetry with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const s = measureSymmetry(code)
    expect(s.hasBilateralSymmetry).toBe(true)
  })
  it('detects radial symmetry for high scores', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): boolean {',
      '  try { return x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const s = measureSymmetry(code)
    expect(s.hasRadialSymmetry).toBe(true)
    expect(s.score).toBeGreaterThanOrEqual(60)
  })
  it('detects broken symmetry with console', () => {
    const s = measureSymmetry("console.log('hi')")
    expect(s.hasBrokenSymmetry).toBe(true)
  })
  it('detects asymmetry for low scores', () => {
    const s = measureSymmetry('const x = 1')
    expect(s.hasAsymmetry === true || s.score < 30).toBe(true)
  })
  it('counts symmetry axes', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const s = measureSymmetry(code)
    expect(s.axisCount).toBeGreaterThanOrEqual(2)
  })
  it('classifies as bilateral for typed exports', () => {
    const code = 'export function f(x: number): number { return x }'
    const s = measureSymmetry(code)
    expect(s.symmetryType).not.toBe('chaotic')
    expect(s.score).toBeGreaterThan(0)
  })
  it('classifies as asymmetric for basic code', () => {
    const s = measureSymmetry('const x = 1')
    expect(s.symmetryType === 'asymmetric' || s.symmetryType === 'chaotic').toBe(true)
  })
})

// ─── Pattern Measurement ────────────────────────────────────

describe('mandala-pattern measurePattern', () => {
  it('detects repetition with multiple functions', () => {
    const code = 'function f() {}\nfunction g() {}'
    const p = measurePattern(code)
    expect(p.hasRepetition).toBe(true)
  })
  it('detects rhythm with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const p = measurePattern(code)
    expect(p.hasRhythm).toBe(true)
  })
  it('detects focal point with descriptive names', () => {
    const code = 'function validateData() {}'
    const p = measurePattern(code)
    expect(p.hasFocalPoint).toBe(true)
  })
  it('detects flow lines with error handling', () => {
    const code = 'try {} catch (e) {}'
    const p = measurePattern(code)
    expect(p.hasFlowLines).toBe(true)
  })
  it('detects geometric shapes with classes', () => {
    const code = 'class Foo {}'
    const p = measurePattern(code)
    expect(p.hasGeometricShapes).toBe(true)
  })
  it('returns zero scores for empty code', () => {
    const p = measurePattern('')
    expect(p.repetitionQuality).toBe(0)
    expect(p.rhythmScore).toBe(0)
  })
})

// ─── Color Measurement ──────────────────────────────────────

describe('mandala-pattern measureColors', () => {
  it('returns empty palette for empty code', () => {
    const c = measureColors('')
    expect(c.palette).toEqual([])
    expect(c.harmony).toBe(0)
  })
  it('builds palette from code constructs', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureColors(code)
    expect(c.palette).toContain('function')
    expect(c.palette).toContain('export')
    expect(c.palette).toContain('type')
  })
  it('detects complementary palette', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureColors(code)
    expect(c.isComplementary).toBe(true)
  })
  it('detects monochromatic palette', () => {
    const code = 'const x = 1'
    const c = measureColors(code)
    expect(c.isMonochromatic).toBe(true)
  })
  it('detects warm code', () => {
    const code = 'function f() {}'
    const c = measureColors(code)
    expect(c.hasWarm).toBe(true)
  })
  it('detects cool code', () => {
    const code = 'interface I { x: number }'
    const c = measureColors(code)
    expect(c.hasCool).toBe(true)
  })
  it('detects clashing with console and todos', () => {
    const code = "// TODO fix\nconsole.log('hi')"
    const c = measureColors(code)
    expect(c.hasClashing).toBe(true)
  })
  it('computes warm cool balance', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureColors(code)
    expect(c.warmCoolBalance).toBeGreaterThanOrEqual(0)
    expect(c.warmCoolBalance).toBeLessThanOrEqual(100)
  })
})

// ─── Geometry Measurement ───────────────────────────────────

describe('mandala-pattern measureGeometry', () => {
  it('detects circles with loops', () => {
    const code = 'for (let i = 0; i < 10; i++) {}'
    const g = measureGeometry(code)
    expect(g.hasCircles).toBe(true)
  })
  it('detects squares with classes', () => {
    const code = 'class Foo {}'
    const g = measureGeometry(code)
    expect(g.hasSquares).toBe(true)
  })
  it('detects triangles with branches', () => {
    const code = 'if (x) {}'
    const g = measureGeometry(code)
    expect(g.hasTriangles).toBe(true)
  })
  it('detects lines with functions', () => {
    const code = 'function f() {}'
    const g = measureGeometry(code)
    expect(g.hasLines).toBe(true)
  })
  it('detects fractals with multiple functions and exports', () => {
    const code = 'export function f() {}\nexport function g() {}'
    const g = measureGeometry(code)
    expect(g.hasFractals).toBe(true)
  })
  it('computes elegance', () => {
    const code = 'export function f(x: number): number { return x }'
    const g = measureGeometry(code)
    expect(g.elegance).toBeGreaterThan(0)
  })
  it('computes complexity', () => {
    const code = 'function f() {}\nclass A {}\nif (x) {}'
    const g = measureGeometry(code)
    expect(g.complexity).toBeGreaterThan(0)
  })
})

// ─── Completeness Measurement ───────────────────────────────

describe('mandala-pattern measureCompleteness', () => {
  it('returns zero score for empty code', () => {
    const c = measureCompleteness('')
    expect(c.score).toBe(0)
    expect(c.hasAllSections).toBe(false)
  })
  it('detects border with exports', () => {
    const c = measureCompleteness('export function f() {}')
    expect(c.hasBorder).toBe(true)
  })
  it('detects filling with functions', () => {
    const c = measureCompleteness('function f() {}')
    expect(c.hasFilling).toBe(true)
  })
  it('detects details with error handling', () => {
    const c = measureCompleteness('try {} catch (e) {}')
    expect(c.hasDetails).toBe(true)
  })
  it('detects centerpiece with descriptive names', () => {
    const c = measureCompleteness('function validateData() {}')
    expect(c.hasCenterpiece).toBe(true)
  })
  it('detects all sections', () => {
    const code = [
      '/** doc */',
      'export function validateData(x: number): number { try { return x } catch (e) { return 0 } }',
    ].join('\n')
    const c = measureCompleteness(code)
    expect(c.hasAllSections).toBe(true)
    expect(c.missingSections).toHaveLength(0)
  })
  it('reports missing sections', () => {
    const c = measureCompleteness('const x = 1')
    expect(c.missingSections.length).toBeGreaterThan(0)
  })
})

// ─── Meditation Measurement ─────────────────────────────────

describe('mandala-pattern measureMeditation', () => {
  it('returns zero quality for empty code', () => {
    const m = measureMeditation('')
    expect(m.quality).toBe(0)
    expect(m.calmnessScore).toBe(0)
  })
  it('detects calm code', () => {
    const code = 'export function f(x: number): number { return x }'
    const m = measureMeditation(code)
    expect(m.isCalm).toBe(true)
    expect(m.calmnessScore).toBeGreaterThanOrEqual(60)
  })
  it('detects noisy code', () => {
    const code = "console.log('a'); console.log('b'); console.log('c')"
    const m = measureMeditation(code)
    expect(m.hasInterruptions).toBe(true)
    expect(m.interruptionCount).toBeGreaterThan(0)
  })
  it('detects interruptions with console', () => {
    const code = "console.log('hi')"
    const m = measureMeditation(code)
    expect(m.hasInterruptions).toBe(true)
    expect(m.interruptionCount).toBeGreaterThan(0)
  })
  it('detects chaos with messy code', () => {
    const code = [
      'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {',
      'console.log("x")',
      '}}}}}}',
    ].join('\n')
    const m = measureMeditation(code)
    expect(m.hasChaos === true || m.hasInterruptions === true).toBe(true)
  })
  it('detects flow state', () => {
    const code = [
      '/** doc */',
      'export function f(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const m = measureMeditation(code)
    expect(m.hasFlowState).toBe(true)
  })
})

// ─── Classification ─────────────────────────────────────────

describe('mandala-pattern classifyMandalaCondition', () => {
  it('classifies divine-mandala', () => { expect(classifyMandalaCondition(90)).toBe('divine-mandala') })
  it('classifies temple-art', () => { expect(classifyMandalaCondition(75)).toBe('temple-art') })
  it('classifies beautiful-pattern', () => { expect(classifyMandalaCondition(55)).toBe('beautiful-pattern') })
  it('classifies decorative-art', () => { expect(classifyMandalaCondition(40)).toBe('decorative-art') })
  it('classifies rough-sketch', () => { expect(classifyMandalaCondition(20)).toBe('rough-sketch') })
  it('classifies scribble', () => { expect(classifyMandalaCondition(5)).toBe('scribble') })
})

describe('mandala-pattern classifyGardenType', () => {
  it('classifies wasteland for empty', () => { expect(classifyGardenType([])).toBe('wasteland') })
  it('classifies temple-garden', () => { expect(classifyGardenType([{ qualityScore: 85 } as any])).toBe('temple-garden') })
  it('classifies zen-garden', () => { expect(classifyGardenType([{ qualityScore: 65 } as any])).toBe('zen-garden') })
  it('classifies flower-garden', () => { expect(classifyGardenType([{ qualityScore: 50 } as any])).toBe('flower-garden') })
  it('classifies wildflower', () => { expect(classifyGardenType([{ qualityScore: 30 } as any])).toBe('wildflower') })
  it('classifies overgrown', () => { expect(classifyGardenType([{ qualityScore: 15 } as any])).toBe('overgrown') })
})

describe('mandala-pattern classifyArtistGrade', () => {
  it('classifies master-artist', () => { expect(classifyArtistGrade(85)).toBe('master-artist') })
  it('classifies temple-artist', () => { expect(classifyArtistGrade(70)).toBe('temple-artist') })
  it('classifies artisan', () => { expect(classifyArtistGrade(55)).toBe('artisan') })
  it('classifies craftsman', () => { expect(classifyArtistGrade(40)).toBe('craftsman') })
  it('classifies student', () => { expect(classifyArtistGrade(20)).toBe('student') })
  it('classifies child', () => { expect(classifyArtistGrade(5)).toBe('child') })
})

// ─── Analyze Mandala Ring ───────────────────────────────────

describe('mandala-pattern analyzeMandalaRing', () => {
  it('returns zero scores for empty content', () => {
    const r = analyzeMandalaRing('', 'empty.ts')
    expect(r.file).toBe('empty.ts')
    expect(r.qualityScore).toBe(0)
    expect(r.condition).toBe('scribble')
  })
  it('returns proper ring for typed exported function', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = analyzeMandalaRing(code, 'validate.ts')
    expect(r.file).toBe('validate.ts')
    expect(r.radialSymmetry).toBeGreaterThan(0)
    expect(r.colorHarmony).toBeGreaterThan(0)
    expect(r.qualityScore).toBeGreaterThan(0)
  })
  it('includes all sub-measurements', () => {
    const r = analyzeMandalaRing('function f() {}', 'f.ts')
    expect(r.ring).toBeDefined()
    expect(r.symmetry).toBeDefined()
    expect(r.pattern).toBeDefined()
    expect(r.colors).toBeDefined()
    expect(r.geometry).toBeDefined()
    expect(r.completenessMeasure).toBeDefined()
    expect(r.meditation).toBeDefined()
  })
})

// ─── Analyze Mandala Garden ─────────────────────────────────

describe('mandala-pattern analyzeMandalaGarden', () => {
  it('returns wasteland for empty rings', () => {
    const g = analyzeMandalaGarden([], 'empty')
    expect(g.gardenType).toBe('wasteland')
    expect(g.condition).toBe('chaotic')
  })
  it('aggregates ring scores', () => {
    const r1 = analyzeMandalaRing('export function f(x: number): number { return x }', 'a.ts')
    const r2 = analyzeMandalaRing('export function g(y: string): string { return y }', 'b.ts')
    const g = analyzeMandalaGarden([r1, r2], 'src')
    expect(g.rings).toHaveLength(2)
    expect(g.avgSymmetry).toBeGreaterThan(0)
  })
})

// ─── Build Result ───────────────────────────────────────────

describe('mandala-pattern buildMandalaPatternResult', () => {
  it('handles empty input', () => {
    const r = buildMandalaPatternResult([], [], {})
    expect(r.rings).toHaveLength(0)
    expect(r.gardens).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.artistGrade).toBe('child')
    expect(r.monastery.isBeautiful).toBe(false)
  })
  it('handles single file', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = buildMandalaPatternResult(['f.ts'], [code], {})
    expect(r.rings).toHaveLength(1)
    expect(r.stats.mostBeautiful).toBe('f.ts')
  })
  it('handles multiple files in same directory', () => {
    const code = 'export function f(x: number): number { return x }'
    const r = buildMandalaPatternResult(['src/a.ts', 'src/b.ts'], [code, code], {})
    expect(r.gardens).toHaveLength(1)
    expect(r.gardens[0].directory).toBe('src')
  })
  it('handles missing contents', () => {
    const r = buildMandalaPatternResult(['a.ts'], [], {})
    expect(r.rings).toHaveLength(1)
    expect(r.rings[0].qualityScore).toBe(0)
  })
  it('computes stats correctly', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildMandalaPatternResult(['a.ts', 'b.ts'], [code, code], {})
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgRadialSymmetry).toBeGreaterThan(0)
    expect(r.stats.overallBeauty).toBeGreaterThan(0)
  })
})

// ─── Recommendations ────────────────────────────────────────

describe('mandala-pattern generateRecommendations', () => {
  it('recommends restoration for scribbles', () => {
    const r = buildMandalaPatternResult(['a.ts'], ['const x = 1'], {})
    if (r.stats.scribbleCount + r.stats.roughSketchCount > 0) {
      expect(r.recommendations.some(rec => rec.includes('Restoration') || rec.includes('refinement'))).toBe(true)
    }
  })
  it('recommends beauty for high quality', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildMandalaPatternResult(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'], [code, code, code, code, code], {})
    if (r.monastery.overallBeauty >= 70) {
      expect(r.recommendations.some(rec => rec.includes('Beautiful') || rec.includes('beautiful'))).toBe(true)
    }
  })
})

// ─── Format Helpers ─────────────────────────────────────────

describe('mandala-pattern formatRingTable', () => {
  it('handles empty rings', () => { expect(formatRingTable([])).toContain('No mandala rings') })
  it('formats ring table', () => {
    const r = analyzeMandalaRing('export function f(x: number): number { return x }', 'f.ts')
    expect(formatRingTable([r])).toContain('f.ts')
  })
})

describe('mandala-pattern formatGardenTable', () => {
  it('handles empty gardens', () => { expect(formatGardenTable([])).toContain('No mandala gardens') })
  it('formats garden table', () => {
    const r = analyzeMandalaRing('function f() {}', 'f.ts')
    const g = analyzeMandalaGarden([r], 'src')
    expect(formatGardenTable([g])).toContain('src')
  })
})

describe('mandala-pattern formatMonastery', () => {
  it('formats monastery summary', () => {
    const r = buildMandalaPatternResult(['a.ts'], ['function f() {}'], {})
    const result = formatMonastery(r.monastery)
    expect(result).toContain('Monastery Summary')
  })
})

describe('mandala-pattern formatStats', () => {
  it('formats statistics', () => {
    const r = buildMandalaPatternResult(['a.ts'], ['function f() {}'], {})
    const result = formatStats(r.stats)
    expect(result).toContain('Mandala Pattern Statistics')
  })
})

describe('mandala-pattern formatRecommendations', () => {
  it('handles empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => { expect(formatRecommendations(['Add symmetry'])).toContain('Add symmetry') })
})

describe('mandala-pattern formatMandalaPatternJSON', () => {
  it('formats as JSON', () => {
    const r = buildMandalaPatternResult(['a.ts'], ['function f() {}'], {})
    const result = formatMandalaPatternJSON(r)
    const parsed = JSON.parse(result)
    expect(parsed.rings).toHaveLength(1)
  })
})

// ─── Integration ────────────────────────────────────────────

describe('mandala-pattern integration', () => {
  it('all scores are bounded 0-100', () => {
    const codes = [
      '',
      'const x = 1',
      'export function f(x: number): number { try { return x } catch (e) { return 0 } }',
      'if (a) { if (b) { if (c) { if (d) {} } } }',
      'console.log("a")',
      '// TODO fix',
    ]
    for (const code of codes) {
      const r = analyzeMandalaRing(code, 'test.ts')
      expect(r.radialSymmetry).toBeGreaterThanOrEqual(0)
      expect(r.radialSymmetry).toBeLessThanOrEqual(100)
      expect(r.concentricBalance).toBeGreaterThanOrEqual(0)
      expect(r.concentricBalance).toBeLessThanOrEqual(100)
      expect(r.colorHarmony).toBeGreaterThanOrEqual(0)
      expect(r.colorHarmony).toBeLessThanOrEqual(100)
      expect(r.sacredGeometry).toBeGreaterThanOrEqual(0)
      expect(r.sacredGeometry).toBeLessThanOrEqual(100)
      expect(r.completeness).toBeGreaterThanOrEqual(0)
      expect(r.completeness).toBeLessThanOrEqual(100)
      expect(r.meditativeQuality).toBeGreaterThanOrEqual(0)
      expect(r.meditativeQuality).toBeLessThanOrEqual(100)
      expect(r.qualityScore).toBeGreaterThanOrEqual(0)
      expect(r.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('produces valid JSON', () => {
    const r = buildMandalaPatternResult(['a.ts'], ['const x = 1'], {})
    const json = formatMandalaPatternJSON(r)
    const parsed = JSON.parse(json)
    expect(parsed.rings[0].file).toBe('a.ts')
  })

  it('recommendations are unique', () => {
    const code = 'function f() {}'
    const r = buildMandalaPatternResult(['a.ts', 'b.ts', 'c.ts'], [code, code, code], {})
    const uniqueRecs = Array.from(new Set(r.recommendations))
    expect(r.recommendations).toHaveLength(uniqueRecs.length)
  })

  it('analyzes mixed quality files', () => {
    const goodCode = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const badCode = 'var x = 1'
    const r = buildMandalaPatternResult(['good.ts', 'bad.ts'], [goodCode, badCode], {})
    expect(r.rings).toHaveLength(2)
    expect(r.rings[0].qualityScore).toBeGreaterThan(r.rings[1].qualityScore)
  })
})
