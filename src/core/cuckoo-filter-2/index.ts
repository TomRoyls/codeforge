interface CuckooFilterOptions {
  capacity?: number;
  bucketSize?: number;
  maxKicks?: number;
}

export class CuckooFilter2 {
  private buckets: Uint32Array[];
  private _size: number;
  private readonly _capacity: number;
  private readonly bucketSize: number;
  private readonly fingerprintSize: number;
  private readonly maxKickCount: number;

  constructor(optionsOrCapacity?: number | CuckooFilterOptions, bucketSize?: number, fingerprintSize?: number) {
    let capacity = 1024;
    let bSize = 4;
    let fpSize = 1;
    let maxKicks = 500;

    if (typeof optionsOrCapacity === 'object' && optionsOrCapacity !== null) {
      capacity = optionsOrCapacity.capacity ?? 1024;
      bSize = optionsOrCapacity.bucketSize ?? 4;
      maxKicks = optionsOrCapacity.maxKicks ?? 500;
    } else if (typeof optionsOrCapacity === 'number') {
      capacity = optionsOrCapacity;
      if (bucketSize !== undefined) bSize = bucketSize;
      if (fingerprintSize !== undefined) fpSize = fingerprintSize;
    }

    this._capacity = nextPowerOfTwo(capacity);
    this.bucketSize = bSize;
    this.fingerprintSize = fpSize;
    this.maxKickCount = maxKicks;
    this._size = 0;
    this.buckets = [];
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i] = new Uint32Array(this.bucketSize);
    }
  }

  get capacity(): number {
    return this._capacity;
  }

  private hash(item: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < item.length; i++) {
      h = Math.imul(h ^ item.charCodeAt(i), 16777619) >>> 0;
    }
    return h;
  }

  private computeFingerprint(hashValue: number): number {
    const bits = 8 * this.fingerprintSize;
    let fp: number;
    if (bits >= 32) {
      fp = hashValue >>> 0;
    } else {
      const mask = (1 << bits) - 1;
      fp = (hashValue ^ (hashValue >>> bits) ^ (hashValue >>> (bits * 2))) & mask;
    }
    if (fp === 0) fp = 1;
    return fp;
  }

  private twoHashes(hashValue: number, fp: number): [number, number] {
    let h1 = ((hashValue % this._capacity) + this._capacity) % this._capacity;
    if (h1 < 0) h1 += this._capacity;
    let h2 = (h1 ^ this.hash(fp.toString())) % this._capacity;
    if (h2 < 0) h2 += this._capacity;
    return [h1, h2];
  }

  private kick(bucketIndex: number, fingerprint: number, count: number): boolean {
    if (count >= this.maxKickCount) {
      return false;
    }

    const bucket = this.buckets[bucketIndex]!;
    const evictPos = Math.floor(Math.random() * this.bucketSize);
    const otherFingerprint = bucket[evictPos]!;
    const fpHash = this.hash(otherFingerprint.toString());
    let targetBucket = (bucketIndex ^ fpHash) % this._capacity;
    if (targetBucket < 0) targetBucket += this._capacity;

    const saved = new Array<number>(this.bucketSize);
    const targetB = this.buckets[targetBucket]!;
    for (let i = 0; i < this.bucketSize; i++) saved[i] = targetB[i]!;

    bucket[evictPos] = fingerprint;
    if (this.insertToFingerprintBucket(targetBucket, otherFingerprint, count + 1)) {
      return true;
    }

    bucket[evictPos] = otherFingerprint;
    for (let i = 0; i < this.bucketSize; i++) targetB[i] = saved[i]!;
    return false;
  }

  private insertToFingerprintBucket(bucketIndex: number, fingerprint: number, count: number): boolean {
    const bucket = this.buckets[bucketIndex]!;
    for (let i = 0; i < this.bucketSize; i++) {
      if (bucket[i] === 0) {
        bucket[i] = fingerprint;
        return true;
      }
    }

    return this.kick(bucketIndex, fingerprint, count);
  }

  insert(item: unknown): boolean {
    if (this._size >= this._capacity * this.bucketSize) {
      return false;
    }

    const hashValue = this.hash(String(item));
    const fp = this.computeFingerprint(hashValue);

    const [h1, h2] = this.twoHashes(hashValue, fp);

    if (this.insertToFingerprintBucket(h1, fp, 0)) {
      this._size++;
      return true;
    }

    if (this.insertToFingerprintBucket(h2, fp, 0)) {
      this._size++;
      return true;
    }

    return false;
  }

  contains(item: unknown): boolean {
    const hashValue = this.hash(String(item));
    const fp = this.computeFingerprint(hashValue);

    const [h1, h2] = this.twoHashes(hashValue, fp);
    const bucket1 = this.buckets[h1]!;
    const bucket2 = this.buckets[h2]!;

    for (let i = 0; i < this.bucketSize; i++) {
      if (bucket1[i] === fp) {
        return true;
      }
      if (bucket2[i] === fp) {
        return true;
      }
    }

    return false;
  }

  delete(item: unknown): boolean {
    const hashValue = this.hash(String(item));
    const fp = this.computeFingerprint(hashValue);

    const [h1, h2] = this.twoHashes(hashValue, fp);
    const bucket1 = this.buckets[h1]!;
    const bucket2 = this.buckets[h2]!;

    for (let i = 0; i < this.bucketSize; i++) {
      if (bucket1[i] === fp) {
        bucket1[i] = 0;
        this._size--;
        return true;
      }
      if (bucket2[i] === fp) {
        bucket2[i] = 0;
        this._size--;
        return true;
      }
    }

    return false;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  loadFactor(): number {
    return this._size / (this._capacity * this.bucketSize);
  }

  falsePositiveRate(): number {
    if (this._size === 0) return 0;
    const bits = 8 * this.fingerprintSize;
    const fpSpace = Math.min(bits >= 32 ? 4294967296 : (1 << bits), 256);
    const rate = 1 - Math.pow(1 - 1 / fpSpace, 2 * this.bucketSize);
    return rate * this.loadFactor();
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i] = new Uint32Array(this.bucketSize);
    }
    this._size = 0;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this._capacity; i++) {
      const bucket = this.buckets[i]!;
      for (let j = 0; j < this.bucketSize; j++) {
        if (bucket[j] !== 0) {
          result.push(bucket[j]!);
        }
      }
    }
    return result;
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(item: unknown): boolean {
    return this.contains(item)
  }

  toJSON() {
    return { type: 'CuckooFilter2', size: this.size, items: this.toArray() }
  }
}

export const CuckooFilter = CuckooFilter2;

function nextPowerOfTwo(n: number): number {
  if (n <= 0) return 1;
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n + 1;
}
