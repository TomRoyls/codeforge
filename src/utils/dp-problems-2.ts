export class DPProblems2 {
  static knapsack(weights: number[], values: number[], capacity: number): number {
    const n = weights.length
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0))
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i - 1][w]
        if (weights[i - 1] <= w) {
          dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
        }
      }
    }
    return dp[n][capacity]
  }

  static coinChange(coins: number[], amount: number): number {
    const dp: number[] = new Array(amount + 1).fill(Infinity)
    dp[0] = 0
    for (let i = 1; i <= amount; i++) {
      for (const coin of coins) {
        if (coin <= i && dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1
        }
      }
    }
    return dp[amount] === Infinity ? -1 : dp[amount]
  }

  static lis(nums: number[]): number {
    if (nums.length === 0) return 0
    const dp: number[] = new Array(nums.length).fill(1)
    for (let i = 1; i < nums.length; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1
        }
      }
    }
    return Math.max(...dp)
  }

  static maxSubArray(nums: number[]): number {
    if (nums.length === 0) return 0
    let maxSum = nums[0]
    let currentSum = nums[0]
    for (let i = 1; i < nums.length; i++) {
      currentSum = Math.max(nums[i], currentSum + nums[i])
      maxSum = Math.max(maxSum, currentSum)
    }
    return maxSum
  }

  static climbStairs(n: number): number {
    if (n <= 2) return n
    let a = 1, b = 2
    for (let i = 3; i <= n; i++) { [a, b] = [b, a + b] }
    return b
  }

  static houseRobber(nums: number[]): number {
    if (nums.length === 0) return 0
    if (nums.length === 1) return nums[0]
    const dp: number[] = new Array(nums.length).fill(0)
    dp[0] = nums[0]
    dp[1] = Math.max(nums[0], nums[1])
    for (let i = 2; i < nums.length; i++) {
      dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i])
    }
    return dp[nums.length - 1]
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): DPProblems2 { return new DPProblems2() }
  equals(other: unknown): boolean { return other instanceof DPProblems2 }
}
