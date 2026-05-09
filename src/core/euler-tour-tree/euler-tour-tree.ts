import type { TourNode, EulerTourTreeOptions } from './types.js'
import { DEFAULT_EULER_TOUR_TREE_OPTIONS } from './types.js'

export class EulerTourTree {
  private n: number
  private adjacency: Map<number, Set<number>>
  private compId: number[]
  private tourRoots: Map<number, TourNode | null>

  constructor(n: number, _options?: Partial<EulerTourTreeOptions>) {
    void DEFAULT_EULER_TOUR_TREE_OPTIONS
    this.n = n
    this.adjacency = new Map()
    this.compId = new Array(n)
    this.tourRoots = new Map()
    for (let i = 0; i < n; i++) {
      this.adjacency.set(i, new Set())
      this.compId[i] = i
      const node: TourNode = {
        vertex: i,
        left: null,
        right: null,
        parent: null,
        subtreeSize: 1,
      }
      this.tourRoots.set(i, node)
    }
  }

  private rotateRight(x: TourNode): void {
    const y = x.parent!
    const p = y.parent
    y.left = x.right
    if (x.right !== null) x.right.parent = y
    x.right = y
    y.parent = x
    x.parent = p
    if (p !== null) {
      if (p.left === y) p.left = x
      else p.right = x
    }
    this.updateSize(y)
    this.updateSize(x)
  }

  private rotateLeft(x: TourNode): void {
    const y = x.parent!
    const p = y.parent
    y.right = x.left
    if (x.left !== null) x.left.parent = y
    x.left = y
    y.parent = x
    x.parent = p
    if (p !== null) {
      if (p.left === y) p.left = x
      else p.right = x
    }
    this.updateSize(y)
    this.updateSize(x)
  }

  private splay(node: TourNode): void {
    while (node.parent !== null) {
      const parent = node.parent
      const grandparent = parent.parent
      if (grandparent === null) {
        if (parent.left === node) {
          this.rotateRight(node)
        } else {
          this.rotateLeft(node)
        }
      } else if (parent.left === node && grandparent.left === parent) {
        this.rotateRight(parent)
        this.rotateRight(node)
      } else if (parent.right === node && grandparent.right === parent) {
        this.rotateLeft(parent)
        this.rotateLeft(node)
      } else if (parent.left === node && grandparent.right === parent) {
        this.rotateRight(node)
        this.rotateLeft(node)
      } else {
        this.rotateLeft(node)
        this.rotateRight(node)
      }
    }
  }

  private updateSize(node: TourNode): void {
    let size = 1
    if (node.left !== null) size += node.left.subtreeSize
    if (node.right !== null) size += node.right.subtreeSize
    node.subtreeSize = size
  }

  private findSplayRoot(node: TourNode): TourNode {
    let current = node
    while (current.parent !== null) {
      current = current.parent
    }
    return current
  }

  private treeMin(node: TourNode): TourNode {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private treeMax(node: TourNode): TourNode {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  private buildFromArray(arr: number[], lo: number, hi: number, parent: TourNode | null): TourNode | null {
    if (lo > hi) return null
    const mid = (lo + hi) >> 1
    const node: TourNode = {
      vertex: arr[mid]!,
      left: null,
      right: null,
      parent,
      subtreeSize: hi - lo + 1,
    }
    node.left = this.buildFromArray(arr, lo, mid - 1, node)
    node.right = this.buildFromArray(arr, mid + 1, hi, node)
    return node
  }

  private inorderTraversal(root: TourNode | null): number[] {
    const result: number[] = []
    const stack: TourNode[] = []
    let current = root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.vertex)
      current = current.right
    }
    return result
  }

  private computeEulerTour(root: number): number[] {
    const tour: number[] = []
    const visited = new Set<number>()
    const dfs = (v: number): void => {
      visited.add(v)
      tour.push(v)
      for (const u of this.adjacency.get(v)!) {
        if (!visited.has(u)) {
          dfs(u)
          tour.push(v)
        }
      }
    }
    dfs(root)
    return tour
  }

  private bfsComponent(start: number): number[] {
    const result: number[] = []
    const visited = new Set<number>()
    const queue: number[] = [start]
    visited.add(start)
    while (queue.length > 0) {
      const v = queue.shift()!
      result.push(v)
      for (const u of this.adjacency.get(v)!) {
        if (!visited.has(u)) {
          visited.add(u)
          queue.push(u)
        }
      }
    }
    return result
  }

  private rebuildTour(v: number): void {
    const component = this.bfsComponent(v)
    let rep = component[0]!
    for (const vx of component) {
      if (vx < rep) rep = vx
    }
    for (const vx of component) {
      this.compId[vx] = rep
      this.tourRoots.delete(vx)
    }
    const tour = this.computeEulerTour(rep)
    const splayRoot = this.buildFromArray(tour, 0, tour.length - 1, null)
    this.tourRoots.set(rep, splayRoot)
  }

  link(u: number, v: number): void {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return
    if (u === v) return
    if (this.isConnected(u, v)) return
    this.adjacency.get(u)!.add(v)
    this.adjacency.get(v)!.add(u)
    this.rebuildTour(u)
  }

  cut(u: number, v: number): void {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return
    if (!this.adjacency.get(u)!.has(v)) return
    this.adjacency.get(u)!.delete(v)
    this.adjacency.get(v)!.delete(u)
    this.rebuildTour(u)
    this.rebuildTour(v)
  }

  isConnected(u: number, v: number): boolean {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return false
    if (u === v) return true
    return this.compId[u] === this.compId[v]
  }

  findRoot(u: number): number {
    if (u < 0 || u >= this.n) return -1
    const rep = this.compId[u]!
    const tourRoot = this.tourRoots.get(rep)
    if (tourRoot === null || tourRoot === undefined) return rep
    const actualRoot = this.findSplayRoot(tourRoot)
    const minNode = this.treeMin(actualRoot)
    this.splay(minNode)
    this.tourRoots.set(rep, minNode)
    return minNode.vertex
  }

  getSize(u: number): number {
    if (u < 0 || u >= this.n) return 0
    return this.bfsComponent(u).length
  }

  getComponentSize(): number {
    return this.n
  }

  getEdges(): [number, number][] {
    const edges: [number, number][] = []
    const seen = new Set<string>()
    for (const [u, neighbors] of this.adjacency) {
      for (const v of neighbors) {
        const a = u < v ? u : v
        const b = u < v ? v : u
        const key = `${a},${b}`
        if (!seen.has(key)) {
          seen.add(key)
          edges.push([a, b])
        }
      }
    }
    return edges
  }

  getPath(u: number, v: number): number[] {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return []
    if (u === v) return [u]
    if (!this.isConnected(u, v)) return []
    const rep = this.compId[u]!
    const tourRoot = this.tourRoots.get(rep)
    if (tourRoot !== null && tourRoot !== undefined) {
      const seq = this.inorderTraversal(tourRoot)
      const root = this.findSplayRoot(tourRoot)
      this.tourRoots.set(rep, root)
      void seq
    }
    const parentMap = new Map<number, number>()
    const visited = new Set<number>()
    const queue: number[] = [u]
    visited.add(u)
    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === v) break
      for (const neighbor of this.adjacency.get(current)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          parentMap.set(neighbor, current)
          queue.push(neighbor)
        }
      }
    }
    const path: number[] = []
    let cur: number | undefined = v
    while (cur !== undefined) {
      path.push(cur)
      cur = parentMap.get(cur)
    }
    return path.reverse()
  }

  getNeighbors(node: number): number[] {
    if (node < 0 || node >= this.n) return []
    return Array.from(this.adjacency.get(node)!)
  }

  degree(node: number): number {
    if (node < 0 || node >= this.n) return 0
    return this.adjacency.get(node)!.size
  }

  getDepth(node: number): number {
    if (node < 0 || node >= this.n) return -1
    const root = this.compId[node]!
    if (node === root) return 0
    const depthMap = new Map<number, number>()
    const visited = new Set<number>()
    const queue: number[] = [root]
    visited.add(root)
    depthMap.set(root, 0)
    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === node) break
      for (const neighbor of this.adjacency.get(current)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          depthMap.set(neighbor, depthMap.get(current)! + 1)
          queue.push(neighbor)
        }
      }
    }
    return depthMap.get(node) ?? 0
  }

  lca(u: number, v: number): number {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) return -1
    if (u === v) return u
    if (!this.isConnected(u, v)) return -1
    const root = this.compId[u]!
    const parentMap = new Map<number, number>()
    const depthMap = new Map<number, number>()
    const visited = new Set<number>()
    const queue: number[] = [root]
    visited.add(root)
    depthMap.set(root, 0)
    parentMap.set(root, root)
    while (queue.length > 0) {
      const current = queue.shift()!
      for (const neighbor of this.adjacency.get(current)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          parentMap.set(neighbor, current)
          depthMap.set(neighbor, depthMap.get(current)! + 1)
          queue.push(neighbor)
        }
      }
    }
    let cu = u
    let cv = v
    let du = depthMap.get(cu)!
    let dv = depthMap.get(cv)!
    while (du > dv) {
      cu = parentMap.get(cu)!
      du--
    }
    while (dv > du) {
      cv = parentMap.get(cv)!
      dv--
    }
    while (cu !== cv) {
      cu = parentMap.get(cu)!
      cv = parentMap.get(cv)!
    }
    return cu
  }

  clone(): EulerTourTree {
    for (const [rep, root] of this.tourRoots) {
      if (root !== null) {
        const max = this.treeMax(root)
        this.splay(max)
        this.tourRoots.set(rep, max)
      }
    }
    const copy = new EulerTourTree(this.n)
    const seen = new Set<string>()
    for (const [u, neighbors] of this.adjacency) {
      for (const v of neighbors) {
        const a = u < v ? u : v
        const b = u < v ? v : u
        const key = `${a},${b}`
        if (!seen.has(key)) {
          seen.add(key)
          copy.link(a, b)
        }
      }
    }
    return copy
  }
}

export { DEFAULT_EULER_TOUR_TREE_OPTIONS } from './types.js'
export type { TourNode, EulerTourTreeOptions } from './types.js'
