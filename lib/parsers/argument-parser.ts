import { Token } from '../tokens';
import { Result } from '../result';
import { entries } from '../utils';


/**
  * Takes the previous parsing state and the current list of tokens,
  * and returns `null` if the state is unchanged or returns the new state and tokens
  */
export type Read<S> = (state: S, tokens: Token[]) => {newState: S, newTokens: Token[]} | null;


export interface ArgumentDocumentation {
  /**
   * The hint to show in the first line of help
   */
  shortHint: string;

  /**
   * The prefix to show before the description when printing help
   */
  hintPrefix: string;

  /**
   * The description of this argument
   */
  description: string;
}


export interface NonPositionalArgument {
  shortName: string | null;
  longName: string | null;
}


export interface TokenParser<T,S> {
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

  /**
   * Returns a list of autocomplete suggestions for a partial token
   */
  suggestCompletion: (preceedingTokens: Token[], partialToken: string, currentState: S) => string[];
}

export type ArgumentParser<T,S> = TokenParser<T,S> & ArgumentDocumentation;
export type NonPositionalArgumentParser<T,S> = TokenParser<T,S> & ArgumentDocumentation & NonPositionalArgument;


export type ArgumentParserGroup<T=any, A extends {[K in keyof T]: any}=any> = {[K in keyof T]: ArgumentParser<T[K], A[K]>};

export type NonPositionalArgumentParserGroup<T=any, A extends {[K in keyof T]: any}=any> = {[K in keyof T]: NonPositionalArgumentParser<T[K], A[K]>};


export function mergeArgumentParsers<T,U,A extends {[K in keyof T]: any},B extends {[K in keyof U]: any}>(argGroup1: ArgumentParserGroup<T,A>, argGroup2: ArgumentParserGroup<U,B>): ArgumentParserGroup<T & U, any>  {
  const result: any = {};

  entries(argGroup1, (key, argParser) => ({key, argParser}))
    .forEach(({key, argParser}) => {
      result[key] = argParser
    });

  entries(argGroup2, (key, argParser) => ({key, argParser}))
    .forEach(({key, argParser}) => {
      result[key] = argParser
    });

  return result as ArgumentParserGroup<T & U, any>;
}
