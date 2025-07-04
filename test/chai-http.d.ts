import chai = require('chai');
import chaiHttp = require('chai-http');

declare module 'chai' {
  export function request(app: any): {
    get: (url: string) => ChaiHttpRequest;
    post: (url: string) => ChaiHttpRequest;
    // ... add more HTTP methods if needed
  };
}

interface ChaiHttpRequest {
  set: (field: string, value: string) => ChaiHttpRequest;
  send: (body: any) => ChaiHttpRequest;
  end: (callback: (err: any, res: any) => void) => void;
  expect?: any;
}
