export class MoAlgorithm {
  static solve<T>(
    data: number[],
    queries: Array<{ l: number; r: number } | { left: number; right: number }>,
    addLeft: (state: T, idx: number) => void,
    addRight: (state: T, idx: number) => void,
    removeLeft: (state: T, idx: number) => void,
    removeRight: (state: T, idx: number) => void,
    getAnswer: (state: T) => number,
    initialState: T,
  ): number[] {
    const n = data.length
    const q = queries.length
    const blockSize = Math.max(1, Math.floor(Math.sqrt(n)))
    const getL = (i: number): number => {
      const query = queries[i]!
      return 'l' in query ? query.l : query.left
    }
    const getR = (i: number): number => {
      const query = queries[i]!
      return 'r' in query ? query.r : query.right
    }
    const order = Array.from({ length: q }, (_, i) => i)
    order.sort((a, b) => {
      const blockA = Math.floor(getL(a) / blockSize)
      const blockB = Math.floor(getL(b) / blockSize)
      if (blockA !== blockB) return blockA - blockB
      return blockA % 2 === 0
        ? getR(a) - getR(b)
        : getR(b) - getR(a)
    })
    const answers = new Array(q).fill(0)
    let curL = 0
    let curR = -1
    const state = initialState
    for (const qi of order) {
      const l = getL(qi)
      const r = getR(qi)
      while (curL > l) {
        curL--
        addLeft(state, curL)
      }
      while (curR < r) {
        curR++
        addRight(state, curR)
      }
      while (curL < l) {
        removeLeft(state, curL)
        curL++
      }
      while (curR > r) {
        removeRight(state, curR)
        curR--
      }
      answers[qi] = getAnswer(state)
    }
    return answers
  }
}
