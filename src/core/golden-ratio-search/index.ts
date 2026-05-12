const PHI: number = (Math.sqrt(5) - 1) / 2;

export class GoldenRatioSearch {
  private fn: (x: number) => number;
  private tolerance: number;
  private iterations: number;

  constructor(fn: (x: number) => number, tolerance: number = 1e-8) {
    this.fn = fn;
    this.tolerance = tolerance;
    this.iterations = 0;
  }

  findMinimum(low: number, high: number): { x: number; value: number } {
    this.iterations = 0;

    while (Math.abs(high - low) > this.tolerance) {
      this.iterations++;

      const mid1 = low + (1 - PHI) * (high - low);
      const mid2 = low + PHI * (high - low);

      if (this.fn(mid1) < this.fn(mid2)) {
        high = mid2;
      } else {
        low = mid1;
      }
    }

    const x = (low + high) / 2;

    return { x, value: this.fn(x) };
  }

  findMaximum(low: number, high: number): { x: number; value: number } {
    this.iterations = 0;

    while (Math.abs(high - low) > this.tolerance) {
      this.iterations++;

      const mid1 = low + (1 - PHI) * (high - low);
      const mid2 = low + PHI * (high - low);

      if (this.fn(mid1) > this.fn(mid2)) {
        high = mid2;
      } else {
        low = mid1;
      }
    }

    const x = (low + high) / 2;

    return { x, value: this.fn(x) };
  }

  getIterations(): number {
    return this.iterations;
  }

  getTolerance(): number {
    return this.tolerance;
  }

  setTolerance(t: number): void {
    this.tolerance = t;
  }

  getTimeComplexity(): string {
    return "O(log(1/tolerance))";
  }
}
