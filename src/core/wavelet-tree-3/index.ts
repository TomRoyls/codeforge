export class WaveletTree3 {
  private _length: number;
  private alphabet: string[];
  private bitvectors: number[] = [];
  private leftChild: WaveletTree3 | null;
  private rightChild: WaveletTree3 | null;
  private low: number;
  private high: number;

  constructor(input: string) {
    this._length = input.length;
    this.alphabet = [...new Set(input.split(''))].sort();
    this.leftChild = null;
    this.rightChild = null;
    this.low = 0;
    this.high = this.alphabet.length - 1;

    if (input.length > 0) {
      this.build(input, this.low, this.high);
    }
  }

  private build(input: string, low: number, high: number): void {
    this.low = low;
    this.high = high;

    if (low === high) {
      return;
    }

    const mid = Math.floor((low + high) / 2);
    const leftChars = new Set(this.alphabet.slice(low, mid + 1));
    const bits: number[] = [];

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!;
      bits.push(leftChars.has(char) ? 0 : 1);
    }

    this.bitvectors = bits;

    const leftInput: string[] = [];
    const rightInput: string[] = [];

    for (let i = 0; i < input.length; i++) {
      const bit = bits[i]!;
      const char = input[i]!;
      if (bit === 0) {
        leftInput.push(char);
      } else {
        rightInput.push(char);
      }
    }

    if (leftInput.length > 0) {
      this.leftChild = new WaveletTree3('');
      this.leftChild.alphabet = this.alphabet;
      this.leftChild._length = leftInput.length;
      this.leftChild.build(leftInput.join(''), low, mid);
    }

    if (rightInput.length > 0) {
      this.rightChild = new WaveletTree3('');
      this.rightChild.alphabet = this.alphabet;
      this.rightChild._length = rightInput.length;
      this.rightChild.build(rightInput.join(''), mid + 1, high);
    }
  }

  rank(char: string, position: number): number {
    if (position < 0 || position > this._length) {
      return 0;
    }

    if (this._length === 0) {
      return 0;
    }

    const charIndex = this.alphabet.indexOf(char);
    if (charIndex === -1) {
      return 0;
    }

    return this.rankInternal(char, position, this.low, this.high);
  }

  private rankInternal(char: string, position: number, low: number, high: number): number {
    if (low === high) {
      return position;
    }

    const mid = Math.floor((low + high) / 2);
    const charIndex = this.alphabet.indexOf(char)!;

    let count = 0;
    for (let i = 0; i < position; i++) {
      if (this.bitvectors[i]! === 0) {
        count++;
      }
    }

    if (charIndex <= mid) {
      return this.leftChild!.rankInternal(char, count, low, mid);
    } else {
      return this.rightChild!.rankInternal(char, position - count, mid + 1, high);
    }
  }

  access(index: number): string {
    if (index < 0 || index >= this._length) {
      throw new Error(`Index out of bounds: index=${index}, length=${this._length}`);
    }

    if (this._length === 0) {
      throw new Error('Empty tree');
    }

    return this.accessInternal(index, this.low, this.high);
  }

  private accessInternal(index: number, low: number, high: number): string {
    if (low === high) {
      return this.alphabet[low]!;
    }

    const bit = this.bitvectors[index]!;
    const mid = Math.floor((low + high) / 2);

    let count = 0;
    for (let i = 0; i < index; i++) {
      if (this.bitvectors[i]! === 0) {
        count++;
      }
    }

    if (bit === 0) {
      return this.leftChild!.accessInternal(count, low, mid);
    } else {
      return this.rightChild!.accessInternal(index - count, mid + 1, high);
    }
  }

  select(char: string, occurrence: number): number {
    if (occurrence < 0) {
      throw new Error('Occurrence must be non-negative');
    }

    const charIndex = this.alphabet.indexOf(char);
    if (charIndex === -1) {
      return -1;
    }

    if (occurrence >= this._length) {
      return -1;
    }

    return this.selectInternal(char, occurrence, this.low, this.high);
  }

  private selectInternal(char: string, occurrence: number, low: number, high: number): number {
    if (low === high) {
      return occurrence;
    }

    const mid = Math.floor((low + high) / 2);
    const charIndex = this.alphabet.indexOf(char)!;

    if (charIndex <= mid) {
      const leftIndex = this.leftChild!.selectInternal(char, occurrence, low, mid);
      let count = 0;
      let result = -1;
      for (let i = 0; i < this._length; i++) {
        if (this.bitvectors[i]! === 0) {
          if (count === leftIndex) {
            result = i;
            break;
          }
          count++;
        }
      }
      return result;
    } else {
      const rightIndex = this.rightChild!.selectInternal(char, occurrence, mid + 1, high);
      let count = 0;
      let result = -1;
      for (let i = 0; i < this._length; i++) {
        if (this.bitvectors[i]! === 1) {
          if (count === rightIndex) {
            result = i;
            break;
          }
          count++;
        }
      }
      return result;
    }
  }

  length(): number {
    return this._length;
  }

  toString(): string {
    const result: string[] = [];
    for (let i = 0; i < this._length; i++) {
      result.push(this.access(i));
    }
    return result.join('');
  }

  clear(): void {
    this.leftChild = null
    this.rightChild = null
    this.low = 0
  }
}
