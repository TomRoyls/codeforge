class ListNode<T> {
  value: T;
  next: ListNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class BloomLink2 {
  private bitArray: Uint8Array;
  private size: number;
  private hashFunctions: number;
  private itemCount: number;
  private chains: Array<ListNode<string> | null>;

  constructor(expectedItems = 1000, falsePositiveRate = 0.01) {
    const m = Math.ceil(-expectedItems * Math.log(falsePositiveRate) / (Math.log(2) ** 2));
    this.size = Math.max(1, m);
    this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
    this.hashFunctions = Math.max(1, Math.ceil(this.size / expectedItems * Math.log(2)));
    this.itemCount = 0;
    this.chains = new Array(this.size).fill(null);
  }

  private hash1(item: string): number {
    let hash = 0;
    for (let i = 0; i < item.length; i++) {
      const char = item.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return (hash >>> 0);
  }

  private hash2(item: string): number {
    let hash = 5381;
    for (let i = 0; i < item.length; i++) {
      hash = (hash * 33) ^ item.charCodeAt(i);
    }
    return (hash >>> 0);
  }

  private getHash(item: string, index: number): number {
    const h1 = this.hash1(item);
    const h2 = this.hash2(item);
    return (h1 + index * h2) % this.size;
  }

  private getBit(index: number): boolean {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.bitArray[byteIndex]! & (1 << bitIndex)) !== 0;
  }

  private setBit(index: number): void {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.bitArray[byteIndex]! |= 1 << bitIndex;
  }

  add(item: string): void {
    const primaryHash = this.getHash(item, 0);
    let node = this.chains[primaryHash]!;
    let exists = false;

    while (node !== null) {
      if (node.value === item) {
        exists = true;
        break;
      }
      node = node.next!;
    }

    if (!exists) {
      const newNode = new ListNode(item);
      newNode.next = this.chains[primaryHash]!;
      this.chains[primaryHash]! = newNode;
      this.itemCount++;

      for (let i = 0; i < this.hashFunctions; i++) {
        const hashIndex = this.getHash(item, i);
        this.setBit(hashIndex);
      }
    }
  }

  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashFunctions; i++) {
      const hashIndex = this.getHash(item, i);
      if (!this.getBit(hashIndex)) {
        return false;
      }
    }
    return true;
  }

  clear(): void {
    this.bitArray.fill(0);
    this.chains.fill(null);
    this.itemCount = 0;
  }

  count(): number {
    return this.itemCount;
  }

  falsePositiveRate(): number {
    if (this.size === 0) return 1;
    let bitsSet = 0;
    const byteCount = this.bitArray.length;
    for (let i = 0; i < byteCount; i++) {
      for (let j = 0; j < 8 && i * 8 + j < this.size; j++) {
        if (this.bitArray[i]! & (1 << j)) {
          bitsSet++;
        }
      }
    }
    const setRatio = bitsSet / this.size;
    return Math.pow(setRatio, this.hashFunctions);
  }

  fillRatio(): number {
    if (this.size === 0) return 0;
    let bitsSet = 0;
    const byteCount = this.bitArray.length;
    for (let i = 0; i < byteCount; i++) {
      for (let j = 0; j < 8 && i * 8 + j < this.size; j++) {
        if (this.bitArray[i]! & (1 << j)) {
          bitsSet++;
        }
      }
    }
    return bitsSet / this.size;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  toString(): string {
    return `BloomLink2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'BloomLink2'
  }
}
