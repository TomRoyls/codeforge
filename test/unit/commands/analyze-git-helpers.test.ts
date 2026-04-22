import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/utils/git-helpers.js', () => ({
  isGitRepository: vi.fn().mockReturnValue(true),
  getGitRoot: vi.fn().mockReturnValue('/project'),
  getStagedFiles: vi.fn().mockReturnValue([]),
  getChangedFiles: vi.fn().mockReturnValue([]),
  getDefaultBranch: vi.fn().mockReturnValue('main'),
}))

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return { ...actual, existsSync: vi.fn().mockReturnValue(true) }
})

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

// ============================================================================
// Import after mocks
// ============================================================================

const { isGitRepository, getGitRoot, getStagedFiles, getChangedFiles, getDefaultBranch } =
  await import('../../../src/utils/git-helpers.js')
const { discoverFiles } = await import('../../../src/core/file-discovery.js')
const { getStagedFilesList, getGitChangedFiles, resolveTargetFiles } =
  await import('../../../src/commands/analyze-git-helpers.js')

// ============================================================================
// Helper to temporarily override existsSync
// ============================================================================

async function withExistsSync(predicate: (p: string) => boolean, fn: () => void) {
  const fsSync = await import('node:fs')
  const origExists = fsSync.existsSync
  fsSync.existsSync = (p: unknown) => predicate(String(p))
  try {
    fn()
  } finally {
    fsSync.existsSync = origExists
  }
}

// ============================================================================
// getStagedFilesList
// ============================================================================

describe('getStagedFilesList', () => {
  test('returns error when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/not/git')
    expect(result.error).toBe('Not a git repository. --staged requires a git repository.')
    expect(result.files).toEqual([])
  })

  test('returns error when git root cannot be determined', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getStagedFilesList('/project')
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('returns empty files when no staged files', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getStagedFilesList('/project')
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('returns discovered files for staged paths', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/a.ts', 'src/b.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0]).toEqual({ absolutePath: '/project/src/a.ts', path: 'src/a.ts' })
    expect(result.files[1]).toEqual({ absolutePath: '/project/src/b.ts', path: 'src/b.ts' })
  })

  test('filters out non-existent files', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/exists.ts',
      'src/missing.ts',
    ])
    await withExistsSync(
      (p) => p.endsWith('exists.ts'),
      () => {
        const result = getStagedFilesList('/project')
        expect(result.files).toHaveLength(1)
        expect(result.files[0].path).toBe('src/exists.ts')
      },
    )
  })

  test('returns single staged file', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['only.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('only.ts')
    expect(result.files[0].absolutePath).toBe('/project/only.ts')
  })

  test('returns no error when files are found', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/a.ts'])
    const result = getStagedFilesList('/project')
    expect(result.error).toBeUndefined()
  })

  test('returns empty array when all staged files are non-existent', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['gone1.ts', 'gone2.ts'])
    await withExistsSync(
      () => false,
      () => {
        const result = getStagedFilesList('/project')
        expect(result.files).toEqual([])
      },
    )
  })

  test('handles deeply nested staged file paths', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/features/auth/utils/token.ts',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/features/auth/utils/token.ts')
    expect(result.files[0].absolutePath).toBe('/project/src/features/auth/utils/token.ts')
  })

  test('handles many staged files', () => {
    const paths = Array.from({ length: 20 }, (_, i) => 'file' + i + '.ts')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(paths)
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(20)
  })

  test('uses gitRoot not cwd for absolute paths', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/actual/git/root')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['lib.ts'])
    const result = getStagedFilesList('/some/subdir')
    expect(result.files[0].absolutePath).toBe('/actual/git/root/lib.ts')
  })

  test('returns both path and absolutePath for each file', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['x.ts'])
    const result = getStagedFilesList('/project')
    const file = result.files[0]
    expect(file).toHaveProperty('path', 'x.ts')
    expect(file).toHaveProperty('absolutePath', '/project/x.ts')
  })

  test('partially filters when some files exist and some do not', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'a.ts',
      'b.ts',
      'c.ts',
      'd.ts',
    ])
    await withExistsSync(
      (p) => p.endsWith('b.ts') || p.endsWith('d.ts'),
      () => {
        const result = getStagedFilesList('/project')
        expect(result.files).toHaveLength(2)
        expect(result.files.map((f) => f.path)).toEqual(['b.ts', 'd.ts'])
      },
    )
  })

  test('error message mentions --staged flag specifically', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/nope')
    expect(result.error).toContain('--staged')
  })
})

// ============================================================================
// getGitChangedFiles
// ============================================================================

describe('getGitChangedFiles', () => {
  test('returns error when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/not/git', undefined)
    expect(result.error).toBe('Not a git repository. --changed requires a git repository.')
    expect(result.files).toEqual([])
  })

  test('returns error when git root cannot be determined', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', undefined)
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('uses provided baseRef', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', 'develop')
    expect(getChangedFiles).toHaveBeenCalledWith('develop', '/project')
  })

  test('uses default branch when no baseRef provided', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('main')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', undefined)
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/project')
  })

  test('returns empty files when no changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('returns discovered files for changed paths', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/changed1.ts',
      'src/changed2.ts',
    ])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('src/changed1.ts')
    expect(result.files[1].path).toBe('src/changed2.ts')
  })

  test('returns absolute paths using gitRoot', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['foo.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files[0].absolutePath).toBe('/project/foo.ts')
  })

  test('filters out non-existent changed files', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['exists.ts', 'deleted.ts'])
    await withExistsSync(
      (p) => p.endsWith('exists.ts'),
      () => {
        const result = getGitChangedFiles('/project', 'main')
        expect(result.files).toHaveLength(1)
        expect(result.files[0].path).toBe('exists.ts')
      },
    )
  })

  test('returns single changed file', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['single.ts'])
    const result = getGitChangedFiles('/project', 'HEAD')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('single.ts')
  })

  test('uses default branch when baseRef is empty string', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('main')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', '')
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/project')
  })

  test('handles HEAD~N style refs', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['old.ts'])
    getGitChangedFiles('/project', 'HEAD~5')
    expect(getChangedFiles).toHaveBeenCalledWith('HEAD~5', '/project')
  })

  test('handles tag-based refs', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['tagged.ts'])
    getGitChangedFiles('/project', 'v2.0.0')
    expect(getChangedFiles).toHaveBeenCalledWith('v2.0.0', '/project')
  })

  test('returns empty when all changed files are non-existent', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'removed1.ts',
      'removed2.ts',
    ])
    await withExistsSync(
      () => false,
      () => {
        const result = getGitChangedFiles('/project', 'main')
        expect(result.files).toEqual([])
      },
    )
  })

  test('uses gitRoot for absolute paths even when different from cwd', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/real/root')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['x.ts'])
    const result = getGitChangedFiles('/some/subdir', 'main')
    expect(result.files[0].absolutePath).toBe('/real/root/x.ts')
  })

  test('returns no error when files are found', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['found.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.error).toBeUndefined()
  })

  test('error message mentions --changed flag specifically', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/nope', undefined)
    expect(result.error).toContain('--changed')
  })

  test('handles many changed files', () => {
    const paths = Array.from({ length: 30 }, (_, i) => 'changed' + i + '.ts')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(paths)
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(30)
  })

  test('calls getDefaultBranch with cwd', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('develop')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/my/project', undefined)
    expect(getDefaultBranch).toHaveBeenCalledWith('/my/project')
  })

  test('handles deeply nested changed file paths', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'packages/core/src/lib/deep/module.ts',
    ])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files[0].absolutePath).toBe('/project/packages/core/src/lib/deep/module.ts')
  })
})

// ============================================================================
// resolveTargetFiles
// ============================================================================

describe('resolveTargetFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore default mock implementations after clearing
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  test('delegates to getStagedFilesList when stagedMode=true', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('staged.ts')
  })

  test('delegates to getGitChangedFiles when changedMode set', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('changed.ts')
  })

  test('uses file discovery for normal mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/src/a.ts', path: 'src/a.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/**/*.ts'],
      ignore: ['node_modules'],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: ['node_modules'],
      patterns: ['src/**/*.ts'],
    })
  })

  test('returns error from staged mode', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBeDefined()
    expect(result.files).toEqual([])
  })

  test('returns error from changed mode', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/not/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBeDefined()
    expect(result.files).toEqual([])
  })

  test('passes files and ignore to discoverFiles', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/root',
      files: ['**/*.ts', '**/*.tsx'],
      ignore: ['dist/**', 'node_modules/**'],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/root',
      ignore: ['dist/**', 'node_modules/**'],
      patterns: ['**/*.ts', '**/*.tsx'],
    })
  })

  test('returns empty files when discoverFiles returns empty', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('stagedMode takes priority over changedMode', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'develop',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('staged.ts')
  })

  test('changedMode with empty string delegates to getGitChangedFiles', async () => {
    // Empty string is !== undefined, so it enters the changedMode branch
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('main')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['some.ts'])
    const result = await resolveTargetFiles({
      changedMode: '',
      cwd: '/project',
      files: ['*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('some.ts')
    expect(getChangedFiles).toHaveBeenCalled()
    // discoverFiles should NOT be called since changedMode is set (empty string !== undefined)
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('returns error from getGitChangedFiles when git root fails', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/broken',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBe('Could not determine git repository root.')
  })

  test('returns error from getStagedFilesList when git root fails', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/broken',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBe('Could not determine git repository root.')
  })

  test('staged mode ignores files and ignore parameters', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.js'],
      ignore: ['dist'],
      spinner: null,
      stagedMode: true,
    })
    // discoverFiles should NOT be called
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('changed mode ignores files and ignore parameters', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: ['*.js'],
      ignore: ['build'],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('returns multiple files from discoverFiles', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
      { absolutePath: '/project/c.ts', path: 'c.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(3)
  })

  test('passes specific baseRef to getGitChangedFiles', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    await resolveTargetFiles({
      changedMode: 'feature-branch',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getChangedFiles).toHaveBeenCalledWith('feature-branch', '/project')
  })

  test('normal mode has no error on success', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/x.ts', path: 'x.ts' },
    ])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['x.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBeUndefined()
  })

  test('staged mode has no error on success', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['s.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBeUndefined()
  })

  test('changed mode has no error on success', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['c.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBeUndefined()
  })

  test('normal mode with empty files array passes empty patterns', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: [],
    })
  })

  test('returns empty files and no error when staged files are empty', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('returns empty files and no error when changed files are empty', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('changed mode uses baseRef from changedMode option', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    await resolveTargetFiles({
      changedMode: 'feature/x',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getChangedFiles).toHaveBeenCalledWith('feature/x', '/project')
  })

  test('changed mode uses default branch when changedMode is empty string', async () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('develop')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    await resolveTargetFiles({
      changedMode: '',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
    expect(getChangedFiles).toHaveBeenCalledWith('develop', '/project')
  })

  test('file discovery mode passes single file pattern', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/index.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: ['src/index.ts'],
    })
  })

  test('file discovery mode passes multiple ignore patterns', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['**/*.ts'],
      ignore: ['dist/**', 'build/**', 'coverage/**'],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: ['dist/**', 'build/**', 'coverage/**'],
      patterns: ['**/*.ts'],
    })
  })

  test('resolves to files returned by discoverFiles in normal mode', async () => {
    const discoveredFiles = [
      { absolutePath: '/project/src/alpha.ts', path: 'src/alpha.ts' },
      { absolutePath: '/project/src/beta.ts', path: 'src/beta.ts' },
    ]
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce(discoveredFiles)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toEqual(discoveredFiles)
  })

  test('does not call isGitRepository in normal file discovery mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(isGitRepository).not.toHaveBeenCalled()
  })

  test('does not call getGitRoot in normal file discovery mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getGitRoot).not.toHaveBeenCalled()
  })

  test('staged mode does not call discoverFiles or getChangedFiles', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['s.ts'])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(discoverFiles).not.toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('changed mode does not call discoverFiles or getStagedFiles', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['c.ts'])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).not.toHaveBeenCalled()
    expect(getStagedFiles).not.toHaveBeenCalled()
  })

  test('staged mode error propagates isGitRepository check', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/no/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toContain('--staged')
  })

  test('changed mode error propagates isGitRepository check', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/no/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toContain('--changed')
  })
})

// ============================================================================
// getStagedFilesList — Additional coverage
// ============================================================================

describe('getStagedFilesList additional coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('calls isGitRepository with the provided cwd', () => {
    getStagedFilesList('/custom/cwd')
    expect(isGitRepository).toHaveBeenCalledWith('/custom/cwd')
  })

  test('calls getGitRoot with the provided cwd', () => {
    getStagedFilesList('/custom/cwd')
    expect(getGitRoot).toHaveBeenCalledWith('/custom/cwd')
  })

  test('calls getStagedFiles with gitRoot', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/git/root')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getStagedFilesList('/subdir')
    expect(getStagedFiles).toHaveBeenCalledWith('/git/root')
  })

  test('returns files with correct relative and absolute paths', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/repo')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['dir/file.ts'])
    const result = getStagedFilesList('/repo')
    expect(result.files[0]).toEqual({
      absolutePath: '/repo/dir/file.ts',
      path: 'dir/file.ts',
    })
  })

  test('preserves file order from getStagedFiles', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['z.ts', 'a.ts', 'm.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files.map((f) => f.path)).toEqual(['z.ts', 'a.ts', 'm.ts'])
  })

  test('handles files with dots in directory names', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/modules/auth.login.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files[0].path).toBe('src/modules/auth.login.ts')
  })

  test('handles file at repo root', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['README.md'])
    const result = getStagedFilesList('/project')
    expect(result.files[0]).toEqual({
      absolutePath: '/project/README.md',
      path: 'README.md',
    })
  })

  test('handles file with spaces in path', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/my folder/my file.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files[0].path).toBe('src/my folder/my file.ts')
    expect(result.files[0].absolutePath).toBe('/project/src/my folder/my file.ts')
  })

  test('does not call getStagedFiles when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    getStagedFilesList('/nope')
    expect(getStagedFiles).not.toHaveBeenCalled()
  })

  test('does not call getStagedFiles when git root is null', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    getStagedFilesList('/project')
    expect(getStagedFiles).not.toHaveBeenCalled()
  })

  test('result has error property but no files when not git repo', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/nope')
    expect(result).toEqual({
      error: 'Not a git repository. --staged requires a git repository.',
      files: [],
    })
  })

  test('result has files property as empty array when no staged files', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getStagedFilesList('/project')
    expect(result).toEqual({ files: [] })
  })

  test('filters files where some paths have special characters', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/[special].ts',
      'src/normal.ts',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('src/[special].ts')
  })

  test('returns multiple file types', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'a.ts',
      'b.js',
      'c.css',
      'd.json',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files.map((f) => f.path)).toEqual(['a.ts', 'b.js', 'c.css', 'd.json'])
  })

  test('returns error object with only error and files keys when not git', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/x')
    const keys = Object.keys(result).sort()
    expect(keys).toEqual(['error', 'files'])
  })
})

// ============================================================================
// getGitChangedFiles — Additional coverage
// ============================================================================

describe('getGitChangedFiles additional coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('calls isGitRepository with the provided cwd', () => {
    getGitChangedFiles('/my/cwd', 'main')
    expect(isGitRepository).toHaveBeenCalledWith('/my/cwd')
  })

  test('calls getGitRoot with the provided cwd', () => {
    getGitChangedFiles('/my/cwd', 'main')
    expect(getGitRoot).toHaveBeenCalledWith('/my/cwd')
  })

  test('does not call getChangedFiles when not a git repository', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    getGitChangedFiles('/nope', 'main')
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('does not call getChangedFiles when git root is null', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    getGitChangedFiles('/project', 'main')
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('does not call getDefaultBranch when baseRef is provided', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', 'explicit-ref')
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })

  test('calls getDefaultBranch only when baseRef is undefined', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('develop')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', undefined)
    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
  })

  test('uses full SHA commit hash as ref', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', 'abc123def456789012345678901234567890abcd')
    expect(getChangedFiles).toHaveBeenCalledWith(
      'abc123def456789012345678901234567890abcd',
      '/project',
    )
  })

  test('uses short SHA as ref', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', 'abc1234')
    expect(getChangedFiles).toHaveBeenCalledWith('abc1234', '/project')
  })

  test('handles branch name with slashes', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', 'feature/auth/login')
    expect(getChangedFiles).toHaveBeenCalledWith('feature/auth/login', '/project')
  })

  test('handles origin/branch remote ref', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', 'origin/main')
    expect(getChangedFiles).toHaveBeenCalledWith('origin/main', '/project')
  })

  test('preserves order of changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['z.ts', 'a.ts', 'm.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files.map((f) => f.path)).toEqual(['z.ts', 'a.ts', 'm.ts'])
  })

  test('handles file at repo root', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['package.json'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files[0]).toEqual({
      absolutePath: '/project/package.json',
      path: 'package.json',
    })
  })

  test('returns multiple file types from changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'b.vue', 'c.scss'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files.map((f) => f.path)).toEqual(['a.ts', 'b.vue', 'c.scss'])
  })

  test('result object has error and files keys when not git', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/x', undefined)
    const keys = Object.keys(result).sort()
    expect(keys).toEqual(['error', 'files'])
  })

  test('result has only files key when files found', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    const result = getGitChangedFiles('/project', 'main')
    const keys = Object.keys(result).sort()
    expect(keys).toEqual(['files'])
  })

  test('handles file with spaces in changed path', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/hello world.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files[0].path).toBe('src/hello world.ts')
    expect(result.files[0].absolutePath).toBe('/project/src/hello world.ts')
  })

  test('partially filters changed files when some do not exist', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'keep1.ts',
      'remove.ts',
      'keep2.ts',
    ])
    await withExistsSync(
      (p) => !p.includes('remove'),
      () => {
        const result = getGitChangedFiles('/project', 'main')
        expect(result.files).toHaveLength(2)
        expect(result.files.map((f) => f.path)).toEqual(['keep1.ts', 'keep2.ts'])
      },
    )
  })

  test('handles deeply nested changed file', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a/b/c/d/e/f/g/deep.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files[0].path).toBe('a/b/c/d/e/f/g/deep.ts')
    expect(result.files[0].absolutePath).toBe('/project/a/b/c/d/e/f/g/deep.ts')
  })

  test('returns error and files keys consistently on git root failure', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', 'main')
    expect(result).toEqual({
      error: 'Could not determine git repository root.',
      files: [],
    })
  })

  test('handles large number of changed files', () => {
    const paths = Array.from({ length: 50 }, (_, i) => `file${i}.ts`)
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(paths)
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(50)
    expect(result.files[49].path).toBe('file49.ts')
  })

  test('handles single changed file that does not exist', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['deleted.ts'])
    await withExistsSync(
      () => false,
      () => {
        const result = getGitChangedFiles('/project', 'main')
        expect(result.files).toEqual([])
        expect(result.error).toBeUndefined()
      },
    )
  })
})

// ============================================================================
// resolveTargetFiles — Additional coverage
// ============================================================================

describe('resolveTargetFiles additional coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  test('staged mode with both staged and changed options set delegates to staged', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['s1.ts', 's2.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'develop',
      cwd: '/project',
      files: ['*.ts'],
      ignore: ['dist'],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(2)
    expect(getChangedFiles).not.toHaveBeenCalled()
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('file discovery mode does not call any git helpers', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(isGitRepository).not.toHaveBeenCalled()
    expect(getGitRoot).not.toHaveBeenCalled()
    expect(getStagedFiles).not.toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('passes spinner option through to discoverFiles in normal mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: [],
    })
  })

  test('returns large number of files from discoverFiles', async () => {
    const discovered = Array.from({ length: 40 }, (_, i) => ({
      absolutePath: `/project/f${i}.ts`,
      path: `f${i}.ts`,
    }))
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce(discovered)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(40)
  })

  test('returns large number of staged files via resolveTargetFiles', async () => {
    const staged = Array.from({ length: 30 }, (_, i) => `staged${i}.ts`)
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(staged)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(30)
  })

  test('returns large number of changed files via resolveTargetFiles', async () => {
    const changed = Array.from({ length: 25 }, (_, i) => `changed${i}.ts`)
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(changed)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(25)
  })

  test('changed mode with non-existent files returns empty', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['gone.ts'])
    const { existsSync: realExists } = await import('node:fs')
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = () => false
    try {
      const result = await resolveTargetFiles({
        changedMode: 'main',
        cwd: '/project',
        files: [],
        ignore: [],
        spinner: null,
        stagedMode: false,
      })
      expect(result.files).toEqual([])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('staged mode with non-existent files returns empty', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['gone.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = () => false
    try {
      const result = await resolveTargetFiles({
        changedMode: undefined,
        cwd: '/project',
        files: [],
        ignore: [],
        spinner: null,
        stagedMode: true,
      })
      expect(result.files).toEqual([])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('changed mode with specific ref passes ref correctly', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['ref.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'release/v3.0',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getChangedFiles).toHaveBeenCalledWith('release/v3.0', '/project')
    expect(result.files[0].path).toBe('ref.ts')
  })

  test('normal mode preserves discoverFiles result shape', async () => {
    const discovered = [{ absolutePath: '/project/a.ts', path: 'a.ts' }]
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce(discovered)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['a.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result).toEqual({ files: discovered })
    expect(result.error).toBeUndefined()
  })
})

// ============================================================================
// getStagedFilesList — Edge Cases
// ============================================================================

describe('getStagedFilesList edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
  })

  test('handles unicode file names', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/日本語.ts',
      'src/файл.ts',
      'src/🎉.ts',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(3)
    expect(result.files[0].path).toBe('src/日本語.ts')
    expect(result.files[1].path).toBe('src/файл.ts')
    expect(result.files[2].path).toBe('src/🎉.ts')
  })

  test('handles paths with multiple consecutive slashes', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src//nested///file.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src//nested///file.ts')
  })

  test('handles file named with only extension', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['.gitignore', '.env'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('.gitignore')
    expect(result.files[1].path).toBe('.env')
  })

  test('handles mixed staged files including config files', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'tsconfig.json',
      'package.json',
      'src/index.ts',
      '.eslintrc.js',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(4)
    expect(result.files.map((f) => f.path)).toEqual([
      'tsconfig.json',
      'package.json',
      'src/index.ts',
      '.eslintrc.js',
    ])
  })

  test('does not call getGitRoot when not a git repo', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    getStagedFilesList('/nope')
    expect(getGitRoot).not.toHaveBeenCalled()
  })

  test('returns empty files when getStagedFiles returns empty array', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getStagedFilesList('/project')
    expect(result.files).toEqual([])
    expect(result.error).toBeUndefined()
  })

  test('does not call getDefaultBranch', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts'])
    getStagedFilesList('/project')
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })

  test('does not call getChangedFiles', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts'])
    getStagedFilesList('/project')
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('handles files with hyphens and underscores', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/my-component_test.ts',
      'src/foo-bar.ts',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].path).toBe('src/my-component_test.ts')
    expect(result.files[1].path).toBe('src/foo-bar.ts')
  })

  test('handles file at root with no extension', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['Makefile', 'Dockerfile'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(2)
    expect(result.files[0].absolutePath).toBe('/project/Makefile')
    expect(result.files[1].absolutePath).toBe('/project/Dockerfile')
  })

  test('handles files with parentheses in path', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'src/utils(backup)/helper.ts',
    ])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/utils(backup)/helper.ts')
  })

  test('early return on non-git does not proceed to getStagedFiles', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/not/git')
    expect(getStagedFiles).not.toHaveBeenCalled()
    expect(result.error).toContain('--staged')
  })

  test('early return on null gitRoot does not proceed to getStagedFiles', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getStagedFilesList('/project')
    expect(getStagedFiles).not.toHaveBeenCalled()
    expect(result.error).toBe('Could not determine git repository root.')
  })
})

// ============================================================================
// getGitChangedFiles — Edge Cases
// ============================================================================

describe('getGitChangedFiles edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('handles unicode file names in changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/한국어.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toBe('src/한국어.ts')
  })

  test('handles hidden files in changed list', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['.env.local', '.gitignore'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(2)
    expect(result.files.map((f) => f.path)).toEqual(['.env.local', '.gitignore'])
  })

  test('does not call getStagedFiles', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts'])
    getGitChangedFiles('/project', 'main')
    expect(getStagedFiles).not.toHaveBeenCalled()
  })

  test('does not call getGitRoot when not a git repo', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    getGitChangedFiles('/nope', 'main')
    expect(getGitRoot).not.toHaveBeenCalled()
  })

  test('returns files key only when files are found', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['found.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(Object.keys(result)).toEqual(['files'])
  })

  test('returns both error and files when git root is null', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', 'main')
    expect(Object.keys(result).sort()).toEqual(['error', 'files'])
  })

  test('handles mixed file extensions in changed files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'a.ts',
      'b.tsx',
      'c.js',
      'd.jsx',
      'e.mjs',
      'f.cjs',
    ])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(6)
  })

  test('uses default branch fallback when baseRef is undefined', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('develop')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', undefined)
    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
    expect(getChangedFiles).toHaveBeenCalledWith('develop', '/project')
  })

  test('does not call getDefaultBranch when baseRef is truthy', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['f.ts'])
    getGitChangedFiles('/project', 'main')
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })

  test('handles file at nested monorepo path', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/monorepo')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'packages/cli/src/commands/test.ts',
    ])
    const result = getGitChangedFiles('/monorepo/packages/cli', 'main')
    expect(result.files[0].absolutePath).toBe('/monorepo/packages/cli/src/commands/test.ts')
  })

  test('handles empty string baseRef as falsy', () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('main')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', '')
    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/project')
  })

  test('returns no error when no changed files found', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.error).toBeUndefined()
  })

  test('handles single file at repo root', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['index.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].absolutePath).toBe('/project/index.ts')
    expect(result.files[0].path).toBe('index.ts')
  })

  test('does not call getDefaultBranch when given explicit ref', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/project', 'v1.0.0')
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })
})

// ============================================================================
// resolveTargetFiles — Edge Cases
// ============================================================================

describe('resolveTargetFiles edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  test('does not call getStagedFiles when stagedMode is false and changedMode is set', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['c.ts'])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getStagedFiles).not.toHaveBeenCalled()
  })

  test('does not call isGitRepository in normal mode', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(isGitRepository).not.toHaveBeenCalled()
  })

  test('calls isGitRepository in staged mode', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(isGitRepository).toHaveBeenCalledWith('/project')
  })

  test('calls isGitRepository in changed mode', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(isGitRepository).toHaveBeenCalledWith('/project')
  })

  test('staged mode with both flags: staged=true, changedMode set', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'develop',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files[0].path).toBe('staged.ts')
    expect(getStagedFiles).toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
  })

  test('normal mode returns exactly what discoverFiles returns', async () => {
    const discovered = [
      { absolutePath: '/project/a.ts', path: 'a.ts' },
      { absolutePath: '/project/b.ts', path: 'b.ts' },
    ]
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce(discovered)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toBe(discovered)
  })

  test('normal mode with spinner passes spinner through', async () => {
    const mockSpinner = { start: vi.fn(), stop: vi.fn() }
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: mockSpinner,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: [],
    })
  })

  test('staged mode with spinner still uses git helpers', async () => {
    const mockSpinner = { start: vi.fn(), stop: vi.fn() }
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['s.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: mockSpinner,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(1)
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('changed mode with spinner still uses git helpers', async () => {
    const mockSpinner = { start: vi.fn(), stop: vi.fn() }
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['c.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: mockSpinner,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(1)
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('returns promise that resolves to correct shape', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/x.ts', path: 'x.ts' },
    ])
    const promise = resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['x.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(promise).toBeInstanceOf(Promise)
    const result = await promise
    expect(result.files).toHaveLength(1)
  })

  test('staged mode with getGitRoot returning null returns error', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/broken',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('changed mode with getGitRoot returning null returns error', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/broken',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('normal mode does not call getGitRoot', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getGitRoot).not.toHaveBeenCalled()
  })

  test('normal mode does not call getDefaultBranch', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })

  test('staged mode with files ignored still returns staged files', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged1.ts', 'staged2.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.js'],
      ignore: ['**/*.test.ts'],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files).toHaveLength(2)
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('changed mode with files ignored still returns changed files', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([
      'changed1.ts',
      'changed2.ts',
    ])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: ['*.js'],
      ignore: ['**/*.test.ts'],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files).toHaveLength(2)
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('changed mode with non-empty baseRef uses that ref', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['file.ts'])
    await resolveTargetFiles({
      changedMode: 'custom-branch',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getChangedFiles).toHaveBeenCalledWith('custom-branch', '/project')
    expect(getDefaultBranch).not.toHaveBeenCalled()
  })

  test('normal mode passes multiple file patterns', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js'],
    })
  })

  test('staged mode returns error when isGitRepository returns false', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/no/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.error).toContain('Not a git repository')
    expect(result.error).toContain('--staged')
  })

  test('changed mode returns error when isGitRepository returns false', async () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/no/git',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.error).toContain('Not a git repository')
    expect(result.error).toContain('--changed')
  })

  test('resolves target files for staged mode returns correct absolute paths', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/my/repo')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['src/main.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/my/repo',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files[0].absolutePath).toBe('/my/repo/src/main.ts')
  })

  test('resolves target files for changed mode returns correct absolute paths', async () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/my/repo')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['lib/util.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/my/repo',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files[0].absolutePath).toBe('/my/repo/lib/util.ts')
  })
})

// ============================================================================
// filterExistingGitFiles (indirect) — Path Behavior Tests
// ============================================================================

describe('filterExistingGitFiles via getStagedFilesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
  })

  test('all files exist returns all files', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'b.ts', 'c.ts'])
    const result = getStagedFilesList('/project')
    expect(result.files).toHaveLength(3)
  })

  test('no files exist returns empty array', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['x.ts', 'y.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = () => false
    try {
      const result = getStagedFilesList('/project')
      expect(result.files).toEqual([])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('first file exists, second does not', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['keep.ts', 'drop.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => String(p).endsWith('keep.ts')
    try {
      const result = getStagedFilesList('/project')
      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('keep.ts')
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('first file does not exist, second exists', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['drop.ts', 'keep.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => String(p).endsWith('keep.ts')
    try {
      const result = getStagedFilesList('/project')
      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('keep.ts')
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('middle file does not exist', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'drop.ts', 'c.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => !String(p).includes('drop')
    try {
      const result = getStagedFilesList('/project')
      expect(result.files).toHaveLength(2)
      expect(result.files.map((f) => f.path)).toEqual(['a.ts', 'c.ts'])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('absolute path uses path.join correctly', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/root')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['dir/file.ts'])
    const result = getStagedFilesList('/anywhere')
    expect(result.files[0].absolutePath).toBe('/root/dir/file.ts')
  })
})

// ============================================================================
// filterExistingGitFiles via getGitChangedFiles
// ============================================================================

describe('filterExistingGitFiles via getGitChangedFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('all changed files exist returns all files', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'b.ts', 'c.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(result.files).toHaveLength(3)
  })

  test('no changed files exist returns empty array', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['x.ts', 'y.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = () => false
    try {
      const result = getGitChangedFiles('/project', 'main')
      expect(result.files).toEqual([])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('first changed file exists, second does not', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['keep.ts', 'drop.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => String(p).endsWith('keep.ts')
    try {
      const result = getGitChangedFiles('/project', 'main')
      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('keep.ts')
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('first changed file does not exist, second exists', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['drop.ts', 'keep.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => String(p).endsWith('keep.ts')
    try {
      const result = getGitChangedFiles('/project', 'main')
      expect(result.files).toHaveLength(1)
      expect(result.files[0].path).toBe('keep.ts')
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('middle changed file does not exist', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts', 'drop.ts', 'c.ts'])
    const fsSync = await import('node:fs')
    const orig = fsSync.existsSync
    fsSync.existsSync = (p: unknown) => !String(p).includes('drop')
    try {
      const result = getGitChangedFiles('/project', 'main')
      expect(result.files).toHaveLength(2)
      expect(result.files.map((f) => f.path)).toEqual(['a.ts', 'c.ts'])
    } finally {
      fsSync.existsSync = orig
    }
  })

  test('absolute path uses path.join correctly', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/root')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['dir/file.ts'])
    const result = getGitChangedFiles('/anywhere', 'main')
    expect(result.files[0].absolutePath).toBe('/root/dir/file.ts')
  })
})

// ============================================================================
// getStagedFilesList — Return Value Shape Tests
// ============================================================================

describe('getStagedFilesList return value shape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
  })

  test('success result has only files property', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts'])
    const result = getStagedFilesList('/project')
    expect(Object.keys(result)).toEqual(['files'])
  })

  test('empty result has only files property', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getStagedFilesList('/project')
    expect(Object.keys(result)).toEqual(['files'])
  })

  test('error result has error and files properties', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/nope')
    expect(Object.keys(result).sort()).toEqual(['error', 'files'])
    expect(result.error).toBeTruthy()
    expect(result.files).toEqual([])
  })

  test('git root null result has error and files properties', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getStagedFilesList('/project')
    expect(Object.keys(result).sort()).toEqual(['error', 'files'])
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('file objects have exactly path and absolutePath', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['test.ts'])
    const result = getStagedFilesList('/project')
    const file = result.files[0]
    expect(Object.keys(file!).sort()).toEqual(['absolutePath', 'path'])
  })
})

// ============================================================================
// getGitChangedFiles — Return Value Shape Tests
// ============================================================================

describe('getGitChangedFiles return value shape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('success result has only files property', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['a.ts'])
    const result = getGitChangedFiles('/project', 'main')
    expect(Object.keys(result)).toEqual(['files'])
  })

  test('empty result has only files property', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    const result = getGitChangedFiles('/project', 'main')
    expect(Object.keys(result)).toEqual(['files'])
  })

  test('error result has error and files properties', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/nope', 'main')
    expect(Object.keys(result).sort()).toEqual(['error', 'files'])
    expect(result.error).toBeTruthy()
    expect(result.files).toEqual([])
  })

  test('git root null result has error and files properties', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(null)
    const result = getGitChangedFiles('/project', 'main')
    expect(Object.keys(result).sort()).toEqual(['error', 'files'])
    expect(result.error).toBe('Could not determine git repository root.')
    expect(result.files).toEqual([])
  })

  test('file objects have exactly path and absolutePath', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['test.ts'])
    const result = getGitChangedFiles('/project', 'main')
    const file = result.files[0]
    expect(Object.keys(file!).sort()).toEqual(['absolutePath', 'path'])
  })
})

// ============================================================================
// resolveTargetFiles — Mode Priority
// ============================================================================

describe('resolveTargetFiles mode priority', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue([])
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  test('stagedMode=true and changedMode=undefined: uses staged', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(getStagedFiles).toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('stagedMode=true and changedMode set: uses staged (priority)', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    await resolveTargetFiles({
      changedMode: 'develop',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(getStagedFiles).toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('stagedMode=false and changedMode set: uses changed', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getStagedFiles).not.toHaveBeenCalled()
    expect(getChangedFiles).toHaveBeenCalled()
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('stagedMode=false and changedMode undefined: uses file discovery', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { absolutePath: '/project/a.ts', path: 'a.ts' },
    ])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getStagedFiles).not.toHaveBeenCalled()
    expect(getChangedFiles).not.toHaveBeenCalled()
    expect(discoverFiles).toHaveBeenCalled()
  })

  test('changedMode empty string falls back to default branch', async () => {
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValueOnce('develop')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    await resolveTargetFiles({
      changedMode: '',
      cwd: '/project',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(getDefaultBranch).toHaveBeenCalledWith('/project')
    expect(getChangedFiles).toHaveBeenCalledWith('develop', '/project')
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('stagedMode=true with files parameter: ignores files param', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['staged.ts'])
    const result = await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['*.js', '**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: true,
    })
    expect(result.files[0].path).toBe('staged.ts')
    expect(discoverFiles).not.toHaveBeenCalled()
  })

  test('changedMode with value ignores files parameter', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['changed.ts'])
    const result = await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: ['*.js', '**/*.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(result.files[0].path).toBe('changed.ts')
    expect(discoverFiles).not.toHaveBeenCalled()
  })
})

// ============================================================================
// getStagedFilesList — Idempotency & Consistency
// ============================================================================

describe('getStagedFilesList consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
  })

  test('calling twice with same input returns same result shape', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValue(['dup.ts'])
    const r1 = getStagedFilesList('/project')
    const r2 = getStagedFilesList('/project')
    expect(r1.files).toEqual(r2.files)
  })

  test('returns fresh result after mock change', () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['first.ts'])
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['second.ts'])
    const r1 = getStagedFilesList('/project')
    const r2 = getStagedFilesList('/project')
    expect(r1.files[0].path).toBe('first.ts')
    expect(r2.files[0].path).toBe('second.ts')
  })
})

// ============================================================================
// getGitChangedFiles — Consistency
// ============================================================================

describe('getGitChangedFiles consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValue(true)
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValue('/project')
    ;(getDefaultBranch as ReturnType<typeof vi.fn>).mockReturnValue('main')
  })

  test('calling twice with same input returns same result shape', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValue(['dup.ts'])
    const r1 = getGitChangedFiles('/project', 'main')
    const r2 = getGitChangedFiles('/project', 'main')
    expect(r1.files).toEqual(r2.files)
  })

  test('returns fresh result after mock change', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['first.ts'])
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['second.ts'])
    const r1 = getGitChangedFiles('/project', 'main')
    const r2 = getGitChangedFiles('/project', 'main')
    expect(r1.files[0].path).toBe('first.ts')
    expect(r2.files[0].path).toBe('second.ts')
  })

  test('getGitRoot is called with cwd not baseRef', () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/cwd/path', 'some-ref')
    expect(getGitRoot).toHaveBeenCalledWith('/cwd/path')
    expect(getGitRoot).not.toHaveBeenCalledWith('some-ref')
  })

  test('getChangedFiles receives gitRoot as second argument', () => {
    ;(getGitRoot as ReturnType<typeof vi.fn>).mockReturnValueOnce('/real/root')
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    getGitChangedFiles('/subdir', 'main')
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/real/root')
  })

  test('error for non-git repo mentions --changed not --staged', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getGitChangedFiles('/nope', 'main')
    expect(result.error).toContain('--changed')
    expect(result.error).not.toContain('--staged')
  })

  test('error for non-git staged mentions --staged not --changed', () => {
    ;(isGitRepository as ReturnType<typeof vi.fn>).mockReturnValueOnce(false)
    const result = getStagedFilesList('/nope')
    expect(result.error).toContain('--staged')
    expect(result.error).not.toContain('--changed')
  })

  test('resolveTargetFiles normal mode with single file pattern', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['src/index.ts'],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith({
      cwd: '/project',
      ignore: [],
      patterns: ['src/index.ts'],
    })
  })

  test('resolveTargetFiles normal mode passes cwd to discoverFiles', async () => {
    ;(discoverFiles as ReturnType<typeof vi.fn>).mockResolvedValueOnce([])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/custom/dir',
      files: [],
      ignore: [],
      spinner: null,
      stagedMode: false,
    })
    expect(discoverFiles).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/custom/dir' }))
  })

  test('resolveTargetFiles staged mode does not pass files to git helpers', async () => {
    ;(getStagedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['s.ts'])
    await resolveTargetFiles({
      changedMode: undefined,
      cwd: '/project',
      files: ['unrelated.ts'],
      ignore: ['node_modules'],
      spinner: null,
      stagedMode: true,
    })
    expect(getStagedFiles).toHaveBeenCalledWith('/project')
  })

  test('resolveTargetFiles changed mode does not pass files to git helpers', async () => {
    ;(getChangedFiles as ReturnType<typeof vi.fn>).mockReturnValueOnce(['c.ts'])
    await resolveTargetFiles({
      changedMode: 'main',
      cwd: '/project',
      files: ['unrelated.ts'],
      ignore: ['node_modules'],
      spinner: null,
      stagedMode: false,
    })
    expect(getChangedFiles).toHaveBeenCalledWith('main', '/project')
  })
})
