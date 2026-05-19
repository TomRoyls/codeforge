import { describe, expect, it, vi } from 'vitest'

import Files from '../src/commands/files.js'
import {
  calculateFileStats,
  filterFiles,
  getFileInfo,
  groupFiles,
  sortFiles,
  type FileInfo,
  type FilesResult,
  type FileGroup,
} from '../src/commands/files-helpers.js'
import {
  formatDate,
  formatFilesCsv,
  formatFilesJson,
  formatFileSize,
  formatFilesTable,
} from '../src/commands/files-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeFileInfo(overrides: Partial<FileInfo> = {}): FileInfo {
  return {
    directory: 'src',
    extension: '.ts',
    lineCount: 42,
    modifiedTime: new Date('2025-06-15T10:30:00Z'),
    path: '/project/src/index.ts',
    relativePath: 'src/index.ts',
    size: 1024,
    ...overrides,
  }
}

function makeFilesResult(overrides: Partial<FilesResult> = {}): FilesResult {
  return {
    byExtension: [{ count: 1, ext: '.ts', totalSize: 1024 }],
    files: [makeFileInfo()],
    groups: null,
    totalFiles: 1,
    totalLines: 42,
    totalSize: 1024,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Files command - static metadata', () => {
  it('has a description', () => {
    expect(Files.description).toBe('List and filter files in a codebase with metadata')
  })

  it('has examples array', () => {
    expect(Array.isArray(Files.examples)).toBe(true)
    expect(Files.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Files.args.path).toBeDefined()
    expect(Files.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Files.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Files command - flags', () => {
  it('has format flag with options', () => {
    expect(Files.flags.format.options).toContain('json')
    expect(Files.flags.format.options).toContain('table')
    expect(Files.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Files.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Files.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Files.flags.ignore).toBeDefined()
    expect(Files.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with multiple', () => {
    expect(Files.flags.ext).toBeDefined()
    expect(Files.flags.ext.multiple).toBe(true)
  })

  it('has sort flag defaulting to name', () => {
    expect(Files.flags.sort.default).toBe('name')
  })

  it('has sort options', () => {
    expect(Files.flags.sort.options).toContain('name')
    expect(Files.flags.sort.options).toContain('size')
    expect(Files.flags.sort.options).toContain('modified')
    expect(Files.flags.sort.options).toContain('extension')
    expect(Files.flags.sort.options).toContain('lines')
  })

  it('has sort-order flag defaulting to asc', () => {
    expect(Files.flags['sort-order'].default).toBe('asc')
  })

  it('has group-by flag defaulting to none', () => {
    expect(Files.flags['group-by'].default).toBe('none')
  })

  it('has group-by options', () => {
    expect(Files.flags['group-by'].options).toContain('extension')
    expect(Files.flags['group-by'].options).toContain('directory')
    expect(Files.flags['group-by'].options).toContain('none')
  })

  it('has min-size flag', () => {
    expect(Files.flags['min-size']).toBeDefined()
  })

  it('has max-size flag', () => {
    expect(Files.flags['max-size']).toBeDefined()
  })

  it('has modified-after flag', () => {
    expect(Files.flags['modified-after']).toBeDefined()
  })

  it('has modified-before flag', () => {
    expect(Files.flags['modified-before']).toBeDefined()
  })

  it('has no-lines flag defaulting to false', () => {
    expect(Files.flags['no-lines'].default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Files.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Files command - class structure', () => {
  it('exports a default class', () => {
    expect(Files).toBeDefined()
    expect(typeof Files).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Files.prototype.run).toBe('function')
  })
})

// ─── getFileInfo ────────────────────────────────────────

describe('getFileInfo', () => {
  const mockFs = {
    readFileSync: vi.fn(() => 'line1\nline2\nline3'),
    statSync: vi.fn(() => ({ mtime: new Date('2025-06-15T10:30:00Z'), size: 2048 })),
  }

  const mockPath = {
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/') || '.'),
    extname: vi.fn((p: string) => {
      const idx = p.lastIndexOf('.')
      return idx === -1 ? '' : p.slice(idx)
    }),
    relative: vi.fn((_base: string, p: string) => p.replace('/project/', '')),
  }

  it('extracts correct metadata with line counting', () => {
    const result = getFileInfo('/project/src/app.ts', '/project', true, mockFs, mockPath)

    expect(result.size).toBe(2048)
    expect(result.relativePath).toBe('src/app.ts')
    expect(result.extension).toBe('.ts')
    expect(result.lineCount).toBe(3)
    expect(result.directory).toBe('src')
    expect(mockFs.statSync).toHaveBeenCalledWith('/project/src/app.ts')
    expect(mockFs.readFileSync).toHaveBeenCalledWith('/project/src/app.ts', 'utf8')
  })

  it('handles no-lines mode', () => {
    const statMock = vi.fn(() => ({ mtime: new Date('2025-01-01T00:00:00Z'), size: 100 }))
    const result = getFileInfo('/project/src/test.js', '/project', false, { ...mockFs, statSync: statMock }, mockPath)

    expect(result.lineCount).toBeNull()
    expect(result.size).toBe(100)
  })

  it('handles read errors gracefully', () => {
    const readMock = vi.fn(() => {
      throw new Error('permission denied')
    })
    const result = getFileInfo('/project/test.ts', '/project', true, { ...mockFs, readFileSync: readMock }, mockPath)

    expect(result.lineCount).toBeNull()
  })
})

// ─── filterFiles ────────────────────────────────────────

describe('filterFiles', () => {
  const testFiles: FileInfo[] = [
    makeFileInfo({ extension: '.ts', size: 100, modifiedTime: new Date('2025-06-01T00:00:00Z') }),
    makeFileInfo({ extension: '.js', size: 500, modifiedTime: new Date('2025-06-10T00:00:00Z') }),
    makeFileInfo({ extension: '.py', size: 2000, modifiedTime: new Date('2025-06-20T00:00:00Z') }),
    makeFileInfo({ extension: '.ts', size: 5000, modifiedTime: new Date('2025-06-25T00:00:00Z') }),
  ]

  it('returns all files when no filters', () => {
    const result = filterFiles(testFiles, {})
    expect(result).toHaveLength(4)
  })

  it('filters by extension', () => {
    const result = filterFiles(testFiles, { extensions: ['.ts'] })
    expect(result).toHaveLength(2)
    expect(result.every((f) => f.extension === '.ts')).toBe(true)
  })

  it('filters by multiple extensions', () => {
    const result = filterFiles(testFiles, { extensions: ['.ts', '.js'] })
    expect(result).toHaveLength(3)
  })

  it('filters by min size', () => {
    const result = filterFiles(testFiles, { minSize: 500 })
    expect(result).toHaveLength(3)
  })

  it('filters by max size', () => {
    const result = filterFiles(testFiles, { maxSize: 1000 })
    expect(result).toHaveLength(2)
  })

  it('filters by size range', () => {
    const result = filterFiles(testFiles, { minSize: 200, maxSize: 3000 })
    expect(result).toHaveLength(2)
  })

  it('filters by modified after', () => {
    const result = filterFiles(testFiles, { modifiedAfter: new Date('2025-06-15T00:00:00Z') })
    expect(result).toHaveLength(2)
  })

  it('filters by modified before', () => {
    const result = filterFiles(testFiles, { modifiedBefore: new Date('2025-06-15T00:00:00Z') })
    expect(result).toHaveLength(2)
  })

  it('filters by date range', () => {
    const result = filterFiles(testFiles, {
      modifiedAfter: new Date('2025-06-05T00:00:00Z'),
      modifiedBefore: new Date('2025-06-22T00:00:00Z'),
    })
    expect(result).toHaveLength(2)
  })

  it('combines multiple filters', () => {
    const result = filterFiles(testFiles, { extensions: ['.ts'], maxSize: 200 })
    expect(result).toHaveLength(1)
    expect(result[0]!.extension).toBe('.ts')
    expect(result[0]!.size).toBe(100)
  })

  it('returns empty when no files match', () => {
    const result = filterFiles(testFiles, { extensions: ['.rs'] })
    expect(result).toHaveLength(0)
  })
})

// ─── sortFiles ──────────────────────────────────────────

describe('sortFiles', () => {
  const testFiles: FileInfo[] = [
    makeFileInfo({ relativePath: 'b.ts', size: 200, modifiedTime: new Date('2025-06-15T00:00:00Z'), extension: '.ts', lineCount: 20 }),
    makeFileInfo({ relativePath: 'a.ts', size: 100, modifiedTime: new Date('2025-06-10T00:00:00Z'), extension: '.ts', lineCount: 10 }),
    makeFileInfo({ relativePath: 'c.js', size: 300, modifiedTime: new Date('2025-06-20T00:00:00Z'), extension: '.js', lineCount: 30 }),
  ]

  it('sorts by name ascending', () => {
    const result = sortFiles(testFiles, 'name', 'asc')
    expect(result[0]!.relativePath).toBe('a.ts')
    expect(result[2]!.relativePath).toBe('c.js')
  })

  it('sorts by name descending', () => {
    const result = sortFiles(testFiles, 'name', 'desc')
    expect(result[0]!.relativePath).toBe('c.js')
    expect(result[2]!.relativePath).toBe('a.ts')
  })

  it('sorts by size ascending', () => {
    const result = sortFiles(testFiles, 'size', 'asc')
    expect(result[0]!.size).toBe(100)
    expect(result[2]!.size).toBe(300)
  })

  it('sorts by size descending', () => {
    const result = sortFiles(testFiles, 'size', 'desc')
    expect(result[0]!.size).toBe(300)
  })

  it('sorts by modified ascending', () => {
    const result = sortFiles(testFiles, 'modified', 'asc')
    expect(result[0]!.modifiedTime.getTime()).toBeLessThan(result[1]!.modifiedTime.getTime())
  })

  it('sorts by modified descending', () => {
    const result = sortFiles(testFiles, 'modified', 'desc')
    expect(result[0]!.modifiedTime.getTime()).toBeGreaterThan(result[1]!.modifiedTime.getTime())
  })

  it('sorts by extension then name', () => {
    const result = sortFiles(testFiles, 'extension', 'asc')
    expect(result[0]!.extension).toBe('.js')
    expect(result[1]!.extension).toBe('.ts')
    expect(result[2]!.extension).toBe('.ts')
  })

  it('sorts by lines ascending', () => {
    const result = sortFiles(testFiles, 'lines', 'asc')
    expect(result[0]!.lineCount).toBe(10)
    expect(result[2]!.lineCount).toBe(30)
  })

  it('places nulls last when sorting by lines', () => {
    const filesWithNull: FileInfo[] = [
      makeFileInfo({ relativePath: 'a.ts', lineCount: 5 }),
      makeFileInfo({ relativePath: 'b.ts', lineCount: null }),
      makeFileInfo({ relativePath: 'c.ts', lineCount: 10 }),
    ]
    const result = sortFiles(filesWithNull, 'lines', 'asc')
    expect(result[result.length - 1]!.lineCount).toBeNull()
  })

  it('does not mutate input array', () => {
    const original = [...testFiles]
    sortFiles(testFiles, 'name', 'asc')
    expect(testFiles).toEqual(original)
  })
})

// ─── groupFiles ─────────────────────────────────────────

describe('groupFiles', () => {
  const testFiles: FileInfo[] = [
    makeFileInfo({ relativePath: 'src/a.ts', extension: '.ts', directory: 'src', size: 100, lineCount: 10 }),
    makeFileInfo({ relativePath: 'src/b.ts', extension: '.ts', directory: 'src', size: 200, lineCount: 20 }),
    makeFileInfo({ relativePath: 'test/c.js', extension: '.js', directory: 'test', size: 300, lineCount: 30 }),
  ]

  it('groups by extension', () => {
    const result = groupFiles(testFiles, 'extension')
    expect(result).not.toBeNull()
    expect(result!.length).toBe(2)
    const tsGroup = result!.find((g) => g.key === '.ts')
    expect(tsGroup!.files).toHaveLength(2)
    expect(tsGroup!.totalSize).toBe(300)
    expect(tsGroup!.totalLines).toBe(30)
  })

  it('groups by directory', () => {
    const result = groupFiles(testFiles, 'directory')
    expect(result).not.toBeNull()
    expect(result!.length).toBe(2)
    const srcGroup = result!.find((g) => g.key === 'src')
    expect(srcGroup!.files).toHaveLength(2)
  })

  it('returns null for none grouping', () => {
    const result = groupFiles(testFiles, 'none')
    expect(result).toBeNull()
  })

  it('handles empty files', () => {
    const result = groupFiles([], 'extension')
    expect(result).not.toBeNull()
    expect(result).toHaveLength(0)
  })

  it('sorts groups alphabetically', () => {
    const result = groupFiles(testFiles, 'extension')
    expect(result![0]!.key).toBe('.js')
    expect(result![1]!.key).toBe('.ts')
  })

  it('handles null lineCounts in group totals', () => {
    const filesWithNull: FileInfo[] = [
      makeFileInfo({ extension: '.ts', directory: 'src', size: 50, lineCount: null }),
      makeFileInfo({ extension: '.ts', directory: 'src', size: 100, lineCount: 10 }),
    ]
    const result = groupFiles(filesWithNull, 'extension')
    expect(result![0]!.totalLines).toBe(10)
  })
})

// ─── calculateFileStats ─────────────────────────────────

describe('calculateFileStats', () => {
  it('calculates correct totals', () => {
    const files: FileInfo[] = [
      makeFileInfo({ size: 100, lineCount: 10, extension: '.ts' }),
      makeFileInfo({ size: 200, lineCount: 20, extension: '.js' }),
      makeFileInfo({ size: 300, lineCount: 30, extension: '.ts' }),
    ]
    const result = calculateFileStats(files)
    expect(result.totalFiles).toBe(3)
    expect(result.totalSize).toBe(600)
    expect(result.totalLines).toBe(60)
  })

  it('produces byExtension breakdown sorted by count desc', () => {
    const files: FileInfo[] = [
      makeFileInfo({ extension: '.js', size: 100 }),
      makeFileInfo({ extension: '.ts', size: 200 }),
      makeFileInfo({ extension: '.ts', size: 300 }),
    ]
    const result = calculateFileStats(files)
    expect(result.byExtension[0]!.ext).toBe('.ts')
    expect(result.byExtension[0]!.count).toBe(2)
    expect(result.byExtension[0]!.totalSize).toBe(500)
    expect(result.byExtension[1]!.ext).toBe('.js')
    expect(result.byExtension[1]!.count).toBe(1)
  })

  it('handles empty files', () => {
    const result = calculateFileStats([])
    expect(result.totalFiles).toBe(0)
    expect(result.totalSize).toBe(0)
    expect(result.totalLines).toBe(0)
    expect(result.byExtension).toHaveLength(0)
  })

  it('skips null lineCounts in total', () => {
    const files: FileInfo[] = [
      makeFileInfo({ size: 100, lineCount: null, extension: '.ts' }),
      makeFileInfo({ size: 200, lineCount: 5, extension: '.ts' }),
    ]
    const result = calculateFileStats(files)
    expect(result.totalLines).toBe(5)
  })
})

// ─── formatFileSize ─────────────────────────────────────

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats small bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.50 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.00 MB')
  })

  it('formats exactly 1024 bytes', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
  })

  it('formats exactly 1 MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
  })
})

// ─── formatDate ─────────────────────────────────────────

describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date('2025-06-15T10:30:00Z')
    expect(formatDate(date)).toBe('2025-06-15')
  })

  it('pads month and day', () => {
    const date = new Date('2025-01-05T00:00:00Z')
    expect(formatDate(date)).toBe('2025-01-05')
  })
})

// ─── formatFilesTable ───────────────────────────────────

describe('formatFilesTable', () => {
  it('contains header with column names', () => {
    const result = makeFilesResult()
    const output = formatFilesTable(result, 'none')
    expect(output).toContain('File')
    expect(output).toContain('Ext')
    expect(output).toContain('Size')
    expect(output).toContain('Lines')
    expect(output).toContain('Modified')
  })

  it('contains file data rows', () => {
    const result = makeFilesResult({
      files: [makeFileInfo({ relativePath: 'src/index.ts', size: 1024 })],
    })
    const output = formatFilesTable(result, 'none')
    expect(output).toContain('src/index.ts')
  })

  it('contains totals row', () => {
    const result = makeFilesResult()
    const output = formatFilesTable(result, 'none')
    expect(output).toContain('Total')
  })

  it('shows by-extension breakdown', () => {
    const result = makeFilesResult({
      byExtension: [{ count: 2, ext: '.ts', totalSize: 2048 }],
    })
    const output = formatFilesTable(result, 'none')
    expect(output).toContain('By Extension')
    expect(output).toContain('.ts')
  })

  it('shows group headers when grouped', () => {
    const group: FileGroup = {
      files: [makeFileInfo({ relativePath: 'a.ts' })],
      key: '.ts',
      totalLines: 42,
      totalSize: 1024,
    }
    const result = makeFilesResult({ groups: [group] })
    const output = formatFilesTable(result, 'extension')
    expect(output).toContain('── .ts')
    expect(output).toContain('Subtotal')
  })

  it('handles empty files', () => {
    const result = makeFilesResult({ files: [], totalFiles: 0, totalSize: 0, totalLines: 0, byExtension: [] })
    const output = formatFilesTable(result, 'none')
    expect(output).toContain('No files found')
  })
})

// ─── formatFilesCsv ─────────────────────────────────────

describe('formatFilesCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeFilesResult({ files: [] })
    const output = formatFilesCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('File,Extension,Size,Lines,Modified,Directory')
  })

  it('includes data rows', () => {
    const result = makeFilesResult({
      files: [makeFileInfo({ relativePath: 'src/app.ts', extension: '.ts', size: 1024 })],
    })
    const output = formatFilesCsv(result)
    expect(output).toContain('src/app.ts')
    expect(output).toContain('.ts')
  })

  it('includes totals row', () => {
    const result = makeFilesResult()
    const output = formatFilesCsv(result)
    expect(output).toContain('TOTAL')
  })

  it('escapes commas in file paths', () => {
    const result = makeFilesResult({
      files: [makeFileInfo({ relativePath: 'path,with,commas.ts' })],
    })
    const output = formatFilesCsv(result)
    expect(output).toContain('"path,with,commas.ts"')
  })

  it('handles empty line count', () => {
    const result = makeFilesResult({
      files: [makeFileInfo({ lineCount: null })],
    })
    const output = formatFilesCsv(result)
    const lines = output.split('\n')
    const dataLine = lines[1]
    expect(dataLine).toBeDefined()
    const fields = dataLine!.split(',')
    expect(fields[3]).toBe('')
  })
})

// ─── formatFilesJson ────────────────────────────────────

describe('formatFilesJson', () => {
  it('produces valid JSON', () => {
    const result = makeFilesResult()
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeFilesResult()
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains totals', () => {
    const result = makeFilesResult()
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalFiles).toBe(1)
    expect(parsed.totalSize).toBe(1024)
    expect(parsed.totalLines).toBe(42)
  })

  it('includes byExtension breakdown', () => {
    const result = makeFilesResult()
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.byExtension).toBeDefined()
    expect(parsed.byExtension).toHaveLength(1)
  })

  it('includes groups when present', () => {
    const result = makeFilesResult({
      groups: [{ files: [], key: '.ts', totalLines: 0, totalSize: 0 }],
    })
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.groups).toBeDefined()
    expect(parsed.groups).toHaveLength(1)
  })

  it('handles empty results', () => {
    const result = makeFilesResult({ files: [], totalFiles: 0, totalSize: 0, totalLines: 0, byExtension: [] })
    const output = formatFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(0)
    expect(parsed.totalFiles).toBe(0)
  })
})
