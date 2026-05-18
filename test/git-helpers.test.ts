import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  clearGitCache,
  getGitCacheStats,
  isGitRepository,
  getStagedFiles,
  getChangedFiles,
  getDefaultBranch,
  getGitRoot,
} from '../src/utils/git-helpers.js'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

import { execSync } from 'node:child_process'

const mockExecSync = vi.mocked(execSync)

beforeEach(() => {
  clearGitCache()
  mockExecSync.mockReset()
})

// ─── clearGitCache ──────────────────────────────────────
describe('clearGitCache', () => {
  it('clears an empty cache without error', () => {
    expect(() => clearGitCache()).not.toThrow()
  })

  it('returns void', () => {
    const result = clearGitCache()
    expect(result).toBeUndefined()
  })

  it('clears a populated cache', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/test')
    expect(getGitCacheStats().size).toBe(1)

    clearGitCache()

    expect(getGitCacheStats().size).toBe(0)
  })

  it('can be called multiple times safely', () => {
    clearGitCache()
    clearGitCache()
    clearGitCache()
    expect(getGitCacheStats().size).toBe(0)
  })

  it('allows re-querying after clear', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/test')
    clearGitCache()
    mockExecSync.mockReturnValue('false\n')
    const result = isGitRepository('/test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })
})

// ─── getGitCacheStats ───────────────────────────────────
describe('getGitCacheStats', () => {
  it('returns empty keys array initially', () => {
    const stats = getGitCacheStats()
    expect(stats.keys).toEqual([])
  })

  it('returns size 0 initially', () => {
    const stats = getGitCacheStats()
    expect(stats.size).toBe(0)
  })

  it('returns ttlMs of 5000', () => {
    const stats = getGitCacheStats()
    expect(stats.ttlMs).toBe(5000)
  })

  it('includes keys after isGitRepository caches', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/repo')

    const stats = getGitCacheStats()
    expect(stats.keys).toHaveLength(1)
    expect(stats.keys[0]).toContain('isGitRepository:')
  })

  it('increments size for each unique cache entry', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/repo1')
    isGitRepository('/repo2')

    expect(getGitCacheStats().size).toBe(2)
  })

  it('does not increment size for cache hits', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/repo')
    isGitRepository('/repo')

    expect(getGitCacheStats().size).toBe(1)
  })

  it('reflects multiple function caches', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/repo')
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/repo')

    expect(getGitCacheStats().size).toBe(2)
  })

  it('resets to zero after clearGitCache', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/repo')
    clearGitCache()

    expect(getGitCacheStats().size).toBe(0)
    expect(getGitCacheStats().keys).toEqual([])
  })
})

// ─── isGitRepository ────────────────────────────────────
describe('isGitRepository', () => {
  it('returns true when git command succeeds', () => {
    mockExecSync.mockReturnValue('true\n')
    expect(isGitRepository('/project')).toBe(true)
  })

  it('returns false when execSync throws', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repo')
    })
    expect(isGitRepository('/not-a-repo')).toBe(false)
  })

  it('caches true result', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/cached-true')
    isGitRepository('/cached-true')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches false result', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('fatal')
    })
    isGitRepository('/cached-false')
    isGitRepository('/cached-false')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('resolves relative paths', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('.')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git rev-parse --is-inside-work-tree',
      expect.objectContaining({ cwd: expect.any(String) }),
    )
  })

  it('caches different paths independently', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/path-a')

    mockExecSync.mockImplementation(() => {
      throw new Error('nope')
    })
    isGitRepository('/path-b')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('calls git rev-parse --is-inside-work-tree', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git rev-parse --is-inside-work-tree',
      expect.anything(),
    )
  })

  it('passes resolved cwd to execSync', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/my/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cwd: '/my/project' }),
    )
  })

  it('uses utf8 encoding', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })

  it('uses pipe stdio', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
    )
  })

  it('cache hit avoids re-execution', () => {
    mockExecSync.mockReturnValue('true\n')
    for (let i = 0; i < 5; i++) {
      isGitRepository('/same-path')
    }

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('handles mixed results for different paths', () => {
    mockExecSync.mockReturnValue('true\n')
    expect(isGitRepository('/git-repo')).toBe(true)

    mockExecSync.mockImplementation(() => {
      throw new Error('fatal')
    })
    expect(isGitRepository('/non-repo')).toBe(false)

    expect(mockExecSync).toHaveBeenCalledTimes(2)

    expect(isGitRepository('/git-repo')).toBe(true)
    expect(isGitRepository('/non-repo')).toBe(false)
    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })
})

// ─── getStagedFiles ─────────────────────────────────────
describe('getStagedFiles', () => {
  it('returns array of staged file paths', () => {
    mockExecSync.mockReturnValue('src/a.ts\nsrc/b.ts\nsrc/c.ts\n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
  })

  it('returns empty array when no staged files', () => {
    mockExecSync.mockReturnValue('')
    const files = getStagedFiles('/project')

    expect(files).toEqual([])
  })

  it('returns empty array on error', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('git error')
    })
    const files = getStagedFiles('/project')

    expect(files).toEqual([])
  })

  it('caches result', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/project')
    getStagedFiles('/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches empty array result', () => {
    mockExecSync.mockReturnValue('')
    getStagedFiles('/project')
    getStagedFiles('/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches error result as empty array', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('fail')
    })
    const result1 = getStagedFiles('/project')
    const result2 = getStagedFiles('/project')

    expect(result1).toEqual([])
    expect(result2).toEqual([])
    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('calls git diff --cached --name-only --diff-filter=ACMR', () => {
    mockExecSync.mockReturnValue('')
    getStagedFiles('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git diff --cached --name-only --diff-filter=ACMR',
      expect.anything(),
    )
  })

  it('filters empty lines from output', () => {
    mockExecSync.mockReturnValue('a.ts\n\nb.ts\n\nc.ts\n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  it('trims output before splitting', () => {
    mockExecSync.mockReturnValue('  file.ts  \n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['file.ts'])
  })

  it('handles single file', () => {
    mockExecSync.mockReturnValue('only-file.ts\n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['only-file.ts'])
  })

  it('handles many files', () => {
    const manyFiles = Array.from({ length: 100 }, (_, i) => `file${i}.ts`)
    mockExecSync.mockReturnValue(manyFiles.join('\n') + '\n')
    const files = getStagedFiles('/project')

    expect(files).toHaveLength(100)
    expect(files[0]).toBe('file0.ts')
    expect(files[99]).toBe('file99.ts')
  })

  it('different paths are cached independently', () => {
    mockExecSync.mockReturnValue('a.ts\n')
    getStagedFiles('/project-a')

    mockExecSync.mockReturnValue('b.ts\n')
    getStagedFiles('/project-b')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('handles files with spaces in names', () => {
    mockExecSync.mockReturnValue('path/to/my file.ts\nother file.ts\n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['path/to/my file.ts', 'other file.ts'])
  })

  it('handles files with unicode names', () => {
    mockExecSync.mockReturnValue('src/日本語.ts\nsrc/🎉.ts\n')
    const files = getStagedFiles('/project')

    expect(files).toEqual(['src/日本語.ts', 'src/🎉.ts'])
  })

  it('resolves relative paths for cache key', () => {
    mockExecSync.mockReturnValue('')
    getStagedFiles('.')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cwd: expect.any(String) }),
    )
  })

  it('uses utf8 encoding', () => {
    mockExecSync.mockReturnValue('')
    getStagedFiles('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })
})

// ─── getChangedFiles ────────────────────────────────────
describe('getChangedFiles', () => {
  it('returns changed files relative to base ref', () => {
    mockExecSync.mockReturnValue('changed-a.ts\nchanged-b.ts\n')
    const files = getChangedFiles('main', '/project')

    expect(files).toEqual(['changed-a.ts', 'changed-b.ts'])
  })

  it('returns empty array on error', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('bad ref')
    })
    const files = getChangedFiles('main', '/project')

    expect(files).toEqual([])
  })

  it('returns empty array when no changes', () => {
    mockExecSync.mockReturnValue('')
    const files = getChangedFiles('main', '/project')

    expect(files).toEqual([])
  })

  it('caches result', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getChangedFiles('main', '/project')
    getChangedFiles('main', '/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches empty result', () => {
    mockExecSync.mockReturnValue('')
    getChangedFiles('main', '/project')
    getChangedFiles('main', '/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches error result as empty array', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('fail')
    })
    const r1 = getChangedFiles('main', '/project')
    const r2 = getChangedFiles('main', '/project')

    expect(r1).toEqual([])
    expect(r2).toEqual([])
    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('calls git diff --name-only with baseRef and HEAD', () => {
    mockExecSync.mockReturnValue('')
    getChangedFiles('develop', '/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git diff --name-only develop HEAD',
      expect.anything(),
    )
  })

  it('uses different base ref in command', () => {
    mockExecSync.mockReturnValue('')
    getChangedFiles('v1.0.0', '/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git diff --name-only v1.0.0 HEAD',
      expect.anything(),
    )
  })

  it('caches different base refs independently', () => {
    mockExecSync.mockReturnValue('a.ts\n')
    getChangedFiles('main', '/project')

    mockExecSync.mockReturnValue('b.ts\n')
    getChangedFiles('develop', '/project')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('caches different paths independently', () => {
    mockExecSync.mockReturnValue('a.ts\n')
    getChangedFiles('main', '/project-a')

    mockExecSync.mockReturnValue('b.ts\n')
    getChangedFiles('main', '/project-b')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('filters empty lines from output', () => {
    mockExecSync.mockReturnValue('a.ts\n\nb.ts\n')
    const files = getChangedFiles('main', '/project')

    expect(files).toEqual(['a.ts', 'b.ts'])
  })

  it('handles many changed files', () => {
    const many = Array.from({ length: 50 }, (_, i) => `file${i}.ts`)
    mockExecSync.mockReturnValue(many.join('\n') + '\n')
    const files = getChangedFiles('main', '/project')

    expect(files).toHaveLength(50)
  })

  it('uses utf8 encoding', () => {
    mockExecSync.mockReturnValue('')
    getChangedFiles('main', '/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })

  it('uses pipe stdio', () => {
    mockExecSync.mockReturnValue('')
    getChangedFiles('main', '/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
    )
  })

  it('handles base ref with slashes', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getChangedFiles('feature/my-branch', '/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git diff --name-only feature/my-branch HEAD',
      expect.anything(),
    )
  })
})

// ─── getDefaultBranch ───────────────────────────────────
describe('getDefaultBranch', () => {
  it('returns branch name from output', () => {
    mockExecSync.mockReturnValue('develop\n')
    expect(getDefaultBranch('/project')).toBe('develop')
  })

  it('returns main on error', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('no remote')
    })
    expect(getDefaultBranch('/project')).toBe('main')
  })

  it('returns main when output is empty after trim', () => {
    mockExecSync.mockReturnValue('\n')
    expect(getDefaultBranch('/project')).toBe('main')
  })

  it('returns main when output is whitespace only', () => {
    mockExecSync.mockReturnValue('   \n  \n')
    expect(getDefaultBranch('/project')).toBe('main')
  })

  it('trims whitespace from branch name', () => {
    mockExecSync.mockReturnValue('  develop  \n')
    expect(getDefaultBranch('/project')).toBe('develop')
  })

  it('caches result', () => {
    mockExecSync.mockReturnValue('develop\n')
    getDefaultBranch('/project')
    getDefaultBranch('/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('caches error fallback to main', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('no remote')
    })
    getDefaultBranch('/project')
    getDefaultBranch('/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('different paths are cached independently', () => {
    mockExecSync.mockReturnValue('develop\n')
    getDefaultBranch('/project-a')

    mockExecSync.mockReturnValue('master\n')
    getDefaultBranch('/project-b')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('calls correct git remote show command', () => {
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining('git remote show origin'),
      expect.anything(),
    )
  })

  it('handles branch name with slashes', () => {
    mockExecSync.mockReturnValue('feature/default\n')
    expect(getDefaultBranch('/project')).toBe('feature/default')
  })

  it('handles master as default branch', () => {
    mockExecSync.mockReturnValue('master\n')
    expect(getDefaultBranch('/project')).toBe('master')
  })

  it('handles release branch names', () => {
    mockExecSync.mockReturnValue('release/2.0\n')
    expect(getDefaultBranch('/project')).toBe('release/2.0')
  })

  it('uses utf8 encoding', () => {
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })

  it('uses pipe stdio', () => {
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
    )
  })

  it('returns cached value on subsequent calls', () => {
    mockExecSync.mockReturnValue('main\n')
    const first = getDefaultBranch('/project')
    mockExecSync.mockReturnValue('develop\n')
    const second = getDefaultBranch('/project')

    expect(first).toBe('main')
    expect(second).toBe('main')
    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })
})

// ─── getGitRoot ─────────────────────────────────────────
describe('getGitRoot', () => {
  it('returns root path on success', () => {
    mockExecSync.mockReturnValue('/home/user/project\n')
    expect(getGitRoot('/project')).toBe('/home/user/project')
  })

  it('returns null on error', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repo')
    })
    expect(getGitRoot('/not-repo')).toBeNull()
  })

  it('trims output', () => {
    mockExecSync.mockReturnValue('  /home/user/project  \n')
    expect(getGitRoot('/project')).toBe('/home/user/project')
  })

  it('calls git rev-parse --show-toplevel', () => {
    mockExecSync.mockReturnValue('/project\n')
    getGitRoot('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      'git rev-parse --show-toplevel',
      expect.anything(),
    )
  })

  it('re-executes on null cached value (null is indistinguishable from cache miss)', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('not a git repo')
    })
    getGitRoot('/null-cache')
    getGitRoot('/null-cache')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('caches string result', () => {
    mockExecSync.mockReturnValue('/cached-root\n')
    getGitRoot('/project')
    getGitRoot('/project')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('different paths are cached independently', () => {
    mockExecSync.mockReturnValue('/root-a\n')
    getGitRoot('/project-a')

    mockExecSync.mockReturnValue('/root-b\n')
    getGitRoot('/project-b')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('handles paths with spaces', () => {
    mockExecSync.mockReturnValue('/home/user/my project\n')
    expect(getGitRoot('/my project')).toBe('/home/user/my project')
  })

  it('returns path without trailing newline', () => {
    mockExecSync.mockReturnValue('/project/root\n')
    const result = getGitRoot('/project')

    expect(result).not.toContain('\n')
  })

  it('uses utf8 encoding', () => {
    mockExecSync.mockReturnValue('/project\n')
    getGitRoot('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ encoding: 'utf8' }),
    )
  })

  it('uses pipe stdio', () => {
    mockExecSync.mockReturnValue('/project\n')
    getGitRoot('/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ stdio: ['pipe', 'pipe', 'pipe'] }),
    )
  })

  it('passes resolved cwd to execSync', () => {
    mockExecSync.mockReturnValue('/project\n')
    getGitRoot('/my/project')

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cwd: '/my/project' }),
    )
  })
})

// ─── Cache TTL Expiration ───────────────────────────────
describe('Cache TTL Expiration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('isGitRepository cache expires after 5000ms', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/ttl-test')

    vi.advanceTimersByTime(5001)

    mockExecSync.mockReturnValue('false\n')
    isGitRepository('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('isGitRepository cache does not expire before 5000ms', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/ttl-test')

    vi.advanceTimersByTime(4999)

    isGitRepository('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('getStagedFiles cache expires after 2000ms', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/ttl-test')

    vi.advanceTimersByTime(2001)

    mockExecSync.mockReturnValue('other.ts\n')
    getStagedFiles('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('getStagedFiles cache does not expire before 2000ms', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/ttl-test')

    vi.advanceTimersByTime(1999)

    getStagedFiles('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('getChangedFiles cache expires after 2000ms', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getChangedFiles('main', '/ttl-test')

    vi.advanceTimersByTime(2001)

    mockExecSync.mockReturnValue('other.ts\n')
    getChangedFiles('main', '/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('getChangedFiles cache does not expire before 2000ms', () => {
    mockExecSync.mockReturnValue('file.ts\n')
    getChangedFiles('main', '/ttl-test')

    vi.advanceTimersByTime(1999)

    getChangedFiles('main', '/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('getDefaultBranch cache expires after 5000ms', () => {
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/ttl-test')

    vi.advanceTimersByTime(5001)

    mockExecSync.mockReturnValue('develop\n')
    getDefaultBranch('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('getDefaultBranch cache does not expire before 5000ms', () => {
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/ttl-test')

    vi.advanceTimersByTime(4999)

    getDefaultBranch('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('getGitRoot string cache expires after 5000ms', () => {
    mockExecSync.mockReturnValue('/root\n')
    getGitRoot('/ttl-test')

    vi.advanceTimersByTime(5001)

    mockExecSync.mockReturnValue('/new-root\n')
    getGitRoot('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('getGitRoot cache does not expire before 5000ms', () => {
    mockExecSync.mockReturnValue('/root\n')
    getGitRoot('/ttl-test')

    vi.advanceTimersByTime(4999)

    getGitRoot('/ttl-test')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('expired entries are removed from cache', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/ttl-remove')

    expect(getGitCacheStats().size).toBe(1)

    vi.advanceTimersByTime(5001)

    mockExecSync.mockReturnValue('false\n')
    isGitRepository('/ttl-remove')

    expect(getGitCacheStats().size).toBe(1)
  })
})

// ─── Cache Integration ──────────────────────────────────
describe('Cache Integration', () => {
  it('multiple functions share the same cache', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/shared')
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/shared')

    expect(getGitCacheStats().size).toBe(2)
  })

  it('clearing cache affects all functions', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/shared')
    mockExecSync.mockReturnValue('file.ts\n')
    getStagedFiles('/shared')
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/shared')

    expect(getGitCacheStats().size).toBe(3)

    clearGitCache()

    expect(getGitCacheStats().size).toBe(0)
  })

  it('cache keys are unique per function type', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/multi')
    mockExecSync.mockReturnValue('')
    getStagedFiles('/multi')
    mockExecSync.mockReturnValue('')
    getChangedFiles('main', '/multi')
    mockExecSync.mockReturnValue('main\n')
    getDefaultBranch('/multi')
    mockExecSync.mockReturnValue('/root\n')
    getGitRoot('/multi')

    const stats = getGitCacheStats()
    expect(stats.size).toBe(5)

    const prefixes = stats.keys.map((k) => k.split(':')[0])
    expect(prefixes).toContain('isGitRepository')
    expect(prefixes).toContain('getStagedFiles')
    expect(prefixes).toContain('getChangedFiles')
    expect(prefixes).toContain('getDefaultBranch')
    expect(prefixes).toContain('getGitRoot')
  })

  it('independent caching per function', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/ind')

    mockExecSync.mockReturnValue('a.ts\n')
    getStagedFiles('/ind')

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('sequential calls to same function use cache', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/seq')
    isGitRepository('/seq')
    isGitRepository('/seq')

    expect(mockExecSync).toHaveBeenCalledTimes(1)
  })

  it('interleaved function calls cache independently', () => {
    mockExecSync.mockReturnValue('true\n')
    const r1 = isGitRepository('/interleave')
    expect(r1).toBe(true)

    mockExecSync.mockReturnValue('file.ts\n')
    const r2 = getStagedFiles('/interleave')
    expect(r2).toEqual(['file.ts'])

    mockExecSync.mockReturnValue('false\n')
    const r3 = isGitRepository('/interleave')
    expect(r3).toBe(true)

    expect(mockExecSync).toHaveBeenCalledTimes(2)
  })

  it('getChangedFiles cache key includes baseRef', () => {
    mockExecSync.mockReturnValue('a.ts\n')
    getChangedFiles('main', '/multi-ref')
    getChangedFiles('develop', '/multi-ref')
    getChangedFiles('v1.0', '/multi-ref')

    expect(mockExecSync).toHaveBeenCalledTimes(3)
    expect(getGitCacheStats().size).toBe(3)
  })

  it('cache stats keys include resolved absolute paths', () => {
    mockExecSync.mockReturnValue('true\n')
    isGitRepository('/absolute/path')

    const stats = getGitCacheStats()
    expect(stats.keys[0]).toContain('/absolute/path')
  })
})
