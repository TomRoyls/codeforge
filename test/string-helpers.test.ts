import { describe, it, expect } from 'vitest'
import {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  trimLines,
  indent,
  isBlank,
  stripAnsi,
  escapeRegex,
  countLines,
  wordWrap,
} from '../src/utils/string-helpers.js'

describe('string-helpers', () => {
  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('handles already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    it('only capitalizes first character', () => {
      expect(capitalize('hello World')).toBe('Hello World')
    })
  })

  describe('camelCase', () => {
    it('converts snake_case', () => {
      expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('converts kebab-case', () => {
      expect(camelCase('hello-world')).toBe('helloWorld')
    })

    it('converts space separated', () => {
      expect(camelCase('hello world')).toBe('helloWorld')
    })

    it('handles leading uppercase', () => {
      expect(camelCase('HelloWorld')).toBe('helloWorld')
    })

    it('handles already camelCase', () => {
      expect(camelCase('helloWorld')).toBe('helloWorld')
    })
  })

  describe('kebabCase', () => {
    it('converts camelCase', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world')
    })

    it('converts snake_case', () => {
      expect(kebabCase('hello_world')).toBe('hello-world')
    })

    it('converts spaces', () => {
      expect(kebabCase('hello world')).toBe('hello-world')
    })
  })

  describe('snakeCase', () => {
    it('converts camelCase', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world')
    })

    it('converts kebab-case', () => {
      expect(snakeCase('hello-world')).toBe('hello_world')
    })

    it('converts spaces', () => {
      expect(snakeCase('hello world')).toBe('hello_world')
    })
  })

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World!', 8)).toBe('Hello...')
    })

    it('does not truncate short strings', () => {
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('uses custom suffix', () => {
      expect(truncate('Hello World!', 8, '…')).toBe('Hello W…')
    })

    it('handles exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })
  })

  describe('trimLines', () => {
    it('trims each line', () => {
      expect(trimLines('  hello  \n  world  ')).toBe('hello\nworld')
    })

    it('collapses multiple blank lines', () => {
      expect(trimLines('hello\n\n\n\nworld')).toBe('hello\n\nworld')
    })

    it('handles leading/trailing whitespace', () => {
      expect(trimLines('\n  hello  \n')).toBe('hello')
    })
  })

  describe('indent', () => {
    it('indents all lines', () => {
      expect(indent('hello\nworld', 2)).toBe('  hello\n  world')
    })

    it('preserves empty lines', () => {
      expect(indent('hello\n\nworld', 4)).toBe('    hello\n\n    world')
    })

    it('handles zero indent', () => {
      expect(indent('hello', 0)).toBe('hello')
    })
  })

  describe('isBlank', () => {
    it('returns true for whitespace-only', () => {
      expect(isBlank('   ')).toBe(true)
      expect(isBlank('\t\n')).toBe(true)
    })

    it('returns false for non-blank', () => {
      expect(isBlank('hello')).toBe(false)
    })

    it('returns true for empty string', () => {
      expect(isBlank('')).toBe(true)
    })
  })

  describe('stripAnsi', () => {
    it('removes ANSI escape codes', () => {
      expect(stripAnsi('\x1b[31mhello\x1b[0m')).toBe('hello')
    })

    it('handles string without ANSI', () => {
      expect(stripAnsi('hello')).toBe('hello')
    })

    it('removes multiple codes', () => {
      expect(stripAnsi('\x1b[1m\x1b[31mred bold\x1b[0m')).toBe('red bold')
    })
  })

  describe('escapeRegex', () => {
    it('escapes special characters', () => {
      expect(escapeRegex('hello.world')).toBe('hello\\.world')
      expect(escapeRegex('a*b+c?')).toBe('a\\*b\\+c\\?')
    })

    it('handles brackets and pipes', () => {
      expect(escapeRegex('[test]')).toBe('\\[test\\]')
      expect(escapeRegex('a|b')).toBe('a\\|b')
    })

    it('leaves normal text unchanged', () => {
      expect(escapeRegex('hello')).toBe('hello')
    })

    it('produces valid regex pattern', () => {
      const special = 'file.test.js'
      const escaped = escapeRegex(special)
      const regex = new RegExp(`^${escaped}$`)
      expect(regex.test('file.test.js')).toBe(true)
      expect(regex.test('fileXtestXjs')).toBe(false)
    })
  })

  describe('countLines', () => {
    it('counts single line', () => {
      expect(countLines('hello')).toBe(1)
    })

    it('counts multiple lines', () => {
      expect(countLines('hello\nworld')).toBe(2)
    })

    it('counts trailing newline', () => {
      expect(countLines('hello\n')).toBe(2)
    })

    it('handles empty string', () => {
      expect(countLines('')).toBe(1)
    })
  })

  describe('wordWrap', () => {
    it('wraps long lines', () => {
      expect(wordWrap('hello world', 5)).toBe('hello\nworld')
    })

    it('does not wrap short lines', () => {
      expect(wordWrap('hi', 10)).toBe('hi')
    })

    it('preserves existing newlines', () => {
      expect(wordWrap('hello\nworld', 10)).toBe('hello\nworld')
    })

    it('handles width < 1', () => {
      expect(wordWrap('hello', 0)).toBe('hello')
    })

    it('wraps at word boundaries', () => {
      const result = wordWrap('the quick brown fox', 10)
      expect(result).toBe('the quick\nbrown fox')
    })
  })
})
