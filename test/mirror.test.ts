import { describe, expect, it } from 'vitest'

import {
  buildMirrorResult,
  classifyDistortionLevel,
  computeAlignment,
  computeComplexity,
  computeGap,
  computeOverallClarity,
  detectHiddenComplexity,
  detectMisnamed,
  detectOverengineered,
  detectOverpromised,
  detectUnderdocumented,
  extractActualBehavior,
  extractStatedIntentions,
  generateMirrorRecommendations,
  generateReality,
  generateSelfImage,
} from '../src/commands/mirror-helpers.js'

import {
  formatDistortions,
  formatIntentions,
  formatMirrorJSON,
  formatMirrorStats,
  formatMirrorTable,
  formatRecommendations,
  formatReflections,
} from '../src/commands/mirror-format-helpers.js'

import type {
  Distortion,
  Intention,
  MirrorResult,
  MirrorStats,
  Reflection,
} from '../src/commands/mirror-helpers.js'

// ─── extractStatedIntentions ───────────────────────────────────────────────────

describe('extractStatedIntentions', () => {
  it('extracts from JSDoc blocks', () => {
    const content = '/** Adds two numbers together */\nfunction add(a, b) { return a + b }'
    const result = extractStatedIntentions(content)
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((r) => r.includes('numbers'))).toBe(true)
  })

  it('extracts from line comments', () => {
    const content = '// This is a helper function for data processing\nconst x = 1'
    const result = extractStatedIntentions(content)
    expect(result.some((r) => r.includes('helper'))).toBe(true)
  })

  it('excludes @tags from JSDoc', () => {
    const content = '/** Does something\n * @param x the value\n * @returns number\n */'
    const result = extractStatedIntentions(content)
    expect(result.every((r) => !r.startsWith('@'))).toBe(true)
  })

  it('excludes short comments', () => {
    const content = '// hi\nconst x = 1'
    const result = extractStatedIntentions(content)
    expect(result).not.toContain('hi')
  })

  it('excludes separator comments', () => {
    const content = '// ──────────────────\nconst x = 1'
    const result = extractStatedIntentions(content)
    expect(result.every((r) => !r.startsWith('───'))).toBe(true)
  })

  it('returns empty for no comments', () => {
    expect(extractStatedIntentions('const x = 1')).toEqual([])
  })

  it('handles multi-line JSDoc', () => {
    const content = '/**\n * First line\n * Second line\n */'
    const result = extractStatedIntentions(content)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty content', () => {
    expect(extractStatedIntentions('')).toEqual([])
  })
})

// ─── extractActualBehavior ─────────────────────────────────────────────────────

describe('extractActualBehavior', () => {
  it('extracts named functions', () => {
    const result = extractActualBehavior('function add(a, b) { return a + b }')
    expect(result).toContain('function:add')
  })

  it('extracts exported functions', () => {
    const result = extractActualBehavior('export function run() {}')
    expect(result).toContain('function:run')
  })

  it('extracts async functions', () => {
    const result = extractActualBehavior('async function fetchData() {}')
    expect(result).toContain('function:fetchData')
  })

  it('extracts arrow functions', () => {
    const result = extractActualBehavior('const compute = (x) => x * 2')
    expect(result).toContain('arrow:compute')
  })

  it('extracts classes', () => {
    const result = extractActualBehavior('class MyClass {}')
    expect(result).toContain('class:MyClass')
  })

  it('extracts exported classes', () => {
    const result = extractActualBehavior('export class Handler {}')
    expect(result).toContain('class:Handler')
  })

  it('extracts exported constants', () => {
    const result = extractActualBehavior('export const MAX = 100')
    expect(result).toContain('export:MAX')
  })

  it('extracts exported types', () => {
    const result = extractActualBehavior('export type Result = string | number')
    expect(result).toContain('export:Result')
  })

  it('extracts exported interfaces', () => {
    const result = extractActualBehavior('export interface Config {}')
    expect(result).toContain('export:Config')
  })

  it('returns empty for plain code', () => {
    expect(extractActualBehavior('const x = 1 + 2')).toEqual([])
  })

  it('handles empty content', () => {
    expect(extractActualBehavior('')).toEqual([])
  })
})

// ─── computeAlignment ──────────────────────────────────────────────────────────

describe('computeAlignment', () => {
  it('returns 100 for both empty', () => {
    expect(computeAlignment([], [])).toBe(100)
  })

  it('returns low score for no documentation', () => {
    expect(computeAlignment([], ['function:add'])).toBe(20)
  })

  it('returns low score for no actual behavior', () => {
    expect(computeAlignment(['Adds numbers'], [])).toBe(10)
  })

  it('returns higher for matching docs and code', () => {
    const aligned = computeAlignment(['Adds two numbers'], ['function:add'])
    const unaligned = computeAlignment(['Does stuff'], ['function:add'])
    expect(aligned).toBeGreaterThan(unaligned)
  })

  it('caps at 100', () => {
    const result = computeAlignment(['add numbers helper'], ['function:add'])
    expect(result).toBeLessThanOrEqual(100)
  })

  it('is 0-based', () => {
    const result = computeAlignment(['xxx'], ['function:yyy'])
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('rewards documentation coverage', () => {
    const wellDoc = computeAlignment(['add', 'subtract', 'multiply'], ['function:add', 'function:subtract'])
    const poorlyDoc = computeAlignment(['add'], ['function:add', 'function:subtract', 'function:multiply'])
    expect(wellDoc).toBeGreaterThan(poorlyDoc)
  })
})

// ─── generateSelfImage ─────────────────────────────────────────────────────────

describe('generateSelfImage', () => {
  it('describes documented code', () => {
    const result = generateSelfImage('code', ['fn'], ['doc1', 'doc2'])
    expect(result).toContain('Well-documented')
  })

  it('describes undocumented code', () => {
    const result = generateSelfImage('code', ['fn'], [])
    expect(result).toContain('Undocumented')
  })

  it('describes rich API', () => {
    const exports = Array.from({ length: 15 }, (_, i) => `fn${i}`)
    const result = generateSelfImage('code', exports, [])
    expect(result).toContain('Rich API')
  })

  it('describes moderate API', () => {
    const exports = ['fn1', 'fn2', 'fn3', 'fn4']
    const result = generateSelfImage('code', exports, [])
    expect(result).toContain('Moderate API')
  })

  it('describes minimal API', () => {
    const result = generateSelfImage('code', ['fn1'], [])
    expect(result).toContain('Minimal API')
  })

  it('detects async-heavy code', () => {
    const content = 'async function a() {}\nasync function b() {}\nasync function c() {}\nasync function d() {}'
    const result = generateSelfImage(content, ['fn'], [])
    expect(result).toContain('Async-heavy')
  })

  it('describes undocumented code as Undocumented', () => {
    const result = generateSelfImage('', [], [])
    expect(result).toBe('Undocumented')
  })
})

// ─── generateReality ───────────────────────────────────────────────────────────

describe('generateReality', () => {
  it('reports line count', () => {
    const content = 'line1\nline2\nline3'
    const result = generateReality(content, 10, 2)
    expect(result).toContain('3 lines')
  })

  it('reports high complexity', () => {
    const result = generateReality('x', 60, 2)
    expect(result).toContain('high complexity')
  })

  it('reports moderate complexity', () => {
    const result = generateReality('x', 35, 2)
    expect(result).toContain('moderate complexity')
  })

  it('reports low complexity', () => {
    const result = generateReality('x', 10, 2)
    expect(result).toContain('low complexity')
  })

  it('reports heavy connections', () => {
    const result = generateReality('x', 10, 15)
    expect(result).toContain('heavily connected')
  })

  it('reports moderate connections', () => {
    const result = generateReality('x', 10, 5)
    expect(result).toContain('moderately connected')
  })

  it('reports unresolved TODOs', () => {
    const content = 'const x = 1\n// TODO: fix this'
    const result = generateReality(content, 10, 2)
    expect(result).toContain('TODO')
  })
})

// ─── computeGap ────────────────────────────────────────────────────────────────

describe('computeGap', () => {
  it('detects no gap for matching strings', () => {
    expect(computeGap('Simple', 'Simple')).toContain('No gap')
  })

  it('detects documentation gap with TODOs', () => {
    const result = computeGap('Well-documented code', '100 lines, moderate complexity, 3 unresolved TODOs')
    expect(result).toContain('unresolved')
  })

  it('detects simplicity facade', () => {
    const result = computeGap('Minimal API (1 exports)', '200 lines, high complexity, heavily connected')
    expect(result).toContain('complex')
  })

  it('detects complex undocumented', () => {
    const result = computeGap('Undocumented', '300 lines, high complexity')
    expect(result).toContain('docs')
  })

  it('detects large API simple internals', () => {
    const result = computeGap('Rich API (15 exports)', '10 lines, low complexity')
    expect(result).toContain('API')
  })

  it('detects minor discrepancies', () => {
    const result = computeGap('Documented', '50 lines, moderate complexity')
    expect(result).toContain('discrepancies')
  })
})

// ─── classifyDistortionLevel ───────────────────────────────────────────────────

describe('classifyDistortionLevel', () => {
  it('classifies >=90 as none', () => {
    expect(classifyDistortionLevel(95)).toBe('none')
    expect(classifyDistortionLevel(90)).toBe('none')
  })

  it('classifies 70-89 as minor', () => {
    expect(classifyDistortionLevel(75)).toBe('minor')
    expect(classifyDistortionLevel(70)).toBe('minor')
  })

  it('classifies 50-69 as moderate', () => {
    expect(classifyDistortionLevel(60)).toBe('moderate')
    expect(classifyDistortionLevel(50)).toBe('moderate')
  })

  it('classifies 30-49 as severe', () => {
    expect(classifyDistortionLevel(40)).toBe('severe')
    expect(classifyDistortionLevel(30)).toBe('severe')
  })

  it('classifies <30 as extreme', () => {
    expect(classifyDistortionLevel(20)).toBe('extreme')
    expect(classifyDistortionLevel(0)).toBe('extreme')
  })
})

// ─── computeComplexity ─────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 0 for empty content', () => {
    expect(computeComplexity('')).toBe(0)
  })

  it('returns higher for more branches', () => {
    const simple = 'const x = 1\n'
    const complex = 'if (x) { for (let i = 0; i < 10; i++) { while (y) {} } }\n'
    expect(computeComplexity(complex)).toBeGreaterThan(computeComplexity(simple))
  })

  it('caps at 100', () => {
    let content = ''
    for (let i = 0; i < 100; i++) content += 'if (x) {}\n'
    expect(computeComplexity(content)).toBeLessThanOrEqual(100)
  })

  it('detects if/else', () => {
    const content = 'if (x) {}\nelse {}\n'
    expect(computeComplexity(content)).toBeGreaterThan(0)
  })
})

// ─── detectOverengineered ──────────────────────────────────────────────────────

describe('detectOverengineered', () => {
  it('detects simple intent with high complexity', () => {
    let complexContent = ''
    for (let i = 0; i < 100; i++) complexContent += `if (x${i}) { for (let j = 0; j < 10; j++) {} }\n`
    const result = detectOverengineered(complexContent, ['Simple utility'])
    expect(result).not.toBeNull()
    expect(result!.type).toBe('overengineered')
  })

  it('returns null for well-matched complexity', () => {
    const result = detectOverengineered('function add(a, b) { return a + b }', ['Adds two numbers'])
    expect(result).toBeNull()
  })

  it('detects when few intentions but high complexity', () => {
    let content = ''
    for (let i = 0; i < 80; i++) content += 'if (x) { for (let i = 0; i < 10; i++) {} }\n'
    const result = detectOverengineered(content, ['Does stuff'])
    expect(result).not.toBeNull()
  })

  it('assigns correct severity', () => {
    let highContent = ''
    for (let i = 0; i < 100; i++) highContent += `if (x${i}) { for (let j = 0; j < 10; j++) {} }\n`
    const high = detectOverengineered(highContent, ['Helper'])
    expect(high!.severity).toBe('high')

    let medContent = ''
    for (let i = 0; i < 18; i++) medContent += `if (x${i}) {}\n`
    for (let i = 0; i < 12; i++) medContent += `const y${i} = ${i}\n`
    const med = detectOverengineered(medContent, ['Helper'])
    expect(med!.severity).toBe('medium')
  })
})

// ─── detectUnderdocumented ─────────────────────────────────────────────────────

describe('detectUnderdocumented', () => {
  it('detects many exports with no docs', () => {
    const content = 'export function a() {}\nexport function b() {}\nexport function c() {}'
    const exports = ['function:a', 'function:b', 'function:c']
    const result = detectUnderdocumented(content, exports)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('underdocumented')
  })

  it('returns null for no exports', () => {
    expect(detectUnderdocumented('const x = 1', [])).toBeNull()
  })

  it('returns null when well documented', () => {
    const content = '/** Doc a */\nexport function a() {}\n/** Doc b */\nexport function b() {}'
    const exports = ['function:a', 'function:b']
    const result = detectUnderdocumented(content, exports)
    expect(result).toBeNull()
  })

  it('assigns high severity for zero docs', () => {
    const content = 'export function a() {}\nexport function b() {}'
    const result = detectUnderdocumented(content, ['function:a', 'function:b'])
    expect(result!.severity).toBe('high')
  })

  it('assigns low severity for partial docs', () => {
    const content = '/** Doc */\nexport function a() {}\nexport function b() {}\nexport function c() {}'
    const exports = ['function:a', 'function:b', 'function:c']
    const result = detectUnderdocumented(content, exports)
    expect(result!.severity).toBe('low')
  })
})

// ─── detectMisnamed ────────────────────────────────────────────────────────────

describe('detectMisnamed', () => {
  it('detects getter with write operations', () => {
    const content = 'function getData() { return postData("url", body) }'
    const result = detectMisnamed(content)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('misnamed')
  })

  it('detects fetch with delete', () => {
    const content = 'function fetchItems() { return deleteItem(id) }'
    const result = detectMisnamed(content)
    expect(result).not.toBeNull()
  })

  it('returns null for well-named functions', () => {
    const content = 'function add(a, b) { return a + b }'
    expect(detectMisnamed(content)).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(detectMisnamed('')).toBeNull()
  })

  it('detects loadData with create', () => {
    const content = 'function loadUser() { return createUser(data) }'
    const result = detectMisnamed(content)
    expect(result).not.toBeNull()
  })

  it('ignores properly named getters', () => {
    const content = 'function getCount() { return count }'
    expect(detectMisnamed(content)).toBeNull()
  })
})

// ─── detectOverpromised ────────────────────────────────────────────────────────

describe('detectOverpromised', () => {
  it('detects TODO comments', () => {
    const content = '// TODO: implement error handling\nconst x = 1'
    const result = detectOverpromised(content)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('overpromised')
  })

  it('detects FIXME comments', () => {
    const content = '// FIXME: this is broken\nconst x = 1'
    const result = detectOverpromised(content)
    expect(result).not.toBeNull()
  })

  it('detects HACK comments', () => {
    const content = '// HACK: workaround\nconst x = 1'
    const result = detectOverpromised(content)
    expect(result).not.toBeNull()
  })

  it('returns null for no TODOs', () => {
    expect(detectOverpromised('const x = 1')).toBeNull()
  })

  it('counts multiple TODOs', () => {
    const content = '// TODO: a\n// TODO: b\n// TODO: c\n// TODO: d\n// TODO: e\n// TODO: f'
    const result = detectOverpromised(content)
    expect(result).not.toBeNull()
    expect(result!.severity).toBe('high')
  })

  it('assigns medium severity for few TODOs', () => {
    const content = '// TODO: a\n// TODO: b\n// TODO: c'
    const result = detectOverpromised(content)
    expect(result!.severity).toBe('medium')
  })

  it('assigns low severity for one TODO', () => {
    const content = '// TODO: implement later'
    const result = detectOverpromised(content)
    expect(result!.severity).toBe('low')
  })
})

// ─── detectHiddenComplexity ────────────────────────────────────────────────────

describe('detectHiddenComplexity', () => {
  it('detects short functions with many branches', () => {
    const content = `function check(x) { if (a) { if (b) { if (c) { if (d) {} } } } }`
    const result = detectHiddenComplexity(content)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('hidden-complexity')
  })

  it('returns null for simple functions', () => {
    const content = 'function add(a, b) { return a + b }'
    expect(detectHiddenComplexity(content)).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(detectHiddenComplexity('')).toBeNull()
  })

  it('assigns high severity for many branches', () => {
    const content = `function validate(x) { if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { if (g) {} } } } } } } }`
    const result = detectHiddenComplexity(content)
    expect(result!.severity).toBe('high')
  })
})

// ─── computeOverallClarity ─────────────────────────────────────────────────────

describe('computeOverallClarity', () => {
  it('returns 0 for empty intentions', () => {
    expect(computeOverallClarity([])).toBe(0)
  })

  it('averages alignment scores', () => {
    const intentions: Intention[] = [
      { file: 'a.ts', stated: [], actual: [], alignment: 80 },
      { file: 'b.ts', stated: [], actual: [], alignment: 60 },
    ]
    expect(computeOverallClarity(intentions)).toBe(70)
  })

  it('returns 100 for perfect alignment', () => {
    const intentions: Intention[] = [
      { file: 'a.ts', stated: [], actual: [], alignment: 100 },
    ]
    expect(computeOverallClarity(intentions)).toBe(100)
  })

  it('returns 0 for zero alignment', () => {
    const intentions: Intention[] = [
      { file: 'a.ts', stated: [], actual: [], alignment: 0 },
    ]
    expect(computeOverallClarity(intentions)).toBe(0)
  })
})

// ─── generateMirrorRecommendations ─────────────────────────────────────────────

describe('generateMirrorRecommendations', () => {
  const baseStats: MirrorStats = {
    totalReflections: 5, alignedCount: 3, distortedCount: 1, avgAlignment: 70,
    mostAlignedFile: 'a.ts', mostDistortedFile: 'b.ts',
    overengineeredCount: 0, underdocumentedCount: 0, misnamedCount: 0,
    overpromisedCount: 0, hiddenComplexityCount: 0, overallClarity: 70,
  }

  it('recommends simplification for overengineered', () => {
    const stats = { ...baseStats, overengineeredCount: 2 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('overengineered'))).toBe(true)
  })

  it('recommends docs for underdocumented', () => {
    const stats = { ...baseStats, underdocumentedCount: 3 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('underdocumented'))).toBe(true)
  })

  it('recommends rename for misnamed', () => {
    const stats = { ...baseStats, misnamedCount: 1 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('misnamed'))).toBe(true)
  })

  it('recommends finishing TODOs for overpromised', () => {
    const stats = { ...baseStats, overpromisedCount: 4 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('overpromised'))).toBe(true)
  })

  it('recommends documenting hidden complexity', () => {
    const stats = { ...baseStats, hiddenComplexityCount: 2 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('hidden complexity'))).toBe(true)
  })

  it('highlights extreme distortions', () => {
    const reflections: Reflection[] = [
      { file: 'bad.ts', selfImage: 'x', reality: 'y', gap: 'z', distortionLevel: 'extreme' },
    ]
    const recs = generateMirrorRecommendations(reflections, [], baseStats)
    expect(recs.some((r) => r.includes('extreme distortion'))).toBe(true)
  })

  it('mentions most distorted file', () => {
    const recs = generateMirrorRecommendations([], [], baseStats)
    expect(recs.some((r) => r.includes('b.ts'))).toBe(true)
  })

  it('praises good clarity', () => {
    const stats = { ...baseStats, overallClarity: 85 }
    const recs = generateMirrorRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('clarity is 85%'))).toBe(true)
  })

  it('gives all-clear for perfect code', () => {
    const perfectStats: MirrorStats = {
      totalReflections: 1, alignedCount: 1, distortedCount: 0, avgAlignment: 100,
      mostAlignedFile: 'a.ts', mostDistortedFile: 'none',
      overengineeredCount: 0, underdocumentedCount: 0, misnamedCount: 0,
      overpromisedCount: 0, hiddenComplexityCount: 0, overallClarity: 75,
    }
    const recs = generateMirrorRecommendations([], [], perfectStats)
    expect(recs.some((r) => r.includes('accurate reflection'))).toBe(true)
  })
})

// ─── buildMirrorResult ─────────────────────────────────────────────────────────

describe('buildMirrorResult', () => {
  it('returns empty result for no files', () => {
    const result = buildMirrorResult([], [], {})
    expect(result.reflections).toEqual([])
    expect(result.intentions).toEqual([])
    expect(result.distortions).toEqual([])
    expect(result.stats.totalReflections).toBe(0)
    expect(result.recommendations).toContain('No files to analyze')
  })

  it('builds result for simple file', () => {
    const files = ['utils.ts']
    const contents = ['/** Adds numbers */\nfunction add(a, b) { return a + b }']
    const result = buildMirrorResult(files, contents, {})
    expect(result.reflections).toHaveLength(1)
    expect(result.intentions).toHaveLength(1)
    expect(result.stats.totalReflections).toBe(1)
  })

  it('computes alignment from intentions', () => {
    const files = ['add.ts']
    const contents = ['/** Adds two numbers together */\nfunction add(a, b) { return a + b }']
    const result = buildMirrorResult(files, contents, {})
    expect(result.intentions[0].alignment).toBeGreaterThan(0)
  })

  it('detects overpromised code', () => {
    const files = ['todo.ts']
    const contents = ['// TODO: implement this\nconst x = 1']
    const result = buildMirrorResult(files, contents, {})
    expect(result.distortions.some((d) => d.type === 'overpromised')).toBe(true)
  })

  it('detects underdocumented code', () => {
    const files = ['bare.ts']
    const contents = ['export function a() {}\nexport function b() {}\nexport function c() {}']
    const result = buildMirrorResult(files, contents, {})
    expect(result.distortions.some((d) => d.type === 'underdocumented')).toBe(true)
  })

  it('computes stats correctly', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      '/** Well documented */\nexport function add() {}',
      'export function mystery() {}',
    ]
    const result = buildMirrorResult(files, contents, {})
    expect(result.stats.totalReflections).toBe(2)
    expect(result.stats.mostAlignedFile).toBeTruthy()
    expect(result.stats.mostDistortedFile).toBeTruthy()
  })

  it('computes overall clarity', () => {
    const files = ['a.ts']
    const contents = ['/** add numbers */\nfunction add() {}']
    const result = buildMirrorResult(files, contents, {})
    expect(result.stats.overallClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallClarity).toBeLessThanOrEqual(100)
  })

  it('generates recommendations', () => {
    const files = ['a.ts']
    const contents = ['// TODO: fix this\nexport function x() {}']
    const result = buildMirrorResult(files, contents, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('assigns distortion file names', () => {
    const files = ['target.ts']
    const contents = ['// TODO: implement']
    const result = buildMirrorResult(files, contents, {})
    for (const d of result.distortions) {
      expect(d.file).toBe('target.ts')
    }
  })

  it('counts distortion types', () => {
    const files = ['mixed.ts']
    const contents = ['// TODO: fix\nexport function a() {}\nexport function b() {}']
    const result = buildMirrorResult(files, contents, {})
    expect(result.stats.overpromisedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.underdocumentedCount).toBeGreaterThanOrEqual(0)
  })

  it('handles multi-file project', () => {
    const files = ['main.ts', 'utils.ts', 'helpers.ts']
    const contents = [
      'import { x } from "./utils"\nfunction run() {}',
      '/** Utility */\nexport function x() {}',
      'export function help() {}',
    ]
    const result = buildMirrorResult(files, contents, {})
    expect(result.reflections).toHaveLength(3)
    expect(result.stats.totalReflections).toBe(3)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatReflections', () => {
  it('handles empty reflections', () => {
    expect(formatReflections([])).toContain('No reflections')
  })

  it('formats reflections', () => {
    const reflections: Reflection[] = [
      { file: 'a.ts', selfImage: 'Documented', reality: '10 lines', gap: 'No gap', distortionLevel: 'none' },
    ]
    const result = formatReflections(reflections)
    expect(result).toContain('a.ts')
    expect(result).toContain('Documented')
  })
})

describe('formatIntentions', () => {
  it('handles empty intentions', () => {
    expect(formatIntentions([])).toContain('No intentions')
  })

  it('formats intentions with alignment', () => {
    const intentions: Intention[] = [
      { file: 'a.ts', stated: ['Does stuff'], actual: ['function:stuff'], alignment: 75 },
    ]
    const result = formatIntentions(intentions)
    expect(result).toContain('a.ts')
    expect(result).toContain('75%')
  })
})

describe('formatDistortions', () => {
  it('handles empty distortions', () => {
    expect(formatDistortions([])).toContain('No distortions')
  })

  it('formats distortions', () => {
    const distortions: Distortion[] = [
      { file: 'a.ts', type: 'overpromised', severity: 'low', description: '1 TODO found', evidence: 'TODO', correction: 'Remove' },
    ]
    const result = formatDistortions(distortions)
    expect(result).toContain('overpromised')
    expect(result).toContain('a.ts')
  })
})

describe('formatMirrorStats', () => {
  it('formats stats', () => {
    const stats: MirrorStats = {
      totalReflections: 10, alignedCount: 7, distortedCount: 2, avgAlignment: 75,
      mostAlignedFile: 'good.ts', mostDistortedFile: 'bad.ts',
      overengineeredCount: 1, underdocumentedCount: 3, misnamedCount: 0,
      overpromisedCount: 2, hiddenComplexityCount: 1, overallClarity: 70,
    }
    const result = formatMirrorStats(stats)
    expect(result).toContain('10')
    expect(result).toContain('good.ts')
    expect(result).toContain('bad.ts')
  })
})

describe('formatRecommendations', () => {
  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Add docs', 'Fix names'])).toContain('Add docs')
  })
})

describe('formatMirrorTable', () => {
  it('formats full result', () => {
    const result: MirrorResult = {
      reflections: [], intentions: [], distortions: [],
      stats: {
        totalReflections: 0, alignedCount: 0, distortedCount: 0, avgAlignment: 0,
        mostAlignedFile: 'none', mostDistortedFile: 'none',
        overengineeredCount: 0, underdocumentedCount: 0, misnamedCount: 0,
        overpromisedCount: 0, hiddenComplexityCount: 0, overallClarity: 0,
      },
      recommendations: [],
    }
    const output = formatMirrorTable(result)
    expect(output).toContain('Mirror')
  })
})

describe('formatMirrorJSON', () => {
  it('outputs valid JSON', () => {
    const result: MirrorResult = {
      reflections: [], intentions: [], distortions: [],
      stats: {
        totalReflections: 0, alignedCount: 0, distortedCount: 0, avgAlignment: 0,
        mostAlignedFile: 'none', mostDistortedFile: 'none',
        overengineeredCount: 0, underdocumentedCount: 0, misnamedCount: 0,
        overpromisedCount: 0, hiddenComplexityCount: 0, overallClarity: 0,
      },
      recommendations: [],
    }
    const output = formatMirrorJSON(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats.totalReflections).toBe(0)
  })
})
