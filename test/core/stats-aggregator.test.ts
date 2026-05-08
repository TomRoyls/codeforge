import { describe, it, expect } from 'vitest'
import { StatsCollector } from '../../src/core/stats-aggregator/stats-collector.js'
import { StatsAnalyzer } from '../../src/core/stats-aggregator/stats-analyzer.js'
import { TimeSeries } from '../../src/core/stats-aggregator/time-series.js'
import type { FileStats, ProjectStats, StatsSnapshot } from '../../src/core/stats-aggregator/types.js'

function makeFileStats(overrides: Partial<FileStats> = {}): FileStats {
  return {
    filePath: 'test.ts',
    linesOfCode: 10,
    commentLines: 2,
    blankLines: 3,
    totalLines: 15,
    functions: 1,
    classes: 0,
    imports: 1,
    exports: 0,
    complexity: 2,
    language: 'typescript',
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeProjectStats(overrides: Partial<ProjectStats> = {}): ProjectStats {
  return {
    totalFiles: 1,
    totalLinesOfCode: 10,
    totalCommentLines: 2,
    totalBlankLines: 3,
    averageComplexity: 2,
    averageFileLength: 15,
    languages: new Map([['typescript', 1]]),
    topComplexFiles: [],
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<StatsSnapshot> = {}): StatsSnapshot {
  const fileStats = [makeFileStats()]
  return {
    id: 'snap_test',
    timestamp: Date.now(),
    projectStats: makeProjectStats(),
    fileStats,
    ...overrides,
  }
}

describe('StatsCollector', () => {
  const collector = new StatsCollector()

  describe('collectFileStats', () => {
    it('should count lines of code correctly', () => {
      const source = 'const a = 1\nconst b = 2\nconst c = 3'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.linesOfCode).toBe(3)
      expect(stats.blankLines).toBe(0)
      expect(stats.commentLines).toBe(0)
    })

    it('should count blank lines', () => {
      const source = 'const a = 1\n\n\nconst b = 2'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.blankLines).toBe(2)
    })

    it('should count single-line comments', () => {
      const source = '// comment\nconst a = 1'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.commentLines).toBe(1)
    })

    it('should count block comments', () => {
      const source = '/* block\ncomment */\nconst a = 1'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.commentLines).toBe(2)
    })

    it('should count hash comments', () => {
      const source = '# comment\nx = 1'
      const stats = collector.collectFileStats('test.py', source)
      expect(stats.commentLines).toBe(1)
    })

    it('should calculate totalLines', () => {
      const source = 'const a = 1\n\n// comment\nconst b = 2'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.totalLines).toBe(4)
      expect(stats.linesOfCode).toBe(2)
      expect(stats.blankLines).toBe(1)
      expect(stats.commentLines).toBe(1)
    })

    it('should detect TypeScript language', () => {
      const stats = collector.collectFileStats('app.ts', '')
      expect(stats.language).toBe('typescript')
    })

    it('should detect TypeScript JSX language', () => {
      const stats = collector.collectFileStats('app.tsx', '')
      expect(stats.language).toBe('typescript')
    })

    it('should detect JavaScript language', () => {
      const stats = collector.collectFileStats('app.js', '')
      expect(stats.language).toBe('javascript')
    })

    it('should detect Python language', () => {
      const stats = collector.collectFileStats('app.py', '')
      expect(stats.language).toBe('python')
    })

    it('should detect Java language', () => {
      const stats = collector.collectFileStats('App.java', '')
      expect(stats.language).toBe('java')
    })

    it('should detect Go language', () => {
      const stats = collector.collectFileStats('main.go', '')
      expect(stats.language).toBe('go')
    })

    it('should detect Rust language', () => {
      const stats = collector.collectFileStats('main.rs', '')
      expect(stats.language).toBe('rust')
    })

    it('should detect Ruby language', () => {
      const stats = collector.collectFileStats('app.rb', '')
      expect(stats.language).toBe('ruby')
    })

    it('should detect PHP language', () => {
      const stats = collector.collectFileStats('app.php', '')
      expect(stats.language).toBe('php')
    })

    it('should detect C# language', () => {
      const stats = collector.collectFileStats('Program.cs', '')
      expect(stats.language).toBe('csharp')
    })

    it('should detect C++ language', () => {
      const stats = collector.collectFileStats('main.cpp', '')
      expect(stats.language).toBe('cpp')
    })

    it('should detect Kotlin language', () => {
      const stats = collector.collectFileStats('Main.kt', '')
      expect(stats.language).toBe('kotlin')
    })

    it('should detect Swift language', () => {
      const stats = collector.collectFileStats('main.swift', '')
      expect(stats.language).toBe('swift')
    })

    it('should detect Vue language', () => {
      const stats = collector.collectFileStats('App.vue', '')
      expect(stats.language).toBe('vue')
    })

    it('should detect Svelte language', () => {
      const stats = collector.collectFileStats('App.svelte', '')
      expect(stats.language).toBe('svelte')
    })

    it('should return unknown for unrecognized extensions', () => {
      const stats = collector.collectFileStats('data.xyz', '')
      expect(stats.language).toBe('unknown')
    })

    it('should count function declarations', () => {
      const source = 'function foo() {}\nfunction bar() {}'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.functions).toBeGreaterThanOrEqual(2)
    })

    it('should count arrow functions', () => {
      const source = 'const foo = () => 1'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.functions).toBeGreaterThanOrEqual(1)
    })

    it('should count class declarations', () => {
      const source = 'class Foo {}\nclass Bar {}'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.classes).toBeGreaterThanOrEqual(2)
    })

    it('should count interface declarations', () => {
      const source = 'interface Foo {}\ninterface Bar {}'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.classes).toBeGreaterThanOrEqual(2)
    })

    it('should count import statements', () => {
      const source = "import { foo } from 'bar'"
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.imports).toBeGreaterThanOrEqual(1)
    })

    it('should count export statements', () => {
      const source = 'export function foo() {}'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.exports).toBeGreaterThanOrEqual(1)
    })

    it('should calculate complexity', () => {
      const source = 'if (x) {}\nfor (let i = 0; i < n; i++) {}'
      const stats = collector.collectFileStats('test.ts', source)
      expect(stats.complexity).toBeGreaterThanOrEqual(3)
    })

    it('should set timestamp', () => {
      const before = Date.now()
      const stats = collector.collectFileStats('test.ts', '')
      const after = Date.now()
      expect(stats.timestamp).toBeGreaterThanOrEqual(before)
      expect(stats.timestamp).toBeLessThanOrEqual(after)
    })

    it('should handle empty source', () => {
      const stats = collector.collectFileStats('test.ts', '')
      expect(stats.linesOfCode).toBe(0)
      expect(stats.totalLines).toBe(0)
    })
  })

  describe('collectProjectStats', () => {
    it('should handle empty file list', () => {
      const stats = collector.collectProjectStats([])
      expect(stats.totalFiles).toBe(0)
      expect(stats.totalLinesOfCode).toBe(0)
      expect(stats.averageComplexity).toBe(0)
      expect(stats.averageFileLength).toBe(0)
    })

    it('should calculate total files', () => {
      const files = [makeFileStats(), makeFileStats({ filePath: 'b.ts' })]
      const stats = collector.collectProjectStats(files)
      expect(stats.totalFiles).toBe(2)
    })

    it('should sum lines of code', () => {
      const files = [makeFileStats({ linesOfCode: 10 }), makeFileStats({ linesOfCode: 20 })]
      const stats = collector.collectProjectStats(files)
      expect(stats.totalLinesOfCode).toBe(30)
    })

    it('should sum comment lines', () => {
      const files = [makeFileStats({ commentLines: 5 }), makeFileStats({ commentLines: 3 })]
      const stats = collector.collectProjectStats(files)
      expect(stats.totalCommentLines).toBe(8)
    })

    it('should sum blank lines', () => {
      const files = [makeFileStats({ blankLines: 2 }), makeFileStats({ blankLines: 4 })]
      const stats = collector.collectProjectStats(files)
      expect(stats.totalBlankLines).toBe(6)
    })

    it('should calculate average complexity', () => {
      const files = [makeFileStats({ complexity: 4 }), makeFileStats({ complexity: 6 })]
      const stats = collector.collectProjectStats(files)
      expect(stats.averageComplexity).toBe(5)
    })

    it('should calculate average file length', () => {
      const files = [makeFileStats({ totalLines: 100 }), makeFileStats({ totalLines: 200 })]
      const stats = collector.collectProjectStats(files)
      expect(stats.averageFileLength).toBe(150)
    })

    it('should group languages', () => {
      const files = [
        makeFileStats({ language: 'typescript' }),
        makeFileStats({ language: 'typescript' }),
        makeFileStats({ language: 'python' }),
      ]
      const stats = collector.collectProjectStats(files)
      expect(stats.languages.get('typescript')).toBe(2)
      expect(stats.languages.get('python')).toBe(1)
    })

    it('should return top complex files', () => {
      const files = [
        makeFileStats({ filePath: 'a.ts', complexity: 1 }),
        makeFileStats({ filePath: 'b.ts', complexity: 10 }),
        makeFileStats({ filePath: 'c.ts', complexity: 5 }),
      ]
      const stats = collector.collectProjectStats(files)
      expect(stats.topComplexFiles[0]?.filePath).toBe('b.ts')
      expect(stats.topComplexFiles[1]?.filePath).toBe('c.ts')
    })

    it('should limit top complex files to 10', () => {
      const files = Array.from({ length: 15 }, (_, i) =>
        makeFileStats({ filePath: `file${i}.ts`, complexity: 15 - i })
      )
      const stats = collector.collectProjectStats(files)
      expect(stats.topComplexFiles.length).toBe(10)
    })

    it('should set timestamp', () => {
      const before = Date.now()
      const stats = collector.collectProjectStats([makeFileStats()])
      const after = Date.now()
      expect(stats.timestamp).toBeGreaterThanOrEqual(before)
      expect(stats.timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('createSnapshot', () => {
    it('should create a snapshot with generated id', () => {
      const projectStats = makeProjectStats()
      const fileStats = [makeFileStats()]
      const snapshot = collector.createSnapshot(projectStats, fileStats)
      expect(snapshot.id).toMatch(/^snap_/)
    })

    it('should set timestamp', () => {
      const before = Date.now()
      const snapshot = collector.createSnapshot(makeProjectStats(), [makeFileStats()])
      const after = Date.now()
      expect(snapshot.timestamp).toBeGreaterThanOrEqual(before)
      expect(snapshot.timestamp).toBeLessThanOrEqual(after)
    })

    it('should include project stats', () => {
      const projectStats = makeProjectStats({ totalFiles: 5 })
      const snapshot = collector.createSnapshot(projectStats, [makeFileStats()])
      expect(snapshot.projectStats.totalFiles).toBe(5)
    })

    it('should copy file stats', () => {
      const fileStats = [makeFileStats({ filePath: 'a.ts' }), makeFileStats({ filePath: 'b.ts' })]
      const snapshot = collector.createSnapshot(makeProjectStats(), fileStats)
      expect(snapshot.fileStats.length).toBe(2)
    })

    it('should not share file stats reference', () => {
      const fileStats = [makeFileStats()]
      const snapshot = collector.createSnapshot(makeProjectStats(), fileStats)
      fileStats.push(makeFileStats({ filePath: 'other.ts' }))
      expect(snapshot.fileStats.length).toBe(1)
    })

    it('should generate unique ids', () => {
      const s1 = collector.createSnapshot(makeProjectStats(), [])
      const s2 = collector.createSnapshot(makeProjectStats(), [])
      expect(s1.id).not.toBe(s2.id)
    })
  })
})

describe('StatsAnalyzer', () => {
  const analyzer = new StatsAnalyzer()

  describe('findLargestFiles', () => {
    it('should return files sorted by totalLines descending', () => {
      const files = [
        makeFileStats({ filePath: 'small.ts', totalLines: 10 }),
        makeFileStats({ filePath: 'large.ts', totalLines: 100 }),
        makeFileStats({ filePath: 'medium.ts', totalLines: 50 }),
      ]
      const result = analyzer.findLargestFiles(files, 2)
      expect(result.length).toBe(2)
      expect(result[0]?.filePath).toBe('large.ts')
      expect(result[1]?.filePath).toBe('medium.ts')
    })

    it('should return all files if count exceeds array length', () => {
      const files = [makeFileStats({ filePath: 'a.ts' })]
      const result = analyzer.findLargestFiles(files, 10)
      expect(result.length).toBe(1)
    })

    it('should handle empty array', () => {
      const result = analyzer.findLargestFiles([], 5)
      expect(result).toEqual([])
    })
  })

  describe('findMostComplexFiles', () => {
    it('should return files sorted by complexity descending', () => {
      const files = [
        makeFileStats({ filePath: 'simple.ts', complexity: 1 }),
        makeFileStats({ filePath: 'complex.ts', complexity: 20 }),
        makeFileStats({ filePath: 'moderate.ts', complexity: 8 }),
      ]
      const result = analyzer.findMostComplexFiles(files, 2)
      expect(result.length).toBe(2)
      expect(result[0]?.filePath).toBe('complex.ts')
      expect(result[1]?.filePath).toBe('moderate.ts')
    })

    it('should handle empty array', () => {
      const result = analyzer.findMostComplexFiles([], 5)
      expect(result).toEqual([])
    })
  })

  describe('calculateDistribution', () => {
    it('should return zeros for empty stats', () => {
      const result = analyzer.calculateDistribution([], 'complexity')
      expect(result).toEqual({ min: 0, max: 0, mean: 0, median: 0, p90: 0, p95: 0, p99: 0 })
    })

    it('should calculate min and max', () => {
      const files = [
        makeFileStats({ complexity: 1 }),
        makeFileStats({ complexity: 5 }),
        makeFileStats({ complexity: 10 }),
      ]
      const result = analyzer.calculateDistribution(files, 'complexity')
      expect(result.min).toBe(1)
      expect(result.max).toBe(10)
    })

    it('should calculate mean', () => {
      const files = [
        makeFileStats({ complexity: 2 }),
        makeFileStats({ complexity: 4 }),
        makeFileStats({ complexity: 6 }),
      ]
      const result = analyzer.calculateDistribution(files, 'complexity')
      expect(result.mean).toBe(4)
    })

    it('should calculate median for odd count', () => {
      const files = [
        makeFileStats({ complexity: 1 }),
        makeFileStats({ complexity: 5 }),
        makeFileStats({ complexity: 10 }),
      ]
      const result = analyzer.calculateDistribution(files, 'complexity')
      expect(result.median).toBe(5)
    })

    it('should calculate median for even count', () => {
      const files = [
        makeFileStats({ complexity: 1 }),
        makeFileStats({ complexity: 5 }),
        makeFileStats({ complexity: 10 }),
        makeFileStats({ complexity: 20 }),
      ]
      const result = analyzer.calculateDistribution(files, 'complexity')
      expect(result.median).toBe(7.5)
    })

    it('should calculate p90', () => {
      const files = Array.from({ length: 100 }, (_, i) =>
        makeFileStats({ complexity: i + 1 })
      )
      const result = analyzer.calculateDistribution(files, 'complexity')
      expect(result.p90).toBeCloseTo(90.1, 0)
    })

    it('should work with linesOfCode metric', () => {
      const files = [makeFileStats({ linesOfCode: 100 })]
      const result = analyzer.calculateDistribution(files, 'linesOfCode')
      expect(result.min).toBe(100)
      expect(result.max).toBe(100)
      expect(result.mean).toBe(100)
    })

    it('should skip non-numeric fields', () => {
      const files = [makeFileStats()]
      const result = analyzer.calculateDistribution(files, 'filePath')
      expect(result).toEqual({ min: 0, max: 0, mean: 0, median: 0, p90: 0, p95: 0, p99: 0 })
    })
  })

  describe('groupByLanguage', () => {
    it('should group files by language', () => {
      const files = [
        makeFileStats({ language: 'typescript' }),
        makeFileStats({ language: 'python' }),
        makeFileStats({ language: 'typescript' }),
      ]
      const groups = analyzer.groupByLanguage(files)
      expect(groups.get('typescript')?.length).toBe(2)
      expect(groups.get('python')?.length).toBe(1)
    })

    it('should handle empty array', () => {
      const groups = analyzer.groupByLanguage([])
      expect(groups.size).toBe(0)
    })

    it('should handle single language', () => {
      const files = [makeFileStats({ language: 'go' }), makeFileStats({ language: 'go' })]
      const groups = analyzer.groupByLanguage(files)
      expect(groups.size).toBe(1)
      expect(groups.get('go')?.length).toBe(2)
    })
  })

  describe('compareSnapshots', () => {
    it('should detect added files', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' }), makeFileStats({ filePath: 'b.ts' })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.added).toBe(1)
    })

    it('should detect removed files', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' }), makeFileStats({ filePath: 'b.ts' })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.removed).toBe(1)
    })

    it('should detect changed files', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', linesOfCode: 10 })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', linesOfCode: 20 })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.changed.length).toBe(1)
    })

    it('should detect no changes', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.added).toBe(0)
      expect(diff.removed).toBe(0)
      expect(diff.changed.length).toBe(0)
    })

    it('should detect complexity changes', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', complexity: 5 })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', complexity: 15 })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.changed.length).toBe(1)
    })

    it('should detect function count changes', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', functions: 3 })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts', functions: 5 })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.changed.length).toBe(1)
    })

    it('should handle completely different files', () => {
      const before = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'a.ts' })],
      })
      const after = makeSnapshot({
        fileStats: [makeFileStats({ filePath: 'b.ts' })],
      })
      const diff = analyzer.compareSnapshots(before, after)
      expect(diff.added).toBe(1)
      expect(diff.removed).toBe(1)
    })
  })

  describe('generateReport', () => {
    it('should create report with all fields', () => {
      const projectStats = makeProjectStats()
      const fileStats = [makeFileStats()]
      const trends: import('../../src/core/stats-aggregator/types.js').TrendAnalysis[] = []
      const report = analyzer.generateReport(projectStats, fileStats, trends)
      expect(report.project).toBe(projectStats)
      expect(report.files.length).toBe(1)
      expect(report.trends).toEqual([])
      expect(report.generatedAt).toBeGreaterThan(0)
    })

    it('should copy files array', () => {
      const fileStats = [makeFileStats()]
      const report = analyzer.generateReport(makeProjectStats(), fileStats, [])
      fileStats.push(makeFileStats({ filePath: 'other.ts' }))
      expect(report.files.length).toBe(1)
    })

    it('should copy trends array', () => {
      const trends: import('../../src/core/stats-aggregator/types.js').TrendAnalysis[] = [
        { metric: 'loc', points: [], direction: 'stable', changeRate: 0 },
      ]
      const report = analyzer.generateReport(makeProjectStats(), [], trends)
      trends.push({ metric: 'complexity', points: [], direction: 'stable', changeRate: 0 })
      expect(report.trends.length).toBe(1)
    })
  })

  describe('getHealthScore', () => {
    it('should return 100 for healthy project', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 15,
        averageComplexity: 2,
        averageFileLength: 50,
        topComplexFiles: [makeFileStats({ complexity: 5 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(100)
    })

    it('should penalize low comment ratio', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 2,
        averageComplexity: 2,
        averageFileLength: 50,
        topComplexFiles: [makeFileStats({ complexity: 5 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(85)
    })

    it('should penalize high average complexity', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 15,
        averageComplexity: 25,
        averageFileLength: 50,
        topComplexFiles: [makeFileStats({ complexity: 5 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(75)
    })

    it('should penalize very high max complexity', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 15,
        averageComplexity: 2,
        averageFileLength: 50,
        topComplexFiles: [makeFileStats({ complexity: 50 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(80)
    })

    it('should penalize long files', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 15,
        averageComplexity: 2,
        averageFileLength: 600,
        topComplexFiles: [makeFileStats({ complexity: 5 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(85)
    })

    it('should penalize too many languages', () => {
      const langs = new Map([
        ['ts', 1], ['js', 1], ['py', 1], ['go', 1], ['rs', 1],
        ['java', 1], ['rb', 1], ['cpp', 1], ['php', 1],
      ])
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 15,
        averageComplexity: 2,
        averageFileLength: 50,
        languages: langs,
        topComplexFiles: [makeFileStats({ complexity: 5 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(85)
    })

    it('should not go below 0', () => {
      const langs = new Map(Array.from({ length: 15 }, (_, i) => [`lang${i}`, 1]))
      const stats = makeProjectStats({
        totalLinesOfCode: 1,
        totalCommentLines: 0,
        totalBlankLines: 1000,
        averageComplexity: 100,
        averageFileLength: 1000,
        languages: langs,
        topComplexFiles: [makeFileStats({ complexity: 200 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(0)
    })

    it('should not go above 100', () => {
      const stats = makeProjectStats({
        totalLinesOfCode: 100,
        totalCommentLines: 30,
        averageComplexity: 1,
        averageFileLength: 30,
        topComplexFiles: [makeFileStats({ complexity: 2 })],
      })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(100)
    })

    it('should return 100 for zero files', () => {
      const stats = makeProjectStats({ totalFiles: 0 })
      const score = analyzer.getHealthScore(stats)
      expect(score).toBe(100)
    })
  })
})

describe('TimeSeries', () => {
  let timeSeries: TimeSeries

  function makeTimestampedSnapshot(ts: number, totalLoc: number, totalFiles: number): StatsSnapshot {
    return makeSnapshot({
      timestamp: ts,
      projectStats: makeProjectStats({
        totalLinesOfCode: totalLoc,
        totalFiles,
        timestamp: ts,
      }),
    })
  }

  beforeEach(() => {
    timeSeries = new TimeSeries()
  })

  describe('addPoint', () => {
    it('should add a snapshot', () => {
      timeSeries.addPoint(makeSnapshot())
      expect(timeSeries.getHistory().length).toBe(1)
    })

    it('should maintain sort order by timestamp', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(300, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 10, 1))
      const history = timeSeries.getHistory()
      expect(history[0]?.timestamp).toBe(100)
      expect(history[1]?.timestamp).toBe(200)
      expect(history[2]?.timestamp).toBe(300)
    })
  })

  describe('getPoints', () => {
    it('should return points for totalLinesOfCode', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 50, 3))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 100, 5))
      const points = timeSeries.getPoints('totalLinesOfCode')
      expect(points.length).toBe(2)
      expect(points[0]?.value).toBe(50)
      expect(points[1]?.value).toBe(100)
    })

    it('should return points for totalFiles', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 50, 3))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 100, 5))
      const points = timeSeries.getPoints('totalFiles')
      expect(points.length).toBe(2)
      expect(points[0]?.value).toBe(3)
      expect(points[1]?.value).toBe(5)
    })

    it('should return empty for unknown metric', () => {
      timeSeries.addPoint(makeSnapshot())
      const points = timeSeries.getPoints('unknownMetric')
      expect(points).toEqual([])
    })

    it('should include timestamp and label', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(1000, 10, 1))
      const points = timeSeries.getPoints('totalLinesOfCode')
      expect(points.length).toBe(1)
      expect(points[0]?.timestamp).toBe(1000)
      expect(points[0]?.label).toBeTruthy()
    })
  })

  describe('analyzeTrend', () => {
    it('should return stable for less than 2 points', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.direction).toBe('stable')
      expect(trend.changeRate).toBe(0)
    })

    it('should detect increasing trend', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 20, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(300, 30, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(400, 40, 1))
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.direction).toBe('increasing')
      expect(trend.changeRate).toBeGreaterThan(0)
    })

    it('should detect decreasing trend', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 40, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 30, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(300, 20, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(400, 10, 1))
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.direction).toBe('decreasing')
      expect(trend.changeRate).toBeLessThan(0)
    })

    it('should detect stable trend', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(300, 10, 1))
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.direction).toBe('stable')
    })

    it('should include metric name', () => {
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.metric).toBe('totalLinesOfCode')
    })

    it('should include all points', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 20, 1))
      const trend = timeSeries.analyzeTrend('totalLinesOfCode')
      expect(trend.points.length).toBe(2)
    })

    it('should return empty points for unknown metric', () => {
      timeSeries.addPoint(makeSnapshot())
      const trend = timeSeries.analyzeTrend('unknownMetric')
      expect(trend.points).toEqual([])
    })
  })

  describe('getLatest', () => {
    it('should return null for empty series', () => {
      expect(timeSeries.getLatest()).toBeNull()
    })

    it('should return the most recent snapshot', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(300, 30, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 20, 1))
      const latest = timeSeries.getLatest()
      expect(latest?.timestamp).toBe(300)
    })
  })

  describe('getHistory', () => {
    it('should return empty array for empty series', () => {
      expect(timeSeries.getHistory()).toEqual([])
    })

    it('should return all snapshots', () => {
      timeSeries.addPoint(makeTimestampedSnapshot(100, 10, 1))
      timeSeries.addPoint(makeTimestampedSnapshot(200, 20, 1))
      expect(timeSeries.getHistory().length).toBe(2)
    })

    it('should return a copy', () => {
      timeSeries.addPoint(makeSnapshot())
      const history = timeSeries.getHistory()
      history.pop()
      expect(timeSeries.getHistory().length).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all snapshots', () => {
      timeSeries.addPoint(makeSnapshot())
      timeSeries.addPoint(makeSnapshot())
      timeSeries.clear()
      expect(timeSeries.getHistory()).toEqual([])
      expect(timeSeries.getLatest()).toBeNull()
    })
  })

  describe('trend metrics', () => {
    it('should track totalCommentLines', () => {
      const s1 = makeSnapshot({
        timestamp: 100,
        projectStats: makeProjectStats({ totalCommentLines: 5, timestamp: 100 }),
      })
      const s2 = makeSnapshot({
        timestamp: 200,
        projectStats: makeProjectStats({ totalCommentLines: 15, timestamp: 200 }),
      })
      timeSeries.addPoint(s1)
      timeSeries.addPoint(s2)
      const points = timeSeries.getPoints('totalCommentLines')
      expect(points[0]?.value).toBe(5)
      expect(points[1]?.value).toBe(15)
    })

    it('should track averageComplexity', () => {
      const s1 = makeSnapshot({
        timestamp: 100,
        projectStats: makeProjectStats({ averageComplexity: 3, timestamp: 100 }),
      })
      const s2 = makeSnapshot({
        timestamp: 200,
        projectStats: makeProjectStats({ averageComplexity: 6, timestamp: 200 }),
      })
      timeSeries.addPoint(s1)
      timeSeries.addPoint(s2)
      const points = timeSeries.getPoints('averageComplexity')
      expect(points[0]?.value).toBe(3)
      expect(points[1]?.value).toBe(6)
    })

    it('should track averageFileLength', () => {
      const s1 = makeSnapshot({
        timestamp: 100,
        projectStats: makeProjectStats({ averageFileLength: 50, timestamp: 100 }),
      })
      timeSeries.addPoint(s1)
      const points = timeSeries.getPoints('averageFileLength')
      expect(points[0]?.value).toBe(50)
    })
  })
})
