export class KthLargest {
  private heap: number[] = [];
  private k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;
    for (const num of nums) {
      this.add(num);
    }
  }

  add(val: number): number {
    if (this.heap.length < this.k) {
      this.heapPush(val);
      if (this.heap.length === this.k) {
        return this.heap[0]!;
      }
      return -Infinity;
    }
    if (val > this.heap[0]!) {
      this.heapPop();
      this.heapPush(val);
    }
    return this.heap[0]!;
  }

  getKthLargest(): number {
    return this.heap[0]!;
  }

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapPush(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

  private heapPop(): number {
    const root = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return root;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex]! <= this.heap[index]!) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index]!, this.heap[parentIndex]!];
      index = parentIndex;
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let smallestChildIndex = index;

      if (leftChildIndex < length && this.heap[leftChildIndex]! < this.heap[smallestChildIndex]!) {
        smallestChildIndex = leftChildIndex;
      }
      if (rightChildIndex < length && this.heap[rightChildIndex]! < this.heap[smallestChildIndex]!) {
        smallestChildIndex = rightChildIndex;
      }
      if (smallestChildIndex === index) break;
      [this.heap[index], this.heap[smallestChildIndex]] = [this.heap[smallestChildIndex]!, this.heap[index]!];
      index = smallestChildIndex;
    }
  }
}
