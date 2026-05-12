export class AATree2<T> {
  constructor(comparator?: (a: T, b: T) => number);
  get size(): number;
  isEmpty(): boolean;
  clear(): void;
  insert(value: T): this;
  delete(value: T): this;
  search(value: T): boolean;
  contains(value: T): boolean;
  min(): T | null;
  max(): T | null;
  toArray(): T[];
  forEach(callback: (value: T, index: number) => void): void;
  height(): number;
}
