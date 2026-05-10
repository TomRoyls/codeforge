import {
  type GrowOnlySetOptions,
  type GrowOnlySetStatistics,
  DEFAULT_GROW_ONLY_SET_OPTIONS,
} from "./types.js";

export class GrowOnlySet<T> {
  private _elements: Set<T>;
  private _id: string | undefined;
  private _adds: number;
  private _merges: number;

  constructor(options?: GrowOnlySetOptions) {
    const opts = options ?? DEFAULT_GROW_ONLY_SET_OPTIONS;
    this._id = opts.id;
    this._elements = new Set<T>();
    this._adds = 0;
    this._merges = 0;
  }

  add(value: T): void {
    if (!this._elements.has(value)) {
      this._elements.add(value);
    }
    this._adds++;
  }

  has(value: T): boolean {
    return this._elements.has(value);
  }

  get size(): number {
    return this._elements.size;
  }

  isEmpty(): boolean {
    return this._elements.size === 0;
  }

  clear(): void {
    this._elements.clear();
  }

  *values(): IterableIterator<T> {
    yield* this._elements;
  }

  toArray(): T[] {
    return Array.from(this._elements);
  }

  forEach(callback: (value: T, value2: T, set: Set<T>) => void): void {
    this._elements.forEach(callback);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._elements[Symbol.iterator]();
  }

  merge(other: GrowOnlySet<T>): GrowOnlySet<T> {
    const result = new GrowOnlySet<T>({ id: this._id });
    for (const elem of this._elements) {
      result._elements.add(elem);
    }
    for (const elem of other._elements) {
      result._elements.add(elem);
    }
    result._adds = this._adds + other._adds;
    result._merges = this._merges + other._merges + 1;
    return result;
  }

  equals(other: GrowOnlySet<T>): boolean {
    if (this._elements.size !== other._elements.size) {
      return false;
    }
    for (const elem of this._elements) {
      if (!other._elements.has(elem)) {
        return false;
      }
    }
    return true;
  }

  isSubsetOf(other: GrowOnlySet<T>): boolean {
    for (const elem of this._elements) {
      if (!other._elements.has(elem)) {
        return false;
      }
    }
    return true;
  }

  isSupersetOf(other: GrowOnlySet<T>): boolean {
    return other.isSubsetOf(this);
  }

  union(other: GrowOnlySet<T>): GrowOnlySet<T> {
    return this.merge(other);
  }

  intersection(other: GrowOnlySet<T>): GrowOnlySet<T> {
    const result = new GrowOnlySet<T>({ id: this._id });
    for (const elem of this._elements) {
      if (other._elements.has(elem)) {
        result._elements.add(elem);
      }
    }
    return result;
  }

  difference(other: GrowOnlySet<T>): GrowOnlySet<T> {
    const result = new GrowOnlySet<T>({ id: this._id });
    for (const elem of this._elements) {
      if (!other._elements.has(elem)) {
        result._elements.add(elem);
      }
    }
    return result;
  }

  clone(): GrowOnlySet<T> {
    const result = new GrowOnlySet<T>({ id: this._id });
    for (const elem of this._elements) {
      result._elements.add(elem);
    }
    result._adds = this._adds;
    result._merges = this._merges;
    return result;
  }

  getStatistics(): GrowOnlySetStatistics {
    return {
      adds: this._adds,
      merges: this._merges,
      size: this._elements.size,
    };
  }

  getId(): string | undefined {
    return this._id;
  }
}
