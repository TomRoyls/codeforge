import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzeNoUnnecessaryCondition,
  noUnnecessaryConditionRule,
} from '../../../../src/rules/best-practices/no-unnecessary-condition.js'

describe('no-unnecessary-condition rule', () => {
  const createSourceFile = (code: string) => {
    const project = new Project({ useInMemoryFileSystem: true })
    return project.createSourceFile('test.ts', code)
  }

  describe('rule metadata', () => {
    it('should have correct rule name', () => {
      expect(noUnnecessaryConditionRule.meta.name).toBe('no-unnecessary-condition')
    })

    it('should have style category', () => {
      expect(noUnnecessaryConditionRule.meta.category).toBe('style')
    })

    it('should not be fixable', () => {
      expect(noUnnecessaryConditionRule.meta.fixable).toBeUndefined()
    })

    it('should have a description', () => {
      expect(noUnnecessaryConditionRule.meta.description).toContain('unnecessary')
    })

    it('should have default options with checkConstantConditions true', () => {
      expect(noUnnecessaryConditionRule.defaultOptions.checkConstantConditions).toBe(true)
    })

    it('should not be recommended', () => {
      expect(noUnnecessaryConditionRule.meta.recommended).toBe(false)
    })

    it('should export a create function', () => {
      expect(typeof noUnnecessaryConditionRule.create).toBe('function')
    })
  })

  describe('strict equality === always true', () => {
    it('should flag true === true', () => {
      const sourceFile = createSourceFile('if (true === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag false === false', () => {
      const sourceFile = createSourceFile('if (false === false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 === 0', () => {
      const sourceFile = createSourceFile('if (0 === 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 === 1', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 42 === 42', () => {
      const sourceFile = createSourceFile('if (42 === 42) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should not flag negative literals since they are prefix unary expressions', () => {
      const sourceFile = createSourceFile('if (-1 === -1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should flag "a" === "a"', () => {
      const sourceFile = createSourceFile('if ("a" === "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "hello" === "hello"', () => {
      const sourceFile = createSourceFile('if ("hello" === "hello") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "" === ""', () => {
      const sourceFile = createSourceFile('if ("" === "") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null === null', () => {
      const sourceFile = createSourceFile('if (null === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.14 === 3.14', () => {
      const sourceFile = createSourceFile('if (3.14 === 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 100 === 100', () => {
      const sourceFile = createSourceFile('if (100 === 100) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "x" === "x" in ternary', () => {
      const sourceFile = createSourceFile('const r = "x" === "x" ? 1 : 2;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 5 === 5 in while loop', () => {
      const sourceFile = createSourceFile('while (5 === 5) { break; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0.5 === 0.5', () => {
      const sourceFile = createSourceFile('if (0.5 === 0.5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('strict equality === always false', () => {
    it('should flag true === false', () => {
      const sourceFile = createSourceFile('if (true === false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag false === true', () => {
      const sourceFile = createSourceFile('if (false === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 === 2', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 === 1', () => {
      const sourceFile = createSourceFile('if (0 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "a" === "b"', () => {
      const sourceFile = createSourceFile('if ("a" === "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "x" === "y"', () => {
      const sourceFile = createSourceFile('if ("x" === "y") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 === null', () => {
      const sourceFile = createSourceFile('if (0 === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag true === null', () => {
      const sourceFile = createSourceFile('if (true === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag false === null', () => {
      const sourceFile = createSourceFile('if (false === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "a" === null', () => {
      const sourceFile = createSourceFile('if ("a" === null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 === "1"', () => {
      const sourceFile = createSourceFile('if (1 === "1") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 10 === 20', () => {
      const sourceFile = createSourceFile('if (10 === 20) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "abc" === "def"', () => {
      const sourceFile = createSourceFile('if ("abc" === "def") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 99 === 100 in ternary', () => {
      const sourceFile = createSourceFile('const r = 99 === 100 ? 1 : 2;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null === 0', () => {
      const sourceFile = createSourceFile('if (null === 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('loose equality == always true', () => {
    it('should flag true == true', () => {
      const sourceFile = createSourceFile('if (true == true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 == 1', () => {
      const sourceFile = createSourceFile('if (1 == 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "a" == "a"', () => {
      const sourceFile = createSourceFile('if ("a" == "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null == null', () => {
      const sourceFile = createSourceFile('if (null == null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 == 0', () => {
      const sourceFile = createSourceFile('if (0 == 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag false == false', () => {
      const sourceFile = createSourceFile('if (false == false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "" == ""', () => {
      const sourceFile = createSourceFile('if ("" == "") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 42 == 42', () => {
      const sourceFile = createSourceFile('if (42 == 42) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "hello" == "hello"', () => {
      const sourceFile = createSourceFile('if ("hello" == "hello") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.14 == 3.14', () => {
      const sourceFile = createSourceFile('if (3.14 == 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('loose equality == always false', () => {
    it('should flag 1 == 2', () => {
      const sourceFile = createSourceFile('if (1 == 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "a" == "b"', () => {
      const sourceFile = createSourceFile('if ("a" == "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag true == false', () => {
      const sourceFile = createSourceFile('if (true == false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 == 1', () => {
      const sourceFile = createSourceFile('if (0 == 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "x" == "y"', () => {
      const sourceFile = createSourceFile('if ("x" == "y") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null == 1', () => {
      const sourceFile = createSourceFile('if (null == 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 10 == 20', () => {
      const sourceFile = createSourceFile('if (10 == 20) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag true == null', () => {
      const sourceFile = createSourceFile('if (true == null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('strict inequality !== always true', () => {
    it('should flag true !== false', () => {
      const sourceFile = createSourceFile('if (true !== false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 !== 2', () => {
      const sourceFile = createSourceFile('if (1 !== 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "a" !== "b"', () => {
      const sourceFile = createSourceFile('if ("a" !== "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 !== 1', () => {
      const sourceFile = createSourceFile('if (0 !== 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null !== 0', () => {
      const sourceFile = createSourceFile('if (null !== 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag true !== null', () => {
      const sourceFile = createSourceFile('if (true !== null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "x" !== "y"', () => {
      const sourceFile = createSourceFile('if ("x" !== "y") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 10 !== 20', () => {
      const sourceFile = createSourceFile('if (10 !== 20) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag false !== true', () => {
      const sourceFile = createSourceFile('if (false !== true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null !== false', () => {
      const sourceFile = createSourceFile('if (null !== false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('strict inequality !== always false', () => {
    it('should flag true !== true', () => {
      const sourceFile = createSourceFile('if (true !== true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag false !== false', () => {
      const sourceFile = createSourceFile('if (false !== false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 !== 1', () => {
      const sourceFile = createSourceFile('if (1 !== 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "a" !== "a"', () => {
      const sourceFile = createSourceFile('if ("a" !== "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null !== null', () => {
      const sourceFile = createSourceFile('if (null !== null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 !== 0', () => {
      const sourceFile = createSourceFile('if (0 !== 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 42 !== 42', () => {
      const sourceFile = createSourceFile('if (42 !== 42) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "" !== ""', () => {
      const sourceFile = createSourceFile('if ("" !== "") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "hello" !== "hello"', () => {
      const sourceFile = createSourceFile('if ("hello" !== "hello") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 100 !== 100', () => {
      const sourceFile = createSourceFile('if (100 !== 100) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('loose inequality != always true', () => {
    it('should flag true != false', () => {
      const sourceFile = createSourceFile('if (true != false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 != 2', () => {
      const sourceFile = createSourceFile('if (1 != 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "a" != "b"', () => {
      const sourceFile = createSourceFile('if ("a" != "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 != 1', () => {
      const sourceFile = createSourceFile('if (0 != 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 10 != 20', () => {
      const sourceFile = createSourceFile('if (10 != 20) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag "x" != "y"', () => {
      const sourceFile = createSourceFile('if ("x" != "y") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null != 1', () => {
      const sourceFile = createSourceFile('if (null != 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag null != true', () => {
      const sourceFile = createSourceFile('if (null != true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('loose inequality != always false', () => {
    it('should flag true != true', () => {
      const sourceFile = createSourceFile('if (true != true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 != 1', () => {
      const sourceFile = createSourceFile('if (1 != 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "a" != "a"', () => {
      const sourceFile = createSourceFile('if ("a" != "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null != null', () => {
      const sourceFile = createSourceFile('if (null != null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 42 != 42', () => {
      const sourceFile = createSourceFile('if (42 != 42) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag false != false', () => {
      const sourceFile = createSourceFile('if (false != false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "" != ""', () => {
      const sourceFile = createSourceFile('if ("" != "") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 != 0', () => {
      const sourceFile = createSourceFile('if (0 != 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('greater than > always true', () => {
    it('should flag 2 > 1', () => {
      const sourceFile = createSourceFile('if (2 > 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 10 > 5', () => {
      const sourceFile = createSourceFile('if (10 > 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 > 0', () => {
      const sourceFile = createSourceFile('if (1 > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 100 > 99', () => {
      const sourceFile = createSourceFile('if (100 > 99) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0.1 > 0', () => {
      const sourceFile = createSourceFile('if (0.1 > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.15 > 3.14', () => {
      const sourceFile = createSourceFile('if (3.15 > 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should not flag number > negative since negative is prefix unary expression', () => {
      const sourceFile = createSourceFile('if (50 > -1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('greater than > always false', () => {
    it('should flag 1 > 2', () => {
      const sourceFile = createSourceFile('if (1 > 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 > 1', () => {
      const sourceFile = createSourceFile('if (0 > 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 5 > 10', () => {
      const sourceFile = createSourceFile('if (5 > 10) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 > 1', () => {
      const sourceFile = createSourceFile('if (1 > 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 > 0', () => {
      const sourceFile = createSourceFile('if (0 > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 3.14 > 3.15', () => {
      const sourceFile = createSourceFile('if (3.14 > 3.15) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('greater than or equal >= always true', () => {
    it('should flag 2 >= 1', () => {
      const sourceFile = createSourceFile('if (2 >= 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 >= 1', () => {
      const sourceFile = createSourceFile('if (1 >= 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 2 >= 2', () => {
      const sourceFile = createSourceFile('if (2 >= 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 10 >= 5', () => {
      const sourceFile = createSourceFile('if (10 >= 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 >= 0', () => {
      const sourceFile = createSourceFile('if (0 >= 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 100 >= 100', () => {
      const sourceFile = createSourceFile('if (100 >= 100) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.14 >= 3.14', () => {
      const sourceFile = createSourceFile('if (3.14 >= 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('greater than or equal >= always false', () => {
    it('should flag 1 >= 2', () => {
      const sourceFile = createSourceFile('if (1 >= 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 >= 1', () => {
      const sourceFile = createSourceFile('if (0 >= 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 5 >= 10', () => {
      const sourceFile = createSourceFile('if (5 >= 10) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 3.14 >= 3.15', () => {
      const sourceFile = createSourceFile('if (3.14 >= 3.15) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('less than < always true', () => {
    it('should flag 1 < 2', () => {
      const sourceFile = createSourceFile('if (1 < 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 < 1', () => {
      const sourceFile = createSourceFile('if (0 < 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 5 < 10', () => {
      const sourceFile = createSourceFile('if (5 < 10) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 < 100', () => {
      const sourceFile = createSourceFile('if (1 < 100) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 < 0.1', () => {
      const sourceFile = createSourceFile('if (0 < 0.1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.14 < 3.15', () => {
      const sourceFile = createSourceFile('if (3.14 < 3.15) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('less than < always false', () => {
    it('should flag 2 < 1', () => {
      const sourceFile = createSourceFile('if (2 < 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 < 0', () => {
      const sourceFile = createSourceFile('if (1 < 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 10 < 5', () => {
      const sourceFile = createSourceFile('if (10 < 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 < 1', () => {
      const sourceFile = createSourceFile('if (1 < 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 < 0', () => {
      const sourceFile = createSourceFile('if (0 < 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 3.15 < 3.14', () => {
      const sourceFile = createSourceFile('if (3.15 < 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('less than or equal <= always true', () => {
    it('should flag 1 <= 2', () => {
      const sourceFile = createSourceFile('if (1 <= 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 1 <= 1', () => {
      const sourceFile = createSourceFile('if (1 <= 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 0 <= 0', () => {
      const sourceFile = createSourceFile('if (0 <= 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 5 <= 10', () => {
      const sourceFile = createSourceFile('if (5 <= 10) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 100 <= 100', () => {
      const sourceFile = createSourceFile('if (100 <= 100) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should flag 3.14 <= 3.14', () => {
      const sourceFile = createSourceFile('if (3.14 <= 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('less than or equal <= always false', () => {
    it('should flag 2 <= 1', () => {
      const sourceFile = createSourceFile('if (2 <= 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 1 <= 0', () => {
      const sourceFile = createSourceFile('if (1 <= 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 10 <= 5', () => {
      const sourceFile = createSourceFile('if (10 <= 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 3.15 <= 3.14', () => {
      const sourceFile = createSourceFile('if (3.15 <= 3.14) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })

  describe('relational operators with non-number literals', () => {
    it('should not flag "a" > "b" (string relational)', () => {
      const sourceFile = createSourceFile('if ("a" > "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag "a" < "b" (string relational)', () => {
      const sourceFile = createSourceFile('if ("a" < "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag "a" >= "a" (string relational)', () => {
      const sourceFile = createSourceFile('if ("a" >= "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag "a" <= "b" (string relational)', () => {
      const sourceFile = createSourceFile('if ("a" <= "b") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag true > false (boolean relational)', () => {
      const sourceFile = createSourceFile('if (true > false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag null > 0 (null relational)', () => {
      const sourceFile = createSourceFile('if (null > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag 1 > null (number-null relational)', () => {
      const sourceFile = createSourceFile('if (1 > null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag true >= false (boolean relational)', () => {
      const sourceFile = createSourceFile('if (true >= false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('valid conditions - no violations', () => {
    it('should not flag variable === literal', () => {
      const sourceFile = createSourceFile('if (x === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag variable === variable', () => {
      const sourceFile = createSourceFile('if (a === b) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag function call === literal', () => {
      const sourceFile = createSourceFile('if (getValue() === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag property access === literal', () => {
      const sourceFile = createSourceFile('if (obj.prop === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag array access === literal', () => {
      const sourceFile = createSourceFile('if (arr[0] === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag method result === literal', () => {
      const sourceFile = createSourceFile('if (str.length === 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag computed property === literal', () => {
      const sourceFile = createSourceFile('if (obj[key] === "a") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag x > 0', () => {
      const sourceFile = createSourceFile('if (x > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag x < 10', () => {
      const sourceFile = createSourceFile('if (x < 10) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag a !== b', () => {
      const sourceFile = createSourceFile('if (a !== b) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag a != b', () => {
      const sourceFile = createSourceFile('if (a != b) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag a == b', () => {
      const sourceFile = createSourceFile('if (a == b) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag fn() > 0', () => {
      const sourceFile = createSourceFile('if (fn() > 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag obj.val !== null', () => {
      const sourceFile = createSourceFile('if (obj.val !== null) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag computed value === literal', () => {
      const sourceFile = createSourceFile('if (a + b === 5) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('non-comparison operators - no violations', () => {
    it('should not flag arithmetic +', () => {
      const sourceFile = createSourceFile('if (1 + 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arithmetic -', () => {
      const sourceFile = createSourceFile('if (5 - 3) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag arithmetic *', () => {
      const sourceFile = createSourceFile('if (2 * 3) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag logical &&', () => {
      const sourceFile = createSourceFile('if (true && false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag logical ||', () => {
      const sourceFile = createSourceFile('if (true || false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag instanceof', () => {
      const sourceFile = createSourceFile('if (x instanceof Object) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag in operator', () => {
      const sourceFile = createSourceFile('if ("key" in obj) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag bitwise &', () => {
      const sourceFile = createSourceFile('if (1 & 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag bitwise |', () => {
      const sourceFile = createSourceFile('if (1 | 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should not flag nullish coalescing', () => {
      const sourceFile = createSourceFile('const x = null ?? "default";')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })
  })

  describe('violation properties', () => {
    it('should set ruleId to no-unnecessary-condition', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].ruleId).toBe('no-unnecessary-condition')
    })

    it('should set severity to warning', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })

    it('should include suggestion in always-true violation', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion).toContain('Remove')
    })

    it('should include suggestion in always-false violation', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].suggestion).toBeDefined()
      expect(violations[0].suggestion).toContain('Remove')
    })

    it('should include range in violation', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    it('should include filePath in violation', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].filePath).toBe('/test.ts')
    })

    it('should include the comparison text in always-true message', () => {
      const sourceFile = createSourceFile('if (42 === 42) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].message).toContain('42 === 42')
    })

    it('should include the comparison text in always-false message', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].message).toContain('1 === 2')
    })

    it('should include operator text in message for !==', () => {
      const sourceFile = createSourceFile('if (true !== true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].message).toContain('true !== true')
    })

    it('should include operator text in message for >', () => {
      const sourceFile = createSourceFile('if (2 > 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].message).toContain('2 > 1')
    })

    it('should produce warning severity for always-false', () => {
      const sourceFile = createSourceFile('if (true === false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })

    it('should produce warning severity for always-true', () => {
      const sourceFile = createSourceFile('if (true === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations[0].severity).toBe('warning')
    })
  })

  describe('multiple conditions in same file', () => {
    it('should detect two always-true conditions', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }\nif (2 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect two always-false conditions', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }\nif (3 === 4) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect mixed true and false conditions', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }\nif (2 === 3) { }\nif (x === y) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect conditions in different statements', () => {
      const sourceFile = createSourceFile('const a = 1 === 1;\nconst b = 2 > 1;\nconst c = x > 0;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should detect three violations in ternaries', () => {
      const sourceFile = createSourceFile(
        'const a = 1 === 1 ? 1 : 2;\nconst b = 2 === 3 ? 1 : 2;\nconst c = 3 > 0 ? 1 : 2;',
      )
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(3)
    })

    it('should detect conditions in while and if', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }\nwhile (2 === 2) { break; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })

    it('should not flag valid conditions mixed with invalid', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }\nif (x === 1) { }\nif (2 === 3) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
      expect(violations[0].message).toContain('always true')
      expect(violations[1].message).toContain('always false')
    })
  })

  describe('different code contexts', () => {
    it('should detect in if statement', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in ternary expression', () => {
      const sourceFile = createSourceFile('const x = 1 === 1 ? "a" : "b";')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in while loop', () => {
      const sourceFile = createSourceFile('while (1 === 1) { break; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in do-while loop', () => {
      const sourceFile = createSourceFile('do { break; } while (1 === 1);')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in variable declaration', () => {
      const sourceFile = createSourceFile('const x = 1 === 1;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in return statement', () => {
      const sourceFile = createSourceFile('function f() { return 1 === 1; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in for loop condition', () => {
      const sourceFile = createSourceFile('for (let i = 0; 1 === 1; i++) { break; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in nested function', () => {
      const sourceFile = createSourceFile(
        'function outer() { function inner() { if (1 === 1) { } } }',
      )
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in arrow function body', () => {
      const sourceFile = createSourceFile('const f = () => 1 === 1;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in logical AND expression with constant condition', () => {
      const sourceFile = createSourceFile('const x = (1 === 1) && true;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in logical OR expression with constant condition', () => {
      const sourceFile = createSourceFile('const x = (1 === 2) || false;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in switch condition', () => {
      const sourceFile = createSourceFile('switch (1 === 1) { case true: break; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in class method', () => {
      const sourceFile = createSourceFile('class C { m() { if (1 === 1) { } } }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect in if-else chain', () => {
      const sourceFile = createSourceFile('if (1 === 1) { } else if (2 === 3) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty file', () => {
      const sourceFile = createSourceFile('')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only comments', () => {
      const sourceFile = createSourceFile('// just a comment')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with no conditions', () => {
      const sourceFile = createSourceFile('const x = 5;')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only a function', () => {
      const sourceFile = createSourceFile('function hello() { return "world"; }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle file with only imports', () => {
      const sourceFile = createSourceFile('import { x } from "y";')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle very large numbers', () => {
      const sourceFile = createSourceFile('if (999999 === 999999) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should handle very small numbers', () => {
      const sourceFile = createSourceFile('if (0.001 === 0.001) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should handle long strings', () => {
      const sourceFile = createSourceFile(
        'if ("abcdefghijklmnopqrstuvwxyz" === "abcdefghijklmnopqrstuvwxyz") { }',
      )
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should handle string with spaces', () => {
      const sourceFile = createSourceFile('if ("hello world" === "hello world") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })

    it('should handle string with special characters', () => {
      const sourceFile = createSourceFile('if ("!@#$%" === "!@#$%") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should not flag negative number relational since negatives are prefix unary expressions', () => {
      const sourceFile = createSourceFile('if (-1 > -2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations).toHaveLength(0)
    })

    it('should handle zero comparison', () => {
      const sourceFile = createSourceFile('if (0 === 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always true')
    })
  })

  describe('options', () => {
    it('should respect checkConstantConditions: false', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {
        checkConstantConditions: false,
      })
      expect(violations).toHaveLength(0)
    })

    it('should detect with default options', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should detect with checkConstantConditions: true', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {
        checkConstantConditions: true,
      })
      expect(violations.length).toBeGreaterThan(0)
    })

    it('should suppress all violations with false for always-false condition', () => {
      const sourceFile = createSourceFile('if (1 === 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {
        checkConstantConditions: false,
      })
      expect(violations).toHaveLength(0)
    })

    it('should suppress all violations with false for relational operators', () => {
      const sourceFile = createSourceFile('if (1 > 2) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {
        checkConstantConditions: false,
      })
      expect(violations).toHaveLength(0)
    })

    it('should suppress multiple violations with false', () => {
      const sourceFile = createSourceFile('if (1 === 1) { }\nif (2 === 3) { }\nif (4 > 3) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {
        checkConstantConditions: false,
      })
      expect(violations).toHaveLength(0)
    })

    it('should use default options when none provided', () => {
      const sourceFile = createSourceFile('if (true === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile, {})
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('rule.create() API', () => {
    it('should return visitor and onComplete', () => {
      const ruleInstance = noUnnecessaryConditionRule.create({})
      expect(ruleInstance.visitor).toBeDefined()
      expect(ruleInstance.onComplete).toBeDefined()
    })

    it('should return violations from onComplete', () => {
      const ruleInstance = noUnnecessaryConditionRule.create({})
      expect(typeof ruleInstance.onComplete).toBe('function')
    })

    it('should have visitNode in visitor', () => {
      const ruleInstance = noUnnecessaryConditionRule.create({})
      expect(typeof ruleInstance.visitor.visitNode).toBe('function')
    })

    it('should collect violations through visitor', () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sourceFile = project.createSourceFile('test.ts', 'if (1 === 1) { }')
      const ruleInstance = noUnnecessaryConditionRule.create({})
      const violations: unknown[] = []
      sourceFile.forEachDescendant((node) => {
        ruleInstance.visitor.visitNode(node, {
          sourceFile,
          violations,
          addViolation: (v: unknown) => violations.push(v),
        })
      })
      const result = ruleInstance.onComplete()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array with checkConstantConditions false', () => {
      const project = new Project({ useInMemoryFileSystem: true })
      const sourceFile = project.createSourceFile('test.ts', 'if (1 === 1) { }')
      const ruleInstance = noUnnecessaryConditionRule.create({ checkConstantConditions: false })
      sourceFile.forEachDescendant((node) => {
        ruleInstance.visitor.visitNode(node, {
          sourceFile,
          violations: [],
          addViolation: () => {},
        })
      })
      const result = ruleInstance.onComplete()
      expect(result).toHaveLength(0)
    })
  })

  describe('mixed type comparisons', () => {
    it('should flag 1 === "1" as always false', () => {
      const sourceFile = createSourceFile('if (1 === "1") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag true === 1 as always false', () => {
      const sourceFile = createSourceFile('if (true === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag false === 0 as always false', () => {
      const sourceFile = createSourceFile('if (false === 0) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null === false as always false', () => {
      const sourceFile = createSourceFile('if (null === false) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag "1" === 1 as always false', () => {
      const sourceFile = createSourceFile('if ("1" === 1) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag 0 === "" as always false', () => {
      const sourceFile = createSourceFile('if (0 === "") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag true === "true" as always false', () => {
      const sourceFile = createSourceFile('if (true === "true") { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })

    it('should flag null === true as always false', () => {
      const sourceFile = createSourceFile('if (null === true) { }')
      const violations = analyzeNoUnnecessaryCondition(sourceFile)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].message).toContain('always false')
    })
  })
})
