import {
  ArgumentParserGroup,
  ArgumentDocumentation,
  ArgumentParser,
  NonPositionalArgument,
  NonPositionalArgumentParser
} from './parsers/argument-parser';
import { values } from './utils';
import { SubcommandParser } from './subcommands';
import { formatEntry } from './utils/strings';


type CompleteArgumentDocumentation = ArgumentDocumentation | ArgumentDocumentation & NonPositionalArgument;


export function generateUsageString(programName: string, argDocs: CompleteArgumentDocumentation[]): string {
  return `usage: ${programName} ${generateNonPositionalHints(argDocs)} ${generatePositionalHints(argDocs)}`;
}

export function generateParserGroupHelp(argParsers: ArgumentParser<any,any>[], formatEntry: (left: string, right: string) => string): string {
  let result = '';

  const nonPositionalArguments = argParsers
    .filter(argParser => isNonPositionalArgumentParser(argParser));

  const positionalArguments = argParsers
    .filter(argParser => !isNonPositionalArgumentParser(argParser));

  if (nonPositionalArguments.length > 0) {
    result += '\nNon-Positional Arguments:\n';
    result += nonPositionalArguments
        .map(argParser => formatEntry(argParser.hintPrefix, argParser.description))
        .join('\n') + '\n'
  }

  if (positionalArguments.length > 0) {
    result += '\nPositional Arguments:\n';
    result += positionalArguments
      .map(argParser => formatEntry(argParser.hintPrefix, argParser.description))
      .join('\n') + '\n';
  }

  return result;
}

function isNonPositionalArgumentParser(argDoc: CompleteArgumentDocumentation): argDoc is ArgumentDocumentation & NonPositionalArgument {
  return typeof (argDoc as NonPositionalArgument).shortName === 'string' || typeof (argDoc as NonPositionalArgument).longName === 'string';
}

function generateNonPositionalHints(argDocs: CompleteArgumentDocumentation[]): string{
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

export function generateHelp(programName: string, argParsers: ArgumentParser<any,any>[], subcommandParser: SubcommandParser<any> | null, screenWidth: number): string {
  const longestHintLength = argParsers
    .map(argParser => argParser.hintPrefix.length)
    .reduce((longest, length) => Math.max(longest, length), 0);

  const longestSubcommand = subcommandParser === null ? 0 : subcommandParser.getMaxCommandLength() + 1; // +1 to allow a space before

  const leftColumnWidth = Math.min(
    Math.max(longestHintLength, longestSubcommand),
    screenWidth - 20 // Allow some room for right column
  );

  const separationSpaces = 2;
  const rightColumnWidth = screenWidth - leftColumnWidth - separationSpaces;

  const formatter = formatEntry(leftColumnWidth, separationSpaces, rightColumnWidth);

  let result = '';

  result += generateUsageString(programName, argParsers);
  result += subcommandParser === null ? '\n' : '<SUBCOMMAND>\n';

  result += generateParserGroupHelp(argParsers, formatter);

  if (subcommandParser !== null) {
    result += '\nSubcommands:\n';
    result += subcommandParser.generateHelpText(formatter) + '\n';
  }

  return result;
}
