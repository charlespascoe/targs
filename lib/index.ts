import {
  Token,
  tokeniseArguments,
  IArgumentToken,
  shortOptionNameRegex,
  longOptionNameRegex
} from './tokens';
export * from './tokens';
import { without } from './utils';


export interface IEvaluatedArgument<T> {
  readonly newTokens: Token[];
  readonly value: T;
}


export abstract class Argument<T> {
  public abstract evaluate(tokens: Token[]): IEvaluatedArgument<T>;
}


export interface IOptionalOptions {
  short?: string;
  long?: string;
  description?: string;
}


export abstract class Optional<T> extends Argument<T> {
  public readonly short: string | null = null;

  public readonly long: string | null = null;

  constructor(options: IOptionalOptions) {
    super();

    if (typeof options.short === 'string') {
      if (!shortOptionNameRegex.test(options.short)) {
        throw new Error(`Short flags and options must be a single character: '${options.short}' is not valid.`);
      }

      this.short = options.short;
    }

    if (typeof options.long === 'string') {
      if (!longOptionNameRegex.test(options.long)) {
        throw new Error(`Long flags and options must match ${longOptionNameRegex}: '${options.long}' does not match.`);
      }

      this.long = options.long;
    }

    if (this.short === null && this.long === null) {
      throw new Error('Either a short or long flag/option must be provided');
    }
  }

  protected getShortLongOptions(): string {
    let result = '';

    if (this.short !== null) {
      result = `-${this.short}`;
    }

    if (this.long !== null) {
      if (result.length > 0) {
        result += '/';
      }

      result += `--${this.long}`;
    }

    return result;
  }
}


export interface IFlagOptions extends IOptionalOptions {
  default?: boolean;
}


export class Flag extends Optional<boolean> {
  public readonly default: boolean = false;

  constructor(options: IFlagOptions) {
    super(options);

    if (typeof options.default === 'boolean') {
      this.default = options.default;
    }
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<boolean> {
    const flagTokens = tokens.filter(token => token.type === 'short' && token.value === this.short || token.type === 'long' && token.value === this.long);

    if (flagTokens.length === 0) {
      return {
        newTokens: tokens,
        value: this.default
      };
    }

    if (flagTokens.length > 1) {
      throw new Error(`Cannot set ${this.getShortLongOptions()} flag multiple times`);
    }

    const flagToken = flagTokens[0];

    if (flagToken.argument !== null) {
      throw new Error(`Do not provide an argument for the ${this.getShortLongOptions()} flag`)
    }

    return {
      newTokens: tokens.filter(token => token !== flagToken),
      value: !this.default
    };
  }
}


export interface ICountFlagOptions extends IOptionalOptions {
  default?: number;
}


export class CountFlag extends Optional<number> {
  public readonly default: number = 0;

  constructor(options: ICountFlagOptions) {
    super(options);

    if (typeof options.default === 'number') {
      this.default = options.default;
    }
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<number> {
    const flagTokens = tokens.filter(token => token.type === 'short' && token.value === this.short || token.type === 'long' && token.value === this.long);

    if (flagTokens.length === 0) {
      return {
        newTokens: tokens,
        value: this.default
      };
    }

    if (flagTokens.some(token => token.argument !== null)) {
      throw new Error(`Do not provide an argument for the ${this.getShortLongOptions()} flag`);
    }

    return {
      value: flagTokens.length,
      newTokens: without(tokens, flagTokens)
    };
  }
}


export interface IOptionalArgumentOptions<T> extends IOptionalOptions {
  default: T;
  parse: (val: string) => T;
}


export class OptionalArgument<T> extends Optional<T> {
  public readonly default: T;

  private readonly parse: (val: string) => T;

  constructor(options: IOptionalArgumentOptions<T>) {
    super(options);

    this.default = options.default;
    this.parse = options.parse;
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<T> {
    const optionTokens = tokens.filter(token => token.type === 'short' && token.value === this.short || token.type === 'long' && token.value === this.long);

    if (optionTokens.length === 0) {
      return {
        newTokens: tokens,
        value: this.default
      };
    }

    if (optionTokens.length > 1) {
      throw new Error(`Cannot set ${this.getShortLongOptions()} option multiple times`);
    }

    const optionToken = optionTokens[0];

    if (optionToken.argument !== null) {
      return {
        newTokens: tokens.filter(token => token !== optionToken),
        value: this.parse(optionToken.argument)
      };
    }

    const optionTokenIndex = tokens.indexOf(optionToken);

    const argumentToken = tokens[optionTokenIndex + 1];

    if ((optionTokenIndex + 1) === tokens.length || argumentToken.type !== 'arg') {
      throw new Error(`${this.getShortLongOptions()} requires an argument`);
    }

    return {
      newTokens: tokens.filter(token => token !== optionToken && token !== argumentToken),
      value: this.parse(argumentToken.argument)
    };
  }
}


export interface IMultiOptionalArgumentOptions<T> extends IOptionalOptions {
  parse: (val: string) => T;
}


export class MultiOptionalArgument<T> extends Optional<T[]> {
  private parse: (val: string) => T;

  constructor(options: IMultiOptionalArgumentOptions<T>) {
    super(options);
    this.parse = options.parse;
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<T[]> {
    let newTokens = tokens.map(token => token);

    const result: T[] = [];

    for (let i = newTokens.length - 1; i >= 0; i--) {
      const token = newTokens[i];

      if (token.type === 'short' && token.value === this.short || token.type === 'long' && token.value === this.long) {
        if (token.argument !== null) {
          result.unshift(this.parse(token.argument));
          newTokens.splice(i, 1);
          continue;
        }

        if (i + 1 >= newTokens.length) {
          throw new Error(`${this.getShortLongOptions()} requires an argument`);
        }

        const nextToken = newTokens[i + 1];

        if (nextToken.type !== 'arg') {
          throw new Error(`${this.getShortLongOptions()} requires an argument`);
        }

        result.unshift(this.parse(nextToken.argument));
        newTokens.splice(i, 2);
      }
    }

    return {
      newTokens,
      value: result
    };
  }
}


export interface IPositionalArgumentOptions<T> {
  description?: string;
  default: T;
  parse: (val: string) => T;
}


export class PositionalArgument<T> extends Argument<T> {
  public readonly default: T;

  private parse: (val: string) => T;

  constructor(options: IPositionalArgumentOptions<T>) {
    super();

    this.default = options.default;
    this.parse = options.parse;
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<T> {
    const positionalArgToken = tokens.find(token => token.type === 'arg') || null;

    if (positionalArgToken === null) {
      return {
        newTokens: tokens,
        value: this.default
      };
    }

    return {
      newTokens: tokens.filter(token => token !== positionalArgToken),
      value: this.parse((<IArgumentToken>positionalArgToken).argument)
    };
  }
}


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
}
