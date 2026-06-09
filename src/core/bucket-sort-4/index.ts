export class BucketSort4<T extends number> {
  private bucketSize: number;

  constructor(bucketSize: number = 10) {
    if (bucketSize < 1) throw new RangeError('bucketSize must be >= 1')

    this.bucketSize = bucketSize;
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) {
      return [...arr];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;

    if (range === 0) {
      return [...arr];
    }

    const numBuckets = Math.min(Math.ceil(range / this.bucketSize) || 1, 10000);
    const bucketRange = range / numBuckets;
    const buckets: T[][] = Array.from({ length: numBuckets }, () => []);

    for (const value of arr) {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketRange),
        numBuckets - 1
      );
      buckets[bucketIndex]!.push(value);
    }

    for (const bucket of buckets) {
      this.insertionSort(bucket);
    }

    const result: T[] = [];
    for (const bucket of buckets) {
      result.push(...bucket);
    }

    return result;
  }

  sortDescending(arr: T[]): T[] {
    const sorted = this.sort(arr);
    return sorted.reverse();
  }

  isSorted(arr: T[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i]! > arr[i + 1]!) {
        return false;
      }
    }
    return true;
  }

  getTimeComplexity(): string {
    return 'O(n + k)';
  }

  getSpaceComplexity(): string {
    return 'O(n + k)';
  }

  sortWithBucketCount(arr: T[], numBuckets: number): T[] {
    if (arr.length <= 1) {
      return [...arr];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;

    if (range === 0) {
      return [...arr];
    }

    const bucketRange = range / numBuckets;
    const buckets: T[][] = Array.from({ length: numBuckets }, () => []);

    for (const value of arr) {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketRange),
        numBuckets - 1
      );
      buckets[bucketIndex]!.push(value);
    }

    for (const bucket of buckets) {
      this.insertionSort(bucket);
    }

    const result: T[] = [];
    for (const bucket of buckets) {
      result.push(...bucket);
    }

    return result;
  }

  sortRange(arr: T[], min: T, max: T): T[] {
    if (arr.length <= 1) {
      return [...arr];
    }

    const range = max - min;

    if (range === 0) {
      return [...arr];
    }

    const numBuckets = Math.min(Math.ceil(range / this.bucketSize) || 1, 10000);
    const bucketRange = range / numBuckets;
    const buckets: T[][] = Array.from({ length: numBuckets }, () => []);

    for (const value of arr) {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketRange),
        numBuckets - 1
      );
      buckets[bucketIndex]!.push(value);
    }

    for (const bucket of buckets) {
      this.insertionSort(bucket);
    }

    const result: T[] = [];
    for (const bucket of buckets) {
      result.push(...bucket);
    }

    return result;
  }

  async parallelBucketSort(arr: T[]): Promise<T[]> {
    if (arr.length <= 1) {
      return [...arr];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const numBuckets = Math.min(Math.ceil((max - min) / this.bucketSize) || 1, 16);
    const range = max - min;

    if (range === 0) {
      return [...arr];
    }

    const bucketRange = range / numBuckets;
    const buckets: T[][] = Array.from({ length: numBuckets }, () => []);

    for (const value of arr) {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketRange),
        numBuckets - 1
      );
      buckets[bucketIndex]!.push(value);
    }

    const promises = buckets.map((bucket) =>
      Promise.resolve().then(() => {
        this.insertionSort(bucket);
        return bucket;
      })
    );

    const sortedBuckets = await Promise.all(promises);
    const result: T[] = [];
    for (const bucket of sortedBuckets) {
      result.push(...bucket);
    }
    return result;
  }

  getBucketDistribution(arr: T[]): Map<number, number> {
    if (arr.length === 0) {
      return new Map();
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const numBuckets = Math.ceil((max - min) / this.bucketSize) || 1;
    const range = max - min;
    const bucketRange = range / numBuckets;
    const distribution = new Map<number, number>();

    for (let i = 0; i < numBuckets; i++) {
      distribution.set(i, 0);
    }

    for (const value of arr) {
      const bucketIndex = Math.min(
        Math.floor((value - min) / bucketRange),
        numBuckets - 1
      );
      const count = distribution.get(bucketIndex) ?? 0;
      distribution.set(bucketIndex, count + 1);
    }

    return distribution;
  }

  stableBucketSort(arr: T[]): T[] {
    if (arr.length <= 1) {
      return [...arr];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;

    if (range === 0) {
      return [...arr];
    }

    const numBuckets = Math.ceil(range / this.bucketSize) || 1;
    const bucketRange = range / numBuckets;

    type IndexedValue = { value: T; originalIndex: number };
    const indexedArr: IndexedValue[] = arr.map((value, index) => ({
      value,
      originalIndex: index,
    }));

    const buckets: IndexedValue[][] = Array.from(
      { length: numBuckets },
      () => []
    );

    for (const item of indexedArr) {
      const bucketIndex = Math.min(
        Math.floor((item.value - min) / bucketRange),
        numBuckets - 1
      );
      buckets[bucketIndex]!.push(item);
    }

    for (const bucket of buckets) {
      this.stableInsertionSort(bucket);
    }

    const result: T[] = [];
    for (const bucket of buckets) {
      for (const item of bucket) {
        result.push(item.value);
      }
    }

    return result;
  }

  private insertionSort(arr: T[]): void {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]!;
      let j = i - 1;

      while (j >= 0 && arr[j]! > key) {
        arr[j + 1]! = arr[j]!;
        j--;
      }

      arr[j + 1]! = key;
    }
  }

  private stableInsertionSort(
    arr: { value: T; originalIndex: number }[]
  ): void {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]!;
      let j = i - 1;

      while (
        j >= 0 &&
        (arr[j]!.value > key.value ||
          (arr[j]!.value === key.value &&
            arr[j]!.originalIndex > key.originalIndex))
      ) {
        arr[j + 1]! = arr[j]!;
        j--;
      }

      arr[j + 1]! = key;
    }
  }
}
