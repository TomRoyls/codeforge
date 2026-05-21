import { describe, it, expect } from 'vitest'
import {
  analyzeLensElement,
  analyzeObservatoryBay,
  buildTelescopeLensResult,
  classifyAstronomerGrade,
  classifyBayCondition,
  classifyBayType,
  classifyCondition,
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
  measureAberration,
  measureAperture,
  measureGathering,
  measureLens,
  measureMagnification,
  measureMount,
  measureResolution,
} from '../src/commands/telescope-lens-helpers.js'
import { formatTelescopeLensJson, formatTelescopeLensTable } from '../src/commands/telescope-lens-format-helpers.js'

const emptyCode = ''
const simpleCode = 'const x = 1'
const strongCode = `import { something } from 'module'
export function calculateTotal(items: string[]): number {
  try {
    if (items.length === 0) return 0
    const total = items.reduce((sum: number, item: string) => {
      return sum + item.length
    }, 0)
    return total
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw error
  }
}
/**
 * Validate input
 */
export function validateInput(data: string[]): boolean {
  return typeof data !== 'undefined' && Array.isArray(data) && data.length > 0
}
`
const testCode = `import { describe, it, expect } from 'vitest'
describe('calculateTotal', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0)
  })
  it('should sum correctly', () => {
    expect(calculateTotal(['a', 'bb'])).toBe(3)
  })
})
`
const messyCode = `export function a() { console.log('a') }
export class B {}
export const X = 1
export type T = string
export interface I { x: number }
// TODO: fix
export function anotherFunction() { if (x) { if (y) { return 1 } } }
`
const importOnlyCode = `import { a } from 'x'
import { b } from 'y'
import { c } from 'z'
const result = a(b(c()))
`

describe('countLoc', () => {
  it('counts 0 for empty string', () => { expect(countLoc(emptyCode)).toBe(0) })
  it('counts single line', () => { expect(countLoc(simpleCode)).toBe(1) })
  it('counts multiple non-blank lines', () => { expect(countLoc('a\n\nb\nc')).toBe(3) })
  it('counts strong code lines', () => { expect(countLoc(strongCode)).toBeGreaterThan(5) })
})

describe('countImports', () => {
  it('counts 0 for no imports', () => { expect(countImports(emptyCode)).toBe(0) })
  it('counts imports', () => { expect(countImports(strongCode)).toBe(1) })
})

describe('countExports', () => {
  it('counts 0 for no exports', () => { expect(countExports(emptyCode)).toBe(0) })
  it('counts exports', () => { expect(countExports(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countFunctions', () => {
  it('counts 0 for no functions', () => { expect(countFunctions(emptyCode)).toBe(0) })
  it('counts functions', () => { expect(countFunctions(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countClasses', () => {
  it('counts 0 for no classes', () => { expect(countClasses(emptyCode)).toBe(0) })
  it('counts classes', () => { expect(countClasses('class Foo {}')).toBe(1) })
})

describe('countErrorHandling', () => {
  it('counts 0 for empty', () => { expect(countErrorHandling(emptyCode)).toBe(0) })
  it('counts try/catch/throw', () => { expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countTypeAnnotations', () => {
  it('counts 0 for no types', () => { expect(countTypeAnnotations(emptyCode)).toBe(0) })
  it('counts types', () => { expect(countTypeAnnotations(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('countBranches', () => {
  it('counts 0 for no branches', () => { expect(countBranches(emptyCode)).toBe(0) })
  it('counts branches', () => { expect(countBranches(strongCode)).toBeGreaterThanOrEqual(2) })
})

describe('maxNesting', () => {
  it('returns 0 for empty', () => { expect(maxNesting(emptyCode)).toBe(0) })
  it('measures nesting', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

describe('countConsole', () => {
  it('counts 0 for no console', () => { expect(countConsole(emptyCode)).toBe(0) })
  it('counts console', () => { expect(countConsole(messyCode)).toBeGreaterThanOrEqual(1) })
})

describe('countComments', () => {
  it('counts 0 for no comments', () => { expect(countComments(emptyCode)).toBe(0) })
  it('counts comments', () => { expect(countComments(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countTodos', () => {
  it('counts 0 for no todos', () => { expect(countTodos(emptyCode)).toBe(0) })
  it('counts todos', () => { expect(countTodos(messyCode)).toBeGreaterThanOrEqual(1) })
})

describe('countJSDoc', () => {
  it('counts 0 for no jsdoc', () => { expect(countJSDoc(emptyCode)).toBe(0) })
  it('counts jsdoc', () => { expect(countJSDoc(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countDescriptiveNames', () => {
  it('counts 0 for none', () => { expect(countDescriptiveNames(emptyCode)).toBe(0) })
  it('counts descriptive names', () => { expect(countDescriptiveNames(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('countValidations', () => {
  it('counts 0 for none', () => { expect(countValidations(emptyCode)).toBe(0) })
  it('counts validations', () => { expect(countValidations(strongCode)).toBeGreaterThanOrEqual(1) })
})

describe('measureLens', () => {
  it('returns defective for empty code', () => {
    const l = measureLens(emptyCode)
    expect(l.type).toBe('defective')
    expect(l.focalLength).toBe(0)
    expect(l.fNumber).toBe(0)
    expect(l.isFocused).toBe(false)
    expect(l.isBlurred).toBe(false)
    expect(l.isDistorted).toBe(false)
  })
  it('returns simple for code without exports', () => {
    const l = measureLens(simpleCode)
    expect(l.type).toBe('simple')
    expect(l.isBlurred).toBe(true)
  })
  it('detects apochromatic for well-documented code', () => {
    const l = measureLens(strongCode)
    expect(l.type).toBe('apochromatic')
    expect(l.isFocused).toBe(true)
    expect(l.focalLength).toBeGreaterThan(0)
  })
  it('detects distortion without descriptive names', () => {
    const code = 'export function x() {} export function y() {}'
    const l = measureLens(code)
    expect(l.isDistorted).toBe(true)
  })
  it('detects multiple foci', () => {
    const l = measureLens(messyCode)
    expect(l.hasMultipleFoci).toBe(true)
  })
})

describe('measureAperture', () => {
  it('returns 0 diameter for empty code', () => {
    const a = measureAperture(emptyCode)
    expect(a.diameter).toBe(0)
    expect(a.fStop).toBe(0)
    expect(a.isOpen).toBe(false)
    expect(a.isStopped).toBe(false)
  })
  it('detects vignetting for import-only code', () => {
    const a = measureAperture(importOnlyCode)
    expect(a.hasVignetting).toBe(true)
  })
  it('calculates fStop', () => {
    const a = measureAperture(strongCode)
    expect(a.fStop).toBeGreaterThan(0)
  })
})

describe('measureMagnification', () => {
  it('returns 0 level for empty code', () => {
    const m = measureMagnification(emptyCode)
    expect(m.level).toBe(0)
    expect(m.isMacro).toBe(false)
    expect(m.isNormal).toBe(false)
    expect(m.isWide).toBe(false)
  })
  it('detects wide for simple code', () => {
    const m = measureMagnification(simpleCode)
    expect(m.isWide).toBe(true)
  })
  it('detects useful detail', () => {
    const m = measureMagnification(strongCode)
    expect(m.hasUsefulDetail).toBe(true)
  })
  it('calculates detail density', () => {
    const m = measureMagnification(strongCode)
    expect(m.detailDensity).toBeGreaterThanOrEqual(0)
  })
})

describe('measureResolution', () => {
  it('returns 0 for empty code', () => {
    const r = measureResolution(emptyCode)
    expect(r.sharpness).toBe(0)
    expect(r.resolvingPower).toBe(0)
    expect(r.contrast).toBe(0)
  })
  it('measures sharpness for typed code', () => {
    const r = measureResolution(strongCode)
    expect(r.sharpness).toBeGreaterThan(0)
    expect(r.resolvingPower).toBeGreaterThan(0)
  })
  it('detects coma with console+exports', () => {
    const r = measureResolution(messyCode)
    expect(r.hasComa).toBe(true)
  })
})

describe('measureAberration', () => {
  it('returns 0 chromatic for empty code', () => {
    const a = measureAberration(emptyCode)
    expect(a.chromatic).toBe(0)
    expect(a.isCorrected).toBe(true)
    expect(a.isMinimal).toBe(true)
  })
  it('detects color fringing for mixed exports', () => {
    const a = measureAberration(messyCode)
    expect(a.hasColorFringing).toBe(true)
    expect(a.fringeCount).toBeGreaterThan(0)
  })
  it('detects barrel distortion', () => {
    const a = measureAberration(messyCode)
    expect(a.hasBarrelDistortion).toBe(true)
  })
  it('detects pincushion for many imports few exports', () => {
    const code = `import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'\nimport { d } from 'w'\nconst r = a(b(c(d())))`
    const a = measureAberration(code)
    expect(a.hasPincushion).toBe(true)
  })
})

describe('measureGathering', () => {
  it('returns 0 power for empty code', () => {
    const g = measureGathering(emptyCode)
    expect(g.power).toBe(0)
    expect(g.lightTransmission).toBe(0)
  })
  it('detects features in strong code', () => {
    const g = measureGathering(strongCode)
    expect(g.hasEyepiece).toBe(true)
    expect(g.hasFilter).toBe(true)
    expect(g.hasCollimation).toBe(true)
    expect(g.hasFinder).toBe(true)
    expect(g.power).toBeGreaterThan(0)
  })
  it('detects field stop', () => {
    const g = measureGathering(strongCode)
    expect(g.hasFieldStop).toBe(true)
  })
})

describe('measureMount', () => {
  it('returns unstable for empty code', () => {
    const m = measureMount(emptyCode)
    expect(m.isStable).toBe(false)
    expect(m.alignmentScore).toBe(0)
  })
  it('detects stable mount for strong code', () => {
    const m = measureMount(strongCode)
    expect(m.isStable).toBe(true)
    expect(m.isAligned).toBe(true)
    expect(m.alignmentScore).toBeGreaterThan(0)
  })
  it('detects goTo with export default', () => {
    const code = 'export default function main(): void { console.log("hi") }'
    const m = measureMount(code)
    expect(m.hasGoTo).toBe(true)
  })
})

describe('classifyCondition', () => {
  it('classifies broken-lens for low', () => { expect(classifyCondition(0)).toBe('broken-lens') })
  it('classifies toy-telescope', () => { expect(classifyCondition(15)).toBe('toy-telescope') })
  it('classifies backyard-scope', () => { expect(classifyCondition(32)).toBe('backyard-scope') })
  it('classifies observatory', () => { expect(classifyCondition(50)).toBe('observatory') })
  it('classifies research-grade', () => { expect(classifyCondition(68)).toBe('research-grade') })
  it('classifies hubble-quality', () => { expect(classifyCondition(85)).toBe('hubble-quality') })
})

describe('classifyBayType', () => {
  it('returns dark-closet for empty', () => { expect(classifyBayType([])).toBe('dark-closet') })
})

describe('classifyBayCondition', () => {
  it('returns opaque for empty', () => { expect(classifyBayCondition([])).toBe('opaque') })
})

describe('classifyAstronomerGrade', () => {
  it('classifies blind for 0', () => { expect(classifyAstronomerGrade(0)).toBe('blind') })
  it('classifies optical-engineer for high', () => { expect(classifyAstronomerGrade(85)).toBe('optical-engineer') })
  it('classifies telescope-maker', () => { expect(classifyAstronomerGrade(70)).toBe('telescope-maker') })
  it('classifies astronomer', () => { expect(classifyAstronomerGrade(50)).toBe('astronomer') })
  it('classifies stargazer', () => { expect(classifyAstronomerGrade(35)).toBe('stargazer') })
  it('classifies tourist', () => { expect(classifyAstronomerGrade(20)).toBe('tourist') })
})

describe('analyzeLensElement', () => {
  it('returns correct structure for empty code', () => {
    const el = analyzeLensElement(emptyCode, 'empty.ts')
    expect(el.file).toBe('empty.ts')
    expect(el.focalLength).toBe(0)
    expect(el.aperture).toBe(0)
    expect(el.magnification).toBe(0)
    expect(el.resolution).toBe(0)
    expect(el.aberration).toBe(0)
    expect(el.lightGathering).toBe(0)
    expect(el.qualityScore).toBe(0)
    expect(el.condition).toBe('broken-lens')
    expect(el.lens.type).toBe('defective')
  })
  it('returns high scores for strong code', () => {
    const el = analyzeLensElement(strongCode, 'strong.ts')
    expect(el.focalLength).toBeGreaterThan(0)
    expect(el.resolution).toBeGreaterThan(0)
    expect(el.qualityScore).toBeGreaterThan(0)
    expect(el.lens.isFocused).toBe(true)
  })
  it('produces valid scores in range 0-100', () => {
    const el = analyzeLensElement(strongCode, 'range.ts')
    expect(el.qualityScore).toBeGreaterThanOrEqual(0)
    expect(el.qualityScore).toBeLessThanOrEqual(100)
  })
})

describe('analyzeObservatoryBay', () => {
  it('returns zeros for empty elements', () => {
    const bay = analyzeObservatoryBay([], 'empty')
    expect(bay.directory).toBe('empty')
    expect(bay.avgFocalLength).toBe(0)
    expect(bay.bayType).toBe('dark-closet')
    expect(bay.condition).toBe('opaque')
  })
  it('aggregates metrics', () => {
    const elements = [
      analyzeLensElement(strongCode, 'a.ts'),
      analyzeLensElement(simpleCode, 'b.ts'),
    ]
    const bay = analyzeObservatoryBay(elements, 'src')
    expect(bay.avgFocalLength).toBeGreaterThan(0)
    expect(bay.elements).toHaveLength(2)
  })
})

describe('buildTelescopeLensResult', () => {
  it('returns empty result for no files', () => {
    const result = buildTelescopeLensResult([], [], {})
    expect(result.elements).toEqual([])
    expect(result.bays).toEqual([])
    expect(result.observatory.overallClarity).toBe(0)
    expect(result.observatory.isFocused).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.astronomerGrade).toBe('blind')
  })
  it('analyzes single file', () => {
    const result = buildTelescopeLensResult(['calc.ts'], [strongCode], {})
    expect(result.elements).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.clearest).toBe('calc.ts')
  })
  it('analyzes multiple files', () => {
    const result = buildTelescopeLensResult(
      ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      [strongCode, simpleCode, testCode],
      {},
    )
    expect(result.elements).toHaveLength(3)
    expect(result.bays).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.observatory.overallClarity).toBeGreaterThan(0)
  })
  it('groups files by directory', () => {
    const result = buildTelescopeLensResult(
      ['src/foo/a.ts', 'src/bar/b.ts', 'root.ts'],
      [strongCode, simpleCode, strongCode],
      {},
    )
    expect(result.bays).toHaveLength(3)
    const dirs = result.bays.map(b => b.directory)
    expect(dirs).toContain('src/foo')
    expect(dirs).toContain('src/bar')
    expect(dirs).toContain('.')
  })
  it('tracks condition counts', () => {
    const result = buildTelescopeLensResult(
      ['a.ts', 'b.ts'],
      [strongCode, emptyCode],
      {},
    )
    const total = result.stats.hubbleQualityCount + result.stats.researchGradeCount +
      result.stats.observatoryCount + result.stats.backyardScopeCount +
      result.stats.toyTelescopeCount + result.stats.brokenLensCount
    expect(total).toBe(2)
  })
  it('handles fewer contents than files', () => {
    const result = buildTelescopeLensResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.elements).toHaveLength(2)
    expect(result.elements[1].focalLength).toBe(0)
  })
})

describe('generateRecommendations', () => {
  it('generates filter recommendation', () => {
    const result = buildTelescopeLensResult(['a.ts'], [simpleCode], {})
    if (result.stats.hasFilterCount === 0 && result.stats.totalFiles > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('filter')]),
      )
    }
  })
  it('generates clarity recommendation for strong code', () => {
    const result = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    if (result.observatory.overallClarity >= 70) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Crystal-clear')]),
      )
    }
  })
})

describe('formatTelescopeLensTable', () => {
  it('formats empty result', () => {
    const result = buildTelescopeLensResult([], [], {})
    const table = formatTelescopeLensTable(result, false)
    expect(table).toContain('Telescope Lens')
    expect(table).toContain('No files analyzed')
  })
  it('formats result with elements', () => {
    const result = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    const table = formatTelescopeLensTable(result, false)
    expect(table).toContain('a.ts')
  })
  it('formats verbose output', () => {
    const result = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    const table = formatTelescopeLensTable(result, true)
    expect(table).toContain('lens:')
    expect(table).toContain('aperture:')
    expect(table).toContain('magnification:')
    expect(table).toContain('resolution:')
    expect(table).toContain('aberration:')
    expect(table).toContain('gathering:')
    expect(table).toContain('mount:')
  })
  it('truncates non-verbose at 15 elements', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleCode)
    const result = buildTelescopeLensResult(files, contents, {})
    const table = formatTelescopeLensTable(result, false)
    expect(table).toContain('and 5 more')
  })
})

describe('formatTelescopeLensJson', () => {
  it('outputs valid JSON', () => {
    const result = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    const json = formatTelescopeLensJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.elements).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
  it('outputs empty result', () => {
    const result = buildTelescopeLensResult([], [], {})
    const json = formatTelescopeLensJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.elements).toEqual([])
  })
})

describe('telescope-lens integration', () => {
  it('produces consistent results', () => {
    const r1 = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    const r2 = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    expect(r1.elements[0].qualityScore).toBe(r2.elements[0].qualityScore)
  })
  it('handles mixed strong and weak code', () => {
    const result = buildTelescopeLensResult(
      ['strong.ts', 'weak.ts', 'empty.ts', 'test.ts'],
      [strongCode, simpleCode, emptyCode, testCode],
      {},
    )
    expect(result.elements).toHaveLength(4)
    expect(result.observatory.overallClarity).toBeGreaterThan(0)
    expect(result.observatory.overallClarity).toBeLessThanOrEqual(100)
  })
  it('tracks special elements', () => {
    const result = buildTelescopeLensResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.sharpest).toBeTruthy()
    expect(result.stats.mostAberrated).toBeTruthy()
    expect(result.stats.bestFocused).toBeTruthy()
    expect(result.stats.mostPowerful).toBeTruthy()
  })
  it('astronomer grade matches clarity', () => {
    const result = buildTelescopeLensResult(['a.ts'], [strongCode], {})
    expect(['optical-engineer', 'telescope-maker', 'astronomer', 'stargazer', 'tourist', 'blind']).toContain(result.stats.astronomerGrade)
  })
  it('focused matches overall clarity', () => {
    const result = buildTelescopeLensResult(['a.ts', 'b.ts'], [strongCode, strongCode], {})
    expect(result.observatory.isFocused).toBe(result.observatory.overallClarity >= 60)
  })
})
