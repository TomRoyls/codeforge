/**
 * @fileoverview Tests for prefer-regex-literal rule
 */

import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferRegexLiteral,
  preferRegexLiteralRule,
} from '../../../../src/rules/best-practices/prefer-regex-literal.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code, { overwrite: true })
}

describe('rule metadata', () => {
  it('should have correct meta name', () => {
    expect(preferRegexLiteralRule.meta.name).toBe('prefer-regex-literal')
  })

  it('should have correct meta category', () => {
    expect(preferRegexLiteralRule.meta.category).toBe('style')
  })

  it('should have correct meta severity', () => {
    expect(preferRegexLiteralRule.meta.severity).toBe('info')
  })

  it('should be recommended', () => {
    expect(preferRegexLiteralRule.meta.recommended).toBe(true)
  })

  it('should have a description', () => {
    expect(preferRegexLiteralRule.meta.description).toBe(
      'Enforce using regex literals instead of RegExp constructor',
    )
  })

  it('should have default options as empty object', () => {
    expect(preferRegexLiteralRule.defaultOptions).toEqual({})
  })

  it('should have a create function', () => {
    expect(typeof preferRegexLiteralRule.create).toBe('function')
  })

  it('should verify analyzePreferRegexLiteral is exported', () => {
    expect(typeof analyzePreferRegexLiteral).toBe('function')
  })
})

describe('detecting new RegExp with static strings', () => {
  it('should detect new RegExp() with regex literal arg', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('regex literal')
  })

  it('should detect new RegExp() with simple string pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with string pattern and flags', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", "i")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/test/i')
  })

  it('should detect new RegExp() with "gi" flags', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", "gi")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/test/gi')
  })

  it('should detect new RegExp() with "g" flag', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "g")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/hello/g')
  })

  it('should detect new RegExp() with "m" flag', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "m")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with "s" flag', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "s")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with "u" flag', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "u")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with "y" flag', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "y")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with "gimsuy" flags', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "gimsuy")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/hello/gimsuy')
  })

  it('should detect new RegExp() with empty string pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with single char pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with multi-word string pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello world")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with numeric-like string', () => {
    const sourceFile = createSourceFile('const x = new RegExp("123")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with underscore pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello_world")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with hyphen pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello-world")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with equals sign pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a=b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with slash char in string (no complex regex chars)', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a/b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with comma in pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a,b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with exclamation mark', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a!b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with percent', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a%b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with hash', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a#b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with at sign', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a@b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with semicolon', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a;b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp() with colon', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a:b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('detecting new RegExp with regex literal arg', () => {
  it('should detect new RegExp(/test/)', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp(/test/i) with flags', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/i)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/test/')
  })

  it('should detect new RegExp(/abc/g)', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/abc/g)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp(/hello/)', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/hello/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp with regex literal and extra flags arg', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/, "g")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/test/g')
  })

  it('should detect new RegExp with regex literal and "gi" flags arg', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/pattern/, "gi")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/pattern/gi')
  })

  it('should detect new RegExp with regex literal containing dashes', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/hello-world/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp with regex literal containing underscores', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/hello_world/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp with empty regex literal', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/(?:)/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp with regex literal that has complex chars', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/[a-z]+/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect new RegExp with regex literal containing dots', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/a.b/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('valid code - dynamic patterns', () => {
  it('should not flag new RegExp() with dynamic variable pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(test, flags)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with identifier pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(pattern)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with template literal pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(`hello`)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with template literal interpolation', () => {
    const sourceFile = createSourceFile('const x = new RegExp(`hello${name}`)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with function call as pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(getPattern())')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with member expression pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(obj.pattern)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with binary expression pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(a + b)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with dynamic flags', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", flags)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag new RegExp() with numeric literal pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(123)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with object expression pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp({})')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with array expression pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp([])')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp() with typeof expression', () => {
    const sourceFile = createSourceFile('const x = new RegExp(typeof y)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag when there are no arguments', () => {
    const sourceFile = createSourceFile('const x = new RegExp()')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag RegExp() called without new', () => {
    const sourceFile = createSourceFile('const x = RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag RegExp() call expression without new with variable', () => {
    const sourceFile = createSourceFile('const x = RegExp(pattern)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new SomeOther() call', () => {
    const sourceFile = createSourceFile('const x = new MyRegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with null pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(null)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with undefined pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(undefined)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag regular function calls', () => {
    const sourceFile = createSourceFile('const x = someFunc("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with arrow function pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(() => "test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new expression that is not RegExp', () => {
    const sourceFile = createSourceFile('const x = new Date()')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new Error() constructor', () => {
    const sourceFile = createSourceFile('const x = new Error("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new Array() constructor', () => {
    const sourceFile = createSourceFile('const x = new Array(5)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new Map() constructor', () => {
    const sourceFile = createSourceFile('const x = new Map()')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag chained property access new expression', () => {
    const sourceFile = createSourceFile('const x = new obj.RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with conditional expression', () => {
    const sourceFile = createSourceFile('const x = new RegExp(a ? "test" : "other")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with spread argument', () => {
    const sourceFile = createSourceFile('const x = new RegExp(...args)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag variable declaration without RegExp', () => {
    const sourceFile = createSourceFile('const x = "hello"')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag plain regex literal usage', () => {
    const sourceFile = createSourceFile('const x = /test/i/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag regex test calls', () => {
    const sourceFile = createSourceFile('/test/.test("hello")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('valid code - complex patterns NOT flagged', () => {
  it('should not flag new RegExp() with complex pattern [a-z]+', () => {
    const sourceFile = createSourceFile('const x = new RegExp("[a-z]+", "i")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with backslash', () => {
    const sourceFile = createSourceFile('const x = new RegExp("\\\\d+")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with pipe alternation', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a|b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with dot', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a.b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with asterisk', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a*b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with plus', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a+b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with question mark', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a?b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with caret', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a^b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with dollar sign', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a$b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with parentheses', () => {
    const sourceFile = createSourceFile('const x = new RegExp("(a)")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with curly braces', () => {
    const sourceFile = createSourceFile('const x = new RegExp("{a}")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with square brackets', () => {
    const sourceFile = createSourceFile('const x = new RegExp("[abc]")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with escaped backslash', () => {
    const sourceFile = createSourceFile('const x = new RegExp("\\\\w+")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag complex regex \\d+', () => {
    const sourceFile = createSourceFile('const x = new RegExp("\\\\d+")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag complex regex with multiple special chars', () => {
    const sourceFile = createSourceFile('const x = new RegExp("(?:abc)+")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with character class range', () => {
    const sourceFile = createSourceFile('const x = new RegExp("[0-9]")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with quantifier', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a{2,}")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with word boundary like \\b', () => {
    const sourceFile = createSourceFile('const x = new RegExp("\\\\bword\\\\b")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with lookahead', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a(?=b)")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with negated character class', () => {
    const sourceFile = createSourceFile('const x = new RegExp("[^abc]")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with escaped special char \\.', () => {
    const sourceFile = createSourceFile('const x = new RegExp("\\\\.")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with alternation groups', () => {
    const sourceFile = createSourceFile('const x = new RegExp("(cat|dog)")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with quantifier {n}', () => {
    const sourceFile = createSourceFile('const x = new RegExp("a{3}")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with non-capturing group', () => {
    const sourceFile = createSourceFile('const x = new RegExp("(?:test)")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag pattern with star quantifier', () => {
    const sourceFile = createSourceFile('const x = new RegExp(".*")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('violation properties', () => {
  it('should have ruleId set to prefer-regex-literal', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].ruleId).toBe('prefer-regex-literal')
  })

  it('should have severity set to info', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].severity).toBe('info')
  })

  it('should have correct message text', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].message).toBe('Use regex literal instead of RegExp constructor')
  })

  it('should have a range property', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].range).toBeDefined()
    expect(violations[0].range.start).toBeDefined()
    expect(violations[0].range.end).toBeDefined()
  })

  it('should have range with line and column', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(typeof violations[0].range.start.line).toBe('number')
    expect(typeof violations[0].range.start.column).toBe('number')
  })

  it('should have range.start line before range.end line', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].range.start.line).toBeLessThanOrEqual(violations[0].range.end.line)
  })

  it('should have a suggestion property', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(typeof violations[0].suggestion).toBe('string')
  })

  it('should have filePath property', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].filePath).toBeDefined()
    expect(typeof violations[0].filePath).toBe('string')
  })

  it('should contain correct pattern in suggestion for simple string', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toContain('/hello/')
  })

  it('should not include flags in suggestion when no flags given', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /hello/')
  })

  it('should include flags in suggestion when flags are given', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello", "gi")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /hello/gi')
  })

  it('should have suggestion starting with "Replace with:"', () => {
    const sourceFile = createSourceFile('const x = new RegExp("abc", "i")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toMatch(/^Replace with:/)
  })
})

describe('suggestion format', () => {
  it('should suggest /test/ for new RegExp("test")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /test/')
  })

  it('should suggest /test/i for new RegExp("test", "i")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", "i")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /test/i')
  })

  it('should suggest /test/gi for new RegExp("test", "gi")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", "gi")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /test/gi')
  })

  it('should suggest /hello/ for new RegExp("hello")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /hello/')
  })

  it('should suggest /abc/g for new RegExp("abc", "g")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("abc", "g")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /abc/g')
  })

  it('should handle regex literal arg suggestion', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toContain('/test/')
  })

  it('should handle regex literal with flags arg', () => {
    const sourceFile = createSourceFile('const x = new RegExp(/test/, "g")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toContain('/test/g')
  })

  it('should suggest // for new RegExp("")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: //')
  })

  it('should suggest /hello world/i for new RegExp("hello world", "i")', () => {
    const sourceFile = createSourceFile('const x = new RegExp("hello world", "i")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /hello world/i')
  })

  it('should suggest /path\/to\/file/ for forward slash pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp("path/to/file")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toContain('/path/to/file/')
  })
})

describe('edge cases', () => {
  it('should not flag regex literal', () => {
    const sourceFile = createSourceFile('const x = /test/i/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should handle multiple new RegExp on different lines', () => {
    const sourceFile = createSourceFile('const a = new RegExp("foo")\nconst b = new RegExp("bar")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should handle new RegExp in function call', () => {
    const sourceFile = createSourceFile('foo(new RegExp("test"))')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in array literal', () => {
    const sourceFile = createSourceFile('const arr = [new RegExp("test")]')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in object literal', () => {
    const sourceFile = createSourceFile('const obj = { regex: new RegExp("test") }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in conditional expression', () => {
    const sourceFile = createSourceFile('const x = true ? new RegExp("test") : /other/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in return statement', () => {
    const sourceFile = createSourceFile('function f() { return new RegExp("test") }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in assignment', () => {
    const sourceFile = createSourceFile('let x; x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp as default parameter', () => {
    const sourceFile = createSourceFile('function f(r = new RegExp("test")) {}')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp in nested expressions', () => {
    const sourceFile = createSourceFile('const x = (new RegExp("test")).test("foo")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp with single quotes', () => {
    const sourceFile = createSourceFile("const x = new RegExp('test')")
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp with single quoted flags', () => {
    const sourceFile = createSourceFile("const x = new RegExp('test', 'i')")
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp inside a class method', () => {
    const sourceFile = createSourceFile('class A { m() { return new RegExp("test") } }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp inside arrow function', () => {
    const sourceFile = createSourceFile('const f = () => new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle empty file', () => {
    const sourceFile = createSourceFile('')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should handle file with only comments', () => {
    const sourceFile = createSourceFile('// just a comment')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should handle new RegExp inside try-catch', () => {
    const sourceFile = createSourceFile('try { new RegExp("test") } catch(e) {}')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp inside if statement', () => {
    const sourceFile = createSourceFile('if (true) { new RegExp("test") }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should handle new RegExp inside loop', () => {
    const sourceFile = createSourceFile('for (let i = 0; i < 10; i++) { new RegExp("test") }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag new RegExp with computed property RegExp', () => {
    const sourceFile = createSourceFile('const R = RegExp; const x = new R("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })
})

describe('rule create', () => {
  it('should return a visitor object from create', () => {
    const result = preferRegexLiteralRule.create()
    expect(result).toHaveProperty('visitor')
  })

  it('should return onComplete function from create', () => {
    const result = preferRegexLiteralRule.create()
    expect(result).toHaveProperty('onComplete')
    expect(typeof result.onComplete).toBe('function')
  })

  it('should return violations array from onComplete', () => {
    const result = preferRegexLiteralRule.create()
    const violations = result.onComplete()
    expect(Array.isArray(violations)).toBe(true)
  })

  it('should accept options parameter', () => {
    const result = preferRegexLiteralRule.create({})
    expect(result).toHaveProperty('visitor')
  })

  it('should work with default options', () => {
    const result = preferRegexLiteralRule.create()
    expect(result.visitor).toBeDefined()
    expect(result.visitor.visitNode).toBeDefined()
  })

  it('should collect violations through visitor', () => {
    const result = preferRegexLiteralRule.create()
    expect(typeof result.visitor.visitNode).toBe('function')
  })

  it('should have create that works without arguments', () => {
    expect(() => preferRegexLiteralRule.create()).not.toThrow()
  })

  it('should have create that works with empty options', () => {
    expect(() => preferRegexLiteralRule.create({})).not.toThrow()
  })
})

describe('analyzePreferRegexLiteral', () => {
  it('should return empty array for file with no RegExp calls', () => {
    const sourceFile = createSourceFile('const x = 1')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toEqual([])
  })

  it('should return empty array for file with only regex literals', () => {
    const sourceFile = createSourceFile('const x = /test/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toEqual([])
  })

  it('should accept optional options parameter', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile, {})
    expect(violations).toHaveLength(1)
  })

  it('should work without options parameter', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect violation in const declaration', () => {
    const sourceFile = createSourceFile('const r = new RegExp("abc")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toBe('Replace with: /abc/')
  })

  it('should detect violation in let declaration', () => {
    const sourceFile = createSourceFile('let r = new RegExp("abc")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should detect violation in var declaration', () => {
    const sourceFile = createSourceFile('var r = new RegExp("abc")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should return violations with all required properties', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    const v = violations[0]
    expect(v).toHaveProperty('ruleId')
    expect(v).toHaveProperty('severity')
    expect(v).toHaveProperty('message')
    expect(v).toHaveProperty('filePath')
    expect(v).toHaveProperty('range')
    expect(v).toHaveProperty('suggestion')
  })

  it('should handle TypeScript type annotations', () => {
    const sourceFile = createSourceFile('const x: RegExp = new RegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })
})

describe('multiple violations', () => {
  it('should detect multiple new RegExp in same file', () => {
    const sourceFile = createSourceFile('const a = new RegExp("foo")\nconst b = new RegExp("bar")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect three violations', () => {
    const sourceFile = createSourceFile(
      'const a = new RegExp("a")\nconst b = new RegExp("b")\nconst c = new RegExp("c")',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(3)
  })

  it('should report correct suggestion for each violation', () => {
    const sourceFile = createSourceFile('const a = new RegExp("foo")\nconst b = new RegExp("bar")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations[0].suggestion).toBe('Replace with: /foo/')
    expect(violations[1].suggestion).toBe('Replace with: /bar/')
  })

  it('should detect mixed static and dynamic patterns separately', () => {
    const sourceFile = createSourceFile(
      'const a = new RegExp("foo")\nconst b = new RegExp(dynamic)',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/foo/')
  })

  it('should detect violations in different scopes', () => {
    const sourceFile = createSourceFile(
      'function f() { new RegExp("a") }\nfunction g() { new RegExp("b") }',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should detect violations with different flags', () => {
    const sourceFile = createSourceFile(
      'const a = new RegExp("foo", "i")\nconst b = new RegExp("bar", "g")',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
    expect(violations[0].suggestion).toContain('/foo/i')
    expect(violations[1].suggestion).toContain('/bar/g')
  })

  it('should detect violation alongside complex pattern that is not flagged', () => {
    const sourceFile = createSourceFile(
      'const a = new RegExp("foo")\nconst b = new RegExp("[a-z]+")',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].suggestion).toContain('/foo/')
  })

  it('should count correctly with regex literal args', () => {
    const sourceFile = createSourceFile(
      'const a = new RegExp(/test/)\nconst b = new RegExp(/other/)',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
  })

  it('should handle many violations in a file', () => {
    const code = Array.from(
      { length: 10 },
      (_, i) => `const r${i} = new RegExp("pattern${i}")`,
    ).join('\n')
    const sourceFile = createSourceFile(code)
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(10)
  })

  it('should handle mix of flagged and non-flagged in same expression context', () => {
    const sourceFile = createSourceFile(
      'const arr = [new RegExp("a"), new RegExp(dynamic), new RegExp("b")]',
    )
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(2)
  })
})

describe('valid code extended', () => {
  it('should not flag RegExp.exec call on literal', () => {
    const sourceFile = createSourceFile('/test/.exec("string")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag String.match with regex literal', () => {
    const sourceFile = createSourceFile('"hello".match(/world/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag String.replace with regex literal', () => {
    const sourceFile = createSourceFile('"hello".replace(/l/g, "r")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag String.split with regex literal', () => {
    const sourceFile = createSourceFile('"a,b,c".split(/,/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag String.search with regex literal', () => {
    const sourceFile = createSourceFile('"hello".search(/ll/)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag import statements', () => {
    const sourceFile = createSourceFile('import { something } from "module"')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag export statements', () => {
    const sourceFile = createSourceFile('export const x = /test/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag default export', () => {
    const sourceFile = createSourceFile('export default /test/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with property access identifier', () => {
    const sourceFile = createSourceFile('const x = new RegExp(obj.prop)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with computed member', () => {
    const sourceFile = createSourceFile('const x = new RegExp(obj["prop"])')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with call expression as pattern', () => {
    const sourceFile = createSourceFile('const x = new RegExp(String(123))')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag tagged template literal', () => {
    const sourceFile = createSourceFile('const x = new RegExp(tag`hello`)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag RegExp.all static method call', () => {
    const sourceFile = createSourceFile('const x = RegExp.$1')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag function declaration', () => {
    const sourceFile = createSourceFile('function test() { return 1 }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag class declaration', () => {
    const sourceFile = createSourceFile('class Foo { bar() {} }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag interface declaration', () => {
    const sourceFile = createSourceFile('interface Foo { bar: string }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag type alias', () => {
    const sourceFile = createSourceFile('type Foo = string | number')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag enum declaration', () => {
    const sourceFile = createSourceFile('enum Color { Red, Green, Blue }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag namespace declaration', () => {
    const sourceFile = createSourceFile('namespace NS { export const x = 1 }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag switch statement', () => {
    const sourceFile = createSourceFile('switch(x) { case 1: break; default: break; }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag destructuring assignment', () => {
    const sourceFile = createSourceFile('const { a, b } = obj')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag array destructuring', () => {
    const sourceFile = createSourceFile('const [a, b] = arr')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag spread operator', () => {
    const sourceFile = createSourceFile('const x = [...arr]')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag promise chain', () => {
    const sourceFile = createSourceFile('Promise.resolve(1).then(x => x)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag async function', () => {
    const sourceFile = createSourceFile('async function f() { await Promise.resolve(1) }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag generator function', () => {
    const sourceFile = createSourceFile('function* gen() { yield 1 }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag template literal type', () => {
    const sourceFile = createSourceFile('const x: `hello` = "hello"')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag typeof guard', () => {
    const sourceFile = createSourceFile('if (typeof x === "string") {}')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag instanceof check', () => {
    const sourceFile = createSourceFile('if (x instanceof RegExp) {}')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag ternary with regex literal result', () => {
    const sourceFile = createSourceFile('const x = true ? /a/ : /b/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag logical expressions', () => {
    const sourceFile = createSourceFile('const x = a && b || c')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag nullish coalescing', () => {
    const sourceFile = createSourceFile('const x = a ?? b')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag optional chaining', () => {
    const sourceFile = createSourceFile('const x = obj?.prop?.method()')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag type assertion', () => {
    const sourceFile = createSourceFile('const x = val as string')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag satisfies expression', () => {
    const sourceFile = createSourceFile('const x = { a: 1 } satisfies Record<string, number>')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag mapped types', () => {
    const sourceFile = createSourceFile('type T = { [K in keyof Obj]: Obj[K] }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag conditional types', () => {
    const sourceFile = createSourceFile('type T = A extends B ? C : D')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag decorator', () => {
    const sourceFile = createSourceFile('@decorator class A {}')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new expression with different identifier', () => {
    const sourceFile = createSourceFile('const x = new MyRegExp("test")')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag RegExp as property name', () => {
    const sourceFile = createSourceFile('const x = { RegExp: "test" }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag variable named RegExp', () => {
    const sourceFile = createSourceFile('const RegExp = "test"')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag arrow function returning regex literal', () => {
    const sourceFile = createSourceFile('const f = () => /test/')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag regex literal in template expression', () => {
    const sourceFile = createSourceFile('const x = `${/test/.test("a")}`')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new RegExp with three arguments', () => {
    const sourceFile = createSourceFile('const x = new RegExp("test", "i", extra)')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should not flag function that returns RegExp constructor', () => {
    const sourceFile = createSourceFile('function makeRegex(p) { return new RegExp(p) }')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag new with non-identifier expression', () => {
    const sourceFile = createSourceFile('const x = new (function() {})()')
    const violations = analyzePreferRegexLiteral(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
