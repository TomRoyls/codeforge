import type { RuleProfile } from './profile-types.js'

import { ProfileManager } from './profile-manager.js'

export const PROFILE_RESOLUTION_DEPTH_LIMIT = 10

export function mergeRules(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = result[key]

    if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
      const [, baseOpts] = baseValue as [string, Record<string, unknown>?]
      const [overSev, overOpts] = overrideValue as [string, Record<string, unknown>?]
      if (
        baseOpts &&
        overOpts &&
        typeof baseOpts === 'object' &&
        typeof overOpts === 'object'
      ) {
        result[key] = [overSev, { ...baseOpts, ...overOpts }]
      } else {
        result[key] = overOpts !== undefined ? [overSev, overOpts] : [overSev]
      }
    } else {
      result[key] = overrideValue
    }
  }

  return result
}

export async function resolveEffectiveRules(config: {
  profile?: string
  rules?: Record<string, unknown>
  profilesDir?: string
}): Promise<Record<string, unknown>> {
  const manager = new ProfileManager(config.profilesDir)
  let effective: Record<string, unknown> = {}

  if (config.profile) {
    const resolved = await resolveProfileChain(
      config.profile,
      manager,
      new Set(),
      0,
    )
    effective = resolved
  }

  if (config.rules) {
    effective = mergeRules(effective, config.rules)
  }

  return effective
}

async function resolveProfileChain(
  name: string,
  manager: ProfileManager,
  visited: Set<string>,
  depth: number,
): Promise<Record<string, unknown>> {
  if (depth >= PROFILE_RESOLUTION_DEPTH_LIMIT) {
    throw new Error(
      `Profile resolution depth limit (${PROFILE_RESOLUTION_DEPTH_LIMIT}) exceeded`,
    )
  }

  if (visited.has(name)) {
    throw new Error(`Circular profile dependency detected: "${name}"`)
  }
  visited.add(name)

  const profile: RuleProfile | null = await manager.getProfile(name)
  if (!profile) {
    throw new Error(`Profile "${name}" not found`)
  }

  let rules: Record<string, unknown> = {}

  if (profile.extends && profile.extends.length > 0) {
    for (const parentName of profile.extends) {
      const parentRules = await resolveProfileChain(
        parentName,
        manager,
        new Set(visited),
        depth + 1,
      )
      rules = mergeRules(rules, parentRules)
    }
  }

  rules = mergeRules(rules, profile.rules as Record<string, unknown>)

  return rules
}
