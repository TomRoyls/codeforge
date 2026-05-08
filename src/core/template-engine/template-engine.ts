import type { TemplateContext, TemplateConfig, TemplateToken, RenderResult } from './types.js'
import { DEFAULT_TEMPLATE_CONFIG } from './types.js'
import { TemplateParser } from './template-parser.js'

type HelperFn = (...args: unknown[]) => string

export class TemplateEngine {
  private config: TemplateConfig
  private parser: TemplateParser
  private helpers: Map<string, HelperFn>
  private partials: Map<string, string>

  constructor(config?: Partial<TemplateConfig>) {
    this.config = { ...DEFAULT_TEMPLATE_CONFIG, ...config }
    this.parser = new TemplateParser(config)
    this.helpers = new Map()
    this.partials = new Map()
  }

  render(template: string, context: TemplateContext): string {
    return this.renderWithResult(template, context).output
  }

  renderWithResult(template: string, context: TemplateContext): RenderResult {
    const result: RenderResult = {
      output: '',
      tokensUsed: 0,
      variablesAccessed: [],
      warnings: [],
      errors: [],
    }
    const tokens = this.parser.parse(template)
    result.tokensUsed = tokens.length
    result.output = this.renderTokens(tokens, context, result)
    return result
  }

  compile(template: string): (context: TemplateContext) => string {
    const tokens = this.parser.parse(template)
    return (context: TemplateContext) => {
      const result: RenderResult = {
        output: '',
        tokensUsed: 0,
        variablesAccessed: [],
        warnings: [],
        errors: [],
      }
      return this.renderTokens(tokens, context, result)
    }
  }

  registerHelper(name: string, fn: HelperFn): void {
    this.helpers.set(name, fn)
  }

  registerPartial(name: string, template: string): void {
    this.partials.set(name, template)
  }

  escapeHtml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return str.replace(/[&<>"']/g, (c) => map[c] ?? c)
  }

  getConfig(): TemplateConfig {
    return { ...this.config }
  }

  validate(template: string): string[] {
    const errors: string[] = []
    const tokens = this.parser.tokenize(template)
    const stack: string[] = []

    for (const token of tokens) {
      if (token.type === 'conditional' && token.content.startsWith('#if')) {
        stack.push('if')
      } else if (token.type === 'conditional' && token.content === '/if') {
        if (stack.length === 0 || stack[stack.length - 1] !== 'if') {
          errors.push(`Unexpected closing tag {{/if}} at position ${token.start}`)
        } else {
          stack.pop()
        }
      } else if (token.type === 'loop' && token.content.startsWith('#each')) {
        stack.push('each')
      } else if (token.type === 'loop' && token.content === '/each') {
        if (stack.length === 0 || stack[stack.length - 1] !== 'each') {
          errors.push(`Unexpected closing tag {{/each}} at position ${token.start}`)
        } else {
          stack.pop()
        }
      }
    }

    for (const unclosed of stack) {
      if (unclosed === 'if') {
        errors.push('Unclosed {{#if}} block')
      } else if (unclosed === 'each') {
        errors.push('Unclosed {{#each}} block')
      }
    }

    return errors
  }

  getVariables(template: string): string[] {
    const tokens = this.parser.parse(template)
    const vars = new Set<string>()
    this.collectVariables(tokens, vars)
    return Array.from(vars)
  }

  private collectVariables(tokens: TemplateToken[], vars: Set<string>): void {
    for (const token of tokens) {
      if (token.type === 'variable') {
        vars.add(token.content)
      } else if (token.type === 'conditional' && token.condition) {
        vars.add(token.condition)
        if (token.children) {
          this.collectVariables(token.children, vars)
        }
      } else if (token.type === 'loop' && token.collection) {
        vars.add(token.collection)
        if (token.children) {
          this.collectVariables(token.children, vars)
        }
      } else if (token.children) {
        this.collectVariables(token.children, vars)
      }
    }
  }

  private renderTokens(
    tokens: TemplateToken[],
    context: TemplateContext,
    result: RenderResult,
  ): string {
    let output = ''
    for (const token of tokens) {
      output += this.renderToken(token, context, result)
    }
    return output
  }

  private renderToken(
    token: TemplateToken,
    context: TemplateContext,
    result: RenderResult,
  ): string {
    switch (token.type) {
      case 'text':
        return this.config.trimWhitespace ? token.content.trim() : token.content
      case 'variable':
        return this.renderVariable(token, context, result)
      case 'conditional':
        return this.renderConditional(token, context, result)
      case 'loop':
        return this.renderLoop(token, context, result)
      case 'comment':
        return ''
      case 'partial':
        return this.renderPartial(token, context, result)
      default:
        return ''
    }
  }

  private renderVariable(
    token: TemplateToken,
    context: TemplateContext,
    result: RenderResult,
  ): string {
    const varName = token.content
    result.variablesAccessed.push(varName)

    const helperMatch = varName.match(/^(\w+)\s+(.+)$/)
    if (helperMatch && helperMatch[1] && helperMatch[2]) {
      const helperName = helperMatch[1]
      const helper = this.helpers.get(helperName)
      if (helper) {
        const argParts = helperMatch[2].split(/\s+/)
        const args = argParts.map((arg) => this.resolveValue(arg, context))
        return helper(...args)
      }
    }

    const value = this.resolveValue(varName, context)
    if (value === undefined || value === null) {
      if (this.config.strict) {
        result.errors.push(`Undefined variable: ${varName}`)
      } else {
        result.warnings.push(`Undefined variable: ${varName}`)
      }
      return ''
    }
    const strValue = String(value)
    return this.config.escape ? this.escapeHtml(strValue) : strValue
  }

  private resolveValue(path: string, context: TemplateContext): unknown {
    const parts = path.split('.')
    let current: unknown = context
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      if (Array.isArray(current)) {
        const idx = Number(part)
        if (Number.isNaN(idx)) return undefined
        current = current[idx]
      } else if (typeof current === 'object') {
        current = (current as TemplateContext)[part]
      } else {
        return undefined
      }
    }
    return current
  }

  private renderConditional(
    token: TemplateToken,
    context: TemplateContext,
    result: RenderResult,
  ): string {
    if (!token.condition || !token.children) return ''
    result.variablesAccessed.push(token.condition)

    const value = this.resolveValue(token.condition, context)
    const isTruthy = this.isTruthy(value)
    if (isTruthy) {
      return this.renderTokens(token.children, context, result)
    }
    return ''
  }

  private renderLoop(
    token: TemplateToken,
    context: TemplateContext,
    result: RenderResult,
  ): string {
    if (!token.collection || !token.children) return ''
    result.variablesAccessed.push(token.collection)

    const collection = this.resolveValue(token.collection, context)
    if (!Array.isArray(collection)) {
      if (this.config.strict) {
        result.errors.push(`Expected array for ${token.collection}`)
      }
      return ''
    }

    const iteratorName = token.iterator ?? 'this'
    let output = ''
    let idx = 0
    for (const item of collection) {
      const loopContext: TemplateContext = {
        ...context,
        [iteratorName]: item,
        '@index': idx,
        '@first': idx === 0,
        '@last': idx === collection.length - 1,
      }
      output += this.renderTokens(token.children, loopContext, result)
      idx++
    }
    return output
  }

  private renderPartial(
    token: TemplateToken,
    context: TemplateContext,
    result: RenderResult,
  ): string {
    const partialName = token.content
    const partialTemplate = this.partials.get(partialName)
    if (!partialTemplate) {
      if (this.config.strict) {
        result.errors.push(`Unknown partial: ${partialName}`)
      } else {
        result.warnings.push(`Unknown partial: ${partialName}`)
      }
      return ''
    }
    return this.renderTokens(this.parser.parse(partialTemplate), context, result)
  }

  private isTruthy(value: unknown): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') return value.length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }
}
