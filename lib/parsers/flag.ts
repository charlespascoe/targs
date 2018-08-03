import { Token, ShortOptionToken, LongOptionToken } from '../tokens';
import { IEvaluatedArgument } from './argument';
import { Optional, IOptionalOptions } from './optional';


export interface IFlagOptions extends IOptionalOptions<boolean> {
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

  protected evaluate(tokens: Token[]): IEvaluatedArgument<boolean> {
    const flagTokens = tokens.filter((token): token is ShortOptionToken | LongOptionToken => token.type === 'short' && token.value === this.short || token.type === 'long' && token.value === this.long);

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

  public getUsageExample() {
    return `[${this.getUsageExampleOption()}]`;
  }
}
