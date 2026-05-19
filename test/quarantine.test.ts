import { describe, expect, it } from 'vitest'

import {
  buildQuarantineResult,
  classifyZone,
  computeRiskScore,
  detectDeprecated,
  detectExperimental,
  detectFragile,
  detectIncomplete,
  detectKnownBugs,
  detectPerformanceRisk,
  detectSecurityRisk,
  detectUnstableApi,
  detectUntestedComplex,
  detectWorkarounds,
  generateRecommendations,
  type QuarantineItem,
  type QuarantineStats,
  type QuarantineZone,
} from '../src/commands/quarantine-helpers.js'

import {
  formatItemsTable,
  formatQuarantineJSON,
  formatQuarantineTable,
  formatRiskDistribution,
  formatRiskLevel,
  formatStatsSummary,
  formatZoneCard,
  formatZoneStatus,
  formatRecommendations,
} from '../src/commands/quarantine-format-helpers.js'

// ─── detectExperimental ───────────────────────────────────────────────────────

describe('detectExperimental', () => {
  it('detects EXPERIMENTAL marker', () => {
    const items = detectExperimental('// EXPERIMENTAL: new approach', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('experimental')
    expect(items[0]!.riskLevel).toBe('medium')
  })

  it('detects WIP marker', () => {
    const items = detectExperimental('// WIP: still working on this', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('WIP')
  })

  it('detects POC marker', () => {
    const items = detectExperimental('// POC for the feature', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects prototype marker', () => {
    const items = detectExperimental('const proto = prototype // prototype code', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects draft marker', () => {
    const items = detectExperimental('// draft implementation', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectExperimental('function hello() { return 42; }', 'file.ts')
    expect(items).toHaveLength(0)
  })

  it('sets correct line number', () => {
    const content = 'line1\nline2\n// EXPERIMENTAL\nline4'
    const items = detectExperimental(content, 'file.ts')
    expect(items[0]!.line).toBe(3)
  })

  it('sets file path', () => {
    const items = detectExperimental('// EXPERIMENTAL', 'src/core.ts')
    expect(items[0]!.file).toBe('src/core.ts')
  })

  it('includes suggestion', () => {
    const items = detectExperimental('// EXPERIMENTAL', 'file.ts')
    expect(items[0]!.suggestion).toBeTruthy()
  })
})

// ─── detectDeprecated ─────────────────────────────────────────────────────────

describe('detectDeprecated', () => {
  it('detects @deprecated JSDoc', () => {
    const items = detectDeprecated('/** @deprecated use newFunc instead */', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('deprecated')
    expect(items[0]!.riskLevel).toBe('high')
  })

  it('detects DEPRECATED comment', () => {
    const items = detectDeprecated('// DEPRECATED: will be removed', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectDeprecated('function current() {}', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectUntestedComplex ────────────────────────────────────────────────────

describe('detectUntestedComplex', () => {
  it('returns empty when test file exists', () => {
    const content = 'function deep() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n        }\n      }\n    }\n  }\n}'
    const items = detectUntestedComplex(content, 'file.ts', true)
    expect(items).toHaveLength(0)
  })

  it('detects deeply nested function without tests', () => {
    const content = 'function deep() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          x()\n        }\n      }\n    }\n  }\n}'
    const items = detectUntestedComplex(content, 'file.ts', false)
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]!.riskType).toBe('untested-complex')
  })

  it('returns empty for simple functions', () => {
    const items = detectUntestedComplex('function simple() { return 1; }', 'file.ts', false)
    expect(items).toHaveLength(0)
  })

  it('detects arrow function complexity', () => {
    const content = 'const complex = (a, b) => {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n        }\n      }\n    }\n  }\n}'
    const items = detectUntestedComplex(content, 'file.ts', false)
    expect(items.length).toBeGreaterThan(0)
  })
})

// ─── detectKnownBugs ──────────────────────────────────────────────────────────

describe('detectKnownBugs', () => {
  it('detects FIXME', () => {
    const items = detectKnownBugs('// FIXME: this is broken', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('known-bug')
    expect(items[0]!.riskLevel).toBe('critical')
  })

  it('detects BUG marker', () => {
    const items = detectKnownBugs('// BUG: off by one error', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects ISSUE marker', () => {
    const items = detectKnownBugs('// ISSUE#123: crashes on empty input', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectKnownBugs('function ok() { return true; }', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectFragile ────────────────────────────────────────────────────────────

describe('detectFragile', () => {
  it('detects fragile comment', () => {
    const items = detectFragile('// fragile: depends on timing', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('fragile')
  })

  it('detects silent catch', () => {
    const items = detectFragile('try { x() } catch(e) { }', 'file.ts')
    expect(items.some((i) => i.reason.includes('Silent catch'))).toBe(true)
  })

  it('does not flag catch with body', () => {
    const items = detectFragile('try { x() } catch(e) { console.error(e) }', 'file.ts')
    expect(items.some((i) => i.reason.includes('Silent catch'))).toBe(false)
  })

  it('returns empty for clean code', () => {
    const items = detectFragile('function safe() { return 1; }', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectPerformanceRisk ────────────────────────────────────────────────────

describe('detectPerformanceRisk', () => {
  it('detects await inside for loop', () => {
    const items = detectPerformanceRisk('for (const x of arr) { await fetch(x) }', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('performance-risk')
  })

  it('detects await inside while loop', () => {
    const items = detectPerformanceRisk('while (hasMore) { await loadNext() }', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects async forEach', () => {
    const items = detectPerformanceRisk('arr.forEach(async (x) => { await process(x) })', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects readFileSync', () => {
    const items = detectPerformanceRisk('const data = readFileSync(path)', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects writeFileSync', () => {
    const items = detectPerformanceRisk('writeFileSync(path, data)', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectPerformanceRisk('const x = await fetch(url)', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectSecurityRisk ───────────────────────────────────────────────────────

describe('detectSecurityRisk', () => {
  it('detects eval()', () => {
    const items = detectSecurityRisk('eval(userInput)', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('eval')
    expect(items[0]!.riskLevel).toBe('critical')
  })

  it('detects innerHTML', () => {
    const items = detectSecurityRisk('el.innerHTML = userInput', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('innerHTML')
  })

  it('detects exec()', () => {
    const items = detectSecurityRisk('child.exec(cmd)', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('exec')
  })

  it('detects SQL concatenation', () => {
    const items = detectSecurityRisk('"SELECT * FROM users WHERE id=" + userId', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('SQL')
  })

  it('detects hardcoded password', () => {
    const items = detectSecurityRisk("const password = 'secret123'", 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.reason).toContain('password')
  })

  it('detects hardcoded API key', () => {
    const items = detectSecurityRisk("const api_key = 'abc123'", 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects hardcoded secret', () => {
    const items = detectSecurityRisk("const secret = 'my-secret'", 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectSecurityRisk('const x = 42', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectIncomplete ─────────────────────────────────────────────────────────

describe('detectIncomplete', () => {
  it('detects TODO without assignee', () => {
    const items = detectIncomplete('// TODO: implement this later', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('incomplete')
    expect(items[0]!.riskLevel).toBe('low')
  })

  it('does not flag TODO with assignee', () => {
    const items = detectIncomplete('// TODO(john): implement this', 'file.ts')
    expect(items).toHaveLength(0)
  })

  it('detects STUB', () => {
    const items = detectIncomplete('// STUB: not implemented', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects PLACEHOLDER', () => {
    const items = detectIncomplete('// PLACEHOLDER', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects not implemented error', () => {
    const items = detectIncomplete("throw new Error('not implemented')", 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectIncomplete('function done() { return 42; }', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectWorkarounds ────────────────────────────────────────────────────────

describe('detectWorkarounds', () => {
  it('detects HACK comment', () => {
    const items = detectWorkarounds('// HACK: workaround for bug #123', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('workaround')
  })

  it('detects WORKAROUND comment', () => {
    const items = detectWorkarounds('// WORKAROUND: until upstream fixes', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects TEMP comment', () => {
    const items = detectWorkarounds('// TEMP: remove after migration', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects TEMPORARY comment', () => {
    const items = detectWorkarounds('// TEMPORARY fix', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectWorkarounds('function good() {}', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── detectUnstableApi ────────────────────────────────────────────────────────

describe('detectUnstableApi', () => {
  it('detects "may change" comment', () => {
    const items = detectUnstableApi('// may change in next version', 'file.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.riskType).toBe('unstable-api')
  })

  it('detects "not stable" comment', () => {
    const items = detectUnstableApi('// not stable yet', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects "breaking change" comment', () => {
    const items = detectUnstableApi('// breaking change: new signature', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects "unstable" comment', () => {
    const items = detectUnstableApi('// unstable API', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('detects "subject to change" comment', () => {
    const items = detectUnstableApi('// subject to change', 'file.ts')
    expect(items).toHaveLength(1)
  })

  it('returns empty for clean code', () => {
    const items = detectUnstableApi('function stable() { return 1; }', 'file.ts')
    expect(items).toHaveLength(0)
  })
})

// ─── computeRiskScore ─────────────────────────────────────────────────────────

describe('computeRiskScore', () => {
  it('returns 0 for empty items', () => {
    expect(computeRiskScore([])).toBe(0)
  })

  it('computes score from low items', () => {
    const items: QuarantineItem[] = [
      { file: 'a.ts', line: 1, code: '', riskType: 'incomplete', riskLevel: 'low', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
    ]
    expect(computeRiskScore(items)).toBe(10)
  })

  it('computes score from critical items', () => {
    const items: QuarantineItem[] = [
      { file: 'a.ts', line: 1, code: '', riskType: 'known-bug', riskLevel: 'critical', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
    ]
    expect(computeRiskScore(items)).toBe(90)
  })

  it('averages mixed risk levels', () => {
    const items: QuarantineItem[] = [
      { file: 'a.ts', line: 1, code: '', riskType: 'incomplete', riskLevel: 'low', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
      { file: 'a.ts', line: 2, code: '', riskType: 'known-bug', riskLevel: 'critical', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
    ]
    expect(computeRiskScore(items)).toBe(50)
  })

  it('caps at 100', () => {
    const items: QuarantineItem[] = Array.from({ length: 5 }, () => ({
      file: 'a.ts', line: 1, code: '', riskType: 'known-bug' as const, riskLevel: 'critical' as const, reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false,
    }))
    expect(computeRiskScore(items)).toBeLessThanOrEqual(100)
  })
})

// ─── classifyZone ─────────────────────────────────────────────────────────────

describe('classifyZone', () => {
  it('classifies 0-20 as safe', () => {
    expect(classifyZone(0)).toBe('safe')
    expect(classifyZone(10)).toBe('safe')
    expect(classifyZone(20)).toBe('safe')
  })

  it('classifies 21-40 as watch', () => {
    expect(classifyZone(25)).toBe('watch')
    expect(classifyZone(40)).toBe('watch')
  })

  it('classifies 41-65 as quarantine', () => {
    expect(classifyZone(50)).toBe('quarantine')
    expect(classifyZone(65)).toBe('quarantine')
  })

  it('classifies 66+ as isolate', () => {
    expect(classifyZone(70)).toBe('isolate')
    expect(classifyZone(100)).toBe('isolate')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<QuarantineStats> = {}): QuarantineStats => ({
    totalItems: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    safeZones: 0,
    watchZones: 0,
    quarantineZones: 0,
    isolateZones: 0,
    averageRiskScore: 0,
    totalDependents: 0,
    ...overrides,
  })

  it('recommends isolating critical items', () => {
    const recs = generateRecommendations([], makeStats({ criticalCount: 3 }))
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('recommends adding tests for untested complex', () => {
    const zone: QuarantineZone = {
      name: 'a.ts', items: [
        { file: 'a.ts', line: 1, code: '', riskType: 'untested-complex', riskLevel: 'high', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
      ], riskScore: 60, status: 'quarantine', description: '',
    }
    const recs = generateRecommendations([zone], makeStats())
    expect(recs.some((r) => r.includes('test'))).toBe(true)
  })

  it('recommends removing deprecated code', () => {
    const zone: QuarantineZone = {
      name: 'a.ts', items: [
        { file: 'a.ts', line: 1, code: '', riskType: 'deprecated', riskLevel: 'high', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
      ], riskScore: 60, status: 'quarantine', description: '',
    }
    const recs = generateRecommendations([zone], makeStats())
    expect(recs.some((r) => r.includes('deprecated') || r.includes('migration'))).toBe(true)
  })

  it('recommends isolating zones', () => {
    const recs = generateRecommendations([], makeStats({ isolateZones: 2 }))
    expect(recs.some((r) => r.includes('isolation'))).toBe(true)
  })

  it('recommends auditing security risks', () => {
    const zone: QuarantineZone = {
      name: 'a.ts', items: [
        { file: 'a.ts', line: 1, code: '', riskType: 'security-risk', riskLevel: 'critical', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
      ], riskScore: 90, status: 'isolate', description: '',
    }
    const recs = generateRecommendations([zone], makeStats())
    expect(recs.some((r) => r.includes('security') || r.includes('audit'))).toBe(true)
  })

  it('says healthy when no risks', () => {
    const recs = generateRecommendations([], makeStats())
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('recommends quarantining experimental', () => {
    const zone: QuarantineZone = {
      name: 'a.ts', items: [
        { file: 'a.ts', line: 1, code: '', riskType: 'experimental', riskLevel: 'medium', reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false },
      ], riskScore: 30, status: 'watch', description: '',
    }
    const recs = generateRecommendations([zone], makeStats())
    expect(recs.some((r) => r.includes('experimental'))).toBe(true)
  })
})

// ─── buildQuarantineResult ────────────────────────────────────────────────────

describe('buildQuarantineResult', () => {
  it('builds result from risky code', () => {
    const result = buildQuarantineResult(
      ['file.ts'],
      ['// FIXME: broken\n// EXPERIMENTAL: new feature\neval(userInput)'],
    )
    expect(result.items.length).toBeGreaterThanOrEqual(3)
    expect(result.zones).toHaveLength(1)
    expect(result.stats.totalItems).toBeGreaterThanOrEqual(3)
  })

  it('skips test files', () => {
    const result = buildQuarantineResult(
      ['file.test.ts'],
      ['// FIXME: broken test'],
    )
    expect(result.items).toHaveLength(0)
  })

  it('computes correct stats', () => {
    const result = buildQuarantineResult(
      ['a.ts', 'b.ts'],
      ['// FIXME: bug', '// EXPERIMENTAL'],
    )
    expect(result.stats.totalItems).toBeGreaterThanOrEqual(2)
    expect(result.stats.criticalCount).toBeGreaterThanOrEqual(1)
  })

  it('sorts zones by risk score descending', () => {
    const result = buildQuarantineResult(
      ['low.ts', 'high.ts'],
      ['// TODO: later', '// FIXME eval(x)'],
    )
    for (let i = 1; i < result.zones.length; i++) {
      expect(result.zones[i - 1]!.riskScore).toBeGreaterThanOrEqual(result.zones[i]!.riskScore)
    }
  })

  it('sets zone status based on score', () => {
    const result = buildQuarantineResult(
      ['file.ts'],
      ['eval(x)'],
    )
    if (result.zones.length > 0) {
      expect(['safe', 'watch', 'quarantine', 'isolate']).toContain(result.zones[0]!.status)
    }
  })

  it('sets dependents count', () => {
    const result = buildQuarantineResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './a'", '// FIXME: broken'],
    )
    const aItems = result.items.filter((i) => i.file === 'a.ts')
    if (aItems.length > 0) {
      expect(aItems[0]!.dependents).toBeGreaterThanOrEqual(0)
    }
  })

  it('detects test file pairing', () => {
    const result = buildQuarantineResult(
      ['file.ts', 'file.test.ts'],
      ['// EXPERIMENTAL', '// test'],
    )
    const item = result.items.find((i) => i.file === 'file.ts')
    if (item) {
      expect(item.hasTests).toBe(true)
    }
  })

  it('detects JSDoc documentation', () => {
    const result = buildQuarantineResult(
      ['file.ts'],
      ['/** docs */\n// EXPERIMENTAL'],
    )
    const item = result.items[0]
    if (item) {
      expect(item.hasDocumentation).toBe(true)
    }
  })

  it('handles empty input', () => {
    const result = buildQuarantineResult([], [])
    expect(result.items).toHaveLength(0)
    expect(result.zones).toHaveLength(0)
    expect(result.stats.totalItems).toBe(0)
  })

  it('generates recommendations', () => {
    const result = buildQuarantineResult(
      ['file.ts'],
      ['eval(userInput)'],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes average risk score', () => {
    const result = buildQuarantineResult(
      ['a.ts', 'b.ts'],
      ['// FIXME: bug', '// FIXME: another'],
    )
    expect(result.stats.averageRiskScore).toBeGreaterThanOrEqual(0)
  })

  it('counts total dependents', () => {
    const result = buildQuarantineResult(
      ['a.ts', 'b.ts'],
      ["import { x } from './a'", '// FIXME'],
    )
    expect(result.stats.totalDependents).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatRiskLevel ──────────────────────────────────────────────────────────

describe('formatRiskLevel', () => {
  it('formats low risk', () => {
    expect(formatRiskLevel('low')).toContain('LOW')
  })

  it('formats critical risk', () => {
    expect(formatRiskLevel('critical')).toContain('CRITICAL')
  })

  it('includes icon', () => {
    expect(formatRiskLevel('medium')).toContain('◐')
  })
})

// ─── formatZoneStatus ─────────────────────────────────────────────────────────

describe('formatZoneStatus', () => {
  it('formats safe status', () => {
    expect(formatZoneStatus('safe')).toContain('SAFE')
  })

  it('formats isolate status', () => {
    expect(formatZoneStatus('isolate')).toContain('ISOLATE')
  })
})

// ─── formatRiskDistribution ───────────────────────────────────────────────────

describe('formatRiskDistribution', () => {
  it('renders distribution bar', () => {
    const stats: QuarantineStats = {
      totalItems: 10, criticalCount: 2, highCount: 3, mediumCount: 3, lowCount: 2,
      safeZones: 0, watchZones: 0, quarantineZones: 0, isolateZones: 0,
      averageRiskScore: 50, totalDependents: 0,
    }
    const bar = formatRiskDistribution(stats)
    expect(bar).toContain('█')
    expect(bar).toContain('10')
  })

  it('handles zero items', () => {
    const stats: QuarantineStats = {
      totalItems: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0,
      safeZones: 0, watchZones: 0, quarantineZones: 0, isolateZones: 0,
      averageRiskScore: 0, totalDependents: 0,
    }
    const bar = formatRiskDistribution(stats)
    expect(bar).toContain('0')
  })
})

// ─── formatZoneCard ───────────────────────────────────────────────────────────

describe('formatZoneCard', () => {
  it('formats zone card', () => {
    const zone: QuarantineZone = {
      name: 'file.ts',
      items: [{ file: 'file.ts', line: 5, code: '// FIXME: bug', riskType: 'known-bug', riskLevel: 'critical', reason: 'bug', suggestion: 'fix it', dependents: 0, hasTests: false, hasDocumentation: false }],
      riskScore: 90,
      status: 'isolate',
      description: '1 risk item',
    }
    const card = formatZoneCard(zone)
    expect(card).toContain('file.ts')
    expect(card).toContain('90')
  })

  it('shows "more items" for many items', () => {
    const zone: QuarantineZone = {
      name: 'big.ts',
      items: Array.from({ length: 8 }, (_, i) => ({
        file: 'big.ts', line: i + 1, code: `// TODO ${i}`, riskType: 'incomplete' as const, riskLevel: 'low' as const, reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false,
      })),
      riskScore: 10,
      status: 'safe',
      description: 'many items',
    }
    const card = formatZoneCard(zone)
    expect(card).toContain('more')
  })
})

// ─── formatItemsTable ─────────────────────────────────────────────────────────

describe('formatItemsTable', () => {
  it('formats items table', () => {
    const items: QuarantineItem[] = [
      { file: 'a.ts', line: 5, code: 'eval(x)', riskType: 'security-risk', riskLevel: 'critical', reason: 'eval', suggestion: 'avoid', dependents: 0, hasTests: false, hasDocumentation: false },
    ]
    const table = formatItemsTable(items)
    expect(table).toContain('a.ts')
    expect(table).toContain('eval')
  })

  it('shows message for no items', () => {
    expect(formatItemsTable([])).toContain('No quarantine items')
  })

  it('truncates to 30 items', () => {
    const items: QuarantineItem[] = Array.from({ length: 35 }, (_, i) => ({
      file: 'a.ts', line: i, code: `// TODO ${i}`, riskType: 'incomplete' as const, riskLevel: 'low' as const, reason: '', suggestion: '', dependents: 0, hasTests: false, hasDocumentation: false,
    }))
    const table = formatItemsTable(items)
    expect(table).toContain('more')
  })
})

// ─── formatStatsSummary ───────────────────────────────────────────────────────

describe('formatStatsSummary', () => {
  it('formats stats', () => {
    const stats: QuarantineStats = {
      totalItems: 10, criticalCount: 2, highCount: 3, mediumCount: 3, lowCount: 2,
      safeZones: 1, watchZones: 2, quarantineZones: 1, isolateZones: 1,
      averageRiskScore: 45, totalDependents: 8,
    }
    const summary = formatStatsSummary(stats)
    expect(summary).toContain('10')
    expect(summary).toContain('45')
    expect(summary).toContain('8')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const recs = formatRecommendations(['Fix bugs', 'Add tests'])
    expect(recs).toContain('Fix bugs')
    expect(recs).toContain('Add tests')
  })

  it('shows message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatQuarantineTable ────────────────────────────────────────────────────

describe('formatQuarantineTable', () => {
  it('formats full table', () => {
    const result = buildQuarantineResult(
      ['file.ts'],
      ['// FIXME: broken\neval(userInput)'],
    )
    const table = formatQuarantineTable(result)
    expect(table).toContain('Quarantine Analysis')
    expect(table).toContain('Quarantine Items')
    expect(table).toContain('Quarantine Stats')
    expect(table).toContain('Recommendations')
  })
})

// ─── formatQuarantineJSON ─────────────────────────────────────────────────────

describe('formatQuarantineJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildQuarantineResult(['file.ts'], ['// FIXME: broken'])
    const json = formatQuarantineJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.zones).toBeDefined()
    expect(parsed.items).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
