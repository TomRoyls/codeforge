import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoImplicitCoercion,
  noImplicitCoercionRule,
} from '../../../../src/rules/best-practices/no-implicit-coercion.js'

describe('no-implicit-coercion rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('analyzeNoImplicitCoercion', () => {
    describe('double bang (!!) detection', () => {
      it('should flag double bang for boolean conversion', () => {
        const code = 'const isValid = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('double bang')
        expect(violations[0].suggestion).toContain('Boolean')
      })

      it('should not flag single bang', () => {
        const code = 'const isNotValid = !value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag double bang when allowDoubleBang is true', () => {
        const code = 'const isValid = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowDoubleBang: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag !! on identifier', () => {
        const code = 'const b = !!foo;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on property access', () => {
        const code = 'const b = !!obj.prop;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on computed property', () => {
        const code = 'const b = !!arr[0];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on function call', () => {
        const code = 'const b = !!getValue();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on method call', () => {
        const code = 'const b = !!obj.getValue();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on binary expression', () => {
        const code = 'const b = !!(x + y);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in if statement condition', () => {
        const code = 'if (!!value) { }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in while loop condition', () => {
        const code = 'while (!!running) { break; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in ternary condition', () => {
        const code = 'const x = !!flag ? "yes" : "no";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in logical expression', () => {
        const code = 'const x = !!a && !!b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should flag !! in return statement', () => {
        const code = 'function check() { return !!value; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in function argument', () => {
        const code = 'fn(!!value);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in array literal', () => {
        const code = 'const arr = [!!a, !!b];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should flag !! in object property value', () => {
        const code = 'const obj = { active: !!flag };'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on typeof result', () => {
        const code = 'const b = !!typeof x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on new expression', () => {
        const code = 'const b = !!new Foo();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on parenthesized expression', () => {
        const code = 'const b = !!(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag triple bang !!! as double bang wrapping single bang', () => {
        const code = 'const b = !!!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(1)
      })

      it('should not flag Boolean() constructor call', () => {
        const code = 'const b = Boolean(value);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag comparison expressions', () => {
        const code = 'const b = x === true;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag !! on nullish coalescing result', () => {
        const code = 'const b = !!(x ?? y);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! on optional chain', () => {
        const code = 'const b = !!obj?.prop;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag multiple !! in same expression', () => {
        const code = 'const result = !!a || !!b || !!c;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(3)
      })
    })

    describe('unary plus (+) detection', () => {
      it('should flag unary plus for number conversion', () => {
        const code = 'const num = +stringValue;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('unary plus')
        expect(violations[0].suggestion).toContain('Number')
      })

      it('should not flag unary plus on numeric literal', () => {
        const code = 'const num = +42;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag unary plus when allowUnaryPlus is true', () => {
        const code = 'const num = +stringValue;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowUnaryPlus: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag + on identifier', () => {
        const code = 'const n = +x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on property access', () => {
        const code = 'const n = +obj.val;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on computed property', () => {
        const code = 'const n = +arr[0];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on function call', () => {
        const code = 'const n = +getValue();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on method call', () => {
        const code = 'const n = +obj.getValue();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on string literal', () => {
        const code = 'const n = +"42";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on template expression', () => {
        const code = 'const n = +`42`;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should not flag +0 (numeric literal)', () => {
        const code = 'const n = +0;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag +1 (numeric literal)', () => {
        const code = 'const n = +1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag + in return statement', () => {
        const code = 'function parse() { return +val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + in if condition', () => {
        const code = 'if (+val) { }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + in function argument', () => {
        const code = 'fn(+val);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + in ternary', () => {
        const code = 'const n = flag ? +a : +b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should flag + in array literal', () => {
        const code = 'const arr = [+a, +b];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should flag + in object property', () => {
        const code = 'const obj = { n: +val };'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on parenthesized expression', () => {
        const code = 'const n = +(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on typeof result', () => {
        const code = 'const n = +typeof x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + on optional chain', () => {
        const code = 'const n = +obj?.val;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag multiple + in same file', () => {
        const code = 'const a = +x; const b = +y; const c = +z;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(3)
      })

      it('should not flag Number() constructor', () => {
        const code = 'const n = Number(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag parseInt() call', () => {
        const code = 'const n = parseInt(x, 10);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag parseFloat() call', () => {
        const code = 'const n = parseFloat(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag +3.14 (numeric literal with decimal)', () => {
        const code = 'const n = +3.14;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('string concatenation detection', () => {
      it('should flag value + "" for string conversion', () => {
        const code = 'const str = value + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('string concatenation')
        expect(violations[0].suggestion).toContain('String')
      })

      it('should flag "" + value for string conversion', () => {
        const code = 'const str = "" + value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag regular string concatenation', () => {
        const code = 'const str = "hello" + " world";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag when allowStringConcat is true', () => {
        const code = 'const str = value + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowStringConcat: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag identifier + ""', () => {
        const code = 'const s = x + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag "" + identifier', () => {
        const code = 'const s = "" + x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag property + ""', () => {
        const code = 'const s = obj.val + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag "" + property', () => {
        const code = 'const s = "" + obj.val;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag function call + ""', () => {
        const code = 'const s = fn() + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag "" + function call', () => {
        const code = 'const s = "" + fn();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag number + ""', () => {
        const code = 'const s = 42 + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag "" + number', () => {
        const code = 'const s = "" + 42;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in return statement', () => {
        const code = 'function str() { return val + ""; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in function argument', () => {
        const code = 'fn(val + "");'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in array literal', () => {
        const code = 'const arr = [x + ""];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in object property', () => {
        const code = 'const obj = { s: val + "" };'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in if condition', () => {
        const code = 'if (x + "") { }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in ternary', () => {
        const code = 'const s = flag ? x + "" : "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag multiple in same file', () => {
        const code = 'const a = x + ""; const b = "" + y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should not flag concatenation with non-empty string', () => {
        const code = 'const s = x + "hello";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag concatenation of two identifiers', () => {
        const code = 'const s = a + b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag String() constructor', () => {
        const code = 'const s = String(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag template literal', () => {
        const code = 'const s = `${x}`;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag numeric literal + non-empty string', () => {
        const code = 'const s = 42 + "px";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag computed property + empty string', () => {
        const code = 'const s = arr[0] + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag optional chain + empty string', () => {
        const code = 'const s = obj?.val + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })
    })

    describe('numeric coercion detection', () => {
      it('should flag value * 1 for number conversion', () => {
        const code = 'const num = value * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
        expect(violations[0].message).toContain('multiplication')
        expect(violations[0].suggestion).toContain('Number')
      })

      it('should flag 1 * value for number conversion', () => {
        const code = 'const num = 1 * value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThan(0)
      })

      it('should not flag regular multiplication', () => {
        const code = 'const result = value * 2;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag when allowNumericConcat is true', () => {
        const code = 'const num = value * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowNumericConcat: true })
        expect(violations).toHaveLength(0)
      })

      it('should flag identifier * 1', () => {
        const code = 'const n = x * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag 1 * identifier', () => {
        const code = 'const n = 1 * x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag property * 1', () => {
        const code = 'const n = obj.val * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag 1 * property', () => {
        const code = 'const n = 1 * obj.val;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag function call * 1', () => {
        const code = 'const n = fn() * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag 1 * function call', () => {
        const code = 'const n = 1 * fn();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should not flag value * 0', () => {
        const code = 'const n = x * 0;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag value * 2', () => {
        const code = 'const n = x * 2;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag value * -1', () => {
        const code = 'const n = x * -1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag 2 * 3', () => {
        const code = 'const n = 2 * 3;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should flag in return statement', () => {
        const code = 'function toNum() { return val * 1; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in function argument', () => {
        const code = 'fn(val * 1);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in array literal', () => {
        const code = 'const arr = [x * 1];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in object property', () => {
        const code = 'const obj = { n: val * 1 };'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag in if condition', () => {
        const code = 'if (x * 1) { }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag multiple in same file', () => {
        const code = 'const a = x * 1; const b = 1 * y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should flag computed property * 1', () => {
        const code = 'const n = arr[0] * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag optional chain * 1', () => {
        const code = 'const n = obj?.val * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag value * 1.0 since literal value is 1', () => {
        const code = 'const n = x * 1.0;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should not flag Number() constructor', () => {
        const code = 'const n = Number(x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('violation properties', () => {
      it('should set ruleId to no-implicit-coercion', () => {
        const code = 'const b = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].ruleId).toBe('no-implicit-coercion')
      })

      it('should set severity to warning for !!', () => {
        const code = 'const b = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].severity).toBe('warning')
      })

      it('should set severity to warning for +', () => {
        const code = 'const n = +value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].severity).toBe('warning')
      })

      it('should set severity to warning for string concat', () => {
        const code = 'const s = x + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].severity).toBe('warning')
      })

      it('should set severity to warning for * 1', () => {
        const code = 'const n = x * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].severity).toBe('warning')
      })

      it('should include range for !! violation', () => {
        const code = 'const b = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].range).toBeDefined()
        expect(violations[0].range.start).toBeDefined()
        expect(violations[0].range.end).toBeDefined()
      })

      it('should include range for + violation', () => {
        const code = 'const n = +value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].range).toBeDefined()
      })

      it('should include range for string concat violation', () => {
        const code = 'const s = x + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].range).toBeDefined()
      })

      it('should include range for * 1 violation', () => {
        const code = 'const n = x * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].range).toBeDefined()
      })

      it('should include file path in violation', () => {
        const code = 'const b = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].filePath).toBe('/test.ts')
      })

      it('should include suggestion for !! violation', () => {
        const code = 'const b = !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].suggestion).toContain('Boolean')
      })

      it('should include suggestion for + violation', () => {
        const code = 'const n = +value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].suggestion).toContain('Number')
      })

      it('should include suggestion for string concat violation', () => {
        const code = 'const s = x + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].suggestion).toContain('String')
      })

      it('should include suggestion for * 1 violation', () => {
        const code = 'const n = x * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations[0].suggestion).toContain('Number')
      })
    })

    describe('combined violations', () => {
      it('should handle multiple violations in same file', () => {
        const code = `
          const bool = !!value;
          const num = +str;
          const str2 = val + "";
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(3)
      })

      it('should handle all four violation types in one file', () => {
        const code = `
          const a = !!x;
          const b = +y;
          const c = z + "";
          const d = w * 1;
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(4)
      })

      it('should report each violation separately', () => {
        const code = `
          const a = !!x;
          const b = !!y;
          const c = !!z;
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        expect(bangViolations.length).toBeGreaterThanOrEqual(3)
      })

      it('should report unary plus and double bang separately', () => {
        const code = 'const a = !!x; const b = +y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        const plusViolations = violations.filter((v) => v.message.includes('unary plus'))
        expect(bangViolations.length).toBeGreaterThanOrEqual(1)
        expect(plusViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should handle mixed violations with string concat and multiplication', () => {
        const code = `
          const a = x + "";
          const b = y * 1;
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        const stringViolations = violations.filter((v) =>
          v.message.includes('string concatenation'),
        )
        const multViolations = violations.filter((v) => v.message.includes('multiplication'))
        expect(stringViolations.length).toBeGreaterThanOrEqual(1)
        expect(multViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should not report violations when all options are enabled', () => {
        const code = `
          const a = !!x;
          const b = +y;
          const c = z + "";
          const d = w * 1;
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, {
          allowDoubleBang: true,
          allowUnaryPlus: true,
          allowStringConcat: true,
          allowNumericConcat: true,
        })
        expect(violations).toHaveLength(0)
      })
    })

    describe('option combinations', () => {
      it('should only allow double bang when specified', () => {
        const code = 'const a = !!x; const b = +y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowDoubleBang: true })
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        const plusViolations = violations.filter((v) => v.message.includes('unary plus'))
        expect(bangViolations).toHaveLength(0)
        expect(plusViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should only allow unary plus when specified', () => {
        const code = 'const a = !!x; const b = +y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowUnaryPlus: true })
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        const plusViolations = violations.filter((v) => v.message.includes('unary plus'))
        expect(bangViolations.length).toBeGreaterThanOrEqual(1)
        expect(plusViolations).toHaveLength(0)
      })

      it('should only allow string concat when specified', () => {
        const code = 'const a = x + ""; const b = +y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowStringConcat: true })
        const stringViolations = violations.filter((v) =>
          v.message.includes('string concatenation'),
        )
        const plusViolations = violations.filter((v) => v.message.includes('unary plus'))
        expect(stringViolations).toHaveLength(0)
        expect(plusViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should only allow numeric concat when specified', () => {
        const code = 'const a = x * 1; const b = !!y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowNumericConcat: true })
        const multViolations = violations.filter((v) => v.message.includes('multiplication'))
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        expect(multViolations).toHaveLength(0)
        expect(bangViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should allow double bang and unary plus together', () => {
        const code = 'const a = !!x; const b = +y; const c = z + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, {
          allowDoubleBang: true,
          allowUnaryPlus: true,
        })
        const remaining = violations.filter(
          (v) => !v.message.includes('double bang') && !v.message.includes('unary plus'),
        )
        expect(remaining.length).toBeGreaterThanOrEqual(1)
      })

      it('should allow string concat and numeric concat together', () => {
        const code = 'const a = x + ""; const b = y * 1; const c = !!z;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, {
          allowStringConcat: true,
          allowNumericConcat: true,
        })
        const remaining = violations.filter(
          (v) =>
            !v.message.includes('string concatenation') && !v.message.includes('multiplication'),
        )
        expect(remaining.length).toBeGreaterThanOrEqual(1)
      })

      it('should handle empty options object', () => {
        const code = 'const a = !!x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, {})
        expect(violations.length).toBeGreaterThanOrEqual(1)
      })

      it('should handle partial options object', () => {
        const code = 'const a = !!x; const b = +y;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile, { allowDoubleBang: true })
        const bangViolations = violations.filter((v) => v.message.includes('double bang'))
        expect(bangViolations).toHaveLength(0)
      })
    })

    describe('edge cases', () => {
      it('should handle empty file', () => {
        const sourceFile = createSourceFile('')
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle file with no violations', () => {
        const code = `
          const bool = Boolean(value);
          const num = Number(str);
          const str = String(val);
        `
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle file with only comments', () => {
        const code = '// just a comment\n/* block comment */'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle file with only whitespace', () => {
        const code = '   \n\n   \t  '
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should handle deeply nested !! expressions', () => {
        const code = 'const b = !!(a || (b && c));'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle !! in arrow function body', () => {
        const code = 'const fn = () => !!value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle + in arrow function body', () => {
        const code = 'const fn = () => +value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle string concat in arrow function body', () => {
        const code = 'const fn = () => value + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle multiplication in arrow function body', () => {
        const code = 'const fn = () => value * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle !! in class method', () => {
        const code = 'class C { isValid() { return !!this.value; } }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle + in class method', () => {
        const code = 'class C { toNum() { return +this.value; } }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle string concat in class method', () => {
        const code = 'class C { toStr() { return this.value + ""; } }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle * 1 in class method', () => {
        const code = 'class C { toNum() { return this.value * 1; } }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in switch case', () => {
        const code = 'switch(x) { case 1: const b = !!y; break; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in for loop', () => {
        const code = 'for (let i = 0; i < !!arr.length; i++) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in for-in loop', () => {
        const code = 'for (const k in !!obj) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in for-of loop', () => {
        const code = 'for (const x of !!arr) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in try-catch', () => {
        const code = 'try { const b = !!x; } catch(e) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in catch clause', () => {
        const code = 'try {} catch(e) { const b = !!x; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in finally clause', () => {
        const code = 'try {} finally { const b = !!x; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in destructuring', () => {
        const code = 'const { x = !!defaultVal } = obj;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in array destructuring', () => {
        const code = 'const [x = !!defaultVal] = arr;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in type assertion', () => {
        const code = 'const b = !!((x as any));'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in generic function', () => {
        const code = 'function fn<T>(val: T) { return !!val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in async function', () => {
        const code = 'async function fn() { return !!await val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in exported function', () => {
        const code = 'export function fn() { return !!val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in default export', () => {
        const code = 'export default function() { return !!val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in namespace', () => {
        const code = 'namespace NS { export const b = !!val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in module declaration', () => {
        const code = 'declare module "foo" { const b = !!val; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })
    })

    describe('type-aware false negatives', () => {
      it('should not flag addition of two identifiers as string concat', () => {
        const code = 'const result = a + b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag subtraction', () => {
        const code = 'const result = a - b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag division', () => {
        const code = 'const result = a / b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag modulo', () => {
        const code = 'const result = a % b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag exponentiation', () => {
        const code = 'const result = a ** b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag bitwise AND', () => {
        const code = 'const result = a & b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag bitwise OR', () => {
        const code = 'const result = a | b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag bitwise XOR', () => {
        const code = 'const result = a ^ b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag left shift', () => {
        const code = 'const result = a << b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag right shift', () => {
        const code = 'const result = a >> b;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag minus operator on identifier', () => {
        const code = 'const result = -x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag tilde operator on identifier', () => {
        const code = 'const result = ~x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag logical NOT on boolean', () => {
        const code = 'const result = !true;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag equality check', () => {
        const code = 'const result = x == true;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })

      it('should not flag strict equality check', () => {
        const code = 'const result = x === true;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(0)
      })
    })

    describe('real-world patterns', () => {
      it('should flag !! in filter callback', () => {
        const code = 'const items = arr.filter(x => !!x.active);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in map callback', () => {
        const code = 'const flags = arr.map(x => !!x);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + in parseInt-like usage', () => {
        const code = 'const n = +input.value;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + with Date.getTime pattern', () => {
        const code = 'const ts = +new Date();'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag string concat with template-like pattern', () => {
        const code = 'const msg = "Count: " + count + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag * 1 in parse-like pattern', () => {
        const code = 'const n = strValue * 1;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in React-like conditional rendering', () => {
        const code = 'const el = !!visible && <Comp />;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag + in coercion for comparison', () => {
        const code = 'if (+str > 10) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag chaining multiple coercions', () => {
        const code = 'const x = !!+str;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should handle violation in default parameter', () => {
        const code = 'function fn(x = !!defaultVal) {}'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violation in type guard', () => {
        const code = 'const isString = !!((<any>val).length);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should flag !! in conditional type check', () => {
        const code = 'const hasProp = !!obj && !!obj.prop;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations.length).toBeGreaterThanOrEqual(2)
      })

      it('should handle violations in chained assignments', () => {
        const code = 'let a: boolean; a = !!val;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in compound assignment context', () => {
        const code = 'let x = ""; x = x + val + "";'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        const concatViolations = violations.filter((v) =>
          v.message.includes('string concatenation'),
        )
        expect(concatViolations.length).toBeGreaterThanOrEqual(1)
      })

      it('should handle violations in spread argument', () => {
        const code = 'const arr = [...!!x ? [1] : [2]];'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in void expression', () => {
        const code = 'void !!x;'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in typeof check', () => {
        const code = 'if (typeof x === "string") { const n = +x; }'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in instanceof check', () => {
        const code = 'const b = !!(x instanceof Foo);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })

      it('should handle violations in as expression', () => {
        const code = 'const n = +(x as string);'
        const sourceFile = createSourceFile(code)
        const violations = analyzeNoImplicitCoercion(sourceFile)
        expect(violations).toHaveLength(1)
      })
    })
  })

  describe('noImplicitCoercionRule', () => {
    it('should have correct meta name', () => {
      expect(noImplicitCoercionRule.meta.name).toBe('no-implicit-coercion')
    })

    it('should have correct meta category', () => {
      expect(noImplicitCoercionRule.meta.category).toBe('style')
    })

    it('should have correct meta fixable', () => {
      expect(noImplicitCoercionRule.meta.fixable).toBe('code')
    })

    it('should have correct meta description', () => {
      expect(noImplicitCoercionRule.meta.description).toContain('implicit')
      expect(noImplicitCoercionRule.meta.description).toContain('coercion')
    })

    it('should not be recommended by default', () => {
      expect(noImplicitCoercionRule.meta.recommended).toBe(false)
    })

    it('should have default options', () => {
      expect(noImplicitCoercionRule.defaultOptions).toEqual({
        allowDoubleBang: false,
        allowUnaryPlus: false,
        allowStringConcat: false,
        allowNumericConcat: false,
      })
    })

    it('should have allowDoubleBang default to false', () => {
      expect(noImplicitCoercionRule.defaultOptions.allowDoubleBang).toBe(false)
    })

    it('should have allowUnaryPlus default to false', () => {
      expect(noImplicitCoercionRule.defaultOptions.allowUnaryPlus).toBe(false)
    })

    it('should have allowStringConcat default to false', () => {
      expect(noImplicitCoercionRule.defaultOptions.allowStringConcat).toBe(false)
    })

    it('should have allowNumericConcat default to false', () => {
      expect(noImplicitCoercionRule.defaultOptions.allowNumericConcat).toBe(false)
    })

    it('should create visitor with visitNode method', () => {
      const result = noImplicitCoercionRule.create(noImplicitCoercionRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    it('should return violations via onComplete', () => {
      const result = noImplicitCoercionRule.create(noImplicitCoercionRule.defaultOptions)
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    it('should create independent instances for each create call', () => {
      const result1 = noImplicitCoercionRule.create(noImplicitCoercionRule.defaultOptions)
      const result2 = noImplicitCoercionRule.create(noImplicitCoercionRule.defaultOptions)
      expect(result1).not.toBe(result2)
    })

    it('should merge options with defaults', () => {
      const result = noImplicitCoercionRule.create({ allowDoubleBang: true })
      expect(result.visitor).toBeDefined()
    })

    it('should handle create with empty options', () => {
      const result = noImplicitCoercionRule.create({})
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
    })

    it('should handle create with all options enabled', () => {
      const result = noImplicitCoercionRule.create({
        allowDoubleBang: true,
        allowUnaryPlus: true,
        allowStringConcat: true,
        allowNumericConcat: true,
      })
      expect(result.visitor).toBeDefined()
    })

    it('should have meta description mentioning double bang', () => {
      expect(noImplicitCoercionRule.meta.description).toContain('!!')
    })

    it('should have meta description mentioning unary plus', () => {
      expect(noImplicitCoercionRule.meta.description).toContain('+')
    })

    it('should have meta description mentioning concatenation', () => {
      expect(noImplicitCoercionRule.meta.description).toContain('concatenation')
    })
  })
})
