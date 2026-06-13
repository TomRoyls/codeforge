export type Token = { type: 'num' | 'op' | 'lparen' | 'rparen'; value: string }

export class ExprEvaluator2 {
  private static tokenize(expr: string): Token[] {
    const tokens: Token[] = []
    let i = 0
    while (i < expr.length) {
      const c = expr[i]
      if (c === ' ') { i++; continue }
      if (c >= '0' && c <= '9' || c === '.') {
        let num = ''
        while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9' || expr[i] === '.')) { num += expr[i]; i++ }
        tokens.push({ type: 'num', value: num })
      } else if (c === '(') { tokens.push({ type: 'lparen', value: c }); i++ }
      else if (c === ')') { tokens.push({ type: 'rparen', value: c }); i++ }
      else if ('+-*/^%'.includes(c)) { tokens.push({ type: 'op', value: c }); i++ }
      else i++
    }
    return tokens
  }

  private static precedence(op: string): number {
    if (op === '+' || op === '-') return 1
    if (op === '*' || op === '/' || op === '%') return 2
    if (op === '^') return 3
    return 0
  }

  private static toRPN(tokens: Token[]): Token[] {
    const output: Token[] = []
    const stack: Token[] = []
    for (const token of tokens) {
      if (token.type === 'num') output.push(token)
      else if (token.type === 'op') {
        while (stack.length > 0 && stack[stack.length - 1].type === 'op' &&
               ExprEvaluator2.precedence(stack[stack.length - 1].value) >= ExprEvaluator2.precedence(token.value)) {
          output.push(stack.pop()!)
        }
        stack.push(token)
      } else if (token.type === 'lparen') stack.push(token)
      else if (token.type === 'rparen') {
        while (stack.length > 0 && stack[stack.length - 1].type !== 'lparen') {
          output.push(stack.pop()!)
        }
        stack.pop()
      }
    }
    while (stack.length > 0) {
      const t = stack.pop()!
      if (t.type !== 'lparen') output.push(t)
    }
    return output
  }

  static evaluate(expr: string): number {
    const tokens = ExprEvaluator2.tokenize(expr)
    const rpn = ExprEvaluator2.toRPN(tokens)
    const stack: number[] = []
    for (const token of rpn) {
      if (token.type === 'num') stack.push(parseFloat(token.value))
      else {
        const b = stack.pop()!
        const a = stack.pop()!
        switch (token.value) {
          case '+': stack.push(a + b); break
          case '-': stack.push(a - b); break
          case '*': stack.push(a * b); break
          case '/': stack.push(a / b); break
          case '%': stack.push(a % b); break
          case '^': stack.push(Math.pow(a, b)); break
        }
      }
    }
    return stack[0] ?? 0
  }

  static isValid(expr: string): boolean {
    try {
      const result = ExprEvaluator2.evaluate(expr)
      return Number.isFinite(result)
    } catch { return false }
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): ExprEvaluator2 { return new ExprEvaluator2() }
  equals(other: unknown): boolean { return other instanceof ExprEvaluator2 }
}
