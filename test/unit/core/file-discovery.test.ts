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

    describe('onProgress callback', () => {
      test('calls onProgress for each file discovered', async () => {
        const mockFiles = ['/project/a.ts', '/project/b.ts', '/project/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).toHaveBeenCalledTimes(3)
      })

      test('calls onProgress with incrementing count', async () => {
        const mockFiles = ['/project/a.ts', '/project/b.ts', '/project/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).toHaveBeenNthCalledWith(1, 1)
        expect(onProgress).toHaveBeenNthCalledWith(2, 2)
        expect(onProgress).toHaveBeenNthCalledWith(3, 3)
      })

      test('does not call onProgress when no files found', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).not.toHaveBeenCalled()
      })

      test('calls onProgress with count 1 for single file', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/single.ts']))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).toHaveBeenCalledOnce()
        expect(onProgress).toHaveBeenCalledWith(1)
      })

      test('works without onProgress callback', async () => {
        const mockFiles = ['/project/a.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
        expect(result[0].path).toBe('a.ts')
      })

      test('calls onProgress for 10 files with correct counts', async () => {
        const mockFiles = Array.from({ length: 10 }, (_, i) => `/project/file${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).toHaveBeenCalledTimes(10)
        expect(onProgress).toHaveBeenLastCalledWith(10)
      })

      test('calls onProgress for 100 files', async () => {
        const mockFiles = Array.from({ length: 100 }, (_, i) => `/project/src/file${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const onProgress = vi.fn()
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress,
        }

        await discoverFiles(options)

        expect(onProgress).toHaveBeenCalledTimes(100)
        expect(onProgress).toHaveBeenLastCalledWith(100)
      })

      test('handles undefined onProgress gracefully', async () => {
        const mockFiles = ['/project/a.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
          onProgress: undefined,
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
      })
    })

    describe('path resolution edge cases', () => {
      test('handles Windows-style absolute paths', async () => {
        const mockFiles = ['C:\\project\\src\\index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: 'C:\\project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
        expect(result[0].absolutePath).toBe('C:\\project\\src\\index.ts')
      })

      test('handles dot-only cwd', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '.',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('handles double-dot relative path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '../sibling',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('handles deeply nested relative path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: './a/b/c/d/e/f',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('handles root path as cwd', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].cwd).toBe('/')
      })

      test('handles trailing slash in cwd', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/a.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project/',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
        expect(result[0].path).toBe('src/a.ts')
      })

      test('handles empty string cwd by resolving to cwd', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].cwd).toBe(path.resolve(''))
      })

      test('correctly computes relative path for single nested directory', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/lib/utils.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('lib/utils.ts')
      })

      test('correctly computes relative path for deeply nested file', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/a/b/c/d/e/f/g/h/i/j/k/deep.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('a/b/c/d/e/f/g/h/i/j/k/deep.ts')
      })

      test('preserves file extension in relative path', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/component.tsx']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('src/component.tsx')
        expect(result[0].path).toContain('.tsx')
      })

      test('preserves .jsx extension', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/App.jsx']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('src/App.jsx')
      })

      test('preserves .js extension', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/index.js']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('src/index.js')
      })

      test('handles file at project root', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/home/user/project/main.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/home/user/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('main.ts')
        expect(result[0].absolutePath).toBe('/home/user/project/main.ts')
      })

      test('handles file with same name in different directories', async () => {
        const mockFiles = ['/p/a/index.ts', '/p/b/index.ts', '/p/c/index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(3)
        const paths = result.map((f) => f.path)
        expect(paths).toContain('a/index.ts')
        expect(paths).toContain('b/index.ts')
        expect(paths).toContain('c/index.ts')
      })
    })

    describe('pattern combinations', () => {
      test('uses provided patterns when non-empty array', async () => {
        const customPatterns = ['**/*.vue']
        mockGlobStream.mockReturnValue(createMockStream(['/project/App.vue']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(customPatterns, expect.any(Object))
      })

      test('uses default patterns when patterns is empty array', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(DEFAULT_PATTERNS, expect.any(Object))
      })

      test('does not merge custom patterns with defaults', async () => {
        const customPatterns = ['**/*.svelte']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(customPatterns)
        expect(callArgs[0]).not.toContain('**/*.ts')
      })

      test('supports wildcard patterns', async () => {
        const customPatterns = ['**/*']
        mockGlobStream.mockReturnValue(createMockStream(['/project/a.ts']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(customPatterns, expect.any(Object))
      })

      test('supports negation patterns', async () => {
        const customPatterns = ['**/*.ts', '!**/*.spec.ts']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(customPatterns)
      })

      test('supports exact file path pattern', async () => {
        const customPatterns = ['src/exact-file.ts']
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/exact-file.ts']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
        expect(result[0].path).toBe('src/exact-file.ts')
      })

      test('supports directory-scoped patterns', async () => {
        const customPatterns = ['src/components/**/*.tsx']
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/components/Button.tsx']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
      })

      test('handles patterns with multiple extensions', async () => {
        const customPatterns = ['**/*.{ts,js}']
        mockGlobStream.mockReturnValue(createMockStream(['/project/file.ts', '/project/file.js']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(2)
      })

      test('handles patterns array with single element', async () => {
        const customPatterns = ['**/*.graphql']
        mockGlobStream.mockReturnValue(createMockStream(['/project/schema.graphql']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result).toHaveLength(1)
      })

      test('handles patterns array with many elements', async () => {
        const customPatterns = [
          '**/*.ts',
          '**/*.tsx',
          '**/*.js',
          '**/*.jsx',
          '**/*.mjs',
          '**/*.cjs',
        ]
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toHaveLength(6)
      })
    })

    describe('ignore pattern combinations', () => {
      test('uses provided ignore when non-empty array', async () => {
        const customIgnore = ['**/test/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ ignore: customIgnore }),
        )
      })

      test('uses default ignore when ignore is empty array', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ ignore: DEFAULT_IGNORE }),
        )
      })

      test('does not merge custom ignore with defaults', async () => {
        const customIgnore = ['**/custom/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

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

      test('supports single custom ignore pattern', async () => {
        const customIgnore = ['**/temp/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toHaveLength(1)
      })

      test('supports multiple custom ignore patterns', async () => {
        const customIgnore = ['**/temp/**', '**/cache/**', '**/tmp/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toHaveLength(3)
      })

      test('supports negation ignore patterns', async () => {
        const customIgnore = ['**/*.ts', '!**/important/*.ts']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toEqual(customIgnore)
      })

      test('supports exact file ignore', async () => {
        const customIgnore = ['src/generated.ts']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toContain('src/generated.ts')
      })

      test('supports glob ignore patterns', async () => {
        const customIgnore = ['**/*.spec.ts', '**/*.test.ts']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toContain('**/*.spec.ts')
        expect(callArgs[1].ignore).toContain('**/*.test.ts')
      })
    })

    describe('combined patterns and ignore', () => {
      test('uses both custom patterns and custom ignore together', async () => {
        const customPatterns = ['**/*.py']
        const customIgnore = ['**/venv/**']
        mockGlobStream.mockReturnValue(createMockStream(['/project/main.py']))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          customPatterns,
          expect.objectContaining({ ignore: customIgnore }),
        )
      })

      test('uses default patterns with custom ignore', async () => {
        const customIgnore = ['**/fixtures/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: customIgnore,
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(DEFAULT_PATTERNS)
        expect(callArgs[1].ignore).toEqual(customIgnore)
      })

      test('uses custom patterns with default ignore', async () => {
        const customPatterns = ['**/*.rs']
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: customPatterns,
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(customPatterns)
        expect(callArgs[1].ignore).toEqual(DEFAULT_IGNORE)
      })

      test('uses defaults for both when both are empty', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        await discoverFiles(options)

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(DEFAULT_PATTERNS)
        expect(callArgs[1].ignore).toEqual(DEFAULT_IGNORE)
      })
    })

    describe('file naming edge cases', () => {
      test('handles files with dots in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/v2.0/utils.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('src/v2.0/utils.ts')
      })

      test('handles files with spaces in path', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/my project/my file.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('my project/my file.ts')
        expect(result[0].absolutePath).toBe('/project/my project/my file.ts')
      })

      test('handles files with hyphens', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/my-component.tsx']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('my-component.tsx')
      })

      test('handles files with underscores', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/_private.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('_private.ts')
      })

      test('handles files with numbers', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/v2.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('v2.ts')
      })

      test('handles files with camelCase', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/myCoolModule.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('myCoolModule.ts')
      })

      test('handles files with PascalCase', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/MyComponent.tsx']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('MyComponent.tsx')
      })

      test('handles files with UPPER_CASE', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/CONSTANTS.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('CONSTANTS.ts')
      })

      test('handles hidden directories (dot prefix)', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/.hidden/module.ts']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('.hidden/module.ts')
      })

      test('handles hidden files (dot prefix)', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/.eslintrc.js']))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe('.eslintrc.js')
      })

      test('handles long file names', async () => {
        const longName = 'a'.repeat(200) + '.ts'
        mockGlobStream.mockReturnValue(createMockStream([`/project/${longName}`]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe(longName)
      })

      test('handles long directory paths', async () => {
        const longDir = 'd'.repeat(100)
        mockGlobStream.mockReturnValue(createMockStream([`/project/${longDir}/file.ts`]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/project',
        }

        const result = await discoverFiles(options)

        expect(result[0].path).toBe(`${longDir}/file.ts`)
      })
    })

    describe('multiple files scenarios', () => {
      test('handles 5 files correctly', async () => {
        const mockFiles = ['/p/a.ts', '/p/b.ts', '/p/c.ts', '/p/d.ts', '/p/e.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result).toHaveLength(5)
      })

      test('handles 50 files correctly', async () => {
        const mockFiles = Array.from({ length: 50 }, (_, i) => `/p/file${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result).toHaveLength(50)
      })

      test('handles 200 files correctly', async () => {
        const mockFiles = Array.from({ length: 200 }, (_, i) => `/p/src/mod${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result).toHaveLength(200)
      })

      test('handles 500 files correctly', async () => {
        const mockFiles = Array.from({ length: 500 }, (_, i) => `/p/f${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result).toHaveLength(500)
      })

      test('returns unique entries for each file', async () => {
        const mockFiles = ['/p/a.ts', '/p/b.ts', '/p/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        const absPaths = result.map((f) => f.absolutePath)
        const uniquePaths = new Set(absPaths)
        expect(uniquePaths.size).toBe(result.length)
      })

      test('preserves order for many files', async () => {
        const mockFiles = Array.from(
          { length: 20 },
          (_, i) => `/p/${String.fromCharCode(97 + i)}.ts`,
        )
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        for (let i = 0; i < 20; i++) {
          expect(result[i].absolutePath).toBe(mockFiles[i])
        }
      })

      test('handles mix of file types', async () => {
        const mockFiles = ['/p/a.ts', '/p/b.tsx', '/p/c.js', '/p/d.jsx']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result).toHaveLength(4)
        expect(result[0].path).toBe('a.ts')
        expect(result[1].path).toBe('b.tsx')
        expect(result[2].path).toBe('c.js')
        expect(result[3].path).toBe('d.jsx')
      })

      test('handles files across multiple directories', async () => {
        const mockFiles = [
          '/p/src/index.ts',
          '/p/lib/utils.ts',
          '/p/test/spec.ts',
          '/p/docs/examples/demo.ts',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        const paths = result.map((f) => f.path)
        expect(paths).toContain('src/index.ts')
        expect(paths).toContain('lib/utils.ts')
        expect(paths).toContain('test/spec.ts')
        expect(paths).toContain('docs/examples/demo.ts')
      })

      test('handles files in flat directory structure', async () => {
        const mockFiles = ['/p/a.ts', '/p/b.ts', '/p/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result.every((f) => !f.path.includes('/'))).toBe(true)
      })

      test('handles files in deeply nested structure', async () => {
        const mockFiles = ['/p/a/b/c/d/e.ts', '/p/f/g/h/i/j.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result[0].path.split('/').length).toBe(5)
        expect(result[1].path.split('/').length).toBe(5)
      })
    })

    describe('globStream options verification', () => {
      test('passes cwd to globStream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/specific/project/path',
        }

        await discoverFiles(options)

        expect(mockGlobStream).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            cwd: '/specific/project/path',
          }),
        )
      })

      test('always passes absolute as true', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].absolute).toBe(true)
      })

      test('always passes onlyFiles as true', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].onlyFiles).toBe(true)
      })

      test('always passes followSymbolicLinks as false', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].followSymbolicLinks).toBe(false)
      })

      test('always passes suppressErrors as true', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].suppressErrors).toBe(true)
      })

      test('passes all expected options together', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1]).toEqual(
          expect.objectContaining({
            cwd: '/project',
            ignore: DEFAULT_IGNORE,
            absolute: true,
            onlyFiles: true,
            followSymbolicLinks: false,
            suppressErrors: true,
          }),
        )
      })

      test('calls globStream exactly once per invocation', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        expect(mockGlobStream).toHaveBeenCalledOnce()
      })

      test('calls globStream with two arguments', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs.length).toBe(2)
      })

      test('first argument to globStream is an array of strings', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(Array.isArray(callArgs[0])).toBe(true)
        expect(callArgs[0].every((p: unknown) => typeof p === 'string')).toBe(true)
      })

      test('second argument to globStream is an object', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(typeof callArgs[1]).toBe('object')
        expect(callArgs[1]).not.toBeNull()
        expect(callArgs[1]).not.toBeInstanceOf(Array)
      })
    })

    describe('return value shape', () => {
      test('each result has exactly path and absolutePath properties', async () => {
        const mockFiles = ['/p/a.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        const keys = Object.keys(result[0]).sort()
        expect(keys).toEqual(['absolutePath', 'path'])
      })

      test('absolutePath always equals the stream entry', async () => {
        const mockFiles = ['/p/x.ts', '/p/y.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result[0].absolutePath).toBe('/p/x.ts')
        expect(result[1].absolutePath).toBe('/p/y.ts')
      })

      test('path is always relative to cwd', async () => {
        const mockFiles = ['/project/src/a.ts', '/project/src/b/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        expect(result[0].path).toBe('src/a.ts')
        expect(result[1].path).toBe('src/b/c.ts')
      })

      test('absolutePath starts with cwd', async () => {
        const mockFiles = ['/project/src/a.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/project',
        })

        expect(result[0].absolutePath.startsWith('/project')).toBe(true)
      })

      test('result count matches stream entries', async () => {
        const mockFiles = ['/p/1.ts', '/p/2.ts', '/p/3.ts', '/p/4.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/p',
        })

        expect(result.length).toBe(mockFiles.length)
      })
    })

    describe('DEFAULT_PATTERNS individual elements', () => {
      test('first element is **/*.ts', () => {
        expect(DEFAULT_PATTERNS[0]).toBe('**/*.ts')
      })

      test('second element is **/*.tsx', () => {
        expect(DEFAULT_PATTERNS[1]).toBe('**/*.tsx')
      })

      test('third element is **/*.js', () => {
        expect(DEFAULT_PATTERNS[2]).toBe('**/*.js')
      })

      test('fourth element is **/*.jsx', () => {
        expect(DEFAULT_PATTERNS[3]).toBe('**/*.jsx')
      })

      test('does not include .json pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.json')
      })

      test('does not include .md pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.md')
      })

      test('does not include .css pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.css')
      })

      test('does not include .scss pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.scss')
      })

      test('does not include .html pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.html')
      })

      test('does not include .vue pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.vue')
      })

      test('does not include .py pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.py')
      })

      test('does not include .d.ts pattern', () => {
        expect(DEFAULT_PATTERNS).not.toContain('**/*.d.ts')
      })
    })

    describe('DEFAULT_IGNORE individual elements', () => {
      test('first element is **/node_modules/**', () => {
        expect(DEFAULT_IGNORE[0]).toBe('**/node_modules/**')
      })

      test('second element is **/dist/**', () => {
        expect(DEFAULT_IGNORE[1]).toBe('**/dist/**')
      })

      test('third element is **/build/**', () => {
        expect(DEFAULT_IGNORE[2]).toBe('**/build/**')
      })

      test('fourth element is **/.git/**', () => {
        expect(DEFAULT_IGNORE[3]).toBe('**/.git/**')
      })

      test('fifth element is **/coverage/**', () => {
        expect(DEFAULT_IGNORE[4]).toBe('**/coverage/**')
      })

      test('sixth element is **/*.d.ts', () => {
        expect(DEFAULT_IGNORE[5]).toBe('**/*.d.ts')
      })

      test('does not include test directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/test/**')
      })

      test('does not include spec directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/spec/**')
      })

      test('does not include __tests__ directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/__tests__/**')
      })

      test('does not include vendor directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/vendor/**')
      })

      test('does not include .next directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/.next/**')
      })

      test('does not include .cache directory', () => {
        expect(DEFAULT_IGNORE).not.toContain('**/.cache/**')
      })
    })

    describe('concurrent invocations', () => {
      test('multiple sequential calls work independently', async () => {
        mockGlobStream
          .mockReturnValueOnce(createMockStream(['/p1/a.ts']))
          .mockReturnValueOnce(createMockStream(['/p2/b.ts', '/p2/c.ts']))

        const r1 = await discoverFiles({ patterns: [], ignore: [], cwd: '/p1' })
        const r2 = await discoverFiles({ patterns: [], ignore: [], cwd: '/p2' })

        expect(r1).toHaveLength(1)
        expect(r2).toHaveLength(2)
      })

      test('parallel calls return independent results', async () => {
        mockGlobStream
          .mockReturnValueOnce(createMockStream(['/a.ts']))
          .mockReturnValueOnce(createMockStream(['/b.ts']))
          .mockReturnValueOnce(createMockStream(['/c.ts', '/d.ts']))

        const [r1, r2, r3] = await Promise.all([
          discoverFiles({ patterns: [], ignore: [], cwd: '/x' }),
          discoverFiles({ patterns: [], ignore: [], cwd: '/y' }),
          discoverFiles({ patterns: [], ignore: [], cwd: '/z' }),
        ])

        expect(r1).toHaveLength(1)
        expect(r2).toHaveLength(1)
        expect(r3).toHaveLength(2)
      })

      test('reset between calls does not affect subsequent calls', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/f.ts']))

        const r1 = await discoverFiles({ patterns: [], ignore: [], cwd: '/a' })
        mockGlobStream.mockReset()
        mockGlobStream.mockReturnValue(createMockStream(['/g.ts', '/h.ts']))

        const r2 = await discoverFiles({ patterns: [], ignore: [], cwd: '/b' })

        expect(r1).toHaveLength(1)
        expect(r2).toHaveLength(2)
      })
    })

    describe('onProgress with multiple files', () => {
      test('onProgress receives sequential counts for 5 files', async () => {
        const files = ['/p/1.ts', '/p/2.ts', '/p/3.ts', '/p/4.ts', '/p/5.ts']
        mockGlobStream.mockReturnValue(createMockStream(files))

        const onProgress = vi.fn()
        await discoverFiles({ patterns: [], ignore: [], cwd: '/p', onProgress })

        for (let i = 0; i < 5; i++) {
          expect(onProgress).toHaveBeenNthCalledWith(i + 1, i + 1)
        }
      })

      test('onProgress receives correct counts with single file', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/p/only.ts']))

        const onProgress = vi.fn()
        await discoverFiles({ patterns: [], ignore: [], cwd: '/p', onProgress })

        expect(onProgress).toHaveBeenCalledOnce()
        expect(onProgress).toHaveBeenCalledWith(1)
      })

      test('onProgress count matches result length', async () => {
        const files = ['/p/a.ts', '/p/b.ts', '/p/c.ts']
        mockGlobStream.mockReturnValue(createMockStream(files))

        const onProgress = vi.fn()
        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p', onProgress })

        const lastCallCount = onProgress.mock.calls[onProgress.mock.calls.length - 1][0]
        expect(lastCallCount).toBe(result.length)
      })
    })

    describe('path.relative behavior', () => {
      test('relative path for file directly in cwd has no leading separator', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('file.ts')
        expect(result[0].path).not.toMatch(/^\//)
      })

      test('relative path for nested file uses forward slashes', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/a/b/c.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('a/b/c.ts')
      })

      test('absolute path is unchanged from stream', async () => {
        const absPath = '/very/long/path/to/project/src/mod.ts'
        mockGlobStream.mockReturnValue(createMockStream([absPath]))

        const result = await discoverFiles({
          patterns: [],
          ignore: [],
          cwd: '/very/long/path/to/project',
        })

        expect(result[0].absolutePath).toBe(absPath)
      })

      test('relative path for file in subdir is subdir/file', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src/app.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('src/app.ts')
      })
    })

    describe('exported types and constants', () => {
      test('DEFAULT_PATTERNS is a readonly array', () => {
        expect(Array.isArray(DEFAULT_PATTERNS)).toBe(true)
      })

      test('DEFAULT_IGNORE is a readonly array', () => {
        expect(Array.isArray(DEFAULT_IGNORE)).toBe(true)
      })

      test('DEFAULT_PATTERNS contains only strings', () => {
        DEFAULT_PATTERNS.forEach((p) => {
          expect(typeof p).toBe('string')
        })
      })

      test('DEFAULT_IGNORE contains only strings', () => {
        DEFAULT_IGNORE.forEach((p) => {
          expect(typeof p).toBe('string')
        })
      })

      test('all DEFAULT_PATTERNS start with **/*', () => {
        DEFAULT_PATTERNS.forEach((p) => {
          expect(p.startsWith('**/*')).toBe(true)
        })
      })

      test('all DEFAULT_IGNORE patterns contain **', () => {
        DEFAULT_IGNORE.forEach((p) => {
          expect(p).toContain('**')
        })
      })

      test('DEFAULT_IGNORE patterns use glob-style wildcards', () => {
        DEFAULT_IGNORE.forEach((p) => {
          expect(p).toMatch(/\*\*/)
        })
      })
    })

    describe('discoverFiles is callable multiple times', () => {
      test('can be called 10 times sequentially', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        for (let i = 0; i < 10; i++) {
          const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })
          expect(result).toEqual([])
        }

        expect(mockGlobStream).toHaveBeenCalledTimes(10)
      })

      test('returns fresh results each call', async () => {
        mockGlobStream
          .mockReturnValueOnce(createMockStream(['/a.ts']))
          .mockReturnValueOnce(createMockStream([]))
          .mockReturnValueOnce(createMockStream(['/b.ts', '/c.ts']))

        const r1 = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })
        const r2 = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })
        const r3 = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(r1).toHaveLength(1)
        expect(r2).toHaveLength(0)
        expect(r3).toHaveLength(2)
      })
    })

    describe('path.resolve for cwd', () => {
      test('resolves ./ to absolute path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [], cwd: './' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('resolves ../ to absolute path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [], cwd: '../' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('resolves ../../ to absolute path', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [], cwd: '../../' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })

      test('keeps already absolute path unchanged', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [], cwd: '/abs/path' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].cwd).toBe('/abs/path')
      })

      test('resolves path with mixed separators', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [], cwd: './a/b/c' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(path.isAbsolute(callArgs[1].cwd)).toBe(true)
      })
    })

    describe('stream consumption', () => {
      test('consumes entire async iterable stream', async () => {
        const files = ['/p/a.ts', '/p/b.ts']
        mockGlobStream.mockReturnValue(createMockStream(files))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(files.length)
      })

      test('handles single file stream', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/p/only.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(1)
        expect(result[0].absolutePath).toBe('/p/only.ts')
      })

      test('handles empty stream', async () => {
        mockGlobStream.mockReturnValue(createMockStream([]))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toEqual([])
      })

      test('handles stream with one thousand files', async () => {
        const files = Array.from({ length: 1000 }, (_, i) => `/p/file${i}.ts`)
        mockGlobStream.mockReturnValue(createMockStream(files))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(1000)
      })
    })

    describe('real-world directory structures', () => {
      test('handles typical src directory layout', async () => {
        const mockFiles = [
          '/p/src/index.ts',
          '/p/src/app.ts',
          '/p/src/components/Header.tsx',
          '/p/src/components/Footer.tsx',
          '/p/src/utils/helpers.ts',
          '/p/src/services/api.ts',
          '/p/src/types/index.ts',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(7)
        const paths = result.map((f) => f.path)
        expect(paths).toContain('src/components/Header.tsx')
        expect(paths).toContain('src/services/api.ts')
      })

      test('handles monorepo with packages directory', async () => {
        const mockFiles = [
          '/p/packages/core/src/index.ts',
          '/p/packages/cli/src/index.ts',
          '/p/packages/utils/src/index.ts',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(3)
        const paths = result.map((f) => f.path)
        expect(paths).toContain('packages/core/src/index.ts')
      })

      test('handles typical Next.js project structure', async () => {
        const mockFiles = [
          '/p/pages/index.tsx',
          '/p/pages/about.tsx',
          '/p/components/Layout.tsx',
          '/p/lib/api.ts',
          '/p/styles/globals.js',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(5)
      })

      test('handles library project with src and test directories', async () => {
        const mockFiles = [
          '/p/src/index.ts',
          '/p/src/module.ts',
          '/p/test/index.test.ts',
          '/p/test/module.test.ts',
        ]
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(4)
      })

      test('handles project with bin directory', async () => {
        const mockFiles = ['/p/bin/cli.js', '/p/src/index.ts']
        mockGlobStream.mockReturnValue(createMockStream(mockFiles))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(result).toHaveLength(2)
        expect(result[0].path).toBe('bin/cli.js')
      })
    })

    describe('interface compliance', () => {
      test('FileDiscoveryOptions requires patterns field', () => {
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
        }
        expect(Array.isArray(options.patterns)).toBe(true)
      })

      test('FileDiscoveryOptions requires ignore field', () => {
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
        }
        expect(Array.isArray(options.ignore)).toBe(true)
      })

      test('FileDiscoveryOptions requires cwd field', () => {
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
        }
        expect(typeof options.cwd).toBe('string')
      })

      test('FileDiscoveryOptions has optional onProgress', () => {
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
          onProgress: (_count: number) => {},
        }
        expect(typeof options.onProgress).toBe('function')
      })

      test('FileDiscoveryOptions works without onProgress', () => {
        const options: FileDiscoveryOptions = {
          patterns: [],
          ignore: [],
          cwd: '/p',
        }
        expect(options.onProgress).toBeUndefined()
      })

      test('DiscoveredFile has path as string', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/p/a.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(typeof result[0].path).toBe('string')
      })

      test('DiscoveredFile has absolutePath as string', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/p/a.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/p' })

        expect(typeof result[0].absolutePath).toBe('string')
      })
    })

    describe('boundary conditions for patterns/ignore', () => {
      test('patterns with empty string element is still passed through', async () => {
        const customPatterns = ['']
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: customPatterns, ignore: [], cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(customPatterns)
      })

      test('ignore with empty string element is still passed through', async () => {
        const customIgnore = ['']
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: customIgnore, cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toEqual(customIgnore)
      })

      test('patterns array with duplicate entries is passed as-is', async () => {
        const customPatterns = ['**/*.ts', '**/*.ts']
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: customPatterns, ignore: [], cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toEqual(customPatterns)
      })

      test('ignore array with duplicate entries is passed as-is', async () => {
        const customIgnore = ['**/node_modules/**', '**/node_modules/**']
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: customIgnore, cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toEqual(customIgnore)
      })

      test('very long pattern string is handled', async () => {
        const longPattern = '**/' + 'a'.repeat(500) + '.ts'
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [longPattern], ignore: [], cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[0]).toContain(longPattern)
      })

      test('very long ignore string is handled', async () => {
        const longIgnore = '**/' + 'b'.repeat(500) + '/**'
        mockGlobStream.mockReturnValue(createMockStream([]))

        await discoverFiles({ patterns: [], ignore: [longIgnore], cwd: '/p' })

        const callArgs = mockGlobStream.mock.calls[0]
        expect(callArgs[1].ignore).toContain(longIgnore)
      })
    })

    describe('path with special characters', () => {
      test('handles parentheses in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src (v2)/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('src (v2)/file.ts')
      })

      test('handles brackets in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/src[1]/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('src[1]/file.ts')
      })

      test('handles unicode in file name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/файл.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('файл.ts')
      })

      test('handles emoji-like characters in path', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/🎉/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('🎉/file.ts')
      })

      test('handles multiple extensions', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/file.test.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('file.test.ts')
      })

      test('handles file with .d.ts extension', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/types.d.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('types.d.ts')
      })

      test('handles .mjs extension', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/module.mjs']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('module.mjs')
      })

      test('handles .cjs extension', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/commonjs.cjs']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('commonjs.cjs')
      })

      test('handles at-sign in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/@scope/pkg.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('@scope/pkg.ts')
      })

      test('handles plus sign in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/c++/main.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('c++/main.ts')
      })

      test('handles equals sign in file name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/a=b.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('a=b.ts')
      })

      test('handles tilde in file name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/~backup.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('~backup.ts')
      })

      test('handles exclamation mark in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/important!/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('important!/file.ts')
      })

      test('handles hash in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/#drafts/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('#drafts/file.ts')
      })

      test('handles percent in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/20%done/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('20%done/file.ts')
      })

      test('handles ampersand in directory name', async () => {
        mockGlobStream.mockReturnValue(createMockStream(['/project/dev&test/file.ts']))

        const result = await discoverFiles({ patterns: [], ignore: [], cwd: '/project' })

        expect(result[0].path).toBe('dev&test/file.ts')
      })
    })
  })
})
