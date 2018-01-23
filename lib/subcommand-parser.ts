import { Optional } from './parsers';
import { ArgumentParser } from './argument-parser';
import { tokeniseArguments, Token, IArgumentToken } from './tokens';


export type OptionParsers<T> = {[K in keyof T]: Optional<T[K]>};


interface ISubcommand<T extends object> {
  description: string;
  handler: (options: T, tokens: Token[]) => void;
}

// P = Parent Options, O = Subcommand group options
export class SubcommandGroup<P extends object, O extends object> {
  private readonly subcommands: {[subcommand: string]: ISubcommand<O & P>} = {};

  private optionsParser: ArgumentParser<O>;

  protected constructor(parsers: OptionParsers<O>, private readonly handler?: (parsedOptions: P & O) => void) {
    this.optionsParser = new ArgumentParser<O>(parsers);
  }

  protected parseTokens(parentOptions: P, tokens: Token[]) {
    const subcommandTokenIndex = tokens.findIndex(token => token.type === 'arg');

    if (subcommandTokenIndex === -1) {
      return;
    }

    const subcommandToken = tokens[subcommandTokenIndex] as IArgumentToken;

    if (!this.subcommands.hasOwnProperty(subcommandToken.argument)) {
      throw new Error(`Unknown subcommand: ${subcommandToken.argument}`);
    }

    const optionTokens = tokens.slice(0, subcommandTokenIndex);

    const parsedOptions = Object.assign({}, parentOptions, this.optionsParser.parseTokens(optionTokens));

    if (this.handler) {
      this.handler(parsedOptions);
    }

    this.subcommands[subcommandToken.argument].handler(parsedOptions, tokens.slice(subcommandTokenIndex + 1));
  }

  public subcommand<U extends object>(subcommand: string, description: string, argumentParser: ArgumentParser<U>, handler: (parsedOptions: P & O & U) => void): void;
  public subcommand<U extends object>(subcommand: string, description: string, subcommandOptions: OptionParsers<U>, handler?: (parsedOptions: P & O & U) => void): SubcommandGroup<P & O, U>;
  public subcommand<U extends object>(subcommand: string, description: string, parserOrOptions: ArgumentParser<U> | OptionParsers<U>, handler?: (parsedOptions: P & O & U) => void): SubcommandGroup<P & O, U> | void {
    if (parserOrOptions instanceof ArgumentParser && handler !== undefined) {
      const parser = parserOrOptions;

      this.subcommands[subcommand] = {
        description,
        handler: (options: P & O, tokens: Token[]) => {
          const args = parser.parseTokens(tokens);

          handler(Object.assign(options, args));
        }
      };
    } else if (!(parserOrOptions instanceof ArgumentParser)) {
      const subcmd = new SubcommandGroup<P & O, U>(parserOrOptions, handler);

      this.subcommands[subcommand] = {
        description,
        handler: (options: P & O, tokens: Token[]) => subcmd.parseTokens(options, tokens)
      };

      return subcmd;
    }
  }
}


export class SubcommandParser<T extends object> extends SubcommandGroup<{}, T> {
  public constructor(parsers: OptionParsers<T>, handler?: (parsedOptions: T) => void) {
    super(parsers, handler);
  }

  public parse(args: string[]): void {
    this.parseTokens({}, tokeniseArguments(args));
  }
}
