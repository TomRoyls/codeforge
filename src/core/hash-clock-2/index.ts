function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

export class HashClock2 {
  private id: string;
  private history: string[];
  private counter: number;

  constructor(id: string) {
    this.id = id;
    this.history = [];
    this.counter = 0;
  }

  tick(): string {
    const previousHash = this.history.length > 0 ? this.history[this.history.length - 1]! : '';
    this.counter++;
    const newHash = simpleHash(previousHash + this.id + this.counter);
    this.history.push(newHash);
    return newHash;
  }

  current(): string {
    if (this.history.length === 0) {
      return '';
    }
    return this.history[this.history.length - 1]!;
  }

  merge(otherHash: string): boolean {
    if (this.history.includes(otherHash)) {
      return false;
    }
    this.history.push(otherHash);
    this.counter++;
    return true;
  }

  happenedBefore(hash: string): boolean {
    return this.history.includes(hash);
  }

  isEqual(hash: string): boolean {
    return this.current() === hash;
  }

  getId(): string {
    return this.id;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  get length(): number {
    return this.history.length;
  }
}
