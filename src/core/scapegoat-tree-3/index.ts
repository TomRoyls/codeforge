type Comparator<T> = (a: T, b: T) => number;

class TreeNode<T> {
    value: T;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

export class ScapegoatTree3<T> {
    private root: TreeNode<T> | null;
    private comparator: Comparator<T>;
    private alpha: number;
    private _size: number;
    private maxSize: number;

    constructor(comparator?: Comparator<T>, alpha: number = 0.7) {
        this.comparator = comparator || ((a: T, b: T) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        this.alpha = alpha;
        this.root = null;
        this._size = 0;
        this.maxSize = 0;
    }

    get size(): number {
        return this._size;
    }

    isEmpty(): boolean {
        return this._size === 0;
    }

    clear(): void {
        this.root = null;
        this._size = 0;
        this.maxSize = 0;
    }

    private subtreeSize(node: TreeNode<T> | null): number {
        if (!node) return 0;
        return 1 + this.subtreeSize(node.left) + this.subtreeSize(node.right);
    }

    private isInBalance(nodeSize: number, parentSize: number): boolean {
        return nodeSize <= this.alpha * parentSize;
    }

    private findScapegoat(node: TreeNode<T> | null, value: T, path: TreeNode<T>[]): TreeNode<T> | null {
        if (!node) return null;
        
        path.push(node);
        
        const comparison = this.comparator(value, node.value);
        
        if (comparison < 0) {
            if (!node.left) return null;
            const siblingSize = this.subtreeSize(node.right);
            const leftSize = 1 + this.subtreeSize(node.left);
            if (!this.isInBalance(leftSize, 1 + siblingSize + leftSize)) {
                return node;
            }
            return this.findScapegoat(node.left, value, path);
        } else if (comparison > 0) {
            if (!node.right) return null;
            const siblingSize = this.subtreeSize(node.left);
            const rightSize = 1 + this.subtreeSize(node.right);
            if (!this.isInBalance(rightSize, 1 + siblingSize + rightSize)) {
                return node;
            }
            return this.findScapegoat(node.right, value, path);
        }
        
        return null;
    }

    private buildBalancedTree(sortedValues: T[], start: number, end: number): TreeNode<T> | null {
        if (start >= end) return null;
        
        const mid = Math.floor((start + end) / 2);
        const node = new TreeNode(sortedValues[mid]! as T);
        node.left = this.buildBalancedTree(sortedValues, start, mid)!;
        node.right = this.buildBalancedTree(sortedValues, mid + 1, end)!;
        
        return node;
    }

    private flattenInOrder(node: TreeNode<T> | null, result: T[]): void {
        if (!node) return;
        this.flattenInOrder(node.left, result);
        result.push(node.value);
        this.flattenInOrder(node.right, result);
    }

    private rebuildSubtree(node: TreeNode<T> | null): TreeNode<T> | null {
        if (!node) return null;
        
        const values: T[] = [];
        this.flattenInOrder(node, values);
        
        return this.buildBalancedTree(values, 0, values.length);
    }

    insert(value: T): void {
        if (!this.root) {
            this.root = new TreeNode(value);
            this._size++;
            this.maxSize = Math.max(this.maxSize, this._size);
            return;
        }

        const path: TreeNode<T>[] = [];
        let current = this.root;
        
        while (true) {
            path.push(current);
            const comparison = this.comparator(value, current.value);
            
            if (comparison === 0) {
                return;
            } else if (comparison < 0) {
                if (!current.left) {
                    current.left = new TreeNode(value);
                    this._size++;
                    this.maxSize = Math.max(this.maxSize, this._size);
                    break;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = new TreeNode(value);
                    this._size++;
                    this.maxSize = Math.max(this.maxSize, this._size);
                    break;
                }
                current = current.right;
            }
        }

        const scapegoat = this.findScapegoat(this.root, value, []);
        if (scapegoat) {
            const rebuilt = this.rebuildSubtree(scapegoat);
            const idx = path.indexOf(scapegoat);
            if (idx <= 0) {
                this.root = rebuilt;
            } else {
                const sgParent = path[idx - 1]!;
                if (sgParent.left === scapegoat) {
                    sgParent.left = rebuilt;
                } else {
                    sgParent.right = rebuilt;
                }
            }
        }
    }

    delete(value: T): boolean {
        const path: TreeNode<T>[] = [];
        let current = this.root;
        let parent: TreeNode<T> | null = null;
        let isLeft = false;

        while (current) {
            path.push(current);
            const comparison = this.comparator(value, current.value);
            
            if (comparison === 0) {
                break;
            } else if (comparison < 0) {
                parent = current;
                isLeft = true;
                current = current.left;
            } else {
                parent = current;
                isLeft = false;
                current = current.right;
            }
        }

        if (!current) return false;

        let replacement: TreeNode<T> | null = null;

        if (!current.left && !current.right) {
            replacement = null;
        } else if (!current.left) {
            replacement = current.right;
        } else if (!current.right) {
            replacement = current.left;
        } else {
            let minRight = current.right;
            let minRightParent = current;
            
            while (minRight.left) {
                minRightParent = minRight;
                minRight = minRight.left;
            }
            
            replacement = new TreeNode(minRight.value);
            replacement.left = current.left;
            replacement.right = current.right;
            
            if (minRightParent !== current) {
                minRightParent.left = minRight.right;
            } else {
                replacement.right = minRight.right;
            }
        }

        if (!parent) {
            this.root = replacement;
        } else if (isLeft) {
            parent!.left = replacement;
        } else {
            parent!.right = replacement;
        }

        this._size--;

        if (this._size < this.alpha * this.maxSize) {
            this.root = this.rebuildSubtree(this.root);
            this.maxSize = this._size;
        }

        return true;
    }

    search(value: T): boolean {
        return this.contains(value);
    }

    contains(value: T): boolean {
        let current = this.root;
        
        while (current) {
            const comparison = this.comparator(value, current.value);
            
            if (comparison === 0) {
                return true;
            } else if (comparison < 0) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        
        return false;
    }

    min(): T | null {
        if (!this.root) return null;
        
        let current = this.root;
        while (current.left) {
            current = current.left;
        }
        
        return current.value;
    }

    max(): T | null {
        if (!this.root) return null;
        
        let current = this.root;
        while (current.right) {
            current = current.right;
        }
        
        return current.value;
    }

    toArray(): T[] {
        const result: T[] = [];
        this.flattenInOrder(this.root, result);
        return result;
    }

    forEach(callback: (value: T, index?: number) => void): void {
        const values = this.toArray();
        values.forEach((value, index) => callback(value, index));
    }

    height(): number {
        const calculateHeight = (node: TreeNode<T> | null): number => {
            if (!node) return 0;
            return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right));
        };
        
        return calculateHeight(this.root);
    }

  [Symbol.iterator](): Iterator<T> {
    const stack: Array<TreeNode<T>> = [];
    let current: TreeNode<T> | null = this.root;
    return {
      next(): IteratorResult<T> {
        while (current !== null || stack.length > 0) {
          while (current !== null) {
            stack.push(current);
            current = current.left;
          }
          current = stack.pop()!;
          const value = current.value;
          current = current.right;
          return { value: value as T, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      }
    };
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `ScapegoatTree3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'ScapegoatTree3', size: this.size, items: this.toArray() }
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

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }


  first(): T | undefined {
    const arr = this.toArray()
    return arr.length > 0 ? arr[0] : undefined
  }

  last(): T | undefined {
    const arr = this.toArray()
    return arr.length > 0 ? arr[arr.length - 1] : undefined
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

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
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
    return 'ScapegoatTree3'
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
    const arr = this.toArray()
    const i = n - 1
    return i >= 0 && i < arr.length ? arr[i] : undefined
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
}