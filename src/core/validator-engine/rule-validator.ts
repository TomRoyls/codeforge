import type { ValidationRule } from './types.js'

export class RuleValidator {
  static required(): ValidationRule {
    return {
      name: 'required',
      check: (value: unknown): boolean => value !== null && value !== undefined && value !== '',
      message: 'Value is required',
      severity: 'error',
    }
  }

  static string(): ValidationRule {
    return {
      name: 'string',
      check: (value: unknown): boolean => typeof value === 'string',
      message: 'Value must be a string',
      severity: 'error',
    }
  }

  static number(): ValidationRule {
    return {
      name: 'number',
      check: (value: unknown): boolean => typeof value === 'number' && !Number.isNaN(value),
      message: 'Value must be a number',
      severity: 'error',
    }
  }

  static boolean(): ValidationRule {
    return {
      name: 'boolean',
      check: (value: unknown): boolean => typeof value === 'boolean',
      message: 'Value must be a boolean',
      severity: 'error',
    }
  }

  static minLength(n: number): ValidationRule {
    return {
      name: 'minLength',
      check: (value: unknown): boolean => {
        if (typeof value === 'string') return value.length >= n
        if (Array.isArray(value)) return value.length >= n
        return false
      },
      message: `Value must have minimum length of ${n}`,
      severity: 'error',
    }
  }

  static maxLength(n: number): ValidationRule {
    return {
      name: 'maxLength',
      check: (value: unknown): boolean => {
        if (typeof value === 'string') return value.length <= n
        if (Array.isArray(value)) return value.length <= n
        return false
      },
      message: `Value must have maximum length of ${n}`,
      severity: 'error',
    }
  }

  static min(n: number): ValidationRule {
    return {
      name: 'min',
      check: (value: unknown): boolean => typeof value === 'number' && value >= n,
      message: `Value must be at least ${n}`,
      severity: 'error',
    }
  }

  static max(n: number): ValidationRule {
    return {
      name: 'max',
      check: (value: unknown): boolean => typeof value === 'number' && value <= n,
      message: `Value must be at most ${n}`,
      severity: 'error',
    }
  }

  static pattern(regex: RegExp): ValidationRule {
    return {
      name: 'pattern',
      check: (value: unknown): boolean => typeof value === 'string' && regex.test(value),
      message: `Value does not match pattern ${regex.source}`,
      severity: 'error',
    }
  }

  static enum(values: unknown[]): ValidationRule {
    return {
      name: 'enum',
      check: (value: unknown): boolean => values.includes(value),
      message: `Value must be one of: ${values.map((v) => JSON.stringify(v)).join(', ')}`,
      severity: 'error',
    }
  }

  static email(): ValidationRule {
    return {
      name: 'email',
      check: (value: unknown): boolean => {
        if (typeof value !== 'string') return false
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      message: 'Value must be a valid email address',
      severity: 'error',
    }
  }

  static url(): ValidationRule {
    return {
      name: 'url',
      check: (value: unknown): boolean => {
        if (typeof value !== 'string') return false
        return /^https?:\/\/.+/.test(value)
      },
      message: 'Value must be a valid URL',
      severity: 'error',
    }
  }

  static createRule(
    name: string,
    check: (value: unknown) => boolean,
    message: string,
    severity: 'error' | 'warning' = 'error',
  ): ValidationRule {
    return { name, check, message, severity }
  }
}
