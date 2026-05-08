import type { ASTNode, SerializedNode } from './types.js'

export class ASTSerializer {
  serialize(node: ASTNode): SerializedNode {
    const meta: Record<string, string> = {}
    if (node.value !== undefined) {
      meta.value = node.value
    }
    if (node.range) {
      meta.rangeStart = String(node.range.start)
      meta.rangeEnd = String(node.range.end)
    }
    if (node.loc) {
      meta.line = String(node.loc.line)
      meta.column = String(node.loc.column)
    }
    if (node.properties) {
      for (const [key, val] of Object.entries(node.properties)) {
        meta[key] = String(val)
      }
    }
    const children: SerializedNode[] = (node.children ?? []).map(
      (child) => this.serialize(child),
    )
    return {
      type: node.type,
      text: node.value ?? '',
      children,
      depth: 0,
      meta,
    }
  }

  serializeMany(nodes: ASTNode[]): SerializedNode[] {
    return nodes.map((node) => this.serialize(node))
  }

  flatten(node: SerializedNode): SerializedNode[] {
    const result: SerializedNode[] = []
    const stack: SerializedNode[] = [node]
    while (stack.length > 0) {
      const current = stack.pop()!
      const flatNode: SerializedNode = {
        type: current.type,
        text: current.text,
        children: [],
        depth: current.depth,
        meta: { ...current.meta },
      }
      result.push(flatNode)
      for (let i = current.children.length - 1; i >= 0; i--) {
        const src = current.children[i]!
        const child: SerializedNode = {
          type: src.type,
          text: src.text,
          children: src.children,
          depth: current.depth + 1,
          meta: { ...src.meta },
        }
        stack.push(child)
      }
    }
    return result
  }

  toJSON(node: SerializedNode): string {
    return JSON.stringify(node, null, 2)
  }

  toTreeString(node: SerializedNode, prefix: string = ''): string {
    const connector = prefix === '' ? '' : '├── '
    const lines: string[] = []
    const label = node.text ? `${node.type}: "${node.text}"` : node.type
    lines.push(prefix + connector + label)
    const childPrefix = prefix === '' ? '' : prefix.replace(/├── $/, '│   ').replace(/└── $/, '    ')
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]!
      const isLast = i === node.children.length - 1
      const childConnector = isLast ? '└── ' : '├── '
      const childLabel = child.text ? `${child.type}: "${child.text}"` : child.type
      lines.push(childPrefix + childConnector + childLabel)
      if (child.children.length > 0) {
        const grandchildPrefix = childPrefix + (isLast ? '    ' : '│   ')
        lines.push(this.toTreeStringRecursive(child, grandchildPrefix))
      }
    }
    return lines.join('\n')
  }

  private toTreeStringRecursive(node: SerializedNode, prefix: string): string {
    const lines: string[] = []
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]!
      const isLast = i === node.children.length - 1
      const connector = isLast ? '└── ' : '├── '
      const label = child.text ? `${child.type}: "${child.text}"` : child.type
      lines.push(prefix + connector + label)
      if (child.children.length > 0) {
        const grandchildPrefix = prefix + (isLast ? '    ' : '│   ')
        lines.push(this.toTreeStringRecursive(child, grandchildPrefix))
      }
    }
    return lines.join('\n')
  }

  countNodes(node: ASTNode): number {
    let count = 1
    for (const child of node.children ?? []) {
      count += this.countNodes(child)
    }
    return count
  }

  getDepth(node: ASTNode): number {
    if (!node.children || node.children.length === 0) {
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
}
