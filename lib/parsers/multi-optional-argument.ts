import { NonPositionalArgumentParser, Read, completionResult, CompletionResult } from './argument-parser';
import { Result, SuccessResult, ErrorResult, success, error } from '../result';
import { formatOptions, formatOptionsHint } from '../help';
import { Token, matchesToken } from '../tokens';
import { nonPosArgSuggestions } from './flag';


export interface MultiOptionalArgumentOptions {
  shortName?: string;
  longName?: string;
  metavar: string;
  description?: string;
  suggestCompletion?: (partialArg: string) => string[],
  maxCount?: number;
}

export interface ReadArgument<T> {
  readArgument: (arg: string) => Result<T>;
}

export interface MultiOptionalArgument<T> extends NonPositionalArgumentParser<T[],Array<string | null>> { }

export function multiOptionalArgument(options: MultiOptionalArgumentOptions): MultiOptionalArgument<string>;
export function multiOptionalArgument<T>(options: MultiOptionalArgumentOptions & ReadArgument<T>): MultiOptionalArgument<T>;
export function multiOptionalArgument<T>(options: MultiOptionalArgumentOptions & Partial<ReadArgument<T>>): MultiOptionalArgument<T> {
  const {
    shortName = null,
    longName = null,
    description = '',
    metavar,
    maxCount = Infinity,
    suggestCompletion: userSuggestCompletion = () => [],
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    readArgument = (arg: string) => success((arg as any) as T)
  } = options;

  if (shortName === null && longName === null) {
    throw new Error('At least one of shortName or longName must be defined');
  }

  const read: Read<Array<string | null>> = (stringArgs: Array<string | null>, tokens: Token[]) => {
    if (tokens.length === 0) {
      return null;
    }

    const head = tokens[0];

    if (!matchesToken(head, shortName, longName)) {
      return null;
    }

    if (tokens.length === 1 || tokens[1].type !== 'positional') {
      // Either this is the last token (even though we were expecting an argument)
      // or the next token is non-positional (when it should have been a positional token)
      return {
        newState: [...stringArgs, null],
        newTokens: tokens.slice(1)
      };
    }

    return {
      newState: [...stringArgs, tokens[1].value],
      newTokens: tokens.slice(2)
    };
  };

  const coerce = (stringArgs: Array<string | null>): Result<T[]> => {
    if (stringArgs.some(arg => arg === null)) {
      return error(`${formatOptions(shortName, longName)} needs an argument`);
    }

    if (stringArgs.length > maxCount) {
      return error(`You can't set ${formatOptions(shortName, longName)} argument more than ${maxCount === 1 ? 'once' : `${maxCount} times`}`);
    }

    const results = (stringArgs as string[]).map(arg => readArgument(arg));

    const errorResult = results.find((res): res is ErrorResult => res.success === false) || null;

    if (errorResult !== null) {
      return errorResult;
    }

    return success((results as SuccessResult<T>[]).map(res => res.value));
  };

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string): CompletionResult => {
    if (preceedingTokens.length > 0) {
      const prevToken = preceedingTokens[preceedingTokens.length - 1];

      if (matchesToken(prevToken, shortName, longName)) {
        // Previous token belongs to this optional argument, so pass `true` to override other suggestions
        return completionResult(userSuggestCompletion(partialToken), true);
      }
    }

    return completionResult(nonPosArgSuggestions(partialToken, shortName, longName, false));
  };

  return {
    initial: [],
    read,
    coerce,

    shortHint: shortName !== null ? `[-${shortName} ${metavar}]*` : `[--${longName} ${metavar}]*`,
    hintPrefix: `${formatOptionsHint(shortName, longName).replace(/\s+$/, '')} ${metavar}`,
    description,
    suggestCompletion,

    shortName,
    longName
  };
}