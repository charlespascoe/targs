import { ArgumentParsers } from './parsers/argument-parser';


export function args<T>(argParsers: ArgumentParsers<T>): ArgumentParsers<T> {
  return argParsers;
}
