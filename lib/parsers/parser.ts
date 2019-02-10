import { Token } from '../tokens';
import { ArgumentParsers } from './argument-parser';
import { keysOf } from '../utils';
import { Result, success, error } from '../result';


export function initState<T,A extends {[K in keyof T]: any}>(argParsers: ArgumentParsers<T,A>): A {
  const result: Partial<A> = {};

  for (const key in argParsers) {
    result[key] = argParsers[key].initial;
  }

  return result as A;
}


export function coerceState<T,A extends {[K in keyof T]: any}>(state: A, argParsers: ArgumentParsers<T,A>): Result<T> {
  const result: Partial<T> = {};

  for (const key in argParsers) {
    const coerceResult = argParsers[key].coerce(state[key]);

    if (!coerceResult.success) {
      return coerceResult;
    }

    result[key] = coerceResult.value;
  }

  return success(result as T);
}


// TODO: Come up with a better name
export function parseRec<T,A extends {[K in keyof T]: any}>(state: A, tokens: Token[], argParsers: ArgumentParsers<T,A>): {finalState: A, newTokens: Token[]} {
  if (tokens.length === 0) {
    return {finalState: state, newTokens: tokens};
  }

  for (const key in argParsers) {
    const result = argParsers[key].read(state[key], tokens);

    if (result !== null) {
      const { newValue, newTokens } = result;

      return parseRec(Object.assign({}, state, {[key]: newValue}), newTokens, argParsers);
    }
  }

  return {finalState: state, newTokens: tokens};
}


export function parse<T,A extends {[K in keyof T]: any}>(tokens: Token[], argParsers: ArgumentParsers<T,A>): Result<{value: T, tokens: Token[]}>  {
  const initialState = initState(argParsers);

  const { finalState, newTokens } = parseRec(initialState, tokens, argParsers);

  const result = coerceState(finalState, argParsers);

  if (!result.success) {
    return result;
  }

  return success({
    value: result.value,
    tokens: newTokens
  });
}


export function suggestCompletion<T,A extends {[K in keyof T]: any}>(argParsers: ArgumentParsers<T,A>, preceedingTokens: Token[], partialToken: string): string [] {
  return keysOf(argParsers)
    .map(key => argParsers[key].suggestCompletion(preceedingTokens, partialToken))
    .reduce((allSuggestions, suggestions) => allSuggestions.concat(suggestions));
}
