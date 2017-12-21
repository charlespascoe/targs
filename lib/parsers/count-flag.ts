import { Token } from '../tokens';
import { IEvaluatedArgument } from './argument';
import { Optional, IOptionalOptions } from './optional';
import { without } from '../utils';


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

  public getUsageExample() {
    return `[${this.getUsageExampleOption()}...]`;
  }
}
