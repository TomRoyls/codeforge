import type {
  PrintOptions,
  PrintResult,
  ASTNode,
  TreeStatistics,
} from './types.js'
import { DEFAULT_PRINT_OPTIONS } from './types.js'

export class ASTPrinter {
  private options: PrintOptions

  constructor(options?: Partial<PrintOptions>) {
    this.options = { ...DEFAULT_PRINT_OPTIONS, ...options }
  }

  print(node: ASTNode): PrintResult {
    const format = this.options.format
    let output: string
    switch (format) {
      case 'compact':
        output = this.printCompact(node)
        break
      case 'pretty':
        output = this.printPretty(node)
        break
      case 'json':
        output = this.printJSON(node)
        break
      case 'lisp':
        output = this.printLisp(node)
        break
    }
    const nodeCount = this.getNodeCount(node)
    const depth = this.getDepth(node)
    const truncated = this.options.maxDepth >= 0 && depth > this.options.maxDepth
    return { output, nodeCount, depth, truncated }
  }

  printCompact(node: ASTNode): string {
    return this.printCompactInternal(node, 0)
  }

  private printCompactInternal(node: ASTNode, currentDepth: number): string {
    if (this.options.maxDepth >= 0 && currentDepth > this.options.maxDepth) {
      return '...'
    }
    const parts: string[] = []
    parts.push(node.type)
    if (node.value !== undefined && node.value !== null) {
      parts.push(`:${String(node.value)}`)
    }
    if (node.children.length > 0) {
      const childParts: string[] = []
      for (const child of node.children) {
        childParts.push(this.printCompactInternal(child, currentDepth + 1))
      }
      parts.push(`(${childParts.join(' ')})`)
    }
    return parts.join('')
  }

  printPretty(node: ASTNode, indent: number = 0): string {
    return this.printPrettyInternal(node, 0, indent)
  }

  private printPrettyInternal(
    node: ASTNode,
    currentDepth: number,
    baseIndent: number,
  ): string {
    if (this.options.maxDepth >= 0 && currentDepth > this.options.maxDepth) {
      return ' '.repeat(baseIndent * this.options.indent) + '...\n'
    }
    const indentStr = ' '.repeat((baseIndent + currentDepth) * this.options.indent)
    const lines: string[] = []
    let label = node.type
    if (node.value !== undefined && node.value !== null) {
      label += `: ${String(node.value)}`
    }
    if (this.options.showLocation && node.location) {
      label += ` @${node.location.line}:${node.location.column}`
    }
    if (this.options.showType) {
      label += ` [${typeof node.value}]`
    }
    lines.push(indentStr + label)
    for (const child of node.children) {
      lines.push(
        this.printPrettyInternal(child, currentDepth + 1, baseIndent),
      )
    }
    return lines.join('\n')
  }

  printJSON(node: ASTNode): string {
    const obj = this.serialize(node)
    return JSON.stringify(obj, null, this.options.indent)
  }

  printLisp(node: ASTNode): string {
    return this.printLispInternal(node, 0)
  }

  private printLispInternal(node: ASTNode, currentDepth: number): string {
    if (this.options.maxDepth >= 0 && currentDepth > this.options.maxDepth) {
      return '...'
    }
    if (node.children.length === 0) {
      return node.value !== undefined && node.value !== null
        ? String(node.value)
        : node.type
    }
    const parts: string[] = [node.type]
    if (node.value !== undefined && node.value !== null) {
      parts.push(String(node.value))
    }
    for (const child of node.children) {
      parts.push(this.printLispInternal(child, currentDepth + 1))
    }
    return '(' + parts.join(' ') + ')'
  }

  getNodeCount(node: ASTNode): number {
    let count = 1
    for (const child of node.children) {
      count += this.getNodeCount(child)
    }
    return count
  }

  getDepth(node: ASTNode): number {
    if (node.children.length === 0) {
      return 0
    }
    let maxChildDepth = 0
    for (const child of node.children) {
      const childDepth = this.getDepth(child)
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth
      }
    }
    return maxChildDepth + 1
  }

  traverse(
    node: ASTNode,
    visitor: (node: ASTNode, depth: number) => boolean,
    depth: number = 0,
    stopped?: { value: boolean },
  ): void {
    if (stopped?.value) return
    if (!visitor(node, depth)) {
      if (stopped) stopped.value = true
      return
    }
    const state = stopped ?? { value: false }
    for (const child of node.children) {
      if (state.value) break
      this.traverse(child, visitor, depth + 1, state)
    }
  }

  findNodes(
    node: ASTNode,
    predicate: (node: ASTNode) => boolean,
  ): ASTNode[] {
    const result: ASTNode[] = []
    this.traverse(node, (n) => {
      if (predicate(n)) {
        result.push(n)
      }
      return true
    })
    return result
  }

  getNodeAt(node: ASTNode, path: number[]): ASTNode | undefined {
    let current: ASTNode | undefined = node
    for (const index of path) {
      if (!current || index >= current.children.length) {
        return undefined
      }
      current = current.children[index]
    }
    return current
  }

  filter(
    node: ASTNode,
    predicate: (node: ASTNode) => boolean,
  ): ASTNode | undefined {
    if (!predicate(node)) {
      return undefined
    }
    const filteredChildren: ASTNode[] = []
    for (const child of node.children) {
      const filtered = this.filter(child, predicate)
      if (filtered) {
        filteredChildren.push(filtered)
      }
    }
    return {
      type: node.type,
      children: filteredChildren,
      value: node.value,
      location: node.location
        ? { ...node.location }
        : undefined,
      properties: { ...node.properties },
    }
  }

  clone(node: ASTNode): ASTNode {
    return {
      type: node.type,
      children: node.children.map((child) => this.clone(child)),
      value: node.value,
      location: node.location
        ? { ...node.location }
        : undefined,
      properties: { ...node.properties },
    }
  }

  equals(a: ASTNode, b: ASTNode): boolean {
    if (a.type !== b.type) return false
    if (a.value !== b.value) return false
    if (a.children.length !== b.children.length) return false
    const aKeys = Object.keys(a.properties).sort()
    const bKeys = Object.keys(b.properties).sort()
    if (aKeys.length !== bKeys.length) return false
    for (let i = 0; i < aKeys.length; i++) {
      const aKey = aKeys[i]!
      const bKey = bKeys[i]!
      if (aKey !== bKey) return false
      if (a.properties[aKey] !== b.properties[bKey]) return false
    }
    if (
      Boolean(a.location) !== Boolean(b.location)
    ) {
      return false
    }
    if (a.location && b.location) {
      if (
        a.location.line !== b.location.line ||
        a.location.column !== b.location.column
      ) {
        return false
      }
    }
    for (let i = 0; i < a.children.length; i++) {
      if (!this.equals(a.children[i]!, b.children[i]!)) {
        return false
      }
    }
    return true
  }

  serialize(node: ASTNode): Record<string, unknown> {
    const result: Record<string, unknown> = {
      type: node.type,
      children: node.children.map((child) => this.serialize(child)),
    }
    if (node.value !== undefined) {
      result.value = node.value
    }
    if (node.location) {
      result.location = { ...node.location }
    }
    const propKeys = Object.keys(node.properties)
    if (propKeys.length > 0) {
      result.properties = { ...node.properties }
    }
    return result
  }

  deserialize(obj: Record<string, unknown>): ASTNode {
    const type =
      typeof obj.type === 'string' ? obj.type : 'Unknown'
    const rawChildren = Array.isArray(obj.children)
      ? obj.children
      : []
    const children: ASTNode[] = rawChildren.map(
      (child: unknown) =>
        this.deserialize(child as Record<string, unknown>),
    )
    const rawLocation = obj.location as
      | { line: number; column: number }
      | undefined
    const location =
      rawLocation &&
      typeof rawLocation === 'object' &&
      typeof rawLocation.line === 'number' &&
      typeof rawLocation.column === 'number'
        ? { line: rawLocation.line, column: rawLocation.column }
        : undefined
    const rawProps = obj.properties as
      | Record<string, unknown>
      | undefined
    const properties =
      rawProps && typeof rawProps === 'object'
        ? { ...rawProps }
        : {}
    return {
      type,
      children,
      value: 'value' in obj ? obj.value : undefined,
      location,
      properties,
    }
  }

  getOptions(): PrintOptions {
    return { ...this.options }
  }

  getStatistics(node: ASTNode): TreeStatistics {
    const types: Record<string, number> = {}
    this.traverse(node, (n) => {
      types[n.type] = (types[n.type] ?? 0) + 1
      return true
    })
    return {
      nodeCount: this.getNodeCount(node),
      maxDepth: this.getDepth(node),
      types,
    }
  }
}
