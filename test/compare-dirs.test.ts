import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { tmpdir } from 'node:os'

import {
  computeHash,
  computeSimilarity,
  computeComparisonStats,
  compareDirectories,
  scanDirectory,
  type DirComparison,
  type FileInfo,
  type DirContent,
  type FileDiff,
  type ComparisonStats,
  type CompareOptions,
} from '../src/commands/compare-dirs-helpers.js'

import {
  formatDiff,
  formatSimilarity,
  formatComparisonTable,
  formatComparisonJson,
} from '../src/commands/compare-dirs-format-helpers.js'

import CompareDirs from '../src/commands/compare-dirs.js'

// ─── Test helpers ─────────────────────────────────────────

async function createTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'compare-dirs-test-'))
  return dir
}

async function writeFiles(dir: string, files: Record<string, string>): Promise<void> {
  for (const [name, content] of Object.entries(files)) {
    const filePath = path.join(dir, name)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf8')
  }
}

function makeDirContent(
  dirPath: string,
  files: [string, FileInfo][],
): DirContent {
  const map = new Map<string, FileInfo>(files)
  let totalSize = 0
  let totalLines = 0
  for (const info of map.values()) {
    totalSize += info.size
    totalLines += info.lines
  }
  return { files: map, path: dirPath, totalFiles: map.size, totalLines, totalSize }
}

function makeFileInfo(rel: string, size: number, lines: number, hash: string): FileInfo {
  return { relativePath: rel, size, lines, hash }
}

function makeComparison(overrides: Partial<DirComparison>): DirComparison {
  const emptyDir: DirContent = {
    files: new Map(),
    path: '/empty',
    totalFiles: 0,
    totalLines: 0,
    totalSize: 0,
  }

  const defaultComparison: DirComparison = {
    dir1: emptyDir,
    dir2: emptyDir,
    onlyInDir1: [],
    onlyInDir2: [],
    common: [],
    modified: [],
    sameCount: 0,
    similarity: 0,
    stats: {
      totalFilesDir1: 0,
      totalFilesDir2: 0,
      uniqueToDir1: 0,
      uniqueToDir2: 0,
      common: 0,
      modified: 0,
      identical: 0,
      addedLines: 0,
      removedLines: 0,
      sizeDifference: 0,
    },
  }

  return { ...defaultComparison, ...overrides }
}

// ─── computeHash ──────────────────────────────────────────

describe('computeHash', () => {
  it('should return same hash for same content', () => {
    const hash1 = computeHash('hello world')
    const hash2 = computeHash('hello world')
    expect(hash1).toBe(hash2)
  })

  it('should return different hash for different content', () => {
    const hash1 = computeHash('hello')
    const hash2 = computeHash('world')
    expect(hash1).not.toBe(hash2)
  })

  it('should return 8-char hex string', () => {
    const hash = computeHash('test')
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('should return same hash for empty string', () => {
    const hash1 = computeHash('')
    const hash2 = computeHash('')
    expect(hash1).toBe(hash2)
  })

  it('should handle unicode content', () => {
    const hash = computeHash('héllo wörld 🌍')
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('should produce different hashes for similar content', () => {
    const hash1 = computeHash('abc')
    const hash2 = computeHash('abd')
    expect(hash1).not.toBe(hash2)
  })
})

// ─── computeSimilarity ────────────────────────────────────

describe('computeSimilarity', () => {
  it('should return 100 when all common files are identical', () => {
    const comparison = makeComparison({
      common: ['a.ts', 'b.ts'],
      sameCount: 2,
    })
    expect(computeSimilarity(comparison)).toBe(100)
  })

  it('should return 0 when no common files', () => {
    const comparison = makeComparison({
      common: [],
      sameCount: 0,
    })
    expect(computeSimilarity(comparison)).toBe(0)
  })

  it('should return 50 when half are identical', () => {
    const comparison = makeComparison({
      common: ['a.ts', 'b.ts'],
      sameCount: 1,
    })
    expect(computeSimilarity(comparison)).toBe(50)
  })

  it('should return 0 when common files exist but none are identical', () => {
    const comparison = makeComparison({
      common: ['a.ts', 'b.ts'],
      sameCount: 0,
    })
    expect(computeSimilarity(comparison)).toBe(0)
  })

  it('should return 33 for one out of three identical', () => {
    const comparison = makeComparison({
      common: ['a.ts', 'b.ts', 'c.ts'],
      sameCount: 1,
    })
    expect(computeSimilarity(comparison)).toBe(33)
  })
})

// ─── computeComparisonStats ───────────────────────────────

describe('computeComparisonStats', () => {
  it('should compute stats for identical directories', () => {
    const comparison = makeComparison({
      dir1: makeDirContent('/a', [['f.ts', makeFileInfo('f.ts', 100, 10, 'abc')]]),
      dir2: makeDirContent('/b', [['f.ts', makeFileInfo('f.ts', 100, 10, 'abc')]]),
      common: ['f.ts'],
      sameCount: 1,
      modified: [],
    })
    const stats = computeComparisonStats(comparison)
    expect(stats.common).toBe(1)
    expect(stats.identical).toBe(1)
    expect(stats.modified).toBe(0)
    expect(stats.addedLines).toBe(0)
    expect(stats.removedLines).toBe(0)
  })

  it('should compute stats with modified files', () => {
    const diff: FileDiff = {
      relativePath: 'f.ts',
      status: 'modified',
      sizeDiff: 50,
      linesDiff: 5,
      dir1Size: 100,
      dir2Size: 150,
      dir1Lines: 10,
      dir2Lines: 15,
    }
    const comparison = makeComparison({
      common: ['f.ts'],
      sameCount: 0,
      modified: [diff],
    })
    const stats = computeComparisonStats(comparison)
    expect(stats.modified).toBe(1)
    expect(stats.addedLines).toBe(5)
    expect(stats.removedLines).toBe(0)
    expect(stats.sizeDifference).toBe(50)
  })

  it('should track removed lines', () => {
    const diff: FileDiff = {
      relativePath: 'f.ts',
      status: 'modified',
      sizeDiff: -20,
      linesDiff: -3,
      dir1Size: 100,
      dir2Size: 80,
      dir1Lines: 15,
      dir2Lines: 12,
    }
    const comparison = makeComparison({
      common: ['f.ts'],
      sameCount: 0,
      modified: [diff],
    })
    const stats = computeComparisonStats(comparison)
    expect(stats.removedLines).toBe(3)
    expect(stats.addedLines).toBe(0)
  })

  it('should handle mixed added and removed lines', () => {
    const diff1: FileDiff = {
      relativePath: 'a.ts',
      status: 'modified',
      sizeDiff: 10,
      linesDiff: 5,
      dir1Size: 50,
      dir2Size: 60,
      dir1Lines: 5,
      dir2Lines: 10,
    }
    const diff2: FileDiff = {
      relativePath: 'b.ts',
      status: 'modified',
      sizeDiff: -10,
      linesDiff: -3,
      dir1Size: 40,
      dir2Size: 30,
      dir1Lines: 8,
      dir2Lines: 5,
    }
    const comparison = makeComparison({
      common: ['a.ts', 'b.ts'],
      sameCount: 0,
      modified: [diff1, diff2],
    })
    const stats = computeComparisonStats(comparison)
    expect(stats.addedLines).toBe(5)
    expect(stats.removedLines).toBe(3)
    expect(stats.sizeDifference).toBe(20)
  })

  it('should report unique counts', () => {
    const comparison = makeComparison({
      onlyInDir1: ['x.ts', 'y.ts'],
      onlyInDir2: ['z.ts'],
    })
    const stats = computeComparisonStats(comparison)
    expect(stats.uniqueToDir1).toBe(2)
    expect(stats.uniqueToDir2).toBe(1)
  })
})

// ─── formatDiff ───────────────────────────────────────────

describe('formatDiff', () => {
  it('should format positive value with + prefix', () => {
    const result = formatDiff(5)
    expect(result).toContain('+5')
  })

  it('should format negative value', () => {
    const result = formatDiff(-3)
    expect(result).toContain('-3')
  })

  it('should format zero', () => {
    const result = formatDiff(0)
    expect(result).toContain('0')
  })

  it('should not contain + for zero', () => {
    const result = formatDiff(0)
    expect(result).not.toContain('+')
  })
})

// ─── formatSimilarity ─────────────────────────────────────

describe('formatSimilarity', () => {
  it('should contain percentage', () => {
    const result = formatSimilarity(75)
    expect(result).toContain('75%')
  })

  it('should contain bar characters', () => {
    const result = formatSimilarity(50)
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('should show full bar at 100%', () => {
    const result = formatSimilarity(100)
    const filledCount = (result.match(/█/g) ?? []).length
    expect(filledCount).toBe(20)
  })

  it('should show empty bar at 0%', () => {
    const result = formatSimilarity(0)
    const emptyCount = (result.match(/░/g) ?? []).length
    expect(emptyCount).toBe(20)
  })
})

// ─── formatComparisonTable ────────────────────────────────

describe('formatComparisonTable', () => {
  it('should include similarity score', () => {
    const comparison = makeComparison({ similarity: 85 })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('85%')
  })

  it('should include directory paths', () => {
    const comparison = makeComparison({
      dir1: makeDirContent('/path/a', []),
      dir2: makeDirContent('/path/b', []),
    })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('/path/a')
    expect(result).toContain('/path/b')
  })

  it('should list files only in dir1', () => {
    const comparison = makeComparison({
      dir1: makeDirContent('/a', []),
      onlyInDir1: ['unique.ts'],
    })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('unique.ts')
  })

  it('should list files only in dir2', () => {
    const comparison = makeComparison({
      dir2: makeDirContent('/b', []),
      onlyInDir2: ['added.ts'],
    })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('added.ts')
  })

  it('should show modified files table', () => {
    const diff: FileDiff = {
      relativePath: 'changed.ts',
      status: 'modified',
      sizeDiff: 10,
      linesDiff: 2,
      dir1Size: 100,
      dir2Size: 110,
      dir1Lines: 10,
      dir2Lines: 12,
    }
    const comparison = makeComparison({ modified: [diff] })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('changed.ts')
    expect(result).toContain('modified')
  })

  it('should show stats section', () => {
    const comparison = makeComparison({
      stats: {
        totalFilesDir1: 10,
        totalFilesDir2: 12,
        uniqueToDir1: 2,
        uniqueToDir2: 4,
        common: 8,
        modified: 3,
        identical: 5,
        addedLines: 20,
        removedLines: 5,
        sizeDifference: 1024,
      },
    })
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('10 vs 12')
    expect(result).toContain('20')
  })

  it('should show verbose common files', () => {
    const comparison = makeComparison({
      common: ['same.ts', 'changed.ts'],
      modified: [
        {
          relativePath: 'changed.ts',
          status: 'modified',
          sizeDiff: 1,
          linesDiff: 1,
          dir1Size: 10,
          dir2Size: 11,
          dir1Lines: 1,
          dir2Lines: 2,
        },
      ],
      sameCount: 1,
    })
    const result = formatComparisonTable(comparison, true)
    expect(result).toContain('same.ts')
    expect(result).toContain('changed.ts')
  })

  it('should handle empty comparison', () => {
    const comparison = makeComparison({})
    const result = formatComparisonTable(comparison, false)
    expect(result).toContain('Similarity')
    expect(result).toContain('0%')
  })
})

// ─── formatComparisonJson ─────────────────────────────────

describe('formatComparisonJson', () => {
  it('should produce valid JSON', () => {
    const comparison = makeComparison({})
    const result = formatComparisonJson(comparison)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should contain similarity', () => {
    const comparison = makeComparison({ similarity: 75 })
    const result = formatComparisonJson(comparison)
    const parsed = JSON.parse(result)
    expect(parsed.similarity).toBe(75)
  })

  it('should contain onlyInDir1', () => {
    const comparison = makeComparison({ onlyInDir1: ['a.ts'] })
    const result = formatComparisonJson(comparison)
    const parsed = JSON.parse(result)
    expect(parsed.onlyInDir1).toEqual(['a.ts'])
  })

  it('should contain onlyInDir2', () => {
    const comparison = makeComparison({ onlyInDir2: ['b.ts'] })
    const result = formatComparisonJson(comparison)
    const parsed = JSON.parse(result)
    expect(parsed.onlyInDir2).toEqual(['b.ts'])
  })

  it('should serialize modified diffs', () => {
    const diff: FileDiff = {
      relativePath: 'mod.ts',
      status: 'modified',
      sizeDiff: 5,
      linesDiff: 2,
      dir1Size: 10,
      dir2Size: 15,
      dir1Lines: 3,
      dir2Lines: 5,
    }
    const comparison = makeComparison({ modified: [diff] })
    const result = formatComparisonJson(comparison)
    const parsed = JSON.parse(result)
    expect(parsed.modified).toHaveLength(1)
    expect(parsed.modified[0].relativePath).toBe('mod.ts')
    expect(parsed.modified[0].status).toBe('modified')
  })

  it('should include dir summary', () => {
    const comparison = makeComparison({
      dir1: makeDirContent('/a', [['x.ts', makeFileInfo('x.ts', 50, 5, 'ab')]]),
      dir2: makeDirContent('/b', [['y.ts', makeFileInfo('y.ts', 80, 8, 'cd')]]),
    })
    const result = formatComparisonJson(comparison)
    const parsed = JSON.parse(result)
    expect(parsed.dir1.path).toBe('/a')
    expect(parsed.dir1.totalFiles).toBe(1)
    expect(parsed.dir2.totalFiles).toBe(1)
  })
})

// ─── Command metadata ─────────────────────────────────────

describe('CompareDirs command', () => {
  it('should have correct description', () => {
    expect(CompareDirs.description).toBe('Compare two directories and show differences')
  })

  it('should have dir1 and dir2 args', () => {
    expect(CompareDirs.args.dir1).toBeDefined()
    expect(CompareDirs.args.dir2).toBeDefined()
  })

  it('should require both args', () => {
    expect((CompareDirs.args.dir1 as { required: boolean }).required).toBe(true)
    expect((CompareDirs.args.dir2 as { required: boolean }).required).toBe(true)
  })

  it('should have format flag', () => {
    expect(CompareDirs.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(CompareDirs.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(CompareDirs.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(CompareDirs.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(CompareDirs.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(CompareDirs.examples.length).toBeGreaterThan(0)
  })
})

// ─── scanDirectory (integration) ──────────────────────────

describe('scanDirectory', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should scan files in a directory', async () => {
    await writeFiles(tempDir, {
      'a.ts': 'const a = 1\n',
      'b.ts': 'const b = 2\nconst c = 3\n',
    })
    const result = await scanDirectory(tempDir, [], null)
    expect(result.totalFiles).toBe(2)
    expect(result.files.has('a.ts')).toBe(true)
    expect(result.files.has('b.ts')).toBe(true)
  })

  it('should compute correct line counts', async () => {
    await writeFiles(tempDir, {
      'test.ts': 'line1\nline2\nline3\n',
    })
    const result = await scanDirectory(tempDir, [], null)
    const info = result.files.get('test.ts')
    expect(info).toBeDefined()
    expect(info!.lines).toBe(4)
  })

  it('should compute correct file sizes', async () => {
    const content = 'hello world'
    await writeFiles(tempDir, { 'hello.txt': content })
    const result = await scanDirectory(tempDir, [], null)
    const info = result.files.get('hello.txt')
    expect(info).toBeDefined()
    expect(info!.size).toBe(Buffer.byteLength(content, 'utf8'))
  })

  it('should compute hash for file content', async () => {
    await writeFiles(tempDir, { 'hash.txt': 'content' })
    const result = await scanDirectory(tempDir, [], null)
    const info = result.files.get('hash.txt')
    expect(info).toBeDefined()
    expect(info!.hash).toBe(computeHash('content'))
  })

  it('should filter by extension', async () => {
    await writeFiles(tempDir, {
      'a.ts': 'ts file',
      'b.js': 'js file',
      'c.py': 'py file',
    })
    const result = await scanDirectory(tempDir, [], ['.ts'])
    expect(result.totalFiles).toBe(1)
    expect(result.files.has('a.ts')).toBe(true)
  })

  it('should ignore patterns', async () => {
    await writeFiles(tempDir, {
      'src/a.ts': 'src file',
      'node_modules/b.ts': 'node_modules file',
    })
    const result = await scanDirectory(tempDir, [], null)
    expect(result.totalFiles).toBe(1)
    expect(result.files.has('src/a.ts')).toBe(true)
  })

  it('should handle empty directory', async () => {
    const result = await scanDirectory(tempDir, [], null)
    expect(result.totalFiles).toBe(0)
    expect(result.totalSize).toBe(0)
    expect(result.totalLines).toBe(0)
  })
})

// ─── compareDirectories (integration) ─────────────────────

describe('compareDirectories', () => {
  let dir1: string
  let dir2: string

  beforeEach(async () => {
    dir1 = await createTempDir()
    dir2 = await createTempDir()
  })

  afterEach(async () => {
    await fs.rm(dir1, { recursive: true, force: true })
    await fs.rm(dir2, { recursive: true, force: true })
  })

  it('should report identical directories as 100% similar', async () => {
    const files = { 'a.ts': 'content a\n', 'b.ts': 'content b\n' }
    await writeFiles(dir1, files)
    await writeFiles(dir2, files)
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    expect(result.similarity).toBe(100)
    expect(result.sameCount).toBe(2)
    expect(result.modified).toHaveLength(0)
  })

  it('should report 0% for completely different directories', async () => {
    await writeFiles(dir1, { 'a.ts': 'only in dir1' })
    await writeFiles(dir2, { 'b.ts': 'only in dir2' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    expect(result.similarity).toBe(0)
    expect(result.onlyInDir1).toEqual(['a.ts'])
    expect(result.onlyInDir2).toEqual(['b.ts'])
    expect(result.common).toHaveLength(0)
  })

  it('should detect modified files', async () => {
    await writeFiles(dir1, { 'shared.ts': 'old content\n' })
    await writeFiles(dir2, { 'shared.ts': 'new content with more lines\nline2\n' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    expect(result.common).toEqual(['shared.ts'])
    expect(result.modified).toHaveLength(1)
    expect(result.modified[0].status).toBe('modified')
    expect(result.modified[0].linesDiff).toBeGreaterThan(0)
  })

  it('should detect partial overlap', async () => {
    await writeFiles(dir1, { 'a.ts': 'shared', 'b1.ts': 'only dir1', 'c.ts': 'shared too' })
    await writeFiles(dir2, { 'a.ts': 'shared', 'b2.ts': 'only dir2', 'c.ts': 'shared too' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    expect(result.common).toContain('a.ts')
    expect(result.common).toContain('c.ts')
    expect(result.onlyInDir1).toContain('b1.ts')
    expect(result.onlyInDir2).toContain('b2.ts')
  })

  it('should compute stats correctly', async () => {
    await writeFiles(dir1, { 'a.ts': 'same\n', 'b.ts': 'only1', 'c.ts': 'old content' })
    await writeFiles(dir2, { 'a.ts': 'same\n', 'd.ts': 'only2', 'c.ts': 'new content longer' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    const s = result.stats
    expect(s.uniqueToDir1).toBe(1)
    expect(s.uniqueToDir2).toBe(1)
    expect(s.identical).toBe(1)
    expect(s.modified).toBe(1)
    expect(s.common).toBe(2)
  })

  it('should respect extension filter', async () => {
    await writeFiles(dir1, { 'a.ts': 'ts content', 'a.js': 'js content' })
    await writeFiles(dir2, { 'a.ts': 'ts content', 'a.js': 'js content' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: ['.ts'] })
    expect(result.common).toEqual(['a.ts'])
    expect(result.common).not.toContain('a.js')
  })

  it('should handle nested files', async () => {
    await writeFiles(dir1, { 'src/deep/file.ts': 'nested' })
    await writeFiles(dir2, { 'src/deep/file.ts': 'nested' })
    const result = await compareDirectories(dir1, dir2, { ignorePatterns: [], extensions: null })
    expect(result.sameCount).toBe(1)
    expect(result.similarity).toBe(100)
  })
})
