export class BoyerMoore2 {
  private _pattern: string;
  private badCharTable: number[];
  private static readonly ALPHABET_SIZE = 256;

  constructor(pattern: string) {
    this._pattern = pattern;
    this.badCharTable = new Array(BoyerMoore2.ALPHABET_SIZE).fill(-1);
    this.preprocessBadChar();
  }

  private preprocessBadChar(): void {
    const len = this._pattern.length;
    for (let i = 0; i < len; i++) {
      const charCode = this._pattern.charCodeAt(i);
      this.badCharTable[charCode] = i;
    }
  }

  search(text: string): number[] {
    const matches: number[] = [];
    const patternLen = this._pattern.length;
    const textLen = text.length;

    if (patternLen === 0) {
      return [];
    }

    let i = 0;
    while (i <= textLen - patternLen) {
      let j = patternLen - 1;

      while (j >= 0 && text.charCodeAt(i + j) === this._pattern.charCodeAt(j)) {
        j--;
      }

      if (j < 0) {
        matches.push(i);
        i++;
      } else {
        const charCode = text.charCodeAt(i + j);
        const shift = Math.max(1, j - this.badCharTable[charCode]!);
        i += shift;
      }
    }

    return matches;
  }

  findFirst(text: string): number {
    const matches = this.search(text);
    return matches.length > 0 ? matches[0]! : -1;
  }

  hasMatch(text: string): boolean {
    return this.search(text).length > 0;
  }

  pattern(): string {
    return this._pattern;
  }

  toString(): string {
    return `BoyerMoore2()`
  }

  get [Symbol.toStringTag](): string {
    return 'BoyerMoore2'
  }
}
