import {
  Argument,
  Optional
} from './parsers';
import { rightPad, formatText } from './utils';


export class HelpFormatter {
  private _width: number;

  public get width() { return this._width; }
  public set width(value: number) {
    if (value < 20) {
      this._width = 20;
    } else {
      this._width = value;
    }
  }

  constructor(width?: number) {
    if (width !== undefined) {
      this.width = width;
    } else if (process.stdout.isTTY && process.stdout.columns !== undefined) {
      this.width = process.stdout.columns;
    } else {
      this.width = 100;
    }
  }

  public format(programName: string, parsers: Argument<any>[]): string {
    return `usage: ${programName} ` +
      this.generateOptionsHelp(parsers) + ' ' +
      this.generatePositionalArgumentsHelp(parsers) + '\n' +
      this.generateHelpDescription(parsers);
  }

  private generateOptionsHelp(parsers: Argument<any>[]): string {
    return parsers
      .filter((parser) => parser instanceof Optional)
      .map((parser) => parser.getUsageExample())
      .join(' ');
  }

  private generatePositionalArgumentsHelp(parsers: Argument<any>[]): string {
    return parsers
      .filter((parser) => !(parser instanceof Optional))
      .map((parser) => parser.getUsageExample())
      .join(' ');
  }

  private generateHelpDescription(parsers: Argument<any>[]): string {
    const keyColumnWidth = parsers
      .map(parser => parser.getHelpKey().length)
      .reduce((longest, length) => Math.max(longest, length), 0);

    return 'Positional arguments:\n' +
      parsers
        .filter(parser => !(parser instanceof Optional))
        .map(parser => this.formatParserHelpDescription(parser, keyColumnWidth))
        .join('\n') + '\n\nOptions:\n' +
      parsers
        .filter(parser => parser instanceof Optional)
        .map(parser => this.formatParserHelpDescription(parser, keyColumnWidth))
        .join('\n');
  }

  private formatParserHelpDescription(parser: Argument<any>, keyColumnWidth: number): string {
    const keyColumnWidthWithSpacing = keyColumnWidth + 3;
    const descriptionWidth = this.width - keyColumnWidthWithSpacing - 1;

    if (keyColumnWidthWithSpacing > (this.width / 2)) {
      return ' ' + rightPad(parser.getHelpKey(), keyColumnWidth) + '  \n ' +
        formatText(parser.description, this.width - 1).split('\n').join('\n ') + '\n';
    } else {
      return ' ' +
        rightPad(parser.getHelpKey(), keyColumnWidth) + '  ' +
        formatText(parser.description, descriptionWidth).split('\n').join('\n' + ' '.repeat(keyColumnWidthWithSpacing));
    }

  }
}
