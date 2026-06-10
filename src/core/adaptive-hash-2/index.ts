export class AdaptiveHash2<K, V> {
  private mode: 'open-addressing' | 'chaining';
  private oaBuckets: Array<[K, V] | null>;
  private chBuckets: Array<[K, V][] | null>;
  private _size: number;
  private initialCapacity: number;
  private loadFactorThreshold: number;
  private collisionThreshold: number;
  private totalCollisions: number;

  constructor(initialCapacity: number = 16, loadFactorThreshold: number = 0.75, collisionThreshold: number = 3) {
    this.mode = 'open-addressing';
    this.oaBuckets = new Array(Math.max(1, initialCapacity)).fill(null);
    this.chBuckets = [];
    this._size = 0;
    this.initialCapacity = Math.max(1, initialCapacity);
    this.loadFactorThreshold = loadFactorThreshold;
    this.collisionThreshold = collisionThreshold;
    this.totalCollisions = 0;
  }

  private hash(key: K, capacity: number): number {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return (h >>> 0) % capacity;
  }

  private currentCapacity(): number {
    return this.mode === 'open-addressing' ? this.oaBuckets.length : this.chBuckets.length;
  }

  set(key: K, value: V): void {
    if (this.mode === 'open-addressing') {
      this.setOA(key, value);
    } else {
      this.setCH(key, value);
    }
    this.checkResize();
  }

  private setOA(key: K, value: V): void {
    const cap = this.oaBuckets.length;
    const index = this.hash(key, cap);
    let ci = index;

    while (this.oaBuckets[ci] !== null) {
      const entry = this.oaBuckets[ci]!;
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
      this.totalCollisions++;
      ci = (ci + 1) % cap;
      if (ci === index) {
        this.resizeOA();
        this.setOA(key, value);
        return;
      }
    }

    this.oaBuckets[ci] = [key, value];
    this._size++;
  }

  private setCH(key: K, value: V): void {
    const cap = this.chBuckets.length;
    const index = this.hash(key, cap);
    const bucket = this.chBuckets[index]!;
    if (bucket === null) {
      this.chBuckets[index] = [[key, value]];
      this._size++;
      return;
    }
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]![0] === key) {
        bucket[i]![1] = value;
        return;
      }
    }
    bucket.push([key, value]);
    this._size++;
  }

  get(key: K): V | undefined {
    if (this.mode === 'open-addressing') {
      return this.getOA(key);
    }
    return this.getCH(key);
  }

  private getOA(key: K): V | undefined {
    const cap = this.oaBuckets.length;
    const index = this.hash(key, cap);
    let ci = index;

    while (this.oaBuckets[ci] !== null) {
      const entry = this.oaBuckets[ci]!;
      if (entry[0] === key) {
        return entry[1];
      }
      ci = (ci + 1) % cap;
      if (ci === index) break;
    }
    return undefined;
  }

  private getCH(key: K): V | undefined {
    const cap = this.chBuckets.length;
    const index = this.hash(key, cap);
    const bucket = this.chBuckets[index]!;
    if (bucket === null) return undefined;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]![0] === key) {
        return bucket[i]![1];
      }
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    if (this.mode === 'open-addressing') {
      return this.deleteOA(key);
    }
    return this.deleteCH(key);
  }

  private deleteOA(key: K): boolean {
    const cap = this.oaBuckets.length;
    const index = this.hash(key, cap);
    let ci = index;

    while (this.oaBuckets[ci] !== null) {
      const entry = this.oaBuckets[ci]!;
      if (entry[0] === key) {
        this.oaBuckets[ci] = null;
        this._size--;
        this.rehashOA();
        return true;
      }
      ci = (ci + 1) % cap;
      if (ci === index) break;
    }
    return false;
  }

  private deleteCH(key: K): boolean {
    const cap = this.chBuckets.length;
    const index = this.hash(key, cap);
    const bucket = this.chBuckets[index]!;
    if (bucket === null) return false;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]![0] === key) {
        bucket.splice(i, 1);
        this._size--;
        if (bucket.length === 0) {
          this.chBuckets[index] = null;
        }
        return true;
      }
    }
    return false;
  }

  size(): number {
    return this._size;
  }

  clear(): void {
    this.mode = 'open-addressing';
    this.oaBuckets = new Array(this.initialCapacity).fill(null);
    this.chBuckets = [];
    this._size = 0;
    this.totalCollisions = 0;
  }

  strategy(): 'open-addressing' | 'chaining' {
    return this.mode;
  }

  capacity(): number {
    return this.currentCapacity();
  }

  private checkResize(): void {
    const cap = this.currentCapacity();
    const loadFactor = this._size / cap;
    if (this.mode === 'open-addressing') {
      if (this.totalCollisions > this.collisionThreshold) {
        this.convertToChaining();
        return;
      }
      if (loadFactor > this.loadFactorThreshold) {
        this.resizeOA();
      }
    } else {
      if (loadFactor > this.loadFactorThreshold) {
        this.resizeCH();
      }
    }
  }

  private resizeOA(): void {
    const oldBuckets = this.oaBuckets;
    const newCap = oldBuckets.length * 2;
    this.oaBuckets = new Array(newCap).fill(null);
    this._size = 0;
    for (const bucket of oldBuckets) {
      if (bucket !== null) {
        this.setOA(bucket[0], bucket[1]);
      }
    }
  }

  private resizeCH(): void {
    const oldBuckets = this.chBuckets;
    const newCap = oldBuckets.length * 2;
    this.chBuckets = new Array(newCap).fill(null);
    this._size = 0;
    for (const bucket of oldBuckets) {
      if (bucket !== null) {
        for (const [k, v] of bucket) {
          this.setCH(k, v);
        }
      }
    }
  }

  private convertToChaining(): void {
    const oldBuckets = this.oaBuckets;
    this.chBuckets = new Array(oldBuckets.length).fill(null);
    this._size = 0;
    for (const bucket of oldBuckets) {
      if (bucket !== null) {
        this.setCH(bucket[0], bucket[1]);
      }
    }
    this.mode = 'chaining';
    this.totalCollisions = 0;
  }

  private rehashOA(): void {
    const oldBuckets = this.oaBuckets;
    this.oaBuckets = new Array(oldBuckets.length).fill(null);
    this._size = 0;
    for (const bucket of oldBuckets) {
      if (bucket !== null) {
        this.setOA(bucket[0], bucket[1]);
      }
    }
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    if (this.mode === 'open-addressing') {
      for (const entry of this.oaBuckets) {
        if (entry !== null) {
          result.push(entry)
        }
      }
    } else {
      for (const bucket of this.chBuckets) {
        if (bucket !== null) {
          for (const entry of bucket) {
            result.push(entry)
          }
        }
      }
    }
    return result
  }

  keys(): K[] {
    return this.entries().map(e => e[0])
  }

  values(): V[] {
    return this.entries().map(e => e[1])
  }

  forEach(callback: (entry: [K, V], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  *[Symbol.iterator]() {
    yield* this.entries()
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${AdaptiveHash2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AdaptiveHash2', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'AdaptiveHash2'
  }
}
