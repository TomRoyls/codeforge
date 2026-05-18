import { describe, it, expect } from 'vitest'
import {
  generateGitHubActionsContent,
  generateGitLabCiContent,
  resolveCiOptions,
  validateOutputDir,
  displayNextSteps,
  type CiOptions,
  type Platform,
} from '../src/commands/ci-helpers.js'
import { mkdirSync, rmSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// ─── generateGitHubActionsContent ────────────────────
describe('generateGitHubActionsContent', () => {
  it('generates valid GitHub Actions YAML', () => {
    const content = generateGitHubActionsContent()

    expect(content).toContain('name: CodeForge Analysis')
    expect(content).toContain('on:')
    expect(content).toContain('push:')
    expect(content).toContain('pull_request:')
    expect(content).toContain('jobs:')
    expect(content).toContain('analyze')
    expect(content).toContain('actions/checkout@v4')
    expect(content).toContain('codeforge analyze')
    expect(content).toContain('sarif')
  })

  it('targets main, master, and develop branches', () => {
    const content = generateGitHubActionsContent()

    expect(content).toContain('main')
    expect(content).toContain('master')
    expect(content).toContain('develop')
  })

  it('uses node 20', () => {
    const content = generateGitHubActionsContent()

    expect(content).toContain("node-version: '20'")
  })
})

// ─── generateGitLabCiContent ─────────────────────────
describe('generateGitLabCiContent', () => {
  it('generates valid GitLab CI YAML', () => {
    const content = generateGitLabCiContent()

    expect(content).toContain('stages:')
    expect(content).toContain('codeforge')
    expect(content).toContain('npm ci')
    expect(content).toContain('npx codeforge analyze')
    expect(content).toContain('gitlab')
  })

  it('uses node:20 image', () => {
    const content = generateGitLabCiContent()

    expect(content).toContain('node:20')
  })

  it('targets main, master, and develop', () => {
    const content = generateGitLabCiContent()

    expect(content).toContain('main')
    expect(content).toContain('master')
    expect(content).toContain('develop')
  })

  it('defines code quality artifacts', () => {
    const content = generateGitLabCiContent()

    expect(content).toContain('artifacts:')
    expect(content).toContain('codequality:')
  })
})

// ─── resolveCiOptions ────────────────────────────────
describe('resolveCiOptions', () => {
  it('uses defaults when no flags provided', () => {
    const options = resolveCiOptions({})

    expect(options).toEqual<CiOptions>({
      force: false,
      output: '.',
      platform: 'all',
    })
  })

  it('maps all flags to options', () => {
    const options = resolveCiOptions({
      force: true,
      output: './ci',
      platform: 'github',
    })

    expect(options).toEqual<CiOptions>({
      force: true,
      output: './ci',
      platform: 'github',
    })
  })
})

// ─── validateOutputDir ───────────────────────────────
describe('validateOutputDir', () => {
  it('returns valid for existing directory', () => {
    const result = validateOutputDir(tmpdir())

    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns invalid for non-existent path', () => {
    const result = validateOutputDir('/nonexistent/path/that/does/not/exist')

    expect(result.valid).toBe(false)
    expect(result.error).toContain('does not exist')
  })

  it('returns invalid for a file path instead of directory', () => {
    const tmpFile = join(tmpdir(), `ci-test-file-${Date.now()}`)
    require('node:fs').writeFileSync(tmpFile, 'test')

    try {
      const result = validateOutputDir(tmpFile)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('not a directory')
    } finally {
      require('node:fs').unlinkSync(tmpFile)
    }
  })
})

// ─── displayNextSteps ────────────────────────────────
describe('displayNextSteps', () => {
  it('logs three numbered next steps', () => {
    const logged: string[] = []
    displayNextSteps((m) => logged.push(m))

    expect(logged.some((l) => l.includes('1.'))).toBe(true)
    expect(logged.some((l) => l.includes('2.'))).toBe(true)
    expect(logged.some((l) => l.includes('3.'))).toBe(true)
    expect(logged.some((l) => l.includes('Next steps'))).toBe(true)
  })
})
