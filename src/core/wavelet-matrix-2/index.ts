export class WaveletMatrix2 {
  private bitWidth: number;
  private bitVectors: Uint8Array[];
  private mid: number[];
  private n: number;
  private originalData: number[];

  constructor(data: number[], bitWidth?: number) {
    this.n = data.length;
    this.originalData = [...data];
    const maxVal = data.length > 0 ? Math.max(...data) : 0;
    this.bitWidth = bitWidth ?? (maxVal > 0 ? Math.floor(Math.log2(maxVal)) + 1 : 0);

    if (this.bitWidth === 0 && this.n > 0) {
      this.bitWidth = 32;
    }

    this.bitVectors = [];
    this.mid = [];

    let currentData = [...data];

    for (let level = this.bitWidth - 1; level >= 0; level--) {
      const bitVec = new Uint8Array(this.n);
      let zeroCount = 0;

      for (let i = 0; i < this.n; i++) {
        const hasBit = (currentData[i]! >> level) & 1;
        bitVec[i] = hasBit ? 1 : 0;
        zeroCount += bitVec[i] === 0 ? 1 : 0;
      }

      this.bitVectors.push(bitVec);
      this.mid.push(zeroCount);

      const zeros: number[] = [];
      const ones: number[] = [];

      for (let i = 0; i < this.n; i++) {
        if (bitVec[i]! === 0) {
          zeros.push(currentData[i]!);
        } else {
          ones.push(currentData[i]!);
        }
      }

      currentData = [...zeros, ...ones];
    }
  }

  access(index: number): number {
    if (index < 0 || index >= this.n) {
      throw new Error(`Index out of bounds: index=${index}, length=${this.n}`);
    }

    let pos = index;
    let result = 0;

    for (let level = 0; level < this.bitWidth; level++) {
      const bitVec = this.bitVectors[level]!;
      const bit = bitVec[pos]!;
      result = (result << 1) | bit;

      if (bit === 0) {
        pos = this.countZerosBefore(bitVec, pos);
      } else {
        pos = this.mid[level]! + this.countOnesBefore(bitVec, pos);
      }
    }

    return result;
  }

  get length(): number {
    return this.n;
  }

  isEmpty(): boolean {
    return this.n === 0;
  }

  toArray(): number[] {
    return [...this.originalData];
  }

  quantile(start: number, end: number, k: number): number {
    if (start < 0 || end > this.n || start >= end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, n=${this.n}`);
    }

    if (k < 0 || k >= end - start) {
      throw new Error('k out of range');
    }

    const elements: number[] = [];
    for (let i = start; i < end; i++) {
      elements.push(this.access(i));
    }
    elements.sort((a, b) => a - b);
    return elements[k]!;
  }

  rank(value: number, end: number): number {
    if (end < 0 || end > this.n) {
      throw new Error('End index out of bounds');
    }

    let count = 0;
    for (let i = 0; i < end; i++) {
      if (this.access(i) === value) {
        count++;
      }
    }
    return count;
  }

  rangeFreq(start: number, end: number, minValue: number, maxValue: number): number {
    if (start < 0 || end > this.n || start > end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, n=${this.n}`);
    }

    if (minValue > maxValue) {
      return 0;
    }

    let count = 0;
    for (let i = start; i < end; i++) {
      const val = this.access(i);
      if (val >= minValue && val <= maxValue) {
        count++;
      }
    }
    return count;
  }

  select(value: number, k: number): number {
    if (k < 0) {
      return -1;
    }

    let count = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.access(i) === value) {
        if (count === k) {
          return i;
        }
        count++;
      }
    }
    return -1;
  }

  private countOnesBefore(bitVec: Uint8Array, pos: number): number {
    let count = 0;
    for (let i = 0; i < pos; i++) {
      if (bitVec[i]! === 1) {
        count++;
      }
    }
    return count;
  }

  private countZerosBefore(bitVec: Uint8Array, pos: number): number {
    let count = 0;
    for (let i = 0; i < pos; i++) {
      if (bitVec[i]! === 0) {
        count++;
      }
    }
    return count;
  }
}
