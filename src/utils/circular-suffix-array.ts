export class CircularSuffixArray {
  readonly indices: number[]
  readonly length: number

  constructor(input: string) {
    this.length = input.length
    this.indices = Array.from({ length: this.length }, (_, i) => i)
    this.indices.sort((a, b) => {
      for (let k = 0; k < this.length; k++) {
        const ca = input.charCodeAt((a + k) % this.length)
        const cb = input.charCodeAt((b + k) % this.length)
        if (ca !== cb) return ca - cb
      }
      return 0
    })
  }

  index(i: number): number {
    return this.indices[i]!
  }

  rank(suffixIndex: number): number {
    for (let i = 0; i < this.length; i++) {
      if (this.indices[i] === suffixIndex) return i
    }
    return -1
  }

  first(): number {
    return this.indices[0]!
  }

  last(): number {
    return this.indices[this.length - 1]!
  }
}
