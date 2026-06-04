export class TremauxMaze {
  private passages: Map<string, boolean> = new Map()
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  addPassage(from: [number, number], to: [number, number]): void {
    const key = this.passageKey(from, to)
    this.passages.set(key, true)
  }

  solve(start: [number, number], end: [number, number]): [number, number][] {
    const visited = new Map<string, number>()
    const path: [number, number][] = [start]
    const stack: { pos: [number, number], neighbors: [number, number][] }[] = []

    const getNeighbors = (pos: [number, number]): [number, number][] => {
      const [x, y] = pos
      const result: [number, number][] = []
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx!
        const ny = y + dy!
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const key = this.passageKey(pos, [nx, ny])
          if (this.passages.has(key)) {
            result.push([nx, ny])
          }
        }
      }
      return result
    }

    const posKey = (p: [number, number]): string => `${p[0]},${p[1]}`

    visited.set(posKey(start), 1)
    stack.push({ pos: start, neighbors: getNeighbors(start) })

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]!
      const { pos, neighbors } = frame

      if (pos[0] === end[0] && pos[1] === end[1]) {
        return path
      }

      let found = false
      while (neighbors.length > 0) {
        neighbors.sort((a, b) => {
          const ca = visited.get(posKey(a)) ?? 0
          const cb = visited.get(posKey(b)) ?? 0
          return cb - ca
        })
        const next = neighbors.pop()!
        const key = posKey(next)
        const visitCount = visited.get(key) ?? 0
        if (visitCount < 2) {
          visited.set(key, visitCount + 1)
          path.push(next)
          stack.push({ pos: next, neighbors: getNeighbors(next) })
          found = true
          break
        }
      }

      if (!found) {
        stack.pop()
        path.pop()
      }
    }

    return []
  }

  private passageKey(from: [number, number], to: [number, number]): string {
    const fk = `${from[0]},${from[1]}`
    const tk = `${to[0]},${to[1]}`
    return fk < tk ? `${fk}-${tk}` : `${tk}-${fk}`
  }
}
