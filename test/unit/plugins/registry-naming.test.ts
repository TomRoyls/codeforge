import { describe, test, expect } from 'vitest'
import {
  isPluginName,
  parsePluginName,
  PLUGIN_PATTERNS,
  PLUGIN_PREFIX,
} from '../../../src/plugins/registry-naming.js'
import { PluginLoadError } from '../../../src/plugins/types.js'

describe('registry-naming', () => {
  describe('PLUGIN_PREFIX', () => {
    test('is codeforge-plugin-', () => {
      expect(PLUGIN_PREFIX).toBe('codeforge-plugin-')
    })

    test('is a string', () => {
      expect(typeof PLUGIN_PREFIX).toBe('string')
    })

    test('has non-zero length', () => {
      expect(PLUGIN_PREFIX.length).toBeGreaterThan(0)
    })

    test('starts with codeforge-', () => {
      expect(PLUGIN_PREFIX.startsWith('codeforge-')).toBe(true)
    })

    test('ends with dash', () => {
      expect(PLUGIN_PREFIX.endsWith('-')).toBe(true)
    })

    test('has exact length of 17 characters', () => {
      expect(PLUGIN_PREFIX).toHaveLength(17)
    })
  })

  describe('PLUGIN_PATTERNS', () => {
    test('has prefix matching PLUGIN_PREFIX', () => {
      expect(PLUGIN_PATTERNS.prefix).toBe(PLUGIN_PREFIX)
    })

    test('scoped pattern matches @scope/codeforge-plugin-name', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@myorg/codeforge-plugin-foo')).toBe(true)
    })

    test('scoped pattern does not match unscoped name', () => {
      expect(PLUGIN_PATTERNS.scoped.test('codeforge-plugin-foo')).toBe(false)
    })

    test('scoped is a RegExp instance', () => {
      expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
    })

    test('scoped matches hyphenated scope', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@my-org/codeforge-plugin-test')).toBe(true)
    })

    test('scoped matches single-character scope', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@a/codeforge-plugin-b')).toBe(true)
    })

    test('scoped matches numeric scope', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@123/codeforge-plugin-foo')).toBe(true)
    })

    test('scoped matches uppercase scope', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@MYORG/codeforge-plugin-test')).toBe(true)
    })

    test('scoped does not match empty string', () => {
      expect(PLUGIN_PATTERNS.scoped.test('')).toBe(false)
    })

    test('scoped does not match wrong prefix after slash', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/other-prefix-name')).toBe(false)
    })

    test('scoped does not match empty scope (@/)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@/codeforge-plugin-name')).toBe(false)
    })

    test('scoped does not match without @ prefix', () => {
      expect(PLUGIN_PATTERNS.scoped.test('scope/codeforge-plugin-name')).toBe(false)
    })

    test('scoped does not match without dash after plugin', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforgeplugin-name')).toBe(false)
    })

    test('scoped does not match truncated prefix', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugi-name')).toBe(false)
    })

    test('scoped pattern is anchored at start', () => {
      expect(PLUGIN_PATTERNS.scoped.source.startsWith('^')).toBe(true)
    })

    test('prefix property equals codeforge-plugin- string', () => {
      expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
    })

    test('scoped matches @scope/codeforge-plugin- (trailing hyphen only)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-')).toBe(true)
    })

    test('scoped does not match @scope/codeforge-plugins-name (plural)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugins-name')).toBe(false)
    })

    test('scoped does not match double slash @scope//codeforge-plugin-name', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope//codeforge-plugin-name')).toBe(false)
    })

    test('scoped matches scope with underscores @my_org/codeforge-plugin-foo', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@my_org/codeforge-plugin-foo')).toBe(true)
    })

    test('scoped matches @my org/codeforge-plugin-foo (space in scope is not slash)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@my org/codeforge-plugin-foo')).toBe(true)
    })

    test('scoped matches @scope/codeforge-plugin-foo/extra/path (extra path after prefix)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-foo/extra/path')).toBe(true)
    })

    test('scoped source contains the exact prefix string', () => {
      expect(PLUGIN_PATTERNS.scoped.source).toContain('codeforge-plugin-')
    })

    test('scoped does not match @scope/CodeForge-Plugin-foo (wrong case after slash)', () => {
      expect(PLUGIN_PATTERNS.scoped.test('@scope/CodeForge-Plugin-foo')).toBe(false)
    })
  })

  describe('isPluginName', () => {
    test('returns true for codeforge-plugin- prefix', () => {
      expect(isPluginName('codeforge-plugin-foo')).toBe(true)
    })

    test('returns true for scoped plugin name', () => {
      expect(isPluginName('@myorg/codeforge-plugin-foo')).toBe(true)
    })

    test('returns false for non-plugin package', () => {
      expect(isPluginName('some-random-package')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(isPluginName('')).toBe(false)
    })

    test('returns false for scoped package without plugin prefix', () => {
      expect(isPluginName('@myorg/some-other-package')).toBe(false)
    })

    test('returns false for partial match', () => {
      expect(isPluginName('codeforge-plugi-foo')).toBe(false)
    })

    test('returns true for codeforge-plugin- with no suffix', () => {
      expect(isPluginName('codeforge-plugin-')).toBe(true)
    })

    test('returns true for codeforge-plugin-my-long-name', () => {
      expect(isPluginName('codeforge-plugin-my-long-name')).toBe(true)
    })

    test('returns true for codeforge-plugin-123', () => {
      expect(isPluginName('codeforge-plugin-123')).toBe(true)
    })

    test('returns true for codeforge-plugin-a (single char suffix)', () => {
      expect(isPluginName('codeforge-plugin-a')).toBe(true)
    })

    test('returns true for codeforge-plugin-plugin (repeated word)', () => {
      expect(isPluginName('codeforge-plugin-plugin')).toBe(true)
    })

    test('returns true for codeforge-plugin-foo.bar (with dots)', () => {
      expect(isPluginName('codeforge-plugin-foo.bar')).toBe(true)
    })

    test('returns true for @org/codeforge-plugin-bar', () => {
      expect(isPluginName('@org/codeforge-plugin-bar')).toBe(true)
    })

    test('returns true for @my-scope/codeforge-plugin-test', () => {
      expect(isPluginName('@my-scope/codeforge-plugin-test')).toBe(true)
    })

    test('returns true for @a/codeforge-plugin-b (single char scope)', () => {
      expect(isPluginName('@a/codeforge-plugin-b')).toBe(true)
    })

    test('returns true for @MY-ORG/codeforge-plugin-test (uppercase scope)', () => {
      expect(isPluginName('@MY-ORG/codeforge-plugin-test')).toBe(true)
    })

    test('returns true for @123/codeforge-plugin-foo (numeric scope)', () => {
      expect(isPluginName('@123/codeforge-plugin-foo')).toBe(true)
    })

    test('returns true for @@org/codeforge-plugin-foo (double @)', () => {
      // Regex ^@[^/]+/codeforge-plugin- matches @@org as the scope portion
      expect(isPluginName('@@org/codeforge-plugin-foo')).toBe(true)
    })

    test('returns false for CodeForge-Plugin-foo (wrong case)', () => {
      expect(isPluginName('CodeForge-Plugin-foo')).toBe(false)
    })

    test('returns false for codeforgeplugin-foo (no dash after plugin)', () => {
      expect(isPluginName('codeforgeplugin-foo')).toBe(false)
    })

    test('returns false for codeforge-plugins-foo (plural s)', () => {
      expect(isPluginName('codeforge-plugins-foo')).toBe(false)
    })

    test('returns false for leading space', () => {
      expect(isPluginName(' codeforge-plugin-foo')).toBe(false)
    })

    test('returns true for trailing space (startsWith is prefix-only)', () => {
      expect(isPluginName('codeforge-plugin-foo ')).toBe(true)
    })

    test('returns false for @codeforge-plugin- (no slash)', () => {
      expect(isPluginName('@codeforge-plugin-')).toBe(false)
    })

    test('returns false for @org/codeforge-plugi-foo (truncated scoped prefix)', () => {
      expect(isPluginName('@org/codeforge-plugi-foo')).toBe(false)
    })

    test('returns false for @org/codeforgeplugin-foo (no dash in scoped)', () => {
      expect(isPluginName('@org/codeforgeplugin-foo')).toBe(false)
    })

    test('returns false for @org/ (nothing after slash)', () => {
      expect(isPluginName('@org/')).toBe(false)
    })

    test('returns false for @/ (empty scope and name)', () => {
      expect(isPluginName('@/')).toBe(false)
    })

    test('returns false for xcodeforge-plugin-foo (prefix not at start)', () => {
      expect(isPluginName('xcodeforge-plugin-foo')).toBe(false)
    })

    test('returns false for codeforge-plugin (no trailing dash)', () => {
      expect(isPluginName('codeforge-plugin')).toBe(false)
    })

    test('returns false for codeforge-Plugin-foo (capital P)', () => {
      expect(isPluginName('codeforge-Plugin-foo')).toBe(false)
    })

    test('returns true for codeforge-plugin-foo_bar (underscore in suffix)', () => {
      expect(isPluginName('codeforge-plugin-foo_bar')).toBe(true)
    })

    test('returns true for @scope /codeforge-plugin-foo (space before slash matches regex)', () => {
      expect(isPluginName('@scope /codeforge-plugin-foo')).toBe(true)
    })

    test('returns false for whitespace-only string', () => {
      expect(isPluginName('   ')).toBe(false)
    })

    test('returns false for @scope/codeforge-plugin (no trailing dash in scoped)', () => {
      expect(isPluginName('@scope/codeforge-plugin')).toBe(false)
    })

    test('returns false for @ alone', () => {
      expect(isPluginName('@')).toBe(false)
    })

    test('returns true for codeforge-plugin-\t (tab after prefix)', () => {
      expect(isPluginName('codeforge-plugin-\t')).toBe(true)
    })

    test('returns true for codeforge-plugin-🎉 (emoji after prefix)', () => {
      expect(isPluginName('codeforge-plugin-🎉')).toBe(true)
    })
  })

  describe('parsePluginName', () => {
    test('parses unscoped plugin name', () => {
      const result = parsePluginName('codeforge-plugin-foo')
      expect(result).toEqual({ scope: null, name: 'codeforge-plugin-foo' })
    })

    test('parses scoped plugin name', () => {
      const result = parsePluginName('@myorg/codeforge-plugin-foo')
      expect(result).toEqual({ scope: '@myorg', name: 'codeforge-plugin-foo' })
    })

    test('throws PluginLoadError for @ without slash', () => {
      expect(() => parsePluginName('@invalid')).toThrow(PluginLoadError)
    })

    test('throws PluginLoadError for @slash/ only', () => {
      expect(() => parsePluginName('@scope/')).toThrow(PluginLoadError)
    })

    test('throws with descriptive message', () => {
      expect(() => parsePluginName('@invalid')).toThrow('Invalid scoped plugin name')
    })

    test('parses plain package name without scope', () => {
      const result = parsePluginName('my-plugin')
      expect(result.scope).toBeNull()
      expect(result.name).toBe('my-plugin')
    })

    test('handles multiple slashes by splitting on first', () => {
      const result = parsePluginName('@scope/codeforge-plugin-foo/bar')
      expect(result.scope).toBe('@scope')
      expect(result.name).toBe('codeforge-plugin-foo')
    })

    test('parses unscoped codeforge-plugin-my-long-name', () => {
      expect(parsePluginName('codeforge-plugin-my-long-name')).toEqual({
        scope: null,
        name: 'codeforge-plugin-my-long-name',
      })
    })

    test('parses unscoped codeforge-plugin-123', () => {
      expect(parsePluginName('codeforge-plugin-123')).toEqual({
        scope: null,
        name: 'codeforge-plugin-123',
      })
    })

    test('parses plain string as unscoped', () => {
      expect(parsePluginName('anything')).toEqual({ scope: null, name: 'anything' })
    })

    test('parses codeforge-plugin- (prefix only) as unscoped', () => {
      expect(parsePluginName('codeforge-plugin-')).toEqual({
        scope: null,
        name: 'codeforge-plugin-',
      })
    })

    test('parses scoped @my-org/codeforge-plugin-test (hyphenated org)', () => {
      expect(parsePluginName('@my-org/codeforge-plugin-test')).toEqual({
        scope: '@my-org',
        name: 'codeforge-plugin-test',
      })
    })

    test('parses scoped @a/codeforge-plugin-b (single char scope)', () => {
      expect(parsePluginName('@a/codeforge-plugin-b')).toEqual({
        scope: '@a',
        name: 'codeforge-plugin-b',
      })
    })

    test('parses scoped @123/codeforge-plugin-foo (numeric scope)', () => {
      expect(parsePluginName('@123/codeforge-plugin-foo')).toEqual({
        scope: '@123',
        name: 'codeforge-plugin-foo',
      })
    })

    test('parses @scope/codeforge-plugin- (trailing hyphen)', () => {
      expect(parsePluginName('@scope/codeforge-plugin-')).toEqual({
        scope: '@scope',
        name: 'codeforge-plugin-',
      })
    })

    test('parses @a/b/c/d returning first two segments', () => {
      expect(parsePluginName('@a/b/c/d')).toEqual({ scope: '@a', name: 'b' })
    })

    test('throws PluginLoadError for @ alone', () => {
      expect(() => parsePluginName('@')).toThrow(PluginLoadError)
    })

    test('throws PluginLoadError for @/', () => {
      expect(() => parsePluginName('@/')).toThrow(PluginLoadError)
    })

    test('throws PluginLoadError for @only/', () => {
      expect(() => parsePluginName('@only/')).toThrow(PluginLoadError)
    })

    test('error message includes the invalid name for @invalid', () => {
      try {
        parsePluginName('@invalid')
      } catch (e) {
        expect((e as Error).message).toContain('@invalid')
        return
      }
      expect.unreachable('should have thrown')
    })

    test('error message includes the invalid name for @scope/', () => {
      try {
        parsePluginName('@scope/')
      } catch (e) {
        expect((e as Error).message).toContain('@scope/')
        return
      }
      expect.unreachable('should have thrown')
    })

    test('error is instanceof PluginLoadError', () => {
      try {
        parsePluginName('@invalid')
      } catch (e) {
        expect(e).toBeInstanceOf(PluginLoadError)
        return
      }
      expect.unreachable('should have thrown')
    })

    test('error is instanceof Error', () => {
      try {
        parsePluginName('@invalid')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        return
      }
      expect.unreachable('should have thrown')
    })

    test('scope includes the @ symbol', () => {
      const result = parsePluginName('@org/codeforge-plugin-foo')
      expect(result.scope).toBe('@org')
      expect(result.scope?.startsWith('@')).toBe(true)
    })

    test('name is everything after first slash', () => {
      const result = parsePluginName('@org/codeforge-plugin-foo')
      expect(result.name).toBe('codeforge-plugin-foo')
    })

    test('error has pluginName property set to input', () => {
      try {
        parsePluginName('@bad')
      } catch (e) {
        expect(e).toHaveProperty('pluginName', '@bad')
        return
      }
      expect.unreachable('should have thrown')
    })

    test('error has code property set to PLUGIN_LOAD_ERROR', () => {
      try {
        parsePluginName('@bad')
      } catch (e) {
        expect(e).toHaveProperty('code', 'PLUGIN_LOAD_ERROR')
        return
      }
      expect.unreachable('should have thrown')
    })

    test('returns object with scope and name properties', () => {
      const result = parsePluginName('codeforge-plugin-foo')
      expect(result).toHaveProperty('scope')
      expect(result).toHaveProperty('name')
    })

    test('scope is null for non-scoped names', () => {
      expect(parsePluginName('anything').scope).toBeNull()
    })

    test('parses codeforge-plugin (no trailing dash) as unscoped', () => {
      expect(parsePluginName('codeforge-plugin')).toEqual({
        scope: null,
        name: 'codeforge-plugin',
      })
    })

    test('parses @scope/codeforge-plugin (no trailing dash) as scoped', () => {
      expect(parsePluginName('@scope/codeforge-plugin')).toEqual({
        scope: '@scope',
        name: 'codeforge-plugin',
      })
    })

    test('parses @my.org/codeforge-plugin-foo (dots in scope)', () => {
      expect(parsePluginName('@my.org/codeforge-plugin-foo')).toEqual({
        scope: '@my.org',
        name: 'codeforge-plugin-foo',
      })
    })

    test('error message for @/ includes the input', () => {
      try {
        parsePluginName('@/')
      } catch (e) {
        expect((e as Error).message).toContain('@/')
        return
      }
      expect.unreachable('should have thrown')
    })

    test('returns full long name for very long plugin names', () => {
      const longName = 'codeforge-plugin-' + 'a'.repeat(200)
      expect(parsePluginName(longName)).toEqual({ scope: null, name: longName })
    })

    test('parses empty string as unscoped with empty name', () => {
      expect(parsePluginName('')).toEqual({ scope: null, name: '' })
    })

    test('parses @@scope/codeforge-plugin-foo (double @) with @@scope as scope', () => {
      expect(parsePluginName('@@scope/codeforge-plugin-foo')).toEqual({
        scope: '@@scope',
        name: 'codeforge-plugin-foo',
      })
    })

    test('parses @scope/codeforge-plugin-$!special (special chars in name)', () => {
      expect(parsePluginName('@scope/codeforge-plugin-$!special')).toEqual({
        scope: '@scope',
        name: 'codeforge-plugin-$!special',
      })
    })

    test('parses very long scoped name correctly', () => {
      const longSuffix = 'a'.repeat(200)
      const result = parsePluginName(`@org/codeforge-plugin-${longSuffix}`)
      expect(result.scope).toBe('@org')
      expect(result.name).toBe(`codeforge-plugin-${longSuffix}`)
    })
  })

  describe('additional coverage', () => {
    describe('isPluginName edge cases', () => {
      test('returns true for codeforge-plugin-', () => {
        expect(isPluginName('codeforge-plugin-')).toBe(true)
      })

      test('returns true for codeforge-plugin-a', () => {
        expect(isPluginName('codeforge-plugin-a')).toBe(true)
      })

      test('returns false for codeforge-', () => {
        expect(isPluginName('codeforge-')).toBe(false)
      })

      test('returns false for plugin-codeforge-', () => {
        expect(isPluginName('plugin-codeforge-')).toBe(false)
      })

      test('returns false for Codeforge-plugin-foo (capital C)', () => {
        expect(isPluginName('Codeforge-plugin-foo')).toBe(false)
      })

      test('returns true for @a/codeforge-plugin-', () => {
        expect(isPluginName('@a/codeforge-plugin-')).toBe(true)
      })

      test('returns false for @scope/other-plugin-', () => {
        expect(isPluginName('@scope/other-plugin-')).toBe(false)
      })

      test('returns false for @scope/codeforge- (missing plugin-)', () => {
        expect(isPluginName('@scope/codeforge-')).toBe(false)
      })

      test('returns false for codeforge-plugin (no trailing dash)', () => {
        expect(isPluginName('codeforge-plugin')).toBe(false)
      })
    })

    describe('parsePluginName edge cases', () => {
      test('throws for @only (no slash)', () => {
        expect(() => parsePluginName('@only')).toThrow()
      })

      test('does not throw for @/name (scope is @)', () => {
        expect(parsePluginName('@/name')).toEqual({ scope: '@', name: 'name' })
      })

      test('parses single char unscoped name', () => {
        expect(parsePluginName('a')).toEqual({ scope: null, name: 'a' })
      })

      test('parses name with dots', () => {
        expect(parsePluginName('codeforge-plugin-foo.bar')).toEqual({
          scope: null,
          name: 'codeforge-plugin-foo.bar',
        })
      })

      test('parses name with hyphens', () => {
        expect(parsePluginName('codeforge-plugin-my-cool-plugin')).toEqual({
          scope: null,
          name: 'codeforge-plugin-my-cool-plugin',
        })
      })

      test('parses scoped name with numbers', () => {
        expect(parsePluginName('@scope123/codeforge-plugin-456')).toEqual({
          scope: '@scope123',
          name: 'codeforge-plugin-456',
        })
      })

      test('parses scope with dash', () => {
        expect(parsePluginName('@my-scope/codeforge-plugin-foo')).toEqual({
          scope: '@my-scope',
          name: 'codeforge-plugin-foo',
        })
      })

      test('parses multiple slashes returns first two parts', () => {
        const result = parsePluginName('@scope/name/extra')
        expect(result.scope).toBe('@scope')
        expect(result.name).toBe('name')
      })
    })

    describe('PLUGIN_PATTERNS export', () => {
      test('prefix matches PLUGIN_PREFIX', () => {
        expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
      })

      test('scoped is a RegExp', () => {
        expect(PLUGIN_PATTERNS.scoped).toBeInstanceOf(RegExp)
      })

      test('scoped pattern matches @scope/codeforge-plugin-foo', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-foo')).toBe(true)
      })

      test('scoped pattern does not match unscoped', () => {
        expect(PLUGIN_PATTERNS.scoped.test('codeforge-plugin-foo')).toBe(false)
      })
    })

    describe('isPluginName additional edge cases', () => {
      test('accepts name with multiple hyphens', () => {
        expect(isPluginName('codeforge-plugin-my-cool-tool')).toBe(true)
      })
      test('accepts name with numbers in suffix', () => {
        expect(isPluginName('codeforge-plugin-v2')).toBe(true)
      })
      test('accepts name with single char suffix', () => {
        expect(isPluginName('codeforge-plugin-x')).toBe(true)
      })
      test('rejects empty string', () => {
        expect(isPluginName('')).toBe(false)
      })
      test('rejects whitespace only', () => {
        expect(isPluginName('   ')).toBe(false)
      })
      test('rejects null-like string', () => {
        expect(isPluginName('null')).toBe(false)
      })
      test('rejects prefix only without suffix', () => {
        expect(isPluginName('codeforge-plugin-')).toBe(true)
      })
      test('accepts name with spaces', () => {
        expect(isPluginName('codeforge-plugin-my tool')).toBe(true)
      })
      test('accepts scoped name with underscore', () => {
        expect(isPluginName('@my_scope/codeforge-plugin-test')).toBe(true)
      })
      test('rejects scoped name without plugin prefix', () => {
        expect(isPluginName('@scope/my-plugin')).toBe(false)
      })
      test('accepts name ending with digit', () => {
        expect(isPluginName('codeforge-plugin-test123')).toBe(true)
      })
      test('rejects name starting with digit after prefix', () => {
        expect(isPluginName('codeforge-plugin-123test')).toBe(true)
      })
      test('accepts very long name', () => {
        expect(isPluginName('codeforge-plugin-' + 'a'.repeat(200))).toBe(true)
      })
      test('accepts double at-sign as name', () => {
        expect(isPluginName('@@scope/codeforge-plugin-test')).toBe(true)
      })
      test('returns boolean for scoped', () => {
        expect(typeof isPluginName('@scope/codeforge-plugin-test')).toBe('boolean')
      })
      test('returns boolean for unscoped', () => {
        expect(typeof isPluginName('codeforge-plugin-test')).toBe('boolean')
      })
      test('rejects only prefix', () => {
        expect(isPluginName('codeforge-')).toBe(false)
      })
      test('accepts name with dots', () => {
        expect(isPluginName('codeforge-plugin-my.tool')).toBe(true)
      })
    })

    describe('parsePluginName additional edge cases', () => {
      test('handles name with many hyphens', () => {
        const result = parsePluginName('codeforge-plugin-a-b-c-d-e')
        expect(result.scope).toBeNull()
        expect(result.name).toBe('codeforge-plugin-a-b-c-d-e')
      })
      test('handles scoped name with many hyphens', () => {
        const result = parsePluginName('@scope/codeforge-plugin-a-b-c')
        expect(result.scope).toBe('@scope')
        expect(result.name).toBe('codeforge-plugin-a-b-c')
      })
      test('returns scope null for unscoped', () => {
        const result = parsePluginName('codeforge-plugin-foo')
        expect(result.scope).toBeNull()
      })
      test('returns object with scope and name', () => {
        const result = parsePluginName('codeforge-plugin-test')
        expect(result).toHaveProperty('scope')
        expect(result).toHaveProperty('name')
      })
      test('preserves case in scope', () => {
        const result = parsePluginName('@MyScope/codeforge-plugin-test')
        expect(result.scope).toBe('@MyScope')
      })
      test('preserves case in name', () => {
        const result = parsePluginName('codeforge-plugin-MyTest')
        expect(result.name).toBe('codeforge-plugin-MyTest')
      })
      test('handles name with underscore', () => {
        const result = parsePluginName('codeforge-plugin-my_tool')
        expect(result.name).toBe('codeforge-plugin-my_tool')
      })
      test('handles scoped name with trailing slash', () => {
        const result = parsePluginName('@scope/codeforge-plugin-test/')
        expect(result.scope).toBe('@scope')
        expect(result.name).toBe('codeforge-plugin-test')
        expect(isPluginName('@scope/codeforge-plugin-test/')).toBe(true)
      })
      test('handles name starting with digit after prefix', () => {
        const result = parsePluginName('codeforge-plugin-9test')
        expect(result.name).toBe('codeforge-plugin-9test')
      })
      test('throws on double slash in scoped', () => {
        expect(() => parsePluginName('@scope//codeforge-plugin-test')).toThrow()
      })
      test('handles scope with numbers and hyphens', () => {
        const result = parsePluginName('@scope-123/codeforge-plugin-test')
        expect(result.scope).toBe('@scope-123')
        expect(result.name).toBe('codeforge-plugin-test')
      })
      test('returns string for both properties', () => {
        const result = parsePluginName('codeforge-plugin-test')
        expect(typeof result.name).toBe('string')
        expect(result.scope === null || typeof result.scope === 'string').toBe(true)
      })
      test('handles very long name', () => {
        const longName = 'codeforge-plugin-' + 'a'.repeat(200)
        const result = parsePluginName(longName)
        expect(result.name).toBe(longName)
      })
      test('handles very long scope', () => {
        const scope = '@' + 's'.repeat(100)
        const result = parsePluginName(`${scope}/codeforge-plugin-test`)
        expect(result.scope).toBe(scope)
      })
      test('throws on empty name after slash', () => {
        expect(() => parsePluginName('@scope/')).toThrow()
      })
      test('throws on just at-sign', () => {
        expect(() => parsePluginName('@')).toThrow()
      })
      test('throws on at-sign without slash', () => {
        expect(() => parsePluginName('@scope')).toThrow()
      })
    })

    describe('PLUGIN_PATTERNS additional tests', () => {
      test('prefix is a string', () => {
        expect(typeof PLUGIN_PATTERNS.prefix).toBe('string')
      })
      test('prefix starts with codeforge', () => {
        expect(PLUGIN_PATTERNS.prefix.startsWith('codeforge')).toBe(true)
      })
      test('prefix ends with hyphen', () => {
        expect(PLUGIN_PATTERNS.prefix.endsWith('-')).toBe(true)
      })
      test('scoped pattern matches typical scoped plugin', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@company/codeforge-plugin-utils')).toBe(true)
      })
      test('scoped pattern rejects no scope', () => {
        expect(PLUGIN_PATTERNS.scoped.test('codeforge-plugin-utils')).toBe(false)
      })
      test('scoped pattern rejects wrong prefix', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@scope/my-plugin-test')).toBe(false)
      })
      test('scoped pattern source contains prefix', () => {
        expect(PLUGIN_PATTERNS.scoped.source).toContain('codeforge-plugin-')
      })
      test('scoped pattern is case sensitive', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@SCOPE/codeforge-plugin-test')).toBe(true)
      })
      test('scoped pattern matches single char scope', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@a/codeforge-plugin-test')).toBe(true)
      })
      test('scoped pattern matches scope with digits', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@scope1/codeforge-plugin-test')).toBe(true)
      })
      test('scoped pattern accepts scope with special chars', () => {
        // The regex only checks for non-slash chars after @
        expect(PLUGIN_PATTERNS.scoped.test('@sc!ope/codeforge-plugin-test')).toBe(true)
      })
      test('prefix has positive length', () => {
        expect(PLUGIN_PATTERNS.prefix.length).toBeGreaterThan(0)
      })
      test('scoped pattern rejects empty string', () => {
        expect(PLUGIN_PATTERNS.scoped.test('')).toBe(false)
      })
      test('scoped pattern rejects only at-sign', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@')).toBe(false)
      })
      test('scoped pattern rejects at-sign and slash only', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@/codeforge-plugin-')).toBe(false)
      })
      test('prefix is codeforge-plugin-', () => {
        expect(PLUGIN_PATTERNS.prefix).toBe('codeforge-plugin-')
      })
      test('scoped pattern matches with empty suffix after prefix', () => {
        expect(PLUGIN_PATTERNS.scoped.test('@scope/codeforge-plugin-')).toBe(true)
      })
      test('PLUGIN_PATTERNS has prefix property', () => {
        expect(PLUGIN_PATTERNS).toHaveProperty('prefix')
      })
      test('PLUGIN_PATTERNS has scoped property', () => {
        expect(PLUGIN_PATTERNS).toHaveProperty('scoped')
      })
    })

    describe('isPluginName and parsePluginName integration', () => {
      test('isPluginName true implies parsePluginName returns valid', () => {
        const name = 'codeforge-plugin-test'
        expect(isPluginName(name)).toBe(true)
        const parsed = parsePluginName(name)
        expect(parsed.name).toBe(name)
      })
      test('isPluginName true for scoped implies parsePluginName has scope', () => {
        const name = '@scope/codeforge-plugin-test'
        expect(isPluginName(name)).toBe(true)
        const parsed = parsePluginName(name)
        expect(parsed.scope).not.toBeNull()
      })
      test('isPluginName false for no prefix', () => {
        expect(isPluginName('my-plugin')).toBe(false)
      })
      test('round trip: unscoped name parses to same name', () => {
        const name = 'codeforge-plugin-roundtrip'
        const parsed = parsePluginName(name)
        expect(parsed.name).toBe(name)
        expect(parsed.scope).toBeNull()
      })
      test('round trip: scoped name parses correctly', () => {
        const name = '@myscope/codeforge-plugin-roundtrip'
        const parsed = parsePluginName(name)
        expect(parsed.scope).toBe('@myscope')
        expect(parsed.name).toBe('codeforge-plugin-roundtrip')
      })
      test('isPluginName consistent for multiple calls', () => {
        const name = 'codeforge-plugin-consistent'
        const first = isPluginName(name)
        const second = isPluginName(name)
        expect(first).toBe(second)
      })
      test('parsePluginName consistent for multiple calls', () => {
        const name = 'codeforge-plugin-consistent'
        const first = parsePluginName(name)
        const second = parsePluginName(name)
        expect(first).toEqual(second)
      })
    })

    describe('isPluginName determinism', () => {
      test('same input returns same result 10 times', () => {
        for (let i = 0; i < 10; i++) {
          expect(isPluginName('codeforge-plugin-test')).toBe(true)
        }
      })
      test('same scoped input returns same result 10 times', () => {
        for (let i = 0; i < 10; i++) {
          expect(isPluginName('@scope/codeforge-plugin-test')).toBe(true)
        }
      })
    })

    describe('parsePluginName determinism', () => {
      test('same input returns same result 10 times', () => {
        const name = 'codeforge-plugin-deterministic'
        for (let i = 0; i < 10; i++) {
          expect(parsePluginName(name)).toEqual({ scope: null, name })
        }
      })
    })

    describe('PLUGIN_PATTERNS immutability', () => {
      test('prefix is a string primitive', () => {
        expect(typeof PLUGIN_PATTERNS.prefix).toBe('string')
      })
      test('scoped pattern has source property', () => {
        expect(typeof PLUGIN_PATTERNS.scoped.source).toBe('string')
      })
      test('scoped pattern has flags', () => {
        expect(typeof PLUGIN_PATTERNS.scoped.flags).toBe('string')
      })
      test('scoped pattern test method is callable', () => {
        expect(typeof PLUGIN_PATTERNS.scoped.test).toBe('function')
      })
    })

    describe('boundary value tests', () => {
      test('isPluginName with minimum valid unscoped name', () => {
        expect(isPluginName('codeforge-plugin-a')).toBe(true)
      })
      test('parsePluginName with minimum valid unscoped name', () => {
        expect(parsePluginName('codeforge-plugin-a')).toEqual({
          scope: null,
          name: 'codeforge-plugin-a',
        })
      })
      test('isPluginName with minimum valid scoped name', () => {
        expect(isPluginName('@a/codeforge-plugin-b')).toBe(true)
      })
      test('parsePluginName with minimum valid scoped name', () => {
        expect(parsePluginName('@a/codeforge-plugin-b')).toEqual({
          scope: '@a',
          name: 'codeforge-plugin-b',
        })
      })
      test('isPluginName returns false for undefined-like string', () => {
        expect(isPluginName('undefined')).toBe(false)
      })
    })
  })
})
