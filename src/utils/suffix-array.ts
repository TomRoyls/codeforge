export class SuffixArray {
  private readonly text: string;
  private readonly sa: number[];
  private readonly lcpArr: number[];

  constructor(text: string) {
    this.text = text;
    this.sa = this.buildSuffixArray();
    this.lcpArr = this.buildLCP();
  }

  get length(): number {
    return this.text.length;
  }

  get indices(): ReadonlyArray<number> {
    return this.sa;
  }

  index(i: number): number {
    if (i < 0 || i >= this.sa.length) {
      throw new RangeError(`Index out of bounds: ${i}`);
    }
    return this.sa[i]!;
  }

  toArray(): number[] {
    return [...this.sa];
  }

  lcp(i: number): number {
    if (i < 0 || i >= this.lcpArr.length) {
      throw new RangeError(`Index out of bounds: ${i}`);
    }
    return this.lcpArr[i]!;
  }

  longestRepeatedSubstring(): string {
    if (this.sa.length === 0) return '';

    let maxLen = 0;
    let maxIdx = 0;

    for (let i = 1; i < this.lcpArr.length; i++) {
      if (this.lcpArr[i]! > maxLen) {
        maxLen = this.lcpArr[i]!;
        maxIdx = i;
      }
    }

    if (maxLen === 0) return '';

    const start = this.sa[maxIdx]!;
    return this.text.slice(start, start + maxLen);
  }

  search(pattern: string): number[] {
    if (pattern.length === 0 || this.text.length === 0) {
      return [];
    }

    const lower = this.lowerBound(pattern);
    const upper = this.upperBound(pattern);

    if (lower >= upper) {
      return [];
    }

    const result: number[] = [];
    for (let i = lower; i < upper; i++) {
      result.push(this.sa[i]!);
    }

    return result.sort((a, b) => a - b);
  }

  contains(pattern: string): boolean {
    return this.search(pattern).length > 0;
  }

  count(pattern: string): number {
    if (pattern.length === 0 || this.text.length === 0) {
      return 0;
    }

    const lower = this.lowerBound(pattern);
    const upper = this.upperBound(pattern);

    return upper - lower;
  }

  longestCommonPrefix(k: number): number {
    if (k <= 0 || k >= this.sa.length) {
      return 0;
    }

    return this.lcpArr[k]!;
  }

  allLCP(): number[] {
    return [...this.lcpArr];
  }

  toString(): string {
    return JSON.stringify(this.sa);
  }

  toJSON(): number[] {
    return [...this.sa];
  }

  clone(): SuffixArray {
    return new SuffixArray(this.text);
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SuffixArray)) return false;
    if (this.text !== other.text) return false;
    if (this.sa.length !== other.sa.length) return false;
    for (let i = 0; i < this.sa.length; i++) {
      if (this.sa[i] !== other.sa[i]) return false;
    }
    return true;
  }

  private buildSuffixArray(): number[] {
    const n = this.text.length;
    if (n === 0) {
      return [];
    }

    const sa: number[] = [];
    for (let i = 0; i < n; i++) {
      sa.push(i);
    }

    const rank: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      rank[i] = this.text.charCodeAt(i);
    }

    let k = 1;
    while (k < n) {
      sa.sort((a, b) => {
        if (rank[a]! !== rank[b]!) {
          return rank[a]! - rank[b]!;
        }
        const ra = a + k < n ? rank[a + k]! : -1;
        const rb = b + k < n ? rank[b + k]! : -1;
        return ra - rb;
      });

      const temp: number[] = new Array(n);
      temp[sa[0]!] = 0;
      for (let i = 1; i < n; i++) {
        const prev = sa[i - 1]!;
        const curr = sa[i]!;

        if (rank[prev]! !== rank[curr]!) {
          temp[curr] = temp[prev]! + 1;
        } else {
          const prevRank = prev + k < n ? rank[prev + k]! : -1;
          const currRank = curr + k < n ? rank[curr + k]! : -1;
          temp[curr] = prevRank === currRank ? temp[prev]! : temp[prev]! + 1;
        }
      }

      for (let i = 0; i < n; i++) {
        rank[i] = temp[i]!;
      }

      k *= 2;
    }

    return sa;
  }

  private buildLCP(): number[] {
    const n = this.sa.length;
    if (n === 0) {
      return [];
    }

    const lcp: number[] = new Array(n);
    const rank: number[] = new Array(n);

    for (let i = 0; i < n; i++) {
      rank[this.sa[i]!] = i;
    }

    let h = 0;
    for (let i = 0; i < n; i++) {
      const r = rank[i]!;
      if (r > 0) {
        const j = this.sa[r - 1]!;
        while (i + h < n && j + h < n && this.text[i + h]! === this.text[j + h]!) {
          h++;
        }
        lcp[r] = h;
        if (h > 0) {
          h--;
        }
      } else {
        lcp[r] = 0;
      }
    }

    return lcp;
  }

  private lowerBound(pattern: string): number {
    let left = 0;
    let right = this.sa.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffixStart = this.sa[mid]!;
      const cmp = this.compareSuffix(suffixStart, pattern);

      if (cmp < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  private upperBound(pattern: string): number {
    let left = 0;
    let right = this.sa.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffixStart = this.sa[mid]!;
      const cmp = this.compareSuffix(suffixStart, pattern);

      if (cmp <= 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  private compareSuffix(suffixStart: number, pattern: string): number {
    for (let i = 0; i < pattern.length; i++) {
      const textIdx = suffixStart + i;
      if (textIdx >= this.text.length) {
        return -1;
      }
      const tc = this.text.charCodeAt(textIdx);
      const pc = pattern.charCodeAt(i);
      if (tc !== pc) {
        return tc - pc;
      }
    }
    return 0;
  }
}