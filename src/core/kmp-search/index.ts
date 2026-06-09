export class KMPSearch {
  private lps: number[];
  private patternLength: number;

  constructor(private pattern: string) {
    this.patternLength = pattern.length;
    this.lps = KMPSearch.buildLPS(pattern);
  }

  search(text: string): number[] {
    const results: number[] = [];
    const n = text.length;
    const m = this.patternLength;

    if (m === 0) {
      for (let i = 0; i <= n; i++) {
        results.push(i);
      }
      return results;
    }

    let i = 0;
    let j = 0;

    while (i < n) {
      if (this.pattern[j] === text[i]) {
        i++;
        j++;

        if (j === m) {
          results.push(i - j);
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

    return results;
  }

  contains(text: string): boolean {
    return this.first(text) !== -1;
  }

  count(text: string): number {
    return this.search(text).length;
  }

  first(text: string): number {
    const positions = this.search(text);
    return positions.length > 0 ? positions[0]! : -1;
  }

  static search(text: string, pattern: string): number[] {
    const kmp = new KMPSearch(pattern);
    return kmp.search(text);
  }

  static buildLPS(pattern: string): number[] {
    const m = pattern.length;
    const lps = new Array<number>(m).fill(0);
    let len = 0;
    let i = 1;

    while (i < m) {
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

  has(text: string): boolean {
    return this.contains(text)
  }
}
