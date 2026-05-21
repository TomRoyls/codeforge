import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames,
  countInterfaces, countTypeAliases, countAnyUsage,
  countDefaultExports, countReExports,
  measureSilk, measureWeb, measureConnections,
  measureAdhesive, measureVibration, measureResilience,
  classifySpider,
  classifyCondition, classifyClusterType, classifyClusterCondition,
  classifyWeaverGrade,
  analyzeSilkThread, analyzeWebCluster,
  generateRecommendations, buildSpiderWebResult,
} from '../src/commands/spider-web-helpers.js'
import { formatSpiderWebTable, formatSpiderWebJson } from '../src/commands/spider-web-format-helpers.js'

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

describe('spider-web primitives', () => {
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
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts descriptive names', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames('function calculateTotal() {}')).toBe(1)
  })

  it('countInterfaces counts interfaces', () => {
    expect(countInterfaces(emptyCode)).toBe(0)
    expect(countInterfaces(diverseCode)).toBe(1)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(emptyCode)).toBe(0)
    expect(countTypeAliases(diverseCode)).toBe(1)
  })

  it('countAnyUsage counts any usage', () => {
    expect(countAnyUsage(emptyCode)).toBe(0)
    expect(countAnyUsage('const x: any = 1')).toBe(1)
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('spider-web measurements', () => {
  it('measureSilk handles empty code', () => {
    const s = measureSilk(emptyCode)
    expect(s.type).toBe('balloon')
    expect(s.strength).toBe(0)
    expect(s.isStrong).toBe(false)
    expect(s.isFragile).toBe(false)
  })

  it('measureSilk classifies strong code', () => {
    const s = measureSilk(strongCode)
    expect(s.strength).toBeGreaterThan(0)
    expect(s.isStrong).toBe(true)
    expect(['dragline', 'framework']).toContain(s.type)
  })

  it('measureSilk detects fragile code', () => {
    const s = measureSilk('if (a) { x }')
    expect(s.isFragile).toBe(true)
  })

  it('measureSilk detects sticky code', () => {
    const s = measureSilk(Array.from({ length: 8 }, (_, i) => `import { m${i} } from "./m${i}.js"`).join('\n'))
    expect(s.isSticky).toBe(true)
  })

  it('measureSilk detects slippery code', () => {
    const s = measureSilk('export function calc() {}')
    expect(s.isSlippery).toBe(true)
  })

  it('measureWeb handles empty code', () => {
    const w = measureWeb(emptyCode)
    expect(w.pattern).toBe('no-web')
    expect(w.geometry).toBe(0)
    expect(w.hasCenter).toBe(false)
  })

  it('measureWeb detects orb-web pattern', () => {
    const w = measureWeb(strongCode)
    expect(w.hasCenter).toBe(true)
    expect(w.hasRadii).toBe(true)
    expect(w.geometry).toBeGreaterThan(0)
  })

  it('measureWeb detects tarantula-burrow', () => {
    const w = measureWeb('const x = 1\nconst y = 2\nconst z = 3')
    expect(w.pattern).toBe('tarantula-burrow')
  })

  it('measureWeb detects symmetric web', () => {
    const w = measureWeb('import { a } from "b"\nexport function c() {}')
    expect(w.isSymmetric).toBe(true)
  })

  it('measureConnections handles empty code', () => {
    const c = measureConnections(emptyCode)
    expect(c.inbound).toBe(0)
    expect(c.outbound).toBe(0)
    expect(c.total).toBe(0)
    expect(c.hasCircular).toBe(false)
  })

  it('measureConnections counts inbound and outbound', () => {
    const c = measureConnections(strongCode)
    expect(c.inbound).toBe(2)
    expect(c.outbound).toBeGreaterThan(0)
    expect(c.total).toBeGreaterThan(0)
  })

  it('measureConnections detects dangling', () => {
    const code = Array.from({ length: 6 }, (_, i) => `import { m${i} } from "./m${i}.js"`).join('\n')
    const c = measureConnections(code)
    expect(c.hasDangling).toBe(true)
    expect(c.danglingCount).toBeGreaterThan(0)
  })

  it('measureAdhesive handles empty code', () => {
    const a = measureAdhesive(emptyCode)
    expect(a.quality).toBe(0)
    expect(a.hasStrongInterface).toBe(false)
  })

  it('measureAdhesive detects strong interface', () => {
    const a = measureAdhesive(diverseCode)
    expect(a.hasStrongInterface).toBe(true)
    expect(a.quality).toBeGreaterThan(0)
  })

  it('measureAdhesive detects weak interface', () => {
    const a = measureAdhesive('export function calc(x: any): any { return x }')
    expect(a.hasWeakInterface).toBe(true)
  })

  it('measureAdhesive detects non-stick interfaces', () => {
    const a = measureAdhesive(diverseCode)
    expect(a.hasNonStick).toBe(true)
  })

  it('measureVibration handles empty code', () => {
    const v = measureVibration(emptyCode)
    expect(v.sensitivity).toBe(0)
    expect(v.hasIsolation).toBe(false)
    expect(v.isSensitive).toBe(false)
  })

  it('measureVibration detects isolation', () => {
    const v = measureVibration('const x = 1')
    expect(v.hasIsolation).toBe(true)
  })

  it('measureVibration detects dampening', () => {
    const v = measureVibration(diverseCode)
    expect(v.hasDampening).toBe(true)
  })

  it('measureResilience handles empty code', () => {
    const r = measureResilience(emptyCode)
    expect(r.canRepair).toBe(false)
    expect(r.resilienceScore).toBe(0)
    expect(r.isRobust).toBe(false)
  })

  it('measureResilience evaluates strong code', () => {
    const r = measureResilience(strongCode)
    expect(r.canRepair).toBe(true)
    expect(r.hasBackup).toBe(true)
    expect(r.resilienceScore).toBeGreaterThan(0)
  })

  it('classifySpider handles empty code', () => {
    const s = classifySpider(emptyCode)
    expect(s.isArchitect).toBe(false)
    expect(s.isDweller).toBe(false)
    expect(s.silkProduction).toBe(0)
  })

  it('classifySpider detects dweller', () => {
    const s = classifySpider('const x = 1')
    expect(s.isDweller).toBe(true)
  })

  it('classifySpider detects architect', () => {
    const s = classifySpider(diverseCode)
    expect(s.isArchitect).toBe(true)
  })

  it('classifySpider detects weaver', () => {
    const s = classifySpider(strongCode)
    expect(s.isWeaver).toBe(true)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('spider-web classification', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('masterpiece-web')
    expect(classifyCondition(72)).toBe('strong-web')
    expect(classifyCondition(55)).toBe('functional-web')
    expect(classifyCondition(38)).toBe('patchy-web')
    expect(classifyCondition(20)).toBe('torn-web')
    expect(classifyCondition(5)).toBe('no-web')
  })

  it('classifyClusterType returns empty-corner for empty', () => {
    expect(classifyClusterType([])).toBe('empty-corner')
  })

  it('classifyClusterCondition returns bare-wall for empty', () => {
    expect(classifyClusterCondition([])).toBe('bare-wall')
  })

  it('classifyWeaverGrade returns correct grades', () => {
    expect(classifyWeaverGrade(85)).toBe('master-weaver')
    expect(classifyWeaverGrade(68)).toBe('expert-weaver')
    expect(classifyWeaverGrade(50)).toBe('weaver')
    expect(classifyWeaverGrade(35)).toBe('spinner')
    expect(classifyWeaverGrade(18)).toBe('hatchling')
    expect(classifyWeaverGrade(8)).toBe('fly')
  })
})

// ─── Core Analysis ────────────────────────────────────────────────────────────

describe('spider-web core analysis', () => {
  it('analyzeSilkThread returns no-web for empty code', () => {
    const t = analyzeSilkThread(emptyCode, 'empty.ts')
    expect(t.condition).toBe('no-web')
    expect(t.qualityScore).toBe(0)
    expect(t.silk.type).toBe('balloon')
    expect(t.file).toBe('empty.ts')
  })

  it('analyzeSilkThread returns non-zero scores for strong code', () => {
    const t = analyzeSilkThread(strongCode, 'strong.ts')
    expect(t.qualityScore).toBeGreaterThan(0)
    expect(t.silkStrength).toBeGreaterThan(0)
    expect(t.webGeometry).toBeGreaterThan(0)
  })

  it('analyzeSilkThread assigns file path correctly', () => {
    const t = analyzeSilkThread(simpleCode, 'src/test.ts')
    expect(t.file).toBe('src/test.ts')
  })

  it('analyzeSilkThread populates all sub-measures', () => {
    const t = analyzeSilkThread(strongCode, 'strong.ts')
    expect(typeof t.silk.strength).toBe('number')
    expect(typeof t.web.geometry).toBe('number')
    expect(typeof t.connections.total).toBe('number')
    expect(typeof t.adhesive.quality).toBe('number')
    expect(typeof t.vibration.sensitivity).toBe('number')
    expect(typeof t.resilience.resilienceScore).toBe('number')
    expect(typeof t.spider.silkProduction).toBe('number')
  })
})

// ─── Web Cluster ──────────────────────────────────────────────────────────────

describe('spider-web cluster analysis', () => {
  it('analyzeWebCluster returns empty-corner for empty', () => {
    const c = analyzeWebCluster([], 'empty-dir')
    expect(c.clusterType).toBe('empty-corner')
    expect(c.condition).toBe('bare-wall')
    expect(c.threads).toHaveLength(0)
  })

  it('analyzeWebCluster aggregates thread scores', () => {
    const threads = [
      analyzeSilkThread(strongCode, 'a.ts'),
      analyzeSilkThread(typedCode, 'b.ts'),
    ]
    const c = analyzeWebCluster(threads, 'src')
    expect(c.threads).toHaveLength(2)
    expect(c.avgSilkStrength).toBeGreaterThan(0)
    expect(c.directory).toBe('src')
  })

  it('analyzeWebCluster counts conditions', () => {
    const threads = [analyzeSilkThread(strongCode, 'a.ts')]
    const c = analyzeWebCluster(threads, 'src')
    expect(typeof c.masterpieceCount).toBe('number')
    expect(typeof c.tornCount).toBe('number')
    expect(typeof c.circularDepCount).toBe('number')
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('spider-web build result', () => {
  it('buildSpiderWebResult handles empty input', () => {
    const result = buildSpiderWebResult([], [], {})
    expect(result.threads).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallStrength).toBe(0)
    expect(result.stats.weaverGrade).toBe('fly')
    expect(result.stats.strongestThread).toBe('none')
    expect(result.stats.mostConnected).toBe('none')
    expect(result.stats.mostResilient).toBe('none')
    expect(result.stats.mostVulnerable).toBe('none')
    expect(result.stats.mostTangled).toBe('none')
  })

  it('buildSpiderWebResult processes single file', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    expect(result.threads).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.strongestThread).toBe('a.ts')
  })

  it('buildSpiderWebResult processes multiple files', () => {
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildSpiderWebResult(multiFilePaths, contents, {})
    expect(result.threads).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalClusters).toBe(1)
  })

  it('buildSpiderWebResult groups by directory', () => {
    const paths = ['src/a.ts', 'src/b.ts', 'lib/c.ts']
    const contents = [strongCode, diverseCode, typedCode]
    const result = buildSpiderWebResult(paths, contents, {})
    expect(result.clusters).toHaveLength(2)
  })

  it('buildSpiderWebResult computes colony averages', () => {
    const result = buildSpiderWebResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    expect(result.colony.avgSilkStrength).toBeGreaterThanOrEqual(0)
    expect(result.colony.overallStrength).toBeGreaterThanOrEqual(0)
    expect(typeof result.colony.isRobust).toBe('boolean')
  })

  it('buildSpiderWebResult counts condition types', () => {
    const result = buildSpiderWebResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.masterpieceWebCount +
      result.stats.strongWebCount +
      result.stats.functionalWebCount +
      result.stats.patchyWebCount +
      result.stats.tornWebCount +
      result.stats.noWebCount
    expect(total).toBe(3)
  })

  it('buildSpiderWebResult counts pattern types', () => {
    const result = buildSpiderWebResult(multiFilePaths, [strongCode, diverseCode, typedCode], {})
    const total = result.stats.orbWebCount +
      result.stats.cobwebCount +
      result.stats.sheetWebCount +
      result.stats.funnelWebCount
    expect(total).toBeLessThanOrEqual(3)
  })

  it('buildSpiderWebResult handles mismatched contents', () => {
    const result = buildSpiderWebResult(['a.ts', 'b.ts'], [strongCode], {})
    expect(result.threads).toHaveLength(2)
    expect(result.threads[1].qualityScore).toBe(0)
  })

  it('buildSpiderWebResult identifies extremes', () => {
    const result = buildSpiderWebResult(
      ['strong.ts', 'weak.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.strongestThread).toBeTruthy()
    expect(result.stats.mostConnected).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostVulnerable).toBeTruthy()
    expect(result.stats.mostTangled).toBeTruthy()
  })

  it('buildSpiderWebResult counts feature flags', () => {
    const result = buildSpiderWebResult(
      ['a.ts', 'b.ts'],
      [strongCode, consoleCode],
      {},
    )
    expect(typeof result.stats.hasIsolationCount).toBe('number')
    expect(typeof result.stats.hasDampeningCount).toBe('number')
    expect(typeof result.stats.canRepairCount).toBe('number')
    expect(typeof result.stats.isRobustCount).toBe('number')
    expect(typeof result.stats.architectCount).toBe('number')
    expect(typeof result.stats.weaverCount).toBe('number')
  })

  it('quality scores are bounded 0-100', () => {
    const codes = [emptyCode, simpleCode, strongCode, diverseCode, testCode, consoleCode, untypedCode]
    for (const code of codes) {
      const t = analyzeSilkThread(code, 'test.ts')
      expect(t.qualityScore).toBeGreaterThanOrEqual(0)
      expect(t.qualityScore).toBeLessThanOrEqual(100)
      expect(t.silkStrength).toBeGreaterThanOrEqual(0)
      expect(t.silkStrength).toBeLessThanOrEqual(100)
      expect(t.webGeometry).toBeGreaterThanOrEqual(0)
      expect(t.webGeometry).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('spider-web recommendations', () => {
  it('generateRecommendations warns about broken strands', () => {
    const result = buildSpiderWebResult(['a.ts'], [simpleCode], {})
    if (result.stats.tornWebCount + result.stats.noWebCount > 0) {
      expect(result.recommendations.some(r => r.includes('Broken strands'))).toBe(true)
    }
  })

  it('generateRecommendations praises high strength', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    if (result.colony.overallStrength >= 70) {
      expect(result.recommendations.some(r => r.includes('Strong web'))).toBe(true)
    }
  })

  it('generateRecommendations returns deduplicated array', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toEqual(unique)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('spider-web format helpers', () => {
  it('formatSpiderWebTable returns string with header', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const table = formatSpiderWebTable(result, false)
    expect(table).toContain('Spider Web')
    expect(table).toContain('Silk Threads')
    expect(table).toContain('Statistics')
  })

  it('formatSpiderWebTable includes recommendations', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const table = formatSpiderWebTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatSpiderWebTable handles empty result', () => {
    const result = buildSpiderWebResult([], [], {})
    const table = formatSpiderWebTable(result, false)
    expect(table).toContain('No files analyzed')
  })

  it('formatSpiderWebTable verbose shows details', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const verbose = formatSpiderWebTable(result, true)
    expect(verbose).toContain('silk:')
    expect(verbose).toContain('web:')
    expect(verbose).toContain('conn:')
    expect(verbose).toContain('adhesive:')
    expect(verbose).toContain('vibration:')
    expect(verbose).toContain('resilience:')
    expect(verbose).toContain('spider:')
  })

  it('formatSpiderWebTable truncates at 15 threads', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleCode)
    const result = buildSpiderWebResult(paths, contents, {})
    const table = formatSpiderWebTable(result, false)
    expect(table).toContain('... and 5 more')
  })

  it('formatSpiderWebTable shows clusters section', () => {
    const result = buildSpiderWebResult(['src/a.ts', 'src/b.ts'], [strongCode, diverseCode], {})
    const table = formatSpiderWebTable(result, false)
    expect(table).toContain('Web Clusters')
  })

  it('formatSpiderWebTable shows colony section', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const table = formatSpiderWebTable(result, false)
    expect(table).toContain('Colony')
  })

  it('formatSpiderWebJson returns valid JSON', () => {
    const result = buildSpiderWebResult(['a.ts'], [strongCode], {})
    const json = formatSpiderWebJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json) as { threads: unknown[] }
    expect(parsed.threads).toHaveLength(1)
  })

  it('formatSpiderWebJson handles empty result', () => {
    const result = buildSpiderWebResult([], [], {})
    const json = formatSpiderWebJson(result)
    const parsed = JSON.parse(json) as { stats: { totalFiles: number } }
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('spider-web edge cases', () => {
  it('handles code with only comments', () => {
    const t = analyzeSilkThread('// just a comment\n/* block */', 'comment.ts')
    expect(t.file).toBe('comment.ts')
    expect(typeof t.qualityScore).toBe('number')
  })

  it('handles untyped functions', () => {
    const t = analyzeSilkThread(untypedCode, 'untyped.ts')
    expect(t.silk.isFragile).toBe(true)
    expect(t.adhesive.hasWeakInterface).toBe(false)
  })

  it('all sub-scores are bounded', () => {
    const t = analyzeSilkThread(strongCode, 'test.ts')
    expect(t.silkStrength).toBeGreaterThanOrEqual(0)
    expect(t.silkStrength).toBeLessThanOrEqual(100)
    expect(t.webGeometry).toBeGreaterThanOrEqual(0)
    expect(t.webGeometry).toBeLessThanOrEqual(100)
    expect(t.adhesiveQuality).toBeGreaterThanOrEqual(0)
    expect(t.adhesiveQuality).toBeLessThanOrEqual(100)
    expect(t.vibrationSensitivity).toBeGreaterThanOrEqual(0)
    expect(t.vibrationSensitivity).toBeLessThanOrEqual(100)
    expect(t.structuralResilience).toBeGreaterThanOrEqual(0)
    expect(t.structuralResilience).toBeLessThanOrEqual(100)
  })

  it('overall strength is bounded 0-100', () => {
    const result = buildSpiderWebResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleCode],
      {},
    )
    expect(result.stats.overallStrength).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallStrength).toBeLessThanOrEqual(100)
  })

  it('test code has high inbound connections', () => {
    const t = analyzeSilkThread(testCode, 'test.ts')
    expect(t.connections.inbound).toBeGreaterThan(0)
  })
})
