import { describe, expect, it } from 'vitest'

import { validateProfile, ProfileManager } from '../../src/core/profile-manager.js'

// ─── Helpers ───

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    name: 'test-profile',
    description: 'A test profile',
    version: '1.0.0',
    rules: { 'no-eval': 'error' },
    createdBy: 'test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// ─── validateProfile ───

describe('validateProfile', () => {
  it('accepts a valid profile', () => {
    const result = validateProfile(makeProfile())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects null', () => {
    const result = validateProfile(null)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Profile must be an object')
  })

  it('rejects undefined', () => {
    const result = validateProfile(undefined)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Profile must be an object')
  })

  it('rejects arrays', () => {
    const result = validateProfile([])
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Profile must be an object')
  })

  it('rejects non-string name', () => {
    const result = validateProfile(makeProfile({ name: 42 }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('name'))).toBe(true)
  })

  it('rejects empty name', () => {
    const result = validateProfile(makeProfile({ name: '' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('name'))).toBe(true)
  })

  it('rejects name with special characters', () => {
    const result = validateProfile(makeProfile({ name: 'bad profile!' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('alphanumeric'))).toBe(true)
  })

  it('rejects name longer than 50 characters', () => {
    const result = validateProfile(makeProfile({ name: 'a'.repeat(51) }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('alphanumeric'))).toBe(true)
  })

  it('accepts hyphenated name', () => {
    const result = validateProfile(makeProfile({ name: 'my-cool-profile' }))
    expect(result.valid).toBe(true)
  })

  it('rejects empty description', () => {
    const result = validateProfile(makeProfile({ description: '' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('description'))).toBe(true)
  })

  it('rejects non-semver version', () => {
    const result = validateProfile(makeProfile({ version: '1.0' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('semver'))).toBe(true)
  })

  it('accepts valid semver version', () => {
    const result = validateProfile(makeProfile({ version: '2.3.14' }))
    expect(result.valid).toBe(true)
  })

  it('rejects empty rules object', () => {
    const result = validateProfile(makeProfile({ rules: {} }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('rules'))).toBe(true)
  })

  it('rejects non-object rules', () => {
    const result = validateProfile(makeProfile({ rules: 'error' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('rules'))).toBe(true)
  })

  it('rejects array rules', () => {
    const result = validateProfile(makeProfile({ rules: ['error'] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('rules'))).toBe(true)
  })

  it('accepts valid string severities', () => {
    for (const sev of ['error', 'warning', 'info', 'off']) {
      const result = validateProfile(makeProfile({ rules: { 'no-eval': sev } }))
      expect(result.valid).toBe(true)
    }
  })

  it('rejects invalid string severity', () => {
    const result = validateProfile(makeProfile({ rules: { 'no-eval': 'bad' } }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('invalid severity'))).toBe(true)
  })

  it('accepts tuple severity with options', () => {
    const result = validateProfile(makeProfile({
      rules: { 'max-params': ['error', { max: 4 }] },
    }))
    expect(result.valid).toBe(true)
  })

  it('accepts tuple severity without options', () => {
    const result = validateProfile(makeProfile({
      rules: { 'no-eval': ['error'] },
    }))
    expect(result.valid).toBe(true)
  })

  it('rejects tuple with invalid severity', () => {
    const result = validateProfile(makeProfile({
      rules: { 'no-eval': ['bad'] },
    }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('invalid severity'))).toBe(true)
  })

  it('rejects tuple with non-string first element', () => {
    const result = validateProfile(makeProfile({
      rules: { 'no-eval': [42] },
    }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('tuple'))).toBe(true)
  })

  it('rejects tuple with non-object options', () => {
    const result = validateProfile(makeProfile({
      rules: { 'no-eval': ['error', 'bad'] },
    }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('options'))).toBe(true)
  })

  it('rejects non-string non-array rule value', () => {
    const result = validateProfile(makeProfile({
      rules: { 'no-eval': 42 },
    }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('string severity or'))).toBe(true)
  })

  it('rejects non-array extends', () => {
    const result = validateProfile(makeProfile({ extends: 'bad' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('extends'))).toBe(true)
  })

  it('accepts valid extends array', () => {
    const result = validateProfile(makeProfile({ extends: ['strict'] }))
    expect(result.valid).toBe(true)
  })

  it('rejects empty string in extends', () => {
    const result = validateProfile(makeProfile({ extends: [''] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('extends entry'))).toBe(true)
  })

  it('rejects non-string in extends', () => {
    const result = validateProfile(makeProfile({ extends: [42] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('extends entry'))).toBe(true)
  })

  it('collects multiple errors at once', () => {
    const result = validateProfile({
      name: '',
      description: '',
      version: 'bad',
      rules: null,
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })
})

// ─── ProfileManager ───

describe('ProfileManager', () => {
  it('uses default profiles directory', () => {
    const mgr = new ProfileManager()
    expect(mgr.isBuiltIn('strict')).toBe(true)
  })

  it('accepts custom profiles directory', () => {
    const mgr = new ProfileManager('/tmp/test-profiles')
    expect(mgr.isBuiltIn('strict')).toBe(true)
  })

  it('recognizes built-in profiles', () => {
    const mgr = new ProfileManager()
    expect(mgr.isBuiltIn('strict')).toBe(true)
    expect(mgr.isBuiltIn('moderate')).toBe(true)
    expect(mgr.isBuiltIn('lenient')).toBe(true)
    expect(mgr.isBuiltIn('nonexistent')).toBe(false)
  })

  it('lists built-in profiles', () => {
    const mgr = new ProfileManager()
    const profiles = mgr.getBuiltInProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(3)
    const names = profiles.map((p) => p.name)
    expect(names).toContain('strict')
    expect(names).toContain('moderate')
    expect(names).toContain('lenient')
  })

  it('getBuiltInProfiles returns copies', () => {
    const mgr = new ProfileManager()
    const a = mgr.getBuiltInProfiles()
    const b = mgr.getBuiltInProfiles()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('getProfile returns built-in profile', async () => {
    const mgr = new ProfileManager()
    const profile = await mgr.getProfile('strict')
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('strict')
  })

  it('getProfile returns null for non-existent custom', async () => {
    const mgr = new ProfileManager('/tmp/nonexistent-' + Date.now())
    const profile = await mgr.getProfile('does-not-exist')
    expect(profile).toBeNull()
  })

  it('profileExists returns true for built-in', async () => {
    const mgr = new ProfileManager()
    expect(await mgr.profileExists('strict')).toBe(true)
  })

  it('profileExists returns false for non-existent', async () => {
    const mgr = new ProfileManager('/tmp/nonexistent-' + Date.now())
    expect(await mgr.profileExists('nope')).toBe(false)
  })

  it('saveProfile rejects built-in profile overwrite', async () => {
    const mgr = new ProfileManager()
    const profile = makeProfile({ name: 'strict' })
    await expect(mgr.saveProfile(profile)).rejects.toThrow('Cannot overwrite built-in')
  })

  it('saveProfile rejects invalid profile', async () => {
    const mgr = new ProfileManager('/tmp/test-profiles-' + Date.now())
    const profile = makeProfile({ name: '' })
    await expect(mgr.saveProfile(profile as any)).rejects.toThrow('Invalid profile')
  })

  it('deleteProfile rejects built-in profile', async () => {
    const mgr = new ProfileManager()
    await expect(mgr.deleteProfile('strict')).rejects.toThrow('Cannot delete built-in')
  })

  it('deleteProfile returns false for non-existent', async () => {
    const mgr = new ProfileManager('/tmp/nonexistent-' + Date.now())
    const result = await mgr.deleteProfile('nope')
    expect(result).toBe(false)
  })

  it('exportProfile throws for non-existent', async () => {
    const mgr = new ProfileManager('/tmp/nonexistent-' + Date.now())
    await expect(mgr.exportProfile('nope')).rejects.toThrow('not found')
  })

  it('exportProfile returns JSON for built-in', async () => {
    const mgr = new ProfileManager()
    const json = await mgr.exportProfile('strict')
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed.name).toBe('strict')
  })

  it('importProfile rejects invalid JSON', async () => {
    const mgr = new ProfileManager('/tmp/test-profiles-' + Date.now())
    await expect(mgr.importProfile('not-json')).rejects.toThrow('Invalid JSON')
  })

  it('importProfile rejects invalid profile JSON', async () => {
    const mgr = new ProfileManager('/tmp/test-profiles-' + Date.now())
    await expect(mgr.importProfile('{"bad": true}')).rejects.toThrow('Invalid profile')
  })

  it('importProfile rejects built-in overwrite', async () => {
    const mgr = new ProfileManager('/tmp/test-profiles-' + Date.now())
    const json = JSON.stringify(makeProfile({ name: 'strict' }))
    await expect(mgr.importProfile(json)).rejects.toThrow('Cannot overwrite built-in')
  })

  it('listProfiles returns built-in when no custom dir', async () => {
    const mgr = new ProfileManager('/tmp/nonexistent-' + Date.now())
    const profiles = await mgr.listProfiles()
    expect(profiles.length).toBeGreaterThanOrEqual(3)
  })

  it('save + get + delete round-trip works', async () => {
    const dir = '/tmp/codeforge-test-profiles-' + Date.now()
    const mgr = new ProfileManager(dir)
    const profile = makeProfile({ name: 'my-custom' })

    await mgr.saveProfile(profile)
    expect(await mgr.profileExists('my-custom')).toBe(true)

    const loaded = await mgr.getProfile('my-custom')
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('my-custom')

    const deleted = await mgr.deleteProfile('my-custom')
    expect(deleted).toBe(true)
    expect(await mgr.profileExists('my-custom')).toBe(false)
  })
})
