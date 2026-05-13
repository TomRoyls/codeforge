/// <reference lib="ES2022" />

type ObjectKey = object;
type PrimitiveKey = string | number | bigint | boolean | symbol | null | undefined;
type Key = ObjectKey | PrimitiveKey;

interface ObjectEntry<K extends ObjectKey, V> {
  weakRef: WeakRef<K>;
  value: V;
  symbol: symbol;
  unregisterToken: object;
}

class WeakHashMap2<K extends Key, V> {
  private primitiveEntries = new Map<PrimitiveKey, V>();
  private objectEntries = new Map<symbol, ObjectEntry<ObjectKey, V>>();
  private weakMap = new WeakMap<ObjectKey, symbol>();
  private registry = new FinalizationRegistry<symbol>((symbol) => {
    this.objectEntries.delete(symbol);
  });
  private sizeCounter = 0;

  set(key: K, value: V): void {
    if (this.isObject(key)) {
      const objKey = key as ObjectKey;
      const existingSymbol = this.weakMap.get(objKey);
      if (existingSymbol !== undefined) {
        const entry = this.objectEntries.get(existingSymbol)!;
        entry.value = value;
      } else {
        const sym = Symbol();
        const weakRef = new WeakRef(objKey);
        const unregisterToken = {};
        this.objectEntries.set(sym, { weakRef, value, symbol: sym, unregisterToken });
        this.weakMap.set(objKey, sym);
        this.registry.register(objKey, sym, unregisterToken);
        this.sizeCounter++;
      }
    } else {
      this.primitiveEntries.set(key as PrimitiveKey, value);
      this.sizeCounter++;
    }
  }

  get(key: K): V | undefined {
    if (this.isObject(key)) {
      const objKey = key as ObjectKey;
      const symbol = this.weakMap.get(objKey);
      if (symbol === undefined) return undefined;
      const entry = this.objectEntries.get(symbol);
      if (!entry) return undefined;
      return entry.value;
    }
    return this.primitiveEntries.get(key as PrimitiveKey);
  }

  has(key: K): boolean {
    if (this.isObject(key)) {
      const objKey = key as ObjectKey;
      const symbol = this.weakMap.get(objKey);
      if (symbol === undefined) return false;
      return this.objectEntries.has(symbol);
    }
    return this.primitiveEntries.has(key as PrimitiveKey);
  }

  delete(key: K): boolean {
    if (this.isObject(key)) {
      const objKey = key as ObjectKey;
      const symbol = this.weakMap.get(objKey);
      if (symbol === undefined) return false;
      this.weakMap.delete(objKey);
      const entry = this.objectEntries.get(symbol);
      if (!entry) return false;
      const existed = this.objectEntries.delete(symbol);
      this.registry.unregister(entry.unregisterToken);
      if (existed) this.sizeCounter--;
      return existed;
    }
    const existed = this.primitiveEntries.delete(key as PrimitiveKey);
    if (existed) this.sizeCounter--;
    return existed;
  }

  clear(): void {
    this.primitiveEntries.clear();
    this.objectEntries.forEach((entry, symbol) => {
      this.registry.unregister(entry.unregisterToken);
    });
    this.objectEntries.clear();
    this.sizeCounter = 0;
  }

  get size(): number {
    return this.sizeCounter;
  }

  private isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
  }
}

export { WeakHashMap2 };
