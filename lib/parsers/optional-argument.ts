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
    shortName = null,
    longName = null,
    description = '',
    metavar,
    suggestCompletion: userSuggestCompletion = () => [],
    // I hate forcing types like this, but T defaults to string and D defaults to undefined (as per overloads),
    // but the actual function signature isn't aware of these type defaults
    // (suggestions for improvement are welcome)
    readArgument = (arg: string) => success((arg as any) as T),
    defaultValue = (undefined as any) as D
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

  const coerce = (stringArgs: Array<string | null>): Result<T | D> => {
    if (stringArgs.length === 0) {
      return success(defaultValue);
    }

    if (stringArgs.length > 1) {
      return error(`You can't set ${formatOptions(shortName, longName)} argument more than once`);
    }

    const head = stringArgs[0];

    if (head === null) {
      return error(`${formatOptions(shortName, longName)} needs an argument`);
    }

    return readArgument(head);
  };

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string, currentState: Array<string | null>): Com => {
    if (currentState.some(arg => typeof arg === 'string')) {
      // The option has already been defined and given an argument, so don't provide suggestions
      return completionResult([]);
    }

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

    shortHint: shortName !== null ? `[-${shortName} ${metavar}]` : `[--${longName} ${metavar}]`,
    hintPrefix: formatOptionsHint(shortName, longName),
    description,
    suggestCompletion,

    shortName,
    longName
  };
}
