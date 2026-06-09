export class QuotientMap2<T> {
  private parent: Map<string, string>;
  private rank: Map<string, number>;
  private data: Map<string, T>;
  private equivalenceFn: (a: string, b: string) => boolean;

  constructor(equivalenceFn: (a: string, b: string) => boolean) {
    this.parent = new Map();
    this.rank = new Map();
    this.data = new Map();
    this.equivalenceFn = equivalenceFn;
  }

  private find(key: string): string {
    if (!this.parent.has(key)) {
      this.parent.set(key, key);
      this.rank.set(key, 0);
      return key;
    }

    let current = key;
    const path: string[] = [];

    while (this.parent.get(current) !== current) {
      path.push(current);
      current = this.parent.get(current) as string;
    }

    const root = current;
    for (const node of path) {
      this.parent.set(node, root);
    }

    return root;
  }

  set(key: string, value: T): void {
    this.data.set(key, value);

    if (!this.parent.has(key)) {
      this.parent.set(key, key);
      this.rank.set(key, 0);
    }

    const existingKeys = Array.from(this.data.keys());
    for (const existingKey of existingKeys) {
      if (existingKey !== key && this.equivalenceFn(key, existingKey)) {
        this.union(key, existingKey);
      }
    }
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    const existed = this.data.delete(key);
    return existed;
  }

  private union(key1: string, key2: string): void {
    const root1 = this.find(key1);
    const root2 = this.find(key2);

    if (root1 === root2) {
      return;
    }

    const rank1 = this.rank.get(root1) as number;
    const rank2 = this.rank.get(root2) as number;

    if (rank1 < rank2) {
      this.parent.set(root1, root2);
    } else if (rank1 > rank2) {
      this.parent.set(root2, root1);
    } else {
      this.parent.set(root2, root1);
      this.rank.set(root1, rank1 + 1);
    }
  }

  getEquivalenceClass(key: string): string[] {
    if (!this.data.has(key)) {
      return [];
    }

    const root = this.find(key);
    const result: string[] = [];
    const keys = Array.from(this.data.keys());

    for (const k of keys) {
      if (this.find(k) === root) {
        result.push(k);
      }
    }

    return result;
  }

  getClassRepresentative(key: string): string | undefined {
    if (!this.data.has(key)) {
      return undefined;
    }

    return this.find(key);
  }

  mergeClasses(key1: string, key2: string): void {
    if (!this.data.has(key1) || !this.data.has(key2)) {
      return;
    }

    this.union(key1, key2);
  }

  classCount(): number {
    const roots = new Set<string>();
    const keys = Array.from(this.data.keys());

    for (const key of keys) {
      roots.add(this.find(key));
    }

    return roots.size;
  }

  get size(): number {
    return this.data.size;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.parent.clear();
    this.rank.clear();
    this.data.clear();
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  values(): T[] {
    return Array.from(this.data.values());
  }

  entries(): [string, T][] {
    return Array.from(this.data.entries());
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }

  forEach(callback: (entry: [string, T], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `QuotientMap2({ size: ${this.size} })`
  }
}
