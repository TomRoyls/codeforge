import type { FlowNode, FlowNodeType, FlowEdge, DataFlowGraph } from './types.js'
import { TAINT_SOURCES, TAINT_SINKS, SANITIZERS } from './types.js'

export class DataFlowBuilder {
  private graph: DataFlowGraph
  private filePath: string
  private nodeIdCounter: number

  constructor(filePath: string) {
    this.filePath = filePath
    this.nodeIdCounter = 0
    this.graph = {
      nodes: new Map(),
      edges: [],
      filePath,
    }
  }

  addNode(type: FlowNodeType, name: string, line: number, column: number, dataType?: string): FlowNode {
    const id = `node_${this.nodeIdCounter++}`
    const node: FlowNode = {
      id,
      type,
      name,
      filePath: this.filePath,
      line,
      column,
      dataType,
    }

    if (this.isSourceName(name)) {
      node.type = 'source'
    } else if (this.isSinkName(name)) {
      node.type = 'sink'
    } else if (this.isSanitizerName(name)) {
      node.type = 'sanitizer'
      node.sanitized = true
      node.sanitizerName = name
    }

    this.graph.nodes.set(id, node)
    return node
  }

  addEdge(fromId: string, toId: string, type: FlowEdge['type'], label?: string): void {
    this.graph.edges.push({ from: fromId, to: toId, type, label })
  }

  buildFromSource(source: string): DataFlowGraph {
    this.graph = {
      nodes: new Map(),
      edges: [],
      filePath: this.filePath,
    }
    this.nodeIdCounter = 0

    const lines = source.split('\n')

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      if (!line) continue
      const lineNum = lineIndex + 1
      this.processLine(line, lineNum)
    }

    return this.graph
  }

  getGraph(): DataFlowGraph {
    return this.graph
  }

  reset(): void {
    this.graph = {
      nodes: new Map(),
      edges: [],
      filePath: this.filePath,
    }
    this.nodeIdCounter = 0
  }

  private processLine(line: string, lineNum: number): void {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return
    }

    this.detectFunctionParams(trimmed, lineNum)
    this.detectAssignments(trimmed, lineNum)
    this.detectFunctionCalls(trimmed, lineNum)
    this.detectReturnStatements(trimmed, lineNum)
    this.detectMemberAccess(trimmed, lineNum)
  }

  private detectAssignments(line: string, lineNum: number): void {
    const assignMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.+)/)
    if (assignMatch) {
      const varName = assignMatch[1] ?? ''
      const rhsRaw = assignMatch[2] ?? ''
      const rhs = rhsRaw.trimEnd().replace(/;$/, '')
      const column = line.indexOf(varName) + 1

      const varNode = this.addNode('variable', varName, lineNum, column)

      const rhsNodes = this.processExpression(rhs, lineNum, column + varName.length + 3)
      for (const rhsNode of rhsNodes) {
        this.addEdge(rhsNode.id, varNode.id, 'assignment', `${varName} = ${rhs}`)
      }
      return
    }

    const plainAssign = line.match(/(\w+)\s*=\s*(.+)/)
    if (plainAssign && !line.includes('==') && !line.includes('=>')) {
      const varName = plainAssign[1] ?? ''
      const rhsRaw = plainAssign[2] ?? ''
      const rhs = rhsRaw.trimEnd().replace(/;$/, '')
      const column = line.indexOf(varName) + 1

      const existingVar = this.findNodeByName(varName)
      const varNode = existingVar ?? this.addNode('variable', varName, lineNum, column)

      const rhsNodes = this.processExpression(rhs, lineNum, column + varName.length + 3)
      for (const rhsNode of rhsNodes) {
        this.addEdge(rhsNode.id, varNode.id, 'assignment', `${varName} = ${rhs}`)
      }
    }
  }

  private detectFunctionParams(line: string, lineNum: number): void {
    const funcMatch = line.match(/(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?)\s*\(([^)]*)\)/)
    if (funcMatch) {
      const paramsStr = funcMatch[1] ?? ''
      const params = paramsStr.split(',').map((p) => p.trim()).filter((p) => p.length > 0)
      for (const param of params) {
        const cleanParam = param.split(':')[0]?.trim() ?? param
        const paramName = cleanParam.split('=')[0]?.trim() ?? cleanParam
        if (paramName) {
          const paramNode = this.addNode('parameter', paramName, lineNum, line.indexOf(paramName) + 1)
          if (this.isSourceName(paramName)) {
            paramNode.type = 'source'
          }
        }
      }
    }

    const arrowMatch = line.match(/\(([^)]*)\)\s*=>/)
    if (arrowMatch && !funcMatch) {
      const paramsStr = arrowMatch[1] ?? ''
      const params = paramsStr.split(',').map((p) => p.trim()).filter((p) => p.length > 0)
      for (const param of params) {
        const cleanParam = param.split(':')[0]?.trim() ?? param
        const paramName = cleanParam.split('=')[0]?.trim() ?? cleanParam
        if (paramName) {
          const paramNode = this.addNode('parameter', paramName, lineNum, line.indexOf(paramName) + 1)
          if (this.isSourceName(paramName)) {
            paramNode.type = 'source'
          }
        }
      }
    }
  }

  private detectFunctionCalls(line: string, lineNum: number): void {
    const callRegex = /(\w+(?:\.\w+)*)\s*\(/g
    let match: RegExpExecArray | null

    while ((match = callRegex.exec(line)) !== null) {
      const callName = match[1]
      if (!callName) continue
      const column = match.index + 1

      if (this.isSourceName(callName)) {
        this.addNode('source', callName, lineNum, column)
      } else if (this.isSinkName(callName)) {
        this.addNode('sink', callName, lineNum, column)
      } else if (this.isSanitizerName(callName)) {
        const sanitizerNode = this.addNode('sanitizer', callName, lineNum, column)
        sanitizerNode.sanitized = true
        sanitizerNode.sanitizerName = callName
      }

      const argMatch = line.slice(match.index).match(/\(([^)]*)\)/)
      if (argMatch) {
        const argsStr = argMatch[1] ?? ''
        const args = argsStr.split(',').map((a) => a.trim()).filter((a) => a.length > 0)
        for (const arg of args) {
          const argNodes = this.processExpression(arg, lineNum, column + callName.length + 1)
          const callNode = this.findNodeByNameAndLine(callName, lineNum)
          if (callNode) {
            for (const argNode of argNodes) {
              this.addEdge(argNode.id, callNode.id, 'argument', `arg: ${arg}`)
            }
          }
        }
      }
    }
  }

  private detectReturnStatements(line: string, lineNum: number): void {
    const returnMatch = line.match(/return\s+(.+?)(?:;|$)/)
    if (returnMatch && returnMatch[1]) {
      const expr = returnMatch[1].trim()
      const column = line.indexOf('return') + 1
      const returnNode = this.addNode('return', `return:${lineNum}`, lineNum, column)
      const exprNodes = this.processExpression(expr, lineNum, column + 7)
      for (const exprNode of exprNodes) {
        this.addEdge(exprNode.id, returnNode.id, 'return', `return ${expr}`)
      }
    }
  }

  private detectMemberAccess(line: string, lineNum: number): void {
    const memberRegex = /(\w+(?:\.\w+)+)/g
    let match: RegExpExecArray | null

    while ((match = memberRegex.exec(line)) !== null) {
      const memberExpr = match[1]
      if (!memberExpr) continue
      const column = match.index + 1

      if (this.isSourceName(memberExpr) && !this.findNodeByNameAndLine(memberExpr, lineNum)) {
        this.addNode('source', memberExpr, lineNum, column)
      } else if (
        this.isSinkName(memberExpr) &&
        !this.findNodeByNameAndLine(memberExpr, lineNum)
      ) {
        this.addNode('sink', memberExpr, lineNum, column)
      }
    }
  }

  private processExpression(expr: string, lineNum: number, startColumn: number): FlowNode[] {
    const resultNodes: FlowNode[] = []

    const funcCallRegex = /(\w+(?:\.\w+)*)\s*\(([^)]*)\)/g
    let funcMatch: RegExpExecArray | null
    let exprRemaining = expr

    while ((funcMatch = funcCallRegex.exec(expr)) !== null) {
      const funcName = funcMatch[1]
      if (!funcName) continue
      const col = startColumn + funcMatch.index
      const argsStr = funcMatch[2] ?? ''

      const funcNode = this.getOrCreateTypedNode(funcName, lineNum, col)

      const args = argsStr.split(',').map((a) => a.trim()).filter((a) => a.length > 0)
      for (const arg of args) {
        const argNodes = this.processSimpleExpression(arg, lineNum, startColumn + (expr.indexOf(arg, funcMatch.index) ?? 0))
        for (const argNode of argNodes) {
          this.addEdge(argNode.id, funcNode.id, 'argument', `arg: ${arg}`)
        }
      }

      resultNodes.push(funcNode)
      exprRemaining = exprRemaining.replace(funcMatch[0], '')
    }

    const simpleNodes = this.processSimpleExpression(exprRemaining, lineNum, startColumn)
    for (const node of simpleNodes) {
      if (!resultNodes.some((r) => r.id === node.id)) {
        resultNodes.push(node)
      }
    }

    if (resultNodes.length === 0) {
      const literalNode = this.addNode('literal', expr.trim(), lineNum, startColumn)
      resultNodes.push(literalNode)
    }

    return resultNodes
  }

  private processSimpleExpression(expr: string, lineNum: number, startColumn: number): FlowNode[] {
    const nodes: FlowNode[] = []

    const memberRegex = /(\w+(?:\.\w+)+)/g
    let memberMatch: RegExpExecArray | null
    while ((memberMatch = memberRegex.exec(expr)) !== null) {
      const name = memberMatch[1]
      if (!name) continue
      const col = startColumn + memberMatch.index

      const node = this.getOrCreateTypedNode(name, lineNum, col)
      if (!nodes.some((n) => n.id === node.id)) {
        nodes.push(node)
      }
    }

    const identifierRegex = /\b(\w+)\b/g
    let identMatch: RegExpExecArray | null
    while ((identMatch = identifierRegex.exec(expr)) !== null) {
      const name = identMatch[1]
      if (!name) continue
      if (nodes.some((n) => n.name === name && n.line === lineNum)) continue
      if (['true', 'false', 'null', 'undefined', 'const', 'let', 'var', 'new', 'typeof', 'void', 'await', 'async'].includes(name)) continue

      const existing = this.findNodeByName(name)
      if (existing) {
        if (!nodes.some((n) => n.id === existing.id)) {
          nodes.push(existing)
        }
      } else {
        const col = startColumn + identMatch.index
        const newNode = this.addNode('propagator', name, lineNum, col)
        nodes.push(newNode)
      }
    }

    return nodes
  }

  private getOrCreateTypedNode(name: string, lineNum: number, col: number): FlowNode {
    const existing = this.findNodeByNameAndLine(name, lineNum)
    if (existing) return existing

    if (this.isSourceName(name)) {
      return this.addNode('source', name, lineNum, col)
    }
    if (this.isSinkName(name)) {
      return this.addNode('sink', name, lineNum, col)
    }
    if (this.isSanitizerName(name)) {
      const node = this.addNode('sanitizer', name, lineNum, col)
      node.sanitized = true
      node.sanitizerName = name
      return node
    }
    return this.addNode('propagator', name, lineNum, col)
  }

  private findNodeByName(name: string): FlowNode | undefined {
    for (const node of this.graph.nodes.values()) {
      if (node.name === name) {
        return node
      }
    }
    return undefined
  }

  private findNodeByNameAndLine(name: string, line: number): FlowNode | undefined {
    for (const node of this.graph.nodes.values()) {
      if (node.name === name && node.line === line) {
        return node
      }
    }
    return undefined
  }

  private normalizePattern(pattern: string): string {
    let clean = pattern
    if (clean.startsWith('.')) clean = clean.slice(1)
    if (clean.endsWith('(')) clean = clean.slice(0, -1)
    return clean
  }

  private isSourceName(name: string): boolean {
    for (const source of TAINT_SOURCES) {
      for (const pattern of source.patterns) {
        if (name.includes(this.normalizePattern(pattern))) {
          return true
        }
      }
    }
    return false
  }

  private isSinkName(name: string): boolean {
    for (const sink of TAINT_SINKS) {
      for (const pattern of sink.patterns) {
        if (name.includes(this.normalizePattern(pattern))) {
          return true
        }
      }
    }
    return false
  }

  private isSanitizerName(name: string): boolean {
    for (const sanitizer of SANITIZERS) {
      const clean = this.normalizePattern(sanitizer)
      if (name.includes(clean)) {
        return true
      }
    }
    return false
  }
}
