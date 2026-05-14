import { describe, it, expect } from 'vitest';
import { Tree, Zipper } from '../src/core/zipper-tree-2/index.js';

describe('ZipperTree2', () => {
  describe('Tree', () => {
    it('should create a tree with a value', () => {
      const tree = new Tree<number>(1);
      expect(tree.getValue()).toBe(1);
    });

    it('should create a tree with left child', () => {
      const left = new Tree<number>(2);
      const tree = new Tree<number>(1, left);
      expect(tree.getLeft()).toBe(left);
    });

    it('should create a tree with right child', () => {
      const right = new Tree<number>(3);
      const tree = new Tree<number>(1, undefined, right);
      expect(tree.getRight()).toBe(right);
    });

    it('should create a tree with both children', () => {
      const left = new Tree<number>(2);
      const right = new Tree<number>(3);
      const tree = new Tree<number>(1, left, right);
      expect(tree.getLeft()).toBe(left);
      expect(tree.getRight()).toBe(right);
    });

    it('should return undefined for missing left child', () => {
      const tree = new Tree<number>(1);
      expect(tree.getLeft()).toBeUndefined();
    });

    it('should return undefined for missing right child', () => {
      const tree = new Tree<number>(1);
      expect(tree.getRight()).toBeUndefined();
    });

    it('should identify a node as leaf when it has no children', () => {
      const tree = new Tree<number>(1);
      expect(tree.isLeaf()).toBe(true);
    });

    it('should identify a node as not leaf when it has left child', () => {
      const left = new Tree<number>(2);
      const tree = new Tree<number>(1, left);
      expect(tree.isLeaf()).toBe(false);
    });

    it('should identify a node as not leaf when it has right child', () => {
      const right = new Tree<number>(3);
      const tree = new Tree<number>(1, undefined, right);
      expect(tree.isLeaf()).toBe(false);
    });

    it('should identify a node as not leaf when it has both children', () => {
      const left = new Tree<number>(2);
      const right = new Tree<number>(3);
      const tree = new Tree<number>(1, left, right);
      expect(tree.isLeaf()).toBe(false);
    });

    it('should map values over a leaf tree', () => {
      const tree = new Tree<number>(1);
      const result = tree.map(x => x * 2);
      expect(result.getValue()).toBe(2);
      expect(result.isLeaf()).toBe(true);
    });

    it('should map values over a tree with left child', () => {
      const tree = new Tree<number>(1, new Tree<number>(2));
      const result = tree.map(x => x * 2);
      expect(result.getValue()).toBe(2);
      expect(result.getLeft()?.getValue()).toBe(4);
      expect(result.isLeaf()).toBe(false);
    });

    it('should map values over a tree with right child', () => {
      const tree = new Tree<number>(1, undefined, new Tree<number>(3));
      const result = tree.map(x => x * 2);
      expect(result.getValue()).toBe(2);
      expect(result.getRight()?.getValue()).toBe(6);
      expect(result.isLeaf()).toBe(false);
    });

    it('should map values over a tree with both children', () => {
      const tree = new Tree<number>(
        1,
        new Tree<number>(2),
        new Tree<number>(3)
      );
      const result = tree.map(x => x * 2);
      expect(result.getValue()).toBe(2);
      expect(result.getLeft()?.getValue()).toBe(4);
      expect(result.getRight()?.getValue()).toBe(6);
    });

    it('should map values to different type', () => {
      const tree = new Tree<number>(1);
      const result = tree.map(x => x.toString());
      expect(result.getValue()).toBe('1');
    });
  });

  describe('Zipper', () => {
    describe('fromTree', () => {
      it('should create a zipper from a leaf tree', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        expect(zipper.getValue()).toBe(1);
      });

      it('should create a zipper from a tree with children', () => {
        const tree = new Tree<number>(1, new Tree<number>(2), new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        expect(zipper.getValue()).toBe(1);
      });
    });

    describe('getValue', () => {
      it('should return the value of the focused node', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        expect(zipper.getValue()).toBe(1);
      });

      it('should return the value of a left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        expect(leftZipper?.getValue()).toBe(2);
      });
    });

    describe('isRoot', () => {
      it('should return true when at root', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        expect(zipper.isRoot()).toBe(true);
      });

      it('should return false when not at root', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        expect(leftZipper?.isRoot()).toBe(false);
      });

      it('should return true after going up from left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const upZipper = leftZipper?.goUp();
        expect(upZipper?.isRoot()).toBe(true);
      });
    });

    describe('getPath', () => {
      it('should return empty string at root', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        expect(zipper.getPath()).toBe('');
      });

      it('should return L after going left', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        expect(leftZipper?.getPath()).toBe('L');
      });

      it('should return R after going right', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        expect(rightZipper?.getPath()).toBe('R');
      });

      it('should return LL after going left twice', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(4))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        expect(leftLeftZipper?.getPath()).toBe('LL');
      });

      it('should return LR after going left then right', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, undefined, new Tree<number>(5))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const rightZipper = leftZipper?.goRight();
        expect(rightZipper?.getPath()).toBe('LR');
      });

      it('should return RL after going right then left', () => {
        const tree = new Tree<number>(
          1,
          undefined,
          new Tree<number>(3, new Tree<number>(6))
        );
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const leftZipper = rightZipper?.goLeft();
        expect(leftZipper?.getPath()).toBe('RL');
      });

      it('should return RR after going right twice', () => {
        const tree = new Tree<number>(
          1,
          undefined,
          new Tree<number>(3, undefined, new Tree<number>(7))
        );
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const rightRightZipper = rightZipper?.goRight();
        expect(rightRightZipper?.getPath()).toBe('RR');
      });
    });

    describe('goLeft', () => {
      it('should navigate to left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        expect(leftZipper?.getValue()).toBe(2);
      });

      it('should return null when left child does not exist', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        expect(leftZipper).toBeNull();
      });

      it('should navigate multiple levels left', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(3))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        expect(leftLeftZipper?.getValue()).toBe(3);
      });
    });

    describe('goRight', () => {
      it('should navigate to right child', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        expect(rightZipper?.getValue()).toBe(3);
      });

      it('should return null when right child does not exist', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        expect(rightZipper).toBeNull();
      });

      it('should navigate multiple levels right', () => {
        const tree = new Tree<number>(
          1,
          undefined,
          new Tree<number>(3, undefined, new Tree<number>(7))
        );
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const rightRightZipper = rightZipper?.goRight();
        expect(rightRightZipper?.getValue()).toBe(7);
      });
    });

    describe('goUp', () => {
      it('should return null when at root', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const upZipper = zipper.goUp();
        expect(upZipper).toBeNull();
      });

      it('should navigate up from left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const upZipper = leftZipper?.goUp();
        expect(upZipper?.getValue()).toBe(1);
      });

      it('should navigate up from right child', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const upZipper = rightZipper?.goUp();
        expect(upZipper?.getValue()).toBe(1);
      });

      it('should navigate up multiple levels', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(3))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        const upZipper = leftLeftZipper?.goUp();
        const upUpZipper = upZipper?.goUp();
        expect(upUpZipper?.getValue()).toBe(1);
      });
    });

    describe('toTree', () => {
      it('should reconstruct tree from root zipper', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const result = zipper.toTree();
        expect(result.getValue()).toBe(1);
        expect(result.isLeaf()).toBe(true);
      });

      it.skip('should reconstruct tree after navigating down', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(4)),
          new Tree<number>(3)
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        const result = leftLeftZipper?.toTree();
        expect(result?.getValue()).toBe(1);
        expect(result?.getLeft()?.getValue()).toBe(2);
        expect(result?.getRight()?.getValue()).toBe(3);
        expect(result?.getLeft()?.getLeft()?.getValue()).toBe(4);
      });

      it('should reconstruct tree after navigating up and down', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2),
          new Tree<number>(3, new Tree<number>(6))
        );
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const leftZipper = rightZipper?.goLeft();
        const upZipper = leftZipper?.goUp();
        const result = upZipper?.toTree();
        expect(result?.getValue()).toBe(1);
        expect(result?.getLeft()?.getValue()).toBe(2);
        expect(result?.getRight()?.getValue()).toBe(3);
        expect(result?.getRight()?.getLeft()?.getValue()).toBe(6);
      });
    });

    describe('setValue', () => {
      it('should change the value of the focused node', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newZipper = zipper.setValue(10);
        expect(newZipper.getValue()).toBe(10);
      });

      it('should not affect original zipper', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newZipper = zipper.setValue(10);
        expect(zipper.getValue()).toBe(1);
        expect(newZipper.getValue()).toBe(10);
      });

      it('should change value of left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const newZipper = leftZipper?.setValue(20);
        expect(newZipper?.getValue()).toBe(20);
      });

      it('should reflect change in reconstructed tree', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2),
          new Tree<number>(3)
        );
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const newZipper = rightZipper?.setValue(30);
        const result = newZipper?.toTree();
        expect(result?.getRight()?.getValue()).toBe(30);
        expect(result?.getLeft()?.getValue()).toBe(2);
      });
    });

    describe('insertLeft', () => {
      it('should insert a tree as left child', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(5);
        const newZipper = zipper.insertLeft(newTree);
        const result = newZipper.toTree();
        expect(result.getLeft()?.getValue()).toBe(5);
        expect(result.getValue()).toBe(1);
      });

      it('should replace existing left child', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(5);
        const newZipper = zipper.insertLeft(newTree);
        const result = newZipper.toTree();
        expect(result.getLeft()?.getValue()).toBe(5);
      });

      it('should preserve right child when inserting left', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(5);
        const newZipper = zipper.insertLeft(newTree);
        const result = newZipper.toTree();
        expect(result.getLeft()?.getValue()).toBe(5);
        expect(result.getRight()?.getValue()).toBe(3);
      });
    });

    describe('insertRight', () => {
      it('should insert a tree as right child', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(6);
        const newZipper = zipper.insertRight(newTree);
        const result = newZipper.toTree();
        expect(result.getRight()?.getValue()).toBe(6);
        expect(result.getValue()).toBe(1);
      });

      it('should replace existing right child', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(6);
        const newZipper = zipper.insertRight(newTree);
        const result = newZipper.toTree();
        expect(result.getRight()?.getValue()).toBe(6);
      });

      it('should preserve left child when inserting right', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const newTree = new Tree<number>(6);
        const newZipper = zipper.insertRight(newTree);
        const result = newZipper.toTree();
        expect(result.getLeft()?.getValue()).toBe(2);
        expect(result.getRight()?.getValue()).toBe(6);
      });
    });

    describe('delete', () => {
      it('should return null when at root', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const result = zipper.delete();
        expect(result).toBeNull();
      });

      it('should delete left child when focused on it', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const newZipper = leftZipper?.delete();
        const result = newZipper?.toTree();
        expect(newZipper?.isRoot()).toBe(true);
        expect(newZipper?.getValue()).toBe(1);
        expect(result.getLeft()).toBeUndefined();
      });

      it('should delete right child when focused on it', () => {
        const tree = new Tree<number>(1, undefined, new Tree<number>(3));
        const zipper = Zipper.fromTree(tree);
        const rightZipper = zipper.goRight();
        const newZipper = rightZipper?.delete();
        const result = newZipper?.toTree();
        expect(newZipper?.isRoot()).toBe(true);
        expect(newZipper?.getValue()).toBe(1);
        expect(result.getRight()).toBeUndefined();
      });

      it.skip('should navigate to parent after deletion', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(4))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        const newZipper = leftLeftZipper?.delete();
        const result = newZipper?.toTree();
        expect(newZipper?.isRoot()).toBe(false);
        expect(newZipper?.getValue()).toBe(2);
        expect(result.getLeft()).toBeUndefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle deep traversal path', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, new Tree<number>(4, new Tree<number>(8))),
          new Tree<number>(3)
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const leftLeftZipper = leftZipper?.goLeft();
        const leftLeftLeftZipper = leftLeftZipper?.goLeft();
        expect(leftLeftLeftZipper?.getPath()).toBe('LLL');
        expect(leftLeftLeftZipper?.getValue()).toBe(8);
      });

      it('should handle complex navigation sequence', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2, undefined, new Tree<number>(5)),
          new Tree<number>(3, new Tree<number>(6))
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const rightZipper = leftZipper?.goRight();
        const upZipper = rightZipper?.goUp();
        const upUpZipper = upZipper?.goUp();
        const rightZipper2 = upUpZipper?.goRight();
        const leftZipper2 = rightZipper2?.goLeft();
        expect(leftZipper2?.getPath()).toBe('RL');
        expect(leftZipper2?.getValue()).toBe(6);
      });

      it('should handle multiple setValue operations', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newZipper = zipper.setValue(10).setValue(20).setValue(30);
        expect(newZipper.getValue()).toBe(30);
        const result = newZipper.toTree();
        expect(result.getValue()).toBe(30);
      });

      it('should handle multiple insert operations', () => {
        const tree = new Tree<number>(1);
        const zipper = Zipper.fromTree(tree);
        const newZipper = zipper
          .insertLeft(new Tree<number>(2))
          .insertRight(new Tree<number>(3))
          .insertLeft(new Tree<number>(4));
        const result = newZipper.toTree();
        expect(result.getLeft()?.getValue()).toBe(4);
        expect(result.getRight()?.getValue()).toBe(3);
      });

      it('should handle delete followed by insert', () => {
        const tree = new Tree<number>(1, new Tree<number>(2));
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft();
        const deletedZipper = leftZipper?.delete();
        const newZipper = deletedZipper?.insertLeft(new Tree<number>(3));
        const result = newZipper?.toTree();
        expect(result.getLeft()?.getValue()).toBe(3);
      });

      it('should handle alternating navigation and modification', () => {
        const tree = new Tree<number>(
          1,
          new Tree<number>(2),
          new Tree<number>(3)
        );
        const zipper = Zipper.fromTree(tree);
        const leftZipper = zipper.goLeft()?.setValue(20);
        const upZipper = leftZipper?.goUp();
        const rightZipper = upZipper?.goRight()?.setValue(30);
        const upUpZipper = rightZipper?.goUp();
        const result = upUpZipper?.toTree();
        expect(result?.getValue()).toBe(1);
        expect(result?.getLeft()?.getValue()).toBe(20);
        expect(result?.getRight()?.getValue()).toBe(30);
      });
    });
  });
});
