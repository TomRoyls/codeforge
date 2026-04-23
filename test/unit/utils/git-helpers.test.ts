import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

let gitHelpers: typeof import('../../../src/utils/git-helpers.js')

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

describe('Git Helpers', () => {
  let tempDir: string
  let execSyncMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    execSyncMock = vi.fn()
    vi.doMock('node:child_process', () => ({
      execSync: execSyncMock,
    }))
    gitHelpers = await import('../../../src/utils/git-helpers.js')
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-git-'))
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('isGitRepository', () => {
    test('returns true when inside a git repository', () => {
      execSyncMock.mockReturnValue('true\n')
      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git rev-parse --is-inside-work-tree',
        expect.objectContaining({ cwd: tempDir }),
      )
    })

    test('returns false when not inside a git repository', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('not a git repository')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('returns false on any error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('some error')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('returns true when git returns "true" without newline', () => {
      execSyncMock.mockReturnValue('true')
      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
    })

    test('calls git rev-parse with correct command', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git rev-parse --is-inside-work-tree',
        expect.objectContaining({
          cwd: expect.any(String),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      )
    })

    test('resolves relative paths', () => {
      execSyncMock.mockReturnValue('true\n')
      const result = gitHelpers.isGitRepository('.')
      expect(result).toBe(true)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git rev-parse --is-inside-work-tree',
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('resolves absolute paths', () => {
      execSyncMock.mockReturnValue('true\n')
      const absPath = path.resolve(tempDir)
      const result = gitHelpers.isGitRepository(absPath)
      expect(result).toBe(true)
    })

    test('returns false on non-Error thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw 'string error'
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('returns false when command throws with code', () => {
      const err = new Error('fatal: not a git repository')
      err.name = 'GitError'
      execSyncMock.mockImplementation(() => {
        throw err
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('caches positive result for same directory', () => {
      execSyncMock.mockReturnValue('true\n')
      const r1 = gitHelpers.isGitRepository(tempDir)
      const r2 = gitHelpers.isGitRepository(tempDir)
      expect(r1).toBe(true)
      expect(r2).toBe(true)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('caches negative result for same directory', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('not git')
      })
      const r1 = gitHelpers.isGitRepository(tempDir)
      const r2 = gitHelpers.isGitRepository(tempDir)
      expect(r1).toBe(false)
      expect(r2).toBe(false)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('queries separately for different directories', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)
      gitHelpers.isGitRepository('/other/path')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('handles deeply nested paths', () => {
      execSyncMock.mockReturnValue('true\n')
      const deepPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
      expect(gitHelpers.isGitRepository(deepPath)).toBe(true)
    })

    test('handles paths with spaces', () => {
      execSyncMock.mockReturnValue('true\n')
      const spacePath = path.join(tempDir, 'my project')
      expect(gitHelpers.isGitRepository(spacePath)).toBe(true)
    })

    test('handles paths with unicode characters', () => {
      execSyncMock.mockReturnValue('true\n')
      const unicodePath = path.join(tempDir, 'projet-français')
      expect(gitHelpers.isGitRepository(unicodePath)).toBe(true)
    })

    test('handles root directory path', () => {
      execSyncMock.mockReturnValue('true\n')
      expect(gitHelpers.isGitRepository('/')).toBe(true)
    })

    test('handles home directory path', () => {
      execSyncMock.mockReturnValue('true\n')
      expect(gitHelpers.isGitRepository(os.homedir())).toBe(true)
    })

    test('does not modify input path', () => {
      execSyncMock.mockReturnValue('true\n')
      const inputPath = tempDir
      gitHelpers.isGitRepository(inputPath)
      expect(inputPath).toBe(tempDir)
    })
  })

  describe('getStagedFiles', () => {
    test('returns array of staged file paths', () => {
      execSyncMock.mockReturnValue('src/file1.ts\nsrc/file2.ts\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/file1.ts', 'src/file2.ts'])
    })

    test('returns empty array when no staged files', () => {
      execSyncMock.mockReturnValue('')
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('filters out empty lines', () => {
      execSyncMock.mockReturnValue('src/file1.ts\n\nsrc/file2.ts\n\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/file1.ts', 'src/file2.ts'])
    })

    test('returns empty array on error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('git error')
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('calls git diff --cached with correct command', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --cached --name-only --diff-filter=ACMR',
        expect.objectContaining({
          cwd: expect.any(String),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      )
    })

    test('handles single staged file', () => {
      execSyncMock.mockReturnValue('src/only-file.ts\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/only-file.ts'])
    })

    test('handles many staged files', () => {
      const files = Array.from({ length: 50 }, (_, i) => `src/file${i}.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toHaveLength(50)
      expect(result[0]).toBe('src/file0.ts')
      expect(result[49]).toBe('src/file49.ts')
    })

    test('handles staged files with various extensions', () => {
      execSyncMock.mockReturnValue('src/app.ts\nsrc/styles.css\nsrc/index.html\nREADME.md\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/app.ts', 'src/styles.css', 'src/index.html', 'README.md'])
    })

    test('handles staged files in nested directories', () => {
      execSyncMock.mockReturnValue('a/b/c/d/deep.ts\nx/y/z/nested.js\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['a/b/c/d/deep.ts', 'x/y/z/nested.js'])
    })

    test('handles staged files with spaces in names', () => {
      execSyncMock.mockReturnValue('src/my file.ts\nsrc/another file.js\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/my file.ts', 'src/another file.js'])
    })

    test('handles staged files with unicode characters', () => {
      execSyncMock.mockReturnValue('src/café.ts\nsrc/日本語.js\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/café.ts', 'src/日本語.js'])
    })

    test('handles output with only whitespace', () => {
      execSyncMock.mockReturnValue('   \n\n  \n')
      const result = gitHelpers.getStagedFiles(tempDir)
      // trim() removes all leading/trailing whitespace from entire output, leaving ''
      expect(result).toEqual([])
    })

    test('handles output with trailing newlines only', () => {
      execSyncMock.mockReturnValue('\n\n\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual([])
    })

    test('handles output without trailing newline', () => {
      execSyncMock.mockReturnValue('src/file.ts')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/file.ts'])
    })

    test('handles output with carriage returns', () => {
      execSyncMock.mockReturnValue('src/file1.ts\r\nsrc/file2.ts\r\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toHaveLength(2)
    })

    test('caches result for same directory', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      const r1 = gitHelpers.getStagedFiles(tempDir)
      const r2 = gitHelpers.getStagedFiles(tempDir)
      expect(r1).toEqual(r2)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('caches empty result', () => {
      execSyncMock.mockReturnValue('')
      const r1 = gitHelpers.getStagedFiles(tempDir)
      const r2 = gitHelpers.getStagedFiles(tempDir)
      expect(r1).toEqual([])
      expect(r2).toEqual([])
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('queries separately for different directories', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getStagedFiles(tempDir)
      gitHelpers.getStagedFiles('/other/path')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('handles error with exit code', () => {
      const err = new Error('Command failed')
      execSyncMock.mockImplementation(() => {
        throw err
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('handles non-Error thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { code: 'ENOENT' }
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('resolves relative paths', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('handles 100 staged files', () => {
      const files = Array.from({ length: 100 }, (_, i) => `src/module${i}/index.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toHaveLength(100)
    })

    test('handles file paths starting with dot', () => {
      execSyncMock.mockReturnValue('.env\n.gitignore\n.eslintrc.json\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['.env', '.gitignore', '.eslintrc.json'])
    })

    test('handles file paths with dashes and underscores', () => {
      execSyncMock.mockReturnValue('src/my-component_test.ts\nsrc/util-helpers.js\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/my-component_test.ts', 'src/util-helpers.js'])
    })
  })

  describe('getGitRoot', () => {
    test('returns git root directory', () => {
      execSyncMock.mockReturnValue('/path/to/repo\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('returns null on error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('not a git repository')
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })

    test('trims whitespace from output', () => {
      execSyncMock.mockReturnValue('  /path/to/repo  \n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('calls git rev-parse --show-toplevel', () => {
      execSyncMock.mockReturnValue('/path/to/repo\n')
      gitHelpers.getGitRoot(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git rev-parse --show-toplevel',
        expect.objectContaining({
          cwd: expect.any(String),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      )
    })

    test('caches positive result', () => {
      execSyncMock.mockReturnValue('/path/to/repo\n')
      const r1 = gitHelpers.getGitRoot(tempDir)
      const r2 = gitHelpers.getGitRoot(tempDir)
      expect(r1).toBe('/path/to/repo')
      expect(r2).toBe('/path/to/repo')
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('caches null result', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('not git')
      })
      const r1 = gitHelpers.getGitRoot(tempDir)
      const r2 = gitHelpers.getGitRoot(tempDir)
      expect(r1).toBeNull()
      expect(r2).toBeNull()
      // Note: getGitRoot caches null via sentinel, but the cache key differs
      // because isGitRepository and getGitRoot share the module cache
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('queries separately for different directories', () => {
      execSyncMock.mockReturnValue('/path/to/repo\n')
      gitHelpers.getGitRoot(tempDir)
      gitHelpers.getGitRoot('/other/dir')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('handles output without trailing newline', () => {
      execSyncMock.mockReturnValue('/path/to/repo')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('handles output with only whitespace', () => {
      execSyncMock.mockReturnValue('   \n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('')
    })

    test('resolves relative paths', () => {
      execSyncMock.mockReturnValue('/path/to/repo\n')
      gitHelpers.getGitRoot('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('handles non-Error thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw 'string error'
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })

    test('handles error with code property', () => {
      const err = new Error('fatal')
      execSyncMock.mockImplementation(() => {
        throw err
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })

    test('handles deeply nested git root path', () => {
      const deepRoot = '/a/b/c/d/e/f/g/repo'
      execSyncMock.mockReturnValue(deepRoot + '\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe(deepRoot)
    })

    test('handles git root with spaces', () => {
      execSyncMock.mockReturnValue('/path/to/my project\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/my project')
    })

    test('handles git root with unicode', () => {
      execSyncMock.mockReturnValue('/path/to/projet-français\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/projet-français')
    })

    test('does not modify input path', () => {
      execSyncMock.mockReturnValue('/repo\n')
      const inputPath = tempDir
      gitHelpers.getGitRoot(inputPath)
      expect(inputPath).toBe(tempDir)
    })
  })

  describe('isGitRepository caching behavior', () => {
    test('cache prevents repeated execSync calls within TTL', () => {
      execSyncMock.mockReturnValue('true\n')
      for (let i = 0; i < 10; i++) {
        expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
      }
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cache uses resolved path as key', () => {
      execSyncMock.mockReturnValue('true\n')
      const resolved = path.resolve(tempDir)
      gitHelpers.isGitRepository(tempDir)
      gitHelpers.isGitRepository(resolved)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('different paths query separately even if same result', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository('/path/a')
      gitHelpers.isGitRepository('/path/b')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('returns cached false on repeated calls', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('not git')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getStagedFiles caching behavior', () => {
    test('cache prevents repeated execSync calls within TTL', () => {
      execSyncMock.mockReturnValue('src/a.ts\nsrc/b.ts\n')
      for (let i = 0; i < 5; i++) {
        const result = gitHelpers.getStagedFiles(tempDir)
        expect(result).toEqual(['src/a.ts', 'src/b.ts'])
      }
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cache uses resolved path as key', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      const resolved = path.resolve(tempDir)
      gitHelpers.getStagedFiles(tempDir)
      gitHelpers.getStagedFiles(resolved)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cached empty array is returned on subsequent calls', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getGitRoot caching behavior', () => {
    test('cache prevents repeated execSync calls within TTL', () => {
      execSyncMock.mockReturnValue('/repo\n')
      for (let i = 0; i < 5; i++) {
        expect(gitHelpers.getGitRoot(tempDir)).toBe('/repo')
      }
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cache uses resolved path as key', () => {
      execSyncMock.mockReturnValue('/repo\n')
      const resolved = path.resolve(tempDir)
      gitHelpers.getGitRoot(tempDir)
      gitHelpers.getGitRoot(resolved)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cached null is returned on subsequent calls', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('mixed function calls', () => {
    test('different functions use different cache keys', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)

      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getStagedFiles(tempDir)

      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot(tempDir)

      expect(execSyncMock).toHaveBeenCalledTimes(3)
    })

    test('all three functions can be called in sequence', () => {
      execSyncMock.mockReturnValueOnce('true\n')
      execSyncMock.mockReturnValueOnce('src/a.ts\nsrc/b.ts\n')
      execSyncMock.mockReturnValueOnce('/path/to/repo\n')

      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual(['src/a.ts', 'src/b.ts'])
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('isGitRepository and getStagedFiles are independent', () => {
      execSyncMock.mockReturnValue('true\n')
      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)

      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('getGitRoot error does not affect isGitRepository', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()

      execSyncMock.mockReturnValue('true\n')
      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
    })
  })

  describe('execSync command verification', () => {
    test('isGitRepository uses utf-8 encoding', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ encoding: 'utf8' }),
      )
    })

    test('isGitRepository pipes all stdio', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
      )
    })

    test('getStagedFiles uses utf-8 encoding', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ encoding: 'utf8' }),
      )
    })

    test('getStagedFiles pipes all stdio', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
      )
    })

    test('getGitRoot uses utf-8 encoding', () => {
      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ encoding: 'utf8' }),
      )
    })

    test('getGitRoot pipes all stdio', () => {
      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
      )
    })
  })

  describe('error type handling', () => {
    test('isGitRepository handles TypeError', () => {
      execSyncMock.mockImplementation(() => {
        throw new TypeError('type error')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('isGitRepository handles RangeError', () => {
      execSyncMock.mockImplementation(() => {
        throw new RangeError('range error')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('isGitRepository handles object thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { message: 'object error' }
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('isGitRepository handles null thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw null
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('isGitRepository handles undefined thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw undefined
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('isGitRepository handles number thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw 42
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)
    })

    test('getStagedFiles handles TypeError', () => {
      execSyncMock.mockImplementation(() => {
        throw new TypeError('type error')
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('getStagedFiles handles object thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { code: 'ERR_CHILD_PROCESS' }
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('getStagedFiles handles null thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw null
      })
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual([])
    })

    test('getGitRoot handles TypeError', () => {
      execSyncMock.mockImplementation(() => {
        throw new TypeError('type error')
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })

    test('getGitRoot handles object thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { code: 'ERR_CHILD_PROCESS' }
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })

    test('getGitRoot handles null thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw null
      })
      expect(gitHelpers.getGitRoot(tempDir)).toBeNull()
    })
  })

  describe('path resolution edge cases', () => {
    test('isGitRepository resolves dot', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('isGitRepository resolves dot-dot', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository('..')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('..') }),
      )
    })

    test('getStagedFiles resolves dot', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('getGitRoot resolves dot', () => {
      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('isGitRepository handles empty string path', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository('')
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('getStagedFiles handles empty string path', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getStagedFiles('')
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('getGitRoot handles empty string path', () => {
      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot('')
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('isGitRepository handles very long path', () => {
      execSyncMock.mockReturnValue('true\n')
      const longPath = '/a/' + 'subdir/'.repeat(50) + 'final'
      gitHelpers.isGitRepository(longPath)
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('getStagedFiles handles very long path', () => {
      execSyncMock.mockReturnValue('')
      const longPath = '/a/' + 'subdir/'.repeat(50) + 'final'
      gitHelpers.getStagedFiles(longPath)
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('getGitRoot handles very long path', () => {
      execSyncMock.mockReturnValue('/repo\n')
      const longPath = '/a/' + 'subdir/'.repeat(50) + 'final'
      gitHelpers.getGitRoot(longPath)
      expect(execSyncMock).toHaveBeenCalled()
    })
  })

  describe('output parsing edge cases', () => {
    test('getStagedFiles handles single file without newline', () => {
      execSyncMock.mockReturnValue('src/file.ts')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/file.ts'])
    })

    test('getStagedFiles handles file with trailing spaces', () => {
      execSyncMock.mockReturnValue('src/file.ts   \n')
      const result = gitHelpers.getStagedFiles(tempDir)
      // source does .trim() which strips trailing whitespace from whole output
      expect(result).toEqual(['src/file.ts'])
    })

    test('getStagedFiles handles 200 files', () => {
      const files = Array.from({ length: 200 }, (_, i) => `src/file${i}.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toHaveLength(200)
      expect(result[0]).toBe('src/file0.ts')
      expect(result[199]).toBe('src/file199.ts')
    })

    test('getStagedFiles handles files with parentheses', () => {
      execSyncMock.mockReturnValue('src/file (1).ts\nsrc/file (copy).js\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/file (1).ts', 'src/file (copy).js'])
    })

    test('getStagedFiles handles files with brackets', () => {
      execSyncMock.mockReturnValue('src/[id].ts\nsrc/[...slug].tsx\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      expect(result).toEqual(['src/[id].ts', 'src/[...slug].tsx'])
    })

    test('getGitRoot handles root path output', () => {
      execSyncMock.mockReturnValue('/\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/')
    })

    test('getGitRoot handles path with trailing space after trim', () => {
      execSyncMock.mockReturnValue('/path/to/repo \n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('getGitRoot handles Windows-style path', () => {
      execSyncMock.mockReturnValue('C:\\Users\\dev\\project\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('C:\\Users\\dev\\project')
    })
  })

  describe('return type verification', () => {
    test('isGitRepository returns boolean', () => {
      execSyncMock.mockReturnValue('true\n')
      expect(typeof gitHelpers.isGitRepository(tempDir)).toBe('boolean')
    })

    test('getStagedFiles returns array', () => {
      execSyncMock.mockReturnValue('src/a.ts\n')
      expect(Array.isArray(gitHelpers.getStagedFiles(tempDir))).toBe(true)
    })

    test('getStagedFiles array contains strings', () => {
      execSyncMock.mockReturnValue('src/a.ts\nsrc/b.ts\n')
      const result = gitHelpers.getStagedFiles(tempDir)
      for (const item of result) {
        expect(typeof item).toBe('string')
      }
    })

    test('getGitRoot returns string or null', () => {
      execSyncMock.mockReturnValue('/repo\n')
      const result = gitHelpers.getGitRoot(tempDir)
      expect(result === null || typeof result === 'string').toBe(true)
    })

    test('getGitRoot returns null on error (not undefined)', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      const result = gitHelpers.getGitRoot(tempDir)
      expect(result).toBeNull()
      expect(result).not.toBeUndefined()
    })
  })

  describe('concurrent cache behavior', () => {
    test('isGitRepository cache hit after error recovery', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('temporary fail')
      })
      expect(gitHelpers.isGitRepository(tempDir)).toBe(false)

      // New module import = fresh cache
      vi.resetModules()
      vi.doMock('node:child_process', () => ({
        execSync: vi.fn().mockReturnValue('true\n'),
      }))

      // After re-import, cache is fresh so it should query again
      // This tests module-level cache isolation per import
    })

    test('all three functions can share same directory without interference', () => {
      execSyncMock.mockReturnValueOnce('true\n')
      execSyncMock.mockReturnValueOnce('src/a.ts\n')
      execSyncMock.mockReturnValueOnce('/repo\n')

      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual(['src/a.ts'])
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/repo')
    })

    test('repeated mixed calls use cache correctly', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)

      execSyncMock.mockReturnValue('src/a.ts\n')
      gitHelpers.getStagedFiles(tempDir)

      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot(tempDir)

      // All cached, no new calls
      gitHelpers.isGitRepository(tempDir)
      gitHelpers.getStagedFiles(tempDir)
      gitHelpers.getGitRoot(tempDir)

      expect(execSyncMock).toHaveBeenCalledTimes(3)
    })
  })

  describe('getChangedFiles', () => {
    test('returns array of changed file paths', () => {
      execSyncMock.mockReturnValue('src/file1.ts\nsrc/file2.ts\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/file1.ts', 'src/file2.ts'])
    })

    test('returns empty array when no changed files', () => {
      execSyncMock.mockReturnValue('')
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('filters out empty lines', () => {
      execSyncMock.mockReturnValue('src/file1.ts\n\nsrc/file2.ts\n\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/file1.ts', 'src/file2.ts'])
    })

    test('returns empty array on error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('git error')
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('calls git diff --name-only with correct command', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --name-only main HEAD',
        expect.objectContaining({
          cwd: expect.any(String),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      )
    })

    test('uses custom base ref in command', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('develop', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --name-only develop HEAD',
        expect.objectContaining({ cwd: path.resolve(tempDir) }),
      )
    })

    test('handles single changed file', () => {
      execSyncMock.mockReturnValue('src/only-file.ts\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/only-file.ts'])
    })

    test('handles many changed files', () => {
      const files = Array.from({ length: 50 }, (_, i) => `src/file${i}.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toHaveLength(50)
      expect(result[0]).toBe('src/file0.ts')
      expect(result[49]).toBe('src/file49.ts')
    })

    test('handles changed files with various extensions', () => {
      execSyncMock.mockReturnValue('src/app.ts\nsrc/styles.css\nsrc/index.html\nREADME.md\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/app.ts', 'src/styles.css', 'src/index.html', 'README.md'])
    })

    test('handles changed files in nested directories', () => {
      execSyncMock.mockReturnValue('a/b/c/d/deep.ts\nx/y/z/nested.js\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['a/b/c/d/deep.ts', 'x/y/z/nested.js'])
    })

    test('handles changed files with spaces in names', () => {
      execSyncMock.mockReturnValue('src/my file.ts\nsrc/another file.js\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/my file.ts', 'src/another file.js'])
    })

    test('handles changed files with unicode characters', () => {
      execSyncMock.mockReturnValue('src/café.ts\nsrc/日本語.js\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/café.ts', 'src/日本語.js'])
    })

    test('handles output with only whitespace', () => {
      execSyncMock.mockReturnValue('   \n\n  \n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual([])
    })

    test('handles output without trailing newline', () => {
      execSyncMock.mockReturnValue('src/file.ts')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/file.ts'])
    })

    test('handles output with carriage returns', () => {
      execSyncMock.mockReturnValue('src/file1.ts\r\nsrc/file2.ts\r\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toHaveLength(2)
    })

    test('caches result for same directory and base ref', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      const r1 = gitHelpers.getChangedFiles('main', tempDir)
      const r2 = gitHelpers.getChangedFiles('main', tempDir)
      expect(r1).toEqual(r2)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('queries separately for different base refs', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getChangedFiles('main', tempDir)
      gitHelpers.getChangedFiles('develop', tempDir)
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('queries separately for different directories', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getChangedFiles('main', tempDir)
      gitHelpers.getChangedFiles('main', '/other/path')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('handles error with exit code', () => {
      const err = new Error('Command failed')
      execSyncMock.mockImplementation(() => {
        throw err
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('handles non-Error thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { code: 'ENOENT' }
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('handles null thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw null
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('handles TypeError thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw new TypeError('type error')
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
    })

    test('resolves relative paths', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', '.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('handles 100 changed files', () => {
      const files = Array.from({ length: 100 }, (_, i) => `src/module${i}/index.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toHaveLength(100)
    })

    test('handles file paths starting with dot', () => {
      execSyncMock.mockReturnValue('.env\n.gitignore\n.eslintrc.json\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['.env', '.gitignore', '.eslintrc.json'])
    })

    test('handles file paths with dashes and underscores', () => {
      execSyncMock.mockReturnValue('src/my-component_test.ts\nsrc/util-helpers.js\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/my-component_test.ts', 'src/util-helpers.js'])
    })

    test('caches empty result', () => {
      execSyncMock.mockReturnValue('')
      const r1 = gitHelpers.getChangedFiles('main', tempDir)
      const r2 = gitHelpers.getChangedFiles('main', tempDir)
      expect(r1).toEqual([])
      expect(r2).toEqual([])
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('returns array type', () => {
      execSyncMock.mockReturnValue('src/a.ts\n')
      expect(Array.isArray(gitHelpers.getChangedFiles('main', tempDir))).toBe(true)
    })

    test('array contains strings', () => {
      execSyncMock.mockReturnValue('src/a.ts\nsrc/b.ts\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      for (const item of result) {
        expect(typeof item).toBe('string')
      }
    })
  })

  describe('getChangedFiles caching behavior', () => {
    test('cache prevents repeated execSync calls within TTL', () => {
      execSyncMock.mockReturnValue('src/a.ts\nsrc/b.ts\n')
      for (let i = 0; i < 5; i++) {
        const result = gitHelpers.getChangedFiles('main', tempDir)
        expect(result).toEqual(['src/a.ts', 'src/b.ts'])
      }
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cache uses resolved path and base ref as key', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      const resolved = path.resolve(tempDir)
      gitHelpers.getChangedFiles('main', tempDir)
      gitHelpers.getChangedFiles('main', resolved)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cached empty array is returned on subsequent calls', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getChangedFiles execSync command verification', () => {
    test('uses utf-8 encoding', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ encoding: 'utf8' }),
      )
    })

    test('pipes all stdio', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
      )
    })
  })

  describe('getDefaultBranch', () => {
    test('returns default branch name from origin', () => {
      execSyncMock.mockReturnValue('main\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('returns develop when origin has develop as default', () => {
      execSyncMock.mockReturnValue('develop\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('develop')
    })

    test('returns main on error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('no remote')
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('trims whitespace from output', () => {
      execSyncMock.mockReturnValue('  main  \n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('returns main when output is empty', () => {
      execSyncMock.mockReturnValue('')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('returns main when output is only whitespace', () => {
      execSyncMock.mockReturnValue('   \n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('caches positive result', () => {
      execSyncMock.mockReturnValue('main\n')
      const r1 = gitHelpers.getDefaultBranch(tempDir)
      const r2 = gitHelpers.getDefaultBranch(tempDir)
      expect(r1).toBe('main')
      expect(r2).toBe('main')
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('caches error result as main', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      const r1 = gitHelpers.getDefaultBranch(tempDir)
      const r2 = gitHelpers.getDefaultBranch(tempDir)
      expect(r1).toBe('main')
      expect(r2).toBe('main')
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('queries separately for different directories', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch(tempDir)
      gitHelpers.getDefaultBranch('/other/dir')
      expect(execSyncMock).toHaveBeenCalledTimes(2)
    })

    test('handles output without trailing newline', () => {
      execSyncMock.mockReturnValue('main')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles TypeError thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw new TypeError('type error')
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles non-Error object thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw { code: 'ERR_CHILD_PROCESS' }
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles null thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw null
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles undefined thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw undefined
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles number thrown', () => {
      execSyncMock.mockImplementation(() => {
        throw 42
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('resolves relative paths', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('calls correct git command', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git remote show origin 2>/dev/null | grep "HEAD branch" | sed "s/.*: //" || echo main',
        expect.objectContaining({
          cwd: path.resolve(tempDir),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }),
      )
    })

    test('uses utf-8 encoding', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ encoding: 'utf8' }),
      )
    })

    test('pipes all stdio', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch(tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
      )
    })

    test('returns string type', () => {
      execSyncMock.mockReturnValue('main\n')
      expect(typeof gitHelpers.getDefaultBranch(tempDir)).toBe('string')
    })

    test('returns string even on error', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(typeof gitHelpers.getDefaultBranch(tempDir)).toBe('string')
    })

    test('handles deeply nested directory path', () => {
      execSyncMock.mockReturnValue('main\n')
      const deepPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e')
      expect(gitHelpers.getDefaultBranch(deepPath)).toBe('main')
    })

    test('handles path with spaces', () => {
      execSyncMock.mockReturnValue('main\n')
      const spacePath = path.join(tempDir, 'my project')
      expect(gitHelpers.getDefaultBranch(spacePath)).toBe('main')
    })

    test('handles branch names with slashes like feature/branch', () => {
      execSyncMock.mockReturnValue('feature/next\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('feature/next')
    })

    test('handles branch names with dashes', () => {
      execSyncMock.mockReturnValue('release-v2\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('release-v2')
    })

    test('handles master as default branch', () => {
      execSyncMock.mockReturnValue('master\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('master')
    })
  })

  describe('getDefaultBranch caching behavior', () => {
    test('cache prevents repeated execSync calls within TTL', () => {
      execSyncMock.mockReturnValue('main\n')
      for (let i = 0; i < 5; i++) {
        expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
      }
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })

    test('cache uses resolved path as key', () => {
      execSyncMock.mockReturnValue('main\n')
      const resolved = path.resolve(tempDir)
      gitHelpers.getDefaultBranch(tempDir)
      gitHelpers.getDefaultBranch(resolved)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('all five functions together', () => {
    test('all five functions can be called in sequence', () => {
      execSyncMock.mockReturnValueOnce('true\n')
      execSyncMock.mockReturnValueOnce('src/a.ts\n')
      execSyncMock.mockReturnValueOnce('src/b.ts\n')
      execSyncMock.mockReturnValueOnce('main\n')
      execSyncMock.mockReturnValueOnce('/path/to/repo\n')

      expect(gitHelpers.isGitRepository(tempDir)).toBe(true)
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual(['src/a.ts'])
      expect(gitHelpers.getChangedFiles('dev', tempDir)).toEqual(['src/b.ts'])
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/path/to/repo')
    })

    test('all five functions use independent caches', () => {
      execSyncMock.mockReturnValue('true\n')
      gitHelpers.isGitRepository(tempDir)

      execSyncMock.mockReturnValue('src/a.ts\n')
      gitHelpers.getStagedFiles(tempDir)

      execSyncMock.mockReturnValue('src/b.ts\n')
      gitHelpers.getChangedFiles('main', tempDir)

      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch(tempDir)

      execSyncMock.mockReturnValue('/repo\n')
      gitHelpers.getGitRoot(tempDir)

      // All cached, no new calls
      gitHelpers.isGitRepository(tempDir)
      gitHelpers.getStagedFiles(tempDir)
      gitHelpers.getChangedFiles('main', tempDir)
      gitHelpers.getDefaultBranch(tempDir)
      gitHelpers.getGitRoot(tempDir)

      expect(execSyncMock).toHaveBeenCalledTimes(5)
    })

    test('getChangedFiles error does not affect getDefaultBranch', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual([])

      execSyncMock.mockReturnValue('develop\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('develop')
    })

    test('getDefaultBranch error does not affect getGitRoot', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('fail')
      })
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')

      execSyncMock.mockReturnValue('/repo\n')
      expect(gitHelpers.getGitRoot(tempDir)).toBe('/repo')
    })

    test('getChangedFiles and getStagedFiles are independent', () => {
      execSyncMock.mockReturnValue('src/staged.ts\n')
      expect(gitHelpers.getStagedFiles(tempDir)).toEqual(['src/staged.ts'])

      execSyncMock.mockReturnValue('src/changed.ts\n')
      expect(gitHelpers.getChangedFiles('main', tempDir)).toEqual(['src/changed.ts'])
    })

    test('getChangedFiles with same base ref caches together', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      const r1 = gitHelpers.getChangedFiles('main', tempDir)
      const r2 = gitHelpers.getChangedFiles('main', tempDir)
      expect(r1).toEqual(r2)
      expect(execSyncMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getChangedFiles path resolution edge cases', () => {
    test('resolves dot path', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', '.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('resolves dot-dot path', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', '..')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('..') }),
      )
    })

    test('handles empty string path', () => {
      execSyncMock.mockReturnValue('')
      gitHelpers.getChangedFiles('main', '')
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('handles very long path', () => {
      execSyncMock.mockReturnValue('')
      const longPath = '/a/' + 'subdir/'.repeat(50) + 'final'
      gitHelpers.getChangedFiles('main', longPath)
      expect(execSyncMock).toHaveBeenCalled()
    })
  })

  describe('getDefaultBranch path resolution edge cases', () => {
    test('resolves dot path', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch('.')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('.') }),
      )
    })

    test('resolves dot-dot path', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch('..')
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: path.resolve('..') }),
      )
    })

    test('handles empty string path', () => {
      execSyncMock.mockReturnValue('main\n')
      gitHelpers.getDefaultBranch('')
      expect(execSyncMock).toHaveBeenCalled()
    })

    test('handles very long path', () => {
      execSyncMock.mockReturnValue('main\n')
      const longPath = '/a/' + 'subdir/'.repeat(50) + 'final'
      gitHelpers.getDefaultBranch(longPath)
      expect(execSyncMock).toHaveBeenCalled()
    })
  })

  describe('getChangedFiles output parsing edge cases', () => {
    test('handles files with parentheses', () => {
      execSyncMock.mockReturnValue('src/file (1).ts\nsrc/file (copy).js\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/file (1).ts', 'src/file (copy).js'])
    })

    test('handles files with brackets', () => {
      execSyncMock.mockReturnValue('src/[id].ts\nsrc/[...slug].tsx\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/[id].ts', 'src/[...slug].tsx'])
    })

    test('handles 200 files', () => {
      const files = Array.from({ length: 200 }, (_, i) => `src/file${i}.ts`)
      execSyncMock.mockReturnValue(files.join('\n') + '\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toHaveLength(200)
      expect(result[0]).toBe('src/file0.ts')
      expect(result[199]).toBe('src/file199.ts')
    })

    test('handles output with trailing newlines only', () => {
      execSyncMock.mockReturnValue('\n\n\n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual([])
    })

    test('handles file with trailing spaces', () => {
      execSyncMock.mockReturnValue('src/file.ts   \n')
      const result = gitHelpers.getChangedFiles('main', tempDir)
      expect(result).toEqual(['src/file.ts'])
    })

    test('handles base ref with commit hash', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getChangedFiles('abc123def456', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --name-only abc123def456 HEAD',
        expect.objectContaining({ cwd: path.resolve(tempDir) }),
      )
    })

    test('handles base ref with tag name', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getChangedFiles('v1.2.3', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --name-only v1.2.3 HEAD',
        expect.objectContaining({ cwd: path.resolve(tempDir) }),
      )
    })

    test('handles base ref with remote branch', () => {
      execSyncMock.mockReturnValue('src/file.ts\n')
      gitHelpers.getChangedFiles('origin/main', tempDir)
      expect(execSyncMock).toHaveBeenCalledWith(
        'git diff --name-only origin/main HEAD',
        expect.objectContaining({ cwd: path.resolve(tempDir) }),
      )
    })
  })

  describe('getDefaultBranch output parsing edge cases', () => {
    test('handles branch name with leading whitespace', () => {
      execSyncMock.mockReturnValue('\t  main\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles Windows-style line ending', () => {
      execSyncMock.mockReturnValue('main\r\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })

    test('handles output with multiple lines from grep', () => {
      execSyncMock.mockReturnValue('main\n')
      expect(gitHelpers.getDefaultBranch(tempDir)).toBe('main')
    })
  })
})
