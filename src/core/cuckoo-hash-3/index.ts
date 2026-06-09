type Entry<K, V> = { key: K; value: V } | null;

export class CuckooHash3<K, V> {
  private table1: Entry<K, V>[];
  private table2: Entry<K, V>[];
  private capacity: number;
  private _size: number;
  private maxKicks: number = 500;

  constructor(initialCapacity: number = 16) {
    this.capacity = this.nextPowerOfTwo(initialCapacity);
    this.table1 = new Array(this.capacity).fill(null);
    this.table2 = new Array(this.capacity).fill(null);
    this._size = 0;
  }

  private nextPowerOfTwo(n: number): number {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
  }

  private hash1(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hash = Math.imul(hash, 31) + charCode;
      hash = hash ^ (hash >>> 16);
    }
    return ((hash % this.capacity) + this.capacity) % this.capacity;
  }

  private hash2(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      const charCode = str.charCodeAt(i);
      hash = Math.imul(hash, 37) + charCode;
      hash = hash ^ (hash >>> 16);
    }
    hash = hash ^ 0x9e3779b9;
    hash = hash ^ (hash >>> 16);
    return ((hash % this.capacity) + this.capacity) % this.capacity;
  }

  set(key: K, value: V): boolean {
    const idx1 = this.hash1(key);
    const idx2 = this.hash2(key);

    if (this.table1[idx1] === null || this.table1[idx1]!.key === key) {
      if (this.table1[idx1] === null) this._size++;
      this.table1[idx1] = { key, value };
      return true;
    }

    if (this.table2[idx2] === null || this.table2[idx2]!.key === key) {
      if (this.table2[idx2] === null) this._size++;
      this.table2[idx2] = { key, value };
      return true;
    }

    let currentKey = key;
    let currentValue = value;
    let currentTable = Math.random() < 0.5 ? 1 : 2;

    for (let kick = 0; kick < this.maxKicks; kick++) {
      if (currentTable === 1) {
        const idx = this.hash1(currentKey);
        const displaced = this.table1[idx]!;
        this.table1[idx] = { key: currentKey, value: currentValue };
        if (displaced === null) {
          this._size++;
          return true;
        }
        currentKey = displaced.key;
        currentValue = displaced.value;
        currentTable = 2;
      } else {
        const idx = this.hash2(currentKey);
        const displaced = this.table2[idx]!;
        this.table2[idx] = { key: currentKey, value: currentValue };
        if (displaced === null) {
          this._size++;
          return true;
        }
        currentKey = displaced.key;
        currentValue = displaced.value;
        currentTable = 1;
      }
    }

    return this.resizeAndInsert(key, value);
  }

  private resizeAndInsert(key: K, value: V): boolean {
    const oldTable1 = this.table1;
    const oldTable2 = this.table2;

    const entries: { key: K; value: V }[] = [];

    for (let i = 0; i < oldTable1.length; i++) {
      if (oldTable1[i] !== null) {
        entries.push(oldTable1[i]!);
      }
    }

    for (let i = 0; i < oldTable2.length; i++) {
      if (oldTable2[i] !== null) {
        entries.push(oldTable2[i]!);
      }
    }

    entries.push({ key, value });

    let capacity = this.capacity * 8;
    let success = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!success && attempts < maxAttempts) {
      this.capacity = capacity;
      this.table1 = new Array(this.capacity).fill(null);
      this.table2 = new Array(this.capacity).fill(null);
      this._size = 0;

      let allInserted = true;
      for (const entry of entries) {
        const inserted = this.tryInsert(entry.key, entry.value);
        if (inserted) {
          this._size++;
        } else {
          allInserted = false;
          break;
        }
      }

      if (allInserted) {
        success = true;
      } else {
        capacity *= 2;
        attempts++;
      }
    }

    return success;
  }

  private tryInsert(key: K, value: V): boolean {
    const idx1 = this.hash1(key);
    const idx2 = this.hash2(key);

    if (this.table1[idx1] === null || this.table1[idx1]!.key === key) {
      this.table1[idx1] = { key, value };
      return true;
    }

    if (this.table2[idx2] === null || this.table2[idx2]!.key === key) {
      this.table2[idx2] = { key, value };
      return true;
    }

    let currentKey = key;
    let currentValue = value;
    let currentTable = Math.random() < 0.5 ? 1 : 2;

    for (let kick = 0; kick < this.maxKicks; kick++) {
      if (currentTable === 1) {
        const idx = this.hash1(currentKey);
        const displaced = this.table1[idx]!;
        this.table1[idx] = { key: currentKey, value: currentValue };
        if (displaced === null) {
          return true;
        }
        currentKey = displaced.key;
        currentValue = displaced.value;
        currentTable = 2;
      } else {
        const idx = this.hash2(currentKey);
        const displaced = this.table2[idx]!;
        this.table2[idx] = { key: currentKey, value: currentValue };
        if (displaced === null) {
          return true;
        }
        currentKey = displaced.key;
        currentValue = displaced.value;
        currentTable = 1;
      }
    }

    return false;
  }

  get(key: K): V | undefined {
    const idx1 = this.hash1(key);
    const idx2 = this.hash2(key);

    if (this.table1[idx1] !== null && this.table1[idx1]!.key === key) {
      return this.table1[idx1]!.value;
    }

    if (this.table2[idx2] !== null && this.table2[idx2]!.key === key) {
      return this.table2[idx2]!.value;
    }

    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const idx1 = this.hash1(key);
    const idx2 = this.hash2(key);

    if (this.table1[idx1] !== null && this.table1[idx1]!.key === key) {
      this.table1[idx1] = null;
      this._size--;
      return true;
    }

    if (this.table2[idx2] !== null && this.table2[idx2]!.key === key) {
      this.table2[idx2] = null;
      this._size--;
      return true;
    }

    return false;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.table1.fill(null);
    this.table2.fill(null);
    this._size = 0;
  }

  loadFactor(): number {
    return this._size / (this.capacity * 2);
  }
}
