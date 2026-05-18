import { describe, expect, it } from 'vitest'

import {
  buildCodeForgeConfig,
  type MigrationResult,
} from '../../src/commands/migrate-helpers.js'

// ─── buildCodeForgeConfig ───

describe('buildCodeForgeConfig', () => {
  it('includes default file patterns', () => {
    const config = buildCodeForgeConfig({})
    expect(config.files).toContain('**/*.ts')
    expect(config.files).toContain('**/*.tsx')
  })

  it('includes default ignore patterns', () => {
    const config = buildCodeForgeConfig({})
    expect(config.ignore).toContain('**/node_modules/**')
    expect(config.ignore).toContain('**/dist/**')
  })

  it('passes rules through', () => {
    const config = buildCodeForgeConfig({ 'no-eval': 'error' })
    expect(config.rules).toEqual({ 'no-eval': 'error' })
  })

  it('handles empty rules', () => {
    const config = buildCodeForgeConfig({})
    expect(Object.keys(config.rules)).toHaveLength(0)
  })

  it('handles multiple rules', () => {
    const config = buildCodeForgeConfig({ 'no-eval': 'error', 'max-params': 'warning' })
    expect(Object.keys(config.rules)).toHaveLength(2)
  })
})
