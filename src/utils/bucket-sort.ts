export function bucketSort(arr: number[], bucketCount: number = 10): number[] {
  if (arr.length <= 1) return [...arr]
  let min = arr[0]!
  let max = arr[0]!
  for (const v of arr) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (min === max) return [...arr]
  const range = max - min
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  for (const v of arr) {
    const idx = Math.min(Math.floor(((v - min) / range) * bucketCount), bucketCount - 1)
    buckets[idx]!.push(v)
  }
  const result: number[] = []
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b)
    result.push(...bucket)
  }
  return result
}

export function bucketSortDescending(arr: number[], bucketCount: number = 10): number[] {
  return bucketSort(arr, bucketCount).reverse()
}
