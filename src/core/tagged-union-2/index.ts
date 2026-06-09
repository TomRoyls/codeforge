export class TaggedUnion2<T> {
  private constructor(
    private readonly tag: string,
    private readonly value: unknown
  ) {}

  static of<U>(tag: string, value: U): TaggedUnion2<U> {
    return new TaggedUnion2<U>(tag, value)
  }

  static just<U>(value: U): TaggedUnion2<U> {
    return new TaggedUnion2<U>('just', value)
  }

  static nothing<U>(): TaggedUnion2<U> {
    return new TaggedUnion2<U>('nothing', undefined)
  }

  static left<U>(value: U): TaggedUnion2<U> {
    return new TaggedUnion2<U>('left', value)
  }

  static right<U>(value: U): TaggedUnion2<U> {
    return new TaggedUnion2<U>('right', value)
  }

  getTag(): string {
    return this.tag
  }

  getValue(): T | undefined {
    if (this.value === undefined) return undefined
    return this.value as T
  }

  is(tag: string): boolean {
    return this.tag === tag
  }

  match<U>(handlers: Record<string, (value: unknown) => U>): U {
    const handler = handlers[this.tag]
    if (handler === undefined) {
      throw new Error(`No handler for tag: ${this.tag}`)
    }
    return handler(this.value)
  }

  map<U>(fn: (value: T) => U): TaggedUnion2<U> {
    if (this.value === undefined) {
      return new TaggedUnion2<U>(this.tag, undefined)
    }
    return new TaggedUnion2<U>(this.tag, fn(this.value as T))
  }

  flatMap<U>(fn: (value: T) => TaggedUnion2<U>): TaggedUnion2<U> {
    if (this.value === undefined) {
      return new TaggedUnion2<U>(this.tag, undefined)
    }
    return fn(this.value as T)
  }

  getOrElse(defaultValue: T): T {
    if (this.value === undefined) {
      return defaultValue
    }
    return this.value as T
  }

  equals(other: TaggedUnion2<T>): boolean {
    return this.tag === other.tag && this.value === other.value
  }

  toString(): string {
    return `TaggedUnion2()`
  }
}
