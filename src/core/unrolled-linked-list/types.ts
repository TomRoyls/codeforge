export interface UnrolledLinkedListNode<T> {
  elements: T[];
  count: number;
  next: UnrolledLinkedListNode<T> | null;
  prev: UnrolledLinkedListNode<T> | null;
}
