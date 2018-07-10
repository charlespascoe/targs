import { Argument } from './parsers/argument';
import { Optional } from './parsers/optional';
import { Flag } from './parsers/flag';
import { tokeniseArguments, Token } from './tokens';
import { programName, keysOf } from './utils';
import { HelpFormatter } from './help-formatter';


export type ArgumentParserOptions<T> = {
  [K in keyof T]: Argument<T[K]>;
};


export class ArgumentParser<T> {
  private readonly helpFormatter: HelpFormatter;

  public programName: string;

  public helpFlag: Flag | null;

  constructor(
    private parsers: ArgumentParserOptions<T>
  ) {
    this.helpFlag = new Flag({
      short: 'h',
      long: 'help',
      description: 'Prints help and quits'
    });
    this.programName = programName;
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

    if (this.helpFlag !== null) {
      const { newTokens, value } = this.helpFlag.parse(tokens);

      if (value) {
        console.log(this.help());
        process.exit(0);
      }

      tokens = newTokens;
    }

    // Process flags and optional arguments first
    for (const key in this.parsers) {
      if (this.parsers[key] instanceof Optional) {
        const { newTokens, value } = this.parsers[key].parse(tokens);
        result[key] = value;
        tokens = newTokens;
      }
    }

    for (const key in this.parsers) {
      if (!(this.parsers[key] instanceof Optional)) {
        const { newTokens, value } = this.parsers[key].parse(tokens);
        result[key] = value;
        tokens = newTokens;
      }
    }

    if (tokens.length > 0) {
      const token = tokens[0];

      if (token.type === 'arg') {
        throw new Error(`Unexpected positional argument: ${token.argument}`);
      } else {
        throw new Error(`Unknown option: -${token.type === 'long' ? '-' : ''}${token.value}`);
      }
    }

    return result;
  }

  public help(): string {
    const parsers = keysOf(this.parsers).map<Argument<any>>(key => this.parsers[key]);

    if (this.helpFlag !== null) {
      parsers.push(this.helpFlag);
    }

    return this.helpFormatter.format(this.programName, parsers);
  }
}
