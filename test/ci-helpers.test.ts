import { describe, it, expect, vi } from 'vitest'
import {
  generateGitHubActionsContent,
  generateGitLabCiContent,
  validateOutputDir,
  resolveCiOptions,
  displayNextSteps,
} from '../src/commands/ci-helpers.js'

// ─── generateGitHubActionsContent ──────────────────────
describe('generateGitHubActionsContent', () => {
  it('returns a non-empty string', () => {
    const content = generateGitHubActionsContent()
    expect(content).toBeTruthy()
    expect(typeof content).toBe('string')
  })

  it('contains GitHub Actions YAML structure', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('name:')
    expect(content).toContain('on:')
    expect(content).toContain('jobs:')
    expect(content).toContain('runs-on:')
    expect(content).toContain('steps:')
  })

  it('includes checkout step', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('actions/checkout')
  })

  it('includes Node.js setup', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('actions/setup-node')
    expect(content).toContain("node-version: '20'")
  })

  it('includes SARIF upload step', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('github/codeql-action/upload-sarif')
    expect(content).toContain('sarif_file')
  })

  it('includes branch triggers', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('push:')
    expect(content).toContain('pull_request:')
    expect(content).toContain('main')
    expect(content).toContain('master')
  })

  it('includes npm ci install step', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('npm ci')
  })

  it('includes permissions block', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('permissions:')
    expect(content).toContain('contents: read')
    expect(content).toContain('security-events: write')
  })
})

// ─── generateGitLabCiContent ───────────────────────────
describe('generateGitLabCiContent', () => {
  it('returns a non-empty string', () => {
    const content = generateGitLabCiContent()
    expect(content).toBeTruthy()
    expect(typeof content).toBe('string')
  })

  it('contains GitLab CI YAML structure', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('stages:')
    expect(content).toContain('script:')
    expect(content).toContain('image:')
  })

  it('uses node:20 image', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('node:20')
  })

  it('includes artifacts configuration', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('artifacts:')
    expect(content).toContain('codequality:')
    expect(content).toContain('expire_in:')
  })

  it('includes branch filters', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('only:')
    expect(content).toContain('except:')
    expect(content).toContain('tags')
  })

  it('includes cache configuration', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('cache:')
    expect(content).toContain('node_modules/')
  })

  it('includes gitlab format output', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('--format gitlab')
    expect(content).toContain('gl-code-quality-report.json')
  })
})

// ─── validateOutputDir ─────────────────────────────────
describe('validateOutputDir', () => {
  it('returns valid for an existing directory', () => {
    const result = validateOutputDir('.')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns invalid for a non-existent directory', () => {
    const result = validateOutputDir('/non/existent/path/xyz123')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('does not exist')
  })

  it('returns invalid for a file path instead of directory', () => {
    const result = validateOutputDir('package.json')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not a directory')
  })

  it('includes the path in the error message for non-existent dir', () => {
    const result = validateOutputDir('/some/fake/dir')
    expect(result.error).toContain('/some/fake/dir')
  })

  it('includes the path in the error message for file path', () => {
    const result = validateOutputDir('package.json')
    expect(result.error).toContain('package.json')
  })
})

// ─── resolveCiOptions ──────────────────────────────────
describe('resolveCiOptions', () => {
  it('returns defaults for empty flags', () => {
    const options = resolveCiOptions({})
    expect(options.force).toBe(false)
    expect(options.output).toBe('.')
    expect(options.platform).toBe('all')
  })

  it('resolves force flag', () => {
    const options = resolveCiOptions({ force: true })
    expect(options.force).toBe(true)
  })

  it('resolves output flag', () => {
    const options = resolveCiOptions({ output: './ci-output' })
    expect(options.output).toBe('./ci-output')
  })

  it('resolves platform flag to github', () => {
    const options = resolveCiOptions({ platform: 'github' })
    expect(options.platform).toBe('github')
  })

  it('resolves platform flag to gitlab', () => {
    const options = resolveCiOptions({ platform: 'gitlab' })
    expect(options.platform).toBe('gitlab')
  })

  it('resolves all flags together', () => {
    const options = resolveCiOptions({ force: true, output: './out', platform: 'github' })
    expect(options).toEqual({
      force: true,
      output: './out',
      platform: 'github',
    })
  })
})

// ─── displayNextSteps ──────────────────────────────────
describe('displayNextSteps', () => {
  it('calls logFn with expected number of messages', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    // Empty string + "Next steps:" + 3 step lines = 5 calls
    expect(logFn).toHaveBeenCalledTimes(5)
  })

  it('starts with an empty string', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    expect(logFn).toHaveBeenNthCalledWith(1, '')
  })

  it('includes "Next steps" header', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    const calls = logFn.mock.calls.map((c) => c[0])
    const headerCall = calls.find((c) => c.includes('Next steps'))
    expect(headerCall).toBeDefined()
  })

  it('includes review step', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    const calls = logFn.mock.calls.flat()
    const hasReview = calls.some((c: string) => c.includes('Review'))
    expect(hasReview).toBe(true)
  })

  it('includes install step', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    const calls = logFn.mock.calls.flat()
    const hasInstall = calls.some((c: string) => c.includes('installed'))
    expect(hasInstall).toBe(true)
  })

  it('includes commit step', () => {
    const logFn = vi.fn()
    displayNextSteps(logFn)
    const calls = logFn.mock.calls.flat()
    const hasCommit = calls.some((c: string) => c.includes('Commit'))
    expect(hasCommit).toBe(true)
  })
})
