import { Token } from '../tokens';


export interface IEvaluatedArgument<T> {
  readonly newTokens: Token[];
  readonly value: T;
}


export abstract class Argument<T> {
  public abstract evaluate(tokens: Token[]): IEvaluatedArgument<T>;

  public abstract getUsageExample(): string;
}
