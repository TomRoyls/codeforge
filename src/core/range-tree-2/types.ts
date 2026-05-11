export type Comparator<T> = (a: T, b: T) => number;

export interface RangeTreeOptions<T> {
  comparator?: Comparator<T>;
}

export interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
  height: number;
}
