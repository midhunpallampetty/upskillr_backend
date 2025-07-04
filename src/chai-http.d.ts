import chai = require('chai');

declare module 'chai' {
  export function request(app: any): ReturnType<typeof chai.request>;
}
