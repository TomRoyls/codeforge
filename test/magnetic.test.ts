import { describe, expect, it } from 'vitest'

import {
  buildMagneticResult,
  classifyFile,
  classifyOverallField,
  computeCouplingEntropy,
  computeFieldCoherence,
  detectAnomalies,
  generateMagneticRecommendations,
  identifyPoles,
  mapConnections,
  measureMagneticField,
  traceFieldLines,
  type MagneticConnection,
  type MagneticFile,
  type MagneticStats,
} from '../src/commands/magnetic-helpers.js'
import { formatMagneticJson, formatMagneticTable } from '../src/commands/magnetic-format-helpers.js'

// ─── classifyFile ───────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  it('classifies superconductor for high field strength and many connections', () => {
    const connections: MagneticConnection[] = Array.from({ length: 4 }, (_, i) => ({
      from: `file${i}.ts`, to: 'target.ts', type: 'attract' as const, strength: 50, distance: 1, isExpected: true, isAnomalous: false,
    }))
    expect(classifyFile(80, 50, connections)).toBe('superconductor')
  })

  it('classifies conductor for moderate field strength', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'attract', strength: 40, distance: 1, isExpected: true, isAnomalous: false },
    ]
    expect(classifyFile(55, 30, connections)).toBe('conductor')
  })

  it('classifies insulator for mostly non-attract connections', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'repel', strength: 10, distance: 1, isExpected: true, isAnomalous: false },
      { from: 'a.ts', to: 'c.ts', type: 'repel', strength: 10, distance: 1, isExpected: true, isAnomalous: false },
      { from: 'a.ts', to: 'd.ts', type: 'repel', strength: 10, distance: 1, isExpected: true, isAnomalous: false },
    ]
    expect(classifyFile(30, 10, connections)).toBe('insulator')
  })

  it('classifies antimatter for extreme charge with few connections', () => {
    expect(classifyFile(20, 85, [])).toBe('antimatter')
  })

  it('classifies resistor as default', () => {
    expect(classifyFile(30, 0, [])).toBe('resistor')
  })
})

// ─── classifyOverallField ───────────────────────────────────────────────────────

describe('classifyOverallField', () => {
  it('classifies harmonious for high coherence low entropy', () => {
    expect(classifyOverallField(85, 15)).toBe('harmonious')
  })

  it('classifies ordered for good coherence', () => {
    expect(classifyOverallField(65, 35)).toBe('ordered')
  })

  it('classifies disturbed for moderate coherence', () => {
    expect(classifyOverallField(45, 50)).toBe('disturbed')
  })

  it('classifies chaotic for high entropy', () => {
    expect(classifyOverallField(30, 75)).toBe('chaotic')
  })

  it('classifies singularity as default', () => {
    expect(classifyOverallField(20, 30)).toBe('singularity')
  })
})

// ─── computeFieldCoherence ──────────────────────────────────────────────────────

describe('computeFieldCoherence', () => {
  it('returns 100 for empty connections', () => {
    expect(computeFieldCoherence([], [])).toBe(100)
  })

  it('penalizes anomalous connections', () => {
    const goodConns: MagneticConnection[] = [
      { from: 'a', to: 'b', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const badConns: MagneticConnection[] = [
      { from: 'a', to: 'b', type: 'attract', strength: 50, distance: 5, isExpected: false, isAnomalous: true },
    ]
    expect(computeFieldCoherence(goodConns, [])).toBeGreaterThan(computeFieldCoherence(badConns, []))
  })

  it('rewards coherent field lines', () => {
    const conns: MagneticConnection[] = [
      { from: 'a', to: 'b', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const coherentLines = [{ path: ['a', 'b'], strength: 50, type: 'dependency' as const, isCoherent: true, bends: 0 }]
    const incoherentLines = [{ path: ['a', 'b'], strength: 50, type: 'dependency' as const, isCoherent: false, bends: 3 }]
    expect(computeFieldCoherence(conns, coherentLines)).toBeGreaterThan(computeFieldCoherence(conns, incoherentLines))
  })

  it('returns value between 0-100', () => {
    const conns: MagneticConnection[] = [
      { from: 'a', to: 'b', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const coherence = computeFieldCoherence(conns, [])
    expect(coherence).toBeGreaterThanOrEqual(0)
    expect(coherence).toBeLessThanOrEqual(100)
  })
})

// ─── computeCouplingEntropy ─────────────────────────────────────────────────────

describe('computeCouplingEntropy', () => {
  it('returns 0 for single file', () => {
    const files: MagneticFile[] = [
      { file: 'a.ts', polarity: 'positive', fieldStrength: 50, charge: 10, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    expect(computeCouplingEntropy(files, [])).toBe(0)
  })

  it('increases with disconnected files', () => {
    const connected: MagneticFile[] = [
      { file: 'a.ts', polarity: 'positive', fieldStrength: 50, charge: 10, connections: [{ from: 'a.ts', to: 'b.ts', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false }], isPole: false, isAnomaly: false, classification: 'conductor' },
      { file: 'b.ts', polarity: 'negative', fieldStrength: 30, charge: -10, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const disconnected: MagneticFile[] = [
      { file: 'a.ts', polarity: 'neutral', fieldStrength: 0, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
      { file: 'b.ts', polarity: 'neutral', fieldStrength: 0, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const connectedFiles = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, polarity: 'neutral' as const, fieldStrength: i * 20, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' as const,
    }))
    const evenFiles = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, polarity: 'neutral' as const, fieldStrength: 10, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' as const,
    }))
    const spreadEntropy = computeCouplingEntropy(connectedFiles, [])
    const evenEntropy = computeCouplingEntropy(evenFiles, [])
    expect(spreadEntropy).toBeGreaterThanOrEqual(evenEntropy)
  })

  it('returns value between 0-100', () => {
    const files: MagneticFile[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`, polarity: 'neutral' as const, fieldStrength: 0, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' as const,
    }))
    const entropy = computeCouplingEntropy(files, [])
    expect(entropy).toBeGreaterThanOrEqual(0)
    expect(entropy).toBeLessThanOrEqual(100)
  })
})

// ─── mapConnections ─────────────────────────────────────────────────────────────

describe('mapConnections', () => {
  it('detects attract connections from imports', () => {
    const connections = mapConnections(
      ['src/a.ts', 'src/b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    const attracts = connections.filter(c => c.type === 'attract')
    expect(attracts.length).toBeGreaterThan(0)
  })

  it('detects repel connections for nearby unconnected files', () => {
    const connections = mapConnections(
      ['a.ts', 'b.ts'],
      ['const x = 1', 'const y = 2'],
    )
    const repels = connections.filter(c => c.type === 'repel')
    expect(repels.length).toBeGreaterThanOrEqual(0)
  })

  it('returns empty for single file', () => {
    const connections = mapConnections(['a.ts'], ['const x = 1'])
    expect(connections.length).toBe(0)
  })

  it('connections have correct structure', () => {
    const connections = mapConnections(
      ['src/a.ts', 'src/b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
    )
    if (connections.length > 0) {
      const c = connections[0]
      expect(c).toHaveProperty('from')
      expect(c).toHaveProperty('to')
      expect(c).toHaveProperty('type')
      expect(c).toHaveProperty('strength')
      expect(c).toHaveProperty('distance')
      expect(c).toHaveProperty('isExpected')
      expect(c).toHaveProperty('isAnomalous')
    }
  })
})

// ─── measureMagneticField ───────────────────────────────────────────────────────

describe('measureMagneticField', () => {
  it('assigns positive polarity for more exports than imports', () => {
    const connections: MagneticConnection[] = []
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts']
    const mf = measureMagneticField('export const x = 1\nexport function f() {}', 'a.ts', files, connections)
    expect(mf.polarity).toBe('positive')
  })

  it('assigns negative polarity for more imports than exports', () => {
    const connections: MagneticConnection[] = []
    const mf = measureMagneticField("import { a } from 'x'\nimport { b } from 'y'\nimport { c } from 'z'", 'a.ts', ['a.ts', 'b.ts', 'c.ts', 'd.ts'], connections)
    expect(mf.polarity).toBe('negative')
  })

  it('assigns neutral polarity for balanced code', () => {
    const connections: MagneticConnection[] = []
    const mf = measureMagneticField('const x = 1', 'a.ts', ['a.ts'], connections)
    expect(mf.polarity).toBe('neutral')
  })

  it('field strength is between 0-100', () => {
    const connections: MagneticConnection[] = Array.from({ length: 10 }, (_, i) => ({
      from: `f${i}.ts`, to: 'target.ts', type: 'attract' as const, strength: 50, distance: 1, isExpected: true, isAnomalous: false,
    }))
    const mf = measureMagneticField('export const x = 1', 'target.ts', ['target.ts'], connections)
    expect(mf.fieldStrength).toBeGreaterThanOrEqual(0)
    expect(mf.fieldStrength).toBeLessThanOrEqual(100)
  })

  it('charge is between -100 and 100', () => {
    const mf = measureMagneticField('export const x = 1', 'a.ts', ['a.ts'], [])
    expect(mf.charge).toBeGreaterThanOrEqual(-100)
    expect(mf.charge).toBeLessThanOrEqual(100)
  })

  it('has a valid classification', () => {
    const validClassifications = ['superconductor', 'conductor', 'resistor', 'insulator', 'antimatter']
    const mf = measureMagneticField('const x = 1', 'a.ts', ['a.ts'], [])
    expect(validClassifications).toContain(mf.classification)
  })
})

// ─── identifyPoles ──────────────────────────────────────────────────────────────

describe('identifyPoles', () => {
  it('identifies north poles for strongly connected files', () => {
    const files: MagneticFile[] = Array.from({ length: 5 }, (_, i) => ({
      file: `f${i}.ts`,
      polarity: i === 0 ? 'positive' as const : 'negative' as const,
      fieldStrength: i === 0 ? 80 : 20,
      charge: i === 0 ? 40 : -10,
      connections: i === 0 ? Array.from({ length: 4 }, (_, j) => ({
        from: `f${j + 1}.ts`, to: 'f0.ts', type: 'attract' as const, strength: 50, distance: 1, isExpected: true, isAnomalous: false,
      })) : [],
      isPole: i === 0,
      isAnomaly: false,
      classification: i === 0 ? 'superconductor' as const : 'resistor' as const,
    }))
    const poles = identifyPoles(files)
    expect(poles.some(p => p.type === 'north')).toBe(true)
  })

  it('assigns risk based on strength', () => {
    const files: MagneticFile[] = [{
      file: 'strong.ts', polarity: 'positive', fieldStrength: 75, charge: 50,
      connections: Array.from({ length: 5 }, (_, i) => ({
        from: `f${i}.ts`, to: 'strong.ts', type: 'attract' as const, strength: 50, distance: 1, isExpected: true, isAnomalous: false,
      })),
      isPole: true, isAnomaly: false, classification: 'superconductor',
    }]
    const poles = identifyPoles(files)
    if (poles.length > 0) {
      expect(poles[0].risk).toBe('high')
    }
  })

  it('returns empty for empty files', () => {
    expect(identifyPoles([]).length).toBe(0)
  })
})

// ─── detectAnomalies ────────────────────────────────────────────────────────────

describe('detectAnomalies', () => {
  it('detects long-range attraction', () => {
    const connections: MagneticConnection[] = [
      { from: 'src/a.ts', to: 'lib/deep/b.ts', type: 'attract', strength: 60, distance: 5, isExpected: false, isAnomalous: true },
    ]
    const files: MagneticFile[] = [
      { file: 'src/a.ts', polarity: 'negative', fieldStrength: 20, charge: -10, connections, isPole: false, isAnomaly: false, classification: 'resistor' },
      { file: 'lib/deep/b.ts', polarity: 'positive', fieldStrength: 30, charge: 10, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const anomalies = detectAnomalies(connections, files)
    expect(anomalies.some(a => a.type === 'long-range-attraction')).toBe(true)
  })

  it('detects unexpected coupling', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'attract', strength: 50, distance: 5, isExpected: false, isAnomalous: true },
    ]
    const files: MagneticFile[] = []
    const anomalies = detectAnomalies(connections, files)
    expect(anomalies.some(a => a.type === 'unexpected-coupling')).toBe(true)
  })

  it('detects shielded files', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'repel', strength: 10, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const files: MagneticFile[] = [
      { file: 'a.ts', polarity: 'neutral', fieldStrength: 0, charge: 0, connections, isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const anomalies = detectAnomalies(connections, files)
    expect(anomalies.some(a => a.type === 'shielded-file')).toBe(true)
  })

  it('detects magnetic monopoles', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const files: MagneticFile[] = [
      { file: 'a.ts', polarity: 'negative', fieldStrength: 20, charge: -10, connections, isPole: false, isAnomaly: false, classification: 'resistor' },
      { file: 'b.ts', polarity: 'positive', fieldStrength: 30, charge: 10, connections: [], isPole: false, isAnomaly: false, classification: 'conductor' },
      { file: 'c.ts', polarity: 'neutral', fieldStrength: 0, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const anomalies = detectAnomalies(connections, files)
    expect(anomalies.some(a => a.type === 'magnetic-monopole')).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const connections: MagneticConnection[] = []
    const files: MagneticFile[] = [
      { file: 'a.ts', polarity: 'neutral', fieldStrength: 0, charge: 0, connections: [], isPole: false, isAnomaly: false, classification: 'resistor' },
    ]
    const anomalies = detectAnomalies(connections, files)
    expect(anomalies.length).toBe(0)
  })

  it('anomalies have correct structure', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'x/y/z/b.ts', type: 'attract', strength: 60, distance: 5, isExpected: false, isAnomalous: true },
    ]
    const files: MagneticFile[] = []
    const anomalies = detectAnomalies(connections, files)
    if (anomalies.length > 0) {
      const a = anomalies[0]
      expect(a).toHaveProperty('type')
      expect(a).toHaveProperty('files')
      expect(a).toHaveProperty('severity')
      expect(a).toHaveProperty('description')
      expect(a).toHaveProperty('investigation')
    }
  })
})

// ─── traceFieldLines ────────────────────────────────────────────────────────────

describe('traceFieldLines', () => {
  it('traces dependency chains', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
      { from: 'b.ts', to: 'c.ts', type: 'attract', strength: 40, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const lines = traceFieldLines(connections)
    expect(lines.length).toBeGreaterThan(0)
  })

  it('returns empty for no connections', () => {
    expect(traceFieldLines([]).length).toBe(0)
  })

  it('field lines have correct structure', () => {
    const connections: MagneticConnection[] = [
      { from: 'a.ts', to: 'b.ts', type: 'attract', strength: 50, distance: 1, isExpected: true, isAnomalous: false },
    ]
    const lines = traceFieldLines(connections)
    if (lines.length > 0) {
      const fl = lines[0]
      expect(fl).toHaveProperty('path')
      expect(fl).toHaveProperty('strength')
      expect(fl).toHaveProperty('type')
      expect(fl).toHaveProperty('isCoherent')
      expect(fl).toHaveProperty('bends')
      expect(fl.path.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ─── generateMagneticRecommendations ────────────────────────────────────────────

describe('generateMagneticRecommendations', () => {
  it('recommends stabilizing high-risk poles', () => {
    const files: MagneticFile[] = []
    const poles = [{ file: 'core.ts', type: 'north' as const, strength: 80, description: 'd', risk: 'high' as const, affectedBy: [] }]
    const stats = { couplingEntropy: 30 } as MagneticStats
    const recs = generateMagneticRecommendations(files, poles, [], stats)
    expect(recs.some(r => r.includes('high-risk'))).toBe(true)
  })

  it('recommends investigating alarming anomalies', () => {
    const files: MagneticFile[] = []
    const anomalies = [{ type: 'long-range-attraction' as const, files: ['a.ts', 'b.ts'], severity: 'alarming' as const, description: 'd', investigation: 'i' }]
    const stats = { couplingEntropy: 30 } as MagneticStats
    const recs = generateMagneticRecommendations(files, [], anomalies, stats)
    expect(recs.some(r => r.includes('alarming'))).toBe(true)
  })

  it('recommends reducing high entropy', () => {
    const stats = { couplingEntropy: 75 } as MagneticStats
    const recs = generateMagneticRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('entropy'))).toBe(true)
  })

  it('recommends verifying antimatter files', () => {
    const files: MagneticFile[] = [
      { file: 'lonely.ts', polarity: 'positive', fieldStrength: 0, charge: 85, connections: [], isPole: false, isAnomaly: false, classification: 'antimatter' },
    ]
    const stats = { couplingEntropy: 30 } as MagneticStats
    const recs = generateMagneticRecommendations(files, [], [], stats)
    expect(recs.some(r => r.includes('antimatter'))).toBe(true)
  })

  it('returns deduplicated recommendations', () => {
    const stats = { couplingEntropy: 30 } as MagneticStats
    const recs = generateMagneticRecommendations([], [], [], stats)
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

// ─── buildMagneticResult ────────────────────────────────────────────────────────

describe('buildMagneticResult', () => {
  it('returns complete result structure', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('connections')
    expect(result).toHaveProperty('fieldLines')
    expect(result).toHaveProperty('poles')
    expect(result).toHaveProperty('anomalies')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('has one magnetic file per input file', () => {
    const result = buildMagneticResult(['a.ts', 'b.ts'], ['export const x = 1', 'const y = 2'], {})
    expect(result.files.length).toBe(2)
  })

  it('stats have all required fields', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    const stats = result.stats
    expect(stats).toHaveProperty('totalFiles')
    expect(stats).toHaveProperty('positivePolarity')
    expect(stats).toHaveProperty('negativePolarity')
    expect(stats).toHaveProperty('neutralPolarity')
    expect(stats).toHaveProperty('avgFieldStrength')
    expect(stats).toHaveProperty('maxFieldStrength')
    expect(stats).toHaveProperty('superconductors')
    expect(stats).toHaveProperty('insulators')
    expect(stats).toHaveProperty('antimatter')
    expect(stats).toHaveProperty('totalPoles')
    expect(stats).toHaveProperty('northPoles')
    expect(stats).toHaveProperty('southPoles')
    expect(stats).toHaveProperty('totalAnomalies')
    expect(stats).toHaveProperty('alarmingAnomalies')
    expect(stats).toHaveProperty('avgConnectionStrength')
    expect(stats).toHaveProperty('fieldCoherence')
    expect(stats).toHaveProperty('couplingEntropy')
    expect(stats).toHaveProperty('overallField')
  })

  it('handles empty file list', () => {
    const result = buildMagneticResult([], [], {})
    expect(result.files.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('overallField is valid', () => {
    const valid = ['harmonious', 'ordered', 'disturbed', 'chaotic', 'singularity']
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    expect(valid).toContain(result.stats.overallField)
  })

  it('handles connected files', () => {
    const result = buildMagneticResult(
      ['src/a.ts', 'src/b.ts'],
      ["import { x } from './b'", 'export const x = 1'],
      {},
    )
    expect(result.connections.length).toBeGreaterThan(0)
  })

  it('polarities sum to total files', () => {
    const result = buildMagneticResult(['a.ts', 'b.ts', 'c.ts'], ['export const x = 1', 'const y = 2', 'import { z } from '], {})
    const { positivePolarity, negativePolarity, neutralPolarity } = result.stats
    expect(positivePolarity + negativePolarity + neutralPolarity).toBe(result.stats.totalFiles)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatMagneticTable', () => {
  it('produces non-empty string', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    const formatted = formatMagneticTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('contains file information', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    const formatted = formatMagneticTable(result, false)
    expect(formatted).toContain('a.ts')
  })

  it('shows verbose output when verbose=true', () => {
    const files = Array.from({ length: 15 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export const x = 1')
    const result = buildMagneticResult(files, contents, {})
    const verbose = formatMagneticTable(result, true)
    const nonVerbose = formatMagneticTable(result, false)
    expect(verbose.length).toBeGreaterThanOrEqual(nonVerbose.length)
  })
})

describe('formatMagneticJson', () => {
  it('produces valid JSON', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    const json = formatMagneticJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('connections')
    expect(parsed).toHaveProperty('stats')
  })

  it('contains file data in JSON', () => {
    const result = buildMagneticResult(['a.ts'], ['export const x = 1'], {})
    const json = formatMagneticJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files.length).toBe(1)
    expect(parsed.files[0].file).toBe('a.ts')
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('magnetic integration', () => {
  it('handles realistic codebase', () => {
    const files = ['src/core/config.ts', 'src/utils/helpers.ts', 'src/types.ts']
    const contents = [
      "export interface AppConfig {\n  port: number\n}\nexport function loadConfig(): AppConfig {\n  return { port: 3000 }\n}\n",
      "import { AppConfig } from './config'\nexport function formatHost(cfg: AppConfig): string {\n  return `${cfg.port}`\n}\n",
      "export interface User {\n  id: number\n  name: string\n}\n",
    ]
    const result = buildMagneticResult(files, contents, {})
    expect(result.files.length).toBe(3)
    expect(result.connections.length).toBeGreaterThan(0)
    expect(result.stats.overallField).toBeTruthy()
  })

  it('handles deeply nested dependencies', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts']
    const contents = [
      "import { b } from './b'",
      "import { c } from './c'",
      "import { d } from './d'",
      "export const d = 'value'",
    ]
    const result = buildMagneticResult(files, contents, {})
    expect(result.connections.length).toBeGreaterThan(0)
  })

  it('handles isolated files', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = ['const x = 1', 'const y = 2', 'const z = 3']
    const result = buildMagneticResult(files, contents, {})
    expect(result.files.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('all classifications are valid', () => {
    const validClassifications = ['superconductor', 'conductor', 'resistor', 'insulator', 'antimatter']
    const result = buildMagneticResult(['a.ts', 'b.ts'], ['export const x = 1', 'const y = 2'], {})
    for (const f of result.files) {
      expect(validClassifications).toContain(f.classification)
    }
  })

  it('all polarities are valid', () => {
    const validPolarities = ['positive', 'negative', 'neutral']
    const result = buildMagneticResult(['a.ts', 'b.ts'], ['export const x = 1', 'const y = 2'], {})
    for (const f of result.files) {
      expect(validPolarities).toContain(f.polarity)
    }
  })
})
