export class XorTrie2 {
  private root: XorNode2;
  private bitWidth: number;
  private _count: number;

  constructor(bitWidth: number = 32) {
    this.root = new XorNode2();
    this.bitWidth = bitWidth;
    this._count = 0;
  }

  insert(value: number): void {
    let node = this.root;
    node.count++;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      if (!node.children[bit]) {
        node.children[bit] = new XorNode2();
      }
      node = node.children[bit]!;
      node.count++;
    }
    this._count++;
  }

  bulkInsert(values: number[]): void {
    for (let i = 0; i < values.length; i++) {
      this.insert(values[i]!);
    }
  }

  delete(value: number): boolean {
    if (!this.contains(value)) {
      return false;
    }
    this._delete(this.root, value, this.bitWidth - 1);
    this._count--;
    return true;
  }

  private _delete(node: XorNode2, value: number, bitIndex: number): boolean {
    if (bitIndex === -1) {
      node.count--;
      return true;
    }

    const bit = (value >>> bitIndex) & 1;
    const child = node.children[bit];
    if (child && this._delete(child, value, bitIndex - 1)) {
      if (child.count === 0) {
        node.children[bit] = null;
      }
    }
    node.count--;
    return true;
  }

  search(value: number): boolean {
    return this.contains(value);
  }

  contains(value: number): boolean {
    let node = this.root;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      if (!node.children[bit]) {
        return false;
      }
      node = node.children[bit]!;
    }
    return true;
  }

  count(value: number): number {
    return this._countValue(this.root, value, this.bitWidth - 1);
  }

  private _countValue(node: XorNode2, value: number, bitIndex: number): number {
    if (bitIndex === -1) {
      return node.count;
    }

    const bit = (value >>> bitIndex) & 1;
    if (!node.children[bit]) {
      return 0;
    }
    return this._countValue(node.children[bit]!, value, bitIndex - 1);
  }

  maxXor(value: number): number {
    if (this.isEmpty) {
      throw new Error('Cannot find max xor from empty trie');
    }
    let node = this.root;
    let result = 0;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      const opposite = 1 - bit;
      if (node.children[opposite]) {
        result = (result << 1) | 1;
        node = node.children[opposite]!;
      } else {
        result = result << 1;
        node = node.children[bit]!;
      }
    }
    return result >>> 0;
  }

  minXor(value: number): number {
    if (this.isEmpty) {
      throw new Error('Cannot find min xor from empty trie');
    }
    let node = this.root;
    let result = 0;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      if (node.children[bit]) {
        result = result << 1;
        node = node.children[bit]!;
      } else {
        result = (result << 1) | 1;
        node = node.children[1 - bit]!;
      }
    }
    return result >>> 0;
  }

  xorRange(low: number, high: number): number[] {
    if (this.isEmpty) {
      return [];
    }
    const result: number[] = [];
    this._xorRange(this.root, 0, this.bitWidth - 1, low, high, 0, result);
    return result;
  }

  private _xorRange(node: XorNode2, current: number, bitIndex: number, low: number, high: number, xor: number, result: number[]): void {
    if (bitIndex === -1) {
      if (xor >= low && xor <= high) {
        for (let i = 0; i < node.count; i++) {
          result.push(current);
        }
      }
      return;
    }

    for (let bit = 0; bit <= 1; bit++) {
      if (node.children[bit]) {
        const next = (current << 1) | bit;
        const nextXor = xor << 1;
        const nextLow = low >>> (this.bitWidth - 1 - bitIndex);
        const nextHigh = high >>> (this.bitWidth - 1 - bitIndex);

        if (this._inRange(nextXor, nextLow, nextHigh)) {
          this._xorRange(node.children[bit]!, next, bitIndex - 1, low, high, nextXor, result);
        }
      }
    }
  }

  private _inRange(xor: number, low: number, high: number): boolean {
    return xor >= (low & 1) && xor <= (high & 1);
  }

  get size(): number {
    return this._count;
  }

  get isEmpty(): boolean {
    return this._count === 0;
  }

  clear(): void {
    this.root = new XorNode2();
    this._count = 0;
  }

  getTimeComplexity(): { operation: string; complexity: string }[] {
    return [
      { operation: 'insert', complexity: 'O(bitWidth)' },
      { operation: 'bulkInsert', complexity: 'O(n * bitWidth)' },
      { operation: 'delete', complexity: 'O(bitWidth)' },
      { operation: 'search', complexity: 'O(bitWidth)' },
      { operation: 'contains', complexity: 'O(bitWidth)' },
      { operation: 'maxXor', complexity: 'O(bitWidth)' },
      { operation: 'minXor', complexity: 'O(bitWidth)' },
      { operation: 'count', complexity: 'O(bitWidth)' },
      { operation: 'xorRange', complexity: 'O(k * bitWidth)' },
      { operation: 'size', complexity: 'O(1)' },
      { operation: 'isEmpty', complexity: 'O(1)' },
      { operation: 'clear', complexity: 'O(1)' },
      { operation: 'toArray', complexity: 'O(n * bitWidth)' },
      { operation: 'forEach', complexity: 'O(n * bitWidth)' }
    ];
  }

  toArray(): number[] {
    const result: number[] = [];
    this._toArray(this.root, 0, this.bitWidth - 1, result);
    return result;
  }

  private _toArray(node: XorNode2, current: number, bitIndex: number, result: number[]): void {
    if (bitIndex === -1) {
      for (let i = 0; i < node.count; i++) {
        result.push(current);
      }
      return;
    }

    for (let bit = 0; bit <= 1; bit++) {
      if (node.children[bit]) {
        const next = (current << 1) | bit;
        this._toArray(node.children[bit]!, next, bitIndex - 1, result);
      }
    }
  }

  forEach(callback: (value: number) => void): void {
    this._forEach(this.root, 0, this.bitWidth - 1, callback);
  }

  private _forEach(node: XorNode2, current: number, bitIndex: number, callback: (value: number) => void): void {
    if (bitIndex === -1) {
      for (let i = 0; i < node.count; i++) {
        callback(current);
      }
      return;
    }

    for (let bit = 0; bit <= 1; bit++) {
      if (node.children[bit]) {
        const next = (current << 1) | bit;
        this._forEach(node.children[bit]!, next, bitIndex - 1, callback);
      }
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

  has(value: number): boolean {
    return this.contains(value)
  }

  static from(items: number[]): XorTrie2 {
    const instance = new XorTrie2()
    for (const item of items) {
      instance.insert(item as number)
    }
    return instance
  }

  toJSON() {
    return { type: 'XorTrie2', size: this.size, items: this.toArray() }
  }
}

class XorNode2 {
  children: [XorNode2 | null, XorNode2 | null];
  count: number;

  constructor() {
    this.children = [null, null];
    this.count = 0;
  }
}
