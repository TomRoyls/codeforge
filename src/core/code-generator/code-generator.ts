import type {
  CodeFragment,
  GenerationContext,
  GenerationResult,
  GeneratorConfig,
  IndentStyle,
  Language,
} from './types.js'
import { DEFAULT_GENERATOR_CONFIG } from './types.js'
import { countLines } from '../../utils/string-helpers.js'

export type {
  IndentStyle,
  Language,
  CodeFragment,
  GenerationContext,
  GenerationResult,
  GeneratorConfig,
}

const BLOCK_TYPES = new Set([
  'if',
  'else',
  'function',
  'class',
  'for',
  'while',
  'loop',
  'try',
  'catch',
  'switch',
  'interface',
])

export class CodeGenerator {
  private fragments: CodeFragment[]
  private config: GeneratorConfig
  private currentIndent: number

  constructor(config?: Partial<GeneratorConfig>) {
    const base = DEFAULT_GENERATOR_CONFIG
    this.config = {
      context: config?.context
        ? { ...base.context, ...config.context }
        : { ...base.context },
      initialIndent: config?.initialIndent ?? base.initialIndent,
      maxIndent: config?.maxIndent ?? base.maxIndent,
      newline: config?.newline ?? base.newline,
      trimTrailingWhitespace:
        config?.trimTrailingWhitespace ?? base.trimTrailingWhitespace,
    }
    this.fragments = []
    this.currentIndent = this.config.initialIndent
  }

  addFragment(fragment: CodeFragment): void {
    this.fragments.push({
      ...fragment,
      indent: this.currentIndent + fragment.indent,
      children: fragment.children.map((c) => ({ ...c, children: [...c.children] })),
    })
  }

  getFragments(): CodeFragment[] {
    return this.fragments.map((f) => ({
      ...f,
      children: f.children.map((c) => ({ ...c, children: [...c.children] })),
    }))
  }

  generate(variables: Record<string, string> = {}): GenerationResult {
    const codeParts: string[] = []
    for (const fragment of this.fragments) {
      const rendered = this.renderFragment(fragment, variables)
      if (rendered !== '') {
        codeParts.push(rendered)
      }
    }
    let code = codeParts.join(this.config.newline)
    if (this.config.trimTrailingWhitespace) {
      code = code
        .split(this.config.newline)
        .map((line) => line.trimEnd())
        .join(this.config.newline)
    }
    const lineCount = code.length > 0 ? code.split(this.config.newline).length : 0
    const charCount = code.length
    return {
      code,
      fragments: this.getFragments(),
      lineCount,
      charCount,
    }
  }

  renderFragment(
    fragment: CodeFragment,
    variables: Record<string, string> = {},
  ): string {
    const indentLevel = Math.min(fragment.indent, this.config.maxIndent)
    const indentStr = this.getIndentString(indentLevel)
    const content = this.interpolate(fragment.content, variables)
    const isBlock = BLOCK_TYPES.has(fragment.type)

    if (isBlock && fragment.children.length > 0) {
      return this.renderBlock(
        fragment.type,
        content,
        fragment.children,
        indentStr,
        variables,
        indentLevel,
      )
    }

    const parts: string[] = []

    if (content !== '') {
      const lines = content.split('\n')
      const indentedLines = lines.map((line) => {
        if (line.trim() === '') return ''
        return indentStr + line
      })
      parts.push(indentedLines.join(this.config.newline))
    }

    if (fragment.children.length > 0) {
      const childIndent = indentLevel + 1
      const childParts: string[] = []
      for (const child of fragment.children) {
        const rendered = this.renderFragment(
          { ...child, indent: childIndent + child.indent },
          variables,
        )
        if (rendered !== '') {
          childParts.push(rendered)
        }
      }
      if (childParts.length > 0) {
        parts.push(childParts.join(this.config.newline))
      }
    }

    return parts.join(this.config.newline)
  }

  interpolate(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value)
    }
    return result
  }

  indent(): void {
    if (this.currentIndent < this.config.maxIndent) {
      this.currentIndent++
    }
  }

  dedent(): void {
    if (this.currentIndent > 0) {
      this.currentIndent--
    }
  }

  getStatistics(): {
    fragmentCount: number
    totalLines: number
    totalChars: number
  } {
    let totalChars = 0
    let totalLines = 0

    const countFragment = (f: CodeFragment): void => {
      if (f.content.length > 0) {
        totalChars += f.content.length
        totalLines += countLines(f.content)
      }
      for (const child of f.children) {
        countFragment(child)
      }
    }

    for (const fragment of this.fragments) {
      countFragment(fragment)
    }

    return {
      fragmentCount: this.fragments.length,
      totalLines,
      totalChars,
    }
  }

  clear(): void {
    this.fragments = []
    this.currentIndent = this.config.initialIndent
  }

  private renderBlock(
    type: string,
    content: string,
    children: CodeFragment[],
    indentStr: string,
    variables: Record<string, string>,
    parentIndent: number,
  ): string {
    const childIndent = parentIndent + 1

    const childParts: string[] = []
    for (const child of children) {
      const rendered = this.renderFragment(
        { ...child, indent: childIndent + child.indent },
        variables,
      )
      if (rendered !== '') {
        childParts.push(rendered)
      }
    }
    const body = childParts.join(this.config.newline)

    const ctx = this.config.context
    if (ctx.language === 'python') {
      const header = content.trim() === '' ? `${type}:` : `${content}:`
      return indentStr + header + this.config.newline + body
    }
    const header = content.trim() === '' ? `${type} {` : `${content} {`
    return (
      indentStr +
      header +
      this.config.newline +
      body +
      this.config.newline +
      indentStr +
      '}'
    )
  }

  private getIndentString(level: number): string {
    if (this.config.context.indentStyle === 'tabs') {
      return '\t'.repeat(level)
    }
    return ' '.repeat(level * this.config.context.indentSize)
  }
}
