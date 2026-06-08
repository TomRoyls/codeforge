import type { YFastTrieOptions } from "./types.js";

export class YFastTrie {
  private universeSize: number;
  private groupSize: number;
  private buckets: Map<bigint, number[]>;
  private bucketPrefixes: Set<bigint>;
  private minNode: number | null;
  private maxNode: number | null;
  private _size: number;

  constructor(options: YFastTrieOptions = {}) {
    this.universeSize = options.universeSize ?? 2 ** 32;
    this.groupSize = options.groupSize ?? Math.floor(Math.log2(this.universeSize));
    this.buckets = new Map();
    this.bucketPrefixes = new Set();
    this.minNode = null;
    this.maxNode = null;
    this._size = 0;
  }

  insert(value: number): void {
    if (this.has(value)) return;

    const prefix = this.getPrefix(value);
    let bucket = this.buckets.get(prefix);

    if (!bucket) {
      bucket = [];
      this.buckets.set(prefix, bucket);
      this.bucketPrefixes.add(prefix);
    }

    this.insertSorted(bucket, value);

    if (this.minNode === null || value < this.minNode) {
      this.minNode = value;
    }

    if (this.maxNode === null || value > this.maxNode) {
      this.maxNode = value;
    }

    this._size++;
  }

  delete(value: number): void {
    const prefix = this.getPrefix(value);
    const bucket = this.buckets.get(prefix);

    if (!bucket) return;

    const index = this.binarySearch(bucket, value);

    if (index === -1) return;

    bucket.splice(index, 1);

    if (bucket.length === 0) {
      this.buckets.delete(prefix);
      this.bucketPrefixes.delete(prefix);
    }

    if (value === this.minNode) {
      this.updateMin();
    }

    if (value === this.maxNode) {
      this.updateMax();
    }

    this._size--;
  }

  has(value: number): boolean {
    const prefix = this.getPrefix(value);
    const bucket = this.buckets.get(prefix);

    if (!bucket) return false;

    const index = this.binarySearch(bucket, value);

    return index !== -1;
  }

  predecessor(value: number): number | null {
    const prefix = this.getPrefix(value);
    const bucket = this.buckets.get(prefix);

    if (bucket) {
      const index = this.binarySearch(bucket, value);

      if (index !== -1) {
        if (index > 0) return bucket[index - 1]!;

        const prevPrefix = this.getPreviousPrefix(prefix);

        if (prevPrefix !== null) {
          const prevBucket = this.buckets.get(prevPrefix)!;

          return prevBucket[prevBucket.length - 1]!;
        }
      } else {
        const insertionPoint = this.getInsertionPoint(bucket, value);

        if (insertionPoint > 0) return bucket[insertionPoint - 1]!;

        const prevPrefix = this.getPreviousPrefix(prefix);

        if (prevPrefix !== null) {
          const prevBucket = this.buckets.get(prevPrefix)!;

          return prevBucket[prevBucket.length - 1]!;
        }
      }
    } else {
      const prevPrefix = this.getPreviousPrefix(prefix);

      if (prevPrefix !== null) {
        const prevBucket = this.buckets.get(prevPrefix)!;

        return prevBucket[prevBucket.length - 1]!;
      }
    }

    return null;
  }

  successor(value: number): number | null {
    if (this.isEmpty()) return null;

    const minValue = this.min();

    if (minValue !== null && value < minValue) {
      return minValue;
    }

    const prefix = this.getPrefix(value);
    const bucket = this.buckets.get(prefix);

    if (bucket) {
      const index = this.binarySearch(bucket, value);

      if (index !== -1) {
        if (index < bucket.length - 1) return bucket[index + 1]!;

        const nextPrefix = this.getNextPrefix(prefix);

        if (nextPrefix !== null) {
          const nextBucket = this.buckets.get(nextPrefix)!;

          return nextBucket[0]!;
        }
      } else {
        const insertionPoint = this.getInsertionPoint(bucket, value);

        if (insertionPoint < bucket.length) return bucket[insertionPoint]!;

        const nextPrefix = this.getNextPrefix(prefix);

        if (nextPrefix !== null) {
          const nextBucket = this.buckets.get(nextPrefix)!;

          return nextBucket[0]!;
        }
      }
    } else {
      const allPrefixes = Array.from(this.bucketPrefixes).sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      for (const p of allPrefixes) {
        if (p >= prefix) {
          const nextBucket = this.buckets.get(p)!;

          if (nextBucket.length > 0) {
            return nextBucket[0]!;
          }
        }
      }
    }

    return null;
  }

  min(): number | null {
    return this.minNode;
  }

  max(): number | null {
    return this.maxNode;
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.buckets.clear();
    this.bucketPrefixes.clear();
    this.minNode = null;
    this.maxNode = null;
    this._size = 0;
  }

  toArray(): number[] {
    const result: number[] = [];
    const prefixes = Array.from(this.bucketPrefixes).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    for (const prefix of prefixes) {
      const bucket = this.buckets.get(prefix)!;
      result.push(...bucket);
    }

    return result;
  }

  forEach(callback: (value: number) => void): void {
    const prefixes = Array.from(this.bucketPrefixes).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    for (const prefix of prefixes) {
      const bucket = this.buckets.get(prefix)!;

      for (const value of bucket) {
        callback(value);
      }
    }
  }

  private getPrefix(value: number): bigint {
    return BigInt(value) >> BigInt(Math.floor(Math.log2(this.groupSize)));
  }

  private insertSorted(bucket: number[], value: number): void {
    let left = 0;
    let right = bucket.length;

    while (left < right) {
      const mid = (left + right) >> 1;

      if (bucket[mid]! < value) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    bucket.splice(left, 0, value);
  }

  private binarySearch(bucket: number[], value: number): number {
    let left = 0;
    let right = bucket.length - 1;

    while (left <= right) {
      const mid = (left + right) >> 1;

      if (bucket[mid]! === value) {
        return mid;
      } else if (bucket[mid]! < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1;
  }

  private getInsertionPoint(bucket: number[], value: number): number {
    let left = 0;
    let right = bucket.length;

    while (left < right) {
      const mid = (left + right) >> 1;

      if (bucket[mid]! < value) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  private getSortedPrefixes(): bigint[] {
    return Array.from(this.bucketPrefixes).sort((a, b) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  private getPreviousPrefix(prefix: bigint): bigint | null {
    const sorted = this.getSortedPrefixes()
    let result: bigint | null = null
    for (const p of sorted) {
      if (p >= prefix) break
      result = p
    }
    return result
  }

  private getNextPrefix(prefix: bigint): bigint | null {
    const sorted = this.getSortedPrefixes()
    for (const p of sorted) {
      if (p > prefix) return p
    }
    return null
  }

  private updateMin(): void {
    this.minNode = null;

    const prefixes = Array.from(this.bucketPrefixes).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    if (prefixes.length > 0) {
      const firstBucket = this.buckets.get(prefixes[0]!)!;

      if (firstBucket.length > 0) {
        this.minNode = firstBucket[0]!;
      }
    }
  }

  private updateMax(): void {
    this.maxNode = null;

    const prefixes = Array.from(this.bucketPrefixes).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    if (prefixes.length > 0) {
      const lastBucket = this.buckets.get(prefixes[prefixes.length - 1]!)!;

      if (lastBucket.length > 0) {
        this.maxNode = lastBucket[lastBucket.length - 1]!;
      }
    }
  }
}
