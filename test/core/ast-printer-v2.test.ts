import { describe, it, expect } from 'vitest'
import { ASTPrinter } from '../../src/core/ast-printer-v2/ast-printer.js'
import type { ASTNode } from '../../src/core/ast-printer-v2/types.js'
import { DEFAULT_PRINT_OPTIONS } from '../../src/core/ast-printer-v2/types.js'

function makeNode(
  type: string,
  overrides: Partial<ASTNode> = {},
): ASTNode {
  return {
    type,
    children: [],
    value: undefined,
    properties: {},
    ...overrides,
  }
}

describe('ASTPrinter v2', () => {
  describe('Construction', () => {
    it('should create printer with default options', () => {
      const printer = new ASTPrinter()
      const opts = printer.getOptions()
      expect(opts.format).toBe('pretty')
      expect(opts.indent).toBe(2)
      expect(opts.maxDepth).toBe(-1)
      expect(opts.showLocation).toBe(false)
      expect(opts.showType).toBe(false)
      expect(opts.colorize).toBe(false)
    })

    it('should create printer with custom options', () => {
      const printer = new ASTPrinter({ format: 'json', indent: 4 })
      const opts = printer.getOptions()
      expect(opts.format).toBe('json')
      expect(opts.indent).toBe(4)
    })

    it('should return a copy of options', () => {
      const printer = new ASTPrinter()
      const opts = printer.getOptions()
      opts.format = 'lisp'
      expect(printer.getOptions().format).toBe('pretty')
    })
  })

  describe('printCompact', () => {
    it('should print simple node', () => {
      const printer = new ASTPrinter({ format: 'compact' })
      const node = makeNode('Literal', { value: 42 })
      expect(printer.printCompact(node)).toBe('Literal:42')
    })

    it('should print nested nodes', () => {
      const printer = new ASTPrinter({ format: 'compact' })
      const node = makeNode('Program', {
        children: [
          makeNode('Literal', { value: 1 }),
          makeNode('Literal', { value: 2 }),
        ],
      })
      const result = printer.printCompact(node)
      expect(result).toBe('Program(Literal:1 Literal:2)')
    })

    it('should print node with undefined value', () => {
      const printer = new ASTPrinter({ format: 'compact' })
      const node = makeNode('Empty')
      expect(printer.printCompact(node)).toBe('Empty')
    })

    it('should print node with properties', () => {
      const printer = new ASTPrinter({ format: 'compact' })
      const node = makeNode('Literal', { value: 'hello' })
      expect(printer.printCompact(node)).toBe('Literal:hello')
    })

    it('should print deeply nested structure', () => {
      const printer = new ASTPrinter({ format: 'compact' })
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C', { value: 'leaf' })],
          }),
        ],
      })
      expect(printer.printCompact(node)).toBe('A(B(C:leaf))')
    })

    it('should respect maxDepth', () => {
      const printer = new ASTPrinter({ format: 'compact', maxDepth: 1 })
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C')],
          }),
        ],
      })
      const result = printer.printCompact(node)
      expect(result).toContain('...')
    })
  })

  describe('printPretty', () => {
    it('should print indented output', () => {
      const printer = new ASTPrinter({ format: 'pretty' })
      const node = makeNode('Root', {
        children: [makeNode('Child')],
      })
      const result = printer.printPretty(node)
      expect(result).toContain('Root')
      expect(result).toContain('Child')
    })

    it('should print nested structure with indentation', () => {
      const printer = new ASTPrinter({ format: 'pretty' })
      const node = makeNode('Program', {
        children: [
          makeNode('Function', {
            children: [makeNode('Return')],
          }),
        ],
      })
      const result = printer.printPretty(node)
      expect(result).toContain('Program')
      expect(result).toContain('Function')
      expect(result).toContain('Return')
    })

    it('should enforce maxDepth', () => {
      const printer = new ASTPrinter({ format: 'pretty', maxDepth: 1 })
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C')],
          }),
        ],
      })
      const result = printer.printPretty(node)
      expect(result).toContain('...')
    })

    it('should show location when enabled', () => {
      const printer = new ASTPrinter({ format: 'pretty', showLocation: true })
      const node = makeNode('Ident', {
        value: 'x',
        location: { line: 5, column: 10 },
      })
      const result = printer.printPretty(node)
      expect(result).toContain('@5:10')
    })

    it('should show type info when enabled', () => {
      const printer = new ASTPrinter({ format: 'pretty', showType: true })
      const node = makeNode('Literal', { value: 42 })
      const result = printer.printPretty(node)
      expect(result).toContain('[number]')
    })

    it('should use custom indent size', () => {
      const printer = new ASTPrinter({ format: 'pretty', indent: 4 })
      const node = makeNode('A', {
        children: [makeNode('B')],
      })
      const result = printer.printPretty(node)
      expect(result).toContain('    B')
    })

    it('should respect base indent parameter', () => {
      const printer = new ASTPrinter({ format: 'pretty', indent: 2 })
      const node = makeNode('A')
      const result = printer.printPretty(node, 3)
      expect(result).toContain('      A')
    })
  })

  describe('printJSON', () => {
    it('should produce valid JSON', () => {
      const printer = new ASTPrinter({ format: 'json' })
      const node = makeNode('Literal', { value: 42 })
      const result = printer.printJSON(node)
      const parsed = JSON.parse(result)
      expect(parsed.type).toBe('Literal')
      expect(parsed.value).toBe(42)
    })

    it('should produce correct structure', () => {
      const printer = new ASTPrinter({ format: 'json' })
      const node = makeNode('Program', {
        children: [makeNode('Literal', { value: 1 })],
      })
      const result = printer.printJSON(node)
      const parsed = JSON.parse(result)
      expect(parsed.type).toBe('Program')
      expect(parsed.children).toHaveLength(1)
      expect(parsed.children[0].type).toBe('Literal')
    })

    it('should serialize nested structures', () => {
      const printer = new ASTPrinter({ format: 'json' })
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C')],
            properties: { name: 'inner' },
          }),
        ],
      })
      const result = printer.printJSON(node)
      const parsed = JSON.parse(result)
      expect(parsed.children[0].children[0].type).toBe('C')
      expect(parsed.children[0].properties.name).toBe('inner')
    })

    it('should include location when present', () => {
      const printer = new ASTPrinter({ format: 'json' })
      const node = makeNode('Ident', {
        value: 'x',
        location: { line: 1, column: 0 },
      })
      const result = printer.printJSON(node)
      const parsed = JSON.parse(result)
      expect(parsed.location).toEqual({ line: 1, column: 0 })
    })

    it('should omit undefined value', () => {
      const printer = new ASTPrinter({ format: 'json' })
      const node = makeNode('Empty')
      const result = printer.printJSON(node)
      const parsed = JSON.parse(result)
      expect(parsed.value).toBeUndefined()
    })
  })

  describe('printLisp', () => {
    it('should produce S-expression format', () => {
      const printer = new ASTPrinter({ format: 'lisp' })
      const node = makeNode('Add', {
        children: [
          makeNode('Num', { value: 1 }),
          makeNode('Num', { value: 2 }),
        ],
      })
      const result = printer.printLisp(node)
      expect(result).toBe('(Add 1 2)')
    })

    it('should produce nested parentheses', () => {
      const printer = new ASTPrinter({ format: 'lisp' })
      const node = makeNode('Add', {
        children: [
          makeNode('Mul', {
            children: [
              makeNode('Num', { value: 2 }),
              makeNode('Num', { value: 3 }),
            ],
          }),
          makeNode('Num', { value: 4 }),
        ],
      })
      const result = printer.printLisp(node)
      expect(result).toBe('(Add (Mul 2 3) 4)')
    })

    it('should handle leaf nodes as atoms', () => {
      const printer = new ASTPrinter({ format: 'lisp' })
      const node = makeNode('Num', { value: 42 })
      expect(printer.printLisp(node)).toBe('42')
    })

    it('should handle leaf node with no value as type name', () => {
      const printer = new ASTPrinter({ format: 'lisp' })
      const node = makeNode('Nil')
      expect(printer.printLisp(node)).toBe('Nil')
    })

    it('should respect maxDepth', () => {
      const printer = new ASTPrinter({ format: 'lisp', maxDepth: 0 })
      const node = makeNode('A', {
        children: [makeNode('B')],
      })
      const result = printer.printLisp(node)
      expect(result).toBe('(A ...)')
    })
  })

  describe('Traversal', () => {
    it('should traverse in pre-order', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C')],
          }),
          makeNode('D'),
        ],
      })
      const visited: string[] = []
      printer.traverse(node, (n) => {
        visited.push(n.type)
        return true
      })
      expect(visited).toEqual(['A', 'B', 'C', 'D'])
    })

    it('should stop traversal when visitor returns false', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      const visited: string[] = []
      printer.traverse(node, (n) => {
        visited.push(n.type)
        return n.type !== 'B'
      })
      expect(visited).toEqual(['A', 'B'])
    })

    it('should pass correct depth to visitor', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('C')],
          }),
        ],
      })
      const depths: number[] = []
      printer.traverse(node, (_n, depth) => {
        depths.push(depth)
        return true
      })
      expect(depths).toEqual([0, 1, 2])
    })

    it('should findNodes by type', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Program', {
        children: [
          makeNode('Literal', { value: 1 }),
          makeNode('Ident'),
          makeNode('Literal', { value: 2 }),
        ],
      })
      const literals = printer.findNodes(node, (n) => n.type === 'Literal')
      expect(literals).toHaveLength(2)
    })

    it('should findNodes by property', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('A', { properties: { kind: 'const' } }),
          makeNode('B', { properties: { kind: 'let' } }),
          makeNode('C', { properties: { kind: 'const' } }),
        ],
      })
      const consts = printer.findNodes(
        node,
        (n) => n.properties.kind === 'const',
      )
      expect(consts).toHaveLength(2)
    })

    it('should getNodeAt valid path', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('A'),
          makeNode('B', {
            children: [makeNode('C')],
          }),
        ],
      })
      const found = printer.getNodeAt(node, [1, 0])
      expect(found?.type).toBe('C')
    })

    it('should getNodeAt root with empty path', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root')
      const found = printer.getNodeAt(node, [])
      expect(found?.type).toBe('Root')
    })

    it('should getNodeAt return undefined for invalid path', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', { children: [makeNode('A')] })
      expect(printer.getNodeAt(node, [5])).toBeUndefined()
      expect(printer.getNodeAt(node, [0, 0])).toBeUndefined()
    })
  })

  describe('Tree operations', () => {
    it('should filter tree preserving structure', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('Keep', { properties: { pass: true } }),
          makeNode('Skip', { properties: { pass: false } }),
        ],
      })
      const filtered = printer.filter(node, (n) =>
        n.type === 'Root' || n.properties.pass === true,
      )
      expect(filtered).toBeDefined()
      expect(filtered!.children).toHaveLength(1)
      expect(filtered!.children[0]!.type).toBe('Keep')
    })

    it('should return undefined when root filtered out', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Skip')
      const filtered = printer.filter(node, (n) => n.type === 'Keep')
      expect(filtered).toBeUndefined()
    })

    it('should clone deep copy', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [makeNode('Child', { value: 'data' })],
        properties: { key: 'val' },
      })
      const cloned = printer.clone(node)
      cloned.children[0]!.type = 'Modified'
      cloned.properties.key = 'changed'
      expect(node.children[0]!.type).toBe('Child')
      expect(node.properties.key).toBe('val')
    })

    it('should detect structural equality', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A', {
        children: [makeNode('B', { value: 1 })],
        properties: { x: 'y' },
      })
      const b = makeNode('A', {
        children: [makeNode('B', { value: 1 })],
        properties: { x: 'y' },
      })
      expect(printer.equals(a, b)).toBe(true)
    })

    it('should detect inequality in type', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A')
      const b = makeNode('B')
      expect(printer.equals(a, b)).toBe(false)
    })

    it('should detect inequality in value', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A', { value: 1 })
      const b = makeNode('A', { value: 2 })
      expect(printer.equals(a, b)).toBe(false)
    })

    it('should detect inequality in children count', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A', { children: [makeNode('B')] })
      const b = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      expect(printer.equals(a, b)).toBe(false)
    })

    it('should detect inequality in properties', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A', { properties: { x: 1 } })
      const b = makeNode('A', { properties: { y: 1 } })
      expect(printer.equals(a, b)).toBe(false)
    })

    it('should detect inequality in location', () => {
      const printer = new ASTPrinter()
      const a = makeNode('A', { location: { line: 1, column: 0 } })
      const b = makeNode('A')
      expect(printer.equals(a, b)).toBe(false)
    })
  })

  describe('Serialization', () => {
    it('should serialize and deserialize roundtrip', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [makeNode('Child', { value: 42 })],
        properties: { name: 'test' },
      })
      const serialized = printer.serialize(node)
      const deserialized = printer.deserialize(serialized)
      expect(printer.equals(node, deserialized)).toBe(true)
    })

    it('should roundtrip complex tree', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Program', {
        children: [
          makeNode('Function', {
            children: [
              makeNode('Param', { value: 'x' }),
              makeNode('Return', {
                children: [makeNode('Ident', { value: 'x' })],
              }),
            ],
            properties: { name: 'id', async: false },
            location: { line: 1, column: 0 },
          }),
        ],
      })
      const serialized = printer.serialize(node)
      const deserialized = printer.deserialize(serialized)
      expect(printer.equals(node, deserialized)).toBe(true)
    })

    it('should deserialize missing type as Unknown', () => {
      const printer = new ASTPrinter()
      const result = printer.deserialize({})
      expect(result.type).toBe('Unknown')
      expect(result.children).toEqual([])
    })

    it('should deserialize with no children', () => {
      const printer = new ASTPrinter()
      const result = printer.deserialize({ type: 'Leaf' })
      expect(result.children).toEqual([])
      expect(result.properties).toEqual({})
    })
  })

  describe('Statistics', () => {
    it('should count nodes correctly', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('A', {
            children: [makeNode('C')],
          }),
          makeNode('B'),
        ],
      })
      expect(printer.getNodeCount(node)).toBe(4)
    })

    it('should count single node as 1', () => {
      const printer = new ASTPrinter()
      expect(printer.getNodeCount(makeNode('Solo'))).toBe(1)
    })

    it('should compute max depth', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [
              makeNode('C', {
                children: [makeNode('D')],
              }),
            ],
          }),
        ],
      })
      expect(printer.getDepth(node)).toBe(3)
    })

    it('should return 0 depth for leaf node', () => {
      const printer = new ASTPrinter()
      expect(printer.getDepth(makeNode('Leaf'))).toBe(0)
    })

    it('should compute type counts', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Program', {
        children: [
          makeNode('Literal', { value: 1 }),
          makeNode('Literal', { value: 2 }),
          makeNode('Ident', { value: 'x' }),
        ],
      })
      const stats = printer.getStatistics(node)
      expect(stats.types.Program).toBe(1)
      expect(stats.types.Literal).toBe(2)
      expect(stats.types.Ident).toBe(1)
    })

    it('should compute statistics for complex tree', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [
          makeNode('B', {
            children: [makeNode('B')],
          }),
          makeNode('C'),
        ],
      })
      const stats = printer.getStatistics(node)
      expect(stats.nodeCount).toBe(4)
      expect(stats.maxDepth).toBe(2)
      expect(stats.types.A).toBe(1)
      expect(stats.types.B).toBe(2)
      expect(stats.types.C).toBe(1)
    })
  })

  describe('print method', () => {
    it('should dispatch to correct format', () => {
      const compactPrinter = new ASTPrinter({ format: 'compact' })
      const node = makeNode('A', { value: 1 })
      const result = compactPrinter.print(node)
      expect(result.output).toBe('A:1')
    })

    it('should return nodeCount in result', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [makeNode('B'), makeNode('C')],
      })
      const result = printer.print(node)
      expect(result.nodeCount).toBe(3)
    })

    it('should return depth in result', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [makeNode('B', { children: [makeNode('C')] })],
      })
      const result = printer.print(node)
      expect(result.depth).toBe(2)
    })

    it('should return truncated flag when maxDepth exceeded', () => {
      const printer = new ASTPrinter({ maxDepth: 1 })
      const node = makeNode('A', {
        children: [
          makeNode('B', { children: [makeNode('C')] }),
        ],
      })
      const result = printer.print(node)
      expect(result.truncated).toBe(true)
    })

    it('should return truncated false when no maxDepth', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [makeNode('B')],
      })
      const result = printer.print(node)
      expect(result.truncated).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty node (no children, no value)', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Empty')
      expect(printer.getNodeCount(node)).toBe(1)
      expect(printer.getDepth(node)).toBe(0)
      expect(printer.printCompact(node)).toBe('Empty')
    })

    it('should handle single node', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Solo', { value: 'data' })
      const result = printer.print(node)
      expect(result.nodeCount).toBe(1)
      expect(result.depth).toBe(0)
    })

    it('should handle deep nesting', () => {
      const printer = new ASTPrinter()
      let node: ASTNode = makeNode('Leaf')
      for (let i = 0; i < 10; i++) {
        node = makeNode(`Level${i}`, { children: [node] })
      }
      expect(printer.getDepth(node)).toBe(10)
      expect(printer.getNodeCount(node)).toBe(11)
    })

    it('should handle maxDepth 0', () => {
      const printer = new ASTPrinter({ maxDepth: 0 })
      const node = makeNode('A', {
        children: [makeNode('B')],
      })
      const result = printer.print(node)
      expect(result.truncated).toBe(true)
    })

    it('should handle node with no children array operations', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Leaf')
      const stats = printer.getStatistics(node)
      expect(stats.nodeCount).toBe(1)
      expect(stats.maxDepth).toBe(0)
      expect(stats.types.Leaf).toBe(1)
    })

    it('should handle null value', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Null', { value: null })
      const compact = printer.printCompact(node)
      expect(compact).toBe('Null')
    })

    it('should handle value of 0', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Num', { value: 0 })
      const compact = printer.printCompact(node)
      expect(compact).toBe('Num:0')
    })

    it('should handle empty string value', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Str', { value: '' })
      const compact = printer.printCompact(node)
      expect(compact).toBe('Str:')
    })

    it('should handle boolean value', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Bool', { value: true })
      const compact = printer.printCompact(node)
      expect(compact).toBe('Bool:true')
    })

    it('should handle object value', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Obj', { value: { nested: true } })
      const compact = printer.printCompact(node)
      expect(compact).toBe('Obj:[object Object]')
    })

    it('should handle many siblings', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: Array.from({ length: 100 }, (_, i) =>
          makeNode('Child', { value: i }),
        ),
      })
      expect(printer.getNodeCount(node)).toBe(101)
    })

    it('should handle wide tree for depth', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('A'),
          makeNode('B'),
          makeNode('C'),
          makeNode('D'),
        ],
      })
      expect(printer.getDepth(node)).toBe(1)
    })

    it('should handle equals with deep nesting', () => {
      const printer = new ASTPrinter()
      const buildDeep = (): ASTNode =>
        makeNode('A', {
          children: [
            makeNode('B', {
              children: [makeNode('C', { value: 'leaf' })],
            }),
          ],
        })
      expect(printer.equals(buildDeep(), buildDeep())).toBe(true)
    })

    it('should handle clone with location', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A', {
        children: [makeNode('B')],
        location: { line: 5, column: 10 },
      })
      const cloned = printer.clone(node)
      expect(cloned.location).toEqual({ line: 5, column: 10 })
      expect(cloned.children).toHaveLength(1)
    })

    it('should handle filter removing all children', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [
          makeNode('Skip', { properties: { keep: false } }),
          makeNode('Skip', { properties: { keep: false } }),
        ],
      })
      const filtered = printer.filter(
        node,
        (n) => n.type === 'Root' || n.properties.keep === true,
      )
      expect(filtered).toBeDefined()
      expect(filtered!.children).toHaveLength(0)
    })

    it('should print all four formats via print method', () => {
      const node = makeNode('A', { value: 1 })
      const formats = ['compact', 'pretty', 'json', 'lisp'] as const
      for (const format of formats) {
        const printer = new ASTPrinter({ format })
        const result = printer.print(node)
        expect(result.output.length).toBeGreaterThan(0)
      }
    })

    it('should handle findNodes returning empty', () => {
      const printer = new ASTPrinter()
      const node = makeNode('A')
      const found = printer.findNodes(node, (n) => n.type === 'Z')
      expect(found).toEqual([])
    })

    it('should handle getNodeAt single index', () => {
      const printer = new ASTPrinter()
      const node = makeNode('Root', {
        children: [makeNode('X'), makeNode('Y'), makeNode('Z')],
      })
      expect(printer.getNodeAt(node, [1])?.type).toBe('Y')
    })
  })
})

describe('DEFAULT_PRINT_OPTIONS', () => {
  it('should have pretty format', () => {
    expect(DEFAULT_PRINT_OPTIONS.format).toBe('pretty')
  })

  it('should have indent 2', () => {
    expect(DEFAULT_PRINT_OPTIONS.indent).toBe(2)
  })

  it('should have maxDepth -1', () => {
    expect(DEFAULT_PRINT_OPTIONS.maxDepth).toBe(-1)
  })

  it('should not show location by default', () => {
    expect(DEFAULT_PRINT_OPTIONS.showLocation).toBe(false)
  })

  it('should not show type by default', () => {
    expect(DEFAULT_PRINT_OPTIONS.showType).toBe(false)
  })

  it('should not colorize by default', () => {
    expect(DEFAULT_PRINT_OPTIONS.colorize).toBe(false)
  })
})
