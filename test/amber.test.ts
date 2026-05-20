import { describe, expect, it } from 'vitest'
import {
  evaluatePreservation,
  estimateAge,
  detectFossilization,
  detectDegrading,
  analyzeGeologicalLayers,
  identifyFossilArtifacts,
  classifySpecimen,
  computePreservationIndex,
  computeFossilizationRisk,
  classifyOverall,
  evaluateQuality,
  computeResinFreshness,
  detectInclusions,
  detectTimelessPatterns,
  computeGeologicalComplexity,
  generateRecommendations,
  buildAmberResult,
  type PreservedSpecimen,
  type FossilArtifact,
  type AmberStats,
} from '../src/commands/amber-helpers.js'

// ─── evaluatePreservation ────────────────────────────────

describe('evaluatePreservation', () => {
  it('returns 50 for empty content', () => {
    expect(evaluatePreservation('', 'a.ts')).toBe(50)
  })

  it('returns high score for well-documented code', () => {
    const code = '/** docs */\nexport function foo(): void {}'
    expect(evaluatePreservation(code, 'a.ts')).toBeGreaterThan(60)
  })

  it('penalizes TODO/FIXME', () => {
    const code = 'function foo() {}\n// TODO: fix this\n// FIXME: broken'
    expect(evaluatePreservation(code, 'a.ts')).toBeLessThan(60)
  })

  it('penalizes deprecated markers', () => {
    const code = '/** @deprecated */\nfunction foo() {}'
    const preserved = evaluatePreservation('function foo() {}', 'a.ts')
    const withDeprecated = evaluatePreservation(code, 'a.ts')
    expect(withDeprecated).toBeLessThan(preserved + 5)
  })

  it('penalizes console.log', () => {
    const without = evaluatePreservation('function foo() {}', 'a.ts')
    const withConsole = evaluatePreservation('function foo() {\n  console.log("debug")\n  console.log("more")\n}', 'a.ts')
    expect(withConsole).toBeLessThan(without)
  })

  it('penalizes any type', () => {
    const code = 'function foo(x: any): any {}'
    const score = evaluatePreservation(code, 'a.ts')
    expect(score).toBeLessThanOrEqual(60)
  })

  it('penalizes empty catch', () => {
    const code = 'try { x() } catch (e) {}'
    expect(evaluatePreservation(code, 'a.ts')).toBeLessThan(60)
  })

  it('penalizes very long files', () => {
    const code = 'const x = 1\n'.repeat(600)
    expect(evaluatePreservation(code, 'a.ts')).toBeLessThan(60)
  })

  it('boosts for type annotations', () => {
    const code = 'function foo(x: number): string { return String(x) }'
    expect(evaluatePreservation(code, 'a.ts')).toBeGreaterThan(55)
  })

  it('boosts for interfaces', () => {
    const code = 'interface Config { key: string }'
    expect(evaluatePreservation(code, 'a.ts')).toBeGreaterThan(60)
  })

  it('clamps to 0-100', () => {
    const code = '/** docs */\nexport function foo(): void {}'
    const score = evaluatePreservation(code, 'a.ts')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── estimateAge ─────────────────────────────────────────

describe('estimateAge', () => {
  it('classifies modern code as recent', () => {
    const code = 'const foo = () => {}\nasync function bar() { await baz() }'
    expect(estimateAge(code, 'a.ts')).toBe('recent')
  })

  it('classifies code with no patterns as established', () => {
    expect(estimateAge('', 'a.ts')).toBe('established')
  })

  it('classifies legacy code as ancient or fossilized', () => {
    const code = 'var x = require("foo")\nfunction bar() {}'
    const age = estimateAge(code, 'a.ts')
    expect(age === 'ancient' || age === 'fossilized').toBe(true)
  })

  it('classifies eval/arguments.callee as fossilized', () => {
    const code = 'var x = eval("1+2")\narguments.callee'
    expect(estimateAge(code, 'a.ts')).toBe('fossilized')
  })
})

// ─── detectFossilization ─────────────────────────────────

describe('detectFossilization', () => {
  it('returns false for simple modules', () => {
    expect(detectFossilization('export function foo() {}', 'a.ts', [])).toBe(false)
  })

  it('returns true for many exports', () => {
    const code = Array.from({ length: 9 }, (_, i) => `export function fn${i}() {}`).join('\n')
    expect(detectFossilization(code, 'a.ts', [])).toBe(true)
  })

  it('returns true for giant monolith', () => {
    const code = 'function mega() {\n' + '  const x = 1\n'.repeat(450) + '}'
    expect(detectFossilization(code, 'a.ts', [])).toBe(true)
  })

  it('returns true for many imports', () => {
    const code = Array.from({ length: 11 }, (_, i) => `import { m${i} } from './m${i}'`).join('\n')
    expect(detectFossilization(code, 'a.ts', [])).toBe(true)
  })

  it('returns false for clean modular code', () => {
    const code = 'import { foo } from "./bar"\nexport function baz() {}'
    expect(detectFossilization(code, 'a.ts', [])).toBe(false)
  })
})

// ─── detectDegrading ─────────────────────────────────────

describe('detectDegrading', () => {
  it('returns false for clean code', () => {
    expect(detectDegrading('const x = 1', 'a.ts')).toBe(false)
  })

  it('returns false for empty content', () => {
    expect(detectDegrading('', 'a.ts')).toBe(false)
  })

  it('returns true for high TODO density', () => {
    const lines = ['// TODO fix', '// FIXME broken', '// XXX hack', '// TODO more']
    expect(detectDegrading(lines.join('\n'), 'a.ts')).toBe(true)
  })

  it('returns false for low TODO density', () => {
    const code = 'const x = 1\n' + 'const y = 2\n'.repeat(30) + '// TODO: fix later'
    expect(detectDegrading(code, 'a.ts')).toBe(false)
  })
})

// ─── analyzeGeologicalLayers ─────────────────────────────

describe('analyzeGeologicalLayers', () => {
  it('returns at least one layer', () => {
    const layers = analyzeGeologicalLayers('const x = 1', 'a.ts')
    expect(layers.length).toBeGreaterThan(0)
  })

  it('detects different depths', () => {
    const code = 'function foo() {\n  if (x) {\n    while(y) {}\n  }\n}'
    const layers = analyzeGeologicalLayers(code, 'a.ts')
    const depths = Array.from(new Set(layers.map((l) => l.depth)))
    expect(depths.length).toBeGreaterThan(1)
  })

  it('detects layer patterns', () => {
    const code = 'import { foo } from "./bar"\nexport function baz() {}'
    const layers = analyzeGeologicalLayers(code, 'a.ts')
    const patterns = layers.map((l) => l.pattern)
    expect(patterns.length).toBeGreaterThan(0)
  })

  it('assigns quality scores', () => {
    const code = 'const x: number = 1'
    const layers = analyzeGeologicalLayers(code, 'a.ts')
    for (const layer of layers) {
      expect(layer.quality).toBeGreaterThanOrEqual(0)
      expect(layer.quality).toBeLessThanOrEqual(100)
    }
  })

  it('detects eroding layers with TODO', () => {
    const code = 'TODO broken\nTODO broken\nTODO broken\nTODO broken\nTODO broken'
    const layers = analyzeGeologicalLayers(code, 'a.ts')
    const eroding = layers.filter((l) => l.isEroding)
    expect(eroding.length).toBeGreaterThan(0)
  })
})

// ─── identifyFossilArtifacts ─────────────────────────────

describe('identifyFossilArtifacts', () => {
  it('detects deprecated patterns', () => {
    const fossils = identifyFossilArtifacts('/** @deprecated */\nfunction foo() {}', 'a.ts')
    expect(fossils.some((f) => f.type === 'deprecated-pattern')).toBe(true)
  })

  it('detects dead code (commented-out)', () => {
    const fossils = identifyFossilArtifacts('// function foo() {}\nconst x = 1', 'a.ts')
    expect(fossils.some((f) => f.type === 'dead-code')).toBe(true)
  })

  it('detects unused imports', () => {
    const code = "import { unused } from './mod'\nconst x = 1"
    const fossils = identifyFossilArtifacts(code, 'a.ts')
    expect(fossils.some((f) => f.type === 'unused-import')).toBe(true)
  })

  it('does not flag used imports', () => {
    const code = "import { used } from './mod'\nconst x = used()"
    const fossils = identifyFossilArtifacts(code, 'a.ts')
    const unused = fossils.filter((f) => f.type === 'unused-import' && f.description.includes('used'))
    expect(unused).toHaveLength(0)
  })

  it('detects legacy API usage', () => {
    const fossils = identifyFossilArtifacts('eval("1+2")', 'a.ts')
    expect(fossils.some((f) => f.type === 'legacy-api')).toBe(true)
  })

  it('detects outdated idiom (var)', () => {
    const fossils = identifyFossilArtifacts('var x = 1', 'a.ts')
    expect(fossils.some((f) => f.type === 'outdated-idiom')).toBe(true)
  })

  it('detects zombie code (suppression)', () => {
    const fossils = identifyFossilArtifacts('// eslint-disable-next-line', 'a.ts')
    expect(fossils.some((f) => f.type === 'zombie-code')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const code = 'const x = 1\nexport function foo() {}'
    const fossils = identifyFossilArtifacts(code, 'a.ts')
    expect(fossils).toHaveLength(0)
  })

  it('includes line numbers', () => {
    const fossils = identifyFossilArtifacts('const x = 1\nvar y = 2', 'a.ts')
    const varFossil = fossils.find((f) => f.type === 'outdated-idiom')
    expect(varFossil).toBeDefined()
    expect(varFossil!.line).toBe(2)
  })
})

// ─── classifySpecimen ────────────────────────────────────

describe('classifySpecimen', () => {
  it('classifies fossilized age', () => {
    expect(classifySpecimen(90, 90, 'fossilized')).toBe('fossilized')
  })

  it('classifies perfect preservation', () => {
    expect(classifySpecimen(90, 85, 'recent')).toBe('perfect-preservation')
  })

  it('classifies well preserved', () => {
    expect(classifySpecimen(65, 65, 'established')).toBe('well-preserved')
  })

  it('classifies partially preserved', () => {
    expect(classifySpecimen(45, 45, 'mature')).toBe('partially-preserved')
  })

  it('classifies degraded', () => {
    expect(classifySpecimen(20, 20, 'recent')).toBe('degraded')
  })

  it('fossilized age overrides quality', () => {
    expect(classifySpecimen(100, 100, 'fossilized')).toBe('fossilized')
  })
})

// ─── computePreservationIndex ────────────────────────────

describe('computePreservationIndex', () => {
  it('returns 100 for no specimens', () => {
    expect(computePreservationIndex([])).toBe(100)
  })

  it('averages preservation scores', () => {
    const specimens = [
      { preservation: 80 } as PreservedSpecimen,
      { preservation: 60 } as PreservedSpecimen,
    ]
    expect(computePreservationIndex(specimens)).toBe(70)
  })
})

// ─── computeFossilizationRisk ────────────────────────────

describe('computeFossilizationRisk', () => {
  it('returns 0 for no specimens', () => {
    expect(computeFossilizationRisk([])).toBe(0)
  })

  it('computes risk from at-risk specimens', () => {
    const specimens = [
      { isFossilized: false, isDegrading: false, age: 'recent' } as PreservedSpecimen,
      { isFossilized: true, isDegrading: false, age: 'ancient' } as PreservedSpecimen,
    ]
    expect(computeFossilizationRisk(specimens)).toBe(50)
  })

  it('counts degrading as at-risk', () => {
    const specimens = [
      { isFossilized: false, isDegrading: false, age: 'recent' } as PreservedSpecimen,
      { isFossilized: false, isDegrading: true, age: 'established' } as PreservedSpecimen,
    ]
    expect(computeFossilizationRisk(specimens)).toBe(50)
  })
})

// ─── classifyOverall ─────────────────────────────────────

describe('classifyOverall', () => {
  it('returns pristine-collection for high scores', () => {
    expect(classifyOverall(90, 10)).toBe('pristine-collection')
  })

  it('returns well-curated for good scores', () => {
    expect(classifyOverall(70, 30)).toBe('well-curated')
  })

  it('returns natural-history for medium scores', () => {
    expect(classifyOverall(50, 50)).toBe('natural-history')
  })

  it('returns quarry for low scores', () => {
    expect(classifyOverall(30, 70)).toBe('quarry')
  })

  it('returns tar-pits for very low scores', () => {
    expect(classifyOverall(10, 90)).toBe('tar-pits')
  })
})

// ─── evaluateQuality ─────────────────────────────────────

describe('evaluateQuality', () => {
  it('returns 50 for empty content', () => {
    expect(evaluateQuality('', 'a.ts')).toBe(50)
  })

  it('boosts for type annotations', () => {
    const score = evaluateQuality('const x: number = 1', 'a.ts')
    expect(score).toBeGreaterThan(50)
  })

  it('boosts for interfaces', () => {
    const score = evaluateQuality('interface Config { key: string }', 'a.ts')
    expect(score).toBeGreaterThan(50)
  })

  it('penalizes any type', () => {
    const score = evaluateQuality('function foo(x: any) {}', 'a.ts')
    expect(score).toBeLessThan(50)
  })

  it('penalizes empty catch', () => {
    const score = evaluateQuality('try {} catch (e) {}', 'a.ts')
    expect(score).toBeLessThan(50)
  })

  it('penalizes eval', () => {
    const score = evaluateQuality('eval("1")', 'a.ts')
    expect(score).toBeLessThan(50)
  })

  it('clamps to 0-100', () => {
    const score = evaluateQuality('const x: number = 1\nexport function foo(): void {}', 'a.ts')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── computeResinFreshness ───────────────────────────────

describe('computeResinFreshness', () => {
  it('returns 90 for recent', () => {
    expect(computeResinFreshness('recent')).toBe(90)
  })

  it('returns 70 for established', () => {
    expect(computeResinFreshness('established')).toBe(70)
  })

  it('returns 50 for mature', () => {
    expect(computeResinFreshness('mature')).toBe(50)
  })

  it('returns 30 for ancient', () => {
    expect(computeResinFreshness('ancient')).toBe(30)
  })

  it('returns 10 for fossilized', () => {
    expect(computeResinFreshness('fossilized')).toBe(10)
  })
})

// ─── detectInclusions ────────────────────────────────────

describe('detectInclusions', () => {
  it('returns false for few imports', () => {
    expect(detectInclusions("import { foo } from './a'")).toBe(false)
  })

  it('returns true for many import sources', () => {
    const code = Array.from({ length: 7 }, (_, i) => `import { m${i} } from './m${i}'`).join('\n')
    expect(detectInclusions(code)).toBe(true)
  })

  it('returns false for no imports', () => {
    expect(detectInclusions('const x = 1')).toBe(false)
  })
})

// ─── detectTimelessPatterns ──────────────────────────────

describe('detectTimelessPatterns', () => {
  it('detects pure interfaces', () => {
    expect(detectTimelessPatterns('interface Config {\n  key: string\n}')).toBe(true)
  })

  it('detects well-documented exports', () => {
    const code = '/** docs */\nexport function foo() {}'
    expect(detectTimelessPatterns(code)).toBe(true)
  })

  it('detects typed utility functions', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}'
    expect(detectTimelessPatterns(code)).toBe(true)
  })

  it('returns false for messy code', () => {
    expect(detectTimelessPatterns('var x = 1; // TODO fix')).toBe(false)
  })
})

// ─── computeGeologicalComplexity ─────────────────────────

describe('computeGeologicalComplexity', () => {
  it('returns 0 for no specimens', () => {
    expect(computeGeologicalComplexity([])).toBe(0)
  })

  it('computes complexity from layers', () => {
    const specimens = [
      { layers: [{ depth: 0 }, { depth: 1 }, { depth: 2 }] } as PreservedSpecimen,
    ]
    expect(computeGeologicalComplexity(specimens)).toBe(30)
  })

  it('caps at 100', () => {
    const specimens = [
      { layers: Array.from({ length: 15 }, () => ({ depth: 0 })) } as PreservedSpecimen,
    ]
    expect(computeGeologicalComplexity(specimens)).toBe(100)
  })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for fossilized code', () => {
    const stats = { fossilized: 2, degrading: 0, excavationRequired: 0, fossilizationRisk: 20, overallPreservation: 'well-curated' } as AmberStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('fossilized'))).toBe(true)
  })

  it('recommends for degrading code', () => {
    const stats = { fossilized: 0, degrading: 3, excavationRequired: 0, fossilizationRisk: 20, overallPreservation: 'well-curated' } as AmberStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('degrading') || r.includes('Degrading'))).toBe(true)
  })

  it('recommends for trivial fossils', () => {
    const fossils = [{ difficulty: 'trivial' } as FossilArtifact]
    const stats = { fossilized: 0, degrading: 0, excavationRequired: 0, fossilizationRisk: 10, overallPreservation: 'pristine-collection' } as AmberStats
    const recs = generateRecommendations([], fossils, stats)
    expect(recs.some((r) => r.includes('trivial'))).toBe(true)
  })

  it('recommends for excavation required', () => {
    const stats = { fossilized: 0, degrading: 0, excavationRequired: 2, fossilizationRisk: 10, overallPreservation: 'well-curated' } as AmberStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('difficult') || r.includes('artifact'))).toBe(true)
  })

  it('recommends for high fossilization risk', () => {
    const stats = { fossilized: 0, degrading: 0, excavationRequired: 0, fossilizationRisk: 60, overallPreservation: 'quarry' } as AmberStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('fossilization risk') || r.includes('abstraction'))).toBe(true)
  })

  it('recommends for tar-pits', () => {
    const stats = { fossilized: 0, degrading: 0, excavationRequired: 0, fossilizationRisk: 10, overallPreservation: 'tar-pits' } as AmberStats
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('tar-pits') || r.includes('roadmap'))).toBe(true)
  })

  it('returns empty for clean state', () => {
    const stats = { fossilized: 0, degrading: 0, excavationRequired: 0, fossilizationRisk: 10, overallPreservation: 'pristine-collection' } as AmberStats
    expect(generateRecommendations([], [], stats)).toEqual([])
  })
})

// ─── buildAmberResult ────────────────────────────────────

describe('buildAmberResult', () => {
  it('returns full result structure', () => {
    const result = buildAmberResult(['a.ts'], ['export function foo() {}'], {})
    expect(result.specimens).toBeDefined()
    expect(result.fossils).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty input', () => {
    const result = buildAmberResult([], [], {})
    expect(result.stats.totalSpecimens).toBe(0)
    expect(result.stats.preservationIndex).toBe(100)
    expect(result.stats.overallPreservation).toBe('pristine-collection')
  })

  it('creates specimens for each file', () => {
    const result = buildAmberResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.specimens).toHaveLength(2)
  })

  it('detects fossils in legacy code', () => {
    const result = buildAmberResult(['a.ts'], ['var x = 1\n// TODO fix'], {})
    expect(result.fossils.length).toBeGreaterThan(0)
  })

  it('computes preservation stats', () => {
    const result = buildAmberResult(['a.ts'], ['export function foo(): void {}'], {})
    expect(result.stats.avgPreservation).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgResinFreshness).toBeGreaterThanOrEqual(0)
  })

  it('classifies overall preservation', () => {
    const result = buildAmberResult(['a.ts'], ['export function foo(): void {}'], {})
    expect(['pristine-collection', 'well-curated', 'natural-history', 'quarry', 'tar-pits']).toContain(result.stats.overallPreservation)
  })

  it('detects geological layers', () => {
    const result = buildAmberResult(['a.ts'], ['function foo() {\n  if (x) {\n    const y = 1\n  }\n}'], {})
    expect(result.specimens[0].layers.length).toBeGreaterThan(0)
  })
})
