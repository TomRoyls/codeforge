import { describe, expect, it } from 'vitest'

import { TemplateEngine } from '../src/core/template-engine/template-engine.js'
import { TemplateParser } from '../src/core/template-engine/template-parser.js'

// ─── TemplateEngine Construction ───────────────────────
describe('TemplateEngine construction', () => {
  it('creates with defaults', () => {
    const engine = new TemplateEngine()
    const config = engine.getConfig()
    expect(config.openDelimiter).toBe('{{')
    expect(config.closeDelimiter).toBe('}}')
  })

  it('creates with custom config', () => {
    const engine = new TemplateEngine({ openDelimiter: '<%', closeDelimiter: '%>' })
    const config = engine.getConfig()
    expect(config.openDelimiter).toBe('<%')
  })
})

// ─── Render ────────────────────────────────────────────
describe('TemplateEngine render', () => {
  it('renders plain text', () => {
    const engine = new TemplateEngine()
    expect(engine.render('hello', {})).toBe('hello')
  })

  it('renders variable substitution', () => {
    const engine = new TemplateEngine({ escape: false })
    expect(engine.render('{{name}}', { name: 'world' })).toBe('world')
  })

  it('escapes HTML when enabled', () => {
    const engine = new TemplateEngine({ escape: true })
    expect(engine.render('{{html}}', { html: '<b>bold</b>' })).toBe(
      '&lt;b&gt;bold&lt;/b&gt;',
    )
  })

  it('handles undefined variables', () => {
    const engine = new TemplateEngine()
    expect(engine.render('{{missing}}', {})).toBe('')
  })

  it('resolves nested paths', () => {
    const engine = new TemplateEngine({ escape: false })
    expect(engine.render('{{user.name}}', { user: { name: 'Alice' } })).toBe('Alice')
  })
})

// ─── RenderWithResult ──────────────────────────────────
describe('TemplateEngine renderWithResult', () => {
  it('returns result with metadata', () => {
    const engine = new TemplateEngine()
    const result = engine.renderWithResult('Hello {{name}}', { name: 'World' })
    expect(result.tokensUsed).toBeGreaterThan(0)
    expect(result.variablesAccessed).toContain('name')
  })
})

// ─── Compile ───────────────────────────────────────────
describe('TemplateEngine compile', () => {
  it('compiles template to function', () => {
    const engine = new TemplateEngine({ escape: false })
    const fn = engine.compile('Hello {{name}}')
    expect(fn({ name: 'World' })).toBe('Hello World')
  })

  it('compiled function works multiple times', () => {
    const engine = new TemplateEngine({ escape: false })
    const fn = engine.compile('{{greeting}} {{name}}')
    expect(fn({ greeting: 'Hi', name: 'Alice' })).toBe('Hi Alice')
    expect(fn({ greeting: 'Hey', name: 'Bob' })).toBe('Hey Bob')
  })
})

// ─── Helpers ───────────────────────────────────────────
describe('TemplateEngine helpers', () => {
  it('registers and uses helpers', () => {
    const engine = new TemplateEngine()
    engine.registerHelper('upper', (str: unknown) => String(str).toUpperCase())
    expect(engine.render('{{upper name}}', { name: 'alice' })).toBe('ALICE')
  })
})

// ─── Partials ──────────────────────────────────────────
describe('TemplateEngine partials', () => {
  it('renders partials', () => {
    const engine = new TemplateEngine({ escape: false })
    engine.registerPartial('greeting', 'Hello {{name}}')
    expect(engine.render('{{>greeting}}', { name: 'World' })).toBe('Hello World')
  })

  it('handles missing partial gracefully', () => {
    const engine = new TemplateEngine()
    expect(engine.render('{{>missing}}', {})).toBe('')
  })
})

// ─── Conditionals ──────────────────────────────────────
describe('TemplateEngine conditionals', () => {
  it('renders when condition is truthy', () => {
    const engine = new TemplateEngine({ escape: false })
    expect(engine.render('{{#if show}}visible{{/if}}', { show: true })).toBe('visible')
  })

  it('skips when condition is falsy', () => {
    const engine = new TemplateEngine()
    expect(engine.render('{{#if show}}visible{{/if}}', { show: false })).toBe('')
  })
})

// ─── Loops ─────────────────────────────────────────────
describe('TemplateEngine loops', () => {
  it('renders each loop', () => {
    const engine = new TemplateEngine({ escape: false })
    const result = engine.render('{{#each item in items}}{{item}}{{/each}}', {
      items: ['a', 'b', 'c'],
    })
    expect(result).toBe('abc')
  })

  it('handles empty array', () => {
    const engine = new TemplateEngine()
    expect(
      engine.render('{{#each item in items}}{{item}}{{/each}}', { items: [] }),
    ).toBe('')
  })
})

// ─── Comments ──────────────────────────────────────────
describe('TemplateEngine comments', () => {
  it('strips comments', () => {
    const engine = new TemplateEngine()
    expect(engine.render('Hello{{! this is a comment}} World', {})).toBe('Hello World')
  })
})

// ─── Validate ──────────────────────────────────────────
describe('TemplateEngine validate', () => {
  it('validates correct template', () => {
    const engine = new TemplateEngine()
    expect(engine.validate('{{#if x}}ok{{/if}}')).toEqual([])
  })

  it('detects unclosed blocks', () => {
    const engine = new TemplateEngine()
    const errors = engine.validate('{{#if x}}no close')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('detects unexpected closing tags', () => {
    const engine = new TemplateEngine()
    const errors = engine.validate('{{/if}}')
    expect(errors.length).toBeGreaterThan(0)
  })
})

// ─── GetVariables ──────────────────────────────────────
describe('TemplateEngine getVariables', () => {
  it('extracts variable names', () => {
    const engine = new TemplateEngine()
    const vars = engine.getVariables('{{name}} is {{age}}')
    expect(vars).toContain('name')
    expect(vars).toContain('age')
  })

  it('extracts variables from conditionals', () => {
    const engine = new TemplateEngine()
    const vars = engine.getVariables('{{#if active}}yes{{/if}}')
    expect(vars).toContain('active')
  })
})

// ─── EscapeHtml ────────────────────────────────────────
describe('TemplateEngine escapeHtml', () => {
  it('escapes HTML entities', () => {
    const engine = new TemplateEngine()
    expect(engine.escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })
})

// ─── TemplateParser ────────────────────────────────────
describe('TemplateParser', () => {
  it('tokenizes template', () => {
    const parser = new TemplateParser()
    const tokens = parser.tokenize('Hello {{name}}')
    expect(tokens.length).toBe(2)
    expect(tokens[0]!.type).toBe('text')
    expect(tokens[1]!.type).toBe('variable')
  })

  it('parses full template', () => {
    const parser = new TemplateParser()
    const tokens = parser.parse('{{#if x}}yes{{/if}}')
    expect(tokens.length).toBe(1)
    expect(tokens[0]!.type).toBe('conditional')
    expect(tokens[0]!.children).toBeDefined()
  })

  it('parseVariable extracts variable name', () => {
    const parser = new TemplateParser()
    const token = parser.parseVariable('name')
    expect(token.type).toBe('variable')
    expect(token.content).toBe('name')
  })

  it('parseConditional handles #if', () => {
    const parser = new TemplateParser()
    const token = parser.parseConditional('#if active')
    expect(token.type).toBe('conditional')
    expect(token.condition).toBe('active')
  })

  it('parseLoop handles #each', () => {
    const parser = new TemplateParser()
    const token = parser.parseLoop('#each item in items')
    expect(token.type).toBe('loop')
    expect(token.iterator).toBe('item')
    expect(token.collection).toBe('items')
  })

  it('extractVarName strips delimiters', () => {
    const parser = new TemplateParser()
    expect(parser.extractVarName('{{ name }}')).toBe('name')
  })
})
