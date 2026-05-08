import type {
  ValidationIssue,
  ValidationResult,
  SchemaProperty,
} from './types.js'

const KNOWN_RULES: Record<string, SchemaProperty> = {
  'no-circular-deps': {
    type: 'object',
    description: 'Disallow circular dependencies',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'error',
      },
      ignoreExternal: {
        type: 'boolean',
        default: false,
      },
    },
  },
  'max-params': {
    type: 'object',
    description: 'Enforce maximum number of function parameters',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      max: {
        type: 'number',
        minimum: 0,
        default: 4,
      },
    },
    required: [],
  },
  'no-console': {
    type: 'object',
    description: 'Disallow console usage',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      allow: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
  'prefer-const': {
    type: 'object',
    description: 'Prefer const over let',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      destructuring: {
        type: 'string',
        enum: ['any', 'all'],
        default: 'any',
      },
    },
  },
  'no-eval': {
    type: 'object',
    description: 'Disallow eval usage',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'error',
      },
      allowIndirect: {
        type: 'boolean',
        default: false,
      },
    },
  },
  'max-complexity': {
    type: 'object',
    description: 'Enforce maximum cyclomatic complexity',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      max: {
        type: 'number',
        minimum: 1,
        default: 10,
      },
    },
  },
  'no-unused-vars': {
    type: 'object',
    description: 'Disallow unused variables',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      vars: {
        type: 'string',
        enum: ['all', 'local'],
        default: 'all',
      },
      args: {
        type: 'string',
        enum: ['after-used', 'all', 'none'],
        default: 'after-used',
      },
    },
  },
  'max-lines': {
    type: 'object',
    description: 'Enforce maximum file length',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      max: {
        type: 'number',
        minimum: 1,
        default: 300,
      },
      skipBlankLines: {
        type: 'boolean',
        default: false,
      },
      skipComments: {
        type: 'boolean',
        default: false,
      },
    },
  },
  'no-var': {
    type: 'object',
    description: 'Disallow var usage',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'error',
      },
    },
  },
  'eqeqeq': {
    type: 'object',
    description: 'Require strict equality',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'error',
      },
      always: {
        type: 'boolean',
        default: true,
      },
    },
  },
  'no-throw-literal': {
    type: 'object',
    description: 'Disallow throwing literals',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'error',
      },
    },
  },
  'curly': {
    type: 'object',
    description: 'Require curly braces for blocks',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      multi: {
        type: 'boolean',
        default: false,
      },
    },
  },
  'no-magic-numbers': {
    type: 'object',
    description: 'Disallow magic numbers',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      ignore: {
        type: 'array',
        items: { type: 'number' },
      },
    },
  },
  'consistent-return': {
    type: 'object',
    description: 'Require consistent return statements',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      treatUndefinedAsUnspecified: {
        type: 'boolean',
        default: false,
      },
    },
  },
  'no-shadow': {
    type: 'object',
    description: 'Disallow variable shadowing',
    properties: {
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'off'],
        default: 'warning',
      },
      hoist: {
        type: 'string',
        enum: ['all', 'functions', 'never'],
        default: 'functions',
      },
    },
  },
}

export class RuleValidator {
  private rules: Map<string, SchemaProperty> = new Map(
    Object.entries(KNOWN_RULES),
  )

  validateRules(rules: Record<string, unknown>): ValidationResult {
    const issues: ValidationIssue[] = []

    for (const [id, config] of Object.entries(rules)) {
      const ruleIssues = this.validateRule(id, config)
      issues.push(...ruleIssues)
    }

    const errors = issues.filter((i) => i.severity === 'error').length
    const warnings = issues.filter((i) => i.severity === 'warning').length

    return { valid: errors === 0, issues, warnings, errors }
  }

  validateRule(id: string, config: unknown): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    if (!this.isKnownRule(id)) {
      issues.push({
        path: `rules.${id}`,
        message: `Unknown rule "${id}"`,
        severity: 'warning',
        suggestion: `Check if "${id}" is a valid rule ID or install the plugin that provides it`,
      })
      return issues
    }

    if (typeof config === 'string') {
      if (!['error', 'warning', 'off'].includes(config)) {
        issues.push({
          path: `rules.${id}`,
          message: `Invalid severity "${config}". Must be "error", "warning", or "off"`,
          severity: 'error',
          value: config,
        })
      }
      return issues
    }

    if (typeof config === 'boolean') {
      return issues
    }

    if (typeof config === 'number') {
      if (config < 0 || config > 2) {
        issues.push({
          path: `rules.${id}`,
          message: `Invalid numeric severity ${config}. Must be 0 (off), 1 (warning), or 2 (error)`,
          severity: 'error',
          value: config,
        })
      }
      return issues
    }

    if (Array.isArray(config)) {
      if (config.length === 0) {
        issues.push({
          path: `rules.${id}`,
          message: 'Rule configuration array must not be empty',
          severity: 'error',
        })
        return issues
      }

      const severity = config[0]
      if (typeof severity === 'string') {
        if (!['error', 'warning', 'off'].includes(severity)) {
          issues.push({
            path: `rules.${id}`,
            message: `Invalid severity "${severity}" in array config`,
            severity: 'error',
            value: severity,
          })
        }
      } else if (typeof severity === 'number') {
        if (severity < 0 || severity > 2) {
          issues.push({
            path: `rules.${id}`,
            message: `Invalid numeric severity ${severity} in array config`,
            severity: 'error',
            value: severity,
          })
        }
      }

      if (config.length > 1 && typeof config[1] === 'object' && config[1] !== null) {
        const ruleSchema = this.getRuleSchema(id)
        if (ruleSchema && ruleSchema.properties) {
          const options = config[1] as Record<string, unknown>
          for (const [optKey, optValue] of Object.entries(options)) {
            const optSchema = ruleSchema.properties[optKey]
            if (!optSchema) {
              issues.push({
                path: `rules.${id}[1].${optKey}`,
                message: `Unknown option "${optKey}" for rule "${id}"`,
                severity: 'warning',
                value: optValue,
              })
            } else if (optSchema.type !== this.getType(optValue)) {
              const actualType = this.getType(optValue)
              if (!(actualType === 'integer' && optSchema.type === 'number')) {
                issues.push({
                  path: `rules.${id}[1].${optKey}`,
                  message: `Expected type "${optSchema.type}" but got "${actualType}"`,
                  severity: 'error',
                  value: optValue,
                })
              }
            }
          }
        }
      }

      return issues
    }

    if (typeof config === 'object' && config !== null) {
      const ruleSchema = this.getRuleSchema(id)
      if (ruleSchema && ruleSchema.properties) {
        const objConfig = config as Record<string, unknown>
        for (const [optKey, optValue] of Object.entries(objConfig)) {
          const optSchema = ruleSchema.properties[optKey]
          if (!optSchema) {
            issues.push({
              path: `rules.${id}.${optKey}`,
              message: `Unknown option "${optKey}" for rule "${id}"`,
              severity: 'warning',
              value: optValue,
            })
          } else {
            const actualType = this.getType(optValue)
            if (optSchema.enum && typeof optValue === 'string') {
              if (!optSchema.enum.includes(optValue)) {
                issues.push({
                  path: `rules.${id}.${optKey}`,
                  message: `Invalid value "${optValue}" for option "${optKey}". Allowed: ${optSchema.enum.join(', ')}`,
                  severity: 'error',
                  value: optValue,
                })
                continue
              }
            }
            if (optSchema.type !== actualType) {
              if (!(actualType === 'integer' && optSchema.type === 'number')) {
                issues.push({
                  path: `rules.${id}.${optKey}`,
                  message: `Expected type "${optSchema.type}" but got "${actualType}"`,
                  severity: 'error',
                  value: optValue,
                })
                continue
              }
            }
            if (optSchema.minimum !== undefined && typeof optValue === 'number') {
              if (optValue < optSchema.minimum) {
                issues.push({
                  path: `rules.${id}.${optKey}`,
                  message: `Value ${optValue} for "${optKey}" is less than minimum ${optSchema.minimum}`,
                  severity: 'error',
                  value: optValue,
                })
              }
            }
          }
        }
      }
      return issues
    }

    issues.push({
      path: `rules.${id}`,
      message: `Invalid configuration type for rule "${id}"`,
      severity: 'error',
      value: config,
    })

    return issues
  }

  getKnownRules(): string[] {
    return Array.from(this.rules.keys()).sort()
  }

  isKnownRule(id: string): boolean {
    return this.rules.has(id)
  }

  getRuleSchema(id: string): SchemaProperty | null {
    return this.rules.get(id) ?? null
  }

  private getType(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'number' && Number.isInteger(value)) return 'integer'
    return typeof value
  }
}
