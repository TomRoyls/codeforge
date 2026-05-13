export class RobinHoodHash2<K, V> {
  private entries: Array<{key: K, value: V} | null>;
  private _size: number;
  private _loadFactorThreshold: number;
  private _maxProbeLength: number;

  constructor(initialCapacity = 16, loadFactorThreshold = 0.75) {
    const capacity = Math.pow(2, Math.ceil(Math.log2(initialCapacity)));
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
    return Math.abs(hash);
  }

  private getIndex(hash: number): number {
    return hash % this.entries.length;
  }

  set(key: K, value: V): void {
    if (this._size / this.entries.length > this._loadFactorThreshold) {
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
        return true;
      }
    }

    return false;
  }

  get size(): number {
    return this._size;
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
}
