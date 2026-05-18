import { describe, it, expect } from 'vitest'
import {
  buildCodeForgeConfig,
  formatDryRunOutput,
  formatMigrationSummary,
  formatNextSteps,
  type MigrationResult,
} from '../src/commands/migrate-helpers.js'

// ─── buildCodeForgeConfig ────────────────────────────
describe('buildCodeForgeConfig', () => {
  it('builds a config with default files and ignore patterns', () => {
    const config = buildCodeForgeConfig({ 'no-eval': 'error' })

    expect(config.files).toEqual(['**/*.ts', '**/*.tsx'])
    expect(config.ignore).toEqual(['**/node_modules/**', '**/dist/**'])
  })

  it('maps provided rules into the config', () => {
    const config = buildCodeForgeConfig({ 'no-eval': 'error', 'prefer-const': 'warning' })

    expect(config.rules).toEqual({ 'no-eval': 'error', 'prefer-const': 'warning' })
  })

  it('handles empty rules', () => {
    const config = buildCodeForgeConfig({})

    expect(config.rules).toEqual({})
  })

  it('handles rules with options tuples', () => {
    const config = buildCodeForgeConfig({ 'max-params': ['error', { max: 4 }] })

    expect(config.rules!['max-params']).toEqual(['error', { max: 4 }])
  })
})

// ─── formatMigrationSummary ──────────────────────────
describe('formatMigrationSummary', () => {
  it('logs mapped and unmapped rule counts', () => {
    const logged: string[] = []
    const result: MigrationResult = { rules: { 'no-eval': 'error' }, unmapped: [] }

    formatMigrationSummary(result, 10, (msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('Mapped rules: 1'))).toBe(true)
    expect(logged.some((l) => l.includes('Unmapped rules: 0'))).toBe(true)
  })

  it('logs unmapped rules when present', () => {
    const logged: string[] = []
    const result: MigrationResult = {
      rules: {},
      unmapped: ['foo-rule', 'bar-rule'],
    }

    formatMigrationSummary(result, 10, (msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('foo-rule'))).toBe(true)
    expect(logged.some((l) => l.includes('bar-rule'))).toBe(true)
  })

  it('truncates unmapped rules beyond maxUnmapped', () => {
    const logged: string[] = []
    const unmapped = Array.from({ length: 15 }, (_, i) => `rule-${i}`)
    const result: MigrationResult = { rules: {}, unmapped }

    formatMigrationSummary(result, 5, (msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('and 10 more'))).toBe(true)
  })

  it('does not truncate when unmapped rules fit within maxUnmapped', () => {
    const logged: string[] = []
    const result: MigrationResult = {
      rules: {},
      unmapped: ['a', 'b'],
    }

    formatMigrationSummary(result, 10, (msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('and'))).toBe(false)
  })

  it('does not show unmapped section when unmapped array is empty', () => {
    const logged: string[] = []
    const result: MigrationResult = { rules: { a: 'error' }, unmapped: [] }

    formatMigrationSummary(result, 10, (msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('Unmapped ESLint'))).toBe(false)
  })
})

// ─── formatDryRunOutput ──────────────────────────────
describe('formatDryRunOutput', () => {
  it('logs the config as formatted JSON', () => {
    const logged: string[] = []
    const config = buildCodeForgeConfig({ 'no-eval': 'error' })

    formatDryRunOutput(config, (msg) => logged.push(msg))

    const joined = logged.join('\n')
    expect(joined).toContain('no-eval')
    expect(joined).toContain('Generated config (dry run)')
  })
})

// ─── formatNextSteps ─────────────────────────────────
describe('formatNextSteps', () => {
  it('logs three numbered next steps', () => {
    const logged: string[] = []

    formatNextSteps((msg) => logged.push(msg))

    expect(logged.some((l) => l.includes('1.'))).toBe(true)
    expect(logged.some((l) => l.includes('2.'))).toBe(true)
    expect(logged.some((l) => l.includes('3.'))).toBe(true)
    expect(logged.some((l) => l.includes('codeforge analyze'))).toBe(true)
  })
})
