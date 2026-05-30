import type { ASTNode, WalkVisitor, WalkOptions, WalkResult, TreeStatistics } from './types.js'
import { DEFAULT_WALK_CONFIG } from './types.js'

export type { ASTNode, WalkVisitor, WalkOptions, WalkResult, TreeStatistics } from './types.js'
export { DEFAULT_WALK_CONFIG } from './types.js'

export class ASTWalker {
  private _defaultOptions: Partial<WalkOptions>
  private _cache: Map<ASTNode, TreeStatistics>

  constructor(defaultOptions?: Partial<WalkOptions>) {
    this._defaultOptions = defaultOptions ?? {}
    this._cache = new Map()
  }

  walk(root: ASTNode, visitor: WalkVisitor, options?: Partial<WalkOptions>): WalkResult {
    const opts = this.resolveOptions(options)
    const seen = new Set<ASTNode>()
    let visited = 0
    let skipped = 0
    let maxDepthReached = 0

    if (opts.order === 'breadth-first') {
      const bfsResult = this.walkBFS(root, visitor, opts, seen)
      return bfsResult
    }

    const walkRecursive = (node: ASTNode, depth: number, path: ASTNode[]): void => {
      if (seen.has(node)) return
      seen.add(node)

      if (opts.maxDepth !== undefined && depth > opts.maxDepth) return
      if (depth > maxDepthReached) maxDepthReached = depth

      const passesFilter = opts.filter !== undefined ? opts.filter(node, depth) : true

      if (!passesFilter) {
        skipped++
        const children = node.children ?? []
        for (const child of children) {
          walkRecursive(child, depth + 1, [...path, child])
        }
        return
      }

      visited++

      if (opts.order === 'pre') {
        let skipChildren = false
        if (visitor.enter) {
          const shouldSkip = visitor.enter(node, depth, path)
          if (shouldSkip === false) skipChildren = true
        }

        if (!skipChildren) {
          const children = node.children ?? []
          for (const child of children) {
            walkRecursive(child, depth + 1, [...path, child])
          }
        }

        if (visitor.exit) {
          visitor.exit(node, depth, path)
        }
      } else {
        const children = node.children ?? []
        for (const child of children) {
          walkRecursive(child, depth + 1, [...path, child])
        }

        if (visitor.enter) {
          visitor.enter(node, depth, path)
        }
      }
    }

    walkRecursive(root, 0, [root])

    const result: WalkResult = { visited, skipped, depth: maxDepthReached }
    return result
  }

  private walkBFS(
    root: ASTNode,
    visitor: WalkVisitor,
    opts: WalkOptions,
    seen: Set<ASTNode>,
  ): WalkResult {
    let visited = 0
    let skipped = 0
    let maxDepthReached = 0

    const queue: Array<{ node: ASTNode; depth: number; path: ASTNode[] }> = []
    queue.push({ node: root, depth: 0, path: [root] })
    let _qi = 0

    while (_qi < queue.length) {
      const item = queue[_qi++]
      if (item === undefined) break

      const { node, depth, path } = item

      if (seen.has(node)) continue
      seen.add(node)

      if (opts.maxDepth !== undefined && depth > opts.maxDepth) continue
      if (depth > maxDepthReached) maxDepthReached = depth

      const passesFilter = opts.filter !== undefined ? opts.filter(node, depth) : true

      if (!passesFilter) {
        skipped++
        const children = node.children ?? []
        for (const child of children) {
          if (!seen.has(child)) {
            queue.push({ node: child, depth: depth + 1, path: [...path, child] })
          }
        }
        continue
      }

      visited++

      if (visitor.enter) {
        const result = visitor.enter(node, depth, path)
        if (result === false) continue
      }

      const children = node.children ?? []
      for (const child of children) {
        if (!seen.has(child)) {
          queue.push({ node: child, depth: depth + 1, path: [...path, child] })
        }
      }
    }

    return { visited, skipped, depth: maxDepthReached }
  }

  private resolveOptions(options?: Partial<WalkOptions>): WalkOptions {
    return {
      order: options?.order ?? this._defaultOptions.order ?? DEFAULT_WALK_CONFIG.order,
      maxDepth: options?.maxDepth ?? this._defaultOptions.maxDepth,
      filter: options?.filter ?? this._defaultOptions.filter,
    }
  }

  walkWithDepth(root: ASTNode, maxDepth: number, visitor: WalkVisitor): WalkResult {
    return this.walk(root, visitor, { maxDepth })
  }

  find(root: ASTNode, predicate: (node: ASTNode, depth: number) => boolean): ASTNode | undefined {
    let result: ASTNode | undefined

    this.walk(root, {
      enter: (node, depth) => {
        if (predicate(node, depth)) {
          result = node
          return false
        }
        return
      },
    })

    return result
  }

  findAll(root: ASTNode, predicate: (node: ASTNode, depth: number) => boolean): ASTNode[] {
    const results: ASTNode[] = []

    this.walk(root, {
      enter: (node, depth) => {
        if (predicate(node, depth)) {
          results.push(node)
        }
      },
    })

    return results
  }

  map<T>(root: ASTNode, callback: (node: ASTNode, depth: number) => T): T[] {
    const results: T[] = []

    this.walk(root, {
      enter: (node, depth) => {
        results.push(callback(node, depth))
      },
    })

    return results
  }

  filter(root: ASTNode, predicate: (node: ASTNode, depth: number) => boolean): ASTNode[] {
    return this.findAll(root, predicate)
  }

  reduce<T>(
    root: ASTNode,
    callback: (acc: T, node: ASTNode, depth: number) => T,
    initialValue: T,
  ): T {
    let acc = initialValue

    this.walk(root, {
      enter: (node, depth) => {
        acc = callback(acc, node, depth)
      },
    })

    return acc
  }

  count(root: ASTNode, predicate?: (node: ASTNode, depth: number) => boolean): number {
    if (predicate !== undefined) {
      return this.findAll(root, predicate).length
    }

    let total = 0
    this.walk(root, {
      enter: () => {
        total++
      },
    })
    return total
  }

  getPath(root: ASTNode, target: ASTNode): ASTNode[] | undefined {
    let result: ASTNode[] | undefined

    const search = (node: ASTNode, path: ASTNode[]): boolean => {
      if (node === target) {
        result = path
        return true
      }

      const children = node.children ?? []
      for (const child of children) {
        if (search(child, [...path, child])) return true
      }

      return false
    }

    search(root, [root])
    return result
  }

  getDepth(root: ASTNode, target: ASTNode): number | undefined {
    const path = this.getPath(root, target)
    if (path === undefined) return undefined
    return path.length - 1
  }

  getAncestors(root: ASTNode, target: ASTNode): ASTNode[] | undefined {
    const path = this.getPath(root, target)
    if (path === undefined) return undefined
    if (path.length <= 1) return []
    return path.slice(0, -1)
  }

  getStatistics(root: ASTNode): TreeStatistics {
    const cached = this._cache.get(root)
    if (cached !== undefined) return cached

    let totalNodes = 0
    let maxDepthReached = 0
    const typeCounts: Record<string, number> = {}
    let leafNodes = 0
    let branchNodes = 0
    const seen = new Set<ASTNode>()

    const walkStats = (node: ASTNode, depth: number): void => {
      if (seen.has(node)) return
      seen.add(node)

      totalNodes++
      if (depth > maxDepthReached) maxDepthReached = depth

      const currentCount = typeCounts[node.type] ?? 0
      typeCounts[node.type] = currentCount + 1

      const children = node.children ?? []
      if (children.length === 0) {
        leafNodes++
      } else {
        branchNodes++
        for (const child of children) {
          walkStats(child, depth + 1)
        }
      }
    }

    walkStats(root, 0)

    const stats: TreeStatistics = {
      totalNodes,
      maxDepth: maxDepthReached,
      typeCounts,
      leafNodes,
      branchNodes,
    }
    this._cache.set(root, stats)
    return stats
  }

  clear(): void {
    this._cache.clear()
  }
}
