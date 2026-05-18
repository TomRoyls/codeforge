import { describe, it, expect, vi } from 'vitest'

import Clean from '../src/commands/clean.js'

// ─── Static metadata ────────────────────────────────────
describe('Clean command - static metadata', () => {
  it('has a description', () => {
    expect(Clean.description).toBe('Clean generated files and caches')
  })

  it('has examples array with entries', () => {
    expect(Array.isArray(Clean.examples)).toBe(true)
    expect(Clean.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has flags defined', () => {
    expect(Clean.flags).toBeDefined()
    expect(Clean.flags.cache).toBeDefined()
    expect(Clean.flags.dist).toBeDefined()
    expect(Clean.flags['dry-run']).toBeDefined()
  })

  it('cache flag defaults to false', () => {
    expect(Clean.flags.cache.default).toBe(false)
  })

  it('dist flag defaults to false', () => {
    expect(Clean.flags.dist.default).toBe(false)
  })

  it('dry-run flag has char d', () => {
    expect(Clean.flags['dry-run'].char).toBe('d')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Clean command - class structure', () => {
  it('exports a default class', () => {
    expect(Clean).toBeDefined()
    expect(typeof Clean).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Clean.prototype.run).toBe('function')
  })
})

// ─── Integration with helpers ────────────────────────────
describe('Clean command - helper integration', () => {
  it('imports getCleanTargets from clean-helpers', async () => {
    const helpers = await import('../src/commands/clean-helpers.js')
    expect(typeof helpers.getCleanTargets).toBe('function')
    expect(typeof helpers.formatCleanHeader).toBe('function')
    expect(typeof helpers.formatTargetStatus).toBe('function')
    expect(typeof helpers.displayCleanResult).toBe('function')
  })

  it('uses CleanFlags interface matching helper type', async () => {
    const helpers = await import('../src/commands/clean-helpers.js')
    const targets = helpers.getCleanTargets({ cache: true, dist: false }, '/tmp')
    expect(targets).toHaveLength(2)
  })
})
