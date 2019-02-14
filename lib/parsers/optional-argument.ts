import { NonPositionalArgumentParser, Read, completionResult, CompletionResult } from './argument-parser';
import { Result, success, error } from '../result';
import { formatOptions, formatOptionsHint } from '../help';
import { Token, matchesToken } from '../tokens';
import { nonPosArgSuggestions } from './flag';


export interface OptionalArgumentOptions {
  shortName?: string;
  longName?: string;
  description?: string;
  suggestCompletion?: (partialArg: string) => string[],
  metavar: string;
}

export interface ReadArgument<T> {
  readArgument: (arg: string) => Result<T>;
}

export interface DefaultValue<D> {
  defaultValue: D;
}

export interface OptionalArgument<T> extends NonPositionalArgumentParser<T,Array<string | null>> { }

export function optionalArgument(options: OptionalArgumentOptions): OptionalArgument<string | undefined>;
export function optionalArgument<T>(options: OptionalArgumentOptions & ReadArgument<T>): OptionalArgument<T | undefined>;
export function optionalArgument<D>(options: OptionalArgumentOptions & DefaultValue<D>): OptionalArgument<string | D>;
export function optionalArgument<T,D>(options: OptionalArgumentOptions & ReadArgument<T> & DefaultValue<D>): OptionalArgument<T | D>;
export function optionalArgument<T,D>(options: OptionalArgumentOptions & Partial<ReadArgument<T>> & Partial<DefaultValue<D>>): OptionalArgument<T | D> {
  const {
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    defaultValue = (undefined as any) as D,
    readArgument = (arg: string) => success((arg as any) as T),
    ...multiOptions
  } = options;

  // A multiOptionalArgument parses the tokens in exactly the same way (into an array of arguments),
  // except optionalArgument is only interested in the first one (hence maxCount 0)
  const multiOptionArg = multiOptionalArgument<T>({
    ...multiOptions,
    readArgument,
    maxCount: 1
  });

  const coerce = (stringArgs: Array<string | null>): Result<T | D> => {
    const result = multiOptionArg.coerce(stringArgs);

    if (!result.success) {
      return result;
    }

    const argumentArray = result.value;

    if (argumentArray.length === 0) {
      return success(defaultValue);
    }

    return success(argumentArray[0]);
  };

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string, currentState: Array<string | null>): CompletionResult => {
    if (currentState.some(arg => typeof arg === 'string')) {
      // The option has already been defined and given an argument, so don't provide suggestions
      return completionResult([]);
    }

    return multiOptionArg.suggestCompletion(preceedingTokens, partialToken, currentState);
  };

  const { shortName, longName } = multiOptionArg;
  const { metavar } = options;

  return {
    ...multiOptionArg,

    coerce,
    shortHint: shortName !== null ? `[-${shortName} ${metavar}]` : `[--${longName} ${metavar}]`,
    suggestCompletion
  };
}
