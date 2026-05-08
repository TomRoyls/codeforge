export class HashComputer {
  private algorithm: 'simple' | 'djb2' | 'fnv1a'

  constructor(algorithm: 'simple' | 'djb2' | 'fnv1a' = 'djb2') {
    this.algorithm = algorithm
  }

  compute(content: string): string {
    switch (this.algorithm) {
      case 'simple':
        return this.computeSimple(content)
      case 'djb2':
        return this.computeDjb2(content)
      case 'fnv1a':
        return this.computeFNV1a(content)
    }
  }

  computeSimple(content: string): string {
    let sum = 0
    for (let i = 0; i < content.length; i++) {
      sum += content.charCodeAt(i)
    }
    return sum.toString(16)
  }

  computeDjb2(content: string): string {
    let hash = 5381
    for (let i = 0; i < content.length; i++) {
      hash = (hash * 33) + content.charCodeAt(i)
    }
    return (hash >>> 0).toString(16)
  }

  computeFNV1a(content: string): string {
    let hash = 2166136261
    const prime = 16777619
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i)
      hash = Math.imul(hash, prime)
    }
    return (hash >>> 0).toString(16)
  }

  setAlgorithm(algo: 'simple' | 'djb2' | 'fnv1a'): void {
    this.algorithm = algo
  }

  getAlgorithm(): 'simple' | 'djb2' | 'fnv1a' {
    return this.algorithm
  }
}
