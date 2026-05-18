import { describe, it, expect } from 'vitest'

import {
  buildCodeForgeConfig,
  formatDryRunOutput,
  formatMigrationSummary,
  formatNextSteps,
} from '../src/commands/migrate-helpers.js'

// ─── buildCodeForgeConfig ──────────────────────────────
describe('buildCodeForgeConfig', () => {
  it('returns config with default files patterns', () => {
    const config = buildCodeForgeConfig({})
    expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
  })

  it('returns config with default ignore patterns', () => {
    const config = buildCodeForgeConfig({})
    expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
  })

  it('passes rules through', () => {
    const rules = { 'no-eval': 'error', 'prefer-const': ['warn', { destructuring: 'all' }] }
    const config = buildCodeForgeConfig(rules)
    expect(config.rules).toEqual(rules)
  })

  it('handles empty rules object', () => {
    const config = buildCodeForgeConfig({})
    expect(config.rules).toEqual({})
  })

  it('handles complex rule configs', () => {
    const rules = {
      'max-params': ['error', { max: 3 }],
      'no-console': 'warn',
    }
    const config = buildCodeForgeConfig(rules)
    expect(config.rules).toEqual(rules)
  })
})

// ─── formatMigrationSummary ────────────────────────────
describe('formatMigrationSummary', () => {
  it('logs mapped and unmapped rule counts', () => {
    const logs: string[] = []
    const result = { rules: { 'no-eval': 'error' }, unmapped: [] }

    formatMigrationSummary(result, 10, (msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('Mapped rules: 1'))).toBe(true)
    expect(logs.some((l) => l.includes('Unmapped rules: 0'))).toBe(true)
  })

  it('does not show unmapped list when empty', () => {
    const logs: string[] = []
    const result = { rules: {}, unmapped: [] }

    formatMigrationSummary(result, 10, (msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('Unmapped ESLint rules:'))).toBe(false)
  })

  it('shows unmapped rules up to maxUnmapped', () => {
    const logs: string[] = []
    const result = {
      rules: {},
      unmapped: ['rule-a', 'rule-b', 'rule-c', 'rule-d'],
    }

    formatMigrationSummary(result, 2, (msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('rule-a'))).toBe(true)
    expect(logs.some((l) => l.includes('rule-b'))).toBe(true)
    expect(logs.some((l) => l.includes('rule-c'))).toBe(false)
    expect(logs.some((l) => l.includes('and 2 more'))).toBe(true)
  })

  it('shows all unmapped rules when within limit', () => {
    const logs: string[] = []
    const result = {
      rules: {},
      unmapped: ['rule-a', 'rule-b'],
    }

    formatMigrationSummary(result, 10, (msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('rule-a'))).toBe(true)
    expect(logs.some((l) => l.includes('rule-b'))).toBe(true)
    expect(logs.some((l) => l.includes('more'))).toBe(false)
  })

  it('includes blank lines for spacing', () => {
    const logs: string[] = []
    const result = { rules: {}, unmapped: [] }

    formatMigrationSummary(result, 5, (msg) => logs.push(msg))

    expect(logs.filter((l) => l === '').length).toBeGreaterThanOrEqual(1)
  })
})

// ─── formatDryRunOutput ────────────────────────────────
describe('formatDryRunOutput', () => {
  it('logs the config as formatted JSON', () => {
    const logs: string[] = []
    const config = {
      files: ['**/*.ts'],
      ignore: ['**/node_modules/**'],
      rules: { 'no-eval': 'error' },
    }

    formatDryRunOutput(config, (msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('Generated config (dry run):'))).toBe(true)
    const jsonLine = logs.find((l) => l.includes('"no-eval"'))
    expect(jsonLine).toBeTruthy()
  })

  it('includes indented JSON output', () => {
    const logs: string[] = []
    const config = { files: ['**/*.ts'], ignore: [], rules: {} }

    formatDryRunOutput(config, (msg) => logs.push(msg))

    const fullOutput = logs.join('\n')
    expect(fullOutput).toContain('  "files"')
  })

  it('starts with a blank line', () => {
    const logs: string[] = []
    formatDryRunOutput({ files: [], rules: {} }, (msg) => logs.push(msg))
    expect(logs[0]).toBe('')
  })
})

// ─── formatNextSteps ───────────────────────────────────
describe('formatNextSteps', () => {
  it('logs all three next steps', () => {
    const logs: string[] = []

    formatNextSteps((msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('Review the generated configuration'))).toBe(true)
    expect(logs.some((l) => l.includes('codeforge analyze'))).toBe(true)
    expect(logs.some((l) => l.includes('Address any unmapped rules'))).toBe(true)
  })

  it('includes a bold header', () => {
    const logs: string[] = []

    formatNextSteps((msg) => logs.push(msg))

    expect(logs.some((l) => l.includes('Next steps:'))).toBe(true)
  })

  it('starts with a blank line', () => {
    const logs: string[] = []

    formatNextSteps((msg) => logs.push(msg))

    expect(logs[0]).toBe('')
  })
})
