export interface FileCoverage2 {
  path: string
  totalLines: number
  coveredLines: Set<number>
  uncoveredLines: Set<number>
  branches: Map<number, boolean>
  functions: Map<string, boolean>
}

export class CoverageTracker2 {
  private files: Map<string, FileCoverage2> = new Map()
  private totalCovered = 0
  private totalUncovered = 0
  private totalBranches = 0
  private coveredBranches = 0
  private totalFunctions = 0
  private coveredFunctions = 0

  trackFile(path: string, totalLines: number): FileCoverage2 {
    const fc: FileCoverage2 = {
      path, totalLines,
      coveredLines: new Set(),
      uncoveredLines: new Set(),
      branches: new Map(),
      functions: new Map(),
    }
    this.files.set(path, fc)
    return fc
  }

  markCovered(path: string, line: number): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    fc.coveredLines.add(line)
    fc.uncoveredLines.delete(line)
    return true
  }

  markUncovered(path: string, line: number): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    fc.uncoveredLines.add(line)
    fc.coveredLines.delete(line)
    return true
  }

  addBranch(path: string, branchId: number, covered = false): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    fc.branches.set(branchId, covered)
    this.totalBranches++
    if (covered) this.coveredBranches++
    return true
  }

  markBranchCovered(path: string, branchId: number): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    const wasCovered = fc.branches.get(branchId)
    fc.branches.set(branchId, true)
    if (!wasCovered) this.coveredBranches++
    return true
  }

  addFunction(path: string, name: string, covered = false): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    fc.functions.set(name, covered)
    this.totalFunctions++
    if (covered) this.coveredFunctions++
    return true
  }

  markFunctionCovered(path: string, name: string): boolean {
    const fc = this.files.get(path)
    if (!fc) return false
    const wasCovered = fc.functions.get(name)
    fc.functions.set(name, true)
    if (!wasCovered) this.coveredFunctions++
    return true
  }

  getFileCoverage(path: string): FileCoverage2 | undefined { return this.files.get(path) }

  getLineCoverage(path: string): number {
    const fc = this.files.get(path)
    if (!fc || fc.totalLines === 0) return 0
    return fc.coveredLines.size / fc.totalLines
  }

  getBranchCoverage(path: string): number {
    const fc = this.files.get(path)
    if (!fc || fc.branches.size === 0) return 0
    const covered = Array.from(fc.branches.values()).filter(Boolean).length
    return covered / fc.branches.size
  }

  getFunctionCoverage(path: string): number {
    const fc = this.files.get(path)
    if (!fc || fc.functions.size === 0) return 0
    const covered = Array.from(fc.functions.values()).filter(Boolean).length
    return covered / fc.functions.size
  }

  getOverallLineCoverage(): number {
    let total = 0
    let covered = 0
    this.files.forEach(fc => {
      total += fc.totalLines
      covered += fc.coveredLines.size
    })
    return total > 0 ? covered / total : 0
  }

  getOverallBranchCoverage(): number {
    return this.totalBranches > 0 ? this.coveredBranches / this.totalBranches : 0
  }

  getOverallFunctionCoverage(): number {
    return this.totalFunctions > 0 ? this.coveredFunctions / this.totalFunctions : 0
  }

  getUncoveredFiles(): string[] {
    return Array.from(this.files.values())
      .filter(fc => fc.coveredLines.size === 0)
      .map(fc => fc.path)
  }

  getLeastCovered(n = 10): Array<{ path: string; coverage: number }> {
    return Array.from(this.files.values())
      .map(fc => ({ path: fc.path, coverage: this.getLineCoverage(fc.path) }))
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, n)
  }

  getSummary(): {
    files: number
    lineCoverage: number
    branchCoverage: number
    functionCoverage: number
    uncoveredFiles: number
  } {
    return {
      files: this.files.size,
      lineCoverage: this.getOverallLineCoverage(),
      branchCoverage: this.getOverallBranchCoverage(),
      functionCoverage: this.getOverallFunctionCoverage(),
      uncoveredFiles: this.getUncoveredFiles().length,
    }
  }

  remove(path: string): boolean { return this.files.delete(path) }
  count(): number { return this.files.size }

  toArray(): string[] { return Array.from(this.files.keys()) }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): CoverageTracker2 {
    const ct = new CoverageTracker2()
    this.files.forEach((fc, path) => {
      ct.files.set(path, {
        ...fc,
        coveredLines: new Set(fc.coveredLines),
        uncoveredLines: new Set(fc.uncoveredLines),
        branches: new Map(fc.branches),
        functions: new Map(fc.functions),
      })
    })
    ct.totalCovered = this.totalCovered
    ct.totalUncovered = this.totalUncovered
    ct.totalBranches = this.totalBranches
    ct.coveredBranches = this.coveredBranches
    ct.totalFunctions = this.totalFunctions
    ct.coveredFunctions = this.coveredFunctions
    return ct
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CoverageTracker2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.files.clear()
    this.totalCovered = 0
    this.totalUncovered = 0
    this.totalBranches = 0
    this.coveredBranches = 0
    this.totalFunctions = 0
    this.coveredFunctions = 0
  }
}
