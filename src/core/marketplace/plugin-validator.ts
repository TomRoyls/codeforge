import type {
  MarketplacePlugin,
  PluginValidationResult,
} from './types.js'

const NAME_REGEX = /^(@[a-z0-9][a-z0-9-]*[a-z0-9]\/)?[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/

const MIN_PLUGIN_NAME_LENGTH = 2
const MAX_PLUGIN_NAME_LENGTH = 100
const MIN_DESCRIPTION_LENGTH = 20

export class PluginValidator {
  validate(plugin: Partial<MarketplacePlugin>): PluginValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const missingFields = this.validateRequiredFields(plugin)
    for (const field of missingFields) {
      errors.push(`Missing required field: ${field}`)
    }

    if (plugin.name !== undefined && !this.validateName(plugin.name)) {
      errors.push('Invalid plugin name format')
    }

    if (plugin.version !== undefined && !this.validateVersion(plugin.version)) {
      errors.push('Invalid version format (must be semver)')
    }

    if (errors.length === 0 && plugin.name !== undefined) {
      const issues = this.checkCommonIssues(plugin as MarketplacePlugin)
      for (const issue of issues) {
        warnings.push(issue)
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  validateName(name: string): boolean {
    if (name.length < MIN_PLUGIN_NAME_LENGTH || name.length > MAX_PLUGIN_NAME_LENGTH) return false
    return NAME_REGEX.test(name)
  }

  validateVersion(version: string): boolean {
    return SEMVER_REGEX.test(version)
  }

  validateRequiredFields(plugin: Partial<MarketplacePlugin>): string[] {
    const required: (keyof MarketplacePlugin)[] = [
      'name',
      'displayName',
      'description',
      'version',
      'author',
      'license',
      'category',
    ]
    const missing: string[] = []
    for (const field of required) {
      if (
        plugin[field] === undefined ||
        plugin[field] === null ||
        plugin[field] === ''
      ) {
        missing.push(field)
      }
    }
    return missing
  }

  checkCommonIssues(plugin: Partial<MarketplacePlugin>): string[] {
    const issues: string[] = []

    if (plugin.description !== undefined && plugin.description.length < MIN_DESCRIPTION_LENGTH) {
      issues.push(`Description is too short (less than ${MIN_DESCRIPTION_LENGTH} characters)`)
    }

    if (plugin.tags !== undefined && plugin.tags.length === 0) {
      issues.push('No tags provided')
    }

    if (plugin.keywords !== undefined && plugin.keywords.length === 0) {
      issues.push('No keywords provided')
    }

    if (plugin.rating !== undefined && (plugin.rating < 0 || plugin.rating > 5)) {
      issues.push('Rating is out of valid range (0-5)')
    }

    return issues
  }

  checkCompatibility(
    plugin: MarketplacePlugin,
    codeforgeVersion: string,
  ): boolean {
    const pluginVersion = plugin.codeforgeVersion
    if (!pluginVersion) return true

    const parseSimple = (v: string): number[] => {
      const parts = v.replace(/[^0-9.]/g, '').split('.')
      return parts.map((p) => Number.parseInt(p, 10) || 0)
    }

    const required = parseSimple(pluginVersion)
    const actual = parseSimple(codeforgeVersion)

    for (let i = 0; i < Math.max(required.length, actual.length); i++) {
      const r = required[i] ?? 0
      const a = actual[i] ?? 0
      if (a > r) return true
      if (a < r) return false
    }

    return true
  }
}
