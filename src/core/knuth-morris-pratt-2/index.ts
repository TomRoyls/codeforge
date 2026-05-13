export class KnuthMorrisPratt2 {
  private readonly _pattern: string;
  private readonly lps: number[];

  constructor(pattern: string) {
    this._pattern = pattern;
    this.lps = this.buildLPS(pattern);
  }

  private buildLPS(pattern: string): number[] {
    const n = pattern.length;
    const lps = new Array<number>(n).fill(0);
    if (n === 0) return lps;

    let len = 0;
    let i = 1;

    while (i < n) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1]!;
        } else {
          lps[i] = 0;
          i++;
        }
      }
    }

    return lps;
  }

  search(text: string): number[] {
    const m = this._pattern.length;
    const n = text.length;
    const result: number[] = [];

    if (m === 0 || n === 0 || m > n) {
      return result;
    }

    let i = 0;
    let j = 0;

    while (i < n) {
      if (this._pattern[j] === text[i]) {
        i++;
        j++;

        if (j === m) {
          result.push(i - j);
          j = this.lps[j - 1]!;
        }
      } else {
        if (j !== 0) {
          j = this.lps[j - 1]!;
        } else {
          i++;
        }
      }
    }

    return result;
  }

  findFirst(text: string): number {
    const result = this.search(text);
    return result.length > 0 ? result[0]! : -1;
  }

  hasMatch(text: string): boolean {
    return this.search(text).length > 0;
  }

  pattern(): string {
    return this._pattern;
  }
}
