import * as crypto from 'crypto'

export class MerkleTree2 {
  private leaves: string[] = []
  private nodes: string[][] = []
  private hashFn: (data: string) => string

  constructor(data: string[] = [], hashFn?: (data: string) => string) {
    this.hashFn = hashFn ?? ((s: string) => crypto.createHash('sha256').update(s).digest('hex'))
    if (data.length > 0) {
      this.build(data)
    }
  }

  build(data: string[]): void {
    this.leaves = data.map(d => this.hashFn(d))
    this.nodes = []

    if (this.leaves.length === 0) {
      this.nodes.push([])
      return
    }

    let current = [...this.leaves]
    this.nodes.push(current)

    while (current.length > 1) {
      const next: string[] = []
      for (let i = 0; i < current.length; i += 2) {
        if (i + 1 < current.length) {
          next.push(this.hashFn(current[i] + current[i + 1]))
        } else {
          next.push(this.hashFn(current[i] + current[i]))
        }
      }
      this.nodes.push(next)
      current = next
    }
  }

  getRoot(): string {
    if (this.nodes.length === 0) return ''
    const last = this.nodes[this.nodes.length - 1]
    return last[0] ?? ''
  }

  getLeaves(): string[] {
    return [...this.leaves]
  }

  getLeaf(index: number): string | undefined {
    return this.leaves[index]
  }

  getDepth(): number {
    return this.nodes.length - 1
  }

  getLevels(): string[][] {
    return this.nodes.map(level => [...level])
  }

  getProof(index: number): { hash: string; direction: 'left' | 'right' }[] {
    const proof: { hash: string; direction: 'left' | 'right' }[] = []
    let idx = index

    for (let level = 0; level < this.nodes.length - 1; level++) {
      const currentLevel = this.nodes[level]
      const isRight = idx % 2 === 1
      const siblingIdx = isRight ? idx - 1 : idx + 1

      if (siblingIdx < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIdx],
          direction: isRight ? 'left' : 'right',
        })
      } else {
        proof.push({
          hash: currentLevel[idx],
          direction: 'right',
        })
      }

      idx = Math.floor(idx / 2)
    }

    return proof
  }

  verifyProof(leaf: string, proof: { hash: string; direction: 'left' | 'right' }[], root: string): boolean {
    let computed = leaf
    for (const { hash, direction } of proof) {
      if (direction === 'left') {
        computed = this.hashFn(hash + computed)
      } else {
        computed = this.hashFn(computed + hash)
      }
    }
    return computed === root
  }

  count(): number { return this.leaves.length }

  toArray(): string[] { return this.getLeaves() }
  toString(): string { return JSON.stringify({ leaves: this.count(), depth: this.getDepth() }) }
  toJSON(): Record<string, unknown> { return { leaves: this.count(), depth: this.getDepth(), root: this.getRoot() } }
  clone(): MerkleTree2 {
    const mt = new MerkleTree2([], this.hashFn)
    mt.leaves = [...this.leaves]
    mt.nodes = this.nodes.map(level => [...level])
    return mt
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MerkleTree2)) return false
    return this.getRoot() === other.getRoot()
  }
  clear(): void { this.leaves = []; this.nodes = [] }
}
