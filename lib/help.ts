import {
  ArgumentDocumentation,
  ArgumentParser,
  NonPositionalArgument,
  NonPositionalArgumentParser
} from './parsers/argument-parser';
import { ArgumentParserGroup } from './argument-parser-group';
import { values } from './utils';
import { SubcommandParser } from './subcommands';
import { entryFormatter } from './utils/strings';


type CompleteArgumentDocumentation = ArgumentDocumentation | ArgumentDocumentation & NonPositionalArgument;


export function generateUsageString(
  programName: string,
  argDocs: CompleteArgumentDocumentation[]
): string {

  return 'usage: ' +
    programName + ' ' +
    generateNonPositionalHints(argDocs) + ' ' +
    generatePositionalHints(argDocs);
}

export function generateParserGroupHelp(
  argParsers: ArgumentParser<any,any>[],
  formatEntry: (left: string, right: string) => string
): string {

  let helpString = '';

  const nonPositionalArguments = argParsers
    .filter(argParser => isNonPositionalArgumentParser(argParser));

  const positionalArguments = argParsers
    .filter(argParser => !isNonPositionalArgumentParser(argParser));

  if (nonPositionalArguments.length > 0) {
    helpString += '\nNon-Positional Arguments:\n';
    helpString += nonPositionalArguments
        .map(argParser => formatEntry(argParser.hintPrefix, argParser.description))
        .join('\n') + '\n'
  }

  if (positionalArguments.length > 0) {
    helpString += '\nPositional Arguments:\n';
    helpString += positionalArguments
      .map(argParser => formatEntry(argParser.hintPrefix, argParser.description))
      .join('\n') + '\n';
  }

  return helpString;
}

function isNonPositionalArgumentParser(
  argDoc: CompleteArgumentDocumentation
): argDoc is ArgumentDocumentation & NonPositionalArgument {

  return (
    typeof (argDoc as NonPositionalArgument).shortName === 'string' ||
    typeof (argDoc as NonPositionalArgument).longName === 'string'
  );
}

function generateNonPositionalHints(argDocs: CompleteArgumentDocumentation[]): string {
  const nonPosArgDocs = argDocs
    .filter(argParser => isNonPositionalArgumentParser(argParser));

  if (nonPosArgDocs.length === 0) {
    return '';
  } else {
    return nonPosArgDocs
      .map(argParser => argParser.shortHint)
      .join(' ') + ' ';
  }
}

function generatePositionalHints(argDocs: CompleteArgumentDocumentation[]): string {
  const posArgDocs = argDocs
    .filter(argParser => !isNonPositionalArgumentParser(argParser));

  if (posArgDocs.length === 0) {
    return '';
  } else {
    return posArgDocs
      .map(argParser => argParser.shortHint)
      .join(' ') + ' ';
  }
}

export function formatOptions(shortName: string | null, longName: string | null): string {
  const bothDefined = shortName !== null && longName !== null;

  return (
    (shortName === null ? '' : `-${shortName}`) +
    (bothDefined ? '/' : '') +
    (longName === null ? '' : `--${longName}`)
  );
}


export function formatOptionsHint(shortName: string | null, longName: string | null): string {
  const bothDefined = shortName !== null && longName !== null;

  return (
    ' ' +
    (shortName === null ? '  ' : `-${shortName}`) +
    (bothDefined ? ', ' : '  ') +
    (longName === null ? '' : `--${longName}`)
  );
}

export function generateHelp(
  programName: string,
  argParsers: ArgumentParser<any,any>[],
  subcommandParser: SubcommandParser<any> | null,
  screenWidth: number
): string {

  const longestHintLength = argParsers
    .map(argParser => argParser.hintPrefix.length)
    .reduce((longest, length) => Math.max(longest, length), 0);

  const longestSubcommand = (
    subcommandParser === null ?
      0
    :
      subcommandParser.getMaxCommandLength() + 1 // +1 to allow a space before
  );

  const leftColumnWidth = Math.min(
    Math.max(longestHintLength, longestSubcommand),
    screenWidth - 20 // Allow some room for right column
  );

  const separationSpaces = 2;
  const rightColumnWidth = screenWidth - leftColumnWidth - separationSpaces;

  const formatter = entryFormatter(leftColumnWidth, separationSpaces, rightColumnWidth);

  let helpString = '';

  helpString += generateUsageString(programName, argParsers);
  helpString += subcommandParser === null ? '\n' : '<SUBCOMMAND>\n';

  helpString += generateParserGroupHelp(argParsers, formatter);

  if (subcommandParser !== null) {
    helpString += '\nSubcommands:\n';
    helpString += subcommandParser.generateHelpText(formatter) + '\n';
  }

  return helpString;
}
