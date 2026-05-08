import type { ASTDiffNode, DiffOperation, DiffResult, DifferConfig } from './types.js'
import { DEFAULT_DIFFER_CONFIG } from './types.js'

export type { ASTDiffNode, DiffOperation, DiffResult, DifferConfig }
export { DEFAULT_DIFFER_CONFIG }

export class ASTDiffer {
  private config: DifferConfig
  private operations: DiffOperation[]
  private stats: { added: number; removed: number; modified: number; unchanged: number }

  constructor(config?: Partial<DifferConfig>) {
    this.config = { ...DEFAULT_DIFFER_CONFIG, ...config }
    this.operations = []
    this.stats = { added: 0, removed: 0, modified: 0, unchanged: 0 }
  }

  diff(oldTree: ASTDiffNode | null, newTree: ASTDiffNode | null): DiffResult {
    this.operations = []
    this.stats = { added: 0, removed: 0, modified: 0, unchanged: 0 }
    this.compareNodes(oldTree, newTree, '')
    return {
      operations: [...this.operations],
      stats: { ...this.stats },
    }
  }

  getOperations(): DiffOperation[] {
    return [...this.operations]
  }

  getAdditions(): DiffOperation[] {
    return this.operations.filter((op) => op.type === 'add')
  }

  getRemovals(): DiffOperation[] {
    return this.operations.filter((op) => op.type === 'remove')
  }

  getModifications(): DiffOperation[] {
    return this.operations.filter((op) => op.type === 'modify' || op.type === 'move')
  }

  hasChanges(): boolean {
    return this.operations.length > 0
  }

  getChangeCount(): number {
    return this.operations.length
  }

  getPath(operation: DiffOperation): string {
    return operation.path
  }

  getStatistics(): { added: number; removed: number; modified: number; unchanged: number } {
    return { ...this.stats }
  }

  clear(): void {
    this.operations = []
    this.stats = { added: 0, removed: 0, modified: 0, unchanged: 0 }
  }

  private compareNodes(
    oldNode: ASTDiffNode | null,
    newNode: ASTDiffNode | null,
    path: string,
  ): void {
    if (oldNode === null && newNode === null) {
      return
    }

    if (oldNode === null && newNode !== null) {
      this.recordAdd(newNode, path)
      return
    }

    if (oldNode !== null && newNode === null) {
      this.recordRemove(oldNode, path)
      return
    }

    const old = oldNode!
    const nw = newNode!

    const currentPath = path || '/'

    if (old.type !== nw.type) {
      this.stats.removed++
      this.stats.added++
      this.operations.push({
        type: 'modify',
        path: currentPath,
        oldValue: old.type,
        newValue: nw.type,
      })
    }

    if (!this.config.ignoreValues) {
      const oldVal = old.value ?? ''
      const newVal = nw.value ?? ''
      if (oldVal !== newVal) {
        if (old.type === nw.type) {
          this.stats.modified++
          this.operations.push({
            type: 'modify',
            path: currentPath,
            oldValue: oldVal,
            newValue: newVal,
          })
        }
      } else if (old.type === nw.type) {
        this.stats.unchanged++
      }
    } else if (old.type === nw.type) {
      this.stats.unchanged++
    }

    this.compareChildren(old, nw, currentPath)
  }

  private compareChildren(oldNode: ASTDiffNode, newNode: ASTDiffNode, path: string): void {
    const oldChildren = oldNode.children ?? []
    const newChildren = newNode.children ?? []

    if (oldChildren.length === 0 && newChildren.length === 0) {
      return
    }

    const depth = path.split('/').length - 1
    if (depth >= this.config.maxDepth) {
      return
    }

    if (this.config.ignoreOrder) {
      this.compareChildrenUnordered(oldChildren, newChildren, path)
    } else {
      this.compareChildrenOrdered(oldChildren, newChildren, path)
    }
  }

  private buildChildPath(parentPath: string, index: number): string {
    return parentPath === '/' ? `/children[${index}]` : `${parentPath}/children[${index}]`
  }

  private compareChildrenOrdered(
    oldChildren: ASTDiffNode[],
    newChildren: ASTDiffNode[],
    path: string,
  ): void {
    const maxLen = Math.max(oldChildren.length, newChildren.length)

    for (let i = 0; i < maxLen; i++) {
      const oldChild = oldChildren[i] ?? null
      const newChild = newChildren[i] ?? null
      const childPath = this.buildChildPath(path, i)

      if (oldChild !== null && newChild !== null) {
        this.detectMove(oldChild, newChild, childPath, i)
      }

      this.compareNodes(oldChild, newChild, childPath)
    }
  }

  private compareChildrenUnordered(
    oldChildren: ASTDiffNode[],
    newChildren: ASTDiffNode[],
    path: string,
  ): void {
    const matchedNew = new Set<number>()

    for (let oi = 0; oi < oldChildren.length; oi++) {
      const oldChild = oldChildren[oi]!
      const matchIdx = this.findMatchingChild(oldChild, newChildren, matchedNew)

      if (matchIdx !== -1) {
        matchedNew.add(matchIdx)
        const newChild = newChildren[matchIdx]!
        const childPath = this.buildChildPath(path, oi)

        if (oi !== matchIdx) {
          this.stats.modified++
          this.operations.push({
            type: 'move',
            path: childPath,
            oldValue: `index:${oi}`,
            newValue: `index:${matchIdx}`,
          })
        }

        this.compareNodes(oldChild, newChild, childPath)
      } else {
        const childPath = this.buildChildPath(path, oi)
        this.recordRemove(oldChild, childPath)
      }
    }

    for (let ni = 0; ni < newChildren.length; ni++) {
      if (!matchedNew.has(ni)) {
        const newChild = newChildren[ni]!
        const childPath = this.buildChildPath(path, ni)
        this.recordAdd(newChild, childPath)
      }
    }
  }

  private findMatchingChild(
    child: ASTDiffNode,
    candidates: ASTDiffNode[],
    excluded: Set<number>,
  ): number {
    for (let i = 0; i < candidates.length; i++) {
      if (excluded.has(i)) continue
      const candidate = candidates[i]!
      if (this.nodesMatch(child, candidate)) {
        return i
      }
    }
    return -1
  }

  private nodesMatch(a: ASTDiffNode, b: ASTDiffNode): boolean {
    if (a.type !== b.type) return false
    if (!this.config.ignoreValues) {
      if ((a.value ?? '') !== (b.value ?? '')) return false
    }
    return true
  }

  private detectMove(
    oldChild: ASTDiffNode,
    newChild: ASTDiffNode,
    path: string,
    _index: number,
  ): void {
    if (oldChild.type !== newChild.type) return

    const oldVal = oldChild.value ?? ''
    const newVal = newChild.value ?? ''

    if (!this.config.ignoreValues && oldVal !== newVal) {
      if (this.isNodeMoved(oldChild, newChild)) {
        this.stats.modified++
        this.operations.push({
          type: 'move',
          path,
          oldValue: oldVal,
          newValue: newVal,
        })
      }
    }

    if (oldVal === newVal && this.isNodeMoved(oldChild, newChild)) {
      const oldChildren = oldChild.children ?? []
      const newChildren = newChild.children ?? []
      if (oldChildren.length > 1) {
        this.stats.modified++
        this.operations.push({
          type: 'move',
          path,
          oldValue: oldChildren.map((c) => c.type).join(','),
          newValue: newChildren.map((c) => c.type).join(','),
        })
      }
    }
  }

  private isNodeMoved(oldNode: ASTDiffNode, newNode: ASTDiffNode): boolean {
    const oldChildren = oldNode.children ?? []
    const newChildren = newNode.children ?? []

    if (oldChildren.length === 0 && newChildren.length === 0) {
      return false
    }

    if (oldChildren.length !== newChildren.length) {
      return false
    }

    const oldTypes = oldChildren.map((c) => c.type).sort()
    const newTypes = newChildren.map((c) => c.type).sort()
    if (oldTypes.join(',') !== newTypes.join(',')) {
      return false
    }

    const oldSig = oldChildren.map((c) => c.type).join(',')
    const newSig = newChildren.map((c) => c.type).join(',')
    return oldSig !== newSig
  }

  private recordAdd(node: ASTDiffNode, path: string): void {
    this.stats.added++
    this.operations.push({
      type: 'add',
      path,
      newValue: this.nodeSignature(node),
    })

    const children = node.children ?? []
    for (let i = 0; i < children.length; i++) {
      const child = children[i]!
      this.recordAdd(child, this.buildChildPath(path, i))
    }
  }

  private recordRemove(node: ASTDiffNode, path: string): void {
    this.stats.removed++
    this.operations.push({
      type: 'remove',
      path,
      oldValue: this.nodeSignature(node),
    })

    const children = node.children ?? []
    for (let i = 0; i < children.length; i++) {
      const child = children[i]!
      this.recordRemove(child, this.buildChildPath(path, i))
    }
  }

  private nodeSignature(node: ASTDiffNode): string {
    const val = node.value ?? ''
    return val.length > 0 ? `${node.type}:${val}` : node.type
  }
}
