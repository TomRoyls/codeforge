import type { ASTNode } from './types.js'

export class NodeVisitor {
  visit(
    root: ASTNode,
    callback: (node: ASTNode, parent: ASTNode | undefined, depth: number) => boolean | void,
  ): void {
    this.visitDFS(root, undefined, callback, 0)
  }

  visitBFS(
    root: ASTNode,
    callback: (node: ASTNode, parent: ASTNode | undefined, depth: number) => boolean | void,
  ): void {
    const queue: Array<{ node: ASTNode; parent: ASTNode | undefined; depth: number }> = [
      { node: root, parent: undefined, depth: 0 },
    ]

    while (queue.length > 0) {
      const entry = queue.shift()
      if (entry === undefined) break

      const result = callback(entry.node, entry.parent, entry.depth)
      if (result === false) continue

      const children = entry.node.children
      if (children) {
        for (const child of children) {
          queue.push({ node: child, parent: entry.node, depth: entry.depth + 1 })
        }
      }
    }
  }

  findPath(root: ASTNode, target: ASTNode): string[] {
    const result = this.searchPath(root, target, [])
    return result ?? []
  }

  countNodes(root: ASTNode): number {
    let count = 1
    const children = root.children
    if (children) {
      for (const child of children) {
        count += this.countNodes(child)
      }
    }
    return count
  }

  clone(root: ASTNode): ASTNode {
    const cloned: ASTNode = {
      type: root.type,
      value: root.value,
      properties: { ...root.properties },
      loc: root.loc ? { ...root.loc } : undefined,
    }

    if (root.children) {
      cloned.children = root.children.map((child) => this.clone(child))
    }

    return cloned
  }

  private visitDFS(
    node: ASTNode,
    parent: ASTNode | undefined,
    callback: (node: ASTNode, parent: ASTNode | undefined, depth: number) => boolean | void,
    depth: number,
  ): void {
    const result = callback(node, parent, depth)
    if (result === false) return

    const children = node.children
    if (children) {
      for (const child of children) {
        this.visitDFS(child, node, callback, depth + 1)
      }
    }
  }

  private searchPath(
    node: ASTNode,
    target: ASTNode,
    currentPath: string[],
  ): string[] | undefined {
    const path = [...currentPath, node.type]
    if (node === target) return path

    const children = node.children
    if (children) {
      for (const child of children) {
        const found = this.searchPath(child, target, path)
        if (found !== undefined) return found
      }
    }

    return undefined
  }
}
