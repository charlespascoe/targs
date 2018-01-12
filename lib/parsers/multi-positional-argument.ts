import { Token, IArgumentToken } from '../tokens';
import { Argument, IEvaluatedArgument } from './argument';


export interface IMultiPositionalArgumentOptions<T> {
  description?: string;
  parse: (val: string) => T;
  metaVar: string;
  min?: number;
}


export class MultiPositionalArgument<T> extends Argument<T[]> {
  public readonly metaVar: string;

  public readonly min: number = 0;

  private readonly parse: (val: string) => T;

  constructor(options: IMultiPositionalArgumentOptions<T>) {
    super(options.description || '');

    this.metaVar = options.metaVar;
    this.parse = options.parse;

    if (typeof options.min === 'number') {
      this.min = options.min;
    }
  }

  public evaluate(tokens: Token[]): IEvaluatedArgument<T[]> {
    const parsedArgs = tokens.filter(token => token.type === 'arg').map(token => this.parse((<IArgumentToken>token).argument));

    if (parsedArgs.length < this.min) {
      throw new Error(`${this.metaVar} requires at least ${this.min} argument${this.min === 1 ? '': 's'}`);
    }

    return {
      newTokens: tokens.filter(token => token.type !== 'arg'),
      value: parsedArgs
    };
  }

  public getUsageExample(): string {
    return `${this.metaVar} `.repeat(this.min) + `[${this.metaVar}]...`;
  }
}
