import { describe, it, expect, vi } from 'vitest'

import {
  getStagedFilesList,
  getGitChangedFiles,
  resolveTargetFiles,
} from '../src/commands/analyze-git-helpers.js'

// ─── Mocks ────────────────────────────────────────────

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:path', () => ({
  default: {
    join: (...segments: string[]) => segments.join('/'),
  },
}))

vi.mock('../src/utils/git-helpers.js', () => ({
  isGitRepository: vi.fn().mockReturnValue(true),
  getGitRoot: vi.fn().mockReturnValue('/project'),
  getStagedFiles: vi.fn().mockReturnValue([]),
  getDefaultBranch: vi.fn().mockReturnValue('main'),
  getChangedFiles: vi.fn().mockReturnValue([]),
}))

vi.mock('../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([
    { absolutePath: '/project/src/foo.ts', path: 'src/foo.ts' },
  ]),
}))

import { existsSync } from 'node:fs'
import {
  isGitRepository,
  getGitRoot,
  getStagedFiles,
  getDefaultBranch,
  getChangedFiles,
} from '../src/utils/git-helpers.js'
import { discoverFiles } from '../src/core/file-discovery.js'

// ─── getStagedFilesList ───────────────────────────────
describe('getStagedFilesList', () => {
  it('returns error when not a git repository', () => {
    vi.mocked(isGitRepository).mockReturnValueOnce(false)

    const result = getStagedFilesList('/tmp')

    expect(result.error).toContain('Not a git repository')
    expect(result.files).toHaveLength(0)
  })

  it('returns error when git root cannot be determined', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValueOnce(null as any)

    const result = getStagedFilesList('/project')

    expect(result.error).toContain('Could not determine git repository root')
    expect(result.files).toHaveLength(0)
  })

  it('returns empty files when no staged files', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getStagedFiles).mockReturnValueOnce([])

    const result = getStagedFilesList('/project')

    expect(result.files).toHaveLength(0)
    expect(result.error).toBeUndefined()
  })

  it('returns staged files that exist on disk', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getStagedFiles).mockReturnValue(['src/a.ts', 'src/b.ts'])
    vi.mocked(existsSync).mockReturnValue(true)

    const result = getStagedFilesList('/project')

    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({
      absolutePath: '/project/src/a.ts',
      path: 'src/a.ts',
    })
  })

  it('filters out files that do not exist on disk', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getStagedFiles).mockReturnValue(['src/a.ts', 'src/deleted.ts'])
    vi.mocked(existsSync)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)

    const result = getStagedFilesList('/project')

    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/a.ts')
  })
})

// ─── getGitChangedFiles ───────────────────────────────
describe('getGitChangedFiles', () => {
  it('returns error when not a git repository', () => {
    vi.mocked(isGitRepository).mockReturnValueOnce(false)

    const result = getGitChangedFiles('/tmp', undefined)

    expect(result.error).toContain('Not a git repository')
    expect(result.files).toHaveLength(0)
  })

  it('returns error when git root cannot be determined', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValueOnce(null as any)

    const result = getGitChangedFiles('/project', undefined)

    expect(result.error).toContain('Could not determine git repository root')
  })

  it('uses default branch when no base ref provided', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getDefaultBranch).mockReturnValue('develop')
    vi.mocked(getChangedFiles).mockReturnValueOnce([])

    getGitChangedFiles('/project', undefined)

    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
  })

  it('uses provided base ref instead of default branch', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getChangedFiles).mockReturnValueOnce([])

    getGitChangedFiles('/project', 'feature-branch')

    expect(getChangedFiles).toHaveBeenCalledWith('feature-branch', '/project')
  })

  it('returns empty files when no changed files', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getChangedFiles).mockReturnValueOnce([])

    const result = getGitChangedFiles('/project', 'main')

    expect(result.files).toHaveLength(0)
    expect(result.error).toBeUndefined()
  })

  it('returns changed files that exist on disk', () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getChangedFiles).mockReturnValue(['src/changed.ts'])
    vi.mocked(existsSync).mockReturnValue(true)

    const result = getGitChangedFiles('/project', 'main')

    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/changed.ts')
  })
})

// ─── resolveTargetFiles ───────────────────────────────
describe('resolveTargetFiles', () => {
  const baseOptions = {
    changedMode: undefined,
    cwd: '/project',
    files: ['**/*.ts'],
    ignore: [],
    spinner: null,
    stagedMode: false,
  }

  it('delegates to getStagedFilesList when stagedMode is true', async () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getStagedFiles).mockReturnValue(['src/staged.ts'])
    vi.mocked(existsSync).mockReturnValue(true)

    const result = await resolveTargetFiles({ ...baseOptions, stagedMode: true })

    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/staged.ts')
  })

  it('delegates to getGitChangedFiles when changedMode is set', async () => {
    vi.mocked(isGitRepository).mockReturnValue(true)
    vi.mocked(getGitRoot).mockReturnValue('/project')
    vi.mocked(getChangedFiles).mockReturnValue(['src/changed.ts'])
    vi.mocked(existsSync).mockReturnValue(true)

    const result = await resolveTargetFiles({ ...baseOptions, changedMode: 'main' })

    expect(result.files).toHaveLength(1)
  })

  it('falls back to discoverFiles for normal mode', async () => {
    vi.mocked(discoverFiles).mockResolvedValueOnce([
      { absolutePath: '/project/src/foo.ts', path: 'src/foo.ts' },
    ])

    const result = await resolveTargetFiles(baseOptions)

    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: ['**/*.ts'],
    })
    expect(result.files).toHaveLength(1)
  })

  it('passes ignore patterns to discoverFiles', async () => {
    vi.mocked(discoverFiles).mockResolvedValueOnce([])

    await resolveTargetFiles({ ...baseOptions, ignore: ['node_modules/**'] })

    expect(discoverFiles).toHaveBeenCalledWith(
      expect.objectContaining({ ignore: ['node_modules/**'] }),
    )
  })
})
