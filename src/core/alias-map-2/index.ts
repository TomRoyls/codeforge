export class AliasMap2<T> {
    private map: Map<string, T>;
    private aliases: Map<string, string>;

    constructor() {
        this.map = new Map();
        this.aliases = new Map();
    }

    set(key: string, value: T): void {
        this.map.set(key, value);
    }

    get(key: string): T | undefined {
        const resolved = this.resolve(key);
        return this.map.get(resolved);
    }

    has(key: string): boolean {
        const resolved = this.resolve(key);
        return this.map.has(resolved);
    }

    delete(key: string): boolean {
        if (this.aliases.has(key)) {
            return this.aliases.delete(key);
        }
        const resolved = this.resolve(key);
        for (const [alias, target] of this.aliases) {
            if (target === key || target === resolved) {
                this.aliases.delete(alias);
            }
        }
        return this.map.delete(resolved);
    }

    addAlias(alias: string, targetKey: string): boolean {
        if (alias === targetKey) {
            return false;
        }
        if (this.map.has(alias) || this.aliases.has(alias)) {
            return false;
        }
        const resolved = this.resolve(targetKey);
        if (!this.map.has(resolved)) {
            return false;
        }
        if (resolved === alias) {
            return false;
        }
        this.aliases.set(alias, targetKey);
        return true;
    }

    removeAlias(alias: string): boolean {
        return this.aliases.delete(alias);
    }

    getAliases(key: string): string[] {
        const result: string[] = [];
        for (const [alias, target] of this.aliases) {
            if (target === key || this.resolve(target) === key) {
                result.push(alias);
            }
        }
        return result;
    }

    resolve(key: string): string {
        const visited = new Set<string>();
        let current = key;
        let lastMappedKey = '';
        while (this.aliases.has(current)) {
            if (visited.has(current)) {
                return lastMappedKey || current;
            }
            visited.add(current);
            current = this.aliases.get(current) as string;
            if (this.map.has(current)) {
                lastMappedKey = current;
            }
        }
        return current;
    }

    get size(): number {
        return this.map.size;
    }

  isEmpty(): boolean {
    return this.size === 0
  }

    clear(): void {
        this.map.clear();
        this.aliases.clear();
    }

    keys(): string[] {
        return Array.from(this.map.keys());
    }

    values(): T[] {
        return Array.from(this.map.values());
    }

    entries(): [string, T][] {
        return Array.from(this.map.entries());
    }
  [Symbol.iterator]() {
    return this.entries()
  }

  toArray() {
    return this.entries()
  }

  forEach(callback: (entry: [string, T], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toString(): string {
    return `${AliasMap2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'AliasMap2', size: this.size, items: this.toArray() }
  }



  static empty<T>(): AliasMap2<T> {
    return new AliasMap2<T>()
  }

  get [Symbol.toStringTag](): string {
    return 'AliasMap2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
