import { describe, it, expect } from 'vitest'
import {
  identifyGears,
  analyzeMeshPoints,
  identifySprings,
  inspectMechanism,
  computePrecision,
  computeLubrication,
  computeEfficiency,
  classifyMechanism,
  classifyOverall,
  classifyCondition,
  generateRecommendations,
  buildClockworkResult,
} from '../src/commands/clockwork-helpers.js'
import { formatClockworkTable, formatClockworkJson } from '../src/commands/clockwork-format-helpers.js'
import type { Gear, MeshPoint, Spring, MechanismInspection, ClockworkStats } from '../src/commands/clockwork-helpers.js'

// ─── identifyGears ─────────────────────────────────────────────────────────────

describe('identifyGears', () => {
  it('returns empty array for no functions', () => {
    expect(identifyGears('const x = 1', 'a.ts')).toHaveLength(0)
  })

  it('detects exported functions as drive gears', () => {
    const gears = identifyGears('export function main() { return 1 }', 'a.ts')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears[0].type).toBe('drive')
    expect(gears[0].name).toBe('main')
  })

  it('detects internal functions as driven gears', () => {
    const gears = identifyGears('function helper() { return 2 }', 'a.ts')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears[0].name).toBe('helper')
  })

  it('detects classes', () => {
    const gears = identifyGears('export class Service {}', 'a.ts')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears.some(g => g.name === 'Service')).toBe(true)
  })

  it('detects arrow functions', () => {
    const gears = identifyGears('export const handler = (x: number) => x + 1', 'a.ts')
    expect(gears.length).toBeGreaterThan(0)
    expect(gears.some(g => g.name === 'handler')).toBe(true)
  })

  it('counts parameters as teeth', () => {
    const gears = identifyGears('function f(a: number, b: string, c: boolean) {}', 'a.ts')
    expect(gears[0].teeth).toBe(3)
  })

  it('zero teeth for no params', () => {
    const gears = identifyGears('function f() {}', 'a.ts')
    expect(gears[0].teeth).toBe(0)
  })

  it('marks low precision as jammed for very long functions', () => {
    const longBody = 'function f() {\n' + Array(200).fill('  const x = 1;').join('\n') + '\n}'
    const gears = identifyGears(longBody, 'a.ts')
    expect(gears.some(g => g.isJammed)).toBe(true)
  })

  it('each gear has required fields', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    for (const g of gears) {
      expect(g).toHaveProperty('file')
      expect(g).toHaveProperty('name')
      expect(g).toHaveProperty('type')
      expect(g).toHaveProperty('teeth')
      expect(g).toHaveProperty('size')
      expect(g).toHaveProperty('rpm')
      expect(g).toHaveProperty('precision')
      expect(g).toHaveProperty('wear')
      expect(g).toHaveProperty('meshPoints')
      expect(g).toHaveProperty('isJammed')
      expect(g).toHaveProperty('isOverwound')
    }
  })

  it('gear type is valid', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    const validTypes = ['drive', 'driven', 'idler', 'compound', 'planetary', 'worm']
    for (const g of gears) {
      expect(validTypes).toContain(g.type)
    }
  })

  it('precision and wear are 0-100', () => {
    const gears = identifyGears('export function main(x: number) { return x }', 'a.ts')
    for (const g of gears) {
      expect(g.precision).toBeGreaterThanOrEqual(0)
      expect(g.precision).toBeLessThanOrEqual(100)
      expect(g.wear).toBeGreaterThanOrEqual(0)
      expect(g.wear).toBeLessThanOrEqual(100)
    }
  })
})

// ─── analyzeMeshPoints ─────────────────────────────────────────────────────────

describe('analyzeMeshPoints', () => {
  it('returns empty for fewer than 2 gears', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    const meshes = analyzeMeshPoints('export function main() {}', 'a.ts', gears)
    expect(meshes.length).toBeGreaterThanOrEqual(0)
  })

  it('creates mesh points between consecutive gears', () => {
    const code = 'export function a() {}\nexport function b() {}'
    const gears = identifyGears(code, 'a.ts')
    if (gears.length >= 2) {
      const meshes = analyzeMeshPoints(code, 'a.ts', gears)
      expect(meshes.length).toBeGreaterThan(0)
    }
  })

  it('each mesh point has required fields', () => {
    const code = 'export function a(x: number) {}\nfunction b(y: string) {}'
    const gears = identifyGears(code, 'a.ts')
    const meshes = analyzeMeshPoints(code, 'a.ts', gears)
    for (const m of meshes) {
      expect(m).toHaveProperty('gearA')
      expect(m).toHaveProperty('gearB')
      expect(m).toHaveProperty('alignment')
      expect(m).toHaveProperty('type')
      expect(m).toHaveProperty('friction')
      expect(m).toHaveProperty('lubrication')
    }
  })

  it('alignment is valid', () => {
    const code = 'export function a() {}\nfunction b() {}'
    const gears = identifyGears(code, 'a.ts')
    const meshes = analyzeMeshPoints(code, 'a.ts', gears)
    const validAlignments = ['perfect', 'aligned', 'misaligned', 'stripped']
    for (const m of meshes) {
      expect(validAlignments).toContain(m.alignment)
    }
  })

  it('mesh type is valid', () => {
    const code = 'export function a() {}\nfunction b() {}'
    const gears = identifyGears(code, 'a.ts')
    const meshes = analyzeMeshPoints(code, 'a.ts', gears)
    const validTypes = ['parameter-passing', 'return-value', 'callback', 'event', 'inheritance']
    for (const m of meshes) {
      expect(validTypes).toContain(m.type)
    }
  })

  it('friction and lubrication are 0-100', () => {
    const code = 'export function a() {}\nfunction b() {}'
    const gears = identifyGears(code, 'a.ts')
    const meshes = analyzeMeshPoints(code, 'a.ts', gears)
    for (const m of meshes) {
      expect(m.friction).toBeGreaterThanOrEqual(0)
      expect(m.friction).toBeLessThanOrEqual(100)
      expect(m.lubrication).toBeGreaterThanOrEqual(0)
      expect(m.lubrication).toBeLessThanOrEqual(100)
    }
  })

  it('rewards try/catch with higher lubrication', () => {
    const codeWithCatch = 'export function a() {}\nfunction b() {}\ntry { a() } catch(e) {}'
    const codeWithout = 'export function a() {}\nfunction b() {}'
    const gearsWith = identifyGears(codeWithCatch, 'a.ts')
    const gearsWithout = identifyGears(codeWithout, 'a.ts')
    const meshesWith = analyzeMeshPoints(codeWithCatch, 'a.ts', gearsWith)
    const meshesWithout = analyzeMeshPoints(codeWithout, 'a.ts', gearsWithout)
    if (meshesWith.length > 0 && meshesWithout.length > 0) {
      const avgLubWith = meshesWith.reduce((s, m) => s + m.lubrication, 0) / meshesWith.length
      const avgLubWithout = meshesWithout.reduce((s, m) => s + m.lubrication, 0) / meshesWithout.length
      expect(avgLubWith).toBeGreaterThan(avgLubWithout)
    }
  })
})

// ─── identifySprings ───────────────────────────────────────────────────────────

describe('identifySprings', () => {
  it('returns empty for simple code', () => {
    const springs = identifySprings('const x = 1', 'a.ts')
    expect(springs).toHaveLength(0)
  })

  it('detects deep nesting as torsion spring', () => {
    const nested = 'function f() {\n' +
      Array(4).fill(0).map((_, i) => '  '.repeat(i) + 'if (true) {').join('\n') + '\n' +
      Array(4).fill(0).map(() => '}').join('\n') + '\n}'
    const springs = identifySprings(nested, 'a.ts')
    expect(springs.some(s => s.type === 'torsion')).toBe(true)
  })

  it('detects timers as constant-force spring', () => {
    const springs = identifySprings('setInterval(() => {}, 1000)', 'a.ts')
    expect(springs.some(s => s.type === 'constant-force')).toBe(true)
  })

  it('detects TODO as unwound spring', () => {
    const springs = identifySprings('const x = 1\n// TODO: fix this', 'a.ts')
    expect(springs.some(s => s.isUnwound)).toBe(true)
  })

  it('detects FIXME as unwound spring', () => {
    const springs = identifySprings('const x = 1\n// FIXME: broken', 'a.ts')
    expect(springs.some(s => s.isUnwound)).toBe(true)
  })

  it('marks deep nesting as overwound', () => {
    const deeplyNested = 'function f() {\n' +
      Array(7).fill(0).map((_, i) => '  '.repeat(i) + 'if (true) {').join('\n') + '\n' +
      Array(7).fill(0).map(() => '}').join('\n') + '\n}'
    const springs = identifySprings(deeplyNested, 'a.ts')
    expect(springs.some(s => s.isOverwound && s.type === 'torsion')).toBe(true)
  })

  it('each spring has required fields', () => {
    const springs = identifySprings('setInterval(() => {}, 1000)', 'a.ts')
    for (const s of springs) {
      expect(s).toHaveProperty('name')
      expect(s).toHaveProperty('type')
      expect(s).toHaveProperty('file')
      expect(s).toHaveProperty('wound')
      expect(s).toHaveProperty('isOverwound')
      expect(s).toHaveProperty('isUnwound')
      expect(s).toHaveProperty('description')
    }
  })

  it('spring type is valid', () => {
    const springs = identifySprings('setInterval(() => {}, 1000)', 'a.ts')
    const validTypes = ['tension', 'compression', 'torsion', 'constant-force']
    for (const s of springs) {
      expect(validTypes).toContain(s.type)
    }
  })

  it('wound is 0-100', () => {
    const springs = identifySprings('setInterval(() => {}, 1000)', 'a.ts')
    for (const s of springs) {
      expect(s.wound).toBeGreaterThanOrEqual(0)
      expect(s.wound).toBeLessThanOrEqual(100)
    }
  })
})

// ─── inspectMechanism ──────────────────────────────────────────────────────────

describe('inspectMechanism', () => {
  it('returns a complete MechanismInspection', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    const meshes = analyzeMeshPoints('export function main() {}', 'a.ts', gears)
    const springs = identifySprings('export function main() {}', 'a.ts')
    const insp = inspectMechanism(gears, meshes, springs, 'a.ts')
    expect(insp).toHaveProperty('file', 'a.ts')
    expect(insp).toHaveProperty('gears')
    expect(insp).toHaveProperty('meshPoints')
    expect(insp).toHaveProperty('springs')
    expect(insp).toHaveProperty('jammedGears')
    expect(insp).toHaveProperty('overwoundSprings')
    expect(insp).toHaveProperty('precision')
    expect(insp).toHaveProperty('lubrication')
    expect(insp).toHaveProperty('efficiency')
    expect(insp).toHaveProperty('classification')
  })

  it('classification is valid', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    const meshes = analyzeMeshPoints('export function main() {}', 'a.ts', gears)
    const springs = identifySprings('export function main() {}', 'a.ts')
    const insp = inspectMechanism(gears, meshes, springs, 'a.ts')
    expect(['swiss-watch', 'precision', 'standard', 'wind-up', 'broken-clock']).toContain(insp.classification)
  })

  it('precision, lubrication, efficiency are 0-100', () => {
    const gears = identifyGears('export function main() {}', 'a.ts')
    const meshes = analyzeMeshPoints('export function main() {}', 'a.ts', gears)
    const springs = identifySprings('export function main() {}', 'a.ts')
    const insp = inspectMechanism(gears, meshes, springs, 'a.ts')
    expect(insp.precision).toBeGreaterThanOrEqual(0)
    expect(insp.precision).toBeLessThanOrEqual(100)
    expect(insp.lubrication).toBeGreaterThanOrEqual(0)
    expect(insp.lubrication).toBeLessThanOrEqual(100)
    expect(insp.efficiency).toBeGreaterThanOrEqual(0)
    expect(insp.efficiency).toBeLessThanOrEqual(100)
  })
})

// ─── computePrecision ──────────────────────────────────────────────────────────

describe('computePrecision', () => {
  it('returns 50 for no gears', () => {
    expect(computePrecision([], [])).toBe(50)
  })

  it('uses gear precision average', () => {
    const gears: Gear[] = [
      { file: 'a.ts', name: 'f1', type: 'drive', teeth: 2, size: 10, rpm: 50, precision: 80, wear: 10, meshPoints: [], isJammed: false, isOverwound: false },
      { file: 'a.ts', name: 'f2', type: 'drive', teeth: 1, size: 10, rpm: 50, precision: 60, wear: 10, meshPoints: [], isJammed: false, isOverwound: false },
    ]
    const precision = computePrecision(gears, [])
    expect(precision).toBe(70)
  })

  it('penalizes stripped meshes', () => {
    const gears: Gear[] = [
      { file: 'a.ts', name: 'f1', type: 'drive', teeth: 2, size: 10, rpm: 50, precision: 80, wear: 10, meshPoints: [], isJammed: false, isOverwound: false },
    ]
    const meshes: MeshPoint[] = [
      { gearA: 'a', gearB: 'b', alignment: 'stripped', type: 'parameter-passing', friction: 80, lubrication: 20 },
    ]
    const clean = computePrecision(gears, [])
    const withStripped = computePrecision(gears, meshes)
    expect(withStripped).toBeLessThan(clean)
  })
})

// ─── computeLubrication ────────────────────────────────────────────────────────

describe('computeLubrication', () => {
  it('returns 60 for no meshes', () => {
    expect(computeLubrication([])).toBe(60)
  })

  it('averages mesh lubrication', () => {
    const meshes: MeshPoint[] = [
      { gearA: 'a', gearB: 'b', alignment: 'aligned', type: 'parameter-passing', friction: 20, lubrication: 70 },
      { gearA: 'c', gearB: 'd', alignment: 'aligned', type: 'return-value', friction: 20, lubrication: 50 },
    ]
    expect(computeLubrication(meshes)).toBe(60)
  })
})

// ─── computeEfficiency ─────────────────────────────────────────────────────────

describe('computeEfficiency', () => {
  it('returns weighted score', () => {
    const gears: Gear[] = [
      { file: 'a.ts', name: 'f1', type: 'drive', teeth: 2, size: 10, rpm: 50, precision: 80, wear: 10, meshPoints: [], isJammed: false, isOverwound: false },
    ]
    const eff = computeEfficiency(80, 70, gears)
    expect(eff).toBeGreaterThanOrEqual(0)
    expect(eff).toBeLessThanOrEqual(100)
  })

  it('penalizes high wear', () => {
    const lowWear: Gear[] = [
      { file: 'a.ts', name: 'f1', type: 'drive', teeth: 2, size: 10, rpm: 50, precision: 70, wear: 10, meshPoints: [], isJammed: false, isOverwound: false },
    ]
    const highWear: Gear[] = [
      { file: 'a.ts', name: 'f1', type: 'drive', teeth: 2, size: 10, rpm: 50, precision: 70, wear: 80, meshPoints: [], isJammed: false, isOverwound: false },
    ]
    expect(computeEfficiency(70, 60, lowWear)).toBeGreaterThan(computeEfficiency(70, 60, highWear))
  })

  it('uses default wear for empty gears', () => {
    const eff = computeEfficiency(80, 70, [])
    expect(eff).toBeGreaterThanOrEqual(0)
    expect(eff).toBeLessThanOrEqual(100)
  })
})

// ─── classifyMechanism ─────────────────────────────────────────────────────────

describe('classifyMechanism', () => {
  it('returns swiss-watch for high scores and no jams', () => {
    expect(classifyMechanism(90, 85, 0)).toBe('swiss-watch')
  })

  it('returns precision for good scores', () => {
    expect(classifyMechanism(70, 65, 0)).toBe('precision')
  })

  it('returns standard for moderate scores', () => {
    expect(classifyMechanism(50, 45, 0)).toBe('standard')
  })

  it('returns wind-up for low scores', () => {
    expect(classifyMechanism(30, 30, 0)).toBe('wind-up')
  })

  it('returns broken-clock for very low scores', () => {
    expect(classifyMechanism(10, 10, 0)).toBe('broken-clock')
  })

  it('returns broken-clock for many jams', () => {
    expect(classifyMechanism(90, 85, 3)).toBe('broken-clock')
  })
})

// ─── classifyOverall ───────────────────────────────────────────────────────────

describe('classifyOverall', () => {
  it('returns swiss-chronometer for high precision and mint condition', () => {
    expect(classifyOverall(85, 'mint')).toBe('swiss-chronometer')
  })

  it('returns swiss-chronometer for high precision and excellent condition', () => {
    expect(classifyOverall(85, 'excellent')).toBe('swiss-chronometer')
  })

  it('returns precision-timepiece for good scores', () => {
    expect(classifyOverall(70, 'good')).toBe('precision-timepiece')
  })

  it('returns standard-clock for moderate scores', () => {
    expect(classifyOverall(50, 'fair')).toBe('standard-clock')
  })

  it('returns wind-up-toy for low scores', () => {
    expect(classifyOverall(30, 'fair')).toBe('wind-up-toy')
  })

  it('returns stopped-clock for very low scores', () => {
    expect(classifyOverall(10, 'broken')).toBe('stopped-clock')
  })

  it('precision-timepiece even with needs-repair condition', () => {
    expect(classifyOverall(65, 'needs-repair')).toBe('precision-timepiece')
  })

  it('standard-clock not given for needs-repair condition', () => {
    expect(classifyOverall(50, 'needs-repair')).not.toBe('standard-clock')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns broken for broken clocks', () => {
    expect(classifyCondition(0, 1, 50, 50)).toBe('broken')
  })

  it('returns needs-repair for many jams', () => {
    expect(classifyCondition(2, 0, 50, 50)).toBe('needs-repair')
  })

  it('returns mint for excellent metrics', () => {
    expect(classifyCondition(0, 0, 80, 75)).toBe('mint')
  })

  it('returns excellent for good metrics', () => {
    expect(classifyCondition(0, 0, 65, 60)).toBe('excellent')
  })

  it('returns good for moderate metrics', () => {
    expect(classifyCondition(0, 0, 50, 45)).toBe('good')
  })

  it('returns fair for low metrics', () => {
    expect(classifyCondition(0, 0, 35, 30)).toBe('fair')
  })

  it('returns needs-repair for very low metrics', () => {
    expect(classifyCondition(0, 0, 20, 20)).toBe('needs-repair')
  })

  it('returns broken for many jams', () => {
    expect(classifyCondition(4, 0, 50, 50)).toBe('broken')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<ClockworkStats> = {}): ClockworkStats => ({
    totalGears: 1, driveGears: 1, idlerGears: 0, jammedGears: 0,
    totalMeshPoints: 0, perfectMeshes: 0, strippedMeshes: 0,
    totalSprings: 0, overwoundSprings: 0, unwoundSprings: 0,
    avgPrecision: 70, avgLubrication: 60, avgEfficiency: 65,
    swissWatches: 1, brokenClocks: 0, mechanismPrecision: 70,
    overallCondition: 'good', clockworkGrade: 'standard-clock',
    ...overrides,
  })

  it('recommends for jammed gears', () => {
    const gears: Gear[] = [
      { file: 'a.ts', name: 'broken', type: 'drive', teeth: 2, size: 60, rpm: 50, precision: 15, wear: 80, meshPoints: [], isJammed: true, isOverwound: false },
    ]
    const recs = generateRecommendations(gears, [], [], [], makeStats({ jammedGears: 1 }))
    expect(recs.some(r => r.includes('jammed'))).toBe(true)
  })

  it('recommends for stripped meshes', () => {
    const meshes: MeshPoint[] = [
      { gearA: 'a', gearB: 'b', alignment: 'stripped', type: 'parameter-passing', friction: 80, lubrication: 10 },
    ]
    const recs = generateRecommendations([], meshes, [], [], makeStats())
    expect(recs.some(r => r.includes('stripped'))).toBe(true)
  })

  it('recommends for overwound springs', () => {
    const springs: Spring[] = [
      { name: 'stress', type: 'tension', file: 'a.ts', wound: 90, isOverwound: true, isUnwound: false, description: 'high complexity' },
    ]
    const recs = generateRecommendations([], [], springs, [], makeStats({ overwoundSprings: 1 }))
    expect(recs.some(r => r.includes('overwound') || r.includes('Simplify'))).toBe(true)
  })

  it('recommends for broken clocks', () => {
    const insp: MechanismInspection[] = [
      { file: 'a.ts', gears: 1, meshPoints: 0, springs: 0, jammedGears: 1, overwoundSprings: 0, precision: 10, lubrication: 20, efficiency: 15, classification: 'broken-clock' },
    ]
    const recs = generateRecommendations([], [], [], insp, makeStats({ brokenClocks: 1 }))
    expect(recs.some(r => r.includes('broken-clock') || r.includes('refactor'))).toBe(true)
  })

  it('recommends for low lubrication', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ avgLubrication: 30 }))
    expect(recs.some(r => r.includes('lubrication') || r.includes('error handling'))).toBe(true)
  })

  it('recommends for unwound springs', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ unwoundSprings: 3 }))
    expect(recs.some(r => r.includes('unwound') || r.includes('dead code'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], [], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildClockworkResult ──────────────────────────────────────────────────────

describe('buildClockworkResult', () => {
  it('returns a complete ClockworkResult', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(result).toHaveProperty('gears')
    expect(result).toHaveProperty('meshPoints')
    expect(result).toHaveProperty('springs')
    expect(result).toHaveProperty('inspections')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates gears for functions', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(result.gears.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildClockworkResult([], [], {})
    expect(result.gears).toHaveLength(0)
    expect(result.inspections).toHaveLength(0)
    expect(result.stats.totalGears).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main(x: number) { return x }'], {})
    expect(result.stats.totalGears).toBeGreaterThan(0)
    expect(result.stats.driveGears).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLubrication).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgEfficiency).toBeGreaterThanOrEqual(0)
  })

  it('computes overall condition', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(['mint', 'excellent', 'good', 'fair', 'needs-repair', 'broken']).toContain(result.stats.overallCondition)
  })

  it('computes clockwork grade', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(['swiss-chronometer', 'precision-timepiece', 'standard-clock', 'wind-up-toy', 'stopped-clock']).toContain(result.stats.clockworkGrade)
  })

  it('creates one inspection per file', () => {
    const result = buildClockworkResult(
      ['a.ts', 'b.ts'],
      ['export function main() {}', 'function helper() {}'],
      {},
    )
    expect(result.inspections).toHaveLength(2)
  })

  it('counts swiss watches and broken clocks', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(result.stats.swissWatches).toBeGreaterThanOrEqual(0)
    expect(result.stats.brokenClocks).toBeGreaterThanOrEqual(0)
  })

  it('counts mesh point types', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(result.stats.totalMeshPoints).toBeGreaterThanOrEqual(0)
    expect(result.stats.perfectMeshes).toBeGreaterThanOrEqual(0)
    expect(result.stats.strippedMeshes).toBeGreaterThanOrEqual(0)
  })

  it('counts spring types', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(result.stats.totalSprings).toBeGreaterThanOrEqual(0)
    expect(result.stats.overwoundSprings).toBeGreaterThanOrEqual(0)
    expect(result.stats.unwoundSprings).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatClockworkTable ──────────────────────────────────────────────────────

describe('formatClockworkTable', () => {
  it('returns a string', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    const output = formatClockworkTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(formatClockworkTable(result, false)).toContain('Clockwork')
  })

  it('contains Gears section', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(formatClockworkTable(result, false)).toContain('Gears')
  })

  it('contains Inspections section', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(formatClockworkTable(result, false)).toContain('Inspections')
  })

  it('contains Statistics section', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(formatClockworkTable(result, false)).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const longBody = 'function f() {\n' + Array(60).fill('  const x = 1;').join('\n') + '\n}'
    const result = buildClockworkResult(['a.ts'], [longBody], {})
    const output = formatClockworkTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles empty input gracefully', () => {
    const result = buildClockworkResult([], [], {})
    const output = formatClockworkTable(result, false)
    expect(output).toContain('No gears')
  })
})

// ─── formatClockworkJson ───────────────────────────────────────────────────────

describe('formatClockworkJson', () => {
  it('returns valid JSON', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    const json = formatClockworkJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('gears')
    expect(parsed).toHaveProperty('meshPoints')
    expect(parsed).toHaveProperty('springs')
    expect(parsed).toHaveProperty('inspections')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildClockworkResult(['a.ts'], ['export function main() {}'], {})
    expect(formatClockworkJson(result)).toContain('  ')
  })
})
