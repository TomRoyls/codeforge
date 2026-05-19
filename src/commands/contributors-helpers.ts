import { execSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

export interface Contributor {
  name: string
  email: string
  commits: number
  linesAdded: number
  linesDeleted: number
  firstCommit: string
  lastCommit: string
  activeDays: number
  filesTouched: number
}

export interface FileContributorEntry {
  name: string
  commits: number
  linesChanged: number
}

export interface FileContributor {
  filePath: string
  contributors: FileContributorEntry[]
}

export interface ContributorsResult {
  contributors: Contributor[]
  totalCommits: number
  totalLinesAdded: number
  totalLinesDeleted: number
  dateRange: { first: string; last: string }
  busFactor: number
  byFile: FileContributor[]
}

// ─── Git command execution ──────────────────────────────

/**
 * Execute a git command and return stdout as a string.
 *
 * @example
 * ```ts
 * const output = executeGitCommand(['log', '--format=%aN|%aE'], '/path/to/repo')
 * ```
 *
 * @param args - Git command arguments (without 'git' prefix)
 * @param cwd - Working directory to run the command in
 * @returns stdout string, or empty string on error
 */
export function executeGitCommand(args: string[], cwd: string): string {
  try {
    const command = `git ${args.join(' ')}`
    return execSync(command, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, cwd }).trim()
  } catch {
    return ''
  }
}

// ─── parseGitLogShort ───────────────────────────────────

/**
 * Parse `git log --format="%aN|%aE"` output into contributor commit counts.
 *
 * @example
 * ```ts
 * const result = parseGitLogShort('Alice Smith|alice@example.com\nBob|bob@example.com\nAlice Smith|alice@example.com')
 * // result = [{ name: 'Alice Smith', email: 'alice@example.com', commits: 2 }, { name: 'Bob', email: 'bob@example.com', commits: 1 }]
 * ```
 *
 * @param logOutput - Raw output from `git log --format="%aN|%aE"`
 * @returns Array of contributor commit counts keyed by email
 */
export function parseGitLogShort(logOutput: string): { name: string; email: string; commits: number }[] {
  if (!logOutput.trim()) return []

  const counts = new Map<string, { name: string; email: string; commits: number }>()

  for (const line of logOutput.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const pipeIndex = trimmed.lastIndexOf('|')
    if (pipeIndex === -1) continue

    const name = trimmed.slice(0, pipeIndex)
    const email = trimmed.slice(pipeIndex + 1)

    const existing = counts.get(email)
    if (existing) {
      existing.commits++
    } else {
      counts.set(email, { commits: 1, email, name })
    }
  }

  return Array.from(counts.values())
}

// ─── parseGitLogNumstat ─────────────────────────────────

/**
 * Parse `git log --numstat --format="COMMIT:%aN|%aE"` output into per-contributor line stats.
 *
 * @example
 * ```ts
 * const result = parseGitLogNumstat('COMMIT:Alice|a@b.com\n10\t5\tfile.ts\nCOMMIT:Bob|b@c.com\n3\t1\tfile.ts')
 * ```
 *
 * @param numstatOutput - Raw output from git log with numstat
 * @returns Map of email to { linesAdded, linesDeleted, filesTouched }
 */
export function parseGitLogNumstat(
  numstatOutput: string,
): Map<string, { email: string; linesAdded: number; linesDeleted: number; filesTouched: number }> {
  const result = new Map<string, { email: string; linesAdded: number; linesDeleted: number; filesTouched: number }>()

  if (!numstatOutput.trim()) return result

  let currentEmail = ''

  for (const line of numstatOutput.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('COMMIT:')) {
      const info = trimmed.slice(7)
      const pipeIndex = info.lastIndexOf('|')
      if (pipeIndex !== -1) {
        currentEmail = info.slice(pipeIndex + 1)
        if (!result.has(currentEmail)) {
          result.set(currentEmail, { email: currentEmail, filesTouched: 0, linesAdded: 0, linesDeleted: 0 })
        }
      }
      continue
    }

    if (!currentEmail) continue

    const parts = trimmed.split('\t')
    if (parts.length >= 3) {
      const added = parts[0]
      const deleted = parts[1]
      // Binary files show as "-"
      const entry = result.get(currentEmail)
      if (entry) {
        if (added !== '-') {
          entry.linesAdded += Number.parseInt(added, 10) || 0
        }
        if (deleted !== '-') {
          entry.linesDeleted += Number.parseInt(deleted, 10) || 0
        }
        entry.filesTouched++
      }
    }
  }

  return result
}

// ─── parseGitLogDates ───────────────────────────────────

/**
 * Parse `git log --format="%aE|%aI"` output into per-contributor date ranges.
 *
 * @example
 * ```ts
 * const result = parseGitLogDates('a@b.com|2024-01-15T10:00:00+00:00\na@b.com|2024-03-20T14:00:00+00:00')
 * // result = Map { 'a@b.com' => { firstCommit: '2024-01-15T10:00:00+00:00', lastCommit: '2024-03-20T14:00:00+00:00', activeDays: 2 } }
 * ```
 *
 * @param datesOutput - Raw output from `git log --format="%aE|%aI"`
 * @returns Map of email to date info (firstCommit, lastCommit, activeDays)
 */
export function parseGitLogDates(
  datesOutput: string,
): Map<string, { firstCommit: string; lastCommit: string; activeDays: number }> {
  const result = new Map<string, { firstCommit: string; lastCommit: string; activeDays: number }>()

  if (!datesOutput.trim()) return result

  for (const line of datesOutput.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const pipeIndex = trimmed.lastIndexOf('|')
    if (pipeIndex === -1) continue

    const email = trimmed.slice(0, pipeIndex)
    const dateStr = trimmed.slice(pipeIndex + 1)

    const existing = result.get(email)
    if (existing) {
      if (dateStr < existing.firstCommit) {
        existing.firstCommit = dateStr
      }
      if (dateStr > existing.lastCommit) {
        existing.lastCommit = dateStr
      }
    } else {
      result.set(email, { activeDays: 1, firstCommit: dateStr, lastCommit: dateStr })
    }
  }

  const dateSets = new Map<string, Set<string>>()
  for (const line of datesOutput.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const pipeIndex = trimmed.lastIndexOf('|')
    if (pipeIndex === -1) continue

    const email = trimmed.slice(0, pipeIndex)
    const dateStr = trimmed.slice(pipeIndex + 1)
    const dateOnly = dateStr.slice(0, 10)

    const existing = dateSets.get(email)
    if (existing) {
      existing.add(dateOnly)
    } else {
      dateSets.set(email, new Set([dateOnly]))
    }
  }

  for (const [email, dates] of dateSets) {
    const entry = result.get(email)
    if (entry) {
      entry.activeDays = dates.size
    }
  }

  return result
}

// ─── buildContributors ──────────────────────────────────

/**
 * Merge parsed git log data into a sorted Contributor array.
 *
 * @example
 * ```ts
 * const contributors = buildContributors(shortLog, numstat, dates)
 * ```
 *
 * @param shortLog - Output from parseGitLogShort
 * @param numstat - Output from parseGitLogNumstat
 * @param dates - Output from parseGitLogDates
 * @returns Sorted Contributor array (by commits desc)
 */
export function buildContributors(
  shortLog: { name: string; email: string; commits: number }[],
  numstat: Map<string, { email: string; linesAdded: number; linesDeleted: number; filesTouched: number }>,
  dates: Map<string, { firstCommit: string; lastCommit: string; activeDays: number }>,
): Contributor[] {
  const contributors: Contributor[] = []

  for (const entry of shortLog) {
    const numstatData = numstat.get(entry.email)
    const dateData = dates.get(entry.email)

    contributors.push({
      activeDays: dateData?.activeDays ?? 0,
      commits: entry.commits,
      email: entry.email,
      filesTouched: numstatData?.filesTouched ?? 0,
      firstCommit: dateData?.firstCommit ?? '',
      lastCommit: dateData?.lastCommit ?? '',
      linesAdded: numstatData?.linesAdded ?? 0,
      linesDeleted: numstatData?.linesDeleted ?? 0,
      name: entry.name,
    })
  }

  contributors.sort((a, b) => b.commits - a.commits)
  return contributors
}

// ─── calculateBusFactor ─────────────────────────────────

/**
 * Estimate bus factor: minimum number of contributors whose departure
 * would mean the project loses >= 50% of total commits.
 *
 * @example
 * ```ts
 * calculateBusFactor([{ commits: 80 }, { commits: 15 }, { commits: 5 }]) // 1
 * calculateBusFactor([{ commits: 25 }, { commits: 25 }, { commits: 25 }, { commits: 25 }]) // 2
 * ```
 *
 * @param contributors - Array of contributors sorted by commits descending
 * @returns Bus factor number
 */
export function calculateBusFactor(contributors: { commits: number }[]): number {
  if (contributors.length === 0) return 0

  const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0)
  if (totalCommits === 0) return 0

  const threshold = totalCommits * 0.5
  let accumulated = 0

  for (let i = 0; i < contributors.length; i++) {
    accumulated += contributors[i]!.commits
    if (accumulated >= threshold) {
      return i + 1
    }
  }

  return contributors.length
}

// ─── parseGitLogByFile ──────────────────────────────────

/**
 * Parse `git log --format="COMMIT:%aN" --name-only` output into per-file contributor info.
 *
 * @example
 * ```ts
 * const byFile = parseGitLogByFile('COMMIT:Alice\nfile1.ts\nfile2.ts\nCOMMIT:Bob\nfile1.ts')
 * ```
 *
 * @param blameOutput - Raw output from git log with COMMIT markers and file names
 * @returns FileContributor array mapping files to their contributors
 */
export function parseGitLogByFile(blameOutput: string): FileContributor[] {
  if (!blameOutput.trim()) return []

  const fileContributors = new Map<string, Map<string, { commits: number; name: string }>>()

  let currentAuthor = ''

  for (const line of blameOutput.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('COMMIT:')) {
      currentAuthor = trimmed.slice(7)
      continue
    }

    if (!currentAuthor) continue

    const filePath = trimmed
    let fileMap = fileContributors.get(filePath)
    if (!fileMap) {
      fileMap = new Map()
      fileContributors.set(filePath, fileMap)
    }

    const existing = fileMap.get(currentAuthor)
    if (existing) {
      existing.commits++
    } else {
      fileMap.set(currentAuthor, { commits: 1, name: currentAuthor })
    }
  }

  const result: FileContributor[] = []
  for (const [filePath, contributorMap] of fileContributors) {
    const contributors: FileContributorEntry[] = []
    for (const entry of contributorMap.values()) {
      contributors.push({
        commits: entry.commits,
        linesChanged: 0,
        name: entry.name,
      })
    }
    contributors.sort((a, b) => b.commits - a.commits)
    result.push({ contributors, filePath })
  }

  result.sort((a, b) => b.contributors.length - a.contributors.length)

  return result
}

// ─── buildContributorsResult ────────────────────────────

/**
 * Compute the full ContributorsResult from raw contributor and file data.
 *
 * @example
 * ```ts
 * const result = buildContributorsResult(contributors, byFile)
 * ```
 *
 * @param contributors - Array of Contributor objects
 * @param byFile - Array of FileContributor objects
 * @returns Full ContributorsResult with totals and bus factor
 */
export function buildContributorsResult(contributors: Contributor[], byFile: FileContributor[]): ContributorsResult {
  const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0)
  const totalLinesAdded = contributors.reduce((sum, c) => sum + c.linesAdded, 0)
  const totalLinesDeleted = contributors.reduce((sum, c) => sum + c.linesDeleted, 0)
  const busFactor = calculateBusFactor(contributors)

  let first = ''
  let last = ''
  for (const c of contributors) {
    if (c.firstCommit && (first === '' || c.firstCommit < first)) {
      first = c.firstCommit
    }
    if (c.lastCommit && (last === '' || c.lastCommit > last)) {
      last = c.lastCommit
    }
  }

  return {
    busFactor,
    byFile,
    contributors,
    dateRange: { first, last },
    totalCommits,
    totalLinesAdded,
    totalLinesDeleted,
  }
}
