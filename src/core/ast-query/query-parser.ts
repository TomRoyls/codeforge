import type {
  Token,
  QuerySelector,
  AttributeSelector,
  PseudoSelector,
  ParseError,
} from './types.js'

export class QueryParser {
  parse(query: string): QuerySelector {
    const trimmed = query.trim()
    if (trimmed.length === 0) {
      throw this.createError(0, 'Empty query string')
    }
    const tokens = this.tokenize(trimmed)
    const result = this.parseSelector(tokens)
    return result
  }

  tokenize(query: string): Token[] {
    const tokens: Token[] = []
    let i = 0

    while (i < query.length) {
      if (/\s/.test(query[i]!)) {
        i++
        continue
      }

      if (query[i] === '*') {
        tokens.push({ type: 'universal', value: '*' })
        i++
        continue
      }

      if (query[i] === '[') {
        const start = i
        i++
        while (i < query.length && query[i] !== ']') {
          i++
        }
        if (i >= query.length) {
          throw this.createError(start, 'Unclosed attribute selector')
        }
        tokens.push({
          type: 'attribute',
          value: query.substring(start + 1, i),
        })
        i++
        continue
      }

      if (query[i] === ':') {
        const start = i
        i++
        if (i < query.length && query[i] === ':') {
          i++
        }
        let depth = 0
        while (i < query.length) {
          if (query[i] === '(') depth++
          if (query[i] === ')') {
            depth--
            if (depth === 0) {
              i++
              break
            }
          }
          if (depth === 0 && /[\s\[\]:]/.test(query[i]!) && query[i] !== '(') {
            break
          }
          i++
        }
        tokens.push({
          type: 'pseudo',
          value: query.substring(start + 1, i),
        })
        continue
      }

      if (query[i] === '>') {
        tokens.push({ type: 'combinator', value: '>' })
        i++
        continue
      }

      if (query[i] === '+') {
        tokens.push({ type: 'combinator', value: '+' })
        i++
        continue
      }

      if (query[i] === '~') {
        tokens.push({ type: 'combinator', value: '~' })
        i++
        continue
      }

      if (query[i] === ',') {
        tokens.push({ type: 'group', value: ',' })
        i++
        continue
      }

      if (/[A-Za-z_]/.test(query[i]!)) {
        const start = i
        while (i < query.length && /[A-Za-z0-9_]/.test(query[i]!)) {
          i++
        }
        tokens.push({ type: 'type', value: query.substring(start, i) })
        continue
      }

      throw this.createError(i, `Unexpected character: ${query[i]}`)
    }

    return tokens
  }

  private parseSelector(tokens: Token[]): QuerySelector {
    if (tokens.length === 0) {
      throw this.createError(0, 'No tokens to parse')
    }

    let idx = 0
    let nodeType = '*'
    const attributes: AttributeSelector[] = []
    const pseudoClasses: PseudoSelector[] = []

    if (
      tokens[idx] &&
      tokens[idx]!.type === 'type'
    ) {
      nodeType = tokens[idx]!.value
      idx++
    } else if (
      tokens[idx] &&
      tokens[idx]!.type === 'universal'
    ) {
      nodeType = '*'
      idx++
    }

    while (
      idx < tokens.length &&
      tokens[idx]!.type !== 'combinator' &&
      tokens[idx]!.type !== 'group'
    ) {
      const token = tokens[idx]!
      if (token.type === 'attribute') {
        attributes.push(this.parseAttribute(token.value))
        idx++
      } else if (token.type === 'pseudo') {
        pseudoClasses.push(this.parsePseudo(token.value))
        idx++
      } else if (token.type === 'type') {
        break
      } else {
        break
      }
    }

    let combinator: { type: 'descendant' | 'child' | 'sibling' | 'adjacent' } | undefined
    let child: QuerySelector | undefined

    if (idx < tokens.length && tokens[idx]!.type === 'combinator') {
      const comb = tokens[idx]!.value
      idx++
      if (comb === '>') {
        combinator = { type: 'child' }
      } else if (comb === '+') {
        combinator = { type: 'adjacent' }
      } else if (comb === '~') {
        combinator = { type: 'sibling' }
      }
      const remaining = tokens.slice(idx)
      if (remaining.length > 0) {
        child = this.parseSelector(remaining)
      }
    } else if (idx < tokens.length) {
      combinator = { type: 'descendant' }
      const remaining = tokens.slice(idx)
      if (remaining.length > 0) {
        child = this.parseSelector(remaining)
      }
    }

    return {
      nodeType,
      attributes,
      pseudoClasses,
      combinator,
      child,
    }
  }

  parseAttribute(attr: string): AttributeSelector {
    const operators = ['!=', '~=', '^=', '$=', '*=', '=']
    for (const op of operators) {
      const idx = attr.indexOf(op)
      if (idx !== -1) {
        const name = attr.substring(0, idx).trim()
        let value = attr.substring(idx + op.length).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        return { name, operator: op as AttributeSelector['operator'], value }
      }
    }

    const numOperators = ['>=', '<=', '>', '<']
    for (const op of numOperators) {
      const idx = attr.indexOf(op)
      if (idx !== -1) {
        const name = attr.substring(0, idx).trim()
        const value = attr.substring(idx + op.length).trim()
        return {
          name,
          operator: '=',
          value: `${op}${value}`,
        }
      }
    }

    return { name: attr.trim(), operator: 'exists' }
  }

  parsePseudo(pseudo: string): PseudoSelector {
    const parenIdx = pseudo.indexOf('(')
    if (parenIdx === -1) {
      return { name: pseudo }
    }

    const name = pseudo.substring(0, parenIdx)
    let argument = pseudo.substring(parenIdx + 1)
    if (argument.endsWith(')')) {
      argument = argument.slice(0, -1)
    }

    const num = Number(argument)
    if (!isNaN(num) && argument.trim() !== '') {
      return { name, argument: num }
    }

    return { name, argument }
  }

  private createError(position: number, message: string): ParseError & { toString(): string } {
    const error: ParseError & { toString(): string } = {
      position,
      message,
      toString() {
        return `ParseError at position ${position}: ${message}`
      },
    }
    return error
  }
}
