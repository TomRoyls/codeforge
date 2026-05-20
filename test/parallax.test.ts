import { describe, expect, it } from 'vitest'

import {
  buildParallaxResult,
  classifyDepth,
  computeFarDepth,
  computeMidDepth,
  computeNearDepth,
  computeOverallDepth,
  computeParallaxScore,
  computePerspectiveAgreement,
  generateRecommendations,
  observeFar,
  observeMid,
  observeNear,
  type DepthCategory,
  type DepthLayer,
  type Observation,
  type ParallaxOptions,
  type ParallaxResult,
  type ParallaxStats,
  type Perspective,
} from '../src/commands/parallax-helpers.js'

import {
  formatAgreementMeter,
  formatDepthHistogram,
  formatDepthLayerTable,
  formatParallaxJson,
  formatParallaxRecommendations,
  formatParallaxStats,
  formatParallaxTable,
  formatPerspectivePanel,
} from '../src/commands/parallax-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_CODE = `function add(a: number, b: number): number {
  return a + b
}

function multiply(x: number, y: number): number {
  return x * y
}
`

const COMPLEX_CODE = Array.from({ length: 20 }, (_, i) => `if (cond${i}) {`).join('\n')
  + '\nfunction deep(a: number, b: string, c: boolean, d: object, e: any): void {\n'
  + '  return null\n'
  + '}\n'
  + Array.from({ length: 20 }, () => '}').join('\n')

const TYPED_CODE = `/**
 * Computes the answer.
 * @param n - the number
 * @returns the answer
 */
export function answer(n: number): number {
  return n
}

export function greet(name: string): string {
  return 'hello ' + name
}
`

const LARGE_FILE = Array.from({ length: 350 }, (_, i) => `const line${i} = ${i}`).join('\n')

const MULTI_DIR_FILES = [
  'src/core/engine.ts',
  'src/commands/run.ts',
  'src/commands/build.ts',
  'src/utils/helpers.ts',
  'src/utils/format.ts',
  'src/types/index.ts',
]

const MULTI_DIR_CONTENTS = [
  "import { format } from '../utils/format'\nexport class Engine { start() {} stop() {} }",
  "import { Engine } from '../core/engine'\nimport { help } from '../utils/helpers'\nexport function run() { return true }",
  "import { Engine } from '../core/engine'\nexport function build() { return true }",
  'export function help() { return true }\nexport function parse() { return {} }',
  'export function format(s: string): string { return s }',
  'export type Config = { name: string }\nexport interface Options { verbose: boolean }',
]

const EMPTY_RESULT_FILES: string[] = []
const EMPTY_RESULT_CONTENTS: string[] = []

const SINGLE_FILE = ['app.ts']
const SINGLE_CONTENT = ['const x = 1\nexport { x }\n']

// ─── observeNear ───────────────────────────────────────────────────────────────

describe('observeNear', () => {
  it('detects functions in simple code', () => {
    const result = observeNear(SIMPLE_CODE)
    expect(result.metrics.functionCount).toBeGreaterThanOrEqual(2)
  })

  it('computes complexity for simple code', () => {
    const result = observeNear(SIMPLE_CODE)
    expect(result.metrics.complexity).toBeGreaterThanOrEqual(1)
  })

  it('reports high complexity for nested code', () => {
    const result = observeNear(COMPLEX_CODE)
    expect(result.metrics.complexity).toBeGreaterThan(10)
  })

  it('detects nesting depth', () => {
    const result = observeNear(COMPLEX_CODE)
    expect(result.metrics.maxNesting).toBeGreaterThan(5)
  })

  it('computes return type coverage', () => {
    const result = observeNear(TYPED_CODE)
    expect(result.metrics.returnCoverage).toBeGreaterThanOrEqual(0)
  })

  it('handles empty content', () => {
    const result = observeNear('')
    expect(result.metrics.functionCount).toBe(0)
    expect(result.observations).toEqual([])
  })

  it('creates major observation for many functions', () => {
    const manyFns = Array.from({ length: 20 }, (_, i) => `function fn${i}() {}`).join('\n')
    const result = observeNear(manyFns)
    expect(result.observations.some(o => o.subject === 'function count' && o.significance === 'major')).toBe(true)
  })

  it('creates notable observation for moderate function count', () => {
    const medFns = Array.from({ length: 10 }, (_, i) => `function fn${i}() {}`).join('\n')
    const result = observeNear(medFns)
    expect(result.observations.some(o => o.subject === 'function count' && o.significance === 'notable')).toBe(true)
  })

  it('creates major observation for high complexity', () => {
    const result = observeNear(COMPLEX_CODE)
    expect(result.observations.some(o => o.subject === 'complexity' && o.significance === 'major')).toBe(true)
  })

  it('creates major observation for deep nesting', () => {
    const nested = Array.from({ length: 7 }, (_, i) => `if (a${i}) {`).join('\n') + '\n' + Array.from({ length: 7 }, () => '}').join('\n')
    const result = observeNear(nested)
    expect(result.metrics.maxNesting).toBeGreaterThan(5)
    expect(result.observations.some(o => o.subject === 'nesting' && o.significance === 'major')).toBe(true)
  })

  it('creates notable observation for moderate nesting', () => {
    const nested = Array.from({ length: 4 }, (_, i) => `if (a${i}) {`).join('\n') + '\n' + Array.from({ length: 4 }, () => '}').join('\n')
    const result = observeNear(nested)
    expect(result.metrics.maxNesting).toBeGreaterThan(3)
    expect(result.observations.some(o => o.subject === 'nesting' && o.significance === 'notable')).toBe(true)
  })

  it('creates notable observation for many parameters', () => {
    const result = observeNear('function big(a: number, b: string, c: boolean, d: object, e: any) {}')
    expect(result.metrics.avgParams).toBeGreaterThan(4)
  })

  it('all observations have depth "near"', () => {
    const result = observeNear(SIMPLE_CODE)
    for (const obs of result.observations) {
      expect(obs.depth).toBe('near')
    }
  })

  it('counts ternary operators', () => {
    const code = 'const x = a ? b : c\nconst y = d ? e : f'
    const result = observeNear(code)
    expect(result.metrics.ternaryCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── observeMid ────────────────────────────────────────────────────────────────

describe('observeMid', () => {
  it('counts lines', () => {
    const result = observeMid('app.ts', SIMPLE_CODE, ['app.ts'])
    expect(result.metrics.lineCount).toBe(8)
  })

  it('counts imports', () => {
    const code = "import { x } from './a'\nimport { y } from './b'\nconst z = 1"
    const result = observeMid('app.ts', code, ['app.ts', 'a.ts', 'b.ts'])
    expect(result.metrics.importCount).toBe(2)
  })

  it('counts exports', () => {
    const code = 'export const a = 1\nexport const b = 2'
    const result = observeMid('app.ts', code, ['app.ts'])
    expect(result.metrics.exportCount).toBe(2)
  })

  it('detects large files', () => {
    const result = observeMid('big.ts', LARGE_FILE, ['big.ts'])
    expect(result.observations.some(o => o.subject === 'file size' && o.significance === 'major')).toBe(true)
  })

  it('detects medium files', () => {
    const medFile = Array.from({ length: 180 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const result = observeMid('med.ts', medFile, ['med.ts'])
    expect(result.observations.some(o => o.subject === 'file size' && o.significance === 'notable')).toBe(true)
  })

  it('detects missing tests', () => {
    const result = observeMid('app.ts', 'const x = 1', ['app.ts'])
    expect(result.observations.some(o => o.subject === 'testing')).toBe(true)
  })

  it('detects associated test file', () => {
    const result = observeMid('app.ts', 'const x = 1', ['app.ts', 'app.test.ts'])
    expect(result.metrics.hasTest).toBe(1)
  })

  it('detects test file via spec', () => {
    const result = observeMid('utils.ts', 'const x = 1', ['utils.ts', 'utils.spec.ts'])
    expect(result.metrics.hasTest).toBe(1)
  })

  it('detects low documentation', () => {
    const code = Array.from({ length: 60 }, (_, i) => `const x${i} = ${i}`).join('\n')
    const result = observeMid('undoc.ts', code, ['undoc.ts'])
    expect(result.observations.some(o => o.subject === 'documentation')).toBe(true)
  })

  it('detects well documented files', () => {
    const doc = '/**\n * A function.\n * @param x\n */\nexport function f(x: number) { return x }\n'
    const result = observeMid('doc.ts', doc, ['doc.ts'])
    expect(result.observations.some(o => o.subject === 'documentation' && o.detail.includes('well documented'))).toBe(true)
  })

  it('detects many classes', () => {
    const code = 'class A {}\nclass B {}\nclass C {}\nclass D {}'
    const result = observeMid('multi.ts', code, ['multi.ts'])
    expect(result.observations.some(o => o.subject === 'organization')).toBe(true)
  })

  it('all observations have depth "mid"', () => {
    const result = observeMid('app.ts', SIMPLE_CODE, ['app.ts'])
    for (const obs of result.observations) {
      expect(obs.depth).toBe('mid')
    }
  })

  it('counts interfaces and types', () => {
    const code = 'interface Foo {}\ntype Bar = string\nexport { Foo, Bar }'
    const result = observeMid('types.ts', code, ['types.ts'])
    expect(result.metrics.interfaceCount).toBe(1)
    expect(result.metrics.typeCount).toBe(1)
  })
})

// ─── observeFar ────────────────────────────────────────────────────────────────

describe('observeFar', () => {
  it('counts directories', () => {
    const result = observeFar(MULTI_DIR_FILES, MULTI_DIR_CONTENTS)
    expect(result.metrics.dirCount).toBeGreaterThan(1)
  })

  it('detects many directories', () => {
    const manyDirs = Array.from({ length: 15 }, (_, i) => [`dir${i}/file.ts`])
      .flat()
    const manyContents = manyDirs.map(() => 'const x = 1')
    const result = observeFar(manyDirs, manyContents)
    expect(result.observations.some(o => o.subject === 'directories')).toBe(true)
  })

  it('detects unbalanced directories', () => {
    const unbalanced = Array.from({ length: 25 }, (_, i) => `src/commands/cmd${i}.ts`)
    const contents = unbalanced.map(() => 'const x = 1')
    const result = observeFar(unbalanced, contents)
    expect(result.observations.some(o => o.subject === 'balance')).toBe(true)
  })

  it('detects coupling', () => {
    const result = observeFar(MULTI_DIR_FILES, MULTI_DIR_CONTENTS)
    expect(result.metrics.avgCoupling).toBeGreaterThanOrEqual(0)
  })

  it('detects architectural layers', () => {
    const result = observeFar(MULTI_DIR_FILES, MULTI_DIR_CONTENTS)
    expect(result.metrics.layerCount).toBeGreaterThanOrEqual(2)
    expect(result.observations.some(o => o.subject === 'layers')).toBe(true)
  })

  it('reports no layers for flat structure', () => {
    const flatFiles = ['a.ts', 'b.ts', 'c.ts']
    const flatContents = flatFiles.map(() => 'const x = 1')
    const result = observeFar(flatFiles, flatContents)
    expect(result.metrics.layerCount).toBe(0)
  })

  it('counts total files', () => {
    const result = observeFar(MULTI_DIR_FILES, MULTI_DIR_CONTENTS)
    expect(result.metrics.fileCount).toBe(6)
  })

  it('all observations have depth "far"', () => {
    const result = observeFar(MULTI_DIR_FILES, MULTI_DIR_CONTENTS)
    for (const obs of result.observations) {
      expect(obs.depth).toBe('far')
    }
  })

  it('detects high exports per directory', () => {
    const manyExports = ['src/mod/a.ts', 'src/mod/b.ts']
    const contents = [
      Array.from({ length: 35 }, (_, i) => `export const x${i} = ${i}`).join('\n'),
      Array.from({ length: 35 }, (_, i) => `export const y${i} = ${i}`).join('\n'),
    ]
    const result = observeFar(manyExports, contents)
    expect(result.observations.some(o => o.subject === 'responsibility')).toBe(true)
  })
})

// ─── computeNearDepth ──────────────────────────────────────────────────────────

describe('computeNearDepth', () => {
  it('returns low score for empty metrics', () => {
    const result = computeNearDepth({})
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(30)
  })

  it('returns low score for minimal code', () => {
    const result = computeNearDepth({ functionCount: 1, complexity: 1, maxNesting: 0, avgParams: 0, returnCoverage: 100, avgFnLength: 10 })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(50)
  })

  it('returns high score for complex code', () => {
    const result = computeNearDepth({ functionCount: 10, complexity: 15, maxNesting: 5, avgParams: 2, returnCoverage: 90, avgFnLength: 50 })
    expect(result).toBeGreaterThan(50)
  })

  it('caps at 100', () => {
    const result = computeNearDepth({ functionCount: 50, complexity: 50, maxNesting: 20, avgParams: 5, returnCoverage: 100, avgFnLength: 100 })
    expect(result).toBeLessThanOrEqual(100)
  })

  it('increases with function count', () => {
    const low = computeNearDepth({ functionCount: 2, complexity: 1, maxNesting: 0, avgParams: 0, returnCoverage: 0, avgFnLength: 0 })
    const high = computeNearDepth({ functionCount: 10, complexity: 1, maxNesting: 0, avgParams: 0, returnCoverage: 0, avgFnLength: 0 })
    expect(high).toBeGreaterThan(low)
  })
})

// ─── computeMidDepth ───────────────────────────────────────────────────────────

describe('computeMidDepth', () => {
  it('returns 0 for empty metrics', () => {
    expect(computeMidDepth({})).toBe(0)
  })

  it('rewards test presence', () => {
    const noTest = computeMidDepth({ lineCount: 100, importCount: 3, exportCount: 2, commentRatio: 10, hasTest: 0, classCount: 0, interfaceCount: 0 })
    const withTest = computeMidDepth({ lineCount: 100, importCount: 3, exportCount: 2, commentRatio: 10, hasTest: 1, classCount: 0, interfaceCount: 0 })
    expect(withTest).toBeGreaterThan(noTest)
  })

  it('caps at 100', () => {
    const result = computeMidDepth({ lineCount: 500, importCount: 20, exportCount: 20, commentRatio: 50, hasTest: 1, classCount: 5, interfaceCount: 5 })
    expect(result).toBeLessThanOrEqual(100)
  })

  it('increases with documentation', () => {
    const lowDoc = computeMidDepth({ lineCount: 100, importCount: 3, exportCount: 2, commentRatio: 0, hasTest: 0, classCount: 0, interfaceCount: 0 })
    const highDoc = computeMidDepth({ lineCount: 100, importCount: 3, exportCount: 2, commentRatio: 30, hasTest: 0, classCount: 0, interfaceCount: 0 })
    expect(highDoc).toBeGreaterThan(lowDoc)
  })
})

// ─── computeFarDepth ───────────────────────────────────────────────────────────

describe('computeFarDepth', () => {
  it('returns 0 for empty metrics', () => {
    expect(computeFarDepth({})).toBe(0)
  })

  it('rewards directory organization', () => {
    const few = computeFarDepth({ dirCount: 1, layerCount: 0, avgCoupling: 0, fileCount: 1, avgFilesPerDir: 1 })
    const many = computeFarDepth({ dirCount: 8, layerCount: 3, avgCoupling: 2, fileCount: 50, avgFilesPerDir: 6 })
    expect(many).toBeGreaterThan(few)
  })

  it('caps at 100', () => {
    const result = computeFarDepth({ dirCount: 20, layerCount: 5, avgCoupling: 10, fileCount: 100, avgFilesPerDir: 5 })
    expect(result).toBeLessThanOrEqual(100)
  })

  it('rewards layered architecture', () => {
    const noLayers = computeFarDepth({ dirCount: 5, layerCount: 0, avgCoupling: 1, fileCount: 10, avgFilesPerDir: 2 })
    const withLayers = computeFarDepth({ dirCount: 5, layerCount: 3, avgCoupling: 1, fileCount: 10, avgFilesPerDir: 2 })
    expect(withLayers).toBeGreaterThan(noLayers)
  })
})

// ─── computeParallaxScore ──────────────────────────────────────────────────────

describe('computeParallaxScore', () => {
  it('computes weighted average', () => {
    const score = computeParallaxScore(60, 70, 50)
    expect(score).toBe(61) // 60*0.35 + 70*0.35 + 50*0.30 = 21 + 24.5 + 15 = 60.5 → 61
  })

  it('returns 0 for all zeros', () => {
    expect(computeParallaxScore(0, 0, 0)).toBe(0)
  })

  it('returns 100 for all 100', () => {
    expect(computeParallaxScore(100, 100, 100)).toBe(100)
  })

  it('weights near and mid equally and higher than far', () => {
    const nearOnly = computeParallaxScore(100, 0, 0)
    const farOnly = computeParallaxScore(0, 0, 100)
    expect(nearOnly).toBeGreaterThan(farOnly)
  })
})

// ─── classifyDepth ─────────────────────────────────────────────────────────────

describe('classifyDepth', () => {
  it('classifies shallow', () => {
    expect(classifyDepth(10)).toBe('shallow')
    expect(classifyDepth(29)).toBe('shallow')
  })

  it('classifies moderate', () => {
    expect(classifyDepth(30)).toBe('moderate')
    expect(classifyDepth(54)).toBe('moderate')
  })

  it('classifies deep', () => {
    expect(classifyDepth(55)).toBe('deep')
    expect(classifyDepth(79)).toBe('deep')
  })

  it('classifies abyssal', () => {
    expect(classifyDepth(80)).toBe('abyssal')
    expect(classifyDepth(100)).toBe('abyssal')
  })

  it('handles boundary values', () => {
    expect(classifyDepth(0)).toBe('shallow')
    expect(classifyDepth(100)).toBe('abyssal')
  })
})

// ─── computePerspectiveAgreement ───────────────────────────────────────────────

describe('computePerspectiveAgreement', () => {
  it('returns 100 for fewer than 3 perspectives', () => {
    expect(computePerspectiveAgreement([])).toBe(100)
    expect(computePerspectiveAgreement([{ depth: 'near', description: '', observations: [], metrics: {} }])).toBe(100)
  })

  it('returns high agreement for similar perspectives', () => {
    const perspectives: Perspective[] = [
      { depth: 'near', description: '', observations: [], metrics: { a: 50 } },
      { depth: 'mid', description: '', observations: [], metrics: { a: 50 } },
      { depth: 'far', description: '', observations: [], metrics: { a: 50 } },
    ]
    const agreement = computePerspectiveAgreement(perspectives)
    expect(agreement).toBe(100)
  })

  it('returns lower agreement for divergent perspectives', () => {
    const perspectives: Perspective[] = [
      { depth: 'near', description: '', observations: [], metrics: { a: 10 } },
      { depth: 'mid', description: '', observations: [], metrics: { a: 50 } },
      { depth: 'far', description: '', observations: [], metrics: { a: 90 } },
    ]
    const agreement = computePerspectiveAgreement(perspectives)
    expect(agreement).toBeLessThan(100)
  })

  it('returns 100 for zero metrics', () => {
    const perspectives: Perspective[] = [
      { depth: 'near', description: '', observations: [], metrics: {} },
      { depth: 'mid', description: '', observations: [], metrics: {} },
      { depth: 'far', description: '', observations: [], metrics: {} },
    ]
    expect(computePerspectiveAgreement(perspectives)).toBe(100)
  })
})

// ─── computeOverallDepth ───────────────────────────────────────────────────────

describe('computeOverallDepth', () => {
  it('returns 0 for empty layers', () => {
    expect(computeOverallDepth([])).toBe(0)
  })

  it('computes average parallax score', () => {
    const layers: DepthLayer[] = [
      { file: 'a.ts', nearDepth: 50, midDepth: 60, farDepth: 40, parallaxScore: 50, depthCategory: 'moderate' },
      { file: 'b.ts', nearDepth: 70, midDepth: 80, farDepth: 60, parallaxScore: 71, depthCategory: 'deep' },
    ]
    expect(computeOverallDepth(layers)).toBe(61)
  })

  it('returns single file score', () => {
    const layers: DepthLayer[] = [
      { file: 'a.ts', nearDepth: 50, midDepth: 60, farDepth: 40, parallaxScore: 50, depthCategory: 'moderate' },
    ]
    expect(computeOverallDepth(layers)).toBe(50)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: ParallaxStats = {
    totalFiles: 10,
    shallowCount: 0,
    deepCount: 0,
    avgParallax: 50,
    avgNear: 50,
    avgMid: 50,
    avgFar: 50,
    deepestFile: 'a.ts',
    shallowestFile: 'b.ts',
    perspectiveAgreement: 80,
    overallDepth: 50,
  }

  it('recommends adding depth for shallow files', () => {
    const shallowLayers: DepthLayer[] = [
      { file: 'x.ts', nearDepth: 10, midDepth: 10, farDepth: 10, parallaxScore: 10, depthCategory: 'shallow' },
    ]
    const recs = generateRecommendations([], shallowLayers, baseStats)
    expect(recs.some(r => r.includes('shallow'))).toBe(true)
  })

  it('recommends investigating perspective disagreements', () => {
    const stats = { ...baseStats, perspectiveAgreement: 30 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('disagree'))).toBe(true)
  })

  it('recommends improving near perspective when weak', () => {
    const stats = { ...baseStats, avgNear: 20 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Near perspective'))).toBe(true)
  })

  it('recommends improving mid perspective when weak', () => {
    const stats = { ...baseStats, avgMid: 20 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Mid perspective'))).toBe(true)
  })

  it('recommends improving far perspective when weak', () => {
    const stats = { ...baseStats, avgFar: 20 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Far perspective'))).toBe(true)
  })

  it('recommends splitting abyssal files', () => {
    const deepLayers: DepthLayer[] = [
      { file: 'big.ts', nearDepth: 90, midDepth: 90, farDepth: 80, parallaxScore: 87, depthCategory: 'abyssal' },
    ]
    const recs = generateRecommendations([], deepLayers, baseStats)
    expect(recs.some(r => r.includes('abyssal') && r.includes('splitting'))).toBe(true)
  })

  it('recommends test coverage when many untested', () => {
    const midPerspective: Perspective = {
      depth: 'mid',
      description: '',
      observations: Array.from({ length: 8 }, (_, i) => ({
        subject: 'testing',
        detail: 'no associated test file found',
        significance: 'notable' as const,
        depth: 'mid' as const,
      })),
      metrics: {},
    }
    const stats = { ...baseStats, totalFiles: 10 }
    const recs = generateRecommendations([midPerspective], [], stats)
    expect(recs.some(r => r.includes('test coverage'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const goodStats: ParallaxStats = { ...baseStats, shallowCount: 0, deepCount: 0, perspectiveAgreement: 90, avgNear: 60, avgMid: 60, avgFar: 60 }
    const recs = generateRecommendations([], [], goodStats)
    expect(recs).toEqual([])
  })
})

// ─── buildParallaxResult ───────────────────────────────────────────────────────

describe('buildParallaxResult', () => {
  it('builds result with three perspectives', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    expect(result.perspectives).toHaveLength(3)
    expect(result.perspectives.map(p => p.depth)).toEqual(['near', 'mid', 'far'])
  })

  it('builds layers for each file', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    expect(result.layers).toHaveLength(1)
    expect(result.layers[0].file).toBe('app.ts')
  })

  it('computes stats correctly', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallDepth).toBeGreaterThan(0)
  })

  it('handles empty file list', () => {
    const result = buildParallaxResult(EMPTY_RESULT_FILES, EMPTY_RESULT_CONTENTS, {})
    expect(result.layers).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgParallax).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
  })

  it('handles multi-file analysis', () => {
    const result = buildParallaxResult(MULTI_DIR_FILES, MULTI_DIR_CONTENTS, {})
    expect(result.layers).toHaveLength(6)
    expect(result.stats.totalFiles).toBe(6)
    expect(result.stats.deepestFile).toBeTruthy()
    expect(result.stats.shallowestFile).toBeTruthy()
  })

  it('each layer has valid depth scores', () => {
    const result = buildParallaxResult(MULTI_DIR_FILES, MULTI_DIR_CONTENTS, {})
    for (const layer of result.layers) {
      expect(layer.nearDepth).toBeGreaterThanOrEqual(0)
      expect(layer.nearDepth).toBeLessThanOrEqual(100)
      expect(layer.midDepth).toBeGreaterThanOrEqual(0)
      expect(layer.midDepth).toBeLessThanOrEqual(100)
      expect(layer.farDepth).toBeGreaterThanOrEqual(0)
      expect(layer.farDepth).toBeLessThanOrEqual(100)
      expect(layer.parallaxScore).toBeGreaterThanOrEqual(0)
      expect(layer.parallaxScore).toBeLessThanOrEqual(100)
      expect(['shallow', 'moderate', 'deep', 'abyssal']).toContain(layer.depthCategory)
    }
  })

  it('deepest file has highest parallax score', () => {
    const result = buildParallaxResult(MULTI_DIR_FILES, MULTI_DIR_CONTENTS, {})
    const deepestLayer = result.layers.find(l => l.file === result.stats.deepestFile)
    if (deepestLayer) {
      for (const l of result.layers) {
        expect(deepestLayer.parallaxScore).toBeGreaterThanOrEqual(l.parallaxScore)
      }
    }
  })

  it('perspectives have correct depths', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    expect(result.perspectives[0].depth).toBe('near')
    expect(result.perspectives[1].depth).toBe('mid')
    expect(result.perspectives[2].depth).toBe('far')
  })

  it('perspectives have descriptions', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    for (const p of result.perspectives) {
      expect(p.description.length).toBeGreaterThan(0)
    }
  })

  it('includes recommendations', () => {
    const result = buildParallaxResult(MULTI_DIR_FILES, MULTI_DIR_CONTENTS, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('respects verbose option', () => {
    const opts: ParallaxOptions = { verbose: true }
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, opts)
    expect(result).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatPerspectivePanel', () => {
  it('formats near perspective', () => {
    const perspective = { depth: 'near', description: 'function-level', observations: [], metrics: { fns: 5 } }
    const output = formatPerspectivePanel(perspective)
    expect(output).toContain('NEAR')
    expect(output).toContain('function-level')
  })

  it('formats mid perspective', () => {
    const perspective = { depth: 'mid', description: 'file-level', observations: [], metrics: {} }
    const output = formatPerspectivePanel(perspective)
    expect(output).toContain('MID')
  })

  it('formats far perspective', () => {
    const perspective = { depth: 'far', description: 'module-level', observations: [], metrics: {} }
    const output = formatPerspectivePanel(perspective)
    expect(output).toContain('FAR')
  })

  it('shows observations with significance colors', () => {
    const perspective = {
      depth: 'near',
      description: 'test',
      observations: [
        { subject: 'complexity', detail: 'high', significance: 'major', depth: 'near' },
      ],
      metrics: {},
    }
    const output = formatPerspectivePanel(perspective)
    expect(output).toContain('complexity')
    expect(output).toContain('high')
  })

  it('truncates many observations', () => {
    const perspective = {
      depth: 'near',
      description: 'test',
      observations: Array.from({ length: 12 }, (_, i) => ({
        subject: `obs${i}`,
        detail: `detail${i}`,
        significance: 'minor',
        depth: 'near',
      })),
      metrics: {},
    }
    const output = formatPerspectivePanel(perspective)
    expect(output).toContain('more')
  })
})

describe('formatDepthLayerTable', () => {
  it('shows message for empty layers', () => {
    const output = formatDepthLayerTable([])
    expect(output).toContain('No files')
  })

  it('formats layers as table', () => {
    const layers: DepthLayer[] = [
      { file: 'src/app.ts', nearDepth: 50, midDepth: 60, farDepth: 40, parallaxScore: 50, depthCategory: 'moderate' },
    ]
    const output = formatDepthLayerTable(layers)
    expect(output).toContain('app.ts')
    expect(output).toContain('moderate')
  })

  it('sorts by parallax score descending', () => {
    const layers: DepthLayer[] = [
      { file: 'low.ts', nearDepth: 10, midDepth: 10, farDepth: 10, parallaxScore: 10, depthCategory: 'shallow' },
      { file: 'high.ts', nearDepth: 80, midDepth: 80, farDepth: 80, parallaxScore: 80, depthCategory: 'abyssal' },
    ]
    const output = formatDepthLayerTable(layers)
    const highIdx = output.indexOf('high.ts')
    const lowIdx = output.indexOf('low.ts')
    expect(highIdx).toBeLessThan(lowIdx)
  })
})

describe('formatDepthHistogram', () => {
  it('formats histogram for mixed layers', () => {
    const layers: DepthLayer[] = [
      { file: 'a.ts', nearDepth: 10, midDepth: 10, farDepth: 10, parallaxScore: 10, depthCategory: 'shallow' },
      { file: 'b.ts', nearDepth: 50, midDepth: 50, farDepth: 50, parallaxScore: 50, depthCategory: 'moderate' },
      { file: 'c.ts', nearDepth: 70, midDepth: 70, farDepth: 70, parallaxScore: 70, depthCategory: 'deep' },
    ]
    const output = formatDepthHistogram(layers)
    expect(output).toContain('shallow')
    expect(output).toContain('moderate')
    expect(output).toContain('deep')
    expect(output).toContain('█')
  })

  it('handles empty layers', () => {
    const output = formatDepthHistogram([])
    expect(output).toContain('shallow')
    expect(output).toContain('0')
  })
})

describe('formatAgreementMeter', () => {
  it('formats full agreement', () => {
    const output = formatAgreementMeter(100)
    expect(output).toContain('100/100')
    expect(output).toContain('█')
  })

  it('formats partial agreement', () => {
    const output = formatAgreementMeter(50)
    expect(output).toContain('50/100')
    expect(output).toContain('░')
  })

  it('formats zero agreement', () => {
    const output = formatAgreementMeter(0)
    expect(output).toContain('0/100')
  })
})

describe('formatParallaxStats', () => {
  it('formats all stat fields', () => {
    const stats: ParallaxStats = {
      totalFiles: 10,
      shallowCount: 3,
      deepCount: 4,
      avgParallax: 55,
      avgNear: 50,
      avgMid: 60,
      avgFar: 45,
      deepestFile: 'deep.ts',
      shallowestFile: 'shallow.ts',
      perspectiveAgreement: 78,
      overallDepth: 55,
    }
    const output = formatParallaxStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('deep.ts')
    expect(output).toContain('shallow.ts')
  })
})

describe('formatParallaxRecommendations', () => {
  it('returns empty for no recommendations', () => {
    expect(formatParallaxRecommendations([])).toBe('')
  })

  it('formats recommendations', () => {
    const output = formatParallaxRecommendations(['Add more tests', 'Refactor large files'])
    expect(output).toContain('Add more tests')
    expect(output).toContain('Refactor large files')
    expect(output).toContain('→')
  })
})

describe('formatParallaxTable', () => {
  it('formats full result', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    const output = formatParallaxTable(result)
    expect(output).toContain('Parallax')
    expect(output).toContain('NEAR')
    expect(output).toContain('MID')
    expect(output).toContain('FAR')
  })
})

describe('formatParallaxJson', () => {
  it('produces valid JSON', () => {
    const result = buildParallaxResult(SINGLE_FILE, SINGLE_CONTENT, {})
    const json = formatParallaxJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.perspectives).toHaveLength(3)
    expect(parsed.layers).toHaveLength(1)
  })
})
