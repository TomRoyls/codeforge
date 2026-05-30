export class BoyerMooreVote {
  static findMajority<T>(arr: T[]): T | null {
    if (arr.length === 0) return null
    let candidate = arr[0]!
    let count = 1
    for (let i = 1; i < arr.length; i++) {
      if (count === 0) {
        candidate = arr[i]!
        count = 1
      } else if (arr[i] === candidate) {
        count++
      } else {
        count--
      }
    }
    let verify = 0
    for (const item of arr) {
      if (item === candidate) verify++
    }
    return verify > arr.length / 2 ? candidate : null
  }

  static findMajorityIndex<T>(arr: T[]): number {
    if (arr.length === 0) return -1
    let candidateIdx = 0
    let count = 1
    for (let i = 1; i < arr.length; i++) {
      if (count === 0) {
        candidateIdx = i
        count = 1
      } else if (arr[i] === arr[candidateIdx]) {
        count++
      } else {
        count--
      }
    }
    let verify = 0
    for (const item of arr) {
      if (item === arr[candidateIdx]) verify++
    }
    return verify > arr.length / 2 ? candidateIdx : -1
  }

  static findAllFrequent<T>(arr: T[], k: number): T[] {
    const threshold = Math.floor(arr.length / k)
    const counts = new Map<T, number>()
    for (const item of arr) {
      counts.set(item, (counts.get(item) ?? 0) + 1)
    }
    const result: T[] = []
    for (const [item, count] of counts) {
      if (count >= threshold) result.push(item)
    }
    return result
  }
}
