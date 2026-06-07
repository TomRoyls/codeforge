import { describe, it, expect } from 'vitest'

import Version, { getVersionInfo } from '../src/commands/version.js'

describe('Version command - static metadata', () => {
  it('has a description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has examples array', () => {
    expect(Array.isArray(Version.examples)).toBe(true)
    expect(Version.examples.length).toBeGreaterThanOrEqual(1)
  })

  it('examples contain command and description', () => {
    const example = Version.examples[0] as { command: string; description: string }
    expect(example).toHaveProperty('command')
    expect(example).toHaveProperty('description')
  })
})

describe('Version command - class structure', () => {
  it('exports a default class', () => {
    expect(Version).toBeDefined()
    expect(typeof Version).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Version.prototype.run).toBe('function')
  })

  it('exports getVersionInfo function', () => {
    expect(typeof getVersionInfo).toBe('function')
  })
})

describe('getVersionInfo', () => {
  it('returns version string', () => {
    const version = getVersionInfo()
    expect(typeof version).toBe('string')
    expect(version.length).toBeGreaterThan(0)
  })

  it('version matches semver format', () => {
    const version = getVersionInfo()
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('returns non-empty version', () => {
    const version = getVersionInfo()
    expect(version).not.toBe('0.0.0')
  })
})
