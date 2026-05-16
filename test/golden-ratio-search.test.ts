import { describe, it, expect } from "vitest";
import { GoldenRatioSearch } from "../src/core/golden-ratio-search/index";

describe("GoldenRatioSearch", () => {
  describe("findMinimum", () => {
    it("finds minimum of simple quadratic function", () => {
      const fn = (x: number) => (x - 3) * (x - 3) + 2;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-10, 10);

      expect(result.x).toBeCloseTo(3, 6);
      expect(result.value).toBeCloseTo(2, 6);
    });

    it("finds minimum of shifted quadratic", () => {
      const fn = (x: number) => (x + 2) * (x + 2) + 5;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-10, 10);

      expect(result.x).toBeCloseTo(-2, 6);
      expect(result.value).toBeCloseTo(5, 6);
    });

    it("finds minimum of cubic function", () => {
      const fn = (x: number) => x * x * x - 3 * x * x + 2;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(0, 3);

      expect(result.x).toBeCloseTo(2, 6);
    });

    it("finds minimum of sinusoidal function", () => {
      const fn = (x: number) => Math.sin(x);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(0, 5);

      const analyticalMin = 3 * Math.PI / 2;
      expect(result.x).toBeCloseTo(analyticalMin, 6);
    });

    it("finds minimum with very small range", () => {
      const fn = (x: number) => (x - 1.5) * (x - 1.5);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(1.4, 1.6);

      expect(result.x).toBeCloseTo(1.5, 6);
    });

    it("finds minimum with very large range", () => {
      const fn = (x: number) => (x - 1000) * (x - 1000);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-10000, 10000);

      expect(result.x).toBeCloseTo(1000, 6);
    });

    it("finds minimum with custom tolerance", () => {
      const fn = (x: number) => (x - 5) * (x - 5);
      const search = new GoldenRatioSearch(fn, 1e-4);
      const result = search.findMinimum(-10, 10);

      expect(result.x).toBeCloseTo(5, 4);
    });
  });

  describe("findMaximum", () => {
    it("finds maximum of inverted quadratic", () => {
      const fn = (x: number) => -(x - 4) * (x - 4) + 10;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(-10, 10);

      expect(result.x).toBeCloseTo(4, 6);
      expect(result.value).toBeCloseTo(10, 6);
    });

    it("finds maximum of cubic function", () => {
      const fn = (x: number) => -(x * x * x - 3 * x * x + 2);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(0, 3);

      expect(result.x).toBeCloseTo(2, 6);
    });

    it("finds maximum of sinusoidal function", () => {
      const fn = (x: number) => Math.sin(x);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(0, 4);

      const analyticalMax = Math.PI / 2;
      expect(result.x).toBeCloseTo(analyticalMax, 6);
    });

    it("finds maximum with very small range", () => {
      const fn = (x: number) => -(x - 2.5) * (x - 2.5) + 100;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(2.4, 2.6);

      expect(result.x).toBeCloseTo(2.5, 6);
      expect(result.value).toBeCloseTo(100, 6);
    });

    it("finds maximum with very large range", () => {
      const fn = (x: number) => -(x - 5000) * (x - 5000) + 1000000;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(-100000, 100000);

      expect(result.x).toBeCloseTo(5000, 4);
      expect(result.value).toBeCloseTo(1000000, 4);
    });

    it("finds maximum with custom tolerance", () => {
      const fn = (x: number) => -(x - 7) * (x - 7) + 50;
      const search = new GoldenRatioSearch(fn, 1e-5);
      const result = search.findMaximum(-10, 10);

      expect(result.x).toBeCloseTo(7, 5);
      expect(result.value).toBeCloseTo(50, 5);
    });
  });

  describe("iteration counting", () => {
    it("counts iterations for minimum search", () => {
      const fn = (x: number) => (x - 3) * (x - 3);
      const search = new GoldenRatioSearch(fn);
      search.findMinimum(-10, 10);

      expect(search.getIterations()).toBeGreaterThan(0);
    });

    it("counts iterations for maximum search", () => {
      const fn = (x: number) => -(x - 3) * (x - 3);
      const search = new GoldenRatioSearch(fn);
      search.findMaximum(-10, 10);

      expect(search.getIterations()).toBeGreaterThan(0);
    });

    it("resets iteration count between searches", () => {
      const fn = (x: number) => (x - 3) * (x - 3);
      const search = new GoldenRatioSearch(fn);

      search.findMinimum(-10, 10);
      const iterations1 = search.getIterations();

      search.findMinimum(-5, 5);
      const iterations2 = search.getIterations();

      expect(iterations2).toBeGreaterThan(0);
    });

    it("more iterations with stricter tolerance", () => {
      const fn = (x: number) => (x - 3) * (x - 3);

      const search1 = new GoldenRatioSearch(fn, 1e-2);
      search1.findMinimum(-10, 10);
      const iterationsLoose = search1.getIterations();

      const search2 = new GoldenRatioSearch(fn, 1e-8);
      search2.findMinimum(-10, 10);
      const iterationsStrict = search2.getIterations();

      expect(iterationsStrict).toBeGreaterThan(iterationsLoose);
    });
  });

  describe("tolerance management", () => {
    it("returns default tolerance", () => {
      const fn = (x: number) => x * x;
      const search = new GoldenRatioSearch(fn);

      expect(search.getTolerance()).toBe(1e-8);
    });

    it("returns custom tolerance", () => {
      const fn = (x: number) => x * x;
      const customTolerance = 1e-6;
      const search = new GoldenRatioSearch(fn, customTolerance);

      expect(search.getTolerance()).toBe(customTolerance);
    });

    it("updates tolerance via setTolerance", () => {
      const fn = (x: number) => x * x;
      const search = new GoldenRatioSearch(fn);
      const newTolerance = 1e-10;

      search.setTolerance(newTolerance);

      expect(search.getTolerance()).toBe(newTolerance);
    });

    it("uses updated tolerance in subsequent search", () => {
      const fn = (x: number) => (x - 5) * (x - 5);
      const search = new GoldenRatioSearch(fn, 1e-2);

      const result1 = search.findMinimum(-10, 10);
      const iterations1 = search.getIterations();

      search.setTolerance(1e-8);
      const result2 = search.findMinimum(-10, 10);
      const iterations2 = search.getIterations();

      expect(iterations2).toBeGreaterThan(iterations1);
      expect(result2.x).toBeCloseTo(5, 6);
    });
  });

  describe("time complexity", () => {
    it("returns correct time complexity string", () => {
      const fn = (x: number) => x * x;
      const search = new GoldenRatioSearch(fn);

      expect(search.getTimeComplexity()).toBe("O(log(1/tolerance))");
    });
  });

  describe("known analytical solutions", () => {
    it("finds minimum of parabola y = (x - a)² + b", () => {
      const a = 7;
      const b = 15;
      const fn = (x: number) => (x - a) * (x - a) + b;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-20, 20);

      expect(result.x).toBeCloseTo(a, 6);
      expect(result.value).toBeCloseTo(b, 6);
    });

    it("finds maximum of inverted parabola y = -(x - a)² + b", () => {
      const a = -3;
      const b = 50;
      const fn = (x: number) => -(x - a) * (x - a) + b;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(-20, 20);

      expect(result.x).toBeCloseTo(a, 6);
      expect(result.value).toBeCloseTo(b, 6);
    });

    it("finds extremum of shifted sine function", () => {
      const amplitude = 2;
      const frequency = 1;
      const phase = Math.PI / 4;
      const verticalShift = 1;

      const fn = (x: number) =>
        amplitude * Math.sin(frequency * x + phase) + verticalShift;

      const minSearch = new GoldenRatioSearch(fn);
      const minResult = minSearch.findMinimum(0, 2 * Math.PI);

      const expectedMinX = (3 * Math.PI / 2 - phase) / frequency;
      expect(minResult.x).toBeCloseTo(expectedMinX, 1);

      const maxSearch = new GoldenRatioSearch(fn);
      const maxResult = maxSearch.findMaximum(0, 2 * Math.PI);

      const expectedMaxX = (Math.PI / 2 - phase) / frequency;
      expect(maxResult.x).toBeCloseTo(expectedMaxX, 1);
    });
  });

  describe("additional coverage", () => {
    it("finds minimum of x squared", () => {
      const fn = (x: number) => x * x;
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-10, 10);
      expect(result.x).toBeCloseTo(0, 6);
      expect(result.value).toBeCloseTo(0, 6);
    });

    it("finds maximum of cosine in first period", () => {
      const fn = (x: number) => Math.cos(x);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMaximum(-Math.PI, Math.PI);
      expect(result.x).toBeCloseTo(0, 6);
      expect(result.value).toBeCloseTo(1, 6);
    });

    it("handles exponential function minimum", () => {
      const fn = (x: number) => Math.exp(x);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-5, 5);
      expect(result.x).toBeCloseTo(-5, 0);
    });

    it("finds minimum of quartic function", () => {
      const fn = (x: number) => (x - 2) * (x - 2) * (x - 2) * (x - 2);
      const search = new GoldenRatioSearch(fn);
      const result = search.findMinimum(-10, 10);
      expect(result.x).toBeCloseTo(2, 5);
    });

  it("setTolerance changes search precision", () => {
    const fn = (x: number) => (x - 3) * (x - 3);
    const search = new GoldenRatioSearch(fn, 1e-2);
    search.setTolerance(1e-10);
    const result = search.findMinimum(-10, 10);
    expect(result.x).toBeCloseTo(3, 9);
  });

  it("finds minimum of negative parabola at boundary", () => {
    const fn = (x: number) => -(x - 5) * (x - 5);
    const search = new GoldenRatioSearch(fn);
    const result = search.findMinimum(-10, 10);
    expect(result.x).toBeGreaterThanOrEqual(-10);
    expect(result.x).toBeLessThanOrEqual(10);
  });

  it("finds minimum at zero", () => {
    const fn = (x: number) => x * x;
    const search = new GoldenRatioSearch(fn);
    const result = search.findMinimum(-5, 5);
    expect(result.x).toBeCloseTo(0, 5);
  });

  it("tracks iterations", () => {
    const fn = (x: number) => x * x;
    const search = new GoldenRatioSearch(fn);
    search.findMinimum(-5, 5);
    expect(search.getIterations()).toBeGreaterThan(0);
  });

  it("returns getTimeComplexity", () => {
    const fn = (x: number) => x * x;
    const search = new GoldenRatioSearch(fn);
    expect(search.getTimeComplexity()).toBe("O(log(1/tolerance))");
  });

  it("finds maximum of quadratic", () => {
    const fn = (x: number) => -(x - 3) * (x - 3) + 10;
    const search = new GoldenRatioSearch(fn);
    const result = search.findMaximum(-10, 10);
    expect(result.x).toBeCloseTo(3, 5);
    expect(result.value).toBeCloseTo(10, 5);
  });

  it("finds minimum of convex function", () => {
    const fn = (x: number) => (x - 2) * (x - 2) + 5;
    const search = new GoldenRatioSearch(fn);
    const result = search.findMinimum(0, 10);
    expect(result.x).toBeCloseTo(2, 5);
    expect(result.value).toBeCloseTo(5, 5);
  });

  it("getTimeComplexity returns string", () => {
    const fn = (x: number) => x;
    const search = new GoldenRatioSearch(fn);
    expect(typeof search.getTimeComplexity()).toBe('string');
  });

  it("respects tolerance parameter", () => {
    const fn = (x: number) => -(x - 5) * (x - 5);
    const search = new GoldenRatioSearch(fn, 0.001);
    const result = search.findMaximum(0, 10);
    expect(result.x).toBeCloseTo(5, 2);
  });

  it("finds minimum", () => {
    const fn = (x: number) => (x - 3) * (x - 3);
    const search = new GoldenRatioSearch(fn);
    const result = search.findMinimum(0, 10);
    expect(result.x).toBeCloseTo(3, 2);
  });

  it("handles flat function", () => {
    const fn = (x: number) => 5;
    const search = new GoldenRatioSearch(fn);
    const result = search.findMaximum(0, 10);
    expect(result.value).toBe(5);
  });
});
});
