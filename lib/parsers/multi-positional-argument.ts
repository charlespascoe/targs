import { Token, PositionalToken } from '../tokens';
import { Argument, IEvaluatedArgument } from './argument';


export interface IMultiPositionalArgumentOptions<T> {
  description?: string;
  parse: (val: string) => T;
  metaVar: string;
  min?: number;
  run?: (arg: T[]) => void;
}


export class MultiPositionalArgument<T> extends Argument<T[]> {
  public readonly metaVar: string;

  public readonly min: number = 0;

  private readonly parseValue: (val: string) => T;

  constructor(options: IMultiPositionalArgumentOptions<T>) {
    super(options.description || '', options.run);

    this.metaVar = options.metaVar;
    this.parseValue = options.parse;

    if (typeof options.min === 'number') {
      this.min = options.min;
    }
  }

  protected evaluate(tokens: Token[]): IEvaluatedArgument<T[]> {
    const parsedArgs = tokens.filter(token => token.type === 'positional').map(token => this.parseValue((<PositionalToken>token).value));

    if (parsedArgs.length < this.min) {
      throw new Error(`${this.metaVar} requires at least ${this.min} argument${this.min === 1 ? '': 's'}`);
    }

    return {
      newTokens: tokens.filter(token => token.type !== 'positional'),
      value: parsedArgs
    };
  }

  public getHelpKey(): string {
    return this.metaVar;
  }

  public getUsageExample(): string {
    return `${this.metaVar} `.repeat(this.min) + `[${this.metaVar}]...`;
  }
}
