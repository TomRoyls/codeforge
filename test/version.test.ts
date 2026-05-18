import { describe, it, expect } from 'vitest'

import Version, { getVersionInfo } from '../src/commands/version.js'

// ─── Static metadata ────────────────────────────────────
describe('Version command - static metadata', () => {
  it('has a description', () => {
    expect(Version.description).toBe('Show current version of CodeForge')
  })

  it('has examples array', () => {
    expect(Array.isArray(Version.examples)).toBe(true)
    expect(Version.examples.length).toBeGreaterThanOrEqual(2)
  })

  it('examples contain command and description', () => {
    const example = Version.examples[0] as { command: string; description: string }
    expect(example).toHaveProperty('command')
    expect(example).toHaveProperty('description')
  })
})

// ─── Flags ───────────────────────────────────────────────
describe('Version command - flags', () => {
  it('has json flag', () => {
    expect(Version.flags.json).toBeDefined()
    expect(Version.flags.json.default).toBe(false)
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

  it('exports getVersionInfo function', () => {
    expect(typeof getVersionInfo).toBe('function')
  })
})

// ─── getVersionInfo ──────────────────────────────────────
describe('getVersionInfo', () => {
  it('returns object with required fields', () => {
    const info = getVersionInfo()
    expect(info).toHaveProperty('codeforge')
    expect(info).toHaveProperty('node')
    expect(info).toHaveProperty('platform')
    expect(info).toHaveProperty('arch')
    expect(info).toHaveProperty('os')
  })

  it('codeforge version is a non-empty string', () => {
    const info = getVersionInfo()
    expect(typeof info.codeforge).toBe('string')
    expect(info.codeforge.length).toBeGreaterThan(0)
  })

  it('node version starts with "v"', () => {
    const info = getVersionInfo()
    expect(info.node).toMatch(/^v\d+/)
  })

  it('platform is a known value', () => {
    const info = getVersionInfo()
    expect(['linux', 'darwin', 'win32', 'aix', 'freebsd', 'openbsd', 'sunos']).toContain(info.platform)
  })

  it('arch is a known value', () => {
    const info = getVersionInfo()
    expect(['x64', 'arm', 'arm64', 'ia32', 'loong64', 'mips', 'mipsel', 'ppc', 'ppc64', 'riscv64', 's390', 's390x']).toContain(info.arch)
  })
})
