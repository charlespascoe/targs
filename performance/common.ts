import { inspect } from 'util';

const describeStack: string[] = [];


const spacer = '    ';


export function describe(description: string, container: () => void): void {
  console.log(spacer.repeat(describeStack.length) + description);
  describeStack.push(description);
  container();
  describeStack.pop();
}


export function run<T>(testName: string, count: number, createTest: () => () => any): void {
  console.log(spacer.repeat(describeStack.length) + testName + ':');
  const prefix = spacer.repeat(describeStack.length + 1);

  const test = createTest();

  const testResult = inspect(test()).split('\n').join(`\n${prefix}${spacer}`);

  if (testResult !== 'undefined') {
    console.log(`${prefix}Test result:${testResult.indexOf('\n') >= 0 ? `\n${prefix}${spacer}` : ' '}${testResult}`);
  }

  const start = Date.now();
  for (let i = 0; i < count; i++) {
    test();
  }
  const duration = Date.now() - start;


  console.log(`${prefix}Test run count: ${count}`)
  console.log(`${prefix}Total duration: ${duration}ms`)
  console.log(`${prefix}Mean duration:  ${(duration / count).toFixed(3)}ms`);
  console.log();
}
