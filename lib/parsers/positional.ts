import { ArgumentParser, Read, CompletionResult, completionResult } from './argument-parser';
import { Option, some, none } from '../option';
import { Result, success, error } from '../result';
import { Token } from '../tokens';
import { DefaultValue, ReadArgument } from './common';


export interface PositionalOptions {
  metavar: string;
  description?: string;
  suggestCompletion?: (partialArg: string) => string[];
}


export type Positional<T> = ArgumentParser<T,Option<string>>;


export function positional(options: PositionalOptions): Positional<string>;
export function positional<T>(options: PositionalOptions & ReadArgument<T>): Positional<T>;
export function positional<D>(options: PositionalOptions & DefaultValue<D>): Positional<string | D>;
export function positional<T,D>(options: PositionalOptions & ReadArgument<T> & DefaultValue<D>): Positional<T | D>;
export function positional<T,D>(options: PositionalOptions & Partial<ReadArgument<T>> & Partial<DefaultValue<D>>): Positional<T | D> {
  const {
    metavar,
    description = '',
    suggestCompletion: userSuggestCompleition = () => [],
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    readArgument = (arg: string) => success((arg as any) as T),
  } = options;

  const defaultValue = options.hasOwnProperty('defaultValue') ? some((options.defaultValue as any) as D) : none();

  const read: Read<Option<string>> = (state: Option<string>, tokens: Token[]) => {
    if (tokens.length > 0 && tokens[0].type === 'positional' && !state.some) {
      return {
        newState: some(tokens[0].value),
        newTokens: tokens.slice(1)
      };
    }

    return null;
  };

  const coerce = (state: Option<string>): Result<T | D> => {
    if (!state.some) {
      if (defaultValue.some) {
        return success(defaultValue.value);
      } else {
        return error(`${metavar} argument is required`);
      }
    }

    return readArgument(state.value);
  };

  return {
    initial: none(),
    read,
    coerce,
    suggestCompletion: (_, partialToken: string) => completionResult(userSuggestCompleition(partialToken)),

    shortHint: defaultValue.some ? metavar : `[${metavar}]`,
    hintPrefix: ` ${metavar}`,
    description
  };
}
