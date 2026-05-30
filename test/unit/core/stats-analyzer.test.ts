import { describe, expect, it } from 'vitest'
import { StatsAnalyzer } from '../../../src/core/stats-aggregator/stats-analyzer.js'

const analyzer = new StatsAnalyzer()

const mockFileStats = [
  {
    filePath: '/path/to/file1.ts',
    linesOfCode: 100,
    commentLines: 20,
    blankLines: 10,
    totalLines: 130,
    functions: 5,
    classes: 1,
    imports: 3,
    exports: 4,
    complexity: 10,
    language: 'TypeScript',
    timestamp: 1000
  },
  {
    filePath: '/path/to/file2.ts',
    linesOfCode: 200,
    commentLines: 40,
    blankLines: 20,
    totalLines: 260,
    functions: 10,
    classes: 2,
    imports: 6,
    exports: 8,
    complexity: 20,
    language: 'TypeScript',
    timestamp: 1000
  },
  {
    filePath: '/path/to/file3.js',
    linesOfCode: 50,
    commentLines: 10,
    blankLines: 5,
    totalLines: 65,
    functions: 2,
    classes: 0,
    imports: 1,
    exports: 2,
    complexity: 5,
    language: 'JavaScript',
    timestamp: 1000
  },
  {
    filePath: '/path/to/file4.ts',
    linesOfCode: 300,
    commentLines: 60,
    blankLines: 30,
    totalLines: 390,
    functions: 15,
    classes: 3,
    imports: 9,
    exports: 12,
    complexity: 30,
    language: 'TypeScript',
    timestamp: 1000
  },
  {
    filePath: '/path/to/file5.ts',
    linesOfCode: 150,
    commentLines: 30,
    blankLines: 15,
    totalLines: 195,
    functions: 8,
    classes: 2,
    imports: 5,
    exports: 6,
    complexity: 15,
    language: 'TypeScript',
    timestamp: 1000
  }
]

const mockProjectStats = {
  totalFiles: 5,
  totalLinesOfCode: 800,
  totalCommentLines: 160,
  totalBlankLines: 80,
  averageComplexity: 16,
  averageFileLength: 208,
  languages: new Map([['TypeScript', 4], ['JavaScript', 1]]),
  topComplexFiles: [mockFileStats[3], mockFileStats[1], mockFileStats[4]],
  timestamp: 1000
}

const mockTrends = [
  {
    metric: 'complexity',
    points: [
      { timestamp: 1000, value: 10, label: 'v1' },
      { timestamp: 2000, value: 15, label: 'v2' }
    ],
    direction: 'increasing' as const,
    changeRate: 0.5
  }
]

describe('StatsAnalyzer', () => {
  describe('findLargestFiles', () => {
    it('should return top N files sorted by totalLines', () => {
      const result = analyzer.findLargestFiles(mockFileStats, 3)
      expect(result).toHaveLength(3)
      expect(result[0].filePath).toBe('/path/to/file4.ts')
      expect(result[0].totalLines).toBe(390)
      expect(result[1].filePath).toBe('/path/to/file2.ts')
      expect(result[1].totalLines).toBe(260)
      expect(result[2].filePath).toBe('/path/to/file5.ts')
      expect(result[2].totalLines).toBe(195)
    })

    it('should return all files when count exceeds array length', () => {
      const result = analyzer.findLargestFiles(mockFileStats, 10)
      expect(result).toHaveLength(5)
      expect(result[0].totalLines).toBeGreaterThanOrEqual(result[1].totalLines)
      expect(result[1].totalLines).toBeGreaterThanOrEqual(result[2].totalLines)
    })

    it('should return empty array for empty input', () => {
      const result = analyzer.findLargestFiles([], 5)
      expect(result).toHaveLength(0)
    })

    it('should return empty array for count of 0', () => {
      const result = analyzer.findLargestFiles(mockFileStats, 0)
      expect(result).toHaveLength(0)
    })

    it('should return single file when count is 1', () => {
      const result = analyzer.findLargestFiles(mockFileStats, 1)
      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('/path/to/file4.ts')
    })
  })

  describe('findMostComplexFiles', () => {
    it('should return top N files sorted by complexity', () => {
      const result = analyzer.findMostComplexFiles(mockFileStats, 3)
      expect(result).toHaveLength(3)
      expect(result[0].filePath).toBe('/path/to/file4.ts')
      expect(result[0].complexity).toBe(30)
      expect(result[1].filePath).toBe('/path/to/file2.ts')
      expect(result[1].complexity).toBe(20)
      expect(result[2].filePath).toBe('/path/to/file5.ts')
      expect(result[2].complexity).toBe(15)
    })

    it('should return all files when count exceeds array length', () => {
      const result = analyzer.findMostComplexFiles(mockFileStats, 10)
      expect(result).toHaveLength(5)
      expect(result[0].complexity).toBeGreaterThanOrEqual(result[1].complexity)
      expect(result[1].complexity).toBeGreaterThanOrEqual(result[2].complexity)
    })

    it('should return empty array for empty input', () => {
      const result = analyzer.findMostComplexFiles([], 5)
      expect(result).toHaveLength(0)
    })

    it('should return empty array for count of 0', () => {
      const result = analyzer.findMostComplexFiles(mockFileStats, 0)
      expect(result).toHaveLength(0)
    })

    it('should return single file when count is 1', () => {
      const result = analyzer.findMostComplexFiles(mockFileStats, 1)
      expect(result).toHaveLength(1)
      expect(result[0].filePath).toBe('/path/to/file4.ts')
    })
  })

  describe('calculateDistribution', () => {
    it('should calculate distribution for linesOfCode', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'linesOfCode')
      expect(result.min).toBe(50)
      expect(result.max).toBe(300)
      expect(result.mean).toBe(160)
      expect(result.median).toBe(150)
    })

    it('should calculate distribution for complexity', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'complexity')
      expect(result.min).toBe(5)
      expect(result.max).toBe(30)
      expect(result.mean).toBe(16)
      expect(result.median).toBe(15)
    })

    it('should return zero distribution for empty array', () => {
      const result = analyzer.calculateDistribution([], 'linesOfCode')
      expect(result).toEqual({ min: 0, max: 0, mean: 0, median: 0, p90: 0, p95: 0, p99: 0 })
    })

    it('should handle single element array', () => {
      const singleElement = [mockFileStats[0]]
      const result = analyzer.calculateDistribution(singleElement, 'linesOfCode')
      expect(result.min).toBe(100)
      expect(result.max).toBe(100)
      expect(result.mean).toBe(100)
      expect(result.median).toBe(100)
    })

    it('should handle all same values', () => {
      const sameValues = mockFileStats.map(s => ({ ...s, linesOfCode: 100 }))
      const result = analyzer.calculateDistribution(sameValues, 'linesOfCode')
      expect(result.min).toBe(100)
      expect(result.max).toBe(100)
      expect(result.mean).toBe(100)
      expect(result.median).toBe(100)
    })

    it('should ignore non-numeric metrics', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'filePath')
      expect(result).toEqual({ min: 0, max: 0, mean: 0, median: 0, p90: 0, p95: 0, p99: 0 })
    })

    it('should calculate percentiles correctly', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'linesOfCode')
      expect(result.p90).toBeGreaterThan(result.median)
      expect(result.p95).toBeGreaterThanOrEqual(result.p90)
      expect(result.p99).toBeGreaterThanOrEqual(result.p95)
    })

    it('should calculate distribution for totalLines', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'totalLines')
      expect(result.min).toBe(65)
      expect(result.max).toBe(390)
      expect(result.mean).toBe(208)
    })

    it('should calculate distribution for functions', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'functions')
      expect(result.min).toBe(2)
      expect(result.max).toBe(15)
      expect(result.mean).toBe(8)
    })

    it('should calculate distribution for classes', () => {
      const result = analyzer.calculateDistribution(mockFileStats, 'classes')
      expect(result.min).toBe(0)
      expect(result.max).toBe(3)
      expect(result.mean).toBe(1.6)
    })
  })

  describe('groupByLanguage', () => {
    it('should group files by language', () => {
      const result = analyzer.groupByLanguage(mockFileStats)
      expect(result.size).toBe(2)
      expect(result.get('TypeScript')).toHaveLength(4)
      expect(result.get('JavaScript')).toHaveLength(1)
    })

    it('should return empty map for empty array', () => {
      const result = analyzer.groupByLanguage([])
      expect(result.size).toBe(0)
    })

    it('should handle single language', () => {
      const singleLang = mockFileStats.filter(f => f.language === 'TypeScript')
      const result = analyzer.groupByLanguage(singleLang)
      expect(result.size).toBe(1)
      expect(result.get('TypeScript')).toHaveLength(4)
    })

    it('should preserve all file properties in groups', () => {
      const result = analyzer.groupByLanguage(mockFileStats)
      const tsFiles = result.get('TypeScript')
      expect(tsFiles).toBeDefined()
      expect(tsFiles[0].filePath).toBe('/path/to/file1.ts')
      expect(tsFiles[0].complexity).toBe(10)
    })

    it('should handle files with same language', () => {
      const sameLang = [
        { ...mockFileStats[0], filePath: '/a.ts' },
        { ...mockFileStats[0], filePath: '/b.ts' },
        { ...mockFileStats[0], filePath: '/c.ts' }
      ]
      const result = analyzer.groupByLanguage(sameLang)
      expect(result.get('TypeScript')).toHaveLength(3)
    })

    it('should handle multiple languages', () => {
      const multiLang = [
        { ...mockFileStats[0], language: 'Python' },
        { ...mockFileStats[1], language: 'Go' },
        { ...mockFileStats[2], language: 'Rust' }
      ]
      const result = analyzer.groupByLanguage(multiLang)
      expect(result.size).toBe(3)
      expect(result.get('Python')).toHaveLength(1)
      expect(result.get('Go')).toHaveLength(1)
      expect(result.get('Rust')).toHaveLength(1)
    })
  })

  describe('compareSnapshots', () => {
    const beforeSnapshot = {
      id: 'snapshot-1',
      timestamp: 1000,
      projectStats: mockProjectStats,
      fileStats: [mockFileStats[0], mockFileStats[1], mockFileStats[2]]
    }

    const afterSnapshot = {
      id: 'snapshot-2',
      timestamp: 2000,
      projectStats: mockProjectStats,
      fileStats: [mockFileStats[1], mockFileStats[2], mockFileStats[3]]
    }

    it('should detect added files', () => {
      const result = analyzer.compareSnapshots(beforeSnapshot, afterSnapshot)
      expect(result.added).toBe(1)
    })

    it('should detect removed files', () => {
      const result = analyzer.compareSnapshots(beforeSnapshot, afterSnapshot)
      expect(result.removed).toBe(1)
    })

    it('should detect changed files', () => {
      const changedBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], linesOfCode: 100 }]
      }
      const changedAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], linesOfCode: 200 }]
      }
      const result = analyzer.compareSnapshots(changedBefore, changedAfter)
      expect(result.changed).toHaveLength(1)
      expect(result.changed[0].linesOfCode).toBe(200)
    })

    it('should not include unchanged files in changed array', () => {
      const result = analyzer.compareSnapshots(beforeSnapshot, afterSnapshot)
      const unchangedPaths = ['/path/to/file2.ts', '/path/to/file3.js']
      result.changed.forEach(file => {
        expect(unchangedPaths).not.toContain(file.filePath)
      })
    })

    it('should detect change in complexity', () => {
      const changedBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], complexity: 10 }]
      }
      const changedAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], complexity: 20 }]
      }
      const result = analyzer.compareSnapshots(changedBefore, changedAfter)
      expect(result.changed).toHaveLength(1)
    })

    it('should detect change in functions count', () => {
      const changedBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], functions: 5 }]
      }
      const changedAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], functions: 10 }]
      }
      const result = analyzer.compareSnapshots(changedBefore, changedAfter)
      expect(result.changed).toHaveLength(1)
    })

    it('should detect change in classes count', () => {
      const changedBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], classes: 1 }]
      }
      const changedAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: [{ ...mockFileStats[1], classes: 2 }]
      }
      const result = analyzer.compareSnapshots(changedBefore, changedAfter)
      expect(result.changed).toHaveLength(1)
    })

    it('should handle empty snapshots', () => {
      const emptyBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: []
      }
      const emptyAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: []
      }
      const result = analyzer.compareSnapshots(emptyBefore, emptyAfter)
      expect(result.added).toBe(0)
      expect(result.removed).toBe(0)
      expect(result.changed).toHaveLength(0)
    })

    it('should handle all files added', () => {
      const emptyBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: []
      }
      const fullAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: mockFileStats
      }
      const result = analyzer.compareSnapshots(emptyBefore, fullAfter)
      expect(result.added).toBe(5)
      expect(result.removed).toBe(0)
    })

    it('should handle all files removed', () => {
      const fullBefore = {
        id: 'snapshot-1',
        timestamp: 1000,
        projectStats: mockProjectStats,
        fileStats: mockFileStats
      }
      const emptyAfter = {
        id: 'snapshot-2',
        timestamp: 2000,
        projectStats: mockProjectStats,
        fileStats: []
      }
      const result = analyzer.compareSnapshots(fullBefore, emptyAfter)
      expect(result.added).toBe(0)
      expect(result.removed).toBe(5)
    })
  })

  describe('generateReport', () => {
    it('should generate report with all components', () => {
      const result = analyzer.generateReport(mockProjectStats, mockFileStats, mockTrends)
      expect(result.project).toEqual(mockProjectStats)
      expect(result.files).toHaveLength(5)
      expect(result.trends).toHaveLength(1)
      expect(result.generatedAt).toBeLessThanOrEqual(Date.now())
      expect(result.generatedAt).toBeGreaterThan(Date.now() - 1000)
    })

    it('should create copy of arrays', () => {
      const result = analyzer.generateReport(mockProjectStats, mockFileStats, mockTrends)
      expect(result.files).not.toBe(mockFileStats)
      expect(result.trends).not.toBe(mockTrends)
    })

    it('should handle empty fileStats', () => {
      const result = analyzer.generateReport(mockProjectStats, [], [])
      expect(result.files).toHaveLength(0)
      expect(result.trends).toHaveLength(0)
    })

    it('should handle empty trends', () => {
      const result = analyzer.generateReport(mockProjectStats, mockFileStats, [])
      expect(result.trends).toHaveLength(0)
      expect(result.files).toHaveLength(5)
    })

    it('should include timestamp in report', () => {
      const beforeTest = Date.now()
      const result = analyzer.generateReport(mockProjectStats, mockFileStats, mockTrends)
      const afterTest = Date.now()
      expect(result.generatedAt).toBeGreaterThanOrEqual(beforeTest)
      expect(result.generatedAt).toBeLessThanOrEqual(afterTest)
    })
  })

  describe('getHealthScore', () => {
    it('should return 100 for perfect project', () => {
      const perfectStats = {
        totalFiles: 10,
        totalLinesOfCode: 1000,
        totalCommentLines: 200,
        totalBlankLines: 100,
        averageComplexity: 3,
        averageFileLength: 100,
        languages: new Map([['TypeScript', 10]]),
        topComplexFiles: [{ ...mockFileStats[0], complexity: 5 }],
        timestamp: 1000
      }
      const result = analyzer.getHealthScore(perfectStats)
      expect(result).toBe(100)
    })

    it('should penalize very high average complexity', () => {
      const highComplexity = { ...mockProjectStats, averageComplexity: 25 }
      const result = analyzer.getHealthScore(highComplexity)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(75)
    })

    it('should penalize high average complexity', () => {
      const highComplexity = { ...mockProjectStats, averageComplexity: 18 }
      const result = analyzer.getHealthScore(highComplexity)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(85)
    })

    it('should penalize medium average complexity', () => {
      const mediumComplexity = { ...mockProjectStats, averageComplexity: 12 }
      const result = analyzer.getHealthScore(mediumComplexity)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(90)
    })

    it('should penalize low average complexity', () => {
      const lowComplexity = { ...mockProjectStats, averageComplexity: 6 }
      const result = analyzer.getHealthScore(lowComplexity)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should penalize very high max complexity', () => {
      const veryHighMax = { ...mockProjectStats, topComplexFiles: [{ ...mockFileStats[0], complexity: 35 }] }
      const result = analyzer.getHealthScore(veryHighMax)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(80)
    })

    it('should penalize high max complexity', () => {
      const highMax = { ...mockProjectStats, topComplexFiles: [{ ...mockFileStats[0], complexity: 25 }] }
      const result = analyzer.getHealthScore(highMax)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(90)
    })

    it('should penalize medium max complexity', () => {
      const mediumMax = { ...mockProjectStats, topComplexFiles: [{ ...mockFileStats[0], complexity: 16 }] }
      const result = analyzer.getHealthScore(mediumMax)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should penalize very low comment ratio', () => {
      const lowComment = { ...mockProjectStats, totalLinesOfCode: 1000, totalCommentLines: 20 }
      const result = analyzer.getHealthScore(lowComment)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(85)
    })

    it('should penalize low comment ratio', () => {
      const lowComment = { ...mockProjectStats, totalLinesOfCode: 1000, totalCommentLines: 80 }
      const result = analyzer.getHealthScore(lowComment)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should penalize large average file length', () => {
      const largeFiles = { ...mockProjectStats, averageFileLength: 550 }
      const result = analyzer.getHealthScore(largeFiles)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(85)
    })

    it('should penalize medium average file length', () => {
      const mediumFiles = { ...mockProjectStats, averageFileLength: 350 }
      const result = analyzer.getHealthScore(mediumFiles)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should penalize many languages', () => {
      const manyLangs = { ...mockProjectStats, languages: new Map([['ts', 1], ['js', 1], ['py', 1], ['go', 1], ['rs', 1], ['java', 1], ['cpp', 1], ['c', 1], ['rb', 1]]) }
      const result = analyzer.getHealthScore(manyLangs)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(85)
    })

    it('should penalize several languages', () => {
      const severalLangs = { ...mockProjectStats, languages: new Map([['ts', 1], ['js', 1], ['py', 1], ['go', 1], ['rs', 1], ['java', 1]]) }
      const result = analyzer.getHealthScore(severalLangs)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should penalize very high blank line ratio', () => {
      const highBlank = { ...mockProjectStats, totalLinesOfCode: 100, totalCommentLines: 50, totalBlankLines: 150 }
      const result = analyzer.getHealthScore(highBlank)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(85)
    })

    it('should penalize high blank line ratio', () => {
      const highBlank = { ...mockProjectStats, totalLinesOfCode: 100, totalCommentLines: 50, totalBlankLines: 90 }
      const result = analyzer.getHealthScore(highBlank)
      expect(result).toBeLessThan(100)
      expect(result).toBeLessThanOrEqual(95)
    })

    it('should handle zero total files', () => {
      const zeroFiles = { ...mockProjectStats, totalFiles: 0 }
      const result = analyzer.getHealthScore(zeroFiles)
      expect(result).toBe(100)
    })

    it('should clamp score at minimum 0', () => {
      const terribleStats = {
        totalFiles: 100,
        totalLinesOfCode: 10000,
        totalCommentLines: 10,
        totalBlankLines: 10000,
        averageComplexity: 50,
        averageFileLength: 1000,
        languages: new Map([['a', 1], ['b', 1], ['c', 1], ['d', 1], ['e', 1], ['f', 1], ['g', 1], ['h', 1], ['i', 1], ['j', 1]]),
        topComplexFiles: [{ ...mockFileStats[0], complexity: 100 }],
        timestamp: 1000
      }
      const result = analyzer.getHealthScore(terribleStats)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should handle empty topComplexFiles array', () => {
      const emptyTop = { ...mockProjectStats, topComplexFiles: [] }
      const result = analyzer.getHealthScore(emptyTop)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('should apply multiple penalties cumulatively', () => {
      const multiPenalty = {
        ...mockProjectStats,
        averageComplexity: 25,
        averageFileLength: 550,
        languages: new Map([['a', 1], ['b', 1], ['c', 1], ['d', 1], ['e', 1], ['f', 1], ['g', 1], ['h', 1], ['i', 1]])
      }
      const result = analyzer.getHealthScore(multiPenalty)
      expect(result).toBeLessThan(80)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })
})