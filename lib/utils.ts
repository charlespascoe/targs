import * as path from 'path';


export function without<T>(items: T[], withoutItems: T[]): T[] {
  const withoutItemsSet = new Set(withoutItems);

  return items.filter(item => !withoutItemsSet.has(item));
}


export function keysOf<T extends object>(arg: T): Array<keyof T> {
  const keys: Array<keyof T> = [];

  for (const key in arg) {
    keys.push(key);
  }

  return keys;
}


export function rightPad(str: string, length: number, padChar: string = ' '): string {
  if (padChar.length !== 1) throw new Error('padChar must be exactly one character long');
  return str + padChar.repeat(Math.max(length - str.length, 0));
}


const wordBreakRegex = /\s+/g;

export function formatText(text: string, width: number): string {
  const components = text.split(wordBreakRegex);

  let currentLine = '';

  const lines: string[] = [];

  for (const component of components) {
    if (component.length > width && (width - currentLine.length > 3)) {
      currentLine += ` ${component.substr(0, width - currentLine.length - 2)}-`;
      lines.push(currentLine);
      currentLine = component.substr(width - currentLine.length - 2);
      continue;
    }

    if (currentLine.length + component.length + 1 > width) {
      lines.push(currentLine);
      currentLine = component;
    } else {
      currentLine += `${currentLine.length > 0 ? ' ' : ''}${component}`;
    }
  }

  lines.push(currentLine);
  return lines.join('\n');
}


export const programName = path.basename((process.argv[1] || '').replace('.js', ''));
