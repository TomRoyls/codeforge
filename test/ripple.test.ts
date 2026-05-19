import { describe, expect, it } from 'vitest'
import {
  buildDependencyGraph,
  buildRippleResult,
  classifyRisk,
  computeRippleScore,
  computeRippleWaves,
  computeTransitiveDependents,
  estimateEffort,
  estimateTestingEffort,
  findRippleHotspots,
  generateRecommendations,
  simulateRipple,
  type FileDepGraph,
  type RippleNode,
  type RippleStats,
  type RippleWave,
} from '../src/commands/ripple-helpers.js'
import {
  effortBadge,
  formatHotspotRow,
  formatHotspotTable,
  formatRippleJson,
  formatRippleReport,
  formatStats,
  formatWaveCircle,
  formatRecommendations,
  formatSimulation,
  riskBadge,
  rippleScoreMeter,
} from '../src/commands/ripple-format-helpers.js'

// ─── buildDependencyGraph ─────────────────────────────────────────────────────

describe('buildDependencyGraph', () => {
  it('creates empty graph from no files', () => {
    const graph = buildDependencyGraph([], [])
    expect(graph.files.size).toBe(0)
  })

  it('registers all files', () => {
    const graph = buildDependencyGraph(['a.ts', 'b.ts'], ['', ''])
    expect(graph.files.size).toBe(2)
  })

  it('builds import edges for relative imports', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', ''],
    )
    expect(graph.imports.get('a.ts')!.has('b.ts')).toBe(true)
    expect(graph.importedBy.get('b.ts')!.has('a.ts')).toBe(true)
  })

  it('ignores non-relative imports', () => {
    const graph = buildDependencyGraph(
      ['a.ts'],
      ['import { z } from "lodash"'],
    )
    expect(graph.imports.get('a.ts')!.size).toBe(0)
  })

  it('handles subdirectory imports', () => {
    const graph = buildDependencyGraph(
      ['src/a.ts', 'src/b.ts'],
      ['import { x } from "./b"', ''],
    )
    expect(graph.imports.get('src/a.ts')!.has('src/b.ts')).toBe(true)
  })

  it('handles parent directory imports', () => {
    const graph = buildDependencyGraph(
      ['src/a.ts', 'b.ts'],
      ['import { x } from "../b"', ''],
    )
    expect(graph.imports.get('src/a.ts')!.has('b.ts')).toBe(true)
  })

  it('handles type-only imports', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['import type { X } from "./b"', ''],
    )
    expect(graph.imports.get('a.ts')!.has('b.ts')).toBe(true)
  })

  it('handles namespace imports', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['import * as B from "./b"', ''],
    )
    expect(graph.imports.get('a.ts')!.has('b.ts')).toBe(true)
  })
})

// ─── computeRippleWaves ───────────────────────────────────────────────────────

describe('computeRippleWaves', () => {
  it('returns empty waves for isolated file', () => {
    const graph = buildDependencyGraph(['a.ts'], [''])
    const waves = computeRippleWaves('a.ts', graph)
    expect(waves).toEqual([])
  })

  it('computes single wave for direct dependents', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['', 'import { x } from "./a"'],
    )
    const waves = computeRippleWaves('a.ts', graph)
    expect(waves.length).toBe(1)
    expect(waves[0].level).toBe(1)
    expect(waves[0].files).toContain('b.ts')
  })

  it('computes multiple waves for transitive deps', () => {
    const graph = buildDependencyGraph(
      ['core.ts', 'mid.ts', 'app.ts'],
      [
        '',
        'import { x } from "./core"',
        'import { y } from "./mid"',
      ],
    )
    const waves = computeRippleWaves('core.ts', graph)
    expect(waves.length).toBe(2)
    expect(waves[0].level).toBe(1)
    expect(waves[0].files).toContain('mid.ts')
    expect(waves[1].level).toBe(2)
    expect(waves[1].files).toContain('app.ts')
  })

  it('respects maxDepth parameter', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./b"'],
    )
    const waves = computeRippleWaves('a.ts', graph, 1)
    expect(waves.length).toBe(1)
  })

  it('includes totalFiles in each wave', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./a"'],
    )
    const waves = computeRippleWaves('a.ts', graph)
    expect(waves[0].totalFiles).toBe(2)
  })

  it('includes description in each wave', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['', 'import { x } from "./a"'],
    )
    const waves = computeRippleWaves('a.ts', graph)
    expect(waves[0].description).toContain('Wave 1')
  })
})

// ─── computeTransitiveDependents ──────────────────────────────────────────────

describe('computeTransitiveDependents', () => {
  it('returns empty for isolated file', () => {
    const graph = buildDependencyGraph(['a.ts'], [''])
    expect(computeTransitiveDependents('a.ts', graph)).toEqual([])
  })

  it('returns direct dependents', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts'],
      ['', 'import { x } from "./a"'],
    )
    const deps = computeTransitiveDependents('a.ts', graph)
    expect(deps).toContain('b.ts')
  })

  it('returns transitive dependents', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./b"'],
    )
    const deps = computeTransitiveDependents('a.ts', graph)
    expect(deps).toContain('b.ts')
    expect(deps).toContain('c.ts')
    expect(deps.length).toBe(2)
  })
})

// ─── computeRippleScore ───────────────────────────────────────────────────────

describe('computeRippleScore', () => {
  it('returns 0 for no dependents', () => {
    expect(computeRippleScore(0, 0, 10, 20)).toBe(0)
  })

  it('caps at 100', () => {
    expect(computeRippleScore(10, 20, 10, 20)).toBe(100)
  })

  it('weights transitive more than direct', () => {
    const directOnly = computeRippleScore(10, 0, 10, 10)
    const transitiveOnly = computeRippleScore(0, 10, 10, 10)
    expect(transitiveOnly).toBeGreaterThan(directOnly)
  })

  it('computes proportional score', () => {
    const score = computeRippleScore(5, 10, 10, 20)
    expect(score).toBe(50)
  })
})

// ─── classifyRisk ─────────────────────────────────────────────────────────────

describe('classifyRisk', () => {
  it('classifies minimal risk', () => {
    expect(classifyRisk(5)).toBe('minimal')
  })

  it('classifies low risk', () => {
    expect(classifyRisk(20)).toBe('low')
  })

  it('classifies medium risk', () => {
    expect(classifyRisk(40)).toBe('medium')
  })

  it('classifies high risk', () => {
    expect(classifyRisk(60)).toBe('high')
  })

  it('classifies critical risk', () => {
    expect(classifyRisk(80)).toBe('critical')
  })

  it('classifies boundary at 15', () => {
    expect(classifyRisk(14)).toBe('minimal')
    expect(classifyRisk(15)).toBe('low')
  })

  it('classifies boundary at 75', () => {
    expect(classifyRisk(74)).toBe('high')
    expect(classifyRisk(75)).toBe('critical')
  })
})

// ─── estimateEffort ───────────────────────────────────────────────────────────

describe('estimateEffort', () => {
  it('estimates trivial for small changes', () => {
    expect(estimateEffort(0, 0)).toBe('trivial')
  })

  it('estimates easy for minor changes', () => {
    expect(estimateEffort(1, 1)).toBe('easy')
  })

  it('estimates moderate for medium changes', () => {
    expect(estimateEffort(4, 2)).toBe('moderate')
  })

  it('estimates difficult for large changes', () => {
    expect(estimateEffort(10, 3)).toBe('difficult')
  })

  it('estimates major-refactor for huge changes', () => {
    expect(estimateEffort(20, 5)).toBe('major-refactor')
  })
})

// ─── estimateTestingEffort ────────────────────────────────────────────────────

describe('estimateTestingEffort', () => {
  it('returns no testing for empty waves', () => {
    expect(estimateTestingEffort([])).toContain('No additional testing')
  })

  it('estimates quick smoke tests for small waves', () => {
    const waves: RippleWave[] = [{ level: 1, files: ['a.ts'], totalFiles: 1, description: 'Wave 1' }]
    expect(estimateTestingEffort(waves)).toContain('smoke tests')
  })

  it('estimates test count for medium waves', () => {
    const waves: RippleWave[] = [{ level: 1, files: ['a.ts', 'b.ts', 'c.ts'], totalFiles: 3, description: 'Wave 1' }]
    expect(estimateTestingEffort(waves)).toContain('3 files')
  })

  it('estimates thorough testing for larger waves', () => {
    const waves: RippleWave[] = [
      { level: 1, files: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'], totalFiles: 6, description: 'Wave 1' },
    ]
    expect(estimateTestingEffort(waves)).toContain('Thorough testing')
  })

  it('estimates full regression for many files', () => {
    const waves: RippleWave[] = [
      { level: 1, files: Array.from({ length: 16 }, (_, i) => `f${i}.ts`), totalFiles: 16, description: 'Wave 1' },
    ]
    expect(estimateTestingEffort(waves)).toContain('Full regression')
  })
})

// ─── findRippleHotspots ───────────────────────────────────────────────────────

describe('findRippleHotspots', () => {
  it('returns all files as hotspots', () => {
    const graph = buildDependencyGraph(['a.ts', 'b.ts'], ['', ''])
    const hotspots = findRippleHotspots(graph)
    expect(hotspots.length).toBe(2)
  })

  it('sorts by ripple score descending', () => {
    const graph = buildDependencyGraph(
      ['core.ts', 'mid.ts', 'app.ts'],
      ['', 'import { x } from "./core"', 'import { y } from "./mid"'],
    )
    const hotspots = findRippleHotspots(graph)
    for (let i = 1; i < hotspots.length; i++) {
      expect(hotspots[i - 1].rippleScore).toBeGreaterThanOrEqual(hotspots[i].rippleScore)
    }
  })

  it('computes correct direct dependents', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./a"'],
    )
    const hotspots = findRippleHotspots(graph)
    const aNode = hotspots.find((h) => h.file === 'a.ts')!
    expect(aNode.directDependents).toBe(2)
  })

  it('computes correct transitive dependents', () => {
    const graph = buildDependencyGraph(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./b"'],
    )
    const hotspots = findRippleHotspots(graph)
    const aNode = hotspots.find((h) => h.file === 'a.ts')!
    expect(aNode.transitiveDependents).toBe(2)
  })

  it('assigns risk levels', () => {
    const graph = buildDependencyGraph(['a.ts'], [''])
    const hotspots = findRippleHotspots(graph)
    expect(['minimal', 'low', 'medium', 'high', 'critical']).toContain(hotspots[0].riskLevel)
  })
})

// ─── simulateRipple ───────────────────────────────────────────────────────────

describe('simulateRipple', () => {
  it('returns simulation for isolated file', () => {
    const graph = buildDependencyGraph(['a.ts'], [''])
    const sim = simulateRipple('a.ts', graph)
    expect(sim.totalAffected).toBe(0)
    expect(sim.maxDepth).toBe(0)
    expect(sim.waves).toEqual([])
    expect(sim.estimatedEffort).toBe('trivial')
  })

  it('returns simulation for connected file', () => {
    const graph = buildDependencyGraph(
      ['core.ts', 'mid.ts', 'app.ts'],
      ['', 'import { x } from "./core"', 'import { y } from "./mid"'],
    )
    const sim = simulateRipple('core.ts', graph)
    expect(sim.totalAffected).toBe(2)
    expect(sim.maxDepth).toBe(2)
    expect(sim.waves.length).toBe(2)
  })

  it('computes affected modules', () => {
    const graph = buildDependencyGraph(
      ['src/core.ts', 'src/app.ts'],
      ['', 'import { x } from "./core"'],
    )
    const sim = simulateRipple('src/core.ts', graph)
    expect(sim.affectedModules).toContain('src')
  })

  it('computes testing effort', () => {
    const graph = buildDependencyGraph(['a.ts'], [''])
    const sim = simulateRipple('a.ts', graph)
    expect(sim.testingEffort).toContain('No additional testing')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: RippleStats = {
    totalFiles: 5,
    averageRippleScore: 20,
    maxRippleScore: 30,
    criticalFiles: 0,
    highRiskFiles: 0,
    lowRiskFiles: 3,
    mostIsolatedFile: 'd.ts',
    mostConnectedFile: 'a.ts',
  }

  it('recommends well-decoupled when healthy', () => {
    const recs = generateRecommendations([], baseStats)
    expect(recs).toEqual(['All files have minimal ripple — codebase is well-decoupled'])
  })

  it('warns about critical files', () => {
    const hotspots: RippleNode[] = [
      { file: 'core.ts', function: '*', directDependents: 10, transitiveDependents: 20, rippleScore: 85, riskLevel: 'critical', ripplePath: [] },
    ]
    const recs = generateRecommendations(hotspots, baseStats)
    expect(recs.some((r) => r.includes('critical ripple'))).toBe(true)
  })

  it('suggests decoupling high-risk files', () => {
    const hotspots: RippleNode[] = [
      { file: 'shared.ts', function: '*', directDependents: 5, transitiveDependents: 10, rippleScore: 60, riskLevel: 'high', ripplePath: [] },
    ]
    const recs = generateRecommendations(hotspots, baseStats)
    expect(recs.some((r) => r.includes('decoupling'))).toBe(true)
  })

  it('identifies safe-to-change files', () => {
    const hotspots: RippleNode[] = [
      { file: 'util.ts', function: '*', directDependents: 0, transitiveDependents: 0, rippleScore: 5, riskLevel: 'minimal', ripplePath: [] },
    ]
    const recs = generateRecommendations(hotspots, baseStats)
    expect(recs.some((r) => r.includes('safe to change freely'))).toBe(true)
  })

  it('warns about high max ripple score', () => {
    const stats = { ...baseStats, maxRippleScore: 70 }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('Highest ripple'))).toBe(true)
  })
})

// ─── buildRippleResult ────────────────────────────────────────────────────────

describe('buildRippleResult', () => {
  it('returns empty result for no files', () => {
    const result = buildRippleResult([], [])
    expect(result.simulations).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns complete result with imports', () => {
    const result = buildRippleResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['', 'import { x } from "./a"', 'import { y } from "./b"'],
    )
    expect(result.simulations.length).toBe(3)
    expect(result.hotspots.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes correct stats', () => {
    const result = buildRippleResult(
      ['a.ts', 'b.ts'],
      ['', 'import { x } from "./a"'],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.mostConnectedFile).toBeTruthy()
    expect(result.stats.mostIsolatedFile).toBeTruthy()
  })

  it('counts risk categories', () => {
    const result = buildRippleResult(
      ['a.ts', 'b.ts'],
      ['', 'import { x } from "./a"'],
    )
    expect(result.stats.criticalFiles + result.stats.highRiskFiles + result.stats.lowRiskFiles).toBeLessThanOrEqual(result.stats.totalFiles)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('riskBadge', () => {
  it('formats critical badge', () => {
    expect(riskBadge('critical')).toContain('CRITICAL')
  })

  it('formats high badge', () => {
    expect(riskBadge('high')).toContain('HIGH')
  })

  it('formats medium badge', () => {
    expect(riskBadge('medium')).toContain('MEDIUM')
  })

  it('formats low badge', () => {
    expect(riskBadge('low')).toContain('LOW')
  })

  it('formats minimal badge', () => {
    expect(riskBadge('minimal')).toContain('MINIMAL')
  })
})

describe('effortBadge', () => {
  it('formats major-refactor badge', () => {
    expect(effortBadge('major-refactor')).toContain('major-refactor')
  })

  it('formats trivial badge', () => {
    expect(effortBadge('trivial')).toContain('trivial')
  })
})

describe('rippleScoreMeter', () => {
  it('shows score in meter', () => {
    const meter = rippleScoreMeter(50)
    expect(meter).toContain('50')
  })

  it('shows full meter for 100', () => {
    const meter = rippleScoreMeter(100)
    expect(meter).toContain('100')
  })
})

describe('formatWaveCircle', () => {
  it('shows isolated for no waves', () => {
    const output = formatWaveCircle([], 'a.ts')
    expect(output).toContain('No ripple')
  })

  it('shows wave levels', () => {
    const waves: RippleWave[] = [{ level: 1, files: ['b.ts'], totalFiles: 1, description: 'Wave 1' }]
    const output = formatWaveCircle(waves, 'a.ts')
    expect(output).toContain('Wave 1')
    expect(output).toContain('b.ts')
  })
})

describe('formatHotspotRow', () => {
  it('formats a hotspot row', () => {
    const node: RippleNode = {
      file: 'core.ts', function: '*', directDependents: 5, transitiveDependents: 10,
      rippleScore: 60, riskLevel: 'high', ripplePath: [],
    }
    const row = formatHotspotRow(node)
    expect(row).toContain('core.ts')
    expect(row).toContain('60')
  })
})

describe('formatHotspotTable', () => {
  it('formats table with header', () => {
    const nodes: RippleNode[] = [
      { file: 'a.ts', function: '*', directDependents: 0, transitiveDependents: 0, rippleScore: 0, riskLevel: 'minimal', ripplePath: [] },
    ]
    const table = formatHotspotTable(nodes)
    expect(table).toContain('File')
    expect(table).toContain('a.ts')
  })
})

describe('formatSimulation', () => {
  it('formats simulation summary', () => {
    const graph = buildDependencyGraph(['a.ts', 'b.ts'], ['', 'import { x } from "./a"'])
    const sim = simulateRipple('a.ts', graph)
    const output = formatSimulation(sim, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Affected')
  })

  it('includes wave details in verbose mode', () => {
    const graph = buildDependencyGraph(['a.ts', 'b.ts'], ['', 'import { x } from "./a"'])
    const sim = simulateRipple('a.ts', graph)
    const output = formatSimulation(sim, true)
    expect(output).toContain('Ripple Waves')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: RippleStats = {
      totalFiles: 10, averageRippleScore: 25.5, maxRippleScore: 80,
      criticalFiles: 2, highRiskFiles: 3, lowRiskFiles: 5,
      mostIsolatedFile: 'd.ts', mostConnectedFile: 'a.ts',
    }
    const output = formatStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('25.5')
    expect(output).toContain('80')
    expect(output).toContain('d.ts')
    expect(output).toContain('a.ts')
  })
})

describe('formatRecommendations', () => {
  it('formats numbered recommendations', () => {
    const output = formatRecommendations(['Fix A', 'Fix B'])
    expect(output).toContain('1.')
    expect(output).toContain('2.')
    expect(output).toContain('Fix A')
  })
})

describe('formatRippleReport', () => {
  it('formats full report', () => {
    const result = buildRippleResult(['a.ts', 'b.ts'], ['', 'import { x } from "./a"'])
    const report = formatRippleReport(result, false)
    expect(report).toContain('Ripple Analysis Statistics')
    expect(report).toContain('Recommendations')
  })
})

describe('formatRippleJson', () => {
  it('outputs valid JSON', () => {
    const result = buildRippleResult(['a.ts'], [''])
    const json = formatRippleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.simulations).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
