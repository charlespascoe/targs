import { Token, IArgumentToken } from '../tokens';
import { Argument, IEvaluatedArgument } from './argument';


export interface IPositionalArgumentOptions<T> {
  description?: string;
  default?: T;
  metaVar: string;
  parse: (val: string) => T;
}


export class PositionalArgument<T> extends Argument<T> {
  public readonly default: {value: T} | null = null;

  public get required() { return this.default === null; }

  public readonly metaVar: string;

  private readonly parse: (val: string) => T;

  constructor(options: IPositionalArgumentOptions<T>) {
    super(options.description || '');

    if (options.hasOwnProperty('default')) {
      this.default = {value: <T>options.default};
    }

    this.parse = options.parse;
    this.metaVar = options.metaVar.toUpperCase();
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<T> {
    const positionalArgToken = tokens.find(token => token.type === 'arg') || null;

    if (positionalArgToken === null) {
      if (this.default === null) {
        throw new Error(`${this.metaVar} is a required positional argument`);
      }

      return {
        newTokens: tokens,
        value: this.default.value
      };
    }

    return {
      newTokens: tokens.filter(token => token !== positionalArgToken),
      value: this.parse((<IArgumentToken>positionalArgToken).argument)
    };
  }

  public getUsageExample(): string {
    return this.metaVar;
  }
}
