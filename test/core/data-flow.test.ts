import { describe, it, expect } from 'vitest'
import { DataFlowBuilder } from '../../src/core/data-flow/data-flow-builder.js'
import { TaintAnalyzer } from '../../src/core/data-flow/taint-analyzer.js'
import {
  TAINT_SOURCES,
  TAINT_SINKS,
  SANITIZERS,
} from '../../src/core/data-flow/types.js'
import type {
  FlowNode,
  FlowEdge,
  DataFlowGraph,
  TaintPath,
  SecurityVulnerability,
  DataFlowAnalysisResult,
  FlowNodeType,
  TaintSource,
  TaintSink,
} from '../../src/core/data-flow/types.js'

function makeNode(overrides: Partial<FlowNode> = {}): FlowNode {
  return {
    id: 'node_0',
    type: 'source',
    name: 'test',
    filePath: 'test.ts',
    line: 1,
    column: 1,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<FlowEdge> = {}): FlowEdge {
  return {
    from: 'node_0',
    to: 'node_1',
    type: 'assignment',
    ...overrides,
  }
}

describe('TAINT_SOURCES', () => {
  it('contains process.argv', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'process.argv')
    expect(found).toBeDefined()
    expect(found!.category).toBe('user-input')
    expect(found!.patterns).toContain('process.argv')
  })

  it('contains process.env', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'process.env')
    expect(found).toBeDefined()
    expect(found!.category).toBe('environment')
  })

  it('contains req.params', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'req.params')
    expect(found).toBeDefined()
    expect(found!.category).toBe('user-input')
    expect(found!.patterns).toContain('req.params')
    expect(found!.patterns).toContain('request.params')
  })

  it('contains req.query', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'req.query')
    expect(found).toBeDefined()
    expect(found!.patterns).toContain('req.query')
  })

  it('contains req.body', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'req.body')
    expect(found).toBeDefined()
  })

  it('contains req.headers', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'req.headers')
    expect(found).toBeDefined()
  })

  it('contains fs.readFileSync', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'fs.readFileSync')
    expect(found).toBeDefined()
    expect(found!.category).toBe('file-system')
  })

  it('contains http.request', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'http.request')
    expect(found).toBeDefined()
    expect(found!.category).toBe('network')
  })

  it('contains fetch', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'fetch')
    expect(found).toBeDefined()
    expect(found!.category).toBe('network')
    expect(found!.patterns).toContain('fetch(')
  })

  it('contains window.location', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'window.location')
    expect(found).toBeDefined()
    expect(found!.category).toBe('user-input')
  })

  it('contains document.cookie', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'document.cookie')
    expect(found).toBeDefined()
  })

  it('contains localStorage', () => {
    const found = TAINT_SOURCES.find((s) => s.name === 'localStorage')
    expect(found).toBeDefined()
    expect(found!.patterns).toContain('localStorage.getItem')
    expect(found!.patterns).toContain('sessionStorage.getItem')
  })

  it('has all expected categories', () => {
    const categories = new Set(TAINT_SOURCES.map((s) => s.category))
    expect(categories.has('user-input')).toBe(true)
    expect(categories.has('file-system')).toBe(true)
    expect(categories.has('network')).toBe(true)
    expect(categories.has('environment')).toBe(true)
    expect(categories.has('database')).toBe(false)
  })

  it('every source has at least one pattern', () => {
    for (const source of TAINT_SOURCES) {
      expect(source.patterns.length).toBeGreaterThan(0)
    }
  })
})

describe('TAINT_SINKS', () => {
  it('contains mysql.query', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'mysql.query')
    expect(found).toBeDefined()
    expect(found!.category).toBe('sql')
    expect(found!.patterns.length).toBeGreaterThan(0)
  })

  it('contains innerHTML', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'innerHTML')
    expect(found).toBeDefined()
    expect(found!.category).toBe('xss')
  })

  it('contains exec', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'exec')
    expect(found).toBeDefined()
    expect(found!.category).toBe('command')
  })

  it('contains path.join', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'path.join')
    expect(found).toBeDefined()
    expect(found!.category).toBe('path')
  })

  it('contains eval', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'eval')
    expect(found).toBeDefined()
    expect(found!.category).toBe('eval')
  })

  it('contains JSON.parse', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'JSON.parse')
    expect(found).toBeDefined()
    expect(found!.category).toBe('deserialize')
  })

  it('contains res.redirect', () => {
    const found = TAINT_SINKS.find((s) => s.name === 'res.redirect')
    expect(found).toBeDefined()
    expect(found!.category).toBe('redirect')
  })

  it('has all expected categories', () => {
    const categories = new Set(TAINT_SINKS.map((s) => s.category))
    expect(categories.has('sql')).toBe(true)
    expect(categories.has('xss')).toBe(true)
    expect(categories.has('command')).toBe(true)
    expect(categories.has('path')).toBe(true)
    expect(categories.has('eval')).toBe(true)
    expect(categories.has('deserialize')).toBe(true)
    expect(categories.has('redirect')).toBe(true)
  })

  it('every sink has at least one pattern', () => {
    for (const sink of TAINT_SINKS) {
      expect(sink.patterns.length).toBeGreaterThan(0)
    }
  })
})

describe('SANITIZERS', () => {
  it('contains escapeHtml', () => {
    expect(SANITIZERS).toContain('escapeHtml')
  })

  it('contains encodeURI', () => {
    expect(SANITIZERS).toContain('encodeURI')
  })

  it('contains DOMPurify.sanitize', () => {
    expect(SANITIZERS).toContain('DOMPurify.sanitize')
  })

  it('contains mysql.escape', () => {
    expect(SANITIZERS).toContain('mysql.escape')
  })

  it('has more than 10 entries', () => {
    expect(SANITIZERS.length).toBeGreaterThan(10)
  })
})

describe('DataFlowBuilder', () => {
  describe('constructor', () => {
    it('creates a builder with the given file path', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.getGraph()
      expect(graph.filePath).toBe('test.ts')
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges.length).toBe(0)
    })

    it('initializes with empty graph', () => {
      const builder = new DataFlowBuilder('app.ts')
      const graph = builder.getGraph()
      expect(graph.nodes).toBeInstanceOf(Map)
      expect(graph.edges).toEqual([])
    })
  })

  describe('addNode', () => {
    it('adds a basic node and returns it', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'x', 1, 1)
      expect(node.id).toBe('node_0')
      expect(node.name).toBe('x')
      expect(node.filePath).toBe('test.ts')
      expect(node.line).toBe(1)
      expect(node.column).toBe(1)
    })

    it('auto-increments node IDs', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('variable', 'a', 1, 1)
      const n2 = builder.addNode('variable', 'b', 2, 1)
      expect(n1.id).toBe('node_0')
      expect(n2.id).toBe('node_1')
    })

    it('detects source names and overrides type', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'req.params', 1, 1)
      expect(node.type).toBe('source')
    })

    it('detects sink names and overrides type', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'mysql.query', 1, 1)
      expect(node.type).toBe('sink')
    })

    it('detects sanitizer names and overrides type', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'escapeHtml', 1, 1)
      expect(node.type).toBe('sanitizer')
      expect(node.sanitized).toBe(true)
      expect(node.sanitizerName).toBe('escapeHtml')
    })

    it('stores node in graph', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'x', 1, 1)
      const graph = builder.getGraph()
      expect(graph.nodes.get('node_0')).toEqual(node)
    })

    it('preserves optional dataType', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'x', 1, 1, 'string')
      expect(node.dataType).toBe('string')
    })

    it('sets dataType to undefined when not provided', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'x', 1, 1)
      expect(node.dataType).toBeUndefined()
    })

    it('detects process.env as source', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'process.env', 1, 1)
      expect(node.type).toBe('source')
    })

    it('detects eval( as sink', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'eval(', 1, 1)
      expect(node.type).toBe('sink')
    })

    it('does not override type for non-special names', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'myVar', 1, 1)
      expect(node.type).toBe('variable')
    })
  })

  describe('addEdge', () => {
    it('adds an edge to the graph', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('source', 'req.query', 1, 1)
      const n2 = builder.addNode('variable', 'x', 2, 1)
      builder.addEdge(n1.id, n2.id, 'assignment')
      const graph = builder.getGraph()
      expect(graph.edges.length).toBe(1)
      expect(graph.edges[0]!.from).toBe(n1.id)
      expect(graph.edges[0]!.to).toBe(n2.id)
      expect(graph.edges[0]!.type).toBe('assignment')
    })

    it('adds edges with labels', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('source', 'req.query', 1, 1)
      const n2 = builder.addNode('variable', 'x', 2, 1)
      builder.addEdge(n1.id, n2.id, 'assignment', 'x = req.query')
      const edge = builder.getGraph().edges[0]!
      expect(edge.label).toBe('x = req.query')
    })

    it('supports all edge types', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('source', 'a', 1, 1)
      const n2 = builder.addNode('variable', 'b', 2, 1)
      const types: FlowEdge['type'][] = ['assignment', 'argument', 'return', 'property', 'spread', 'ternary']
      for (const t of types) {
        builder.addEdge(n1.id, n2.id, t)
      }
      const edges = builder.getGraph().edges
      expect(edges.length).toBe(6)
      for (let i = 0; i < types.length; i++) {
        expect(edges[i]!.type).toBe(types[i])
      }
    })

    it('allows multiple edges from same node', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('source', 'req.query', 1, 1)
      const n2 = builder.addNode('variable', 'x', 2, 1)
      const n3 = builder.addNode('variable', 'y', 3, 1)
      builder.addEdge(n1.id, n2.id, 'assignment')
      builder.addEdge(n1.id, n3.id, 'assignment')
      expect(builder.getGraph().edges.length).toBe(2)
    })
  })

  describe('reset', () => {
    it('clears all nodes and edges', () => {
      const builder = new DataFlowBuilder('test.ts')
      builder.addNode('variable', 'x', 1, 1)
      builder.addNode('variable', 'y', 2, 1)
      builder.addEdge('node_0', 'node_1', 'assignment')
      builder.reset()
      const graph = builder.getGraph()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges.length).toBe(0)
    })

    it('resets node ID counter', () => {
      const builder = new DataFlowBuilder('test.ts')
      builder.addNode('variable', 'x', 1, 1)
      builder.reset()
      const node = builder.addNode('variable', 'y', 2, 1)
      expect(node.id).toBe('node_0')
    })

    it('preserves file path after reset', () => {
      const builder = new DataFlowBuilder('myfile.ts')
      builder.addNode('variable', 'x', 1, 1)
      builder.reset()
      expect(builder.getGraph().filePath).toBe('myfile.ts')
    })
  })

  describe('getGraph', () => {
    it('returns the current graph state', () => {
      const builder = new DataFlowBuilder('test.ts')
      const n1 = builder.addNode('source', 'req.query', 1, 1)
      const n2 = builder.addNode('variable', 'x', 2, 1)
      builder.addEdge(n1.id, n2.id, 'assignment')
      const graph = builder.getGraph()
      expect(graph.nodes.size).toBe(2)
      expect(graph.edges.length).toBe(1)
      expect(graph.filePath).toBe('test.ts')
    })

    it('returns same reference until modified', () => {
      const builder = new DataFlowBuilder('test.ts')
      const g1 = builder.getGraph()
      const g2 = builder.getGraph()
      expect(g1).toBe(g2)
    })
  })

  describe('buildFromSource', () => {
    it('processes empty source', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('')
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges.length).toBe(0)
    })

    it('processes a simple assignment', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const x = 42')
      expect(graph.nodes.size).toBeGreaterThan(0)
      const names = [...graph.nodes.values()].map((n) => n.name)
      expect(names).toContain('x')
    })

    it('processes assignment with source', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const user = req.params')
      const nodes = [...graph.nodes.values()]
      const userNode = nodes.find((n) => n.name === 'user')
      expect(userNode).toBeDefined()
      const sourceNodes = nodes.filter((n) => n.type === 'source')
      expect(sourceNodes.length).toBeGreaterThan(0)
    })

    it('detects sinks in source code', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('mysql.query(sql)')
      const nodes = [...graph.nodes.values()]
      const sinkNodes = nodes.filter((n) => n.type === 'sink')
      expect(sinkNodes.length).toBeGreaterThan(0)
    })

    it('detects sanitizers in source code', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const clean = escapeHtml(input)')
      const nodes = [...graph.nodes.values()]
      const sanitizerNodes = nodes.filter((n) => n.type === 'sanitizer')
      expect(sanitizerNodes.length).toBeGreaterThan(0)
    })

    it('skips comment lines', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('// this is a comment\n/* block comment */\n* star comment')
      expect(graph.nodes.size).toBe(0)
    })

    it('skips empty lines', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('\n\n\n')
      expect(graph.nodes.size).toBe(0)
    })

    it('processes multi-line source', () => {
      const source = [
        'const input = req.query',
        'const clean = escapeHtml(input)',
        'element.innerHTML = clean',
      ].join('\n')
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource(source)
      expect(graph.nodes.size).toBeGreaterThan(0)
      expect(graph.edges.length).toBeGreaterThan(0)
    })

    it('resets state before building', () => {
      const builder = new DataFlowBuilder('test.ts')
      builder.addNode('variable', 'old', 1, 1)
      const graph = builder.buildFromSource('const x = 42')
      const oldNode = [...graph.nodes.values()].find((n) => n.name === 'old')
      expect(oldNode).toBeUndefined()
    })

    it('detects function parameters', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('function handler(req) {')
      const nodes = [...graph.nodes.values()]
      const paramNodes = nodes.filter((n) => n.type === 'parameter' || n.type === 'source')
      expect(paramNodes.length).toBeGreaterThan(0)
    })

    it('detects return statements', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('return data')
      const nodes = [...graph.nodes.values()]
      const returnNodes = nodes.filter((n) => n.type === 'return')
      expect(returnNodes.length).toBeGreaterThan(0)
    })

    it('creates edges for return statements', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('return data')
      const returnEdges = graph.edges.filter((e) => e.type === 'return')
      expect(returnEdges.length).toBeGreaterThan(0)
    })

    it('detects member access patterns', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const x = process.env.API_KEY')
      const nodes = [...graph.nodes.values()]
      const sourceNodes = nodes.filter((n) => n.type === 'source')
      expect(sourceNodes.length).toBeGreaterThan(0)
    })

    it('handles plain reassignment without declaration', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('x = newValue')
      const nodes = [...graph.nodes.values()]
      expect(nodes.length).toBeGreaterThan(0)
    })

    it('handles assignment edges from RHS to LHS', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const x = req.query')
      const assignEdges = graph.edges.filter((e) => e.type === 'assignment')
      expect(assignEdges.length).toBeGreaterThan(0)
    })

    it('handles function call argument edges', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('escapeHtml(input)')
      const argEdges = graph.edges.filter((e) => e.type === 'argument')
      expect(argEdges.length).toBeGreaterThan(0)
    })

    it('detects arrow function parameters', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('(req) => {')
      const nodes = [...graph.nodes.values()]
      const paramNodes = nodes.filter((n) => n.name === 'req')
      expect(paramNodes.length).toBeGreaterThan(0)
    })

    it('handles complex expression in RHS', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const result = escapeHtml(req.query.name)')
      expect(graph.nodes.size).toBeGreaterThan(0)
      expect(graph.edges.length).toBeGreaterThan(0)
    })
  })
})

describe('TaintAnalyzer', () => {
  function makeGraph(
    nodes: FlowNode[],
    edges: FlowEdge[],
    filePath = 'test.ts',
  ): DataFlowGraph {
    const nodeMap = new Map<string, FlowNode>()
    for (const node of nodes) {
      nodeMap.set(node.id, node)
    }
    return { nodes: nodeMap, edges, filePath }
  }

  describe('getSeverity', () => {
    it('returns critical for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('eval')).toBe('critical')
    })

    it('returns high for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('sql')).toBe('high')
    })

    it('returns high for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('command')).toBe('high')
    })

    it('returns medium for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('xss')).toBe('medium')
    })

    it('returns medium for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('path')).toBe('medium')
    })

    it('returns low for redirect', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('redirect')).toBe('low')
    })

    it('returns low for deserialize', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('deserialize')).toBe('low')
    })

    it('returns medium for unknown category', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSeverity('unknown')).toBe('medium')
    })
  })

  describe('getCWE', () => {
    it('returns CWE-89 for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('sql')).toBe('CWE-89')
    })

    it('returns CWE-79 for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('xss')).toBe('CWE-79')
    })

    it('returns CWE-78 for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('command')).toBe('CWE-78')
    })

    it('returns CWE-22 for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('path')).toBe('CWE-22')
    })

    it('returns CWE-94 for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('eval')).toBe('CWE-94')
    })

    it('returns CWE-502 for deserialize', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('deserialize')).toBe('CWE-502')
    })

    it('returns CWE-601 for redirect', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('redirect')).toBe('CWE-601')
    })

    it('returns CWE-200 for unknown', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getCWE('unknown')).toBe('CWE-200')
    })
  })

  describe('getSuggestion', () => {
    it('returns suggestion for sql', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('sql')).toContain('parameterized')
    })

    it('returns suggestion for xss', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('xss')).toContain('escapeHtml')
    })

    it('returns suggestion for command', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('command')).toContain('execFile')
    })

    it('returns suggestion for path', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('path')).toContain('normalize')
    })

    it('returns suggestion for eval', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('eval')).toContain('eval')
    })

    it('returns suggestion for deserialize', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('deserialize')).toContain('Validate')
    })

    it('returns suggestion for redirect', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('redirect')).toContain('allowlist')
    })

    it('returns generic suggestion for unknown', () => {
      const analyzer = new TaintAnalyzer()
      expect(analyzer.getSuggestion('unknown')).toContain('validate')
    })
  })

  describe('isPathSanitized', () => {
    it('returns true if path contains a sanitizer node', () => {
      const analyzer = new TaintAnalyzer()
      const path: TaintPath = {
        source: makeNode({ id: 's1', type: 'source', name: 'req.query' }),
        sink: makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' }),
        nodes: [
          makeNode({ id: 's1', type: 'source', name: 'req.query' }),
          makeNode({ id: 'san1', type: 'sanitizer', name: 'escapeHtml', sanitized: true, sanitizerName: 'escapeHtml' }),
          makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' }),
        ],
        edges: [makeEdge({ from: 's1', to: 'san1' }), makeEdge({ from: 'san1', to: 'sk1' })],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(true)
    })

    it('returns true if path contains a node with sanitized flag', () => {
      const analyzer = new TaintAnalyzer()
      const path: TaintPath = {
        source: makeNode({ id: 's1', type: 'source' }),
        sink: makeNode({ id: 'sk1', type: 'sink' }),
        nodes: [
          makeNode({ id: 's1', type: 'source' }),
          makeNode({ id: 'p1', type: 'propagator', sanitized: true }),
          makeNode({ id: 'sk1', type: 'sink' }),
        ],
        edges: [],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(true)
    })

    it('returns false if no sanitizer in path', () => {
      const analyzer = new TaintAnalyzer()
      const path: TaintPath = {
        source: makeNode({ id: 's1', type: 'source' }),
        sink: makeNode({ id: 'sk1', type: 'sink' }),
        nodes: [
          makeNode({ id: 's1', type: 'source' }),
          makeNode({ id: 'p1', type: 'propagator' }),
          makeNode({ id: 'sk1', type: 'sink' }),
        ],
        edges: [],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(false)
    })

    it('returns false for empty path nodes', () => {
      const analyzer = new TaintAnalyzer()
      const path: TaintPath = {
        source: makeNode({ id: 's1', type: 'source' }),
        sink: makeNode({ id: 'sk1', type: 'sink' }),
        nodes: [],
        edges: [],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(false)
    })
  })

  describe('findTaintPaths', () => {
    it('finds no paths in empty graph', () => {
      const analyzer = new TaintAnalyzer()
      const graph = makeGraph([], [])
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toEqual([])
    })

    it('finds no paths with only source nodes', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 'n0', type: 'source', name: 'req.query' })
      const graph = makeGraph([source], [])
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toEqual([])
    })

    it('finds no paths with only sink nodes', () => {
      const analyzer = new TaintAnalyzer()
      const sink = makeNode({ id: 'n0', type: 'sink', name: 'mysql.query' })
      const graph = makeGraph([sink], [])
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toEqual([])
    })

    it('finds a direct source-to-sink path', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [makeEdge({ from: 's1', to: 'sk1', type: 'assignment' })]
      const graph = makeGraph([source, sink], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(1)
      expect(paths[0]!.source.id).toBe('s1')
      expect(paths[0]!.sink.id).toBe('sk1')
      expect(paths[0]!.isSanitized).toBe(false)
    })

    it('finds path through propagator', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const prop = makeNode({ id: 'p1', type: 'propagator', name: 'data' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [
        makeEdge({ from: 's1', to: 'p1' }),
        makeEdge({ from: 'p1', to: 'sk1' }),
      ]
      const graph = makeGraph([source, prop, sink], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(1)
      expect(paths[0]!.nodes.length).toBe(3)
    })

    it('finds sanitized path through sanitizer', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sanitizer = makeNode({ id: 'san1', type: 'sanitizer', name: 'escapeHtml', sanitized: true, sanitizerName: 'escapeHtml' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [
        makeEdge({ from: 's1', to: 'san1' }),
        makeEdge({ from: 'san1', to: 'sk1' }),
      ]
      const graph = makeGraph([source, sanitizer, sink], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(1)
      expect(paths[0]!.isSanitized).toBe(true)
      expect(paths[0]!.sanitizer).toBe('escapeHtml')
    })

    it('finds multiple paths from one source', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink1 = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const sink2 = makeNode({ id: 'sk2', type: 'sink', name: 'eval(', line: 5 })
      const edges = [
        makeEdge({ from: 's1', to: 'sk1' }),
        makeEdge({ from: 's1', to: 'sk2' }),
      ]
      const graph = makeGraph([source, sink1, sink2], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(2)
    })

    it('handles disconnected graph', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const graph = makeGraph([source, sink], [])
      const paths = analyzer.findTaintPaths(graph)
      expect(paths).toEqual([])
    })

    it('handles branching paths', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const branch1 = makeNode({ id: 'b1', type: 'propagator', name: 'a' })
      const branch2 = makeNode({ id: 'b2', type: 'propagator', name: 'b' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [
        makeEdge({ from: 's1', to: 'b1' }),
        makeEdge({ from: 's1', to: 'b2' }),
        makeEdge({ from: 'b1', to: 'sk1' }),
        makeEdge({ from: 'b2', to: 'sk1' }),
      ]
      const graph = makeGraph([source, branch1, branch2, sink], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(1)
    })

    it('handles diamond graph pattern', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.params' })
      const top = makeNode({ id: 't1', type: 'propagator', name: 'top' })
      const left = makeNode({ id: 'l1', type: 'propagator', name: 'left' })
      const right = makeNode({ id: 'r1', type: 'propagator', name: 'right' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'eval(' })
      const edges = [
        makeEdge({ from: 's1', to: 't1' }),
        makeEdge({ from: 't1', to: 'l1' }),
        makeEdge({ from: 't1', to: 'r1' }),
        makeEdge({ from: 'l1', to: 'sk1' }),
        makeEdge({ from: 'r1', to: 'sk1' }),
      ]
      const graph = makeGraph([source, top, left, right, sink], edges)
      const paths = analyzer.findTaintPaths(graph)
      expect(paths.length).toBe(1)
    })
  })

  describe('analyzeGraph', () => {
    it('returns empty vulnerabilities for clean graph', () => {
      const analyzer = new TaintAnalyzer()
      const graph = makeGraph(
        [makeNode({ id: 'n1', type: 'variable', name: 'x' })],
        [],
      )
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toEqual([])
    })

    it('detects a vulnerability from source to sink', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query', filePath: 'app.ts', line: 10, column: 5 })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query', filePath: 'app.ts', line: 12, column: 3 })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.type).toBe('sql-injection')
      expect(vulns[0]!.severity).toBe('high')
      expect(vulns[0]!.source).toBe('req.query')
      expect(vulns[0]!.sink).toBe('mysql.query')
      expect(vulns[0]!.filePath).toBe('app.ts')
      expect(vulns[0]!.line).toBe(12)
      expect(vulns[0]!.cwe).toBe('CWE-89')
    })

    it('does not report sanitized paths', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sanitizer = makeNode({ id: 'san1', type: 'sanitizer', name: 'escapeHtml', sanitized: true, sanitizerName: 'escapeHtml' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'innerHTML' })
      const edges = [
        makeEdge({ from: 's1', to: 'san1' }),
        makeEdge({ from: 'san1', to: 'sk1' }),
      ]
      const graph = makeGraph([source, sanitizer, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toEqual([])
    })

    it('detects XSS vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'innerHTML' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.type).toBe('xss-injection')
      expect(vulns[0]!.severity).toBe('medium')
      expect(vulns[0]!.cwe).toBe('CWE-79')
    })

    it('detects command injection vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.body' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'exec(' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.type).toBe('command-injection')
      expect(vulns[0]!.severity).toBe('high')
    })

    it('detects eval vulnerability as critical', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.params' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'eval(' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns[0]!.severity).toBe('critical')
      expect(vulns[0]!.cwe).toBe('CWE-94')
    })

    it('detects path traversal vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'path.join' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.type).toBe('path-injection')
      expect(vulns[0]!.severity).toBe('medium')
    })

    it('detects open redirect vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'res.redirect' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.severity).toBe('low')
      expect(vulns[0]!.cwe).toBe('CWE-601')
    })

    it('detects deserialization vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.body' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'JSON.parse' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(1)
      expect(vulns[0]!.type).toBe('deserialize-injection')
      expect(vulns[0]!.severity).toBe('low')
    })

    it('includes suggestion in vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns[0]!.suggestion).toBeTruthy()
    })

    it('includes message in vulnerability', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const edges = [makeEdge({ from: 's1', to: 'sk1' })]
      const graph = makeGraph([source, sink], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns[0]!.message).toContain('req.query')
      expect(vulns[0]!.message).toContain('mysql.query')
    })

    it('detects multiple vulnerabilities', () => {
      const analyzer = new TaintAnalyzer()
      const source1 = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const source2 = makeNode({ id: 's2', type: 'source', name: 'req.body' })
      const sink1 = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const sink2 = makeNode({ id: 'sk2', type: 'sink', name: 'eval(' })
      const edges = [
        makeEdge({ from: 's1', to: 'sk1' }),
        makeEdge({ from: 's2', to: 'sk2' }),
      ]
      const graph = makeGraph([source1, source2, sink1, sink2], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns.length).toBe(2)
    })

    it('handles empty graph', () => {
      const analyzer = new TaintAnalyzer()
      const graph = makeGraph([], [])
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toEqual([])
    })

    it('handles graph with only propagators', () => {
      const analyzer = new TaintAnalyzer()
      const prop1 = makeNode({ id: 'p1', type: 'propagator', name: 'a' })
      const prop2 = makeNode({ id: 'p2', type: 'propagator', name: 'b' })
      const edges = [makeEdge({ from: 'p1', to: 'p2' })]
      const graph = makeGraph([prop1, prop2], edges)
      const vulns = analyzer.analyzeGraph(graph)
      expect(vulns).toEqual([])
    })
  })

  describe('analyzeGraphs', () => {
    it('returns empty result for empty array', () => {
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([])
      expect(result.vulnerabilities).toEqual([])
      expect(result.graphs).toEqual([])
      expect(result.summary.totalVulnerabilities).toBe(0)
      expect(result.summary.totalSources).toBe(0)
      expect(result.summary.totalSinks).toBe(0)
    })

    it('counts sources and sinks across graphs', () => {
      const analyzer = new TaintAnalyzer()
      const graph1 = makeGraph(
        [makeNode({ id: 's1', type: 'source', name: 'req.query' })],
        [],
        'file1.ts',
      )
      const graph2 = makeGraph(
        [makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })],
        [],
        'file2.ts',
      )
      const result = analyzer.analyzeGraphs([graph1, graph2])
      expect(result.summary.totalSources).toBe(1)
      expect(result.summary.totalSinks).toBe(1)
    })

    it('counts vulnerabilities by severity', () => {
      const analyzer = new TaintAnalyzer()
      const g1 = makeGraph(
        [
          makeNode({ id: 's1', type: 'source', name: 'req.query' }),
          makeNode({ id: 'sk1', type: 'sink', name: 'eval(' }),
        ],
        [makeEdge({ from: 's1', to: 'sk1' })],
        'file1.ts',
      )
      const g2 = makeGraph(
        [
          makeNode({ id: 's2', type: 'source', name: 'req.body' }),
          makeNode({ id: 'sk2', type: 'sink', name: 'res.redirect' }),
        ],
        [makeEdge({ from: 's2', to: 'sk2' })],
        'file2.ts',
      )
      const result = analyzer.analyzeGraphs([g1, g2])
      expect(result.summary.totalVulnerabilities).toBe(2)
      expect(result.summary.criticalCount).toBe(1)
      expect(result.summary.lowCount).toBe(1)
    })

    it('returns the graphs in result', () => {
      const analyzer = new TaintAnalyzer()
      const g1 = makeGraph([], [], 'file1.ts')
      const g2 = makeGraph([], [], 'file2.ts')
      const result = analyzer.analyzeGraphs([g1, g2])
      expect(result.graphs).toEqual([g1, g2])
    })

    it('aggregates vulnerability counts correctly', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sink1 = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
      const sink2 = makeNode({ id: 'sk2', type: 'sink', name: 'eval(' })
      const g1 = makeGraph(
        [source, sink1],
        [makeEdge({ from: 's1', to: 'sk1' })],
        'file1.ts',
      )
      const g2 = makeGraph(
        [makeNode({ id: 's2', type: 'source', name: 'req.body' }), sink2],
        [makeEdge({ from: 's2', to: 'sk2' })],
        'file2.ts',
      )
      const result = analyzer.analyzeGraphs([g1, g2])
      expect(result.summary.highCount).toBe(1)
      expect(result.summary.criticalCount).toBe(1)
      expect(result.summary.mediumCount).toBe(0)
    })

    it('reports zero counts when sanitized', () => {
      const analyzer = new TaintAnalyzer()
      const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
      const sanitizer = makeNode({ id: 'san1', type: 'sanitizer', name: 'escapeHtml', sanitized: true, sanitizerName: 'escapeHtml' })
      const sink = makeNode({ id: 'sk1', type: 'sink', name: 'innerHTML' })
      const graph = makeGraph(
        [source, sanitizer, sink],
        [makeEdge({ from: 's1', to: 'san1' }), makeEdge({ from: 'san1', to: 'sk1' })],
      )
      const result = analyzer.analyzeGraphs([graph])
      expect(result.summary.totalVulnerabilities).toBe(0)
    })
  })
})

describe('Integration: DataFlowBuilder + TaintAnalyzer', () => {
  it('builds graph from source and detects SQL injection', () => {
    const source = 'const userInput = req.query.id\nmysql.query(userInput)'
    const builder = new DataFlowBuilder('vuln.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
  })

  it('builds graph from source and detects XSS', () => {
    const source = 'const name = req.query.name\nelement.innerHTML = name'
    const builder = new DataFlowBuilder('xss.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
    const xssVulns = vulns.filter((v) => v.type === 'xss-injection')
    expect(xssVulns.length).toBeGreaterThan(0)
  })

  it('builds graph and analyzes multiple files', () => {
    const source1 = 'const input = req.query.id\nmysql.query(input)'
    const source2 = 'const data = req.body\neval(data)'

    const builder1 = new DataFlowBuilder('file1.ts')
    const graph1 = builder1.buildFromSource(source1)

    const builder2 = new DataFlowBuilder('file2.ts')
    const graph2 = builder2.buildFromSource(source2)

    const analyzer = new TaintAnalyzer()
    const result = analyzer.analyzeGraphs([graph1, graph2])
    expect(result.summary.totalVulnerabilities).toBeGreaterThan(0)
    expect(result.graphs.length).toBe(2)
  })

  it('detects no vulnerability when data is sanitized', () => {
    const source = 'const raw = req.query.name\nconst clean = escapeHtml(raw)\nelement.innerHTML = clean'
    const builder = new DataFlowBuilder('safe.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBe(0)
  })

  it('handles complex multi-step data flow', () => {
    const source = [
      'const input = req.query',
      'const data = input',
      'const result = data',
      'mysql.query(result)',
    ].join('\n')
    const builder = new DataFlowBuilder('complex.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
  })

  it('handles process.env as source', () => {
    const source = 'const key = process.env.SECRET\nmysql.query(key)'
    const builder = new DataFlowBuilder('env.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
  })

  it('handles command injection via exec', () => {
    const source = 'const cmd = req.body.command\nexec(cmd)'
    const builder = new DataFlowBuilder('cmd.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
    const cmdVulns = vulns.filter((v) => v.type === 'command-injection')
    expect(cmdVulns.length).toBeGreaterThan(0)
  })

  it('handles path traversal', () => {
    const source = 'const file = req.query.file\nconst resolved = path.join("/base", file)'
    const builder = new DataFlowBuilder('path.ts')
    const graph = builder.buildFromSource(source)
    const analyzer = new TaintAnalyzer()
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBeGreaterThan(0)
  })
})

describe('Edge Cases', () => {
  it('handles single node graph', () => {
    const analyzer = new TaintAnalyzer()
    const nodeMap = new Map<string, FlowNode>()
    const node: FlowNode = { id: 'n0', type: 'source', name: 'req.query', filePath: 'test.ts', line: 1, column: 1 }
    nodeMap.set('n0', node)
    const graph: DataFlowGraph = { nodes: nodeMap, edges: [], filePath: 'test.ts' }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths).toEqual([])
  })

  it('handles graph with only edges (dangling references)', () => {
    const analyzer = new TaintAnalyzer()
    const graph: DataFlowGraph = {
      nodes: new Map(),
      edges: [makeEdge()],
      filePath: 'test.ts',
    }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths).toEqual([])
  })

  it('handles self-loop edge', () => {
    const analyzer = new TaintAnalyzer()
    const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
    const edges = [makeEdge({ from: 's1', to: 's1' })]
    const nodeMap = new Map<string, FlowNode>()
    nodeMap.set('s1', source)
    const graph: DataFlowGraph = { nodes: nodeMap, edges, filePath: 'test.ts' }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths).toEqual([])
  })

  it('handles cyclic graph without infinite loop', () => {
    const analyzer = new TaintAnalyzer()
    const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
    const prop = makeNode({ id: 'p1', type: 'propagator', name: 'a' })
    const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
    const edges = [
      makeEdge({ from: 's1', to: 'p1' }),
      makeEdge({ from: 'p1', to: 'sk1' }),
      makeEdge({ from: 'p1', to: 'p1' }),
    ]
    const nodeMap = new Map<string, FlowNode>()
    nodeMap.set('s1', source)
    nodeMap.set('p1', prop)
    nodeMap.set('sk1', sink)
    const graph: DataFlowGraph = { nodes: nodeMap, edges, filePath: 'test.ts' }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths.length).toBe(1)
  })

  it('handles deeply nested path', () => {
    const analyzer = new TaintAnalyzer()
    const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
    const nodes = [source]
    const edges: FlowEdge[] = []
    for (let i = 0; i < 20; i++) {
      const node = makeNode({ id: `p${i}`, type: 'propagator' as FlowNodeType, name: `prop${i}` })
      nodes.push(node)
      edges.push(makeEdge({ from: nodes[nodes.length - 2]!.id, to: node.id }))
    }
    const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
    nodes.push(sink)
    edges.push(makeEdge({ from: nodes[nodes.length - 2]!.id, to: sink.id }))
    const nodeMap = new Map<string, FlowNode>()
    for (const n of nodes) nodeMap.set(n.id, n)
    const graph: DataFlowGraph = { nodes: nodeMap, edges, filePath: 'test.ts' }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths.length).toBe(1)
    expect(paths[0]!.nodes.length).toBe(22)
  })

  it('handles multiple sources reaching same sink', () => {
    const analyzer = new TaintAnalyzer()
    const s1 = makeNode({ id: 's1', type: 'source', name: 'req.query' })
    const s2 = makeNode({ id: 's2', type: 'source', name: 'req.body' })
    const sink = makeNode({ id: 'sk1', type: 'sink', name: 'mysql.query' })
    const edges = [
      makeEdge({ from: 's1', to: 'sk1' }),
      makeEdge({ from: 's2', to: 'sk1' }),
    ]
    const nodeMap = new Map<string, FlowNode>()
    nodeMap.set('s1', s1)
    nodeMap.set('s2', s2)
    nodeMap.set('sk1', sink)
    const graph: DataFlowGraph = { nodes: nodeMap, edges, filePath: 'test.ts' }
    const paths = analyzer.findTaintPaths(graph)
    expect(paths.length).toBe(2)
  })

  it('builder resets node counter on buildFromSource', () => {
    const builder = new DataFlowBuilder('test.ts')
    builder.addNode('variable', 'x', 1, 1)
    builder.addNode('variable', 'y', 2, 1)
    const graph = builder.buildFromSource('const a = 42')
    const node = [...graph.nodes.values()].find((n) => n.name === 'a')
    expect(node).toBeDefined()
    expect(node!.id).toBe('node_0')
  })

  it('builder handles source with only whitespace lines', () => {
    const builder = new DataFlowBuilder('test.ts')
    const graph = builder.buildFromSource('   \n\t\n   ')
    expect(graph.nodes.size).toBe(0)
  })

  it('analyzer handles unknown sink category gracefully', () => {
    const analyzer = new TaintAnalyzer()
    const source = makeNode({ id: 's1', type: 'source', name: 'req.query' })
    const sink = makeNode({ id: 'sk1', type: 'sink', name: 'customSink' })
    const edges = [makeEdge({ from: 's1', to: 'sk1' })]
    const nodeMap = new Map<string, FlowNode>()
    nodeMap.set('s1', source)
    nodeMap.set('sk1', sink)
    const graph: DataFlowGraph = { nodes: nodeMap, edges, filePath: 'test.ts' }
    const vulns = analyzer.analyzeGraph(graph)
    expect(vulns.length).toBe(1)
    expect(vulns[0]!.type).toBe('unknown-injection')
  })
})

describe('Type exports', () => {
  it('FlowNodeType has all expected values', () => {
    const types: FlowNodeType[] = [
      'source',
      'sink',
      'propagator',
      'sanitizer',
      'variable',
      'parameter',
      'return',
      'literal',
    ]
    expect(types.length).toBe(8)
  })

  it('TaintSource interface is usable', () => {
    const source: TaintSource = {
      name: 'test-source',
      category: 'user-input',
      patterns: ['test('],
    }
    expect(source.name).toBe('test-source')
    expect(source.category).toBe('user-input')
  })

  it('TaintSink interface is usable', () => {
    const sink: TaintSink = {
      name: 'test-sink',
      category: 'sql',
      patterns: ['test.query'],
    }
    expect(sink.name).toBe('test-sink')
    expect(sink.category).toBe('sql')
  })

  it('SecurityVulnerability interface is usable', () => {
    const vuln: SecurityVulnerability = {
      type: 'sql-injection',
      severity: 'high',
      filePath: 'test.ts',
      line: 1,
      column: 1,
      message: 'test',
      source: 'req.query',
      sink: 'mysql.query',
      path: {
        source: makeNode({ type: 'source' }),
        sink: makeNode({ type: 'sink' }),
        nodes: [],
        edges: [],
        isSanitized: false,
      },
      suggestion: 'test',
      cwe: 'CWE-89',
    }
    expect(vuln.severity).toBe('high')
  })

  it('DataFlowAnalysisResult interface is usable', () => {
    const result: DataFlowAnalysisResult = {
      vulnerabilities: [],
      graphs: [],
      summary: {
        totalSources: 0,
        totalSinks: 0,
        totalVulnerabilities: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      },
    }
    expect(result.summary.totalVulnerabilities).toBe(0)
  })
})
