export class HungarianAssignment {
  private cost: number[][] = []
  private n: number
  private m: number

  constructor(n: number, m: number) {
    this.n = n
    this.m = m
    for (let i = 0; i < n; i++) {
      this.cost.push(new Array(m).fill(0))
    }
  }

  setCost(i: number, j: number, c: number): void {
    this.cost[i]![j] = c
  }

  solve(): { assignment: (number | null)[], totalCost: number } {
    this.bestResult = { assignment: [], cost: Infinity, assigned: 0 }
    const current: (number | null)[] = new Array(this.n).fill(null)
    const used = new Array(this.m).fill(false)
    this.backtrack(current, used, 0, 0, 0)
    if (this.bestResult.cost === Infinity) {
      return { assignment: new Array(this.n).fill(null), totalCost: 0 }
    }
    return { assignment: this.bestResult.assignment, totalCost: this.bestResult.cost }
  }

  private bestResult: { assignment: (number | null)[], cost: number, assigned: number } = { assignment: [], cost: Infinity, assigned: 0 }

  private backtrack(current: (number | null)[], used: boolean[], worker: number, costSoFar: number, assigned: number): void {
    if (worker === this.n) {
      if (assigned > this.bestResult.assigned || (assigned === this.bestResult.assigned && costSoFar < this.bestResult.cost)) {
        this.bestResult = { assignment: [...current], cost: costSoFar, assigned }
      }
      return
    }
    this.backtrack(current, used, worker + 1, costSoFar, assigned)
    for (let job = 0; job < this.m; job++) {
      if (!used[job]) {
        used[job] = true
        current[worker] = job
        this.backtrack(current, used, worker + 1, costSoFar + this.cost[worker]![job]!, assigned + 1)
        used[job] = false
        current[worker] = null
      }
    }
  }

  solveGreedy(): { assignment: (number | null)[], totalCost: number } {
    const assignment: (number | null)[] = new Array(this.n).fill(null)
    const used = new Array(this.m).fill(false)
    let totalCost = 0
    const entries: [number, number, number][] = []
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.m; j++) {
        entries.push([i, j, this.cost[i]![j]!])
      }
    }
    entries.sort((a, b) => a[2] - b[2])
    const workerAssigned = new Array(this.n).fill(false)
    for (const [i, j, c] of entries) {
      if (!workerAssigned[i] && !used[j]) {
        assignment[i] = j
        used[j] = true
        workerAssigned[i] = true
        totalCost += c
      }
    }
    return { assignment, totalCost }
  }

  toString(): string {
    return `HungarianAssignment(${this.n}x${this.m})`
  }

  toJSON(): unknown {
    return { n: this.n, m: this.m, cost: this.cost }
  }

  clone(): HungarianAssignment {
    const copy = new HungarianAssignment(this.n, this.m)
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.m; j++) {
        copy.setCost(i, j, this.cost[i]![j]!)
      }
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HungarianAssignment)) return false
    if (this.n !== other.n || this.m !== other.m) return false
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.m; j++) {
        if (this.cost[i]![j] !== other.cost[i]![j]) return false
      }
    }
    return true
  }
}
