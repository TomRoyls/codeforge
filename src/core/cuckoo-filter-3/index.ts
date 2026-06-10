export class CuckooFilter3 {
  private bucketCount: number;
  private buckets: Uint8Array[];
  private entriesPerBucket: number;
  private fingerprintBits: number;
  private fingerprintMask: number;
  private itemCount: number;

  constructor(capacity: number) {
    this.bucketCount = Math.ceil(capacity / 4);
    this.entriesPerBucket = 4;
    this.fingerprintBits = 8;
    this.fingerprintMask = 2 ** this.fingerprintBits - 1;
    this.buckets = Array.from({ length: this.bucketCount });
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets[i] = new Uint8Array(this.entriesPerBucket);
    }

    this.itemCount = 0;
  }

  get falsePositiveRate(): number {
    if (this.itemCount === 0) {
      return 0;
    }

    const {loadFactor} = this;
    const exponent = -4 * loadFactor;
    return 1 - 2 ** exponent;
  }

  get isEmpty(): boolean {
    return this.itemCount === 0;
  }

  get loadFactor(): number {
    const capacity = this.bucketCount * this.entriesPerBucket;
    return this.itemCount / capacity;
  }

  get size(): number {
    return this.itemCount;
  }

  clear(): void {
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets[i]!.fill(0);
    }

    this.itemCount = 0;
  }

  contains(item: string): boolean {
    const [fingerprint, bucket1, bucket2] = this.computeHashes(item);

    return this.containsInBucket(bucket1, fingerprint) || this.containsInBucket(bucket2, fingerprint);
  }

  insert(item: string): boolean {
    const [fingerprint, bucket1, bucket2] = this.computeHashes(item);

    if (this.tryInsert(bucket1, fingerprint)) {
      this.itemCount++;
      return true;
    }

    if (this.tryInsert(bucket2, fingerprint)) {
      this.itemCount++;
      return true;
    }

    if (this.relocate(bucket1, bucket2, fingerprint, 0)) {
      this.itemCount++;
      return true;
    }

    return false;
  }

  remove(item: string): boolean {
    const [fingerprint, bucket1, bucket2] = this.computeHashes(item);

    if (this.removeFromBucket(bucket1, fingerprint)) {
      this.itemCount--;
      return true;
    }

    if (this.removeFromBucket(bucket2, fingerprint)) {
      this.itemCount--;
      return true;
    }

    return false;
  }

  private computeHashes(item: string): readonly [number, number, number] {
    const baseHash = this.hash(item);
    const fingerprint = Math.max(1, baseHash % (this.fingerprintMask + 1));
    const bucket1 = ((baseHash % this.bucketCount) + this.bucketCount) % this.bucketCount;
    const bucket2 = (((bucket1 + this.hash(fingerprint.toString())) % 2_147_483_647 + 2_147_483_647) % 2_147_483_647 + this.bucketCount) % this.bucketCount;

    return [fingerprint, bucket1, bucket2];
  }

  private containsInBucket(bucket: number, fingerprint: number): boolean {
    const bucketData = this.buckets[bucket]!;

    for (let i = 0; i < this.entriesPerBucket; i++) {
      if (bucketData[i] === fingerprint) {
        return true;
      }
    }

    return false;
  }

  private hash(input: string): number {
    let hash = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input.codePointAt(i) ?? 0;
      hash = ((hash * 32) - hash) + char;
      hash %= 2_147_483_647;
    }

    return (hash >>> 0);
  }

  private relocate(bucket1: number, bucket2: number, fingerprint: number, depth: number): boolean {
    if (depth >= 500) {
      return false;
    }

    const bucketToKickFrom = Math.random() < 0.5 ? bucket1 : bucket2;
    const bucketData = this.buckets[bucketToKickFrom]!;
    const kickIndex = Math.floor(Math.random() * this.entriesPerBucket);
    const kickedFingerprint = bucketData[kickIndex]!;

    bucketData[kickIndex] = fingerprint;

    if (kickedFingerprint === 0) {
      return true;
    }

    const altBucket = (((bucketToKickFrom + this.hash(kickedFingerprint!.toString())) % 2147483647 + 2147483647) % 2147483647 + this.bucketCount) % this.bucketCount;

    if (this.tryInsert(altBucket, kickedFingerprint!)) {
      return true;
    }

    const nextBucket1 = bucketToKickFrom;
    const nextBucket2 = altBucket;

    return this.relocate(nextBucket1, nextBucket2, kickedFingerprint!, depth + 1);
  }

  private removeFromBucket(bucket: number, fingerprint: number): boolean {
    const bucketData = this.buckets[bucket]!;

    for (let i = 0; i < this.entriesPerBucket; i++) {
      if (bucketData[i] === fingerprint) {
        bucketData[i] = 0;
        return true;
      }
    }

    return false;
  }

  private tryInsert(bucket: number, fingerprint: number): boolean {
    const bucketData = this.buckets[bucket]!;

    for (let i = 0; i < this.entriesPerBucket; i++) {
      if (bucketData[i] === 0) {
        bucketData[i] = fingerprint;
        return true;
      }
    }

    return false;
  }

  has(item: string): boolean {
    return this.contains(item)
  }

  get [Symbol.toStringTag](): string {
    return 'CuckooFilter3'
  }

  includes(item: string): boolean {
    return this.contains(item)
  }
}
