import type { ProfileValidationResult, RuleProfile } from './profile-types.js'

import { BUILTIN_PROFILES } from './profile-types.js'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

const VALID_SEVERITIES = new Set(['error', 'warning', 'info', 'off'])
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/
const NAME_PATTERN = /^[a-zA-Z0-9-]{1,50}$/

export function validateProfile(profile: unknown): ProfileValidationResult {
  const errors: string[] = []

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return { valid: false, errors: ['Profile must be an object'] }
  }

  const p = profile as Record<string, unknown>

  if (typeof p.name !== 'string' || p.name.length === 0) {
    errors.push('Profile name must be a non-empty string')
  } else if (!NAME_PATTERN.test(p.name)) {
    errors.push(
      'Profile name must be alphanumeric with hyphens only, 1-50 characters',
    )
  }

  if (typeof p.description !== 'string' || p.description.length === 0) {
    errors.push('Profile description must be a non-empty string')
  }

  if (typeof p.version !== 'string' || !SEMVER_PATTERN.test(p.version)) {
    errors.push('Profile version must match semver format (x.y.z)')
  }

  if (
    !p.rules ||
    typeof p.rules !== 'object' ||
    Array.isArray(p.rules) ||
    Object.keys(p.rules as Record<string, unknown>).length === 0
  ) {
    errors.push('Profile rules must be a non-empty object')
  } else {
    const rules = p.rules as Record<string, unknown>
    for (const [key, value] of Object.entries(rules)) {
      if (typeof value === 'string') {
        if (!VALID_SEVERITIES.has(value)) {
          errors.push(
            `Rule "${key}" has invalid severity "${value}"; must be "error", "warning", "info", or "off"`,
          )
        }
      } else if (Array.isArray(value)) {
        if (
          value.length < 1 ||
          typeof value[0] !== 'string'
        ) {
          errors.push(
            `Rule "${key}" must be a [severity, options?] tuple with string severity`,
          )
        } else if (!VALID_SEVERITIES.has(value[0] as string)) {
          errors.push(
            `Rule "${key}" has invalid severity "${value[0] as string}"; must be "error", "warning", "info", or "off"`,
          )
        }
        if (
          value.length === 2 &&
          (typeof value[1] !== 'object' || value[1] === null || Array.isArray(value[1]))
        ) {
          errors.push(`Rule "${key}" options must be an object`)
        }
      } else {
        errors.push(
          `Rule "${key}" must be a string severity or [severity, options?] tuple`,
        )
      }
    }
  }

  if (p.extends !== undefined) {
    if (!Array.isArray(p.extends)) {
      errors.push('Profile extends must be an array')
    } else {
      for (const ext of p.extends) {
        if (typeof ext !== 'string' || ext.length === 0) {
          errors.push('Each extends entry must be a non-empty string')
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export class ProfileManager {
  private profilesDir: string

  constructor(profilesDir?: string) {
    this.profilesDir = profilesDir ?? '.codeforge/profiles'
  }

  async listProfiles(): Promise<RuleProfile[]> {
    const builtIn = this.getBuiltInProfiles()
    const custom = await this.listCustomProfiles()
    const customNames = new Set(custom.map((p) => p.name))
    return [...builtIn.filter((p) => !customNames.has(p.name)), ...custom]
  }

  async getProfile(name: string): Promise<RuleProfile | null> {
    const builtIn = BUILTIN_PROFILES.find((p) => p.name === name)
    if (builtIn) return builtIn
    return this.loadCustomProfile(name)
  }

  async saveProfile(profile: RuleProfile): Promise<void> {
    if (this.isBuiltIn(profile.name)) {
      throw new Error(`Cannot overwrite built-in profile "${profile.name}"`)
    }
    const result = validateProfile(profile)
    if (!result.valid) {
      throw new Error(`Invalid profile: ${result.errors.join('; ')}`)
    }
    await fs.mkdir(this.profilesDir, { recursive: true })
    const filePath = path.join(this.profilesDir, `${profile.name}.json`)
    const tmpPath = path.join(
      os.tmpdir(),
      `codeforge-profile-${profile.name}-${Date.now()}.json`,
    )
    const data = JSON.stringify(profile, null, 2)
    await fs.writeFile(tmpPath, data, 'utf-8')
    await fs.rename(tmpPath, filePath)
  }

  async deleteProfile(name: string): Promise<boolean> {
    if (this.isBuiltIn(name)) {
      throw new Error(`Cannot delete built-in profile "${name}"`)
    }
    const filePath = path.join(this.profilesDir, `${name}.json`)
    try {
      await fs.unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  async exportProfile(name: string): Promise<string> {
    const profile = await this.getProfile(name)
    if (!profile) {
      throw new Error(`Profile "${name}" not found`)
    }
    return JSON.stringify(profile, null, 2)
  }

  async importProfile(json: string): Promise<RuleProfile> {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('Invalid JSON')
    }
    const result = validateProfile(parsed)
    if (!result.valid) {
      throw new Error(`Invalid profile: ${result.errors.join('; ')}`)
    }
    const profile = parsed as RuleProfile
    await this.saveProfile(profile)
    return profile
  }

  async profileExists(name: string): Promise<boolean> {
    if (this.isBuiltIn(name)) return true
    try {
      await fs.access(path.join(this.profilesDir, `${name}.json`))
      return true
    } catch {
      return false
    }
  }

  isBuiltIn(name: string): boolean {
    return BUILTIN_PROFILES.some((p) => p.name === name)
  }

  getBuiltInProfiles(): RuleProfile[] {
    return [...BUILTIN_PROFILES]
  }

  private async listCustomProfiles(): Promise<RuleProfile[]> {
    try {
      const entries = await fs.readdir(this.profilesDir)
      const profiles: RuleProfile[] = []
      for (const entry of entries) {
        if (entry.endsWith('.json')) {
          const filePath = path.join(this.profilesDir, entry)
          const data = await fs.readFile(filePath, 'utf-8')
          profiles.push(JSON.parse(data) as RuleProfile)
        }
      }
      return profiles
    } catch {
      return []
    }
  }

  private async loadCustomProfile(name: string): Promise<RuleProfile | null> {
    try {
      const filePath = path.join(this.profilesDir, `${name}.json`)
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data) as RuleProfile
    } catch {
      return null
    }
  }
}
