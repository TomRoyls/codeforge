export class FibonacciSearch4 {
  private readonly data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  private generateFibonacciNumbers(n: number): number[] {
    const fib: number[] = [0, 1];
    while (fib[fib.length - 1]! < n) {
      const next = fib[fib.length - 1]! + fib[fib.length - 2]!;
      fib.push(next);
    }
    return fib;
  }

  search(target: number): number {
    if (this.isEmpty()) {
      return -1;
    }

    const n = this.data.length;
    const fib = this.generateFibonacciNumbers(n);
    let offset = -1;

    while (fib[fib.length - 1]! > 1) {
      const i = Math.min(offset + fib[fib.length - 2]!, n - 1);

      if (this.data[i]! < target) {
        fib.pop();
        offset = i;
      } else if (this.data[i]! > target) {
        fib.pop();
        fib.pop();
      } else {
        return i;
      }
    }

    if (fib.length > 1 && this.data[offset + 1]! === target) {
      return offset + 1;
    }

    return -1;
  }

  searchFirst(target: number): number {
    if (this.isEmpty()) {
      return -1;
    }

    const n = this.data.length;
    const fib = this.generateFibonacciNumbers(n);
    let offset = -1;
    let result = -1;

    while (fib[fib.length - 1]! > 1) {
      const i = Math.min(offset + fib[fib.length - 2]!, n - 1);

      if (this.data[i]! < target) {
        fib.pop();
        offset = i;
      } else if (this.data[i]! > target) {
        fib.pop();
        fib.pop();
      } else {
        result = i;
        fib.pop();
        fib.pop();
      }
    }

    if (result === -1 && fib.length > 1 && this.data[offset + 1]! === target) {
      result = offset + 1;
    }

    if (result !== -1) {
      let first = result;
      while (first > 0 && this.data[first - 1]! === target) {
        first--;
      }
      return first;
    }

    return -1;
  }

  searchLast(target: number): number {
    if (this.isEmpty()) {
      return -1;
    }

    const n = this.data.length;
    const fib = this.generateFibonacciNumbers(n);
    let offset = -1;
    let result = -1;

    while (fib[fib.length - 1]! > 1) {
      const i = Math.min(offset + fib[fib.length - 2]!, n - 1);

      if (this.data[i]! < target) {
        fib.pop();
        offset = i;
      } else if (this.data[i]! > target) {
        fib.pop();
        fib.pop();
      } else {
        result = i;
        offset = i;
        fib.pop();
      }
    }

    if (fib.length > 1 && offset + 1 < n && this.data[offset + 1]! === target) {
      result = offset + 1;
    }

    if (result !== -1) {
      let last = result;
      while (last < n - 1 && this.data[last + 1]! === target) {
        last++;
      }
      return last;
    }

    return -1;
  }

  searchRange(target: number): [number, number] {
    const first = this.searchFirst(target);
    if (first === -1) {
      return [-1, -1];
    }
    const last = this.searchLast(target);
    return [first, last];
  }

  contains(target: number): boolean {
    return this.search(target) !== -1;
  }

  count(target: number): number {
    const [first, last] = this.searchRange(target);
    if (first === -1) {
      return 0;
    }
    return last - first + 1;
  }

  get length(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  toArray(): number[] {
    return [...this.data];
  }
}
