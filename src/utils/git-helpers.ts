import { execSync } from 'node:child_process'
import * as path from 'path'

interface GitCacheEntry<T> {
  value: T
  timestamp: number
}

const GIT_CACHE_TTL = 5000 // 5 seconds
const STAGED_FILES_CACHE_TTL = 2000 // 2 seconds (staged files change frequently)

const gitCache = new Map<string, GitCacheEntry<unknown>>()

export function clearGitCache(): void {
  gitCache.clear()
}

export interface GitCacheStats {
  size: number
  keys: string[]
  ttlMs: number
}

export function getGitCacheStats(): GitCacheStats {
  return {
    size: gitCache.size,
    keys: Array.from(gitCache.keys()),
    ttlMs: GIT_CACHE_TTL,
  }
}

function getGitCached<T>(key: string, ttl: number): T | null {
  const entry = gitCache.get(key) as GitCacheEntry<T> | undefined
  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > ttl
  if (isExpired) {
    gitCache.delete(key)
    return null
  }

  return entry.value
}

function setGitCached<T>(key: string, value: T): void {
  gitCache.set(key, { value, timestamp: Date.now() })
}

export function isGitRepository(cwd: string): boolean {
  const resolvedPath = path.resolve(cwd)
  const cacheKey = `isGitRepository:${resolvedPath}`

  const cached = getGitCached<boolean>(cacheKey, GIT_CACHE_TTL)
  if (cached !== null) return cached

  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd: resolvedPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    setGitCached(cacheKey, true)
    return true
  } catch {
    setGitCached(cacheKey, false)
    return false
  }
}

export function getStagedFiles(cwd: string): string[] {
  const resolvedPath = path.resolve(cwd)
  const cacheKey = `getStagedFiles:${resolvedPath}`

  const cached = getGitCached<string[]>(cacheKey, STAGED_FILES_CACHE_TTL)
  if (cached !== null) return cached

  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: resolvedPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const result = output
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)

    setGitCached(cacheKey, result)
    return result
  } catch {
    setGitCached(cacheKey, [])
    return []
  }
}

export function getChangedFiles(baseRef: string, cwd: string): string[] {
  const resolvedPath = path.resolve(cwd)
  const cacheKey = `getChangedFiles:${baseRef}:${resolvedPath}`

  const cached = getGitCached<string[]>(cacheKey, STAGED_FILES_CACHE_TTL)
  if (cached !== null) return cached

  try {
    const output = execSync(`git diff --name-only ${baseRef} HEAD`, {
      cwd: resolvedPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const result = output
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)

    setGitCached(cacheKey, result)
    return result
  } catch {
    setGitCached(cacheKey, [])
    return []
  }
}

export function getDefaultBranch(cwd: string): string {
  const resolvedPath = path.resolve(cwd)
  const cacheKey = `getDefaultBranch:${resolvedPath}`

  const cached = getGitCached<string>(cacheKey, GIT_CACHE_TTL)
  if (cached !== null) return cached

  try {
    const output = execSync(
      'git remote show origin 2>/dev/null | grep "HEAD branch" | sed "s/.*: //" || echo main',
      {
        cwd: resolvedPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    ).trim()

    const result = output || 'main'
    setGitCached(cacheKey, result)
    return result
  } catch {
    setGitCached(cacheKey, 'main')
    return 'main'
  }
}

export function getGitRoot(cwd: string): string | null {
  const resolvedPath = path.resolve(cwd)
  const cacheKey = `getGitRoot:${resolvedPath}`

  const cached = getGitCached<string | null>(cacheKey, GIT_CACHE_TTL)
  if (cached !== null) return cached

  try {
    const result = execSync('git rev-parse --show-toplevel', {
      cwd: resolvedPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    setGitCached(cacheKey, result)
    return result
  } catch {
    setGitCached(cacheKey, null)
    return null
  }
}
