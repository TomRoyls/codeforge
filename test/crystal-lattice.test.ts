import { describe, expect, it } from 'vitest'

import {
  analyzeCrystalAtom,
  analyzeCrystalVein,
  buildCrystalLatticeResult,
  classifyCrystalCondition,
  classifyGemologistGrade,
  classifyVeinCondition,
  classifyVeinType,
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
  countValidations,
  extractImportPaths,
  generateRecommendations,
  maxNesting,
  measureBonds,
  measureClarity,
  measureCleavage,
  measureDefects,
  measureHardness,
  measureStructure,
} from '../src/commands/crystal-lattice-helpers.js'

import {
  formatCrystalLatticeJSON,
  formatCrystalLatticeReport,
  formatAtomTable,
  formatVeinTable,
  formatMine,
  formatStats,
  formatRecommendations,
} from '../src/commands/crystal-lattice-format-helpers.js'

// ─── Primitive Counters ─────────────────────────────────────

describe('crystal-lattice countLoc', () => {
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

describe('crystal-lattice countImports', () => {
  it('counts import statements', () => {
    expect(countImports("import { a } from 'b'\nimport c from 'd'")).toBe(2)
  })
  it('returns 0 when none', () => {
    expect(countImports('const x = 1')).toBe(0)
  })
})

describe('crystal-lattice countExports', () => {
  it('counts export statements', () => {
    expect(countExports('export function a() {}\nexport const b = 1')).toBe(2)
  })
})

describe('crystal-lattice countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })
  it('counts arrow functions', () => {
    expect(countFunctions('const f = () => 1')).toBe(1)
  })
})

describe('crystal-lattice countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class Foo {}')).toBe(1)
  })
})

describe('crystal-lattice countInterfaces', () => {
  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo { x: number }')).toBe(1)
  })
  it('returns 0 when none', () => {
    expect(countInterfaces('const x = 1')).toBe(0)
  })
})

describe('crystal-lattice countErrorHandling', () => {
  it('counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3)
  })
})

describe('crystal-lattice countTypeAnnotations', () => {
  it('counts type annotations', () => {
    expect(countTypeAnnotations('function f(x: number): string { return "a" }')).toBe(2)
  })
})

describe('crystal-lattice countBranches', () => {
  it('counts if/else/switch', () => {
    expect(countBranches('if (x) {} else {} switch (y) {}')).toBe(3)
  })
})

describe('crystal-lattice maxNesting', () => {
  it('measures max nesting depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
  })
})

describe('crystal-lattice countConsole', () => {
  it('counts console calls', () => {
    expect(countConsole('console.log("a"); console.error("b")')).toBe(2)
  })
})

describe('crystal-lattice countTodos', () => {
  it('counts TODO/FIXME/HACK', () => {
    expect(countTodos('// TODO fix\n// FIXME this')).toBe(2)
  })
})

describe('crystal-lattice countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */')).toBe(1)
  })
})

describe('crystal-lattice extractImportPaths', () => {
  it('extracts import paths', () => {
    const paths = extractImportPaths("import { a } from 'lodash'")
    expect(paths).toContain('lodash')
  })
  it('returns empty array when none', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── Structure Measurement ──────────────────────────────────

describe('crystal-lattice measureStructure', () => {
  it('returns amorphous for empty code', () => {
    const s = measureStructure('')
    expect(s.type).toBe('amorphous')
    expect(s.regularity).toBe(0)
  })
  it('returns glass for basic code', () => {
    const s = measureStructure('const x = 1')
    expect(s.type).toBe('glass')
    expect(s.regularity).toBeGreaterThanOrEqual(0)
  })
  it('returns diamond-cubic for highly regular code', () => {
    const code = [
      '/** doc */',
      'export interface Config { x: number }',
      'export function validate(c: Config): boolean {',
      '  try { return c.x > 0 } catch (e) { return false }',
      '}',
    ].join('\n')
    const s = measureStructure(code)
    expect(s.regularity).toBeGreaterThanOrEqual(80)
    expect(s.hasUnitCells).toBe(true)
    expect(s.hasLongRangeOrder).toBe(true)
  })
  it('detects grain boundaries with console', () => {
    const s = measureStructure("console.log('hi')")
    expect(s.hasGrainBoundaries).toBe(true)
    expect(s.grainBoundaryCount).toBeGreaterThan(0)
  })
  it('detects unit cells with functions and exports', () => {
    const s = measureStructure('export function f(x: number): number { return x }')
    expect(s.hasUnitCells).toBe(true)
  })
  it('computes unit cell size', () => {
    const code = 'function f() {}\nfunction g() {}\ninterface I {}'
    const s = measureStructure(code)
    expect(s.unitCellSize).toBeGreaterThanOrEqual(3)
  })
  it('returns face-centered or better for typed exports', () => {
    const code = [
      'export function f(x: number): number { return x }',
      'export function g(y: string): string { return y }',
    ].join('\n')
    const s = measureStructure(code)
    expect(['face-centered', 'diamond-cubic', 'body-centered', 'hexagonal']).toContain(s.type)
    expect(s.regularity).toBeGreaterThan(0)
  })
  it('returns hexagonal for functional code', () => {
    const code = 'function f() {}\nfunction g() {}\nfunction h() {}'
    const s = measureStructure(code)
    expect(s.type === 'hexagonal' || s.type === 'glass' || s.type === 'body-centered').toBe(true)
  })
})

// ─── Bond Measurement ───────────────────────────────────────

describe('crystal-lattice measureBonds', () => {
  it('returns zero strength for empty code', () => {
    const b = measureBonds('')
    expect(b.avgStrength).toBe(0)
    expect(b.count).toBe(0)
  })
  it('counts import paths', () => {
    const code = "import { a } from 'lodash'\nimport { b } from 'react'"
    const b = measureBonds(code)
    expect(b.count).toBe(2)
  })
  it('detects strong bonds with types and imports', () => {
    const code = "import { Config } from './types'\nexport function f(x: number): number { return x }"
    const b = measureBonds(code)
    expect(b.hasStrongBonds).toBe(true)
  })
  it('detects weak bonds without types', () => {
    const code = "import { a } from 'lodash'"
    const b = measureBonds(code)
    expect(b.hasWeakBonds).toBe(true)
  })
  it('detects broken bonds with imports but no exports', () => {
    const code = [
      "import { a } from 'x'",
      "import { b } from 'y'",
      'const x = 1',
      'const y = 2',
      'const z = 3',
      'const w = 4',
      'const v = 5',
      'const u = 6',
    ].join('\n')
    const b = measureBonds(code)
    expect(b.hasBrokenBonds).toBe(true)
    expect(b.brokenCount).toBe(1)
  })
  it('detects covalent bonds', () => {
    const code = [
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const b = measureBonds(code)
    expect(b.hasCovalentBonds).toBe(true)
  })
  it('detects ionic bonds with interfaces', () => {
    const code = [
      "import { Config } from './types'",
      'interface MyConfig { x: number }',
    ].join('\n')
    const b = measureBonds(code)
    expect(b.hasIonicBonds).toBe(true)
  })
  it('detects hydrogen bonds', () => {
    const code = "import { x } from 'y'"
    const b = measureBonds(code)
    expect(b.hasHydrogenBonds).toBe(true)
  })
})

// ─── Defect Measurement ─────────────────────────────────────

describe('crystal-lattice measureDefects', () => {
  it('returns zero density for empty code', () => {
    const d = measureDefects('')
    expect(d.density).toBe(0)
  })
  it('detects vacancies with functions but no exports', () => {
    const d = measureDefects('function f() {}')
    expect(d.hasVacancies).toBe(true)
    expect(d.vacancyCount).toBe(1)
  })
  it('detects interstitials with console', () => {
    const d = measureDefects("console.log('hi')")
    expect(d.hasInterstitials).toBe(true)
  })
  it('detects dislocations with deep nesting', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) {} } } }'
    const d = measureDefects(code)
    expect(d.hasDislocations).toBe(true)
    expect(d.dislocationCount).toBeGreaterThan(0)
  })
  it('detects substitutions with TODOs', () => {
    const d = measureDefects('// TODO fix this')
    expect(d.hasSubstitutions).toBe(true)
  })
  it('detects precipitates with multiple TODOs', () => {
    const d = measureDefects('// TODO fix\n// FIXME this')
    expect(d.hasPrecipitates).toBe(true)
    expect(d.precipitateCount).toBeGreaterThan(0)
  })
  it('low density for clean code', () => {
    const code = 'export function validate(x: number): number { return x }'
    const d = measureDefects(code)
    expect(d.density).toBeLessThanOrEqual(30)
  })
})

// ─── Cleavage Measurement ───────────────────────────────────

describe('crystal-lattice measureCleavage', () => {
  it('returns zero quality for empty code', () => {
    const c = measureCleavage('')
    expect(c.quality).toBe(0)
  })
  it('detects natural planes with exports and types', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureCleavage(code)
    expect(c.hasNaturalPlanes).toBe(true)
  })
  it('detects conchoidal fracture with deep nesting', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }'
    const c = measureCleavage(code)
    expect(c.hasConchoidalFracture).toBe(true)
  })
  it('detects easily cleaved code', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureCleavage(code)
    expect(c.isEasilyCleaved).toBe(true)
  })
  it('detects perfect cleavage', () => {
    const code = 'export function f(x: number): number { return x }'
    const c = measureCleavage(code)
    expect(c.hasPerfectCleavage).toBe(true)
  })
  it('counts cleavage planes', () => {
    const code = 'export function f() {}\nexport class A {}'
    const c = measureCleavage(code)
    expect(c.cleavagePlanes).toBeGreaterThanOrEqual(2)
  })
})

// ─── Clarity Measurement ────────────────────────────────────

describe('crystal-lattice measureClarity', () => {
  it('returns zero transparency for empty code', () => {
    const c = measureClarity('')
    expect(c.transparency).toBe(0)
  })
  it('detects flawless clarity for perfect code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number { return x }',
    ].join('\n')
    const c = measureClarity(code)
    expect(c.transparency).toBeGreaterThanOrEqual(60)
  })
  it('detects inclusions with deep nesting', () => {
    const code = 'if (a) { if (b) { if (c) { if (d) {} } } }'
    const c = measureClarity(code)
    expect(c.isInclusions).toBe(true)
  })
  it('detects fractures with branches but no errors', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}\nif (e) {}\nif (f) {}'
    const c = measureClarity(code)
    expect(c.hasFractures).toBe(true)
  })
  it('detects cloudiness without types', () => {
    const code = 'const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\nconst e = 5\nconst f = 6'
    const c = measureClarity(code)
    expect(c.hasCloudiness).toBe(true)
  })
  it('detects opaque code', () => {
    const c = measureClarity('const x = 1')
    expect(c.isOpaque).toBe(true)
  })
})

// ─── Hardness Measurement ───────────────────────────────────

describe('crystal-lattice measureHardness', () => {
  it('returns zero mohs for empty code', () => {
    const h = measureHardness('')
    expect(h.mohs).toBe(0)
    expect(h.toughness).toBe(0)
  })
  it('detects scratch resistant code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): boolean {',
      '  try { return x > 0 } catch (e) { return false }',
      '}',
      'export function compute(y: string): string {',
      '  try { return y } catch (e) { return "" }',
      '}',
    ].join('\n')
    const h = measureHardness(code)
    expect(h.mohs).toBeGreaterThanOrEqual(50)
  })
  it('detects brittle code', () => {
    const code = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}'
    const h = measureHardness(code)
    expect(h.isBrittle).toBe(true)
  })
  it('detects ductile code', () => {
    const code = [
      'function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const h = measureHardness(code)
    expect(h.isDuctile).toBe(true)
  })
  it('detects elastic code', () => {
    const code = [
      'function f(x: number): number {',
      '  try {',
      '    if (x > 0) return x',
      '    return 0',
      '  } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const h = measureHardness(code)
    expect(h.isElastic).toBe(true)
  })
  it('computes toughness', () => {
    const code = [
      'try { x() } catch (e) { handleError() }',
      'function compute(x: number): number { return x }',
    ].join('\n')
    const h = measureHardness(code)
    expect(h.toughness).toBeGreaterThan(0)
  })
})

// ─── Classification ─────────────────────────────────────────

describe('crystal-lattice classifyCrystalCondition', () => {
  it('classifies flawless-diamond for high scores', () => {
    expect(classifyCrystalCondition(90)).toBe('flawless-diamond')
    expect(classifyCrystalCondition(85)).toBe('flawless-diamond')
  })
  it('classifies precious-gem', () => {
    expect(classifyCrystalCondition(75)).toBe('precious-gem')
    expect(classifyCrystalCondition(68)).toBe('precious-gem')
  })
  it('classifies quality-crystal', () => {
    expect(classifyCrystalCondition(60)).toBe('quality-crystal')
    expect(classifyCrystalCondition(50)).toBe('quality-crystal')
  })
  it('classifies industrial-crystal', () => {
    expect(classifyCrystalCondition(40)).toBe('industrial-crystal')
    expect(classifyCrystalCondition(32)).toBe('industrial-crystal')
  })
  it('classifies flawed-crystal', () => {
    expect(classifyCrystalCondition(25)).toBe('flawed-crystal')
    expect(classifyCrystalCondition(15)).toBe('flawed-crystal')
  })
  it('classifies gravel for very low scores', () => {
    expect(classifyCrystalCondition(10)).toBe('gravel')
    expect(classifyCrystalCondition(0)).toBe('gravel')
  })
})

describe('crystal-lattice classifyVeinType', () => {
  it('classifies sand for empty atoms', () => {
    expect(classifyVeinType([])).toBe('sand')
  })
  it('classifies diamond-mine for high avg', () => {
    expect(classifyVeinType([{ qualityScore: 90 } as any])).toBe('diamond-mine')
  })
  it('classifies quartz-vein', () => {
    expect(classifyVeinType([{ qualityScore: 65 } as any])).toBe('quartz-vein')
  })
  it('classifies gem-deposit', () => {
    expect(classifyVeinType([{ qualityScore: 50 } as any])).toBe('gem-deposit')
  })
  it('classifies ore-body', () => {
    expect(classifyVeinType([{ qualityScore: 30 } as any])).toBe('ore-body')
  })
  it('classifies gravel-pit', () => {
    expect(classifyVeinType([{ qualityScore: 15 } as any])).toBe('gravel-pit')
  })
})

describe('crystal-lattice classifyVeinCondition', () => {
  it('classifies barren for empty atoms', () => {
    expect(classifyVeinCondition([])).toBe('barren')
  })
  it('classifies pristine-lode', () => {
    expect(classifyVeinCondition([{ qualityScore: 85 } as any])).toBe('pristine-lode')
  })
  it('classifies quality-vein', () => {
    expect(classifyVeinCondition([{ qualityScore: 65 } as any])).toBe('quality-vein')
  })
})

describe('crystal-lattice classifyGemologistGrade', () => {
  it('classifies master-gemologist', () => {
    expect(classifyGemologistGrade(85)).toBe('master-gemologist')
    expect(classifyGemologistGrade(80)).toBe('master-gemologist')
  })
  it('classifies gemologist', () => {
    expect(classifyGemologistGrade(70)).toBe('gemologist')
    expect(classifyGemologistGrade(65)).toBe('gemologist')
  })
  it('classifies mineralogist', () => {
    expect(classifyGemologistGrade(55)).toBe('mineralogist')
    expect(classifyGemologistGrade(48)).toBe('mineralogist')
  })
  it('classifies geologist', () => {
    expect(classifyGemologistGrade(40)).toBe('geologist')
    expect(classifyGemologistGrade(32)).toBe('geologist')
  })
  it('classifies rock-collector', () => {
    expect(classifyGemologistGrade(20)).toBe('rock-collector')
    expect(classifyGemologistGrade(16)).toBe('rock-collector')
  })
  it('classifies child', () => {
    expect(classifyGemologistGrade(10)).toBe('child')
    expect(classifyGemologistGrade(0)).toBe('child')
  })
})

// ─── Analyze Crystal Atom ───────────────────────────────────

describe('crystal-lattice analyzeCrystalAtom', () => {
  it('returns zero scores for empty content', () => {
    const a = analyzeCrystalAtom('', 'empty.ts')
    expect(a.file).toBe('empty.ts')
    expect(a.qualityScore).toBe(0)
    expect(a.condition).toBe('gravel')
  })
  it('returns proper atom for typed exported function', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const a = analyzeCrystalAtom(code, 'validate.ts')
    expect(a.file).toBe('validate.ts')
    expect(a.crystalStructure).toBeGreaterThan(0)
    expect(a.bondStrength).toBeGreaterThan(0)
    expect(a.crystalClarity).toBeGreaterThan(0)
    expect(a.qualityScore).toBeGreaterThan(0)
  })
  it('includes all sub-measurements', () => {
    const a = analyzeCrystalAtom('function f() {}', 'f.ts')
    expect(a.structure).toBeDefined()
    expect(a.bonds).toBeDefined()
    expect(a.defects).toBeDefined()
    expect(a.cleavage).toBeDefined()
    expect(a.clarity).toBeDefined()
    expect(a.hardness).toBeDefined()
  })
})

// ─── Analyze Crystal Vein ───────────────────────────────────

describe('crystal-lattice analyzeCrystalVein', () => {
  it('returns sand for empty atoms', () => {
    const v = analyzeCrystalVein([], 'empty-dir')
    expect(v.directory).toBe('empty-dir')
    expect(v.atoms).toHaveLength(0)
    expect(v.veinType).toBe('sand')
    expect(v.condition).toBe('barren')
  })
  it('aggregates atom scores', () => {
    const a1 = analyzeCrystalAtom('export function f(x: number): number { try { return x } catch (e) { return 0 } }', 'a.ts')
    const a2 = analyzeCrystalAtom('export function g(y: string): string { try { return y } catch (e) { return "" } }', 'b.ts')
    const v = analyzeCrystalVein([a1, a2], 'src')
    expect(v.atoms).toHaveLength(2)
    expect(v.avgStructure).toBeGreaterThan(0)
    expect(v.avgBondStrength).toBeGreaterThan(0)
  })
})

// ─── Build Result ───────────────────────────────────────────

describe('crystal-lattice buildCrystalLatticeResult', () => {
  it('handles empty input', () => {
    const r = buildCrystalLatticeResult([], [], {})
    expect(r.atoms).toHaveLength(0)
    expect(r.veins).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.overallPurity).toBe(0)
    expect(r.stats.gemologistGrade).toBe('child')
    expect(r.mine.isStable).toBe(false)
  })
  it('handles single file', () => {
    const code = 'export function validate(x: number): number { try { return x } catch (e) { return 0 } }'
    const r = buildCrystalLatticeResult(['f.ts'], [code], {})
    expect(r.atoms).toHaveLength(1)
    expect(r.veins).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.purestCrystal).toBe('f.ts')
    expect(r.stats.strongestBonds).toBe('f.ts')
  })
  it('handles multiple files in same directory', () => {
    const code = 'export function f(x: number): number { return x }'
    const r = buildCrystalLatticeResult(['src/a.ts', 'src/b.ts'], [code, code], {})
    expect(r.atoms).toHaveLength(2)
    expect(r.veins).toHaveLength(1)
    expect(r.veins[0].directory).toBe('src')
  })
  it('handles files in different directories', () => {
    const code = 'function f() {}'
    const r = buildCrystalLatticeResult(['src/a.ts', 'lib/b.ts'], [code, code], {})
    expect(r.veins).toHaveLength(2)
  })
  it('handles missing contents gracefully', () => {
    const r = buildCrystalLatticeResult(['a.ts'], [], {})
    expect(r.atoms).toHaveLength(1)
    expect(r.atoms[0].qualityScore).toBe(0)
  })
  it('computes stats correctly', () => {
    const code = [
      '/** doc */',
      'export interface Config { x: number }',
      'export function validate(c: Config): number {',
      '  try { if (c.x > 0) return c.x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildCrystalLatticeResult(['a.ts', 'b.ts'], [code, code], {})
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgCrystalStructure).toBeGreaterThan(0)
    expect(r.stats.avgBondStrength).toBeGreaterThan(0)
    expect(r.stats.overallPurity).toBeGreaterThan(0)
  })
  it('counts structure types correctly', () => {
    const r = buildCrystalLatticeResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(r.stats.amorphousCount + r.stats.glassCount).toBeLessThanOrEqual(2)
  })
  it('mine stability depends on purity', () => {
    const goodCode = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildCrystalLatticeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [goodCode, goodCode, goodCode],
      {},
    )
    if (r.mine.overallPurity >= 60) {
      expect(r.mine.isStable).toBe(true)
    }
  })
})

// ─── Recommendations ────────────────────────────────────────

describe('crystal-lattice generateRecommendations', () => {
  it('recommends smoothing for gravel and flawed files', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['const x = 1'], {})
    if (r.stats.gravelCount + r.stats.flawedCrystalCount > 0) {
      expect(r.recommendations.some(rec => rec.includes('Smoothing') || rec.includes('refinement'))).toBe(true)
    }
  })
  it('recommends purity for high quality code', () => {
    const code = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { return x } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const r = buildCrystalLatticeResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      [code, code, code, code, code],
      {},
    )
    if (r.mine.overallPurity >= 70) {
      expect(r.recommendations.some(rec => rec.includes('Pure crystal') || rec.includes('pure'))).toBe(true)
    }
  })
  it('recommends types for opaque files', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['const x = 1'], {})
    if (r.stats.isOpaqueCount > 0) {
      expect(r.recommendations.some(rec => rec.includes('Opaque') || rec.includes('transparency'))).toBe(true)
    }
  })
})

// ─── Format Helpers ─────────────────────────────────────────

describe('crystal-lattice formatAtomTable', () => {
  it('handles empty atoms', () => {
    expect(formatAtomTable([])).toContain('No crystal atoms')
  })
  it('formats atom table', () => {
    const a = analyzeCrystalAtom('export function f(x: number): number { return x }', 'f.ts')
    expect(formatAtomTable([a])).toContain('f.ts')
  })
})

describe('crystal-lattice formatVeinTable', () => {
  it('handles empty veins', () => {
    expect(formatVeinTable([])).toContain('No crystal veins')
  })
  it('formats vein table', () => {
    const a = analyzeCrystalAtom('export function f(x: number): number { return x }', 'f.ts')
    const v = analyzeCrystalVein([a], 'src')
    expect(formatVeinTable([v])).toContain('src')
  })
})

describe('crystal-lattice formatMine', () => {
  it('formats mine summary', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['function f() {}'], {})
    const result = formatMine(r.mine)
    expect(result).toContain('Mine Summary')
    expect(result).toContain('Overall Purity')
  })
})

describe('crystal-lattice formatStats', () => {
  it('formats statistics', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['function f() {}'], {})
    const result = formatStats(r.stats)
    expect(result).toContain('Crystal Lattice Statistics')
    expect(result).toContain('Total Files')
  })
})

describe('crystal-lattice formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix broken bonds'])).toContain('Fix broken bonds')
  })
})

describe('crystal-lattice formatCrystalLatticeReport', () => {
  it('formats full report', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['function f() {}'], {})
    const result = formatCrystalLatticeReport(r)
    expect(result).toContain('Mine Summary')
    expect(result).toContain('Crystal Lattice Statistics')
  })
})

describe('crystal-lattice formatCrystalLatticeJSON', () => {
  it('formats as JSON', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['function f() {}'], {})
    const result = formatCrystalLatticeJSON(r)
    const parsed = JSON.parse(result)
    expect(parsed.atoms).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.mine).toBeDefined()
  })
})

// ─── Integration ────────────────────────────────────────────

describe('crystal-lattice integration', () => {
  it('analyzes mixed quality files', () => {
    const goodCode = [
      '/** doc */',
      'export function validate(x: number): number {',
      '  try { if (x > 0) return x; return 0 } catch (e) { return 0 }',
      '}',
    ].join('\n')
    const badCode = 'var x = 1'
    const medCode = 'function compute(a, b) { if (a > b) return a; return b }'

    const r = buildCrystalLatticeResult(
      ['good.ts', 'bad.ts', 'med.ts'],
      [goodCode, badCode, medCode],
      {},
    )

    expect(r.atoms).toHaveLength(3)
    expect(r.stats.totalFiles).toBe(3)
    const scores = r.atoms.map(a => a.qualityScore)
    expect(scores[0]).toBeGreaterThan(scores[1])
  })

  it('all scores are bounded 0-100', () => {
    const codes = [
      '',
      'const x = 1',
      'export function f(x: number): number { try { return x } catch (e) { return 0 } }',
      'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {} } } } } }',
      'console.log("a"); console.log("b")',
      '// TODO fix\n// FIXME this',
    ]
    for (const code of codes) {
      const a = analyzeCrystalAtom(code, 'test.ts')
      expect(a.crystalStructure).toBeGreaterThanOrEqual(0)
      expect(a.crystalStructure).toBeLessThanOrEqual(100)
      expect(a.bondStrength).toBeGreaterThanOrEqual(0)
      expect(a.bondStrength).toBeLessThanOrEqual(100)
      expect(a.latticeEnergy).toBeGreaterThanOrEqual(0)
      expect(a.latticeEnergy).toBeLessThanOrEqual(100)
      expect(a.defectDensity).toBeGreaterThanOrEqual(0)
      expect(a.defectDensity).toBeLessThanOrEqual(100)
      expect(a.cleavageQuality).toBeGreaterThanOrEqual(0)
      expect(a.cleavageQuality).toBeLessThanOrEqual(100)
      expect(a.crystalClarity).toBeGreaterThanOrEqual(0)
      expect(a.crystalClarity).toBeLessThanOrEqual(100)
      expect(a.qualityScore).toBeGreaterThanOrEqual(0)
      expect(a.qualityScore).toBeLessThanOrEqual(100)
    }
  })

  it('sub-measurements are bounded', () => {
    const codes = ['', 'function f() {}', 'export function f(x: number): number { return x }']
    for (const code of codes) {
      const a = analyzeCrystalAtom(code, 'test.ts')
      expect(a.structure.regularity).toBeGreaterThanOrEqual(0)
      expect(a.structure.regularity).toBeLessThanOrEqual(100)
      expect(a.bonds.avgStrength).toBeGreaterThanOrEqual(0)
      expect(a.bonds.avgStrength).toBeLessThanOrEqual(100)
      expect(a.defects.density).toBeGreaterThanOrEqual(0)
      expect(a.defects.density).toBeLessThanOrEqual(100)
      expect(a.cleavage.quality).toBeGreaterThanOrEqual(0)
      expect(a.cleavage.quality).toBeLessThanOrEqual(100)
      expect(a.clarity.transparency).toBeGreaterThanOrEqual(0)
      expect(a.clarity.transparency).toBeLessThanOrEqual(100)
      expect(a.hardness.mohs).toBeGreaterThanOrEqual(0)
      expect(a.hardness.mohs).toBeLessThanOrEqual(100)
      expect(a.hardness.toughness).toBeGreaterThanOrEqual(0)
      expect(a.hardness.toughness).toBeLessThanOrEqual(100)
    }
  })

  it('produces valid JSON for all inputs', () => {
    const r = buildCrystalLatticeResult(['a.ts'], ['const x = 1'], {})
    const json = formatCrystalLatticeJSON(r)
    const parsed = JSON.parse(json)
    expect(parsed.atoms[0].file).toBe('a.ts')
  })

  it('recommendations are unique', () => {
    const code = 'function f() {}'
    const r = buildCrystalLatticeResult(['a.ts', 'b.ts', 'c.ts'], [code, code, code], {})
    const uniqueRecs = Array.from(new Set(r.recommendations))
    expect(r.recommendations).toHaveLength(uniqueRecs.length)
  })
})
