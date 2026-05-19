import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { discoverFiles } from '../core/file-discovery.js'

const execFileAsync = promisify(execFile)

// ─── Interfaces ──────────────────────────────────────────

export interface ProjectInfo {
  name: string
  description: string
  version: string
  license: string
  repository: string
  language: string
  framework: string
}

export interface CodeOverview {
  totalFiles: number
  totalLines: number
  codeLines: number
  sourceFiles: number
  testFiles: number
  configFiles: number
  languages: { name: string; files: number; percentage: number }[]
}

export interface HealthScore {
  overall: number
  documentation: number
  testing: number
  complexity: number
  maintainability: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface GitOverview {
  branch: string
  totalCommits: number
  totalContributors: number
  lastCommitDate: string
  totalBranches: number
  totalTags: number
  isDirty: boolean
}

export interface QuickIssues {
  todos: number
  deadCode: number
  unusedExports: number
  complexityHotspots: number
  missingDocs: number
}

export interface SummaryResult {
  project: ProjectInfo
  code: CodeOverview
  health: HealthScore
  git: GitOverview | null
  issues: QuickIssues
  topFiles: { path: string; lines: number }[]
  recentChanges: { file: string; date: string }[]
}

export interface BuildSummaryOptions {
  noGit?: boolean
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

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java', '.rb', '.sh'])
const TEST_PATTERNS = ['.test.', '.spec.', '_test.', '_test', '.test', '.spec', '/test/', '/tests/', '/__tests__/']
const CONFIG_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.xml', '.toml', '.env', '.ini', '.cfg'])

// ─── Framework detection ────────────────────────────────

const FRAMEWORK_PATTERNS: Record<string, string> = {
  '@oclif/core': 'oclif',
  next: 'Next.js',
  express: 'Express',
  fastify: 'Fastify',
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
  '@angular/core': 'Angular',
  nestjs: 'NestJS',
  '@nestjs/core': 'NestJS',
  koa: 'Koa',
  hapi: 'Hapi',
  '@hapi/hapi': 'Hapi',
  meteor: 'Meteor',
  nuxt: 'Nuxt',
  '@remix-run/react': 'Remix',
  astro: 'Astro',
}

/**
 * Detect project info from package.json and file extensions.
 *
 * @example
 * ```ts
 * const info = await detectProjectInfo('/path/to/project')
 * // { name: 'my-app', framework: 'Next.js', language: 'TypeScript', ... }
 * ```
 */
export async function detectProjectInfo(cwd: string): Promise<ProjectInfo> {
  let name = basename(resolve(cwd))
  let description = ''
  let version = ''
  let license = ''
  let repository = ''

  const pkgPath = resolve(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const raw = await fs.readFile(pkgPath, 'utf8')
      const pkg = JSON.parse(raw) as Record<string, unknown>
      name = (pkg.name as string) ?? name
      description = (pkg.description as string) ?? ''
      version = (pkg.version as string) ?? ''
      license = (pkg.license as string) ?? ''

      if (typeof pkg.repository === 'string') {
        repository = pkg.repository
      } else if (typeof pkg.repository === 'object' && pkg.repository !== null) {
        repository = (pkg.repository as Record<string, string>).url ?? ''
      }
    } catch {
      // Use defaults
    }
  }

  // Detect primary language from file extensions
  const language = await detectPrimaryLanguage(cwd)

  // Detect framework from dependencies
  const framework = await detectFramework(cwd)

  return { description, framework, language, license, name, repository, version }
}

async function detectPrimaryLanguage(cwd: string): Promise<string> {
  const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
  const patterns = Object.keys(EXTENSION_MAP).map((ext) => `**/*${ext}`)

  try {
    const files = await discoverFiles({ cwd, ignore: defaultIgnore, patterns })
    const counts = new Map<string, number>()
    for (const file of files) {
      const ext = extname(file.path).toLowerCase()
      const lang = EXTENSION_MAP[ext]
      if (lang) {
        counts.set(lang, (counts.get(lang) ?? 0) + 1)
      }
    }

    if (counts.size === 0) return 'Unknown'

    let topLang = 'Unknown'
    let topCount = 0
    for (const [lang, count] of counts) {
      if (count > topCount) {
        topCount = count
        topLang = lang
      }
    }

    return topLang
  } catch {
    return 'Unknown'
  }
}

async function detectFramework(cwd: string): Promise<string> {
  const pkgPath = resolve(cwd, 'package.json')
  if (!existsSync(pkgPath)) return ''

  try {
    const raw = await fs.readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw) as Record<string, Record<string, string>>
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    for (const [key, framework] of Object.entries(FRAMEWORK_PATTERNS)) {
      if (deps[key]) return framework
    }

    return ''
  } catch {
    return ''
  }
}

// ─── Code overview ──────────────────────────────────────

export interface FileEntry {
  path: string
  absolutePath: string
}

export interface FileContent {
  path: string
  content: string
}

/**
 * Compute code overview from discovered files and their contents.
 *
 * @example
 * ```ts
 * const overview = computeCodeOverview(files, contents)
 * // { totalFiles: 42, sourceFiles: 30, testFiles: 12, ... }
 * ```
 */
export function computeCodeOverview(files: FileEntry[], contents: FileContent[]): CodeOverview {
  const totalFiles = files.length
  let sourceFiles = 0
  let testFiles = 0
  let configFiles = 0
  let totalLines = 0
  let codeLines = 0

  const langCounts = new Map<string, number>()

  for (const file of files) {
    const ext = extname(file.path).toLowerCase()
    const lang = EXTENSION_MAP[ext] ?? 'Unknown'

    langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1)

    const isTest = TEST_PATTERNS.some((p) => file.path.includes(p))
    const isConfig = CONFIG_EXTENSIONS.has(ext) || file.path.startsWith('.') || file.path.includes('config')

    if (isTest) {
      testFiles++
    } else if (isConfig) {
      configFiles++
    }

    if (SOURCE_EXTENSIONS.has(ext)) {
      sourceFiles++
    }
  }

  const contentMap = new Map(contents.map((c) => [c.path, c.content]))

  for (const file of files) {
    const content = contentMap.get(file.path) ?? ''
    const lines = content.split('\n')
    totalLines += lines.length

    // Count non-blank, non-comment lines as code lines (simplified)
    const ext = extname(file.path).toLowerCase()
    const commentPrefix = getCommentPrefix(ext)
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 0 && !trimmed.startsWith(commentPrefix)) {
        codeLines++
      }
    }
  }

  // Build language percentages
  const languages: { name: string; files: number; percentage: number }[] = []
  for (const [name, count] of langCounts) {
    const percentage = totalFiles > 0 ? Math.round((count / totalFiles) * 100) : 0
    languages.push({ files: count, name, percentage })
  }
  languages.sort((a, b) => b.files - a.files)

  return {
    codeLines,
    configFiles,
    languages,
    sourceFiles,
    testFiles,
    totalFiles,
    totalLines,
  }
}

function getCommentPrefix(ext: string): string {
  switch (ext) {
    case '.py':
    case '.rb':
    case '.sh':
    case '.yaml':
    case '.yml':
      return '#'
    case '.sql':
      return '--'
    default:
      return '//'
  }
}

// ─── Health score ───────────────────────────────────────

/**
 * Compute health score based on code overview and issues.
 *
 * @example
 * ```ts
 * const health = computeHealthScore(codeOverview, quickIssues)
 * // { overall: 82, grade: 'B', documentation: 80, ... }
 * ```
 */
export function computeHealthScore(code: CodeOverview, issues: QuickIssues): HealthScore {
  // Documentation score: based on comment ratio
  const commentRatio = code.totalLines > 0 ? (code.totalLines - code.codeLines) / code.totalLines : 0
  let documentation: number
  if (commentRatio === 0) {
    documentation = 20
  } else if (commentRatio >= 0.2) {
    documentation = 100
  } else {
    // Linear scale from 20 at 0% to 100 at 20%
    documentation = Math.round(20 + (commentRatio / 0.2) * 80)
  }

  // Testing score: based on test/source ratio
  const testRatio = code.sourceFiles > 0 ? code.testFiles / code.sourceFiles : 0
  let testing: number
  if (code.testFiles === 0) {
    testing = 0
  } else if (testRatio >= 1) {
    testing = 100
  } else {
    // Linear scale from 0 at 0 to 100 at 1:1
    testing = Math.round(testRatio * 100)
  }

  // Complexity score: inverse of hotspots
  let complexity: number
  if (issues.complexityHotspots === 0) {
    complexity = 100
  } else if (issues.complexityHotspots >= 5) {
    complexity = 20
  } else {
    complexity = Math.round(100 - (issues.complexityHotspots / 5) * 80)
  }

  // Maintainability: based on avg file length
  const avgFileLength = code.totalFiles > 0 ? code.totalLines / code.totalFiles : 0
  let maintainability: number
  if (avgFileLength <= 100) {
    maintainability = 100
  } else if (avgFileLength >= 500) {
    maintainability = 20
  } else {
    // Linear scale from 100 at 100 to 20 at 500
    maintainability = Math.round(100 - ((avgFileLength - 100) / 400) * 80)
  }

  // Overall: weighted average
  const overall = Math.round(
    documentation * 0.2 + testing * 0.3 + complexity * 0.25 + maintainability * 0.25,
  )

  // Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (overall >= 90) {
    grade = 'A'
  } else if (overall >= 75) {
    grade = 'B'
  } else if (overall >= 60) {
    grade = 'C'
  } else if (overall >= 40) {
    grade = 'D'
  } else {
    grade = 'F'
  }

  return { complexity, documentation, grade, maintainability, overall, testing }
}

// ─── Git overview ───────────────────────────────────────

/**
 * Compute git overview for a project.
 *
 * @example
 * ```ts
 * const gitInfo = await computeGitOverview('/path/to/repo')
 * // { branch: 'main', totalCommits: 142, ... }
 * ```
 */
export async function computeGitOverview(cwd: string): Promise<GitOverview | null> {
  try {
    const gitDir = resolve(cwd, '.git')
    if (!existsSync(gitDir)) return null

    const [branch, commitCount, contributors, lastCommit, branches, tags, status] = await Promise.all([
      gitCommand(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']),
      gitCommand(cwd, ['rev-list', '--count', 'HEAD']),
      gitCommand(cwd, ['shortlog', '-sn', 'HEAD']),
      gitCommand(cwd, ['log', '-1', '--format=%aI']),
      gitCommand(cwd, ['branch', '-a']),
      gitCommand(cwd, ['tag']),
      gitCommand(cwd, ['status', '--porcelain']),
    ])

    const contributorLines = contributors.trim().split('\n').filter(Boolean)
    const totalContributors = contributorLines.length
    const totalBranches = branches.trim().split('\n').filter(Boolean).length
    const totalTags = tags.trim().split('\n').filter(Boolean).length
    const isDirty = status.trim().length > 0

    const lastCommitDate = formatRelativeTime(lastCommit.trim())

    return {
      branch: branch.trim(),
      isDirty,
      lastCommitDate,
      totalBranches,
      totalCommits: parseInt(commitCount.trim(), 10) || 0,
      totalContributors,
      totalTags,
    }
  } catch {
    return null
  }
}

async function gitCommand(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd })
  return stdout
}

/**
 * Format a date string into a relative time string.
 *
 * @example
 * ```ts
 * formatRelativeTime('2025-01-15T10:00:00Z')
 * // "2 days ago" (depending on current date)
 * ```
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  return 'just now'
}

// ─── Quick issues ───────────────────────────────────────

/**
 * Compute quick issue counts from file contents.
 *
 * @example
 * ```ts
 * const issues = computeQuickIssues(files, contents)
 * // { todos: 3, deadCode: 0, unusedExports: 1, ... }
 * ```
 */
export function computeQuickIssues(files: FileEntry[], contents: FileContent[]): QuickIssues {
  let todos = 0
  let deadCode = 0
  let unusedExports = 0
  let complexityHotspots = 0
  let missingDocs = 0

  const contentMap = new Map(contents.map((c) => [c.path, c.content]))

  for (const file of files) {
    const content = contentMap.get(file.path) ?? ''
    const lines = content.split('\n')

    // Count TODO/FIXME/HACK
    for (const line of lines) {
      const trimmed = line.trim()
      if (
        trimmed.includes('TODO') ||
        trimmed.includes('FIXME') ||
        trimmed.includes('HACK')
      ) {
        todos++
      }
    }

    // Estimate unused exports: files with many exports but few imports
    const exportCount = countExports(content)
    const importCount = countImports(content)
    if (exportCount > 3 && importCount === 0) {
      unusedExports += exportCount
    }

    // Estimate dead code: commented-out code blocks
    const commentBlockLines = countCommentedCode(lines)
    if (commentBlockLines > 5) {
      deadCode += Math.floor(commentBlockLines / 5)
    }

    // Complexity hotspots: files with very long functions (simplified heuristic)
    const ext = extname(file.path).toLowerCase()
    if (SOURCE_EXTENSIONS.has(ext) && lines.length > 300) {
      complexityHotspots++
    }

    // Missing docs: source files with no comments at all
    const hasComments = lines.some((l) => {
      const t = l.trim()
      return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('#')
    })
    if (SOURCE_EXTENSIONS.has(ext) && !hasComments && lines.length > 10) {
      missingDocs++
    }
  }

  return { complexityHotspots, deadCode, missingDocs, todos, unusedExports }
}

function countExports(content: string): number {
  const patterns = [
    /export\s+(default\s+)?(function|class|const|let|var|interface|type|enum)\s+/g,
    /export\s*\{/g,
  ]
  let count = 0
  for (const pattern of patterns) {
    const matches = content.match(pattern)
    count += matches ? matches.length : 0
  }
  return count
}

function countImports(content: string): number {
  const pattern = /import\s+/g
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

function countCommentedCode(lines: string[]): number {
  let count = 0
  for (const line of lines) {
    const trimmed = line.trim()
    // Look for commented-out code lines (lines starting with // followed by code-like patterns)
    if (
      trimmed.startsWith('//') &&
      (trimmed.includes('(') ||
        trimmed.includes('{') ||
        trimmed.includes('=>') ||
        trimmed.includes('return') ||
        trimmed.includes('const ') ||
        trimmed.includes('let ') ||
        trimmed.includes('function ') ||
        trimmed.includes('class '))
    ) {
      count++
    }
  }
  return count
}

// ─── Top files ──────────────────────────────────────────

/**
 * Find the top N largest files by line count.
 *
 * @example
 * ```ts
 * const top = findTopFiles(files, contents, 5)
 * // [{ path: 'src/big-file.ts', lines: 1200 }, ...]
 * ```
 */
export function findTopFiles(
  files: FileEntry[],
  contents: FileContent[],
  count = 5,
): { path: string; lines: number }[] {
  const contentMap = new Map(contents.map((c) => [c.path, c.content]))

  const fileLines: { path: string; lines: number }[] = []
  for (const file of files) {
    const content = contentMap.get(file.path) ?? ''
    const lineCount = content.split('\n').length
    fileLines.push({ lines: lineCount, path: file.path })
  }

  fileLines.sort((a, b) => b.lines - a.lines)
  return fileLines.slice(0, count)
}

// ─── Recent changes ─────────────────────────────────────

/**
 * Find recently changed files using git log or mtime fallback.
 *
 * @example
 * ```ts
 * const changes = await findRecentChanges('/path/to/project')
 * // [{ file: 'src/index.ts', date: '2 hours ago' }, ...]
 * ```
 */
export async function findRecentChanges(cwd: string): Promise<{ file: string; date: string }[]> {
  // Try git first
  try {
    const gitDir = resolve(cwd, '.git')
    if (existsSync(gitDir)) {
      const { stdout } = await execFileAsync(
        'git',
        ['log', '-5', '--format=%aI', '--name-only', '--pretty=format:%aI', '--diff-filter=ACMR'],
        { cwd },
      )

      const entries: { file: string; date: string }[] = []
      const lines = stdout.trim().split('\n').filter(Boolean)

      let currentDate = ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.match(/^\d{4}-\d{2}-\d{2}T/)) {
          currentDate = trimmed
        } else if (trimmed && currentDate) {
          entries.push({ date: formatRelativeTime(currentDate), file: trimmed })
        }
      }

      return entries.slice(0, 5)
    }
  } catch {
    // Fall through to mtime
  }

  // Fallback: use mtime from stat
  try {
    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd,
      ignore: defaultIgnore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const filesWithTime = await Promise.all(
      discoveredFiles.map(async (f) => {
        try {
          const stat = await fs.stat(f.absolutePath)
          return { date: formatRelativeTime(stat.mtime.toISOString()), file: f.path }
        } catch {
          return null
        }
      }),
    )

    return filesWithTime
      .filter((f): f is { date: string; file: string } => f !== null)
      .slice(0, 5)
  } catch {
    return []
  }
}

// ─── Main orchestrator ──────────────────────────────────

/**
 * Build a complete summary result for a project.
 *
 * @example
 * ```ts
 * const result = await buildSummaryResult('/path/to/project')
 * console.log(result.health.grade) // "A"
 * ```
 */
export async function buildSummaryResult(
  cwd: string,
  options: BuildSummaryOptions = {},
): Promise<SummaryResult> {
  const defaultIgnore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.git/**',
    '**/*.d.ts',
  ]

  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.json',
    '**/*.css',
    '**/*.html',
    '**/*.md',
    '**/*.py',
    '**/*.rs',
    '**/*.go',
    '**/*.java',
    '**/*.rb',
    '**/*.sh',
    '**/*.yaml',
    '**/*.yml',
    '**/*.xml',
    '**/*.sql',
  ]

  const discoveredFiles = await discoverFiles({ cwd, ignore: defaultIgnore, patterns })

  // Read all file contents
  const contents: FileContent[] = await Promise.all(
    discoveredFiles.map(async (file) => {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        return { content, path: file.path }
      } catch {
        return { content: '', path: file.path }
      }
    }),
  )

  const files: FileEntry[] = discoveredFiles.map((f) => ({
    absolutePath: f.absolutePath,
    path: f.path,
  }))

  const [project, git, recentChanges] = await Promise.all([
    detectProjectInfo(cwd),
    options.noGit ? Promise.resolve(null) : computeGitOverview(cwd),
    findRecentChanges(cwd),
  ])

  const code = computeCodeOverview(files, contents)
  const issues = computeQuickIssues(files, contents)
  const health = computeHealthScore(code, issues)
  const topFiles = findTopFiles(files, contents)

  return {
    code,
    git,
    health,
    issues,
    project,
    recentChanges,
    topFiles,
  }
}
