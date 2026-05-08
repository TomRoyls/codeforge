import type { DataFlowGraph, TaintPath, SecurityVulnerability, DataFlowAnalysisResult, FlowNode } from './types.js'
import { TAINT_SINKS } from './types.js'

export class TaintAnalyzer {
  analyzeGraph(graph: DataFlowGraph): SecurityVulnerability[] {
    const paths = this.findTaintPaths(graph)
    const vulnerabilities: SecurityVulnerability[] = []

    for (const taintPath of paths) {
      if (taintPath.isSanitized) continue

      const sinkCategory = this.getSinkCategory(taintPath.sink.name)
      const vuln: SecurityVulnerability = {
        type: `${sinkCategory}-injection`,
        severity: this.getSeverity(sinkCategory),
        filePath: taintPath.sink.filePath,
        line: taintPath.sink.line,
        column: taintPath.sink.column,
        message: `Potential ${sinkCategory} vulnerability: data from ${taintPath.source.name} flows to ${taintPath.sink.name} without sanitization`,
        source: taintPath.source.name,
        sink: taintPath.sink.name,
        path: taintPath,
        suggestion: this.getSuggestion(sinkCategory),
        cwe: this.getCWE(sinkCategory),
      }
      vulnerabilities.push(vuln)
    }

    return vulnerabilities
  }

  analyzeGraphs(graphs: DataFlowGraph[]): DataFlowAnalysisResult {
    const allVulnerabilities: SecurityVulnerability[] = []
    let totalSources = 0
    let totalSinks = 0

    for (const graph of graphs) {
      for (const node of graph.nodes.values()) {
        if (node.type === 'source') totalSources++
        if (node.type === 'sink') totalSinks++
      }
      const vulns = this.analyzeGraph(graph)
      allVulnerabilities.push(...vulns)
    }

    const criticalCount = allVulnerabilities.filter((v) => v.severity === 'critical').length
    const highCount = allVulnerabilities.filter((v) => v.severity === 'high').length
    const mediumCount = allVulnerabilities.filter((v) => v.severity === 'medium').length
    const lowCount = allVulnerabilities.filter((v) => v.severity === 'low').length

    return {
      vulnerabilities: allVulnerabilities,
      graphs,
      summary: {
        totalSources,
        totalSinks,
        totalVulnerabilities: allVulnerabilities.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      },
    }
  }

  findTaintPaths(graph: DataFlowGraph): TaintPath[] {
    const paths: TaintPath[] = []

    const sources: FlowNode[] = []
    for (const node of graph.nodes.values()) {
      if (node.type === 'source') {
        sources.push(node)
      }
    }

    for (const source of sources) {
      const foundPaths = this.bfsFromSource(graph, source)
      paths.push(...foundPaths)
    }

    return paths
  }

  isPathSanitized(path: TaintPath): boolean {
    for (const node of path.nodes) {
      if (node.type === 'sanitizer' || node.sanitized) {
        return true
      }
    }
    return false
  }

  getSeverity(sinkCategory: string): SecurityVulnerability['severity'] {
    switch (sinkCategory) {
      case 'eval':
        return 'critical'
      case 'sql':
      case 'command':
        return 'high'
      case 'xss':
      case 'path':
        return 'medium'
      case 'redirect':
      case 'deserialize':
        return 'low'
      default:
        return 'medium'
    }
  }

  getCWE(sinkCategory: string): string {
    switch (sinkCategory) {
      case 'sql':
        return 'CWE-89'
      case 'xss':
        return 'CWE-79'
      case 'command':
        return 'CWE-78'
      case 'path':
        return 'CWE-22'
      case 'eval':
        return 'CWE-94'
      case 'deserialize':
        return 'CWE-502'
      case 'redirect':
        return 'CWE-601'
      default:
        return 'CWE-200'
    }
  }

  getSuggestion(vulnType: string): string {
    switch (vulnType) {
      case 'sql':
        return 'Use parameterized queries or an ORM'
      case 'xss':
        return 'Sanitize output with escapeHtml or DOMPurify'
      case 'command':
        return 'Use child_process.execFile with argument arrays'
      case 'path':
        return 'Validate and normalize paths before use'
      case 'eval':
        return 'Avoid eval(); use JSON.parse for data'
      case 'deserialize':
        return 'Validate input before deserializing'
      case 'redirect':
        return 'Validate redirect URLs against an allowlist'
      default:
        return 'Review and validate all user input'
    }
  }

  private bfsFromSource(graph: DataFlowGraph, source: FlowNode): TaintPath[] {
    const results: TaintPath[] = []
    const adjacency = this.buildAdjacencyList(graph)

    const visited = new Set<string>()
    const queue: { nodeId: string; pathNodes: FlowNode[]; pathEdges: import('./types.js').FlowEdge[] }[] = [
      { nodeId: source.id, pathNodes: [source], pathEdges: [] },
    ]
    visited.add(source.id)

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) continue

      const currentNode = graph.nodes.get(current.nodeId)
      if (!currentNode) continue

      if (currentNode.type === 'sink' && currentNode.id !== source.id) {
        const taintPath: TaintPath = {
          source,
          sink: currentNode,
          nodes: [...current.pathNodes],
          edges: [...current.pathEdges],
          isSanitized: false,
        }
        taintPath.isSanitized = this.isPathSanitized(taintPath)
        if (taintPath.isSanitized) {
          const sanitizerNode = current.pathNodes.find((n) => n.type === 'sanitizer' || n.sanitized)
          taintPath.sanitizer = sanitizerNode?.sanitizerName ?? sanitizerNode?.name
        }
        results.push(taintPath)
        continue
      }

      const neighbors = adjacency.get(current.nodeId)
      if (!neighbors) continue

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.toId)) {
          visited.add(neighbor.toId)
          const neighborNode = graph.nodes.get(neighbor.toId)
          if (neighborNode) {
            queue.push({
              nodeId: neighbor.toId,
              pathNodes: [...current.pathNodes, neighborNode],
              pathEdges: [...current.pathEdges, neighbor.edge],
            })
          }
        }
      }
    }

    return results
  }

  private buildAdjacencyList(
    graph: DataFlowGraph,
  ): Map<string, { toId: string; edge: import('./types.js').FlowEdge }[]> {
    const adjacency = new Map<string, { toId: string; edge: import('./types.js').FlowEdge }[]>()

    for (const edge of graph.edges) {
      const existing = adjacency.get(edge.from) ?? []
      existing.push({ toId: edge.to, edge })
      adjacency.set(edge.from, existing)
    }

    return adjacency
  }

  private normalizePattern(pattern: string): string {
    let clean = pattern
    if (clean.startsWith('.')) clean = clean.slice(1)
    if (clean.endsWith('(')) clean = clean.slice(0, -1)
    return clean
  }

  private getSinkCategory(sinkName: string): string {
    for (const sink of TAINT_SINKS) {
      for (const pattern of sink.patterns) {
        if (sinkName.includes(this.normalizePattern(pattern))) {
          return sink.category
        }
      }
    }
    return 'unknown'
  }
}
