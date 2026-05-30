export class CartesianProduct {
  static generate<T>(...sets: T[][]): T[][] {
    if (sets.length === 0) return [[]]
    const result: T[][] = []
    const indices = new Array<number>(sets.length).fill(0)
    const lengths = sets.map(s => s.length)
    if (lengths.some(l => l === 0)) return []
    while (true) {
      const combo: T[] = []
      for (let i = 0; i < sets.length; i++) {
        combo.push(sets[i]![indices[i]!]!)
      }
      result.push(combo)
      let carry = sets.length - 1
      while (carry >= 0) {
        indices[carry]!++
        if (indices[carry]! < lengths[carry]!) break
        indices[carry] = 0
        carry--
      }
      if (carry < 0) break
    }
    return result
  }

  static count(...lengths: number[]): number {
    return lengths.reduce((a, b) => a * b, 1)
  }

  static *lazy<T>(...sets: T[][]): Generator<T[]> {
    if (sets.length === 0) { yield []; return }
    const lengths = sets.map(s => s.length)
    if (lengths.some(l => l === 0)) return
    const indices = new Array<number>(sets.length).fill(0)
    while (true) {
      const combo: T[] = []
      for (let i = 0; i < sets.length; i++) {
        combo.push(sets[i]![indices[i]!]!)
      }
      yield combo
      let carry = sets.length - 1
      while (carry >= 0) {
        indices[carry]!++
        if (indices[carry]! < lengths[carry]!) break
        indices[carry] = 0
        carry--
      }
      if (carry < 0) break
    }
  }

  static withRepeat<T>(set: T[], k: number): T[][] {
    if (k === 0) return [[]]
    const sets: T[][] = Array.from({ length: k }, () => set)
    return CartesianProduct.generate(...sets)
  }
}
