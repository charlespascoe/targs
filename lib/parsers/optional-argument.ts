import { Token } from '../tokens';
import { IEvaluatedArgument } from './argument';
import { Optional, IOptionalOptions } from './optional';


export interface IOptionalArgumentOptions<T> extends IOptionalOptions {
  default: T;
  metaVar: string;
  parse: (val: string) => T;
}


export class OptionalArgument<T> extends Optional<T> {
  public readonly default: T;

  public readonly metaVar: string;

  private readonly parse: (val: string) => T;

  constructor(options: IOptionalArgumentOptions<T>) {
    super(options);

    this.default = options.default;
    this.metaVar = options.metaVar;
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

  public getUsageExample(): string {
    return `[${this.getUsageExampleOption()} ${this.metaVar}]`;
  }
}
