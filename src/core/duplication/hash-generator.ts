import { createHash } from 'node:crypto'

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'let', 'new', 'null', 'return', 'static', 'super', 'switch', 'this',
  'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while',
  'with', 'yield', 'async', 'await', 'of', 'from', 'as', 'type',
  'enum', 'implements', 'interface', 'package', 'private', 'protected',
  'public', 'readonly', 'abstract', 'declare', 'namespace',
])

const TOKEN_PATTERN = /[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+(?:\.[0-9]+)?|(?:=>|\.\.\.|\?\?|\|\||&&|===|!==|==|!=|<=|>=|[+\-*/%]=?|[<>!=]=?|&|\||\^|~|<<|>>>)|[{}()[\];,.:?]|"[^"]*"|'[^']*'|`[^`]*`/g

export class HashGenerator {
  generateTokenHash(tokens: string[]): string {
    if (tokens.length === 0) return createHash('sha256').update('').digest('hex')
    const joined = tokens.join('\x00')
    return createHash('sha256').update(joined).digest('hex')
  }

  generateContentHash(content: string): string {
    const normalized = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
    return createHash('sha256').update(normalized).digest('hex')
  }

  generateStructuralHash(ast: string): string {
    const rawTokens = this.tokenize(ast)
    const structuralTokens = rawTokens.map(token => {
      if (/^[a-zA-Z_$]/.test(token) && !JS_KEYWORDS.has(token) && !/^\d/.test(token)) {
        return '_ID_'
      }
      return token
    })
    return createHash('sha256').update(structuralTokens.join('\x00')).digest('hex')
  }

  tokenize(content: string): string[] {
    return content.match(TOKEN_PATTERN) ?? []
  }

  computeSimilarity(tokens1: string[], tokens2: string[]): number {
    if (tokens1.length === 0 && tokens2.length === 0) return 1.0
    if (tokens1.length === 0 || tokens2.length === 0) return 0.0

    const set1 = new Set(tokens1)
    const set2 = new Set(tokens2)

    let intersectionSize = 0
    for (const token of set1) {
      if (set2.has(token)) intersectionSize++
    }

    const unionSize = set1.size + set2.size - intersectionSize
    if (unionSize === 0) return 1.0

    return intersectionSize / unionSize
  }
}
