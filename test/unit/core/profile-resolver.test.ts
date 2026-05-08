import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import type { RuleProfile } from '../../../src/core/profile-types'
import {
  mergeRules,
  resolveEffectiveRules,
  PROFILE_RESOLUTION_DEPTH_LIMIT,
} from '../../../src/core/profile-resolver'

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

async function writeProfile(profile: RuleProfile, dir?: string): Promise<void> {
  const target = dir ?? tmpDir
  await fs.mkdir(target, { recursive: true })
  await fs.writeFile(
    path.join(target, `${profile.name}.json`),
    JSON.stringify(profile),
    'utf-8',
  )
}

describe('resolveEffectiveRules', () => {
  test('with no profile and no rules returns empty', async () => {
    const result = await resolveEffectiveRules({})
    expect(result).toEqual({})
  })

  test('with profile loads profile rules', async () => {
    await writeProfile(makeProfile())
    const result = await resolveEffectiveRules({
      profile: 'test-profile',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
  })

  test('with rules only returns those rules', async () => {
    const result = await resolveEffectiveRules({
      rules: { 'no-console': 'warning' },
    })
    expect(result).toEqual({ 'no-console': 'warning' })
  })

  test('with profile + rules merges correctly', async () => {
    await writeProfile(makeProfile())
    const result = await resolveEffectiveRules({
      profile: 'test-profile',
      rules: { 'no-console': 'warning' },
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
    expect(result['no-console']).toBe('warning')
  })

  test('project rules override profile rules', async () => {
    await writeProfile(makeProfile())
    const result = await resolveEffectiveRules({
      profile: 'test-profile',
      rules: { 'no-eval': 'off' },
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('off')
  })

  test('throws for non-existent profile', async () => {
    await expect(
      resolveEffectiveRules({
        profile: 'non-existent',
        profilesDir: tmpDir,
      }),
    ).rejects.toThrow('Profile "non-existent" not found')
  })

  test('resolves extends chain (3 levels)', async () => {
    await writeProfile(
      makeProfile({
        name: 'grandparent',
        rules: { 'no-eval': 'warning', 'no-console': 'info' },
      }),
    )
    await writeProfile(
      makeProfile({
        name: 'parent',
        extends: ['grandparent'],
        rules: { 'no-eval': 'error' },
      }),
    )
    await writeProfile(
      makeProfile({
        name: 'child',
        extends: ['parent'],
        rules: { 'no-debugger': 'error' },
      }),
    )
    const result = await resolveEffectiveRules({
      profile: 'child',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
    expect(result['no-console']).toBe('info')
    expect(result['no-debugger']).toBe('error')
  })

  test('detects circular extends', async () => {
    await writeProfile(
      makeProfile({
        name: 'profile-a',
        extends: ['profile-b'],
        rules: { 'no-eval': 'error' },
      }),
    )
    await writeProfile(
      makeProfile({
        name: 'profile-b',
        extends: ['profile-a'],
        rules: { 'no-console': 'warning' },
      }),
    )
    await expect(
      resolveEffectiveRules({
        profile: 'profile-a',
        profilesDir: tmpDir,
      }),
    ).rejects.toThrow('Circular profile dependency detected')
  })

  test('stops at depth limit', async () => {
    for (let i = 0; i < PROFILE_RESOLUTION_DEPTH_LIMIT + 1; i++) {
      await writeProfile(
        makeProfile({
          name: `depth-${i}`,
          extends: i > 0 ? [`depth-${i - 1}`] : undefined,
          rules: { [`rule-${i}`]: 'error' },
        }),
      )
    }
    await expect(
      resolveEffectiveRules({
        profile: `depth-${PROFILE_RESOLUTION_DEPTH_LIMIT}`,
        profilesDir: tmpDir,
      }),
    ).rejects.toThrow('depth limit')
  })

  test('strict profile resolves correctly', async () => {
    const result = await resolveEffectiveRules({
      profile: 'strict',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
    expect(result['max-complexity']).toEqual(['error', { max: 10 }])
    expect(result['no-console']).toBe('warning')
  })

  test('moderate profile resolves correctly', async () => {
    const result = await resolveEffectiveRules({
      profile: 'moderate',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
    expect(result['max-complexity']).toEqual(['warning', { max: 15 }])
    expect(result['no-console']).toBe('info')
  })

  test('lenient profile resolves correctly', async () => {
    const result = await resolveEffectiveRules({
      profile: 'lenient',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('warning')
    expect(result['no-hardcoded-credentials']).toBe('warning')
  })

  test('extends with built-in profile', async () => {
    await writeProfile(
      makeProfile({
        name: 'extends-strict',
        extends: ['strict'],
        rules: { 'custom-rule': 'error' },
      }),
    )
    const result = await resolveEffectiveRules({
      profile: 'extends-strict',
      profilesDir: tmpDir,
    })
    expect(result['no-eval']).toBe('error')
    expect(result['custom-rule']).toBe('error')
  })

  test('multiple extends merges all parents', async () => {
    await writeProfile(
      makeProfile({ name: 'parent-a', rules: { 'rule-a': 'error' } }),
    )
    await writeProfile(
      makeProfile({ name: 'parent-b', rules: { 'rule-b': 'warning' } }),
    )
    await writeProfile(
      makeProfile({
        name: 'multi-child',
        extends: ['parent-a', 'parent-b'],
        rules: {},
      }),
    )
    const result = await resolveEffectiveRules({
      profile: 'multi-child',
      profilesDir: tmpDir,
    })
    expect(result['rule-a']).toBe('error')
    expect(result['rule-b']).toBe('warning')
  })
})

describe('mergeRules', () => {
  test('with empty base returns override', () => {
    const result = mergeRules({}, { 'no-eval': 'error' })
    expect(result).toEqual({ 'no-eval': 'error' })
  })

  test('with empty override returns base', () => {
    const result = mergeRules({ 'no-eval': 'error' }, {})
    expect(result).toEqual({ 'no-eval': 'error' })
  })

  test('string overrides string', () => {
    const result = mergeRules(
      { 'no-eval': 'warning' },
      { 'no-eval': 'error' },
    )
    expect(result['no-eval']).toBe('error')
  })

  test('tuple overrides string', () => {
    const result = mergeRules(
      { 'no-eval': 'warning' } as Record<string, unknown>,
      { 'no-eval': ['error', { max: 5 }] },
    )
    expect(result['no-eval']).toEqual(['error', { max: 5 }])
  })

  test('string overridden by tuple', () => {
    const result = mergeRules(
      { 'max-complexity': ['warning', { max: 20 }] },
      { 'max-complexity': 'error' },
    )
    expect(result['max-complexity']).toBe('error')
  })

  test('tuple + tuple merges options', () => {
    const result = mergeRules(
      { 'max-complexity': ['warning', { max: 20, strict: true }] },
      { 'max-complexity': ['error', { max: 10 }] },
    )
    expect(result['max-complexity']).toEqual(['error', { max: 10, strict: true }])
  })

  test('tuple + tuple override wins on conflict', () => {
    const result = mergeRules(
      { rule: ['warning', { max: 20 }] },
      { rule: ['error', { max: 10 }] },
    )
    expect(result['rule']).toEqual(['error', { max: 10 }])
  })

  test('does not mutate base', () => {
    const base = { 'no-eval': 'warning' }
    const override = { 'no-eval': 'error' }
    mergeRules(base, override)
    expect(base['no-eval']).toBe('warning')
  })

  test('does not mutate override', () => {
    const base = { 'no-eval': 'warning' }
    const override = { 'no-eval': 'error' }
    mergeRules(base, override)
    expect(override['no-eval']).toBe('error')
  })

  test('merges multiple keys', () => {
    const result = mergeRules(
      { a: 'warning', b: 'error' },
      { b: 'info', c: 'error' },
    )
    expect(result).toEqual({ a: 'warning', b: 'info', c: 'error' })
  })

  test('tuple without options + tuple without options', () => {
    const result = mergeRules(
      { rule: ['warning'] },
      { rule: ['error'] },
    )
    expect(result['rule']).toEqual(['error'])
  })

  test('tuple with options + tuple without options', () => {
    const result = mergeRules(
      { rule: ['warning', { max: 10 }] },
      { rule: ['error'] },
    )
    expect(result['rule']).toEqual(['error'])
  })
})

describe('PROFILE_RESOLUTION_DEPTH_LIMIT', () => {
  test('is 10', () => {
    expect(PROFILE_RESOLUTION_DEPTH_LIMIT).toBe(10)
  })
})
