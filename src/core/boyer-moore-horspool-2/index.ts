export class BoyerMooreHorspool2 {
  private _pattern: string;
  private table: number[];

  constructor(pattern: string) {
    this._pattern = pattern;
    this.table = this.buildBadCharTable(pattern);
  }

  private buildBadCharTable(pattern: string): number[] {
    const table: number[] = [];
    const patternLength = pattern.length;

    for (let i = 0; i < 256; i++) {
      table[i] = patternLength;
    }

    for (let i = 0; i < patternLength - 1; i++) {
      table[pattern.charCodeAt(i)!] = patternLength - 1 - i;
    }

    return table;
  }

  search(text: string): number[] {
    if (this._pattern.length === 0 || text.length === 0 || this._pattern.length > text.length) {
      return [];
    }

    const patternLength = this._pattern.length;
    const textLength = text.length;
    const matches: number[] = [];
    let i = patternLength - 1;

    while (i < textLength) {
      let k = 0;

      while (k < patternLength && this._pattern[patternLength - 1 - k] === text[i - k]) {
        k++;
      }

      if (k === patternLength) {
        matches.push(i - patternLength + 1);
        i++;
      } else {
        const charCode = text.charCodeAt(i)!;
        i += this.table[charCode!]!;
      }
    }

    return matches;
  }

  findFirst(text: string): number {
    const matches = this.search(text);
    return matches.length > 0 ? matches[0]! : -1;
  }

  hasMatch(text: string): boolean {
    const matches = this.search(text);
    return matches.length > 0;
  }

  pattern(): string {
    return this._pattern;
  }

  toString(): string {
    return `BoyerMooreHorspool2()`
  }

  get [Symbol.toStringTag](): string {
    return 'BoyerMooreHorspool2'
  }
}
