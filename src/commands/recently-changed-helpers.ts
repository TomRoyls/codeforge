import { execSync } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface ChangedFile {
  filePath: string
  relativePath: string
  modifiedDate: string
  author: string
  commit: string
  summary: string
  linesAdded: number
  linesDeleted: number
}

export interface RecentResult {
  files: ChangedFile[]
  totalScanned: number
  since: string
  branch: string
}

// ─── Time period parsing ─────────────────────────────────

/**
 * Parse a since-period string like "1d", "2w", "3m", "1y" into a Date object.
 *
 * @example
 * parseSincePeriod("1d")  // 1 day ago
 * parseSincePeriod("2w")  // 2 weeks ago
 * parseSincePeriod("3m")  // 3 months ago
 * parseSincePeriod("1y")  // 1 year ago
 */
export function parseSincePeriod(since: string): Date {
  const match = /^(\d+)([dwmy])$/.exec(since)
  if (!match) {
    // Default to 1 week for invalid format
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  }

  const amount = Number(match[1])
  const unit = match[2]
  const date = new Date()

  switch (unit) {
    case 'd': {
      date.setDate(date.getDate() - amount)
      break
    }
    case 'w': {
      date.setDate(date.getDate() - amount * 7)
      break
    }
    case 'm': {
      date.setMonth(date.getMonth() - amount)
      break
    }
    case 'y': {
      date.setFullYear(date.getFullYear() - amount)
      break
    }
  }

  return date
}

// ─── Git log output parsing ──────────────────────────────

/**
 * Parse the output of `git log --name-only --pretty=format:"%H|%an|%at|%s" --no-merges`
 * into an array of ChangedFile objects.
 *
 * @example
 * parseGitLogOutput("abc123|Alice|1700000000|Fix bug\nfile1.ts\nfile2.ts\n\ndef456|Bob|1699900000|Add feature\nfile3.ts\n")
 */
export function parseGitLogOutput(output: string): ChangedFile[] {
  if (!output || output.trim().length === 0) {
    return []
  }

  const files: ChangedFile[] = []
  const commits = output.trim().split('\n\n')

  for (const commitBlock of commits) {
    const lines = commitBlock.split('\n')
    if (lines.length === 0) continue

    const headerLine = lines[0]!
    const headerParts = headerLine.split('|')
    if (headerParts.length < 4) continue

    const commit = headerParts[0]!.trim()
    const author = (headerParts[1] ?? '').trim()
    const timestamp = headerParts[2]!.trim()
    const summary = headerParts.slice(3).join('|').trim()

    const modifiedDate = new Date(Number(timestamp) * 1000).toISOString()

    for (let i = 1; i < lines.length; i++) {
      const fileName = lines[i]!.trim()
      if (fileName.length === 0) continue

      files.push({
        filePath: fileName,
        relativePath: fileName,
        modifiedDate,
        author,
        commit: commit.slice(0, 8),
        summary,
        linesAdded: 0,
        linesDeleted: 0,
      })
    }
  }

  return files
}

// ─── Git-based file collection ───────────────────────────

/**
 * Get recently changed files using `git log`.
 *
 * @example
 * getRecentFilesFromGit(process.cwd(), new Date(), 10, undefined)
 */
export function getRecentFilesFromGit(
  cwd: string,
  since: Date,
  count: number,
  authorFilter?: string,
): ChangedFile[] {
  const sinceStr = since.toISOString().split('T')[0] ?? ''

  let cmd = `git log --since="${sinceStr}" --name-only --pretty=format:"%H|%an|%at|%s" --no-merges`
  if (authorFilter) {
    cmd += ` --author="${authorFilter}"`
  }

  try {
    const output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const allFiles = parseGitLogOutput(output)

    // Deduplicate: keep most recent change per file
    const seen = new Map<string, ChangedFile>()
    for (const file of allFiles) {
      const existing = seen.get(file.filePath)
      if (!existing || file.modifiedDate > existing.modifiedDate) {
        seen.set(file.filePath, file)
      }
    }

    // Sort by modifiedDate descending
    const deduped = Array.from(seen.values())
    deduped.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))

    // Get line change stats for each file using git log --numstat
    if (deduped.length > 0) {
      try {
        const numstatCmd = `git log --since="${sinceStr}" --no-merges --numstat --pretty=format:"%H" ${authorFilter ? `--author="${authorFilter}"` : ''}`
        const numstatOutput = execSync(numstatCmd, {
          cwd,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })
        const lineStats = parseNumstatOutput(numstatOutput, deduped)
        for (const file of deduped) {
          const stats = lineStats.get(file.filePath)
          if (stats) {
            file.linesAdded = stats.linesAdded
            file.linesDeleted = stats.linesDeleted
          }
        }
      } catch {
        // numstat is optional, continue without it
      }
    }

    return deduped.slice(0, count)
  } catch {
    return []
  }
}

// ─── Numstat parsing ─────────────────────────────────────

interface LineStats {
  linesAdded: number
  linesDeleted: number
}

function parseNumstatOutput(output: string, targetFiles: ChangedFile[]): Map<string, LineStats> {
  const stats = new Map<string, LineStats>()
  const targetPaths = new Set(Array.from(targetFiles.map((f) => f.filePath)))

  const lines = output.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // numstat lines look like: "10\t5\tpath/to/file.ts"
    const match = /^(\d+|-)\s+(\d+|-)\s+(.+)$/.exec(trimmed)
    if (match) {
      const added = match[1] === '-' ? 0 : Number(match[1])
      const deleted = match[2] === '-' ? 0 : Number(match[2])
      const filePath = match[3]!.trim()
      if (targetPaths.has(filePath)) {
        const existing = stats.get(filePath)
        if (existing) {
          existing.linesAdded += added
          existing.linesDeleted += deleted
        } else {
          stats.set(filePath, { linesAdded: added, linesDeleted: deleted })
        }
      }
    }
  }

  return stats
}

// ─── Filesystem-based file collection ────────────────────

/**
 * Get recently changed files using filesystem mtime.
 *
 * @example
 * getRecentFilesFromFS(process.cwd(), new Date(), 10)
 */
export async function getRecentFilesFromFS(
  cwd: string,
  since: Date,
  count: number,
): Promise<ChangedFile[]> {
  const files: ChangedFile[] = []
  const sinceTime = since.getTime()

  await walkDirectory(cwd, cwd, sinceTime, files)

  files.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))

  return files.slice(0, count)
}

async function walkDirectory(
  dir: string,
  rootDir: string,
  sinceTime: number,
  results: ChangedFile[],
): Promise<void> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    // Skip hidden directories and common ignored directories
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
      continue
    }

    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await walkDirectory(fullPath, rootDir, sinceTime, results)
    } else if (entry.isFile()) {
      try {
        const fileStat = await stat(fullPath)
        if (fileStat.mtimeMs >= sinceTime) {
          results.push({
            filePath: fullPath,
            relativePath: relative(rootDir, fullPath),
            modifiedDate: new Date(fileStat.mtimeMs).toISOString(),
            author: '',
            commit: '',
            summary: '',
            linesAdded: 0,
            linesDeleted: 0,
          })
        }
      } catch {
        // Skip files we can't stat
      }
    }
  }
}
