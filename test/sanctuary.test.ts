import { describe, expect, it } from 'vitest'

import {
  analyzeSafetyZone,
  buildSanctuaryResult,
  classifyOverallSafety,
  computeProtectionRatio,
  computeSanctuaryIndex,
  computeThreatDensity,
  detectProtections,
  detectThreats,
  findEndangeredPatterns,
  generateRecommendations,
  type EndangeredPattern,
  type Protection,
  type SafetyZone,
  type SanctuaryOptions,
  type SanctuaryStats,
  type Threat,
} from '../src/commands/sanctuary-helpers.js'

import {
  formatEndangeredPatterns,
  formatProtections,
  formatRecommendations,
  formatSafetyGauge,
  formatSafetyLabel,
  formatSanctuaryJson,
  formatSanctuaryStats,
  formatSanctuaryTable,
  formatSeverityLabel,
  formatThreats,
  formatZoneLabel,
  formatZones,
} from '../src/commands/sanctuary-format-helpers.js'

// ─── detectProtections ──────────────────────────────────────────────────────────

describe('detectProtections', () => {
  it('returns empty for empty content', () => {
    expect(detectProtections('')).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(detectProtections('   \n\t  ')).toEqual([])
  })

  it('detects typeof type guards', () => {
    const protections = detectProtections('if (typeof x === "string") { }')
    const typeGuards = protections.filter(p => p.type === 'type-guard' && p.description === 'typeof check')
    expect(typeGuards.length).toBeGreaterThanOrEqual(1)
    expect(typeGuards[0].strength).toBe('moderate')
  })

  it('detects instanceof checks', () => {
    const protections = detectProtections('if (x instanceof Error) { }')
    const inst = protections.filter(p => p.description === 'instanceof check')
    expect(inst.length).toBeGreaterThanOrEqual(1)
    expect(inst[0].strength).toBe('strong')
  })

  it('detects try-catch blocks', () => {
    const protections = detectProtections('try {\n  foo();\n} catch(e) { }')
    const tc = protections.filter(p => p.type === 'try-catch')
    expect(tc.length).toBeGreaterThanOrEqual(1)
  })

  it('detects catch handlers', () => {
    const protections = detectProtections('try {\n  foo();\n} catch(e) { }')
    const ch = protections.filter(p => p.type === 'error-boundary')
    expect(ch.length).toBeGreaterThanOrEqual(1)
  })

  it('detects promise .catch', () => {
    const protections = detectProtections('fetch(url).catch(e => log(e))')
    const pc = protections.filter(p => p.description === 'promise catch')
    expect(pc.length).toBeGreaterThanOrEqual(1)
  })

  it('detects null checks', () => {
    const protections = detectProtections('if (x !== null) { }')
    const nc = protections.filter(p => p.type === 'null-check')
    expect(nc.length).toBeGreaterThanOrEqual(1)
  })

  it('detects undefined checks', () => {
    const protections = detectProtections('if (x !== undefined) { }')
    const nc = protections.filter(p => p.type === 'null-check')
    expect(nc.length).toBeGreaterThanOrEqual(1)
  })

  it('detects optional chaining', () => {
    const protections = detectProtections('const y = x?.prop')
    const oc = protections.filter(p => p.description === 'optional chaining')
    expect(oc.length).toBeGreaterThanOrEqual(1)
    expect(oc[0].strength).toBe('basic')
  })

  it('detects nullish coalescing', () => {
    const protections = detectProtections('const y = x ?? "default"')
    const nc = protections.filter(p => p.type === 'default-value')
    expect(nc.length).toBeGreaterThanOrEqual(1)
  })

  it('detects assertions', () => {
    const protections = detectProtections('console.assert(x > 0)')
    const as = protections.filter(p => p.type === 'assertion')
    expect(as.length).toBeGreaterThanOrEqual(1)
    expect(as[0].strength).toBe('strong')
  })

  it('sets location as line number', () => {
    const content = 'line1\nline2\nif (typeof x === "string") {}'
    const protections = detectProtections(content)
    expect(protections.some(p => p.location === 3)).toBe(true)
  })

  it('detects multiple protection types', () => {
    const content = 'if (typeof x === "string") {\n  try { foo(); } catch(e) { }\n  const y = x ?? "default"\n}'
    const protections = detectProtections(content)
    const types = Array.from(new Set(protections.map(p => p.type)))
    expect(types.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── detectThreats ──────────────────────────────────────────────────────────────

describe('detectThreats', () => {
  it('returns empty for empty content', () => {
    expect(detectThreats('')).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(detectThreats('   ')).toEqual([])
  })

  it('detects explicit any type', () => {
    const threats = detectThreats('const x: any = 1')
    const anyT = threats.filter(t => t.type === 'implicit-any')
    expect(anyT.length).toBeGreaterThanOrEqual(1)
    expect(anyT[0].severity).toBe('high')
  })

  it('detects as any cast', () => {
    const threats = detectThreats('const x = foo as any')
    const cast = threats.filter(t => t.type === 'untyped')
    expect(cast.length).toBeGreaterThanOrEqual(1)
    expect(cast[0].severity).toBe('high')
  })

  it('detects global mutation', () => {
    const threats = detectThreats('globalThis.config = {}')
    const gm = threats.filter(t => t.type === 'side-effect')
    expect(gm.length).toBeGreaterThanOrEqual(1)
    expect(gm[0].severity).toBe('medium')
  })

  it('detects window mutation', () => {
    const threats = detectThreats('window.myVar = 1')
    const wm = threats.filter(t => t.type === 'side-effect')
    expect(wm.length).toBeGreaterThanOrEqual(1)
  })

  it('detects unvalidated env variable', () => {
    const threats = detectThreats('const port = process.env.PORT')
    const env = threats.filter(t => t.type === 'unvalidated-input')
    expect(env.length).toBeGreaterThanOrEqual(1)
  })

  it('does not flag validated env variable', () => {
    const threats = detectThreats('const port = process.env.PORT ?? "3000"')
    const env = threats.filter(t => t.type === 'unvalidated-input')
    expect(env.length).toBe(0)
  })

  it('detects JSON.parse without try-catch', () => {
    const threats = detectThreats('const data = JSON.parse(str)')
    const jp = threats.filter(t => t.type === 'uncaught-exception')
    expect(jp.length).toBeGreaterThanOrEqual(1)
    expect(jp[0].severity).toBe('high')
  })

  it('does not flag JSON.parse with try-catch on same line', () => {
    const threats = detectThreats('try { const data = JSON.parse(str) } catch(e) {}')
    const jp = threats.filter(t => t.type === 'uncaught-exception')
    expect(jp.length).toBe(0)
  })

  it('detects parseInt without radix', () => {
    const threats = detectThreats('const n = parseInt(str)')
    const pi = threats.filter(t => t.description === 'parseInt without radix')
    expect(pi.length).toBeGreaterThanOrEqual(1)
  })

  it('detects delete operation', () => {
    const threats = detectThreats('delete obj.prop')
    const del = threats.filter(t => t.type === 'mutation')
    expect(del.length).toBeGreaterThanOrEqual(1)
  })

  it('detects array sort mutation', () => {
    const threats = detectThreats('arr.sort()')
    const sort = threats.filter(t => t.description.includes('sort'))
    expect(sort.length).toBeGreaterThanOrEqual(1)
  })

  it('detects array splice mutation', () => {
    const threats = detectThreats('arr.splice(0, 1)')
    const splice = threats.filter(t => t.description.includes('splice'))
    expect(splice.length).toBeGreaterThanOrEqual(1)
  })

  it('includes mitigation for each threat', () => {
    const threats = detectThreats('const x: any = 1')
    expect(threats.every(t => t.mitigation.length > 0)).toBe(true)
  })

  it('sets location as line number', () => {
    const threats = detectThreats('line1\nconst x: any = 1')
    expect(threats.some(t => t.location === 2)).toBe(true)
  })
})

// ─── analyzeSafetyZone ──────────────────────────────────────────────────────────

describe('analyzeSafetyZone', () => {
  it('returns sanctuary for empty content', () => {
    const zone = analyzeSafetyZone('', 'a.ts')
    expect(zone.classification).toBe('sanctuary')
    expect(zone.safetyScore).toBe(100)
    expect(zone.typeSafety).toBe(100)
  })

  it('classifies well-typed code as sanctuary or protected', () => {
    const zone = analyzeSafetyZone('function foo(x: string): number { return x.length; }', 'a.ts')
    expect(['sanctuary', 'protected']).toContain(zone.classification)
    expect(zone.typeSafety).toBe(100)
  })

  it('classifies dangerous code appropriately', () => {
    const zone = analyzeSafetyZone('const x: any = 1; const y: any = 2; globalThis.z = 3', 'a.ts')
    expect(zone.classification).toBeOneOf(['wild', 'danger', 'natural'])
    expect(zone.threats.length).toBeGreaterThan(0)
  })

  it('computes type safety from typed vs any declarations', () => {
    const zone = analyzeSafetyZone('const x: string = "a"; const y: number = 1;', 'a.ts')
    expect(zone.typeSafety).toBe(100)
  })

  it('lowers type safety for any usage', () => {
    const zone = analyzeSafetyZone('const x: any = 1; const y: string = "a"', 'a.ts')
    expect(zone.typeSafety).toBeLessThan(100)
  })

  it('counts error boundaries', () => {
    const zone = analyzeSafetyZone('try { foo(); } catch(e) {}', 'a.ts')
    expect(zone.errorBoundaries).toBeGreaterThanOrEqual(1)
  })

  it('sets file path', () => {
    const zone = analyzeSafetyZone('const x = 1', 'my/file.ts')
    expect(zone.file).toBe('my/file.ts')
  })

  it('clamps safety score to 0-100', () => {
    const zone = analyzeSafetyZone('const x: any = 1; const y: any = 2; const z: any = 3', 'a.ts')
    expect(zone.safetyScore).toBeGreaterThanOrEqual(0)
    expect(zone.safetyScore).toBeLessThanOrEqual(100)
  })
})

// ─── findEndangeredPatterns ─────────────────────────────────────────────────────

describe('findEndangeredPatterns', () => {
  it('returns empty for no files', () => {
    expect(findEndangeredPatterns([], [], [])).toEqual([])
  })

  it('detects JSON.parse pattern', () => {
    const zones = [analyzeSafetyZone('JSON.parse(str)', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['JSON.parse(str)'])
    expect(patterns.some(p => p.pattern === 'JSON.parse')).toBe(true)
  })

  it('detects eval pattern', () => {
    const zones = [analyzeSafetyZone('eval(code)', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['eval(code)'])
    expect(patterns.some(p => p.pattern === 'eval')).toBe(true)
  })

  it('detects global mutation pattern', () => {
    const zones = [analyzeSafetyZone('globalThis.x = 1', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['globalThis.x = 1'])
    expect(patterns.some(p => p.pattern === 'global-mutation')).toBe(true)
  })

  it('detects any-type pattern', () => {
    const zones = [analyzeSafetyZone('const x: any = 1', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['const x: any = 1'])
    expect(patterns.some(p => p.pattern === 'any-type')).toBe(true)
  })

  it('marks protected patterns when try-catch present', () => {
    const zones = [analyzeSafetyZone('try { JSON.parse(x) } catch(e) {}', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['try { JSON.parse(x) } catch(e) {}'])
    const jp = patterns.find(p => p.pattern === 'JSON.parse')
    expect(jp?.hasProtection).toBe(true)
    expect(jp?.protectionType).toBe('try-catch')
  })

  it('assigns higher risk for unprotected multi-file patterns', () => {
    const zones = [
      analyzeSafetyZone('JSON.parse(a)', 'a.ts'),
      analyzeSafetyZone('JSON.parse(b)', 'b.ts'),
      analyzeSafetyZone('JSON.parse(c)', 'c.ts'),
    ]
    const patterns = findEndangeredPatterns(zones, ['a.ts', 'b.ts', 'c.ts'], ['JSON.parse(a)', 'JSON.parse(b)', 'JSON.parse(c)'])
    const jp = patterns.find(p => p.pattern === 'JSON.parse')
    expect(jp?.riskLevel).toBe('critical')
  })

  it('assigns vulnerable for single unprotected file', () => {
    const zones = [analyzeSafetyZone('JSON.parse(x)', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['JSON.parse(x)'])
    const jp = patterns.find(p => p.pattern === 'JSON.parse')
    expect(jp?.riskLevel).toBe('vulnerable')
  })

  it('includes recommendation for each pattern', () => {
    const zones = [analyzeSafetyZone('JSON.parse(x)', 'a.ts')]
    const patterns = findEndangeredPatterns(zones, ['a.ts'], ['JSON.parse(x)'])
    expect(patterns.every(p => p.recommendation.length > 0)).toBe(true)
  })
})

// ─── computeSanctuaryIndex ──────────────────────────────────────────────────────

describe('computeSanctuaryIndex', () => {
  it('returns 100 for no zones', () => {
    expect(computeSanctuaryIndex([])).toBe(100)
  })

  it('returns high for sanctuary zones', () => {
    const zones: SafetyZone[] = [{
      file: 'a.ts', classification: 'sanctuary', safetyScore: 95,
      protections: [], threats: [], typeSafety: 100,
      errorBoundaries: 0, validationCoverage: 100, defensiveScore: 90,
    }]
    expect(computeSanctuaryIndex(zones)).toBeGreaterThanOrEqual(80)
  })

  it('returns lower for danger zones', () => {
    const zones: SafetyZone[] = [{
      file: 'a.ts', classification: 'danger', safetyScore: 10,
      protections: [], threats: [], typeSafety: 20,
      errorBoundaries: 0, validationCoverage: 10, defensiveScore: 0,
    }]
    expect(computeSanctuaryIndex(zones)).toBeLessThan(30)
  })

  it('factors in all three components', () => {
    const high: SafetyZone[] = [{
      file: 'a.ts', classification: 'sanctuary', safetyScore: 100,
      protections: [], threats: [], typeSafety: 100,
      errorBoundaries: 0, validationCoverage: 100, defensiveScore: 100,
    }]
    const low: SafetyZone[] = [{
      file: 'a.ts', classification: 'danger', safetyScore: 0,
      protections: [], threats: [], typeSafety: 0,
      errorBoundaries: 0, validationCoverage: 0, defensiveScore: 0,
    }]
    expect(computeSanctuaryIndex(high)).toBeGreaterThan(computeSanctuaryIndex(low))
  })
})

// ─── computeThreatDensity ───────────────────────────────────────────────────────

describe('computeThreatDensity', () => {
  it('returns 0 for zero lines', () => {
    expect(computeThreatDensity(10, 0)).toBe(0)
  })

  it('computes threats per 100 lines', () => {
    expect(computeThreatDensity(5, 250)).toBe(2)
  })

  it('returns 0 for zero threats', () => {
    expect(computeThreatDensity(0, 100)).toBe(0)
  })
})

// ─── computeProtectionRatio ─────────────────────────────────────────────────────

describe('computeProtectionRatio', () => {
  it('returns 1 when no threats and no protections', () => {
    expect(computeProtectionRatio(0, 0)).toBe(1)
  })

  it('returns protection count when no threats', () => {
    expect(computeProtectionRatio(5, 0)).toBe(5)
  })

  it('computes ratio', () => {
    expect(computeProtectionRatio(20, 10)).toBe(2)
  })

  it('returns less than 1 when more threats than protections', () => {
    expect(computeProtectionRatio(3, 10)).toBe(0.3)
  })
})

// ─── classifyOverallSafety ──────────────────────────────────────────────────────

describe('classifyOverallSafety', () => {
  it('returns fortress for high index and ratio', () => {
    expect(classifyOverallSafety(90, 3)).toBe('fortress')
  })

  it('returns secure for good index and ratio', () => {
    expect(classifyOverallSafety(70, 1.5)).toBe('secure')
  })

  it('returns guarded for moderate index', () => {
    expect(classifyOverallSafety(50, 0.5)).toBe('guarded')
  })

  it('returns exposed for low index', () => {
    expect(classifyOverallSafety(25, 0.3)).toBe('exposed')
  })

  it('returns dangerous for very low index', () => {
    expect(classifyOverallSafety(10, 0.1)).toBe('dangerous')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<SanctuaryStats> = {}): SanctuaryStats => ({
    totalZones: 5, sanctuaryZones: 3, protectedZones: 1, wildZones: 1, dangerZones: 0,
    totalProtections: 10, totalThreats: 3, criticalThreats: 0,
    avgSafetyScore: 75, avgTypeSafety: 80, avgValidationCoverage: 70, avgDefensiveScore: 65,
    endangeredCount: 0, criticalCount: 0,
    overallSafety: 'secure', sanctuaryIndex: 75, threatDensity: 1, protectionRatio: 3,
    ...overrides,
  })

  it('recommends fixing danger zones', () => {
    const zones: SafetyZone[] = [{
      file: 'a.ts', classification: 'danger', safetyScore: 10,
      protections: [], threats: [], typeSafety: 10,
      errorBoundaries: 0, validationCoverage: 0, defensiveScore: 0,
    }]
    const recs = generateRecommendations(zones, [], 0, makeStats())
    expect(recs.some(r => r.includes('danger/wild'))).toBe(true)
  })

  it('recommends fixing critical threats', () => {
    const recs = generateRecommendations([], [], 5, makeStats({ criticalThreats: 3 }))
    expect(recs.some(r => r.includes('critical threat'))).toBe(true)
  })

  it('recommends protecting endangered patterns', () => {
    const endangered: EndangeredPattern[] = [
      { pattern: 'JSON.parse', files: ['a.ts'], riskLevel: 'endangered', hasProtection: false, protectionType: null, recommendation: 'Wrap in try-catch' },
    ]
    const recs = generateRecommendations([], endangered, 0, makeStats())
    expect(recs.some(r => r.includes('JSON.parse'))).toBe(true)
  })

  it('recommends increasing protection ratio when low', () => {
    const recs = generateRecommendations([], [], 5, makeStats({ protectionRatio: 0.5 }))
    expect(recs.some(r => r.includes('protection ratio'))).toBe(true)
  })

  it('recommends improving overall safety when poor', () => {
    const recs = generateRecommendations([], [], 5, makeStats({ overallSafety: 'exposed' }))
    expect(recs.some(r => r.includes('safety is poor') || r.includes('baseline'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateRecommendations(
      [{ file: 'a.ts', classification: 'sanctuary', safetyScore: 95, protections: [], threats: [], typeSafety: 100, errorBoundaries: 1, validationCoverage: 100, defensiveScore: 90 }],
      [], 0, makeStats({ protectionRatio: 5, criticalThreats: 0 }),
    )
    expect(recs.length).toBe(0)
  })

  it('deduplicates recommendations', () => {
    const zones: SafetyZone[] = [
      { file: 'a.ts', classification: 'wild', safetyScore: 15, protections: [], threats: [], typeSafety: 20, errorBoundaries: 0, validationCoverage: 10, defensiveScore: 0 },
      { file: 'b.ts', classification: 'danger', safetyScore: 10, protections: [], threats: [], typeSafety: 10, errorBoundaries: 0, validationCoverage: 5, defensiveScore: 0 },
    ]
    const recs = generateRecommendations(zones, [], 0, makeStats())
    const dangerRecs = recs.filter(r => r.includes('danger/wild'))
    expect(dangerRecs.length).toBe(1)
  })
})

// ─── buildSanctuaryResult ───────────────────────────────────────────────────────

describe('buildSanctuaryResult', () => {
  const opts: SanctuaryOptions = {}

  it('returns empty result for no files', () => {
    const result = buildSanctuaryResult([], [], opts)
    expect(result.zones).toEqual([])
    expect(result.stats.totalZones).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('returns fortress for empty files', () => {
    const result = buildSanctuaryResult([], [], opts)
    expect(result.stats.overallSafety).toBe('fortress')
    expect(result.stats.sanctuaryIndex).toBe(100)
  })

  it('builds zones for each file', () => {
    const result = buildSanctuaryResult(
      ['a.ts', 'b.ts'],
      ['const x: string = "a"', 'const y: number = 1'],
      opts,
    )
    expect(result.zones.length).toBe(2)
  })

  it('detects endangered patterns', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: any = 1; JSON.parse(str)'],
      opts,
    )
    expect(result.endangeredPatterns.length).toBeGreaterThanOrEqual(1)
  })

  it('computes stats correctly', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: string = "a"'],
      opts,
    )
    expect(result.stats.totalZones).toBe(1)
    expect(typeof result.stats.avgSafetyScore).toBe('number')
    expect(typeof result.stats.avgTypeSafety).toBe('number')
  })

  it('classifies overall safety', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: string = "a"'],
      opts,
    )
    expect(['fortress', 'secure', 'guarded', 'exposed', 'dangerous']).toContain(result.stats.overallSafety)
  })

  it('computes sanctuary index', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: string = "a"'],
      opts,
    )
    expect(result.stats.sanctuaryIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.sanctuaryIndex).toBeLessThanOrEqual(100)
  })

  it('computes threat density', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(typeof result.stats.threatDensity).toBe('number')
  })

  it('computes protection ratio', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: string = "a"'],
      opts,
    )
    expect(typeof result.stats.protectionRatio).toBe('number')
  })

  it('generates recommendations', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty content files', () => {
    const result = buildSanctuaryResult(['a.ts'], [''], opts)
    expect(result.zones.length).toBe(1)
    expect(result.zones[0].classification).toBe('sanctuary')
  })

  it('counts zone classifications', () => {
    const result = buildSanctuaryResult(
      ['safe.ts', 'risky.ts'],
      ['const x: string = "a"', 'const y: any = 1; globalThis.z = 2'],
      opts,
    )
    expect(result.stats.sanctuaryZones + result.stats.protectedZones + result.stats.wildZones + result.stats.dangerZones).toBeLessThanOrEqual(result.stats.totalZones)
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────────

describe('format helpers', () => {
  const makeResult = (): ReturnType<typeof buildSanctuaryResult> => buildSanctuaryResult(
    ['a.ts'],
    ['const x: string = "a"; try { foo(); } catch(e) {}'],
    {},
  )

  describe('formatZoneLabel', () => {
    it('returns colored label for each classification', () => {
      const levels: Array<import('../src/commands/sanctuary-helpers.js').ZoneClassification> = ['sanctuary', 'protected', 'natural', 'wild', 'danger']
      for (const level of levels) {
        expect(formatZoneLabel(level)).toContain(level)
      }
    })
  })

  describe('formatSafetyLabel', () => {
    it('returns colored label for each safety level', () => {
      const levels: Array<import('../src/commands/sanctuary-helpers.js').OverallSafety> = ['fortress', 'secure', 'guarded', 'exposed', 'dangerous']
      for (const level of levels) {
        expect(formatSafetyLabel(level)).toContain(level)
      }
    })
  })

  describe('formatSeverityLabel', () => {
    it('returns colored label for each severity', () => {
      for (const sev of ['low', 'medium', 'high', 'critical']) {
        expect(formatSeverityLabel(sev)).toContain(sev)
      }
    })
  })

  describe('formatSafetyGauge', () => {
    it('returns gauge string', () => {
      const gauge = formatSafetyGauge(75)
      expect(gauge).toContain('\u2588')
      expect(gauge).toContain('75')
    })
  })

  describe('formatZones', () => {
    it('handles empty zones', () => {
      expect(formatZones([])).toContain('No files analyzed')
    })

    it('shows file details', () => {
      const result = makeResult()
      const output = formatZones(result.zones)
      expect(output).toContain('a.ts')
    })

    it('shows header', () => {
      expect(formatZones([])).toContain('Safety Zones')
    })
  })

  describe('formatProtections', () => {
    it('handles empty protections', () => {
      expect(formatProtections([])).toContain('No protections detected')
    })

    it('shows protection details', () => {
      const protections: Protection[] = [
        { type: 'try-catch', location: 1, description: 'try-catch block', strength: 'strong' },
      ]
      const output = formatProtections(protections)
      expect(output).toContain('try-catch')
      expect(output).toContain('strong')
    })
  })

  describe('formatThreats', () => {
    it('handles empty threats', () => {
      expect(formatThreats([])).toContain('No threats detected')
    })

    it('shows threat details', () => {
      const threats: Threat[] = [
        { type: 'implicit-any', location: 1, severity: 'high', description: 'Explicit any type', mitigation: 'Replace with specific type' },
      ]
      const output = formatThreats(threats)
      expect(output).toContain('implicit-any')
      expect(output).toContain('high')
    })
  })

  describe('formatEndangeredPatterns', () => {
    it('handles empty patterns', () => {
      expect(formatEndangeredPatterns([])).toContain('No endangered patterns')
    })

    it('shows pattern details', () => {
      const patterns: EndangeredPattern[] = [
        { pattern: 'JSON.parse', files: ['a.ts'], riskLevel: 'vulnerable', hasProtection: false, protectionType: null, recommendation: 'Wrap in try-catch' },
      ]
      const output = formatEndangeredPatterns(patterns)
      expect(output).toContain('JSON.parse')
      expect(output).toContain('vulnerable')
    })
  })

  describe('formatSanctuaryStats', () => {
    it('shows stats summary', () => {
      const result = makeResult()
      const output = formatSanctuaryStats(result.stats)
      expect(output).toContain('Sanctuary Analysis')
      expect(output).toContain('Zones:')
      expect(output).toContain('Safety Score:')
    })
  })

  describe('formatRecommendations', () => {
    it('handles empty recommendations', () => {
      expect(formatRecommendations([])).toContain('well-protected')
    })

    it('shows numbered recommendations', () => {
      const output = formatRecommendations(['Fix X', 'Fix Y'])
      expect(output).toContain('1. Fix X')
      expect(output).toContain('2. Fix Y')
    })
  })

  describe('formatSanctuaryTable', () => {
    it('produces full table output', () => {
      const result = makeResult()
      const output = formatSanctuaryTable(result)
      expect(output).toContain('Sanctuary Analysis')
      expect(output).toContain('Safety Zones')
      expect(output).toContain('Recommendations')
    })
  })

  describe('formatSanctuaryJson', () => {
    it('produces valid JSON', () => {
      const result = makeResult()
      const json = formatSanctuaryJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.zones).toBeDefined()
      expect(parsed.stats).toBeDefined()
    })
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('sanctuary integration', () => {
  it('full analysis with mixed safety zones', () => {
    const result = buildSanctuaryResult(
      ['safe.ts', 'risky.ts'],
      [
        'function greet(name: string): string {\n  if (typeof name !== "string") return "";\n  return `Hello ${name}`;\n}',
        'const x: any = JSON.parse(input);\nglobalThis.result = x;\ndelete x.prop;\narr.sort();',
      ],
      {},
    )
    expect(result.zones.length).toBe(2)
    expect(result.stats.totalThreats).toBeGreaterThan(0)
    expect(result.endangeredPatterns.length).toBeGreaterThanOrEqual(1)
  })

  it('handles fully safe codebase', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: string = "hello"; const y: number = 42;'],
      {},
    )
    expect(['fortress', 'secure', 'guarded']).toContain(result.stats.overallSafety)
    expect(['sanctuary', 'protected', 'natural']).toContain(result.zones[0].classification)
  })

  it('handles fully dangerous codebase', () => {
    const result = buildSanctuaryResult(
      ['a.ts'],
      ['const x: any = 1; const y: any = 2; eval(code); globalThis.z = x + y'],
      {},
    )
    expect(result.stats.totalThreats).toBeGreaterThan(0)
    expect(result.endangeredPatterns.length).toBeGreaterThanOrEqual(1)
  })
})
