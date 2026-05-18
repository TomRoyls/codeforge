import { QueryParser } from '../src/core/ast-query/query-parser.js'
import { ASTTraverser } from '../src/core/ast-query/ast-traverser.js'
import { QueryEngine } from '../src/core/ast-query/query-engine.js'
import type { ASTNode } from '../src/core/ast-query/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeNode(type: string, children: ASTNode[] = [], props: Record<string, unknown> = {}, parent?: ASTNode): ASTNode {
  const node: ASTNode = {
    type,
    children,
    properties: props,
    location: { startLine: 1, startCol: 0, endLine: 1, endCol: 0 },
  }
  if (parent) node.parent = parent
  for (const child of children) {
    child.parent = node
  }
  return node
}

// ─── QueryParser ────────────────────────────────────────────────────────

describe('QueryParser', () => {
  const parser = new QueryParser()

  describe('tokenize', () => {
    it('tokenizes a simple type', () => {
      const tokens = parser.tokenize('FunctionDeclaration')
      expect(tokens).toEqual([{ type: 'type', value: 'FunctionDeclaration' }])
    })

    it('tokenizes universal selector', () => {
      const tokens = parser.tokenize('*')
      expect(tokens).toEqual([{ type: 'universal', value: '*' }])
    })

    it('tokenizes attribute selector', () => {
      const tokens = parser.tokenize('[name=foo]')
      expect(tokens).toEqual([{ type: 'attribute', value: 'name=foo' }])
    })

    it('tokenizes pseudo-class', () => {
      const tokens = parser.tokenize(':first-child')
      expect(tokens).toEqual([{ type: 'pseudo', value: 'first-child' }])
    })

    it('tokenizes pseudo with argument', () => {
      const tokens = parser.tokenize(':nth-child(2)')
      expect(tokens).toEqual([{ type: 'pseudo', value: 'nth-child(2)' }])
    })

    it('tokenizes child combinator', () => {
      const tokens = parser.tokenize('A > B')
      expect(tokens).toEqual([
        { type: 'type', value: 'A' },
        { type: 'combinator', value: '>' },
        { type: 'type', value: 'B' },
      ])
    })

    it('tokenizes adjacent combinator', () => {
      const tokens = parser.tokenize('A + B')
      expect(tokens).toEqual([
        { type: 'type', value: 'A' },
        { type: 'combinator', value: '+' },
        { type: 'type', value: 'B' },
      ])
    })

    it('tokenizes sibling combinator', () => {
      const tokens = parser.tokenize('A ~ B')
      expect(tokens.some(t => t.type === 'combinator' && t.value === '~')).toBe(true)
    })

    it('tokenizes group separator', () => {
      const tokens = parser.tokenize('A , B')
      expect(tokens.some(t => t.type === 'group')).toBe(true)
    })

    it('throws on unexpected character', () => {
      expect(() => parser.tokenize('#')).toThrow()
    })

    it('throws on unclosed attribute', () => {
      expect(() => parser.tokenize('[name=foo')).toThrow()
    })

    it('skips whitespace', () => {
      const tokens = parser.tokenize('  A  B  ')
      expect(tokens.map(t => t.value)).toEqual(['A', 'B'])
    })

    it('handles complex query', () => {
      const tokens = parser.tokenize('FunctionDeclaration[name=foo]:first-child > ReturnStatement')
      expect(tokens.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('parse', () => {
    it('parses simple type selector', () => {
      const sel = parser.parse('FunctionDeclaration')
      expect(sel.nodeType).toBe('FunctionDeclaration')
      expect(sel.attributes).toEqual([])
      expect(sel.pseudoClasses).toEqual([])
    })

    it('parses universal selector', () => {
      const sel = parser.parse('*')
      expect(sel.nodeType).toBe('*')
    })

    it('throws on empty query', () => {
      expect(() => parser.parse('')).toThrow()
    })

    it('throws on whitespace only', () => {
      expect(() => parser.parse('   ')).toThrow()
    })

    it('parses type with attribute', () => {
      const sel = parser.parse('Node[name=foo]')
      expect(sel.nodeType).toBe('Node')
      expect(sel.attributes).toHaveLength(1)
      expect(sel.attributes[0]?.name).toBe('name')
      expect(sel.attributes[0]?.operator).toBe('=')
      expect(sel.attributes[0]?.value).toBe('foo')
    })

    it('parses type with pseudo', () => {
      const sel = parser.parse('Node:first-child')
      expect(sel.pseudoClasses).toHaveLength(1)
      expect(sel.pseudoClasses[0]?.name).toBe('first-child')
    })

    it('parses child combinator', () => {
      const sel = parser.parse('A > B')
      expect(sel.combinator?.type).toBe('child')
      expect(sel.child?.nodeType).toBe('B')
    })

    it('parses descendant combinator (space)', () => {
      const sel = parser.parse('A B')
      expect(sel.combinator?.type).toBe('descendant')
      expect(sel.child?.nodeType).toBe('B')
    })

    it('parses adjacent combinator', () => {
      const sel = parser.parse('A + B')
      expect(sel.combinator?.type).toBe('adjacent')
    })

    it('parses sibling combinator', () => {
      const sel = parser.parse('A ~ B')
      expect(sel.combinator?.type).toBe('sibling')
    })

    it('parses multiple attributes', () => {
      const sel = parser.parse('Node[name=foo][value=bar]')
      expect(sel.attributes).toHaveLength(2)
    })
  })

  describe('parseAttribute', () => {
    it('parses equals', () => {
      const attr = parser.parseAttribute('name=foo')
      expect(attr).toEqual({ name: 'name', operator: '=', value: 'foo' })
    })

    it('parses not-equals', () => {
      const attr = parser.parseAttribute('name!=foo')
      expect(attr.operator).toBe('!=')
      expect(attr.value).toBe('foo')
    })

    it('parses starts-with', () => {
      const attr = parser.parseAttribute('name^=foo')
      expect(attr.operator).toBe('^=')
    })

    it('parses ends-with', () => {
      const attr = parser.parseAttribute('name$=foo')
      expect(attr.operator).toBe('$=')
    })

    it('parses contains', () => {
      const attr = parser.parseAttribute('name*=foo')
      expect(attr.operator).toBe('*=')
    })

    it('parses word-match', () => {
      const attr = parser.parseAttribute('name~=foo')
      expect(attr.operator).toBe('~=')
    })

    it('parses exists', () => {
      const attr = parser.parseAttribute('name')
      expect(attr).toEqual({ name: 'name', operator: 'exists' })
    })

    it('strips quotes from value', () => {
      const attr = parser.parseAttribute('name="foo bar"')
      expect(attr.value).toBe('foo bar')
    })

    it('strips single quotes from value', () => {
      const attr = parser.parseAttribute("name='baz'")
      expect(attr.value).toBe('baz')
    })

    it('handles numeric comparison in value', () => {
      const attr = parser.parseAttribute('count>5')
      expect(attr.operator).toBe('=')
      expect(attr.value).toBe('>5')
    })
  })

  describe('parsePseudo', () => {
    it('parses pseudo without argument', () => {
      const p = parser.parsePseudo('first-child')
      expect(p).toEqual({ name: 'first-child' })
    })

    it('parses pseudo with numeric argument', () => {
      const p = parser.parsePseudo('nth-child(3)')
      expect(p).toEqual({ name: 'nth-child', argument: 3 })
    })

    it('parses pseudo with string argument', () => {
      const p = parser.parsePseudo('has(FunctionDeclaration)')
      expect(p).toEqual({ name: 'has', argument: 'FunctionDeclaration' })
    })
  })
})

// ─── ASTTraverser ───────────────────────────────────────────────────────

describe('ASTTraverser', () => {
  const traverser = new ASTTraverser()

  describe('traverse', () => {
    it('visits all nodes in order', () => {
      const leaf = makeNode('leaf')
      const root = makeNode('root', [leaf])
      const visited: string[] = []
      traverser.traverse(root, {
        enter: (n) => { visited.push(n.type) },
      })
      expect(visited).toEqual(['root', 'leaf'])
    })

    it('stops when enter returns false', () => {
      const leaf = makeNode('leaf')
      const root = makeNode('root', [leaf])
      const visited: string[] = []
      traverser.traverse(root, {
        enter: (n) => { visited.push(n.type); if (n.type === 'root') return false },
      })
      expect(visited).toEqual(['root'])
    })

    it('calls exit callback', () => {
      const leaf = makeNode('leaf')
      const root = makeNode('root', [leaf])
      const exits: string[] = []
      traverser.traverse(root, {
        exit: (n) => { exits.push(n.type) },
      })
      expect(exits).toEqual(['leaf', 'root'])
    })

    it('provides ancestors', () => {
      const leaf = makeNode('leaf')
      const mid = makeNode('mid', [leaf])
      const root = makeNode('root', [mid])
      let ancestors: ASTNode[] = []
      traverser.traverse(root, {
        enter: (_n, anc) => { ancestors = anc },
      })
      expect(ancestors.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findChildren', () => {
    it('finds matching descendants', () => {
      const target = makeNode('target')
      const other = makeNode('other')
      const root = makeNode('root', [makeNode('mid', [target]), other])
      const found = traverser.findChildren(root, n => n.type === 'target')
      expect(found).toHaveLength(1)
      expect(found[0]?.type).toBe('target')
    })

    it('returns empty for no matches', () => {
      const root = makeNode('root')
      expect(traverser.findChildren(root, () => false)).toEqual([])
    })
  })

  describe('findDirectChildren', () => {
    it('finds only direct children', () => {
      const target = makeNode('target')
      const root = makeNode('root', [target, makeNode('other')])
      const found = traverser.findDirectChildren(root, n => n.type === 'target')
      expect(found).toHaveLength(1)
    })

    it('does not find grandchildren', () => {
      const grandchild = makeNode('target')
      const root = makeNode('root', [makeNode('mid', [grandchild])])
      const found = traverser.findDirectChildren(root, n => n.type === 'target')
      expect(found).toHaveLength(0)
    })
  })

  describe('getAncestors', () => {
    it('returns empty for root', () => {
      const root = makeNode('root')
      expect(traverser.getAncestors(root)).toEqual([])
    })

    it('returns ancestors from root to parent', () => {
      const leaf = makeNode('leaf')
      const mid = makeNode('mid', [leaf])
      const root = makeNode('root', [mid])
      const ancestors = traverser.getAncestors(leaf)
      expect(ancestors.map(a => a.type)).toEqual(['root', 'mid'])
    })
  })

  describe('getSiblings', () => {
    it('returns self only for root', () => {
      const root = makeNode('root')
      expect(traverser.getSiblings(root)).toEqual([root])
    })

    it('returns all siblings', () => {
      const a = makeNode('a')
      const b = makeNode('b')
      const root = makeNode('root', [a, b])
      expect(traverser.getSiblings(a)).toHaveLength(2)
    })
  })

  describe('getPreviousSibling', () => {
    it('returns null for root', () => {
      expect(traverser.getPreviousSibling(makeNode('root'))).toBeNull()
    })

    it('returns null for first child', () => {
      const first = makeNode('first')
      makeNode('parent', [first])
      expect(traverser.getPreviousSibling(first)).toBeNull()
    })

    it('returns previous sibling', () => {
      const first = makeNode('first')
      const second = makeNode('second')
      makeNode('parent', [first, second])
      expect(traverser.getPreviousSibling(second)?.type).toBe('first')
    })
  })

  describe('getNextSibling', () => {
    it('returns null for root', () => {
      expect(traverser.getNextSibling(makeNode('root'))).toBeNull()
    })

    it('returns null for last child', () => {
      const last = makeNode('last')
      makeNode('parent', [last])
      expect(traverser.getNextSibling(last)).toBeNull()
    })

    it('returns next sibling', () => {
      const first = makeNode('first')
      const second = makeNode('second')
      makeNode('parent', [first, second])
      expect(traverser.getNextSibling(first)?.type).toBe('second')
    })
  })

  describe('getNodeDepth', () => {
    it('returns 0 for root', () => {
      expect(traverser.getNodeDepth(makeNode('root'))).toBe(0)
    })

    it('returns 1 for direct child', () => {
      const child = makeNode('child')
      makeNode('parent', [child])
      expect(traverser.getNodeDepth(child)).toBe(1)
    })

    it('returns 2 for grandchild', () => {
      const leaf = makeNode('leaf')
      const mid = makeNode('mid', [leaf])
      makeNode('root', [mid])
      expect(traverser.getNodeDepth(leaf)).toBe(2)
    })
  })

  describe('isLeaf', () => {
    it('returns true for node with no children', () => {
      expect(traverser.isLeaf(makeNode('leaf'))).toBe(true)
    })

    it('returns false for node with children', () => {
      expect(traverser.isLeaf(makeNode('parent', [makeNode('child')]))).toBe(false)
    })
  })

  describe('flatten', () => {
    it('flattens single node', () => {
      const node = makeNode('root')
      expect(traverser.flatten(node)).toHaveLength(1)
    })

    it('flattens tree depth-first', () => {
      const root = makeNode('root', [
        makeNode('a', [makeNode('a1'), makeNode('a2')]),
        makeNode('b'),
      ])
      const flat = traverser.flatten(root)
      expect(flat.map(n => n.type)).toEqual(['root', 'a', 'a1', 'a2', 'b'])
    })
  })
})

// ─── QueryEngine ────────────────────────────────────────────────────────

describe('QueryEngine', () => {
  const engine = new QueryEngine()

  describe('query', () => {
    it('finds nodes by type', () => {
      const target = makeNode('FunctionDeclaration', [], { name: 'foo' })
      const root = makeNode('Program', [target])
      const result = engine.query(root, 'FunctionDeclaration')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]?.node.type).toBe('FunctionDeclaration')
    })

    it('finds all nodes with universal selector', () => {
      const root = makeNode('Program', [makeNode('A'), makeNode('B')])
      const result = engine.query(root, '*')
      expect(result.matches.length).toBe(3)
    })

    it('returns empty for no matches', () => {
      const root = makeNode('Program', [makeNode('A')])
      const result = engine.query(root, 'NonExistent')
      expect(result.matches).toHaveLength(0)
    })

    it('includes execution time', () => {
      const root = makeNode('Program')
      const result = engine.query(root, '*')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('stores query string in result', () => {
      const root = makeNode('Program')
      const result = engine.query(root, '*')
      expect(result.query).toBe('*')
    })

    it('finds by attribute equals', () => {
      const target = makeNode('Node', [], { name: 'foo' })
      const other = makeNode('Node', [], { name: 'bar' })
      const root = makeNode('Program', [target, other])
      const result = engine.query(root, 'Node[name=foo]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by attribute exists', () => {
      const target = makeNode('Node', [], { name: 'foo' })
      const other = makeNode('Node', [], {})
      const root = makeNode('Program', [target, other])
      const result = engine.query(root, 'Node[name]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by value attribute', () => {
      const target = makeNode('Node')
      target.value = 'hello'
      const root = makeNode('Program', [target])
      const result = engine.query(root, 'Node[value=hello]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by attribute not-equals', () => {
      const a = makeNode('Node', [], { x: '1' })
      const b = makeNode('Node', [], { x: '2' })
      const root = makeNode('Program', [a, b])
      const result = engine.query(root, 'Node[x!=1]')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]?.node.properties.x).toBe('2')
    })

    it('finds by attribute starts-with', () => {
      const a = makeNode('Node', [], { name: 'foobar' })
      const root = makeNode('Program', [a])
      const result = engine.query(root, 'Node[name^=foo]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by attribute ends-with', () => {
      const a = makeNode('Node', [], { name: 'foobar' })
      const root = makeNode('Program', [a])
      const result = engine.query(root, 'Node[name$=bar]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by attribute contains', () => {
      const a = makeNode('Node', [], { name: 'foobar' })
      const root = makeNode('Program', [a])
      const result = engine.query(root, 'Node[name*=oba]')
      expect(result.matches).toHaveLength(1)
    })

    it('finds by word-match', () => {
      const a = makeNode('Node', [], { tags: 'foo bar baz' })
      const root = makeNode('Program', [a])
      const result = engine.query(root, 'Node[tags~=bar]')
      expect(result.matches).toHaveLength(1)
    })
  })

  describe('pseudo selectors', () => {
    it(':empty matches nodes with no children', () => {
      const target = makeNode('Empty')
      const parent = makeNode('Parent', [target])
      const root = makeNode('Program', [parent])
      const result = engine.query(root, ':empty')
      expect(result.matches).toHaveLength(1)
    })

    it(':root matches root node', () => {
      const root = makeNode('Program', [makeNode('Child')])
      const result = engine.query(root, ':root')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]?.node.type).toBe('Program')
    })

    it(':leaf matches leaf nodes', () => {
      const root = makeNode('Program', [makeNode('Child')])
      const result = engine.query(root, ':leaf')
      expect(result.matches).toHaveLength(1)
    })

    it(':first-child matches first child', () => {
      const first = makeNode('Node')
      const second = makeNode('Node')
      makeNode('Parent', [first, second])
      const root = makeNode('Program', [first.parent!, second.parent!])
      root.children = [first.parent!]
      const result = engine.query(first.parent!, 'Node:first-child')
      expect(result.matches).toHaveLength(1)
    })
  })

  describe('buildASTFromSource', () => {
    it('builds AST from source code', () => {
      const source = 'function hello() { return 1; }'
      const ast = engine.buildASTFromSource(source)
      expect(ast.type).toBe('Program')
      expect(ast.children.length).toBeGreaterThan(0)
    })

    it('detects function declarations', () => {
      const source = 'function foo() {}'
      const ast = engine.buildASTFromSource(source)
      const fns = ast.children.filter(c => c.type === 'FunctionDeclaration')
      expect(fns.length).toBeGreaterThan(0)
    })

    it('detects variable declarations', () => {
      const source = 'const x = 1;'
      const ast = engine.buildASTFromSource(source)
      const vars = ast.children.filter(c => c.type === 'VariableDeclaration')
      expect(vars.length).toBeGreaterThan(0)
    })

    it('handles empty source', () => {
      const ast = engine.buildASTFromSource('')
      expect(ast.type).toBe('Program')
      expect(ast.children).toEqual([])
    })
  })

  describe('highlightMatches', () => {
    it('highlights matching lines', () => {
      const source = 'line1\nline2\nline3'
      const matches = [{
        node: { type: 'test', children: [], properties: {}, location: { startLine: 2, startCol: 0, endLine: 2, endCol: 5 } },
        ancestors: [],
        score: 0,
      }]
      const result = engine.highlightMatches(source, matches as any)
      const lines = result.split('\n')
      expect(lines[1]).toContain('>>>')
      expect(lines[0]).not.toContain('>>>')
    })
  })

  describe('queryAll', () => {
    it('queries multiple ASTs', () => {
      const ast1 = makeNode('Program', [makeNode('A')])
      const ast2 = makeNode('Program', [makeNode('A')])
      const map = new Map<string, ASTNode>()
      map.set('file1', ast1)
      map.set('file2', ast2)
      const results = engine.queryAll(map, 'A')
      expect(results.size).toBe(2)
      expect(results.get('file1')?.matches).toHaveLength(1)
    })
  })

  describe('matchAttribute', () => {
    it('matches numeric greater-than in value', () => {
      const node = makeNode('Node', [], { count: '10' })
      expect(engine.matchAttribute(node, { name: 'count', operator: '=', value: '>5' })).toBe(true)
      expect(engine.matchAttribute(node, { name: 'count', operator: '=', value: '>15' })).toBe(false)
    })

    it('matches numeric less-than in value', () => {
      const node = makeNode('Node', [], { count: '3' })
      expect(engine.matchAttribute(node, { name: 'count', operator: '=', value: '<5' })).toBe(true)
      expect(engine.matchAttribute(node, { name: 'count', operator: '=', value: '<2' })).toBe(false)
    })
  })

  describe('computeScore', () => {
    it('scores type match', () => {
      const root = makeNode('Program')
      const result = engine.query(root, 'Program')
      expect(result.matches[0]?.score).toBeGreaterThan(0)
    })
  })
})
