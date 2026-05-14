export class ProbabilityMap2 {
  private map: Map<string, number>;
  private _totalWeight: number;

  constructor() {
    this.map = new Map();
    this._totalWeight = 0;
  }

  set(key: string, weight: number): void {
    const existingWeight = this.map.get(key);
    if (existingWeight !== undefined) {
      this._totalWeight -= existingWeight;
    }
    this.map.set(key, weight);
    this._totalWeight += weight;
  }

  get(key: string): number | undefined {
    const weight = this.map.get(key);
    if (weight === undefined || this._totalWeight === 0) {
      return undefined;
    }
    return weight / this._totalWeight;
  }

  getWeight(key: string): number | undefined {
    return this.map.get(key);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  delete(key: string): boolean {
    const weight = this.map.get(key);
    if (weight === undefined) {
      return false;
    }
    this._totalWeight -= weight;
    return this.map.delete(key);
  }

  sample(): string | undefined {
    if (this.map.size === 0) {
      return undefined;
    }
    const random = Math.random() * this._totalWeight;
    let cumulative = 0;
    for (const [key, weight] of this.map) {
      cumulative += weight;
      if (random < cumulative) {
        return key;
      }
    }
    return this.map.keys().next().value;
  }

  get size(): number {
    return this.map.size;
  }

  totalWeight(): number {
    return this._totalWeight;
  }

  keys(): string[] {
    return Array.from(this.map.keys());
  }

  entries(): [string, { weight: number; probability: number }][] {
    const result: [string, { weight: number; probability: number }][] = [];
    for (const [key, weight] of this.map) {
      const probability = this._totalWeight > 0 ? weight / this._totalWeight : 0;
      result.push([key, { weight, probability }]);
    }
    return result;
  }

  clear(): void {
    this.map.clear();
    this._totalWeight = 0;
  }

  normalize(): void {
    if (this._totalWeight === 0) {
      return;
    }
    const total = this._totalWeight;
    const normalized: Map<string, number> = new Map();
    for (const [key, weight] of this.map) {
      normalized.set(key, weight / total);
    }
    this._totalWeight = 1;
    this.map = normalized;
  }
}
