import type { DecoratorInfo, DecoratorTarget, DecoratorUsage, DecoratorReport } from './types.js'

export class DecoratorAnalyzer {
  analyze(decorators: DecoratorInfo[], source: string = ''): DecoratorReport {
    const byTarget: Record<DecoratorTarget, number> = {
      class: 0,
      method: 0,
      property: 0,
      parameter: 0,
      accessor: 0,
    }

    const byName: Record<string, number> = {}

    for (const d of decorators) {
      byTarget[d.target]++
      byName[d.name] = (byName[d.name] ?? 0) + 1
    }

    return {
      totalDecorators: decorators.length,
      uniqueDecorators: Object.keys(byName).length,
      byTarget,
      byName,
      usages: this.getUsages(decorators),
      source,
    }
  }

  getUsages(decorators: DecoratorInfo[]): DecoratorUsage[] {
    const usageMap = new Map<string, DecoratorUsage>()

    for (const d of decorators) {
      const existing = usageMap.get(d.name)
      if (existing) {
        existing.frequency++
        if (!existing.targets.includes(d.target)) {
          existing.targets.push(d.target)
        }
        if (d.args.length > 0) {
          existing.hasArguments = true
          existing.argPatterns.push(d.args.map((a) => a.kind))
        }
      } else {
        usageMap.set(d.name, {
          name: d.name,
          targets: [d.target],
          frequency: 1,
          hasArguments: d.args.length > 0,
          argPatterns: d.args.length > 0 ? [d.args.map((a) => a.kind)] : [],
        })
      }
    }

    return [...usageMap.values()]
  }

  getByTarget(decorators: DecoratorInfo[], target: DecoratorTarget): DecoratorInfo[] {
    return decorators.filter((d) => d.target === target)
  }

  getByName(decorators: DecoratorInfo[], name: string): DecoratorInfo[] {
    return decorators.filter((d) => d.name === name)
  }

  getDeprecated(decorators: DecoratorInfo[]): DecoratorInfo[] {
    return decorators.filter((d) => {
      const lower = d.name.toLowerCase()
      return lower === 'deprecated' || lower.includes('deprecated')
    })
  }

  getExperimental(decorators: DecoratorInfo[]): DecoratorInfo[] {
    return decorators.filter((d) => {
      const lower = d.name.toLowerCase()
      return lower === 'experimental' || lower.includes('experimental')
    })
  }

  findUnused(decorators: DecoratorInfo[], usedNames: Set<string>): DecoratorInfo[] {
    return decorators.filter((d) => !usedNames.has(d.name))
  }
}
