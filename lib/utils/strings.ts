import { zip, padArray } from '../utils';


export function rightPad(str: string, length: number, padChar: string = ' '): string {
  if (padChar.length !== 1) throw new Error('padChar must be exactly one character long');
  return str + padChar.repeat(Math.max(length - str.length, 0));
}

export const formatEntry = (leftColumnWidth: number, separation: number, rightColumnWidth: number) => (leftColumn: string, rightColumn: string): string => {
  const leftLines = splitLines(leftColumn, leftColumnWidth);
  const rightLines = splitLines(rightColumn, rightColumnWidth);

  const totalLines = Math.max(leftLines.length, rightLines.length);

  return zip(
    padArray(leftLines, totalLines, '').map(line => rightPad(line, leftColumnWidth, ' ')),
    padArray(rightLines, totalLines, '').map(line => rightPad(line, rightColumnWidth, ' ')),
    (left, right) => left + ' '.repeat(separation) + right
  ).join('\n');
};


export function splitLines(text: string, maxWidth: number): string[] {
  const boundaryPattern = /(\s+)/;

  const components = text.split(boundaryPattern);

  let line = '';
  const lines: string[] = [];

  for (const component of components) {
    if (line.length + component.length > maxWidth) {
      lines.push(line);
      line = component.trim();
    } else {
      line += component;
    }
  }

  if (line !== '') {
    lines.push(line);
  }

  return lines;
}
