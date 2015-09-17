﻿import {createTemplateFromMarkup} from '../src/dom';

describe('dom', () => {
  describe('createTemplateFromMarkup', () => {
    it('should throw an error when creating a template from text-only markup', () => {
      expect(() => createTemplateFromMarkup('throw an error!')).toThrow();
    });

    it('should throw an error when creating a template from markup where <template> is not the root element', () => {
      expect(() => createTemplateFromMarkup('<div>throw an error!</div>')).toThrow();
    });
  });
});
