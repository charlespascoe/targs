import { NonPositionalArgumentParser, Read, completionResult, CompletionResult } from './argument-parser';
import { Result, success, error } from '../result';
import { formatOptions, formatOptionsHint } from '../help';
import { Token, matchesToken } from '../tokens';
import { nonPosArgSuggestions } from './flag';
import { multiNonpositionalArgument } from './multi-nonpositional-argument';
import { Option, some, none } from '../option';
import { ReadArgument, DefaultValue } from './common';


export interface NonpositionalArgumentOptions {
  shortName?: string;
  longName?: string;
  description?: string;
  suggestCompletion?: (partialArg: string) => string[];
  metavar: string;
}

export interface NonpositionalArgument<T> extends NonPositionalArgumentParser<T,Array<string | null>> { }

export function nonpositionalArgument(options: NonpositionalArgumentOptions): NonpositionalArgument<string>;
export function nonpositionalArgument<T>(options: NonpositionalArgumentOptions & ReadArgument<T>): NonpositionalArgument<T>;
export function nonpositionalArgument<D>(options: NonpositionalArgumentOptions & DefaultValue<D>): NonpositionalArgument<string | D>;
export function nonpositionalArgument<T,D>(options: NonpositionalArgumentOptions & ReadArgument<T> & DefaultValue<D>): NonpositionalArgument<T | D>;
export function nonpositionalArgument<T,D>(options: NonpositionalArgumentOptions & Partial<ReadArgument<T>> & Partial<DefaultValue<D>>): NonpositionalArgument<T | D> {
  const {
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    readArgument = (arg: string) => success((arg as any) as T),
    defaultValue: _ = (undefined as any) as D,
    ...multiOptions
  } = options;

  const defaultValue = options.hasOwnProperty('defaultValue') ? some((options.defaultValue as any) as D) : none();

  // A multiOptionalArgument parses the tokens in exactly the same way (into an array of arguments),
  // except optionalArgument is only interested in the first one (hence maxCount 0)
  const multiNonpos = multiNonpositionalArgument<T>({
    ...multiOptions,
    readArgument,
    maxCount: 1
  });

  const coerce = (stringArgs: Array<string | null>): Result<T | D> => {
    const result = multiNonpos.coerce(stringArgs);

    if (!result.success) {
      return result;
    }

    const argumentArray = result.value;

    if (argumentArray.length === 0) {
      if (defaultValue.some) {
        return success(defaultValue.value);
      } else {
        return error(`${formatOptions(shortName, longName)} is required`);
      }
    }

    return success(argumentArray[0]);
  };

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string, currentState: Array<string | null>): CompletionResult => {
    if (currentState.some(arg => typeof arg === 'string')) {
      // The option has already been defined and given an argument, so don't provide suggestions
      return completionResult([]);
    }

    return multiNonpos.suggestCompletion(preceedingTokens, partialToken, currentState);
  };

  const { shortName, longName } = multiNonpos;
  const { metavar } = options;

  const shortHint = shortName !== null ? `-${shortName} ${metavar}` : `--${longName} ${metavar}`;

  return {
    ...multiNonpos,

    coerce,
    shortHint: defaultValue.some ? `[${shortHint}]` : shortHint,
    suggestCompletion
  };
}
