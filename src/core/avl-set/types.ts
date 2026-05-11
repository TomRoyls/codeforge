export interface AVLSetOptions<T> {
  comparator: (a: T, b: T) => number
}

export const DEFAULT_AVL_SET_OPTIONS: AVLSetOptions<number> = {
  comparator: (a: number, b: number): number => a - b,
}
