import { describe, it, expect } from 'vitest'
import { isPluginName, parsePluginName, PLUGIN_PATTERNS, PLUGIN_PREFIX } from '../src/plugins/registry-naming.js'

// ─── PLUGIN_PREFIX ────────────────────────────────────
describe('PLUGIN_PREFIX', () => {
  it('is "codeforge-plugin-"', () => {
    expect(PLUGIN_PREFIX).toBe('codeforge-plugin-')
  })
})

// ─── PLUGIN_PATTERNS ─────────────────────────────────
describe('PLUGIN_PATTERNS', () => {
  it('has prefix pattern', () => {
    expect(PLUGIN_PATTERNS.prefix).toBe(PLUGIN_PREFIX)
  })

  it('has scoped regex pattern', () => {
    expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
  })
})

// ─── isPluginName ─────────────────────────────────────
describe('isPluginName', () => {
  it('recognizes standard plugin name', () => {
    expect(isPluginName('codeforge-plugin-foo')).toBe(true)
  })

  it('recognizes scoped plugin name', () => {
    expect(isPluginName('@scope/codeforge-plugin-bar')).toBe(true)
  })

  it('rejects non-plugin name', () => {
    expect(isPluginName('random-package')).toBe(false)
  })

  it('rejects scoped non-plugin', () => {
    expect(isPluginName('@scope/other-package')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isPluginName('')).toBe(false)
  })

  it('rejects partial prefix', () => {
    expect(isPluginName('codeforge-plug')).toBe(false)
  })
})

// ─── parsePluginName ──────────────────────────────────
describe('parsePluginName', () => {
  it('parses unscoped name', () => {
    const result = parsePluginName('codeforge-plugin-foo')
    expect(result).toEqual({ name: 'codeforge-plugin-foo', scope: null })
  })

  it('parses scoped name', () => {
    const result = parsePluginName('@myorg/codeforge-plugin-bar')
    expect(result).toEqual({ name: 'codeforge-plugin-bar', scope: '@myorg' })
  })

  it('parses simple name', () => {
    const result = parsePluginName('my-plugin')
    expect(result).toEqual({ name: 'my-plugin', scope: null })
  })

  it('accepts scoped name with @ scope', () => {
    const result = parsePluginName('@/foo')
    expect(result).toEqual({ name: 'foo', scope: '@' })
  })

  it('throws for scoped name with empty name part', () => {
    expect(() => parsePluginName('@scope/')).toThrow()
  })
})
