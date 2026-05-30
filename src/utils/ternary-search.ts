export class TernarySearch {
  static findMax(
    f: (x: number) => number,
    left: number,
    right: number,
    iterations: number = 200,
  ): number {
    for (let i = 0; i < iterations; i++) {
      const mid1 = left + (right - left) / 3
      const mid2 = right - (right - left) / 3
      if (f(mid1) < f(mid2)) {
        left = mid1
      } else {
        right = mid2
      }
    }
    return (left + right) / 2
  }

  static findMin(
    f: (x: number) => number,
    left: number,
    right: number,
    iterations: number = 200,
  ): number {
    for (let i = 0; i < iterations; i++) {
      const mid1 = left + (right - left) / 3
      const mid2 = right - (right - left) / 3
      if (f(mid1) > f(mid2)) {
        left = mid1
      } else {
        right = mid2
      }
    }
    return (left + right) / 2
  }

  static findMaxInteger(
    f: (x: number) => number,
    left: number,
    right: number,
  ): { index: number; value: number } {
    while (right - left > 2) {
      const mid1 = left + Math.floor((right - left) / 3)
      const mid2 = right - Math.floor((right - left) / 3)
      if (f(mid1) < f(mid2)) {
        left = mid1
      } else {
        right = mid2
      }
    }
    let bestIdx = left
    let bestVal = f(left)
    for (let i = left + 1; i <= right; i++) {
      const val = f(i)
      if (val > bestVal) {
        bestVal = val
        bestIdx = i
      }
    }
    return { index: bestIdx, value: bestVal }
  }

  static findMinInteger(
    f: (x: number) => number,
    left: number,
    right: number,
  ): { index: number; value: number } {
    while (right - left > 2) {
      const mid1 = left + Math.floor((right - left) / 3)
      const mid2 = right - Math.floor((right - left) / 3)
      if (f(mid1) > f(mid2)) {
        left = mid1
      } else {
        right = mid2
      }
    }
    let bestIdx = left
    let bestVal = f(left)
    for (let i = left + 1; i <= right; i++) {
      const val = f(i)
      if (val < bestVal) {
        bestVal = val
        bestIdx = i
      }
    }
    return { index: bestIdx, value: bestVal }
  }
}
