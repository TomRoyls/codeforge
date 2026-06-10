export class RobinHoodHash2<K, V> {
  private entries: Array<{key: K, value: V} | null>;
  private _size: number;
  private _loadFactorThreshold: number;
  private _maxProbeLength: number;

  constructor(initialCapacity = 16, loadFactorThreshold = 0.75) {
    const capacity = Math.max(1, Math.pow(2, Math.ceil(Math.log2(Math.max(1, initialCapacity)))));
    this.entries = new Array(capacity).fill(null);
    this._size = 0;
    this._loadFactorThreshold = loadFactorThreshold;
    this._maxProbeLength = 0;
  }

  private hash(key: K): number {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return (hash >>> 0);
  }

  private getIndex(hash: number): number {
    return ((hash % this.entries.length) + this.entries.length) % this.entries.length;
  }

  set(key: K, value: V): void {
    if (this._size / this.entries.length >= this._loadFactorThreshold) {
      this.resize();
    }

    const hash = this.hash(key);
    let index = this.getIndex(hash);

    for (let i = 0; i < this.entries.length; i++) {
      const currentIdx = (index + i) % this.entries.length;
      const entry = this.entries[currentIdx]!;

      if (entry === null) {
        this.entries[currentIdx] = {key, value};
        this._size++;
        if (i > this._maxProbeLength) {
          this._maxProbeLength = i;
        }
        return;
      }

      if (entry.key === key) {
        entry.value = value;
        return;
      }
    }

    this.resize();
    this.set(key, value);
  }

  get(key: K): V | undefined {
    const hash = this.hash(key);
    let index = this.getIndex(hash);

    for (let i = 0; i < this.entries.length; i++) {
      const currentIdx = (index + i) % this.entries.length;
      const entry = this.entries[currentIdx]!;

      if (entry === null) {
        break;
      }

      if (entry.key === key) {
        if (i > this._maxProbeLength) {
          this._maxProbeLength = i;
        }
        return entry.value;
      }
    }

    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const hash = this.hash(key);
    let index = this.getIndex(hash);

    for (let i = 0; i < this.entries.length; i++) {
      const currentIdx = (index + i) % this.entries.length;
      const entry = this.entries[currentIdx]!;

      if (entry === null) {
        break;
      }

      if (entry.key === key) {
        this.entries[currentIdx] = null;
        this._size--;
        this._shiftBack(currentIdx);
        return true;
      }
    }

    return false;
  }

  private _shiftBack(hole: number): void {
    const cap = this.entries.length;
    let i = (hole + 1) % cap;
    while (this.entries[i] !== null) {
      const entry = this.entries[i]!;
      const preferred = this.getIndex(this.hash(entry.key));
      const currentDist = (i - preferred + cap) % cap;
      const holeDist = (hole - preferred + cap) % cap;

      if (holeDist < currentDist) {
        this.entries[hole] = entry;
        this.entries[i] = null;
        hole = i;
      }
      i = (i + 1) % cap;
    }
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this.entries.length; i++) {
      this.entries[i] = null;
    }
    this._size = 0;
    this._maxProbeLength = 0;
  }

  capacity(): number {
    return this.entries.length;
  }

  maxProbeLength(): number {
    return this._maxProbeLength;
  }

  private resize(): void {
    const oldEntries = this.entries;
    const newCapacity = oldEntries.length * 2;
    this.entries = new Array(newCapacity).fill(null);
    this._size = 0;
    this._maxProbeLength = 0;

    for (let i = 0; i < oldEntries.length; i++) {
      const entry = oldEntries[i]!;
      if (entry !== null) {
        this.set(entry.key, entry.value);
      }
    }
  }



  toEntryArray(): [K, V][] {
    const result: [K, V][] = []
    for (const entry of this.entries) {
      if (entry !== null) {
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  keyArray(): K[] {
    const result: K[] = []
    for (const entry of this.entries) {
      if (entry !== null) {
        result.push(entry.key)
      }
    }
    return result
  }

  valueArray(): V[] {
    const result: V[] = []
    for (const entry of this.entries) {
      if (entry !== null) {
        result.push(entry.value)
      }
    }
    return result
  }

  toString(): string {
    return `RobinHoodHash2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'RobinHoodHash2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
