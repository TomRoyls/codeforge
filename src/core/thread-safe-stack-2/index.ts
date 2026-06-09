export class ThreadSafeStack2<T> {
  private items: T[] = [];
  private locked: boolean = false;

  constructor() {}

  push(item: T): void {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    this.items.push(item);
  }

  pop(): T | undefined {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    return this.items.pop();
  }

  peek(): T | undefined {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    if (this.items.length === 0) {
      return undefined;
    }
    return this.items[this.items.length - 1];
  }

  get size(): number {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    return this.items.length;
  }

  isEmpty(): boolean {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    return this.items.length === 0;
  }

  clear(): void {
    if (this.locked) {
      throw new Error('Stack is locked by another thread');
    }
    this.items = [];
  }

  lock(): void {
    if (this.locked) {
      throw new Error('Stack is already locked');
    }
    this.locked = true;
  }

  unlock(): void {
    if (!this.locked) {
      throw new Error('Stack is not locked');
    }
    this.locked = false;
  }

  toString(): string {
    return `ThreadSafeStack2({ size: ${this.size} })`
  }
}
