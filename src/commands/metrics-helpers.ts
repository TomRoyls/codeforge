import * as fs from 'node:fs/promises'
import { extname } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface LanguageMetric {
  language: string
  files: number
  codeLines: number
  percentage: number
}

export interface SizeMetric {
  totalBytes: number
  averageBytes: number
  largestFile: string
  largestSize: number
}

export interface ComplexityMetric {
  averageComplexity: number
  maxComplexity: number
  maxComplexityFile: string
  totalKeywords: number
}

export interface TodoMetric {
  todos: number
  fixmes: number
  hacks: number
  total: number
}

export interface ExtensionMetric {
  extension: string
  count: number
}

export interface CodebaseMetrics {
  files: number
  totalLines: number
  codeLines: number
  blankLines: number
  commentLines: number
  languages: LanguageMetric[]
  size: SizeMetric
  complexity: ComplexityMetric
  todos: TodoMetric
  extensions: ExtensionMetric[]
}

export interface DerivedMetrics {
  commentRatio: number
  avgFileSize: number
  avgLinesPerFile: number
  complexityRating: 'low' | 'medium' | 'high'
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

// ─── Complexity counting ────────────────────────────────

const COMPLEXITY_PATTERN = /\b(if|else|for|while|switch|catch)\b|\?|&&|\|\|/g

export function countComplexity(content: string): number {
  const matches = content.match(COMPLEXITY_PATTERN)
  return matches ? matches.length : 0
}

// ─── TODO detection ─────────────────────────────────────

const TODO_PATTERN = /\bTODO\b/gi
const FIXME_PATTERN = /\bFIXME\b/gi
const HACK_PATTERN = /\bHACK\b/gi

export interface TodoCounts {
  todos: number
  fixmes: number
  hacks: number
  total: number
}

export function countTodos(content: string): TodoCounts {
  const todos = (content.match(TODO_PATTERN) ?? []).length
  const fixmes = (content.match(FIXME_PATTERN) ?? []).length
  const hacks = (content.match(HACK_PATTERN) ?? []).length
  return { fixmes, hacks, todos, total: todos + fixmes + hacks }
}

// ─── Line classification ────────────────────────────────

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

export function classifyLines(content: string, language: string): { code: number; blank: number; comment: number } {
  if (content.length === 0) {
    return { blank: 0, code: 0, comment: 0 }
  }

  const style = getCommentStyle(language)
  const lines = content.split('\n')
  let code = 0
  let blank = 0
  let comment = 0
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      if (inBlockComment) {
        comment++
      } else {
        blank++
      }
      continue
    }

    if (inBlockComment) {
      const endDelimiter = style === 'html' ? '-->' : '*/'
      const endIdx = trimmed.indexOf(endDelimiter)
      if (endIdx !== -1) {
        inBlockComment = false
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

    switch (style) {
      case 'c-style': {
        const blockStart = trimmed.indexOf('/*')
        const lineComment = trimmed.indexOf('//')

        if (lineComment === 0 && (blockStart === -1 || lineComment < blockStart)) {
          comment++
          continue
        }

        if (blockStart !== -1) {
          const beforeBlock = trimmed.slice(0, blockStart).trim()
          if (beforeBlock.length === 0) {
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
            code++
          }
        } else if (lineComment > 0) {
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

// ─── Metric collection ──────────────────────────────────

interface PerFileData {
  path: string
  language: string
  extension: string
  content: string
  bytes: number
}

async function readFileData(
  files: Array<{ absolutePath: string; path: string }>,
): Promise<PerFileData[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const language = detectLanguage(file.path)
        const extension = extname(file.path).toLowerCase()
        const bytes = Buffer.byteLength(content, 'utf8')
        return { bytes, content, extension, language, path: file.path }
      } catch {
        return {
          bytes: 0,
          content: '',
          extension: extname(file.path).toLowerCase(),
          language: 'Unknown',
          path: file.path,
        }
      }
    }),
  )
  return results
}

export async function collectMetrics(
  files: Array<{ absolutePath: string; path: string }>,
  _verbose = false,
): Promise<CodebaseMetrics> {
  const fileData = await readFileData(files)

  let totalLines = 0
  let codeLines = 0
  let blankLines = 0
  let commentLines = 0
  let totalBytes = 0
  let largestFile = ''
  let largestSize = 0
  let totalComplexity = 0
  let maxComplexity = 0
  let maxComplexityFile = ''
  let totalKeywords = 0
  let todos = 0
  let fixmes = 0
  let hacks = 0

  const languageMap = new Map<string, { codeLines: number; files: number }>()
  const extensionMap = new Map<string, number>()

  for (const fd of fileData) {
    const { code, blank, comment } = classifyLines(fd.content, fd.language)
    totalLines += code + blank + comment
    codeLines += code
    blankLines += blank
    commentLines += comment

    // Size tracking
    totalBytes += fd.bytes
    if (fd.bytes > largestSize) {
      largestSize = fd.bytes
      largestFile = fd.path
    }

    // Complexity tracking
    const complexity = countComplexity(fd.content)
    totalComplexity += complexity
    totalKeywords += complexity
    if (complexity > maxComplexity) {
      maxComplexity = complexity
      maxComplexityFile = fd.path
    }

    // TODO tracking
    const todoCounts = countTodos(fd.content)
    todos += todoCounts.todos
    fixmes += todoCounts.fixmes
    hacks += todoCounts.hacks

    // Language tracking
    const langEntry = languageMap.get(fd.language)
    if (langEntry) {
      langEntry.files++
      langEntry.codeLines += code
    } else {
      languageMap.set(fd.language, { codeLines: code, files: 1 })
    }

    // Extension tracking
    const ext = fd.extension || '(none)'
    extensionMap.set(ext, (extensionMap.get(ext) ?? 0) + 1)
  }

  // Compute language percentages
  const totalCodeFiles = languageMap.size > 0
    ? Array.from(languageMap.values()).reduce((sum, l) => sum + l.files, 0)
    : 0

  const languages: LanguageMetric[] = Array.from(languageMap.entries())
    .map(([language, data]) => ({
      codeLines: data.codeLines,
      files: data.files,
      language,
      percentage: totalCodeFiles > 0 ? (data.files / totalCodeFiles) * 100 : 0,
    }))
    .sort((a, b) => b.files - a.files)

  const extensions: ExtensionMetric[] = Array.from(extensionMap.entries())
    .map(([extension, count]) => ({ count, extension }))
    .sort((a, b) => b.count - a.count)

  const fileCount = fileData.length
  const averageComplexity = fileCount > 0 ? totalComplexity / fileCount : 0

  return {
    blankLines,
    codeLines,
    commentLines,
    complexity: {
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      maxComplexity,
      maxComplexityFile,
      totalKeywords,
    },
    extensions,
    files: fileCount,
    languages,
    size: {
      averageBytes: fileCount > 0 ? Math.round(totalBytes / fileCount) : 0,
      largestFile,
      largestSize,
      totalBytes,
    },
    todos: { fixmes, hacks, todos, total: todos + fixmes + hacks },
    totalLines,
  }
}

// ─── Derived metrics ────────────────────────────────────

export function computeAverages(metrics: CodebaseMetrics): DerivedMetrics {
  const commentRatio = metrics.totalLines > 0
    ? metrics.commentLines / metrics.totalLines
    : 0

  const avgFileSize = metrics.files > 0
    ? metrics.size.totalBytes / metrics.files
    : 0

  const avgLinesPerFile = metrics.files > 0
    ? metrics.totalLines / metrics.files
    : 0

  let complexityRating: 'low' | 'medium' | 'high'
  if (metrics.complexity.averageComplexity < 10) {
    complexityRating = 'low'
  } else if (metrics.complexity.averageComplexity < 25) {
    complexityRating = 'medium'
  } else {
    complexityRating = 'high'
  }

  return {
    avgFileSize: Math.round(avgFileSize),
    avgLinesPerFile: Math.round(avgLinesPerFile * 100) / 100,
    commentRatio: Math.round(commentRatio * 1000) / 1000,
    complexityRating,
  }
}
