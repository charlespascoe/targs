import { Argument } from './parsers/argument';
import { Optional } from './parsers/optional';
import { tokeniseArguments, Token } from './tokens';
import { keysOf } from './utils';
import { HelpFormatter } from './help-formatter';


export type ArgumentParserOptions<T> = {
  [K in keyof T]: Argument<T[K]>;
};


export class ArgumentParser<T> {
  private readonly helpFormatter: HelpFormatter;

  constructor(
    private parsers: ArgumentParserOptions<T>
  ) {
    this.validateParsers();
    this.helpFormatter = new HelpFormatter();
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
    return this.parseTokens(tokeniseArguments(args));
  }

  public parseTokens(tokens: Token[]): T {
    const result: any = {};

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

  public help(programName: string): string {
    return this.helpFormatter.format(programName, keysOf(this.parsers).map(key => this.parsers[key]));
  }
}
