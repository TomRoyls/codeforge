export interface TemplateToken {
  type: 'text' | 'variable' | 'conditional' | 'loop' | 'comment' | 'partial'
  content: string
  start: number
  end: number
  children?: TemplateToken[]
  condition?: string
  iterator?: string
  collection?: string
}

export interface TemplateContext {
  [key: string]: string | number | boolean | null | undefined | TemplateContext | TemplateContext[]
}

export interface TemplateConfig {
  openDelimiter: string
  closeDelimiter: string
  escape: boolean
  strict: boolean
  trimWhitespace: boolean
}

export interface RenderResult {
  output: string
  tokensUsed: number
  variablesAccessed: string[]
  warnings: string[]
  errors: string[]
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  openDelimiter: '{{',
  closeDelimiter: '}}',
  escape: true,
  strict: false,
  trimWhitespace: false,
}
