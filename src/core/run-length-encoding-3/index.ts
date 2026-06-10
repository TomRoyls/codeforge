export class RunLengthEncoding3 {
  private runs: { char: string; count: number }[] = [];

  constructor() {}

  encode(data: string): string {
    if (data.length === 0) return "";

    this.clear();
    let currentChar = data[0]!;
    let count = 1;

    for (let i = 1; i < data.length; i++) {
      const char = data[i]!;
      if (char === currentChar) {
        count++;
      } else {
        this.append(currentChar, count);
        currentChar = char;
        count = 1;
      }
    }
    this.append(currentChar, count);

    return this.toString();
  }

  decode(encoded: string): string {
    this.clear();
    let result = "";
    let i = 0;

    if (/^\d+$/.test(encoded)) {
      const count = parseInt(encoded[0]!, 10);
      const char = encoded[1]!;
      result = char.repeat(count);
      this.append(char, count);
      return result;
    }

    while (i < encoded.length) {
      let countStr = "";
      while (i < encoded.length && /\d/.test(encoded[i]!)) {
        countStr += encoded[i]!;
        i++;
      }
      const count = parseInt(countStr, 10);
      if (i >= encoded.length) break;
      const char = encoded[i]!;
      this.append(char, count);
      result += char.repeat(count);
      i++;
    }

    return result;
  }

  append(char: string, count: number): void {
    if (this.runs.length > 0) {
      const lastRun = this.runs[this.runs.length - 1]!;
      if (lastRun.char === char) {
        lastRun.count += count;
        return;
      }
    }
    this.runs.push({ char, count });
  }

  getRuns(): { char: string; count: number }[] {
    return this.runs.map((run) => ({ ...run }));
  }

  get length(): number {
    return this.runs.reduce((total, run) => total + run.count, 0);
  }

  get runCount(): number {
    return this.runs.length;
  }

  isEmpty(): boolean {
    return this.runs.length === 0;
  }

  clear(): void {
    this.runs = [];
  }

  toString(): string {
    return this.runs.map((run) => `${run.count}${run.char}`).join("");
  }

  get [Symbol.toStringTag](): string {
    return 'RunLengthEncoding3'
  }

  get size(): number {
    return this.length
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
