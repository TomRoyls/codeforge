import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countTestIndicators,
  measurePrism, measureSpectrum, measureRefraction,
  measureAngle, measureAberration, evaluatePerspective,
  classifyCondition, classifyBenchType, classifyBenchCondition,
  classifyOpticianGrade,
  analyzeLightRay, analyzeOpticalBench,
  generateRecommendations, buildPrismAngleResult,
} from '../src/commands/prism-angle-helpers.js'
import { formatPrismAngleTable, formatPrismAngleJson } from '../src/commands/prism-angle-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
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

const testCode = [
  'import { describe, it, expect } from "vitest"',
  'describe("calc", () => {',
  '  it("works", () => {',
  '    expect(calc(1)).toBe(1)',
  '  })',
  '  it("handles zero", () => {',
  '    expect(calc(0)).toBe(0)',
  '  })',
  '})',
].join('\n')

const consoleCode = [
  'export function logStuff(x: number): void {',
  '  console.log("debug:", x)',
  '  console.error("err")',
  '}',
].join('\n')

const untypedCode = [
  'function process(data) {',
  '  if (data) { return data.value }',
  '  return null',
  '}',
  'function transform(input) { return input }',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('prism-angle primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports('export function a() {}')).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBe(3)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting measures brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting('if (a) { x }')).toBe(1)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole(consoleCode)).toBe(2)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODO markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countTestIndicators counts test patterns', () => {
    expect(countTestIndicators(emptyCode)).toBe(0)
    expect(countTestIndicators(testCode)).toBeGreaterThanOrEqual(3)
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('prism-angle measurements', () => {
  it('measurePrism handles empty code', () => {
    const p = measurePrism(emptyCode)
    expect(p.material).toBe('ice')
    expect(p.clarity).toBe(0)
    expect(p.hasInclusions).toBe(false)
    expect(p.isFlawless).toBe(false)
  })

  it('measurePrism classifies strong code as diamond or crystal', () => {
    const p = measurePrism(strongCode)
    expect(p.clarity).toBeGreaterThan(0)
    expect(['diamond', 'crystal']).toContain(p.material)
  })

  it('measurePrism detects inclusions', () => {
    const p = measurePrism(diverseCode)
    expect(p.hasInclusions).toBe(true)
    expect(p.inclusionCount).toBeGreaterThan(0)
  })

  it('measurePrism detects bubbles', () => {
    const p = measurePrism(untypedCode)
    expect(p.hasBubbles).toBe(true)
    expect(p.bubbleCount).toBeGreaterThan(0)
  })

  it('measurePrism detects scratches', () => {
    const p = measurePrism('export function a() {}')
    expect(p.hasScratches).toBe(true)
    expect(p.scratchCount).toBeGreaterThan(0)
  })

  it('measureSpectrum handles empty code', () => {
    const s = measureSpectrum(emptyCode)
    expect(s.colors).toHaveLength(0)
    expect(s.isComplete).toBe(false)
    expect(s.hasMissingColors).toBe(false)
  })

  it('measureSpectrum detects colors in strong code', () => {
    const s = measureSpectrum(strongCode)
    expect(s.colors.length).toBeGreaterThan(3)
    expect(s.colors).toContain('functions')
    expect(s.colors).toContain('exports')
  })

  it('measureSpectrum detects missing colors', () => {
    const s = measureSpectrum('const x = 1')
    expect(s.hasMissingColors).toBe(true)
    expect(s.missingColors.length).toBeGreaterThan(0)
  })

  it('measureSpectrum detects ultraviolet', () => {
    const s = measureSpectrum('TODO: fix this')
    expect(s.hasUltraviolet).toBe(true)
  })

  it('measureSpectrum detects infrared', () => {
    const s = measureSpectrum('export function legacy() {}')
    expect(s.hasInfrared).toBe(true)
  })

  it('measureRefraction handles empty code', () => {
    const r = measureRefraction(emptyCode)
    expect(r.index).toBe(0)
    expect(r.isConsistent).toBe(true)
    expect(r.hasScattering).toBe(false)
  })

  it('measureRefraction detects scattering', () => {
    const r = measureRefraction('if (a) { if (b) { if (c) { if (d) { x } } } }')
    expect(r.hasScattering).toBe(true)
    expect(r.scatteringPoints).toBeGreaterThan(0)
  })

  it('measureRefraction detects absorption', () => {
    const r = measureRefraction('if (a) { x }')
    expect(r.hasAbsorption).toBe(true)
    expect(r.absorptionPoints).toBeGreaterThan(0)
  })

  it('measureAngle handles empty code', () => {
    const a = measureAngle(emptyCode)
    expect(a.incidence).toBe(0)
    expect(a.deviation).toBe(0)
    expect(a.isNormalIncidence).toBe(false)
    expect(a.isOblique).toBe(false)
  })

  it('measureAngle detects normal incidence', () => {
    const a = measureAngle(strongCode)
    expect(a.isNormalIncidence).toBe(true)
    expect(a.incidence).toBeGreaterThan(60)
  })

  it('measureAngle detects oblique incidence', () => {
    const a = measureAngle('const x = 1')
    expect(a.isOblique).toBe(true)
  })

  it('measureAngle detects critical angles', () => {
    const a = measureAngle('export function a() {}')
    expect(a.hasCriticalAngle).toBe(true)
    expect(a.criticalAnglePoints.length).toBeGreaterThan(0)
  })

  it('measureAberration handles empty code', () => {
    const ab = measureAberration(emptyCode)
    expect(ab.lateral).toBe(0)
    expect(ab.axial).toBe(0)
    expect(ab.hasDistortion).toBe(false)
    expect(ab.isMinimal).toBe(true)
  })

  it('measureAberration detects distortion', () => {
    const ab = measureAberration('export function a() {}')
    expect(ab.hasDistortion).toBe(true)
    expect(ab.distortionPoints.length).toBeGreaterThan(0)
  })

  it('measureAberration detects curvature', () => {
    const ab = measureAberration('export function a() {} export function b() {}')
    expect(ab.hasCurvature).toBeDefined()
  })

  it('measureAberration is minimal for strong code', () => {
    const ab = measureAberration(strongCode)
    expect(ab.isMinimal).toBeDefined()
  })
})

// ─── Perspective Evaluation ───────────────────────────────────────────────────

describe('prism-angle perspectives', () => {
  it('evaluatePerspective handles empty code', () => {
    const p = evaluatePerspective(emptyCode, 'user')
    expect(p.score).toBe(0)
    expect(p.isClear).toBe(false)
    expect(p.isDistorted).toBe(true)
    expect(p.blindSpots).toContain('empty-file')
  })

  it('evaluatePerspective returns user perspective', () => {
    const p = evaluatePerspective(strongCode, 'user')
    expect(p.score).toBeGreaterThan(0)
    expect(typeof p.isClear).toBe('boolean')
    expect(Array.isArray(p.blindSpots)).toBe(true)
    expect(Array.isArray(p.highlights)).toBe(true)
  })

  it('evaluatePerspective returns maintainer perspective', () => {
    const p = evaluatePerspective(strongCode, 'maintainer')
    expect(p.score).toBeGreaterThan(0)
  })

  it('evaluatePerspective returns tester perspective', () => {
    const p = evaluatePerspective(testCode, 'tester')
    expect(p.score).toBeGreaterThan(0)
    expect(p.highlights).toContain('has-tests')
  })

  it('evaluatePerspective returns reviewer perspective', () => {
    const p = evaluatePerspective(strongCode, 'reviewer')
    expect(p.score).toBeGreaterThan(0)
  })

  it('evaluatePerspective returns optimizer perspective', () => {
    const p = evaluatePerspective(simpleCode, 'optimizer')
    expect(p.score).toBeGreaterThanOrEqual(0)
  })

  it('evaluatePerspective returns newcomer perspective', () => {
    const p = evaluatePerspective(strongCode, 'newcomer')
    expect(p.score).toBeGreaterThan(0)
  })

  it('evaluatePerspective handles unknown perspective', () => {
    const p = evaluatePerspective('code', 'unknown')
    expect(p.score).toBe(0)
    expect(p.blindSpots).toContain('unknown-perspective')
  })

  it('all perspectives return valid scores for strong code', () => {
    const perspectives = ['user', 'maintainer', 'tester', 'reviewer', 'optimizer', 'newcomer']
    for (const perspective of perspectives) {
      const p = evaluatePerspective(strongCode, perspective)
      expect(p.score).toBeGreaterThanOrEqual(0)
      expect(p.score).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('prism-angle classification', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('flawless-diamond')
    expect(classifyCondition(75)).toBe('clear-crystal')
    expect(classifyCondition(55)).toBe('good-glass')
    expect(classifyCondition(38)).toBe('cloudy')
    expect(classifyCondition(20)).toBe('frosted')
    expect(classifyCondition(8)).toBe('opaque')
  })

  it('classifyBenchType returns darkroom for empty', () => {
    expect(classifyBenchType([])).toBe('darkroom')
  })

  it('classifyBenchCondition returns broken for empty', () => {
    expect(classifyBenchCondition([])).toBe('broken')
  })

  it('classifyOpticianGrade returns correct grades', () => {
    expect(classifyOpticianGrade(85)).toBe('master-optician')
    expect(classifyOpticianGrade(68)).toBe('optician')
    expect(classifyOpticianGrade(50)).toBe('glassblower')
    expect(classifyOpticianGrade(35)).toBe('lens-grinder')
    expect(classifyOpticianGrade(18)).toBe('apprentice')
    expect(classifyOpticianGrade(8)).toBe('blind')
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('prism-angle core analysis', () => {
  it('analyzeLightRay returns opaque for empty code', () => {
    const r = analyzeLightRay(emptyCode, 'empty.ts')
    expect(r.condition).toBe('opaque')
    expect(r.qualityScore).toBe(0)
    expect(r.prism.material).toBe('ice')
    expect(r.file).toBe('empty.ts')
  })

  it('analyzeLightRay returns non-zero scores for strong code', () => {
    const r = analyzeLightRay(strongCode, 'strong.ts')
    expect(r.qualityScore).toBeGreaterThan(0)
    expect(r.refractionQuality).toBeGreaterThan(0)
    expect(r.opticalClarity).toBeGreaterThan(0)
  })

  it('analyzeLightRay assigns file path correctly', () => {
    const r = analyzeLightRay(simpleCode, 'src/test.ts')
    expect(r.file).toBe('src/test.ts')
  })

  it('analyzeLightRay populates all perspectives', () => {
    const r = analyzeLightRay(strongCode, 'strong.ts')
    expect(typeof r.perspectives.user.score).toBe('number')
    expect(typeof r.perspectives.maintainer.score).toBe('number')
    expect(typeof r.perspectives.tester.score).toBe('number')
    expect(typeof r.perspectives.reviewer.score).toBe('number')
    expect(typeof r.perspectives.optimizer.score).toBe('number')
    expect(typeof r.perspectives.newcomer.score).toBe('number')
  })
})

// ─── Optical Bench ────────────────────────────────────────────────────────────

describe('prism-angle optical bench', () => {
  it('analyzeOpticalBench returns darkroom for empty', () => {
    const b = analyzeOpticalBench([], 'empty-dir')
    expect(b.benchType).toBe('darkroom')
    expect(b.condition).toBe('broken')
    expect(b.rays).toHaveLength(0)
  })

  it('analyzeOpticalBench aggregates ray scores', () => {
    const rays = [
      analyzeLightRay(strongCode, 'a.ts'),
      analyzeLightRay(typedCode, 'b.ts'),
    ]
    const b = analyzeOpticalBench(rays, 'src')
    expect(b.rays).toHaveLength(2)
    expect(b.avgRefraction).toBeGreaterThan(0)
    expect(b.directory).toBe('src')
  })

  it('analyzeOpticalBench counts flawless and opaque', () => {
    const rays = [analyzeLightRay(strongCode, 'a.ts')]
    const b = analyzeOpticalBench(rays, 'src')
    expect(typeof b.flawlessCount).toBe('number')
    expect(typeof b.opaqueCount).toBe('number')
    expect(typeof b.consistentCount).toBe('number')
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('prism-angle build result', () => {
  it('buildPrismAngleResult handles empty input', () => {
    const result = buildPrismAngleResult([], [], {})
    expect(result.rays).toHaveLength(0)
    expect(result.benches).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallClarity).toBe(0)
    expect(result.stats.opticianGrade).toBe('blind')
    expect(result.stats.clearest).toBe('none')
    expect(result.stats.mostDistorted).toBe('none')
    expect(result.stats.mostConsistent).toBe('none')
    expect(result.stats.bestSpectrum).toBe('none')
  })

  it('buildPrismAngleResult processes single file', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    expect(result.rays).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.clearest).toBe('a.ts')
  })

  it('buildPrismAngleResult processes multiple files', () => {
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildPrismAngleResult(multiFilePaths, contents, {})
    expect(result.rays).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalBenches).toBe(1)
  })

  it('buildPrismAngleResult groups by directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildPrismAngleResult(paths, contents, {})
    expect(result.benches).toHaveLength(2)
  })

  it('buildPrismAngleResult computes laboratory averages', () => {
    const result = buildPrismAngleResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    expect(result.laboratory.avgRefraction).toBeGreaterThanOrEqual(0)
    expect(result.laboratory.avgClarity).toBeGreaterThanOrEqual(0)
    expect(typeof result.laboratory.isConsistent).toBe('boolean')
  })

  it('buildPrismAngleResult counts condition types', () => {
    const result = buildPrismAngleResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.flawlessDiamondCount +
      result.stats.clearCrystalCount +
      result.stats.goodGlassCount +
      result.stats.cloudyCount +
      result.stats.frostedCount +
      result.stats.opaqueCount
    expect(total).toBe(3)
  })

  it('buildPrismAngleResult counts material types', () => {
    const result = buildPrismAngleResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.diamondCount +
      result.stats.crystalCount +
      result.stats.glassCount +
      result.stats.plasticCount +
      result.stats.iceCount
    expect(total).toBeLessThanOrEqual(3)
  })

  it('buildPrismAngleResult handles mismatched contents', () => {
    const result = buildPrismAngleResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.rays).toHaveLength(2)
    expect(result.rays[1].qualityScore).toBe(0)
  })

  it('buildPrismAngleResult identifies extremes', () => {
    const result = buildPrismAngleResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostDistorted).toBeTruthy()
    expect(result.stats.mostConsistent).toBeTruthy()
    expect(result.stats.bestSpectrum).toBeTruthy()
  })

  it('buildPrismAngleResult counts feature flags', () => {
    const result = buildPrismAngleResult(
      ['a.ts', 'b.ts'],
      [strongCode, consoleCode],
      {},
    )
    expect(typeof result.stats.consistentCount).toBe('number')
    expect(typeof result.stats.scatteringCount).toBe('number')
    expect(typeof result.stats.absorptionCount).toBe('number')
    expect(typeof result.stats.hasUltravioletCount).toBe('number')
    expect(typeof result.stats.hasInfraredCount).toBe('number')
    expect(typeof result.stats.completeSpectrumCount).toBe('number')
    expect(typeof result.stats.minimalAberrationCount).toBe('number')
  })

  it('quality scores are bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, diverseCode, testCode, consoleCode, untypedCode]
    for (const code of codes) {
      const r = analyzeLightRay(code, 'test.ts')
      expect(r.qualityScore).toBeGreaterThanOrEqual(0)
      expect(r.qualityScore).toBeLessThanOrEqual(100)
      expect(r.refractionQuality).toBeGreaterThanOrEqual(0)
      expect(r.refractionQuality).toBeLessThanOrEqual(100)
      expect(r.dispersion).toBeGreaterThanOrEqual(0)
      expect(r.dispersion).toBeLessThanOrEqual(100)
    }
  })

  it('overall clarity is bounded 0-100', () => {
    const result = buildPrismAngleResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.overallClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallClarity).toBeLessThanOrEqual(100)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('prism-angle recommendations', () => {
  it('generateRecommendations warns about opaque files', () => {
    const result = buildPrismAngleResult(['a.ts'], [simpleCode], {})
    if (result.stats.opaqueCount > 0) {
      expect(result.recommendations.some(r => r.includes('Opaque'))).toBe(true)
    }
  })

  it('generateRecommendations praises high clarity', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    if (result.laboratory.overallClarity >= 70) {
      expect(result.recommendations.some(r => r.includes('Well-focused'))).toBe(true)
    }
  })

  it('generateRecommendations returns deduplicated array', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toEqual(unique)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('prism-angle format helpers', () => {
  it('formatPrismAngleTable returns string with header', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const table = formatPrismAngleTable(result, false)
    expect(table).toContain('Prism Angle')
    expect(table).toContain('Light Rays')
    expect(table).toContain('Statistics')
  })

  it('formatPrismAngleTable includes recommendations', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const table = formatPrismAngleTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatPrismAngleTable handles empty result', () => {
    const result = buildPrismAngleResult([], [], {})
    const table = formatPrismAngleTable(result, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatPrismAngleTable verbose shows details', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const verbose = formatPrismAngleTable(result, true)
    expect(verbose).toContain('prism:')
    expect(verbose).toContain('spectrum:')
    expect(verbose).toContain('refraction:')
    expect(verbose).toContain('angle:')
    expect(verbose).toContain('aberration:')
    expect(verbose).toContain('perspectives:')
  })

  it('formatPrismAngleTable truncates at 15 rays', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleCode)
    const result = buildPrismAngleResult(paths, contents, {})
    const table = formatPrismAngleTable(result, false)
    expect(table).toContain('... and 5 more')
  })

  it('formatPrismAngleTable shows benches section', () => {
    const result = buildPrismAngleResult(['src/a.ts', 'src/b.ts'], [strongCode, diverseCode], {})
    const table = formatPrismAngleTable(result, false)
    expect(table).toContain('Optical Benches')
  })

  it('formatPrismAngleTable shows laboratory section', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const table = formatPrismAngleTable(result, false)
    expect(table).toContain('Laboratory')
  })

  it('formatPrismAngleJson returns valid JSON', () => {
    const result = buildPrismAngleResult(['a.ts'], [strongCode], {})
    const json = formatPrismAngleJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json) as { rays: unknown[] }
    expect(parsed.rays).toHaveLength(1)
  })

  it('formatPrismAngleJson handles empty result', () => {
    const result = buildPrismAngleResult([], [], {})
    const json = formatPrismAngleJson(result)
    const parsed = JSON.parse(json) as { stats: { totalFiles: number } }
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('prism-angle edge cases', () => {
  it('handles code with only comments', () => {
    const r = analyzeLightRay('// just a comment\n/* block */', 'comment.ts')
    expect(r.file).toBe('comment.ts')
    expect(typeof r.qualityScore).toBe('number')
  })

  it('handles untyped functions', () => {
    const r = analyzeLightRay(untypedCode, 'untyped.ts')
    expect(r.prism.hasBubbles).toBe(true)
    expect(r.aberration.hasDistortion).toBe(true)
  })

  it('all sub-scores are bounded 0-100', () => {
    const r = analyzeLightRay(strongCode, 'test.ts')
    expect(r.refractionQuality).toBeGreaterThanOrEqual(0)
    expect(r.refractionQuality).toBeLessThanOrEqual(100)
    expect(r.dispersion).toBeGreaterThanOrEqual(0)
    expect(r.dispersion).toBeLessThanOrEqual(100)
    expect(r.angularAccuracy).toBeGreaterThanOrEqual(0)
    expect(r.angularAccuracy).toBeLessThanOrEqual(90)
    expect(r.spectralCompleteness).toBeGreaterThanOrEqual(0)
    expect(r.spectralCompleteness).toBeLessThanOrEqual(100)
    expect(r.opticalClarity).toBeGreaterThanOrEqual(0)
    expect(r.opticalClarity).toBeLessThanOrEqual(100)
    expect(r.chromaticAberration).toBeGreaterThanOrEqual(0)
    expect(r.chromaticAberration).toBeLessThanOrEqual(100)
  })

  it('test code gets high tester perspective score', () => {
    const p = evaluatePerspective(testCode, 'tester')
    expect(p.score).toBeGreaterThan(20)
  })

  it('dispersion is 0 for empty code', () => {
    const r = analyzeLightRay(emptyCode, 'empty.ts')
    expect(r.dispersion).toBe(0)
  })
})
