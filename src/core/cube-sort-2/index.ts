import { CompareFn } from '../types.js';

export class CubeSort2 {
  private cubeSize: number;
  private comparator: (a: unknown, b: unknown) => number;

  constructor(cubeSize?: number, comparator?: CompareFn<unknown>) {
    this.cubeSize = cubeSize ?? Math.ceil(Math.sqrt(4096));
    this.comparator = comparator ?? ((a, b) => {
      if (a! < b!) return -1;
      if (a! > b!) return 1;
      return 0;
    });
  }

  sort<T>(arr: T[]): T[] {
    const result = [...arr];
    this.sortInPlace(result);
    return result;
  }

  sortInPlace<T>(arr: T[]): void {
    const n = arr.length;
    if (n <= 1) return;

    const cubes: T[][] = [];
    for (let i = 0; i < n; i += this.cubeSize) {
      const end = Math.min(i + this.cubeSize, n);
      const cube = arr.slice(i, end);
      cube.sort(this.comparator);
      cubes.push(cube);
    }

    this.mergeSortedCubes(arr, cubes);
  }

  private mergeSortedCubes<T>(arr: T[], cubes: T[][]): void {
    const indices = new Array(cubes.length).fill(0);
    let outputIndex = 0;

    while (outputIndex < arr.length) {
      let minIndex = -1;
      let minValue: T | null = null;

      for (let i = 0; i < cubes.length; i++) {
        if (indices[i] < cubes[i].length) {
          const current = cubes[i][indices[i]!];
          if (minValue === null || this.comparator(current, minValue) < 0) {
            minValue = current;
            minIndex = i;
          }
        }
      }

      if (minIndex !== -1) {
        arr[outputIndex] = cubes[minIndex][indices[minIndex]!];
        indices[minIndex]++;
        outputIndex++;
      }
    }
  }
}
