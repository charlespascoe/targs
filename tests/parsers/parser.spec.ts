import { initState, coerceState, parseRec, parse } from '../../lib/parsers/parser';
import { success, error } from '../../lib/result';
import { ArgumentParser, ArgumentParsers } from '../../lib/parsers/argument-parser';
import { expect } from 'chai';
import 'mocha';


describe('parsers/parser', () => {

  describe('initState', () => {

    it('should return the initial state object', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const barArgParser: ArgumentParser<string,string> = {
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };


      const state = initState({
        foo: fooArgParser,
        bar: barArgParser
      });

      expect(state).to.deep.equal({foo: 123, bar: 'Hello, World'});
    });

  });

  describe('coerceState', () => {

    it('should return the first coercion error', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => error('Foo invalid'),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const barArgParser: ArgumentParser<string,string> = {
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

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
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x * 2),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const barArgParser: ArgumentParser<string,string> = {
        initial: 'Hello, World',
        read: (acc, tokens) => null,
        coerce: (x: string) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

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

  describe('parseRec', () => {

    it('should return the given state if no tokens are provided', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const result = parseRec({foo: 456}, [], {foo: fooArgParser});

      expect(result).to.deep.equal({
        finalState: {
          foo: 456
        },
        newTokens: []
      });
    });

    it('should return the given state if no parsers handle the next token', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const result = parseRec({foo: 456}, [{type: 'short', value: 'x', argument: null}], {foo: fooArgParser});

      expect(result).to.deep.equal({
        finalState: {
          foo: 456
        },
        newTokens: [
          {
            type: 'short',
            value: 'x',
            argument: null
          }
        ]
      });
    });

    it('should invoke read on the appropriate parser', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => ({newValue: acc + 1, newTokens: []}),
        coerce: (x: number) => success(x),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const result = parseRec({foo: 456}, [{type: 'short', value: 'x', argument: null}], {foo: fooArgParser});

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
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => null,
        coerce: (x: number) => error('Foo invalid'),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const result = parse([], {foo: fooArgParser});

      expect(result).to.deep.equal({
        success: false,
        message: 'Foo invalid'
      });
    });

    it('should return the correct value when there are no errors', () => {
      const fooArgParser: ArgumentParser<number,number> = {
        initial: 123,
        read: (acc, tokens) => ({newValue: 456, newTokens: []}),
        coerce: (x: number) => success(x + 1),

        hintPrefix: '',
        description: '',
        suggestCompletion: () => []
      };

      const result = parse([{type: 'short', value: 'x', argument: null}], {foo: fooArgParser});

      expect(result).to.deep.equal({
        success: true,
        value: {
          tokens: [],
          value: {
            foo: 457
          }
        }
      });
    });

  });

});