import { DEFAULT_DOC_GENERATION_OPTIONS } from './types.js'
import type { DocEntry, DocGenerationOptions, TableOfContentsEntry } from './types.js'

export class DocGenerator {
  private options: DocGenerationOptions
  private entries: DocEntry[]

  constructor(options?: Partial<DocGenerationOptions>) {
    this.options = { ...DEFAULT_DOC_GENERATION_OPTIONS, ...options }
    this.entries = []
  }

  addEntry(entry: DocEntry): void {
    this.entries = [...this.entries, entry]
  }

  addEntries(entries: DocEntry[]): void {
    this.entries = [...this.entries, ...entries]
  }

  removeEntry(name: string): boolean {
    const index = this.entries.findIndex(e => e.name === name)
    if (index === -1) return false
    this.entries = [...this.entries.slice(0, index), ...this.entries.slice(index + 1)]
    return true
  }

  getEntries(): DocEntry[] {
    return this.entries.filter(entry => {
      if (!this.options.includePrivate && entry.visibility === 'private') return false
      if (!this.options.includeDeprecated && entry.deprecated) return false
      return true
    })
  }

  generate(): string {
    const format = this.options.format
    if (format === 'markdown') return this.generateMarkdown()
    if (format === 'json') return this.generateJSON()
    if (format === 'html') return this.generateHTML()
    return this.generateText()
  }

  generateMarkdown(): string {
    const parts: string[] = []
    const entries = this.getEntries()

    parts.push('# ' + this.options.title)
    parts.push('')

    if (this.options.tableOfContents && entries.length > 0) {
      parts.push('## Table of Contents')
      parts.push('')
      const toc = this.generateTableOfContents()
      for (const entry of toc) {
        parts.push('- [' + entry.title + '](#' + entry.anchor + ')')
        for (const child of entry.children) {
          parts.push('  - [' + child.title + '](#' + child.anchor + ')')
        }
      }
      parts.push('')
    }

    if (this.options.groupByCategory) {
      const groups = this.groupByCategory()
      const categories = Array.from(groups.keys())
      for (const category of categories) {
        const categoryEntries = groups.get(category)
        if (!categoryEntries) continue
        parts.push('## ' + category)
        parts.push('')
        for (const entry of categoryEntries) {
          parts.push(this.renderEntryMarkdown(entry, 3))
        }
      }
    } else {
      for (const entry of entries) {
        parts.push(this.renderEntryMarkdown(entry, 2))
      }
    }

    return parts.join('\n')
  }

  private renderEntryMarkdown(entry: DocEntry, headingLevel: number): string {
    const parts: string[] = []
    const prefix = '#'.repeat(headingLevel)

    parts.push(prefix + ' ' + entry.kind + ': ' + entry.name)
    parts.push('')

    if (entry.description.length > 0) {
      parts.push(entry.description)
      parts.push('')
    }

    if (entry.params.length > 0) {
      parts.push('**Parameters:**')
      parts.push('')
      parts.push('| Name | Type | Description | Optional | Default |')
      parts.push('|------|------|-------------|----------|---------|')
      for (const param of entry.params) {
        const optional = param.optional ? 'Yes' : 'No'
        const defaultVal = param.defaultValue.length > 0 ? param.defaultValue : '-'
        parts.push('| ' + param.name + ' | ' + param.type + ' | ' + param.description + ' | ' + optional + ' | ' + defaultVal + ' |')
      }
      parts.push('')
    }

    if (entry.returnType.length > 0) {
      parts.push('**Returns:** `' + entry.returnType + '`')
      parts.push('')
    }

    if (entry.examples.length > 0) {
      parts.push('**Examples:**')
      parts.push('')
      for (const example of entry.examples) {
        parts.push('```typescript')
        parts.push(example)
        parts.push('```')
        parts.push('')
      }
    }

    if (entry.since.length > 0) {
      parts.push('**Since:** ' + entry.since)
      parts.push('')
    }

    if (entry.deprecated) {
      parts.push('> ⚠️ **Deprecated**')
      parts.push('')
    }

    if (entry.sourceFile.length > 0) {
      parts.push('**Source:** ' + entry.sourceFile + ':' + String(entry.lineNumber))
      parts.push('')
    }

    parts.push('---')
    parts.push('')

    return parts.join('\n')
  }

  generateJSON(): string {
    const entries = this.getEntries()
    return JSON.stringify({ title: this.options.title, entries }, null, 2)
  }

  generateHTML(): string {
    const entries = this.getEntries()
    const parts: string[] = []

    parts.push('<!DOCTYPE html>')
    parts.push('<html>')
    parts.push('<head>')
    parts.push('<title>' + this.escapeHTML(this.options.title) + '</title>')
    parts.push('</head>')
    parts.push('<body>')
    parts.push('<h1>' + this.escapeHTML(this.options.title) + '</h1>')

    if (this.options.tableOfContents && entries.length > 0) {
      parts.push('<nav>')
      const toc = this.generateTableOfContents()
      for (const entry of toc) {
        parts.push('<h' + String(entry.level + 1) + '><a href="#' + entry.anchor + '">' + this.escapeHTML(entry.title) + '</a></h' + String(entry.level + 1) + '>')
        for (const child of entry.children) {
          parts.push('<h' + String(child.level + 1) + '><a href="#' + child.anchor + '">' + this.escapeHTML(child.title) + '</a></h' + String(child.level + 1) + '>')
        }
      }
      parts.push('</nav>')
    }

    if (this.options.groupByCategory) {
      const groups = this.groupByCategory()
      const categories = Array.from(groups.keys())
      for (const category of categories) {
        const categoryEntries = groups.get(category)
        if (!categoryEntries) continue
        parts.push('<h2>' + this.escapeHTML(category) + '</h2>')
        for (const entry of categoryEntries) {
          parts.push(this.renderEntryHTML(entry))
        }
      }
    } else {
      for (const entry of entries) {
        parts.push(this.renderEntryHTML(entry))
      }
    }

    parts.push('</body>')
    parts.push('</html>')

    return parts.join('\n')
  }

  private renderEntryHTML(entry: DocEntry): string {
    const parts: string[] = []

    parts.push('<h3 id="' + this.slugify(entry.name) + '">' + this.escapeHTML(entry.kind) + ': ' + this.escapeHTML(entry.name) + '</h3>')

    if (entry.description.length > 0) {
      parts.push('<p>' + this.escapeHTML(entry.description) + '</p>')
    }

    if (entry.params.length > 0) {
      parts.push('<table>')
      parts.push('<thead><tr><th>Name</th><th>Type</th><th>Description</th><th>Optional</th><th>Default</th></tr></thead>')
      parts.push('<tbody>')
      for (const param of entry.params) {
        const optional = param.optional ? 'Yes' : 'No'
        const defaultVal = param.defaultValue.length > 0 ? param.defaultValue : '-'
        parts.push('<tr><td>' + this.escapeHTML(param.name) + '</td><td>' + this.escapeHTML(param.type) + '</td><td>' + this.escapeHTML(param.description) + '</td><td>' + optional + '</td><td>' + this.escapeHTML(defaultVal) + '</td></tr>')
      }
      parts.push('</tbody>')
      parts.push('</table>')
    }

    if (entry.returnType.length > 0) {
      parts.push('<p><strong>Returns:</strong> <code>' + this.escapeHTML(entry.returnType) + '</code></p>')
    }

    if (entry.examples.length > 0) {
      for (const example of entry.examples) {
        parts.push('<pre><code>' + this.escapeHTML(example) + '</code></pre>')
      }
    }

    if (entry.since.length > 0) {
      parts.push('<p><em>Since: ' + this.escapeHTML(entry.since) + '</em></p>')
    }

    if (entry.deprecated) {
      parts.push('<p><strong>⚠️ Deprecated</strong></p>')
    }

    if (entry.sourceFile.length > 0) {
      parts.push('<p><small>Source: ' + this.escapeHTML(entry.sourceFile) + ':' + String(entry.lineNumber) + '</small></p>')
    }

    return parts.join('\n')
  }

  generateText(): string {
    const entries = this.getEntries()
    const parts: string[] = []

    parts.push(this.options.title)
    parts.push('='.repeat(this.options.title.length))
    parts.push('')

    if (this.options.tableOfContents && entries.length > 0) {
      parts.push('Table of Contents')
      parts.push('-'.repeat(18))
      const toc = this.generateTableOfContents()
      for (const entry of toc) {
        parts.push('  ' + entry.title)
        for (const child of entry.children) {
          parts.push('    ' + child.title)
        }
      }
      parts.push('')
    }

    if (this.options.groupByCategory) {
      const groups = this.groupByCategory()
      const categories = Array.from(groups.keys())
      for (const category of categories) {
        const categoryEntries = groups.get(category)
        if (!categoryEntries) continue
        parts.push(category)
        parts.push('-'.repeat(category.length))
        parts.push('')
        for (const entry of categoryEntries) {
          parts.push(this.renderEntryText(entry))
        }
      }
    } else {
      for (const entry of entries) {
        parts.push(this.renderEntryText(entry))
      }
    }

    return parts.join('\n')
  }

  private renderEntryText(entry: DocEntry): string {
    const parts: string[] = []

    parts.push(entry.kind + ': ' + entry.name)
    parts.push('-'.repeat(entry.kind.length + entry.name.length + 2))
    parts.push('')

    if (entry.description.length > 0) {
      parts.push(entry.description)
      parts.push('')
    }

    if (entry.params.length > 0) {
      parts.push('Parameters:')
      for (const param of entry.params) {
        let line = '  - ' + param.name + ' (' + param.type + ')'
        if (param.description.length > 0) {
          line += ': ' + param.description
        }
        if (param.optional) {
          line += ' [optional]'
        }
        if (param.defaultValue.length > 0) {
          line += ' [default: ' + param.defaultValue + ']'
        }
        parts.push(line)
      }
      parts.push('')
    }

    if (entry.returnType.length > 0) {
      parts.push('Returns: ' + entry.returnType)
      parts.push('')
    }

    if (entry.examples.length > 0) {
      parts.push('Examples:')
      for (const example of entry.examples) {
        parts.push('  ' + example)
      }
      parts.push('')
    }

    if (entry.since.length > 0) {
      parts.push('Since: ' + entry.since)
      parts.push('')
    }

    if (entry.deprecated) {
      parts.push('[DEPRECATED]')
      parts.push('')
    }

    if (entry.sourceFile.length > 0) {
      parts.push('Source: ' + entry.sourceFile + ':' + String(entry.lineNumber))
      parts.push('')
    }

    return parts.join('\n')
  }

  generateTableOfContents(): TableOfContentsEntry[] {
    const entries = this.getEntries()
    const result: TableOfContentsEntry[] = []

    if (this.options.groupByCategory) {
      const groups = this.groupByCategory()
      const categories = Array.from(groups.keys())
      for (const category of categories) {
        const categoryEntries = groups.get(category)
        if (!categoryEntries) continue
        const children: TableOfContentsEntry[] = categoryEntries.map(entry => ({
          title: entry.kind + ': ' + entry.name,
          anchor: this.slugify(entry.name),
          level: 2,
          children: [],
        }))
        result.push({
          title: category,
          anchor: this.slugify(category),
          level: 1,
          children,
        })
      }
    } else {
      for (const entry of entries) {
        result.push({
          title: entry.kind + ': ' + entry.name,
          anchor: this.slugify(entry.name),
          level: 1,
          children: [],
        })
      }
    }

    return result
  }

  groupByCategory(): Map<string, DocEntry[]> {
    const entries = this.getEntries()
    const groups = new Map<string, DocEntry[]>()

    for (const entry of entries) {
      const category = entry.category.length > 0 ? entry.category : 'Uncategorized'
      const existing = groups.get(category)
      if (existing) {
        existing.push(entry)
      } else {
        groups.set(category, [entry])
      }
    }

    return groups
  }

  getCategories(): string[] {
    const entries = this.getEntries()
    const categories = new Set<string>()
    for (const entry of entries) {
      const category = entry.category.length > 0 ? entry.category : 'Uncategorized'
      categories.add(category)
    }
    return Array.from(categories)
  }

  getDeprecated(): DocEntry[] {
    return this.getEntries().filter(entry => entry.deprecated)
  }

  search(query: string): DocEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.getEntries().filter(entry =>
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.description.toLowerCase().includes(lowerQuery)
    )
  }

  getStatistics(): { totalEntries: number; byKind: Record<string, number>; byCategory: Record<string, number>; deprecated: number; public: number; private: number } {
    const entries = this.getEntries()
    const byKind: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    let deprecated = 0
    let publicCount = 0
    let privateCount = 0

    for (const entry of entries) {
      byKind[entry.kind] = (byKind[entry.kind] ?? 0) + 1
      const category = entry.category.length > 0 ? entry.category : 'Uncategorized'
      byCategory[category] = (byCategory[category] ?? 0) + 1
      if (entry.deprecated) deprecated++
      if (entry.visibility === 'public') publicCount++
      if (entry.visibility === 'private') privateCount++
    }

    return {
      totalEntries: entries.length,
      byKind,
      byCategory,
      deprecated,
      public: publicCount,
      private: privateCount,
    }
  }

  merge(other: DocGenerator): void {
    const existingNames = new Set(this.entries.map(e => e.name))
    const newEntries: DocEntry[] = []
    for (const entry of other.entries) {
      if (!existingNames.has(entry.name)) {
        newEntries.push(entry)
      }
    }
    this.entries = [...this.entries, ...newEntries]
  }

  getOptions(): DocGenerationOptions {
    return { ...this.options }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
