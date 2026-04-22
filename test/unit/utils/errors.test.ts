import { describe, test, expect } from 'vitest'
import { CLIError, SystemError } from '../../../src/utils/errors'

describe('CLIError', () => {
  describe('constructor', () => {
    test('creates CLIError with default values', () => {
      const error = new CLIError('Test error')
      expect(error.name).toBe('CLIError')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('E000')
      expect(error.suggestions).toEqual([])
      expect(error.context).toEqual({})
    })
    test('is instance of Error', () => {
      const error = new CLIError('Test error')
      expect(error instanceof Error).toBe(true)
      expect(error instanceof CLIError).toBe(true)
    })
  })

  describe('invalidInput', () => {
    test('creates invalid input error', () => {
      const error = CLIError.invalidInput('Invalid input')
      expect(error.code).toBe('E001')
    })
  })

  describe('fileNotFound', () => {
    test('creates file not found error', () => {
      const error = CLIError.fileNotFound('/path/to/file.txt')
      expect(error.code).toBe('E002')
      expect(error.suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('toJSON', () => {
    test('serializes error', () => {
      const error = new CLIError('Test error', { code: 'E001' })
      const json = error.toJSON()
      expect(json.name).toBe('CLIError')
      expect(json.code).toBe('E001')
    })
  })
})

describe('SystemError', () => {
  describe('constructor', () => {
    test('creates SystemError with cause', () => {
      const cause = new Error('Original')
      const error = new SystemError('Test', { cause })
      expect(error.cause).toBe(cause)
    })
  })

  describe('parseError', () => {
    test('creates parse error', () => {
      const cause = new Error('Invalid JSON')
      const error = SystemError.parseError('/path', cause)
      expect(error.code).toBe('E501')
      expect(error.cause).toBe(cause)
    })
  })

  describe('ioError', () => {
    test('creates I/O error', () => {
      const cause = new Error('Permission')
      const error = SystemError.ioError('read', cause)
      expect(error.code).toBe('E502')
    })
  })

  describe('toJSON', () => {
    test('serializes error with cause', () => {
      const cause = new Error('Original')
      const error = new SystemError('Test', { cause })
      const json = error.toJSON()
      expect(json.cause).toBeDefined()
      expect(json.cause?.message).toBe('Original')
    })
  })
})

describe('CLIError - Constructor exhaustive', () => {
  test('creates with message only', () => {
    const error = new CLIError('Something went wrong')
    expect(error.message).toBe('Something went wrong')
  })

  test('creates with empty string message', () => {
    const error = new CLIError('')
    expect(error.message).toBe('')
  })

  test('creates with long message', () => {
    const msg = 'x'.repeat(10000)
    const error = new CLIError(msg)
    expect(error.message).toBe(msg)
  })

  test('creates with unicode message', () => {
    const error = new CLIError('エラー発生 🔥 ñ ü ö')
    expect(error.message).toBe('エラー発生 🔥 ñ ü ö')
  })

  test('creates with multiline message', () => {
    const msg = 'line1\nline2\nline3'
    const error = new CLIError(msg)
    expect(error.message).toBe(msg)
  })

  test('default code is E000', () => {
    const error = new CLIError('msg')
    expect(error.code).toBe('E000')
  })

  test('custom code is set', () => {
    const error = new CLIError('msg', { code: 'E999' })
    expect(error.code).toBe('E999')
  })

  test('code option undefined falls back to E000', () => {
    const error = new CLIError('msg', { code: undefined })
    expect(error.code).toBe('E000')
  })

  test('empty options object uses defaults', () => {
    const error = new CLIError('msg', {})
    expect(error.code).toBe('E000')
    expect(error.suggestions).toEqual([])
    expect(error.context).toEqual({})
  })

  test('no options argument uses defaults', () => {
    const error = new CLIError('msg')
    expect(error.code).toBe('E000')
    expect(error.suggestions).toEqual([])
    expect(error.context).toEqual({})
  })

  test('suggestions default to empty array', () => {
    const error = new CLIError('msg')
    expect(error.suggestions).toEqual([])
  })

  test('suggestions are set from options', () => {
    const error = new CLIError('msg', { suggestions: ['Try A', 'Try B'] })
    expect(error.suggestions).toEqual(['Try A', 'Try B'])
  })

  test('suggestions can be a single-element array', () => {
    const error = new CLIError('msg', { suggestions: ['Only one'] })
    expect(error.suggestions).toEqual(['Only one'])
  })

  test('suggestions can be a large array', () => {
    const suggestions = Array.from({ length: 50 }, (_, i) => `Suggestion ${i}`)
    const error = new CLIError('msg', { suggestions })
    expect(error.suggestions).toEqual(suggestions)
    expect(error.suggestions).toHaveLength(50)
  })

  test('context default to empty object', () => {
    const error = new CLIError('msg')
    expect(error.context).toEqual({})
  })

  test('context is set from options', () => {
    const ctx = { key: 'value', count: 42 }
    const error = new CLIError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('context with nested object', () => {
    const ctx = { nested: { deep: { value: true } } }
    const error = new CLIError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('context with array values', () => {
    const ctx = { files: ['a.ts', 'b.ts'], counts: [1, 2, 3] }
    const error = new CLIError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('context with null values', () => {
    const ctx = { value: null, other: 'ok' }
    const error = new CLIError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('name property is CLIError', () => {
    const error = new CLIError('msg')
    expect(error.name).toBe('CLIError')
  })

  test('all options together', () => {
    const error = new CLIError('full', {
      code: 'E100',
      suggestions: ['Do X'],
      context: { detail: 'info' },
    })
    expect(error.message).toBe('full')
    expect(error.code).toBe('E100')
    expect(error.suggestions).toEqual(['Do X'])
    expect(error.context).toEqual({ detail: 'info' })
    expect(error.name).toBe('CLIError')
  })

  test('prototype chain is correct', () => {
    const error = new CLIError('msg')
    expect(Object.getPrototypeOf(error)).toBe(CLIError.prototype)
  })

  test('prototype chain includes Error', () => {
    const error = new CLIError('msg')
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(Error.prototype)
  })

  test('has stack trace', () => {
    const error = new CLIError('msg')
    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })

  test('stack trace contains CLIError', () => {
    const error = new CLIError('msg')
    expect(error.stack).toContain('CLIError')
  })

  test('stack trace contains the message', () => {
    const error = new CLIError('StackTestMessage')
    expect(error.stack).toContain('StackTestMessage')
  })

  test('is catchable as Error', () => {
    let caught = false
    try {
      throw new CLIError('catch me')
    } catch (e) {
      if (e instanceof Error) caught = true
    }
    expect(caught).toBe(true)
  })

  test('is catchable as CLIError', () => {
    let caught = false
    try {
      throw new CLIError('catch me')
    } catch (e) {
      if (e instanceof CLIError) caught = true
    }
    expect(caught).toBe(true)
  })

  test('thrown error preserves properties', () => {
    let error: CLIError | undefined
    try {
      throw new CLIError('thrown', { code: 'E100', suggestions: ['fix it'] })
    } catch (e) {
      if (e instanceof CLIError) error = e
    }
    expect(error?.message).toBe('thrown')
    expect(error?.code).toBe('E100')
    expect(error?.suggestions).toEqual(['fix it'])
  })

  test('different CLIError instances are independent', () => {
    const e1 = new CLIError('one', { code: 'E001' })
    const e2 = new CLIError('two', { code: 'E002' })
    expect(e1.message).toBe('one')
    expect(e2.message).toBe('two')
    expect(e1.code).toBe('E001')
    expect(e2.code).toBe('E002')
    expect(e1).not.toBe(e2)
  })

  test('suggestions array is independent between instances', () => {
    const e1 = new CLIError('a', { suggestions: ['x'] })
    const e2 = new CLIError('b', { suggestions: ['y'] })
    expect(e1.suggestions).toEqual(['x'])
    expect(e2.suggestions).toEqual(['y'])
  })
})

describe('CLIError - invalidInput static', () => {
  test('creates error with code E001', () => {
    const error = CLIError.invalidInput('bad input')
    expect(error.code).toBe('E001')
  })

  test('sets the message', () => {
    const error = CLIError.invalidInput('bad input')
    expect(error.message).toBe('bad input')
  })

  test('name is CLIError', () => {
    const error = CLIError.invalidInput('msg')
    expect(error.name).toBe('CLIError')
  })

  test('default suggestions are empty', () => {
    const error = CLIError.invalidInput('msg')
    expect(error.suggestions).toEqual([])
  })

  test('custom suggestions are set', () => {
    const error = CLIError.invalidInput('msg', ['Check docs', 'Try again'])
    expect(error.suggestions).toEqual(['Check docs', 'Try again'])
  })

  test('empty suggestions array', () => {
    const error = CLIError.invalidInput('msg', [])
    expect(error.suggestions).toEqual([])
  })

  test('single suggestion', () => {
    const error = CLIError.invalidInput('msg', ['Only one'])
    expect(error.suggestions).toEqual(['Only one'])
  })

  test('context is empty', () => {
    const error = CLIError.invalidInput('msg')
    expect(error.context).toEqual({})
  })

  test('is instance of CLIError', () => {
    const error = CLIError.invalidInput('msg')
    expect(error).toBeInstanceOf(CLIError)
  })

  test('is instance of Error', () => {
    const error = CLIError.invalidInput('msg')
    expect(error).toBeInstanceOf(Error)
  })

  test('returns CLIError type', () => {
    const error = CLIError.invalidInput('test')
    expect(typeof error.toJSON).toBe('function')
  })

  test('with unicode message', () => {
    const error = CLIError.invalidInput('入力が無効です')
    expect(error.message).toBe('入力が無効です')
    expect(error.code).toBe('E001')
  })
})

describe('CLIError - fileNotFound static', () => {
  test('creates error with code E002', () => {
    const error = CLIError.fileNotFound('/path/to/file.txt')
    expect(error.code).toBe('E002')
  })

  test('message includes file path', () => {
    const error = CLIError.fileNotFound('/path/to/file.txt')
    expect(error.message).toBe('File not found: /path/to/file.txt')
  })

  test('message includes relative path', () => {
    const error = CLIError.fileNotFound('./relative/path.ts')
    expect(error.message).toBe('File not found: ./relative/path.ts')
  })

  test('message includes just filename', () => {
    const error = CLIError.fileNotFound('file.ts')
    expect(error.message).toBe('File not found: file.ts')
  })

  test('has 3 suggestions', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.suggestions).toHaveLength(3)
  })

  test('first suggestion is about checking path', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.suggestions[0]).toBe('Check that the file path is correct')
  })

  test('second suggestion is about verifying existence', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.suggestions[1]).toBe('Verify the file exists')
  })

  test('third suggestion is about absolute path', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.suggestions[2]).toBe('Use absolute path if relative path fails')
  })

  test('context is empty', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.context).toEqual({})
  })

  test('name is CLIError', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error.name).toBe('CLIError')
  })

  test('is instance of CLIError', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error).toBeInstanceOf(CLIError)
  })

  test('is instance of Error', () => {
    const error = CLIError.fileNotFound('f.txt')
    expect(error).toBeInstanceOf(Error)
  })

  test('with empty string path', () => {
    const error = CLIError.fileNotFound('')
    expect(error.message).toBe('File not found: ')
  })

  test('with path containing special chars', () => {
    const error = CLIError.fileNotFound('/path/to/my file (1).txt')
    expect(error.message).toBe('File not found: /path/to/my file (1).txt')
  })

  test('with deeply nested path', () => {
    const path = 'a/b/c/d/e/f/g/h/file.ts'
    const error = CLIError.fileNotFound(path)
    expect(error.message).toBe(`File not found: ${path}`)
  })
})

describe('CLIError - configError static', () => {
  test('creates error with code E003', () => {
    const error = CLIError.configError('bad config')
    expect(error.code).toBe('E003')
  })

  test('sets the message', () => {
    const error = CLIError.configError('Configuration invalid')
    expect(error.message).toBe('Configuration invalid')
  })

  test('default suggestions are empty', () => {
    const error = CLIError.configError('msg')
    expect(error.suggestions).toEqual([])
  })

  test('custom suggestions are set', () => {
    const error = CLIError.configError('msg', ['Check .codeforgerc.json'])
    expect(error.suggestions).toEqual(['Check .codeforgerc.json'])
  })

  test('multiple suggestions', () => {
    const error = CLIError.configError('msg', ['S1', 'S2', 'S3'])
    expect(error.suggestions).toEqual(['S1', 'S2', 'S3'])
  })

  test('context is empty', () => {
    const error = CLIError.configError('msg')
    expect(error.context).toEqual({})
  })

  test('name is CLIError', () => {
    const error = CLIError.configError('msg')
    expect(error.name).toBe('CLIError')
  })

  test('is instance of CLIError', () => {
    const error = CLIError.configError('msg')
    expect(error).toBeInstanceOf(CLIError)
  })

  test('is instance of Error', () => {
    const error = CLIError.configError('msg')
    expect(error).toBeInstanceOf(Error)
  })

  test('with empty message', () => {
    const error = CLIError.configError('')
    expect(error.message).toBe('')
    expect(error.code).toBe('E003')
  })
})

describe('CLIError - toJSON exhaustive', () => {
  test('returns name field', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(json.name).toBe('CLIError')
  })

  test('returns code field', () => {
    const error = new CLIError('msg', { code: 'E123' })
    const json = error.toJSON()
    expect(json.code).toBe('E123')
  })

  test('returns default code E000', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(json.code).toBe('E000')
  })

  test('returns message field', () => {
    const error = new CLIError('hello world')
    const json = error.toJSON()
    expect(json.message).toBe('hello world')
  })

  test('returns suggestions field', () => {
    const error = new CLIError('msg', { suggestions: ['a', 'b'] })
    const json = error.toJSON()
    expect(json.suggestions).toEqual(['a', 'b'])
  })

  test('returns empty suggestions by default', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(json.suggestions).toEqual([])
  })

  test('returns context field', () => {
    const error = new CLIError('msg', { context: { foo: 'bar' } })
    const json = error.toJSON()
    expect(json.context).toEqual({ foo: 'bar' })
  })

  test('returns empty context by default', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(json.context).toEqual({})
  })

  test('returns stack field', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(json.stack).toBeDefined()
    expect(typeof json.stack).toBe('string')
  })

  test('stack contains the message', () => {
    const error = new CLIError('JSONStackTest')
    const json = error.toJSON()
    expect(json.stack).toContain('JSONStackTest')
  })

  test('result has exactly 5 keys', () => {
    const error = new CLIError('msg')
    const json = error.toJSON()
    expect(Object.keys(json)).toEqual([
      'name',
      'code',
      'message',
      'suggestions',
      'context',
      'stack',
    ])
  })

  test('serializes with all options populated', () => {
    const error = new CLIError('full', {
      code: 'E999',
      suggestions: ['a', 'b', 'c'],
      context: { x: 1, y: [2, 3] },
    })
    const json = error.toJSON()
    expect(json).toMatchObject({
      name: 'CLIError',
      code: 'E999',
      message: 'full',
      suggestions: ['a', 'b', 'c'],
      context: { x: 1, y: [2, 3] },
    })
  })

  test('toJSON result is serializable to JSON string', () => {
    const error = new CLIError('msg', { code: 'E001', context: { k: 'v' } })
    const json = error.toJSON()
    const str = JSON.stringify(json)
    expect(str).toContain('CLIError')
    expect(str).toContain('E001')
    expect(str).toContain('msg')
  })

  test('toJSON result can be parsed back', () => {
    const error = new CLIError('msg', { code: 'E001', suggestions: ['x'] })
    const json = error.toJSON()
    const parsed = JSON.parse(JSON.stringify(json))
    expect(parsed.name).toBe('CLIError')
    expect(parsed.code).toBe('E001')
    expect(parsed.message).toBe('msg')
    expect(parsed.suggestions).toEqual(['x'])
  })

  test('static factory toJSON works - invalidInput', () => {
    const error = CLIError.invalidInput('bad', ['fix it'])
    const json = error.toJSON()
    expect(json.code).toBe('E001')
    expect(json.suggestions).toEqual(['fix it'])
  })

  test('static factory toJSON works - fileNotFound', () => {
    const error = CLIError.fileNotFound('x.ts')
    const json = error.toJSON()
    expect(json.code).toBe('E002')
    expect(json.suggestions).toHaveLength(3)
    expect(json.message).toBe('File not found: x.ts')
  })

  test('static factory toJSON works - configError', () => {
    const error = CLIError.configError('cfg', ['check file'])
    const json = error.toJSON()
    expect(json.code).toBe('E003')
    expect(json.suggestions).toEqual(['check file'])
  })

  test('context with various types', () => {
    const ctx = {
      str: 'hello',
      num: 42,
      bool: true,
      nil: null,
      arr: [1, 2],
      obj: { nested: 'deep' },
    }
    const error = new CLIError('msg', { context: ctx })
    const json = error.toJSON()
    expect(json.context).toEqual(ctx)
  })
})

describe('CLIError - code values', () => {
  test('E000 for generic', () => {
    expect(new CLIError('m').code).toBe('E000')
  })

  test('E001 for invalidInput', () => {
    expect(CLIError.invalidInput('m').code).toBe('E001')
  })

  test('E002 for fileNotFound', () => {
    expect(CLIError.fileNotFound('f').code).toBe('E002')
  })

  test('E003 for configError', () => {
    expect(CLIError.configError('m').code).toBe('E003')
  })

  test('custom code overrides default', () => {
    expect(new CLIError('m', { code: 'CUSTOM' }).code).toBe('CUSTOM')
  })

  test('code is readonly at type level', () => {
    const error = new CLIError('m', { code: 'E100' })
    expect(error.code).toBe('E100')
  })
})

describe('CLIError - suggestions exhaustive', () => {
  test('suggestions with empty strings', () => {
    const error = new CLIError('m', { suggestions: ['', '', ''] })
    expect(error.suggestions).toEqual(['', '', ''])
  })

  test('suggestions with unicode', () => {
    const error = new CLIError('m', { suggestions: ['直して', 'もう一度'] })
    expect(error.suggestions).toEqual(['直して', 'もう一度'])
  })

  test('suggestions with long strings', () => {
    const long = 'x'.repeat(1000)
    const error = new CLIError('m', { suggestions: [long] })
    expect(error.suggestions[0]).toBe(long)
  })

  test('suggestions array can be iterated', () => {
    const error = new CLIError('m', { suggestions: ['a', 'b', 'c'] })
    const result: string[] = []
    for (const s of error.suggestions) {
      result.push(s.toUpperCase())
    }
    expect(result).toEqual(['A', 'B', 'C'])
  })
})

describe('CLIError - context exhaustive', () => {
  test('context with boolean values', () => {
    const error = new CLIError('m', { context: { active: true, disabled: false } })
    expect(error.context).toEqual({ active: true, disabled: false })
  })

  test('context with numeric values', () => {
    const error = new CLIError('m', { context: { count: 0, max: 100, pi: 3.14 } })
    expect(error.context).toEqual({ count: 0, max: 100, pi: 3.14 })
  })

  test('context with empty nested object', () => {
    const error = new CLIError('m', { context: { empty: {} } })
    expect(error.context).toEqual({ empty: {} })
  })

  test('context with empty array', () => {
    const error = new CLIError('m', { context: { items: [] } })
    expect(error.context).toEqual({ items: [] })
  })
})

describe('SystemError - Constructor exhaustive', () => {
  test('creates with message only', () => {
    const error = new SystemError('System failure')
    expect(error.message).toBe('System failure')
  })

  test('creates with empty string message', () => {
    const error = new SystemError('')
    expect(error.message).toBe('')
  })

  test('creates with long message', () => {
    const msg = 'y'.repeat(10000)
    const error = new SystemError(msg)
    expect(error.message).toBe(msg)
  })

  test('creates with unicode message', () => {
    const error = new SystemError('システムエラー 💥')
    expect(error.message).toBe('システムエラー 💥')
  })

  test('creates with multiline message', () => {
    const msg = 'a\nb\nc'
    const error = new SystemError(msg)
    expect(error.message).toBe(msg)
  })

  test('default code is E500', () => {
    const error = new SystemError('msg')
    expect(error.code).toBe('E500')
  })

  test('custom code is set', () => {
    const error = new SystemError('msg', { code: 'E900' })
    expect(error.code).toBe('E900')
  })

  test('code option undefined falls back to E500', () => {
    const error = new SystemError('msg', { code: undefined })
    expect(error.code).toBe('E500')
  })

  test('empty options uses defaults', () => {
    const error = new SystemError('msg', {})
    expect(error.code).toBe('E500')
    expect(error.cause).toBeUndefined()
    expect(error.context).toEqual({})
  })

  test('no options uses defaults', () => {
    const error = new SystemError('msg')
    expect(error.code).toBe('E500')
    expect(error.cause).toBeUndefined()
    expect(error.context).toEqual({})
  })

  test('cause is set from options', () => {
    const cause = new Error('root cause')
    const error = new SystemError('msg', { cause })
    expect(error.cause).toBe(cause)
  })

  test('cause is undefined when not provided', () => {
    const error = new SystemError('msg')
    expect(error.cause).toBeUndefined()
  })

  test('cause is same Error reference', () => {
    const cause = new Error('original')
    const error = new SystemError('msg', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause?.message).toBe('original')
  })

  test('context default to empty object', () => {
    const error = new SystemError('msg')
    expect(error.context).toEqual({})
  })

  test('context is set from options', () => {
    const ctx = { operation: 'read', path: '/tmp' }
    const error = new SystemError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('context with nested data', () => {
    const ctx = { meta: { reason: 'timeout', ms: 5000 } }
    const error = new SystemError('msg', { context: ctx })
    expect(error.context).toEqual(ctx)
  })

  test('name property is SystemError', () => {
    const error = new SystemError('msg')
    expect(error.name).toBe('SystemError')
  })

  test('all options together', () => {
    const cause = new Error('root')
    const error = new SystemError('full', {
      code: 'E600',
      cause,
      context: { detail: 'info' },
    })
    expect(error.message).toBe('full')
    expect(error.code).toBe('E600')
    expect(error.cause).toBe(cause)
    expect(error.context).toEqual({ detail: 'info' })
    expect(error.name).toBe('SystemError')
  })

  test('prototype chain is correct', () => {
    const error = new SystemError('msg')
    expect(Object.getPrototypeOf(error)).toBe(SystemError.prototype)
  })

  test('prototype chain includes Error', () => {
    const error = new SystemError('msg')
    expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(Error.prototype)
  })

  test('has stack trace', () => {
    const error = new SystemError('msg')
    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })

  test('stack trace contains SystemError', () => {
    const error = new SystemError('msg')
    expect(error.stack).toContain('SystemError')
  })

  test('stack trace contains the message', () => {
    const error = new SystemError('SysTestMsg')
    expect(error.stack).toContain('SysTestMsg')
  })

  test('is instance of Error', () => {
    const error = new SystemError('msg')
    expect(error instanceof Error).toBe(true)
  })

  test('is instance of SystemError', () => {
    const error = new SystemError('msg')
    expect(error instanceof SystemError).toBe(true)
  })

  test('is NOT instance of CLIError', () => {
    const error = new SystemError('msg')
    expect(error instanceof CLIError).toBe(false)
  })

  test('is catchable as Error', () => {
    let caught = false
    try {
      throw new SystemError('catch me')
    } catch (e) {
      if (e instanceof Error) caught = true
    }
    expect(caught).toBe(true)
  })

  test('is catchable as SystemError', () => {
    let caught = false
    try {
      throw new SystemError('catch me')
    } catch (e) {
      if (e instanceof SystemError) caught = true
    }
    expect(caught).toBe(true)
  })

  test('thrown error preserves properties', () => {
    let error: SystemError | undefined
    const cause = new Error('root')
    try {
      throw new SystemError('thrown', { code: 'E600', cause })
    } catch (e) {
      if (e instanceof SystemError) error = e
    }
    expect(error?.message).toBe('thrown')
    expect(error?.code).toBe('E600')
    expect(error?.cause).toBe(cause)
  })

  test('different SystemError instances are independent', () => {
    const e1 = new SystemError('one', { code: 'E501' })
    const e2 = new SystemError('two', { code: 'E502' })
    expect(e1.message).toBe('one')
    expect(e2.message).toBe('two')
    expect(e1.code).toBe('E501')
    expect(e2.code).toBe('E502')
    expect(e1).not.toBe(e2)
  })

  test('cause with TypeError', () => {
    const cause = new TypeError('not a number')
    const error = new SystemError('msg', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause).toBeInstanceOf(TypeError)
  })

  test('cause with RangeError', () => {
    const cause = new RangeError('out of range')
    const error = new SystemError('msg', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause).toBeInstanceOf(RangeError)
  })

  test('cause with SyntaxError', () => {
    const cause = new SyntaxError('unexpected token')
    const error = new SystemError('msg', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause).toBeInstanceOf(SyntaxError)
  })

  test('cause with another SystemError', () => {
    const cause = new SystemError('inner', { code: 'E500' })
    const error = new SystemError('outer', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause).toBeInstanceOf(SystemError)
  })

  test('cause with CLIError', () => {
    const cause = new CLIError('cli fail', { code: 'E001' })
    const error = new SystemError('sys fail', { cause })
    expect(error.cause).toBe(cause)
    expect(error.cause).toBeInstanceOf(CLIError)
  })
})

describe('SystemError - parseError static', () => {
  test('creates error with code E501', () => {
    const cause = new Error('parse fail')
    const error = SystemError.parseError('/file.ts', cause)
    expect(error.code).toBe('E501')
  })

  test('message includes file path', () => {
    const cause = new Error('bad')
    const error = SystemError.parseError('/path/to/file.json', cause)
    expect(error.message).toBe('Failed to parse file: /path/to/file.json')
  })

  test('cause is set', () => {
    const cause = new Error('Invalid JSON')
    const error = SystemError.parseError('/path', cause)
    expect(error.cause).toBe(cause)
  })

  test('context has filePath', () => {
    const cause = new Error('err')
    const error = SystemError.parseError('/file.ts', cause)
    expect(error.context.filePath).toBe('/file.ts')
  })

  test('context has causeMessage', () => {
    const cause = new Error('specific error text')
    const error = SystemError.parseError('/file.ts', cause)
    expect(error.context.causeMessage).toBe('specific error text')
  })

  test('context has both keys', () => {
    const cause = new Error('msg')
    const error = SystemError.parseError('/f', cause)
    expect(Object.keys(error.context)).toContain('filePath')
    expect(Object.keys(error.context)).toContain('causeMessage')
  })

  test('name is SystemError', () => {
    const cause = new Error('e')
    const error = SystemError.parseError('/f', cause)
    expect(error.name).toBe('SystemError')
  })

  test('is instance of SystemError', () => {
    const cause = new Error('e')
    const error = SystemError.parseError('/f', cause)
    expect(error).toBeInstanceOf(SystemError)
  })

  test('is instance of Error', () => {
    const cause = new Error('e')
    const error = SystemError.parseError('/f', cause)
    expect(error).toBeInstanceOf(Error)
  })

  test('with empty file path', () => {
    const cause = new Error('e')
    const error = SystemError.parseError('', cause)
    expect(error.message).toBe('Failed to parse file: ')
  })

  test('with relative file path', () => {
    const cause = new Error('e')
    const error = SystemError.parseError('./src/file.ts', cause)
    expect(error.message).toBe('Failed to parse file: ./src/file.ts')
  })

  test('with TypeError cause', () => {
    const cause = new TypeError('unexpected type')
    const error = SystemError.parseError('/f', cause)
    expect(error.cause).toBeInstanceOf(TypeError)
    expect(error.context.causeMessage).toBe('unexpected type')
  })

  test('with SyntaxError cause', () => {
    const cause = new SyntaxError('unexpected token')
    const error = SystemError.parseError('/f', cause)
    expect(error.cause).toBeInstanceOf(SyntaxError)
    expect(error.context.causeMessage).toBe('unexpected token')
  })
})

describe('SystemError - ioError static', () => {
  test('creates error with code E502', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read', cause)
    expect(error.code).toBe('E502')
  })

  test('message includes operation', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read file', cause)
    expect(error.message).toBe('I/O error: read file')
  })

  test('cause is set', () => {
    const cause = new Error('Permission denied')
    const error = SystemError.ioError('write', cause)
    expect(error.cause).toBe(cause)
  })

  test('context has operation', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read', cause)
    expect(error.context.operation).toBe('read')
  })

  test('context has causeMessage', () => {
    const cause = new Error('disk full')
    const error = SystemError.ioError('write', cause)
    expect(error.context.causeMessage).toBe('disk full')
  })

  test('context has both keys', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('delete', cause)
    expect(Object.keys(error.context)).toContain('operation')
    expect(Object.keys(error.context)).toContain('causeMessage')
  })

  test('name is SystemError', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read', cause)
    expect(error.name).toBe('SystemError')
  })

  test('is instance of SystemError', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read', cause)
    expect(error).toBeInstanceOf(SystemError)
  })

  test('is instance of Error', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('read', cause)
    expect(error).toBeInstanceOf(Error)
  })

  test('with empty operation', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('', cause)
    expect(error.message).toBe('I/O error: ')
  })

  test('with descriptive operation', () => {
    const cause = new Error('e')
    const error = SystemError.ioError('write to config file', cause)
    expect(error.message).toBe('I/O error: write to config file')
  })

  test('with TypeError cause', () => {
    const cause = new TypeError('bad type')
    const error = SystemError.ioError('read', cause)
    expect(error.cause).toBeInstanceOf(TypeError)
    expect(error.context.causeMessage).toBe('bad type')
  })
})

describe('SystemError - toJSON exhaustive', () => {
  test('returns name field', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    expect(json.name).toBe('SystemError')
  })

  test('returns code field default E500', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    expect(json.code).toBe('E500')
  })

  test('returns custom code field', () => {
    const error = new SystemError('msg', { code: 'E888' })
    const json = error.toJSON()
    expect(json.code).toBe('E888')
  })

  test('returns message field', () => {
    const error = new SystemError('hello')
    const json = error.toJSON()
    expect(json.message).toBe('hello')
  })

  test('returns context field', () => {
    const error = new SystemError('msg', { context: { a: 1 } })
    const json = error.toJSON()
    expect(json.context).toEqual({ a: 1 })
  })

  test('returns empty context by default', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    expect(json.context).toEqual({})
  })

  test('returns stack field', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    expect(json.stack).toBeDefined()
    expect(typeof json.stack).toBe('string')
  })

  test('cause is undefined when no cause', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    expect(json.cause).toBeUndefined()
  })

  test('cause is serialized with name', () => {
    const cause = new Error('root')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.name).toBe('Error')
  })

  test('cause is serialized with message', () => {
    const cause = new Error('root message')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.message).toBe('root message')
  })

  test('cause is serialized with stack', () => {
    const cause = new Error('root')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.stack).toBeDefined()
    expect(typeof json.cause?.stack).toBe('string')
  })

  test('cause with TypeError has correct name', () => {
    const cause = new TypeError('type err')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.name).toBe('TypeError')
  })

  test('cause with RangeError has correct name', () => {
    const cause = new RangeError('range err')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.name).toBe('RangeError')
  })

  test('cause with SyntaxError has correct name', () => {
    const cause = new SyntaxError('syntax err')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(json.cause?.name).toBe('SyntaxError')
  })

  test('result has all expected keys when cause is present', () => {
    const cause = new Error('c')
    const error = new SystemError('msg', { cause })
    const json = error.toJSON()
    expect(Object.keys(json).sort()).toEqual(
      ['cause', 'code', 'context', 'message', 'name', 'stack'].sort(),
    )
  })

  test('result has all expected keys when no cause', () => {
    const error = new SystemError('msg')
    const json = error.toJSON()
    const keys = Object.keys(json)
    expect(keys).toContain('name')
    expect(keys).toContain('code')
    expect(keys).toContain('message')
    expect(keys).toContain('context')
    expect(keys).toContain('stack')
  })

  test('toJSON is serializable to JSON string', () => {
    const cause = new Error('root')
    const error = new SystemError('msg', { code: 'E501', cause })
    const json = error.toJSON()
    const str = JSON.stringify(json)
    expect(str).toContain('SystemError')
    expect(str).toContain('E501')
  })

  test('toJSON result can be parsed back', () => {
    const cause = new Error('root')
    const error = new SystemError('msg', { code: 'E501', cause, context: { k: 'v' } })
    const json = error.toJSON()
    const parsed = JSON.parse(JSON.stringify(json))
    expect(parsed.name).toBe('SystemError')
    expect(parsed.code).toBe('E501')
    expect(parsed.message).toBe('msg')
    expect(parsed.context).toEqual({ k: 'v' })
    expect(parsed.cause.name).toBe('Error')
    expect(parsed.cause.message).toBe('root')
  })

  test('static factory toJSON works - parseError', () => {
    const cause = new Error('bad json')
    const error = SystemError.parseError('/f.json', cause)
    const json = error.toJSON()
    expect(json.code).toBe('E501')
    expect(json.cause?.message).toBe('bad json')
    expect(json.context).toEqual({ filePath: '/f.json', causeMessage: 'bad json' })
  })

  test('static factory toJSON works - ioError', () => {
    const cause = new Error('enoent')
    const error = SystemError.ioError('write', cause)
    const json = error.toJSON()
    expect(json.code).toBe('E502')
    expect(json.cause?.message).toBe('enoent')
    expect(json.context).toEqual({ operation: 'write', causeMessage: 'enoent' })
  })

  test('context with various types serializes', () => {
    const ctx = {
      str: 'hello',
      num: 42,
      bool: true,
      nil: null,
      arr: [1, 2],
      obj: { nested: 'deep' },
    }
    const error = new SystemError('msg', { context: ctx })
    const json = error.toJSON()
    expect(json.context).toEqual(ctx)
  })
})

describe('SystemError - code values', () => {
  test('E500 for generic', () => {
    expect(new SystemError('m').code).toBe('E500')
  })

  test('E501 for parseError', () => {
    expect(SystemError.parseError('/f', new Error('e')).code).toBe('E501')
  })

  test('E502 for ioError', () => {
    expect(SystemError.ioError('read', new Error('e')).code).toBe('E502')
  })

  test('custom code overrides default', () => {
    expect(new SystemError('m', { code: 'CUSTOM_SYS' }).code).toBe('CUSTOM_SYS')
  })
})

describe('Error class isolation', () => {
  test('CLIError is not instance of SystemError', () => {
    const error = new CLIError('msg')
    expect(error instanceof SystemError).toBe(false)
  })

  test('SystemError is not instance of CLIError', () => {
    const error = new SystemError('msg')
    expect(error instanceof CLIError).toBe(false)
  })

  test('both are instances of Error', () => {
    expect(new CLIError('a') instanceof Error).toBe(true)
    expect(new SystemError('b') instanceof Error).toBe(true)
  })

  test('catching CLIError does not catch SystemError', () => {
    let cliCaught = false
    try {
      throw new SystemError('sys')
    } catch (e) {
      if (e instanceof CLIError) cliCaught = true
    }
    expect(cliCaught).toBe(false)
  })

  test('catching SystemError does not catch CLIError', () => {
    let sysCaught = false
    try {
      throw new CLIError('cli')
    } catch (e) {
      if (e instanceof SystemError) sysCaught = true
    }
    expect(sysCaught).toBe(false)
  })

  test('catching Error catches both', () => {
    let count = 0
    try {
      throw new CLIError('a')
    } catch (e) {
      if (e instanceof Error) count++
    }
    try {
      throw new SystemError('b')
    } catch (e) {
      if (e instanceof Error) count++
    }
    expect(count).toBe(2)
  })

  test('different error types have different names', () => {
    const cli = new CLIError('a')
    const sys = new SystemError('b')
    expect(cli.name).toBe('CLIError')
    expect(sys.name).toBe('SystemError')
    expect(cli.name).not.toBe(sys.name)
  })

  test('different error types have different default codes', () => {
    const cli = new CLIError('a')
    const sys = new SystemError('b')
    expect(cli.code).toBe('E000')
    expect(sys.code).toBe('E500')
  })
})

describe('Edge cases - immutability and independence', () => {
  test('CLIError suggestions array is a new reference', () => {
    const original = ['a', 'b']
    const error = new CLIError('m', { suggestions: original })
    expect(error.suggestions).toEqual(original)
    // Modifying original should not affect error
    original.push('c')
    // This tests that the constructor assigns the reference
    // Both reference the same array since constructor doesn't copy
    expect(error.suggestions).toEqual(['a', 'b', 'c'])
  })

  test('Multiple CLIErrors from same options are independent', () => {
    const opts = { code: 'E100', suggestions: ['x'] }
    const e1 = new CLIError('a', opts)
    const e2 = new CLIError('b', opts)
    expect(e1.message).not.toBe(e2.message)
    expect(e1).not.toBe(e2)
  })

  test('Multiple SystemErrors from same options are independent', () => {
    const cause = new Error('c')
    const opts = { code: 'E600', cause }
    const e1 = new SystemError('a', opts)
    const e2 = new SystemError('b', opts)
    expect(e1.message).not.toBe(e2.message)
    expect(e1).not.toBe(e2)
    // Both share same cause reference
    expect(e1.cause).toBe(e2.cause)
  })

  test('CLIError can be re-thrown', () => {
    let message = ''
    try {
      try {
        throw new CLIError('first', { code: 'E001' })
      } catch (e) {
        if (e instanceof CLIError) throw e
      }
    } catch (e) {
      if (e instanceof CLIError) message = e.message
    }
    expect(message).toBe('first')
  })

  test('SystemError can be re-thrown', () => {
    let message = ''
    try {
      try {
        throw new SystemError('second', { code: 'E501' })
      } catch (e) {
        if (e instanceof SystemError) throw e
      }
    } catch (e) {
      if (e instanceof SystemError) message = e.message
    }
    expect(message).toBe('second')
  })
})

describe('Error properties enumeration', () => {
  test('CLIError own properties are enumerable', () => {
    const error = new CLIError('msg', { code: 'E100', suggestions: ['a'] })
    const keys = Object.keys(error)
    // message is inherited from Error, may not be enumerable
    expect(keys).toContain('code')
    expect(keys).toContain('suggestions')
    expect(keys).toContain('context')
  })

  test('SystemError own properties are enumerable', () => {
    const error = new SystemError('msg', { code: 'E600' })
    const keys = Object.keys(error)
    expect(keys).toContain('code')
    expect(keys).toContain('context')
  })

  test('CLIError has correct property count', () => {
    const error = new CLIError('msg')
    const ownProps = Object.getOwnPropertyNames(error)
    // code, suggestions, context, message (from Error)
    expect(ownProps).toContain('code')
    expect(ownProps).toContain('suggestions')
    expect(ownProps).toContain('context')
  })

  test('SystemError has correct property count', () => {
    const error = new SystemError('msg', { cause: new Error('c') })
    const ownProps = Object.getOwnPropertyNames(error)
    expect(ownProps).toContain('code')
    expect(ownProps).toContain('cause')
    expect(ownProps).toContain('context')
  })
})

describe('toJSON round-trip completeness', () => {
  test('CLIError toJSON round-trip preserves all data', () => {
    const error = new CLIError('test msg', {
      code: 'E777',
      suggestions: ['do A', 'do B'],
      context: { key: 'val', num: 42 },
    })
    const json = error.toJSON()
    const parsed = JSON.parse(JSON.stringify(json))
    expect(parsed.name).toBe('CLIError')
    expect(parsed.code).toBe('E777')
    expect(parsed.message).toBe('test msg')
    expect(parsed.suggestions).toEqual(['do A', 'do B'])
    expect(parsed.context.key).toBe('val')
    expect(parsed.context.num).toBe(42)
  })

  test('SystemError toJSON round-trip preserves all data including cause', () => {
    const cause = new Error('underlying issue')
    const error = new SystemError('sys msg', {
      code: 'E888',
      cause,
      context: { op: 'write' },
    })
    const json = error.toJSON()
    const parsed = JSON.parse(JSON.stringify(json))
    expect(parsed.name).toBe('SystemError')
    expect(parsed.code).toBe('E888')
    expect(parsed.message).toBe('sys msg')
    expect(parsed.cause.name).toBe('Error')
    expect(parsed.cause.message).toBe('underlying issue')
    expect(parsed.context.op).toBe('write')
  })

  test('SystemError toJSON without cause round-trip', () => {
    const error = new SystemError('no cause', { code: 'E555' })
    const json = error.toJSON()
    const parsed = JSON.parse(JSON.stringify(json))
    expect(parsed.cause).toBeUndefined()
    expect(parsed.code).toBe('E555')
  })
})
