export interface DocParam {
  name: string
  type: string
  description: string
  optional: boolean
  defaultValue: string
}

export interface DocEntry {
  name: string
  kind: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'module'
  description: string
  params: DocParam[]
  returnType: string
  examples: string[]
  since: string
  deprecated: boolean
  category: string
  visibility: 'public' | 'private' | 'protected'
  sourceFile: string
  lineNumber: number
}

export interface DocCategory {
  name: string
  description: string
  entries: DocEntry[]
}

export type DocOutputFormat = 'markdown' | 'json' | 'html' | 'text'

export interface DocGenerationOptions {
  format: DocOutputFormat
  includePrivate: boolean
  includeDeprecated: boolean
  groupByCategory: boolean
  tableOfContents: boolean
  title: string
}

export const DEFAULT_DOC_GENERATION_OPTIONS: DocGenerationOptions = {
  format: 'markdown',
  includePrivate: false,
  includeDeprecated: true,
  groupByCategory: true,
  tableOfContents: true,
  title: 'API Documentation',
}

export interface TableOfContentsEntry {
  title: string
  anchor: string
  level: number
  children: TableOfContentsEntry[]
}
