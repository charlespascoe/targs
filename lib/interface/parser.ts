import { ArgumentParserGroup, ArgumentParser, mergeArgumentParsers } from '../parsers/argument-parser';
import { tokeniseArguments, formatToken, Token } from '../tokens';
import { generateHelp } from '../help';
import { values, programName, screenWidth } from '../utils';
import { highlightItem } from '../utils/strings';
import { parse } from '../group-parsing';
import { flag, Flag } from '../parsers';
import { Result, SuccessResult, success, error, mapSuccess } from '../result';
import { compose } from '../compose';


const help = Symbol('help');


export function tokenise(stringArgs: string[]): Result<Token[]> {
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
    const parseResult = parse(tokens, argGroup);

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


export function deleteHelp<T>(args: T & {[help]: boolean}): T {
  const newArgs = Object.assign({}, args);
  delete newArgs[help];
  return newArgs as T;
}


export function printHelp<T>(
  programName: string,
  screenWidth: number,
  argGroup: ArgumentParserGroup<any,any>,
  output: (str: string) => void,
  exit: (code: number) => T
) {
  const genHelp = () => generateHelp(
    programName,
    values(argGroup),
    null,
    screenWidth
  );

  return (result: Result<T & {[help]: boolean}>): T => {
    if (!result.success) {
      output(result.message);
      output(genHelp());
      return exit(1);
    }

    const args = result.value;

    if (args[help]) {
      output(genHelp());
      return exit(0);
    }

    return deleteHelp(args);
  };
}


interface CreateParserOptions {
  helpFlag: Flag
}


export function createParser<T>(argGroup: ArgumentParserGroup<T,any>, options: Partial<CreateParserOptions> = {}): (args: string[]) => T {
  const {
    helpFlag = flag({
      shortName: 'h',
      longName: 'help',
      description: 'Prints help and quits'
    })
  } = options;

  const argsWithHelp = mergeArgumentParsers(
    argGroup,
    {
      [help]: helpFlag
    }
  );

  return compose(
    tokenise,
    mapSuccess(parseTokens(argsWithHelp)),
    mapSuccess(checkUnparsedTokens),
    printHelp(
      programName,
      screenWidth,
      argsWithHelp,
      (str: string) => console.error(str),
      (exitCode: number): T => {
        process.exit(exitCode);
        throw {exitCode};
      }
    )
  );
}
