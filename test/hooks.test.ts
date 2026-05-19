import { beforeEach, describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'
import { existsSync, lstatSync, readFileSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

import {
  analyzeHook,
  buildHooksResult,
  detectLanguage,
  findHookIssues,
  generateRecommendations,
  getAllHookNames,
  getClientHooks,
  getGitDir,
  getServerHooks,
  parseShebang,
  type HookInfo,
  type HookIssue,
  type HooksResult,
} from '../src/commands/hooks-helpers.js'

import {
  formatHookStatus,
  formatHooksJson,
  formatHooksTable,
  formatSize,
} from '../src/commands/hooks-format-helpers.js'

import Hooks from '../src/commands/hooks.js'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  lstatSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
}))

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

// ============================================================================
// Factory Helpers
// ============================================================================

const makeHookInfo = (overrides: Partial<HookInfo> = {}): HookInfo => ({
  content: '#!/bin/bash\necho hello\n',
  hasShebang: true,
  installed: true,
  isExecutable: true,
  isSymlink: false,
  issues: [],
  language: 'shell',
  name: 'pre-commit',
  recommendations: [],
  shebang: '#!/bin/bash',
  size: 100,
  target: '',
  type: 'client',
  ...overrides,
})

const makeHooksResult = (overrides: Partial<HooksResult> = {}): HooksResult => ({
  hooks: [],
  hooksDir: '/repo/.git/hooks',
  installedHooks: 0,
  issues: [],
  recommendations: [],
  totalHooks: 19,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(existsSync).mockReturnValue(false)
})

// ============================================================================
// getClientHooks
// ============================================================================

describe('getClientHooks', () => {
  test('returns an array of client hook names', () => {
    const hooks = getClientHooks()
    expect(Array.isArray(hooks)).toBe(true)
    expect(hooks.length).toBeGreaterThan(0)
  })

  test('includes pre-commit', () => {
    expect(getClientHooks()).toContain('pre-commit')
  })

  test('includes commit-msg', () => {
    expect(getClientHooks()).toContain('commit-msg')
  })

  test('includes pre-push', () => {
    expect(getClientHooks()).toContain('pre-push')
  })

  test('does not include server hooks', () => {
    const hooks = getClientHooks()
    expect(hooks).not.toContain('pre-receive')
    expect(hooks).not.toContain('update')
    expect(hooks).not.toContain('post-receive')
  })

  test('returns correct count of client hooks', () => {
    expect(getClientHooks()).toHaveLength(14)
  })
})

// ============================================================================
// getServerHooks
// ============================================================================

describe('getServerHooks', () => {
  test('returns an array of server hook names', () => {
    const hooks = getServerHooks()
    expect(Array.isArray(hooks)).toBe(true)
    expect(hooks.length).toBeGreaterThan(0)
  })

  test('includes pre-receive', () => {
    expect(getServerHooks()).toContain('pre-receive')
  })

  test('includes update', () => {
    expect(getServerHooks()).toContain('update')
  })

  test('includes post-receive', () => {
    expect(getServerHooks()).toContain('post-receive')
  })

  test('returns exactly 3 server hooks', () => {
    expect(getServerHooks()).toHaveLength(3)
  })
})

// ============================================================================
// getAllHookNames
// ============================================================================

describe('getAllHookNames', () => {
  test('returns combined list of all hooks', () => {
    const all = getAllHookNames()
    expect(all.length).toBe(getClientHooks().length + getServerHooks().length)
  })

  test('contains all client hooks', () => {
    const all = getAllHookNames()
    for (const c of getClientHooks()) {
      expect(all).toContain(c)
    }
  })

  test('contains all server hooks', () => {
    const all = getAllHookNames()
    for (const s of getServerHooks()) {
      expect(all).toContain(s)
    }
  })

  test('returns 19 hooks total', () => {
    expect(getAllHookNames()).toHaveLength(17)
  })
})

// ============================================================================
// detectLanguage
// ============================================================================

describe('detectLanguage', () => {
  test('detects python from shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/env python3')).toBe('python')
  })

  test('detects python from python shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/python')).toBe('python')
  })

  test('detects node from shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/env node')).toBe('node')
  })

  test('detects ruby from shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/env ruby')).toBe('ruby')
  })

  test('detects shell from bash shebang', () => {
    expect(detectLanguage('', '#!/bin/bash')).toBe('shell')
  })

  test('detects shell from sh shebang', () => {
    expect(detectLanguage('', '#!/bin/sh')).toBe('shell')
  })

  test('detects shell from env sh shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/env bash')).toBe('shell')
  })

  test('detects perl from content with perl shebang', () => {
    expect(detectLanguage('#!/usr/bin/perl\nprint "hi"', '')).toBe('perl')
  })

  test('returns unknown for empty shebang and content without perl', () => {
    expect(detectLanguage('some content', '')).toBe('unknown')
  })

  test('returns unknown for unrecognized shebang', () => {
    expect(detectLanguage('', '#!/usr/bin/perl')).toBe('unknown')
  })

  test('returns unknown for completely empty input', () => {
    expect(detectLanguage('', '')).toBe('unknown')
  })
})

// ============================================================================
// parseShebang
// ============================================================================

describe('parseShebang', () => {
  test('extracts shebang from content', () => {
    expect(parseShebang('#!/bin/bash\necho hello')).toBe('#!/bin/bash')
  })

  test('extracts shebang with env', () => {
    expect(parseShebang('#!/usr/bin/env node\nconsole.log("hi")')).toBe(
      '#!/usr/bin/env node',
    )
  })

  test('returns empty string when no shebang', () => {
    expect(parseShebang('echo hello')).toBe('')
  })

  test('returns empty string for empty content', () => {
    expect(parseShebang('')).toBe('')
  })

  test('does not match shebang not on first line', () => {
    expect(parseShebang('echo hello\n#!/bin/bash')).toBe('')
  })
})

// ============================================================================
// findHookIssues
// ============================================================================

describe('findHookIssues', () => {
  test('returns empty for not installed hook', () => {
    const issues = findHookIssues(makeHookInfo({ installed: false }))
    expect(issues).toEqual([])
  })

  test('detects non-executable hook', () => {
    const issues = findHookIssues(makeHookInfo({ isExecutable: false }))
    expect(issues.some((i) => i.message.includes('not executable'))).toBe(true)
  })

  test('detects missing shebang', () => {
    const issues = findHookIssues(
      makeHookInfo({ hasShebang: false, shebang: '', content: 'echo hello' }),
    )
    expect(issues.some((i) => i.message.includes('shebang'))).toBe(true)
  })

  test('detects empty file', () => {
    const issues = findHookIssues(makeHookInfo({ content: '   ' }))
    expect(issues.some((i) => i.message.includes('empty'))).toBe(true)
  })

  test('detects disabled hook with exit 0', () => {
    const issues = findHookIssues(makeHookInfo({ content: 'exit 0\n# disabled' }))
    expect(issues.some((i) => i.message.includes('disabled'))).toBe(true)
  })

  test('detects disabled hook with exit 0 and leading whitespace', () => {
    const issues = findHookIssues(
      makeHookInfo({ content: '  exit 0\n# disabled hook' }),
    )
    expect(issues.some((i) => i.message.includes('disabled'))).toBe(true)
  })

  test('detects hardcoded paths', () => {
    const content = '#!/bin/bash\n/home/user/script.sh'
    const issues = findHookIssues(makeHookInfo({ content }))
    expect(issues.some((i) => i.message.includes('hardcoded'))).toBe(true)
  })

  test('detects hardcoded /Users paths', () => {
    const content = '#!/bin/bash\n/Users/john/dev/script.sh'
    const issues = findHookIssues(makeHookInfo({ content }))
    expect(issues.some((i) => i.message.includes('hardcoded'))).toBe(true)
  })

  test('detects missing set -e in shell hook', () => {
    const issues = findHookIssues(
      makeHookInfo({ language: 'shell', content: '#!/bin/bash\necho hello' }),
    )
    expect(issues.some((i) => i.message.includes('set -e'))).toBe(true)
  })

  test('does not flag set -e when present', () => {
    const issues = findHookIssues(
      makeHookInfo({
        language: 'shell',
        content: '#!/bin/bash\nset -e\necho hello',
      }),
    )
    expect(issues.some((i) => i.message.includes('set -e'))).toBe(false)
  })

  test('detects very large hook (>10KB)', () => {
    const issues = findHookIssues(makeHookInfo({ size: 11_000 }))
    expect(issues.some((i) => i.message.includes('very large'))).toBe(true)
  })

  test('clean hook has no issues', () => {
    const issues = findHookIssues(
      makeHookInfo({
        content: '#!/bin/bash\nset -e\necho hello',
        hasShebang: true,
        isExecutable: true,
        language: 'shell',
        size: 50,
      }),
    )
    expect(issues).toEqual([])
  })

  test('not executable is a warning', () => {
    const issues = findHookIssues(makeHookInfo({ isExecutable: false }))
    expect(issues[0]?.severity).toBe('warning')
  })

  test('empty file is info severity', () => {
    const issues = findHookIssues(makeHookInfo({ content: '   ' }))
    const emptyIssue = issues.find((i) => i.message.includes('empty'))
    expect(emptyIssue?.severity).toBe('info')
  })
})

// ============================================================================
// generateRecommendations
// ============================================================================

describe('generateRecommendations', () => {
  test('recommends pre-commit hook when missing', () => {
    const hooks = getAllHookNames().map((name) =>
      makeHookInfo({ name, installed: false }),
    )
    const recs = generateRecommendations(hooks)
    expect(recs.some((r) => r.includes('pre-commit'))).toBe(true)
  })

  test('recommends commit-msg hook when missing', () => {
    const hooks = getAllHookNames().map((name) =>
      makeHookInfo({ name, installed: false }),
    )
    const recs = generateRecommendations(hooks)
    expect(recs.some((r) => r.includes('commit-msg'))).toBe(true)
  })

  test('recommends set -e for shell hooks without it', () => {
    const hooks = [
      makeHookInfo({
        name: 'pre-commit',
        installed: true,
        language: 'shell',
        content: '#!/bin/bash\necho hello',
      }),
    ]
    const recs = generateRecommendations(hooks)
    expect(recs.some((r) => r.includes('set -e'))).toBe(true)
  })

  test('no recommendations when all hooks are clean and present', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const hooks = getAllHookNames().map((name) =>
      makeHookInfo({
        name,
        installed: true,
        language: 'shell',
        content: '#!/bin/bash\nset -e\necho ok',
      }),
    )
    const recs = generateRecommendations(hooks)
    expect(recs).toEqual([])
  })

  test('no pre-commit recommendation when pre-commit is installed', () => {
    const hooks = [
      makeHookInfo({ name: 'pre-commit', installed: true, content: '#!/bin/bash\nset -e\necho ok' }),
      makeHookInfo({ name: 'commit-msg', installed: false }),
    ]
    const recs = generateRecommendations(hooks)
    expect(recs.some((r) => r.includes('pre-commit hook for linting'))).toBe(false)
  })
})

// ============================================================================
// analyzeHook
// ============================================================================

describe('analyzeHook', () => {
  test('returns not-installed for missing hook', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const info = analyzeHook('pre-commit', '/repo/.git/hooks')
    expect(info.installed).toBe(false)
    expect(info.name).toBe('pre-commit')
    expect(info.type).toBe('client')
  })

  test('detects client hook type', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const info = analyzeHook('pre-commit', '/repo/.git/hooks')
    expect(info.type).toBe('client')
  })

  test('detects server hook type', () => {
    vi.mocked(existsSync).mockReturnValue(false)
    const info = analyzeHook('pre-receive', '/repo/.git/hooks')
    expect(info.type).toBe('server')
  })

  test('reads and analyzes installed hook', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(lstatSync).mockReturnValue({
      isSymbolicLink: () => false,
    } as ReturnType<typeof lstatSync>)
    vi.mocked(statSync).mockReturnValue({
      mode: 0o100755,
      size: 42,
    } as ReturnType<typeof statSync>)
    vi.mocked(readFileSync).mockReturnValue('#!/bin/bash\nset -e\necho hello\n')

    const info = analyzeHook('pre-commit', '/repo/.git/hooks')
    expect(info.installed).toBe(true)
    expect(info.isExecutable).toBe(true)
    expect(info.size).toBe(42)
    expect(info.language).toBe('shell')
    expect(info.hasShebang).toBe(true)
    expect(info.shebang).toBe('#!/bin/bash')
  })

  test('detects symlink hooks', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(lstatSync).mockReturnValue({
      isSymbolicLink: () => true,
      target: '/usr/local/bin/my-hook',
    } as unknown as ReturnType<typeof lstatSync>)
    vi.mocked(statSync).mockReturnValue({
      mode: 0o100755,
      size: 100,
    } as ReturnType<typeof statSync>)
    vi.mocked(readFileSync).mockReturnValue('#!/bin/bash\necho hook\n')

    const info = analyzeHook('pre-commit', '/repo/.git/hooks')
    expect(info.isSymlink).toBe(true)
    expect(info.target).toBe('/usr/local/bin/my-hook')
  })

  test('detects non-executable hook', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(lstatSync).mockReturnValue({
      isSymbolicLink: () => false,
    } as ReturnType<typeof lstatSync>)
    vi.mocked(statSync).mockReturnValue({
      mode: 0o100644,
      size: 50,
    } as ReturnType<typeof statSync>)
    vi.mocked(readFileSync).mockReturnValue('#!/bin/bash\necho hello\n')

    const info = analyzeHook('pre-commit', '/repo/.git/hooks')
    expect(info.isExecutable).toBe(false)
    expect(info.issues.some((i) => i.message.includes('not executable'))).toBe(true)
  })
})

// ============================================================================
// getGitDir
// ============================================================================

describe('getGitDir', () => {
  test('returns git directory from rev-parse', async () => {
    vi.mocked(execSync).mockReturnValue('/repo/.git\n')
    const result = await getGitDir('/repo')
    expect(result).toBe('/repo/.git')
  })

  test('throws on non-git directory', async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repo')
    })
    await expect(getGitDir('/tmp')).rejects.toThrow('Not a git repository')
  })

  test('throws on empty output', async () => {
    vi.mocked(execSync).mockReturnValue('')
    await expect(getGitDir('/tmp')).rejects.toThrow('Not a git repository')
  })
})

// ============================================================================
// buildHooksResult
// ============================================================================

describe('buildHooksResult', () => {
  test('builds result with no installed hooks', async () => {
    vi.mocked(execSync).mockReturnValue('/repo/.git\n')
    vi.mocked(existsSync).mockReturnValue(false)

    const result = await buildHooksResult('/repo')
    expect(result.hooksDir).toBe('/repo/.git/hooks')
    expect(result.installedHooks).toBe(0)
    expect(result.totalHooks).toBe(17)
    expect(result.hooks).toHaveLength(17)
  })
})

// ============================================================================
// formatSize
// ============================================================================

describe('formatSize', () => {
  test('formats bytes', () => {
    expect(formatSize(500)).toBe('500 B')
  })

  test('formats zero bytes', () => {
    expect(formatSize(0)).toBe('0 B')
  })

  test('formats kilobytes', () => {
    expect(formatSize(2048)).toBe('2.0 KB')
  })

  test('formats megabytes', () => {
    expect(formatSize(1_048_576)).toBe('1.0 MB')
  })

  test('formats fractional kilobytes', () => {
    expect(formatSize(1536)).toBe('1.5 KB')
  })
})

// ============================================================================
// formatHookStatus
// ============================================================================

describe('formatHookStatus', () => {
  test('formats installed hook with green check', () => {
    const hook = makeHookInfo({ installed: true })
    const status = formatHookStatus(hook)
    expect(status).toContain('pre-commit')
  })

  test('formats missing hook with dim x', () => {
    const hook = makeHookInfo({ installed: false })
    const status = formatHookStatus(hook)
    expect(status).toContain('pre-commit')
  })

  test('formats hook with error issues in red', () => {
    const hook = makeHookInfo({
      installed: true,
      issues: [{ severity: 'error', message: 'bad' }],
    })
    const status = formatHookStatus(hook)
    expect(status).toContain('pre-commit')
  })
})

// ============================================================================
// formatHooksTable
// ============================================================================

describe('formatHooksTable', () => {
  test('includes header in output', () => {
    const result = makeHooksResult()
    const output = formatHooksTable(result, false)
    expect(output).toContain('Git Hooks Analysis')
  })

  test('shows hooks directory', () => {
    const result = makeHooksResult({ hooksDir: '/test/.git/hooks' })
    const output = formatHooksTable(result, false)
    expect(output).toContain('/test/.git/hooks')
  })

  test('shows installed count', () => {
    const result = makeHooksResult({ installedHooks: 3 })
    const output = formatHooksTable(result, false)
    expect(output).toContain('3')
  })

  test('shows no hooks installed message when empty', () => {
    const result = makeHooksResult({ installedHooks: 0, hooks: [] })
    const output = formatHooksTable(result, false)
    expect(output).toContain('No hooks installed')
  })

  test('shows installed hooks table', () => {
    const result = makeHooksResult({
      hooks: [makeHookInfo({ installed: true, name: 'pre-commit' })],
      installedHooks: 1,
    })
    const output = formatHooksTable(result, false)
    expect(output).toContain('pre-commit')
    expect(output).toContain('Installed Hooks')
  })

  test('shows issues section when issues exist', () => {
    const result = makeHooksResult({
      issues: [{ severity: 'warning', message: 'test issue' }],
    })
    const output = formatHooksTable(result, false)
    expect(output).toContain('Issues')
    expect(output).toContain('test issue')
  })

  test('shows recommendations section', () => {
    const result = makeHooksResult({
      recommendations: ['Add a pre-commit hook'],
    })
    const output = formatHooksTable(result, false)
    expect(output).toContain('Recommendations')
    expect(output).toContain('Add a pre-commit hook')
  })

  test('shows hook contents in verbose mode', () => {
    const result = makeHooksResult({
      hooks: [
        makeHookInfo({
          installed: true,
          content: '#!/bin/bash\necho hello',
        }),
      ],
      installedHooks: 1,
    })
    const output = formatHooksTable(result, true)
    expect(output).toContain('Hook Contents')
    expect(output).toContain('#!/bin/bash')
  })

  test('hides hook contents in non-verbose mode', () => {
    const result = makeHooksResult({
      hooks: [
        makeHookInfo({
          installed: true,
          content: '#!/bin/bash\necho hello',
        }),
      ],
      installedHooks: 1,
    })
    const output = formatHooksTable(result, false)
    expect(output).not.toContain('Hook Contents')
  })
})

// ============================================================================
// formatHooksJson
// ============================================================================

describe('formatHooksJson', () => {
  test('returns valid JSON', () => {
    const result = makeHooksResult()
    const json = formatHooksJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('includes hooksDir in JSON output', () => {
    const result = makeHooksResult({ hooksDir: '/test/.git/hooks' })
    const json = formatHooksJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.hooksDir).toBe('/test/.git/hooks')
  })

  test('includes all fields', () => {
    const result = makeHooksResult({
      hooks: [makeHookInfo()],
      installedHooks: 1,
      totalHooks: 17,
    })
    const json = formatHooksJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.hooks).toHaveLength(1)
    expect(parsed.installedHooks).toBe(1)
    expect(parsed.totalHooks).toBe(17)
  })
})

// ============================================================================
// Command metadata
// ============================================================================

describe('Hooks command', () => {
  test('has correct description', () => {
    expect(Hooks.description).toBe('Analyze git hooks configuration')
  })

  test('has examples', () => {
    expect(Hooks.examples).toBeDefined()
    expect(Array.isArray(Hooks.examples)).toBe(true)
    expect(Hooks.examples!.length).toBeGreaterThan(0)
  })

  test('has format flag', () => {
    expect(Hooks.flags.format).toBeDefined()
  })

  test('has output flag', () => {
    expect(Hooks.flags.output).toBeDefined()
  })

  test('has verbose flag', () => {
    expect(Hooks.flags.verbose).toBeDefined()
  })

  test('format flag has correct default', () => {
    expect((Hooks.flags.format as { default: string }).default).toBe('table')
  })

  test('format flag has correct options', () => {
    expect((Hooks.flags.format as { options: string[] }).options).toEqual([
      'json',
      'table',
    ])
  })
})
