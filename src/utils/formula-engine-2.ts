export class FormulaEngine2 {
  private variables = new Map<string, number>()
  private functions = new Map<string, (args: number[]) => number>()

  constructor() {
    this.functions.set('sum', (a) => a.reduce((s, v) => s + v, 0))
    this.functions.set('avg', (a) => a.length > 0 ? a.reduce((s, v) => s + v, 0) / a.length : 0)
    this.functions.set('max', (a) => a.length > 0 ? Math.max(...a) : 0)
    this.functions.set('min', (a) => a.length > 0 ? Math.min(...a) : 0)
    this.functions.set('abs', (a) => Math.abs(a[0] ?? 0))
    this.functions.set('sqrt', (a) => Math.sqrt(a[0] ?? 0))
    this.functions.set('pow', (a) => Math.pow(a[0] ?? 0, a[1] ?? 1))
    this.functions.set('round', (a) => Math.round(a[0] ?? 0))
    this.functions.set('floor', (a) => Math.floor(a[0] ?? 0))
    this.functions.set('ceil', (a) => Math.ceil(a[0] ?? 0))
  }

  setVariable(name: string, value: number): void {
    this.variables.set(name, value)
  }

  getVariable(name: string): number | undefined {
    return this.variables.get(name)
  }

  registerFunction(name: string, fn: (args: number[]) => number): void {
    this.functions.set(name.toLowerCase(), fn)
  }

  evaluate(formula: string): number {
    let result = formula
    result = result.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
      const lower = match.toLowerCase()
      if (this.variables.has(match)) return String(this.variables.get(match))
      if (this.functions.has(lower)) return match
      return '0'
    })
    try {
      if (result.includes('(') && result.includes(')')) {
        return this.evaluateWithFunctions(result)
      }
      return this.safeEval(result)
    } catch {
      return 0
    }
  }

  private evaluateWithFunctions(expr: string): number {
    const funcRegex = /([a-zA-Z]+)\(([^()]*?)\)/
    let result = expr
    let match: RegExpMatchArray | null
    while ((match = result.match(funcRegex)) !== null) {
      const fnName = match[1].toLowerCase()
      const args = match[2].split(',').map(a => parseFloat(a.trim()) || 0)
      const fn = this.functions.get(fnName)
      const value = fn ? fn(args) : 0
      result = result.replace(match[0], String(value))
    }
    return this.safeEval(result)
  }

  private safeEval(expr: string): number {
    const cleaned = expr.replace(/[^-+*/().,\d\s]/g, '')
    if (cleaned.trim() === '') return 0
    try {
      return Function(`"use strict"; return (${cleaned})`)() as number
    } catch {
      return 0
    }
  }

  get variableCount(): number { return this.variables.size }
  get functionCount(): number { return this.functions.size }

  clearVariables(): void { this.variables.clear() }
  clearFunctions(): void { this.functions.clear() }

  toArray(): string[] { return [...this.variables.keys()] }
  toString(): string { return JSON.stringify({ variables: [...this.variables.keys()] }) }
  toJSON(): Record<string, number> { return { variables: this.variables.size, functions: this.functions.size } }
  clone(): FormulaEngine2 {
    const c = new FormulaEngine2()
    for (const [k, v] of this.variables) c.setVariable(k, v)
    return c
  }
  equals(other: unknown): boolean { return other instanceof FormulaEngine2 }
}
