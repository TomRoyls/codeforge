import { describe, test, expect } from 'vitest'
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
} from '../../../src/utils/string-helpers.js'

describe('capitalize', () => {
  test('returns empty string unchanged', () => {
    expect(capitalize('')).toBe('')
  })

  test('capitalizes single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('z')).toBe('Z')
  })

  test('capitalizes first character of normal string', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('world')).toBe('World')
    expect(capitalize('testing')).toBe('Testing')
  })

  test('keeps already capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
    expect(capitalize('World')).toBe('World')
    expect(capitalize('A')).toBe('A')
  })

  test('handles single uppercase letter', () => {
    expect(capitalize('A')).toBe('A')
    expect(capitalize('B')).toBe('B')
  })

  test('lowercases remaining characters', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
    expect(capitalize('tEST')).toBe('TEST')
  })

  test('handles numeric strings', () => {
    expect(capitalize('123')).toBe('123')
    expect(capitalize('1test')).toBe('1test')
  })
})

describe('camelCase', () => {
  test('converts snake_case to camelCase', () => {
    expect(camelCase('hello_world')).toBe('helloWorld')
    expect(camelCase('my_variable_name')).toBe('myVariableName')
    expect(camelCase('first_second_third')).toBe('firstSecondThird')
  })

  test('converts kebab-case to camelCase', () => {
    expect(camelCase('hello-world')).toBe('helloWorld')
    expect(camelCase('my-variable-name')).toBe('myVariableName')
    expect(camelCase('first-second-third')).toBe('firstSecondThird')
  })

  test('converts PascalCase to camelCase', () => {
    expect(camelCase('HelloWorld')).toBe('helloWorld')
    expect(camelCase('MyVariableName')).toBe('myVariableName')
    expect(camelCase('FirstSecondThird')).toBe('firstSecondThird')
  })

  test('converts space separated to camelCase', () => {
    expect(camelCase('hello world')).toBe('helloWorld')
    expect(camelCase('my variable name')).toBe('myVariableName')
    expect(camelCase('first second third')).toBe('firstSecondThird')
  })

  test('handles single word', () => {
    expect(camelCase('hello')).toBe('hello')
    expect(camelCase('world')).toBe('world')
  })

  test('handles mixed separators', () => {
    expect(camelCase('hello_world-my test')).toBe('helloWorldMyTest')
  })

  test('handles empty string', () => {
    expect(camelCase('')).toBe('')
  })

  test('handles leading separator', () => {
    expect(camelCase('_hello')).toBe('hello')
    expect(camelCase('-hello')).toBe('hello')
    expect(camelCase(' hello')).toBe('hello')
  })

  test('handles trailing separator', () => {
    expect(camelCase('hello_')).toBe('hello_')
    expect(camelCase('hello-')).toBe('hello-')
    expect(camelCase('hello ')).toBe('hello ')
  })
})

describe('kebabCase', () => {
  test('converts camelCase to kebab-case', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world')
    expect(kebabCase('myVariableName')).toBe('my-variable-name')
    expect(kebabCase('firstSecondThird')).toBe('first-second-third')
  })

  test('converts snake_case to kebab-case', () => {
    expect(kebabCase('hello_world')).toBe('hello-world')
    expect(kebabCase('my_variable_name')).toBe('my-variable-name')
    expect(kebabCase('first_second_third')).toBe('first-second-third')
  })

  test('converts space separated to kebab-case', () => {
    expect(kebabCase('hello world')).toBe('hello-world')
    expect(kebabCase('my variable name')).toBe('my-variable-name')
    expect(kebabCase('first second third')).toBe('first-second-third')
  })

  test('handles single word', () => {
    expect(kebabCase('hello')).toBe('hello')
    expect(kebabCase('world')).toBe('world')
  })

  test('handles mixed separators', () => {
    expect(kebabCase('helloWorld_my test')).toBe('hello-world-my-test')
  })

  test('converts to lowercase', () => {
    expect(kebabCase('HelloWorld')).toBe('hello-world')
    expect(kebabCase('HELLO_WORLD')).toBe('hello-world')
  })

  test('handles empty string', () => {
    expect(kebabCase('')).toBe('')
  })
})

describe('snakeCase', () => {
  test('converts camelCase to snake_case', () => {
    expect(snakeCase('helloWorld')).toBe('hello_world')
    expect(snakeCase('myVariableName')).toBe('my_variable_name')
    expect(snakeCase('firstSecondThird')).toBe('first_second_third')
  })

  test('converts kebab-case to snake_case', () => {
    expect(snakeCase('hello-world')).toBe('hello_world')
    expect(snakeCase('my-variable-name')).toBe('my_variable_name')
    expect(snakeCase('first-second-third')).toBe('first_second_third')
  })

  test('converts space separated to snake_case', () => {
    expect(snakeCase('hello world')).toBe('hello_world')
    expect(snakeCase('my variable name')).toBe('my_variable_name')
    expect(snakeCase('first second third')).toBe('first_second_third')
  })

  test('handles single word', () => {
    expect(snakeCase('hello')).toBe('hello')
    expect(snakeCase('world')).toBe('world')
  })

  test('handles mixed separators', () => {
    expect(snakeCase('helloWorld-my test')).toBe('hello_world_my_test')
  })

  test('converts to lowercase', () => {
    expect(snakeCase('HelloWorld')).toBe('hello_world')
    expect(snakeCase('HELLO-WORLD')).toBe('hello_world')
  })

  test('handles empty string', () => {
    expect(snakeCase('')).toBe('')
  })
})

describe('truncate', () => {
  test('returns short string unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
    expect(truncate('test', 5)).toBe('test')
  })

  test('returns exact length string unchanged', () => {
    expect(truncate('hello', 5)).toBe('hello')
    expect(truncate('test', 4)).toBe('test')
  })

  test('truncates long string with default suffix', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
    expect(truncate('this is a long string', 10)).toBe('this is...')
  })

  test('truncates long string with custom suffix', () => {
    expect(truncate('hello world', 8, '---')).toBe('hello---')
    expect(truncate('testing', 5, '..')).toBe('tes..')
    expect(truncate('truncate me', 8, '***')).toBe('trunc***')
  })

  test('handles empty string', () => {
    expect(truncate('', 10)).toBe('')
  })

  test('handles maxLength less than suffix length', () => {
    expect(truncate('hello', 2, '...')).toBe('hell...')
  })

  test('handles exact suffix length', () => {
    expect(truncate('test', 3, '...')).toBe('...')
  })

  test('handles single character string', () => {
    expect(truncate('a', 3)).toBe('a')
  })
})

describe('trimLines', () => {
  test('collapses multiple blank lines', () => {
    expect(trimLines('line1\n\n\nline2')).toBe('line1\n\nline2')
    expect(trimLines('a\n\n\n\nb')).toBe('a\n\nb')
  })

  test('trims leading and trailing whitespace', () => {
    expect(trimLines('  line1\n  line2  ')).toBe('line1\nline2')
    expect(trimLines('  hello  \n  world  ')).toBe('hello\nworld')
  })

  test('handles single line', () => {
    expect(trimLines('  hello world  ')).toBe('hello world')
  })

  test('handles empty string', () => {
    expect(trimLines('')).toBe('')
  })

  test('handles only whitespace', () => {
    expect(trimLines('   \n   \n   ')).toBe('')
  })

  test('preserves single blank lines', () => {
    expect(trimLines('line1\n\nline2')).toBe('line1\n\nline2')
  })

  test('handles mixed line endings', () => {
    expect(trimLines('line1  \n  line2\n  line3')).toBe('line1\nline2\nline3')
  })
})

describe('indent', () => {
  test('indents multi-line string', () => {
    expect(indent('line1\nline2\nline3', 2)).toBe('  line1\n  line2\n  line3')
    expect(indent('hello\nworld', 4)).toBe('    hello\n    world')
  })

  test('preserves empty lines', () => {
    expect(indent('line1\n\nline2', 2)).toBe('  line1\n\n  line2')
    expect(indent('a\n\n\nb', 4)).toBe('    a\n\n\n    b')
  })

  test('handles single line', () => {
    expect(indent('hello world', 2)).toBe('  hello world')
  })

  test('handles empty string', () => {
    expect(indent('', 2)).toBe('')
  })

  test('handles zero spaces', () => {
    expect(indent('line1\nline2', 0)).toBe('line1\nline2')
  })

  test('handles multiple spaces', () => {
    expect(indent('test', 8)).toBe('        test')
  })

  test('handles trailing newline', () => {
    expect(indent('line1\nline2\n', 2)).toBe('  line1\n  line2\n')
  })
})

describe('isBlank', () => {
  test('returns true for empty string', () => {
    expect(isBlank('')).toBe(true)
  })

  test('returns true for whitespace only', () => {
    expect(isBlank('   ')).toBe(true)
    expect(isBlank('\t')).toBe(true)
    expect(isBlank('\n')).toBe(true)
    expect(isBlank(' \t\n ')).toBe(true)
  })

  test('returns false for content', () => {
    expect(isBlank('hello')).toBe(false)
    expect(isBlank('hello world')).toBe(false)
    expect(isBlank('a')).toBe(false)
  })

  test('returns false for mixed whitespace and content', () => {
    expect(isBlank('  hello  ')).toBe(false)
    expect(isBlank('  test')).toBe(false)
    expect(isBlank('test  ')).toBe(false)
  })
})

describe('stripAnsi', () => {
  test('removes ANSI color codes', () => {
    expect(stripAnsi('\x1b[31mred\x1b[0m')).toBe('red')
    expect(stripAnsi('\x1b[32mgreen\x1b[0m')).toBe('green')
    expect(stripAnsi('\x1b[33myellow\x1b[0m')).toBe('yellow')
  })

  test('removes multiple color codes', () => {
    expect(stripAnsi('\x1b[31m\x1b[1mbold red\x1b[0m')).toBe('bold red')
  })

  test('returns string unchanged without codes', () => {
    expect(stripAnsi('hello world')).toBe('hello world')
    expect(stripAnsi('test')).toBe('test')
  })

  test('handles empty string', () => {
    expect(stripAnsi('')).toBe('')
  })

  test('handles string with codes and text', () => {
    expect(stripAnsi('start \x1b[31mred\x1b[0m end')).toBe('start red end')
  })
})

describe('escapeRegex', () => {
  test('escapes special regex characters', () => {
    expect(escapeRegex('test.file')).toBe('test\\.file')
    expect(escapeRegex('a+b')).toBe('a\\+b')
    expect(escapeRegex('a?b')).toBe('a\\?b')
    expect(escapeRegex('a*b')).toBe('a\\*b')
    expect(escapeRegex('a^b')).toBe('a\\^b')
    expect(escapeRegex('a$b')).toBe('a\\$b')
    expect(escapeRegex('a{b}')).toBe('a\\{b\\}')
    expect(escapeRegex('a(b)')).toBe('a\\(b\\)')
    expect(escapeRegex('a|b')).toBe('a\\|b')
    expect(escapeRegex('a[b]')).toBe('a\\[b\\]')
    expect(escapeRegex('a\\b')).toBe('a\\\\b')
  })

  test('keeps normal string unchanged', () => {
    expect(escapeRegex('hello world')).toBe('hello world')
    expect(escapeRegex('test123')).toBe('test123')
  })

  test('handles empty string', () => {
    expect(escapeRegex('')).toBe('')
  })

  test('escapes all special characters in one string', () => {
    expect(escapeRegex('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
  })
})

describe('countLines', () => {
  test('counts single line', () => {
    expect(countLines('hello')).toBe(1)
    expect(countLines('world')).toBe(1)
  })

  test('counts multiple lines', () => {
    expect(countLines('line1\nline2')).toBe(2)
    expect(countLines('a\nb\nc')).toBe(3)
  })

  test('handles trailing newline', () => {
    expect(countLines('hello\n')).toBe(2)
    expect(countLines('line1\nline2\n')).toBe(3)
  })

  test('handles empty string', () => {
    expect(countLines('')).toBe(1)
  })

  test('handles only newlines', () => {
    expect(countLines('\n\n')).toBe(3)
    expect(countLines('\n')).toBe(2)
  })
})

describe('wordWrap', () => {
  test('returns short line unchanged', () => {
    expect(wordWrap('hello', 10)).toBe('hello')
    expect(wordWrap('test', 5)).toBe('test')
  })

  test('wraps long line at word boundary', () => {
    expect(wordWrap('hello world test', 10)).toBe('hello\nworld test')
    expect(wordWrap('this is a long line', 8)).toBe('this is\na long\nline')
  })

  test('wraps word at boundary when no space available', () => {
    expect(wordWrap('verylongword', 5)).toBe('veryl\nongwo\nrd')
    expect(wordWrap('abcdefg', 3)).toBe('abc\ndef\ng')
  })

  test('returns original string when width < 1', () => {
    expect(wordWrap('hello world', 0)).toBe('hello world')
    expect(wordWrap('test', -1)).toBe('test')
  })

  test('handles empty string', () => {
    expect(wordWrap('', 10)).toBe('')
  })

  test('preserves existing newlines', () => {
    expect(wordWrap('hello\nworld', 10)).toBe('hello\nworld')
    expect(wordWrap('first line\nsecond line', 5)).toBe('first\nline\nsecon\nd\nline')
  })

  test('handles exact width match', () => {
    expect(wordWrap('hello', 5)).toBe('hello')
    expect(wordWrap('world', 5)).toBe('world')
  })

  test('handles leading and trailing spaces', () => {
    expect(wordWrap('  hello  world  ', 10)).toBe('  hello \nworld  ')
  })
})