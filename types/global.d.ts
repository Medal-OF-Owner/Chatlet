// Minimal global shims to help the TypeScript compiler in this environment.
// These are temporary and intentionally permissive to allow typechecking to proceed.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare var process: any;
declare var Buffer: any;


interface NodeModule {
  hot?: { accept: (path?: string, cb?: () => void) => void };
}

// Minimal shim for 'pg' types when @types/pg isn't installed
declare module "pg" {
  export const Pool: any;
  const _default: any;
  export default _default;
}
