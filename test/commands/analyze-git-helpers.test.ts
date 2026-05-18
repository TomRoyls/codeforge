import { existsSync } from 'node:fs'
import path from 'node:path'

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getGitChangedFiles,
  getStagedFilesList,
  resolveTargetFiles,
} from '../../src/commands/analyze-git-helpers.js'
import { discoverFiles } from '../../src/core/file-discovery.js'
import {
  getChangedFiles,
  getDefaultBranch,
  getGitRoot,
  getStagedFiles,
  isGitRepository,
} from '../../src/utils/git-helpers.js'

vi.mock('../../src/utils/git-helpers.js')
vi.mock('../../src/core/file-discovery.js')
vi.mock('node:fs')

const mockedIsGitRepo = vi.mocked(isGitRepository)
const mockedGetGitRoot = vi.mocked(getGitRoot)
const mockedGetStagedFiles = vi.mocked(getStagedFiles)
const mockedGetChangedFiles = vi.mocked(getChangedFiles)
const mockedGetDefaultBranch = vi.mocked(getDefaultBranch)
const mockedDiscoverFiles = vi.mocked(discoverFiles)
const mockedExistsSync = vi.mocked(existsSync)

// ─── Helpers ───

const MOCK_GIT_ROOT = '/fake/git/root'

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getStagedFilesList ───

describe('getStagedFilesList', () => {
  it('returns error when not a git repository', () => {
    mockedIsGitRepo.mockReturnValue(false)
    const result = getStagedFilesList('/some/path')
    expect(result.error).toBe('Not a git repository. --staged requires a git repository.')
    expect(result.files).toEqual([])
  })

  it('returns error when git root cannot be determined', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(null)
    const result = getStagedFilesList('/some/path')
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  it('returns empty files when no staged files exist', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue([])
    const result = getStagedFilesList('/some/path')
    expect(result.error).toBeUndefined()
    expect(result.files).toEqual([])
  })

  it('returns staged files that exist on disk', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue(['src/a.ts', 'src/b.ts'])
    mockedExistsSync.mockReturnValue(true)
    const result = getStagedFilesList('/some/path')
    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({
      absolutePath: path.join(MOCK_GIT_ROOT, 'src/a.ts'),
      path: 'src/a.ts',
    })
    expect(result.files[1]).toEqual({
      absolutePath: path.join(MOCK_GIT_ROOT, 'src/b.ts'),
      path: 'src/b.ts',
    })
  })

  it('filters out staged files that no longer exist on disk', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue(['src/exists.ts', 'src/deleted.ts'])
    mockedExistsSync.mockImplementation((p) => String(p).endsWith('exists.ts'))
    const result = getStagedFilesList('/some/path')
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('src/exists.ts')
  })

  it('returns all files filtered when none exist on disk', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue(['gone.ts', 'also-gone.ts'])
    mockedExistsSync.mockReturnValue(false)
    const result = getStagedFilesList('/some/path')
    expect(result.files).toEqual([])
  })
})

// ─── getGitChangedFiles ───

describe('getGitChangedFiles', () => {
  it('returns error when not a git repository', () => {
    mockedIsGitRepo.mockReturnValue(false)
    const result = getGitChangedFiles('/some/path', undefined)
    expect(result.error).toBe('Not a git repository. --changed requires a git repository.')
    expect(result.files).toEqual([])
  })

  it('returns error when git root cannot be determined', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(null)
    const result = getGitChangedFiles('/some/path', undefined)
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  it('uses default branch when baseRef is undefined', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetDefaultBranch.mockReturnValue('main')
    mockedGetChangedFiles.mockReturnValue([])
    getGitChangedFiles('/some/path', undefined)
    expect(mockedGetChangedFiles).toHaveBeenCalledWith('main', MOCK_GIT_ROOT)
  })

  it('uses provided baseRef instead of default branch', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetDefaultBranch.mockReturnValue('main')
    mockedGetChangedFiles.mockReturnValue([])
    getGitChangedFiles('/some/path', 'develop')
    expect(mockedGetChangedFiles).toHaveBeenCalledWith('develop', MOCK_GIT_ROOT)
    expect(mockedGetDefaultBranch).not.toHaveBeenCalled()
  })

  it('returns empty files when no changed files exist', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetDefaultBranch.mockReturnValue('main')
    mockedGetChangedFiles.mockReturnValue([])
    const result = getGitChangedFiles('/some/path', undefined)
    expect(result.error).toBeUndefined()
    expect(result.files).toEqual([])
  })

  it('returns changed files that exist on disk', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetDefaultBranch.mockReturnValue('main')
    mockedGetChangedFiles.mockReturnValue(['src/changed.ts'])
    mockedExistsSync.mockReturnValue(true)
    const result = getGitChangedFiles('/some/path', undefined)
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('src/changed.ts')
  })

  it('filters out changed files that do not exist on disk', () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetDefaultBranch.mockReturnValue('main')
    mockedGetChangedFiles.mockReturnValue(['src/real.ts', 'src/phantom.ts'])
    mockedExistsSync.mockImplementation((p) => String(p).endsWith('real.ts'))
    const result = getGitChangedFiles('/some/path', undefined)
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('src/real.ts')
  })
})

// ─── resolveTargetFiles ───

describe('resolveTargetFiles', () => {
  it('delegates to getStagedFilesList when stagedMode is true', async () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue(['staged.ts'])
    mockedExistsSync.mockReturnValue(true)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/some/path',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('staged.ts')
  })

  it('delegates to getGitChangedFiles when changedMode is set', async () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetChangedFiles.mockReturnValue(['changed.ts'])
    mockedExistsSync.mockReturnValue(true)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/some/path',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('changed.ts')
  })

  it('delegates to discoverFiles when neither staged nor changed mode', async () => {
    mockedDiscoverFiles.mockResolvedValue([
      { absolutePath: '/abs/src/foo.ts', path: 'src/foo.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['**/*.ts'],
      ignore: ['node_modules'],
      spinner: null,
      stagedMode: false,
    })
    expect(mockedDiscoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: ['node_modules'],
      patterns: ['**/*.ts'],
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0]?.path).toBe('src/foo.ts')
  })

  it('passes empty arrays for files and ignore to discoverFiles', async () => {
    mockedDiscoverFiles.mockResolvedValue([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(mockedDiscoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: [],
    })
  })

  it('prioritizes stagedMode over changedMode', async () => {
    mockedIsGitRepo.mockReturnValue(true)
    mockedGetGitRoot.mockReturnValue(MOCK_GIT_ROOT)
    mockedGetStagedFiles.mockReturnValue(['staged-file.ts'])
    mockedExistsSync.mockReturnValue(true)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/some/path',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(mockedGetStagedFiles).toHaveBeenCalled()
    expect(result.files[0]?.path).toBe('staged-file.ts')
  })

  it('returns error from staged mode when not a git repo', async () => {
    mockedIsGitRepo.mockReturnValue(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBe('Not a git repository. --staged requires a git repository.')
  })

  it('returns error from changed mode when not a git repo', async () => {
    mockedIsGitRepo.mockReturnValue(false)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBe('Not a git repository. --changed requires a git repository.')
  })
})
