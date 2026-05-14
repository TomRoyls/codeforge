export class Tree<T> {
  constructor(
    private value: T,
    private left?: Tree<T>,
    private right?: Tree<T>
  ) {}

  getValue(): T {
    return this.value;
  }

  getLeft(): Tree<T> | undefined {
    return this.left;
  }

  getRight(): Tree<T> | undefined {
    return this.right;
  }

  isLeaf(): boolean {
    return !this.left && !this.right;
  }

  map<U>(fn: (value: T) => U): Tree<U> {
    return new Tree<U>(
      fn(this.value),
      this.left?.map(fn),
      this.right?.map(fn)
    );
  }
}

type Path<T> = {
  tree: Tree<T>;
  parent?: Path<T>;
  direction: 'left' | 'right';
};

export class Zipper<T> {
  private constructor(
    private focus: Tree<T>,
    private path?: Path<T>
  ) {}

  static fromTree<T>(tree: Tree<T>): Zipper<T> {
    return new Zipper(tree);
  }

  goLeft(): Zipper<T> | null {
    const left = this.focus.getLeft();
    if (!left) {
      return null;
    }
    const newPath: Path<T> = {
      tree: this.focus,
      parent: this.path,
      direction: 'left'
    };
    return new Zipper<T>(left, newPath);
  }

  goRight(): Zipper<T> | null {
    const right = this.focus.getRight();
    if (!right) {
      return null;
    }
    const newPath: Path<T> = {
      tree: this.focus,
      parent: this.path,
      direction: 'right'
    };
    return new Zipper<T>(right, newPath);
  }

  goUp(): Zipper<T> | null {
    if (!this.path) {
      return null;
    }
    const { tree, parent, direction } = this.path;
    const newFocus = this.reconstructTree(tree, direction);
    return new Zipper<T>(newFocus, parent);
  }

  toTree(): Tree<T> {
    let currentFocus = this.focus;
    let currentPath = this.path;

    while (currentPath) {
      const { tree, parent, direction } = currentPath;
      currentFocus = this.reconstructTree(tree, direction);
      currentPath = parent;
    }

    return currentFocus;
  }

  getValue(): T {
    return this.focus.getValue();
  }

  setValue(value: T): Zipper<T> {
    const newFocus = new Tree<T>(
      value,
      this.focus.getLeft(),
      this.focus.getRight()
    );
    return new Zipper<T>(newFocus, this.path);
  }

  insertLeft(tree: Tree<T>): Zipper<T> {
    const newFocus = new Tree<T>(
      this.focus.getValue(),
      tree,
      this.focus.getRight()
    );
    return new Zipper<T>(newFocus, this.path);
  }

  insertRight(tree: Tree<T>): Zipper<T> {
    const newFocus = new Tree<T>(
      this.focus.getValue(),
      this.focus.getLeft(),
      tree
    );
    return new Zipper<T>(newFocus, this.path);
  }

  delete(): Zipper<T> | null {
    if (this.path) {
      const { tree, parent, direction } = this.path;
      
      let newParent: Tree<T>;
      if (direction === 'left') {
        newParent = new Tree<T>(
          tree.getValue(),
          undefined,
          tree.getRight()
        );
      } else {
        newParent = new Tree<T>(
          tree.getValue(),
          tree.getLeft(),
          undefined
        );
      }
      
      return new Zipper<T>(newParent, parent);
    }
    return null;
  }

  isRoot(): boolean {
    return !this.path;
  }

  getPath(): string {
    if (!this.path) {
      return '';
    }
    const steps: string[] = [];
    let current: Path<T> | undefined = this.path;
    while (current) {
      steps.unshift(current.direction === 'left' ? 'L' : 'R');
      current = current.parent;
    }
    return steps.join('');
  }

  private reconstructTree(original: Tree<T>, direction: 'left' | 'right'): Tree<T> {
    if (direction === 'left') {
      return new Tree<T>(
        original.getValue(),
        this.focus,
        original.getRight()
      );
    } else {
      return new Tree<T>(
        original.getValue(),
        original.getLeft(),
        this.focus
      );
    }
  }
}
