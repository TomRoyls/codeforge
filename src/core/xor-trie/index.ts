export class XorTrie {
  private root: XorNode;
  private bitWidth: number;
  private count: number;

  constructor(bitWidth: number = 32) {
    this.root = new XorNode();
    this.bitWidth = bitWidth;
    this.count = 0;
  }

  insert(value: number): void {
    let node = this.root;
    node.count++;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      if (!node.children[bit]) {
        node.children[bit] = new XorNode();
      }
      node = node.children[bit];
      node.count++;
    }
    this.count++;
  }

  remove(value: number): boolean {
    if (!this.contains(value)) {
      return false;
    }
    this._remove(this.root, value, this.bitWidth - 1);
    this.count--;
    return true;
  }

  private _remove(node: XorNode, value: number, bitIndex: number): boolean {
    if (bitIndex === -1) {
      node.count--;
      return true;
    }

    const bit = (value >>> bitIndex) & 1;
    const child = node.children[bit];
    if (child && this._remove(child, value, bitIndex - 1)) {
      if (child.count === 0) {
        node.children[bit] = null;
      }
    }
    node.count--;
    return true;
  }

  contains(value: number): boolean {
    let node = this.root;
    for (let i = this.bitWidth - 1; i >= 0; i--) {
      const bit = (value >>> i) & 1;
      if (!node.children[bit]) {
        return false;
      }
      node = node.children[bit];
    }
    return true;
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

  countXorPairs(value: number, target: number): number {
    return this._countXorPairs(this.root, value, target, this.bitWidth - 1);
  }

  private _countXorPairs(node: XorNode, value: number, target: number, bitIndex: number): number {
    if (bitIndex === -1) {
      return node.count;
    }

    const valueBit = (value >>> bitIndex) & 1;
    const targetBit = (target >>> bitIndex) & 1;

    let result = 0;
    for (let childBit = 0; childBit <= 1; childBit++) {
      if (node.children[childBit]) {
        const xorBit = valueBit ^ childBit;
        if (xorBit === targetBit) {
          result += this._countXorPairs(node.children[childBit]!, value, target, bitIndex - 1);
        }
      }
    }
    return result;
  }

  get size(): number {
    return this.count;
  }

  get isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.root = new XorNode();
    this.count = 0;
  }

  toArray(): number[] {
    const result: number[] = [];
    this._toArray(this.root, 0, this.bitWidth - 1, result);
    return result;
  }

  private _toArray(node: XorNode, current: number, bitIndex: number, result: number[]): void {
    if (bitIndex === -1) {
      result.push(current);
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

  private _forEach(node: XorNode, current: number, bitIndex: number, callback: (value: number) => void): void {
    if (bitIndex === -1) {
      callback(current);
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

  static from(items: number[]): XorTrie {
    const instance = new XorTrie()
    for (const item of items) {
      instance.insert(item as number)
    }
    return instance
  }
}

class XorNode {
  children: [XorNode | null, XorNode | null];
  count: number;

  constructor() {
    this.children = [null, null];
    this.count = 0;
  }
}
