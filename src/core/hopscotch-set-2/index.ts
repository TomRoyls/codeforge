export class HopscotchSet2 {
  private slots: string[];
  private deleted: boolean[];
  private bitmaps: number[];
  private count: number;
  private capacity: number;
  private readonly NEIGHBORHOOD: number = 32;

  constructor(capacity?: number) {
    this.capacity = capacity ?? 32;
    this.count = 0;
    this.slots = new Array(this.capacity).fill('');
    this.deleted = new Array(this.capacity).fill(false);
    this.bitmaps = new Array(this.capacity).fill(0);
  }

  private hash(item: string): number {
    let h = 0;
    for (let i = 0; i < item.length; i++) {
      h = Math.imul(31, h) + item.charCodeAt(i) | 0;
    }
    return h & 0x7fffffff;
  }

  private getBaseSlot(item: string): number {
    return this.hash(item) % this.capacity;
  }

  add(item: string): boolean {
    if (this.has(item)) {
      return false;
    }

    const base = this.getBaseSlot(item);
    const bitmap = this.bitmaps[base]!;
    let insertIndex = -1;
    let firstDeletedIndex = -1;

    for (let i = 0; i < this.NEIGHBORHOOD; i++) {
      const index = (base + i) % this.capacity;
      if (!this.deleted[index] && this.slots[index] === '') {
        if (insertIndex === -1) {
          insertIndex = index;
        }
      } else if (this.deleted[index] && firstDeletedIndex === -1) {
        firstDeletedIndex = index;
      }
    }

    if (insertIndex !== -1 || firstDeletedIndex !== -1) {
      const targetIndex = insertIndex !== -1 ? insertIndex : firstDeletedIndex;
      this.slots[targetIndex] = item;
      this.deleted[targetIndex] = false;
      const offset = (targetIndex - base + this.capacity) % this.capacity;
      this.bitmaps[base] = bitmap | (1 << offset);
      this.count++;
      return true;
    }

    this.resize(this.capacity * 2);
    return this.add(item);
  }

  has(item: string): boolean {
    const base = this.getBaseSlot(item);
    const bitmap = this.bitmaps[base]!;

    for (let i = 0; i < this.NEIGHBORHOOD; i++) {
      if ((bitmap & (1 << i)) !== 0) {
        const index = (base + i) % this.capacity;
        if (!this.deleted[index] && this.slots[index] === item) {
          return true;
        }
      }
    }

    return false;
  }

  delete(item: string): boolean {
    const base = this.getBaseSlot(item);
    const bitmap = this.bitmaps[base]!;

    for (let i = 0; i < this.NEIGHBORHOOD; i++) {
      if ((bitmap & (1 << i)) !== 0) {
        const index = (base + i) % this.capacity;
        if (!this.deleted[index] && this.slots[index] === item) {
          this.slots[index] = '';
          this.deleted[index] = true;
          this.count--;
          return true;
        }
      }
    }

    return false;
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      this.slots[i] = '';
      this.deleted[i] = false;
      this.bitmaps[i] = 0;
    }
    this.count = 0;
  }

  toArray(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.capacity; i++) {
      if (!this.deleted[i] && this.slots[i] !== '') {
        result.push(this.slots[i]!);
      }
    }
    return result;
  }

  forEach(callback: (item: string) => void): void {
    for (let i = 0; i < this.capacity; i++) {
      if (!this.deleted[i] && this.slots[i] !== '') {
        callback(this.slots[i]!);
      }
    }
  }

  resize(newCapacity: number): void {
    const oldSlots = this.slots;
    const oldDeleted = this.deleted;
    const oldCapacity = this.capacity;

    this.capacity = newCapacity;
    this.slots = new Array(this.capacity).fill('');
    this.deleted = new Array(this.capacity).fill(false);
    this.bitmaps = new Array(this.capacity).fill(0);
    this.count = 0;

    for (let i = 0; i < oldCapacity; i++) {
      if (!oldDeleted[i] && oldSlots[i] !== '') {
        this.add(oldSlots[i]!);
      }
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }
}
