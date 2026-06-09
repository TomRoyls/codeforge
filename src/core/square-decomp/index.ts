export class SquareDecomp {
  private array: number[];
  private blocks: number[][];
  private blockSum: number[];
  private blockMin: number[];
  private blockMax: number[];
  readonly blockSize: number;
  readonly blockCount: number;

  constructor(arr: number[]) {
    const n = arr.length;
    this.array = [...arr];
    this.blockSize = Math.floor(Math.sqrt(n)) || 1;
    this.blockCount = Math.ceil(n / this.blockSize);
    this.blocks = [];
    this.blockSum = [];
    this.blockMin = [];
    this.blockMax = [];

    for (let i = 0; i < this.blockCount; i++) {
      const start = i * this.blockSize;
      const end = Math.min(start + this.blockSize, n);
      const block = this.array.slice(start, end);
      this.blocks.push(block);

      let sum = 0;
      let min = block[0] ?? 0;
      let max = block[0] ?? 0;

      for (let j = 0; j < block.length; j++) {
        sum += block[j]!;
        if (block[j]! < min) min = block[j]!;
        if (block[j]! > max) max = block[j]!;
      }

      this.blockSum.push(sum);
      this.blockMin.push(min);
      this.blockMax.push(max);
    }
  }

  get size(): number {
    return this.array.length;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  get(index: number): number {
    return this.array[index] ?? 0;
  }

  update(index: number, value: number): void {
    const old = this.array[index] ?? 0;
    this.array[index] = value;
    const blockIndex = Math.floor(index / this.blockSize);

    const diff = value - old;
    this.blockSum[blockIndex]! += diff;

    let min = this.blocks[blockIndex]![0] ?? 0;
    let max = this.blocks[blockIndex]![0] ?? 0;

    for (let i = 0; i < this.blocks[blockIndex]!.length; i++) {
      if (this.blocks[blockIndex]![i]! < min) min = this.blocks[blockIndex]![i]!;
      if (this.blocks[blockIndex]![i]! > max) max = this.blocks[blockIndex]![i]!;
    }

    this.blockMin[blockIndex] = min;
    this.blockMax[blockIndex] = max;
  }

  queryRange(left: number, right: number): number {
    return this.queryRangeSum(left, right);
  }

  queryRangeSum(left: number, right: number): number {
    let sum = 0;
    const leftBlock = Math.floor(left / this.blockSize);
    const rightBlock = Math.floor(right / this.blockSize);

    if (leftBlock === rightBlock) {
      for (let i = left; i <= right; i++) {
        sum += this.array[i] ?? 0;
      }
    } else {
      for (let i = left; i < (leftBlock + 1) * this.blockSize && i < this.array.length; i++) {
        sum += this.array[i] ?? 0;
      }

      for (let i = leftBlock + 1; i < rightBlock; i++) {
        sum += this.blockSum[i] ?? 0;
      }

      const start = rightBlock * this.blockSize;
      for (let i = start; i <= right && i < this.array.length; i++) {
        sum += this.array[i] ?? 0;
      }
    }

    return sum;
  }

  queryRangeMin(left: number, right: number): number {
    const leftBlock = Math.floor(left / this.blockSize);
    const rightBlock = Math.floor(right / this.blockSize);

    if (leftBlock === rightBlock) {
      let min = this.array[left] ?? 0;
      for (let i = left + 1; i <= right; i++) {
        if ((this.array[i] ?? 0) < min) min = this.array[i] ?? 0;
      }
      return min;
    }

    let min = this.array[left] ?? 0;
    for (let i = left + 1; i < (leftBlock + 1) * this.blockSize && i < this.array.length; i++) {
      if ((this.array[i] ?? 0) < min) min = this.array[i] ?? 0;
    }

    for (let i = leftBlock + 1; i < rightBlock; i++) {
      if ((this.blockMin[i] ?? 0) < min) min = this.blockMin[i] ?? 0;
    }

    const start = rightBlock * this.blockSize;
    for (let i = start; i <= right && i < this.array.length; i++) {
      if ((this.array[i] ?? 0) < min) min = this.array[i] ?? 0;
    }

    return min;
  }

  queryRangeMax(left: number, right: number): number {
    const leftBlock = Math.floor(left / this.blockSize);
    const rightBlock = Math.floor(right / this.blockSize);

    if (leftBlock === rightBlock) {
      let max = this.array[left] ?? 0;
      for (let i = left + 1; i <= right; i++) {
        if ((this.array[i] ?? 0) > max) max = this.array[i] ?? 0;
      }
      return max;
    }

    let max = this.array[left] ?? 0;
    for (let i = left + 1; i < (leftBlock + 1) * this.blockSize && i < this.array.length; i++) {
      if ((this.array[i] ?? 0) > max) max = this.array[i] ?? 0;
    }

    for (let i = leftBlock + 1; i < rightBlock; i++) {
      if ((this.blockMax[i] ?? 0) > max) max = this.blockMax[i] ?? 0;
    }

    const start = rightBlock * this.blockSize;
    for (let i = start; i <= right && i < this.array.length; i++) {
      if ((this.array[i] ?? 0) > max) max = this.array[i] ?? 0;
    }

    return max;
  }

  toArray(): number[] {
    return [...this.array];
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

  static from(items: any[]): SquareDecomp {
    return new SquareDecomp(items)
  }

  clone(): SquareDecomp {
    return SquareDecomp.from(this.toArray())
  }

  toString(): string {
    return `SquareDecomp({ size: ${this.size} })`
  }

  clear(): void {
    this.blocks = []
    this.blockSum = []
    this.blockMin = []
    this.blockMax = []
  }
}
