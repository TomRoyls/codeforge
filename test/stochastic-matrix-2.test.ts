import { describe, it, expect } from 'vitest';
import { StochasticMatrix2 } from '../src/core/stochastic-matrix-2/index.js';

describe('StochasticMatrix2', () => {
  describe('constructor', () => {
    it('should create matrix with given states', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      expect(matrix.stateCount()).toBe(3);
      expect(matrix.getStates()).toEqual(['A', 'B', 'C']);
    });

    it('should create matrix with single state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(matrix.stateCount()).toBe(1);
      expect(matrix.getStates()).toEqual(['A']);
    });

    it('should initialize all transitions to 0', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      expect(matrix.getTransition('A', 'A')).toBe(0);
      expect(matrix.getTransition('A', 'B')).toBe(0);
      expect(matrix.getTransition('B', 'A')).toBe(0);
      expect(matrix.getTransition('B', 'B')).toBe(0);
    });
  });

  describe('setTransition', () => {
    it('should set transition probability', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 0.5);
      expect(matrix.getTransition('A', 'B')).toBe(0.5);
    });

    it('should update existing transition', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 0.5);
      matrix.setTransition('A', 'B', 0.8);
      expect(matrix.getTransition('A', 'B')).toBe(0.8);
    });

    it('should throw error for unknown from state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(() => matrix.setTransition('X', 'A', 0.5)).toThrow('Unknown state: X');
    });

    it('should throw error for unknown to state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(() => matrix.setTransition('A', 'X', 0.5)).toThrow('Unknown state: X');
    });

    it('should allow probability > 1 for normalization', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 1.5);
      expect(matrix.getTransition('A', 'B')).toBe(1.5);
    });

    it('should throw error for probability < 0', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      expect(() => matrix.setTransition('A', 'B', -0.5)).toThrow('Probability must be non-negative');
    });

    it('should allow probability of 0', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 0);
      expect(matrix.getTransition('A', 'B')).toBe(0);
    });

    it('should allow probability of 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 1);
      expect(matrix.getTransition('A', 'B')).toBe(1);
    });
  });

  describe('getTransition', () => {
    it('should return 0 for unset transition', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      expect(matrix.getTransition('A', 'B')).toBe(0);
    });

    it('should return set probability', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 0.7);
      expect(matrix.getTransition('A', 'B')).toBe(0.7);
    });

    it('should throw error for unknown from state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(() => matrix.getTransition('X', 'A')).toThrow('Unknown state: X');
    });

    it('should throw error for unknown to state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(() => matrix.getTransition('A', 'X')).toThrow('Unknown state: X');
    });
  });

  describe('getTransitionsFrom', () => {
    it('should return map of transitions from state', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      matrix.setTransition('A', 'A', 0.2);
      matrix.setTransition('A', 'B', 0.3);
      matrix.setTransition('A', 'C', 0.5);

      const transitions = matrix.getTransitionsFrom('A');
      expect(transitions.size).toBe(3);
      expect(transitions.get('A')).toBe(0.2);
      expect(transitions.get('B')).toBe(0.3);
      expect(transitions.get('C')).toBe(0.5);
    });

    it('should return empty map if no transitions set', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      const transitions = matrix.getTransitionsFrom('A');
      expect(transitions.size).toBe(0);
    });

    it('should throw error for unknown state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(() => matrix.getTransitionsFrom('X')).toThrow('Unknown state: X');
    });

    it('should return a copy, not the original', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'B', 0.5);
      const transitions = matrix.getTransitionsFrom('A');
      transitions.set('B', 0.8);
      expect(matrix.getTransition('A', 'B')).toBe(0.5);
    });
  });

  describe('getStates', () => {
    it('should return copy of states array', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      const states = matrix.getStates();
      expect(states).toEqual(['A', 'B', 'C']);
      states.push('D');
      expect(matrix.stateCount()).toBe(3);
    });
  });

  describe('stateCount', () => {
    it('should return number of states', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      expect(matrix.stateCount()).toBe(3);
    });

    it('should return 1 for single state', () => {
      const matrix = new StochasticMatrix2(['A']);
      expect(matrix.stateCount()).toBe(1);
    });
  });

  describe('isRowStochastic', () => {
    it('should return true for row stochastic matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4);
      matrix.setTransition('A', 'B', 0.6);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);
      expect(matrix.isRowStochastic()).toBe(true);
    });

    it('should return false if rows do not sum to 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.5);
      matrix.setTransition('A', 'B', 0.3);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);
      expect(matrix.isRowStochastic()).toBe(false);
    });

    it('should return true within epsilon tolerance', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4999999999);
      matrix.setTransition('A', 'B', 0.5);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);
      expect(matrix.isRowStochastic()).toBe(true);
    });

    it('should handle self-loops', () => {
      const matrix = new StochasticMatrix2(['A']);
      matrix.setTransition('A', 'A', 1);
      expect(matrix.isRowStochastic()).toBe(true);
    });
  });

  describe('isColumnStochastic', () => {
    it('should return true for column stochastic matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.5);
      matrix.setTransition('A', 'B', 0.5);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);
      expect(matrix.isColumnStochastic()).toBe(true);
    });

    it('should return false if columns do not sum to 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4);
      matrix.setTransition('A', 'B', 0.6);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);
      expect(matrix.isColumnStochastic()).toBe(false);
    });
  });

  describe('isDoublyStochastic', () => {
    it('should return true for doubly stochastic matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.5);
      matrix.setTransition('A', 'B', 0.5);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);
      expect(matrix.isDoublyStochastic()).toBe(true);
    });

    it('should return false if not row stochastic', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4);
      matrix.setTransition('A', 'B', 0.3);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);
      expect(matrix.isDoublyStochastic()).toBe(false);
    });

    it('should return false if not column stochastic', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4);
      matrix.setTransition('A', 'B', 0.6);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);
      expect(matrix.isDoublyStochastic()).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should normalize rows to sum to 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 2);
      matrix.setTransition('A', 'B', 2);
      matrix.setTransition('B', 'A', 1);
      matrix.setTransition('B', 'B', 3);
      matrix.normalize();

      expect(matrix.getTransition('A', 'A')).toBeCloseTo(0.5);
      expect(matrix.getTransition('A', 'B')).toBeCloseTo(0.5);
      expect(matrix.getTransition('B', 'A')).toBeCloseTo(0.25);
      expect(matrix.getTransition('B', 'B')).toBeCloseTo(0.75);
    });

    it('should handle zero rows', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.5);
      matrix.setTransition('A', 'B', 0.5);
      matrix.normalize();

      expect(matrix.getTransition('A', 'A')).toBeCloseTo(0.5);
      expect(matrix.getTransition('A', 'B')).toBeCloseTo(0.5);
      expect(matrix.getTransition('B', 'A')).toBe(0);
      expect(matrix.getTransition('B', 'B')).toBe(0);
    });

    it('should normalize uniform distribution', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      matrix.setTransition('A', 'A', 1);
      matrix.setTransition('A', 'B', 1);
      matrix.setTransition('A', 'C', 1);
      matrix.normalize();

      expect(matrix.getTransition('A', 'A')).toBeCloseTo(1 / 3);
      expect(matrix.getTransition('A', 'B')).toBeCloseTo(1 / 3);
      expect(matrix.getTransition('A', 'C')).toBeCloseTo(1 / 3);
    });
  });

  describe('multiply', () => {
    it('should multiply two matrices', () => {
      const matrix1 = new StochasticMatrix2(['A', 'B']);
      matrix1.setTransition('A', 'A', 0.6);
      matrix1.setTransition('A', 'B', 0.4);
      matrix1.setTransition('B', 'A', 0.3);
      matrix1.setTransition('B', 'B', 0.7);

      const matrix2 = new StochasticMatrix2(['A', 'B']);
      matrix2.setTransition('A', 'A', 0.5);
      matrix2.setTransition('A', 'B', 0.5);
      matrix2.setTransition('B', 'A', 0.2);
      matrix2.setTransition('B', 'B', 0.8);

      const result = matrix1.multiply(matrix2);

      expect(result.getTransition('A', 'A')).toBeCloseTo(0.6 * 0.5 + 0.4 * 0.2);
      expect(result.getTransition('A', 'B')).toBeCloseTo(0.6 * 0.5 + 0.4 * 0.8);
      expect(result.getTransition('B', 'A')).toBeCloseTo(0.3 * 0.5 + 0.7 * 0.2);
      expect(result.getTransition('B', 'B')).toBeCloseTo(0.3 * 0.5 + 0.7 * 0.8);
    });

    it('should throw error for different dimensions', () => {
      const matrix1 = new StochasticMatrix2(['A', 'B']);
      const matrix2 = new StochasticMatrix2(['A', 'B', 'C']);
      expect(() => matrix1.multiply(matrix2)).toThrow('Matrices must have same dimensions');
    });
  });

  describe('power', () => {
    it('should return identity for power 0', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.6);
      matrix.setTransition('A', 'B', 0.4);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);

      const result = matrix.power(0);

      expect(result.getTransition('A', 'A')).toBeCloseTo(1);
      expect(result.getTransition('A', 'B')).toBeCloseTo(0);
      expect(result.getTransition('B', 'A')).toBeCloseTo(0);
      expect(result.getTransition('B', 'B')).toBeCloseTo(1);
    });

    it('should return copy for power 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.6);
      matrix.setTransition('A', 'B', 0.4);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);

      const result = matrix.power(1);

      expect(result.getTransition('A', 'A')).toBe(0);
      expect(result.getTransition('A', 'B')).toBe(0);
      expect(result.getTransition('B', 'A')).toBe(0);
      expect(result.getTransition('B', 'B')).toBe(0);
    });

    it('should compute power for n > 1', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.6);
      matrix.setTransition('A', 'B', 0.4);
      matrix.setTransition('B', 'A', 0.3);
      matrix.setTransition('B', 'B', 0.7);

      const result = matrix.power(2);
      const squared = matrix.multiply(matrix);

      expect(result.getTransition('A', 'A')).toBeCloseTo(squared.getTransition('A', 'A'));
      expect(result.getTransition('A', 'B')).toBeCloseTo(squared.getTransition('A', 'B'));
      expect(result.getTransition('B', 'A')).toBeCloseTo(squared.getTransition('B', 'A'));
      expect(result.getTransition('B', 'B')).toBeCloseTo(squared.getTransition('B', 'B'));
    });

    it('should throw error for negative power', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      expect(() => matrix.power(-1)).toThrow('Power must be non-negative');
    });
  });

  describe('stationaryDistribution', () => {
    it('should compute stationary distribution for symmetric matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.5);
      matrix.setTransition('A', 'B', 0.5);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);

      const stationary = matrix.stationaryDistribution();

      expect(stationary.get('A')).toBeCloseTo(0.5);
      expect(stationary.get('B')).toBeCloseTo(0.5);
    });

    it('should compute stationary distribution for absorbing state', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 1);
      matrix.setTransition('A', 'B', 0);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);

      const stationary = matrix.stationaryDistribution();

      expect(stationary.get('A')).toBeCloseTo(1);
      expect(stationary.get('B')).toBeCloseTo(0);
    });

    it('should compute stationary distribution for simple chain', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.7);
      matrix.setTransition('A', 'B', 0.3);
      matrix.setTransition('B', 'A', 0.2);
      matrix.setTransition('B', 'B', 0.8);

      const stationary = matrix.stationaryDistribution();

      const sum = Array.from(stationary.values()).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1);

      const a = stationary.get('A') ?? 0;
      const b = stationary.get('B') ?? 0;

      const newA = a * 0.7 + b * 0.2;
      const newB = a * 0.3 + b * 0.8;

      expect(newA).toBeCloseTo(a, 5);
      expect(newB).toBeCloseTo(b, 5);
    });

    it('should throw error for non-stochastic matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 0.4);
      matrix.setTransition('A', 'B', 0.3);
      matrix.setTransition('B', 'A', 0.5);
      matrix.setTransition('B', 'B', 0.5);

      expect(() => matrix.stationaryDistribution()).toThrow('Matrix must be row stochastic');
    });

    it('should handle single state', () => {
      const matrix = new StochasticMatrix2(['A']);
      matrix.setTransition('A', 'A', 1);

      const stationary = matrix.stationaryDistribution();

      expect(stationary.get('A')).toBeCloseTo(1);
    });
  });

  describe('edge cases', () => {
    it('should handle self-loop on single state', () => {
      const matrix = new StochasticMatrix2(['A']);
      matrix.setTransition('A', 'A', 1);

      expect(matrix.isRowStochastic()).toBe(true);
      expect(matrix.isColumnStochastic()).toBe(true);
      expect(matrix.isDoublyStochastic()).toBe(true);

      const stationary = matrix.stationaryDistribution();
      expect(stationary.get('A')).toBeCloseTo(1);
    });

    it('should handle uniform distribution', () => {
      const matrix = new StochasticMatrix2(['A', 'B', 'C']);
      matrix.setTransition('A', 'A', 1 / 3);
      matrix.setTransition('A', 'B', 1 / 3);
      matrix.setTransition('A', 'C', 1 / 3);
      matrix.setTransition('B', 'A', 1 / 3);
      matrix.setTransition('B', 'B', 1 / 3);
      matrix.setTransition('B', 'C', 1 / 3);
      matrix.setTransition('C', 'A', 1 / 3);
      matrix.setTransition('C', 'B', 1 / 3);
      matrix.setTransition('C', 'C', 1 / 3);

      const stationary = matrix.stationaryDistribution();

      expect(stationary.get('A')).toBeCloseTo(1 / 3);
      expect(stationary.get('B')).toBeCloseTo(1 / 3);
      expect(stationary.get('C')).toBeCloseTo(1 / 3);
    });

    it('should handle identity matrix', () => {
      const matrix = new StochasticMatrix2(['A', 'B']);
      matrix.setTransition('A', 'A', 1);
      matrix.setTransition('A', 'B', 0);
      matrix.setTransition('B', 'A', 0);
      matrix.setTransition('B', 'B', 1);

      const stationary = matrix.stationaryDistribution();

      expect(stationary.get('A')).toBeCloseTo(0.5);
      expect(stationary.get('B')).toBeCloseTo(0.5);
    });
  });
});
