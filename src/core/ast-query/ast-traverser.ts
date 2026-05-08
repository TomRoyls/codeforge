import type { ASTNode, ASTVisitor } from './types.js'

export class ASTTraverser {
  traverse(node: ASTNode, visitor: ASTVisitor): void {
    this._traverse(node, [], visitor)
  }

  private _traverse(
    node: ASTNode,
    ancestors: ASTNode[],
    visitor: ASTVisitor,
  ): void {
    const currentAncestors = [...ancestors, node]
    if (visitor.enter) {
      const result = visitor.enter(node, ancestors)
      if (result === false) {
        return
      }
    }

    for (const child of node.children) {
      this._traverse(child, currentAncestors, visitor)
    }

    if (visitor.exit) {
      visitor.exit(node)
    }
  }

  findChildren(
    node: ASTNode,
    predicate: (n: ASTNode) => boolean,
  ): ASTNode[] {
    const results: ASTNode[] = []
    for (const child of node.children) {
      if (predicate(child)) {
        results.push(child)
      }
      results.push(...this.findChildren(child, predicate))
    }
    return results
  }

  findDirectChildren(
    node: ASTNode,
    predicate: (n: ASTNode) => boolean,
  ): ASTNode[] {
    return node.children.filter(predicate)
  }

  getAncestors(node: ASTNode): ASTNode[] {
    const ancestors: ASTNode[] = []
    let current = node.parent
    while (current) {
      ancestors.unshift(current)
      current = current.parent
    }
    return ancestors
  }

  getSiblings(node: ASTNode): ASTNode[] {
    if (!node.parent) {
      return [node]
    }
    return [...node.parent.children]
  }

  getPreviousSibling(node: ASTNode): ASTNode | null {
    if (!node.parent) {
      return null
    }
    const siblings = node.parent.children
    const idx = siblings.indexOf(node)
    if (idx <= 0) {
      return null
    }
    return siblings[idx - 1]!
  }

  getNextSibling(node: ASTNode): ASTNode | null {
    if (!node.parent) {
      return null
    }
    const siblings = node.parent.children
    const idx = siblings.indexOf(node)
    if (idx === -1 || idx >= siblings.length - 1) {
      return null
    }
    return siblings[idx + 1]!
  }

  getNodeDepth(node: ASTNode): number {
    let depth = 0
    let current = node.parent
    while (current) {
      depth++
      current = current.parent
    }
    return depth
  }

  isLeaf(node: ASTNode): boolean {
    return node.children.length === 0
  }

  flatten(root: ASTNode): ASTNode[] {
    const result: ASTNode[] = []
    const stack: ASTNode[] = [root]
    while (stack.length > 0) {
      const current = stack.pop()!
      result.push(current)
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]!)
      }
    }
    return result
  }
}
