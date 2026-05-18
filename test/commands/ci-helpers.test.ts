import { describe, expect, it } from 'vitest'

import {
  generateGitHubActionsContent,
  generateGitLabCiContent,
  resolveCiOptions,
  type CiOptions,
} from '../../src/commands/ci-helpers.js'

// ─── generateGitHubActionsContent ───

describe('generateGitHubActionsContent', () => {
  it('contains YAML name field', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('name:')
    expect(content).toContain('CodeForge')
  })

  it('contains checkout step', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('checkout')
  })

  it('contains SARIF upload step', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('sarif')
  })

  it('contains codeforge analyze command', () => {
    const content = generateGitHubActionsContent()
    expect(content).toContain('codeforge analyze')
  })
})

// ─── generateGitLabCiContent ───

describe('generateGitLabCiContent', () => {
  it('contains stages definition', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('stages:')
  })

  it('contains codeforge job', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('codeforge')
  })

  it('contains gitlab output format', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('gitlab')
  })

  it('contains codequality report artifact', () => {
    const content = generateGitLabCiContent()
    expect(content).toContain('codequality')
  })
})

// ─── resolveCiOptions ───

describe('resolveCiOptions', () => {
  it('returns defaults for empty flags', () => {
    const result = resolveCiOptions({})
    expect(result.force).toBe(false)
    expect(result.output).toBe('.')
    expect(result.platform).toBe('all')
  })

  it('uses force flag', () => {
    expect(resolveCiOptions({ force: true }).force).toBe(true)
  })

  it('uses custom output', () => {
    expect(resolveCiOptions({ output: './ci' }).output).toBe('./ci')
  })

  it('uses platform flag', () => {
    expect(resolveCiOptions({ platform: 'github' }).platform).toBe('github')
    expect(resolveCiOptions({ platform: 'gitlab' }).platform).toBe('gitlab')
  })
})
