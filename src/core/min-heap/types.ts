export type CompareFunction<T> = (a: T, b: T) => number

export const DEFAULT_COMPARE: CompareFunction<number> = (a, b) => a - b
