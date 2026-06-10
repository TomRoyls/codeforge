export class BlockHeap2 {
  private _size: number = 0;
  private blocks: number[][] = [];

  constructor(private blockSize: number = 4) {
    if (blockSize < 1) {
      throw new Error('Block size must be at least 1');
    }
  }

  get size(): number {
    return this._size;
  }

  clear(): void {
    this.blocks = [];
    this._size = 0;
  }

  contains(value: number): boolean {
    for (let i = 0; i < this._size; i++) {
      if (this.get(i) === value) {
        return true;
      }
    }

    return false;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  merge(other: BlockHeap2): void {
    const otherArray = other.toArray();
    for (const value of otherArray) {
      this.push(value);
    }
  }

  peek(): number | undefined {
    if (this._size === 0) {
      return undefined;
    }

    return this.get(0);
  }

  pop(): number | undefined {
    if (this._size === 0) {
      return undefined;
    }

    if (this._size === 1) {
      this._size--;
      return this.get(0);
    }

    const result = this.get(0);
    const lastIndex = this._size - 1;
    this.set(0, this.get(lastIndex));
    this._size--;
    this.trickleDown(0);
    return result;
  }

  push(value: number): void {
    this.ensureCapacity(this._size);
    this.set(this._size, value);
    this._size++;
    this.bubbleUp(this._size - 1);
  }

  remove(value: number): boolean {
    const index = this.findIndex(value);
    if (index === -1) {
      return false;
    }

    const lastIndex = this._size - 1;
    if (index === lastIndex) {
      this._size--;
    } else {
      this.set(index, this.get(lastIndex));
      this._size--;
      this.bubbleUp(index);
      this.trickleDown(index);
    }

    return true;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.get(i));
    }

    return result;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.get(index) >= this.get(parent)) {
        break;
      }

      this.swap(index, parent);
      index = parent;
    }
  }

  private ensureCapacity(index: number): void {
    const blockIndex = this.getBlockIndex(index);
    while (this.blocks.length <= blockIndex) {
      this.blocks.push(Array.from({length: this.blockSize}));
    }
  }

  private findIndex(value: number): number {
    for (let i = 0; i < this._size; i++) {
      if (this.get(i) === value) {
        return i;
      }
    }

    return -1;
  }

  private get(flatIndex: number): number {
    const blockIndex = this.getBlockIndex(flatIndex);
    const position = this.getPositionInBlock(flatIndex);
    return this.blocks[blockIndex]![position]!;
  }

  private getBlockIndex(flatIndex: number): number {
    return Math.floor(flatIndex / this.blockSize);
  }

  private getPositionInBlock(flatIndex: number): number {
    return flatIndex % this.blockSize;
  }

  private set(flatIndex: number, value: number): void {
    const blockIndex = this.getBlockIndex(flatIndex);
    const position = this.getPositionInBlock(flatIndex);
    this.blocks[blockIndex]![position] = value;
  }

  private swap(i: number, j: number): void {
    const temp = this.get(i);
    this.set(i, this.get(j));
    this.set(j, temp);
  }

  private trickleDown(index: number): void {
    const lastIndex = this._size - 1;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild <= lastIndex && this.get(leftChild) < this.get(smallest)) {
        smallest = leftChild;
      }

      if (rightChild <= lastIndex && this.get(rightChild) < this.get(smallest)) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
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

  toString(): string {
    return `${BlockHeap2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: number): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'BlockHeap2', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'BlockHeap2'
  }

  includes(value: number): boolean {
    return this.contains(value)
  }
}
