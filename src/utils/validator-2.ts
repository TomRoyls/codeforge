export type ValidationRule = (value: unknown) => boolean | string

export class Validator2 {
  private rules = new Map<string, ValidationRule[]>()

  addRule(field: string, rule: ValidationRule): void {
    if (!this.rules.has(field)) this.rules.set(field, [])
    this.rules.get(field)!.push(rule)
  }

  validate(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    for (const [field, rules] of this.rules) {
      const value = data[field]
      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${field} validation failed`)
        }
      }
    }
    return { valid: errors.length === 0, errors }
  }

  static required(): ValidationRule {
    return (v) => v !== undefined && v !== null && v !== '' || 'Field is required'
  }

  static minLength(min: number): ValidationRule {
    return (v) => typeof v === 'string' && v.length >= min || `Must be at least ${min} characters`
  }

  static maxLength(max: number): ValidationRule {
    return (v) => typeof v === 'string' && v.length <= max || `Must be at most ${max} characters`
  }

  static range(min: number, max: number): ValidationRule {
    return (v) => typeof v === 'number' && v >= min && v <= max || `Must be between ${min} and ${max}`
  }

  static email(): ValidationRule {
    return (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format'
  }

  static pattern(regex: RegExp): ValidationRule {
    return (v) => typeof v === 'string' && regex.test(v) || 'Invalid format'
  }

  static custom(fn: (v: unknown) => boolean, msg: string): ValidationRule {
    return (v) => fn(v) || msg
  }

  get fieldCount(): number { return this.rules.size }
  clear(): void { this.rules.clear() }

  toArray(): string[] { return [...this.rules.keys()] }
  toString(): string { return JSON.stringify({ fields: this.fieldCount }) }
  toJSON(): Record<string, number> { return { fields: this.fieldCount } }
  clone(): Validator2 { return new Validator2() }
  equals(other: unknown): boolean { return other instanceof Validator2 }
}
