import { Token } from '../tokens';
import { Result } from '../result';


export type Read<T> = (value: T, tokens: Token[]) => {newValue: T, newTokens: Token[]} | null;


export interface ArgumentParser<T,A> {
  initial: A;
  read: Read<A>;
  coerce: (accumulator: A) => Result<T>;

  // Documentation
  hintPrefix: string;
  description: string;
  suggestCompletion: (preceedingTokens: Token[], partialToken: string) => string[];
}


export interface NonPositionalArgumentParser<T,A> extends ArgumentParser<T,A> {
  shortName: string | null;
  longName: string | null;
}


export type ArgumentParsers<T, A extends {[K in keyof T]: any}> = {[K in keyof T]: ArgumentParser<T[K], A[K]>};


export type NonPositionalArgumentParsers<T, A extends {[K in keyof T]: any}> = {[K in keyof T]: NonPositionalArgumentParser<T[K], A[K]>};
