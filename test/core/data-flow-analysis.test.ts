import { describe, it, expect } from 'vitest'
import { TAINT_SOURCES, TAINT_SINKS, SANITIZERS } from '../../src/core/data-flow/types.js'
import { DataFlowBuilder } from '../../src/core/data-flow/data-flow-builder.js'
import { TaintAnalyzer } from '../../src/core/data-flow/taint-analyzer.js'
import type { DataFlowGraph, FlowNode, TaintPath } from '../../src/core/data-flow/types.js'

describe('types and constants', () => {
  describe('TAINT_SOURCES', () => {
    it('should be a non-empty array', () => {
      expect(TAINT_SOURCES.length).toBeGreaterThan(0)
    })

    it('should contain process.argv source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'process.argv')
      expect(found).toBeDefined()
      expect(found?.category).toBe('user-input')
    })

    it('should contain process.env source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'process.env')
      expect(found).toBeDefined()
      expect(found?.category).toBe('environment')
    })

    it('should contain req.params source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'req.params')
      expect(found).toBeDefined()
      expect(found?.category).toBe('user-input')
    })

    it('should contain req.query source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'req.query')
      expect(found).toBeDefined()
    })

    it('should contain req.body source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'req.body')
      expect(found).toBeDefined()
    })

    it('should contain req.headers source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'req.headers')
      expect(found).toBeDefined()
    })

    it('should contain fetch source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'fetch')
      expect(found).toBeDefined()
      expect(found?.category).toBe('network')
    })

    it('should contain window.location source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'window.location')
      expect(found).toBeDefined()
    })

    it('should contain localStorage source', () => {
      const found = TAINT_SOURCES.find((s) => s.name === 'localStorage')
      expect(found).toBeDefined()
    })

    it('all sources should have patterns', () => {
      for (const source of TAINT_SOURCES) {
        expect(source.patterns.length).toBeGreaterThan(0)
      }
    })
  })

  describe('TAINT_SINKS', () => {
    it('should be a non-empty array', () => {
      expect(TAINT_SINKS.length).toBeGreaterThan(0)
    })

    it('should contain sql sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'sql')
      expect(found).toBeDefined()
    })

    it('should contain xss sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'xss')
      expect(found).toBeDefined()
    })

    it('should contain command sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'command')
      expect(found).toBeDefined()
    })

    it('should contain path sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'path')
      expect(found).toBeDefined()
    })

    it('should contain eval sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'eval')
      expect(found).toBeDefined()
    })

    it('should contain deserialize sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'deserialize')
      expect(found).toBeDefined()
    })

    it('should contain redirect sink', () => {
      const found = TAINT_SINKS.find((s) => s.category === 'redirect')
      expect(found).toBeDefined()
    })

    it('all sinks should have patterns', () => {
      for (const sink of TAINT_SINKS) {
        expect(sink.patterns.length).toBeGreaterThan(0)
      }
    })
  })

  describe('SANITIZERS', () => {
    it('should be a non-empty array', () => {
      expect(SANITIZERS.length).toBeGreaterThan(0)
    })

    it('should contain escapeHtml', () => {
      expect(SANITIZERS).toContain('escapeHtml')
    })

    it('should contain encodeURI', () => {
      expect(SANITIZERS).toContain('encodeURI')
    })

    it('should contain encodeURIComponent', () => {
      expect(SANITIZERS).toContain('encodeURIComponent')
    })

    it('should contain DOMPurify.sanitize', () => {
      expect(SANITIZERS).toContain('DOMPurify.sanitize')
    })
  })
})

describe('DataFlowBuilder', () => {
  it('should create node with addNode', () => {
    const builder = new DataFlowBuilder('test.ts')
    const node = builder.addNode('variable', 'x', 1, 1)
    expect(node.id).toBeDefined()
    expect(node.name).toBe('x')
    expect(node.type).toBe('variable')
    expect(node.line).toBe(1)
    expect(node.column).toBe(1)
  })

  it('should create edge with addEdge', () => {
    const builder = new DataFlowBuilder('test.ts')
    const nodeA = builder.addNode('variable', 'a', 1, 1)
    const nodeB = builder.addNode('variable', 'b', 2, 1)
    builder.addEdge(nodeA.id, nodeB.id, 'assignment')
    const graph = builder.getGraph()
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]?.from).toBe(nodeA.id)
    expect(graph.edges[0]?.to).toBe(nodeB.id)
    expect(graph.edges[0]?.type).toBe('assignment')
  })

  it('should reset graph', () => {
    const builder = new DataFlowBuilder('test.ts')
    builder.addNode('variable', 'x', 1, 1)
    builder.addNode('variable', 'y', 2, 1)
    builder.addEdge('node_0', 'node_1', 'assignment')
    builder.reset()
    const graph = builder.getGraph()
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges).toHaveLength(0)
  })

  it('should build graph from simple assignment', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = 'const x = 42'
    const graph = builder.buildFromSource(source)
    expect(graph.nodes.size).toBeGreaterThan(0)
    const varNode = Array.from(graph.nodes.values()).find((n) => n.name === 'x')
    expect(varNode).toBeDefined()
    expect(varNode?.type).toBe('variable')
  })

  it('should build graph from function with parameters', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = 'function greet(name) {\n  return name\n}'
    const graph = builder.buildFromSource(source)
    const paramNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'parameter')
    expect(paramNodes.length).toBeGreaterThan(0)
    const nameParam = paramNodes.find((n) => n.name === 'name')
    expect(nameParam).toBeDefined()
  })

  it('should build graph from arrow function with parameters', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = 'const fn = (req) => req.body'
    const graph = builder.buildFromSource(source)
    const paramNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'parameter')
    expect(paramNodes.length).toBeGreaterThan(0)
  })

  it('should detect taint sources', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = "const name = req.params.name"
    const graph = builder.buildFromSource(source)
    const sourceNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'source')
    expect(sourceNodes.length).toBeGreaterThan(0)
  })

  it('should detect taint sinks', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = "db.query('SELECT * FROM users')"
    const graph = builder.buildFromSource(source)
    const sinkNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'sink')
    expect(sinkNodes.length).toBeGreaterThan(0)
  })

  it('should detect sanitizers', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = "const clean = escapeHtml(dirty)"
    const graph = builder.buildFromSource(source)
    const sanitizerNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'sanitizer')
    expect(sanitizerNodes.length).toBeGreaterThan(0)
  })

  it('should handle empty source', () => {
    const builder = new DataFlowBuilder('test.ts')
    const graph = builder.buildFromSource('')
    expect(graph.nodes.size).toBe(0)
    expect(graph.edges).toHaveLength(0)
  })

  it('should handle comment-only source', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = '// this is a comment\n/* block comment */'
    const graph = builder.buildFromSource(source)
    expect(graph.nodes.size).toBe(0)
  })

  it('should handle complex nested code', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = [
      'const userInput = req.query.id',
      'const result = db.query(input)',
      'element.innerHTML = result',
    ].join('\n')
    const graph = builder.buildFromSource(source)
    expect(graph.nodes.size).toBeGreaterThan(0)
  })

  it('should detect source in req.body access', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = 'const data = req.body'
    const graph = builder.buildFromSource(source)
    const sourceNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'source')
    expect(sourceNodes.some((n) => n.name.includes('req.body'))).toBe(true)
  })

  it('should detect sink in innerHTML', () => {
    const builder = new DataFlowBuilder('test.ts')
    const source = 'el.innerHTML = userInput'
    const graph = builder.buildFromSource(source)
    const sinkNodes = Array.from(graph.nodes.values()).filter((n) => n.type === 'sink')
    expect(sinkNodes.some((n) => n.name.includes('innerHTML'))).toBe(true)
  })

  it('should set filePath on graph', () => {
    const builder = new DataFlowBuilder('/path/to/file.ts')
    const graph = builder.buildFromSource('const x = 1')
    expect(graph.filePath).toBe('/path/to/file.ts')
  })

  it('should create nodes with unique IDs', () => {
    const builder = new DataFlowBuilder('test.ts')
    const nodeA = builder.addNode('variable', 'a', 1, 1)
    const nodeB = builder.addNode('variable', 'b', 2, 1)
    expect(nodeA.id).not.toBe(nodeB.id)
  })
})

describe('TaintAnalyzer', () => {
  function makeGraph(
    nodes: Array<{ type: FlowNode['type']; name: string }>,
    edges: Array<{ from: number; to: number; type: 'assignment' | 'argument' | 'return' | 'property' | 'spread' | 'ternary' }>,
  ): DataFlowGraph {
    const graph: DataFlowGraph = {
      nodes: new Map(),
      edges: [],
      filePath: 'test.ts',
    }
    const flowNodes: FlowNode[] = []
    for (let i = 0; i < nodes.length; i++) {
      const def = nodes[i]
      if (!def) continue
      const node: FlowNode = {
        id: `node_${i}`,
        type: def.type,
        name: def.name,
        filePath: 'test.ts',
        line: i + 1,
        column: 1,
      }
      if (def.type === 'sanitizer') {
        node.sanitized = true
        node.sanitizerName = def.name
      }
      flowNodes.push(node)
      graph.nodes.set(node.id, node)
    }
    for (const edge of edges) {
      graph.edges.push({
        from: `node_${edge.from}`,
        to: `node_${edge.to}`,
        type: edge.type,
      })
    }
    return graph
  }

  describe('findTaintPaths', () => {
    it('should find source to sink paths', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'id' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBeGreaterThan(0)
      expect(paths[0]?.source.name).toContain('req.query')
      expect(paths[0]?.sink.name).toContain('db.query')
    })

    it('should return empty when no sources', () => {
      const graph = makeGraph(
        [
          { type: 'variable', name: 'x' },
          { type: 'sink', name: 'db.query' },
        ],
        [{ from: 0, to: 1, type: 'argument' }],
      )
      const analyzer = new TaintAnalyzer()
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toHaveLength(0)
    })

    it('should return empty when no sinks', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'x' },
        ],
        [{ from: 0, to: 1, type: 'assignment' }],
      )
      const analyzer = new TaintAnalyzer()
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toHaveLength(0)
    })

    it('should find paths through multiple hops', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.body.data' },
          { type: 'variable', name: 'data' },
          { type: 'variable', name: 'processed' },
          { type: 'sink', name: 'eval(' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'assignment' },
          { from: 2, to: 3, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('isPathSanitized', () => {
    it('should return true for sanitized path', () => {
      const path: TaintPath = {
        source: { id: '0', type: 'source', name: 'req.query', filePath: 'test.ts', line: 1, column: 1 },
        sink: { id: '2', type: 'sink', name: 'innerHTML', filePath: 'test.ts', line: 3, column: 1 },
        nodes: [
          { id: '0', type: 'source', name: 'req.query', filePath: 'test.ts', line: 1, column: 1 },
          { id: '1', type: 'sanitizer', name: 'escapeHtml', filePath: 'test.ts', line: 2, column: 1, sanitized: true, sanitizerName: 'escapeHtml' },
          { id: '2', type: 'sink', name: 'innerHTML', filePath: 'test.ts', line: 3, column: 1 },
        ],
        edges: [],
        isSanitized: false,
      }
      const analyzer = new TaintAnalyzer()
      expect(analyzer.isPathSanitized(path)).toBe(true)
    })

    it('should return false for unsanitized path', () => {
      const path: TaintPath = {
        source: { id: '0', type: 'source', name: 'req.query', filePath: 'test.ts', line: 1, column: 1 },
        sink: { id: '1', type: 'sink', name: 'innerHTML', filePath: 'test.ts', line: 2, column: 1 },
        nodes: [
          { id: '0', type: 'source', name: 'req.query', filePath: 'test.ts', line: 1, column: 1 },
          { id: '1', type: 'sink', name: 'innerHTML', filePath: 'test.ts', line: 2, column: 1 },
        ],
        edges: [],
        isSanitized: false,
      }
      const analyzer = new TaintAnalyzer()
      expect(analyzer.isPathSanitized(path)).toBe(false)
    })
  })

  describe('getSeverity', () => {
    it('should return critical for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('eval')).toBe('critical')
    })

    it('should return high for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('sql')).toBe('high')
    })

    it('should return high for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('command')).toBe('high')
    })

    it('should return medium for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('xss')).toBe('medium')
    })

    it('should return medium for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('path')).toBe('medium')
    })

    it('should return low for redirect', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('redirect')).toBe('low')
    })

    it('should return low for deserialize', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('deserialize')).toBe('low')
    })

    it('should return medium for unknown', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('unknown')).toBe('medium')
    })
  })

  describe('getCWE', () => {
    it('should return CWE-89 for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('sql')).toBe('CWE-89')
    })

    it('should return CWE-79 for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('xss')).toBe('CWE-79')
    })

    it('should return CWE-78 for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('command')).toBe('CWE-78')
    })

    it('should return CWE-22 for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('path')).toBe('CWE-22')
    })

    it('should return CWE-94 for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('eval')).toBe('CWE-94')
    })

    it('should return CWE-502 for deserialize', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('deserialize')).toBe('CWE-502')
    })

    it('should return CWE-601 for redirect', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('redirect')).toBe('CWE-601')
    })

    it('should return CWE-200 for unknown', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('unknown')).toBe('CWE-200')
    })
  })

  describe('getSuggestion', () => {
    it('should return non-empty string for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('sql')).toBeTruthy()
    })

    it('should return non-empty string for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('xss')).toBeTruthy()
    })

    it('should return non-empty string for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('command')).toBeTruthy()
    })

    it('should return non-empty string for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('path')).toBeTruthy()
    })

    it('should return non-empty string for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('eval')).toBeTruthy()
    })

    it('should return non-empty string for unknown', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('unknown')).toBeTruthy()
    })
  })

  describe('analyzeGraph', () => {
    it('should detect SQL injection', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'id' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]?.type).toContain('sql')
      expect(vulns[0]?.cwe).toBe('CWE-89')
    })

    it('should detect XSS', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.input' },
          { type: 'variable', name: 'html' },
          { type: 'sink', name: 'innerHTML' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'assignment' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]?.type).toContain('xss')
      expect(vulns[0]?.cwe).toBe('CWE-79')
    })

    it('should detect command injection', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.body.cmd' },
          { type: 'variable', name: 'cmd' },
          { type: 'sink', name: 'exec(' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]?.type).toContain('command')
      expect(vulns[0]?.cwe).toBe('CWE-78')
    })

    it('should detect path traversal', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.params.file' },
          { type: 'variable', name: 'filePath' },
          { type: 'sink', name: 'path.join' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]?.type).toContain('path')
      expect(vulns[0]?.cwe).toBe('CWE-22')
    })

    it('should detect eval usage', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.body.code' },
          { type: 'variable', name: 'code' },
          { type: 'sink', name: 'eval(' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns[0]?.type).toContain('eval')
      expect(vulns[0]?.cwe).toBe('CWE-94')
      expect(vulns[0]?.severity).toBe('critical')
    })

    it('should return empty for sanitized code', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.input' },
          { type: 'sanitizer', name: 'escapeHtml' },
          { type: 'variable', name: 'clean' },
          { type: 'sink', name: 'innerHTML' },
        ],
        [
          { from: 0, to: 1, type: 'argument' },
          { from: 1, to: 2, type: 'assignment' },
          { from: 2, to: 3, type: 'assignment' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toHaveLength(0)
    })

    it('should return empty for safe code (no source-sink connection)', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'x' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toHaveLength(0)
    })

    it('should include suggestion in vulnerability', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'id' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns[0]?.suggestion).toBeTruthy()
    })

    it('should include file path in vulnerability', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'id' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns[0]?.filePath).toBe('test.ts')
    })
  })

  describe('analyzeGraphs', () => {
    it('should produce correct summary', () => {
      const graph1 = makeGraph(
        [
          { type: 'source', name: 'req.query.id' },
          { type: 'variable', name: 'id' },
          { type: 'sink', name: 'db.query' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const graph2 = makeGraph(
        [
          { type: 'source', name: 'req.body.data' },
          { type: 'variable', name: 'data' },
          { type: 'sink', name: 'eval(' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([graph1, graph2])
      expect(result.summary.totalSources).toBeGreaterThanOrEqual(2)
      expect(result.summary.totalSinks).toBeGreaterThanOrEqual(2)
      expect(result.summary.totalVulnerabilities).toBeGreaterThanOrEqual(2)
    })

    it('should count vulnerabilities by severity', () => {
      const graph = makeGraph(
        [
          { type: 'source', name: 'req.body.code' },
          { type: 'variable', name: 'code' },
          { type: 'sink', name: 'eval(' },
        ],
        [
          { from: 0, to: 1, type: 'assignment' },
          { from: 1, to: 2, type: 'argument' },
        ],
      )
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([graph])
      expect(result.summary.criticalCount).toBeGreaterThanOrEqual(1)
      expect(result.summary.highCount).toBe(0)
    })

    it('should return empty results for empty graphs', () => {
      const emptyGraph: DataFlowGraph = { nodes: new Map(), edges: [], filePath: 'empty.ts' }
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([emptyGraph])
      expect(result.vulnerabilities).toHaveLength(0)
      expect(result.summary.totalSources).toBe(0)
      expect(result.summary.totalSinks).toBe(0)
      expect(result.summary.totalVulnerabilities).toBe(0)
    })

    it('should aggregate across multiple graphs', () => {
      const graph1 = makeGraph(
        [
          { type: 'source', name: 'req.query.x' },
          { type: 'sink', name: 'db.query' },
        ],
        [{ from: 0, to: 1, type: 'argument' }],
      )
      const graph2 = makeGraph(
        [
          { type: 'source', name: 'req.body.y' },
          { type: 'sink', name: 'innerHTML' },
        ],
        [{ from: 0, to: 1, type: 'argument' }],
      )
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([graph1, graph2])
      expect(result.vulnerabilities.length).toBeGreaterThanOrEqual(2)
      expect(result.graphs).toHaveLength(2)
    })
  })

  describe('end-to-end integration', () => {
    it('should detect SQL injection via builder + analyzer', () => {
      const builder = new DataFlowBuilder('user.ts')
      const source = [
        'const id = req.query.id',
        'db.query(id)',
      ].join('\n')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBeGreaterThanOrEqual(0)
    })

    it('should detect XSS via builder + analyzer', () => {
      const builder = new DataFlowBuilder('page.ts')
      const source = [
        'const userInput = req.query.name',
        'element.innerHTML = userInput',
      ].join('\n')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.some((v) => v.type.includes('xss'))).toBe(true)
    })

    it('should detect command injection via builder + analyzer', () => {
      const builder = new DataFlowBuilder('exec.ts')
      const source = [
        'const cmd = req.body.command',
        'exec(cmd)',
      ].join('\n')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.some((v) => v.type.includes('command'))).toBe(true)
    })

    it('should detect path traversal via builder + analyzer', () => {
      const builder = new DataFlowBuilder('files.ts')
      const source = [
        'const fileName = req.params.file',
        'const fullPath = path.join(dir, fileName)',
      ].join('\n')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.some((v) => v.type.includes('path'))).toBe(true)
    })

    it('should report sanitized flows as safe', () => {
      const builder = new DataFlowBuilder('safe.ts')
      const source = [
        'const raw = req.query.input',
        'const clean = escapeHtml(raw)',
        'element.innerHTML = clean',
      ].join('\n')
      const graph = builder.buildFromSource(source)
      const analyzer = new TaintAnalyzer()
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toHaveLength(0)
    })
  })
})
