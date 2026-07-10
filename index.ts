// --- 1. GLOBAL POLYFILLS MUST BE AT THE VERY TOP ---
if (typeof global.DOMException === 'undefined') {
  class DOMException extends Error {
    name: string;
    message: string;
    constructor(message = '', name = 'DOMException') {
      super(message);
      this.name = name;
      this.message = message;
    }
  }
  global.DOMException = DOMException as any;
}

if (typeof window !== 'undefined' && typeof window.DOMException === 'undefined') {
  window.DOMException = global.DOMException;
}
if (typeof globalThis !== 'undefined' && typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = global.DOMException;
}
// ----------------------------------------------------

// 2. Normal Expo entry point code follows
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
