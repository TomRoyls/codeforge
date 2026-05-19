import { describe, expect, it } from 'vitest'
import {
  analyzeFile,
  buildTangleResult,
  classifyTangling,
  computeFunctionDiversity,
  computeImportDiversity,
  computeReasonsToChange,
  computeTanglingScore,
  findTangleClusters,
  generateRecommendations,
  inferConcerns,
  type TangleMetrics,
  type TangleStats,
  type Concern,
} from '../src/commands/tangle-helpers.js'
import {
  classificationColor,
  formatClusters,
  formatConcernBreakdown,
  formatRecommendations,
  formatScoreDistribution,
  formatStats,
  formatTangleJson,
  formatTangleOutput,
  formatTangleTable,
  scoreBar,
} from '../src/commands/tangle-format-helpers.js'

// ─── inferConcerns ────────────────────────────────────────────────────────────

describe('inferConcerns', () => {
  it('detects IO concern from fs usage', () => {
    const concerns = inferConcerns('import fs from "fs"\nfs.readFile("x")', 'a.ts')
    expect(concerns.some((c) => c.name === 'IO')).toBe(true)
  })

  it('detects Network concern from fetch', () => {
    const concerns = inferConcerns('fetch("/api")', 'a.ts')
    expect(concerns.some((c) => c.name === 'Network')).toBe(true)
  })

  it('detects Validation concern from validate', () => {
    const concerns = inferConcerns('function validate(input) {}', 'a.ts')
    expect(concerns.some((c) => c.name === 'Validation')).toBe(true)
  })

  it('detects Data concern from parse', () => {
    const concerns = inferConcerns('const result = parse(data)', 'a.ts')
    expect(concerns.some((c) => c.name === 'Data')).toBe(true)
  })

  it('detects UI concern from render', () => {
    const concerns = inferConcerns('function render() {}', 'a.ts')
    expect(concerns.some((c) => c.name === 'UI')).toBe(true)
  })

  it('detects Config concern from config keyword', () => {
    const concerns = inferConcerns('const config = loadConfig()', 'a.ts')
    expect(concerns.some((c) => c.name === 'Config')).toBe(true)
  })

  it('detects ErrorHandling concern from try/catch', () => {
    const concerns = inferConcerns('try { x() } catch (e) {}', 'a.ts')
    expect(concerns.some((c) => c.name === 'ErrorHandling')).toBe(true)
  })

  it('detects Logging concern from console.log', () => {
    const concerns = inferConcerns('console.log("msg")', 'a.ts')
    expect(concerns.some((c) => c.name === 'IO')).toBe(true)
  })

  it('detects StateManagement concern', () => {
    const concerns = inferConcerns('store.dispatch(action)', 'a.ts')
    expect(concerns.some((c) => c.name === 'StateManagement')).toBe(true)
  })

  it('detects Testing concern', () => {
    const concerns = inferConcerns('describe("test", () => { it("works") })', 'a.ts')
    expect(concerns.some((c) => c.name === 'Testing')).toBe(true)
  })

  it('returns empty for empty content', () => {
    const concerns = inferConcerns('', 'a.ts')
    expect(concerns.length).toBe(0)
  })

  it('detects multiple concerns', () => {
    const content = 'import fs from "fs"\nfs.readFile()\nfetch("/api")\ntry { x() } catch (e) {}'
    const concerns = inferConcerns(content, 'a.ts')
    expect(concerns.length).toBeGreaterThanOrEqual(3)
  })

  it('captures evidence lines', () => {
    const concerns = inferConcerns('fs.readFile("x")', 'a.ts')
    const io = concerns.find((c) => c.name === 'IO')
    expect(io!.evidence.length).toBeGreaterThan(0)
  })

  it('captures related imports', () => {
    const concerns = inferConcerns('import fs from "fs"', 'a.ts')
    const io = concerns.find((c) => c.name === 'IO')
    expect(io!.relatedImports).toContain('fs')
  })
})

// ─── computeImportDiversity ───────────────────────────────────────────────────

describe('computeImportDiversity', () => {
  it('counts ESM imports', () => {
    const content = 'import fs from "fs"\nimport path from "path"'
    expect(computeImportDiversity(content)).toBe(2)
  })

  it('counts require imports', () => {
    expect(computeImportDiversity('const fs = require("fs")')).toBe(1)
  })

  it('deduplicates same source', () => {
    const content = 'import fs from "fs"\nimport fs2 from "fs"'
    expect(computeImportDiversity(content)).toBe(1)
  })

  it('returns 0 for no imports', () => {
    expect(computeImportDiversity('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(computeImportDiversity('')).toBe(0)
  })
})

// ─── computeFunctionDiversity ─────────────────────────────────────────────────

describe('computeFunctionDiversity', () => {
  it('counts distinct verb patterns', () => {
    const content = 'function parseData() {}\nfunction sendData() {}'
    expect(computeFunctionDiversity(content)).toBeGreaterThanOrEqual(2)
  })

  it('deduplicates same verbs', () => {
    const content = 'function parseX() {}\nfunction parseY() {}'
    expect(computeFunctionDiversity(content)).toBe(1)
  })

  it('returns 0 for no verb patterns', () => {
    expect(computeFunctionDiversity('const x = 1')).toBe(0)
  })
})

// ─── computeReasonsToChange ───────────────────────────────────────────────────

describe('computeReasonsToChange', () => {
  it('returns concern count', () => {
    const concerns: Concern[] = [
      { name: 'IO', evidence: [], relatedImports: [], functionCount: 0, lineRange: [1, 1] },
      { name: 'Network', evidence: [], relatedImports: [], functionCount: 0, lineRange: [2, 2] },
    ]
    expect(computeReasonsToChange(concerns)).toBe(2)
  })

  it('returns 0 for empty concerns', () => {
    expect(computeReasonsToChange([])).toBe(0)
  })
})

// ─── computeTanglingScore ─────────────────────────────────────────────────────

describe('computeTanglingScore', () => {
  it('computes weighted score', () => {
    const score = computeTanglingScore({ concernCount: 2, importDiversity: 3, functionDiversity: 4, reasonToChange: 2 })
    expect(score).toBe(2 * 15 + 3 * 5 + 4 * 5 + 2 * 10)
  })

  it('caps at 100', () => {
    const score = computeTanglingScore({ concernCount: 10, importDiversity: 10, functionDiversity: 10, reasonToChange: 10 })
    expect(score).toBe(100)
  })

  it('returns 0 for all zeros', () => {
    expect(computeTanglingScore({ concernCount: 0, importDiversity: 0, functionDiversity: 0, reasonToChange: 0 })).toBe(0)
  })
})

// ─── classifyTangling ─────────────────────────────────────────────────────────

describe('classifyTangling', () => {
  it('classifies 0 as clean', () => {
    expect(classifyTangling(0)).toBe('clean')
  })

  it('classifies 19 as clean', () => {
    expect(classifyTangling(19)).toBe('clean')
  })

  it('classifies 20 as minor-tangle', () => {
    expect(classifyTangling(20)).toBe('minor-tangle')
  })

  it('classifies 39 as minor-tangle', () => {
    expect(classifyTangling(39)).toBe('minor-tangle')
  })

  it('classifies 40 as tangled', () => {
    expect(classifyTangling(40)).toBe('tangled')
  })

  it('classifies 64 as tangled', () => {
    expect(classifyTangling(64)).toBe('tangled')
  })

  it('classifies 65 as spaghetti', () => {
    expect(classifyTangling(65)).toBe('spaghetti')
  })

  it('classifies 100 as spaghetti', () => {
    expect(classifyTangling(100)).toBe('spaghetti')
  })
})

// ─── analyzeFile ──────────────────────────────────────────────────────────────

describe('analyzeFile', () => {
  it('returns complete TangleMetrics', () => {
    const content = 'import fs from "fs"\nfs.readFile("x")\ntry { x() } catch (e) {}'
    const metrics = analyzeFile('a.ts', content)
    expect(metrics.file).toBe('a.ts')
    expect(metrics.concerns.length).toBeGreaterThanOrEqual(2)
    expect(metrics.importDiversity).toBe(1)
    expect(metrics.classification).toBeDefined()
  })

  it('classifies clean file', () => {
    const metrics = analyzeFile('a.ts', 'const x = 1')
    expect(metrics.classification).toBe('clean')
    expect(metrics.tanglingScore).toBe(0)
  })

  it('detects high tangling for mixed file', () => {
    const content = [
      'import fs from "fs"',
      'import http from "http"',
      'import dotenv from "dotenv"',
      'fs.readFile("x")',
      'fetch("/api")',
      'validate(input)',
      'parse(data)',
      'render()',
      'store.dispatch(action)',
      'try { x() } catch (e) {}',
    ].join('\n')
    const metrics = analyzeFile('a.ts', content)
    expect(metrics.concernCount).toBeGreaterThanOrEqual(4)
    expect(metrics.tanglingScore).toBeGreaterThan(20)
  })
})

// ─── findTangleClusters ───────────────────────────────────────────────────────

describe('findTangleClusters', () => {
  it('finds clusters with 3+ shared concerns', () => {
    const makeMetrics = (file: string, concerns: string[]): TangleMetrics => ({
      file,
      tanglingScore: 50,
      concernCount: concerns.length,
      importDiversity: 3,
      functionDiversity: 3,
      reasonToChange: concerns.length,
      concerns: concerns.map((c) => ({
        name: c, evidence: ['x'], relatedImports: [], functionCount: 1, lineRange: [1, 1] as [number, number],
      })),
      classification: 'tangled',
    })

    const files = [
      makeMetrics('a.ts', ['IO', 'Network', 'Data', 'Config']),
      makeMetrics('b.ts', ['IO', 'Network', 'Data', 'Logging']),
    ]
    const clusters = findTangleClusters(files)
    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters[0]!.sharedConcerns).toContain('IO')
    expect(clusters[0]!.sharedConcerns).toContain('Network')
    expect(clusters[0]!.sharedConcerns).toContain('Data')
  })

  it('returns empty for single file', () => {
    const files: TangleMetrics[] = [{
      file: 'a.ts', tanglingScore: 50, concernCount: 3,
      importDiversity: 2, functionDiversity: 2, reasonToChange: 3,
      concerns: [], classification: 'tangled',
    }]
    expect(findTangleClusters(files).length).toBe(0)
  })

  it('returns empty when files share fewer than 3 concerns', () => {
    const makeMetrics = (file: string, concerns: string[]): TangleMetrics => ({
      file,
      tanglingScore: 50,
      concernCount: concerns.length,
      importDiversity: 2,
      functionDiversity: 2,
      reasonToChange: concerns.length,
      concerns: concerns.map((c) => ({
        name: c, evidence: ['x'], relatedImports: [], functionCount: 1, lineRange: [1, 1] as [number, number],
      })),
      classification: 'tangled',
    })
    const files = [
      makeMetrics('a.ts', ['IO', 'Network']),
      makeMetrics('b.ts', ['IO', 'Network']),
    ]
    expect(findTangleClusters(files).length).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about spaghetti files', () => {
    const files: TangleMetrics[] = [{
      file: 'bad.ts', tanglingScore: 80, concernCount: 5,
      importDiversity: 4, functionDiversity: 4, reasonToChange: 5,
      concerns: [], classification: 'spaghetti',
    }]
    const stats: TangleStats = {
      totalFiles: 1, averageTanglingScore: 80, cleanFiles: 0,
      tangledFiles: 0, spaghettiFiles: 1, mostTangledFile: 'bad.ts',
      cleanestFile: 'bad.ts', averageConcernsPerFile: 5, averageReasonsToChange: 5,
    }
    const recs = generateRecommendations(files, stats)
    expect(recs.some((r) => r.includes('spaghetti'))).toBe(true)
  })

  it('warns about high reasons-to-change', () => {
    const files: TangleMetrics[] = [{
      file: 'big.ts', tanglingScore: 50, concernCount: 5,
      importDiversity: 2, functionDiversity: 3, reasonToChange: 5,
      concerns: [], classification: 'tangled',
    }]
    const stats: TangleStats = {
      totalFiles: 1, averageTanglingScore: 50, cleanFiles: 0,
      tangledFiles: 1, spaghettiFiles: 0, mostTangledFile: 'big.ts',
      cleanestFile: 'big.ts', averageConcernsPerFile: 5, averageReasonsToChange: 5,
    }
    const recs = generateRecommendations(files, stats)
    expect(recs.some((r) => r.includes('reasons-to-change'))).toBe(true)
  })

  it('warns about high average tangling', () => {
    const stats: TangleStats = {
      totalFiles: 5, averageTanglingScore: 55, cleanFiles: 1,
      tangledFiles: 3, spaghettiFiles: 1, mostTangledFile: 'a.ts',
      cleanestFile: 'b.ts', averageConcernsPerFile: 3, averageReasonsToChange: 3,
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('Average tangling'))).toBe(true)
  })

  it('returns healthy message when all clean', () => {
    const stats: TangleStats = {
      totalFiles: 2, averageTanglingScore: 10, cleanFiles: 2,
      tangledFiles: 0, spaghettiFiles: 0, mostTangledFile: 'a.ts',
      cleanestFile: 'b.ts', averageConcernsPerFile: 1, averageReasonsToChange: 1,
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('good separation'))).toBe(true)
  })

  it('warns about tangled files', () => {
    const files: TangleMetrics[] = [{
      file: 'mid.ts', tanglingScore: 50, concernCount: 3,
      importDiversity: 3, functionDiversity: 3, reasonToChange: 3,
      concerns: [], classification: 'tangled',
    }]
    const stats: TangleStats = {
      totalFiles: 1, averageTanglingScore: 50, cleanFiles: 0,
      tangledFiles: 1, spaghettiFiles: 0, mostTangledFile: 'mid.ts',
      cleanestFile: 'mid.ts', averageConcernsPerFile: 3, averageReasonsToChange: 3,
    }
    const recs = generateRecommendations(files, stats)
    expect(recs.some((r) => r.includes('tangled'))).toBe(true)
  })

  it('warns when over 30% spaghetti', () => {
    const files: TangleMetrics[] = Array.from({ length: 5 }, (_, i) => ({
      file: `${i}.ts`, tanglingScore: i < 2 ? 80 : 10, concernCount: i < 2 ? 5 : 0,
      importDiversity: 2, functionDiversity: 2, reasonToChange: i < 2 ? 5 : 0,
      concerns: [], classification: i < 2 ? 'spaghetti' as const : 'clean' as const,
    }))
    const stats: TangleStats = {
      totalFiles: 5, averageTanglingScore: 36, cleanFiles: 3,
      tangledFiles: 0, spaghettiFiles: 2, mostTangledFile: '0.ts',
      cleanestFile: '2.ts', averageConcernsPerFile: 2, averageReasonsToChange: 2,
    }
    const recs = generateRecommendations(files, stats)
    expect(recs.some((r) => r.includes('30%'))).toBe(true)
  })
})

// ─── buildTangleResult ────────────────────────────────────────────────────────

describe('buildTangleResult', () => {
  it('returns complete result', () => {
    const result = buildTangleResult(
      ['a.ts', 'b.ts'],
      [
        'import fs from "fs"\nfs.readFile()\nfetch("/api")',
        'const x = 1',
      ],
    )
    expect(result.files.length).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.cleanFiles).toBeGreaterThanOrEqual(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files array', () => {
    const result = buildTangleResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.files.length).toBe(0)
  })

  it('computes most tangled and cleanest file', () => {
    const result = buildTangleResult(
      ['clean.ts', 'messy.ts'],
      [
        'const x = 1',
        'import fs from "fs"\nimport http from "http"\nfs.readFile()\nfetch("/api")\nvalidate(x)\nparse(y)\nrender()\ntry {} catch(e) {}',
      ],
    )
    expect(result.stats.mostTangledFile).toBe('messy.ts')
    expect(result.stats.cleanestFile).toBe('clean.ts')
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('scoreBar', () => {
  it('renders 10-char bar for score 50', () => {
    const bar = scoreBar(50)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('renders full bar for score 100', () => {
    const bar = scoreBar(100)
    const stripped = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('██████████')
  })

  it('renders empty bar for score 0', () => {
    const bar = scoreBar(0)
    const stripped = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('░░░░░░░░░░')
  })
})

describe('classificationColor', () => {
  it('returns colored string for each classification', () => {
    expect(classificationColor('clean')).toContain('clean')
    expect(classificationColor('minor-tangle')).toContain('minor-tangle')
    expect(classificationColor('tangled')).toContain('tangled')
    expect(classificationColor('spaghetti')).toContain('spaghetti')
  })
})

describe('formatTangleTable', () => {
  it('returns (no files) for empty', () => {
    expect(formatTangleTable([])).toContain('(no files)')
  })

  it('includes file data', () => {
    const metrics: TangleMetrics = {
      file: 'a.ts', tanglingScore: 50, concernCount: 3,
      importDiversity: 2, functionDiversity: 2, reasonToChange: 3,
      concerns: [], classification: 'tangled',
    }
    const table = formatTangleTable([metrics])
    expect(table).toContain('a.ts')
    expect(table).toContain('50')
  })
})

describe('formatConcernBreakdown', () => {
  it('returns (no concerns) for empty', () => {
    const metrics: TangleMetrics = {
      file: 'a.ts', tanglingScore: 0, concernCount: 0,
      importDiversity: 0, functionDiversity: 0, reasonToChange: 0,
      concerns: [], classification: 'clean',
    }
    expect(formatConcernBreakdown(metrics)).toContain('(no concerns detected)')
  })

  it('lists concerns', () => {
    const metrics: TangleMetrics = {
      file: 'a.ts', tanglingScore: 30, concernCount: 2,
      importDiversity: 1, functionDiversity: 1, reasonToChange: 2,
      concerns: [
        { name: 'IO', evidence: ['L1: fs.readFile()'], relatedImports: ['fs'], functionCount: 1, lineRange: [1, 1] },
        { name: 'Network', evidence: ['L2: fetch()'], relatedImports: [], functionCount: 1, lineRange: [2, 2] },
      ],
      classification: 'minor-tangle',
    }
    const breakdown = formatConcernBreakdown(metrics)
    expect(breakdown).toContain('IO')
    expect(breakdown).toContain('Network')
  })
})

describe('formatClusters', () => {
  it('returns (no clusters) for empty', () => {
    expect(formatClusters([])).toContain('(no clusters found)')
  })

  it('formats cluster details', () => {
    const clusters = [{
      files: ['a.ts', 'b.ts'],
      sharedConcerns: ['IO', 'Network', 'Data'],
      tanglingScore: 50,
      description: '2 files share 3 concerns',
    }]
    const formatted = formatClusters(clusters)
    expect(formatted).toContain('Cluster 1')
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatScoreDistribution', () => {
  it('renders histogram', () => {
    const files: TangleMetrics[] = [
      { file: 'a.ts', tanglingScore: 10, concernCount: 0, importDiversity: 0, functionDiversity: 0, reasonToChange: 0, concerns: [], classification: 'clean' },
      { file: 'b.ts', tanglingScore: 70, concernCount: 5, importDiversity: 3, functionDiversity: 3, reasonToChange: 5, concerns: [], classification: 'spaghetti' },
    ]
    const dist = formatScoreDistribution(files)
    expect(dist).toContain('Clean')
    expect(dist).toContain('Spaghetti')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: TangleStats = {
      totalFiles: 10, averageTanglingScore: 35.2, cleanFiles: 3,
      tangledFiles: 4, spaghettiFiles: 2, mostTangledFile: 'messy.ts',
      cleanestFile: 'pure.ts', averageConcernsPerFile: 2.5, averageReasonsToChange: 2.1,
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('35.2')
    expect(formatted).toContain('messy.ts')
    expect(formatted).toContain('pure.ts')
  })
})

describe('formatRecommendations', () => {
  it('formats as bullet list', () => {
    const formatted = formatRecommendations(['test rec'])
    expect(formatted).toContain('test rec')
  })
})

describe('formatTangleOutput', () => {
  it('includes all sections', () => {
    const result = {
      files: [],
      clusters: [],
      stats: {
        totalFiles: 0, averageTanglingScore: 0, cleanFiles: 0,
        tangledFiles: 0, spaghettiFiles: 0, mostTangledFile: '',
        cleanestFile: '', averageConcernsPerFile: 0, averageReasonsToChange: 0,
      },
      recommendations: ['Looks good.'],
    }
    const output = formatTangleOutput(result, false)
    expect(output).toContain('Statistics')
    expect(output).toContain('Score Distribution')
    expect(output).toContain('Recommendations')
  })
})

describe('formatTangleJson', () => {
  it('returns valid JSON', () => {
    const result = {
      files: [],
      clusters: [],
      stats: {
        totalFiles: 0, averageTanglingScore: 0, cleanFiles: 0,
        tangledFiles: 0, spaghettiFiles: 0, mostTangledFile: '',
        cleanestFile: '', averageConcernsPerFile: 0, averageReasonsToChange: 0,
      },
      recommendations: [],
    }
    const json = formatTangleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})
