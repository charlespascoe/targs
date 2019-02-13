import { NonPositionalArgumentParser, Read } from './argument-parser';
import { matchesToken, Token } from '../tokens';
import { formatOptions, formatOptionsHint } from '../help';
import { Result, success, error } from '../result';
import { flag, nonPosArgSuggestions } from './flag';


export interface CountFlagOptions {
  shortName?: string;
  longName?: string;
  description?: string;
  maxCount?: number;
}


export interface CountFlag extends NonPositionalArgumentParser<number,number> { }


export function countFlag(options: CountFlagOptions): CountFlag {
  const regularFlag = flag(options);

  const { shortName, longName } = regularFlag;
  const { maxCount = Infinity } = options;

  if (maxCount < 1) {
    throw new Error('countFlag: maxCount must be greater than or equal to 1');
  }

  const coerce = (count: number): Result<number> => {
    if (count > maxCount) {
      return error(`You can't set ${formatOptions(shortName, longName)} flag more than ${maxCount === 1 ? 'once' : `${maxCount} times`}`);
    } else {
      return success(count);
    }
  };

  const suggestCompletion = (preceedingTokens: Token[], partialToken: string, currentState: number) => {
    if (currentState >= maxCount) {
      return [];
    }

    return nonPosArgSuggestions(partialToken, shortName, longName, true);
  };

  return {
    ...regularFlag,
    coerce,
    suggestCompletion
  };
}
