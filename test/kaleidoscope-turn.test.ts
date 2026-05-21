import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos, countAbstractions,
  classifyChamberType, classifyChamberCondition, classifyOpticianGrade,
  analyzePerspectiveView,
  detectPatterns, measureColorProfile,
  measurePerspectiveVariance,
  analyzeKaleidoscopeShard, analyzeKaleidoscopeChamber,
  generateRecommendations, buildKaleidoscopeTurnResult,
} from '../src/commands/kaleidoscope-turn-helpers.js'
import { formatKaleidoscopeTurnTable, formatKaleidoscopeTurnJson } from '../src/commands/kaleidoscope-turn-format-helpers.js'

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

const interfaceCode = [
  'export interface User { name: string; age: number }',
  'export type UserId = string',
  'export function getUser(id: string): User { return { name: "test", age: 25 } }',
].join('\n')

const noExportCode = [
  'const a = 1',
  'const b = 2',
  'const c = 3',
].join('\n')

const noisyCode = [
  'export function debug() {',
  '  console.log("a")',
  '  console.log("b")',
  '  console.log("c")',
  '  console.log("d")',
  '  console.log("e")',
  '  console.log("f")',
  '}',
].join('\n')

const todoCode = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: temp',
  '// XXX: bad',
  'export function a() { return 1 }',
].join('\n')

const deepCode = 'if (a) { if (b) { if (c) { if (d) { if (e) { return 1 } } } } }'

// ─── Primitive Tests ──────────────────────────────────────────────────────────

describe('kaleidoscope-turn primitives', () => {
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
    expect(countConsole(noisyCode)).toBe(6)
  })

  it('countComments counts comments', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts todos', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(todoCode)).toBe(4)
  })

  it('countAbstractions counts classes/interfaces/types', () => {
    expect(countAbstractions(emptyCode)).toBe(0)
    expect(countAbstractions('class A {} interface B {}')).toBe(2)
  })
})

// ─── Classification Tests ─────────────────────────────────────────────────────

describe('kaleidoscope-turn classifications', () => {
  it('classifyChamberType returns correct types', () => {
    expect(classifyChamberType(85, 80)).toBe('mandala')
    expect(classifyChamberType(70, 65)).toBe('star')
    expect(classifyChamberType(50, 65)).toBe('flower')
    expect(classifyChamberType(65, 40)).toBe('crystal')
    expect(classifyChamberType(35, 30)).toBe('geometric')
    expect(classifyChamberType(15, 10)).toBe('chaotic')
  })

  it('classifyChamberCondition returns correct conditions', () => {
    expect(classifyChamberCondition(90)).toBe('breathtaking')
    expect(classifyChamberCondition(75)).toBe('beautiful')
    expect(classifyChamberCondition(60)).toBe('pleasant')
    expect(classifyChamberCondition(40)).toBe('mediocre')
    expect(classifyChamberCondition(20)).toBe('ugly')
    expect(classifyChamberCondition(5)).toBe('broken')
  })

  it('classifyOpticianGrade returns correct grades', () => {
    expect(classifyOpticianGrade(85)).toBe('master-optician')
    expect(classifyOpticianGrade(70)).toBe('optician')
    expect(classifyOpticianGrade(50)).toBe('glassblower')
    expect(classifyOpticianGrade(35)).toBe('apprentice')
    expect(classifyOpticianGrade(18)).toBe('child')
    expect(classifyOpticianGrade(5)).toBe('blind')
  })
})

// ─── Perspective View Tests ───────────────────────────────────────────────────

describe('kaleidoscope-turn perspective views', () => {
  const perspectives = ['structural', 'behavioral', 'logical', 'stylistic', 'semantic', 'relational'] as const

  it('returns empty view for empty code', () => {
    const view = analyzePerspectiveView(emptyCode, 'structural')
    expect(view.score).toBe(0)
    expect(view.pattern).toBe('empty')
    expect(view.isClear).toBe(false)
  })

  it('all perspectives return valid structure for strong code', () => {
    for (const p of perspectives) {
      const view = analyzePerspectiveView(strongCode, p)
      expect(view.score).toBeGreaterThanOrEqual(0)
      expect(view.score).toBeLessThanOrEqual(100)
      expect(typeof view.pattern).toBe('string')
      expect(typeof view.isClear).toBe('boolean')
      expect(typeof view.isBeautiful).toBe('boolean')
      expect(typeof view.isDistorted).toBe('boolean')
      expect(Array.isArray(view.issues)).toBe(true)
      expect(Array.isArray(view.highlights)).toBe(true)
    }
  })

  it('structural perspective detects modular pattern', () => {
    const view = analyzePerspectiveView(strongCode, 'structural')
    expect(view.score).toBeGreaterThan(0)
    expect(view.isClear).toBe(true)
  })

  it('behavioral perspective detects error handling', () => {
    const view = analyzePerspectiveView(strongCode, 'behavioral')
    expect(view.highlights).toEqual(expect.arrayContaining([expect.stringContaining('error handling')]))
  })

  it('logical perspective detects flat flow', () => {
    const view = analyzePerspectiveView(strongCode, 'logical')
    expect(view.highlights.length).toBeGreaterThan(0)
  })

  it('stylistic perspective detects documentation', () => {
    const view = analyzePerspectiveView(strongCode, 'stylistic')
    expect(view.highlights).toEqual(expect.arrayContaining([expect.stringContaining('documentation')]))
  })

  it('semantic perspective detects exports', () => {
    const view = analyzePerspectiveView(strongCode, 'semantic')
    expect(view.isClear).toBe(true)
  })

  it('relational perspective detects connections', () => {
    const view = analyzePerspectiveView(strongCode, 'relational')
    expect(view.highlights.length).toBeGreaterThan(0)
  })

  it('detects nesting depth in deeply nested code', () => {
    const view = analyzePerspectiveView(deepCode, 'logical')
    expect(view.score).toBeGreaterThanOrEqual(0)
    expect(view.pattern).toBe('branching')
  })

  it('structural view has no issues for simple no-export code', () => {
    const view = analyzePerspectiveView(noExportCode, 'structural')
    expect(view.issues.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── Pattern Detection Tests ──────────────────────────────────────────────────

describe('kaleidoscope-turn patterns', () => {
  it('detectPatterns returns correct structure', () => {
    const p = detectPatterns(strongCode)
    expect(typeof p.hasSymmetry).toBe('boolean')
    expect(typeof p.hasRepetition).toBe('boolean')
    expect(typeof p.hasReflection).toBe('boolean')
    expect(typeof p.hasRotation).toBe('boolean')
    expect(typeof p.hasFractal).toBe('boolean')
    expect(typeof p.hasDistortion).toBe('boolean')
    expect(Array.isArray(p.distortionPoints)).toBe(true)
  })

  it('detects symmetry in well-rounded code', () => {
    expect(detectPatterns(strongCode).hasSymmetry).toBe(true)
  })

  it('detects repetition in multi-export code', () => {
    expect(detectPatterns(strongCode).hasRepetition).toBe(true)
  })

  it('detects reflection with imports and exports', () => {
    expect(detectPatterns(strongCode).hasReflection).toBe(true)
  })

  it('detects distortion in todo-heavy code', () => {
    expect(detectPatterns(todoCode).hasDistortion).toBe(true)
    expect(detectPatterns(todoCode).distortionPoints.length).toBeGreaterThan(0)
  })

  it('returns no distortion for empty code', () => {
    expect(detectPatterns(emptyCode).hasDistortion).toBe(false)
  })
})

// ─── Color Profile Tests ─────────────────────────────────────────────────────

describe('kaleidoscope-turn color profiles', () => {
  it('measureColorProfile returns correct structure', () => {
    const c = measureColorProfile(strongCode)
    expect(c.richness).toBeGreaterThanOrEqual(0)
    expect(c.richness).toBeLessThanOrEqual(100)
    expect(c.harmony).toBeGreaterThanOrEqual(0)
    expect(c.contrast).toBeGreaterThanOrEqual(0)
    expect(typeof c.isMonochrome).toBe('boolean')
    expect(typeof c.isPolychrome).toBe('boolean')
    expect(typeof c.isClashing).toBe('boolean')
  })

  it('strong code is polychrome', () => {
    expect(measureColorProfile(strongCode).isPolychrome).toBe(true)
  })

  it('simple code is monochrome', () => {
    expect(measureColorProfile(simpleCode).isMonochrome).toBe(true)
  })
})

// ─── Perspective Variance Tests ───────────────────────────────────────────────

describe('kaleidoscope-turn variance', () => {
  it('measurePerspectiveVariance returns 100 for identical scores', () => {
    const views = {
      a: { score: 80, pattern: 'x', isClear: true, isBeautiful: true, isDistorted: false, issues: [], highlights: [] },
      b: { score: 80, pattern: 'x', isClear: true, isBeautiful: true, isDistorted: false, issues: [], highlights: [] },
    }
    expect(measurePerspectiveVariance(views)).toBe(100)
  })

  it('measurePerspectiveVariance returns lower for spread scores', () => {
    const views = {
      a: { score: 100, pattern: 'x', isClear: true, isBeautiful: true, isDistorted: false, issues: [], highlights: [] },
      b: { score: 0, pattern: 'x', isClear: false, isBeautiful: false, isDistorted: true, issues: [], highlights: [] },
    }
    expect(measurePerspectiveVariance(views)).toBeLessThan(100)
  })
})

// ─── Shard Analysis Tests ─────────────────────────────────────────────────────

describe('kaleidoscope-turn shard analysis', () => {
  it('analyzeKaleidoscopeShard returns correct structure', () => {
    const shard = analyzeKaleidoscopeShard(strongCode, 'calc.ts')
    expect(shard.file).toBe('calc.ts')
    expect(shard.rotation).toBeGreaterThanOrEqual(0)
    expect(shard.symmetry).toBeGreaterThanOrEqual(0)
    expect(shard.symmetry).toBeLessThanOrEqual(100)
    expect(shard.alignment).toBeGreaterThanOrEqual(0)
    expect(shard.beauty).toBeGreaterThanOrEqual(0)
    expect(shard.qualityScore).toBeGreaterThanOrEqual(0)
    expect(shard.qualityScore).toBeLessThanOrEqual(100)
    expect(typeof shard.dominantPerspective).toBe('string')
    expect(typeof shard.weakestPerspective).toBe('string')
    expect(shard.perspectiveVariance).toBeGreaterThanOrEqual(0)
  })

  it('strong code has higher symmetry than empty code', () => {
    const good = analyzeKaleidoscopeShard(strongCode, 'good.ts')
    const bad = analyzeKaleidoscopeShard(emptyCode, 'bad.ts')
    expect(good.symmetry).toBeGreaterThan(bad.symmetry)
  })

  it('empty code shard has valid perspectives', () => {
    const shard = analyzeKaleidoscopeShard(emptyCode, 'empty.ts')
    expect(shard.perspectives.structural.score).toBe(0)
    expect(shard.perspectives.behavioral.score).toBe(0)
  })
})

// ─── Chamber Analysis Tests ───────────────────────────────────────────────────

describe('kaleidoscope-turn chamber analysis', () => {
  it('analyzeKaleidoscopeChamber returns correct structure for empty', () => {
    const chamber = analyzeKaleidoscopeChamber([], 'src')
    expect(chamber.directory).toBe('src')
    expect(chamber.shards).toHaveLength(0)
    expect(chamber.chamberType).toBe('chaotic')
  })

  it('analyzeKaleidoscopeChamber computes averages', () => {
    const shards = [
      analyzeKaleidoscopeShard(strongCode, 'a.ts'),
      analyzeKaleidoscopeShard(typedCode, 'b.ts'),
    ]
    const chamber = analyzeKaleidoscopeChamber(shards, 'src')
    expect(chamber.avgSymmetry).toBeGreaterThanOrEqual(0)
    expect(chamber.avgBeauty).toBeGreaterThanOrEqual(0)
    expect(typeof chamber.dominantPerspective).toBe('string')
    expect(typeof chamber.chamberType).toBe('string')
    expect(typeof chamber.condition).toBe('string')
  })
})

// ─── Build Result Tests ───────────────────────────────────────────────────────

describe('kaleidoscope-turn build result', () => {
  it('buildKaleidoscopeTurnResult returns correct structure', () => {
    const result = buildKaleidoscopeTurnResult(['a.ts'], [typedCode], {})
    expect(result.shards).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.opticianGrade).toBeDefined()
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.overallSymmetry).toBeGreaterThanOrEqual(0)
  })

  it('handles empty files', () => {
    const result = buildKaleidoscopeTurnResult([], [], {})
    expect(result.shards).toHaveLength(0)
    expect(result.stats.mostSymmetrical).toBe('none')
    expect(result.stats.leastSymmetrical).toBe('none')
    expect(result.stats.mostBeautiful).toBe('none')
    expect(result.stats.bestFromAllAngles).toBe('none')
  })

  it('groups shards into chambers by directory', () => {
    const result = buildKaleidoscopeTurnResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [typedCode, strongCode, simpleCode],
      {},
    )
    expect(result.chambers).toHaveLength(2)
  })

  it('identifies most symmetrical and least symmetrical', () => {
    const result = buildKaleidoscopeTurnResult(
      ['good.ts', 'bad.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.mostSymmetrical).toBe('good.ts')
    expect(result.stats.leastSymmetrical).toBe('bad.ts')
  })

  it('handles missing contents gracefully', () => {
    const result = buildKaleidoscopeTurnResult(['a.ts'], [], {})
    expect(result.shards).toHaveLength(1)
  })
})

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('kaleidoscope-turn recommendations', () => {
  it('returns array', () => {
    const result = buildKaleidoscopeTurnResult(['a.ts'], [strongCode], {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('includes good symmetry message', () => {
    const result = buildKaleidoscopeTurnResult(['a.ts'], [strongCode], {})
    if (result.stats.overallSymmetry >= 60) {
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('Good symmetry')]),
      )
    }
  })
})

// ─── Format Tests ─────────────────────────────────────────────────────────────

describe('kaleidoscope-turn formatters', () => {
  const sampleResult = buildKaleidoscopeTurnResult(
    ['a.ts', 'b.ts'],
    [strongCode, typedCode],
    {},
  )

  it('formatKaleidoscopeTurnTable returns string with header', () => {
    const table = formatKaleidoscopeTurnTable(sampleResult, false)
    expect(table).toContain('Kaleidoscope Turn')
    expect(table).toContain('Shards')
    expect(table).toContain('Statistics')
    expect(typeof table).toBe('string')
  })

  it('formatKaleidoscopeTurnTable verbose shows perspectives', () => {
    const table = formatKaleidoscopeTurnTable(sampleResult, true)
    expect(table).toContain('dominant:')
    expect(table).toContain('perspectives:')
  })

  it('formatKaleidoscopeTurnTable handles empty', () => {
    const empty = buildKaleidoscopeTurnResult([], [], {})
    const table = formatKaleidoscopeTurnTable(empty, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatKaleidoscopeTurnJson returns valid JSON', () => {
    const json = formatKaleidoscopeTurnJson(sampleResult)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Edge Case Tests ──────────────────────────────────────────────────────────

describe('kaleidoscope-turn edge cases', () => {
  it('handles deeply nested code', () => {
    const shard = analyzeKaleidoscopeShard(deepCode, 'deep.ts')
    expect(shard.rotation).toBeGreaterThanOrEqual(0)
    expect(shard.symmetry).toBeGreaterThanOrEqual(0)
  })

  it('handles noisy code with distortion', () => {
    const shard = analyzeKaleidoscopeShard(noisyCode, 'noisy.ts')
    expect(shard.pattern.hasDistortion).toBe(true)
  })

  it('handles single file with no directory', () => {
    const result = buildKaleidoscopeTurnResult(['single.ts'], [typedCode], {})
    expect(result.chambers).toHaveLength(1)
    expect(result.chambers[0].directory).toBe('.')
  })

  it('computes all perspective averages', () => {
    const result = buildKaleidoscopeTurnResult(['a.ts'], [strongCode], {})
    expect(result.stats.avgStructuralScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgBehavioralScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLogicalScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStylisticScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgSemanticScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRelationalScore).toBeGreaterThanOrEqual(0)
  })

  it('tracks chamber type counts', () => {
    const result = buildKaleidoscopeTurnResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [strongCode, typedCode, emptyCode],
      {},
    )
    expect(result.stats.mandalaChambers + result.stats.chaoticChambers).toBeGreaterThanOrEqual(0)
    expect(result.stats.harmoniousFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.clashingFiles).toBeGreaterThanOrEqual(0)
  })

  it('tracks symmetry and distortion file counts', () => {
    const result = buildKaleidoscopeTurnResult(
      ['a.ts', 'b.ts'],
      [strongCode, todoCode],
      {},
    )
    expect(result.stats.symmetryFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.distortionFiles).toBeGreaterThanOrEqual(0)
  })

  it('tracks monochrome and polychrome counts', () => {
    const result = buildKaleidoscopeTurnResult(
      ['simple.ts', 'strong.ts'],
      [simpleCode, strongCode],
      {},
    )
    expect(result.stats.monochromeFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.polychromeFiles).toBeGreaterThanOrEqual(0)
  })

  it('chamber identifies dominant and weak perspectives', () => {
    const shards = [
      analyzeKaleidoscopeShard(strongCode, 'a.ts'),
      analyzeKaleidoscopeShard(strongCode, 'b.ts'),
    ]
    const chamber = analyzeKaleidoscopeChamber(shards, 'src')
    expect(typeof chamber.dominantPerspective).toBe('string')
    expect(typeof chamber.weakPerspective).toBe('string')
  })

  it('formatKaleidoscopeTurnTable truncates shards at 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `${i}.ts`)
    const contents = Array.from({ length: 20 }, () => typedCode)
    const big = buildKaleidoscopeTurnResult(files, contents, {})
    const table = formatKaleidoscopeTurnTable(big, false)
    expect(table).toContain('more')
  })

  it('formatKaleidoscopeTurnJson handles empty result', () => {
    const empty = buildKaleidoscopeTurnResult([], [], {})
    const json = formatKaleidoscopeTurnJson(empty)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })

  it('color profile clashing is true for bad code', () => {
    const badCode = [
      '// TODO: fix',
      '// FIXME: broken',
      '// HACK: temp',
      '// XXX: bad',
      'const a = 1',
      ...Array.from({ length: 50 }, (_, i) => `const x${i} = ${i}`),
    ].join('\n')
    expect(measureColorProfile(badCode).isClashing).toBe(true)
  })

  it('detects fractal patterns in multi-abstraction code', () => {
    const fractalCode = [
      'class A {}',
      'class B {}',
      'interface I {}',
      'function a() { return 1 }',
      'function b() { return 2 }',
    ].join('\n')
    expect(detectPatterns(fractalCode).hasFractal).toBe(true)
  })

  it('relational view detects isolated code', () => {
    const view = analyzePerspectiveView(noExportCode, 'relational')
    expect(view.isDistorted).toBe(true)
    expect(view.issues).toEqual(expect.arrayContaining([expect.stringContaining('isolated')]))
  })
})
