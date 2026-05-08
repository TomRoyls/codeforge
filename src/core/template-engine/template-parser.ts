import type { TemplateToken, TemplateConfig } from './types.js'
import { DEFAULT_TEMPLATE_CONFIG } from './types.js'

export class TemplateParser {
  private config: TemplateConfig

  constructor(config?: Partial<TemplateConfig>) {
    this.config = { ...DEFAULT_TEMPLATE_CONFIG, ...config }
  }

  parse(template: string): TemplateToken[] {
    const raw = this.tokenize(template)
    return this.buildTree(raw, 0, raw.length)
  }

  parseVariable(token: string): TemplateToken {
    const trimmed = token.trim()
    const varName = this.extractVarName(trimmed)
    return {
      type: 'variable',
      content: varName,
      start: 0,
      end: token.length,
    }
  }

  parseConditional(token: string): TemplateToken {
    const trimmed = token.trim()
    const match = trimmed.match(/^#if\s+(.+)$/)
    if (match && match[1]) {
      return {
        type: 'conditional',
        content: trimmed,
        start: 0,
        end: token.length,
        condition: match[1].trim(),
      }
    }
    if (trimmed === '/if') {
      return {
        type: 'conditional',
        content: trimmed,
        start: 0,
        end: token.length,
        condition: undefined,
      }
    }
    return {
      type: 'conditional',
      content: trimmed,
      start: 0,
      end: token.length,
      condition: trimmed,
    }
  }

  parseLoop(token: string): TemplateToken {
    const trimmed = token.trim()
    const match = trimmed.match(/^#each\s+(\w+)\s+in\s+(.+)$/)
    if (match && match[1] && match[2]) {
      return {
        type: 'loop',
        content: trimmed,
        start: 0,
        end: token.length,
        iterator: match[1],
        collection: match[2].trim(),
      }
    }
    const simpleMatch = trimmed.match(/^#each\s+(.+)$/)
    if (simpleMatch && simpleMatch[1]) {
      return {
        type: 'loop',
        content: trimmed,
        start: 0,
        end: token.length,
        iterator: 'this',
        collection: simpleMatch[1].trim(),
      }
    }
    if (trimmed === '/each') {
      return {
        type: 'loop',
        content: trimmed,
        start: 0,
        end: token.length,
      }
    }
    return {
      type: 'loop',
      content: trimmed,
      start: 0,
      end: token.length,
    }
  }

  findMatchingClose(
    tokens: TemplateToken[],
    startIndex: number,
    _openType: string,
    closeContent: string,
  ): number {
    let depth = 1
    for (let i = startIndex + 1; i < tokens.length; i++) {
      const t = tokens[i]!
      if (t.type === 'conditional' || t.type === 'loop') {
        if (t.content.startsWith('#')) {
          depth++
        } else if (
          (t.content === '/if' && closeContent === '/if') ||
          (t.content === '/each' && closeContent === '/each')
        ) {
          depth--
          if (depth === 0) return i
        }
      }
    }
    return -1
  }

  extractVarName(expression: string): string {
    return expression.replace(/^\s*\{\{|\}\}\s*$/g, '').trim()
  }

  tokenize(template: string): TemplateToken[] {
    const tokens: TemplateToken[] = []
    const open = this.config.openDelimiter
    const close = this.config.closeDelimiter
    let pos = 0

    while (pos < template.length) {
      const openIdx = template.indexOf(open, pos)
      if (openIdx === -1) {
        if (pos < template.length) {
          tokens.push({
            type: 'text',
            content: template.slice(pos),
            start: pos,
            end: template.length,
          })
        }
        break
      }

      if (openIdx > pos) {
        tokens.push({
          type: 'text',
          content: template.slice(pos, openIdx),
          start: pos,
          end: openIdx,
        })
      }

      const closeIdx = template.indexOf(close, openIdx + open.length)
      if (closeIdx === -1) {
        tokens.push({
          type: 'text',
          content: template.slice(openIdx),
          start: openIdx,
          end: template.length,
        })
        break
      }

      const inner = template.slice(openIdx + open.length, closeIdx)
      const trimmedInner = inner.trim()
      const token = this.classifyToken(trimmedInner, openIdx, closeIdx + close.length)
      tokens.push(token)
      pos = closeIdx + close.length
    }

    return tokens
  }

  private classifyToken(inner: string, start: number, end: number): TemplateToken {
    if (inner.startsWith('!')) {
      return { type: 'comment', content: inner, start, end }
    }
    if (inner.startsWith('>')) {
      const name = inner.slice(1).trim()
      return { type: 'partial', content: name, start, end }
    }
    if (inner.startsWith('#if')) {
      const condToken = this.parseConditional(inner)
      return { ...condToken, start, end }
    }
    if (inner === '/if') {
      return { type: 'conditional', content: '/if', start, end }
    }
    if (inner.startsWith('#each')) {
      const loopToken = this.parseLoop(inner)
      return { ...loopToken, start, end }
    }
    if (inner === '/each') {
      return { type: 'loop', content: '/each', start, end }
    }
    return { type: 'variable', content: inner, start, end }
  }

  private buildTree(tokens: TemplateToken[], start: number, end: number): TemplateToken[] {
    const result: TemplateToken[] = []
    let i = start

    while (i < end) {
      const token = tokens[i]!
      if (token.type === 'conditional' && token.content.startsWith('#if')) {
        const closeIdx = this.findMatchingClose(tokens, i, 'conditional', '/if')
        if (closeIdx === -1) {
          result.push(token)
          i++
          continue
        }
        const children = this.buildTree(tokens, i + 1, closeIdx)
        result.push({
          ...token,
          children,
        })
        i = closeIdx + 1
      } else if (token.type === 'loop' && token.content.startsWith('#each')) {
        const closeIdx = this.findMatchingClose(tokens, i, 'loop', '/each')
        if (closeIdx === -1) {
          result.push(token)
          i++
          continue
        }
        const children = this.buildTree(tokens, i + 1, closeIdx)
        result.push({
          ...token,
          children,
        })
        i = closeIdx + 1
      } else if (
        (token.type === 'conditional' && token.content === '/if') ||
        (token.type === 'loop' && token.content === '/each')
      ) {
        i++
      } else {
        result.push(token)
        i++
      }
    }

    return result
  }
}
