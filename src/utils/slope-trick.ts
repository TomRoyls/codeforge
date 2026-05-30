export class SlopeTrick {
  private left: number[] = []
  private right: number[] = []
  private minCost: number = 0
  private leftBias: number = 0
  private rightBias: number = 0

  addAbsolute(): void {
    this.leftBias++
    this.rightBias++
  }

  addShiftLeft(a: number): void {
    if (this.left.length > 0) {
      const top = this.left[this.left.length - 1]! + this.leftBias
      this.minCost += Math.max(0, a - top)
    }
    this.left.push(a - this.leftBias)
    const val = this.left.pop()! + this.leftBias
    this.right.push(val - this.rightBias)
  }

  addShiftRight(a: number): void {
    if (this.right.length > 0) {
      const top = this.right[this.right.length - 1]! + this.rightBias
      this.minCost += Math.max(0, top - a)
    }
    this.right.push(a - this.rightBias)
    const val = this.right.pop()! + this.rightBias
    this.left.push(val - this.leftBias)
  }

  get min(): number {
    return this.minCost
  }

  get argmin(): { lo: number; hi: number } {
    const lo = this.left.length > 0 ? this.left[this.left.length - 1]! + this.leftBias : -Infinity
    const hi = this.right.length > 0 ? this.right[this.right.length - 1]! + this.rightBias : Infinity
    return { lo, hi }
  }
}
