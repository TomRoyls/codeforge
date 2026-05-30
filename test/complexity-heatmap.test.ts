import { describe, expect, it } from 'vitest'

import {
  analyzeFileHeatmap,
  buildHeatmapResult,
  filterByMinComplexity,
  getFileRiskLevel,
  takeTopFiles,
} from '../src/commands/complexity-heatmap-helpers.js'
import {
  formatHeatmapJson,
  formatHeatmapTable,
  generateHeatmapBar,
} from '../src/commands/complexity-heatmap-format-helpers.js'

// ─── Risk level ──────────────────────────────────────────

describe('getFileRiskLevel', () => {
  it('returns low for complexity <= 5', () => {
    expect(getFileRiskLevel(0)).toBe('low')
    expect(getFileRiskLevel(1)).toBe('low')
    expect(getFileRiskLevel(5)).toBe('low')
  })

  it('returns medium for complexity 6-10', () => {
    expect(getFileRiskLevel(6)).toBe('medium')
    expect(getFileRiskLevel(10)).toBe('medium')
  })

  it('returns high for complexity 11-20', () => {
    expect(getFileRiskLevel(11)).toBe('high')
    expect(getFileRiskLevel(20)).toBe('high')
  })

  it('returns critical for complexity > 20', () => {
    expect(getFileRiskLevel(21)).toBe('critical')
    expect(getFileRiskLevel(100)).toBe('critical')
  })
})

// ─── File analysis ───────────────────────────────────────

describe('analyzeFileHeatmap', () => {
  it('returns zero values for empty content', () => {
    const result = analyzeFileHeatmap('', 'empty.ts')
    expect(result.filePath).toBe('empty.ts')
    expect(result.totalComplexity).toBe(0)
    expect(result.functionCount).toBe(0)
    expect(result.maxFunctionComplexity).toBe(0)
    expect(result.riskLevel).toBe('low')
  })

  it('analyzes a simple function', () => {
    const code = `
      function simple() {
        if (x) return 1
      }
    `
    const result = analyzeFileHeatmap(code, 'simple.ts')
    expect(result.filePath).toBe('simple.ts')
    expect(result.functionCount).toBe(1)
    expect(result.totalComplexity).toBeGreaterThanOrEqual(1)
    expect(result.maxFunctionComplexity).toBeGreaterThanOrEqual(1)
  })

  it('analyzes multiple functions', () => {
    const code = `
      function foo() { if (a && b) return 1 }
      function bar() { for (let i = 0; i < 10; i++) {} }
    `
    const result = analyzeFileHeatmap(code, 'multi.ts')
    expect(result.functionCount).toBe(2)
    expect(result.totalComplexity).toBeGreaterThanOrEqual(2)
  })

  it('detects high complexity patterns', () => {
    const code = `
      function complex(x, y, z) {
        if (x && y || z) {
          for (let i = 0; i < 10; i++) {
            if (i > 5) continue
          }
        } else if (x) {
          while (y) { y-- }
        } else {
          switch (z) {
            case 1: break
            case 2: break
            default: break
          }
        }
      }
    `
    const result = analyzeFileHeatmap(code, 'complex.ts')
    expect(result.functionCount).toBe(1)
    expect(result.maxFunctionComplexity).toBeGreaterThanOrEqual(5)
  })
})

// ─── Result building ─────────────────────────────────────

describe('buildHeatmapResult', () => {
  it('returns correct totals for empty input', () => {
    const result = buildHeatmapResult([])
    expect(result.totalFiles).toBe(0)
    expect(result.totalComplexity).toBe(0)
    expect(result.averageComplexity).toBe(0)
    expect(result.maxFileComplexity).toBe(0)
    expect(result.files).toEqual([])
  })

  it('sorts files by complexity descending', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 3, functionCount: 1, maxFunctionComplexity: 3, riskLevel: 'low' as const },
      { filePath: 'b.ts', totalComplexity: 15, functionCount: 2, maxFunctionComplexity: 10, riskLevel: 'high' as const },
      { filePath: 'c.ts', totalComplexity: 7, functionCount: 1, maxFunctionComplexity: 7, riskLevel: 'medium' as const },
    ]
    const result = buildHeatmapResult(files)
    expect(result.files[0]!.filePath).toBe('b.ts')
    expect(result.files[1]!.filePath).toBe('c.ts')
    expect(result.files[2]!.filePath).toBe('a.ts')
  })

  it('computes correct totals', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 5, functionCount: 1, maxFunctionComplexity: 5, riskLevel: 'low' as const },
      { filePath: 'b.ts', totalComplexity: 15, functionCount: 3, maxFunctionComplexity: 10, riskLevel: 'high' as const },
    ]
    const result = buildHeatmapResult(files)
    expect(result.totalComplexity).toBe(20)
    expect(result.averageComplexity).toBe(10)
    expect(result.maxFileComplexity).toBe(15)
  })

  it('computes risk distribution', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 3, functionCount: 1, maxFunctionComplexity: 3, riskLevel: 'low' as const },
      { filePath: 'b.ts', totalComplexity: 8, functionCount: 1, maxFunctionComplexity: 8, riskLevel: 'medium' as const },
      { filePath: 'c.ts', totalComplexity: 15, functionCount: 1, maxFunctionComplexity: 15, riskLevel: 'high' as const },
      { filePath: 'd.ts', totalComplexity: 30, functionCount: 1, maxFunctionComplexity: 30, riskLevel: 'critical' as const },
    ]
    const result = buildHeatmapResult(files)
    expect(result.riskDistribution).toEqual([
      { level: 'low', count: 1 },
      { level: 'medium', count: 1 },
      { level: 'high', count: 1 },
      { level: 'critical', count: 1 },
    ])
  })
})

// ─── Filtering ───────────────────────────────────────────

describe('filterByMinComplexity', () => {
  it('filters files below threshold', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 2, functionCount: 1, maxFunctionComplexity: 2, riskLevel: 'low' as const },
      { filePath: 'b.ts', totalComplexity: 10, functionCount: 2, maxFunctionComplexity: 8, riskLevel: 'medium' as const },
    ]
    const result = filterByMinComplexity(files, 5)
    expect(result).toHaveLength(1)
    expect(result[0]!.filePath).toBe('b.ts')
  })

  it('returns all files when threshold is 1', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 1, functionCount: 1, maxFunctionComplexity: 1, riskLevel: 'low' as const },
    ]
    const result = filterByMinComplexity(files, 1)
    expect(result).toHaveLength(1)
  })
})

describe('takeTopFiles', () => {
  it('returns top N files', () => {
    const files = Array.from({ length: 10 }, (_, i) => ({
      filePath: `file${i}.ts`,
      functionCount: 1,
      maxFunctionComplexity: i + 1,
      riskLevel: 'low' as const,
      totalComplexity: i + 1,
    }))
    const result = takeTopFiles(files, 3)
    expect(result).toHaveLength(3)
  })

  it('returns all files when n > length', () => {
    const files = [
      { filePath: 'a.ts', totalComplexity: 1, functionCount: 1, maxFunctionComplexity: 1, riskLevel: 'low' as const },
    ]
    const result = takeTopFiles(files, 10)
    expect(result).toHaveLength(1)
  })
})

// ─── Heatmap bar ─────────────────────────────────────────

describe('generateHeatmapBar', () => {
  it('returns dim bar when maxComplexity is 0', () => {
    const bar = generateHeatmapBar(0, 0, 20)
    expect(bar).toContain('░')
    expect(bar).toHaveLength(20)
  })

  it('generates a bar proportional to complexity', () => {
    const bar = generateHeatmapBar(50, 100, 20)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('generates full bar at max complexity', () => {
    const bar = generateHeatmapBar(100, 100, 20)
    // Full bar should use filled blocks, not dim empty chars
    const strippedBar = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(strippedBar).not.toMatch(/^░+$/)
  })

  it('respects width parameter', () => {
    const bar10 = generateHeatmapBar(5, 10, 10)
    const bar40 = generateHeatmapBar(5, 10, 40)
    // The 40-width bar should be longer (strip ANSI codes for comparison)
    expect(bar40.length).toBeGreaterThan(bar10.length)
  })
})

// ─── Table formatting ────────────────────────────────────

describe('formatHeatmapTable', () => {
  it('shows empty message for no rows', () => {
    const result = formatHeatmapTable({
      averageComplexity: 0,
      riskDistribution: [],
      rows: [],
      totalComplexity: 0,
      totalFiles: 0,
    }, 20)
    expect(result).toContain('No files found')
  })

  it('includes file paths in output', () => {
    const result = formatHeatmapTable({
      averageComplexity: 10,
      riskDistribution: [{ count: 1, level: 'medium' }],
      rows: [{
        filePath: 'src/test.ts',
        functionCount: 2,
        heatmapBar: '████████░░',
        maxFunctionComplexity: 8,
        riskLevel: 'medium',
        totalComplexity: 10,
      }],
      totalComplexity: 10,
      totalFiles: 1,
    }, 20)
    expect(result).toContain('src/test.ts')
    expect(result).toContain('Summary')
    expect(result).toContain('Legend')
    expect(result).toContain('Risk distribution')
  })
})

// ─── JSON formatting ─────────────────────────────────────

describe('formatHeatmapJson', () => {
  it('produces valid JSON', () => {
    const result = formatHeatmapJson({
      averageComplexity: 10,
      riskDistribution: [{ count: 1, level: 'medium' }],
      rows: [{
        filePath: 'src/test.ts',
        functionCount: 2,
        heatmapBar: 'bar',
        maxFunctionComplexity: 8,
        riskLevel: 'medium',
        totalComplexity: 10,
      }],
      totalComplexity: 10,
      totalFiles: 1,
    })
    const parsed = JSON.parse(result)
    expect(parsed.files).toHaveLength(1)
    expect(parsed.files[0].filePath).toBe('src/test.ts')
    expect(parsed.summary.totalFiles).toBe(1)
    expect(parsed.summary.totalComplexity).toBe(10)
    expect(parsed.summary.averageComplexity).toBe(10)
  })

  it('handles empty results', () => {
    const result = formatHeatmapJson({
      averageComplexity: 0,
      riskDistribution: [],
      rows: [],
      totalComplexity: 0,
      totalFiles: 0,
    })
    const parsed = JSON.parse(result)
    expect(parsed.files).toEqual([])
    expect(parsed.summary.totalFiles).toBe(0)
  })
})
