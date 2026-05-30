export class CountingInversions {
  static count(arr: number[]): number {
    if (arr.length <= 1) return 0
    const copy = [...arr]
    return CountingInversions.mergeSort(copy, 0, copy.length - 1)
  }

  private static mergeSort(arr: number[], left: number, right: number): number {
    if (left >= right) return 0
    const mid = Math.floor((left + right) / 2)
    let inv = CountingInversions.mergeSort(arr, left, mid)
    inv += CountingInversions.mergeSort(arr, mid + 1, right)
    inv += CountingInversions.merge(arr, left, mid, right)
    return inv
  }

  private static merge(arr: number[], left: number, mid: number, right: number): number {
    const temp: number[] = []
    let i = left
    let j = mid + 1
    let inv = 0
    while (i <= mid && j <= right) {
      if (arr[i]! <= arr[j]!) {
        temp.push(arr[i]!)
        i++
      } else {
        temp.push(arr[j]!)
        inv += mid - i + 1
        j++
      }
    }
    while (i <= mid) {
      temp.push(arr[i]!)
      i++
    }
    while (j <= right) {
      temp.push(arr[j]!)
      j++
    }
    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k]!
    }
    return inv
  }

  static countBruteForce(arr: number[]): number {
    let count = 0
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i]! > arr[j]!) count++
      }
    }
    return count
  }

  static sortedWithCount(arr: number[]): { sorted: number[]; inversions: number } {
    const copy = [...arr]
    const inversions = CountingInversions.mergeSort(copy, 0, copy.length - 1)
    return { sorted: copy, inversions }
  }
}
