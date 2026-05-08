import { describe, it, expect } from 'vitest'
import { MinifierEngine } from '../../src/core/code-minifier/minifier-engine.js'
import { CodeMinifier } from '../../src/core/code-minifier/code-minifier.js'
import type { MinifyOptions, MinifyRule, MinifyResult } from '../../src/core/code-minifier/types.js'
import { DEFAULT_MINIFY_OPTIONS } from '../../src/core/code-minifier/types.js'

describe('MinifierEngine', () => {
  describe('addRule', () => {
    it('should add a rule to the engine', () => {
      const engine = new MinifierEngine()
      const rule: MinifyRule = { name: 'test-rule', apply: (c) => c.toUpperCase() }
      engine.addRule(rule)
      expect(engine.getRules()).toHaveLength(1)
      expect(engine.getRules()[0]!.name).toBe('test-rule')
    })

    it('should add multiple rules', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'rule-a', apply: (c) => c })
      engine.addRule({ name: 'rule-b', apply: (c) => c })
      expect(engine.getRules()).toHaveLength(2)
    })
  })

  describe('removeRule', () => {
    it('should remove a rule by name', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'rule-a', apply: (c) => c })
      engine.addRule({ name: 'rule-b', apply: (c) => c })
      engine.removeRule('rule-a')
      expect(engine.getRules()).toHaveLength(1)
      expect(engine.getRules()[0]!.name).toBe('rule-b')
    })

    it('should do nothing when removing a non-existent rule', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'rule-a', apply: (c) => c })
      engine.removeRule('non-existent')
      expect(engine.getRules()).toHaveLength(1)
    })
  })

  describe('apply with no rules', () => {
    it('should return code unchanged when no rules', () => {
      const engine = new MinifierEngine()
      const code = 'const x = 1'
      expect(engine.apply(code)).toBe(code)
    })
  })

  describe('apply with single rule', () => {
    it('should apply a single rule', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'upper', apply: (c) => c.toUpperCase() })
      expect(engine.apply('hello')).toBe('HELLO')
    })
  })

  describe('apply with multiple rules', () => {
    it('should apply rules in order', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'upper', apply: (c) => c.toUpperCase() })
      engine.addRule({ name: 'exclaim', apply: (c) => c + '!' })
      expect(engine.apply('hello')).toBe('HELLO!')
    })
  })

  describe('getRules', () => {
    it('should return a copy of rules array', () => {
      const engine = new MinifierEngine()
      engine.addRule({ name: 'rule-a', apply: (c) => c })
      const rules = engine.getRules()
      rules.push({ name: 'rule-b', apply: (c) => c })
      expect(engine.getRules()).toHaveLength(1)
    })
  })

  describe('getDefaultRules', () => {
    it('should return 8 default rules', () => {
      const rules = MinifierEngine.getDefaultRules()
      expect(rules).toHaveLength(8)
    })

    it('should have rule names in expected order', () => {
      const rules = MinifierEngine.getDefaultRules()
      expect(rules[0]!.name).toBe('remove-single-line-comments')
      expect(rules[1]!.name).toBe('remove-multi-line-comments')
      expect(rules[2]!.name).toBe('collapse-whitespace')
      expect(rules[3]!.name).toBe('trim-lines')
      expect(rules[4]!.name).toBe('remove-empty-lines')
      expect(rules[5]!.name).toBe('collapse-booleans')
      expect(rules[6]!.name).toBe('shorten-undefined')
      expect(rules[7]!.name).toBe('remove-console')
    })
  })
})

describe('Default rules', () => {
  const rules = MinifierEngine.getDefaultRules()

  describe('remove-single-line-comments', () => {
    const rule = rules.find((r) => r.name === 'remove-single-line-comments')!

    it('should remove single-line comments', () => {
      expect(rule.apply('const x = 1 // comment')).toBe('const x = 1')
    })

    it('should preserve URLs with ://', () => {
      expect(rule.apply('const url = "http://example.com"')).toBe('const url = "http://example.com"')
    })

    it('should remove comment-only lines', () => {
      expect(rule.apply('// this is a comment')).toBe('')
    })

    it('should preserve code before comment', () => {
      expect(rule.apply('const x = 1 // inline')).toBe('const x = 1')
    })
  })

  describe('remove-multi-line-comments', () => {
    const rule = rules.find((r) => r.name === 'remove-multi-line-comments')!

    it('should remove block comments', () => {
      expect(rule.apply('/* comment */')).toBe('')
    })

    it('should remove multi-line block comments', () => {
      expect(rule.apply('/* line1\nline2 */')).toBe('')
    })

    it('should preserve code around comments', () => {
      expect(rule.apply('const a = 1; /* comment */ const b = 2;')).toBe('const a = 1;  const b = 2;')
    })

    it('should remove JSDoc-style comments', () => {
      expect(rule.apply('/**\n * @param x\n */')).toBe('')
    })
  })

  describe('collapse-whitespace', () => {
    const rule = rules.find((r) => r.name === 'collapse-whitespace')!

    it('should collapse multiple spaces to one', () => {
      expect(rule.apply('const    x   =   1')).toBe('const x = 1')
    })

    it('should collapse tabs to one space', () => {
      expect(rule.apply('const\tx\t=\t1')).toBe('const x = 1')
    })

    it('should preserve single spaces', () => {
      expect(rule.apply('const x = 1')).toBe('const x = 1')
    })

    it('should not collapse whitespace inside strings', () => {
      expect(rule.apply('const s = "hello   world"')).toBe('const s = "hello   world"')
    })
  })

  describe('trim-lines', () => {
    const rule = rules.find((r) => r.name === 'trim-lines')!

    it('should trim leading whitespace', () => {
      expect(rule.apply('   const x = 1')).toBe('const x = 1')
    })

    it('should trim trailing whitespace', () => {
      expect(rule.apply('const x = 1   ')).toBe('const x = 1')
    })

    it('should trim both leading and trailing', () => {
      expect(rule.apply('  const x = 1  ')).toBe('const x = 1')
    })
  })

  describe('remove-empty-lines', () => {
    const rule = rules.find((r) => r.name === 'remove-empty-lines')!

    it('should collapse consecutive empty lines', () => {
      expect(rule.apply('a\n\n\nb')).toBe('a\nb')
    })

    it('should preserve single newlines', () => {
      expect(rule.apply('a\nb')).toBe('a\nb')
    })

    it('should handle whitespace-only lines', () => {
      expect(rule.apply('a\n   \nb')).toBe('a\nb')
    })
  })

  describe('collapse-booleans', () => {
    const rule = rules.find((r) => r.name === 'collapse-booleans')!

    it('should convert true to !0', () => {
      expect(rule.apply('const x = true')).toBe('const x = !0')
    })

    it('should convert false to !1', () => {
      expect(rule.apply('const x = false')).toBe('const x = !1')
    })

    it('should not convert true inside identifiers', () => {
      expect(rule.apply('const trueValue = 1')).toBe('const trueValue = 1')
    })

    it('should not convert false inside identifiers', () => {
      expect(rule.apply('const falseValue = 1')).toBe('const falseValue = 1')
    })

    it('should not convert booleans inside strings', () => {
      expect(rule.apply("const s = 'true and false'")).toBe("const s = 'true and false'")
    })
  })

  describe('shorten-undefined', () => {
    const rule = rules.find((r) => r.name === 'shorten-undefined')!

    it('should convert undefined to void 0', () => {
      expect(rule.apply('const x = undefined')).toBe('const x = void 0')
    })

    it('should not convert undefined inside identifiers', () => {
      expect(rule.apply('const undefinedVar = 1')).toBe('const undefinedVar = 1')
    })

    it('should not convert undefined inside strings', () => {
      expect(rule.apply("const s = 'undefined value'")).toBe("const s = 'undefined value'")
    })
  })

  describe('remove-console', () => {
    const rule = rules.find((r) => r.name === 'remove-console')!

    it('should remove console.log', () => {
      expect(rule.apply('console.log("hello");')).toBe('')
    })

    it('should remove console.error', () => {
      expect(rule.apply('console.error("err");')).toBe('')
    })

    it('should remove console.warn', () => {
      expect(rule.apply('console.warn("warn");')).toBe('')
    })

    it('should remove console.info', () => {
      expect(rule.apply('console.info("info");')).toBe('')
    })

    it('should remove console.debug', () => {
      expect(rule.apply('console.debug("debug");')).toBe('')
    })

    it('should not remove code with console in strings', () => {
      const code = 'const s = "console.log is great"'
      expect(rule.apply(code)).toBe(code)
    })
  })
})

describe('CodeMinifier', () => {
  describe('constructor defaults', () => {
    it('should have default options', () => {
      const minifier = new CodeMinifier()
      const opts = minifier.getOptions()
      expect(opts.removeComments).toBe(true)
      expect(opts.removeWhitespace).toBe(true)
      expect(opts.mangleVariables).toBe(false)
      expect(opts.removeDeadCode).toBe(false)
      expect(opts.collapseBooleans).toBe(true)
      expect(opts.minifyStrings).toBe(false)
      expect(opts.preserveLineBreaks).toBe(false)
    })

    it('should accept partial options', () => {
      const minifier = new CodeMinifier({ mangleVariables: true })
      const opts = minifier.getOptions()
      expect(opts.mangleVariables).toBe(true)
      expect(opts.removeComments).toBe(true)
    })
  })

  describe('minify basic', () => {
    it('should minify code with comments and whitespace', () => {
      const minifier = new CodeMinifier()
      const code = '// comment\nconst  x   = 1;'
      const result = minifier.minify(code)
      expect(result.minified).not.toContain('// comment')
      expect(result.minified).not.toContain('  ')
    })

    it('should return a MinifyResult with all fields', () => {
      const minifier = new CodeMinifier()
      const result = minifier.minify('const x = 1')
      expect(result).toHaveProperty('original')
      expect(result).toHaveProperty('minified')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('minifiedSize')
      expect(result).toHaveProperty('savings')
      expect(result).toHaveProperty('rulesApplied')
    })
  })

  describe('minify with all options off', () => {
    it('should still apply shorten-undefined and remove-console', () => {
      const minifier = new CodeMinifier({
        removeComments: false,
        removeWhitespace: false,
        collapseBooleans: false,
      })
      const code = 'const x = undefined'
      const result = minifier.minify(code)
      expect(result.minified).toContain('void 0')
    })

    it('should preserve comments when removeComments is false', () => {
      const minifier = new CodeMinifier({
        removeComments: false,
        removeWhitespace: false,
        collapseBooleans: false,
      })
      const code = '// keep this\nconst x = 1'
      const result = minifier.minify(code)
      expect(result.minified).toContain('// keep this')
    })
  })

  describe('minify with collapseBooleans off', () => {
    it('should not collapse booleans', () => {
      const minifier = new CodeMinifier({ collapseBooleans: false, removeWhitespace: false, removeComments: false })
      const code = 'const x = true'
      const result = minifier.minify(code)
      expect(result.minified).toContain('true')
    })
  })

  describe('minify result has stats', () => {
    it('should calculate originalSize correctly', () => {
      const minifier = new CodeMinifier()
      const code = 'const x = 1'
      const result = minifier.minify(code)
      expect(result.originalSize).toBe(code.length)
    })

    it('should calculate minifiedSize correctly', () => {
      const minifier = new CodeMinifier()
      const code = 'const  x  =  1'
      const result = minifier.minify(code)
      expect(result.minifiedSize).toBe(result.minified.length)
    })

    it('should calculate savings as percentage', () => {
      const minifier = new CodeMinifier()
      const code = '// very long comment that should be removed\nconst x = 1'
      const result = minifier.minify(code)
      expect(result.savings).toBeGreaterThan(0)
      expect(result.savings).toBeLessThanOrEqual(100)
    })

    it('should return 0 savings for identical content', () => {
      const minifier = new CodeMinifier({ removeComments: false, removeWhitespace: false, collapseBooleans: false })
      const code = 'x'
      const result = minifier.minify(code)
      expect(result.savings).toBeGreaterThanOrEqual(0)
    })

    it('should list applied rules', () => {
      const minifier = new CodeMinifier()
      const result = minifier.minify('const x = 1')
      expect(result.rulesApplied.length).toBeGreaterThan(0)
    })
  })

  describe('minifyBatch', () => {
    it('should minify multiple files', () => {
      const minifier = new CodeMinifier()
      const files = new Map<string, string>()
      files.set('a.ts', 'const  x = 1')
      files.set('b.ts', '// comment\nconst y = 2')
      const results = minifier.minifyBatch(files)
      expect(results.size).toBe(2)
      expect(results.get('a.ts')!.minified).toBeDefined()
      expect(results.get('b.ts')!.minified).toBeDefined()
    })

    it('should return independent results per file', () => {
      const minifier = new CodeMinifier()
      const files = new Map<string, string>()
      files.set('a.ts', '// long comment here\nconst x = 1')
      files.set('b.ts', 'const y = 2')
      const results = minifier.minifyBatch(files)
      const resultA = results.get('a.ts')!
      const resultB = results.get('b.ts')!
      expect(resultA.original).not.toBe(resultB.original)
      expect(resultA.original).toContain('long comment')
      expect(resultB.original).toBe('const y = 2')
    })
  })

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const minifier = new CodeMinifier({ mangleVariables: true })
      const opts = minifier.getOptions()
      opts.mangleVariables = false
      expect(minifier.getOptions().mangleVariables).toBe(true)
    })
  })

  describe('estimateSavings', () => {
    it('should return the savings percentage', () => {
      const minifier = new CodeMinifier()
      const code = '// very long comment that should be removed\nconst x = 1'
      const savings = minifier.estimateSavings(code)
      expect(savings).toBeGreaterThan(0)
    })

    it('should return a number', () => {
      const minifier = new CodeMinifier()
      const savings = minifier.estimateSavings('const x = 1')
      expect(typeof savings).toBe('number')
    })
  })

  describe('getDefaultRules', () => {
    it('should delegate to engine', () => {
      const minifier = new CodeMinifier()
      const rules = minifier.getDefaultRules()
      expect(rules).toHaveLength(8)
    })
  })
})

describe('Edge cases', () => {
  it('should handle empty string', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('')
    expect(result.minified).toBe('')
    expect(result.originalSize).toBe(0)
    expect(result.savings).toBe(0)
  })

  it('should handle already minified code', () => {
    const minifier = new CodeMinifier()
    const code = 'const x=1'
    const result = minifier.minify(code)
    expect(result.minified).toBe('const x=1')
  })

  it('should handle code with only comments', () => {
    const minifier = new CodeMinifier()
    const code = '// only a comment\n/* another comment */'
    const result = minifier.minify(code)
    expect(result.savings).toBeGreaterThan(0)
  })

  it('should handle code with mixed content', () => {
    const minifier = new CodeMinifier()
    const code = [
      '// file header',
      'const x = 1;',
      '',
      '/* block',
      '   comment */',
      'const  y  =  2;',
      'console.log("debug");',
      '',
      'const z = true;',
      'const w = undefined;',
    ].join('\n')
    const result = minifier.minify(code)
    expect(result.minified).not.toContain('// file header')
    expect(result.minified).not.toContain('console.log')
    expect(result.minified).not.toContain('undefined')
  })

  it('should preserve string content', () => {
    const minifier = new CodeMinifier({ removeComments: false })
    const code = 'const s = "hello   world   test"'
    const result = minifier.minify(code)
    expect(result.minified).toContain('hello   world   test')
  })

  it('should handle code with single-quoted strings', () => {
    const minifier = new CodeMinifier({ removeComments: false })
    const code = "const s = 'hello   world'"
    const result = minifier.minify(code)
    expect(result.minified).toContain('hello   world')
  })

  it('should handle template literal strings', () => {
    const minifier = new CodeMinifier({ removeComments: false })
    const code = 'const s = `hello   world`'
    const result = minifier.minify(code)
    expect(result.minified).toContain('hello   world')
  })

  it('should handle minifyFile with string content', () => {
    const minifier = new CodeMinifier()
    const code = '// comment\nconst x = 1'
    const result = minifier.minifyFile(code)
    expect(result.minified).not.toContain('// comment')
  })

  it('should handle engine apply with rulesToApply filter', () => {
    const engine = new MinifierEngine()
    const defaultRules = MinifierEngine.getDefaultRules()
    for (const rule of defaultRules) {
      engine.addRule(rule)
    }
    const code = 'const  x  =  1 // comment'
    const result = engine.apply(code, { rulesToApply: ['collapse-whitespace'] })
    expect(result).toContain('const x = 1')
    expect(result).toContain('// comment')
  })

  it('should handle collapse-whitespace with mixed spaces and tabs', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'collapse-whitespace')!
    expect(rule.apply('const \t x \t = \t 1')).toBe('const x = 1')
  })

  it('should handle remove-single-line-comments with multiple lines', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-single-line-comments')!
    const code = 'const a = 1 // first\nconst b = 2 // second'
    expect(rule.apply(code)).toBe('const a = 1\nconst b = 2')
  })

  it('should handle remove-empty-lines with multiple consecutive blank lines', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-empty-lines')!
    expect(rule.apply('a\n\n\n\n\nb')).toBe('a\nb')
  })

  it('should handle collapse-booleans with comparison operators', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'collapse-booleans')!
    expect(rule.apply('x === true')).toBe('x === !0')
  })

  it('should handle shorten-undefined in return statement', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'shorten-undefined')!
    expect(rule.apply('return undefined')).toBe('return void 0')
  })

  it('should handle remove-console without semicolon', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-console')!
    expect(rule.apply('console.log("hello")')).toBe('')
  })

  it('should handle remove-console with multiple arguments', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-console')!
    expect(rule.apply('console.log("a", "b", "c");')).toBe('')
  })

  it('should not remove console calls that are not statements', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'remove-console')!
    const code = 'const x = console.log("a")'
    expect(rule.apply(code)).toBe(code)
  })

  it('should handle DEFAULT_MINIFY_OPTIONS values', () => {
    expect(DEFAULT_MINIFY_OPTIONS.removeComments).toBe(true)
    expect(DEFAULT_MINIFY_OPTIONS.removeWhitespace).toBe(true)
    expect(DEFAULT_MINIFY_OPTIONS.mangleVariables).toBe(false)
    expect(DEFAULT_MINIFY_OPTIONS.removeDeadCode).toBe(false)
    expect(DEFAULT_MINIFY_OPTIONS.collapseBooleans).toBe(true)
    expect(DEFAULT_MINIFY_OPTIONS.minifyStrings).toBe(false)
    expect(DEFAULT_MINIFY_OPTIONS.preserveLineBreaks).toBe(false)
  })

  it('should handle barrel re-exports from code-minifier', () => {
    const minifier = new CodeMinifier()
    expect(minifier).toBeInstanceOf(CodeMinifier)
    expect(minifier.getDefaultRules()).toHaveLength(8)
  })

  it('should handle MinifyResult type correctly', () => {
    const minifier = new CodeMinifier()
    const result: MinifyResult = minifier.minify('const x = 1')
    expect(typeof result.original).toBe('string')
    expect(typeof result.minified).toBe('string')
    expect(typeof result.originalSize).toBe('number')
    expect(typeof result.minifiedSize).toBe('number')
    expect(typeof result.savings).toBe('number')
    expect(Array.isArray(result.rulesApplied)).toBe(true)
  })

  it('should handle MinifyOptions type correctly', () => {
    const opts: MinifyOptions = { ...DEFAULT_MINIFY_OPTIONS }
    expect(typeof opts.removeComments).toBe('boolean')
    expect(typeof opts.removeWhitespace).toBe('boolean')
    expect(typeof opts.mangleVariables).toBe('boolean')
    expect(typeof opts.removeDeadCode).toBe('boolean')
    expect(typeof opts.collapseBooleans).toBe('boolean')
    expect(typeof opts.minifyStrings).toBe('boolean')
    expect(typeof opts.preserveLineBreaks).toBe('boolean')
  })

  it('should handle collapse-booleans not affecting trueType-like identifiers', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'collapse-booleans')!
    expect(rule.apply('const trueType = 1')).toBe('const trueType = 1')
    expect(rule.apply('const falsetto = 1')).toBe('const falsetto = 1')
  })

  it('should handle shorten-undefined at end of line', () => {
    const rule = MinifierEngine.getDefaultRules().find((r) => r.name === 'shorten-undefined')!
    expect(rule.apply('let x = undefined')).toBe('let x = void 0')
  })

  it('should handle savings calculation for zero-length original', () => {
    const minifier = new CodeMinifier()
    const result = minifier.minify('')
    expect(result.savings).toBe(0)
  })

  it('should handle engine with rulesToApply as empty array', () => {
    const engine = new MinifierEngine()
    engine.addRule({ name: 'test', apply: (c) => c.toUpperCase() })
    expect(engine.apply('hello', { rulesToApply: [] })).toBe('hello')
  })

  it('should handle preserveLineBreaks option set', () => {
    const minifier = new CodeMinifier({ preserveLineBreaks: true })
    expect(minifier.getOptions().preserveLineBreaks).toBe(true)
  })

  it('should handle minifyStrings option set', () => {
    const minifier = new CodeMinifier({ minifyStrings: true })
    expect(minifier.getOptions().minifyStrings).toBe(true)
  })

  it('should handle removeDeadCode option set', () => {
    const minifier = new CodeMinifier({ removeDeadCode: true })
    expect(minifier.getOptions().removeDeadCode).toBe(true)
  })
})
