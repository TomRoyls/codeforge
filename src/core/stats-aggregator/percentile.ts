/**
 * Linear interpolation percentile for a pre-sorted ascending number array.
 * @param sorted - Numbers sorted in ascending order
 * @param p - Percentile in range [0, 100]
 */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]!

  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const fraction = index - lower

  if (lower === upper) {
    return sorted[lower]!
  }

  return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
}
