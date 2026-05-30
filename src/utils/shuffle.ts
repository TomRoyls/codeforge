export class Shuffle {
  static fisherYates<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = result[i]!
      result[i] = result[j]!
      result[j] = temp
    }
    return result
  }

  static inPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = temp
    }
    return arr
  }

  static weightedSample<T>(items: T[], weights: number[], count: number): T[] {
    if (count > items.length) throw new RangeError('count exceeds items length')
    const result: T[] = []
    const remaining = [...items]
    const remainingWeights = [...weights]
    for (let k = 0; k < count; k++) {
      const totalWeight = remainingWeights.reduce((a, b) => a + b, 0)
      let r = Math.random() * totalWeight
      let idx = 0
      for (let i = 0; i < remainingWeights.length; i++) {
        r -= remainingWeights[i]!
        if (r <= 0) { idx = i; break }
      }
      result.push(remaining[idx]!)
      remaining.splice(idx, 1)
      remainingWeights.splice(idx, 1)
    }
    return result
  }

  static isShuffled<T>(original: T[], shuffled: T[]): boolean {
    if (original.length !== shuffled.length) return false
    const origSet = new Map<T, number>()
    for (const item of original) origSet.set(item, (origSet.get(item) ?? 0) + 1)
    for (const item of shuffled) {
      const count = origSet.get(item)
      if (!count) return false
      origSet.set(item, count - 1)
    }
    return true
  }
}
