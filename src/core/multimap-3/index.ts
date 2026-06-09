export class MultiMap3<K, V> {
  private map: Map<K, V[]>;
  private _size: number;

  constructor() {
    this.map = new Map();
    this._size = 0;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.get(key)!.push(value);
    } else {
      this.map.set(key, [value]);
    }
    this._size++;
  }

  get(key: K): V[] {
    return this.map.get(key) ?? [];
  }

  delete(key: K, value?: V): boolean {
    const values = this.map.get(key);
    if (!values) {
      return false;
    }

    if (value === undefined) {
      this._size -= values.length;
      this.map.delete(key);
      return true;
    }

    const index = values.indexOf(value);
    if (index === -1) {
      return false;
    }

    values.splice(index, 1);
    this._size--;

    if (values.length === 0) {
      this.map.delete(key);
    }

    return true;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  hasEntry(key: K, value: V): boolean {
    const values = this.map.get(key);
    return values ? values.includes(value) : false;
  }

  keys(): K[] {
    return Array.from(this.map.keys());
  }

  values(): V[] {
    const allValues: V[] = [];
    for (const values of Array.from(this.map.values())) {
      allValues.push(...values);
    }
    return allValues;
  }

  entries(): Array<[K, V[]]> {
    return Array.from(this.map.entries());
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.map.clear();
    this._size = 0;
  }

  count(key: K): number {
    const values = this.map.get(key);
    return values ? values.length : 0;
  }

  [Symbol.iterator](): Iterator<[K, V[]]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V[]]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V[]], done: true };
      },
    };
  }
}
