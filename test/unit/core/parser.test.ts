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

// Mock ts-morph Project
vi.mock('ts-morph', () => ({
  Project: vi.fn(),
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
})
