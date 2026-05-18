import { describe, it, expect } from 'vitest'

import {
  generateHookContent,
  getGitHookPath,
  getHuskyHookPath,
  isGitRepository,
  resolvePrecommitOptions,
  getHookDir,
  getPrecommitFrameworkConfigPath,
  generatePrecommitFrameworkConfig,
  displayPostInstallMessage,
  DEFAULT_COMMAND,
} from '../src/commands/precommit-helpers.js'

// ─── generateHookContent ──────────────────────────────
describe('generateHookContent', () => {
  it('generates git hook content with default command', () => {
    const content = generateHookContent({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    })

    expect(content).toContain('#!/usr/bin/env sh')
    expect(content).toContain(DEFAULT_COMMAND)
  })

  it('includes husky source when installer is husky', () => {
    const content = generateHookContent({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'husky',
    })

    expect(content).toContain('husky.sh')
    expect(content).toContain(DEFAULT_COMMAND)
  })

  it('does not include husky source for git installer', () => {
    const content = generateHookContent({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'git',
    })

    expect(content).not.toContain('husky.sh')
  })

  it('uses custom command', () => {
    const content = generateHookContent({
      command: 'npm test',
      force: false,
      installer: 'git',
    })

    expect(content).toContain('npm test')
    expect(content).not.toContain(DEFAULT_COMMAND)
  })
})

// ─── getGitHookPath ───────────────────────────────────
describe('getGitHookPath', () => {
  it('returns .git/hooks/pre-commit path', () => {
    expect(getGitHookPath('/project')).toBe('/project/.git/hooks/pre-commit')
  })

  it('handles relative paths', () => {
    expect(getGitHookPath('.')).toBe('.git/hooks/pre-commit')
  })
})

// ─── getHuskyHookPath ─────────────────────────────────
describe('getHuskyHookPath', () => {
  it('returns .husky/pre-commit path', () => {
    expect(getHuskyHookPath('/project')).toBe('/project/.husky/pre-commit')
  })
})

// ─── isGitRepository ──────────────────────────────────
describe('isGitRepository', () => {
  it('returns true when .git directory exists', () => {
    expect(isGitRepository('/project', () => true)).toBe(true)
  })

  it('returns false when .git directory does not exist', () => {
    expect(isGitRepository('/project', () => false)).toBe(false)
  })

  it('calls existsFn with .git path', () => {
    const existsFn = (_path: string) => {
      expect(_path).toBe('/project/.git')
      return true
    }

    isGitRepository('/project', existsFn)
  })
})

// ─── resolvePrecommitOptions ──────────────────────────
describe('resolvePrecommitOptions', () => {
  it('uses defaults for empty flags', () => {
    const options = resolvePrecommitOptions({})

    expect(options.command).toBe(DEFAULT_COMMAND)
    expect(options.force).toBe(false)
    expect(options.installer).toBe('git')
  })

  it('uses provided command', () => {
    const options = resolvePrecommitOptions({ command: 'npm test' })

    expect(options.command).toBe('npm test')
  })

  it('uses provided force flag', () => {
    const options = resolvePrecommitOptions({ force: true })

    expect(options.force).toBe(true)
  })

  it('uses provided installer', () => {
    const options = resolvePrecommitOptions({ installer: 'husky' })

    expect(options.installer).toBe('husky')
  })

  it('uses pre-commit-framework installer', () => {
    const options = resolvePrecommitOptions({ installer: 'pre-commit-framework' })

    expect(options.installer).toBe('pre-commit-framework')
  })
})

// ─── getHookDir ───────────────────────────────────────
describe('getHookDir', () => {
  it('returns .husky dir for husky installer', () => {
    const dir = getHookDir({ command: DEFAULT_COMMAND, force: false, installer: 'husky' }, '/project')
    expect(dir).toBe('/project/.husky')
  })

  it('returns .git/hooks dir for git installer', () => {
    const dir = getHookDir({ command: DEFAULT_COMMAND, force: false, installer: 'git' }, '/project')
    expect(dir).toBe('/project/.git/hooks')
  })

  it('returns cwd for pre-commit-framework installer', () => {
    const dir = getHookDir({ command: DEFAULT_COMMAND, force: false, installer: 'pre-commit-framework' }, '/project')
    expect(dir).toBe('/project')
  })
})

// ─── getPrecommitFrameworkConfigPath ──────────────────
describe('getPrecommitFrameworkConfigPath', () => {
  it('returns .pre-commit-config.yaml path', () => {
    expect(getPrecommitFrameworkConfigPath('/project')).toBe('/project/.pre-commit-config.yaml')
  })
})

// ─── generatePrecommitFrameworkConfig ─────────────────
describe('generatePrecommitFrameworkConfig', () => {
  it('generates valid YAML config', () => {
    const config = generatePrecommitFrameworkConfig({
      command: DEFAULT_COMMAND,
      force: false,
      installer: 'pre-commit-framework',
    })

    expect(config).toContain('repos:')
    expect(config).toContain('- repo: local')
    expect(config).toContain('id: codeforge')
    expect(config).toContain(DEFAULT_COMMAND)
    expect(config).toContain('language: system')
    expect(config).toContain('stages: [pre-commit]')
  })

  it('uses custom command in config', () => {
    const config = generatePrecommitFrameworkConfig({
      command: 'npm run lint',
      force: false,
      installer: 'pre-commit-framework',
    })

    expect(config).toContain('npm run lint')
  })
})

// ─── displayPostInstallMessage ────────────────────────
describe('displayPostInstallMessage', () => {
  it('outputs success message for git installer', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    displayPostInstallMessage(
      { command: DEFAULT_COMMAND, force: false, installer: 'git' },
      '/project/.git/hooks/pre-commit',
      logFn,
    )

    expect(messages.some((m) => m.includes('Created pre-commit hook'))).toBe(true)
    expect(messages.some((m) => m.includes('git commit'))).toBe(true)
    expect(messages.some((m) => m.includes('Installer: git'))).toBe(true)
  })

  it('outputs husky-specific next steps', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    displayPostInstallMessage(
      { command: DEFAULT_COMMAND, force: false, installer: 'husky' },
      '/project/.husky/pre-commit',
      logFn,
    )

    expect(messages.some((m) => m.includes('husky is installed'))).toBe(true)
  })

  it('outputs pre-commit-framework-specific next steps', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    displayPostInstallMessage(
      { command: DEFAULT_COMMAND, force: false, installer: 'pre-commit-framework' },
      '/project/.pre-commit-config.yaml',
      logFn,
    )

    expect(messages.some((m) => m.includes('pip install pre-commit'))).toBe(true)
  })

  it('includes command in output', () => {
    const messages: string[] = []
    const logFn = (msg: string) => messages.push(msg)

    displayPostInstallMessage(
      { command: 'npm test', force: false, installer: 'git' },
      '/project/.git/hooks/pre-commit',
      logFn,
    )

    expect(messages.some((m) => m.includes('npm test'))).toBe(true)
  })
})

// ─── DEFAULT_COMMAND constant ─────────────────────────
describe('DEFAULT_COMMAND', () => {
  it('has expected value', () => {
    expect(DEFAULT_COMMAND).toBe('codeforge analyze --staged')
  })
})
