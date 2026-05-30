export interface Interval {
  start: number
  end: number
  weight: number
}

export function weightedIntervalSchedule(intervals: Interval[]): { selected: Interval[]; totalWeight: number } {
  if (intervals.length === 0) return { selected: [], totalWeight: 0 }

  const sorted = [...intervals].sort((a, b) => a.end - b.end)
  const n = sorted.length
  const p = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    p[i] = -1
    for (let j = i - 1; j >= 0; j--) {
      if (sorted[j]!.end <= sorted[i]!.start) {
        p[i] = j
        break
      }
    }
  }

  const dp = new Float64Array(n + 1)
  dp[0] = 0
  for (let i = 1; i <= n; i++) {
    const take = sorted[i - 1]!.weight + (p[i - 1] === -1 ? 0 : dp[p[i - 1]! + 1]!)
    const skip = dp[i - 1]!
    dp[i] = Math.max(take, skip)
  }

  const selected: Interval[] = []
  let i = n
  while (i > 0) {
    const prevIdx = p[i - 1]! + 1
    const take = sorted[i - 1]!.weight + (p[i - 1] === -1 ? 0 : dp[prevIdx]!)
    if (take > dp[i - 1]!) {
      selected.push(sorted[i - 1]!)
      i = prevIdx
    } else {
      i--
    }
  }

  return { selected: selected.reverse(), totalWeight: dp[n]! }
}

export function greedyIntervalSchedule(intervals: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (intervals.length === 0) return []

  const sorted = [...intervals].sort((a, b) => a.end - b.end)
  const selected: Array<{ start: number; end: number }> = [sorted[0]!]
  let lastEnd = sorted[0]!.end

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.start >= lastEnd) {
      selected.push(sorted[i]!)
      lastEnd = sorted[i]!.end
    }
  }

  return selected
}
