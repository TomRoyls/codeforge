/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { ASTPrinter } from '../src/core/ast-printer/ast-printer.js'
import { ASTSerializer } from '../src/core/ast-printer/ast-serializer.js'
import { CodePrinter } from '../src/core/ast-printer/code-printer.js'
import { DEFAULT_PRINT_OPTIONS } from '../src/core/ast-printer/types.js'
import type { ASTNode, PrintOptions, SerializedNode } from '../src/core/ast-printer/types.js'

// ─── CodePrinter: Constructor ───────────────────────────────────────────

describe('CodePrinter', () => {
  describe('constructor', () => {
    it('creates with default options', () => {
      const cp = new CodePrinter()
      expect(cp.getOptions()).toEqual(DEFAULT_PRINT_OPTIONS)
    })

    it('creates with custom options merged over defaults', () => {
      const cp = new CodePrinter({ indentSize: 4, semicolons: false })
      const opts = cp.getOptions()
      expect(opts.indentSize).toBe(4)
      expect(opts.semicolons).toBe(false)
      expect(opts.indentStyle).toBe(DEFAULT_PRINT_OPTIONS.indentStyle)
    })

    it('does not mutate the defaults', () => {
      new CodePrinter({ indentSize: 8 })
      expect(DEFAULT_PRINT_OPTIONS.indentSize).toBe(2)
    })
  })

  // ─── CodePrinter: write / writeLine ──────────────────────────────────

  describe('write and writeLine', () => {
    it('write() appends text to current line', () => {
      const cp = new CodePrinter()
      cp.write('hello')
      cp.write(' world')
      expect(cp.getResult()).toBe('hello world\n')
    })

    it('writeLine() ends the current line', () => {
      const cp = new CodePrinter()
      cp.write('line1')
      cp.writeLine()
      cp.write('line2')
      expect(cp.getResult()).toBe('line1\nline2\n')
    })

    it('writeLine(text) appends text then ends line', () => {
      const cp = new CodePrinter()
      cp.writeLine('full line')
      expect(cp.getResult()).toBe('full line\n')
    })

    it('writeLine() with no argument pushes empty string', () => {
      const cp = new CodePrinter()
      cp.writeLine()
      expect(cp.getLineCount()).toBe(1)
      expect(cp.getResult()).toBe('\n')
    })
  })

  // ─── CodePrinter: indent / dedent ────────────────────────────────────

  describe('indent and dedent', () => {
    it('indent() increases indent level', () => {
      const cp = new CodePrinter()
      cp.indent()
      expect(cp.getIndentLevel()).toBe(1)
      cp.indent()
      expect(cp.getIndentLevel()).toBe(2)
    })

    it('dedent() decreases indent level', () => {
      const cp = new CodePrinter()
      cp.indent()
      cp.indent()
      cp.dedent()
      expect(cp.getIndentLevel()).toBe(1)
    })

    it('dedent() does not go below zero', () => {
      const cp = new CodePrinter()
      cp.dedent()
      cp.dedent()
      expect(cp.getIndentLevel()).toBe(0)
    })

    it('produces correct indent with spaces', () => {
      const cp = new CodePrinter({ indentStyle: 'space', indentSize: 2 })
      cp.indent()
      cp.writeIndent()
      cp.writeLine('indented')
      expect(cp.getResult()).toBe('  indented\n')
    })

    it('produces correct indent with tabs', () => {
      const cp = new CodePrinter({ indentStyle: 'tab' })
      cp.indent()
      cp.writeIndent()
      cp.writeLine('tabbed')
      expect(cp.getResult()).toBe('\ttabbed\n')
    })

    it('getCurrentIndent() returns empty string at level 0', () => {
      const cp = new CodePrinter()
      expect(cp.getCurrentIndent()).toBe('')
    })

    it('getCurrentIndent() with nested indent levels', () => {
      const cp = new CodePrinter({ indentStyle: 'space', indentSize: 3 })
      cp.indent()
      cp.indent()
      expect(cp.getCurrentIndent()).toBe('      ')
    })
  })

  // ─── CodePrinter: writeIndent / compress ─────────────────────────────

  describe('writeIndent and compress mode', () => {
    it('writeIndent() adds a space in compress mode if current line has content', () => {
      const cp = new CodePrinter({ compress: true })
      cp.write('x')
      cp.writeIndent()
      cp.write('y')
      expect(cp.getResult()).toBe('x y')
    })

    it('writeIndent() adds nothing in compress mode if current line is empty', () => {
      const cp = new CodePrinter({ compress: true })
      cp.writeIndent()
      cp.write('start')
      expect(cp.getResult()).toBe('start')
    })

    it('newLine() adds a space in compress mode', () => {
      const cp = new CodePrinter({ compress: true })
      cp.write('a')
      cp.newLine()
      cp.write('b')
      expect(cp.getResult()).toBe('a b')
    })

    it('getResult() collapses whitespace in compress mode', () => {
      const cp = new CodePrinter({ compress: true })
      cp.write('a  ')
      cp.write(' b')
      expect(cp.getResult()).toBe('a b')
    })

    it('getResult() does not add trailing newline in compress mode', () => {
      const cp = new CodePrinter({ compress: true, trailingNewline: true })
      cp.writeLine('hello')
      expect(cp.getResult()).toBe('hello')
    })
  })

  // ─── CodePrinter: getResult / reset ──────────────────────────────────

  describe('getResult and reset', () => {
    it('getResult() adds trailing newline when trailingNewline is true', () => {
      const cp = new CodePrinter({ trailingNewline: true })
      cp.writeLine('hi')
      expect(cp.getResult()).toBe('hi\n')
    })

    it('getResult() omits trailing newline when trailingNewline is false', () => {
      const cp = new CodePrinter({ trailingNewline: false })
      cp.writeLine('hi')
      expect(cp.getResult()).toBe('hi')
    })

    it('getResult() includes pending currentLine', () => {
      const cp = new CodePrinter({ trailingNewline: false })
      cp.write('pending')
      expect(cp.getResult()).toBe('pending')
    })

    it('reset() clears all state', () => {
      const cp = new CodePrinter()
      cp.write('data')
      cp.indent()
      cp.writeLine('more')
      cp.reset()
      expect(cp.getLineCount()).toBe(0)
      expect(cp.getIndentLevel()).toBe(0)
      expect(cp.getResult()).toBe('\n')
    })

    it('getOptions() returns a copy', () => {
      const cp = new CodePrinter()
      const opts = cp.getOptions()
      opts.indentSize = 99
      expect(cp.getOptions().indentSize).toBe(DEFAULT_PRINT_OPTIONS.indentSize)
    })
  })

  // ─── CodePrinter: getLineCount ───────────────────────────────────────

  describe('getLineCount', () => {
    it('returns 0 for empty printer', () => {
      const cp = new CodePrinter()
      expect(cp.getLineCount()).toBe(0)
    })

    it('counts finished lines', () => {
      const cp = new CodePrinter()
      cp.writeLine('a')
      cp.writeLine('b')
      expect(cp.getLineCount()).toBe(2)
    })

    it('counts pending currentLine as an extra line', () => {
      const cp = new CodePrinter()
      cp.writeLine('a')
      cp.write('unfinished')
      expect(cp.getLineCount()).toBe(2)
    })
  })

  // ─── CodePrinter: wrapText ───────────────────────────────────────────

  describe('wrapText', () => {
    it('wraps text to maxWidth', () => {
      const cp = new CodePrinter({ indentStyle: 'space', indentSize: 2 })
      const lines = cp.wrapText('a bb ccc dddd eeee ffff', 10)
      for (const line of lines) {
        expect(line.length).toBeLessThanOrEqual(10)
      }
      expect(lines.length).toBeGreaterThan(1)
    })

    it('returns single line when text fits', () => {
      const cp = new CodePrinter()
      const lines = cp.wrapText('short text', 80)
      expect(lines).toHaveLength(1)
    })

    it('uses indent from getCurrentIndent', () => {
      const cp = new CodePrinter({ indentSize: 4 })
      cp.indent()
      const lines = cp.wrapText('word', 80)
      expect(lines[0]).toBe('    word')
    })

    it('returns indent + text when effectiveWidth is 0', () => {
      const cp = new CodePrinter({ indentSize: 4 })
      cp.indent()
      cp.indent()
      const lines = cp.wrapText('hello', 8)
      expect(lines.length).toBeGreaterThanOrEqual(1)
    })

    it('uses provided maxWidth override', () => {
      const cp = new CodePrinter({ maxWidth: 100 })
      const lines = cp.wrapText('a b c d e f g h i j k', 5)
      expect(lines.length).toBeGreaterThan(1)
    })

    it('handles empty words from multiple spaces', () => {
      const cp = new CodePrinter()
      const lines = cp.wrapText('a   b', 80)
      expect(lines).toHaveLength(1)
      expect(lines[0]).toBe('a b')
    })
  })
})

// ─── ASTSerializer: serialize ────────────────────────────────────────────

describe('ASTSerializer', () => {
  const serializer = new ASTSerializer()

  describe('serialize', () => {
    it('serializes a minimal node', () => {
      const node: ASTNode = { type: 'Literal' }
      const result = serializer.serialize(node)
      expect(result.type).toBe('Literal')
      expect(result.text).toBe('')
      expect(result.children).toEqual([])
      expect(result.depth).toBe(0)
    })

    it('serializes node with value', () => {
      const node: ASTNode = { type: 'Literal', value: '42' }
      const result = serializer.serialize(node)
      expect(result.text).toBe('42')
      expect(result.meta.value).toBe('42')
    })

    it('serializes node with range', () => {
      const node: ASTNode = { type: 'Identifier', range: { start: 5, end: 10 } }
      const result = serializer.serialize(node)
      expect(result.meta.rangeStart).toBe('5')
      expect(result.meta.rangeEnd).toBe('10')
    })

    it('serializes node with loc', () => {
      const node: ASTNode = { type: 'Identifier', loc: { line: 3, column: 7 } }
      const result = serializer.serialize(node)
      expect(result.meta.line).toBe('3')
      expect(result.meta.column).toBe('7')
    })

    it('serializes node with properties', () => {
      const node: ASTNode = { type: 'Var', properties: { kind: 'const', name: 'x' } }
      const result = serializer.serialize(node)
      expect(result.meta.kind).toBe('const')
      expect(result.meta.name).toBe('x')
    })

    it('serializes node with children', () => {
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
      expect(result.children[0]!.text).toBe('1')
    })

    it('sets text to empty string when value is undefined', () => {
      const node: ASTNode = { type: 'Empty' }
      const result = serializer.serialize(node)
      expect(result.text).toBe('')
    })

    it('sets children to empty array when no children', () => {
      const node: ASTNode = { type: 'Leaf' }
      const result = serializer.serialize(node)
      expect(result.children).toEqual([])
    })

    it('includes all metadata fields combined', () => {
      const node: ASTNode = {
        type: 'Fn',
        value: 'hello',
        range: { start: 0, end: 5 },
        loc: { line: 1, column: 0 },
        properties: { async: 'true' },
      }
      const result = serializer.serialize(node)
      expect(result.meta.value).toBe('hello')
      expect(result.meta.rangeStart).toBe('0')
      expect(result.meta.line).toBe('1')
      expect(result.meta.async).toBe('true')
    })
  })

  // ─── ASTSerializer: serializeMany ────────────────────────────────────

  describe('serializeMany', () => {
    it('serializes an array of nodes', () => {
      const nodes: ASTNode[] = [
        { type: 'A', value: '1' },
        { type: 'B', value: '2' },
      ]
      const results = serializer.serializeMany(nodes)
      expect(results).toHaveLength(2)
      expect(results[0]!.type).toBe('A')
      expect(results[1]!.type).toBe('B')
    })

    it('returns empty array for empty input', () => {
      expect(serializer.serializeMany([])).toEqual([])
    })
  })

  // ─── ASTSerializer: flatten ──────────────────────────────────────────

  describe('flatten', () => {
    it('flattens a single node', () => {
      const node: SerializedNode = { type: 'Root', text: '', children: [], depth: 0, meta: {} }
      const flat = serializer.flatten(node)
      expect(flat).toHaveLength(1)
      expect(flat[0]!.type).toBe('Root')
    })

    it('flattens a tree into a flat list', () => {
      const node: SerializedNode = {
        type: 'Root',
        text: '',
        depth: 0,
        meta: {},
        children: [
          { type: 'Child1', text: 'a', depth: 1, meta: {}, children: [] },
          { type: 'Child2', text: 'b', depth: 1, meta: {}, children: [] },
        ],
      }
      const flat = serializer.flatten(node)
      expect(flat).toHaveLength(3)
      expect(flat.map((n) => n.type)).toEqual(['Root', 'Child1', 'Child2'])
    })

    it('sets correct depth for children during flatten', () => {
      const node: SerializedNode = {
        type: 'Root',
        text: '',
        depth: 0,
        meta: {},
        children: [
          {
            type: 'A',
            text: '',
            depth: 0,
            meta: {},
            children: [{ type: 'B', text: '', depth: 0, meta: {}, children: [] }],
          },
        ],
      }
      const flat = serializer.flatten(node)
      expect(flat[0]!.depth).toBe(0)
      expect(flat[1]!.depth).toBe(1)
      expect(flat[2]!.depth).toBe(2)
    })

    it('flattened nodes have empty children arrays', () => {
      const node: SerializedNode = {
        type: 'R',
        text: '',
        depth: 0,
        meta: {},
        children: [{ type: 'C', text: '', depth: 1, meta: {}, children: [] }],
      }
      const flat = serializer.flatten(node)
      for (const n of flat) {
        expect(n.children).toEqual([])
      }
    })

    it('preserves metadata copies', () => {
      const node: SerializedNode = {
        type: 'R',
        text: '',
        depth: 0,
        meta: { key: 'val' },
        children: [],
      }
      const flat = serializer.flatten(node)
      expect(flat[0]!.meta.key).toBe('val')
      flat[0]!.meta.key = 'changed'
      expect(node.meta.key).toBe('val')
    })
  })

  // ─── ASTSerializer: toJSON ───────────────────────────────────────────

  describe('toJSON', () => {
    it('produces valid JSON', () => {
      const node: SerializedNode = { type: 'X', text: 'y', children: [], depth: 0, meta: {} }
      const json = serializer.toJSON(node)
      const parsed = JSON.parse(json)
      expect(parsed.type).toBe('X')
      expect(parsed.text).toBe('y')
    })

    it('pretty prints with 2-space indent', () => {
      const node: SerializedNode = { type: 'A', text: '', children: [], depth: 0, meta: {} }
      const json = serializer.toJSON(node)
      expect(json).toContain('\n')
      expect(json).toContain('  ')
    })
  })

  // ─── ASTSerializer: toTreeString ─────────────────────────────────────

  describe('toTreeString', () => {
    it('renders a single node with no children', () => {
      const node: SerializedNode = { type: 'Root', text: '', children: [], depth: 0, meta: {} }
      const str = serializer.toTreeString(node)
      expect(str).toBe('Root')
    })

    it('renders node with text', () => {
      const node: SerializedNode = { type: 'Literal', text: '42', children: [], depth: 0, meta: {} }
      const str = serializer.toTreeString(node)
      expect(str).toBe('Literal: "42"')
    })

    it('renders children with tree connectors', () => {
      const node: SerializedNode = {
        type: 'Program',
        text: '',
        children: [
          { type: 'A', text: '1', children: [], depth: 1, meta: {} },
          { type: 'B', text: '2', children: [], depth: 1, meta: {} },
        ],
        depth: 0,
        meta: {},
      }
      const str = serializer.toTreeString(node)
      expect(str).toContain('Program')
      expect(str).toContain('├── A: "1"')
      expect(str).toContain('└── B: "2"')
    })

    it('renders grandchildren correctly', () => {
      const node: SerializedNode = {
        type: 'Root',
        text: '',
        children: [
          {
            type: 'Parent',
            text: '',
            children: [
              { type: 'Child', text: 'leaf', children: [], depth: 2, meta: {} },
            ],
            depth: 1,
            meta: {},
          },
        ],
        depth: 0,
        meta: {},
      }
      const str = serializer.toTreeString(node)
      expect(str).toContain('Root')
      expect(str).toContain('└── Parent')
      expect(str).toContain('└── Child: "leaf"')
    })

    it('handles single child with └── connector', () => {
      const node: SerializedNode = {
        type: 'X',
        text: '',
        children: [{ type: 'Y', text: '', children: [], depth: 1, meta: {} }],
        depth: 0,
        meta: {},
      }
      const str = serializer.toTreeString(node)
      expect(str).toContain('└── Y')
      expect(str).not.toContain('├── Y')
    })
  })

  // ─── ASTSerializer: countNodes ───────────────────────────────────────

  describe('countNodes', () => {
    it('counts a single node', () => {
      const node: ASTNode = { type: 'Leaf' }
      expect(serializer.countNodes(node)).toBe(1)
    })

    it('counts node with children', () => {
      const node: ASTNode = {
        type: 'Root',
        children: [
          { type: 'A' },
          { type: 'B' },
        ],
      }
      expect(serializer.countNodes(node)).toBe(3)
    })

    it('counts deeply nested tree', () => {
      const node: ASTNode = {
        type: 'L0',
        children: [
          {
            type: 'L1',
            children: [{ type: 'L2' }],
          },
        ],
      }
      expect(serializer.countNodes(node)).toBe(3)
    })

    it('counts node with undefined children', () => {
      const node: ASTNode = { type: 'Leaf' }
      expect(serializer.countNodes(node)).toBe(1)
    })
  })

  // ─── ASTSerializer: getDepth ─────────────────────────────────────────

  describe('getDepth', () => {
    it('returns 0 for leaf node', () => {
      const node: ASTNode = { type: 'Leaf' }
      expect(serializer.getDepth(node)).toBe(0)
    })

    it('returns 0 for node with empty children array', () => {
      const node: ASTNode = { type: 'Branch', children: [] }
      expect(serializer.getDepth(node)).toBe(0)
    })

    it('returns 1 for node with one level of children', () => {
      const node: ASTNode = {
        type: 'Root',
        children: [{ type: 'Child' }],
      }
      expect(serializer.getDepth(node)).toBe(1)
    })

    it('returns correct depth for deep tree', () => {
      const node: ASTNode = {
        type: 'L0',
        children: [
          {
            type: 'L1',
            children: [
              {
                type: 'L2',
                children: [{ type: 'L3' }],
              },
            ],
          },
        ],
      }
      expect(serializer.getDepth(node)).toBe(3)
    })

    it('handles undefined children', () => {
      const node: ASTNode = { type: 'Leaf' }
      expect(serializer.getDepth(node)).toBe(0)
    })
  })
})

// ─── ASTPrinter: print ──────────────────────────────────────────────────

describe('ASTPrinter', () => {
  const printer = new ASTPrinter()

  describe('print', () => {
    it('prints a Literal node with string value', () => {
      const node: ASTNode = { type: 'Literal', value: 'hello' }
      const result = printer.print(node)
      expect(result.code).toContain("'hello'")
    })

    it('prints a Literal node with numeric value', () => {
      const node: ASTNode = { type: 'Literal', value: '42' }
      const result = printer.print(node)
      expect(result.code).toContain('42')
      expect(result.code).not.toContain("'42'")
    })

    it('prints a Literal node with raw property', () => {
      const node: ASTNode = { type: 'Literal', value: '42', properties: { raw: '0x2A' } }
      const result = printer.print(node)
      expect(result.code).toContain('0x2A')
    })

    it('prints a Literal node with negative number', () => {
      const node: ASTNode = { type: 'Literal', value: '-3.14' }
      const result = printer.print(node)
      expect(result.code).toContain('-3.14')
    })

    it('prints an Identifier node', () => {
      const node: ASTNode = { type: 'Identifier', value: 'myVar' }
      const result = printer.print(node)
      expect(result.code).toContain('myVar')
    })

    it('prints Identifier with default when value is undefined', () => {
      const node: ASTNode = { type: 'Identifier' }
      const result = printer.print(node)
      expect(result.code).toContain('undefined')
    })

    it('prints a VariableDeclaration node', () => {
      const node: ASTNode = {
        type: 'VariableDeclaration',
        properties: { kind: 'const', name: 'x' },
        children: [{ type: 'Literal', value: '10' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('const x = 10')
    })

    it('prints a VariableDeclaration without children', () => {
      const node: ASTNode = {
        type: 'VariableDeclaration',
        properties: { kind: 'let', name: 'y' },
      }
      const result = printer.print(node)
      expect(result.code).toContain('let y;')
    })

    it('prints a ReturnStatement with children', () => {
      const node: ASTNode = {
        type: 'ReturnStatement',
        children: [{ type: 'Literal', value: '42' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('return 42')
    })

    it('prints a ReturnStatement without children', () => {
      const node: ASTNode = { type: 'ReturnStatement' }
      const result = printer.print(node)
      expect(result.code).toContain('return;')
    })

    it('prints an ExpressionStatement', () => {
      const node: ASTNode = {
        type: 'ExpressionStatement',
        children: [{ type: 'Identifier', value: 'foo' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('foo;')
    })

    it('prints a FunctionDeclaration', () => {
      const node: ASTNode = {
        type: 'FunctionDeclaration',
        properties: { name: 'greet', params: ['name'] },
        children: [
          {
            type: 'ReturnStatement',
            children: [{ type: 'Literal', value: 'hi' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('function greet(name)')
      expect(result.code).toContain("return 'hi'")
    })

    it('prints a FunctionDeclaration with no name (anonymous)', () => {
      const node: ASTNode = {
        type: 'FunctionDeclaration',
        children: [],
      }
      const result = printer.print(node)
      expect(result.code).toContain('function anonymous()')
    })

    it('prints a ClassDeclaration', () => {
      const node: ASTNode = {
        type: 'ClassDeclaration',
        properties: { name: 'Foo' },
        children: [],
      }
      const result = printer.print(node)
      expect(result.code).toContain('class Foo')
    })

    it('prints a CallExpression', () => {
      const node: ASTNode = {
        type: 'CallExpression',
        children: [{ type: 'Identifier', value: 'fn' }],
        properties: { arguments: [{ type: 'Literal', value: 'arg' }] },
      }
      const result = printer.print(node)
      expect(result.code).toContain("fn('arg')")
    })

    it('prints a MemberExpression with dot notation', () => {
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

    it('prints a MemberExpression with computed access', () => {
      const node: ASTNode = {
        type: 'MemberExpression',
        properties: { computed: true },
        children: [
          { type: 'Identifier', value: 'arr' },
          { type: 'Literal', value: '0' },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('arr[0]')
    })

    it('prints a BinaryExpression', () => {
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

    it('prints an AssignmentExpression', () => {
      const node: ASTNode = {
        type: 'AssignmentExpression',
        properties: { operator: '=' },
        children: [
          { type: 'Identifier', value: 'x' },
          { type: 'Literal', value: '5' },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('x = 5')
    })

    it('prints an ObjectExpression', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        children: [
          {
            type: 'Property',
            value: 'key',
            properties: { key: 'name' },
            children: [{ type: 'Literal', value: 'Alice' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('name')
      expect(result.code).toContain("'Alice'")
    })

    it('prints a Property with computed key', () => {
      const node: ASTNode = {
        type: 'Property',
        properties: { key: 'sym', computed: true },
        children: [{ type: 'Literal', value: 'val' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain('[sym]')
    })

    it('prints an ArrayExpression', () => {
      const node: ASTNode = {
        type: 'ArrayExpression',
        children: [
          { type: 'Literal', value: '1' },
          { type: 'Literal', value: '2' },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('[')
      expect(result.code).toContain('1')
      expect(result.code).toContain('2')
      expect(result.code).toContain(']')
    })

    it('prints an IfStatement without else', () => {
      const node: ASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Identifier', value: 'cond' },
          {
            type: 'ExpressionStatement',
            children: [{ type: 'Identifier', value: 'doIt' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('if (cond)')
      expect(result.code).toContain('doIt')
      expect(result.code).not.toContain('else')
    })

    it('prints an IfStatement with else', () => {
      const node: ASTNode = {
        type: 'IfStatement',
        children: [
          { type: 'Identifier', value: 'cond' },
          {
            type: 'ExpressionStatement',
            children: [{ type: 'Identifier', value: 'a' }],
          },
          {
            type: 'ExpressionStatement',
            children: [{ type: 'Identifier', value: 'b' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('if (cond)')
      expect(result.code).toContain('else')
      expect(result.code).toContain('a')
      expect(result.code).toContain('b')
    })

    it('prints a BlockStatement', () => {
      const node: ASTNode = {
        type: 'BlockStatement',
        children: [
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'x' }] },
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'y' }] },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('x;')
      expect(result.code).toContain('y;')
    })

    it('prints an ImportDeclaration', () => {
      const node: ASTNode = {
        type: 'ImportDeclaration',
        properties: { source: 'fs', names: ['readFile', 'writeFile'] },
      }
      const result = printer.print(node)
      expect(result.code).toContain("import { readFile, writeFile } from 'fs'")
    })

    it('prints an ExportNamedDeclaration', () => {
      const node: ASTNode = {
        type: 'ExportNamedDeclaration',
        children: [
          {
            type: 'VariableDeclaration',
            properties: { kind: 'const', name: 'x' },
            children: [{ type: 'Literal', value: '1' }],
          },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('const x = 1')
    })

    it('handles unknown node type with value (default case)', () => {
      const node: ASTNode = { type: 'CustomNode', value: 'custom' }
      const result = printer.print(node)
      expect(result.code).toContain('custom')
    })

    it('handles unknown node type with children (default case)', () => {
      const node: ASTNode = {
        type: 'UnknownBlock',
        children: [{ type: 'Literal', value: 'child' }],
      }
      const result = printer.print(node)
      expect(result.code).toContain("'child'")
    })

    it('returns mapping entries for each node visited', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'Literal', value: 'a' },
          { type: 'Identifier', value: 'b' },
        ],
      }
      const result = printer.print(node)
      expect(result.mapping.length).toBeGreaterThanOrEqual(3)
      expect(result.mapping[0]!.nodeType).toBe('Program')
    })

    it('respects semicolons: false option', () => {
      const node: ASTNode = {
        type: 'VariableDeclaration',
        properties: { kind: 'const', name: 'x' },
        children: [{ type: 'Literal', value: '1' }],
      }
      const result = printer.print(node, { semicolons: false })
      expect(result.code).not.toContain(';')
    })

    it('respects singleQuotes: false option', () => {
      const node: ASTNode = { type: 'Literal', value: 'hello' }
      const result = printer.print(node, { singleQuotes: false })
      expect(result.code).toContain('"hello"')
    })

    it('reports line count in result', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'a' }] },
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'b' }] },
        ],
      }
      const result = printer.print(node)
      expect(result.lines).toBeGreaterThanOrEqual(2)
    })

    it('prints a Program node', () => {
      const node: ASTNode = {
        type: 'Program',
        children: [
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'x' }] },
          { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'y' }] },
        ],
      }
      const result = printer.print(node)
      expect(result.code).toContain('x;')
      expect(result.code).toContain('y;')
    })
  })

  // ─── ASTPrinter: printProgram ────────────────────────────────────────

  describe('printProgram', () => {
    it('prints an array of nodes', () => {
      const body: ASTNode[] = [
        { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'a' }] },
        { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'b' }] },
      ]
      const result = printer.printProgram(body)
      expect(result.code).toContain('a;')
      expect(result.code).toContain('b;')
    })

    it('returns empty result for empty array', () => {
      const result = printer.printProgram([])
      expect(result.code).toBe('\n')
      expect(result.lines).toBe(0)
    })

    it('prints single node program', () => {
      const body: ASTNode[] = [
        { type: 'ExpressionStatement', children: [{ type: 'Identifier', value: 'solo' }] },
      ]
      const result = printer.printProgram(body)
      expect(result.code).toContain('solo;')
    })
  })

  // ─── ASTPrinter: printFunction ───────────────────────────────────────

  describe('printFunction', () => {
    it('prints a basic function', () => {
      const code = printer.printFunction('add', ['a', 'b'], 'return a + b')
      expect(code).toContain('function add(a, b)')
      expect(code).toContain('return a + b')
    })

    it('prints a function with no params', () => {
      const code = printer.printFunction('noop', [], 'pass')
      expect(code).toContain('function noop()')
    })

    it('prints a function with multiline body', () => {
      const code = printer.printFunction('multi', [], 'line1\nline2')
      expect(code).toContain('line1')
      expect(code).toContain('line2')
    })

    it('respects semicolons option', () => {
      const code = printer.printFunction('fn', [], 'x', { semicolons: false })
      expect(code).not.toContain(';')
    })

    it('respects indent options', () => {
      const code = printer.printFunction('fn', [], 'body', { indentSize: 4 })
      expect(code).toContain('    body')
    })
  })

  // ─── ASTPrinter: printClass ──────────────────────────────────────────

  describe('printClass', () => {
    it('prints a class with methods and properties', () => {
      const code = printer.printClass('Foo', ['method1() {}'], ['prop1'])
      expect(code).toContain('class Foo')
      expect(code).toContain('prop1')
      expect(code).toContain('method1() {}')
    })

    it('separates properties and methods with blank line', () => {
      const code = printer.printClass('C', ['m() {}'], ['p'])
      const lines = code.split('\n')
      const propIdx = lines.findIndex((l) => l.includes('p'))
      const methodIdx = lines.findIndex((l) => l.includes('m()'))
      const between = lines.slice(propIdx + 1, methodIdx)
      expect(between.some((l) => l.trim() === '')).toBe(true)
    })

    it('prints class with only methods', () => {
      const code = printer.printClass('Bar', ['run() {}'], [])
      expect(code).toContain('class Bar')
      expect(code).toContain('run() {}')
    })

    it('prints class with only properties', () => {
      const code = printer.printClass('Baz', [], ['x', 'y'])
      expect(code).toContain('x')
      expect(code).toContain('y')
    })

    it('prints empty class', () => {
      const code = printer.printClass('Empty', [], [])
      expect(code).toContain('class Empty')
      expect(code).toContain('{')
      expect(code).toContain('}')
    })
  })

  // ─── ASTPrinter: printObject ─────────────────────────────────────────

  describe('printObject', () => {
    it('prints object with entries', () => {
      const code = printer.printObject([['name', "'Alice'"], ['age', '30']])
      expect(code).toContain('name')
      expect(code).toContain("'Alice'")
      expect(code).toContain('age')
      expect(code).toContain('30')
    })

    it('quotes keys with special characters', () => {
      const code = printer.printObject([['foo-bar', '1']])
      expect(code).toContain("'foo-bar'")
    })

    it('does not quote valid identifier keys', () => {
      const code = printer.printObject([['validName', '1']])
      expect(code).toContain('validName')
      expect(code).not.toContain("'validName'")
    })

    it('returns {} for empty entries', () => {
      const code = printer.printObject([])
      expect(code).toBe('{}')
    })

    it('compresses to single line when compress is true', () => {
      const code = printer.printObject(
        [
          ['a', '1'],
          ['b', '2'],
        ],
        { compress: true },
      )
      expect(code).not.toContain('\n')
      expect(code).toContain('a: 1')
      expect(code).toContain('b: 2')
    })

    it('uses double quotes when singleQuotes is false', () => {
      const code = printer.printObject([['a-b', '1']], { singleQuotes: false })
      expect(code).toContain('"a-b"')
    })

    it('separates entries with commas', () => {
      const code = printer.printObject([
        ['x', '1'],
        ['y', '2'],
      ])
      expect(code).toContain(',')
    })
  })

  // ─── ASTPrinter: printArray ──────────────────────────────────────────

  describe('printArray', () => {
    it('prints array with items', () => {
      const code = printer.printArray(['1', '2', '3'])
      expect(code).toContain('[')
      expect(code).toContain('1')
      expect(code).toContain('2')
      expect(code).toContain('3')
      expect(code).toContain(']')
    })

    it('returns [] for empty items', () => {
      expect(printer.printArray([])).toBe('[]')
    })

    it('compresses to single line when compress is true', () => {
      const code = printer.printArray(['a', 'b'], { compress: true })
      expect(code).not.toContain('\n')
      expect(code).toBe('[a, b]')
    })

    it('separates items with commas', () => {
      const code = printer.printArray(['x', 'y'])
      expect(code).toContain(',')
    })
  })

  // ─── ASTPrinter: printImport ─────────────────────────────────────────

  describe('printImport', () => {
    it('prints named imports', () => {
      const code = printer.printImport('fs', ['readFile', 'writeFile'])
      expect(code).toBe("import { readFile, writeFile } from 'fs';")
    })

    it('prints side-effect import when no names', () => {
      const code = printer.printImport('module', [])
      expect(code).toBe("import 'module';")
    })

    it('prints wildcard import', () => {
      const code = printer.printImport('lib', ['*'])
      expect(code).toBe("import * as * from 'lib';")
    })

    it('uses double quotes when singleQuotes is false', () => {
      const code = printer.printImport('mod', ['a'], { singleQuotes: false })
      expect(code).toContain('"mod"')
    })

    it('omits semicolon when semicolons is false', () => {
      const code = printer.printImport('mod', [], { semicolons: false })
      expect(code).not.toContain(';')
    })

    it('prints single named import', () => {
      const code = printer.printImport('path', ['join'])
      expect(code).toBe("import { join } from 'path';")
    })
  })

  // ─── ASTPrinter: printExport ─────────────────────────────────────────

  describe('printExport', () => {
    it('prints a const export', () => {
      const code = printer.printExport('PI', '3.14')
      expect(code).toBe('export const PI = 3.14;')
    })

    it('omits semicolon when semicolons is false', () => {
      const code = printer.printExport('X', '1', { semicolons: false })
      expect(code).toBe('export const X = 1')
    })

    it('exports a string value', () => {
      const code = printer.printExport('msg', "'hello'")
      expect(code).toBe("export const msg = 'hello';")
    })
  })
})

// ─── Integration: ASTPrinter + ASTSerializer ────────────────────────────

describe('ASTPrinter + ASTSerializer integration', () => {
  it('print and serialize agree on node structure', () => {
    const node: ASTNode = {
      type: 'Program',
      children: [
        {
          type: 'VariableDeclaration',
          properties: { kind: 'const', name: 'x' },
          children: [{ type: 'Literal', value: '42' }],
        },
      ],
    }
    const p = new ASTPrinter()
    const s = new ASTSerializer()

    const printed = p.print(node)
    const serialized = s.serialize(node)

    expect(printed.code).toContain('const x = 42')
    expect(serialized.type).toBe('Program')
    expect(serialized.children).toHaveLength(1)
    expect(serialized.children[0]!.type).toBe('VariableDeclaration')
  })

  it('serialize then flatten produces correct count', () => {
    const s = new ASTSerializer()
    const node: ASTNode = {
      type: 'Root',
      children: [
        { type: 'A', children: [{ type: 'B' }] },
        { type: 'C' },
      ],
    }
    const serialized = s.serialize(node)
    const flat = s.flatten(serialized)
    expect(flat.length).toBe(s.countNodes(node))
  })

  it('tree traversal via toTreeString matches countNodes', () => {
    const s = new ASTSerializer()
    const node: ASTNode = {
      type: 'Root',
      children: [
        { type: 'A', value: 'x' },
        { type: 'B', children: [{ type: 'C' }] },
      ],
    }
    const serialized = s.serialize(node)
    const tree = s.toTreeString(serialized)
    const nodeCount = s.countNodes(node)
    const lineCount = tree.split('\n').filter((l) => l.trim().length > 0).length
    expect(lineCount).toBe(nodeCount)
  })
})
