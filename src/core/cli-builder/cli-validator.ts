import type { CLICommand, CLIOption, ValidationResult } from './types.js'

export class CLIValidator {
  validateCommand(command: CLICommand): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!command.name || command.name.trim() === '') {
      errors.push('Command name is required')
    }

    if (command.name.includes(' ')) {
      errors.push('Command name cannot contain spaces')
    }

    for (const alias of command.aliases) {
      if (alias.includes(' ')) {
        errors.push(`Alias "${alias}" cannot contain spaces`)
      }
    }

    const argNames = new Set<string>()
    let foundOptional = false
    for (const arg of command.arguments) {
      if (argNames.has(arg.name)) {
        errors.push(`Duplicate argument name: ${arg.name}`)
      }
      argNames.add(arg.name)
      if (!arg.required && !arg.variadic) {
        foundOptional = true
      }
      if (foundOptional && arg.required && !arg.variadic) {
        warnings.push(`Required argument "${arg.name}" appears after optional argument`)
      }
      if (arg.choices && arg.choices.length === 0) {
        warnings.push(`Argument "${arg.name}" has empty choices`)
      }
    }

    const variadicArgs = command.arguments.filter((a) => a.variadic)
    if (variadicArgs.length > 1) {
      errors.push('Only one variadic argument is allowed')
    }
    if (variadicArgs.length === 1) {
      const lastArg = command.arguments[command.arguments.length - 1]
      if (lastArg && !lastArg.variadic) {
        errors.push('Variadic argument must be the last argument')
      }
    }

    const duplicates = this.findDuplicateNames(command)
    for (const dup of duplicates) {
      errors.push(dup)
    }

    const conflicts = this.checkConflicts(command)
    errors.push(...conflicts)

    const deprecations = this.checkDeprecations(command)
    warnings.push(...deprecations)

    for (const opt of command.options) {
      const optResult = this.validateOption(opt)
      errors.push(...optResult.errors)
      warnings.push(...optResult.warnings)
    }

    for (const sub of command.subcommands) {
      if (!sub.name || sub.name.trim() === '') {
        errors.push('Subcommand name is required')
      }
    }

    const subNames = command.subcommands.map((s) => s.name)
    const subDupes = subNames.filter(
      (n, i) => subNames.indexOf(n) !== i,
    )
    for (const d of new Set(subDupes)) {
      errors.push(`Duplicate subcommand name: ${d}`)
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  validateOption(option: CLIOption): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!option.name || option.name.trim() === '') {
      errors.push('Option name is required')
    }

    if (option.name.includes(' ')) {
      errors.push('Option name cannot contain spaces')
    }

    if (option.shortName !== undefined) {
      if (option.shortName.length !== 1) {
        errors.push(
          `Short name "${option.shortName}" must be a single character`,
        )
      }
      if (option.shortName === '-') {
        errors.push('Short name cannot be "-"')
      }
    }

    const validTypes: CLIOption['type'][] = [
      'string',
      'number',
      'boolean',
      'array',
    ]
    if (!validTypes.includes(option.type)) {
      errors.push(`Invalid option type: ${option.type}`)
    }

    if (
      option.type === 'boolean' &&
      option.defaultValue !== undefined &&
      typeof option.defaultValue !== 'boolean'
    ) {
      errors.push('Boolean option default must be a boolean')
    }

    if (
      option.type === 'number' &&
      option.defaultValue !== undefined &&
      typeof option.defaultValue !== 'number'
    ) {
      errors.push('Number option default must be a number')
    }

    if (option.choices && option.choices.length === 0) {
      warnings.push(`Option "${option.name}" has empty choices`)
    }

    if (
      option.defaultValue !== undefined &&
      option.choices &&
      option.choices.length > 0 &&
      !option.choices.includes(String(option.defaultValue))
    ) {
      errors.push(
        `Default value "${String(option.defaultValue)}" is not in choices: [${option.choices.join(', ')}]`,
      )
    }

    if (option.dependsOn) {
      for (const dep of option.dependsOn) {
        if (dep === option.name) {
          errors.push(`Option "${option.name}" cannot depend on itself`)
        }
      }
    }

    if (option.conflictsWith) {
      for (const conflict of option.conflictsWith) {
        if (conflict === option.name) {
          errors.push(`Option "${option.name}" cannot conflict with itself`)
        }
        if (option.dependsOn && option.dependsOn.includes(conflict)) {
          errors.push(
            `Option "${option.name}" both depends on and conflicts with "${conflict}"`,
          )
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  checkConflicts(command: CLICommand): string[] {
    const errors: string[] = []
    const optMap = new Map<string, CLIOption>()
    for (const opt of command.options) {
      optMap.set(opt.name, opt)
    }

    for (const opt of command.options) {
      if (opt.conflictsWith) {
        for (const conflictName of opt.conflictsWith) {
          const conflictOpt = optMap.get(conflictName)
          if (conflictOpt) {
            const hasReverseConflict =
              conflictOpt.conflictsWith &&
              conflictOpt.conflictsWith.includes(opt.name)
            if (!hasReverseConflict) {
              errors.push(
                `Option "--${opt.name}" conflicts with "--${conflictName}" but reverse conflict is not declared`,
              )
            }
          }
        }
      }
    }

    return errors
  }

  checkDeprecations(command: CLICommand): string[] {
    const warnings: string[] = []

    if (command.deprecated) {
      warnings.push(`Command "${command.name}" is deprecated`)
    }

    for (const opt of command.options) {
      if (
        opt.choices &&
        opt.choices.length > 0 &&
        opt.defaultValue !== undefined
      ) {
        const defaultStr = String(opt.defaultValue)
        if (!opt.choices.includes(defaultStr)) {
          warnings.push(
            `Option "--${opt.name}" default not in choices, may indicate deprecated config`,
          )
        }
      }
    }

    for (const sub of command.subcommands) {
      if (sub.deprecated) {
        warnings.push(`Subcommand "${sub.name}" is deprecated`)
      }
    }

    return warnings
  }

  findDuplicateNames(command: CLICommand): string[] {
    const errors: string[] = []

    const optNames = command.options.map((o) => o.name)
    const optDupes = optNames.filter(
      (n, i) => optNames.indexOf(n) !== i,
    )
    for (const d of new Set(optDupes)) {
      errors.push(`Duplicate option name: ${d}`)
    }

    const shortNames = command.options
      .filter((o) => o.shortName !== undefined)
      .map((o) => o.shortName!)
    const shortDupes = shortNames.filter(
      (n, i) => shortNames.indexOf(n) !== i,
    )
    for (const d of new Set(shortDupes)) {
      errors.push(`Duplicate short option name: -${d}`)
    }

    const aliasSet = new Set<string>()
    for (const alias of command.aliases) {
      if (aliasSet.has(alias)) {
        errors.push(`Duplicate alias: ${alias}`)
      }
      aliasSet.add(alias)
    }

    return errors
  }

  validateAll(commands: CLICommand[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const names = commands.map((c) => c.name)
    const nameDupes = names.filter((n, i) => names.indexOf(n) !== i)
    for (const d of new Set(nameDupes)) {
      errors.push(`Duplicate command name: ${d}`)
    }

    for (const cmd of commands) {
      const result = this.validateCommand(cmd)
      errors.push(...result.errors.map((e) => `[${cmd.name}] ${e}`))
      warnings.push(...result.warnings.map((w) => `[${cmd.name}] ${w}`))
    }

    return { valid: errors.length === 0, errors, warnings }
  }
}
