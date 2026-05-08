import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectAnalyzer } from '../../src/core/project-analyzer/project-analyzer.js'
import type { FileInfo } from '../../src/core/project-analyzer/types.js'

function makeFile(overrides: Partial<FileInfo> & { path: string }): FileInfo {
  return {
    extension: '.ts',
    lines: 100,
    size: 2500,
    language: 'TypeScript',
    ...overrides,
  }
}

describe('ProjectAnalyzer', () => {
  let analyzer: ProjectAnalyzer

  beforeEach(() => {
    analyzer = new ProjectAnalyzer()
  })

  describe('computeStats', () => {
    it('counts total files', () => {
      const files = [
        makeFile({ path: 'a.ts' }),
        makeFile({ path: 'b.ts' }),
        makeFile({ path: 'c.ts' }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.totalFiles).toBe(3)
    })

    it('sums total lines', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 50 }),
        makeFile({ path: 'b.ts', lines: 150 }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.totalLines).toBe(200)
    })

    it('sums total size', () => {
      const files = [
        makeFile({ path: 'a.ts', size: 1000 }),
        makeFile({ path: 'b.ts', size: 3000 }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.totalSize).toBe(4000)
    })

    it('counts files by language', () => {
      const files = [
        makeFile({ path: 'a.ts', language: 'TypeScript' }),
        makeFile({ path: 'b.ts', language: 'TypeScript' }),
        makeFile({ path: 'c.js', language: 'JavaScript' }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.languages['TypeScript']).toBe(2)
      expect(stats.languages['JavaScript']).toBe(1)
    })

    it('counts files by extension', () => {
      const files = [
        makeFile({ path: 'a.ts', extension: '.ts' }),
        makeFile({ path: 'b.ts', extension: '.ts' }),
        makeFile({ path: 'c.js', extension: '.js' }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.extensions['.ts']).toBe(2)
      expect(stats.extensions['.js']).toBe(1)
    })

    it('calculates average file size', () => {
      const files = [
        makeFile({ path: 'a.ts', size: 2000 }),
        makeFile({ path: 'b.ts', size: 4000 }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.avgFileSize).toBe(3000)
    })

    it('calculates average file lines', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 100 }),
        makeFile({ path: 'b.ts', lines: 200 }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.avgFileLines).toBe(150)
    })

    it('handles empty file list', () => {
      const stats = analyzer.computeStats([])
      expect(stats.totalFiles).toBe(0)
      expect(stats.totalLines).toBe(0)
      expect(stats.totalSize).toBe(0)
      expect(stats.avgFileSize).toBe(0)
      expect(stats.avgFileLines).toBe(0)
      expect(Object.keys(stats.languages)).toHaveLength(0)
      expect(Object.keys(stats.extensions)).toHaveLength(0)
    })

    it('handles single file', () => {
      const files = [makeFile({ path: 'a.ts', lines: 50, size: 1200 })]
      const stats = analyzer.computeStats(files)
      expect(stats.totalFiles).toBe(1)
      expect(stats.avgFileSize).toBe(1200)
      expect(stats.avgFileLines).toBe(50)
    })

    it('handles multiple languages', () => {
      const files = [
        makeFile({ path: 'a.ts', language: 'TypeScript' }),
        makeFile({ path: 'b.py', language: 'Python' }),
        makeFile({ path: 'c.rs', language: 'Rust' }),
      ]
      const stats = analyzer.computeStats(files)
      expect(Object.keys(stats.languages)).toHaveLength(3)
    })

    it('handles zero-size files', () => {
      const files = [
        makeFile({ path: 'a.ts', size: 0, lines: 0 }),
        makeFile({ path: 'b.ts', size: 0, lines: 0 }),
      ]
      const stats = analyzer.computeStats(files)
      expect(stats.totalSize).toBe(0)
      expect(stats.totalLines).toBe(0)
    })
  })

  describe('computeComplexity', () => {
    it('estimates function counts', () => {
      const files = [makeFile({ path: 'a.ts', lines: 150 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.functions).toBe(10)
    })

    it('estimates class counts', () => {
      const files = [makeFile({ path: 'a.ts', lines: 300 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.classes).toBe(3)
    })

    it('estimates import counts', () => {
      const files = [makeFile({ path: 'a.ts', lines: 200 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.imports).toBe(10)
    })

    it('estimates export counts', () => {
      const files = [makeFile({ path: 'a.ts', lines: 250 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.exports).toBe(10)
    })

    it('splits lines into code, comments, and blanks', () => {
      const files = [makeFile({ path: 'a.ts', lines: 1000 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.linesOfCode).toBe(700)
      expect(complexity.commentLines).toBe(150)
      expect(complexity.blankLines).toBe(150)
    })

    it('calculates cyclomatic complexity', () => {
      const files = [makeFile({ path: 'a.ts', lines: 150 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.cyclomaticComplexity).toBe(20)
    })

    it('handles empty file list', () => {
      const complexity = analyzer.computeComplexity([])
      expect(complexity.functions).toBe(0)
      expect(complexity.classes).toBe(0)
      expect(complexity.imports).toBe(0)
      expect(complexity.exports).toBe(0)
      expect(complexity.linesOfCode).toBe(0)
      expect(complexity.cyclomaticComplexity).toBe(0)
    })

    it('calculates maintainability index', () => {
      const files = [makeFile({ path: 'a.ts', lines: 300 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.maintainabilityIndex).toBeGreaterThanOrEqual(0)
      expect(complexity.maintainabilityIndex).toBeLessThanOrEqual(100)
    })

    it('aggregates across multiple files', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 100 }),
        makeFile({ path: 'b.ts', lines: 200 }),
      ]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.functions).toBe(19)
    })

    it('handles files with zero lines', () => {
      const files = [makeFile({ path: 'a.ts', lines: 0 })]
      const complexity = analyzer.computeComplexity(files)
      expect(complexity.functions).toBe(0)
      expect(complexity.linesOfCode).toBe(0)
    })
  })

  describe('computeHealth', () => {
    const goodStats = (): Parameters<ProjectAnalyzer['computeHealth']>[0] => ({
      totalFiles: 10,
      totalLines: 3000,
      totalSize: 75000,
      languages: { TypeScript: 10 },
      extensions: { '.ts': 10 },
      avgFileSize: 7500,
      avgFileLines: 300,
    })

    const goodComplexity = (): Parameters<ProjectAnalyzer['computeHealth']>[1] => ({
      cyclomaticComplexity: 20,
      linesOfCode: 2100,
      commentLines: 450,
      blankLines: 450,
      functions: 20,
      classes: 3,
      imports: 15,
      exports: 12,
      maintainabilityIndex: 65,
    })

    const goodDeps = (): Parameters<ProjectAnalyzer['computeHealth']>[2] => ({
      totalDependencies: 15,
      externalDependencies: 6,
      internalDependencies: 9,
      circularDependencies: 0,
      dependencyDepth: 4,
    })

    it('returns perfect score for healthy project', () => {
      const health = analyzer.computeHealth(goodStats(), goodComplexity(), goodDeps())
      expect(health.score).toBe(100)
      expect(health.grade).toBe('A')
    })

    it('detects high complexity issues', () => {
      const complexity = {
        ...goodComplexity(),
        cyclomaticComplexity: 200,
        functions: 10,
      }
      const health = analyzer.computeHealth(goodStats(), complexity, goodDeps())
      const complexityIssues = health.issues.filter((i) => i.category === 'complexity')
      expect(complexityIssues.length).toBeGreaterThan(0)
      expect(complexityIssues[0]!.severity).toBe('error')
    })

    it('detects moderate complexity warnings', () => {
      const complexity = {
        ...goodComplexity(),
        cyclomaticComplexity: 80,
        functions: 10,
      }
      const health = analyzer.computeHealth(goodStats(), complexity, goodDeps())
      const complexityIssues = health.issues.filter((i) => i.category === 'complexity')
      expect(complexityIssues.length).toBeGreaterThan(0)
      expect(complexityIssues[0]!.severity).toBe('warning')
    })

    it('detects large file issues', () => {
      const stats = {
        ...goodStats(),
        avgFileLines: 700,
      }
      const health = analyzer.computeHealth(stats, goodComplexity(), goodDeps())
      const sizeIssues = health.issues.filter((i) => i.category === 'size')
      expect(sizeIssues.length).toBeGreaterThan(0)
    })

    it('detects low comment ratio', () => {
      const complexity = {
        ...goodComplexity(),
        commentLines: 10,
        linesOfCode: 5000,
      }
      const health = analyzer.computeHealth(goodStats(), complexity, goodDeps())
      const docIssues = health.issues.filter((i) => i.category === 'documentation')
      expect(docIssues.length).toBeGreaterThan(0)
    })

    it('detects circular dependencies', () => {
      const deps = {
        ...goodDeps(),
        circularDependencies: 3,
      }
      const health = analyzer.computeHealth(goodStats(), goodComplexity(), deps)
      const depIssues = health.issues.filter((i) => i.category === 'dependencies' && i.severity === 'error')
      expect(depIssues.length).toBeGreaterThan(0)
    })

    it('handles empty project', () => {
      const stats = {
        totalFiles: 0,
        totalLines: 0,
        totalSize: 0,
        languages: {},
        extensions: {},
        avgFileSize: 0,
        avgFileLines: 0,
      }
      const health = analyzer.computeHealth(stats, goodComplexity(), goodDeps())
      expect(health.score).toBe(0)
      expect(health.grade).toBe('F')
    })

    it('clamps score to 0-100', () => {
      const complexity = {
        ...goodComplexity(),
        cyclomaticComplexity: 5000,
        functions: 10,
      }
      const stats = {
        ...goodStats(),
        avgFileLines: 2000,
      }
      const health = analyzer.computeHealth(stats, complexity, goodDeps())
      expect(health.score).toBeGreaterThanOrEqual(0)
      expect(health.score).toBeLessThanOrEqual(100)
    })

    it('assigns grade to health', () => {
      const health = analyzer.computeHealth(goodStats(), goodComplexity(), goodDeps())
      expect(['A', 'B', 'C', 'D', 'F']).toContain(health.grade)
    })

    it('generates suggestions', () => {
      const health = analyzer.computeHealth(goodStats(), goodComplexity(), goodDeps())
      expect(Array.isArray(health.suggestions)).toBe(true)
    })

    it('generates suggestions for high score project', () => {
      const health = analyzer.computeHealth(goodStats(), goodComplexity(), goodDeps())
      expect(health.suggestions).toContain(
        'Great code quality! Consider sharing best practices with the team',
      )
    })

    it('flags small project', () => {
      const stats = {
        ...goodStats(),
        totalFiles: 2,
      }
      const health = analyzer.computeHealth(stats, goodComplexity(), goodDeps())
      const sizeIssues = health.issues.filter(
        (i) => i.category === 'size' && i.severity === 'info',
      )
      expect(sizeIssues.length).toBeGreaterThan(0)
    })
  })

  describe('getLanguageDistribution', () => {
    it('returns sorted distribution', () => {
      const stats = {
        totalFiles: 5,
        totalLines: 500,
        totalSize: 12500,
        languages: { TypeScript: 3, JavaScript: 2 },
        extensions: { '.ts': 5 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getLanguageDistribution(stats)
      expect(dist[0]!.language).toBe('TypeScript')
      expect(dist[0]!.count).toBe(3)
      expect(dist[1]!.language).toBe('JavaScript')
      expect(dist[1]!.count).toBe(2)
    })

    it('calculates percentages', () => {
      const stats = {
        totalFiles: 4,
        totalLines: 400,
        totalSize: 10000,
        languages: { TypeScript: 3, Python: 1 },
        extensions: { '.ts': 4 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getLanguageDistribution(stats)
      expect(dist[0]!.percentage).toBe(75)
      expect(dist[1]!.percentage).toBe(25)
    })

    it('handles empty stats', () => {
      const stats = {
        totalFiles: 0,
        totalLines: 0,
        totalSize: 0,
        languages: {},
        extensions: {},
        avgFileSize: 0,
        avgFileLines: 0,
      }
      const dist = analyzer.getLanguageDistribution(stats)
      expect(dist).toHaveLength(0)
    })

    it('handles single language', () => {
      const stats = {
        totalFiles: 5,
        totalLines: 500,
        totalSize: 12500,
        languages: { TypeScript: 5 },
        extensions: { '.ts': 5 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getLanguageDistribution(stats)
      expect(dist).toHaveLength(1)
      expect(dist[0]!.percentage).toBe(100)
    })

    it('distribution percentages sum to approximately 100', () => {
      const stats = {
        totalFiles: 10,
        totalLines: 1000,
        totalSize: 25000,
        languages: { TypeScript: 4, JavaScript: 3, Python: 2, Rust: 1 },
        extensions: {},
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getLanguageDistribution(stats)
      const total = dist.reduce((sum, d) => sum + d.percentage, 0)
      expect(total).toBe(100)
    })
  })

  describe('getExtensionDistribution', () => {
    it('returns sorted distribution', () => {
      const stats = {
        totalFiles: 5,
        totalLines: 500,
        totalSize: 12500,
        languages: { TypeScript: 5 },
        extensions: { '.ts': 3, '.js': 2 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getExtensionDistribution(stats)
      expect(dist[0]!.extension).toBe('.ts')
      expect(dist[0]!.count).toBe(3)
      expect(dist[1]!.extension).toBe('.js')
      expect(dist[1]!.count).toBe(2)
    })

    it('calculates percentages', () => {
      const stats = {
        totalFiles: 10,
        totalLines: 1000,
        totalSize: 25000,
        languages: {},
        extensions: { '.ts': 7, '.js': 3 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getExtensionDistribution(stats)
      expect(dist[0]!.percentage).toBe(70)
      expect(dist[1]!.percentage).toBe(30)
    })

    it('handles empty stats', () => {
      const stats = {
        totalFiles: 0,
        totalLines: 0,
        totalSize: 0,
        languages: {},
        extensions: {},
        avgFileSize: 0,
        avgFileLines: 0,
      }
      const dist = analyzer.getExtensionDistribution(stats)
      expect(dist).toHaveLength(0)
    })

    it('handles single extension', () => {
      const stats = {
        totalFiles: 3,
        totalLines: 300,
        totalSize: 7500,
        languages: {},
        extensions: { '.py': 3 },
        avgFileSize: 2500,
        avgFileLines: 100,
      }
      const dist = analyzer.getExtensionDistribution(stats)
      expect(dist).toHaveLength(1)
      expect(dist[0]!.percentage).toBe(100)
    })
  })

  describe('getLargestFiles', () => {
    it('returns files sorted by size descending', () => {
      const files = [
        makeFile({ path: 'a.ts', size: 1000 }),
        makeFile({ path: 'b.ts', size: 5000 }),
        makeFile({ path: 'c.ts', size: 3000 }),
      ]
      const largest = analyzer.getLargestFiles(files, 2)
      expect(largest).toHaveLength(2)
      expect(largest[0]!.path).toBe('b.ts')
      expect(largest[1]!.path).toBe('c.ts')
    })

    it('returns fewer files if not enough', () => {
      const files = [makeFile({ path: 'a.ts', size: 1000 })]
      const largest = analyzer.getLargestFiles(files, 5)
      expect(largest).toHaveLength(1)
    })

    it('handles empty list', () => {
      const largest = analyzer.getLargestFiles([], 3)
      expect(largest).toHaveLength(0)
    })
  })

  describe('getSmallestFiles', () => {
    it('returns files sorted by size ascending', () => {
      const files = [
        makeFile({ path: 'a.ts', size: 5000 }),
        makeFile({ path: 'b.ts', size: 1000 }),
        makeFile({ path: 'c.ts', size: 3000 }),
      ]
      const smallest = analyzer.getSmallestFiles(files, 2)
      expect(smallest).toHaveLength(2)
      expect(smallest[0]!.path).toBe('b.ts')
      expect(smallest[1]!.path).toBe('c.ts')
    })

    it('returns fewer files if not enough', () => {
      const files = [makeFile({ path: 'a.ts', size: 1000 })]
      const smallest = analyzer.getSmallestFiles(files, 5)
      expect(smallest).toHaveLength(1)
    })
  })

  describe('getMostComplexFiles', () => {
    it('returns files sorted by estimated complexity', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 100 }),
        makeFile({ path: 'b.ts', lines: 500 }),
        makeFile({ path: 'c.ts', lines: 300 }),
      ]
      const complex = analyzer.getMostComplexFiles(files, 2)
      expect(complex).toHaveLength(2)
      expect(complex[0]!.path).toBe('b.ts')
      expect(complex[1]!.path).toBe('c.ts')
    })

    it('returns fewer files if not enough', () => {
      const files = [makeFile({ path: 'a.ts', lines: 100 })]
      const complex = analyzer.getMostComplexFiles(files, 5)
      expect(complex).toHaveLength(1)
    })

    it('handles empty list', () => {
      const complex = analyzer.getMostComplexFiles([], 3)
      expect(complex).toHaveLength(0)
    })
  })

  describe('getFileDistributionBySize', () => {
    it('categorizes small files (< 100 lines)', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 50 }),
        makeFile({ path: 'b.ts', lines: 80 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(2)
      expect(dist.medium).toBe(0)
      expect(dist.large).toBe(0)
      expect(dist.huge).toBe(0)
    })

    it('categorizes medium files (100-499 lines)', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 100 }),
        makeFile({ path: 'b.ts', lines: 400 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(0)
      expect(dist.medium).toBe(2)
      expect(dist.large).toBe(0)
      expect(dist.huge).toBe(0)
    })

    it('categorizes large files (500-999 lines)', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 500 }),
        makeFile({ path: 'b.ts', lines: 999 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(0)
      expect(dist.medium).toBe(0)
      expect(dist.large).toBe(2)
      expect(dist.huge).toBe(0)
    })

    it('categorizes huge files (>= 1000 lines)', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 1000 }),
        makeFile({ path: 'b.ts', lines: 5000 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(0)
      expect(dist.medium).toBe(0)
      expect(dist.large).toBe(0)
      expect(dist.huge).toBe(2)
    })

    it('handles mixed sizes', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 50 }),
        makeFile({ path: 'b.ts', lines: 200 }),
        makeFile({ path: 'c.ts', lines: 700 }),
        makeFile({ path: 'd.ts', lines: 2000 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(1)
      expect(dist.medium).toBe(1)
      expect(dist.large).toBe(1)
      expect(dist.huge).toBe(1)
    })

    it('handles empty list', () => {
      const dist = analyzer.getFileDistributionBySize([])
      expect(dist.small).toBe(0)
      expect(dist.medium).toBe(0)
      expect(dist.large).toBe(0)
      expect(dist.huge).toBe(0)
    })

    it('handles all same size', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 200 }),
        makeFile({ path: 'b.ts', lines: 200 }),
        makeFile({ path: 'c.ts', lines: 200 }),
      ]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.medium).toBe(3)
      expect(dist.small).toBe(0)
    })

    it('handles boundary at 100', () => {
      const files = [makeFile({ path: 'a.ts', lines: 99 })]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.small).toBe(1)
      expect(dist.medium).toBe(0)
    })

    it('handles boundary at 500', () => {
      const files = [makeFile({ path: 'a.ts', lines: 499 })]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.medium).toBe(1)
      expect(dist.large).toBe(0)
    })

    it('handles boundary at 1000', () => {
      const files = [makeFile({ path: 'a.ts', lines: 999 })]
      const dist = analyzer.getFileDistributionBySize(files)
      expect(dist.large).toBe(1)
      expect(dist.huge).toBe(0)
    })
  })

  describe('getGrade', () => {
    it('returns A for 90 and above', () => {
      expect(analyzer.getGrade(95)).toBe('A')
      expect(analyzer.getGrade(90)).toBe('A')
      expect(analyzer.getGrade(100)).toBe('A')
    })

    it('returns B for 75-89', () => {
      expect(analyzer.getGrade(80)).toBe('B')
      expect(analyzer.getGrade(75)).toBe('B')
    })

    it('returns C for 60-74', () => {
      expect(analyzer.getGrade(65)).toBe('C')
      expect(analyzer.getGrade(60)).toBe('C')
    })

    it('returns D for 40-59', () => {
      expect(analyzer.getGrade(50)).toBe('D')
      expect(analyzer.getGrade(40)).toBe('D')
    })

    it('returns F for below 40', () => {
      expect(analyzer.getGrade(30)).toBe('F')
      expect(analyzer.getGrade(0)).toBe('F')
    })

    it('returns F for 0', () => {
      expect(analyzer.getGrade(0)).toBe('F')
    })
  })

  describe('calculateMaintainabilityIndex', () => {
    it('returns 100 for zero lines of code', () => {
      const complexity = {
        cyclomaticComplexity: 0,
        linesOfCode: 0,
        commentLines: 0,
        blankLines: 0,
        functions: 0,
        classes: 0,
        imports: 0,
        exports: 0,
        maintainabilityIndex: 0,
      }
      expect(analyzer.calculateMaintainabilityIndex(complexity)).toBe(100)
    })

    it('returns value between 0 and 100', () => {
      const complexity = {
        cyclomaticComplexity: 40,
        linesOfCode: 700,
        commentLines: 150,
        blankLines: 150,
        functions: 20,
        classes: 3,
        imports: 15,
        exports: 12,
        maintainabilityIndex: 0,
      }
      const mi = analyzer.calculateMaintainabilityIndex(complexity)
      expect(mi).toBeGreaterThanOrEqual(0)
      expect(mi).toBeLessThanOrEqual(100)
    })

    it('decreases with higher complexity', () => {
      const lowComplexity = {
        cyclomaticComplexity: 10,
        linesOfCode: 700,
        commentLines: 150,
        blankLines: 150,
        functions: 20,
        classes: 3,
        imports: 15,
        exports: 12,
        maintainabilityIndex: 0,
      }
      const highComplexity = {
        ...lowComplexity,
        cyclomaticComplexity: 200,
      }
      const lowMI = analyzer.calculateMaintainabilityIndex(lowComplexity)
      const highMI = analyzer.calculateMaintainabilityIndex(highComplexity)
      expect(lowMI).toBeGreaterThan(highMI)
    })
  })

  describe('generateSuggestions', () => {
    it('suggests refactoring for complexity issues', () => {
      const health = {
        score: 50,
        grade: 'D' as const,
        issues: [{ category: 'complexity', severity: 'error' as const, message: 'test' }],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Consider refactoring complex functions into smaller units',
      )
    })

    it('suggests breaking down large files', () => {
      const health = {
        score: 50,
        grade: 'D' as const,
        issues: [{ category: 'size', severity: 'warning' as const, message: 'test' }],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Break down large files into smaller, focused modules',
      )
    })

    it('suggests adding documentation', () => {
      const health = {
        score: 50,
        grade: 'D' as const,
        issues: [{ category: 'documentation', severity: 'warning' as const, message: 'test' }],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Add more comments and documentation to improve code readability',
      )
    })

    it('suggests resolving circular dependencies', () => {
      const health = {
        score: 50,
        grade: 'D' as const,
        issues: [{ category: 'dependencies', severity: 'error' as const, message: 'circular dependencies detected' }],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Resolve circular dependencies to improve module structure',
      )
    })

    it('suggests reducing external dependencies', () => {
      const health = {
        score: 50,
        grade: 'D' as const,
        issues: [{ category: 'dependencies', severity: 'warning' as const, message: 'external dependencies' }],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Review and reduce external dependencies where possible',
      )
    })

    it('praises high quality projects', () => {
      const health = {
        score: 95,
        grade: 'A' as const,
        issues: [],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toContain(
        'Great code quality! Consider sharing best practices with the team',
      )
    })

    it('returns empty for moderate score without issues', () => {
      const health = {
        score: 70,
        grade: 'C' as const,
        issues: [],
        suggestions: [],
      }
      const suggestions = analyzer.generateSuggestions(health)
      expect(suggestions).toHaveLength(0)
    })
  })

  describe('analyze (full integration)', () => {
    it('returns complete AnalysisResult', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 200, size: 5000 }),
        makeFile({ path: 'b.ts', lines: 300, size: 8000 }),
      ]
      const result = analyzer.analyze(files)

      expect(result.stats).toBeDefined()
      expect(result.complexity).toBeDefined()
      expect(result.dependencies).toBeDefined()
      expect(result.health).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('sets timestamp', () => {
      const before = Date.now()
      const result = analyzer.analyze([makeFile({ path: 'a.ts' })])
      const after = Date.now()
      expect(result.timestamp).toBeGreaterThanOrEqual(before)
      expect(result.timestamp).toBeLessThanOrEqual(after)
    })

    it('includes stats with all fields', () => {
      const files = [
        makeFile({ path: 'a.ts', lines: 200, size: 5000, language: 'TypeScript', extension: '.ts' }),
      ]
      const result = analyzer.analyze(files)
      expect(result.stats.totalFiles).toBe(1)
      expect(result.stats.totalLines).toBe(200)
      expect(result.stats.totalSize).toBe(5000)
      expect(result.stats.languages['TypeScript']).toBe(1)
      expect(result.stats.extensions['.ts']).toBe(1)
    })

    it('includes complexity with all fields', () => {
      const result = analyzer.analyze([makeFile({ path: 'a.ts', lines: 300 })])
      expect(typeof result.complexity.cyclomaticComplexity).toBe('number')
      expect(typeof result.complexity.linesOfCode).toBe('number')
      expect(typeof result.complexity.commentLines).toBe('number')
      expect(typeof result.complexity.blankLines).toBe('number')
      expect(typeof result.complexity.functions).toBe('number')
      expect(typeof result.complexity.classes).toBe('number')
      expect(typeof result.complexity.imports).toBe('number')
      expect(typeof result.complexity.exports).toBe('number')
      expect(typeof result.complexity.maintainabilityIndex).toBe('number')
    })

    it('includes dependencies with all fields', () => {
      const result = analyzer.analyze([makeFile({ path: 'a.ts' })])
      expect(typeof result.dependencies.totalDependencies).toBe('number')
      expect(typeof result.dependencies.externalDependencies).toBe('number')
      expect(typeof result.dependencies.internalDependencies).toBe('number')
      expect(typeof result.dependencies.circularDependencies).toBe('number')
      expect(typeof result.dependencies.dependencyDepth).toBe('number')
    })

    it('includes health with all fields', () => {
      const result = analyzer.analyze([makeFile({ path: 'a.ts' })])
      expect(typeof result.health.score).toBe('number')
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.health.grade)
      expect(Array.isArray(result.health.issues)).toBe(true)
      expect(Array.isArray(result.health.suggestions)).toBe(true)
    })

    it('handles empty file list', () => {
      const result = analyzer.analyze([])
      expect(result.stats.totalFiles).toBe(0)
      expect(result.health.score).toBe(0)
      expect(result.health.grade).toBe('F')
    })

    it('handles single file', () => {
      const result = analyzer.analyze([
        makeFile({ path: 'a.ts', lines: 100, size: 2500 }),
      ])
      expect(result.stats.totalFiles).toBe(1)
      expect(result.stats.avgFileSize).toBe(2500)
    })

    it('handles many files', () => {
      const files = Array.from({ length: 50 }, (_, i) =>
        makeFile({ path: `file${i}.ts`, lines: 50 + i, size: 1000 + i * 100 }),
      )
      const result = analyzer.analyze(files)
      expect(result.stats.totalFiles).toBe(50)
    })
  })
})
