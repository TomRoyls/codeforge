export type ValidationRule2 = (value: unknown) => boolean | string

export interface FieldRule2 {
  name: string
  rules: ValidationRule2[]
  required?: boolean
}

export interface ValidationResult2 {
  valid: boolean
  errors: Record<string, string[]>
}

export class FormValidator2 {
  private fields: Map<string, FieldRule2> = new Map()
  private customMessages: Map<string, string> = new Map()

  static required(): ValidationRule2 {
    return (v) => v !== null && v !== undefined && v !== '' || 'This field is required'
  }

  static minLen(n: number): ValidationRule2 {
    return (v) => typeof v === 'string' && v.length >= n || `Must be at least ${n} characters`
  }

  static maxLen(n: number): ValidationRule2 {
    return (v) => typeof v === 'string' && v.length <= n || `Must be at most ${n} characters`
  }

  static min(n: number): ValidationRule2 {
    return (v) => typeof v === 'number' && v >= n || `Must be at least ${n}`
  }

  static max(n: number): ValidationRule2 {
    return (v) => typeof v === 'number' && v <= n || `Must be at most ${n}`
  }

  static email(): ValidationRule2 {
    return (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email'
  }

  static pattern(regex: RegExp): ValidationRule2 {
    return (v) => typeof v === 'string' && regex.test(v) || 'Invalid format'
  }

  static oneOf(values: unknown[]): ValidationRule2 {
    return (v) => values.includes(v) || `Must be one of: ${values.join(', ')}`
  }

  static isString(): ValidationRule2 {
    return (v) => typeof v === 'string' || 'Must be a string'
  }

  static isNumber(): ValidationRule2 {
    return (v) => typeof v === 'number' && !isNaN(v) || 'Must be a number'
  }

  static isBoolean(): ValidationRule2 {
    return (v) => typeof v === 'boolean' || 'Must be a boolean'
  }

  static isArrayOf(itemRule: ValidationRule2): ValidationRule2 {
    return (v) => {
      if (!Array.isArray(v)) return 'Must be an array'
      for (let i = 0; i < v.length; i++) {
        const result = itemRule(v[i])
        if (result !== true) return `Item ${i}: ${result}`
      }
      return true
    }
  }

  addField(name: string, rules: ValidationRule2[], required = false): this {
    this.fields.set(name, { name, rules, required })
    return this
  }

  setMessage(field: string, ruleIndex: number, message: string): this {
    this.customMessages.set(`${field}:${ruleIndex}`, message)
    return this
  }

  validate(data: Record<string, unknown>): ValidationResult2 {
    const errors: Record<string, string[]> = {}
    let valid = true

    for (const [name, field] of this.fields) {
      const value = data[name]
      if (value === undefined || value === null) {
        if (field.required) {
          errors[name] = ['This field is required']
          valid = false
        }
        continue
      }

      const fieldErrors: string[] = []
      for (let i = 0; i < field.rules.length; i++) {
        const result = field.rules[i](value)
        if (result !== true) {
          const msg = this.customMessages.get(`${name}:${i}`) ?? (typeof result === 'string' ? result : 'Invalid')
          fieldErrors.push(msg)
        }
      }

      if (fieldErrors.length > 0) {
        errors[name] = fieldErrors
        valid = false
      }
    }

    return { valid, errors }
  }

  validateField(name: string, value: unknown): string[] {
    const field = this.fields.get(name)
    if (!field) return []
    const errors: string[] = []
    for (const rule of field.rules) {
      const result = rule(value)
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : 'Invalid')
      }
    }
    return errors
  }

  getFieldNames(): string[] {
    return Array.from(this.fields.keys())
  }

  hasField(name: string): boolean {
    return this.fields.has(name)
  }

  removeField(name: string): boolean {
    return this.fields.delete(name)
  }

  count(): number { return this.fields.size }

  toArray(): string[] { return this.getFieldNames() }
  toString(): string { return JSON.stringify({ fields: this.count() }) }
  toJSON(): Record<string, unknown> { return { fields: this.getFieldNames() } }
  clone(): FormValidator2 {
    const v = new FormValidator2()
    this.fields.forEach((f, name) => v.addField(name, f.rules, f.required))
    return v
  }
  equals(other: unknown): boolean {
    if (!(other instanceof FormValidator2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.fields.clear(); this.customMessages.clear() }
}
