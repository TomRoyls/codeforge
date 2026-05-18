import { CodeGenerator } from '../src/core/code-generator/code-generator.js'
import { DEFAULT_GENERATOR_CONFIG } from '../src/core/code-generator/types.js'
import type { CodeFragment } from '../src/core/code-generator/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeFragment(overrides?: Partial<CodeFragment>): CodeFragment {
  return {
    type: 'statement',
    content: 'let x = 1',
    indent: 0,
    children: [],
    ...overrides,
  }
}

// ─── Constructor ────────────────────────────────────────────────────────

describe('CodeGenerator', () => {
  describe('constructor', () => {
    it('creates with default config', () => {
      const gen = new CodeGenerator()
      expect(gen.getFragments()).toEqual([])
    })

    it('accepts custom context', () => {
      const gen = new CodeGenerator({ context: { language: 'python', indentStyle: 'spaces', indentSize: 4, maxLineLength: 120 } })
      const result = gen.generate()
      expect(result.code).toBe('')
    })

    it('accepts custom indent settings', () => {
      const gen = new CodeGenerator({ initialIndent: 2, maxIndent: 8 })
      expect(gen).toBeDefined()
    })
  })

  // ─── DEFAULT_GENERATOR_CONFIG ─────────────────────────────────────────

  describe('DEFAULT_GENERATOR_CONFIG', () => {
    it('has expected defaults', () => {
      expect(DEFAULT_GENERATOR_CONFIG.context.language).toBe('typescript')
      expect(DEFAULT_GENERATOR_CONFIG.context.indentStyle).toBe('spaces')
      expect(DEFAULT_GENERATOR_CONFIG.context.indentSize).toBe(2)
      expect(DEFAULT_GENERATOR_CONFIG.initialIndent).toBe(0)
      expect(DEFAULT_GENERATOR_CONFIG.maxIndent).toBe(16)
      expect(DEFAULT_GENERATOR_CONFIG.newline).toBe('\n')
      expect(DEFAULT_GENERATOR_CONFIG.trimTrailingWhitespace).toBe(true)
    })
  })

  // ─── addFragment / getFragments ───────────────────────────────────────

  describe('addFragment', () => {
    it('adds a fragment', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment())
      expect(gen.getFragments()).toHaveLength(1)
    })

    it('adds to current indent', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.addFragment(makeFragment())
      expect(gen.getFragments()[0]?.indent).toBe(1)
    })
  })

  describe('getFragments', () => {
    it('returns copies', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment())
      const fragments = gen.getFragments()
      fragments.pop()
      expect(gen.getFragments()).toHaveLength(1)
    })
  })

  // ─── generate ─────────────────────────────────────────────────────────

  describe('generate', () => {
    it('generates empty code with no fragments', () => {
      const gen = new CodeGenerator()
      const result = gen.generate()
      expect(result.code).toBe('')
      expect(result.lineCount).toBe(0)
      expect(result.charCount).toBe(0)
    })

    it('generates simple statement', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment())
      const result = gen.generate()
      expect(result.code).toBe('let x = 1')
      expect(result.lineCount).toBe(1)
    })

    it('generates multiple fragments separated by newline', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'const a = 1' }))
      gen.addFragment(makeFragment({ content: 'const b = 2' }))
      const result = gen.generate()
      expect(result.code).toBe('const a = 1\nconst b = 2')
    })

    it('indents with spaces', () => {
      const gen = new CodeGenerator({ context: { indentStyle: 'spaces', indentSize: 2 } })
      gen.addFragment(makeFragment({ indent: 1 }))
      const result = gen.generate()
      expect(result.code).toBe('  let x = 1')
    })

    it('indents with tabs', () => {
      const gen = new CodeGenerator({ context: { indentStyle: 'tabs', indentSize: 4 } })
      gen.addFragment(makeFragment({ indent: 1 }))
      const result = gen.generate()
      expect(result.code).toBe('\tlet x = 1')
    })

    it('trims trailing whitespace', () => {
      const gen = new CodeGenerator({ trimTrailingWhitespace: true })
      gen.addFragment(makeFragment({ content: '  hello  ' }))
      const result = gen.generate()
      expect(result.code).not.toMatch(/ +$/m)
    })

    it('preserves trailing whitespace when disabled', () => {
      const gen = new CodeGenerator({ trimTrailingWhitespace: false })
      gen.addFragment(makeFragment({ content: 'hello   ' }))
      const result = gen.generate()
      expect(result.code).toContain('hello   ')
    })
  })

  // ─── generate with block types ────────────────────────────────────────

  describe('block types', () => {
    it('renders function block with braces', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'function',
        content: 'function hello()',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'return 1', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('function hello() {')
      expect(result.code).toContain('  return 1')
      expect(result.code).toContain('}')
    })

    it('renders class block', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'class',
        content: 'class Foo',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'x = 1', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('class Foo {')
    })

    it('renders if block', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'if',
        content: 'if (true)',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'doSomething()', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('if (true) {')
    })

    it('renders python block without braces', () => {
      const gen = new CodeGenerator({ context: { language: 'python', indentStyle: 'spaces', indentSize: 4, maxLineLength: 80 } })
      gen.addFragment({
        type: 'function',
        content: 'def hello()',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'return 1', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('def hello():')
      expect(result.code).not.toContain('{')
    })

    it('renders block with empty content', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'if',
        content: '',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'x = 1', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('if {')
    })

    it('renders nested blocks', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'function',
        content: 'function foo()',
        indent: 0,
        children: [{
          type: 'if',
          content: 'if (x)',
          indent: 0,
          children: [makeFragment({ type: 'statement', content: 'return x', indent: 0 })],
        }],
      })
      const result = gen.generate()
      expect(result.code).toContain('function foo() {')
      expect(result.code).toContain('if (x) {')
      expect(result.code).toContain('return x')
    })
  })

  // ─── generate with children (non-block) ───────────────────────────────

  describe('non-block with children', () => {
    it('renders children below parent', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'comment',
        content: '// header',
        indent: 0,
        children: [makeFragment({ type: 'statement', content: 'let x = 1', indent: 0 })],
      })
      const result = gen.generate()
      expect(result.code).toContain('// header')
      expect(result.code).toContain('let x = 1')
    })
  })

  // ─── interpolate ──────────────────────────────────────────────────────

  describe('interpolate', () => {
    it('replaces variables', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'const {{name}} = {{value}}' }))
      const result = gen.generate({ name: 'x', value: '42' })
      expect(result.code).toBe('const x = 42')
    })

    it('leaves unreplaced variables', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'const {{name}} = 1' }))
      const result = gen.generate()
      expect(result.code).toBe('const {{name}} = 1')
    })

    it('replaces multiple occurrences', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: '{{x}} + {{x}}' }))
      const result = gen.generate({ x: '1' })
      expect(result.code).toBe('1 + 1')
    })
  })

  // ─── indent / dedent ─────────────────────────────────────────────────

  describe('indent', () => {
    it('increases current indent', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.addFragment(makeFragment({ content: 'x = 1' }))
      const result = gen.generate()
      expect(result.code).toBe('  x = 1')
    })

    it('respects maxIndent', () => {
      const gen = new CodeGenerator({ maxIndent: 2 })
      gen.indent()
      gen.indent()
      gen.indent()
      gen.indent()
      gen.addFragment(makeFragment({ content: 'x = 1' }))
      const result = gen.generate()
      expect(result.code).toBe('    x = 1')
    })
  })

  describe('dedent', () => {
    it('decreases current indent', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.indent()
      gen.dedent()
      gen.addFragment(makeFragment({ content: 'x = 1' }))
      const result = gen.generate()
      expect(result.code).toBe('  x = 1')
    })

    it('does not go below 0', () => {
      const gen = new CodeGenerator()
      gen.dedent()
      gen.addFragment(makeFragment({ content: 'x = 1' }))
      const result = gen.generate()
      expect(result.code).toBe('x = 1')
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns zeros with no fragments', () => {
      const gen = new CodeGenerator()
      const stats = gen.getStatistics()
      expect(stats.fragmentCount).toBe(0)
      expect(stats.totalLines).toBe(0)
      expect(stats.totalChars).toBe(0)
    })

    it('counts fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment())
      gen.addFragment(makeFragment({ content: 'y = 2' }))
      expect(gen.getStatistics().fragmentCount).toBe(2)
    })

    it('counts lines in content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'a\nb\nc' }))
      expect(gen.getStatistics().totalLines).toBe(3)
    })

    it('counts chars in content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'hello' }))
      expect(gen.getStatistics().totalChars).toBe(5)
    })

    it('counts child fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'function',
        content: 'function f()',
        indent: 0,
        children: [makeFragment({ content: 'return 1' })],
      })
      expect(gen.getStatistics().fragmentCount).toBe(1)
      expect(gen.getStatistics().totalChars).toBeGreaterThan(0)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears fragments and resets indent', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment())
      gen.indent()
      gen.clear()
      expect(gen.getFragments()).toEqual([])
      gen.addFragment(makeFragment({ content: 'x' }))
      const result = gen.generate()
      expect(result.code).toBe('x')
    })
  })

  // ─── edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: '' }))
      const result = gen.generate()
      expect(result.code).toBe('')
    })

    it('handles multiline content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'line1\nline2\nline3' }))
      const result = gen.generate()
      expect(result.code).toContain('\n')
      expect(result.lineCount).toBe(3)
    })

    it('handles custom newline', () => {
      const gen = new CodeGenerator({ newline: '\r\n' })
      gen.addFragment(makeFragment({ content: 'a' }))
      gen.addFragment(makeFragment({ content: 'b' }))
      const result = gen.generate()
      expect(result.code).toBe('a\r\nb')
    })

    it('skips empty rendered fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: '' }))
      gen.addFragment(makeFragment({ content: 'visible' }))
      const result = gen.generate()
      expect(result.code).toBe('visible')
    })

    it('respects indentSize for spaces', () => {
      const gen = new CodeGenerator({ context: { indentStyle: 'spaces', indentSize: 4, maxLineLength: 80 } })
      gen.addFragment(makeFragment({ indent: 1 }))
      const result = gen.generate()
      expect(result.code).toBe('    let x = 1')
    })

    it('handles blank lines in content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment({ content: 'a\n\nb' }))
      const result = gen.generate()
      expect(result.lineCount).toBe(3)
    })

    it('handles for block type', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'for',
        content: 'for (let i = 0; i < 10; i++)',
        indent: 0,
        children: [makeFragment({ content: 'console.log(i)' })],
      })
      const result = gen.generate()
      expect(result.code).toContain('for (let i = 0; i < 10; i++) {')
    })

    it('handles try/catch block types', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'try',
        content: 'try',
        indent: 0,
        children: [makeFragment({ content: 'doWork()' })],
      })
      const result = gen.generate()
      expect(result.code).toContain('try {')
    })

    it('handles switch block type', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'switch',
        content: 'switch (x)',
        indent: 0,
        children: [makeFragment({ content: 'case 1: break;' })],
      })
      const result = gen.generate()
      expect(result.code).toContain('switch (x) {')
    })

    it('handles interface block type', () => {
      const gen = new CodeGenerator()
      gen.addFragment({
        type: 'interface',
        content: 'interface Foo',
        indent: 0,
        children: [makeFragment({ content: 'x: number' })],
      })
      const result = gen.generate()
      expect(result.code).toContain('interface Foo {')
    })
  })
})
