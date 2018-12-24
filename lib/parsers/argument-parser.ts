import { Token } from '../tokens';
import { Result } from '../result';


export type Read<T> = (value: T, tokens: Token[]) => {newValue: T, newTokens: Token[]} | null;


export interface ArgumentParser<T,A=any> {
  initial: A;
  read: Read<A>;
  coerce: (accumulator: A) => Result<T>;

  // Documentation
  hintPrefix: string;
  description: string;
}


export type ArgumentParsers<T, A extends {[K in keyof T]: any}> = {[K in keyof T]: ArgumentParser<T[K], A[K]>};

