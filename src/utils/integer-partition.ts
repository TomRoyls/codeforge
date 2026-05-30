export class IntegerPartition {
  static generate(n: number): number[][] {
    if (n <= 0) return []
    const result: number[][] = []
    const partition: number[] = new Array(n).fill(0)
    let k = 0
    partition[0] = n
    while (true) {
      result.push(partition.slice(0, k + 1))
      let remaining = 0
      while (k >= 0 && partition[k] === 1) {
        remaining += partition[k]!
        k--
      }
      if (k < 0) break
      partition[k]!--
      remaining++
      while (remaining > partition[k]!) {
        partition[k + 1] = partition[k]!
        remaining -= partition[k]!
        k++
      }
      partition[k + 1] = remaining
      k++
    }
    return result
  }

  static count(n: number): number {
    if (n < 0) return 0
    const dp = new Array<number>(n + 1).fill(0)
    dp[0] = 1
    for (let i = 1; i <= n; i++) {
      for (let j = i; j <= n; j++) {
        dp[j] += dp[j - i]!
      }
    }
    return dp[n]!
  }

  static generateDistinct(n: number): number[][] {
    const result: number[][] = []
    IntegerPartition.generateDistinctHelper(n, 1, [], result)
    return result
  }

  private static generateDistinctHelper(
    remaining: number, minPart: number, current: number[], result: number[][]
  ): void {
    if (remaining === 0) {
      result.push([...current])
      return
    }
    for (let part = minPart; part <= remaining; part++) {
      current.push(part)
      IntegerPartition.generateDistinctHelper(remaining - part, part + 1, current, result)
      current.pop()
    }
  }

  static generateFixedLength(n: number, k: number): number[][] {
    const result: number[][] = []
    IntegerPartition.fixedLengthHelper(n, k, 1, [], result)
    return result
  }

  private static fixedLengthHelper(
    remaining: number, length: number, minPart: number, current: number[], result: number[][]
  ): void {
    if (length === 0) {
      if (remaining === 0) result.push([...current])
      return
    }
    for (let part = minPart; part <= remaining - length + 1; part++) {
      current.push(part)
      IntegerPartition.fixedLengthHelper(remaining - part, length - 1, part, current, result)
      current.pop()
    }
  }
}
