import { basename } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(execFile)

// ─── Types ──────────────────────────────────────────────

export interface CommitChange {
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
  filesChanged: number
  additions: number
  deletions: number
}

export type FileChangeStatus = 'added' | 'modified' | 'deleted' | 'renamed'

export interface FileChange {
  file: string
  status: FileChangeStatus
  additions: number
  deletions: number
  totalChange: number
  previousPath: string | null
}

export interface DiffAnalysis {
  files: FileChange[]
  commits: CommitChange[]
  authors: string[]
  complexityDelta: number
  newTodos: number
  resolvedTodos: number
  newSecurityIssues: number
  testFilesChanged: number
  sourceFilesChanged: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
}

export type RegressionType = 'large-file-change' | 'many-authors' | 'complexity-spike' | 'test-ratio-drop' | 'new-todos' | 'security-introduction'

export type Severity = 'warning' | 'critical'

export interface RegressionIndicator {
  type: RegressionType
  description: string
  severity: Severity
  files: string[]
}

export interface WhatBrokeResult {
  analysis: DiffAnalysis
  indicators: RegressionIndicator[]
  suggestions: string[]
}

export interface WhatBrokeOptions {
  since: string
  until: string
  verbose: boolean
}

// ─── parseDiffNumstat ───────────────────────────────────

/**
 * @example
 * const files = parseDiffNumstat('10\t5\tpath/to/file.ts')
 * console.log(files[0].additions)
 */
export function parseDiffNumstat(output: string): FileChange[] {
  if (!output.trim()) return []

  const files: FileChange[] = []
  for (const line of output.trim().split('\n')) {
    if (!line.trim()) continue
    const parts = line.split('\t')
    if (parts.length < 3) continue

    const additions = parts[0] === '-' ? 0 : Number(parts[0])
    const deletions = parts[1] === '-' ? 0 : Number(parts[1])
    const rawFile = parts.slice(2).join('\t')

    let status: FileChangeStatus = 'modified'
    let file = rawFile
    let previousPath: string | null = null

    if (rawFile.startsWith('{')) {
      const braceEnd = rawFile.indexOf('}')
      if (braceEnd !== -1) {
        const inner = rawFile.slice(1, braceEnd)
        const arrowIdx = inner.indexOf(' => ')
        if (arrowIdx !== -1) {
          previousPath = inner.slice(0, arrowIdx)
          file = inner.slice(arrowIdx + 4)
          status = 'renamed'
        }
      }
    }

    files.push({
      additions,
      deletions,
      file,
      previousPath,
      status,
      totalChange: additions + deletions,
    })
  }

  return files
}

// ─── parseGitLog ────────────────────────────────────────

/**
 * @example
 * const commits = parseGitLog('abc123|Author|2024-01-01|msg')
 * console.log(commits[0].author)
 */
export function parseGitLog(output: string): CommitChange[] {
  if (!output.trim()) return []

  const commits: CommitChange[] = []
  for (const line of output.trim().split('\n')) {
    if (!line.trim()) continue
    const parts = line.split('|')
    if (parts.length < 4) continue

    const hash = parts[0].trim()
    commits.push({
      additions: 0,
      author: parts[1].trim(),
      date: parts[2].trim(),
      deletions: 0,
      filesChanged: 0,
      hash,
      message: parts.slice(3).join('|').trim(),
      shortHash: hash.slice(0, 7),
    })
  }

  return commits
}

// ─── categorizeFileChange ───────────────────────────────

/**
 * @example
 * const cat = categorizeFileChange('src/main.ts')
 * console.log(cat)
 */
export function categorizeFileChange(file: string): 'source' | 'test' | 'config' | 'other' {
  if (/(?:test|spec|__tests__)\//.test(file) || /\.(?:test|spec)\.[jt]sx?$/.test(file)) {
    return 'test'
  }
  const base = basename(file)
  if (/^(?:package\.json|tsconfig\.json|\.eslintrc|\.prettierrc|vitest\.config|vite\.config|\.env)/.test(base)) {
    return 'config'
  }
  if (/\.(?:ts|tsx|js|jsx)$/.test(file)) {
    return 'source'
  }
  return 'other'
}

// ─── countTodosInDiff ───────────────────────────────────

/**
 * @example
 * const { newTodos, resolvedTodos } = countTodosInDiff('+ // TODO: fix', '- // TODO: old')
 * console.log(newTodos)
 */
export function countTodosInDiff(diffOutput: string): { newTodos: number; resolvedTodos: number } {
  let newTodos = 0
  let resolvedTodos = 0

  for (const line of diffOutput.split('\n')) {
    if (/^\+.*(?:TODO|FIXME|HACK|XXX)\b/.test(line)) newTodos++
    if (/^-.*(?:TODO|FIXME|HACK|XXX)\b/.test(line)) resolvedTodos++
  }

  return { newTodos, resolvedTodos }
}

// ─── countSecurityIssuesInDiff ──────────────────────────

/**
 * @example
 * const count = countSecurityIssuesInDiff('+ eval("x")')
 * console.log(count)
 */
export function countSecurityIssuesInDiff(diffOutput: string): number {
  const securityPatterns = [
    /\beval\s*\(/,
    /\.innerHTML\s*=/,
    /(?:password|secret|api_key|apikey|token)\s*[:=]\s*['"][^'"]+['"]/i,
  ]

  let count = 0
  for (const line of diffOutput.split('\n')) {
    if (!line.startsWith('+')) continue
    for (const pattern of securityPatterns) {
      if (pattern.test(line)) {
        count++
        break
      }
    }
  }

  return count
}

// ─── estimateComplexityDelta ────────────────────────────

/**
 * @example
 * const delta = estimateComplexityDelta(files)
 * console.log(delta)
 */
export function estimateComplexityDelta(files: FileChange[]): number {
  let delta = 0
  for (const f of files) {
    const cat = categorizeFileChange(f.file)
    if (cat === 'test') continue
    const weight = cat === 'source' ? 1.0 : 0.3
    delta += (f.additions - f.deletions * 0.5) * weight
  }
  return Math.round(delta)
}

// ─── analyzeDiff ────────────────────────────────────────

/**
 * @example
 * const analysis = analyzeDiff(commits, files, '')
 * console.log(analysis.riskLevel)
 */
export function analyzeDiff(
  commits: CommitChange[],
  files: FileChange[],
  diffOutput: string,
): DiffAnalysis {
  const authors = [...new Set(commits.map((c) => c.author))]

  let testFilesChanged = 0
  let sourceFilesChanged = 0
  for (const f of files) {
    const cat = categorizeFileChange(f.file)
    if (cat === 'test') testFilesChanged++
    else if (cat === 'source') sourceFilesChanged++
  }

  const complexityDelta = estimateComplexityDelta(files)
  const { newTodos, resolvedTodos } = countTodosInDiff(diffOutput)
  const newSecurityIssues = countSecurityIssuesInDiff(diffOutput)

  const riskFactors: string[] = []
  if (newSecurityIssues > 0) riskFactors.push('Security issues introduced')
  if (newTodos > resolvedTodos + 3) riskFactors.push('Accumulating TODOs')
  if (sourceFilesChanged > testFilesChanged * 3 && sourceFilesChanged > 5) {
    riskFactors.push('Low test-to-source ratio')
  }

  const riskLevel: 'low' | 'medium' | 'high' = riskFactors.length >= 3 ? 'high' : riskFactors.length >= 1 ? 'medium' : 'low'

  return {
    authors,
    commits,
    complexityDelta,
    files,
    newSecurityIssues,
    newTodos,
    resolvedTodos,
    riskFactors,
    riskLevel,
    sourceFilesChanged,
    testFilesChanged,
  }
}

// ─── detectRegressionIndicators ─────────────────────────

/**
 * @example
 * const indicators = detectRegressionIndicators(analysis)
 * console.log(indicators[0].type)
 */
export function detectRegressionIndicators(analysis: DiffAnalysis): RegressionIndicator[] {
  const indicators: RegressionIndicator[] = []

  for (const commit of analysis.commits) {
    const totalChange = commit.additions + commit.deletions
    if (totalChange > 500) {
      indicators.push({
        description: `Commit ${commit.shortHash} changed ${totalChange} lines`,
        files: [],
        severity: 'warning',
        type: 'large-file-change',
      })
    }
  }

  if (analysis.authors.length > 5) {
    indicators.push({
      description: `${analysis.authors.length} authors contributed in this range`,
      files: [],
      severity: 'warning',
      type: 'many-authors',
    })
  }

  if (analysis.complexityDelta > 100) {
    indicators.push({
      description: `Complexity increased by ${analysis.complexityDelta} points`,
      files: [],
      severity: 'warning',
      type: 'complexity-spike',
    })
  }

  if (analysis.sourceFilesChanged > 5 && analysis.testFilesChanged === 0) {
    indicators.push({
      description: `${analysis.sourceFilesChanged} source files changed with no test updates`,
      files: analysis.files.filter((f) => categorizeFileChange(f.file) === 'source').map((f) => f.file),
      severity: 'critical',
      type: 'test-ratio-drop',
    })
  }

  if (analysis.newTodos > analysis.resolvedTodos + 3) {
    indicators.push({
      description: `${analysis.newTodos} new TODOs vs ${analysis.resolvedTodos} resolved`,
      files: [],
      severity: 'warning',
      type: 'new-todos',
    })
  }

  if (analysis.newSecurityIssues > 0) {
    indicators.push({
      description: `${analysis.newSecurityIssues} security issue(s) introduced`,
      files: [],
      severity: 'critical',
      type: 'security-introduction',
    })
  }

  return indicators
}

// ─── generateSuggestions ────────────────────────────────

/**
 * @example
 * const suggestions = generateSuggestions(analysis, indicators)
 * console.log(suggestions[0])
 */
export function generateSuggestions(
  analysis: DiffAnalysis,
  indicators: RegressionIndicator[],
): string[] {
  const suggestions: string[] = []

  if (analysis.riskLevel === 'high') {
    suggestions.push('Consider breaking this into smaller, reviewed PRs')
  }

  if (analysis.testFilesChanged === 0 && analysis.sourceFilesChanged > 0) {
    suggestions.push('Add tests for the changed source files')
  }

  if (analysis.newSecurityIssues > 0) {
    suggestions.push('Review and fix security issues before merging')
  }

  if (analysis.newTodos > analysis.resolvedTodos) {
    suggestions.push('Resolve existing TODOs before adding new ones')
  }

  if (analysis.complexityDelta > 50) {
    suggestions.push('Consider refactoring to reduce complexity')
  }

  const hasLargeCommit = indicators.some((i) => i.type === 'large-file-change')
  if (hasLargeCommit) {
    suggestions.push('Large commits should be split into focused changes')
  }

  if (suggestions.length === 0) {
    suggestions.push('Changes look healthy — no action needed')
  }

  return suggestions
}

// ─── buildWhatBrokeResult ───────────────────────────────

/**
 * @example
 * const result = buildWhatBrokeResult(commits, files, diff)
 * console.log(result.analysis.riskLevel)
 */
export function buildWhatBrokeResult(
  commits: CommitChange[],
  files: FileChange[],
  diffOutput: string,
): WhatBrokeResult {
  const analysis = analyzeDiff(commits, files, diffOutput)
  const indicators = detectRegressionIndicators(analysis)
  const suggestions = generateSuggestions(analysis, indicators)
  return { analysis, indicators, suggestions }
}

// ─── execGit ────────────────────────────────────────────

/**
 * @example
 * const out = await execGit('log', ['--oneline', '-5'], cwd)
 * console.log(out)
 */
export async function execGit(
  cmd: string,
  args: string[],
  cwd: string,
): Promise<string> {
  try {
    const { stdout } = await execAsync('git', [cmd, ...args], { cwd, timeout: 10000 })
    return stdout
  } catch {
    return ''
  }
}

// ─── getCommitRange ─────────────────────────────────────

/**
 * @example
 * const commits = await getCommitRange(cwd, 'HEAD~5', 'HEAD')
 * console.log(commits.length)
 */
export async function getCommitRange(
  cwd: string,
  since: string,
  until: string,
): Promise<CommitChange[]> {
  const format = '%H|%an|%ai|%s'
  const logOutput = await execGit(
    'log',
    [`--format=${format}`, `${since}..${until}`],
    cwd,
  )
  return parseGitLog(logOutput)
}

// ─── getDiffSummary ─────────────────────────────────────

/**
 * @example
 * const files = await getDiffSummary(cwd, 'HEAD~5', 'HEAD')
 * console.log(files.length)
 */
export async function getDiffSummary(
  cwd: string,
  since: string,
  until: string,
): Promise<FileChange[]> {
  const output = await execGit('diff', ['--numstat', `${since}..${until}`], cwd)
  return parseDiffNumstat(output)
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/what-broke-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
