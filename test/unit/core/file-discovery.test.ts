import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as path from 'path'
import fg from 'fast-glob'
import {
  discoverFiles,
  DEFAULT_PATTERNS,
  DEFAULT_IGNORE,
  type FileDiscoveryOptions,
  type DiscoveredFile,
} from '../../../src/core/file-discovery'

// Mock fast-glob
vi.mock('fast-glob', () => ({
  default: {
    globStream: vi.fn(),
  },
}))

// Type for mock stream entries
type MockStreamEntry = AsyncIterable<string>

// Create mock async iterator for globStream
function createMockStream(files: string[]): MockStreamEntry {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const file of files) {
        yield file
      }
    },
  }
}

// Helper to get the mocked globStream
function getMockGlobStream(): ReturnType<typeof vi.fn> {
  return fg.globStream as ReturnType<typeof vi.fn>
}

describe('file-discovery', () => {
  let mockGlobStream: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockGlobStream = getMockGlobStream()
    mockGlobStream.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('DEFAULT_PATTERNS', () => {
    test('includes TypeScript file patterns', () => {
      expect(DEFAULT_PATTERNS).toContain('**/*.ts')
      expect(DEFAULT_PATTERNS).toContain('**/*.tsx')
    })

    test('includes JavaScript file patterns', () => {
      expect(DEFAULT_PATTERNS).toContain('**/*.js')
      expect(DEFAULT_PATTERNS).toContain('**/*.jsx')
    })

    test('has exactly 4 default patterns', () => {
      expect(DEFAULT_PATTERNS).toHaveLength(4)
    })
  })

  describe('DEFAULT_IGNORE', () => {
    test('ignores node_modules', () => {
      expect(DEFAULT_IGNORE).toContain('**/node_modules/**')
    })

    test('ignores dist directory', () => {
      expect(DEFAULT_IGNORE).toContain('**/dist/**')
    })

    test('ignores build directory', () => {
      expect(DEFAULT_IGNORE).toContain('**/build/**')
    })

    test('ignores git directory', () => {
      expect(DEFAULT_IGNORE).toContain('**/.git/**')
    })

    test('ignores coverage directory', () => {
      expect(DEFAULT_IGNORE).toContain('**/coverage/**')
    })

    test('ignores TypeScript declaration files', () => {
      expect(DEFAULT_IGNORE).toContain('**/*.d.ts')
    })

    test('has exactly 6 default ignore patterns', () => {
      expect(DEFAULT_IGNORE).toHaveLength(6)
    })
  })

  describe('discoverFiles', () => {
    describe('with default patterns', () => {
      test('uses default patterns when empty array provided', async () => {
        const mockFiles = ['/project/src/index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          DEFAULT_PATTERNS,
          expect.objectContaining({
            cwd: '/project',
          }),
        )
      })

      test('uses default patterns when no patterns specified', async () => {
        const mockFiles = ['/project/src/app.ts', '/project/src/utils.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(2)
        expect(mockGlobStream).toHaveBeenCalledWith(DEFAULT_PATTERNS, expect.any(Object))
      })

      test('uses default ignore patterns when empty array provided', async () => {
        const mockFiles = ['/project/src/index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            ignore: DEFAULT_IGNORE,
          }),
        )
      })
    })

    describe('with custom patterns', () => {
      test('uses custom patterns when provided', async () => {
        const mockFiles = ['/project/src/style.css']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const customPatterns = ['**/*.css']
        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(customPatterns, expect.any(Object))
      })

      test('supports multiple custom patterns', async () => {
        const mockFiles = ['/project/a.py', '/project/b.rb']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const customPatterns = ['**/*.py', '**/*.rb']
        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(customPatterns, expect.any(Object))
        expect(result).toHaveLength(2)
      })

      test('supports single custom pattern', async () => {
        const mockFiles = ['/project/README.md']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const customPatterns = ['README.md']
        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
      })
    })

    describe('with ignore patterns', () => {
      test('uses custom ignore patterns when provided', async () => {
        const mockFiles: string[] = []
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const customIgnore = ['**/vendor/**', '**/*.test.ts']
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            ignore: customIgnore,
          }),
        )
      })

      test('replaces default ignore with custom ignore', async () => {
        const mockFiles = ['/project/src/file.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const customIgnore = ['**/custom/**']
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toEqual(customIgnore)
        expect(callArgs[1].ignore).not.toContain('**/node_modules/**')
      })
    })

    describe('returns absolute and relative paths', () => {
      test('returns both relative and absolute paths', async () => {
        const mockFiles = ['/project/src/components/Button.tsx']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].absolutePath).toBe('/project/src/components/Button.tsx')
        expect(result[0].path).toBe('src/components/Button.tsx')
      })

      test('correctly computes relative path for nested files', async () => {
        const mockFiles = ['/project/src/deep/nested/path/to/file.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('src/deep/nested/path/to/file.ts')
      })

      test('handles files in root directory', async () => {
        const mockFiles = ['/project/index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('index.ts')
        expect(result[0].absolutePath).toBe('/project/index.ts')
      })
    })

    describe('handles empty results', () => {
      test('returns empty array when no files match', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/empty-project',
        }

        const result = await discoverFiles(options)

        expect(result).toEqual([])
      })

      test('returns empty array for non-existent directory', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/non/existent/path',
        }

        const result = await discoverFiles(options)

        expect(result).toEqual([])
      })
    })

    describe('handles nested directories', () => {
      test('discovers files in deeply nested directories', async () => {
        const mockFiles = [
          '/project/src/a.ts',
          '/project/src/utils/b.ts',
          '/project/src/utils/helpers/c.ts',
          '/project/src/features/auth/d.ts',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(4)
        expect(result.map((f) => f.path)).toContain('src/utils/helpers/c.ts')
      })

      test('handles multiple files at same level', async () => {
        const mockFiles = ['/project/src/index.ts', '/project/src/app.ts', '/project/src/main.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(3)
      })
    })

    describe('globStream configuration', () => {
      test('passes absolute: true to globStream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            absolute: true,
          }),
        )
      })

      test('passes onlyFiles: true to globStream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            onlyFiles: true,
          }),
        )
      })

      test('passes followSymbolicLinks: false to globStream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            followSymbolicLinks: false,
          }),
        )
      })

      test('passes suppressErrors: true to globStream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            suppressErrors: true,
          }),
        )
      })
    })

    describe('cwd path resolution', () => {
      test('resolves relative cwd to absolute path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: './relative/path',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('preserves absolute cwd path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const absolutePath = '/absolute/project/path'
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: absolutePath,
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].cwd).toBe(absolutePath)
      })
    })

    describe('return type structure', () => {
      test('returns DiscoveredFile array with correct structure', async () => {
        const mockFiles = ['/project/test.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toBeInstanceOf(Array)
        expect(result[0]).toHaveProperty('path')
        expect(result[0]).toHaveProperty('absolutePath')
        expect(typeof result[0].path).toBe('string')
        expect(typeof result[0].absolutePath).toBe('string')
      })

      test('maintains file order from stream', async () => {
        const mockFiles = ['/project/a.ts', '/project/b.ts', '/project/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('a.ts')
        expect(result[1].path).toBe('b.ts')
        expect(result[2].path).toBe('c.ts')
      })
    })
  })
})
