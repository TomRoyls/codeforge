import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferStringStartEnd,
  preferStringStartEndRule,
} from '../../../../src/rules/best-practices/prefer-string-start-end.js'

const createSourceFile = (code: string) => {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

describe('rule metadata', () => {
  it('should have correct meta properties', () => {
    expect(preferStringStartEndRule.meta.name).toBe('prefer-string-start-end')
    expect(preferStringStartEndRule.meta.category).toBe('style')
  })
})

describe('detecting String concatenation', () => {
  it('should detect string concatenation with + operator', () => {
    const sourceFile = createSourceFile("'hello' + name")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('template literal')
  })

  it('should detect string concatenation with variable', () => {
    const sourceFile = createSourceFile("const greeting = 'hello' + ' ' + name")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(1)
  })

  it('should provide suggestion', () => {
    const sourceFile = createSourceFile("const greeting = 'hello' + name;")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations[0].suggestion).toBeDefined()
    expect(violations[0].suggestion).toContain('template literal')
  })
})

describe('valid cases', () => {
  it('should not flag template literals', () => {
    const sourceFile = createSourceFile("'hello world'")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag already split strings', () => {
    const sourceFile = createSourceFile(
      "const parts = ['hello', 'world'];\nconst result = parts.join(' ');",
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag concat on existing array', () => {
    const sourceFile = createSourceFile(
      "const items = ['a', 'b', 'c'];\nconst result = items.concat(['d', 'e'])",
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.slice', () => {
    const sourceFile = createSourceFile(
      "const greeting = names.slice(0, 2).join(', ' and ' world');",
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag String.raw', () => {
    const sourceFile = createSourceFile("const raw = String.raw('hello')")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })

  it('should not flag string split', () => {
    const sourceFile = createSourceFile("const [a, b, c] = 'a-b-c'.split('-')")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag tagged template literals', () => {
    const sourceFile = createSourceFile('const greeting = `hello ${name}`')
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String calls without arguments', () => {
    const sourceFile = createSourceFile(
      'const greeting = String.fromCharCode(72) + String.fromCharCode(101, 111, 111)',
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag string concatenation as property', () => {
    const sourceFile = createSourceFile("const name = 'Alice';\nconst greeting = `Hello ${name}!`")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag already split strings', () => {
    const sourceFile = createSourceFile("const parts = 'hello'.split('');")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.concat on existing array', () => {
    const sourceFile = createSourceFile("const items = ['a', 'b'];")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.raw on typeof checks', () => {
    const sourceFile = createSourceFile("const raw = Buffer.from('hello')")
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.fromCharCode', () => {
    const sourceFile = createSourceFile(
      'const chars = [String.fromCharCode(72), String.fromCharCode(101), String.fromCharCode(108), String.fromCharCode(111)];\nconst result = String.fromCharCode.apply(null, chars)',
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.fromCodePoint', () => {
    const sourceFile = createSourceFile(
      'const greeting = String.fromCodePoint(0x48, 0x65, 0x6c, 0x65, 0x6c)',
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag String.fromCodePoint with code unit', () => {
    const sourceFile = createSourceFile(
      'const code = 0x48;\nconst greeting = String.fromCodePoint(code, code + 1);',
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag hex string to binary conversion', () => {
    const sourceFile = createSourceFile(
      "const hex = 'deadbeef';\nconst binary = hex.split('').map(b => parseInt(b, 16)).join('');",
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag base64 string to binary conversion', () => {
    const sourceFile = createSourceFile(
      "const b64 = 'SGVsbG8=';\nconst binary = atob(b64).toString(2).split('').map(c => c.charCodeAt(0)).join('');",
    )
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag string methods that return strings', () => {
    const sourceFile = createSourceFile(`
      function getString() { return 'hello' }
      function getGreeting() { return getString() }
    `)
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag string methods in templates', () => {
    const sourceFile = createSourceFile('const greeting = `hello`')
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag tagged template expressions', () => {
    const sourceFile = createSourceFile('const greeting = `hello`')
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag already joined strings in loops', () => {
    const sourceFile = createSourceFile(`
      const parts = ['hello', 'world'];
      for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].toUpperCase();
      }
    `)
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
  it('should not flag string methods on classes', () => {
    const sourceFile = createSourceFile(`
      class Greeter {
        greet() { return 'hello' }
      }
      const g = new Greeter();
      g.greet();
    `)
    const violations = analyzePreferStringStartEnd(sourceFile)
    expect(violations).toHaveLength(0)
  })
})
