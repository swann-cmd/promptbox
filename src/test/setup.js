import { expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// 设置全局测试环境
global.dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = global.dom.window;
global.document = global.dom.window.document;
global.navigator = global.dom.window.navigator;

// Mock localStorage
const localStorageMock = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {},
};
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
