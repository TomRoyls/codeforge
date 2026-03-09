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
