import { Token } from '../tokens';


export interface IEvaluatedArgument<T> {
  readonly newTokens: Token[];
  readonly value: T;
}


export abstract class Argument<T> {
  protected constructor(public readonly description: string, private readonly run?: (arg: T) => void) { }

  protected abstract evaluate(tokens: Token[]): IEvaluatedArgument<T>;

  public parse(tokens: Token[]): IEvaluatedArgument<T> {
    const result = this.evaluate(tokens);

    if (this.run) {
      this.run(result.value);
    }

    return result;
  }

  public abstract getUsageExample(): string;

  public abstract getHelpKey(): string;
}
