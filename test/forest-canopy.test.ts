import { describe, expect, it } from 'vitest'

import {
  analyzeForestStand,
  analyzeTreeCrown,
  buildForestCanopyResult,
  classifyEcologistGrade,
  classifyForestCondition,
  classifyStandCondition,
  classifyStandType,
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
  extractImportPaths,
  maxNesting,
  measureBiodiversity,
  measureCanopy,
  measureFloor,
  measureGrowth,
  measureLight,
  measureRoots,
  measureUnderstory,
} from '../src/commands/forest-canopy-helpers.js'

import {
  formatForestCanopyJSON,
  formatForestCanopyReport,
  formatCrownTable,
  formatStandTable,
  formatEcosystem,
  formatStats,
  formatRecommendations,
} from '../src/commands/forest-canopy-format-helpers.js'

// ─── Primitive Counters ─────────────────────────────────────

describe('forest-canopy countLoc', () => {
  it('counts lines', () => { expect(countLoc('a\nb\nc')).toBe(3) })
  it('returns 0 for empty', () => { expect(countLoc('')).toBe(0) })
})

describe('forest-canopy countImports', () => {
  it('counts imports', () => { expect(countImports("import { a } from 'b'")).toBe(1) })
  it('returns 0 when none', () => { expect(countImports('const x = 1')).toBe(0) })
})

describe('forest-canopy countExports', () => {
  it('counts exports', () => { expect(countExports('export function a() {}')).toBe(1) })
})

describe('forest-canopy countFunctions', () => {
  it('counts functions', () => { expect(countFunctions('function foo() {}')).toBe(1) })
  it('counts arrows', () => { expect(countFunctions('const f = () => 1')).toBe(1) })
})

describe('forest-canopy countClasses', () => {
  it('counts classes', () => { expect(countClasses('class Foo {}')).toBe(1) })
})

describe('forest-canopy countInterfaces', () => {
  it('counts interfaces', () => { expect(countInterfaces('interface I { x: number }')).toBe(1) })
})

describe('forest-canopy countErrorHandling', () => {
  it('counts try/catch/throw', () => { expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3) })
})

describe('forest-canopy countTypeAnnotations', () => {
  it('counts type annotations', () => { expect(countTypeAnnotations('function f(x: number): string { return "a" }')).toBe(2) })
})

describe('forest-canopy countBranches', () => {
  it('counts branches', () => { expect(countBranches('if (x) {} else {}')).toBe(2) })
})

describe('forest-canopy maxNesting', () => {
  it('measures nesting', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

describe('forest-canopy countConsole', () => {
  it('counts console', () => { expect(countConsole('console.log("a")')).toBe(1) })
})

describe('forest-canopy countTodos', () => {
  it('counts todos', () => { expect(countTodos('// TODO fix')).toBe(1) })
})

describe('forest-canopy countJSDoc', () => {
  it('counts jsdoc', () => { expect(countJSDoc('/** doc */')).toBe(1) })
})

describe('forest-canopy extractImportPaths', () => {
  it('extracts paths', () => {
    const paths = extractImportPaths("import { a } from 'lodash'")
    expect(paths).toContain('lodash')
  })
  it('returns empty when none', () => { expect(extractImportPaths('const x = 1')).toEqual([]) })
})

// ─── Canopy Measurement ─────────────────────────────────────

describe('forest-canopy measureCanopy', () => {
  it('returns zero density for empty code', () => {
    const c = measureCanopy('')
    expect(c.density).toBe(0)
    expect(c.isSparse).toBe(true)
  })
  it('detects dense canopy', () => {
    const code = [
      '/** doc */',
      'export interface Config { x: number }',
      'export function validate(c: Config): boolean {',
      '  try { return c.x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const c = measureCanopy(code)
    expect(c.isDense).toBe(true)
    expect(c.density).toBeGreaterThanOrEqual(70)
  })
  it('detects gaps without exports', () => {
    const c = measureCanopy('function f() {}')
    expect(c.hasGaps).toBe(true)
    expect(c.gapCount).toBeGreaterThan(0)
  })
  it('detects tangles with deep nesting', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }'
    const c = measureCanopy(code)
    expect(c.hasTangles).toBe(true)
  })
  it('detects vines with many imports but no exports', () => {
    const code = "import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'\nimport { d } from 'w'"
    const c = measureCanopy(code)
    expect(c.hasVines).toBe(true)
  })
  it('computes layer height', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureCanopy(code)
    expect(c.layerHeight).toBeGreaterThan(0)
  })
})

// ─── Understory Measurement ─────────────────────────────────

describe('forest-canopy measureUnderstory', () => {
  it('returns zero health for empty code', () => {
    const u = measureUnderstory('')
    expect(u.health).toBe(0)
  })
  it('detects shrubs with typed functions', () => {
    const code = 'function helper(x: number): number { return x * 2 }'
    const u = measureUnderstory(code)
    expect(u.hasShrubs).toBe(true)
  })
  it('detects saplings without exports', () => {
    const u = measureUnderstory('function f() {}')
    expect(u.hasSaplings).toBe(true)
  })
  it('detects ferns with comments and functions', () => {
    const u = measureUnderstory('// helper\nfunction f() {}')
    expect(u.hasFerns).toBe(true)
  })
  it('detects deadwood with todos', () => {
    const u = measureUnderstory('// TODO fix')
    expect(u.hasDeadwood).toBe(true)
    expect(u.deadwoodCount).toBeGreaterThan(0)
  })
  it('detects healthy understory', () => {
    const code = [
      '/** doc */',
      'function validateData(x: number): boolean {',
      '  try { return x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const u = measureUnderstory(code)
    expect(u.isHealthy).toBe(true)
  })
})

// ─── Floor Measurement ──────────────────────────────────────

describe('forest-canopy measureFloor', () => {
  it('returns zero vitality for empty code', () => {
    const f = measureFloor('')
    expect(f.vitality).toBe(0)
  })
  it('detects rich soil with good coverage', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const f = measureFloor(code)
    expect(f.hasRichSoil).toBe(true)
  })
  it('detects leaf litter with many comments', () => {
    const code = '// a\n// b\n// c\n// d\nfunction f() {}'
    const f = measureFloor(code)
    expect(f.hasLeafLitter).toBe(true)
  })
  it('detects bare soil without error handling', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const f = measureFloor(code)
    expect(f.hasBareSoil).toBe(true)
  })
  it('detects fertile floor', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const f = measureFloor(code)
    expect(f.isFertile).toBe(true)
  })
  it('detects fungi with todos but no errors', () => {
    const f = measureFloor('// TODO fix this')
    expect(f.hasFungi).toBe(true)
  })
})

// ─── Root Measurement ───────────────────────────────────────

describe('forest-canopy measureRoots', () => {
  it('returns zero depth for empty code', () => {
    const r = measureRoots('')
    expect(r.depth).toBe(0)
    expect(r.spread).toBe(0)
  })
  it('detects tap root with imports, exports, and types', () => {
    const code = [
      "import { Config } from './types'",
      'export function validate(c: Config): number { return c.x }',
    ].join('\n')
    const r = measureRoots(code)
    expect(r.hasTapRoot).toBe(true)
  })
  it('detects fibrous roots with many imports', () => {
    const code = "import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'"
    const r = measureRoots(code)
    expect(r.hasFibrousRoots).toBe(true)
  })
  it('detects mycorrhizae with interfaces and imports', () => {
    const code = "import { x } from 'y'\ninterface I { z: number }"
    const r = measureRoots(code)
    expect(r.hasMycorrhizae).toBe(true)
    expect(r.mycorrhizaeCount).toBeGreaterThan(0)
  })
  it('detects invasive roots with deep nesting and imports', () => {
    const code = "import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'\nif (a) { if (b) { if (c) { if (d) { if (e) {} } } } }"
    const r = measureRoots(code)
    expect(r.isInvasive).toBe(true)
  })
  it('detects stable roots', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = measureRoots(code)
    expect(r.isStable).toBe(true)
  })
})

// ─── Biodiversity Measurement ────────────────────────────────

describe('forest-canopy measureBiodiversity', () => {
  it('returns empty species for empty code', () => {
    const b = measureBiodiversity('')
    expect(b.species).toEqual([])
    expect(b.variety).toBe(0)
  })
  it('detects diverse code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): boolean {',
      '  try { return x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const b = measureBiodiversity(code)
    expect(b.isDiverse).toBe(true)
    expect(b.variety).toBeGreaterThanOrEqual(4)
  })
  it('detects monoculture', () => {
    const b = measureBiodiversity('const x = 1')
    expect(b.isMonoculture).toBe(true)
  })
  it('detects invasive species with console and todos', () => {
    const b = measureBiodiversity("console.log('hi'); // TODO fix")
    expect(b.hasInvasiveSpecies).toBe(true)
    expect(b.invasiveCount).toBeGreaterThan(0)
  })
  it('detects endemic species with descriptive names and interfaces', () => {
    const code = 'interface Config { x: number }\nfunction validateConfig() {}'
    const b = measureBiodiversity(code)
    expect(b.hasEndemicSpecies).toBe(true)
  })
  it('computes richness', () => {
    const code = 'export function f(x: number): number { return x }'
    const b = measureBiodiversity(code)
    expect(b.richness).toBeGreaterThan(0)
  })
})

// ─── Light Measurement ──────────────────────────────────────

describe('forest-canopy measureLight', () => {
  it('returns zero penetration for empty code', () => {
    const l = measureLight('')
    expect(l.penetration).toBe(0)
  })
  it('detects well lit code', () => {
    const code = [
      '/** doc about this function */',
      '/** another doc */',
      'export function validate(x: number): number { return x }',
    ].join('\n')
    const l = measureLight(code)
    expect(l.isWellLit).toBe(true)
    expect(l.penetration).toBeGreaterThanOrEqual(65)
  })
  it('detects shadowed code', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5\nconst u = 6'
    const l = measureLight(code)
    expect(l.isShadowed).toBe(true)
  })
  it('detects sunbeams with multiple jsdoc', () => {
    const code = '/** a */\n/** b */\nfunction f() {}'
    const l = measureLight(code)
    expect(l.hasSunbeams).toBe(true)
    expect(l.sunbeamCount).toBeGreaterThanOrEqual(2)
  })
  it('detects deep shade without docs', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\nfunction e() {}\nfunction f() {}'
    const l = measureLight(code)
    expect(l.hasDeepShade).toBe(true)
  })
  it('detects dappled light with comments but no jsdoc', () => {
    const l = measureLight('// a comment\nfunction f() {}')
    expect(l.hasDappledLight).toBe(true)
  })
})

// ─── Growth Measurement ─────────────────────────────────────

describe('forest-canopy measureGrowth', () => {
  it('returns zero age for empty code', () => {
    const g = measureGrowth('')
    expect(g.age).toBe(0)
    expect(g.growthRate).toBe(0)
  })
  it('detects mature code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
      'interface Config { x: number }',
    ].join('\n')
    const g = measureGrowth(code)
    expect(g.isMature).toBe(true)
    expect(g.age).toBeGreaterThanOrEqual(70)
  })
  it('detects old growth', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
      'export function compute(y: string): string {',
      '  try { return y } catch (e) { return "" }',
      '}',
      'interface Config { x: number }',
    ].join('\n')
    const g = measureGrowth(code)
    expect(g.isOldGrowth).toBe(true)
  })
  it('detects growing code', () => {
    const code = 'export function f(x: number): number { return x }'
    const g = measureGrowth(code)
    expect(g.isGrowing || g.isMature).toBe(true)
  })
  it('detects dead code', () => {
    const g = measureGrowth('const x = 1')
    expect(g.isDead === true || g.age < 70).toBe(true)
  })
  it('detects new growth', () => {
    const g = measureGrowth('function f() {}')
    expect(g.hasNewGrowth).toBe(true)
  })
})

// ─── Classification ─────────────────────────────────────────

describe('forest-canopy classifyForestCondition', () => {
  it('classifies old-growth-forest', () => { expect(classifyForestCondition(90)).toBe('old-growth-forest') })
  it('classifies healthy-forest', () => { expect(classifyForestCondition(75)).toBe('healthy-forest') })
  it('classifies secondary-forest', () => { expect(classifyForestCondition(55)).toBe('secondary-forest') })
  it('classifies plantation', () => { expect(classifyForestCondition(40)).toBe('plantation') })
  it('classifies clear-cut', () => { expect(classifyForestCondition(20)).toBe('clear-cut') })
  it('classifies desert', () => { expect(classifyForestCondition(5)).toBe('desert') })
})

describe('forest-canopy classifyStandType', () => {
  it('classifies wasteland for empty', () => { expect(classifyStandType([])).toBe('wasteland') })
  it('classifies ancient-woodland', () => { expect(classifyStandType([{ qualityScore: 85 } as any])).toBe('ancient-woodland') })
  it('classifies nature-reserve', () => { expect(classifyStandType([{ qualityScore: 65 } as any])).toBe('nature-reserve') })
  it('classifies managed-forest', () => { expect(classifyStandType([{ qualityScore: 50 } as any])).toBe('managed-forest') })
  it('classifies scrubland', () => { expect(classifyStandType([{ qualityScore: 15 } as any])).toBe('scrubland') })
})

describe('forest-canopy classifyStandCondition', () => {
  it('classifies desert for empty', () => { expect(classifyStandCondition([])).toBe('desert') })
  it('classifies primeval-forest', () => { expect(classifyStandCondition([{ qualityScore: 85 } as any])).toBe('primeval-forest') })
})

describe('forest-canopy classifyEcologistGrade', () => {
  it('classifies chief-ecologist', () => { expect(classifyEcologistGrade(85)).toBe('chief-ecologist') })
  it('classifies forest-ecologist', () => { expect(classifyEcologistGrade(70)).toBe('forest-ecologist') })
  it('classifies botanist', () => { expect(classifyEcologistGrade(55)).toBe('botanist') })
  it('classifies gardener', () => { expect(classifyEcologistGrade(40)).toBe('gardener') })
  it('classifies logger', () => { expect(classifyEcologistGrade(20)).toBe('logger') })
  it('classifies arsonist', () => { expect(classifyEcologistGrade(5)).toBe('arsonist') })
})

// ─── Analyze Tree Crown ─────────────────────────────────────

describe('forest-canopy analyzeTreeCrown', () => {
  it('returns zero scores for empty content', () => {
    const c = analyzeTreeCrown('', 'empty.ts')
    expect(c.file).toBe('empty.ts')
    expect(c.qualityScore).toBe(0)
    expect(c.condition).toBe('desert')
  })
  it('returns proper crown for well-structured code', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const c = analyzeTreeCrown(code, 'validate.ts')
    expect(c.file).toBe('validate.ts')
    expect(c.canopyDensity).toBeGreaterThan(0)
    expect(c.qualityScore).toBeGreaterThan(0)
  })
  it('includes all sub-measurements', () => {
    const c = analyzeTreeCrown('function f() {}', 'f.ts')
    expect(c.canopy).toBeDefined()
    expect(c.understory).toBeDefined()
    expect(c.floor).toBeDefined()
    expect(c.roots).toBeDefined()
    expect(c.biodiversityMeasure).toBeDefined()
    expect(c.light).toBeDefined()
    expect(c.growth).toBeDefined()
  })
})

// ─── Analyze Forest Stand ───────────────────────────────────

describe('forest-canopy analyzeForestStand', () => {
  it('returns wasteland for empty crowns', () => {
    const s = analyzeForestStand([], 'empty')
    expect(s.standType).toBe('wasteland')
    expect(s.condition).toBe('desert')
  })
  it('aggregates crown scores', () => {
    const c1 = analyzeTreeCrown('export function f(x: number): number { return x }', 'a.ts')
    const c2 = analyzeTreeCrown('export function g(y: string): string { return y }', 'b.ts')
    const s = analyzeForestStand([c1, c2], 'src')
    expect(s.crowns).toHaveLength(2)
    expect(s.avgCanopyDensity).toBeGreaterThan(0)
  })
})

// ─── Build Result ───────────────────────────────────────────

describe('forest-canopy buildForestCanopyResult', () => {
  it('handles empty input', () => {
    const r = buildForestCanopyResult([], [], {})
    expect(r.crowns).toHaveLength(0)
    expect(r.stands).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.ecologistGrade).toBe('arsonist')
    expect(r.ecosystem.isHealthy).toBe(false)
  })
  it('handles single file', () => {
    const code = 'export function f(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = buildForestCanopyResult(['f.ts'], [code], {})
    expect(r.crowns).toHaveLength(1)
    expect(r.stats.healthiestTree).toBe('f.ts')
  })
  it('handles multiple files in same directory', () => {
    const code = 'export function f(x: number): number { return x }'
    const r = buildForestCanopyResult(['src/a.ts', 'src/b.ts'], [code, code], {})
    expect(r.stands).toHaveLength(1)
    expect(r.stands[0].directory).toBe('src')
  })
  it('handles missing contents', () => {
    const r = buildForestCanopyResult(['a.ts'], [], {})
    expect(r.crowns[0].qualityScore).toBe(0)
  })
  it('computes stats correctly', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildForestCanopyResult(['a.ts', 'b.ts'], [code, code], {})
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgCanopyDensity).toBeGreaterThan(0)
    expect(r.stats.overallHealth).toBeGreaterThan(0)
  })
})

// ─── Recommendations ────────────────────────────────────────

describe('forest-canopy generateRecommendations', () => {
  it('recommends reforestation for deserts', () => {
    const r = buildForestCanopyResult(['a.ts'], ['const x = 1'], {})
    if (r.stats.desertCount + r.stats.clearCutCount > 0) {
      expect(r.recommendations.some(rec => rec.includes('Reforestation') || rec.includes('foundational'))).toBe(true)
    }
  })
  it('recommends health for high quality', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildForestCanopyResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [code, code, code, code, code],
      {},
    )
    if (r.ecosystem.overallHealth >= 70) {
      expect(r.recommendations.some(rec => rec.includes('Healthy forest') || rec.includes('Healthy'))).toBe(true)
    }
  })
})

// ─── Format Helpers ─────────────────────────────────────────

describe('forest-canopy formatCrownTable', () => {
  it('handles empty crowns', () => { expect(formatCrownTable([])).toContain('No tree crowns') })
  it('formats crown table', () => {
    const c = analyzeTreeCrown('export function f(x: number): number { return x }', 'f.ts')
    expect(formatCrownTable([c])).toContain('f.ts')
  })
})

describe('forest-canopy formatStandTable', () => {
  it('handles empty stands', () => { expect(formatStandTable([])).toContain('No forest stands') })
  it('formats stand table', () => {
    const c = analyzeTreeCrown('function f() {}', 'f.ts')
    const s = analyzeForestStand([c], 'src')
    expect(formatStandTable([s])).toContain('src')
  })
})

describe('forest-canopy formatEcosystem', () => {
  it('formats ecosystem summary', () => {
    const r = buildForestCanopyResult(['a.ts'], ['function f() {}'], {})
    const result = formatEcosystem(r.ecosystem)
    expect(result).toContain('Ecosystem Summary')
  })
})

describe('forest-canopy formatStats', () => {
  it('formats statistics', () => {
    const r = buildForestCanopyResult(['a.ts'], ['function f() {}'], {})
    const result = formatStats(r.stats)
    expect(result).toContain('Forest Canopy Statistics')
  })
})

describe('forest-canopy formatRecommendations', () => {
  it('handles empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => { expect(formatRecommendations(['Plant trees'])).toContain('Plant trees') })
})

describe('forest-canopy formatForestCanopyJSON', () => {
  it('formats as JSON', () => {
    const r = buildForestCanopyResult(['a.ts'], ['function f() {}'], {})
    const result = formatForestCanopyJSON(r)
    const parsed = JSON.parse(result)
    expect(parsed.crowns).toHaveLength(1)
  })
})

// ─── Integration ────────────────────────────────────────────

describe('forest-canopy integration', () => {
  it('all scores are bounded 0-100', () => {
    const codes = [
      '',
      'const x = 1',
      'export function f(x: number): number { try { return x } catch (e) { return 0 } }',
      'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }',
      'console.log("a")',
      '// TODO fix',
    ]
    for (const code of codes) {
      const c = analyzeTreeCrown(code, 'test.ts')
      expect(c.canopyDensity).toBeGreaterThanOrEqual(0)
      expect(c.canopyDensity).toBeLessThanOrEqual(100)
      expect(c.understoryHealth).toBeGreaterThanOrEqual(0)
      expect(c.understoryHealth).toBeLessThanOrEqual(100)
      expect(c.forestFloorVitality).toBeGreaterThanOrEqual(0)
      expect(c.forestFloorVitality).toBeLessThanOrEqual(100)
      expect(c.rootSystemDepth).toBeGreaterThanOrEqual(0)
      expect(c.rootSystemDepth).toBeLessThanOrEqual(100)
      expect(c.biodiversity).toBeGreaterThanOrEqual(0)
      expect(c.biodiversity).toBeLessThanOrEqual(100)
      expect(c.lightPenetration).toBeGreaterThanOrEqual(0)
      expect(c.lightPenetration).toBeLessThanOrEqual(100)
      expect(c.qualityScore).toBeGreaterThanOrEqual(0)
      expect(c.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('produces valid JSON', () => {
    const r = buildForestCanopyResult(['a.ts'], ['const x = 1'], {})
    const json = formatForestCanopyJSON(r)
    const parsed = JSON.parse(json)
    expect(parsed.crowns[0].file).toBe('a.ts')
  })

  it('recommendations are unique', () => {
    const code = 'function f() {}'
    const r = buildForestCanopyResult(['a.ts', 'b.ts', 'c.ts'], [code, code, code], {})
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
    const r = buildForestCanopyResult(['good.ts', 'bad.ts'], [goodCode, badCode], {})
    expect(r.crowns[0].qualityScore).toBeGreaterThan(r.crowns[1].qualityScore)
  })
})
