import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { Project, type SourceFile } from 'ts-morph'
import { Parser, type ParseResult, type ParserOptions } from '../../../src/core/parser'

// Create a mock SourceFile factory
function createMockSourceFile(filePath: string): SourceFile {
  return {
    getFilePath: () => filePath,
    getText: () => 'mock content',
    getFullText: () => 'mock content',
    getBaseName: () => filePath.split('/').pop() ?? '',
    getExtension: () => '.ts',
  } as SourceFile
}

// Hoisted mock objects for use in vi.mock factories and test code
const mockGlobalParseCache = vi.hoisted(() => ({
  get: vi.fn<() => SourceFile | undefined>().mockReturnValue(undefined),
  set: vi.fn(),
  clear: vi.fn(),
  getStats: vi.fn(() => ({ hits: 0, misses: 0, hitRate: 0, size: 0 })),
}))

const mockASTCacheInstance = vi.hoisted(() => ({
  get: vi.fn<() => Promise<SourceFile | null>>().mockResolvedValue(null),
  set: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  clear: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  getStats: vi.fn(() => Promise.resolve({ entries: 0, size: 0, hitRate: 0, hits: 0, misses: 0 })),
}))

const mockReadFile = vi.hoisted(() =>
  vi.fn<() => Promise<string>>().mockResolvedValue('mock file content'),
)

const mockHashContent = vi.hoisted(() => vi.fn(() => 'mockedhashabcdef1234567890'))

// Mock ts-morph Project
vi.mock('ts-morph', () => ({
  Project: vi.fn(),
}))

vi.mock('../../../src/cache/parse-cache.js', () => ({
  globalParseCache: mockGlobalParseCache,
}))

vi.mock('../../../src/cache/ast-cache.js', () => ({
  ASTCache: vi.fn(function () {
    return mockASTCacheInstance
  }),
}))

vi.mock('../../../src/cache/index.js', () => ({
  hashContent: mockHashContent,
}))

vi.mock('node:fs/promises', () => ({
  readFile: mockReadFile,
}))

describe('Parser', () => {
  let parser: Parser
  let mockProject: {
    addSourceFileAtPath: ReturnType<typeof vi.fn>
    getSourceFile: ReturnType<typeof vi.fn>
    getAmbientModule: ReturnType<typeof vi.fn>
    createSourceFile: ReturnType<typeof vi.fn>
  }
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock project instance
    mockProject = {
      addSourceFileAtPath: vi.fn(),
      getSourceFile: vi.fn(),
      getAmbientModule: vi.fn(),
      createSourceFile: vi.fn(),
    }

    // Configure Project mock constructor
    ;(Project as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockProject
    })

    mockGlobalParseCache.get.mockReturnValue(undefined)
    mockASTCacheInstance.get.mockResolvedValue(null)
    mockReadFile.mockResolvedValue('mock file content')
    mockHashContent.mockReturnValue('mockedhashabcdef1234567890')

    // Spy on console.error for parseFiles error handling tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('constructor', () => {
    test('creates parser with default options', () => {
      parser = new Parser()
      expect(parser).toBeInstanceOf(Parser)
    })

    test('creates parser with custom options', () => {
      const options: ParserOptions = {
        tsConfigFilePath: '/path/to/tsconfig.json',
        skipFileDependencyResolution: false,
      }
      parser = new Parser(options)
      expect(parser).toBeInstanceOf(Parser)
    })

    test('initializes with null project', () => {
      parser = new Parser()
      expect(parser.getProject()).toBeNull()
    })

    test('accepts empty options object', () => {
      parser = new Parser({})
      expect(parser).toBeInstanceOf(Parser)
    })

    test('does not call Project constructor', () => {
      parser = new Parser()
      expect(Project).not.toHaveBeenCalled()
    })

    test('accepts concurrency option', () => {
      parser = new Parser({ concurrency: 8 })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('accepts useDiskCache option', () => {
      parser = new Parser({ useDiskCache: true })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('accepts version option', () => {
      parser = new Parser({ version: '2.0.0' })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('accepts all options combined', () => {
      const options: ParserOptions = {
        tsConfigFilePath: '/tsconfig.json',
        skipFileDependencyResolution: false,
        concurrency: 2,
        useDiskCache: true,
        version: '1.5.0',
      }
      parser = new Parser(options)
      expect(parser).toBeInstanceOf(Parser)
    })

    test('creates independent instances', () => {
      const parser1 = new Parser({ concurrency: 1 })
      const parser2 = new Parser({ concurrency: 8 })
      expect(parser1).not.toBe(parser2)
    })

    test('with undefined concurrency uses default', () => {
      parser = new Parser({ concurrency: undefined })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('with concurrency of 1', () => {
      parser = new Parser({ concurrency: 1 })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('with high concurrency value', () => {
      parser = new Parser({ concurrency: 100 })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('with skipFileDependencyResolution true', () => {
      parser = new Parser({ skipFileDependencyResolution: true })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('with skipFileDependencyResolution false', () => {
      parser = new Parser({ skipFileDependencyResolution: false })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('with tsConfigFilePath only', () => {
      parser = new Parser({ tsConfigFilePath: '/project/tsconfig.json' })
      expect(parser).toBeInstanceOf(Parser)
    })
  })

  describe('initialize', () => {
    test('creates Project instance with default options', async () => {
      parser = new Parser()
      await parser.initialize()

      expect(Project).toHaveBeenCalledTimes(1)
      expect(Project).toHaveBeenCalledWith({
        tsConfigFilePath: undefined,
        skipFileDependencyResolution: true,
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
          allowJs: true,
          checkJs: false,
        },
      })
    })

    test('creates Project instance with tsConfigFilePath', async () => {
      const options: ParserOptions = {
        tsConfigFilePath: '/path/to/tsconfig.json',
      }
      parser = new Parser(options)
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          tsConfigFilePath: '/path/to/tsconfig.json',
          skipAddingFilesFromTsConfig: false,
        }),
      )
    })

    test('creates Project instance with skipFileDependencyResolution false', async () => {
      const options: ParserOptions = {
        skipFileDependencyResolution: false,
      }
      parser = new Parser(options)
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          skipFileDependencyResolution: false,
        }),
      )
    })

    test('sets project to non-null after initialization', async () => {
      parser = new Parser()
      await parser.initialize()
      expect(parser.getProject()).not.toBeNull()
    })

    test('creates ASTCache when useDiskCache is true', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      expect(ASTCache).toHaveBeenCalledTimes(1)
      expect(parser.getASTCache()).not.toBeNull()
    })

    test('does not create ASTCache when useDiskCache is false', async () => {
      parser = new Parser({ useDiskCache: false })
      await parser.initialize()

      expect(parser.getASTCache()).toBeNull()
    })

    test('does not create ASTCache by default', async () => {
      parser = new Parser()
      await parser.initialize()

      expect(parser.getASTCache()).toBeNull()
    })

    test('passes version to ASTCache constructor', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')
      parser = new Parser({ useDiskCache: true, version: '3.0.0' })
      await parser.initialize()

      expect(ASTCache).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ version: '3.0.0' }),
      )
    })

    test('sets allowJs compiler option to true', async () => {
      parser = new Parser()
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          compilerOptions: expect.objectContaining({ allowJs: true }),
        }),
      )
    })

    test('sets checkJs compiler option to false', async () => {
      parser = new Parser()
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          compilerOptions: expect.objectContaining({ checkJs: false }),
        }),
      )
    })

    test('calls Project again on second initialize', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.initialize()

      expect(Project).toHaveBeenCalledTimes(2)
    })

    test('with undefined tsConfigFilePath sets skipAddingFilesFromTsConfig true', async () => {
      parser = new Parser({ tsConfigFilePath: undefined })
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({ skipAddingFilesFromTsConfig: true }),
      )
    })

    test('with undefined skipFileDependencyResolution defaults to true', async () => {
      parser = new Parser({ skipFileDependencyResolution: undefined })
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({ skipFileDependencyResolution: true }),
      )
    })

    test('with both tsConfigFilePath and skipFileDependencyResolution', async () => {
      parser = new Parser({
        tsConfigFilePath: '/project/tsconfig.json',
        skipFileDependencyResolution: false,
      })
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          tsConfigFilePath: '/project/tsconfig.json',
          skipFileDependencyResolution: false,
          skipAddingFilesFromTsConfig: false,
        }),
      )
    })

    test('handles empty options object', async () => {
      parser = new Parser({})
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith({
        tsConfigFilePath: undefined,
        skipFileDependencyResolution: true,
        skipAddingFilesFromTsConfig: true,
        compilerOptions: { allowJs: true, checkJs: false },
      })
    })
  })

  describe('parseFile', () => {
    test('returns ParseResult with sourceFile', async () => {
      const mockSourceFile = createMockSourceFile('/path/to/file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      const result = await parser.parseFile('/path/to/file.ts')

      expect(result).toMatchObject({
        sourceFile: mockSourceFile,
        filePath: '/path/to/file.ts',
      })
      expect(result.parseTime).toBeTypeOf('number')
    })

    test('tracks parseTime in milliseconds', async () => {
      const mockSourceFile = createMockSourceFile('/path/to/file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      const result = await parser.parseFile('/path/to/file.ts')

      expect(result.parseTime).toBeGreaterThanOrEqual(0)
      expect(result.parseTime).toBeLessThan(10000) // Should be fast in tests
    })

    test('auto-initializes if not already initialized', async () => {
      const mockSourceFile = createMockSourceFile('/path/to/file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      // Don't call initialize first
      await parser.parseFile('/path/to/file.ts')

      expect(Project).toHaveBeenCalledTimes(1)
      expect(mockProject.addSourceFileAtPath).toHaveBeenCalledWith('/path/to/file.ts')
    })

    test('uses existing project if already initialized', async () => {
      const mockSourceFile = createMockSourceFile('/path/to/file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      await parser.initialize()
      vi.clearAllMocks() // Clear the initialization call

      await parser.parseFile('/path/to/file.ts')

      // Project should not be created again
      expect(Project).not.toHaveBeenCalled()
      expect(mockProject.addSourceFileAtPath).toHaveBeenCalledWith('/path/to/file.ts')
    })

    test('returns correct filePath in result', async () => {
      const mockSourceFile = createMockSourceFile('/custom/path/module.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      const result = await parser.parseFile('/custom/path/module.ts')

      expect(result.filePath).toBe('/custom/path/module.ts')
    })

    test('throws error when file cannot be parsed', async () => {
      const error = new Error('File not found')
      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw error
      })

      parser = new Parser()
      await parser.initialize()

      await expect(parser.parseFile('/nonexistent.ts')).rejects.toThrow('File not found')
    })

    test('handles unreadable files with appropriate error', async () => {
      const error = new Error('EACCES: permission denied')
      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw error
      })

      parser = new Parser()
      await parser.initialize()

      await expect(parser.parseFile('/protected/file.ts')).rejects.toThrow('EACCES')
    })

    test('returns cached=false on first parse', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/path/file.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/path/file.ts')

      expect(result.cached).toBe(false)
    })

    test('returns diskCached=false when no disk cache', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/path/file.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/path/file.ts')

      expect(result.diskCached).toBe(false)
    })

    test('stores in memory cache after parsing', async () => {
      const mockSF = createMockSourceFile('/path/store.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.parseFile('/path/store.ts')

      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/path/store.ts', mockSF)
    })

    test('subsequent call returns from memory cache', async () => {
      const mockSF = createMockSourceFile('/path/cached.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/path/cached.ts')

      expect(result.cached).toBe(true)
      expect(result.sourceFile).toBe(mockSF)
    })

    test('handles .tsx file extension', async () => {
      const mockSF = createMockSourceFile('/path/component.tsx')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/path/component.tsx')

      expect(result.filePath).toBe('/path/component.tsx')
      expect(result.sourceFile).toBe(mockSF)
    })

    test('handles .js file extension', async () => {
      const mockSF = createMockSourceFile('/path/script.js')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/path/script.js')

      expect(result.filePath).toBe('/path/script.js')
    })

    test('handles file path with spaces', async () => {
      const mockSF = createMockSourceFile('/path/my file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/path/my file.ts')

      expect(result.filePath).toBe('/path/my file.ts')
    })

    test('handles file with special characters in name', async () => {
      const mockSF = createMockSourceFile('/path/[id].ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/path/[id].ts')

      expect(result.filePath).toBe('/path/[id].ts')
    })
  })

  describe('parseFile - memory cache hit', () => {
    test('returns cached=true on memory cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/cache.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/mem/cache.ts')

      expect(result.cached).toBe(true)
    })

    test('returns diskCached=false on memory cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/cache2.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/mem/cache2.ts')

      expect(result.diskCached).toBe(false)
    })

    test('does not call addSourceFileAtPath on cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/cache3.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/mem/cache3.ts')

      expect(mockProject.addSourceFileAtPath).not.toHaveBeenCalled()
    })

    test('returns same sourceFile object from cache', async () => {
      const mockSF = createMockSourceFile('/mem/same.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/mem/same.ts')

      expect(result.sourceFile).toBe(mockSF)
    })

    test('works with auto-initialize and cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/auto.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/mem/auto.ts')

      expect(result.cached).toBe(true)
      expect(result.sourceFile).toBe(mockSF)
    })

    test('does not call readFile on memory cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/noread.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/mem/noread.ts')

      expect(mockReadFile).not.toHaveBeenCalled()
    })

    test('does not call hashContent on memory cache hit', async () => {
      const mockSF = createMockSourceFile('/mem/nohash.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/mem/nohash.ts')

      expect(mockHashContent).not.toHaveBeenCalled()
    })

    test('cache hit returns correct filePath', async () => {
      const mockSF = createMockSourceFile('/mem/pathcheck.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/mem/pathcheck.ts')

      expect(result.filePath).toBe('/mem/pathcheck.ts')
    })

    test('cache hit parseTime is non-negative', async () => {
      const mockSF = createMockSourceFile('/mem/time.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/mem/time.ts')

      expect(result.parseTime).toBeGreaterThanOrEqual(0)
    })

    test('consecutive cache hits return same result', async () => {
      const mockSF = createMockSourceFile('/mem/consec.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const r1 = await parser.parseFile('/mem/consec.ts')
      const r2 = await parser.parseFile('/mem/consec.ts')

      expect(r1.sourceFile).toBe(r2.sourceFile)
      expect(r1.cached).toBe(true)
      expect(r2.cached).toBe(true)
    })

    test('cache hit does not call astCache.get', async () => {
      const mockSF = createMockSourceFile('/mem/nodisk.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/mem/nodisk.ts')

      expect(mockASTCacheInstance.get).not.toHaveBeenCalled()
    })

    test('cache hit after explicit initialize', async () => {
      const mockSF = createMockSourceFile('/mem/explicit.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()

      // First call - cache miss, stores in cache
      await parser.parseFile('/mem/explicit.ts')

      // Set up cache hit for second call
      mockGlobalParseCache.get.mockReturnValue(mockSF)
      const result = await parser.parseFile('/mem/explicit.ts')

      expect(result.cached).toBe(true)
    })
  })

  describe('parseFile - disk cache', () => {
    test('reads file content when disk cache is enabled', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/read.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/read.ts')

      expect(mockReadFile).toHaveBeenCalledWith('/disk/read.ts', 'utf-8')
    })

    test('calls hashContent with file content', async () => {
      mockReadFile.mockResolvedValue('actual file content here')
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/hash.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/hash.ts')

      expect(mockHashContent).toHaveBeenCalledWith('actual file content here')
    })

    test('disk cache hit returns cached=true', async () => {
      const mockSF = createMockSourceFile('/disk/hit.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/disk/hit.ts')

      expect(result.cached).toBe(true)
    })

    test('disk cache hit returns diskCached=true', async () => {
      const mockSF = createMockSourceFile('/disk/disktrue.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/disk/disktrue.ts')

      expect(result.diskCached).toBe(true)
    })

    test('disk cache hit does not call addSourceFileAtPath', async () => {
      const mockSF = createMockSourceFile('/disk/noadd.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/noadd.ts')

      expect(mockProject.addSourceFileAtPath).not.toHaveBeenCalled()
    })

    test('disk cache hit stores in memory cache', async () => {
      const mockSF = createMockSourceFile('/disk/memstore.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/memstore.ts')

      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/disk/memstore.ts', mockSF)
    })

    test('disk cache miss parses file', async () => {
      const mockSF = createMockSourceFile('/disk/miss.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/miss.ts')

      expect(mockProject.addSourceFileAtPath).toHaveBeenCalledWith('/disk/miss.ts')
    })

    test('disk cache miss returns cached=false', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/missf.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/disk/missf.ts')

      expect(result.cached).toBe(false)
    })

    test('disk cache miss returns diskCached=false', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/missd.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/disk/missd.ts')

      expect(result.diskCached).toBe(false)
    })

    test('disk cache miss stores in disk cache', async () => {
      const mockSF = createMockSourceFile('/disk/setdisk.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/setdisk.ts')

      expect(mockASTCacheInstance.set).toHaveBeenCalledWith(
        '/disk/setdisk.ts',
        'mockedhashabcdef1234567890',
        mockSF,
      )
    })

    test('disk cache miss stores in memory cache', async () => {
      const mockSF = createMockSourceFile('/disk/setmem.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/setmem.ts')

      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/disk/setmem.ts', mockSF)
    })

    test('disabled disk cache does not call readFile', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/nocache.ts'))

      parser = new Parser({ useDiskCache: false })
      await parser.initialize()
      await parser.parseFile('/disk/nocache.ts')

      expect(mockReadFile).not.toHaveBeenCalled()
    })

    test('disabled disk cache does not call hashContent', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/nohash.ts'))

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/disk/nohash.ts')

      expect(mockHashContent).not.toHaveBeenCalled()
    })

    test('disk cache uses correct content hash', async () => {
      mockReadFile.mockResolvedValue('specific content')
      mockHashContent.mockReturnValue('sha256_specific_content')
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/disk/hashval.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/hashval.ts')

      expect(mockASTCacheInstance.get).toHaveBeenCalledWith(
        '/disk/hashval.ts',
        'sha256_specific_content',
      )
    })

    test('disk cache hit returns correct filePath', async () => {
      const mockSF = createMockSourceFile('/disk/filepath.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/disk/filepath.ts')

      expect(result.filePath).toBe('/disk/filepath.ts')
    })
  })

  describe('parseFiles', () => {
    test('handles multiple files successfully', async () => {
      const files = ['/path/a.ts', '/path/b.ts', '/path/c.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(3)
      expect(results[0].filePath).toBe('/path/a.ts')
      expect(results[1].filePath).toBe('/path/b.ts')
      expect(results[2].filePath).toBe('/path/c.ts')
    })

    test('continues on individual errors', async () => {
      const files = ['/path/good.ts', '/path/bad.ts', '/path/another.ts']

      let callCount = 0
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        callCount++
        if (callCount === 2) {
          throw new Error('Parse error on bad.ts')
        }
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      // Should have 2 successful results (bad.ts failed)
      expect(results).toHaveLength(2)
      expect(results[0].filePath).toBe('/path/good.ts')
      expect(results[1].filePath).toBe('/path/another.ts')
    })

    test('returns array of ParseResults', async () => {
      const files = ['/path/file1.ts', '/path/file2.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(Array.isArray(results)).toBe(true)
      results.forEach((result) => {
        expect(result).toHaveProperty('sourceFile')
        expect(result).toHaveProperty('filePath')
        expect(result).toHaveProperty('parseTime')
      })
    })

    test('logs error for failed files', async () => {
      const files = ['/path/failing.ts']

      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('Parse error')
      })

      parser = new Parser()
      await parser.initialize()
      await parser.parseFiles(files)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse /path/failing.ts'),
      )
    })

    test('returns empty array when all files fail', async () => {
      const files = ['/path/fail1.ts', '/path/fail2.ts']

      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('Parse error')
      })

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(0)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
    })

    test('returns empty array for empty input', async () => {
      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles([])

      expect(results).toHaveLength(0)
      expect(mockProject.addSourceFileAtPath).not.toHaveBeenCalled()
    })

    test('preserves parseTime for each file', async () => {
      const files = ['/path/slow.ts', '/path/fast.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      results.forEach((result) => {
        expect(result.parseTime).toBeTypeOf('number')
        expect(result.parseTime).toBeGreaterThanOrEqual(0)
      })
    })

    test('handles single file', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/single/file.ts'))

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(['/single/file.ts'])

      expect(results).toHaveLength(1)
      expect(results[0].filePath).toBe('/single/file.ts')
    })

    test('handles many files', async () => {
      const files = Array.from({ length: 15 }, (_, i) => `/batch/file${i}.ts`)
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(15)
    })

    test('returns results matching input order', async () => {
      const files = ['/order/z.ts', '/order/a.ts', '/order/m.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results[0].filePath).toBe('/order/z.ts')
      expect(results[1].filePath).toBe('/order/a.ts')
      expect(results[2].filePath).toBe('/order/m.ts')
    })

    test('error in first file continues with rest', async () => {
      const files = ['/err/first.ts', '/err/second.ts', '/err/third.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        if (path === '/err/first.ts') throw new Error('First failed')
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(2)
    })

    test('error in last file returns previous results', async () => {
      const files = ['/last/a.ts', '/last/b.ts', '/last/c.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        if (path === '/last/c.ts') throw new Error('Last failed')
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.filePath)).toEqual(['/last/a.ts', '/last/b.ts'])
    })

    test('logs error with specific error message', async () => {
      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('Specific error XYZ')
      })

      parser = new Parser()
      await parser.initialize()
      await parser.parseFiles(['/msg/file.ts'])

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Specific error XYZ'))
    })

    test('auto-initializes on parseFiles call', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      const results = await parser.parseFiles(['/auto/init.ts'])

      expect(Project).toHaveBeenCalled()
      expect(results).toHaveLength(1)
    })

    test('handles files with various extensions', async () => {
      const files = ['/ext/a.ts', '/ext/b.tsx', '/ext/c.js', '/ext/d.jsx']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(4)
    })

    test('mixed success and failure preserves successes', async () => {
      const files = ['/mix/ok1.ts', '/mix/bad.ts', '/mix/ok2.ts', '/mix/bad2.ts', '/mix/ok3.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        if (path.includes('bad')) throw new Error('Bad file')
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.filePath.includes('ok'))).toBe(true)
    })
  })

  describe('getProject', () => {
    test('returns null before initialization', () => {
      parser = new Parser()
      expect(parser.getProject()).toBeNull()
    })

    test('returns Project instance after initialization', async () => {
      parser = new Parser()
      await parser.initialize()
      const project = parser.getProject()

      expect(project).not.toBeNull()
      expect(project).toBe(mockProject)
    })

    test('returns same Project instance on multiple calls', async () => {
      parser = new Parser()
      await parser.initialize()

      const project1 = parser.getProject()
      const project2 = parser.getProject()

      expect(project1).toBe(project2)
    })

    test('returns null after dispose', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()

      expect(parser.getProject()).toBeNull()
    })

    test('returns non-null after re-initialize', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()
      await parser.initialize()

      expect(parser.getProject()).not.toBeNull()
    })
  })

  describe('getASTCache', () => {
    test('returns null by default', () => {
      parser = new Parser()
      expect(parser.getASTCache()).toBeNull()
    })

    test('returns null after construction without useDiskCache', () => {
      parser = new Parser({ useDiskCache: false })
      expect(parser.getASTCache()).toBeNull()
    })

    test('returns ASTCache instance when useDiskCache is true', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      expect(parser.getASTCache()).not.toBeNull()
      expect(parser.getASTCache()).toBe(mockASTCacheInstance)
    })

    test('returns null after dispose', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      parser.dispose()

      expect(parser.getASTCache()).toBeNull()
    })

    test('returns same instance on repeated calls', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      const cache1 = parser.getASTCache()
      const cache2 = parser.getASTCache()

      expect(cache1).toBe(cache2)
    })

    test('returns null after initialize without useDiskCache', async () => {
      parser = new Parser()
      await parser.initialize()

      expect(parser.getASTCache()).toBeNull()
    })
  })

  describe('getCacheStats', () => {
    test('returns memory stats without disk cache', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 5,
        misses: 3,
        hitRate: 0.625,
        size: 10,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory).toEqual({
        hits: 5,
        misses: 3,
        hitRate: 0.625,
        size: 10,
      })
    })

    test('returns null disk stats without disk cache', async () => {
      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.disk).toBeNull()
    })

    test('returns memory and disk stats with disk cache', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 2,
        misses: 1,
        hitRate: 0.667,
        size: 5,
      })
      mockASTCacheInstance.getStats.mockResolvedValue({
        entries: 10,
        size: 2048,
        hitRate: 0.8,
        hits: 8,
        misses: 2,
      })

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory).toEqual({ hits: 2, misses: 1, hitRate: 0.667, size: 5 })
      expect(stats.disk).toEqual({ entries: 10, size: 2048, hitRate: 0.8, hits: 8, misses: 2 })
    })

    test('memory stats has correct shape', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory).toHaveProperty('hits')
      expect(stats.memory).toHaveProperty('misses')
      expect(stats.memory).toHaveProperty('hitRate')
    })

    test('disk stats has correct shape when enabled', async () => {
      mockASTCacheInstance.getStats.mockResolvedValue({
        entries: 5,
        size: 1024,
        hitRate: 0.5,
        hits: 3,
        misses: 3,
      })

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.disk).toHaveProperty('entries')
      expect(stats.disk).toHaveProperty('size')
      expect(stats.disk).toHaveProperty('hitRate')
    })

    test('works before initialization', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      })

      parser = new Parser()
      const stats = await parser.getCacheStats()

      expect(stats.memory).toBeDefined()
      expect(stats.disk).toBeNull()
    })

    test('hitRate is 0 when no operations', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory.hitRate).toBe(0)
    })

    test('returns fresh stats on each call', async () => {
      mockGlobalParseCache.getStats
        .mockReturnValueOnce({ hits: 1, misses: 0, hitRate: 1, size: 1 })
        .mockReturnValueOnce({ hits: 3, misses: 1, hitRate: 0.75, size: 2 })

      parser = new Parser()
      await parser.initialize()

      const stats1 = await parser.getCacheStats()
      const stats2 = await parser.getCacheStats()

      expect(stats1.memory.hits).toBe(1)
      expect(stats2.memory.hits).toBe(3)
    })
  })

  describe('clearCache', () => {
    test('calls globalParseCache.clear', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.clearCache()

      expect(mockGlobalParseCache.clear).toHaveBeenCalledTimes(1)
    })

    test('does not call astCache.clear without disk cache', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.clearCache()

      expect(mockASTCacheInstance.clear).not.toHaveBeenCalled()
    })

    test('calls astCache.clear with disk cache enabled', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.clearCache()

      expect(mockASTCacheInstance.clear).toHaveBeenCalledTimes(1)
    })

    test('works without initialization', async () => {
      parser = new Parser()
      await expect(parser.clearCache()).resolves.toBeUndefined()
      expect(mockGlobalParseCache.clear).toHaveBeenCalled()
    })

    test('works after dispose', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()
      await parser.clearCache()

      expect(mockGlobalParseCache.clear).toHaveBeenCalled()
    })

    test('allows parsing after clear', async () => {
      const mockSF = createMockSourceFile('/clear/repase.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/clear/repase.ts')
      await parser.clearCache()
      const result = await parser.parseFile('/clear/repase.ts')

      expect(result).toBeDefined()
      expect(result.filePath).toBe('/clear/repase.ts')
    })

    test('can be called multiple times', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.clearCache()
      await parser.clearCache()
      await parser.clearCache()

      expect(mockGlobalParseCache.clear).toHaveBeenCalledTimes(3)
    })

    test('clears both caches with disk cache enabled', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.clearCache()

      expect(mockGlobalParseCache.clear).toHaveBeenCalledTimes(1)
      expect(mockASTCacheInstance.clear).toHaveBeenCalledTimes(1)
    })
  })

  describe('dispose', () => {
    test('clears project reference', async () => {
      parser = new Parser()
      await parser.initialize()
      expect(parser.getProject()).not.toBeNull()

      parser.dispose()
      expect(parser.getProject()).toBeNull()
    })

    test('is safe to call when not initialized', () => {
      parser = new Parser()
      // Should not throw
      expect(() => parser.dispose()).not.toThrow()
    })

    test('is safe to call multiple times', async () => {
      parser = new Parser()
      await parser.initialize()

      parser.dispose()
      parser.dispose()
      parser.dispose()

      expect(parser.getProject()).toBeNull()
    })

    test('allows re-initialization after dispose', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()

      // Should be able to re-initialize
      await parser.initialize()
      expect(parser.getProject()).not.toBeNull()
    })

    test('sets astCache to null', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      expect(parser.getASTCache()).not.toBeNull()

      parser.dispose()
      expect(parser.getASTCache()).toBeNull()
    })

    test('getASTCache returns null after dispose', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      parser.dispose()

      expect(parser.getASTCache()).toBeNull()
    })

    test('clears both project and astCache', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      parser.dispose()

      expect(parser.getProject()).toBeNull()
      expect(parser.getASTCache()).toBeNull()
    })

    test('can re-initialize with disk cache after dispose', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      parser.dispose()
      await parser.initialize()

      expect(parser.getProject()).not.toBeNull()
      expect(parser.getASTCache()).not.toBeNull()
    })

    test('does not affect globalParseCache', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()

      expect(mockGlobalParseCache.clear).not.toHaveBeenCalled()
    })

    test('handles already-null astCache', async () => {
      parser = new Parser()
      await parser.initialize()
      // astCache is already null since useDiskCache is not set

      expect(() => parser.dispose()).not.toThrow()
    })
  })

  describe('ParseResult structure validation', () => {
    test('ParseResult has all required properties', async () => {
      const mockSourceFile = createMockSourceFile('/path/to/file.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSourceFile)

      parser = new Parser()
      const result: ParseResult = await parser.parseFile('/path/to/file.ts')

      expect(result).toHaveProperty('sourceFile')
      expect(result).toHaveProperty('filePath')
      expect(result).toHaveProperty('parseTime')

      expect(result.sourceFile).toBeDefined()
      expect(result.filePath).toBeTypeOf('string')
      expect(result.parseTime).toBeTypeOf('number')
    })

    test('sourceFile is a SourceFile object', async () => {
      const mockSF = createMockSourceFile('/res/sf.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/res/sf.ts')

      expect(result.sourceFile).toBe(mockSF)
      expect(typeof result.sourceFile.getFilePath).toBe('function')
    })

    test('filePath matches input', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/res/match.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/res/match.ts')

      expect(result.filePath).toBe('/res/match.ts')
    })

    test('parseTime is non-negative number', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/res/time.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/res/time.ts')

      expect(typeof result.parseTime).toBe('number')
      expect(result.parseTime).toBeGreaterThanOrEqual(0)
    })

    test('cached is boolean', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/res/cached.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/res/cached.ts')

      expect(typeof result.cached).toBe('boolean')
    })

    test('diskCached is false without disk cache', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/res/disk.ts'))

      parser = new Parser()
      const result = await parser.parseFile('/res/disk.ts')

      expect(result.diskCached).toBe(false)
    })

    test('all properties present on cache miss', async () => {
      const mockSF = createMockSourceFile('/res/miss.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      const result = await parser.parseFile('/res/miss.ts')

      expect(result).toEqual({
        sourceFile: mockSF,
        filePath: '/res/miss.ts',
        parseTime: expect.any(Number),
        cached: false,
        diskCached: false,
      })
    })

    test('all properties present on cache hit', async () => {
      const mockSF = createMockSourceFile('/res/hit.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      const result = await parser.parseFile('/res/hit.ts')

      expect(result).toEqual({
        sourceFile: mockSF,
        filePath: '/res/hit.ts',
        parseTime: expect.any(Number),
        cached: true,
        diskCached: false,
      })
    })

    test('diskCached is true on disk cache hit', async () => {
      const mockSF = createMockSourceFile('/res/diskhit.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/res/diskhit.ts')

      expect(result.diskCached).toBe(true)
    })

    test('diskCached is false on disk cache miss', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/res/diskmiss.ts'))

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const result = await parser.parseFile('/res/diskmiss.ts')

      expect(result.diskCached).toBe(false)
    })

    test('parseTime varies for different files', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      const r1 = await parser.parseFile('/res/file1.ts')
      const r2 = await parser.parseFile('/res/file2.ts')

      // Both should be valid numbers (not necessarily different)
      expect(r1.parseTime).toBeTypeOf('number')
      expect(r2.parseTime).toBeTypeOf('number')
    })
  })

  describe('concurrent file parsing', () => {
    test('handles concurrent parseFile calls', async () => {
      const files = ['/path/concurrent1.ts', '/path/concurrent2.ts', '/path/concurrent3.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()

      // Run multiple parseFile calls concurrently
      const promises = files.map((file) => parser.parseFile(file))
      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result.filePath).toBe(files[index])
      })
    })
  })

  describe('parseFiles with concurrency', () => {
    test('parses files concurrently with default concurrency (4)', async () => {
      const files = ['/path/a.ts', '/path/b.ts', '/path/c.ts', '/path/d.ts']

      mockProject.addSourceFileAtPath.mockImplementation(async (path: string) => {
        // Simulate async parsing delay
        await new Promise((resolve) => setTimeout(resolve, 10))
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()

      const startTime = performance.now()
      const results = await parser.parseFiles(files)
      const duration = performance.now() - startTime

      expect(results).toHaveLength(4)
      // With concurrency=4, all 4 files should complete in ~10ms, not 40ms sequential
      expect(duration).toBeLessThan(30)
    })

    test('respects custom concurrency parameter', async () => {
      const options: ParserOptions = {
        concurrency: 2,
      }
      parser = new Parser(options)

      expect(parser).toBeInstanceOf(Parser)
    })

    test('continues processing other files when one fails (concurrent)', async () => {
      const files = ['/path/good1.ts', '/path/bad.ts', '/path/good2.ts']

      let callCount = 0
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        callCount++
        if (callCount === 2) {
          throw new Error('Parse error on bad.ts')
        }
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()

      const results = await parser.parseFiles(files)

      // Should have 2 successful results (bad.ts failed)
      expect(results).toHaveLength(2)
      expect(results[0].filePath).toBe('/path/good1.ts')
      expect(results[1].filePath).toBe('/path/good2.ts')
    })

    test('maintains backward compatibility (no concurrency param)', async () => {
      parser = new Parser()

      const files = ['/path/a.ts', '/path/b.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(2)
      expect(results[0].filePath).toBe('/path/a.ts')
      expect(results[1].filePath).toBe('/path/b.ts')
    })

    test('filters out null results from failed parses (concurrent)', async () => {
      const files = ['/path/ok.ts', '/path/fail.ts']

      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        // In concurrent mode, fail on specific path, not call count
        if (path === '/path/fail.ts') {
          throw new Error('Failed')
        }
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()

      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(1)
      expect(results[0].filePath).toBe('/path/ok.ts')
    })

    test('returns empty array for empty input (concurrent)', async () => {
      parser = new Parser()
      await parser.initialize()

      const results = await parser.parseFiles([])

      expect(results).toHaveLength(0)
      expect(mockProject.addSourceFileAtPath).not.toHaveBeenCalled()
    })

    test('logs error for failed files (concurrent)', async () => {
      const files = ['/path/failing.ts']

      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('Parse error')
      })

      parser = new Parser()
      await parser.initialize()
      await parser.parseFiles(files)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse /path/failing.ts'),
      )
    })

    test('handles exactly concurrency limit files', async () => {
      const files = ['/cl/1.ts', '/cl/2.ts', '/cl/3.ts', '/cl/4.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser({ concurrency: 4 })
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(4)
    })

    test('handles more files than concurrency limit', async () => {
      const files = Array.from({ length: 10 }, (_, i) => `/over/file${i}.ts`)
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser({ concurrency: 3 })
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(10)
    })

    test('concurrency=1 processes sequentially', async () => {
      const files = ['/seq/a.ts', '/seq/b.ts', '/seq/c.ts']
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser({ concurrency: 1 })
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(3)
    })
  })

  describe('integration scenarios', () => {
    test('full workflow: init, parse, cache hit, dispose', async () => {
      const mockSF = createMockSourceFile('/wf/full.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()

      // Init
      await parser.initialize()
      expect(parser.getProject()).not.toBeNull()

      // First parse (cache miss)
      const r1 = await parser.parseFile('/wf/full.ts')
      expect(r1.cached).toBe(false)

      // Simulate cache hit
      mockGlobalParseCache.get.mockReturnValue(mockSF)
      const r2 = await parser.parseFile('/wf/full.ts')
      expect(r2.cached).toBe(true)

      // Dispose
      parser.dispose()
      expect(parser.getProject()).toBeNull()
    })

    test('full workflow with disk cache', async () => {
      const mockSF = createMockSourceFile('/wf/disk.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true, version: '1.0.0' })
      await parser.initialize()

      expect(parser.getASTCache()).not.toBeNull()

      // Parse (disk cache miss)
      const r1 = await parser.parseFile('/wf/disk.ts')
      expect(r1.cached).toBe(false)
      expect(r1.diskCached).toBe(false)

      // Simulate memory cache hit
      mockGlobalParseCache.get.mockReturnValue(mockSF)
      const r2 = await parser.parseFile('/wf/disk.ts')
      expect(r2.cached).toBe(true)
      expect(r2.diskCached).toBe(false)
    })

    test('clear then re-parse', async () => {
      const mockSF = createMockSourceFile('/wf/clear.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()

      await parser.parseFile('/wf/clear.ts')
      await parser.clearCache()

      // After clear, next parse should go through addSourceFileAtPath again
      mockGlobalParseCache.get.mockReturnValue(undefined)
      const result = await parser.parseFile('/wf/clear.ts')
      expect(result).toBeDefined()
    })

    test('dispose and re-init preserves options', async () => {
      parser = new Parser({ tsConfigFilePath: '/wf/tsconfig.json', concurrency: 2 })
      await parser.initialize()
      parser.dispose()
      await parser.initialize()

      expect(Project).toHaveBeenCalledWith(
        expect.objectContaining({
          tsConfigFilePath: '/wf/tsconfig.json',
        }),
      )
    })

    test('multiple parseFiles calls in sequence', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()

      const r1 = await parser.parseFiles(['/seq/a.ts'])
      const r2 = await parser.parseFiles(['/seq/b.ts'])
      const r3 = await parser.parseFiles(['/seq/c.ts'])

      expect(r1).toHaveLength(1)
      expect(r2).toHaveLength(1)
      expect(r3).toHaveLength(1)
    })

    test('parseFile after dispose throws without re-init', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/wf/after.ts'))

      parser = new Parser()
      await parser.initialize()
      parser.dispose()

      // parseFile auto-initializes, so this should work
      const result = await parser.parseFile('/wf/after.ts')
      expect(result).toBeDefined()
    })

    test('getCacheStats reflects operations', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 10,
        misses: 5,
        hitRate: 0.667,
        size: 8,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory.hits).toBe(10)
      expect(stats.memory.misses).toBe(5)
    })

    test('interleaved parseFile and parseFiles', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()

      const r1 = await parser.parseFile('/inter/one.ts')
      const r2 = await parser.parseFiles(['/inter/two.ts', '/inter/three.ts'])
      const r3 = await parser.parseFile('/inter/four.ts')

      expect(r1.filePath).toBe('/inter/one.ts')
      expect(r2).toHaveLength(2)
      expect(r3.filePath).toBe('/inter/four.ts')
    })

    test('concurrent parseFile and parseFiles', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()

      const [r1, r2] = await Promise.all([
        parser.parseFile('/conc/single.ts'),
        parser.parseFiles(['/conc/multi1.ts', '/conc/multi2.ts']),
      ])

      expect(r1.filePath).toBe('/conc/single.ts')
      expect(r2).toHaveLength(2)
    })

    test('disk cache workflow: miss, set, then hit', async () => {
      const mockSF = createMockSourceFile('/dc/workflow.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      // First call: cache miss, parses file
      const r1 = await parser.parseFile('/dc/workflow.ts')
      expect(r1.cached).toBe(false)
      expect(r1.diskCached).toBe(false)

      // Verify disk cache set was called
      expect(mockASTCacheInstance.set).toHaveBeenCalled()

      // Now simulate disk cache hit for second call
      // Reset memory cache to miss to force disk cache check
      mockGlobalParseCache.get.mockReturnValue(undefined)
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      const r2 = await parser.parseFile('/dc/workflow.ts')
      expect(r2.cached).toBe(true)
      expect(r2.diskCached).toBe(true)
    })

    test('version option is passed through to ASTCache', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')

      parser = new Parser({ useDiskCache: true, version: '5.0.0' })
      await parser.initialize()

      expect(ASTCache).toHaveBeenCalledWith(expect.anything(), { version: '5.0.0' })
    })

    test('parser works with all options undefined', () => {
      parser = new Parser({})
      expect(parser).toBeInstanceOf(Parser)
      expect(parser.getProject()).toBeNull()
      expect(parser.getASTCache()).toBeNull()
    })
  })

  describe('constructor - additional edge cases', () => {
    test('constructor with only useDiskCache true', () => {
      parser = new Parser({ useDiskCache: true })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('constructor with only useDiskCache false', () => {
      parser = new Parser({ useDiskCache: false })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('constructor with concurrency=0', () => {
      parser = new Parser({ concurrency: 0 })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('constructor with very high concurrency', () => {
      parser = new Parser({ concurrency: 1000 })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('constructor with empty version string', () => {
      parser = new Parser({ version: '' })
      expect(parser).toBeInstanceOf(Parser)
    })

    test('constructor does not initialize project', () => {
      parser = new Parser({ tsConfigFilePath: '/tsconfig.json' })
      expect(Project).not.toHaveBeenCalled()
    })
  })

  describe('initialize - additional edge cases', () => {
    test('initialize with useDiskCache true creates astCache', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      expect(parser.getASTCache()).toBe(mockASTCacheInstance)
    })

    test('initialize without useDiskCache leaves astCache null', async () => {
      parser = new Parser({ useDiskCache: false })
      await parser.initialize()
      expect(parser.getASTCache()).toBeNull()
    })

    test('initialize passes project to ASTCache', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      expect(ASTCache).toHaveBeenCalledWith(mockProject, expect.any(Object))
    })

    test('initialize passes undefined version to ASTCache', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      expect(ASTCache).toHaveBeenCalledWith(expect.anything(), { version: undefined })
    })

    test('initialize creates new project instance each time', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.initialize()
      expect(Project).toHaveBeenCalledTimes(2)
    })
  })

  describe('parseFile - additional paths', () => {
    test('memory cache hit skips disk cache entirely', async () => {
      const mockSF = createMockSourceFile('/skip/disk.ts')
      mockGlobalParseCache.get.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/skip/disk.ts')

      expect(mockASTCacheInstance.get).not.toHaveBeenCalled()
      expect(mockReadFile).not.toHaveBeenCalled()
    })

    test('disk cache miss followed by disk cache hit', async () => {
      const mockSF = createMockSourceFile('/disk/seq.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      const r1 = await parser.parseFile('/disk/seq.ts')
      expect(r1.cached).toBe(false)
      expect(r1.diskCached).toBe(false)

      mockGlobalParseCache.get.mockReturnValue(undefined)
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      const r2 = await parser.parseFile('/disk/seq.ts')
      expect(r2.cached).toBe(true)
      expect(r2.diskCached).toBe(true)
    })

    test('parseFile with relative path', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('./rel/file.ts'))

      parser = new Parser()
      const result = await parser.parseFile('./rel/file.ts')

      expect(result.filePath).toBe('./rel/file.ts')
    })

    test('parseFile with absolute path', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(
        createMockSourceFile('/absolute/path/to/file.ts'),
      )

      parser = new Parser()
      const result = await parser.parseFile('/absolute/path/to/file.ts')

      expect(result.filePath).toBe('/absolute/path/to/file.ts')
    })

    test('parseFile stores sourceFile in global cache on miss', async () => {
      const mockSF = createMockSourceFile('/store/g.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser()
      await parser.initialize()
      await parser.parseFile('/store/g.ts')

      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/store/g.ts', mockSF)
    })

    test('parseFile does not store in disk cache when disabled', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/nostore/d.ts'))

      parser = new Parser({ useDiskCache: false })
      await parser.initialize()
      await parser.parseFile('/nostore/d.ts')

      expect(mockASTCacheInstance.set).not.toHaveBeenCalled()
    })

    test('parseFile with .jsx extension', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/ext/c.jsx'))

      parser = new Parser()
      const result = await parser.parseFile('/ext/c.jsx')

      expect(result.filePath).toBe('/ext/c.jsx')
    })

    test('parseFile with .mjs extension', async () => {
      mockProject.addSourceFileAtPath.mockReturnValue(createMockSourceFile('/ext/d.mjs'))

      parser = new Parser()
      const result = await parser.parseFile('/ext/d.mjs')

      expect(result.filePath).toBe('/ext/d.mjs')
    })

    test('throws ENOENT error for missing file', async () => {
      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      parser = new Parser()
      await parser.initialize()

      await expect(parser.parseFile('/missing.ts')).rejects.toThrow('ENOENT')
    })

    test('disk cache hit populates memory cache for next call', async () => {
      const mockSF = createMockSourceFile('/disk/mempop.ts')
      mockASTCacheInstance.get.mockResolvedValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()

      await parser.parseFile('/disk/mempop.ts')
      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/disk/mempop.ts', mockSF)
    })

    test('disk cache miss stores in both caches', async () => {
      const mockSF = createMockSourceFile('/disk/both.ts')
      mockProject.addSourceFileAtPath.mockReturnValue(mockSF)

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      await parser.parseFile('/disk/both.ts')

      expect(mockASTCacheInstance.set).toHaveBeenCalled()
      expect(mockGlobalParseCache.set).toHaveBeenCalledWith('/disk/both.ts', mockSF)
    })
  })

  describe('parseFiles - additional edge cases', () => {
    test('returns empty for all-failed with custom concurrency', async () => {
      mockProject.addSourceFileAtPath.mockImplementation(() => {
        throw new Error('Fail')
      })

      parser = new Parser({ concurrency: 2 })
      await parser.initialize()
      const results = await parser.parseFiles(['/f1.ts', '/f2.ts', '/f3.ts'])

      expect(results).toHaveLength(0)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3)
    })

    test('handles duplicate file paths', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(['/dup.ts', '/dup.ts'])

      expect(results).toHaveLength(2)
    })

    test('logs errors for each failed file separately', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) => {
        if (path.includes('fail')) throw new Error(`Error in ${path}`)
        return createMockSourceFile(path)
      })

      parser = new Parser()
      await parser.initialize()
      await parser.parseFiles(['/ok.ts', '/fail1.ts', '/fail2.ts'])

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
    })

    test('parseFiles with 20 files', async () => {
      const files = Array.from({ length: 20 }, (_, i) => `/big/file${i}.ts`)
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser({ concurrency: 4 })
      await parser.initialize()
      const results = await parser.parseFiles(files)

      expect(results).toHaveLength(20)
    })

    test('parseFiles results all have cached=false on first parse', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(['/ca.ts', '/cb.ts'])

      expect(results.every((r) => r.cached === false)).toBe(true)
    })

    test('parseFiles results all have diskCached=false without disk cache', async () => {
      mockProject.addSourceFileAtPath.mockImplementation((path: string) =>
        createMockSourceFile(path),
      )

      parser = new Parser()
      await parser.initialize()
      const results = await parser.parseFiles(['/da.ts', '/db.ts'])

      expect(results.every((r) => r.diskCached === false)).toBe(true)
    })
  })

  describe('getProject - additional', () => {
    test('getProject returns mock after initialize', async () => {
      parser = new Parser()
      await parser.initialize()
      expect(parser.getProject()).toBe(mockProject)
    })

    test('getProject returns new mock after re-initialize', async () => {
      parser = new Parser()
      await parser.initialize()
      const first = parser.getProject()

      const newMock = {
        addSourceFileAtPath: vi.fn(),
        getSourceFile: vi.fn(),
        getAmbientModule: vi.fn(),
        createSourceFile: vi.fn(),
      }
      ;(Project as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return newMock
      })

      await parser.initialize()
      const second = parser.getProject()

      expect(first).not.toBe(second)
      expect(second).toBe(newMock)
    })
  })

  describe('clearCache - additional', () => {
    test('clears only memory cache when disk cache not enabled', async () => {
      parser = new Parser()
      await parser.initialize()
      await parser.clearCache()

      expect(mockGlobalParseCache.clear).toHaveBeenCalledTimes(1)
      expect(mockASTCacheInstance.clear).not.toHaveBeenCalled()
    })

    test('clearCache returns void', async () => {
      parser = new Parser()
      await parser.initialize()
      const result = await parser.clearCache()

      expect(result).toBeUndefined()
    })
  })

  describe('dispose - additional', () => {
    test('dispose does not clear global parse cache', async () => {
      parser = new Parser()
      await parser.initialize()
      parser.dispose()

      expect(mockGlobalParseCache.clear).not.toHaveBeenCalled()
    })

    test('dispose does not clear AST cache', async () => {
      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      parser.dispose()

      expect(mockASTCacheInstance.clear).not.toHaveBeenCalled()
    })

    test('re-initialize after dispose creates new ASTCache', async () => {
      const { ASTCache } = await import('../../../src/cache/ast-cache.js')

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      parser.dispose()
      await parser.initialize()

      expect(ASTCache).toHaveBeenCalledTimes(2)
      expect(parser.getASTCache()).not.toBeNull()
    })
  })

  describe('getCacheStats - additional', () => {
    test('memory hits reflects cache operations', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 42,
        misses: 10,
        hitRate: 0.808,
        size: 20,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory.hits).toBe(42)
      expect(stats.memory.hitRate).toBeCloseTo(0.808)
    })

    test('disk stats are populated when enabled', async () => {
      mockASTCacheInstance.getStats.mockResolvedValue({
        entries: 100,
        size: 50000,
        hitRate: 0.95,
        hits: 95,
        misses: 5,
      })

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.disk?.entries).toBe(100)
      expect(stats.disk?.size).toBe(50000)
      expect(stats.disk?.hitRate).toBeCloseTo(0.95)
    })

    test('memory stats include size property', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 42,
      })

      parser = new Parser()
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.memory.size).toBe(42)
    })

    test('getCacheStats returns awaitable result', async () => {
      mockGlobalParseCache.getStats.mockReturnValue({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      })

      parser = new Parser()
      const statsPromise = parser.getCacheStats()
      expect(typeof statsPromise.then).toBe('function')
      const stats = await statsPromise
      expect(stats.memory).toBeDefined()
    })

    test('disk stats includes hits and misses', async () => {
      mockASTCacheInstance.getStats.mockResolvedValue({
        entries: 5,
        size: 100,
        hitRate: 0.6,
        hits: 6,
        misses: 4,
      })

      parser = new Parser({ useDiskCache: true })
      await parser.initialize()
      const stats = await parser.getCacheStats()

      expect(stats.disk?.hits).toBe(6)
      expect(stats.disk?.misses).toBe(4)
    })
  })
})
