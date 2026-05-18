import { describe, it, expect } from 'vitest'
import {
  CodeMinifier,
  MinifierEngine,
  DEFAULT_MINIFY_OPTIONS,
} from '../src/core/code-minifier/code-minifier.js'
import type {
  MinifyOptions,
  MinifyResult,
  MinifyRule,
} from '../src/core/code-minifier/types.js'

// ─── DEFAULT_MINIFY_OPTIONS ────────────────────────────────────────
describe('DEFAULT_MINIFY_OPTIONS', () => {
  it('has removeComments true', () => {
    expect(DEFAULT_MINIFY_OPTIONS.removeComments).toBe(true)
  })

  it('has removeWhitespace true', () => {
    expect(DEFAULT_MINIFY_OPTIONS.removeWhitespace).toBe(true)
  })

  it('has mangleVariables false by default', () => {
    expect(DEFAULT_MINIFY_OPTIONS.mangleVariables).toBe(false)
  })

  it('has removeDeadCode false by default', () => {
    expect(DEFAULT_MINIFY_OPTIONS.removeDeadCode).toBe(false)
  })

  it('has collapseBooleans true', () => {
    expect(DEFAULT_MINIFY_OPTIONS.collapseBooleans).toBe(true)
  })

  it('has minifyStrings false by default', () => {
    expect(DEFAULT_MINIFY_OPTIONS.minifyStrings).toBe(false)
  })

  it('has preserveLineBreaks false by default', () => {
    expect(DEFAULT_MINIFY_OPTIONS.preserveLineBreaks).toBe(false)
  })

  it('has all expected keys', () => {
    const keys = Object.keys(DEFAULT_MINIFY_OPTIONS)
    expect(keys).toContain('removeComments')
    expect(keys).toContain('removeWhitespace')
    expect(keys).toContain('mangleVariables')
    expect(keys).toContain('removeDeadCode')
    expect(keys).toContain('collapseBooleans')
    expect(keys).toContain('minifyStrings')
    expect(keys).toContain('preserveLineBreaks')
    expect(keys).toHaveLength(7)
  })
})

// ─── MinifierEngine – constructor ──────────────────────────────────
describe('MinifierEngine constructor', () => {
  it('starts with no rules', () => {
    const engine = new MinifierEngine()
    expect(engine.getRules()).toHaveLength(0)
  })

  it('getRules returns a copy (not the internal array)', () => {
    const engine = new MinifierEngine()
    const rules = engine.getRules()
    rules.push({ name: 'fake', apply: (c) => c })
    expect(engine.getRules()).toHaveLength(0)
  })
})

// ─── MinifierEngine – addRule / removeRule ─────────────────────────
describe('MinifierEngine addRule / removeRule', () => {
  it('addRule adds a rule', () => {
    const engine = new MinifierEngine()
    const rule: MinifyRule = { name: 'test-rule', apply: (c) => c }
    engine.addRule(rule)
    expect(engine.getRules()).toHaveLength(1)
    expect(engine.getRules()[0]!.name).toBe('test-rule')
  })

  it('addRule preserves insertion order', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c })
    engine.addRule({ name: 'b', apply: (c) => c })
    engine.addRule({ name: 'c', apply: (c) => c })
    const names = engine.getRules().map((r) => r.name)
    expect(names).toEqual(['a', 'b', 'c'])
  })

  it('removeRule removes by name', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'keep', apply: (c) => c })
    engine.addRule({ name: 'remove-me', apply: (c) => c })
    engine.removeRule('remove-me')
    expect(engine.getRules()).toHaveLength(1)
    expect(engine.getRules()[0]!.name).toBe('keep')
  })

  it('removeRule with nonexistent name does nothing', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c })
    engine.removeRule('nonexistent')
    expect(engine.getRules()).toHaveLength(1)
  })

  it('addRule allows duplicate names', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'dup', apply: (c) => c })
    engine.addRule({ name: 'dup', apply: (c) => c.toUpperCase() })
    expect(engine.getRules()).toHaveLength(2)
  })
})

// ─── MinifierEngine – apply ────────────────────────────────────────
describe('MinifierEngine apply', () => {
  it('applies rules in order', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'upper', apply: (c) => c.toUpperCase() })
    engine.addRule({ name: 'exclaim', apply: (c) => c + '!' })
    expect(engine.apply('hello')).toBe('HELLO!')
  })

  it('returns original code when no rules', () => {
    const engine = new MinifierEngine()
    expect(engine.apply('const x = 1')).toBe('const x = 1')
  })

  it('filters by rulesToApply', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c.toUpperCase() })
    engine.addRule({ name: 'b', apply: (c) => c + '!' })
    expect(engine.apply('hello', { rulesToApply: ['b'] })).toBe('hello!')
  })

  it('rulesToApply with empty array applies no rules', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c.toUpperCase() })
    expect(engine.apply('hello', { rulesToApply: [] })).toBe('hello')
  })

  it('rulesToApply with nonexistent rule name applies nothing extra', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c.toUpperCase() })
    expect(engine.apply('hello', { rulesToApply: ['nonexistent'] })).toBe('hello')
  })

  it('rulesToApply selects multiple rules', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'a', apply: (c) => c.toUpperCase() })
    engine.addRule({ name: 'b', apply: (c) => c + '!' })
    engine.addRule({ name: 'c', apply: (c) => c + '?' })
    expect(engine.apply('hello', { rulesToApply: ['a', 'c'] })).toBe('HELLO?')
  })
})

// ─── MinifierEngine – getDefaultRules ──────────────────────────────
describe('MinifierEngine getDefaultRules', () => {
  it('returns the expected number of default rules', () => {
    const rules = MinifierEngine.getDefaultRules()
    expect(rules).toHaveLength(8)
  })

  it('contains remove-single-line-comments rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('remove-single-line-comments')
  })

  it('contains remove-multi-line-comments rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('remove-multi-line-comments')
  })

  it('contains collapse-whitespace rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('collapse-whitespace')
  })

  it('contains trim-lines rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('trim-lines')
  })

  it('contains remove-empty-lines rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('remove-empty-lines')
  })

  it('contains collapse-booleans rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('collapse-booleans')
  })

  it('contains shorten-undefined rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('shorten-undefined')
  })

  it('contains remove-console rule', () => {
    const names = MinifierEngine.getDefaultRules().map((r) => r.name)
    expect(names).toContain('remove-console')
  })

  it('each rule has a name and apply function', () => {
    for (const rule of MinifierEngine.getDefaultRules()) {
      expect(typeof rule.name).toBe('string')
      expect(typeof rule.apply).toBe('function')
    }
  })

  it('returns a new array each call', () => {
    const a = MinifierEngine.getDefaultRules()
    const b = MinifierEngine.getDefaultRules()
    expect(a).not.toBe(b)
  })
})

// ─── Rule: remove-single-line-comments ─────────────────────────────
describe('rule: remove-single-line-comments', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-single-line-comments')!

  it('removes a trailing comment', () => {
    expect(rule.apply('const x = 1; // comment')).toBe('const x = 1;')
  })

  it('removes a comment-only line', () => {
    expect(rule.apply('// full line comment')).toBe('')
  })

  it('does not remove // inside single-quoted strings', () => {
    expect(rule.apply("const url = 'http://example.com'")).toBe("const url = 'http://example.com'")
  })

  it('does not remove // inside double-quoted strings', () => {
    expect(rule.apply('const url = "http://example.com"')).toBe('const url = "http://example.com"')
  })

  it('does not remove // inside backtick strings', () => {
    expect(rule.apply('const url = `http://example.com`')).toBe('const url = `http://example.com`')
  })

  it('does not remove comment when escaped quotes confuse string detection', () => {
    const input = "const s = 'hello\\'world'; // comment"
    expect(rule.apply(input)).toBe(input)
  })

  it('does not remove trailing comment after code with colon context', () => {
    const input = "fetch('http://example.com'); // remove this"
    expect(rule.apply(input)).toBe(input)
  })

  it('handles code with no comments', () => {
    expect(rule.apply('const x = 1;')).toBe('const x = 1;')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('handles multi-line with mixed comments', () => {
    const input = 'const a = 1; // comment\nconst b = 2;'
    expect(rule.apply(input)).toBe('const a = 1;\nconst b = 2;')
  })

  it('preserves protocol-like patterns with colon', () => {
    expect(rule.apply("url: 'http://test.com'")).toBe("url: 'http://test.com'")
  })
})

// ─── Rule: remove-multi-line-comments ──────────────────────────────
describe('rule: remove-multi-line-comments', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-multi-line-comments')!

  it('removes a block comment', () => {
    expect(rule.apply('/* comment */')).toBe('')
  })

  it('removes inline block comment', () => {
    expect(rule.apply('const x = /* inline */ 1;')).toBe('const x =  1;')
  })

  it('removes multi-line block comment', () => {
    const input = '/* line1\nline2\nline3 */'
    expect(rule.apply(input)).toBe('')
  })

  it('removes multiple block comments', () => {
    expect(rule.apply('/* a */ code /* b */')).toBe(' code ')
  })

  it('removes /* inside strings (regex is greedy, not string-aware)', () => {
    expect(rule.apply('const s = "/* not a comment */"')).toBe('const s = ""')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('handles code with no block comments', () => {
    expect(rule.apply('const x = 1;')).toBe('const x = 1;')
  })

  it('removes JSDoc-style comments', () => {
    const input = '/**\n * @param x\n * @returns y\n */'
    expect(rule.apply(input)).toBe('')
  })
})

// ─── Rule: collapse-whitespace ─────────────────────────────────────
describe('rule: collapse-whitespace', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'collapse-whitespace')!

  it('collapses multiple spaces to one', () => {
    expect(rule.apply('const    x   =   1;')).toBe('const x = 1;')
  })

  it('collapses tabs to single space', () => {
    expect(rule.apply('const\tx\t=\t1;')).toBe('const x = 1;')
  })

  it('preserves string content with multiple spaces', () => {
    expect(rule.apply("const s = 'hello   world';")).toBe("const s = 'hello   world';")
  })

  it('preserves double-quoted string content', () => {
    expect(rule.apply('const s = "hello   world";')).toBe('const s = "hello   world";')
  })

  it('preserves backtick string content', () => {
    expect(rule.apply('const s = `hello   world`;')).toBe('const s = `hello   world`;')
  })

  it('handles escaped quotes in strings', () => {
    expect(rule.apply("const s = 'it\\'s   ok';")).toBe("const s = 'it\\'s   ok';")
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('handles multi-line code', () => {
    const input = 'const  a  =  1;\nconst  b  =  2;'
    expect(rule.apply(input)).toBe('const a = 1;\nconst b = 2;')
  })

  it('collapses mixed spaces and tabs', () => {
    expect(rule.apply('const \t x \t = \t 1;')).toBe('const x = 1;')
  })
})

// ─── Rule: trim-lines ──────────────────────────────────────────────
describe('rule: trim-lines', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'trim-lines')!

  it('trims leading whitespace', () => {
    expect(rule.apply('  const x = 1;')).toBe('const x = 1;')
  })

  it('trims trailing whitespace', () => {
    expect(rule.apply('const x = 1;   ')).toBe('const x = 1;')
  })

  it('trims both sides', () => {
    expect(rule.apply('  const x = 1;  ')).toBe('const x = 1;')
  })

  it('handles multi-line code', () => {
    expect(rule.apply('  line1  \n  line2  ')).toBe('line1\nline2')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('trims tabs', () => {
    expect(rule.apply('\tconst x = 1;\t')).toBe('const x = 1;')
  })

  it('turns whitespace-only lines into empty lines', () => {
    expect(rule.apply('   ')).toBe('')
  })
})

// ─── Rule: remove-empty-lines ──────────────────────────────────────
describe('rule: remove-empty-lines', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-empty-lines')!

  it('removes blank lines between code', () => {
    expect(rule.apply('line1\n\nline2')).toBe('line1\nline2')
  })

  it('removes multiple consecutive blank lines', () => {
    expect(rule.apply('line1\n\n\n\nline2')).toBe('line1\nline2')
  })

  it('removes whitespace-only blank lines', () => {
    expect(rule.apply('line1\n   \nline2')).toBe('line1\nline2')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('handles code with no blank lines', () => {
    expect(rule.apply('line1\nline2')).toBe('line1\nline2')
  })

  it('reduces trailing blank lines but may leave one newline', () => {
    const result = rule.apply('line1\n\n')
    expect(result.trim()).toBe('line1')
  })

  it('reduces leading blank lines but may leave one newline', () => {
    const result = rule.apply('\n\nline1')
    expect(result.trim()).toBe('line1')
  })
})

// ─── Rule: collapse-booleans ───────────────────────────────────────
describe('rule: collapse-booleans', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'collapse-booleans')!

  it('replaces standalone true with !0', () => {
    expect(rule.apply('const x = true;')).toBe('const x = !0;')
  })

  it('replaces standalone false with !1', () => {
    expect(rule.apply('const x = false;')).toBe('const x = !1;')
  })

  it('does not replace true in identifier like trueValue', () => {
    expect(rule.apply('const trueValue = 1;')).toBe('const trueValue = 1;')
  })

  it('does not replace false in identifier like assertFalse', () => {
    expect(rule.apply('const assertFalse = 1;')).toBe('const assertFalse = 1;')
  })

  it('does not replace true inside single-quoted strings', () => {
    expect(rule.apply("const s = 'true';")).toBe("const s = 'true';")
  })

  it('does not replace false inside double-quoted strings', () => {
    expect(rule.apply('const s = "false";')).toBe('const s = "false";')
  })

  it('does not replace true inside backtick strings', () => {
    expect(rule.apply('const s = `true`;')).toBe('const s = `true`;')
  })

  it('handles multiple booleans on same line', () => {
    expect(rule.apply('true && false')).toBe('!0 && !1')
  })

  it('handles true at start of line', () => {
    expect(rule.apply('true')).toBe('!0')
  })

  it('handles false at end of line', () => {
    expect(rule.apply('x = false')).toBe('x = !1')
  })

  it('does not replace true when preceded by underscore', () => {
    expect(rule.apply('const is_true = 1;')).toBe('const is_true = 1;')
  })

  it('does not replace false when followed by digit', () => {
    expect(rule.apply('const false1 = 1;')).toBe('const false1 = 1;')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('does not replace true followed by $', () => {
    expect(rule.apply('const true$ = 1;')).toBe('const true$ = 1;')
  })
})

// ─── Rule: shorten-undefined ───────────────────────────────────────
describe('rule: shorten-undefined', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'shorten-undefined')!

  it('replaces standalone undefined with void 0', () => {
    expect(rule.apply('const x = undefined;')).toBe('const x = void 0;')
  })

  it('does not replace undefined in identifier like isUndefined', () => {
    expect(rule.apply('const isUndefined = true;')).toBe('const isUndefined = true;')
  })

  it('does not replace undefined in identifier like undefinedValue', () => {
    expect(rule.apply('const undefinedValue = 1;')).toBe('const undefinedValue = 1;')
  })

  it('does not replace undefined inside single-quoted strings', () => {
    expect(rule.apply("const s = 'undefined';")).toBe("const s = 'undefined';")
  })

  it('does not replace undefined inside double-quoted strings', () => {
    expect(rule.apply('const s = "undefined";')).toBe('const s = "undefined";')
  })

  it('does not replace undefined inside backtick strings', () => {
    expect(rule.apply('const s = `undefined`;')).toBe('const s = `undefined`;')
  })

  it('handles undefined at start of line', () => {
    expect(rule.apply('undefined')).toBe('void 0')
  })

  it('handles undefined at end of line', () => {
    expect(rule.apply('x = undefined')).toBe('x = void 0')
  })

  it('handles multiple occurrences', () => {
    expect(rule.apply('undefined || undefined')).toBe('void 0 || void 0')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('does not replace undefined preceded by underscore', () => {
    expect(rule.apply('const _undefined = 1;')).toBe('const _undefined = 1;')
  })

  it('does not replace undefined followed by $', () => {
    expect(rule.apply('const undefined$ = 1;')).toBe('const undefined$ = 1;')
  })
})

// ─── Rule: remove-console ──────────────────────────────────────────
describe('rule: remove-console', () => {
  const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-console')!

  it('removes console.log statements', () => {
    expect(rule.apply('console.log("hello");')).toBe('')
  })

  it('removes console.warn statements', () => {
    expect(rule.apply('console.warn("warning");')).toBe('')
  })

  it('removes console.error statements', () => {
    expect(rule.apply('console.error("error");')).toBe('')
  })

  it('removes console.info statements', () => {
    expect(rule.apply('console.info("info");')).toBe('')
  })

  it('removes console.debug statements', () => {
    expect(rule.apply('console.debug("debug");')).toBe('')
  })

  it('does not remove console.log inside a string', () => {
    expect(rule.apply('const s = "console.log(hi)";')).toBe('const s = "console.log(hi)";')
  })

  it('removes console with leading whitespace', () => {
    expect(rule.apply('  console.log("x");')).toBe('')
  })

  it('removes console with leading tabs', () => {
    expect(rule.apply('\tconsole.log("x");')).toBe('')
  })

  it('does not remove console.log assigned to variable', () => {
    expect(rule.apply('const x = console.log("test");')).toBe('const x = console.log("test");')
  })

  it('handles empty string', () => {
    expect(rule.apply('')).toBe('')
  })

  it('removes console without semicolon', () => {
    expect(rule.apply('console.log("test")')).toBe('')
  })

  it('removes multiple console statements on different lines', () => {
    expect(rule.apply('console.log("a");\nconsole.log("b");')).toBe('\n')
  })
})

// ─── CodeMinifier – constructor ────────────────────────────────────
describe('CodeMinifier constructor', () => {
  it('uses default options when none provided', () => {
    const minifier = new CodeMinifier()
    expect(minifier.getOptions()).toEqual(DEFAULT_MINIFY_OPTIONS)
  })

  it('overrides provided options', () => {
    const minifier = new CodeMinifier({ mangleVariables: true })
    expect(minifier.getOptions().mangleVariables).toBe(true)
    expect(minifier.getOptions().removeComments).toBe(true)
  })

  it('preserves defaults for unspecified options', () => {
    const minifier = new CodeMinifier({ removeComments: false })
    expect(minifier.getOptions().removeComments).toBe(false)
    expect(minifier.getOptions().removeWhitespace).toBe(true)
  })

  it('getOptions returns a copy', () => {
    const minifier = new CodeMinifier()
    const opts = minifier.getOptions()
    opts.removeComments = false
    expect(minifier.getOptions().removeComments).toBe(true)
  })

  it('accepts empty options object', () => {
    const minifier = new CodeMinifier({})
    expect(minifier.getOptions()).toEqual(DEFAULT_MINIFY_OPTIONS)
  })

  it('accepts all options overridden', () => {
    const minifier = new CodeMinifier({
      removeComments: false,
      removeWhitespace: false,
      mangleVariables: true,
      removeDeadCode: true,
      collapseBooleans: false,
      minifyStrings: true,
      preserveLineBreaks: true,
    })
    const opts = minifier.getOptions()
    expect(opts.removeComments).toBe(false)
    expect(opts.removeWhitespace).toBe(false)
    expect(opts.mangleVariables).toBe(true)
    expect(opts.removeDeadCode).toBe(true)
    expect(opts.collapseBooleans).toBe(false)
    expect(opts.minifyStrings).toBe(true)
    expect(opts.preserveLineBreaks).toBe(true)
  })
})

// ─── CodeMinifier – minify ─────────────────────────────────────────
describe('CodeMinifier minify', () => {
  it('returns a MinifyResult with all fields', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = 1;')
    expect(result).toHaveProperty('original')
    expect(result).toHaveProperty('minified')
    expect(result).toHaveProperty('originalSize')
    expect(result).toHaveProperty('minifiedSize')
    expect(result).toHaveProperty('savings')
    expect(result).toHaveProperty('rulesApplied')
  })

  it('preserves original code in result', () => {
    const minifier = new CodeMinifier()
    const code = 'const x = 1;'
    const result = minifier.minify(code)
    expect(result.original).toBe(code)
  })

  it('calculates originalSize correctly', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('hello')
    expect(result.originalSize).toBe(5)
  })

  it('calculates minifiedSize correctly', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = true;')
    expect(result.minifiedSize).toBe(result.minified.length)
  })

  it('calculates savings percentage', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const   x   =   true;')
    expect(result.savings).toBeGreaterThan(0)
    expect(result.savings).toBeLessThanOrEqual(100)
  })

  it('savings is 0 for empty string', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('')
    expect(result.savings).toBe(0)
  })

  it('tracks applied rules', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = 1;')
    expect(result.rulesApplied.length).toBeGreaterThan(0)
  })

  it('removes comments by default', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = 1; // comment')
    expect(result.minified).not.toContain('// comment')
  })

  it('collapses booleans by default', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = true;')
    expect(result.minified).toContain('!0')
  })

  it('does not collapse booleans when option is false', () => {
    const minifier = new CodeMinifier({ collapseBooleans: false })
    const result = minifier.minify('const x = true;')
    expect(result.minified).toContain('true')
  })

  it('does not remove comments when option is false', () => {
    const minifier = new CodeMinifier({ removeComments: false })
    const result = minifier.minify('const x = 1; // comment')
    expect(result.minified).toContain('//')
  })

  it('does not remove whitespace when option is false', () => {
    const minifier = new CodeMinifier({ removeWhitespace: false })
    const result = minifier.minify('const   x   =   1;')
    expect(result.minified).toContain('   ')
  })

  it('always applies shorten-undefined regardless of options', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = undefined;')
    expect(result.minified).toContain('void 0')
  })

  it('always applies remove-console regardless of options', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('console.log("hi");')
    expect(result.minified).not.toContain('console.log')
  })

  it('savings calculation uses rounded percentage', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const x = 1;')
    const expectedSavings = result.originalSize > 0
      ? Math.round(((result.originalSize - result.minifiedSize) / result.originalSize) * 10000) / 100
      : 0
    expect(result.savings).toBe(expectedSavings)
  })
})

// ─── CodeMinifier – minifyFile ─────────────────────────────────────
describe('CodeMinifier minifyFile', () => {
  it('delegates to minify and returns same result', () => {
    const minifier = new CodeMinifier()
    const code = 'const x = true; // test'
    const minifyResult = minifier.minify(code)
    const fileResult = minifier.minifyFile(code)
    expect(fileResult.original).toBe(minifyResult.original)
    expect(fileResult.minified).toBe(minifyResult.minified)
    expect(fileResult.savings).toBe(minifyResult.savings)
  })

  it('returns a full MinifyResult', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minifyFile('const a = 1;')
    expect(result.originalSize).toBe(12)
    expect(typeof result.minified).toBe('string')
  })
})

// ─── CodeMinifier – minifyBatch ────────────────────────────────────
describe('CodeMinifier minifyBatch', () => {
  it('processes multiple files', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    files.set('a.ts', 'const x = true;')
    files.set('b.ts', 'const y = false;')
    const results = minifier.minifyBatch(files)
    expect(results.size).toBe(2)
  })

  it('preserves file paths as keys', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    files.set('src/a.ts', 'const x = 1;')
    files.set('src/b.ts', 'const y = 2;')
    const results = minifier.minifyBatch(files)
    expect(results.has('src/a.ts')).toBe(true)
    expect(results.has('src/b.ts')).toBe(true)
  })

  it('returns correct MinifyResult for each file', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    files.set('a.ts', 'const x = true;')
    const results = minifier.minifyBatch(files)
    const result = results.get('a.ts')!
    expect(result.original).toBe('const x = true;')
    expect(result.minified).toContain('!0')
  })

  it('handles empty batch', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    const results = minifier.minifyBatch(files)
    expect(results.size).toBe(0)
  })

  it('handles single file batch', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    files.set('only.ts', 'const x = 1;')
    const results = minifier.minifyBatch(files)
    expect(results.size).toBe(1)
    expect(results.get('only.ts')!.original).toBe('const x = 1;')
  })

  it('each result is independent', () => {
    const minifier = new CodeMinifier()
    const files = new Map<string, string>()
    files.set('a.ts', 'const x = true;')
    files.set('b.ts', 'const y = undefined;')
    const results = minifier.minifyBatch(files)
    expect(results.get('a.ts')!.minified).toContain('!0')
    expect(results.get('b.ts')!.minified).toContain('void 0')
  })
})

// ─── CodeMinifier – estimateSavings ────────────────────────────────
describe('CodeMinifier estimateSavings', () => {
  it('returns a number', () => {
    const minifier = new CodeMinifier()
    expect(typeof minifier.estimateSavings('const x = 1;')).toBe('number')
  })

  it('returns 0 for empty string', () => {
    const minifier = new CodeMinifier()
    expect(minifier.estimateSavings('')).toBe(0)
  })

  it('returns positive savings for compressible code', () => {
    const minifier = new CodeMinifier()
    expect(minifier.estimateSavings('const   x   =   true;   // comment')).toBeGreaterThan(0)
  })

  it('returns different values for different code', () => {
    const minifier = new CodeMinifier()
    const s1 = minifier.estimateSavings('const   x   =   1;')
    const s2 = minifier.estimateSavings('x')
    expect(s1).not.toBe(s2)
  })

  it('matches the savings from minify', () => {
    const minifier = new CodeMinifier()
    const code = 'const x = true; // test'
    const result = minifier.minify(code)
    expect(minifier.estimateSavings(code)).toBe(result.savings)
  })
})

// ─── CodeMinifier – getDefaultRules ────────────────────────────────
describe('CodeMinifier getDefaultRules', () => {
  it('returns the default rules from engine', () => {
    const minifier = new CodeMinifier()
    const rules = minifier.getDefaultRules()
    expect(rules).toHaveLength(8)
  })

  it('returns rules with name and apply', () => {
    const minifier = new CodeMinifier()
    const rules = minifier.getDefaultRules()
    for (const rule of rules) {
      expect(typeof rule.name).toBe('string')
      expect(typeof rule.apply).toBe('function')
    }
  })

  it('returns a new array each call', () => {
    const minifier = new CodeMinifier()
    const a = minifier.getDefaultRules()
    const b = minifier.getDefaultRules()
    expect(a).not.toBe(b)
  })
})

// ─── CodeMinifier – selectRules (integration) ─────────────────────
describe('CodeMinifier selectRules integration', () => {
  it('with all features off still applies shorten-undefined and remove-console', () => {
    const minifier = new CodeMinifier({
      removeComments: false,
      removeWhitespace: false,
      collapseBooleans: false,
    })
    const result = minifier.minify('const x = undefined; console.log("hi");')
    expect(result.rulesApplied).toContain('shorten-undefined')
    expect(result.rulesApplied).toContain('remove-console')
    expect(result.rulesApplied).not.toContain('remove-single-line-comments')
    expect(result.rulesApplied).not.toContain('collapse-whitespace')
    expect(result.rulesApplied).not.toContain('collapse-booleans')
  })

  it('with removeComments includes comment rules', () => {
    const minifier = new CodeMinifier({ removeComments: true, removeWhitespace: false, collapseBooleans: false })
    const result = minifier.minify('x')
    expect(result.rulesApplied).toContain('remove-single-line-comments')
    expect(result.rulesApplied).toContain('remove-multi-line-comments')
  })

  it('with removeWhitespace includes whitespace rules', () => {
    const minifier = new CodeMinifier({ removeComments: false, removeWhitespace: true, collapseBooleans: false })
    const result = minifier.minify('x')
    expect(result.rulesApplied).toContain('collapse-whitespace')
    expect(result.rulesApplied).toContain('trim-lines')
    expect(result.rulesApplied).toContain('remove-empty-lines')
  })

  it('with collapseBooleans includes collapse-booleans rule', () => {
    const minifier = new CodeMinifier({ removeComments: false, removeWhitespace: false, collapseBooleans: true })
    const result = minifier.minify('x')
    expect(result.rulesApplied).toContain('collapse-booleans')
  })
})

// ─── CodeMinifier – edge cases ─────────────────────────────────────
describe('CodeMinifier edge cases', () => {
  it('handles code that is already minified', () => {
    const minifier = new CodeMinifier()
    const code = 'const x=1;'
    const result = minifier.minify(code)
    expect(result.minified.length).toBeLessThanOrEqual(code.length)
  })

  it('handles code with only whitespace', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('   \n   \n   ')
    expect(result.minified.trim()).toBe('')
  })

  it('handles code with only comments', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('// just a comment\n/* block */')
    expect(result.minified.trim()).toBe('')
  })

  it('handles single character code', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('x')
    expect(result.original).toBe('x')
    expect(typeof result.minified).toBe('string')
  })

  it('handles code with unicode', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const msg = "héllo wörld";')
    expect(result.minified).toContain('héllo wörld')
  })

  it('handles code with template literals', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('const s = `hello ${name}`;')
    expect(result.minified).toContain('${name}')
  })

  it('handles deeply nested code', () => {
    const minifier = new CodeMinifier()
    const code = 'if (true) { if (true) { if (true) { const x = true; } } }'
    const result = minifier.minify(code)
    expect(result.minified).not.toContain('true')
    expect(result.minified).toContain('!0')
  })

  it('handles very long code', () => {
    const minifier = new CodeMinifier()
    const code = 'const   x = true;   // comment\n'.repeat(1000)
    const result = minifier.minify(code)
    expect(result.originalSize).toBe(code.length)
    expect(result.minifiedSize).toBeLessThan(code.length)
  })

  it('handles code with regex literals containing //', () => {
    const minifier = new CodeMinifier()
    const code = 'const r = /https?:\\/\\/example/;'
    const result = minifier.minify(code)
    expect(typeof result.minified).toBe('string')
  })

  it('handles code with mixed comment types', () => {
    const minifier = new CodeMinifier()
    const code = '/* block */ const x = 1; // inline\nconst y = 2;'
    const result = minifier.minify(code)
    expect(result.minified).not.toContain('/* block */')
    expect(result.minified).not.toContain('// inline')
  })
})

// ─── Type exports ──────────────────────────────────────────────────
describe('type exports', () => {
  it('MinifyOptions has expected shape', () => {
    const opts: MinifyOptions = {
      removeComments: true,
      removeWhitespace: true,
      mangleVariables: false,
      removeDeadCode: false,
      collapseBooleans: true,
      minifyStrings: false,
      preserveLineBreaks: false,
    }
    expect(opts.removeComments).toBe(true)
  })

  it('MinifyResult has expected shape', () => {
    const result: MinifyResult = {
      original: 'code',
      minified: 'code',
      originalSize: 4,
      minifiedSize: 4,
      savings: 0,
      rulesApplied: [],
    }
    expect(result.originalSize).toBe(4)
  })

  it('MinifyRule has expected shape', () => {
    const rule: MinifyRule = {
      name: 'test',
      apply: (code: string) => code,
    }
    expect(rule.name).toBe('test')
    expect(typeof rule.apply).toBe('function')
  })
})

// ─── MinifierEngine – rule interaction ─────────────────────────────
describe('MinifierEngine rule interaction', () => {
  it('chaining comment removal then whitespace collapse works', () => {
    const engine = new MinifierEngine()
    const rules = MinifierEngine.getDefaultRules()
    const commentRule = rules.find((r) => r.name === 'remove-single-line-comments')!
    const whitespaceRule = rules.find((r) => r.name === 'collapse-whitespace')!
    engine.addRule(commentRule)
    engine.addRule(whitespaceRule)
    const result = engine.apply('const  x  =  1;  // comment')
    expect(result).not.toContain('//')
    expect(result).not.toContain('  ')
  })

  it('adding and removing rules does not affect static defaults', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'temp', apply: (c) => c })
    engine.removeRule('temp')
    const defaults = MinifierEngine.getDefaultRules()
    expect(defaults).toHaveLength(8)
  })

  it('apply with all default rules via CodeMinifier produces valid output', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify(`
      // A comment
      const    x    =    true;
      const    y    =    false;

      /* Multi-line
         comment */
      console.log("debug");

      const z = undefined;
    `)
    expect(result.minified).not.toContain('//')
    expect(result.minified).not.toContain('/*')
    expect(result.minified).toContain('!0')
    expect(result.minified).toContain('!1')
    expect(result.minified).toContain('void 0')
    expect(result.minified).not.toContain('console.log')
    expect(result.savings).toBeGreaterThan(0)
  })
})
