export interface FingerprintSetOptions<T> {
  hashBits?: number
  serialize?: (value: T) => string
}
