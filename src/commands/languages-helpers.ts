// ─── Interfaces ──────────────────────────────────────────

export interface LanguageInfo {
  name: string
  extensions: string[]
  files: number
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  percentage: number
  avgFileSize: number
  largestFile: string
  color: string
}

export interface LanguageStats {
  totalFiles: number
  totalLines: number
  totalCodeLines: number
  primaryLanguage: string
  languages: LanguageInfo[]
  polyglot: boolean
}

export interface ToolingSuggestion {
  language: string
  tools: string[]
  reason: string
}

export interface LanguagesResult {
  stats: LanguageStats
  tooling: ToolingSuggestion[]
}

export interface LanguagesOptions {
  ignorePatterns: string[]
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── Language map ───────────────────────────────────────

interface LangEntry {
  name: string
  color: string
  extensions: string[]
  commentStyle: 'c-style' | 'hash' | 'html' | 'sql' | 'none'
}

const LANGUAGE_MAP: LangEntry[] = [
  { color: 'blue', commentStyle: 'c-style', extensions: ['.ts', '.tsx'], name: 'TypeScript' },
  { color: 'yellow', commentStyle: 'c-style', extensions: ['.js', '.jsx'], name: 'JavaScript' },
  { color: 'blue', commentStyle: 'c-style', extensions: ['.css'], name: 'CSS' },
  { color: 'pink', commentStyle: 'c-style', extensions: ['.scss', '.sass'], name: 'SCSS' },
  { color: 'orange', commentStyle: 'html', extensions: ['.html', '.htm'], name: 'HTML' },
  { color: 'green', commentStyle: 'none', extensions: ['.json'], name: 'JSON' },
  { color: 'white', commentStyle: 'none', extensions: ['.md'], name: 'Markdown' },
  { color: 'green', commentStyle: 'hash', extensions: ['.py'], name: 'Python' },
  { color: 'red', commentStyle: 'hash', extensions: ['.rb'], name: 'Ruby' },
  { color: 'cyan', commentStyle: 'c-style', extensions: ['.go'], name: 'Go' },
  { color: 'orange', commentStyle: 'c-style', extensions: ['.rs'], name: 'Rust' },
  { color: 'red', commentStyle: 'c-style', extensions: ['.java'], name: 'Java' },
  { color: 'blue', commentStyle: 'c-style', extensions: ['.c', '.h'], name: 'C' },
  { color: 'blue', commentStyle: 'c-style', extensions: ['.cpp', '.hpp'], name: 'C++' },
  { color: 'purple', commentStyle: 'c-style', extensions: ['.cs'], name: 'C#' },
  { color: 'magenta', commentStyle: 'c-style', extensions: ['.php'], name: 'PHP' },
  { color: 'orange', commentStyle: 'c-style', extensions: ['.swift'], name: 'Swift' },
  { color: 'purple', commentStyle: 'c-style', extensions: ['.kt'], name: 'Kotlin' },
  { color: 'orange', commentStyle: 'c-style', extensions: ['.zig'], name: 'Zig' },
  { color: 'green', commentStyle: 'hash', extensions: ['.sh', '.bash'], name: 'Shell' },
  { color: 'cyan', commentStyle: 'sql', extensions: ['.sql'], name: 'SQL' },
  { color: 'yellow', commentStyle: 'hash', extensions: ['.yaml', '.yml'], name: 'YAML' },
  { color: 'blue', commentStyle: 'hash', extensions: ['.toml'], name: 'TOML' },
  { color: 'orange', commentStyle: 'html', extensions: ['.xml'], name: 'XML' },
  { color: 'green', commentStyle: 'html', extensions: ['.vue'], name: 'Vue' },
  { color: 'red', commentStyle: 'html', extensions: ['.svelte'], name: 'Svelte' },
  { color: 'magenta', commentStyle: 'hash', extensions: ['.graphql', '.gql'], name: 'GraphQL' },
  { color: 'blue', commentStyle: 'hash', extensions: ['.dockerfile'], name: 'Docker' },
  { color: 'blue', commentStyle: 'c-style', extensions: ['.proto'], name: 'Protobuf' },
]

/**
 * Return the full extension → language entry mapping.
 *
 * @example
 * ```ts
 * const map = getLanguageMap()
 * map[0]?.name // 'TypeScript'
 * ```
 */
export function getLanguageMap(): LangEntry[] {
  return LANGUAGE_MAP
}

/**
 * Detect the language name from a file path extension.
 *
 * @example
 * ```ts
 * detectLanguage('app.ts') // 'TypeScript'
 * detectLanguage('unknown.xyz') // 'Unknown'
 * ```
 */
export function detectLanguage(filePath: string): string {
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return 'Unknown'
  const ext = filePath.slice(dotIndex).toLowerCase()
  for (const entry of LANGUAGE_MAP) {
    if (entry.extensions.includes(ext)) return entry.name
  }
  return 'Unknown'
}

function getLanguageEntry(filePath: string): LangEntry | undefined {
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return undefined
  const ext = filePath.slice(dotIndex).toLowerCase()
  for (const entry of LANGUAGE_MAP) {
    if (entry.extensions.includes(ext)) return entry
  }
  return undefined
}

// ─── Line counting ──────────────────────────────────────

export interface LineCounts {
  code: number
  comment: number
  blank: number
}

/**
 * Count code, comment, and blank lines with language-aware comment detection.
 *
 * @example
 * ```ts
 * const counts = countLines('// hello\nconst x = 1\n\n', 'c-style')
 * counts.code // 1
 * counts.comment // 1
 * ```
 */
export function countLines(content: string, commentStyle: LangEntry['commentStyle']): LineCounts {
  let code = 0
  let comment = 0
  let blank = 0

  let inBlock = false
  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      if (inBlock) comment++
      else blank++
      continue
    }

    if (inBlock) {
      const endDelim = commentStyle === 'html' ? '-->' : '*/'
      if (trimmed.includes(endDelim)) {
        inBlock = false
        comment++
      } else {
        comment++
      }
      continue
    }

    switch (commentStyle) {
      case 'c-style': {
        if (trimmed.startsWith('//')) {
          comment++
        } else if (trimmed.startsWith('/*')) {
          if (!trimmed.includes('*/') || trimmed.endsWith('*/')) {
            if (!trimmed.endsWith('*/')) inBlock = true
            comment++
          } else {
            comment++
          }
        } else {
          code++
        }
        break
      }
      case 'hash': {
        if (trimmed.startsWith('#')) comment++
        else code++
        break
      }
      case 'html': {
        if (trimmed.startsWith('<!--')) {
          if (!trimmed.includes('-->')) inBlock = true
          comment++
        } else {
          code++
        }
        break
      }
      case 'sql': {
        if (trimmed.startsWith('--')) comment++
        else code++
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

// ─── Language analysis ──────────────────────────────────

interface FileAnalysis {
  filePath: string
  language: string
  entry: LangEntry | undefined
  lines: LineCounts
  totalLines: number
}

/**
 * Aggregate per-file analysis into per-language LanguageInfo array.
 *
 * @example
 * ```ts
 * const langs = analyzeLanguage(analyses)
 * langs[0]?.name // 'TypeScript'
 * ```
 */
export function analyzeLanguage(fileAnalyses: FileAnalysis[]): LanguageInfo[] {
  const langMap = new Map<string, {
    info: LanguageInfo
    entry: LangEntry | undefined
    largestLines: number
  }>()

  for (const fa of fileAnalyses) {
    const existing = langMap.get(fa.language)
    if (existing) {
      existing.info.files++
      existing.info.totalLines += fa.totalLines
      existing.info.codeLines += fa.lines.code
      existing.info.commentLines += fa.lines.comment
      existing.info.blankLines += fa.lines.blank
      if (fa.totalLines > existing.largestLines) {
        existing.largestLines = fa.totalLines
        existing.info.largestFile = fa.filePath
      }
      if (fa.entry && !existing.info.extensions.includes(fa.entry.extensions[0] ?? '')) {
        for (const ext of fa.entry.extensions) {
          if (!existing.info.extensions.includes(ext)) existing.info.extensions.push(ext)
        }
      }
    } else {
      langMap.set(fa.language, {
        entry: fa.entry,
        info: {
          avgFileSize: 0,
          blankLines: fa.lines.blank,
          codeLines: fa.lines.code,
          color: fa.entry?.color ?? 'white',
          commentLines: fa.lines.comment,
          extensions: fa.entry ? [...fa.entry.extensions] : [],
          files: 1,
          largestFile: fa.filePath,
          name: fa.language,
          percentage: 0,
          totalLines: fa.totalLines,
        },
        largestLines: fa.totalLines,
      })
    }
  }

  const totalCode = Array.from(langMap.values()).reduce((sum, l) => sum + l.info.codeLines, 0)
  for (const [, data] of langMap) {
    data.info.percentage = totalCode > 0 ? Math.round((data.info.codeLines / totalCode) * 100) : 0
    data.info.avgFileSize = data.info.files > 0 ? Math.round(data.info.totalLines / data.info.files) : 0
  }

  const result = Array.from(langMap.values()).map((d) => d.info)
  result.sort((a, b) => b.codeLines - a.codeLines)
  return result
}

// ─── Compute stats ──────────────────────────────────────

/**
 * Compute aggregate language stats including primary language and polyglot detection.
 *
 * @example
 * ```ts
 * const stats = computeLanguageStats(languages)
 * stats.primaryLanguage // 'TypeScript'
 * ```
 */
export function computeLanguageStats(languages: LanguageInfo[]): LanguageStats {
  const totalFiles = languages.reduce((s, l) => s + l.files, 0)
  const totalLines = languages.reduce((s, l) => s + l.totalLines, 0)
  const totalCodeLines = languages.reduce((s, l) => s + l.codeLines, 0)

  const primaryLanguage = languages.length > 0 ? languages[0]?.name ?? 'None' : 'None'
  const significant = languages.filter((l) => l.percentage >= 1)
  const polyglot = significant.length > 3

  return { languages, polyglot, primaryLanguage, totalCodeLines, totalFiles, totalLines }
}

// ─── Tooling suggestions ───────────────────────────────

const TOOLING_MAP: Record<string, { reason: string; tools: string[] }> = {
  'C': { reason: 'C projects benefit from formatters and static analysis', tools: ['clang-format', 'cppcheck'] },
  'C#': { reason: 'C# projects benefit from IDE-integrated linting', tools: ['dotnet format', 'StyleCop'] },
  'C++': { reason: 'C++ projects benefit from formatters and sanitizers', tools: ['clang-format', 'clang-tidy'] },
  'CSS': { reason: 'CSS benefits from auto-formatting and linting', tools: ['prettier', 'stylelint'] },
  'Go': { reason: 'Go has built-in tooling', tools: ['gofmt', 'golangci-lint', 'go vet'] },
  'Java': { reason: 'Java benefits from linting and formatting', tools: ['google-java-format', 'checkstyle'] },
  'JavaScript': { reason: 'JavaScript benefits from linting and formatting', tools: ['eslint', 'prettier'] },
  'Kotlin': { reason: 'Kotlin has built-in IDE tooling', tools: ['ktlint', 'detekt'] },
  'PHP': { reason: 'PHP projects benefit from static analysis', tools: ['phpstan', 'php-cs-fixer'] },
  'Python': { reason: 'Python benefits from linting and formatting', tools: ['ruff', 'mypy', 'black'] },
  'Ruby': { reason: 'Ruby projects benefit from linting', tools: ['rubocop', 'standardrb'] },
  'Rust': { reason: 'Rust has excellent built-in tooling', tools: ['cargo clippy', 'rustfmt'] },
  'SCSS': { reason: 'SCSS benefits from linting', tools: ['stylelint', 'prettier'] },
  'SQL': { reason: 'SQL benefits from formatting', tools: ['sqlfluff', 'pg_format'] },
  'Swift': { reason: 'Swift has built-in formatting tools', tools: ['swift-format', 'swiftlint'] },
  'TypeScript': { reason: 'TypeScript benefits from strict type checking and linting', tools: ['tsc --strict', 'eslint', 'prettier'] },
  'Zig': { reason: 'Zig has built-in formatting', tools: ['zig fmt'] },
}

/**
 * Suggest tooling based on detected languages.
 *
 * @example
 * ```ts
 * const tools = suggestTooling(languages)
 * tools[0]?.tools // ['tsc --strict', 'eslint', 'prettier']
 * ```
 */
export function suggestTooling(languages: LanguageInfo[]): ToolingSuggestion[] {
  const suggestions: ToolingSuggestion[] = []
  for (const lang of languages) {
    const tooling = TOOLING_MAP[lang.name]
    if (tooling) {
      suggestions.push({ language: lang.name, reason: tooling.reason, tools: tooling.tools })
    }
  }
  return suggestions
}

// ─── Build result ───────────────────────────────────────

/**
 * Orchestrate full language breakdown analysis.
 *
 * @example
 * ```ts
 * const result = await buildLanguagesResult(files, reader, { ignorePatterns: [] })
 * result.stats.primaryLanguage // 'TypeScript'
 * ```
 */
export async function buildLanguagesResult(
  filePaths: string[],
  contentReader: ContentReader,
  _options: LanguagesOptions,
): Promise<LanguagesResult> {
  const analyses: FileAnalysis[] = []

  for (const filePath of filePaths) {
    try {
      const content = await contentReader(filePath)
      const entry = getLanguageEntry(filePath)
      const language = entry?.name ?? detectLanguage(filePath)
      const style = entry?.commentStyle ?? 'none'
      const lines = countLines(content, style)
      const totalLines = content.split('\n').length

      analyses.push({ entry, filePath, language, lines, totalLines })
    } catch {
      // skip unreadable files
    }
  }

  const languages = analyzeLanguage(analyses)
  const stats = computeLanguageStats(languages)
  const tooling = suggestTooling(languages)

  return { stats, tooling }
}
