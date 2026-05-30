export class TreeNode<T> {
  constructor(
    public value: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null,
  ) {}
}

export function* morrisInorder<T>(root: TreeNode<T> | null): Generator<T> {
  let current = root
  while (current !== null) {
    if (current.left === null) {
      yield current.value
      current = current.right
    } else {
      const predecessor = findPredecessor(current)
      if (predecessor.right === null) {
        predecessor.right = current
        current = current.left
      } else {
        predecessor.right = null
        yield current.value
        current = current.right
      }
    }
  }
}

export function* morrisPreorder<T>(root: TreeNode<T> | null): Generator<T> {
  let current = root
  while (current !== null) {
    if (current.left === null) {
      yield current.value
      current = current.right
    } else {
      const predecessor = findPredecessor(current)
      if (predecessor.right === null) {
        predecessor.right = current
        yield current.value
        current = current.left
      } else {
        predecessor.right = null
        current = current.right
      }
    }
  }
}

export function morrisPostorder<T>(root: TreeNode<T> | null): T[] {
  const dummy = new TreeNode<T>(undefined as T, root, null)
  let current: TreeNode<T> | null = dummy
  const result: T[] = []

  while (current !== null) {
    if (current.left === null) {
      current = current.right
    } else {
      const predecessor = findPredecessor(current)
      if (predecessor.right === null) {
        predecessor.right = current
        current = current.left
      } else {
        predecessor.right = null
        collectReverse(current.left, predecessor, result)
        current = current.right
      }
    }
  }

  return result
}

function findPredecessor<T>(node: TreeNode<T>): TreeNode<T> {
  let pred = node.left!
  while (pred.right !== null && pred.right !== node) {
    pred = pred.right
  }
  return pred
}

function collectReverse<T>(from: TreeNode<T>, to: TreeNode<T>, result: T[]): void {
  reverse(from, to)
  let current: TreeNode<T> | null = to
  while (current !== from) {
    result.push(current.value)
    current = current.right
  }
  result.push(from.value)
  reverse(to, from)
}

function reverse<T>(from: TreeNode<T>, to: TreeNode<T>): void {
  let prev: TreeNode<T> | null = null
  let current: TreeNode<T> | null = from
  while (current !== to) {
    const next = current!.right
    current!.right = prev
    prev = current
    current = next
  }
  current!.right = prev
}
