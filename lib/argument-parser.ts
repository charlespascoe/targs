import { Argument } from './parsers/argument';
import { Optional } from './parsers/optional';
import { tokeniseArguments } from './tokens';


export type ArgumentParserOptions<T> = {
  [K in keyof T]: Argument<T[K]>;
};


export class ArgumentParser<T> {
  constructor(
    private parsers: ArgumentParserOptions<T>
  ) {
    this.validateParsers();
  }

  private validateParsers() {
    const shortFlags: {[short: string]: string} = {};
    const longFlags: {[long: string]: string} = {};

    for (const key in this.parsers) {
      const parser = this.parsers[key];

      if (parser instanceof Optional) {
        if (parser.short !== null) {
          if (shortFlags.hasOwnProperty(parser.short)) {
            throw new Error(`-${parser.short} defined for both ${shortFlags[parser.short]} and ${key}`);
          } else {
            shortFlags[parser.short] = key;
          }
        }

        if (parser.long !== null) {
          if (longFlags.hasOwnProperty(parser.long)) {
            throw new Error(`--${parser.long} defined for both ${longFlags[parser.long]} and ${key}`);
          } else {
            longFlags[parser.long] = key;
          }
        }
      }
    }
  }

  public parse(args: string[]): T {
    const result: any = {};

    let tokens = tokeniseArguments(args);

    // Process flags and optional arguments first
    for (const key in this.parsers) {
      if (this.parsers[key] instanceof Optional) {
        const { newTokens, value } = this.parsers[key].evaluate(tokens);
        result[key] = value;
        tokens = newTokens;
      }
    }

    for (const key in this.parsers) {
      if (!(this.parsers[key] instanceof Optional)) {
        const { newTokens, value } = this.parsers[key].evaluate(tokens);
        result[key] = value;
        tokens = newTokens;
      }
    }

    return result;
  }

  public help(): string {
    let help = 'usage: <program> ' + this.generateOptionsHelp() + ' ' + this.generatePositionalArgumentsHelp();
    return help;
  }

  private generateOptionsHelp(): string {
    const optionHelp: string[] = [];

    for (const key in this.parsers) {
      const parser = this.parsers[key];

      if (parser instanceof Optional) {
        optionHelp.push(parser.getUsageExample());
      }
    }

    return optionHelp.join(' ');
  }

  private generatePositionalArgumentsHelp(): string {
    const posArgHelp: string[] = [];

    for (const key in this.parsers) {
      const parser = this.parsers[key];

      if (!(parser instanceof Optional)) {
        posArgHelp.push(parser.getUsageExample());
      }
    }

    return posArgHelp.join(' ');
  }
}
