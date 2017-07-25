
const inModule = typeof require === 'function';
const inBrowser = typeof window !== 'undefined';
export const JC = inModule && inBrowser ?
require('jcc2d/build/jcc2d.light.js') : inBrowser ?
window.JC :
{};
