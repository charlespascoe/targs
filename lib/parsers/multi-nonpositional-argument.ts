import { NonPositionalArgumentParser, Read, completionResult, CompletionResult } from './argument-parser';
import { Result, SuccessResult, ErrorResult, success, error, mapResults } from '../result';
import { formatOptions, formatOptionsHint } from '../help';
import { Token, matchesToken } from '../tokens';
import { nonPosArgSuggestions } from './flag';


export interface MultiNonpositionalArgumentOptions {
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

export interface MultiNonpositionalArgument<T> extends NonPositionalArgumentParser<T[],Array<string | null>> { }

export function multiNonpositionalArgument(options: MultiNonpositionalArgumentOptions): MultiNonpositionalArgument<string>;
export function multiNonpositionalArgument<T>(options: MultiNonpositionalArgumentOptions & ReadArgument<T>): MultiNonpositionalArgument<T>;
export function multiNonpositionalArgument<T>(options: MultiNonpositionalArgumentOptions & Partial<ReadArgument<T>>): MultiNonpositionalArgument<T> {
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

  if (maxCount < 1) {
    throw new Error('multiOptionalArgument: maxCount must be greater than or equal to 1');
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

    return mapResults(stringArgs as string[], arg => readArgument(arg));
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

    shortHint: (shortName !== null ? `[-${shortName} ${metavar}]` : `[--${longName} ${metavar}]`) + (maxCount > 1 ? '*' : ''),
    hintPrefix: `${formatOptionsHint(shortName, longName).replace(/\s+$/, '')} ${metavar}`,
    description,
    suggestCompletion,

    shortName,
    longName
  };
}
