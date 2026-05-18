import { describe, it, expect } from 'vitest'

import Version from '../src/commands/version.js'

// ─── Static metadata ────────────────────────────────────
describe('Version command - static metadata', () => {
  it('has a description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has examples array', () => {
    expect(Array.isArray(Version.examples)).toBe(true)
    expect(Version.examples.length).toBeGreaterThan(0)
  })

  it('examples contain command and description', () => {
    const example = Version.examples[0] as { command: string; description: string }
    expect(example).toHaveProperty('command')
    expect(example).toHaveProperty('description')
  })
})

// ─── Class structure ─────────────────────────────────────
describe('Version command - class structure', () => {
  it('exports a default class', () => {
    expect(Version).toBeDefined()
    expect(typeof Version).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Version.prototype.run).toBe('function')
  })
})
