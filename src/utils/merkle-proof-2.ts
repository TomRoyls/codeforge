export interface ProofStep2 {
  hash: string
  position: 'left' | 'right'
}

export class MerkleProof2 {
  private steps: ProofStep2[] = []
  private hashFn: (a: string, b: string) => string

  constructor(hashFn?: (a: string, b: string) => string) {
    this.hashFn = hashFn ?? ((a, b) => {
      const combined = a + b
      let h = 0
      for (let i = 0; i < combined.length; i++) {
        h = ((h << 5) - h) + combined.charCodeAt(i)
        h |= 0
      }
      return Math.abs(h).toString(16)
    })
  }

  addStep(hash: string, position: 'left' | 'right'): this {
    this.steps.push({ hash, position })
    return this
  }

  verify(leaf: string, root: string): boolean {
    let computed = leaf
    for (const step of this.steps) {
      if (step.position === 'left') {
        computed = this.hashFn(step.hash, computed)
      } else {
        computed = this.hashFn(computed, step.hash)
      }
    }
    return computed === root
  }

  getSteps(): ProofStep2[] {
    return [...this.steps]
  }

  getStep(index: number): ProofStep2 | undefined {
    return this.steps[index]
  }

  count(): number { return this.steps.length }

  reverse(): MerkleProof2 {
    const mp = new MerkleProof2(this.hashFn)
    mp.steps = [...this.steps].reverse()
    return mp
  }

  merge(other: MerkleProof2): MerkleProof2 {
    const mp = new MerkleProof2(this.hashFn)
    mp.steps = [...this.steps, ...other.steps]
    return mp
  }

  setHashFn(fn: (a: string, b: string) => string): this {
    this.hashFn = fn
    return this
  }

  getHashFn(): (a: string, b: string) => string {
    return this.hashFn
  }

  toArray(): ProofStep2[] { return this.getSteps() }
  toString(): string { return JSON.stringify({ steps: this.count() }) }
  toJSON(): Record<string, unknown> { return { steps: this.steps } }
  clone(): MerkleProof2 {
    const mp = new MerkleProof2(this.hashFn)
    mp.steps = [...this.steps]
    return mp
  }
  equals(other: unknown): boolean {
    if (!(other instanceof MerkleProof2)) return false
    return this.steps.length === other.steps.length
  }
  clear(): void { this.steps = [] }
}
