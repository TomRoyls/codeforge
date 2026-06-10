export class RadixHeap3<T> {
    private buckets: Array<Array<{key: number, value: T}>>;
    private lastExtracted: number | undefined;
    private _size: number;
    private _keyBits: number;

    constructor(keyBits: number = 32) {
        this._keyBits = keyBits;
        this.buckets = [];
        this.lastExtracted = undefined;
        this._size = 0;
    }

    private msb(x: number): number {
        if (x === 0) return -1;
        let bit = 0;
        while (x > 1) {
            x = x >>> 1;
            bit++;
        }
        return bit;
    }

    private getBucketIndex(key: number): number {
        if (this.lastExtracted === undefined) return 0;
        const diff = key - this.lastExtracted;
        if (diff === 0) return 0;
        return this.msb(diff) + 1;
    }

    insert(key: number, value: T): void {
        if (this.lastExtracted !== undefined && key < this.lastExtracted) {
            this.buckets = [];
            this.lastExtracted = undefined;
        }
        const index = this.getBucketIndex(key);
        if (!this.buckets[index]) {
            this.buckets[index] = [];
        }
        this.buckets[index]!.push({key, value});
        this._size++;
    }

    private findMinBucket(): number {
        for (let i = 0; i < this.buckets.length; i++) {
            if (this.buckets[i] && this.buckets[i]!.length > 0) {
                return i;
            }
        }
        return -1;
    }

    private extractMinFromBucket(bucketIndex: number): {key: number, value: T} {
        const bucket = this.buckets[bucketIndex]!;
        let minIndex = 0;
        for (let i = 1; i < bucket.length; i++) {
            if (bucket[i]!.key < bucket[minIndex]!.key) {
                minIndex = i;
            }
        }
        const result = bucket[minIndex]!;
        bucket[minIndex] = bucket[bucket.length - 1]!;
        bucket.length--;
        return result;
    }

    extractMin(): {key: number, value: T} | undefined {
        const bucketIndex = this.findMinBucket();
        if (bucketIndex === -1) return undefined;

        const result = this.extractMinFromBucket(bucketIndex);
        this.lastExtracted = result.key;
        this._size--;

        if (bucketIndex > 0) {
            const bucket = this.buckets[bucketIndex]!;
            while (bucket.length > 0) {
                const item = bucket[bucket.length - 1]!;
                const newIndex = this.getBucketIndex(item.key);
                if (!this.buckets[newIndex]) {
                    this.buckets[newIndex] = [];
                }
                this.buckets[newIndex]!.push(item);
                bucket.length--;
            }
        }

        return result;
    }

    peek(): {key: number, value: T} | undefined {
        const bucketIndex = this.findMinBucket();
        if (bucketIndex === -1) return undefined;

        const bucket = this.buckets[bucketIndex]!;
        let minItem = bucket[0]!;
        for (let i = 1; i < bucket.length; i++) {
            if (bucket[i]!.key < minItem!.key) {
                minItem = bucket[i]!;
            }
        }
        return minItem;
    }

    decreaseKey(oldKey: number, newKey: number, value: T): boolean {
        if (newKey > oldKey) return false;

        const index = this.getBucketIndex(oldKey);
        const bucket = this.buckets[index];
        if (!bucket) return false;

        let foundIndex = -1;
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i]!.key === oldKey && bucket[i]!.value === value) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) return false;

        bucket[foundIndex] = bucket[bucket.length - 1]!;
        bucket.length--;
        this._size--;

        this.insert(newKey, value);
        return true;
    }

    get size(): number {
        return this._size;
    }

    get keyBits(): number {
        return this._keyBits;
    }

    isEmpty(): boolean {
        return this._size === 0;
    }

    clear(): void {
        this.buckets = [];
        this.lastExtracted = undefined;
        this._size = 0;
    }

  toString(): string {
    return `RadixHeap3({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'RadixHeap3'
  }
}
