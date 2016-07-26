'use strict';

const jsDocRules = {
  require: {
    FunctionDeclaration: true,
    MethodDefinition:    true,
    ClassDeclaration:    true,
  }
};

module.exports = {
  extends: 'google',
  rules:   {
    'brace-style':          ['error', 'stroustrup'],
    'comma-dangle':         ['error', 'only-multiline'],
    'curly':                ['error', 'multi-or-nest'],
    'indent':               ['error', 2],
    'key-spacing':          ['error', {align: 'value'}],
    'max-len':              ['error', 100],
    'no-floating-decimal':  'error',
    'no-multi-spaces':      ['off'],
    'no-use-before-define': ['error', {functions: true, classes: true}],
    'no-var':               ['error'],
    'no-warning-comments':  ['error', {terms: ['fixme']}],
    'require-jsdoc':        ['error', jsDocRules],
    'quotes':               ['error', 'single'],
    'valid-jsdoc':          ['error', {requireReturn: false}],
  },
};
