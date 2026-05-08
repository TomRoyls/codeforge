import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import {
  ProfileManager,
  validateProfile,
} from '../../../src/core/profile-manager'
import { BUILTIN_PROFILES } from '../../../src/core/profile-types'
import type { RuleProfile } from '../../../src/core/profile-types'

let tmpDir: string

function makeProfile(overrides: Partial<RuleProfile> = {}): RuleProfile {
  return {
    name: 'test-profile',
    description: 'A test profile',
    version: '1.0.0',
    rules: { 'no-eval': 'error' },
    createdBy: 'test',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-profile-'))
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
})

describe('ProfileManager', () => {
  test('listProfiles includes built-in profiles', async () => {
    const mgr = new ProfileManager(tmpDir)
    const profiles = await mgr.listProfiles()
    const names = profiles.map((p) => p.name)
    expect(names).toContain('strict')
    expect(names).toContain('moderate')
    expect(names).toContain('lenient')
  })

  test('getProfile returns built-in by name', async () => {
    const mgr = new ProfileManager(tmpDir)
    const strict = await mgr.getProfile('strict')
    expect(strict).not.toBeNull()
    expect(strict!.name).toBe('strict')
  })

  test('getProfile returns null for non-existent', async () => {
    const mgr = new ProfileManager(tmpDir)
    const result = await mgr.getProfile('does-not-exist')
    expect(result).toBeNull()
  })

  test('saveProfile validates before saving', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(
      mgr.saveProfile(makeProfile({ name: '' })),
    ).rejects.toThrow('Invalid profile')
  })

  test('saveProfile rejects built-in name', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(
      mgr.saveProfile(makeProfile({ name: 'strict' })),
    ).rejects.toThrow('Cannot overwrite built-in profile')
  })

  test('saveProfile writes to disk', async () => {
    const mgr = new ProfileManager(tmpDir)
    const profile = makeProfile()
    await mgr.saveProfile(profile)
    const loaded = await mgr.getProfile('test-profile')
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('test-profile')
  })

  test('deleteProfile removes custom profile', async () => {
    const mgr = new ProfileManager(tmpDir)
    await mgr.saveProfile(makeProfile())
    const deleted = await mgr.deleteProfile('test-profile')
    expect(deleted).toBe(true)
    expect(await mgr.getProfile('test-profile')).toBeNull()
  })

  test('deleteProfile returns false for non-existent', async () => {
    const mgr = new ProfileManager(tmpDir)
    const deleted = await mgr.deleteProfile('non-existent')
    expect(deleted).toBe(false)
  })

  test('deleteProfile rejects built-in', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(mgr.deleteProfile('strict')).rejects.toThrow(
      'Cannot delete built-in profile',
    )
  })

  test('exportProfile returns valid JSON', async () => {
    const mgr = new ProfileManager(tmpDir)
    const exported = await mgr.exportProfile('strict')
    const parsed = JSON.parse(exported)
    expect(parsed.name).toBe('strict')
  })

  test('exportProfile throws for non-existent', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(mgr.exportProfile('non-existent')).rejects.toThrow(
      'Profile "non-existent" not found',
    )
  })

  test('importProfile parses and saves', async () => {
    const mgr = new ProfileManager(tmpDir)
    const json = JSON.stringify(makeProfile({ name: 'imported' }))
    const profile = await mgr.importProfile(json)
    expect(profile.name).toBe('imported')
    const loaded = await mgr.getProfile('imported')
    expect(loaded).not.toBeNull()
  })

  test('importProfile rejects invalid JSON', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(mgr.importProfile('not-json')).rejects.toThrow('Invalid JSON')
  })

  test('importProfile rejects invalid profile data', async () => {
    const mgr = new ProfileManager(tmpDir)
    await expect(mgr.importProfile('{}')).rejects.toThrow('Invalid profile')
  })

  test('profileExists returns true for built-in', async () => {
    const mgr = new ProfileManager(tmpDir)
    expect(await mgr.profileExists('strict')).toBe(true)
  })

  test('profileExists returns false for non-existent', async () => {
    const mgr = new ProfileManager(tmpDir)
    expect(await mgr.profileExists('non-existent')).toBe(false)
  })

  test('profileExists returns true for custom profile', async () => {
    const mgr = new ProfileManager(tmpDir)
    await mgr.saveProfile(makeProfile())
    expect(await mgr.profileExists('test-profile')).toBe(true)
  })

  test('isBuiltIn returns true for all 3 profiles', () => {
    const mgr = new ProfileManager(tmpDir)
    expect(mgr.isBuiltIn('strict')).toBe(true)
    expect(mgr.isBuiltIn('moderate')).toBe(true)
    expect(mgr.isBuiltIn('lenient')).toBe(true)
  })

  test('isBuiltIn returns false for custom', () => {
    const mgr = new ProfileManager(tmpDir)
    expect(mgr.isBuiltIn('custom')).toBe(false)
  })

  test('getBuiltInProfiles returns 3', () => {
    const mgr = new ProfileManager(tmpDir)
    expect(mgr.getBuiltInProfiles()).toHaveLength(3)
  })

  test('listProfiles includes custom profiles', async () => {
    const mgr = new ProfileManager(tmpDir)
    await mgr.saveProfile(makeProfile({ name: 'custom-one' }))
    const profiles = await mgr.listProfiles()
    const names = profiles.map((p) => p.name)
    expect(names).toContain('custom-one')
  })

  test('saveProfile overwrites existing custom profile', async () => {
    const mgr = new ProfileManager(tmpDir)
    await mgr.saveProfile(
      makeProfile({ description: 'first' }),
    )
    await mgr.saveProfile(
      makeProfile({ description: 'second' }),
    )
    const loaded = await mgr.getProfile('test-profile')
    expect(loaded!.description).toBe('second')
  })

  test('getProfile returns custom that shadows built-in', async () => {
    const mgr = new ProfileManager(tmpDir)
    const customStrict = makeProfile({
      name: 'strict',
      description: 'Custom strict override',
    })
    const dir = path.join(tmpDir, 'shadow')
    const mgrShadow = new ProfileManager(dir)
    // Can't saveProfile with built-in name, so manually write it
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(
      path.join(dir, 'strict.json'),
      JSON.stringify(customStrict),
      'utf-8',
    )
    const result = await mgrShadow.getProfile('strict')
    // Built-in takes precedence
    expect(result!.description).toBe(
      'Strict profile: all rules enabled, security and complexity as errors',
    )
  })
})

describe('validateProfile', () => {
  test('valid profile passes validation', () => {
    const result = validateProfile(makeProfile())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('empty name fails', () => {
    const result = validateProfile(makeProfile({ name: '' }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Profile name must be a non-empty string')
  })

  test('name with spaces fails', () => {
    const result = validateProfile(makeProfile({ name: 'has spaces' }))
    expect(result.valid).toBe(false)
  })

  test('name with special chars fails', () => {
    const result = validateProfile(makeProfile({ name: 'bad@name!' }))
    expect(result.valid).toBe(false)
  })

  test('name with underscores fails', () => {
    const result = validateProfile(makeProfile({ name: 'has_underscore' }))
    expect(result.valid).toBe(false)
  })

  test('valid name with hyphens passes', () => {
    const result = validateProfile(makeProfile({ name: 'my-profile-v2' }))
    expect(result.valid).toBe(true)
  })

  test('empty description fails', () => {
    const result = validateProfile(makeProfile({ description: '' }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Profile description must be a non-empty string',
    )
  })

  test('invalid version fails', () => {
    const result = validateProfile(makeProfile({ version: '1.0' }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Profile version must match semver format (x.y.z)',
    )
  })

  test('valid semver passes', () => {
    const result = validateProfile(makeProfile({ version: '2.10.3' }))
    expect(result.valid).toBe(true)
  })

  test('empty rules fails', () => {
    const result = validateProfile(makeProfile({ rules: {} }))
    expect(result.valid).toBe(false)
  })

  test('invalid severity fails', () => {
    const result = validateProfile(
      makeProfile({ rules: { 'no-eval': 'critical' } }),
    )
    expect(result.valid).toBe(false)
  })

  test('valid severity values pass', () => {
    for (const sev of ['error', 'warning', 'info', 'off']) {
      const result = validateProfile(
        makeProfile({ rules: { 'no-eval': sev } }),
      )
      expect(result.valid).toBe(true)
    }
  })

  test('valid tuple rule passes', () => {
    const result = validateProfile(
      makeProfile({
        rules: { 'max-complexity': ['error', { max: 10 }] },
      }),
    )
    expect(result.valid).toBe(true)
  })

  test('tuple without options passes', () => {
    const result = validateProfile(
      makeProfile({ rules: { 'no-eval': ['error'] } }),
    )
    expect(result.valid).toBe(true)
  })

  test('tuple with invalid severity fails', () => {
    const result = validateProfile(
      makeProfile({ rules: { 'no-eval': ['bad', { max: 10 }] } }),
    )
    expect(result.valid).toBe(false)
  })

  test('tuple with non-object options fails', () => {
    const result = validateProfile(
      makeProfile({
        rules: { 'no-eval': ['error', 'not-object' as unknown as Record<string, unknown>] },
      }),
    )
    expect(result.valid).toBe(false)
  })

  test('non-string, non-array rule value fails', () => {
    const result = validateProfile(
      makeProfile({ rules: { 'no-eval': 42 as unknown as 'error' } }),
    )
    expect(result.valid).toBe(false)
  })

  test('null profile fails', () => {
    const result = validateProfile(null)
    expect(result.valid).toBe(false)
  })

  test('array profile fails', () => {
    const result = validateProfile([])
    expect(result.valid).toBe(false)
  })

  test('extends with non-string fails', () => {
    const result = validateProfile(
      makeProfile({ extends: ['valid', 123] as unknown as string[] }),
    )
    expect(result.valid).toBe(false)
  })

  test('extends with empty string fails', () => {
    const result = validateProfile(makeProfile({ extends: [''] }))
    expect(result.valid).toBe(false)
  })

  test('valid extends passes', () => {
    const result = validateProfile(
      makeProfile({ extends: ['strict', 'moderate'] }),
    )
    expect(result.valid).toBe(true)
  })

  test('extends non-array fails', () => {
    const result = validateProfile(
      makeProfile({ extends: 'strict' as unknown as string[] }),
    )
    expect(result.valid).toBe(false)
  })

  test('tuple with too many elements still validates first two', () => {
    const result = validateProfile(
      makeProfile({
        rules: { 'no-eval': ['error', { max: 10 }, 'extra'] as unknown as [string, Record<string, unknown>?] },
      }),
    )
    expect(result.valid).toBe(true)
  })
})

describe('BUILTIN_PROFILES', () => {
  test('has exactly 3 profiles', () => {
    expect(BUILTIN_PROFILES).toHaveLength(3)
  })

  test('strict profile has expected rules', () => {
    const strict = BUILTIN_PROFILES.find((p) => p.name === 'strict')!
    expect(strict.rules['no-eval']).toBe('error')
    expect(strict.rules['max-complexity']).toEqual(['error', { max: 10 }])
  })

  test('moderate profile has expected rules', () => {
    const moderate = BUILTIN_PROFILES.find((p) => p.name === 'moderate')!
    expect(moderate.rules['no-eval']).toBe('error')
    expect(moderate.rules['max-complexity']).toEqual(['warning', { max: 15 }])
  })

  test('lenient profile has expected rules', () => {
    const lenient = BUILTIN_PROFILES.find((p) => p.name === 'lenient')!
    expect(lenient.rules['no-eval']).toBe('warning')
    expect(lenient.rules['no-hardcoded-credentials']).toBe('warning')
  })

  test('all built-in profiles have valid structure', () => {
    for (const profile of BUILTIN_PROFILES) {
      const result = validateProfile(profile)
      expect(result.valid, `Profile ${profile.name} should be valid`).toBe(true)
    }
  })

  test('all built-in profiles have createdBy codeforge', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(profile.createdBy).toBe('codeforge')
    }
  })
})
