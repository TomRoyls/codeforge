import type { RuleOptions, RuleSeverity } from '../rules/types.js'
import type { CodeForgeConfig, CustomReporterConfig } from './types.js'

import { CLIError } from '../utils/errors.js'

const VALID_SEVERITIES: RuleSeverity[] = ['error', 'warning', 'info']

/**
 * Validates a CodeForge configuration object.
 * @param config - The config to validate (unknown type for safety)
 * @returns The validated CodeForgeConfig
 * @throws CLIError.configError if validation fails
 */
export function validateConfig(config: unknown): CodeForgeConfig {
  if (config === null || typeof config !== 'object') {
    throw CLIError.configError('Configuration must be an object', [
      'Ensure your config file exports or contains a valid JSON object',
      'Example: { "rules": { "max-complexity": "error" } }',
    ])
  }

  if (Array.isArray(config)) {
    throw CLIError.configError('Configuration must be an object, not an array', [
      'Wrap your configuration in an object',
      'Example: { "files": ["src/**/*.ts"] } instead of ["src/**/*.ts"]',
    ])
  }

  const cfg = config as Record<string, unknown>
  const result: CodeForgeConfig = {}

  if ('files' in cfg) {
    result.files = validateFilesArray(cfg.files, 'files')
  }

  if ('ignore' in cfg) {
    result.ignore = validateFilesArray(cfg.ignore, 'ignore')
  }

  if ('plugins' in cfg) {
    result.plugins = validateFilesArray(cfg.plugins, 'plugins')
  }

  if ('reporters' in cfg) {
    result.reporters = validateReporters(cfg.reporters)
  }

  if ('rules' in cfg) {
    result.rules = validateRules(cfg.rules)
  }

  return result
}

/**
 * Validates a files or ignore array.
 */
function validateFilesArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw CLIError.configError(`"${fieldName}" must be an array of strings`, [
      `Example: "${fieldName}": ["src/**/*.ts", "lib/**/*.js"]`,
      'Each pattern should be a glob string',
    ])
  }

  for (const [index, item] of value.entries()) {
    if (typeof item !== 'string') {
      throw CLIError.configError(`"${fieldName}[${index}]" must be a string, got ${typeof item}`, [
        `Remove or fix the invalid item at index ${index}`,
        `Example: "${fieldName}": ["src/**/*.ts"]`,
      ])
    }
  }

  return value as string[]
}

/**
 * Validates the rules configuration.
 */
function validateRules(value: unknown): Record<string, [RuleSeverity, RuleOptions] | RuleSeverity> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw CLIError.configError(
      '"rules" must be an object mapping rule names to their configuration',
      [
        'Example: "rules": { "max-complexity": "error" }',
        'Or with options: "rules": { "max-complexity": ["error", { "max": 10 }] }',
      ],
    )
  }

  const rules = value as Record<string, unknown>
  const result: Record<string, [RuleSeverity, RuleOptions] | RuleSeverity> = {}

  for (const [ruleName, ruleConfig] of Object.entries(rules)) {
    result[ruleName] = validateRuleConfig(ruleName, ruleConfig)
  }

  return result
}

/**
 * Validates a single rule configuration.
 */
function validateRuleConfig(
  ruleName: string,
  config: unknown,
): [RuleSeverity, RuleOptions] | RuleSeverity {
  if (typeof config === 'string') {
    validateSeverity(config, ruleName)
    return config as RuleSeverity
  }

  if (Array.isArray(config)) {
    if (config.length === 0 || config.length > 2) {
      throw CLIError.configError(
        `Rule "${ruleName}" configuration array must have 1-2 elements [severity, options?]`,
        [`Example: "${ruleName}": "error"`, `Or: "${ruleName}": ["error", { "max": 10 }]`],
      )
    }

    const [severity, options] = config

    if (typeof severity !== 'string') {
      throw CLIError.configError(
        `Rule "${ruleName}" severity must be a string, got ${typeof severity}`,
        [
          `Valid severities: ${VALID_SEVERITIES.join(', ')}`,
          `Example: "${ruleName}": ["error", { "max": 10 }]`,
        ],
      )
    }

    validateSeverity(severity, ruleName)

    if (
      options !== undefined &&
      (typeof options !== 'object' || options === null || Array.isArray(options))
    ) {
      throw CLIError.configError(
        `Rule "${ruleName}" options must be an object, got ${Array.isArray(options) ? 'array' : typeof options}`,
        [
          `Example: "${ruleName}": ["error", { "max": 10 }]`,
          'Options should be a key-value object',
        ],
      )
    }

    return config as [RuleSeverity, RuleOptions]
  }

  throw CLIError.configError(
    `Rule "${ruleName}" configuration must be a string or array, got ${typeof config}`,
    [
      `Use a severity string: "${ruleName}": "error"`,
      `Or an array with options: "${ruleName}": ["error", { "max": 10 }]`,
      `Valid severities: ${VALID_SEVERITIES.join(', ')}`,
    ],
  )
}

/**
 * Validates a severity string.
 */
function validateSeverity(severity: string, ruleName: string): void {
  if (!VALID_SEVERITIES.includes(severity as RuleSeverity)) {
    throw CLIError.configError(`Invalid severity "${severity}" for rule "${ruleName}"`, [
      `Valid severities are: ${VALID_SEVERITIES.join(', ')}`,
      `Example: "${ruleName}": "error"`,
    ])
  }
}

function validateReporters(value: unknown): CustomReporterConfig[] {
  if (!Array.isArray(value)) {
    throw CLIError.configError('"reporters" must be an array of reporter configurations', [
      'Example: "reporters": [{ "name": "slack", "path": "./reporters/slack.js" }]',
    ])
  }

  return value.map((entry, index) => validateReporterEntry(entry, index))
}

function validateReporterEntry(entry: unknown, index: number): CustomReporterConfig {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw CLIError.configError(`"reporters[${index}]" must be an object`, [
      `Example: { "name": "custom", "path": "./my-reporter.js" }`,
    ])
  }

  const obj = entry as Record<string, unknown>

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    throw CLIError.configError(`"reporters[${index}].name" must be a non-empty string`, [
      'The name is used with --format to select this reporter',
    ])
  }

  if (typeof obj.path !== 'string' || obj.path.length === 0) {
    throw CLIError.configError(`"reporters[${index}].path" must be a non-empty string`, [
      'Provide a module path relative to the project root or an absolute path',
    ])
  }

  if (obj.options !== undefined && (typeof obj.options !== 'object' || obj.options === null || Array.isArray(obj.options))) {
    throw CLIError.configError(`"reporters[${index}].options" must be an object`, [
      'Example: { "webhookUrl": "https://..." }',
    ])
  }

  return {
    name: obj.name,
    options: obj.options as Record<string, unknown> | undefined,
    path: obj.path,
  }
}
