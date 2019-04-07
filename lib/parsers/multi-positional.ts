import { ArgumentParser, Read, CompletionResult, completionResult } from './argument-parser';
import { Result, success, mapResults } from '../result';
import { Token, PositionalToken } from '../tokens';
import { takeWhile } from '../utils';
import { validateMetavar } from '../parsers/utils';
import { ReadArgument } from './common';


export interface MultiPositionalOptions {
  metavar: string;
  description?: string;
  maxCount?: number;
}


export type MultiPositional<T> = ArgumentParser<T[], Array<string>>;


export function multiPositional(options: MultiPositionalOptions): MultiPositional<string>;
export function multiPositional<T>(options: MultiPositionalOptions & ReadArgument<T>): MultiPositional<T>;
export function multiPositional<T>(options: MultiPositionalOptions & Partial<ReadArgument<T>>): MultiPositional<T> {
  const {
    metavar,
    description = '',
    maxCount = Infinity,
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    readArgument = (arg: string) => success((arg as any) as T)
  } = options;

  validateMetavar(metavar);

  if (maxCount < 1) {
    throw new Error('multiPositional: maxCount must be greater than or equal to 1');
  }

  const read: Read<string[]> = (state: string[], tokens: Token[]) => {
    if (state.length > 0) {
      // Already read positional arguments.
      // This means that a sequence of positional arguments
      // are separated by a non-positional argument (e.g. a flag),
      // then only the pos args before the nonpos arg is read
      return null;
    }

    const posTokens = takeWhile(tokens, (token): token is PositionalToken => token.type === 'positional').slice(0, maxCount);

    if (posTokens.length > 0) {
      return {
        newState: posTokens.map(token => token.value),
        newTokens: tokens.slice(posTokens.length)
      };
    }

    return null;
  };

  const coerce = (state: string[]): Result<T[]> => mapResults(state, arg => readArgument(arg));

  return {
    initial: [],
    read,
    coerce,
    suggestCompletion: () => completionResult([]),

    shortHint: `${metavar}*`,
    hintPrefix: metavar,
    description
  };
}
