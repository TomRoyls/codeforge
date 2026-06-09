export class FMIndex2 {
  private bwt: string;
  private c: Map<string, number>;
  private occ: Map<string, number[]>;
  private originalText: string;
  private sentinel = '$';

  constructor(text: string) {
    this.originalText = text;
    this.bwt = this.computeBWT(text + this.sentinel);
    this.c = this.computeC();
    this.occ = this.computeOcc();
  }

  private computeBWT(text: string): string {
    const rotations: string[] = [];
    const n = text.length;
    for (let i = 0; i < n; i++) {
      rotations.push(text.slice(i) + text.slice(0, i));
    }
    rotations.sort();
    const lastColumn = rotations.map(r => r.charAt(r.length - 1));
    return lastColumn.join('');
  }

  private computeC(): Map<string, number> {
    const sortedChars = [...this.bwt].sort();
    const c = new Map<string, number>();
    let count = 0;
    for (let i = 0; i < sortedChars.length; i++) {
      const char = sortedChars[i]!;
      if (!c.has(char)) {
        c.set(char, count);
      }
      count++;
    }
    return c;
  }

  private computeOcc(): Map<string, number[]> {
    const occ = new Map<string, number[]>();
    const uniqueChars = [...new Set(this.bwt)].sort();
    for (const char of uniqueChars) {
      occ.set(char, new Array(this.bwt.length + 1).fill(0));
    }
    for (let i = 1; i <= this.bwt.length; i++) {
      const prevChar = this.bwt.charAt(i - 1);
      for (const char of uniqueChars) {
        const arr = occ.get(char)!;
        arr[i] = arr[i - 1]! + (char === prevChar ? 1 : 0);
      }
    }
    return occ;
  }

  private getRank(char: string, pos: number): number {
    const occArray = this.occ.get(char);
    if (occArray) {
      return occArray[pos]!;
    }
    return 0;
  }

  private getFirstOccurrence(char: string): number {
    return this.c.get(char) ?? 0;
  }

  search(pattern: string): number[] {
    if (pattern.length === 0) {
      return [0, this.bwt.length - 1];
    }
    let sp = 0;
    let ep = this.bwt.length - 1;
    for (let i = pattern.length - 1; i >= 0; i--) {
      const char = pattern.charAt(i);
      sp = this.getFirstOccurrence(char) + this.getRank(char, sp);
      ep = this.getFirstOccurrence(char) + this.getRank(char, ep + 1) - 1;
      if (sp > ep) {
        return [];
      }
    }
    return [sp, ep];
  }

  count(pattern: string): number {
    const sp = this.search(pattern)[0] ?? 0;
    const ep = this.search(pattern)[1] ?? -1;
    if (sp === 0 && ep === -1) {
      return 0;
    }
    return ep - sp + 1;
  }

  locate(pattern: string): number[] {
    const sp = this.search(pattern)[0] ?? 0;
    const ep = this.search(pattern)[1] ?? -1;
    if (sp === 0 && ep === -1) {
      return [];
    }
    const positions: number[] = [];
    for (let i = sp; i <= ep; i++) {
      let pos = i;
      let steps = 0;
      while (this.bwt.charAt(pos) !== this.sentinel && steps < this.originalText.length) {
        const char = this.bwt.charAt(pos);
        pos = this.getFirstOccurrence(char) + this.getRank(char, pos);
        steps++;
      }
      if (steps < this.originalText.length) {
        positions.push(this.originalText.length - steps);
      }
    }
    return positions.sort((a, b) => a - b);
  }

  has(pattern: string): boolean {
    return this.count(pattern) > 0;
  }

  get length(): number {
    return this.originalText.length;
  }

  toString(): string {
    return `FMIndex2()`
  }
}
