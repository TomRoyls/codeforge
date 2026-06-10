export class ProMap2<K, V> {
  private store: Map<K, { value: V; expires: number | null; lastAccess: number }>;
  private maxSize: number | null;
  private ttl: number | null;
  private accessCounter: number;

  constructor(options?: { maxSize?: number; ttl?: number }) {
    this.store = new Map();
    this.maxSize = options?.maxSize ?? null;
    this.ttl = options?.ttl ?? null;
    this.accessCounter = 0;
  }

  set(key: K, value: V): this {
    const now = Date.now();
    const expires = this.ttl !== null ? now + this.ttl : null;

    if (this.store.has(key)) {
      const entry = this.store.get(key)!;
      entry.value = value;
      entry.expires = expires;
      entry.lastAccess = ++this.accessCounter;
      return this;
    }

    if (this.maxSize !== null && this.store.size >= this.maxSize) {
      let oldestKey: K | null = null;
      let oldestAccess = Infinity;

      this.store.forEach((v, k) => {
        if (v.lastAccess < oldestAccess) {
          oldestAccess = v.lastAccess;
          oldestKey = k;
        }
      });

      if (oldestKey !== null) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, { value, expires, lastAccess: ++this.accessCounter });
    return this;
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expires !== null && Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }

    entry.lastAccess = ++this.accessCounter;
    return entry.value;
  }

  has(key: K): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (entry.expires !== null && Date.now() > entry.expires) {
      this.store.delete(key);
      return false;
    }

    entry.lastAccess = ++this.accessCounter;
    return true;
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  keys(): K[] {
    const now = Date.now();
    const validKeys: K[] = [];

    this.store.forEach((v, k) => {
      if (v.expires === null || now <= v.expires) {
        validKeys.push(k);
      } else {
        this.store.delete(k);
      }
    });

    return validKeys;
  }

  values(): V[] {
    const now = Date.now();
    const validValues: V[] = [];

    this.store.forEach((v, k) => {
      if (v.expires === null || now <= v.expires) {
        validValues.push(v.value);
      } else {
        this.store.delete(k);
      }
    });

    return validValues;
  }

  entries(): [K, V][] {
    const now = Date.now();
    const validEntries: [K, V][] = [];

    this.store.forEach((v, k) => {
      if (v.expires === null || now <= v.expires) {
        validEntries.push([k, v.value]);
      } else {
        this.store.delete(k);
      }
    });

    return validEntries;
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  toArray(): any[] {
    return [...this]
  }

  toString(): string {
    return `ProMap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'ProMap2', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'ProMap2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
