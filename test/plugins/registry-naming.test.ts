import { describe, expect, it } from 'vitest'
import { PluginLoadError } from '../../src/plugins/types.js'

import {
  isPluginName,
  parsePluginName,
  PLUGIN_PATTERNS,
  PLUGIN_PREFIX,
} from '../../src/plugins/registry-naming.js'

// ─── PLUGIN_PREFIX ───

describe('PLUGIN_PREFIX', () => {
  it('is the string "codeforge-plugin-"', () => {
    expect(PLUGIN_PREFIX).toBe('codeforge-plugin-')
  })
})

// ─── PLUGIN_PATTERNS ───

describe('PLUGIN_PATTERNS', () => {
  it('exports a prefix property matching PLUGIN_PREFIX', () => {
    expect(PLUGIN_PATTERNS.prefix).toBe(PLUGIN_PREFIX)
  })

  it('exports a scoped property that is a RegExp', () => {
    expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
  })

  it('scoped pattern matches scoped plugin names', () => {
    expect(PLUGIN_PATTERNS.scoped.test('@myorg/codeforge-plugin-foo')).toBe(true)
  })

  it('scoped pattern rejects unscoped names', () => {
    expect(PLUGIN_PATTERNS.scoped.test('codeforge-plugin-foo')).toBe(false)
  })
})

// ─── isPluginName ───

describe('isPluginName', () => {
  // ─── valid prefixed names ───

  describe('valid names', () => {
    it('returns true for a prefixed plugin name', () => {
      expect(isPluginName('codeforge-plugin-foo')).toBe(true)
    })

    it('returns true for a prefixed name with multiple segments', () => {
      expect(isPluginName('codeforge-plugin-my-custom-plugin')).toBe(true)
    })

    it('returns true for a scoped plugin name', () => {
      expect(isPluginName('@scope/codeforge-plugin-bar')).toBe(true)
    })

    it('returns true for a scoped name with org-like scope', () => {
      expect(isPluginName('@my-org/codeforge-plugin-baz')).toBe(true)
    })
  })

  // ─── invalid names ───

  describe('invalid names', () => {
    it('returns false for a name without the plugin prefix', () => {
      expect(isPluginName('my-plugin')).toBe(false)
    })

    it('returns false for an empty string', () => {
      expect(isPluginName('')).toBe(false)
    })

    it('returns false for a scoped name that lacks the plugin prefix after the slash', () => {
      expect(isPluginName('@scope/other-package')).toBe(false)
    })

    it('returns false for a bare @ sign', () => {
      expect(isPluginName('@')).toBe(false)
    })

    it('returns false for a name that merely contains the prefix as a substring', () => {
      expect(isPluginName('xcodeforge-plugin-foo')).toBe(false)
    })
  })
})

// ─── parsePluginName ───

describe('parsePluginName', () => {
  // ─── unscoped names ───

  describe('unscoped name', () => {
    it('parses an unscoped name returning null scope', () => {
      const result = parsePluginName('codeforge-plugin-foo')
      expect(result).toEqual({ name: 'codeforge-plugin-foo', scope: null })
    })

    it('parses a plain package name without prefix', () => {
      const result = parsePluginName('my-plugin')
      expect(result).toEqual({ name: 'my-plugin', scope: null })
    })
  })

  // ─── scoped names ───

  describe('scoped name', () => {
    it('parses a scoped name into scope and name', () => {
      const result = parsePluginName('@scope/codeforge-plugin-bar')
      expect(result).toEqual({ name: 'codeforge-plugin-bar', scope: '@scope' })
    })

    it('parses a scoped name with a hyphenated scope', () => {
      const result = parsePluginName('@my-org/codeforge-plugin-baz')
      expect(result).toEqual({ name: 'codeforge-plugin-baz', scope: '@my-org' })
    })
  })

  // ─── invalid scoped names ───

  describe('invalid scoped name', () => {
    it('throws PluginLoadError for a scoped name missing the slash', () => {
      expect(() => parsePluginName('@scope')).toThrow(PluginLoadError)
    })

    it('throws PluginLoadError with a descriptive message', () => {
      expect(() => parsePluginName('@scope')).toThrow('Invalid scoped plugin name: @scope')
    })

    it('throws PluginLoadError for a bare @ sign', () => {
      expect(() => parsePluginName('@')).toThrow(PluginLoadError)
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('parses an empty string as an unscoped name', () => {
      const result = parsePluginName('')
      expect(result).toEqual({ name: '', scope: null })
    })

    it('parses a name with multiple slashes using only the first split', () => {
      const result = parsePluginName('@scope/pkg/extra')
      expect(result.scope).toBe('@scope')
      expect(result.name).toBe('pkg')
    })
  })
})
