import { execSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

export interface CommitInfo {
  hash: string
  shortHash: string
  author: string
  date: string
  subject: string
  type: string
  scope?: string
  breaking: boolean
}

export interface ChangelogGroup {
  type: string
  title: string
  commits: CommitInfo[]
}

export interface ChangelogResult {
  groups: ChangelogGroup[]
  totalCommits: number
  from?: string
  to: string
  generatedAt: string
}

export interface ParsedCommit {
  type: string
  scope?: string
  breaking: boolean
  subject: string
}

// ─── Commit parsing ──────────────────────────────────────

/**
 * Parse a conventional commit subject line.
 *
 * @example
 * parseConventionalCommit("feat: add X")
 * // => { type: 'feat', subject: 'add X' }
 *
 * @example
 * parseConventionalCommit("feat(auth): add login")
 * // => { type: 'feat', scope: 'auth', subject: 'add login' }
 *
 * @example
 * parseConventionalCommit("fix!: breaking change")
 * // => { type: 'fix', breaking: true, subject: 'breaking change' }
 */
export function parseConventionalCommit(message: string): ParsedCommit {
  const match = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.*)$/.exec(message)

  if (!match) {
    return { breaking: false, subject: message, type: 'other' }
  }

  const type = match[1] ?? 'other'
  const scope = match[2] || undefined
  const bang = match[3] === '!'
  const subject = match[4] ?? ''

  return { breaking: bang, scope, subject, type }
}

// ─── Git log ─────────────────────────────────────────────

/**
 * Retrieve git log entries parsed into CommitInfo objects.
 *
 * @example
 * const commits = getGitLog(process.cwd(), 10)
 * const ranged = getGitLog(process.cwd(), 50, 'v1.0.0', 'HEAD')
 */
export function getGitLog(
  cwd: string,
  count: number,
  from?: string,
  to?: string,
): CommitInfo[] {
  const range = from && to ? `${from}..${to}` : from ? `${from}..HEAD` : ''
  const rangeArg = range ? ` ${range}` : ''

  const cmd = `git log --pretty=format:"%H|%h|%an|%at|%s" --no-merges -n ${count}${rangeArg}`

  let output: string
  try {
    output = execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch {
    return []
  }

  if (!output.trim()) {
    return []
  }

  const lines = output.trim().split('\n')
  const commits: CommitInfo[] = []

  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length < 5) continue

    const hash = parts[0] ?? ''
    const shortHash = parts[1] ?? ''
    const author = parts[2] ?? ''
    const timestamp = parts[3] ?? ''
    const subject = parts.slice(4).join('|')

    const parsed = parseConventionalCommit(subject)
    const dateNum = Number(timestamp)
    const dateStr = Number.isFinite(dateNum)
      ? new Date(dateNum * 1000).toISOString().split('T')[0] ?? ''
      : ''

    commits.push({
      author,
      breaking: parsed.breaking,
      date: dateStr,
      hash,
      scope: parsed.scope,
      shortHash,
      subject: parsed.subject,
      type: parsed.type,
    })
  }

  return commits
}

// ─── Categorization ──────────────────────────────────────

const TYPE_ORDER = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore', 'other'] as const

const TYPE_TITLES: Record<string, string> = {
  chore: 'Chores',
  docs: 'Documentation',
  feat: 'Features',
  fix: 'Bug Fixes',
  other: 'Other Changes',
  perf: 'Performance',
  refactor: 'Refactoring',
  test: 'Tests',
}

/**
 * Group commits by their conventional commit type, preserving type order.
 *
 * @example
 * const groups = categorizeCommits(commits)
 * // groups[0] => { type: 'feat', title: 'Features', commits: [...] }
 */
export function categorizeCommits(commits: CommitInfo[]): ChangelogGroup[] {
  const bucket = new Map<string, CommitInfo[]>()

  for (const commit of commits) {
    const existing = bucket.get(commit.type)
    if (existing) {
      existing.push(commit)
    } else {
      bucket.set(commit.type, [commit])
    }
  }

  const groups: ChangelogGroup[] = []

  for (const type of TYPE_ORDER) {
    const commitsForType = bucket.get(type)
    if (commitsForType) {
      groups.push({
        commits: commitsForType,
        title: TYPE_TITLES[type] ?? type,
        type,
      })
    }
  }

  // Handle any types not in TYPE_ORDER
  const knownSet = new Set<string>(TYPE_ORDER)
  const sortedKeys = Array.from(bucket.keys()).sort()
  for (const key of sortedKeys) {
    if (!knownSet.has(key)) {
      groups.push({
        commits: bucket.get(key) ?? [],
        title: TYPE_TITLES[key] ?? key,
        type: key,
      })
    }
  }

  return groups
}

// ─── Tags ────────────────────────────────────────────────

/**
 * Retrieve git tags sorted by version descending.
 *
 * @example
 * const tags = getTags(process.cwd())
 * // => ['v2.0.0', 'v1.1.0', 'v1.0.0']
 */
export function getTags(cwd: string): string[] {
  try {
    const output = execSync('git tag --sort=-version:refname', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    if (!output.trim()) {
      return []
    }

    return output.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}
