import { ArgumentParser, Read, CompletionResult, completionResult } from './argument-parser';
import { Option, some, none } from '../option';
import { Result, success, error } from '../result';
import { Token } from '../tokens';


export interface PositionalArgumentOptions {
  metavar: string;
  description?: string;
  suggestCompletion?: (partialArg: string) => string[];
}


export interface DefaultValue<D> {
  defaultValue: D;
}


export interface ReadArgument<T> {
  readArgument: (arg: string) => Result<T>;
}


export type PositionalArgument<T> = ArgumentParser<T,Option<string>>;


export function positionalArgument(options: PositionalArgumentOptions): PositionalArgument<string>;
export function positionalArgument<T>(options: PositionalArgumentOptions & ReadArgument<T>): PositionalArgument<T>;
export function positionalArgument<D>(options: PositionalArgumentOptions & DefaultValue<D>): PositionalArgument<string | D>;
export function positionalArgument<T,D>(options: PositionalArgumentOptions & ReadArgument<T> & DefaultValue<D>): PositionalArgument<T | D>;
export function positionalArgument<T,D>(options: PositionalArgumentOptions & Partial<ReadArgument<T>> & Partial<DefaultValue<D>>): PositionalArgument<T | D> {
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
    hintPrefix: metavar,
    description
  };
}
