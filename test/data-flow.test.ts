import { describe, it, expect } from 'vitest'
import { DataFlowBuilder, TaintAnalyzer, TAINT_SOURCES, TAINT_SINKS, SANITIZERS } from '../src/core/data-flow/index.js'

// ─── DataFlowBuilder ───

describe('DataFlowBuilder', () => {
  describe('construction', () => {
    it('should create builder with file path', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.getGraph()
      expect(graph.filePath).toBe('test.ts')
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges).toEqual([])
    })
  })

  describe('addNode', () => {
    it('should add a basic variable node', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'x', 1, 1)
      expect(node.name).toBe('x')
      expect(node.type).toBe('variable')
      expect(node.line).toBe(1)
    })

    it('should detect source nodes by name', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'req.params', 1, 1)
      expect(node.type).toBe('source')
    })

    it('should detect sink nodes by name', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'eval', 1, 1)
      expect(node.type).toBe('sink')
    })

    it('should detect sanitizer nodes by name', () => {
      const builder = new DataFlowBuilder('test.ts')
      const node = builder.addNode('variable', 'escapeHtml', 1, 1)
      expect(node.type).toBe('sanitizer')
      expect(node.sanitized).toBe(true)
    })
  })

  describe('addEdge', () => {
    it('should add an edge between nodes', () => {
      const builder = new DataFlowBuilder('test.ts')
      const a = builder.addNode('variable', 'a', 1, 1)
      const b = builder.addNode('variable', 'b', 2, 1)
      builder.addEdge(a.id, b.id, 'assignment')
      const graph = builder.getGraph()
      expect(graph.edges.length).toBe(1)
      expect(graph.edges[0]!.from).toBe(a.id)
      expect(graph.edges[0]!.to).toBe(b.id)
    })
  })

  describe('buildFromSource', () => {
    it('should parse variable assignments', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const x = 42')
      expect(graph.nodes.size).toBeGreaterThan(0)
      const names = [...graph.nodes.values()].map((n) => n.name)
      expect(names).toContain('x')
    })

    it('should skip comment lines', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('// this is a comment')
      const variableNodes = [...graph.nodes.values()].filter((n) => n.type === 'variable')
      expect(variableNodes.length).toBe(0)
    })

    it('should detect function parameters', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('function greet(name) {}')
      const paramNodes = [...graph.nodes.values()].filter((n) => n.type === 'parameter')
      expect(paramNodes.length).toBeGreaterThan(0)
    })

    it('should detect return statements', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('return x + 1')
      const returnNodes = [...graph.nodes.values()].filter((n) => n.type === 'return')
      expect(returnNodes.length).toBeGreaterThan(0)
    })

    it('should detect source calls in code', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const data = req.params.id')
      const sourceNodes = [...graph.nodes.values()].filter((n) => n.type === 'source')
      expect(sourceNodes.length).toBeGreaterThan(0)
    })

    it('should detect sink calls in code', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('eval(userInput)')
      const sinkNodes = [...graph.nodes.values()].filter((n) => n.type === 'sink')
      expect(sinkNodes.length).toBeGreaterThan(0)
    })

    it('should reset graph on each buildFromSource call', () => {
      const builder = new DataFlowBuilder('test.ts')
      builder.buildFromSource('const x = 1')
      const firstCount = builder.getGraph().nodes.size
      builder.buildFromSource('const y = 2')
      expect(builder.getGraph().nodes.size).toBe(firstCount)
    })
  })

  describe('reset', () => {
    it('should clear all nodes and edges', () => {
      const builder = new DataFlowBuilder('test.ts')
      builder.buildFromSource('const x = 1')
      builder.reset()
      expect(builder.getGraph().nodes.size).toBe(0)
      expect(builder.getGraph().edges).toEqual([])
    })
  })
})

// ─── TaintAnalyzer ───

describe('TaintAnalyzer', () => {
  describe('getSeverity', () => {
    const analyzer = new TaintAnalyzer()
    it('should return critical for eval', () => {
      expect(analyzer.getSeverity('eval')).toBe('critical')
    })
    it('should return high for sql', () => {
      expect(analyzer.getSeverity('sql')).toBe('high')
    })
    it('should return medium for xss', () => {
      expect(analyzer.getSeverity('xss')).toBe('medium')
    })
    it('should return low for redirect', () => {
      expect(analyzer.getSeverity('redirect')).toBe('low')
    })
    it('should return medium for unknown', () => {
      expect(analyzer.getSeverity('unknown')).toBe('medium')
    })
  })

  describe('getCWE', () => {
    const analyzer = new TaintAnalyzer()
    it('should return correct CWE IDs', () => {
      expect(analyzer.getCWE('sql')).toBe('CWE-89')
      expect(analyzer.getCWE('xss')).toBe('CWE-79')
      expect(analyzer.getCWE('command')).toBe('CWE-78')
      expect(analyzer.getCWE('path')).toBe('CWE-22')
      expect(analyzer.getCWE('eval')).toBe('CWE-94')
      expect(analyzer.getCWE('deserialize')).toBe('CWE-502')
      expect(analyzer.getCWE('redirect')).toBe('CWE-601')
    })
  })

  describe('getSuggestion', () => {
    const analyzer = new TaintAnalyzer()
    it('should return suggestions for each type', () => {
      expect(analyzer.getSuggestion('sql').toLowerCase()).toContain('parameterized')
      expect(analyzer.getSuggestion('xss').toLowerCase()).toContain('sanitize')
      expect(analyzer.getSuggestion('command').toLowerCase()).toContain('execfile')
      expect(analyzer.getSuggestion('eval').toLowerCase()).toContain('json.parse')
    })
  })

  describe('isPathSanitized', () => {
    const analyzer = new TaintAnalyzer()
    it('should detect sanitized paths', () => {
      const path = {
        source: { id: 's1', type: 'source' as const, name: 'input', filePath: 'a.ts', line: 1, column: 1 },
        sink: { id: 'k1', type: 'sink' as const, name: 'eval', filePath: 'a.ts', line: 3, column: 1 },
        nodes: [
          { id: 's1', type: 'source' as const, name: 'input', filePath: 'a.ts', line: 1, column: 1 },
          { id: 'san1', type: 'sanitizer' as const, name: 'escapeHtml', filePath: 'a.ts', line: 2, column: 1, sanitized: true, sanitizerName: 'escapeHtml' },
          { id: 'k1', type: 'sink' as const, name: 'eval', filePath: 'a.ts', line: 3, column: 1 },
        ] as any,
        edges: [],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(true)
    })

    it('should detect unsanitized paths', () => {
      const path = {
        source: { id: 's1', type: 'source' as const, name: 'input', filePath: 'a.ts', line: 1, column: 1 },
        sink: { id: 'k1', type: 'sink' as const, name: 'eval', filePath: 'a.ts', line: 2, column: 1 },
        nodes: [
          { id: 's1', type: 'source' as const, name: 'input', filePath: 'a.ts', line: 1, column: 1 },
          { id: 'k1', type: 'sink' as const, name: 'eval', filePath: 'a.ts', line: 2, column: 1 },
        ] as any,
        edges: [],
        isSanitized: false,
      }
      expect(analyzer.isPathSanitized(path)).toBe(false)
    })
  })

  describe('analyzeGraphs', () => {
    it('should aggregate results across multiple graphs', () => {
      const builder = new DataFlowBuilder('test.ts')
      const graph = builder.buildFromSource('const x = 1')
      const analyzer = new TaintAnalyzer()
      const result = analyzer.analyzeGraphs([graph])
      expect(result.graphs.length).toBe(1)
      expect(result.summary).toBeDefined()
      expect(typeof result.summary.totalVulnerabilities).toBe('number')
    })
  })
})

// ─── Constants ───

describe('Constants', () => {
  it('should have TAINT_SOURCES with common sources', () => {
    expect(TAINT_SOURCES.length).toBeGreaterThan(0)
    const names = TAINT_SOURCES.map((s) => s.name)
    expect(names).toContain('process.argv')
    expect(names).toContain('req.body')
  })

  it('should have TAINT_SINKS with common sinks', () => {
    expect(TAINT_SINKS.length).toBeGreaterThan(0)
    const names = TAINT_SINKS.map((s) => s.name)
    expect(names).toContain('eval')
    expect(names).toContain('innerHTML')
  })

  it('should have SANITIZERS list', () => {
    expect(SANITIZERS.length).toBeGreaterThan(0)
    expect(SANITIZERS).toContain('escapeHtml')
    expect(SANITIZERS).toContain('encodeURI')
  })
})
