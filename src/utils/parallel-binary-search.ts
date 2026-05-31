export class ParallelBinarySearch {
  static search(
    queries: { lo: number; hi: number; check: (mid: number) => boolean }[],
  ): number[] {
    const n = queries.length
    const answers = new Array(n).fill(-1)
    const los = queries.map((q) => q.lo)
    const his = queries.map((q) => q.hi)

    let hasActive = true
    while (hasActive) {
      hasActive = false
      for (let i = 0; i < n; i++) {
        if (los[i]! > his[i]!) continue
        hasActive = true
        const mid = Math.floor((los[i]! + his[i]!) / 2)
        if (queries[i]!.check(mid)) {
          answers[i] = mid
          his[i] = mid - 1
        } else {
          los[i] = mid + 1
        }
      }
    }
    return answers
  }
}
