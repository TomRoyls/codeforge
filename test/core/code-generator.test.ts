import { describe, it, expect } from 'vitest'
import { CodeGenerator } from '../../src/core/code-generator/code-generator.js'
import type {
  CodeFragment,
  GeneratorConfig,
} from '../../src/core/code-generator/types.js'
import { DEFAULT_GENERATOR_CONFIG } from '../../src/core/code-generator/types.js'

function makeFragment(
  type: string,
  content: string,
  overrides: Partial<CodeFragment> = {},
): CodeFragment {
  return {
    type,
    content,
    indent: 0,
    children: [],
    ...overrides,
  }
}

describe('CodeGenerator', () => {
  describe('Construction', () => {
    it('should create generator with default config', () => {
      const gen = new CodeGenerator()
      expect(gen.getFragments()).toEqual([])
    })

    it('should create generator with custom config', () => {
      const gen = new CodeGenerator({
        context: { language: 'python', indentStyle: 'spaces', indentSize: 4, maxLineLength: 120 },
      })
      const result = gen.generate()
      expect(result.code).toBe('')
    })

    it('should merge partial context with defaults', () => {
      const gen = new CodeGenerator({
        context: { indentSize: 4 },
      } as Partial<GeneratorConfig>)
      gen.addFragment(makeFragment('raw', 'hello'))
      const result = gen.generate()
      expect(result.code).toBe('hello')
    })

    it('should accept partial config options', () => {
      const gen = new CodeGenerator({ initialIndent: 2, maxIndent: 8 })
      gen.addFragment(makeFragment('raw', 'test'))
      const result = gen.generate()
      expect(result.code).toContain('test')
    })

    it('should use custom newline character', () => {
      const gen = new CodeGenerator({ newline: '\r\n' })
      gen.addFragment(makeFragment('raw', 'line1'))
      gen.addFragment(makeFragment('raw', 'line2'))
      const result = gen.generate()
      expect(result.code).toBe('line1\r\nline2')
    })

    it('should use initial indent from config', () => {
      const gen = new CodeGenerator({ initialIndent: 2 })
      gen.addFragment(makeFragment('raw', 'hello'))
      const result = gen.generate()
      expect(result.code).toBe('    hello')
    })
  })

  describe('Fragment management', () => {
    it('should add a fragment', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'hello'))
      expect(gen.getFragments()).toHaveLength(1)
    })

    it('should return all added fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a'))
      gen.addFragment(makeFragment('raw', 'b'))
      gen.addFragment(makeFragment('raw', 'c'))
      expect(gen.getFragments()).toHaveLength(3)
    })

    it('should return a copy of fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'original'))
      const fragments = gen.getFragments()
      fragments[0]!.content = 'modified'
      expect(gen.getFragments()[0]!.content).toBe('original')
    })

    it('should copy children array on add', () => {
      const gen = new CodeGenerator()
      const children = [makeFragment('raw', 'child')]
      gen.addFragment(makeFragment('raw', 'parent', { children }))
      children.push(makeFragment('raw', 'extra'))
      expect(gen.getFragments()[0]!.children).toHaveLength(1)
    })

    it('should add fragment with nested children', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('raw', 'parent', {
          children: [
            makeFragment('raw', 'child1'),
            makeFragment('raw', 'child2'),
          ],
        }),
      )
      expect(gen.getFragments()[0]!.children).toHaveLength(2)
    })

    it('should return empty array for new generator', () => {
      const gen = new CodeGenerator()
      expect(gen.getFragments()).toEqual([])
    })

    it('should add fragment with empty content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', ''))
      expect(gen.getFragments()).toHaveLength(1)
      expect(gen.getFragments()[0]!.content).toBe('')
    })

    it('should preserve fragment type', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('function', 'myFunc()'))
      expect(gen.getFragments()[0]!.type).toBe('function')
    })
  })

  describe('Code generation', () => {
    it('should generate empty code with no fragments', () => {
      const gen = new CodeGenerator()
      const result = gen.generate()
      expect(result.code).toBe('')
      expect(result.lineCount).toBe(0)
      expect(result.charCount).toBe(0)
    })

    it('should generate single fragment', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'console.log("hello")'))
      const result = gen.generate()
      expect(result.code).toBe('console.log("hello")')
    })

    it('should join multiple fragments with newline', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'line1'))
      gen.addFragment(makeFragment('raw', 'line2'))
      const result = gen.generate()
      expect(result.code).toBe('line1\nline2')
    })

    it('should return correct lineCount', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'line1\nline2\nline3'))
      const result = gen.generate()
      expect(result.lineCount).toBe(3)
    })

    it('should return correct charCount', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'hello'))
      const result = gen.generate()
      expect(result.charCount).toBe(5)
    })

    it('should return fragments copy in result', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'test'))
      const result = gen.generate()
      expect(result.fragments).toHaveLength(1)
      expect(result.fragments[0]!.content).toBe('test')
    })

    it('should apply interpolation during generation', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'Hello {{name}}!'))
      const result = gen.generate({ name: 'World' })
      expect(result.code).toBe('Hello World!')
    })

    it('should handle multiline content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a\nb\nc'))
      const result = gen.generate()
      expect(result.code).toBe('a\nb\nc')
    })

    it('should trim trailing whitespace by default', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'hello   '))
      const result = gen.generate()
      expect(result.code).toBe('hello')
    })

    it('should skip empty rendered fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', ''))
      gen.addFragment(makeFragment('raw', 'visible'))
      const result = gen.generate()
      expect(result.code).toBe('visible')
    })
  })

  describe('Indentation', () => {
    it('should increase indent level', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.addFragment(makeFragment('raw', 'indented'))
      const result = gen.generate()
      expect(result.code).toBe('  indented')
    })

    it('should decrease indent level', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.indent()
      gen.dedent()
      gen.addFragment(makeFragment('raw', 'one level'))
      const result = gen.generate()
      expect(result.code).toBe('  one level')
    })

    it('should not go below zero indent', () => {
      const gen = new CodeGenerator()
      gen.dedent()
      gen.addFragment(makeFragment('raw', 'zero'))
      const result = gen.generate()
      expect(result.code).toBe('zero')
    })

    it('should respect maxIndent', () => {
      const gen = new CodeGenerator({ maxIndent: 2 })
      gen.indent()
      gen.indent()
      gen.indent()
      gen.indent()
      gen.addFragment(makeFragment('raw', 'maxed'))
      const result = gen.generate()
      expect(result.code).toBe('    maxed')
    })

    it('should affect rendering after indent', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'level0'))
      gen.indent()
      gen.addFragment(makeFragment('raw', 'level1'))
      gen.indent()
      gen.addFragment(makeFragment('raw', 'level2'))
      const result = gen.generate()
      expect(result.code).toBe('level0\n  level1\n    level2')
    })

    it('should handle indent and dedent combination', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.indent()
      gen.dedent()
      gen.addFragment(makeFragment('raw', 'back'))
      const result = gen.generate()
      expect(result.code).toBe('  back')
    })

    it('should use fragment indent offset', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'extra', { indent: 2 }))
      const result = gen.generate()
      expect(result.code).toBe('    extra')
    })

    it('should combine generator indent with fragment indent', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.addFragment(makeFragment('raw', 'combined', { indent: 1 }))
      const result = gen.generate()
      expect(result.code).toBe('    combined')
    })
  })

  describe('Interpolation', () => {
    it('should replace single variable', () => {
      const gen = new CodeGenerator()
      expect(gen.interpolate('Hello {{name}}!', { name: 'World' })).toBe(
        'Hello World!',
      )
    })

    it('should replace multiple variables', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('{{a}} and {{b}}', { a: 'foo', b: 'bar' }),
      ).toBe('foo and bar')
    })

    it('should leave unreferenced variables intact', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('{{a}} {{unknown}}', { a: 'hello' }),
      ).toBe('hello {{unknown}}')
    })

    it('should handle empty variables object', () => {
      const gen = new CodeGenerator()
      expect(gen.interpolate('no vars', {})).toBe('no vars')
    })

    it('should handle repeated variables', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('{{x}}+{{x}}', { x: '1' }),
      ).toBe('1+1')
    })

    it('should handle adjacent variables', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('{{a}}{{b}}', { a: 'hel', b: 'lo' }),
      ).toBe('hello')
    })

    it('should handle special characters in variable values', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('path: {{p}}', { p: '/usr/local/bin' }),
      ).toBe('path: /usr/local/bin')
    })

    it('should handle empty string variable value', () => {
      const gen = new CodeGenerator()
      expect(
        gen.interpolate('before{{x}}after', { x: '' }),
      ).toBe('beforeafter')
    })
  })

  describe('Block rendering', () => {
    it('should render function block with braces', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('function', 'function greet()', {
          children: [makeFragment('raw', "console.log('hi')")],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('function greet() {')
      expect(result.code).toContain("console.log('hi')")
      expect(result.code).toContain('}')
    })

    it('should render if block', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('if', 'if (x > 0)', {
          children: [makeFragment('raw', 'doSomething()')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('if (x > 0) {')
      expect(result.code).toContain('doSomething()')
      expect(result.code).toContain('}')
    })

    it('should render class block', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('class', 'class Foo', {
          children: [makeFragment('raw', 'x = 1')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('class Foo {')
      expect(result.code).toContain('  x = 1')
      expect(result.code).toContain('}')
    })

    it('should render for loop block', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('for', 'for (let i = 0; i < 10; i++)', {
          children: [makeFragment('raw', 'process(i)')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('for (let i = 0; i < 10; i++) {')
      expect(result.code).toContain('  process(i)')
    })

    it('should render while block', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('while', 'while (running)', {
          children: [makeFragment('raw', 'tick()')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('while (running) {')
      expect(result.code).toContain('  tick()')
    })

    it('should render nested blocks', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('function', 'function outer()', {
          children: [
            makeFragment('if', 'if (cond)', {
              children: [makeFragment('raw', 'return true')],
            }),
          ],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('function outer() {')
      expect(result.code).toContain('  if (cond) {')
      expect(result.code).toContain('    return true')
      expect(result.code).toContain('  }')
      expect(result.code).toContain('}')
    })

    it('should render block with empty content using type', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('if', '', {
          children: [makeFragment('raw', 'body')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('if {')
    })

    it('should render Python-style blocks', () => {
      const gen = new CodeGenerator({
        context: {
          language: 'python',
          indentStyle: 'spaces',
          indentSize: 4,
          maxLineLength: 80,
        },
      })
      gen.addFragment(
        makeFragment('function', 'def greet()', {
          children: [makeFragment('raw', "print('hi')")],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('def greet():')
      expect(result.code).toContain("    print('hi')")
      expect(result.code).not.toContain('{')
    })

    it('should render else block', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('else', 'else', {
          children: [makeFragment('raw', 'fallback()')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('else {')
      expect(result.code).toContain('  fallback()')
      expect(result.code).toContain('}')
    })

    it('should apply interpolation in block content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('function', 'function {{name}}()', {
          children: [makeFragment('raw', 'return {{value}}')],
        }),
      )
      const result = gen.generate({ name: 'add', value: '42' })
      expect(result.code).toContain('function add()')
      expect(result.code).toContain('return 42')
    })

    it('should render block with multiple children', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('function', 'fn()', {
          children: [
            makeFragment('raw', 'const x = 1'),
            makeFragment('raw', 'return x'),
          ],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('  const x = 1')
      expect(result.code).toContain('  return x')
    })
  })

  describe('Statistics', () => {
    it('should return zeros for empty generator', () => {
      const gen = new CodeGenerator()
      const stats = gen.getStatistics()
      expect(stats.fragmentCount).toBe(0)
      expect(stats.totalLines).toBe(0)
      expect(stats.totalChars).toBe(0)
    })

    it('should count top-level fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a'))
      gen.addFragment(makeFragment('raw', 'b'))
      expect(gen.getStatistics().fragmentCount).toBe(2)
    })

    it('should count content characters', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'hello'))
      expect(gen.getStatistics().totalChars).toBe(5)
    })

    it('should count content lines', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a\nb\nc'))
      expect(gen.getStatistics().totalLines).toBe(3)
    })

    it('should include nested children in counts', () => {
      const gen = new CodeGenerator()
      gen.addFragment(
        makeFragment('raw', 'parent', {
          children: [makeFragment('raw', 'child')],
        }),
      )
      const stats = gen.getStatistics()
      expect(stats.totalChars).toBe('parent'.length + 'child'.length)
      expect(stats.totalLines).toBe(2)
    })

    it('should skip empty content in statistics', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', ''))
      const stats = gen.getStatistics()
      expect(stats.fragmentCount).toBe(1)
      expect(stats.totalChars).toBe(0)
      expect(stats.totalLines).toBe(0)
    })
  })

  describe('Clear and reset', () => {
    it('should clear all fragments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'test'))
      gen.clear()
      expect(gen.getFragments()).toEqual([])
    })

    it('should reset indent level', () => {
      const gen = new CodeGenerator()
      gen.indent()
      gen.indent()
      gen.clear()
      gen.addFragment(makeFragment('raw', 'reset'))
      const result = gen.generate()
      expect(result.code).toBe('reset')
    })

    it('should allow adding fragments after clear', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'before'))
      gen.clear()
      gen.addFragment(makeFragment('raw', 'after'))
      expect(gen.getFragments()).toHaveLength(1)
      expect(gen.getFragments()[0]!.content).toBe('after')
    })

    it('should generate empty code after clear', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'data'))
      gen.clear()
      const result = gen.generate()
      expect(result.code).toBe('')
      expect(result.lineCount).toBe(0)
    })

    it('should reset statistics after clear', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'content'))
      gen.clear()
      const stats = gen.getStatistics()
      expect(stats.fragmentCount).toBe(0)
      expect(stats.totalChars).toBe(0)
      expect(stats.totalLines).toBe(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty fragment content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', ''))
      const result = gen.generate()
      expect(result.code).toBe('')
    })

    it('should handle fragment with only whitespace', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', '   '))
      const result = gen.generate()
      expect(result.code).toBe('')
    })

    it('should handle deeply nested fragments', () => {
      const gen = new CodeGenerator()
      let fragment = makeFragment('raw', 'leaf')
      for (let i = 0; i < 5; i++) {
        fragment = makeFragment('raw', `level${i}`, {
          children: [fragment],
        })
      }
      gen.addFragment(fragment)
      const result = gen.generate()
      expect(result.code).toContain('leaf')
    })

    it('should handle many fragments', () => {
      const gen = new CodeGenerator()
      for (let i = 0; i < 50; i++) {
        gen.addFragment(makeFragment('raw', `line${i}`))
      }
      const result = gen.generate()
      expect(result.lineCount).toBe(50)
    })

    it('should handle special characters in template', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a < b > c & d'))
      const result = gen.generate()
      expect(result.code).toBe('a < b > c & d')
    })

    it('should handle multiline content in fragment', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'a\nb\nc'))
      const result = gen.generate()
      expect(result.code).toBe('a\nb\nc')
    })

    it('should handle empty children array', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'parent', { children: [] }))
      const result = gen.generate()
      expect(result.code).toBe('parent')
    })

    it('should handle fragment with large indent', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'deep', { indent: 10 }))
      const result = gen.generate()
      expect(result.code).toContain('                    deep')
    })

    it('should handle interpolation with no template markers', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'plain text'))
      const result = gen.generate({ unused: 'value' })
      expect(result.code).toBe('plain text')
    })

    it('should handle generate with no arguments', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'test'))
      const result = gen.generate()
      expect(result.code).toBe('test')
    })

    it('should handle unicode content', () => {
      const gen = new CodeGenerator()
      gen.addFragment(makeFragment('raw', 'こんにちは'))
      const result = gen.generate()
      expect(result.code).toBe('こんにちは')
    })
  })

  describe('Config options', () => {
    it('should use tabs for indentStyle tabs', () => {
      const gen = new CodeGenerator({
        context: {
          language: 'typescript',
          indentStyle: 'tabs',
          indentSize: 2,
          maxLineLength: 80,
        },
      })
      gen.indent()
      gen.addFragment(makeFragment('raw', 'tabbed'))
      const result = gen.generate()
      expect(result.code).toBe('\ttabbed')
    })

    it('should use custom indent size', () => {
      const gen = new CodeGenerator({
        context: {
          language: 'typescript',
          indentStyle: 'spaces',
          indentSize: 4,
          maxLineLength: 80,
        },
      })
      gen.indent()
      gen.addFragment(makeFragment('raw', 'indented'))
      const result = gen.generate()
      expect(result.code).toBe('    indented')
    })

    it('should disable trailing whitespace trim', () => {
      const gen = new CodeGenerator({ trimTrailingWhitespace: false })
      gen.addFragment(makeFragment('raw', 'hello   '))
      const result = gen.generate()
      expect(result.code).toBe('hello   ')
    })

    it('should use custom initial indent', () => {
      const gen = new CodeGenerator({ initialIndent: 1 })
      gen.addFragment(makeFragment('raw', 'offset'))
      const result = gen.generate()
      expect(result.code).toBe('  offset')
    })

    it('should enforce custom maxIndent', () => {
      const gen = new CodeGenerator({ maxIndent: 1 })
      for (let i = 0; i < 5; i++) gen.indent()
      gen.addFragment(makeFragment('raw', 'capped'))
      const result = gen.generate()
      expect(result.code).toBe('  capped')
    })

    it('should use different language context', () => {
      const gen = new CodeGenerator({
        context: {
          language: 'javascript',
          indentStyle: 'spaces',
          indentSize: 2,
          maxLineLength: 100,
        },
      })
      gen.addFragment(
        makeFragment('function', 'function test()', {
          children: [makeFragment('raw', 'return 1')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toContain('function test() {')
      expect(result.code).toContain('  return 1')
      expect(result.code).toContain('}')
    })

    it('should render Python block with colon syntax', () => {
      const gen = new CodeGenerator({
        context: {
          language: 'python',
          indentStyle: 'spaces',
          indentSize: 4,
          maxLineLength: 80,
        },
      })
      gen.addFragment(
        makeFragment('if', 'if x > 0', {
          children: [makeFragment('raw', 'print(x)')],
        }),
      )
      const result = gen.generate()
      expect(result.code).toBe('if x > 0:\n    print(x)')
    })

    it('should not mutate config after construction', () => {
      const ctx = {
        language: 'typescript' as const,
        indentStyle: 'spaces' as const,
        indentSize: 2,
        maxLineLength: 80,
      }
      const gen = new CodeGenerator({ context: ctx })
      ctx.indentSize = 8
      gen.indent()
      gen.addFragment(makeFragment('raw', 'test'))
      const result = gen.generate()
      expect(result.code).toBe('  test')
    })
  })
})

describe('DEFAULT_GENERATOR_CONFIG', () => {
  it('should have typescript as default language', () => {
    expect(DEFAULT_GENERATOR_CONFIG.context.language).toBe('typescript')
  })

  it('should have spaces as default indent style', () => {
    expect(DEFAULT_GENERATOR_CONFIG.context.indentStyle).toBe('spaces')
  })

  it('should have indent size 2', () => {
    expect(DEFAULT_GENERATOR_CONFIG.context.indentSize).toBe(2)
  })

  it('should have max line length 80', () => {
    expect(DEFAULT_GENERATOR_CONFIG.context.maxLineLength).toBe(80)
  })

  it('should have initial indent 0', () => {
    expect(DEFAULT_GENERATOR_CONFIG.initialIndent).toBe(0)
  })

  it('should have max indent 16', () => {
    expect(DEFAULT_GENERATOR_CONFIG.maxIndent).toBe(16)
  })

  it('should use newline as default separator', () => {
    expect(DEFAULT_GENERATOR_CONFIG.newline).toBe('\n')
  })

  it('should trim trailing whitespace by default', () => {
    expect(DEFAULT_GENERATOR_CONFIG.trimTrailingWhitespace).toBe(true)
  })
})

describe('CodeGenerator re-exports', () => {
  it('should export CodeFragment type through main module', () => {
    const fragment: CodeFragment = {
      type: 'raw',
      content: 'test',
      indent: 0,
      children: [],
    }
    expect(fragment.type).toBe('raw')
  })

  it('should export GeneratorConfig type through main module', () => {
    const config: GeneratorConfig = DEFAULT_GENERATOR_CONFIG
    expect(config.context.language).toBe('typescript')
  })
})
