export interface PersistentBitsetOptions {
  size?: number
  bits?: ReadonlyArray<number>
}

export interface BitsetIterable {
  [Symbol.iterator](): Iterator<number>
}
