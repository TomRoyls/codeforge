type CompareFn<T> = (a: T, b: T) => number

interface PileNode<T> {
  value: T
  prev: PileNode<T> | null
  pileIndex: number
}

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function binarySearchPile<T>(
  piles: T[][],
  value: T,
  compare: CompareFn<T>,
): number {
  if (piles.length === 0) return 0

  let left = 0
  let right = piles.length

  while (left < right) {
    const mid = (left + right) >>> 1
    const top = piles[mid]![piles[mid]!.length - 1]!

    if (compare(top, value) < 0) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}

function buildPiles<T>(
  arr: T[],
  compare: CompareFn<T>,
): { piles: T[][]; nodes: PileNode<T>[] } {
  const piles: T[][] = []
  const nodes: PileNode<T>[] = []

  for (const value of arr) {
    const pileIndex = binarySearchPile(piles, value, compare)

    if (pileIndex === piles.length) {
      piles.push([value])
    } else {
      piles[pileIndex]!.push(value)
    }

    const prevIndex = pileIndex > 0 ? nodes.length - 1 : -1
    const prev = prevIndex >= 0 ? nodes[prevIndex]! : null

    nodes.push({
      value,
      prev,
      pileIndex,
    })
  }

  return { piles, nodes }
}

function extractLIS<T>(nodes: PileNode<T>[], piles: T[][]): T[] {
  if (nodes.length === 0 || piles.length === 0) return []

  const lis: T[] = []
  let pileIndex = piles.length - 1
  let nodeIndex = nodes.length - 1

  while (pileIndex >= 0 && nodeIndex >= 0) {
    while (nodeIndex >= 0 && nodes[nodeIndex]!.pileIndex !== pileIndex) {
      nodeIndex--
    }
    if (nodeIndex >= 0) {
      lis.unshift(nodes[nodeIndex]!.value)
      pileIndex--
      nodeIndex--
    }
  }

  return lis
}

function mergePiles<T>(piles: T[][], compare: CompareFn<T>): T[] {
  if (piles.length === 0) return []

  const allElements: T[] = []
  for (const pile of piles) {
    for (const val of pile) {
      allElements.push(val)
    }
  }
  allElements.sort(compare)
  return allElements
}

export class PatienceSort3<T> {
  private compare: CompareFn<T>
  private currentPiles: T[][] = []


  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]

    const { piles } = buildPiles(arr, this.compare)
    this.currentPiles = piles
    return mergePiles(piles, this.compare)
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) return [...arr]

    const descendingCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    const { piles } = buildPiles(arr, descendingCompare)
    this.currentPiles = piles
    return mergePiles(piles, descendingCompare)
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  getPiles(): T[][] {
    return this.currentPiles.map((pile) => [...pile])
  }

  getLongestIncreasingSubsequence(arr: T[]): T[] {
    if (arr.length === 0) return []

    const { nodes, piles } = buildPiles(arr, this.compare)
    return extractLIS(nodes, piles)
  }

  getTimeComplexity(): string {
    return 'O(n log n)'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }

  toString(): string {
    return `PatienceSort3()`
  }
}
