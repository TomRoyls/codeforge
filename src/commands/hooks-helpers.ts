/**
 * Pure helper functions for the hooks command.
 *
 * Analyzes git hooks configuration — detects installed hooks, validates hook
 * scripts, checks for common issues, and generates recommendations.
 *
 * @example
 * ```ts
 * import { buildHooksResult, detectLanguage } from './hooks-helpers.js'
 * const result = await buildHooksResult(process.cwd())
 * console.log(result.installedHooks) // number of installed hooks
 * ```
 */
import { existsSync, lstatSync, readFileSync, readlinkSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

// ─── Interfaces ──────────────────────────────────────────

/**
 * A single issue found in a git hook.
 *
 * @example
 * ```ts
 * const issue: HookIssue = { severity: 'warning', message: 'Hook is not executable' }
 * ```
 */
export interface HookIssue {
  severity: 'error' | 'info' | 'warning'
  message: string
}

/**
 * Detailed information about a single git hook.
 *
 * @example
 * ```ts
 * const hook: HookInfo = {
 *   name: 'pre-commit',
 *   type: 'client',
 *   installed: true,
 *   isExecutable: true,
 *   isSymlink: false,
 *   target: '',
 *   size: 256,
 *   language: 'shell',
 *   hasShebang: true,
 *   shebang: '#!/bin/sh',
 *   content: '#!/bin/sh\nnpm test\n',
 *   issues: [],
 *   recommendations: [],
 * }
 * ```
 */
export interface HookInfo {
  /** Hook file contents (empty string if not installed) */
  content: string
  /** Whether the hook file has a shebang line */
  hasShebang: boolean
  /** Whether the file exists in .git/hooks/ */
  installed: boolean
  /** Whether the hook file is executable */
  isExecutable: boolean
  /** Whether the hook is a symlink */
  isSymlink: boolean
  /** Issues detected for this hook */
  issues: HookIssue[]
  /** Detected script language */
  language: string
  /** Hook name, e.g. 'pre-commit', 'commit-msg' */
  name: string
  /** Recommendations for this specific hook */
  recommendations: string[]
  /** Shebang line (empty string if none) */
  shebang: string
  /** File size in bytes */
  size: number
  /** Symlink target path (empty string if not a symlink) */
  target: string
  /** Whether this is a client or server hook */
  type: 'client' | 'server'
}

/**
 * Aggregated result of analyzing all git hooks in a repository.
 *
 * @example
 * ```ts
 * const result: HooksResult = await buildHooksResult('.')
 * console.log(result.hooksDir)       // '/path/to/.git/hooks'
 * console.log(result.installedHooks) // 3
 * console.log(result.totalHooks)     // 19
 * ```
 */
export interface HooksResult {
  /** Analyzed hooks */
  hooks: HookInfo[]
  /** Absolute path to the .git/hooks directory */
  hooksDir: string
  /** Number of installed hooks */
  installedHooks: number
  /** Global issues across all hooks */
  issues: HookIssue[]
  /** Global recommendations */
  recommendations: string[]
  /** Total possible standard hooks (19) */
  totalHooks: number
}

// ─── Constants ───────────────────────────────────────────

const CLIENT_HOOKS = [
  'pre-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-rebase',
  'post-rewrite',
  'post-checkout',
  'post-merge',
  'pre-push',
  'pre-auto-gc',
  'fsmonitor-watchman',
] as const

const SERVER_HOOKS = ['pre-receive', 'update', 'post-receive'] as const

// ─── Hook name lists ─────────────────────────────────────

/**
 * Return the list of standard git client-side hook names.
 *
 * @example
 * ```ts
 * const hooks = getClientHooks() // ['pre-commit', 'prepare-commit-msg', ...]
 * ```
 */
export function getClientHooks(): string[] {
  return [...CLIENT_HOOKS]
}

/**
 * Return the list of standard git server-side hook names.
 *
 * @example
 * ```ts
 * const hooks = getServerHooks() // ['pre-receive', 'update', 'post-receive']
 * ```
 */
export function getServerHooks(): string[] {
  return [...SERVER_HOOKS]
}

/**
 * Return the combined list of all standard git hook names (client + server).
 *
 * @example
 * ```ts
 * const all = getAllHookNames() // 19 hooks
 * ```
 */
export function getAllHookNames(): string[] {
  return [...CLIENT_HOOKS, ...SERVER_HOOKS]
}

// ─── Git directory resolution ─────────────────────────────

/**
 * Find the .git directory for the given working directory.
 *
 * Runs `git rev-parse --git-dir` to resolve the path.
 *
 * @example
 * ```ts
 * const gitDir = await getGitDir('/path/to/repo') // '/path/to/repo/.git'
 * ```
 *
 * @param cwd - Current working directory
 * @returns Absolute path to the .git directory
 * @throws Error if not inside a git repository
 */
export async function getGitDir(cwd: string): Promise<string> {
  try {
    const result = execSync('git rev-parse --git-dir', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    if (!result) {
      throw new Error('Not a git repository')
    }
    return result
  } catch (error) {
    throw new Error(
      `Not a git repository: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ─── Language detection ──────────────────────────────────

/**
 * Detect the scripting language of a hook based on its shebang and content.
 *
 * @example
 * ```ts
 * detectLanguage('#!/usr/bin/env python3', 'import sys') // 'python'
 * detectLanguage('#!/bin/bash', 'echo hello')            // 'shell'
 * detectLanguage('', 'some content')                     // 'unknown'
 * ```
 *
 * @param content - File contents
 * @param shebang - Shebang line (first line starting with #!)
 * @returns Detected language name
 */
export function detectLanguage(content: string, shebang: string): string {
  if (shebang.includes('python')) return 'python'
  if (shebang.includes('node')) return 'node'
  if (shebang.includes('ruby')) return 'ruby'
  if (shebang.includes('sh') || shebang.includes('bash')) return 'shell'
  if (content.startsWith('#!') && content.includes('perl')) return 'perl'
  return 'unknown'
}

// ─── Shebang parsing ─────────────────────────────────────

/**
 * Extract the shebang line from file contents.
 *
 * @example
 * ```ts
 * parseShebang('#!/bin/bash\necho hello')  // '#!/bin/bash'
 * parseShebang('echo hello')               // ''
 * parseShebang('')                         // ''
 * ```
 *
 * @param content - File contents
 * @returns The shebang line or empty string if none
 */
export function parseShebang(content: string): string {
  if (!content) return ''
  const firstLine = content.split('\n')[0] ?? ''
  if (firstLine.startsWith('#!')) return firstLine
  return ''
}

// ─── Hook analysis ───────────────────────────────────────

/**
 * Analyze a single git hook by name.
 *
 * Checks if the hook file exists, whether it is executable, a symlink,
 * reads its contents, detects the language, and finds issues.
 *
 * @example
 * ```ts
 * const info = analyzeHook('pre-commit', '/repo/.git/hooks')
 * console.log(info.installed, info.language, info.issues.length)
 * ```
 *
 * @param name - Hook name (e.g. 'pre-commit')
 * @param hooksDir - Path to the .git/hooks directory
 * @returns Complete HookInfo for this hook
 */
export function analyzeHook(name: string, hooksDir: string): HookInfo {
  const hookPath = join(hooksDir, name)
  const isClient = (CLIENT_HOOKS as readonly string[]).includes(name)
  const type: 'client' | 'server' = isClient ? 'client' : 'server'

  const notInstalled: HookInfo = {
    content: '',
    hasShebang: false,
    installed: false,
    isExecutable: false,
    isSymlink: false,
    issues: [],
    language: 'unknown',
    name,
    recommendations: [],
    shebang: '',
    size: 0,
    target: '',
    type,
  }

  if (!existsSync(hookPath)) {
    return notInstalled
  }

  let isSymlink = false
  let target = ''
  let isExecutable = false
  let size = 0

  try {
    const lstat = lstatSync(hookPath)
    isSymlink = lstat.isSymbolicLink()

    if (isSymlink) {
      try {
        target = readlinkSync(hookPath)
      } catch {
        target = ''
      }
    }

    const stat = statSync(hookPath)
    // Check executable permission (owner, group, or others)
    isExecutable = (stat.mode & 0o111) !== 0
    size = stat.size
  } catch {
    return notInstalled
  }

  let content = ''
  try {
    content = readFileSync(hookPath, 'utf8')
  } catch {
    content = ''
  }

  const shebang = parseShebang(content)
  const hasShebang = shebang.length > 0
  const language = detectLanguage(content, shebang)

  const issues = findHookIssues({
    content,
    hasShebang,
    installed: true,
    isExecutable,
    isSymlink,
    language,
    name,
    shebang,
    size,
    target,
    type,
  })

  return {
    content,
    hasShebang,
    installed: true,
    isExecutable,
    isSymlink,
    issues,
    language,
    name,
    recommendations: [],
    shebang,
    size,
    target,
    type,
  }
}

// ─── Issue detection ─────────────────────────────────────

/**
 * Detect common issues in a hook.
 *
 * Checks for:
 * - Not executable (warning)
 * - No shebang line (warning)
 * - Empty file (info)
 * - Disabled hook with `exit 0` at start (info)
 * - Hardcoded paths (warning)
 * - Missing `set -e` in shell scripts (info)
 * - Very large hooks >10KB (warning)
 *
 * @example
 * ```ts
 * const issues = findHookIssues({ ...hookInfo })
 * // [{ severity: 'warning', message: 'Hook is not executable' }]
 * ```
 *
 * @param hook - The HookInfo to analyze
 * @returns Array of detected issues
 */
export function findHookIssues(hook: Omit<HookInfo, 'issues' | 'recommendations'>): HookIssue[] {
  const issues: HookIssue[] = []

  if (!hook.installed) return issues

  if (!hook.isExecutable) {
    issues.push({ message: 'Hook is not executable', severity: 'warning' })
  }

  if (!hook.hasShebang && hook.content.length > 0) {
    issues.push({ message: 'Hook has no shebang line', severity: 'warning' })
  }

  if (hook.content.trim().length === 0) {
    issues.push({ message: 'Hook file is empty', severity: 'info' })
  }

  const trimmedContent = hook.content.trim()
  if (trimmedContent.startsWith('exit 0')) {
    issues.push({ message: 'Hook appears to be disabled (starts with exit 0)', severity: 'info' })
  }

  if (hook.content.length > 0) {
    // Check for hardcoded absolute paths (common issue in team environments)
    const hardcodedPathPattern = /\/(?:home|Users|usr\/local|opt)\/\S+/g
    if (hardcodedPathPattern.test(hook.content)) {
      issues.push({ message: 'Hook contains hardcoded paths', severity: 'warning' })
    }
  }

  if (hook.language === 'shell' && hook.content.length > 0) {
    if (!hook.content.includes('set -e')) {
      issues.push({ message: "Shell hook missing 'set -e' for error handling", severity: 'info' })
    }
  }

  if (hook.size > 10_240) {
    issues.push({ message: 'Hook is very large (>10KB)', severity: 'warning' })
  }

  return issues
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate improvement recommendations based on the current hook configuration.
 *
 * @example
 * ```ts
 * const recs = generateRecommendations(hooks)
 * // ['Consider adding a pre-commit hook for linting', ...]
 * ```
 *
 * @param hooks - Array of all analyzed hooks
 * @returns Array of recommendation strings
 */
export function generateRecommendations(hooks: HookInfo[]): string[] {
  const recommendations: string[] = []

  const installedNames = new Set(hooks.filter((h) => h.installed).map((h) => h.name))

  if (!installedNames.has('pre-commit')) {
    recommendations.push('Consider adding a pre-commit hook for linting')
  }

  if (!installedNames.has('commit-msg')) {
    recommendations.push('Consider adding a commit-msg hook for conventional commits')
  }

  // Check for husky/lint-staged config but no hooks installed
  const hasHuskyConfig =
    existsSync('.husky') || existsSync('husky.config.js') || existsSync('.huskyrc')
  const hasLintStagedConfig =
    existsSync('.lintstagedrc') ||
    existsSync('lint-staged.config.js') ||
    existsSync('.lintstagedrc.json')
  const hasNoInstalledHooks = hooks.every((h) => !h.installed)

  if ((hasHuskyConfig || hasLintStagedConfig) && hasNoInstalledHooks) {
    recommendations.push('Configure husky/lint-staged — config files found but no hooks installed')
  }

  // Shell hook without set -e
  const shellHooksNoSetE = hooks.filter(
    (h) =>
      h.installed &&
      h.language === 'shell' &&
      h.content.length > 0 &&
      !h.content.includes('set -e'),
  )

  if (shellHooksNoSetE.length > 0) {
    const names = shellHooksNoSetE.map((h) => h.name).join(', ')
    recommendations.push(
      `Add 'set -e' for better error handling in shell hooks: ${names}`,
    )
  }

  return recommendations
}

// ─── Orchestration ───────────────────────────────────────

/**
 * Build a complete hooks analysis result for the given working directory.
 *
 * Finds the git directory, analyzes each standard hook, collects issues
 * and recommendations.
 *
 * @example
 * ```ts
 * const result = await buildHooksResult(process.cwd())
 * console.log(result.installedHooks) // 3
 * console.log(result.totalHooks)     // 19
 * ```
 *
 * @param cwd - Current working directory
 * @returns Complete HooksResult
 */
export async function buildHooksResult(cwd: string): Promise<HooksResult> {
  const gitDir = await getGitDir(cwd)
  const hooksDir = join(gitDir, 'hooks')
  const allNames = getAllHookNames()
  const hooks = allNames.map((name) => analyzeHook(name, hooksDir))

  const installedHooks = hooks.filter((h) => h.installed).length

  const allIssues: HookIssue[] = []
  for (const hook of hooks) {
    allIssues.push(...hook.issues)
  }

  const recommendations = generateRecommendations(hooks)

  return {
    hooks,
    hooksDir,
    installedHooks,
    issues: allIssues,
    recommendations,
    totalHooks: allNames.length,
  }
}
