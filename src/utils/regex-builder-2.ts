export class RegexBuilder2 {
  private parts: string[] = []
  private flags: string = ''

  text(literal: string): this {
    this.parts.push(literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return this
  }

  anyOf(chars: string): this {
    this.parts.push(`[${chars}]`)
    return this
  }

  range(from: string, to: string): this {
    this.parts.push(`[${from}-${to}]`)
    return this
  }

  digit(): this { this.parts.push('\\d'); return this }
  nonDigit(): this { this.parts.push('\\D'); return this }
  wordChar(): this { this.parts.push('\\w'); return this }
  whitespace(): this { this.parts.push('\\s'); return this }
  nonWhitespace(): this { this.parts.push('\\S'); return this }

  start(): this { this.parts.push('^'); return this }
  end(): this { this.parts.push('$'); return this }
  wordBoundary(): this { this.parts.push('\\b'); return this }

  oneOrMore(): this { this.parts.push('+'); return this }
  zeroOrMore(): this { this.parts.push('*'); return this }
  optional(): this { this.parts.push('?'); return this }
  exactly(n: number): this { this.parts.push(`{${n}}`); return this }
  atLeast(n: number): this { this.parts.push(`{${n},}`); return this }
  between(min: number, max: number): this { this.parts.push(`{${min},${max}}`); return this }

  group(pattern: string | RegexBuilder2): this {
    const inner = typeof pattern === 'string' ? pattern : pattern.build()
    this.parts.push(`(${inner})`)
    return this
  }

  namedGroup(name: string, pattern: string | RegexBuilder2): this {
    const inner = typeof pattern === 'string' ? pattern : pattern.build()
    this.parts.push(`(?<${name}>${inner})`)
    return this
  }

  nonCapturing(pattern: string | RegexBuilder2): this {
    const inner = typeof pattern === 'string' ? pattern : pattern.build()
    this.parts.push(`(?:${inner})`)
    return this
  }

  or(): this { this.parts.push('|'); return this }

  lookahead(pattern: string): this { this.parts.push(`(?=${pattern})`); return this }
  negativeLookahead(pattern: string): this { this.parts.push(`(?!${pattern})`); return this }

  addFlag(flag: string): this {
    if (!this.flags.includes(flag)) this.flags += flag
    return this
  }

  caseInsensitive(): this { return this.addFlag('i') }
  global(): this { return this.addFlag('g') }
  multiline(): this { return this.addFlag('m') }

  build(): string {
    return this.parts.join('')
  }

  toRegExp(): RegExp {
    return new RegExp(this.build(), this.flags)
  }

  test(input: string): boolean {
    return this.toRegExp().test(input)
  }

  exec(input: string): RegExpExecArray | null {
    return this.toRegExp().exec(input)
  }

  replace(input: string, replacement: string): string {
    return input.replace(this.toRegExp(), replacement)
  }

  match(input: string): string[] | null {
    return input.match(this.toRegExp())
  }

  matchAll(input: string): RegExpMatchArray[] {
    const flag = this.flags.includes('g') ? this.flags : this.flags + 'g'
    const re = new RegExp(this.build(), flag)
    return Array.from(input.matchAll(re))
  }

  split(input: string): string[] {
    return input.split(this.toRegExp())
  }

  getParts(): string[] { return [...this.parts] }
  getFlags(): string { return this.flags }

  toArray(): string[] { return this.getParts() }
  toString(): string { return `/${this.build()}/${this.flags}` }
  toJSON(): Record<string, unknown> { return { pattern: this.build(), flags: this.flags } }
  clone(): RegexBuilder2 {
    const rb = new RegexBuilder2()
    rb.parts = [...this.parts]
    rb.flags = this.flags
    return rb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RegexBuilder2)) return false
    return this.build() === other.build() && this.flags === other.flags
  }
  clear(): void { this.parts = []; this.flags = '' }
}
