import { describe, it, expect } from 'vitest'
import { TemplateParser } from '../../src/core/template-engine/template-parser.js'
import { TemplateEngine } from '../../src/core/template-engine/template-engine.js'
import type { TemplateToken, TemplateContext } from '../../src/core/template-engine/types.js'
import { DEFAULT_TEMPLATE_CONFIG } from '../../src/core/template-engine/types.js'

describe('TemplateParser', () => {
  const parser = new TemplateParser()

  describe('tokenize', () => {
    it('should tokenize plain text', () => {
      const tokens = parser.tokenize('hello world')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('text')
      expect(tokens[0]!.content).toBe('hello world')
    })

    it('should tokenize a single variable', () => {
      const tokens = parser.tokenize('{{name}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('variable')
      expect(tokens[0]!.content).toBe('name')
    })

    it('should tokenize text with variable', () => {
      const tokens = parser.tokenize('Hello {{name}}!')
      expect(tokens).toHaveLength(3)
      expect(tokens[0]!.type).toBe('text')
      expect(tokens[0]!.content).toBe('Hello ')
      expect(tokens[1]!.type).toBe('variable')
      expect(tokens[1]!.content).toBe('name')
      expect(tokens[2]!.type).toBe('text')
      expect(tokens[2]!.content).toBe('!')
    })

    it('should tokenize multiple variables', () => {
      const tokens = parser.tokenize('{{a}} and {{b}}')
      expect(tokens).toHaveLength(3)
      expect(tokens[0]!.content).toBe('a')
      expect(tokens[2]!.content).toBe('b')
    })

    it('should tokenize comment', () => {
      const tokens = parser.tokenize('{{! this is a comment}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('comment')
    })

    it('should tokenize partial', () => {
      const tokens = parser.tokenize('{{>header}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('partial')
      expect(tokens[0]!.content).toBe('header')
    })

    it('should tokenize conditional open', () => {
      const tokens = parser.tokenize('{{#if active}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('conditional')
      expect(tokens[0]!.condition).toBe('active')
    })

    it('should tokenize conditional close', () => {
      const tokens = parser.tokenize('{{/if}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('conditional')
      expect(tokens[0]!.content).toBe('/if')
    })

    it('should tokenize loop open', () => {
      const tokens = parser.tokenize('{{#each items}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('loop')
      expect(tokens[0]!.collection).toBe('items')
    })

    it('should tokenize loop close', () => {
      const tokens = parser.tokenize('{{/each}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('loop')
      expect(tokens[0]!.content).toBe('/each')
    })

    it('should handle unclosed delimiter gracefully', () => {
      const tokens = parser.tokenize('Hello {{name')
      expect(tokens.length).toBeGreaterThan(0)
      expect(tokens.some((t) => t.type === 'text')).toBe(true)
    })

    it('should handle empty template', () => {
      const tokens = parser.tokenize('')
      expect(tokens).toHaveLength(0)
    })

    it('should handle adjacent delimiters', () => {
      const tokens = parser.tokenize('{{a}}{{b}}')
      expect(tokens).toHaveLength(2)
      expect(tokens[0]!.content).toBe('a')
      expect(tokens[1]!.content).toBe('b')
    })
  })

  describe('parse', () => {
    it('should build tree from flat tokens', () => {
      const tokens = parser.parse('Hello {{name}}!')
      expect(tokens).toHaveLength(3)
      expect(tokens[0]!.type).toBe('text')
      expect(tokens[1]!.type).toBe('variable')
      expect(tokens[2]!.type).toBe('text')
    })

    it('should nest conditional children', () => {
      const tokens = parser.parse('{{#if active}}yes{{/if}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('conditional')
      expect(tokens[0]!.children).toBeDefined()
      expect(tokens[0]!.children).toHaveLength(1)
      expect(tokens[0]!.children![0]!.type).toBe('text')
      expect(tokens[0]!.children![0]!.content).toBe('yes')
    })

    it('should nest loop children', () => {
      const tokens = parser.parse('{{#each items}}{{this}}{{/each}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('loop')
      expect(tokens[0]!.children).toHaveLength(1)
      expect(tokens[0]!.children![0]!.type).toBe('variable')
    })

    it('should handle nested conditionals', () => {
      const tokens = parser.parse('{{#if a}}{{#if b}}inner{{/if}}{{/if}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('conditional')
      const inner = tokens[0]!.children!
      expect(inner).toHaveLength(1)
      expect(inner[0]!.type).toBe('conditional')
      expect(inner[0]!.children![0]!.content).toBe('inner')
    })

    it('should handle mixed content in conditionals', () => {
      const tokens = parser.parse('before{{#if show}}visible{{/if}}after')
      expect(tokens).toHaveLength(3)
      expect(tokens[0]!.content).toBe('before')
      expect(tokens[1]!.type).toBe('conditional')
      expect(tokens[2]!.content).toBe('after')
    })

    it('should handle loop with iterator syntax', () => {
      const tokens = parser.parse('{{#each item in items}}{{item}}{{/each}}')
      expect(tokens).toHaveLength(1)
      expect(tokens[0]!.type).toBe('loop')
      expect(tokens[0]!.iterator).toBe('item')
      expect(tokens[0]!.collection).toBe('items')
    })
  })

  describe('parseVariable', () => {
    it('should extract variable name', () => {
      const token = parser.parseVariable('  name  ')
      expect(token.type).toBe('variable')
      expect(token.content).toBe('name')
    })

    it('should handle nested path', () => {
      const token = parser.parseVariable('user.name')
      expect(token.content).toBe('user.name')
    })
  })

  describe('parseConditional', () => {
    it('should parse if condition', () => {
      const token = parser.parseConditional('#if active')
      expect(token.type).toBe('conditional')
      expect(token.condition).toBe('active')
    })

    it('should parse close if', () => {
      const token = parser.parseConditional('/if')
      expect(token.type).toBe('conditional')
      expect(token.condition).toBeUndefined()
    })
  })

  describe('parseLoop', () => {
    it('should parse each with implicit iterator', () => {
      const token = parser.parseLoop('#each items')
      expect(token.type).toBe('loop')
      expect(token.collection).toBe('items')
      expect(token.iterator).toBe('this')
    })

    it('should parse each with explicit iterator', () => {
      const token = parser.parseLoop('#each item in items')
      expect(token.type).toBe('loop')
      expect(token.iterator).toBe('item')
      expect(token.collection).toBe('items')
    })

    it('should parse close each', () => {
      const token = parser.parseLoop('/each')
      expect(token.type).toBe('loop')
      expect(token.content).toBe('/each')
    })
  })

  describe('findMatchingClose', () => {
    it('should find matching close for conditional', () => {
      const tokens: TemplateToken[] = [
        { type: 'conditional', content: '#if x', start: 0, end: 10, condition: 'x' },
        { type: 'text', content: 'inner', start: 10, end: 15 },
        { type: 'conditional', content: '/if', start: 15, end: 25 },
      ]
      expect(parser.findMatchingClose(tokens, 0, 'conditional', '/if')).toBe(2)
    })

    it('should find matching close for nested structures', () => {
      const tokens: TemplateToken[] = [
        { type: 'conditional', content: '#if a', start: 0, end: 10, condition: 'a' },
        { type: 'conditional', content: '#if b', start: 10, end: 20, condition: 'b' },
        { type: 'text', content: 'inner', start: 20, end: 25 },
        { type: 'conditional', content: '/if', start: 25, end: 35 },
        { type: 'conditional', content: '/if', start: 35, end: 45 },
      ]
      expect(parser.findMatchingClose(tokens, 0, 'conditional', '/if')).toBe(4)
    })

    it('should return -1 for unmatched', () => {
      const tokens: TemplateToken[] = [
        { type: 'conditional', content: '#if x', start: 0, end: 10, condition: 'x' },
        { type: 'text', content: 'inner', start: 10, end: 15 },
      ]
      expect(parser.findMatchingClose(tokens, 0, 'conditional', '/if')).toBe(-1)
    })
  })

  describe('extractVarName', () => {
    it('should extract clean variable name', () => {
      expect(parser.extractVarName('name')).toBe('name')
    })

    it('should handle whitespace', () => {
      expect(parser.extractVarName('  name  ')).toBe('name')
    })

    it('should handle delimiter wrapping', () => {
      expect(parser.extractVarName('{{name}}')).toBe('name')
    })
  })
})

describe('TemplateEngine', () => {
  describe('constructor', () => {
    it('should use default config', () => {
      const engine = new TemplateEngine()
      const config = engine.getConfig()
      expect(config.openDelimiter).toBe('{{')
      expect(config.closeDelimiter).toBe('}}')
      expect(config.escape).toBe(true)
      expect(config.strict).toBe(false)
    })

    it('should accept custom config', () => {
      const engine = new TemplateEngine({ escape: false, strict: true })
      const config = engine.getConfig()
      expect(config.escape).toBe(false)
      expect(config.strict).toBe(true)
    })
  })

  describe('render - variables', () => {
    const engine = new TemplateEngine()

    it('should render a simple variable', () => {
      expect(engine.render('{{name}}', { name: 'World' })).toBe('World')
    })

    it('should render text with variable', () => {
      expect(engine.render('Hello {{name}}!', { name: 'World' })).toBe('Hello World!')
    })

    it('should render multiple variables', () => {
      expect(
        engine.render('{{greeting}} {{name}}', { greeting: 'Hello', name: 'World' }),
      ).toBe('Hello World')
    })

    it('should render numeric values', () => {
      expect(engine.render('{{count}}', { count: 42 })).toBe('42')
    })

    it('should render boolean values', () => {
      expect(engine.render('{{active}}', { active: true })).toBe('true')
    })

    it('should render nested property access', () => {
      expect(
        engine.render('{{user.name}}', { user: { name: 'Alice' } }),
      ).toBe('Alice')
    })

    it('should render deeply nested property access', () => {
      expect(
        engine.render('{{a.b.c}}', { a: { b: { c: 'deep' } } }),
      ).toBe('deep')
    })

    it('should render array index access', () => {
      expect(
        engine.render('{{items.0}}', { items: ['first', 'second'] }),
      ).toBe('first')
    })

    it('should render nested array property', () => {
      expect(
        engine.render('{{items.0.title}}', {
          items: [{ title: 'Hello' }, { title: 'World' }],
        }),
      ).toBe('Hello')
    })

    it('should return empty string for undefined variable', () => {
      expect(engine.render('{{missing}}', {})).toBe('')
    })

    it('should return empty string for null variable', () => {
      expect(engine.render('{{val}}', { val: null })).toBe('')
    })

    it('should escape HTML by default', () => {
      expect(engine.render('{{content}}', { content: '<b>bold</b>' })).toBe(
        '&lt;b&gt;bold&lt;/b&gt;',
      )
    })

    it('should not escape HTML when escape is false', () => {
      const noEscape = new TemplateEngine({ escape: false })
      expect(noEscape.render('{{content}}', { content: '<b>bold</b>' })).toBe('<b>bold</b>')
    })

    it('should render plain text unchanged', () => {
      expect(engine.render('just text', {})).toBe('just text')
    })

    it('should render empty template', () => {
      expect(engine.render('', {})).toBe('')
    })
  })

  describe('render - conditionals', () => {
    const engine = new TemplateEngine()

    it('should render content when condition is true', () => {
      expect(engine.render('{{#if active}}yes{{/if}}', { active: true })).toBe('yes')
    })

    it('should skip content when condition is false', () => {
      expect(engine.render('{{#if active}}yes{{/if}}', { active: false })).toBe('')
    })

    it('should skip content when condition is undefined', () => {
      expect(engine.render('{{#if active}}yes{{/if}}', {})).toBe('')
    })

    it('should skip content when condition is null', () => {
      expect(engine.render('{{#if val}}yes{{/if}}', { val: null })).toBe('')
    })

    it('should skip content when condition is 0', () => {
      expect(engine.render('{{#if count}}yes{{/if}}', { count: 0 })).toBe('')
    })

    it('should render content when condition is non-zero number', () => {
      expect(engine.render('{{#if count}}yes{{/if}}', { count: 5 })).toBe('yes')
    })

    it('should render content when condition is non-empty string', () => {
      expect(engine.render('{{#if name}}yes{{/if}}', { name: 'test' })).toBe('yes')
    })

    it('should skip content when condition is empty string', () => {
      expect(engine.render('{{#if name}}yes{{/if}}', { name: '' })).toBe('')
    })

    it('should render content when condition is non-empty array', () => {
      expect(engine.render('{{#if items}}yes{{/if}}', { items: [1] })).toBe('yes')
    })

    it('should skip content when condition is empty array', () => {
      expect(engine.render('{{#if items}}yes{{/if}}', { items: [] as number[] })).toBe('')
    })

    it('should handle conditionals with surrounding text', () => {
      expect(
        engine.render('start{{#if show}}middle{{/if}}end', { show: true }),
      ).toBe('startmiddleend')
    })

    it('should handle nested conditionals', () => {
      expect(
        engine.render('{{#if a}}{{#if b}}both{{/if}}{{/if}}', { a: true, b: true }),
      ).toBe('both')
    })

    it('should handle nested conditionals outer false', () => {
      expect(
        engine.render('{{#if a}}{{#if b}}both{{/if}}{{/if}}', { a: false, b: true }),
      ).toBe('')
    })

    it('should handle nested conditionals inner false', () => {
      expect(
        engine.render('{{#if a}}{{#if b}}both{{/if}}{{/if}}', { a: true, b: false }),
      ).toBe('')
    })
  })

  describe('render - loops', () => {
    const engine = new TemplateEngine()

    it('should render loop with implicit iterator', () => {
      expect(
        engine.render('{{#each items}}{{this}}{{/each}}', { items: ['a', 'b', 'c'] }),
      ).toBe('abc')
    })

    it('should render loop with explicit iterator', () => {
      expect(
        engine.render('{{#each item in items}}{{item}}{{/each}}', { items: ['x', 'y'] }),
      ).toBe('xy')
    })

    it('should render loop with surrounding text', () => {
      expect(
        engine.render('[{{#each items}}{{this}}{{/each}}]', { items: ['a', 'b'] }),
      ).toBe('[ab]')
    })

    it('should handle empty array', () => {
      expect(
        engine.render('{{#each items}}{{this}}{{/each}}', { items: [] as string[] }),
      ).toBe('')
    })

    it('should handle non-array gracefully', () => {
      expect(
        engine.render('{{#each items}}{{this}}{{/each}}', { items: 'not-array' }),
      ).toBe('')
    })

    it('should handle missing collection', () => {
      expect(
        engine.render('{{#each items}}{{this}}{{/each}}', {}),
      ).toBe('')
    })

    it('should provide @index in loop', () => {
      expect(
        engine.render('{{#each items}}{{@index}}{{/each}}', { items: ['a', 'b', 'c'] }),
      ).toBe('012')
    })

    it('should provide @first in loop', () => {
      expect(
        engine.render('{{#each items}}{{@first}}{{/each}}', { items: ['a', 'b'] }),
      ).toBe('truefalse')
    })

    it('should provide @last in loop', () => {
      expect(
        engine.render('{{#each items}}{{@last}}{{/each}}', { items: ['a', 'b'] }),
      ).toBe('falsetrue')
    })

    it('should loop over objects in array', () => {
      const ctx = { items: [{ name: 'A' }, { name: 'B' }] }
      expect(
        engine.render('{{#each item in items}}{{item.name}}{{/each}}', ctx),
      ).toBe('AB')
    })

    it('should handle nested loops', () => {
      const ctx = {
        groups: [
          { items: ['a', 'b'] },
          { items: ['c'] },
        ],
      }
      const template =
        '{{#each g in groups}}{{#each item in g.items}}{{item}}{{/each}}{{/each}}'
      expect(engine.render(template, ctx)).toBe('abc')
    })
  })

  describe('render - comments', () => {
    const engine = new TemplateEngine()

    it('should strip comments', () => {
      expect(engine.render('before{{! ignored}}after', {})).toBe('beforeafter')
    })

    it('should strip multi-word comments', () => {
      expect(
        engine.render('{{! this is a long comment}}text', {}),
      ).toBe('text')
    })
  })

  describe('render - partials', () => {
    const engine = new TemplateEngine()

    it('should render registered partials', () => {
      engine.registerPartial('greeting', 'Hello {{name}}')
      expect(engine.render('{{>greeting}}', { name: 'World' })).toBe('Hello World')
    })

    it('should handle unknown partial gracefully', () => {
      expect(engine.render('{{>unknown}}', {})).toBe('')
    })

    it('should handle unknown partial with strict mode', () => {
      const strictEngine = new TemplateEngine({ strict: true })
      const result = strictEngine.renderWithResult('{{>unknown}}', {})
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Unknown partial')
    })

    it('should pass context to partials', () => {
      engine.registerPartial('user', '{{user.name}}')
      expect(
        engine.render('{{>user}}', { user: { name: 'Alice' } }),
      ).toBe('Alice')
    })
  })

  describe('renderWithResult', () => {
    const engine = new TemplateEngine()

    it('should return output', () => {
      const result = engine.renderWithResult('Hello {{name}}', { name: 'World' })
      expect(result.output).toBe('Hello World')
    })

    it('should track tokens used', () => {
      const result = engine.renderWithResult('Hello {{name}}!', { name: 'World' })
      expect(result.tokensUsed).toBe(3)
    })

    it('should track variables accessed', () => {
      const result = engine.renderWithResult('{{a}} {{b}}', { a: 'x', b: 'y' })
      expect(result.variablesAccessed).toContain('a')
      expect(result.variablesAccessed).toContain('b')
    })

    it('should track warnings for missing variables', () => {
      const result = engine.renderWithResult('{{missing}}', {})
      expect(result.warnings).toContain('Undefined variable: missing')
    })

    it('should track errors in strict mode', () => {
      const strict = new TemplateEngine({ strict: true })
      const result = strict.renderWithResult('{{missing}}', {})
      expect(result.errors).toContain('Undefined variable: missing')
    })

    it('should report no errors on success', () => {
      const result = engine.renderWithResult('{{name}}', { name: 'ok' })
      expect(result.errors).toHaveLength(0)
    })

    it('should track variables in conditionals', () => {
      const result = engine.renderWithResult('{{#if show}}yes{{/if}}', { show: true })
      expect(result.variablesAccessed).toContain('show')
    })

    it('should track variables in loops', () => {
      const result = engine.renderWithResult(
        '{{#each items}}{{this}}{{/each}}',
        { items: [1] },
      )
      expect(result.variablesAccessed).toContain('items')
    })
  })

  describe('compile', () => {
    const engine = new TemplateEngine()

    it('should return a function', () => {
      const fn = engine.compile('Hello {{name}}')
      expect(typeof fn).toBe('function')
    })

    it('should render with compiled template', () => {
      const fn = engine.compile('Hello {{name}}!')
      expect(fn({ name: 'World' })).toBe('Hello World!')
    })

    it('should render compiled template multiple times', () => {
      const fn = engine.compile('{{greeting}} {{name}}')
      expect(fn({ greeting: 'Hi', name: 'A' })).toBe('Hi A')
      expect(fn({ greeting: 'Hey', name: 'B' })).toBe('Hey B')
    })
  })

  describe('registerHelper', () => {
    const engine = new TemplateEngine()

    it('should invoke registered helper', () => {
      engine.registerHelper('upper', (str: unknown) => String(str).toUpperCase())
      expect(engine.render('{{upper name}}', { name: 'hello' })).toBe('HELLO')
    })

    it('should pass helper arguments from context', () => {
      engine.registerHelper('greet', (name: unknown) => `Hi ${name}!`)
      expect(engine.render('{{greet user}}', { user: 'Alice' })).toBe('Hi Alice!')
    })

    it('should handle helper with multiple args', () => {
      engine.registerHelper('add', (a: unknown, b: unknown) =>
        String(Number(a) + Number(b)),
      )
      expect(engine.render('{{add x y}}', { x: 3, y: 4 })).toBe('7')
    })

    it('should fall back to variable if no helper matches', () => {
      const result = engine.renderWithResult('{{unknown_helper x}}', { x: 'val' })
      expect(result.output).toBe('')
    })
  })

  describe('escapeHtml', () => {
    const engine = new TemplateEngine()

    it('should escape ampersands', () => {
      expect(engine.escapeHtml('a&b')).toBe('a&amp;b')
    })

    it('should escape angle brackets', () => {
      expect(engine.escapeHtml('<div>')).toBe('&lt;div&gt;')
    })

    it('should escape double quotes', () => {
      expect(engine.escapeHtml('"hello"')).toBe('&quot;hello&quot;')
    })

    it('should escape single quotes', () => {
      expect(engine.escapeHtml("it's")).toBe("it&#39;s")
    })

    it('should handle string with no special chars', () => {
      expect(engine.escapeHtml('hello world')).toBe('hello world')
    })

    it('should escape all special characters at once', () => {
      expect(engine.escapeHtml('<a href="x">&</a>')).toBe(
        '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
      )
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const engine = new TemplateEngine()
      const config = engine.getConfig()
      config.escape = false
      expect(engine.getConfig().escape).toBe(true)
    })
  })

  describe('validate', () => {
    const engine = new TemplateEngine()

    it('should return empty array for valid template', () => {
      expect(engine.validate('Hello {{name}}')).toEqual([])
    })

    it('should detect unclosed if', () => {
      const errors = engine.validate('{{#if active}}content')
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unclosed')
    })

    it('should detect unclosed each', () => {
      const errors = engine.validate('{{#each items}}content')
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unclosed')
    })

    it('should detect unexpected close if', () => {
      const errors = engine.validate('{{/if}}')
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unexpected')
    })

    it('should detect unexpected close each', () => {
      const errors = engine.validate('{{/each}}')
      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unexpected')
    })

    it('should validate correct nesting', () => {
      expect(
        engine.validate('{{#if a}}{{#each items}}{{this}}{{/each}}{{/if}}'),
      ).toEqual([])
    })

    it('should validate empty template', () => {
      expect(engine.validate('')).toEqual([])
    })
  })

  describe('getVariables', () => {
    const engine = new TemplateEngine()

    it('should extract simple variables', () => {
      expect(engine.getVariables('{{name}}')).toContain('name')
    })

    it('should extract multiple variables', () => {
      const vars = engine.getVariables('{{a}} and {{b}}')
      expect(vars).toContain('a')
      expect(vars).toContain('b')
    })

    it('should extract nested property variables', () => {
      const vars = engine.getVariables('{{user.name}}')
      expect(vars).toContain('user.name')
    })

    it('should extract variables from conditionals', () => {
      const vars = engine.getVariables('{{#if active}}yes{{/if}}')
      expect(vars).toContain('active')
    })

    it('should extract variables from loops', () => {
      const vars = engine.getVariables('{{#each items}}{{this}}{{/each}}')
      expect(vars).toContain('items')
    })

    it('should extract variables from nested structures', () => {
      const template = '{{#if show}}{{#each items}}{{name}}{{/each}}{{/if}}'
      const vars = engine.getVariables(template)
      expect(vars).toContain('show')
      expect(vars).toContain('items')
      expect(vars).toContain('name')
    })

    it('should return unique variables', () => {
      const vars = engine.getVariables('{{name}} {{name}}')
      expect(vars.filter((v) => v === 'name')).toHaveLength(1)
    })
  })

  describe('Default config', () => {
    it('should have correct default delimiter values', () => {
      expect(DEFAULT_TEMPLATE_CONFIG.openDelimiter).toBe('{{')
      expect(DEFAULT_TEMPLATE_CONFIG.closeDelimiter).toBe('}}')
    })

    it('should have escape enabled by default', () => {
      expect(DEFAULT_TEMPLATE_CONFIG.escape).toBe(true)
    })

    it('should have strict disabled by default', () => {
      expect(DEFAULT_TEMPLATE_CONFIG.strict).toBe(false)
    })

    it('should have trimWhitespace disabled by default', () => {
      expect(DEFAULT_TEMPLATE_CONFIG.trimWhitespace).toBe(false)
    })
  })

  describe('Edge cases', () => {
    const engine = new TemplateEngine()

    it('should handle template with only whitespace', () => {
      expect(engine.render('   ', {})).toBe('   ')
    })

    it('should handle variable with spaces around name', () => {
      expect(engine.render('{{ name }}', { name: 'test' })).toBe('test')
    })

    it('should handle deep property returning undefined', () => {
      expect(engine.render('{{a.b.c.d}}', { a: { b: {} } })).toBe('')
    })

    it('should handle context with null nested object', () => {
      expect(engine.render('{{a.b}}', { a: { b: null } })).toBe('')
    })

    it('should handle rendering number as string', () => {
      expect(engine.render('{{val}}', { val: 0 })).toBe('0')
    })

    it('should handle rendering false as string', () => {
      expect(engine.render('{{val}}', { val: false })).toBe('false')
    })

    it('should handle mixed conditionals and loops', () => {
      const ctx: TemplateContext = {
        show: true,
        items: [{ name: 'A' }, { name: 'B' }],
      }
      expect(
        engine.render(
          '{{#if show}}{{#each item in items}}{{item.name}}{{/each}}{{/if}}',
          ctx,
        ),
      ).toBe('AB')
    })

    it('should handle trimWhitespace config', () => {
      const twEngine = new TemplateEngine({ trimWhitespace: true })
      expect(twEngine.render('  hello  ', {})).toBe('hello')
    })

    it('should handle complex template with all features', () => {
      const complexEngine = new TemplateEngine({ escape: false })
      complexEngine.registerPartial('item', '<li>{{item.name}}</li>')
      const ctx: TemplateContext = {
        title: 'My List',
        showList: true,
        items: [{ name: 'A' }, { name: 'B' }],
      }
      const result = complexEngine.render(
        '{{! a comment}}<h1>{{title}}</h1>{{#if showList}}<ul>{{#each item in items}}{{>item}}{{/each}}</ul>{{/if}}',
        ctx,
      )
      expect(result).toBe('<h1>My List</h1><ul><li>A</li><li>B</li></ul>')
    })

    it('should handle strict mode for non-array in loop', () => {
      const strict = new TemplateEngine({ strict: true })
      const result = strict.renderWithResult('{{#each items}}x{{/each}}', { items: 'nope' })
      expect(result.errors.some((e) => e.includes('Expected array'))).toBe(true)
    })

    it('should handle array of numbers', () => {
      expect(
        engine.render('{{#each nums}}{{this}}{{/each}}', { nums: [1, 2, 3] }),
      ).toBe('123')
    })

    it('should handle empty context object', () => {
      expect(engine.render('no vars', {})).toBe('no vars')
    })

    it('should handle loop with separator text', () => {
      const template = '{{#each items}}{{this}}, {{/each}}'
      expect(engine.render(template, { items: ['a', 'b', 'c'] })).toBe('a, b, c, ')
    })
  })
})
