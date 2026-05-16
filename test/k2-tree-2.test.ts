import { describe, it, expect } from 'vitest';
import { K2Tree2 } from '../src/core/k2-tree-2/index.js';

describe('K2Tree2', () => {
    describe('constructor', () => {
        it('should create tree with default size 16', () => {
            const tree = new K2Tree2();
            expect(tree.getMatrixSize()).toBe(16);
        });

        it('should create tree with custom size', () => {
            const tree = new K2Tree2(8);
            expect(tree.getMatrixSize()).toBe(8);
        });

        it('should throw error for non-power-of-2 size', () => {
            expect(() => new K2Tree2(15)).toThrow('Size must be a power of 2');
        });

        it('should throw error for zero size', () => {
            expect(() => new K2Tree2(0)).toThrow('Size must be a power of 2');
        });
    });

    describe('set and get', () => {
        it('should set and get a single cell', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 2);
            expect(tree.get(1, 2)).toBe(true);
            expect(tree.get(0, 0)).toBe(false);
        });

        it('should handle setting corner cells', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            tree.set(3, 3);
            expect(tree.get(0, 0)).toBe(true);
            expect(tree.get(3, 3)).toBe(true);
        });

        it('should overwrite existing values', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            expect(tree.get(1, 1)).toBe(true);
            tree.set(1, 1);
            expect(tree.get(1, 1)).toBe(true);
        });

        it('should throw error for out of bounds set', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.set(4, 0)).toThrow('Index out of bounds');
            expect(() => tree.set(-1, 0)).toThrow('Index out of bounds');
        });

        it('should throw error for out of bounds get', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.get(0, 4)).toThrow('Index out of bounds');
            expect(() => tree.get(0, -1)).toThrow('Index out of bounds');
        });
    });

    describe('clear', () => {
        it('should clear a set cell', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            expect(tree.get(1, 1)).toBe(true);
            tree.clear(1, 1);
            expect(tree.get(1, 1)).toBe(false);
        });

        it('should handle clearing non-existent cell', () => {
            const tree = new K2Tree2(4);
            tree.clear(1, 1);
            expect(tree.get(1, 1)).toBe(false);
        });

        it('should throw error for out of bounds clear', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.clear(4, 0)).toThrow('Index out of bounds');
        });
    });

    describe('toggle', () => {
        it('should toggle from false to true', () => {
            const tree = new K2Tree2(4);
            expect(tree.get(1, 1)).toBe(false);
            tree.toggle(1, 1);
            expect(tree.get(1, 1)).toBe(true);
        });

        it('should toggle from true to false', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            expect(tree.get(1, 1)).toBe(true);
            tree.toggle(1, 1);
            expect(tree.get(1, 1)).toBe(false);
        });

        it('should throw error for out of bounds toggle', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.toggle(-1, 0)).toThrow('Index out of bounds');
        });
    });

    describe('row', () => {
        it('should return empty array for empty row', () => {
            const tree = new K2Tree2(4);
            expect(tree.row(0)).toEqual([]);
        });

        it('should return set columns in row', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            tree.set(1, 3);
            expect(tree.row(1)).toEqual([1, 3]);
        });

        it('should return sorted column indices', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 3);
            tree.set(1, 0);
            tree.set(1, 2);
            expect(tree.row(1)).toEqual([0, 2, 3]);
        });

        it('should throw error for out of bounds row', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.row(4)).toThrow('Index out of bounds');
        });
    });

    describe('col', () => {
        it('should return empty array for empty column', () => {
            const tree = new K2Tree2(4);
            expect(tree.col(0)).toEqual([]);
        });

        it('should return set rows in column', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 2);
            tree.set(3, 2);
            expect(tree.col(2)).toEqual([1, 3]);
        });

        it('should return sorted row indices', () => {
            const tree = new K2Tree2(4);
            tree.set(3, 1);
            tree.set(0, 1);
            tree.set(2, 1);
            expect(tree.col(1)).toEqual([0, 2, 3]);
        });

        it('should throw error for out of bounds col', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.col(4)).toThrow('Index out of bounds');
        });
    });

    describe('count', () => {
        it('should return 0 for empty tree', () => {
            const tree = new K2Tree2(4);
            expect(tree.count()).toBe(0);
        });

        it('should count single set cell', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            expect(tree.count()).toBe(1);
        });

        it('should count multiple set cells', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            tree.set(1, 1);
            tree.set(2, 2);
            expect(tree.count()).toBe(3);
        });

        it('should handle clearing and recounting', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            tree.set(1, 1);
            expect(tree.count()).toBe(2);
            tree.clear(0, 0);
            expect(tree.count()).toBe(1);
        });
    });

    describe('isEmpty', () => {
        it('should return true for empty tree', () => {
            const tree = new K2Tree2(4);
            expect(tree.isEmpty()).toBe(true);
        });

        it('should return false after setting cell', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            expect(tree.isEmpty()).toBe(false);
        });

        it('should return true after clearing all cells', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 1);
            tree.clear(1, 1);
            expect(tree.isEmpty()).toBe(true);
        });
    });

    describe('getMatrixSize', () => {
        it('should return correct size', () => {
            const tree = new K2Tree2(32);
            expect(tree.getMatrixSize()).toBe(32);
        });

        it('should return default size 16', () => {
            const tree = new K2Tree2();
            expect(tree.getMatrixSize()).toBe(16);
        });
    });

    describe('toArray', () => {
        it('should return empty matrix for empty tree', () => {
            const tree = new K2Tree2(2);
            const matrix = tree.toArray();
            expect(matrix.length).toBe(2);
            expect(matrix[0].length).toBe(2);
            expect(matrix.every(row => row.every(cell => cell === false))).toBe(true);
        });

        it('should return matrix with set cells', () => {
            const tree = new K2Tree2(4);
            tree.set(1, 2);
            const matrix = tree.toArray();
            expect(matrix[1][2]).toBe(true);
            expect(matrix[0][0]).toBe(false);
        });

        it('should handle multiple set cells', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 1);
            tree.set(1, 3);
            tree.set(2, 0);
            tree.set(3, 2);
            const matrix = tree.toArray();
            expect(matrix[0][1]).toBe(true);
            expect(matrix[1][3]).toBe(true);
            expect(matrix[2][0]).toBe(true);
            expect(matrix[3][2]).toBe(true);
            expect(matrix[0][0]).toBe(false);
            expect(matrix[2][2]).toBe(false);
        });

        it('should return correct matrix dimensions', () => {
            const tree = new K2Tree2(8);
            const matrix = tree.toArray();
            expect(matrix.length).toBe(8);
            expect(matrix[0].length).toBe(8);
        });
    });

    describe('edge cases', () => {
        it('should handle empty matrix operations', () => {
            const tree = new K2Tree2(2);
            expect(tree.isEmpty()).toBe(true);
            expect(tree.count()).toBe(0);
            expect(tree.row(0)).toEqual([]);
            expect(tree.col(0)).toEqual([]);
        });

        it('should handle single cell matrix', () => {
            const tree = new K2Tree2(1);
            expect(tree.getMatrixSize()).toBe(1);
            tree.set(0, 0);
            expect(tree.get(0, 0)).toBe(true);
            expect(tree.count()).toBe(1);
            expect(tree.row(0)).toEqual([0]);
            expect(tree.col(0)).toEqual([0]);
        });

        it('should handle full matrix', () => {
            const tree = new K2Tree2(2);
            tree.set(0, 0);
            tree.set(0, 1);
            tree.set(1, 0);
            tree.set(1, 1);
            expect(tree.count()).toBe(4);
            expect(tree.isEmpty()).toBe(false);
            const matrix = tree.toArray();
            expect(matrix.every(row => row.every(cell => cell === true))).toBe(true);
        });

        it('should handle large sparse matrix', () => {
            const tree = new K2Tree2(16);
            tree.set(0, 0);
            tree.set(15, 15);
            tree.set(7, 8);
            expect(tree.count()).toBe(3);
            expect(tree.get(0, 0)).toBe(true);
            expect(tree.get(15, 15)).toBe(true);
            expect(tree.get(7, 8)).toBe(true);
            expect(tree.get(8, 8)).toBe(false);
        });

        it('should handle out of bounds consistently', () => {
            const tree = new K2Tree2(4);
            expect(() => tree.get(-1, 0)).toThrow('Index out of bounds');
            expect(() => tree.get(4, 0)).toThrow('Index out of bounds');
            expect(() => tree.get(0, -1)).toThrow('Index out of bounds');
            expect(() => tree.get(0, 4)).toThrow('Index out of bounds');
            expect(() => tree.set(-1, 0)).toThrow('Index out of bounds');
            expect(() => tree.set(4, 0)).toThrow('Index out of bounds');
            expect(() => tree.clear(-1, 0)).toThrow('Index out of bounds');
            expect(() => tree.clear(4, 0)).toThrow('Index out of bounds');
            expect(() => tree.toggle(-1, 0)).toThrow('Index out of bounds');
            expect(() => tree.toggle(4, 0)).toThrow('Index out of bounds');
            expect(() => tree.row(-1)).toThrow('Index out of bounds');
            expect(() => tree.row(4)).toThrow('Index out of bounds');
            expect(() => tree.col(-1)).toThrow('Index out of bounds');
            expect(() => tree.col(4)).toThrow('Index out of bounds');
        });

        it('should handle getMatrixSize', () => {
            const tree = new K2Tree2(8);
            expect(tree.getMatrixSize()).toBe(8);
        });

        it('should handle set and get', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            tree.set(1, 2);
            expect(tree.get(0, 0)).toBe(true);
            expect(tree.get(1, 2)).toBe(true);
            expect(tree.get(2, 2)).toBe(false);
        });

        it('should handle multiple set operations', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            tree.set(0, 1);
            tree.set(1, 0);
            tree.set(1, 1);
            expect(tree.get(0, 0)).toBe(true);
            expect(tree.get(1, 1)).toBe(true);
        });

        it('should handle clear cell operation', () => {
            const tree = new K2Tree2(4);
            tree.set(0, 0);
            expect(tree.get(0, 0)).toBe(true);
            tree.clear(0, 0);
            expect(tree.get(0, 0)).toBe(false);
        });
    });
  it('should handle multiple set and get', () => {
    const tree = new K2Tree2(4);
    tree.set(0, 0);
    tree.set(1, 1);
    tree.set(2, 2);
    expect(tree.get(0, 0)).toBe(true);
    expect(tree.get(1, 1)).toBe(true);
    expect(tree.get(2, 2)).toBe(true);
    expect(tree.get(3, 3)).toBe(false);
  });
  it('should handle row/col count', () => {
    const tree = new K2Tree2(4);
    expect(tree.size).toBe(4);
  });
  it('should handle toggle then count', () => {
    const tree = new K2Tree2(4);
    tree.set(0, 0);
    tree.set(1, 1);
    expect(tree.count()).toBe(2);
    tree.toggle(0, 0);
    expect(tree.count()).toBe(1);
    expect(tree.get(0, 0)).toBe(false);
  });
});
