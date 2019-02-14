import { initState, coerceState, parseArgumentGroup, parse } from '../lib/parser';
import { success, error } from '../lib/result';
import { ArgumentParser, ArgumentParserGroup, TokenParser, completionResult } from '../lib/parsers/argument-parser';
import { expect } from 'chai';
import 'mocha';


function dummyArgumentParser<T,S>(argParser: Pick<TokenParser<T,S>, Exclude<keyof TokenParser<T,S>, 'suggestCompletion'>>): ArgumentParser<T,S> {
  return {
    shortHint: '',
    hintPrefix: '',
    description: '',
    suggestCompletion: () => completionResult([]),

    ...argParser
  };
}


describe('parser', () => {

  describe('initState', () => {

    it('should return the initial state object', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser<number,number>({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x)
      });

      const barArgParser: ArgumentParser<string,string> = dummyArgumentParser({
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x)
      });


      const state = initState({
        foo: fooArgParser,
        bar: barArgParser
      });

      expect(state).to.deep.equal({foo: 123, bar: 'Hello, World'});
    });

  });

  describe('coerceState', () => {

    it('should return the first coercion error', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => error('Foo invalid')
      });

      const barArgParser: ArgumentParser<string,string> = dummyArgumentParser({
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x)
      });

      const result = coerceState(
        {foo: 456, bar: 'Test'},
        {foo: fooArgParser, bar: barArgParser}
      );

      expect(result).to.deep.equal({
        success: false,
        message: 'Foo invalid'
      });
    });

    it('should return the correct result if there are no errors', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x * 2)
      });

      const barArgParser: ArgumentParser<string,string> = dummyArgumentParser({
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x)
      });

      const result = coerceState(
        {foo: 456, bar: 'Test'},
        {foo: fooArgParser, bar: barArgParser}
      );

      expect(result).to.deep.equal({
        success: true,
        value: {
          foo: 912,
          bar: 'Test'
        }
      });
    });

  });

  describe('parseArgumentGroup', () => {

    it('should return the given state if no tokens are provided', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x)
      });

      const result = parseArgumentGroup({foo: 456}, [], {foo: fooArgParser});

      expect(result).to.deep.equal({
        finalState: {
          foo: 456
        },
        newTokens: []
      });
    });

    it('should return the given state if no parsers handle the next token', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x)
      });

      const result = parseArgumentGroup({foo: 456}, [{type: 'short', value: 'x'}], {foo: fooArgParser});

      expect(result).to.deep.equal({
        finalState: {
          foo: 456
        },
        newTokens: [
          {
            type: 'short',
            value: 'x'
          }
        ]
      });
    });

    it('should invoke read on the appropriate parser', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => ({newState: acc + 1, newTokens: []}),
        coerce: (x: number) => success(x)
      });

      const result = parseArgumentGroup({foo: 456}, [{type: 'short', value: 'x'}], {foo: fooArgParser});

      expect(result).to.deep.equal({
        finalState: {
          foo: 457
        },
        newTokens: []
      });
    });

  });

  describe('parse', () => {

    it('should return the first state coercion error', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => error('Foo invalid')
      });

      const result = parse([], {foo: fooArgParser});

      expect(result).to.deep.equal({
        success: false,
        message: 'Foo invalid'
      });
    });

    it('should return the correct value when there are no errors', () => {
      const fooArgParser: ArgumentParser<number,number> = dummyArgumentParser({
        initial: 123,
        read: (acc, tokens) => ({newState: 456, newTokens: []}),
        coerce: (x: number) => success(x + 1)
      });

      const result = parse([{type: 'short', value: 'x'}], {foo: fooArgParser});

      expect(result).to.deep.equal({
        success: true,
        value: {
          tokens: [],
          args: {
            foo: 457
          }
        }
      });
    });

  });

});
