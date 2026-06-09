type Entry<T> = { key: string; value: T } | null;

export class HashArray2<T> {
  private _capacity: number;
  private _used: number;
  private _buckets: Entry<T>[];

  constructor(size?: number) {
    this._capacity = size ?? 16;
    this._used = 0;
    this._buckets = new Array(this._capacity).fill(null);
  }

  private _hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i)) % this._capacity;
    }
    return hash;
  }

  set(key: string, value: T): boolean {
    let index = this._hash(key);
    let startIndex = index;

    while (this._buckets[index] !== null) {
      if (this._buckets[index]!.key === key) {
        this._buckets[index]!.value = value;
        return true;
      }
      index = (index + 1) % this._capacity;
      if (index === startIndex) {
        return false;
      }
    }

    this._buckets[index] = { key, value };
    this._used++;
    return true;
  }

  get(key: string): T | undefined {
    let index = this._hash(key);
    let startIndex = index;

    while (this._buckets[index] !== null) {
      if (this._buckets[index]!.key === key) {
        return this._buckets[index]!.value;
      }
      index = (index + 1) % this._capacity;
      if (index === startIndex) {
        break;
      }
    }

    return undefined;
  }

  has(key: string): boolean {
    let index = this._hash(key);
    let startIndex = index;

    while (this._buckets[index] !== null) {
      if (this._buckets[index]!.key === key) {
        return true;
      }
      index = (index + 1) % this._capacity;
      if (index === startIndex) {
        break;
      }
    }

    return false;
  }

  delete(key: string): boolean {
    let index = this._hash(key);
    let startIndex = index;

    while (this._buckets[index] !== null) {
      if (this._buckets[index]!.key === key) {
        this._buckets[index] = null;
        this._used--;
        return true;
      }
      index = (index + 1) % this._capacity;
      if (index === startIndex) {
        break;
      }
    }

    return false;
  }

  get size(): number {
    return this._used;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  get capacity(): number {
    return this._capacity;
  }

  loadFactor(): number {
    return this._used / this._capacity;
  }

  keys(): string[] {
    const result: string[] = [];
    for (const entry of this._buckets) {
      if (entry !== null) {
        result.push(entry.key);
      }
    }
    return result;
  }

  values(): T[] {
    const result: T[] = [];
    for (const entry of this._buckets) {
      if (entry !== null) {
        result.push(entry.value);
      }
    }
    return result;
  }

  entries(): [string, T][] {
    const result: [string, T][] = [];
    for (const entry of this._buckets) {
      if (entry !== null) {
        result.push([entry.key, entry.value]);
      }
    }
    return result;
  }

  clear(): void {
    this._buckets = new Array(this._capacity).fill(null);
    this._used = 0;
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }

  toArray() {
    return this.entries()
  }
}
