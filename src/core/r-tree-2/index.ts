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
}
