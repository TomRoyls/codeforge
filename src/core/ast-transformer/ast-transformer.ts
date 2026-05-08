import type {
  ASTNode,
  TransformRule,
  TransformResult,
  TransformChange,
  TransformConfig,
  TransformAction,
} from './types.js'
import { DEFAULT_TRANSFORM_CONFIG } from './types.js'
import { NodeVisitor } from './node-visitor.js'

export class ASTTransformer {
  private config: TransformConfig
  private rules: TransformRule[] = []
  private visitor: NodeVisitor

  constructor(config?: Partial<TransformConfig>) {
    this.config = {
      maxDepth: config?.maxDepth ?? DEFAULT_TRANSFORM_CONFIG.maxDepth,
      maxChanges: config?.maxChanges ?? DEFAULT_TRANSFORM_CONFIG.maxChanges,
    }
    this.visitor = new NodeVisitor()
  }

  addRule(rule: TransformRule): void {
    this.rules.push(rule)
  }

  removeRule(index: number): void {
    if (index >= 0 && index < this.rules.length) {
      this.rules.splice(index, 1)
    }
  }

  transform(root: ASTNode): TransformResult {
    const changes: TransformChange[] = []
    let currentRoot = this.visitor.clone(root)
    let totalChanges = 0

    for (const rule of this.rules) {
      if (totalChanges >= this.config.maxChanges) break

      const result = this.applyRule(currentRoot, rule)
      currentRoot = result.root
      totalChanges += result.changes.length
      changes.push(...result.changes)
    }

    return {
      root: currentRoot,
      changesApplied: totalChanges,
      changes,
    }
  }

  applyAction(
    node: ASTNode,
    action: TransformAction,
    replacement?: ASTNode | ((node: ASTNode) => ASTNode),
  ): ASTNode {
    switch (action) {
      case 'replace': {
        if (replacement === undefined) return node
        if (typeof replacement === 'function') return replacement(node)
        return this.visitor.clone(replacement)
      }
      case 'remove':
        return { type: '__REMOVED__', properties: {} }
      case 'wrap': {
        const wrapper = typeof replacement === 'function' ? replacement(node) : replacement
        if (wrapper === undefined) return node
        const clonedWrapper = this.visitor.clone(wrapper)
        clonedWrapper.children = [this.visitor.clone(node)]
        return clonedWrapper
      }
      case 'insert-before':
      case 'insert-after':
        return node
    }
  }

  replaceNode(root: ASTNode, target: ASTNode, replacement: ASTNode): ASTNode {
    if (root === target) return this.visitor.clone(replacement)

    const cloned = this.visitor.clone(root)
    this.parallelWalk(root, cloned, (originalChild, clonedParent, idx) => {
      if (originalChild === target) {
        const children = clonedParent.children
        if (children) {
          children[idx] = this.visitor.clone(replacement)
        }
      }
    })

    return cloned
  }

  removeNode(root: ASTNode, target: ASTNode): ASTNode {
    if (root === target) return { type: '__REMOVED__', properties: {} }

    const cloned = this.visitor.clone(root)
    this.parallelWalkFind(root, cloned, (originalChild, clonedParent, idx) => {
      if (originalChild === target && clonedParent.children) {
        clonedParent.children.splice(idx, 1)
        return true
      }
      return false
    })

    return cloned
  }

  insertBefore(parent: ASTNode, reference: ASTNode, newNode: ASTNode): ASTNode {
    const cloned = this.visitor.clone(parent)
    this.remapChild(cloned, reference, newNode, 'before')
    return cloned
  }

  insertAfter(parent: ASTNode, reference: ASTNode, newNode: ASTNode): ASTNode {
    const cloned = this.visitor.clone(parent)
    this.remapChild(cloned, reference, newNode, 'after')
    return cloned
  }

  wrapNode(node: ASTNode, wrapper: ASTNode): ASTNode {
    const clonedWrapper = this.visitor.clone(wrapper)
    clonedWrapper.children = [this.visitor.clone(node)]
    return clonedWrapper
  }

  getRules(): TransformRule[] {
    return [...this.rules]
  }

  getConfig(): TransformConfig {
    return { ...this.config }
  }

  private applyRule(root: ASTNode, rule: TransformRule): TransformResult {
    const changes: TransformChange[] = []
    const nodesToProcess: Array<{
      node: ASTNode
      parent: ASTNode | undefined
      path: string[]
    }> = []

    this.collectMatchingNodes(root, rule, nodesToProcess)

    let currentRoot = root

    for (const entry of nodesToProcess) {
      if (changes.length >= this.config.maxChanges) break

      const { node, path } = entry
      const action = rule.action
      const replacement = rule.replacement

      switch (action) {
        case 'replace': {
          const newNode = this.applyAction(node, action, replacement)
          if (entry.parent === undefined) {
            currentRoot = newNode
          } else {
            this.replaceInParent(currentRoot, node, newNode)
          }
          changes.push({ action, nodeType: node.type, path })
          break
        }
        case 'remove': {
          if (entry.parent === undefined) {
            currentRoot = { type: '__REMOVED__', properties: {} }
          } else {
            this.removeFromParent(currentRoot, node)
          }
          changes.push({ action, nodeType: node.type, path })
          break
        }
        case 'insert-before': {
          if (entry.parent !== undefined && replacement) {
            const newNode =
              typeof replacement === 'function'
                ? replacement(node)
                : this.visitor.clone(replacement)
            this.insertInParent(currentRoot, node, newNode, 'before')
          }
          changes.push({ action, nodeType: node.type, path })
          break
        }
        case 'insert-after': {
          if (entry.parent !== undefined && replacement) {
            const newNode =
              typeof replacement === 'function'
                ? replacement(node)
                : this.visitor.clone(replacement)
            this.insertInParent(currentRoot, node, newNode, 'after')
          }
          changes.push({ action, nodeType: node.type, path })
          break
        }
        case 'wrap': {
          if (replacement) {
            const wrapper =
              typeof replacement === 'function'
                ? replacement(node)
                : this.visitor.clone(replacement)
            const wrappedNode = this.wrapNode(node, wrapper)
            if (entry.parent === undefined) {
              currentRoot = wrappedNode
            } else {
              this.replaceInParent(currentRoot, node, wrappedNode)
            }
          }
          changes.push({ action, nodeType: node.type, path })
          break
        }
      }
    }

    return {
      root: currentRoot,
      changesApplied: changes.length,
      changes,
    }
  }

  private replaceInParent(root: ASTNode, target: ASTNode, replacement: ASTNode): void {
    this.visitor.visit(root, (node) => {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i] === target) {
            node.children[i] = replacement
          }
        }
      }
    })
  }

  private removeFromParent(root: ASTNode, target: ASTNode): void {
    this.visitor.visit(root, (node) => {
      if (node.children) {
        node.children = node.children.filter((child) => child !== target)
      }
    })
  }

  private insertInParent(
    root: ASTNode,
    reference: ASTNode,
    newNode: ASTNode,
    position: 'before' | 'after',
  ): void {
    this.visitor.visit(root, (node) => {
      if (node.children) {
        const idx = node.children.indexOf(reference)
        if (idx !== -1) {
          if (position === 'before') {
            node.children.splice(idx, 0, newNode)
          } else {
            node.children.splice(idx + 1, 0, newNode)
          }
        }
      }
    })
  }

  private remapChild(
    clonedParent: ASTNode,
    reference: ASTNode,
    newNode: ASTNode,
    position: 'before' | 'after',
  ): void {
    const clonedNew = this.visitor.clone(newNode)

    this.visitor.visit(clonedParent, (node) => {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i]!
          if (child.type === reference.type && child.value === reference.value) {
            if (position === 'before') {
              node.children.splice(i, 0, clonedNew)
            } else {
              node.children.splice(i + 1, 0, clonedNew)
            }
            return
          }
        }
      }
    })
  }

  private collectMatchingNodes(
    root: ASTNode,
    rule: TransformRule,
    nodesToProcess: Array<{
      node: ASTNode
      parent: ASTNode | undefined
      path: string[]
    }>,
  ): void {
    const self = this
    this.visitor.visit(root, function (node, parent, depth) {
      if (depth <= self.config.maxDepth) {
        const currentPath = self.visitor.findPath(root, node)
        if (rule.match(node)) {
          nodesToProcess.push({ node, parent, path: currentPath })
        }
      }
    })
  }

  private parallelWalk(
    original: ASTNode,
    cloned: ASTNode,
    callback: (originalChild: ASTNode, clonedParent: ASTNode, idx: number) => void,
  ): void {
    const originalChildren = original.children
    const clonedChildren = cloned.children
    if (originalChildren && clonedChildren) {
      for (let i = 0; i < originalChildren.length; i++) {
        const originalChild = originalChildren[i]!
        callback(originalChild, cloned, i)
        this.parallelWalk(originalChild, clonedChildren[i]!, callback)
      }
    }
  }

  private parallelWalkFind(
    original: ASTNode,
    cloned: ASTNode,
    callback: (originalChild: ASTNode, clonedParent: ASTNode, idx: number) => boolean,
  ): void {
    const originalChildren = original.children
    const clonedChildren = cloned.children
    if (originalChildren && clonedChildren) {
      for (let i = 0; i < originalChildren.length; i++) {
        const originalChild = originalChildren[i]!
        const found = callback(originalChild, cloned, i)
        if (found) return
        this.parallelWalkFind(originalChild, clonedChildren[i]!, callback)
      }
    }
  }
}
