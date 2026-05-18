import { describe, it, expect } from 'vitest'
import { CLIError, SystemError } from '../src/utils/errors.js'

// ─── CLIError Constructor ─────────────────────────────
describe('CLIError constructor', () => {
  it('creates error with message', () => {
    const err = new CLIError('test error')
    expect(err.message).toBe('test error')
    expect(err.name).toBe('CLIError')
  })

  it('has default code E000', () => {
    const err = new CLIError('test')
    expect(err.code).toBe('E000')
  })

  it('has empty suggestions by default', () => {
    const err = new CLIError('test')
    expect(err.suggestions).toEqual([])
  })

  it('has empty context by default', () => {
    const err = new CLIError('test')
    expect(err.context).toEqual({})
  })

  it('accepts custom code', () => {
    const err = new CLIError('test', { code: 'E100' })
    expect(err.code).toBe('E100')
  })

  it('accepts custom suggestions', () => {
    const err = new CLIError('test', { suggestions: ['try this'] })
    expect(err.suggestions).toEqual(['try this'])
  })

  it('accepts custom context', () => {
    const err = new CLIError('test', { context: { key: 'val' } })
    expect(err.context).toEqual({ key: 'val' })
  })

  it('is instance of Error', () => {
    const err = new CLIError('test')
    expect(err).toBeInstanceOf(Error)
  })

  it('is instance of CLIError', () => {
    const err = new CLIError('test')
    expect(err).toBeInstanceOf(CLIError)
  })
})

// ─── CLIError Static Methods ──────────────────────────
describe('CLIError static methods', () => {
  it('configError creates error with code E003', () => {
    const err = CLIError.configError('bad config')
    expect(err.code).toBe('E003')
    expect(err.message).toBe('bad config')
  })

  it('configError accepts suggestions', () => {
    const err = CLIError.configError('bad', ['fix it'])
    expect(err.suggestions).toEqual(['fix it'])
  })

  it('configValidation creates error with code E004', () => {
    const err = CLIError.configValidation('key', 'bad', 'reason')
    expect(err.code).toBe('E004')
    expect(err.message).toContain('key')
    expect(err.message).toContain('reason')
    expect(err.context.key).toBe('key')
  })

  it('fileNotFound creates error with code E002', () => {
    const err = CLIError.fileNotFound('/path/to/file')
    expect(err.code).toBe('E002')
    expect(err.message).toContain('/path/to/file')
  })

  it('invalidInput creates error with code E001', () => {
    const err = CLIError.invalidInput('bad input')
    expect(err.code).toBe('E001')
    expect(err.message).toBe('bad input')
  })

  it('invalidInput accepts suggestions', () => {
    const err = CLIError.invalidInput('bad', ['try again'])
    expect(err.suggestions).toEqual(['try again'])
  })
})

// ─── CLIError.toJSON ──────────────────────────────────
describe('CLIError.toJSON', () => {
  it('returns correct shape', () => {
    const err = new CLIError('test', { code: 'E001', suggestions: ['s'], context: { k: 1 } })
    const json = err.toJSON()
    expect(json).toHaveProperty('code', 'E001')
    expect(json).toHaveProperty('message', 'test')
    expect(json).toHaveProperty('name', 'CLIError')
    expect(json).toHaveProperty('suggestions', ['s'])
    expect(json).toHaveProperty('context', { k: 1 })
    expect(json).toHaveProperty('stack')
  })
})

// ─── SystemError Constructor ──────────────────────────
describe('SystemError constructor', () => {
  it('creates error with message', () => {
    const err = new SystemError('sys error')
    expect(err.message).toBe('sys error')
    expect(err.name).toBe('SystemError')
  })

  it('has default code E500', () => {
    const err = new SystemError('test')
    expect(err.code).toBe('E500')
  })

  it('has empty context by default', () => {
    const err = new SystemError('test')
    expect(err.context).toEqual({})
  })

  it('has no cause by default', () => {
    const err = new SystemError('test')
    expect(err.cause).toBeUndefined()
  })

  it('accepts custom code', () => {
    const err = new SystemError('test', { code: 'E600' })
    expect(err.code).toBe('E600')
  })

  it('accepts cause', () => {
    const cause = new Error('original')
    const err = new SystemError('test', { cause })
    expect(err.cause).toBe(cause)
  })

  it('accepts context', () => {
    const err = new SystemError('test', { context: { op: 'read' } })
    expect(err.context).toEqual({ op: 'read' })
  })

  it('is instance of Error', () => {
    const err = new SystemError('test')
    expect(err).toBeInstanceOf(Error)
  })

  it('is instance of SystemError', () => {
    const err = new SystemError('test')
    expect(err).toBeInstanceOf(SystemError)
  })
})

// ─── SystemError Static Methods ───────────────────────
describe('SystemError static methods', () => {
  it('ioError creates error with code E502', () => {
    const cause = new Error('disk full')
    const err = SystemError.ioError('write file', cause)
    expect(err.code).toBe('E502')
    expect(err.message).toContain('write file')
    expect(err.cause).toBe(cause)
    expect(err.context.operation).toBe('write file')
  })

  it('parseError creates error with code E501', () => {
    const cause = new Error('syntax error')
    const err = SystemError.parseError('/file.ts', cause)
    expect(err.code).toBe('E501')
    expect(err.message).toContain('/file.ts')
    expect(err.cause).toBe(cause)
    expect(err.context.filePath).toBe('/file.ts')
  })
})

// ─── SystemError.toJSON ───────────────────────────────
describe('SystemError.toJSON', () => {
  it('returns correct shape without cause', () => {
    const err = new SystemError('test', { code: 'E500' })
    const json = err.toJSON()
    expect(json.code).toBe('E500')
    expect(json.message).toBe('test')
    expect(json.name).toBe('SystemError')
    expect(json.cause).toBeUndefined()
    expect(json).toHaveProperty('stack')
  })

  it('returns cause in JSON', () => {
    const cause = new Error('original')
    const err = new SystemError('test', { cause })
    const json = err.toJSON()
    expect(json.cause).toBeDefined()
    expect(json.cause!.message).toBe('original')
  })
})

// ─── Error Hierarchy ──────────────────────────────────
describe('Error hierarchy', () => {
  it('CLIError and SystemError are distinct', () => {
    const cli = new CLIError('cli')
    const sys = new SystemError('sys')
    expect(cli).toBeInstanceOf(CLIError)
    expect(cli).not.toBeInstanceOf(SystemError)
    expect(sys).toBeInstanceOf(SystemError)
    expect(sys).not.toBeInstanceOf(CLIError)
  })

  it('both are catchable as Error', () => {
    const throwCLI = () => { throw new CLIError('cli') }
    const throwSys = () => { throw new SystemError('sys') }
    expect(throwCLI).toThrow(Error)
    expect(throwSys).toThrow(Error)
  })
})
