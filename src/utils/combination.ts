export class Combination {
  static generate<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]]
    if (k > arr.length) return []
    const result: T[][] = []
    const indices = Array.from({ length: k }, (_, i) => i)
    while (true) {
      result.push(indices.map(i => arr[i]!))
      let i = k - 1
      while (i >= 0 && indices[i]! === arr.length - k + i) i--
      if (i < 0) break
      indices[i]!++
      for (let j = i + 1; j < k; j++) {
        indices[j] = indices[j - 1]! + 1
      }
    }
    return result
  }

  static *lazy<T>(arr: T[], k: number): Generator<T[]> {
    if (k === 0) { yield []; return }
    if (k > arr.length) return
    const indices = Array.from({ length: k }, (_, i) => i)
    while (true) {
      yield indices.map(i => arr[i]!)
      let i = k - 1
      while (i >= 0 && indices[i]! === arr.length - k + i) i--
      if (i < 0) break
      indices[i]!++
      for (let j = i + 1; j < k; j++) {
        indices[j] = indices[j - 1]! + 1
      }
    }
  }

  static count(n: number, k: number): number {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    let result = 1
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1)
    }
    return Math.round(result)
  }

  static withReplacement<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]]
    const result: T[][] = []
    const indices = new Array<number>(k).fill(0)
    while (true) {
      result.push(indices.map(i => arr[i]!))
      let carry = k - 1
      while (carry >= 0) {
        indices[carry]!++
        if (indices[carry]! < arr.length) break
        indices[carry] = 0
        carry--
      }
      if (carry < 0) break
    }
    return result
  }

  static countWithReplacement(n: number, k: number): number {
    return Combination.count(n + k - 1, k)
  }
}
