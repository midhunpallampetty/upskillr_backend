// types/chai-http.d.ts
import chai from 'chai';

declare module 'chai' {
  interface ChaiStatic {
    request(app: any): ChaiHttpRequest;
  }
}

interface ChaiHttpRequest {
  get: (url: string) => ChaiHttpChainable;
  post: (url: string) => ChaiHttpChainable;
}

interface ChaiHttpChainable {
  set?: (field: string, value: string) => ChaiHttpChainable;
  send?: (data: any) => ChaiHttpChainable;
  end: (callback: (err: any, res: any) => void) => void;
}
