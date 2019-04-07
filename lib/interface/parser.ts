import { ArgumentParserGroup, mergeArgumentParserGroups } from '../argument-parser-group';
import { programName, screenWidth } from '../utils';
import { flag, Flag } from '../parsers';
import { compose } from '../compose';
import {
  checkUnparsedTokens,
  defaultHelpFlag,
  help,
  parseTokens,
  printHelp,
  tokeniseStringArguments
} from '../interface/common';
import { mapSuccess } from '../result';


interface CreateParserOptions {
  helpFlag: Flag
}


export function createParser<T>(argGroup: ArgumentParserGroup<T,any>, options: Partial<CreateParserOptions> = {}): (args?: string[]) => T {
  const {
    helpFlag = defaultHelpFlag
  } = options;

  const argsWithHelp = mergeArgumentParserGroups(
    argGroup,
    {
      [help]: helpFlag
    }
  );

  return (stringArgs: string[] = process.argv.slice(2)) => {
    const parse = compose(
      tokeniseStringArguments,
      mapSuccess(parseTokens(argsWithHelp)),
      mapSuccess(checkUnparsedTokens),
      printHelp(
        programName,
        screenWidth,
        argsWithHelp
      )
    );

    const result = parse(stringArgs);

    if (!result.success) {
      console.error(result.message);
      process.exit(1);
      throw {exitCode: 1};
    }

    return result.value;
  };
}
