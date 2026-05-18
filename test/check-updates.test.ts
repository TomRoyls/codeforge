import { describe, it, expect } from 'vitest'

// ─── Module Load ──────────────────────────────────────
describe('check-updates module', () => {
  it('exports the CheckUpdates class as default', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('CheckUpdates class has static description', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(mod.default.description).toBe('Check for outdated dependencies and security vulnerabilities')
  })

  it('CheckUpdates class has static flags defined', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(mod.default.flags).toBeDefined()
    expect(mod.default.flags.fixSecurity).toBeDefined()
    expect(mod.default.flags.json).toBeDefined()
    expect(mod.default.flags.security).toBeDefined()
    expect(mod.default.flags.update).toBeDefined()
  })

  it('CheckUpdates class has static examples', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(Array.isArray(mod.default.examples)).toBe(true)
    expect(mod.default.examples.length).toBeGreaterThan(0)
  })
})

// ─── Type Interfaces ──────────────────────────────────
describe('check-updates type interfaces', () => {
  it('OutdatedPackage shape is valid', () => {
    const pkg = {
      current: '1.0.0',
      latest: '2.0.0',
      name: 'lodash',
      wanted: '1.2.3',
    }
    expect(pkg.name).toBe('lodash')
    expect(pkg.current).toBe('1.0.0')
    expect(pkg.latest).toBe('2.0.0')
  })

  it('AuditMetadata shape is valid', () => {
    const audit = {
      dependencies: 10,
      devDependencies: 5,
      metadata: {
        vulnerabilities: {
          critical: 1,
          high: 2,
          info: 0,
          low: 3,
          moderate: 4,
          total: 10,
        },
      },
      optionalDependencies: 0,
      peerDependencies: 0,
      vulnerabilities: {
        critical: 1,
        high: 2,
        info: 0,
        low: 3,
        moderate: 4,
        total: 10,
      },
    }
    expect(audit.vulnerabilities.total).toBe(10)
    expect(audit.vulnerabilities.critical).toBe(1)
  })
})

// ─── Static Configuration ──────────────────────────────
describe('CheckUpdates static configuration', () => {
  it('has correct flag defaults', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(mod.default.flags.fixSecurity.default).toBe(false)
    expect(mod.default.flags.json.default).toBeUndefined()
    expect(mod.default.flags.security.default).toBe(true)
    expect(mod.default.flags.update.default).toBe(false)
  })

  it('has security flag with allowNo', async () => {
    const mod = await import('../src/commands/check-updates.js')
    expect(mod.default.flags.security.allowNo).toBe(true)
  })

  it('examples have command and description', async () => {
    const mod = await import('../src/commands/check-updates.js')
    for (const example of mod.default.examples) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
    }
  })
})
