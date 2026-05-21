import { describe, it, expect } from 'vitest'
import {
  classifySandType,
  classifyHourglassRole,
  classifyCondition,
  classifyTimekeeperGrade,
  detectClogs,
  detectLeaks,
  detectTurbulence,
  detectPooling,
  analyzeGrainDistribution,
  analyzeSandGrain,
  analyzeSandLayer,
  generateRecommendations,
  buildHourglassGrainResult,
  type SandGrain,
  type SandLayer,
  type HourglassGrainStats,
  type HourglassGrainResult,
} from '../src/commands/hourglass-grain-helpers.js'
import { formatHourglassGrainTable, formatHourglassGrainJson } from '../src/commands/hourglass-grain-format-helpers.js'

// ─── classifySandType ────────────────────────────────────────────────────────

describe('classifySandType', () => {
  it('returns diamond for quality >= 85', () => {
    expect(classifySandType(85)).toBe('diamond')
    expect(classifySandType(100)).toBe('diamond')
  })

  it('returns corundum for quality 70-84', () => {
    expect(classifySandType(70)).toBe('corundum')
    expect(classifySandType(84)).toBe('corundum')
  })

  it('returns garnet for quality 55-69', () => {
    expect(classifySandType(55)).toBe('garnet')
  })

  it('returns quartz for quality 40-54', () => {
    expect(classifySandType(40)).toBe('quartz')
  })

  it('returns silica for quality 25-39', () => {
    expect(classifySandType(25)).toBe('silica')
  })

  it('returns dust for quality 10-24', () => {
    expect(classifySandType(10)).toBe('dust')
  })

  it('returns mud for quality < 10', () => {
    expect(classifySandType(0)).toBe('mud')
    expect(classifySandType(5)).toBe('mud')
  })
})

// ─── classifyHourglassRole ───────────────────────────────────────────────────

describe('classifyHourglassRole', () => {
  it('returns timer for timer patterns', () => {
    expect(classifyHourglassRole('setTimeout(fn, 100)')).toBe('timer')
    expect(classifyHourglassRole('debounce(handler, 300)')).toBe('timer')
  })

  it('returns measure for benchmark patterns', () => {
    expect(classifyHourglassRole('const t = performance.now()')).toBe('measure')
  })

  it('returns buffer for queue patterns', () => {
    expect(classifyHourglassRole('const buf = new Buffer(1024)')).toBe('buffer')
  })

  it('returns reservoir for storage patterns', () => {
    expect(classifyHourglassRole('localStorage.setItem(key, val)')).toBe('reservoir')
  })

  it('returns filter for array methods', () => {
    expect(classifyHourglassRole('const r = arr.filter(x => x > 0)')).toBe('filter')
  })

  it('returns valve for conditional logic', () => {
    expect(classifyHourglassRole('if (condition) { doIt() }')).toBe('valve')
  })

  it('returns filter as default', () => {
    expect(classifyHourglassRole('const x = 1')).toBe('filter')
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns flowing for high metrics', () => {
    expect(classifyCondition(80, 80)).toBe('flowing')
    expect(classifyCondition(90, 90)).toBe('flowing')
  })

  it('returns smooth for good metrics', () => {
    expect(classifyCondition(65, 65)).toBe('smooth')
    expect(classifyCondition(70, 80)).toBe('smooth')
  })

  it('returns steady for moderate flow', () => {
    expect(classifyCondition(45, 50)).toBe('steady')
  })

  it('returns clogging for low flow', () => {
    expect(classifyCondition(25, 30)).toBe('clogging')
  })

  it('returns jammed for very low flow', () => {
    expect(classifyCondition(10, 20)).toBe('jammed')
  })

  it('returns broken for near-zero flow', () => {
    expect(classifyCondition(0, 0)).toBe('broken')
    expect(classifyCondition(5, 10)).toBe('broken')
  })
})

// ─── classifyTimekeeperGrade ─────────────────────────────────────────────────

describe('classifyTimekeeperGrade', () => {
  it('returns precision-clock for >= 80', () => {
    expect(classifyTimekeeperGrade(80)).toBe('precision-clock')
    expect(classifyTimekeeperGrade(100)).toBe('precision-clock')
  })

  it('returns hourglass for 60-79', () => {
    expect(classifyTimekeeperGrade(60)).toBe('hourglass')
  })

  it('returns sundial for 40-59', () => {
    expect(classifyTimekeeperGrade(40)).toBe('sundial')
  })

  it('returns water-clock for 20-39', () => {
    expect(classifyTimekeeperGrade(20)).toBe('water-clock')
  })

  it('returns stopped-clock for < 20', () => {
    expect(classifyTimekeeperGrade(0)).toBe('stopped-clock')
    expect(classifyTimekeeperGrade(19)).toBe('stopped-clock')
  })
})

// ─── detectClogs ─────────────────────────────────────────────────────────────

describe('detectClogs', () => {
  it('returns no clogs for simple code', () => {
    const result = detectClogs('const x = 1\nexport function f() { return x }')
    expect(result.hasClogs).toBe(false)
    expect(result.clogPoints).toHaveLength(0)
  })

  it('detects deep nesting', () => {
    const code = 'function deep() {\nif (a) {\nif (b) {\nif (c) {\nif (d) {\n}}}}}'
    const result = detectClogs(code)
    expect(result.hasClogs).toBe(true)
    expect(result.clogPoints.some(p => p.includes('Deep nesting'))).toBe(true)
  })

  it('detects nested loops', () => {
    const code = 'for (let i = 0; i < n; i++) {\nfor (let j = 0; j < m; j++) {}}'
    const result = detectClogs(code)
    expect(result.hasClogs).toBe(true)
    expect(result.clogPoints.some(p => p.includes('Nested loops'))).toBe(true)
  })

  it('returns no clogs for empty content', () => {
    expect(detectClogs('').hasClogs).toBe(false)
  })
})

// ─── detectLeaks ─────────────────────────────────────────────────────────────

describe('detectLeaks', () => {
  it('returns no leaks for code with returns', () => {
    const result = detectLeaks('function f() { const x = 1; return x }')
    expect(result.hasLeaks).toBe(false)
  })

  it('detects missing returns', () => {
    const result = detectLeaks('function compute() { const x = 1 }')
    expect(result.hasLeaks).toBe(true)
    expect(result.leakPoints.some(p => p.includes('Missing return'))).toBe(true)
  })

  it('detects unhandled promises', () => {
    const result = detectLeaks('fetch(url).then(r => r.json())')
    expect(result.hasLeaks).toBe(true)
    expect(result.leakPoints.some(p => p.includes('Unhandled promise'))).toBe(true)
  })

  it('detects empty catch blocks', () => {
    const result = detectLeaks('try { fn() } catch(e) {}')
    expect(result.hasLeaks).toBe(true)
    expect(result.leakPoints.some(p => p.includes('Empty catch'))).toBe(true)
  })

  it('returns no leaks for empty content', () => {
    expect(detectLeaks('').hasLeaks).toBe(false)
  })
})

// ─── detectTurbulence ────────────────────────────────────────────────────────

describe('detectTurbulence', () => {
  it('returns no turbulence for clean code', () => {
    const result = detectTurbulence('export function f() { return 1 }')
    expect(result.hasTurbulence).toBe(false)
  })

  it('detects mixed sync/async', () => {
    const code = 'async function a() {\nconst x = fs.readFileSync("f")\nawait fetch(url)\n}'
    const result = detectTurbulence(code)
    expect(result.hasTurbulence).toBe(true)
    expect(result.turbulencePoints.some(p => p.includes('sync/async'))).toBe(true)
  })

  it('detects mixed declaration styles', () => {
    const code = 'var a = 1\nlet b = 2\nconst c = 3'
    const result = detectTurbulence(code)
    expect(result.hasTurbulence).toBe(true)
    expect(result.turbulencePoints.some(p => p.includes('declaration'))).toBe(true)
  })

  it('returns no turbulence for empty content', () => {
    expect(detectTurbulence('').hasTurbulence).toBe(false)
  })
})

// ─── detectPooling ───────────────────────────────────────────────────────────

describe('detectPooling', () => {
  it('returns no pooling for simple code', () => {
    const result = detectPooling('const arr = [1, 2, 3]')
    expect(result.hasPooling).toBe(false)
  })

  it('detects heavy array accumulation', () => {
    const pushes = Array(7).fill('arr.push(x)').join('\n')
    const result = detectPooling(pushes)
    expect(result.hasPooling).toBe(true)
    expect(result.poolingPoints.some(p => p.includes('accumulation'))).toBe(true)
  })

  it('detects unbounded loops', () => {
    const result = detectPooling('while (true) { process() }')
    expect(result.hasPooling).toBe(true)
    expect(result.poolingPoints.some(p => p.includes('unbounded'))).toBe(true)
  })

  it('returns no pooling for empty content', () => {
    expect(detectPooling('').hasPooling).toBe(false)
  })
})

// ─── analyzeGrainDistribution ────────────────────────────────────────────────

describe('analyzeGrainDistribution', () => {
  it('classifies dust for empty/comment lines', () => {
    const dist = analyzeGrainDistribution('\n// comment\n/* block */')
    expect(dist.dust).toBeGreaterThan(0)
  })

  it('classifies fine grains for declarations', () => {
    const dist = analyzeGrainDistribution('const myVariable = someValue')
    expect(dist.fineGrains).toBeGreaterThan(0)
  })

  it('classifies boulders for high complexity lines', () => {
    const dist = analyzeGrainDistribution('if (a && b || c ? d : e) { for (x; y; z) { switch(v) { } } }')
    expect(dist.boulders).toBeGreaterThan(0)
  })

  it('classifies medium grains for moderate complexity', () => {
    const dist = analyzeGrainDistribution('if (condition) { doSomething() }')
    expect(dist.mediumGrains).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const dist = analyzeGrainDistribution('')
    expect(dist.fineGrains + dist.dust).toBeGreaterThanOrEqual(0)
  })

  it('sums to total lines', () => {
    const content = 'const x = 1\nif (a) { }\n// comment\n'
    const dist = analyzeGrainDistribution(content)
    const total = dist.fineGrains + dist.mediumGrains + dist.coarseGrains + dist.boulders + dist.dust
    expect(total).toBe(content.split('\n').length)
  })
})

// ─── analyzeSandGrain ────────────────────────────────────────────────────────

describe('analyzeSandGrain', () => {
  it('returns a complete SandGrain object', () => {
    const grain = analyzeSandGrain('export function f() { return 1 }', 'f.ts')
    expect(grain.file).toBe('f.ts')
    expect(typeof grain.grainSize).toBe('number')
    expect(typeof grain.flowRate).toBe('number')
    expect(typeof grain.sandQuality).toBe('number')
    expect(typeof grain.grainCount).toBe('number')
    expect(typeof grain.avgGrainWeight).toBe('number')
    expect(typeof grain.qualityScore).toBe('number')
    expect(['silica', 'quartz', 'garnet', 'corundum', 'diamond', 'dust', 'mud']).toContain(grain.sandType)
    expect(['timer', 'measure', 'filter', 'buffer', 'valve', 'reservoir']).toContain(grain.hourglassRole)
    expect(['flowing', 'smooth', 'steady', 'clogging', 'jammed', 'broken']).toContain(grain.condition)
  })

  it('handles empty content gracefully', () => {
    const grain = analyzeSandGrain('', 'empty.ts')
    expect(grain.file).toBe('empty.ts')
    expect(grain.grainCount).toBe(0)
    expect(grain.grainSize).toBeGreaterThanOrEqual(0)
  })

  it('has flow analysis with correct shape', () => {
    const grain = analyzeSandGrain('const x = 1', 'a.ts')
    expect(typeof grain.flow.smoothness).toBe('number')
    expect(typeof grain.flow.hasClogs).toBe('boolean')
    expect(typeof grain.flow.hasLeaks).toBe('boolean')
    expect(typeof grain.flow.hasTurbulence).toBe('boolean')
    expect(typeof grain.flow.hasPooling).toBe('boolean')
    expect(Array.isArray(grain.flow.clogPoints)).toBe(true)
  })

  it('has neck analysis with correct shape', () => {
    const grain = analyzeSandGrain('const x = 1', 'a.ts')
    expect(typeof grain.neck.width).toBe('number')
    expect(typeof grain.neck.hasNarrowing).toBe('boolean')
    expect(typeof grain.neck.isChoked).toBe('boolean')
  })

  it('has chamber analysis with correct shape', () => {
    const grain = analyzeSandGrain('const x = 1', 'a.ts')
    expect(typeof grain.chamber.balance).toBe('number')
    expect(typeof grain.chamber.isTopHeavy).toBe('boolean')
    expect(typeof grain.chamber.isBottomHeavy).toBe('boolean')
    expect(typeof grain.chamber.isBalanced).toBe('boolean')
  })

  it('has time analysis with correct shape', () => {
    const grain = analyzeSandGrain('const x = 1', 'a.ts')
    expect(typeof grain.time.hasBlocking).toBe('boolean')
    expect(typeof grain.time.hasAsync).toBe('boolean')
    expect(typeof grain.time.timeUniformity).toBe('number')
  })

  it('detects async patterns', () => {
    const grain = analyzeSandGrain('async function f() { await Promise.resolve(1) }', 'a.ts')
    expect(grain.time.hasAsync).toBe(true)
  })

  it('detects blocking patterns', () => {
    const grain = analyzeSandGrain('const x = fs.readFileSync("f")', 'a.ts')
    expect(grain.time.hasBlocking).toBe(true)
  })

  it('computes grain distribution', () => {
    const grain = analyzeSandGrain('const x = 1\nif (a) { }\nexport function f() {}', 'a.ts')
    expect(grain.grainDistribution.fineGrains).toBeGreaterThanOrEqual(0)
    expect(grain.grainDistribution.mediumGrains).toBeGreaterThanOrEqual(0)
  })

  it('qualityScore is in range 0-100', () => {
    const grain = analyzeSandGrain('export function f() { return 1 }', 'a.ts')
    expect(grain.qualityScore).toBeGreaterThanOrEqual(0)
    expect(grain.qualityScore).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeSandLayer ────────────────────────────────────────────────────────

describe('analyzeSandLayer', () => {
  it('returns empty layer for no grains', () => {
    const layer = analyzeSandLayer([], 'empty')
    expect(layer.directory).toBe('empty')
    expect(layer.grains).toHaveLength(0)
    expect(layer.condition).toBe('jammed')
    expect(layer.layerQuality).toBe(0)
  })

  it('aggregates grain metrics', () => {
    const grains = [
      analyzeSandGrain('export function a() { return 1 }', 'a.ts'),
      analyzeSandGrain('export function b() { return 2 }', 'b.ts'),
    ]
    const layer = analyzeSandLayer(grains, 'src')
    expect(layer.directory).toBe('src')
    expect(layer.grains).toHaveLength(2)
    expect(typeof layer.avgGrainSize).toBe('number')
    expect(typeof layer.avgFlowRate).toBe('number')
  })

  it('counts clogs and leaks', () => {
    const grains = [analyzeSandGrain('const x = 1', 'a.ts')]
    const layer = analyzeSandLayer(grains, 'src')
    expect(typeof layer.clogCount).toBe('number')
    expect(typeof layer.leakCount).toBe('number')
  })

  it('has layer condition', () => {
    const grains = [analyzeSandGrain('export function a() { return 1 }', 'a.ts')]
    const layer = analyzeSandLayer(grains, 'src')
    expect(['flowing-freely', 'smooth-flow', 'steady', 'slow', 'clogged', 'jammed']).toContain(layer.condition)
  })

  it('determines dominant sand type', () => {
    const grains = [analyzeSandGrain('export function a() { return 1 }', 'a.ts')]
    const layer = analyzeSandLayer(grains, 'src')
    expect(typeof layer.sandType).toBe('string')
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends breaking boulders', () => {
    const stats = createTestStats({ boulders: 5 })
    const recs = generateRecommendations([], [], { totalClogs: 0, totalLeaks: 0, totalBoulders: 5 } as any, stats)
    expect(recs.some(r => r.includes('Boulders'))).toBe(true)
  })

  it('recommends fixing clogs', () => {
    const stats = createTestStats({ totalClogs: 3 })
    const recs = generateRecommendations([], [], { totalClogs: 3, totalLeaks: 0, totalBoulders: 0 } as any, stats)
    expect(recs.some(r => r.includes('Clogs'))).toBe(true)
  })

  it('recommends fixing leaks', () => {
    const stats = createTestStats({ totalLeaks: 2 })
    const recs = generateRecommendations([], [], { totalClogs: 0, totalLeaks: 2, totalBoulders: 0 } as any, stats)
    expect(recs.some(r => r.includes('Leaks'))).toBe(true)
  })

  it('recommends standardizing turbulence', () => {
    const stats = createTestStats({ totalTurbulence: 3 })
    const recs = generateRecommendations([], [], { totalClogs: 0, totalLeaks: 0, totalBoulders: 0 } as any, stats)
    expect(recs.some(r => r.includes('Turbulence'))).toBe(true)
  })

  it('praises good flow health', () => {
    const stats = createTestStats({ overallFlowHealth: 80, boulders: 0, totalClogs: 0, totalLeaks: 0, totalTurbulence: 0, totalPooling: 0, chokedFiles: 0, avgGrainSize: 50, avgNeckWidth: 60, fineGrains: 10, coarseGrains: 5 })
    const recs = generateRecommendations([], [], { totalClogs: 0, totalLeaks: 0, totalBoulders: 0 } as any, stats)
    expect(recs.some(r => r.includes('Good flow'))).toBe(true)
  })

  it('recommends widening narrow necks', () => {
    const stats = createTestStats({ avgNeckWidth: 30 })
    const recs = generateRecommendations([], [], { totalClogs: 0, totalLeaks: 0, totalBoulders: 0 } as any, stats)
    expect(recs.some(r => r.includes('Narrow necks'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const stats = createTestStats({ boulders: 3, totalClogs: 2, totalLeaks: 1, totalTurbulence: 1, totalPooling: 1, chokedFiles: 1, coarseGrains: 10, fineGrains: 5, avgGrainSize: 20 })
    const recs = generateRecommendations([], [], { totalClogs: 2, totalLeaks: 1, totalBoulders: 3 } as any, stats)
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

function createTestStats(overrides: Partial<HourglassGrainStats> = {}): HourglassGrainStats {
  return {
    totalFiles: 5,
    totalLayers: 1,
    avgGrainSize: 50,
    avgFlowRate: 50,
    avgSandQuality: 50,
    avgSmoothness: 50,
    avgNeckWidth: 50,
    avgChamberBalance: 50,
    fineGrains: 10,
    mediumGrains: 5,
    coarseGrains: 3,
    boulders: 0,
    dustGrains: 2,
    totalClogs: 0,
    totalLeaks: 0,
    totalTurbulence: 0,
    totalPooling: 0,
    chokedFiles: 0,
    balancedFiles: 3,
    topHeavyFiles: 1,
    bottomHeavyFiles: 1,
    overallFlowHealth: 50,
    timekeeperGrade: 'sundial',
    bestFlow: 'a.ts',
    worstFlow: 'b.ts',
    finestGrain: 'a.ts',
    coarsestGrain: 'b.ts',
    biggestBottleneck: 'b.ts',
    ...overrides,
  }
}

// ─── buildHourglassGrainResult ───────────────────────────────────────────────

describe('buildHourglassGrainResult', () => {
  it('returns a complete result', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(result.grains).toHaveLength(1)
    expect(result.layers).toBeDefined()
    expect(result.hourglass).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildHourglassGrainResult([], [], {})
    expect(result.grains).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestFlow).toBe('none')
    expect(result.stats.worstFlow).toBe('none')
    expect(result.stats.finestGrain).toBe('none')
    expect(result.stats.coarsestGrain).toBe('none')
    expect(result.stats.biggestBottleneck).toBe('none')
  })

  it('handles multiple files', () => {
    const result = buildHourglassGrainResult(
      ['a.ts', 'b.ts'],
      ['export function a() { return 1 }', 'export function b() { return 2 }'],
      {},
    )
    expect(result.grains).toHaveLength(2)
    expect(result.layers.length).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory', () => {
    const result = buildHourglassGrainResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.layers.length).toBe(2)
  })

  it('calculates hourglass structure', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() { return 1 }'], {})
    expect(typeof result.hourglass.totalSand).toBe('number')
    expect(typeof result.hourglass.flowHealth).toBe('number')
    expect(typeof result.hourglass.neckWidth).toBe('number')
  })

  it('tracks stats correctly', () => {
    const result = buildHourglassGrainResult(
      ['a.ts', 'b.ts'],
      ['export function a() { return 1 }', 'export function b() { return 2 }'],
      {},
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.avgGrainSize).toBe('number')
    expect(typeof result.stats.overallFlowHealth).toBe('number')
    expect(['precision-clock', 'hourglass', 'sundial', 'water-clock', 'stopped-clock']).toContain(result.stats.timekeeperGrade)
  })

  it('handles files with errors gracefully', () => {
    const result = buildHourglassGrainResult(['bad.ts'], [''], {})
    expect(result.grains).toHaveLength(1)
    expect(result.grains[0].file).toBe('bad.ts')
  })

  it('passes options through', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], { verbose: true })
    expect(result.grains).toHaveLength(1)
  })

  it('finds best and worst flow files', () => {
    const result = buildHourglassGrainResult(
      ['good.ts', 'bad.ts'],
      ['export interface I { x: number }\nexport function a(): I { return { x: 1 } }', ''],
      {},
    )
    expect(result.stats.bestFlow).toBeDefined()
    expect(result.stats.worstFlow).toBeDefined()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('formatHourglassGrainTable', () => {
  it('returns a string', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {})
    const table = formatHourglassGrainTable(result, false)
    expect(typeof table).toBe('string')
  })

  it('includes Sand Grains section', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {})
    expect(formatHourglassGrainTable(result, false)).toContain('Sand Grains')
  })

  it('includes Hourglass section', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {})
    expect(formatHourglassGrainTable(result, false)).toContain('Hourglass')
  })

  it('shows verbose details', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() { return 1 }'], {})
    const verbose = formatHourglassGrainTable(result, true)
    expect(verbose).toContain('role:')
    expect(verbose).toContain('neck:')
  })

  it('truncates non-verbose at 15 grains', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export function f() {}')
    const result = buildHourglassGrainResult(files, contents, {})
    expect(formatHourglassGrainTable(result, false)).toContain('more')
  })

  it('handles empty result', () => {
    const result = buildHourglassGrainResult([], [], {})
    expect(formatHourglassGrainTable(result, false)).toContain('No grains detected')
  })

  it('shows recommendations when present', () => {
    const result = buildHourglassGrainResult(['a.ts'], [''], {})
    const table = formatHourglassGrainTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })
})

describe('formatHourglassGrainJson', () => {
  it('returns valid JSON', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {})
    const json = formatHourglassGrainJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.grains).toBeDefined()
    expect(parsed.hourglass).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('pretty prints', () => {
    const result = buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {})
    expect(formatHourglassGrainJson(result)).toContain('\n')
  })
})
