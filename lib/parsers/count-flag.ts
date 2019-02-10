import { ArgumentParser, Read } from './argument-parser';
import { matchesToken } from '../tokens';
import { formatOptions, formatOptionsHint } from '../formatting';
import { Result, success } from '../result';
import { nonPosArgSuggestions } from './flag';


export interface CountFlagOptions {
  shortName?: string;
  longName?: string;
  description?: string;
}


export interface CountFlag extends ArgumentParser<number,number> { }


export function countFlag(options: CountFlagOptions): CountFlag {
  const {
    shortName = null,
    longName = null,
    description = ''
  } = options;

  if (shortName === null && longName === null) {
    throw new Error('At least one of shortName or longName must be defined');
  }

  const read: Read<number> = (count, tokens) => {
    if (tokens.length > 0) {
      const head = tokens[0];

      if (matchesToken(head, shortName, longName)) {
        return {newState: count + 1, newTokens: tokens.slice(1)};
      }
    }

    return null;
  };

  const coerce = (count: number): Result<number> => success(count);

  return {
    initial: 0,
    read,
    coerce,

    hintPrefix: formatOptionsHint(shortName, longName),
    description,
    suggestCompletion: (preceedingTokens, partialToken) => nonPosArgSuggestions(partialToken, shortName, longName)
  };
}
