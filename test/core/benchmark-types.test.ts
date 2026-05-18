import { describe, expect, it } from 'vitest'

import { DEFAULT_BENCHMARK_CONFIG } from '../../src/core/benchmark-types.js'
import { BUILTIN_PROFILES } from '../../src/core/profile-types.js'

// ─── benchmark-types: DEFAULT_BENCHMARK_CONFIG ───

describe('DEFAULT_BENCHMARK_CONFIG', () => {
  it('has filePath property', () => {
    expect(DEFAULT_BENCHMARK_CONFIG.filePath).toBe('benchmark-sample.ts')
  })

  it('has default iterations', () => {
    expect(DEFAULT_BENCHMARK_CONFIG.iterations).toBe(10)
  })

  it('has empty rules array by default', () => {
    expect(DEFAULT_BENCHMARK_CONFIG.rules).toEqual([])
  })

  it('has sampleCode as non-empty string', () => {
    expect(typeof DEFAULT_BENCHMARK_CONFIG.sampleCode).toBe('string')
    expect(DEFAULT_BENCHMARK_CONFIG.sampleCode.length).toBeGreaterThan(0)
  })

  it('has default warmupIterations', () => {
    expect(DEFAULT_BENCHMARK_CONFIG.warmupIterations).toBe(3)
  })
})

// ─── profile-types: BUILTIN_PROFILES ───

describe('BUILTIN_PROFILES', () => {
  it('contains at least 3 profiles', () => {
    expect(BUILTIN_PROFILES.length).toBeGreaterThanOrEqual(3)
  })

  it('has strict profile', () => {
    const strict = BUILTIN_PROFILES.find((p) => p.name === 'strict')
    expect(strict).toBeDefined()
    expect(strict!.rules).toHaveProperty('no-eval')
    expect(strict!.rules['no-eval']).toBe('error')
  })

  it('has moderate profile', () => {
    const mod = BUILTIN_PROFILES.find((p) => p.name === 'moderate')
    expect(mod).toBeDefined()
    expect(mod!.rules).toHaveProperty('no-eval')
  })

  it('has lenient profile', () => {
    const lenient = BUILTIN_PROFILES.find((p) => p.name === 'lenient')
    expect(lenient).toBeDefined()
  })

  it('all profiles have required fields', () => {
    for (const profile of BUILTIN_PROFILES) {
      expect(profile.name).toBeTruthy()
      expect(profile.description).toBeTruthy()
      expect(profile.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(Object.keys(profile.rules).length).toBeGreaterThan(0)
      expect(profile.createdBy).toBe('codeforge')
    }
  })

  it('strict profile has more rules than moderate', () => {
    const strict = BUILTIN_PROFILES.find((p) => p.name === 'strict')!
    const moderate = BUILTIN_PROFILES.find((p) => p.name === 'moderate')!
    expect(Object.keys(strict.rules).length).toBeGreaterThan(Object.keys(moderate.rules).length)
  })

  it('moderate profile has more rules than lenient', () => {
    const moderate = BUILTIN_PROFILES.find((p) => p.name === 'moderate')!
    const lenient = BUILTIN_PROFILES.find((p) => p.name === 'lenient')!
    expect(Object.keys(moderate.rules).length).toBeGreaterThan(Object.keys(lenient.rules).length)
  })
})
