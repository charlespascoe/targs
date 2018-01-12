import { Token } from '../tokens';


export interface IEvaluatedArgument<T> {
  readonly newTokens: Token[];
  readonly value: T;
}


export abstract class Argument<T> {
  protected constructor(public readonly description: string) { }

  public abstract evaluate(tokens: Token[]): IEvaluatedArgument<T>;

  public abstract getUsageExample(): string;
}
