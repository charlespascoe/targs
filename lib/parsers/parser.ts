import { Token } from '../tokens';
import { ArgumentParsers } from './argument-parser';
import { keysOf } from '../utils';
import { Result, success, error } from '../result';


type State<T extends object, K extends keyof T> = Array<{key: K, value: T[K]}>;


function initState<T,A extends {[K in keyof T]: any}>(argParsers: ArgumentParsers<T,A>): A {
  const result: Partial<A> = {};

  for (const key in argParsers) {
    result[key] = argParsers[key].initial;
  }

  return result as A;
}


function coerceState<T,A extends {[K in keyof T]: any}>(state: A, argParsers: ArgumentParsers<T,A>): Result<T> {
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


function parseAllTokens<T,A extends {[K in keyof T]: any}>(state: A, tokens: Token[], argParsers: ArgumentParsers<T,A>): Result<A> {
  if (tokens.length === 0) {
    return success(state);
  }

  for (const key in argParsers) {
    const result = argParsers[key].read(state[key], tokens);

    if (result !== null) {
      const { newValue, newTokens } = result;

      return parseAllTokens(Object.assign({}, state, {[key]: newValue}), newTokens, argParsers);
    }
  }

  return error(`Unknown argument`);
}


export function parse<T,A extends {[K in keyof T]: any}>(tokens: Token[], argParsers: ArgumentParsers<T,A>): Result<T>  {
  const initialState = initState(argParsers);

  const finalStateResult = parseAllTokens(initialState, tokens, argParsers);

  if (!finalStateResult.success) {
    return finalStateResult;
  }

  return coerceState(finalStateResult.value, argParsers);
}
