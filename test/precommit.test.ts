import { describe, it, expect } from 'vitest'
import {
  DEFAULT_COMMAND,
  displayPostInstallMessage,
  generateHookContent,
  generatePrecommitFrameworkConfig,
  getGitHookPath,
  getHookDir,
  getHuskyHookPath,
  getPrecommitFrameworkConfigPath,
  isGitRepository,
  resolvePrecommitOptions,
  type PrecommitOptions,
} from '../src/commands/precommit-helpers.js'

// ─── generateHookContent ─────────────────────────────
describe('generateHookContent', () => {
  it('generates a shell hook with the given command for git installer', () => {
    const options: PrecommitOptions = { command: 'npm test', force: false, installer: 'git' }
    const content = generateHookContent(options)

    expect(content).toContain('#!/usr/bin/env sh')
    expect(content).toContain('npm test')
    expect(content).not.toContain('husky.sh')
  })

  it('includes husky source for husky installer', () => {
    const options: PrecommitOptions = {
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'husky',
    }
    const content = generateHookContent(options)

    expect(content).toContain('husky.sh')
  })

  it('does not include husky source for git installer', () => {
    const options: PrecommitOptions = {
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    }
    const content = generateHookContent(options)

    expect(content).not.toContain('husky.sh')
  })

  it('uses the default command when none specified', () => {
    const options: PrecommitOptions = {
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    }
    const content = generateHookContent(options)

    expect(content).toContain('codeforge analyze --staged')
  })
})

// ─── getGitHookPath ──────────────────────────────────
describe('getGitHookPath', () => {
  it('returns .git/hooks/pre-commit path', () => {
    const result = getGitHookPath('/project')

    expect(result).toContain('.git')
    expect(result).toContain('hooks')
    expect(result).toContain('pre-commit')
    expect(result.endsWith('/.git/hooks/pre-commit') || result.endsWith('\\.git\\hooks\\pre-commit')).toBe(true)
  })
})

// ─── getHuskyHookPath ────────────────────────────────
describe('getHuskyHookPath', () => {
  it('returns .husky/pre-commit path', () => {
    const result = getHuskyHookPath('/project')

    expect(result).toContain('.husky')
    expect(result).toContain('pre-commit')
  })
})

// ─── getPrecommitFrameworkConfigPath ─────────────────
describe('getPrecommitFrameworkConfigPath', () => {
  it('returns .pre-commit-config.yaml path', () => {
    const result = getPrecommitFrameworkConfigPath('/project')

    expect(result).toContain('.pre-commit-config.yaml')
  })
})

// ─── isGitRepository ─────────────────────────────────
describe('isGitRepository', () => {
  it('returns true when .git exists', () => {
    expect(isGitRepository('/project', (p) => p === '/project/.git')).toBe(true)
  })

  it('returns false when .git does not exist', () => {
    expect(isGitRepository('/project', () => false)).toBe(false)
  })
})

// ─── resolvePrecommitOptions ─────────────────────────
describe('resolvePrecommitOptions', () => {
  it('uses defaults when no flags provided', () => {
    const options = resolvePrecommitOptions({})

    expect(options.command).toBe(DEFAULT_COMMAND)
    expect(options.force).toBe(false)
    expect(options.installer).toBe('git')
  })

  it('maps flags to options', () => {
    const options = resolvePrecommitOptions({
      command: 'npm test',
      force: true,
      installer: 'husky',
    })

    expect(options.command).toBe('npm test')
    expect(options.force).toBe(true)
    expect(options.installer).toBe('husky')
  })
})

// ─── getHookDir ──────────────────────────────────────
describe('getHookDir', () => {
  it('returns .git/hooks for git installer', () => {
    const result = getHookDir({ command: '', force: false, installer: 'git' }, '/project')
    expect(result).toContain('.git')
    expect(result).toContain('hooks')
  })

  it('returns .husky for husky installer', () => {
    const result = getHookDir({ command: '', force: false, installer: 'husky' }, '/project')
    expect(result).toContain('.husky')
  })

  it('returns cwd for pre-commit-framework installer', () => {
    const result = getHookDir(
      { command: '', force: false, installer: 'pre-commit-framework' },
      '/project',
    )
    expect(result).toBe('/project')
  })
})

// ─── generatePrecommitFrameworkConfig ────────────────
describe('generatePrecommitFrameworkConfig', () => {
  it('generates valid YAML config', () => {
    const options: PrecommitOptions = { command: 'codeforge analyze', force: false, installer: 'pre-commit-framework' }
    const content = generatePrecommitFrameworkConfig(options)

    expect(content).toContain('repos:')
    expect(content).toContain('codeforge')
    expect(content).toContain('codeforge analyze')
    expect(content).toContain('pre-commit')
  })
})

// ─── displayPostInstallMessage ───────────────────────
describe('displayPostInstallMessage', () => {
  it('logs git next steps for git installer', () => {
    const logged: string[] = []
    const options: PrecommitOptions = { command: 'npm test', force: false, installer: 'git' }

    displayPostInstallMessage(options, '/hook', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('git commit'))).toBe(true)
  })

  it('logs husky next steps for husky installer', () => {
    const logged: string[] = []
    const options: PrecommitOptions = { command: 'npm test', force: false, installer: 'husky' }

    displayPostInstallMessage(options, '/hook', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('husky'))).toBe(true)
  })

  it('logs pre-commit-framework next steps', () => {
    const logged: string[] = []
    const options: PrecommitOptions = {
      command: 'npm test',
      force: false,
      installer: 'pre-commit-framework',
    }

    displayPostInstallMessage(options, '/hook', (m) => logged.push(m))

    expect(logged.some((l) => l.includes('pip install pre-commit'))).toBe(true)
  })
})
