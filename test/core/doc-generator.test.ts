import { describe, it, expect } from 'vitest'
import { DocGenerator } from '../../src/core/doc-generator/doc-generator.js'
import { DEFAULT_DOC_GENERATION_OPTIONS } from '../../src/core/doc-generator/types.js'
import type { DocEntry, DocParam, DocGenerationOptions, TableOfContentsEntry, DocCategory, DocOutputFormat } from '../../src/core/doc-generator/types.js'

function createDocEntry(overrides: Partial<DocEntry> = {}): DocEntry {
  return {
    name: 'testFunc',
    kind: 'function',
    description: 'A test function',
    params: [],
    returnType: 'void',
    examples: [],
    since: '1.0.0',
    deprecated: false,
    category: 'Utilities',
    visibility: 'public',
    sourceFile: 'src/test.ts',
    lineNumber: 1,
    ...overrides,
  }
}

function createDocParam(overrides: Partial<DocParam> = {}): DocParam {
  return {
    name: 'param1',
    type: 'string',
    description: 'A parameter',
    optional: false,
    defaultValue: '',
    ...overrides,
  }
}

describe('DEFAULT_DOC_GENERATION_OPTIONS', () => {
  it('should have format default to markdown', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.format).toBe('markdown')
  })

  it('should have includePrivate default to false', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.includePrivate).toBe(false)
  })

  it('should have includeDeprecated default to true', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.includeDeprecated).toBe(true)
  })

  it('should have groupByCategory default to true', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.groupByCategory).toBe(true)
  })

  it('should have tableOfContents default to true', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.tableOfContents).toBe(true)
  })

  it('should have title default to API Documentation', () => {
    expect(DEFAULT_DOC_GENERATION_OPTIONS.title).toBe('API Documentation')
  })
})

describe('DocGenerator Construction', () => {
  it('should create with default options', () => {
    const gen = new DocGenerator()
    const opts = gen.getOptions()
    expect(opts.format).toBe('markdown')
    expect(opts.includePrivate).toBe(false)
    expect(opts.includeDeprecated).toBe(true)
  })

  it('should create with custom options', () => {
    const gen = new DocGenerator({ format: 'json', title: 'My Docs' })
    const opts = gen.getOptions()
    expect(opts.format).toBe('json')
    expect(opts.title).toBe('My Docs')
  })

  it('should create with partial options merging defaults', () => {
    const gen = new DocGenerator({ includePrivate: true })
    const opts = gen.getOptions()
    expect(opts.includePrivate).toBe(true)
    expect(opts.format).toBe('markdown')
    expect(opts.title).toBe('API Documentation')
  })

  it('should return a copy of options from getOptions', () => {
    const gen = new DocGenerator()
    const opts = gen.getOptions()
    opts.title = 'Modified'
    expect(gen.getOptions().title).toBe('API Documentation')
  })
})

describe('DocGenerator Entry Management', () => {
  it('should add a single entry', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'func1' }))
    expect(gen.getEntries().length).toBe(1)
    expect(gen.getEntries()[0]!.name).toBe('func1')
  })

  it('should add multiple entries', () => {
    const gen = new DocGenerator()
    gen.addEntries([
      createDocEntry({ name: 'func1' }),
      createDocEntry({ name: 'func2' }),
    ])
    expect(gen.getEntries().length).toBe(2)
  })

  it('should remove an entry by name', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'func1' }))
    gen.addEntry(createDocEntry({ name: 'func2' }))
    const result = gen.removeEntry('func1')
    expect(result).toBe(true)
    expect(gen.getEntries().length).toBe(1)
    expect(gen.getEntries()[0]!.name).toBe('func2')
  })

  it('should return false when removing non-existent entry', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const result = gen.removeEntry('nonexistent')
    expect(result).toBe(false)
    expect(gen.getEntries().length).toBe(1)
  })

  it('should exclude private entries by default', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'public1', visibility: 'public' }))
    gen.addEntry(createDocEntry({ name: 'private1', visibility: 'private' }))
    expect(gen.getEntries().length).toBe(1)
    expect(gen.getEntries()[0]!.name).toBe('public1')
  })

  it('should include private entries when includePrivate is true', () => {
    const gen = new DocGenerator({ includePrivate: true })
    gen.addEntry(createDocEntry({ name: 'public1', visibility: 'public' }))
    gen.addEntry(createDocEntry({ name: 'private1', visibility: 'private' }))
    expect(gen.getEntries().length).toBe(2)
  })

  it('should exclude deprecated entries when includeDeprecated is false', () => {
    const gen = new DocGenerator({ includeDeprecated: false })
    gen.addEntry(createDocEntry({ name: 'current', deprecated: false }))
    gen.addEntry(createDocEntry({ name: 'old', deprecated: true }))
    expect(gen.getEntries().length).toBe(1)
    expect(gen.getEntries()[0]!.name).toBe('current')
  })

  it('should include protected entries by default', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'prot', visibility: 'protected' }))
    expect(gen.getEntries().length).toBe(1)
  })
})

describe('DocGenerator Markdown Generation', () => {
  it('should generate markdown with title', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('# API Documentation')
  })

  it('should generate markdown with TOC', () => {
    const gen = new DocGenerator({ tableOfContents: true, groupByCategory: true })
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('## Table of Contents')
  })

  it('should generate markdown without TOC when disabled', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const md = gen.generateMarkdown()
    expect(md).not.toContain('## Table of Contents')
  })

  it('should generate function entry', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ kind: 'function', name: 'myFunc' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('function: myFunc')
    expect(md).toContain('A test function')
  })

  it('should generate class entry', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ kind: 'class', name: 'MyClass' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('class: MyClass')
  })

  it('should generate interface entry', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ kind: 'interface', name: 'IMyInterface' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('interface: IMyInterface')
  })

  it('should generate params table', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      params: [
        createDocParam({ name: 'x', type: 'number', description: 'The value' }),
      ],
    }))
    const md = gen.generateMarkdown()
    expect(md).toContain('**Parameters:**')
    expect(md).toContain('| x | number | The value | No | - |')
  })

  it('should generate examples', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      examples: ['const result = testFunc()'],
    }))
    const md = gen.generateMarkdown()
    expect(md).toContain('**Examples:**')
    expect(md).toContain('const result = testFunc()')
    expect(md).toContain('```typescript')
  })

  it('should generate deprecated marker', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ deprecated: true }))
    const md = gen.generateMarkdown()
    expect(md).toContain('Deprecated')
  })

  it('should group by category', () => {
    const gen = new DocGenerator({ groupByCategory: true, tableOfContents: false })
    gen.addEntry(createDocEntry({ name: 'f1', category: 'Core' }))
    gen.addEntry(createDocEntry({ name: 'f2', category: 'Utils' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('## Core')
    expect(md).toContain('## Utils')
  })

  it('should generate without grouping when disabled', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({ name: 'f1', category: 'Core' }))
    gen.addEntry(createDocEntry({ name: 'f2', category: 'Utils' }))
    const md = gen.generateMarkdown()
    expect(md).not.toContain('## Core')
    expect(md).not.toContain('## Utils')
  })

  it('should generate for empty entries', () => {
    const gen = new DocGenerator()
    const md = gen.generateMarkdown()
    expect(md).toContain('# API Documentation')
    expect(md).not.toContain('## Table of Contents')
  })

  it('should include source file info', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ sourceFile: 'src/utils.ts', lineNumber: 42 }))
    const md = gen.generateMarkdown()
    expect(md).toContain('**Source:** src/utils.ts:42')
  })

  it('should include return type', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ returnType: 'string' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('**Returns:** `string`')
  })
})

describe('DocGenerator JSON Generation', () => {
  it('should generate valid JSON', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry())
    const json = gen.generateJSON()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should include correct structure', () => {
    const gen = new DocGenerator({ title: 'Test Docs' })
    gen.addEntry(createDocEntry())
    const parsed = JSON.parse(gen.generateJSON()) as { title: string; entries: DocEntry[] }
    expect(parsed.title).toBe('Test Docs')
    expect(parsed.entries.length).toBe(1)
  })

  it('should include all entry fields', () => {
    const gen = new DocGenerator()
    const entry = createDocEntry({ name: 'fullEntry', returnType: 'number' })
    gen.addEntry(entry)
    const parsed = JSON.parse(gen.generateJSON()) as { entries: DocEntry[] }
    const output = parsed.entries[0]!
    expect(output.name).toBe('fullEntry')
    expect(output.returnType).toBe('number')
    expect(output.kind).toBe('function')
    expect(output.visibility).toBe('public')
    expect(output.lineNumber).toBe(1)
  })

  it('should generate JSON for empty entries', () => {
    const gen = new DocGenerator()
    const parsed = JSON.parse(gen.generateJSON()) as { title: string; entries: DocEntry[] }
    expect(parsed.entries.length).toBe(0)
    expect(parsed.title).toBe('API Documentation')
  })
})

describe('DocGenerator HTML Generation', () => {
  it('should generate valid HTML structure', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry())
    const html = gen.generateHTML()
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html>')
    expect(html).toContain('</html>')
    expect(html).toContain('<head>')
    expect(html).toContain('</body>')
  })

  it('should include headings for entries', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({ kind: 'function', name: 'myFunc' }))
    const html = gen.generateHTML()
    expect(html).toContain('<h3')
    expect(html).toContain('function: myFunc')
  })

  it('should include tables for params', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({
      params: [createDocParam({ name: 'x', type: 'number' })],
    }))
    const html = gen.generateHTML()
    expect(html).toContain('<table>')
    expect(html).toContain('<th>Name</th>')
    expect(html).toContain('<td>x</td>')
  })

  it('should include code blocks for examples', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({ examples: ['testFunc()'] }))
    const html = gen.generateHTML()
    expect(html).toContain('<pre><code>')
    expect(html).toContain('testFunc()')
  })

  it('should generate HTML for empty entries', () => {
    const gen = new DocGenerator()
    const html = gen.generateHTML()
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<h1>API Documentation</h1>')
  })

  it('should escape HTML in entry content', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({ description: 'Use <script> & "quotes"' }))
    const html = gen.generateHTML()
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp;')
    expect(html).toContain('&quot;')
  })
})

describe('DocGenerator Text Generation', () => {
  it('should generate plain text with title', () => {
    const gen = new DocGenerator({ title: 'My API' })
    const text = gen.generateText()
    expect(text).toContain('My API')
    expect(text).toContain('====')
  })

  it('should generate readable output with sections', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ name: 'myFunc', returnType: 'string' }))
    const text = gen.generateText()
    expect(text).toContain('function: myFunc')
    expect(text).toContain('A test function')
    expect(text).toContain('Returns: string')
  })

  it('should generate text for empty entries', () => {
    const gen = new DocGenerator()
    const text = gen.generateText()
    expect(text).toContain('API Documentation')
    expect(text).not.toContain('Table of Contents')
  })

  it('should include deprecated marker in text', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ deprecated: true }))
    const text = gen.generateText()
    expect(text).toContain('[DEPRECATED]')
  })

  it('should include params in text', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      params: [createDocParam({ name: 'x', type: 'number', description: 'val', optional: true, defaultValue: '0' })],
    }))
    const text = gen.generateText()
    expect(text).toContain('x (number): val [optional] [default: 0]')
  })
})

describe('DocGenerator Table of Contents', () => {
  it('should generate TOC entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const toc = gen.generateTableOfContents()
    expect(toc.length).toBeGreaterThan(0)
  })

  it('should generate nested structure with categories', () => {
    const gen = new DocGenerator({ groupByCategory: true })
    gen.addEntry(createDocEntry({ name: 'func1', category: 'Core' }))
    gen.addEntry(createDocEntry({ name: 'func2', category: 'Core' }))
    gen.addEntry(createDocEntry({ name: 'func3', category: 'Utils' }))
    const toc = gen.generateTableOfContents()
    expect(toc.length).toBe(2)
    const coreEntry = toc.find(e => e.title === 'Core')
    expect(coreEntry).toBeDefined()
    expect(coreEntry!.children.length).toBe(2)
  })

  it('should generate correct anchors', () => {
    const gen = new DocGenerator({ groupByCategory: false })
    gen.addEntry(createDocEntry({ name: 'My Func' }))
    const toc = gen.generateTableOfContents()
    expect(toc[0]!.anchor).toBe('my-func')
  })

  it('should generate empty TOC for no entries', () => {
    const gen = new DocGenerator()
    const toc = gen.generateTableOfContents()
    expect(toc.length).toBe(0)
  })

  it('should include level information', () => {
    const gen = new DocGenerator({ groupByCategory: false })
    gen.addEntry(createDocEntry({ name: 'func1' }))
    const toc = gen.generateTableOfContents()
    expect(toc[0]!.level).toBe(1)
  })
})

describe('DocGenerator Grouping', () => {
  it('should group entries by category', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'f1', category: 'Core' }))
    gen.addEntry(createDocEntry({ name: 'f2', category: 'Utils' }))
    gen.addEntry(createDocEntry({ name: 'f3', category: 'Core' }))
    const groups = gen.groupByCategory()
    expect(groups.size).toBe(2)
    expect(groups.get('Core')!.length).toBe(2)
    expect(groups.get('Utils')!.length).toBe(1)
  })

  it('should handle multiple categories', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ category: 'A' }))
    gen.addEntry(createDocEntry({ category: 'B' }))
    gen.addEntry(createDocEntry({ category: 'C' }))
    const groups = gen.groupByCategory()
    expect(groups.size).toBe(3)
  })

  it('should handle uncategorized entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'f1', category: '' }))
    const groups = gen.groupByCategory()
    expect(groups.has('Uncategorized')).toBe(true)
    expect(groups.get('Uncategorized')!.length).toBe(1)
  })

  it('should return empty map for no entries', () => {
    const gen = new DocGenerator()
    const groups = gen.groupByCategory()
    expect(groups.size).toBe(0)
  })
})

describe('DocGenerator getCategories', () => {
  it('should return unique categories', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ category: 'Core' }))
    gen.addEntry(createDocEntry({ category: 'Core' }))
    gen.addEntry(createDocEntry({ category: 'Utils' }))
    const cats = gen.getCategories()
    expect(cats.length).toBe(2)
    expect(cats).toContain('Core')
    expect(cats).toContain('Utils')
  })

  it('should return uncategorized for empty category', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ category: '' }))
    const cats = gen.getCategories()
    expect(cats).toContain('Uncategorized')
  })

  it('should return empty array for no entries', () => {
    const gen = new DocGenerator()
    expect(gen.getCategories()).toEqual([])
  })
})

describe('DocGenerator getDeprecated', () => {
  it('should return deprecated entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'current', deprecated: false }))
    gen.addEntry(createDocEntry({ name: 'old', deprecated: true }))
    const deprecated = gen.getDeprecated()
    expect(deprecated.length).toBe(1)
    expect(deprecated[0]!.name).toBe('old')
  })

  it('should return empty for no deprecated entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ deprecated: false }))
    expect(gen.getDeprecated()).toEqual([])
  })

  it('should return all when all are deprecated', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ deprecated: true }))
    gen.addEntry(createDocEntry({ deprecated: true }))
    expect(gen.getDeprecated().length).toBe(2)
  })
})

describe('DocGenerator Search', () => {
  it('should search by name', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'calculateTotal' }))
    gen.addEntry(createDocEntry({ name: 'formatDate' }))
    const results = gen.search('calculate')
    expect(results.length).toBe(1)
    expect(results[0]!.name).toBe('calculateTotal')
  })

  it('should search by description', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ description: 'Calculates the total price' }))
    gen.addEntry(createDocEntry({ description: 'Formats dates nicely' }))
    const results = gen.search('total price')
    expect(results.length).toBe(1)
  })

  it('should search case insensitively', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'MyFunction' }))
    const results = gen.search('myfunction')
    expect(results.length).toBe(1)
  })

  it('should return empty for no results', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'func1' }))
    expect(gen.search('nonexistent').length).toBe(0)
  })

  it('should partial match name', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ name: 'getUserById' }))
    const results = gen.search('user')
    expect(results.length).toBe(1)
  })
})

describe('DocGenerator Statistics', () => {
  it('should count total entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry())
    gen.addEntry(createDocEntry())
    gen.addEntry(createDocEntry())
    expect(gen.getStatistics().totalEntries).toBe(3)
  })

  it('should count by kind', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ kind: 'function' }))
    gen.addEntry(createDocEntry({ kind: 'function' }))
    gen.addEntry(createDocEntry({ kind: 'class' }))
    const stats = gen.getStatistics()
    expect(stats.byKind['function']).toBe(2)
    expect(stats.byKind['class']).toBe(1)
  })

  it('should count by category', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ category: 'Core' }))
    gen.addEntry(createDocEntry({ category: 'Core' }))
    gen.addEntry(createDocEntry({ category: 'Utils' }))
    const stats = gen.getStatistics()
    expect(stats.byCategory['Core']).toBe(2)
    expect(stats.byCategory['Utils']).toBe(1)
  })

  it('should count deprecated', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ deprecated: false }))
    gen.addEntry(createDocEntry({ deprecated: true }))
    expect(gen.getStatistics().deprecated).toBe(1)
  })

  it('should count public entries', () => {
    const gen = new DocGenerator()
    gen.addEntry(createDocEntry({ visibility: 'public' }))
    gen.addEntry(createDocEntry({ visibility: 'public' }))
    gen.addEntry(createDocEntry({ visibility: 'private' }))
    expect(gen.getStatistics().public).toBe(2)
  })

  it('should count private entries', () => {
    const gen = new DocGenerator({ includePrivate: true })
    gen.addEntry(createDocEntry({ visibility: 'public' }))
    gen.addEntry(createDocEntry({ visibility: 'private' }))
    gen.addEntry(createDocEntry({ visibility: 'private' }))
    expect(gen.getStatistics().private).toBe(2)
  })

  it('should handle empty entries', () => {
    const gen = new DocGenerator()
    const stats = gen.getStatistics()
    expect(stats.totalEntries).toBe(0)
    expect(stats.deprecated).toBe(0)
    expect(stats.public).toBe(0)
    expect(stats.private).toBe(0)
    expect(Object.keys(stats.byKind).length).toBe(0)
  })
})

describe('DocGenerator Merge', () => {
  it('should merge two generators', () => {
    const gen1 = new DocGenerator()
    gen1.addEntry(createDocEntry({ name: 'func1' }))
    const gen2 = new DocGenerator()
    gen2.addEntry(createDocEntry({ name: 'func2' }))
    gen1.merge(gen2)
    expect(gen1.getEntries().length).toBe(2)
  })

  it('should not duplicate entries with same name', () => {
    const gen1 = new DocGenerator()
    gen1.addEntry(createDocEntry({ name: 'func1', description: 'Original' }))
    const gen2 = new DocGenerator()
    gen2.addEntry(createDocEntry({ name: 'func1', description: 'Duplicate' }))
    gen1.merge(gen2)
    expect(gen1.getEntries().length).toBe(1)
    expect(gen1.getEntries()[0]!.description).toBe('Original')
  })

  it('should merge with empty generator', () => {
    const gen1 = new DocGenerator()
    gen1.addEntry(createDocEntry({ name: 'func1' }))
    const gen2 = new DocGenerator()
    gen1.merge(gen2)
    expect(gen1.getEntries().length).toBe(1)
  })

  it('should preserve existing entries after merge', () => {
    const gen1 = new DocGenerator()
    gen1.addEntry(createDocEntry({ name: 'a' }))
    gen1.addEntry(createDocEntry({ name: 'b' }))
    const gen2 = new DocGenerator()
    gen2.addEntry(createDocEntry({ name: 'c' }))
    gen1.merge(gen2)
    const names = gen1.getEntries().map(e => e.name)
    expect(names).toContain('a')
    expect(names).toContain('b')
    expect(names).toContain('c')
  })
})

describe('DocGenerator generate dispatch', () => {
  it('should dispatch to markdown', () => {
    const gen = new DocGenerator({ format: 'markdown' })
    gen.addEntry(createDocEntry())
    const result = gen.generate()
    expect(result).toContain('# API Documentation')
  })

  it('should dispatch to JSON', () => {
    const gen = new DocGenerator({ format: 'json' })
    gen.addEntry(createDocEntry())
    const result = gen.generate()
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should dispatch to HTML', () => {
    const gen = new DocGenerator({ format: 'html' })
    gen.addEntry(createDocEntry())
    const result = gen.generate()
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('should dispatch to text', () => {
    const gen = new DocGenerator({ format: 'text' })
    gen.addEntry(createDocEntry())
    const result = gen.generate()
    expect(result).toContain('API Documentation')
    expect(result).toContain('====')
  })
})

describe('DocGenerator Edge Cases', () => {
  it('should handle entry with all fields populated', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      name: 'fullFunc',
      kind: 'function',
      description: 'A fully documented function',
      params: [createDocParam({ name: 'x', type: 'number', description: 'input', optional: true, defaultValue: '0' })],
      returnType: 'string',
      examples: ['fullFunc(42)'],
      since: '2.0.0',
      deprecated: true,
      category: 'Full',
      visibility: 'public',
      sourceFile: 'src/full.ts',
      lineNumber: 100,
    }))
    const md = gen.generateMarkdown()
    expect(md).toContain('function: fullFunc')
    expect(md).toContain('A fully documented function')
    expect(md).toContain('| x |')
    expect(md).toContain('`string`')
    expect(md).toContain('fullFunc(42)')
    expect(md).toContain('2.0.0')
    expect(md).toContain('Deprecated')
    expect(md).toContain('src/full.ts:100')
  })

  it('should handle type and variable kinds', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ kind: 'type', name: 'MyType' }))
    gen.addEntry(createDocEntry({ kind: 'variable', name: 'myVar' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('type: MyType')
    expect(md).toContain('variable: myVar')
  })

  it('should handle module kind', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ kind: 'module', name: 'myModule' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('module: myModule')
  })

  it('should handle entry with multiple examples', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      examples: ['example1()', 'example2()'],
    }))
    const md = gen.generateMarkdown()
    expect(md).toContain('example1()')
    expect(md).toContain('example2()')
    const codeBlockCount = md.split('```typescript').length - 1
    expect(codeBlockCount).toBe(2)
  })

  it('should handle entry with optional params and defaults', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({
      params: [
        createDocParam({ name: 'required', optional: false, defaultValue: '' }),
        createDocParam({ name: 'optional', optional: true, defaultValue: '42' }),
      ],
    }))
    const md = gen.generateMarkdown()
    expect(md).toContain('| required |')
    expect(md).toContain('No |')
    expect(md).toContain('Yes |')
    expect(md).toContain('42 |')
  })

  it('should handle special characters in names', () => {
    const gen = new DocGenerator({ groupByCategory: false, tableOfContents: false })
    gen.addEntry(createDocEntry({ name: 'foo-bar' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('function: foo-bar')
  })

  it('should handle entry with empty description', () => {
    const gen = new DocGenerator({ tableOfContents: false, groupByCategory: false })
    gen.addEntry(createDocEntry({ description: '' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('function: testFunc')
    expect(md).toContain('---')
  })
})

describe('DocGenerator DocCategory type', () => {
  it('should conform to DocCategory interface', () => {
    const cat: DocCategory = {
      name: 'Core',
      description: 'Core utilities',
      entries: [createDocEntry({ category: 'Core' })],
    }
    expect(cat.name).toBe('Core')
    expect(cat.entries.length).toBe(1)
  })
})
