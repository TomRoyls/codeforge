import { describe, expect, it } from 'vitest'

import {
  buildProfile,
  buildSpectralLayers,
  buildSpectrumResult,
  classifyDecompositionType,
  computeBalance,
  computeOverallPurity,
  computePurity,
  computeSpectrumCompleteness,
  decomposeConcerns,
  generateRecommendations,
  identifyDominantConcern,
  measureConfigurationIntensity,
  measureDataFlowIntensity,
  measureErrorHandlingIntensity,
  measureLogicIntensity,
  measureOrchestrationIntensity,
  measurePresentationIntensity,
  measureTestingIntensity,
  measureTypingIntensity,
} from '../src/commands/spectrum-analysis-helpers.js'

import {
  formatDecompositions,
  formatRecommendations,
  formatSpectrumBar,
  formatSpectrumJSON,
  formatSpectrumStats,
  formatSpectrumTable,
} from '../src/commands/spectrum-analysis-format-helpers.js'

import type {
  ConcernDecomposition,
  SpectralLayer,
  SpectrumProfile,
  SpectrumResult,
  SpectrumStats,
} from '../src/commands/spectrum-analysis-helpers.js'

// ─── measureLogicIntensity ─────────────────────────────────────────────────────

describe('measureLogicIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureLogicIntensity('')).toBe(0)
  })

  it('detects if/else', () => {
    const result = measureLogicIntensity('if (x) {}\nelse {}\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects switch/case', () => {
    const result = measureLogicIntensity('switch(x) { case 1: break; }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects for/while loops', () => {
    const result = measureLogicIntensity('for (let i = 0; i < 10; i++) {}\nwhile (true) {}\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects return statements', () => {
    const result = measureLogicIntensity('return x\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += 'if (x) { return y }\n'
    expect(measureLogicIntensity(content)).toBeLessThanOrEqual(100)
  })

  it('returns 0 for plain content', () => {
    expect(measureLogicIntensity('const x = 1')).toBe(0)
  })
})

// ─── measureDataFlowIntensity ──────────────────────────────────────────────────

describe('measureDataFlowIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureDataFlowIntensity('')).toBe(0)
  })

  it('detects map/filter/reduce', () => {
    const result = measureDataFlowIntensity('arr.map(x => x).filter(Boolean)\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects spread operator', () => {
    const result = measureDataFlowIntensity('const y = { ...x }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects JSON methods', () => {
    const result = measureDataFlowIntensity('JSON.parse(str)\nJSON.stringify(obj)\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects Object methods', () => {
    const result = measureDataFlowIntensity('Object.keys(obj)\nObject.entries(obj)\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += 'arr.map(x => x).filter(Boolean).reduce((a, b) => a + b)\n'
    expect(measureDataFlowIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── measureErrorHandlingIntensity ─────────────────────────────────────────────

describe('measureErrorHandlingIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureErrorHandlingIntensity('')).toBe(0)
  })

  it('detects try/catch', () => {
    const result = measureErrorHandlingIntensity('try {} catch(e) {}\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects throw/Error', () => {
    const result = measureErrorHandlingIntensity('throw new Error("fail")\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects async/await', () => {
    const result = measureErrorHandlingIntensity('async function fn() { await promise }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects Promise', () => {
    const result = measureErrorHandlingIntensity('new Promise((resolve, reject) => {})\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += 'try { await Promise.resolve() } catch(e) { throw new Error() }\n'
    expect(measureErrorHandlingIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── measureTypingIntensity ────────────────────────────────────────────────────

describe('measureTypingIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureTypingIntensity('')).toBe(0)
  })

  it('detects interface', () => {
    const result = measureTypingIntensity('interface Foo { x: string }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects type keyword', () => {
    const result = measureTypingIntensity('type Result = string | number\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects enum', () => {
    const result = measureTypingIntensity('enum Color { Red, Green }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects as keyword', () => {
    const result = measureTypingIntensity('const x = y as string\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects generics', () => {
    const result = measureTypingIntensity('function fn<T>(x: T): T { return x }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects extends/implements', () => {
    const result = measureTypingIntensity('class Foo extends Bar implements Baz {}\n')
    expect(result).toBeGreaterThan(0)
  })
})

// ─── measureConfigurationIntensity ─────────────────────────────────────────────

describe('measureConfigurationIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureConfigurationIntensity('')).toBe(0)
  })

  it('detects UPPER_CASE constants', () => {
    const result = measureConfigurationIntensity('const MAX_SIZE = 100\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects process.env', () => {
    const result = measureConfigurationIntensity('const key = process.env.KEY\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects config/options patterns', () => {
    const result = measureConfigurationIntensity('const config = { port: 3000 }\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += `const MAX_${i} = ${i}\n`
    expect(measureConfigurationIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── measurePresentationIntensity ──────────────────────────────────────────────

describe('measurePresentationIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measurePresentationIntensity('')).toBe(0)
  })

  it('detects console methods', () => {
    const result = measurePresentationIntensity('console.log("hello")\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects template literals with interpolation', () => {
    const result = measurePresentationIntensity('const msg = `Hello ${name}`\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects string formatting methods', () => {
    const result = measurePresentationIntensity('"hello".padStart(10).repeat(3)\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects chalk', () => {
    const result = measurePresentationIntensity('chalk.red("error")\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += 'console.log(`item ${i}: ${chalk.red("x")}`)\n'
    expect(measurePresentationIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── measureTestingIntensity ───────────────────────────────────────────────────

describe('measureTestingIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureTestingIntensity('')).toBe(0)
  })

  it('detects describe/it/expect', () => {
    const result = measureTestingIntensity('describe("suite", () => { it("test", () => { expect(x).toBe(1) }) })\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects test/assert', () => {
    const result = measureTestingIntensity('test("works", () => { assert(true) })\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects mock/stub/spy', () => {
    const result = measureTestingIntensity('const m = mock(); stub(obj, "fn"); spy()\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects beforeEach/afterEach', () => {
    const result = measureTestingIntensity('beforeEach(() => {})\nafterEach(() => {})\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects vi. patterns', () => {
    const result = measureTestingIntensity('vi.fn()\nvi.spyOn(obj, "fn")\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += 'describe("test", () => { it("works", () => { expect(x).toBe(1) }) })\n'
    expect(measureTestingIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── measureOrchestrationIntensity ─────────────────────────────────────────────

describe('measureOrchestrationIntensity', () => {
  it('returns 0 for empty content', () => {
    expect(measureOrchestrationIntensity('')).toBe(0)
  })

  it('detects imports', () => {
    const result = measureOrchestrationIntensity('import { x } from "y"\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects exports', () => {
    const result = measureOrchestrationIntensity('export function fn() {}\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects require', () => {
    const result = measureOrchestrationIntensity('const x = require("y")\n')
    expect(result).toBeGreaterThan(0)
  })

  it('detects export default', () => {
    const result = measureOrchestrationIntensity('export default class Foo {}\n')
    expect(result).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 200; i++) content += `import { x${i} } from "y"\nexport { x${i} }\n`
    expect(measureOrchestrationIntensity(content)).toBeLessThanOrEqual(100)
  })
})

// ─── buildProfile ──────────────────────────────────────────────────────────────

describe('buildProfile', () => {
  it('builds profile for a file', () => {
    const profile = buildProfile('test.ts', 'describe("x", () => { it("y", () => { expect(1).toBe(1) }) })')
    expect(profile.file).toBe('test.ts')
    expect(profile.testing).toBeGreaterThan(0)
  })

  it('returns zero profile for empty content', () => {
    const profile = buildProfile('empty.ts', '')
    expect(profile.logic).toBe(0)
    expect(profile.dataFlow).toBe(0)
  })

  it('detects multiple concerns', () => {
    const content = 'import { x } from "y"\nexport function run() {\n  if (x) { return x.map(i => i) }\n  throw new Error("no x")\n}\n'
    const profile = buildProfile('mixed.ts', content)
    expect(profile.orchestration).toBeGreaterThan(0)
    expect(profile.logic).toBeGreaterThan(0)
  })
})

// ─── decomposeConcerns ─────────────────────────────────────────────────────────

describe('decomposeConcerns', () => {
  it('returns normalized percentages', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 50, dataFlow: 30, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 20,
    }
    const layers = decomposeConcerns(profile)
    const total = Object.values(layers).reduce((s, v) => s + v, 0)
    expect(total).toBe(100)
  })

  it('handles zero total', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 0, dataFlow: 0, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    const layers = decomposeConcerns(profile)
    expect(Object.values(layers).every((v) => v === 0)).toBe(true)
  })

  it('identifies dominant concern correctly', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 80, dataFlow: 10, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 10,
    }
    const layers = decomposeConcerns(profile)
    expect(layers.logic).toBeGreaterThan(layers.dataFlow)
  })
})

// ─── identifyDominantConcern ───────────────────────────────────────────────────

describe('identifyDominantConcern', () => {
  it('identifies highest concern', () => {
    expect(identifyDominantConcern({ logic: 60, dataFlow: 20, testing: 10 })).toBe('logic')
  })

  it('handles ties by first found', () => {
    const result = identifyDominantConcern({ logic: 50, dataFlow: 50 })
    expect(['logic', 'dataFlow']).toContain(result)
  })

  it('handles all zeros', () => {
    expect(identifyDominantConcern({ logic: 0, dataFlow: 0 })).toBe('logic')
  })

  it('identifies testing concern', () => {
    expect(identifyDominantConcern({ logic: 10, testing: 70 })).toBe('testing')
  })
})

// ─── computePurity ─────────────────────────────────────────────────────────────

describe('computePurity', () => {
  it('returns 100 for single-concern file', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 100, dataFlow: 0, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computePurity(profile)).toBe(100)
  })

  it('returns lower for mixed concerns', () => {
    const pure: SpectrumProfile = {
      file: 'a.ts', logic: 90, dataFlow: 10, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    const mixed: SpectrumProfile = {
      file: 'b.ts', logic: 25, dataFlow: 25, errorHandling: 25, typing: 25,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computePurity(pure)).toBeGreaterThan(computePurity(mixed))
  })

  it('returns 100 for all zeros', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 0, dataFlow: 0, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computePurity(profile)).toBe(100)
  })
})

// ─── computeBalance ────────────────────────────────────────────────────────────

describe('computeBalance', () => {
  it('returns 100 for single concern', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 100, dataFlow: 0, errorHandling: 0, typing: 0,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computeBalance(profile)).toBe(100)
  })

  it('returns high for balanced concerns', () => {
    const profile: SpectrumProfile = {
      file: 'a.ts', logic: 25, dataFlow: 25, errorHandling: 25, typing: 25,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computeBalance(profile)).toBeGreaterThan(50)
  })

  it('returns lower for imbalanced concerns', () => {
    const balanced: SpectrumProfile = {
      file: 'a.ts', logic: 25, dataFlow: 25, errorHandling: 25, typing: 25,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    const imbalanced: SpectrumProfile = {
      file: 'b.ts', logic: 90, dataFlow: 5, errorHandling: 3, typing: 2,
      configuration: 0, presentation: 0, testing: 0, orchestration: 0,
    }
    expect(computeBalance(balanced)).toBeGreaterThan(computeBalance(imbalanced))
  })
})

// ─── classifyDecompositionType ─────────────────────────────────────────────────

describe('classifyDecompositionType', () => {
  it('classifies >=80 as pure', () => {
    expect(classifyDecompositionType(80)).toBe('pure')
    expect(classifyDecompositionType(95)).toBe('pure')
  })

  it('classifies 60-79 as blend', () => {
    expect(classifyDecompositionType(60)).toBe('blend')
    expect(classifyDecompositionType(75)).toBe('blend')
  })

  it('classifies 40-59 as white', () => {
    expect(classifyDecompositionType(40)).toBe('white')
    expect(classifyDecompositionType(55)).toBe('white')
  })

  it('classifies <40 as muddy', () => {
    expect(classifyDecompositionType(30)).toBe('muddy')
    expect(classifyDecompositionType(10)).toBe('muddy')
  })
})

// ─── buildSpectralLayers ───────────────────────────────────────────────────────

describe('buildSpectralLayers', () => {
  it('returns 8 layers', () => {
    const layers = buildSpectralLayers([])
    expect(layers).toHaveLength(8)
  })

  it('aggregates intensities', () => {
    const decompositions: ConcernDecomposition[] = [
      { file: 'a.ts', layers: { logic: 60, dataFlow: 20 }, dominantConcern: 'logic', purity: 80, type: 'pure', balance: 50 },
    ]
    const layers = buildSpectralLayers(decompositions)
    const logicLayer = layers.find((l) => l.name === 'logic')
    expect(logicLayer!.intensity).toBe(60)
  })

  it('tracks files per layer', () => {
    const decompositions: ConcernDecomposition[] = [
      { file: 'a.ts', layers: { logic: 60, dataFlow: 20 }, dominantConcern: 'logic', purity: 80, type: 'pure', balance: 50 },
    ]
    const layers = buildSpectralLayers(decompositions)
    const logicLayer = layers.find((l) => l.name === 'logic')
    expect(logicLayer!.files).toContain('a.ts')
  })
})

// ─── computeOverallPurity ──────────────────────────────────────────────────────

describe('computeOverallPurity', () => {
  it('returns 0 for empty', () => {
    expect(computeOverallPurity([])).toBe(0)
  })

  it('averages purity', () => {
    const decomps: ConcernDecomposition[] = [
      { file: 'a.ts', layers: {}, dominantConcern: 'logic', purity: 80, type: 'pure', balance: 50 },
      { file: 'b.ts', layers: {}, dominantConcern: 'logic', purity: 60, type: 'blend', balance: 40 },
    ]
    expect(computeOverallPurity(decomps)).toBe(70)
  })
})

// ─── computeSpectrumCompleteness ───────────────────────────────────────────────

describe('computeSpectrumCompleteness', () => {
  it('returns 100 for all represented', () => {
    const layers: SpectralLayer[] = [
      { name: 'logic', color: 'red', intensity: 30, files: [] },
      { name: 'dataFlow', color: 'orange', intensity: 20, files: [] },
      { name: 'errorHandling', color: 'yellow', intensity: 10, files: [] },
      { name: 'typing', color: 'green', intensity: 15, files: [] },
      { name: 'configuration', color: 'blue', intensity: 8, files: [] },
      { name: 'presentation', color: 'indigo', intensity: 12, files: [] },
      { name: 'testing', color: 'violet', intensity: 6, files: [] },
      { name: 'orchestration', color: 'white', intensity: 25, files: [] },
    ]
    expect(computeSpectrumCompleteness(layers)).toBe(100)
  })

  it('returns lower for missing concerns', () => {
    const layers: SpectralLayer[] = [
      { name: 'logic', color: 'red', intensity: 30, files: [] },
      { name: 'dataFlow', color: 'orange', intensity: 0, files: [] },
      { name: 'errorHandling', color: 'yellow', intensity: 0, files: [] },
      { name: 'typing', color: 'green', intensity: 0, files: [] },
      { name: 'configuration', color: 'blue', intensity: 0, files: [] },
      { name: 'presentation', color: 'indigo', intensity: 0, files: [] },
      { name: 'testing', color: 'violet', intensity: 0, files: [] },
      { name: 'orchestration', color: 'white', intensity: 25, files: [] },
    ]
    const result = computeSpectrumCompleteness(layers)
    expect(result).toBeLessThan(50)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: SpectrumStats = {
    totalFiles: 5, pureFiles: 2, blendFiles: 1, whiteFiles: 1, muddyFiles: 1,
    avgPurity: 60, avgBalance: 50, dominantConcern: 'logic', rarestConcern: 'testing',
    colorDistribution: {}, overallPurity: 60, spectrumCompleteness: 75,
  }

  it('recommends separating white files', () => {
    const decomps: ConcernDecomposition[] = [
      { file: 'mixed.ts', layers: {}, dominantConcern: 'logic', purity: 45, type: 'white', balance: 30 },
    ]
    const recs = generateRecommendations(decomps, [], baseStats)
    expect(recs.some((r) => r.includes('white'))).toBe(true)
  })

  it('recommends refactoring muddy files', () => {
    const decomps: ConcernDecomposition[] = [
      { file: 'mess.ts', layers: {}, dominantConcern: 'logic', purity: 20, type: 'muddy', balance: 10 },
    ]
    const recs = generateRecommendations(decomps, [], baseStats)
    expect(recs.some((r) => r.includes('muddy'))).toBe(true)
  })

  it('flags missing concerns', () => {
    const layers: SpectralLayer[] = [
      { name: 'logic', color: 'red', intensity: 30, files: [] },
      { name: 'testing', color: 'violet', intensity: 2, files: [] },
    ]
    const recs = generateRecommendations([], layers, baseStats)
    expect(recs.some((r) => r.includes('Underrepresented'))).toBe(true)
  })

  it('celebrates pure files', () => {
    const decomps: ConcernDecomposition[] = [
      { file: 'clean.ts', layers: {}, dominantConcern: 'logic', purity: 90, type: 'pure', balance: 80 },
    ]
    const recs = generateRecommendations(decomps, [], baseStats)
    expect(recs.some((r) => r.includes('pure'))).toBe(true)
  })

  it('praises good purity', () => {
    const stats = { ...baseStats, overallPurity: 75 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('well-decomposed'))).toBe(true)
  })

  it('gives all-clear when balanced', () => {
    const perfectStats: SpectrumStats = {
      totalFiles: 1, pureFiles: 1, blendFiles: 0, whiteFiles: 0, muddyFiles: 0,
      avgPurity: 80, avgBalance: 70, dominantConcern: 'logic', rarestConcern: 'testing',
      colorDistribution: {}, overallPurity: 50, spectrumCompleteness: 100,
    }
    const recs = generateRecommendations([], [], perfectStats)
    expect(recs.some((r) => r.includes('well-balanced') || r.includes('pure'))).toBe(true)
  })
})

// ─── buildSpectrumResult ───────────────────────────────────────────────────────

describe('buildSpectrumResult', () => {
  it('returns empty for no files', () => {
    const result = buildSpectrumResult([], [], {})
    expect(result.decompositions).toEqual([])
    expect(result.profiles).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('builds result for simple file', () => {
    const result = buildSpectrumResult(['utils.ts'], ['const MAX = 100\nexport function add(a, b) { return a + b }'], {})
    expect(result.decompositions).toHaveLength(1)
    expect(result.profiles).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('computes stats correctly', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      'if (x) { return y }\nconst z = arr.map(i => i)\n',
      'describe("test", () => { it("works", () => { expect(1).toBe(1) }) })\n',
    ]
    const result = buildSpectrumResult(files, contents, {})
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.dominantConcern).toBeTruthy()
    expect(result.stats.rarestConcern).toBeTruthy()
  })

  it('computes overall purity', () => {
    const result = buildSpectrumResult(['a.ts'], ['if (x) { return y }'], {})
    expect(result.stats.overallPurity).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallPurity).toBeLessThanOrEqual(100)
  })

  it('computes spectrum completeness', () => {
    const result = buildSpectrumResult(['a.ts'], ['if (x) { return y }'], {})
    expect(result.stats.spectrumCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.spectrumCompleteness).toBeLessThanOrEqual(100)
  })

  it('builds spectral layers', () => {
    const result = buildSpectrumResult(['a.ts'], ['import { x } from "y"\nexport function run() {}'], {})
    expect(result.layers).toHaveLength(8)
  })

  it('generates recommendations', () => {
    const result = buildSpectrumResult(['a.ts'], ['if (x) { return y }'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('classifies decomposition types', () => {
    const result = buildSpectrumResult(['a.ts'], ['if (x) { return y }'], {})
    expect(['pure', 'blend', 'white', 'muddy']).toContain(result.decompositions[0].type)
  })

  it('handles multiple files', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      'if (x) { return y }\n',
      'describe("test", () => { it("works", () => {} ) })\n',
      'interface Foo { x: string }\n',
    ]
    const result = buildSpectrumResult(files, contents, {})
    expect(result.decompositions).toHaveLength(3)
  })

  it('computes color distribution', () => {
    const result = buildSpectrumResult(['a.ts'], ['if (x) { return y }'], {})
    expect(Object.keys(result.stats.colorDistribution)).toContain('logic')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatSpectrumBar', () => {
  it('formats a decomposition bar', () => {
    const decomp: ConcernDecomposition = {
      file: 'app.ts', layers: { logic: 60, dataFlow: 30 }, dominantConcern: 'logic', purity: 75, type: 'blend', balance: 50,
    }
    const result = formatSpectrumBar(decomp)
    expect(result).toContain('app.ts')
    expect(result).toContain('75%')
  })
})

describe('formatDecompositions', () => {
  it('handles empty', () => {
    expect(formatDecompositions([])).toContain('No decompositions')
  })

  it('formats decompositions', () => {
    const decomps: ConcernDecomposition[] = [
      { file: 'a.ts', layers: { logic: 60 }, dominantConcern: 'logic', purity: 80, type: 'pure', balance: 50 },
    ]
    const result = formatDecompositions(decomps)
    expect(result).toContain('a.ts')
  })
})

describe('formatSpectrumStats', () => {
  it('formats stats', () => {
    const stats: SpectrumStats = {
      totalFiles: 10, pureFiles: 3, blendFiles: 4, whiteFiles: 2, muddyFiles: 1,
      avgPurity: 65, avgBalance: 55, dominantConcern: 'logic', rarestConcern: 'testing',
      colorDistribution: {}, overallPurity: 65, spectrumCompleteness: 80,
    }
    const result = formatSpectrumStats(stats)
    expect(result).toContain('10')
    expect(result).toContain('logic')
  })
})

describe('formatRecommendations', () => {
  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Refactor', 'Add tests'])).toContain('Refactor')
  })
})

describe('formatSpectrumTable', () => {
  it('formats full result', () => {
    const result: SpectrumResult = {
      decompositions: [], layers: [], profiles: [],
      stats: {
        totalFiles: 0, pureFiles: 0, blendFiles: 0, whiteFiles: 0, muddyFiles: 0,
        avgPurity: 0, avgBalance: 0, dominantConcern: 'none', rarestConcern: 'none',
        colorDistribution: {}, overallPurity: 0, spectrumCompleteness: 0,
      },
      recommendations: [],
    }
    const output = formatSpectrumTable(result)
    expect(output).toContain('Spectrum Analysis')
  })
})

describe('formatSpectrumJSON', () => {
  it('outputs valid JSON', () => {
    const result: SpectrumResult = {
      decompositions: [], layers: [], profiles: [],
      stats: {
        totalFiles: 0, pureFiles: 0, blendFiles: 0, whiteFiles: 0, muddyFiles: 0,
        avgPurity: 0, avgBalance: 0, dominantConcern: 'none', rarestConcern: 'none',
        colorDistribution: {}, overallPurity: 0, spectrumCompleteness: 0,
      },
      recommendations: [],
    }
    const output = formatSpectrumJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})
