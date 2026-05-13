export class AdaptiveHash2<K, V> {
  private mode: 'open-addressing' | 'chaining';
  private buckets: Array<[K, V] | [K, V][] | null>;
  private _size: number;
  private initialCapacity: number;
  private loadFactorThreshold: number;
  private collisionThreshold: number;
  private totalCollisions: number;

  constructor(initialCapacity: number = 16, loadFactorThreshold: number = 0.75, collisionThreshold: number = 3) {
    this.mode = 'open-addressing';
    this.buckets = new Array(initialCapacity).fill(null);
    this._size = 0;
    this.initialCapacity = initialCapacity;
    this.loadFactorThreshold = loadFactorThreshold;
    this.collisionThreshold = collisionThreshold;
    this.totalCollisions = 0;
  }

  private hash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % this.buckets.length;
  }

  set(key: K, value: V): void {
    if (this.mode === 'open-addressing') {
      this.setOpenAddressing(key, value);
    } else {
      this.setChaining(key, value);
    }
    this.checkResize();
  }

  private setOpenAddressing(key: K, value: V): void {
    const index = this.hash(key);
    let currentIndex = index;
    let collisionCount = 0;

    while (this.buckets![currentIndex] !== null) {
      if (Array.isArray(this.buckets![currentIndex])) {
        this.convertToChaining();
        this.setChaining(key, value);
        return;
      }
      const entry = this.buckets![currentIndex] as [K, V];
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
      collisionCount++;
      this.totalCollisions++;
      currentIndex = (currentIndex + 1) % this.buckets.length;
      if (currentIndex === index) {
        this.resize();
        this.setOpenAddressing(key, value);
        return;
      }
    }

    this.buckets![currentIndex] = [key, value];
    this._size++;
  }

  private setChaining(key: K, value: V): void {
    const index = this.hash(key);
    if (this.buckets![index] === null) {
      this.buckets![index] = [[key, value]];
      this._size++;
      return;
    }

    const chain = this.buckets![index] as [K, V][];
    for (let i = 0; i < chain.length; i++) {
      if (chain[i]![0] === key) {
        chain[i]![1] = value;
        return;
      }
    }
    chain.push([key, value]);
    this._size++;
  }

  get(key: K): V | undefined {
    if (this.mode === 'open-addressing') {
      return this.getOpenAddressing(key);
    }
    return this.getChaining(key);
  }

  private getOpenAddressing(key: K): V | undefined {
    const index = this.hash(key);
    let currentIndex = index;

    while (this.buckets![currentIndex] !== null) {
      if (Array.isArray(this.buckets![currentIndex])) {
        return this.getChaining(key);
      }
      const entry = this.buckets![currentIndex] as [K, V];
      if (entry[0] === key) {
        return entry[1];
      }
      currentIndex = (currentIndex + 1) % this.buckets.length;
      if (currentIndex === index) {
        break;
      }
    }
    return undefined;
  }

  private getChaining(key: K): V | undefined {
    const index = this.hash(key);
    const chain = this.buckets![index] as [K, V][] | null;
    if (chain === null) {
      return undefined;
    }
    for (let i = 0; i < chain.length; i++) {
      if (chain[i]![0] === key) {
        return chain[i]![1];
      }
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    if (this.mode === 'open-addressing') {
      return this.deleteOpenAddressing(key);
    }
    return this.deleteChaining(key);
  }

  private deleteOpenAddressing(key: K): boolean {
    const index = this.hash(key);
    let currentIndex = index;

    while (this.buckets![currentIndex] !== null) {
      if (Array.isArray(this.buckets![currentIndex])) {
        return this.deleteChaining(key);
      }
      const entry = this.buckets![currentIndex] as [K, V];
      if (entry[0] === key) {
        this.buckets![currentIndex] = null;
        this._size--;
        this.rehash();
        return true;
      }
      currentIndex = (currentIndex + 1) % this.buckets.length;
      if (currentIndex === index) {
        break;
      }
    }
    return false;
  }

  private deleteChaining(key: K): boolean {
    const index = this.hash(key);
    const chain = this.buckets![index] as [K, V][] | null;
    if (chain === null) {
      return false;
    }
    for (let i = 0; i < chain.length; i++) {
      if (chain[i]![0] === key) {
        chain.splice(i, 1);
        this._size--;
        if (chain.length === 0) {
          this.buckets![index] = null;
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
    this.buckets = new Array(this.initialCapacity).fill(null);
    this._size = 0;
    this.totalCollisions = 0;
  }

  strategy(): 'open-addressing' | 'chaining' {
    return this.mode;
  }

  capacity(): number {
    return this.buckets.length;
  }

  private checkResize(): void {
    const loadFactor = this._size / this.buckets.length;
    if (loadFactor > this.loadFactorThreshold) {
      this.resize();
    }
    if (this.mode === 'open-addressing' && this.totalCollisions > this.collisionThreshold) {
      this.convertToChaining();
    }
  }

  private resize(): void {
    const oldBuckets = this.buckets;
    this.buckets = new Array(this.buckets.length * 2).fill(null);
    this._size = 0;
    this.totalCollisions = 0;

    oldBuckets.forEach((bucket) => {
      if (bucket !== null) {
        if (Array.isArray(bucket)) {
          const chain = bucket as [K, V][];
          chain.forEach(([k, v]) => {
            if (this.mode === 'open-addressing') {
              this.setOpenAddressing(k, v);
            } else {
              this.setChaining(k, v);
            }
          });
        } else {
          if (this.mode === 'open-addressing') {
            this.setOpenAddressing(bucket[0], bucket[1]);
          } else {
            this.setChaining(bucket[0], bucket[1]);
          }
        }
      }
    });
  }

  private convertToChaining(): void {
    this.mode = 'chaining';
    const oldBuckets = this.buckets;
    this.buckets = new Array(oldBuckets.length).fill(null);
    this._size = 0;

    oldBuckets.forEach((bucket) => {
      if (bucket !== null) {
        if (Array.isArray(bucket)) {
          const chain = bucket as [K, V][];
          chain.forEach(([k, v]) => {
            this.setChaining(k, v);
          });
        } else {
          this.setChaining(bucket[0], bucket[1]);
        }
      }
    });
  }

  private rehash(): void {
    const oldBuckets = this.buckets;
    this.buckets = new Array(this.buckets.length).fill(null);
    this._size = 0;

    oldBuckets.forEach((bucket) => {
      if (bucket !== null) {
        if (Array.isArray(bucket)) {
          const chain = bucket as [K, V][];
          chain.forEach(([k, v]) => {
            if (this.mode === 'open-addressing') {
              this.setOpenAddressing(k, v);
            } else {
              this.setChaining(k, v);
            }
          });
        } else {
          if (this.mode === 'open-addressing') {
            this.setOpenAddressing(bucket[0], bucket[1]);
          } else {
            this.setChaining(bucket[0], bucket[1]);
          }
        }
      }
    });
  }
}
