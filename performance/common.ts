import { inspect } from 'util';

const describeStack: string[] = [];


const spacer = '    ';


export function describe(description: string, container: () => void): void {
  console.log(spacer.repeat(describeStack.length) + description);
  describeStack.push(description);
  container();
  describeStack.pop();
}


function now() {
  return process.hrtime();
}


function delta(start: [number, number]): number {
  const [ deltaSeconds, deltaNanoseconds ] = process.hrtime(start);

  return deltaSeconds * 1e9 + deltaNanoseconds;
}


function sigFigs(num: number, sigFigs: number = 3): string {
  const intDigits = Math.floor(Math.log10(num)) + 1;
  const scaleFactor = Math.pow(10, sigFigs - intDigits);

  return (Math.round(num * scaleFactor) / scaleFactor).toString();
}


function formatDuration(nanoseconds: number): string {
  if (nanoseconds > 1e9) {
    return `${sigFigs(nanoseconds / 1e9)}s`;
  }

  if (nanoseconds > 1e6) {
    return `${sigFigs(nanoseconds / 1e6)}ms`;
  }

  if (nanoseconds > 1e3) {
    return `${sigFigs(nanoseconds / 1e3)}μs`;
  }

  return `${nanoseconds}ns`;
}


export function run<T>(testName: string, createTest: () => () => any): void {
  console.log(spacer.repeat(describeStack.length) + testName + ':');
  const prefix = spacer.repeat(describeStack.length + 1);

  const createStart = now();

  const test = createTest();

  const createTestDuration = delta(createStart);

  const testStart = now();

  const testResult = test();

  const testDuration = delta(testStart);

  const testResultString = inspect(test()).split('\n').join(`\n${prefix}${spacer}`);

  if (testResult !== undefined) {
    console.log(`${prefix}Test result:${testResultString.indexOf('\n') >= 0 ? `\n${prefix}${spacer}` : ' '}${testResultString}`);
  }

  console.log(`${prefix}Create test duration: ${formatDuration(createTestDuration)}`);
  console.log(`${prefix}Test duration: ${formatDuration(testDuration)}`)
  console.log();
}
