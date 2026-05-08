export type IndentStyle = 'spaces' | 'tabs'

export type Language = 'typescript' | 'javascript' | 'python' | 'generic'

export interface CodeFragment {
  type: string
  content: string
  indent: number
  children: CodeFragment[]
}

export interface GenerationContext {
  language: Language
  indentStyle: IndentStyle
  indentSize: number
  maxLineLength: number
}

export interface GenerationResult {
  code: string
  fragments: CodeFragment[]
  lineCount: number
  charCount: number
}

export interface GeneratorConfig {
  context: GenerationContext
  initialIndent: number
  maxIndent: number
  newline: string
  trimTrailingWhitespace: boolean
}

export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  context: {
    language: 'typescript',
    indentStyle: 'spaces',
    indentSize: 2,
    maxLineLength: 80,
  },
  initialIndent: 0,
  maxIndent: 16,
  newline: '\n',
  trimTrailingWhitespace: true,
}
