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
  })
})
