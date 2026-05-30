import { describe, expect, it } from 'vitest'

import { ASTPrinter } from '../../../src/core/ast-printer/ast-printer.js'
import type { ASTNode } from '../../../src/core/ast-printer/types.js'

function n(type: string, value?: string, children?: ASTNode[]): ASTNode {
  return { type, value, children }
}

describe('ASTPrinter', () => {
  it('prints a simple node', () => {
    const printer = new ASTPrinter()
    const result = printer.print(n('Identifier', 'foo'))
    expect(result.code).toBeTruthy()
  })

  it('returns line count', () => {
    const printer = new ASTPrinter()
    const result = printer.print(n('Program', undefined, [n('Identifier', 'a')]))
    expect(result.lines).toBeGreaterThanOrEqual(1)
  })

  it('returns mapping', () => {
    const printer = new ASTPrinter()
    const result = printer.print(n('Identifier', 'x'))
    expect(result.mapping).toBeInstanceOf(Array)
  })

  it('printProgram prints multiple nodes', () => {
    const printer = new ASTPrinter()
    const result = printer.printProgram([
      n('Identifier', 'a'),
      n('Identifier', 'b'),
    ])
    expect(result.code).toBeTruthy()
    expect(result.lines).toBeGreaterThanOrEqual(1)
  })

  it('printFunction generates function code', () => {
    const printer = new ASTPrinter()
    const code = printer.printFunction('hello', ['name'], 'console.log(name)')
    expect(code).toContain('function hello(name)')
    expect(code).toContain('console.log(name)')
    expect(code).toContain('{')
    expect(code).toContain('}')
  })

  it('printFunction respects semicolons option', () => {
    const printer = new ASTPrinter()
    const withSemi = printer.printFunction('test', [], 'return 1', { semicolons: true })
    expect(withSemi).toContain(';')
  })

  it('printFunction without semicolons', () => {
    const printer = new ASTPrinter()
    const noSemi = printer.printFunction('test', [], 'return 1', { semicolons: false })
    expect(noSemi).not.toContain(';')
  })

  it('printClass generates class code', () => {
    const printer = new ASTPrinter()
    const code = printer.printClass('MyClass', ['method() {}'], ['prop = 1'])
    expect(code).toContain('class MyClass')
    expect(code).toContain('prop = 1')
    expect(code).toContain('method() {}')
  })

  it('printClass with no properties', () => {
    const printer = new ASTPrinter()
    const code = printer.printClass('Empty', ['doStuff() {}'], [])
    expect(code).toContain('class Empty')
    expect(code).toContain('doStuff() {}')
  })

  it('handles nodes with children', () => {
    const printer = new ASTPrinter()
    const result = printer.print(
      n('Program', undefined, [
        n('FunctionDeclaration', undefined, [
          n('Identifier', 'myFunc'),
        ]),
      ]),
    )
    expect(result.code).toBeTruthy()
  })

  it('handles empty node', () => {
    const printer = new ASTPrinter()
    const result = printer.print(n('EmptyStatement'))
    expect(result.code).toBeDefined()
  })

  it('printProgram with empty array', () => {
    const printer = new ASTPrinter()
    const result = printer.printProgram([])
    expect(result.code).toBeDefined()
    expect(result.lines).toBeGreaterThanOrEqual(0)
  })

  it('respects indent size option', () => {
    const printer = new ASTPrinter()
    const code = printer.printFunction('f', [], 'x = 1', { indentSize: 4 })
    expect(code).toContain('    x = 1')
  })

  it('handles node with properties', () => {
    const printer = new ASTPrinter()
    const node: ASTNode = {
      type: 'FunctionDeclaration',
      value: 'test',
      properties: { async: 'true' },
    }
    const result = printer.print(node)
    expect(result.code).toBeTruthy()
  })
})
