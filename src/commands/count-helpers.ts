// ─── Interfaces ──────────────────────────────────────────

export interface LanguageStats {
  language: string
  files: number
  code: number
  comment: number
  blank: number
  total: number
}

export interface PerFileStats {
  filePath: string
  language: string
  code: number
  comment: number
  blank: number
}

export interface CountTotals {
  files: number
  code: number
  comment: number
  blank: number
  total: number
}

export interface CountResult {
  languages: LanguageStats[]
  totals: CountTotals
  fileBreakdown?: PerFileStats[]
}

// ─── Language detection ─────────────────────────────────

const EXTENSION_MAP: Record<string, string> = {
  '.css': 'CSS',
  '.go': 'Go',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.jsx': 'JavaScript',
  '.md': 'Markdown',
  '.py': 'Python',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.sh': 'Shell',
  '.sql': 'SQL',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
}

export function detectLanguage(filePath: string): string {
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return 'Unknown'
  const ext = filePath.slice(dotIndex).toLowerCase()
  return EXTENSION_MAP[ext] ?? 'Unknown'
}

// ─── Line counting ──────────────────────────────────────

type CommentStyle = 'c-style' | 'hash' | 'html' | 'sql' | 'none'

function getCommentStyle(language: string): CommentStyle {
  switch (language) {
    case 'CSS':
    case 'Go':
    case 'Java':
    case 'JavaScript':
    case 'Rust':
    case 'TypeScript':
      return 'c-style'
    case 'Python':
    case 'Ruby':
    case 'Shell':
    case 'YAML':
      return 'hash'
    case 'HTML':
    case 'XML':
      return 'html'
    case 'SQL':
      return 'sql'
    case 'JSON':
    case 'Markdown':
      return 'none'
    default:
      return 'none'
  }
}






export interface LineCounts {
  code: number
  comment: number
  blank: number
}

export function countLineTypes(content: string, language: string): LineCounts {

  const style = getCommentStyle(language)

  if (content.length === 0) {
    return { blank: 0, code: 0, comment: 0 }
  }

  const lines = content.split('\n')
  let code = 0
  let comment = 0
  let blank = 0

  // Track multi-line block comment state
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Blank line
    if (trimmed.length === 0) {
      if (inBlockComment) {
        // Blank lines inside block comments count as comment
        comment++
      } else {
        blank++
      }
      continue
    }

    // Inside a multi-line block comment
    if (inBlockComment) {
      const endDelimiter = style === 'html' ? '-->' : '*/'
      const endIdx = trimmed.indexOf(endDelimiter)
      if (endIdx !== -1) {
        inBlockComment = false
        // Check if there's code after the closing delimiter
        const after = trimmed.slice(endIdx + endDelimiter.length).trim()
        if (after.length > 0) {
          code++
        } else {
          comment++
        }
      } else {
        comment++
      }
      continue
    }

    // Not in a block comment — check line type based on style
    switch (style) {
      case 'c-style': {
        // Check for block comment start
        const blockStart = trimmed.indexOf('/*')
        const lineComment = trimmed.indexOf('//')

        // Line comment first
        if (lineComment === 0 && (blockStart === -1 || lineComment < blockStart)) {
          comment++
          continue
        }

        if (blockStart !== -1) {
          // Check if line starts with block comment
          const beforeBlock = trimmed.slice(0, blockStart).trim()
          if (beforeBlock.length === 0) {
            // Check if block ends on same line
            const blockEnd = trimmed.indexOf('*/', blockStart + 2)
            if (blockEnd !== -1) {
              const afterBlock = trimmed.slice(blockEnd + 2).trim()
              if (afterBlock.length > 0) {
                code++
              } else {
                comment++
              }
            } else {
              inBlockComment = true
              comment++
            }
          } else {
            // Code before block comment
            code++
          }
        } else if (lineComment > 0) {
          // Code before line comment — count as code
          code++
        } else {
          code++
        }
        break
      }

      case 'hash': {
        if (trimmed.startsWith('#')) {
          comment++
        } else {
          code++
        }
        break
      }

      case 'html': {
        const htmlStart = trimmed.indexOf('<!--')
        if (htmlStart === 0) {
          const htmlEnd = trimmed.indexOf('-->')
          if (htmlEnd !== -1) {
            const afterEnd = trimmed.slice(htmlEnd + 3).trim()
            if (afterEnd.length > 0) {
              code++
            } else {
              comment++
            }
          } else {
            inBlockComment = true
            comment++
          }
        } else if (htmlStart > 0) {
          code++
        } else {
          code++
        }
        break
      }

      case 'sql': {
        if (trimmed.startsWith('--')) {
          comment++
        } else {
          code++
        }
        break
      }

      case 'none':
      default:
        code++
        break
    }
  }

  return { blank, code, comment }
}

// ─── Aggregation ────────────────────────────────────────

export function aggregateByLanguage(fileStats: PerFileStats[]): LanguageStats[] {
  const map = new Map<string, LanguageStats>()

  for (const stat of fileStats) {
    const existing = map.get(stat.language)
    if (existing) {
      existing.files++
      existing.code += stat.code
      existing.comment += stat.comment
      existing.blank += stat.blank
      existing.total += stat.code + stat.comment + stat.blank
    } else {
      map.set(stat.language, {
        blank: stat.blank,
        code: stat.code,
        comment: stat.comment,
        files: 1,
        language: stat.language,
        total: stat.code + stat.comment + stat.blank,
      })
    }
  }

  return Array.from(map.values())
}

// ─── Sorting ────────────────────────────────────────────

export type SortByMetric = 'blank' | 'code' | 'comment' | 'files' | 'language'

export function sortLanguages(languages: LanguageStats[], sortBy: SortByMetric): LanguageStats[] {
  const sorted = [...languages]
  sorted.sort((a, b) => {
    if (sortBy === 'language') {
      return a.language.localeCompare(b.language)
    }
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (bVal !== aVal) return bVal - aVal
    return a.language.localeCompare(b.language)
  })
  return sorted
}

// ─── Totals ─────────────────────────────────────────────

export function calculateTotals(languages: LanguageStats[]): CountTotals {
  let files = 0
  let code = 0
  let comment = 0
  let blank = 0

  for (const lang of languages) {
    files += lang.files
    code += lang.code
    comment += lang.comment
    blank += lang.blank
  }

  return {
    blank,
    code,
    comment,
    files,
    total: code + comment + blank,
  }
}
