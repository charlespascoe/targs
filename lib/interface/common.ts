import { ArgumentParserGroup, parseArgumentGroup } from '../argument-parser-group';
import { Result, SuccessResult, success, error, mapSuccess } from '../result';
import { Token, tokeniseArguments, formatToken } from '../tokens';
import { values } from '../utils';
import { highlightItem } from '../utils/strings';
import { generateHelp } from '../help';
import { flag } from '../parsers/flag';
import { SubcommandParser } from '../interface/subcommands';


export const help = Symbol('help');


type WithHelp<T extends {}> = T & {[help]: boolean};


export const defaultHelpFlag = flag({
  shortName: 'h',
  longName: 'help',
  description: 'Prints help and quits'
});


export function tokeniseStringArguments(stringArgs: string[]): Result<Token[]> {
  const tokeniseResult = tokeniseArguments(stringArgs);

  if (tokeniseResult.success) {
    return success(tokeniseResult.tokens);
  } else {
    const { index, message } = tokeniseResult;
    return error(
      `${message}:\n` +
      highlightItem(stringArgs, index) + '\n'
    );
  }
}


export function parseTokens<T>(argGroup: ArgumentParserGroup<T,any>) {
  return (tokens: Token[]): Result<{args: T, newTokens: Token[]}> => {
    const parseResult = parseArgumentGroup(tokens, argGroup);

    if (!parseResult.success) {
      return error(parseResult.message);
    }

    const { args, tokens: newTokens } = parseResult.value;

    return success({args, newTokens});
  };
}


export function checkUnparsedTokens<T>(obj: {args: T, newTokens: Token[]}): Result<T> {
  const { args, newTokens } = obj;

  if (newTokens.length > 0) {
    return error(`Unknown argument: ${formatToken(newTokens[0])}`);
  } else {
    return success(args);
  }
}


export function checkUnparsedNonpositionalTokens<T>(obj: {args: T, newTokens: Token[]}): Result<{args: T, newTokens: Token[]}> {
  const { newTokens } = obj;

  if (newTokens.length > 0 && newTokens[0].type !== 'positional') {
    return error(`Unknown nonpositional argument: ${formatToken(newTokens[0])}`);
  } else {
    return success(obj);
  }
}


export function removeHelp<T>(args: T & {[help]: boolean}): T {
  const newArgs = Object.assign({}, args);
  delete newArgs[help];
  return newArgs as T;
}


export function printHelp<T>(
  programName: string,
  screenWidth: number,
  argGroup: ArgumentParserGroup<any,any>
) {
  const genHelp = () => generateHelp(
    programName,
    values(argGroup),
    null,
    screenWidth
  );

  return (result: Result<T & {[help]: boolean}>): Result<T> => {
    if (!result.success) {
      return error(result.message + '\n' + genHelp());
    }

    const args = result.value;

    if (args[help]) {
      return error(genHelp());
    }

    return success(removeHelp(args));
  };
}


export function printHelpWithTokens<T>(
  programName: string,
  screenWidth: number,
  subcommandParser: SubcommandParser<T> | null,
  argGroup: ArgumentParserGroup<any,any>,
) {
  const genHelp = () => generateHelp(
    programName,
    values(argGroup),
    subcommandParser,
    screenWidth
  );

  return (result: Result<{args: WithHelp<T>, newTokens: Token[]}>): Result<{args: T, newTokens: Token[]}> => {
    if (!result.success) {
      return error(result.message + '\n' + genHelp());
    }

    const { args, newTokens } = result.value;

    if (args[help]) {
      return error(genHelp());
    }

    return success({
      args: removeHelp(args),
      newTokens
    });
  };
}
