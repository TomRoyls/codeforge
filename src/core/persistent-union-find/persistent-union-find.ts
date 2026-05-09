import type { VersionData } from './types.js'

export class PersistentUnionFind {
  private versions: VersionData[]
  private n: number

  constructor(n: number) {
    if (n < 0) {
      throw new Error(`Element count must be non-negative, got ${n}`)
    }
    this.n = n
    const parent: number[] = []
    const size: number[] = []
    for (let i = 0; i < n; i++) {
      parent.push(i)
      size.push(1)
    }
    this.versions = [{ parent, size }]
  }

  private validateVersion(version: number): void {
    if (version < 0 || version >= this.versions.length) {
      throw new Error(`Invalid version ${version}, valid range: 0..${this.versions.length - 1}`)
    }
  }

  private validateElement(x: number): void {
    if (x < 0 || x >= this.n) {
      throw new Error(`Element ${x} out of range, valid: 0..${this.n - 1}`)
    }
  }

  private findRoot(parent: number[], x: number): number {
    let current = x
    while (parent[current]! !== current) {
      current = parent[current]!
    }
    return current
  }

  union(x: number, y: number): number {
    this.validateElement(x)
    this.validateElement(y)

    const lastIdx = this.versions.length - 1
    const latest = this.versions[lastIdx]!
    const parent = [...latest.parent]
    const size = [...latest.size]

    const rootX = this.findRoot(parent, x)
    const rootY = this.findRoot(parent, y)

    if (rootX === rootY) {
      const newVersion: VersionData = { parent, size }
      this.versions.push(newVersion)
      return this.versions.length - 1
    }

    if (size[rootX]! < size[rootY]!) {
      parent[rootX] = rootY
      size[rootY] = size[rootY]! + size[rootX]!
    } else {
      parent[rootY] = rootX
      size[rootX] = size[rootX]! + size[rootY]!
    }

    const newVersion: VersionData = { parent, size }
    this.versions.push(newVersion)
    return this.versions.length - 1
  }

  find(version: number, x: number): number {
    this.validateVersion(version)
    this.validateElement(x)
    const v = this.versions[version]!
    return this.findRoot(v.parent, x)
  }

  connected(version: number, x: number, y: number): boolean {
    this.validateVersion(version)
    this.validateElement(x)
    this.validateElement(y)
    const v = this.versions[version]!
    return this.findRoot(v.parent, x) === this.findRoot(v.parent, y)
  }

  getSize(version: number, x: number): number
  getSize(): number
  getSize(version?: number, x?: number): number {
    if (version === undefined || x === undefined) {
      return this.n
    }
    this.validateVersion(version)
    this.validateElement(x)
    const v = this.versions[version]!
    const root = this.findRoot(v.parent, x)
    return v.size[root]!
  }

  getComponentCount(version: number): number {
    this.validateVersion(version)
    const v = this.versions[version]!
    let count = 0
    for (let i = 0; i < this.n; i++) {
      if (v.parent[i] === i) {
        count++
      }
    }
    return count
  }

  getLatestVersion(): number {
    return this.versions.length - 1
  }

  getVersionCount(): number {
    return this.versions.length
  }

  getVersionData(version: number): VersionData {
    this.validateVersion(version)
    const v = this.versions[version]!
    return { parent: [...v.parent], size: [...v.size] }
  }

  clone(): PersistentUnionFind {
    const cloned = new PersistentUnionFind(this.n)
    cloned.versions = this.versions.map((v) => ({
      parent: [...v.parent],
      size: [...v.size],
    }))
    return cloned
  }
}

export type { VersionData } from './types.js'
