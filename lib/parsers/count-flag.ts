import { NonPositionalArgumentParser, Read } from './argument-parser';
import { matchesToken, Token } from '../tokens';
import { formatOptions, formatOptionsHint } from '../help';
import { Result, success } from '../result';
import { flag, nonPosArgSuggestions } from './flag';


export interface CountFlagOptions {
  shortName?: string;
  longName?: string;
  description?: string;
}


export interface CountFlag extends NonPositionalArgumentParser<number,number> { }


export function countFlag(options: CountFlagOptions): CountFlag {
  const regularFlag = flag(options);

  const { shortName, longName } = regularFlag;

  const coerce = (count: number): Result<number> => success(count);

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string) => {
    return nonPosArgSuggestions(partialToken, shortName, longName, true);
  };

  return {
    ...regularFlag,
    coerce,
    suggestCompletion
  };
}
