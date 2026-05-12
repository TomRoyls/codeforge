export class RunLengthQueue2<T> {
  private runs: { value: T; count: number }[];

  constructor() {
    this.runs = [];
  }

  enqueue(value: T): void {
    if (this.runs.length > 0 && this.runs[this.runs.length - 1]!.value === value) {
      this.runs[this.runs.length - 1]!.count++;
    } else {
      this.runs.push({ value, count: 1 });
    }
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    
    const run = this.runs[0]!;
    run.count--;
    
    if (run.count === 0) {
      this.runs.shift()!;
    }
    
    return run.value;
  }

  get peek(): T | undefined {
    return this.isEmpty ? undefined : this.runs[0]!.value;
  }

  get size(): number {
    return this.runs.reduce((total, run) => total + run.count, 0);
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  clear(): void {
    this.runs = [];
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const run of this.runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value);
      }
    }
    return result;
  }

  enqueueRun(value: T, count: number): void {
    if (count <= 0) {
      return;
    }
    if (this.runs.length > 0 && this.runs[this.runs.length - 1]!.value === value) {
      this.runs[this.runs.length - 1]!.count += count;
    } else {
      this.runs.push({ value, count });
    }
  }

  dequeueRun(): { value: T; count: number } | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const run = this.runs.shift()!;
    return { value: run!.value, count: run!.count };
  }

  get uniqueValues(): T[] {
    return this.runs.map(run => run.value);
  }

  get totalRuns(): number {
    return this.runs.length;
  }
}
