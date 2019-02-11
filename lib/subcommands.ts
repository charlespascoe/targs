import { ArgumentParserGroup } from './parsers/argument-parser';
import { tokeniseArguments, Token } from './tokens';
import { parse } from './parser';
import { values, programName, screenWidth } from './utils';
import { formatEntry } from './utils/strings';
import { generateHelp } from './help';


export function parser<T>(argGroup: ArgumentParserGroup<T,any>): RootParser<T> {
  return new RootParser(argGroup, {programName, screenWidth});
}


export interface ParserOptions {
  programName: string;
  screenWidth: number;
}


export class RootParser<T> {
  private readonly subcommandSwitch: SubcommandSwitch<T>;

  constructor(
    private readonly argGroup: ArgumentParserGroup<T>,
    private readonly options: ParserOptions
  ) {
    this.subcommandSwitch = new SubcommandSwitch(() => this.printHelp(), options);
  }

  execute(stringArgs: string[]): void {

    const tokeniseResult = tokeniseArguments(stringArgs);

    if (!tokeniseResult.success) {
      console.log('FAIL');
      process.exit(1);
      return;
    }

    const { tokens } = tokeniseResult;

    const parseResult = parse(tokens, this.argGroup);

    if (!parseResult.success) {
      console.log(parseResult.message);
      process.exit(1);
      return;
    }

    const { args, tokens: newTokens } = parseResult.value;

    this.subcommandSwitch.execute(args, newTokens);
  }

  subcommand<U>(cmd: string, description: string, args: ArgumentParserGroup<U,any>): Subcommand<T,U> {
    return this.subcommandSwitch.subcommand(cmd, description, args);
  }

  printHelp() {
    const { programName, screenWidth } = this.options;

    const argParsers = values(this.argGroup);

    console.log(generateHelp(
      programName,
      argParsers,
      this.subcommandSwitch,
      screenWidth
    ));

    process.exit(0);
  }
}


export class SubcommandSwitch<T> {
  private readonly subcommandMap = new Map<string,Subcommand<T,any>>();

  constructor(
    public readonly printHelp: () => void,
    private readonly parserOptions: ParserOptions
  ) { }

  execute(args: T, tokens: Token[]): void {
    if (tokens.length === 0) {
      //TODO: Perhaps have default action when subocmmand isn't defined? (e.g. print help)
      console.log('Expecting subcommand');
      process.exit(1);
      return;
    }

    const headToken = tokens[0];
    const tailTokens = tokens.slice(1);

    if (headToken.type !== 'positional') {
      // TODO: print something useful
      console.log('Unknown option');
      process.exit(1);
      return;
    }

    const subcommand = this.subcommandMap.get(headToken.value) || null;

    if (subcommand === null) {
      // TODO: make the message more useful (e.g. print help or list of subcommands)
      console.log('Unknown subcommand:', headToken.value);
      process.exit(1);
      return;
    }

    subcommand.execute(args, tailTokens);
  }

  subcommand<U>(cmd: string, description: string, argGroup: ArgumentParserGroup<U,any>): Subcommand<T,U> {
    if (this.subcommandMap.has(cmd)) {
      throw new Error(`Duplicate subcommand declared:  ${cmd}`);
    }

    const subcmd = new Subcommand<T,U>(
      cmd,
      description,
      argGroup,
      {
        ...this.parserOptions,
        programName: `${this.parserOptions.programName} ${cmd}`
      }
    );

    this.subcommandMap.set(cmd, subcmd);

    return subcmd;
  }

  getMaxCommandLength(): number {
    return Array.from(this.subcommandMap.keys()).map(key => key.length).reduce((max, length) => Math.max(length, max), 0);
  }

  generateHelpText(formatEntry: (leftColumn: string, rightColumn: string) => string): string {
    return Array.from(this.subcommandMap.entries())
      .map(([key, subcommand]) => ({key, subcommand}))
      .sort(({key: a}, {key: b}) => a.localeCompare(b))
      .map(({key, subcommand}) => formatEntry(` ${key}`, subcommand.description))
      .join('\n');
  }
}


export interface Next<T> {
  execute(args: T, tokens: Token[]): void;
}

export class Subcommand<T,U> {
  private next: Next<T & U> | SubcommandSwitch<T & U> | null = null;

  constructor(
    public readonly command: string,
    public readonly description: string,
    private readonly argGroup: ArgumentParserGroup<U,any>,
    private readonly parserOptions: ParserOptions
  ) { }

  execute(args: T, tokens: Token[]): void {
    const parseResult = parse(tokens, this.argGroup);

    if (!parseResult.success) {
      console.log(parseResult.message);
      process.exit(1);
      return;
    }

    const { args: newArgs, tokens: newTokens } = parseResult.value;

    if (this.next === null) {
      throw new Error('A subcommand needs either an action or a subcommand parsers');
    }

    this.next.execute(Object.assign({}, args, newArgs), newTokens);
  }

  subcommandParser(): SubcommandSwitch<T & U> {
    const subcommandSwitch = new SubcommandSwitch<T & U>(() => this.printHelp(), this.parserOptions);

    this.setNext(subcommandSwitch);

    return subcommandSwitch;
  }

  action(action: (args: T) => void): this {
    this.setNext({
      execute: (args, tokens) => {
        if (tokens.length !== 0) {
          // TODO: Make message more useful
          console.log('Unknown token');
          process.exit(0);
          return;
        }

        action(args);
      }
    });

    return this;
  }

  private getSubcommandParser(): SubcommandSwitch<T & U> | null {
    if (this.next !== null && (this.next as SubcommandSwitch<T & U>).generateHelpText) {
      return this.next as SubcommandSwitch<T & U>;
    } else {
      return null;
    }
  }

  printHelp() {
    const { programName, screenWidth } = this.parserOptions;

    const argParsers = values(this.argGroup);

    console.log(generateHelp(
      programName,
      argParsers,
      this.getSubcommandParser(),
      screenWidth
    ));

    process.exit(0);
  }

  private setNext(next: Next<T & U>): void {
    if (this.next !== null) {
      throw new Error('You cannot have an action and a subcommand parser at the same time');
    } else {
      this.next = next;
    }
  }
}


// TODO:
// - Add description to subcommands
