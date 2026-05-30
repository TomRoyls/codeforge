export class InterpolationSearch {
  static search(arr: number[], target: number): number {
    if (arr.length === 0) return -1
    let low = 0
    let high = arr.length - 1
    while (low <= high && target >= arr[low]! && target <= arr[high]!) {
      if (arr[low] === arr[high]) {
        return arr[low] === target ? low : -1
      }
      const pos = low + Math.floor(((target - arr[low]!) / (arr[high]! - arr[low]!)) * (high - low))
      const clamped = Math.max(low, Math.min(high, pos))
      if (arr[clamped] === target) return clamped
      if (arr[clamped]! < target) {
        low = clamped + 1
      } else {
        high = clamped - 1
      }
    }
    return -1
  }

  static findFirst(arr: number[], target: number): number {
    const idx = InterpolationSearch.search(arr, target)
    if (idx === -1) return -1
    let result = idx
    while (result > 0 && arr[result - 1] === target) result--
    return result
  }

  static findLast(arr: number[], target: number): number {
    const idx = InterpolationSearch.search(arr, target)
    if (idx === -1) return -1
    let result = idx
    while (result < arr.length - 1 && arr[result + 1] === target) result++
    return result
  }

  static rangeSearch(arr: number[], target: number): [number, number] | null {
    const first = InterpolationSearch.findFirst(arr, target)
    if (first === -1) return null
    const last = InterpolationSearch.findLast(arr, target)
    return [first, last]
  }

  static contains(arr: number[], target: number): boolean {
    return InterpolationSearch.search(arr, target) !== -1
  }

  static closest(arr: number[], target: number): number {
    if (arr.length === 0) return -1
    if (target <= arr[0]!) return 0
    if (target >= arr[arr.length - 1]!) return arr.length - 1
    const idx = InterpolationSearch.search(arr, target)
    if (idx !== -1) return idx
    let low = 0
    let high = arr.length - 1
    while (low <= high) {
      if (arr[low] === arr[high]) break
      const pos = low + Math.floor(((target - arr[low]!) / (arr[high]! - arr[low]!)) * (high - low))
      const clamped = Math.max(low, Math.min(high, pos))
      if (arr[clamped]! < target) {
        low = clamped + 1
      } else {
        high = clamped - 1
      }
    }
    if (low >= arr.length) return high
    if (high < 0) return low
    const dLow = Math.abs(arr[low]! - target)
    const dHigh = Math.abs(arr[high]! - target)
    return dLow < dHigh ? low : high
  }
}
