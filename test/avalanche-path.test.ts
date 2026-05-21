import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  classifyRiskLevel, classifySlopeCondition, classifyFaceType,
  classifyOverallRisk, classifyFaceCondition, classifyPatrollerGrade,
  classifyAspect,
  measureLayers, measureTerrain, measureSnow, measureRescue,
  detectAvalanchePaths,
  analyzeSnowLayer, analyzeMountainFace,
  generateRecommendations, buildAvalanchePathResult,
} from '../src/commands/avalanche-path-helpers.js'
import { formatAvalanchePathTable, formatAvalanchePathJson } from '../src/commands/avalanche-path-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calc(x: number): number {',
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

const noExportCode = [
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

const noisyCode = [
  'console.log("a")',
  'console.log("b")',
  'console.log("c")',
  'console.log("d")',
  'export function f() {}',
].join('\n')

const branchyCode = [
  'if (a) {}',
  'if (b) {}',
  'if (c) {}',
  'if (d) {}',
  'function x() {}',
].join('\n')

const heavyImportCode = [
  'import { a } from "a"',
  'import { b } from "b"',
  'import { c } from "c"',
  'import { d } from "d"',
  'import { e } from "e"',
  'import { f } from "f"',
].join('\n')

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('avalanche-path primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
  })

  it('countImports counts imports', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts exports', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions('function a() {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBeGreaterThanOrEqual(2)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts nesting', () => {
    expect(maxNesting('')).toBe(0)
    expect(maxNesting('{{{}}}')).toBe(3)
  })

  it('countConsole counts console', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('avalanche-path classifications', () => {
  it('classifyRiskLevel returns correct levels', () => {
    expect(classifyRiskLevel(90, 10)).toBe('safe')
    expect(classifyRiskLevel(70, 20)).toBe('low')
    expect(classifyRiskLevel(60, 30)).toBe('moderate')
    expect(classifyRiskLevel(50, 40)).toBe('considerable')
    expect(classifyRiskLevel(30, 30)).toBe('high')
    expect(classifyRiskLevel(10, 50)).toBe('extreme')
  })

  it('classifySlopeCondition returns correct conditions', () => {
    expect(classifySlopeCondition(90)).toBe('bomb-proof')
    expect(classifySlopeCondition(75)).toBe('stable')
    expect(classifySlopeCondition(55)).toBe('moderate')
    expect(classifySlopeCondition(35)).toBe('sensitive')
    expect(classifySlopeCondition(20)).toBe('touchy')
    expect(classifySlopeCondition(5)).toBe('hair-trigger')
  })

  it('classifyFaceType returns shield-wall for empty layers', () => {
    expect(classifyFaceType([])).toBe('shield-wall')
  })

  it('classifyOverallRisk returns correct levels', () => {
    expect(classifyOverallRisk(85)).toBe('green')
    expect(classifyOverallRisk(65)).toBe('yellow')
    expect(classifyOverallRisk(45)).toBe('orange')
    expect(classifyOverallRisk(25)).toBe('red')
    expect(classifyOverallRisk(10)).toBe('black')
  })

  it('classifyFaceCondition returns correct conditions', () => {
    expect(classifyFaceCondition(85)).toBe('fortress')
    expect(classifyFaceCondition(65)).toBe('defended')
    expect(classifyFaceCondition(45)).toBe('exposed')
    expect(classifyFaceCondition(30)).toBe('vulnerable')
    expect(classifyFaceCondition(15)).toBe('dangerous')
    expect(classifyFaceCondition(5)).toBe('catastrophic')
  })

  it('classifyPatrollerGrade returns correct grades', () => {
    expect(classifyPatrollerGrade(85)).toBe('head-patroller')
    expect(classifyPatrollerGrade(70)).toBe('patroller')
    expect(classifyPatrollerGrade(50)).toBe('ski-guide')
    expect(classifyPatrollerGrade(35)).toBe('skier')
    expect(classifyPatrollerGrade(18)).toBe('novice')
    expect(classifyPatrollerGrade(5)).toBe('buried')
  })

  it('classifyAspect returns correct aspects', () => {
    expect(classifyAspect(1, 5)).toBe('N')
    expect(classifyAspect(1, 3)).toBe('NE')
    expect(classifyAspect(2, 3)).toBe('E')
    expect(classifyAspect(1, 1)).toBe('SE')
    expect(classifyAspect(0, 0)).toBe('S')
    expect(classifyAspect(2, 1)).toBe('SW')
    expect(classifyAspect(5, 2)).toBe('W')
    expect(classifyAspect(10, 5)).toBe('NW')
  })
})

// ─── Measurement Tests ────────────────────────────────────────────────────────

describe('avalanche-path measurements', () => {
  it('measureLayers returns correct structure', () => {
    const l = measureLayers(strongCode)
    expect(l.count).toBeGreaterThan(0)
    expect(typeof l.hasWeakLayer).toBe('boolean')
    expect(typeof l.hasIceCrust).toBe('boolean')
    expect(typeof l.hasSugarSnow).toBe('boolean')
    expect(typeof l.hasWindSlab).toBe('boolean')
    expect(l.weakLayerPosition).toBeGreaterThanOrEqual(0)
    expect(l.layerBonding).toBeGreaterThanOrEqual(0)
    expect(l.layerBonding).toBeLessThanOrEqual(100)
  })

  it('measureLayers detects weak layer with branches and no errors', () => {
    expect(measureLayers(branchyCode).hasWeakLayer).toBe(true)
  })

  it('measureLayers detects wind slab with todos', () => {
    expect(measureLayers(todoCode).hasWindSlab).toBe(true)
  })

  it('measureLayers bonding increases with quality indicators', () => {
    const goodBonding = measureLayers(strongCode).layerBonding
    const badBonding = measureLayers(simpleCode).layerBonding
    expect(goodBonding).toBeGreaterThan(badBonding)
  })

  it('measureTerrain returns correct structure', () => {
    const t = measureTerrain(strongCode)
    expect(t.slope).toBeGreaterThanOrEqual(0)
    expect(t.slope).toBeLessThanOrEqual(90)
    expect(typeof t.aspect).toBe('string')
    expect(t.elevation).toBeGreaterThanOrEqual(0)
    expect(t.elevation).toBeLessThanOrEqual(100)
    expect(typeof t.isConvex).toBe('boolean')
    expect(typeof t.isConcave).toBe('boolean')
    expect(typeof t.hasCliff).toBe('boolean')
    expect(typeof t.hasGully).toBe('boolean')
  })

  it('measureTerrain detects cliff for deep nesting', () => {
    expect(measureTerrain(deepCode).hasCliff).toBe(true)
  })

  it('measureTerrain detects convex for exports without errors', () => {
    expect(measureTerrain(typedCode).isConvex).toBe(true)
  })

  it('measureSnow returns correct structure', () => {
    const s = measureSnow(strongCode)
    expect(s.depth).toBeGreaterThanOrEqual(0)
    expect(s.density).toBeGreaterThanOrEqual(0)
    expect(s.temperature).toBeGreaterThanOrEqual(0)
    expect(typeof s.isWet).toBe('boolean')
    expect(typeof s.isPacked).toBe('boolean')
    expect(typeof s.hasCrust).toBe('boolean')
  })

  it('measureSnow detects wet snow with todos', () => {
    expect(measureSnow(todoCode).isWet).toBe(true)
  })

  it('measureSnow detects packed with errors and comments', () => {
    expect(measureSnow(strongCode).isPacked).toBe(true)
  })

  it('measureRescue returns correct structure', () => {
    const r = measureRescue(strongCode)
    expect(typeof r.hasTransceiver).toBe('boolean')
    expect(typeof r.hasProbe).toBe('boolean')
    expect(typeof r.hasShovel).toBe('boolean')
    expect(typeof r.hasAvalung).toBe('boolean')
    expect(typeof r.hasAirbag).toBe('boolean')
    expect(r.responseTime).toBeGreaterThanOrEqual(0)
    expect(r.rescueReadiness).toBeGreaterThanOrEqual(0)
    expect(r.rescueReadiness).toBeLessThanOrEqual(100)
  })

  it('measureRescue detects transceiver with error handling', () => {
    expect(measureRescue(strongCode).hasTransceiver).toBe(true)
  })

  it('measureRescue detects shovel with try/catch', () => {
    expect(measureRescue(strongCode).hasShovel).toBe(true)
  })

  it('measureRescue detects probe with comments or types', () => {
    expect(measureRescue(strongCode).hasProbe).toBe(true)
  })
})

// ─── Avalanche Detection Tests ────────────────────────────────────────────────

describe('avalanche-path detection', () => {
  it('detectAvalanchePaths returns correct structure', () => {
    const a = detectAvalanchePaths(strongCode)
    expect(typeof a.riskLevel).toBe('string')
    expect(Array.isArray(a.triggerPoints)).toBe(true)
    expect(Array.isArray(a.propagationPaths)).toBe(true)
    expect(Array.isArray(a.runoutZones)).toBe(true)
    expect(typeof a.isContained).toBe('boolean')
    expect(typeof a.hasBarriers).toBe('boolean')
    expect(a.barrierCount).toBeGreaterThanOrEqual(0)
  })

  it('detectAvalanchePaths detects trigger points for branchy code without errors', () => {
    const a = detectAvalanchePaths(branchyCode)
    expect(a.triggerPoints).toEqual(
      expect.arrayContaining([expect.stringContaining('Unhandled branch')]),
    )
  })

  it('detectAvalanchePaths detects trigger points for deep nesting', () => {
    const a = detectAvalanchePaths(deepCode)
    expect(a.triggerPoints).toEqual(
      expect.arrayContaining([expect.stringContaining('Deep nesting')]),
    )
  })

  it('detectAvalanchePaths detects propagation for exports without errors', () => {
    const a = detectAvalanchePaths(typedCode)
    expect(a.propagationPaths).toEqual(
      expect.arrayContaining([expect.stringContaining('Exported functions')]),
    )
  })

  it('detectAvalanchePaths detects barriers with error handling', () => {
    const a = detectAvalanchePaths(strongCode)
    expect(a.hasBarriers).toBe(true)
  })

  it('detectAvalanchePaths detects runout zones for many exports', () => {
    const multiExport = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
    ].join('\n')
    const a = detectAvalanchePaths(multiExport)
    expect(a.runoutZones).toEqual(
      expect.arrayContaining([expect.stringContaining('Multiple consumers')]),
    )
  })
})

// ─── Snow Layer Analysis Tests ────────────────────────────────────────────────

describe('avalanche-path snow layer analysis', () => {
  it('analyzeSnowLayer returns correct structure', () => {
    const l = analyzeSnowLayer(strongCode, 'calc.ts')
    expect(l.file).toBe('calc.ts')
    expect(l.snowpackStability).toBeGreaterThanOrEqual(0)
    expect(l.snowpackStability).toBeLessThanOrEqual(100)
    expect(l.slabThickness).toBeGreaterThanOrEqual(0)
    expect(l.triggerSensitivity).toBeGreaterThanOrEqual(0)
    expect(l.propagationSpeed).toBeGreaterThanOrEqual(0)
    expect(l.runoutDistance).toBeGreaterThanOrEqual(0)
    expect(l.rescuePotential).toBeGreaterThanOrEqual(0)
    expect(l.qualityScore).toBeGreaterThanOrEqual(0)
    expect(l.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof l.condition).toBe('string')
    expect(l.layers).toBeDefined()
    expect(l.avalanche).toBeDefined()
    expect(l.terrain).toBeDefined()
    expect(l.snow).toBeDefined()
    expect(l.rescue).toBeDefined()
  })

  it('strong code has better quality than empty', () => {
    const good = analyzeSnowLayer(strongCode, 'good.ts')
    const bad = analyzeSnowLayer(emptyCode, 'bad.ts')
    expect(good.qualityScore).toBeGreaterThan(bad.qualityScore)
  })

  it('empty code layer is hair-trigger with qualityScore 0', () => {
    const l = analyzeSnowLayer(emptyCode, 'empty.ts')
    expect(l.condition).toBe('hair-trigger')
    expect(l.qualityScore).toBe(0)
    expect(l.snowpackStability).toBe(0)
    expect(l.triggerSensitivity).toBe(100)
  })

  it('strong code has high snowpack stability', () => {
    const l = analyzeSnowLayer(strongCode, 'strong.ts')
    expect(l.snowpackStability).toBeGreaterThanOrEqual(70)
  })

  it('strong code has low trigger sensitivity', () => {
    const l = analyzeSnowLayer(strongCode, 'strong.ts')
    expect(l.triggerSensitivity).toBe(0)
  })

  it('layers info is populated', () => {
    const l = analyzeSnowLayer(strongCode, 'a.ts')
    expect(l.layers.count).toBeGreaterThan(0)
    expect(l.layers.layerBonding).toBeGreaterThan(0)
  })

  it('terrain info is populated', () => {
    const l = analyzeSnowLayer(strongCode, 'a.ts')
    expect(l.terrain.slope).toBeGreaterThanOrEqual(0)
    expect(typeof l.terrain.aspect).toBe('string')
    expect(l.terrain.elevation).toBeGreaterThan(0)
  })

  it('snow info is populated', () => {
    const l = analyzeSnowLayer(strongCode, 'a.ts')
    expect(l.snow.depth).toBeGreaterThan(0)
  })

  it('rescue info is populated', () => {
    const l = analyzeSnowLayer(strongCode, 'a.ts')
    expect(l.rescue.rescueReadiness).toBeGreaterThan(0)
  })
})

// ─── Mountain Face Analysis Tests ─────────────────────────────────────────────

describe('avalanche-path mountain face analysis', () => {
  it('analyzeMountainFace handles empty layers', () => {
    const f = analyzeMountainFace([], 'src')
    expect(f.directory).toBe('src')
    expect(f.layers).toHaveLength(0)
    expect(f.faceType).toBe('shield-wall')
    expect(f.overallRisk).toBe('green')
    expect(f.condition).toBe('fortress')
  })

  it('analyzeMountainFace computes averages', () => {
    const layers = [
      analyzeSnowLayer(strongCode, 'a.ts'),
      analyzeSnowLayer(typedCode, 'b.ts'),
    ]
    const f = analyzeMountainFace(layers, 'src')
    expect(f.avgStability).toBeGreaterThanOrEqual(0)
    expect(f.avgTriggerSensitivity).toBeGreaterThanOrEqual(0)
    expect(f.avgPropagationSpeed).toBeGreaterThanOrEqual(0)
    expect(typeof f.faceType).toBe('string')
    expect(typeof f.overallRisk).toBe('string')
    expect(typeof f.condition).toBe('string')
  })

  it('analyzeMountainFace counts safe and extreme', () => {
    const layers = [
      analyzeSnowLayer(strongCode, 'a.ts'),
      analyzeSnowLayer(emptyCode, 'b.ts'),
    ]
    const f = analyzeMountainFace(layers, 'src')
    expect(f.extremeCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('avalanche-path build result', () => {
  it('buildAvalanchePathResult returns correct structure', () => {
    const result = buildAvalanchePathResult(['a.ts'], [typedCode], {})
    expect(result.layers).toHaveLength(1)
    expect(result.faces).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.patrollerGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.mountain.overallRisk).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildAvalanchePathResult([], [], {})
    expect(result.layers).toHaveLength(0)
    expect(result.stats.mostStable).toBe('none')
    expect(result.stats.mostUnstable).toBe('none')
    expect(result.stats.mostSensitive).toBe('none')
    expect(result.stats.bestRescueReady).toBe('none')
    expect(result.stats.worstCascader).toBe('none')
  })

  it('groups layers into faces by directory', () => {
    const result = buildAvalanchePathResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.faces).toHaveLength(2)
  })

  it('identifies most stable and unstable', () => {
    const result = buildAvalanchePathResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.mostStable).toBe('good.ts')
    expect(result.stats.mostUnstable).toBe('bad.ts')
  })

  it('identifies most sensitive and best rescue', () => {
    const result = buildAvalanchePathResult(
      ['strong.ts', 'simple.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.bestRescueReady).toBe('strong.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildAvalanchePathResult(['a.ts'], [], {})
    expect(result.layers).toHaveLength(1)
  })

  it('computes all stat fields', () => {
    const result = buildAvalanchePathResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.avgSnowpackStability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSlabThickness).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgTriggerSensitivity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPropagationSpeed).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRunoutDistance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRescuePotential).toBeGreaterThanOrEqual(0)
    expect(result.stats.bombProofCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.stableCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.moderateCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.sensitiveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.touchyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hairTriggerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalTriggerPoints).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalPropagationPaths).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalRunoutZones).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalBarriers).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasTransceiverCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasProbeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasShovelCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasAirbagCount).toBeGreaterThanOrEqual(0)
  })

  it('computes mountain fields', () => {
    const result = buildAvalanchePathResult(['a.ts'], [strongCode], {})
    expect(result.mountain.avgStability).toBeGreaterThanOrEqual(0)
    expect(result.mountain.avgTriggerSensitivity).toBeGreaterThanOrEqual(0)
    expect(result.mountain.avgPropagationSpeed).toBeGreaterThanOrEqual(0)
    expect(result.mountain.avgRescuePotential).toBeGreaterThanOrEqual(0)
    expect(typeof result.mountain.isSafe).toBe('boolean')
    expect(result.mountain.overallRisk).toBeGreaterThanOrEqual(0)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('avalanche-path recommendations', () => {
  it('returns array', () => {
    const result = buildAvalanchePathResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('warns about hair-trigger zones', () => {
    const result = buildAvalanchePathResult(['a.ts'], [emptyCode], {})
    if (result.stats.hairTriggerCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Hair-trigger')]),
      )
    }
  })

  it('includes stable conditions message for good code', () => {
    const result = buildAvalanchePathResult(['a.ts'], [strongCode], {})
    if (result.stats.overallRisk >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Stable conditions')]),
      )
    }
  })

  it('warns about uncontained failures', () => {
    const result = buildAvalanchePathResult(['a.ts'], [simpleCode], {})
    if (result.stats.uncontainedCount > 0) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Uncontained')]),
      )
    }
  })

  it('warns about low rescue potential', () => {
    const result = buildAvalanchePathResult(['a.ts'], [simpleCode], {})
    if (result.stats.avgRescuePotential < 40) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Low rescue')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('avalanche-path formatters', () => {
  const sampleResult = buildAvalanchePathResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatAvalanchePathTable returns string with header', () => {
    const table = formatAvalanchePathTable(sampleResult, false)
    expect(table).toContain('Avalanche Path')
    expect(table).toContain('Snow Layers')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatAvalanchePathTable verbose shows detail', () => {
    const table = formatAvalanchePathTable(sampleResult, true)
    expect(table).toContain('terrain:')
    expect(table).toContain('rescue:')
  })

  it('formatAvalanchePathTable handles empty', () => {
    const empty = buildAvalanchePathResult([], [], {})
    const table = formatAvalanchePathTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatAvalanchePathTable truncates layers at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildAvalanchePathResult(files, contents, {})
    const table = formatAvalanchePathTable(big, false)
    expect(table).toContain('more')
  })

  it('formatAvalanchePathTable shows faces', () => {
    const result = buildAvalanchePathResult(
      ['src/a.ts', 'lib/b.ts'],
      [strongCode, typedCode],
      {},
    )
    const table = formatAvalanchePathTable(result, false)
    expect(table).toContain('Mountain Faces')
  })

  it('formatAvalanchePathJson returns valid JSON', () => {
    const json = formatAvalanchePathJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.layers).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.mountain).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('avalanche-path edge cases', () => {
  it('handles deeply nested code', () => {
    const l = analyzeSnowLayer(deepCode, 'deep.ts')
    expect(l.terrain.hasCliff).toBe(true)
    expect(l.terrain.slope).toBeGreaterThan(0)
  })

  it('handles code with only comments', () => {
    const l = analyzeSnowLayer('// just a comment\n/* block */', 'comment.ts')
    expect(l.layers.count).toBeGreaterThanOrEqual(1)
  })

  it('handles single file with no directory', () => {
    const result = buildAvalanchePathResult(['single.ts'], [typedCode], {})
    expect(result.faces).toHaveLength(1)
    expect(result.faces[0].directory).toBe('.')
  })

  it('handles many files in same directory', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts']
    const contents = [typedCode, strongCode, simpleCode]
    const result = buildAvalanchePathResult(files, contents, {})
    expect(result.faces).toHaveLength(1)
    expect(result.faces[0].layers).toHaveLength(3)
  })

  it('empty code has extreme risk level', () => {
    const l = analyzeSnowLayer(emptyCode, 'empty.ts')
    expect(l.avalanche.riskLevel).toBe('extreme')
  })

  it('detects noisy code runout zones', () => {
    const a = detectAvalanchePaths(noisyCode)
    expect(a.runoutZones).toEqual(
      expect.arrayContaining([expect.stringContaining('Excessive logging')]),
    )
  })

  it('handles heavy imports without error handling', () => {
    const a = detectAvalanchePaths(heavyImportCode)
    expect(a.propagationPaths).toEqual(
      expect.arrayContaining([expect.stringContaining('Heavy imports')]),
    )
  })

  it('detects trigger points for many todos', () => {
    const manyTodo = Array.from({ length: 4 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const a = detectAvalanchePaths(manyTodo)
    expect(a.triggerPoints).toEqual(
      expect.arrayContaining([expect.stringContaining('unresolved markers')]),
    )
  })
})
