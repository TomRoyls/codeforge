import { describe, it, expect } from 'vitest'
import { ExitCode, commonFlags } from '../src/lib/base.js'

// ─── ExitCode ─────────────────────────────────────────
describe('ExitCode', () => {
  it('SUCCESS is 0', () => {
    expect(ExitCode.SUCCESS).toBe(0)
  })

  it('ERRORS_FOUND is 1', () => {
    expect(ExitCode.ERRORS_FOUND).toBe(1)
  })

  it('WARNINGS_AS_ERRORS is 2', () => {
    expect(ExitCode.WARNINGS_AS_ERRORS).toBe(2)
  })

  it('CONFIG_ERROR is 3', () => {
    expect(ExitCode.CONFIG_ERROR).toBe(3)
  })

  it('SYSTEM_ERROR is 5', () => {
    expect(ExitCode.SYSTEM_ERROR).toBe(5)
  })

  it('all codes are distinct', () => {
    const codes = Object.values(ExitCode)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

// ─── commonFlags ──────────────────────────────────────
describe('commonFlags', () => {
  it('has config flag with char c', () => {
    expect(commonFlags.config.char).toBe('c')
    expect(commonFlags.config.description).toBeTruthy()
  })

  it('has quiet flag with char q', () => {
    expect(commonFlags.quiet.char).toBe('q')
    expect(commonFlags.quiet.default).toBe(false)
  })

  it('has verbose flag with char v', () => {
    expect(commonFlags.verbose.char).toBe('v')
    expect(commonFlags.verbose.default).toBe(false)
  })

  it('all flags have descriptions', () => {
    for (const flag of Object.values(commonFlags)) {
      expect(flag.description).toBeTruthy()
      expect(typeof flag.description).toBe('string')
    }
  })
})
