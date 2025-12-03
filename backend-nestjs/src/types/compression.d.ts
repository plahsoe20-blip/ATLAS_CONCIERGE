// Type declaration for compression module
declare module 'compression' {
  import { RequestHandler } from 'express';

  interface CompressionOptions {
    threshold?: number | string;
    level?: number;
    memLevel?: number;
    strategy?: number;
    filter?: (req: any, res: any) => boolean;
  }

  function compression(options?: CompressionOptions): RequestHandler;

  export = compression;
}
