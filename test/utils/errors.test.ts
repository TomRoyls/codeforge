import { describe, expect, it } from 'vitest'
import { CLIError, SystemError } from '../../src/utils/errors.js'

// ─── CLIError Construction ───

describe('CLIError', () => {
  it('creates with default options', () => {
    const err = new CLIError('test error')
    expect(err.message).toBe('test error')
    expect(err.name).toBe('CLIError')
    expect(err.code).toBe('E000')
    expect(err.suggestions).toEqual([])
    expect(err.context).toEqual({})
  })

  it('creates with custom code', () => {
    const err = new CLIError('msg', { code: 'E999' })
    expect(err.code).toBe('E999')
  })

  it('creates with context', () => {
    const err = new CLIError('msg', { context: { key: 'value', num: 42 } })
    expect(err.context).toEqual({ key: 'value', num: 42 })
  })

  it('creates with suggestions', () => {
    const err = new CLIError('msg', { suggestions: ['try A', 'try B'] })
    expect(err.suggestions).toEqual(['try A', 'try B'])
  })

  it('creates with all options', () => {
    const err = new CLIError('msg', {
      code: 'E001',
      context: { detail: 'x' },
      suggestions: ['fix it'],
    })
    expect(err.code).toBe('E001')
    expect(err.context).toEqual({ detail: 'x' })
    expect(err.suggestions).toEqual(['fix it'])
    expect(err.message).toBe('msg')
  })

  it('is an instance of Error', () => {
    const err = new CLIError('test')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(CLIError)
  })

  it('has a stack trace', () => {
    const err = new CLIError('test')
    expect(err.stack).toBeDefined()
    expect(err.stack).toContain('CLIError')
  })
})

// ─── CLIError Static Factories ───

describe('CLIError static factories', () => {
  it('configError creates E003 error', () => {
    const err = CLIError.configError('bad config', ['check docs'])
    expect(err.code).toBe('E003')
    expect(err.message).toBe('bad config')
    expect(err.suggestions).toEqual(['check docs'])
  })

  it('configError defaults to empty suggestions', () => {
    const err = CLIError.configError('bad')
    expect(err.suggestions).toEqual([])
  })

  it('configValidation creates E004 error with context', () => {
    const err = CLIError.configValidation('timeout', -1, 'must be positive')
    expect(err.code).toBe('E004')
    expect(err.message).toContain("Invalid config: 'timeout'")
    expect(err.message).toContain('must be positive')
    expect(err.context.key).toBe('timeout')
    expect(err.context.reason).toBe('must be positive')
    expect(err.context.value).toBe('-1')
    expect(err.suggestions.length).toBeGreaterThan(0)
  })

  it('fileNotFound creates E002 error', () => {
    const err = CLIError.fileNotFound('/path/to/file.ts')
    expect(err.code).toBe('E002')
    expect(err.message).toBe('File not found: /path/to/file.ts')
    expect(err.suggestions.length).toBeGreaterThan(0)
  })

  it('invalidInput creates E001 error', () => {
    const err = CLIError.invalidInput('bad input', ['use valid input'])
    expect(err.code).toBe('E001')
    expect(err.message).toBe('bad input')
    expect(err.suggestions).toEqual(['use valid input'])
  })

  it('invalidInput defaults to empty suggestions', () => {
    const err = CLIError.invalidInput('bad')
    expect(err.suggestions).toEqual([])
  })
})

// ─── CLIError toJSON ───

describe('CLIError toJSON', () => {
  it('serializes to JSON with all fields', () => {
    const err = new CLIError('test msg', {
      code: 'E001',
      context: { foo: 'bar' },
      suggestions: ['do X'],
    })
    const json = err.toJSON()
    expect(json.code).toBe('E001')
    expect(json.message).toBe('test msg')
    expect(json.name).toBe('CLIError')
    expect(json.context).toEqual({ foo: 'bar' })
    expect(json.suggestions).toEqual(['do X'])
    expect(json.stack).toBeDefined()
  })

  it('toJSON includes default values', () => {
    const err = new CLIError('simple')
    const json = err.toJSON()
    expect(json.code).toBe('E000')
    expect(json.context).toEqual({})
    expect(json.suggestions).toEqual([])
  })
})

// ─── SystemError Construction ───

describe('SystemError', () => {
  it('creates with default options', () => {
    const err = new SystemError('system fail')
    expect(err.message).toBe('system fail')
    expect(err.name).toBe('SystemError')
    expect(err.code).toBe('E500')
    expect(err.cause).toBeUndefined()
    expect(err.context).toEqual({})
  })

  it('creates with custom code', () => {
    const err = new SystemError('msg', { code: 'E501' })
    expect(err.code).toBe('E501')
  })

  it('creates with cause', () => {
    const cause = new Error('original')
    const err = new SystemError('msg', { cause })
    expect(err.cause).toBe(cause)
    expect(err.cause!.message).toBe('original')
  })

  it('creates with context', () => {
    const err = new SystemError('msg', { context: { op: 'read' } })
    expect(err.context).toEqual({ op: 'read' })
  })

  it('is an instance of Error', () => {
    const err = new SystemError('test')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(SystemError)
  })

  it('is not an instance of CLIError', () => {
    const err = new SystemError('test')
    expect(err).not.toBeInstanceOf(CLIError)
  })

  it('has a stack trace', () => {
    const err = new SystemError('test')
    expect(err.stack).toBeDefined()
    expect(err.stack).toContain('SystemError')
  })
})

// ─── SystemError Static Factories ───

describe('SystemError static factories', () => {
  it('ioError creates E502 with cause', () => {
    const cause = new Error('ENOENT')
    const err = SystemError.ioError('read file', cause)
    expect(err.code).toBe('E502')
    expect(err.message).toBe('I/O error: read file')
    expect(err.cause).toBe(cause)
    expect(err.context.operation).toBe('read file')
    expect(err.context.causeMessage).toBe('ENOENT')
  })

  it('parseError creates E501 with cause', () => {
    const cause = new Error('unexpected token')
    const err = SystemError.parseError('/foo.ts', cause)
    expect(err.code).toBe('E501')
    expect(err.message).toBe('Failed to parse file: /foo.ts')
    expect(err.cause).toBe(cause)
    expect(err.context.filePath).toBe('/foo.ts')
    expect(err.context.causeMessage).toBe('unexpected token')
  })
})

// ─── SystemError toJSON ───

describe('SystemError toJSON', () => {
  it('serializes without cause', () => {
    const err = new SystemError('test', { code: 'E501', context: { x: 1 } })
    const json = err.toJSON()
    expect(json.code).toBe('E501')
    expect(json.message).toBe('test')
    expect(json.name).toBe('SystemError')
    expect(json.context).toEqual({ x: 1 })
    expect(json.cause).toBeUndefined()
    expect(json.stack).toBeDefined()
  })

  it('serializes with cause', () => {
    const cause = new Error('root cause')
    const err = new SystemError('test', { cause })
    const json = err.toJSON()
    expect(json.cause).toBeDefined()
    expect(json.cause!.message).toBe('root cause')
    expect(json.cause!.name).toBe('Error')
    expect(json.cause!.stack).toBeDefined()
  })
})

// ─── Error Hierarchy ───

describe('Error hierarchy', () => {
  it('CLIError and SystemError are distinct classes', () => {
    const cli = new CLIError('c')
    const sys = new SystemError('s')
    expect(cli).not.toBeInstanceOf(SystemError)
    expect(sys).not.toBeInstanceOf(CLIError)
  })

  it('can catch CLIError specifically', () => {
    const thrower = (): void => { throw new CLIError('boom') }
    expect(thrower).toThrow(CLIError)
    expect(thrower).toThrow(Error)
  })

  it('can catch SystemError specifically', () => {
    const thrower = (): void => { throw new SystemError('boom') }
    expect(thrower).toThrow(SystemError)
    expect(thrower).toThrow(Error)
  })

  it('can differentiate catch types', () => {
    try {
      throw new CLIError('cli', { code: 'E001' })
    } catch (e) {
      if (e instanceof CLIError) {
        expect(e.code).toBe('E001')
      } else {
        expect.unreachable('Should be CLIError')
      }
    }
  })
})
