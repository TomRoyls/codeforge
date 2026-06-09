export class ConcurrentQueue3<T> {
  private _items: T[] = [];
  private _head: number = 0;
  private _dequeueWaiters: ((value: T) => void)[] = [];
  private _enqueueWaiters: (() => void)[] = [];
  private readonly _maxSize?: number;

  constructor(maxSize?: number) {
    this._maxSize = maxSize;
  }

  private get _count(): number {
    return this._items.length - this._head;
  }

  private _compact(): void {
    if (this._head > 64 && this._head > this._items.length >> 1) {
      this._items = this._items.slice(this._head)
      this._head = 0
    }
  }

  async enqueue(item: T): Promise<void> {
    while (this._maxSize !== undefined && this._count >= this._maxSize) {
      await new Promise<void>(resolve => {
        this._enqueueWaiters.push(resolve);
      });
    }

    if (this._dequeueWaiters.length > 0) {
      const resolve = this._dequeueWaiters.shift()!;
      resolve(item);
      this._resolveEnqueueWaiters();
      return;
    }

    this._items.push(item);
  }

  async dequeue(): Promise<T> {
    if (this._head < this._items.length) {
      const item = this._items[this._head]!
      this._items[this._head] = undefined as T
      this._head++
      this._compact()
      this._resolveEnqueueWaiters();
      return item;
    }

    return new Promise<T>(resolve => {
      this._dequeueWaiters.push(resolve);
    });
  }

  peek(): T | undefined {
    if (this._head >= this._items.length) {
      return undefined;
    }
    return this._items[this._head];
  }

  get size(): number {
    return this._count;
  }

  isEmpty(): boolean {
    return this._head >= this._items.length;
  }

  clear(): void {
    this._items = [];
    this._head = 0;
    this._dequeueWaiters = [];
    this._enqueueWaiters = [];
  }

  private _resolveEnqueueWaiters(): void {
    while (this._enqueueWaiters.length > 0) {
      if (this._maxSize !== undefined && this._count >= this._maxSize) {
        break;
      }
      const resolve = this._enqueueWaiters.shift()!;
      resolve();
    }
  }

  toString(): string {
    return `${ConcurrentQueue3}({ size: ${this.size} })`
  }
}
