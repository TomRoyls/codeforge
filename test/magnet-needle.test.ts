import { describe, expect, it } from 'vitest'
import {
  analyzeMagneticField,
  analyzeMagnetPole,
  buildMagnetNeedleResult,
  classifyFieldType,
  classifyFieldCondition,
  classifyPhysicistGrade,
  classifyPoleCondition,
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
  extractImportPaths,
  maxNesting,
  measureCoercivityMeasure,
  measureCoupling,
  measureField,
  measureMagnet,
  measurePermeability,
  measurePole,
  measureRemanence,
} from '../src/commands/magnet-needle-helpers.js'
import {
  formatMagnetNeedleJSON,
  formatMagnetNeedleReport,
  formatPoleTable,
  formatFieldTable,
  formatLab,
  formatStats,
  formatRecommendations,
} from '../src/commands/magnet-needle-format-helpers.js'

// ─── countLoc ────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines', () => { expect(countLoc('a\nb\nc')).toBe(3) })
  it('returns 0 for empty', () => { expect(countLoc('')).toBe(0) })
})

describe('countImports', () => {
  it('counts imports', () => { expect(countImports('import { x } from "y"')).toBe(1) })
  it('returns 0 when none', () => { expect(countImports('const x = 1')).toBe(0) })
})

describe('countExports', () => {
  it('counts exports', () => { expect(countExports('export function a() {}')).toBe(1) })
})

describe('countFunctions', () => {
  it('counts functions', () => { expect(countFunctions('function hello() {}')).toBe(1) })
  it('counts arrow functions', () => { expect(countFunctions('const x = () => {}')).toBe(1) })
})

describe('countClasses', () => {
  it('counts classes', () => { expect(countClasses('class A {} class B {}')).toBe(2) })
})

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => { expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3) })
})

describe('countTypeAnnotations', () => {
  it('counts types', () => { expect(countTypeAnnotations('function f(x: string): number {}')).toBe(2) })
})

describe('countBranches', () => {
  it('counts branches', () => { expect(countBranches('if (x) {} else {}')).toBe(2) })
})

describe('countConsole', () => {
  it('counts console', () => { expect(countConsole('console.log("a")')).toBe(1) })
})

describe('countComments', () => {
  it('counts comments', () => { expect(countComments('// hello')).toBe(1) })
})

describe('countTodos', () => {
  it('counts todos', () => { expect(countTodos('// TODO fix')).toBe(1) })
})

describe('countJSDoc', () => {
  it('counts jsdoc', () => { expect(countJSDoc('/** docs */')).toBe(1) })
})

describe('maxNesting', () => {
  it('measures nesting', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

// ─── extractImportPaths ──────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts import paths', () => {
    const paths = extractImportPaths('import { x } from "./utils"\nimport { y } from "./helpers"')
    expect(paths).toEqual(['./utils', './helpers'])
  })
  it('returns empty when no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── measureMagnet ───────────────────────────────────────

describe('measureMagnet', () => {
  it('detects permanent magnet with imports and exports', () => {
    const m = measureMagnet('import { x } from "y"\nexport function f(): number { return x }')
    expect(m.isPermanent).toBe(true)
  })
  it('detects temporary magnet with only imports', () => {
    const m = measureMagnet('import { x } from "y"\nconst y = x')
    expect(m.isTemporary).toBe(true)
  })
  it('detects demagnetized with no coupling', () => {
    const m = measureMagnet('const x = 1')
    expect(m.isDemagnetized).toBe(true)
    expect(m.type).toBe('lodestone')
  })
  it('detects neodymium for high strength', () => {
    const code = '/** docs */\nimport { x } from "y"\nexport function calc(val: number): number { try { return val } catch (e) { return 0 } }'
    const m = measureMagnet(code)
    expect(m.type).toBe('neodymium')
  })
  it('returns strength 0 for empty', () => {
    const m = measureMagnet('')
    expect(m.strength).toBe(0)
  })
})

// ─── measureField ────────────────────────────────────────

describe('measureField', () => {
  it('detects strong field', () => {
    const code = 'import { a, b } from "x"\nimport { c } from "y"\nexport function f() {}'
    const f = measureField(code)
    expect(f.hasStrongField).toBe(true)
  })
  it('detects weak field', () => {
    const f = measureField('import { x } from "y"')
    expect(f.hasWeakField).toBe(true)
  })
  it('detects leakage with console', () => {
    const f = measureField('console.log("x")\nexport function f() {}')
    expect(f.hasLeakage).toBe(true)
    expect(f.leakagePoints).toContain('console-leak')
  })
  it('detects dipole with balanced imports/exports', () => {
    const f = measureField('import { x } from "y"\nexport function f() {}')
    expect(f.shape).toBe('dipole')
  })
  it('detects contained field', () => {
    const f = measureField('import { x } from "y"\nexport function f() {}')
    expect(f.isContained).toBe(true)
  })
  it('returns range 0 for empty', () => {
    const f = measureField('')
    expect(f.range).toBe(0)
  })
})

// ─── measureCoupling ─────────────────────────────────────

describe('measureCoupling', () => {
  it('detects strong attraction with many imports', () => {
    const code = 'import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"'
    const c = measureCoupling(code)
    expect(c.hasStrongAttraction).toBe(true)
  })
  it('detects neutral with no coupling', () => {
    const c = measureCoupling('const x = 1')
    expect(c.isNeutral).toBe(true)
  })
  it('detects attractedTo paths', () => {
    const c = measureCoupling('import { x } from "./utils"')
    expect(c.attractedTo).toContain('./utils')
  })
  it('calculates net force', () => {
    const c = measureCoupling('import { x } from "y"')
    expect(c.netForce).toBeLessThanOrEqual(c.attractiveForce)
  })
  it('returns neutral for empty', () => {
    const c = measureCoupling('')
    expect(c.isNeutral).toBe(true)
  })
})

// ─── measureCoercivity ───────────────────────────────────

describe('measureCoercivityMeasure', () => {
  it('detects hard magnet with high resistance', () => {
    const code = 'export function f(x: number): number { if (x > 0) { try { return x } catch (e) { return 0 } } return 0 }'
    const c = measureCoercivityMeasure(code)
    expect(c.isHardMagnet).toBe(true)
  })
  it('detects soft magnet with low resistance', () => {
    const c = measureCoercivityMeasure('export function f() { return 1 }')
    expect(c.isSoftMagnet).toBe(true)
  })
  it('detects hysteresis with branches and errors', () => {
    const c = measureCoercivityMeasure('if (x) { if (y) { if (z) { if (w) { try {} catch (e) {} } } } }')
    expect(c.hasHysteresis).toBe(true)
  })
  it('detects stability with errors and no todos', () => {
    const c = measureCoercivityMeasure('try {} catch (e) {}')
    expect(c.isStable).toBe(true)
  })
  it('returns resistance 0 for empty', () => {
    const c = measureCoercivityMeasure('')
    expect(c.resistance).toBe(0)
  })
})

// ─── measureRemanence ────────────────────────────────────

describe('measureRemanence', () => {
  it('detects high remanence with exports and types', () => {
    const r = measureRemanence('/** calc */\nexport function f(x: number): number { return x }')
    expect(r.hasHighRemanence).toBe(true)
  })
  it('detects low remanence for simple code', () => {
    const r = measureRemanence('function getValue() { return 1 }')
    expect(r.hasLowRemanence).toBe(true)
  })
  it('detects imprint with jsdoc', () => {
    const r = measureRemanence('/** docs */\nfunction f() {}')
    expect(r.hasImprint).toBe(true)
  })
  it('returns strength 0 for empty', () => {
    const r = measureRemanence('')
    expect(r.strength).toBe(0)
  })
})

// ─── measurePermeability ─────────────────────────────────

describe('measurePermeability', () => {
  it('detects high permeability', () => {
    const p = measurePermeability('export function f(x: number): number { try { return x } catch (e) { return 0 } }')
    expect(p.hasHighPermeability).toBe(true)
  })
  it('detects low permeability', () => {
    const deep = 'if (x) { if (y) { if (z) { if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { } } } } } } } } }'
    const p = measurePermeability(deep)
    expect(p.hasLowPermeability).toBe(true)
  })
  it('detects shielding', () => {
    const p = measurePermeability('function f(x: number): number { try { return x } catch (e) { return 0 } }')
    expect(p.hasShielding).toBe(true)
  })
  it('returns ease 0 for empty', () => {
    const p = measurePermeability('')
    expect(p.ease).toBe(0)
  })
})

// ─── measurePole ─────────────────────────────────────────

describe('measurePole', () => {
  it('detects north dominant with exports', () => {
    const p = measurePole('export function a() {}\nexport function b() {}')
    expect(p.dominantPole).toBe('north')
  })
  it('detects south dominant with imports', () => {
    const p = measurePole('import { x } from "y"')
    expect(p.dominantPole).toBe('south')
  })
  it('detects balanced with equal', () => {
    const p = measurePole('import { x } from "y"\nexport function f() {}')
    expect(p.dominantPole).toBe('balanced')
    expect(p.isDipole).toBe(true)
  })
  it('detects monopole', () => {
    const p = measurePole('import { x } from "y"')
    expect(p.isMonopole).toBe(true)
  })
  it('returns balanced for empty', () => {
    const p = measurePole('')
    expect(p.dominantPole).toBe('balanced')
  })
})

// ─── classifyPoleCondition ───────────────────────────────

describe('classifyPoleCondition', () => {
  it('superconductor', () => { expect(classifyPoleCondition(90)).toBe('superconductor') })
  it('strong-magnet', () => { expect(classifyPoleCondition(70)).toBe('strong-magnet') })
  it('ferromagnetic', () => { expect(classifyPoleCondition(55)).toBe('ferromagnetic') })
  it('paramagnetic', () => { expect(classifyPoleCondition(35)).toBe('paramagnetic') })
  it('diamagnetic', () => { expect(classifyPoleCondition(20)).toBe('diamagnetic') })
  it('insulator', () => { expect(classifyPoleCondition(5)).toBe('insulator') })
})

// ─── classifyPhysicistGrade ──────────────────────────────

describe('classifyPhysicistGrade', () => {
  it('nobel-laureate', () => { expect(classifyPhysicistGrade(85)).toBe('nobel-laureate') })
  it('physicist', () => { expect(classifyPhysicistGrade(70)).toBe('physicist') })
  it('engineer', () => { expect(classifyPhysicistGrade(50)).toBe('engineer') })
  it('technician', () => { expect(classifyPhysicistGrade(35)).toBe('technician') })
  it('student', () => { expect(classifyPhysicistGrade(20)).toBe('student') })
  it('layman', () => { expect(classifyPhysicistGrade(5)).toBe('layman') })
})

// ─── classifyFieldType / classifyFieldCondition ──────────

describe('classifyFieldType', () => {
  it('returns demagnetized for empty', () => { expect(classifyFieldType([])).toBe('demagnetized') })
})

describe('classifyFieldCondition', () => {
  it('returns degaussed for empty', () => { expect(classifyFieldCondition([])).toBe('degaussed') })
})

// ─── analyzeMagnetPole ───────────────────────────────────

describe('analyzeMagnetPole', () => {
  it('returns complete MagnetPole', () => {
    const pole = analyzeMagnetPole('export function f(x: number): number { return x }', 'f.ts')
    expect(pole.file).toBe('f.ts')
    expect(pole.magneticStrength).toBeGreaterThanOrEqual(0)
    expect(pole.fieldRange).toBeGreaterThanOrEqual(0)
    expect(pole.coercivity).toBeGreaterThanOrEqual(0)
    expect(pole.remanence).toBeGreaterThanOrEqual(0)
    expect(pole.permeability).toBeGreaterThanOrEqual(0)
    expect(pole.qualityScore).toBeGreaterThanOrEqual(0)
    expect(pole.condition).toBeDefined()
    expect(pole.magnet).toBeDefined()
    expect(pole.field).toBeDefined()
    expect(pole.coupling).toBeDefined()
    expect(pole.coercivityDetail).toBeDefined()
    expect(pole.remanenceDetail).toBeDefined()
    expect(pole.permeabilityDetail).toBeDefined()
    expect(pole.pole).toBeDefined()
  })
  it('returns qualityScore 0 for empty', () => {
    expect(analyzeMagnetPole('', 'empty.ts').qualityScore).toBe(0)
  })
})

// ─── analyzeMagneticField ────────────────────────────────

describe('analyzeMagneticField', () => {
  it('returns complete MagneticField', () => {
    const poles = [
      analyzeMagnetPole('export function a(x: number): number { return x }', 'a.ts'),
      analyzeMagnetPole('export function b(): string { return "hi" }', 'b.ts'),
    ]
    const field = analyzeMagneticField(poles, 'src')
    expect(field.directory).toBe('src')
    expect(field.poles).toHaveLength(2)
    expect(field.fieldType).toBeDefined()
    expect(field.condition).toBeDefined()
  })
  it('handles empty poles', () => {
    const field = analyzeMagneticField([], 'empty')
    expect(field.avgStrength).toBe(0)
    expect(field.fieldType).toBe('demagnetized')
  })
})

// ─── buildMagnetNeedleResult ──────────────────────────────

describe('buildMagnetNeedleResult', () => {
  it('returns complete result', () => {
    const result = buildMagnetNeedleResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a(x: number): number { return x }', 'export function b(): string { return "hi" }'],
      {},
    )
    expect(result.poles).toHaveLength(2)
    expect(result.fields).toHaveLength(1)
    expect(result.lab).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })
  it('handles empty input', () => {
    const result = buildMagnetNeedleResult([], [], {})
    expect(result.poles).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.lab.isBalanced).toBe(false)
  })
  it('groups by directory', () => {
    const result = buildMagnetNeedleResult(
      ['src/a.ts', 'lib/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.fields).toHaveLength(2)
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('formatPoleTable', () => {
  it('formats empty', () => { expect(formatPoleTable([])).toContain('No magnet poles') })
  it('formats poles', () => {
    const pole = analyzeMagnetPole('export function f() {}', 'f.ts')
    expect(formatPoleTable([pole])).toContain('f.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats empty', () => { expect(formatFieldTable([])).toContain('No magnetic fields') })
  it('formats fields', () => {
    const result = buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {})
    expect(formatFieldTable(result.fields)).toContain('Directory')
  })
})

describe('formatLab', () => {
  it('formats lab summary', () => {
    const result = buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {})
    expect(formatLab(result.lab)).toContain('Lab Summary')
  })
})

describe('formatStats', () => {
  it('formats stats', () => {
    const result = buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {})
    expect(formatStats(result.stats)).toContain('Magnet Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs', () => { expect(formatRecommendations(['Add types'])).toContain('Add types') })
})

describe('formatMagnetNeedleReport', () => {
  it('formats complete report', () => {
    const result = buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {})
    expect(formatMagnetNeedleReport(result)).toContain('Lab Summary')
  })
})

describe('formatMagnetNeedleJSON', () => {
  it('produces valid JSON', () => {
    const result = buildMagnetNeedleResult(['a.ts'], ['export function a() {}'], {})
    const parsed = JSON.parse(formatMagnetNeedleJSON(result))
    expect(parsed.poles).toHaveLength(1)
  })
})
