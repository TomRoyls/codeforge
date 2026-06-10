class DoublyLinkedList4Node<T> {
  prev: DoublyLinkedList4Node<T> | null;
  value: T;
  next: DoublyLinkedList4Node<T> | null;

  constructor(value: T) {
    this.prev = null;
    this.value = value;
    this.next = null;
  }
}

export class DoublyLinkedList4<T> {
  private _head: DoublyLinkedList4Node<T> | null;
  private _tail: DoublyLinkedList4Node<T> | null;
  private _size: number;

  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  push(value: T): void {
    const newNode = new DoublyLinkedList4Node(value);
    if (this.isEmpty()) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      if (this._tail) {
        this._tail.next = newNode;
        newNode.prev = this._tail;
        this._tail = newNode;
      }
    }
    this._size++;
  }

  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const value = this._tail?.value;
    if (this._size === 1) {
      this._head = null;
      this._tail = null;
    } else {
      if (this._tail) {
        this._tail = this._tail.prev;
        if (this._tail) {
          this._tail.next = null;
        }
      }
    }
    this._size--;
    return value;
  }

  shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const value = this._head?.value;
    if (this._size === 1) {
      this._head = null;
      this._tail = null;
    } else {
      if (this._head) {
        this._head = this._head.next;
        if (this._head) {
          this._head.prev = null;
        }
      }
    }
    this._size--;
    return value;
  }

  unshift(value: T): void {
    const newNode = new DoublyLinkedList4Node(value);
    if (this.isEmpty()) {
      this._head = newNode;
      this._tail = newNode;
    } else {
      if (this._head) {
        newNode.next = this._head;
        this._head.prev = newNode;
        this._head = newNode;
      }
    }
    this._size++;
  }

  peek(): T | undefined {
    return this._head?.value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  getTimeComplexity(method: string): string {
    const complexities: Record<string, string> = {
      push: 'O(1)',
      pop: 'O(1)',
      shift: 'O(1)',
      unshift: 'O(1)',
      peek: 'O(1)',
      size: 'O(1)',
      isEmpty: 'O(1)',
      clear: 'O(1)',
      forEach: 'O(n)',
      filter: 'O(n)',
      map: 'O(n)',
      reduce: 'O(n)',
      toArray: 'O(n)',
      findLast: 'O(n)',
      findLastIndex: 'O(n)',
      reverse: 'O(n)',
      insertAt: 'O(n)',
      removeAt: 'O(n)',
      concat: 'O(n + m)'
    };
    return complexities[method] || 'Unknown';
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this._head;
    let i = 0;
    while (current) {
      callback(current.value, i);
      current = current.next;
      i++;
    }
  }

  filter(fn: (value: T, index: number) => boolean): DoublyLinkedList4<T> {
    const result = new DoublyLinkedList4<T>();
    let current = this._head;
    let i = 0;
    while (current) {
      if (fn(current.value, i)) {
        result.push(current.value);
      }
      current = current.next;
      i++;
    }
    return result;
  }

  map<U>(fn: (value: T, index: number) => U): DoublyLinkedList4<U> {
    const result = new DoublyLinkedList4<U>();
    let current = this._head;
    let i = 0;
    while (current) {
      result.push(fn(current.value, i));
      current = current.next;
      i++;
    }
    return result;
  }

  reduce<U>(fn: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue;
    let current = this._head;
    let i = 0;
    while (current) {
      acc = fn(acc, current.value, i);
      current = current.next;
      i++;
    }
    return acc;
  }

  findLast(fn: (value: T, index: number) => boolean): T | undefined {
    let current = this._tail;
    let i = this._size - 1;
    while (current) {
      if (fn(current.value, i)) {
        return current.value;
      }
      current = current.prev;
      i--;
    }
    return undefined;
  }

  findLastIndex(fn: (value: T, index: number) => boolean): number {
    let current = this._tail;
    let i = this._size - 1;
    while (current) {
      if (fn(current.value, i)) {
        return i;
      }
      current = current.prev;
      i--;
    }
    return -1;
  }

  reverse(): void {
    let current = this._head;
    while (current) {
      const temp = current.prev;
      current.prev = current.next;
      current.next = temp;
      current = current.prev;
    }
    const temp = this._head;
    this._head = this._tail;
    this._tail = temp;
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      return;
    }
    if (index === 0) {
      this.unshift(value);
    } else if (index === this._size) {
      this.push(value);
    } else {
      const newNode = new DoublyLinkedList4Node(value);
      let current = this._head;
      let i = 0;
      while (current && i < index) {
        current = current.next;
        i++;
      }
      if (current && current.prev) {
        current.prev.next = newNode;
        newNode.prev = current.prev;
        newNode.next = current;
        current.prev = newNode;
        this._size++;
      }
    }
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) {
      return undefined;
    }
    if (index === 0) {
      return this.shift();
    }
    if (index === this._size - 1) {
      return this.pop();
    }
    let current = this._head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    if (current && current.prev && current.next) {
      current.prev.next = current.next;
      current.next.prev = current.prev;
      this._size--;
      return current.value;
    }
    return undefined;
  }

  concat(other: DoublyLinkedList4<T>): DoublyLinkedList4<T> {
    const result = new DoublyLinkedList4<T>();
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    current = other._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
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

  toString(): string {
    return `${DoublyLinkedList4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'DoublyLinkedList4', size: this.size, items: this.toArray() }
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
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


  drainN(n: number): T[] {
    const result: T[] = []
    for (let i = 0; i < n && this.size > 0; i++) {
      result.push(this.pop()!)
    }
    return result
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
  }


  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
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

  get [Symbol.toStringTag](): string {
    return 'DoublyLinkedList4'
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
}
