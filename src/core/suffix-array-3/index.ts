export class SuffixArray3 {
  private text: string;
  private suffixArray: number[];

  constructor(text: string) {
    this.text = text;
    this.suffixArray = this.buildSuffixArray(text);
  }

  private buildSuffixArray(text: string): number[] {
    const n = text.length;
    const suffixes: number[] = [];

    for (let i = 0; i < n; i++) {
      suffixes.push(i);
    }

    suffixes.sort((a, b) => {
      const suffixA = text.slice(a);
      const suffixB = text.slice(b);
      if (suffixA < suffixB) return -1;
      if (suffixA > suffixB) return 1;
      return 0;
    });

    return suffixes;
  }

  search(pattern: string): number[] {
    if (pattern === '') {
      return Array.from({ length: this.suffixArray.length }, (_, i) => i);
    }

    let left = 0;
    let right = this.suffixArray.length - 1;
    const indices: number[] = [];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const suffixIndex = this.suffixArray[mid];
      const suffix = this.text.slice(suffixIndex);

      if (suffix.startsWith(pattern)) {
        let i = mid;
        while (i >= 0) {
          const idx = this.suffixArray[i];
          if (idx === undefined || !this.text.slice(idx).startsWith(pattern)) break;
          indices.push(idx);
          i--;
        }
        i = mid + 1;
        while (i < this.suffixArray.length) {
          const idx = this.suffixArray[i];
          if (idx === undefined || !this.text.slice(idx).startsWith(pattern)) break;
          indices.push(idx);
          i++;
        }
        indices.sort((a, b) => a - b);
        return indices;
      }

      if (suffix < pattern) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return indices;
  }

  count(pattern: string): number {
    return this.search(pattern).length;
  }

  has(pattern: string): boolean {
    return this.count(pattern) > 0;
  }

  get length(): number {
    return this.suffixArray.length;
  }

  getSuffix(index: number): string {
    if (index < 0 || index >= this.suffixArray.length) {
      throw new Error(`Index out of bounds: index=${index}, length=${this.suffixArray.length}`);
    }
    return this.text.slice(this.suffixArray[index]);
  }

  toArray(): string[] {
    return this.suffixArray.map(i => this.text.slice(i));
  }

  indexOf(suffixIndex: number): number {
    if (suffixIndex < 0 || suffixIndex >= this.text.length) {
      throw new Error('Suffix index out of bounds');
    }
    return this.suffixArray.indexOf(suffixIndex);
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
    return `SuffixArray3({ size: ${this.suffixArray.length} })`
  }

  toJSON() {
    return { type: 'SuffixArray3', items: this.toArray() }
  }
}
