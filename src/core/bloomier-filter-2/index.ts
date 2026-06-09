export class BloomierFilter2 {
  private table!: Map<number, number>[];
  private entryCount: number;
  private readonly tableSize: number;
  private readonly hashFunctions: number;
  private keys: Set<string>;

  constructor(size: number, hashFunctions: number = 3) {
    this.tableSize = size;
    this.hashFunctions = hashFunctions;
    this.entryCount = 0;
    this.keys = new Set<string>();
    this.table = [];
    for (let i = 0; i < size; i++) {
      this.table[i] = new Map<number, number>();
    }
  }

  set(key: string, value: number): void {
    const hashValues = this.getHashValues(key);
    for (let i = 0; i < hashValues.length; i++) {
      this.table[hashValues[i]!]!.set(i, value);
    }
    if (!this.keys.has(key)) {
      this.entryCount++;
      this.keys.add(key);
    }
  }

  get(key: string): number | undefined {
    const hashValues = this.getHashValues(key);
    let firstValue: number | undefined;
    for (let i = 0; i < hashValues.length; i++) {
      const value = this.table[hashValues[i]!]!.get(i);
      if (value !== undefined) {
        if (firstValue === undefined) {
          firstValue = value;
        } else if (firstValue !== value) {
          return undefined;
        }
      }
    }
    return firstValue;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    if (!this.keys.has(key)) {
      return false;
    }
    const hashValues = this.getHashValues(key);
    for (let i = 0; i < hashValues.length; i++) {
      this.table[hashValues[i]!]!.delete(i);
    }
    this.entryCount--;
    this.keys.delete(key);
    return true;
  }

  get size(): number {
    return this.entryCount;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  loadFactor(): number {
    return this.entryCount / this.tableSize;
  }

  clear(): void {
    for (let i = 0; i < this.tableSize; i++) {
      this.table[i]!.clear();
    }
    this.entryCount = 0;
    this.keys.clear();
  }

  private getHashValues(key: string): number[] {
    const values: number[] = [];
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const baseHash = (hash >>> 0);
    for (let i = 0; i < this.hashFunctions; i++) {
      const hashValue = (baseHash * (i + 1) * 31) % this.tableSize;
      values.push(hashValue);
    }
    return values;
  }

  toString(): string {
    return `${BloomierFilter2}({ size: ${this.size} })`
  }
}
