import { Token } from '../tokens';
import { Result } from '../result';


/**
  * Takes the previous parsing state and the current list of tokens,
  * and returns `null` if the state is unchanged or returns the new state and tokens
  */
export type Read<S> = (state: S, tokens: Token[]) => {newState: S, newTokens: Token[]} | null;


export interface ArgumentParser<T,S> {
  /**
   * The initial parsing state for this argument
   */
  initial: S;

  /**
   * Takes the previous parsing state and the current list of tokens,
   * and returns `null` if the state is unchanged or returns the new state and tokens
   */
  read: Read<S>;

  /**
   * Converts the final state into the value that gets used by the program
   */
  coerce: (state: S) => Result<T>;

  // Documentation //

  /**
   * The prefix to show before the description when printing help
   */
  hintPrefix: string;

  /**
   * The description of this argument
   */
  description: string;

  /**
   * Returns a list of autocomplete suggestions for a partial token
   */
  suggestCompletion: (preceedingTokens: Token[], partialToken: string) => string[];
}


export interface NonPositionalArgumentParser<T,A> extends ArgumentParser<T,A> {
  shortName: string | null;
  longName: string | null;
}


export type ArgumentParserGroup<T, A extends {[K in keyof T]: any}> = {[K in keyof T]: ArgumentParser<T[K], A[K]>};


export type NonPositionalArgumentParserGroup<T, A extends {[K in keyof T]: any}> = {[K in keyof T]: NonPositionalArgumentParser<T[K], A[K]>};
