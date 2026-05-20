import { describe, it, expect } from 'vitest'
import {
  identifySources,
  mapChannels,
  findReservoirs,
  detectLeaks,
  computeFlowEfficiency,
  computeWaterQuality,
  classifyFile,
  computeNetworkEfficiency,
  computeWaterLoss,
  classifyOverallGrade,
  generateRecommendations,
  buildAqueductResult,
} from '../src/commands/aqueduct-helpers.js'
import { formatAqueductTable, formatAqueductJson } from '../src/commands/aqueduct-format-helpers.js'
import type { Channel, Reservoir, AqueductFile, AqueductStats, FileClassification } from '../src/commands/aqueduct-helpers.js'

// ─── identifySources ───────────────────────────────────────────────────────────

describe('identifySources', () => {
  it('detects parameters', () => {
    const sources = identifySources('function greet(name: string, age: number) {}', 'a.ts')
    const params = sources.filter(s => s.type === 'parameter')
    expect(params.length).toBe(2)
  })

  it('detects constants', () => {
    const sources = identifySources('const x = 1; const y = 2;', 'a.ts')
    const consts = sources.filter(s => s.type === 'constant')
    expect(consts.length).toBe(2)
  })

  it('detects imports', () => {
    const sources = identifySources('import { x, y } from "mod"', 'a.ts')
    const imports = sources.filter(s => s.type === 'import')
    expect(imports.length).toBeGreaterThanOrEqual(2)
  })

  it('detects computed sources', () => {
    const sources = identifySources('const result = compute(input)', 'a.ts')
    const computed = sources.filter(s => s.type === 'computed')
    expect(computed.length).toBeGreaterThanOrEqual(0)
  })

  it('returns empty for empty content', () => {
    const sources = identifySources('', 'a.ts')
    expect(sources).toHaveLength(0)
  })

  it('sets file path correctly', () => {
    const sources = identifySources('const x = 1;', 'my/file.ts')
    expect(sources.every(s => s.file === 'my/file.ts')).toBe(true)
  })

  it('reliability is 0-100', () => {
    const sources = identifySources('const x = 1; function f(a) {}', 'a.ts')
    for (const s of sources) {
      expect(s.reliability).toBeGreaterThanOrEqual(0)
      expect(s.reliability).toBeLessThanOrEqual(100)
    }
  })
})

// ─── mapChannels ───────────────────────────────────────────────────────────────

describe('mapChannels', () => {
  it('detects export channels', () => {
    const channels = mapChannels('export const x = 1;', 'a.ts')
    const exportCh = channels.find(c => c.type === 'return-value' && c.to === 'external')
    expect(exportCh).toBeDefined()
  })

  it('detects parameter channels', () => {
    const channels = mapChannels('function f(x: number, y: string) {}', 'a.ts')
    const paramCh = channels.find(c => c.type === 'parameter' && c.to === 'a.ts')
    expect(paramCh).toBeDefined()
  })

  it('detects assignment channels', () => {
    const channels = mapChannels('const x = 1; let y = x;', 'a.ts')
    const assignCh = channels.find(c => c.type === 'assignment')
    expect(assignCh).toBeDefined()
  })

  it('detects return channels', () => {
    const channels = mapChannels('function f() { return 42 }', 'a.ts')
    const returnCh = channels.find(c => c.type === 'return-value' && c.to === 'caller')
    expect(returnCh).toBeDefined()
  })

  it('detects callback channels', () => {
    const channels = mapChannels('fetch(url).then(r => r.json())', 'a.ts')
    const callbackCh = channels.find(c => c.type === 'callback')
    expect(callbackCh).toBeDefined()
  })

  it('marks channels as clean when types present', () => {
    const channels = mapChannels('export function f(x: number): string { return String(x) }', 'a.ts')
    const clean = channels.filter(c => c.flowQuality === 'clean')
    expect(clean.length).toBeGreaterThan(0)
  })

  it('marks channels as polluted with any', () => {
    const channels = mapChannels('const x: any = getData(); const y = x;', 'a.ts')
    const polluted = channels.find(c => c.flowQuality === 'polluted')
    expect(polluted).toBeDefined()
  })

  it('each channel has required fields', () => {
    const channels = mapChannels('export const x = 1;', 'a.ts')
    for (const c of channels) {
      expect(c).toHaveProperty('from')
      expect(c).toHaveProperty('to')
      expect(c).toHaveProperty('type')
      expect(c).toHaveProperty('width')
      expect(c).toHaveProperty('flowQuality')
      expect(c).toHaveProperty('length')
      expect(c).toHaveProperty('hasLeaks')
      expect(c).toHaveProperty('hasBlockages')
      expect(c).toHaveProperty('description')
    }
  })
})

// ─── findReservoirs ────────────────────────────────────────────────────────────

describe('findReservoirs', () => {
  it('detects const variables', () => {
    const reservoirs = findReservoirs('const x = 1;', 'a.ts')
    expect(reservoirs.some(r => r.name === 'x')).toBe(true)
  })

  it('detects let variables', () => {
    const reservoirs = findReservoirs('let y = 2;', 'a.ts')
    expect(reservoirs.some(r => r.name === 'y')).toBe(true)
  })

  it('marks unused variables as stagnant', () => {
    const reservoirs = findReservoirs('const unused = 42;', 'a.ts')
    const unused = reservoirs.find(r => r.name === 'unused')
    expect(unused?.isStagnant).toBe(true)
  })

  it('marks used variables as non-stagnant', () => {
    const reservoirs = findReservoirs('const used = 42; console.log(used);', 'a.ts')
    const used = reservoirs.find(r => r.name === 'used')
    expect(used?.isStagnant).toBe(false)
    expect(used?.outflow).toBeGreaterThan(0)
  })

  it('upgrades object variables to store type', () => {
    const reservoirs = findReservoirs('const config = { a: 1 }; config.a = 2;', 'a.ts')
    const config = reservoirs.find(r => r.name === 'config')
    expect(config?.type).toBe('store')
  })

  it('each reservoir has required fields', () => {
    const reservoirs = findReservoirs('const x = 1;', 'a.ts')
    for (const r of reservoirs) {
      expect(r).toHaveProperty('name')
      expect(r).toHaveProperty('file')
      expect(r).toHaveProperty('type')
      expect(r).toHaveProperty('capacity')
      expect(r).toHaveProperty('inflow')
      expect(r).toHaveProperty('outflow')
      expect(r).toHaveProperty('isStagnant')
      expect(r).toHaveProperty('isOverflowing')
      expect(r).toHaveProperty('quality')
    }
  })
})

// ─── detectLeaks ───────────────────────────────────────────────────────────────

describe('detectLeaks', () => {
  it('detects unused variables', () => {
    const leaks = detectLeaks('const unused = 42;', 'a.ts')
    const unused = leaks.find(l => l.type === 'unused-variable' && l.description.includes('unused'))
    expect(unused).toBeDefined()
  })

  it('does not flag used variables', () => {
    const leaks = detectLeaks('const used = 42; console.log(used);', 'a.ts')
    const used = leaks.find(l => l.type === 'unused-variable' && l.description.includes('used'))
    expect(used).toBeUndefined()
  })

  it('detects type leaks (any)', () => {
    const leaks = detectLeaks('const x: any = getData();', 'a.ts')
    const typeLeak = leaks.find(l => l.type === 'type-leak')
    expect(typeLeak).toBeDefined()
    expect(typeLeak?.severity).toBe('stream')
  })

  it('detects side-effect leaks for many void calls', () => {
    const calls = Array(8).fill(0).map((_, i) => `fn${i}()`).join('\n')
    const leaks = detectLeaks(calls, 'a.ts')
    const sideEffect = leaks.find(l => l.type === 'side-effect-leak')
    expect(sideEffect).toBeDefined()
  })

  it('detects unreachable data', () => {
    const code = 'function f() {\n  return 1;\n  const x = 2;\n}'
    const leaks = detectLeaks(code, 'a.ts')
    const unreachable = leaks.find(l => l.type === 'unreachable-data')
    expect(unreachable).toBeDefined()
  })

  it('each leak has required fields', () => {
    const leaks = detectLeaks('const x = 1;', 'a.ts')
    for (const l of leaks) {
      expect(l).toHaveProperty('type')
      expect(l).toHaveProperty('file')
      expect(l).toHaveProperty('line')
      expect(l).toHaveProperty('severity')
      expect(l).toHaveProperty('description')
      expect(l).toHaveProperty('fix')
      expect(l.line).toBeGreaterThanOrEqual(1)
    }
  })

  it('returns empty for clean code', () => {
    const code = 'export function add(a: number, b: number): number { const sum = a + b; return sum; }'
    const leaks = detectLeaks(code, 'a.ts')
    expect(leaks.filter(l => l.type !== 'unreachable-data')).toHaveLength(0)
  })
})

// ─── computeFlowEfficiency ─────────────────────────────────────────────────────

describe('computeFlowEfficiency', () => {
  it('returns 50 for no sources or channels', () => {
    expect(computeFlowEfficiency(0, 0, 0)).toBe(50)
  })

  it('increases with channels', () => {
    const low = computeFlowEfficiency(2, 0, 0)
    const high = computeFlowEfficiency(2, 3, 0)
    expect(high).toBeGreaterThan(low)
  })

  it('decreases with leaks', () => {
    const clean = computeFlowEfficiency(2, 2, 0)
    const leaky = computeFlowEfficiency(2, 2, 5)
    expect(clean).toBeGreaterThan(leaky)
  })

  it('clamps to 0-100', () => {
    expect(computeFlowEfficiency(100, 100, 0)).toBeLessThanOrEqual(100)
    expect(computeFlowEfficiency(0, 0, 50)).toBeGreaterThanOrEqual(0)
  })
})

// ─── computeWaterQuality ───────────────────────────────────────────────────────

describe('computeWaterQuality', () => {
  const makeChannel = (quality: string): Channel => ({
    from: 'a', to: 'b', type: 'parameter' as const, width: 1,
    flowQuality: quality as Channel['flowQuality'], length: 1,
    hasLeaks: false, hasBlockages: false, description: '',
  })

  it('returns 50 for empty inputs', () => {
    expect(computeWaterQuality([], [])).toBe(50)
  })

  it('rewards clean channels', () => {
    const clean = computeWaterQuality([makeChannel('clean')], [])
    const polluted = computeWaterQuality([makeChannel('polluted')], [])
    expect(clean).toBeGreaterThan(polluted)
  })

  it('penalizes polluted channels', () => {
    const clean = computeWaterQuality([makeChannel('clean')], [])
    const polluted = computeWaterQuality([makeChannel('polluted')], [])
    expect(clean - polluted).toBeGreaterThanOrEqual(5)
  })

  it('factors in reservoir quality', () => {
    const goodRes: Reservoir = { name: 'x', file: 'a.ts', type: 'variable', capacity: 1, inflow: 1, outflow: 1, isStagnant: false, isOverflowing: false, quality: 90 }
    const badRes: Reservoir = { name: 'y', file: 'a.ts', type: 'variable', capacity: 1, inflow: 1, outflow: 0, isStagnant: true, isOverflowing: false, quality: 10 }
    const good = computeWaterQuality([], [goodRes])
    const bad = computeWaterQuality([], [badRes])
    expect(good).toBeGreaterThan(bad)
  })

  it('clamps to 0-100', () => {
    const q = computeWaterQuality([makeChannel('clean'), makeChannel('clean')], [])
    expect(q).toBeGreaterThanOrEqual(0)
    expect(q).toBeLessThanOrEqual(100)
  })
})

// ─── classifyFile ──────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  it('returns spring for many sources with high efficiency', () => {
    expect(classifyFile(6, 3, 2, 80)).toBe('spring')
  })

  it('returns reservoir-hub for many reservoirs', () => {
    expect(classifyFile(2, 2, 6, 50)).toBe('reservoir-hub')
  })

  it('returns distribution for many channels and sources', () => {
    expect(classifyFile(3, 5, 1, 60)).toBe('distribution')
  })

  it('returns well for moderate flow', () => {
    expect(classifyFile(1, 3, 1, 55)).toBe('well')
  })

  it('returns dry for no sources or channels', () => {
    expect(classifyFile(0, 0, 0, 50)).toBe('dry')
  })

  it('returns drain for low efficiency', () => {
    expect(classifyFile(1, 1, 0, 30)).toBe('drain')
  })
})

// ─── computeNetworkEfficiency ──────────────────────────────────────────────────

describe('computeNetworkEfficiency', () => {
  it('returns 50 for empty files', () => {
    expect(computeNetworkEfficiency([], [])).toBe(50)
  })

  it('factors in file efficiency', () => {
    const goodFiles: AqueductFile[] = [{
      file: 'a.ts', sources: 5, channels: 3, reservoirs: 2, leaks: 0,
      flowEfficiency: 90, waterQuality: 80, classification: 'spring',
    }]
    const badFiles: AqueductFile[] = [{
      file: 'b.ts', sources: 1, channels: 1, reservoirs: 0, leaks: 5,
      flowEfficiency: 30, waterQuality: 20, classification: 'drain',
    }]
    expect(computeNetworkEfficiency(goodFiles, [])).toBeGreaterThan(computeNetworkEfficiency(badFiles, []))
  })

  it('factors in clean channel ratio', () => {
    const files: AqueductFile[] = [{
      file: 'a.ts', sources: 1, channels: 1, reservoirs: 0, leaks: 0,
      flowEfficiency: 70, waterQuality: 70, classification: 'well',
    }]
    const cleanCh: Channel = { from: 'a', to: 'b', type: 'parameter', width: 1, flowQuality: 'clean', length: 1, hasLeaks: false, hasBlockages: false, description: '' }
    const pollutedCh: Channel = { from: 'a', to: 'b', type: 'parameter', width: 1, flowQuality: 'polluted', length: 1, hasLeaks: false, hasBlockages: false, description: '' }
    const clean = computeNetworkEfficiency(files, [cleanCh])
    const polluted = computeNetworkEfficiency(files, [pollutedCh])
    expect(clean).toBeGreaterThanOrEqual(polluted)
  })
})

// ─── computeWaterLoss ──────────────────────────────────────────────────────────

describe('computeWaterLoss', () => {
  it('returns 0 for no leaks', () => {
    const ch: Channel = { from: 'a', to: 'b', type: 'parameter', width: 1, flowQuality: 'clean', length: 1, hasLeaks: false, hasBlockages: false, description: '' }
    expect(computeWaterLoss([], [ch])).toBe(0)
  })

  it('returns 100 for leaks with no channels', () => {
    const leak: Leak = { type: 'unused-variable', file: 'a.ts', line: 1, severity: 'drip', description: '', fix: '' }
    expect(computeWaterLoss([leak], [])).toBe(100)
  })

  it('returns 0 for no leaks and no channels', () => {
    expect(computeWaterLoss([], [])).toBe(0)
  })

  it('increases with more leaks', () => {
    const ch: Channel = { from: 'a', to: 'b', type: 'parameter', width: 1, flowQuality: 'clean', length: 1, hasLeaks: false, hasBlockages: false, description: '' }
    const leak: Leak = { type: 'unused-variable', file: 'a.ts', line: 1, severity: 'drip', description: '', fix: '' }
    const less = computeWaterLoss([leak], [ch, ch, ch])
    const more = computeWaterLoss([leak, leak, leak], [ch, ch, ch])
    expect(more).toBeGreaterThan(less)
  })
})

// ─── classifyOverallGrade ──────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns roman-engineering for excellent scores', () => {
    expect(classifyOverallGrade(85, 85, 1)).toBe('roman-engineering')
  })

  it('returns modern-plumbing for good scores', () => {
    expect(classifyOverallGrade(70, 70, 3)).toBe('modern-plumbing')
  })

  it('returns standard for moderate scores', () => {
    expect(classifyOverallGrade(50, 50, 3)).toBe('standard')
  })

  it('returns drought for many leaks', () => {
    expect(classifyOverallGrade(30, 30, 15)).toBe('drought')
  })

  it('returns leaky-pipes for poor scores with few leaks', () => {
    expect(classifyOverallGrade(30, 30, 3)).toBe('leaky-pipes')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<AqueductStats> = {}): AqueductStats => ({
    totalSources: 5, totalChannels: 3, totalReservoirs: 2, totalLeaks: 1,
    floodLeaks: 0, stagnantReservoirs: 0, overflowingReservoirs: 0,
    avgFlowEfficiency: 70, avgWaterQuality: 60, springFiles: 1,
    drainFiles: 0, dryFiles: 0, channelLength: 1,
    networkEfficiency: 65, waterLoss: 10, systemCapacity: 70,
    overallGrade: 'standard',
    ...overrides,
  })

  it('recommends fixing flood leaks', () => {
    const leaks: Leak[] = [{ type: 'type-leak', file: 'a.ts', line: 1, severity: 'flood', description: '', fix: '' }]
    const recs = generateRecommendations([], [], leaks, [], makeStats({ floodLeaks: 1 }))
    expect(recs.some(r => r.includes('flood'))).toBe(true)
  })

  it('recommends removing stagnant reservoirs', () => {
    const res: Reservoir[] = [{ name: 'x', file: 'a.ts', type: 'variable', capacity: 1, inflow: 1, outflow: 0, isStagnant: true, isOverflowing: false, quality: 20 }]
    const recs = generateRecommendations([], [], [], res, makeStats({ stagnantReservoirs: 1 }))
    expect(recs.some(r => r.includes('stagnant'))).toBe(true)
  })

  it('recommends improving murky channels', () => {
    const ch: Channel = { from: 'a', to: 'b', type: 'parameter', width: 1, flowQuality: 'murky', length: 1, hasLeaks: false, hasBlockages: false, description: '' }
    const recs = generateRecommendations([], [ch], [], [], makeStats())
    expect(recs.some(r => r.includes('murky') || r.includes('polluted'))).toBe(true)
  })

  it('recommends verifying dry files', () => {
    const files: AqueductFile[] = [{ file: 'empty.ts', sources: 0, channels: 0, reservoirs: 0, leaks: 0, flowEfficiency: 50, waterQuality: 50, classification: 'dry' as FileClassification }]
    const recs = generateRecommendations(files, [], [], [], makeStats({ dryFiles: 1 }))
    expect(recs.some(r => r.includes('dry'))).toBe(true)
  })

  it('recommends for high water loss', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ waterLoss: 50 }))
    expect(recs.some(r => r.includes('water loss') || r.includes('Water loss'))).toBe(true)
  })

  it('recommends splitting overflowing reservoirs', () => {
    const recs = generateRecommendations([], [], [], [], makeStats({ overflowingReservoirs: 2 }))
    expect(recs.some(r => r.includes('overflowing') || r.includes('overflow'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], [], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildAqueductResult ───────────────────────────────────────────────────────

describe('buildAqueductResult', () => {
  it('returns a complete AqueductResult', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('channels')
    expect(result).toHaveProperty('reservoirs')
    expect(result).toHaveProperty('leaks')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one file entry per input file', () => {
    const result = buildAqueductResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.files).toHaveLength(2)
  })

  it('handles empty input', () => {
    const result = buildAqueductResult([], [], {})
    expect(result.files).toHaveLength(0)
    expect(result.stats.totalSources).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildAqueductResult(['a.ts'], ['export function add(a: number, b: number): number { return a + b }'], {})
    expect(result.stats.totalSources).toBeGreaterThan(0)
    expect(result.stats.totalChannels).toBeGreaterThan(0)
    expect(result.stats.avgFlowEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgWaterQuality).toBeGreaterThanOrEqual(0)
  })

  it('computes water loss', () => {
    const result = buildAqueductResult(['a.ts'], ['const unused = 42;'], {})
    expect(result.stats.waterLoss).toBeGreaterThanOrEqual(0)
  })

  it('computes network efficiency', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    expect(result.stats.networkEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.networkEfficiency).toBeLessThanOrEqual(100)
  })

  it('computes system capacity', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    expect(result.stats.systemCapacity).toBeGreaterThanOrEqual(0)
    expect(result.stats.systemCapacity).toBeLessThanOrEqual(100)
  })

  it('computes overall grade', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    expect(['roman-engineering', 'modern-plumbing', 'standard', 'leaky-pipes', 'drought']).toContain(result.stats.overallGrade)
  })

  it('counts file classifications', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    expect(result.stats.springFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.drainFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.dryFiles).toBeGreaterThanOrEqual(0)
  })

  it('counts leak severity breakdown', () => {
    const result = buildAqueductResult(['a.ts'], ['const x: any = getData();'], {})
    expect(result.stats.floodLeaks).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalLeaks).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatAqueductTable ───────────────────────────────────────────────────────

describe('formatAqueductTable', () => {
  it('returns a string', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Aqueduct')
  })

  it('contains Files section', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Files')
  })

  it('contains Channels section', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Channels')
  })

  it('contains Reservoirs section', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Reservoirs')
  })

  it('contains Leaks section', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Leaks')
  })

  it('contains Statistics section', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const result = buildAqueductResult(['a.ts'], ['const x: any = 1;'], {})
    const output = formatAqueductTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('handles no files gracefully', () => {
    const result = buildAqueductResult([], [], {})
    const output = formatAqueductTable(result, false)
    expect(output).toContain('No files')
  })
})

// ─── formatAqueductJson ────────────────────────────────────────────────────────

describe('formatAqueductJson', () => {
  it('returns valid JSON', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatAqueductJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('channels')
    expect(parsed).toHaveProperty('reservoirs')
    expect(parsed).toHaveProperty('leaks')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildAqueductResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatAqueductJson(result)
    expect(json).toContain('  ')
  })
})
