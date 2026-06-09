class WaveletNode {
  bitmap: boolean[];
  lo: number;
  hi: number;
  mid: number;
  left: WaveletNode | null;
  right: WaveletNode | null;

  constructor(bitmap: boolean[], lo: number, hi: number, mid: number) {
    this.bitmap = bitmap;
    this.lo = lo;
    this.hi = hi;
    this.mid = mid;
    this.left = null;
    this.right = null;
  }

  popcount(pos: number): number {
    let count = 0;
    for (let i = 0; i < pos; i++) {
      if (this.bitmap[i]) {
        count++;
      }
    }
    return count;
  }
}

export class WaveletTree {
  private root: WaveletNode;
  private size: number;

  constructor(array: number[]) {
    if (array.length === 0) {
      throw new Error("Array cannot be empty");
    }
    this.size = array.length;
    const min = Math.min(...array);
    const max = Math.max(...array);
    this.root = this.build(array, min, max);
  }

  private build(array: number[], lo: number, hi: number): WaveletNode {
    const mid = Math.floor((lo + hi) / 2);
    const bitmap: boolean[] = new Array(array.length);
    const left: number[] = [];
    const right: number[] = [];

    for (let i = 0; i < array.length; i++) {
      if (array[i]! <= mid) {
        bitmap[i] = true;
        left.push(array[i]!);
      } else {
        bitmap[i] = false;
        right.push(array[i]!);
      }
    }

    const node = new WaveletNode(bitmap, lo, hi, mid);

    if (lo !== hi) {
      if (left.length > 0) {
        node.left = this.build(left, lo, mid);
      }
      if (right.length > 0) {
        node.right = this.build(right, mid + 1, hi);
      }
    }

    return node;
  }

  rank(value: number, position: number): number {
    return this.rankHelper(this.root, value, position);
  }

  private rankHelper(node: WaveletNode, value: number, position: number): number {
    if (position === 0) {
      return 0;
    }

    if (value < node.lo || value > node.hi) {
      return 0;
    }

    if (node.lo === node.hi) {
      return position;
    }

    const count = node.popcount(position);

    if (value <= node.mid) {
      if (node.left === null) {
        return 0;
      }
      return this.rankHelper(node.left, value, count);
    } else {
      if (node.right === null) {
        return 0;
      }
      return this.rankHelper(node.right, value, position - count);
    }
  }

  access(index: number): number {
    return this.accessHelper(this.root, index);
  }

  private accessHelper(node: WaveletNode, index: number): number {
    if (node.lo === node.hi) {
      return node.lo;
    }

    const goLeft = node.bitmap[index];
    const nextIndex = goLeft ? node.popcount(index) : index - node.popcount(index);

    if (goLeft) {
      if (node.left === null) {
        return node.mid;
      }
      return this.accessHelper(node.left, nextIndex);
    } else {
      if (node.right === null) {
        return node.mid + 1;
      }
      return this.accessHelper(node.right, nextIndex);
    }
  }

  rangeCount(value: number, start: number, end: number): number {
    if (start > end) {
      throw new Error("Start must be <= end");
    }
    if (start < 0 || end > this.size) {
      throw new Error("Range out of bounds");
    }
    return this.rank(value, end) - this.rank(value, start);
  }

  kthSmallest(k: number, start: number, end: number): number {
    if (k <= 0 || k > end - start) {
      throw new Error("k out of range");
    }
    if (start < 0 || end > this.size) {
      throw new Error("Range out of bounds");
    }
    return this.kthSmallestHelper(this.root, k, start, end);
  }

  private kthSmallestHelper(node: WaveletNode, k: number, start: number, end: number): number {
    if (node.lo === node.hi) {
      return node.lo;
    }

    const startCount = node.popcount(start);
    const endCount = node.popcount(end);
    const leftCount = endCount - startCount;

    if (node.left === null) {
      return this.kthSmallestHelper(node.right!, k, start - startCount, end - endCount);
    }

    if (node.right === null) {
      return this.kthSmallestHelper(node.left, k, startCount, endCount);
    }

    if (k <= leftCount) {
      return this.kthSmallestHelper(node.left, k, startCount, endCount);
    } else {
      return this.kthSmallestHelper(node.right, k - leftCount, start - startCount, end - endCount);
    }
  }

  getSize(): number {
    return this.size;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.access(i));
    }
    return result;
  }

  getTimeComplexity(): string {
    return "O(σ log n) build, O(log σ) rank/access/kthSmallest";
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

  isEmpty(): boolean {
    return this.size === 0
  }


  toJSON() {
    return { type: 'WaveletTree', items: this.toArray() }
  }

}
