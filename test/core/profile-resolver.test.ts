import { describe, expect, it } from 'vitest'

import { mergeRules, PROFILE_RESOLUTION_DEPTH_LIMIT } from '../../src/core/profile-resolver.js'

// ─── mergeRules ───

describe('mergeRules', () => {
  it('returns base when override is empty', () => {
    const base = { 'no-console': ['error'] }
    const result = mergeRules(base, {})
    expect(result).toEqual({ 'no-console': ['error'] })
  })

  it('returns override when base is empty', () => {
    const override = { 'no-console': ['warn'] }
    const result = mergeRules({}, override)
    expect(result).toEqual({ 'no-console': ['warn'] })
  })

  it('overrides base scalar value', () => {
    const base = { key: 'old' }
    const override = { key: 'new' }
    expect(mergeRules(base, override)).toEqual({ key: 'new' })
  })

  it('adds new keys from override', () => {
    const base = { a: 1 }
    const override = { b: 2 }
    expect(mergeRules(base, override)).toEqual({ a: 1, b: 2 })
  })

  it('merges array rule with options', () => {
    const base = { 'no-console': ['error', { allow: ['warn'] }] }
    const override = { 'no-console': ['warn', { extra: true }] }
    const result = mergeRules(base, override)
    expect(result['no-console'][0]).toBe('warn')
    expect(result['no-console'][1]).toEqual({ allow: ['warn'], extra: true })
  })

  it('uses override severity when no override opts', () => {
    const base = { 'no-console': ['error', { allow: ['warn'] }] }
    const override = { 'no-console': ['off'] }
    const result = mergeRules(base, override)
    expect(result['no-console']).toEqual(['off'])
  })

  it('handles both empty objects', () => {
    expect(mergeRules({}, {})).toEqual({})
  })

  it('merges multiple keys', () => {
    const base = { a: 'base-a', b: 'base-b' }
    const override = { b: 'over-b', c: 'over-c' }
    expect(mergeRules(base, override)).toEqual({ a: 'base-a', b: 'over-b', c: 'over-c' })
  })

  it('array override without opts uses override severity', () => {
    const base = { rule: ['error'] }
    const override = { rule: ['warn'] }
    const result = mergeRules(base, override)
    expect(result.rule).toEqual(['warn'])
  })

  it('array override with opts merges with base opts', () => {
    const base = { rule: ['error', { opt1: true }] }
    const override = { rule: ['warn', { opt2: false }] }
    const result = mergeRules(base, override)
    expect(result.rule[0]).toBe('warn')
    expect(result.rule[1]).toEqual({ opt1: true, opt2: false })
  })
})

// ─── PROFILE_RESOLUTION_DEPTH_LIMIT ───

describe('PROFILE_RESOLUTION_DEPTH_LIMIT', () => {
  it('is 10', () => {
    expect(PROFILE_RESOLUTION_DEPTH_LIMIT).toBe(10)
  })
})
