export class StochasticMatrix2 {
  private states: string[];
  private transitions: Map<string, Map<string, number>>;

  constructor(states: string[]) {
    this.states = [...states];
    this.transitions = new Map();
    for (const state of this.states) {
      this.transitions.set(state, new Map());
    }
  }

  setTransition(from: string, to: string, probability: number): void {
    if (!this.states.includes(from)) {
      throw new Error(`Unknown state: ${from}`);
    }
    if (!this.states.includes(to)) {
      throw new Error(`Unknown state: ${to}`);
    }
    if (probability < 0) {
      throw new Error(`Probability must be non-negative, got ${probability}`);
    }
    const row = this.transitions.get(from);
    if (row) {
      row.set(to, probability);
    }
  }

  getTransition(from: string, to: string): number {
    if (!this.states.includes(from)) {
      throw new Error(`Unknown state: ${from}`);
    }
    if (!this.states.includes(to)) {
      throw new Error(`Unknown state: ${to}`);
    }
    const row = this.transitions.get(from);
    return row?.get(to) ?? 0;
  }

  getTransitionsFrom(from: string): Map<string, number> {
    if (!this.states.includes(from)) {
      throw new Error(`Unknown state: ${from}`);
    }
    return new Map(this.transitions.get(from) ?? new Map());
  }

  getStates(): string[] {
    return [...this.states];
  }

  stateCount(): number {
    return this.states.length;
  }

  isRowStochastic(): boolean {
    const epsilon = 1e-9;
    for (const state of this.states) {
      const row = this.transitions.get(state);
      if (row) {
        let sum = 0;
        for (const v of row.values()) sum += v;
        if (Math.abs(sum - 1) > epsilon) {
          return false;
        }
      }
    }
    return true;
  }

  isColumnStochastic(): boolean {
    const epsilon = 1e-10;
    for (let j = 0; j < this.states.length; j++) {
      const toState = this.states[j]!;
      let sum = 0;
      for (const fromState of this.states) {
        sum += this.getTransition(fromState, toState);
      }
      if (Math.abs(sum - 1) > epsilon) {
        return false;
      }
    }
    return true;
  }

  isDoublyStochastic(): boolean {
    return this.isRowStochastic() && this.isColumnStochastic();
  }

  normalize(): void {
    for (const from of this.states) {
      const row = this.transitions.get(from);
      if (row) {
        let sum = 0;
        for (const v of row.values()) sum += v;
        if (sum > 0) {
          for (const [to, prob] of row.entries()) {
            row.set(to, prob / sum);
          }
        }
      }
    }
  }

  multiply(other: StochasticMatrix2): StochasticMatrix2 {
    if (this.states.length !== other.states.length) {
      throw new Error('Matrices must have same dimensions');
    }
    const result = new StochasticMatrix2(this.states);
    for (const fromI of this.states) {
      for (const toJ of this.states) {
        let sum = 0;
        for (const k of this.states) {
          sum += this.getTransition(fromI, k) * other.getTransition(k, toJ);
        }
        result.setTransition(fromI, toJ, sum);
      }
    }
    return result;
  }

  power(n: number): StochasticMatrix2 {
    if (n < 0) {
      throw new Error('Power must be non-negative');
    }
    if (n === 0) {
      const identity = new StochasticMatrix2(this.states);
      for (const state of this.states) {
        identity.setTransition(state, state, 1);
      }
      return identity;
    }
    if (n === 1) {
      const copy = new StochasticMatrix2(this.states);
      for (const from of this.states) {
        for (const to of this.states) {
          copy.setTransition(from, to, this.getTransition(from, to));
        }
      }
      return copy;
    }
    let result: StochasticMatrix2 = this;
    for (let i = 1; i < n; i++) {
      result = result.multiply(this);
    }
    return result;
  }

  stationaryDistribution(): Map<string, number> {
    if (!this.isRowStochastic()) {
      throw new Error('Matrix must be row stochastic');
    }

    const epsilon = 1e-10;
    let distribution = new Map<string, number>();
    const uniform = 1 / this.states.length;
    for (const state of this.states) {
      distribution.set(state, uniform);
    }

    for (let iter = 0; iter < 10000; iter++) {
      const newDistribution = new Map<string, number>();
      for (const toState of this.states) {
        let prob = 0;
        for (const fromState of this.states) {
          prob += (distribution.get(fromState) ?? 0) * this.getTransition(fromState, toState);
        }
        newDistribution.set(toState, prob);
      }

      let maxDiff = 0;
      for (const state of this.states) {
        const diff = Math.abs((newDistribution.get(state) ?? 0) - (distribution.get(state) ?? 0));
        if (diff > maxDiff) {
          maxDiff = diff;
        }
      }

      distribution = newDistribution;

      if (maxDiff < epsilon) {
        break;
      }
    }

    let sum = 0;
    for (const v of distribution.values()) sum += v;
    for (const state of this.states) {
      distribution.set(state, (distribution.get(state) ?? 0) / sum);
    }

    return distribution;
  }
}
