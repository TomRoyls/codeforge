type CompareFn<T> = (a: T, b: T) => number

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function shellSortInternal<T>(
  arr: T[],
  compare: CompareFn<T>,
  gapSequence: number[],
): void {
  const n = arr.length
  for (const gap of gapSequence) {
    if (gap > n) continue
    for (let i = gap; i < n; i++) {
      const temp = arr[i]!
      let j = i
      while (j >= gap) {
        if (compare(arr[j - gap]!, temp) > 0) {
          arr[j] = arr[j - gap]!
          j = j - gap
        } else {
          break
        }
      }
      arr[j] = temp
    }
  }
}

function ciuraGaps(): number[] {
  return [1750, 701, 301, 132, 57, 23, 10, 4, 1]
}

function sedgewickGaps(): number[] {
  return [260609, 146305, 64769, 36289, 16001, 8929, 3905, 2161, 929, 505, 209, 109, 41, 19, 5, 1]
}

function knuthGaps(n: number): number[] {
  const gaps: number[] = [1]
  let h = 1
  while (h < n / 3) {
    h = h * 3 + 1
    gaps.unshift(h)
  }
  return gaps
}

export class ShellSort4<T> {
  private compare: CompareFn<T>

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    shellSortInternal(copy, this.compare, knuthGaps(arr.length))
    return copy
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const reverseCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    shellSortInternal(copy, reverseCompare, knuthGaps(arr.length))
    return copy
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  sortWithGap(arr: T[], gapSequence: number[]): T[] {
    if (arr.length <= 1) return [...arr]
    const copy = [...arr]
    const reversedGaps = [...gapSequence].reverse()
    shellSortInternal(copy, this.compare, reversedGaps)
    return copy
  }

  ciuraGaps(): number[] {
    return ciuraGaps()
  }

  sedgewickGaps(): number[] {
    return sedgewickGaps()
  }

  knuthGaps(): number[] {
    return knuthGaps(1000000)
  }

  getTimeComplexity(): string {
    return 'O(n^(4/3)) to O(n^(3/2))'
  }

  getSpaceComplexity(): string {
    return 'O(1)'
  }

  toString(): string {
    return `ShellSort4()`
  }
}
