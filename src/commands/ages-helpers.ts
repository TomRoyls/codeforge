import { execFileSync } from 'node:child_process'
import { relative } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface FileAge {
  filePath: string
  relativePath: string
  lastModified: string
  ageInDays: number
  ageCategory: 'ancient' | 'fresh' | 'recent' | 'stable' | 'stale'
  totalChanges: number
  authors: string[]
  linesAdded: number
  linesDeleted: number
}

export interface AgeStats {
  totalFiles: number
  averageAge: number
  medianAge: number
  oldestFile: FileAge | null
  newestFile: FileAge | null
  freshCount: number
  recentCount: number
  stableCount: number
  staleCount: number
  ancientCount: number
}

export interface AgesResult {
  files: FileAge[]
  stats: AgeStats
  staleFiles: FileAge[]
  highChurnFiles: FileAge[]
}

export interface AgesOptions {
  staleDays: number
  top: number
  sort: 'changes' | 'newest' | 'oldest'
  ext: string[]
  ignore: string[]
}

// ─── Git execution ───────────────────────────────────────

/**
 * Execute a git command and return stdout.
 * @example
 * const log = executeGit(['log', '--format="%aI"', '--name-only'], '/path/to/repo')
 */
export function executeGit(args: string[], cwd: string): string {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch {
    return ''
  }
}

// ─── Git log parsing ─────────────────────────────────────

interface DateEntry {
  lastModified: Date
  totalChanges: number
  authors: string[]
}

/**
 * Parse `git log --format="%aI" --name-only` output into a file→date map.
 * Each commit has a date line followed by file name lines (blank line separator).
 * @example
 * const dateMap = parseGitLogDates('2024-01-15T10:00:00+00:00\nsrc/index.ts\n\n2024-02-20T14:00:00+00:00\nsrc/utils.ts\n')
 */
export function parseGitLogDates(output: string): Map<string, DateEntry> {
  const map = new Map<string, DateEntry>()

  if (!output.trim()) return map

  const lines = output.split('\n')
  let currentDate: Date | null = null
  let currentAuthor: string | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      currentDate = null
      currentAuthor = null
      continue
    }

    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime()) && trimmed.includes('T')) {
      currentDate = parsed
      continue
    }

    if (trimmed.startsWith('@') && currentDate) {
      currentAuthor = trimmed.slice(1).trim()
      continue
    }

    if (currentDate) {
      const existing = map.get(trimmed)
      if (existing) {
        existing.totalChanges++
        if (currentDate > existing.lastModified) {
          existing.lastModified = currentDate
        }
        if (currentAuthor && !existing.authors.includes(currentAuthor)) {
          existing.authors.push(currentAuthor)
        }
      } else {
        map.set(trimmed, {
          authors: currentAuthor ? [currentAuthor] : [],
          lastModified: currentDate,
          totalChanges: 1,
        })
      }
    }
  }

  return map
}

// ─── Numstat parsing ─────────────────────────────────────

interface NumstatEntry {
  linesAdded: number
  linesDeleted: number
}

/**
 * Parse `git log --numstat --format=""` output into a file→stats map.
 * Each line: added\\tdeleted\\tfilepath. Binary files show as -\\t-\\tfilepath.
 * @example
 * const numstatMap = parseGitLogNumstat('10\t5\tsrc/index.ts\n3\t1\tsrc/utils.ts\n')
 */
export function parseGitLogNumstat(output: string): Map<string, NumstatEntry> {
  const map = new Map<string, NumstatEntry>()

  if (!output.trim()) return map

  const lines = output.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parts = trimmed.split('\t')
    if (parts.length < 3) continue

    const addedStr = parts[0]!
    const deletedStr = parts[1] ?? ''
    const filePath = parts.slice(2).join('\t')

    const added = addedStr === '-' ? 0 : parseInt(addedStr, 10)
    const deleted = deletedStr === '-' ? 0 : parseInt(deletedStr, 10)

    if (isNaN(added) || isNaN(deleted)) continue

    const existing = map.get(filePath)
    if (existing) {
      existing.linesAdded += added
      existing.linesDeleted += deleted
    } else {
      map.set(filePath, { linesAdded: added, linesDeleted: deleted })
    }
  }

  return map
}

// ─── Age computation ─────────────────────────────────────

/**
 * Compute the number of full days between a date and now.
 * @example
 * const days = computeAgeInDays(new Date('2024-01-01'), new Date('2024-01-15'))
 * // days === 14
 */
export function computeAgeInDays(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Categorize a file by its age in days.
 * @example
 * categorizeAge(3)  // 'fresh'
 * categorizeAge(15) // 'recent'
 * categorizeAge(200) // 'stale'
 */
export function categorizeAge(days: number): 'ancient' | 'fresh' | 'recent' | 'stable' | 'stale' {
  if (days < 7) return 'fresh'
  if (days <= 30) return 'recent'
  if (days <= 90) return 'stable'
  if (days <= 365) return 'stale'
  return 'ancient'
}

// ─── Build file ages ─────────────────────────────────────

/**
 * Combine date map and numstat map into FileAge array.
 * @example
 * const files = buildFileAges(dateMap, numstatMap, 180, '/repo')
 */
export function buildFileAges(
  dateMap: Map<string, DateEntry>,
  numstatMap: Map<string, NumstatEntry>,
  _staleDays: number,
  cwd: string,
): FileAge[] {
  const now = new Date()
  const files: FileAge[] = []

  for (const [filePath, entry] of dateMap) {
    const ageInDays = computeAgeInDays(entry.lastModified, now)
    const numstat = numstatMap.get(filePath)
    const relPath = relative(cwd, filePath) || filePath

    files.push({
      ageCategory: categorizeAge(ageInDays),
      ageInDays,
      authors: entry.authors,
      filePath,
      lastModified: entry.lastModified.toISOString(),
      linesAdded: numstat?.linesAdded ?? 0,
      linesDeleted: numstat?.linesDeleted ?? 0,
      relativePath: relPath,
      totalChanges: entry.totalChanges,
    })
  }

  return files
}

// ─── Compute stats ───────────────────────────────────────

/**
 * Compute aggregate statistics from a list of file ages.
 * @example
 * const stats = computeAgeStats(files)
 */
export function computeAgeStats(files: FileAge[]): AgeStats {
  if (files.length === 0) {
    return {
      ancientCount: 0,
      averageAge: 0,
      freshCount: 0,
      medianAge: 0,
      newestFile: null,
      oldestFile: null,
      recentCount: 0,
      stableCount: 0,
      staleCount: 0,
      totalFiles: 0,
    }
  }

  const ages = files.map((f) => f.ageInDays)
  const sorted = [...ages].sort((a, b) => a - b)
  const totalAge = ages.reduce((sum, a) => sum + a, 0)
  const averageAge = totalAge / ages.length

  const mid = Math.floor(sorted.length / 2)
  const medianAge =
    sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!

  let oldestFile: FileAge = files[0]!
  let newestFile: FileAge = files[0]!

  let freshCount = 0
  let recentCount = 0
  let stableCount = 0
  let staleCount = 0
  let ancientCount = 0

  for (const file of files) {
    if (file.ageInDays > oldestFile.ageInDays) oldestFile = file
    if (file.ageInDays < newestFile.ageInDays) newestFile = file

    switch (file.ageCategory) {
      case 'fresh':
        freshCount++
        break
      case 'recent':
        recentCount++
        break
      case 'stable':
        stableCount++
        break
      case 'stale':
        staleCount++
        break
      case 'ancient':
        ancientCount++
        break
    }
  }

  return {
    ancientCount,
    averageAge,
    freshCount,
    medianAge,
    newestFile,
    oldestFile,
    recentCount,
    stableCount,
    staleCount,
    totalFiles: files.length,
  }
}

// ─── Build ages result ───────────────────────────────────

/**
 * Orchestrate: run git commands, parse, build file ages, compute stats.
 * @example
 * const result = buildAgesResult('/repo', { staleDays: 180, top: 20, sort: 'oldest', ext: ['.ts'], ignore: [] })
 */
export function buildAgesResult(cwd: string, options: AgesOptions): AgesResult {
  const dateOutput = executeGit(
    ['log', '--format=%aI', '--name-only', '--diff-filter=ACDMR', '--', '.'],
    cwd,
  )
  const dateMap = parseGitLogDates(dateOutput)

  const numstatOutput = executeGit(['log', '--numstat', '--format=', '--', '.'], cwd)
  const numstatMap = parseGitLogNumstat(numstatOutput)

  let files = buildFileAges(dateMap, numstatMap, options.staleDays, cwd)

  if (options.ext.length > 0) {
    files = files.filter((f) => {
      const dotIndex = f.filePath.lastIndexOf('.')
      if (dotIndex === -1) return false
      const ext = f.filePath.slice(dotIndex).toLowerCase()
      return options.ext.includes(ext)
    })
  }

  if (options.ignore.length > 0) {
    files = files.filter((f) => {
      for (const pattern of options.ignore) {
        if (f.filePath.includes(pattern.replace(/\*/g, ''))) return false
      }
      return true
    })
  }

  switch (options.sort) {
    case 'oldest':
      files.sort((a, b) => b.ageInDays - a.ageInDays)
      break
    case 'newest':
      files.sort((a, b) => a.ageInDays - b.ageInDays)
      break
    case 'changes':
      files.sort((a, b) => b.totalChanges - a.totalChanges)
      break
  }

  const limitedFiles = files.slice(0, options.top)
  const stats = computeAgeStats(files)
  const staleFiles = files.filter((f) => f.ageInDays > options.staleDays)
  const sortedByChanges = [...files].sort((a, b) => b.totalChanges - a.totalChanges)
  const highChurnFiles = sortedByChanges.slice(0, 10)

  return {
    files: limitedFiles,
    highChurnFiles,
    staleFiles,
    stats,
  }
}
