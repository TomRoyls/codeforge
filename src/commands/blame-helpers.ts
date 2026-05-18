import type { BlameLine } from '../utils/git-helpers.js'

// ─── Interfaces ──────────────────────────────────────────

export interface AuthorStats {
  lines: number
  percentage: number
}

export interface BlameResult {
  authors: Map<string, AuthorStats>
  branch: string
  file: string
  lines: BlameLine[]
  totalLines: number
}

// ─── Filtering ───────────────────────────────────────────

export function filterByAuthor(lines: BlameLine[], authorFilter: string): BlameLine[] {
  const lowerFilter = authorFilter.toLowerCase()
  return lines.filter((line) => line.author.toLowerCase().includes(lowerFilter))
}

export function filterByLineRange(lines: BlameLine[], range: string): BlameLine[] {
  const parts = range.split('-')
  if (parts.length !== 2) {
    return lines
  }

  const start = Number(parts[0])
  const end = Number(parts[1])

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) {
    return lines
  }

  return lines.filter((line) => line.line >= start && line.line <= end)
}

// ─── Aggregation ─────────────────────────────────────────

export function aggregateAuthors(lines: BlameLine[]): Map<string, AuthorStats> {
  const authorMap = new Map<string, number>()
  const total = lines.length

  for (const line of lines) {
    const count = authorMap.get(line.author) ?? 0
    authorMap.set(line.author, count + 1)
  }

  const result = new Map<string, AuthorStats>()
  authorMap.forEach((count, author) => {
    const percentage = total > 0 ? (count / total) * 100 : 0
    result.set(author, { lines: count, percentage })
  })

  return result
}

// ─── Sorting ─────────────────────────────────────────────

export function sortBlameLines(
  lines: BlameLine[],
  sortBy: 'author' | 'date' | 'line',
): BlameLine[] {
  const sorted = lines.slice()
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'author': {
        return a.author.localeCompare(b.author) || a.line - b.line
      }
      case 'date': {
        return a.date.localeCompare(b.date) || a.line - b.line
      }
      default: {
        return a.line - b.line
      }
    }
  })
  return sorted
}
