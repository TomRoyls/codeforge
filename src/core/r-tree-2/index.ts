export type Rectangle = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type Entry<T> = {
  rectangle: Rectangle;
  value: T;
};

class Node<T> {
  isLeaf: boolean;
  entries: Array<{ rectangle: Rectangle; value?: T; node?: Node<T> }>;
  level: number;

  constructor(isLeaf: boolean, level: number) {
    this.isLeaf = isLeaf;
    this.entries = [];
    this.level = level;
  }
}

export class RTree2<T> {
  private root: Node<T> | null;
  private minEntries: number;
  private maxEntries: number;
  private _size: number;

  constructor(minEntries: number = 4, maxEntries: number = 9) {
    if (minEntries < 2 || maxEntries < minEntries) {
      throw new Error(`Invalid min/max entries: minEntries=${minEntries}, maxEntries=${maxEntries}`);
    }
    this.root = null;
    this.minEntries = minEntries;
    this.maxEntries = maxEntries;
    this._size = 0;
  }

  insert(rectangle: Rectangle, value: T): void {
    if (!this.root) {
      this.root = new Node<T>(true, 0);
    }

    const leaf: Entry<T> = { rectangle, value };
    const splitNode = this.insertRecursive(this.root, leaf, this.root.level);

    if (splitNode) {
      const newRoot = new Node<T>(false, this.root.level + 1);
      newRoot.entries.push({
        rectangle: this.calculateBounds(this.root),
        node: this.root,
      });
      newRoot.entries.push({
        rectangle: this.calculateBounds(splitNode),
        node: splitNode,
      });
      this.root = newRoot;
    }

    this._size++;
  }

  private insertRecursive(node: Node<T>, entry: Entry<T>, level: number): Node<T> | null {
    if (node.isLeaf) {
      node.entries.push({ rectangle: entry!.rectangle, value: entry!.value });
      if (node.entries.length <= this.maxEntries) {
        return null;
      }
      return this.splitNode(node);
    }

    let bestIndex = 0;
    let minArea = Infinity;

    for (let i = 0; i < node.entries.length; i++) {
      const area = this.area(this.combine(node.entries[i]!.rectangle, entry!.rectangle));
      if (area < minArea) {
        minArea = area;
        bestIndex = i;
      }
    }

    const splitNode = this.insertRecursive(
      node.entries[bestIndex]!.node!,
      entry,
      level - 1
    );

    if (splitNode) {
      const newEntry = {
        rectangle: this.calculateBounds(splitNode),
        node: splitNode,
      };
      node.entries[bestIndex]!.rectangle = this.calculateBounds(
        node.entries[bestIndex]!.node!
      );
      node.entries.push(newEntry);

      if (node.entries.length <= this.maxEntries) {
        return null;
      }
      return this.splitNode(node);
    }

    return null;
  }

  private splitNode(node: Node<T>): Node<T> {
    const totalEntries = node.entries.length;
    const minEntries = this.minEntries;

    let bestSeed1 = 0;
    let bestSeed2 = 1;
    let maxWaste = -Infinity;

    for (let i = 0; i < totalEntries - 1; i++) {
      for (let j = i + 1; j < totalEntries; j++) {
        const rect1 = node.entries[i]!.rectangle;
        const rect2 = node.entries[j]!.rectangle;
        const combined = this.combine(rect1, rect2);
        const waste = this.area(combined) - this.area(rect1) - this.area(rect2);
        if (waste > maxWaste) {
          maxWaste = waste;
          bestSeed1 = i;
          bestSeed2 = j;
        }
      }
    }

    const node1 = new Node<T>(node.isLeaf, node.level);
    const node2 = new Node<T>(node.isLeaf, node.level);

    node1.entries.push(node.entries[bestSeed1]!);
    node2.entries.push(node.entries[bestSeed2]!);

    const remainingIndices: number[] = [];
    for (let i = 0; i < totalEntries; i++) {
      if (i !== bestSeed1 && i !== bestSeed2) {
        remainingIndices.push(i);
      }
    }

    while (remainingIndices.length > 0) {
      const entryIndex = remainingIndices.shift()!;
      const entry = node.entries[entryIndex];

      if (
        node1.entries.length + remainingIndices.length === minEntries ||
        (node2.entries.length >= minEntries &&
          node1.entries.length < node2.entries.length)
      ) {
        node1.entries.push(entry!);
        continue;
      }

      if (
        node2.entries.length + remainingIndices.length === minEntries ||
        (node1.entries.length >= minEntries &&
          node2.entries.length < node1.entries.length)
      ) {
        node2.entries.push(entry!);
        continue;
      }

      const rect = entry!.rectangle;
      const bounds1 = this.calculateBounds(node1);
      const bounds2 = this.calculateBounds(node2);

      const area1 = this.area(bounds1);
      const area2 = this.area(bounds2);

      const expansion1 = this.area(this.combine(bounds1, rect)) - area1;
      const expansion2 = this.area(this.combine(bounds2, rect)) - area2;

      if (expansion1 < expansion2) {
        node1.entries.push(entry!);
      } else if (expansion2 < expansion1) {
        node2.entries.push(entry!);
      } else if (area1 < area2) {
        node1.entries.push(entry!);
      } else {
        node2.entries.push(entry!);
      }
    }

    node.entries = node1.entries;
    return node2;
  }

  search(point: { x: number; y: number }): T[] {
    const results: T[] = [];
    if (!this.root) {
      return results;
    }
    this.searchRecursive(this.root, point, results);
    return results;
  }

  private searchRecursive(
    node: Node<T>,
    point: { x: number; y: number },
    results: T[]
  ): void {
    for (const entry of node.entries) {
      if (this.containsPoint(entry!.rectangle, point)) {
        if (node.isLeaf) {
          if (entry!.value !== undefined) {
            results.push(entry!.value);
          }
        } else {
          this.searchRecursive(entry!.node!, point, results);
        }
      }
    }
  }

  searchArea(rectangle: Rectangle): T[] {
    const results: T[] = [];
    if (!this.root) {
      return results;
    }
    this.searchAreaRecursive(this.root, rectangle, results);
    return results;
  }

  private searchAreaRecursive(
    node: Node<T>,
    rectangle: Rectangle,
    results: T[]
  ): void {
    for (const entry of node.entries) {
      if (this.overlaps(entry!.rectangle, rectangle)) {
        if (node.isLeaf) {
          if (entry!.value !== undefined) {
            results.push(entry!.value);
          }
        } else {
          this.searchAreaRecursive(entry!.node!, rectangle, results);
        }
      }
    }
  }

  remove(rectangle: Rectangle, value: T): boolean {
    if (!this.root) {
      return false;
    }

    const reinsertEntries: Array<Entry<T>> = [];
    const found = this.removeRecursive(this.root, rectangle, value, reinsertEntries);

    if (!found) {
      return false;
    }

    for (const entry of reinsertEntries) {
      this.insertWithoutIncrement(entry!.rectangle, entry!.value);
    }

    if (this.root && !this.root.isLeaf && this.root.entries.length === 1) {
      this.root = this.root.entries[0]!.node!;
    }

    if (!this.root || this.root.entries.length === 0) {
      this.root = null;
    }

    this._size--;
    return true;
  }

  private insertWithoutIncrement(rectangle: Rectangle, value: T): void {
    if (!this.root) {
      this.root = new Node<T>(true, 0);
    }

    const leaf: Entry<T> = { rectangle, value };
    const splitNode = this.insertRecursive(this.root, leaf, this.root.level);

    if (splitNode) {
      const newRoot = new Node<T>(false, this.root.level + 1);
      newRoot.entries.push({
        rectangle: this.calculateBounds(this.root),
        node: this.root,
      });
      newRoot.entries.push({
        rectangle: this.calculateBounds(splitNode),
        node: splitNode,
      });
      this.root = newRoot;
    }
  }

  private removeRecursive(
    node: Node<T>,
    rectangle: Rectangle,
    value: T,
    reinsertEntries: Array<Entry<T>>
  ): boolean {
    let found = false;
    const toRemove: number[] = [];

    for (let i = 0; i < node.entries.length; i++) {
      const entry = node.entries[i];

      if (node.isLeaf) {
        if (
          this.equals(entry!.rectangle, rectangle) &&
          entry!.value === value
        ) {
          toRemove.push(i);
          found = true;
          break;
        }
      } else {
        if (this.overlaps(entry!.rectangle, rectangle)) {
          if (
            this.removeRecursive(entry!.node!, rectangle, value, reinsertEntries)
          ) {
            found = true;
            if (entry!.node!.entries.length < this.minEntries) {
              toRemove.push(i);
              for (const childEntry of entry!.node!.entries) {
                if (entry!.node!.isLeaf) {
                  reinsertEntries.push({
                    rectangle: childEntry.rectangle,
                    value: childEntry.value!,
                  });
                } else {
                  this.collectLeafEntries(
                    childEntry.node!,
                    reinsertEntries
                  );
                }
              }
            } else {
              entry!.rectangle = this.calculateBounds(entry!.node!);
            }
            break;
          }
        }
      }
    }

    for (const index of toRemove.sort((a, b) => b - a)) {
      node.entries.splice(index, 1);
    }

    return found;
  }

  private collectLeafEntries(
    node: Node<T>,
    entries: Array<Entry<T>>
  ): void {
    if (node.isLeaf) {
      for (const entry of node.entries) {
        entries.push({
          rectangle: entry!.rectangle,
          value: entry!.value!,
        });
      }
    } else {
      for (const entry of node.entries) {
        this.collectLeafEntries(entry!.node!, entries);
      }
    }
  }

  contains(item: T): boolean {
    if (!this.root) {
      return false;
    }
    return this.containsRecursive(this.root, item);
  }

  private containsRecursive(node: Node<T>, item: T): boolean {
    if (node.isLeaf) {
      for (const entry of node.entries) {
        if (entry!.value === item) {
          return true;
        }
      }
      return false;
    }

    for (const entry of node.entries) {
      if (this.containsRecursive(entry!.node!, item)) {
        return true;
      }
    }

    return false;
  }

  clear(): void {
    this.root = null;
    this._size = 0;
  }

  toArray(): T[] {
    const results: T[] = [];
    if (!this.root) {
      return results;
    }
    this.toArrayRecursive(this.root, results);
    return results;
  }

  private toArrayRecursive(node: Node<T>, results: T[]): void {
    if (node.isLeaf) {
      for (const entry of node.entries) {
        if (entry!.value !== undefined) {
          results.push(entry!.value);
        }
      }
    } else {
      for (const entry of node.entries) {
        this.toArrayRecursive(entry!.node!, results);
      }
    }
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  private calculateBounds(node: Node<T>): Rectangle {
    if (node.entries.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const entry of node.entries) {
      const rect = entry!.rectangle;
      minX = Math.min(minX, rect.minX);
      minY = Math.min(minY, rect.minY);
      maxX = Math.max(maxX, rect.maxX);
      maxY = Math.max(maxY, rect.maxY);
    }

    return { minX, minY, maxX, maxY };
  }

  private area(rectangle: Rectangle): number {
    return (rectangle.maxX - rectangle.minX) * (rectangle.maxY - rectangle.minY);
  }

  private combine(rect1: Rectangle, rect2: Rectangle): Rectangle {
    return {
      minX: Math.min(rect1.minX, rect2.minX),
      minY: Math.min(rect1.minY, rect2.minY),
      maxX: Math.max(rect1.maxX, rect2.maxX),
      maxY: Math.max(rect1.maxY, rect2.maxY),
    };
  }

  private containsPoint(rectangle: Rectangle, point: { x: number; y: number }): boolean {
    return (
      point.x >= rectangle.minX &&
      point.x <= rectangle.maxX &&
      point.y >= rectangle.minY &&
      point.y <= rectangle.maxY
    );
  }

  private overlaps(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect1.maxX < rect2.minX ||
      rect1.minX > rect2.maxX ||
      rect1.maxY < rect2.minY ||
      rect1.minY > rect2.maxY
    );
  }

  private equals(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.minX === rect2.minX &&
      rect1.minY === rect2.minY &&
      rect1.maxX === rect2.maxX &&
      rect1.maxY === rect2.maxY
    );
  }

  [Symbol.iterator](): Iterator<T> {
    const nodeStack: Node<T>[] = [];
    let buffer: T[] = [];
    let bi = 0;
    if (this.root !== null) nodeStack.push(this.root);
    return {
      next: () => {
        if (bi < buffer.length) {
          return { value: buffer[bi++]!, done: false };
        }
        while (nodeStack.length > 0) {
          const node = nodeStack.pop()!;
          if (node.isLeaf) {
            const vals: T[] = [];
            for (const entry of node.entries) {
              if (entry!.value !== undefined) {
                vals.push(entry!.value);
              }
            }
            buffer = vals;
            bi = 0;
            if (buffer.length > 0) {
              return { value: buffer[bi++]!, done: false };
            }
          } else {
            for (let i = node.entries.length - 1; i >= 0; i--) {
              nodeStack.push(node.entries[i]!.node!);
            }
          }
        }
        return { value: undefined as unknown as T, done: true };
      }
    };
  }

  has(item: T): boolean {
    return this.contains(item)
  }

  toString(): string {
    return `RTree2({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'RTree2', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }

  sample(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
  }

  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  frequency(item: T): number {
    let count = 0
    for (const element of this.toArray()) {
      if (element === item) count++
    }
    return count
  }

  interleave(other: T[]): T[] {
    const a = this.toArray()
    const result: T[] = []
    const maxLen = Math.max(a.length, other.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < a.length) result.push(a[i]!)
      if (i < other.length) result.push(other[i]!)
    }
    return result
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.toArray()) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  groupBy<K>(keyFn: (item: T) => K): Record<string, T[]> {
    const groups: Record<string, T[]> = {}
    for (const item of this.toArray()) {
      const key = String(keyFn(item))
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }

  groupByMap<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      const group = groups.get(key)
      if (group) {
        group.push(item)
      } else {
        groups.set(key, [item])
      }
    }
    return groups
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  minBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let minItem = arr[0]!
    let minKey = keyFn(minItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key < minKey) {
        minKey = key
        minItem = item
      }
    }
    return minItem
  }

  maxBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let maxItem = arr[0]!
    let maxKey = keyFn(maxItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key > maxKey) {
        maxKey = key
        maxItem = item
      }
    }
    return maxItem
  }

  span(predicate: (item: T) => boolean): [T[], T[]] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!)) {
      i++
    }
    return [arr.slice(0, i), arr.slice(i)]
  }

  breakWhen(predicate: (item: T) => boolean): [T[], T[]] {
    return this.span(item => !predicate(item))
  }

  scan<U>(reducer: (acc: U, item: T) => U, initialValue: U): U[] {
    const result: U[] = []
    let acc = initialValue
    for (const item of this.toArray()) {
      acc = reducer(acc, item)
      result.push(acc)
    }
    return result
  }

  flatten(depth: number = 1): T[] {
    const flat = (arr: T[], d: number): T[] => {
      const result: T[] = []
      for (const item of arr) {
        if (Array.isArray(item) && d > 0) {
          result.push(...flat(item as unknown as T[], d - 1))
        } else {
          result.push(item)
        }
      }
      return result
    }
    return flat(this.toArray(), depth)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  get [Symbol.toStringTag](): string {
    return 'RTree2'
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.toArray().map(fn)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.toArray().filter(predicate)
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduce(reducer, initialValue)
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  reduceRight<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduceRight(reducer, initialValue)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: T[]): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: T[]): T[] {
    const set = new Set(other)
    return this.toArray().filter(item => !set.has(item))
  }

  union(other: T[]): T[] {
    return [...new Set([...this.toArray(), ...other])]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  intersperse(separator: T): T[] {
    const arr = this.toArray()
    if (arr.length <= 1) return [...arr]
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) result.push(separator)
      result.push(arr[i]!)
    }
    return result
  }

  prepend(item: T): T[] {
    return [item, ...this.toArray()]
  }

  append(item: T): T[] {
    return [...this.toArray(), item]
  }

  zipWith<U, R>(other: Iterable<U>, fn: (a: T, b: U) => R): R[] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: R[] = []
    for (let i = 0; i < len; i++) {
      result.push(fn(a[i]!, b[i]!))
    }
    return result
  }

  rotate(n: number): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const k = ((n % arr.length) + arr.length) % arr.length
    return [...arr.slice(k), ...arr.slice(0, k)]
  }

  dot(this: { toArray(): number[] }, other: number[]): number {
    const a = this.toArray()
    const len = Math.min(a.length, other.length)
    let sum = 0
    for (let i = 0; i < len; i++) {
      sum += a[i]! * other[i]!
    }
    return sum
  }

  sliding(size: number, step = 1): T[][] {
    const arr = this.toArray()
    if (size <= 0 || step <= 0) return []
    const result: T[][] = []
    for (let i = 0; i + size <= arr.length; i += step) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  adjacentPairs(): [T, T][] {
    const arr = this.toArray()
    const result: [T, T][] = []
    for (let i = 0; i + 1 < arr.length; i++) {
      result.push([arr[i]!, arr[i + 1]!])
    }
    return result
  }

  transpose<U>(this: { toArray(): U[][] }): U[][] {
    const matrix = this.toArray()
    if (matrix.length === 0) return []
    const cols = Math.max(...matrix.map(r => r.length))
    const result: U[][] = []
    for (let c = 0; c < cols; c++) {
      const row: U[] = []
      for (let r = 0; r < matrix.length; r++) {
        if (c < matrix[r]!.length) {
          row.push(matrix[r]![c]!)
        }
      }
      result.push(row)
    }
    return result
  }

  countWhere(predicate: (item: T, index: number) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  associate<K, V>(fn: (item: T, index: number) => [K, V]): Map<K, V> {
    const result = new Map<K, V>()
    this.toArray().forEach((item, i) => {
      const [k, v] = fn(item, i)
      result.set(k, v)
    })
    return result
  }

  indexBy<K>(keyFn: (item: T) => K): Map<K, T> {
    const result = new Map<K, T>()
    this.toArray().forEach(item => {
      result.set(keyFn(item), item)
    })
    return result
  }

  takeWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!predicate(arr[i]!, i)) break
      result.push(arr[i]!)
    }
    return result
  }

  dropWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!, i)) {
      i++
    }
    return arr.slice(i)
  }

  gather(): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[][] = [[arr[0]!]]
    for (let i = 1; i < arr.length; i++) {
      const last = result[result.length - 1]!
      if (arr[i] === last[last.length - 1]) {
        last.push(arr[i]!)
      } else {
        result.push([arr[i]!])
      }
    }
    return result
  }

  splitWhen(predicate: (item: T, index: number) => boolean): [T[], T[]] {
    const arr = this.toArray()
    const idx = arr.findIndex(predicate)
    if (idx === -1) return [[...arr], []]
    return [arr.slice(0, idx), arr.slice(idx)]
  }

  satisfies<S extends T>(guard: (item: T) => item is S): this is { toArray(): S[] } {
    return this.every(guard)
  }

  fill(value: T, count: number): T[] {
    const arr = this.toArray()
    const pad = Array(Math.max(0, count)).fill(value) as T[]
    return [...arr, ...pad]
  }

  padStart(value: T, minLength: number): T[] {
    const arr = this.toArray()
    if (arr.length >= minLength) return [...arr]
    const pad = Array(minLength - arr.length).fill(value) as T[]
    return [...pad, ...arr]
  }

  takeRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(Math.max(0, arr.length - n))
  }

  dropRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(0, Math.max(0, arr.length - n))
  }

  firstOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[0]! : defaultValue
  }

  lastOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[arr.length - 1]! : defaultValue
  }

  elementAt(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : undefined
  }

  elementAtOrDefault(index: number, defaultValue: T): T {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : defaultValue
  }

  indexedForEach(fn: (item: T, index: number) => void): void {
    this.toArray().forEach((item, i) => fn(item, i))
  }

  occurrencesOf(value: T): number {
    return this.toArray().filter(item => item === value).length
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  unzip<K, V>(this: { toArray(): [K, V][] }): [K[], V[]] {
    const pairs = this.toArray()
    const keys: K[] = []
    const values: V[] = []
    for (const [k, v] of pairs) {
      keys.push(k)
      values.push(v)
    }
    return [keys, values]
  }

  memoize<R>(fn: (items: T[]) => R): () => R {
    let cached: R | undefined
    let computed = false
    return () => {
      if (!computed) {
        cached = fn(this.toArray())
        computed = true
      }
      return cached as R
    }
  }

  flattenDeep(this: { toArray(): any[] }): any[] {
    const result: any[] = []
    const stack = [...this.toArray()].reverse()
    while (stack.length > 0) {
      const item = stack.pop()!
      if (Array.isArray(item)) {
        stack.push(...item.reverse())
      } else {
        result.push(item)
      }
    }
    return result
  }

  cartesianProduct<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const result: [T, U][] = []
    for (const x of a) {
      for (const y of b) {
        result.push([x, y])
      }
    }
    return result
  }

  indexOf(item: T): number {
    return this.toArray().indexOf(item)
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  swap(i: number, j: number): T[] {
    const arr = [...this.toArray()]
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length || i === j) return arr
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
    return arr
  }

  sumBy(fn: (item: T) => number): number {
    return this.toArray().reduce((acc, item) => acc + fn(item), 0)
  }

  averageBy(fn: (item: T) => number): number {
    const arr = this.toArray()
    if (arr.length === 0) return 0
    return this.sumBy(fn) / arr.length
  }

  distinctUntilChanged(): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[] = [arr[0]!]
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1]) {
        result.push(arr[i]!)
      }
    }
    return result
  }
}
