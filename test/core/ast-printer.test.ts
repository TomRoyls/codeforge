import { describe, it, expect } from 'vitest'
import { CodePrinter } from '../../src/core/ast-printer/code-printer.js'
import { ASTSerializer } from '../../src/core/ast-printer/ast-serializer.js'
import { ASTPrinter } from '../../src/core/ast-printer/ast-printer.js'
import type { ASTNode, SerializedNode } from '../../src/core/ast-printer/types.js'
import { DEFAULT_PRINT_OPTIONS } from '../../src/core/ast-printer/types.js'

describe('CodePrinter', () => {
  describe('write', () => {
    it('should append text to current line', () => {
      const printer = new CodePrinter()
      printer.write('hello')
      printer.write(' world')
      expect(printer.getResult()).toBe('hello world\n')
    })
  })

  describe('writeLine', () => {
    it('should write text and start new line', () => {
      const printer = new CodePrinter()
      printer.writeLine('line1')
      printer.writeLine('line2')
      expect(printer.getResult()).toBe('line1\nline2\n')
    })

    it('should handle empty line', () => {
      const printer = new CodePrinter()
      printer.writeLine()
      expect(printer.getResult()).toBe('\n')
    })
  })

  describe('indent/dedent', () => {
    it('should indent with spaces by default', () => {
      const printer = new CodePrinter()
      printer.writeLine('root')
      printer.indent()
      printer.writeIndent()
      printer.writeLine('indented')
      expect(printer.getResult()).toBe('root\n  indented\n')
    })

    it('should dedent back to previous level', () => {
      const printer = new CodePrinter()
      printer.indent()
      printer.indent()
      expect(printer.getCurrentIndent()).toBe('    ')
      printer.dedent()
      expect(printer.getCurrentIndent()).toBe('  ')
      printer.dedent()
      expect(printer.getCurrentIndent()).toBe('')
    })

    it('should not dedent below zero', () => {
      const printer = new CodePrinter()
      printer.dedent()
      expect(printer.getIndentLevel()).toBe(0)
    })

    it('should indent with tabs when configured', () => {
      const printer = new CodePrinter({ indentStyle: 'tab' })
      printer.indent()
      printer.writeIndent()
      printer.write('tabbed')
      expect(printer.getCurrentIndent()).toBe('\t')
      expect(printer.getResult()).toBe('\ttabbed\n')
    })

    it('should respect custom indent size', () => {
      const printer = new CodePrinter({ indentSize: 4 })
      printer.indent()
      expect(printer.getCurrentIndent()).toBe('    ')
    })
  })

  describe('getResult', () => {
    it('should include trailing newline by default', () => {
      const printer = new CodePrinter()
      printer.writeLine('code')
      expect(printer.getResult()).toBe('code\n')
    })

    it('should omit trailing newline when disabled', () => {
      const printer = new CodePrinter({ trailingNewline: false })
      printer.writeLine('code')
      expect(printer.getResult()).toBe('code')
    })

    it('should include unwritten current line', () => {
      const printer = new CodePrinter({ trailingNewline: false })
      printer.write('partial')
      expect(printer.getResult()).toBe('partial')
    })
  })

  describe('reset', () => {
    it('should clear all state', () => {
      const printer = new CodePrinter()
      printer.writeLine('content')
      printer.indent()
      printer.reset()
      expect(printer.getResult()).toBe('\n')
      expect(printer.getLineCount()).toBe(0)
      expect(printer.getIndentLevel()).toBe(0)
    })
  })

  describe('getLineCount', () => {
    it('should count completed lines', () => {
      const printer = new CodePrinter()
      printer.writeLine('a')
      printer.writeLine('b')
      expect(printer.getLineCount()).toBe(2)
    })

    it('should include current in-progress line', () => {
      const printer = new CodePrinter()
      printer.writeLine('a')
      printer.write('b')
      expect(printer.getLineCount()).toBe(2)
    })
  })

  describe('compress mode', () => {
    it('should output single-line compressed result', () => {
      const printer = new CodePrinter({ compress: true })
      printer.writeLine('const a')
      printer.writeLine('= 1;')
      const result = printer.getResult()
      expect(result).toBe('const a = 1;')
    })

    it('should collapse whitespace in compress mode', () => {
      const printer = new CodePrinter({ compress: true })
      printer.write('  hello   world  ')
      expect(printer.getResult()).toBe('hello world')
    })
  })

  describe('newLine', () => {
    it('should push current line and start fresh', () => {
      const printer = new CodePrinter()
      printer.write('hello')
      printer.newLine()
      printer.write('world')
      const result = printer.getResult()
      expect(result).toBe('hello\nworld\n')
    })

    it('should just add space in compress mode', () => {
      const printer = new CodePrinter({ compress: true })
      printer.write('hello')
      printer.newLine()
      printer.write('world')
      expect(printer.getResult()).toBe('hello world')
    })
  })

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const printer = new CodePrinter({ indentSize: 4 })
      const opts = printer.getOptions()
      expect(opts.indentSize).toBe(4)
      opts.indentSize = 2
      expect(printer.getOptions().indentSize).toBe(4)
    })
  })

  describe('wrapText', () => {
    it('should wrap text at max width', () => {
      const printer = new CodePrinter({ maxWidth: 20 })
      const lines = printer.wrapText('this is a long string that needs to be wrapped properly')
      expect(lines.length).toBeGreaterThan(1)
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(20)
      }
    })

    it('should handle text shorter than max width', () => {
      const printer = new CodePrinter({ maxWidth: 80 })
      const lines = printer.wrapText('short text')
      expect(lines).toEqual(['short text'])
    })
  })
})

describe('ASTSerializer', () => {
  const serializer = new ASTSerializer()

  describe('serialize', () => {
    it('should serialize a simple node', () => {
      const node: ASTNode = { type: 'Literal', value: '42' }
      const result = serializer.serialize(node)
      expect(result.type).toBe('Literal')
      expect(result.text).toBe('42')
      expect(result.children).toEqual([])
      expect(result.depth).toBe(0)
    })

    it('should serialize node with children', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'Literal', value: '1' },
          { type: 'Literal', value: '2' },
        ],
      }
      const result = serializer.serialize(node)
      expect(result.children).toHaveLength(2)
      expect(result.children[0]!.type).toBe('Literal')
      expect(result.children[1]!.text).toBe('2')
    })

    it('should serialize node with range', () => {
      const node: ASTNode = {
        type: 'Identifier',
        value: 'x',
        range: { start: 0, end: 1 },
      }
      const result = serializer.serialize(node)
      expect(result.meta.rangeStart).toBe('0')
      expect(result.meta.rangeEnd).toBe('1')
    })

    it('should serialize node with loc', () => {
      const node: ASTNode = {
        type: 'Identifier',
        value: 'y',
        loc: { line: 5, column: 10 },
      }
      const result = serializer.serialize(node)
      expect(result.meta.line).toBe('5')
      expect(result.meta.column).toBe('10')
    })

    it('should serialize node with properties', () => {
      const node: ASTNode = {
        type: 'Function',
        value: 'fn',
        properties: { name: 'myFunc', async: true },
      }
      const result = serializer.serialize(node)
      expect(result.meta.name).toBe('myFunc')
      expect(result.meta.async).toBe('true')
    })

    it('should handle node without value', () => {
      const node: ASTNode = { type: 'Empty' }
      const result = serializer.serialize(node)
      expect(result.text).toBe('')
      expect(result.meta).toEqual({})
    })
  })

  describe('serializeMany', () => {
    it('should serialize multiple nodes', () => {
      const nodes: ASTNode[] = [
        { type: 'A', value: '1' },
        { type: 'B', value: '2' },
      ]
      const results = serializer.serializeMany(nodes)
      expect(results).toHaveLength(2)
      expect(results[0]!.type).toBe('A')
      expect(results[1]!.type).toBe('B')
    })

    it('should handle empty array', () => {
      expect(serializer.serializeMany([])).toEqual([])
    })
  })

  describe('flatten', () => {
    it('should flatten a tree into a flat list', () => {
      const root: SerializedNode = {
        type: 'Root',
        text: '',
        children: [
          {
            type: 'Child1',
            text: 'c1',
            children: [
              { type: 'Grandchild', text: 'gc', children: [], depth: 2, meta: {} },
            ],
            depth: 1,
            meta: {},
          },
          { type: 'Child2', text: 'c2', children: [], depth: 1, meta: {} },
        ],
        depth: 0,
        meta: {},
      }
      const flat = serializer.flatten(root)
      expect(flat.length).toBe(4)
      expect(flat[0]!.type).toBe('Root')
      expect(flat[0]!.children).toEqual([])
    })

    it('should preserve depth info', () => {
      const root: SerializedNode = {
        type: 'Root',
        text: '',
        children: [
          { type: 'Child', text: '', children: [], depth: 1, meta: {} },
        ],
        depth: 0,
        meta: {},
      }
      const flat = serializer.flatten(root)
      expect(flat[0]!.depth).toBe(0)
      expect(flat[1]!.depth).toBe(1)
    })
  })

  describe('toJSON', () => {
    it('should serialize to formatted JSON', () => {
      const node: SerializedNode = {
        type: 'Test',
        text: 'val',
        children: [],
        depth: 0,
        meta: {},
      }
      const json = serializer.toJSON(node)
      const parsed = JSON.parse(json)
      expect(parsed.type).toBe('Test')
      expect(parsed.text).toBe('val')
    })
  })

  describe('toTreeString', () => {
    it('should render tree for simple node', () => {
      const node: SerializedNode = {
        type: 'Root',
        text: '',
        children: [
          { type: 'Child', text: 'x', children: [], depth: 1, meta: {} },
        ],
        depth: 0,
        meta: {},
      }
      const tree = serializer.toTreeString(node)
      expect(tree).toContain('Root')
      expect(tree).toContain('Child: "x"')
    })

    it('should render deeply nested tree', () => {
      const node: SerializedNode = {
        type: 'A',
        text: '',
        children: [
          {
            type: 'B',
            text: '',
            children: [
              { type: 'C', text: 'leaf', children: [], depth: 2, meta: {} },
            ],
            depth: 1,
            meta: {},
          },
        ],
        depth: 0,
        meta: {},
      }
      const tree = serializer.toTreeString(node)
      expect(tree).toContain('A')
      expect(tree).toContain('B')
      expect(tree).toContain('C: "leaf"')
    })
  })

  describe('countNodes', () => {
    it('should count nodes in a tree', () => {
      const node: ASTNode = {
        type: 'Root',
        children: [
          { type: 'A', children: [{ type: 'C' }] },
          { type: 'B' },
        ],
      }
      expect(serializer.countNodes(node)).toBe(4)
    })

    it('should count single node as 1', () => {
      expect(serializer.countNodes({ type: 'Solo' })).toBe(1)
    })
  })

  describe('getDepth', () => {
    it('should return 0 for leaf node', () => {
      expect(serializer.getDepth({ type: 'Leaf' })).toBe(0)
    })

    it('should compute max depth', () => {
      const node: ASTNode = {
        type: 'Root',
        children: [
          { type: 'A', children: [{ type: 'B', children: [{ type: 'C' }] }] },
          { type: 'D' },
        ],
      }
      expect(serializer.getDepth(node)).toBe(3)
    })

    it('should return 1 for node with leaf children', () => {
      const node: ASTNode = {
        type: 'Root',
        children: [{ type: 'A' }, { type: 'B' }],
      }
      expect(serializer.getDepth(node)).toBe(1)
    })
  })
})

describe('ASTPrinter', () => {
  const printer = new ASTPrinter()

  describe('print', () => {
    it('should print a simple literal', () => {
      const node: ASTNode = { type: 'Literal', value: '42', properties: { raw: '42' } }
      const result = printer.print(node)
      expect(result.code).toBe('42\n')
      expect(result.mapping[0]).toEqual({ nodeType: 'Literal', line: 1, column: 0 })
    })

    it('should print an identifier', () => {
      const node: ASTNode = { type: 'Identifier', value: 'myVar' }
      const result = printer.print(node)
      expect(result.code).toBe('myVar\n')
    })

    it('should print string literals with quotes', () => {
      const node: ASTNode = { type: 'Literal', value: 'hello' }
      const result = printer.print(node)
      expect(result.code).toBe("'hello'\n")
    })

    it('should print string literals with double quotes when configured', () => {
      const node: ASTNode = { type: 'Literal', value: 'hello' }
      const result = printer.print(node, { singleQuotes: false })
      expect(result.code).toBe('"hello"\n')
    })

    it('should track mapping entries', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'Literal', value: '1', properties: { raw: '1' } },
        ],
      }
      const result = printer.print(node)
      expect(result.mapping.length).toBeGreaterThan(0)
    })

    it('should count lines correctly', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'Literal', value: '1', properties: { raw: '1' } },
          { type: 'Literal', value: '2', properties: { raw: '2' } },
        ],
      }
      const result = printer.print(node)
      expect(result.lines).toBeGreaterThan(0)
    })
  })

  describe('printFunction', () => {
    it('should print a function declaration', () => {
      const result = printer.printFunction('greet', ['name'], "console.log('hi')")
      expect(result).toContain('function greet(name)')
      expect(result).toContain("console.log('hi')")
      expect(result).toContain('}')
    })

    it('should add semicolons by default', () => {
      const result = printer.printFunction('fn', [], 'return 1')
      expect(result).toContain('return 1;')
    })

    it('should omit semicolons when disabled', () => {
      const result = printer.printFunction('fn', [], 'return 1', { semicolons: false })
      expect(result).toContain('return 1')
      expect(result).not.toContain('return 1;')
    })

    it('should handle no params', () => {
      const result = printer.printFunction('main', [], 'return 0')
      expect(result).toContain('function main()')
    })

    it('should handle multiple params', () => {
      const result = printer.printFunction('add', ['a', 'b'], 'return a + b')
      expect(result).toContain('function add(a, b)')
    })
  })

  describe('printClass', () => {
    it('should print a class with methods and properties', () => {
      const result = printer.printClass(
        'MyClass',
        ['method() { }'],
        ['x = 1'],
      )
      expect(result).toContain('class MyClass {')
      expect(result).toContain('x = 1')
      expect(result).toContain('method() { }')
      expect(result).toContain('}')
    })

    it('should handle class with no methods', () => {
      const result = printer.printClass('Empty', [], ['prop = 0'])
      expect(result).toContain('class Empty {')
      expect(result).toContain('prop = 0')
    })

    it('should handle class with no properties', () => {
      const result = printer.printClass('Svc', ['run() {}'], [])
      expect(result).toContain('class Svc {')
      expect(result).toContain('run() {}')
    })

    it('should handle empty class', () => {
      const result = printer.printClass('Obj', [], [])
      expect(result).toContain('class Obj {')
      expect(result).toContain('}')
    })
  })

  describe('printObject', () => {
    it('should print object with entries', () => {
      const result = printer.printObject([
        ['name', "'John'"],
        ['age', '30'],
      ])
      expect(result).toContain('name:')
      expect(result).toContain("'John'")
      expect(result).toContain('age:')
      expect(result).toContain('30')
    })

    it('should return empty braces for no entries', () => {
      expect(printer.printObject([])).toBe('{}')
    })

    it('should quote keys with special characters', () => {
      const result = printer.printObject([['key-with-dash', '1']])
      expect(result).toContain("'key-with-dash'")
    })

    it('should compress output when option set', () => {
      const result = printer.printObject([['a', '1'], ['b', '2']], { compress: true })
      expect(result).toContain('{')
      expect(result).toContain('a: 1')
      expect(result).toContain('b: 2')
      expect(result).not.toContain('\n')
    })

    it('should use double quotes when configured', () => {
      const result = printer.printObject([['key-name', 'val']], { singleQuotes: false })
      expect(result).toContain('"key-name"')
    })
  })

  describe('printArray', () => {
    it('should print array items', () => {
      const result = printer.printArray(['1', "'a'", 'true'])
      expect(result).toContain('1')
      expect(result).toContain("'a'")
      expect(result).toContain('true')
    })

    it('should return empty brackets for no items', () => {
      expect(printer.printArray([])).toBe('[]')
    })

    it('should compress array output', () => {
      const result = printer.printArray(['1', '2', '3'], { compress: true })
      expect(result).toBe('[1, 2, 3]')
    })
  })

  describe('printImport', () => {
    it('should print named import', () => {
      const result = printer.printImport('react', ['useState', 'useEffect'])
      expect(result).toBe("import { useState, useEffect } from 'react';")
    })

    it('should print import without names', () => {
      const result = printer.printImport('polyfill', [])
      expect(result).toBe("import 'polyfill';")
    })

    it('should use double quotes when configured', () => {
      const result = printer.printImport('lib', ['fn'], { singleQuotes: false })
      expect(result).toContain('"lib"')
    })

    it('should omit semicolons when disabled', () => {
      const result = printer.printImport('mod', ['a'], { semicolons: false })
      expect(result).not.toContain(';')
    })

    it('should handle star import', () => {
      const result = printer.printImport('utils', ['*'])
      expect(result).toContain('import * as *')
    })
  })

  describe('printExport', () => {
    it('should print const export', () => {
      const result = printer.printExport('VERSION', "'1.0.0'")
      expect(result).toBe("export const VERSION = '1.0.0';")
    })

    it('should respect semicolon option', () => {
      const result = printer.printExport('PI', '3.14', { semicolons: false })
      expect(result).toBe('export const PI = 3.14')
    })
  })

  describe('printProgram', () => {
    it('should print multiple statements', () => {
      const nodes: ASTNode[] = [
        { type: 'Literal', value: '1', properties: { raw: '1' } },
        { type: 'Literal', value: '2', properties: { raw: '2' } },
      ]
      const result = printer.printProgram(nodes)
      expect(result.code).toContain('1')
      expect(result.code).toContain('2')
      expect(result.mapping.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle empty program', () => {
      const result = printer.printProgram([])
      expect(result.code).toBe('\n')
      expect(result.mapping).toEqual([])
    })
  })

  describe('node type printing', () => {
    it('should print VariableDeclaration', () => {
      const node: ASTNode = {
        type: 'VariableDeclaration',
        properties: { kind: 'const', name: 'x' },
        children: [{ type: 'Literal', value: '42', properties: { raw: '42' } }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('const x = 42')
    })

    it('should print ReturnStatement', () => {
      const node: ASTNode = {
        type: 'ReturnStatement',
        children: [{ type: 'Literal', value: '1', properties: { raw: '1' } }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('return 1')
    })

    it('should print BinaryExpression', () => {
      const node: ASTNode = {
        type: 'BinaryExpression',
        properties: { operator: '+' },
        children: [
          { type: 'Identifier', value: 'a' },
          { type: 'Identifier', value: 'b' },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('a + b')
    })

    it('should print AssignmentExpression', () => {
      const node: ASTNode = {
        type: 'AssignmentExpression',
        properties: { operator: '=' },
        children: [
          { type: 'Identifier', value: 'x' },
          { type: 'Literal', value: '10', properties: { raw: '10' } },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('x = 10')
    })

    it('should print CallExpression', () => {
      const node: ASTNode = {
        type: 'CallExpression',
        children: [{ type: 'Identifier', value: 'console.log' }],
        properties: {
          arguments: [{ type: 'Literal', value: 'hi' }],
        },
      }
      const result = printer.print(node)
      expect(result.code).toContain("console.log('hi')")
    })

    it('should print MemberExpression', () => {
      const node: ASTNode = {
        type: 'MemberExpression',
        children: [
          { type: 'Identifier', value: 'obj' },
          { type: 'Identifier', value: 'prop' },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('obj.prop')
    })

    it('should print computed MemberExpression', () => {
      const node: ASTNode = {
        type: 'MemberExpression',
        properties: { computed: true },
        children: [
          { type: 'Identifier', value: 'arr' },
          { type: 'Literal', value: '0', properties: { raw: '0' } },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('arr[0]')
    })

    it('should print IfStatement', () => {
      const node: ASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Identifier', value: 'cond' },
          {
            type: 'BlockStatement',
            children: [{ type: 'Literal', value: '1', properties: { raw: '1' } }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('if (cond)')
      expect(result.code).toContain('{')
      expect(result.code).toContain('}')
    })

    it('should print ImportDeclaration', () => {
      const node: ASTNode = {
        type: 'ImportDeclaration',
        properties: { source: 'fs', names: ['readFile'] },
      }
      const result = printer.print(node)
      expect(result.code).toContain("import { readFile } from 'fs'")
    })

    it('should print ObjectExpression', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        children: [
          {
            type: 'Property',
            properties: { key: 'name' },
            children: [{ type: 'Literal', value: 'test' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('name:')
      expect(result.code).toContain("'test'")
    })

    it('should print ArrayExpression', () => {
      const node: ASTNode = {
        type: 'ArrayExpression',
        children: [
          { type: 'Literal', value: '1', properties: { raw: '1' } },
          { type: 'Literal', value: '2', properties: { raw: '2' } },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('[')
      expect(result.code).toContain('1')
      expect(result.code).toContain('2')
      expect(result.code).toContain(']')
    })

    it('should print FunctionDeclaration node', () => {
      const node: ASTNode = {
        type: 'FunctionDeclaration',
        properties: { name: 'add', params: ['a', 'b'] },
        children: [
          {
            type: 'ReturnStatement',
            children: [{ type: 'Identifier', value: 'a' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('function add(a, b)')
      expect(result.code).toContain('return a')
    })

    it('should print ClassDeclaration node', () => {
      const node: ASTNode = {
        type: 'ClassDeclaration',
        properties: { name: 'Foo' },
        children: [],
      }
      const result = printer.print(node)
      expect(result.code).toContain('class Foo')
    })

    it('should print ExpressionStatement', () => {
      const node: ASTNode = {
        type: 'ExpressionStatement',
        children: [{ type: 'Identifier', value: 'fn' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('fn;')
    })

    it('should handle unknown node types with value', () => {
      const node: ASTNode = { type: 'Custom', value: 'raw-code' }
      const result = printer.print(node)
      expect(result.code).toContain('raw-code')
    })
  })
})

describe('DEFAULT_PRINT_OPTIONS', () => {
  it('should have space indent style', () => {
    expect(DEFAULT_PRINT_OPTIONS.indentStyle).toBe('space')
  })

  it('should have indent size 2', () => {
    expect(DEFAULT_PRINT_OPTIONS.indentSize).toBe(2)
  })

  it('should have max width 80', () => {
    expect(DEFAULT_PRINT_OPTIONS.maxWidth).toBe(80)
  })

  it('should have semicolons enabled', () => {
    expect(DEFAULT_PRINT_OPTIONS.semicolons).toBe(true)
  })

  it('should use single quotes', () => {
    expect(DEFAULT_PRINT_OPTIONS.singleQuotes).toBe(true)
  })

  it('should have trailing newline', () => {
    expect(DEFAULT_PRINT_OPTIONS.trailingNewline).toBe(true)
  })

  it('should not compress by default', () => {
    expect(DEFAULT_PRINT_OPTIONS.compress).toBe(false)
  })
})
