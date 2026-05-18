import { describe, expect, it } from 'vitest'

import {
  DEFAULT_COMMAND,
  generateHookContent,
  generatePrecommitFrameworkConfig,
  getGitHookPath,
  getHuskyHookPath,
  getHookDir,
  isGitRepository,
  resolvePrecommitOptions,
  type PrecommitOptions,
} from '../../src/commands/precommit-helpers.js'

// ─── generateHookContent ───

describe('generateHookContent', () => {
  it('generates git hook with command', () => {
    const content = generateHookContent({
      command: 'npm test',
      force: false,
      installer: 'git',
    })
    expect(content).toContain('npm test')
    expect(content).toContain('#!/usr/bin/env sh')
  })

  it('includes husky source when installer is husky', () => {
    const content = generateHookContent({
      command: 'npm test',
      force: false,
      installer: 'husky',
    })
    expect(content).toContain('husky.sh')
  })

  it('does not include husky source for git installer', () => {
    const content = generateHookContent({
      command: 'npm test',
      force: false,
      installer: 'git',
    })
    expect(content).not.toContain('husky.sh')
  })
})

// ─── getGitHookPath ───

describe('getGitHookPath', () => {
  it('returns path to .git/hooks/pre-commit', () => {
    expect(getGitHookPath('/project')).toContain('.git')
    expect(getGitHookPath('/project')).toContain('pre-commit')
  })
})

// ─── getHuskyHookPath ───

describe('getHuskyHookPath', () => {
  it('returns path to .husky/pre-commit', () => {
    expect(getHuskyHookPath('/project')).toContain('.husky')
    expect(getHuskyHookPath('/project')).toContain('pre-commit')
  })
})

// ─── isGitRepository ───

describe('isGitRepository', () => {
  it('returns true when .git exists', () => {
    expect(isGitRepository('/project', (p) => p.endsWith('.git'))).toBe(true)
  })

  it('returns false when .git does not exist', () => {
    expect(isGitRepository('/project', () => false)).toBe(false)
  })
})

// ─── resolvePrecommitOptions ───

describe('resolvePrecommitOptions', () => {
  it('returns defaults', () => {
    const opts = resolvePrecommitOptions({})
    expect(opts.command).toBe(DEFAULT_COMMAND)
    expect(opts.force).toBe(false)
    expect(opts.installer).toBe('git')
  })

  it('uses custom command', () => {
    expect(resolvePrecommitOptions({ command: 'npm test' }).command).toBe('npm test')
  })

  it('uses force flag', () => {
    expect(resolvePrecommitOptions({ force: true }).force).toBe(true)
  })

  it('uses installer flag', () => {
    expect(resolvePrecommitOptions({ installer: 'husky' }).installer).toBe('husky')
  })
})

// ─── getHookDir ───

describe('getHookDir', () => {
  const opts = (installer: PrecommitOptions['installer']): PrecommitOptions => ({
    command: 'test',
    force: false,
    installer,
  })

  it('returns .husky for husky installer', () => {
    expect(getHookDir(opts('husky'), '/project')).toContain('.husky')
  })

  it('returns .git/hooks for git installer', () => {
    expect(getHookDir(opts('git'), '/project')).toContain('.git')
    expect(getHookDir(opts('git'), '/project')).toContain('hooks')
  })

  it('returns cwd for pre-commit-framework', () => {
    expect(getHookDir(opts('pre-commit-framework'), '/project')).toBe('/project')
  })
})

// ─── generatePrecommitFrameworkConfig ───

describe('generatePrecommitFrameworkConfig', () => {
  it('includes command in config', () => {
    const content = generatePrecommitFrameworkConfig({
      command: 'codeforge analyze --staged',
      force: false,
      installer: 'pre-commit-framework',
    })
    expect(content).toContain('codeforge analyze --staged')
    expect(content).toContain('repos:')
    expect(content).toContain('pre-commit')
  })
})
