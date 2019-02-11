import { NonPositionalArgumentParser, Read } from './argument-parser';
import { matchesToken } from '../tokens';
import { formatOptions, formatOptionsHint } from '../help';
import { Result, success } from '../result';
import { flag } from './flag';


export interface CountFlagOptions {
  shortName?: string;
  longName?: string;
  description?: string;
}


export interface CountFlag extends NonPositionalArgumentParser<number,number> { }


export function countFlag(options: CountFlagOptions): CountFlag {
  const regularFlag = flag(options);

  const coerce = (count: number): Result<number> => success(count);

  return {
    ...regularFlag,
    coerce
  };
}
