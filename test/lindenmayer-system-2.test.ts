import { describe, it, expect } from 'vitest';
import { LindenmayerSystem2 } from '../src/core/lindenmayer-system-2/index.js';

describe('LindenmayerSystem2', () => {
  it('should initialize with axiom and rules', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getCurrent()).toBe('A');
    expect(system.getAxiom()).toBe('A');
    expect(system.getRules()).toEqual(rules);
  });

  it('should return axiom when iterate(0) is called', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(0)).toBe('A');
    expect(system.getCurrent()).toBe('A');
  });

  it('should apply rules once with iterate(1)', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(1)).toBe('B');
    expect(system.getCurrent()).toBe('B');
  });

  it('should apply rules multiple times with iterate(n)', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(0)).toBe('A');
    expect(system.iterate(1)).toBe('B');
    expect(system.iterate(1)).toBe('AB');
    expect(system.iterate(1)).toBe('BAB');
    expect(system.iterate(1)).toBe('ABBAB');
  });

  it('should apply rules once with iterateOnce', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterateOnce()).toBe('B');
    expect(system.getCurrent()).toBe('B');
  });

  it('should return current string with getCurrent', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getCurrent()).toBe('A');
    system.iterateOnce();
    expect(system.getCurrent()).toBe('B');
    system.iterateOnce();
    expect(system.getCurrent()).toBe('AB');
  });

  it('should reset to axiom', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    system.iterate(3);
    expect(system.getCurrent()).toBe('BAB');

    system.reset();
    expect(system.getCurrent()).toBe('A');
  });

  it('should return axiom with getAxiom', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getAxiom()).toBe('A');

    system.iterate(5);
    expect(system.getAxiom()).toBe('A');
  });

  it('should return a copy of rules with getRules', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    const returnedRules = system.getRules();
    expect(returnedRules).toEqual(rules);

    system.addRule('C', 'D');
    expect(returnedRules.has('C')).toBe(false);
  });

  it('should add a rule with addRule', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B']]);
    const system = new LindenmayerSystem2(axiom, rules);

    system.addRule('B', 'AB');
    expect(system.getRules().get('B')).toBe('AB');

    system.iterate(2);
    expect(system.getCurrent()).toBe('AB');
  });

  it('should remove a rule with removeRule', () => {
    const axiom = 'A';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.removeRule('B')).toBe(true);
    expect(system.getRules().has('B')).toBe(false);
    expect(system.removeRule('B')).toBe(false);
  });

  it('should pass through characters not in rules', () => {
    const axiom = 'AB';
    const rules = new Map([['A', 'B']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(1)).toBe('BB');
    expect(system.getCurrent()).toBe('BB');

    system.iterate(1);
    expect(system.getCurrent()).toBe('BB');
  });

  it('should handle empty axiom', () => {
    const axiom = '';
    const rules = new Map([['A', 'B']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getCurrent()).toBe('');
    expect(system.iterate(1)).toBe('');
    expect(system.iterate(5)).toBe('');
  });

  it('should handle empty rules map', () => {
    const axiom = 'ABC';
    const rules = new Map<string, string>();
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getCurrent()).toBe('ABC');
    expect(system.iterate(1)).toBe('ABC');
    expect(system.iterate(5)).toBe('ABC');
  });

  it('should handle no matching rules for all characters', () => {
    const axiom = 'XYZ';
    const rules = new Map([['A', 'B'], ['B', 'AB']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.getCurrent()).toBe('XYZ');
    expect(system.iterate(1)).toBe('XYZ');
    expect(system.iterate(5)).toBe('XYZ');
  });

  it('should handle rules that replace with empty string', () => {
    const axiom = 'ABA';
    const rules = new Map([['A', '']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(1)).toBe('B');
    expect(system.iterate(1)).toBe('B');
  });

  it('should handle multi-character replacements', () => {
    const axiom = 'F';
    const rules = new Map([['F', 'F+F-F-F+F']]);
    const system = new LindenmayerSystem2(axiom, rules);

    expect(system.iterate(1)).toBe('F+F-F-F+F');
    expect(system.iterate(1)).toBe('F+F-F-F+F+F+F-F-F+F-F+F-F-F+F-F+F-F-F+F+F+F-F-F+F');
  });

  it('should maintain independent state between instances', () => {
    const rules1 = new Map([['A', 'B'], ['B', 'AB']]);
    const rules2 = new Map([['A', 'AB'], ['B', 'A']]);
    const system1 = new LindenmayerSystem2('A', rules1);
    const system2 = new LindenmayerSystem2('A', rules2);

    system1.iterate(3);
    system2.iterate(3);

    expect(system1.getCurrent()).toBe('BAB');
    expect(system2.getCurrent()).toBe('ABAAB');

    system1.reset();
    expect(system1.getCurrent()).toBe('A');
    expect(system2.getCurrent()).toBe('ABAAB');
  });
});
