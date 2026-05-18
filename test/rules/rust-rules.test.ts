import { describe, expect, it } from 'vitest'

import { analyzeNoCloneOnLargeType, noCloneOnLargeTypeRule } from '../../src/rules/languages/rust/no-clone-on-large-type.js'
import { analyzeNoExpectWithoutMsg, noExpectWithoutMsgRule } from '../../src/rules/languages/rust/no-expect-without-msg.js'
import { analyzeNoUnwrap, noUnwrapRule } from '../../src/rules/languages/rust/no-unwrap.js'

// ─── Section: rust/no-clone-on-large-type ───

describe('rust/no-clone-on-large-type', () => {
  it('reports .clone() on a String variable', () => {
    const code = 'let name = String::from("test");\nlet copy = name.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('clone')
    expect(violations[0]!.message).toContain('large type')
    expect(violations[0]!.ruleId).toBe('rust/no-clone-on-large-type')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports .clone() on a Vec variable', () => {
    const code = 'let items: Vec<i32> = vec![1, 2, 3];\nlet copy = items.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a HashMap variable', () => {
    const code = 'let map: HashMap<String, i32> = HashMap::new();\nlet copy = map.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a HashSet variable', () => {
    const code = 'let set: HashSet<u32> = HashSet::new();\nlet copy = set.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a BTreeMap variable', () => {
    const code = 'let map: BTreeMap<String, i32> = BTreeMap::new();\nlet copy = map.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a VecDeque variable', () => {
    const code = 'let deque: VecDeque<i32> = VecDeque::new();\nlet copy = deque.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a LinkedList variable', () => {
    const code = 'let list: LinkedList<i32> = LinkedList::new();\nlet copy = list.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a BinaryHeap variable', () => {
    const code = 'let heap: BinaryHeap<i32> = BinaryHeap::new();\nlet copy = heap.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .clone() on a PathBuf variable', () => {
    const code = 'let path: PathBuf = PathBuf::from("/tmp");\nlet copy = path.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('does not report .clone() without large type context', () => {
    const code = 'let x = 42;\nlet copy = x.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .clone() in a comment', () => {
    const code = '// let copy = items.clone();\nlet x = 42;'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .clone() in a block comment', () => {
    const code = '/* let copy = items.clone(); */\nlet x = 42;'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple .clone() calls on large types', () => {
    const code = [
      'let a = String::from("hello");',
      'let b = a.clone();',
      'let c = Vec::new();',
      'let d = c.clone();',
    ].join('\n')
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(2)
  })

  it('detects large type context within 5 lines above', () => {
    const code = [
      'let data: Vec<u8> = vec![];',
      'let x = 1;',
      'let y = 2;',
      'let z = 3;',
      'let w = 4;',
      'let copy = data.clone();',
    ].join('\n')
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations).toHaveLength(1)
  })

  it('uses the provided filePath in violations', () => {
    const code = 'let s = String::new();\nlet c = s.clone();'
    const violations = analyzeNoCloneOnLargeType(code, 'src/main.rs')

    expect(violations[0]!.filePath).toBe('src/main.rs')
  })

  it('reports correct line number', () => {
    const code = 'let s = String::new();\nlet c = s.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations[0]!.range.start.line).toBe(2)
  })

  it('includes suggestion in violation', () => {
    const code = 'let s = String::new();\nlet c = s.clone();'
    const violations = analyzeNoCloneOnLargeType(code)

    expect(violations[0]!.suggestion).toContain('&T')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noCloneOnLargeTypeRule.meta.category).toBe('performance')
    expect(noCloneOnLargeTypeRule.meta.description).toContain('clone')
    expect(noCloneOnLargeTypeRule.meta.name).toBe('rust/no-clone-on-large-type')
    expect(noCloneOnLargeTypeRule.meta.recommended).toBe(false)
    expect(noCloneOnLargeTypeRule.meta.severity).toBe('info')
  })
})

// ─── Section: rust/no-expect-without-msg ───

describe('rust/no-expect-without-msg', () => {
  it('reports .expect("") with empty message', () => {
    const code = 'result.expect("")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('vague')
    expect(violations[0]!.ruleId).toBe('rust/no-expect-without-msg')
    expect(violations[0]!.severity).toBe('info')
  })

  it('reports .expect("error") with generic message', () => {
    const code = 'result.expect("error")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('error')
  })

  it('reports .expect("err") with short generic message', () => {
    const code = 'val.expect("err")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("failed")', () => {
    const code = 'result.expect("failed")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("fail")', () => {
    const code = 'result.expect("fail")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("oops")', () => {
    const code = 'result.expect("oops")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("bad")', () => {
    const code = 'result.expect("bad")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("wrong")', () => {
    const code = 'result.expect("wrong")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("todo")', () => {
    const code = 'result.expect("todo")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("fixme")', () => {
    const code = 'result.expect("fixme")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('does not report .expect() with descriptive message', () => {
    const code = 'result.expect("failed to parse config file")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .expect() with specific error description', () => {
    const code = 'file.read().expect("unable to read from socket")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .expect() in a comment', () => {
    const code = '// result.expect("error")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .expect() in a block comment', () => {
    const code = '/* result.expect("error") */'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple .expect() with vague messages', () => {
    const code = [
      'result.expect("error");',
      'value.expect("fail");',
    ].join('\n')
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(2)
  })

  it('uses the provided filePath in violations', () => {
    const code = 'result.expect("error")'
    const violations = analyzeNoExpectWithoutMsg(code, 'src/lib.rs')

    expect(violations[0]!.filePath).toBe('src/lib.rs')
  })

  it('reports correct line number', () => {
    const code = 'let x = 1;\nresult.expect("error")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations[0]!.range.start.line).toBe(2)
  })

  it('includes suggestion in violation', () => {
    const code = 'result.expect("")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations[0]!.suggestion).toContain('descriptive message')
  })

  it('reports case-insensitive vague messages', () => {
    const code = 'result.expect("Error")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .expect("no") as vague', () => {
    const code = 'result.expect("no")'
    const violations = analyzeNoExpectWithoutMsg(code)

    expect(violations).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noExpectWithoutMsgRule.meta.category).toBe('patterns')
    expect(noExpectWithoutMsgRule.meta.description).toContain('expect')
    expect(noExpectWithoutMsgRule.meta.name).toBe('rust/no-expect-without-msg')
    expect(noExpectWithoutMsgRule.meta.recommended).toBe(false)
    expect(noExpectWithoutMsgRule.meta.severity).toBe('info')
  })
})

// ─── Section: rust/no-unwrap ───

describe('rust/no-unwrap', () => {
  it('reports .unwrap() on result', () => {
    const code = 'result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.message).toContain('unwrap')
    expect(violations[0]!.message).toContain('panic')
    expect(violations[0]!.ruleId).toBe('rust/no-unwrap')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('reports .unwrap() on option', () => {
    const code = 'option.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .unwrap() on chained expression', () => {
    const code = 'fs::read_to_string("file.txt").unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(1)
  })

  it('reports .unwrap() with spaces in parens', () => {
    const code = 'result.unwrap(  )'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(1)
  })

  it('does not report .unwrap() in a comment', () => {
    const code = '// result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .unwrap() in a block comment', () => {
    const code = '/* result.unwrap() */'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(0)
  })

  it('does not report .unwrap() in a line starting with comment asterisk', () => {
    const code = ' * result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(0)
  })

  it('reports multiple .unwrap() calls on separate lines', () => {
    const code = [
      'let a = result.unwrap();',
      'let b = option.unwrap();',
    ].join('\n')
    const violations = analyzeNoUnwrap(code)

    expect(violations).toHaveLength(2)
  })

  it('reports correct line numbers for each violation', () => {
    const code = [
      'let x = 1;',
      'let a = result.unwrap();',
      'let b = option.unwrap();',
    ].join('\n')
    const violations = analyzeNoUnwrap(code)

    expect(violations[0]!.range.start.line).toBe(2)
    expect(violations[1]!.range.start.line).toBe(3)
  })

  it('uses the provided filePath in violations', () => {
    const code = 'result.unwrap()'
    const violations = analyzeNoUnwrap(code, 'src/main.rs')

    expect(violations[0]!.filePath).toBe('src/main.rs')
  })

  it('uses default filePath when not provided', () => {
    const code = 'result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations[0]!.filePath).toBe('<input>')
  })

  it('includes suggestion in violation', () => {
    const code = 'result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations[0]!.suggestion).toContain('pattern matching')
    expect(violations[0]!.suggestion).toContain('unwrap_or_default')
  })

  it('reports correct column for .unwrap()', () => {
    const code = '    result.unwrap()'
    const violations = analyzeNoUnwrap(code)

    expect(violations[0]!.range.start.column).toBe(10)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnwrapRule.meta.category).toBe('correctness')
    expect(noUnwrapRule.meta.description).toContain('unwrap')
    expect(noUnwrapRule.meta.name).toBe('rust/no-unwrap')
    expect(noUnwrapRule.meta.recommended).toBe(true)
    expect(noUnwrapRule.meta.severity).toBe('warning')
  })
})
