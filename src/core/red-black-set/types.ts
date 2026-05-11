export type CompareFunction<T> = (a: T, b: T) => number

export interface RedBlackSetOptions<T> {
  compare?: CompareFunction<T>
}
