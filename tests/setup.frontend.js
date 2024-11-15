const { TextEncoder, TextDecoder } = require('util');
require('@testing-library/jest-dom');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const mockDOM = {
  window: {
    document: {
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        getElementsByTagName: () => []
      })
    },
    location: {},
    navigator: {},
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    }
  }
};

global.window = mockDOM.window;
global.document = mockDOM.window.document;
global.navigator = mockDOM.window.navigator;
global.localStorage = mockDOM.window.localStorage;