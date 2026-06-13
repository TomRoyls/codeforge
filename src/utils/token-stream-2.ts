export interface Token2 {
  type: string
  value: string
  position: number
}

export class TokenStream2 {
  private tokens: Token2[] = []
  private pos = 0
  private input: string = ''
  private patterns: { type: string; regex: RegExp }[] = []
  private skipPatterns: RegExp[] = []

  constructor(input?: string) {
    if (input) this.input = input
  }

  setInput(input: string): this {
    this.input = input
    this.tokens = []
    this.pos = 0
    return this
  }

  addPattern(type: string, regex: RegExp): this {
    this.patterns.push({ type, regex })
    return this
  }

  addSkip(regex: RegExp): this {
    this.skipPatterns.push(regex)
    return this
  }

  tokenize(): Token2[] {
    this.tokens = []
    let pos = 0
    while (pos < this.input.length) {
      let skipped = false
      for (const skipRe of this.skipPatterns) {
        skipRe.lastIndex = pos
        const match = skipRe.exec(this.input)
        if (match && match.index === pos) {
          pos = skipRe.lastIndex
          skipped = true
          break
        }
      }
      if (skipped) continue

      let matched = false
      for (const { type, regex } of this.patterns) {
        regex.lastIndex = pos
        const match = regex.exec(this.input)
        if (match && match.index === pos && match[0].length > 0) {
          this.tokens.push({ type, value: match[0], position: pos })
          pos = regex.lastIndex
          matched = true
          break
        }
      }
      if (!matched) {
        throw new Error(`Unexpected character at position ${pos}: '${this.input[pos]}'`)
      }
    }
    return this.tokens
  }

  getTokens(): Token2[] { return [...this.tokens] }

  peek(offset = 0): Token2 | null {
    const idx = this.pos + offset
    if (idx >= this.tokens.length) return null
    return this.tokens[idx]
  }

  next(): Token2 | null {
    if (this.pos >= this.tokens.length) return null
    return this.tokens[this.pos++]
  }

  hasNext(): boolean { return this.pos < this.tokens.length }

  getPosition(): number { return this.pos }
  setPosition(pos: number): void { this.pos = pos }

  expect(type: string): Token2 {
    const token = this.next()
    if (!token || token.type !== type) {
      throw new Error(`Expected token type '${type}' but got '${token?.type ?? 'EOF'}'`)
    }
    return token
  }

  expectValue(value: string): Token2 {
    const token = this.next()
    if (!token || token.value !== value) {
      throw new Error(`Expected token value '${value}' but got '${token?.value ?? 'EOF'}'`)
    }
    return token
  }

  consume(type: string): boolean {
    if (this.peek()?.type === type) {
      this.next()
      return true
    }
    return false
  }

  consumeWhile(predicate: (token: Token2) => boolean): Token2[] {
    const consumed: Token2[] = []
    while (this.hasNext() && predicate(this.peek()!)) {
      consumed.push(this.next()!)
    }
    return consumed
  }

  remaining(): number { return this.tokens.length - this.pos }
  count(): number { return this.tokens.length }

  reset(): void { this.pos = 0 }

  toArray(): Token2[] { return this.getTokens() }
  toString(): string { return this.tokens.map(t => `${t.type}:${t.value}`).join(' ') }
  toJSON(): Record<string, unknown> { return { tokens: this.tokens.length, pos: this.pos } }
  clone(): TokenStream2 {
    const ts = new TokenStream2(this.input)
    ts.tokens = [...this.tokens]
    ts.pos = this.pos
    ts.patterns = [...this.patterns]
    ts.skipPatterns = [...this.skipPatterns]
    return ts
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TokenStream2)) return false
    return this.tokens.length === other.tokens.length
  }
  clear(): void { this.tokens = []; this.pos = 0; this.input = '' }
}
