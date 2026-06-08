export class CuckooFilter2 {
  private buckets: Uint32Array[];
  private _size: number;
  private readonly capacity: number;
  private readonly bucketSize: number;
  private readonly fingerprintSize: number;
  private readonly maxKickCount: number;

  constructor(capacity: number = 1024, bucketSize: number = 4, fingerprintSize: number = 1) {
    this.capacity = nextPowerOfTwo(capacity);
    this.bucketSize = bucketSize;
    this.fingerprintSize = fingerprintSize;
    this.maxKickCount = 500;
    this._size = 0;
    this.buckets = [];
    for (let i = 0; i < this.capacity; i++) {
      this.buckets[i] = new Uint32Array(this.bucketSize);
    }
  }

  private hash(item: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < item.length; i++) {
      h = Math.imul(h ^ item.charCodeAt(i), 16777619) >>> 0;
    }
    return h;
  }

  private fingerprint(hashValue: number): number {
    const mask = (1 << (8 * this.fingerprintSize)) - 1;
    return hashValue & mask;
  }

  private twoHashes(hashValue: number, fingerprint: number): [number, number] {
    let h1 = hashValue % this.capacity;
    if (h1 < 0) h1 += this.capacity;
    let h2 = (h1 ^ this.hash(fingerprint.toString())) % this.capacity;
    if (h2 < 0) h2 += this.capacity;
    return [h1, h2];
  }

  private kick(bucketIndex: number, fingerprint: number, count: number): boolean {
    if (count >= this.maxKickCount) {
      return false;
    }

    const bucket = this.buckets[bucketIndex]!;
    const otherFingerprint = bucket[0]!;
    const fpHash = this.hash(otherFingerprint.toString());
    let targetBucket = (bucketIndex ^ fpHash) % this.capacity;
    if (targetBucket < 0) targetBucket += this.capacity;

    const saved = new Array<number>(this.bucketSize);
    const targetB = this.buckets[targetBucket]!;
    for (let i = 0; i < this.bucketSize; i++) saved[i] = targetB[i]!;

    bucket[0] = fingerprint;
    if (this.insertToFingerprintBucket(targetBucket, otherFingerprint, count + 1)) {
      return true;
    }

    bucket[0] = otherFingerprint;
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

  insert(item: string): boolean {
    if (this._size >= this.capacity * this.bucketSize) {
      return false;
    }

    const hashValue = this.hash(item);
    const fp = this.fingerprint(hashValue);
    if (fp === 0) {
      return false;
    }

    if (this.contains(item)) {
      return true;
    }

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

  contains(item: string): boolean {
    const hashValue = this.hash(item);
    const fp = this.fingerprint(hashValue);
    if (fp === 0) {
      return false;
    }

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

  delete(item: string): boolean {
    const hashValue = this.hash(item);
    const fp = this.fingerprint(hashValue);
    if (fp === 0) {
      return false;
    }

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

  loadFactor(): number {
    return this._size / (this.capacity * this.bucketSize);
  }

  clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      this.buckets[i] = new Uint32Array(this.bucketSize);
    }
    this._size = 0;
  }
}

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
